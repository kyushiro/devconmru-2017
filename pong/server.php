<?php 

echo "Ping pong Server start\n";

$server = new swoole_websocket_server("0.0.0.0", 1995);
$players = 0;

$server->set(array(
    'worker_num' => 4,
    'backlog' => 128,
    'max_request' => 50,
    'dispatch_mode'=>1,
));

$server->on('open', function(swoole_websocket_server $server, $request) use (&$players) {
   $players = count($server->connections);
   echo "server: handshake success with fd{$request->fd}\n\n\n";
   echo "Players = ".$players."\n\n";
   if ($players <=2){
       if ($players === 1){
           $pload = ['type'=>'player_enter', 'payload'=>1];
           $pload = json_encode($pload);
           $server->push($request->fd, $pload);
       }
       else if($players === 2) {
           $pload2 = ['type'=>'player_enter', 'payload'=>2];
           $pload2 = json_encode($pload2);
           $server->push($request->fd, $pload2);

           $startgame = json_encode(['type'=>'start_game', 'payload'=>'ok']);
           foreach($server->connections as $fd){
               $server->push($fd, $startgame);
           }
           $players = 0;
       }
   }
});

$server->on('message', function(swoole_websocket_server $server, $frame) {
    echo "receive from {$frame->fd}: {$frame->data}, opcode:{$frame->opcode}, fin: {$frame->finish}\n\n\n";
    $data = json_decode($frame->data);
    $type = $data->type;

    if ($type == 'move'){

        $pl = json_encode(['type'=>'move', 'payload'=>$data->payload]);

        foreach($server->connections as $fd){
            if ($fd != $frame->fd)
                $server->push($fd, $pl);
        }
    }
    else if ($type == 'game_over'){
        foreach($server->connections as $fd){
           $server->push($fd, json_encode($data));
        }

           $startgame = json_encode(['type'=>'start_game', 'payload'=>'ok']);
           foreach($server->connections as $fd){
               $server->push($fd, $startgame);
           }


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
