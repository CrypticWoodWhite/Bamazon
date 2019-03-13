var mysql = require("mysql");
var keys = require("./keys.js");

var connection = mysql.createConnection(keys.mysql);
connection.connect(function (err) {
    if (err) throw err;
})

module.exports = connection;