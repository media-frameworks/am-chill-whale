import React, {Component} from 'react';
import styled from "styled-components";

import Slider from 'rc-slider';

import {AppStyles} from "../../../app/AppImports";
import LinearEquation from "../../../common/math/LinearEquation";

const BlockWrapper = styled(AppStyles.Block)`
    ${AppStyles.noselect}
    padding: 0.5rem 0;
`;

const TestFieldWrapper = styled(AppStyles.InlineBlock)`
    ${AppStyles.noselect}
    padding: 0.5rem 0 1rem;
    border: 0.15rem solid #666666;
    border-radius: 0.25rem;
    background-color: #eeeeee;
`;

const VerticalSlider = styled(Slider)`
    width: 0.3125rem;
    height: 10rem;
    background-color: #eeeeee;
`;

const SliderWrapper = styled(AppStyles.InlineBlock)`
    margin: 0 2rem;
    z-index: 10;
`;

const ValuesColumn = styled(AppStyles.InlineBlock)`
    ${AppStyles.noselect}
    ${AppStyles.monospace}
    ${AppStyles.ellipsis}
    margin: 0 1rem;
    vertical-align: top;
`;

const InputsColumn = styled(ValuesColumn)`
    width: 3rem;
`;

const CoefficientsColumn = styled(ValuesColumn)`
    width: 6rem;
`;

const CanvasField = styled.canvas`
    ${AppStyles.fixed}    
`;

export class ThreeDFluidMotion extends Component {

   state = {
      inputs: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
      coefficients: [0, 0, 0, 0, 0, 0, 0],
      width_px: 0,
      height_px: 0,
      canvas_ref: React.createRef(),
      slider_refs: [
         React.createRef(),
         React.createRef(),
         React.createRef(),
         React.createRef(),
         React.createRef(),
         React.createRef(),
         React.createRef(),
      ],
      values: [],
      ctx: null,
      point_count: 7,
      canvas_top: 0,
      canvas_left: 0,
   }

   componentDidMount() {
      const {canvas_ref, width_px, height_px, slider_refs, point_count} = this.state;
      const canvas = canvas_ref.current;
      if (!canvas) {
         console.log('no canvas');
         return;
      }
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#eeeeee';
      ctx.fillRect(0, 0, width_px, height_px);
      console.log("slider_refs[0].current", slider_refs[0].current)
      const left_slider_bounds = slider_refs[0].current.getBoundingClientRect();
      const right_slider_bounds = slider_refs[point_count - 1].current.getBoundingClientRect();
      this.setState({
         ctx: ctx,
         width_px: right_slider_bounds.right - left_slider_bounds.right,
         height_px: left_slider_bounds.height,
         canvas_top: left_slider_bounds.top,
         canvas_left: left_slider_bounds.left,
      });

   }

   slider_value_3x3 = (index, value) => {
      const {inputs} = this.state;
      inputs[index] = value;
      const matrix = [
         [0, 0, 1],
         [1, 1, 1],
         [4, 2, 1]
      ];
      const coefficients = LinearEquation.solve_3x3(matrix, inputs);
      let values = [];
      for (let t = 0.0; t <= 2.0; t += 0.01) {
         const t_2 = t * t;
         value = coefficients[0] * t_2 + coefficients[1] * t + coefficients[2];
         values.push({t: t, value: value});
      }
      this.fill_canvas(values);
      this.setState({
         inputs: inputs,
         coefficients: coefficients,
         values: values,
      })
   }

   slider_value_4x4 = (index, value) => {
      const {inputs} = this.state;
      inputs[index] = value;
      const matrix = [
         [0, 0, 0, 1],
         [1, 1, 1, 1],
         [8, 4, 2, 1],
         [27, 9, 3, 1],
      ];
      const coefficients = LinearEquation.solve_4x4(matrix, inputs);
      let values = [];
      for (let t = 0.0; t <= 3.0; t += 0.01) {
         const t_2 = t * t;
         const t_3 = t_2 * t;
         value = coefficients[0] * t_3 + coefficients[1] * t_2 + coefficients[2] * t + coefficients[3];
         values.push({t: t, value: value});
      }
      this.fill_canvas(values);
      this.setState({
         inputs: inputs,
         coefficients: coefficients,
         values: values,
      })
   }

   slider_value_5x5 = (index, value) => {
      const {inputs} = this.state;
      inputs[index] = value;
      const matrix = [
         [0, 0, 0, 0, 1],
         [1, 1, 1, 1, 1],
         [16, 8, 4, 2, 1],
         [81, 27, 9, 3, 1],
         [256, 64, 16, 4, 1],
      ];
      const coefficients = LinearEquation.solve_5x5(matrix, inputs);
      let values = [];
      for (let t = 0.0; t <= 4.0; t += 0.05) {
         const t_2 = t * t;
         const t_3 = t_2 * t;
         const t_4 = t_3 * t;
         value = coefficients[0] * t_4 + coefficients[1] * t_3 + coefficients[2] * t_2 + coefficients[3] * t + coefficients[4];
         values.push({t: t, value: value});
      }
      this.fill_canvas(values);
      this.setState({
         inputs: inputs,
         coefficients: coefficients,
         values: values,
      })
   }

