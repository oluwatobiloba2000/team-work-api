/* eslint-disable no-console */
/* eslint-disable import/no-mutable-exports */
import { Pool } from 'pg';

import dotenv from 'dotenv';

dotenv.config();
let pool;
if (process.env.NODE_ENV === 'development') {
  pool = new Pool({
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    server: process.env.DATABASE_SERVER,
    port: process.env.DATABASE_PORT,
    database: process.env.DATABASE_NAME,
  });
} else {
  const connectionString = process.env.DATABASE_URL;
  pool = new Pool({
    connectionString,
  });
}
pool.on('connect', () => {
  console.log('DATABASE Connected');
});

export default pool;
