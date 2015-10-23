﻿var Client = require('../app/Client.js');
var util = require('util');
var crypto = require('crypto');
var underscore = require('underscore');
var args;

const REP_OK = "rep 002 -- cmd end";

function Parse(msg, client) {
    args = msg.split(/\r\n|\n/);
    underscore.each(args, function (arr) {
        if (arr === REP_OK || arr.length == 0)
            return;
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
            if (splittedarr.length == 5 && splittedarr[0] === "user_cmd" && splittedarr[2] === "|" && splittedarr[3] === "msg") {
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
    var msg = decodeURI(splittedarr[4]);
    console.log("message=[" + msg + "]");
}

function RespWatch(splittedarr) {
    var dpsplitted = splittedarr[1].split(":");
    var loginsplitted = dpsplitted[3].split("@");
    var loginindex = FindLoginIndex(loginindex[0]);

    if (loginindex != -1) {
        var positionindex = FindPositionIndex(loginindex, dpsplitted[0]);
        if (positionindex != -1) {
            if (splittedarr[3] === "state") {
                Client.GetContacts()[loginindex].positions[positionindex].status = splittedarr[4].split(":")[0];
                console.log(Client.GetContacts());
            }
            else {
                Client.GetContacts()[loginindex].positions[positionindex].status = splittedarr[3];
                console.log(Client.GetContacts());
            }
        }
    }
}

function Salut(msg, client) {
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
            Client.GetContacts().push(UpdatePosition(splittedarr));
            console.log(Client.GetContacts());
        }
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
        if (socket == curpos.socket) {
            return true;
        }
    });
}

function UpdatePosition(arr) {
    return {
        socket: arr[0], host: arr[2], trustlevel: arr[5] + arr[6], workstationtype: arr[7], 
        location: decodeURI(arr[8]), group: arr[9], status: arr[10].split(":")[0], userdata: decodeURI(arr[11])
    };
}

function Msg(to, msg) {
    return "user_cmd msg_user {" + to + "} msg " + encodeURI(msg) + "\n";
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
    return util.format("state %s:%s\n", status, Math.floor(Date.now() / 1000));
}

module.exports.Status = Status;
module.exports.Quit = Quit;
module.exports.Watch = Watch;
module.exports.ListUsers = ListUsers;
module.exports.Msg = Msg;
module.exports.Parse = Parse;