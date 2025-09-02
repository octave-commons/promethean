---
uuid: 8b256935-02f6-4da2-a406-bf6b8415276f
created_at: 2025.09.01.12.45.29.md
filename: Chroma-Embedding-Refactor
description: >-
  Refactored embedding pipeline to use Chroma for vector storage without writing
  embeddings to JSON, minimizing churn while maintaining backward compatibility
  with existing chunk structures.
tags:
  - Chroma
  - embedding
  - refactor
  - streaming
  - JSON
  - backwards-compatible
related_to_uuid:
  - bc5172ca-7a09-42ad-b418-8e42bb14d089
  - 1cfae310-35dc-49c2-98f1-b186da25d84b
  - f8877e5e-1e4f-4478-93cd-a0bf86d26a41
  - 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
  - 31f0166e-4631-45fa-aecd-b44e9a13f497
  - c710dc93-9fec-471b-bdee-bedbd360c67f
  - b4e64f8c-4dc9-4941-a877-646c5ada068e
  - ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
  - 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
  - 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
  - ab748541-020e-4a7e-b07d-28173bd5bea2
  - cbfe3513-6a4a-4d2e-915d-ddfab583b2de
  - fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
  - 23e221e9-d4fa-4106-8458-06db2595085f
  - b01856b4-999f-418d-8009-ade49b00eb0f
  - c14edce7-0656-45b2-aaf3-51f042451b7d
  - d28090ac-f746-4958-aab5-ed1315382c04
  - 49d1e1e5-5d13-4955-8f6f-7676434ec462
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - ad7f1ed3-c9bf-4e85-9eeb-6cc4b53155f3
  - e1056831-ae0c-460b-95fa-4cf09b3398c6
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - 21d5cc09-b005-4ede-8f69-00b4b0794540
  - 8b8e6103-30a4-4d66-b5f2-87db1612b587
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - 2c00ce45-08cf-4b81-9883-6157f30b7fae
  - d2b3628c-6cad-4664-8551-94ef8280851d
  - 7bed0b9a-8b22-4b1f-be81-054a179453cb
  - d41a06d1-613e-4440-80b7-4553fc694285
  - bb7f0835-c347-474f-bfad-eabd873b51ad
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - 45cd25b5-ed36-49ab-82c8-10d0903e34db
  - 75ea4a6a-8270-488d-9d37-799c288e5f70
  - 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
  - fc21f824-4244-4030-a48e-c4170160ea1d
  - 5e408692-0e74-400e-a617-84247c7353ad
  - c5fba0a0-9196-468d-a0f3-51c99e987263
  - d771154e-a7ef-44ca-b69c-a1626cf94fbf
  - 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
  - 40e05c14-0db0-44c5-bf0a-2eece2f4c2a4
  - d527c05d-22e8-4493-8f29-ae3cb67f035b
  - 51932e7b-4237-4756-bcae-8be6d535d0d1
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - 66a72fc3-4153-41fc-84bd-d6164967a6ff
  - c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - dd89372d-10de-42a9-8c96-6bc13ea36d02
  - 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
  - ba244286-4e84-425b-8bf6-b80c4eb783fc
  - 36c8882a-badc-4e18-838d-2c54d7038141
  - cdfac40c-00e4-458f-96a7-4c37d0278731
  - e811123d-5841-4e52-bf8c-978f26db4230
  - af5d2824-faad-476c-a389-e912d9bc672c
  - 8430617b-80a2-4cc9-8288-9a74cb57990b
  - 6620e2f2-de6d-45d8-a722-5d26e160b370
  - 37b5d236-2b3e-4a95-a4e8-31655c3023ef
  - 291c7d91-da8c-486c-9bc0-bd2254536e2d
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - a4a25141-6380-40b9-9cd7-b554b246b303
  - 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
  - 71726f04-eb1c-42a5-a5fe-d8209de6e159
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - dd00677a-2280-45a7-91af-0728b21af3ad
  - aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
  - 871490c7-a050-429b-88b2-55dfeaa1f8d5
  - 80d4d883-59f9-401b-8699-7a2723148b1e
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - babdb9eb-3b15-48a7-8a22-ecc53af7d397
  - 61d4086b-4adf-4e94-95e4-95a249cd1b53
  - 513dc4c7-e045-4123-ba2e-cf5ef0b7b4a3
  - 5158f742-4a3b-466e-bfc3-d83517b64200
  - 9044701b-03c9-4a30-92c4-46b1bd66c11e
  - b6ae7dfa-0c53-4eb9-aea8-65072b825bee
  - 6b63edca-7637-4fb0-bc85-d498c31cc46e
  - 7b7ca860-780c-44fa-8d3f-be8bd9496fba
  - 03a5578f-d689-45db-95e9-11300e5eee6f
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 59b5670f-36d3-4d34-8985-f3144b15347a
  - 1b1338fc-bb4d-41df-828f-e219cc9442eb
  - b51e19b4-1326-4311-9798-33e972bf626c
  - d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
  - ae24a280-678e-4c0b-8cc4-56667fa04172
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 6bcff92c-4224-453d-9993-1be8d37d47c3
  - d144aa62-348c-4e5d-ae8f-38084c67ceca
  - 64a9f9f9-58ee-4996-bdaf-9373845c6b29
  - cfee6d36-b9f5-4587-885a-cdfddb4f054e
  - c34c36a6-80c9-4b44-a200-6448543b1b33
  - 2901a3e9-96f0-497c-ae2c-775f28a702dd
  - 9a93a756-6d33-45d1-aca9-51b74f2b33d2
  - b362e12e-2802-4e41-9a21-6e0c7ad419a2
  - 58191024-d04a-4520-8aae-a18be7b94263
  - cf6b9b17-bb91-4219-aa5c-172cba02b2da
  - 4127189a-e0ab-436f-8571-cc852b8e9add
  - 2aafc801-c3e1-4e4f-999d-adb52af3fc41
  - 62bec6f0-4e13-4f38-aca4-72c84ba02367
  - d17d3a96-c84d-4738-a403-6c733b874da2
  - 4330e8f0-5f46-4235-918b-39b6b93fa561
  - 18344cf9-0c49-4a71-b6c8-b8d84d660fca
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - e979c50f-69bb-48b0-8417-e1ee1b31c0c0
  - 5c152b08-6b69-4bb8-a1a7-66745789c169
  - 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
  - 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
  - 54382370-1931-4a19-a634-46735708a9ea
  - 41ce0216-f8cc-4eed-8d9a-fcc25be21425
  - 6cb4943e-8267-4e27-8618-2ce0a464d173
  - c03020e1-e3e7-48bf-aa7e-aa740c601b63
  - cfbdca2f-5ee8-4cad-a75e-0e017e8d9b77
  - 0f6f8f38-98d0-438f-9601-58f478acc0b7
  - 13951643-1741-46bb-89dc-1beebb122633
  - 18138627-a348-4fbb-b447-410dfb400564
  - 687439f9-ad1e-40a4-8a32-3a1b4ac7c017
  - 2facccf8-69cf-4a7d-b24b-de966ec70283
  - 15d25922-0de6-414f-b7d1-e50e2a57b33a
  - 86a691ec-ca1f-4350-824c-0ded1f8ebe70
