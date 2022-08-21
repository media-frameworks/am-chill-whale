import StoreS3 from "common/StoreS3";

import FractoUtil from "../FractoUtil";
import {ENTITY_STATUS_PREP} from "../FractoCommon";

export const OBSERVATORY_DIRNAME = "studies"

export class ObservatoryFiles {

   static load_registry = (cb) => {
      const filepath = `${OBSERVATORY_DIRNAME}/registry.json`;
      StoreS3.remove_from_cache(filepath)
      StoreS3.get_file_async(filepath, "fracto", result => {
         const all_field_studies = JSON.parse(result);
         cb(all_field_studies)
      })
   }

   static save_registry = (data, cb) => {
      const filepath = `${OBSERVATORY_DIRNAME}/registry.json`;
      StoreS3.remove_from_cache(filepath)
      StoreS3.put_file_async(filepath, JSON.stringify(data), "fracto", result => {
         cb(true)
      })
   }

   static load_field_study = (field_study_name, cb) => {
      const field_study_dirname = FractoUtil.get_dirname_slug(field_study_name);
      const filepath = `${OBSERVATORY_DIRNAME}/${field_study_dirname}/registry.json`;
      StoreS3.remove_from_cache(filepath)
      StoreS3.get_file_async(filepath, "fracto", result => {
         const field_study = JSON.parse(result);
         cb(field_study)
      })
   }

   static save_field_study = (field_study_name, data, cb) => {
      const field_study_dirname = FractoUtil.get_dirname_slug(field_study_name);
      const filepath = `${OBSERVATORY_DIRNAME}/${field_study_dirname}/registry.json`;
      StoreS3.remove_from_cache(filepath)
      StoreS3.put_file_async(filepath, JSON.stringify(data), "fracto", result => {
         cb(true)
      })
   }

   static new_field_study = (fracto_values, field_study_name, cb) => {
      const field_study_dirname = FractoUtil.get_dirname_slug(field_study_name);
      const field_study_data = {
         name: field_study_name,
         fracto_values: fracto_values,
         png_files: [],
         json_files: [],
         pattern_files: [],
         status: ENTITY_STATUS_PREP
      }
      const s3_path = `${OBSERVATORY_DIRNAME}/${field_study_dirname}/registry.json`;
      StoreS3.put_file_async(s3_path, JSON.stringify(field_study_data), "fracto", result => {
         console.log(`put_file_async ${s3_path} returns`, result);
         if (!result) {
            cb(result);
            return;
         }
      })
      let registry = {}
      StoreS3.remove_from_cache(`${OBSERVATORY_DIRNAME}/registry.json`)
      StoreS3.get_file_async(`${OBSERVATORY_DIRNAME}/registry.json`, "fracto", response => {
         if (false !== response) {
            registry = JSON.parse(response)
         }
         registry[field_study_name] = field_study_dirname;
         StoreS3.put_file_async(`${OBSERVATORY_DIRNAME}/registry.json`, JSON.stringify(registry), "fracto", result => {
            console.log(`put_file_async field_study registry.json returns`, result);
            cb(result);
         })
      })
   }

}

export default ObservatoryFiles;
