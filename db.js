const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'HR', // Nombre de tu base de datos
    password: 'utm123',
    port: 5432,
});

module.exports = pool;
