import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "app/AppImports";

import FractoSieve from "../FractoSieve";
import FractoCalc from "../FractoCalc";

const BAILIWICK_SAMPLE_WIDTH_PX = 350;

export class BailiwickPoints extends Component {

   static propTypes = {
      bailiwick_data: PropTypes.object.isRequired,
   }

   state = {
      loading: true,
      pattern_data: [],
      potentials: [],
   }

   componentDidMount() {
      const {bailiwick_data} = this.props;
      console.log("BailiwickPoints bailiwick_data", bailiwick_data);
      FractoSieve.extract(
         bailiwick_data.display_settings.focal_point, 1.0, bailiwick_data.display_settings.scope, BAILIWICK_SAMPLE_WIDTH_PX, result => {
            console.log("BailiwickPoints sieve", result)
            const potentials = this.bailiwick_potentials(result)
            this.setState({
               pattern_data: result,
               potentials: potentials,
               loading: false
            })
         });
   }

   bailiwick_potentials = (data) => {
      const {bailiwick_data} = this.props;
      const fracto_values = bailiwick_data.display_settings;
      const increment = fracto_values.scope / BAILIWICK_SAMPLE_WIDTH_PX;
      const leftmost = fracto_values.focal_point.x - fracto_values.scope / 2;
      const bottommost = fracto_values.focal_point.y - fracto_values.scope / 2;
      let pattern_lists = {};
      for (let img_x = 0; img_x < data.length; img_x++) {
         const column = data[img_x];
         const x = leftmost + increment * img_x;
         for (let img_y = 0; img_y < column.length; img_y++) {
            const y = bottommost + increment * img_y;
            let pixel = column[img_y];
            if (!pixel.length || !pixel[1]) {
               const calculated = FractoCalc.calc(x, y);
               pixel = [calculated.pattern, calculated.iteration]
            }
            if (pixel[0] > 0) {
               const key = `_${pixel[0]}`
               if (!pattern_lists[key]) {
                  pattern_lists[key] = [];
               }
               pattern_lists[key].push({
                  pattern: pixel[0],
                  iterations: pixel[1],
                  img_x,
                  img_y,
                  x: x,
                  y: y
               });
            }
         }
      }

      const potentials = Object.keys(pattern_lists).map(key => {
         return {
            pattern: parseInt(key.replace('_', '')),
            values: pattern_lists[key]
               .sort((a, b) => a.iterations - b.iterations)
               .slice(0, 250)
         };
      }).sort((a, b) => a.pattern - b.pattern)

      console.log("potentials", potentials);
      return potentials;
   }

   render() {
      const {pattern_data, potentials} = this.state;
      console.log("BailiwickPoints render potentials", potentials)
      return "BailiwickPoints"
   }

}

export default BailiwickPoints;
