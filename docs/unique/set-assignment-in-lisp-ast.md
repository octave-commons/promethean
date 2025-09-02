---
uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
created_at: 2025.08.08.23.08.19.md
filename: set-assignment-in-lisp-ast
description: >-
  Adds `Set` node to AST for `set!` operations, implements Lisp front-end
  recognition, lowering to assignments, and ensures compatibility with existing
  JS emitter and reverse compiler.
tags:
  - lisp
  - ast
  - set
  - assignment
  - compiler
  - ir
  - js
  - reverse
related_to_title:
  - System Scheduler with Resource-Aware DAG
  - ecs-scheduler-and-prefabs
  - Smoke Resonance Visualizations
  - Stateful Partitions and Rebalancing
  - Tracing the Signal
  - ts-to-lisp-transpiler
  - typed-struct-compiler
  - TypeScript Patch for Tool Calling Support
  - Unique Concepts
  - zero-copy-snapshots-and-workers
  - Canonical Org-Babel Matplotlib Animation Template
  - Docops Feature Updates
  - field-node-diagram-outline
  - field-node-diagram-set
  - field-node-diagram-visualizations
  - Fnord Tracer Protocol
  - Functional Embedding Pipeline Refactor
  - graph-ds
  - heartbeat-fragment-demo
  - i3-bluetooth-setup
  - Ice Box Reorganization
  - komorebi-group-window-hack
  - Layer1SurvivabilityEnvelope
  - polymorphic-meta-programming-engine
  - Agent Reflections and Prompt Evolution
  - ChatGPT Custom Prompts
  - Chroma Toolkit Consolidation Plan
  - Diagrams
  - DSL
  - JavaScript
  - Math Fundamentals
  - Operations
  - Services
  - Shared
  - Simulation Demo
  - Unique Info Dump Index
  - Creative Moments
  - Duck's Attractor States
  - eidolon-field-math-foundations
  - universal-intention-code-fabric
  - Recursive Prompt Construction Engine
  - Promethean Event Bus MVP v0.1
  - State Snapshots API and Transactional Projector
  - Promethean-native config design
  - RAG UI Panel with Qdrant and PostgREST
  - Vectorial Exception Descent
  - Interop and Source Maps
  - compiler-kit-foundations
  - prompt-programming-language-lisp
  - ParticleSimulationWithCanvasAndFFmpeg
  - Eidolon Field Abstract Model
  - Reawakening Duck
  - Lispy Macros with syntax-rules
  - Local-Offline-Model-Deployment-Strategy
  - Migrate to Provider-Tenant Architecture
  - Dynamic Context Model for Web Components
  - Performance-Optimized-Polyglot-Bridge
  - Promethean Infrastructure Setup
  - sibilant-macro-targets
  - Window Management
  - sibilant-meta-string-templating-runtime
  - Universal Lisp Interface
  - shared-package-layout-clarification
  - js-to-lisp-reverse-compiler
  - WebSocket Gateway Implementation
  - Language-Agnostic Mirror System
  - markdown-to-org-transpiler
  - 2d-sandbox-field
  - lisp-dsl-for-window-management
  - Promethean Agent DSL TS Scaffold
  - Exception Layer Analysis
  - i3-config-validation-methods
  - Promethean Web UI Setup
  - Pure-Node Crawl Stack with Playwright and Crawlee
  - 'Promethean Pipelines: Local TypeScript-First Workflow'
  - Lisp-Compiler-Integration
  - Promethean Dev Workflow Update
  - observability-infrastructure-setup
  - layer-1-uptime-diagrams
  - ecs-offload-workers
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - Promethean Agent Config DSL
  - Cross-Target Macro System in Sibilant
  - Shared Package Structure
  - Local-Only-LLM-Workflow
  - i3-layout-saver
  - Sibilant Meta-Prompt DSL
  - Local-First Intention→Code Loop with Free Models
  - homeostasis-decay-formulas
  - Obsidian Templating Plugins Integration Guide
  - Chroma-Embedding-Refactor
  - plan-update-confirmation
  - Promethean Pipelines
  - EidolonField
  - schema-evolution-workflow
  - Pure TypeScript Search Microservice
  - ripple-propagation-demo
  - Post-Linguistic Transhuman Design Frameworks
  - Promethean_Eidolon_Synchronicity_Model
  - template-based-compilation
  - Eidolon-Field-Optimization
  - refactor-relations
  - Cross-Language Runtime Polymorphism
  - heartbeat-simulation-snippets
  - Ollama-LLM-Provider-for-Pseudo-Code-Transpiler
  - Matplotlib Animation with Async Execution
  - Promethean Full-Stack Docker Setup
  - Event Bus MVP
  - Prometheus Observability Stack
  - Prompt_Folder_Bootstrap
  - Protocol_0_The_Contradiction_Engine
  - Provider-Agnostic Chat Panel Implementation
  - file-watcher-auth-fix
  - Event Bus Projections Architecture
  - pm2-orchestration-patterns
  - Mongo Outbox Implementation
  - sibilant-metacompiler-overview
  - SentenceProcessing
  - Refactor Frontmatter Processing
  - Ghostly Smoke Interference
  - Refactor 05-footers.ts
  - windows-tiling-with-autohotkey
  - Voice Access Layer Design
  - prom-lib-rate-limiters-and-replay-api
  - promethean-system-diagrams
  - Model Selection for Lightweight Conversational Tasks
  - Optimizing Command Limitations in System Design
  - polyglot-repl-interface-layer
  - Promethean-Copilot-Intent-Engine
  - Promethean Chat Activity Report
  - Per-Domain Policy System for JS Crawler
  - Pipeline Enhancements
  - Promethean Data Sync Protocol
  - Promethean Documentation Overview
  - Promethean Documentation Pipeline Overview
  - Promethean Documentation Update
  - Obsidian ChatGPT Plugin Integration Guide
  - Obsidian ChatGPT Plugin Integration