related_to_title:
  - Promethean Web UI Setup
  - Functional Refactor of TypeScript Document Processing
  - template-based-compilation
  - State Snapshots API and Transactional Projector
  - i3-layout-saver
  - 2d-sandbox-field
  - observability-infrastructure-setup
  - markdown-to-org-transpiler
  - Promethean Full-Stack Docker Setup
  - Voice Access Layer Design
  - Promethean-native config design
  - Lispy Macros with syntax-rules
  - Promethean Event Bus MVP v0.1
  - heartbeat-simulation-snippets
  - Universal Lisp Interface
  - universal-intention-code-fabric
  - i3-config-validation-methods
  - EidolonField
  - Local-Only-LLM-Workflow
  - Local-Offline-Model-Deployment-Strategy
  - RAG UI Panel with Qdrant and PostgREST
  - Cross-Target Macro System in Sibilant
  - compiler-kit-foundations
  - Exception Layer Analysis
  - Promethean Pipelines
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - Promethean Agent Config DSL
  - Language-Agnostic Mirror System
  - polymorphic-meta-programming-engine
  - prompt-programming-language-lisp
  - Agent Reflections and Prompt Evolution
  - 'Agent Tasks: Persistence Migration to DualStore'
  - Chroma Toolkit Consolidation Plan
  - Diagrams
  - Services
  - eidolon-node-lifecycle
  - Fnord Tracer Protocol
  - i3-bluetooth-setup
  - set-assignment-in-lisp-ast
  - Vectorial Exception Descent
  - Event Bus MVP
  - Eidolon-Field-Optimization
  - Pure-Node Crawl Stack with Playwright and Crawlee
  - pm2-orchestration-patterns
  - ecs-offload-workers
  - Shared Package Structure
  - lisp-dsl-for-window-management
  - ecs-scheduler-and-prefabs
  - komorebi-group-window-hack
  - Mongo Outbox Implementation
  - System Scheduler with Resource-Aware DAG
  - shared-package-layout-clarification
  - Interop and Source Maps
  - WebSocket Gateway Implementation
  - Sibilant Meta-Prompt DSL
  - ripple-propagation-demo
  - graph-ds
  - homeostasis-decay-formulas
  - Ice Box Reorganization
  - Eidolon Field Abstract Model
  - Functional Embedding Pipeline Refactor
  - Debugging Broker Connections and Agent Behavior
  - Duck's Self-Referential Perceptual Loop
  - field-node-diagram-outline
  - heartbeat-fragment-demo
  - prom-lib-rate-limiters-and-replay-api
  - Local-First Intention→Code Loop with Free Models
  - Refactor 05-footers.ts
  - archetype-ecs
  - Recursive Prompt Construction Engine
  - sibilant-metacompiler-overview
  - mystery-lisp-search-session
  - Promethean Agent DSL TS Scaffold
  - file-watcher-auth-fix
  - Ghostly Smoke Interference
  - 'Promethean Pipelines: Local TypeScript-First Workflow'
  - TypeScript Patch for Tool Calling Support
  - Promethean Dev Workflow Update
  - Dynamic Context Model for Web Components
  - Reawakening Duck
  - Canonical Org-Babel Matplotlib Animation Template
  - promethean-system-diagrams
  - schema-evolution-workflow
  - Promethean-Copilot-Intent-Engine
  - eidolon-field-math-foundations
  - Post-Linguistic Transhuman Design Frameworks
  - Model Selection for Lightweight Conversational Tasks
  - Layer1SurvivabilityEnvelope
  - Lisp-Compiler-Integration
  - Cross-Language Runtime Polymorphism
  - Admin Dashboard for User Management
  - Protocol_0_The_Contradiction_Engine
  - Ollama-LLM-Provider-for-Pseudo-Code-Transpiler
  - js-to-lisp-reverse-compiler
  - Event Bus Projections Architecture
  - layer-1-uptime-diagrams
  - sibilant-meta-string-templating-runtime
  - zero-copy-snapshots-and-workers
  - Pure TypeScript Search Microservice
  - Stateful Partitions and Rebalancing
  - Promethean Chat Activity Report
  - Unique Info Dump Index
  - DuckDuckGoSearchPipeline
  - OpenAPI Validation Report
  - Optimizing Command Limitations in System Design
  - Promethean Data Sync Protocol
  - Migrate to Provider-Tenant Architecture
  - refactor-relations
  - Tooling
  - Per-Domain Policy System for JS Crawler
  - Refactor Frontmatter Processing
  - windows-tiling-with-autohotkey
  - Duck's Attractor States
  - The Jar of Echoes
  - Matplotlib Animation with Async Execution
  - smart-chatgpt-thingy
  - run-step-api
  - Mathematical Samplers
