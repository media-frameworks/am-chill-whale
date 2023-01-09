import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "app/AppImports";
import ComplexQuarternary from "common/math/ComplexQuarternary";

import FractoActionWrapper from "../FractoActionWrapper";

export const FRACTO_RENDER_WIDTH_PX = 512;

const CenteredBlock = styled(AppStyles.Block)`
   ${AppStyles.centered}
   margin: 0.5rem 1rem 0;
`;

export class TestHarness extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
   }

   state = {
      fracto_values: {
         scope: 2.5,
         focal_point: {x: 0.2833339093333332, y: 0.5277777909777778}
      },
      q_0: '',
      q_1: '',
      q_2: ''
   }

   componentDidMount() {
      const {fracto_values} = this.state;
      this.test_conversion(fracto_values)
   }

   fast_calc = (q_value, max_iteration = 1000000) => {
      let iteration = 1;
      let q = q_value;
      let q_squared = q * q;
      let pattern = 0;
      let position_slug = `${q}`;
      const previously = {position_slug: iteration};
      while (q_squared < 100 && iteration < max_iteration) {
         console.log("q, q_squared", q, q_squared)
         q = q_squared + q;
         position_slug = `${q}`;
         if (previously[position_slug] && iteration > 10) {
            pattern = iteration - previously[position_slug];
            break;
         } else {
            previously[position_slug] = iteration;
         }
         q_squared = q * q;
         iteration++;
      }
      if (iteration >= max_iteration) {
         console.log("max_iteration", q_value)
         pattern = -1;
      }
      return {
         q_value: q_value,
         pattern: pattern,
         iteration: iteration
      };
   }

   test_conversion = (values) => {

      // const x0 = -0.50001;
      const x1 = -0.24999;

      // const y0 = 0.1250001;
      const y1 = 0.1249999;


      const q_1 = new ComplexQuarternary(x1, y1)
      const q_2 = new ComplexQuarternary(x1, y1)
      q_2.square_sum(q_1)
      const q_2_str = q_2.to_string()

      const time_start_q_test = window.performance.now();
      for (let i = 0; i < 10000; i++) {
         q_2.square_sum(q_1)
      }
      const time_end_q_test = window.performance.now();
      console.log('q time', time_end_q_test - time_start_q_test)

      let a, b;
      const time_start_old_way = window.performance.now();
      for (let i = 0; i < 10000; i++) {
         a = x1 * x1 - y1 * y1 + x1;
         b = 2 * x1 * y1 + y1;
      }
      const time_end_old_way = window.performance.now();
      console.log('old time', time_end_old_way - time_start_old_way)

      const q_3 = new ComplexQuarternary(a, b)

      const q_1_str = q_1.to_string()
      const q_3_str = q_3.to_string()

      console.log("q_1", q_1_str)
      console.log("q_2", q_2_str)
      console.log("q_3", q_3_str)

      this.setState({
         fracto_values: values,
         q_1: q_1_str,
         q_2: q_2_str,
         q_3: q_3_str,
      })
   }

   render() {
      const {fracto_values, q_1, q_2, q_3} = this.state;
      const fracto_action = <FractoActionWrapper
         fracto_values={fracto_values}
         content={[
            <CenteredBlock>{q_1}</CenteredBlock>,
            <CenteredBlock>{q_2}</CenteredBlock>,
            <CenteredBlock>{q_3}</CenteredBlock>,
         ]}
         on_update={values => this.test_conversion(values)}
      />
      return [
         fracto_action
      ];
   }

}

export default TestHarness;
