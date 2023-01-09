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
import FractoActionWrapper, {OPTION_TILE_OUTLINE} from "../../FractoActionWrapper";
import FractoUtil from "../../FractoUtil";

import ToolSelectTile from "./ToolSelectTile"
import ToolUtils from "./ToolUtils"

const CADENCE_MS = 500;

export const OPTION_NO_CANVAS = "no_canvas";

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

export class ToolFramework extends Component {

   static propTypes = {
      level: PropTypes.number.isRequired,
      level_tiles: PropTypes.array.isRequired,
      data_ready: PropTypes.bool.isRequired,
      verb: PropTypes.string.isRequired,
      tile_action: PropTypes.func.isRequired,
      options: PropTypes.object,
   }

   static defaultProps = {
      options: {
         fracto_options: {},
         framework_options: {}
      }
   }

   static fracto_ref = React.createRef();
   static canvas_ref = React.createRef();

   state = {
      in_modal: false,
      tile_index: -1,
      fracto_values: {
         scope: 2.5,
         focal_point: {x: -.75, y: 0.25}
      },
      status: '',
      automate: false
   }

   static move_tile = (short_code, from, to) => {
      ToolUtils.tile_to_bin(short_code, from, to, result => {
         console.log("ToolUtils.tile_to_bin", short_code, to, result);
         this.setState({status: `moved from ${from} to ${to} (${result.result})`})
      })
   }

   run_modal = () => {
      const {level} = this.props
      const tile_index_str = localStorage.getItem(`level_${level}_tile_index`);
      const tile_index = tile_index_str ? parseInt(tile_index_str) : 0;
      this.setState({
         in_modal: true,
         tile_index: tile_index
      })
      setTimeout(() => {
         this.tile_action(tile_index);
      }, CADENCE_MS)
   }

   run_tool = () => {
      const {tile_index, automate} = this.state;
      this.setState({automate: !automate})
      if (!automate) {
         setTimeout(() => {
            this.tile_action(tile_index);
         }, CADENCE_MS)
      }
   }

   tile_action = (new_tile_index) => {
      const {level, level_tiles, tile_action, options} = this.props
      let tile = level_tiles[new_tile_index];
      if (!tile) {
         console.log("can't load tile", new_tile_index, level_tiles.length);
         return;
      }
      console.log("tile_action", new_tile_index, tile);
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
      localStorage.setItem(`level_${level}_tile_index`, String(new_tile_index));

      const framework_options = options.framework_options || {};
      if (OPTION_NO_CANVAS in framework_options) {
         tile_action(tile, null, status => {
            const automate = status === "STOP" ? false : this.state.automate;
            this.setState({status: status, automate: automate});
            if (automate) {
               setTimeout(() => {
                  this.tile_action(new_tile_index + 1);
               }, CADENCE_MS)
            }
         })
      } else {
         const canvas = ToolFramework.canvas_ref.current
         const ctx = canvas.getContext('2d');
         const index_name = `tiles/256/indexed/${tile.short_code}.json`;
         StoreS3.get_file_async(index_name, "fracto", json_str => {
            console.log("StoreS3.get_file_async", index_name);
            if (json_str) {
               const tile_data = JSON.parse(json_str);
               FractoUtil.data_to_canvas(tile_data, ctx)
               tile['index'] = tile_data;
            } else {
               this.setState({status: "tile not found..."});
               tile['index'] = [];
            }
            tile_action(tile, ctx, status => {
               const automate = status === "STOP" ? false : this.state.automate;
               this.setState({status: status, automate: automate});
               if (automate) {
                  setTimeout(() => {
                     this.tile_action(new_tile_index + 1);
                  }, CADENCE_MS)
               }
            })
         })
      }

   }

   render_button = (number, label) => {
      const {tile_index, automate} = this.state;
      const {level_tiles} = this.props;
      const result_number = tile_index + number;
      const button_style = {
         fontFamily: "monospace",
         fontSize: "0.85rem",
         fontWeight: "bold",
         padding: "0.25rem 0.5rem",
         margin: "0 0.05rem"
      }
      return <CoolButton
         primary={result_number >= 0 && result_number < level_tiles.length}
         disabled={automate}
         content={label}
         style={button_style}
         on_click={r => this.tile_action(result_number)}
      />
   }

   render_modal_content = () => {
      const {tile_index, status, automate} = this.state;
      const {level_tiles} = this.props
      let selected_short_code = '-';
      if (tile_index >= 0) {
         const tile = level_tiles[tile_index];
         selected_short_code = render_short_code(tile.short_code);
      }
      const canvas = <canvas
         ref={ToolFramework.canvas_ref}
         width={256}
         height={256}
      />
      const button_bar = [
         this.render_button(-100000, "-100k"),
         this.render_button(-10000, "-10k"),
         this.render_button(-1000, "-1k"),
         this.render_button(-100, "-100"),
         this.render_button(-10, "-10"),
         this.render_button(-1, "-1"),
         <CoolButton
            primary={1}
            content={automate ? "pause" : "go"}
            style={{margin: "0 0.25rem"}}
            on_click={r => this.run_tool()}
         />,
         this.render_button(1, "+1"),
         this.render_button(10, "+10"),
         this.render_button(100, "+100"),
         this.render_button(1000, "+1k"),
         this.render_button(10000, "+10k"),
         this.render_button(100000, "+100k"),
      ]
      return <AppStyles.Block>{[
         <CenteredBlock>{selected_short_code}</CenteredBlock>,
         <CenteredBlock>{status}</CenteredBlock>,
         <CenteredBlock>{canvas}</CenteredBlock>,
         <CenteredBlock>{button_bar}</CenteredBlock>,
      ]}</AppStyles.Block>
   }

   render() {
      const {in_modal, fracto_values, tile_index} = this.state;
      const {level, level_tiles, data_ready, verb, options} = this.props;
      console.log("render fracto_values", fracto_values)

      const fracto_content = this.render_modal_content();
      const tile = level_tiles.length && tile_index >= 0 ? level_tiles[tile_index] : null
      let fracto_options = options.fracto_options || {};
      if (tile) {
         fracto_options[OPTION_TILE_OUTLINE] = tile.bounds;
         // if (fracto_options[OPTION_RENDER_LEVEL]) {
         //    fracto_options[OPTION_RENDER_LEVEL] = level;
         // }
      }
      const fracto_action = <FractoActionWrapper
         fracto_values={fracto_values}
         content={fracto_content}
         options={fracto_options}
      />

      const title = render_modal_title(`${verb} tiles for level ${level}`);
      const done = level_tiles.length === tile_index;
      const progress = <CenteredBlock key={"progress"}>
         {!done ? `${verb} ${tile_index + 1} of ${level_tiles.length + 1} tiles` : "Done!"}
      </CenteredBlock>
      const cancel_button = <CoolButton
         content={"cancel"}
         on_click={r => this.setState({in_modal: false})}
         style={{margin: "0.5rem"}}
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

      const main_link = render_main_link(verb, e => this.run_modal());
      return [
         <LinkWrapper>{main_link}</LinkWrapper>,
         <StartAtPrompt>start at:</StartAtPrompt>,
         <ToolSelectTile level={level}/>,
         modal
      ]
   }
}

export default ToolFramework;
