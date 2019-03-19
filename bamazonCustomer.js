const mysql = require("mysql");
const inquirer = require("inquirer");
require("dotenv").config();
const keys = require("./keys.js");

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

// function to create db and table
function createDBandTable(DBname, tableName) {
    return new Promise(function(resolve, reject) {

        connection.query("CREATE DATABASE IF NOT EXISTS " + DBname);

        connection.query("USE " + DBname);

        connection.query("CREATE TABLE IF NOT EXISTS " + tableName + " (item_id INT(3) NOT NULL AUTO_INCREMENT, product_name VARCHAR(50) NOT NULL, department_name VARCHAR(20), price_USD DECIMAL(10, 2), stock_quantity INT(20), product_sales INT(20) NOT NULL DEFAULT 0, PRIMARY KEY (product_name), INDEX (item_id))");

        connection.query("INSERT IGNORE INTO " + tableName + " (product_name, department_name, price_USD, stock_quantity) VALUES('Baby unicorn', 'Magical creatures', 10249.99, 5), ('Frog eyeballs - 10 pack', 'Witchcraft', 13.50, 2310), ('Tongue of newt - 2 pack', 'Witchcraft', 5.79, 1053), ('Chimera', 'Magical creatures', 999.99, 20), ('Minotaur', 'Mythology', 99999.99, 1), ('Imp', 'Magical creatures', 0.99, 666), ('Leprechaun', 'Magical creatures', 110.75, 283), ('Nephthys', 'Mythology', 250000.79, 1), ('Little green men - 10 pack with spaceship', 'Magical creatures', 452.69, 15), ('Humans - 4 pack family unit with dog', 'Normal stuff', 675.25, 57)");

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
// function to create depts table
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

// creates the DB and table, then asks the initial questions to the customer
createDBandTable("Bamazon", "Products").then(function(results) {
    console.table(results);
}).then(function() {
    productsArray().then(function(error) {
        console.log(error);
    }, function(results) {
    console.log("\r\nWelcome to the Bamazon store! Look at the table above to see what whimsically diabolical things we have to offer\r\n");
    inquirer.prompt([
        {
            type: "rawlist",
            name: "productQ",
            message: "Which product do you want to buy?",
            choices: results // this array dynamically updates as products are added to the inventory
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
    }).catch(function(error) {
        console.log(error);
    })})
})
createSecondTable("Bamazon", "Departments");

// function to create array of names of all products in stock
function productsArray() {
    return new Promise(function(reject, resolve) {
        connection.query("SELECT product_name FROM Products", function(err, results) {
            if (err) {
                console.log(err);
                reject(err);
            }
            var allItemsArray = [];
            for (i=0; i<results.length; i++) {
                allItemsArray.push(Object.values(results[i])[0]);
            }
            resolve(allItemsArray);
        })
    })
}

// checks to see if there's enough of the desired item in stock and calculates price
function checkStock(productWanted, quantityWanted) {
    connection.query("SELECT product_name, stock_quantity, price_USD, stock_quantity, product_sales FROM Products WHERE product_name = '" + productWanted + "'", function(err, result) {
        buyProductName = result[0].product_name;
        buyProductPrice = result[0].price_USD;
        buyProductQuantity = result[0].stock_quantity;
        buyProductSales = result[0].product_sales;
        if (quantityWanted > buyProductQuantity) {
            console.log("\r\nWe're sorry but we only have " + buyProductQuantity + " of those in stock.\r\n");
            notEnoughStock();
        }
        else {
            totalPrice = parseFloat(quantityWanted) * parseFloat(buyProductPrice);
            console.log("\r\nThe total price is $" + totalPrice + "\r\n");
            transactions(buyProductName, buyProductQuantity, totalPrice, buyProductSales);
        }
    })
}

// function to ask customer if they want to go through with the purchase, updates the table, and asks if they want something else
function transactions(buyProductName, buyProductQuantity, totalPrice, buyProductSales) {
    inquirer.prompt([
        {
            type: "confirm",
            name: "buyornobuy",
            message: "Do you want to go through with this purchase?"
        }
    ]).then(function(response) {
        if (response.buyornobuy) {
            var updateProductQuantity = buyProductQuantity - quantityWanted;
            var updateProductSales = buyProductSales + totalPrice;
            console.log("new quantity: " + updateProductQuantity);
            console.log("new product sales: " + updateProductSales);
            console.log("name: " + buyProductName);

            connection.query("UPDATE Products SET stock_quantity = " + updateProductQuantity + " WHERE product_name = '" + buyProductName + "'");

            connection.query("UPDATE Products SET product_sales = " + updateProductSales + " WHERE product_name = '" + buyProductName + "'");

            console.log("\r\nThere you go! I hope you enjoy your " + buyProductName + "!\r\n");
        }
        else {
            console.log("\r\nWe're sorry to hear that.\r\n");
        }
    }).then(function() {
        inquirer.prompt([
            {
                type: "confirm",
                name: "anotherpurchase",
                message: "Do you want to purchase something else?"
            }
        ]).then(function(response) {
            if (response.anotherpurchase) {
                customerQ();
            }
            else {
                console.log("\r\nThanks for stopping by! Have a great rest of your day!");
                connection.end();
                return;
            }
        })
    })
}

// function to ask the customer what they want to buy
function customerQ() {
    productsArray().then(function(error) {
        console.log(error);
    }, function(results) {
        inquirer.prompt([
            {
                type: "rawlist",
                name: "productQ",
                message: "Which product do you want to buy?",
                choices: results
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