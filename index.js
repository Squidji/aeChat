const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/', function(req, res) {
	res.render('index.ejs');
});

var userlist = [];
var typinglist = [];

var colorlist = ['#3d91d6', '#d04f4f', '#7dd044', '#b695ff', '#ff7247', '#fad543', '#ff4795']

io.sockets.on('connection', function(socket) {
    socket.on('username', function(username) {
		socket.username = username;
		userlist.push(socket.username);
		io.emit('is_online', '🔵 <i><b>' + socket.username + '</b> joined the chat..</i>');
		io.emit('upd_users', userlist);
    });

    socket.on('disconnect', function(username) {
		if (socket.username !== undefined) {
			io.emit('is_online', '🔴 <i><b>' + socket.username + '</b> left the chat..</i>');

			// remove from user list
			userlist = userlist.filter(function(n){ return n !== socket.username; });
			io.emit('upd_users', userlist);

			// remove from typing list
			typinglist = typinglist.filter(function(n){ return n !== socket.username; });
			io.emit('upd_typing', typinglist);
		};
    });

    socket.on('chat_message', function(message) {
		let c = userlist.indexOf(socket.username);
		if (c > colorlist.length-1) {c = '#3d91d6'} else {c = colorlist[c]};
        io.emit('chat_message', '<b style="color: '+c+';">' + socket.username + ':</b> ' + message);
	});

	socket.on('is_typing', function(username) {
		if (!typinglist.includes(username)) {
			typinglist.push(socket.username);
			io.emit('upd_typing', typinglist);
		};
	});
	socket.on('no_typing', function(username) {
		typinglist = typinglist.filter(function(n){ return n !== socket.username; });
		io.emit('upd_typing', typinglist);
	});
});

const server = http.listen(process.env.PORT || 8080, function() {
    console.log('listening on port');
});