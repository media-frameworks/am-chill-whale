<?php

ini_set('memory_limit', '-1');

$results = [
    "LEVEL_02" => [],
    "LEVEL_03" => [],
    "LEVEL_04" => [],
    "LEVEL_05" => [],
    "LEVEL_06" => [],
    "LEVEL_07" => [],
    "LEVEL_08" => [],
    "LEVEL_09" => [],
    "LEVEL_10" => [],
    "LEVEL_11" => [],
    "LEVEL_12" => [],
    "LEVEL_13" => [],
    "LEVEL_14" => [],
    "LEVEL_15" => [],
    "LEVEL_16" => [],
    "LEVEL_17" => [],
    "LEVEL_18" => [],
    "LEVEL_19" => [],
    "LEVEL_20" => [],
];

$empties = [
    "LEVEL_02" => [],
    "LEVEL_03" => [],
    "LEVEL_04" => [],
    "LEVEL_05" => [],
    "LEVEL_06" => [],
    "LEVEL_07" => [],
    "LEVEL_08" => [],
    "LEVEL_09" => [],
    "LEVEL_10" => [],
    "LEVEL_11" => [],
    "LEVEL_12" => [],
    "LEVEL_13" => [],
    "LEVEL_14" => [],
    "LEVEL_15" => [],
    "LEVEL_16" => [],
    "LEVEL_17" => [],
    "LEVEL_18" => [],
    "LEVEL_19" => [],
    "LEVEL_20" => [],
];

$zero_stats = [
    "new" => 0,
    "complete" => 0,
    "empty" => 0,
];

$stats = [
    "LEVEL_02" => $zero_stats,
    "LEVEL_03" => $zero_stats,
    "LEVEL_04" => $zero_stats,
    "LEVEL_05" => $zero_stats,
    "LEVEL_06" => $zero_stats,
    "LEVEL_07" => $zero_stats,
    "LEVEL_08" => $zero_stats,
    "LEVEL_09" => $zero_stats,
    "LEVEL_10" => $zero_stats,
    "LEVEL_11" => $zero_stats,
    "LEVEL_12" => $zero_stats,
    "LEVEL_13" => $zero_stats,
    "LEVEL_14" => $zero_stats,
    "LEVEL_15" => $zero_stats,
    "LEVEL_16" => $zero_stats,
    "LEVEL_17" => $zero_stats,
    "LEVEL_18" => $zero_stats,
    "LEVEL_19" => $zero_stats,
    "LEVEL_20" => $zero_stats,
];

$locked = [];
$new = [];

function process_tile($json_filename, $level)
{
    global $results;
    global $empties;
    global $stats;
    global $locked;

    if ($level > 20) {
        return;
    }
    if (!file_exists($json_filename)) {
        return;
    }
    $tile = json_decode(file_get_contents($json_filename));
    if (!isset($tile->status)) {
        return;
    }
    $code = $tile->code;
    $status = $tile->status;
    if ($status === "locked") {
        $locked[] = [
            "code" => $code,
            "lock_date" => $tile->lock_date
        ];
    }

    $result = [
        "code" => $code,
        "bounds" => [
            "left" => $tile->bounds->left,
            "top" => $tile->bounds->top,
            "right" => $tile->bounds->left + $tile->bounds->size,
            "bottom" => $tile->bounds->top - $tile->bounds->size,
        ]
    ];

    if ($level < 9.0) {
        echo("\n" . $code);
    }

    $level_name = sprintf("LEVEL_%02d", $level);

    if ($status === "complete") {
        $results[$level_name][] = $result;
        $stats[$level_name]["complete"]++;
    }
    else {
        $empties[$level_name][] = $result;
        $stats[$level_name]["empty"]++;
    }

    $next_level = $level + 1.0;
    process_tile(str_replace("index.json", "00/index.json", $json_filename), $next_level);
    process_tile(str_replace("index.json", "01/index.json", $json_filename), $next_level);
    process_tile(str_replace("index.json", "10/index.json", $json_filename), $next_level);
    process_tile(str_replace("index.json", "11/index.json", $json_filename), $next_level);
}

