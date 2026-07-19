import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/watcher';

export const pool = new Pool({
  connectionString,
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};
