#!/usr/bin/env node
import {exec} from "child_process";
import fs from "fs";
import fetch from "node-fetch";
import AWS from 'aws-sdk';
import {config} from './admin/aws_creds.js';

var s3 = new AWS.S3(config);
const FRACTO_PREFIX = 'fracto'

console.log("syncing points...");

const get_next_page = (params, results, cb) => {

   console.log(`loading (${results.length} so far}...)`);
   s3.listObjectsV2(params, (err, data) => {
      if (err) {
         console.error("List Dir Error", dir);
         cb(err);
      } else {
         const more_results = results.concat(data.CommonPrefixes);
         if (data.IsTruncated) {
            params.ContinuationToken = data.NextContinuationToken;
            get_next_page(params, more_results, cb);
         }
         else {
            cb(more_results);
         }
      }
   });
}

const list_files_async = (dir, cb) => {
   if (dir.length && dir[dir.length - 1] !== '/') {
      dir += '/';
   }
   let params = {
      Bucket: "mikehallstudio",
      Prefix: FRACTO_PREFIX + '/' + dir,
      Delimiter: "/"
   };

   const results = [];
   get_next_page(params, results, cb);
};

const URL_BASE = "http://dev.mikehallstudio.com/am-chill-whale/src/data/fracto";
const GET_POINTS_URL = `${URL_BASE}/get_points.php`;
const curl_url = `curl ${GET_POINTS_URL}`

let local_point_dirs = null;
exec(curl_url, {maxBuffer: 100000000}, (error, stdout, stderr) => {
   local_point_dirs = JSON.parse(stdout);
   console.log(`received ${local_point_dirs.length} local points`)
});

let remote_point_dirs = null;
const point_dirs = list_files_async('points', results => {
   remote_point_dirs = results;
   console.log(`received ${remote_point_dirs.length} remote points`)
});

const put_file_async = (name, data, cb) => {
   const full_key = `${FRACTO_PREFIX}/${name}`
   if (!data) {
      cb (false);
      return;
   }
   const params = {
      Bucket: "mikehallstudio",
      Key: full_key,
      Body: data,
      ACL: "public-read"
   };
   s3.upload(params, (err, data) => {
      if (err) {
         console.error("S3.upload error", err);
         cb(false);
      }
      if (data) {
         cb(true);
      }
   });
}

const sync_points = (local_point_dirs, remote_point_dirs) => {
   console.log(`processing point differences...`);

   local_point_dirs.forEach(dir => {
      const s3_file = `points/${dir}/all_points.csv`;
   })

}

const interval = setInterval(() => {
   if (local_point_dirs && remote_point_dirs) {
      clearInterval(interval);
      sync_points(local_point_dirs, remote_point_dirs);
      return;
   }
   console.log('.');
}, 5000);
