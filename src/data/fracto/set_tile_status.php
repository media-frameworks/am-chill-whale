<?php

ini_set('memory_limit', '-1');

$code = $_REQUEST["code"];
$status = $_REQUEST["status"];

$code_path = str_replace('-', '/', $code);
$tmpname = "./archive/" . $code_path . "/index.json";
$tile_data = json_decode(file_get_contents($tmpname));

$results = [];
$results["tmpname"] = $tmpname;

function seedLevel($start, $size, $left, $top)
{
    global $results;

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

    exec ("mkdir $tmpdir");
    exec ("chmod 777 $tmpdir");

    $tmpname = "$tmpdir/index.json";
    $results["new"][$start]["tmpname"] = $tmpname;
    file_put_contents($tmpname, json_encode($index_json));

//    $s3_path = "s3://mikehallstudio/fracto/orbitals/$start_path/index.json";
//    $results["new"][$start]["s3_path"] = $s3_path;
//
//    exec ("aws s3 cp $tmpname $s3_path --acl public-read");
}

if ($status === 'complete') {
    $results["operation"] = "open tile";
    $tile_data->status = "complete";
    file_put_contents($tmpname, json_encode($tile_data)) ;

//    $s3_path = "s3://mikehallstudio/fracto/orbitals/$code_path/index.json";
//    exec ("aws s3 cp $tmpname $s3_path --acl public-read");

//    $s3_path = "s3://mikehallstudio/fracto/orbitals/$code_path/";
//    $results["s3_path"] = $s3_path;

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
