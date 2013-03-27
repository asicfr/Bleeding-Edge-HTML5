
var u = require("underscore");

var GameState = function() {

    this.started = false;
    this.id  = 0;
    this.players = [];

    this.players.push({
       hal      : true,
       email    : "hal@hal.com",
       score    : 4
    });

    this.getPlayer = function(email) {
        for(var i=0; i<this.players.length; i++) {
            var player = this.players[i];
            if(player.email==email) {
                return player;
            }
        }
       return null;
    };

    this.createPlayer = function(userData) {
        var newPlayer = u.extend(userData, {
            score : 0
        });
        this.players.push(newPlayer);
        return newPlayer;
    }

};

/**
 * The Game Manager
 *
 * @constructor
 */
var Game = function() {

    var game = this;

    this.reset = function(socket) {
        this.socket = socket;
        this.state = new GameState();
    };

    this.initialize = function(socket) {
        this.reset(socket);

        socket.on("connection", function(client) {

            var player = null;

            console.log("client connected");

            client.on("game:authenticate", function(userData) {

                console.log("authenticate", userData);

                player = game.state.getPlayer(userData.email);
                if(player==null) {
                    player = game.state.createPlayer(userData);
                }

                socket.emit("game:sync", game.state);

                game.interval = setInterval(function() {
                    socket.emit("game:sync", game.state);
                }, 2500);

            });

            client.on("cat:detected", function(data) {

                var catCount = data.count;
                console.log("added " + catCount + " cats to user " + player.email);

                player.score += catCount;
            });

            client.on('disconnect', function() {

                console.log("client disconnected");
                clearInterval(game.interval);

            });

        });

    };

    this.notification = function() {
        if (window.webkitNotifications.checkPermission() == 0) {
          window.webkitNotifications.createNotification(null, "One point!","One point!").show();
        }
    }

};

exports = module.exports = Game;