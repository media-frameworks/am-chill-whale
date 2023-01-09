<?php

ini_set('memory_limit', '-1');
set_time_limit(0);

$directiory_complete_dir = __DIR__ . "/directory/complete";
$directiory_new_dir = __DIR__ . "/directory/new";
$directiory_empty_dir = __DIR__ . "/directory/empty";
$directiory_inland_dir = __DIR__ . "/directory/inland";
$directiory_error_dir = __DIR__ . "/directory/error";
$directiory_ready_dir = __DIR__ . "/directory/ready";

$old_ready =  __DIR__ . "/directory/backup/2022-12-29/indexed.csv";
$new_ready =  __DIR__ . "/directory/backup/2023-01-03/indexed.csv";

$old_tiles_map = [];
$new_tiles_map = [];

$handle = fopen($old_ready, "r");
$line = fgets($handle);
while (($line = fgets($handle)) !== false) {
    $exploded = explode(',', $line);
    $old_tiles_map[$exploded[0]] = 1;
}
fclose($handle);

$handle = fopen($new_ready, "r");
$line = fgets($handle);
while (($line = fgets($handle)) !== false) {
    $exploded = explode(',', $line);
    $new_tiles_map[$exploded[0]] = 1;
}
fclose($handle);

$all_bad = [];

foreach ($new_tiles_map as $new_tile => $value) {
    if (!isset($old_tiles_map[$new_tile])) {
        $ready_name = __DIR__ . "/directory/ready/$new_tile.json";
        $completed_name = __DIR__ . "/directory/completed/$new_tile.json";
        $indexed_name = __DIR__ . "/directory/indexed/$new_tile.json";
        $new_name = __DIR__ . "/directory/new/$new_tile.json";

        if (file_exists($indexed_name)) {
            echo("\n$indexed_name => $new_name");
            rename ($indexed_name,$new_name);
            $all_bad[$new_tile] = 1;
        }
    }
}

echo (count($all_bad));



