---
title: "0) Embedding benchmark design (what we’re measuring)"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/prototypal-system.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# 0) Embedding benchmark design (what we’re measuring)

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/prototypal-system.md`
- Category: `promethean`

## Draft Requirements
- **suite-driven** like your other benches
- **decoy-heavy** (because that’s where embedding models lie)
- **cacheable + replayable** (vectors saved so crashes don’t cost hours)
- **Ollama-first** (uses `POST /api/embed` with `input` as string or string[]) ([Ollama Documentation][1])
- **authoring feels natural** (rank/pair/dedup/cluster forms)
- **`pair`**: similarity sanity (same/related/unrelated/contrast)
- **`rank`**: retrieval ranking (MRR / Recall@K)
- **`dedup`**: near-duplicate detection (threshold behavior)
- **`cluster`**: topic coherence (within-topic > cross-topic)
- “can my RAG pull the right chunk?”
- “will it confuse *disable* vs *enable*?”
- “does it collapse code + prose into the same space?”

## Summary Snippets
- Absolutely — embeddings are *the other half* of your whole “agent brain” stack.
- Below is a **complete embedding benchmark + DSL setup** that’s:

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
