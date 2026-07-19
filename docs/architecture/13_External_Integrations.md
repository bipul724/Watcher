# 13 External Integrations

WatcherAgent relies heavily on third-party integrations to achieve autonomous remediation.

## 1. LLM Providers (OpenRouter / Native APIs)
- **Purpose**: Power the semantic reasoning for the `WatcherAI` engine.
- **Where Used**: `node-01-triage` (Classification), `node-04-warroom` (File discovery & Code auditing), `node-05-narrator` (Root cause generation).
- **Initialization**: Configured per project via the `projects.openrouter_key` column, defaulting to a global `OPENROUTER_API_KEY` if absent.
- **Failure Handling**: LLM calls are wrapped in timeouts (`LLM_TIMEOUT_MS`). If the LLM times out during Triage (Node 1), a graceful fallback assigns the incident a generic P2 severity to ensure the pipeline doesn't stall. If it fails during Remediation (Node 4), the worker relies on BullMQ's exponential backoff to retry.

## 2. Pinecone (Vector Database)
- **Purpose**: Powers the semantic memory and Runbook RAG. Maps generic error strings to historical code diffs.
- **Where Used**: `node-02-runbook` (Reading historical fixes), `node-05-narrator` (Writing new fixes).
- **Initialization**: Configured per project via `projects.pinecone_namespace` and `pinecone_api_key`.
- **Failure Handling**: If Pinecone is unreachable during `node-02-runbook`, the system gracefully degrades by falling back to a local static JSON runbook library matching generic keywords (e.g., matching "MongoNetworkError" to a static checklist).

## 3. Discord
- **Purpose**: The Human-In-The-Loop (HITL) gateway. Used to negotiate approval before mutating production codebases.
- **Where Used**: `node-03-hitl` (Sending the embed), `callback.controller.ts` (Receiving the approval).
- **Initialization**: Uses `discord.js` client initialized on worker startup, authenticating via `DISCORD_BOT_TOKEN`.
- **Failure Handling**: If the bot fails to initialize, it logs a warning but allows the worker to start.

## 4. GitHub API
- **Purpose**: Fetches source code files for LLM analysis, creates branches, commits diffs, and opens Pull Requests.
- **Where Used**: `node-04-warroom` (Fixer).
- **Initialization**: Uses `octokit` initialized dynamically per-incident using the `projects.github_token`.
- **Failure Handling**: Hard-coded safety guardrails prevent destructive actions (e.g., aborts the PR if > 30% of lines are changed). Checks for open duplicate PRs before creating a new one.

## 5. Monitoring Webhooks (Sentry, Datadog, PagerDuty, Render)
- **Purpose**: Triggers the entire system.
- **Where Used**: `webhook.controller.ts`.
- **Initialization**: No initialization. The server acts as a passive HTTP receiver.
- **Failure Handling**: Implements a 5-minute rolling deduplication window via PostgreSQL to prevent ingestion storms if Sentry fires 10,000 webhooks in a minute for the same crash.

## Key Takeaways
- The AI engine is built with "Graceful Degradation" as a core tenet. If Pinecone fails, it uses local fallbacks. If the LLM fails during triage, it uses deterministic rules. This ensures alerts are always processed.
