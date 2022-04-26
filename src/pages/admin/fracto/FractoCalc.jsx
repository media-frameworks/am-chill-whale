import React, {Component} from 'react';
import PropTypes from 'prop-types';
// import styled from "styled-components";

import {AppStyles} from "../../../app/AppImports";
import StoreS3 from "../../../common/StoreS3";
import Utils from "../../../common/Utils";

import csv_files from "../../../data/fracto/csv_files.json";

export class FractoCalc extends Component {

   static propTypes = {
      init_code: PropTypes.string.isRequired,
      seed_x: PropTypes.number.isRequired,
      seed_y: PropTypes.number.isRequired,
      frame_width: PropTypes.number.isRequired,
      level_depth: PropTypes.number.isRequired,
      max_iterations: PropTypes.number.isRequired,
   }

   static cache = {}

   componentDidMount() {
      csv_files.shift();
      csv_files.shift();
      csv_files.shift();
      console.log("csv_files", csv_files);
   }

   process_cache = () => {
      const {init_code, seed_x, seed_y, frame_width, level_depth, max_iterations} = this.props;
      const cache_array = this.cache_file(init_code, seed_x, seed_y, frame_width, level_depth, max_iterations)
      const expandables = cache_array.filter((entry, index) => {
         if (index === 0) {
            return false;
         }
         if (entry.code.length === level_depth * 2 + 1) {
            return true;
         }
         return false;
      });
      console.log("expandables.length", expandables.length);

      const prefix = "[";
      const suffix = "].csv";
      const all_files = csv_files.map(file => file.replace(prefix, '').replace(suffix, ''));
      console.log("all_files", all_files)

      const shuffled = Utils.shuffle(expandables);
      for (let i = 0; i < shuffled.length; i++) {
         const entry = shuffled[i];
         if (all_files.includes(entry.code)) {
            console.log("found code, continuing", entry.code, i);
            continue;
         }
         this.cache_file(entry.code, entry.x, entry.y, entry.width, 8, max_iterations)
      }

   }

   cache_file = (init_code, seed_x, seed_y, frame_width, level_depth, max_iterations) => {
      const cache = Object.assign({}, {});
      const root_node = FractoCalc.calc(seed_x, seed_y, max_iterations);
      cache[init_code] = Object.assign({code: init_code, width: frame_width}, root_node);
      this.fill_frame(cache, init_code, seed_x, seed_y, frame_width, level_depth, max_iterations);
      const cache_array = Object.keys(cache)
         .map(key => cache[key])
         .sort((a, b) => {
            if (a.x > b.x) {
               return 1;
            }
            if (a.x < b.x) {
               return -1;
            }
            if (a.x === b.x) {
               if (a.y > b.y) {
                  return -1;
               }
            }
            return 1;
         });

      let in_set = false;
      for (let i = 0; i < cache_array.length; i++) {
         if (cache_array[i].pattern > 0) {
            in_set = true;
            break;
         }
      }
      if (!in_set) {
         return [];
      }

      const csv = Utils.json_to_csv(cache_array);
      const file_name = "data_csv/[" + init_code + "].csv";
      console.log("file_name", file_name)

      StoreS3.put_file_async(file_name, csv, "fracto", result => {
         console.log("put_file_async result", result);
      });
      return cache_array;
   }

   expand_nodes = (nodes) => {
      const {max_iterations} = this.props;
      nodes.forEach(node => {
         FractoCalc.calc(node.x, node.y, max_iterations * 10);
      });
   }

   state = {
      root_node: {}
   };

   fill_frame = (cache, code, x, y, width, depth, max_iterations) => {
      const width_by_2 = width / 2;

      const code_00 = code.split(',').map((part, index) => `${part}0`).join(',')
      if (!cache[code_00]) {
         const node_00 = FractoCalc.calc(x, y, max_iterations);
         cache[code_00] = Object.assign({code: code_00, width: width_by_2}, node_00);
      }

      const code_01 = code.split(',').map((part, index) => `${part}${index}`).join(',')
      if (!cache[code_01]) {
         const node_01 = FractoCalc.calc(x + width_by_2, y, max_iterations);
         cache[code_01] = Object.assign({code: code_01, width: width_by_2}, node_01);
      }

      const code_10 = code.split(',').map((part, index) => `${part}${1 - index}`).join(',')
      if (!cache[code_10]) {
         const node_10 = FractoCalc.calc(x, y - width_by_2, max_iterations);
         cache[code_10] = Object.assign({code: code_10, width: width_by_2}, node_10);
      }

      const code_11 = code.split(',').map((part, index) => `${part}1`).join(',')
      if (!cache[code_11]) {
         const node_11 = FractoCalc.calc(x + width_by_2, y - width_by_2, max_iterations);
         cache[code_11] = Object.assign({code: code_11, width: width_by_2}, node_11);
      }

      const new_depth = depth - 1;
      if (new_depth === 1) {
         return;
      }

      this.fill_frame(cache, code_00, x, y, width_by_2, new_depth, max_iterations);
      this.fill_frame(cache, code_01, x + width_by_2, y, width_by_2, new_depth, max_iterations);
      this.fill_frame(cache, code_10, x, y - width_by_2, width_by_2, new_depth, max_iterations);
      this.fill_frame(cache, code_11, x + width_by_2, y - width_by_2, width_by_2, new_depth, max_iterations);
   }

   static calc = (x0, y0, max_iteration) => {
      let x = 0;
      let y = 0;
      let iteration = 0;
      let x_squared = 0;
      let y_squared = 0;
      let pattern = 0;
      const previously = {};
      while (x_squared + y_squared < 100 && iteration < max_iteration) {
         y = 2 * x * y + y0;
         x = x_squared - y_squared + x0;
         const position_slug = `${x},${y}`;
         if (previously[position_slug]) {
            pattern = iteration - previously[position_slug];
            break;
         } else {
            previously[position_slug] = iteration;
         }
         x_squared = x * x;
         y_squared = y * y;
         iteration++;
      }
      if (iteration >= max_iteration) {
         console.log("max_iteration", x0, y0)
         pattern = -1;
      }
      return {
         x: x0,
         y: y0,
         pattern: pattern,
         iteration: iteration
      };
   }

   render() {
      return <AppStyles.Block>
         <button onClick={e => this.process_cache()}>FractoCalc</button>
      </AppStyles.Block>
   }

}

export default FractoCalc;

