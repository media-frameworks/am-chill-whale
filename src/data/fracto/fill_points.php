<?php

ini_set('memory_limit', '-1');
set_time_limit(0);

$points_data = file_get_contents('php://input');
$points = json_decode($points_data, true);

//$file_contents = [];
$results = [];
$added = [];

//$point_files = json_decode(file_get_contents($point_files_path));
$point_files = [];

//$changed_point_files = false;
foreach ($points as $point) {
    $x = $point['x'];
    $slug = "[$x]";
    $file_dir = __DIR__ . "/points/$slug";
    $file_path = $file_dir . "/all_points.csv";
    if (!isset($results[$slug])) {
        if (!file_exists($file_dir)) {
//            $changed_point_files = true;
            mkdir($file_dir, 0777, true);
//            $point_files[] = [
//                "x" => $x,
//                'count' => 1,
//                'point_dir' => $slug
//            ];
//            $file_contents[$slug] = "";
            $added[] = $file_dir;
//        } else {
//            $file_contents[$slug] = trim(file_get_contents($file_path), "\n");
        }
        $results[$slug] = [];
    }
    $y = $point['y'];
    $pattern = $point['pattern'];
    $iteration = $point['iteration'];
    $line = "$y,$pattern,$iteration";
    $results[$slug][] = $line;
//    $file_contents[$slug] .= "\n$line";
}

//if (count($point_files)) {
//    $point_files_path = __DIR__ . "/point_files.json";
//    $existing_point_files = json_decode(file_get_contents($point_files_path));
//    $new_point_files = array_merge($point_files, $existing_point_files);
//    file_put_contents($point_files_path, json_encode($new_point_files));
////    system("chmod 666 $point_files_path");
//}

$point_count = 0;
foreach ($results as $slug => $contents) {
    $file_dir = __DIR__ . "/points/$slug";
    $file_path = "$file_dir/all_points.csv";
    $combined_results = implode("\n", $results[$slug]);
    $point_count += count($results[$slug]);
    $fh = fopen($file_path, "a");
    fwrite($fh, "\n" . $combined_results);
    fclose ($fh);
//    file_put_contents($file_path, trim($contents, "\n"));
//    if ($changed_point_files) {
//        system("chmod 777 $file_dir");
//        system("chmod 666 $file_path");
//    }
}

$data = [
    "results" => "$point_count points added",
    "added" => $point_count
];

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://dev.mikehallstudio.com:3000/');
header('Access-Control-Allow-Methods: GET,PUT,POST,DELETE,PATCH,OPTIONS');
header('Access-Control-Allow-Headers: *');

echo(json_encode($data));
