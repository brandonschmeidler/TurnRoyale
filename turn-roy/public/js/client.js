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
var outlineSprite;

const GRID_SIZE = 11;
const CELL_SIZE = 32;

var playerSprites = {};

function preload () {
    this.load.spritesheet("tileset","../assets/tileset.png",{frameWidth:CELL_SIZE,frameHeight:CELL_SIZE});
}

function create() {
    currentScene = this;

    centerCamera();
    spawnGrid();

    outlineSprite = currentScene.add.sprite(0,0,"tileset",3);
    currentScene.input.on("pointermove", (pointer) => {
        outlineSprite.x = Math.floor(((pointer.x + (CELL_SIZE / 2)) + currentScene.cameras.main.scrollX) / CELL_SIZE) * CELL_SIZE;
        outlineSprite.y = Math.floor(((pointer.y + (CELL_SIZE / 2)) + currentScene.cameras.main.scrollY) / CELL_SIZE) * CELL_SIZE;
        console.log(`Mouse: (${pointer.x},${pointer.y})`);
    });

    socket = io();

    socket.on("spawn_players",(clients) => {
        spawnPlayers(clients);
    });

    socket.on("remove_player",(id) => {
        removePlayer(id);
    });
}

function update() {}

function centerCamera() {
    var gridBound = GRID_SIZE * CELL_SIZE;
    var cx = (CELL_SIZE / 2) + ((config.width - gridBound) / 2);
    var cy = (CELL_SIZE / 2) + ((config.height - gridBound) / 2);
    
    //currentScene.cameras.main.setBounds(-cx,-cy,config.width,config.height);
    currentScene.cameras.main.setScroll(-cx,-cy);
}

function spawnGrid() {
    for (var i = 0; i < GRID_SIZE; ++i) {
        for (var j = 0; j < GRID_SIZE; ++j) {
            currentScene.add.sprite(i * CELL_SIZE, j * CELL_SIZE, "tileset", 0);
        }
    }
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