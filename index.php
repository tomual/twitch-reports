<?php
$dir = 'reports';
$files = scandir($dir);
$today = date('Y-m-d', strtotime('-1 day'));
$reports_files = array();

foreach ($files as $file) {
    if (strpos($file, $today) !== false) {
        $reports_files[] = $file;
    }
}

$averages = array();
$dictionary = array();

foreach ($reports_files as $filename) {
    $json = file_get_contents($dir . '/' . $filename);
    $report = json_decode($json);

    foreach ($report as $data) {
        if (!isset($dictionary[$data->id])) {
            $dictionary[$data->id] = $data->name;
        }

        if (!isset($averages[$data->id])) {
            $averages[$data->id] = [
                'viewers' => $data->viewers,
                'streams' => $data->streams,
                'count' => 1,
            ];
        } else {
            $average = [
                'viewers' => $averages[$data->id]['viewers'] + $data->viewers,
                'streams' => $averages[$data->id]['streams'] + $data->streams,
                'count' => $averages[$data->id]['count'] + 1,
            ];
            $averages[$data->id] = $average;
        }
    }
}

foreach ($averages as $game_id => $average) {
    $averages[$game_id] = [
        'viewers' => $averages[$game_id]['viewers'] / $averages[$game_id]['count'],
        'streams' => $averages[$game_id]['streams'] / $averages[$game_id]['count'],
    ];
}

$json = file_get_contents('data/data.json');
$json = json_decode($json);
$json->data->{$today} = $averages;
file_put_contents('data/data.json', json_encode($json));
file_put_contents('data/dictionary.json', json_encode($dictionary));
?>