---
$$
uuid: 9fd881b6-cd3b-446d-820c-09a590f68f36
$$
$$
created_at: 2025.09.01.16.36.15.md
$$
filename: chroma-distance-metric-fix
$$
description: >-
$$
  Corrected Chroma's distance metric from L2 to cosine similarity to resolve
  reference collapse issues. The fix ensures proper score conversion and
  collection configuration for accurate document retrieval.
tags:
  - chroma
  - distance
  - cosine
  - similarity
  - embedding
  - query
  - collection
$$
related_to_uuid: []
$$
$$
related_to_title: []
$$
references: []
---

codex
You’re right: the issue is Chroma’s distance metric. Your original in‑memory script used
cosine similarity; our Chroma collection was created without specifying the space, so it
likely defaulted to L2. With L2, distances are >1 and our “1 - d” conversion collapses to
~0, so refs never clear even tiny thresholds.

What I changed

- 02-embed.ts: Create the collection with cosine space.
    - metadata: { "hnsw:space": "cosine", embed_model: … }
- 03-query.ts:
    - Same cosine collection metadata.
    - Robust score conversion: use 1 - d when 0..1, else 1/$1+d$ for L2.
- 04-relations.ts: Already fixed to scope to docs dir and to threshold/merge/dedupe refs.
- packages/docops/package.json:
    - Use a new collection name and force refreshed hits:
    - doc:02-embed → adds `--collection docs-cosine`
    - doc:03-query → adds `--collection docs-cosine --force true`

Why the new collection

- getOrCreateCollection doesn’t change an existing collection’s space. Using a new name
avoids inheriting the old L2 config.

What to run (will modify files)

- pnpm -C packages/docops doc:02-embed
- pnpm -C packages/docops doc:03-query
- pnpm -C packages/docops doc:04-relate --docs-dir docs/unique --doc-threshold 0.10
$$
--ref-threshold 0.10
$$
- pnpm -C packages/docops doc:05-footers

If you want, I can run those now.

Plan

- Rebuild embeddings in docs-cosine collection $02-embed$.
- Recompute query hits with forced refresh $03-query$.
- Reapply relations with low thresholds $04-relate$.
- Regenerate footers $05-footers$.

Next

- If refs still look sparse, I can dump hit stats from Level $.cache/docops.level/q$ to
confirm scores and coverage.

✓ Applied patch
  └ Success. Updated the following files:
$$
    M packages/docops/package.json
$$
▌ Explain this codebase                                                                     
 ⏎ send   Ctrl+J newline   Ctrl+C quit   1552624 tokens used   70% context left<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- _None_
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
