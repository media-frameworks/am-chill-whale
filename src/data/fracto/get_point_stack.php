<?php

ini_set('memory_limit', '-1');
set_time_limit(0);

$x = $_REQUEST['x'];
$all_points = file_get_contents(__DIR__ . "/points/[$x]/all_points.csv");
$exploded = explode("\n", $all_points);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://dev.mikehallstudio.com:3000/');
header('Access-Control-Allow-Methods: GET,PUT,POST,DELETE,PATCH,OPTIONS');
header('Access-Control-Allow-Headers: *');

echo(json_encode($exploded));