related_to_uuid:
  - ba244286-4e84-425b-8bf6-b80c4eb783fc
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - ac9d3ac5-9a6a-4180-a67f-1ab7e229d981
  - 4330e8f0-5f46-4235-918b-39b6b93fa561
  - c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
  - ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
  - 78eeedf7-75bc-4692-a5a7-bb6857270621
  - 7b7ca860-780c-44fa-8d3f-be8bd9496fba
  - ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
  - 62bec6f0-4e13-4f38-aca4-72c84ba02367
  - 1b1338fc-bb4d-41df-828f-e219cc9442eb
  - 2792d448-c3b5-4050-93dd-93768529d99c
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - 22b989d5-f4aa-4880-8632-709c21830f83
  - e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
  - fc21f824-4244-4030-a48e-c4170160ea1d
  - a4a25141-6380-40b9-9cd7-b554b246b303
  - 6620e2f2-de6d-45d8-a722-5d26e160b370
  - dd00677a-2280-45a7-91af-0728b21af3ad
  - 5e408692-0e74-400e-a617-84247c7353ad
  - 291c7d91-da8c-486c-9bc0-bd2254536e2d
  - dd89372d-10de-42a9-8c96-6bc13ea36d02
  - 64a9f9f9-58ee-4996-bdaf-9373845c6b29
  - 7bed0b9a-8b22-4b1f-be81-054a179453cb
  - bb7f0835-c347-474f-bfad-eabd873b51ad
  - 930054b3-ba95-4acf-bb92-0e3ead25ed0b
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - 45cd25b5-ed36-49ab-82c8-10d0903e34db
  - e87bc036-1570-419e-a558-f45b9c0db698
  - c1618c66-f73a-4e04-9bfa-ef38755f7acc
  - c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
  - f1add613-656e-4bec-b52b-193fd78c4642
  - 75ea4a6a-8270-488d-9d37-799c288e5f70
  - 623a55f7-685c-486b-abaf-469da1bbbb69
  - 557309a3-c906-4e97-8867-89ffe151790c
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - 10d98225-12e0-4212-8e15-88b57cf7bee5
  - 13951643-1741-46bb-89dc-1beebb122633
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - c14edce7-0656-45b2-aaf3-51f042451b7d
  - babdb9eb-3b15-48a7-8a22-ecc53af7d397
  - fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
  - 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
  - ab748541-020e-4a7e-b07d-28173bd5bea2
  - e1056831-ae0c-460b-95fa-4cf09b3398c6
  - d771154e-a7ef-44ca-b69c-a1626cf94fbf
  - cdfac40c-00e4-458f-96a7-4c37d0278731
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - d41a06d1-613e-4440-80b7-4553fc694285
  - e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - 59b5670f-36d3-4d34-8985-f3144b15347a
  - cbfe3513-6a4a-4d2e-915d-ddfab583b2de
  - ad7f1ed3-c9bf-4e85-9eeb-6cc4b53155f3
  - 54382370-1931-4a19-a634-46735708a9ea
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - f5579967-762d-4cfd-851e-4f71b4cb77a1
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - c5c9a5c6-427d-4864-8084-c083cd55faa0
  - 9e8ae388-767a-4ea8-9f2e-88801291d947
  - 2aafc801-c3e1-4e4f-999d-adb52af3fc41
  - b01856b4-999f-418d-8009-ade49b00eb0f
  - 36c8882a-badc-4e18-838d-2c54d7038141
  - 58191024-d04a-4520-8aae-a18be7b94263
  - e811123d-5841-4e52-bf8c-978f26db4230
  - d2b3628c-6cad-4664-8551-94ef8280851d
  - ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
  - c710dc93-9fec-471b-bdee-bedbd360c67f
  - c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
  - 5158f742-4a3b-466e-bfc3-d83517b64200
  - 21d5cc09-b005-4ede-8f69-00b4b0794540
  - d28090ac-f746-4958-aab5-ed1315382c04
  - bc5172ca-7a09-42ad-b418-8e42bb14d089
  - d527c05d-22e8-4493-8f29-ae3cb67f035b
  - 6b63edca-7637-4fb0-bc85-d498c31cc46e
  - cfee6d36-b9f5-4587-885a-cdfddb4f054e
  - 03a5578f-d689-45db-95e9-11300e5eee6f
  - b4e64f8c-4dc9-4941-a877-646c5ada068e
  - 4127189a-e0ab-436f-8571-cc852b8e9add
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - 2c00ce45-08cf-4b81-9883-6157f30b7fae
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - 66a72fc3-4153-41fc-84bd-d6164967a6ff
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - 31f0166e-4631-45fa-aecd-b44e9a13f497
  - af5d2824-faad-476c-a389-e912d9bc672c
  - 871490c7-a050-429b-88b2-55dfeaa1f8d5
  - 37b5d236-2b3e-4a95-a4e8-31655c3023ef
  - b39dc9d4-63e2-42d4-bbcd-041ef3167bca
  - 8b256935-02f6-4da2-a406-bf6b8415276f
  - b22d79c6-825b-4cd3-b0d3-1cef0532bb54
  - 8b8e6103-30a4-4d66-b5f2-87db1612b587
  - 49d1e1e5-5d13-4955-8f6f-7676434ec462
  - d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
  - d17d3a96-c84d-4738-a403-6c733b874da2
  - 8430617b-80a2-4cc9-8288-9a74cb57990b
  - 6bcff92c-4224-453d-9993-1be8d37d47c3
  - 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
  - f8877e5e-1e4f-4478-93cd-a0bf86d26a41
  - 40e05c14-0db0-44c5-bf0a-2eece2f4c2a4
  - 41ce0216-f8cc-4eed-8d9a-fcc25be21425
  - c34c36a6-80c9-4b44-a200-6448543b1b33
  - 23e221e9-d4fa-4106-8458-06db2595085f
  - b362e12e-2802-4e41-9a21-6e0c7ad419a2
  - 687439f9-ad1e-40a4-8a32-3a1b4ac7c017
  - 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
  - 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
  - e90b5a16-d58f-424d-bd36-70e9bd2861ad
  - bd4f0976-0d5b-47f6-a20a-0601d1842dc1
  - 9a93a756-6d33-45d1-aca9-51b74f2b33d2
  - 43bfe9dd-d433-42ca-9777-f4c40eaba791
  - 9044701b-03c9-4a30-92c4-46b1bd66c11e
  - cf6b9b17-bb91-4219-aa5c-172cba02b2da
  - 51932e7b-4237-4756-bcae-8be6d535d0d1
  - 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
  - 61d4086b-4adf-4e94-95e4-95a249cd1b53
  - 681a4ab2-8fef-4833-a09d-bceb62d114da
  - cfbdca2f-5ee8-4cad-a75e-0e017e8d9b77
  - b6ae7dfa-0c53-4eb9-aea8-65072b825bee
  - 80d4d883-59f9-401b-8699-7a2723148b1e
  - 0f6f8f38-98d0-438f-9601-58f478acc0b7
  - 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
  - aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
  - b51e19b4-1326-4311-9798-33e972bf626c
  - d144aa62-348c-4e5d-ae8f-38084c67ceca
  - 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
  - 9c79206d-4cb9-4f00-87e0-782dcea37bc7
  - ae24a280-678e-4c0b-8cc4-56667fa04172
  - 18344cf9-0c49-4a71-b6c8-b8d84d660fca
  - c03020e1-e3e7-48bf-aa7e-aa740c601b63
  - e2135d9f-c69d-47ee-9b17-0b05e98dc748
  - 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
  - 9413237f-2537-4bbf-8768-db6180970e36
  - 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
  - c0392040-16a2-41e8-bd54-75110319e3c0
  - 1d3d6c3a-039e-4b96-93c1-95854945e248
  - ca8e1399-77bf-4f77-82a3-3f703b68706d
