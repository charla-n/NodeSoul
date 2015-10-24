﻿var Storage = require("../app/Storage.js");
var Protocol = require('../app/Protocol.js');
var Client = require('../app/Client.js');

var db = new Storage(openDatabase(Storage.dbname, Storage.version, Storage.comment, Storage.size));

$(document).ready(function () {
    $("#addcontact").click(function () {
        db.GetContact($("#user_login").val());
    });

    db.on("getcontact", function (item) {
        if (item == null) {
            Client.AddContact($("#user_login").val());
            db.on("insertcontact", function () {
                Client.Netsoul.Send(Protocol.ListUsers($("#user_login").val()));
                Client.Netsoul.Send(Protocol.Watch($("#user_login").val()));
            });
            db.InsertContact($("#user_login").val(), false);
            $("#user_login").val("");
            $.Notify({
                caption: 'Contact added',
                content: 'Successfully added contact',
                type: 'success'
            });
        }
        else {
            $.Notify({
                caption: 'Contact already exists',
                content: 'Unable to add the same login twice',
                type: 'warning'
            });
        }
    });
});
