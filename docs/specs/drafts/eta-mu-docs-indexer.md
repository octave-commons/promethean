---
title: "Spec (draft): ημ docs indexer (lazy markdown parse + backlinks cache)"
status: draft
created_at: "2026-03-15"
tags: [knowledge, eta-mu, docs, indexer, lazy]
---

# ημ docs indexer (lazy markdown parse + backlinks cache)

## Intent
Provide a lightweight, Obsidian-compatible knowledge substrate for `docs/**/*.md` that is:

- incremental (mtime/content-hash gated)
- functional (derived caches are rebuildable)
- lazy (no embeddings by default)
- Fork Tales–named (ημ/Π/opencode runtime paths)

## Inputs
- Mounts config: `.opencode/runtime/eta_mu_mounts.v1.json`

## Outputs (cache; gitignored)
- Nodes/index: `.opencode/runtime/eta_mu_docs_index.v1.jsonl`
- Backlinks: `.opencode/runtime/eta_mu_docs_backlinks.v1.jsonl`

## Identity
- Prefer frontmatter `uuid:` when present → `entity_id = "doc:<uuid>"`.
- Otherwise:
  - reuse `entity_id` from previous index when `source_rel_path` matches
  - else reuse when `content_sha256` matches (move detection)
  - else mint: `entity_id = "doc:" + sha256(mount_id + ":" + source_rel_path)[0..20]`

## Extracted fields per doc
- title (first H1 if present else filename)
- headings (H2/H3...)
- tags
  - frontmatter `tags:`
  - inline `#tag`
  - `#hashtags:` convention
- links
  - wikilinks `[[target|alias]]`
  - markdown links `[text](url)` (local or external)

## Definition of Done
- `node scripts/eta_mu_docs_indexer.mjs` runs in repo root.
- Produces index + backlinks files under `.opencode/runtime/`.
- Re-running without file changes performs no heavy work (uses cached rows).
