var Client = require('../app/Client.js');
var util = require('util');
var crypto = require('crypto');
var underscore = require('underscore');
var EventEmitter = require('events').EventEmitter;

var emitter = new EventEmitter();
var args;

const REP_OK = "rep 002 -- cmd end";
const AUTH_FAILED = "rep 033 -- ext user identification fail";

function Parse(msg, client) {
    args = msg.split(/\r\n|\n/);
    underscore.each(args, function (arr) {
        if (arr === AUTH_FAILED) {
            emitter.emit("auth", false);
            return;
        }
        if (arr === REP_OK || arr.length == 0) {
            if (arr === REP_OK && Client.Connected == 0) {
                Client.Connected++;
            }
            else if (arr === REP_OK && Client.Connected == 1) {
                Client.Connected++;
                emitter.emit("auth", true);
            }
            return;
        }
        // salut cmd
        if (arr.startsWith("salut") == true) {
            Salut(msg, client);
        }
        // ping cmd
        else if (msg.startsWith("ping") == true) {
            client.write(msg);
        }
        // others
        else {
            var splittedarr = arr.split(" ");
            // msg rec
            if (splittedarr.length >= 5 && splittedarr[0] === "user_cmd" && splittedarr[2] === "|" && splittedarr[3] === "msg") {
                RespMsg(splittedarr);
            }
            // watch rec
            else if (splittedarr.length >= 4 && splittedarr[0] === "user_cmd" && splittedarr[2] === "|" &&
                (splittedarr[3] == "login" || splittedarr[3] == "logout" || splittedarr[3] == "state")) {
                RespWatch(splittedarr);
            }
            // list_users rec
            else if (splittedarr.length == 12) {
                RespListUsers(splittedarr);
            }
            else {
                console.error("unknown message = [" + arr + "]");
            }
        }
    });
}

function RespMsg(splittedarr) {
    splittedarr[4] = splittedarr[4].replace(/\%0A|\%0a|\%0D|\%0d|\%0d0a|\%0D0A/g, "<br/>");
    var msg = unescape(splittedarr[4]);
    var dpsplitted = splittedarr[1].split(":");
    var loginsplitted = dpsplitted[3].split("@");
    var currentdate = new Date();
    var finalmsg = "<table><tr><td valign=\"top\" style=\"color: #C0C0C0; font-size: 0.9em\">["+
    ((currentdate.getHours() < 10 ? '0' : '') + currentdate.getHours()) + ":" + 
    ((currentdate.getMinutes() < 10 ? '0' : '') + currentdate.getMinutes()) + ":" + 
    ((currentdate.getSeconds() < 10 ? '0' : '') + currentdate.getSeconds()) + "]</td>" +
    "<td style=\"font-size: 0.9em\">&lt;<span style=\"font-weight: bold; color: red\">" + loginsplitted[0] +
    "</span>&gt;&nbsp;" + msg + "</td></tr></table><span class=\"bottom\"></span>";
    Client.InsertHistory(loginsplitted[0], finalmsg, dpsplitted[0]);
    console.log(finalmsg);
}

function RespWatch(splittedarr) {
    var dpsplitted = splittedarr[1].split(":");
    var loginsplitted = dpsplitted[3].split("@");
    var loginindex = FindLoginIndex(loginsplitted[0]);

    if (loginindex != -1) {
        var positionindex = FindPositionIndex(loginindex, dpsplitted[0]);
        if (positionindex != -1) {
            if (splittedarr[3] === "state") {
                Client.GetContacts()[loginindex].positions[positionindex].status = splittedarr[4].split(":")[0];
            }
            else if (splittedarr[3] === "logout") {
                Client.RemovePosition(loginindex, positionindex);
            }
            emitter.emit("watchuser", Client.GetContacts()[loginindex]);
        }
        else if (splittedarr[3] === "login") {
            Client.GetContacts()[loginindex].positions.push(UpdatePositionFromWatch(dpsplitted, splittedarr[3]));
            emitter.emit("watchuser", Client.GetContacts()[loginindex]);
        }
    }
}

