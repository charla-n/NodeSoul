var net = require("net");
var prot = require('../app/Protocol.js');

function Network(port, host) {
    this.port = port;
    this.host = host;
    this.connected = false;
}

Network.prototype.Connect = function () {
    if (this.connected == false) {
        this.socket = net.connect(this.port, this.host);
        this.socket.on("data", function (chunk) {
            prot.Parse(chunk.toString(), this.socket);
            console.log(chunk.toString());
        }.bind({ socket: this.socket }));
        this.socket.on("error", function () {
            prot.Emitter.emit("auth", false);
        });
        this.connected = true;
    }
}

Network.prototype.Send = function (msg) {
    this.socket.write(msg);
}

Network.prototype.Disconnect = function () {
    if (this.connected == true) {
        this.socket.destroy();
        this.connected = false;
    }
}

module.exports = Network