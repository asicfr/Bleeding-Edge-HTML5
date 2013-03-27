// config
var PORT = 8000;

// deps
var express = require('express');
var socket = require('socket.io');
var engine = require('ejs-locals');

var app = express();
app.use(express.static(__dirname + '/public'));

app.engine('ejs', engine);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// routes

app.get('/', function(req, res) {
    res.render('cat', { title: 'Space Chatons' });
});

app.get('/hal', function(req, res) {
    res.render('hal', { title: 'Space Chatons - HAL' });
});

app.get('/credits', function(req, res) {
    res.render('credits', { title: 'Space Chatons - Credits' });
});

app.get('/sphere', function(req, res) {
    res.render('sphere', { title: 'Space Chatons - Sphere' });
});


// socket-io
var server = app.listen(PORT);
var io = socket.listen(server);

// initializing game !
var Game = require("./game.js");
var game = new Game();
game.initialize(io.sockets);

// let's rock
console.log("Application started on port : " + PORT);