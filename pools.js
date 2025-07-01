const { Pool } = require('pg');

const pool = new Pool({
  // user: process.env.USER,  // ignored in WSL :(
  user: 'ssurgo_admin',
  password: process.env.PASSWORD,
  host: process.env.HOST,
  database: process.env.DATABASE,
  port: process.env.PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = {
  pool,
};
