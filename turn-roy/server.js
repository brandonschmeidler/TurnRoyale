const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

class Player {
    constructor(id) {
        this.x = 0;
        this.y = 0;
        this.color = (Math.floor(Math.random() * 2) == 0) ? 0xff0000 : 0x00ff00;
        this.id = id;
    }
}

var players = {};

app.use(express.static(__dirname + '/public'));

app.get('/', (req,res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log(`Socket ${socket.id} connected.`);
    players[socket.id] = {
        x: Math.floor(Math.random() * 10),
        y: Math.floor(Math.random() * 10),
        color: (Math.floor(Math.random() * 2) == 0) ? 0xff0000 : 0x00ff00,
        id: socket.id
    };
    
    // send new connecting client the current player list
    console.log(players);
    socket.emit('player_list', players);

    // broadcast to everybody else that this new client is here
    socket.broadcast.emit('player_joined', players[socket.id]);

    socket.on('disconnect', () => {
        console.log(`Socket ${socket.id} disconnected.`);
        delete players[socket.id];
        // one last holla back at ya boiii
        socket.broadcast.emit('player_left',socket.id);
        console.log(players);
    });

});

server.listen(8081,() => {
    console.log(`Listening on ${server.address().port}`);
})