# Production Vector Search Deployment Runbook

## Overview

This document covers deploying openplanner with native MongoDB `$vectorSearch` support using the Atlas Local container image.

## Architecture Options

### Option 1: AtlasCLI Local Deployment (Recommended for self-hosted)

Replace Community Search containers with `mongodb/mongodb-atlas-local`:

- Full `createSearchIndexes` and `$listSearchIndexes` support
- Native `$vectorSearch` with real index backing
- Single container (no separate mongot orchestration)
- No Atlas cloud account required

### Option 2: Atlas Cloud (Recommended for managed)

Use MongoDB Atlas cloud for vector search:

- Fully managed search infrastructure
- Automatic index management
- Production-grade SLA
- Requires Atlas account and network connectivity

## AtlasCLI Local Deployment

### Step 1: Start the Atlas Local stack

```bash
cd services/openplanner

# Start with Atlas Local profile (replaces Community containers)
docker compose -f docker-compose.yml -f docker-compose.atlas.yml up -d
```

This starts `atlas-mongodb` instead of the `mongodb` + `mongot` pair, and runs `atlas-init` to create the app user and vector search indexes.

### Step 2: Migrate existing data

If you have data in the Community MongoDB volume, migrate it:

```bash
# 1. Dump from Community volume
docker compose exec mongodb mongodump \
  -u openplannerRoot -p <root-password> \
  --authenticationDatabase admin \
  -d openplanner \
  --out /tmp/dump

# 2. Copy dump out of container
docker compose cp mongodb:/tmp/dump ./atlas-migration-dump

# 3. Switch to Atlas profile
docker compose -f docker-compose.yml down
docker compose -f docker-compose.yml -f docker-compose.atlas.yml up -d

# 4. Wait for atlas-mongodb to be healthy
docker compose -f docker-compose.yml -f docker-compose.atlas.yml exec atlas-mongodb \
  mongosh --eval 'db.adminCommand("ping")' \
  -u openplannerRoot -p <root-password> --authenticationDatabase admin

# 5. Restore into Atlas Local
docker compose -f docker-compose.yml -f docker-compose.atlas.yml cp \
  ./atlas-migration-dump atlas-mongodb:/tmp/dump

docker compose -f docker-compose.yml -f docker-compose.atlas.yml exec atlas-mongodb \
  mongorestore \
  -u openplannerRoot -p <root-password> \
  --authenticationDatabase admin \
  --drop \
  /tmp/dump/openplanner

# 6. Clean up
rm -rf ./atlas-migration-dump
```

### Step 3: Create vector search indexes

If `atlas-init` already ran successfully, the indexes are being built. To verify or re-run:

```bash
# Check index status
docker compose -f docker-compose.yml -f docker-compose.atlas.yml exec atlas-mongodb \
  mongosh -u openplannerRoot -p <root-password> \
  --authenticationDatabase admin --quiet \
  --eval 'db.getSiblingDB("openplanner").runCommand({listSearchIndexes: "graph_node_embeddings"})'

# Or run the standalone script
MONGODB_URI="mongodb://openplannerRoot:<password>@localhost:27017/openplanner?authSource=admin" \
  npx tsx scripts/create-vector-index.ts
```

### Step 4: Verify vector search

```bash
# Test $vectorSearch with a sample embedding
docker compose -f docker-compose.yml -f docker-compose.atlas.yml exec atlas-mongodb \
  mongosh -u openplannerRoot -p <root-password> \
  --authenticationDatabase admin --quiet \
  --eval '
    const sample = db.getSiblingDB("openplanner").graph_node_embeddings.findOne({embedding: {$exists: true}});
    if (sample) {
      const result = db.getSiblingDB("openplanner").graph_node_embeddings.aggregate([{
        $vectorSearch: {
          index: "embedding_vector",
          path: "embedding",
          queryVector: sample.embedding,
          numCandidates: 10,
          limit: 5
        }
      }]);
      printjson(result.toArray());
    } else {
      print("No embeddings found to test");
    }
  '
```

## Volume Management

| Profile | MongoDB Data Volume | Notes |
|---------|-------------------|-------|
| Community (default) | `openplanner_openplanner-mongodb-data` | `/data/db` in community container |
| Atlas Local | `openplanner-atlas-data` | `/data/db` in atlas-local container |

The volumes are **separate** — switching profiles does not destroy the other volume. You can switch back and forth:

```bash
# Back to Community
docker compose -f docker-compose.yml --profile community up -d

# To Atlas Local
docker compose -f docker-compose.yml -f docker-compose.atlas.yml up -d
```

## Monitoring

### Health Checks

Both profiles expose MongoDB on port 27017 with the same health check:
```bash
curl -fsS http://localhost:27017  # TCP check
# Or via mongosh:
mongosh --eval 'db.adminCommand("ping")'
```

### Index Build Status

Atlas vector search indexes build asynchronously. Check status:
```bash
mongosh -u openplannerRoot -p <password> --authenticationDatabase admin --quiet \
  --eval 'db.getSiblingDB("openplanner").runCommand({listSearchIndexes: "graph_node_embeddings"})'
```

Status values: `INITIALIZING` → `BUILDING` → `READY`

### Search Index Sizes

```bash
mongosh --eval 'db.getSiblingDB("openplanner").graph_node_embeddings.stats().size'
```

## Rollback

To roll back from Atlas Local to Community Search:

```bash
docker compose -f docker-compose.yml -f docker-compose.atlas.yml down
docker compose -f docker-compose.yml --profile community up -d
```

The Community volume is preserved and can pick up where it left off. Note that vector search indexes created in Atlas Local will not exist in the Community stack.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGODB_ROOT_USERNAME` | `openplannerRoot` | MongoDB root user |
| `MONGODB_ROOT_PASSWORD` | `<from env>` | MongoDB root password |
| `MONGODB_DB` | `openplanner` | Application database name |
| `OPENPLANNER_MONGO_APP_USERNAME` | `openplanner` | Application MongoDB user |
| `OPENPLANNER_MONGO_APP_PASSWORD` | `<from env>` | Application user password |
| `EMBEDDING_DIMENSIONS` | `1024` | Vector embedding dimensions |
| `OPENPLANNER_MONGODB_PORT` | `27017` | Host port for MongoDB |
