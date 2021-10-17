class Player {
    constructor(id,x=0,y=0,color=0xffffff) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.id = id;
        this.hp = 10;
    }
}
module.exports = Player;