references:
  - uuid: ac9d3ac5-9a6a-4180-a67f-1ab7e229d981
    line: 483
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 1321
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 561
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 522
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 1015
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 1228
    col: 0
    score: 1
  - uuid: ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
    line: 173
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 1057
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 513
    col: 0
    score: 1
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 618
    col: 0
    score: 1
  - uuid: 930054b3-ba95-4acf-bb92-0e3ead25ed0b
    line: 187
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 999
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 519
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 466
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 505
    col: 0
    score: 1
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 451
    col: 0
    score: 1
  - uuid: f1add613-656e-4bec-b52b-193fd78c4642
    line: 178
    col: 0
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 437
    col: 0
    score: 1
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 367
    col: 0
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 378
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 1016
    col: 0
    score: 1
  - uuid: ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
    line: 175
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 1221
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 1058
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 515
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 251
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 559
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 1033
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 226
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 705
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 719
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 601
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 1060
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 726
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 996
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 667
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 736
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 645
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 739
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 816
    col: 0
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 322
    col: 0
    score: 0.98
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 366
    col: 0
    score: 0.96
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 304
    col: 0
    score: 0.94
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 375
    col: 0
    score: 0.87
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 588
    col: 0
    score: 0.91
  - uuid: c14edce7-0656-45b2-aaf3-51f042451b7d
    line: 388
    col: 0
    score: 1
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 504
    col: 0
    score: 0.88
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 148
    col: 0
    score: 0.88
  - uuid: ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
    line: 272
    col: 0
    score: 0.89
  - uuid: c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
    line: 185
    col: 0
    score: 0.91
  - uuid: 36c8882a-badc-4e18-838d-2c54d7038141
    line: 161
    col: 0
    score: 0.92
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 147
    col: 0
    score: 0.86
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 521
    col: 0
    score: 0.88
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 374
    col: 0
    score: 1
  - uuid: 6b63edca-7637-4fb0-bc85-d498c31cc46e
    line: 220
    col: 0
    score: 0.9
  - uuid: 2c00ce45-08cf-4b81-9883-6157f30b7fae
    line: 279
    col: 0
    score: 0.85
  - uuid: 871490c7-a050-429b-88b2-55dfeaa1f8d5
    line: 105
    col: 0
    score: 0.85
  - uuid: 8b256935-02f6-4da2-a406-bf6b8415276f
    line: 289
    col: 0
    score: 0.87
  - uuid: 49d1e1e5-5d13-4955-8f6f-7676434ec462
    line: 205
    col: 0
    score: 0.86
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 376
    col: 0
    score: 0.94
  - uuid: f8877e5e-1e4f-4478-93cd-a0bf86d26a41
    line: 44
    col: 0
    score: 0.86
  - uuid: 41ce0216-f8cc-4eed-8d9a-fcc25be21425
    line: 10
    col: 0
    score: 0.85
  - uuid: 5158f742-4a3b-466e-bfc3-d83517b64200
    line: 818
    col: 0
    score: 0.91
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 343
    col: 0
    score: 0.92
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1697
    col: 0
    score: 0.86
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 717
    col: 0
    score: 0.86
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 364
    col: 0
    score: 0.86
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 363
    col: 0
    score: 0.86
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 718
    col: 0
    score: 0.86
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1695
    col: 0
    score: 0.86
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 447
    col: 0
    score: 0.89
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 593
    col: 0
    score: 0.89
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 654
    col: 0
    score: 0.87
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 313
    col: 0
    score: 0.87
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 284
    col: 0
    score: 0.87
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1127
    col: 0
    score: 0.87
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 846
    col: 0
    score: 0.87
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 366
    col: 0
    score: 0.87
  - uuid: 7bed0b9a-8b22-4b1f-be81-054a179453cb
    line: 190
    col: 0
    score: 0.88
  - uuid: d527c05d-22e8-4493-8f29-ae3cb67f035b
    line: 400
    col: 0
    score: 0.9
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 497
    col: 0
    score: 0.87
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 709
    col: 0
    score: 0.95
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 506
    col: 0
    score: 0.95
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 436
    col: 0
    score: 0.95
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 378
    col: 0
    score: 0.95
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 303
    col: 0
    score: 0.95
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 224
    col: 0
    score: 0.95
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 4590
    col: 0
    score: 0.93
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 4557
    col: 0
    score: 0.93
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 4573
    col: 0
    score: 0.93
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 979
    col: 0
    score: 0.93
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 244
    col: 0
    score: 0.93
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 296
    col: 0
    score: 0.93
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 313
    col: 0
    score: 0.93
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1168
    col: 0
    score: 0.93
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 506
    col: 0
    score: 0.93
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 806
    col: 0
    score: 0.93
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 250
    col: 0
    score: 0.93
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 239
    col: 0
    score: 0.93
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 316
    col: 0
    score: 0.93
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1523
    col: 0
    score: 0.93
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 818
    col: 0
    score: 0.93
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1488
    col: 0
    score: 0.93
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1150
    col: 0
    score: 0.93
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1557
    col: 0
    score: 0.93
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 934
    col: 0
    score: 0.93
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 349
    col: 0
    score: 1
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 630
    col: 0
    score: 0.91
  - uuid: 21d5cc09-b005-4ede-8f69-00b4b0794540
    line: 63
    col: 0
    score: 0.91
  - uuid: b01856b4-999f-418d-8009-ade49b00eb0f
    line: 187
    col: 0
    score: 0.92
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 440
    col: 0
    score: 0.9
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 972
    col: 0
    score: 1
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 490
    col: 0
    score: 0.85
  - uuid: 66a72fc3-4153-41fc-84bd-d6164967a6ff
    line: 185
    col: 0
    score: 0.87
  - uuid: d771154e-a7ef-44ca-b69c-a1626cf94fbf
    line: 95
    col: 0
    score: 1
  - uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
    line: 150
    col: 0
    score: 0.91
  - uuid: d28090ac-f746-4958-aab5-ed1315382c04
    line: 28
    col: 0
    score: 0.9
  - uuid: 31f0166e-4631-45fa-aecd-b44e9a13f497
    line: 79
    col: 0
    score: 0.88
  - uuid: 40e05c14-0db0-44c5-bf0a-2eece2f4c2a4
    line: 50
    col: 0
    score: 0.86
  - uuid: d41a06d1-613e-4440-80b7-4553fc694285
    line: 56
    col: 0
    score: 0.9
  - uuid: 2aafc801-c3e1-4e4f-999d-adb52af3fc41
    line: 92
    col: 0
    score: 0.92
  - uuid: 4127189a-e0ab-436f-8571-cc852b8e9add
    line: 129
    col: 0
    score: 0.88
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 427
    col: 0
    score: 0.88
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 120
    col: 0
    score: 0.88
  - uuid: babdb9eb-3b15-48a7-8a22-ecc53af7d397
    line: 147
    col: 0
    score: 1
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 305
    col: 0
    score: 1
  - uuid: 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
    line: 303
    col: 0
    score: 1
  - uuid: ad7f1ed3-c9bf-4e85-9eeb-6cc4b53155f3
    line: 232
    col: 0
    score: 0.94
  - uuid: b4e64f8c-4dc9-4941-a877-646c5ada068e
    line: 348
    col: 0
    score: 0.89
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 506
    col: 0
    score: 0.86
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 546
    col: 0
    score: 0.86
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 415
    col: 0
    score: 0.86
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1395
    col: 0
    score: 0.86
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1293
    col: 0
    score: 0.86
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 581
    col: 0
    score: 0.86
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1263
    col: 0
    score: 0.86
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 887
    col: 0
    score: 0.86
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 7
    col: 0
    score: 1
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 5
    col: 0
    score: 1
