---
title: "Memory System Design"
status: incoming
source_note: "orgs/riatzukiza/promethean/docs/notes/promethean/memory-system-v2-spec.md"
extracted_at: "2026-02-12T03:01:25Z"
---

# Memory System Design

## Context
- Source note: `orgs/riatzukiza/promethean/docs/notes/promethean/memory-system-v2-spec.md`
- Category: `promethean`

## Draft Requirements
- **Keep plaintext files** (they’re audit‑able, diff‑able, portable) **but** introduce a **write‑ahead log (WAL)** and a **two‑tier index**:
- **Portable canonical log** → append‑only newline‑delimited JSON (NDJSON) files, chunked by date.
- **Device‑local fast index** → SQLite (FTS5 + vector extension) or Lance/FAISS shards built from the log.
- Ship a **tiny JSON “manifest”** + rolling **Bloom filter** (or Roaring bitmap) to know which segments to hydrate on a new machine.
- **Retrieval = fusion** of **dense** (embeddings) + **sparse** (keyword/TF-IDF/FTS) + **graph** (associative edges). Rank with a compact, explicit scoring function (below).
- **Consolidation** = background clustering of stale items → summarized “semantic memories” (with pointers back to originals). Hot→warm→cold tiers; nothing is lost, only made harder to retrieve.
- **Context compilation** = small iterative loop over the memory graph (beam search); prune near‑duplicates; promote strongly connected nodes; serialize final graph snapshot into Markdown.
- **Index once, update forever**: use file watchers already common in your workflow (mirrors the lsp watcher constraints you set in Emacs) to keep the index fresh.
- **Plug into Promethean** primitives you’ve already sketched:
- *Event capture* → route opencode events through your **EventCapturePlugin** as the ingress into memory.
- *Structures/Agents* → align with **Cephalon / Eidolon** as “organs,” and reuse your vector index notion (e.g., `repo-embeddings`).
- *Data intake* → your `data/` pattern for audio→transcripts is an ingestion precedent you can reuse for other streams.

## Summary Snippets
- Below is a tight pass that **questions**, **refines**, **simplifies**, and **extends** your memory system. I’ve annotated concrete tie‑ins to your Promethean repo where it helps (citations inline). I also give drop‑in schemas, algorithms, and a short activation plan.
- ---

## Open Questions
- What should be implemented first from this note?
- Which parts are exploratory versus actionable?
