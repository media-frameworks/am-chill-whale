<?php

ini_set('memory_limit', '-1');
set_time_limit(0);

//span=0.10995116277760002&focal_x=-0.2548135023591507&focal_y=0.6286335671871858&aspect_ratio=0.6180339887498948&width_px=800

//$_REQUEST["span"] = 0.10995116277760002;
//$_REQUEST["focal_x"] = -0.2548135023591507;
//$_REQUEST["focal_y"] = 0.6286335671871858;
//$_REQUEST["aspect_ratio"] = 0.6180339887498948;
//$_REQUEST["width_px"] = 1200;

$span_w = floatval($_REQUEST["span"]);
$focal_x = floatval($_REQUEST["focal_x"]);
$focal_y = floatval($_REQUEST["focal_y"]);
$aspect_ratio = floatval($_REQUEST["aspect_ratio"]);
$width_px = intval($_REQUEST["width_px"]);

$height_px = round($width_px * $aspect_ratio);
$span_h = $span_w * $aspect_ratio;
$increment = $span_w / $width_px;

$left = $focal_x - $span_w / 2;
$right = $focal_x + $span_w / 2;
$top = $focal_y + $span_h / 2;
$bottom = $focal_y - $span_h / 2;

$point_dirs = scandir(__DIR__ . '/points');
$point_stacks = [];
for ($i = 0; $i < $width_px; $i++) {
    $point_stacks[$i] = 0;
    $ideal_values[$i] = $left + $increment * $i;
}

foreach ($point_dirs as $point_dir) {
    if ($point_dir === '.' || $point_dir === '..') {
        continue;
    }

    $x = floatval(trim($point_dir, '[]'));
    if ($x - $increment < $left || $x + $increment > $right) {
        continue;
    }

    $closest_index = round(($x - $left) / $increment);
    if ($closest_index >= $width_px || $closest_index < 0) {
        continue;
    }
    if (!$point_stacks[$closest_index]) {
        $point_stacks[$closest_index] = $point_dir;
    } else {
        $closest_x = floatval(trim($point_stacks[$closest_index], '[]'));
        $existing_diff = abs($closest_x - $ideal_values[$closest_index]);
        $current_diff = abs($x - $ideal_values[$closest_index]);
        if ($existing_diff > $current_diff) {
            $point_stacks[$closest_index] = $point_dir;
        }
    }
}

for ($i = 0; $i < $height_px; $i++) {
    $ideal_values[$i] = $bottom + $increment * $i;
}

$results = [];
for ($i = 0; $i < $width_px; $i++) {

    $results[$i] = [];
    for ($j = 0; $j < $height_px; $j++) {
        $results[$i][$j] = -1;
    }

    $filename = __DIR__ . "/points/" . $point_stacks[$i] . "/all_points.csv";
    if (!file_exists($filename)) {
        continue;
    }
    $handle = fopen($filename, 'r');
    while (($y_line = fgets($handle)) !== false) {
        $values = explode(',', trim($y_line));

        $y = floatval($values[0]);
        if ($y < $bottom - $increment || $y > $top + $increment) {
            continue;
        }

        $closest_index = round(($y - $bottom) / $increment);
        if ($closest_index >= $height_px || $closest_index < 0) {
            continue;
        }
        $current_value = $results[$i][$closest_index];
        if ($current_value === -1) {
            $results[$i][$closest_index] = [ intval($values[1]), intval($values[2]) ];
        } else {
            $closest_y = $current_value[1];
            $existing_diff = abs($closest_y - $ideal_values[$closest_index]);
            $current_diff = abs($y - $ideal_values[$closest_index]);
            if ($existing_diff > $current_diff) {
                $results[$i][$closest_index] = [ intval($values[1]), intval($values[2]) ];
            }
        }


    }
    fclose($handle);
}


header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://dev.mikehallstudio.com:3000/');
header('Access-Control-Allow-Methods: GET,PUT,POST,DELETE,PATCH,OPTIONS');
header('Access-Control-Allow-Headers: *');

echo(json_encode($results));