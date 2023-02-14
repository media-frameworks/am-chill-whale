import React, {Component} from 'react';
import PropTypes from 'prop-types'
import styled from "styled-components";

import {AppStyles} from "app/AppImports";
import {PHI} from "common/math/constants";

import FractoCalc from "pages/admin/fracto/FractoCalc";
import FractoUtil from "pages/admin/fracto/FractoUtil";

import HolodeckController from "./holodeck/HolodeckController";
import HolodeckStage from "./holodeck/HolodeckStage";
import HolodeckUtil from "./holodeck/HolodeckUtil";

const DEFAULT_WIDTH_PX = 1000;
const WRAPPER_PADDING_PX = 10;
const ONE_MILLION = 1000000;

const DEFAULT_FOCAL_X = -0.625001;
const DEFAULT_FOCAL_Y = 0.00001;
const DEFAULT_FOCAL_Z = 0.00001;
const DEFAULT_INCLINATION_DEG = 5;
const DEFAULT_VIEW_ANGLE_DEG = -42;
const DEFAULT_FIELD_DEPTH = 16;
const DEFAULT_FIELD_SPAN_DEG = 20;
const DEFAULT_FRACTO_LEVEL = 3;

const HolodeckWrapper = styled(AppStyles.Block)`
   border: 0.15rem solid #aaaaaa;
   border-radius: 0.25rem;
   margin: ${WRAPPER_PADDING_PX / 2}px;
`;

export class ThreeDFractopography extends Component {

   static propTypes = {
      on_update_props: PropTypes.func.isRequired,
      width_px: PropTypes.number
   };

   static defaultProps = {
      width_px: DEFAULT_WIDTH_PX
   }

   state = {
      holodeck_controls: {
         focal_x: DEFAULT_FOCAL_X,
         focal_y: DEFAULT_FOCAL_Y,
         focal_z: DEFAULT_FOCAL_Z,
         fracto_level: DEFAULT_FRACTO_LEVEL,
         inclination_deg: DEFAULT_INCLINATION_DEG,
         view_angle_deg: DEFAULT_VIEW_ANGLE_DEG,
         field_depth: DEFAULT_FIELD_DEPTH,
         field_span_deg: DEFAULT_FIELD_SPAN_DEG,
         enhance: false,
      },
      grid_vectors: null,
      all_triangles: [],
      render_region: null,
      enhancing: false,
      enhanced_triangles: []
   }

   componentDidMount() {
      // const {holodeck_controls} = this.state;
      // const grid_vectors = HolodeckUtil.compute_grid_vectors(holodeck_controls);
      // this.setState({grid_vectors: grid_vectors})
      //
      // const fracto_values = {
      //    scope: 2.5,
      //    focal_point: {x: -0.625001, y: 0.00001}
      // };
      // const GRID_SIDE = 1200;
      // FractoSieve.extract(
      //    fracto_values.focal_point, 1.0, fracto_values.scope, GRID_SIDE, data => {
      //       console.log("sieve resilts", data)
      //       const all_triangles = this.build_triangles(data, fracto_values, GRID_SIDE);
      //       this.setState({all_triangles: all_triangles})
      //    }
      // );
   }

   static get_menu_options = (segment_data) => {
      if (!segment_data) {
         return [];
      }
      return [
         {label: "go to fracto", code: 1},
      ];
   }

   static on_menu_select = (code, segment_data) => {
      console.log("ThreeDFractopogofraphy on_menu_select", code)
   }

