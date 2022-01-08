import React, {Component} from 'react';
import styled from "styled-components";
import PropTypes from 'introspective-prop-types'

import Slider from 'rc-slider';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlusSquare} from '@fortawesome/free-regular-svg-icons';
import {faMinusSquare} from '@fortawesome/free-regular-svg-icons';

import {AppStyles, AppColors} from "../../../app/AppImports";
import LinearEquation from "../../../common/math/LinearEquation";

const MIN_POINT_COUNT = 3;
const MAX_POINT_COUNT = 20;

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

const PointCountWrapper = styled(AppStyles.Block)`
    margin: 0.5rem 0;
    height: 1rem;
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

const PointCounter = styled.span`
    ${AppStyles.monospace}    
    font-size: 1rem;
    padding: 0.25rem 0.5rem;    
`;

const PointCounterButton = styled(AppStyles.InlineBlock)`
    ${AppStyles.pointer}    
    ${AppColors.COLOR_COOL_BLUE}
    font-size: 1rem;
    margin-top: 0.1rem;
`;

export class ThreeDFluidMotion extends Component {

   static propTypes = {
      on_update: PropTypes.func.isRequired,
   };

   state = {
      inputs: [],
      coefficients: [],
      width_px: 0,
      height_px: 0,
      canvas_ref: React.createRef(),
      slider_refs: [],
      values: [],
      ctx: null,
      point_count: 0,
      canvas_top: 0,
      canvas_left: 0,
      poly_matrix: []
   }

   componentDidMount() {
      const {canvas_ref} = this.state;
      const canvas = canvas_ref.current;
      if (!canvas) {
         console.log('no canvas');
         return;
      }
      const ctx = canvas.getContext('2d');
      this.change_point_count(8);

      let slider_refs = [];
      for (let i = 0; i < MAX_POINT_COUNT; i++) {
         slider_refs.push(React.createRef());
      }
      this.setState({
         ctx: ctx,
         slider_refs: slider_refs
      });
   }

   static get_menu_options = (segment_data) => {
      if (!segment_data) {
         return [];
      }
      return [
         {label: "go to there", code: 1   },
      ];
   }

   set_slider_value = (index, value) => {
      const {inputs, point_count, poly_matrix} = this.state;
      inputs[index] = value;
      const coefficients = LinearEquation.solve(poly_matrix, inputs);
      let values = [];
      for (let t = 0.0; t <= point_count - 1; t += 0.025) {
         let t_powers = [1, t];
         let t_power_value = t;
         for (let i = 2; i < point_count; i++) {
            t_power_value *= t;
            t_powers.push(t_power_value);
         }
         let value = 0;
         for (let i = 0; i < point_count; i++) {
            value += coefficients[i] * t_powers[point_count - i - 1];
         }
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

   set_poly_matrix = (point_count) => {
      let first_row = [1];
      let second_row = [1];
      for (let i = 0; i < point_count - 1; i++) {
         first_row.unshift(0);
         second_row.push(1);
      }
      let poly_matrix = [first_row, second_row];
      for (let factor = 2; factor < point_count; factor++) {
         let value = 1;
         let row_values = [1];
         for (let col = 0; col < point_count - 1; col++) {
            value *= factor;
            row_values.unshift(value);
         }
         poly_matrix.push(row_values);
      }
      console.log("poly_matrix", poly_matrix)
      return poly_matrix;
   }

   change_point_count = (point_count) => {
      if (point_count < MIN_POINT_COUNT || point_count > MAX_POINT_COUNT) {
         return;
      }
      let inputs = [];
      let cofficients = [];
      for (let i = 0; i < point_count; i++) {
         inputs.push(0.5);
         cofficients.push(0.0);
      }
      const poly_matrix = this.set_poly_matrix(point_count);
      this.setState({
         point_count: point_count,
         inputs: inputs,
         cofficients: cofficients,
         width_px: 0,
         height_px: 0,
         poly_matrix: poly_matrix
      });
      const interval = setInterval(() => {
         const {slider_refs} = this.state;
         if (!slider_refs[0].current) {
            return;
         }
         clearInterval(interval);
         const left_slider_bounds = slider_refs[0].current.getBoundingClientRect();
         const right_slider_bounds = slider_refs[point_count - 1].current.getBoundingClientRect();
         this.setState({
            width_px: right_slider_bounds.right - left_slider_bounds.right,
            height_px: left_slider_bounds.height,
            canvas_top: left_slider_bounds.top,
            canvas_left: left_slider_bounds.left,
         });
         this.set_slider_value(0, 0.5)
      }, 250);
   }

   render() {
      const {
         inputs, coefficients, canvas_ref, width_px, height_px, slider_refs,
         canvas_top, canvas_left, point_count
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
               onChange={value => this.set_slider_value(index, value)}
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
         <PointCountWrapper>
            <PointCounterButton onClick={e => this.change_point_count(point_count - 1)}>
               <FontAwesomeIcon icon={faMinusSquare}/>
            </PointCounterButton>
            <PointCounter>{`${point_count} points`}</PointCounter>
            <PointCounterButton onClick={e => this.change_point_count(point_count + 1)}>
               <FontAwesomeIcon icon={faPlusSquare}/>
            </PointCounterButton>
         </PointCountWrapper>
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