references:
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 498
    col: 0
    score: 0.89
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 968
    col: 0
    score: 0.89
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 762
    col: 0
    score: 0.89
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 459
    col: 0
    score: 0.89
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 423
    col: 0
    score: 0.89
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 465
    col: 0
    score: 0.89
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 1025
    col: 0
    score: 0.89
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 683
    col: 0
    score: 0.89
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 8
    col: 0
    score: 0.85
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 84
    col: 0
    score: 0.86
  - uuid: b01856b4-999f-418d-8009-ade49b00eb0f
    line: 137
    col: 0
    score: 0.88
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 195
    col: 0
    score: 0.88
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 68
    col: 0
    score: 0.87
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 318
    col: 0
    score: 0.87
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 64
    col: 0
    score: 0.87
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 417
    col: 0
    score: 0.86
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 35
    col: 0
    score: 0.87
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 366
    col: 0
    score: 0.85
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 441
    col: 0
    score: 0.85
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 88
    col: 0
    score: 0.86
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 104
    col: 0
    score: 0.86
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 33
    col: 0
    score: 0.86
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 296
    col: 0
    score: 0.86
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 101
    col: 0
    score: 0.87
  - uuid: b01856b4-999f-418d-8009-ade49b00eb0f
    line: 117
    col: 0
    score: 0.85
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 5
    col: 0
    score: 0.93
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 349
    col: 0
    score: 0.86
  - uuid: 49d1e1e5-5d13-4955-8f6f-7676434ec462
    line: 205
    col: 0
    score: 0.91
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 80
    col: 0
    score: 0.89
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 972
    col: 0
    score: 0.9
  - uuid: 31f0166e-4631-45fa-aecd-b44e9a13f497
    line: 79
    col: 0
    score: 0.86
  - uuid: 2c00ce45-08cf-4b81-9883-6157f30b7fae
    line: 279
    col: 0
    score: 0.87
  - uuid: d28090ac-f746-4958-aab5-ed1315382c04
    line: 28
    col: 0
    score: 0.91
  - uuid: 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
    line: 303
    col: 0
    score: 0.86
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 374
    col: 0
    score: 0.87
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 306
    col: 0
    score: 0.86
  - uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
    line: 148
    col: 0
    score: 0.87
  - uuid: c14edce7-0656-45b2-aaf3-51f042451b7d
    line: 388
    col: 0
    score: 0.87
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 280
    col: 0
    score: 0.93
  - uuid: 6b63edca-7637-4fb0-bc85-d498c31cc46e
    line: 220
    col: 0
    score: 0.86
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 305
    col: 0
    score: 0.86
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 630
    col: 0
    score: 0.87
  - uuid: ad7f1ed3-c9bf-4e85-9eeb-6cc4b53155f3
    line: 232
    col: 0
    score: 0.9
  - uuid: 7bed0b9a-8b22-4b1f-be81-054a179453cb
    line: 190
    col: 0
    score: 0.86
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 524
    col: 0
    score: 0.88
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 427
    col: 0
    score: 0.88
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 416
    col: 0
    score: 0.9
  - uuid: 5158f742-4a3b-466e-bfc3-d83517b64200
    line: 818
    col: 0
    score: 0.85
  - uuid: 9044701b-03c9-4a30-92c4-46b1bd66c11e
    line: 32
    col: 0
    score: 0.85
  - uuid: babdb9eb-3b15-48a7-8a22-ecc53af7d397
    line: 147
    col: 0
    score: 0.87
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 120
    col: 0
    score: 0.87
  - uuid: b4e64f8c-4dc9-4941-a877-646c5ada068e
    line: 348
    col: 0
    score: 0.88
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 147
    col: 0
    score: 0.91
  - uuid: d527c05d-22e8-4493-8f29-ae3cb67f035b
    line: 400
    col: 0
    score: 0.86
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 609
    col: 0
    score: 0.86
  - uuid: 66a72fc3-4153-41fc-84bd-d6164967a6ff
    line: 185
    col: 0
    score: 0.88
  - uuid: d771154e-a7ef-44ca-b69c-a1626cf94fbf
    line: 95
    col: 0
    score: 0.88
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 497
    col: 0
    score: 0.86
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 375
    col: 0
    score: 0.85
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 148
    col: 0
    score: 0.88
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 2039
    col: 0
    score: 0.86
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 2790
    col: 0
    score: 0.86
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 279
    col: 0
    score: 0.85
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1287
    col: 0
    score: 0.85
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 715
    col: 0
    score: 0.85
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 427
    col: 0
    score: 0.85
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 3668
    col: 0
    score: 0.85
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 2510
    col: 0
    score: 0.85
  - uuid: 61d4086b-4adf-4e94-95e4-95a249cd1b53
    line: 52
    col: 0
    score: 0.87
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 504
    col: 0
    score: 0.89
  - uuid: 871490c7-a050-429b-88b2-55dfeaa1f8d5
    line: 105
    col: 0
    score: 0.87
  - uuid: d41a06d1-613e-4440-80b7-4553fc694285
    line: 56
    col: 0
    score: 0.89
  - uuid: 51932e7b-4237-4756-bcae-8be6d535d0d1
    line: 217
    col: 0
    score: 0.87
  - uuid: 80d4d883-59f9-401b-8699-7a2723148b1e
    line: 9
    col: 0
    score: 0.86
  - uuid: b01856b4-999f-418d-8009-ade49b00eb0f
    line: 187
    col: 0
    score: 0.88
  - uuid: 513dc4c7-e045-4123-ba2e-cf5ef0b7b4a3
    line: 106
    col: 0
    score: 0.87
  - uuid: b6ae7dfa-0c53-4eb9-aea8-65072b825bee
    line: 40
    col: 0
    score: 0.87
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 588
    col: 0
    score: 0.9
  - uuid: c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
    line: 185
    col: 0
    score: 0.88
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 490
    col: 0
    score: 0.86
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 367
    col: 0
    score: 0.87
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 537
    col: 0
    score: 0.87
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 360
    col: 0
    score: 0.87
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 906
    col: 0
    score: 0.87
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 231
    col: 0
    score: 0.87
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 815
    col: 0
    score: 0.87
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 707
    col: 0
    score: 0.87
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 930
    col: 0
    score: 0.87
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 586
    col: 0
    score: 0.87
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 893
    col: 0
    score: 0.87
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 510
    col: 0
    score: 0.87
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 587
    col: 0
    score: 0.87
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 440
    col: 0
    score: 0.87
  - uuid: f8877e5e-1e4f-4478-93cd-a0bf86d26a41
    line: 44
    col: 0
    score: 0.86
  - uuid: ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
    line: 272
    col: 0
    score: 0.88
  - uuid: 21d5cc09-b005-4ede-8f69-00b4b0794540
    line: 63
    col: 0
    score: 0.89
  - uuid: 40e05c14-0db0-44c5-bf0a-2eece2f4c2a4
    line: 50
    col: 0
    score: 0.88
  - uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
    line: 150
    col: 0
    score: 0.94
  - uuid: 36c8882a-badc-4e18-838d-2c54d7038141
    line: 161
    col: 0
    score: 0.87
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 376
    col: 0
    score: 0.88
