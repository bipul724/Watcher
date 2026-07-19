# 11 API Architecture

The core Express server (`server/src`) exposes a RESTful JSON API. All routes are prefixed with `/api/v1`.

## Endpoints

### 1. Webhook Ingress
- **Method**: `POST`
- **Route**: `/api/v1/webhook/:secret` (Aliased as `/api/v1/webhook/wh/:secret`)
- **Purpose**: Ingests crash alerts from monitoring tools (Sentry, Datadog).
- **Authentication**: Validates the `:secret` URL parameter against the `webhook_secret` column in the `projects` table.
- **Request Body**: Accepts diverse schemas.
- **Controller**: `webhook.controller.ts -> handleWebhook`
- **Response**: `200 OK` with `{ status: "queued", incident_id: "uuid" }`

### 2. Discord Callbacks
- **Method**: `POST`
- **Route**: `/api/v1/callback/approve`
- **Purpose**: Triggers Phase 2 (Fixer) when a human clicks "Accept & Fix" on Discord.
- **Authentication**: Relies on a system-level environment variable `INTERNAL_CALLBACK_SECRET` passed in headers.
- **Request Body**: `{ incident_id: string, action: "approve" | "reject", channel_id: string, message_id: string, user_id: string }`
- **Controller**: `callback.controller.ts -> handleApprovalCallback`
- **Database Call**: Selects `incident`, validates status is `AWAITING_APPROVAL`, Enqueues `INCIDENT_FIX`.
- **Response**: `200 OK` with JSON success message.

### 3. Projects API (CRUD)
- **Controller**: `project.controller.ts`
- **Authentication**: JWT token verification middleware.
- **Routes**:
  - `GET /api/v1/projects`: List all projects for authenticated user.
  - `POST /api/v1/projects`: Create a new project configuration. Expects GitHub tokens and Pinecone namespace.
  - `GET /api/v1/projects/:id`: Get project credentials.
  - `PATCH /api/v1/projects/:id`: Update credentials.
  - `DELETE /api/v1/projects/:id`: Delete a project and cascade delete incidents.
  - `POST /api/v1/projects/validate-llm`: Validates LLM credentials against OpenRouter/OpenAI.

### 4. Incidents API
- **Controller**: `incident.controller.ts`
- **Authentication**: JWT token verification.
- **Routes**:
  - `GET /api/v1/incidents`: Fetch paginated list of incidents.
  - `GET /api/v1/incidents/:id`: Fetch specific incident and its raw payload.
  - `GET /api/v1/incidents/:id/runs`: Fetch execution logs from the `runs` table associated with this incident.

### 5. Authentication API
- **Controller**: `auth.controller.ts`
- **Routes**:
  - `POST /api/v1/auth/signup`: Create a new admin user (Hashes password via bcrypt).
  - `POST /api/v1/auth/login`: Compare password hash, return JWT token.
  - `GET /api/v1/auth/me`: Validate JWT and return user info.

### 6. Discord Diagnostics
- **Controller**: `discord.controller.ts` (inferred)
- **Route**: `GET /api/v1/discord/bot-info`
- **Purpose**: Checks the health and connectivity of the Discord bot connection.

## Middlewares
- **Global Error Handler** (`server/src/middleware/error.ts`): Catches unhandled exceptions and formats a standard JSON response with status codes, preventing Express from sending HTML stack traces.
- **CORS** (`index.ts`): Checks `origin` against the `ALLOWED_ORIGINS` environment variable.

## Key Takeaways
- The API is highly REST-compliant, leaning on standard HTTP verbs and semantic URIs.
- The separation between external Webhook endpoints (authenticated via URL Secret) and internal Dashboard endpoints (authenticated via JWT) is secure and well-designed.
