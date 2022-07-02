import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {PHI} from "common/math/constants";
import {Point3d} from "common/math/Vector";

const DEFAULT_FOCAL_X = -0.625001;

const HolodeckCanvas = styled.canvas`
   position: fixed;
`;

export class HolodeckStage extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      controls: PropTypes.object.isRequired,
      grid_vectors: PropTypes.object.isRequired,
      all_triangles: PropTypes.array.isRequired,
      update_region: PropTypes.func.isRequired,
   };

   static defaultProps = {}

   state = {
      ctx: null,
      height_px: this.props.width_px / PHI,
      canvas_ref: React.createRef(),
   }

   componentDidMount() {
      const {canvas_ref} = this.state;
      const canvas = canvas_ref.current;
      if (!canvas) {
         console.log('no canvas');
         return;
      }
      const ctx = canvas.getContext('2d');
      this.setState({ctx: ctx});

      this.render_data(ctx)
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      const {ctx} = this.state;
      this.render_data(ctx)
   }

   static canvas_cache = {};

   canvas_point = (Q) => {
      const {grid_vectors} = this.props;
      const q_key = `[${Q.x},${Q.y},${Q.z}]`;
      if (HolodeckStage.canvas_cache[q_key]) {
         return HolodeckStage.canvas_cache[q_key];
      }
      const P = grid_vectors.pov_vector.direction;
      const sum_products = P.x * Q.x + P.y * Q.y + P.z * Q.z;
      const t = 1.0 / (1.0 - (grid_vectors.pov_sum_squares / sum_products));
      const x_t = (1.0 - t) * Q.x + t * P.x;
      const y_t = (1.0 - t) * Q.y + t * P.y;
      const V = grid_vectors.v_grid_vector.direction;
      const H = grid_vectors.h_grid_vector.direction;
      const B = (y_t - grid_vectors.hy_by_hx * x_t) / (V.y - grid_vectors.hy_by_hx * V.x);
      const A = (x_t - B * V.x) / H.x;
      const result = {h: A, v: B};
      HolodeckStage.canvas_cache[q_key] = result;
      return result;
   }

   render_grid = (ctx, SCALE, H_OFFSET, V_OFFSET) => {
      ctx.strokeStyle = "#999999";
      for (let grid_x = -2.0; grid_x <= 2.0; grid_x += 0.1) {
         for (let grid_y = -2.0; grid_y <= 2.0; grid_y += 0.1) {

            const first_point = this.canvas_point({x: grid_x + 0.1, y: grid_y, z: 0})
            const second_point = this.canvas_point({x: grid_x, y: grid_y, z: 0})
            const third_point = this.canvas_point({x: grid_x, y: grid_y + 0.1, z: 0})

            const region = new Path2D();
            region.moveTo(H_OFFSET + SCALE * first_point.h, V_OFFSET + SCALE * first_point.v);
            region.lineTo(H_OFFSET + SCALE * second_point.h, V_OFFSET + SCALE * second_point.v);
            region.lineTo(H_OFFSET + SCALE * third_point.h, V_OFFSET + SCALE * third_point.v);
            ctx.stroke(region);
         }
      }
   }

   render_data = (ctx) => {
      const {height_px} = this.state;
      const {controls, grid_vectors, all_triangles, width_px, update_region} = this.props;
      ctx.fillStyle = '#cccccc';
      ctx.fillRect(0, 0, width_px, height_px);

      const SCALE = controls.field_span_deg * 5 * 99;
      const H_OFFSET = width_px / 2;
      const V_OFFSET = height_px / 2;

      this.render_grid(ctx, SCALE, H_OFFSET, V_OFFSET)

      const focal_point = {
         x: -grid_vectors.pov_vector.direction.x,
         y: -grid_vectors.pov_vector.direction.y,
         z: -grid_vectors.pov_vector.direction.z,
      }
      const translation = {
         x: -controls.focal_x,
         y: -controls.focal_y,
         z: 0,
      }

      const canvas_triangles = [];
      HolodeckStage.canvas_cache = {};
      all_triangles.forEach(t => {

         const first_point = this.canvas_point(Point3d.sum(t.points[0], translation))
         const second_point = this.canvas_point(Point3d.sum(t.points[1], translation))
         const third_point = this.canvas_point(Point3d.sum(t.points[2], translation))

         const first_point_h = H_OFFSET + SCALE * first_point.h;
         const second_point_h = H_OFFSET + SCALE * second_point.h;
         const third_point_h = H_OFFSET + SCALE * third_point.h;

         if (first_point_h < 0 && second_point_h < 0 && third_point_h < 0) {
            return;
         }
         if (first_point_h > width_px && second_point_h > width_px && third_point_h > width_px) {
            return;
         }

         const first_point_v = V_OFFSET + SCALE * first_point.v;
         const second_point_v = V_OFFSET + SCALE * second_point.v;
         const third_point_v = V_OFFSET + SCALE * third_point.v;

         if (first_point_v < 0 && second_point_v < 0 && third_point_v < 0) {
            return;
         }
         if (first_point_v > height_px && second_point_v > height_px && third_point_v > height_px) {
            return;
         }

         canvas_triangles.push({
            distance: 0,
            triangle: [
               {h: first_point_h, v: first_point_v},
               {h: second_point_h, v: second_point_v},
               {h: third_point_h, v: third_point_v},
            ],
            base_triangle: t
         });

      });

      const render_region = {top: -25, bottom: 25, left: 25, right: -25}
      canvas_triangles.forEach(c_t => {
         c_t.distance = Point3d.magnitude(
            Point3d.difference(
               Point3d.sum(c_t.base_triangle.points[0], translation),
               focal_point
            )
         )
         if (c_t.base_triangle.points[0].y > render_region.top) {
            render_region.top = c_t.base_triangle.points[0].y;
         }
         if (c_t.base_triangle.points[0].y < render_region.bottom) {
            render_region.bottom = c_t.base_triangle.points[0].y;
         }
         if (c_t.base_triangle.points[0].x < render_region.left) {
            render_region.left = c_t.base_triangle.points[0].x;
         }
         if (c_t.base_triangle.points[0].x > render_region.right) {
            render_region.right = c_t.base_triangle.points[0].x;
         }
         if (c_t.base_triangle.points[1].y > render_region.top) {
            render_region.top = c_t.base_triangle.points[1].y;
         }
         if (c_t.base_triangle.points[1].y < render_region.bottom) {
            render_region.bottom = c_t.base_triangle.points[1].y;
         }
         if (c_t.base_triangle.points[1].x < render_region.left) {
            render_region.left = c_t.base_triangle.points[1].x;
         }
         if (c_t.base_triangle.points[1].x > render_region.right) {
            render_region.right = c_t.base_triangle.points[1].x;
         }
      });
      console.log("render_region",render_region)
      update_region(render_region)

      canvas_triangles.sort((a, b) => a.distance - b.distance)
         .forEach(c_t => {

            ctx.beginPath();
            ctx.moveTo(c_t.triangle[0].h, c_t.triangle[0].v);
            ctx.lineTo(c_t.triangle[1].h, c_t.triangle[1].v);
            ctx.lineTo(c_t.triangle[2].h, c_t.triangle[2].v);
            ctx.closePath();

            ctx.strokeStyle = c_t.base_triangle.color;
            ctx.stroke();
            ctx.fillStyle = c_t.base_triangle.color;
            ctx.fill();
         });
   }

   render() {
      const {canvas_ref, height_px} = this.state;
      const {width_px} = this.props;
      return <HolodeckCanvas
         ref={canvas_ref}
         width={`${width_px}px`}
         height={`${height_px}px`}
      />
   }
}

export default HolodeckStage;