---
You’re right—I shouldn’t have put giant `embedding: number[]` blobs on chunk objects at all if the target is **Chroma**. That was dumb. Here’s a **minimal-churn refactor** that: ^ref-8b256935-1-0

* streams work, ^ref-8b256935-3-0
* **writes zero vectors to JSON**, ^ref-8b256935-4-0
* uses **Chroma upsert** for embeddings, ^ref-8b256935-5-0
* **keeps `chunks.json` as a map `{ docUuid -> Chunk[] }`** so downstream code mostly survives, ^ref-8b256935-6-0
* and gives you a tiny **compat layer** for any old code that still expects `chunk.embedding`. ^ref-8b256935-7-0

Below are focused patches you can drop in. ^ref-8b256935-9-0

---

## 0) Install the JS client (local Chroma server)

```bash
pnpm add chromadb
# default local server is http://localhost:8000; override with CHROMA_URL
```
^ref-8b256935-15-0
 ^ref-8b256935-20-0
Chroma’s JS client exposes `client.getOrCreateCollection()` and `collection.upsert({ ids, embeddings, documents, metadatas })`. That’s exactly what we need. ([Chroma Docs][1])

---

## 1) Add a streaming JSON **object** writer (so `chunks.json` stays a map)
 ^ref-8b256935-26-0
`packages/docops/src/utils.ts` (additions):
 ^ref-8b256935-28-0
```typescript
import { createWriteStream, promises as fs } from "node:fs";
import { once } from "node:events";

// existing safeReplacer() from before…

export async function writeJSONObjectStream(
  outPath: string,
  entries: AsyncIterable<[string, unknown]> | Iterable<[string, unknown]>,
  replacer: (key: string, value: any) => any = safeReplacer()
) {
  const tmp = `${outPath}.tmp`;
  const out = createWriteStream(tmp, { flags: "w" });
  const write = async (s: string) => {
    if (!out.write(s)) await once(out, "drain");
  };

  await write("{");
  let first = true;
  for await (const [k, v] of entries as any) {
    const ks = JSON.stringify(k);
    const vs = JSON.stringify(v, replacer);
    await write(first ? `${ks}:${vs}` : `,${ks}:${vs}`);
    first = false;
  }
  await write("}");
  out.end();
  await once(out, "close");
  await fs.rename(tmp, outPath);
}
^ref-8b256935-28-0
```

---

## 2) New tiny Chroma adapter ^ref-8b256935-64-0

`packages/docops/src/chroma.ts`: ^ref-8b256935-66-0

```typescript
import { ChromaClient, type Collection } from "chromadb";

const CHROMA_URL = process.env.CHROMA_URL ?? "http://localhost:8000";

let _client: ChromaClient | null = null;
export function chromaClient() {
  _client ??= new ChromaClient({ path: CHROMA_URL });
  return _client!;
}

export async function getCollection(name: string, meta?: Record<string, any>): Promise<Collection> {
  const client = chromaClient();
  return client.getOrCreateCollection({ name, metadata: meta });
}

export async function upsertBatch(opts: {
  coll: Collection;
  ids: string[];
  embeddings: number[][];
  documents?: string[];
  metadatas?: Record<string, any>[];
}) {
  const { coll, ids, embeddings, documents, metadatas } = opts;
  if (!ids.length) return;
  await coll.upsert({ ids, embeddings, documents, metadatas });
^ref-8b256935-66-0
} ^ref-8b256935-95-0
```

(Chroma JS client and `upsert` behavior per docs. ([Chroma Docs][2]))

---
 ^ref-8b256935-101-0
## 3) Update your `02-embed.ts` to stream + push to Chroma (no vectors in JSON)

**Before** you were building `chunksByDoc` + `embedCache` with arrays. ^ref-8b256935-104-0
**After** we: ^ref-8b256935-105-0
 ^ref-8b256935-106-0
* keep `chunks.json` as `{ [uuid]: Chunk[] }` **without** `embedding`, ^ref-8b256935-107-0
* maintain a **fingerprint cache** (id → SHA256(text)) so we only re-embed changed chunks,
* batch-upsert embeddings to Chroma, ^ref-8b256935-109-0
* keep `docs-by-uuid.json` as-is.
 ^ref-8b256935-111-0
`packages/docops/src/02-embed.ts`:

