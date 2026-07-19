import { query } from '../db/index.js';

export interface User {
  id: string;
  email: string;
  name: string | null;
  password_hash: string;
  created_at: Date;
}

export async function createUser(email: string, passwordHash: string, name?: string): Promise<User> {
  const sql = `
    INSERT INTO users (email, password_hash, name)
    VALUES ($1, $2, $3)
    RETURNING id, email, name, password_hash, created_at
  `;
  const result = await query(sql, [email.toLowerCase(), passwordHash, name || null]);
  return result.rows[0];
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const sql = `
    SELECT id, email, name, password_hash, created_at
    FROM users
    WHERE LOWER(email) = $1
  `;
  const result = await query(sql, [email.toLowerCase()]);
  if (result.rows.length === 0) return null;
  return result.rows[0];
}

export async function getUserById(id: string): Promise<User | null> {
  const sql = `
    SELECT id, email, name, password_hash, created_at
    FROM users
    WHERE id = $1
  `;
  const result = await query(sql, [id]);
  if (result.rows.length === 0) return null;
  return result.rows[0];
}
