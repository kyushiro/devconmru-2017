<?php 

echo "Server started\n";

$server = new swoole_websocket_server("0.0.0.0", 1995);

$server->set([
    'worker_num' => 4,
    'backlog' => 128,
    'max_request' => 50,
    'dispatch_mode'=>1,
]);

$server->on('open', function(swoole_websocket_server $server, $request) use (&$users) {
   echo "server: handshake success with fd{$request->fd}\n\n";
});

$server->on('message', function(swoole_websocket_server $server, $frame) {
    echo "receive from {$frame->fd}: {$frame->data}, opcode:{$frame->opcode}, fin: {$frame->finish}\n";
    $data = $frame->data;

    foreach($server->connections as $fd){
        $server->push($fd, $data);
    }
});

$server->on('close', function($ser, $fd) {
     echo "client {$fd} closed\n";
});

// daemonize();

$server->start();

function daemonize()
{
    $pid = pcntl_fork();
    if ($pid == -1) {
        die("fork(1) failed!\n");
    } elseif ($pid > 0) {
        exit(0);
    }

    posix_setsid();

    $pid = pcntl_fork();
    if ($pid == -1) {
        die("fork(2) failed!\n");
    } elseif ($pid > 0) {
        exit(0);
    }
}

// end of script
