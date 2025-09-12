---
uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
created_at: 2025.08.24.09.41.40.md
filename: Chroma Toolkit Consolidation Plan
description: >-
  Centralizes Chroma client management across services with a single shared
  toolkit, standardizing embedding functions, retention policies, and
  cross-language consistency. Eliminates duplicated clients and ensures
  predictable cleanup.
tags:
  - Chroma
  - client
  - consolidation
  - embedding
  - retention
  - policy
  - cross-language
  - migration
related_to_title:
  - prom-lib-rate-limiters-and-replay-api
  - Dynamic Context Model for Web Components
  - Promethean-native config design
  - Migrate to Provider-Tenant Architecture
  - Prompt_Folder_Bootstrap
  - ecs-scheduler-and-prefabs
  - Sibilant Meta-Prompt DSL
  - 'Agent Tasks: Persistence Migration to DualStore'
  - Model Selection for Lightweight Conversational Tasks
  - Promethean Event Bus MVP v0.1
  - Per-Domain Policy System for JS Crawler
  - aionian-circuit-math
  - ecs-offload-workers
  - api-gateway-versioning
  - Board Walk – 2025-08-11
  - Cross-Target Macro System in Sibilant
  - Exception Layer Analysis
  - Cross-Language Runtime Polymorphism
  - archetype-ecs
  - JavaScript
  - eidolon-field-math-foundations
  - Event Bus MVP
  - i3-bluetooth-setup
  - polymorphic-meta-programming-engine
  - Event Bus Projections Architecture
  - Fnord Tracer Protocol
  - js-to-lisp-reverse-compiler
  - Mongo Outbox Implementation
  - Agent Reflections and Prompt Evolution
  - Canonical Org-Babel Matplotlib Animation Template
  - EidolonField
  - field-interaction-equations
  - Voice Access Layer Design
  - Promethean Agent Config DSL
  - polyglot-repl-interface-layer
  - System Scheduler with Resource-Aware DAG
  - sibilant-meta-string-templating-runtime
  - Promethean Infrastructure Setup
