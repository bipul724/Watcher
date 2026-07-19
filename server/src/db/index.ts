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

export async function initDb() {
  console.log('🔄 Initializing PostgreSQL database tables...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Enable uuid-ossp extension for uuid generation
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // 2. Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Create projects table
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        webhook_secret VARCHAR(255) UNIQUE NOT NULL,
        github_owner VARCHAR(255) NOT NULL,
        github_repo VARCHAR(255) NOT NULL,
        github_token VARCHAR(255) NOT NULL,
        discord_channel_id VARCHAR(255) NOT NULL,
        openrouter_key VARCHAR(255) NOT NULL,
        pinecone_namespace VARCHAR(255) NOT NULL,
        pinecone_api_key VARCHAR(255),
        discord_bot_token VARCHAR(255),
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Create incidents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS incidents (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL,
        severity VARCHAR(10) NOT NULL,
        category VARCHAR(50) NOT NULL,
        error_signature TEXT NOT NULL,
        raw_payload JSONB NOT NULL,
        triage JSONB,
        runbook JSONB,
        root_cause TEXT,
        postmortem TEXT,
        pr_url TEXT,
        discord_message_id VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure the discord_message_id column is present if the table was created previously
    await client.query('ALTER TABLE incidents ADD COLUMN IF NOT EXISTS discord_message_id VARCHAR(255)');
    await client.query('ALTER TABLE projects ADD COLUMN IF NOT EXISTS pinecone_api_key VARCHAR(255)');
    await client.query('ALTER TABLE projects ADD COLUMN IF NOT EXISTS discord_bot_token VARCHAR(255)');
    await client.query('ALTER TABLE projects ALTER COLUMN openrouter_key DROP NOT NULL');
    await client.query('ALTER TABLE projects ADD COLUMN IF NOT EXISTS llm_provider VARCHAR(50) DEFAULT \'OPENROUTER\'');
    await client.query('ALTER TABLE projects ADD COLUMN IF NOT EXISTS llm_model VARCHAR(255)');

    // Index for fast incident deduplication checks (robustness under load)
    await client.query('CREATE INDEX IF NOT EXISTS idx_incidents_dedup ON incidents (project_id, error_signature, status, created_at DESC)');


    // 5. Create runs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS runs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP WITH TIME ZONE,
        logs JSONB
      )
    `);

    await client.query('COMMIT');
    console.log('✅ PostgreSQL database tables initialized successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to initialize database tables:', error);
    throw error;
  } finally {
    client.release();
  }
}
