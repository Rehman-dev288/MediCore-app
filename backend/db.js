const mysql = require("mysql2");

// Aiven MySQL Connection Pool
const pool = mysql.createPool({
  host: "medicore-medicore-288.h.aivencloud.com",
  port: 16909,
  user: "avnadmin",
  password: process.env.DB_PASSWORD,
  database: "defaultdb",
  ssl: {
    rejectUnauthorized: false,
  },
  waitForConnections: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectionLimit: 20,
  queueLimit: 0,
});

// Check connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("Connected to Aiven MySQL (defaultdb) successfully!");
    connection.release();
  }
});

module.exports = pool.promise();
