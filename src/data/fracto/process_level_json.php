<?php

ini_set('memory_limit', '4G');

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
];

$zero_stats = [
    "new" => 0,
    "complete" => 0,
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
];

$locked = [];
$new = [];

function process_tile($json_filename, $level)
{
    global $results;
    global $stats;
    global $locked;
    global $new;

    if ($level > 16) {
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

    if ($level > 10.0) {
        echo(".");
    } else {
        echo("\n" . $code);
    }

    switch ($level) {
        case 2:
            if ($status === "complete") {
                $results["LEVEL_02"][] = $result;
                $stats["LEVEL_02"]["complete"]++;
            }
            break;
        case 3:
            if ($status === "complete") {
                $results["LEVEL_03"][] = $result;
                $stats["LEVEL_03"]["complete"]++;
            }
            break;
        case 4:
            if ($status === "complete") {
                $results["LEVEL_04"][] = $result;
                $stats["LEVEL_04"]["complete"]++;
            }
            break;
        case 5:
            if ($status === "complete") {
                $results["LEVEL_05"][] = $result;
                $stats["LEVEL_05"]["complete"]++;
            }
            break;
        case 6:
            if ($status === "complete") {
                $results["LEVEL_06"][] = $result;
                $stats["LEVEL_06"]["complete"]++;
            }
            break;
        case 7:
            if ($status === "complete") {
                $results["LEVEL_07"][] = $result;
                $stats["LEVEL_07"]["complete"]++;
            }
            break;
        case 8:
            if ($status === "complete") {
                $results["LEVEL_08"][] = $result;
                $stats["LEVEL_08"]["complete"]++;
            }
            break;
        case 9:
            if ($status === "complete") {
                $results["LEVEL_09"][] = $result;
                $stats["LEVEL_09"]["complete"]++;
            }
            break;
        case 10:
            if ($status === "complete") {
                $results["LEVEL_10"][] = $result;
                $stats["LEVEL_10"]["complete"]++;
            }
            break;
        case 11:
            if ($status === "complete") {
                $results["LEVEL_11"][] = $result;
                $stats["LEVEL_11"]["complete"]++;
            }
            else if ($status === "new") {
                $stats["LEVEL_11"]["new"]++;
                $new[] = $result;
            }
            break;
        case 12:
            if ($status === "complete") {
                $results["LEVEL_12"][] = $result;
                $stats["LEVEL_12"]["complete"]++;
            }
            else if ($status === "new") {
                $stats["LEVEL_12"]["new"]++;
            }
            break;
        case 13:
            if ($status === "complete") {
                $results["LEVEL_13"][] = $result;
                $stats["LEVEL_13"]["complete"]++;
            }
            else if ($status === "new") {
                $stats["LEVEL_13"]["new"]++;
            }
            break;
        case 14:
            if ($status === "complete") {
                $results["LEVEL_14"][] = $result;
                $stats["LEVEL_14"]["complete"]++;
            }
            else if ($status === "new") {
                $stats["LEVEL_14"]["new"]++;
            }
            break;
        case 15:
            if ($status === "complete") {
                $results["LEVEL_15"][] = $result;
                $stats["LEVEL_15"]["complete"]++;
            }
            else if ($status === "new") {
                $stats["LEVEL_15"]["new"]++;
            }
            break;
        case 16:
            if ($status === "complete") {
                $results["LEVEL_16"][] = $result;
                $stats["LEVEL_16"]["complete"]++;
            }
            else if ($status === "new") {
                $stats["LEVEL_16"]["new"]++;
            }
            break;
    }

    $next_level = $level + 1.0;
    process_tile(str_replace("index.json", "00/index.json", $json_filename), $next_level);
    process_tile(str_replace("index.json", "01/index.json", $json_filename), $next_level);
    process_tile(str_replace("index.json", "10/index.json", $json_filename), $next_level);
    process_tile(str_replace("index.json", "11/index.json", $json_filename), $next_level);
}

process_tile(__DIR__ . "/archive/00/index.json", 1);
process_tile(__DIR__ . "/archive/01/index.json", 1);

file_put_contents(__DIR__ . '/json/level_02_complete.json', json_encode($results["LEVEL_02"]));
file_put_contents(__DIR__ . '/json/level_03_complete.json', json_encode($results["LEVEL_03"]));
file_put_contents(__DIR__ . '/json/level_04_complete.json', json_encode($results["LEVEL_04"]));
file_put_contents(__DIR__ . '/json/level_05_complete.json', json_encode($results["LEVEL_05"]));
file_put_contents(__DIR__ . '/json/level_06_complete.json', json_encode($results["LEVEL_06"]));
file_put_contents(__DIR__ . '/json/level_07_complete.json', json_encode($results["LEVEL_07"]));
file_put_contents(__DIR__ . '/json/level_08_complete.json', json_encode($results["LEVEL_08"]));
file_put_contents(__DIR__ . '/json/level_09_complete.json', json_encode($results["LEVEL_09"]));
file_put_contents(__DIR__ . '/json/level_10_complete.json', json_encode($results["LEVEL_10"]));
file_put_contents(__DIR__ . '/json/level_11_complete.json', json_encode($results["LEVEL_11"]));
file_put_contents(__DIR__ . '/json/level_12_complete.json', json_encode($results["LEVEL_12"]));
file_put_contents(__DIR__ . '/json/level_13_complete.json', json_encode($results["LEVEL_13"]));
file_put_contents(__DIR__ . '/json/level_14_complete.json', json_encode($results["LEVEL_14"]));
file_put_contents(__DIR__ . '/json/level_15_complete.json', json_encode($results["LEVEL_15"]));
file_put_contents(__DIR__ . '/json/level_16_complete.json', json_encode($results["LEVEL_16"]));

file_put_contents(__DIR__ . '/json/locked.json', json_encode($locked));
file_put_contents(__DIR__ . '/json/new.json', json_encode($new));
file_put_contents(__DIR__ . '/json/stats.json', json_encode($stats));

