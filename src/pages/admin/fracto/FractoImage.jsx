import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

<<<<<<< HEAD
import {LEVEL_SCOPES} from "./FractoData";
import FractoUtil from "./FractoUtil";
=======
import LEVEL_02 from "../../../data/fracto/json/level_02_complete.json";
import LEVEL_03 from "../../../data/fracto/json/level_03_complete.json";
import LEVEL_04 from "../../../data/fracto/json/level_04_complete.json";
import LEVEL_05 from "../../../data/fracto/json/level_05_complete.json";
import LEVEL_06 from "../../../data/fracto/json/level_06_complete.json";
import LEVEL_07 from "../../../data/fracto/json/level_07_complete.json";
import LEVEL_08 from "../../../data/fracto/json/level_08_complete.json";
import LEVEL_09 from "../../../data/fracto/json/level_09_complete.json";
import LEVEL_10 from "../../../data/fracto/json/level_10_complete.json";
import LEVEL_11 from "../../../data/fracto/json/level_11_complete.json";
import LEVEL_12 from "../../../data/fracto/json/level_12_complete.json";
import LEVEL_13 from "../../../data/fracto/json/level_13_complete.json";
import LEVEL_14 from "../../../data/fracto/json/level_14_complete.json";
import LEVEL_15 from "../../../data/fracto/json/level_15_complete.json";
import LEVEL_16 from "../../../data/fracto/json/level_16_complete.json";
>>>>>>> 1bd7e99733fd1d8211494e53ee3492efd97ae6fe

import StoreS3 from "../../../common/StoreS3";
// import {AppStyles} from "../../../app/AppImports";

<<<<<<< HEAD
=======
const LEVEL_SCOPES = [
   {cells: [], scope: 2.0},
   {cells: [], scope: 1.0},
   {cells: LEVEL_02, scope: 0.5},
   {cells: LEVEL_03, scope: 0.25},
   {cells: LEVEL_04, scope: 0.125},
   {cells: LEVEL_05, scope: 0.0625},
   {cells: LEVEL_06, scope: 0.03125},
   {cells: LEVEL_07, scope: 0.015625},
   {cells: LEVEL_08, scope: 0.0078125},
   {cells: LEVEL_09, scope: 0.00390625},
   {cells: LEVEL_10, scope: 0.001953125},
   {cells: LEVEL_11, scope: 0.0009765625},
   {cells: LEVEL_12, scope: 0.00048828125},
   {cells: LEVEL_13, scope: 0.000244140625},
   {cells: LEVEL_14, scope: 0.0001220703125},
   {cells: LEVEL_15, scope: 0.00006103515625},
   {cells: LEVEL_16, scope: 0.000030517578125},
];

>>>>>>> 1bd7e99733fd1d8211494e53ee3492efd97ae6fe
const FractoCanvas = styled.canvas`
   margin: 0;
`;

const OffScreenCanvas = styled.canvas`
   margin: 0;
   position: fixed;
`;

export class FractoImage extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      aspect_ratio: PropTypes.number,
      focal_point: PropTypes.object,
      scope: PropTypes.number,
      on_click: PropTypes.func,
      on_zoom: PropTypes.func,
      on_ready: PropTypes.func,
   }

   static defaultProps = {
      aspect_ratio: 1,
      focal_point: {x: 0, y: -0.5},
      scope: 2.5,
      on_click: null,
      on_zoom: null,
      on_ready: null,
   };

   state = {
      canvas_ref: React.createRef(),
      scratch_canvas_ref: React.createRef(),
   };

   componentDidMount() {
      const {canvas_ref} = this.state;

      const canvas = canvas_ref.current;
      if (!canvas) {
         console.log('no canvas');
         return;
      }
      const ctx = canvas.getContext('2d');

      this.setState({ctx: ctx});
      this.fill_canvas(ctx)
   }

   componentDidUpdate(prevProps, prevState, snapshot) {
      const {ctx} = this.state;
<<<<<<< HEAD
      // const {focal_point, scope} = this.props;
      this.fill_canvas(ctx);
      // if (focal_point.x !== prevProps.focal_point.x ||
      //    focal_point.y !== prevProps.focal_point.y ||
      //    scope !== prevProps.scope) {
      //    this.fill_canvas(ctx);
      // }
=======
      this.fill_canvas(ctx)
>>>>>>> 1bd7e99733fd1d8211494e53ee3492efd97ae6fe
   }

   find_images = (level_images) => {
      const {aspect_ratio, focal_point, scope} = this.props;
      const width_by_two = scope / 2;
      const height_by_two = width_by_two * aspect_ratio;
      const viewport = {
         left: focal_point.x - width_by_two,
         top: focal_point.y + height_by_two,
         right: focal_point.x + width_by_two,
         bottom: focal_point.y - height_by_two,
      }
      return level_images
         .filter(image => {
            if (image.bounds.right < viewport.left) {
               return false;
            }
            if (image.bounds.left > viewport.right) {
               return false;
            }
            if (image.bounds.top < viewport.bottom) {
               return false;
            }
            if (image.bounds.bottom > viewport.top) {
               return false;
            }
            return true;
         })
         .sort((a, b) => a.inv ? -1 : 1);
   }

