import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {AppStyles} from "app/AppImports";
import StoreS3 from "common/StoreS3";

import {get_level_tiles, get_ideal_level} from "./FractoData";
import FractoUtil from "./FractoUtil";

const FractoCanvas = styled.canvas`
   margin: 0;
`;

const OffScreenCanvas = styled.canvas`
   ${AppStyles.fixed}
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
      // const {focal_point, scope} = this.props;
      this.fill_canvas(ctx);
      // if (focal_point.x !== prevProps.focal_point.x ||
      //    focal_point.y !== prevProps.focal_point.y ||
      //    scope !== prevProps.scope) {
      //    this.fill_canvas(ctx);
      // }
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

   static find_best_level = (scope) => {
      return get_ideal_level (1024, scope);
   }

   static countdown = 0;

   apply_image = (ctx, scratch_ctx, code, bounds, scratch_canvas) => {
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

      const level_tiles = get_level_tiles(width_px, scope)
      const images = this.find_images(level_tiles);

      if (!images.length) {
         if (on_ready) {
            on_ready()
         }
         return;
      }

      const scratch_canvas = scratch_canvas_ref.current;
      const scratch_ctx = scratch_canvas.getContext('2d');
      scratch_ctx.fillStyle = '#f8f8f8';
      scratch_ctx.fillRect(0, 0, width_px, width_px);

      FractoImage.countdown = images.length;
      for (var i = 0; i < images.length; i++) {
         const code = images[i].code;
         const bounds = Object.assign({}, images[i].bounds);
         this.apply_image(ctx, scratch_ctx, code, bounds, scratch_canvas)
      }
      if (on_ready) {
         setTimeout(() => {
            on_ready();
         }, 1000)
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
