#!/usr/bin/env node
import {exec} from "child_process";
import {writeFile} from "fs";

console.log("Hello index_gen!");

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
      console.log("max_iteration", x0, y0)
      pattern = -1;
   }
   return {
      x: x0,
      y: y0,
      pattern: pattern,
      iteration: iteration
   };
}

function pad(num, size) {
   num = num.toString();
   while (num.length < size) num = "0" + num;
   return num;
}

exec("ls -al levels", (error, stdout, stderr) => {
   if (error) {
      console.log(`creating levels dir`);
      exec("mkdir levels");
      exec("chmod 777 levels");
   }
});

const level = process.argv[2]
console.log(`processing level ${level}...`);

const level_dir = pad(level, 2);
exec(`ls -al levels/{level_dir}`, (error, stdout, stderr) => {
   if (error) {
      console.log(`creating levels/${level_dir}`);
      exec(`mkdir levels/${level_dir}`);
      exec(`chmod 777 levels/${level_dir}`);
   }
});

const index_count = 512 * Math.pow(2, level);
const data_count = index_count / 2;
console.log(`index_count = ${index_count}`);

const pad_size = 1 + Math.round(Math.log10(data_count));

const increment = 4.0 / index_count;
console.log(`increment = ${increment}`);

const index_gen_url = "http://dev.mikehallstudio.com/am-chill-whale/src/data/fracto/index_gen.php";
for (let x_index = 1; x_index < index_count; x_index++) {
   const x = -2.0 + increment * x_index;
   if (x > 0.5) {
      break;
   }
   const result_index = {};
   exec(`curl "${index_gen_url}?x=${x}"`, (error, stdout, stderr) => {
      if (error) {
         console.log(`error: ${x}`);
         return;
      }
      const results = JSON.parse(stdout);
      // console.log(`${results.data.length} points`)
      results.data.forEach(line => {
         const values = line.split(',');
         const y = parseFloat(values[0]);
         const y_index = y / increment;
         const delta = Math.abs(y_index - Math.round(y_index));
         if (delta < 0.0000000001) {
            // console.log(`y: ${y}, y_index: ${y_index}`);
            const label = pad(y_index, pad_size);
            result_index[label] = `${values[1]},${values[2]}`
         }
      });

      const result_array = [];
      for (let y_index = 1; y_index < data_count; y_index++) {
         const label = pad(y_index, pad_size);
         if (result_index[label]) {
            result_array.push(result_index[label]);
         }
         else {
            const y = y_index * increment;
            const values = calc(x, y, 1000000);
            if (values.iteration > 10) {
               console.log(`not found: ${x_index}, ${y_index} calc as (${values.pattern},${values.iteration})`);
            }
         }
      }
      const result_file = result_array.join("\n");

      const index_label = pad(x_index, pad_size)
      const file_path = `./levels/${level_dir}/${index_label}.csv`;
      // console.log(file_path);
      writeFile(file_path, result_file, (err) => {
         if (err) {
            console.log(err);
         }
      });

   });
}


