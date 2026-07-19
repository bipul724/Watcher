# 19 Configuration Architecture

WatcherAgent relies heavily on environment variables for defining external dependencies and controlling system behaviors. 

## Configuration Loading
In both the Express API and the Worker, configuration is handled via the `dotenv` package.
- **Worker Loading**: In `server/worker/src/index.ts`, a custom `loadEnv()` function searches iteratively upwards through the directory tree (up to 4 levels) to find the `.env` file, ensuring the worker loads the identical configuration as the API server regardless of its execution directory.
- **API Loading**: Loaded synchronously during Express boot (`server/src/db/index.ts` and `config/index.ts`).

## Global Environment Variables

The `.env` file (`.env.example`) defines the following critical scopes:

### 1. Infrastructure Settings
- `DATABASE_URL`: Connection string for PostgreSQL.
- `REDIS_HOST` / `REDIS_PORT`: BullMQ connection targets.
- `PORT`: Express server port (default 3001).

### 2. Application Secrets
- `JWT_SECRET`: Used to sign authentication tokens.
- `ENCRYPTION_KEY`: A 32-character key used to dynamically encrypt and decrypt user-submitted third-party API keys (GitHub, Pinecone) in the `projects` table via `server/worker/src/utils/crypto.ts`.
- `INTERNAL_CALLBACK_SECRET`: Authorizes internal webhook requests from Discord back to the Express API.

### 3. Pinecone / Vector Memory settings
- `PINECONE_API_KEY`: Global fallback API key.
- `PINECONE_SCORE_THRESHOLD`: `0.78` — Controls how aggressively the system recalls a memory. Lowering this value makes the system reuse fixes for loosely similar bugs; raising it requires exact matches.
- `PINECONE_SCORE_THRESHOLD_BROAD`: `0.82` — Threshold for cross-service search.

### 4. Noise Filter Thresholds (Feature Flags)
The system includes configuration variables that act as noise filters, preventing the AI from acting on insignificant blips:
- `NOISE_ERROR_RATE_THRESHOLD`: `0.02`
- `NOISE_LATENCY_MS_THRESHOLD`: `200`
- `NOISE_DURATION_MIN_THRESHOLD`: `1`

## Runtime Configuration (Database)
While the `.env` file manages global infrastructure, *Project-Specific Configuration* is managed dynamically at runtime via the `projects` table.
- A user can supply their own `github_token`, `pinecone_api_key`, and `openrouter_key` via the UI.
- The worker dynamically constructs an `ExecutionContext` by selecting these rows from the database before kicking off the AI pipeline.
- Tokens are decrypted on the fly before being passed to `WatcherAI`.

## Key Takeaways
- The configuration architecture is robust, securely separating global infrastructure secrets (in `.env`) from tenant-specific API keys (encrypted in Postgres).
- Hardcoding the 32-char `ENCRYPTION_KEY` in `.env` means that if the `.env` file is lost, all tenant GitHub and Pinecone tokens stored in the database are permanently irrecoverable.
