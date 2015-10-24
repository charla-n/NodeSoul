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

exports.Netsoul = netsoul;
exports.Connected = connected;
exports.Id = id;