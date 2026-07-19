# 22 Security Architecture

Due to its role as an autonomous remediation agent with write-access to production codebases, WatcherAgent implements multiple layers of security.

## 1. Data Validation & Injection Prevention
- **Zod Validation Layer**: All incoming requests (like Signup, Login, and Project configuration) are validated against strict Zod schemas before hitting business logic.
- **SQL Injection Prevention**: The `server/src/db/index.ts` layer exclusively uses parameterized queries (e.g., `query(sql, [var1, var2])`) via the `pg` driver, completely eliminating the risk of SQL injection.
- **JSON Payload Escaping**: The `watcherai` engine strictly parses LLM outputs as JSON, often wrapping prompts to force standard schema returns, preventing hallucinated arbitrary code execution inside the worker.

## 2. Authentication & Authorization
- **JWT**: Administrative dashboard access requires a signed Bearer Token.
- **Password Hashing**: User passwords are encrypted at rest using `bcryptjs` with 10 salt rounds.
- **Webhook Secrets**: Webhooks can only be triggered if the incoming URL path matches a uniquely generated secret (`/api/v1/webhook/:secret`).

## 3. Secret Management & Encryption
- **Encrypted at Rest**: Tenant credentials (`github_token`, `pinecone_api_key`, `openrouter_key`, `discord_bot_token`) are not stored as plaintext. Before insertion into the `projects` table, they are encrypted using a symmetric cipher (utilizing the `ENCRYPTION_KEY` env variable). The worker decrypts them into memory just-in-time during the `processQueueJob` phase.

## 4. Network Security
- **CORS (Cross-Origin Resource Sharing)**: Express is configured to only allow requests from domains explicitly whitelisted in the `ALLOWED_ORIGINS` environment variable.
- **Implicit Rate Limiting**: The Postgres `idx_incidents_dedup` index and the 5-minute rolling deduplication window in the Webhook Controller acts as a semantic rate limiter against ingestion DDoS attacks.

## 5. Agentic Safety Guardrails (The Human in the Loop)
Security against rogue AI behavior is built into the orchestration design:
- **Node 3 (HITL)**: The system halts completely and requires explicit human verification via Discord before mutating state.
- **Node 4 (Fixer) Guardrails**:
  - Checks if a Pull Request already exists for the bug.
  - Verifies JSON syntax if modifying `.json` files.
  - Aborts if the LLM attempts to modify more than 30% of a file, categorizing it as an unsafe refactor rather than a patch.

## Technical Debt & Vulnerabilities
- **No Helmet/CSRF**: The Express server lacks `helmet` for standard HTTP security headers and lacks CSRF tokens, relying solely on CORS.
- **Centralized Encryption Key**: The single `ENCRYPTION_KEY` in `.env` constitutes a massive single point of failure. If compromised, the attacker can decrypt all tenant GitHub tokens.
