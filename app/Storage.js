var dbname = "nodesouldb";
var version = "3.0";
var comment = "nodesouldb";
var size = 2 * 1024 * 1024;

var util = require('util');
var EventEmitter = require('events').EventEmitter;
var _this;

function Storage(db) {
    this.db = db;
    db.transaction(function (tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS suser (id INTEGER PRIMARY KEY AUTOINCREMENT, login text, data text, location text)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS scontact (id INTEGER PRIMARY KEY AUTOINCREMENT, login text, ignored bit)');
    });
    EventEmitter.call(this);
    _this = this;
}

util.inherits(Storage, EventEmitter);

Storage.prototype.InsertUser = function (login, data, location) {
    this.db.transaction(function (tx) {
        tx.executeSql("INSERT INTO suser (login, data, location) VALUES(?, ?, ?)", [login, data, location], function () {
            _this.emit("insertuser");   
        });
    });
}

Storage.prototype.InsertContact = function (login, ignored) {
    this.db.transaction(function (tx) {
        tx.executeSql("INSERT INTO scontact (login, ignored) VALUES(?, ?)", [login, ignored], function () {
            _this.emit("insertcontact");
        });
    });
}

Storage.prototype.UpdateContact = function (login, ignored) {
    this.db.transaction(function (tx) {
        tx.executeSql("UPDATE scontact SET ignored=? WHERE login=?", [ignored, login]);
    });
}

Storage.prototype.UpdateUser = function (login, data, location, id) {
    this.db.transaction(function (tx) {
        tx.executeSql("UPDATE suser SET login=?,data=?,location=? WHERE id=?", [login, data, location, id]);
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

Storage.prototype.GetContact = function (login) {
    this.db.transaction(function (tx) {
        tx.executeSql("SELECT * FROM scontact WHERE login=?", [login], function (tx, results) {
            if (results.rows.length > 0) {
                _this.emit("getcontact", results.rows.item(0));
            }
            else {
                _this.emit("getcontact", null);
            }
        });
    });
}

Storage.prototype.GetAllContacts = function () {
    this.db.transaction(function (tx) {
        tx.executeSql("SELECT * FROM scontact", [], function (tx, results) {
            _this.emit("getallcontacts", results.rows);
        });
    });
}

exports.dbname = dbname;
exports.version = version;
exports.comment = comment;
exports.size = size;
module.exports = Storage;