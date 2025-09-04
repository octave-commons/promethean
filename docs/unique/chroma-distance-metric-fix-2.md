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
related_to_uuid:
  - 9fd881b6-cd3b-446d-820c-09a590f68f36
  - ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
  - 1c4046b5-742d-4004-aec6-b47251fef5d6
  - 8b8e6103-30a4-4d66-b5f2-87db1612b587
  - 23df6ddb-05cf-4639-8201-f8291f8a6026
  - e90b5a16-d58f-424d-bd36-70e9bd2861ad
  - bd4f0976-0d5b-47f6-a20a-0601d1842dc1
  - 9a93a756-6d33-45d1-aca9-51b74f2b33d2
  - 43bfe9dd-d433-42ca-9777-f4c40eaba791
  - 95205cd3-c3d5-4047-9c33-9c5ca2b49597
  - d614d983-7795-491f-9437-09f3a43f72cf
  - 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
  - b6ae7dfa-0c53-4eb9-aea8-65072b825bee
  - 15d25922-0de6-414f-b7d1-e50e2a57b33a
  - 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
  - 0b872af2-4197-46f3-b631-afb4e6135585
  - 03a5578f-d689-45db-95e9-11300e5eee6f
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - 8430617b-80a2-4cc9-8288-9a74cb57990b
  - 9413237f-2537-4bbf-8768-db6180970e36
  - c0392040-16a2-41e8-bd54-75110319e3c0
  - 7bed0b9a-8b22-4b1f-be81-054a179453cb
  - 36c8882a-badc-4e18-838d-2c54d7038141
  - bc5172ca-7a09-42ad-b418-8e42bb14d089
  - d2b3628c-6cad-4664-8551-94ef8280851d
  - 2c00ce45-08cf-4b81-9883-6157f30b7fae
  - cfee6d36-b9f5-4587-885a-cdfddb4f054e
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - ab748541-020e-4a7e-b07d-28173bd5bea2
  - 9044701b-03c9-4a30-92c4-46b1bd66c11e
  - d771154e-a7ef-44ca-b69c-a1626cf94fbf
  - cbfe3513-6a4a-4d2e-915d-ddfab583b2de
  - 871490c7-a050-429b-88b2-55dfeaa1f8d5
  - 61d4086b-4adf-4e94-95e4-95a249cd1b53
  - e1056831-ae0c-460b-95fa-4cf09b3398c6
  - aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
  - c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
  - 513dc4c7-e045-4123-ba2e-cf5ef0b7b4a3
related_to_title:
  - chroma-distance-metric-fix
  - ts-to-lisp-transpiler
  - Promethean Notes
  - Promethean Pipelines
  - Promethean State Format
  - Prometheus Observability Stack
  - Prompt_Folder_Bootstrap
  - Protocol_0_The_Contradiction_Engine
  - Provider-Agnostic Chat Panel Implementation
  - promethean-requirements
  - Promethean Workflow Optimization
  - Promethean_Eidolon_Synchronicity_Model
  - Ghostly Smoke Interference
  - run-step-api
  - Promethean Documentation Pipeline Overview
  - Promethean Documentation Update
  - Promethean Dev Workflow Update
  - Promethean Infrastructure Setup
  - ripple-propagation-demo
  - Promethean Documentation Overview
  - polymorphic-meta-programming-engine
  - shared-package-layout-clarification
  - Promethean Web UI Setup
  - Language-Agnostic Mirror System
  - Promethean Agent Config DSL
  - Lisp-Compiler-Integration
  - ecs-offload-workers
  - Promethean-native config design
  - file-watcher-auth-fix
  - Vectorial Exception Descent
  - Lispy Macros with syntax-rules
  - Local-First Intention→Code Loop with Free Models
  - sibilant-metacompiler-overview
  - RAG UI Panel with Qdrant and PostgREST
  - prom-lib-rate-limiters-and-replay-api
  - lisp-dsl-for-window-management
  - mystery-lisp-search-session
