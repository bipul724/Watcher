# 27 Improvement Recommendations

Based on the architectural review, the following improvements are recommended to elevate WatcherAgent to a production-ready enterprise standard.

## Architecture Smells
1. **Split-Brain Frontend & Persistence**: The repository contains both a Vite React SPA (`frontend/`) and a Next.js App Router application (`watcher/`). Furthermore, the Express backend uses raw `pg` queries while the Next.js backend uses `Prisma`. 
   - **Recommendation**: Unify the stack. Deprecate the Express API and Vite SPA in favor of migrating all webhook ingestion and BullMQ queue management directly into Next.js Route Handlers. Use Prisma for all database operations to eliminate raw SQL string maintenance.

2. **Hardcoded Global Encryption Key**: The `.env` file uses a single `ENCRYPTION_KEY` to encrypt and decrypt tenant API keys stored in Postgres.
   - **Recommendation**: Integrate AWS KMS or HashiCorp Vault. If the `.env` file is accidentally committed or lost, all tenant credentials currently in the database become irretrievably encrypted or compromised.

## Code Smells
1. **God Object Controller**: `server/src/controllers/webhook.controller.ts` is over 200 lines and mixes HTTP parsing, provider strategy logic (Sentry vs Datadog), idempotency SQL queries, and queue pushing.
   - **Recommendation**: Extract business logic into a `WebhookService` class, and abstract the provider parsing logic using a formal Strategy Pattern.

2. **Lack of Structured Logging**: Outputting strings via `console.log` is insufficient for distributed microservices.
   - **Recommendation**: Implement `Pino` or `Winston`. Ensure every log line outputs JSON containing the `incidentId` correlation ID, so logs from the API container and Worker container can be accurately joined in Datadog or ELK.

## Performance Issues
1. **Unbounded Postgres Connections**: The Express API spins up a `pg.Pool()` without external connection management.
   - **Recommendation**: Implement `PgBouncer` to pool connections globally across all worker and API instances, preventing DB socket exhaustion under massive webhook spikes.

## Circular Dependencies
No strict circular dependencies were observed at the import level, owing to the clean functional separation of the `watcherai` nodes from the `worker` engine.

## Duplicate Logic
The Discord bot logic is initialized in the Worker (`worker/src/index.ts`) via `loginBot()`, but Discord API interactions (button callback parsing) also exist in the Express API (`callback.controller.ts`). This splits Discord knowledge across the synchronous and asynchronous boundaries.
