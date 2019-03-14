var mysql = require("mysql");
var inquirer = require("inquirer");
require("dotenv").config();
var keys = require("./keys.js");

var connection = mysql.createConnection(keys.mysql);
connection.connect(function (err) {
    if (err) throw err;
})

// function to create database and tables if they do not exist, if they do exist then nothing happens
function createsecondTable(DBname, tableName) {
    return new Promise(function(resolve, reject) {
        
        connection.query("CREATE DATABASE IF NOT EXISTS " + DBname);

        connection.query("USE " + DBname);

        connection.query("CREATE TABLE IF NOT EXISTS " + tableName + " (department_id VARCHAR(50) NOT NULL, department_name VARCHAR(20), overhead_costs DECIMAL(10, 2) PRIMARY KEY (department_id))");

        connection.query("INSERT IGNORE INTO " + tableName + " (department_id, department_null, overhead_costs) VALUES (7, 'Magical creatures', 130000), (666, 'Witchcraft', 25000), (923, 'Mythology', 1000000), (95, 'Normal stuff', 56000");

        connection.query("SELECT * FROM " + tableName, function(err, res) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.table(res);
                resolve(res);
            }
        })
    })
}

createsecondTable("Bamazon", "Departments");