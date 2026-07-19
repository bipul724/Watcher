# 06 Complete Dependency Graph

WatcherAgent consists of several sub-projects, each with its own package boundaries.

## Server / API Dependency Graph (`server/`)

**Responsibility**: Core HTTP ingress, routing, database queries, queue pushing.
- **Express** (`express`, `cors`): Web server routing and middleware.
- **BullMQ** (`bullmq`): Redis-backed job queuing system.
- **PostgreSQL** (`pg`): Raw database driver for data persistence.
- **Security** (`bcryptjs`, `jsonwebtoken`): Authentication and token handling.
- **Validation** (`zod`): Payload verification and data structure guarantees.

## Worker Dependency Graph (`server/worker/`)

**Responsibility**: Executes BullMQ jobs asynchronously.
- **BullMQ** (`bullmq`): Pulls jobs from Redis.
- **PostgreSQL** (`pg`): Fetches complete project credentials before running jobs.
- **WatcherAI** (`server/watcherai/`): Imports the core AI library.

## WatcherAI Pipeline Dependency Graph (`server/watcherai/`)

**Responsibility**: The brain of the agent. Connects to the outside world.
- **LLM APIs**: Communicates directly with OpenRouter, OpenAI, Anthropic, Gemini.
- **Pinecone**: Communicates with the vector database for RAG context.
- **GitHub**: `octokit` (inferred) for repository reading and PR creation.
- **Discord**: `discord.js` (inferred) for human-in-the-loop interactive webhooks.

## Watcher App Dependency Graph (`watcher/`)

**Responsibility**: The Next.js 16 SaaS Portal.
- **Next.js** (`next`): React framework and App Router.
- **Prisma** (`@prisma/client`, `@prisma/adapter-pg`): ORM for database queries.
- **Authentication** (`better-auth`): User session management.
- **UI System**: TailwindCSS (`@tailwindcss/postcss`), Radix UI primitives, Lucide Icons.

## Full Architectural Dependency Flow

```mermaid
graph TD
    %% Frontend Dependencies
    subgraph Frontend [React SPA / Next.js]
        Vite[Vite React]
        Next[Next.js App]
        Prisma[Prisma ORM]
        Tailwind[TailwindCSS]
        
        Next --> Prisma
    end

    %% Backend Dependencies
    subgraph Backend [Express Server]
        Express[Express Core]
        Zod[Zod Validation]
        Bcrypt[Bcrypt & JWT]
        PG_Driver[node-postgres / pg]
        
        Express --> Zod
        Express --> Bcrypt
        Express --> PG_Driver
    end

    %% Queue Dependencies
    subgraph Async [Worker / Queue]
        Bull[BullMQ]
        Redis[(Redis)]
        Worker_Process[Worker Process]
        
        Express --> Bull
        Bull --> Redis
        Worker_Process --> Bull
    end

    %% AI Core
    subgraph AI [WatcherAI Engine]
        Pinecone[Pinecone DB]
        OpenRouter[OpenRouter API]
        Octokit[GitHub API]
        Discord[Discord.js]
        
        Worker_Process --> AI
        AI --> Pinecone
        AI --> OpenRouter
        AI --> Octokit
        AI --> Discord
    end
```

## Key Takeaways
- The backend carefully avoids heavy abstractions like ORMs for its core ingestion path (`server/`), favoring raw `pg` for performance, while adopting BullMQ for robust asynchronous isolation.
- The dual-frontend setup (`frontend/` Vite vs `watcher/` Next.js) creates a dual-dependency graph where Prisma exists in the Next.js app but is absent in the core Express server.
