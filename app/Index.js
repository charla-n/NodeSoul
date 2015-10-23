var gui = require("nw.gui");
var Prot = require('../app/Protocol.js');
var Client = require('../app/Client.js');

$(document).ready(function () {
    $("#close").click(function () {
        gui.App.quit();
    });
    $("#savailable").click(function () {
        Client.Netsoul.Send(Prot.Status("actif"));
    });
    $("#saway").click(function () {
        Client.Netsoul.Send(Prot.Status("away"));
    });
    $("#slocked").click(function () {
        Client.Netsoul.Send(Prot.Status("lock"));
    });
    $("#addcontact").click(function () {
        var new_win = gui.Window.open('addcontact.html');
    });
});
