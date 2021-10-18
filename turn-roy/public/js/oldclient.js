const GRID_SIZE = 11;
const CELL_SIZE = 32;

class GridObject extends Phaser.GameObjects.Sprite {
    constructor(scene,gridX,gridY,frame=0) {
        super(scene,gridX,gridY,"tileset",frame);
        this.snapToGrid()
        scene.add.existing(this);
    }

    move(xdir,ydir) {
        this.x += xdir * CELL_SIZE;
        this.y += ydir * CELL_SIZE;
    }

    snapToGrid() {
        this.x = Math.floor(this.x) * CELL_SIZE;
        this.y = Math.floor(this.y) * CELL_SIZE;
    }
}

class GridPlayer extends GridObject {
    constructor(scene,gridX,gridY) {
        super(scene,gridX,gridY,1);
        this.tint = 0xff0000;
    }
}

class GameGrid extends Phaser.GameObjects.Container {
    constructor(scene,x,y) {
        super(scene,x,y);
        
        for (var i = 0; i < GRID_SIZE; ++i) {
            for (var j = 0; j < GRID_SIZE; ++j) {
                this.add(new GridObject(scene,i,j));
            }
        }

        scene.add.existing(this);
    }
}

var socket;
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



function gameJoin() {
    socket.emit("game_join");
}
function gameLeave() {
    socket.emit("game_leave");
}

var game = new Phaser.Game(config);

function preload ()
{
    this.load.spritesheet("tileset","../assets/tileset.png",{frameWidth:32,frameHeight:32});
}

var players = {};
var gameGrid;

function create ()
{
    socket = io();
    gameGrid = new GameGrid(this,0,0);

    //freddy is my hero
    var thisscene = this;

    // ran when this client first connects to get a current player list
    socket.on("player_list", (player_list) => {
        //console.log("receiving player list");
        Object.keys(player_list).forEach(function (id) {
            players[id] = new GridPlayer(thisscene,player_list[id].x,player_list[id].y);
        });
    });

    // ran when somebody else joins while this client is already connected
    // gives new connected player"s data
    socket.on("player_joined", (player) => {
        //console.log(`Player Data: ${player}`);
        players[player.id] = new GridPlayer(thisscene,player.x,player.y);
    })

    socket.on("player_left", (playerID) => {
        players[playerID].destroy();
        delete players[playerID];

        console.log(players);
    });
}

var dt = 0;
function update(time,delta)
{

}