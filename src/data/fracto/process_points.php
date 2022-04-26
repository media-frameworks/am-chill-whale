<?php

ini_set('memory_limit', '-1');

echo("processing point files...\n");

$point_dirs = scandir(__DIR__ . '/points');
$count_dirs = count($point_dirs);

$point_files = [];
<<<<<<< HEAD
$total_count = 0;
=======
>>>>>>> 1bd7e99733fd1d8211494e53ee3492efd97ae6fe
foreach($point_dirs as $index => $point_dir) {
    if ($point_dir === '.' || $point_dir === '..') {
        continue;
    }
    $file_path = __DIR__ . "/points/$point_dir/all_points.csv";

<<<<<<< HEAD
    $contents = explode("\n", file_get_contents($file_path));
    $contents_prior_count = count($contents);
    $all_rows = [];
    $new_contents = [];
    $duplicates = 0;
    foreach ($contents as $line) {
        $values = explode(',', $line);
        if (count($values) < 2) {
            continue;
        }
        $x_index = '[' . $values[0] . ']';
        if (isset($all_rows[$x_index])) {
            $duplicates++;
            continue;
        }
        $all_rows[$x_index] = true;
        $new_contents[] = $line;
    }

    if ($duplicates) {
        echo ("$duplicates duplicates\n");
        file_put_contents($file_path, implode("\n", $new_contents));
    }

    $total_count += count($new_contents);

=======
    $unsorted_file_path = __DIR__ . "/points/$point_dir/all_points_UNSORTED.csv";
    system ("mv $file_path $unsorted_file_path");
    $unsorted_file_size = filesize($unsorted_file_path);
    system ("sort $unsorted_file_path | uniq -u > $file_path");
    $file_size = filesize($file_path);
    system ("rm $unsorted_file_path");
    echo ("$point_dir $unsorted_file_size => $file_size \n");

    $contents = explode("\n", file_get_contents($file_path));
>>>>>>> 1bd7e99733fd1d8211494e53ee3492efd97ae6fe
    $point_files[] = [
        "x" => floatval(trim($point_dir, '[]')),
        'count' => count($contents),
        'point_dir' => $point_dir
    ];

<<<<<<< HEAD
    if ($index % 1000 === 0) {
=======
    if ($index % 100 === 0) {
>>>>>>> 1bd7e99733fd1d8211494e53ee3492efd97ae6fe
        echo ("$index/$count_dirs \n");
    }
}

<<<<<<< HEAD
echo ("$total_count points total\n");
=======
usort($point_files, function ($a, $b) {
    if ($a['x'] > $b['x']) {
        return 1;
    }
    return -1;
});

>>>>>>> 1bd7e99733fd1d8211494e53ee3492efd97ae6fe
file_put_contents(__DIR__ . "/point_files.json", json_encode($point_files));


