<?php

ini_set('memory_limit', '-1');

echo("processing point files...\n");

$point_dirs = scandir(__DIR__ . '/points');
$count_dirs = count($point_dirs);

$point_files = [];
$total_count = 0;
foreach($point_dirs as $index => $point_dir) {
    if ($point_dir === '.' || $point_dir === '..') {
        continue;
    }
    $file_path = __DIR__ . "/points/$point_dir/all_points.csv";

    $contents = explode("\n", file_get_contents($file_path));
    $contents_prior_count = count($contents);
    $all_rows = [];
    $new_contents = [];
    foreach ($contents as $line) {
        $values = explode(',', $line);
        if (count($values) < 2) {
            continue;
        }
        $x_index = '[' . $values[0] . ']';
        if (isset($all_rows[$x_index])) {
            continue;
        }
        $all_rows[$x_index] = true;
        $new_contents[] = $line;
    }

    file_put_contents($file_path, implode("\n", $new_contents));

    $total_count += count($new_contents);

    $point_files[] = [
        "x" => floatval(trim($point_dir, '[]')),
        'count' => count($contents),
        'point_dir' => $point_dir
    ];

    if ($index % 100 === 0) {
        echo ("$index/$count_dirs \n");
    }
}

echo ("$total_count points total\n");
file_put_contents(__DIR__ . "/point_files.json", json_encode($point_files));


