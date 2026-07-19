// mocks/unit/runbook-recall.test.js
// Verifies memory recall: first run resolves and records a fix; second run recalls it.

import './setup-mocks.js';
import { runPhase1, runPhase2 } from '../../server/watcherai/index.js';
import { mockVectors } from './setup-mocks.js';
import assert from 'node:assert';
import test from 'node:test';

const mockPayload = {
  incident_id: 'INC-RECALL-TEST',
  service: 'payment-service',
  triggered_at: new Date().toISOString(),
  alert: {
    latencyMs: 1200,
    errorRate: 0.2,
    durationMin: 3,
    transactionsAffected: 500,
    errorTypes: ['ConnectionTimeout'],
  },
  message: 'ConnectionTimeout: failed to connect to payment gateway'
};

const mockContext = {
  project: {
    id: '987f6543-e21b-32d1-c456-987654321000',
    name: 'Payment Service Project',
    githubToken: 'ghp_mocktoken999',
    githubOwner: 'test-owner',
    githubRepo: 'test-repo',
    discordChannelId: '998877665544',
    openrouterKey: 'sk-or-mock-key-999',
    pineconeNamespace: 'project-recall-namespace'
  },
  incident: {
    id: 'INC-RECALL-TEST',
    service: 'payment-service'
  }
};

test('Memory Recall E2E Mock: similar code error twice resolves and recalls fix', async (t) => {
  // Clear any existing vectors before starting
  mockVectors.length = 0;

  // Enable recall empty flag so query checks dynamic store first
  global.testRecallEmpty = true;

  // Initialize discord bot mock
  const { loginBot } = await import('../../server/watcherai/nodes/node-03-hitl/discord-bot.js');
  await loginBot();

  console.log('\n--- 1. FIRST ERROR INCIDENT RUN (Ingestion & Learning) ---');
  
  // Phase 1 (Ingestion, Triage, and local runbook matching since RAG is empty)
  const phase1Result = await runPhase1(mockPayload, mockContext);
  
  console.log('First Run Phase 1 completed.');
  assert.strictEqual(phase1Result.runbooks.length, 1, 'Should find 1 fallback local runbook');
  assert.strictEqual(phase1Result.runbooks[0].source, 'LOCAL_RUNBOOK', 'RAG was empty, must fall back to local runbook library');
  assert.strictEqual(phase1Result.runbooks[0].title, 'DB Connection / Pool Exhaustion Runbook', 'Must match DB local template');

  // Clear timeout to prevent process leak
  const { clearIncidentTimeout } = await import('../../server/watcherai/services/incident-store.js');
  clearIncidentTimeout(phase1Result.incident_id);

  // Approve the fix manually
  const approvalOutput = {
    ...phase1Result,
    hitl: {
      hitl_status: 'APPROVED',
      approver: 'admin@company.com',
      discord_message_id: 'mock-msg-777',
      discord_thread_id: 'mock-thread-777',
      hitl_initiated_at: new Date().toISOString()
    }
  };

  // Phase 2 (GitHub Fixer & Memory Narrator writing vector chunks to Pinecone)
  const phase2Result = await runPhase2(approvalOutput, mockContext);
  
  console.log('First Run Phase 2 (Remediation & Storage) completed.');
  assert.strictEqual(phase2Result.memory_updated, true, 'Memory must be saved to vector store');
  assert.strictEqual(phase2Result.chunks_stored, 4, 'Should store 4 semantic chunks');
  assert.ok(mockVectors.length >= 4, 'Mock stateful vectors must contain the written chunks');

  console.log('\n--- 2. SECOND IDENTICAL ERROR INCIDENT RUN (Memory Recall Check) ---');
  
  // Trigger same error again with a new incident ID
  const secondPayload = {
    ...mockPayload,
    incident_id: 'INC-RECALL-TEST-2'
  };
  const secondContext = {
    ...mockContext,
    incident: {
      id: 'INC-RECALL-TEST-2',
      service: 'payment-service'
    }
  };

  // Phase 1 for the second incident
  const secondPhase1Result = await runPhase1(secondPayload, secondContext);
  
  console.log('Second Run Phase 1 completed.');
  
  // Verify that it successfully retrieved the historical fix RAG vector from the first run!
  assert.strictEqual(secondPhase1Result.runbooks.length, 1, 'Should find the historical recall vector');
  assert.strictEqual(secondPhase1Result.runbooks[0].source, 'HISTORICAL_FIX', 'Should retrieve the historical fix saved in run 1');
  assert.strictEqual(secondPhase1Result.runbooks[0].incident_id, 'INC-RECALL-TEST', 'Should point to the original incident ID');
  
  // Clean up
  clearIncidentTimeout(secondPhase1Result.incident_id);
  delete global.testRecallEmpty;
  console.log('--- RUNBOOK RECALL TEST PASSED ---\n');
});
