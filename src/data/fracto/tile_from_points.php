<?php

ini_set('memory_limit', '-1');

$PHI = (1 + sqrt(5.0)) / 2.0;

array_shift($argv);
$code = array_shift($argv);
$img_width = array_shift($argv);

echo($code . "\n");

$file_path = __DIR__ . "/tmp/$code.json";
if (!file_exists($file_path)) {
    echo("can't find tile\n");
    return;
}

$tile = json_decode(file_get_contents($file_path));
$size = $tile->bounds->size;
$left = $tile->bounds->left;
$top = $tile->bounds->top;
$right = $left + $size;
$bottom = $top - $size;

echo("[top = $top, right = $right, bottom = $bottom, left = $left] \n");

$all_points = [];
$all_patterns = [];

function process_point_dir($point_dir, $x)
{
    global $all_points;
    global $all_patterns;
    global $top;
    global $bottom;

    $file_path = __DIR__ . "/points/$point_dir/all_points.csv";
    $handle = fopen($file_path, "r");
    if (!$handle) {
        echo("problem with file $file_path \n");
        return;
    }
    $line_count = 0;
    while (($line = fgets($handle)) !== false) {
        $line_json = json_decode('[' . trim($line) . ']');
        if (count($line_json) < 2) {
            continue;
        }
        $y = floatval($line_json[0]);
        if ($y > $top) {
            continue;
        }
        if ($y < $bottom) {
            continue;
        }

        $pattern = floatval($line_json[1]);
        $pattern_index = sprintf("%04d", $pattern);
        if (!isset($all_patterns[$pattern_index])) {
            $all_patterns[$pattern_index] = 0;
        }
        $all_patterns[$pattern_index]++;

        $line_count++;
        $dup_index = sprintf('[' . $x . ',' . $y . ']');
        $all_points[$dup_index] = [
            "x" => $x,
            "y" => $y,
            "pattern" => $pattern,
            "iterations" => $line_json[2],
        ];
    }
    fclose($handle);
}

$point_files = json_decode(file_get_contents(__DIR__ . "/point_files.json"));
$point_files_count = count($point_files);
$matching = 0;
foreach ($point_files as $index => $point_file) {

    if ($point_file->x <= $left) {
        continue;
    }
    if ($point_file->x > $right) {
        continue;
    }
    $matching++;
    process_point_dir($point_file->point_dir, $point_file->x);
}

echo($matching . " point files \n");
echo(count($all_points) . " points \n");

//ksort($all_patterns);
//foreach ($all_patterns as $pattern_index => $pattern_count) {
//    echo("$pattern_index: $pattern_count\n");
//}

usort($all_points, function ($a, $b) {
    if ($a['x'] < $b['x']) {
        return -1;
    }
    if ($a['x'] > $b['x']) {
        return 1;
    }
    if ($a['y'] < $b['y']) {
        return -1;
    }
    if ($a['y'] > $b['y']) {
        return 1;
    }
    return 0;
});

$tile_dir = __DIR__ . "/tiles/$code";
if (!file_exists($tile_dir)) {
    system("mkdir $tile_dir");
}
$tile_csv_path = "$tile_dir/$code.csv";
$fh = fopen($tile_csv_path, 'w');
foreach ($all_points as $point) {
    $line = $point['x'] . ',' . $point['y'] . ',' . $point['pattern'] . ',' . $point['iterations'];
    fwrite($fh, "$line\n");
}
fclose($fh);

$img = imagecreatetruecolor($img_width, $img_width);
$white = imagecolorallocate($img, 255, 255, 255);
$black = imagecolorallocate($img, 0, 0, 0);
$all_colors = [];
imagefill($img, 1, 1, $white);

function hue2rgb($p, $q, $t)
{
    $one_sixth = 0.16666666666;
    $one_helf = 0.5;
    $two_thirds = 0.6666666666;
    if ($t < 0) {
        $t += 1;
    }
    if ($t > 1) {
        $t -= 1;
    }
    if ($t < $one_sixth) {
        return $p + ($q - $p) * 6 * $t;
    }
    if ($t < $one_helf) {
        return $q;
    }
    if ($t < $two_thirds) {
        return $p + ($q - $p) * ($two_thirds - $t) * 6;
    }
    return $p;
}

function hslToRgb($h, $s, $l)
{
    $one_third = 0.3333333333333;
    if ($s == 0) {
        $r = $g = $b = $l; // achromatic
    } else {
        $q = $l < 0.5 ? $l * (1 + $s) : $l + $s - $l * $s;
        $p = 2 * $l - $q;
        $r = hue2rgb($p, $q, $h + $one_third);
        $g = hue2rgb($p, $q, $h);
        $b = hue2rgb($p, $q, $h - $one_third);
    }
    return [
        round($r * 255),
        round($g * 255),
        round($b * 255)
    ];
}

function get_color($pattern, $iterations)
{
    global $img;
    global $all_colors;
    global $PHI;
    global $white;
    global $black;

    if ($pattern == -1) {
        return $black;
    }
    $factor = !$pattern ? 0.25 : 0.5;

    $log2 = log($pattern, 2.0);
    $hue = $log2 - floor($log2);
    $lum = 0.90 - $factor * log($iterations, $PHI) / log (10000, $PHI);
    $sat = 0.75;
    list ($r, $g, $b) = hslToRgb($hue, $sat, $lum);

    $color_index = '(' . $r . ',' . $g . ',' . $b . ')';
    if (!isset($all_colors[$color_index])) {
        $all_colors[$color_index] = imagecolorallocate($img, $r & 255, $g & 255, $b & 255);
    }
    return $all_colors[$color_index];
}

foreach ($all_points as $point) {
    $color = get_color($point['pattern'], $point['iterations']);
    $col = $img_width * ($point['x'] - $left) / $size;
    $row = $img_width * ($top - $point['y']) / $size;
    imagesetpixel($img, $col, $row, $color);
}

$image_path = "$tile_dir/img_$code" . "_$img_width.png";
imagejpeg($img, $image_path);
