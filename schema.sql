DROP DATABASE IF exists Bamazon;
CREATE DATABASE IF NOT exists Bamazon;
USE Bamazon;
CREATE TABLE IF NOT EXISTS Products
	(item_id INT(3) NOT NULL AUTO_INCREMENT,
	product_name VARCHAR(50) NOT NULL,
	department_name VARCHAR(20),
	price_USD DECIMAL(10, 2),
	stock_quantity INT(20),
	product_sales INT(20) NOT NULL DEFAULT(0),
	PRIMARY KEY (product_name)
	INDEX (item_id))
INSERT IGNORE INTO Products 
	(product_name, department_name, price_USD, stock_quantity)
	VALUES('Baby unicorn', 'Magical creatures', 10249.99, 5),
		('Frog eyeballs - 10 pack', 'Witchcraft', 13.50, 2310),
		('Tongue of newt - 2 pack', 'Witchcraft', 5.79, 1053),
		('Chimera', 'Magical creatures', 999.99, 20),
		('Minotaur', 'Mythology', 99999.99, 1),
		('Imp', 'Magical creatures', 0.99, 666),
		('Leprechaun', 'Magical creatures', 110.75, 283),
		('Nephthys', 'Mythology', 250000.79, 1),
		('Little green men - 10 pack with spaceship', 'Magical creatures', 452.69, 15),
		('Humans - 4 pack family unit with dog', 'Normal stuff', 675.25, 57);
SELECT * FROM Products;


CREATE DATABASE IF NOT EXISTS Bamazon;
USE  Bamazon;
CREATE TABLE IF NOT EXISTS  Products
	(department_id VARCHAR(50) NOT NULL UNIQUE,
	department_name VARCHAR(20),
	overhead_costs INT(10),
	PRIMARY KEY (department_id);
INSERT IGNORE INTO Products
	(department_id, department_name, overhead_costs)
	VALUES(7, 'Magical creatures', 130000),
		(666, 'Witchcraft', 25000),
		(923, 'Mythology', 1000000),
		(95, 'Normal stuff', 56000);
SELECT * FROM Products;