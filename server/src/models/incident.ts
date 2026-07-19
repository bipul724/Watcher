import { query } from '../db/index.js';
import { Project } from './project.js';

export interface Incident {
  id: string;
  project_id: string;
  status: string; // 'TRIGGERED', 'TRIAGED', 'AWAITING_APPROVAL', 'FIXING', 'CLOSED_AND_LEARNED', 'MUTED', 'FAILED'
  severity: string;
  category: string;
  error_signature: string;
  raw_payload: any;
  triage: any | null;
  runbook: any | null;
  root_cause: string | null;
  postmortem: string | null;
  pr_url: string | null;
  discord_message_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateIncidentInput {
  project_id: string;
  status: string;
  severity: string;
  category: string;
  error_signature: string;
  raw_payload: any;
  triage?: any;
  runbook?: any;
  root_cause?: string;
  postmortem?: string;
  pr_url?: string;
  discord_message_id?: string | null;
}

export async function createIncident(input: CreateIncidentInput): Promise<Incident> {
  const sql = `
    INSERT INTO incidents (
      project_id, status, severity, category, error_signature, 
      raw_payload, triage, runbook, root_cause, postmortem, pr_url, discord_message_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *
  `;
  const params = [
    input.project_id,
    input.status,
    input.severity,
    input.category,
    input.error_signature,
    JSON.stringify(input.raw_payload),
    input.triage ? JSON.stringify(input.triage) : null,
    input.runbook ? JSON.stringify(input.runbook) : null,
    input.root_cause || null,
    input.postmortem || null,
    input.pr_url || null,
    input.discord_message_id || null,
  ];
  const result = await query(sql, params);
  return result.rows[0];
}

export async function getIncidentById(id: string, userId?: string): Promise<Incident | null> {
  let sql = 'SELECT i.* FROM incidents i';
  const params: any[] = [id];

  if (userId) {
    sql += ' JOIN projects p ON i.project_id = p.id WHERE i.id = $1 AND p.user_id = $2';
    params.push(userId);
  } else {
    sql += ' WHERE i.id = $1';
  }

  const result = await query(sql, params);
  if (result.rows.length === 0) return null;
  return result.rows[0];
}

export async function getIncidentWithProject(id: string): Promise<(Incident & { project: Project }) | null> {
  const sql = `
    SELECT 
      i.*,
      p.user_id as p_user_id, p.name as p_name, p.description as p_description, 
      p.webhook_secret as p_webhook_secret, p.github_owner as p_github_owner, 
      p.github_repo as p_github_repo, p.github_token as p_github_token, 
      p.discord_channel_id as p_discord_channel_id, p.discord_bot_token as p_discord_bot_token,
      p.openrouter_key as p_openrouter_key, 
      p.pinecone_namespace as p_pinecone_namespace, p.pinecone_api_key as p_pinecone_api_key,
      p.active as p_active, p.llm_provider as p_llm_provider, p.llm_model as p_llm_model
    FROM incidents i
    JOIN projects p ON i.project_id = p.id
    WHERE i.id = $1
  `;
  const result = await query(sql, [id]);
  if (result.rows.length === 0) return null;
  
  const row = result.rows[0];
  const project: Project = {
    id: row.project_id,
    user_id: row.p_user_id,
    name: row.p_name,
    description: row.p_description,
    webhook_secret: row.p_webhook_secret,
    github_owner: row.p_github_owner,
    github_repo: row.p_github_repo,
    github_token: row.p_github_token,
    discord_channel_id: row.p_discord_channel_id,
    discord_bot_token: row.p_discord_bot_token || null,
    openrouter_key: row.p_openrouter_key,
    pinecone_namespace: row.p_pinecone_namespace,
    pinecone_api_key: row.p_pinecone_api_key || null,
    llm_provider: row.p_llm_provider,
    llm_model: row.p_llm_model,
    active: row.p_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };

  const incident: Incident = {
    id: row.id,
    project_id: row.project_id,
    status: row.status,
    severity: row.severity,
    category: row.category,
    error_signature: row.error_signature,
    raw_payload: row.raw_payload,
    triage: row.triage,
    runbook: row.runbook,
    root_cause: row.root_cause,
    postmortem: row.postmortem,
    pr_url: row.pr_url,
    discord_message_id: row.discord_message_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };

  return { ...incident, project };
}

export async function listIncidents(projectId: string, userId?: string): Promise<Incident[]> {
  let sql = 'SELECT i.* FROM incidents i';
  const params: any[] = [projectId];

  if (userId) {
    sql += ' JOIN projects p ON i.project_id = p.id WHERE i.project_id = $1 AND p.user_id = $2';
    params.push(userId);
  } else {
    sql += ' WHERE i.project_id = $1';
  }
  
  sql += ' ORDER BY i.created_at DESC';

  const result = await query(sql, params);
  return result.rows;
}

export async function listAllIncidentsForUser(userId: string): Promise<Incident[]> {
  const sql = `
    SELECT i.* FROM incidents i
    JOIN projects p ON i.project_id = p.id
    WHERE p.user_id = $1
    ORDER BY i.created_at DESC
  `;
  const result = await query(sql, [userId]);
  return result.rows;
}

export async function updateIncident(id: string, fields: Partial<Omit<Incident, 'id' | 'project_id' | 'created_at'>>): Promise<Incident | null> {
  const setClauses: string[] = [];
  const params: any[] = [id];
  let paramIndex = 2;

  const allowedFields = [
    'status', 'severity', 'category', 'error_signature', 'raw_payload',
    'triage', 'runbook', 'root_cause', 'postmortem', 'pr_url', 'discord_message_id', 'updated_at'
  ];

  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && allowedFields.includes(key)) {
      setClauses.push(`"${key}" = $${paramIndex}`);
      // JSON types must be stringified
      if (key === 'raw_payload' || key === 'triage' || key === 'runbook') {
        params.push(value ? JSON.stringify(value) : null);
      } else {
        params.push(value);
      }
      paramIndex++;
    }
  }

  if (setClauses.length === 0) {
    return getIncidentById(id);
  }

  if (!fields.hasOwnProperty('updated_at')) {
    setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
  }

  const sql = `
    UPDATE incidents
    SET ${setClauses.join(', ')}
    WHERE id = $1
    RETURNING *
  `;
  const result = await query(sql, params);
  if (result.rows.length === 0) return null;
  return result.rows[0];
}
