# Dual-tier semantic memory for OpenPlanner

## Goal

Improve retrieval quality for short Discord-style messages by separating:

1. a hot/raw vector store optimized for short messages and fast ingest
2. a compacted semantic store containing larger synthesized packs built from related raw memories

Queries should consult both stores.

## Why

Raw Discord messages are short and numerous. A single embedding model + single collection makes retrieval noisy as the corpus grows. The proposed approach keeps:

- hot collection: raw message-level recall
- compact collection: denser semantic recall over grouped related messages

## Scope

### Phase 1

- Add dual Chroma collection support to OpenPlanner.
- Keep raw event ingest writing to the hot collection.
- Add a semantic compaction job that builds compact packs from semantically related raw events.
- Add dual-tier vector search that queries both hot and compact collections and merges results.
- Expose compact collection and model state in health output.

### Phase 2

- Add hybrid client search in `packages/cephalon-ts` so memory lookup can combine FTS with vector hits.
- Optionally make compaction auto-triggered once thresholds are crossed.
- Optionally tune hot model to `nomic-embed-text:latest` and compact model to a larger Qwen embedding model.

## Constraints

- Preserve current event ingest behavior.
- Avoid destructive rewrites of the active hot collection.
- Prefer additive config and backward-compatible API response shapes.
- Keep vector search response compatible with existing clients.

## Verification

- Build OpenPlanner.
- Run OpenPlanner tests.
- Build/test `packages/cephalon-ts` search behavior.
- Smoke test compact job creation and dual-tier vector query shape.
