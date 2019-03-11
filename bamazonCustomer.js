var mysql = require("mysql");
var inquirer = require("inquirer");
require("dotenv").config();
var keys = require("./keys.js");
// var database = require("./createDBandTable.js")

var connection = mysql.createConnection(keys.mysql);

function createDBandTable(DBname, tableName) {
    return new Promise(function(resolve, reject) {
        connection.query("DROP DATABASE IF EXISTS " + DBname);
        connection.query("CREATE DATABASE " + DBname);
        connection.query("USE " + DBname);
        connection.query("CREATE TABLE " + tableName + " (item_id INT NOT NULL AUTO_INCREMENT UNIQUE, product_name VARCHAR(50), department_name VARCHAR(20), price DECIMAL(10, 2), stock_quantity INT(20), PRIMARY KEY (item_id))");
        connection.query("INSERT INTO " + tableName + " (product_name, department_name, price, stock_quantity) VALUES('Baby unicorn', 'Magical creatures', 10249.99, 5), ('Frog eyeballs - 10 pack', 'Witchcraft', 13.50, 2310), ('Tongue of newt - 2 pack', 'Witchcraft', 5.79, 1053), ('Chimera', 'Magical creatures', 999.99, 20), ('Minotaur', 'Mythology', 99999.99, 1), ('Imp', 'Magical creatures', 0.99, 666), ('Leprechaun', 'Magical creatures', 110.75, 283), ('Nephthys', 'Mythology', 250000.79, 1), ('Little green men - 10 pack with spaceship', 'Magical creatures', 452.69, 15), ('Humans - 4 pack family unit with dog', 'Normal stuff', 675.25, 57)");
        connection.query("SELECT * FROM " + tableName, function(err, res) {
            if (err) {
                console.log("Error: " + err);
                reject(err);
            } else {
                console.table(res);
                resolve(res);
            }
        })
    })
}

// function customerQ() {
//     inquirer.prompt([
//         {
//             type: "input",
//             message: "Which product do you want to buy?",
//             name: "productQ",
//         },
//         {
//             type: "input",
//             message: "How many do you want?",
//             name: "quantityQ",
//         }
//         ]).then(function(customerResponse) {
//             var productWanted = customerResponse.productQ;
//             var quantityWanted = customerResponse.quantityQ;
//             doesProductExist(productWanted);
//             isthereEnoughQuantity(quantityWanted);
//         })
// }

createDBandTable("Bamazon", "Products").then(function() {
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
            doesProductExist(productWanted);
            isthereEnoughQuantity(quantityWanted);
        })
});


function doesProductExist(productWanted) {
    // check if product exists
    // else console.log("We do not carry that") and then ?
    // if product exists proceed with number function
}

function isNumber(value) {
    return typeof value === "number" && isFinite(value);
}

function isthereEnoughQuantity(productQuantity) {
    if (isNumber(productQuantity) === false) {
        console.log("That was not a number");
        return; // prompt again
    }
    else {
        // see how many of that item there are
        // see if there's enough
        // if there's enough then proceed
        // if there's not enough then return (?)
    }
}



connection.end();