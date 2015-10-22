var Network = require("../app/Network.js");
var Client = require('../app/Client.js');
var Prot = require('../app/Protocol.js');

var soulnet = new Network(4242, "ns-server.epita.fr");

$(document).ready(function () {
    $("#connect").click(function () {
        Client.SetLogin($("#user_login").val());
        Client.SetPwd($("#user_password").val())
        soulnet.Connect();
        window.location.href = "index.html";
    });
});

//var stdin = process.openStdin();

//stdin.addListener("data", function (d) {
//    var splitted = d.toString().replace(/\r\n|\n/, "").split("|");
//    console.log("joined = [" + splitted.join(",") + "]");
//    if (splitted[0] === "msg") {
//        soulnet.Send(Prot.Msg(splitted[1], splitted[2]));
//    }
//    else if (splitted[0] === "list") {
//        soulnet.Send(Prot.ListUsers(splitted[1]));
//    }
//    else if (splitted[0] === "watch") {
//        soulnet.Send(Prot.Watch(splitted[1]));
//    }
//    else if (splitted[0] === "quit") {
//        soulnet.Send(Prot.Quit());
//        soulnet.Disconnect();
//    }
//    else if (splitted[0] === "connect") {
//        soulnet.Connect();
//    }
//    else if (splitted[0] === "status") {
//        soulnet.Send(Prot.Status(splitted[1]));
//    }
//    else if (splitted[0] === "adduser") {
//        Client.AddContact(splitted[1]);
//        Prot.ListUsers(splitted[1]);
//    }
//    else if (splitted[0] == "getusers") {
//        console.log(Client.GetContacts());
//    }
//});