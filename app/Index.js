var gui = require("nw.gui");
var Prot = require('../app/Protocol.js');
var Client = require('../app/Client.js');
var swig = require('swig');
var Storage = require("../app/Storage.js");

if (Client.Connected == false) {
    window.location.href = "auth.html";
}

$(document).ready(function () {
    $("#close").click(function () {
        gui.App.quit();
    });
    $("#savailable").click(function () {
        Client.Netsoul.Send(Prot.Status("actif"));
        setState(Client.GetState());
    });
    $("#saway").click(function () {
        Client.Netsoul.Send(Prot.Status("away"));
        setState(Client.GetState());
    });
    $("#slocked").click(function () {
        Client.Netsoul.Send(Prot.Status("lock"));
        setState(Client.GetState());
    });
    $("#addcontact").click(function () {
        var new_win = gui.Window.open('addcontact.html');

        new_win.on("close", function () {
            this.hide();
            render();
        });
    });
    setState(Client.GetState());
    ListAndWatchUsers();
    Prot.Emitter.on("listuser", function (contact) {
        render();
    });
    Prot.Emitter.on("watchuser", function (contact) {
        render();
    });
});

function setState(state) {
    $("#sstate").html(state);
}

function render() {
    $("#scontacts").html(swig.renderFile("./views/index.tpl.html", {
        contacts: Client.GetContacts()
    }));
}

function ListAndWatchUsers() {
    var db = new Storage(openDatabase(Storage.dbname, Storage.version, Storage.comment, Storage.size));
    
    db.once("getallcontacts", function (rows) {
        
        Client.FlushContact();
        var len = rows.length, i;
        var logins = "";
        if (len > 0) {
            logins += rows.item(0).login;
            Client.AddContact(rows.item(0).login);
        }
        else {
            return;
        }
        for (i = 1; i < len; i++) {
            logins += "," + rows.item(i).login;
            Client.AddContact(rows.item(i).login);
        }
        render();
        Client.Netsoul.Send(Prot.ListUsers(logins));
        Client.Netsoul.Send(Prot.Watch(logins));
    });
    db.GetAllContacts();
}