<<<<<<< HEAD
   static find_best_level = (scope) => {
      const test_val = scope / 8;
=======
   find_best_level = (scope) => {
      const test_val = scope / 13;
>>>>>>> 1bd7e99733fd1d8211494e53ee3492efd97ae6fe
      for (let i = 0; i < LEVEL_SCOPES.length; i++) {
         if (test_val > LEVEL_SCOPES[i].scope) {
            return i;
         }
      }
      return LEVEL_SCOPES.length - 1;
   }

   static countdown = 0;

<<<<<<< HEAD
   apply_image = (ctx, scratch_ctx, code, bounds, best_level, scratch_canvas) => {
      const {width_px, aspect_ratio, focal_point, scope} = this.props;

      const image_scope = bounds.right - bounds.left;
      const width_portion = image_scope / scope;

      const image_width_px = width_px * width_portion;
      const width_px_by_scope = width_px / scope;
      const viewport_left = focal_point.x - scope / 2;
      const viewport_top = focal_point.y + (aspect_ratio * scope) / 2;

      const short_code = FractoUtil.get_short_code(code);
      const image_name = `/tiles/256/png/${short_code}.png`;
      StoreS3.load_image_async(image_name, "fracto", image_bitmap => {
         FractoImage.countdown--;
         if (image_bitmap) {
            scratch_ctx.drawImage(
               image_bitmap,
               0, // sx,
               0, // sy,
               256, // sWidth,
               256, // sHeight,
               width_px_by_scope * (bounds.left - viewport_left), // dx,
               width_px_by_scope * (viewport_top - bounds.top), // dy,
               image_width_px, // dWidth,
               image_width_px // dHeight
            );
         }
         if (!FractoImage.countdown) {
            const height_px = width_px * aspect_ratio;
            const scope_height = scope * aspect_ratio;
            const below_the_fold = focal_point.y - scope_height / 2;
            const pixels_from_bottom = below_the_fold > 0 ? 0 :
               Math.abs((below_the_fold * height_px) / scope_height);

            ctx.fillStyle = 'lightcoral';
            ctx.fillRect(0, 0, width_px, width_px);
            const lower_portion_height = height_px - pixels_from_bottom;

            ctx.drawImage(scratch_canvas,
               0, 0, width_px, lower_portion_height,
               0, 0, width_px, lower_portion_height);
            if (pixels_from_bottom) {
               // ctx.scale(1, -1);
               // ctx.translate(0, -height_px + pixels_from_bottom);
               // scratch_ctx.translate(0, -lower_portion_height);
               // ctx.drawImage(scratch_canvas,
               //    0, pixels_from_bottom, width_px, lower_portion_height,
               //    50, lower_portion_height, width_px, -lower_portion_height);
            }

         }
      })
   }

   fill_canvas = (ctx) => {
      const {scratch_canvas_ref} = this.state;
      const {width_px, scope, on_ready} = this.props;

      const best_level = FractoImage.find_best_level(scope);
      // console.log("best_level", best_level)
      const images = this.find_images(LEVEL_SCOPES[best_level].cells);

=======
   fill_canvas = (ctx) => {
      const {scratch_canvas_ref} = this.state;
      const {width_px, aspect_ratio, focal_point, scope, on_ready} = this.props;

      const best_level = this.find_best_level(scope);
      console.log("best_level", best_level)
      const images = this.find_images(LEVEL_SCOPES[best_level].cells);

      console.log("find_images", images);
>>>>>>> 1bd7e99733fd1d8211494e53ee3492efd97ae6fe
      if (!images.length) {
         on_ready()
         return;
      }
<<<<<<< HEAD
=======
      const image_scope = images[0].bounds.right - images[0].bounds.left;
      const width_portion = image_scope / scope;

      const image_width_px = width_px * width_portion;
      const viewport_left = focal_point.x - scope / 2;
      const viewport_top = focal_point.y + (aspect_ratio * scope) / 2;
      const width_px_by_scope = width_px / scope;
>>>>>>> 1bd7e99733fd1d8211494e53ee3492efd97ae6fe

      const scratch_canvas = scratch_canvas_ref.current;
      const scratch_ctx = scratch_canvas.getContext('2d');
      scratch_ctx.fillStyle = '#f8f8f8';
      scratch_ctx.fillRect(0, 0, width_px, width_px);

      FractoImage.countdown = images.length;
      for (var i = 0; i < images.length; i++) {
         const code = images[i].code;
<<<<<<< HEAD
         const bounds = Object.assign({}, images[i].bounds);
         this.apply_image(ctx, scratch_ctx, code, bounds, best_level, scratch_canvas)
      }
      if (on_ready) {
         setTimeout(() => {
            on_ready();
         }, 500)
=======
         const code_path = code.replaceAll("-", "/");
         const image_name = `/orbitals/${code_path}/img_${code}_256.jpg`;
         const bounds = Object.assign({}, images[i].bounds);
         StoreS3.load_image_async(image_name, "fracto", image_bitmap => {
            scratch_ctx.drawImage(
               image_bitmap,
               0, // sx,
               0, // sy,
               256, // sWidth,
               256, // sHeight,
               width_px_by_scope * (bounds.left - viewport_left), // dx,
               width_px_by_scope * (viewport_top - bounds.top), // dy,
               image_width_px, // dWidth,
               image_width_px // dHeight
            );
            FractoImage.countdown--;
            if (!FractoImage.countdown) {
               const height_px = width_px * aspect_ratio;
               const scope_height = scope * aspect_ratio;
               const below_the_fold = focal_point.y - scope_height / 2;
               const pixels_from_bottom = below_the_fold > 0 ? 0 :
                  Math.abs((below_the_fold * height_px) / scope_height);

               ctx.fillStyle = 'lightcoral';
               ctx.fillRect(0, 0, width_px, width_px);
               const lower_portion_height = height_px - pixels_from_bottom;

               ctx.drawImage(scratch_canvas,
                  0, 0, width_px, lower_portion_height,
                  0, 0, width_px, lower_portion_height);
               if (pixels_from_bottom) {
                  // ctx.scale(1, -1);
                  // ctx.translate(0, -height_px + pixels_from_bottom);
                  // scratch_ctx.translate(0, -lower_portion_height);
                  // ctx.drawImage(scratch_canvas,
                  //    0, pixels_from_bottom, width_px, lower_portion_height,
                  //    50, lower_portion_height, width_px, -lower_portion_height);
               }

               if (on_ready) {
                  setTimeout(() => {
                     on_ready();
                  }, 250)
               }
            }
         })
>>>>>>> 1bd7e99733fd1d8211494e53ee3492efd97ae6fe
      }
   }

   render() {
      const {canvas_ref, scratch_canvas_ref} = this.state;
      const {width_px, aspect_ratio, on_click, on_zoom} = this.props;
      const height_px = width_px * aspect_ratio;
      const scratch_canvas_style = {
         top: 100000,
      }
      return [
         <FractoCanvas
            ref={canvas_ref}
            onClick={e => {
               if (on_click) {
                  on_click(e);
               }
            }}
            onWheel={e => {
               if (on_zoom) {
                  on_zoom(e);
               }
            }}
            width={width_px}
            height={height_px}
         />,
         <OffScreenCanvas
            ref={scratch_canvas_ref}
            width={width_px}
            height={height_px}
            style={scratch_canvas_style}
         />
      ]
   }

}

export default FractoImage;