---
Heck yeah—here’s **`set!`** wired end-to-end (Lisp → AST → IR → JS) + the reverse compiler already emits it from `x = ...`. ^ref-c5fba0a0-1-0

## 1) AST: add a `Set` node

```ts
// shared/js/prom-lib/compiler/ast.ts
export type Expr =
  | { kind: "Num"; value: number; span: Span }
  | { kind: "Str"; value: string; span: Span }
  | { kind: "Bool"; value: boolean; span: Span }
  | { kind: "Null"; span: Span }
  | { kind: "Var"; name: Name }
  | { kind: "Let"; name: Name; value: Expr; body: Expr; span: Span }
  | { kind: "If"; cond: Expr; then: Expr; else: Expr; span: Span }
  | { kind: "Fun"; params: Name[]; body: Expr; span: Span }
  | { kind: "Call"; callee: Expr; args: Expr[]; span: Span }
  | { kind: "Bin"; op: string; left: Expr; right: Expr; span: Span }
  | { kind: "Un"; op: string; expr: Expr; span: Span }
  | { kind: "Block"; exprs: Expr[]; span: Span }
  | { kind: "Set"; name: Name; value: Expr; span: Span };  // <-- NEW
```
^ref-c5fba0a0-5-0 ^ref-c5fba0a0-22-0

## 2) Lisp front-end: recognize `(set! x expr)`
 ^ref-c5fba0a0-25-0
```ts
// shared/js/prom-lib/compiler/lisp/to-expr.ts
import { name as mkName } from "../ast";
// ...

function listToExpr(x: List): Expr {
  if (x.xs.length===0) return { kind:"Null", span:x.span! };

  const hd = x.xs[0];

  // --- NEW: (set! id value)
  if (isSym(hd,"set!")) {
    const id = x.xs[1] as Sym;
    if (id.t !== "sym") throw new Error("(set!) expects a symbol as the first argument");
    const value = x.xs[2];
    return {
      kind: "Set",
      name: mkName(id.gensym ?? id.name, id.span!),
      value: toExpr(value),
      span: x.span!
    };
  }

  // ... (rest unchanged)
}
^ref-c5fba0a0-25-0
```

## 3) Lowering: turn `Set` into an assignment on the existing symbol ^ref-c5fba0a0-54-0

We keep IR simple: **reuse** the existing `bind` statement to assign to the *same* Sym. (Our JS emitter already outputs `dst = ...;` for `bind`, so this “just works”.) ^ref-c5fba0a0-56-0

Also: prevent `set!` on **externs** (imports destructured as `const`), since that would blow up at runtime. ^ref-c5fba0a0-58-0

