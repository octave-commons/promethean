# OpenPlanner Docker Stack

**Single compose file. MongoDB Community Server. No overlays. No variants.**

## Quick Reference

| What | Value |
|------|-------|
| Compose file | `docker-compose.yml` (THIS IS THE ONLY ONE) |
| MongoDB image | `mongo:8.0` (Community Server) |
| Vector search | Handled by `openplanner-proxx` embedding service |
| Init service | `mongo-init` (runs once, `restart: "no"`) |

## Architecture

```
docker-compose.yml
├── mongodb             MongoDB Community Server 8.0 (standalone, no replica set)
├── mongo-init          runs mongo-init.sh once, creates user + collections + indexes
├── openplanner         main application (depends on mongodb healthy + mongo-init complete)
├── openplanner-proxx   Embedding service + vector search
├── knoxx-*             Knoxx agent backend, frontend, nginx, postgres, redis
├── graph-weaver        graph processing service
├── eros-eris-field-app force-directed graph simulation
├── kms-ingestion       knowledge management ingestion (Clojure)
└── shibboleth-*        auth services
```

## Why MongoDB Community Server (NOT Atlas Local)

Atlas Local generates replica set names from container IDs. When containers are recreated:
1. Old replica set config in persistent volume references old container ID
2. New container has different ID
3. MongoDB fails: "node is not in primary or recovering state"
4. **Data cannot persist across container recreations**

MongoDB Community Server in standalone mode (no replica set) allows:
- Data persistence across container recreations
- Simpler configuration
- Standard MongoDB 8.0 features

**Trade-off**: No native vector search in MongoDB. Vector search is handled by the `openplanner-proxx` embedding service.

## Startup Sequence

### Quick Start (Full Stack with Dev Frontend)

```bash
cd /home/err/devel/services/openplanner

# Start everything with dev profile (includes Vite dev server)
docker compose --profile dev up -d

# Wait for all services to become healthy (~2 minutes)
docker compose ps
```

### Core Stack Only

```bash
# Start MongoDB and OpenPlanner core
docker compose up -d mongodb
docker compose up -d openplanner

# Verify OpenPlanner is healthy
curl http://localhost:7777/v1/health
```

### Graph Stack (Force-Directed Simulation)

```bash
# Single worker
docker compose --profile graph up -d

# 20 shards (parallel processing)
docker compose --profile graph-20 up -d
```

## MONGODB_URI Format

Community Server uses simple auth format (no replicaSet parameter):

```
mongodb://${OPENPLANNER_MONGO_APP_USERNAME:-openplanner}:${OPENPLANNER_MONGO_APP_PASSWORD:-change-me-openplanner-password}@mongodb:27017/${MONGODB_DB:-openplanner}?authSource=${MONGODB_DB:-openplanner}
```

## Environment Variables

All variables have sensible defaults. Override in `.env` or host environment.

| Variable | Default | Purpose |
|----------|---------|---------|
| `MONGODB_ROOT_USERNAME` | `openplannerRoot` | MongoDB root user |
| `MONGODB_ROOT_PASSWORD` | `change-me-root-password` | MongoDB root password |
| `MONGODB_DB` | `openplanner` | Application database name |
| `OPENPLANNER_MONGO_APP_USERNAME` | `openplanner` | Application readWrite user |
| `OPENPLANNER_MONGO_APP_PASSWORD` | `change-me-openplanner-password` | Application user password |
| `OPENPLANNER_PORT` | `7777` | Main app port |
| `OPENPLANNER_API_KEY` | `change-me` | API key for HTTP access |

## Common Operations

### Fresh start (wipes all data)
```bash
docker compose down -v   # -v removes volumes
docker compose --profile dev up -d
# Wait for all services healthy, then verify:
docker compose ps
```

### Restart without losing data
```bash
docker compose restart
# Or to stop completely:
docker compose down
docker compose --profile dev up -d
```

### Verify MongoDB connection
```bash
docker exec openplanner-mongodb-1 mongosh \
  -u openplannerRoot -p 'change-me-root-password' \
  --authenticationDatabase admin --quiet \
  --eval 'db.getSiblingDB("openplanner").getCollectionNames()'
```

### Re-run init script (e.g., after adding new collections)
```bash
docker compose up -d mongo-init --force-recreate
```

## Service Ports

| Service | Internal Port | External Port |
|---------|---------------|---------------|
| MongoDB | 27017 | 27017 |
| OpenPlanner | 7777 | 7777 |
| Graph Weaver | 8796 | 8796 |
| Proxx | 8789 | 8790 |
| Knoxx Frontend (dev) | 5173 | 5173 |
| Knoxx Nginx | 80 | 80 |
| Shibboleth | 8088 | 8097 |

## Profiles

| Profile | Services | Use Case |
|---------|----------|----------|
| (none) | mongodb, openplanner, proxx, knoxx-backend, kms-ingestion | Core services |
| `dev` | + knoxx-frontend-dev (Vite) | Development with hot reload |
| `production` | + knoxx-frontend (built) | Production deployment |
| `graph` | + graph-weaver, eros-eris-field-app | Force-directed simulation |
| `graph-20` | + 20 simulation shards | Parallel processing |

## Troubleshooting

### MongoDB Authentication Failed

The `mongo-init` container creates the app user automatically. If it failed:

```bash
docker exec openplanner-mongodb-1 mongosh \
  -u openplannerRoot -p 'change-me-root-password' \
  --authenticationDatabase admin --quiet --eval '
db = db.getSiblingDB("openplanner");
db.createUser({
  user: "openplanner",
  pwd: process.env.OPENPLANNER_MONGO_APP_PASSWORD,  # pragma: allowlist secret
  roles: [{role: "readWrite", db: "openplanner"}]
});'
```

### Knoxx Frontend Keeps Restarting

Ensure you're using the `dev` profile:

```bash
docker compose --profile dev up -d
```

### Nginx Crash Loop

Nginx requires `knoxx-frontend-dev` to be healthy. If it's crashing:

```bash
docker compose logs knoxx-frontend-dev --tail 50
```

## Historical Context

### Why We Switched from Atlas Local (April 2026)

Atlas Local was causing persistent volume issues:
- Replica set names derived from container IDs
- Data loss on container recreation
- Manual intervention required after every restart

Community Server in standalone mode provides reliable volume persistence.

### Removed Files

The following files were removed as they are specific to Atlas Local:
- `docker-compose.atlas.yml` — atlas local overlay
- `config/mongod.conf` — community server replica set config
- `config/mongot.yml` — separate mongot container config
- `scripts/atlas-init.sh` — Atlas-specific init script
