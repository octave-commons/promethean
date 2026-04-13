# OpenPlanner Docker Stack

**Single compose file. Atlas Local only. No overlays. No variants.**

## Quick Reference

| What | Value |
|------|-------|
| Compose file | `docker-compose.yml` (THIS IS THE ONLY ONE) |
| MongoDB image | `mongodb/mongodb-atlas-local:latest` |
| Atlas Search | Bundled inside mongodb-atlas-local (no separate mongot container) |
| Vector indexes | Created by `scripts/atlas-init.sh` on first boot |
| Init service | `mongo-init` (runs once, `restart: "no"`) |

## Architecture

```
docker-compose.yml
├── secrets-init        stub (no-op, kept for dependency compat)
├── mongodb             mongodb-atlas-local (includes mongot internally)
├── mongot              stub (no-op, kept for dependency compat)
├── mongo-init          runs atlas-init.sh once, creates user + collections + indexes
├── openplanner         main application (depends on mongodb healthy + mongo-init complete)
├── openplanner-proxx   PostgreSQL proxy for Knoxx
├── knoxx-*             Knoxx agent backend, frontend, nginx, postgres, redis
├── graph-weaver        graph processing service
├── myrmex              crawler service (profile: graph)
├── eros-eris-field-app field app
├── kms-ingestion       knowledge management ingestion
├── shibboleth-*        auth services
└── shuvcrawl           web crawler
```

## Why mongodb-atlas-local (and NOT mongodb-community-server)

The OpenPlanner stack requires **Atlas Search** (vector search via `$vectorSearch`) for:

1. **Semantic graph traversal** — `POST /v1/graph/memory` uses vector similarity to seed graph traversal. Without Atlas Search indexes, this returns 0 vector hits.
2. **Document chunk search** — `POST /v1/ingestion/search` retrieves relevant document chunks by embedding similarity.

`mongodb-community-server` does NOT include Atlas Search. To get it with the community edition, you would need a separate `mongot` container, separate keyfile management, replica set initialization, and manual index creation via the mongot admin API. This is fragile and was the source of multiple production failures.

`mongodb-atlas-local` bundles MongoDB + mongot in a single container with:
- Automatic keyfile generation
- Automatic replica set initialization
- Built-in Atlas Search (mongot) on localhost:27027
- Standard `createSearchIndexes` mongosh commands just work

## Vector Search Indexes

Created by `scripts/atlas-init.sh` on every fresh boot:

| Collection | Index name | Dimensions | Similarity | Filters |
|-----------|-----------|------------|------------|---------|
| `graph_node_embeddings` | `embedding_vector` | 1024 | cosine | `project`, `embedding_model` |
| `event_chunks` | `chunk_vector` | 1024 | cosine | `project`, `source` |

These indexes are **required** for the application to function. Without them, semantic queries silently return empty results.

## MONGODB_URI Format

Atlas Local uses a simple auth format (no replicaSet parameter):

```
mongodb://${OPENPLANNER_MONGO_APP_USERNAME:-openplanner}:${OPENPLANNER_MONGO_APP_PASSWORD:-change-me-openplanner-password}@mongodb:27017/${MONGODB_DB:-openplanner}?authSource=${MONGODB_DB:-openplanner}
```

**Do NOT use `replicaSet=rs0`** — Atlas Local manages its own replica set internally.

## Environment Variables

All variables have sensible defaults. Override in `.env` or host environment.

| Variable | Default | Purpose |
|----------|---------|---------|
| `MONGODB_ROOT_USERNAME` | `openplannerRoot` | MongoDB root user |
| `MONGODB_ROOT_PASSWORD` | `change-me-root-password` | MongoDB root password |
| `MONGODB_DB` | `openplanner` | Application database name |
| `OPENPLANNER_MONGO_APP_USERNAME` | `openplanner` | Application readWrite user |
| `OPENPLANNER_MONGO_APP_PASSWORD` | `change-me-openplanner-password` | Application user password |
| `EMBEDDING_DIMENSIONS` | `1024` | Vector embedding dimensions for search indexes |
| `OPENPLANNER_PORT` | `7777` | Main app port |
| `OPENPLANNER_MONGODB_PORT` | `27017` | MongoDB exposed port |
| `OPENPLANNER_API_KEY` | `change-me` | API key for HTTP access |

## Common Operations

### Fresh start (wipes all data)
```bash
docker compose down -v   # -v removes volumes
docker compose up -d
# Wait for mongo-init to complete, then verify:
docker logs openplanner-mongo-init-1
```

### Restart without losing data
```bash
docker compose restart
```

### Verify vector indexes exist
```bash
docker exec openplanner-mongodb-1 mongosh \
  'mongodb://openplannerRoot:${MONGODB_ROOT_PASSWORD}@localhost:27017/openplanner?authSource=admin' \
  --quiet --eval 'db.runCommand({ listSearchIndexes: "graph_node_embeddings" })'
```

### Re-run init script (e.g., after adding new collections)
```bash
docker compose up -d mongo-init --force-recreate
```

## Historical Context (DO NOT REVERT)

This stack previously used two compose files:
- `docker-compose.yml` — community server with separate mongot
- `docker-compose.atlas.yml` — atlas local override

This caused repeated failures where the stack was brought up WITHOUT atlas support (vector search indexes missing, graph queries returning empty). The files were merged into a single `docker-compose.yml` in April 2026.

**There is no longer a `docker-compose.atlas.yml`.** If you see one, it is stale and should be deleted.

The following files were also removed as they are specific to the community-server setup:
- `config/mongod.conf` — community server config (replica set, mongot host, keyfile path)
- `config/mongot.yml` — separate mongot container config (gRPC, TLS, storage)

Atlas Local manages all of this internally.
