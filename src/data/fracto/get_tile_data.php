<?php

ini_set('memory_limit', '-1');

$code = $_REQUEST["code"];

$tmpname = __DIR__ . "/tmp/" . $code . ".json";
if (!file_exists($tmpname)) {
    $code_path = str_replace('-', '/', $code);
    $s3_path = "s3://mikehallstudio/fracto/orbitals/" . $code_path . "/index.json";
    $cmd = "aws s3 cp " . $s3_path . ' ' . $tmpname;
    system($cmd);
}

$file_contents = file_get_contents($tmpname);
$tile_data = json_decode($file_contents);

header('Content-Type: application/json; charset=utf-8');
echo json_encode($tile_data);
