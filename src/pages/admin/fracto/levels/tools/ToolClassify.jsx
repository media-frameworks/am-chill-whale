import React, {Component} from 'react';
import PropTypes from 'prop-types';
// import styled from "styled-components";
//
// import AppStyles from "app/AppStyles";
import StoreS3 from "common/StoreS3";

import ToolUtils from "./ToolUtils"
import ToolFramework, {OPTION_NO_CANVAS} from "./ToolFramework";

import {OPTION_RENDER_LEVEL} from "../../FractoActionWrapper";
import FractoData from "../../FractoData";

export class ToolClassify extends Component {

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

      const new_tiles = FractoData.get_potential_tiles(level);

      const level_tiles = new_tiles.sort((a, b) => {
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
         this.setState({status: `${to} (${result.result})`})
         cb(result.result)
      })
   }

   classify_tile = (tile, ctx, cb) => {
      console.log("classify_tile", tile)

      const parent_short_code = tile.short_code.substr(0, tile.short_code.length - 1)
      const json_name = `tiles/256/indexed/${parent_short_code}.json`;
      StoreS3.get_file_async(json_name, "fracto", json_str => {
         console.log("StoreS3.get_file_async", json_name);
         if (!json_str) {
            this.move_tile(tile.short_code, "new", "error", result => {
               cb("error reading parent tile")
            })
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
         this.move_tile(tile.short_code, "new", directory_bin, result => {
            cb (`moving tile to ${directory_bin}: ${result}`)
         })
      }, false);
   }

   render () {
      const {level_tiles, data_ready} = this.state;
      const {level} = this.props;

      let fracto_options = {};
      fracto_options[OPTION_RENDER_LEVEL] = level;

      let framework_options = {};
      framework_options[OPTION_NO_CANVAS] = true;

      const options = {
         fracto_options: fracto_options,
         framework_options: framework_options
      }
      return <ToolFramework
         level={level}
         level_tiles={level_tiles}
         data_ready={data_ready}
         verb={"classify"}
         tile_action={this.classify_tile}
         options={options}
      />
   }

}

export default ToolClassify;