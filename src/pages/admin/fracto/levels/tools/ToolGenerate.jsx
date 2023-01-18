import React, {Component} from 'react';
import PropTypes from 'prop-types';
// import styled from "styled-components";
//
// import AppStyles from "app/AppStyles";
import StoreS3 from "common/StoreS3";

import ToolUtils from "./ToolUtils"
import ToolFramework from "./ToolFramework";

import {OPTION_RENDER_LEVEL} from "../../FractoActionWrapper";
import FractoData from "../../FractoData";
import FractoUtil from "../../FractoUtil";
import FractoCalc from "../../FractoCalc";

export class ToolGenerate extends Component {

   static propTypes = {
      level: PropTypes.number.isRequired,
      width_px: PropTypes.number.isRequired,
   }

   state = {
      data_ready: false,
      level_tiles: [],
   }

   componentDidMount() {
      const {level} = this.props;

      const ready_tiles = FractoData.get_ready_tiles(level);
      const level_tiles = ready_tiles.sort((a, b) => {
         return a.bounds.left === b.bounds.left ?
            (a.bounds.top > b.bounds.top ? -1 : 1) :
            (a.bounds.left > b.bounds.left ? 1 : -1)
      })
      this.setState({
         data_ready: true,
         level_tiles: level_tiles,
      })
   }

   calculate_tile = (tile, tile_points, cb) => {
      const increment = (tile.bounds.right - tile.bounds.left) / 256.0;
      for (let img_x = 0; img_x < 256; img_x++) {
         const x = tile.bounds.left + img_x * increment;
         for (let img_y = 0; img_y < 256; img_y++) {
            if (img_x % 2 === 0 && img_y % 2 === 0) {
               continue;
            }
            const y = tile.bounds.top - img_y * increment;
            const values = FractoCalc.calc(x, y);
            tile_points[img_x][img_y] = [values.pattern, values.iteration];
         }
      }
      const index_url = `tiles/256/indexed/${tile.short_code}.json`;
      StoreS3.put_file_async(index_url, JSON.stringify(tile_points), "fracto", result => {
         console.log("StoreS3.put_file_async", index_url, result);
         ToolUtils.tile_to_bin(tile.short_code, "ready", "complete", result => {
            console.log("ToolUtils.tile_to_bin", tile.short_code, result);
            cb("generated tile")
         })
      })
   }

   prepare_generator = (parent_tile_data, quad_code) => {
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
            return null;
      }
      const tile_points = new Array(256).fill(0).map(() => new Array(256).fill([0, 0]));
      for (let img_x = col_start, result_col = 0; img_x < col_end; img_x++, result_col += 2) {
         for (let img_y = row_start, result_row = 0; img_y < row_end; img_y++, result_row += 2) {
            tile_points[result_col][result_row] = parent_tile_data[img_x][img_y]
         }
      }
      return tile_points;
   }

   generate_tile = (tile, ctx, cb) => {
      const parent_short_code = tile.short_code.substr(0, tile.short_code.length - 1)
      const quad_code = tile.short_code[tile.short_code.length - 1];
      const parent_index_url = `tiles/256/indexed/${parent_short_code}.json`;
      StoreS3.get_file_async(parent_index_url, "fracto", json_str => {
         console.log("StoreS3.get_file_async", parent_index_url);
         if (!json_str) {
            console.log("parent tile for generation", parent_index_url);
            cb("parent tile is not indexed");
         } else {
            const parent_tile_data = JSON.parse(json_str);
            const tile_points = this.prepare_generator(parent_tile_data, quad_code)
            if (!tile_points) {
               cb("error preparing generator")
            } else {
               setTimeout(() => FractoUtil.data_to_canvas(tile_points, ctx), 100);
               this.calculate_tile(tile, tile_points, result => {
                  FractoUtil.data_to_canvas(tile_points, ctx)
                  cb(result)
               });
            }
         }
      })
   }

   render() {
      const {level_tiles, data_ready} = this.state;
      const {level} = this.props;

      let fracto_options = {};
      fracto_options[OPTION_RENDER_LEVEL] = level;

      const options = {fracto_options: fracto_options}
      return <ToolFramework
         level={level}
         level_tiles={level_tiles}
         data_ready={data_ready}
         verb={"generate"}
         tile_action={this.generate_tile}
         options={options}
      />
   }

}

export default ToolGenerate;