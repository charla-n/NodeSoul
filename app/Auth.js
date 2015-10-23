﻿var Network = require("../app/Network.js");
var Client = require('../app/Client.js');
var Storage = require("../app/Storage.js");

var db = new Storage(openDatabase(Storage.dbname, Storage.version, Storage.comment, Storage.size));
Client.Netsoul = new Network(4242, "ns-server.epita.fr");

$(document).ready(function () {
    $("#connect").click(function () {
        LoginCalled($("#user_login").val(), $("#user_password").val());
    });

    db.on("getuser", function (user) {
        if (user != null) {
            $("#user_login").val(user.login);
            Client.SetLogin(user.login);
            Client.SetData(user.data);
            Client.SetLocation(user.location);
        }
    });
    db.GetUser();
});

function LoginCalled(login, pwd) {
    Client.SetLogin(login);
    Client.SetPwd(pwd);
    db.UpdateUser(login, Client.GetData(), Client.GetLocation());
    Client.Netsoul.Connect();
    window.location.href = "index.html";
}