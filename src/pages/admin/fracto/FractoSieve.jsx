import StoreS3 from "../../../common/StoreS3";
import {get_level_tiles, HIGH_QUALITY} from "./FractoData";
import FractoUtil from "./FractoUtil";

export class FractoSieve {

   static v_sieve = (x_index, y, epsilon, values, xy_grid, image_meta) => {

      if (y < image_meta.bounds.bottom || y > image_meta.bounds.top) {
         // console.log("v_sieve exit 1")
         return 0;
      }

      const offset_y = y - image_meta.bounds.bottom;
      const y_index = Math.round(offset_y / image_meta.increment);
      if (y_index >= image_meta.height_px) {
         // console.log("v_sieve exit 2")
         return 0;
      }
      if (xy_grid[x_index][y_index][1] !== 0) {
         // console.log("v_sieve exit 3")
         return 0;
      }

      const difference_y = Math.abs(y_index * image_meta.increment - offset_y);
      if (difference_y > epsilon) {
         // console.log("v_sieve exit 4")
         return 0;
      }

      Object.assign(xy_grid[x_index][y_index], values);
      return 1;
   }

   static point_stacks = {};

   static sieve = (epsilon, xy_grid, image_meta) => {
      let change_count = 0;

      image_meta.stack_indexes.forEach(str_x => {
         const x = parseFloat(str_x);
         const offset_x = x - image_meta.bounds.left;
         const x_index = Math.round(offset_x / image_meta.increment);
         if (!xy_grid[x_index]) {
            return;
         }
         const difference_x = Math.abs(x_index * image_meta.increment - offset_x);
         if (difference_x > epsilon) {
            return;
         }

         let missing_values = false;
         for (let img_y = 0; img_y < image_meta.height_px; img_y++) {
            if (!xy_grid[x_index][img_y][1]) {
               missing_values = true;
               break;
            }
         }
         if (!missing_values) {
            return;
         }

         const stack = FractoSieve.point_stacks[str_x];
         const stack_keys = Object.keys(stack);
         stack_keys.forEach(str_y => {
            const y = parseFloat(str_y);
            if (image_meta.bounds.top > 0) {
               change_count += FractoSieve.v_sieve(x_index, y, epsilon, stack[str_y], xy_grid, image_meta)
            }
            if (image_meta.bounds.bottom < 0) {
               change_count += FractoSieve.v_sieve(x_index, -y, epsilon, stack[str_y], xy_grid, image_meta)
            }
         })

      });

      return change_count;
   }

   static point_sieve = (focal_point, aspect_ratio, scope, width_px) => {

      const height_px = Math.ceil(width_px * aspect_ratio);
      let xy_grid = [];
      for (let img_x = 0; img_x < width_px; img_x++) {
         xy_grid[img_x] = [];
         for (let img_y = 0; img_y < height_px; img_y++) {
            xy_grid[img_x][img_y] = [0, 0];
         }
      }

      const y_scope = scope * aspect_ratio;
      const image_meta = {
         width_px: width_px,
         height_px: height_px,
         stack_indexes: Object.keys(FractoSieve.point_stacks),
         increment: scope / width_px,
         bounds: {
            left: focal_point.x - scope / 2,
            right: focal_point.x + scope / 2,
            top: focal_point.y + y_scope / 2,
            bottom: focal_point.y - y_scope / 2,
         },
      }

      let total = 0;
      const expected_total = width_px * height_px;
      let epsilon = scope / (25 * width_px);
      for (let i = 0; i < 10; i++) {
         const result = FractoSieve.sieve(epsilon, xy_grid, image_meta);
         total += result;
         if (total >= expected_total) {
            console.log(`total=${total}, expected_total=${expected_total}, result=${result}, i=${i}, epsilon=${epsilon}`)
            break;
         }
         epsilon = epsilon * 1.618;
      }

      return xy_grid;
   }

   static find_tiles = (all_tiles, focal_point, aspect_ratio, scope) => {
      const width_by_two = scope / 2;
      const height_by_two = width_by_two * aspect_ratio;
      const viewport = {
         left: focal_point.x - width_by_two,
         top: focal_point.y + height_by_two,
         right: focal_point.x + width_by_two,
         bottom: focal_point.y - height_by_two,
      }
      return all_tiles
         .filter(image => {
            if (!image) {
               return false;
            }
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
   }

   static stack_data = (all_data) => {
      // console.log("FractoSieve.stack_data", all_data)
      if (!all_data.tile_data) {
         return;
      }
      const increment = all_data.tile_data.bounds.size / 256;

      for (let p_index = 0; p_index < all_data.all_points.length; p_index++) {
         const point = all_data.all_points[p_index]
         const x = all_data.tile_data.bounds.left + increment * point.img_x;
         const y = all_data.tile_data.bounds.top - increment * point.img_y;
         const stack_index = `${x}`
         if (!FractoSieve.point_stacks[stack_index]) {
            FractoSieve.point_stacks[stack_index] = {};
         }
         const stack = FractoSieve.point_stacks[stack_index];
         const point_index = `${y}`
         stack[point_index] = [point.pattern, parseInt(point.iterations)]
      }
   }

   static tiles_cache = {};

   static extract = (focal_point, aspect_ratio, scope, width_px, cb, hq = 0) => {

      const all_tiles = get_level_tiles(width_px, scope, hq ? HIGH_QUALITY : 0);
      const visible_tiles = FractoSieve.find_tiles(all_tiles, focal_point, aspect_ratio, scope);
      console.log("visible_tiles", visible_tiles);
      if (!visible_tiles.length) {
         cb([]);
         return;
      }

      let countdown = visible_tiles.length;
      visible_tiles.forEach(tile => {
         const short_code = FractoUtil.get_short_code(tile.code);
         const json_name = `tiles/256/json/${short_code}.json`;
         countdown--;
         console.log(`${countdown} to go...`)
         const is_final = countdown === 0;
         if (!FractoSieve.tiles_cache[short_code]) {
            FractoSieve.tiles_cache[short_code] = 1;
            StoreS3.get_file_async(json_name, "fracto", json_str => {
               if (json_str) {
                  const all_data = JSON.parse(json_str);
                  FractoSieve.stack_data(all_data);
               }
               if (is_final) {
                  const xy_grid = FractoSieve.point_sieve(focal_point, aspect_ratio, scope, width_px)
                  cb(xy_grid);
               }
            });
         } else if (is_final) {
            const xy_grid = FractoSieve.point_sieve(focal_point, aspect_ratio, scope, width_px)
            cb(xy_grid);
         }

      })
   }

}

export default FractoSieve;

