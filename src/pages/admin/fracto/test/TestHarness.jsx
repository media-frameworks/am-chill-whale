import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

// import {AppStyles} from "app/AppImports";
import Complex from "common/math/Complex";
import FractoUtil from "../FractoUtil";

const FractoCanvas = styled.canvas`
   margin: 0;
`;

const FractoCanvasWrapper = styled.div`
   margin: 0;
`;

const InfoText = styled.div`
   margin-left: 1rem;
`;

const CANVAS_SIZE = 500;
const PIXEL_SIZE = 1.25;
const MAX_PATTERNS = 50000;

const EPSILON = 0.000001;
const LOWER_LIMIT = 0.001;


export class TestHarness extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
   }

   state = {
      canvas_ref: React.createRef(),
      cycles: 0,
      point_count: 0
   }

   componentDidMount() {
      const {canvas_ref} = this.state;
      const canvas = canvas_ref.current;
      if (!canvas) {
         console.log('no canvas');
         return;
      }
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      this.draw_sample_recurse(ctx)
   }

   draw_sample_recurse = (ctx) => {
      const {cycles} = this.state;

      const A1 = new Complex(0.002 * Math.random() - 0.001, 0.001 * Math.random() - 0.0005);
      this.sample_A(ctx, A1);

      const A2 = new Complex(0.02 * Math.random() - 0.01, 0.01 * Math.random() - 0.005);
      this.sample_A(ctx, A2);

      const A3 = new Complex(0.2 * Math.random() - 0.1, 0.1 * Math.random() - 0.05);
      this.sample_A(ctx, A3);

      const A4 = new Complex(2 * Math.random() - 1, 1 * Math.random() - 0.5);
      this.sample_A(ctx, A4);

      setTimeout(() => {
         this.setState({cycles: cycles + 1})
         this.draw_sample_recurse(ctx)
      }, 100)
   }

   draw_pixel = (x, y, color, ctx) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, PIXEL_SIZE, PIXEL_SIZE);
   }

   sample_A = (ctx, A) => {
      const {point_count} = this.state;

      const A_squ = A.mul(A);
      const neg_A_squ = A_squ.scale(-1);
      const neg_A = A.scale(-1);
      const p_prep = A_squ.add(A);
      const q_prep = A_squ.add(neg_A);

      const canvas_increment = 2.5 / CANVAS_SIZE;
      const best_magnitudes = new Array(MAX_PATTERNS).fill({magnitude: 1, img_x: -1, img_y: -1})
      for (let img_x = 0; img_x < CANVAS_SIZE; img_x++) {
         const re = -2.0 + img_x * canvas_increment;
         for (let img_y = 0; img_y < CANVAS_SIZE; img_y++) {
            const im = 1.25 - img_y * canvas_increment;
            const x = new Complex(re, im)
            const p = p_prep.add(x);
            const q = q_prep.add(x);

            let ongoing = Object.assign({}, A);
            for (let pattern = 1; pattern < MAX_PATTERNS; pattern++) {
               ongoing = ongoing.mul(ongoing).add(x)
               if (isNaN(ongoing.re) || isNaN(ongoing.im)) {
                  break;
               }
               const D = ongoing.mul(ongoing).add(neg_A_squ);
               const test_1 = D.add(p);
               const test_2 = D.add(q);
               if (test_1.magnitude() < EPSILON) {
                  break;
               }
               if (test_2.magnitude() < EPSILON) {
                  break;
               }
               const result = ongoing.add(neg_A);
               const magnitude = result.magnitude();
               if (magnitude < best_magnitudes[pattern].magnitude) {
                  best_magnitudes[pattern] = {
                     magnitude: magnitude,
                     img_x: img_x,
                     img_y: img_y,
                     re: re,
                     im: im,
                  }
               }
            }
         }
      }
      let added_points = 0;
      const so_far = []
      for (let pattern = 2; pattern < MAX_PATTERNS; pattern++) {
         if (best_magnitudes[pattern].magnitude > LOWER_LIMIT) {
            continue;
         }
         const location_key = `${best_magnitudes[pattern].img_x},${best_magnitudes[pattern].img_y}`
         if (so_far[location_key]) {
            continue;
         }
         so_far[location_key] = true;
         added_points++;
         const color = FractoUtil.fracto_pattern_color(pattern)
         this.draw_pixel(best_magnitudes[pattern].img_x, best_magnitudes[pattern].img_y, color, ctx);
         this.draw_pixel(best_magnitudes[pattern].img_x, (CANVAS_SIZE - best_magnitudes[pattern].img_y) % CANVAS_SIZE, color, ctx);
      }
      this.setState({point_count: point_count + added_points})
   }

   on_click = e => {
      const {canvas_ref} = this.state;
      const canvas_bounds = canvas_ref.current.getBoundingClientRect();
      const canvas_x = e.clientX - canvas_bounds.left;
      const canvas_y = e.clientY - canvas_bounds.top;

      const increment = 2.5 / CANVAS_SIZE;
      const x = -2.0 + canvas_x * increment;
      const y = 1.25 - canvas_y * increment;
      console.log("canvas_x,canvas_y", canvas_x, canvas_y)
      console.log("x,y", x, y)
   }

   render() {
      const {canvas_ref, cycles, point_count} = this.state;
      const canvas_style = {cursor: "crosshair"}
      return [
         <FractoCanvasWrapper
            onClick={e => this.on_click(e)}>
            <FractoCanvas
               ref={canvas_ref}
               style={canvas_style}
               width={CANVAS_SIZE}
               height={CANVAS_SIZE}
            />
         </FractoCanvasWrapper>,
         <InfoText>{`${cycles} (${point_count} points total)`}</InfoText>
      ]
   }

}

export default TestHarness;
