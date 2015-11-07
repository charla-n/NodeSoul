var gui = require("nw.gui");
var Prot = require('../app/Protocol.js');
var Client = require('../app/Client.js');
var swig = require('swig');
var Storage = require("../app/Storage.js");

var elem;
var db = new Storage(openDatabase(Storage.dbname, Storage.version, Storage.comment, Storage.size));

//if (Client.Connected == false) {
//    window.location.href = "auth.html";
//}

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
            this.close(true);
        });
    });
    $("#ignorecontactbtn").click(function () {
        if (elem !== undefined) {
            var login = elem.innerText.trim().split(" ")[0];
            var ignored = Client.GetContact(login).ignored;
            if (ignored == 1) {
                ignored = 0;
            }
            else {
                ignored = 1;
            }
            Client.IgnoreContact(login, ignored);
            db.UpdateContact(login, ignored);
        }
    });
    $("#removecontactbtn").click(function () {
        if (elem !== undefined) {
            var login = elem.innerText.trim().split(" ")[0];
            console.log("remove " + login);
            Client.RemoveContact(login);
            db.RemoveContact(login);
        }
    });
    $("#SendMsg").click(function () {
        Client.Netsoul.Send(Prot.Msg(elem.innerText.trim().split(" ")[0], $("#msgtextarea").val(), $('span:first', elem).attr("id")));
        $("#msgtextarea").val("");
    });
    $("#msgtextarea").keydown(function (e) {
        if (e.ctrlKey && e.keyCode == 13) {
            Client.Netsoul.Send(Prot.Msg(elem.innerText.trim().split(" ")[0], $("#msgtextarea").val(), $('span:first', elem).attr("id")));
            $("#msgtextarea").val("");
        }
    });
    setState(Client.GetState());
    ListAndWatchUsers();
    Prot.Emitter.on("listuser", function (contact) {
        render();
    });
    Prot.Emitter.on("watchuser", function (contact) {
        render();
    });
    Client.Emitter.on("removecontact", function () {
        render();
    });
    Client.Emitter.on("updatecontact", function () {
        render();
    });
    Client.Emitter.on("inserthistory", function (obj) {
        $("#recmsg").append(obj);
        $('#msgcontent').scrollTop($("#msgcontent")[0].scrollHeight);
    });
    Client.Emitter.on("unreadhistory", function () {
        render();
    });
});

function setState(state) {
    $("#sstate").html(state);
}

function render() {
    $("#lv1").html(swig.renderFile("./views/index.tpl.html", {
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
            Client.AddContact(rows.item(0).login, rows.item(0).ignored);
        }
        else {
            return;
        }
        for (i = 1; i < len; i++) {
            logins += "," + rows.item(i).login;
            Client.AddContact(rows.item(i).login, rows.item(i).ignored);
        }
        render();
        Client.Netsoul.Send(Prot.ListUsers(logins));
        Client.Netsoul.Send(Prot.Watch(logins));
    });
    db.GetAllContacts();
}

function onListClick(gelem) {
    console.log(gelem);
    if (elem !== undefined) {
        elem.style.background = "none";
    }
    elem = gelem[0];
    Client.ChangeSelected(elem.innerText.trim().split(" ")[0], $('span:first', elem).attr("id"));
    $("#recmsg").html(Client.GetHistoryFromPosition(elem.innerText.trim().split(" ")[0], $('span:first', elem).attr("id")));
    render();
}