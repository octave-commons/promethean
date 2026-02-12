---
title: "Embedding Benchmark Spec"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/mcp-workspace-cli-generator.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# Embedding Benchmark Spec

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/mcp-workspace-cli-generator.md`
- Category: `promethean`

## Draft Requirements
- suite-driven
- crash-resumable (events.jsonl)
- reportable (tables + summaries)
- DSL that feels “native” (authoring is pleasant)
- reusable for real systems (RAG, search, clustering)
- 🔎 semantic search / retrieval (RAG, docs, code, chat logs)
- 🧩 clustering / grouping (dedup, topic bundles)
- 🧠 similarity judgments (ranking, rerank prefilter)
- ⚡ performance (latency, throughput, caching stability)
- 🧪 robustness (negation, lexical traps, near-miss decoys)
- No massive BEIR/MTEB full-corpus reproductions (yet)
- No “perfect human semantic truth” — we want practical signals

## Summary Snippets
- Alright — embedding benchmarks are *exactly* the next missing pillar.
- You want to evaluate **embedding models** the same way we’re evaluating **tool calling / vision / agents**:

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
