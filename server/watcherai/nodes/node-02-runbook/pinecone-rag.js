// nodes/node-02-runbook/pinecone-rag.js
// Guardian Node 02 — Pinecone Vector RAG Search

import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
import { getEmbedding } from '../shared/ai.js';
import { normalizeErrorSignature } from '../shared/normalize.js';

dotenv.config();

const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'watcher-knowledge';
// Primary threshold for same-service recall; secondary for cross-service recall.
// 0.87 was too strict and caused memory recall to never trigger.
const SCORE_THRESHOLD_STRICT   = parseFloat(process.env.PINECONE_SCORE_THRESHOLD       || '0.78');
const SCORE_THRESHOLD_FALLBACK = parseFloat(process.env.PINECONE_SCORE_THRESHOLD_BROAD || '0.82');

function getPineconeClient(context) {
  const apiKey = context?.project?.pineconeApiKey || process.env.PINECONE_API_KEY;
  if (!apiKey) return null;
  return new Pinecone({ apiKey });
}

/**
 * Queries Pinecone for relevant runbooks and past fixes.
 */
export async function searchRunbooks(service, errorReasoning, context, category, errorType) {
  const pinecone = getPineconeClient(context);

  if (!pinecone) {
    console.warn('⚠️  PINECONE_API_KEY/project key not set — using built-in runbook fallback.');
    return getLocalFallback(service, errorReasoning);
  }

  const errCategory = category || 'UNKNOWN';
  const errType = errorType || 'runtime';
  const normalizedQuery = normalizeErrorSignature(errorReasoning);
  const queryText = `[Service: ${service || 'unknown'}] [Category: ${errCategory}] ERROR ${errType}: ${normalizedQuery}`;

  try {
    const index = pinecone.index(INDEX_NAME);
    const namespace = context?.project?.pineconeNamespace || (context?.project?.id ? `project_${context.project.id}` : undefined);
    const targetIndex = namespace ? index.namespace(namespace) : index;

    console.log(`🔍 Querying Pinecone RAG for service ${service} (Namespace: ${namespace || 'default'}) using structured query: "${queryText}"`);

    const queryEmbedding = await getEmbedding(queryText, pinecone);

    // Pass 1: strict same-service query
    const serviceFilter = {
      chunk_type: { $eq: 'error_signature' },
      ...(service ? { service: { $eq: service } } : {}),
    };

    let queryResponse = await targetIndex.query({
      vector: queryEmbedding,
      topK: 5,
      includeMetadata: true,
      filter: serviceFilter,
    });

    let matches = queryResponse?.matches || [];
    let hits = matches.filter(m => (m.score || 0) >= SCORE_THRESHOLD_STRICT);

    if (hits.length > 0) {
      console.log(`🧠 Memory recall: ${hits.length} historical fix(es) found (top score: ${hits[0].score?.toFixed(3)})`);
      return hits.map(match => ({
        title: match.metadata?.title || 'Historical Fix',
        steps: (() => { try { return JSON.parse(match.metadata?.steps || '[]'); } catch { return []; } })(),
        fix_diff: match.metadata?.fix_diff || null,
        fix_file: match.metadata?.fix_file || null,
        root_cause: match.metadata?.root_cause || null,
        pr_url: match.metadata?.pr_url || null,
        error_category: match.metadata?.error_category || null,
        source: match.metadata?.source || 'PINECONE',
        relevance: match.score,
        incident_id: match.metadata?.incident_id,
      }));
    }

    console.log(`ℹ️ No historical fixes found in Pinecone. Falling back to local runbook match.`);
    return getLocalFallback(service, errorReasoning);

  } catch (error) {
    console.error('❌ Pinecone RAG Search Error:', error.message);
    return getLocalFallback(service, errorReasoning);
  }
}

/**
 * Built-in runbook library — used when Pinecone is unavailable or returns no results.
 * Keyed by service name and error keywords for best-effort matching.
 */