```typescript
import { promises as fs } from "node:fs";
import * as path from "path";
import matter from "gray-matter";
import { createHash } from "node:crypto";
import {
  parseArgs,
  listFilesRec,
  readJSON,
  parseMarkdownChunks,
  writeJSONObjectStream, // NEW
} from "./utils";
import { getCollection, upsertBatch } from "./chroma"; // NEW
import type { Chunk, Front } from "./types";

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";

const args = parseArgs({
  "--dir": "docs/unique",
  "--ext": ".md,.mdx,.txt",
  "--embed-model": "nomic-embed-text:latest",
  "--collection": "docs", // NEW: default collection name
  "--batch": "128",       // NEW: upsert batch size
});

const ROOT = path.resolve(args["--dir"]);
const EXTS = new Set(args["--ext"].split(",").map((s) => s.trim().toLowerCase()));
const EMBED_MODEL = args["--embed-model"];
const BATCH = Math.max(1, Number(args["--batch"]) | 0) || 128;
const CACHE = path.join(process.cwd(), ".cache/docs-pipeline");
const CHUNK_CACHE = path.join(CACHE, "chunks.json");            // stays a map
const FINGERPRINTS = path.join(CACHE, "embeddings.fingerprint.json"); // id -> sha256(text)
const DOCS_MAP = path.join(CACHE, "docs-by-uuid.json");

function sha256(s: string) {
  return createHash("sha256").update(s).digest("hex");
}

async function ollamaEmbed(model: string, text: string): Promise<number[]> {
  const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt: text }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`ollama embeddings ${res.status}: ${body}`);
  }
  const data = await res.json();
  return data.embedding as number[];
}

type ChunksEntry = [uuid: string, chunks: Chunk[]];

async function* generateChunksAndUpsert(): AsyncIterable<ChunksEntry> {
  const files = await listFilesRec(ROOT, EXTS);
  const fingerprints: Record<string, string> = await readJSON(FINGERPRINTS, {});
  const docsByUuid: Record<string, { path: string; title: string }> = await readJSON(DOCS_MAP, {});

  const coll = await getCollection(args["--collection"], {
    embed_model: EMBED_MODEL,
    source: "docops",
  });

  let ids: string[] = [];
  let embs: number[][] = [];
  let docs: string[] = [];
  let metas: Record<string, any>[] = [];

  const flush = async () => {
    if (ids.length) {
      await upsertBatch({ coll, ids, embeddings: embs, documents: docs, metadatas: metas });
      ids = []; embs = []; docs = []; metas = [];
    }
  };

  for (const f of files) {
    const raw = await fs.readFile(f, "utf-8");
    const { data, content } = matter(raw);
    const fm = data as Front;
    if (!fm.uuid) continue;

    const title = fm.filename || path.parse(f).name;
    docsByUuid[fm.uuid] = { path: f, title };

    const chunks = parseMarkdownChunks(content).map((c, i) => ({
      ...c,
      id: `${fm.uuid}:${i}`,
      docUuid: fm.uuid!,
      docPath: f,
    })) as Chunk[];

    // upsert embeddings for changed/new chunks
    for (const ch of chunks) {
      const fp = sha256(ch.text + `|${EMBED_MODEL}`);
      if (fingerprints[ch.id] !== fp) {
        const emb = await ollamaEmbed(EMBED_MODEL, ch.text);
        fingerprints[ch.id] = fp;

        ids.push(ch.id);
        embs.push(emb);
        // Optional: omit documents if you don’t want full text stored in Chroma
        docs.push(ch.text);
        metas.push({ docUuid: ch.docUuid, path: ch.docPath, title, ext: path.extname(f).slice(1) });

        if (ids.length >= BATCH) await flush();
      }
    }

    // yield this doc’s chunks (NO embedding property)
    yield [fm.uuid, chunks];
  }

  await flush();

  // Write the two small maps at the end (streaming object writers)
  // docs-by-uuid.json
  await writeJSONObjectStream(DOCS_MAP, Object.entries(docsByUuid));
  // embeddings.fingerprint.json
  await writeJSONObjectStream(FINGERPRINTS, Object.entries(fingerprints));
}

async function main() {
  // Stream the big map `{ uuid -> Chunk[] }` without keeping it all in RAM
  await fs.mkdir(CACHE, { recursive: true });
  await writeJSONObjectStream(CHUNK_CACHE, generateChunksAndUpsert());
  console.log("02-embed: done (vectors in Chroma, JSON is lean).");
}

main().catch((e) => {
  console.error(e);
^ref-8b256935-111-0
  process.exit(1); ^ref-8b256935-246-0
});
``` ^ref-8b256935-248-0
^ref-8b256935-114-0
 ^ref-8b256935-249-0 ^ref-8b256935-250-0
**Net effect** ^ref-8b256935-250-0

* `chunks.json` stays the same *shape* (map of arrays of chunks) but contains **no `embedding` arrays**.
* Embeddings go straight into Chroma in batches.
* `embeddings.fingerprint.json` lets you skip re-embedding unchanged chunks fast.
 ^ref-8b256935-256-0
--- ^ref-8b256935-256-0
 ^ref-8b256935-258-0
## 4) (Optional) Tiny **compat** helper for old code that expects `chunk.embedding` ^ref-8b256935-258-0
 ^ref-8b256935-260-0
If a downstream pipeline still does `for (ch of chunks) use ch.embedding`, give it this shim: ^ref-8b256935-260-0

`packages/docops/src/compat.ts`:

```typescript
import type { Collection } from "chromadb";
import type { Chunk } from "./types";

// returns new chunks with .embedding filled from Chroma
export async function attachEmbeddings(chunks: Chunk[], coll: Collection) {
  if (!chunks.length) return chunks as (Chunk & { embedding?: number[] })[];

  const ids = chunks.map((c) => c.id);
  // low-volume get; if you need strict order, map by id
  const res = await coll.get({ ids });
  const map = new Map<string, number[]>();
  (res.ids || []).forEach((id, i) => {
    const vec = (res.embeddings?.[i] || []) as number[];
    map.set(id, vec);
^ref-8b256935-260-0
  });
  return chunks.map((c) => ({ ...c, embedding: map.get(c.id) }));
}
```
^ref-8b256935-282-0 ^ref-8b256935-285-0

So legacy spots can do:

```typescript
import { getCollection } from "./chroma";
^ref-8b256935-282-0
import { attachEmbeddings } from "./compat";

const coll = await getCollection("docs");
const withVecs = await attachEmbeddings(chunks, coll);
^ref-8b256935-295-0 ^ref-8b256935-296-0
^ref-8b256935-294-0 ^ref-8b256935-297-0
^ref-8b256935-288-0 ^ref-8b256935-298-0
``` ^ref-8b256935-294-0
^ref-8b256935-289-0
^ref-8b256935-295-0 ^ref-8b256935-296-0 ^ref-8b256935-300-0
^ref-8b256935-294-0 ^ref-8b256935-297-0
 ^ref-8b256935-295-0 ^ref-8b256935-296-0 ^ref-8b256935-298-0