```ts
// shared/js/prom-lib/compiler/lower.ts
import type { Expr } from "./ast";
import { gensym, type Module, type Fun, type Stmt, type Sym, type Rhs, type Val } from "./ir";

export function lowerWithExterns(ast: Expr, externs: string[] = []): Module & { debug: { symSpan: Map<Sym, any> } } {
  const env: Map<string, Sym> = new Map();
  const externSet = new Set(externs);
  for (const name of externs) env.set(name, name as unknown as Sym);

  const symSpan = new Map<Sym, any>();
  const out: Stmt[] = [];
  const result = lowerExpr(ast, env, out, symSpan, externSet);
  out.push({ k:"ret", s: result });
  const main: Fun = { params: [], body: out };
  return { funs: [], main, debug: { symSpan } };
}

function lowerExpr(
  e: Expr,
  env: Map<string, Sym>,
  out: Stmt[],
  dbg: Map<Sym, any>,
  externs: Set<string>
): Sym {
  switch (e.kind) {
    // ... existing cases ...

    case "Set": {
      const target = env.get(e.name.text);
      if (!target) throw new Error(`set!: unbound variable ${e.name.text}`);
      if (externs.has(e.name.text)) throw new Error(`set!: cannot assign to extern '${e.name.text}'`);
      const rhs = lowerExpr(e.value, env, out, dbg, externs);
      // assign: target = rhs
      out.push({ k:"bind", s: target, rhs: { r:"val", v: { t:"var", s: rhs } } });
      dbg.set(target, e.span);
      return target;
    }

    // ... rest unchanged ...
  }
}

^ref-c5fba0a0-58-0
// bindVal, binToPrim unchanged
```
^ref-c5fba0a0-60-0
 ^ref-c5fba0a0-106-0
## 4) JS emitter: no changes needed 🎉
 ^ref-c5fba0a0-108-0
Your `emitJS` already turns every `bind` into `dst = ...;`. Because we assign to the **same** Sym, `set!` becomes a normal JS assignment to the existing `let` variable.

(And `collectLocals` still declares each Sym once—duplicates are ignored via the Set.)
 ^ref-c5fba0a0-112-0
## 5) Reverse compiler already outputs `(set! ...)`
 ^ref-c5fba0a0-114-0
We already mapped:

```ts
// shared/js/prom-lib/compiler/lisp/js-ast2lisp.ts
case "AssignmentExpression": {
  if (n.left.type === "MemberExpression") {
    // -> (js/set! obj key val)
  }
  if (n.left.type === "Identifier") {
    return list([sym("set!"), sym(n.left.name), expr(n.right, opts)]);
^ref-c5fba0a0-114-0
  } ^ref-c5fba0a0-126-0
}
^ref-c5fba0a0-126-0
``` ^ref-c5fba0a0-130-0

So **`x = y`** becomes **`(set! x y)`**. ^ref-c5fba0a0-130-0

## 6) Quick sanity check

```lisp
; test.lisp
(let ((x 1)
      (y 2))
^ref-c5fba0a0-130-0
  (set! x (+ x y))   ; x = 3
  (set! y 10)        ; y = 10
^ref-c5fba0a0-139-0
  (+ x y))           ; -> 13 ^ref-c5fba0a0-144-0
```
^ref-c5fba0a0-139-0
 ^ref-c5fba0a0-144-0
```ts
^ref-c5fba0a0-148-0
^ref-c5fba0a0-145-0
import { runLisp } from "./compiler/lisp/driver";
console.log(runLisp(`(let ((x 1) (y 2)) (set! x (+ x y)) (set! y 10) (+ x y))`)); // 13
``` ^ref-c5fba0a0-148-0
 ^ref-c5fba0a0-154-0