references:
  - uuid: b6ae7dfa-0c53-4eb9-aea8-65072b825bee
    line: 40
    col: 0
    score: 1
  - uuid: 9fd881b6-cd3b-446d-820c-09a590f68f36
    line: 10
    col: 0
    score: 0.92
  - uuid: 15d25922-0de6-414f-b7d1-e50e2a57b33a
    line: 804
    col: 0
    score: 0.95
  - uuid: 9fd881b6-cd3b-446d-820c-09a590f68f36
    line: 11
    col: 0
    score: 1
  - uuid: 9fd881b6-cd3b-446d-820c-09a590f68f36
    line: 12
    col: 0
    score: 1
  - uuid: 9fd881b6-cd3b-446d-820c-09a590f68f36
    line: 15
    col: 0
    score: 1
  - uuid: 9fd881b6-cd3b-446d-820c-09a590f68f36
    line: 16
    col: 0
    score: 1
  - uuid: 9fd881b6-cd3b-446d-820c-09a590f68f36
    line: 17
    col: 0
    score: 1
  - uuid: 9fd881b6-cd3b-446d-820c-09a590f68f36
    line: 30
    col: 0
    score: 0.91
  - uuid: 9fd881b6-cd3b-446d-820c-09a590f68f36
    line: 32
    col: 0
    score: 0.86
  - uuid: 9fd881b6-cd3b-446d-820c-09a590f68f36
    line: 34
    col: 0
    score: 1
  - uuid: 9fd881b6-cd3b-446d-820c-09a590f68f36
    line: 48
    col: 0
    score: 1
  - uuid: 15d25922-0de6-414f-b7d1-e50e2a57b33a
    line: 160
    col: 0
    score: 0.9
  - uuid: 15d25922-0de6-414f-b7d1-e50e2a57b33a
    line: 613
    col: 0
    score: 0.9
  - uuid: 15d25922-0de6-414f-b7d1-e50e2a57b33a
    line: 144
    col: 0
    score: 0.88
  - uuid: 15d25922-0de6-414f-b7d1-e50e2a57b33a
    line: 664
    col: 0
    score: 0.88
  - uuid: 15d25922-0de6-414f-b7d1-e50e2a57b33a
    line: 329
    col: 0
    score: 0.86
  - uuid: 15d25922-0de6-414f-b7d1-e50e2a57b33a
    line: 364
    col: 0
    score: 0.85
  - uuid: 9fd881b6-cd3b-446d-820c-09a590f68f36
    line: 52
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 3
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 5
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 27
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 94
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 31
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 132
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 27
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 534
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 209
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 144
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 273
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 60
    col: 0
    score: 1
  - uuid: 9413237f-2537-4bbf-8768-db6180970e36
    line: 86
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 243
    col: 0
    score: 1
  - uuid: c0392040-16a2-41e8-bd54-75110319e3c0
    line: 94
    col: 0
    score: 1
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 12
    col: 0
    score: 1
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 133
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 750
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 8
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 189
    col: 0
    score: 1
  - uuid: 15d25922-0de6-414f-b7d1-e50e2a57b33a
    line: 1038
    col: 0
    score: 1
---

codex ^ref-b9540809-2-0
You’re right: the issue is Chroma’s distance metric. Your original in‑memory script used
cosine similarity; our Chroma collection was created without specifying the space, so it
likely defaulted to L2. With L2, distances are >1 and our “1 - d” conversion collapses to
~0, so refs never clear even tiny thresholds.

What I changed

- 02-embed.ts: Create the collection with cosine space. ^ref-b9540809-10-0
    - metadata: { "hnsw:space": "cosine", embed_model: … } ^ref-b9540809-11-0
- 03-query.ts: ^ref-b9540809-12-0
    - Same cosine collection metadata.
    - Robust score conversion: use 1 - d when 0..1, else 1/(1+d) for L2.
- 04-relations.ts: Already fixed to scope to docs dir and to threshold/merge/dedupe refs. ^ref-b9540809-15-0
- packages/docops/package.json: ^ref-b9540809-16-0
    - Use a new collection name and force refreshed hits: ^ref-b9540809-17-0
    - doc:02-embed → adds `--collection docs-cosine`
    - doc:03-query → adds `--collection docs-cosine --force true`

Why the new collection

- getOrCreateCollection doesn’t change an existing collection’s space. Using a new name
avoids inheriting the old L2 config.

What to run (will modify files)

 pnpm -C packages/docops doc:02-embed ^ref-b9540809-28-0
 pnpm -C packages/docops doc:03-query
 pnpm -C packages/docops doc:04-relate --docs-dir docs/unique --doc-threshold 0.10 --ref-threshold 0.10
 pnpm -C packages/docops doc:05-footers

If you want, I can run those now. ^ref-b9540809-33-0

Plan

- Rebuild embeddings in docs-cosine collection (02-embed).
- Recompute query hits with forced refresh (03-query).
- Reapply relations with low thresholds (04-relate).
- Regenerate footers (05-footers).

Next

- If refs still look sparse, I can dump hit stats from Level (.cache/docops.level/q) to
confirm scores and coverage.

✓ Applied patch ^ref-b9540809-47-0
  └ Success. Updated the following files:
    M packages/docops/package.json

