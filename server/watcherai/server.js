// server.js
// Guardian AI SRE — Universal Orchestrator
import express from 'express';
import dotenv from 'dotenv';

// Node logic
import runTriageNode from './nodes/node-01-triage/index.js';
import runRunbookNode from './nodes/node-02-runbook/index.js';
import runHITLNode from './nodes/node-03-hitl/index.js';
import runFixerNode from './nodes/node-04-warroom/index.js';
import runMemoryNode from './nodes/node-05-narrator/index.js';

import { InputSchema as T1In, OutputSchema as T1Out } from './nodes/node-01-triage/schema.js';
import { InputSchema as T2In, OutputSchema as T2Out } from './nodes/node-02-runbook/schema.js';
import { OutputSchema as T3Out } from './nodes/node-03-hitl/schema.js';
import { OutputSchema as T4Out } from './nodes/node-04-warroom/schema.js';
import { OutputSchema as T5Out } from './nodes/node-05-narrator/schema.js';
import { loginBot } from './nodes/node-03-hitl/discord-bot.js';

// Services
import { saveIncident, getIncident, removeIncident, getAllIncidents } from './services/incident-store.js';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const INTERNAL_TOKEN = process.env.INTERNAL_CALLBACK_SECRET;

if (!INTERNAL_TOKEN) {
  console.warn('⚠️  INTERNAL_CALLBACK_SECRET is not set. /internal/* routes will accept any token (dev mode only).');
}

