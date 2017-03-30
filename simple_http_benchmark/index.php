<?php
$http = new swoole_http_server("127.0.0.1", 1337, SWOOLE_BASE);



$data = [
  'code' => 'ok',
  'error' => false,
  'payload' => 'Hello World'
];

$http->on('request', function ($request, swoole_http_response $response)  use($data)  {
    $response->header('Content-Type', 'application/json');   
    $response->end(json_encode($data));
});

$http->start();