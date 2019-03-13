var mysql = require("mysql");
var inquirer = require("inquirer");
require("dotenv").config();
var keys = require("./keys.js");
var createDBandTable = require("./bamazonCustomer.js");

var connection = mysql.createConnection(keys.mysql);
connection.connect(function (err) {
    if (err) throw err;
})

createDBandTable("Bamazon", "Products");

connection.end();