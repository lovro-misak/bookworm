const { Pool } = require("pg");

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "bookworm_test",
    password: "bazepodataka",
    port: 5433,
});


module.exports = pool;