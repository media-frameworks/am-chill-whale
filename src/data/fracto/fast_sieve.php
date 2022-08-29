<?php

ini_set('memory_limit', '-1');
set_time_limit(0);

$_REQUEST["left"] = -0.524288;
$_REQUEST["top"] = 0.3441043083900226;
$_REQUEST["span"] = 0.08;
$_REQUEST["width_px"] = 1024.0;

$left = floatval($_REQUEST["left"]);
$top = floatval($_REQUEST["top"]);
$span = floatval($_REQUEST["span"]);
$width_px = floatval($_REQUEST["width_px"]);

$INITIAL_TOLERANCE = 0.05;

$right = $left + $span;
$bottom = $top - $span;
$increment = $span / $width_px;

$all_points = [];
$point_hash = [];

function process_stack($point_dir, $img_x, $tolerance)
{
    global $all_points;
    global $point_hash;
    global $top;
    global $bottom;
    global $increment;
    global $width_px;

    $file_path = __DIR__ . "/points/$point_dir/all_points.csv";
    $handle = fopen($file_path, "r");
    if (!$handle) {
        return;
    }

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
        if (abs ($img_y_real - $img_y) > $tolerance) {
            continue;
        }
        if ($img_y < 0 || $img_y >= $width_px) {
            continue;
        }
        $slug = "[$img_x,$img_y]";
        if (isset($point_hash[$slug])) {
            continue;
        }
        $point_hash[$slug] = true;

        $pattern = intval($line_data[1]);
        $iterations = intval($line_data[2]);
        $all_points[] = [
            "img_x" => $img_x,
            "img_y" => $img_y,
            "pattern" => $pattern,
            "iterations" => $iterations,
        ];
    }
    fclose($handle);
}

$point_dirs = scandir(__DIR__ . '/points');
$dirs_in_span = [];

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
    $dirs_in_span[] = [
        "point_dir" => $point_dir,
        "x" => $x
    ];
}

$tolerance = $INITIAL_TOLERANCE;
$passes = [];
for ($pass = 0; $pass < 10; $pass++) {

    foreach ($dirs_in_span as $dir) {

        $img_x_real = ($dir["x"] - $left) / $increment;
        $img_x = round($img_x_real);
        if (abs($img_x_real - round($img_x_real)) > $tolerance) {
            continue;
        }

        if ($img_x < 0 || $img_x >= $width_px) {
            continue;
        }

        process_stack($dir["point_dir"], $img_x, $tolerance);
    }
    $count = count($all_points);
    echo ("tolerance is $tolerance count is $count increment is $increment\n");
    if (count($all_points) > $width_px * $width_px) {
        break;
    }
    $passes[] = [
        "pass" => $pass,
        "tolerance" => $tolerance,
        "point_count" => count($all_points)
    ];
    $tolerance *= 1.618;
}

$data = [
    "request" => [
        "left" => $left,
        "top" => $top,
        "span" => $span,
        "width_px" => $width_px,
    ],
    "passes" => $passes,
//    "all_points" => $all_points,
];

header('Content-Type: application/json; charset=utf-8');
echo json_encode($data);
