# Vector Search: Local Development Limitations

## Current State (Community Search)

The local development stack uses:
- `mongodb/mongodb-community-server:8.2.0` — the MongoDB daemon
- `mongodb/mongodb-community-search:0.55.0` — the mongot search engine

These communicate via gRPC (`useGrpcForSearch: true` in `config/mongod.conf`).

### What Works
- `$search` (Atlas Search) pipeline stage — **limited** without index management
- Full-text search on indexed fields
- gRPC transport between mongod and mongot

### What Does NOT Work
- **`createSearchIndexes`** — fails with: *"Using Atlas Search Database Commands... requires additional configuration. Please connect to Atlas or an AtlasCLI local deployment to enable."*
- **`$listSearchIndexes`** — same AtlasCLI gating error
- **`$vectorSearch`** — executes but returns **empty hits** because no vector index can be created
- **Any index management commands** — all gated behind AtlasCLI control plane

### Why

The Community Search Docker image includes mongot but lacks the AtlasCLI local deployment bootstrap that enables the control plane wiring for search index management commands. This is by design — MongoDB reserves these commands for Atlas and AtlasCLI local deployments.

## Workaround: vexx/JS Cosine Scan

When running the Community stack, the openplanner application falls back to vexx (NPU/GPU-accelerated cosine similarity) or a pure-JS cosine scan for vector similarity search. This is functional but:

1. Not as performant as native `$vectorSearch` at scale
2. Requires NPU/GPU hardware for acceptable speed
3. Does not match production search behavior

## Production Path

For production deployments where native `$vectorSearch` is needed, use the **Atlas Local** profile:

```bash
docker compose -f docker-compose.yml -f docker-compose.atlas.yml up -d
```

See [production-vector-search.md](./production-vector-search.md) for the full deployment runbook.
