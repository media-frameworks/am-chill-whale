import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import AppStyles from "app/AppStyles";
import StoreS3 from "common/StoreS3";
import {CoolModal, CoolButton} from "common/cool/CoolImports";

import {
   render_main_link,
   render_modal_title,
   render_short_code
} from "../../FractoStyles";
import FractoData from "../../FractoData";
import ToolSelectTile from "./ToolSelectTile"
import ToolUtils from "./ToolUtils"
import FractoActionWrapper, {
   OPTION_TILE_OUTLINE,
   OPTION_RENDER_LEVEL
} from "../../FractoActionWrapper";

const StartAtPrompt = styled(AppStyles.InlineBlock)`
   ${AppStyles.italic}
   font-size: 1rem;
   margin-right: 0.5rem;
   vertical-align: middle;
   line-height: 2rem;
`;

const LinkWrapper = styled(AppStyles.InlineBlock)`
   ${AppStyles.align_right}  
   line-height: 2rem;
   vertical-align: middle;
   width: 8rem;
`;

const CenteredBlock = styled(AppStyles.Block)`
   ${AppStyles.centered}
   margin: 0.5rem 1rem 0;
`;

const NavigationWrapper = styled(AppStyles.Block)`
   margin: 0.5rem 1rem 0;
`;

export class ToolClassifier extends Component {

   static propTypes = {
      level: PropTypes.number.isRequired,
      width_px: PropTypes.number.isRequired,
   }

   static fracto_ref = React.createRef();

   state = {
      in_modal: false,
      data_ready: false,
      potentials: [],
      tile_index: -1,
      fracto_values: {
         scope: 2.5,
         focal_point: {x: -.75, y: 0.25}
      },
      status: '',
      automate: false
   }

   componentDidMount() {
      this.load_potentials();
   }

   load_potentials = () => {
      const {level} = this.props;
      console.log("load_potentials level", level)
      const potentials = FractoData.get_potential_tiles(level).sort((a, b) => {
         return a.bounds.left === b.bounds.left ?
            (a.bounds.top > b.bounds.top ? -1 : 1) :
            (a.bounds.left > b.bounds.left ? 1 : -1)
      })
      this.setState({
         data_ready: true,
         potentials: potentials,
      })
   }

   move_tile = (short_code, from, to) => {
      const {automate} = this.state
      ToolUtils.tile_to_bin(short_code, from, to, result => {
         const {tile_index} = this.state
         console.log("ToolUtils.tile_to_bin", short_code, to, result);
         this.setState({status: `${to} (${result.result})`})

         if (automate) {
            setTimeout(() => {
               this.classify_tile(tile_index + 1)
            }, 500)
         }
      })
   }

   classify_tile = (new_tile_index) => {
      const {potentials, automate} = this.state
      const tile = potentials[new_tile_index];
      if (!tile) {
         console.log("classify_tile can't load tile", new_tile_index, potentials);
         return;
      }
      console.log("classify_tile", new_tile_index, tile);
      const half_scope = (tile.bounds.right - tile.bounds.left) / 2;
      const fracto_values = {
         focal_point: {
            x: tile.bounds.left + half_scope,
            y: tile.bounds.top - half_scope
         },
         scope: half_scope * 10
      }
      this.setState({
         tile_index: new_tile_index,
         fracto_values: fracto_values,
      });

      const parent_short_code = tile.short_code.substr(0, tile.short_code.length - 1)
      const json_name = `tiles/256/indexed/${parent_short_code}.json`;
      StoreS3.get_file_async(json_name, "fracto", json_str => {
         console.log("StoreS3.get_file_async", json_name);
         if (!json_str) {
            console.log("Error getting parent tile for classification", json_name);
            this.move_tile(tile.short_code, "new", "error")
            return;
         }
         const tile_data = JSON.parse(json_str);
         const quad_code = tile.short_code[tile.short_code.length - 1];
         console.log("tile.short_code, parent_short_code, quad_code", tile.short_code, parent_short_code, quad_code)
         let col_start, col_end, row_start, row_end;
         switch (tile.short_code[tile.short_code.length - 1]) {
            case '0':
               col_start = 0;
               col_end = 128;
               row_start = 0;
               row_end = 128;
               break;
            case '1':
               col_start = 128;
               col_end = 256;
               row_start = 0;
               row_end = 128;
               break;
            case '2':
               col_start = 0;
               col_end = 128;
               row_start = 128;
               row_end = 256;
               break;
            case '3':
               col_start = 128;
               col_end = 256;
               row_start = 128;
               row_end = 256;
               break;
            default:
               console.log('bad quad_code');
               break;
         }
         let is_empty = true;
         let is_inland = true;
         for (let img_x = col_start; img_x < col_end; img_x++) {
            for (let img_y = row_start; img_y < row_end; img_y++) {
               const patern = tile_data[img_x][img_y][0];
               const iterations = tile_data[img_x][img_y][1];
               if (!patern) {
                  is_inland = false;
                  if (iterations > 20) {
                     is_empty = false;
                  }
               } else {
                  is_empty = false;
               }
            }
            if (!is_empty && !is_inland) {
               break;
            }
         }
         let directory_bin = 'ready';
         if (is_empty) {
            directory_bin = 'empty';
         } else if (is_inland) {
            directory_bin = 'inland';
         }
         this.move_tile(tile.short_code, "new", directory_bin)
      }, false);

   }

