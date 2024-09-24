require("dotenv").config();
const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: process.env.MYSQL_PASSWORD,
  database: "notes_app",
});

pool.query("SELECT * FROM notes", (err, res) => {
  return console.log(res);
});