   build_triangles = (data, fracto_values, grid_side) => {

      const increment = fracto_values.scope / grid_side;
      const points_grid = this.get_points_grid(fracto_values, increment, data);

      console.log("about to process triangles")
      const all_triangles = []
      const half_increment = increment / 2;
      for (let img_x = 1; img_x < points_grid.length - 1; img_x++) {
         for (let img_y = 1; img_y < points_grid[img_x].length - 1; img_y++) {
            if (points_grid[img_x][img_y].iterations <= 10 && !points_grid[img_x][img_y].pattern) {
               continue;
            }
            if (points_grid[img_x][img_y].iterations > 999999) {
               continue;
            }
            const upper_left_z = this.best_average([
               points_grid[img_x - 1][img_y + 1],
               points_grid[img_x - 1][img_y],
               points_grid[img_x][img_y + 1],
               points_grid[img_x][img_y]
            ]);
            const upper_right_z = this.best_average([
               points_grid[img_x][img_y + 1],
               points_grid[img_x][img_y],
               points_grid[img_x + 1][img_y + 1],
               points_grid[img_x + 1][img_y]
            ]);
            const lower_left_z = this.best_average([
               points_grid[img_x - 1][img_y],
               points_grid[img_x - 1][img_y - 1],
               points_grid[img_x][img_y],
               points_grid[img_x][img_y - 1]
            ]);
            const lower_right_z = this.best_average([
               points_grid[img_x][img_y],
               points_grid[img_x][img_y - 1],
               points_grid[img_x + 1][img_y],
               points_grid[img_x + 1][img_y - 1]
            ]);
            all_triangles.push({
               color: points_grid[img_x][img_y].color,
               distance: 0,
               points: [
                  points_grid[img_x][img_y].location,
                  {
                     x: points_grid[img_x][img_y].location.x - half_increment,
                     y: points_grid[img_x][img_y].location.y + half_increment,
                     z: upper_left_z,
                  },
                  {
                     x: points_grid[img_x][img_y].location.x - half_increment,
                     y: points_grid[img_x][img_y].location.y - half_increment,
                     z: lower_left_z,
                  }
               ]
            });
            all_triangles.push({
               color: points_grid[img_x][img_y].color,
               distance: 0,
               points: [
                  points_grid[img_x][img_y].location,
                  {
                     x: points_grid[img_x][img_y].location.x - half_increment,
                     y: points_grid[img_x][img_y].location.y + half_increment,
                     z: upper_left_z
                  },
                  {
                     x: points_grid[img_x][img_y].location.x + half_increment,
                     y: points_grid[img_x][img_y].location.y + half_increment,
                     z: upper_right_z
                  }
               ]
            });
            all_triangles.push({
               color: points_grid[img_x][img_y].color,
               distance: 0,
               points: [
                  points_grid[img_x][img_y].location,
                  {
                     x: points_grid[img_x][img_y].location.x + half_increment,
                     y: points_grid[img_x][img_y].location.y + half_increment,
                     z: upper_right_z
                  },
                  {
                     x: points_grid[img_x][img_y].location.x + half_increment,
                     y: points_grid[img_x][img_y].location.y - half_increment,
                     z: lower_right_z
                  }
               ]
            });
            all_triangles.push({
               color: points_grid[img_x][img_y].color,
               distance: 0,
               points: [
                  points_grid[img_x][img_y].location,
                  {
                     x: points_grid[img_x][img_y].location.x + half_increment,
                     y: points_grid[img_x][img_y].location.y - half_increment,
                     z: lower_right_z,
                  },
                  {
                     x: points_grid[img_x][img_y].location.x - half_increment,
                     y: points_grid[img_x][img_y].location.y - half_increment,
                     z: lower_left_z
                  }
               ]
            });
         }
      }
      console.log("triangles processed, count:", all_triangles.length)
      return all_triangles;
   }

   best_average = (list) => {
      const pattern_list = list.filter(p => p.pattern && (p.iterations < 999999));
      if (pattern_list.length) {
         let sum = 0;
         pattern_list.forEach(p => {
            sum += p.location.z
         })
         return sum / pattern_list.length;
      }
      let sum = 0;
      list.forEach(p => {
         sum += p.location.z
      })
      return sum / list.length;
   }

   log_transform = (num) => {
      const ALL_THE_TIMES = 5;
      let result = num;
      for (let i = 0; i < ALL_THE_TIMES; i++ ) {
         result = Math.sqrt(result);
      }
      return result - 1;
   }

   static transform_cache = {};

