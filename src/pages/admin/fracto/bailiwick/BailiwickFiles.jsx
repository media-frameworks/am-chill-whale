import StoreS3 from "common/StoreS3";

export class BailiwickFiles {

   static load_registry = (cb) => {
      StoreS3.remove_from_cache(`bailiwicks/registry.json`)
      StoreS3.get_file_async("bailiwicks/registry.json", "fracto", result => {
         const all_bailiwicks = JSON.parse(result);
         const bailiwick_files = Object.keys(all_bailiwicks).map(key => {
            return {
               registry_filename: `${key}/registry.json`,
               core_point: {
                  x: all_bailiwicks[key].x,
                  y: all_bailiwicks[key].y,
               },
               pattern: all_bailiwicks[key].pattern
            }
         })
         cb(bailiwick_files)
      })
   }

   static save_registry = (data, filename, cb) => {
      StoreS3.remove_from_cache(filename)
      StoreS3.put_file_async(filename, JSON.stringify(data), "fracto", result => {
         cb(true)
      })
   }

   static new_bailiwick = (core_point, pattern, cb) => {
      const bailiwick_name = `[${core_point.x},${core_point.y}]`;
      const bailiwick_data = {
         pattern: pattern,
         core_point: {
            x: core_point.x,
            y: core_point.y,
         },
         node_cores: []
      }
      StoreS3.put_file_async(`bailiwicks/${bailiwick_name}/registry.json`, JSON.stringify(bailiwick_data), "fracto", result => {
         console.log(`put_file_async ${bailiwick_name} returns`, result);
         if (!result) {
            cb(result);
         }
      })
      let registry = {}
      StoreS3.remove_from_cache(`bailiwicks/registry.json`)
      StoreS3.get_file_async(`bailiwicks/registry.json`, "fracto", response => {
         if (false !== response) {
            registry = JSON.parse(response)
            registry[bailiwick_name] = bailiwick_data.core_point;
            registry[bailiwick_name]["pattern"] = bailiwick_data.pattern;
            StoreS3.put_file_async(`bailiwicks/registry.json`, JSON.stringify(registry), "fracto", result => {
               console.log(`put_file_async bailiwick registry.json returns`, result);
               cb(result);
            })
         } else {
            cb(response);
         }
      })
   }

}

export default BailiwickFiles;
