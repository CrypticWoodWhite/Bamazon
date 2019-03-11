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

createDBandTable("Bamazon", "Products").then(function() { // why do I have to do an anonymous function here? Why can I not do .then(customerQ())?
    console.log("\r\nWelcome to the Bamazon store!\r\n");
    inquirer.prompt([
        {
            type: "rawlist",
            name: "productQ",
            message: "Which product do you want to buy?",
            choices: ["Baby unicorn", "Frog eyeballs - 10 pack", "Tongue of newt - 2 pack", "Chimera", "Minotaur", "Imp", "Leprechaun", "Nephthys", "Little green men - 10 pack with spaceship", "Humans - 4 pack family unit with dog"]
        },
        {
            type: "input",
            name: "quantityQ",
            message: "How many do you want?",
            validate: function(input) { // ask about validate function syntax
                if (isNaN(input) === true) {
                    console.log("\r\nThat's not a number, try again");
                    return false;
                }
                if (input <= 0) {
                    console.log("\r\nThat's not a valid input, try again");
                    return false;
                }
                return true;
            }
        }
        
    ]).then(function(customerResponse) {
        var productWanted = customerResponse.productQ;
        var quantityWanted = customerResponse.quantityQ;
        isthereEnoughQuantity(productWanted, quantityWanted);
    })
});


function isthereEnoughQuantity(quantityWanted) {
    connection.query()
}

function transaction(productWanted, quantityWanted) {
    remove quantity purchased from stock
    var totalPrice = quantityWanted * item price 
    console.log("The total price is $" + totalPrice);
    console.log("Thanks for shopping at Bamazon, we hope to see you again!");cxvdfdddddddddds
}


connection.end();