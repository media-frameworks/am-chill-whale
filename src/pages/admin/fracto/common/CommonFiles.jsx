import StoreS3 from "common/StoreS3";
import {ENTITY_STATUS_PREP} from "../FractoCommon";
import FractoUtil from "../FractoUtil";

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

   static create_draft = (base_folder, draft_name, fracto_values, cb) => {
      const draft_data = {
         name: draft_name,
         fracto_values: fracto_values,
         png_files: [],
         json_files: [],
         pattern_files: [],
         status: ENTITY_STATUS_PREP
      }
      const draft_dirname = FractoUtil.get_dirname_slug(draft_name);
      const s3_folder_prefix = `${base_folder}/${draft_dirname}`;
      CommonFiles.save_registry_json(s3_folder_prefix, draft_data, result => {
         console.log(`CommonFiles.save_registry_json ${s3_folder_prefix} returns`, result);
      })
      let registry = {}
      CommonFiles.load_registry_json(base_folder, response => {
         if (false !== response) {
            registry = Object.assign({}, response);
         }
         registry[draft_name] = draft_dirname;
         CommonFiles.save_registry_json(base_folder, registry, result => {
            console.log(`CommonFiles.save_registry_json ${base_folder} returns`, result);
            cb(result)
         })
      })
   }
}

export default CommonFiles;