▌ Explain this codebase ^ref-b9540809-51-0
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
- [chroma-distance-metric-fix](chroma-distance-metric-fix.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [Promethean Notes](promethean-notes.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [Promethean State Format](promethean-state-format.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [promethean-requirements](promethean-requirements.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [Ghostly Smoke Interference](ghostly-smoke-interference.md)
- [run-step-api](run-step-api.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [Promethean Documentation Update](promethean-documentation-update.txt)
- [Promethean Dev Workflow Update](promethean-dev-workflow-update.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [Promethean Documentation Overview](promethean-documentation-overview.md)
- [Promethean Documentation Update](promethean-documentation-update.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [file-watcher-auth-fix](file-watcher-auth-fix.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
## Sources
- [Ghostly Smoke Interference — L40](ghostly-smoke-interference.md#^ref-b6ae7dfa-40-0) (line 40, col 0, score 1)
- [chroma-distance-metric-fix — L10](chroma-distance-metric-fix.md#^ref-9fd881b6-10-0) (line 10, col 0, score 0.92)
- [run-step-api — L804](run-step-api.md#^ref-15d25922-804-0) (line 804, col 0, score 0.95)
- [chroma-distance-metric-fix — L11](chroma-distance-metric-fix.md#^ref-9fd881b6-11-0) (line 11, col 0, score 1)
- [chroma-distance-metric-fix — L12](chroma-distance-metric-fix.md#^ref-9fd881b6-12-0) (line 12, col 0, score 1)
- [chroma-distance-metric-fix — L15](chroma-distance-metric-fix.md#^ref-9fd881b6-15-0) (line 15, col 0, score 1)
- [chroma-distance-metric-fix — L16](chroma-distance-metric-fix.md#^ref-9fd881b6-16-0) (line 16, col 0, score 1)
- [chroma-distance-metric-fix — L17](chroma-distance-metric-fix.md#^ref-9fd881b6-17-0) (line 17, col 0, score 1)
- [chroma-distance-metric-fix — L30](chroma-distance-metric-fix.md#^ref-9fd881b6-30-0) (line 30, col 0, score 0.91)
- [chroma-distance-metric-fix — L32](chroma-distance-metric-fix.md#^ref-9fd881b6-32-0) (line 32, col 0, score 0.86)
- [chroma-distance-metric-fix — L34](chroma-distance-metric-fix.md#^ref-9fd881b6-34-0) (line 34, col 0, score 1)
- [chroma-distance-metric-fix — L48](chroma-distance-metric-fix.md#^ref-9fd881b6-48-0) (line 48, col 0, score 1)
- [run-step-api — L160](run-step-api.md#^ref-15d25922-160-0) (line 160, col 0, score 0.9)
- [run-step-api — L613](run-step-api.md#^ref-15d25922-613-0) (line 613, col 0, score 0.9)
- [run-step-api — L144](run-step-api.md#^ref-15d25922-144-0) (line 144, col 0, score 0.88)
- [run-step-api — L664](run-step-api.md#^ref-15d25922-664-0) (line 664, col 0, score 0.88)
- [run-step-api — L329](run-step-api.md#^ref-15d25922-329-0) (line 329, col 0, score 0.86)
- [run-step-api — L364](run-step-api.md#^ref-15d25922-364-0) (line 364, col 0, score 0.85)
- [chroma-distance-metric-fix — L52](chroma-distance-metric-fix.md#^ref-9fd881b6-52-0) (line 52, col 0, score 1)
- [ts-to-lisp-transpiler — L3](ts-to-lisp-transpiler.md#^ref-ba11486b-3-0) (line 3, col 0, score 1)
- [ts-to-lisp-transpiler — L5](ts-to-lisp-transpiler.md#^ref-ba11486b-5-0) (line 5, col 0, score 1)
- [Promethean Notes — L27](promethean-notes.md#^ref-1c4046b5-27-0) (line 27, col 0, score 1)
- [Promethean Pipelines — L94](promethean-pipelines.md#^ref-8b8e6103-94-0) (line 94, col 0, score 1)
- [promethean-requirements — L31](promethean-requirements.md#^ref-95205cd3-31-0) (line 31, col 0, score 1)
- [Promethean State Format — L132](promethean-state-format.md#^ref-23df6ddb-132-0) (line 132, col 0, score 1)
- [Promethean Workflow Optimization — L27](promethean-workflow-optimization.md#^ref-d614d983-27-0) (line 27, col 0, score 1)
- [Prometheus Observability Stack — L534](prometheus-observability-stack.md#^ref-e90b5a16-534-0) (line 534, col 0, score 1)
- [Prompt_Folder_Bootstrap — L209](prompt-folder-bootstrap.md#^ref-bd4f0976-209-0) (line 209, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L144](protocol-0-the-contradiction-engine.md#^ref-9a93a756-144-0) (line 144, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L273](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-273-0) (line 273, col 0, score 1)
- [Promethean Dev Workflow Update — L60](promethean-dev-workflow-update.md#^ref-03a5578f-60-0) (line 60, col 0, score 1)
- [Promethean Documentation Overview — L86](promethean-documentation-overview.md#^ref-9413237f-86-0) (line 86, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L243](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-243-0) (line 243, col 0, score 1)
- [Promethean Documentation Update — L94](promethean-documentation-update.md#^ref-c0392040-94-0) (line 94, col 0, score 1)
- [Promethean Documentation Update — L12](promethean-documentation-update.txt#^ref-0b872af2-12-0) (line 12, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L133](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-133-0) (line 133, col 0, score 1)
- [Promethean Infrastructure Setup — L750](promethean-infrastructure-setup.md#^ref-6deed6ac-750-0) (line 750, col 0, score 1)
- [Promethean Notes — L8](promethean-notes.md#^ref-1c4046b5-8-0) (line 8, col 0, score 1)
- [ripple-propagation-demo — L189](ripple-propagation-demo.md#^ref-8430617b-189-0) (line 189, col 0, score 1)
- [run-step-api — L1038](run-step-api.md#^ref-15d25922-1038-0) (line 1038, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