--- ^ref-8b256935-296-0
 ^ref-8b256935-297-0 ^ref-8b256935-298-0 ^ref-8b256935-300-0
## Why this way (and not another duct tape) ^ref-8b256935-298-0
 ^ref-8b256935-300-0 ^ref-8b256935-306-0
* **No JSON whales.** We never stringify megabyte-scale arrays. ^ref-8b256935-300-0 ^ref-8b256935-307-0
* **Chroma is the source of truth** for vectors (as you asked).
* **Your file contracts mostly survive** (`chunks.json` map + `docs-by-uuid.json`). Only the bad idea—`chunk.embedding`—is gone.
* You still get **deterministic caching** via the content+model fingerprint, not by hoarding vectors in JSON. ^ref-8b256935-306-0
* If someone *really* needs a local vector list, they can call `attachEmbeddings()` or query Chroma directly. ^ref-8b256935-307-0 ^ref-8b256935-311-0
 ^ref-8b256935-306-0
If you want me to also flip your other stages to query Chroma (search, RAG, etc.), I’ll hammer those next. ^ref-8b256935-306-0
 ^ref-8b256935-307-0
--- ^ref-8b256935-311-0 ^ref-8b256935-315-0

### References
 ^ref-8b256935-311-0
* Chroma “Getting Started” & JS client basics. ([Chroma Docs][1]) ^ref-8b256935-315-0
* JS `collection.upsert({ ids, embeddings, documents, metadatas })` semantics. ([Chroma Docs][2])
 ^ref-8b256935-315-0
--- ^ref-8b256935-315-0 ^ref-8b256935-322-0
 ^ref-8b256935-323-0
\#hashtags ^ref-8b256935-324-0
\#promethean #typescript #chroma #streaming #ollama #embeddings #obdev
 ^ref-8b256935-322-0 ^ref-8b256935-326-0
