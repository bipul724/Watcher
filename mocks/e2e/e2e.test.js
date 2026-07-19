import assert from 'node:assert';
import test from 'node:test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const API_BASE = 'http://localhost:3001/api/v1';
const INTERNAL_SECRET = process.env.INTERNAL_CALLBACK_SECRET || 'orchestration-callback-key-9999';

test('E2E integration test: complete incident lifecycle flow', async (t) => {
  const testId = Math.floor(Math.random() * 1000000);
  const email = `test-user-${testId}@example.com`;
  const password = 'password123';
  const name = 'QA Tester';

  console.log(`\n1. Registering test user: ${email}...`);
  const signupRes = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name })
  });
  assert.ok(signupRes.status === 200 || signupRes.status === 201, 'Signup response should be 200 or 201');
  const signupData = await signupRes.json();
  assert.ok(signupData.token, 'Signup should return JWT token');
  
  const token = signupData.token;
  console.log('User registered successfully. JWT Token acquired.');

  console.log('\n2. Onboarding new project...');
  const projectPayload = {
    name: `Checkout Platform - ${testId}`,
    description: 'Critical payment checkouts',
    github_owner: 'test-owner',
    github_repo: 'test-repo',
    github_token: 'ghp_mocktoken1234567890',
    discord_channel_id: '112233445566',
    openrouter_key: 'sk-or-mock-key-123',
    pinecone_namespace: 'project-test-namespace'
  };

  const projectRes = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(projectPayload)
  });
  assert.ok(projectRes.status === 200 || projectRes.status === 201, 'Project creation should be 200 or 201');
  const projectData = await projectRes.json();
  assert.ok(projectData.project.id, 'Created project should have a valid UUID');
  assert.ok(projectData.project.webhook_secret, 'Webhook secret should be generated');
  
  const webhookSecret = projectData.project.webhook_secret;
  console.log(`Project created. Webhook secret: ${webhookSecret}`);

  console.log('\n3. Triggering webhook alert...');
  const alertPayload = {
    service: 'checkout-service',
    severity: 'P1',
    category: 'DATABASE',
    message: 'MongoNetworkError: connection timed out to replica set primary',
    alert: {
      latencyMs: 342,
      errorRate: 0.08,
      durationMin: 5,
      transactionsAffected: 120,
      errorTypes: ['MongoNetworkError'],
      affectedRegions: ['us-west-2']
    }
  };

  const webhookRes = await fetch(`${API_BASE}/webhook/${webhookSecret}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(alertPayload)
  });
  assert.strictEqual(webhookRes.status, 200, 'Webhook trigger response should be 200');
  const webhookData = await webhookRes.json();
  assert.strictEqual(webhookData.status, 'queued', 'Incident should be queued');
  assert.ok(webhookData.incident_id, 'Ingestion should return generated incident UUID');
  
  const incidentId = webhookData.incident_id;
  console.log(`Webhook accepted. Incident created: ${incidentId}. Status is QUEUED.`);

  console.log('\n4. Polling incident state until status is AWAITING_APPROVAL (Phase 1 completion)...');
  let incident = null;
  const maxPolls = 15;
  let statusOk = false;

  for (let i = 0; i < maxPolls; i++) {
    console.log(`Polling attempt ${i + 1}/${maxPolls}...`);
    const listRes = await fetch(`${API_BASE}/incidents`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const listData = await listRes.json();
    incident = (listData.incidents || []).find(inc => inc.id === incidentId);
    
    if (incident) {
      console.log(`Current Status: ${incident.status}`);
      if (incident.status === 'AWAITING_APPROVAL') {
        statusOk = true;
        break;
      }
    }
    await new Promise(r => setTimeout(r, 2000));
  }

  assert.ok(statusOk, 'Incident status should reach AWAITING_APPROVAL');
  console.log('Phase 1 executed successfully. Discord approval card simulation ready.');

  console.log('\n5. Sending approval callback...');
  const approveRes = await fetch(`${API_BASE}/callback/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-callback-secret': INTERNAL_SECRET
    },
    body: JSON.stringify({
      incidentId,
      action: 'APPROVE',
      comment: 'Approved by E2E test runner'
    })
  });
  assert.strictEqual(approveRes.status, 200, 'Approve callback should return 200');
  const approveData = await approveRes.json();
  assert.strictEqual(approveData.status, 'FIXING', 'State should move to FIXING');
  console.log('Approve callback processed. Remediation fixer pipeline triggered.');

  console.log('\n6. Polling incident state until status is CLOSED_AND_LEARNED (Phase 2 completion)...');
  statusOk = false;

  for (let i = 0; i < maxPolls; i++) {
    console.log(`Polling attempt ${i + 1}/${maxPolls}...`);
    const listRes = await fetch(`${API_BASE}/incidents`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const listData = await listRes.json();
    incident = (listData.incidents || []).find(inc => inc.id === incidentId);
    
    if (incident) {
      console.log(`Current Status: ${incident.status}`);
      if (incident.status === 'CLOSED_AND_LEARNED') {
        statusOk = true;
        break;
      }
    }
    await new Promise(r => setTimeout(r, 2000));
  }

  assert.ok(statusOk, 'Incident status should reach CLOSED_AND_LEARNED');
  assert.strictEqual(incident.status, 'CLOSED_AND_LEARNED', 'Final state must be CLOSED_AND_LEARNED');
  console.log(`PR URL: ${incident.pr_url}`);
  console.log(`Postmortem: ${incident.postmortem}`);
  console.log(`\n🎉 E2E Flow successfully completed for Incident: ${incidentId}`);
});
