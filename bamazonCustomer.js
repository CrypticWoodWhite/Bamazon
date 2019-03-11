var mysql = require("mysql");
var inquirer = require("inquirer");
require("dotenv").config();
var keys = require("./keys.js");

var connection = mysql.createConnection(keys.mysql);

connection.connect(function (err) {
    if (err) throw err;
})

function createDBandTable(DBname, tableName) {
    return new Promise(function(resolve, reject) {
        connection.query("DROP DATABASE IF EXISTS " + DBname); // comment out this line once everything is working
        connection.query("CREATE DATABASE " + DBname); // then change this to CREATE DATABASE IF NOT EXISTS
        connection.query("USE " + DBname);
        connection.query("CREATE TABLE " + tableName + " (item_id INT NOT NULL AUTO_INCREMENT UNIQUE, product_name VARCHAR(50), department_name VARCHAR(20), price_USD DECIMAL(10, 2), stock_quantity INT(20), PRIMARY KEY (item_id))");
        connection.query("INSERT INTO " + tableName + " (product_name, department_name, price_USD, stock_quantity) VALUES('Baby unicorn', 'Magical creatures', 10249.99, 5), ('Frog eyeballs - 10 pack', 'Witchcraft', 13.50, 2310), ('Tongue of newt - 2 pack', 'Witchcraft', 5.79, 1053), ('Chimera', 'Magical creatures', 999.99, 20), ('Minotaur', 'Mythology', 99999.99, 1), ('Imp', 'Magical creatures', 0.99, 666), ('Leprechaun', 'Magical creatures', 110.75, 283), ('Nephthys', 'Mythology', 250000.79, 1), ('Little green men - 10 pack with spaceship', 'Magical creatures', 452.69, 15), ('Humans - 4 pack family unit with dog', 'Normal stuff', 675.25, 57)");
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

function customerQ() {
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
            checkStock(productWanted, quantityWanted);
        })
}

createDBandTable("Bamazon", "Products").then(function() { // why do I have to do an anonymous function here? Why can I not do .then(customerQ())?
    console.log("\r\nWelcome to the Bamazon store! Look at the table above to see what whimsically diabolical things we have to offer\r\n");
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
        checkStock(productWanted, quantityWanted);
    })
});

function checkStock(productWanted, quantityWanted) {
    connection.query("SELECT item_id, product_name, stock_quantity, price_USD, stock_quantity FROM Products WHERE ?", {product_name: productWanted}, function(err, res) {
        // console.table(res);
        var totalPrice;
        if (quantityWanted > res[0].stock_quantity) {
            console.log("We're sorry but we only have " + res[0].stock_quantity + " of those in stock.")
            notEnoughStock();
        }
        else {
            totalPrice = parseFloat(quantityWanted) * parseFloat(res[0].price_USD);
            console.log("The total price is $" + totalPrice);
            inquirer.prompt([
                {
                    type: "confirm",
                    name: "buyornobuy",
                    message: "Do you want to go through with this purchase?"
                }
            ]).then(function(response) {
                if (response.buyornobuy === true) {
                    console.log(res[0].stock_quantity);
                    res[0].stock_quantity = res[0].stock_quantity - quantityWanted;
                    // console.log(res[0].stock_quantity);
                }
                else {
                    console.log("We're sorry to hear that.");
                    inquirer.prompt([
                        {
                            type: "confirm",
                            name: "buysomethingelse",
                            message: "Do you want to purchase something else?"
                        }
                    ]).then(function(response) {
                        if (response.buysomethingelse === true) {
                            customerQ();
                        }
                        else {
                            console.log("Thanks for stopping by, have a great rest of your day");
                            connection.end();
                            return;
                        }
                    })
                }
            }).then(function() {
                inquirer.prompt([
                    {
                        type: "confirm",
                        name: "anotherpurchase",
                        message: "Do you want to purchase something else?"
                    }
                ]).then(function(response) {
                    if (response.anotherpurchase === true) {
                        customerQ();
                    }
                    else {
                        console.log("Thanks for your business! Have a great rest of your day");
                        connection.end();
                        return;
                    }
                })
            })

        }
    })
}

function notEnoughStock() {
    inquirer.prompt([
        {
            type: "list",
            name: "notenoughstock",
            message: "What do you want to do?",
            choices: ["Purchase a smaller amount", "Purchase something else", "Not purchase anything"]
        }
    ]).then(function(response) {
        if (response.notenoughstock === "Not purchase anything") {
            console.log("\r\nWe're sorry we couldn't help you today. Please come back anytime.")
            connection.end();
            return;
        }
        else if (response.notenoughstock === "Purchase a smaller amount") {

        }
        else if (response.notenoughstock === "Purchase something else") {

        }
    }

    )
}

function transaction(productWanted, quantityWanted) {
    // remove quantity purchased from stock
    // var totalPrice = quantityWanted * item price 
    // console.log("The total price is $" + totalPrice);
    // console.log("Thanks for shopping at Bamazon, we hope to see you again!");
}



// connection.end();