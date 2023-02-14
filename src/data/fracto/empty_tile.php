<?php

ini_set('memory_limit', '-1');
set_time_limit(0);

$short_code = $_REQUEST["short_code"];
$confirmed = $_REQUEST["confirmed"];
$all_descendants = [];
$result = 'OK';

function seek_descendants($desc_short_code, $depth)
{
    global $all_descendants;
    global $confirmed;
    global $result;

    if (!$depth) {
        return;
    }

    $empty_filepath = __DIR__ . "/directory/empty/$desc_short_code.json";
    $potentials = [
        "new" => __DIR__ . "/directory/new/$desc_short_code.json",
        "ready" => __DIR__ . "/directory/ready/$desc_short_code.json",
        "complete" => __DIR__ . "/directory/complete/$desc_short_code.json",
        "indexed" => __DIR__ . "/directory/indexed/$desc_short_code.json",
    ];

    foreach ($potentials as $name => $filepath) {
        if (file_exists($filepath)) {
            if ($confirmed === "CONFIRMED") {
                rename($filepath, $empty_filepath);
                $result = "file(s) emptied";
            }
            $all_descendants[] = $filepath; //"$name/$desc_short_code.json";
        }
    }
    seek_descendants($desc_short_code . '0', $depth - 1);
    seek_descendants($desc_short_code . '1', $depth - 1);
    seek_descendants($desc_short_code . '2', $depth - 1);
    seek_descendants($desc_short_code . '3', $depth - 1);

}

seek_descendants($short_code, 5);

$data = [
    "all_descendants" => $all_descendants,
    "result" => $result
];

header('Content-Type: application/json; charset=utf-8');
echo json_encode($data);
