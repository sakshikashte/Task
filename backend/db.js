const { Pool } = require('pg'); // Import 'Pool' from 'pg'

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Ecommerce',
    password: 'root@123',
    port: 5432,
});

module.exports = pool; // Export the 'pool' object directly
