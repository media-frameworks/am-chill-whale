<?php

ini_set('memory_limit', '-1');

echo("processing point files...\n");

$point_dirs = scandir(__DIR__ . '/points');
$count_dirs = count($point_dirs);

$point_files = [];
foreach($point_dirs as $index => $point_dir) {
    if ($point_dir === '.' || $point_dir === '..') {
        continue;
    }
    $file_path = __DIR__ . "/points/$point_dir/all_points.csv";

    $unsorted_file_path = __DIR__ . "/points/$point_dir/all_points_UNSORTED.csv";
    system ("mv $file_path $unsorted_file_path");
    $unsorted_file_size = filesize($unsorted_file_path);
    system ("sort $unsorted_file_path | uniq -u > $file_path");
    $file_size = filesize($file_path);
    system ("rm $unsorted_file_path");
    echo ("$point_dir $unsorted_file_size => $file_size \n");

    $contents = explode("\n", file_get_contents($file_path));
    $point_files[] = [
        "x" => floatval(trim($point_dir, '[]')),
        'count' => count($contents),
        'point_dir' => $point_dir
    ];

    if ($index % 100 === 0) {
        echo ("$index/$count_dirs \n");
    }
}

usort($point_files, function ($a, $b) {
    if ($a['x'] > $b['x']) {
        return 1;
    }
    return -1;
});

file_put_contents(__DIR__ . "/point_files.json", json_encode($point_files));


