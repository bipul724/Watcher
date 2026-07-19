# 14 Data Flow Diagrams

This document visualizes the exact flow of data through the WatcherAgent system.

## 1. Overall System Data Flow

```mermaid
graph LR
    subgraph External
        Monitor[Datadog/Sentry]
        GitHub[GitHub Repo]
        Discord[Discord Server]
    end

    subgraph Watcher Platform
        API[Express API]
        DB[(PostgreSQL)]
        Queue[(Redis BullMQ)]
        Worker[Queue Worker]
        AI[WatcherAI Engine]
    end

    %% Flow
    Monitor -->|JSON Webhook| API
    API <-->|Validate & Save| DB
    API -->|Enqueue Job| Queue
    Queue -->|Dequeue Job| Worker
    Worker -->|Fetch Context| DB
    Worker -->|Execute| AI
    
    %% AI Interactions
    AI -->|Send Embed| Discord
    Discord -->|Callback HTTP| API
    AI -->|Clone & PR| GitHub
```

## 2. API to Database Flow

```mermaid
graph TD
    Client[React Dashboard] -->|JWT Auth Request| Router[Express Router]
    Router --> Middleware[Auth Middleware]
    Middleware -->|Verified| Controller[Project Controller]
    
    Controller -->|Parameterized SQL| DB[(PostgreSQL)]
    DB -->|Result Rows| Controller
    Controller -->|JSON Response| Client
```

## 3. Worker Execution Flow (Phase 1 & Phase 2)

```mermaid
flowchart TD
    Job((BullMQ Job)) --> condition{Job Type}
    
    condition -->|INCIDENT_INGESTION| Phase1[Run Phase 1]
    condition -->|INCIDENT_FIX| Phase2[Run Phase 2]
    
    subgraph Phase 1: Triage
        Phase1 --> N1[Node 1: LLM Triage]
        N1 --> N2[Node 2: Pinecone RAG]
        N2 --> N3[Node 3: Discord Alert]
    end
    
    subgraph Phase 2: Remediation
        Phase2 --> N4[Node 4: GitHub PR]
        N4 --> N5[Node 5: Pinecone Index]
    end
    
    N3 -->|Update DB: AWAITING_APPROVAL| End1((Complete))
    N5 -->|Update DB: CLOSED_AND_LEARNED| End2((Complete))
```

## 4. Authentication Flow

```mermaid
sequenceDiagram
    participant User as Admin (Browser)
    participant API as Express API
    participant DB as Postgres
    
    User->>API: POST /api/v1/auth/login {email, password}
    API->>DB: SELECT * FROM users WHERE email = ?
    DB-->>API: User Row
    API->>API: bcrypt.compare(password, hash)
    API->>API: generateToken()
    API-->>User: 200 OK { token }
    
    User->>API: GET /api/v1/projects (Header: Bearer token)
    API->>API: jwt.verify()
    API->>DB: SELECT * FROM projects WHERE user_id = ?
    DB-->>API: Projects Rows
    API-->>User: 200 OK [ ... ]
```