   run_modal = () => {
      const {automate, tile_index} = this.state;
      this.setState({in_modal: true, automate: !automate})
      if (!automate) {
         setTimeout(() => {
            this.classify_tile(0);
         }, 50)
      }
   }

   render_modal_content = () => {
      const {potentials, tile_index, status, automate} = this.state;
      let selected_short_code = '-';
      if (tile_index >= 0) {
         const tile = potentials[tile_index];
         selected_short_code = render_short_code(tile.short_code);
      }
      const button_bar = [
         <CoolButton
            primary={1}
            content={automate ? "pause" : "go"}
            on_click={r => this.setState({automate: !automate})}
            style={{marginBottom: "0.5rem"}}
         />
      ]
      return <AppStyles.Block>{[
         <CenteredBlock>{selected_short_code}</CenteredBlock>,
         <CenteredBlock>{status}</CenteredBlock>,
         <CenteredBlock>{button_bar}</CenteredBlock>,
      ]}</AppStyles.Block>
   }

   render() {
      const {in_modal, data_ready, fracto_values, tile_index, potentials} = this.state;
      const {level, width_px} = this.props;

      const fracto_content = this.render_modal_content();
      const tile = potentials.length && tile_index >= 0 ? potentials[tile_index] : null
      let fracto_options = {};
      if (tile) {
         fracto_options[OPTION_TILE_OUTLINE] = tile.bounds;
         fracto_options[OPTION_RENDER_LEVEL] = level - 1;
      }
      const fracto_action = <FractoActionWrapper
         fracto_values={fracto_values}
         content={fracto_content}
         on_update={values => this.setState({fracto_values: values})}
         options={fracto_options}
      />

      const title = render_modal_title(`classify tiles for level ${level}`);
      const done = potentials.length === tile_index;
      const progress = <CenteredBlock key={"progress"}>
         {!done ? `${tile_index} of ${potentials.length + 1} tiles classified` : "Done!"}
      </CenteredBlock>
      const cancel_button = <CoolButton
         content={"cancel"}
         on_click={r => this.setState({in_modal: false})}
         style={{marginBottom: "0.5rem"}}
      />

      const modal = !in_modal || !data_ready ? '' : <CoolModal
         width={"1200px"}
         contents={[
            title, progress,
            <NavigationWrapper>{fracto_action}</NavigationWrapper>,
            <CenteredBlock key={"cancel"}>{cancel_button}</CenteredBlock>,
         ]}
         settings={{no_escape: true}}
      />

      const main_link = render_main_link("classify", e => this.run_modal());
      return [
         <LinkWrapper>{main_link}</LinkWrapper>,
         <StartAtPrompt>start at:</StartAtPrompt>,
         <ToolSelectTile level={level} width_px={width_px}/>,
         modal
      ]
   }
}

export default ToolClassifier;
