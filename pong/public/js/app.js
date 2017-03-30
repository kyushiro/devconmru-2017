(function() {
  $(document).ready(function() {
    var socket = new WebSocket("ws://ws-devcon.cf:1995"); // io("http://127.0.0.1:1995");
    var canvas = $('#c')[0];
    var context = canvas.getContext('2d');
    var right = true;
    var vertical_direction = 'up';
    var player_number;
    var game_started = false;

    // Guard position
    var guard_postition = {
      left: {
        x: 20,
        y: 118
      },
      right: {
        x: 475,
        y: 118
      }
    }

    var ball_position = {
      x: 248,
      y: 126
    }

    function set_background() {
      context.fillStyle = 'black';
      context.fillRect(0, 0, 500, 376);
    }

    function set_left_guard(y, clear) {
      if(clear) {
        context.fillStyle = 'black';
        context.fillRect(guard_postition.left.x, y, 5, 20);
      }
      else {
        context.fillStyle = 'white';
        context.fillRect(guard_postition.left.x, y, 5, 20);
      }
    }

    function set_right_guard(y, clear) {
      if(clear) {
        context.fillStyle = 'black';
        context.fillRect(guard_postition.right.x, y, 5, 20);
      }
      else {
        context.fillStyle = 'white';
        context.fillRect(guard_postition.right.x, y, 5, 20);
      }
    }

    function set_ball(x, y, clear) {
      if(clear) {
        context.fillStyle = 'black';
        context.fillRect(ball_position.x, ball_position.y, 4, 4);
      }
      else {
        context.fillStyle = 'white';
        context.fillRect(x, y, 4, 4);
      }
    }

    function init() {
      set_background();
      set_left_guard(guard_postition.left.y);
      set_right_guard(guard_postition.right.y);
      set_ball(ball_position.x, ball_position.y);
    }

    init();

    socket.onopen = function(){

      console.log('connection opened');
    
      setInterval(function() {
        if(game_started) {
          if(right) {
            if(ball_position.x < 470) {
              set_ball(ball_position.x, ball_position.y, true);

              if(vertical_direction === 'up') {
                ball_position.x += 4;
                ball_position.y -= 4;
              }
              else if(vertical_direction === 'down') {
                ball_position.x += 4;
                ball_position.y += 4;
              }

              set_ball(ball_position.x, ball_position.y, false);

              if((ball_position.y > guard_postition.right.y + 20 || ball_position.y < guard_postition.right.y) && ball_position.x >= 470) {
                socket.send(JSON.stringify({winner: 'Player 1', type:'game_over'}));
                game_started = false;
              }

              if(ball_position.y <= 0)
                vertical_direction = 'down'
              else if(ball_position.y >= 272)
                vertical_direction = 'up';
            }
            else
              right = false;
          }
          else if(!right) {
            if(ball_position.x > 26) {
              set_ball(ball_position.x, ball_position.y, true);
              if(vertical_direction === 'up') {
                ball_position.x -= 4;
                ball_position.y -= 4;
              }
              else if(vertical_direction === 'down') {
                ball_position.x -= 4;
                ball_position.y += 4;
              }

              set_ball(ball_position.x, ball_position.y, false);

              if((ball_position.y > guard_postition.left.y + 20 || ball_position.y < guard_postition.left.y) && ball_position.x <= 26) {
                socket.send(JSON.stringify({winner: 'Player 2',type:'game_over'}));
                game_started = false;
              }

              if(ball_position.y <= 0)
                vertical_direction = 'down'
              else if(ball_position.y >= 272)
                vertical_direction = 'up';
            }
            else
              right = true;
          }
        }
      }, 50);

      $(document).keypress(function(data) {
        var charCode = data.charCode;
          if(game_started) {
            if(player_number === 1) {
              if(charCode === 119) {
                if(guard_postition.left.y > 0) {
                  set_left_guard(guard_postition.left.y, true)
                  guard_postition.left.y -= 8;
                  guard_postition.left.direction = 'up';
                  set_left_guard(guard_postition.left.y, false);

                  var data = {
                    payload: {
                      left: guard_postition.left,
                      player: player_number
                    },
                    type: 'move'
                  }
                  socket.send(JSON.stringify(data));
                }
              }
              else if(charCode === 115) {
                if(guard_postition.left.y < 256) {
                  set_left_guard(guard_postition.left.y, true);
                  guard_postition.left.y += 8;
                  guard_postition.left.direction = 'down';
                  set_left_guard(guard_postition.left.y, false);

                  var data = {
                    payload: {
                      left: guard_postition.left,
                      player: player_number
                    },
                    type: 'move'
                  }
                  socket.send(JSON.stringify(data));
                }
              }
            }

          else if(player_number === 2) {
            if(charCode === 119) {
              if(guard_postition.right.y > 0) {
                set_right_guard(guard_postition.right.y, true);
                guard_postition.right.y -= 8;
                guard_postition.right.direction = 'up';
                set_right_guard(guard_postition.right.y, false);

                var data = {
                  payload: {
                    right: guard_postition.right,
                    player: player_number
                  },
                  type: 'move'
                }
                socket.send(JSON.stringify(data));
              }
            }
            else if(charCode === 115) {
              if(guard_postition.right.y < 256) {
                set_right_guard(guard_postition.right.y, true);
                guard_postition.right.y += 8;
                guard_postition.right.direction = 'down';
                set_right_guard(guard_postition.right.y, false);

                var data = {
                  payload : {
                    right: guard_postition.right,
                    player: player_number
                  },
                  type: 'move'
                }
                socket.send(JSON.stringify(data));
              }
            }
          }
        }
      });

      socket.onmessage = function(e){
        console.log("you've got a message", e);
        var edata = JSON.parse(e.data);
        console.log("edata is ",e.data)
        switch (edata.type) {
          case 'player_enter':
            player_enter(edata.payload);
            break;
          case 'start_game':
            start_game(edata.payload);
            break;
          case 'move':
            move(edata.payload);
            break;
          case 'game_over':
            game_over(edata.payload);
            break;
          default:
            alert(edata.type);
            break;
        } 
      };

      function player_enter(data) {
        if(data === 1)
          player_number = 1;
        else
          player_number = 2;
      };

      function start_game(data) {
        game_started = true;
      };

      function move(parsed_data) {
        // var parsed_data = JSON.parse(data);
        if(parsed_data.player === 2) {
          var position = parsed_data.right;
          set_right_guard(guard_postition.right.y, true);
          guard_postition.right.y = position.y;
          set_right_guard(guard_postition.right.y, false);
        }

        else if(parsed_data.player === 1) {
          var position = parsed_data.left;
          set_left_guard(guard_postition.left.y, true);
          guard_postition.left.y = position.y;
          set_left_guard(guard_postition.left.y, false);
        }
      };

      function game_over(data) {
        var winner = JSON.parse(data).winner;
        game_started = false;
        alert(winner + ' won.');
      }

    }
  });
}).call(this);
