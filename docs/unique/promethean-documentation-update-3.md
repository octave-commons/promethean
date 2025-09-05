---
uuid: c9aeb36e-614a-449e-aec1-89752617001f
created_at: promethean-documentation-update-3.md
filename: JavaScript Pipeline Refactoring
title: JavaScript Pipeline Refactoring
description: >-
  This document outlines the need to refactor the current pipeline mechanism
  from CLI-based shell calls to pure JavaScript functions. The goal is to create
  exportable functions that can be composed within a single index file,
  eliminating the need for YAML configurations and CLI interactions. This
  approach improves maintainability and reduces brittleness in the system.
tags:
  - javascript
  - pipeline
  - refactoring
related_to_uuid:
  - 5c307293-04cb-4478-ba2c-4cd85dbec260
  - fc21f824-4244-4030-a48e-c4170160ea1d
  - 1c4046b5-742d-4004-aec6-b47251fef5d6
  - 18138627-a348-4fbb-b447-410dfb400564
  - a4d90289-798d-44a0-a8e8-a055ae12fb52
  - 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - 22b989d5-f4aa-4880-8632-709c21830f83
  - 72e4fd3c-7a07-4a95-91a3-6fca7f7fcaa3
  - dd00677a-2280-45a7-91af-0728b21af3ad
  - 291c7d91-da8c-486c-9bc0-bd2254536e2d
  - 23df6ddb-05cf-4639-8201-f8291f8a6026
  - d614d983-7795-491f-9437-09f3a43f72cf
  - e90b5a16-d58f-424d-bd36-70e9bd2861ad
  - bd4f0976-0d5b-47f6-a20a-0601d1842dc1
  - 9a93a756-6d33-45d1-aca9-51b74f2b33d2
  - 43bfe9dd-d433-42ca-9777-f4c40eaba791
  - 15d25922-0de6-414f-b7d1-e50e2a57b33a
  - 4330e8f0-5f46-4235-918b-39b6b93fa561
  - 78eeedf7-75bc-4692-a5a7-bb6857270621
  - b09141b7-544f-4c8e-8f49-bf76cecaacbb
  - a4a25141-6380-40b9-9cd7-b554b246b303
  - 1cfae310-35dc-49c2-98f1-b186da25d84b
  - 64a9f9f9-58ee-4996-bdaf-9373845c6b29
  - e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
related_to_title:
  - Self-Improving Documentation Tool
  - Fnord Tracer Protocol
  - Promethean Notes
  - The Jar of Echoes
  - Factorio AI with External Agents
  - field-dynamics-math-blocks
  - field-node-diagram-outline
  - field-node-diagram-set
  - Git Commit Optimization for Code Reviews
  - heartbeat-fragment-demo
  - Ice Box Reorganization
  - Promethean State Format
  - Promethean Workflow Optimization
  - Prometheus Observability Stack
  - Prompt_Folder_Bootstrap
  - Protocol_0_The_Contradiction_Engine
  - Provider-Agnostic Chat Panel Implementation
  - run-step-api
  - Stateful Partitions and Rebalancing
  - typed-struct-compiler
  - field-interaction-equations
  - Functional Embedding Pipeline Refactor
  - Functional Refactor of TypeScript Document Processing
  - Layer1SurvivabilityEnvelope
  - field-node-diagram-visualizations
