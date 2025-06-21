const { Pool } = require("pg");

const pool = new Pool({
    connectionString: "postgresql://bookworm_b2s5_user:QU7Oq1UQV1ZVQNa8mHcu4LEE0nd9IOdN@dpg-d1au3695pdvs73da0umg-a/bookworm_b2s5",
});

module.exports = pool;