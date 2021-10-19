class Client {
    constructor(id) {
        this.id = id;
        this.username = "USER_" + id;
        this.matchID = -1; // this is how you know if a client is in a game or not
    }
}



module.exports = Client;