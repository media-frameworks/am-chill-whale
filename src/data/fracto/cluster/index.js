#!/usr/bin/env node
import {exec} from "child_process";
import fs from "fs";
import fetch from "node-fetch";
import node_canvas from 'canvas';
import { Blob } from 'buffer'
import AWS from 'aws-sdk';

const config = {
   "region": "us-east-1",
   "accessKeyId": "AKIA5HXFVFNNGDIEUIPJ",
   "secretAccessKey": "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",
   "apiVersion": "latest"
}
var s3 = new AWS.S3(config);

const URL_BASE = "http://dev.mikehallstudio.com/am-chill-whale/src/data/fracto";
const PREPARE_CLUSTER_URL = `${URL_BASE}/prepare_cluster.php`;
const GENERATE_TILE_URL = `${URL_BASE}/generate_tile.php`;
const FILL_POINTS_URL = `${URL_BASE}/fill_points.php`;
const SET_TILE_STATUS_URL = `${URL_BASE}/set_tile_status.php`;

const IMAGE_SIZE_PX = 256;
const EXPECTED_PIXEL_COUNT = (IMAGE_SIZE_PX * IMAGE_SIZE_PX - 1024);
const MAX_ITERATIONS = 1000000;

const pad = (num, size) => {
   num = num.toString();
   while (num.length < size) num = "0" + num;
   return num;
}

const fracto_log = (text) => {
   const m = new Date();
   const dateString =
      m.getUTCFullYear() + "/" +
      ("0" + (m.getUTCMonth() + 1)).slice(-2) + "/" +
      ("0" + m.getUTCDate()).slice(-2) + " " +
      ("0" + m.getUTCHours()).slice(-2) + ":" +
      ("0" + m.getUTCMinutes()).slice(-2) + ":" +
      ("0" + m.getUTCSeconds()).slice(-2);
   console.log(`${dateString}: ${text}`);
}

const fracto_return = (reason) => {
   fracto_log(reason);
   fracto_log("exiting");
   process.exit();
}

const calc = (x0, y0, max_iteration) => {
   let x = 0;
   let y = 0;
   let iteration = 0;
   let x_squared = 0;
   let y_squared = 0;
   let pattern = 0;
   const previously = {};
   while (x_squared + y_squared < 100 && iteration < max_iteration) {
      y = 2 * x * y + y0;
      x = x_squared - y_squared + x0;
      const position_slug = `${x},${y}`;
      if (previously[position_slug]) {
         pattern = iteration - previously[position_slug];
         break;
      } else {
         previously[position_slug] = iteration;
      }
      x_squared = x * x;
      y_squared = y * y;
      iteration++;
   }
   if (iteration >= max_iteration) {
      fracto_log(`max_iteration at ${x0}, ${y0}`)
      pattern = -1;
   }
   return {
      x: x0,
      y: y0,
      pattern: pattern,
      iteration: iteration
   };
}

const generate_tile = (code, is_retry = true) => {
   fetch(`${GENERATE_TILE_URL}?code=${code}`)
      .then(response => response.json())
      .then(tile => {
         fracto_log(`tile loaded for ${tile.code} ${is_retry ? '...again!' : ''}`);
         fracto_log(`all_points.length is ${tile.all_points.length}`);
         if (tile.all_points.length < EXPECTED_PIXEL_COUNT && !is_retry) {
            complete_tile(tile);
         } else {
            if (tile.all_points.length < EXPECTED_PIXEL_COUNT) {
               error_tile(tile)
            } else if (tile.max_iterations > 20) {
               const canvas = render_image(tile);
               publish_tile(tile, canvas)
            } else {
               fracto_log(`tile.max_iterations is ${tile.max_iterations}, popping next...`);
               pop_tile();
            }
         }
      });
}

const get_hash_value = (img_x, img_y) => {
   return `${img_x},${img_y}`;
}

const complete_tile = (tile) => {
   const code = tile.tile_data.code;
   fracto_log(`completing ${code}...`)
   fracto_log(`${EXPECTED_PIXEL_COUNT - tile.all_points.length} points to complete`)

   const points_hash = {};
   tile.all_points.forEach(data => {
      const hash_value = get_hash_value(data.img_x, data.img_y);
      points_hash[hash_value] = true;
   })
   const increment = tile.tile_data.bounds.size / IMAGE_SIZE_PX;
   const points_to_complete = [];
   for (let img_x = 0; img_x < IMAGE_SIZE_PX; img_x++) {
      const x = tile.tile_data.bounds.left + img_x * increment;
      for (let img_y = 0; img_y < IMAGE_SIZE_PX; img_y++) {
         const hash_value = get_hash_value(img_x, img_y);
         if (points_hash[hash_value]) {
            continue;
         }
         const y = tile.tile_data.bounds.top - img_y * increment;
         const tile_result = calc(x, y, MAX_ITERATIONS);
         points_to_complete.push(tile_result);
      }
   }

   const body_data = JSON.stringify(points_to_complete);
   fetch(FILL_POINTS_URL, {
      body: body_data, // data you send.
      headers: {
         'Content-Type': 'application/json',
         'Access-Control-Allow-Origin': '*'
      },
      method: 'POST',
      mode: 'cors'
   }).then(function (response) {
      if (response.body) {
         return response.json();
      }
      return ["fail"];
   }).then(function (json) {
      fracto_log(`fill_points result: ${Object.keys(json.results).length} indexes`);
      generate_tile(code);
   });
}