   get_transform = (num) => {
      const cache_key = `_${num}`;
      const SCALE_FACTOR = 0.005;
      if (ThreeDFractopography.transform_cache[cache_key]) {
         return ThreeDFractopography.transform_cache[cache_key];
      }
      let log_million = ThreeDFractopography.transform_cache["one_million"]
      if (!log_million) {
         log_million = this.log_transform(ONE_MILLION);
         ThreeDFractopography.transform_cache["one_million"] = log_million;
      }
      const transform = SCALE_FACTOR * this.log_transform(num) / log_million;  //this.log_transform(num) / 30;
      ThreeDFractopography.transform_cache[cache_key] = transform;
      return transform;
   }

   get_points_grid = (fracto_values, increment, data) => {
      const points_grid = [];
      const leftmost = fracto_values.focal_point.x - fracto_values.scope / 2;
      const bottommost = fracto_values.focal_point.y - 1.0 * fracto_values.scope / 2;
      for (let img_x = 0; img_x < data.length; img_x++) {
         const column = data[img_x];
         const x = leftmost + increment * img_x;
         points_grid[img_x] = [];
         for (let img_y = 0; img_y < column.length; img_y++) {
            const y = bottommost + increment * img_y;
            let pixel = column[img_y];
            if (!pixel.length || !pixel[1]) {
               const calculated = FractoCalc.calc(x, y);
               pixel = [calculated.pattern, calculated.iteration]
            }
            const super_transform = this.get_transform(pixel[1]);
            points_grid[img_x][img_y] = {
               color: FractoUtil.fracto_pattern_color(pixel[0], pixel[1]),
               pattern: pixel[0],
               iterations: pixel[1],
               location: {
                  x: x,
                  y: y,
                  z: -super_transform
               }
            }
         }
      }
      return points_grid;
   }

   update_controls = (controls) => {
      const grid_vectors = HolodeckUtil.compute_grid_vectors(controls);
      this.setState({
         holodeck_controls: controls,
         grid_vectors: grid_vectors,
      })
   }

   update_region = (region) => {
      // const {holodeck_controls, enhancing} = this.state;
      // if (holodeck_controls.enhance && !enhancing) {
      //    const scope = ((region.right - region.left) + (region.top - region.bottom)) / 2;
      //    const aspect_ratio = 1.0;
      //    const grid_side = 1200;
      //    const focal_point = {x: holodeck_controls.focal_x, y: holodeck_controls.focal_y + 0.0001};
      //    this.setState({
      //       render_region: region,
      //       enhancing: true
      //    })
      //    FractoSieve.extract(
      //       focal_point, aspect_ratio, scope, grid_side, data => {
      //          console.log("update_region sieve resilts", data)
      //          const fracto_values = {
      //             scope: scope,
      //             focal_point: focal_point
      //          }
      //          const enhanced_triangles = this.build_triangles(data, fracto_values, grid_side);
      //          holodeck_controls.enhance = false;
      //          this.setState({
      //             enhancing: false,
      //             enhanced_triangles: enhanced_triangles,
      //             holodeck_controls: holodeck_controls
      //          })
      //       });
      // }
   }

   render() {
      const {holodeck_controls, grid_vectors, all_triangles, enhanced_triangles} = this.state;
      const {width_px} = this.props;
      const holodeck = !grid_vectors ? '' : [
         <HolodeckStage
            width_px={width_px}
            controls={holodeck_controls}
            grid_vectors={grid_vectors}
            all_triangles={enhanced_triangles.length ? enhanced_triangles : all_triangles}
            update_region={region => this.update_region(region)}
         />,
         <HolodeckController
            controls={holodeck_controls}
            on_update={controls => this.update_controls(controls)}
            x_offset_px={width_px + 10}
         />
      ]
      const wrapper_style = {
         width: `${width_px}px`,
         height: `${width_px / PHI}px`
      }
      return <HolodeckWrapper style={wrapper_style}>
         {holodeck}
      </HolodeckWrapper>
   }
}

export default ThreeDFractopography;
