import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

// import {AppStyles} from "app/AppImports";
import StoreS3 from "common/StoreS3";

import FractoData, {get_ideal_level, get_level_scope} from "./FractoData";
import FractoUtil from "./FractoUtil";

const FractoCanvas = styled.canvas`
   margin: 0;
`;

export class FractoActiveImage extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      aspect_ratio: PropTypes.number,
      focal_point: PropTypes.object,
      scope: PropTypes.number,
      on_click: PropTypes.func,
      on_zoom: PropTypes.func,
      on_ready: PropTypes.func,
      on_move: PropTypes.func,
      level: PropTypes.number,
   }

   static defaultProps = {
      aspect_ratio: 1,
      focal_point: {x: -0.75, y: 0},
      scope: 2.5,
      on_click: null,
      on_zoom: null,
      on_ready: null,
      on_move: null,
      level: 0,
   };

   state = {
      canvas_ref: React.createRef(),
      loading_tiles: false
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
      if (prevProps.focal_point === this.props.focal_point && prevProps.scope === this.props.scope) {
         return;
      }
      this.fill_canvas(ctx);
   }

   static tile_cache = {};

   load_all_tiles_async = (tiles, cb) => {
      this.setState({loading_tiles: true});

      let loaded = 0;
      const loaded_tiles = new Array(tiles.length)
      for (let tile_index = 0; tile_index < tiles.length; tile_index++) {
         const short_code = tiles[tile_index].short_code;
         if (FractoActiveImage.tile_cache[short_code]) {
            loaded_tiles[tile_index] = FractoActiveImage.tile_cache[short_code];
            loaded = loaded + 1;
            if (loaded === tiles.length) {
               cb(loaded_tiles);
               this.setState({loading_tiles: false});
            }
         } else {
            const filepath = `tiles/256/indexed/${short_code}.json`
            StoreS3.get_file_async(filepath, "fracto", data => {
               // console.log("StoreS3.get_file_async", filepath);
               if (!data) {
                  console.log("data error");
                  this.setState({loading_tiles: false});
                  cb(0);
               }
               loaded_tiles[tile_index] = JSON.parse(data);
               FractoActiveImage.tile_cache[short_code] = loaded_tiles[tile_index];
               loaded = loaded + 1;
               if (loaded === tiles.length) {
                  cb(loaded_tiles);
                  this.setState({loading_tiles: false});
               }
            })
         }
      }

   }

   fill_canvas = (ctx) => {
      const {loading_tiles} = this.state;
      const {width_px, focal_point, aspect_ratio, scope, on_ready, level} = this.props;

      if (loading_tiles) {
         return;
      }
      const height_px = aspect_ratio * width_px;

      const ideal_level = !level ? get_ideal_level(width_px, scope) : level;
      const level_scope = get_level_scope(ideal_level);
      const tiles = FractoData.tiles_in_scope(ideal_level, focal_point, scope, aspect_ratio)
      console.log("tiles = FractoData.tiles_in_scope(ideal_level, focal_point, scope, aspect_ratio)", tiles, ideal_level, focal_point, scope, aspect_ratio)

      const QUALITY_FACTOR = 1.25;
      const PIXEL_SIZE = 1.5 / QUALITY_FACTOR;
      const SCOPE_FACTOR = 128 / level_scope;

      const increment = scope / (QUALITY_FACTOR * width_px);

      this.load_all_tiles_async(tiles, loaded => {
         ctx.fillStyle = 'white';
         ctx.fillRect(0, 0, width_px, height_px);

         // console.log("load_all_tiles_async, tile count:", tiles.length)
         const scope_by_two = scope / 2;
         let x = focal_point.x - scope_by_two - increment;
         for (let img_x = 0; img_x < width_px * QUALITY_FACTOR; img_x++) {
            const PIXEL_X = img_x / QUALITY_FACTOR;
            x = x + increment
            let y = focal_point.y + scope_by_two * aspect_ratio;
            for (let img_y = 0; img_y < height_px * QUALITY_FACTOR; img_y++) {
               const PIXEL_Y = img_y / QUALITY_FACTOR;
               y = y - increment;
               const tile_index = tiles.findIndex(tile =>
                  x > tile.bounds.left &&
                  x <= tile.bounds.right &&
                  Math.abs(y) < tile.bounds.top &&
                  Math.abs(y) >= tile.bounds.bottom)
               if (!loaded[tile_index]) {
                  continue;
               } else {
                  const x_index = Math.floor(SCOPE_FACTOR * (x - tiles[tile_index].bounds.left));
                  const y_index = Math.floor(SCOPE_FACTOR * (tiles[tile_index].bounds.top - Math.abs(y)));
                  if (!loaded[tile_index][x_index]) {
                     continue;
                  }
                  const point_data = loaded[tile_index][x_index][y_index];
                  if (!point_data) {
                     continue;
                  }
                  ctx.fillStyle = FractoUtil.fracto_pattern_color(point_data[0], point_data[1])
                  ctx.fillRect(PIXEL_X, PIXEL_Y, PIXEL_SIZE, PIXEL_SIZE);
               }
            }
         }
         if (on_ready) {
            // setTimeout(() => {
            on_ready();
            // }, 100)
         }
      })

   }

   render() {
      const {canvas_ref, loading_tiles} = this.state;
      const {width_px, aspect_ratio, on_click, on_zoom, on_move} = this.props;
      const height_px = width_px * aspect_ratio;
      const canvas_style = {cursor: loading_tiles ? "wait" : "crosshair"}
      return [
         <FractoCanvas
            ref={canvas_ref}
            style={canvas_style}
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
            onMouseMove={e => {
               if (on_move) {
                  on_move(e);
               }
            }}
            onMouseOut={e => {
               if (on_move) {
                  on_move(0);
               }
            }}
            width={width_px}
            height={height_px}
         />
      ]
   }
}

export default FractoActiveImage;