const fracto_pattern_color = (pattern, iterations) => {
   if (pattern === -1) {
      return 'black'
   }
   if (pattern === 0) {
      const lum = 1.0 - Math.log(iterations) / Math.log(10000);
      return `hsl(0, 0%, ${Math.round(100 * lum)}%)`;
   }

   const log2 = Math.log2(pattern);
   const hue = pattern ? 360 * (log2 - Math.floor(log2)) : 0;
   const lum = 0.15 + 0.75 * Math.log(iterations) / Math.log(1000000);

   return `hsl(${Math.round(hue)}, 75%, ${Math.round(100 * lum)}%)`;
}

const render_image = (tile) => {
   fracto_log(`rendering ${tile.tile_data.code}...`);

   const canvas = node_canvas.createCanvas(256, 256);
   const ctx = canvas.getContext('2d');

   tile.all_points.forEach(point => {
      const color = fracto_pattern_color(point.pattern, point.iterations)
      ctx.fillStyle = color;
      ctx.fillRect(point.img_x, point.img_y, 1, 1);
   });

   return canvas;
}

const error_tile = (tile) => {
   fracto_log(`tile in error: ${tile.tile_data.code}`)
   pop_tile();
}

const get_short_code = (long_code) => {
   return long_code
      .replaceAll('11', '3')
      .replaceAll('10', '2')
      .replaceAll('01', '1')
      .replaceAll('00', '0')
      .replaceAll('-', '')
}

const canvas_to_blob = (canvas, type = "image/png") => {
   const dataUrl = canvas.toDataURL(type);
   const binary = atob(dataUrl.split(',')[1]);
   let array = [];
   for (var i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
   }
   return new Uint8Array(array);
}

const put_file_async = (name, data, prefix = S3_PREFIX, cb) => {
   const full_key = `${prefix}/${name}`
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
         // console.log("S3.upload", full_key);
         cb(true);
      }
   });
}

const publish_tile = (tile, canvas) => {
   const code = tile.tile_data.code;
   fracto_log(`publishing ${code}...`)
   const short_code = get_short_code(code);

   const blob = canvas_to_blob(canvas);
   const file_name_png = `${short_code}.png`;
   put_file_async(file_name_png, blob, `fracto/tiles/${IMAGE_SIZE_PX}/png`, data => {
      fracto_log(`publish png complete: ${data}`);
      const image_url = `https://mikehallstudio.s3.amazonaws.com/fracto/tiles/256/png/${short_code}.png`
      fracto_log(`image url: ${image_url}`);
   });

   const json = JSON.stringify(tile);
   const file_name_json = `${short_code}.json`;
   put_file_async(file_name_json, json, `fracto/tiles/${IMAGE_SIZE_PX}/json`, data => {
      fracto_log(`publish json complete: ${data}`);
      fetch(`${SET_TILE_STATUS_URL}?code=${code}&status=complete`)
         .then(response => response.json())
         .then(results => {
            fracto_log(`set_tile_status.php returns: ${results.operation}`);
            pop_tile();
         });
   });
}

const pop_tile = () => {

   const files = fs.readdirSync('./tiles_to_process');
   files.sort(function (a, b) {
      return a.localeCompare(b);
   });

   const file_path = `./tiles_to_process/${files[0]}`;
   const tile = JSON.parse(fs.readFileSync(file_path));
   fracto_log(`============`);
   fracto_log(`file: ${files[0]}`);
   fracto_log(`code: ${tile.code}`);
   fracto_log(`bounds.left: ${tile.bounds.left}`);
   fracto_log(`bounds.top: ${tile.bounds.top}`);

   exec(`mv ${file_path} ./tiles_to_process/processed/${files[0]}`)

   generate_tile(tile.code, false);
}

const level = process.argv[2];
if (!level) {
   fracto_return("level is not defined");
}

const operation = process.argv[3];

if (operation === 'prepare') {
   fracto_log(`preparing level ${level}...`)

   const start_index = process.argv[4];
   if (!start_index) {
      fracto_return("start_index is not defined");
   }

   fracto_log(`requesting tiles...`)
   const curl_url = `curl ${PREPARE_CLUSTER_URL}?level=${level}`;
   fracto_log(curl_url)

   exec(curl_url, {maxBuffer: 10000000}, (error, stdout, stderr) => {
      if (error) {
         fracto_log(`error: ${error}`);
         return;
      }
      const all_tiles = JSON.parse(stdout);
      fracto_log(`${all_tiles.tiles.length} tiles received`);

      exec(`rm ./tiles_to_process/*.json`);
      exec(`rm ./tiles_to_process/processed/*.json`);

      const subset_tiles = all_tiles.tiles.slice(start_index);
      subset_tiles.forEach((tile, tile_index) => {
         const padded_index = pad(tile_index, 8);
         const file_path = `./tiles_to_process/${padded_index}.json`;
         const result_file = JSON.stringify(tile);

         fs.writeFileSync(file_path, result_file);

         if (!(tile_index % 10000)) {
            fracto_log(tile_index);
         }
      })
   });

} else {

   fracto_log(`processing level ${level}...`);

   pop_tile();

}

