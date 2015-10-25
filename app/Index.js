var gui = require("nw.gui");
var Prot = require('../app/Protocol.js');
var Client = require('../app/Client.js');
var swig = require('swig');
var Storage = require("../app/Storage.js");

var menu = new Menu();
var px = 0;
var py = 0;
var elem;
var db = new Storage(openDatabase(Storage.dbname, Storage.version, Storage.comment, Storage.size));

if (Client.Connected == false) {
    window.location.href = "auth.html";
}

$(document).ready(function () {
    $("#scontacts").mousemove(function (event) {
        px = event.pageX;
        py = event.pageY;
    });
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
    db.on("deletecontact", function () {
        render();
    });
    db.on("updatecontact", function () {
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

function onListClick(gelem) {
    console.log(gelem);
    elem = gelem;
    menu.popup(px, py);
}

function Menu() {
    var menu = new gui.Menu()

      , msg = new gui.MenuItem({
            label: "Message"
            , click: function () {
                console.log('Menu:', 'message');
            }
        })

      , ignore = new gui.MenuItem({
            label: "Ignore/Unignored"
            , click: function () {
                var login = elem[0].innerText.split(" ")[0];
                var ignored = !Client.GetContact(login).ignored;
                Client.IgnoreContact(login, ignored);
                db.UpdateContact(login, ignored);
            }
        })

      , remove = new gui.MenuItem({
            label: "Remove"
            , click: function () {
                var login = elem[0].innerText.split(" ")[0];
                Client.RemoveContact(login);
                db.RemoveContact(login);
            }
        })
    ;
    
    menu.append(msg);
    menu.append(ignore);
    menu.append(remove);
    
    return menu;
}