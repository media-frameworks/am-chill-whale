<?php

ini_set('memory_limit', '-1');
set_time_limit(0);

$point_dirs = scandir(__DIR__ . '/points');

$point_files = [];
foreach($point_dirs as $index => $point_dir) {
    if ($point_dir === '.' || $point_dir === '..') {
        continue;
    }
    $file_path = __DIR__ . "/points/$point_dir/all_points.csv";
    $filesize = filesize($file_path);
    $point_files[] = [
        'point_dir' => $point_dir,
        'file_size' => $filesize
    ];
}

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://dev.mikehallstudio.com:3000/');
header('Access-Control-Allow-Methods: GET,PUT,POST,DELETE,PATCH,OPTIONS');
header('Access-Control-Allow-Headers: *');

echo(json_encode($point_files));


