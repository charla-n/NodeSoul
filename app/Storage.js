var dbname = "nodesouldb";
var version = "1.0";
var comment = "nodesouldb";
var size = 2 * 1024 * 1024;

var util = require('util');
var EventEmitter = require('events').EventEmitter;
var _this;

function Storage(db) {
    this.db = db;
    db.transaction(function (tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS suser (id unique, login text, data text, location text)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS scontact (id unique, login text, ignored bit)');
    });
    EventEmitter.call(this);
    _this = this;
}

util.inherits(Storage, EventEmitter);

Storage.prototype.InsertUser = function (login, data, location) {
    this.db.transaction(function (tx) {
        tx.executeSql("INSERT INTO suser (login, data, location) VALUES(?, ?, ?)", [login, data, location]);
    });
}

Storage.prototype.InsertContact = function (login, ignored) {
    this.db.transaction(function (tx) {
        tx.executeSql("INSERT INTO scontact (login, ignored) VALUES(?, ?)", [login, ignored]);
    });
}

Storage.prototype.UpdateContact = function (login, ignored) {
    this.db.transaction(function (tx) {
        tx.executeSql("UPDATE scontact SET ignored=? WHERE login=?", [ignored, login]);
    });
}

Storage.prototype.UpdateUser = function (login, data, location) {
    this.db.transaction(function (tx) {
        tx.executeSql("UPDATE suser SET login=?,data=?,location=? WHERE id=1", [login, data, location]);
    });
}

Storage.prototype.GetUser = function () {
    this.db.transaction(function (tx) {
        tx.executeSql("SELECT * FROM suser", [], function (tx, results) {
            if (results.rows.length > 0) {
                _this.emit("getuser", results.rows.item(0));
            }
            else {
                _this.emit("getuser", null);
            }
        });
    });
}

exports.dbname = dbname;
exports.version = version;
exports.comment = comment;
exports.size = size;
module.exports = Storage;