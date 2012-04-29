var app = require('express').createServer(),
    io = require('socket.io').listen(app),
    express = require('express');

app.listen(8080);

// Configuration
app.configure(function() {
    app.set('views', __dirname + '/views');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.static(__dirname + '/public'));
});

// Routing
app.get('/', function(req, res) {
    res.sendfile(__dirname + '/views/index.html');
});

// Usernames currently connected
var usernames = {};

// Socket
io.sockets.on('connection', function (socket) {
    // waiting for 'sendchat'
    socket.on('sendchat', function (data) {
        // execute 'updatechat with 2 params'
        io.sockets.emit('updatechat', socket.username, data);
    });

    socket.on('adduser', function (username) {
        // store the username in socket session
        socket.username = username;

        // add client's username to global list
        usernames[username] = username;

        //echo to client they connected
        socket.emit('updatechat', 'SERVER', 'You are now connected, hurray!');

        // echo globally someone has entered
        socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected.');

        // update the list of users in chat, client side
        io.sockets.emit('updateusers', usernames);
    });

    // Disconnect action
    socket.on('disconnect', function() {
        // remove username from global list
        delete usernames[socket.username];

        //update client side list
        io.sockets.emit('updateusers', usernames);

        // echo globally someone has left
        socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has left');
    });
});