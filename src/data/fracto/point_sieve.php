<?php

ini_set('memory_limit', '-1');
set_time_limit(0);

//span=0.10995116277760002&focal_x=-0.2548135023591507&focal_y=0.6286335671871858&aspect_ratio=0.6180339887498948&width_px=800

//$_REQUEST["span"] = 0.10995116277760002;
//$_REQUEST["focal_x"] = -0.2548135023591507;
//$_REQUEST["focal_y"] = 0.6286335671871858;
//$_REQUEST["aspect_ratio"] = 0.6180339887498948;
//$_REQUEST["width_px"] = 800;

//span=0.056294995342131206&focal_x=-0.1569481187979449&focal_y=1.0306172437725287&aspect_ratio=0.6180339887498948&width_px=2000
//$_REQUEST["span"] = 0.056294995342131206;
//$_REQUEST["focal_x"] = -0.1569481187979449;
//$_REQUEST["focal_y"] = 1.0306172437725287;
//$_REQUEST["aspect_ratio"] = 0.6180339887498948;
//$_REQUEST["width_px"] = 2000;

$span_w = floatval($_REQUEST["span"]);
$focal_x = floatval($_REQUEST["focal_x"]);
$focal_y = floatval($_REQUEST["focal_y"]);
$aspect_ratio = floatval($_REQUEST["aspect_ratio"]);
$width_px = intval($_REQUEST["width_px"]);

$height_px = floor($width_px * $aspect_ratio);
$span_h = $span_w * $aspect_ratio;
$increment = $span_w / $width_px;

$left = $focal_x - $span_w / 2;
$right = $focal_x + $span_w / 2;
$top = $focal_y + $span_h / 2;
$bottom = $focal_y - $span_h / 2;

$all_point_files = json_decode(file_get_contents(__DIR__ . "/point_files.json"));
$point_files = array_filter($all_point_files, function ($point_file) {
    global $left;
    global $right;
    return $point_file->x > $left && $point_file->x < $right;
});

$point_count = count ($point_files);
$delta = $span_w / $point_count;
$increment = $span_w / $width_px;

$xy_grid = [];
for ($x_index = 0; $x_index <= $width_px; $x_index++) {
    $xy_grid[$x_index] = [];
    for ($y_index = 0; $y_index < $height_px; $y_index++) {
        $xy_grid[$x_index][$y_index] = [];
    }
}
function v_sieve ($x_index, $epsilon, $y, $pattern, $iterations) {
    global $xy_grid;
    global $bottom;
    global $top;
    global $increment;
    global $height_px;

    if ($y < $bottom || $y > $top) {
        return 0;
    }

    $offset_y = $y - $bottom;
    $y_index = intval(round ($offset_y / $increment));
    if ($y_index >= $height_px) {
        return 0;
    }
    if (count($xy_grid[$x_index][$y_index]) > 0) {
        return 0;
    }

    $difference_y = abs($y_index * $increment - $offset_y);
    if ($difference_y > $epsilon) {
        return 0;
    }

    $xy_grid[$x_index][$y_index] = [$pattern, $iterations];
    return 1;
}

function sieve ($epsilon) {
    global $xy_grid;
    global $point_files;
    global $left;
    global $bottom;
    global $top;
    global $increment;
    global $height_px;

    $change_count = 0;
    foreach ($point_files as $point_file) {
        $offset_x = $point_file->x - $left;
        $x_index = intval (round ($offset_x / $increment));
        $difference_x = abs($x_index * $increment - $offset_x);
        if ($difference_x > $epsilon) {
            continue;
        }

        $missing_values = false;
        for ($y_index = 0; $y_index < $height_px; $y_index++) {
            if (count($xy_grid[$x_index][$y_index]) === 0) {
                $missing_values = true;
                break;
            }
        }
        if (!$missing_values) {
            continue;
        }

        $point_dir = $point_file->point_dir;
        $point_file_path = __DIR__ . "/points/$point_dir/all_points.csv";
        $handle = fopen($point_file_path, 'r');

        while (($y_line = fgets($handle)) !== false) {
            $values = explode(',', trim($y_line));
            $y = floatval($values[0]);
            if ($top > 0) {
                $change_count += v_sieve ($x_index, $epsilon, $y, intval($values[1]), intval($values[2]));
            }
            if ($bottom < 0) {
                $change_count += v_sieve ($x_index, $epsilon, -$y, intval($values[1]), intval($values[2]));
            }
        }
        fclose($handle);

    }
    return $change_count;
}

$total = 0;
$complete = $width_px * $height_px;
$epsilon = $delta / 3;
for ($i = 0; $i < 5; $i++) {
    $result = sieve($epsilon);
    $total += $result;
//    echo ("$result changes, $total total of $complete\n");
    if ($total >= $complete || !$result) {
        break;
    }
    $epsilon = $epsilon * 1.618;
}

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://dev.mikehallstudio.com:3000/');
header('Access-Control-Allow-Methods: GET,PUT,POST,DELETE,PATCH,OPTIONS');
header('Access-Control-Allow-Headers: *');

echo(json_encode($xy_grid));
