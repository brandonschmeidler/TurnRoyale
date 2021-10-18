var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var currentScene;
var socket;

const CELL_SIZE = 32;
var playerSprites = {}

function preload () {
    this.load.spritesheet("tileset","../assets/tileset.png",{frameWidth:CELL_SIZE,frameHeight:CELL_SIZE});
}

function create() {
    currentScene = this;
    socket = io();

    socket.on("spawn_players",(clients) => {
        spawnPlayers(clients);
    });

    socket.on("remove_player",(id) => {
        removePlayer(id);
    });
}

function update() {

}

function spawnPlayers(clients) {
    Object.keys(clients).forEach(id => {
        var client = clients[id];
        playerSprites[client.id] = currentScene.add.sprite(client.x * CELL_SIZE,client.y * CELL_SIZE,"tileset",1);
        playerSprites[client.id].tint = client.color;
    });
}

function removePlayer(id) {
    playerSprites[id].destroy();
    delete playerSprites[id];
}

// const ROOM_MATCHMAKING = "matchmaking";
// const ROOM_GAME = "game";

// var socket = io();
// var isInGame = false;

// const buttonGame = document.getElementById("buttonGame");
// const buttonMatchmaking = document.getElementById("buttonMatchmaking");

// buttonGame.addEventListener("click", () => {

//     // TODO: server needs to tell client what games are available
//     // then set this variable from server selection
//     joinRoom("game");
// });

// buttonMatchmaking.addEventListener("click", () => {
//     joinRoom("matchmaking");
// });

// function joinRoom(roomName) {
//     socket.emit("join_room",roomName);
// }