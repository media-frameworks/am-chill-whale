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
import FractoLayeredCanvas from "../../FractoLayeredCanvas";

export class ToolIndex extends Component {

   static propTypes = {
      level: PropTypes.number.isRequired,
      width_px: PropTypes.number.isRequired,
   }

   state = {
      data_ready: false,
      level_tiles: []
   }

   componentDidMount() {
      const {level} = this.props;

      const completed_tiles = FractoData.get_completed_tiles(level);
      const level_tiles = completed_tiles.sort((a, b) => {
         return a.bounds.left === b.bounds.left ?
            (a.bounds.top > b.bounds.top ? -1 : 1) :
            (a.bounds.left > b.bounds.left ? 1 : -1)
      })
      this.setState({
         data_ready: true,
         level_tiles: level_tiles,
      })
   }

   move_tile = (short_code, from, to, cb) => {
      ToolUtils.tile_to_bin(short_code, from, to, result => {
         console.log("ToolUtils.tile_to_bin", short_code, to, result);
         cb(result.result)
      })
   }

   index_tile = (tile, ctx, cb) => {
      const index_name = `tiles/256/indexed/${tile.short_code}.json`;
      StoreS3.get_file_async(index_name, "fracto", json_str => {
         console.log("StoreS3.get_file_async", index_name);
         if (json_str || 0) {
            const tile_data = JSON.parse(json_str);
            FractoUtil.data_to_canvas(tile_data, ctx)
            console.log("tile is currently indexed", index_name);
            this.move_tile(tile.short_code, "complete", "indexed", result => {
               cb (`moved tile to indexed: ${result}`)
            })
         } else {
            delete FractoLayeredCanvas.tile_cache[tile.short_code]
            StoreS3.remove_from_cache(index_name);
            const json_name = `tiles/256/json/${tile.short_code}.json`;
            StoreS3.get_file_async(json_name, "fracto", json_str => {
               console.log("StoreS3.get_file_async", json_name);
               if (json_str) {
                  const tile_data = JSON.parse(json_str);
                  // console.log("tile_data", tile_data);
                  const tile_points = new Array(256).fill(0).map(() => new Array(256).fill([0, 0]));
                  for (let data_index = 0; data_index < tile_data.all_points.length; data_index++) {
                     const point = tile_data.all_points[data_index];
                     if (point.img_x > 255 || point.img_y > 255) {
                        continue;
                     }
                     if (point.img_x < 0 || point.img_y < 0) {
                        continue;
                     }
                     tile_points[point.img_x][point.img_y] = [point.pattern, parseInt(point.iterations)]
                  }
                  FractoUtil.data_to_canvas(tile_points, ctx)
                  StoreS3.put_file_async(index_name, JSON.stringify(tile_points), "fracto", result => {
                     console.log("StoreS3.put_file_async", index_name, result)
                     this.move_tile(tile.short_code, "complete", "indexed", result => {
                        cb (`generated index: ${result}`)
                     })
                  })
               } else {
                  console.log("json file error", json_name);
                  this.move_tile(tile.short_code, "complete", "new", result => {
                     cb (`json file  error, moved to new: ${result}`)
                  })
               }
            }, false)
         }
      }, false)
   }

   render() {
      const {level_tiles, data_ready} = this.state;
      const {level} = this.props;

      let fracto_options = {};
      fracto_options[OPTION_RENDER_LEVEL] = level;

      const options = {fracto_options: fracto_options,}
      return <ToolFramework
         level={level}
         level_tiles={level_tiles}
         data_ready={data_ready}
         verb={"index"}
         tile_action={this.index_tile}
         options={options}
      />
   }

}

export default ToolIndex;