process_tile(__DIR__ . "/archive/00/index.json", 1);
process_tile(__DIR__ . "/archive/01/index.json", 1);

$json_dir = __DIR__ . "/json";

system ("mkdir $json_dir");

file_put_contents("$json_dir/level_02_complete.json", json_encode($results["LEVEL_02"]));
file_put_contents("$json_dir/level_03_complete.json", json_encode($results["LEVEL_03"]));
file_put_contents("$json_dir/level_04_complete.json", json_encode($results["LEVEL_04"]));
file_put_contents("$json_dir/level_05_complete.json", json_encode($results["LEVEL_05"]));
file_put_contents("$json_dir/level_06_complete.json", json_encode($results["LEVEL_06"]));
file_put_contents("$json_dir/level_07_complete.json", json_encode($results["LEVEL_07"]));
file_put_contents("$json_dir/level_08_complete.json", json_encode($results["LEVEL_08"]));
file_put_contents("$json_dir/level_09_complete.json", json_encode($results["LEVEL_09"]));
file_put_contents("$json_dir/level_10_complete.json", json_encode($results["LEVEL_10"]));
file_put_contents("$json_dir/level_11_complete.json", json_encode($results["LEVEL_11"]));
file_put_contents("$json_dir/level_12_complete.json", json_encode($results["LEVEL_12"]));
file_put_contents("$json_dir/level_13_complete.json", json_encode($results["LEVEL_13"]));
file_put_contents("$json_dir/level_14_complete.json", json_encode($results["LEVEL_14"]));
file_put_contents("$json_dir/level_15_complete.json", json_encode($results["LEVEL_15"]));
file_put_contents("$json_dir/level_16_complete.json", json_encode($results["LEVEL_16"]));
file_put_contents("$json_dir/level_17_complete.json", json_encode($results["LEVEL_17"]));
file_put_contents("$json_dir/level_18_complete.json", json_encode($results["LEVEL_18"]));
file_put_contents("$json_dir/level_19_complete.json", json_encode($results["LEVEL_19"]));
file_put_contents("$json_dir/level_20_complete.json", json_encode($results["LEVEL_20"]));

file_put_contents("$json_dir/level_02_empty.json", json_encode($empties["LEVEL_02"]));
file_put_contents("$json_dir/level_03_empty.json", json_encode($empties["LEVEL_03"]));
file_put_contents("$json_dir/level_04_empty.json", json_encode($empties["LEVEL_04"]));
file_put_contents("$json_dir/level_05_empty.json", json_encode($empties["LEVEL_05"]));
file_put_contents("$json_dir/level_06_empty.json", json_encode($empties["LEVEL_06"]));
file_put_contents("$json_dir/level_07_empty.json", json_encode($empties["LEVEL_07"]));
file_put_contents("$json_dir/level_08_empty.json", json_encode($empties["LEVEL_08"]));
file_put_contents("$json_dir/level_09_empty.json", json_encode($empties["LEVEL_09"]));
file_put_contents("$json_dir/level_10_empty.json", json_encode($empties["LEVEL_10"]));
file_put_contents("$json_dir/level_11_empty.json", json_encode($empties["LEVEL_11"]));
file_put_contents("$json_dir/level_12_empty.json", json_encode($empties["LEVEL_12"]));
file_put_contents("$json_dir/level_13_empty.json", json_encode($empties["LEVEL_13"]));
file_put_contents("$json_dir/level_14_empty.json", json_encode($empties["LEVEL_14"]));
file_put_contents("$json_dir/level_15_empty.json", json_encode($empties["LEVEL_15"]));
file_put_contents("$json_dir/level_16_empty.json", json_encode($empties["LEVEL_16"]));
file_put_contents("$json_dir/level_17_empty.json", json_encode($empties["LEVEL_17"]));
file_put_contents("$json_dir/level_18_empty.json", json_encode($empties["LEVEL_18"]));
file_put_contents("$json_dir/level_19_empty.json", json_encode($empties["LEVEL_19"]));
file_put_contents("$json_dir/level_20_empty.json", json_encode($empties["LEVEL_20"]));

file_put_contents("$json_dir/locked.json", json_encode($locked));
file_put_contents("$json_dir/stats.json", json_encode($stats));

