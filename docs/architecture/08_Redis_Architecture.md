# 08 Redis Architecture

Redis serves as the backbone for the distributed, asynchronous nature of WatcherAgent. It isolates the high-throughput webhook ingestion API from the slow, resource-intensive AI execution processes.

## Redis Implementation

The system connects to a single Redis instance (defaulting to port 6379 via `docker-compose.yml`). The connection configuration is managed in `server/src/queue/index.ts`.

### 1. Queue Management (BullMQ)
WatcherAgent heavily relies on Redis as the persistence layer for BullMQ.
- **Keys**: BullMQ automatically generates complex key structures (Hashes, Sets, Lists) prefixed by `bull:incident-queue:` to manage the job lifecycle (wait, active, completed, failed, delayed).
- **TTL**: Job data is typically retained based on BullMQ's configuration for completed/failed jobs to prevent memory bloat over time.
- **Streams & Pub/Sub**: BullMQ utilizes Redis Streams to emit job lifecycle events (e.g., allowing the Express server to know when a job fails, though this is primarily polled by the worker).

### 2. Caching Strategy
While Pinecone acts as the primary semantic vector cache for AI resolutions, Redis is exclusively dedicated to queue management and job state tracking. 

## Redis Data Flow Diagram

```mermaid
graph TD
    API[Express API] -->|Push Job Payload| Redis[(Redis 7)]
    
    subgraph Redis Keyspace [bull:incident-queue:*]
        Wait[bull:incident-queue:wait (List)]
        Active[bull:incident-queue:active (List)]
        Failed[bull:incident-queue:failed (Set)]
        Completed[bull:incident-queue:completed (Set)]
        JobHash[bull:incident-queue:jobId (Hash)]
    end
    
    API -.->|1. LPUSH| Wait
    API -.->|2. HSET| JobHash
    
    Worker[BullMQ Worker] -->|3. BRPOPLPUSH| Wait
    Worker -.->|moves to| Active
    
    Worker -->|4. Execute| Processor[Node.js Processor]
    
    Processor -->|Success| Completed
    Processor -->|Throws Error| Failed
```

## Key Takeaways
- Redis is utilized strictly as a message broker and state machine via BullMQ, avoiding custom key-value caching logic in favor of a robust queue framework.
- By outsourcing state management to Redis, the API Server and Worker can scale horizontally across multiple instances without race conditions.
