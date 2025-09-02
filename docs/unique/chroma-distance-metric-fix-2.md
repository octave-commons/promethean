---
uuid: b9540809-7346-41ac-9980-b25ed268616c
created_at: 2025.09.01.18.14.32.md
filename: chroma-distance-metric-fix
description: >-
  Fixed Chroma's distance metric issue by switching from L2 to cosine space,
  ensuring proper score conversion and collection refresh. The patch updates
  embedding and query processes to use cosine similarity, avoiding threshold
  collapse and improving reference resolution.
tags:
  - chroma
  - distance
  - cosine
  - metric
  - embedding
  - query
  - threshold
  - fix
related_to_uuid: []
related_to_title: []
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
    - Robust score conversion: use 1 - d when 0..1, else 1/(1+d) for L2.
- 04-relations.ts: Already fixed to scope to docs dir and to threshold/merge/dedupe refs.
- packages/docops/package.json:
    - Use a new collection name and force refreshed hits:
    - doc:02-embed → adds `--collection docs-cosine`
    - doc:03-query → adds `--collection docs-cosine --force true`

Why the new collection

- getOrCreateCollection doesn’t change an existing collection’s space. Using a new name
avoids inheriting the old L2 config.

What to run (will modify files)

 pnpm -C packages/docops doc:02-embed
 pnpm -C packages/docops doc:03-query
 pnpm -C packages/docops doc:04-relate --docs-dir docs/unique --doc-threshold 0.10 --ref-threshold 0.10
 pnpm -C packages/docops doc:05-footers

If you want, I can run those now.

Plan

- Rebuild embeddings in docs-cosine collection (02-embed).
- Recompute query hits with forced refresh (03-query).
- Reapply relations with low thresholds (04-relate).
- Regenerate footers (05-footers).

Next

- If refs still look sparse, I can dump hit stats from Level (.cache/docops.level/q) to
confirm scores and coverage.

✓ Applied patch
  └ Success. Updated the following files:
    M packages/docops/package.json

▌ Explain this codebase                                                                     
 ⏎ send   Ctrl+J newline   Ctrl+C quit   1552624 tokens used   70% context left              

It seemed to work this time

