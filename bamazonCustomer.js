const mysql = require("mysql");
const inquirer = require("inquirer");
require("dotenv").config();
const keys = require("./keys.js");

// global variables
// which ones do not need to be global?
var buyProductName;
var buyProductPrice;
var buyProductQuantity;
var totalPrice;
var productWanted;
var quantityWanted;

const connection = mysql.createConnection(keys.mysql);
connection.connect(function (err) {
    if (err) throw err;
})

// functions to create database and tables if they do not exist, if they do exist then nothing happens
// having these functions in each script means that the scripts don't depend on each other
function createDBandTable(DBname, tableName) {
    return new Promise(function(resolve, reject) {

        connection.query("DROP DATABASE IF EXISTS " + DBname);

        connection.query("CREATE DATABASE IF NOT EXISTS " + DBname);

        connection.query("USE " + DBname);

        connection.query("CREATE TABLE IF NOT EXISTS " + tableName + " (item_id INT(3) NOT NULL AUTO_INCREMENT, product_name VARCHAR(50) NOT NULL, department_name VARCHAR(20), price_USD DECIMAL(10, 2), stock_quantity INT(20), product_sales INT(20) DEFAULT(0), PRIMARY KEY (product_name), INDEX (item_id))");

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

function createSecondTable(DBname, tableName) {
    return new Promise(function(resolve, reject) {
        
        connection.query("CREATE DATABASE IF NOT EXISTS " + DBname);

        connection.query("USE " + DBname);

        connection.query("CREATE TABLE IF NOT EXISTS " + tableName + " (department_id VARCHAR(50) NOT NULL UNIQUE, department_name VARCHAR(20), overhead_costs INT(10), PRIMARY KEY (department_id))");

        connection.query("INSERT IGNORE INTO " + tableName + " (department_id, department_name, overhead_costs) VALUES(7, 'Magical creatures', 130000), (666, 'Witchcraft', 25000), (923, 'Mythology', 1000000), (95, 'Normal stuff', 56000)");

        connection.query("SELECT * FROM " + tableName, function(err, res) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(res);
            }
        })
    })
}
createSecondTable("Bamazon", "Departments");

// creates the DB and table, then asks the initial questions to the customer
createDBandTable("Bamazon", "Products").then(function() { // why do I have to do an anonymous function here? Why can I not do .then(customerQ())?
    console.log("\r\nWelcome to the Bamazon store! Look at the table above to see what whimsically diabolical things we have to offer\r\n");
    inquirer.prompt([
        {
            type: "rawlist",
            name: "productQ",
            message: "Which product do you want to buy?",
            choices: ["Baby unicorn", "Frog eyeballs - 10 pack", "Tongue of newt - 2 pack", "Chimera", "Minotaur", "Imp", "Leprechaun", "Nephthys", "Little green men - 10 pack with spaceship", "Humans - 4 pack family unit with dog"] // this should be a dynamically updated list
        },
        {
            type: "input",
            name: "quantityQ",
            message: "How many do you want?",
            validate: function(input) {
                if ((isNaN(input) === true) || (input <= 0)) {
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
    connection.query("SELECT product_name, stock_quantity, price_USD, stock_quantity FROM Products WHERE ?", {product_name: productWanted}, function(err, res) {
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
            transactions(buyProductName, buyProductQuantity, totalPrice);
        }
    })
}

// function to ask customer if they want to go through with the purchase, updates the table, and asks if they want something else
function transactions(buyProductName, buyProductQuantity, totalPrice) {
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
            connection.query("UPDATE Products SET product_sales = ? WHERE product_name = ?", [totalPrice, buyProductName], function(err, res) {
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
            choices: ["Baby unicorn", "Frog eyeballs - 10 pack", "Tongue of newt - 2 pack", "Chimera", "Minotaur", "Imp", "Leprechaun", "Nephthys", "Little green men - 10 pack with spaceship", "Humans - 4 pack family unit with dog"]// this should also be a list that can be updated dynamically
        },
        {
            type: "input",
            name: "quantityQ",
            message: "How many do you want?",
            validate: function(input) {
                if ((isNaN(input) === true) || (input <= 0)) {
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
}

// function to ask customer what they want to do next if not enough stock
function notEnoughStock() {
    inquirer.prompt([
        {
            type: "rawlist",
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
            inquirer.prompt([
                {
                    type: "input",
                    name: "smallerquantity",
                    message: "How many do you want?",
                    validate: function(input) {
                        if ((isNaN(input) === true) || (input <= 0)) {
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