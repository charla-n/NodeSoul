var net = require("net");
var prot = require('../app/Protocol.js');
var socket;

function Network(port, host) {
    this.port = port;
    this.host = host;
    this.connected = false;
}

Network.prototype.Connect = function () {
    if (this.connected == false) {
        socket = net.connect(this.port, this.host);
        socket.on("data", OnData);
        this.connected = true;
    }
}

Network.prototype.Send = function (msg) {
    socket.write(msg);
}

Network.prototype.Disconnect = function () {
    if (this.connected == true) {
        socket.destroy();
        this.connected = false;
    }
}

function OnData(chunk) {
    prot.Parse(chunk.toString(), socket);
    console.log(chunk.toString());
}

module.exports = Network