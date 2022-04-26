<?php

ini_set('memory_limit', '-1');

echo("processing csv_files...\n");

$csv_files = scandir(__DIR__ . '/data_csv');
file_put_contents(__DIR__ . "/csv_files.json", json_encode($csv_files));

function handle_file($file_path)
{
    $handle = fopen($file_path, "r");
    if ($handle) {
        $line = fgets($handle); // header
        $lines_processed = 0;
<<<<<<< HEAD
        $lines_skipped = 0;
        $file_handles = [];
        $all_points = [];
=======
        $file_handles = [];
>>>>>>> 1bd7e99733fd1d8211494e53ee3492efd97ae6fe
        while (($line = fgets($handle)) !== false) {
            $line = str_replace("\n", "", $line);
            $parts = explode(',', $line);
            $pattern = $parts[5];
            if ($pattern === 0) {
                continue;
            }

            $x = $parts[3];
            $y = $parts[4];
<<<<<<< HEAD
            $point_index = "[$x,$y]";
            if (isset($all_points[$point_index])) {
                $lines_skipped++;
                continue;
            }
            $all_points[$point_index] = true;

=======
>>>>>>> 1bd7e99733fd1d8211494e53ee3492efd97ae6fe
            $iterations = $parts[6];

            $x_dir_path = __DIR__ . "/points/[$x]";
            if (!file_exists($x_dir_path)) {
                system("mkdir $x_dir_path");
            }
            $point_file_path = $x_dir_path . "/all_points.csv";
            if (!isset($file_handles[$point_file_path])) {
                $file_handles[$point_file_path] = fopen($point_file_path, 'a');
            }
            $line = "\n" . $y . ',' . $pattern . ',' . $iterations;
            fwrite($file_handles[$point_file_path], $line);
            $lines_processed++;
        }
        foreach ($file_handles as $point_file_path => $h) {
            fclose($h);
        }

<<<<<<< HEAD
        if ($lines_processed || $lines_skipped) {
            echo(" $lines_processed processed, $lines_skipped skipped");
=======
        if ($lines_processed) {
            echo(" $lines_processed");
>>>>>>> 1bd7e99733fd1d8211494e53ee3492efd97ae6fe
        }
        echo("\n");
        fclose($handle);
    }
}

$files_processed = [];
$log_file_path = __DIR__ . "/csv_files_log.json";
if (file_exists($log_file_path)) {
    $files_processed = json_decode(file_get_contents($log_file_path));
}

$points_dir = __DIR__ . "/points";
if (!file_exists($points_dir)) {
    system("mkdir $points_dir");
}

$files_count = count($csv_files);
foreach ($csv_files as $index => $file_name) {
    if ($index % 100 === 0) {
        echo("$index/$files_count\n");
    }
    if (in_array($file_name, $files_processed)) {
        continue;
    }
    echo("$file_name:");
    $file_path = __DIR__ . '/data_csv/' . $file_name;
    handle_file($file_path);

    $files_processed[] = $file_name;
    file_put_contents($log_file_path, json_encode($files_processed));
}

