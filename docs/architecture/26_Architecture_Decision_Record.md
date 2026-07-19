# 26 Architecture Decision Record (ADR)

This document infers the reasoning behind the technology stack choices made during the development of WatcherAgent.

## 1. Why Express.js instead of NestJS?
- **Decision**: The backend API utilizes raw Express with manual routing and controller logic.
- **Reasoning**: Express provides the absolute minimum overhead needed to rapidly ingest webhooks. Since the heavy lifting is pushed to background workers anyway, a heavy OOP framework like NestJS would have introduced unnecessary boilerplate and latency into the critical ingestion path.
- **Tradeoffs**: Missing built-in dependency injection, leading to slight "God object" controllers (e.g., `webhook.controller.ts`).

## 2. Why Raw SQL (`pg`) instead of Prisma/TypeORM in the core backend?
- **Decision**: The API Server initializes and manages database connections using raw SQL templates.
- **Reasoning**: Raw SQL provides maximum performance and absolute control over indexing and idempotency query execution plans (crucial for handling alert storms).
- **Tradeoffs**: High technical debt. Lack of a strict migration system means schema updates must be carefully coded as `ALTER TABLE IF NOT EXISTS` patches, which scales poorly across development teams. (Notably, Prisma *is* used in the `watcher/` Next.js frontend, indicating a possible migration in progress).

## 3. Why BullMQ & Redis instead of RabbitMQ / Kafka?
- **Decision**: Asynchronous jobs are managed by BullMQ over Redis.
- **Reasoning**: WatcherAgent requires robust retry logic (exponential backoff) and delayed executions, which BullMQ provides out-of-the-box. Setting up Redis is significantly lighter weight via Docker than managing a full Kafka ZooKeeper cluster or RabbitMQ Erlang runtime, keeping the project deployable by small teams.
- **Tradeoffs**: Redis queues are bound by RAM, whereas Kafka handles massive disk-backed logs.

## 4. Why Pinecone instead of pgvector?
- **Decision**: Semantic memory is stored externally in Pinecone DB.
- **Reasoning**: Offloads the intensive vector similarity search math from the central PostgreSQL instance to a specialized SaaS provider. This keeps the Postgres CPU free to rapidly process incoming webhooks.
- **Tradeoffs**: Introduces a hard dependency on an external SaaS product. If Pinecone goes down, the RAG feature fails entirely.

## 5. Why a Dual Frontend Strategy?
- **Decision**: There is a `frontend/` (Vite + React 19 SPA) and a `watcher/` (Next.js 16 app).
- **Reasoning (Inferred)**: The project likely began as a lightweight API with a Vite SPA for internal tooling. As the platform matured into a multi-tenant SaaS offering, the developer opted to construct a modern Next.js 16 (App Router) interface leveraging Prisma and Better Auth, resulting in temporary repository duplication.
- **Tradeoffs**: High maintainability cost until one frontend is officially deprecated.
