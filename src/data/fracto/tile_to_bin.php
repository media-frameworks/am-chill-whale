<?php

ini_set('memory_limit', '-1');
set_time_limit(0);

$from = $_REQUEST["from"];
$to = $_REQUEST["to"];
$short_code = $_REQUEST["short_code"];

function write_to_new($short_code, $bounds)
{
    $filepath = __DIR__ . "/directory/new/" . $short_code . ".json";
    file_put_contents($filepath, json_encode($bounds));
    exec("chmod 777 $filepath");
}

function add_new_sub_tiles($dest_filename)
{
    global $short_code;

    $parent_tile = json_decode(file_get_contents($dest_filename));
    if (!$parent_tile) {
        return "error while adding sub-tiles";
    }

    $tile_scope = ($parent_tile->bounds->right - $parent_tile->bounds->left) / 2;

    $bounds_0 = new stdClass();
    $bounds_0->left = $parent_tile->bounds->left;
    $bounds_0->top = $parent_tile->bounds->top;
    $bounds_0->right = $parent_tile->bounds->left + $tile_scope;
    $bounds_0->bottom = $parent_tile->bounds->top - $tile_scope;
    write_to_new($short_code . '0', $bounds_0);

    $bounds_1 = new stdClass();
    $bounds_1->left = $parent_tile->bounds->left + $tile_scope;
    $bounds_1->top = $parent_tile->bounds->top;
    $bounds_1->right = $parent_tile->bounds->right;
    $bounds_1->bottom = $parent_tile->bounds->top - $tile_scope;
    write_to_new($short_code . '1', $bounds_1);

    $bounds_2 = new stdClass();
    $bounds_2->left = $parent_tile->bounds->left;
    $bounds_2->top = $parent_tile->bounds->top - $tile_scope;
    $bounds_2->right = $parent_tile->bounds->left + $tile_scope;
    $bounds_2->bottom = $parent_tile->bounds->bottom;
    write_to_new($short_code . '2', $bounds_2);

    $bounds_3 = new stdClass();
    $bounds_3->left = $parent_tile->bounds->left + $tile_scope;
    $bounds_3->top = $parent_tile->bounds->top - $tile_scope;
    $bounds_3->right = $parent_tile->bounds->right;
    $bounds_3->bottom = $parent_tile->bounds->bottom;
    write_to_new($short_code . '3', $bounds_3);

    return "OK, added sub-tiles";
}

$result = 'OK';
$source_file = __DIR__ . "/directory/$from/$short_code.json";
$dest_filename = __DIR__ . "/directory/$to/$short_code.json";
if (!file_exists($source_file)) {
    $result = "error, file does not exist";
    $new_file = "/directory/new/$short_code.json";
    if (file_exists($new_file)) {
        rename($new_file, $dest_filename);
        $result = "OK, but file found in new";
    }
    $ready_file = "/directory/ready/$short_code.json";
    if (file_exists($ready_file)) {
        rename($ready_file, $dest_filename);
        $result = "OK, but file found in ready";
    }
    $complete_file = "/directory/complete/$short_code.json";
    if (file_exists($complete_file)) {
        rename($complete_file, $dest_filename);
        $result = "OK, but file found in complete";
    }
    $indexed_file = "/directory/indexed/$short_code.json";
    if (file_exists($indexed_file)) {
        rename($indexed_file, $dest_filename);
        $result = "OK, but file found in indexed";
    }
} else {
    rename($source_file, $dest_filename);
    if ($to === "complete") {
        $result = add_new_sub_tiles($dest_filename);
    }
}

$data = [
    "from" => $from,
    "to" => $to,
    "short_code" => $short_code,
    "result" => $result
];
header('Content-Type: application/json; charset=utf-8');
echo json_encode($data);
