const { Pool } = require("pg");

const pool = new Pool({
    user: "blake",         // Replace with your PostgreSQL username
    host: "localhost",            // PostgreSQL server location
    database: "apresski",        // Database name
    password: "jester694", // PostgreSQL password
    port: 5432,                   // Default PostgreSQL port
});

module.exports = pool;
