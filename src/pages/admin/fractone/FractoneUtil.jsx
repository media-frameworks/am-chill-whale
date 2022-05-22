export class FractoneUtil {

   static create_mask = (requested_mask_radius) => {
      const mask_radius = requested_mask_radius + 1
      const mask_width = 2 * mask_radius + 1;
      const mask_size = mask_width * mask_width;
      const result_mask = Array(mask_size);

      const increment = 1.0 / mask_width;
      for (let row = 0; row < mask_radius; row++) {
         const row_dist = 0.5 - row * increment;
         const row_dist_squared = row_dist * row_dist;
         const uc_index = mask_radius + row * mask_width;
         const lm_index = row + mask_width * mask_radius;
         const lc_index = mask_radius + (mask_width - row - 1) * mask_width;
         const rm_index = (mask_width - row - 1) + mask_width * mask_radius;
         const center_value = 1 - 2 * row_dist;
         result_mask[uc_index] = center_value;
         result_mask[lm_index] = center_value;
         result_mask[lc_index] = center_value;
         result_mask[rm_index] = center_value;
         for (let col = 0; col < mask_radius; col++) {
            const col_dist = 0.5 - col * increment;
            const col_dist_squared = col_dist * col_dist;
            const point_dist = Math.sqrt(row_dist_squared + col_dist_squared)
            const value = point_dist > 0.5 ? 0 : 1 - 2 * point_dist;
            const ul_quad_index = col + row * mask_width;
            const ur_quad_index = mask_width - col - 1 + row * mask_width;
            const ll_quad_index = col + (mask_width - row - 1) * mask_width;
            const lr_quad_index = mask_width - col - 1 + (mask_width - row - 1) * mask_width;
            result_mask[ul_quad_index] = value;
            result_mask[ur_quad_index] = value;
            result_mask[ll_quad_index] = value;
            result_mask[lr_quad_index] = value;
         }
      }
      result_mask[mask_width * mask_radius + mask_radius] = 1.0;

      // now crop by 1 row/column of all sides
      const requested_mask_width = 2 * requested_mask_radius + 1;
      const final_mask = Array(requested_mask_width * requested_mask_width);
      for (let row = 0; row < requested_mask_width; row++){
         for (let col = 0; col < requested_mask_width; col++){
            const result_mask_index = (row + 1) * mask_width + 1 + col;
            const final_mask_index = row * requested_mask_width + col;
            final_mask[final_mask_index] = result_mask[result_mask_index]
         }
      }
      return final_mask;
   }

}

export default FractoneUtil;
