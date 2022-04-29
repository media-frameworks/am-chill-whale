<?php

ini_set('memory_limit', '-1');
set_time_limit(0);

//span=0.10995116277760002&focal_x=-0.2548135023591507&focal_y=0.6286335671871858&aspect_ratio=0.6180339887498948&width_px=800

//$_REQUEST["span"] = 0.10995116277760002;
//$_REQUEST["focal_x"] = -0.2548135023591507;
//$_REQUEST["focal_y"] = 0.6286335671871858;
//$_REQUEST["aspect_ratio"] = 0.6180339887498948;
//$_REQUEST["width_px"] = 800;

$span_w = floatval($_REQUEST["span"]);
$focal_x = floatval($_REQUEST["focal_x"]);
$focal_y = floatval($_REQUEST["focal_y"]);
$aspect_ratio = floatval($_REQUEST["aspect_ratio"]);
$width_px = intval($_REQUEST["width_px"]);
$height_px = $width_px * $aspect_ratio;

$half_span_w = $span_w / 2;
$bounds_left = $focal_x - $half_span_w;
$bounds_right = $focal_x + $half_span_w;

$span_h = $span_w * $aspect_ratio;
$half_span_h = $span_h / 2;
$bounds_top = $focal_y + $half_span_h;
$bounds_bottom = $focal_y - $half_span_h;

$increment = $span_w / $width_px;
$epsilon = $increment / 2;

$all_point_files = json_decode(file_get_contents(__DIR__ . "/point_files.json"));
$point_files = array_filter($all_point_files, function ($point_file) {
    global $bounds_left;
    global $bounds_right;
    return $point_file->x > $bounds_left && $point_file->x < $bounds_right;
});

$point_files_count = count($point_files);
if ($point_files_count < 3 * $width_px) {
    $EPSILON_FACTOR = 1;
} else {
    $EPSILON_FACTOR = log($point_files_count / $width_px) - 1;
    if ($EPSILON_FACTOR < 1) {
        $EPSILON_FACTOR = 1;
    }
}

$x_file_lists = [];
for ($i = 0; $i < $width_px; $i++) {
    $x_file_lists[$i] = [];
}
foreach ($point_files as $point_file) {
    $x_index = intval(round(($point_file->x - $bounds_left) / $increment));
//    $ideal_x = $bounds_left + $x_index * $increment + $epsilon;
//    if (abs($ideal_x - $point_file->x) < $epsilon) {
        $x_file_lists[$x_index][] = $point_file;
//    }
}

$xy_grid = [];

function process_point_file($x_index, $point_file)
{
    global $bounds_bottom, $bounds_top, $bounds_left, $epsilon, $increment, $xy_grid, $EPSILON_FACTOR;

    $ideal_x = $bounds_left + $x_index * $increment + $epsilon;
    $x = $point_file->x;
    $x_delta = $ideal_x - $x;
    $x_delta_squared = $x_delta * $x_delta;

    $point_dir = $point_file->point_dir;
    $point_file_path = __DIR__ . "/points/$point_dir/all_points.csv";
    $handle = fopen($point_file_path, 'r');

    while (($y_line = fgets($handle)) !== false) {

        $values = explode(',', trim($y_line));
        $y = floatval($values[0]);
        if ($y < $bounds_bottom || $y > $bounds_top) {
            continue;
        }

        $y_index = intval(round(($y - $bounds_bottom) / $increment));

        if (!isset($xy_grid[$x_index][$y_index]["pattern"])) {
            $xy_grid[$x_index][$y_index] = [
                "x" => $x,
                "y" => $y,
                "pattern" => intval($values[1]),
                "iterations" => intval($values[2])
            ];
        } else {
            $ideal_y = $bounds_bottom + $y_index * $increment + $epsilon;
            $y_delta = $ideal_y - $y;
            $distance_factor = $x_delta_squared + $y_delta * $y_delta;
            $other_point = $xy_grid[$x_index][$y_index];
            if (!isset($other_point["distance_factor"])) {
                $other_x_delta = abs($ideal_x - $other_point["x"]);
                $other_y_delta = abs($ideal_y - $other_point["y"]);
                $other_distance_factor = $other_x_delta * $other_x_delta + $other_y_delta * $other_y_delta;
                if ($other_distance_factor > $distance_factor) {
                    $xy_grid[$x_index][$y_index] = [
                        "distance_factor" => $other_distance_factor,
                        "pattern" => $other_point["pattern"],
                        "iterations" => $other_point["iterations"]
                    ];
                } else {
                    $xy_grid[$x_index][$y_index] = [
                        "distance_factor" => $distance_factor,
                        "pattern" => intval($values[1]),
                        "iterations" => intval($values[2])
                    ];
                }
            } else if ($distance_factor > $other_point["distance_factor"]) {
                $xy_grid[$x_index][$y_index] = [
                    "distance_factor" => $distance_factor,
                    "pattern" => intval($values[1]),
                    "iterations" => intval($values[2])
                ];
            }
        }
    }

    fclose($handle);
}


foreach ($x_file_lists as $x_index => $x_file_list) {
    $xy_grid[$x_index] = [];
    for ($y_index = 0; $y_index < $height_px; $y_index++) {
        $xy_grid[$x_index][$y_index] = [];
    }
    foreach ($x_file_list as $point_file) {
        process_point_file($x_index, $point_file);
    }
}

$results = [];
for ($x_index = 0; $x_index < $width_px; $x_index++) {
    $results[$x_index] = [];
    for ($y_index = 0; $y_index < $height_px; $y_index++) {
        if (!isset($xy_grid[$x_index][$y_index]["pattern"])) {
            $results[$x_index][$y_index] = [0, 0];
            continue;
        }
        $results[$x_index][$y_index] = [
            $xy_grid[$x_index][$y_index]["pattern"],
            $xy_grid[$x_index][$y_index]["iterations"],
        ];
    }
}


header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://dev.mikehallstudio.com:3000/');
header('Access-Control-Allow-Methods: GET,PUT,POST,DELETE,PATCH,OPTIONS');
header('Access-Control-Allow-Headers: *');

echo(json_encode($results));