[1]: https://docs.trychroma.com/getting-started?utm_source=chatgpt.com "Getting Started - Chroma Docs" ^ref-8b256935-323-0 ^ref-8b256935-327-0
[2]: https://docs.trychroma.com/reference/js/collection?utm_source=chatgpt.com "Collection - Chroma Docs"<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [template-based-compilation](template-based-compilation.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [i3-layout-saver](i3-layout-saver.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Promethean Full-Stack Docker Setup](promethean-full-stack-docker-setup.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [EidolonField](eidolonfield.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Diagrams](chunks/diagrams.md)
- [Services](chunks/services.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Eidolon-Field-Optimization](eidolon-field-optimization.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [Shared Package Structure](shared-package-structure.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [graph-ds](graph-ds.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Ice Box Reorganization](ice-box-reorganization.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [Refactor 05-footers.ts](refactor-05-footers-ts.md)
- [archetype-ecs](archetype-ecs.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [file-watcher-auth-fix](file-watcher-auth-fix.md)
- [Ghostly Smoke Interference](ghostly-smoke-interference.md)
- [Promethean Pipelines: Local TypeScript-First Workflow](promethean-pipelines-local-typescript-first-workflow.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [Promethean Dev Workflow Update](promethean-dev-workflow-update.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Reawakening Duck](reawakening-duck.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Promethean Chat Activity Report](promethean-chat-activity-report.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [OpenAPI Validation Report](openapi-validation-report.md)
- [Optimizing Command Limitations in System Design](optimizing-command-limitations-in-system-design.md)
- [Promethean Data Sync Protocol](promethean-data-sync-protocol.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [refactor-relations](refactor-relations.md)
- [Tooling](chunks/tooling.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Refactor Frontmatter Processing](refactor-frontmatter-processing.md)
- [windows-tiling-with-autohotkey](windows-tiling-with-autohotkey.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [The Jar of Echoes](the-jar-of-echoes.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [smart-chatgpt-thingy](smart-chatgpt-thingy.md)
- [run-step-api](run-step-api.md)
- [Mathematical Samplers](mathematical-samplers.md)
## Sources
- [Agent Reflections and Prompt Evolution — L498](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-498-0) (line 498, col 0, score 0.89)
- [Agent Tasks: Persistence Migration to DualStore — L968](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-968-0) (line 968, col 0, score 0.89)
- [Chroma Toolkit Consolidation Plan — L762](chroma-toolkit-consolidation-plan.md#^ref-5020e892-762-0) (line 762, col 0, score 0.89)
- [Diagrams — L459](chunks/diagrams.md#^ref-45cd25b5-459-0) (line 459, col 0, score 0.89)
- [Services — L423](chunks/services.md#^ref-75ea4a6a-423-0) (line 423, col 0, score 0.89)
- [eidolon-node-lifecycle — L465](eidolon-node-lifecycle.md#^ref-938eca9c-465-0) (line 465, col 0, score 0.89)
- [Fnord Tracer Protocol — L1025](fnord-tracer-protocol.md#^ref-fc21f824-1025-0) (line 1025, col 0, score 0.89)
- [i3-bluetooth-setup — L683](i3-bluetooth-setup.md#^ref-5e408692-683-0) (line 683, col 0, score 0.89)
- [Agent Tasks: Persistence Migration to DualStore — L8](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-8-0) (line 8, col 0, score 0.85)
- [Promethean Pipelines — L84](promethean-pipelines.md#^ref-8b8e6103-84-0) (line 84, col 0, score 0.86)
- [Universal Lisp Interface — L137](universal-lisp-interface.md#^ref-b01856b4-137-0) (line 137, col 0, score 0.88)
- [komorebi-group-window-hack — L195](komorebi-group-window-hack.md#^ref-dd89372d-195-0) (line 195, col 0, score 0.88)
- [Promethean Pipelines — L68](promethean-pipelines.md#^ref-8b8e6103-68-0) (line 68, col 0, score 0.87)
- [WebSocket Gateway Implementation — L318](websocket-gateway-implementation.md#^ref-e811123d-318-0) (line 318, col 0, score 0.87)
- [ripple-propagation-demo — L64](ripple-propagation-demo.md#^ref-8430617b-64-0) (line 64, col 0, score 0.87)
- [archetype-ecs — L417](archetype-ecs.md#^ref-8f4c1e86-417-0) (line 417, col 0, score 0.86)
- [Promethean-native config design — L35](promethean-native-config-design.md#^ref-ab748541-35-0) (line 35, col 0, score 0.87)
- [archetype-ecs — L366](archetype-ecs.md#^ref-8f4c1e86-366-0) (line 366, col 0, score 0.85)
- [archetype-ecs — L441](archetype-ecs.md#^ref-8f4c1e86-441-0) (line 441, col 0, score 0.85)
- [ripple-propagation-demo — L88](ripple-propagation-demo.md#^ref-8430617b-88-0) (line 88, col 0, score 0.86)
- [TypeScript Patch for Tool Calling Support — L104](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-104-0) (line 104, col 0, score 0.86)
- [Promethean-native config design — L33](promethean-native-config-design.md#^ref-ab748541-33-0) (line 33, col 0, score 0.86)
- [WebSocket Gateway Implementation — L296](websocket-gateway-implementation.md#^ref-e811123d-296-0) (line 296, col 0, score 0.86)
- [Agent Reflections and Prompt Evolution — L101](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-101-0) (line 101, col 0, score 0.87)
- [Universal Lisp Interface — L117](universal-lisp-interface.md#^ref-b01856b4-117-0) (line 117, col 0, score 0.85)
- [Functional Refactor of TypeScript Document Processing — L5](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-5-0) (line 5, col 0, score 0.93)
- [RAG UI Panel with Qdrant and PostgREST — L349](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-349-0) (line 349, col 0, score 0.86)
- [EidolonField — L205](eidolonfield.md#^ref-49d1e1e5-205-0) (line 205, col 0, score 0.91)
- [heartbeat-simulation-snippets — L80](heartbeat-simulation-snippets.md#^ref-23e221e9-80-0) (line 80, col 0, score 0.89)
- [Promethean Event Bus MVP v0.1 — L972](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-972-0) (line 972, col 0, score 0.9)
- [i3-layout-saver — L79](i3-layout-saver.md#^ref-31f0166e-79-0) (line 79, col 0, score 0.86)
- [Promethean Agent Config DSL — L279](promethean-agent-config-dsl.md#^ref-2c00ce45-279-0) (line 279, col 0, score 0.87)
- [i3-config-validation-methods — L28](i3-config-validation-methods.md#^ref-d28090ac-28-0) (line 28, col 0, score 0.91)
- [State Snapshots API and Transactional Projector — L303](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-303-0) (line 303, col 0, score 0.86)
- [System Scheduler with Resource-Aware DAG — L374](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-374-0) (line 374, col 0, score 0.87)
- [prom-lib-rate-limiters-and-replay-api — L306](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-306-0) (line 306, col 0, score 0.86)
- [set-assignment-in-lisp-ast — L148](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-148-0) (line 148, col 0, score 0.87)
- [universal-intention-code-fabric — L388](universal-intention-code-fabric.md#^ref-c14edce7-388-0) (line 388, col 0, score 0.87)
- [Voice Access Layer Design — L280](voice-access-layer-design.md#^ref-543ed9b3-280-0) (line 280, col 0, score 0.93)
- [Promethean Pipelines: Local TypeScript-First Workflow — L220](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-220-0) (line 220, col 0, score 0.86)
- [Promethean-native config design — L305](promethean-native-config-design.md#^ref-ab748541-305-0) (line 305, col 0, score 0.86)
- [WebSocket Gateway Implementation — L630](websocket-gateway-implementation.md#^ref-e811123d-630-0) (line 630, col 0, score 0.87)
- [Local-Offline-Model-Deployment-Strategy — L232](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-232-0) (line 232, col 0, score 0.9)
- [polymorphic-meta-programming-engine — L190](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-190-0) (line 190, col 0, score 0.86)
- [Event Bus MVP — L524](event-bus-mvp.md#^ref-534fe91d-524-0) (line 524, col 0, score 0.88)
- [ecs-offload-workers — L427](ecs-offload-workers.md#^ref-6498b9d7-427-0) (line 427, col 0, score 0.88)
- [Promethean Full-Stack Docker Setup — L416](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-416-0) (line 416, col 0, score 0.9)
- [Promethean Agent DSL TS Scaffold — L818](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-818-0) (line 818, col 0, score 0.85)
- [file-watcher-auth-fix — L32](file-watcher-auth-fix.md#^ref-9044701b-32-0) (line 32, col 0, score 0.85)
- [Recursive Prompt Construction Engine — L147](recursive-prompt-construction-engine.md#^ref-babdb9eb-147-0) (line 147, col 0, score 0.87)
- [Sibilant Meta-Prompt DSL — L120](sibilant-meta-prompt-dsl.md#^ref-af5d2824-120-0) (line 120, col 0, score 0.87)
- [observability-infrastructure-setup — L348](observability-infrastructure-setup.md#^ref-b4e64f8c-348-0) (line 348, col 0, score 0.88)
- [Local-Only-LLM-Workflow — L147](local-only-llm-workflow.md#^ref-9a8ab57e-147-0) (line 147, col 0, score 0.91)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L400](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-400-0) (line 400, col 0, score 0.86)
- [Mongo Outbox Implementation — L609](mongo-outbox-implementation.md#^ref-9c1acd1e-609-0) (line 609, col 0, score 0.86)
- [Shared Package Structure — L185](shared-package-structure.md#^ref-66a72fc3-185-0) (line 185, col 0, score 0.88)
- [Vectorial Exception Descent — L95](vectorial-exception-descent.md#^ref-d771154e-95-0) (line 95, col 0, score 0.88)
- [Interop and Source Maps — L497](interop-and-source-maps.md#^ref-cdfac40c-497-0) (line 497, col 0, score 0.86)
- [Lispy Macros with syntax-rules — L375](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-375-0) (line 375, col 0, score 0.85)
- [Cross-Target Macro System in Sibilant — L148](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-148-0) (line 148, col 0, score 0.88)
- [Promethean Dev Workflow Update — L2039](promethean-dev-workflow-update.md#^ref-03a5578f-2039-0) (line 2039, col 0, score 0.86)
- [Promethean Dev Workflow Update — L2790](promethean-dev-workflow-update.md#^ref-03a5578f-2790-0) (line 2790, col 0, score 0.86)
- [Duck's Self-Referential Perceptual Loop — L279](ducks-self-referential-perceptual-loop.md#^ref-71726f04-279-0) (line 279, col 0, score 0.85)
- [Dynamic Context Model for Web Components — L1287](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1287-0) (line 1287, col 0, score 0.85)
- [Functional Embedding Pipeline Refactor — L715](functional-embedding-pipeline-refactor.md#^ref-a4a25141-715-0) (line 715, col 0, score 0.85)
- [Reawakening Duck — L427](reawakening-duck.md#^ref-59b5670f-427-0) (line 427, col 0, score 0.85)
- [Promethean Dev Workflow Update — L3668](promethean-dev-workflow-update.md#^ref-03a5578f-3668-0) (line 3668, col 0, score 0.85)
- [Canonical Org-Babel Matplotlib Animation Template — L2510](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-2510-0) (line 2510, col 0, score 0.85)
- [sibilant-metacompiler-overview — L52](sibilant-metacompiler-overview.md#^ref-61d4086b-52-0) (line 52, col 0, score 0.87)
- [Language-Agnostic Mirror System — L504](language-agnostic-mirror-system.md#^ref-d2b3628c-504-0) (line 504, col 0, score 0.89)
- [Local-First Intention→Code Loop with Free Models — L105](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-105-0) (line 105, col 0, score 0.87)
- [prompt-programming-language-lisp — L56](prompt-programming-language-lisp.md#^ref-d41a06d1-56-0) (line 56, col 0, score 0.89)
- [pm2-orchestration-patterns — L217](pm2-orchestration-patterns.md#^ref-51932e7b-217-0) (line 217, col 0, score 0.87)
- [Refactor 05-footers.ts — L9](refactor-05-footers-ts.md#^ref-80d4d883-9-0) (line 9, col 0, score 0.86)
- [Universal Lisp Interface — L187](universal-lisp-interface.md#^ref-b01856b4-187-0) (line 187, col 0, score 0.88)
- [mystery-lisp-search-session — L106](mystery-lisp-search-session.md#^ref-513dc4c7-106-0) (line 106, col 0, score 0.87)
- [Ghostly Smoke Interference — L40](ghostly-smoke-interference.md#^ref-b6ae7dfa-40-0) (line 40, col 0, score 0.87)
- [compiler-kit-foundations — L588](compiler-kit-foundations.md#^ref-01b21543-588-0) (line 588, col 0, score 0.9)
- [lisp-dsl-for-window-management — L185](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-185-0) (line 185, col 0, score 0.88)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L490](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-490-0) (line 490, col 0, score 0.86)
- [Diagrams — L367](chunks/diagrams.md#^ref-45cd25b5-367-0) (line 367, col 0, score 0.87)
- [Debugging Broker Connections and Agent Behavior — L537](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-537-0) (line 537, col 0, score 0.87)
- [Duck's Self-Referential Perceptual Loop — L360](ducks-self-referential-perceptual-loop.md#^ref-71726f04-360-0) (line 360, col 0, score 0.87)
- [Eidolon Field Abstract Model — L906](eidolon-field-abstract-model.md#^ref-5e8b2388-906-0) (line 906, col 0, score 0.87)
- [field-node-diagram-outline — L231](field-node-diagram-outline.md#^ref-1f32c94a-231-0) (line 231, col 0, score 0.87)
- [Fnord Tracer Protocol — L815](fnord-tracer-protocol.md#^ref-fc21f824-815-0) (line 815, col 0, score 0.87)
- [Functional Embedding Pipeline Refactor — L707](functional-embedding-pipeline-refactor.md#^ref-a4a25141-707-0) (line 707, col 0, score 0.87)
- [graph-ds — L930](graph-ds.md#^ref-6620e2f2-930-0) (line 930, col 0, score 0.87)
- [heartbeat-fragment-demo — L586](heartbeat-fragment-demo.md#^ref-dd00677a-586-0) (line 586, col 0, score 0.87)
- [homeostasis-decay-formulas — L893](homeostasis-decay-formulas.md#^ref-37b5d236-893-0) (line 893, col 0, score 0.87)
- [i3-bluetooth-setup — L510](i3-bluetooth-setup.md#^ref-5e408692-510-0) (line 510, col 0, score 0.87)
- [Ice Box Reorganization — L587](ice-box-reorganization.md#^ref-291c7d91-587-0) (line 587, col 0, score 0.87)
- [Promethean Web UI Setup — L440](promethean-web-ui-setup.md#^ref-bc5172ca-440-0) (line 440, col 0, score 0.87)
- [template-based-compilation — L44](template-based-compilation.md#^ref-f8877e5e-44-0) (line 44, col 0, score 0.86)
- [markdown-to-org-transpiler — L272](markdown-to-org-transpiler.md#^ref-ab54cdd8-272-0) (line 272, col 0, score 0.88)
- [Exception Layer Analysis — L63](exception-layer-analysis.md#^ref-21d5cc09-63-0) (line 63, col 0, score 0.89)
- [Eidolon-Field-Optimization — L50](eidolon-field-optimization.md#^ref-40e05c14-50-0) (line 50, col 0, score 0.88)
- [2d-sandbox-field — L150](2d-sandbox-field.md#^ref-c710dc93-150-0) (line 150, col 0, score 0.94)
- [shared-package-layout-clarification — L161](shared-package-layout-clarification.md#^ref-36c8882a-161-0) (line 161, col 0, score 0.87)
- [ecs-scheduler-and-prefabs — L376](ecs-scheduler-and-prefabs.md#^ref-c62a1815-376-0) (line 376, col 0, score 0.88)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
