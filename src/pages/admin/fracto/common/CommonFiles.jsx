import StoreS3 from "common/StoreS3";

export class CommonFiles {

   static load_registry_json = (s3_folder_prefix, cb) => {
      const filepath = `${s3_folder_prefix}/registry.json`;
      StoreS3.remove_from_cache(filepath)
      StoreS3.get_file_async(filepath, "fracto", result => {
         const registry_json = JSON.parse(result);
         cb(registry_json)
      })
   }

   static save_registry_json = (s3_folder_prefix, data, cb) => {
      const filepath = `${s3_folder_prefix}/registry.json`;
      StoreS3.remove_from_cache(filepath)
      StoreS3.put_file_async(filepath, JSON.stringify(data), "fracto", result => {
         cb(true)
      })
   }

}

export default CommonFiles;
