# 25 File-by-File Reference

This document provides a concise architectural reference for the most critical files across the WatcherAgent monorepo.

## Server Core (`server/src/`)
- `index.ts`: The main Express server entry point. Configures CORS, mounts the `/api/v1` router, invokes database initialization, and listens on port 3001.
- `db/index.ts`: Manages the raw PostgreSQL `pg` Pool connection. Exports `initDb()` containing hard-coded `CREATE TABLE IF NOT EXISTS` commands and schema patches.
- `queue/index.ts`: Initializes the BullMQ `incidentQueue`. Exports `addIngestionJob` and `addFixJob` functions wrapped with 3-attempt exponential backoff retry logic.
- `middleware/error.ts`: Global error handler intercepting uncaught exceptions, preventing HTML stack traces from leaking via `res.status(500)`.
- `middleware/auth.ts`: Exports `generateToken()` (JWT creation) and `authMiddleware` (header validation logic).

## Controllers & Routes (`server/src/controllers/`)
- `webhook.controller.ts`: The largest controller. Ingests alerts, normalizes distinct provider schemas (Sentry, Datadog), queries Postgres for duplicates (`idx_incidents_dedup`), creates the incident, and enqueues the `INCIDENT_INGESTION` job.
- `auth.controller.ts`: Handles Admin dashboard Signup and Login, orchestrating `bcryptjs` hashing.
- `callback.controller.ts`: Listens for Discord embed button clicks, verifies internal secrets, and triggers `INCIDENT_FIX`.
- `project.controller.ts`: Standard CRUD interface for mapping GitHub/Pinecone credentials to a user ID.

## Worker Core (`server/worker/src/`)
- `index.ts`: Entry point for the isolated background process. Bootstraps the BullMQ `Worker` loop and connects the Discord bot daemon.
- `processor.ts`: Contains `processQueueJob`. The brain of the worker. Matches the job name, queries Postgres for credential context, executes the `WatcherAI` functions (`runPhase1`, `runPhase2`), and manages the internal state transitions (`TRIGGERED` -> `AWAITING_APPROVAL` -> `CLOSED_AND_LEARNED` -> `FAILED`).
- `utils/crypto.ts`: (Inferred) Utility module to symmetrically encrypt and decrypt API credentials before persisting them in the database.

## Watcher SaaS App (`watcher/`)
- `prisma/schema.prisma`: Defines the Object-Relational Mapping for the Next.js frontend, managing User, Session, Instance, and InstanceConfig tables for a distinct tenant-based layout.
- `package.json`: Shows dependencies for a robust modern frontend (`next 16`, `@radix-ui`, `better-auth`).

## Orchestration
- `docker-compose.yml`: The deployment manifest. Links Postgres, Redis, API, Worker, and NGINX containers, injecting environment variables implicitly into each execution context.
