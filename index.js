const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/', function(req, res) {
	res.render('index.ejs');
});

var userlist = [];
var typinglist = [];

io.sockets.on('connection', function(socket) {
    socket.on('username', function(username) {
		socket.username = username;
		userlist.push(socket.username);
		io.emit('is_online', '🔵 <i>' + socket.username + ' joined the chat..</i>');
		io.emit('users', userlist);
    });

    socket.on('disconnect', function(username) {
		io.emit('is_online', '🔴 <i>' + socket.username + ' left the chat..</i>');
		userlist = userlist.filter(function(n){ return n !== socket.username; });
		io.emit('users', userlist);
    });

    socket.on('chat_message', function(message) {
        io.emit('chat_message', '<strong>' + socket.username + '</strong>: ' + message);
	});
});

const server = http.listen(process.env.PORT || 8080, function() {
    console.log('listening on *:8080');
});