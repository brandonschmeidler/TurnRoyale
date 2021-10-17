// Server 
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

// Game Classes
const Player = require("./private/Player");
const Match = require("./private/Match");

// Game
const GRID_SIZE = 11;

var currentMatch = new Match(GRID_SIZE);

app.use(express.static(__dirname + '/public'));

app.get('/', (req,res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log(`Socket ${socket.id} connected.`);
    
    currentMatch.addPlayer(socket.id);
    
    // Send player list to this client
    socket.emit("player_list",currentMatch.players);

    // Tell already connected clients about this client
    socket.broadcast.emit("player_joined", currentMatch.players[socket.id]);

    // When this client disconnects
    socket.on('disconnect', () => {
        
        console.log(`Socket ${socket.id} disconnected.`);
        currentMatch.removePlayer(socket.id);

        // Tell the other clients that this client has left
        socket.broadcast.emit("player_left",socket.id);

    });

    // When this client clicks "Ready Up" button
    socket.on('player_ready', () => {
        
        console.log(`${socket.id} is ready`);

    })

});

server.listen(8081,() => {
    console.log(`Listening on ${server.address().port}`);
})