function Salut(msg, client) {
    
    Client.Connected = false;

    var salutArgs = msg.split(" ");
    var res = crypto.createHash('md5').update(salutArgs[2] + "-" + salutArgs[3] + "/" + salutArgs[4] + Client.GetPwd()).digest("hex");
    
    client.write("auth_ag ext_user none none\n");
    client.write(util.format("ext_user_log %s %s none nodesoul\n", Client.GetLogin(), res));
    client.write(Status("actif"));
}

function RespListUsers(splittedarr) {
    var contactindex = FindLoginIndex(splittedarr[1]);
    if (contactindex != -1) {
        var positionindex = FindPositionIndex(contactindex, splittedarr[0]);
        if (positionindex != -1) {
            Client.GetContacts()[contactindex].positions[positionindex] = UpdatePosition(splittedarr);
            console.log(Client.GetContacts());
        }
        else {
            Client.GetContacts()[contactindex].positions.push(UpdatePosition(splittedarr));
            console.log(Client.GetContacts());
        }
        emitter.emit("listuser", Client.GetContacts()[contactindex]);
    }
}

function FindLoginIndex(login) {
    return underscore.findIndex(Client.GetContacts(), function (cur) {
        if (cur.login === login)
            return true;
    });
}

function FindPositionIndex(loginindex, socket) {
    return underscore.findIndex(Client.GetContacts()[loginindex].positions, function (cur) {
        if (socket == cur.socket) {
            return true;
        }
    });
}

function UpdatePosition(arr) {
    return {
        socket: arr[0], host: arr[2], trustlevel: arr[5] + arr[6], workstationtype: arr[7], 
        location: unescape(arr[8]), group: arr[9], status: arr[10].split(":")[0], userdata: unescape(arr[11])
    };
}

function UpdatePositionFromWatch(arr, gstatus) {
    return {
        socket: arr[0], host: arr[3].split("@")[1], trustlevel: arr[2], workstationtype: arr[4],
        location: unescape(arr[5]), group: arr[6], status: gstatus, userdata: ""
    };
}

function Msg(to, msg, socket) {
    var displaymsg = msg.replace(/\%0A|\%0a|\%0D|\%0d|\%0d0a|\%0D0A/g, "<br/>");
    var currentdate = new Date();
    var finalmsg = "<table><tr><td valign=\"top\" style=\"color: #C0C0C0; font-size: 0.9em\">[" +
    ((currentdate.getHours() < 10 ? '0' : '') + currentdate.getHours()) + ":" + 
    ((currentdate.getMinutes() < 10 ? '0' : '') + currentdate.getMinutes()) + ":" + 
    ((currentdate.getSeconds() < 10 ? '0' : '') + currentdate.getSeconds()) + "]</td>" +
    "<td style=\"font-size: 0.9em\">&lt;<span style=\"font-weight: bold; color: blue\">me" +
    "</span>&gt;&nbsp;" + displaymsg + "</td></tr></table><span class=\"bottom\"></span>";
    Client.InsertHistory(to, finalmsg, socket);
    
    return "user_cmd msg_user {:" + socket + "} msg " + escape(msg) + "\n";
}

function ListUsers(login) {
    return "list_users {" + login + "}\n";
}

function Watch(login) {
    return "user_cmd watch_log_user {" + login + "}\n";
}

function Quit() {
    return "exit\n";
}

function Status(status) {
    Client.SetState(status);
    return util.format("state %s:%s\n", status, Math.floor(Date.now() / 1000));
}

module.exports.Status = Status;
module.exports.Quit = Quit;
module.exports.Watch = Watch;
module.exports.ListUsers = ListUsers;
module.exports.Msg = Msg;
module.exports.Parse = Parse;
exports.Emitter = emitter;