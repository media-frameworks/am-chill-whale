<?php

ini_set('memory_limit', '-1');
set_time_limit(0);

$level = intval($_REQUEST["level"]);

$complete_filename = __DIR__ . "/json/level_" . $level . "_complete.json";
$empty_filename = __DIR__ . "/json/level_" . $level . "_empty.json";

$results = [];
if (!file_exists($complete_filename)) {
    $results = [
        "error" => "filename $complete_filename not found"
    ];
} else if (!file_exists($empty_filename)) {
    $results = [
        "error" => "filename $empty_filename not found"
    ];
} else {
    $complete_json = json_decode(file_get_contents($complete_filename));
    $empty_json = json_decode(file_get_contents($empty_filename));
    $total_json = array_merge($complete_json, $empty_json);
    usort($total_json, function ($a, $b) {
        if ($a->bounds->left < $b->bounds->left) {
            return -1;
        }
        if ($a->bounds->left > $b->bounds->left) {
            return 1;
        }
        if ($a->bounds->top > $b->bounds->top) {
            return -1;
        }
        if ($a->bounds->top < $b->bounds->top) {
            return 1;
        }
        return 0;
    });
    $results = [
        "tiles" => $total_json
    ];
}

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://dev.mikehallstudio.com:3000/');
header('Access-Control-Allow-Origin: 54.225.6.190');
header('Access-Control-Allow-Methods: GET,PUT,POST,DELETE,PATCH,OPTIONS');
header('Access-Control-Allow-Headers: *');

echo(json_encode($results));



