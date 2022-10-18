import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "app/AppImports";

import FractoRender from "../FractoRender";
import FractoCalc from "../FractoCalc";
import {DEFAULT_FRACTO_VALUES} from "../FractoUtil";

export const FRACTO_RENDER_WIDTH_PX = 512;

const RenderWrapper = styled(AppStyles.InlineBlock)`
   margin: 0 0.5rem 1rem 1rem;
   border: 0.125rem solid #aaaaaa;
   border-radius: 0.25rem;
   height: ${FRACTO_RENDER_WIDTH_PX}px;
`;

export class TestHarness extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
   }

   state = {
      fracto_values: null,
      point_highlights: []
   }

   on_change = (values) => {
      this.setState({fracto_values: values})
      console.log("on_change", values);

      let startTime = performance.now()
      const calc_result = FractoCalc.calc(values.focal_point.x, values.focal_point.y);
      let endTime = performance.now()
      console.log(`Call to FractoCalc.calc took ${endTime - startTime}ms`, calc_result);

      startTime = performance.now()
      const fast_calc_result = FractoCalc.fast_calc(values.focal_point.x, values.focal_point.y);
      endTime = performance.now()
      console.log(`Call to FractoCalc.calc took ${endTime - startTime}ms`, fast_calc_result);

      const point_highlights = fast_calc_result.map(res => {
         return {x: res.re, y: res.im}
      })
      this.setState({point_highlights: point_highlights})
   }

   render() {
      const {fracto_values, point_highlights} = this.state;
      const fracto_render = <RenderWrapper onMouse>
         <FractoRender
            width_px={FRACTO_RENDER_WIDTH_PX}
            aspect_ratio={1.0}
            initial_params={fracto_values ? fracto_values : DEFAULT_FRACTO_VALUES}
            on_param_change={values => this.on_change(values)}
            point_highlights={point_highlights}
         />
      </RenderWrapper>

      return [
         fracto_render,
      ];
   }

}

export default TestHarness;
