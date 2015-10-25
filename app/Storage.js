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
        //tx.executeSql("DROP TABLE suser");
        //tx.executeSql("DROP TABLE scontact");
        tx.executeSql('CREATE TABLE IF NOT EXISTS suser (id INTEGER PRIMARY KEY AUTOINCREMENT, login text, data text, location text)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS scontact (id INTEGER PRIMARY KEY AUTOINCREMENT, login text, ignored bit)');
    });
    EventEmitter.call(this);
    _this = this;
}

util.inherits(Storage, EventEmitter);

Storage.prototype.InsertUser = function (login, data, location) {
    this.db.transaction(function (tx) {
        tx.executeSql("INSERT INTO suser (id, login, data, location) VALUES(NULL, ?, ?, ?)", [login, data, location], function () {
            _this.emit("insertuser");   
        }, onError);
    });
}

Storage.prototype.InsertContact = function (login, ignored) {
    this.db.transaction(function (tx) {
        tx.executeSql("INSERT INTO scontact (id, login, ignored) VALUES(NULL, ?, ?)", [login, ignored], function (tx, results) {
            _this.emit("insertcontact");
        }, onError);
    });
}

Storage.prototype.UpdateContact = function (login, ignored) {
    this.db.transaction(function (tx) {
        tx.executeSql("UPDATE scontact SET ignored=? WHERE login=?", [ignored, login], function (tx, results) {
            
        }, onError);
    });
}

Storage.prototype.UpdateUser = function (login, data, location, id) {
    this.db.transaction(function (tx) {
        tx.executeSql("UPDATE suser SET login=?,data=?,location=? WHERE id=?", [login, data, location, id], function (tx, results) {
            
        }, onError);
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
        }, onError);
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
        }, onError);
    });
}

Storage.prototype.GetAllContacts = function () {
    this.db.transaction(function (tx) {
        tx.executeSql("SELECT * FROM scontact", [], function (tx, results) {
            _this.emit("getallcontacts", results.rows);
        }, onError);
    });
}

function onError(err) {
    console.log(err);
}

exports.dbname = dbname;
exports.version = version;
exports.comment = comment;
exports.size = size;
module.exports = Storage;