# 20 Error Handling Architecture

WatcherAgent is designed to operate in highly unstable environments (by definition, it deals with system crashes). Consequently, its error handling strategy focuses on containment, graceful degradation, and visibility.

## 1. Global API Error Handler
**File**: `server/src/middleware/error.ts`
- **Mechanism**: An Express middleware function mounted at the very end of the routing chain.
- **Responsibility**: Catches any errors unhandled by controller `try...catch` blocks.
- **Security**: Prevents the Express server from leaking HTML stack traces back to external monitoring webhook providers, standardizing output to `{ error: "Internal Server Error" }` for `500`s.

## 2. Worker Error Handling (Containment)
**File**: `server/worker/src/processor.ts`
- **Mechanism**: The entire execution block of `runPhase1` and `runPhase2` is wrapped in a `try...catch`.
- **Visibility**: If an error occurs (e.g., GitHub returns a 403 Forbidden because a token expired), the `catch` block intercepts it.
- **Database Rollback**:
  - Updates the `incidents` table status to `FAILED`.
  - Updates the `runs` table status to `FAILED`, and specifically serializes `JSON.stringify({ error: error.message, stack: error.stack })` into the `logs` column. This allows developers to see exactly why the agent failed via the UI.
- **Propagation**: The error is then `throw`n back to BullMQ, triggering the retry logic.

## 3. BullMQ Retry & DLQ
- **Retry Logic**: Configured in `addIngestionJob` with `attempts: 3` and an exponential backoff starting at 5000ms. If the GitHub API is temporarily rate-limiting the system, the worker will back off and try again naturally.
- **Dead Letter Queue (DLQ)**: Once attempts exceed 3, the job is permanently moved to the Redis `failed` set, acting as a DLQ.

## 4. AI Node Fallbacks (Graceful Degradation)
- **Node 1 (Triage) Fallback**: If the LLM provider (OpenRouter) times out or throws an error during incident classification, the system defaults to assigning a generic P2 severity rather than halting.
- **Node 2 (Runbook) Fallback**: If Pinecone throws a network error, the pipeline catches it and defaults to searching a static JSON file (`fallback-cache.js`).

## Key Takeaways
- The error architecture is highly defensive. Instead of failing silently, worker exceptions are actively persisted to the PostgreSQL `runs` table, providing full observability over AI pipeline failures.
- The use of exponential backoff at the queue level elegantly solves transient issues common when interacting with external LLM endpoints.
