# Knowledge Ops Platform — Architecture Overview

## The Five Layers

```
Layer 1: Public Assistant (chat widget, customer-facing)
    ↓
Layer 2: Agent-Aware CMS (knowledge curation, public/internal boundary)
    ↓
Layer 3: Knowledge Worker (employee-facing, full internal corpus)
    ↓
Layer 4: Coding Agent (dev teams only, optional)
    ↓
Layer 5: SME Review (powered by Shibboleth, translation/labeling)
```

## The Data Lake (OpenPlanner)

Three embedding tiers:

| Tier | Model | Purpose |
|------|-------|---------|
| Hot | nomic-embed-text or qwen3-embedding:0.6b | Raw events, fast ingest, instant recall |
| Warm | qwen3-embedding:4b | Document chunks, CMS content |
| Compact | qwen3-embedding:8b | Semantic packs, compacted knowledge |

Storage: MongoDB 8.2 Community Edition with `$vectorSearch` and `$search`.
No ChromaDB. No Qdrant. No DuckDB. One database for everything.

## Key Repos

| Repo | Role |
|------|------|
| `services/openplanner/` | Data lake, search, compaction |
| `orgs/octave-commons/shibboleth/` | Labeling DSL, HITL UI |
| `orgs/mojomast/ragussy/` | LLM inference (being replaced by proxx for inference) |
| `packages/futuresight-kms/` | New platform package: schemas, bridge clients, labeler UI |
| `packages/chat-ui/` | Shared chat component library (to be built) |

## Specs

All specs in `specs/drafts/knowledge-ops-*.md`. See `specs/drafts/` for the full set.

## Current State

- Architecture: 95% complete
- Implementation detail: 70% complete
- Can start building: 60%

The remaining 40% is implementation detail that emerges during coding. No architectural unknowns remain.

## Build Order

1. Documents table + CMS router (CMS data model spec)
2. Widget proxy router (integration spec)
3. Seed script (demo seed spec)
4. Nginx + Compose changes (deployment spec)
5. ChatWidget.tsx (chat-ui library spec — can be parallelized)
6. MongoDB vector unification for OpenPlanner (the-lake spec)
