import React, {Component} from 'react';
import PropTypes from 'prop-types';
// import styled from "styled-components";
//
// import AppStyles from "app/AppStyles";
import StoreS3 from "common/StoreS3";

import FractoData from "../../FractoData";

import ToolFramework from "./ToolFramework";

export class ToolMeta extends Component {

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
      const indexed_tiles = FractoData.get_indexed_tiles(level);
      const level_tiles = indexed_tiles.sort((a, b) => {
         return a.bounds.left === b.bounds.left ?
            (a.bounds.top > b.bounds.top ? -1 : 1) :
            (a.bounds.left > b.bounds.left ? 1 : -1)
      })
      this.setState({
         data_ready: true,
         level_tiles: level_tiles,
      })
   }

   static generate_tile_meta = (tile, cb) => {
      let highest_iteration_value = 0;
      let max_iteration_count = 0;
      let pattern_count = 0;
      let total_iterations = 0;
      for (let img_x = 0; img_x < 256; img_x++) {
         for (let img_y = 0; img_y < 256; img_y++) {
            const [pattern, iterations] = tile["index"][img_x][img_y];
            if (pattern) {
               pattern_count++;
            }
            if (iterations > 999999) {
               max_iteration_count++;
            }
            if (iterations > highest_iteration_value) {
               highest_iteration_value = iterations;
            }
            total_iterations += iterations;
         }
      }
      const meta_data = {
         highest_iteration_value: highest_iteration_value,
         max_iteration_count: max_iteration_count,
         pattern_count: pattern_count,
         total_iterations: total_iterations
      }
      console.log("meta_data", tile.short_code, meta_data);

      const meta_name = `tiles/256/meta/${tile.short_code}.json`;
      StoreS3.put_file_async(meta_name, JSON.stringify(meta_data), "fracto", result => {
         console.log("StoreS3.put_file_async", meta_name, result)
         cb("Tile meta saved")
      })

      return meta_data;
   }

   meta_tile = (tile, ctx, cb) => {
      console.log("meta_tile", tile)
      if (!tile || !tile["index"]) {
         return;
      }
      const meta_name = `tiles/256/meta/${tile.short_code}.json`;
      StoreS3.get_file_async(meta_name, "fracto", result => {
         console.log("StoreS3.get_file_async", meta_name, result)
         if (!result) {
            ToolMeta.generate_tile_meta(tile, cb)
         }
         else {
            cb ("Meta data exists");
         }
      })

   }

   render() {
      const {level_tiles, data_ready} = this.state;
      const {level} = this.props;
      return <ToolFramework
         level={level}
         level_tiles={level_tiles}
         data_ready={data_ready}
         verb={"meta"}
         tile_action={this.meta_tile}
      />
   }

}

export default ToolMeta;