[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:149 hits 16 top [ '0.757', '0.708', '0.695' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:150 hits 16 top [ '0.731', '0.724', '0.689' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:151 hits 16 top [ '0.875', '0.875', '0.865' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:152 hits 16 top [ '0.875', '0.875', '0.865' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:153 hits 16 top [ '0.821', '0.821', '0.812' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:154 hits 16 top [ '0.821', '0.821', '0.812' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:155 hits 16 top [ '0.822', '0.804', '0.735' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:156 hits 16 top [ '0.785', '0.722', '0.722' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:157 hits 16 top [ '0.785', '0.722', '0.722' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:158 hits 16 top [ '0.692', '0.692', '0.680' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:159 hits 16 top [ '0.692', '0.692', '0.680' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:160 hits 16 top [ '0.781', '0.781', '0.737' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:161 hits 16 top [ '0.781', '0.781', '0.737' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:162 hits 16 top [ '0.639', '0.627', '0.627' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:163 hits 16 top [ '0.639', '0.627', '0.627' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:164 hits 16 top [ '0.651', '0.630', '0.624' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:165 hits 16 top [ '0.651', '0.630', '0.624' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:166 hits 16 top [ '0.647', '0.647', '0.646' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:167 hits 16 top [ '0.647', '0.647', '0.646' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:168 hits 16 top [ '0.731', '0.731', '0.724' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:169 hits 16 top [ '0.731', '0.731', '0.724' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:170 hits 16 top [ '0.678', '0.678', '0.657' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:171 hits 16 top [ '0.678', '0.678', '0.657' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:172 hits 16 top [ '0.709', '0.673', '0.668' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:173 hits 16 top [ '0.709', '0.673', '0.668' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:174 hits 16 top [ '0.600', '0.600', '0.592' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:175 hits 16 top [ '0.600', '0.600', '0.592' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:176 hits 16 top [ '0.661', '0.655', '0.652' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:177 hits 16 top [ '0.661', '0.655', '0.652' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:178 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:179 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:180 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:181 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:182 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:183 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:184 hits 16 top [ '0.624', '0.624', '0.624' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:185 hits 16 top [ '0.624', '0.624', '0.624' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:186 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:187 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:188 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:189 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:190 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:191 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:192 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:193 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:194 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:195 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:196 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:197 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:198 hits 16 top [ '1.000', '1.000', '0.709' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:199 hits 16 top [ '1.000', '1.000', '0.709' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:200 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:201 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:202 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:203 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:204 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:205 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:206 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:207 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:208 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:209 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:210 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:211 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:212 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:213 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:214 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:215 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:216 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:217 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:218 hits 16 top [ '1.000', '1.000', '0.494' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:219 hits 16 top [ '1.000', '1.000', '0.494' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:220 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:221 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:222 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:223 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:224 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:225 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:226 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:227 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:228 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:229 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:230 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:231 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:232 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:233 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:234 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:235 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:236 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:237 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:238 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:239 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:240 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:241 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:242 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:243 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:244 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:245 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:246 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:247 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:248 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:249 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:250 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:251 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:252 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:253 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:254 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:255 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:256 hits 16 top [ '0.628', '0.628', '0.628' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:257 hits 16 top [ '0.628', '0.628', '0.628' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:258 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:259 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:260 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:261 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:262 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:263 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:264 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:265 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:266 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:267 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:268 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:269 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:270 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:271 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:272 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:273 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:274 hits 16 top [ '0.480', '0.480', '0.480' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:275 hits 16 top [ '0.480', '0.480', '0.480' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:276 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:277 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:278 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:279 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:280 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:281 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:282 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:283 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:284 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:285 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:286 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:287 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:288 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:289 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:290 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:291 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:292 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:293 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:294 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:295 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:296 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:297 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:298 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:299 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:300 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:301 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:302 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:303 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:304 hits 16 top [ '1.000', '1.000', '0.737' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:305 hits 16 top [ '1.000', '1.000', '0.737' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:306 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q fe7193a2-a5f7-4b3c-bea0-bd028815fc2c:307 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:0 hits 16 top [ '0.881', '0.881', '0.881' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:1 hits 16 top [ '0.724', '0.724', '0.724' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:2 hits 16 top [ '0.666', '0.666', '0.665' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:3 hits 16 top [ '0.698', '0.698', '0.698' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:4 hits 16 top [ '0.674', '0.674', '0.661' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:5 hits 16 top [ '0.716', '0.716', '0.716' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:6 hits 16 top [ '0.811', '0.756', '0.756' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:7 hits 16 top [ '0.713', '0.713', '0.709' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:8 hits 16 top [ '0.713', '0.713', '0.709' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:9 hits 16 top [ '0.689', '0.681', '0.681' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:10 hits 16 top [ '0.689', '0.681', '0.681' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:11 hits 16 top [ '0.707', '0.707', '0.699' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:12 hits 16 top [ '0.707', '0.707', '0.699' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:13 hits 16 top [ '0.693', '0.673', '0.673' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:14 hits 16 top [ '0.687', '0.677', '0.666' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:15 hits 16 top [ '0.601', '0.601', '0.590' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:16 hits 16 top [ '0.671', '0.671', '0.656' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:17 hits 16 top [ '0.706', '0.706', '0.706' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:18 hits 16 top [ '0.728', '0.728', '0.720' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:19 hits 16 top [ '0.712', '0.712', '0.661' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:20 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:21 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:22 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:23 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:24 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:25 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:26 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:27 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:28 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:29 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:30 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:31 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:32 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:33 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:34 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:35 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:36 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:37 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:38 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:39 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:40 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:41 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:42 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:43 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:44 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:45 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:46 hits 16 top [ '0.628', '0.628', '0.628' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:47 hits 16 top [ '0.628', '0.628', '0.628' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:48 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:49 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:50 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:51 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:52 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:53 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:54 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:55 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:56 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:57 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:58 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:59 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:60 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:61 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:62 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:63 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:64 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:65 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:66 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:67 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:68 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:69 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:70 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:71 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:72 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:73 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:74 hits 16 top [ '0.480', '0.480', '0.480' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:75 hits 16 top [ '0.480', '0.480', '0.480' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:76 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:77 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:78 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:79 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:80 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:81 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:82 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:83 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:84 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:85 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:86 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:87 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:88 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] q ffb9b2a9-744d-4a53-9565-130fceae0832:89 hits 16 top [ '1.000', '1.000', '1.000' ]
[03-query] summary {
[04-relations] refsForDoc d771154e-a7ef-44ca-b69c-a1626cf94fbf chunks 144 refs 675
[04-relations] refsForDoc db74343f-8f84-43a3-adb2-499c6f00be1c chunks 69 refs 362
[04-relations] refsForDoc dd00677a-2280-45a7-91af-0728b21af3ad chunks 96 refs 437
[04-relations] refsForDoc d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06 chunks 147 refs 666
[04-relations] refsForDoc dd89372d-10de-42a9-8c96-6bc13ea36d02 chunks 86 refs 402
[04-relations] refsForDoc e018dd7a-1fb7-4732-9e67-cd8b2f0831cf chunks 130 refs 563
[04-relations] refsForDoc e2135d9f-c69d-47ee-9b17-0b05e98dc748 chunks 15 refs 80
[04-relations] refsForDoc e1056831-ae0c-460b-95fa-4cf09b3398c6 chunks 107 refs 533
[04-relations] refsForDoc e811123d-5841-4e52-bf8c-978f26db4230 chunks 168 refs 780
[04-relations] refsForDoc e87bc036-1570-419e-a558-f45b9c0db698 chunks 80 refs 348
[04-relations] refsForDoc e90b5a16-d58f-424d-bd36-70e9bd2861ad chunks 123 refs 542
[04-relations] refsForDoc e979c50f-69bb-48b0-8417-e1ee1b31c0c0 chunks 21 refs 112
[04-relations] refsForDoc ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2 chunks 20 refs 99
[04-relations] refsForDoc f1add613-656e-4bec-b52b-193fd78c4642 chunks 22 refs 106
[04-relations] refsForDoc e9b27b06-f608-4734-ae6c-f03a8b1fcf5f chunks 83 refs 398
[04-relations] refsForDoc f5579967-762d-4cfd-851e-4f71b4cb77a1 chunks 146 refs 686
[04-relations] refsForDoc f8877e5e-1e4f-4478-93cd-a0bf86d26a41 chunks 176 refs 724
[04-relations] refsForDoc f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e chunks 319 refs 1197
[04-relations] refsForDoc fc21f824-4244-4030-a48e-c4170160ea1d chunks 164 refs 667
[04-relations] refsForDoc ffb9b2a9-744d-4a53-9565-130fceae0832 chunks 90 refs 414
[04-relations] refsForDoc fe7193a2-a5f7-4b3c-bea0-bd028815fc2c chunks 308 refs 1162
[04-relations] refsForDoc f2d83a77-7f86-4c56-8538-1350167a0c6c chunks 146 refs 635<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- _None_
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
