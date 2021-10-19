class Client {
    constructor(id) {
        this.id = id;
        this.username = "USER_" + id;
        this.currentMatchIndex = -1;
    }
}



module.exports = Client;