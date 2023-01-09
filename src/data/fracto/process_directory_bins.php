<?php

ini_set('memory_limit', '-1');
set_time_limit(0);

$directiory_complete_dir = __DIR__ . "/directory/complete";
$directiory_new_dir = __DIR__ . "/directory/new";
$directiory_empty_dir = __DIR__ . "/directory/empty";
$directiory_inland_dir = __DIR__ . "/directory/inland";
$directiory_error_dir = __DIR__ . "/directory/error";
$directiory_ready_dir = __DIR__ . "/directory/ready";

$today = date_create();
$backup_dir = __DIR__ . '/directory/backup/' . date_format($today, 'Y-m-d');
if (!file_exists($backup_dir)) {
    exec("mkdir $backup_dir");
}
$base_dir = __DIR__ . '/directory';

function process_bin($bin)
{
    global $backup_dir;
    global $base_dir;

    $file_path = $backup_dir . "/$bin.csv";
    $bin_file = fopen($file_path, "w");
    fwrite($bin_file, "short_code,left,top,right,bottom");

    $bin_dir = __DIR__ . "/directory/$bin";
    $tile_files = scandir($bin_dir);
    $counter = 0;
    foreach ($tile_files as $tile_file) {
        if ($tile_file === '.' || $tile_file === '..') {
            continue;
        }
        $tile_filepath = $bin_dir . "/" . $tile_file;
        if (file_exists($tile_filepath)) {
            $short_code = str_replace(".json", "", $tile_file);
            $tile_bounds = json_decode(file_get_contents($tile_filepath));
            $csv_data = [
                $short_code,
                $tile_bounds->left,
                $tile_bounds->top,
                $tile_bounds->right,
                $tile_bounds->bottom
            ];
            fwrite($bin_file, "\n" . implode(',', $csv_data));

            if ($bin === "complete") {
                $ready_file = $base_dir . '/ready/' . $short_code . '.json';
                if (file_exists($ready_file)) {
                    echo("\n duplicate: $ready_file");
                    unlink($ready_file);
                }
                $new_file = $base_dir . '/new/' . $short_code . '.json';
                if (file_exists($new_file)) {
                    echo("\n duplicate: $new_file");
                    unlink($new_file);
                }
            }
        }
        $counter++;
        if ($counter % 10000 === 0) {
            echo("\n$counter");
        }
    }
    echo("\n$counter\n$bin\n");
    fclose($bin_file);

    exec("cp  $file_path $base_dir");
    exec("chmod 777 $base_dir/$bin.csv");

}

process_bin("complete");
process_bin("new");
process_bin("empty");
process_bin("inland");
process_bin("error");
process_bin("ready");
process_bin("indexed");