function requireInternalToken(req, res, next) {
  // If no secret is configured (dev mode), skip token check
  if (!INTERNAL_TOKEN) { next(); return; }

  const token = req.headers['x-internal-token'];
  if (!token || token !== INTERNAL_TOKEN) {
    console.warn(`⚠️ Unauthorized attempt on internal route from ${req.ip}`);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

function validate(schema, data, label) {
  const result = schema.safeParse(data);

  if (!result.success) {
    console.error(`❌ Schema validation failed at ${label}:`, result.error.flatten());
    throw new Error(`Schema violation at ${label}`);
  }

  return result.data;
}

// ── STALE HITL CLEANUP ──────────────────────────────────────────────────────
// Incidents that never received a Discord approval/ignore are cleaned up after
// HITL_EXPIRY_MINUTES to prevent the store from growing unbounded.
const HITL_EXPIRY_MS = parseInt(process.env.HITL_EXPIRY_MINUTES || '90', 10) * 60 * 1000;
setInterval(async () => {
  try {
    const all = await getAllIncidents();
    const now = Date.now();
    for (const incident of all) {
      const status = incident.hitl?.hitl_status;
      const initiatedAt = incident.hitl?.hitl_initiated_at
        ? new Date(incident.hitl.hitl_initiated_at).getTime()
        : new Date(incident.triggered_at || 0).getTime();

      if (status === 'AWAITING_APPROVAL' && now - initiatedAt > HITL_EXPIRY_MS) {
        console.warn(`⏰ Stale HITL expired: ${incident.incident_id} — removing from store.`);
        await removeIncident(incident.incident_id);
      }
    }
  } catch (e) {
    console.error('❌ Stale HITL cleanup error:', e.message);
  }
}, 5 * 60 * 1000); // run every 5 minutes
// ── END STALE HITL CLEANUP ──────────────────────────────────────────────────

/**
 * WEBHOOK RECEIVER
 * Entry point for deployment/error alerts.
 */
app.post('/webhook', async (req, res) => {
  const payload = req.body;

  if (!payload || Object.keys(payload).length === 0) {
    console.error('❌ Webhook received with empty payload.');
    return res.status(400).json({ error: 'Payload is required' });
  }

  // ── NOISE / FALSE-POSITIVE FILTER ───────────────────────────────────────
  // Reject alerts whose metrics are far below actionable thresholds so we
  // don't wake on-call engineers for normal traffic blips.
  const alert = payload.alert || {};
  const errorRate  = typeof alert.errorRate  === 'number' ? alert.errorRate  : 1;
  const latencyMs  = typeof alert.latencyMs  === 'number' ? alert.latencyMs  : 9999;
  const durationMin = typeof alert.durationMin === 'number' ? alert.durationMin : 99;
  const NOISE_ERROR_RATE  = parseFloat(process.env.NOISE_ERROR_RATE_THRESHOLD  || '0.02');
  const NOISE_LATENCY_MS  = parseInt(process.env.NOISE_LATENCY_MS_THRESHOLD    || '200',  10);
  const NOISE_DURATION_MIN = parseInt(process.env.NOISE_DURATION_MIN_THRESHOLD || '1',    10);

  if (errorRate < NOISE_ERROR_RATE && latencyMs < NOISE_LATENCY_MS && durationMin < NOISE_DURATION_MIN) {
    console.log(`🔕 Noise filter: alert below actionable thresholds (errorRate=${errorRate}, latencyMs=${latencyMs}, durationMin=${durationMin}). Skipping pipeline.`);
    return res.status(200).json({ status: 'noise_filtered', reason: 'Metrics below actionable threshold' });
  }
  // ── END NOISE FILTER ────────────────────────────────────────────────────

  // ── DUPLICATE INCIDENT GUARD ────────────────────────────────────────────
  // If an incident with the same ID is already in-flight (AWAITING_APPROVAL),
  // reject the duplicate to prevent double-processing.
  if (payload.incident_id) {
    const existing = await getIncident(payload.incident_id);
    if (existing) {
      console.warn(`⚠️  Duplicate incident rejected: ${payload.incident_id} is already in store (status: ${existing.hitl?.hitl_status || 'unknown'}).`);
      return res.status(409).json({
        status: 'duplicate',
        incident_id: payload.incident_id,
        existing_status: existing.hitl?.hitl_status || 'PENDING',
      });
    }
  }
  // ── END DUPLICATE GUARD ─────────────────────────────────────────────────

  console.log('🛡️ Webhook Received. Initiating Pipeline...');

  const PIPELINE_TIMEOUT = parseInt(process.env.PIPELINE_TIMEOUT_MS || '90000', 10);
  const pipelinePromise = (async () => {
    const triageInput = validate(T1In, payload, 'Node1 input');
    const triage = validate(T1Out, await runTriageNode(triageInput), 'Node1 output');

    const runbookInput = validate(T2In, triage, 'Node2 input');
    const runbook = validate(T2Out, await runRunbookNode(runbookInput), 'Node2 output');

    const hitl = validate(T3Out, await runHITLNode(runbook), 'Node3 output');

    await saveIncident(hitl.incident_id, hitl);
    return hitl;
  })();

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Pipeline timeout')), PIPELINE_TIMEOUT);
  });

  try {
    const hitl = await Promise.race([pipelinePromise, timeoutPromise]);

    res.status(202).json({
      status: 'initiated',
      incident_id: hitl.incident_id,
      severity: hitl.severity
    });
  } catch (error) {
    if (error.message === 'Pipeline timeout') {
      console.error(`❌ Pipeline Entry Failed: ${error.message} after ${PIPELINE_TIMEOUT}ms`);
      return res.status(504).json({ error: 'Pipeline timed out' });
    }

    console.error('❌ Pipeline Entry Failed:', error.message);
    res.status(500).json({ error: 'Pipeline failed to initiate' });
  }
});

/**
 * DISCORD APPROVAL CALLBACK
 * Triggered when a human clicks "Accept & Fix".
 */
