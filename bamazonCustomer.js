var mysql = require("mysql");
var inquirer = require("inquirer");
require("dotenv").config();
var keys = require("./keys.js");

// global variables
var buyProductName;
var buyProductPrice;
var buyProductQuantity;
var totalPrice;
var productWanted;
var quantityWanted;

var connection = mysql.createConnection(keys.mysql);
connection.connect(function (err) {
    if (err) throw err;
})

// function to create the DB and table
function createDBandTable(DBname, tableName) {
    return new Promise(function(resolve, reject) {
        connection.query("CREATE DATABASE IF NOT EXISTS " + DBname);

        connection.query("USE " + DBname);

        connection.query("CREATE TABLE IF NOT EXISTS " + tableName + " (item_id INT NOT NULL AUTO_INCREMENT UNIQUE, product_name VARCHAR(50), department_name VARCHAR(20), price_USD DECIMAL(10, 2), stock_quantity INT(20), PRIMARY KEY (item_id))");

        connection.query("INSERT IGNORE INTO " + tableName + " (product_name, department_name, price_USD, stock_quantity) VALUES('Baby unicorn', 'Magical creatures', 10249.99, 5), ('Frog eyeballs - 10 pack', 'Witchcraft', 13.50, 2310), ('Tongue of newt - 2 pack', 'Witchcraft', 5.79, 1053), ('Chimera', 'Magical creatures', 999.99, 20), ('Minotaur', 'Mythology', 99999.99, 1), ('Imp', 'Magical creatures', 0.99, 666), ('Leprechaun', 'Magical creatures', 110.75, 283), ('Nephthys', 'Mythology', 250000.79, 1), ('Little green men - 10 pack with spaceship', 'Magical creatures', 452.69, 15), ('Humans - 4 pack family unit with dog', 'Normal stuff', 675.25, 57)");

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

// creates the DB and table, then asks the initial questions to the customer
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
                    console.log("\r\n\r\nThat's not a number, try again\r\n");
                    return false;
                }
                if (input <= 0) {
                    console.log("\r\n\r\nThat's not a valid input, try again\r\n");
                    return false;
                }
                return true;
            }
        }
        
    ]).then(function(customerResponse) {
        productWanted = customerResponse.productQ;
        quantityWanted = customerResponse.quantityQ;
        checkStock(productWanted, quantityWanted);
    })
});



// checks to see if there's enough of the desired item in stock and calculates price
function checkStock(productWanted, quantityWanted) {
    connection.query("SELECT item_id, product_name, stock_quantity, price_USD, stock_quantity FROM Products WHERE ?", {product_name: productWanted}, function(err, res) {
        buyProductName = res[0].product_name;
        buyProductPrice = res[0].price_USD;
        buyProductQuantity = res[0].stock_quantity;
        if (quantityWanted > buyProductQuantity) {
            console.log("\r\nWe're sorry but we only have " + buyProductQuantity + " of those in stock.\r\n");
            notEnoughStock();
        }
        else {
            totalPrice = parseFloat(quantityWanted) * parseFloat(buyProductPrice);
            console.log("\r\nThe total price is $" + totalPrice + "\r\n");
            transactions(buyProductName, buyProductQuantity);
        }
    })
}

// function to ask customer if they want to go through with the purchase, updates the table, and asks if they want something else
function transactions(buyProductName, buyProductQuantity) {
    inquirer.prompt([
        {
            type: "confirm",
            name: "buyornobuy",
            message: "Do you want to go through with this purchase?"
        }
    ]).then(function(response, err) {
        if (err) throw err;
        if (response.buyornobuy === true) {
            var updateProductQuantity = buyProductQuantity - quantityWanted;
            connection.query("UPDATE Products SET stock_quantity = ? WHERE product_name = ?", [updateProductQuantity, buyProductName], function(err, res) {
                if (err) throw err;
                return res;
            })
            console.log("\r\nThere you go! I hope you enjoy your " + buyProductName + "!\r\n");
        }
        else {
            console.log("\r\nWe're sorry to hear that.\r\n");
        }
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
                console.log("\r\nThanks for stopping by! Have a great rest of your day!\r\n\r\n");
                connection.query(("SELECT * FROM Products"), function(err, res) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        // console.table(res);
                        return res;
                    }
                })
                connection.end();
                return;
            }
        })
    })
}

// function to ask the customer what they want to buy
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
            productWanted = customerResponse.productQ;
            quantityWanted = customerResponse.quantityQ;
            checkStock(productWanted, quantityWanted);
        })
}

// function to ask customer what they want to do next if not enough stock
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
            // connection.query(("SELECT * FROM Products"), function(err, res) {
            //     if (err) throw err;
            //     console.table(res);
            // })
            connection.end();
            return;
        }
        else if (response.notenoughstock === "Purchase a smaller amount") {
            inquirer.prompt([
                {
                    type: "input",
                    name: "smallerquantity",
                    message: "How many do you want?",
                    validate: function(input) { // ask about validate function syntax
                        if (isNaN(input) === true) {
                            console.log("\r\n\r\nThat's not a number, try again\r\n");
                            return false;
                        }
                        if (input <= 0) {
                            console.log("\r\n\r\nThat's not a valid input, try again\r\n");
                            return false;
                        }
                        if (input > buyProductQuantity) {
                            console.log("\r\n\r\nThat's more than what we have in stock, try again\r\n");
                            return false;
                        }
                        return true;
                    }
                }
            ]).then(function(response) {
                quantityWanted = response.smallerquantity;
                totalPrice = parseFloat(quantityWanted) * parseFloat(buyProductPrice);
                console.log("\r\nThe total price is $" + totalPrice + "\r\n");
                transactions(buyProductName, buyProductQuantity);
            })

        }
        else if (response.notenoughstock === "Purchase something else") {
            customerQ();
        }
    }

    )
}

module.exports = createDBandTable;