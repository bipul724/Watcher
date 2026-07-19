# 09 Queue Architecture

WatcherAgent employs a robust asynchronous queuing architecture to decouple the lightweight webhook receiver (Express API) from the heavyweight, long-running AI operations (LLM execution, PR creation).

## Queue System Details

- **Technology**: BullMQ backed by Redis.
- **Queue Name**: `incident-queue` (defined in `server/src/queue/index.ts`).
- **Connection Structure**: Standard Redis Host/Port without Sentinel/Cluster setup natively configured, though easily extendable via environment variables.

## Producers & Consumers

### Producer (`server/src/queue/index.ts`)
The Express API acts as the sole producer. It pushes two primary job types:
1. `INCIDENT_INGESTION`: Enqueued during the `handleWebhook` phase. Payload includes the internal database `incidentId` and a normalized JSON payload.
2. `INCIDENT_FIX`: Enqueued via the Discord `/api/v1/callback/approve` route after a developer clicks "Accept & Fix". Payload includes `incidentId` and Discord interaction context.

### Consumer (`server/worker/src/index.ts`)
The Node.js worker acts as the consumer.
- It initializes a single BullMQ `Worker` listening to `incident-queue`.
- **Concurrency**: By default, it processes 1 job at a time per worker instance (as `concurrency` is not explicitly set in the BullMQ worker options).

## Retry Strategy & Backoff

To handle transient network errors (e.g., GitHub API rate limits, OpenRouter timeouts), the Producer enforces a robust retry strategy when enqueuing:
```typescript
{
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 5000,
  }
}
```
- A failing job will retry up to 3 times.
- The first retry waits 5 seconds, the second waits 25 seconds, etc. (Exponential backoff).

## Dead Letter Queue (DLQ)
BullMQ implicitly handles DLQ logic by moving jobs that exceed their `attempts` limit into the `failed` set in Redis. The worker listens for the `'failed'` event (`worker.on('failed')`) and logs the stack trace to standard error. Inside `processQueueJob`, terminal failures update the Postgres `runs` and `incidents` tables to status `FAILED`, ensuring the failure is visible in the UI.

## Queue Flow Diagram

```mermaid
graph TD
    API[Express API] -->|push(incidentId)| BullMQ[BullMQ: incident-queue]
    
    subgraph Job Queue
        Wait[Waiting Jobs]
        Delayed[Delayed/Backoff Jobs]
    end
    
    BullMQ --> Wait
    
    Worker[Worker Node Process] -->|polls| Wait
    
    Worker -->|success| Done[Completed Jobs Set]
    Worker -->|fail (attempt < 3)| Delayed
    Delayed -->|timeout expires| Wait
    Worker -->|fail (attempt = 3)| DLQ[Failed Jobs Set]
```
