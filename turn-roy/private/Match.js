const Player = require('./Player');
const { v4: uuidv4 } = require("uuid");

class Match {

    constructor(clients) {
        this.players = {};
        this.id = uuidv4();
        
        Object.keys(clients).forEach(id => {
            this.addPlayer(id);
        });

    }

    randomizePlayers() {

        Object.keys(this.players).forEach(id => {
            this.players[id].x = Math.floor(Math.random() * 10);
            this.players[id].y = Math.floor(Math.random() * 10);
    
            var colors = [ 0xffff00, 0x00ffff, 0xff00ff ];
            this.players[id].color = colors[Math.floor(Math.random() * 3)];
        });

    }

    addPlayer(id) {
        this.players[id] = new Player(id);
    }

    removePlayer(id) {
        delete this.players[id];
    }

    getPlayerCount() {
        return Object.keys(this.players).length;
    }

}

module.exports = Match;