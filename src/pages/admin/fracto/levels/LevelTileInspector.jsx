import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import AppStyles from "app/AppStyles";
import StoreS3 from "common/StoreS3";
import CoolModal from "common/cool/CoolModal";
import CoolButton from "common/cool/CoolButton";

import {
   render_modal_title,
   render_fracto_navigation,
   render_short_code
} from "../FractoStyles";
import FractoData from "../FractoData";
import FractoUtil from "../FractoUtil";

const CenteredBlock = styled(AppStyles.Block)`
   ${AppStyles.centered}
   margin: 0.5rem 1rem 0;
`;

const FractoNavigation = styled(AppStyles.Block)`
   margin: 0;
`;

const NavigationWrapper = styled(AppStyles.Block)`
   margin: 1rem;
`;

const SelectedTileBox = styled.div`
   position: fixed;
   border: 0.125rem dashed white;
   pointer-events: none;
`;

const IMAGE_WIDTH_PX = 450;
const AUTOMATION_TIMEOUT_MS = 2500;

export class LevelTileInspector extends Component {

   static propTypes = {
      level: PropTypes.number.isRequired,
      on_response_modal: PropTypes.func.isRequired,
   }

   static canvas_ref = React.createRef();
   static fracto_ref = React.createRef();

   state = {
      completed_tiles: [],
      potential_tiles: [],
      tile_index: -1,
      fracto_values: {
         scope: 2.5,
         focal_point: {x: -.75, y: 0.25}
      },
      in_progress: false,
      short_code: '',
      ctx: null
   }

   componentDidMount() {
      const {level} = this.props;
      const completed_tiles = FractoData.get_completed_tiles(level).sort((a, b) => {
         return a.bounds.left === b.bounds.left ?
            (a.bounds.top > b.bounds.top ? -1 : 1) :
            (a.bounds.left > b.bounds.left ? 1 : -1)
      })
      console.log("completed_tiles", completed_tiles)
      const potential_tiles = FractoData.get_potential_tiles(level).sort((a, b) => {
         return a.bounds.left === b.bounds.left ?
            (a.bounds.top > b.bounds.top ? -1 : 1) :
            (a.bounds.left > b.bounds.left ? 1 : -1)
      })
      console.log("potential_tiles", potential_tiles)
      const canvas = LevelTileInspector.canvas_ref.current
      const ctx = canvas.getContext('2d');
      this.setState({
         completed_tiles: completed_tiles,
         potential_tiles: potential_tiles,
         ctx: ctx
      })
   }

   get_tile_outline = (fracto_values, tile) => {
      if (!tile || !tile.bounds) {
         return null;
      }
      const pixel_width = fracto_values.scope / IMAGE_WIDTH_PX;
      const half_width_px = IMAGE_WIDTH_PX / 2;
      const half_height_px = IMAGE_WIDTH_PX / 2;
      const box_left = half_width_px - (fracto_values.focal_point.x - tile.bounds.left) / pixel_width;
      const box_right = half_width_px - (fracto_values.focal_point.x - tile.bounds.right) / pixel_width;
      const box_top = half_height_px - (tile.bounds.top - fracto_values.focal_point.y) / pixel_width;
      const box_bottom = half_height_px - (tile.bounds.bottom - fracto_values.focal_point.y) / pixel_width;
      const fracto_bounds = LevelTileInspector.fracto_ref.current.getBoundingClientRect();
      return {
         left: `${box_left + fracto_bounds.left}px`,
         top: `${box_top + fracto_bounds.top}px`,
         width: `${box_right - box_left}px`,
         height: `${box_bottom - box_top}px`
      };
   }

