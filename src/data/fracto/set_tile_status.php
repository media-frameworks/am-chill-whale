<?php

ini_set('memory_limit', '-1');

$code = $_REQUEST["code"];
$status = $_REQUEST["status"];

$code_path = str_replace('-', '/', $code);
$tmpname = "./archive/" . $code_path . "/index.json";
$tile_data = json_decode(file_get_contents($tmpname));

$results = [];
$results["tmpname"] = $tmpname;

$directiory_complete_dir = __DIR__ . "/directory/complete";
$directiory_new_dir = __DIR__ . "/directory/new";
$directiory_empty_dir = __DIR__ . "/directory/empty";
if (!file_exists($directiory_complete_dir)) {
    exec("mkdir $directiory_complete_dir");
    exec("chmod 777 $directiory_complete_dir");
}
if (!file_exists($directiory_new_dir)) {
    exec("mkdir $directiory_new_dir");
    exec("chmod 777 $directiory_new_dir");
}
if (!file_exists($directiory_empty_dir)) {
    exec("mkdir $directiory_empty_dir");
    exec("chmod 777 $directiory_empty_dir");
}

function code_to_short_code($code)
{
    $step1 = str_replace('11', '3', $code);
    $step2 = str_replace('10', '2', $step1);
    $step3 = str_replace('01', '1', $step2);
    $step4 = str_replace('00', '0', $step3);
    $short_code = str_replace('-', '', $step4);
    return $short_code;
}

function write_to_directory($dirpath, $code, $bounds)
{
    $short_code = code_to_short_code($code);
    $filepath = $dirpath . "/" . $short_code . ".json";
    file_put_contents($filepath, json_encode($bounds));
    exec("chmod 777 $filepath");
}

function seedLevel($start, $size, $left, $top)
{
    global $results;
    global $directiory_new_dir;

    $start_path = str_replace('-', '/', $start);
    $tmpdir = __DIR__ . "/archive/$start_path";
    if (file_exists($tmpdir)) {
        $results["existing"][$start]["start_path"] = $start;
        $results["existing"][$start]["tmpdir"] = $tmpdir;
        return;
    }

    $index_json = new stdClass();
    $index_json->code = $start;
    $index_json->bounds = new stdClass();
    $index_json->bounds->left = $left;
    $index_json->bounds->top = $top;
    $index_json->bounds->size = $size;
    $index_json->status = "new";
    $index_json->last_changed = date('Y-m-d H:i:s');
    $index_json->level = count(explode('-', $start));

    $results["new"][$start] = [];
    $results["new"][$start]["index_json"] = $index_json;

    $results["new"][$start]["start_path"] = $start_path;
    $results["new"][$start]["tmpdir"] = $tmpdir;

    exec("mkdir $tmpdir");
    exec("chmod 777 $tmpdir");

    $tmpname = "$tmpdir/index.json";
    $results["new"][$start]["tmpname"] = $tmpname;
    file_put_contents($tmpname, json_encode($index_json));

    $bounds = new stdClass();
    $bounds->left = $left;
    $bounds->top = $top;
    $bounds->right = $left + $size;
    $bounds->bottom = $top - $size;
    write_to_directory($directiory_new_dir, $start, $bounds);

}

if ($status === 'complete') {
    $results["operation"] = "open tile";
    $tile_data->status = "complete";
    file_put_contents($tmpname, json_encode($tile_data));

    $bounds = new stdClass();
    $bounds->left = $tile_data->bounds->left;
    $bounds->top = $tile_data->bounds->top;
    $bounds->right = $tile_data->bounds->left + $tile_data->bounds->size;
    $bounds->bottom = $tile_data->bounds->top - $tile_data->bounds->size;
    write_to_directory($directiory_complete_dir, $code, $bounds);

    $results["new"] = [];
    $results["existing"] = [];
    $next_size = $tile_data->bounds->size / 2.0;
    seedLevel($code . '-00',
        $next_size,
        $tile_data->bounds->left,
        $tile_data->bounds->top
    );
    seedLevel($code . '-01',
        $next_size,
        $tile_data->bounds->left + $next_size,
        $tile_data->bounds->top
    );
    seedLevel($code . '-10',
        $next_size,
        $tile_data->bounds->left,
        $tile_data->bounds->top - $next_size
    );
    seedLevel($code . '-11',
        $next_size,
        $tile_data->bounds->left + $next_size,
        $tile_data->bounds->top - $next_size
    );
}

$results["tile_data"] = $tile_data;

header('Content-Type: application/json; charset=utf-8');
echo json_encode($results);
