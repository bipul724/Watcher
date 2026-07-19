# 05 Internal Architecture

The WatcherAgent backend is built around a layered architecture, strictly separating routing, business logic, queuing, and AI processing.

## 1. Controllers (`server/src/controllers/`)
- **Responsibility**: Validate incoming HTTP requests, orchestrate model calls, and return standard JSON responses.
- **Design Pattern**: Controller pattern.
- **Files Involved**: `auth.controller.ts`, `webhook.controller.ts`, `callback.controller.ts`, `project.controller.ts`.
- **Interactions**: Receives input from Routes, calls Models/Database for CRUD, pushes to Queues, and responds to the client.

## 2. Models / Database Layer (`server/src/models/`, `server/src/db/`)
- **Responsibility**: Provides the persistence interface. Note that this project uses raw SQL rather than an ORM in the main `server` directory.
- **Design Pattern**: Active Record (loose interpretation via functions).
- **Files Involved**: `project.ts`, `incident.ts`, `db/index.ts`.
- **Interactions**: Receives structured data from Controllers, interacts securely with the `pg` driver using parameterized queries.

## 3. Queue Layer (`server/src/queue/`, `server/worker/`)
- **Responsibility**: Asynchronous task delegation. The Express API acts as the Producer, the Worker acts as the Consumer.
- **Design Pattern**: Producer/Consumer, Publisher/Subscriber.
- **Files Involved**: `server/src/queue/index.ts`, `server/worker/src/processor.ts`.
- **Interactions**: Pushes job metadata (Incident IDs) to BullMQ. Worker retrieves the job, polls the DB for complete context, and executes the heavy lifting.

## 4. AI Engine Layer (`server/watcherai/`)
- **Responsibility**: LLM abstraction, prompt engineering, vector memory management, and human-in-the-loop logic.
- **Design Pattern**: Chain of Responsibility / Pipeline Pattern.
- **Files Involved**: `index.js`, `nodes/node-*-*/`.
- **Interactions**: Fully stateless functional execution. Takes a payload and context, executes external HTTP API calls (OpenRouter, Pinecone, GitHub), and returns a deterministic JSON output.

## 5. Next.js SaaS / Admin Layer (`watcher/`)
- **Responsibility**: An independent Next.js 16 service using Prisma to manage overarching user subscriptions, instances, and configurations.
- **Design Pattern**: Server Actions, React Server Components (RSC), MVC.
- **Files Involved**: `watcher/prisma/schema.prisma`, `watcher/app/`.
- **Interactions**: Serves HTML to the browser and directly queries Postgres using Prisma.

## Key Takeaways & Code Smells
- **Code Smell (Missing Service Layer)**: In `server/src`, the Controllers are highly overloaded. For example, `webhook.controller.ts` contains massive conditional blocks for normalizing webhook formats, checking idempotency, and saving to the database. A dedicated Service layer (`WebhookService.ts`) should abstract this logic to conform to SOLID principles.
- **Design Pattern (Pipeline)**: The division of `WatcherAI` into strictly defined numeric nodes (`node-01`, `node-02`) perfectly mirrors a Pipeline pattern, allowing individual components to be unit-tested without external side effects.