related_to_uuid:
  - aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - ab748541-020e-4a7e-b07d-28173bd5bea2
  - 54382370-1931-4a19-a634-46735708a9ea
  - bd4f0976-0d5b-47f6-a20a-0601d1842dc1
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - af5d2824-faad-476c-a389-e912d9bc672c
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - d144aa62-348c-4e5d-ae8f-38084c67ceca
  - fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
  - c03020e1-e3e7-48bf-aa7e-aa740c601b63
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - 0580dcd3-533d-4834-8a2f-eae3771960a9
  - 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - 21d5cc09-b005-4ede-8f69-00b4b0794540
  - c34c36a6-80c9-4b44-a200-6448543b1b33
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - c1618c66-f73a-4e04-9bfa-ef38755f7acc
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
  - 5e408692-0e74-400e-a617-84247c7353ad
  - 7bed0b9a-8b22-4b1f-be81-054a179453cb
  - cf6b9b17-bb91-4219-aa5c-172cba02b2da
  - fc21f824-4244-4030-a48e-c4170160ea1d
  - 58191024-d04a-4520-8aae-a18be7b94263
  - 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
  - bb7f0835-c347-474f-bfad-eabd873b51ad
  - 1b1338fc-bb4d-41df-828f-e219cc9442eb
  - 49d1e1e5-5d13-4955-8f6f-7676434ec462
  - b09141b7-544f-4c8e-8f49-bf76cecaacbb
  - 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
  - 2c00ce45-08cf-4b81-9883-6157f30b7fae
  - 9c79206d-4cb9-4f00-87e0-782dcea37bc7
  - ba244286-4e84-425b-8bf6-b80c4eb783fc
  - 2aafc801-c3e1-4e4f-999d-adb52af3fc41
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
references:
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 111
    col: 1
    score: 0.94
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 111
    col: 3
    score: 0.94
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 40
    col: 4
    score: 0.92
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 40
    col: 6
    score: 0.92
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 158
    col: 1
    score: 0.86
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 158
    col: 3
    score: 0.86
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 31
    col: 1
    score: 0.95
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 31
    col: 3
    score: 0.95
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 331
    col: 1
    score: 0.95
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 331
    col: 3
    score: 0.95
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 32
    col: 1
    score: 0.93
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 32
    col: 3
    score: 0.93
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 33
    col: 1
    score: 0.93
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 33
    col: 3
    score: 0.93
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 333
    col: 3
    score: 0.95
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 333
    col: 5
    score: 0.95
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 24
    col: 1
    score: 0.88
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 42
    col: 1
    score: 0.88
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 66
    col: 1
    score: 0.88
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 84
    col: 1
    score: 0.88
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 103
    col: 1
    score: 0.88
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 130
    col: 1
    score: 0.88
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 152
    col: 1
    score: 0.88
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 338
    col: 1
    score: 0.88
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 136
    col: 1
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 136
    col: 3
    score: 1
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 551
    col: 1
    score: 1
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 551
    col: 3
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 284
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 284
    col: 3
    score: 1
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 555
    col: 1
    score: 1
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 555
    col: 3
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 285
    col: 1
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 285
    col: 3
    score: 1
  - uuid: 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
    line: 135
    col: 1
    score: 1
  - uuid: 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
    line: 135
    col: 3
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 180
    col: 1
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 180
    col: 3
    score: 1
  - uuid: 21d5cc09-b005-4ede-8f69-00b4b0794540
    line: 157
    col: 1
    score: 1
  - uuid: 21d5cc09-b005-4ede-8f69-00b4b0794540
    line: 157
    col: 3
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 130
    col: 1
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 130
    col: 3
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 159
    col: 1
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 159
    col: 3
    score: 1
  - uuid: 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
    line: 134
    col: 1
    score: 1
  - uuid: 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
    line: 134
    col: 3
    score: 1
  - uuid: c34c36a6-80c9-4b44-a200-6448543b1b33
    line: 209
    col: 1
    score: 1
  - uuid: c34c36a6-80c9-4b44-a200-6448543b1b33
    line: 209
    col: 3
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 131
    col: 1
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 131
    col: 3
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 175
    col: 1
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 175
    col: 3
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 392
    col: 1
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 392
    col: 3
    score: 1
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 414
    col: 1
    score: 1
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 414
    col: 3
    score: 1
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 138
    col: 1
    score: 1
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 138
    col: 3
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 110
    col: 1
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 110
    col: 3
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 389
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 389
    col: 3
    score: 1
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 884
    col: 1
    score: 1
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 884
    col: 3
    score: 1
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 454
    col: 1
    score: 1
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 454
    col: 3
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 14
    col: 1
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 14
    col: 3
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 454
    col: 1
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 454
    col: 3
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 128
    col: 1
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 128
    col: 3
    score: 1
  - uuid: c34c36a6-80c9-4b44-a200-6448543b1b33
    line: 201
    col: 1
    score: 1
  - uuid: c34c36a6-80c9-4b44-a200-6448543b1b33
    line: 201
    col: 3
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 178
    col: 1
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 178
    col: 3
    score: 1
  - uuid: 49d1e1e5-5d13-4955-8f6f-7676434ec462
    line: 251
    col: 1
    score: 1
  - uuid: 49d1e1e5-5d13-4955-8f6f-7676434ec462
    line: 251
    col: 3
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 159
    col: 1
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 159
    col: 3
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 133
    col: 1
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 133
    col: 3
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 266
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 266
    col: 3
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 472
    col: 1
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 472
    col: 3
    score: 1
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 390
    col: 1
    score: 1
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 390
    col: 3
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 105
    col: 1
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 105
    col: 3
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 282
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 282
    col: 3
    score: 1
  - uuid: 7bed0b9a-8b22-4b1f-be81-054a179453cb
    line: 206
    col: 1
    score: 1
  - uuid: 7bed0b9a-8b22-4b1f-be81-054a179453cb
    line: 206
    col: 3
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 137
    col: 1
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 137
    col: 3
    score: 1
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 547
    col: 1
    score: 1
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 547
    col: 3
    score: 1
  - uuid: cf6b9b17-bb91-4219-aa5c-172cba02b2da
    line: 150
    col: 1
    score: 1
  - uuid: cf6b9b17-bb91-4219-aa5c-172cba02b2da
    line: 150
    col: 3
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 244
    col: 1
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 244
    col: 3
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 158
    col: 1
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 158
    col: 3
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 141
    col: 1
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 141
    col: 3
    score: 1
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 331
    col: 1
    score: 1
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 331
    col: 3
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 483
    col: 1
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 483
    col: 3
    score: 1
  - uuid: 2c00ce45-08cf-4b81-9883-6157f30b7fae
    line: 321
    col: 1
    score: 1
  - uuid: 2c00ce45-08cf-4b81-9883-6157f30b7fae
    line: 321
    col: 3
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 481
    col: 1
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 481
    col: 3
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 145
    col: 1
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 145
    col: 3
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 159
    col: 1
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 159
    col: 3
    score: 1
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 214
    col: 1
    score: 1
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 214
    col: 3
    score: 1
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 403
    col: 1
    score: 1
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 403
    col: 3
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 479
    col: 1
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 479
    col: 3
    score: 1
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 215
    col: 1
    score: 1
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 215
    col: 3
    score: 1
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 404
    col: 1
    score: 1
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 404
    col: 3
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 480
    col: 1
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 480
    col: 3
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 299
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 299
    col: 3
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 300
    col: 1
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 300
    col: 3
    score: 0.99
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 170
    col: 1
    score: 0.99
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 170
    col: 3
    score: 0.99
  - uuid: 2aafc801-c3e1-4e4f-999d-adb52af3fc41
    line: 132
    col: 1
    score: 0.99
  - uuid: 2aafc801-c3e1-4e4f-999d-adb52af3fc41
    line: 132
    col: 3
    score: 0.99
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 205
    col: 1
    score: 1
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 205
    col: 3
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 143
    col: 1
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 143
    col: 3
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 408
    col: 1
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 408
    col: 3
    score: 0.99
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 144
    col: 1
    score: 0.99
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 144
    col: 3
    score: 0.99
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 206
    col: 1
    score: 1
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 206
    col: 3
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 409
    col: 1
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 409
    col: 3
    score: 0.99
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 207
    col: 1
    score: 1
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 207
    col: 3
    score: 1
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 208
    col: 1
    score: 1
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 208
    col: 3
    score: 1
  - uuid: 2c00ce45-08cf-4b81-9883-6157f30b7fae
    line: 326
    col: 1
    score: 0.99
  - uuid: 2c00ce45-08cf-4b81-9883-6157f30b7fae
    line: 326
    col: 3
    score: 0.99
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 395
    col: 1
    score: 0.99
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 395
    col: 3
    score: 0.99
  - uuid: 2c00ce45-08cf-4b81-9883-6157f30b7fae
    line: 327
    col: 1
    score: 0.99
  - uuid: 2c00ce45-08cf-4b81-9883-6157f30b7fae
    line: 327
    col: 3
    score: 0.99
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 327
    col: 1
    score: 1
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 327
    col: 3
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 154
    col: 1
    score: 0.99
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 154
    col: 3
    score: 0.99
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 156
    col: 1
    score: 0.99
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 156
    col: 3
    score: 0.99
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 155
    col: 1
    score: 0.99
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 155
    col: 3
    score: 0.99
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 157
    col: 1
    score: 0.99
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 157
    col: 3
    score: 0.99
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 904
    col: 1
    score: 0.99
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 904
    col: 3
    score: 0.99
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 906
    col: 1
    score: 0.99
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 906
    col: 3
    score: 0.99
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 559
    col: 1
    score: 0.98
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 559
    col: 3
    score: 0.98
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 558
    col: 1
    score: 0.98
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 558
    col: 3
    score: 0.98
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 410
    col: 1
    score: 0.99
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 410
    col: 3
    score: 0.99
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 402
    col: 1
    score: 0.99
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 402
    col: 3
    score: 0.99
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 899
    col: 1
    score: 0.98
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 899
    col: 3
    score: 0.98
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 413
    col: 1
    score: 0.98
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 413
    col: 3
    score: 0.98
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 411
    col: 1
    score: 0.99
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 411
    col: 3
    score: 0.99
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 403
    col: 1
    score: 0.99
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 403
    col: 3
    score: 0.99
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 900
    col: 1
    score: 0.98
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 900
    col: 3
    score: 0.98
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 412
    col: 1
    score: 0.99
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 412
    col: 3
    score: 0.99
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 404
    col: 1
    score: 0.99
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 404
    col: 3
    score: 0.99
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 405
    col: 1
    score: 0.99
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 405
    col: 3
    score: 0.99
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 414
    col: 1
    score: 0.99
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 414
    col: 3
    score: 0.99
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 406
    col: 1
    score: 0.99
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 406
    col: 3
    score: 0.99
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 141
    col: 1
    score: 0.99
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 141
    col: 3
    score: 0.99
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 415
    col: 1
    score: 0.99
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 415
    col: 3
    score: 0.99
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 407
    col: 1
    score: 0.99
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 407
    col: 3
    score: 0.99
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 416
    col: 1
    score: 0.99
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 416
    col: 3
    score: 0.99
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 408
    col: 1
    score: 0.99
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 408
    col: 3
    score: 0.99
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 193
    col: 1
    score: 0.99
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 193
    col: 3
    score: 0.99
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 409
    col: 1
    score: 0.99
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 409
    col: 3
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 154
    col: 1
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 154
    col: 3
    score: 0.98
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 609
    col: 1
    score: 0.98
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 609
    col: 3
    score: 0.98
