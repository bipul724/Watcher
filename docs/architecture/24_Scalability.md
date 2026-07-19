# 24 Scalability

WatcherAgent's decoupling of state and processing allows it to scale robustly under load.

## 1. Horizontal Scaling (Statelessness)
- **API Server (`watcher-api`)**: The Express API is entirely stateless. Sessions are managed via client-side JWTs, and request data is flushed immediately to Postgres and Redis. Therefore, an infinite number of API instances can be spun up behind a Load Balancer (like NGINX or AWS ALB) to absorb massive webhook ingestion spikes.
- **Worker Nodes (`watcher-worker`)**: The BullMQ queue workers carry no internal state. They pull all necessary context (API keys, repository URLs) from Postgres on a per-job basis. Scaling the AI processing capability is as simple as adding more worker containers.

## 2. Queue Scaling (BullMQ + Redis)
BullMQ provides inherent concurrency controls.
- As the workload increases, the queue depth (Wait list) will grow.
- Redis operates mostly in memory, handling hundreds of thousands of operations per second, making it an unlikely initial bottleneck for job queuing.

## 3. Database Scaling (PostgreSQL)
- The raw `pg` implementation uses Connection Pooling (`new Pool()`) to efficiently manage database sockets.
- As the system scales horizontally (many API servers and workers), they will all consume connections from the central Postgres instance.
- **Scaling Limit**: The primary Postgres instance `max_connections` will eventually be reached. Scaling strategies would involve Vertical Scaling (increasing DB memory/CPU) or introducing a connection pooler like `PgBouncer`.

## 4. Third-Party Scaling Dependencies
The system's scalability is ultimately constrained by external API quotas:
- **GitHub API Rate Limits**: A massive incident storm could easily exhaust GitHub's API rate limits when creating PRs.
- **LLM Token Limits**: High concurrency workers pinging OpenRouter/OpenAI may hit Tokens-Per-Minute (TPM) limits.

## Potential Improvements
To achieve true enterprise scalability:
1. Implement **PgBouncer** alongside the PostgreSQL container to manage connection scaling.
2. Implement strict rate limiting at the worker level (e.g., BullMQ Rate Limiters) to ensure the system never exceeds GitHub or LLM API quotas.
