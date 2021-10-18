const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server, Socket } = require("socket.io");
const io = new Server(server);

app.use(express.static(__dirname + "/public"));

app.get("/", (req,res) => {
    res.sendFile(__dirname + "/index.html");
});

server.listen(8081,() => {
    console.log(`Listening on ${server.address().port}`);
});




const Player = require("./private/Player");

var clients = {};
function getClientCount() {
    return Object.keys(clients).length;
}

var isGameRunning = false;
function gameStart() {
    isGameRunning = true;

    console.log("Game is starting.");

    // randomly position clients on grid
    Object.keys(clients).forEach(id => {
        clients[id].x = Math.floor(Math.random() * 10);
        clients[id].y = Math.floor(Math.random() * 10);
        clients[id].color = Math.floor(Math.random() * 2) == 0 ? 0xffff00 : 0x00ffff;
    });

    io.emit("spawn_players",clients);
}

function gameEnd() {
    isGameRunning = false;
    console.log("Game has ended.");
}

io.on("connection", (socket) => {

    clients[socket.id] = new Player(socket.id);
    
    console.log(`${socket.id} has connected. ${getClientCount()} players connected.`);
    
    if (!isGameRunning && getClientCount() === 4) { gameStart(); }

    socket.on("disconnect", () => {
        delete clients[socket.id];
        console.log(`${socket.id} has disconnected. ${getClientCount()} players connected.`)
        
        // If game is running tell other clients this client has disconnected
        // so they need to delete this client's player instance
        if (isGameRunning) {
            socket.broadcast.emit("remove_player",socket.id);

            // Nobody is connected anymore so no game
            if (getClientCount() === 0) {
                gameEnd();
            }
        }
    });

});


// // Game Classes
// const Match = require("./private/Match");

// // Game
// const GRID_SIZE = 11;
// var currentMatch = new Match(GRID_SIZE);

// function player_connected(socket) {
//     console.log(`Player ${socket.id} has connected.`);
// }

// function player_disconnected(socket) {
//     console.log(`Player ${socket.id} has disconnected.`);
// }

// function player_join_game(socket) {
//     currentMatch.addPlayer(socket.id);
//     console.log(`${socket.id} has joined the game.`)
// }

// function player_leave_game(socket) {
//     currentMatch.removePlayer(socket.id);
//     console.log(`${socket.id} has left the game.`);
// }


// io.on("connection", (socket) => {
    
//     // player has only connected to the server
//     // they haven't joined a game yet
//     player_connected(socket);
    
//     // Send player list to client
//     socket.emit("player_list",currentMatch.players);

//     // Broadcast to all clients that a new client has joined
//     socket.broadcast.emit("player_connected", currentMatch.players[socket.id]);

//     // When this client disconnects
//     socket.on("disconnect", () => {
        
//         player_disconnected();
        
//         // only if player is actively in a match
//         //currentMatch.removePlayer(socket.id);

//         // Tell the other clients that this client has left
//         socket.broadcast.emit("player_disconnected",socket.id);

//     });

//     // When this client clicks "Join Game" button
//     socket.on("game_join", () => {
        
//         player_join_game(socket.id);

//     });

//     // When client clicks "Leave Game" Button
//     socket.on("game_leave", () => {

//         player_leave_game(socket.id);

//     })

// });