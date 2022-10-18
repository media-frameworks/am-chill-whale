<?php

ini_set('memory_limit', '-1');
set_time_limit(0);

$TEST_MODE = 1;

if ($TEST_MODE) {
    $_REQUEST["left"] = -0.15003503030349913;
    $_REQUEST["top"] = 0.6731398590708956;
    $_REQUEST["span"] = 0.00009007199254740993;
    $_REQUEST["width_px"] = 1024;
}

$left = floatval($_REQUEST["left"]);
$top = floatval($_REQUEST["top"]);
$span = floatval($_REQUEST["span"]);
$width_px = floatval($_REQUEST["width_px"]);

$INITIAL_TOLERANCE = 0.01;

$right = $left + $span;
$bottom = $top - $span;
$increment = $span / $width_px;

$all_points = [];
$point_hash = [];
$points_completed = [];

function process_stack($y_values, $img_x, $tolerance)
{
    global $all_points;
    global $point_hash;
    global $top;
    global $increment;
    global $width_px;
    global $points_completed;

    $changes = 0;
    foreach ($y_values as $y_value) {

        $y = $y_value["y"];

        $img_y_real = ($top - $y) / $increment;
        $img_y = round($img_y_real);
        $slug = "[$img_x,$img_y]";
        if (isset($point_hash[$slug])) {
            continue;
        }
        if (abs($img_y_real - $img_y) > $tolerance) {
            continue;
        }
        if ($img_y < 0 || $img_y >= $width_px) {
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
    }
    return $changes;
}

$point_dirs = scandir(__DIR__ . '/points');
$dirs_in_span = [];

function dir_in_span($point_dir)
{
    global $top;
    global $bottom;
    global $increment;

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

function process_y_values ($point_dir) {
    global $left;
    global $right;
    global $width_px;
    global $increment;
    global $dirs_in_span;

    $x = floatval(trim($point_dir, '[]'));

    if ($x < $left - $increment) {
        return;
    }
    if ($x >= $right + $increment) {
        return;
    }
    $img_x_real = ($x - $left) / $increment;
    $img_x = round($img_x_real);
    if ($img_x >= $width_px || $img_x < 0) {
        return;
    }

    $y_values = dir_in_span($point_dir);

    $dirs_in_span[] = [
        "point_dir" => $point_dir,
        "x" => $x,
        "img_x" => $img_x,
        "img_x_real" => $img_x_real,
        "y_values" => $y_values
    ];
}

foreach ($point_dirs as $point_dir) {

    if ($point_dir === '.' || $point_dir === '..') {
        continue;
    }
    process_y_values($point_dir);
}

for ($i = 0; $i < $width_px; $i++) {
    $points_completed[] = 0;
}

$counted_dirs = count($dirs_in_span);
if ($TEST_MODE) {
    echo("\n\ndirs_in_span = $counted_dirs\n\n");
}

$tolerance = $INITIAL_TOLERANCE;
$passes = [];
for ($pass = 0; $pass < 20; $pass++) {

    $changes = 0;
    foreach ($dirs_in_span as $dir) {
        if (abs($dir["img_x_real"] - $dir["img_x"]) > $tolerance) {
            continue;
        }
        if ($points_completed[$dir["img_x"]] >= $width_px) {
            if ($TEST_MODE) {
                echo($dir["img_x"] . "completed\n");
            }
            continue;
        }
        $stack_changes = process_stack($dir["y_values"], $dir["img_x"], $tolerance);
        if ($stack_changes === 0 && $tolerance > 1.0) {
            break;
        }
        $changes += $stack_changes;
    }
    if ($stack_changes === 0 && $tolerance > 1.0) {
        break;
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
