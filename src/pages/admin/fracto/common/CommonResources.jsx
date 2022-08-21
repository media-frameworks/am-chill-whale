import StoreS3 from "common/StoreS3";
import moment from 'moment';

import FractoUtil from "../FractoUtil";
import FractoCalc from "../FractoCalc";

export class CommonResources {

   static store_pattern_data = (s3_folder_prefix, size, data, cb) => {
      const pattern_data = FractoUtil.get_pattern_lists(data);
      const json = JSON.stringify(pattern_data);
      const file_name_json = `${s3_folder_prefix}/patterns/patterns_${size}.json`;
      StoreS3.put_file_async(file_name_json, json, `fracto`, data => {
         console.log("store_pattern_data complete", size);
         CommonResources.list_pattern_files_async(s3_folder_prefix, files => {
            console.log("CommonResources.list_pattern_files_async", files);
            cb (files)
         })
      });
   }

   static store_json_data = (s3_folder_prefix, size, data, cb) => {
      const json = JSON.stringify(data);
      const file_name_json = `${s3_folder_prefix}/json/data_${size}.json`;
      StoreS3.put_file_async(file_name_json, json, `fracto`, data => {
         console.log("store_json_data complete", size);
         CommonResources.list_json_files_async(s3_folder_prefix, files => {
            console.log("CommonResources.list_json_files_async", files);
            cb (files)
         })
      });
   }

   static generate_image = (fracto_values, s3_folder_prefix, canvas_ref, size, data, cb) => {

      const canvas = canvas_ref.current;
      const ctx = canvas.getContext('2d');

      const increment = fracto_values.scope / size;
      const leftmost = fracto_values.focal_point.x - fracto_values.scope / 2;
      const bottommost = fracto_values.focal_point.y - fracto_values.scope / 2;
      for (let img_x = 0; img_x < data.length; img_x++) {
         const column = data[img_x];
         const x = leftmost + increment * img_x;
         for (let img_y = 0; img_y < column.length; img_y++) {
            const y = bottommost + increment * img_y;
            let pixel = column[img_y];
            if (!pixel.length || !pixel[1]) {
               const calculated = FractoCalc.calc(x, y);
               pixel = [calculated.pattern, calculated.iteration]
            }
            ctx.fillStyle = FractoUtil.fracto_pattern_color(pixel[0], pixel[1])
            ctx.fillRect(img_x, size - img_y - 1, 1, 1);
         }
      }

      const blob = FractoUtil.canvas_to_blob(canvas_ref);
      const file_name_png = `${s3_folder_prefix}/png/render_${size}.png`;
      StoreS3.put_file_async(file_name_png, blob, `fracto`, data => {
         console.log("StoreS3.put_file_async", file_name_png);
         CommonResources.list_png_files_async(s3_folder_prefix, files => {
            console.log("CommonResources.list_png_files_async returns", files);
            cb (files)
         })
      });
   }

   static list_png_files_async = (s3_folder_prefix, cb) => {
      const s3_path = `${s3_folder_prefix}/png`;
      StoreS3.list_files_async(s3_path, "fracto", files => {
         const png_files = files.Contents.map(file => {
            const size_px = file.Key.split('_').pop().split('.').shift();
            return {
               size: parseInt(size_px),
               filename: file.Key.replace('fracto/', ''),
               filesize: file.Size,
               modified_time: moment(file.LastModified, 'ddd MMM DD YYYY HH:mm:ss ZZ'),
               modified_str: file.LastModified.toDateString()
            }
         })
         cb(png_files)
      })
   }

   static list_json_files_async = (s3_folder_prefix, cb) => {
      const s3_path = `${s3_folder_prefix}/json`;
      StoreS3.list_files_async(s3_path, "fracto", files => {
         const json_files = files.Contents.map(file => {
            const size_px = file.Key.split('_').pop().split('.').shift();
            return {
               size: parseInt(size_px),
               filename: file.Key.replace('fracto/', ''),
               filesize: file.Size,
               modified_time: moment(file.LastModified, 'ddd MMM DD YYYY HH:mm:ss ZZ'),
               modified_str: file.LastModified.toDateString()
            }
         })
         cb(json_files)
      })
   }

   static list_pattern_files_async = (s3_folder_prefix, cb) => {
      const s3_path = `${s3_folder_prefix}/patterns`;
      StoreS3.list_files_async(s3_path, "fracto", files => {
         const pattern_files = files.Contents.map(file => {
            const size_px = file.Key.split('_').pop().split('.').shift();
            return {
               size: parseInt(size_px),
               filename: file.Key.replace('fracto/', ''),
               filesize: file.Size,
               modified_time: moment(file.LastModified, 'ddd MMM DD YYYY HH:mm:ss ZZ'),
               modified_str: file.LastModified.toDateString()
            }
         })
         cb(pattern_files)
      })
   }
}

export default CommonResources;
