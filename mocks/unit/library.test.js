// mocks/unit/library.test.js
// Unit tests for runPhase1 and runPhase2 library interfaces.

// 1. Establish the mocks before loading any node libraries
import './setup-mocks.js';

import { runPhase1, runPhase2 } from '../../server/watcherai/index.js';
import assert from 'node:assert';
import test from 'node:test';



const mockPayload = {
  incident_id: 'INC-1234',
  service: 'checkout-service',
  triggered_at: new Date().toISOString(),
  alert: {
    latencyMs: 3000,
    errorRate: 0.5,
    durationMin: 5,
    transactionsAffected: 100,
    p95LatencyMs: 4000,
    p99LatencyMs: 5000,
    errorTypes: ['MongoNetworkError'],
    affectedRegions: ['us-west-2']
  },
  runbook_hint: 'Verify connection pool settings'
};

const mockContext = {
  project: {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Project',
    githubToken: 'ghp_mocktoken1234567890',
    githubOwner: 'test-owner',
    githubRepo: 'test-repo',
    discordChannelId: '112233445566',
    openrouterKey: 'sk-or-mock-key-123',
    pineconeNamespace: 'project-test-namespace'
  },
  incident: {
    id: 'INC-1234',
    service: 'checkout-service'
  }
};

test('runPhase1 should successfully execute Node 1 -> Node 2 -> Node 3', async (t) => {
  // Ensure the bot is ready before running the node
  const { loginBot } = await import('../../server/watcherai/nodes/node-03-hitl/discord-bot.js');
  await loginBot();

  console.log('\n--- STARTING PHASE 1 TEST ---');
  const result = await runPhase1(mockPayload, mockContext);

  console.log('Phase 1 result:', JSON.stringify(result, null, 2));

  // Verify Incident Info
  assert.strictEqual(result.incident_id, 'INC-1234');
  assert.strictEqual(result.service, 'checkout-service');
  assert.strictEqual(result.severity, 'P1');

  // Verify Node 2 (RAG Search matches the mock output)
  assert.strictEqual(result.runbooks.length, 1);
  assert.strictEqual(result.runbooks[0].source, 'HISTORICAL_FIX');
  assert.strictEqual(result.runbooks[0].title, 'Database connection pool runbook');

  // Verify Node 3 (Discord correlation settings)
  assert.strictEqual(result.hitl.hitl_status, 'AWAITING_APPROVAL');
  assert.strictEqual(result.hitl.discord_message_id, 'mock-message-id-5555');
  assert.strictEqual(result.hitl.discord_thread_id, 'mock-thread-id-7777');

  // Clear the incident timeout so Node.js process can exit cleanly
  const { clearIncidentTimeout } = await import('../../server/watcherai/services/incident-store.js');
  clearIncidentTimeout(result.incident_id);

  console.log('--- PHASE 1 TEST PASSED ---\n');
});

test('runPhase2 should successfully execute Node 4 -> Node 5', async (t) => {
  console.log('\n--- STARTING PHASE 2 TEST ---');

  const phase1Output = {
    incident_id: 'INC-1234',
    service: 'checkout-service',
    severity: 'P1',
    confidence: 90,
    runbooks: [
      {
        title: 'Database connection pool runbook',
        steps: ['Verify database metrics', 'Increase connection pool limits'],
        source: 'HISTORICAL_FIX',
        relevance: 0.92,
        fix_diff: '@@ -42,1 +42,1 @@\n-  poolSize: 5\n+  poolSize: 20',
        fix_file: 'db.js',
        root_cause: 'MongoDB Connection pool timeout',
        pr_url: 'https://github.com/mock/pr/1',
        incident_id: 'INC-7890'
      }
    ],
    hitl: {
      hitl_status: 'APPROVED',
      approver: 'test-approver@company.com',
      discord_message_id: 'mock-message-id-5555',
      discord_thread_id: 'mock-thread-id-7777',
      hitl_initiated_at: new Date().toISOString()
    },
    raw_error_message: 'MongoNetworkError: connection pool timeout',
    normalized_error_signature: 'MongoNetworkError: connection pool timeout',
    root_frame: { file: 'db.js', line: 42, function: 'connect' },
    affected_files: ['db.js'],
    error_type: 'network',
    error_category: 'DATABASE',
    reasoning: 'Verbatim: MongoNetworkError: connection pool timeout'
  };

  const result = await runPhase2(phase1Output, mockContext);

  console.log('Phase 2 result:', JSON.stringify(result, null, 2));

  // Verify memory update fields
  assert.strictEqual(result.incident_id, 'INC-1234');
  assert.strictEqual(result.memory_updated, true);
  assert.strictEqual(result.chunks_stored, 4);
  assert.strictEqual(result.status, 'CLOSED_AND_LEARNED');
  assert.ok(result.pipeline_completed_at);
  console.log('--- PHASE 2 TEST PASSED ---\n');
});

test('Context Validation failure with malformed context parameters', async (t) => {
  console.log('\n--- STARTING CONTEXT VALIDATION FAILURE TEST ---');
  const malformedContext = {
    project: {
      githubOwner: 'test-owner',
      githubRepo: 'test-repo',
      discordChannelId: '112233445566',
      openrouterKey: 'sk-or-mock-key-123',
      pineconeNamespace: 'project-test-namespace'
    },
    incident: {
      id: 'INC-1234',
      service: 'checkout-service'
    }
  };

  await assert.rejects(
    async () => {
      await runPhase1(mockPayload, malformedContext);
    },
    (err) => {
      assert.ok(err.message.includes('Schema violation'));
      console.log('Caught expected schema violation error:', err.message.slice(0, 120) + '...');
      return true;
    }
  );
  console.log('--- CONTEXT VALIDATION FAILURE TEST PASSED ---\n');
});
