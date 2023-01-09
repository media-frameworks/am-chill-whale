<?php

ini_set('memory_limit', '-1');
set_time_limit(0);

$MAX_LEVELS = 99;

$directiory_complete_dir = __DIR__ . "/directory/complete";
$directiory_new_dir = __DIR__ . "/directory/new";
$directiory_empty_dir = __DIR__ . "/directory/empty";

$results = [];
$empties = [];
$stats = [];

$zero_stats = [
    "new" => 0,
    "complete" => 0,
    "empty" => 0,
];

for ($level = 2; $level <= $MAX_LEVELS; $level++) {
    $level_name = sprintf("LEVEL_%02d", $level);
    $results[$level_name] = [];
    $empties[$level_name] = [];
    $stats[$level_name] = $zero_stats;
}

$completed_file_path = "./json_100/completed.csv";
$completed_file = fopen($completed_file_path, "w");

$potentials_file_path = "./json_100/potentials.csv";
$potentials_file = fopen($potentials_file_path, "w");

fwrite($completed_file, "short_code,left,top,right,bottom");
fwrite($potentials_file, "short_code,left,top,right,bottom");

function process_tile($json_filename, $level)
{
    global $results;
    global $empties;
    global $stats;
    global $MAX_LEVELS;
    global $completed_file;
    global $potentials_file;
    global $directiory_complete_dir;
    global $directiory_new_dir;

    if ($level > $MAX_LEVELS) {
        return;
    }
    if (!file_exists($json_filename)) {
        return;
    }
    $tile = json_decode(file_get_contents($json_filename));
    if (!isset($tile->status)) {
        return;
    }
    if (!isset($tile->bounds)) {
        return;
    }
    $code = $tile->code;
    $status = $tile->status;

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
    } else {
        $empties[$level_name][] = $result;
        $stats[$level_name]["empty"]++;
    }

    $short_code_3 = str_replace('11', '3', $code);
    $short_code_2 = str_replace('10', '2', $short_code_3);
    $short_code_1 = str_replace('01', '1', $short_code_2);
    $short_code_0 = str_replace('00', '0', $short_code_1);
    $short_code = str_replace('-', '', $short_code_0);
    $parent = substr($short_code, 0, strlen($short_code) - 1);
    $csv_data = [
        $short_code,
        $result["bounds"]["left"],
        $result["bounds"]["top"],
        $result["bounds"]["right"],
        $result["bounds"]["bottom"]
    ];
    $bounds = new stdClass();
    $bounds->left = $result["bounds"]["left"];
    $bounds->top = $result["bounds"]["top"];
    $bounds->right = $result["bounds"]["right"];
    $bounds->bottom = $result["bounds"]["bottom"];
    if (strlen($parent)) {
        if ($status === "complete") {
            fwrite($completed_file, "\n" . implode(',', $csv_data));
            $filepath = $directiory_complete_dir . "/" . $short_code . ".json";
            if (!file_exists($filepath)) {
                file_put_contents($filepath, json_encode($bounds));
//                exec("chmod 777 $filepath");
            }
        } else {
            fwrite($potentials_file, "\n" . implode(',', $csv_data));
            $filepath = $directiory_new_dir . "/" . $short_code . ".json";
            if (!file_exists($filepath)) {
                file_put_contents($filepath, json_encode($bounds));
//                exec("chmod 777 $filepath");
            }
        }
    }

    $next_level = $level + 1.0;
    process_tile(str_replace("index.json", "00/index.json", $json_filename), $next_level);
    process_tile(str_replace("index.json", "01/index.json", $json_filename), $next_level);
    process_tile(str_replace("index.json", "10/index.json", $json_filename), $next_level);
    process_tile(str_replace("index.json", "11/index.json", $json_filename), $next_level);
}

process_tile(__DIR__ . "/archive/00/index.json", 1);
process_tile(__DIR__ . "/archive/01/index.json", 1);

fclose($completed_file);
fclose($potentials_file);

$json_dir = __DIR__ . "/json_100";
if (!file_exists($json_dir)) {
    system("mkdir $json_dir");
}

for ($level = 2; $level <= $MAX_LEVELS; $level++) {
    $level_name = sprintf("LEVEL_%02d", $level);
    $complete_file_name = sprintf("$json_dir/level_%02d_complete.json", $level);
    file_put_contents($complete_file_name, json_encode($results[$level_name]));
    $empty_file_name = sprintf("$json_dir/level_%02d_empty.json", $level);
    file_put_contents($empty_file_name, json_encode($empties[$level_name]));
}

file_put_contents("$json_dir/stats.json", json_encode($stats));


echo("\ncomplete.\n");
