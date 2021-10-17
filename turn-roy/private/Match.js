const Player = require('./Player');

class Match {

    constructor(gridSize = 11) {

        this.gridSize = gridSize;
        this.players = {};
        this.playerGrid = []
        for (var i = 0; i < gridSize; ++i) {
            this.playerGrid[i] = [];
            for (var j = 0; j < gridSize; ++j) {
                this.playerGrid[i][j] = 0;
            }
        }

    }

    addPlayer(id) {
        var gridX = Math.floor(Math.random() * (this.gridSize-1));
        var gridY = Math.floor(Math.random() * (this.gridSize-1));

        // If first random position is already taken 
        // find an open spot on the grid
        while (this.playerGrid[gridX][gridY] != 0) {
            gridX = Math.floor(Math.random() * (this.gridSize-1));
            gridY = Math.floor(Math.random() * (this.gridSize-1));
        }

        this.players[id] = new Player(id,gridX,gridY);
    }

    removePlayer(id) {
        var player = this.players[id];
        this.playerGrid[player.x][player.y] = 0;
        delete this.players[id];
    }

}

module.exports = Match;