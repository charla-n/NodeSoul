var login;
var pwd;
var location;
var data;
var contacts = [];
var netsoul;
var id;
var state = "logged off";
var connected = 0;

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

exports.AddContact = function (login) {
    contacts.push({ login: login, ignored: false, positions: []});
}

exports.RemoveContact = function (login) {
    contacts.splice(GetIndexFromLogin(login), 1);
}

exports.RemovePosition = function (loginindex, positionindex) {
    contacts[loginindex].positions.splice(positionindex, 1);
}

exports.IgnoreContact = function (login, ignored) {
    contacts[GetIndexFromLogin(login)].ignored = ignored;
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