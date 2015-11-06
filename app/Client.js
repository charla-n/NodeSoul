var login;
var pwd;
var location;
var data;
var contacts = [];
var netsoul;
var id;
var state = "logged off";
var connected = 0;

var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();

exports.SetLogin = function (glogin) {
    login = glogin;
}

exports.GetLogin = function () {
    return login;
}

exports.SetPwd = function (gpwd) {
    pwd = gpwd;
}

exports.GetPwd = function () {
    return pwd;
}

exports.SetLocation = function (gloc) {
    location = gloc;
}

exports.GetLocation = function () {
    return location;
}

exports.SetData = function (gdata) {
    data = gdata;
}

exports.GetData = function () {
    return data;
}

exports.AddContact = function (login, ignored) {
    contacts.push({ login: login, ignored: ignored, positions: []});
}

exports.RemoveContact = function (login) {
    contacts.splice(GetIndexFromLogin(login), 1);
    emitter.emit("removecontact");
}

exports.RemovePosition = function (loginindex, positionindex) {
    contacts[loginindex].positions.splice(positionindex, 1);
}

exports.IgnoreContact = function (login, ignored) {
    contacts[GetIndexFromLogin(login)].ignored = ignored;
    emitter.emit("updatecontact");
}

exports.InsertHistory = function (login, history, socket) {
    var len = contacts.length;
    
    console.log("looking for " + login + " " + socket);
    for (i = 0; i < len; i++) {
        if (contacts[i].login === login) {
            var lenj = contacts[i].positions.length;
            for (j = 0; j < lenj; j++) {
                if (socket === contacts[i].positions[j].socket) {
                    if (contacts[i].positions[j].history === undefined) {
                        contacts[i].positions[j].history = "";
                    }
                    contacts[i].positions[j].history += history;
                    console.log("position history =[" + contacts[i].positions[j].history + "]");
                    if (contacts[i].positions[j].selected == true) {
                        console.log("emit inserhistory ! with " + socket + " " + history);
                        emitter.emit("inserthistory", history);
                    }
                    break;
                }
            }
            break;
        }
    }
}

exports.ChangeSelected = function (login, socket) {
    var len = contacts.length;
    
    console.log("looking for " + login + " " + socket);
    for (i = 0; i < len; i++) {
        console.log("[" + contacts[i].login + "]==[" + login + "]");
        if (contacts[i].login === login) {
            console.log("found login " + login);
            var lenj = contacts[i].positions.length;
            for (j = 0; j < lenj; j++) {
                console.log(contacts[i].positions[j]);
                if (contacts[i].positions[j].socket === socket) {
                    contacts[i].positions[j].selected = true;
                    console.log("set selected " + contacts[i].login + " " + contacts[i].positions[j].socket);
                }
                else {
                    contacts[i].positions[j].selected = false;
                }
            }
        }
    }
}

exports.GetContact = function (login) {
    return contacts[GetIndexFromLogin(login)];
}

exports.FlushContact = function () {
    contacts = [];
}

exports.GetContacts = function () {
    return contacts;
}

exports.SetState = function (gstate) {
    state = gstate;
}

exports.GetState = function () {
    return state;
}

function GetIndexFromLogin(login) {
    var len = contacts.length;
    var i;
    var index;
    
    for (i = 0; i < len; i++) {
        if (contacts[i].login === login) {
            index = i;
            break;
        }
    }
    return index;
}

exports.Netsoul = netsoul;
exports.Connected = connected;
exports.Id = id;
exports.Emitter = emitter;
