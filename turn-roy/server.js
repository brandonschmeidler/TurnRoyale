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


const Client = require("./private/Client");
const Match = require("./private/Match");
const Player = require("./private/Player");

var clients = {};
var runningMatches = {};

var queuedClients = [];
queuedClients.threshold = 4;
queuedClients.queue = function(client) {
    queuedClients.push(client);
}
queuedClients.dequeue = function() {
    return queuedClients.shift();
}

function getClientCount() {
    return Object.keys(clients).length;
}

function initClientConnection(socket) {
    clients[socket.id] = new Client(socket.id);

    console.log(`${socket.id} has connected. ${getClientCount()} players connected.`);
    
    return clients[socket.id];
}

function queueClientForNextGame(client) {
    queuedClients.push(client);
}

// function gameStart() {
//     console.log("Game is starting.");
//     currentMatch = new Match(clients);
//     io.emit("spawn_players",clients);
// }

// function gameEnd() {
//     currentMatch = null;
//     console.log("Game has ended.");
// }

io.on("connection", (socket) => {
    var client = initClientConnection(socket);

    queuedClients.queue(client);
    
    // if there are enough clients queued for a game
    // setup a new match
    if (queuedClients.length === queuedClients.threshold) {
        
        // Pull clients out of the queue and put them in a list
        var nextGameClients = {};
        for (var i = 0; i < queuedClients.threshold; ++i) {
            var nextClient = queuedClients.dequeue();
            nextGameClients[nextClient.id] = nextClient;
        }
        
        // Create a new match instance with those clients
        // and add the new match to the list of running matches
        var nextMatch = new Match(nextGameClients);
        runningMatches[ nextMatch.id ] = nextMatch;
        nextMatch.randomizePlayers();

        // Put the clients into their own room for the server to emit messages to
        // This should keep all the client groups separated in their own matches
        Object.keys(nextGameClients).forEach(id => {
            io.sockets.sockets.get(id).join(nextMatch.id);
        });


        io.to(nextMatch.id).emit("spawn_players",nextMatch.players);
    }

    socket.on("disconnect", () => {
        delete clients[socket.id];
        console.log(`${socket.id} has disconnected. ${getClientCount()} players connected.`)
        
        // If game is running tell other clients this client has disconnected
        // so they need to delete this client's player instance
        // if (isGameRunning()) {
        //     socket.broadcast.emit("remove_player",socket.id);

        //     // Nobody is connected anymore so no game
        //     if (getClientCount() <= 1) {
        //         gameEnd();
        //     }
        // }
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