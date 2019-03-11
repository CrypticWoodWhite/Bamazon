exports.mysql = {
    host: 'localhost',
    user: 'root',
    password: process.env.MYSQLPWD,
    port: 3306
};

console.log("mysql password loaded");