If you want `set!` for **fields** too (i.e. `(set! x.a 5)`), we can either macro-expand that to `(js/set! x "a" 5)` or add dotted lvalues to the reader—your call.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [Smoke Resonance Visualizations](smoke-resonance-visualizations.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Tracing the Signal](tracing-the-signal.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [Unique Concepts](unique-concepts.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [Docops Feature Updates](docops-feature-updates.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [graph-ds](graph-ds.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Ice Box Reorganization](ice-box-reorganization.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [ChatGPT Custom Prompts](chatgpt-custom-prompts.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Diagrams](chunks/diagrams.md)
- [DSL](chunks/dsl.md)
- [JavaScript](chunks/javascript.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Operations](chunks/operations.md)
- [Services](chunks/services.md)
- [Shared](chunks/shared.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [Creative Moments](creative-moments.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [Reawakening Duck](reawakening-duck.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [Window Management](chunks/window-management.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Promethean Pipelines: Local TypeScript-First Workflow](promethean-pipelines-local-typescript-first-workflow.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [Promethean Dev Workflow Update](promethean-dev-workflow-update.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [Shared Package Structure](shared-package-structure.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [i3-layout-saver](i3-layout-saver.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [EidolonField](eidolonfield.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [template-based-compilation](template-based-compilation.md)
- [Eidolon-Field-Optimization](eidolon-field-optimization.md)
- [refactor-relations](refactor-relations.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [Promethean Full-Stack Docker Setup](promethean-full-stack-docker-setup.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [file-watcher-auth-fix](file-watcher-auth-fix.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [SentenceProcessing](sentenceprocessing.md)
- [Refactor Frontmatter Processing](refactor-frontmatter-processing.md)
- [Ghostly Smoke Interference](ghostly-smoke-interference.md)
- [Refactor 05-footers.ts](refactor-05-footers-ts.md)
- [windows-tiling-with-autohotkey](windows-tiling-with-autohotkey.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Optimizing Command Limitations in System Design](optimizing-command-limitations-in-system-design.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [Promethean Chat Activity Report](promethean-chat-activity-report.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Pipeline Enhancements](pipeline-enhancements.md)
- [Promethean Data Sync Protocol](promethean-data-sync-protocol.md)
- [Promethean Documentation Overview](promethean-documentation-overview.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [Promethean Documentation Update](promethean-documentation-update.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
## Sources
- [Smoke Resonance Visualizations — L483](smoke-resonance-visualizations.md#^ref-ac9d3ac5-483-0) (line 483, col 0, score 1)
- [Stateful Partitions and Rebalancing — L1321](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-1321-0) (line 1321, col 0, score 1)
- [Tracing the Signal — L561](tracing-the-signal.md#^ref-c3cd4f65-561-0) (line 561, col 0, score 1)
- [ts-to-lisp-transpiler — L522](ts-to-lisp-transpiler.md#^ref-ba11486b-522-0) (line 522, col 0, score 1)
- [typed-struct-compiler — L1015](typed-struct-compiler.md#^ref-78eeedf7-1015-0) (line 1015, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L1228](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-1228-0) (line 1228, col 0, score 1)
- [Unique Concepts — L173](unique-concepts.md#^ref-ed6f3fc9-173-0) (line 173, col 0, score 1)
- [zero-copy-snapshots-and-workers — L1057](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-1057-0) (line 1057, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L513](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-513-0) (line 513, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L618](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-618-0) (line 618, col 0, score 1)
- [ChatGPT Custom Prompts — L187](chatgpt-custom-prompts.md#^ref-930054b3-187-0) (line 187, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L999](chroma-toolkit-consolidation-plan.md#^ref-5020e892-999-0) (line 999, col 0, score 1)
- [Diagrams — L519](chunks/diagrams.md#^ref-45cd25b5-519-0) (line 519, col 0, score 1)
- [DSL — L466](chunks/dsl.md#^ref-e87bc036-466-0) (line 466, col 0, score 1)
- [JavaScript — L505](chunks/javascript.md#^ref-c1618c66-505-0) (line 505, col 0, score 1)
- [Math Fundamentals — L451](chunks/math-fundamentals.md#^ref-c6e87433-451-0) (line 451, col 0, score 1)
- [Operations — L178](chunks/operations.md#^ref-f1add613-178-0) (line 178, col 0, score 1)
- [Services — L437](chunks/services.md#^ref-75ea4a6a-437-0) (line 437, col 0, score 1)
- [Shared — L367](chunks/shared.md#^ref-623a55f7-367-0) (line 367, col 0, score 1)
- [Simulation Demo — L378](chunks/simulation-demo.md#^ref-557309a3-378-0) (line 378, col 0, score 1)
- [typed-struct-compiler — L1016](typed-struct-compiler.md#^ref-78eeedf7-1016-0) (line 1016, col 0, score 1)
- [Unique Concepts — L175](unique-concepts.md#^ref-ed6f3fc9-175-0) (line 175, col 0, score 1)
- [Unique Info Dump Index — L1221](unique-info-dump-index.md#^ref-30ec3ba6-1221-0) (line 1221, col 0, score 1)
- [zero-copy-snapshots-and-workers — L1058](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-1058-0) (line 1058, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L515](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-515-0) (line 515, col 0, score 1)
- [Creative Moments — L251](creative-moments.md#^ref-10d98225-251-0) (line 251, col 0, score 1)
- [Duck's Attractor States — L559](ducks-attractor-states.md#^ref-13951643-559-0) (line 559, col 0, score 1)
- [eidolon-field-math-foundations — L1033](eidolon-field-math-foundations.md#^ref-008f2ac0-1033-0) (line 1033, col 0, score 1)
- [Docops Feature Updates — L226](docops-feature-updates.md#^ref-2792d448-226-0) (line 226, col 0, score 1)
- [field-node-diagram-outline — L705](field-node-diagram-outline.md#^ref-1f32c94a-705-0) (line 705, col 0, score 1)
- [field-node-diagram-set — L719](field-node-diagram-set.md#^ref-22b989d5-719-0) (line 719, col 0, score 1)
- [field-node-diagram-visualizations — L601](field-node-diagram-visualizations.md#^ref-e9b27b06-601-0) (line 601, col 0, score 1)
- [Fnord Tracer Protocol — L1060](fnord-tracer-protocol.md#^ref-fc21f824-1060-0) (line 1060, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L726](functional-embedding-pipeline-refactor.md#^ref-a4a25141-726-0) (line 726, col 0, score 1)
- [graph-ds — L996](graph-ds.md#^ref-6620e2f2-996-0) (line 996, col 0, score 1)
- [heartbeat-fragment-demo — L667](heartbeat-fragment-demo.md#^ref-dd00677a-667-0) (line 667, col 0, score 1)
- [i3-bluetooth-setup — L736](i3-bluetooth-setup.md#^ref-5e408692-736-0) (line 736, col 0, score 1)
- [Ice Box Reorganization — L645](ice-box-reorganization.md#^ref-291c7d91-645-0) (line 645, col 0, score 1)
- [komorebi-group-window-hack — L739](komorebi-group-window-hack.md#^ref-dd89372d-739-0) (line 739, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L816](layer1survivabilityenvelope.md#^ref-64a9f9f9-816-0) (line 816, col 0, score 1)
- [Interop and Source Maps — L322](interop-and-source-maps.md#^ref-cdfac40c-322-0) (line 322, col 0, score 0.98)
- [compiler-kit-foundations — L366](compiler-kit-foundations.md#^ref-01b21543-366-0) (line 366, col 0, score 0.96)
- [Lispy Macros with syntax-rules — L304](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-304-0) (line 304, col 0, score 0.94)
- [Lispy Macros with syntax-rules — L375](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-375-0) (line 375, col 0, score 0.87)
- [compiler-kit-foundations — L588](compiler-kit-foundations.md#^ref-01b21543-588-0) (line 588, col 0, score 0.91)
- [universal-intention-code-fabric — L388](universal-intention-code-fabric.md#^ref-c14edce7-388-0) (line 388, col 0, score 1)
- [Language-Agnostic Mirror System — L504](language-agnostic-mirror-system.md#^ref-d2b3628c-504-0) (line 504, col 0, score 0.88)
- [Cross-Target Macro System in Sibilant — L148](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-148-0) (line 148, col 0, score 0.88)
- [markdown-to-org-transpiler — L272](markdown-to-org-transpiler.md#^ref-ab54cdd8-272-0) (line 272, col 0, score 0.89)
- [lisp-dsl-for-window-management — L185](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-185-0) (line 185, col 0, score 0.91)
- [shared-package-layout-clarification — L161](shared-package-layout-clarification.md#^ref-36c8882a-161-0) (line 161, col 0, score 0.92)
- [Local-Only-LLM-Workflow — L147](local-only-llm-workflow.md#^ref-9a8ab57e-147-0) (line 147, col 0, score 0.86)
- [Lisp-Compiler-Integration — L521](lisp-compiler-integration.md#^ref-cfee6d36-521-0) (line 521, col 0, score 0.88)
- [System Scheduler with Resource-Aware DAG — L374](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-374-0) (line 374, col 0, score 1)
- [Promethean Pipelines: Local TypeScript-First Workflow — L220](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-220-0) (line 220, col 0, score 0.9)
- [Promethean Agent Config DSL — L279](promethean-agent-config-dsl.md#^ref-2c00ce45-279-0) (line 279, col 0, score 0.85)
- [Local-First Intention→Code Loop with Free Models — L105](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-105-0) (line 105, col 0, score 0.85)
- [Chroma-Embedding-Refactor — L289](chroma-embedding-refactor.md#^ref-8b256935-289-0) (line 289, col 0, score 0.87)
- [EidolonField — L205](eidolonfield.md#^ref-49d1e1e5-205-0) (line 205, col 0, score 0.86)
- [ecs-scheduler-and-prefabs — L376](ecs-scheduler-and-prefabs.md#^ref-c62a1815-376-0) (line 376, col 0, score 0.94)
- [template-based-compilation — L44](template-based-compilation.md#^ref-f8877e5e-44-0) (line 44, col 0, score 0.86)
- [refactor-relations — L10](refactor-relations.md#^ref-41ce0216-10-0) (line 10, col 0, score 0.85)
- [Promethean Agent DSL TS Scaffold — L818](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-818-0) (line 818, col 0, score 0.91)
- [js-to-lisp-reverse-compiler — L343](js-to-lisp-reverse-compiler.md#^ref-58191024-343-0) (line 343, col 0, score 0.92)
- [plan-update-confirmation — L1697](plan-update-confirmation.md#^ref-b22d79c6-1697-0) (line 1697, col 0, score 0.86)
- [typed-struct-compiler — L717](typed-struct-compiler.md#^ref-78eeedf7-717-0) (line 717, col 0, score 0.86)
- [Promethean Pipelines — L364](promethean-pipelines.md#^ref-8b8e6103-364-0) (line 364, col 0, score 0.86)
- [Promethean Pipelines — L363](promethean-pipelines.md#^ref-8b8e6103-363-0) (line 363, col 0, score 0.86)
- [typed-struct-compiler — L718](typed-struct-compiler.md#^ref-78eeedf7-718-0) (line 718, col 0, score 0.86)
- [plan-update-confirmation — L1695](plan-update-confirmation.md#^ref-b22d79c6-1695-0) (line 1695, col 0, score 0.86)
- [Promethean Dev Workflow Update — L447](promethean-dev-workflow-update.md#^ref-03a5578f-447-0) (line 447, col 0, score 0.89)
- [Performance-Optimized-Polyglot-Bridge — L593](performance-optimized-polyglot-bridge.md#^ref-f5579967-593-0) (line 593, col 0, score 0.89)
- [homeostasis-decay-formulas — L654](homeostasis-decay-formulas.md#^ref-37b5d236-654-0) (line 654, col 0, score 0.87)
- [Obsidian Templating Plugins Integration Guide — L313](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-313-0) (line 313, col 0, score 0.87)
- [i3-bluetooth-setup — L284](i3-bluetooth-setup.md#^ref-5e408692-284-0) (line 284, col 0, score 0.87)
- [Promethean Infrastructure Setup — L1127](promethean-infrastructure-setup.md#^ref-6deed6ac-1127-0) (line 1127, col 0, score 0.87)
- [Dynamic Context Model for Web Components — L846](dynamic-context-model-for-web-components.md#^ref-f7702bf8-846-0) (line 846, col 0, score 0.87)
- [Agent Reflections and Prompt Evolution — L366](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-366-0) (line 366, col 0, score 0.87)
- [polymorphic-meta-programming-engine — L190](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-190-0) (line 190, col 0, score 0.88)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L400](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-400-0) (line 400, col 0, score 0.9)
- [Interop and Source Maps — L497](interop-and-source-maps.md#^ref-cdfac40c-497-0) (line 497, col 0, score 0.87)
- [Fnord Tracer Protocol — L709](fnord-tracer-protocol.md#^ref-fc21f824-709-0) (line 709, col 0, score 0.95)
- [ParticleSimulationWithCanvasAndFFmpeg — L506](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-506-0) (line 506, col 0, score 0.95)
- [Eidolon Field Abstract Model — L436](eidolon-field-abstract-model.md#^ref-5e8b2388-436-0) (line 436, col 0, score 0.95)
- [Reawakening Duck — L378](reawakening-duck.md#^ref-59b5670f-378-0) (line 378, col 0, score 0.95)
- [heartbeat-fragment-demo — L303](heartbeat-fragment-demo.md#^ref-dd00677a-303-0) (line 303, col 0, score 0.95)
- [Ice Box Reorganization — L224](ice-box-reorganization.md#^ref-291c7d91-224-0) (line 224, col 0, score 0.95)
- [eidolon-field-math-foundations — L4590](eidolon-field-math-foundations.md#^ref-008f2ac0-4590-0) (line 4590, col 0, score 0.93)
- [eidolon-field-math-foundations — L4557](eidolon-field-math-foundations.md#^ref-008f2ac0-4557-0) (line 4557, col 0, score 0.93)
- [eidolon-field-math-foundations — L4573](eidolon-field-math-foundations.md#^ref-008f2ac0-4573-0) (line 4573, col 0, score 0.93)
- [Chroma Toolkit Consolidation Plan — L979](chroma-toolkit-consolidation-plan.md#^ref-5020e892-979-0) (line 979, col 0, score 0.93)
- [DSL — L244](chunks/dsl.md#^ref-e87bc036-244-0) (line 244, col 0, score 0.93)
- [JavaScript — L296](chunks/javascript.md#^ref-c1618c66-296-0) (line 296, col 0, score 0.93)
- [Window Management — L313](chunks/window-management.md#^ref-9e8ae388-313-0) (line 313, col 0, score 0.93)
- [Dynamic Context Model for Web Components — L1168](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1168-0) (line 1168, col 0, score 0.93)
- [komorebi-group-window-hack — L506](komorebi-group-window-hack.md#^ref-dd89372d-506-0) (line 506, col 0, score 0.93)
- [sibilant-macro-targets — L806](sibilant-macro-targets.md#^ref-c5c9a5c6-806-0) (line 806, col 0, score 0.93)
- [ts-to-lisp-transpiler — L250](ts-to-lisp-transpiler.md#^ref-ba11486b-250-0) (line 250, col 0, score 0.93)
- [DSL — L239](chunks/dsl.md#^ref-e87bc036-239-0) (line 239, col 0, score 0.93)
- [JavaScript — L316](chunks/javascript.md#^ref-c1618c66-316-0) (line 316, col 0, score 0.93)
- [Dynamic Context Model for Web Components — L1523](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1523-0) (line 1523, col 0, score 0.93)
- [graph-ds — L818](graph-ds.md#^ref-6620e2f2-818-0) (line 818, col 0, score 0.93)
- [Migrate to Provider-Tenant Architecture — L1488](migrate-to-provider-tenant-architecture.md#^ref-54382370-1488-0) (line 1488, col 0, score 0.93)
- [Performance-Optimized-Polyglot-Bridge — L1150](performance-optimized-polyglot-bridge.md#^ref-f5579967-1150-0) (line 1150, col 0, score 0.93)
- [Promethean Infrastructure Setup — L1557](promethean-infrastructure-setup.md#^ref-6deed6ac-1557-0) (line 1557, col 0, score 0.93)
- [Unique Info Dump Index — L934](unique-info-dump-index.md#^ref-30ec3ba6-934-0) (line 934, col 0, score 0.93)
- [RAG UI Panel with Qdrant and PostgREST — L349](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-349-0) (line 349, col 0, score 1)
- [WebSocket Gateway Implementation — L630](websocket-gateway-implementation.md#^ref-e811123d-630-0) (line 630, col 0, score 0.91)
- [Exception Layer Analysis — L63](exception-layer-analysis.md#^ref-21d5cc09-63-0) (line 63, col 0, score 0.91)
- [Universal Lisp Interface — L187](universal-lisp-interface.md#^ref-b01856b4-187-0) (line 187, col 0, score 0.92)
- [Promethean Web UI Setup — L440](promethean-web-ui-setup.md#^ref-bc5172ca-440-0) (line 440, col 0, score 0.9)
- [Promethean Event Bus MVP v0.1 — L972](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-972-0) (line 972, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L490](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-490-0) (line 490, col 0, score 0.85)
- [Shared Package Structure — L185](shared-package-structure.md#^ref-66a72fc3-185-0) (line 185, col 0, score 0.87)
- [Vectorial Exception Descent — L95](vectorial-exception-descent.md#^ref-d771154e-95-0) (line 95, col 0, score 1)
- [2d-sandbox-field — L150](2d-sandbox-field.md#^ref-c710dc93-150-0) (line 150, col 0, score 0.91)
- [i3-config-validation-methods — L28](i3-config-validation-methods.md#^ref-d28090ac-28-0) (line 28, col 0, score 0.9)
- [i3-layout-saver — L79](i3-layout-saver.md#^ref-31f0166e-79-0) (line 79, col 0, score 0.88)
- [Eidolon-Field-Optimization — L50](eidolon-field-optimization.md#^ref-40e05c14-50-0) (line 50, col 0, score 0.86)
- [prompt-programming-language-lisp — L56](prompt-programming-language-lisp.md#^ref-d41a06d1-56-0) (line 56, col 0, score 0.9)
- [sibilant-meta-string-templating-runtime — L92](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-92-0) (line 92, col 0, score 0.92)
- [layer-1-uptime-diagrams — L129](layer-1-uptime-diagrams.md#^ref-4127189a-129-0) (line 129, col 0, score 0.88)
- [ecs-offload-workers — L427](ecs-offload-workers.md#^ref-6498b9d7-427-0) (line 427, col 0, score 0.88)
- [Sibilant Meta-Prompt DSL — L120](sibilant-meta-prompt-dsl.md#^ref-af5d2824-120-0) (line 120, col 0, score 0.88)
- [Recursive Prompt Construction Engine — L147](recursive-prompt-construction-engine.md#^ref-babdb9eb-147-0) (line 147, col 0, score 1)
- [Promethean-native config design — L305](promethean-native-config-design.md#^ref-ab748541-305-0) (line 305, col 0, score 1)
- [State Snapshots API and Transactional Projector — L303](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-303-0) (line 303, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L232](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-232-0) (line 232, col 0, score 0.94)
- [observability-infrastructure-setup — L348](observability-infrastructure-setup.md#^ref-b4e64f8c-348-0) (line 348, col 0, score 0.89)
- [Post-Linguistic Transhuman Design Frameworks — L506](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-506-0) (line 506, col 0, score 0.86)
- [Promethean Dev Workflow Update — L546](promethean-dev-workflow-update.md#^ref-03a5578f-546-0) (line 546, col 0, score 0.86)
- [Promethean_Eidolon_Synchronicity_Model — L415](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-415-0) (line 415, col 0, score 0.86)
- [Promethean Infrastructure Setup — L1395](promethean-infrastructure-setup.md#^ref-6deed6ac-1395-0) (line 1395, col 0, score 0.86)
- [Pure TypeScript Search Microservice — L1293](pure-typescript-search-microservice.md#^ref-d17d3a96-1293-0) (line 1293, col 0, score 0.86)
- [ripple-propagation-demo — L581](ripple-propagation-demo.md#^ref-8430617b-581-0) (line 581, col 0, score 0.86)
- [schema-evolution-workflow — L1263](schema-evolution-workflow.md#^ref-d8059b6a-1263-0) (line 1263, col 0, score 0.86)
- [sibilant-macro-targets — L887](sibilant-macro-targets.md#^ref-c5c9a5c6-887-0) (line 887, col 0, score 0.86)
- [ecs-scheduler-and-prefabs — L7](ecs-scheduler-and-prefabs.md#^ref-c62a1815-7-0) (line 7, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L5](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-5-0) (line 5, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
