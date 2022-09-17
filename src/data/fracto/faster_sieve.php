<?php

ini_set('memory_limit', '-1');
set_time_limit(0);

$TEST_MODE = 1;

if ($TEST_MODE) {
    $_REQUEST["left"] = -0.15003503030349913;
    $_REQUEST["top"] = 0.6731398590708956;
    $_REQUEST["span"] = 0.004;
    $_REQUEST["width_px"] = 512;
}

$left = floatval($_REQUEST["left"]);
$top = floatval($_REQUEST["top"]);
$span = floatval($_REQUEST["span"]);
$width_px = floatval($_REQUEST["width_px"]);

$INITIAL_TOLERANCE = 0.025;
$MAXIMUM_TOLERANCE = 0.25;

$right = $left + $span;
$bottom = $top - $span;
$increment = $span / $width_px;

$all_points = [];
$point_hash = [];

$points_completed = [];
for ($i = 0; $i < $width_px; $i++) {
    $points_completed[] = 0;
}

function get_y_values($point_dir)
{
    global $top;
    global $bottom;
    global $increment;
    global $MAXIMUM_TOLERANCE;

    $file_path = __DIR__ . "/points/$point_dir/all_points.csv";
    if (!file_exists($file_path)) {
        return [];
    }
    $handle = fopen($file_path, "r");
    if (!$handle) {
        return [];
    }
    $y_values = [];
    while (($line = fgets($handle)) !== false) {

        $line_data = explode(',', trim($line));
        if (count($line_data) < 3) {
            continue;
        }
        $y = floatval($line_data[0]);
        if ($y > $top + $increment) {
            continue;
        }
        if ($y < $bottom - $increment) {
            continue;
        }

        $img_y_real = ($top - $y) / $increment;
        $img_y = round($img_y_real);
        if (abs($img_y_real - $img_y) > $MAXIMUM_TOLERANCE) {
            continue;
        }

        $pattern = intval($line_data[1]);
        $iterations = intval($line_data[2]);
        $y_values[] = [
            "y" => $y,
            "pattern" => $pattern,
            "iterations" => $iterations,
        ];
    }
    fclose($handle);
    return $y_values;
}


function process_stack($y_values, $img_x, $tolerance)
{
    global $all_points;
    global $point_hash;
    global $top;
    global $increment;
    global $width_px;
    global $points_completed;

    $changes = 0;
    foreach ($y_values as $index => $y_value) {

        $y = $y_value["y"];

        $img_y_real = ($top - $y) / $increment;
        $img_y = round($img_y_real);
        $slug = "[$img_x,$img_y]";
        if (isset($point_hash[$slug])) {
            unset($y_values[$index]);
            continue;
        }
        if (abs($img_y_real - $img_y) > $tolerance) {
            continue;
        }
        if ($img_y < 0 || $img_y >= $width_px) {
            unset($y_values[$index]);
            continue;
        }
        $point_hash[$slug] = true;
        $changes += 1;
        $points_completed[$img_x] += 1;

        $all_points[] = [
            "img_x" => $img_x,
            "img_y" => $img_y,
            "pattern" => $y_value["pattern"],
            "iterations" => $y_value["iterations"],
        ];

        if ($points_completed[$img_x] >= $width_px) {
            break;
        }
    }
    return $changes;
}

$point_dirs = scandir(__DIR__ . '/points');
$tolerance = $INITIAL_TOLERANCE;
$passes = [];
$y_values_cache = [];
for ($pass = 0; $pass < 20; $pass++) {

    $changes = 0;
    foreach ($point_dirs as $index => $point_dir) {

        if ($point_dir === '.' || $point_dir === '..') {
            continue;
        }

        $x = floatval(trim($point_dir, '[]'));
        $img_x_real = ($x - $left) / $increment;
        $img_x = round($img_x_real);
        if ($img_x >= $width_px || $img_x < 0) {
            continue;
        }
        if ($points_completed[$img_x] >= $width_px) {
            unset($point_dirs[$index]);
            continue;
        }

        $variance = $img_x_real - $img_x;
        if (abs($variance) > $tolerance) {
            continue;
        }

        if (!isset($y_values_cache[$point_dir])) {
            $y_values_cache[$point_dir] = get_y_values($point_dir);
        }
        $changes += process_stack($y_values_cache[$point_dir], $img_x, $tolerance);

    }

    $count = count($all_points);
    $passes[] = [
        "pass" => $pass,
        "tolerance" => $tolerance,
        "point_count" => $count,
        "changes" => $changes
    ];
    if ($TEST_MODE) {
        echo("pass: $pass, tolerance=$tolerance total $count\n");
    }
    if ($count >= $width_px * $width_px) {
        break;
    }
    $changes = 0;
    $tolerance *= 1.618;
}

if ($TEST_MODE) {
    $all_points = [];
}
$data = [
    "request" => [
        "left" => $left,
        "top" => $top,
        "span" => $span,
        "width_px" => $width_px,
    ],
    "passes" => $passes,
    "all_points" => $all_points,
];

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://dev.mikehallstudio.com:3000/');
header('Access-Control-Allow-Methods: GET,PUT,POST,DELETE,PATCH,OPTIONS');
header('Access-Control-Allow-Headers: *');

echo json_encode($data);
