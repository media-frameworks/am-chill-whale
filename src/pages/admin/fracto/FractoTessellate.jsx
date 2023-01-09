import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled, {css} from "styled-components";

import {AppStyles, AppColors} from "app/AppImports";

import FractoRender from "./FractoRender";
import FractoLocate from "./FractoLocate";
import {get_ideal_level, get_level_tiles, get_empties, get_level_cells} from "./FractoData";
import {render_fracto_locate} from "./FractoStyles";

import CommonTilesGenerate from "./common/CommonTilesGenerate"
import {GENERATE_NO_INLAND_TILES, GENERATE_NO_EMPTY_TILES, GENERATE_VERIFY_TILES} from "./tile/TileProcessor";

const IMAGE_ASPECT_RATIO = 0.5;
const IMAGE_WIDTH_PX = 1000;
const IMAGE_HEIGHT_PX = IMAGE_WIDTH_PX * IMAGE_ASPECT_RATIO;
const DEFAULT_TILE_OUTLINE = {width: 0, height: 0};

const NAV_BAR_FIRST = "first";
const NAV_BAR_PREV = "prev";
const NAV_BAR_NEXT = "next";
const NAV_BAR_LAST = "last";
const NAV_BAR_NEXT_PLUS = "next_plus";
const NAV_BAR_NEXT_PLUS_MANY = "next_plus_many";
const NAV_BAR_NEXT_PLUS_MANY_MORE = "next_plus_many_more";
const NAV_BAR_PREV_MINUS = "prev_minus";
const NAV_BAR_PREV_MINUS_MANY = "prev_minus_many";
const NAV_BAR_PREV_MINUS_MANY_LESS = "prev_minus_many_less";

const CommonBorder = css`
   border: 0.15rem solid #999999;
   border-radius: 0.25rem;
`;

const BorderWrapper = styled(AppStyles.InlineBlock)`
   margin: 1rem;
`;

const RenderWrapper = styled(AppStyles.InlineBlock)`
   ${CommonBorder}
   margin: 1rem;
   float: right;
   height: 250px;
`;

const CoordsWrapper = styled(AppStyles.Block)`
   ${AppStyles.centered}
`;

const TileEditWrapper = styled(AppStyles.Block)`
   ${CommonBorder}
   margin: 1rem;
   padding: 0.5rem 1rem;
`;

const TileSelectWrapper = styled(AppStyles.Block)`
   width: 100%;
   height: ${IMAGE_HEIGHT_PX + 35}px;
`;

const SelectedTileBox = styled.div`
   position: fixed;
   border: 0.125rem dashed lightgreen;
   pointer-events: none;
`;

const NavElement = styled(AppStyles.InlineBlock)`
   ${AppStyles.bold}
   ${AppStyles.link};
   ${AppColors.COLOR_COOL_BLUE};
   ${AppStyles.noselect}
   margin: 0 0.25rem;   
   font-size: 1.25rem; 
`;

const StatsElement = styled(AppStyles.InlineBlock)`
   ${AppStyles.monospace}
   ${AppStyles.noselect}
   margin: 0 0.25rem;  
   font-size: 0.85rem; 
`;

const GoLink = styled(AppStyles.InlineBlock)`
   ${AppStyles.bold}
   ${AppStyles.link};
   ${AppColors.COLOR_COOL_BLUE};
   ${AppStyles.noselect}
   ${AppStyles.pointer}
   margin: 1rem;   
   font-size: 1.25rem; 
`;

