var login;
var pwd;
var location;
var data;
var contacts = [];

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

exports.GetDate = function () {
    return data;
}

exports.AddContact = function (login) {
    contacts.push({ login: login, ignored: false, positions: []});
    console.log(contacts);
}

exports.GetContacts = function () {
    return contacts;
}