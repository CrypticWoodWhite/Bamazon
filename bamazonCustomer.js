var mysql = require("mysql");
var inquirer = require("inquirer");
require("dotenv").config();
var keys = require("./keys.js");
var database = require("./createDatabase.js")

var connection = mysql.createConnection({keys.mysql});

connection.connect(function(error, result) {
    if (error) throw error;
    
})









connection.end();