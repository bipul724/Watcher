# 12 Authentication & Authorization

WatcherAgent utilizes multiple authentication boundaries to secure different parts of its surface area. 

## 1. Internal Dashboard Authentication (JWT)

The admin dashboard (React SPA) authenticates with the Express API using standard JSON Web Tokens.

- **Authentication Flow**:
  1. **Signup**: `POST /api/v1/auth/signup`. Validates email/password via Zod (`SignupSchema`). Hashes the password using `bcryptjs` (salt rounds: 10) and stores it in the `users` table. Returns a JWT.
  2. **Login**: `POST /api/v1/auth/login`. Compares the provided password against `password_hash`. On success, generates a JWT via `jsonwebtoken`.
  3. **Verification**: `GET /api/v1/auth/me`. Uses the `authMiddleware` to parse the `Authorization: Bearer <token>` header, decodes the user ID, and returns profile details.

- **Token Lifecycle**:
  - Tokens are signed with `JWT_SECRET` (from environment variables).
  - They are strictly bearer tokens. State (like expiration) is managed via standard JWT claims.
  - **Middleware**: `server/src/middleware/auth.ts` intercepts protected routes (like `/projects`), verifies the token, and attaches `req.user`.

## 2. Webhook Ingress Authentication

External monitoring services (Sentry, Datadog) cannot generate JWTs. They authenticate via URL secrets.

- **Flow**: `POST /api/v1/webhook/:secret`
- **Mechanism**: The `:secret` in the URL path is queried against the `projects` table (`webhook_secret`).
- **Authorization**: If the project is found and marked `active=true`, the webhook is accepted. If not, `404 Not Found` is returned.

## 3. Discord Callback Authentication

When a user interacts with the Discord embedded buttons ("Accept & Fix"), Discord sends an HTTP callback to the server.

- **Flow**: `POST /api/v1/callback/approve`
- **Mechanism**: The server expects a custom header matching the `INTERNAL_CALLBACK_SECRET` environment variable.
- **Why?**: The Discord Bot (running in the worker or a separate thread) makes a localized HTTP request to the Express API to trigger the queue. This secret prevents public internet users from spoofing approval payloads.

## 4. Next.js SaaS Authentication (`watcher/`)

The isolated `watcher/` Next.js application uses `better-auth` combined with Prisma.
- **Mechanism**: Implements `Session`, `Account`, and `Verification` models in the database.
- **Support**: Native OAuth providers (GitHub, Google, etc.) and email/password are supported out of the box via Better Auth.

## Key Takeaways
- The backend carefully segregates its trust boundaries: Bearer JWTs for human admins, URL Secrets for third-party monitoring tools, and static API keys for internal microservice (Discord bot to API) communication.
- Password hashing is implemented securely using `bcryptjs`.
