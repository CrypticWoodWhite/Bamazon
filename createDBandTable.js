var mysql = require("mysql");
require("dotenv").config();
var keys = require("./keys.js");

var connection = mysql.createConnection(keys.mysql);

function createDBandTable(DBname, tableName) {
    connection.query("DROP DATABASE IF EXISTS " + DBname, function(err, res) {
        if (err) throw err;
    });
    connection.query("CREATE DATABASE " + DBname, function(err, res) {
        if (err) throw err;
    });
    connection.query("USE " + DBname, function(err, res) {
        if (err) throw err;
    });
    connection.query("CREATE TABLE " + tableName + " (item_id INT NOT NULL AUTO_INCREMENT UNIQUE, product_name VARCHAR(20), department_name VARCHAR(20), price DECIMAL(10, 2), stock_quantity INT(20), PRIMARY KEY (item_id))", function(err, res) {
        if (err) throw err;
    });
    connection.query("INSERT INTO " + tableName + " (product_name, department_name, price, stock_quantity) VALUES('Baby unicorn', 'Magical creatures', 10249.99, 5), ('Frog eyeballs - 10 pack', 'Witchcraft', 13.50, 2310), ('Tongue of newt - 2 pack', 'Witchcraft', 5.79, 1053), ('Chimera', 'Magical creatures', 999.99, 20), ('Minotaur', 'Mythology', 99999.99, 1), ('Imp', 'Magical creatures', 0.99, 666), ('Leprechaun', 'Magical creatures', 110.75,), ('Nephthys', 'Mythology ', 250000.79,1), ('Little green men - 10 pack with spaceship', 'Magical creatures', 452.69, 15), ('Humans - 4 pack family unit with dog', 'Normal stuff', 675.25, 57)")
}

function printTable(tableName) {
    connection.query("SELECT * FROM " + tableName, function(err, res) {
        if (err) throw err;
        console.table(res);
    })
}

createDBandTable("Bamazon", "Products");

printTable("Products");

connection.end();

module.exports = Bamazon;