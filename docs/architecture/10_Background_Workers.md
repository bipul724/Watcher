# 10 Background Workers

The WatcherAgent background worker (`server/worker/src/processor.ts`) serves as the execution environment for the core AI orchestration pipeline. It executes jobs pushed by the Express API.

## Worker: `processQueueJob`

**Responsibility**: Execute the 5-node AI pipeline in isolated, fault-tolerant context blocks.

### 1. Job Trigger: `INCIDENT_INGESTION`
- **Triggered By**: `handleWebhook` controller after a new monitoring alert.
- **Input Data**: `{ incidentId: string, payload: any }`
- **Processing**:
  1. Queries the Postgres database to fetch the incident record and the associated project configurations (GitHub tokens, LLM API keys).
  2. Creates a generic context object representing Zod's `ExecutionContextSchema`.
  3. Creates a `runs` log record in Postgres with status `RUNNING`.
  4. Calls `runPhase1(payload, context)` from the `WatcherAI` core library.
     - *Node 1 (Triage)*: Calls OpenRouter/Gemini API to classify error.
     - *Node 2 (Runbook)*: Calls Pinecone vector database for similarity search.
     - *Node 3 (HITL)*: Uses `discord.js` to send an interactive approval card.
  5. Updates `incidents` status to `AWAITING_APPROVAL`.
- **Output**: Returns the `hitlOutput` object containing categorization and Discord message IDs.

### 2. Job Trigger: `INCIDENT_FIX`
- **Triggered By**: Discord callback HTTP endpoint (`POST /api/v1/callback/approve`).
- **Input Data**: `{ incidentId: string, approvalData: any }`
- **Processing**:
  1. Re-fetches the database context and creates a new `runs` record.
  2. Calls `runPhase2(approvalData, context)`.
     - *Node 4 (Fixer)*: Uses `octokit` (GitHub API) to clone the repository tree, uses LLM to identify buggy files, generates unified diff, and commits a Pull Request.
     - *Node 5 (Narrator)*: Generates semantic vector chunks from the PR and uploads them to Pinecone.
  3. Updates `incidents` status to `CLOSED_AND_LEARNED`, appending `pr_url` and `root_cause`.
- **Output**: Returns the memory indexing results and the created PR URL.

## Error Handling Strategy
Within `processor.ts`:
- If an exception bubbles up from `runPhase1` or `runPhase2`, it is caught in a global `try...catch` block.
- The `incidents` row is explicitly rolled back to a `FAILED` status.
- The `runs` row is marked as `FAILED`, and the raw error message and stack trace are persisted to the database (`logs` JSON column) for developer inspection.
- The error is re-thrown so BullMQ registers the job failure and initiates the exponential backoff retry logic.

## Key Takeaways
- The worker operates fully statelessly. By injecting complete context retrieved directly from PostgreSQL on every execution, the worker instances can be scaled horizontally without session stickiness.
- Explicitly separating `runPhase1` and `runPhase2` into two separate queue jobs guarantees that the AI pauses execution indefinitely while awaiting human Discord approval, without consuming worker resources.
