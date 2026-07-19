# 28 End-to-End Execution Trace

This section traces a real business operation: An application crashes, triggering a Sentry webhook, and the system resolves it.

### Phase 1: Ingestion & Triage
1. **HTTP Request Arrives**: Sentry sends a JSON `POST` to `http://watcher:3001/api/v1/webhook/sec_12345`.
2. **Controller Auth**: `webhook.controller.ts:handleWebhook` queries `projects` where `webhook_secret = 'sec_12345'`. Project found.
3. **Payload Normalization**: Detects `body.data.issue`. Extracts `service = "backend"`, `errorSignature = "ReferenceError: x is not defined"`.
4. **Idempotency Check**: Executes `SELECT id FROM incidents WHERE error_signature = $1 AND created_at >= NOW() - 5m`. 0 rows found.
5. **Persistence**: Calls `createIncident()`, inserting a row with `status = 'TRIGGERED'`. (ID: `inc-111`).
6. **Queue Push**: Calls `addIngestionJob('inc-111', payload)` pushing to BullMQ Redis list `bull:incident-queue:wait`.
7. **HTTP Response**: Returns `200 OK { status: 'queued' }` to Sentry.

### Phase 2: Worker Processing (LLM Triage)
8. **Job Popped**: `server/worker/src/index.ts` detects the `INCIDENT_INGESTION` job.
9. **Processor Prep**: `processor.ts:processQueueJob` queries Postgres to fetch the full incident row and decrypts the project's OpenRouter, Pinecone, and GitHub keys to build the `ExecutionContext`.
10. **Audit Log Start**: Inserts row into `runs` table (`status: RUNNING`).
11. **Triage Node**: Calls `WatcherAI.runPhase1()`. Node 01 passes the Sentry payload to Gemini 2.0 Flash via OpenRouter. Determines `severity: P2`, `category: RUNTIME_ERROR`.
12. **RAG Node**: Node 02 queries Pinecone index `guardian-knowledge` with vector embeddings of "ReferenceError: x is not defined". No match found > 0.78 threshold.
13. **HITL Node**: Node 03 uses `discord.js` to send an interactive Embed Card to the developer channel.
14. **Worker Cleanup**: Updates Postgres `incidents` to `AWAITING_APPROVAL`. Updates `runs` to `COMPLETED`. BullMQ job ends.

### Phase 3: Approval & Remediation
15. **Human Input**: Developer clicks "Accept & Fix" on Discord.
16. **Callback Ingress**: Discord fires a POST to `/api/v1/callback/approve` on the Express API.
17. **Queue Push**: `callback.controller.ts` calls `addFixJob('inc-111', discordData)`.
18. **Job Popped**: Worker detects `INCIDENT_FIX`.
19. **Fixer Node**: `processor.ts` calls `WatcherAI.runPhase2()`. Node 04 uses `octokit` to clone the target repo. LLM parses the tree, finds the offending file, and generates a unified patch replacing `x` with the defined variable.
20. **GitHub Commit**: Octokit creates a new branch, pushes the patch, and opens a Pull Request.
21. **Narrator Node**: Node 05 parses the PR diff, generates semantic vector chunks, and uploads them to Pinecone for future memory caching.
22. **Final Cleanup**: Postgres `incidents` is updated to `CLOSED_AND_LEARNED`. `runs` is updated to `COMPLETED`. Incident resolved.
