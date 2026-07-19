import crypto from 'crypto';
import { query } from '../db/index.js';
import { encrypt, decrypt } from '../utils/crypto.js';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  webhook_secret: string;
  github_owner: string;
  github_repo: string;
  github_token: string;
  discord_channel_id: string;
  discord_bot_token: string | null;
  openrouter_key: string | null;
  pinecone_namespace: string;
  pinecone_api_key: string | null;
  llm_provider: string | null;
  llm_model: string | null;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProjectInput {
  id?: string;
  user_id: string;
  name: string;
  description?: string;
  webhook_secret: string;
  github_owner: string;
  github_repo: string;
  github_token: string;
  discord_channel_id: string;
  discord_bot_token?: string;
  openrouter_key?: string | null;
  pinecone_namespace: string;
  pinecone_api_key?: string;
  llm_provider?: string;
  llm_model?: string;
}

/**
 * Helper to decrypt project secret fields after reading from the database
 */
function decryptProject(project: Project | null): Project | null {
  if (!project) return null;
  return {
    ...project,
    github_token: decrypt(project.github_token) || '',
    openrouter_key: decrypt(project.openrouter_key),
    pinecone_api_key: decrypt(project.pinecone_api_key),
    discord_bot_token: decrypt(project.discord_bot_token),
  };
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const projectId = input.id || crypto.randomUUID();
  const sql = `
    INSERT INTO projects (
      id, user_id, name, description, webhook_secret, 
      github_owner, github_repo, github_token, 
      discord_channel_id, openrouter_key, pinecone_namespace,
      pinecone_api_key, discord_bot_token, llm_provider, llm_model
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING *
  `;
  const params = [
    projectId,
    input.user_id,
    input.name,
    input.description || null,
    input.webhook_secret,
    input.github_owner,
    input.github_repo,
    encrypt(input.github_token),
    input.discord_channel_id,
    encrypt(input.openrouter_key),
    input.pinecone_namespace,
    encrypt(input.pinecone_api_key),
    encrypt(input.discord_bot_token),
    input.llm_provider || 'OPENROUTER',
    input.llm_model || null,
  ];
  const result = await query(sql, params);
  return decryptProject(result.rows[0]) as Project;
}

export async function getProjectById(id: string, userId?: string): Promise<Project | null> {
  let sql = 'SELECT * FROM projects WHERE id = $1';
  const params: any[] = [id];

  if (userId) {
    sql += ' AND user_id = $2';
    params.push(userId);
  }

  const result = await query(sql, params);
  if (result.rows.length === 0) return null;
  return decryptProject(result.rows[0]);
}

export async function getProjectBySecret(webhookSecret: string): Promise<Project | null> {
  const sql = 'SELECT * FROM projects WHERE webhook_secret = $1 AND active = TRUE';
  const result = await query(sql, [webhookSecret]);
  if (result.rows.length === 0) return null;
  return decryptProject(result.rows[0]);
}

export async function listProjects(userId: string): Promise<Project[]> {
  const sql = 'SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC';
  const result = await query(sql, [userId]);
  return result.rows.map(row => decryptProject(row)) as Project[];
}

export async function updateProject(id: string, userId: string, fields: Partial<CreateProjectInput> & { active?: boolean }): Promise<Project | null> {
  const setClauses: string[] = [];
  const params: any[] = [id, userId];
  let paramIndex = 3;

  const allowedFields = [
    'name', 'description', 'webhook_secret', 'github_owner', 'github_repo',
    'github_token', 'discord_channel_id', 'discord_bot_token', 'openrouter_key', 'pinecone_namespace', 'pinecone_api_key', 'active', 'llm_provider', 'llm_model'
  ];

  const secretFields = ['github_token', 'discord_bot_token', 'openrouter_key', 'pinecone_api_key'];

  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && allowedFields.includes(key)) {
      setClauses.push(`"${key}" = $${paramIndex}`);
      
      let finalValue = value;
      if (secretFields.includes(key) && (typeof value === 'string' || value === null)) {
        finalValue = encrypt(value);
      }
      
      params.push(finalValue);
      paramIndex++;
    }
  }

  if (setClauses.length === 0) {
    return getProjectById(id, userId);
  }

  setClauses.push(`updated_at = CURRENT_TIMESTAMP`);

  const sql = `
    UPDATE projects
    SET ${setClauses.join(', ')}
    WHERE id = $1 AND user_id = $2
    RETURNING *
  `;
  const result = await query(sql, params);
  if (result.rows.length === 0) return null;
  return decryptProject(result.rows[0]);
}

export async function deleteProject(id: string, userId: string): Promise<boolean> {
  const sql = 'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id';
  const result = await query(sql, [id, userId]);
  return result.rows.length > 0;
}
