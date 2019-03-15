const mysql = require("mysql");
const inquirer = require("inquirer");
require("dotenv").config();
const keys = require("./keys.js");

const connection = mysql.createConnection(keys.mysql);
connection.connect(function (err) {
    if (err) throw err;
})

// function to create db and products table
function createDBandTable(DBname, tableName) {
    return new Promise(function(resolve, reject) {

        connection.query("CREATE DATABASE IF NOT EXISTS " + DBname);

        connection.query("USE " + DBname);

        connection.query("CREATE TABLE IF NOT EXISTS " + tableName + " (item_id INT(3) NOT NULL AUTO_INCREMENT, product_name VARCHAR(50) NOT NULL, department_name VARCHAR(20), price_USD DECIMAL(10, 2), stock_quantity INT(20), product_sales INT(20) DEFAULT(0), PRIMARY KEY (product_name), INDEX (item_id))");

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

// function to create departments table
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

// create database and tables if they do not exist, then prompts supervisor with questions
createSecondTable("Bamazon", "Departments").then(function() {
    inquirer.prompt([
        {
            type: "rawlist",
            name: "supervisoroptions",
            message: "Welcome back your Majesty, we thank you for honoring us with your presence. What may we do to serve you today?",
            choices: ["View product sales by department", "Create new department", "Exit"]
        }
    ]).then(function(response) {
        switch (response.supervisoroptions) {
            case "View product sales by department": viewSales();
                break;
            case "Create new department": createDept();
                break;
            case "Exit": console.log("\r\nIt was our pleasure to serve you today, oh dear leader");
                connection.end();
                break;

            default: console.log("\r\nSomething broke");
                connection.end();
                break;
        }
    })
})
createDBandTable("Bamazon", "Products");

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
            case "Exit": console.log("\r\nIt was our pleasure to serve you today, oh dear leader.");
                connection.end();
                break;

            default: console.log("Something's broken");
                connection.end();
                break;
        }
    })
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
        connection.query("INSERT IGNORE INTO Departments(department_id, department_name, overhead_costs) VALUES(" + response.deptID + ", '" + response.deptname + "', " + response.deptovrhdcosts + ")", function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("\r\n" + response.deptname + " successfully added to Departments table.\r\n");
                supOptions();
            }
        })
    })
}

// function to print out list of departments and overhead
function printDepartments() {
    return new Promise(function(reject, resolve) {
        connection.query("SELECT * FROM Departments", function(error, result) {
            if (error) {
                reject(error);
            }
            resolve(result);
        })
    })
}

function viewSales() {
    printDepartments().then(function(error) {
        console.log(error);
    }, function(result) {
        console.table(result);
        supOptions();
    })
}


/////////////
// below is testing out total profits functions

// function calcTotalProfit() {
//     return new Promise(function(reject, resolve) { // this join isn't right
//         connection.query("SELECT Departments.overhead_costs, (Products.product_sales - Departments.overhead_costs) AS total_profit Departments INNER JOIN Products ON Departments.department_name = Products.department_name GROUP BY Departments.department_name", function(error, result) {
//             if (error) {
//                 reject(error);
//             }
//             console.table(result);
//             resolve(result);
//         })
//     })
// }

// function viewSales() {
//     calcTotalProfit().then(function(error) {
//         console.log(error);
//     }, function(result) {
//         // how to put results of previous query into table?
//         // put previous query into a promise and use .then() to pass result table into this one?
//         // but have to join by dept name

//         connection.query("INSERT INTO Departments total_profit INT(10) GENERATED ALWAYS AS VIRTUAL (" + result + ")", function(error) {
//             if (error) throw error;
//             console.table(response);
//         })
//     })
// }
