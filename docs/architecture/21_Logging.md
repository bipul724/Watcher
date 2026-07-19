# 21 Logging Architecture

WatcherAgent employs a hybrid logging approach, utilizing standard output for infrastructural monitoring and database persistence for domain-specific auditing.

## 1. System Output Logging
Currently, the system relies on native `console.log()` and `console.error()` statements scattered throughout the `server`, `worker`, and `watcherai` directories.
- **Log Levels**: Implicitly defined by standard JS methods (`log`, `warn`, `error`).
- **Missing Features**: There is no dedicated structured logging library (e.g., Winston, Pino). Logs are emitted as raw strings rather than structured JSON, which complicates ingestion into observability platforms like Datadog or ELK.
- **Tracing**: Correlation IDs are partially implemented via `incidentId`. For example, worker logs typically prepend `[Worker] Job <ID>...` or reference the Incident ID.

## 2. Database Auditing (Execution Tracing)
To provide deep observability to end-users via the dashboard, the system persists execution logs into the PostgreSQL database.
- **Table**: `runs`
- **Mechanism**: Every time the worker executes a job (`INCIDENT_INGESTION` or `INCIDENT_FIX`), it creates a new row in the `runs` table with `status = 'RUNNING'`.
- **JSON Serialization**: Upon completion or failure, the worker updates the `logs` column (a `JSONB` field).
  - If successful, it serializes the entire JSON output from the AI Nodes.
  - If failed, it serializes the JavaScript `Error` stack trace.
- **Benefits**: This allows the React Frontend to poll the `/api/v1/incidents/:id/runs` endpoint and render a step-by-step visual audit of exactly what the LLM decided, what Pinecone recalled, and what PR was generated, without forcing the user to grep server terminal logs.

## Recommendations for Improvement
- **Adopt Structured Logging**: Implement Pino or Winston. Ensure every `console.log` is replaced with a structured logger that automatically injects the `incidentId` and `projectId` as correlation IDs.
- **Centralized Log Management**: Since the architecture spans an API and a separate Worker process, tracking a webhook from ingress to PR creation requires joining logs across two containers. A centralized logging driver (e.g., Docker Fluentd logging) is necessary for production.
