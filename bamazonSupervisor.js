const mysql = require("mysql");
const inquirer = require("inquirer");
require("dotenv").config();
const keys = require("./keys.js");

const connection = mysql.createConnection(keys.mysql);
connection.connect(function (err) {
    if (err) throw err;
})

// function to create database and tables if they do not exist, if they do exist then nothing happens

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
createDBandTable("Bamazon", "Products");

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
                console.table(res);
                resolve(res);
            }
        })
    })
}

createSecondTable("Bamazon", "Departments").then(function() {
    inquirer.prompt([
        {
            type: "rawlist",
            name: "supervisoroptions",
            message: "\r\nWelcome back your Majesty, what do you want to do today?\r\n",
            choices: ["View product sales by department", "Create new department", "Exit"]
        }
    ]).then(function(response) {
        switch (response.supervisoroptions) {
            case "View product sales by department": viewSales();
                break;
            case "Create new department": createDept();
                break;
            case "Exit": console.log("\r\nIt was our pleasure to serve you today, oh great leader");
                connection.end();
                break;

            default: console.log("\r\nSomething broke");
                connection.end();
                break;
        }
    })
})

function supOptions() {
    inquirer.prompt([
        {
            type: "rawlist",
            name: "supervisoroptions",
            message: "What do you want to do next, your Royal Highness Supervisor?",
            choices: ["View product sales by department", "Create new department", "Exit"]
        }
    ]).then(function(response) {
        switch (response.supervisoroptions) {
            case "View product sales by department": viewSales();
                break;
            case "Create new department": createDept();
                break;
            case "Exit": console.log("\r\nIt was our pleasure to serve you today, oh great leader");
                connection.end();
                break;

            default: console.log("Something's broken");
                connection.end();
                break;
        }
    })
}

function viewSales() {
    connection.query("SELECT... FROM... WHERE...");

    supOptions();

}

function createDept() {
    inquirer.prompt([
        {
            type: "input",
            name: "deptID",
            message: "What is the new department's ID number?",
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
            name: "deptname",
            message: "What is the new department's name?"
        },
        {
            type: "input",
            name: "deptovrhdcosts",
            message: "What is the new department's overhead costs?",
            validate: function(input) {
                if ((isNaN(input) === true) || (input <= 0)) {
                    console.log("\r\n\r\nThat's not a valid input, try again\r\n");
                    return false;
                }
                return true;
            }
        }
    ]).then(function(response) {
        connection.query("INSERT INTO Departments(department_id, department_name, overhead_costs) VALUES(" + response.deptID + ", '" + response.deptname + "', " + response.deptovrhdcosts + ")", function(err) {
            if (err) {
                console.log(err);
            }
            else {
                console.log("\r\n" + response.deptname + " successfully added to Departments table.\r\n");
                supOptions();
            }
        });
    })

}