references:
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 115
    col: 0
    score: 1
  - uuid: 5c307293-04cb-4478-ba2c-4cd85dbec260
    line: 21
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 235
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 186
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 247
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 354
    col: 0
    score: 1
  - uuid: 72e4fd3c-7a07-4a95-91a3-6fca7f7fcaa3
    line: 163
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 217
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 157
    col: 0
    score: 1
  - uuid: b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
    line: 185
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 367
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 170
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 162
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 140
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 550
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 136
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 201
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 70
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 192
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 113
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 160
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 71
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 604
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 277
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 225
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 323
    col: 0
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 11
    col: 0
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 151
    col: 0
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 152
    col: 0
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 286
    col: 0
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 288
    col: 0
    score: 1
  - uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
    line: 299
    col: 0
    score: 1
  - uuid: ac60a1d6-fd9f-46dc-bbe7-176dd8017c59
    line: 12
    col: 0
    score: 1
  - uuid: 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
    line: 135
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 199
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 206
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 200
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 234
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 184
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 348
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 418
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 245
    col: 0
    score: 1
  - uuid: 72e4fd3c-7a07-4a95-91a3-6fca7f7fcaa3
    line: 159
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 245
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 171
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 208
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 202
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 236
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 186
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 347
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 420
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 247
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 182
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 128
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 323
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 362
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 205
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 378
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 134
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 180
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 134
    col: 0
    score: 1
  - uuid: 72e4fd3c-7a07-4a95-91a3-6fca7f7fcaa3
    line: 180
    col: 0
    score: 1
  - uuid: 72e4fd3c-7a07-4a95-91a3-6fca7f7fcaa3
    line: 182
    col: 0
    score: 1
  - uuid: 72e4fd3c-7a07-4a95-91a3-6fca7f7fcaa3
    line: 185
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 157
    col: 0
    score: 1
  - uuid: 72e4fd3c-7a07-4a95-91a3-6fca7f7fcaa3
    line: 218
    col: 0
    score: 1
  - uuid: 72e4fd3c-7a07-4a95-91a3-6fca7f7fcaa3
    line: 219
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 156
    col: 0
    score: 1
  - uuid: 72e4fd3c-7a07-4a95-91a3-6fca7f7fcaa3
    line: 221
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 161
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 1852
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 643
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 686
    col: 0
    score: 0.99
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 497
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 286
    col: 0
    score: 0.99
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 285
    col: 0
    score: 0.99
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 762
    col: 0
    score: 0.99
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 322
    col: 0
    score: 0.99
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 353
    col: 0
    score: 0.99
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 419
    col: 0
    score: 0.99
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 352
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 16336
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 17254
    col: 0
    score: 0.99
  - uuid: 72e4fd3c-7a07-4a95-91a3-6fca7f7fcaa3
    line: 230
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 1882
    col: 0
    score: 0.98
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 3456
    col: 0
    score: 0.98
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 3800
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 4565
    col: 0
    score: 0.98
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 4731
    col: 0
    score: 0.98
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 8948
    col: 0
    score: 0.98
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 4828
    col: 0
    score: 0.98
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 10348
    col: 0
    score: 0.98
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 4614
    col: 0
    score: 0.98
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 4811
    col: 0
    score: 0.98
  - uuid: 15d25922-0de6-414f-b7d1-e50e2a57b33a
    line: 1117
    col: 0
    score: 0.98
  - uuid: 5c307293-04cb-4478-ba2c-4cd85dbec260
    line: 82
    col: 0
    score: 0.98
  - uuid: 15d25922-0de6-414f-b7d1-e50e2a57b33a
    line: 1131
    col: 0
    score: 0.98
  - uuid: 5c307293-04cb-4478-ba2c-4cd85dbec260
    line: 96
    col: 0
    score: 0.98
  - uuid: 5c307293-04cb-4478-ba2c-4cd85dbec260
    line: 104
    col: 0
    score: 0.98
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 3537
    col: 0
    score: 0.98
---


I need to spec out this pipeline mechanisim a little more
constanlty making and adjusting shell calls seems brittle.

When What I want is just to call js functions, from inside of js functions.
The pipeline should just be javascript using javascript, cut the yaml out cut the cli shit out. These don't need to be cl.

Docs
Preview

{
  "error": "hits is not iterable"
}

Logs

