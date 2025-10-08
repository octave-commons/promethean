# MongoDB ⇄ Chroma Migration Pipeline

Status: Planned  
```
Owner: Codex / Agent
```
Labels: #data #migrations #mongodb #chroma #etl #ci #observability #promethean

## Goals
- Deterministic, resumable backfill from Mongo → Chroma with checkpoints.
- CDC tailing via Mongo change streams to keep Chroma consistent.
- Dual-write option during transition, with clear cutover and rollback.
- Strong integrity checks (counts, checksums, embedding dimension, orphan detection).
- Runbooks for cutover and rollback.

## Components
- Shared lib `@shared/prom-lib`: checkpoints, embedder, chroma wrapper, integrity helpers.
- Jobs: `services/ts/migrations/backfill.ts`, `cdc.ts`, `cutover.ts`, `rollback.ts`.
- Reports: `docs/data/reports/*.json` and `*.md`.

## Env Vars
```
MONGO_URI=...
CHROMA_URL=...
CHROMA_COLLECTION_PREFIX=promethean_
EMBEDDING_MODEL=qwen2.5-embed:2025-08-01
EMBEDDING_DIM=1536
BATCH_SIZE=128
MAX_INFLIGHT=8
DUAL_WRITE_ENABLED=false
CDC_ENABLED=false
```

## Phases
1. Prepare → create collections, assert model+dim.
2. Backfill → mirror 100%, generate integrity report.
3. CDC → tail change streams, watch lag.
4. Dual-write → enable, soak, verify.
5. Cutover → brief freeze, final check, switch readers.
6. Decommission → disable CDC/dual-write, archive reports.

See runbooks in `docs/data/runbooks/` for step-by-step guidance.

