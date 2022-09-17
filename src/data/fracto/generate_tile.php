<?php

ini_set('memory_limit', '-1');
set_time_limit(0);

$code = $_REQUEST["code"];
$short_code = $_REQUEST["short_code"];

//$tmpname = __DIR__ . "/tmp/" . $code . ".json";
//if (!file_exists($tmpname)) {
//    $code_path = str_replace('-', '/', $code);
//    $s3_path = "s3://mikehallstudio/fracto/orbitals/" . $code_path . "/index.json";
//    $cmd = "aws s3 cp " . $s3_path . ' ' . $tmpname;
//    system($cmd);
//}

$code_path = str_replace('-', '/', $code);
$tmpname = __DIR__ . "/archive/" . $code_path . "/index.json";

$file_contents = file_get_contents($tmpname);
$tile_data = json_decode($file_contents);
$size = floatval($tile_data->bounds->size);
$left = floatval($tile_data->bounds->left);
$top = floatval($tile_data->bounds->top);
$right = $left + $size;
$bottom = $top - $size;
$increment = $size / 256.0;
$epsilon = $increment / 3;

$all_points = [];
$all_patterns = [];
$point_hash = [];
$max_iterations = 0;
$bad_files = [];

$LIMIT = 0.15;

function process_point_dir($point_dir, $x)
{
    global $all_points;
    global $point_hash;
    global $all_patterns;
    global $top;
    global $left;
    global $bottom;
    global $increment;
    global $size;
    global $max_iterations;
    global $bad_files;
    global $LIMIT;

    $img_x_real = 256.0 * (($x - $left) / $size);
    if (abs ($img_x_real - round($img_x_real)) > $LIMIT) {
        return;
    }
    $img_x = round($img_x_real);

    $file_path = __DIR__ . "/points/$point_dir/all_points.csv";
    $handle = fopen($file_path, "r");
    if (!$handle) {
        $bad_files[] = $point_dir;
        return;
    }
    while (($line = fgets($handle)) !== false) {
        $line_data = explode(',', trim($line));
        if (count($line_data) < 2) {
            continue;
        }
        $y = floatval($line_data[0]);
        if ($y > $top + $increment) {
            continue;
        }
        if ($y <= $bottom - $increment) {
            continue;
        }
        $img_y_real = 256.0 * (($top - $y) / $size);
        if (abs ($img_y_real - round($img_y_real)) > $LIMIT) {
            continue;
        }
        $img_y = round($img_y_real);
        $slug = "[$img_x,$img_y]";
        if (isset($point_hash[$slug])) {
            continue;
        }
        $point_hash[$slug] = true;

        $pattern = floatval($line_data[1]);
        $pattern_index = sprintf("%04d", $pattern);
        if (!isset($all_patterns[$pattern_index])) {
            $all_patterns[$pattern_index] = 0;
        }
        $all_patterns[$pattern_index]++;

        $iterations = $line_data[2];
        if ($iterations > $max_iterations) {
            $max_iterations = $iterations;
        }
        $all_points[] = [
            "img_x" => $img_x,
            "img_y" => $img_y,
            "pattern" => $pattern,
            "iterations" => $iterations,
        ];
    }
    fclose($handle);
}

//$point_files = json_decode(file_get_contents(__DIR__ . "/point_files.json"));

$point_dirs = scandir(__DIR__ . '/points');
foreach ($point_dirs as $point_dir) {

    if ($point_dir === '.' || $point_dir === '..') {
        continue;
    }
    $x = floatval(trim($point_dir, '[]'));

    if ($x < $left - $increment) {
        continue;
    }
    if ($x >= $right + $increment) {
        continue;
    }
    process_point_dir($point_dir, $x);
}

$data = [
    "code" => $code,
    "short_code" => $short_code,
    "max_iterations" => $max_iterations,
    "tile_data" => $tile_data,
    "all_points" => $all_points,
    "all_patterns" => $all_patterns,
    "bad_files" => $bad_files,
];
header('Content-Type: application/json; charset=utf-8');
echo json_encode($data);
