# 15 Sequence Diagrams

This document contains detailed sequence diagrams for the core flows of WatcherAgent.

## 1. Main Business Flow (End-to-End Orchestration)

```mermaid
sequenceDiagram
    autonumber
    participant App as Monitored App
    participant Sentry as Sentry/Datadog
    participant API as Watcher Express API
    participant Worker as BullMQ Worker
    participant DB as Postgres
    participant LLM as OpenRouter
    participant Pinecone as Pinecone DB
    participant Discord as Discord Server
    participant GitHub as GitHub API

    App-->>Sentry: App Crashes (Error thrown)
    Sentry->>API: POST /api/v1/webhook/:secret
    API->>DB: Save Incident (status: TRIGGERED)
    API->>Worker: Enqueue INCIDENT_INGESTION
    Worker->>LLM: Node 1: Triage (Extract Signature)
    LLM-->>Worker: JSON { severity: P1, signature: "..." }
    Worker->>Pinecone: Node 2: Vector Search for historical fix
    Pinecone-->>Worker: Return Runbooks / Cached Diff
    Worker->>Discord: Node 3: Send Embed Card
    Worker->>DB: Update (status: AWAITING_APPROVAL)
    
    Note over Discord, Worker: Human reviews the alert in Discord
    Discord->>API: User clicks "Accept & Fix"
    API->>Worker: Enqueue INCIDENT_FIX
    
    Worker->>GitHub: Node 4: Clone repo & fetch files
    Worker->>LLM: Node 4: Generate Patch Diff
    LLM-->>Worker: Unified Diff String
    Worker->>GitHub: Node 4: Commit & Open Pull Request
    GitHub-->>Worker: PR URL
    
    Worker->>Pinecone: Node 5: Index Patch as Vector
    Worker->>DB: Update (status: CLOSED_AND_LEARNED)
```

## 2. Queue Processing & Retry Sequence

```mermaid
sequenceDiagram
    participant API as Express API
    participant BullMQ as Redis/BullMQ
    participant Worker as Worker Process
    participant GitHub as GitHub API

    API->>BullMQ: incidentQueue.add(job_data)
    BullMQ->>Worker: Dequeue Job
    Worker->>GitHub: Execute API Call
    
    alt API Call Succeeds
        GitHub-->>Worker: 200 OK
        Worker->>BullMQ: Job Completed
    else API Call Fails (Rate Limit)
        GitHub-->>Worker: 429 Too Many Requests
        Worker-->>BullMQ: Throws Error
        BullMQ->>BullMQ: Delay 5000ms (Exponential Backoff)
        BullMQ->>Worker: Retry Job (Attempt 2)
    end
```

## 3. User Login Sequence

```mermaid
sequenceDiagram
    participant UI as Vite React App
    participant API as Express API
    participant DB as PostgreSQL
    
    UI->>API: POST /api/v1/auth/login { email, password }
    API->>DB: SELECT * FROM users WHERE email = ?
    DB-->>API: Row found
    API->>API: bcrypt.compare(password)
    API->>API: generateToken(user.id)
    API-->>UI: 200 OK { token: "jwt_string..." }
    
    UI->>UI: localStorage.setItem('token')
```
