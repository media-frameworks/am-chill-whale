import {Point3d, Vector3d} from "common/math/Vector";

export class HolodeckUtil {

   static to_radians = (angle) => {
      return (0.5 + angle) * (Math.PI / 180);
   }

   static compute_grid_vectors = (controls) => {
      const theta = HolodeckUtil.to_radians(controls.view_angle_deg)
      const h_grid_direction = new Point3d(
         Math.cos(theta + Math.PI / 2),
         Math.sin(theta + Math.PI / 2),
         0
      );
      const inclination = HolodeckUtil.to_radians(controls.inclination_deg)
      const phi = Math.PI / 2 - (inclination - Math.PI);
      const pov_direction = new Point3d(
         Math.sin(phi) * Math.cos(theta),
         Math.sin(phi) * Math.sin(theta),
         Math.cos(phi)
      );
      const null_point = Point3d.nullPoint();
      const pov_vector = Vector3d.scale(
         Vector3d.normalize(
            new Vector3d(null_point, pov_direction)
         ), controls.field_depth
      );
      const h_grid_vector = Vector3d.normalize(new Vector3d(null_point, h_grid_direction));
      const v_grid_vector = Vector3d.normalize(Vector3d.crossProduct(h_grid_vector, pov_vector));

      const grid_vectors = {
         pov_vector: pov_vector,
         v_grid_vector: v_grid_vector,
         h_grid_vector: h_grid_vector,
         pov_sum_squares:
            pov_vector.direction.x * pov_vector.direction.x +
            pov_vector.direction.y * pov_vector.direction.y +
            pov_vector.direction.z * pov_vector.direction.z,
         hy_by_hx: h_grid_vector.direction.y / h_grid_vector.direction.x
      };
      return grid_vectors;
   }

}

export default HolodeckUtil;