app.post('/internal/discord-approve', requireInternalToken, async (req, res) => {
  const { incident_id, approver } = req.body;
  console.log(`📩 Received internal approval for incident ${incident_id} from ${approver}`);
  
  const incident = await getIncident(incident_id);

  if (!incident) {
    console.error(`❌ Incident ${incident_id} not found in memory store.`);
    return res.status(404).json({ error: 'Incident not found' });
  }

  try {
    console.log(`✅ Approval processed. Executing fix pipeline...`);
    incident.hitl = { ...incident.hitl, status: 'APPROVED', approver };

    const fix = validate(T4Out, await runFixerNode(incident), 'Node4 output');
    const learned = validate(T5Out, await runMemoryNode(fix), 'Node5 output');

    await removeIncident(incident_id);

    if (fix.pr_status === 'DUPLICATE_SKIPPED') {
      console.log(`🔁 Duplicate PR skipped for ${incident_id}. Existing PR: ${fix.pr_url}`);
      return res.status(200).json({
        status: 'duplicate_skipped',
        pr: fix.pr_url,
        incident_id,
        note: 'An open PR already exists for this incident branch.',
      });
    }

    if (fix.pr_status === 'FAILED' || fix.pr_status === 'FAILED_NO_CODE') {
      console.error(`❌ Fix execution failed: ${fix.error || fix.pr_status}`);
      return res.status(500).json({
        status: 'failed',
        reason: fix.pr_status,
        error: fix.error || 'PR creation failed',
        incident_id
      });
    }

    if (fix.pr_status === 'FAILED_INVALID_PATH') {
      console.error(`❌ Fix execution failed: ${fix.pr_status}`);
      return res.status(422).json({
        status: 'failed',
        reason: 'AI could not locate the file to fix',
        incident_id
      });
    }

    console.log(`🚀 Fix deployed successfully: ${learned.pr_url}`);
    return res.status(200).json({
      status: 'success',
      pr: learned.pr_url,
      incident_id
    });
  } catch (error) {
    console.error('❌ Fix Execution Pipeline Crashed:', error.message);
    res.status(500).json({ error: 'Failed to deploy fix' });
  }
});

/**
 * INCIDENTS API — consumed by the Watcher UI dashboard
 */
app.get('/api/incidents', async (req, res) => {
  res.json(await getAllIncidents());
});

app.get('/api/incidents/:id', async (req, res) => {
  const incident = await getIncident(req.params.id);
  if (!incident) return res.status(404).json({ error: 'Not found' });
  res.json(incident);
});

/**
 * DISCORD IGNORE CALLBACK
 */
app.post('/internal/discord-ignore', requireInternalToken, async (req, res) => {
  const { incident_id } = req.body;
  console.log(`🗑️ Incident ${incident_id} ignored. Removing from store.`);
  await removeIncident(incident_id);
  res.json({ status: 'ignored', incident_id });
});


try {
  await loginBot();
} catch (error) {
  console.error(`❌ Discord bot failed to initialize: ${error.message}`);
}

// 🔥 AUTO-TRIGGER WHEN RUN AS CONTAINER JOB
if (process.env.PROMPT && process.env.JOB_ID) {
  (async () => {
    try {
      console.log("🚀 Running container-triggered job:", process.env.JOB_ID);

      // 👇 You can adapt this to your pipeline input format
      const payload = {
        incident_id: process.env.JOB_ID,
        alert: {
          message: process.env.PROMPT,
        },
      };

      // 🔥 Directly call your pipeline (same as webhook)
      const triageInput = validate(T1In, payload, 'Node1 input');
      const triage = validate(T1Out, await runTriageNode(triageInput), 'Node1 output');

      const runbookInput = validate(T2In, triage, 'Node2 input');
      const runbook = validate(T2Out, await runRunbookNode(runbookInput), 'Node2 output');

      const hitl = validate(T3Out, await runHITLNode(runbook), 'Node3 output');

      await saveIncident(hitl.incident_id, hitl);

      // 🔥 send callback to watcher
      await fetch(`${process.env.ORCHESTRATOR_URL}/api/jobs/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: process.env.JOB_ID,
          status: "COMPLETED",
          result: hitl,
        }),
      });

      console.log("✅ Container job completed");
      process.exit(0);

    } catch (err) {
      console.error("❌ Container job failed:", err);

      await fetch(`${process.env.ORCHESTRATOR_URL}/api/jobs/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: process.env.JOB_ID,
          status: "FAILED",
          error: String(err),
        }),
      });

      process.exit(1);
    }
  })();
}

app.listen(PORT, () => {
  console.log(`🚀 Guardian AI SRE running at http://localhost:${PORT}`);
});
