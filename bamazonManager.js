var inquirer = require("inquirer");
require("dotenv").config();
var connection = require("./server.js");
var customer = require("./bamazonCustomer.js");

connection.connect(function (err) {
    if (err) throw err;
})