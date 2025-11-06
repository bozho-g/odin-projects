const Pool = require('pg').Pool;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};