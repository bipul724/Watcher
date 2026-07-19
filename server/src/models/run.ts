import { query } from '../db/index.js';

export interface Run {
  id: string;
  incident_id: string;
  status: string; // 'PENDING', 'RUNNING', 'COMPLETED', 'FAILED'
  started_at: Date;
  completed_at: Date | null;
  logs: any | null;
}

export async function createRun(incidentId: string, status: string, logs?: any): Promise<Run> {
  const sql = `
    INSERT INTO runs (incident_id, status, logs)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const params = [incidentId, status, logs ? JSON.stringify(logs) : null];
  const result = await query(sql, params);
  return result.rows[0];
}

export async function getRunById(id: string): Promise<Run | null> {
  const sql = 'SELECT * FROM runs WHERE id = $1';
  const result = await query(sql, [id]);
  if (result.rows.length === 0) return null;
  return result.rows[0];
}

export async function listRunsForIncident(incidentId: string): Promise<Run[]> {
  const sql = 'SELECT * FROM runs WHERE incident_id = $1 ORDER BY started_at DESC';
  const result = await query(sql, [incidentId]);
  return result.rows;
}

export async function updateRun(id: string, fields: Partial<Omit<Run, 'id' | 'incident_id' | 'started_at'>>): Promise<Run | null> {
  const setClauses: string[] = [];
  const params: any[] = [id];
  let paramIndex = 2;

  const allowedFields = ['status', 'completed_at', 'logs'];

  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && allowedFields.includes(key)) {
      setClauses.push(`"${key}" = $${paramIndex}`);
      if (key === 'logs') {
        params.push(value ? JSON.stringify(value) : null);
      } else {
        params.push(value);
      }
      paramIndex++;
    }
  }

  if (setClauses.length === 0) {
    return getRunById(id);
  }

  const sql = `
    UPDATE runs
    SET ${setClauses.join(', ')}
    WHERE id = $1
    RETURNING *
  `;
  const result = await query(sql, params);
  if (result.rows.length === 0) return null;
  return result.rows[0];
}
