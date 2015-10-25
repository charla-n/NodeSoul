var Network = require("../app/Network.js");
var Client = require('../app/Client.js');
var Storage = require("../app/Storage.js");
var Protocol = require('../app/Protocol.js');

var db = new Storage(openDatabase(Storage.dbname, Storage.version, Storage.comment, Storage.size));
Client.Netsoul = new Network(4242, "ns-server.epita.fr");

var getUserCallback = function (user) {
    if (user != null) {
        $("#user_login").val(user.login);
        Client.SetLogin(user.login);
        Client.SetData(user.data);
        Client.SetLocation(user.location);
        Client.Id = user.id;
    }
    else {
        db.InsertUser("login_x", "none", "nodesoul");
    }
}

var insertUserCallback = function () {
    db.GetUser();
}

$(document).ready(function () {
    $("#connect").click(function () {
        LoginCalled($("#user_login").val(), $("#user_password").val());
    });
    $("#user_login").keypress(function (e) {
        if (e.which == 13) {
            LoginCalled($("#user_login").val(), $("#user_password").val());
        }
    });
    $("#user_password").keypress(function (e) {
        if (e.which == 13) {
            LoginCalled($("#user_login").val(), $("#user_password").val());
        }
    });
    
    db.on("insertuser", insertUserCallback);
    db.on("getuser", getUserCallback);
    db.GetUser();
});

function LoginCalled(login, pwd) {
    
    Protocol.Emitter.once("auth", function (res) {
        if (res == true) {
            window.location.href = "index.html";
            db.removeListener("getuser", getUserCallback);
            db.removeListener("insertuser", insertUserCallback);
        }
        else {
            Client.Netsoul.Disconnect();
            $.Notify({
                caption: 'Unable to login',
                content: 'Please check your credentials',
                type: 'alert'
            });
        }
    });

    Client.SetLogin(login);
    Client.SetPwd(pwd);
    db.UpdateUser(login, Client.GetData(), Client.GetLocation(), Client.Id);
    Client.Netsoul.Connect();
}