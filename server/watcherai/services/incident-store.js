// services/incident-store.js
// PostgreSQL-backed store for active incidents and HITL expiry windows, with in-memory fallback for tests

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const HITL_TIMEOUT_MS = parseInt(process.env.HITL_TIMEOUT_MS || '900000', 10);
const useInMemory = process.env.NODE_ENV === 'test' || !process.env.DATABASE_URL;

const pool = useInMemory ? null : new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

const timeouts = new Map();
const memoryStore = new Map();

export function saveIncidentTimeout(id, timeout) {
  timeouts.set(id, timeout);
}

export function clearIncidentTimeout(id) {
  if (timeouts.has(id)) {
    clearTimeout(timeouts.get(id));
    timeouts.delete(id);
  }
}

export async function saveIncident(id, data) {
  if (useInMemory) {
    memoryStore.set(id, {
      data,
      expiresAt: new Date(Date.now() + HITL_TIMEOUT_MS).toISOString(),
    });
    return;
  }

  try {
    const sql = `
      UPDATE incidents
      SET triage = $1, status = 'AWAITING_APPROVAL', updated_at = NOW()
      WHERE id = $2
    `;
    await pool.query(sql, [JSON.stringify(data), id]);
  } catch (error) {
    console.warn(`⚠️ Failed to save incident to Postgres: ${error.message}. Falling back to in-memory.`);
    memoryStore.set(id, {
      data,
      expiresAt: new Date(Date.now() + HITL_TIMEOUT_MS).toISOString(),
    });
  }
}

export async function getIncident(id) {
  if (useInMemory || !pool) {
    const entry = memoryStore.get(id);
    if (!entry) return null;
    if (new Date() > new Date(entry.expiresAt)) {
      memoryStore.delete(id);
      return null;
    }
    return entry.data;
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return memoryStore.get(id)?.data || null;
  }

  try {
    const sql = `
      SELECT triage, status, created_at FROM incidents
      WHERE id = $1
    `;
    const result = await pool.query(sql, [id]);
    if (result.rows.length === 0) {
      return memoryStore.get(id)?.data || null;
    }

    const row = result.rows[0];
    if (row.status !== 'AWAITING_APPROVAL') {
      return null;
    }

    const isExpired = Date.now() > new Date(row.created_at).getTime() + HITL_TIMEOUT_MS;
    if (isExpired) {
      await pool.query("UPDATE incidents SET status = 'MUTED', updated_at = NOW() WHERE id = $1", [id]);
      return null;
    }

    return typeof row.triage === 'string' ? JSON.parse(row.triage) : row.triage;
  } catch (error) {
    console.warn(`⚠️ Failed to fetch incident from Postgres: ${error.message}. Falling back to in-memory.`);
    return memoryStore.get(id)?.data || null;
  }
}

export async function removeIncident(id) {
  memoryStore.delete(id);

  if (useInMemory || !pool) {
    return;
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return;
  }

  try {
    const sql = `
      UPDATE incidents
      SET status = 'MUTED', updated_at = NOW()
      WHERE id = $1 AND status = 'AWAITING_APPROVAL'
    `;
    await pool.query(sql, [id]);
  } catch (error) {
    console.warn(`⚠️ Failed to remove incident in Postgres: ${error.message}`);
  }
}

export async function getAllIncidents() {
  if (useInMemory || !pool) {
    const now = Date.now();
    return Array.from(memoryStore.entries())
      .filter(([_, entry]) => new Date(entry.expiresAt).getTime() >= now)
      .map(([_, entry]) => entry.data)
      .sort((a, b) => new Date(b.triggered_at || 0) - new Date(a.triggered_at || 0));
  }

  try {
    const expiryCutoff = new Date(Date.now() - HITL_TIMEOUT_MS);
    const sql = `
      SELECT triage, created_at FROM incidents
      WHERE status = 'AWAITING_APPROVAL'
        AND created_at >= $1
      ORDER BY created_at DESC
    `;
    const result = await pool.query(sql, [expiryCutoff]);
    return result.rows.map(row => {
      return typeof row.triage === 'string' ? JSON.parse(row.triage) : row.triage;
    });
  } catch (error) {
    console.warn(`⚠️ Failed to get all incidents from Postgres: ${error.message}. Returning in-memory.`);
    const now = Date.now();
    return Array.from(memoryStore.entries())
      .filter(([_, entry]) => new Date(entry.expiresAt).getTime() >= now)
      .map(([_, entry]) => entry.data)
      .sort((a, b) => new Date(b.triggered_at || 0) - new Date(a.triggered_at || 0));
  }
}
