# 17 Class/Module Relationships

Because the backend codebase (`server/` and `worker/`) avoids heavy OOP and ORM layers, "Classes" are mostly replaced by independent Modules (exported functions interacting via structured typed interfaces).

## 1. Domain Models (`server/src/models/`)
These modules map TypeScript types to Postgres SQL queries.

- **Module**: `project.ts`
  - **Responsibilities**: CRUD operations for projects.
  - **Key Functions**: `createProject`, `getProjectBySecret`.
  - **Dependencies**: `server/src/db/index.ts` (query executor).
  - **Reverse Dependencies**: `webhook.controller.ts`, `project.controller.ts`.

- **Module**: `incident.ts`
  - **Responsibilities**: State tracking for incidents.
  - **Key Functions**: `createIncident`, `updateIncidentStatus`.
  - **Dependencies**: `db/index.ts`.
  - **Reverse Dependencies**: `webhook.controller.ts`, `processor.ts`.

## 2. Controllers (`server/src/controllers/`)
These orchestrate HTTP requests.

- **Module**: `webhook.controller.ts`
  - **Composition**: Composes `getProjectBySecret`, payload normalization logic, idempotency SQL checks, `createIncident`, and `addIngestionJob`.
  - **Dependencies**: Model layer, Queue layer.

## 3. WatcherAI Nodes (`server/watcherai/nodes/`)
The AI engine is divided into distinct structural directories, each exporting an entry function.

- **Module**: `node-01-triage/`
  - **Responsibilities**: Determine category and severity from webhook payload.
  - **Dependencies**: `ai.js` (LLM abstraction wrapper).
  - **Interface**: Takes `payload` (JSON), returns `{ severity, error_category, ... }`.

- **Module**: `node-02-runbook/`
  - **Responsibilities**: Connect to Pinecone and retrieve historical fixes.
  - **Dependencies**: `@pinecone-database/pinecone`, `fallback-cache.js` (Static JSON).

- **Module**: `node-04-warroom/`
  - **Responsibilities**: The core coding loop (Keyword Extraction -> File Search -> Audit & Fix).
  - **Dependencies**: `@octokit/rest`, `ai.js`.
  - **Complexity**: Highly complex module acting as a Facade over the entire GitHub interactions.

## 4. Prisma Next.js Architecture (`watcher/`)
In the secondary Next.js app, the Prisma schema creates concrete Class/Model relationships.

- **`User` Model**: One-to-Many with `Instance` and `Session`.
- **`Instance` Model**: Represents a Watcher deployment. One-to-One with `InstanceConfig`. One-to-Many with `Job`.
- **`InstanceConfig` Model**: Encapsulates encrypted keys (OpenRouter, Pinecone, GitHub). 

## Key Takeaways
- The backend uses a functional, module-based approach rather than strict OOP inheritance. Business logic flows sequentially through functions rather than object state.
- The `WatcherAI` module acts as a "Black Box" to the rest of the application: The worker passes in data and awaits a strictly typed JSON response, completely oblivious to the internal LLM parsing mechanics.
