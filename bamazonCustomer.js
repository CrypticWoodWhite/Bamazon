var mysql = require("mysql");
var inquirer = require("inquirer");
require("dotenv").config();
var keys = require("./keys.js");
var database = require("./createDBandTable.js")

var connection = mysql.createConnection({keys.mysql});

database.createDBandTable("Bamazon", "Products"); // create database and table here using the createDBandTable script

function printTable(tableName) {
    connection.query("SELECT * FROM " + tableName, function(err, res) {
        if (err) throw err;
        console.table(res);
    })
}

printTable("Products");

inquirer.prompt([
    {
        type: "input",
        message: "Which product do you want to buy?",
        name: "productQ",
    },
    {
        type: "input",
        message: "How many do you want?",
        name: "quantityQ",
    }
]).then(function(customerResponse) {
    var productWanted = customerResponse.productQ;
    var quantityWanted = customerResponse.quantityQ;
})



connection.connect(function(error, result) {
    if (error) throw error;
    // functions
})









connection.end();