   slider_value_6x6 = (index, value) => {
      const {inputs} = this.state;
      inputs[index] = value;
      const matrix = [
         [0, 0, 0, 0, 0, 1],
         [1, 1, 1, 1, 1, 1],
         [32, 16, 8, 4, 2, 1],
         [243, 81, 27, 9, 3, 1],
         [1024, 256, 64, 16, 4, 1],
         [3125, 625, 125, 25, 5, 1],
      ];
      const coefficients = LinearEquation.solve_6x6(matrix, inputs);
      let values = [];
      for (let t = 0.0; t <= 5.0; t += 0.05) {
         const t_2 = t * t;
         const t_3 = t_2 * t;
         const t_4 = t_3 * t;
         const t_5 = t_4 * t;
         value = coefficients[0] * t_5 + coefficients[1] * t_4 + coefficients[2] * t_3 + coefficients[3] * t_2 + coefficients[4] * t + coefficients[5];
         values.push({t: t, value: value});
      }
      this.fill_canvas(values);
      this.setState({
         inputs: inputs,
         coefficients: coefficients,
         values: values,
      })
   }

   slider_value_7x7 = (index, value) => {
      const {inputs} = this.state;
      inputs[index] = value;
      const matrix = [
         [0, 0, 0, 0, 0, 0, 1],
         [1, 1, 1, 1, 1, 1, 1],
         [64, 32, 16, 8, 4, 2, 1],
         [729, 243, 81, 27, 9, 3, 1],
         [4096, 1024, 256, 64, 16, 4, 1],
         [15625, 3125, 625, 125, 25, 5, 1],
         [46656, 7776, 1296, 216, 36, 6, 1],
      ];
      const coefficients = LinearEquation.solve_7x7(matrix, inputs);
      let values = [];
      for (let t = 0.0; t <= 6.0; t += 0.05) {
         const t_2 = t * t;
         const t_3 = t_2 * t;
         const t_4 = t_3 * t;
         const t_5 = t_4 * t;
         const t_6 = t_5 * t;
         value = coefficients[0] * t_6 + coefficients[1] * t_5 + coefficients[2] * t_4 + coefficients[3] * t_3 + coefficients[4] * t_2 + coefficients[5] * t + coefficients[6];
         values.push({t: t, value: value});
      }
      this.fill_canvas(values);
      this.setState({
         inputs: inputs,
         coefficients: coefficients,
         values: values,
      })
   }

   fill_canvas = (values) => {
      const {ctx, width_px, height_px, point_count} = this.state;
      let coords = [];
      values.forEach(v => {
         const x = (v.t * width_px) / (point_count - 1);
         const y = height_px - (v.value * height_px);
         coords.push({x: x, y: y});
      })
      let region = new Path2D();
      region.moveTo(coords[0].x, coords[0].y);
      for (let i = 1; i < coords.length; i++) {
         region.lineTo(coords[i].x, coords[i].y);
      }
      ctx.fillStyle = '#eeeeee';
      ctx.fillRect(0, 0, width_px, height_px);
      ctx.strokeStyle = "black";
      ctx.stroke(region);
   }

   render() {
      const {
         inputs, coefficients, canvas_ref, width_px, height_px, slider_refs,
         canvas_top, canvas_left
      } = this.state;
      const handle_style = {
         border: "0.15rem solid #666666",
         borderRadius: "0.25rem",
         marginLeft: "-0.125rem",
         width: "0.25rem",
         height: "0.25rem",
         backgroundColor: "white",
         cursor: "pointer"
      };
      const sliders = inputs.map((input, index) => {
         return <SliderWrapper
            key={`vertical_slider_${index}`}
            ref={slider_refs[index]}>
            <VerticalSlider
               vertical included
               handleStyle={handle_style}
               min={0.0} max={1.0} step={0.001}
               onChange={value => this.slider_value_7x7(index, value)}
               defaultValue={0.5}
               value={1.0 - input}
            />
         </SliderWrapper>
      })
      const all_values = inputs.map((input, index) => {
         return <AppStyles.Block key={`input_value_${index}`}>{input}</AppStyles.Block>
      })
      const all_coefficients = coefficients.map((coefficient, index) => {
         const rounded = (Math.floor(coefficient * 1000000)) / 1000000;
         return <AppStyles.Block key={`input_value_${index}`}>{rounded}</AppStyles.Block>
      });
      const field_styles = {
         width: `${width_px}px`,
         height: `${height_px}px`,
         top: `${canvas_top + 10}px`,
         left: `${canvas_left + 2}px`,
      }
      return <BlockWrapper>
         <CanvasField
            ref={canvas_ref}
            style={field_styles}
            width={`${width_px}px`}
            height={`${height_px}px`}/>
         <TestFieldWrapper>
            {sliders}
         </TestFieldWrapper>
         <InputsColumn>{all_values}</InputsColumn>
         <CoefficientsColumn>{all_coefficients}</CoefficientsColumn>
      </BlockWrapper>;
   }
}

export default ThreeDFluidMotion;
