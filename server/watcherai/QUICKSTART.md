# 🛡️ Watcher: Quick Start Guide

Watcher is an autonomous SRE agent that receives incident webhooks, triages them, looks up similar fixes, opens a human approval flow in Discord, and then creates a GitHub fix after approval.

## 1. Prerequisites

Install these before you start:

- Node.js 20 or newer.
- An OpenRouter API key for LLM orchestration.
- A Pinecone API key and an index for vector search.
- A Discord bot token and the channel ID where approval cards should appear.
- A GitHub personal access token with `repo` scope.

## 2. Install Dependencies

From the repository root, install the workspace dependencies:

```bash
npm install
```

## 3. Create Your `.env`

Create a `.env` file in the repository root and fill in the values for your environment:

```env
PORT=3000

# LLM provider
OPENROUTER_API_KEY=your_openrouter_api_key
DEFAULT_LLM_MODEL=google/gemini-flash-1.5

# Retrieval
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=guardian-knowledge

# Human-in-the-loop approval
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_INCIDENT_CHANNEL_ID=your_discord_channel_id

# GitHub automation
GITHUB_TOKEN=your_github_pat
GITHUB_REPO_OWNER=your_github_username_or_org
GITHUB_REPO_NAME=your_repository_name
```

If you plan to use the demo script in direct or full pipeline mode, also set:

```env
AIRIA_ENDPOINT_URL=your_airia_webhook_url
AIRIA_API_KEY=your_airia_api_key
PAGERDUTY_INTEGRATION_KEY=your_pagerduty_key
PAGERDUTY_SERVICE_ID=your_pagerduty_service_id
```

## 4. Start the Server

Run the webhook server from the project root:

```bash
node server.js
```

When it starts, it listens on `http://localhost:3000` by default.

## 5. Send a Test Incident

In a second terminal, send a sample alert to the webhook endpoint:

```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "service": "user-authentication",
    "alert": {
      "error": "PostgreSQL Connection Timeout",
      "latencyMs": 1200,
      "errorRate": 0.25
    }
  }'
```

You should see the request accepted with an incident ID and severity, then the triage, runbook, and Discord handoff logs in the server terminal.

## 6. Run the Demo Script

The repository also includes a demo driver that can exercise the workflow without manually crafting webhooks.

```bash
npm run demo -- --mode=local
```

Use `--mode=local` for a fully local 5-node run.

```bash
npm run demo -- --mode=direct
```

Use `--mode=direct` when `AIRIA_ENDPOINT_URL` and `AIRIA_API_KEY` are configured.

```bash
npm run demo
```

The default mode is `both`, which tries PagerDuty and then sends the alert through the pipeline.

## 7. Approve the Incident

If Discord is configured, a card will appear in your incident channel. Click the approval action to continue the fix pipeline.

After approval, the war room and fixer nodes create the code change, open the GitHub PR, and generate the postmortem artifact.

## 8. Customize Prompts

You can adjust the agent behavior by editing the prompt files in `prompts/`:

- `prompts/triage.js` controls incident classification and reasoning.
- `prompts/fixer.js` controls how the repair plan and code fix are generated.

## 9. Optional Docker Deployment

The file `docker-compose.template.yml` shows the environment variables expected by the container image. If you use it, copy it to your own compose file, provide the same `.env` values, and make sure the `guardian-agent:latest` image already exists before starting the service.