Starting pipeline in /home/err/devel/promethean/docs/unique
/home/err/devel/promethean/node_modules/.pnpm/abstract-level@3.1.0/node_modules/abstract-level/abstract-level.js:174\n          throw new NotOpenError(err)\n                ^\n\nNotOpenError: Database failed to open\n    at /home/err/devel/promethean/node_modules/.pnpm/abstract-level@3.1.0/node_modules/abstract-level/abstract-level.js:174:17 {\n  code: 'LEVEL_DATABASE_NOT_OPEN',\n  cause: [Error: IO error: lock .cache/docops.level/LOCK: Resource temporarily unavailable] {\n    code: 'LEVEL_LOCKED'\n  }\n}\n\nNode.js v22.18.0
NotOpenError: Database failed to open\n    at /home/err/devel/promethean/node_modules/.pnpm/abstract-level@3.1.0/node_modules/abstract-level/abstract-level.js:174:17 {\n  code: 'LEVEL_DATABASE_NOT_OPEN',\n  cause: [Error: IO error: lock .cache/docops.level/LOCK: Resource temporarily unavailable] {\n    code: 'LEVEL_LOCKED'\n  }\n}
/home/err/devel/promethean/node_modules/.pnpm/abstract-level@3.1.0/node_modules/abstract-level/abstract-level.js:174\n          throw new NotOpenError(err)\n                ^\n\nNotOpenError: Database failed to open\n    at /home/err/devel/promethean/node_modules/.pnpm/abstract-level@3.1.0/node_modules/abstract-level/abstract-level.js:174:17 {\n  code: 'LEVEL_DATABASE_NOT_OPEN',\n  cause: [Error: IO error: lock .cache/docops.level/LOCK: Resource temporarily unavailable] {\n    code: 'LEVEL_LOCKED'\n  }\n}\n\nNode.js v22.18.0
04-relations: ROOT=/home/err/devel/promethean/docs/unique, DOC_THRESHOLD=0.78, REF_THRESHOLD=0.85
/home/err/devel/promethean/node_modules/.pnpm/abstract-level@3.1.0/node_modules/abstract-level/abstract-level.js:174\n          throw new NotOpenError(err)\n                ^\n\nNotOpenError: Database failed to open\n    at /home/err/devel/promethean/node_modules/.pnpm/abstract-level@3.1.0/node_modules/abstract-level/abstract-level.js:174:17 {\n  code: 'LEVEL_DATABASE_NOT_OPEN',\n  cause: [Error: IO error: lock .cache/docops.level/LOCK: Resource temporarily unavailable] {\n    code: 'LEVEL_LOCKED'\n  }\n}\n\nNode.js v22.18.0
/home/err/devel/promethean/node_modules/.pnpm/abstract-level@3.1.0/node_modules/abstract-level/abstract-level.js:174\n          throw new NotOpenError(err)\n                ^\n\nNotOpenError: Database failed to open\n    at /home/err/devel/promethean/node_modules/.pnpm/abstract-level@3.1.0/node_modules/abstract-level/abstract-level.js:174:17 {\n  code: 'LEVEL_DATABASE_NOT_OPEN',\n  cause: [Error: IO error: lock .cache/docops.level/LOCK: Resource temporarily unavailable] {\n    code: 'LEVEL_LOCKED'\n  }\n}\n\nNode.js v22.18.0
Error: ENOENT: no such file or directory, open '/home/err/devel/promethean/docs/unique/.#2025.09.01.19.55.45.md'\n    at async open (node:internal/fs/promises:639:25)\n    at async Object.readFile (node:internal/fs/promises:1243:14)\n    at async main (/home/err/devel/promethean/packages/docops/src/06-rename.ts:30:17) {\n  errno: -2,\n  code: 'ENOENT',\n  syscall: 'open',\n  path: '/home/err/devel/promethean/docs/unique/.#2025.09.01.19.55.45.md'\n}
Done.


We need to turn each of these pipeine steps into exportable functions, and then have a single index.ts file that exports all of them.

Move away from calling these from a CLI

Eventually we're gonna compose together several of these pipelines, and we don't want to be calling the commandline from js world just to run javscript.