---

### ✅ Recommended Consolidation Plan

centralize around a **single shared Chroma toolkit**:

1.  **Create `shared/ts/chroma/`**

*   Export one `getChromaClient()` singleton with lazy init.

*   Standardize env config (`CHROMA_URL`, `CHROMA_DB_IMPL`, `CHROMA_PERSIST_DIR`).

*   Provide helpers:

        *   `getOrCreateCollection(name, embeddingFn?, metadata?)`

        *   `listCollections()`

        *   `cleanupCollection(name, policy)`


        → All TS services (`discord-embedder`, `cephalon`, `smartgpt-bridge`) import from here.

        2.  **Unify Embedding Functions**

        *   Consolidate `RemoteEmbeddingFunction` + `embedding/versioning` into this toolkit.

        *   Guarantee every collection has consistent naming (`family__version__driver__fn`).

        3.  **Shared Retention Policy**

        *   Move `chromaCleanup` (currently only in SmartGPT Bridge) into shared.

        *   Support TTL (delete older than X days) + capped size (`LOG_MAX_CHROMA`).

        4.  **Cross-language consistency**

        *   Align `scripts/index_project_files.py` with TS API:

        *   Same env vars.

        *   Same collection family naming.

        *   Option: wrap Python indexer behind a service, so you don’t need direct Chroma Python calls in production.

        5.  **Docs & Migration**

        *   Update `docs/notes` and `docs/file-structure.md` to point to the **single Chroma toolkit**.

        *   Mark local `services/ts/chroma/` as deprecated once everything points to `shared/ts/chroma/`.


* * *

⚡ This gives us:

*   One **source of truth** for Chroma configuration + lifecycle.

*   No more duplicated clients sprinkled across services.

*   Predictable **cleanup & retention** policies.

*   Cleaner service code: `const client = getChromaClient()` everywhere.



Here’s the **Mongo usage inside `services/ts/`**. It’s widespread and parallels what we saw for Chroma:

* * *

### 📦 **services/ts/discord-embedder/**

