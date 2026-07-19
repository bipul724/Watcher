# 29 Deployment Architecture

WatcherAgent is engineered to deploy natively via Docker Compose, wrapping all components into isolated virtual networks.

## Infrastructure Diagram

```mermaid
graph TD
    subgraph Host OS / EC2 Instance
        subgraph Docker Bridge Network
            Nginx[NGINX Reverse Proxy (Port 80)]
            API[watcher-api (Port 3001)]
            Worker[watcher-worker]
            Postgres[(postgres:15-alpine)]
            Redis[(redis:7-alpine)]
        end
        
        Volume_PG[(postgres_data)]
        Volume_Redis[(redis_data)]
    end
    
    %% Connections
    Internet((Public Internet)) -->|HTTP Webhooks| Nginx
    Nginx -->|Proxy Pass| API
    
    API -->|Read/Write| Postgres
    Worker -->|Read/Write| Postgres
    
    API -->|LPUSH Queue| Redis
    Worker -->|BRPOP Queue| Redis
    
    Postgres --> Volume_PG
    Redis --> Volume_Redis
```

## Containers

1. **`nginx`** (Image: `nginx:stable-alpine`)
   - Exposes port 80 to the host.
   - Maps `./nginx/default.conf` as a volume to reverse proxy traffic into `watcher-api:3001`.

2. **`postgres`** (Image: `postgres:15-alpine`)
   - Database name: `watcher`. Contains user and project state.
   - Persists data to the local Docker volume `postgres_data`.

3. **`redis`** (Image: `redis:7-alpine`)
   - Handles BullMQ message queues.
   - Persists data to local Docker volume `redis_data`.

4. **`api`** (Dockerfile: `./server/Dockerfile`)
   - The Express application. Exposes internal port `3001`.
   - Depends on healthy Postgres and Redis containers.

5. **`worker`** (Dockerfile: `./server/worker/Dockerfile`)
   - The BullMQ processor loop.
   - Operates fully behind the firewall. Does not expose any open ports.

## Architecture Resilience
- **Restart Policy**: All containers are configured with `restart: unless-stopped`. If the Node application crashes due to an uncaught exception (e.g. OOM), Docker daemon automatically restarts it.
- **Healthchecks**: The `api` and `worker` containers will not boot until `pg_isready` returns success on Postgres and `redis-cli ping` returns success on Redis, preventing cascading startup crashes.
