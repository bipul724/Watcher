# 23 Performance Architecture

WatcherAgent prioritizes high throughput at the ingress layer and relies on intelligent caching to bypass latency bottlenecks in the AI layer.

## 1. Asynchronous Decoupling (Queues)
The fundamental performance feature is the division of labor.
- The `handleWebhook` controller executes in roughly 10-50 milliseconds, restricted only by a single fast SQL query to Postgres (idempotency check) and a quick Redis `LPUSH`.
- The heavyweight, multi-second LLM processing tasks are strictly isolated in background threads managed by BullMQ.

## 2. Fast-Path Caching (Pinecone Vector Memory)
Large Language Models (LLMs) are incredibly slow (often taking 10-30 seconds to generate a full code patch).
- **The Optimization**: Instead of running the full Node 4 File Discovery and Audit loop for every incident, WatcherAgent stores successful patches in Pinecone.
- **Impact**: When a recurring error matches an existing vector with a score > `0.78`, the system pulls the exact unified diff from memory and applies it. This drops the remediation latency from ~45 seconds down to < 3 seconds, bypassing the LLM completely.

## 3. Database Indexes
The system handles potential "alert storms" (e.g., an app crashes in a loop, firing thousands of webhooks) via a compound index:
- `idx_incidents_dedup`: `(project_id, error_signature, status, created_at DESC)`
- This ensures the idempotency `SELECT` query runs in O(log N) time even as the `incidents` table grows to millions of rows, preventing CPU starvation on the PostgreSQL instance.

## 4. Parallelism
- **Worker Scaling**: The BullMQ architecture inherently supports horizontal scaling. By spinning up more `watcher-worker` Docker containers, the system achieves linear parallel processing power.
- **Connection Pooling**: The backend uses the `pg` driver's `Pool` object to reuse TCP connections to Postgres, preventing connection exhaustion under heavy load.

## Potential Bottlenecks
- **Single Redis Instance**: BullMQ relies heavily on Redis. A single Redis instance can eventually bottleneck if the queue reaches thousands of concurrent jobs per second, requiring migration to Redis Cluster.
- **LLM Rate Limits**: Performance is hard-capped by the external OpenRouter API. If the provider throttles the agent, the queue will back up.
