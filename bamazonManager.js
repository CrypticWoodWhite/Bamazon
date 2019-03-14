const mysql = require("mysql");
const inquirer = require("inquirer");
require("dotenv").config();
const keys = require("./keys.js");

const connection = mysql.createConnection(keys.mysql);
connection.connect(function (err) {
    if (err) throw err;
})

// functions to create database and tables if they do not exist, if they do exist then nothing happens
// having these functions in each script means that the scripts don't depend on each other
function createDBandTable(DBname, tableName) {
    return new Promise(function(resolve, reject) {
        connection.query("CREATE DATABASE IF NOT EXISTS " + DBname);

        connection.query("USE " + DBname);

        connection.query("CREATE TABLE IF NOT EXISTS " + tableName + " (product_name VARCHAR(50) NOT NULL, department_name VARCHAR(20), price_USD DECIMAL(10, 2), stock_quantity INT(20), product_sales INT(20) DEFAULT(0), PRIMARY KEY (product_name))");

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

// function to ask manager what they want to do next
function mgrOptions() {
    inquirer.prompt([
        {
            type: "rawlist",
            name: "mgroptions",
            message: "\r\nWhat do you want to do next, oh magnificent manager?",
            choices: ["View products for sale", "View low inventory", "Add to inventory", "Add new product", "Exit"]
        }
    ]).then(function(response) {
        switch (response.mgroptions) {
            case "View products for sale": viewProd();
                break;
            case "View low inventory": viewLow();
                break;
            case "Add to inventory": addInvent();
                break;
            case "Add new product": addProd();
                break;
            case "Exit": console.log("\r\nHave a fabulous day!");
                connection.end();
                return;

            default: console.log("\r\nSomething broke");
                connection.end();
                return;
        }
    }
    )
}

// creates database and table if they do not exist yet, then moves on to asking what manager wants to do
createDBandTable("Bamazon", "Products").then(
    inquirer.prompt([
        {
            type: "rawlist",
            name: "mgroptions",
            message: "What do you want to do, oh great manager?",
            choices: ["View products for sale", "View low inventory", "Add to inventory", "Add new product", "Exit"]
        }
    ]).then(function(response) {
        switch (response.mgroptions) {
            case "View products for sale": viewProd();
                break;
            case "View low inventory": viewLow();
                break;
            case "Add to inventory": addInvent();
                break;
            case "Add new product": addProd();
                break;
            case "Exit": console.log("\r\nHave a fabulous day!");
                connection.end();
                return;

            default: console.log("\r\nSomething broke");
                connection.end();
                return;
        }
    }
    )
)

// function to view all products in stock
function viewProd() {
    connection.query("SELECT * FROM Products", function(err, res) {
        if (err) {
            console.log(err);
        } else {
            console.log("\r\nHere's everything we have in stock right now.\r\n")
            console.table(res);
            mgrOptions();
        }
    })
}

// function to view products that have fewer than 5 items in stock
function viewLow() {
    connection.query("SELECT * FROM Products WHERE stock_quantity < 5", function(err, res) {
        if (err) {
            console.log(err);
        } else {
            console.log("\r\nHere's everything that has less than five items left in stock\r\n");
            console.table(res);
            mgrOptions();
        }
    })
}

// function to create array of names of all products in stock
function productsArray() {
    return new Promise(function(reject, resolve) {
        connection.query("SELECT product_name FROM Products", function(err, res) {
            if (err) {
                reject(error);
            }
            var allItemsArray = [];
            for (i=0; i<res.length; i++) {
                allItemsArray.push(Object.values(res[i])[0]);
            }
            resolve(allItemsArray);
        })
    })
}

// function to add more to products already in stock
function addInvent() {
    productsArray().finally(function(allItemsArray) {
    // I get a UnhandledPromiseRejectionWarning error here. Console log shows that the promise does not pass its returned value (allItemsArray) into the .then() function
    // Adding a .catch() at the end of the chain to handle the error but that doesn't help with my problem, just shows me more precisely where my problem is
    // using .finally() instead of .then() doesn't help
        console.log("\r\n\r\nproductsArray results: " + allItemsArray + "\r\n\r\n");
        inquirer.prompt([
        {
            type: "rawlist",
            name: "product",
            message: "What product do you want to add inventory to?",
            choices: allItemsArray
        },
        {
            type: "input",
            name: "quantity",
            message: "How many do you want to add?"
        }
        ])
    }).then(function(response) {
        console.log(response.product);
        console.log(response.quantity);
        connection.query("SELECT stock_quantity FROM Products WHERE product_name = '" + response.product + "'", function(err, res) {
            newQuantity = res + response.quantity;
            console.log(newQuantity);
            connection.query("UPDATE Products SET (product_quantity = " + newQuantity + ") WHERE product_name = '" + response.product + "'");
            if (err) {
                console.log(err);
            } else {
                console.log("\r\n" + response.quantity + " of " + response.product + " successfully added to inventory");
                mgrOptions();
            }
        }
        )
    })
}

// function that creates an array of department names from the Departments table, which may have more departments than Products table
function deptArray() {
    return new Promise(function(reject, resolve) {
        connection.query("SELECT department_name FROM Departments", function(err, res) {
            if (err) {
                reject(error);
            }
            var allDeptsArray = [];
            for (i=0; i<res.length; i++) {
                allDeptsArray.push(Object.values(res[i])[0]);
            }
            resolve(allDeptsArray);
        })
    })
}

// function to add new products
function addProd() {
    inquirer.prompt([
        {
            type: "input",
            name: "productname",
            message: "What product do you want to add?"
        },
        {
            type: "input",
            name: "deptname",
            message: "What department will it be in?" // this really should be a list, but I'm still working on that above and in supervisor script
        },
        {
            type: "input",
            name: "price",
            message: "What will the price (USD) be?",
            validate: function(input) {
                if ((isNaN(input) === true) || (input <= 0)) {
                    console.log("\r\n\r\nThat's not a valid input, try again\r\n");
                    return false;
                }
                return true;
            }
        },
        {
            type: "input",
            name: "quantity",
            message: "How many are you adding?",
            validate: function(input) {
                if ((isNaN(input) === true) || (input <= 0)) {
                    console.log("\r\n\r\nThat's not a valid input, try again\r\n");
                    return false;
                }
                return true;
            }
        }
    ]).then(function(response) {
        connection.query("INSERT IGNORE INTO Products (product_name, department_name, price_USD, stock_quantity) VALUES ('" + response.productname + "', '" + response.deptname + "', " + response.price + ", " + response.quantity + ")", function(err) {
            if (err) {
                console.log(err);
            }
            else {
                console.log("\r\n" + response.productname + " successfully added to inventory.\r\n");
                mgrOptions();
            }
        })
    })
}