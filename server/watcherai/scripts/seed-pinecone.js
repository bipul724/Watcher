// scripts/seed-pinecone.js
// Seed the Pinecone index with built-in runbooks so RAG has something to query.
// Run: node scripts/seed-pinecone.js

import 'dotenv/config';
import { Pinecone } from '@pinecone-database/pinecone';
import { getEmbedding } from '../nodes/shared/ai.js';

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'watcher-knowledge';

if (!PINECONE_API_KEY) {
  console.error('❌  PINECONE_API_KEY not set in .env');
  process.exit(1);
}

const pc = new Pinecone({ apiKey: PINECONE_API_KEY });

const RUNBOOKS = [
  {
    id: 'runbook-db-connection',
    title: 'DB Connection / Pool Exhaustion Runbook',
    service: 'database',
    content: `Incident type: Database connection pool exhaustion.
Steps:
1. Check pg_stat_activity or equivalent for active/idle connections.
2. Identify long-running queries and KILL if necessary.
3. Verify DB connection pool settings (max connections, timeout).
4. Restart connection pooler (PgBouncer / RDS Proxy) if applicable.
5. Scale up DB tier or increase pool size in application config.
6. Review recent deployments for connection leak regressions.`,
  },
  {
    id: 'runbook-oom',
    title: 'OOMKilled / Memory Exhaustion Runbook',
    service: 'kubernetes',
    content: `Incident type: Out-of-memory kill / memory exhaustion.
Steps:
1. Identify the killed pod/process via kubectl describe pod or dmesg.
2. Check memory usage trend in monitoring (Grafana/CloudWatch).
3. Increase memory limits in Kubernetes deployment spec.
4. Profile application for memory leaks (heap dump if JVM/Node).
5. Add horizontal autoscaling if workload is bursty.
6. Consider moving ML inference to a dedicated GPU node.`,
  },
  {
    id: 'runbook-redis',
    title: 'Redis Failure / Failover Runbook',
    service: 'redis',
    content: `Incident type: Redis cluster failure or failover.
Steps:
1. Check Redis cluster status: redis-cli cluster info.
2. Verify replica promotion completed: check master count.
3. Flush stale sessions if session store is corrupted.
4. Restart application pods to re-establish connections.
5. Review Redis maxmemory policy — eviction may have corrupted keys.
6. Enable Redis persistence (AOF/RDB) to prevent future data loss.`,
  },
  {
    id: 'runbook-payment-gateway',
    title: 'Payment Gateway Degradation Runbook',
    service: 'payment-gateway',
    content: `Incident type: Payment gateway degradation or failure.
Steps:
1. Check upstream payment provider status page.
2. Verify API keys and credentials have not expired.
3. Review error rate by endpoint — isolate failing operation.
4. Enable circuit breaker / fallback to secondary processor.
5. Alert on-call team and open incident bridge.
6. Capture full error response body for provider support ticket.`,
  },
  {
    id: 'runbook-fraud-detection',
    title: 'Fraud Detection Service Runbook',
    service: 'fraud-detection',
    content: `Incident type: Fraud detection ML service failure.
Steps:
1. Check pod logs for OOMKilled or crash loop signals.
2. Verify GPU/CPU resource quotas for the ML inference pod.
3. Increase memory/CPU limits in deployment spec.
4. Switch to fallback rule-based fraud check if ML is down.
5. Roll back to last stable model version if recent deploy coincides.
6. Alert fraud team — manual review queue may need to be activated.`,
  },
  {
    id: 'runbook-trading-api',
    title: 'Trading API Incident Runbook',
    service: 'trading-api',
    content: `Incident type: Trading API failure / session store unavailable.
Steps:
1. Check Redis cluster status — trading-api depends on Redis for sessions.
2. Verify replica promotion completed after Redis failover.
3. Flush stale session keys: redis-cli flushdb (caution — confirm safe).
4. Restart trading-api pods after Redis is stable.
5. Notify compliance team immediately — all orphaned trades need review.
6. Run reconciliation job to match orphaned orders against exchange state.`,
  },
];

async function seed() {
  console.log(`\n🌱 Seeding Pinecone index "${INDEX_NAME}" with ${RUNBOOKS.length} runbooks...\n`);

  // Create index if it doesn't exist (serverless, dimension 1024 for multilingual-e5-large)
  const existingIndexes = await pc.listIndexes();
  const indexNames = existingIndexes.indexes?.map((i) => i.name) ?? [];

  if (!indexNames.includes(INDEX_NAME)) {
    console.log(`📦 Creating index "${INDEX_NAME}"...`);
    await pc.createIndex({
      name: INDEX_NAME,
      dimension: 1024,
      metric: 'cosine',
      spec: { serverless: { cloud: 'aws', region: 'us-east-1' } },
    });
    // Wait for index to be ready
    console.log('⏳ Waiting for index to be ready (30s)...');
    await new Promise((r) => setTimeout(r, 30000));
  }

  const index = pc.index(INDEX_NAME);

  for (const runbook of RUNBOOKS) {
    process.stdout.write(`  Embedding "${runbook.title}"... `);
    const embedding = await getEmbedding(runbook.content, pc);

    await index.upsert({
      records: [{
        id: runbook.id,
        values: embedding,
        metadata: {
          chunk_type: 'error_signature',
          title: runbook.title,
          steps: JSON.stringify(runbook.content.split('\n').filter(Boolean)),
          content: runbook.content,
          service: runbook.service,
          source: 'SEED_RUNBOOK',
          created_at: new Date().toISOString(),
        },
      }],
    });
    console.log('✅');
  }

  console.log('\n🎉 Seed complete! Your Pinecone index is ready for RAG queries.\n');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
