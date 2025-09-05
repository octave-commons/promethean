---
uuid: 6d2e924f-8f98-463f-8255-2d5bf7337fc1
created_at: chroma-distance-metric-fix.md
filename: Chroma Distance Metric Fix
title: Chroma Distance Metric Fix
description: >-
  Fixed Chroma's distance metric issue by switching from L2 to cosine space to
  ensure proper similarity scoring. The patch updates embedding and query
  processes to use cosine distance, with robust score conversion for both
  metrics. This resolves reference collapse at low thresholds.
tags:
  - chroma
  - distance
  - cosine
  - metric
  - similarity
  - embedding
  - query
  - threshold
---

codex ^ref-9fd881b6-2-0
You’re right: the issue is Chroma’s distance metric. Your original in‑memory script used
cosine similarity; our Chroma collection was created without specifying the space, so it
likely defaulted to L2. With L2, distances are >1 and our “1 - d” conversion collapses to
~0, so refs never clear even tiny thresholds.

What I changed

- 02-embed.ts: Create the collection with cosine space. ^ref-9fd881b6-10-0
    - metadata: { "hnsw:space": "cosine", embed_model: … } ^ref-9fd881b6-11-0
- 03-query.ts: ^ref-9fd881b6-12-0
    - Same cosine collection metadata.
    - Robust score conversion: use 1 - d when 0..1, else 1/(1+d) for L2.
- 04-relations.ts: Already fixed to scope to docs dir and to threshold/merge/dedupe refs. ^ref-9fd881b6-15-0
- packages/docops/package.json: ^ref-9fd881b6-16-0
    - Use a new collection name and force refreshed hits: ^ref-9fd881b6-17-0
    - doc:02-embed → adds `--collection docs-cosine`
    - doc:03-query → adds `--collection docs-cosine --force true`

Why the new collection

- getOrCreateCollection doesn’t change an existing collection’s space. Using a new name
avoids inheriting the old L2 config.

What to run (will modify files)

- pnpm -C packages/docops doc:02-embed
- pnpm -C packages/docops doc:03-query
- pnpm -C packages/docops doc:04-relate --docs-dir docs/unique --doc-threshold 0.10 ^ref-9fd881b6-30-0
--ref-threshold 0.10
- pnpm -C packages/docops doc:05-footers ^ref-9fd881b6-32-0

If you want, I can run those now. ^ref-9fd881b6-34-0

Plan

- Rebuild embeddings in docs-cosine collection (02-embed).
- Recompute query hits with forced refresh (03-query).
- Reapply relations with low thresholds (04-relate).
- Regenerate footers (05-footers).

Next

- If refs still look sparse, I can dump hit stats from Level (.cache/docops.level/q) to
confirm scores and coverage.

✓ Applied patch ^ref-9fd881b6-48-0
  └ Success. Updated the following files:
    M packages/docops/package.json

▌ Explain this codebase ^ref-9fd881b6-52-0
 ⏎ send   Ctrl+J newline   Ctrl+C quit   1552624 tokens used   70% context left