function getLocalFallback(service, reasoning = '') {
  const s = (service || '').toLowerCase();
  const r = (reasoning || '').toLowerCase();

  if (r.includes('connection') || r.includes('pool') || r.includes('timeout') || s.includes('db') || s.includes('postgres') || s.includes('mongo')) {
    return [{
      title: 'DB Connection / Pool Exhaustion Runbook',
      steps: [
        'Check pg_stat_activity or equivalent for active/idle connections.',
        'Identify long-running queries and KILL if necessary.',
        'Verify DB connection pool settings (max connections, timeout).',
        'Restart connection pooler (PgBouncer / RDS Proxy) if applicable.',
        'Scale up DB tier or increase pool size in application config.',
        'Review recent deployments for connection leak regressions.',
      ],
      fix_diff: null, root_cause: 'Database connection pool exhaustion', pr_url: null,
      source: 'LOCAL_RUNBOOK', relevance: 0.85,
    }];
  }

  if (r.includes('oom') || r.includes('memory') || r.includes('killed')) {
    return [{
      title: 'OOMKilled / Memory Exhaustion Runbook',
      steps: [
        'Identify the killed pod/process via kubectl describe pod or dmesg.',
        'Check memory usage trend in monitoring (Grafana/CloudWatch).',
        'Increase memory limits in Kubernetes deployment spec.',
        'Profile application for memory leaks.',
        'Add horizontal autoscaling if workload is bursty.',
      ],
      fix_diff: null, root_cause: 'Out-of-memory kill', pr_url: null,
      source: 'LOCAL_RUNBOOK', relevance: 0.85,
    }];
  }

  if (r.includes('redis') || r.includes('cache') || s.includes('redis') || s.includes('trading')) {
    return [{
      title: 'Redis Failure / Failover Runbook',
      steps: [
        'Check Redis cluster status: redis-cli cluster info.',
        'Verify replica promotion completed: check master count.',
        'Flush stale sessions if session store is corrupted.',
        'Restart application pods to re-establish connections.',
        'Review Redis maxmemory policy — eviction may have corrupted keys.',
      ],
      fix_diff: null, root_cause: 'Redis cluster failure or failover', pr_url: null,
      source: 'LOCAL_RUNBOOK', relevance: 0.85,
    }];
  }

  if (s.includes('payment') || s.includes('gateway')) {
    return [{
      title: 'Payment Gateway Degradation Runbook',
      steps: [
        'Check upstream payment provider status page.',
        'Verify API keys and credentials have not expired.',
        'Review error rate by endpoint — isolate failing operation.',
        'Enable circuit breaker / fallback to secondary processor.',
        'Alert on-call team and open incident bridge.',
      ],
      fix_diff: null, root_cause: 'Payment gateway degradation', pr_url: null,
      source: 'LOCAL_RUNBOOK', relevance: 0.80,
    }];
  }

  if (s.includes('fraud')) {
    return [{
      title: 'Fraud Detection Service Runbook',
      steps: [
        'Check pod logs for OOMKilled or crash loop signals.',
        'Verify GPU/CPU resource quotas for the ML inference pod.',
        'Increase memory/CPU limits in deployment spec.',
        'Switch to fallback rule-based fraud check if ML is down.',
        'Roll back to last stable model version if recent deploy coincides.',
      ],
      fix_diff: null, root_cause: 'Fraud detection ML service failure', pr_url: null,
      source: 'LOCAL_RUNBOOK', relevance: 0.85,
    }];
  }

  return [{
    title: 'General Incident Response Runbook',
    steps: [
      'Check application and infrastructure logs for error patterns.',
      'Verify recent deployments — roll back if incident coincides.',
      'Check all downstream service health dashboards.',
      'Confirm environment variables and secrets are correct.',
      'Restart affected pods/processes if safe to do so.',
      'Escalate to service owner if not resolved within 15 minutes.',
    ],
    fix_diff: null, root_cause: null, pr_url: null,
    source: 'LOCAL_RUNBOOK', relevance: 0.60,
  }];
}
