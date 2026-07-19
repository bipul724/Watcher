import { query } from './db.js';
import { decrypt } from './utils/crypto.js';
// Import the core WatcherAgent AI library interface
// @ts-ignore
import { runPhase1, runPhase2 } from '../../watcherai/index.js';

interface JobData {
  incidentId: string;
  payload?: any;
  approvalData?: any;
}

export async function processQueueJob(jobName: string, data: JobData) {
  const { incidentId } = data;
  if (!incidentId) {
    throw new Error('Missing incidentId in job payload');
  }

  console.log(`[Processor] Beginning execution for Job [${jobName}] on Incident: ${incidentId}`);

  // 1. Fetch incident and project configuration from database
  const querySql = `
    SELECT 
      i.*,
      p.name as p_name, p.github_owner as p_github_owner, 
      p.github_repo as p_github_repo, p.github_token as p_github_token, 
      p.discord_channel_id as p_discord_channel_id, p.discord_bot_token as p_discord_bot_token,
      p.openrouter_key as p_openrouter_key, 
      p.pinecone_namespace as p_pinecone_namespace, p.pinecone_api_key as p_pinecone_api_key,
      p.llm_provider as p_llm_provider, p.llm_model as p_llm_model
    FROM incidents i
    JOIN projects p ON i.project_id = p.id
    WHERE i.id = $1
  `;
  const dbResult = await query(querySql, [incidentId]);
  if (dbResult.rows.length === 0) {
    throw new Error(`Incident with ID ${incidentId} not found in database`);
  }

  const incident = dbResult.rows[0];
  
  // Build execution context matching the Zod ExecutionContextSchema
  const context = {
    project: {
      id: incident.project_id,
      name: incident.p_name,
      githubToken: decrypt(incident.p_github_token) || '',
      githubOwner: incident.p_github_owner,
      githubRepo: incident.p_github_repo,
      discordChannelId: incident.p_discord_channel_id,
      discordBotToken: decrypt(incident.p_discord_bot_token) || undefined,
      pineconeNamespace: incident.p_pinecone_namespace,
      pineconeApiKey: decrypt(incident.p_pinecone_api_key) || undefined,
      openrouterKey: decrypt(incident.p_openrouter_key) || undefined,
      llmProvider: incident.p_llm_provider || 'OPENROUTER',
      llmModel: incident.p_llm_model || undefined,
    },
    incident: {
      id: incident.id,
      service: incident.raw_payload?.service || incident.p_name || 'unknown-service',
      triggeredAt: incident.created_at ? new Date(incident.created_at).toISOString() : new Date().toISOString(),
      status: incident.status,
    },
  };

  // 2. Create a Run record to log execution details
  const createRunSql = `
    INSERT INTO runs (incident_id, status, logs)
    VALUES ($1, $2, $3)
    RETURNING id
  `;
  const runResult = await query(createRunSql, [incidentId, 'RUNNING', JSON.stringify({ phase: jobName, started: new Date() })]);
  const runId = runResult.rows[0].id;

  try {
    if (jobName === 'INCIDENT_INGESTION') {
      const payload = data.payload || incident.raw_payload;
      
      // Execute Node 1 -> Node 2 -> Node 3
      console.log(`[Processor] Executing runPhase1 (Triage & Notification)...`);
      const hitlOutput = await runPhase1(payload, context);

      // Update incident state to AWAITING_APPROVAL
      const updateIncidentSql = `
        UPDATE incidents
        SET status = $1, triage = $2, runbook = $3, severity = $4, category = $5, error_signature = $6, discord_message_id = $7, updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
      `;
      await query(updateIncidentSql, [
        'AWAITING_APPROVAL',
        JSON.stringify(hitlOutput),
        JSON.stringify(hitlOutput.runbooks || []),
        hitlOutput.severity || 'P3',
        hitlOutput.error_category || 'GENERAL',
        hitlOutput.normalized_error_signature || incident.error_signature,
        hitlOutput.hitl?.discord_message_id || null,
        incidentId,
      ]);

      // Complete run logs
      const updateRunSql = `
        UPDATE runs
        SET status = $1, completed_at = CURRENT_TIMESTAMP, logs = $2
        WHERE id = $3
      `;
      await query(updateRunSql, ['COMPLETED', JSON.stringify(hitlOutput), runId]);
      
      console.log(`[Processor] Phase 1 completed successfully for Incident: ${incidentId}`);
      return hitlOutput;

    } else if (jobName === 'INCIDENT_FIX') {
      const approvalData = data.approvalData;
      if (!approvalData) {
        throw new Error('Missing approvalData for INCIDENT_FIX job execution');
      }

      // Execute Node 4 -> Node 5
      console.log(`[Processor] Executing runPhase2 (Fixer & Narrator)...`);
      const memoryOutput = await runPhase2(approvalData, context);

      // Update incident to CLOSED_AND_LEARNED with remediation details
      const updateIncidentSql = `
        UPDATE incidents
        SET status = $1, root_cause = $2, postmortem = $3, pr_url = $4, updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
      `;
      await query(updateIncidentSql, [
        'CLOSED_AND_LEARNED',
        memoryOutput.root_cause || memoryOutput.reasoning || 'Fixed successfully by AI agent',
        memoryOutput.postmortem || memoryOutput.ai_explanation || 'PR merged and documented',
        memoryOutput.pr_url || null,
        incidentId,
      ]);

      // Complete run logs
      const updateRunSql = `
        UPDATE runs
        SET status = $1, completed_at = CURRENT_TIMESTAMP, logs = $2
        WHERE id = $3
      `;
      await query(updateRunSql, ['COMPLETED', JSON.stringify(memoryOutput), runId]);

      console.log(`[Processor] Phase 2 completed successfully for Incident: ${incidentId}`);
      return memoryOutput;

    } else {
      throw new Error(`Unsupported queue job execution name: ${jobName}`);
    }
  } catch (error: any) {
    console.error(`[Processor] Execution failed for Job [${jobName}] run [${runId}]:`, error);

    // Rollback or update incident to FAILED state so developer knows
    const updateIncidentSql = `
      UPDATE incidents
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;
    await query(updateIncidentSql, ['FAILED', incidentId]);

    // Update run to FAILED state and save stacktrace
    const updateRunSql = `
      UPDATE runs
      SET status = $1, completed_at = CURRENT_TIMESTAMP, logs = $2
      WHERE id = $3
    `;
    await query(updateRunSql, [
      'FAILED',
      JSON.stringify({ error: error.message || error, stack: error.stack }),
      runId,
    ]);

    throw error;
  }
}
