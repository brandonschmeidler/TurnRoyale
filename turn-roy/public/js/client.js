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

const GRID_SIZE = 11;
const CELL_SIZE = 32;
var game = new Phaser.Game(config);
var currentScene;
var socket;
var outlineSprite;
var playerSprites = {};
var isGameRunning = false;


function preload () {
    this.load.spritesheet("tileset","../assets/tileset.png",{frameWidth:CELL_SIZE,frameHeight:CELL_SIZE});
}

function create() {
    currentScene = this;

    centerCamera();
    spawnGrid();


    outlineSprite = currentScene.add.sprite(0,0,"tileset",3);
    outlineSprite.visible = false;

    socket = io();

    socket.on("spawn_players",(clients) => {
        spawnPlayers(clients);
    });

    socket.on("remove_player",(id) => {
        removePlayer(id);
    });

    socket.on("test_timer",(msg) => {
        console.log(msg);
    });
}

function update() {

}



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
        if (client.id === socket.id) {
            // this is my player piece
            outlineSprite.x = client.x * CELL_SIZE;
            outlineSprite.y = client.y * CELL_SIZE;
            outlineSprite.visible = true; 
        }
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