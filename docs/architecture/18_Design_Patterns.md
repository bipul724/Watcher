# 18 Design Patterns

WatcherAgent implements several recognizable software design patterns to structure its logic and decouple responsibilities.

## 1. Pipeline / Chain of Responsibility
**Where Used**: The `WatcherAI` core engine (`server/watcherai/nodes/`).
**Explanation**: The entire AI resolution process is broken into 5 strict nodes (Triage, Runbook, HITL, Warroom, Narrator). Each node takes an input payload and context, processes it, and returns an output payload. This creates a highly testable Pipeline where the output of Node 1 acts as the input to Node 2.

## 2. Strategy Pattern
**Where Used**: `webhook.controller.ts` (`handleWebhook`).
**Explanation**: The ingestion controller implements a dynamic strategy to parse varying webhook structures (Sentry vs. Datadog vs. Render). Although currently implemented as a massive `if/else if` block, it conceptually follows the Strategy pattern, where the algorithm to extract `latencyMs` and `errorSignature` changes based on the detected source shape.

## 3. Producer-Consumer Pattern
**Where Used**: Express API (`Producer`) -> BullMQ (`Redis`) -> Worker Process (`Consumer`).
**Explanation**: The API never processes LLM tasks synchronously. It produces job tickets and immediately returns `200 OK`. The worker consumes these tickets asynchronously. This is the cornerstone of the system's scalability.

## 4. Active Record / Repository Pattern (Loose)
**Where Used**: `server/src/models/` (`project.ts`, `incident.ts`).
**Explanation**: Instead of raw SQL queries scattered throughout the controllers, the SQL logic is isolated in specific files acting as repositories (e.g., `createIncident(data)`). This hides the raw `pg` queries from the business logic.

## 5. Facade Pattern
**Where Used**: Node 4 War Room / Octokit initialization.
**Explanation**: Interactions with the GitHub API (branch creation, file fetching, PR creation) are notoriously complex. The AI engine likely wraps these in a Facade to provide simple functions like `createPR(title, diff)` to the LLM agent, hiding the underlying REST complexity.

## 6. Fallback Pattern (Graceful Degradation)
**Where Used**: Node 1 (LLM Timeout) and Node 2 (Pinecone Failure).
**Explanation**: If external APIs fail, the system is programmed to fall back. For instance, if Pinecone is down, the code catches the error and queries a static `fallback-cache.js` dictionary so the pipeline does not completely halt.

## Architectural Anti-Patterns Identified

- **God Object / Controller Bloat**: `webhook.controller.ts` is over 200 lines long and handles HTTP routing, payload normalization, raw SQL idempotency checks, and job queuing. This violates the Single Responsibility Principle.
- **Shotgun Surgery**: Because Prisma is used in `watcher/` and raw SQL is used in `server/`, making a change to the `users` table structure requires manually updating SQL strings in the API backend and updating the `schema.prisma` file in the frontend backend.