   set_tile_index = (new_tile_index) => {
      const {completed_tiles, ctx} = this.state;
      const tile = completed_tiles[new_tile_index];
      console.log("set_tile_index", tile)
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
         short_code: tile.short_code,
         fracto_values: fracto_values,
      });

      const json_name = `tiles/256/indexed/${tile.short_code}.json`;
      StoreS3.get_file_async(json_name, "fracto", json_str => {
         console.log("StoreS3.get_file_async", json_name);
         if (json_str) {
            const tile_data = JSON.parse(json_str);
            FractoUtil.data_to_canvas(tile_data, ctx)
         }
      })
   }

   auto_inspect = (tile_index) => {
      console.log("auto_inspect", tile_index)
      const {completed_tiles, in_progress} = this.state;
      if (completed_tiles.length === tile_index || !in_progress) {
         return;
      }
      this.set_tile_index(tile_index);
      setTimeout(() => {
         this.auto_inspect(tile_index + 1)
      }, AUTOMATION_TIMEOUT_MS);
   }

   static button_style = {
      margin: "0 0.125rem",
      padding: "0.125rem 0.25rem",
      fontWeight: "400",
      fontSize: "1.125rem"
   }

   render_offset_button = (label, offset_amt) => {
      const {tile_index, in_progress} = this.state;
      return <CoolButton
         primary={1}
         content={label}
         style={LevelTileInspector.button_style}
         disabled={in_progress}
         on_click={r => this.set_tile_index(tile_index + offset_amt)}
      />
   }

   render_button_bar = () => {
      const {tile_index, in_progress} = this.state;
      const play_button = in_progress ? '' : <CoolButton
         primary={1}
         content={"start"}
         style={LevelTileInspector.button_style}
         on_click={r => {
            setTimeout(() => {
               this.auto_inspect(tile_index + 1)
            }, 1000);
            this.setState({in_progress: true});
         }}
      />
      const pause_button = !in_progress ? '' : <CoolButton
         primary={1}
         content={"pause"}
         style={LevelTileInspector.button_style}
         on_click={r => this.setState({in_progress: false})}
      />
      const plus_one = this.render_offset_button("+1", 1)
      const minus_one = this.render_offset_button("-1", -1)
      const plus_ten = this.render_offset_button("+10", 10)
      const minus_ten = this.render_offset_button("-10", -10)
      const plus_100 = this.render_offset_button("+100", 100)
      const minus_100 = this.render_offset_button("-100", -100)
      const plus_1000 = this.render_offset_button("+1000", 1000)
      const minus_1000 = this.render_offset_button("-1000", -1000)
      return [
         minus_1000, minus_100, minus_ten, minus_one,
         play_button, pause_button,
         plus_one, plus_ten, plus_100, plus_1000,
      ]
   }

   render() {
      const {tile_index, completed_tiles, fracto_values} = this.state;
      const {level, on_response_modal} = this.props;

      const title = render_modal_title(`inspect tiles for level ${level}`);
      const cancel_button = <CoolButton
         primary={1}
         content={"cancel"}
         style={{marginBottom: "0.5rem"}}
         on_click={r => {
            this.setState({did_cancel: true});
            on_response_modal(-1);
         }}
      />

      const done = completed_tiles.length === tile_index;
      const progress = <CenteredBlock>
         {!done ? `inspecting tile ${tile_index + 1} of ${completed_tiles.length}` : "Done!"}
      </CenteredBlock>

      const canvas = <canvas
         ref={LevelTileInspector.canvas_ref}
         width={256}
         height={256}
      />

      let selected_box = '';
      let selected_short_code = '';
      if (tile_index >= 0) {
         const tile = completed_tiles[tile_index];
         const tile_outline = this.get_tile_outline(fracto_values, tile);
         selected_box = !tile_outline ? '' : <SelectedTileBox style={tile_outline}/>;
         selected_short_code = render_short_code(tile.short_code);
      }

      const button_bar = this.render_button_bar();
      const inner_content = [
         <CenteredBlock>{selected_short_code}</CenteredBlock>,
         <CenteredBlock>{canvas}</CenteredBlock>,
         <CenteredBlock>{button_bar}</CenteredBlock>
      ]
      const fracto_navigation = render_fracto_navigation(fracto_values, IMAGE_WIDTH_PX, [], inner_content, values => {
         this.setState({fracto_values: values})
      })

      return <CoolModal
         width={"1300px"}
         contents={[
            title, progress,
            <NavigationWrapper>
               <FractoNavigation
                  ref={LevelTileInspector.fracto_ref}>
                  {fracto_navigation}
               </FractoNavigation>
            </NavigationWrapper>,
            // <CenteredBlock>{short_code}</CenteredBlock>,
            <CenteredBlock>{cancel_button}</CenteredBlock>,
            selected_box
         ]}
         response={r => on_response_modal(r)}
         settings={{no_escape: true}}
      />
   }
}

export default LevelTileInspector;