export class FractoTessellate extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
   }

   state = {
      point_count: 0,
      fracto_values: {
         scope: 2.5,
         focal_point: {x: -.75, y: 0.625}
      },
      fracto_ref: React.createRef(),
      cursor_x: 0,
      cursor_y: 0,
      tile_outline: DEFAULT_TILE_OUTLINE,
      selected_tile: {},
      tile_index: 0,
      all_tiles: [],
      level: 2,
      edit_empties: true,
      hover_tile: {},
      go_time: false,
      generate_tiles: [],
      go_time_verify: false,
      verify_tiles: []
   };

   componentDidMount() {
      // let point_count = 0;
      let //scope = parseFloat(localStorage.getItem("scope"));
         // if (!scope) {
         scope = 2.5;
      // }
      let //focal_point_x = parseFloat(localStorage.getItem("focal_point_x"));
         // if (!focal_point_x) {
         focal_point_x = -0.75;
      // }
      let //focal_point_y = parseFloat(localStorage.getItem("focal_point_y"));
         // if (!focal_point_y) {
         focal_point_y = 0.625;
      // }
      let //tile_index = parseFloat(localStorage.getItem("tile_index"));
         // if (!tile_index) {
         tile_index = 0;
      // }
      console.log("mounting FractoTessellate")
      this.setState({
         tile_index: tile_index,
         fracto_values: {
            scope: scope,
            focal_point: {
               x: focal_point_x,
               y: focal_point_y
            }
         }
      });
   }

   fracto_no_pos = (e) => {
      this.setState({
         cursor_x: '',
         cursor_y: '',
         tile_outline: DEFAULT_TILE_OUTLINE,
      });
   }

   fracto_pos = (e) => {
      const {fracto_ref, fracto_values, all_tiles} = this.state;
      const image_bounds = fracto_ref.current.getBoundingClientRect();
      const client_x = e.clientX - image_bounds.left;
      const client_y = e.clientY - image_bounds.top;
      const pixel_width = fracto_values.scope / IMAGE_WIDTH_PX;
      const half_width_px = IMAGE_WIDTH_PX / 2;
      const half_height_px = IMAGE_HEIGHT_PX / 2;
      const cursor_x = fracto_values.focal_point.x - (half_width_px - client_x) * pixel_width;
      const cursor_y = fracto_values.focal_point.y - (client_y - half_height_px) * pixel_width;

      let tile_index = -1;
      const hover_tile = all_tiles.find((cell, index) => {
         if (cursor_x < cell.bounds.left) {
            return false;
         }
         if (cursor_x > cell.bounds.right) {
            return false;
         }
         if (cursor_y > cell.bounds.top) {
            return false;
         }
         if (cursor_y < cell.bounds.bottom) {
            return false;
         }
         tile_index = index;
         return true;
      });
      const tile_outline = this.get_tile_outline(hover_tile);
      this.setState({
         cursor_x: cursor_x,
         cursor_y: cursor_y,
         tile_outline: tile_outline,
         tile_index: tile_index,
         hover_tile: hover_tile
      });
   }

   get_tile_outline = (tile) => {
      const {fracto_ref, fracto_values} = this.state;
      if (!tile || !tile.bounds) {
         return DEFAULT_TILE_OUTLINE;
      }
      const pixel_width = fracto_values.scope / IMAGE_WIDTH_PX;
      const half_width_px = IMAGE_WIDTH_PX / 2;
      const half_height_px = IMAGE_HEIGHT_PX / 2;
      const box_left = half_width_px - (fracto_values.focal_point.x - tile.bounds.left) / pixel_width;
      const box_right = half_width_px - (fracto_values.focal_point.x - tile.bounds.right) / pixel_width;
      const box_top = half_height_px - (tile.bounds.top - fracto_values.focal_point.y) / pixel_width;
      const box_bottom = half_height_px - (tile.bounds.bottom - fracto_values.focal_point.y) / pixel_width;
      const fracto_bounds = fracto_ref.current.getBoundingClientRect();
      return {
         left: `${box_left + fracto_bounds.left}px`,
         top: `${box_top + fracto_bounds.top}px`,
         width: `${box_right - box_left}px`,
         height: `${box_bottom - box_top}px`
      };
   }

   update_values = (new_values) => {
      const {level, hover_tile, fracto_values} = this.state;
      const new_level = get_ideal_level(IMAGE_WIDTH_PX, new_values.scope);

      if (fracto_values.scope === new_values.scope) {
         this.setState({
            selected_tile: hover_tile,
            fracto_values: new_values
         });
      } else {
         this.setState({fracto_values: new_values});
      }
      if (new_level !== level) {
         const tiles = get_level_tiles(IMAGE_WIDTH_PX, new_values.scope);
         const sorted = tiles.sort((a, b) => {
            return a.bounds.left === b.bounds.left ?
               (a.bounds.top > b.bounds.top ? -1 : 1) :
               (a.bounds.left > b.bounds.left ? 1 : -1)
         });
         this.setState({
            level: new_level,
            all_tiles: sorted
         });

      }
   }

   nav_bar_action = (code) => {
      const {fracto_values, tile_index, all_tiles} = this.state;
      const last_index = all_tiles.length - 1;

      let new_tile_index = tile_index;
      // localStorage.setItem("tile_index", toString(tile_index));
      switch (code) {
         case NAV_BAR_FIRST:
            new_tile_index = 0;
            break;
         case NAV_BAR_PREV:
            new_tile_index = tile_index ? tile_index - 1 : last_index;
            break;
         case NAV_BAR_PREV_MINUS:
            new_tile_index = (tile_index + all_tiles.length - 10) % all_tiles.length;
            break;
         case NAV_BAR_PREV_MINUS_MANY:
            new_tile_index = (tile_index + all_tiles.length - 100) % all_tiles.length;
            break;
         case NAV_BAR_PREV_MINUS_MANY_LESS:
            new_tile_index = (tile_index + all_tiles.length - 1000) % all_tiles.length;
            break;
         case NAV_BAR_NEXT:
            if (tile_index === last_index) {
               return false;
            }
            new_tile_index = tile_index + 1;
            break;
         case NAV_BAR_NEXT_PLUS:
            new_tile_index = (tile_index + 10) % all_tiles.length;
            break;
         case NAV_BAR_NEXT_PLUS_MANY:
            new_tile_index = (tile_index + 100) % all_tiles.length;
            break;
         case NAV_BAR_NEXT_PLUS_MANY_MORE:
            new_tile_index = (tile_index + 1000) % all_tiles.length;
            break;
         case NAV_BAR_LAST:
            new_tile_index = last_index;
            break;
         default:
            break;
      }
      console.log(`new_tile_index=${new_tile_index}, tile_index=${tile_index}`)
      const selected_tile = all_tiles[new_tile_index];
      if (selected_tile) {
         const bounds = selected_tile.bounds;
         const new_values = {
            scope: fracto_values.scope,
            focal_point: {
               x: bounds.left + (bounds.right - bounds.left) / 2,
               y: bounds.top - (bounds.top - bounds.bottom) / 2,
            }
         }
         console.log("new_values", new_values)
         this.setState({
            selected_tile: selected_tile,
            tile_index: new_tile_index,
            fracto_values: new_values
         });
      }
      return true;
   }

   render_nav_bar = () => {
      const {tile_index, all_tiles} = this.state;
      const smaller = {fontSize: "1rem"};
      const smallest = {fontSize: "0.75rem"};
      const smallest_yet = {fontSize: "0.5rem"};
      return [
         <NavElement onClick={e => this.nav_bar_action(NAV_BAR_FIRST)}>first</NavElement>,
         <NavElement style={smallest_yet}
                     onClick={e => this.nav_bar_action(NAV_BAR_PREV_MINUS_MANY_LESS)}>-1000</NavElement>,
         <NavElement style={smallest} onClick={e => this.nav_bar_action(NAV_BAR_PREV_MINUS_MANY)}>-100</NavElement>,
         <NavElement style={smaller} onClick={e => this.nav_bar_action(NAV_BAR_PREV_MINUS)}>-10</NavElement>,
         <NavElement onClick={e => this.nav_bar_action(NAV_BAR_PREV)}>prev</NavElement>,
         <NavElement onClick={e => this.nav_bar_action(NAV_BAR_NEXT)}>next</NavElement>,
         <NavElement style={smaller} onClick={e => this.nav_bar_action(NAV_BAR_NEXT_PLUS)}>+10</NavElement>,
         <NavElement style={smallest} onClick={e => this.nav_bar_action(NAV_BAR_NEXT_PLUS_MANY)}>+100</NavElement>,
         <NavElement style={smallest_yet}
                     onClick={e => this.nav_bar_action(NAV_BAR_NEXT_PLUS_MANY_MORE)}>+1000</NavElement>,
         <NavElement onClick={e => this.nav_bar_action(NAV_BAR_LAST)}>last</NavElement>,
         <StatsElement>{`(${tile_index + 1}/${all_tiles.length})`}</StatsElement>,
      ]
   }

   go = (level, offset) => {
      // const generate_tiles = FractoData.get_potential_tiles(level)
      const generate_tiles = get_empties(level)
         .filter(a => a.bounds.left > offset)
         .sort((a, b) => {
         return a.bounds.left === b.bounds.left ?
            b.bounds.top - a.bounds.top :
            a.bounds.left - b.bounds.left;
      });
      console.log("generate_tiles", generate_tiles);
      this.setState({
         go_time: level,
         generate_tiles: generate_tiles
      })
   }

   go_verify = (level, offset = -0.51) => {
      // const verify_tiles = FractoData.get_completed_tiles(level)
      const verify_tiles = get_level_cells(level)
         .filter(a => a.bounds.left > offset)
         .sort((a, b) => {
            return a.bounds.left === b.bounds.left ?
               b.bounds.top - a.bounds.top :
               a.bounds.left - b.bounds.left;
         });
      console.log("verify_tiles", verify_tiles);
      this.setState({
         go_time_verify: level,
         verify_tiles: verify_tiles
      })
   }

   render() {
      const {
         fracto_values, fracto_ref,
         cursor_x, cursor_y, tile_outline,
         selected_tile, go_time, generate_tiles,
         go_time_verify, verify_tiles
      } = this.state;
      const selected_tile_outline = this.get_tile_outline(selected_tile);

      const tile_edit = !selected_tile || !selected_tile.code ? '' : <TileEditWrapper>
         {/*<FractoTileEditor*/}
         {/*   code={selected_tile.code}*/}
         {/*   on_publish_complete={() => {*/}
         {/*      return this.nav_bar_action(NAV_BAR_NEXT)*/}
         {/*   }}*/}
         {/*   auto_publish={!edit_empties}*/}
         {/*/>*/}
      </TileEditWrapper>;

      const go_11_link = <GoLink onClick={e => this.go(11, -0.28)}>Go 11</GoLink>
      const go_11_verify_link = <GoLink onClick={e => this.go_verify(11, -2.0)}>Go 11 (verify)</GoLink>
      const go_12_link = <GoLink onClick={e => this.go(12, -1.14)}>Go 12</GoLink>
      const go_12_verify_link = <GoLink onClick={e => this.go_verify(12, -2.0)}>Go 12 (verify)</GoLink>
      const go_13_link = <GoLink onClick={e => this.go(13, -1.34)}>Go 13</GoLink>
      const go_13_verify_link = <GoLink onClick={e => this.go_verify(13, -2.0)}>Go 13 (verify)</GoLink>
      const go_14_link = <GoLink onClick={e => this.go(14, -1.395)}>Go 14</GoLink>
      const go_15_link = <GoLink onClick={e => this.go(15, -1.77)}>Go 15</GoLink>
      const go_16_link = <GoLink onClick={e => this.go(16, -1.779)}>Go 16</GoLink>
      const go_17_link = <GoLink onClick={e => this.go(17, -1.95)}>Go 17</GoLink>

      let options = {};
      options[GENERATE_NO_EMPTY_TILES] = true;
      options[GENERATE_NO_INLAND_TILES] = true;
      const go_time_modal = !go_time ? '' : <CommonTilesGenerate
         on_response_modal={r => this.setState({go_time: false})}
         tiles_list={generate_tiles}
         options={options}/>

      let options_verify = Object.assign({}, options);
      options_verify[GENERATE_VERIFY_TILES] = true;
      const go_time_verify_modal = !go_time_verify ? '' : <CommonTilesGenerate
         on_response_modal={r => this.setState({go_time_verify: false})}
         tiles_list={verify_tiles}
         options={options_verify}/>

      const fracto_locate = render_fracto_locate(fracto_values);
      return <AppStyles.Block>
         <TileSelectWrapper>
            <BorderWrapper>
               {fracto_locate}
            </BorderWrapper>
            <RenderWrapper
               ref={fracto_ref}
               onMouseMove={e => this.fracto_pos(e)}
               onMouseOut={e => this.fracto_no_pos(e)}>
               <FractoRender
                  width_px={IMAGE_WIDTH_PX}
                  aspect_ratio={IMAGE_ASPECT_RATIO}
                  initial_params={fracto_values}
                  tile_outline={tile_outline}
                  on_param_change={values => this.update_values(values)}
               />
               <CoordsWrapper>{FractoLocate.render_coordinates(cursor_x, cursor_y)}</CoordsWrapper>
               <SelectedTileBox style={selected_tile_outline}/>
            </RenderWrapper>
         </TileSelectWrapper>
         <CoordsWrapper>{this.render_nav_bar()}</CoordsWrapper>
         {tile_edit}
         {go_11_link}{go_11_verify_link}
         {go_12_link}{go_12_verify_link}
         {go_13_link}{go_13_verify_link}
         {go_14_link}
         {go_15_link}
         {go_16_link}
         {go_17_link}
         {go_time_modal}
         {go_time_verify_modal}
      </AppStyles.Block>
   }

}

export default FractoTessellate;
