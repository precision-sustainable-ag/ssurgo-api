import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config({ override: true });

const pool = new Pool({
  user: process.env.USER,
  password: process.env.PASSWORD,
  host: process.env.HOST,
  database: process.env.DATABASE,
  port: process.env.PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});

export { pool };
