const { Pool } = require('pg');

const pool = {
  psa: new Pool({
    user: process.env.USER,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    database: process.env.DATABASE,
    port: process.env.PORT,
    ssl: {
      rejectUnauthorized: false,
    },
  }),
  psaold: new Pool({
    user: process.env.WEATHER_USER,
    password: process.env.WEATHER_PASSWORD,
    host: process.env.WEATHER_HOST,
    database: process.env.WEATHER_DATABASE,
    port: process.env.WEATHER_PORT,
  }),
};

module.exports = {
  pool,
};