*   `src/index.ts`:

    ```ts
    import { MongoClient, ObjectId, Collection } from 'mongodb';
    const MONGO_CONNECTION_STRING = process.env.MONGODB_URI || `mongodb://localhost`;
    const mongoClient = new MongoClient(MONGO_CONNECTION_STRING);
    await mongoClient.connect();
    const db = mongoClient.db('database');
    ```
    *   Stores Discord messages in **Mongo** alongside embeddings in **Chroma**.


* * *

### 📦 **services/ts/cephalon/**

*   `src/collectionManager.ts`:

    ```ts
    import { Collection, MongoClient, ObjectId } from 'mongodb';
    const mongoClient = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
    const db = mongoClient.db('database');
    const mongoCollection = db.collection<CollectionEntry>(family);
    ```
    *   Implements a **dual persistence layer**:

    *   `chromaCollection.add(...)`

    *   `mongoCollection.insertOne(...)`


* * *

### 📦 **services/ts/kanban-processor/**

*   `src/index.ts`:

    ```ts
    import { MongoClient, Collection } from 'mongodb';
    const mongoClient = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
    mongoClient.connect();
    const mongoCollection = mongoClient.db('database').collection(`${agentName}_kanban`);
    ```
    *   Tracks kanban card state in Mongo.


* * *

### 📦 **services/ts/markdown-graph/**

*   `src/index.ts` + `src/graph.ts`:

    ```ts
    import { MongoClient, Collection } from 'mongodb';
    const client = new MongoClient(mongoUrl);
    await client.connect();
    const db = new GraphDB(client, repoPath);
    ```
    *   Backs the **markdown graph database** with Mongo.


* * *

### 📦 **services/ts/smartgpt-bridge/**

*   `src/mongo.js`: central connection logic with `mongoose`.

    ```ts
    import mongoose from 'mongoose';
    export async function initMongo() { ... }
    export async function cleanupMongo() { ... }
    ```
    *   Used in:

    *   `fastifyAuth.js`, `rbac.js` (auth/user models in Mongo).

    *   `utils/DualSink.js`:

        ```ts
        this.mongoModel = mongoose.model(name, schema);
        await this.mongoModel.create(entry);
        ```

        Mirrors everything into **Chroma** as well.

        *   `logging/index.js`: `mongoChromaLogger(app)`.

        *   `routes/v0/sinks.js`: query sinks from Mongo.


* * *
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [archetype-ecs](archetype-ecs.md)
- [JavaScript](chunks/javascript.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Event Bus MVP](event-bus-mvp.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [EidolonField](eidolonfield.md)
- [field-interaction-equations](field-interaction-equations.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)

## Sources
- [Migrate to Provider-Tenant Architecture — L111](migrate-to-provider-tenant-architecture.md#L111) (line 111, col 1, score 0.94)
- [Migrate to Provider-Tenant Architecture — L111](migrate-to-provider-tenant-architecture.md#L111) (line 111, col 3, score 0.94)
- [Migrate to Provider-Tenant Architecture — L40](migrate-to-provider-tenant-architecture.md#L40) (line 40, col 4, score 0.92)
- [Migrate to Provider-Tenant Architecture — L40](migrate-to-provider-tenant-architecture.md#L40) (line 40, col 6, score 0.92)
- [Sibilant Meta-Prompt DSL — L158](sibilant-meta-prompt-dsl.md#L158) (line 158, col 1, score 0.86)
- [Sibilant Meta-Prompt DSL — L158](sibilant-meta-prompt-dsl.md#L158) (line 158, col 3, score 0.86)
- [Promethean-native config design — L31](promethean-native-config-design.md#L31) (line 31, col 1, score 0.95)
- [Promethean-native config design — L31](promethean-native-config-design.md#L31) (line 31, col 3, score 0.95)
- [Dynamic Context Model for Web Components — L331](dynamic-context-model-for-web-components.md#L331) (line 331, col 1, score 0.95)
- [Dynamic Context Model for Web Components — L331](dynamic-context-model-for-web-components.md#L331) (line 331, col 3, score 0.95)
- [Promethean-native config design — L32](promethean-native-config-design.md#L32) (line 32, col 1, score 0.93)
- [Promethean-native config design — L32](promethean-native-config-design.md#L32) (line 32, col 3, score 0.93)
- [Promethean-native config design — L33](promethean-native-config-design.md#L33) (line 33, col 1, score 0.93)
- [Promethean-native config design — L33](promethean-native-config-design.md#L33) (line 33, col 3, score 0.93)
- [prom-lib-rate-limiters-and-replay-api — L333](prom-lib-rate-limiters-and-replay-api.md#L333) (line 333, col 3, score 0.95)
- [prom-lib-rate-limiters-and-replay-api — L333](prom-lib-rate-limiters-and-replay-api.md#L333) (line 333, col 5, score 0.95)
- [Prompt_Folder_Bootstrap — L24](prompt-folder-bootstrap.md#L24) (line 24, col 1, score 0.88)
- [Prompt_Folder_Bootstrap — L42](prompt-folder-bootstrap.md#L42) (line 42, col 1, score 0.88)
- [Prompt_Folder_Bootstrap — L66](prompt-folder-bootstrap.md#L66) (line 66, col 1, score 0.88)
- [Prompt_Folder_Bootstrap — L84](prompt-folder-bootstrap.md#L84) (line 84, col 1, score 0.88)
- [Prompt_Folder_Bootstrap — L103](prompt-folder-bootstrap.md#L103) (line 103, col 1, score 0.88)
- [Prompt_Folder_Bootstrap — L130](prompt-folder-bootstrap.md#L130) (line 130, col 1, score 0.88)
- [Prompt_Folder_Bootstrap — L152](prompt-folder-bootstrap.md#L152) (line 152, col 1, score 0.88)
- [ecs-scheduler-and-prefabs — L338](ecs-scheduler-and-prefabs.md#L338) (line 338, col 1, score 0.88)
- [Agent Tasks: Persistence Migration to DualStore — L136](agent-tasks-persistence-migration-to-dualstore.md#L136) (line 136, col 1, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L136](agent-tasks-persistence-migration-to-dualstore.md#L136) (line 136, col 3, score 1)
- [Event Bus MVP — L551](event-bus-mvp.md#L551) (line 551, col 1, score 1)
- [Event Bus MVP — L551](event-bus-mvp.md#L551) (line 551, col 3, score 1)
- [Migrate to Provider-Tenant Architecture — L284](migrate-to-provider-tenant-architecture.md#L284) (line 284, col 1, score 1)
- [Migrate to Provider-Tenant Architecture — L284](migrate-to-provider-tenant-architecture.md#L284) (line 284, col 3, score 1)
- [Mongo Outbox Implementation — L555](mongo-outbox-implementation.md#L555) (line 555, col 1, score 1)
- [Mongo Outbox Implementation — L555](mongo-outbox-implementation.md#L555) (line 555, col 3, score 1)
- [api-gateway-versioning — L285](api-gateway-versioning.md#L285) (line 285, col 1, score 1)
- [api-gateway-versioning — L285](api-gateway-versioning.md#L285) (line 285, col 3, score 1)
- [Board Walk – 2025-08-11 — L135](board-walk-2025-08-11.md#L135) (line 135, col 1, score 1)
- [Board Walk – 2025-08-11 — L135](board-walk-2025-08-11.md#L135) (line 135, col 3, score 1)
- [Cross-Target Macro System in Sibilant — L180](cross-target-macro-system-in-sibilant.md#L180) (line 180, col 1, score 1)
- [Cross-Target Macro System in Sibilant — L180](cross-target-macro-system-in-sibilant.md#L180) (line 180, col 3, score 1)
- [Exception Layer Analysis — L157](exception-layer-analysis.md#L157) (line 157, col 1, score 1)
- [Exception Layer Analysis — L157](exception-layer-analysis.md#L157) (line 157, col 3, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L130](agent-tasks-persistence-migration-to-dualstore.md#L130) (line 130, col 1, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L130](agent-tasks-persistence-migration-to-dualstore.md#L130) (line 130, col 3, score 1)
- [aionian-circuit-math — L159](aionian-circuit-math.md#L159) (line 159, col 1, score 1)
- [aionian-circuit-math — L159](aionian-circuit-math.md#L159) (line 159, col 3, score 1)
- [Board Walk – 2025-08-11 — L134](board-walk-2025-08-11.md#L134) (line 134, col 1, score 1)
- [Board Walk – 2025-08-11 — L134](board-walk-2025-08-11.md#L134) (line 134, col 3, score 1)
- [Cross-Language Runtime Polymorphism — L209](cross-language-runtime-polymorphism.md#L209) (line 209, col 1, score 1)
- [Cross-Language Runtime Polymorphism — L209](cross-language-runtime-polymorphism.md#L209) (line 209, col 3, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L131](agent-tasks-persistence-migration-to-dualstore.md#L131) (line 131, col 1, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L131](agent-tasks-persistence-migration-to-dualstore.md#L131) (line 131, col 3, score 1)
- [Cross-Target Macro System in Sibilant — L175](cross-target-macro-system-in-sibilant.md#L175) (line 175, col 1, score 1)
- [Cross-Target Macro System in Sibilant — L175](cross-target-macro-system-in-sibilant.md#L175) (line 175, col 3, score 1)
- [Dynamic Context Model for Web Components — L392](dynamic-context-model-for-web-components.md#L392) (line 392, col 1, score 1)
- [Dynamic Context Model for Web Components — L392](dynamic-context-model-for-web-components.md#L392) (line 392, col 3, score 1)
- [js-to-lisp-reverse-compiler — L414](js-to-lisp-reverse-compiler.md#L414) (line 414, col 1, score 1)
- [js-to-lisp-reverse-compiler — L414](js-to-lisp-reverse-compiler.md#L414) (line 414, col 3, score 1)
- [Agent Reflections and Prompt Evolution — L138](agent-reflections-and-prompt-evolution.md#L138) (line 138, col 1, score 1)
- [Agent Reflections and Prompt Evolution — L138](agent-reflections-and-prompt-evolution.md#L138) (line 138, col 3, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L110](canonical-org-babel-matplotlib-animation-template.md#L110) (line 110, col 1, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L110](canonical-org-babel-matplotlib-animation-template.md#L110) (line 110, col 3, score 1)
- [ecs-scheduler-and-prefabs — L389](ecs-scheduler-and-prefabs.md#L389) (line 389, col 1, score 1)
- [ecs-scheduler-and-prefabs — L389](ecs-scheduler-and-prefabs.md#L389) (line 389, col 3, score 1)
- [Promethean Event Bus MVP v0.1 — L884](promethean-event-bus-mvp-v0-1.md#L884) (line 884, col 1, score 1)
- [Promethean Event Bus MVP v0.1 — L884](promethean-event-bus-mvp-v0-1.md#L884) (line 884, col 3, score 1)
- [archetype-ecs — L454](archetype-ecs.md#L454) (line 454, col 1, score 1)
- [archetype-ecs — L454](archetype-ecs.md#L454) (line 454, col 3, score 1)
- [JavaScript — L14](chunks/javascript.md#L14) (line 14, col 1, score 1)
- [JavaScript — L14](chunks/javascript.md#L14) (line 14, col 3, score 1)
- [ecs-offload-workers — L454](ecs-offload-workers.md#L454) (line 454, col 1, score 1)
- [ecs-offload-workers — L454](ecs-offload-workers.md#L454) (line 454, col 3, score 1)
- [eidolon-field-math-foundations — L128](eidolon-field-math-foundations.md#L128) (line 128, col 1, score 1)
- [eidolon-field-math-foundations — L128](eidolon-field-math-foundations.md#L128) (line 128, col 3, score 1)
- [Cross-Language Runtime Polymorphism — L201](cross-language-runtime-polymorphism.md#L201) (line 201, col 1, score 1)
- [Cross-Language Runtime Polymorphism — L201](cross-language-runtime-polymorphism.md#L201) (line 201, col 3, score 1)
- [Cross-Target Macro System in Sibilant — L178](cross-target-macro-system-in-sibilant.md#L178) (line 178, col 1, score 1)
- [Cross-Target Macro System in Sibilant — L178](cross-target-macro-system-in-sibilant.md#L178) (line 178, col 3, score 1)
- [EidolonField — L251](eidolonfield.md#L251) (line 251, col 1, score 1)
- [EidolonField — L251](eidolonfield.md#L251) (line 251, col 3, score 1)
- [field-interaction-equations — L159](field-interaction-equations.md#L159) (line 159, col 1, score 1)
- [field-interaction-equations — L159](field-interaction-equations.md#L159) (line 159, col 3, score 1)
- [eidolon-field-math-foundations — L133](eidolon-field-math-foundations.md#L133) (line 133, col 1, score 1)
- [eidolon-field-math-foundations — L133](eidolon-field-math-foundations.md#L133) (line 133, col 3, score 1)
- [Migrate to Provider-Tenant Architecture — L266](migrate-to-provider-tenant-architecture.md#L266) (line 266, col 1, score 1)
- [Migrate to Provider-Tenant Architecture — L266](migrate-to-provider-tenant-architecture.md#L266) (line 266, col 3, score 1)
- [Per-Domain Policy System for JS Crawler — L472](per-domain-policy-system-for-js-crawler.md#L472) (line 472, col 1, score 1)
- [Per-Domain Policy System for JS Crawler — L472](per-domain-policy-system-for-js-crawler.md#L472) (line 472, col 3, score 1)
- [prom-lib-rate-limiters-and-replay-api — L390](prom-lib-rate-limiters-and-replay-api.md#L390) (line 390, col 1, score 1)
- [prom-lib-rate-limiters-and-replay-api — L390](prom-lib-rate-limiters-and-replay-api.md#L390) (line 390, col 3, score 1)
- [i3-bluetooth-setup — L105](i3-bluetooth-setup.md#L105) (line 105, col 1, score 1)
- [i3-bluetooth-setup — L105](i3-bluetooth-setup.md#L105) (line 105, col 3, score 1)
- [Migrate to Provider-Tenant Architecture — L282](migrate-to-provider-tenant-architecture.md#L282) (line 282, col 1, score 1)
- [Migrate to Provider-Tenant Architecture — L282](migrate-to-provider-tenant-architecture.md#L282) (line 282, col 3, score 1)
- [polymorphic-meta-programming-engine — L206](polymorphic-meta-programming-engine.md#L206) (line 206, col 1, score 1)
- [polymorphic-meta-programming-engine — L206](polymorphic-meta-programming-engine.md#L206) (line 206, col 3, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L137](agent-tasks-persistence-migration-to-dualstore.md#L137) (line 137, col 1, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L137](agent-tasks-persistence-migration-to-dualstore.md#L137) (line 137, col 3, score 1)
- [Event Bus MVP — L547](event-bus-mvp.md#L547) (line 547, col 1, score 1)
- [Event Bus MVP — L547](event-bus-mvp.md#L547) (line 547, col 3, score 1)
- [Event Bus Projections Architecture — L150](event-bus-projections-architecture.md#L150) (line 150, col 1, score 1)
- [Event Bus Projections Architecture — L150](event-bus-projections-architecture.md#L150) (line 150, col 3, score 1)
- [Fnord Tracer Protocol — L244](fnord-tracer-protocol.md#L244) (line 244, col 1, score 1)
- [Fnord Tracer Protocol — L244](fnord-tracer-protocol.md#L244) (line 244, col 3, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L158](agent-tasks-persistence-migration-to-dualstore.md#L158) (line 158, col 1, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L158](agent-tasks-persistence-migration-to-dualstore.md#L158) (line 158, col 3, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L141](agent-tasks-persistence-migration-to-dualstore.md#L141) (line 141, col 1, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L141](agent-tasks-persistence-migration-to-dualstore.md#L141) (line 141, col 3, score 1)
- [Voice Access Layer Design — L331](voice-access-layer-design.md#L331) (line 331, col 1, score 1)
- [Voice Access Layer Design — L331](voice-access-layer-design.md#L331) (line 331, col 3, score 1)
- [Per-Domain Policy System for JS Crawler — L483](per-domain-policy-system-for-js-crawler.md#L483) (line 483, col 1, score 1)
- [Per-Domain Policy System for JS Crawler — L483](per-domain-policy-system-for-js-crawler.md#L483) (line 483, col 3, score 1)
- [Promethean Agent Config DSL — L321](promethean-agent-config-dsl.md#L321) (line 321, col 1, score 1)
- [Promethean Agent Config DSL — L321](promethean-agent-config-dsl.md#L321) (line 321, col 3, score 1)
- [Per-Domain Policy System for JS Crawler — L481](per-domain-policy-system-for-js-crawler.md#L481) (line 481, col 1, score 1)
- [Per-Domain Policy System for JS Crawler — L481](per-domain-policy-system-for-js-crawler.md#L481) (line 481, col 3, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L145](agent-tasks-persistence-migration-to-dualstore.md#L145) (line 145, col 1, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L145](agent-tasks-persistence-migration-to-dualstore.md#L145) (line 145, col 3, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L159](agent-tasks-persistence-migration-to-dualstore.md#L159) (line 159, col 1, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L159](agent-tasks-persistence-migration-to-dualstore.md#L159) (line 159, col 3, score 1)
- [Sibilant Meta-Prompt DSL — L214](sibilant-meta-prompt-dsl.md#L214) (line 214, col 1, score 1)
- [Sibilant Meta-Prompt DSL — L214](sibilant-meta-prompt-dsl.md#L214) (line 214, col 3, score 1)
- [Promethean-native config design — L403](promethean-native-config-design.md#L403) (line 403, col 1, score 1)
- [Promethean-native config design — L403](promethean-native-config-design.md#L403) (line 403, col 3, score 1)
- [Per-Domain Policy System for JS Crawler — L479](per-domain-policy-system-for-js-crawler.md#L479) (line 479, col 1, score 1)
- [Per-Domain Policy System for JS Crawler — L479](per-domain-policy-system-for-js-crawler.md#L479) (line 479, col 3, score 1)
- [Sibilant Meta-Prompt DSL — L215](sibilant-meta-prompt-dsl.md#L215) (line 215, col 1, score 1)
- [Sibilant Meta-Prompt DSL — L215](sibilant-meta-prompt-dsl.md#L215) (line 215, col 3, score 1)
- [Promethean-native config design — L404](promethean-native-config-design.md#L404) (line 404, col 1, score 1)
- [Promethean-native config design — L404](promethean-native-config-design.md#L404) (line 404, col 3, score 1)
- [Per-Domain Policy System for JS Crawler — L480](per-domain-policy-system-for-js-crawler.md#L480) (line 480, col 1, score 1)
- [Per-Domain Policy System for JS Crawler — L480](per-domain-policy-system-for-js-crawler.md#L480) (line 480, col 3, score 1)
- [Migrate to Provider-Tenant Architecture — L299](migrate-to-provider-tenant-architecture.md#L299) (line 299, col 1, score 1)
- [Migrate to Provider-Tenant Architecture — L299](migrate-to-provider-tenant-architecture.md#L299) (line 299, col 3, score 1)
- [Migrate to Provider-Tenant Architecture — L300](migrate-to-provider-tenant-architecture.md#L300) (line 300, col 1, score 0.99)
- [Migrate to Provider-Tenant Architecture — L300](migrate-to-provider-tenant-architecture.md#L300) (line 300, col 3, score 0.99)
- [polyglot-repl-interface-layer — L170](polyglot-repl-interface-layer.md#L170) (line 170, col 1, score 0.99)
- [polyglot-repl-interface-layer — L170](polyglot-repl-interface-layer.md#L170) (line 170, col 3, score 0.99)
- [sibilant-meta-string-templating-runtime — L132](sibilant-meta-string-templating-runtime.md#L132) (line 132, col 1, score 0.99)
- [sibilant-meta-string-templating-runtime — L132](sibilant-meta-string-templating-runtime.md#L132) (line 132, col 3, score 0.99)
- [Sibilant Meta-Prompt DSL — L205](sibilant-meta-prompt-dsl.md#L205) (line 205, col 1, score 1)
- [Sibilant Meta-Prompt DSL — L205](sibilant-meta-prompt-dsl.md#L205) (line 205, col 3, score 1)
- [Model Selection for Lightweight Conversational Tasks — L143](model-selection-for-lightweight-conversational-tasks.md#L143) (line 143, col 1, score 1)
- [Model Selection for Lightweight Conversational Tasks — L143](model-selection-for-lightweight-conversational-tasks.md#L143) (line 143, col 3, score 1)
- [Dynamic Context Model for Web Components — L408](dynamic-context-model-for-web-components.md#L408) (line 408, col 1, score 0.99)
- [Dynamic Context Model for Web Components — L408](dynamic-context-model-for-web-components.md#L408) (line 408, col 3, score 0.99)
- [Model Selection for Lightweight Conversational Tasks — L144](model-selection-for-lightweight-conversational-tasks.md#L144) (line 144, col 1, score 0.99)
- [Model Selection for Lightweight Conversational Tasks — L144](model-selection-for-lightweight-conversational-tasks.md#L144) (line 144, col 3, score 0.99)
- [Sibilant Meta-Prompt DSL — L206](sibilant-meta-prompt-dsl.md#L206) (line 206, col 1, score 1)
- [Sibilant Meta-Prompt DSL — L206](sibilant-meta-prompt-dsl.md#L206) (line 206, col 3, score 1)
- [Dynamic Context Model for Web Components — L409](dynamic-context-model-for-web-components.md#L409) (line 409, col 1, score 0.99)
- [Dynamic Context Model for Web Components — L409](dynamic-context-model-for-web-components.md#L409) (line 409, col 3, score 0.99)
- [Sibilant Meta-Prompt DSL — L207](sibilant-meta-prompt-dsl.md#L207) (line 207, col 1, score 1)
- [Sibilant Meta-Prompt DSL — L207](sibilant-meta-prompt-dsl.md#L207) (line 207, col 3, score 1)
- [Sibilant Meta-Prompt DSL — L208](sibilant-meta-prompt-dsl.md#L208) (line 208, col 1, score 1)
- [Sibilant Meta-Prompt DSL — L208](sibilant-meta-prompt-dsl.md#L208) (line 208, col 3, score 1)
- [Promethean Agent Config DSL — L326](promethean-agent-config-dsl.md#L326) (line 326, col 1, score 0.99)
- [Promethean Agent Config DSL — L326](promethean-agent-config-dsl.md#L326) (line 326, col 3, score 0.99)
- [Promethean-native config design — L395](promethean-native-config-design.md#L395) (line 395, col 1, score 0.99)
- [Promethean-native config design — L395](promethean-native-config-design.md#L395) (line 395, col 3, score 0.99)
- [Promethean Agent Config DSL — L327](promethean-agent-config-dsl.md#L327) (line 327, col 1, score 0.99)
- [Promethean Agent Config DSL — L327](promethean-agent-config-dsl.md#L327) (line 327, col 3, score 0.99)
- [Voice Access Layer Design — L327](voice-access-layer-design.md#L327) (line 327, col 1, score 1)
- [Voice Access Layer Design — L327](voice-access-layer-design.md#L327) (line 327, col 3, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L154](agent-tasks-persistence-migration-to-dualstore.md#L154) (line 154, col 1, score 0.99)
- [Agent Tasks: Persistence Migration to DualStore — L154](agent-tasks-persistence-migration-to-dualstore.md#L154) (line 154, col 3, score 0.99)
- [Agent Tasks: Persistence Migration to DualStore — L156](agent-tasks-persistence-migration-to-dualstore.md#L156) (line 156, col 1, score 0.99)
- [Agent Tasks: Persistence Migration to DualStore — L156](agent-tasks-persistence-migration-to-dualstore.md#L156) (line 156, col 3, score 0.99)
- [Agent Tasks: Persistence Migration to DualStore — L155](agent-tasks-persistence-migration-to-dualstore.md#L155) (line 155, col 1, score 0.99)
- [Agent Tasks: Persistence Migration to DualStore — L155](agent-tasks-persistence-migration-to-dualstore.md#L155) (line 155, col 3, score 0.99)
- [Agent Tasks: Persistence Migration to DualStore — L157](agent-tasks-persistence-migration-to-dualstore.md#L157) (line 157, col 1, score 0.99)
- [Agent Tasks: Persistence Migration to DualStore — L157](agent-tasks-persistence-migration-to-dualstore.md#L157) (line 157, col 3, score 0.99)
- [Promethean Event Bus MVP v0.1 — L904](promethean-event-bus-mvp-v0-1.md#L904) (line 904, col 1, score 0.99)
- [Promethean Event Bus MVP v0.1 — L904](promethean-event-bus-mvp-v0-1.md#L904) (line 904, col 3, score 0.99)
- [Promethean Event Bus MVP v0.1 — L906](promethean-event-bus-mvp-v0-1.md#L906) (line 906, col 1, score 0.99)
- [Promethean Event Bus MVP v0.1 — L906](promethean-event-bus-mvp-v0-1.md#L906) (line 906, col 3, score 0.99)
- [Event Bus MVP — L559](event-bus-mvp.md#L559) (line 559, col 1, score 0.98)
- [Event Bus MVP — L559](event-bus-mvp.md#L559) (line 559, col 3, score 0.98)
- [Event Bus MVP — L558](event-bus-mvp.md#L558) (line 558, col 1, score 0.98)
- [Event Bus MVP — L558](event-bus-mvp.md#L558) (line 558, col 3, score 0.98)
- [ecs-scheduler-and-prefabs — L410](ecs-scheduler-and-prefabs.md#L410) (line 410, col 1, score 0.99)
- [ecs-scheduler-and-prefabs — L410](ecs-scheduler-and-prefabs.md#L410) (line 410, col 3, score 0.99)
- [System Scheduler with Resource-Aware DAG — L402](system-scheduler-with-resource-aware-dag.md#L402) (line 402, col 1, score 0.99)
- [System Scheduler with Resource-Aware DAG — L402](system-scheduler-with-resource-aware-dag.md#L402) (line 402, col 3, score 0.99)
- [Promethean Event Bus MVP v0.1 — L899](promethean-event-bus-mvp-v0-1.md#L899) (line 899, col 1, score 0.98)
- [Promethean Event Bus MVP v0.1 — L899](promethean-event-bus-mvp-v0-1.md#L899) (line 899, col 3, score 0.98)
- [ecs-scheduler-and-prefabs — L413](ecs-scheduler-and-prefabs.md#L413) (line 413, col 1, score 0.98)
- [ecs-scheduler-and-prefabs — L413](ecs-scheduler-and-prefabs.md#L413) (line 413, col 3, score 0.98)
- [ecs-scheduler-and-prefabs — L411](ecs-scheduler-and-prefabs.md#L411) (line 411, col 1, score 0.99)
- [ecs-scheduler-and-prefabs — L411](ecs-scheduler-and-prefabs.md#L411) (line 411, col 3, score 0.99)
- [System Scheduler with Resource-Aware DAG — L403](system-scheduler-with-resource-aware-dag.md#L403) (line 403, col 1, score 0.99)
- [System Scheduler with Resource-Aware DAG — L403](system-scheduler-with-resource-aware-dag.md#L403) (line 403, col 3, score 0.99)
- [Promethean Event Bus MVP v0.1 — L900](promethean-event-bus-mvp-v0-1.md#L900) (line 900, col 1, score 0.98)
- [Promethean Event Bus MVP v0.1 — L900](promethean-event-bus-mvp-v0-1.md#L900) (line 900, col 3, score 0.98)
- [ecs-scheduler-and-prefabs — L412](ecs-scheduler-and-prefabs.md#L412) (line 412, col 1, score 0.99)
- [ecs-scheduler-and-prefabs — L412](ecs-scheduler-and-prefabs.md#L412) (line 412, col 3, score 0.99)
- [System Scheduler with Resource-Aware DAG — L404](system-scheduler-with-resource-aware-dag.md#L404) (line 404, col 1, score 0.99)
- [System Scheduler with Resource-Aware DAG — L404](system-scheduler-with-resource-aware-dag.md#L404) (line 404, col 3, score 0.99)
- [System Scheduler with Resource-Aware DAG — L405](system-scheduler-with-resource-aware-dag.md#L405) (line 405, col 1, score 0.99)
- [System Scheduler with Resource-Aware DAG — L405](system-scheduler-with-resource-aware-dag.md#L405) (line 405, col 3, score 0.99)
- [ecs-scheduler-and-prefabs — L414](ecs-scheduler-and-prefabs.md#L414) (line 414, col 1, score 0.99)
- [ecs-scheduler-and-prefabs — L414](ecs-scheduler-and-prefabs.md#L414) (line 414, col 3, score 0.99)
- [System Scheduler with Resource-Aware DAG — L406](system-scheduler-with-resource-aware-dag.md#L406) (line 406, col 1, score 0.99)
- [System Scheduler with Resource-Aware DAG — L406](system-scheduler-with-resource-aware-dag.md#L406) (line 406, col 3, score 0.99)
- [Agent Reflections and Prompt Evolution — L141](agent-reflections-and-prompt-evolution.md#L141) (line 141, col 1, score 0.99)
- [Agent Reflections and Prompt Evolution — L141](agent-reflections-and-prompt-evolution.md#L141) (line 141, col 3, score 0.99)
- [ecs-scheduler-and-prefabs — L415](ecs-scheduler-and-prefabs.md#L415) (line 415, col 1, score 0.99)
- [ecs-scheduler-and-prefabs — L415](ecs-scheduler-and-prefabs.md#L415) (line 415, col 3, score 0.99)
- [System Scheduler with Resource-Aware DAG — L407](system-scheduler-with-resource-aware-dag.md#L407) (line 407, col 1, score 0.99)
- [System Scheduler with Resource-Aware DAG — L407](system-scheduler-with-resource-aware-dag.md#L407) (line 407, col 3, score 0.99)
- [ecs-scheduler-and-prefabs — L416](ecs-scheduler-and-prefabs.md#L416) (line 416, col 1, score 0.99)
- [ecs-scheduler-and-prefabs — L416](ecs-scheduler-and-prefabs.md#L416) (line 416, col 3, score 0.99)
- [System Scheduler with Resource-Aware DAG — L408](system-scheduler-with-resource-aware-dag.md#L408) (line 408, col 1, score 0.99)
- [System Scheduler with Resource-Aware DAG — L408](system-scheduler-with-resource-aware-dag.md#L408) (line 408, col 3, score 0.99)
- [Prompt_Folder_Bootstrap — L193](prompt-folder-bootstrap.md#L193) (line 193, col 1, score 0.99)
- [Prompt_Folder_Bootstrap — L193](prompt-folder-bootstrap.md#L193) (line 193, col 3, score 0.99)
- [System Scheduler with Resource-Aware DAG — L409](system-scheduler-with-resource-aware-dag.md#L409) (line 409, col 1, score 0.99)
- [System Scheduler with Resource-Aware DAG — L409](system-scheduler-with-resource-aware-dag.md#L409) (line 409, col 3, score 0.99)
- [eidolon-field-math-foundations — L154](eidolon-field-math-foundations.md#L154) (line 154, col 1, score 0.98)
- [eidolon-field-math-foundations — L154](eidolon-field-math-foundations.md#L154) (line 154, col 3, score 0.98)
- [Promethean Infrastructure Setup — L609](promethean-infrastructure-setup.md#L609) (line 609, col 1, score 0.98)
- [Promethean Infrastructure Setup — L609](promethean-infrastructure-setup.md#L609) (line 609, col 3, score 0.98)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
