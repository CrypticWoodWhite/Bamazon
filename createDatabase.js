var mysql = require("mysql");
require("dotenv").config();
var keys = require("./keys.js");

var connection = mysql.createConnection({keys.mysql});

module.exports = Bamazon;