import StoreS3 from "common/StoreS3";

import FractoUtil from "../FractoUtil";

export class BurrowFiles {

   static load_registry = (cb) => {
      StoreS3.remove_from_cache(`burrows/registry.json`)
      StoreS3.get_file_async("burrows/registry.json", "fracto", result => {
         const all_burrows = JSON.parse(result);
         cb(all_burrows)
      })
   }

   static save_registry = (data, filename, cb) => {
      StoreS3.remove_from_cache(filename)
      StoreS3.put_file_async(filename, JSON.stringify(data), "fracto", result => {
         cb(true)
      })
   }

   static get_burrow_slug = (name) => {
      return name
         .toLowerCase()
         .trim()
         .replace(/[^\w\s-]/g, '')
         .replace(/[\s_-]+/g, '-')
         .replace(/^-+|-+$/g, '');
   }

   static new_burrow = (fracto_values, burrow_name, cb) => {
      const burrow_dirname = FractoUtil.get_dirname_slug(burrow_name);
      const burrow_data = {
         name: burrow_name,
         initial_values: fracto_values,
         steps: []
      }
      const s3_path = `burrows/${burrow_dirname}/registry.json`;
      StoreS3.put_file_async(s3_path, JSON.stringify(burrow_data), "fracto", result => {
         console.log(`put_file_async ${s3_path} returns`, result);
         if (!result) {
            cb(result);
            return;
         }
      })
      let registry = {}
      StoreS3.remove_from_cache(`burrows/registry.json`)
      StoreS3.get_file_async(`burrows/registry.json`, "fracto", response => {
         if (false !== response) {
            registry = JSON.parse(response)
         }
         registry[burrow_name] = burrow_dirname;
         StoreS3.put_file_async(`burrows/registry.json`, JSON.stringify(registry), "fracto", result => {
            console.log(`put_file_async burrow registry.json returns`, result);
            cb(result);
         })
      })
   }

}

export default BurrowFiles;
