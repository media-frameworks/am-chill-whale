<?php

ini_set('memory_limit', '-1');
set_time_limit(0);

$_REQUEST["span"] = 0.524288;
$_REQUEST["focal_x"] = -0.3441043083900226;
$_REQUEST["focal_y"] = 0.4347491000023094;
$_REQUEST["aspect_ratio"] = 0.6180339887498948;
$_REQUEST["width_px"] = 8;

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
$point_files = array_filter($all_point_files,  function($point_file) {
    global $bounds_left;
    global $bounds_right;
    return $point_file->x > $bounds_left && $point_file->x < $bounds_right;
});

$x_file_lists = [];
for ($i = 0; $i < $width_px; $i++) {
    $x_file_lists[$i] = [];
}
foreach ($point_files as $point_file) {
    $x_index = intval(round(($point_file->x - $bounds_left) / $increment));
    $x_file_lists[$x_index][] = $point_file;
}

$x_files = [];
foreach ($x_file_lists as $x_index => $x_file_list) {
    if (!count($x_file_list)) {
        $x_files[$x_index] = null;
        continue;
    }
    $ideal_x = $bounds_left + $x_index * $increment + $epsilon;
    $x_files[$x_index] = $x_file_list[0];
    $closest = abs($x_file_list[0]->x - $ideal_x);
    foreach ($x_file_list as $x_file) {
        if (abs($x_file->x - $ideal_x) < $closest) {
            $x_files[$x_index] = $x_file;
            $closest = abs($x_file->x - $ideal_x);
        }
    }
}

function pixel_column($point_file)
{
    global $bounds_top;
    global $bounds_bottom;
    global $epsilon;
    global $height_px;
    global $increment;

    $x = $point_file->x;
    echo("x: $x\n");
    $point_dir = $point_file->point_dir;
    $point_file_path = __DIR__ . "/points/$point_dir/all_points.csv";
    $point_file_str = file_get_contents($point_file_path);

    $y_points = [];
    $y_lines = explode("\n", $point_file_str);
    foreach ($y_lines as $y_line) {
        $values = explode(',', $y_line);
        if (count($values) < 3) {
            continue;
        }
        $y = floatval($values[0]);
        if ($y < $bounds_bottom || $y > $bounds_top) {
            continue;
        }
        $y_points[] = [
            "y" => $y,
            "pattern" => intval($values[1]),
            "iterations" => intval($values[2])
        ];
    }

    $y_point_values = [];
    for ($i = 0; $i < $height_px; $i++) {
        $y_point_values[$i] = [];
    }
    foreach ($y_points as $y_point) {
        $y_index = intval(round(($y_point["y"] - $bounds_bottom) / $increment));
        $y_point_values[$y_index][] = $y_point;
    }

    $y_values = [];
    foreach ($y_point_values as $y_index => $y_values_list) {
        $count_list = count($y_values_list);
        echo("count_list is $count_list\n");
        if (!$count_list) {
            $y_values[$y_index] = null;
            continue;
        }
        $ideal_y = $bounds_bottom + $y_index * $increment + $epsilon;
        $y_values[$y_index] = $y_values_list[0];
        $closest = abs($y_values_list[0]["y"] - $ideal_y);
        foreach ($y_values_list as $y_value) {
            if (abs($y_value["y"] - $ideal_y) < $closest) {
                $y_values[$y_index] = $y_value;
                $closest = abs($y_value["y"] - $ideal_y);
            }
        }
    }

    return $y_values;
}

$results = [];
foreach ($x_files as $x_index => $x_file) {
    $results[$x_index] = pixel_column($x_file);
}


header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://dev.mikehallstudio.com:3000/');
header('Access-Control-Allow-Methods: GET,PUT,POST,DELETE,PATCH,OPTIONS');
header('Access-Control-Allow-Headers: *');

echo(json_encode($results));



