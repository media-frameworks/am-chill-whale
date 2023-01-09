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
import ToolSelectTile from "./ToolSelectTile"
import FractoData from "../../FractoData";
import FractoUtil from "../../FractoUtil";
import FractoCalc from "../../FractoCalc";
import FractoActiveImage from "../../FractoActiveImage";
import FractoActionWrapper, {
   OPTION_TILE_OUTLINE,
   OPTION_RENDER_LEVEL
} from "../../FractoActionWrapper";

import ToolUtils from "./ToolUtils"

const CADENCE_MS = 500;

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

export class ToolGenerator extends Component {

   static propTypes = {
      level: PropTypes.number.isRequired,
      width_px: PropTypes.number.isRequired,
   }

   static canvas_ref = React.createRef();

   state = {
      in_modal: false,
      data_ready: false,
      level_tiles: [],
      tile_index: -1,
      fracto_values: {
         scope: 2.5,
         focal_point: {x: -.75, y: 0.25}
      },
      progress_pct: 0.0,
      tile_points: [],
   }

   componentDidMount() {
      const {level} = this.props;
      const tile_points = new Array(256).fill(0).map(() => new Array(256).fill([0, 0]));
      this.setState({tile_points: tile_points});
      FractoData.load_readies_async(result => {
         console.log("FractoData.load_readies_async", result);
         const level_tiles = FractoData.get_ready_tiles(level).sort((a, b) => {
            return a.bounds.left === b.bounds.left ?
               (a.bounds.top > b.bounds.top ? -1 : 1) :
               (a.bounds.left > b.bounds.left ? 1 : -1)
         });
         this.setState({
            level_tiles: level_tiles,
            data_ready: true
         });
      })
   }

   generate_tile = (new_tile_index) => {
      const {level_tiles} = this.state;
      const tile = level_tiles[new_tile_index];
      if (!tile) {
         console.log("can't find tile, new_tile_index=", new_tile_index);
         return;
      }
      // if (FractoData.get_tile(tile.short_code, "completed")) {
      //    console.log("tile is already completed", tile.short_code);
      //    setTimeout(() => this.generate_tile(new_tile_index + 1), CADENCE_MS);
      //    return;
      // }

      const parent_short_code = tile.short_code.substr(0, tile.short_code.length - 1)
      const quad_code = tile.short_code[tile.short_code.length - 1];
      const parent_index_url = `tiles/256/indexed/${parent_short_code}.json`;

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

      StoreS3.get_file_async(parent_index_url, "fracto", json_str => {
         console.log("StoreS3.get_file_async", parent_index_url);
         if (!json_str) {
            console.log("Error getting parent tile for generation", parent_index_url);
            // this.move_tile(tile.short_code,"new", "error")
            return;
         }
         const parent_tile_data = JSON.parse(json_str);
         const ctx = this.prepare_generator(parent_tile_data, quad_code)
         setTimeout(() => this.calculate_tile(tile, new_tile_index, ctx), CADENCE_MS);
      })

   }

   calculate_tile = (tile, tile_index, ctx) => {
      const {tile_points} = this.state;
      const increment = (tile.bounds.right - tile.bounds.left) / 256.0;

      for (let img_x = 0; img_x < 256; img_x++) {
         const x = tile.bounds.left + img_x * increment;
         const progress_pct = (100.0 * img_x) / 256.0;
         setTimeout(() => this.setState({progress_pct: progress_pct}), CADENCE_MS);
         this.forceUpdate();
         for (let img_y = 0; img_y < 256; img_y++) {
            if (img_x % 2 === 0 && img_y % 2 === 0) {
               continue;
            }
            const y = tile.bounds.top - img_y * increment;
            const values = FractoCalc.calc(x, y);
            ctx.fillStyle = FractoUtil.fracto_pattern_color(values.pattern, values.iteration)
            ctx.fillRect(img_x, img_y, 1, 1);
            tile_points[img_x][img_y] = [values.pattern, values.iteration];
         }
      }
      const index_url = `tiles/256/indexed/${tile.short_code}.json`;
      delete FractoActiveImage.tile_cache[tile.short_code]
      StoreS3.remove_from_cache(index_url);
      StoreS3.put_file_async(index_url, JSON.stringify(tile_points), "fracto", result => {
         console.log("StoreS3.put_file_async", index_url, result);
         ToolUtils.tile_to_bin(tile.short_code, "ready", "complete", result => {
            console.log("ToolUtils.tile_to_bin", tile.short_code, result);
            this.setState({progress_pct: 100});
            setTimeout(() => {
               this.generate_tile(tile_index + 1);
            }, CADENCE_MS)
         })
      })
   }

   prepare_generator = (parent_tile_data, quad_code) => {
      const {tile_points} = this.state;
      console.log("prepare_generator", parent_tile_data.length, quad_code)
      let col_start, col_end, row_start, row_end;
      switch (quad_code) {
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
      const canvas = ToolGenerator.canvas_ref.current
      if (!canvas) {
         console.log("prepare_generator no canvas")
         return false;
      }

      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 256, 256);

      for (let img_x = col_start, result_col = 0; img_x < col_end; img_x++, result_col += 2) {
         for (let img_y = row_start, result_row = 0; img_y < row_end; img_y++, result_row += 2) {
            const patern = parent_tile_data[img_x][img_y][0];
            const iterations = parent_tile_data[img_x][img_y][1];
            ctx.fillStyle = FractoUtil.fracto_pattern_color(patern, iterations)
            ctx.fillRect(result_col, result_row, 1, 1);
            tile_points[result_col][result_row] = parent_tile_data[img_x][img_y]
         }
      }
      this.setState({tile_points: tile_points})
      return ctx;
   }

   render_modal_content = () => {
      const {level_tiles, tile_index, progress_pct} = this.state;
      let selected_short_code = '-';
      if (tile_index >= 0) {
         const tile = level_tiles[tile_index];
         selected_short_code = render_short_code(tile.short_code);
      }
      const canvas = <canvas
         ref={ToolGenerator.canvas_ref}
         width={256}
         height={256}
      />
      return <AppStyles.Block>{[
         <CenteredBlock>{selected_short_code}</CenteredBlock>,
         <CenteredBlock>{canvas}</CenteredBlock>,
         <CenteredBlock>{`${Math.floor(progress_pct * 100) / 100}%`}</CenteredBlock>,
      ]}</AppStyles.Block>
   }

   run_modal = () => {
      this.setState({in_modal: true})
      setTimeout(() => {
         this.generate_tile(0);
      }, CADENCE_MS)
   }

   render() {
      const {data_ready, in_modal, fracto_values, level_tiles, tile_index} = this.state;
      const {level, width_px} = this.props;

      const fracto_content = this.render_modal_content();
      const tile = level_tiles.length && tile_index >= 0 ? level_tiles[tile_index] : null
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

      const title = render_modal_title(`generate tiles for level ${level}`);
      const done = level_tiles.length === tile_index;
      const progress = <CenteredBlock key={"progress"}>
         {!done ? `${tile_index} of ${level_tiles.length + 1} tiles generated` : "Done!"}
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
      const main_link = render_main_link("generate", e => this.run_modal());
      return [
         <LinkWrapper>{main_link}</LinkWrapper>,
         <StartAtPrompt>start at:</StartAtPrompt>,
         <ToolSelectTile level={level} width_px={width_px}/>,
         modal
      ]
   }
}

export default ToolGenerator;
