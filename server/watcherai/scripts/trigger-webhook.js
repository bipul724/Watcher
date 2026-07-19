import dotenv from 'dotenv';
dotenv.config();

const payload = {
  incident_id: `INC-${Math.floor(Math.random() * 9000) + 1000}`,
  service: "checkout-service",
  triggered_at: new Date().toISOString(),
  alert: {
    latencyMs: 4800,
    errorRate: 0.73,
    durationMin: 12,
    transactionsAffected: 2340,
    p95LatencyMs: 8200,
    p99LatencyMs: 14500,
    errorTypes: ["ECONNREFUSED", "MongoNetworkError"],
    affectedRegions: ["us-east-1"],
  },
  runbook_hint: "MongoDB connection refused — check DB host reachability and connection pool settings.",
  pagerduty_url: "https://example.pagerduty.com/incidents/P1234",
};

async function trigger() {
  const port = process.env.PORT || 3001;
  const url = `http://localhost:${port}/webhook`;
  
  console.log(`🚀 Sending test webhook to ${url}...`);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const text = await response.text();
      console.error(`❌ Webhook failed with status ${response.status}: ${text}`);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Webhook accepted!');
    console.log('Incident ID:', data.incident_id);
    console.log('Severity:', data.severity);
    console.log('\nNext steps:');
    console.log('1. Check your Discord channel for the alert.');
    console.log('2. Click "Accept & Fix" to trigger the GitHub PR.');
    console.log('3. Or click "Ignore" to terminate the incident.');
  } catch (error) {
    console.error('❌ Error sending webhook:', error.message);
  }
}

trigger();
