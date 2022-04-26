<?php
ini_set('memory_limit', '-1');

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://dev.mikehallstudio.com:3000/');
header('Access-Control-Allow-Methods: GET,PUT,POST,DELETE,PATCH,OPTIONS');
header('Access-Control-Allow-Headers: *');

$x = $_REQUEST["x"];
$path = __DIR__ . "/points/[$x]/all_points.csv";
$file_contents = file_get_contents($path);

$results = [
    'success' => 'guaranteed!',
    'x' => $x,
    'data' => explode("\n", $file_contents),
];

echo(json_encode($results));