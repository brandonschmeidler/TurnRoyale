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
    queuedClients.queue(clients[socket.id]);

    console.log(`${socket.id} has connected. ${getClientCount()} players connected.`);
    
    return clients[socket.id];
}

function dequeueClientGroupForNewMatch() {
    // Pull clients out of the queue and put them in a list
    var clientGroup = {};
    for (var i = 0; i < queuedClients.threshold; ++i) {
        var client = queuedClients.dequeue();
        clientGroup[client.id] = client;
    }
    return clientGroup;
}

function createNewMatch(clientGroup) {
    
    // Create a new match instance with those clients
    // and add the new match to the list of running matches
    var match = new Match(clientGroup);
    runningMatches[ match.id ] = match;
    match.randomizePlayers();
    console.log(`Creating new match ${match.id}.`);

    // Put the clients into their own room for the server to emit messages to
    // This should keep all the client groups separated in their own matches
    Object.keys(clientGroup).forEach(id => {
        clientGroup[id].matchID = match.id;
        io.sockets.sockets.get(id).join(match.id);
    });

    return match;
}

function initNewMatch() {
    var clientGroup = dequeueClientGroupForNewMatch();
    
    var match = createNewMatch(clientGroup);

    io.to(match.id).emit("spawn_players",match.players);
}

function removeClientFromMatch(client) {
    console.log(`${client.id} is leaving match ${client.matchID}.`)
    var match = runningMatches[client.matchID];
    match.removePlayer(client.id);
    
    if (match.getPlayerCount() > 0) {
        // Tell all the clients in this match that this player has disconnected
        io.to(client.matchID).emit("remove_player",client.id);
    } else {
        // Nobody is in the match anymore so delete that shnizzzz
        console.log(`Deleting match ${match.id}.`)
        delete runningMatches[match.id];
    }
}

io.on("connection", (socket) => {
    var client = initClientConnection(socket);
    
    // if there are enough clients queued for a game setup a new match
    if (queuedClients.length === queuedClients.threshold) { initNewMatch(); }

    socket.on("disconnect", () => {

        var client = clients[socket.id];
        
        if (client.matchID != -1) {
            removeClientFromMatch(client);
        }

        // Remove client from server's client list
        delete clients[socket.id];
        console.log(`${socket.id} has disconnected. ${getClientCount()} clients connected.`);

    });

});