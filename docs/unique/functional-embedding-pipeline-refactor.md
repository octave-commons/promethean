---
uuid: a4a25141-6380-40b9-9cd7-b554b246b303
created_at: 2025.09.01.10.58.21.md
filename: Functional Embedding Pipeline Refactor
description: >-
  This refactor isolates I/O operations at the edges of the system, ensuring
  pure mappers and reducers handle core logic. It introduces safe caching via
  content-hash compatibility and bounds concurrency to prevent Ollama overload.
  The design maintains output consistency while improving error resilience
  through doc-level error handling.
tags:
  - functional
  - caching
  - concurrency
  - embeddings
  - io-boundary
  - pure-functions
  - error-handling
  - type-safety
related_to_uuid:
  - 78eeedf7-75bc-4692-a5a7-bb6857270621
  - 1b1338fc-bb4d-41df-828f-e219cc9442eb
  - ae24a280-678e-4c0b-8cc4-56667fa04172
  - f5579967-762d-4cfd-851e-4f71b4cb77a1
  - 1cfae310-35dc-49c2-98f1-b186da25d84b
  - d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
  - 7b7ca860-780c-44fa-8d3f-be8bd9496fba
  - c03020e1-e3e7-48bf-aa7e-aa740c601b63
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - d17d3a96-c84d-4738-a403-6c733b874da2
  - c5c9a5c6-427d-4864-8084-c083cd55faa0
  - 18138627-a348-4fbb-b447-410dfb400564
  - 13951643-1741-46bb-89dc-1beebb122633
  - 9a93a756-6d33-45d1-aca9-51b74f2b33d2
  - 43bfe9dd-d433-42ca-9777-f4c40eaba791
  - a4d90289-798d-44a0-a8e8-a055ae12fb52
  - d144aa62-348c-4e5d-ae8f-38084c67ceca
  - bd4f0976-0d5b-47f6-a20a-0601d1842dc1
  - 4330e8f0-5f46-4235-918b-39b6b93fa561
  - 291c7d91-da8c-486c-9bc0-bd2254536e2d
  - b22d79c6-825b-4cd3-b0d3-1cef0532bb54
  - 59b5670f-36d3-4d34-8985-f3144b15347a
  - db74343f-8f84-43a3-adb2-499c6f00be1c
  - 8430617b-80a2-4cc9-8288-9a74cb57990b
  - 8b8e6103-30a4-4d66-b5f2-87db1612b587
  - 95205cd3-c3d5-4047-9c33-9c5ca2b49597
  - 23df6ddb-05cf-4639-8201-f8291f8a6026
  - e90b5a16-d58f-424d-bd36-70e9bd2861ad
  - ffb9b2a9-744d-4a53-9565-130fceae0832
  - 10d98225-12e0-4212-8e15-88b57cf7bee5
  - 1c4046b5-742d-4004-aec6-b47251fef5d6
  - c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
  - c26f0044-26fe-4c43-8ab0-fc4690723e3c
  - ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
  - ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - 5a02283e-4281-4930-9ca7-e27849de11bd
  - 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
  - b3555ede-324a-4d24-a885-b0721e74babf
  - 49a9a860-944c-467a-b532-4f99186a8593
  - 91295f3a-a2af-4050-a2b8-4777ea70c32c
  - 62bec6f0-4e13-4f38-aca4-72c84ba02367
  - 9b694a91-dec5-4708-9462-3f71000ba925
  - 5c152b08-6b69-4bb8-a1a7-66745789c169
  - d614d983-7795-491f-9437-09f3a43f72cf
  - ac9d3ac5-9a6a-4180-a67f-1ab7e229d981
  - dd89372d-10de-42a9-8c96-6bc13ea36d02
  - 64a9f9f9-58ee-4996-bdaf-9373845c6b29
  - e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
  - 1d3d6c3a-039e-4b96-93c1-95854945e248
  - b39dc9d4-63e2-42d4-bbcd-041ef3167bca
  - ca8e1399-77bf-4f77-82a3-3f703b68706d
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 0f6f8f38-98d0-438f-9601-58f478acc0b7
  - 6620e2f2-de6d-45d8-a722-5d26e160b370
  - 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
  - 2792d448-c3b5-4050-93dd-93768529d99c
  - cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
  - 54382370-1931-4a19-a634-46735708a9ea
  - 6bcff92c-4224-453d-9993-1be8d37d47c3
  - 6cb4943e-8267-4e27-8618-2ce0a464d173
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - e87bc036-1570-419e-a558-f45b9c0db698
  - 9e8ae388-767a-4ea8-9f2e-88801291d947
  - 03a5578f-d689-45db-95e9-11300e5eee6f
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - fc21f824-4244-4030-a48e-c4170160ea1d
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - bb7f0835-c347-474f-bfad-eabd873b51ad
  - b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - 5e408692-0e74-400e-a617-84247c7353ad
  - dd00677a-2280-45a7-91af-0728b21af3ad
  - 2901a3e9-96f0-497c-ae2c-775f28a702dd
  - c1618c66-f73a-4e04-9bfa-ef38755f7acc
  - 0580dcd3-533d-4834-8a2f-eae3771960a9
  - 18344cf9-0c49-4a71-b6c8-b8d84d660fca
  - 0b872af2-4197-46f3-b631-afb4e6135585
  - b09141b7-544f-4c8e-8f49-bf76cecaacbb
  - 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
  - 22b989d5-f4aa-4880-8632-709c21830f83
  - 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
  - 45cd25b5-ed36-49ab-82c8-10d0903e34db
  - f1add613-656e-4bec-b52b-193fd78c4642
  - 623a55f7-685c-486b-abaf-469da1bbbb69
  - 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
  - 71726f04-eb1c-42a5-a5fe-d8209de6e159
  - 930054b3-ba95-4acf-bb92-0e3ead25ed0b
  - 557309a3-c906-4e97-8867-89ffe151790c
  - e979c50f-69bb-48b0-8417-e1ee1b31c0c0
  - 37b5d236-2b3e-4a95-a4e8-31655c3023ef
  - 86a691ec-ca1f-4350-824c-0ded1f8ebe70
  - 40185d05-010e-45e7-8c2d-2f879bf14218
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
  - 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
  - 9c79206d-4cb9-4f00-87e0-782dcea37bc7
  - e2135d9f-c69d-47ee-9b17-0b05e98dc748
  - 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
  - 9413237f-2537-4bbf-8768-db6180970e36
  - c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
  - 75ea4a6a-8270-488d-9d37-799c288e5f70
  - c0392040-16a2-41e8-bd54-75110319e3c0
  - 5f65dfa5-dc97-4a6c-ad93-c45c1312e156
  - d3e7db72-2e07-4dae-8920-0e07c499a1e5
  - ac60a1d6-fd9f-46dc-bbe7-176dd8017c59
  - 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
  - b01856b4-999f-418d-8009-ade49b00eb0f
  - ab748541-020e-4a7e-b07d-28173bd5bea2
  - 80d4d883-59f9-401b-8699-7a2723148b1e
  - e1056831-ae0c-460b-95fa-4cf09b3398c6
  - 8b256935-02f6-4da2-a406-bf6b8415276f
  - 36c8882a-badc-4e18-838d-2c54d7038141
  - b4e64f8c-4dc9-4941-a877-646c5ada068e
  - c34c36a6-80c9-4b44-a200-6448543b1b33
  - fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
  - cbfe3513-6a4a-4d2e-915d-ddfab583b2de
  - c14edce7-0656-45b2-aaf3-51f042451b7d
  - 681a4ab2-8fef-4833-a09d-bceb62d114da
related_to_title:
  - typed-struct-compiler
  - Canonical Org-Babel Matplotlib Animation Template
  - Promethean-Copilot-Intent-Engine
  - Performance-Optimized-Polyglot-Bridge
  - Functional Refactor of TypeScript Document Processing
  - schema-evolution-workflow
  - TypeScript Patch for Tool Calling Support
  - Per-Domain Policy System for JS Crawler
  - Promethean Infrastructure Setup
  - Pure TypeScript Search Microservice
  - sibilant-macro-targets
  - The Jar of Echoes
  - Duck's Attractor States
  - Protocol_0_The_Contradiction_Engine
  - Provider-Agnostic Chat Panel Implementation
  - Factorio AI with External Agents
  - Model Selection for Lightweight Conversational Tasks
  - Prompt_Folder_Bootstrap
  - Stateful Partitions and Rebalancing
  - Ice Box Reorganization
  - plan-update-confirmation
  - Reawakening Duck
  - Model Upgrade Calm-Down Guide
  - ripple-propagation-demo
  - Promethean Pipelines
  - promethean-requirements
  - Promethean State Format
  - Prometheus Observability Stack
  - obsidian-ignore-node-modules-regex
  - Creative Moments
  - Promethean Notes
  - Tracing the Signal
  - unique-templates
  - ts-to-lisp-transpiler
  - Unique Concepts
  - Unique Info Dump Index
  - NPU Voice Code and Sensory Integration
  - Optimizing Command Limitations in System Design
  - Redirecting Standard Error
  - Self-Agency in AI Interaction
  - Synchronicity Waves and Web
  - zero-copy-snapshots-and-workers
  - Obsidian Task Generation
  - OpenAPI Validation Report
  - Promethean Workflow Optimization
  - Smoke Resonance Visualizations
  - komorebi-group-window-hack
  - Layer1SurvivabilityEnvelope
  - ParticleSimulationWithCanvasAndFFmpeg
  - Obsidian ChatGPT Plugin Integration Guide
  - Obsidian Templating Plugins Integration Guide
  - Obsidian ChatGPT Plugin Integration
  - eidolon-field-math-foundations
  - windows-tiling-with-autohotkey
  - graph-ds
  - Promethean Documentation Pipeline Overview
  - Docops Feature Updates
  - Migrate to Provider-Tenant Architecture
  - Post-Linguistic Transhuman Design Frameworks
  - Tooling
  - Chroma Toolkit Consolidation Plan
  - DSL
  - Window Management
  - Promethean Dev Workflow Update
  - 'Agent Tasks: Persistence Migration to DualStore'
  - Fnord Tracer Protocol
  - Dynamic Context Model for Web Components
  - Agent Reflections and Prompt Evolution
  - Mathematics Sampler
  - Eidolon Field Abstract Model
  - i3-bluetooth-setup
  - heartbeat-fragment-demo
  - Admin Dashboard for User Management
  - JavaScript
  - api-gateway-versioning
  - Promethean Chat Activity Report
  - Promethean Documentation Update
  - field-interaction-equations
  - field-dynamics-math-blocks
  - field-node-diagram-set
  - eidolon-node-lifecycle
  - Diagrams
  - Operations
  - Shared
  - Debugging Broker Connections and Agent Behavior
  - Duck's Self-Referential Perceptual Loop
  - ChatGPT Custom Prompts
  - Simulation Demo
  - DuckDuckGoSearchPipeline
  - homeostasis-decay-formulas
  - Mathematical Samplers
  - Mindful Prioritization
  - field-node-diagram-outline
  - field-node-diagram-visualizations
  - Promethean_Eidolon_Synchronicity_Model
  - polyglot-repl-interface-layer
  - Pipeline Enhancements
  - Promethean Data Sync Protocol
  - Promethean Documentation Overview
  - Math Fundamentals
  - Services
  - MindfulRobotIntegration
  - balanced-bst
  - Board Automation Improvements
  - Board Walk – 2025-08-11
  - Universal Lisp Interface
  - Promethean-native config design
  - Refactor 05-footers.ts
  - RAG UI Panel with Qdrant and PostgREST
  - Chroma-Embedding-Refactor
  - shared-package-layout-clarification
  - observability-infrastructure-setup
  - Cross-Language Runtime Polymorphism
  - Promethean Event Bus MVP v0.1
  - Lispy Macros with syntax-rules
  - universal-intention-code-fabric
  - SentenceProcessing
references:
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 94
    col: 0
    score: 0.86
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 135
    col: 0
    score: 0.85
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 89
    col: 0
    score: 0.86
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 590
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 574
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 604
    col: 0
    score: 1
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 13
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 131
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 107
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 38
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 407
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 538
    col: 0
    score: 1
  - uuid: ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
    line: 11
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 224
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 582
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 620
    col: 0
    score: 1
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 11
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 130
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 106
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 44
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 409
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 554
    col: 0
    score: 1
  - uuid: ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
    line: 9
    col: 0
    score: 1
  - uuid: 930054b3-ba95-4acf-bb92-0e3ead25ed0b
    line: 18
    col: 0
    score: 1
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 12
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 139
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 104
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 45
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 411
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 566
    col: 0
    score: 1
  - uuid: ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
    line: 10
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 144
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 396
    col: 0
    score: 1
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 68
    col: 0
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 49
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 73
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 43
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 104
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 44
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 75
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 48
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 127
    col: 0
    score: 1
  - uuid: 930054b3-ba95-4acf-bb92-0e3ead25ed0b
    line: 22
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 280
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 124
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 148
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 511
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 240
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 123
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 222
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 270
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 494
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 299
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 465
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 202
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 242
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 190
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 142
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 325
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 297
    col: 0
    score: 1
  - uuid: 86a691ec-ca1f-4350-824c-0ded1f8ebe70
    line: 115
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 342
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 151
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 94
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 117
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 140
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 76
    col: 0
    score: 1
  - uuid: f1add613-656e-4bec-b52b-193fd78c4642
    line: 33
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 98
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 179
    col: 0
    score: 1
  - uuid: 86a691ec-ca1f-4350-824c-0ded1f8ebe70
    line: 116
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 136
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 95
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 133
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 608
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 224
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 329
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 686
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 93
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 212
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 592
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 106
    col: 0
    score: 1
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 192
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 159
    col: 0
    score: 0.86
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 140
    col: 0
    score: 0.86
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 304
    col: 0
    score: 0.86
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 684
    col: 0
    score: 0.86
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 390
    col: 0
    score: 0.86
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 311
    col: 0
    score: 0.86
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 223
    col: 0
    score: 0.86
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 388
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 537
    col: 0
    score: 0.86
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 360
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1322
    col: 0
    score: 0.86
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 272
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 245
    col: 0
    score: 1
  - uuid: b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
    line: 132
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 375
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 215
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 164
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 90
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 132
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 172
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 336
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 137
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 163
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 559
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 615
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 556
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 409
    col: 0
    score: 1
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 156
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 127
    col: 0
    score: 1
  - uuid: 930054b3-ba95-4acf-bb92-0e3ead25ed0b
    line: 36
    col: 0
    score: 1
  - uuid: f1add613-656e-4bec-b52b-193fd78c4642
    line: 48
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 51
    col: 0
    score: 1
  - uuid: 86a691ec-ca1f-4350-824c-0ded1f8ebe70
    line: 66
    col: 0
    score: 1
  - uuid: b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
    line: 70
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 364
    col: 0
    score: 1
  - uuid: 40185d05-010e-45e7-8c2d-2f879bf14218
    line: 20
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 203
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 25
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 87
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 89
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 111
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 25
    col: 0
    score: 1
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 43
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 79
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 541
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 375
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 78
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 176
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 154
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 175
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 123
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 274
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 412
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 159
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 95
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 237
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 541
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 222
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 131
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 416
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 20
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 37
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 59
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 103
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 84
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 134
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 547
    col: 0
    score: 1
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 21
    col: 0
    score: 1
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 87
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 24
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 128
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 35
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 131
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 33
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 268
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 242
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 200
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 194
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 172
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 91
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 87
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 88
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 150
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 132
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1046
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 594
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 578
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 616
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 571
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 385
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 176
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 195
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 198
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 65
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1028
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 208
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 127
    col: 0
    score: 1
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 36
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 49
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 18
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 77
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 39
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 67
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 22
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 107
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 88
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 198
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 483
    col: 0
    score: 1
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 11
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1026
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 219
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 126
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 33
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 100
    col: 0
    score: 1
  - uuid: 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
    line: 15
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 107
    col: 0
    score: 1
  - uuid: 9413237f-2537-4bbf-8768-db6180970e36
    line: 9
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 71
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 105
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 71
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 183
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 279
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 159
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 423
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 158
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 103
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 253
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 202
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 160
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 276
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 628
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 161
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 35
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 603
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 57
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 250
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 184
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 283
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 629
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 36
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 623
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 58
    col: 0
    score: 1
  - uuid: ac9d3ac5-9a6a-4180-a67f-1ab7e229d981
    line: 108
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 654
    col: 0
    score: 1
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 123
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 76
    col: 0
    score: 1
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 69
    col: 0
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 62
    col: 0
    score: 1
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 54
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 56
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 87
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 82
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 467
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 205
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 164
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 39
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 625
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 60
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 253
    col: 0
    score: 1
  - uuid: ac9d3ac5-9a6a-4180-a67f-1ab7e229d981
    line: 128
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 644
    col: 0
    score: 1
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 125
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 574
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 541
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 503
    col: 0
    score: 1
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 17
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1056
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 116
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 41
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 118
    col: 0
    score: 1
  - uuid: 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
    line: 20
    col: 0
    score: 1
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 92
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 565
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 244
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 159
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 517
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 69
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 305
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 487
    col: 0
    score: 1
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 49
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1032
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 213
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 129
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 95
    col: 0
    score: 1
  - uuid: 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
    line: 74
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 88
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 606
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 619
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 90
    col: 0
    score: 1
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 80
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 87
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 582
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 572
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 2563
    col: 0
    score: 0.93
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 2162
    col: 0
    score: 0.92
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 2138
    col: 0
    score: 0.92
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 2146
    col: 0
    score: 0.92
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2382
    col: 0
    score: 0.92
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3746
    col: 0
    score: 0.92
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 3771
    col: 0
    score: 0.92
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 635
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 172
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 73
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 162
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 612
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 94
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 246
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 638
    col: 0
    score: 1
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 55
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 537
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 493
    col: 0
    score: 1
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 18
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 206
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 159
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 66
    col: 0
    score: 1
  - uuid: 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
    line: 45
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 98
    col: 0
    score: 1
  - uuid: 9413237f-2537-4bbf-8768-db6180970e36
    line: 16
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 202
    col: 0
    score: 1
  - uuid: c0392040-16a2-41e8-bd54-75110319e3c0
    line: 46
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 588
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 190
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 217
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 165
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 306
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 165
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 442
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 194
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 135
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 278
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 225
    col: 0
    score: 1
  - uuid: 86a691ec-ca1f-4350-824c-0ded1f8ebe70
    line: 78
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 372
    col: 0
    score: 1
  - uuid: 9413237f-2537-4bbf-8768-db6180970e36
    line: 22
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 176
    col: 0
    score: 1
  - uuid: c0392040-16a2-41e8-bd54-75110319e3c0
    line: 50
    col: 0
    score: 1
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 49
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 52
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 122
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 63
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 136
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 61
    col: 0
    score: 1
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 50
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 53
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 132
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 64
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 62
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 570
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 167
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 288
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 634
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 605
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 561
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 645
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 671
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 147
    col: 0
    score: 1
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 241
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 228
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 106
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 156
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 266
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 227
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 152
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 139
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 68
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 211
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 75
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 629
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 95
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 264
    col: 0
    score: 1
  - uuid: ac9d3ac5-9a6a-4180-a67f-1ab7e229d981
    line: 144
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 658
    col: 0
    score: 1
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 140
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 668
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 213
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 83
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 647
    col: 0
    score: 1
  - uuid: ac9d3ac5-9a6a-4180-a67f-1ab7e229d981
    line: 163
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 682
    col: 0
    score: 1
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 168
    col: 0
    score: 1
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 65
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 191
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 209
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 137
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 138
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 207
    col: 0
    score: 1
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 59
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1100
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 230
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 125
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 147
    col: 0
    score: 1
  - uuid: 5f65dfa5-dc97-4a6c-ad93-c45c1312e156
    line: 55
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 114
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 61
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 118
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 119
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 124
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 190
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 558
    col: 0
    score: 1
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 34
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1084
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 110
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 313
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 255
    col: 0
    score: 1
  - uuid: 86a691ec-ca1f-4350-824c-0ded1f8ebe70
    line: 93
    col: 0
    score: 1
  - uuid: b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
    line: 98
    col: 0
    score: 1
  - uuid: 40185d05-010e-45e7-8c2d-2f879bf14218
    line: 65
    col: 0
    score: 1
  - uuid: 5f65dfa5-dc97-4a6c-ad93-c45c1312e156
    line: 63
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 226
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 123
    col: 0
    score: 1
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 38
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1090
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 676
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 81
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 194
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 650
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 100
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 285
    col: 0
    score: 1
  - uuid: ac9d3ac5-9a6a-4180-a67f-1ab7e229d981
    line: 170
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 686
    col: 0
    score: 1
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 171
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 575
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 157
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 65
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 359
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 539
    col: 0
    score: 1
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 33
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 259
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 182
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 79
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 600
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 583
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 610
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 546
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 150
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 30
    col: 0
    score: 1
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 47
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 82
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 148
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 60
    col: 0
    score: 1
  - uuid: 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
    line: 39
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 168
    col: 0
    score: 1
  - uuid: c0392040-16a2-41e8-bd54-75110319e3c0
    line: 40
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 84
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 60
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 128
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 61
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 163
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 124
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 481
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 260
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 100
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 356
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 575
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 535
    col: 0
    score: 1
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 37
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1089
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 260
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 183
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 158
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 216
    col: 0
    score: 1
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 60
    col: 0
    score: 1
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 149
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 197
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 655
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 252
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 208
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 154
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 310
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 257
    col: 0
    score: 1
  - uuid: 86a691ec-ca1f-4350-824c-0ded1f8ebe70
    line: 89
    col: 0
    score: 1
  - uuid: b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
    line: 94
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 399
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 66
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 124
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 675
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 123
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 65
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 485
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 257
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 221
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 99
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 227
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 212
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 226
    col: 0
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 287
    col: 0
    score: 1
  - uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
    line: 302
    col: 0
    score: 1
  - uuid: ac60a1d6-fd9f-46dc-bbe7-176dd8017c59
    line: 15
    col: 0
    score: 1
  - uuid: 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
    line: 137
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 593
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 561
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 607
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 548
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 50
    col: 0
    score: 1
  - uuid: 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
    line: 28
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 232
    col: 0
    score: 1
  - uuid: c0392040-16a2-41e8-bd54-75110319e3c0
    line: 29
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 260
    col: 0
    score: 1
  - uuid: 86a691ec-ca1f-4350-824c-0ded1f8ebe70
    line: 99
    col: 0
    score: 1
  - uuid: b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
    line: 104
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 404
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 228
    col: 0
    score: 1
  - uuid: c0392040-16a2-41e8-bd54-75110319e3c0
    line: 69
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 613
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 298
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 334
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 684
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 222
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 91
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 208
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 219
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 258
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 161
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 267
    col: 0
    score: 1
  - uuid: b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
    line: 100
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 388
    col: 0
    score: 1
  - uuid: 40185d05-010e-45e7-8c2d-2f879bf14218
    line: 69
    col: 0
    score: 1
  - uuid: 5f65dfa5-dc97-4a6c-ad93-c45c1312e156
    line: 67
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 234
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 129
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 74
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 130
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 131
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 161
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 737
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 74
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 147
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 77
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 107
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 74
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 604
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 232
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 215
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 57
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 124
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 81
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 183
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 69
    col: 0
    score: 1
  - uuid: f1add613-656e-4bec-b52b-193fd78c4642
    line: 36
    col: 0
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 46
    col: 0
    score: 1
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 40
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 53
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 33
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 519
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 236
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 124
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 75
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 131
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 132
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 164
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 74
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 205
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 265
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 594
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 282
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 241
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 128
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 231
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 250
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 485
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 221
    col: 0
    score: 1
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 93
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 128
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 364
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 548
    col: 0
    score: 1
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 43
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 266
    col: 0
    score: 1
  - uuid: 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
    line: 67
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 131
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 225
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 237
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 223
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 233
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 339
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 193
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 476
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 209
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 133
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 138
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 76
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 518
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 290
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 130
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 239
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 244
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 264
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 216
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 242
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 190
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 344
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 196
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 96
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 215
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 199
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 280
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 291
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 208
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 192
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 620
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 244
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 443
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 172
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 166
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 279
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 226
    col: 0
    score: 1
  - uuid: 86a691ec-ca1f-4350-824c-0ded1f8ebe70
    line: 106
    col: 0
    score: 1
  - uuid: b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
    line: 110
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 649
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 213
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 668
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 150
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 260
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 330
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 307
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 590
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1138
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 691
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 245
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 167
    col: 0
    score: 1
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 101
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 766
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 111
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 158
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 177
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 310
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 370
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 545
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 262
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 491
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 309
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 379
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 589
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 566
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1134
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 180
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 149
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 274
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 205
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 190
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 185
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 618
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 223
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 146
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 289
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 281
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 265
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 160
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 195
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 110
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 343
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 572
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 320
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 183
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 250
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 177
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 191
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 149
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 366
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 220
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 406
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 218
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 167
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 264
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 144
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 91
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 144
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 93
    col: 0
    score: 1
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 108
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 136
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 530
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1101
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 151
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 105
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 150
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 258
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 164
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 351
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 201
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 609
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 133
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 93
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 81
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 228
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 183
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 213
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 160
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 371
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 206
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 440
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 189
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 229
    col: 0
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 90
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 91
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 107
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 49
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 148
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 103
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 495
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 264
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 120
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 204
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 427
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 179
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 200
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 201
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 120
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 262
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 201
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 184
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 189
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 267
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 282
    col: 0
    score: 1
  - uuid: 5f65dfa5-dc97-4a6c-ad93-c45c1312e156
    line: 78
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 254
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 163
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 381
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 571
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1129
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 275
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 194
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 174
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 239
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 566
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 602
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 641
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 656
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 505
    col: 0
    score: 0.9
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 435
    col: 0
    score: 0.9
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 684
    col: 0
    score: 0.9
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 603
    col: 0
    score: 0.9
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 347
    col: 0
    score: 0.9
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 520
    col: 0
    score: 0.9
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 755
    col: 0
    score: 0.9
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 277
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 250
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 364
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 222
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 504
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 281
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 222
    col: 0
    score: 1
  - uuid: 86a691ec-ca1f-4350-824c-0ded1f8ebe70
    line: 119
    col: 0
    score: 1
  - uuid: b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
    line: 121
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 276
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 176
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 193
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 322
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 293
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 173
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 91
    col: 0
    score: 1
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 103
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 595
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 555
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1102
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 170
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 88
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 609
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 313
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 226
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 369
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 689
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 253
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 127
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 95
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 621
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 238
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 344
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 640
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 232
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 102
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 180
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 120
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 809
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 202
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 171
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 87
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 617
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 315
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 338
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 698
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 242
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 284
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 285
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 417
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 142
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 562
    col: 0
    score: 1
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 67
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1152
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 203
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 214
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 250
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 286
    col: 0
    score: 1
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 75
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 172
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 603
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 573
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1137
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 274
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 177
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 189
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 233
    col: 0
    score: 1
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 94
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 100
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 181
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 372
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 207
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 469
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 217
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 226
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 191
    col: 0
    score: 1
  - uuid: 86a691ec-ca1f-4350-824c-0ded1f8ebe70
    line: 121
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 160
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 75
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 601
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1116
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 228
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 211
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 257
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 54
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 50
    col: 0
    score: 1
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 76
    col: 0
    score: 1
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 55
    col: 0
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 68
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 68
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 97
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 255
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 212
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 211
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 210
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 236
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 289
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 344
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 166
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 130
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 199
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 143
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 94
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 87
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 268
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 177
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 93
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 141
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 173
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 604
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1063
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 207
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 272
    col: 0
    score: 1
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 103
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 814
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 190
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 83
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 104
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 179
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1070
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 199
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 148
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 196
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 191
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 512
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 40
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 108
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 60
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 89
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 45
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 126
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 117
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 142
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 288
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 37
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 104
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 374
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 270
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 164
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 282
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 207
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 89
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 197
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 625
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 281
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 746
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 186
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 179
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 550
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 163
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 319
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 619
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 237
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 227
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 200
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 237
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 179
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 382
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 222
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 109
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 110
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 178
    col: 0
    score: 1
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 41
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 48
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 79
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 69
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 158
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 178
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 126
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 228
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 157
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 500
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 505
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 576
    col: 0
    score: 1
  - uuid: 930054b3-ba95-4acf-bb92-0e3ead25ed0b
    line: 80
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 140
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 519
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 284
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 259
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 288
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 669
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 628
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 2877
    col: 0
    score: 0.86
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2709
    col: 0
    score: 0.86
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 4316
    col: 0
    score: 0.86
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 3243
    col: 0
    score: 0.86
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 7354
    col: 0
    score: 0.86
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 3270
    col: 0
    score: 0.86
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 7381
    col: 0
    score: 0.86
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 145
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 208
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 76
    col: 0
    score: 1
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 106
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 127
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 146
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 241
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 272
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 165
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 219
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 363
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 407
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 267
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 158
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 135
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 594
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 558
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1106
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 158
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 188
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 213
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 149
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 288
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 417
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 177
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 214
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 151
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 121
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 238
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 203
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 589
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 130
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 283
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 301
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1078
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 91
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 82
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 284
    col: 0
    score: 1
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 164
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 739
    col: 0
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 61
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 37
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 59
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 34
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 117
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 93
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 310
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 208
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 192
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 272
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 307
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 180
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 294
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 230
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 386
    col: 0
    score: 1
  - uuid: 40185d05-010e-45e7-8c2d-2f879bf14218
    line: 36
    col: 0
    score: 1
  - uuid: 5f65dfa5-dc97-4a6c-ad93-c45c1312e156
    line: 34
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 251
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 41
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 110
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 756
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 176
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 91
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 200
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 552
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 288
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 188
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 323
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 255
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 355
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 271
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 185
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 295
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 247
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 182
    col: 0
    score: 1
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 107
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1131
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 79
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 145
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 543
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 282
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 255
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 386
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 276
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 414
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 217
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 150
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 281
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 237
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 112
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 240
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 248
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 206
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 231
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 179
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 379
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 212
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 142
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 193
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 183
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 197
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 157
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 189
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 135
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 415
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 148
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 93
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 304
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 241
    col: 0
    score: 1
  - uuid: 86a691ec-ca1f-4350-824c-0ded1f8ebe70
    line: 125
    col: 0
    score: 1
  - uuid: b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
    line: 131
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 387
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 223
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 179
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 105
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 106
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 139
    col: 0
    score: 1
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 117
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 798
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 105
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 210
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 602
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 282
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 216
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 674
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 254
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 467
    col: 0
    score: 0.95
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 296
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 790
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1712
    col: 0
    score: 0.99
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 412
    col: 0
    score: 0.97
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 265
    col: 0
    score: 0.97
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 869
    col: 0
    score: 0.97
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 379
    col: 0
    score: 0.97
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 670
    col: 0
    score: 0.97
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 338
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 303
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 548
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 598
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 266
    col: 0
    score: 1
  - uuid: ac9d3ac5-9a6a-4180-a67f-1ab7e229d981
    line: 242
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 387
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 333
    col: 0
    score: 1
  - uuid: 930054b3-ba95-4acf-bb92-0e3ead25ed0b
    line: 114
    col: 0
    score: 0.96
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 292
    col: 0
    score: 0.96
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1832
    col: 0
    score: 1
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 434
    col: 0
    score: 0.96
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 310
    col: 0
    score: 0.96
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 456
    col: 0
    score: 0.96
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1094
    col: 0
    score: 0.95
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1777
    col: 0
    score: 0.95
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 838
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 487
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 471
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 221
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 736
    col: 0
    score: 0.93
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 260
    col: 0
    score: 0.92
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 332
    col: 0
    score: 0.92
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 560
    col: 0
    score: 0.92
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 601
    col: 0
    score: 0.92
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 403
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 615
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 392
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 514
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 755
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 402
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 153
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 265
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 442
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 518
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 449
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 321
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 275
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 243
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 604
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 290
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 271
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 895
    col: 0
    score: 0.97
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 729
    col: 0
    score: 0.97
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 313
    col: 0
    score: 0.97
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 717
    col: 0
    score: 0.97
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1075
    col: 0
    score: 0.97
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 450
    col: 0
    score: 0.97
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 679
    col: 0
    score: 0.97
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 474
    col: 0
    score: 0.97
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1537
    col: 0
    score: 0.97
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 470
    col: 0
    score: 0.97
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 122
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 573
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 456
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 327
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 457
    col: 0
    score: 0.99
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 947
    col: 0
    score: 0.99
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 904
    col: 0
    score: 0.99
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 335
    col: 0
    score: 0.96
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 657
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 845
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 702
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 455
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 366
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 816
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 315
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 645
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 609
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1256
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 747
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 293
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 183
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 834
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 336
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 347
    col: 0
    score: 0.97
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 148
    col: 0
    score: 0.96
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 346
    col: 0
    score: 0.96
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 272
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 294
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 548
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 383
    col: 0
    score: 0.97
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 574
    col: 0
    score: 0.97
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 922
    col: 0
    score: 0.96
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1575
    col: 0
    score: 0.96
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 365
    col: 0
    score: 0.96
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 327
    col: 0
    score: 0.96
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 509
    col: 0
    score: 0.96
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 281
    col: 0
    score: 0.96
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 486
    col: 0
    score: 0.96
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 369
    col: 0
    score: 0.96
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 460
    col: 0
    score: 0.96
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 836
    col: 0
    score: 0.96
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 638
    col: 0
    score: 0.96
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 796
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 409
    col: 0
    score: 0.96
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 337
    col: 0
    score: 0.96
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 453
    col: 0
    score: 0.96
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 344
    col: 0
    score: 0.95
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 139
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1593
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 404
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 192
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 416
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 396
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 984
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 933
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 420
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 683
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 2222
    col: 0
    score: 0.95
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 3096
    col: 0
    score: 0.95
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 749
    col: 0
    score: 0.95
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 283
    col: 0
    score: 0.95
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 531
    col: 0
    score: 0.94
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 2706
    col: 0
    score: 0.94
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 1883
    col: 0
    score: 0.94
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 847
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 472
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 412
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 958
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 470
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 748
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 444
    col: 0
    score: 0.96
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 341
    col: 0
    score: 0.96
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 347
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 826
    col: 0
    score: 0.99
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 510
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 688
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 806
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1095
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1204
    col: 0
    score: 0.99
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 460
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 879
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 692
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 390
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 361
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 589
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 532
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1019
    col: 0
    score: 0.94
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1764
    col: 0
    score: 0.94
  - uuid: 86a691ec-ca1f-4350-824c-0ded1f8ebe70
    line: 179
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 441
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 488
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 527
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 342
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 1155
    col: 0
    score: 0.96
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 2020
    col: 0
    score: 0.96
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 1302
    col: 0
    score: 0.96
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 1545
    col: 0
    score: 0.96
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 913
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 425
    col: 0
    score: 0.96
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 308
    col: 0
    score: 0.96
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 909
    col: 0
    score: 0.96
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 361
    col: 0
    score: 0.96
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 410
    col: 0
    score: 0.96
  - uuid: b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
    line: 169
    col: 0
    score: 0.96
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 560
    col: 0
    score: 0.96
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1104
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 350
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 385
    col: 0
    score: 0.97
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 969
    col: 0
    score: 0.97
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 362
    col: 0
    score: 0.97
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 917
    col: 0
    score: 0.97
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 573
    col: 0
    score: 0.97
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 470
    col: 0
    score: 0.97
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 315
    col: 0
    score: 0.97
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 612
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 633
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 212
    col: 0
    score: 0.99
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 308
    col: 0
    score: 0.95
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 617
    col: 0
    score: 0.95
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 435
    col: 0
    score: 0.95
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 789
    col: 0
    score: 0.95
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 422
    col: 0
    score: 0.95
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 611
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 297
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2941
    col: 0
    score: 0.97
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 3165
    col: 0
    score: 0.96
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 3175
    col: 0
    score: 0.96
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2529
    col: 0
    score: 0.95
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 406
    col: 0
    score: 0.95
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 3027
    col: 0
    score: 0.95
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 295
    col: 0
    score: 0.95
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 401
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 89
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 151
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1435
    col: 0
    score: 0.98
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 420
    col: 0
    score: 0.98
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 119
    col: 0
    score: 0.98
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 495
    col: 0
    score: 0.98
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 535
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1770
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 371
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 811
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1100
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 372
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 222
    col: 0
    score: 0.99
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 221
    col: 0
    score: 0.99
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 294
    col: 0
    score: 0.99
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 426
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 485
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 463
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 502
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 542
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 411
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 446
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 407
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1115
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 939
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 989
    col: 0
    score: 0.97
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 1720
    col: 0
    score: 0.97
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 2092
    col: 0
    score: 0.97
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 684
    col: 0
    score: 0.97
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 489
    col: 0
    score: 0.97
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 1181
    col: 0
    score: 0.97
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 90
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 140
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 400
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1117
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 940
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1723
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 704
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 833
    col: 0
    score: 0.99
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 158
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2939
    col: 0
    score: 0.97
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 2043
    col: 0
    score: 0.9
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 1852
    col: 0
    score: 0.9
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 757
    col: 0
    score: 0.9
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 1524
    col: 0
    score: 0.9
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 1762
    col: 0
    score: 0.89
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 1119
    col: 0
    score: 0.89
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 627
    col: 0
    score: 0.89
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 1309
    col: 0
    score: 0.89
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 136
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 751
    col: 0
    score: 0.98
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 425
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 999
    col: 0
    score: 0.98
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 383
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 646
    col: 0
    score: 0.98
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 275
    col: 0
    score: 0.98
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 635
    col: 0
    score: 0.98
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 491
    col: 0
    score: 0.98
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 388
    col: 0
    score: 0.98
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 324
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 413
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 980
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 296
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 590
    col: 0
    score: 0.98
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 517
    col: 0
    score: 0.98
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 396
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 714
    col: 0
    score: 0.98
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 437
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 88
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 134
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 649
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 353
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 399
    col: 0
    score: 0.99
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 310
    col: 0
    score: 0.99
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 987
    col: 0
    score: 0.99
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 412
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1547
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 299
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 133
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1130
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 343
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 618
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 750
    col: 0
    score: 0.97
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 508
    col: 0
    score: 0.97
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 399
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1442
    col: 0
    score: 0.99
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 873
    col: 0
    score: 0.99
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 404
    col: 0
    score: 0.99
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 925
    col: 0
    score: 0.99
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 762
    col: 0
    score: 0.99
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 646
    col: 0
    score: 0.99
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 629
    col: 0
    score: 0.99
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 519
    col: 0
    score: 0.99
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 955
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1443
    col: 0
    score: 0.99
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 500
    col: 0
    score: 0.99
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1025
    col: 0
    score: 0.99
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 756
    col: 0
    score: 0.99
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 660
    col: 0
    score: 0.99
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 756
    col: 0
    score: 0.99
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 651
    col: 0
    score: 0.99
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 567
    col: 0
    score: 0.99
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1085
    col: 0
    score: 0.99
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 501
    col: 0
    score: 0.99
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1026
    col: 0
    score: 0.99
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 757
    col: 0
    score: 0.99
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 661
    col: 0
    score: 0.99
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 757
    col: 0
    score: 0.99
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 652
    col: 0
    score: 0.99
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 568
    col: 0
    score: 0.99
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1086
    col: 0
    score: 0.99
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 958
    col: 0
    score: 0.99
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 603
    col: 0
    score: 0.99
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 780
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1216
    col: 0
    score: 0.99
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 660
    col: 0
    score: 0.99
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 311
    col: 0
    score: 0.99
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 297
    col: 0
    score: 0.99
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 363
    col: 0
    score: 0.99
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 531
    col: 0
    score: 0.99
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 321
    col: 0
    score: 0.99
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 751
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 1120
    col: 0
    score: 0.99
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 503
    col: 0
    score: 0.99
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1028
    col: 0
    score: 0.99
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 759
    col: 0
    score: 0.99
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 663
    col: 0
    score: 0.99
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 759
    col: 0
    score: 0.99
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 654
    col: 0
    score: 0.99
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 570
    col: 0
    score: 0.99
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1088
    col: 0
    score: 0.99
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 633
    col: 0
    score: 0.99
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 960
    col: 0
    score: 0.99
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 887
    col: 0
    score: 0.99
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 605
    col: 0
    score: 0.99
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 581
    col: 0
    score: 0.99
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 664
    col: 0
    score: 0.99
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 782
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1218
    col: 0
    score: 0.99
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 662
    col: 0
    score: 0.99
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 313
    col: 0
    score: 0.99
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 299
    col: 0
    score: 0.99
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 365
    col: 0
    score: 0.99
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 323
    col: 0
    score: 0.99
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 753
    col: 0
    score: 0.99
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 635
    col: 0
    score: 0.99
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 525
    col: 0
    score: 0.99
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 961
    col: 0
    score: 0.99
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 983
    col: 0
    score: 0.99
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 562
    col: 0
    score: 0.99
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 888
    col: 0
    score: 0.99
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 606
    col: 0
    score: 0.99
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 582
    col: 0
    score: 0.99
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 665
    col: 0
    score: 0.99
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 506
    col: 0
    score: 0.98
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1031
    col: 0
    score: 0.98
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 762
    col: 0
    score: 0.98
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 666
    col: 0
    score: 0.98
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 762
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 657
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 573
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1091
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 636
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 342
    col: 0
    score: 0.97
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 906
    col: 0
    score: 0.97
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 923
    col: 0
    score: 0.97
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 581
    col: 0
    score: 0.99
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 580
    col: 0
    score: 0.99
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 573
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1207
    col: 0
    score: 0.98
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 312
    col: 0
    score: 0.98
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 443
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 107
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 391
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 329
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 557
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 227
    col: 0
    score: 1
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 399
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 760
    col: 0
    score: 0.98
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 339
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 554
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 291
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 623
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 940
    col: 0
    score: 0.96
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 578
    col: 0
    score: 0.93
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 968
    col: 0
    score: 0.93
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 528
    col: 0
    score: 0.93
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 555
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 340
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 292
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 624
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 381
    col: 0
    score: 0.98
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 2610
    col: 0
    score: 0.96
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 350
    col: 0
    score: 0.96
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 420
    col: 0
    score: 0.96
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 293
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 625
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1228
    col: 0
    score: 0.98
  - uuid: 930054b3-ba95-4acf-bb92-0e3ead25ed0b
    line: 106
    col: 0
    score: 0.97
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 855
    col: 0
    score: 0.97
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 925
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 290
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 583
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1626
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 1952
    col: 0
    score: 0.97
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 1933
    col: 0
    score: 0.97
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 391
    col: 0
    score: 0.97
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1064
    col: 0
    score: 0.97
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 218
    col: 0
    score: 0.97
  - uuid: 930054b3-ba95-4acf-bb92-0e3ead25ed0b
    line: 110
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1743
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 345
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 234
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 2224
    col: 0
    score: 0.95
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 689
    col: 0
    score: 0.95
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 1104
    col: 0
    score: 0.95
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 1020
    col: 0
    score: 0.95
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 476
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 142
    col: 0
    score: 0.98
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 699
    col: 0
    score: 0.97
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 569
    col: 0
    score: 0.97
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 574
    col: 0
    score: 0.97
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 515
    col: 0
    score: 0.97
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 536
    col: 0
    score: 0.97
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 228
    col: 0
    score: 0.97
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 352
    col: 0
    score: 0.96
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 266
    col: 0
    score: 0.96
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 231
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 354
    col: 0
    score: 1
  - uuid: 930054b3-ba95-4acf-bb92-0e3ead25ed0b
    line: 116
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 577
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 222
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 586
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 574
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 234
    col: 0
    score: 0.98
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 837
    col: 0
    score: 0.99
  - uuid: 930054b3-ba95-4acf-bb92-0e3ead25ed0b
    line: 121
    col: 0
    score: 0.99
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 364
    col: 0
    score: 0.99
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 349
    col: 0
    score: 0.99
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 425
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1758
    col: 0
    score: 0.99
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 398
    col: 0
    score: 0.99
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 385
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1020
    col: 0
    score: 0.99
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 418
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 390
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 294
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 190
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 477
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 805
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 531
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 144
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 367
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 331
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 341
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 118
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 258
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 242
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 446
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 461
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 403
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 389
    col: 0
    score: 0.98
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 438
    col: 0
    score: 0.98
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 440
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1396
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1024
    col: 0
    score: 0.98
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 253
    col: 0
    score: 0.98
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 227
    col: 0
    score: 0.98
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 559
    col: 0
    score: 0.98
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1088
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 518
    col: 0
    score: 0.98
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 361
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 983
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 319
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 305
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 404
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 448
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 182
    col: 0
    score: 0.98
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 327
    col: 0
    score: 0.98
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 363
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 321
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 307
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 406
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 255
    col: 0
    score: 0.97
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 486
    col: 0
    score: 0.97
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 904
    col: 0
    score: 0.97
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 470
    col: 0
    score: 0.97
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 364
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 322
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 308
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 407
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 453
    col: 0
    score: 0.96
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 466
    col: 0
    score: 0.96
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 397
    col: 0
    score: 0.96
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 317
    col: 0
    score: 0.96
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1708
    col: 0
    score: 0.96
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 290
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 249
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 439
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 409
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 444
    col: 0
    score: 1
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 393
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1261
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 163
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 326
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 236
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 270
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 345
    col: 0
    score: 0.98
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 107
    col: 0
    score: 0.98
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 165
    col: 0
    score: 0.98
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 176
    col: 0
    score: 0.98
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 900
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 910
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 584
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 694
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1659
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 899
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 713
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 775
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 857
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 523
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 273
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 352
    col: 0
    score: 0.97
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 1950
    col: 0
    score: 0.96
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1648
    col: 0
    score: 0.96
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1600
    col: 0
    score: 0.96
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 756
    col: 0
    score: 0.95
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 327
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 384
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 651
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 388
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 808
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 886
    col: 0
    score: 0.98
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 649
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 982
    col: 0
    score: 0.98
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 338
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 92
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 153
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 342
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 654
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 924
    col: 0
    score: 0.99
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 900
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 925
    col: 0
    score: 0.98
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 453
    col: 0
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1106
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 410
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 255
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 275
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 652
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 351
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 818
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 717
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 399
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 288
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 186
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 1911
    col: 0
    score: 0.96
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 1176
    col: 0
    score: 0.96
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 718
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 819
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 577
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 401
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 184
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 444
    col: 0
    score: 0.98
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 316
    col: 0
    score: 0.98
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 823
    col: 0
    score: 0.98
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 541
    col: 0
    score: 0.98
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 352
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 547
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 678
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 817
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 190
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 400
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 461
    col: 0
    score: 0.94
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 453
    col: 0
    score: 0.98
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 357
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 824
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 3136
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1766
    col: 0
    score: 0.97
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 444
    col: 0
    score: 0.97
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 500
    col: 0
    score: 0.97
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 226
    col: 0
    score: 0.97
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 333
    col: 0
    score: 0.97
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 332
    col: 0
    score: 0.97
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 720
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 661
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 121
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 149
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 4270
    col: 0
    score: 0.97
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 4278
    col: 0
    score: 0.96
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 4286
    col: 0
    score: 0.96
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 1265
    col: 0
    score: 0.96
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 368
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 473
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1101
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 314
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 821
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 492
    col: 0
    score: 0.96
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1202
    col: 0
    score: 0.96
  - uuid: ac60a1d6-fd9f-46dc-bbe7-176dd8017c59
    line: 67
    col: 0
    score: 0.96
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 141
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 187
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1249
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 423
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 425
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 184
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 386
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 575
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 224
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 237
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 307
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 379
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 567
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 283
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 409
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 185
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 766
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1480
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 797
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 968
    col: 0
    score: 0.97
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 352
    col: 0
    score: 0.97
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 986
    col: 0
    score: 0.95
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 904
    col: 0
    score: 0.95
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 497
    col: 0
    score: 0.95
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 330
    col: 0
    score: 0.95
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 306
    col: 0
    score: 0.98
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 724
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 487
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 752
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 460
    col: 0
    score: 0.97
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 521
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 438
    col: 0
    score: 0.97
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 233
    col: 0
    score: 0.97
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 320
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 416
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 285
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 820
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 822
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 758
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 944
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 566
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 367
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 459
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 644
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 610
    col: 0
    score: 0.95
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1421
    col: 0
    score: 0.95
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 434
    col: 0
    score: 0.95
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 708
    col: 0
    score: 0.95
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 481
    col: 0
    score: 0.95
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 133
    col: 0
    score: 0.95
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 492
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 409
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 811
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 613
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 738
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 851
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 934
    col: 0
    score: 0.98
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 359
    col: 0
    score: 0.97
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 258
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 955
    col: 0
    score: 0.95
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 604
    col: 0
    score: 0.94
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1595
    col: 0
    score: 0.94
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 555
    col: 0
    score: 0.94
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 625
    col: 0
    score: 0.94
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 527
    col: 0
    score: 0.94
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 231
    col: 0
    score: 0.94
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 699
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 638
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 231
    col: 0
    score: 0.99
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 594
    col: 0
    score: 0.99
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 445
    col: 0
    score: 0.99
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 716
    col: 0
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1024
    col: 0
    score: 0.99
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 565
    col: 0
    score: 0.99
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 890
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 394
    col: 0
    score: 0.96
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 684
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 353
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 877
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 374
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 465
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 319
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1749
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 340
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 315
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1860
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 134
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 192
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 871
    col: 0
    score: 0.97
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 888
    col: 0
    score: 0.97
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 593
    col: 0
    score: 0.95
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 641
    col: 0
    score: 0.95
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 3483
    col: 0
    score: 0.93
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 3746
    col: 0
    score: 0.93
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 3304
    col: 0
    score: 0.93
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 262
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 464
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 969
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 164
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 305
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 397
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 278
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 319
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1295
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 559
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 842
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 472
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1118
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 425
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 465
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 238
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 261
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1056
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 353
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 386
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1403
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 474
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 508
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 451
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 209
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 264
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 4327
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2994
    col: 0
    score: 0.98
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 146
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 743
    col: 0
    score: 0.98
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 588
    col: 0
    score: 0.98
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 311
    col: 0
    score: 0.98
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 471
    col: 0
    score: 0.98
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 127
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 185
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1297
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 373
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 505
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 672
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 560
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 324
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 437
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 704
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 353
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1844
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 615
    col: 0
    score: 0.98
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 258
    col: 0
    score: 0.98
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 253
    col: 0
    score: 0.98
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 327
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1287
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 568
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 329
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1370
    col: 0
    score: 0.98
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 335
    col: 0
    score: 0.98
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 643
    col: 0
    score: 0.98
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 558
    col: 0
    score: 0.98
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 341
    col: 0
    score: 0.98
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 685
    col: 0
    score: 1
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 122
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1459
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 389
    col: 0
    score: 0.98
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 336
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 425
    col: 0
    score: 0.95
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 462
    col: 0
    score: 0.95
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 393
    col: 0
    score: 0.94
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1836
    col: 0
    score: 0.94
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 337
    col: 0
    score: 0.94
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 426
    col: 0
    score: 0.95
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 463
    col: 0
    score: 0.95
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 537
    col: 0
    score: 0.95
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1837
    col: 0
    score: 0.94
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 443
    col: 0
    score: 0.94
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 128
    col: 0
    score: 0.94
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 778
    col: 0
    score: 0.94
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 536
    col: 0
    score: 0.94
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 338
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 464
    col: 0
    score: 0.93
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 538
    col: 0
    score: 0.92
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 101
    col: 0
    score: 0.92
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 143
    col: 0
    score: 0.92
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1838
    col: 0
    score: 0.92
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 453
    col: 0
    score: 0.92
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 307
    col: 0
    score: 0.92
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 361
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 343
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 444
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 608
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1014
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 210
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 981
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 336
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 1373
    col: 0
    score: 0.98
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 397
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 810
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 449
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 279
    col: 0
    score: 0.97
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 524
    col: 0
    score: 0.97
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 467
    col: 0
    score: 0.97
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 915
    col: 0
    score: 0.97
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 328
    col: 0
    score: 0.97
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 439
    col: 0
    score: 0.97
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 305
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 456
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 850
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1704
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 439
    col: 0
    score: 0.94
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 487
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1694
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 650
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 682
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 852
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 683
    col: 0
    score: 1
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 182
    col: 0
    score: 0.97
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1537
    col: 0
    score: 0.97
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 858
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 389
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 308
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 553
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 645
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 5348
    col: 0
    score: 0.97
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 3124
    col: 0
    score: 0.97
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 1884
    col: 0
    score: 0.97
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 4424
    col: 0
    score: 0.97
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 855
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 894
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 2129
    col: 0
    score: 0.97
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 722
    col: 0
    score: 0.96
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 3355
    col: 0
    score: 0.96
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 798
    col: 0
    score: 0.96
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 791
    col: 0
    score: 0.96
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 248
    col: 0
    score: 0.96
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 390
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 696
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1647
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 941
    col: 0
    score: 0.93
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 781
    col: 0
    score: 0.93
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 848
    col: 0
    score: 0.93
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 838
    col: 0
    score: 0.93
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 616
    col: 0
    score: 0.93
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 736
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 736
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 611
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 652
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 284
    col: 0
    score: 0.95
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 612
    col: 0
    score: 0.95
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 737
    col: 0
    score: 0.95
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 524
    col: 0
    score: 0.94
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 865
    col: 0
    score: 0.94
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 523
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 916
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1047
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 290
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 267
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 485
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1190
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 673
    col: 0
    score: 0.99
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 330
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 477
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 150
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 122
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 301
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 420
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1719
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 463
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 151
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 331
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 478
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 123
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 302
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 421
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 1002
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1762
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 332
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 479
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 124
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 303
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 422
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1765
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 1003
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 371
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 277
    col: 0
    score: 1
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 199
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 501
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 316
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 370
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 362
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 921
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 616
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 588
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 278
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 207
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 286
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 502
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 317
    col: 0
    score: 1
  - uuid: 86a691ec-ca1f-4350-824c-0ded1f8ebe70
    line: 161
    col: 0
    score: 1
  - uuid: b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
    line: 172
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 709
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 316
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 279
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 379
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 182
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 208
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 145
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 503
    col: 0
    score: 1
  - uuid: b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
    line: 173
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 318
    col: 0
    score: 1
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 201
    col: 0
    score: 0.98
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 280
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 380
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 288
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 183
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 383
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1254
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 711
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 318
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 281
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 381
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 741
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1255
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 319
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 307
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 289
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 184
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 282
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 382
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 385
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1276
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 320
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 308
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 185
    col: 0
    score: 1
  - uuid: 86a691ec-ca1f-4350-824c-0ded1f8ebe70
    line: 165
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 333
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 383
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 186
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1277
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 321
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 472
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 507
    col: 0
    score: 1
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 205
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1063
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 358
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 844
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 393
    col: 0
    score: 0.99
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 499
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 855
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 731
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 165
    col: 0
    score: 0.99
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 869
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 750
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 538
    col: 0
    score: 0.98
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 613
    col: 0
    score: 0.98
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 362
    col: 0
    score: 0.98
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 347
    col: 0
    score: 0.98
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 898
    col: 0
    score: 0.98
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 374
    col: 0
    score: 0.98
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 566
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 648
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 777
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 866
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 772
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 881
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 698
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 594
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 711
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 841
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 524
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 646
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 570
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 323
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1733
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1041
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 749
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 563
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 706
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 907
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 658
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 566
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 544
    col: 0
    score: 0.97
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 787
    col: 0
    score: 0.97
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 376
    col: 0
    score: 0.97
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 496
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 769
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 745
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 905
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 986
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1236
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1703
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 396
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 622
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 388
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 829
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 345
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 572
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 430
    col: 0
    score: 0.98
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 447
    col: 0
    score: 0.98
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 69
    col: 0
    score: 0.98
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 756
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 348
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 735
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 295
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 256
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 550
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 632
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 529
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 898
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 209
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 394
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 350
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 359
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 885
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 899
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 856
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 732
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 430
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 210
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 351
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 500
    col: 0
    score: 0.95
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 395
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 813
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 906
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 319
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 896
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 879
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 591
    col: 0
    score: 0.94
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 657
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 906
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 809
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 368
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 902
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 725
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 751
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 433
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 860
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 737
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 426
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 171
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 912
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 408
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 704
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 773
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1173
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 818
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 527
    col: 0
    score: 0.98
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 765
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 733
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 775
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 1755
    col: 0
    score: 0.98
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 3499
    col: 0
    score: 0.97
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 1998
    col: 0
    score: 0.97
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 4538
    col: 0
    score: 0.97
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 8056
    col: 0
    score: 0.97
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 851
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 455
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 893
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 481
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 730
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1389
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 313
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1177
    col: 0
    score: 0.96
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 693
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 970
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 492
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 972
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 813
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 634
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1037
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 710
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 967
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 861
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 877
    col: 0
    score: 0.99
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 880
    col: 0
    score: 0.99
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 810
    col: 0
    score: 0.97
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 380
    col: 0
    score: 0.97
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 808
    col: 0
    score: 0.97
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 350
    col: 0
    score: 0.97
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 276
    col: 0
    score: 0.97
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1149
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 918
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 737
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 5037
    col: 0
    score: 0.98
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 672
    col: 0
    score: 0.97
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1400
    col: 0
    score: 0.97
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 5029
    col: 0
    score: 0.97
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 6131
    col: 0
    score: 0.97
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 2219
    col: 0
    score: 0.97
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 498
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 584
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 913
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 598
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 386
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 777
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 805
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 764
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 311
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 857
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 879
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 726
    col: 0
    score: 1
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 111
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 897
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 498
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 7916
    col: 0
    score: 0.99
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 676
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 919
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 705
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 702
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1356
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 474
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 445
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 767
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 599
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 475
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 325
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 706
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 814
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 886
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 593
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 786
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 698
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 3025
    col: 0
    score: 0.98
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 1688
    col: 0
    score: 0.98
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 2706
    col: 0
    score: 0.97
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 3081
    col: 0
    score: 0.97
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 3077
    col: 0
    score: 0.97
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 3132
    col: 0
    score: 0.97
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 878
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 318
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 579
    col: 0
    score: 0.97
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 253
    col: 0
    score: 0.97
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1329
    col: 0
    score: 0.96
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1311
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 1283
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 1115
    col: 0
    score: 0.96
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 552
    col: 0
    score: 0.96
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 191
    col: 0
    score: 0.96
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 698
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1390
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 726
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 911
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 495
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 882
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 696
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 938
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 835
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 437
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 461
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 99
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 109
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 110
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1006
    col: 0
    score: 0.98
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 91
    col: 0
    score: 0.98
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 657
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 559
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 453
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1414
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 785
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 708
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 400
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 795
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 989
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 714
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 948
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1807
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 277
    col: 0
    score: 0.96
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 320
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 512
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 597
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 365
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 357
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 405
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 654
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 438
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 916
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1813
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 869
    col: 0
    score: 0.98
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 846
    col: 0
    score: 0.97
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 325
    col: 0
    score: 0.97
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 354
    col: 0
    score: 0.97
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1645
    col: 0
    score: 0.97
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 368
    col: 0
    score: 0.97
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 923
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 480
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 349
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 412
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 398
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 547
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 360
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 243
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 768
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 403
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 679
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 603
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 619
    col: 0
    score: 0.98
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 414
    col: 0
    score: 0.98
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 390
    col: 0
    score: 0.98
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 227
    col: 0
    score: 0.98
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 644
    col: 0
    score: 0.98
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 769
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 826
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 369
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 459
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 832
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 386
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1110
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 119
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 525
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 520
    col: 0
    score: 0.99
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 917
    col: 0
    score: 0.99
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 436
    col: 0
    score: 0.99
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 394
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1386
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 244
    col: 0
    score: 0.99
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 138
    col: 0
    score: 0.98
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 499
    col: 0
    score: 0.98
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 727
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 993
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1017
    col: 0
    score: 0.96
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 524
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 157
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 230
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 671
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1123
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 401
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 530
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 372
    col: 0
    score: 0.98
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 364
    col: 0
    score: 0.98
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 257
    col: 0
    score: 0.98
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 376
    col: 0
    score: 0.98
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 604
    col: 0
    score: 0.98
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 328
    col: 0
    score: 0.98
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 415
    col: 0
    score: 0.99
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 538
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 392
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 304
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 3920
    col: 0
    score: 0.97
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 6482
    col: 0
    score: 0.97
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 4027
    col: 0
    score: 0.97
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 4509
    col: 0
    score: 0.97
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 301
    col: 0
    score: 0.97
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 339
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 665
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 641
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 575
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 993
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1544
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 718
    col: 0
    score: 0.97
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 792
    col: 0
    score: 0.96
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 994
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 874
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 825
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1439
    col: 0
    score: 0.99
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 687
    col: 0
    score: 0.99
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 550
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 943
    col: 0
    score: 0.99
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 516
    col: 0
    score: 0.99
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 502
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 327
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 524
    col: 0
    score: 0.97
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 343
    col: 0
    score: 0.97
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 453
    col: 0
    score: 0.97
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 331
    col: 0
    score: 0.96
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 343
    col: 0
    score: 0.96
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 393
    col: 0
    score: 0.96
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 780
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 731
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 448
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 877
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 858
    col: 0
    score: 0.98
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 995
    col: 0
    score: 0.98
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 443
    col: 0
    score: 0.98
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 498
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 194
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 367
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 360
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 481
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 356
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1098
    col: 0
    score: 0.98
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 398
    col: 0
    score: 0.98
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 268
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 965
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 680
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1462
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 2982
    col: 0
    score: 0.97
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 1903
    col: 0
    score: 0.97
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 4443
    col: 0
    score: 0.97
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 5058
    col: 0
    score: 0.97
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 550
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 814
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1041
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 491
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 462
    col: 0
    score: 0.99
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 612
    col: 0
    score: 0.99
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 272
    col: 0
    score: 0.98
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 425
    col: 0
    score: 0.98
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 268
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 328
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 361
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2650
    col: 0
    score: 0.95
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 2230
    col: 0
    score: 0.95
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 3044
    col: 0
    score: 0.94
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 6733
    col: 0
    score: 0.94
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 2348
    col: 0
    score: 0.94
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 207
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 362
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1022
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 232
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 346
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 646
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 385
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 253
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 437
    col: 0
    score: 0.96
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 164
    col: 0
    score: 0.96
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 523
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 786
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 741
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 587
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 432
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 460
    col: 0
    score: 0.98
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 431
    col: 0
    score: 0.97
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 931
    col: 0
    score: 0.97
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 533
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 907
    col: 0
    score: 1
  - uuid: ac9d3ac5-9a6a-4180-a67f-1ab7e229d981
    line: 261
    col: 0
    score: 0.97
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 510
    col: 0
    score: 0.97
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 368
    col: 0
    score: 0.97
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1851
    col: 0
    score: 0.97
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 629
    col: 0
    score: 0.97
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 970
    col: 0
    score: 0.97
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 897
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 979
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 293
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 897
    col: 0
    score: 0.99
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 1006
    col: 0
    score: 0.98
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 336
    col: 0
    score: 0.98
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 571
    col: 0
    score: 0.98
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 1033
    col: 0
    score: 0.97
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 736
    col: 0
    score: 0.97
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 915
    col: 0
    score: 0.96
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1119
    col: 0
    score: 0.96
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 349
    col: 0
    score: 0.96
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1205
    col: 0
    score: 0.96
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1018
    col: 0
    score: 0.96
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 731
    col: 0
    score: 0.96
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 656
    col: 0
    score: 0.96
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1159
    col: 0
    score: 0.96
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1018
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 780
    col: 0
    score: 0.98
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 85
    col: 0
    score: 0.98
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 131
    col: 0
    score: 0.98
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 540
    col: 0
    score: 0.98
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 541
    col: 0
    score: 0.98
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 560
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 945
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1158
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 280
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 658
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 355
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1013
    col: 0
    score: 0.97
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 597
    col: 0
    score: 0.97
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 257
    col: 0
    score: 0.97
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 612
    col: 0
    score: 0.97
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 360
    col: 0
    score: 0.96
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 438
    col: 0
    score: 0.98
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 294
    col: 0
    score: 0.99
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1139
    col: 0
    score: 0.98
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 1017
    col: 0
    score: 0.98
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1028
    col: 0
    score: 0.98
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 451
    col: 0
    score: 0.96
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 791
    col: 0
    score: 0.96
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 439
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 1869
    col: 0
    score: 0.98
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 1900
    col: 0
    score: 0.98
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 284
    col: 0
    score: 0.98
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 197
    col: 0
    score: 0.98
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 494
    col: 0
    score: 0.98
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 302
    col: 0
    score: 0.98
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 734
    col: 0
    score: 0.98
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 279
    col: 0
    score: 0.98
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 985
    col: 0
    score: 0.97
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1685
    col: 0
    score: 0.97
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 438
    col: 0
    score: 0.97
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1512
    col: 0
    score: 0.97
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 107
    col: 0
    score: 0.97
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 573
    col: 0
    score: 0.97
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 305
    col: 0
    score: 0.97
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 1044
    col: 0
    score: 0.97
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 944
    col: 0
    score: 0.95
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 293
    col: 0
    score: 0.95
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 304
    col: 0
    score: 0.95
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 442
    col: 0
    score: 0.95
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 310
    col: 0
    score: 0.95
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 297
    col: 0
    score: 0.95
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 264
    col: 0
    score: 0.95
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 294
    col: 0
    score: 0.95
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 987
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1686
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 441
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 605
    col: 0
    score: 0.96
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1210
    col: 0
    score: 0.96
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 454
    col: 0
    score: 0.96
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 327
    col: 0
    score: 0.95
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 2223
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 293
    col: 0
    score: 0.99
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 346
    col: 0
    score: 0.99
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 706
    col: 0
    score: 0.93
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 709
    col: 0
    score: 0.93
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 794
    col: 0
    score: 0.93
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 1456
    col: 0
    score: 0.93
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 694
    col: 0
    score: 0.93
  - uuid: 930054b3-ba95-4acf-bb92-0e3ead25ed0b
    line: 174
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 469
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 444
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 351
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 351
    col: 0
    score: 0.97
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 447
    col: 0
    score: 0.97
  - uuid: 930054b3-ba95-4acf-bb92-0e3ead25ed0b
    line: 177
    col: 0
    score: 0.97
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 472
    col: 0
    score: 0.97
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 486
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 180
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 442
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1396
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 853
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 300
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 662
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 765
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 531
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 553
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 199
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 877
    col: 0
    score: 1
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 101
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1959
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 532
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 537
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 721
    col: 0
    score: 1
  - uuid: 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
    line: 154
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 249
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 966
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 681
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 615
    col: 0
    score: 1
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 290
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 488
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 182
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 444
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1398
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 855
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 302
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 664
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 767
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 754
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 555
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 179
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 546
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 251
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 968
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 683
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 617
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 676
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1149
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 535
    col: 0
    score: 1
  - uuid: 86a691ec-ca1f-4350-824c-0ded1f8ebe70
    line: 259
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 339
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 431
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 202
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 474
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 385
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 846
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 880
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1178
    col: 0
    score: 1
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 379
    col: 0
    score: 1
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 178
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 555
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 551
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 456
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 916
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 963
    col: 0
    score: 1
  - uuid: ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
    line: 163
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 845
    col: 0
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 335
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 493
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 187
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 449
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1403
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 860
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 307
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 669
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 772
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 759
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 538
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 560
    col: 0
    score: 1
  - uuid: ac9d3ac5-9a6a-4180-a67f-1ab7e229d981
    line: 337
    col: 0
    score: 1
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 381
    col: 0
    score: 1
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 180
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 557
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 553
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 458
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 918
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 965
    col: 0
    score: 1
  - uuid: ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
    line: 165
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 257
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 974
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 689
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 623
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 682
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1155
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 605
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 284
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 518
    col: 0
    score: 1
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 415
    col: 0
    score: 1
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 143
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 524
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 480
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 996
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 1107
    col: 0
    score: 1
  - uuid: ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
    line: 127
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 882
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 544
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 271
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 684
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 809
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 398
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 824
    col: 0
    score: 1
  - uuid: 9413237f-2537-4bbf-8768-db6180970e36
    line: 51
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 230
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 884
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 687
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 736
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 489
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 490
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 249
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 445
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 387
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 727
    col: 0
    score: 1
  - uuid: ac9d3ac5-9a6a-4180-a67f-1ab7e229d981
    line: 411
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 1277
    col: 0
    score: 1
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 417
    col: 0
    score: 1
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 145
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 526
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1324
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 1278
    col: 0
    score: 1
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 418
    col: 0
    score: 1
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 146
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 527
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 483
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 999
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 1110
    col: 0
    score: 1
  - uuid: ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
    line: 130
    col: 0
    score: 1
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 419
    col: 0
    score: 1
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 147
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 528
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 484
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 1000
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 1111
    col: 0
    score: 1
  - uuid: ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
    line: 131
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 886
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 548
    col: 0
    score: 1
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 420
    col: 0
    score: 1
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 148
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 529
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 485
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 1001
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 1112
    col: 0
    score: 1
  - uuid: ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
    line: 132
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 887
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 549
    col: 0
    score: 1
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 421
    col: 0
    score: 1
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 149
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 530
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 486
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 1002
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 1113
    col: 0
    score: 1
  - uuid: ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
    line: 133
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 888
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1310
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 392
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 732
    col: 0
    score: 1
  - uuid: ac9d3ac5-9a6a-4180-a67f-1ab7e229d981
    line: 416
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 1282
    col: 0
    score: 1
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 422
    col: 0
    score: 1
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 150
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 531
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 487
    col: 0
    score: 1
  - uuid: c0392040-16a2-41e8-bd54-75110319e3c0
    line: 135
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 451
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 393
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 733
    col: 0
    score: 1
  - uuid: ac9d3ac5-9a6a-4180-a67f-1ab7e229d981
    line: 417
    col: 0
    score: 1
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 423
    col: 0
    score: 1
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 151
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 532
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 256
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 452
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1312
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 394
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 734
    col: 0
    score: 1
  - uuid: ac9d3ac5-9a6a-4180-a67f-1ab7e229d981
    line: 418
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 1284
    col: 0
    score: 1
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 424
    col: 0
    score: 1
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 152
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 533
    col: 0
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 362
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 496
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 162
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 491
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 771
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 951
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 722
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 878
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 925
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 655
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 1240
    col: 0
    score: 1
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 466
    col: 0
    score: 1
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 154
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 539
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 535
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 342
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 920
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 1099
    col: 0
    score: 1
  - uuid: ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
    line: 138
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 686
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1460
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 573
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 198
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 477
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 241
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1035
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 839
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 626
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 259
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 628
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 517
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 221
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 348
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 477
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 478
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 173
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 558
    col: 0
    score: 1
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 201
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 365
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 495
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 726
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 882
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 929
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 659
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 703
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 585
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 1043
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 865
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 652
    col: 0
    score: 1
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 539
    col: 0
    score: 1
  - uuid: 930054b3-ba95-4acf-bb92-0e3ead25ed0b
    line: 160
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 867
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 508
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 173
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 364
    col: 0
    score: 1
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 377
    col: 0
    score: 1
  - uuid: f1add613-656e-4bec-b52b-193fd78c4642
    line: 147
    col: 0
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 353
    col: 0
    score: 1
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 335
    col: 0
    score: 1
  - uuid: 930054b3-ba95-4acf-bb92-0e3ead25ed0b
    line: 161
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 868
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 509
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 174
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 365
    col: 0
    score: 1
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 378
    col: 0
    score: 1
  - uuid: f1add613-656e-4bec-b52b-193fd78c4642
    line: 148
    col: 0
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 354
    col: 0
    score: 1
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 336
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 1246
    col: 0
    score: 1
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 472
    col: 0
    score: 1
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 160
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 545
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 541
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 348
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 926
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 1105
    col: 0
    score: 1
  - uuid: ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
    line: 144
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 1247
    col: 0
    score: 1
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 473
    col: 0
    score: 1
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 161
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 546
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 542
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 349
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 927
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 1106
    col: 0
    score: 1
  - uuid: ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
    line: 145
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 479
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 730
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 886
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 933
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 663
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 590
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 1048
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 399
    col: 0
    score: 1
  - uuid: 9413237f-2537-4bbf-8768-db6180970e36
    line: 69
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 527
    col: 0
    score: 1
  - uuid: c0392040-16a2-41e8-bd54-75110319e3c0
    line: 146
    col: 0
    score: 1
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 262
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1134
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 562
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 205
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 258
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 220
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 742
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 365
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 534
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 329
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 451
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 369
    col: 0
    score: 1
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 382
    col: 0
    score: 1
  - uuid: f1add613-656e-4bec-b52b-193fd78c4642
    line: 152
    col: 0
    score: 1
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 246
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 407
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 436
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 518
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 542
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 498
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 371
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 259
    col: 0
    score: 1
  - uuid: ac9d3ac5-9a6a-4180-a67f-1ab7e229d981
    line: 302
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 1287
    col: 0
    score: 1
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 319
    col: 0
    score: 1
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 164
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 306
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 404
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 508
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 940
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 592
    col: 0
    score: 1
  - uuid: ac9d3ac5-9a6a-4180-a67f-1ab7e229d981
    line: 303
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 1288
    col: 0
    score: 1
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 320
    col: 0
    score: 1
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 165
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 307
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 405
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 509
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 941
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 746
    col: 0
    score: 1
  - uuid: 930054b3-ba95-4acf-bb92-0e3ead25ed0b
    line: 140
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 537
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 332
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 454
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 372
    col: 0
    score: 1
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 385
    col: 0
    score: 1
  - uuid: f1add613-656e-4bec-b52b-193fd78c4642
    line: 155
    col: 0
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 380
    col: 0
    score: 1
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 249
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 715
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 258
    col: 0
    score: 1
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 212
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 159
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 691
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 989
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 742
    col: 0
    score: 1
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 134
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1177
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 411
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 560
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 257
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 441
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 523
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 547
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 322
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 503
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 497
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 635
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 343
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 570
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 464
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 292
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 376
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 484
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 170
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 763
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 259
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 443
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 525
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 549
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 324
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 505
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 378
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 298
    col: 0
    score: 1
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 274
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 789
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 732
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 477
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 734
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1242
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 511
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 508
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1598
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 1003
    col: 0
    score: 0.99
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 606
    col: 0
    score: 0.99
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 297
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1586
    col: 0
    score: 0.99
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 449
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 1167
    col: 0
    score: 0.99
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 277
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 792
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 735
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 480
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 737
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1245
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 514
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 393
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1341
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 793
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 803
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1087
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1211
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 1207
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 287
    col: 0
    score: 0.94
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 711
    col: 0
    score: 0.94
  - uuid: 86a691ec-ca1f-4350-824c-0ded1f8ebe70
    line: 275
    col: 0
    score: 0.94
  - uuid: b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
    line: 285
    col: 0
    score: 0.94
  - uuid: 5f65dfa5-dc97-4a6c-ad93-c45c1312e156
    line: 167
    col: 0
    score: 0.94
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 556
    col: 0
    score: 0.94
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 246
    col: 0
    score: 0.94
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 528
    col: 0
    score: 0.94
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 554
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 794
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 737
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 482
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 739
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 890
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1247
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 516
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 795
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1088
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 1208
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 989
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 799
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 577
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 555
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 303
    col: 0
    score: 1
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 279
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 796
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 739
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 484
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 741
    col: 0
    score: 1
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 280
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1384
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 740
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 485
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 742
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 892
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1250
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 519
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 797
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 741
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 486
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 743
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 893
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1251
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 520
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 399
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1347
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1386
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 798
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 487
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 744
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 894
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1252
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 521
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 400
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 582
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 560
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1388
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 743
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 896
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1216
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 995
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 506
    col: 0
    score: 0.99
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 322
    col: 0
    score: 0.97
  - uuid: 930054b3-ba95-4acf-bb92-0e3ead25ed0b
    line: 175
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 470
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 445
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 352
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 319
    col: 0
    score: 0.97
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 557
    col: 0
    score: 0.97
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 352
    col: 0
    score: 0.97
  - uuid: 930054b3-ba95-4acf-bb92-0e3ead25ed0b
    line: 176
    col: 0
    score: 0.97
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 471
    col: 0
    score: 0.97
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 446
    col: 0
    score: 0.97
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 347
    col: 0
    score: 0.97
  - uuid: 930054b3-ba95-4acf-bb92-0e3ead25ed0b
    line: 178
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 348
    col: 0
    score: 0.97
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 473
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 448
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 349
    col: 0
    score: 0.97
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1745
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 292
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 3482
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 2534
    col: 0
    score: 0.96
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 1811
    col: 0
    score: 0.95
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 2310
    col: 0
    score: 0.95
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 1171
    col: 0
    score: 0.95
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 1783
    col: 0
    score: 0.95
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 518
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1000
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 480
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 731
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 621
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 821
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1642
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 967
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 1013
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 420
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 723
    col: 0
    score: 0.95
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 503
    col: 0
    score: 0.91
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 430
    col: 0
    score: 0.9
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 1009
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 520
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1002
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 482
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 733
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 623
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 823
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1644
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 1010
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1003
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 483
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 734
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 824
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1645
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 970
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 980
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 1044
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 1011
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 521
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 484
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 735
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 625
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 825
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1646
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 971
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 1012
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 890
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1004
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 485
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 736
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 920
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 826
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1647
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 1014
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1733
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 486
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 738
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1035
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 827
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1649
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 973
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 1015
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 892
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1734
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 487
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1036
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 828
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1650
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 974
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 894
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1736
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 489
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 740
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 1021
    col: 0
    score: 1
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 333
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 534
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 357
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1319
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 903
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 730
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 440
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 702
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 814
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1251
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 975
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 635
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 520
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 662
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1204
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 659
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 624
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 549
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 636
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 521
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 663
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1205
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 660
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 625
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1197
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 666
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 367
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 906
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 231
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 815
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 930
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 586
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 893
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 510
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 587
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 679
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 816
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 931
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 587
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 894
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 511
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 588
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 680
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 789
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1099
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 568
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 383
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 512
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 639
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 524
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 666
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1208
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 663
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 628
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1200
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 669
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 640
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 525
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 667
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1209
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 664
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 629
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1201
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 670
    col: 0
    score: 1
  - uuid: ac9d3ac5-9a6a-4180-a67f-1ab7e229d981
    line: 435
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 641
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 526
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 668
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1210
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 665
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 630
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1202
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 671
    col: 0
    score: 1
  - uuid: ac9d3ac5-9a6a-4180-a67f-1ab7e229d981
    line: 436
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 395
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 364
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 855
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 270
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 935
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 591
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 898
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 515
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 592
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 684
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 793
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1103
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 643
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 528
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 670
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1212
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 667
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 632
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1204
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 673
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 517
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 984
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 644
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 529
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 671
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1213
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 668
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 633
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1205
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 279
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1287
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 427
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 382
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 409
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 831
    col: 0
    score: 0.99
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 667
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 990
    col: 0
    score: 0.99
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 645
    col: 0
    score: 0.99
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 269
    col: 0
    score: 0.99
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 181
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 554
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 515
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 1006
    col: 0
    score: 1
  - uuid: ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
    line: 166
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 1210
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 1049
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 506
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 243
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 516
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 1007
    col: 0
    score: 1
  - uuid: ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
    line: 167
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 1211
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 1050
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 507
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 244
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 549
    col: 0
    score: 1
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 140
    col: 0
    score: 1
  - uuid: 9413237f-2537-4bbf-8768-db6180970e36
    line: 90
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 771
    col: 0
    score: 1
  - uuid: c0392040-16a2-41e8-bd54-75110319e3c0
    line: 167
    col: 0
    score: 1
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 449
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1665
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 615
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 555
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 260
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1169
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 978
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 288
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 658
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1345
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 418
    col: 0
    score: 1
  - uuid: ac9d3ac5-9a6a-4180-a67f-1ab7e229d981
    line: 479
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 1317
    col: 0
    score: 1
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 477
    col: 0
    score: 1
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 184
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 557
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 518
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 785
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1668
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 617
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 557
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 262
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1171
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 980
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 856
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 289
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 659
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 419
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 221
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 195
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 965
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 495
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 746
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 939
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 971
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 714
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 596
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 406
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 787
    col: 0
    score: 1
  - uuid: 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
    line: 169
    col: 0
    score: 1
  - uuid: 9413237f-2537-4bbf-8768-db6180970e36
    line: 94
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 775
    col: 0
    score: 1
  - uuid: c0392040-16a2-41e8-bd54-75110319e3c0
    line: 171
    col: 0
    score: 1
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 453
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1671
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 619
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 220
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 559
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1173
    col: 0
    score: 1
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
---
you’ve got way too much state mutation and IO mixed into control flow. here’s a functional pass that: ^ref-a4a25141-1-0

* isolates IO at the edges ^ref-a4a25141-3-0
* keeps the “core” as pure mappers/reducers ^ref-a4a25141-4-0
* adds safe caching via content-hash (back-compatible with your old cache) ^ref-a4a25141-5-0
* bounds concurrency so ollama doesn’t get dogpiled ^ref-a4a25141-6-0
* keeps output files and types the same where it matters ^ref-a4a25141-7-0

quick mental model: ^ref-a4a25141-9-0

```
files
  -> read+parse (IO)
    -> filter invalid
      -> chunkify (pure)
        -> embed with memoized cache + p-limit (IO)
          -> groupBy docUuid (pure)
            -> write caches (IO)
```
^ref-a4a25141-11-0 ^ref-a4a25141-20-0

### what changed (and why)
 ^ref-a4a25141-23-0
* **pure helpers**: `toChunks`, `groupBy`, `buildDocsByUuid`, `sha1`. ^ref-a4a25141-24-0
* **cache validity**: embedding cache entries now optionally store `{hash, embedding}`; old `number[]` entries continue to work without recompute. if text changes, we recompute. ^ref-a4a25141-25-0
* **parallelism**: tiny `limit()` to cap concurrent POSTs. ^ref-a4a25141-26-0
* **error boundaries**: doc-level try/catch so one bad file doesn’t kill the run. ^ref-a4a25141-27-0
* **immutability**: we derive new maps and merge into previous caches instead of mutating in place.

---
 ^ref-a4a25141-31-0
```typescript
// 02-embed.ts (functional refactor)
import { promises as fs } from "fs";
import * as path from "path";
import crypto from "crypto";
import matter from "gray-matter";
import {
  parseArgs,
  listFilesRec,
  writeJSON,
  readJSON,
  parseMarkdownChunks,
} from "./utils";
import type { Chunk, Front } from "./types";

// ------------------------
// Config (IO boundary)
// ------------------------
const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";

type Config = {
  root: string;
  exts: Set<string>;
  embedModel: string;
  cacheDir: string;
  chunkCachePath: string;
  embedCachePath: string;
  docsMapPath: string;
  concurrency: number;
};

const mkConfig = (): Config => {
  const args = parseArgs({
    "--dir": "docs/unique",
    "--ext": ".md,.mdx,.txt",
    "--embed-model": "nomic-embed-text:latest",
    "--concurrency": "4",
  });
  const ROOT = path.resolve(args["--dir"]);
  const EXTS = new Set(
    args["--ext"].split(",").map((s) => s.trim().toLowerCase())
  );
  const EMBED_MODEL = args["--embed-model"];
  const CACHE = path.join(process.cwd(), ".cache/docs-pipeline");
  return {
    root: ROOT,
    exts: EXTS,
    embedModel: EMBED_MODEL,
    cacheDir: CACHE,
    chunkCachePath: path.join(CACHE, "chunks.json"),
    embedCachePath: path.join(CACHE, "embeddings.json"),
    docsMapPath: path.join(CACHE, "docs-by-uuid.json"),
    concurrency: Math.max(1, Number(args["--concurrency"]) || 4),
  };
};

// ------------------------
// Pure helpers
// ------------------------
const sha1 = (s: string) => crypto.createHash("sha1").update(s).digest("hex");

type EmbeddingCacheValue = number[] | { hash: string; embedding: number[] };
type EmbeddingCache = Record<string, EmbeddingCacheValue>;

const getCachedEmbedding = (
  id: string,
  textHash: string,
  cache: EmbeddingCache
): number[] | null => {
  const v = cache[id];
  if (!v) return null;
  if (Array.isArray(v)) return v; // legacy cache entry; accept as-is
  return v.hash === textHash ? v.embedding : null;
};

const setCachedEmbedding = (
  id: string,
  textHash: string,
  embedding: number[],
  cache: EmbeddingCache
): EmbeddingCache => {
  return { ...cache, [id]: { hash: textHash, embedding } };
};

type Doc = {
  path: string;
  front: Front;
  content: string;
};

const toChunks = (doc: Doc): Chunk[] =>
  parseMarkdownChunks(doc.content).map((c, i) => ({
    ...c,
    id: `${doc.front.uuid}:${i}`,
    docUuid: doc.front.uuid!,
    docPath: doc.path,
  }));

const groupBy = <T, K extends string>(
  keyFn: (x: T) => K,
  xs: T[]
): Record<K, T[]> =>
  xs.reduce((acc, x) => {
    const k = keyFn(x);
    (acc[k] ??= []).push(x);
    return acc;
  }, {} as Record<K, T[]>);

const buildDocsByUuid = (
  docs: Doc[]
): Record<string, { path: string; title: string }> =>
  docs.reduce((acc, d) => {
    const title = d.front.filename || path.parse(d.path).name;
    acc[d.front.uuid!] = { path: d.path, title };
    return acc;
  }, {} as Record<string, { path: string; title: string }>);

// ------------------------
// Small concurrency limiter
// ------------------------
const limit = (concurrency: number) => {
  let active = 0;
  const queue: (() => void)[] = [];
  const next = () => {
    active--;
    const fn = queue.shift();
    if (fn) fn();
  };
  return async <T>(task: () => Promise<T>): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      const run = () => {
        active++;
        task()
          .then((v) => {
            next();
            resolve(v);
          })
          .catch((e) => {
            next();
            reject(e);
          });
      };
      if (active < concurrency) run();
      else queue.push(run);
    });
};

// ------------------------
// IO helpers
// ------------------------
const readDoc = async (file: string): Promise<Doc> => {
  const raw = await fs.readFile(file, "utf-8");
  const { data, content } = matter(raw);
  return { path: file, front: data as Front, content };
};

const ollamaEmbed =
  (model: string) =>
  async (text: string): Promise<number[]> => {
    // simple retry with jitter
    let attempt = 0;
    const max = 4;
    while (true) {
      try {
        const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model, prompt: text }),
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }
        const data = (await res.json()) as { embedding: number[] };
        return data.embedding;
      } catch (err) {
        attempt++;
        if (attempt >= max) throw err;
        const backoff = 250 * Math.pow(2, attempt) + Math.random() * 100;
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
  };

// ------------------------
// Core flow
// ------------------------
async function main() {
  const cfg = mkConfig();

  // ensure cache dir exists
  await fs.mkdir(cfg.cacheDir, { recursive: true });

  // load prior caches (IO)
  const prevChunksByDoc: Record<string, Chunk[]> = await readJSON(
    cfg.chunkCachePath,
    {}
  );
  const prevEmbedCache: EmbeddingCache = await readJSON(
    cfg.embedCachePath,
    {}
  );
  const prevDocsMap: Record<string, { path: string; title: string }> =
    await readJSON(cfg.docsMapPath, {});

  // discover files (IO)
  const files = await listFilesRec(cfg.root, cfg.exts);

  // read + parse (IO) -> filter for uuid
  const docs: Doc[] = (
    await Promise.all(
      files.map(async (f) => {
        try {
          const d = await readDoc(f);
          if (!d.front?.uuid) return null;
          return d;
        } catch (e) {
          console.error(`! failed parsing ${f}:`, e);
          return null;
        }
      })
    )
  ).filter(Boolean) as Doc[];

  // chunkify (pure)
  const allChunks = docs.flatMap(toChunks);

  // embed with memoized cache + p-limit (IO)
  const limiter = limit(cfg.concurrency);
  const embedFn = ollamaEmbed(cfg.embedModel);

  let nextEmbedCache = { ...prevEmbedCache };
  const embeddedChunks: Chunk[] = await Promise.all(
    allChunks.map((ch) =>
      limiter(async () => {
        const hash = sha1(ch.text);
        const cached = getCachedEmbedding(ch.id, hash, nextEmbedCache);
        const embedding = cached ?? (await embedFn(ch.text));
        if (!cached) {
          nextEmbedCache = setCachedEmbedding(ch.id, hash, embedding, nextEmbedCache);
        }
        return { ...ch, embedding };
      })
    )
  );

  // group (pure)
  const newChunksByDoc = groupBy<Chunk, string>((c) => c.docUuid!, embeddedChunks);
  const newDocsMap = buildDocsByUuid(docs);

  // merge with previous (pure-ish)
  const mergedChunksByDoc = { ...prevChunksByDoc, ...newChunksByDoc };
  const mergedDocsMap = { ...prevDocsMap, ...newDocsMap };

  // persist (IO)
  await writeJSON(cfg.chunkCachePath, mergedChunksByDoc);
  await writeJSON(cfg.embedCachePath, nextEmbedCache);
  await writeJSON(cfg.docsMapPath, mergedDocsMap);

  console.log(
    `02-embed: done. files=${files.length} docs=${docs.length} chunks=${embeddedChunks.length} concurrency=${cfg.concurrency}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
^ref-a4a25141-31-0
```
^ref-a4a25141-32-0 ^ref-a4a25141-301-0
 ^ref-a4a25141-302-0
### notes you’ll care about ^ref-a4a25141-302-0
 ^ref-a4a25141-303-0 ^ref-a4a25141-304-0
* **cache semantics**: `embeddings.json` can now hold either `number[]` (legacy) or `{ hash, embedding }`. that means you won’t churn embeddings on first run, and you’ll only recompute when the chunk text actually changed. ^ref-a4a25141-304-0 ^ref-a4a25141-305-0
* **determinism**: chunk ids are still `${uuid}:${i}` to stay compatible with anything downstream that relies on that shape. ^ref-a4a25141-305-0
* **bounded pressure**: `--concurrency` (default 4). tune it to your box; NPUs/GPUs don’t like a stampede. ^ref-a4a25141-307-0
* **blast radius**: one corrupt file won’t nuke the run; it logs and keeps going. ^ref-a4a25141-307-0
 ^ref-a4a25141-309-0
if you want to go even more functional, we can make the “runner” pass in *all* side-effectors (`readFile`, `postEmbed`, `writeJSON`) as injected deps and test the whole pipeline with pure data. but this is already a big step up without over-engineering. ^ref-a4a25141-309-0

\#refactor #functional #typescript #ollama #embeddings #docs-pipeline<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [typed-struct-compiler](typed-struct-compiler.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [The Jar of Echoes](the-jar-of-echoes.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Ice Box Reorganization](ice-box-reorganization.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Reawakening Duck](reawakening-duck.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [promethean-requirements](promethean-requirements.md)
- [Promethean State Format](promethean-state-format.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [Creative Moments](creative-moments.md)
- [Promethean Notes](promethean-notes.md)
- [Tracing the Signal](tracing-the-signal.md)
- [unique-templates](templates/unique-templates.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [Unique Concepts](unique-concepts.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [NPU Voice Code and Sensory Integration](npu-voice-code-and-sensory-integration.md)
- [Optimizing Command Limitations in System Design](optimizing-command-limitations-in-system-design.md)
- [Redirecting Standard Error](redirecting-standard-error.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [Synchronicity Waves and Web](synchronicity-waves-and-web.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [Obsidian Task Generation](obsidian-task-generation.md)
- [OpenAPI Validation Report](openapi-validation-report.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Smoke Resonance Visualizations](smoke-resonance-visualizations.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [windows-tiling-with-autohotkey](windows-tiling-with-autohotkey.md)
- [graph-ds](graph-ds.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [Docops Feature Updates](docops-feature-updates.md)
- [Docops Feature Updates](docops-feature-updates-3.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [Tooling](chunks/tooling.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [DSL](chunks/dsl.md)
- [Window Management](chunks/window-management.md)
- [Promethean Dev Workflow Update](promethean-dev-workflow-update.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Mathematics Sampler](mathematics-sampler.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [JavaScript](chunks/javascript.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Promethean Chat Activity Report](promethean-chat-activity-report.md)
- [Promethean Documentation Update](promethean-documentation-update.txt)
- [field-interaction-equations](field-interaction-equations.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [Diagrams](chunks/diagrams.md)
- [Operations](chunks/operations.md)
- [Shared](chunks/shared.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [ChatGPT Custom Prompts](chatgpt-custom-prompts.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Mathematical Samplers](mathematical-samplers.md)
- [Mindful Prioritization](mindful-prioritization.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [Pipeline Enhancements](pipeline-enhancements.md)
- [Promethean Data Sync Protocol](promethean-data-sync-protocol.md)
- [Promethean Documentation Overview](promethean-documentation-overview.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Services](chunks/services.md)
- [Promethean Documentation Update](promethean-documentation-update.md)
- [MindfulRobotIntegration](mindfulrobotintegration.md)
- [balanced-bst](balanced-bst.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Refactor 05-footers.ts](refactor-05-footers-ts.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [SentenceProcessing](sentenceprocessing.md)
## Sources
- [Factorio AI with External Agents — L94](factorio-ai-with-external-agents.md#^ref-a4d90289-94-0) (line 94, col 0, score 0.86)
- [Factorio AI with External Agents — L135](factorio-ai-with-external-agents.md#^ref-a4d90289-135-0) (line 135, col 0, score 0.85)
- [Factorio AI with External Agents — L89](factorio-ai-with-external-agents.md#^ref-a4d90289-89-0) (line 89, col 0, score 0.86)
- [Pure TypeScript Search Microservice — L590](pure-typescript-search-microservice.md#^ref-d17d3a96-590-0) (line 590, col 0, score 1)
- [schema-evolution-workflow — L574](schema-evolution-workflow.md#^ref-d8059b6a-574-0) (line 574, col 0, score 1)
- [Stateful Partitions and Rebalancing — L604](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-604-0) (line 604, col 0, score 1)
- [unique-templates — L13](templates/unique-templates.md#^ref-c26f0044-13-0) (line 13, col 0, score 1)
- [The Jar of Echoes — L131](the-jar-of-echoes.md#^ref-18138627-131-0) (line 131, col 0, score 1)
- [Tracing the Signal — L107](tracing-the-signal.md#^ref-c3cd4f65-107-0) (line 107, col 0, score 1)
- [ts-to-lisp-transpiler — L38](ts-to-lisp-transpiler.md#^ref-ba11486b-38-0) (line 38, col 0, score 1)
- [typed-struct-compiler — L407](typed-struct-compiler.md#^ref-78eeedf7-407-0) (line 407, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L538](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-538-0) (line 538, col 0, score 1)
- [Unique Concepts — L11](unique-concepts.md#^ref-ed6f3fc9-11-0) (line 11, col 0, score 1)
- [Eidolon Field Abstract Model — L224](eidolon-field-abstract-model.md#^ref-5e8b2388-224-0) (line 224, col 0, score 1)
- [schema-evolution-workflow — L582](schema-evolution-workflow.md#^ref-d8059b6a-582-0) (line 582, col 0, score 1)
- [Stateful Partitions and Rebalancing — L620](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-620-0) (line 620, col 0, score 1)
- [unique-templates — L11](templates/unique-templates.md#^ref-c26f0044-11-0) (line 11, col 0, score 1)
- [The Jar of Echoes — L130](the-jar-of-echoes.md#^ref-18138627-130-0) (line 130, col 0, score 1)
- [Tracing the Signal — L106](tracing-the-signal.md#^ref-c3cd4f65-106-0) (line 106, col 0, score 1)
- [ts-to-lisp-transpiler — L44](ts-to-lisp-transpiler.md#^ref-ba11486b-44-0) (line 44, col 0, score 1)
- [typed-struct-compiler — L409](typed-struct-compiler.md#^ref-78eeedf7-409-0) (line 409, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L554](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-554-0) (line 554, col 0, score 1)
- [Unique Concepts — L9](unique-concepts.md#^ref-ed6f3fc9-9-0) (line 9, col 0, score 1)
- [ChatGPT Custom Prompts — L18](chatgpt-custom-prompts.md#^ref-930054b3-18-0) (line 18, col 0, score 1)
- [unique-templates — L12](templates/unique-templates.md#^ref-c26f0044-12-0) (line 12, col 0, score 1)
- [The Jar of Echoes — L139](the-jar-of-echoes.md#^ref-18138627-139-0) (line 139, col 0, score 1)
- [Tracing the Signal — L104](tracing-the-signal.md#^ref-c3cd4f65-104-0) (line 104, col 0, score 1)
- [ts-to-lisp-transpiler — L45](ts-to-lisp-transpiler.md#^ref-ba11486b-45-0) (line 45, col 0, score 1)
- [typed-struct-compiler — L411](typed-struct-compiler.md#^ref-78eeedf7-411-0) (line 411, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L566](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-566-0) (line 566, col 0, score 1)
- [Unique Concepts — L10](unique-concepts.md#^ref-ed6f3fc9-10-0) (line 10, col 0, score 1)
- [Unique Info Dump Index — L144](unique-info-dump-index.md#^ref-30ec3ba6-144-0) (line 144, col 0, score 1)
- [Dynamic Context Model for Web Components — L396](dynamic-context-model-for-web-components.md#^ref-f7702bf8-396-0) (line 396, col 0, score 1)
- [Shared — L68](chunks/shared.md#^ref-623a55f7-68-0) (line 68, col 0, score 1)
- [Simulation Demo — L49](chunks/simulation-demo.md#^ref-557309a3-49-0) (line 49, col 0, score 1)
- [Window Management — L73](chunks/window-management.md#^ref-9e8ae388-73-0) (line 73, col 0, score 1)
- [Creative Moments — L43](creative-moments.md#^ref-10d98225-43-0) (line 43, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L104](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-104-0) (line 104, col 0, score 1)
- [Docops Feature Updates — L44](docops-feature-updates-3.md#^ref-cdbd21ee-44-0) (line 44, col 0, score 1)
- [Docops Feature Updates — L75](docops-feature-updates.md#^ref-2792d448-75-0) (line 75, col 0, score 1)
- [DuckDuckGoSearchPipeline — L48](duckduckgosearchpipeline.md#^ref-e979c50f-48-0) (line 48, col 0, score 1)
- [Duck's Attractor States — L127](ducks-attractor-states.md#^ref-13951643-127-0) (line 127, col 0, score 1)
- [ChatGPT Custom Prompts — L22](chatgpt-custom-prompts.md#^ref-930054b3-22-0) (line 22, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L280](chroma-toolkit-consolidation-plan.md#^ref-5020e892-280-0) (line 280, col 0, score 1)
- [JavaScript — L124](chunks/javascript.md#^ref-c1618c66-124-0) (line 124, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L148](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-148-0) (line 148, col 0, score 1)
- [Dynamic Context Model for Web Components — L511](dynamic-context-model-for-web-components.md#^ref-f7702bf8-511-0) (line 511, col 0, score 1)
- [eidolon-field-math-foundations — L240](eidolon-field-math-foundations.md#^ref-008f2ac0-240-0) (line 240, col 0, score 1)
- [eidolon-node-lifecycle — L123](eidolon-node-lifecycle.md#^ref-938eca9c-123-0) (line 123, col 0, score 1)
- [Factorio AI with External Agents — L222](factorio-ai-with-external-agents.md#^ref-a4d90289-222-0) (line 222, col 0, score 1)
- [field-dynamics-math-blocks — L270](field-dynamics-math-blocks.md#^ref-7cfc230d-270-0) (line 270, col 0, score 1)
- [graph-ds — L494](graph-ds.md#^ref-6620e2f2-494-0) (line 494, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L299](layer1survivabilityenvelope.md#^ref-64a9f9f9-299-0) (line 299, col 0, score 1)
- [graph-ds — L465](graph-ds.md#^ref-6620e2f2-465-0) (line 465, col 0, score 1)
- [heartbeat-fragment-demo — L202](heartbeat-fragment-demo.md#^ref-dd00677a-202-0) (line 202, col 0, score 1)
- [homeostasis-decay-formulas — L242](homeostasis-decay-formulas.md#^ref-37b5d236-242-0) (line 242, col 0, score 1)
- [i3-bluetooth-setup — L190](i3-bluetooth-setup.md#^ref-5e408692-190-0) (line 190, col 0, score 1)
- [Ice Box Reorganization — L142](ice-box-reorganization.md#^ref-291c7d91-142-0) (line 142, col 0, score 1)
- [komorebi-group-window-hack — L325](komorebi-group-window-hack.md#^ref-dd89372d-325-0) (line 325, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L297](layer1survivabilityenvelope.md#^ref-64a9f9f9-297-0) (line 297, col 0, score 1)
- [Mathematical Samplers — L115](mathematical-samplers.md#^ref-86a691ec-115-0) (line 115, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L342](migrate-to-provider-tenant-architecture.md#^ref-54382370-342-0) (line 342, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L151](model-upgrade-calm-down-guide.md#^ref-db74343f-151-0) (line 151, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L94](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-94-0) (line 94, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L117](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-117-0) (line 117, col 0, score 1)
- [eidolon-field-math-foundations — L140](eidolon-field-math-foundations.md#^ref-008f2ac0-140-0) (line 140, col 0, score 1)
- [Admin Dashboard for User Management — L76](admin-dashboard-for-user-management.md#^ref-2901a3e9-76-0) (line 76, col 0, score 1)
- [Operations — L33](chunks/operations.md#^ref-f1add613-33-0) (line 33, col 0, score 1)
- [Duck's Attractor States — L98](ducks-attractor-states.md#^ref-13951643-98-0) (line 98, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L179](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-179-0) (line 179, col 0, score 1)
- [Mathematical Samplers — L116](mathematical-samplers.md#^ref-86a691ec-116-0) (line 116, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L136](model-upgrade-calm-down-guide.md#^ref-db74343f-136-0) (line 136, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L95](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-95-0) (line 95, col 0, score 1)
- [Optimizing Command Limitations in System Design — L133](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-133-0) (line 133, col 0, score 1)
- [Prometheus Observability Stack — L608](prometheus-observability-stack.md#^ref-e90b5a16-608-0) (line 608, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L224](protocol-0-the-contradiction-engine.md#^ref-9a93a756-224-0) (line 224, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L329](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-329-0) (line 329, col 0, score 1)
- [Pure TypeScript Search Microservice — L686](pure-typescript-search-microservice.md#^ref-d17d3a96-686-0) (line 686, col 0, score 1)
- [Redirecting Standard Error — L93](redirecting-standard-error.md#^ref-b3555ede-93-0) (line 93, col 0, score 1)
- [ripple-propagation-demo — L212](ripple-propagation-demo.md#^ref-8430617b-212-0) (line 212, col 0, score 1)
- [schema-evolution-workflow — L592](schema-evolution-workflow.md#^ref-d8059b6a-592-0) (line 592, col 0, score 1)
- [Self-Agency in AI Interaction — L106](self-agency-in-ai-interaction.md#^ref-49a9a860-106-0) (line 106, col 0, score 1)
- [Synchronicity Waves and Web — L192](synchronicity-waves-and-web.md#^ref-91295f3a-192-0) (line 192, col 0, score 1)
- [ts-to-lisp-transpiler — L159](ts-to-lisp-transpiler.md#^ref-ba11486b-159-0) (line 159, col 0, score 0.86)
- [Window Management — L140](chunks/window-management.md#^ref-9e8ae388-140-0) (line 140, col 0, score 0.86)
- [Chroma Toolkit Consolidation Plan — L304](chroma-toolkit-consolidation-plan.md#^ref-5020e892-304-0) (line 304, col 0, score 0.86)
- [typed-struct-compiler — L684](typed-struct-compiler.md#^ref-78eeedf7-684-0) (line 684, col 0, score 0.86)
- [DSL — L390](chunks/dsl.md#^ref-e87bc036-390-0) (line 390, col 0, score 0.86)
- [Simulation Demo — L311](chunks/simulation-demo.md#^ref-557309a3-311-0) (line 311, col 0, score 0.86)
- [Tooling — L223](chunks/tooling.md#^ref-6cb4943e-223-0) (line 223, col 0, score 0.86)
- [Window Management — L388](chunks/window-management.md#^ref-9e8ae388-388-0) (line 388, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L537](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-537-0) (line 537, col 0, score 0.86)
- [Duck's Self-Referential Perceptual Loop — L360](ducks-self-referential-perceptual-loop.md#^ref-71726f04-360-0) (line 360, col 0, score 1)
- [Dynamic Context Model for Web Components — L1322](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1322-0) (line 1322, col 0, score 0.86)
- [Fnord Tracer Protocol — L272](fnord-tracer-protocol.md#^ref-fc21f824-272-0) (line 272, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L245](layer1survivabilityenvelope.md#^ref-64a9f9f9-245-0) (line 245, col 0, score 1)
- [Mathematics Sampler — L132](mathematics-sampler.md#^ref-b5e0183e-132-0) (line 132, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L375](migrate-to-provider-tenant-architecture.md#^ref-54382370-375-0) (line 375, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L215](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-215-0) (line 215, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L164](model-upgrade-calm-down-guide.md#^ref-db74343f-164-0) (line 164, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L90](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-90-0) (line 90, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L132](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-132-0) (line 132, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L172](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-172-0) (line 172, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L336](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-336-0) (line 336, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L137](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-137-0) (line 137, col 0, score 1)
- [eidolon-field-math-foundations — L163](eidolon-field-math-foundations.md#^ref-008f2ac0-163-0) (line 163, col 0, score 1)
- [schema-evolution-workflow — L559](schema-evolution-workflow.md#^ref-d8059b6a-559-0) (line 559, col 0, score 1)
- [Stateful Partitions and Rebalancing — L615](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-615-0) (line 615, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L556](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-556-0) (line 556, col 0, score 1)
- [zero-copy-snapshots-and-workers — L409](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-409-0) (line 409, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L156](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-156-0) (line 156, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L127](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-127-0) (line 127, col 0, score 1)
- [ChatGPT Custom Prompts — L36](chatgpt-custom-prompts.md#^ref-930054b3-36-0) (line 36, col 0, score 1)
- [Operations — L48](chunks/operations.md#^ref-f1add613-48-0) (line 48, col 0, score 1)
- [Creative Moments — L51](creative-moments.md#^ref-10d98225-51-0) (line 51, col 0, score 1)
- [Mathematical Samplers — L66](mathematical-samplers.md#^ref-86a691ec-66-0) (line 66, col 0, score 1)
- [Mathematics Sampler — L70](mathematics-sampler.md#^ref-b5e0183e-70-0) (line 70, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L364](migrate-to-provider-tenant-architecture.md#^ref-54382370-364-0) (line 364, col 0, score 1)
- [Mindful Prioritization — L20](mindful-prioritization.md#^ref-40185d05-20-0) (line 20, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L203](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-203-0) (line 203, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L25](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-25-0) (line 25, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L87](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-87-0) (line 87, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L89](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-89-0) (line 89, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L111](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-111-0) (line 111, col 0, score 1)
- [Obsidian Task Generation — L25](obsidian-task-generation.md#^ref-9b694a91-25-0) (line 25, col 0, score 1)
- [OpenAPI Validation Report — L43](openapi-validation-report.md#^ref-5c152b08-43-0) (line 43, col 0, score 1)
- [Optimizing Command Limitations in System Design — L79](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-79-0) (line 79, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L541](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-541-0) (line 541, col 0, score 1)
- [zero-copy-snapshots-and-workers — L375](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-375-0) (line 375, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L78](ducks-self-referential-perceptual-loop.md#^ref-71726f04-78-0) (line 78, col 0, score 1)
- [Factorio AI with External Agents — L176](factorio-ai-with-external-agents.md#^ref-a4d90289-176-0) (line 176, col 0, score 1)
- [field-node-diagram-outline — L154](field-node-diagram-outline.md#^ref-1f32c94a-154-0) (line 154, col 0, score 1)
- [field-node-diagram-set — L175](field-node-diagram-set.md#^ref-22b989d5-175-0) (line 175, col 0, score 1)
- [field-node-diagram-visualizations — L123](field-node-diagram-visualizations.md#^ref-e9b27b06-123-0) (line 123, col 0, score 1)
- [Fnord Tracer Protocol — L274](fnord-tracer-protocol.md#^ref-fc21f824-274-0) (line 274, col 0, score 1)
- [graph-ds — L412](graph-ds.md#^ref-6620e2f2-412-0) (line 412, col 0, score 1)
- [heartbeat-fragment-demo — L159](heartbeat-fragment-demo.md#^ref-dd00677a-159-0) (line 159, col 0, score 1)
- [Ice Box Reorganization — L95](ice-box-reorganization.md#^ref-291c7d91-95-0) (line 95, col 0, score 1)
- [komorebi-group-window-hack — L237](komorebi-group-window-hack.md#^ref-dd89372d-237-0) (line 237, col 0, score 1)
- [Prometheus Observability Stack — L541](prometheus-observability-stack.md#^ref-e90b5a16-541-0) (line 541, col 0, score 1)
- [Prompt_Folder_Bootstrap — L222](prompt-folder-bootstrap.md#^ref-bd4f0976-222-0) (line 222, col 0, score 1)
- [Reawakening Duck — L131](reawakening-duck.md#^ref-59b5670f-131-0) (line 131, col 0, score 1)
- [typed-struct-compiler — L416](typed-struct-compiler.md#^ref-78eeedf7-416-0) (line 416, col 0, score 1)
- [Docops Feature Updates — L20](docops-feature-updates-3.md#^ref-cdbd21ee-20-0) (line 20, col 0, score 1)
- [Docops Feature Updates — L37](docops-feature-updates.md#^ref-2792d448-37-0) (line 37, col 0, score 1)
- [DuckDuckGoSearchPipeline — L59](duckduckgosearchpipeline.md#^ref-e979c50f-59-0) (line 59, col 0, score 1)
- [Duck's Attractor States — L103](ducks-attractor-states.md#^ref-13951643-103-0) (line 103, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L84](ducks-self-referential-perceptual-loop.md#^ref-71726f04-84-0) (line 84, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L134](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-134-0) (line 134, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L547](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-547-0) (line 547, col 0, score 1)
- [Promethean Documentation Update — L21](promethean-documentation-update.txt#^ref-0b872af2-21-0) (line 21, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L87](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-87-0) (line 87, col 0, score 1)
- [Promethean Notes — L24](promethean-notes.md#^ref-1c4046b5-24-0) (line 24, col 0, score 1)
- [Promethean Pipelines — L128](promethean-pipelines.md#^ref-8b8e6103-128-0) (line 128, col 0, score 1)
- [promethean-requirements — L35](promethean-requirements.md#^ref-95205cd3-35-0) (line 35, col 0, score 1)
- [Promethean State Format — L131](promethean-state-format.md#^ref-23df6ddb-131-0) (line 131, col 0, score 1)
- [Promethean Workflow Optimization — L33](promethean-workflow-optimization.md#^ref-d614d983-33-0) (line 33, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L268](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-268-0) (line 268, col 0, score 1)
- [komorebi-group-window-hack — L242](komorebi-group-window-hack.md#^ref-dd89372d-242-0) (line 242, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L200](layer1survivabilityenvelope.md#^ref-64a9f9f9-200-0) (line 200, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L194](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-194-0) (line 194, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L172](model-upgrade-calm-down-guide.md#^ref-db74343f-172-0) (line 172, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L91](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-91-0) (line 91, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L87](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-87-0) (line 87, col 0, score 1)
- [Obsidian Task Generation — L88](obsidian-task-generation.md#^ref-9b694a91-88-0) (line 88, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L150](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-150-0) (line 150, col 0, score 1)
- [Optimizing Command Limitations in System Design — L132](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-132-0) (line 132, col 0, score 1)
- [plan-update-confirmation — L1046](plan-update-confirmation.md#^ref-b22d79c6-1046-0) (line 1046, col 0, score 1)
- [Pure TypeScript Search Microservice — L594](pure-typescript-search-microservice.md#^ref-d17d3a96-594-0) (line 594, col 0, score 1)
- [schema-evolution-workflow — L578](schema-evolution-workflow.md#^ref-d8059b6a-578-0) (line 578, col 0, score 1)
- [Stateful Partitions and Rebalancing — L616](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-616-0) (line 616, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L571](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-571-0) (line 571, col 0, score 1)
- [zero-copy-snapshots-and-workers — L385](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-385-0) (line 385, col 0, score 1)
- [field-node-diagram-set — L176](field-node-diagram-set.md#^ref-22b989d5-176-0) (line 176, col 0, score 1)
- [homeostasis-decay-formulas — L195](homeostasis-decay-formulas.md#^ref-37b5d236-195-0) (line 195, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L198](layer1survivabilityenvelope.md#^ref-64a9f9f9-198-0) (line 198, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L65](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-65-0) (line 65, col 0, score 1)
- [plan-update-confirmation — L1028](plan-update-confirmation.md#^ref-b22d79c6-1028-0) (line 1028, col 0, score 1)
- [polyglot-repl-interface-layer — L208](polyglot-repl-interface-layer.md#^ref-9c79206d-208-0) (line 208, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L127](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-127-0) (line 127, col 0, score 1)
- [Tooling — L36](chunks/tooling.md#^ref-6cb4943e-36-0) (line 36, col 0, score 1)
- [Window Management — L49](chunks/window-management.md#^ref-9e8ae388-49-0) (line 49, col 0, score 1)
- [Creative Moments — L18](creative-moments.md#^ref-10d98225-18-0) (line 18, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L77](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-77-0) (line 77, col 0, score 1)
- [Docops Feature Updates — L39](docops-feature-updates-3.md#^ref-cdbd21ee-39-0) (line 39, col 0, score 1)
- [Docops Feature Updates — L67](docops-feature-updates.md#^ref-2792d448-67-0) (line 67, col 0, score 1)
- [DuckDuckGoSearchPipeline — L22](duckduckgosearchpipeline.md#^ref-e979c50f-22-0) (line 22, col 0, score 1)
- [Duck's Attractor States — L107](ducks-attractor-states.md#^ref-13951643-107-0) (line 107, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L88](ducks-self-referential-perceptual-loop.md#^ref-71726f04-88-0) (line 88, col 0, score 1)
- [eidolon-field-math-foundations — L198](eidolon-field-math-foundations.md#^ref-008f2ac0-198-0) (line 198, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L483](performance-optimized-polyglot-bridge.md#^ref-f5579967-483-0) (line 483, col 0, score 1)
- [Pipeline Enhancements — L11](pipeline-enhancements.md#^ref-e2135d9f-11-0) (line 11, col 0, score 1)
- [plan-update-confirmation — L1026](plan-update-confirmation.md#^ref-b22d79c6-1026-0) (line 1026, col 0, score 1)
- [polyglot-repl-interface-layer — L219](polyglot-repl-interface-layer.md#^ref-9c79206d-219-0) (line 219, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L126](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-126-0) (line 126, col 0, score 1)
- [Promethean Chat Activity Report — L33](promethean-chat-activity-report.md#^ref-18344cf9-33-0) (line 33, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L100](promethean-copilot-intent-engine.md#^ref-ae24a280-100-0) (line 100, col 0, score 1)
- [Promethean Data Sync Protocol — L15](promethean-data-sync-protocol.md#^ref-9fab9e76-15-0) (line 15, col 0, score 1)
- [Promethean Dev Workflow Update — L107](promethean-dev-workflow-update.md#^ref-03a5578f-107-0) (line 107, col 0, score 1)
- [Promethean Documentation Overview — L9](promethean-documentation-overview.md#^ref-9413237f-9-0) (line 9, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L71](model-upgrade-calm-down-guide.md#^ref-db74343f-71-0) (line 71, col 0, score 1)
- [Duck's Attractor States — L105](ducks-attractor-states.md#^ref-13951643-105-0) (line 105, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L71](ducks-self-referential-perceptual-loop.md#^ref-71726f04-71-0) (line 71, col 0, score 1)
- [Factorio AI with External Agents — L183](factorio-ai-with-external-agents.md#^ref-a4d90289-183-0) (line 183, col 0, score 1)
- [Fnord Tracer Protocol — L279](fnord-tracer-protocol.md#^ref-fc21f824-279-0) (line 279, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L159](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-159-0) (line 159, col 0, score 1)
- [graph-ds — L423](graph-ds.md#^ref-6620e2f2-423-0) (line 423, col 0, score 1)
- [i3-bluetooth-setup — L158](i3-bluetooth-setup.md#^ref-5e408692-158-0) (line 158, col 0, score 1)
- [Ice Box Reorganization — L103](ice-box-reorganization.md#^ref-291c7d91-103-0) (line 103, col 0, score 1)
- [komorebi-group-window-hack — L253](komorebi-group-window-hack.md#^ref-dd89372d-253-0) (line 253, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L202](layer1survivabilityenvelope.md#^ref-64a9f9f9-202-0) (line 202, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L160](protocol-0-the-contradiction-engine.md#^ref-9a93a756-160-0) (line 160, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L276](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-276-0) (line 276, col 0, score 1)
- [Pure TypeScript Search Microservice — L628](pure-typescript-search-microservice.md#^ref-d17d3a96-628-0) (line 628, col 0, score 1)
- [Reawakening Duck — L161](reawakening-duck.md#^ref-59b5670f-161-0) (line 161, col 0, score 1)
- [Redirecting Standard Error — L35](redirecting-standard-error.md#^ref-b3555ede-35-0) (line 35, col 0, score 1)
- [schema-evolution-workflow — L603](schema-evolution-workflow.md#^ref-d8059b6a-603-0) (line 603, col 0, score 1)
- [Self-Agency in AI Interaction — L57](self-agency-in-ai-interaction.md#^ref-49a9a860-57-0) (line 57, col 0, score 1)
- [sibilant-macro-targets — L250](sibilant-macro-targets.md#^ref-c5c9a5c6-250-0) (line 250, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L184](protocol-0-the-contradiction-engine.md#^ref-9a93a756-184-0) (line 184, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L283](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-283-0) (line 283, col 0, score 1)
- [Pure TypeScript Search Microservice — L629](pure-typescript-search-microservice.md#^ref-d17d3a96-629-0) (line 629, col 0, score 1)
- [Redirecting Standard Error — L36](redirecting-standard-error.md#^ref-b3555ede-36-0) (line 36, col 0, score 1)
- [schema-evolution-workflow — L623](schema-evolution-workflow.md#^ref-d8059b6a-623-0) (line 623, col 0, score 1)
- [Self-Agency in AI Interaction — L58](self-agency-in-ai-interaction.md#^ref-49a9a860-58-0) (line 58, col 0, score 1)
- [Smoke Resonance Visualizations — L108](smoke-resonance-visualizations.md#^ref-ac9d3ac5-108-0) (line 108, col 0, score 1)
- [Stateful Partitions and Rebalancing — L654](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-654-0) (line 654, col 0, score 1)
- [Synchronicity Waves and Web — L123](synchronicity-waves-and-web.md#^ref-91295f3a-123-0) (line 123, col 0, score 1)
- [JavaScript — L76](chunks/javascript.md#^ref-c1618c66-76-0) (line 76, col 0, score 1)
- [Math Fundamentals — L69](chunks/math-fundamentals.md#^ref-c6e87433-69-0) (line 69, col 0, score 1)
- [Services — L62](chunks/services.md#^ref-75ea4a6a-62-0) (line 62, col 0, score 1)
- [Tooling — L54](chunks/tooling.md#^ref-6cb4943e-54-0) (line 54, col 0, score 1)
- [Window Management — L56](chunks/window-management.md#^ref-9e8ae388-56-0) (line 56, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L87](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-87-0) (line 87, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L82](ducks-self-referential-perceptual-loop.md#^ref-71726f04-82-0) (line 82, col 0, score 1)
- [Dynamic Context Model for Web Components — L467](dynamic-context-model-for-web-components.md#^ref-f7702bf8-467-0) (line 467, col 0, score 1)
- [field-dynamics-math-blocks — L205](field-dynamics-math-blocks.md#^ref-7cfc230d-205-0) (line 205, col 0, score 1)
- [Reawakening Duck — L164](reawakening-duck.md#^ref-59b5670f-164-0) (line 164, col 0, score 1)
- [Redirecting Standard Error — L39](redirecting-standard-error.md#^ref-b3555ede-39-0) (line 39, col 0, score 1)
- [schema-evolution-workflow — L625](schema-evolution-workflow.md#^ref-d8059b6a-625-0) (line 625, col 0, score 1)
- [Self-Agency in AI Interaction — L60](self-agency-in-ai-interaction.md#^ref-49a9a860-60-0) (line 60, col 0, score 1)
- [sibilant-macro-targets — L253](sibilant-macro-targets.md#^ref-c5c9a5c6-253-0) (line 253, col 0, score 1)
- [Smoke Resonance Visualizations — L128](smoke-resonance-visualizations.md#^ref-ac9d3ac5-128-0) (line 128, col 0, score 1)
- [Stateful Partitions and Rebalancing — L644](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-644-0) (line 644, col 0, score 1)
- [Synchronicity Waves and Web — L125](synchronicity-waves-and-web.md#^ref-91295f3a-125-0) (line 125, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L574](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-574-0) (line 574, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L541](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-541-0) (line 541, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L503](performance-optimized-polyglot-bridge.md#^ref-f5579967-503-0) (line 503, col 0, score 1)
- [Pipeline Enhancements — L17](pipeline-enhancements.md#^ref-e2135d9f-17-0) (line 17, col 0, score 1)
- [plan-update-confirmation — L1056](plan-update-confirmation.md#^ref-b22d79c6-1056-0) (line 1056, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L116](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-116-0) (line 116, col 0, score 1)
- [Promethean Chat Activity Report — L41](promethean-chat-activity-report.md#^ref-18344cf9-41-0) (line 41, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L118](promethean-copilot-intent-engine.md#^ref-ae24a280-118-0) (line 118, col 0, score 1)
- [Promethean Data Sync Protocol — L20](promethean-data-sync-protocol.md#^ref-9fab9e76-20-0) (line 20, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L92](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-92-0) (line 92, col 0, score 1)
- [Prometheus Observability Stack — L565](prometheus-observability-stack.md#^ref-e90b5a16-565-0) (line 565, col 0, score 1)
- [Prompt_Folder_Bootstrap — L244](prompt-folder-bootstrap.md#^ref-bd4f0976-244-0) (line 244, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L159](protocol-0-the-contradiction-engine.md#^ref-9a93a756-159-0) (line 159, col 0, score 1)
- [Prometheus Observability Stack — L517](prometheus-observability-stack.md#^ref-e90b5a16-517-0) (line 517, col 0, score 1)
- [Optimizing Command Limitations in System Design — L69](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-69-0) (line 69, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L305](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-305-0) (line 305, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L487](performance-optimized-polyglot-bridge.md#^ref-f5579967-487-0) (line 487, col 0, score 1)
- [Pipeline Enhancements — L49](pipeline-enhancements.md#^ref-e2135d9f-49-0) (line 49, col 0, score 1)
- [plan-update-confirmation — L1032](plan-update-confirmation.md#^ref-b22d79c6-1032-0) (line 1032, col 0, score 1)
- [polyglot-repl-interface-layer — L213](polyglot-repl-interface-layer.md#^ref-9c79206d-213-0) (line 213, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L129](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-129-0) (line 129, col 0, score 1)
- [Promethean Chat Activity Report — L95](promethean-chat-activity-report.md#^ref-18344cf9-95-0) (line 95, col 0, score 1)
- [Promethean Data Sync Protocol — L74](promethean-data-sync-protocol.md#^ref-9fab9e76-74-0) (line 74, col 0, score 1)
- [Promethean Dev Workflow Update — L88](promethean-dev-workflow-update.md#^ref-03a5578f-88-0) (line 88, col 0, score 1)
- [Pure TypeScript Search Microservice — L606](pure-typescript-search-microservice.md#^ref-d17d3a96-606-0) (line 606, col 0, score 1)
- [Stateful Partitions and Rebalancing — L619](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-619-0) (line 619, col 0, score 1)
- [Creative Moments — L90](creative-moments.md#^ref-10d98225-90-0) (line 90, col 0, score 1)
- [Promethean Documentation Update — L80](promethean-documentation-update.txt#^ref-0b872af2-80-0) (line 80, col 0, score 1)
- [Promethean Notes — L87](promethean-notes.md#^ref-1c4046b5-87-0) (line 87, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L582](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-582-0) (line 582, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L572](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-572-0) (line 572, col 0, score 1)
- [eidolon-field-math-foundations — L2563](eidolon-field-math-foundations.md#^ref-008f2ac0-2563-0) (line 2563, col 0, score 0.93)
- [Duck's Attractor States — L2162](ducks-attractor-states.md#^ref-13951643-2162-0) (line 2162, col 0, score 0.92)
- [Duck's Attractor States — L2138](ducks-attractor-states.md#^ref-13951643-2138-0) (line 2138, col 0, score 0.92)
- [Duck's Attractor States — L2146](ducks-attractor-states.md#^ref-13951643-2146-0) (line 2146, col 0, score 0.92)
- [The Jar of Echoes — L2382](the-jar-of-echoes.md#^ref-18138627-2382-0) (line 2382, col 0, score 0.92)
- [eidolon-field-math-foundations — L3746](eidolon-field-math-foundations.md#^ref-008f2ac0-3746-0) (line 3746, col 0, score 0.92)
- [Duck's Attractor States — L3771](ducks-attractor-states.md#^ref-13951643-3771-0) (line 3771, col 0, score 0.92)
- [Pure TypeScript Search Microservice — L635](pure-typescript-search-microservice.md#^ref-d17d3a96-635-0) (line 635, col 0, score 1)
- [Reawakening Duck — L172](reawakening-duck.md#^ref-59b5670f-172-0) (line 172, col 0, score 1)
- [Redirecting Standard Error — L73](redirecting-standard-error.md#^ref-b3555ede-73-0) (line 73, col 0, score 1)
- [ripple-propagation-demo — L162](ripple-propagation-demo.md#^ref-8430617b-162-0) (line 162, col 0, score 1)
- [schema-evolution-workflow — L612](schema-evolution-workflow.md#^ref-d8059b6a-612-0) (line 612, col 0, score 1)
- [Self-Agency in AI Interaction — L94](self-agency-in-ai-interaction.md#^ref-49a9a860-94-0) (line 94, col 0, score 1)
- [sibilant-macro-targets — L246](sibilant-macro-targets.md#^ref-c5c9a5c6-246-0) (line 246, col 0, score 1)
- [Stateful Partitions and Rebalancing — L638](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-638-0) (line 638, col 0, score 1)
- [unique-templates — L55](templates/unique-templates.md#^ref-c26f0044-55-0) (line 55, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L537](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-537-0) (line 537, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L493](performance-optimized-polyglot-bridge.md#^ref-f5579967-493-0) (line 493, col 0, score 1)
- [Pipeline Enhancements — L18](pipeline-enhancements.md#^ref-e2135d9f-18-0) (line 18, col 0, score 1)
- [polyglot-repl-interface-layer — L206](polyglot-repl-interface-layer.md#^ref-9c79206d-206-0) (line 206, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L159](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-159-0) (line 159, col 0, score 1)
- [Promethean Chat Activity Report — L66](promethean-chat-activity-report.md#^ref-18344cf9-66-0) (line 66, col 0, score 1)
- [Promethean Data Sync Protocol — L45](promethean-data-sync-protocol.md#^ref-9fab9e76-45-0) (line 45, col 0, score 1)
- [Promethean Dev Workflow Update — L98](promethean-dev-workflow-update.md#^ref-03a5578f-98-0) (line 98, col 0, score 1)
- [Promethean Documentation Overview — L16](promethean-documentation-overview.md#^ref-9413237f-16-0) (line 16, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L202](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-202-0) (line 202, col 0, score 1)
- [Promethean Documentation Update — L46](promethean-documentation-update.md#^ref-c0392040-46-0) (line 46, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L588](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-588-0) (line 588, col 0, score 1)
- [field-node-diagram-outline — L190](field-node-diagram-outline.md#^ref-1f32c94a-190-0) (line 190, col 0, score 1)
- [field-node-diagram-set — L217](field-node-diagram-set.md#^ref-22b989d5-217-0) (line 217, col 0, score 1)
- [field-node-diagram-visualizations — L165](field-node-diagram-visualizations.md#^ref-e9b27b06-165-0) (line 165, col 0, score 1)
- [Fnord Tracer Protocol — L306](fnord-tracer-protocol.md#^ref-fc21f824-306-0) (line 306, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L165](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-165-0) (line 165, col 0, score 1)
- [graph-ds — L442](graph-ds.md#^ref-6620e2f2-442-0) (line 442, col 0, score 1)
- [heartbeat-fragment-demo — L194](heartbeat-fragment-demo.md#^ref-dd00677a-194-0) (line 194, col 0, score 1)
- [Ice Box Reorganization — L135](ice-box-reorganization.md#^ref-291c7d91-135-0) (line 135, col 0, score 1)
- [komorebi-group-window-hack — L278](komorebi-group-window-hack.md#^ref-dd89372d-278-0) (line 278, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L225](layer1survivabilityenvelope.md#^ref-64a9f9f9-225-0) (line 225, col 0, score 1)
- [Mathematical Samplers — L78](mathematical-samplers.md#^ref-86a691ec-78-0) (line 78, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L372](migrate-to-provider-tenant-architecture.md#^ref-54382370-372-0) (line 372, col 0, score 1)
- [Promethean Documentation Overview — L22](promethean-documentation-overview.md#^ref-9413237f-22-0) (line 22, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L176](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-176-0) (line 176, col 0, score 1)
- [Promethean Documentation Update — L50](promethean-documentation-update.md#^ref-c0392040-50-0) (line 50, col 0, score 1)
- [Promethean Documentation Update — L49](promethean-documentation-update.txt#^ref-0b872af2-49-0) (line 49, col 0, score 1)
- [Promethean Notes — L52](promethean-notes.md#^ref-1c4046b5-52-0) (line 52, col 0, score 1)
- [Promethean Pipelines — L122](promethean-pipelines.md#^ref-8b8e6103-122-0) (line 122, col 0, score 1)
- [promethean-requirements — L63](promethean-requirements.md#^ref-95205cd3-63-0) (line 63, col 0, score 1)
- [Promethean State Format — L136](promethean-state-format.md#^ref-23df6ddb-136-0) (line 136, col 0, score 1)
- [Promethean Workflow Optimization — L61](promethean-workflow-optimization.md#^ref-d614d983-61-0) (line 61, col 0, score 1)
- [Promethean Documentation Update — L50](promethean-documentation-update.txt#^ref-0b872af2-50-0) (line 50, col 0, score 1)
- [Promethean Notes — L53](promethean-notes.md#^ref-1c4046b5-53-0) (line 53, col 0, score 1)
- [Promethean Pipelines — L132](promethean-pipelines.md#^ref-8b8e6103-132-0) (line 132, col 0, score 1)
- [promethean-requirements — L64](promethean-requirements.md#^ref-95205cd3-64-0) (line 64, col 0, score 1)
- [Promethean Workflow Optimization — L62](promethean-workflow-optimization.md#^ref-d614d983-62-0) (line 62, col 0, score 1)
- [Prometheus Observability Stack — L570](prometheus-observability-stack.md#^ref-e90b5a16-570-0) (line 570, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L167](protocol-0-the-contradiction-engine.md#^ref-9a93a756-167-0) (line 167, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L288](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-288-0) (line 288, col 0, score 1)
- [Pure TypeScript Search Microservice — L634](pure-typescript-search-microservice.md#^ref-d17d3a96-634-0) (line 634, col 0, score 1)
- [Pure TypeScript Search Microservice — L605](pure-typescript-search-microservice.md#^ref-d17d3a96-605-0) (line 605, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L561](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-561-0) (line 561, col 0, score 1)
- [schema-evolution-workflow — L645](schema-evolution-workflow.md#^ref-d8059b6a-645-0) (line 645, col 0, score 1)
- [Stateful Partitions and Rebalancing — L671](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-671-0) (line 671, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L147](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-147-0) (line 147, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L241](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-241-0) (line 241, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L228](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-228-0) (line 228, col 0, score 1)
- [Creative Moments — L106](creative-moments.md#^ref-10d98225-106-0) (line 106, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L156](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-156-0) (line 156, col 0, score 1)
- [eidolon-field-math-foundations — L266](eidolon-field-math-foundations.md#^ref-008f2ac0-266-0) (line 266, col 0, score 1)
- [heartbeat-fragment-demo — L227](heartbeat-fragment-demo.md#^ref-dd00677a-227-0) (line 227, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L152](model-upgrade-calm-down-guide.md#^ref-db74343f-152-0) (line 152, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L139](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-139-0) (line 139, col 0, score 1)
- [promethean-requirements — L68](promethean-requirements.md#^ref-95205cd3-68-0) (line 68, col 0, score 1)
- [Reawakening Duck — L211](reawakening-duck.md#^ref-59b5670f-211-0) (line 211, col 0, score 1)
- [Redirecting Standard Error — L75](redirecting-standard-error.md#^ref-b3555ede-75-0) (line 75, col 0, score 1)
- [schema-evolution-workflow — L629](schema-evolution-workflow.md#^ref-d8059b6a-629-0) (line 629, col 0, score 1)
- [Self-Agency in AI Interaction — L95](self-agency-in-ai-interaction.md#^ref-49a9a860-95-0) (line 95, col 0, score 1)
- [sibilant-macro-targets — L264](sibilant-macro-targets.md#^ref-c5c9a5c6-264-0) (line 264, col 0, score 1)
- [Smoke Resonance Visualizations — L144](smoke-resonance-visualizations.md#^ref-ac9d3ac5-144-0) (line 144, col 0, score 1)
- [Stateful Partitions and Rebalancing — L658](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-658-0) (line 658, col 0, score 1)
- [Synchronicity Waves and Web — L140](synchronicity-waves-and-web.md#^ref-91295f3a-140-0) (line 140, col 0, score 1)
- [Pure TypeScript Search Microservice — L668](pure-typescript-search-microservice.md#^ref-d17d3a96-668-0) (line 668, col 0, score 1)
- [Reawakening Duck — L213](reawakening-duck.md#^ref-59b5670f-213-0) (line 213, col 0, score 1)
- [Redirecting Standard Error — L83](redirecting-standard-error.md#^ref-b3555ede-83-0) (line 83, col 0, score 1)
- [schema-evolution-workflow — L647](schema-evolution-workflow.md#^ref-d8059b6a-647-0) (line 647, col 0, score 1)
- [Smoke Resonance Visualizations — L163](smoke-resonance-visualizations.md#^ref-ac9d3ac5-163-0) (line 163, col 0, score 1)
- [Stateful Partitions and Rebalancing — L682](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-682-0) (line 682, col 0, score 1)
- [Synchronicity Waves and Web — L168](synchronicity-waves-and-web.md#^ref-91295f3a-168-0) (line 168, col 0, score 1)
- [unique-templates — L65](templates/unique-templates.md#^ref-c26f0044-65-0) (line 65, col 0, score 1)
- [The Jar of Echoes — L191](the-jar-of-echoes.md#^ref-18138627-191-0) (line 191, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L209](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-209-0) (line 209, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L137](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-137-0) (line 137, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L138](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-138-0) (line 138, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L207](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-207-0) (line 207, col 0, score 1)
- [Pipeline Enhancements — L59](pipeline-enhancements.md#^ref-e2135d9f-59-0) (line 59, col 0, score 1)
- [plan-update-confirmation — L1100](plan-update-confirmation.md#^ref-b22d79c6-1100-0) (line 1100, col 0, score 1)
- [polyglot-repl-interface-layer — L230](polyglot-repl-interface-layer.md#^ref-9c79206d-230-0) (line 230, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L125](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-125-0) (line 125, col 0, score 1)
- [Promethean Chat Activity Report — L147](promethean-chat-activity-report.md#^ref-18344cf9-147-0) (line 147, col 0, score 1)
- [MindfulRobotIntegration — L55](mindfulrobotintegration.md#^ref-5f65dfa5-55-0) (line 55, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L114](model-upgrade-calm-down-guide.md#^ref-db74343f-114-0) (line 114, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L61](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-61-0) (line 61, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L118](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-118-0) (line 118, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L119](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-119-0) (line 119, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L124](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-124-0) (line 124, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L190](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-190-0) (line 190, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L558](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-558-0) (line 558, col 0, score 1)
- [Pipeline Enhancements — L34](pipeline-enhancements.md#^ref-e2135d9f-34-0) (line 34, col 0, score 1)
- [plan-update-confirmation — L1084](plan-update-confirmation.md#^ref-b22d79c6-1084-0) (line 1084, col 0, score 1)
- [Promethean Dev Workflow Update — L110](promethean-dev-workflow-update.md#^ref-03a5578f-110-0) (line 110, col 0, score 1)
- [komorebi-group-window-hack — L313](komorebi-group-window-hack.md#^ref-dd89372d-313-0) (line 313, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L255](layer1survivabilityenvelope.md#^ref-64a9f9f9-255-0) (line 255, col 0, score 1)
- [Mathematical Samplers — L93](mathematical-samplers.md#^ref-86a691ec-93-0) (line 93, col 0, score 1)
- [Mathematics Sampler — L98](mathematics-sampler.md#^ref-b5e0183e-98-0) (line 98, col 0, score 1)
- [Mindful Prioritization — L65](mindful-prioritization.md#^ref-40185d05-65-0) (line 65, col 0, score 1)
- [MindfulRobotIntegration — L63](mindfulrobotintegration.md#^ref-5f65dfa5-63-0) (line 63, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L226](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-226-0) (line 226, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L123](model-upgrade-calm-down-guide.md#^ref-db74343f-123-0) (line 123, col 0, score 1)
- [Pipeline Enhancements — L38](pipeline-enhancements.md#^ref-e2135d9f-38-0) (line 38, col 0, score 1)
- [plan-update-confirmation — L1090](plan-update-confirmation.md#^ref-b22d79c6-1090-0) (line 1090, col 0, score 1)
- [Pure TypeScript Search Microservice — L676](pure-typescript-search-microservice.md#^ref-d17d3a96-676-0) (line 676, col 0, score 1)
- [Redirecting Standard Error — L81](redirecting-standard-error.md#^ref-b3555ede-81-0) (line 81, col 0, score 1)
- [ripple-propagation-demo — L194](ripple-propagation-demo.md#^ref-8430617b-194-0) (line 194, col 0, score 1)
- [schema-evolution-workflow — L650](schema-evolution-workflow.md#^ref-d8059b6a-650-0) (line 650, col 0, score 1)
- [Self-Agency in AI Interaction — L100](self-agency-in-ai-interaction.md#^ref-49a9a860-100-0) (line 100, col 0, score 1)
- [sibilant-macro-targets — L285](sibilant-macro-targets.md#^ref-c5c9a5c6-285-0) (line 285, col 0, score 1)
- [Smoke Resonance Visualizations — L170](smoke-resonance-visualizations.md#^ref-ac9d3ac5-170-0) (line 170, col 0, score 1)
- [Stateful Partitions and Rebalancing — L686](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-686-0) (line 686, col 0, score 1)
- [Synchronicity Waves and Web — L171](synchronicity-waves-and-web.md#^ref-91295f3a-171-0) (line 171, col 0, score 1)
- [Pure TypeScript Search Microservice — L575](pure-typescript-search-microservice.md#^ref-d17d3a96-575-0) (line 575, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L157](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-157-0) (line 157, col 0, score 1)
- [Obsidian Task Generation — L65](obsidian-task-generation.md#^ref-9b694a91-65-0) (line 65, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L359](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-359-0) (line 359, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L539](performance-optimized-polyglot-bridge.md#^ref-f5579967-539-0) (line 539, col 0, score 1)
- [Pipeline Enhancements — L33](pipeline-enhancements.md#^ref-e2135d9f-33-0) (line 33, col 0, score 1)
- [polyglot-repl-interface-layer — L259](polyglot-repl-interface-layer.md#^ref-9c79206d-259-0) (line 259, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L182](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-182-0) (line 182, col 0, score 1)
- [Promethean Chat Activity Report — L79](promethean-chat-activity-report.md#^ref-18344cf9-79-0) (line 79, col 0, score 1)
- [Pure TypeScript Search Microservice — L600](pure-typescript-search-microservice.md#^ref-d17d3a96-600-0) (line 600, col 0, score 1)
- [schema-evolution-workflow — L583](schema-evolution-workflow.md#^ref-d8059b6a-583-0) (line 583, col 0, score 1)
- [Stateful Partitions and Rebalancing — L610](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-610-0) (line 610, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L546](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-546-0) (line 546, col 0, score 1)
- [Unique Info Dump Index — L150](unique-info-dump-index.md#^ref-30ec3ba6-150-0) (line 150, col 0, score 1)
- [DuckDuckGoSearchPipeline — L30](duckduckgosearchpipeline.md#^ref-e979c50f-30-0) (line 30, col 0, score 1)
- [OpenAPI Validation Report — L47](openapi-validation-report.md#^ref-5c152b08-47-0) (line 47, col 0, score 1)
- [Optimizing Command Limitations in System Design — L82](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-82-0) (line 82, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L148](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-148-0) (line 148, col 0, score 1)
- [Promethean Chat Activity Report — L60](promethean-chat-activity-report.md#^ref-18344cf9-60-0) (line 60, col 0, score 1)
- [Promethean Data Sync Protocol — L39](promethean-data-sync-protocol.md#^ref-9fab9e76-39-0) (line 39, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L168](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-168-0) (line 168, col 0, score 1)
- [Promethean Documentation Update — L40](promethean-documentation-update.md#^ref-c0392040-40-0) (line 40, col 0, score 1)
- [Window Management — L84](chunks/window-management.md#^ref-9e8ae388-84-0) (line 84, col 0, score 1)
- [Creative Moments — L60](creative-moments.md#^ref-10d98225-60-0) (line 60, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L128](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-128-0) (line 128, col 0, score 1)
- [DuckDuckGoSearchPipeline — L61](duckduckgosearchpipeline.md#^ref-e979c50f-61-0) (line 61, col 0, score 1)
- [Duck's Attractor States — L163](ducks-attractor-states.md#^ref-13951643-163-0) (line 163, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L124](ducks-self-referential-perceptual-loop.md#^ref-71726f04-124-0) (line 124, col 0, score 1)
- [Dynamic Context Model for Web Components — L481](dynamic-context-model-for-web-components.md#^ref-f7702bf8-481-0) (line 481, col 0, score 1)
- [Eidolon Field Abstract Model — L260](eidolon-field-abstract-model.md#^ref-5e8b2388-260-0) (line 260, col 0, score 1)
- [eidolon-node-lifecycle — L100](eidolon-node-lifecycle.md#^ref-938eca9c-100-0) (line 100, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L356](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-356-0) (line 356, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L575](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-575-0) (line 575, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L535](performance-optimized-polyglot-bridge.md#^ref-f5579967-535-0) (line 535, col 0, score 1)
- [Pipeline Enhancements — L37](pipeline-enhancements.md#^ref-e2135d9f-37-0) (line 37, col 0, score 1)
- [plan-update-confirmation — L1089](plan-update-confirmation.md#^ref-b22d79c6-1089-0) (line 1089, col 0, score 1)
- [polyglot-repl-interface-layer — L260](polyglot-repl-interface-layer.md#^ref-9c79206d-260-0) (line 260, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L183](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-183-0) (line 183, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L158](promethean-copilot-intent-engine.md#^ref-ae24a280-158-0) (line 158, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L216](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-216-0) (line 216, col 0, score 1)
- [Promethean Documentation Update — L60](promethean-documentation-update.txt#^ref-0b872af2-60-0) (line 60, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L149](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-149-0) (line 149, col 0, score 1)
- [ripple-propagation-demo — L197](ripple-propagation-demo.md#^ref-8430617b-197-0) (line 197, col 0, score 1)
- [schema-evolution-workflow — L655](schema-evolution-workflow.md#^ref-d8059b6a-655-0) (line 655, col 0, score 1)
- [homeostasis-decay-formulas — L252](homeostasis-decay-formulas.md#^ref-37b5d236-252-0) (line 252, col 0, score 1)
- [i3-bluetooth-setup — L208](i3-bluetooth-setup.md#^ref-5e408692-208-0) (line 208, col 0, score 1)
- [Ice Box Reorganization — L154](ice-box-reorganization.md#^ref-291c7d91-154-0) (line 154, col 0, score 1)
- [komorebi-group-window-hack — L310](komorebi-group-window-hack.md#^ref-dd89372d-310-0) (line 310, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L257](layer1survivabilityenvelope.md#^ref-64a9f9f9-257-0) (line 257, col 0, score 1)
- [Mathematical Samplers — L89](mathematical-samplers.md#^ref-86a691ec-89-0) (line 89, col 0, score 1)
- [Mathematics Sampler — L94](mathematics-sampler.md#^ref-b5e0183e-94-0) (line 94, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L399](migrate-to-provider-tenant-architecture.md#^ref-54382370-399-0) (line 399, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L66](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-66-0) (line 66, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L124](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-124-0) (line 124, col 0, score 1)
- [Pure TypeScript Search Microservice — L675](pure-typescript-search-microservice.md#^ref-d17d3a96-675-0) (line 675, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L123](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-123-0) (line 123, col 0, score 1)
- [DuckDuckGoSearchPipeline — L65](duckduckgosearchpipeline.md#^ref-e979c50f-65-0) (line 65, col 0, score 1)
- [Dynamic Context Model for Web Components — L485](dynamic-context-model-for-web-components.md#^ref-f7702bf8-485-0) (line 485, col 0, score 1)
- [Eidolon Field Abstract Model — L257](eidolon-field-abstract-model.md#^ref-5e8b2388-257-0) (line 257, col 0, score 1)
- [eidolon-field-math-foundations — L221](eidolon-field-math-foundations.md#^ref-008f2ac0-221-0) (line 221, col 0, score 1)
- [eidolon-node-lifecycle — L99](eidolon-node-lifecycle.md#^ref-938eca9c-99-0) (line 99, col 0, score 1)
- [Factorio AI with External Agents — L227](factorio-ai-with-external-agents.md#^ref-a4d90289-227-0) (line 227, col 0, score 1)
- [field-dynamics-math-blocks — L212](field-dynamics-math-blocks.md#^ref-7cfc230d-212-0) (line 212, col 0, score 1)
- [field-interaction-equations — L226](field-interaction-equations.md#^ref-b09141b7-226-0) (line 226, col 0, score 1)
- [api-gateway-versioning — L287](api-gateway-versioning.md#^ref-0580dcd3-287-0) (line 287, col 0, score 1)
- [balanced-bst — L302](balanced-bst.md#^ref-d3e7db72-302-0) (line 302, col 0, score 1)
- [Board Automation Improvements — L15](board-automation-improvements.md#^ref-ac60a1d6-15-0) (line 15, col 0, score 1)
- [Board Walk – 2025-08-11 — L137](board-walk-2025-08-11.md#^ref-7aa1eb92-137-0) (line 137, col 0, score 1)
- [Pure TypeScript Search Microservice — L593](pure-typescript-search-microservice.md#^ref-d17d3a96-593-0) (line 593, col 0, score 1)
- [schema-evolution-workflow — L561](schema-evolution-workflow.md#^ref-d8059b6a-561-0) (line 561, col 0, score 1)
- [Stateful Partitions and Rebalancing — L607](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-607-0) (line 607, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L548](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-548-0) (line 548, col 0, score 1)
- [Promethean Chat Activity Report — L50](promethean-chat-activity-report.md#^ref-18344cf9-50-0) (line 50, col 0, score 1)
- [Promethean Data Sync Protocol — L28](promethean-data-sync-protocol.md#^ref-9fab9e76-28-0) (line 28, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L232](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-232-0) (line 232, col 0, score 1)
- [Promethean Documentation Update — L29](promethean-documentation-update.md#^ref-c0392040-29-0) (line 29, col 0, score 1)
- [homeostasis-decay-formulas — L260](homeostasis-decay-formulas.md#^ref-37b5d236-260-0) (line 260, col 0, score 1)
- [Mathematical Samplers — L99](mathematical-samplers.md#^ref-86a691ec-99-0) (line 99, col 0, score 1)
- [Mathematics Sampler — L104](mathematics-sampler.md#^ref-b5e0183e-104-0) (line 104, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L404](migrate-to-provider-tenant-architecture.md#^ref-54382370-404-0) (line 404, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L228](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-228-0) (line 228, col 0, score 1)
- [Promethean Documentation Update — L69](promethean-documentation-update.md#^ref-c0392040-69-0) (line 69, col 0, score 1)
- [Prometheus Observability Stack — L613](prometheus-observability-stack.md#^ref-e90b5a16-613-0) (line 613, col 0, score 1)
- [Prompt_Folder_Bootstrap — L298](prompt-folder-bootstrap.md#^ref-bd4f0976-298-0) (line 298, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L334](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-334-0) (line 334, col 0, score 1)
- [Pure TypeScript Search Microservice — L684](pure-typescript-search-microservice.md#^ref-d17d3a96-684-0) (line 684, col 0, score 1)
- [Reawakening Duck — L222](reawakening-duck.md#^ref-59b5670f-222-0) (line 222, col 0, score 1)
- [Redirecting Standard Error — L91](redirecting-standard-error.md#^ref-b3555ede-91-0) (line 91, col 0, score 1)
- [ripple-propagation-demo — L208](ripple-propagation-demo.md#^ref-8430617b-208-0) (line 208, col 0, score 1)
- [heartbeat-fragment-demo — L219](heartbeat-fragment-demo.md#^ref-dd00677a-219-0) (line 219, col 0, score 1)
- [homeostasis-decay-formulas — L258](homeostasis-decay-formulas.md#^ref-37b5d236-258-0) (line 258, col 0, score 1)
- [Ice Box Reorganization — L161](ice-box-reorganization.md#^ref-291c7d91-161-0) (line 161, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L267](layer1survivabilityenvelope.md#^ref-64a9f9f9-267-0) (line 267, col 0, score 1)
- [Mathematics Sampler — L100](mathematics-sampler.md#^ref-b5e0183e-100-0) (line 100, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L388](migrate-to-provider-tenant-architecture.md#^ref-54382370-388-0) (line 388, col 0, score 1)
- [Mindful Prioritization — L69](mindful-prioritization.md#^ref-40185d05-69-0) (line 69, col 0, score 1)
- [MindfulRobotIntegration — L67](mindfulrobotintegration.md#^ref-5f65dfa5-67-0) (line 67, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L234](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-234-0) (line 234, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L129](model-upgrade-calm-down-guide.md#^ref-db74343f-129-0) (line 129, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L74](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-74-0) (line 74, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L130](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-130-0) (line 130, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L131](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-131-0) (line 131, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L161](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-161-0) (line 161, col 0, score 1)
- [Promethean Infrastructure Setup — L737](promethean-infrastructure-setup.md#^ref-6deed6ac-737-0) (line 737, col 0, score 1)
- [Promethean Notes — L74](promethean-notes.md#^ref-1c4046b5-74-0) (line 74, col 0, score 1)
- [Promethean Pipelines — L147](promethean-pipelines.md#^ref-8b8e6103-147-0) (line 147, col 0, score 1)
- [promethean-requirements — L77](promethean-requirements.md#^ref-95205cd3-77-0) (line 77, col 0, score 1)
- [Promethean State Format — L107](promethean-state-format.md#^ref-23df6ddb-107-0) (line 107, col 0, score 1)
- [Promethean Workflow Optimization — L74](promethean-workflow-optimization.md#^ref-d614d983-74-0) (line 74, col 0, score 1)
- [Prometheus Observability Stack — L604](prometheus-observability-stack.md#^ref-e90b5a16-604-0) (line 604, col 0, score 1)
- [Prompt_Folder_Bootstrap — L232](prompt-folder-bootstrap.md#^ref-bd4f0976-232-0) (line 232, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L215](protocol-0-the-contradiction-engine.md#^ref-9a93a756-215-0) (line 215, col 0, score 1)
- [eidolon-node-lifecycle — L57](eidolon-node-lifecycle.md#^ref-938eca9c-57-0) (line 57, col 0, score 1)
- [i3-bluetooth-setup — L124](i3-bluetooth-setup.md#^ref-5e408692-124-0) (line 124, col 0, score 1)
- [Ice Box Reorganization — L81](ice-box-reorganization.md#^ref-291c7d91-81-0) (line 81, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L183](layer1survivabilityenvelope.md#^ref-64a9f9f9-183-0) (line 183, col 0, score 1)
- [DSL — L69](chunks/dsl.md#^ref-e87bc036-69-0) (line 69, col 0, score 1)
- [Operations — L36](chunks/operations.md#^ref-f1add613-36-0) (line 36, col 0, score 1)
- [Simulation Demo — L46](chunks/simulation-demo.md#^ref-557309a3-46-0) (line 46, col 0, score 1)
- [Tooling — L40](chunks/tooling.md#^ref-6cb4943e-40-0) (line 40, col 0, score 1)
- [Window Management — L53](chunks/window-management.md#^ref-9e8ae388-53-0) (line 53, col 0, score 1)
- [Creative Moments — L33](creative-moments.md#^ref-10d98225-33-0) (line 33, col 0, score 1)
- [Prometheus Observability Stack — L519](prometheus-observability-stack.md#^ref-e90b5a16-519-0) (line 519, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L236](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-236-0) (line 236, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L124](model-upgrade-calm-down-guide.md#^ref-db74343f-124-0) (line 124, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L75](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-75-0) (line 75, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L131](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-131-0) (line 131, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L132](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-132-0) (line 132, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L164](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-164-0) (line 164, col 0, score 1)
- [Obsidian Task Generation — L74](obsidian-task-generation.md#^ref-9b694a91-74-0) (line 74, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L205](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-205-0) (line 205, col 0, score 1)
- [polyglot-repl-interface-layer — L265](polyglot-repl-interface-layer.md#^ref-9c79206d-265-0) (line 265, col 0, score 1)
- [Stateful Partitions and Rebalancing — L594](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-594-0) (line 594, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L282](chroma-toolkit-consolidation-plan.md#^ref-5020e892-282-0) (line 282, col 0, score 1)
- [eidolon-field-math-foundations — L241](eidolon-field-math-foundations.md#^ref-008f2ac0-241-0) (line 241, col 0, score 1)
- [eidolon-node-lifecycle — L128](eidolon-node-lifecycle.md#^ref-938eca9c-128-0) (line 128, col 0, score 1)
- [Factorio AI with External Agents — L231](factorio-ai-with-external-agents.md#^ref-a4d90289-231-0) (line 231, col 0, score 1)
- [field-dynamics-math-blocks — L250](field-dynamics-math-blocks.md#^ref-7cfc230d-250-0) (line 250, col 0, score 1)
- [graph-ds — L485](graph-ds.md#^ref-6620e2f2-485-0) (line 485, col 0, score 1)
- [heartbeat-fragment-demo — L221](heartbeat-fragment-demo.md#^ref-dd00677a-221-0) (line 221, col 0, score 1)
- [OpenAPI Validation Report — L93](openapi-validation-report.md#^ref-5c152b08-93-0) (line 93, col 0, score 1)
- [Optimizing Command Limitations in System Design — L128](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-128-0) (line 128, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L364](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-364-0) (line 364, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L548](performance-optimized-polyglot-bridge.md#^ref-f5579967-548-0) (line 548, col 0, score 1)
- [Pipeline Enhancements — L43](pipeline-enhancements.md#^ref-e2135d9f-43-0) (line 43, col 0, score 1)
- [polyglot-repl-interface-layer — L266](polyglot-repl-interface-layer.md#^ref-9c79206d-266-0) (line 266, col 0, score 1)
- [Promethean Data Sync Protocol — L67](promethean-data-sync-protocol.md#^ref-9fab9e76-67-0) (line 67, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L131](ducks-self-referential-perceptual-loop.md#^ref-71726f04-131-0) (line 131, col 0, score 1)
- [eidolon-field-math-foundations — L225](eidolon-field-math-foundations.md#^ref-008f2ac0-225-0) (line 225, col 0, score 1)
- [Factorio AI with External Agents — L237](factorio-ai-with-external-agents.md#^ref-a4d90289-237-0) (line 237, col 0, score 1)
- [field-dynamics-math-blocks — L223](field-dynamics-math-blocks.md#^ref-7cfc230d-223-0) (line 223, col 0, score 1)
- [field-interaction-equations — L233](field-interaction-equations.md#^ref-b09141b7-233-0) (line 233, col 0, score 1)
- [Fnord Tracer Protocol — L339](fnord-tracer-protocol.md#^ref-fc21f824-339-0) (line 339, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L193](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-193-0) (line 193, col 0, score 1)
- [graph-ds — L476](graph-ds.md#^ref-6620e2f2-476-0) (line 476, col 0, score 1)
- [i3-bluetooth-setup — L209](i3-bluetooth-setup.md#^ref-5e408692-209-0) (line 209, col 0, score 1)
- [Ice Box Reorganization — L133](ice-box-reorganization.md#^ref-291c7d91-133-0) (line 133, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L138](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-138-0) (line 138, col 0, score 1)
- [DuckDuckGoSearchPipeline — L76](duckduckgosearchpipeline.md#^ref-e979c50f-76-0) (line 76, col 0, score 1)
- [Dynamic Context Model for Web Components — L518](dynamic-context-model-for-web-components.md#^ref-f7702bf8-518-0) (line 518, col 0, score 1)
- [Eidolon Field Abstract Model — L290](eidolon-field-abstract-model.md#^ref-5e8b2388-290-0) (line 290, col 0, score 1)
- [eidolon-node-lifecycle — L130](eidolon-node-lifecycle.md#^ref-938eca9c-130-0) (line 130, col 0, score 1)
- [Factorio AI with External Agents — L239](factorio-ai-with-external-agents.md#^ref-a4d90289-239-0) (line 239, col 0, score 1)
- [field-dynamics-math-blocks — L244](field-dynamics-math-blocks.md#^ref-7cfc230d-244-0) (line 244, col 0, score 1)
- [field-interaction-equations — L264](field-interaction-equations.md#^ref-b09141b7-264-0) (line 264, col 0, score 1)
- [field-node-diagram-outline — L216](field-node-diagram-outline.md#^ref-1f32c94a-216-0) (line 216, col 0, score 1)
- [field-node-diagram-set — L242](field-node-diagram-set.md#^ref-22b989d5-242-0) (line 242, col 0, score 1)
- [field-node-diagram-visualizations — L190](field-node-diagram-visualizations.md#^ref-e9b27b06-190-0) (line 190, col 0, score 1)
- [Fnord Tracer Protocol — L344](fnord-tracer-protocol.md#^ref-fc21f824-344-0) (line 344, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L196](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-196-0) (line 196, col 0, score 1)
- [Promethean Notes — L96](promethean-notes.md#^ref-1c4046b5-96-0) (line 96, col 0, score 1)
- [Promethean Pipelines — L215](promethean-pipelines.md#^ref-8b8e6103-215-0) (line 215, col 0, score 1)
- [Promethean State Format — L199](promethean-state-format.md#^ref-23df6ddb-199-0) (line 199, col 0, score 1)
- [Prompt_Folder_Bootstrap — L280](prompt-folder-bootstrap.md#^ref-bd4f0976-280-0) (line 280, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L291](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-291-0) (line 291, col 0, score 1)
- [Reawakening Duck — L208](reawakening-duck.md#^ref-59b5670f-208-0) (line 208, col 0, score 1)
- [ripple-propagation-demo — L192](ripple-propagation-demo.md#^ref-8430617b-192-0) (line 192, col 0, score 1)
- [schema-evolution-workflow — L620](schema-evolution-workflow.md#^ref-d8059b6a-620-0) (line 620, col 0, score 1)
- [sibilant-macro-targets — L244](sibilant-macro-targets.md#^ref-c5c9a5c6-244-0) (line 244, col 0, score 1)
- [graph-ds — L443](graph-ds.md#^ref-6620e2f2-443-0) (line 443, col 0, score 1)
- [i3-bluetooth-setup — L172](i3-bluetooth-setup.md#^ref-5e408692-172-0) (line 172, col 0, score 1)
- [Ice Box Reorganization — L166](ice-box-reorganization.md#^ref-291c7d91-166-0) (line 166, col 0, score 1)
- [komorebi-group-window-hack — L279](komorebi-group-window-hack.md#^ref-dd89372d-279-0) (line 279, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L226](layer1survivabilityenvelope.md#^ref-64a9f9f9-226-0) (line 226, col 0, score 1)
- [Mathematical Samplers — L106](mathematical-samplers.md#^ref-86a691ec-106-0) (line 106, col 0, score 1)
- [Mathematics Sampler — L110](mathematics-sampler.md#^ref-b5e0183e-110-0) (line 110, col 0, score 1)
- [Pure TypeScript Search Microservice — L649](pure-typescript-search-microservice.md#^ref-d17d3a96-649-0) (line 649, col 0, score 1)
- [ripple-propagation-demo — L213](ripple-propagation-demo.md#^ref-8430617b-213-0) (line 213, col 0, score 1)
- [schema-evolution-workflow — L668](schema-evolution-workflow.md#^ref-d8059b6a-668-0) (line 668, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L150](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-150-0) (line 150, col 0, score 1)
- [field-dynamics-math-blocks — L260](field-dynamics-math-blocks.md#^ref-7cfc230d-260-0) (line 260, col 0, score 1)
- [komorebi-group-window-hack — L330](komorebi-group-window-hack.md#^ref-dd89372d-330-0) (line 330, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L307](layer1survivabilityenvelope.md#^ref-64a9f9f9-307-0) (line 307, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L590](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-590-0) (line 590, col 0, score 1)
- [plan-update-confirmation — L1138](plan-update-confirmation.md#^ref-b22d79c6-1138-0) (line 1138, col 0, score 1)
- [Pure TypeScript Search Microservice — L691](pure-typescript-search-microservice.md#^ref-d17d3a96-691-0) (line 691, col 0, score 1)
- [windows-tiling-with-autohotkey — L245](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-245-0) (line 245, col 0, score 1)
- [Promethean Dev Workflow Update — L167](promethean-dev-workflow-update.md#^ref-03a5578f-167-0) (line 167, col 0, score 1)
- [Promethean Documentation Update — L101](promethean-documentation-update.txt#^ref-0b872af2-101-0) (line 101, col 0, score 1)
- [Promethean Infrastructure Setup — L766](promethean-infrastructure-setup.md#^ref-6deed6ac-766-0) (line 766, col 0, score 1)
- [Promethean Notes — L111](promethean-notes.md#^ref-1c4046b5-111-0) (line 111, col 0, score 1)
- [Promethean Pipelines — L158](promethean-pipelines.md#^ref-8b8e6103-158-0) (line 158, col 0, score 1)
- [Promethean State Format — L177](promethean-state-format.md#^ref-23df6ddb-177-0) (line 177, col 0, score 1)
- [Prompt_Folder_Bootstrap — L310](prompt-folder-bootstrap.md#^ref-bd4f0976-310-0) (line 310, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L370](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-370-0) (line 370, col 0, score 1)
- [Dynamic Context Model for Web Components — L545](dynamic-context-model-for-web-components.md#^ref-f7702bf8-545-0) (line 545, col 0, score 1)
- [field-dynamics-math-blocks — L262](field-dynamics-math-blocks.md#^ref-7cfc230d-262-0) (line 262, col 0, score 1)
- [graph-ds — L491](graph-ds.md#^ref-6620e2f2-491-0) (line 491, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L309](layer1survivabilityenvelope.md#^ref-64a9f9f9-309-0) (line 309, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L379](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-379-0) (line 379, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L589](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-589-0) (line 589, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L566](performance-optimized-polyglot-bridge.md#^ref-f5579967-566-0) (line 566, col 0, score 1)
- [plan-update-confirmation — L1134](plan-update-confirmation.md#^ref-b22d79c6-1134-0) (line 1134, col 0, score 1)
- [Promethean Pipelines — L180](promethean-pipelines.md#^ref-8b8e6103-180-0) (line 180, col 0, score 1)
- [Promethean State Format — L149](promethean-state-format.md#^ref-23df6ddb-149-0) (line 149, col 0, score 1)
- [Prompt_Folder_Bootstrap — L274](prompt-folder-bootstrap.md#^ref-bd4f0976-274-0) (line 274, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L205](protocol-0-the-contradiction-engine.md#^ref-9a93a756-205-0) (line 205, col 0, score 1)
- [Reawakening Duck — L190](reawakening-duck.md#^ref-59b5670f-190-0) (line 190, col 0, score 1)
- [ripple-propagation-demo — L185](ripple-propagation-demo.md#^ref-8430617b-185-0) (line 185, col 0, score 1)
- [schema-evolution-workflow — L618](schema-evolution-workflow.md#^ref-d8059b6a-618-0) (line 618, col 0, score 1)
- [sibilant-macro-targets — L223](sibilant-macro-targets.md#^ref-c5c9a5c6-223-0) (line 223, col 0, score 1)
- [Ice Box Reorganization — L146](ice-box-reorganization.md#^ref-291c7d91-146-0) (line 146, col 0, score 1)
- [komorebi-group-window-hack — L289](komorebi-group-window-hack.md#^ref-dd89372d-289-0) (line 289, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L281](layer1survivabilityenvelope.md#^ref-64a9f9f9-281-0) (line 281, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L265](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-265-0) (line 265, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L160](model-upgrade-calm-down-guide.md#^ref-db74343f-160-0) (line 160, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L195](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-195-0) (line 195, col 0, score 1)
- [Optimizing Command Limitations in System Design — L110](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-110-0) (line 110, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L343](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-343-0) (line 343, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L572](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-572-0) (line 572, col 0, score 1)
- [Eidolon Field Abstract Model — L320](eidolon-field-abstract-model.md#^ref-5e8b2388-320-0) (line 320, col 0, score 1)
- [eidolon-field-math-foundations — L183](eidolon-field-math-foundations.md#^ref-008f2ac0-183-0) (line 183, col 0, score 1)
- [Factorio AI with External Agents — L250](factorio-ai-with-external-agents.md#^ref-a4d90289-250-0) (line 250, col 0, score 1)
- [field-dynamics-math-blocks — L177](field-dynamics-math-blocks.md#^ref-7cfc230d-177-0) (line 177, col 0, score 1)
- [field-interaction-equations — L191](field-interaction-equations.md#^ref-b09141b7-191-0) (line 191, col 0, score 1)
- [field-node-diagram-outline — L149](field-node-diagram-outline.md#^ref-1f32c94a-149-0) (line 149, col 0, score 1)
- [Fnord Tracer Protocol — L366](fnord-tracer-protocol.md#^ref-fc21f824-366-0) (line 366, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L220](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-220-0) (line 220, col 0, score 1)
- [graph-ds — L406](graph-ds.md#^ref-6620e2f2-406-0) (line 406, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L218](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-218-0) (line 218, col 0, score 1)
- [Ice Box Reorganization — L167](ice-box-reorganization.md#^ref-291c7d91-167-0) (line 167, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L264](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-264-0) (line 264, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L144](model-upgrade-calm-down-guide.md#^ref-db74343f-144-0) (line 144, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L91](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-91-0) (line 91, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L144](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-144-0) (line 144, col 0, score 1)
- [Obsidian Task Generation — L93](obsidian-task-generation.md#^ref-9b694a91-93-0) (line 93, col 0, score 1)
- [OpenAPI Validation Report — L108](openapi-validation-report.md#^ref-5c152b08-108-0) (line 108, col 0, score 1)
- [Optimizing Command Limitations in System Design — L136](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-136-0) (line 136, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L530](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-530-0) (line 530, col 0, score 1)
- [plan-update-confirmation — L1101](plan-update-confirmation.md#^ref-b22d79c6-1101-0) (line 1101, col 0, score 1)
- [Promethean Chat Activity Report — L151](promethean-chat-activity-report.md#^ref-18344cf9-151-0) (line 151, col 0, score 1)
- [Promethean Pipelines — L105](promethean-pipelines.md#^ref-8b8e6103-105-0) (line 105, col 0, score 1)
- [Promethean State Format — L150](promethean-state-format.md#^ref-23df6ddb-150-0) (line 150, col 0, score 1)
- [Prompt_Folder_Bootstrap — L258](prompt-folder-bootstrap.md#^ref-bd4f0976-258-0) (line 258, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L164](protocol-0-the-contradiction-engine.md#^ref-9a93a756-164-0) (line 164, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L351](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-351-0) (line 351, col 0, score 1)
- [ripple-propagation-demo — L201](ripple-propagation-demo.md#^ref-8430617b-201-0) (line 201, col 0, score 1)
- [schema-evolution-workflow — L609](schema-evolution-workflow.md#^ref-d8059b6a-609-0) (line 609, col 0, score 1)
- [Self-Agency in AI Interaction — L133](self-agency-in-ai-interaction.md#^ref-49a9a860-133-0) (line 133, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L93](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-93-0) (line 93, col 0, score 1)
- [Window Management — L81](chunks/window-management.md#^ref-9e8ae388-81-0) (line 81, col 0, score 1)
- [field-interaction-equations — L228](field-interaction-equations.md#^ref-b09141b7-228-0) (line 228, col 0, score 1)
- [field-node-diagram-outline — L183](field-node-diagram-outline.md#^ref-1f32c94a-183-0) (line 183, col 0, score 1)
- [field-node-diagram-set — L213](field-node-diagram-set.md#^ref-22b989d5-213-0) (line 213, col 0, score 1)
- [field-node-diagram-visualizations — L160](field-node-diagram-visualizations.md#^ref-e9b27b06-160-0) (line 160, col 0, score 1)
- [Fnord Tracer Protocol — L371](fnord-tracer-protocol.md#^ref-fc21f824-371-0) (line 371, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L206](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-206-0) (line 206, col 0, score 1)
- [graph-ds — L440](graph-ds.md#^ref-6620e2f2-440-0) (line 440, col 0, score 1)
- [heartbeat-fragment-demo — L189](heartbeat-fragment-demo.md#^ref-dd00677a-189-0) (line 189, col 0, score 1)
- [homeostasis-decay-formulas — L229](homeostasis-decay-formulas.md#^ref-37b5d236-229-0) (line 229, col 0, score 1)
- [Simulation Demo — L90](chunks/simulation-demo.md#^ref-557309a3-90-0) (line 90, col 0, score 1)
- [Window Management — L91](chunks/window-management.md#^ref-9e8ae388-91-0) (line 91, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L107](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-107-0) (line 107, col 0, score 1)
- [Docops Feature Updates — L49](docops-feature-updates.md#^ref-2792d448-49-0) (line 49, col 0, score 1)
- [Duck's Attractor States — L148](ducks-attractor-states.md#^ref-13951643-148-0) (line 148, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L103](ducks-self-referential-perceptual-loop.md#^ref-71726f04-103-0) (line 103, col 0, score 1)
- [Dynamic Context Model for Web Components — L495](dynamic-context-model-for-web-components.md#^ref-f7702bf8-495-0) (line 495, col 0, score 1)
- [Eidolon Field Abstract Model — L264](eidolon-field-abstract-model.md#^ref-5e8b2388-264-0) (line 264, col 0, score 1)
- [eidolon-node-lifecycle — L120](eidolon-node-lifecycle.md#^ref-938eca9c-120-0) (line 120, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L204](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-204-0) (line 204, col 0, score 1)
- [graph-ds — L427](graph-ds.md#^ref-6620e2f2-427-0) (line 427, col 0, score 1)
- [heartbeat-fragment-demo — L179](heartbeat-fragment-demo.md#^ref-dd00677a-179-0) (line 179, col 0, score 1)
- [homeostasis-decay-formulas — L200](homeostasis-decay-formulas.md#^ref-37b5d236-200-0) (line 200, col 0, score 1)
- [i3-bluetooth-setup — L201](i3-bluetooth-setup.md#^ref-5e408692-201-0) (line 201, col 0, score 1)
- [Ice Box Reorganization — L120](ice-box-reorganization.md#^ref-291c7d91-120-0) (line 120, col 0, score 1)
- [komorebi-group-window-hack — L262](komorebi-group-window-hack.md#^ref-dd89372d-262-0) (line 262, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L201](layer1survivabilityenvelope.md#^ref-64a9f9f9-201-0) (line 201, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L184](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-184-0) (line 184, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L189](model-upgrade-calm-down-guide.md#^ref-db74343f-189-0) (line 189, col 0, score 1)
- [Factorio AI with External Agents — L267](factorio-ai-with-external-agents.md#^ref-a4d90289-267-0) (line 267, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L282](layer1survivabilityenvelope.md#^ref-64a9f9f9-282-0) (line 282, col 0, score 1)
- [MindfulRobotIntegration — L78](mindfulrobotintegration.md#^ref-5f65dfa5-78-0) (line 78, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L254](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-254-0) (line 254, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L163](model-upgrade-calm-down-guide.md#^ref-db74343f-163-0) (line 163, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L381](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-381-0) (line 381, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L571](performance-optimized-polyglot-bridge.md#^ref-f5579967-571-0) (line 571, col 0, score 1)
- [plan-update-confirmation — L1129](plan-update-confirmation.md#^ref-b22d79c6-1129-0) (line 1129, col 0, score 1)
- [polyglot-repl-interface-layer — L275](polyglot-repl-interface-layer.md#^ref-9c79206d-275-0) (line 275, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L194](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-194-0) (line 194, col 0, score 1)
- [Promethean Dev Workflow Update — L174](promethean-dev-workflow-update.md#^ref-03a5578f-174-0) (line 174, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L239](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-239-0) (line 239, col 0, score 1)
- [schema-evolution-workflow — L566](schema-evolution-workflow.md#^ref-d8059b6a-566-0) (line 566, col 0, score 1)
- [Stateful Partitions and Rebalancing — L602](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-602-0) (line 602, col 0, score 1)
- [Pure TypeScript Search Microservice — L641](pure-typescript-search-microservice.md#^ref-d17d3a96-641-0) (line 641, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L656](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-656-0) (line 656, col 0, score 1)
- [Promethean Pipelines — L505](promethean-pipelines.md#^ref-8b8e6103-505-0) (line 505, col 0, score 0.9)
- [Provider-Agnostic Chat Panel Implementation — L435](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-435-0) (line 435, col 0, score 0.9)
- [Fnord Tracer Protocol — L684](fnord-tracer-protocol.md#^ref-fc21f824-684-0) (line 684, col 0, score 0.9)
- [Migrate to Provider-Tenant Architecture — L603](migrate-to-provider-tenant-architecture.md#^ref-54382370-603-0) (line 603, col 0, score 0.9)
- [Factorio AI with External Agents — L347](factorio-ai-with-external-agents.md#^ref-a4d90289-347-0) (line 347, col 0, score 0.9)
- [Fnord Tracer Protocol — L520](fnord-tracer-protocol.md#^ref-fc21f824-520-0) (line 520, col 0, score 0.9)
- [Migrate to Provider-Tenant Architecture — L755](migrate-to-provider-tenant-architecture.md#^ref-54382370-755-0) (line 755, col 0, score 0.9)
- [Factorio AI with External Agents — L277](factorio-ai-with-external-agents.md#^ref-a4d90289-277-0) (line 277, col 0, score 1)
- [field-node-diagram-set — L250](field-node-diagram-set.md#^ref-22b989d5-250-0) (line 250, col 0, score 1)
- [Fnord Tracer Protocol — L364](fnord-tracer-protocol.md#^ref-fc21f824-364-0) (line 364, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L222](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-222-0) (line 222, col 0, score 1)
- [graph-ds — L504](graph-ds.md#^ref-6620e2f2-504-0) (line 504, col 0, score 1)
- [homeostasis-decay-formulas — L281](homeostasis-decay-formulas.md#^ref-37b5d236-281-0) (line 281, col 0, score 1)
- [i3-bluetooth-setup — L222](i3-bluetooth-setup.md#^ref-5e408692-222-0) (line 222, col 0, score 1)
- [Mathematical Samplers — L119](mathematical-samplers.md#^ref-86a691ec-119-0) (line 119, col 0, score 1)
- [Mathematics Sampler — L121](mathematics-sampler.md#^ref-b5e0183e-121-0) (line 121, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L276](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-276-0) (line 276, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L176](model-upgrade-calm-down-guide.md#^ref-db74343f-176-0) (line 176, col 0, score 1)
- [Ice Box Reorganization — L193](ice-box-reorganization.md#^ref-291c7d91-193-0) (line 193, col 0, score 1)
- [komorebi-group-window-hack — L322](komorebi-group-window-hack.md#^ref-dd89372d-322-0) (line 322, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L293](layer1survivabilityenvelope.md#^ref-64a9f9f9-293-0) (line 293, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L173](model-upgrade-calm-down-guide.md#^ref-db74343f-173-0) (line 173, col 0, score 1)
- [Obsidian Task Generation — L91](obsidian-task-generation.md#^ref-9b694a91-91-0) (line 91, col 0, score 1)
- [OpenAPI Validation Report — L103](openapi-validation-report.md#^ref-5c152b08-103-0) (line 103, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L595](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-595-0) (line 595, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L555](performance-optimized-polyglot-bridge.md#^ref-f5579967-555-0) (line 555, col 0, score 1)
- [plan-update-confirmation — L1102](plan-update-confirmation.md#^ref-b22d79c6-1102-0) (line 1102, col 0, score 1)
- [Promethean Pipelines — L170](promethean-pipelines.md#^ref-8b8e6103-170-0) (line 170, col 0, score 1)
- [Promethean Workflow Optimization — L88](promethean-workflow-optimization.md#^ref-d614d983-88-0) (line 88, col 0, score 1)
- [Prometheus Observability Stack — L609](prometheus-observability-stack.md#^ref-e90b5a16-609-0) (line 609, col 0, score 1)
- [Prompt_Folder_Bootstrap — L313](prompt-folder-bootstrap.md#^ref-bd4f0976-313-0) (line 313, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L226](protocol-0-the-contradiction-engine.md#^ref-9a93a756-226-0) (line 226, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L369](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-369-0) (line 369, col 0, score 1)
- [Pure TypeScript Search Microservice — L689](pure-typescript-search-microservice.md#^ref-d17d3a96-689-0) (line 689, col 0, score 1)
- [Reawakening Duck — L253](reawakening-duck.md#^ref-59b5670f-253-0) (line 253, col 0, score 1)
- [Self-Agency in AI Interaction — L127](self-agency-in-ai-interaction.md#^ref-49a9a860-127-0) (line 127, col 0, score 1)
- [Promethean Workflow Optimization — L95](promethean-workflow-optimization.md#^ref-d614d983-95-0) (line 95, col 0, score 1)
- [Prometheus Observability Stack — L621](prometheus-observability-stack.md#^ref-e90b5a16-621-0) (line 621, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L238](protocol-0-the-contradiction-engine.md#^ref-9a93a756-238-0) (line 238, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L344](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-344-0) (line 344, col 0, score 1)
- [Pure TypeScript Search Microservice — L640](pure-typescript-search-microservice.md#^ref-d17d3a96-640-0) (line 640, col 0, score 1)
- [Reawakening Duck — L232](reawakening-duck.md#^ref-59b5670f-232-0) (line 232, col 0, score 1)
- [Redirecting Standard Error — L102](redirecting-standard-error.md#^ref-b3555ede-102-0) (line 102, col 0, score 1)
- [ripple-propagation-demo — L180](ripple-propagation-demo.md#^ref-8430617b-180-0) (line 180, col 0, score 1)
- [Self-Agency in AI Interaction — L120](self-agency-in-ai-interaction.md#^ref-49a9a860-120-0) (line 120, col 0, score 1)
- [Promethean Infrastructure Setup — L809](promethean-infrastructure-setup.md#^ref-6deed6ac-809-0) (line 809, col 0, score 1)
- [Promethean Pipelines — L202](promethean-pipelines.md#^ref-8b8e6103-202-0) (line 202, col 0, score 1)
- [Promethean State Format — L171](promethean-state-format.md#^ref-23df6ddb-171-0) (line 171, col 0, score 1)
- [Promethean Workflow Optimization — L87](promethean-workflow-optimization.md#^ref-d614d983-87-0) (line 87, col 0, score 1)
- [Prometheus Observability Stack — L617](prometheus-observability-stack.md#^ref-e90b5a16-617-0) (line 617, col 0, score 1)
- [Prompt_Folder_Bootstrap — L315](prompt-folder-bootstrap.md#^ref-bd4f0976-315-0) (line 315, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L338](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-338-0) (line 338, col 0, score 1)
- [Pure TypeScript Search Microservice — L698](pure-typescript-search-microservice.md#^ref-d17d3a96-698-0) (line 698, col 0, score 1)
- [Reawakening Duck — L242](reawakening-duck.md#^ref-59b5670f-242-0) (line 242, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L284](layer1survivabilityenvelope.md#^ref-64a9f9f9-284-0) (line 284, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L285](layer1survivabilityenvelope.md#^ref-64a9f9f9-285-0) (line 285, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L417](migrate-to-provider-tenant-architecture.md#^ref-54382370-417-0) (line 417, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L142](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-142-0) (line 142, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L562](performance-optimized-polyglot-bridge.md#^ref-f5579967-562-0) (line 562, col 0, score 1)
- [Pipeline Enhancements — L67](pipeline-enhancements.md#^ref-e2135d9f-67-0) (line 67, col 0, score 1)
- [plan-update-confirmation — L1152](plan-update-confirmation.md#^ref-b22d79c6-1152-0) (line 1152, col 0, score 1)
- [Promethean Dev Workflow Update — L203](promethean-dev-workflow-update.md#^ref-03a5578f-203-0) (line 203, col 0, score 1)
- [Promethean Dev Workflow Update — L214](promethean-dev-workflow-update.md#^ref-03a5578f-214-0) (line 214, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L250](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-250-0) (line 250, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L286](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-286-0) (line 286, col 0, score 1)
- [Promethean Documentation Update — L75](promethean-documentation-update.txt#^ref-0b872af2-75-0) (line 75, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L172](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-172-0) (line 172, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L603](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-603-0) (line 603, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L573](performance-optimized-polyglot-bridge.md#^ref-f5579967-573-0) (line 573, col 0, score 1)
- [plan-update-confirmation — L1137](plan-update-confirmation.md#^ref-b22d79c6-1137-0) (line 1137, col 0, score 1)
- [polyglot-repl-interface-layer — L274](polyglot-repl-interface-layer.md#^ref-9c79206d-274-0) (line 274, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L177](promethean-copilot-intent-engine.md#^ref-ae24a280-177-0) (line 177, col 0, score 1)
- [Promethean Dev Workflow Update — L189](promethean-dev-workflow-update.md#^ref-03a5578f-189-0) (line 189, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L233](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-233-0) (line 233, col 0, score 1)
- [Promethean Documentation Update — L94](promethean-documentation-update.txt#^ref-0b872af2-94-0) (line 94, col 0, score 1)
- [Promethean Notes — L100](promethean-notes.md#^ref-1c4046b5-100-0) (line 100, col 0, score 1)
- [eidolon-field-math-foundations — L181](eidolon-field-math-foundations.md#^ref-008f2ac0-181-0) (line 181, col 0, score 1)
- [Fnord Tracer Protocol — L372](fnord-tracer-protocol.md#^ref-fc21f824-372-0) (line 372, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L207](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-207-0) (line 207, col 0, score 1)
- [graph-ds — L469](graph-ds.md#^ref-6620e2f2-469-0) (line 469, col 0, score 1)
- [heartbeat-fragment-demo — L217](heartbeat-fragment-demo.md#^ref-dd00677a-217-0) (line 217, col 0, score 1)
- [i3-bluetooth-setup — L226](i3-bluetooth-setup.md#^ref-5e408692-226-0) (line 226, col 0, score 1)
- [Ice Box Reorganization — L191](ice-box-reorganization.md#^ref-291c7d91-191-0) (line 191, col 0, score 1)
- [Mathematical Samplers — L121](mathematical-samplers.md#^ref-86a691ec-121-0) (line 121, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L160](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-160-0) (line 160, col 0, score 1)
- [Optimizing Command Limitations in System Design — L75](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-75-0) (line 75, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L601](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-601-0) (line 601, col 0, score 1)
- [plan-update-confirmation — L1116](plan-update-confirmation.md#^ref-b22d79c6-1116-0) (line 1116, col 0, score 1)
- [polyglot-repl-interface-layer — L228](polyglot-repl-interface-layer.md#^ref-9c79206d-228-0) (line 228, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L211](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-211-0) (line 211, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L257](chroma-toolkit-consolidation-plan.md#^ref-5020e892-257-0) (line 257, col 0, score 1)
- [Diagrams — L54](chunks/diagrams.md#^ref-45cd25b5-54-0) (line 54, col 0, score 1)
- [DSL — L50](chunks/dsl.md#^ref-e87bc036-50-0) (line 50, col 0, score 1)
- [Math Fundamentals — L76](chunks/math-fundamentals.md#^ref-c6e87433-76-0) (line 76, col 0, score 1)
- [Shared — L55](chunks/shared.md#^ref-623a55f7-55-0) (line 55, col 0, score 1)
- [Simulation Demo — L68](chunks/simulation-demo.md#^ref-557309a3-68-0) (line 68, col 0, score 1)
- [Window Management — L68](chunks/window-management.md#^ref-9e8ae388-68-0) (line 68, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L97](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-97-0) (line 97, col 0, score 1)
- [Eidolon Field Abstract Model — L255](eidolon-field-abstract-model.md#^ref-5e8b2388-255-0) (line 255, col 0, score 1)
- [eidolon-field-math-foundations — L212](eidolon-field-math-foundations.md#^ref-008f2ac0-212-0) (line 212, col 0, score 1)
- [Factorio AI with External Agents — L211](factorio-ai-with-external-agents.md#^ref-a4d90289-211-0) (line 211, col 0, score 1)
- [field-dynamics-math-blocks — L210](field-dynamics-math-blocks.md#^ref-7cfc230d-210-0) (line 210, col 0, score 1)
- [komorebi-group-window-hack — L236](komorebi-group-window-hack.md#^ref-dd89372d-236-0) (line 236, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L289](layer1survivabilityenvelope.md#^ref-64a9f9f9-289-0) (line 289, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L344](migrate-to-provider-tenant-architecture.md#^ref-54382370-344-0) (line 344, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L166](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-166-0) (line 166, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L130](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-130-0) (line 130, col 0, score 1)
- [polyglot-repl-interface-layer — L199](polyglot-repl-interface-layer.md#^ref-9c79206d-199-0) (line 199, col 0, score 1)
- [Promethean Chat Activity Report — L143](promethean-chat-activity-report.md#^ref-18344cf9-143-0) (line 143, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L94](promethean-copilot-intent-engine.md#^ref-ae24a280-94-0) (line 94, col 0, score 1)
- [Promethean Dev Workflow Update — L87](promethean-dev-workflow-update.md#^ref-03a5578f-87-0) (line 87, col 0, score 1)
- [Factorio AI with External Agents — L268](factorio-ai-with-external-agents.md#^ref-a4d90289-268-0) (line 268, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L177](model-upgrade-calm-down-guide.md#^ref-db74343f-177-0) (line 177, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L93](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-93-0) (line 93, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L141](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-141-0) (line 141, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L173](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-173-0) (line 173, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L604](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-604-0) (line 604, col 0, score 1)
- [plan-update-confirmation — L1063](plan-update-confirmation.md#^ref-b22d79c6-1063-0) (line 1063, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L207](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-207-0) (line 207, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L272](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-272-0) (line 272, col 0, score 1)
- [Promethean Documentation Update — L103](promethean-documentation-update.txt#^ref-0b872af2-103-0) (line 103, col 0, score 1)
- [Promethean Infrastructure Setup — L814](promethean-infrastructure-setup.md#^ref-6deed6ac-814-0) (line 814, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L190](model-upgrade-calm-down-guide.md#^ref-db74343f-190-0) (line 190, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L83](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-83-0) (line 83, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L104](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-104-0) (line 104, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L179](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-179-0) (line 179, col 0, score 1)
- [plan-update-confirmation — L1070](plan-update-confirmation.md#^ref-b22d79c6-1070-0) (line 1070, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L199](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-199-0) (line 199, col 0, score 1)
- [Promethean Chat Activity Report — L148](promethean-chat-activity-report.md#^ref-18344cf9-148-0) (line 148, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L196](promethean-copilot-intent-engine.md#^ref-ae24a280-196-0) (line 196, col 0, score 1)
- [Promethean Dev Workflow Update — L191](promethean-dev-workflow-update.md#^ref-03a5578f-191-0) (line 191, col 0, score 1)
- [Prometheus Observability Stack — L512](prometheus-observability-stack.md#^ref-e90b5a16-512-0) (line 512, col 0, score 1)
- [Creative Moments — L40](creative-moments.md#^ref-10d98225-40-0) (line 40, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L108](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-108-0) (line 108, col 0, score 1)
- [Docops Feature Updates — L60](docops-feature-updates-3.md#^ref-cdbd21ee-60-0) (line 60, col 0, score 1)
- [Docops Feature Updates — L89](docops-feature-updates.md#^ref-2792d448-89-0) (line 89, col 0, score 1)
- [DuckDuckGoSearchPipeline — L45](duckduckgosearchpipeline.md#^ref-e979c50f-45-0) (line 45, col 0, score 1)
- [Duck's Attractor States — L126](ducks-attractor-states.md#^ref-13951643-126-0) (line 126, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L117](ducks-self-referential-perceptual-loop.md#^ref-71726f04-117-0) (line 117, col 0, score 1)
- [field-node-diagram-visualizations — L142](field-node-diagram-visualizations.md#^ref-e9b27b06-142-0) (line 142, col 0, score 1)
- [komorebi-group-window-hack — L288](komorebi-group-window-hack.md#^ref-dd89372d-288-0) (line 288, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L37](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-37-0) (line 37, col 0, score 1)
- [i3-bluetooth-setup — L104](i3-bluetooth-setup.md#^ref-5e408692-104-0) (line 104, col 0, score 1)
- [Fnord Tracer Protocol — L374](fnord-tracer-protocol.md#^ref-fc21f824-374-0) (line 374, col 0, score 1)
- [homeostasis-decay-formulas — L270](homeostasis-decay-formulas.md#^ref-37b5d236-270-0) (line 270, col 0, score 1)
- [Promethean Dev Workflow Update — L164](promethean-dev-workflow-update.md#^ref-03a5578f-164-0) (line 164, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L282](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-282-0) (line 282, col 0, score 1)
- [Promethean Pipelines — L207](promethean-pipelines.md#^ref-8b8e6103-207-0) (line 207, col 0, score 1)
- [promethean-requirements — L89](promethean-requirements.md#^ref-95205cd3-89-0) (line 89, col 0, score 1)
- [Promethean State Format — L197](promethean-state-format.md#^ref-23df6ddb-197-0) (line 197, col 0, score 1)
- [Prometheus Observability Stack — L625](prometheus-observability-stack.md#^ref-e90b5a16-625-0) (line 625, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L281](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-281-0) (line 281, col 0, score 1)
- [Promethean Infrastructure Setup — L746](promethean-infrastructure-setup.md#^ref-6deed6ac-746-0) (line 746, col 0, score 1)
- [Promethean Pipelines — L186](promethean-pipelines.md#^ref-8b8e6103-186-0) (line 186, col 0, score 1)
- [Promethean State Format — L179](promethean-state-format.md#^ref-23df6ddb-179-0) (line 179, col 0, score 1)
- [Prometheus Observability Stack — L550](prometheus-observability-stack.md#^ref-e90b5a16-550-0) (line 550, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L163](protocol-0-the-contradiction-engine.md#^ref-9a93a756-163-0) (line 163, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L319](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-319-0) (line 319, col 0, score 1)
- [Pure TypeScript Search Microservice — L619](pure-typescript-search-microservice.md#^ref-d17d3a96-619-0) (line 619, col 0, score 1)
- [Reawakening Duck — L237](reawakening-duck.md#^ref-59b5670f-237-0) (line 237, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L227](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-227-0) (line 227, col 0, score 1)
- [heartbeat-fragment-demo — L200](heartbeat-fragment-demo.md#^ref-dd00677a-200-0) (line 200, col 0, score 1)
- [homeostasis-decay-formulas — L237](homeostasis-decay-formulas.md#^ref-37b5d236-237-0) (line 237, col 0, score 1)
- [i3-bluetooth-setup — L179](i3-bluetooth-setup.md#^ref-5e408692-179-0) (line 179, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L382](migrate-to-provider-tenant-architecture.md#^ref-54382370-382-0) (line 382, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L222](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-222-0) (line 222, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L109](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-109-0) (line 109, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L110](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-110-0) (line 110, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L178](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-178-0) (line 178, col 0, score 1)
- [Tooling — L41](chunks/tooling.md#^ref-6cb4943e-41-0) (line 41, col 0, score 1)
- [Docops Feature Updates — L48](docops-feature-updates-3.md#^ref-cdbd21ee-48-0) (line 48, col 0, score 1)
- [Docops Feature Updates — L79](docops-feature-updates.md#^ref-2792d448-79-0) (line 79, col 0, score 1)
- [eidolon-node-lifecycle — L69](eidolon-node-lifecycle.md#^ref-938eca9c-69-0) (line 69, col 0, score 1)
- [field-node-diagram-outline — L158](field-node-diagram-outline.md#^ref-1f32c94a-158-0) (line 158, col 0, score 1)
- [field-node-diagram-set — L178](field-node-diagram-set.md#^ref-22b989d5-178-0) (line 178, col 0, score 1)
- [field-node-diagram-visualizations — L126](field-node-diagram-visualizations.md#^ref-e9b27b06-126-0) (line 126, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L228](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-228-0) (line 228, col 0, score 1)
- [heartbeat-fragment-demo — L157](heartbeat-fragment-demo.md#^ref-dd00677a-157-0) (line 157, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L500](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-500-0) (line 500, col 0, score 1)
- [Prometheus Observability Stack — L505](prometheus-observability-stack.md#^ref-e90b5a16-505-0) (line 505, col 0, score 1)
- [Pure TypeScript Search Microservice — L576](pure-typescript-search-microservice.md#^ref-d17d3a96-576-0) (line 576, col 0, score 1)
- [ChatGPT Custom Prompts — L80](chatgpt-custom-prompts.md#^ref-930054b3-80-0) (line 80, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L140](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-140-0) (line 140, col 0, score 1)
- [Dynamic Context Model for Web Components — L519](dynamic-context-model-for-web-components.md#^ref-f7702bf8-519-0) (line 519, col 0, score 1)
- [Factorio AI with External Agents — L284](factorio-ai-with-external-agents.md#^ref-a4d90289-284-0) (line 284, col 0, score 1)
- [field-dynamics-math-blocks — L259](field-dynamics-math-blocks.md#^ref-7cfc230d-259-0) (line 259, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L288](layer1survivabilityenvelope.md#^ref-64a9f9f9-288-0) (line 288, col 0, score 1)
- [Stateful Partitions and Rebalancing — L669](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-669-0) (line 669, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L628](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-628-0) (line 628, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L2877](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-2877-0) (line 2877, col 0, score 0.86)
- [windows-tiling-with-autohotkey — L2709](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2709-0) (line 2709, col 0, score 0.86)
- [eidolon-field-math-foundations — L4316](eidolon-field-math-foundations.md#^ref-008f2ac0-4316-0) (line 4316, col 0, score 0.86)
- [Canonical Org-Babel Matplotlib Animation Template — L3243](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-3243-0) (line 3243, col 0, score 0.86)
- [eidolon-field-math-foundations — L7354](eidolon-field-math-foundations.md#^ref-008f2ac0-7354-0) (line 7354, col 0, score 0.86)
- [Canonical Org-Babel Matplotlib Animation Template — L3270](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-3270-0) (line 3270, col 0, score 0.86)
- [eidolon-field-math-foundations — L7381](eidolon-field-math-foundations.md#^ref-008f2ac0-7381-0) (line 7381, col 0, score 0.86)
- [eidolon-field-math-foundations — L145](eidolon-field-math-foundations.md#^ref-008f2ac0-145-0) (line 145, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L208](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-208-0) (line 208, col 0, score 1)
- [Diagrams — L76](chunks/diagrams.md#^ref-45cd25b5-76-0) (line 76, col 0, score 1)
- [Tooling — L106](chunks/tooling.md#^ref-6cb4943e-106-0) (line 106, col 0, score 1)
- [Window Management — L127](chunks/window-management.md#^ref-9e8ae388-127-0) (line 127, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L146](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-146-0) (line 146, col 0, score 1)
- [Eidolon Field Abstract Model — L241](eidolon-field-abstract-model.md#^ref-5e8b2388-241-0) (line 241, col 0, score 1)
- [Factorio AI with External Agents — L272](factorio-ai-with-external-agents.md#^ref-a4d90289-272-0) (line 272, col 0, score 1)
- [field-node-diagram-outline — L165](field-node-diagram-outline.md#^ref-1f32c94a-165-0) (line 165, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L219](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-219-0) (line 219, col 0, score 1)
- [Fnord Tracer Protocol — L363](fnord-tracer-protocol.md#^ref-fc21f824-363-0) (line 363, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L407](migrate-to-provider-tenant-architecture.md#^ref-54382370-407-0) (line 407, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L267](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-267-0) (line 267, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L158](model-upgrade-calm-down-guide.md#^ref-db74343f-158-0) (line 158, col 0, score 1)
- [Optimizing Command Limitations in System Design — L135](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-135-0) (line 135, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L594](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-594-0) (line 594, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L558](performance-optimized-polyglot-bridge.md#^ref-f5579967-558-0) (line 558, col 0, score 1)
- [plan-update-confirmation — L1106](plan-update-confirmation.md#^ref-b22d79c6-1106-0) (line 1106, col 0, score 1)
- [Promethean Chat Activity Report — L158](promethean-chat-activity-report.md#^ref-18344cf9-158-0) (line 158, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L188](promethean-copilot-intent-engine.md#^ref-ae24a280-188-0) (line 188, col 0, score 1)
- [Promethean Dev Workflow Update — L213](promethean-dev-workflow-update.md#^ref-03a5578f-213-0) (line 213, col 0, score 1)
- [field-node-diagram-visualizations — L149](field-node-diagram-visualizations.md#^ref-e9b27b06-149-0) (line 149, col 0, score 1)
- [Fnord Tracer Protocol — L288](fnord-tracer-protocol.md#^ref-fc21f824-288-0) (line 288, col 0, score 1)
- [graph-ds — L417](graph-ds.md#^ref-6620e2f2-417-0) (line 417, col 0, score 1)
- [heartbeat-fragment-demo — L177](heartbeat-fragment-demo.md#^ref-dd00677a-177-0) (line 177, col 0, score 1)
- [homeostasis-decay-formulas — L214](homeostasis-decay-formulas.md#^ref-37b5d236-214-0) (line 214, col 0, score 1)
- [i3-bluetooth-setup — L151](i3-bluetooth-setup.md#^ref-5e408692-151-0) (line 151, col 0, score 1)
- [Ice Box Reorganization — L121](ice-box-reorganization.md#^ref-291c7d91-121-0) (line 121, col 0, score 1)
- [komorebi-group-window-hack — L238](komorebi-group-window-hack.md#^ref-dd89372d-238-0) (line 238, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L203](layer1survivabilityenvelope.md#^ref-64a9f9f9-203-0) (line 203, col 0, score 1)
- [schema-evolution-workflow — L589](schema-evolution-workflow.md#^ref-d8059b6a-589-0) (line 589, col 0, score 1)
- [windows-tiling-with-autohotkey — L130](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-130-0) (line 130, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L283](layer1survivabilityenvelope.md#^ref-64a9f9f9-283-0) (line 283, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L301](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-301-0) (line 301, col 0, score 1)
- [plan-update-confirmation — L1078](plan-update-confirmation.md#^ref-b22d79c6-1078-0) (line 1078, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L91](promethean-copilot-intent-engine.md#^ref-ae24a280-91-0) (line 91, col 0, score 1)
- [Promethean Dev Workflow Update — L82](promethean-dev-workflow-update.md#^ref-03a5578f-82-0) (line 82, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L284](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-284-0) (line 284, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L164](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-164-0) (line 164, col 0, score 1)
- [Promethean Infrastructure Setup — L739](promethean-infrastructure-setup.md#^ref-6deed6ac-739-0) (line 739, col 0, score 1)
- [Services — L61](chunks/services.md#^ref-75ea4a6a-61-0) (line 61, col 0, score 1)
- [Docops Feature Updates — L37](docops-feature-updates-3.md#^ref-cdbd21ee-37-0) (line 37, col 0, score 1)
- [Docops Feature Updates — L59](docops-feature-updates.md#^ref-2792d448-59-0) (line 59, col 0, score 1)
- [DuckDuckGoSearchPipeline — L34](duckduckgosearchpipeline.md#^ref-e979c50f-34-0) (line 34, col 0, score 1)
- [Duck's Attractor States — L117](ducks-attractor-states.md#^ref-13951643-117-0) (line 117, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L93](ducks-self-referential-perceptual-loop.md#^ref-71726f04-93-0) (line 93, col 0, score 1)
- [Eidolon Field Abstract Model — L310](eidolon-field-abstract-model.md#^ref-5e8b2388-310-0) (line 310, col 0, score 1)
- [eidolon-field-math-foundations — L208](eidolon-field-math-foundations.md#^ref-008f2ac0-208-0) (line 208, col 0, score 1)
- [Factorio AI with External Agents — L192](factorio-ai-with-external-agents.md#^ref-a4d90289-192-0) (line 192, col 0, score 1)
- [field-interaction-equations — L272](field-interaction-equations.md#^ref-b09141b7-272-0) (line 272, col 0, score 1)
- [Fnord Tracer Protocol — L307](fnord-tracer-protocol.md#^ref-fc21f824-307-0) (line 307, col 0, score 1)
- [i3-bluetooth-setup — L180](i3-bluetooth-setup.md#^ref-5e408692-180-0) (line 180, col 0, score 1)
- [komorebi-group-window-hack — L294](komorebi-group-window-hack.md#^ref-dd89372d-294-0) (line 294, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L230](layer1survivabilityenvelope.md#^ref-64a9f9f9-230-0) (line 230, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L386](migrate-to-provider-tenant-architecture.md#^ref-54382370-386-0) (line 386, col 0, score 1)
- [Mindful Prioritization — L36](mindful-prioritization.md#^ref-40185d05-36-0) (line 36, col 0, score 1)
- [MindfulRobotIntegration — L34](mindfulrobotintegration.md#^ref-5f65dfa5-34-0) (line 34, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L251](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-251-0) (line 251, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L41](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-41-0) (line 41, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L110](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-110-0) (line 110, col 0, score 1)
- [Promethean Infrastructure Setup — L756](promethean-infrastructure-setup.md#^ref-6deed6ac-756-0) (line 756, col 0, score 1)
- [Promethean Pipelines — L176](promethean-pipelines.md#^ref-8b8e6103-176-0) (line 176, col 0, score 1)
- [promethean-requirements — L91](promethean-requirements.md#^ref-95205cd3-91-0) (line 91, col 0, score 1)
- [Promethean State Format — L200](promethean-state-format.md#^ref-23df6ddb-200-0) (line 200, col 0, score 1)
- [Prometheus Observability Stack — L552](prometheus-observability-stack.md#^ref-e90b5a16-552-0) (line 552, col 0, score 1)
- [Prompt_Folder_Bootstrap — L288](prompt-folder-bootstrap.md#^ref-bd4f0976-288-0) (line 288, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L188](protocol-0-the-contradiction-engine.md#^ref-9a93a756-188-0) (line 188, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L323](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-323-0) (line 323, col 0, score 1)
- [field-node-diagram-set — L255](field-node-diagram-set.md#^ref-22b989d5-255-0) (line 255, col 0, score 1)
- [Fnord Tracer Protocol — L355](fnord-tracer-protocol.md#^ref-fc21f824-355-0) (line 355, col 0, score 1)
- [homeostasis-decay-formulas — L271](homeostasis-decay-formulas.md#^ref-37b5d236-271-0) (line 271, col 0, score 1)
- [Ice Box Reorganization — L185](ice-box-reorganization.md#^ref-291c7d91-185-0) (line 185, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L295](layer1survivabilityenvelope.md#^ref-64a9f9f9-295-0) (line 295, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L247](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-247-0) (line 247, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L182](model-upgrade-calm-down-guide.md#^ref-db74343f-182-0) (line 182, col 0, score 1)
- [OpenAPI Validation Report — L107](openapi-validation-report.md#^ref-5c152b08-107-0) (line 107, col 0, score 1)
- [plan-update-confirmation — L1131](plan-update-confirmation.md#^ref-b22d79c6-1131-0) (line 1131, col 0, score 1)
- [Creative Moments — L79](creative-moments.md#^ref-10d98225-79-0) (line 79, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L145](ducks-self-referential-perceptual-loop.md#^ref-71726f04-145-0) (line 145, col 0, score 1)
- [Dynamic Context Model for Web Components — L543](dynamic-context-model-for-web-components.md#^ref-f7702bf8-543-0) (line 543, col 0, score 1)
- [Factorio AI with External Agents — L282](factorio-ai-with-external-agents.md#^ref-a4d90289-282-0) (line 282, col 0, score 1)
- [field-dynamics-math-blocks — L255](field-dynamics-math-blocks.md#^ref-7cfc230d-255-0) (line 255, col 0, score 1)
- [Fnord Tracer Protocol — L386](fnord-tracer-protocol.md#^ref-fc21f824-386-0) (line 386, col 0, score 1)
- [homeostasis-decay-formulas — L276](homeostasis-decay-formulas.md#^ref-37b5d236-276-0) (line 276, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L414](migrate-to-provider-tenant-architecture.md#^ref-54382370-414-0) (line 414, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L217](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-217-0) (line 217, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L150](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-150-0) (line 150, col 0, score 1)
- [Eidolon Field Abstract Model — L281](eidolon-field-abstract-model.md#^ref-5e8b2388-281-0) (line 281, col 0, score 1)
- [eidolon-field-math-foundations — L237](eidolon-field-math-foundations.md#^ref-008f2ac0-237-0) (line 237, col 0, score 1)
- [eidolon-node-lifecycle — L112](eidolon-node-lifecycle.md#^ref-938eca9c-112-0) (line 112, col 0, score 1)
- [field-dynamics-math-blocks — L240](field-dynamics-math-blocks.md#^ref-7cfc230d-240-0) (line 240, col 0, score 1)
- [field-interaction-equations — L248](field-interaction-equations.md#^ref-b09141b7-248-0) (line 248, col 0, score 1)
- [field-node-diagram-outline — L206](field-node-diagram-outline.md#^ref-1f32c94a-206-0) (line 206, col 0, score 1)
- [field-node-diagram-set — L231](field-node-diagram-set.md#^ref-22b989d5-231-0) (line 231, col 0, score 1)
- [field-node-diagram-visualizations — L179](field-node-diagram-visualizations.md#^ref-e9b27b06-179-0) (line 179, col 0, score 1)
- [Fnord Tracer Protocol — L379](fnord-tracer-protocol.md#^ref-fc21f824-379-0) (line 379, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L212](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-212-0) (line 212, col 0, score 1)
- [heartbeat-fragment-demo — L142](heartbeat-fragment-demo.md#^ref-dd00677a-142-0) (line 142, col 0, score 1)
- [Factorio AI with External Agents — L193](factorio-ai-with-external-agents.md#^ref-a4d90289-193-0) (line 193, col 0, score 1)
- [field-dynamics-math-blocks — L183](field-dynamics-math-blocks.md#^ref-7cfc230d-183-0) (line 183, col 0, score 1)
- [field-interaction-equations — L197](field-interaction-equations.md#^ref-b09141b7-197-0) (line 197, col 0, score 1)
- [field-node-diagram-outline — L157](field-node-diagram-outline.md#^ref-1f32c94a-157-0) (line 157, col 0, score 1)
- [field-node-diagram-set — L189](field-node-diagram-set.md#^ref-22b989d5-189-0) (line 189, col 0, score 1)
- [field-node-diagram-visualizations — L135](field-node-diagram-visualizations.md#^ref-e9b27b06-135-0) (line 135, col 0, score 1)
- [graph-ds — L415](graph-ds.md#^ref-6620e2f2-415-0) (line 415, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L148](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-148-0) (line 148, col 0, score 1)
- [Optimizing Command Limitations in System Design — L93](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-93-0) (line 93, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L304](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-304-0) (line 304, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L241](layer1survivabilityenvelope.md#^ref-64a9f9f9-241-0) (line 241, col 0, score 1)
- [Mathematical Samplers — L125](mathematical-samplers.md#^ref-86a691ec-125-0) (line 125, col 0, score 1)
- [Mathematics Sampler — L131](mathematics-sampler.md#^ref-b5e0183e-131-0) (line 131, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L387](migrate-to-provider-tenant-architecture.md#^ref-54382370-387-0) (line 387, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L223](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-223-0) (line 223, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L179](model-upgrade-calm-down-guide.md#^ref-db74343f-179-0) (line 179, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L105](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-105-0) (line 105, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L106](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-106-0) (line 106, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L139](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-139-0) (line 139, col 0, score 1)
- [Promethean Documentation Update — L117](promethean-documentation-update.txt#^ref-0b872af2-117-0) (line 117, col 0, score 1)
- [Promethean Infrastructure Setup — L798](promethean-infrastructure-setup.md#^ref-6deed6ac-798-0) (line 798, col 0, score 1)
- [Promethean Notes — L105](promethean-notes.md#^ref-1c4046b5-105-0) (line 105, col 0, score 1)
- [Promethean State Format — L210](promethean-state-format.md#^ref-23df6ddb-210-0) (line 210, col 0, score 1)
- [Prometheus Observability Stack — L602](prometheus-observability-stack.md#^ref-e90b5a16-602-0) (line 602, col 0, score 1)
- [Prompt_Folder_Bootstrap — L282](prompt-folder-bootstrap.md#^ref-bd4f0976-282-0) (line 282, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L216](protocol-0-the-contradiction-engine.md#^ref-9a93a756-216-0) (line 216, col 0, score 1)
- [Pure TypeScript Search Microservice — L674](pure-typescript-search-microservice.md#^ref-d17d3a96-674-0) (line 674, col 0, score 1)
- [Reawakening Duck — L254](reawakening-duck.md#^ref-59b5670f-254-0) (line 254, col 0, score 1)
- [windows-tiling-with-autohotkey — L467](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-467-0) (line 467, col 0, score 0.95)
- [Promethean Dev Workflow Update — L296](promethean-dev-workflow-update.md#^ref-03a5578f-296-0) (line 296, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L790](migrate-to-provider-tenant-architecture.md#^ref-54382370-790-0) (line 790, col 0, score 0.99)
- [plan-update-confirmation — L1712](plan-update-confirmation.md#^ref-b22d79c6-1712-0) (line 1712, col 0, score 0.99)
- [Admin Dashboard for User Management — L412](admin-dashboard-for-user-management.md#^ref-2901a3e9-412-0) (line 412, col 0, score 0.97)
- [DSL — L265](chunks/dsl.md#^ref-e87bc036-265-0) (line 265, col 0, score 0.97)
- [eidolon-field-math-foundations — L869](eidolon-field-math-foundations.md#^ref-008f2ac0-869-0) (line 869, col 0, score 0.97)
- [obsidian-ignore-node-modules-regex — L379](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-379-0) (line 379, col 0, score 0.97)
- [ParticleSimulationWithCanvasAndFFmpeg — L670](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-670-0) (line 670, col 0, score 0.97)
- [Promethean State Format — L338](promethean-state-format.md#^ref-23df6ddb-338-0) (line 338, col 0, score 1)
- [field-node-diagram-outline — L303](field-node-diagram-outline.md#^ref-1f32c94a-303-0) (line 303, col 0, score 1)
- [Eidolon Field Abstract Model — L548](eidolon-field-abstract-model.md#^ref-5e8b2388-548-0) (line 548, col 0, score 1)
- [Fnord Tracer Protocol — L598](fnord-tracer-protocol.md#^ref-fc21f824-598-0) (line 598, col 0, score 1)
- [ripple-propagation-demo — L266](ripple-propagation-demo.md#^ref-8430617b-266-0) (line 266, col 0, score 1)
- [Smoke Resonance Visualizations — L242](smoke-resonance-visualizations.md#^ref-ac9d3ac5-242-0) (line 242, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L387](layer1survivabilityenvelope.md#^ref-64a9f9f9-387-0) (line 387, col 0, score 1)
- [field-node-diagram-set — L333](field-node-diagram-set.md#^ref-22b989d5-333-0) (line 333, col 0, score 1)
- [ChatGPT Custom Prompts — L114](chatgpt-custom-prompts.md#^ref-930054b3-114-0) (line 114, col 0, score 0.96)
- [Post-Linguistic Transhuman Design Frameworks — L292](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-292-0) (line 292, col 0, score 0.96)
- [plan-update-confirmation — L1832](plan-update-confirmation.md#^ref-b22d79c6-1832-0) (line 1832, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L434](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-434-0) (line 434, col 0, score 0.96)
- [Self-Agency in AI Interaction — L310](self-agency-in-ai-interaction.md#^ref-49a9a860-310-0) (line 310, col 0, score 0.96)
- [field-dynamics-math-blocks — L456](field-dynamics-math-blocks.md#^ref-7cfc230d-456-0) (line 456, col 0, score 0.96)
- [Dynamic Context Model for Web Components — L1094](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1094-0) (line 1094, col 0, score 0.95)
- [plan-update-confirmation — L1777](plan-update-confirmation.md#^ref-b22d79c6-1777-0) (line 1777, col 0, score 0.95)
- [Pure TypeScript Search Microservice — L838](pure-typescript-search-microservice.md#^ref-d17d3a96-838-0) (line 838, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L487](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-487-0) (line 487, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L471](promethean-copilot-intent-engine.md#^ref-ae24a280-471-0) (line 471, col 0, score 1)
- [Admin Dashboard for User Management — L221](admin-dashboard-for-user-management.md#^ref-2901a3e9-221-0) (line 221, col 0, score 1)
- [Prometheus Observability Stack — L736](prometheus-observability-stack.md#^ref-e90b5a16-736-0) (line 736, col 0, score 0.93)
- [Synchronicity Waves and Web — L260](synchronicity-waves-and-web.md#^ref-91295f3a-260-0) (line 260, col 0, score 0.92)
- [i3-bluetooth-setup — L332](i3-bluetooth-setup.md#^ref-5e408692-332-0) (line 332, col 0, score 0.92)
- [Layer1SurvivabilityEnvelope — L560](layer1survivabilityenvelope.md#^ref-64a9f9f9-560-0) (line 560, col 0, score 0.92)
- [Prompt_Folder_Bootstrap — L601](prompt-folder-bootstrap.md#^ref-bd4f0976-601-0) (line 601, col 0, score 0.92)
- [Agent Reflections and Prompt Evolution — L403](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-403-0) (line 403, col 0, score 1)
- [Eidolon Field Abstract Model — L615](eidolon-field-abstract-model.md#^ref-5e8b2388-615-0) (line 615, col 0, score 1)
- [eidolon-field-math-foundations — L392](eidolon-field-math-foundations.md#^ref-008f2ac0-392-0) (line 392, col 0, score 1)
- [field-interaction-equations — L514](field-interaction-equations.md#^ref-b09141b7-514-0) (line 514, col 0, score 1)
- [Fnord Tracer Protocol — L755](fnord-tracer-protocol.md#^ref-fc21f824-755-0) (line 755, col 0, score 1)
- [homeostasis-decay-formulas — L402](homeostasis-decay-formulas.md#^ref-37b5d236-402-0) (line 402, col 0, score 1)
- [eidolon-node-lifecycle — L153](eidolon-node-lifecycle.md#^ref-938eca9c-153-0) (line 153, col 0, score 1)
- [field-node-diagram-visualizations — L265](field-node-diagram-visualizations.md#^ref-e9b27b06-265-0) (line 265, col 0, score 1)
- [homeostasis-decay-formulas — L442](homeostasis-decay-formulas.md#^ref-37b5d236-442-0) (line 442, col 0, score 1)
- [field-interaction-equations — L518](field-interaction-equations.md#^ref-b09141b7-518-0) (line 518, col 0, score 1)
- [field-dynamics-math-blocks — L449](field-dynamics-math-blocks.md#^ref-7cfc230d-449-0) (line 449, col 0, score 1)
- [field-node-diagram-set — L321](field-node-diagram-set.md#^ref-22b989d5-321-0) (line 321, col 0, score 1)
- [Ice Box Reorganization — L275](ice-box-reorganization.md#^ref-291c7d91-275-0) (line 275, col 0, score 1)
- [field-node-diagram-visualizations — L243](field-node-diagram-visualizations.md#^ref-e9b27b06-243-0) (line 243, col 0, score 1)
- [Fnord Tracer Protocol — L604](fnord-tracer-protocol.md#^ref-fc21f824-604-0) (line 604, col 0, score 1)
- [heartbeat-fragment-demo — L290](heartbeat-fragment-demo.md#^ref-dd00677a-290-0) (line 290, col 0, score 1)
- [field-node-diagram-outline — L271](field-node-diagram-outline.md#^ref-1f32c94a-271-0) (line 271, col 0, score 1)
- [eidolon-field-math-foundations — L895](eidolon-field-math-foundations.md#^ref-008f2ac0-895-0) (line 895, col 0, score 0.97)
- [Model Selection for Lightweight Conversational Tasks — L729](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-729-0) (line 729, col 0, score 0.97)
- [Optimizing Command Limitations in System Design — L313](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-313-0) (line 313, col 0, score 0.97)
- [ParticleSimulationWithCanvasAndFFmpeg — L717](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-717-0) (line 717, col 0, score 0.97)
- [Performance-Optimized-Polyglot-Bridge — L1075](performance-optimized-polyglot-bridge.md#^ref-f5579967-1075-0) (line 1075, col 0, score 0.97)
- [polyglot-repl-interface-layer — L450](polyglot-repl-interface-layer.md#^ref-9c79206d-450-0) (line 450, col 0, score 0.97)
- [Promethean-Copilot-Intent-Engine — L679](promethean-copilot-intent-engine.md#^ref-ae24a280-679-0) (line 679, col 0, score 0.97)
- [Promethean Dev Workflow Update — L474](promethean-dev-workflow-update.md#^ref-03a5578f-474-0) (line 474, col 0, score 0.97)
- [Promethean Infrastructure Setup — L1537](promethean-infrastructure-setup.md#^ref-6deed6ac-1537-0) (line 1537, col 0, score 0.97)
- [Promethean State Format — L470](promethean-state-format.md#^ref-23df6ddb-470-0) (line 470, col 0, score 0.97)
- [Docops Feature Updates — L122](docops-feature-updates.md#^ref-2792d448-122-0) (line 122, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L573](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-573-0) (line 573, col 0, score 1)
- [Eidolon Field Abstract Model — L456](eidolon-field-abstract-model.md#^ref-5e8b2388-456-0) (line 456, col 0, score 1)
- [Promethean Pipelines — L327](promethean-pipelines.md#^ref-8b8e6103-327-0) (line 327, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L457](chroma-toolkit-consolidation-plan.md#^ref-5020e892-457-0) (line 457, col 0, score 0.99)
- [Stateful Partitions and Rebalancing — L947](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-947-0) (line 947, col 0, score 0.99)
- [schema-evolution-workflow — L904](schema-evolution-workflow.md#^ref-d8059b6a-904-0) (line 904, col 0, score 0.99)
- [Model Selection for Lightweight Conversational Tasks — L335](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-335-0) (line 335, col 0, score 0.96)
- [graph-ds — L657](graph-ds.md#^ref-6620e2f2-657-0) (line 657, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L845](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-845-0) (line 845, col 0, score 1)
- [schema-evolution-workflow — L702](schema-evolution-workflow.md#^ref-d8059b6a-702-0) (line 702, col 0, score 1)
- [Factorio AI with External Agents — L455](factorio-ai-with-external-agents.md#^ref-a4d90289-455-0) (line 455, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L366](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-366-0) (line 366, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L816](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-816-0) (line 816, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L315](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-315-0) (line 315, col 0, score 1)
- [Fnord Tracer Protocol — L645](fnord-tracer-protocol.md#^ref-fc21f824-645-0) (line 645, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L609](performance-optimized-polyglot-bridge.md#^ref-f5579967-609-0) (line 609, col 0, score 1)
- [Dynamic Context Model for Web Components — L1256](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1256-0) (line 1256, col 0, score 1)
- [Fnord Tracer Protocol — L747](fnord-tracer-protocol.md#^ref-fc21f824-747-0) (line 747, col 0, score 1)
- [Tracing the Signal — L293](tracing-the-signal.md#^ref-c3cd4f65-293-0) (line 293, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L183](ducks-self-referential-perceptual-loop.md#^ref-71726f04-183-0) (line 183, col 0, score 1)
- [Stateful Partitions and Rebalancing — L834](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-834-0) (line 834, col 0, score 1)
- [Reawakening Duck — L336](reawakening-duck.md#^ref-59b5670f-336-0) (line 336, col 0, score 1)
- [komorebi-group-window-hack — L347](komorebi-group-window-hack.md#^ref-dd89372d-347-0) (line 347, col 0, score 0.97)
- [Window Management — L148](chunks/window-management.md#^ref-9e8ae388-148-0) (line 148, col 0, score 0.96)
- [komorebi-group-window-hack — L346](komorebi-group-window-hack.md#^ref-dd89372d-346-0) (line 346, col 0, score 0.96)
- [Model Upgrade Calm-Down Guide — L272](model-upgrade-calm-down-guide.md#^ref-db74343f-272-0) (line 272, col 0, score 1)
- [Promethean Dev Workflow Update — L294](promethean-dev-workflow-update.md#^ref-03a5578f-294-0) (line 294, col 0, score 1)
- [sibilant-macro-targets — L548](sibilant-macro-targets.md#^ref-c5c9a5c6-548-0) (line 548, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L383](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-383-0) (line 383, col 0, score 0.97)
- [sibilant-macro-targets — L574](sibilant-macro-targets.md#^ref-c5c9a5c6-574-0) (line 574, col 0, score 0.97)
- [Promethean Infrastructure Setup — L922](promethean-infrastructure-setup.md#^ref-6deed6ac-922-0) (line 922, col 0, score 0.96)
- [plan-update-confirmation — L1575](plan-update-confirmation.md#^ref-b22d79c6-1575-0) (line 1575, col 0, score 0.96)
- [sibilant-macro-targets — L365](sibilant-macro-targets.md#^ref-c5c9a5c6-365-0) (line 365, col 0, score 0.96)
- [Agent Reflections and Prompt Evolution — L327](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-327-0) (line 327, col 0, score 0.96)
- [field-dynamics-math-blocks — L509](field-dynamics-math-blocks.md#^ref-7cfc230d-509-0) (line 509, col 0, score 0.96)
- [Duck's Attractor States — L281](ducks-attractor-states.md#^ref-13951643-281-0) (line 281, col 0, score 0.96)
- [windows-tiling-with-autohotkey — L486](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-486-0) (line 486, col 0, score 0.96)
- [i3-bluetooth-setup — L369](i3-bluetooth-setup.md#^ref-5e408692-369-0) (line 369, col 0, score 0.96)
- [komorebi-group-window-hack — L460](komorebi-group-window-hack.md#^ref-dd89372d-460-0) (line 460, col 0, score 0.96)
- [Dynamic Context Model for Web Components — L836](dynamic-context-model-for-web-components.md#^ref-f7702bf8-836-0) (line 836, col 0, score 0.96)
- [homeostasis-decay-formulas — L638](homeostasis-decay-formulas.md#^ref-37b5d236-638-0) (line 638, col 0, score 0.96)
- [Migrate to Provider-Tenant Architecture — L796](migrate-to-provider-tenant-architecture.md#^ref-54382370-796-0) (line 796, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L409](layer1survivabilityenvelope.md#^ref-64a9f9f9-409-0) (line 409, col 0, score 0.96)
- [Promethean-Copilot-Intent-Engine — L337](promethean-copilot-intent-engine.md#^ref-ae24a280-337-0) (line 337, col 0, score 0.96)
- [Promethean Documentation Pipeline Overview — L453](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-453-0) (line 453, col 0, score 0.96)
- [Promethean Pipelines — L344](promethean-pipelines.md#^ref-8b8e6103-344-0) (line 344, col 0, score 0.95)
- [Redirecting Standard Error — L139](redirecting-standard-error.md#^ref-b3555ede-139-0) (line 139, col 0, score 1)
- [plan-update-confirmation — L1593](plan-update-confirmation.md#^ref-b22d79c6-1593-0) (line 1593, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L404](model-upgrade-calm-down-guide.md#^ref-db74343f-404-0) (line 404, col 0, score 1)
- [Redirecting Standard Error — L192](redirecting-standard-error.md#^ref-b3555ede-192-0) (line 192, col 0, score 1)
- [Fnord Tracer Protocol — L416](fnord-tracer-protocol.md#^ref-fc21f824-416-0) (line 416, col 0, score 1)
- [Promethean Pipelines — L396](promethean-pipelines.md#^ref-8b8e6103-396-0) (line 396, col 0, score 1)
- [schema-evolution-workflow — L984](schema-evolution-workflow.md#^ref-d8059b6a-984-0) (line 984, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L933](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-933-0) (line 933, col 0, score 1)
- [field-interaction-equations — L420](field-interaction-equations.md#^ref-b09141b7-420-0) (line 420, col 0, score 1)
- [Prometheus Observability Stack — L683](prometheus-observability-stack.md#^ref-e90b5a16-683-0) (line 683, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L2222](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-2222-0) (line 2222, col 0, score 0.95)
- [windows-tiling-with-autohotkey — L3096](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-3096-0) (line 3096, col 0, score 0.95)
- [Fnord Tracer Protocol — L749](fnord-tracer-protocol.md#^ref-fc21f824-749-0) (line 749, col 0, score 0.95)
- [Duck's Attractor States — L283](ducks-attractor-states.md#^ref-13951643-283-0) (line 283, col 0, score 0.95)
- [Eidolon Field Abstract Model — L531](eidolon-field-abstract-model.md#^ref-5e8b2388-531-0) (line 531, col 0, score 0.94)
- [Promethean Dev Workflow Update — L2706](promethean-dev-workflow-update.md#^ref-03a5578f-2706-0) (line 2706, col 0, score 0.94)
- [Duck's Attractor States — L1883](ducks-attractor-states.md#^ref-13951643-1883-0) (line 1883, col 0, score 0.94)
- [Per-Domain Policy System for JS Crawler — L847](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-847-0) (line 847, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L472](migrate-to-provider-tenant-architecture.md#^ref-54382370-472-0) (line 472, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L412](model-upgrade-calm-down-guide.md#^ref-db74343f-412-0) (line 412, col 0, score 1)
- [Promethean Infrastructure Setup — L958](promethean-infrastructure-setup.md#^ref-6deed6ac-958-0) (line 958, col 0, score 1)
- [Eidolon Field Abstract Model — L470](eidolon-field-abstract-model.md#^ref-5e8b2388-470-0) (line 470, col 0, score 1)
- [Pure TypeScript Search Microservice — L748](pure-typescript-search-microservice.md#^ref-d17d3a96-748-0) (line 748, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L444](migrate-to-provider-tenant-architecture.md#^ref-54382370-444-0) (line 444, col 0, score 0.96)
- [Agent Tasks: Persistence Migration to DualStore — L341](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-341-0) (line 341, col 0, score 0.96)
- [Functional Refactor of TypeScript Document Processing — L347](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-347-0) (line 347, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L826](migrate-to-provider-tenant-architecture.md#^ref-54382370-826-0) (line 826, col 0, score 0.99)
- [sibilant-macro-targets — L510](sibilant-macro-targets.md#^ref-c5c9a5c6-510-0) (line 510, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L688](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-688-0) (line 688, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L806](performance-optimized-polyglot-bridge.md#^ref-f5579967-806-0) (line 806, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L1095](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1095-0) (line 1095, col 0, score 0.99)
- [plan-update-confirmation — L1204](plan-update-confirmation.md#^ref-b22d79c6-1204-0) (line 1204, col 0, score 0.99)
- [Promethean Pipelines — L460](promethean-pipelines.md#^ref-8b8e6103-460-0) (line 460, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L879](performance-optimized-polyglot-bridge.md#^ref-f5579967-879-0) (line 879, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L692](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-692-0) (line 692, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L390](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-390-0) (line 390, col 0, score 1)
- [Factorio AI with External Agents — L361](factorio-ai-with-external-agents.md#^ref-a4d90289-361-0) (line 361, col 0, score 1)
- [typed-struct-compiler — L589](typed-struct-compiler.md#^ref-78eeedf7-589-0) (line 589, col 0, score 1)
- [graph-ds — L532](graph-ds.md#^ref-6620e2f2-532-0) (line 532, col 0, score 1)
- [Dynamic Context Model for Web Components — L1019](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1019-0) (line 1019, col 0, score 0.94)
- [plan-update-confirmation — L1764](plan-update-confirmation.md#^ref-b22d79c6-1764-0) (line 1764, col 0, score 0.94)
- [Mathematical Samplers — L179](mathematical-samplers.md#^ref-86a691ec-179-0) (line 179, col 0, score 1)
- [homeostasis-decay-formulas — L441](homeostasis-decay-formulas.md#^ref-37b5d236-441-0) (line 441, col 0, score 1)
- [eidolon-field-math-foundations — L488](eidolon-field-math-foundations.md#^ref-008f2ac0-488-0) (line 488, col 0, score 1)
- [field-interaction-equations — L527](field-interaction-equations.md#^ref-b09141b7-527-0) (line 527, col 0, score 1)
- [field-node-diagram-set — L342](field-node-diagram-set.md#^ref-22b989d5-342-0) (line 342, col 0, score 1)
- [Duck's Attractor States — L1155](ducks-attractor-states.md#^ref-13951643-1155-0) (line 1155, col 0, score 0.96)
- [eidolon-field-math-foundations — L2020](eidolon-field-math-foundations.md#^ref-008f2ac0-2020-0) (line 2020, col 0, score 0.96)
- [Promethean Dev Workflow Update — L1302](promethean-dev-workflow-update.md#^ref-03a5578f-1302-0) (line 1302, col 0, score 0.96)
- [Canonical Org-Babel Matplotlib Animation Template — L1545](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-1545-0) (line 1545, col 0, score 0.96)
- [Performance-Optimized-Polyglot-Bridge — L913](performance-optimized-polyglot-bridge.md#^ref-f5579967-913-0) (line 913, col 0, score 1)
- [Factorio AI with External Agents — L425](factorio-ai-with-external-agents.md#^ref-a4d90289-425-0) (line 425, col 0, score 0.96)
- [Self-Agency in AI Interaction — L308](self-agency-in-ai-interaction.md#^ref-49a9a860-308-0) (line 308, col 0, score 0.96)
- [Performance-Optimized-Polyglot-Bridge — L909](performance-optimized-polyglot-bridge.md#^ref-f5579967-909-0) (line 909, col 0, score 0.96)
- [Tracing the Signal — L361](tracing-the-signal.md#^ref-c3cd4f65-361-0) (line 361, col 0, score 0.96)
- [eidolon-field-math-foundations — L410](eidolon-field-math-foundations.md#^ref-008f2ac0-410-0) (line 410, col 0, score 0.96)
- [Mathematics Sampler — L169](mathematics-sampler.md#^ref-b5e0183e-169-0) (line 169, col 0, score 0.96)
- [homeostasis-decay-formulas — L560](homeostasis-decay-formulas.md#^ref-37b5d236-560-0) (line 560, col 0, score 0.96)
- [Dynamic Context Model for Web Components — L1104](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1104-0) (line 1104, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L350](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-350-0) (line 350, col 0, score 1)
- [komorebi-group-window-hack — L385](komorebi-group-window-hack.md#^ref-dd89372d-385-0) (line 385, col 0, score 0.97)
- [Promethean Infrastructure Setup — L969](promethean-infrastructure-setup.md#^ref-6deed6ac-969-0) (line 969, col 0, score 0.97)
- [Chroma Toolkit Consolidation Plan — L362](chroma-toolkit-consolidation-plan.md#^ref-5020e892-362-0) (line 362, col 0, score 0.97)
- [Migrate to Provider-Tenant Architecture — L917](migrate-to-provider-tenant-architecture.md#^ref-54382370-917-0) (line 917, col 0, score 0.97)
- [zero-copy-snapshots-and-workers — L573](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-573-0) (line 573, col 0, score 0.97)
- [Agent Tasks: Persistence Migration to DualStore — L470](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-470-0) (line 470, col 0, score 0.97)
- [Functional Refactor of TypeScript Document Processing — L315](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-315-0) (line 315, col 0, score 0.97)
- [graph-ds — L612](graph-ds.md#^ref-6620e2f2-612-0) (line 612, col 0, score 1)
- [field-interaction-equations — L633](field-interaction-equations.md#^ref-b09141b7-633-0) (line 633, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L212](promethean-copilot-intent-engine.md#^ref-ae24a280-212-0) (line 212, col 0, score 0.99)
- [Promethean Pipelines — L308](promethean-pipelines.md#^ref-8b8e6103-308-0) (line 308, col 0, score 0.95)
- [homeostasis-decay-formulas — L617](homeostasis-decay-formulas.md#^ref-37b5d236-617-0) (line 617, col 0, score 0.95)
- [Migrate to Provider-Tenant Architecture — L435](migrate-to-provider-tenant-architecture.md#^ref-54382370-435-0) (line 435, col 0, score 0.95)
- [Prometheus Observability Stack — L789](prometheus-observability-stack.md#^ref-e90b5a16-789-0) (line 789, col 0, score 0.95)
- [Tracing the Signal — L422](tracing-the-signal.md#^ref-c3cd4f65-422-0) (line 422, col 0, score 0.95)
- [graph-ds — L611](graph-ds.md#^ref-6620e2f2-611-0) (line 611, col 0, score 1)
- [eidolon-field-math-foundations — L297](eidolon-field-math-foundations.md#^ref-008f2ac0-297-0) (line 297, col 0, score 1)
- [The Jar of Echoes — L2941](the-jar-of-echoes.md#^ref-18138627-2941-0) (line 2941, col 0, score 0.97)
- [Promethean Dev Workflow Update — L3165](promethean-dev-workflow-update.md#^ref-03a5578f-3165-0) (line 3165, col 0, score 0.96)
- [windows-tiling-with-autohotkey — L3175](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-3175-0) (line 3175, col 0, score 0.96)
- [The Jar of Echoes — L2529](the-jar-of-echoes.md#^ref-18138627-2529-0) (line 2529, col 0, score 0.95)
- [Promethean Documentation Pipeline Overview — L406](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-406-0) (line 406, col 0, score 0.95)
- [Promethean Dev Workflow Update — L3027](promethean-dev-workflow-update.md#^ref-03a5578f-3027-0) (line 3027, col 0, score 0.95)
- [Debugging Broker Connections and Agent Behavior — L295](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-295-0) (line 295, col 0, score 0.95)
- [Promethean Documentation Pipeline Overview — L401](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-401-0) (line 401, col 0, score 1)
- [Docops Feature Updates — L89](docops-feature-updates-3.md#^ref-cdbd21ee-89-0) (line 89, col 0, score 1)
- [Docops Feature Updates — L151](docops-feature-updates.md#^ref-2792d448-151-0) (line 151, col 0, score 1)
- [plan-update-confirmation — L1435](plan-update-confirmation.md#^ref-b22d79c6-1435-0) (line 1435, col 0, score 0.98)
- [Promethean Pipelines — L420](promethean-pipelines.md#^ref-8b8e6103-420-0) (line 420, col 0, score 0.98)
- [Docops Feature Updates — L119](docops-feature-updates.md#^ref-2792d448-119-0) (line 119, col 0, score 0.98)
- [Factorio AI with External Agents — L495](factorio-ai-with-external-agents.md#^ref-a4d90289-495-0) (line 495, col 0, score 0.98)
- [ParticleSimulationWithCanvasAndFFmpeg — L535](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-535-0) (line 535, col 0, score 0.98)
- [plan-update-confirmation — L1770](plan-update-confirmation.md#^ref-b22d79c6-1770-0) (line 1770, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L371](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-371-0) (line 371, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L811](migrate-to-provider-tenant-architecture.md#^ref-54382370-811-0) (line 811, col 0, score 1)
- [Dynamic Context Model for Web Components — L1100](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1100-0) (line 1100, col 0, score 1)
- [windows-tiling-with-autohotkey — L372](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-372-0) (line 372, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L222](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-222-0) (line 222, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration — L221](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-221-0) (line 221, col 0, score 0.99)
- [Obsidian Templating Plugins Integration Guide — L294](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-294-0) (line 294, col 0, score 0.99)
- [DSL — L426](chunks/dsl.md#^ref-e87bc036-426-0) (line 426, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L485](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-485-0) (line 485, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L463](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-463-0) (line 463, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L502](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-502-0) (line 502, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L542](promethean-copilot-intent-engine.md#^ref-ae24a280-542-0) (line 542, col 0, score 1)
- [Promethean Pipelines — L411](promethean-pipelines.md#^ref-8b8e6103-411-0) (line 411, col 0, score 1)
- [Promethean State Format — L446](promethean-state-format.md#^ref-23df6ddb-446-0) (line 446, col 0, score 1)
- [ts-to-lisp-transpiler — L407](ts-to-lisp-transpiler.md#^ref-ba11486b-407-0) (line 407, col 0, score 1)
- [Dynamic Context Model for Web Components — L1115](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1115-0) (line 1115, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L939](performance-optimized-polyglot-bridge.md#^ref-f5579967-939-0) (line 939, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L989](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-989-0) (line 989, col 0, score 0.97)
- [Duck's Attractor States — L1720](ducks-attractor-states.md#^ref-13951643-1720-0) (line 1720, col 0, score 0.97)
- [eidolon-field-math-foundations — L2092](eidolon-field-math-foundations.md#^ref-008f2ac0-2092-0) (line 2092, col 0, score 0.97)
- [Functional Refactor of TypeScript Document Processing — L684](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-684-0) (line 684, col 0, score 0.97)
- [Promethean Chat Activity Report — L489](promethean-chat-activity-report.md#^ref-18344cf9-489-0) (line 489, col 0, score 0.97)
- [Promethean Dev Workflow Update — L1181](promethean-dev-workflow-update.md#^ref-03a5578f-1181-0) (line 1181, col 0, score 0.97)
- [Docops Feature Updates — L90](docops-feature-updates-3.md#^ref-cdbd21ee-90-0) (line 90, col 0, score 1)
- [Docops Feature Updates — L140](docops-feature-updates.md#^ref-2792d448-140-0) (line 140, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L400](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-400-0) (line 400, col 0, score 1)
- [Dynamic Context Model for Web Components — L1117](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1117-0) (line 1117, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L940](performance-optimized-polyglot-bridge.md#^ref-f5579967-940-0) (line 940, col 0, score 1)
- [plan-update-confirmation — L1723](plan-update-confirmation.md#^ref-b22d79c6-1723-0) (line 1723, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L704](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-704-0) (line 704, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L833](performance-optimized-polyglot-bridge.md#^ref-f5579967-833-0) (line 833, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration Guide — L158](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-158-0) (line 158, col 0, score 1)
- [windows-tiling-with-autohotkey — L2939](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2939-0) (line 2939, col 0, score 0.97)
- [Promethean Dev Workflow Update — L2043](promethean-dev-workflow-update.md#^ref-03a5578f-2043-0) (line 2043, col 0, score 0.9)
- [eidolon-field-math-foundations — L1852](eidolon-field-math-foundations.md#^ref-008f2ac0-1852-0) (line 1852, col 0, score 0.9)
- [Functional Refactor of TypeScript Document Processing — L757](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-757-0) (line 757, col 0, score 0.9)
- [Promethean Dev Workflow Update — L1524](promethean-dev-workflow-update.md#^ref-03a5578f-1524-0) (line 1524, col 0, score 0.9)
- [eidolon-field-math-foundations — L1762](eidolon-field-math-foundations.md#^ref-008f2ac0-1762-0) (line 1762, col 0, score 0.89)
- [Functional Refactor of TypeScript Document Processing — L1119](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-1119-0) (line 1119, col 0, score 0.89)
- [Promethean Chat Activity Report — L627](promethean-chat-activity-report.md#^ref-18344cf9-627-0) (line 627, col 0, score 0.89)
- [Promethean Dev Workflow Update — L1309](promethean-dev-workflow-update.md#^ref-03a5578f-1309-0) (line 1309, col 0, score 0.89)
- [Docops Feature Updates — L136](docops-feature-updates.md#^ref-2792d448-136-0) (line 136, col 0, score 1)
- [Fnord Tracer Protocol — L751](fnord-tracer-protocol.md#^ref-fc21f824-751-0) (line 751, col 0, score 0.98)
- [Agent Tasks: Persistence Migration to DualStore — L425](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-425-0) (line 425, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L999](dynamic-context-model-for-web-components.md#^ref-f7702bf8-999-0) (line 999, col 0, score 0.98)
- [Chroma Toolkit Consolidation Plan — L383](chroma-toolkit-consolidation-plan.md#^ref-5020e892-383-0) (line 383, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L646](dynamic-context-model-for-web-components.md#^ref-f7702bf8-646-0) (line 646, col 0, score 0.98)
- [Duck's Attractor States — L275](ducks-attractor-states.md#^ref-13951643-275-0) (line 275, col 0, score 0.98)
- [Performance-Optimized-Polyglot-Bridge — L635](performance-optimized-polyglot-bridge.md#^ref-f5579967-635-0) (line 635, col 0, score 0.98)
- [Factorio AI with External Agents — L491](factorio-ai-with-external-agents.md#^ref-a4d90289-491-0) (line 491, col 0, score 0.98)
- [Chroma Toolkit Consolidation Plan — L388](chroma-toolkit-consolidation-plan.md#^ref-5020e892-388-0) (line 388, col 0, score 0.98)
- [Promethean Pipelines — L324](promethean-pipelines.md#^ref-8b8e6103-324-0) (line 324, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L413](layer1survivabilityenvelope.md#^ref-64a9f9f9-413-0) (line 413, col 0, score 1)
- [schema-evolution-workflow — L980](schema-evolution-workflow.md#^ref-d8059b6a-980-0) (line 980, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L296](model-upgrade-calm-down-guide.md#^ref-db74343f-296-0) (line 296, col 0, score 1)
- [typed-struct-compiler — L590](typed-struct-compiler.md#^ref-78eeedf7-590-0) (line 590, col 0, score 0.98)
- [zero-copy-snapshots-and-workers — L517](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-517-0) (line 517, col 0, score 0.98)
- [ParticleSimulationWithCanvasAndFFmpeg — L396](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-396-0) (line 396, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L714](migrate-to-provider-tenant-architecture.md#^ref-54382370-714-0) (line 714, col 0, score 0.98)
- [Provider-Agnostic Chat Panel Implementation — L437](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-437-0) (line 437, col 0, score 1)
- [Docops Feature Updates — L88](docops-feature-updates-3.md#^ref-cdbd21ee-88-0) (line 88, col 0, score 1)
- [Docops Feature Updates — L134](docops-feature-updates.md#^ref-2792d448-134-0) (line 134, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L649](performance-optimized-polyglot-bridge.md#^ref-f5579967-649-0) (line 649, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L353](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-353-0) (line 353, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L399](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-399-0) (line 399, col 0, score 0.99)
- [Agent Reflections and Prompt Evolution — L310](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-310-0) (line 310, col 0, score 0.99)
- [schema-evolution-workflow — L987](schema-evolution-workflow.md#^ref-d8059b6a-987-0) (line 987, col 0, score 0.99)
- [Layer1SurvivabilityEnvelope — L412](layer1survivabilityenvelope.md#^ref-64a9f9f9-412-0) (line 412, col 0, score 0.99)
- [plan-update-confirmation — L1547](plan-update-confirmation.md#^ref-b22d79c6-1547-0) (line 1547, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L299](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-299-0) (line 299, col 0, score 1)
- [Docops Feature Updates — L133](docops-feature-updates.md#^ref-2792d448-133-0) (line 133, col 0, score 1)
- [Dynamic Context Model for Web Components — L1130](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1130-0) (line 1130, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L343](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-343-0) (line 343, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L618](performance-optimized-polyglot-bridge.md#^ref-f5579967-618-0) (line 618, col 0, score 1)
- [Pure TypeScript Search Microservice — L750](pure-typescript-search-microservice.md#^ref-d17d3a96-750-0) (line 750, col 0, score 0.97)
- [Layer1SurvivabilityEnvelope — L508](layer1survivabilityenvelope.md#^ref-64a9f9f9-508-0) (line 508, col 0, score 0.97)
- [Duck's Self-Referential Perceptual Loop — L399](ducks-self-referential-perceptual-loop.md#^ref-71726f04-399-0) (line 399, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L1442](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1442-0) (line 1442, col 0, score 0.99)
- [Eidolon Field Abstract Model — L873](eidolon-field-abstract-model.md#^ref-5e8b2388-873-0) (line 873, col 0, score 0.99)
- [eidolon-node-lifecycle — L404](eidolon-node-lifecycle.md#^ref-938eca9c-404-0) (line 404, col 0, score 0.99)
- [field-dynamics-math-blocks — L925](field-dynamics-math-blocks.md#^ref-7cfc230d-925-0) (line 925, col 0, score 0.99)
- [field-interaction-equations — L762](field-interaction-equations.md#^ref-b09141b7-762-0) (line 762, col 0, score 0.99)
- [field-node-diagram-outline — L646](field-node-diagram-outline.md#^ref-1f32c94a-646-0) (line 646, col 0, score 0.99)
- [field-node-diagram-set — L629](field-node-diagram-set.md#^ref-22b989d5-629-0) (line 629, col 0, score 0.99)
- [field-node-diagram-visualizations — L519](field-node-diagram-visualizations.md#^ref-e9b27b06-519-0) (line 519, col 0, score 0.99)
- [Fnord Tracer Protocol — L955](fnord-tracer-protocol.md#^ref-fc21f824-955-0) (line 955, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L1443](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1443-0) (line 1443, col 0, score 0.99)
- [Promethean State Format — L500](promethean-state-format.md#^ref-23df6ddb-500-0) (line 500, col 0, score 0.99)
- [Prometheus Observability Stack — L1025](prometheus-observability-stack.md#^ref-e90b5a16-1025-0) (line 1025, col 0, score 0.99)
- [Prompt_Folder_Bootstrap — L756](prompt-folder-bootstrap.md#^ref-bd4f0976-756-0) (line 756, col 0, score 0.99)
- [Protocol_0_The_Contradiction_Engine — L660](protocol-0-the-contradiction-engine.md#^ref-9a93a756-660-0) (line 660, col 0, score 0.99)
- [Provider-Agnostic Chat Panel Implementation — L756](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-756-0) (line 756, col 0, score 0.99)
- [Reawakening Duck — L651](reawakening-duck.md#^ref-59b5670f-651-0) (line 651, col 0, score 0.99)
- [ripple-propagation-demo — L567](ripple-propagation-demo.md#^ref-8430617b-567-0) (line 567, col 0, score 0.99)
- [schema-evolution-workflow — L1085](schema-evolution-workflow.md#^ref-d8059b6a-1085-0) (line 1085, col 0, score 0.99)
- [Promethean State Format — L501](promethean-state-format.md#^ref-23df6ddb-501-0) (line 501, col 0, score 0.99)
- [Prometheus Observability Stack — L1026](prometheus-observability-stack.md#^ref-e90b5a16-1026-0) (line 1026, col 0, score 0.99)
- [Prompt_Folder_Bootstrap — L757](prompt-folder-bootstrap.md#^ref-bd4f0976-757-0) (line 757, col 0, score 0.99)
- [Protocol_0_The_Contradiction_Engine — L661](protocol-0-the-contradiction-engine.md#^ref-9a93a756-661-0) (line 661, col 0, score 0.99)
- [Provider-Agnostic Chat Panel Implementation — L757](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-757-0) (line 757, col 0, score 0.99)
- [Reawakening Duck — L652](reawakening-duck.md#^ref-59b5670f-652-0) (line 652, col 0, score 0.99)
- [ripple-propagation-demo — L568](ripple-propagation-demo.md#^ref-8430617b-568-0) (line 568, col 0, score 0.99)
- [schema-evolution-workflow — L1086](schema-evolution-workflow.md#^ref-d8059b6a-1086-0) (line 1086, col 0, score 0.99)
- [Fnord Tracer Protocol — L958](fnord-tracer-protocol.md#^ref-fc21f824-958-0) (line 958, col 0, score 0.99)
- [i3-bluetooth-setup — L603](i3-bluetooth-setup.md#^ref-5e408692-603-0) (line 603, col 0, score 0.99)
- [Layer1SurvivabilityEnvelope — L780](layer1survivabilityenvelope.md#^ref-64a9f9f9-780-0) (line 780, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L1216](migrate-to-provider-tenant-architecture.md#^ref-54382370-1216-0) (line 1216, col 0, score 0.99)
- [Model Selection for Lightweight Conversational Tasks — L660](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-660-0) (line 660, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration Guide — L311](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-311-0) (line 311, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration — L297](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-297-0) (line 297, col 0, score 0.99)
- [obsidian-ignore-node-modules-regex — L363](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-363-0) (line 363, col 0, score 0.99)
- [Obsidian Templating Plugins Integration Guide — L531](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-531-0) (line 531, col 0, score 0.99)
- [Optimizing Command Limitations in System Design — L321](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-321-0) (line 321, col 0, score 0.99)
- [ParticleSimulationWithCanvasAndFFmpeg — L751](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-751-0) (line 751, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L1120](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-1120-0) (line 1120, col 0, score 0.99)
- [Promethean State Format — L503](promethean-state-format.md#^ref-23df6ddb-503-0) (line 503, col 0, score 0.99)
- [Prometheus Observability Stack — L1028](prometheus-observability-stack.md#^ref-e90b5a16-1028-0) (line 1028, col 0, score 0.99)
- [Prompt_Folder_Bootstrap — L759](prompt-folder-bootstrap.md#^ref-bd4f0976-759-0) (line 759, col 0, score 0.99)
- [Protocol_0_The_Contradiction_Engine — L663](protocol-0-the-contradiction-engine.md#^ref-9a93a756-663-0) (line 663, col 0, score 0.99)
- [Provider-Agnostic Chat Panel Implementation — L759](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-759-0) (line 759, col 0, score 0.99)
- [Reawakening Duck — L654](reawakening-duck.md#^ref-59b5670f-654-0) (line 654, col 0, score 0.99)
- [ripple-propagation-demo — L570](ripple-propagation-demo.md#^ref-8430617b-570-0) (line 570, col 0, score 0.99)
- [schema-evolution-workflow — L1088](schema-evolution-workflow.md#^ref-d8059b6a-1088-0) (line 1088, col 0, score 0.99)
- [sibilant-macro-targets — L633](sibilant-macro-targets.md#^ref-c5c9a5c6-633-0) (line 633, col 0, score 0.99)
- [Fnord Tracer Protocol — L960](fnord-tracer-protocol.md#^ref-fc21f824-960-0) (line 960, col 0, score 0.99)
- [homeostasis-decay-formulas — L887](homeostasis-decay-formulas.md#^ref-37b5d236-887-0) (line 887, col 0, score 0.99)
- [i3-bluetooth-setup — L605](i3-bluetooth-setup.md#^ref-5e408692-605-0) (line 605, col 0, score 0.99)
- [Ice Box Reorganization — L581](ice-box-reorganization.md#^ref-291c7d91-581-0) (line 581, col 0, score 0.99)
- [komorebi-group-window-hack — L664](komorebi-group-window-hack.md#^ref-dd89372d-664-0) (line 664, col 0, score 0.99)
- [Layer1SurvivabilityEnvelope — L782](layer1survivabilityenvelope.md#^ref-64a9f9f9-782-0) (line 782, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L1218](migrate-to-provider-tenant-architecture.md#^ref-54382370-1218-0) (line 1218, col 0, score 0.99)
- [Model Selection for Lightweight Conversational Tasks — L662](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-662-0) (line 662, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration Guide — L313](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-313-0) (line 313, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration — L299](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-299-0) (line 299, col 0, score 0.99)
- [obsidian-ignore-node-modules-regex — L365](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-365-0) (line 365, col 0, score 0.99)
- [Optimizing Command Limitations in System Design — L323](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-323-0) (line 323, col 0, score 0.99)
- [ParticleSimulationWithCanvasAndFFmpeg — L753](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-753-0) (line 753, col 0, score 0.99)
- [field-node-diagram-set — L635](field-node-diagram-set.md#^ref-22b989d5-635-0) (line 635, col 0, score 0.99)
- [field-node-diagram-visualizations — L525](field-node-diagram-visualizations.md#^ref-e9b27b06-525-0) (line 525, col 0, score 0.99)
- [Fnord Tracer Protocol — L961](fnord-tracer-protocol.md#^ref-fc21f824-961-0) (line 961, col 0, score 0.99)
- [graph-ds — L983](graph-ds.md#^ref-6620e2f2-983-0) (line 983, col 0, score 0.99)
- [heartbeat-fragment-demo — L562](heartbeat-fragment-demo.md#^ref-dd00677a-562-0) (line 562, col 0, score 0.99)
- [homeostasis-decay-formulas — L888](homeostasis-decay-formulas.md#^ref-37b5d236-888-0) (line 888, col 0, score 0.99)
- [i3-bluetooth-setup — L606](i3-bluetooth-setup.md#^ref-5e408692-606-0) (line 606, col 0, score 0.99)
- [Ice Box Reorganization — L582](ice-box-reorganization.md#^ref-291c7d91-582-0) (line 582, col 0, score 0.99)
- [komorebi-group-window-hack — L665](komorebi-group-window-hack.md#^ref-dd89372d-665-0) (line 665, col 0, score 0.99)
- [Promethean State Format — L506](promethean-state-format.md#^ref-23df6ddb-506-0) (line 506, col 0, score 0.98)
- [Prometheus Observability Stack — L1031](prometheus-observability-stack.md#^ref-e90b5a16-1031-0) (line 1031, col 0, score 0.98)
- [Prompt_Folder_Bootstrap — L762](prompt-folder-bootstrap.md#^ref-bd4f0976-762-0) (line 762, col 0, score 0.98)
- [Protocol_0_The_Contradiction_Engine — L666](protocol-0-the-contradiction-engine.md#^ref-9a93a756-666-0) (line 666, col 0, score 0.98)
- [Provider-Agnostic Chat Panel Implementation — L762](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-762-0) (line 762, col 0, score 1)
- [Reawakening Duck — L657](reawakening-duck.md#^ref-59b5670f-657-0) (line 657, col 0, score 1)
- [ripple-propagation-demo — L573](ripple-propagation-demo.md#^ref-8430617b-573-0) (line 573, col 0, score 1)
- [schema-evolution-workflow — L1091](schema-evolution-workflow.md#^ref-d8059b6a-1091-0) (line 1091, col 0, score 1)
- [sibilant-macro-targets — L636](sibilant-macro-targets.md#^ref-c5c9a5c6-636-0) (line 636, col 0, score 1)
- [windows-tiling-with-autohotkey — L342](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-342-0) (line 342, col 0, score 0.97)
- [Stateful Partitions and Rebalancing — L906](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-906-0) (line 906, col 0, score 0.97)
- [Dynamic Context Model for Web Components — L923](dynamic-context-model-for-web-components.md#^ref-f7702bf8-923-0) (line 923, col 0, score 0.97)
- [typed-struct-compiler — L581](typed-struct-compiler.md#^ref-78eeedf7-581-0) (line 581, col 0, score 0.99)
- [typed-struct-compiler — L580](typed-struct-compiler.md#^ref-78eeedf7-580-0) (line 580, col 0, score 0.99)
- [typed-struct-compiler — L573](typed-struct-compiler.md#^ref-78eeedf7-573-0) (line 573, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L1207](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1207-0) (line 1207, col 0, score 0.98)
- [Self-Agency in AI Interaction — L312](self-agency-in-ai-interaction.md#^ref-49a9a860-312-0) (line 312, col 0, score 0.98)
- [Promethean Documentation Pipeline Overview — L443](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-443-0) (line 443, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L107](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-107-0) (line 107, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L391](promethean-copilot-intent-engine.md#^ref-ae24a280-391-0) (line 391, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L329](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-329-0) (line 329, col 0, score 1)
- [Unique Info Dump Index — L557](unique-info-dump-index.md#^ref-30ec3ba6-557-0) (line 557, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L227](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-227-0) (line 227, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L399](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-399-0) (line 399, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L760](migrate-to-provider-tenant-architecture.md#^ref-54382370-760-0) (line 760, col 0, score 0.98)
- [Chroma Toolkit Consolidation Plan — L339](chroma-toolkit-consolidation-plan.md#^ref-5020e892-339-0) (line 339, col 0, score 1)
- [graph-ds — L554](graph-ds.md#^ref-6620e2f2-554-0) (line 554, col 0, score 1)
- [Promethean Pipelines — L291](promethean-pipelines.md#^ref-8b8e6103-291-0) (line 291, col 0, score 1)
- [typed-struct-compiler — L623](typed-struct-compiler.md#^ref-78eeedf7-623-0) (line 623, col 0, score 1)
- [Promethean Infrastructure Setup — L940](promethean-infrastructure-setup.md#^ref-6deed6ac-940-0) (line 940, col 0, score 0.96)
- [typed-struct-compiler — L578](typed-struct-compiler.md#^ref-78eeedf7-578-0) (line 578, col 0, score 0.93)
- [Migrate to Provider-Tenant Architecture — L968](migrate-to-provider-tenant-architecture.md#^ref-54382370-968-0) (line 968, col 0, score 0.93)
- [sibilant-macro-targets — L528](sibilant-macro-targets.md#^ref-c5c9a5c6-528-0) (line 528, col 0, score 0.93)
- [graph-ds — L555](graph-ds.md#^ref-6620e2f2-555-0) (line 555, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L340](chroma-toolkit-consolidation-plan.md#^ref-5020e892-340-0) (line 340, col 0, score 1)
- [Promethean Pipelines — L292](promethean-pipelines.md#^ref-8b8e6103-292-0) (line 292, col 0, score 1)
- [typed-struct-compiler — L624](typed-struct-compiler.md#^ref-78eeedf7-624-0) (line 624, col 0, score 1)
- [i3-bluetooth-setup — L381](i3-bluetooth-setup.md#^ref-5e408692-381-0) (line 381, col 0, score 0.98)
- [Promethean Dev Workflow Update — L2610](promethean-dev-workflow-update.md#^ref-03a5578f-2610-0) (line 2610, col 0, score 0.96)
- [i3-bluetooth-setup — L350](i3-bluetooth-setup.md#^ref-5e408692-350-0) (line 350, col 0, score 0.96)
- [Tracing the Signal — L420](tracing-the-signal.md#^ref-c3cd4f65-420-0) (line 420, col 0, score 0.96)
- [Promethean Pipelines — L293](promethean-pipelines.md#^ref-8b8e6103-293-0) (line 293, col 0, score 1)
- [typed-struct-compiler — L625](typed-struct-compiler.md#^ref-78eeedf7-625-0) (line 625, col 0, score 1)
- [Dynamic Context Model for Web Components — L1228](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1228-0) (line 1228, col 0, score 0.98)
- [ChatGPT Custom Prompts — L106](chatgpt-custom-prompts.md#^ref-930054b3-106-0) (line 106, col 0, score 0.97)
- [Promethean Infrastructure Setup — L855](promethean-infrastructure-setup.md#^ref-6deed6ac-855-0) (line 855, col 0, score 0.97)
- [Dynamic Context Model for Web Components — L925](dynamic-context-model-for-web-components.md#^ref-f7702bf8-925-0) (line 925, col 0, score 1)
- [Promethean Pipelines — L290](promethean-pipelines.md#^ref-8b8e6103-290-0) (line 290, col 0, score 1)
- [typed-struct-compiler — L583](typed-struct-compiler.md#^ref-78eeedf7-583-0) (line 583, col 0, score 1)
- [plan-update-confirmation — L1626](plan-update-confirmation.md#^ref-b22d79c6-1626-0) (line 1626, col 0, score 1)
- [windows-tiling-with-autohotkey — L1952](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-1952-0) (line 1952, col 0, score 0.97)
- [Promethean Dev Workflow Update — L1933](promethean-dev-workflow-update.md#^ref-03a5578f-1933-0) (line 1933, col 0, score 0.97)
- [Factorio AI with External Agents — L391](factorio-ai-with-external-agents.md#^ref-a4d90289-391-0) (line 391, col 0, score 0.97)
- [Promethean Infrastructure Setup — L1064](promethean-infrastructure-setup.md#^ref-6deed6ac-1064-0) (line 1064, col 0, score 0.97)
- [obsidian-ignore-node-modules-regex — L218](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-218-0) (line 218, col 0, score 0.97)
- [ChatGPT Custom Prompts — L110](chatgpt-custom-prompts.md#^ref-930054b3-110-0) (line 110, col 0, score 1)
- [plan-update-confirmation — L1743](plan-update-confirmation.md#^ref-b22d79c6-1743-0) (line 1743, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L345](model-upgrade-calm-down-guide.md#^ref-db74343f-345-0) (line 345, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L234](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-234-0) (line 234, col 0, score 1)
- [Duck's Attractor States — L2224](ducks-attractor-states.md#^ref-13951643-2224-0) (line 2224, col 0, score 0.95)
- [Canonical Org-Babel Matplotlib Animation Template — L689](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-689-0) (line 689, col 0, score 0.95)
- [eidolon-field-math-foundations — L1104](eidolon-field-math-foundations.md#^ref-008f2ac0-1104-0) (line 1104, col 0, score 0.95)
- [Promethean Chat Activity Report — L1020](promethean-chat-activity-report.md#^ref-18344cf9-1020-0) (line 1020, col 0, score 0.95)
- [Promethean-Copilot-Intent-Engine — L476](promethean-copilot-intent-engine.md#^ref-ae24a280-476-0) (line 476, col 0, score 1)
- [Docops Feature Updates — L142](docops-feature-updates.md#^ref-2792d448-142-0) (line 142, col 0, score 0.98)
- [Performance-Optimized-Polyglot-Bridge — L699](performance-optimized-polyglot-bridge.md#^ref-f5579967-699-0) (line 699, col 0, score 0.97)
- [sibilant-macro-targets — L569](sibilant-macro-targets.md#^ref-c5c9a5c6-569-0) (line 569, col 0, score 0.97)
- [graph-ds — L574](graph-ds.md#^ref-6620e2f2-574-0) (line 574, col 0, score 0.97)
- [Provider-Agnostic Chat Panel Implementation — L515](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-515-0) (line 515, col 0, score 0.97)
- [sibilant-macro-targets — L536](sibilant-macro-targets.md#^ref-c5c9a5c6-536-0) (line 536, col 0, score 0.97)
- [Model Upgrade Calm-Down Guide — L228](model-upgrade-calm-down-guide.md#^ref-db74343f-228-0) (line 228, col 0, score 0.97)
- [Promethean Pipelines — L352](promethean-pipelines.md#^ref-8b8e6103-352-0) (line 352, col 0, score 0.96)
- [Admin Dashboard for User Management — L266](admin-dashboard-for-user-management.md#^ref-2901a3e9-266-0) (line 266, col 0, score 0.96)
- [Debugging Broker Connections and Agent Behavior — L231](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-231-0) (line 231, col 0, score 1)
- [windows-tiling-with-autohotkey — L354](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-354-0) (line 354, col 0, score 1)
- [ChatGPT Custom Prompts — L116](chatgpt-custom-prompts.md#^ref-930054b3-116-0) (line 116, col 0, score 1)
- [typed-struct-compiler — L577](typed-struct-compiler.md#^ref-78eeedf7-577-0) (line 577, col 0, score 1)
- [Promethean Dev Workflow Update — L222](promethean-dev-workflow-update.md#^ref-03a5578f-222-0) (line 222, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L586](migrate-to-provider-tenant-architecture.md#^ref-54382370-586-0) (line 586, col 0, score 1)
- [typed-struct-compiler — L574](typed-struct-compiler.md#^ref-78eeedf7-574-0) (line 574, col 0, score 0.99)
- [Promethean Dev Workflow Update — L234](promethean-dev-workflow-update.md#^ref-03a5578f-234-0) (line 234, col 0, score 0.98)
- [Pure TypeScript Search Microservice — L837](pure-typescript-search-microservice.md#^ref-d17d3a96-837-0) (line 837, col 0, score 0.99)
- [ChatGPT Custom Prompts — L121](chatgpt-custom-prompts.md#^ref-930054b3-121-0) (line 121, col 0, score 0.99)
- [Functional Refactor of TypeScript Document Processing — L364](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-364-0) (line 364, col 0, score 0.99)
- [polyglot-repl-interface-layer — L349](polyglot-repl-interface-layer.md#^ref-9c79206d-349-0) (line 349, col 0, score 0.99)
- [Promethean Pipelines — L425](promethean-pipelines.md#^ref-8b8e6103-425-0) (line 425, col 0, score 0.99)
- [plan-update-confirmation — L1758](plan-update-confirmation.md#^ref-b22d79c6-1758-0) (line 1758, col 0, score 0.99)
- [i3-bluetooth-setup — L398](i3-bluetooth-setup.md#^ref-5e408692-398-0) (line 398, col 0, score 0.99)
- [Provider-Agnostic Chat Panel Implementation — L385](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-385-0) (line 385, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L1020](migrate-to-provider-tenant-architecture.md#^ref-54382370-1020-0) (line 1020, col 0, score 0.99)
- [Prompt_Folder_Bootstrap — L418](prompt-folder-bootstrap.md#^ref-bd4f0976-418-0) (line 418, col 0, score 1)
- [windows-tiling-with-autohotkey — L390](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-390-0) (line 390, col 0, score 1)
- [Reawakening Duck — L294](reawakening-duck.md#^ref-59b5670f-294-0) (line 294, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L190](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-190-0) (line 190, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L477](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-477-0) (line 477, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L805](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-805-0) (line 805, col 0, score 1)
- [Promethean Pipelines — L531](promethean-pipelines.md#^ref-8b8e6103-531-0) (line 531, col 0, score 1)
- [Redirecting Standard Error — L144](redirecting-standard-error.md#^ref-b3555ede-144-0) (line 144, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L367](protocol-0-the-contradiction-engine.md#^ref-9a93a756-367-0) (line 367, col 0, score 1)
- [Promethean Dev Workflow Update — L331](promethean-dev-workflow-update.md#^ref-03a5578f-331-0) (line 331, col 0, score 1)
- [The Jar of Echoes — L341](the-jar-of-echoes.md#^ref-18138627-341-0) (line 341, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L118](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-118-0) (line 118, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L258](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-258-0) (line 258, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L242](ducks-self-referential-perceptual-loop.md#^ref-71726f04-242-0) (line 242, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L446](layer1survivabilityenvelope.md#^ref-64a9f9f9-446-0) (line 446, col 0, score 1)
- [Reawakening Duck — L461](reawakening-duck.md#^ref-59b5670f-461-0) (line 461, col 0, score 1)
- [The Jar of Echoes — L403](the-jar-of-echoes.md#^ref-18138627-403-0) (line 403, col 0, score 1)
- [The Jar of Echoes — L389](the-jar-of-echoes.md#^ref-18138627-389-0) (line 389, col 0, score 0.98)
- [The Jar of Echoes — L438](the-jar-of-echoes.md#^ref-18138627-438-0) (line 438, col 0, score 0.98)
- [Layer1SurvivabilityEnvelope — L440](layer1survivabilityenvelope.md#^ref-64a9f9f9-440-0) (line 440, col 0, score 1)
- [plan-update-confirmation — L1396](plan-update-confirmation.md#^ref-b22d79c6-1396-0) (line 1396, col 0, score 1)
- [Dynamic Context Model for Web Components — L1024](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1024-0) (line 1024, col 0, score 0.98)
- [obsidian-ignore-node-modules-regex — L253](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-253-0) (line 253, col 0, score 0.98)
- [Model Upgrade Calm-Down Guide — L227](model-upgrade-calm-down-guide.md#^ref-db74343f-227-0) (line 227, col 0, score 0.98)
- [ParticleSimulationWithCanvasAndFFmpeg — L559](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-559-0) (line 559, col 0, score 0.98)
- [Promethean Infrastructure Setup — L1088](promethean-infrastructure-setup.md#^ref-6deed6ac-1088-0) (line 1088, col 0, score 0.98)
- [eidolon-field-math-foundations — L518](eidolon-field-math-foundations.md#^ref-008f2ac0-518-0) (line 518, col 0, score 0.98)
- [Protocol_0_The_Contradiction_Engine — L361](protocol-0-the-contradiction-engine.md#^ref-9a93a756-361-0) (line 361, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L983](performance-optimized-polyglot-bridge.md#^ref-f5579967-983-0) (line 983, col 0, score 1)
- [Admin Dashboard for User Management — L319](admin-dashboard-for-user-management.md#^ref-2901a3e9-319-0) (line 319, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L305](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-305-0) (line 305, col 0, score 1)
- [The Jar of Echoes — L404](the-jar-of-echoes.md#^ref-18138627-404-0) (line 404, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L448](layer1survivabilityenvelope.md#^ref-64a9f9f9-448-0) (line 448, col 0, score 1)
- [eidolon-node-lifecycle — L182](eidolon-node-lifecycle.md#^ref-938eca9c-182-0) (line 182, col 0, score 0.98)
- [field-node-diagram-outline — L327](field-node-diagram-outline.md#^ref-1f32c94a-327-0) (line 327, col 0, score 0.98)
- [Protocol_0_The_Contradiction_Engine — L363](protocol-0-the-contradiction-engine.md#^ref-9a93a756-363-0) (line 363, col 0, score 1)
- [Admin Dashboard for User Management — L321](admin-dashboard-for-user-management.md#^ref-2901a3e9-321-0) (line 321, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L307](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-307-0) (line 307, col 0, score 1)
- [The Jar of Echoes — L406](the-jar-of-echoes.md#^ref-18138627-406-0) (line 406, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L255](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-255-0) (line 255, col 0, score 0.97)
- [Agent Tasks: Persistence Migration to DualStore — L486](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-486-0) (line 486, col 0, score 0.97)
- [Dynamic Context Model for Web Components — L904](dynamic-context-model-for-web-components.md#^ref-f7702bf8-904-0) (line 904, col 0, score 0.97)
- [Provider-Agnostic Chat Panel Implementation — L470](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-470-0) (line 470, col 0, score 0.97)
- [Protocol_0_The_Contradiction_Engine — L364](protocol-0-the-contradiction-engine.md#^ref-9a93a756-364-0) (line 364, col 0, score 1)
- [Admin Dashboard for User Management — L322](admin-dashboard-for-user-management.md#^ref-2901a3e9-322-0) (line 322, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L308](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-308-0) (line 308, col 0, score 1)
- [The Jar of Echoes — L407](the-jar-of-echoes.md#^ref-18138627-407-0) (line 407, col 0, score 1)
- [Reawakening Duck — L453](reawakening-duck.md#^ref-59b5670f-453-0) (line 453, col 0, score 0.96)
- [Agent Tasks: Persistence Migration to DualStore — L466](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-466-0) (line 466, col 0, score 0.96)
- [windows-tiling-with-autohotkey — L397](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-397-0) (line 397, col 0, score 0.96)
- [Promethean State Format — L317](promethean-state-format.md#^ref-23df6ddb-317-0) (line 317, col 0, score 0.96)
- [plan-update-confirmation — L1708](plan-update-confirmation.md#^ref-b22d79c6-1708-0) (line 1708, col 0, score 0.96)
- [Promethean-Copilot-Intent-Engine — L290](promethean-copilot-intent-engine.md#^ref-ae24a280-290-0) (line 290, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L249](ducks-self-referential-perceptual-loop.md#^ref-71726f04-249-0) (line 249, col 0, score 1)
- [Fnord Tracer Protocol — L439](fnord-tracer-protocol.md#^ref-fc21f824-439-0) (line 439, col 0, score 1)
- [The Jar of Echoes — L409](the-jar-of-echoes.md#^ref-18138627-409-0) (line 409, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L444](layer1survivabilityenvelope.md#^ref-64a9f9f9-444-0) (line 444, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L393](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-393-0) (line 393, col 0, score 1)
- [Dynamic Context Model for Web Components — L1261](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1261-0) (line 1261, col 0, score 1)
- [Promethean Workflow Optimization — L163](promethean-workflow-optimization.md#^ref-d614d983-163-0) (line 163, col 0, score 1)
- [Admin Dashboard for User Management — L326](admin-dashboard-for-user-management.md#^ref-2901a3e9-326-0) (line 326, col 0, score 1)
- [Self-Agency in AI Interaction — L236](self-agency-in-ai-interaction.md#^ref-49a9a860-236-0) (line 236, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L270](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-270-0) (line 270, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L345](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-345-0) (line 345, col 0, score 0.98)
- [Docops Feature Updates — L107](docops-feature-updates-3.md#^ref-cdbd21ee-107-0) (line 107, col 0, score 0.98)
- [Docops Feature Updates — L165](docops-feature-updates.md#^ref-2792d448-165-0) (line 165, col 0, score 0.98)
- [Promethean Chat Activity Report — L176](promethean-chat-activity-report.md#^ref-18344cf9-176-0) (line 176, col 0, score 0.98)
- [Pure TypeScript Search Microservice — L900](pure-typescript-search-microservice.md#^ref-d17d3a96-900-0) (line 900, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L910](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-910-0) (line 910, col 0, score 1)
- [graph-ds — L584](graph-ds.md#^ref-6620e2f2-584-0) (line 584, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L694](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-694-0) (line 694, col 0, score 1)
- [plan-update-confirmation — L1659](plan-update-confirmation.md#^ref-b22d79c6-1659-0) (line 1659, col 0, score 1)
- [Promethean Infrastructure Setup — L899](promethean-infrastructure-setup.md#^ref-6deed6ac-899-0) (line 899, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L713](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-713-0) (line 713, col 0, score 1)
- [Stateful Partitions and Rebalancing — L775](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-775-0) (line 775, col 0, score 1)
- [Dynamic Context Model for Web Components — L857](dynamic-context-model-for-web-components.md#^ref-f7702bf8-857-0) (line 857, col 0, score 1)
- [Promethean Pipelines — L523](promethean-pipelines.md#^ref-8b8e6103-523-0) (line 523, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L273](promethean-copilot-intent-engine.md#^ref-ae24a280-273-0) (line 273, col 0, score 1)
- [windows-tiling-with-autohotkey — L352](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-352-0) (line 352, col 0, score 0.97)
- [Duck's Attractor States — L1950](ducks-attractor-states.md#^ref-13951643-1950-0) (line 1950, col 0, score 0.96)
- [Dynamic Context Model for Web Components — L1648](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1648-0) (line 1648, col 0, score 0.96)
- [Promethean Infrastructure Setup — L1600](promethean-infrastructure-setup.md#^ref-6deed6ac-1600-0) (line 1600, col 0, score 0.96)
- [Canonical Org-Babel Matplotlib Animation Template — L756](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-756-0) (line 756, col 0, score 0.95)
- [Functional Refactor of TypeScript Document Processing — L327](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-327-0) (line 327, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L384](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-384-0) (line 384, col 0, score 1)
- [Dynamic Context Model for Web Components — L651](dynamic-context-model-for-web-components.md#^ref-f7702bf8-651-0) (line 651, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L388](promethean-copilot-intent-engine.md#^ref-ae24a280-388-0) (line 388, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L808](performance-optimized-polyglot-bridge.md#^ref-f5579967-808-0) (line 808, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L886](performance-optimized-polyglot-bridge.md#^ref-f5579967-886-0) (line 886, col 0, score 0.98)
- [typed-struct-compiler — L649](typed-struct-compiler.md#^ref-78eeedf7-649-0) (line 649, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L982](dynamic-context-model-for-web-components.md#^ref-f7702bf8-982-0) (line 982, col 0, score 0.98)
- [Promethean Documentation Pipeline Overview — L338](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-338-0) (line 338, col 0, score 1)
- [Docops Feature Updates — L92](docops-feature-updates-3.md#^ref-cdbd21ee-92-0) (line 92, col 0, score 1)
- [Docops Feature Updates — L153](docops-feature-updates.md#^ref-2792d448-153-0) (line 153, col 0, score 1)
- [Promethean Pipelines — L342](promethean-pipelines.md#^ref-8b8e6103-342-0) (line 342, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L654](performance-optimized-polyglot-bridge.md#^ref-f5579967-654-0) (line 654, col 0, score 1)
- [schema-evolution-workflow — L924](schema-evolution-workflow.md#^ref-d8059b6a-924-0) (line 924, col 0, score 0.99)
- [TypeScript Patch for Tool Calling Support — L900](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-900-0) (line 900, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L925](migrate-to-provider-tenant-architecture.md#^ref-54382370-925-0) (line 925, col 0, score 0.98)
- [Eidolon Field Abstract Model — L453](eidolon-field-abstract-model.md#^ref-5e8b2388-453-0) (line 453, col 0, score 0.99)
- [Promethean Infrastructure Setup — L1106](promethean-infrastructure-setup.md#^ref-6deed6ac-1106-0) (line 1106, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L410](chroma-toolkit-consolidation-plan.md#^ref-5020e892-410-0) (line 410, col 0, score 0.99)
- [Promethean Dev Workflow Update — L255](promethean-dev-workflow-update.md#^ref-03a5578f-255-0) (line 255, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L275](promethean-copilot-intent-engine.md#^ref-ae24a280-275-0) (line 275, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L652](performance-optimized-polyglot-bridge.md#^ref-f5579967-652-0) (line 652, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L351](chroma-toolkit-consolidation-plan.md#^ref-5020e892-351-0) (line 351, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L818](performance-optimized-polyglot-bridge.md#^ref-f5579967-818-0) (line 818, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L717](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-717-0) (line 717, col 0, score 1)
- [Promethean Dev Workflow Update — L399](promethean-dev-workflow-update.md#^ref-03a5578f-399-0) (line 399, col 0, score 1)
- [Duck's Attractor States — L288](ducks-attractor-states.md#^ref-13951643-288-0) (line 288, col 0, score 1)
- [Self-Agency in AI Interaction — L186](self-agency-in-ai-interaction.md#^ref-49a9a860-186-0) (line 186, col 0, score 1)
- [windows-tiling-with-autohotkey — L1911](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-1911-0) (line 1911, col 0, score 0.96)
- [Canonical Org-Babel Matplotlib Animation Template — L1176](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-1176-0) (line 1176, col 0, score 0.96)
- [Per-Domain Policy System for JS Crawler — L718](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-718-0) (line 718, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L819](performance-optimized-polyglot-bridge.md#^ref-f5579967-819-0) (line 819, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L577](migrate-to-provider-tenant-architecture.md#^ref-54382370-577-0) (line 577, col 0, score 1)
- [Promethean Dev Workflow Update — L401](promethean-dev-workflow-update.md#^ref-03a5578f-401-0) (line 401, col 0, score 1)
- [Self-Agency in AI Interaction — L184](self-agency-in-ai-interaction.md#^ref-49a9a860-184-0) (line 184, col 0, score 1)
- [Factorio AI with External Agents — L444](factorio-ai-with-external-agents.md#^ref-a4d90289-444-0) (line 444, col 0, score 0.98)
- [Agent Tasks: Persistence Migration to DualStore — L316](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-316-0) (line 316, col 0, score 0.98)
- [schema-evolution-workflow — L823](schema-evolution-workflow.md#^ref-d8059b6a-823-0) (line 823, col 0, score 0.98)
- [graph-ds — L541](graph-ds.md#^ref-6620e2f2-541-0) (line 541, col 0, score 0.98)
- [Chroma Toolkit Consolidation Plan — L352](chroma-toolkit-consolidation-plan.md#^ref-5020e892-352-0) (line 352, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L547](migrate-to-provider-tenant-architecture.md#^ref-54382370-547-0) (line 547, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L678](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-678-0) (line 678, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L817](performance-optimized-polyglot-bridge.md#^ref-f5579967-817-0) (line 817, col 0, score 1)
- [Self-Agency in AI Interaction — L190](self-agency-in-ai-interaction.md#^ref-49a9a860-190-0) (line 190, col 0, score 1)
- [Promethean Dev Workflow Update — L400](promethean-dev-workflow-update.md#^ref-03a5578f-400-0) (line 400, col 0, score 1)
- [Fnord Tracer Protocol — L461](fnord-tracer-protocol.md#^ref-fc21f824-461-0) (line 461, col 0, score 0.94)
- [komorebi-group-window-hack — L453](komorebi-group-window-hack.md#^ref-dd89372d-453-0) (line 453, col 0, score 0.98)
- [Chroma Toolkit Consolidation Plan — L357](chroma-toolkit-consolidation-plan.md#^ref-5020e892-357-0) (line 357, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L824](performance-optimized-polyglot-bridge.md#^ref-f5579967-824-0) (line 824, col 0, score 1)
- [Promethean Dev Workflow Update — L3136](promethean-dev-workflow-update.md#^ref-03a5578f-3136-0) (line 3136, col 0, score 0.98)
- [plan-update-confirmation — L1766](plan-update-confirmation.md#^ref-b22d79c6-1766-0) (line 1766, col 0, score 0.97)
- [Agent Tasks: Persistence Migration to DualStore — L444](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-444-0) (line 444, col 0, score 0.97)
- [Promethean-Copilot-Intent-Engine — L500](promethean-copilot-intent-engine.md#^ref-ae24a280-500-0) (line 500, col 0, score 0.97)
- [Promethean Dev Workflow Update — L226](promethean-dev-workflow-update.md#^ref-03a5578f-226-0) (line 226, col 0, score 0.97)
- [Model Upgrade Calm-Down Guide — L333](model-upgrade-calm-down-guide.md#^ref-db74343f-333-0) (line 333, col 0, score 0.97)
- [Promethean Pipelines — L332](promethean-pipelines.md#^ref-8b8e6103-332-0) (line 332, col 0, score 0.97)
- [Per-Domain Policy System for JS Crawler — L720](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-720-0) (line 720, col 0, score 1)
- [homeostasis-decay-formulas — L661](homeostasis-decay-formulas.md#^ref-37b5d236-661-0) (line 661, col 0, score 1)
- [Promethean Workflow Optimization — L121](promethean-workflow-optimization.md#^ref-d614d983-121-0) (line 121, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L149](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-149-0) (line 149, col 0, score 1)
- [Duck's Attractor States — L4270](ducks-attractor-states.md#^ref-13951643-4270-0) (line 4270, col 0, score 0.97)
- [Duck's Attractor States — L4278](ducks-attractor-states.md#^ref-13951643-4278-0) (line 4278, col 0, score 0.96)
- [Duck's Attractor States — L4286](ducks-attractor-states.md#^ref-13951643-4286-0) (line 4286, col 0, score 0.96)
- [Creative Moments — L1265](creative-moments.md#^ref-10d98225-1265-0) (line 1265, col 0, score 0.96)
- [Functional Refactor of TypeScript Document Processing — L368](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-368-0) (line 368, col 0, score 1)
- [field-dynamics-math-blocks — L473](field-dynamics-math-blocks.md#^ref-7cfc230d-473-0) (line 473, col 0, score 1)
- [Dynamic Context Model for Web Components — L1101](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1101-0) (line 1101, col 0, score 1)
- [Tracing the Signal — L314](tracing-the-signal.md#^ref-c3cd4f65-314-0) (line 314, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L821](migrate-to-provider-tenant-architecture.md#^ref-54382370-821-0) (line 821, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L492](migrate-to-provider-tenant-architecture.md#^ref-54382370-492-0) (line 492, col 0, score 0.96)
- [plan-update-confirmation — L1202](plan-update-confirmation.md#^ref-b22d79c6-1202-0) (line 1202, col 0, score 0.96)
- [Board Automation Improvements — L67](board-automation-improvements.md#^ref-ac60a1d6-67-0) (line 67, col 0, score 0.96)
- [Promethean Notes — L141](promethean-notes.md#^ref-1c4046b5-141-0) (line 141, col 0, score 1)
- [Admin Dashboard for User Management — L187](admin-dashboard-for-user-management.md#^ref-2901a3e9-187-0) (line 187, col 0, score 1)
- [plan-update-confirmation — L1249](plan-update-confirmation.md#^ref-b22d79c6-1249-0) (line 1249, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L423](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-423-0) (line 423, col 0, score 1)
- [sibilant-macro-targets — L425](sibilant-macro-targets.md#^ref-c5c9a5c6-425-0) (line 425, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L184](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-184-0) (line 184, col 0, score 1)
- [field-dynamics-math-blocks — L386](field-dynamics-math-blocks.md#^ref-7cfc230d-386-0) (line 386, col 0, score 1)
- [Fnord Tracer Protocol — L575](fnord-tracer-protocol.md#^ref-fc21f824-575-0) (line 575, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L224](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-224-0) (line 224, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L237](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-237-0) (line 237, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L307](protocol-0-the-contradiction-engine.md#^ref-9a93a756-307-0) (line 307, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L379](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-379-0) (line 379, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L567](migrate-to-provider-tenant-architecture.md#^ref-54382370-567-0) (line 567, col 0, score 1)
- [Promethean Dev Workflow Update — L283](promethean-dev-workflow-update.md#^ref-03a5578f-283-0) (line 283, col 0, score 1)
- [field-interaction-equations — L409](field-interaction-equations.md#^ref-b09141b7-409-0) (line 409, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L185](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-185-0) (line 185, col 0, score 1)
- [Stateful Partitions and Rebalancing — L766](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-766-0) (line 766, col 0, score 1)
- [plan-update-confirmation — L1480](plan-update-confirmation.md#^ref-b22d79c6-1480-0) (line 1480, col 0, score 1)
- [schema-evolution-workflow — L797](schema-evolution-workflow.md#^ref-d8059b6a-797-0) (line 797, col 0, score 1)
- [Dynamic Context Model for Web Components — L968](dynamic-context-model-for-web-components.md#^ref-f7702bf8-968-0) (line 968, col 0, score 0.97)
- [Factorio AI with External Agents — L352](factorio-ai-with-external-agents.md#^ref-a4d90289-352-0) (line 352, col 0, score 0.97)
- [schema-evolution-workflow — L986](schema-evolution-workflow.md#^ref-d8059b6a-986-0) (line 986, col 0, score 0.95)
- [Stateful Partitions and Rebalancing — L904](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-904-0) (line 904, col 0, score 0.95)
- [Migrate to Provider-Tenant Architecture — L497](migrate-to-provider-tenant-architecture.md#^ref-54382370-497-0) (line 497, col 0, score 0.95)
- [Promethean Documentation Pipeline Overview — L330](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-330-0) (line 330, col 0, score 0.95)
- [Agent Tasks: Persistence Migration to DualStore — L306](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-306-0) (line 306, col 0, score 0.98)
- [Pure TypeScript Search Microservice — L724](pure-typescript-search-microservice.md#^ref-d17d3a96-724-0) (line 724, col 0, score 1)
- [Factorio AI with External Agents — L487](factorio-ai-with-external-agents.md#^ref-a4d90289-487-0) (line 487, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L752](performance-optimized-polyglot-bridge.md#^ref-f5579967-752-0) (line 752, col 0, score 1)
- [Fnord Tracer Protocol — L460](fnord-tracer-protocol.md#^ref-fc21f824-460-0) (line 460, col 0, score 0.97)
- [Model Selection for Lightweight Conversational Tasks — L521](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-521-0) (line 521, col 0, score 1)
- [Tracing the Signal — L438](tracing-the-signal.md#^ref-c3cd4f65-438-0) (line 438, col 0, score 0.97)
- [Promethean Pipelines — L233](promethean-pipelines.md#^ref-8b8e6103-233-0) (line 233, col 0, score 0.97)
- [Agent Tasks: Persistence Migration to DualStore — L320](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-320-0) (line 320, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L416](model-upgrade-calm-down-guide.md#^ref-db74343f-416-0) (line 416, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L285](protocol-0-the-contradiction-engine.md#^ref-9a93a756-285-0) (line 285, col 0, score 1)
- [Stateful Partitions and Rebalancing — L820](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-820-0) (line 820, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L822](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-822-0) (line 822, col 0, score 1)
- [Fnord Tracer Protocol — L758](fnord-tracer-protocol.md#^ref-fc21f824-758-0) (line 758, col 0, score 1)
- [Pure TypeScript Search Microservice — L944](pure-typescript-search-microservice.md#^ref-d17d3a96-944-0) (line 944, col 0, score 1)
- [Prompt_Folder_Bootstrap — L566](prompt-folder-bootstrap.md#^ref-bd4f0976-566-0) (line 566, col 0, score 1)
- [sibilant-macro-targets — L367](sibilant-macro-targets.md#^ref-c5c9a5c6-367-0) (line 367, col 0, score 1)
- [Eidolon Field Abstract Model — L459](eidolon-field-abstract-model.md#^ref-5e8b2388-459-0) (line 459, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L644](performance-optimized-polyglot-bridge.md#^ref-f5579967-644-0) (line 644, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L610](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-610-0) (line 610, col 0, score 0.95)
- [plan-update-confirmation — L1421](plan-update-confirmation.md#^ref-b22d79c6-1421-0) (line 1421, col 0, score 0.95)
- [field-interaction-equations — L434](field-interaction-equations.md#^ref-b09141b7-434-0) (line 434, col 0, score 0.95)
- [Migrate to Provider-Tenant Architecture — L708](migrate-to-provider-tenant-architecture.md#^ref-54382370-708-0) (line 708, col 0, score 0.95)
- [Promethean-Copilot-Intent-Engine — L481](promethean-copilot-intent-engine.md#^ref-ae24a280-481-0) (line 481, col 0, score 0.95)
- [Redirecting Standard Error — L133](redirecting-standard-error.md#^ref-b3555ede-133-0) (line 133, col 0, score 0.95)
- [Factorio AI with External Agents — L492](factorio-ai-with-external-agents.md#^ref-a4d90289-492-0) (line 492, col 0, score 1)
- [Promethean Pipelines — L409](promethean-pipelines.md#^ref-8b8e6103-409-0) (line 409, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L811](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-811-0) (line 811, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L613](performance-optimized-polyglot-bridge.md#^ref-f5579967-613-0) (line 613, col 0, score 1)
- [Stateful Partitions and Rebalancing — L738](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-738-0) (line 738, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L851](migrate-to-provider-tenant-architecture.md#^ref-54382370-851-0) (line 851, col 0, score 1)
- [Stateful Partitions and Rebalancing — L934](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-934-0) (line 934, col 0, score 0.98)
- [Protocol_0_The_Contradiction_Engine — L359](protocol-0-the-contradiction-engine.md#^ref-9a93a756-359-0) (line 359, col 0, score 0.97)
- [obsidian-ignore-node-modules-regex — L258](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-258-0) (line 258, col 0, score 1)
- [Pure TypeScript Search Microservice — L955](pure-typescript-search-microservice.md#^ref-d17d3a96-955-0) (line 955, col 0, score 0.95)
- [Provider-Agnostic Chat Panel Implementation — L604](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-604-0) (line 604, col 0, score 0.94)
- [plan-update-confirmation — L1595](plan-update-confirmation.md#^ref-b22d79c6-1595-0) (line 1595, col 0, score 0.94)
- [zero-copy-snapshots-and-workers — L555](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-555-0) (line 555, col 0, score 0.94)
- [Agent Tasks: Persistence Migration to DualStore — L625](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-625-0) (line 625, col 0, score 0.94)
- [Chroma Toolkit Consolidation Plan — L527](chroma-toolkit-consolidation-plan.md#^ref-5020e892-527-0) (line 527, col 0, score 0.94)
- [Services — L231](chunks/services.md#^ref-75ea4a6a-231-0) (line 231, col 0, score 0.94)
- [typed-struct-compiler — L699](typed-struct-compiler.md#^ref-78eeedf7-699-0) (line 699, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L638](performance-optimized-polyglot-bridge.md#^ref-f5579967-638-0) (line 638, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L231](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-231-0) (line 231, col 0, score 0.99)
- [Prompt_Folder_Bootstrap — L594](prompt-folder-bootstrap.md#^ref-bd4f0976-594-0) (line 594, col 0, score 0.99)
- [Promethean Pipelines — L445](promethean-pipelines.md#^ref-8b8e6103-445-0) (line 445, col 0, score 0.99)
- [Prometheus Observability Stack — L716](prometheus-observability-stack.md#^ref-e90b5a16-716-0) (line 716, col 0, score 0.99)
- [Promethean Infrastructure Setup — L1024](promethean-infrastructure-setup.md#^ref-6deed6ac-1024-0) (line 1024, col 0, score 0.99)
- [Fnord Tracer Protocol — L565](fnord-tracer-protocol.md#^ref-fc21f824-565-0) (line 565, col 0, score 0.99)
- [Stateful Partitions and Rebalancing — L890](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-890-0) (line 890, col 0, score 1)
- [komorebi-group-window-hack — L394](komorebi-group-window-hack.md#^ref-dd89372d-394-0) (line 394, col 0, score 0.96)
- [zero-copy-snapshots-and-workers — L684](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-684-0) (line 684, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L353](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-353-0) (line 353, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L877](performance-optimized-polyglot-bridge.md#^ref-f5579967-877-0) (line 877, col 0, score 1)
- [polyglot-repl-interface-layer — L374](polyglot-repl-interface-layer.md#^ref-9c79206d-374-0) (line 374, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L465](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-465-0) (line 465, col 0, score 1)
- [sibilant-macro-targets — L319](sibilant-macro-targets.md#^ref-c5c9a5c6-319-0) (line 319, col 0, score 1)
- [plan-update-confirmation — L1749](plan-update-confirmation.md#^ref-b22d79c6-1749-0) (line 1749, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L340](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-340-0) (line 340, col 0, score 1)
- [Promethean State Format — L315](promethean-state-format.md#^ref-23df6ddb-315-0) (line 315, col 0, score 1)
- [plan-update-confirmation — L1860](plan-update-confirmation.md#^ref-b22d79c6-1860-0) (line 1860, col 0, score 1)
- [Docops Feature Updates — L134](docops-feature-updates-3.md#^ref-cdbd21ee-134-0) (line 134, col 0, score 1)
- [Docops Feature Updates — L192](docops-feature-updates.md#^ref-2792d448-192-0) (line 192, col 0, score 1)
- [Pure TypeScript Search Microservice — L871](pure-typescript-search-microservice.md#^ref-d17d3a96-871-0) (line 871, col 0, score 0.97)
- [Dynamic Context Model for Web Components — L888](dynamic-context-model-for-web-components.md#^ref-f7702bf8-888-0) (line 888, col 0, score 0.97)
- [field-dynamics-math-blocks — L593](field-dynamics-math-blocks.md#^ref-7cfc230d-593-0) (line 593, col 0, score 0.95)
- [field-interaction-equations — L641](field-interaction-equations.md#^ref-b09141b7-641-0) (line 641, col 0, score 0.95)
- [Promethean Dev Workflow Update — L3483](promethean-dev-workflow-update.md#^ref-03a5578f-3483-0) (line 3483, col 0, score 0.93)
- [Promethean Dev Workflow Update — L3746](promethean-dev-workflow-update.md#^ref-03a5578f-3746-0) (line 3746, col 0, score 0.93)
- [Promethean Dev Workflow Update — L3304](promethean-dev-workflow-update.md#^ref-03a5578f-3304-0) (line 3304, col 0, score 0.93)
- [Model Upgrade Calm-Down Guide — L262](model-upgrade-calm-down-guide.md#^ref-db74343f-262-0) (line 262, col 0, score 1)
- [Eidolon Field Abstract Model — L464](eidolon-field-abstract-model.md#^ref-5e8b2388-464-0) (line 464, col 0, score 1)
- [Dynamic Context Model for Web Components — L969](dynamic-context-model-for-web-components.md#^ref-f7702bf8-969-0) (line 969, col 0, score 1)
- [Optimizing Command Limitations in System Design — L164](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-164-0) (line 164, col 0, score 1)
- [field-interaction-equations — L305](field-interaction-equations.md#^ref-b09141b7-305-0) (line 305, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L397](protocol-0-the-contradiction-engine.md#^ref-9a93a756-397-0) (line 397, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L278](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-278-0) (line 278, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L319](layer1survivabilityenvelope.md#^ref-64a9f9f9-319-0) (line 319, col 0, score 1)
- [plan-update-confirmation — L1295](plan-update-confirmation.md#^ref-b22d79c6-1295-0) (line 1295, col 0, score 1)
- [Prompt_Folder_Bootstrap — L559](prompt-folder-bootstrap.md#^ref-bd4f0976-559-0) (line 559, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L842](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-842-0) (line 842, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L472](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-472-0) (line 472, col 0, score 1)
- [Dynamic Context Model for Web Components — L1118](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1118-0) (line 1118, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L425](model-upgrade-calm-down-guide.md#^ref-db74343f-425-0) (line 425, col 0, score 1)
- [Factorio AI with External Agents — L465](factorio-ai-with-external-agents.md#^ref-a4d90289-465-0) (line 465, col 0, score 1)
- [Promethean Pipelines — L238](promethean-pipelines.md#^ref-8b8e6103-238-0) (line 238, col 0, score 1)
- [Admin Dashboard for User Management — L261](admin-dashboard-for-user-management.md#^ref-2901a3e9-261-0) (line 261, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1056](migrate-to-provider-tenant-architecture.md#^ref-54382370-1056-0) (line 1056, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L353](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-353-0) (line 353, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L386](protocol-0-the-contradiction-engine.md#^ref-9a93a756-386-0) (line 386, col 0, score 1)
- [plan-update-confirmation — L1403](plan-update-confirmation.md#^ref-b22d79c6-1403-0) (line 1403, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L474](layer1survivabilityenvelope.md#^ref-64a9f9f9-474-0) (line 474, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L508](promethean-copilot-intent-engine.md#^ref-ae24a280-508-0) (line 508, col 0, score 1)
- [Prompt_Folder_Bootstrap — L451](prompt-folder-bootstrap.md#^ref-bd4f0976-451-0) (line 451, col 0, score 1)
- [Self-Agency in AI Interaction — L209](self-agency-in-ai-interaction.md#^ref-49a9a860-209-0) (line 209, col 0, score 1)
- [Admin Dashboard for User Management — L264](admin-dashboard-for-user-management.md#^ref-2901a3e9-264-0) (line 264, col 0, score 1)
- [Duck's Attractor States — L4327](ducks-attractor-states.md#^ref-13951643-4327-0) (line 4327, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L2994](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2994-0) (line 2994, col 0, score 0.98)
- [NPU Voice Code and Sensory Integration — L146](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-146-0) (line 146, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L743](migrate-to-provider-tenant-architecture.md#^ref-54382370-743-0) (line 743, col 0, score 0.98)
- [field-interaction-equations — L588](field-interaction-equations.md#^ref-b09141b7-588-0) (line 588, col 0, score 0.98)
- [Obsidian Templating Plugins Integration Guide — L311](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-311-0) (line 311, col 0, score 0.98)
- [Reawakening Duck — L471](reawakening-duck.md#^ref-59b5670f-471-0) (line 471, col 0, score 0.98)
- [Docops Feature Updates — L127](docops-feature-updates-3.md#^ref-cdbd21ee-127-0) (line 127, col 0, score 1)
- [Docops Feature Updates — L185](docops-feature-updates.md#^ref-2792d448-185-0) (line 185, col 0, score 1)
- [plan-update-confirmation — L1297](plan-update-confirmation.md#^ref-b22d79c6-1297-0) (line 1297, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L373](model-upgrade-calm-down-guide.md#^ref-db74343f-373-0) (line 373, col 0, score 1)
- [Prompt_Folder_Bootstrap — L505](prompt-folder-bootstrap.md#^ref-bd4f0976-505-0) (line 505, col 0, score 1)
- [typed-struct-compiler — L672](typed-struct-compiler.md#^ref-78eeedf7-672-0) (line 672, col 0, score 1)
- [Factorio AI with External Agents — L560](factorio-ai-with-external-agents.md#^ref-a4d90289-560-0) (line 560, col 0, score 1)
- [i3-bluetooth-setup — L324](i3-bluetooth-setup.md#^ref-5e408692-324-0) (line 324, col 0, score 1)
- [Promethean Dev Workflow Update — L437](promethean-dev-workflow-update.md#^ref-03a5578f-437-0) (line 437, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L704](performance-optimized-polyglot-bridge.md#^ref-f5579967-704-0) (line 704, col 0, score 1)
- [sibilant-macro-targets — L353](sibilant-macro-targets.md#^ref-c5c9a5c6-353-0) (line 353, col 0, score 1)
- [plan-update-confirmation — L1844](plan-update-confirmation.md#^ref-b22d79c6-1844-0) (line 1844, col 0, score 1)
- [Prompt_Folder_Bootstrap — L615](prompt-folder-bootstrap.md#^ref-bd4f0976-615-0) (line 615, col 0, score 0.98)
- [Synchronicity Waves and Web — L258](synchronicity-waves-and-web.md#^ref-91295f3a-258-0) (line 258, col 0, score 0.98)
- [Model Upgrade Calm-Down Guide — L253](model-upgrade-calm-down-guide.md#^ref-db74343f-253-0) (line 253, col 0, score 0.98)
- [i3-bluetooth-setup — L327](i3-bluetooth-setup.md#^ref-5e408692-327-0) (line 327, col 0, score 0.98)
- [plan-update-confirmation — L1287](plan-update-confirmation.md#^ref-b22d79c6-1287-0) (line 1287, col 0, score 1)
- [Fnord Tracer Protocol — L568](fnord-tracer-protocol.md#^ref-fc21f824-568-0) (line 568, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L329](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-329-0) (line 329, col 0, score 0.98)
- [plan-update-confirmation — L1370](plan-update-confirmation.md#^ref-b22d79c6-1370-0) (line 1370, col 0, score 0.98)
- [Agent Reflections and Prompt Evolution — L335](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-335-0) (line 335, col 0, score 0.98)
- [Eidolon Field Abstract Model — L643](eidolon-field-abstract-model.md#^ref-5e8b2388-643-0) (line 643, col 0, score 0.98)
- [field-dynamics-math-blocks — L558](field-dynamics-math-blocks.md#^ref-7cfc230d-558-0) (line 558, col 0, score 0.98)
- [field-node-diagram-outline — L341](field-node-diagram-outline.md#^ref-1f32c94a-341-0) (line 341, col 0, score 0.98)
- [Performance-Optimized-Polyglot-Bridge — L685](performance-optimized-polyglot-bridge.md#^ref-f5579967-685-0) (line 685, col 0, score 1)
- [OpenAPI Validation Report — L122](openapi-validation-report.md#^ref-5c152b08-122-0) (line 122, col 0, score 1)
- [plan-update-confirmation — L1459](plan-update-confirmation.md#^ref-b22d79c6-1459-0) (line 1459, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L389](protocol-0-the-contradiction-engine.md#^ref-9a93a756-389-0) (line 389, col 0, score 0.98)
- [Functional Refactor of TypeScript Document Processing — L336](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-336-0) (line 336, col 0, score 1)
- [windows-tiling-with-autohotkey — L425](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-425-0) (line 425, col 0, score 0.95)
- [field-dynamics-math-blocks — L462](field-dynamics-math-blocks.md#^ref-7cfc230d-462-0) (line 462, col 0, score 0.95)
- [komorebi-group-window-hack — L393](komorebi-group-window-hack.md#^ref-dd89372d-393-0) (line 393, col 0, score 0.94)
- [plan-update-confirmation — L1836](plan-update-confirmation.md#^ref-b22d79c6-1836-0) (line 1836, col 0, score 0.94)
- [Functional Refactor of TypeScript Document Processing — L337](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-337-0) (line 337, col 0, score 0.94)
- [windows-tiling-with-autohotkey — L426](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-426-0) (line 426, col 0, score 0.95)
- [field-dynamics-math-blocks — L463](field-dynamics-math-blocks.md#^ref-7cfc230d-463-0) (line 463, col 0, score 0.95)
- [Layer1SurvivabilityEnvelope — L537](layer1survivabilityenvelope.md#^ref-64a9f9f9-537-0) (line 537, col 0, score 0.95)
- [plan-update-confirmation — L1837](plan-update-confirmation.md#^ref-b22d79c6-1837-0) (line 1837, col 0, score 0.94)
- [Functional Refactor of TypeScript Document Processing — L443](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-443-0) (line 443, col 0, score 0.94)
- [Docops Feature Updates — L128](docops-feature-updates.md#^ref-2792d448-128-0) (line 128, col 0, score 0.94)
- [Prometheus Observability Stack — L778](prometheus-observability-stack.md#^ref-e90b5a16-778-0) (line 778, col 0, score 0.94)
- [Promethean Documentation Pipeline Overview — L536](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-536-0) (line 536, col 0, score 0.94)
- [Functional Refactor of TypeScript Document Processing — L338](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-338-0) (line 338, col 0, score 1)
- [field-dynamics-math-blocks — L464](field-dynamics-math-blocks.md#^ref-7cfc230d-464-0) (line 464, col 0, score 0.93)
- [Layer1SurvivabilityEnvelope — L538](layer1survivabilityenvelope.md#^ref-64a9f9f9-538-0) (line 538, col 0, score 0.92)
- [Docops Feature Updates — L101](docops-feature-updates-3.md#^ref-cdbd21ee-101-0) (line 101, col 0, score 0.92)
- [Docops Feature Updates — L143](docops-feature-updates.md#^ref-2792d448-143-0) (line 143, col 0, score 0.92)
- [plan-update-confirmation — L1838](plan-update-confirmation.md#^ref-b22d79c6-1838-0) (line 1838, col 0, score 0.92)
- [Functional Refactor of TypeScript Document Processing — L453](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-453-0) (line 453, col 0, score 0.92)
- [Functional Refactor of TypeScript Document Processing — L307](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-307-0) (line 307, col 0, score 0.92)
- [Chroma Toolkit Consolidation Plan — L361](chroma-toolkit-consolidation-plan.md#^ref-5020e892-361-0) (line 361, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L343](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-343-0) (line 343, col 0, score 1)
- [Promethean Dev Workflow Update — L444](promethean-dev-workflow-update.md#^ref-03a5578f-444-0) (line 444, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L608](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-608-0) (line 608, col 0, score 1)
- [Dynamic Context Model for Web Components — L1014](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1014-0) (line 1014, col 0, score 1)
- [Ice Box Reorganization — L210](ice-box-reorganization.md#^ref-291c7d91-210-0) (line 210, col 0, score 1)
- [schema-evolution-workflow — L981](schema-evolution-workflow.md#^ref-d8059b6a-981-0) (line 981, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L336](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-336-0) (line 336, col 0, score 1)
- [Creative Moments — L1373](creative-moments.md#^ref-10d98225-1373-0) (line 1373, col 0, score 0.98)
- [Promethean-Copilot-Intent-Engine — L397](promethean-copilot-intent-engine.md#^ref-ae24a280-397-0) (line 397, col 0, score 1)
- [schema-evolution-workflow — L810](schema-evolution-workflow.md#^ref-d8059b6a-810-0) (line 810, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L449](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-449-0) (line 449, col 0, score 1)
- [Admin Dashboard for User Management — L279](admin-dashboard-for-user-management.md#^ref-2901a3e9-279-0) (line 279, col 0, score 0.97)
- [Agent Tasks: Persistence Migration to DualStore — L524](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-524-0) (line 524, col 0, score 0.97)
- [Eidolon Field Abstract Model — L467](eidolon-field-abstract-model.md#^ref-5e8b2388-467-0) (line 467, col 0, score 0.97)
- [Dynamic Context Model for Web Components — L915](dynamic-context-model-for-web-components.md#^ref-f7702bf8-915-0) (line 915, col 0, score 0.97)
- [Promethean Pipelines — L328](promethean-pipelines.md#^ref-8b8e6103-328-0) (line 328, col 0, score 0.97)
- [Chroma Toolkit Consolidation Plan — L439](chroma-toolkit-consolidation-plan.md#^ref-5020e892-439-0) (line 439, col 0, score 0.97)
- [Functional Refactor of TypeScript Document Processing — L305](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-305-0) (line 305, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L456](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-456-0) (line 456, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L850](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-850-0) (line 850, col 0, score 1)
- [plan-update-confirmation — L1704](plan-update-confirmation.md#^ref-b22d79c6-1704-0) (line 1704, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L439](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-439-0) (line 439, col 0, score 0.94)
- [Provider-Agnostic Chat Panel Implementation — L487](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-487-0) (line 487, col 0, score 1)
- [plan-update-confirmation — L1694](plan-update-confirmation.md#^ref-b22d79c6-1694-0) (line 1694, col 0, score 1)
- [zero-copy-snapshots-and-workers — L650](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-650-0) (line 650, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L682](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-682-0) (line 682, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L852](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-852-0) (line 852, col 0, score 1)
- [typed-struct-compiler — L683](typed-struct-compiler.md#^ref-78eeedf7-683-0) (line 683, col 0, score 1)
- [Tooling — L182](chunks/tooling.md#^ref-6cb4943e-182-0) (line 182, col 0, score 0.97)
- [Migrate to Provider-Tenant Architecture — L1537](migrate-to-provider-tenant-architecture.md#^ref-54382370-1537-0) (line 1537, col 0, score 0.97)
- [Pure TypeScript Search Microservice — L858](pure-typescript-search-microservice.md#^ref-d17d3a96-858-0) (line 858, col 0, score 1)
- [komorebi-group-window-hack — L389](komorebi-group-window-hack.md#^ref-dd89372d-389-0) (line 389, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L308](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-308-0) (line 308, col 0, score 1)
- [graph-ds — L553](graph-ds.md#^ref-6620e2f2-553-0) (line 553, col 0, score 1)
- [zero-copy-snapshots-and-workers — L645](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-645-0) (line 645, col 0, score 1)
- [eidolon-field-math-foundations — L5348](eidolon-field-math-foundations.md#^ref-008f2ac0-5348-0) (line 5348, col 0, score 0.97)
- [Canonical Org-Babel Matplotlib Animation Template — L3124](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-3124-0) (line 3124, col 0, score 0.97)
- [Creative Moments — L1884](creative-moments.md#^ref-10d98225-1884-0) (line 1884, col 0, score 0.97)
- [Duck's Attractor States — L4424](ducks-attractor-states.md#^ref-13951643-4424-0) (line 4424, col 0, score 0.97)
- [TypeScript Patch for Tool Calling Support — L855](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-855-0) (line 855, col 0, score 1)
- [Pure TypeScript Search Microservice — L894](pure-typescript-search-microservice.md#^ref-d17d3a96-894-0) (line 894, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L2129](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-2129-0) (line 2129, col 0, score 0.97)
- [Prometheus Observability Stack — L722](prometheus-observability-stack.md#^ref-e90b5a16-722-0) (line 722, col 0, score 0.96)
- [windows-tiling-with-autohotkey — L3355](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-3355-0) (line 3355, col 0, score 0.96)
- [Pure TypeScript Search Microservice — L798](pure-typescript-search-microservice.md#^ref-d17d3a96-798-0) (line 798, col 0, score 0.96)
- [Per-Domain Policy System for JS Crawler — L791](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-791-0) (line 791, col 0, score 0.96)
- [obsidian-ignore-node-modules-regex — L248](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-248-0) (line 248, col 0, score 0.96)
- [komorebi-group-window-hack — L390](komorebi-group-window-hack.md#^ref-dd89372d-390-0) (line 390, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L696](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-696-0) (line 696, col 0, score 1)
- [plan-update-confirmation — L1647](plan-update-confirmation.md#^ref-b22d79c6-1647-0) (line 1647, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L941](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-941-0) (line 941, col 0, score 0.93)
- [schema-evolution-workflow — L781](schema-evolution-workflow.md#^ref-d8059b6a-781-0) (line 781, col 0, score 0.93)
- [Pure TypeScript Search Microservice — L848](pure-typescript-search-microservice.md#^ref-d17d3a96-848-0) (line 848, col 0, score 0.93)
- [Migrate to Provider-Tenant Architecture — L838](migrate-to-provider-tenant-architecture.md#^ref-54382370-838-0) (line 838, col 0, score 0.93)
- [typed-struct-compiler — L616](typed-struct-compiler.md#^ref-78eeedf7-616-0) (line 616, col 0, score 0.93)
- [Per-Domain Policy System for JS Crawler — L736](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-736-0) (line 736, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L736](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-736-0) (line 736, col 0, score 1)
- [zero-copy-snapshots-and-workers — L611](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-611-0) (line 611, col 0, score 1)
- [typed-struct-compiler — L652](typed-struct-compiler.md#^ref-78eeedf7-652-0) (line 652, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L284](protocol-0-the-contradiction-engine.md#^ref-9a93a756-284-0) (line 284, col 0, score 0.95)
- [field-interaction-equations — L612](field-interaction-equations.md#^ref-b09141b7-612-0) (line 612, col 0, score 0.95)
- [Dynamic Context Model for Web Components — L737](dynamic-context-model-for-web-components.md#^ref-f7702bf8-737-0) (line 737, col 0, score 0.95)
- [sibilant-macro-targets — L524](sibilant-macro-targets.md#^ref-c5c9a5c6-524-0) (line 524, col 0, score 0.94)
- [Migrate to Provider-Tenant Architecture — L865](migrate-to-provider-tenant-architecture.md#^ref-54382370-865-0) (line 865, col 0, score 0.94)
- [Factorio AI with External Agents — L523](factorio-ai-with-external-agents.md#^ref-a4d90289-523-0) (line 523, col 0, score 1)
- [Promethean Infrastructure Setup — L916](promethean-infrastructure-setup.md#^ref-6deed6ac-916-0) (line 916, col 0, score 1)
- [Dynamic Context Model for Web Components — L1047](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1047-0) (line 1047, col 0, score 1)
- [Tracing the Signal — L290](tracing-the-signal.md#^ref-c3cd4f65-290-0) (line 290, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L267](model-upgrade-calm-down-guide.md#^ref-db74343f-267-0) (line 267, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L485](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-485-0) (line 485, col 0, score 1)
- [plan-update-confirmation — L1190](plan-update-confirmation.md#^ref-b22d79c6-1190-0) (line 1190, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L673](migrate-to-provider-tenant-architecture.md#^ref-54382370-673-0) (line 673, col 0, score 0.99)
- [Agent Tasks: Persistence Migration to DualStore — L330](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-330-0) (line 330, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L477](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-477-0) (line 477, col 0, score 1)
- [Promethean Notes — L150](promethean-notes.md#^ref-1c4046b5-150-0) (line 150, col 0, score 1)
- [Promethean Workflow Optimization — L122](promethean-workflow-optimization.md#^ref-d614d983-122-0) (line 122, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L301](protocol-0-the-contradiction-engine.md#^ref-9a93a756-301-0) (line 301, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L420](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-420-0) (line 420, col 0, score 1)
- [plan-update-confirmation — L1719](plan-update-confirmation.md#^ref-b22d79c6-1719-0) (line 1719, col 0, score 1)
- [sibilant-macro-targets — L463](sibilant-macro-targets.md#^ref-c5c9a5c6-463-0) (line 463, col 0, score 1)
- [Promethean Notes — L151](promethean-notes.md#^ref-1c4046b5-151-0) (line 151, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L331](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-331-0) (line 331, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L478](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-478-0) (line 478, col 0, score 1)
- [Promethean Workflow Optimization — L123](promethean-workflow-optimization.md#^ref-d614d983-123-0) (line 123, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L302](protocol-0-the-contradiction-engine.md#^ref-9a93a756-302-0) (line 302, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L421](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-421-0) (line 421, col 0, score 1)
- [Stateful Partitions and Rebalancing — L1002](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-1002-0) (line 1002, col 0, score 1)
- [plan-update-confirmation — L1762](plan-update-confirmation.md#^ref-b22d79c6-1762-0) (line 1762, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L332](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-332-0) (line 332, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L479](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-479-0) (line 479, col 0, score 1)
- [Promethean Workflow Optimization — L124](promethean-workflow-optimization.md#^ref-d614d983-124-0) (line 124, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L303](protocol-0-the-contradiction-engine.md#^ref-9a93a756-303-0) (line 303, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L422](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-422-0) (line 422, col 0, score 1)
- [plan-update-confirmation — L1765](plan-update-confirmation.md#^ref-b22d79c6-1765-0) (line 1765, col 0, score 1)
- [Stateful Partitions and Rebalancing — L1003](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-1003-0) (line 1003, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L371](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-371-0) (line 371, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L277](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-277-0) (line 277, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L199](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-199-0) (line 199, col 0, score 1)
- [Fnord Tracer Protocol — L501](fnord-tracer-protocol.md#^ref-fc21f824-501-0) (line 501, col 0, score 1)
- [windows-tiling-with-autohotkey — L316](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-316-0) (line 316, col 0, score 1)
- [Factorio AI with External Agents — L370](factorio-ai-with-external-agents.md#^ref-a4d90289-370-0) (line 370, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L362](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-362-0) (line 362, col 0, score 1)
- [Stateful Partitions and Rebalancing — L921](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-921-0) (line 921, col 0, score 1)
- [graph-ds — L616](graph-ds.md#^ref-6620e2f2-616-0) (line 616, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L588](migrate-to-provider-tenant-architecture.md#^ref-54382370-588-0) (line 588, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L278](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-278-0) (line 278, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L207](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-207-0) (line 207, col 0, score 1)
- [Promethean Dev Workflow Update — L286](promethean-dev-workflow-update.md#^ref-03a5578f-286-0) (line 286, col 0, score 1)
- [Fnord Tracer Protocol — L502](fnord-tracer-protocol.md#^ref-fc21f824-502-0) (line 502, col 0, score 1)
- [windows-tiling-with-autohotkey — L317](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-317-0) (line 317, col 0, score 1)
- [Mathematical Samplers — L161](mathematical-samplers.md#^ref-86a691ec-161-0) (line 161, col 0, score 1)
- [Mathematics Sampler — L172](mathematics-sampler.md#^ref-b5e0183e-172-0) (line 172, col 0, score 1)
- [Prometheus Observability Stack — L709](prometheus-observability-stack.md#^ref-e90b5a16-709-0) (line 709, col 0, score 1)
- [The Jar of Echoes — L316](the-jar-of-echoes.md#^ref-18138627-316-0) (line 316, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L279](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-279-0) (line 279, col 0, score 1)
- [field-dynamics-math-blocks — L379](field-dynamics-math-blocks.md#^ref-7cfc230d-379-0) (line 379, col 0, score 1)
- [Admin Dashboard for User Management — L182](admin-dashboard-for-user-management.md#^ref-2901a3e9-182-0) (line 182, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L208](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-208-0) (line 208, col 0, score 1)
- [Promethean Notes — L145](promethean-notes.md#^ref-1c4046b5-145-0) (line 145, col 0, score 1)
- [Fnord Tracer Protocol — L503](fnord-tracer-protocol.md#^ref-fc21f824-503-0) (line 503, col 0, score 1)
- [Mathematics Sampler — L173](mathematics-sampler.md#^ref-b5e0183e-173-0) (line 173, col 0, score 1)
- [windows-tiling-with-autohotkey — L318](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-318-0) (line 318, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L201](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-201-0) (line 201, col 0, score 0.98)
- [Agent Tasks: Persistence Migration to DualStore — L280](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-280-0) (line 280, col 0, score 1)
- [field-dynamics-math-blocks — L380](field-dynamics-math-blocks.md#^ref-7cfc230d-380-0) (line 380, col 0, score 1)
- [Promethean Dev Workflow Update — L288](promethean-dev-workflow-update.md#^ref-03a5578f-288-0) (line 288, col 0, score 1)
- [Admin Dashboard for User Management — L183](admin-dashboard-for-user-management.md#^ref-2901a3e9-183-0) (line 183, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L383](layer1survivabilityenvelope.md#^ref-64a9f9f9-383-0) (line 383, col 0, score 1)
- [plan-update-confirmation — L1254](plan-update-confirmation.md#^ref-b22d79c6-1254-0) (line 1254, col 0, score 1)
- [Prometheus Observability Stack — L711](prometheus-observability-stack.md#^ref-e90b5a16-711-0) (line 711, col 0, score 1)
- [The Jar of Echoes — L318](the-jar-of-echoes.md#^ref-18138627-318-0) (line 318, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L281](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-281-0) (line 281, col 0, score 1)
- [field-dynamics-math-blocks — L381](field-dynamics-math-blocks.md#^ref-7cfc230d-381-0) (line 381, col 0, score 1)
- [Prometheus Observability Stack — L741](prometheus-observability-stack.md#^ref-e90b5a16-741-0) (line 741, col 0, score 1)
- [plan-update-confirmation — L1255](plan-update-confirmation.md#^ref-b22d79c6-1255-0) (line 1255, col 0, score 1)
- [The Jar of Echoes — L319](the-jar-of-echoes.md#^ref-18138627-319-0) (line 319, col 0, score 1)
- [Tracing the Signal — L307](tracing-the-signal.md#^ref-c3cd4f65-307-0) (line 307, col 0, score 1)
- [Promethean Dev Workflow Update — L289](promethean-dev-workflow-update.md#^ref-03a5578f-289-0) (line 289, col 0, score 1)
- [Admin Dashboard for User Management — L184](admin-dashboard-for-user-management.md#^ref-2901a3e9-184-0) (line 184, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L282](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-282-0) (line 282, col 0, score 1)
- [field-dynamics-math-blocks — L382](field-dynamics-math-blocks.md#^ref-7cfc230d-382-0) (line 382, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L385](layer1survivabilityenvelope.md#^ref-64a9f9f9-385-0) (line 385, col 0, score 1)
- [plan-update-confirmation — L1276](plan-update-confirmation.md#^ref-b22d79c6-1276-0) (line 1276, col 0, score 1)
- [The Jar of Echoes — L320](the-jar-of-echoes.md#^ref-18138627-320-0) (line 320, col 0, score 1)
- [Tracing the Signal — L308](tracing-the-signal.md#^ref-c3cd4f65-308-0) (line 308, col 0, score 1)
- [Admin Dashboard for User Management — L185](admin-dashboard-for-user-management.md#^ref-2901a3e9-185-0) (line 185, col 0, score 1)
- [Mathematical Samplers — L165](mathematical-samplers.md#^ref-86a691ec-165-0) (line 165, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L333](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-333-0) (line 333, col 0, score 1)
- [field-dynamics-math-blocks — L383](field-dynamics-math-blocks.md#^ref-7cfc230d-383-0) (line 383, col 0, score 1)
- [Admin Dashboard for User Management — L186](admin-dashboard-for-user-management.md#^ref-2901a3e9-186-0) (line 186, col 0, score 1)
- [plan-update-confirmation — L1277](plan-update-confirmation.md#^ref-b22d79c6-1277-0) (line 1277, col 0, score 1)
- [The Jar of Echoes — L321](the-jar-of-echoes.md#^ref-18138627-321-0) (line 321, col 0, score 1)
- [Tracing the Signal — L472](tracing-the-signal.md#^ref-c3cd4f65-472-0) (line 472, col 0, score 1)
- [Fnord Tracer Protocol — L507](fnord-tracer-protocol.md#^ref-fc21f824-507-0) (line 507, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L205](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-205-0) (line 205, col 0, score 1)
- [Promethean Infrastructure Setup — L1063](promethean-infrastructure-setup.md#^ref-6deed6ac-1063-0) (line 1063, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L358](protocol-0-the-contradiction-engine.md#^ref-9a93a756-358-0) (line 358, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L844](migrate-to-provider-tenant-architecture.md#^ref-54382370-844-0) (line 844, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L393](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-393-0) (line 393, col 0, score 0.99)
- [Promethean Pipelines — L499](promethean-pipelines.md#^ref-8b8e6103-499-0) (line 499, col 0, score 1)
- [Dynamic Context Model for Web Components — L855](dynamic-context-model-for-web-components.md#^ref-f7702bf8-855-0) (line 855, col 0, score 1)
- [Fnord Tracer Protocol — L731](fnord-tracer-protocol.md#^ref-fc21f824-731-0) (line 731, col 0, score 1)
- [Promethean Chat Activity Report — L165](promethean-chat-activity-report.md#^ref-18344cf9-165-0) (line 165, col 0, score 0.99)
- [Pure TypeScript Search Microservice — L869](pure-typescript-search-microservice.md#^ref-d17d3a96-869-0) (line 869, col 0, score 1)
- [Stateful Partitions and Rebalancing — L750](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-750-0) (line 750, col 0, score 1)
- [field-interaction-equations — L538](field-interaction-equations.md#^ref-b09141b7-538-0) (line 538, col 0, score 0.98)
- [graph-ds — L613](graph-ds.md#^ref-6620e2f2-613-0) (line 613, col 0, score 0.98)
- [The Jar of Echoes — L362](the-jar-of-echoes.md#^ref-18138627-362-0) (line 362, col 0, score 0.98)
- [Model Selection for Lightweight Conversational Tasks — L347](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-347-0) (line 347, col 0, score 0.98)
- [TypeScript Patch for Tool Calling Support — L898](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-898-0) (line 898, col 0, score 0.98)
- [Model Upgrade Calm-Down Guide — L374](model-upgrade-calm-down-guide.md#^ref-db74343f-374-0) (line 374, col 0, score 0.98)
- [graph-ds — L566](graph-ds.md#^ref-6620e2f2-566-0) (line 566, col 0, score 1)
- [typed-struct-compiler — L648](typed-struct-compiler.md#^ref-78eeedf7-648-0) (line 648, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L777](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-777-0) (line 777, col 0, score 1)
- [Pure TypeScript Search Microservice — L866](pure-typescript-search-microservice.md#^ref-d17d3a96-866-0) (line 866, col 0, score 1)
- [Stateful Partitions and Rebalancing — L772](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-772-0) (line 772, col 0, score 1)
- [Dynamic Context Model for Web Components — L881](dynamic-context-model-for-web-components.md#^ref-f7702bf8-881-0) (line 881, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L698](performance-optimized-polyglot-bridge.md#^ref-f5579967-698-0) (line 698, col 0, score 1)
- [zero-copy-snapshots-and-workers — L594](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-594-0) (line 594, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L711](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-711-0) (line 711, col 0, score 1)
- [Pure TypeScript Search Microservice — L841](pure-typescript-search-microservice.md#^ref-d17d3a96-841-0) (line 841, col 0, score 1)
- [Factorio AI with External Agents — L524](factorio-ai-with-external-agents.md#^ref-a4d90289-524-0) (line 524, col 0, score 1)
- [zero-copy-snapshots-and-workers — L646](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-646-0) (line 646, col 0, score 1)
- [graph-ds — L570](graph-ds.md#^ref-6620e2f2-570-0) (line 570, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L323](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-323-0) (line 323, col 0, score 1)
- [plan-update-confirmation — L1733](plan-update-confirmation.md#^ref-b22d79c6-1733-0) (line 1733, col 0, score 1)
- [Dynamic Context Model for Web Components — L1041](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1041-0) (line 1041, col 0, score 1)
- [Stateful Partitions and Rebalancing — L749](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-749-0) (line 749, col 0, score 1)
- [graph-ds — L563](graph-ds.md#^ref-6620e2f2-563-0) (line 563, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L706](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-706-0) (line 706, col 0, score 1)
- [Pure TypeScript Search Microservice — L907](pure-typescript-search-microservice.md#^ref-d17d3a96-907-0) (line 907, col 0, score 1)
- [typed-struct-compiler — L658](typed-struct-compiler.md#^ref-78eeedf7-658-0) (line 658, col 0, score 1)
- [zero-copy-snapshots-and-workers — L566](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-566-0) (line 566, col 0, score 1)
- [graph-ds — L544](graph-ds.md#^ref-6620e2f2-544-0) (line 544, col 0, score 0.97)
- [Performance-Optimized-Polyglot-Bridge — L787](performance-optimized-polyglot-bridge.md#^ref-f5579967-787-0) (line 787, col 0, score 0.97)
- [komorebi-group-window-hack — L376](komorebi-group-window-hack.md#^ref-dd89372d-376-0) (line 376, col 0, score 0.97)
- [Provider-Agnostic Chat Panel Implementation — L496](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-496-0) (line 496, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L769](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-769-0) (line 769, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L745](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-745-0) (line 745, col 0, score 1)
- [Pure TypeScript Search Microservice — L905](pure-typescript-search-microservice.md#^ref-d17d3a96-905-0) (line 905, col 0, score 1)
- [Promethean Infrastructure Setup — L986](promethean-infrastructure-setup.md#^ref-6deed6ac-986-0) (line 986, col 0, score 1)
- [Dynamic Context Model for Web Components — L1236](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1236-0) (line 1236, col 0, score 1)
- [plan-update-confirmation — L1703](plan-update-confirmation.md#^ref-b22d79c6-1703-0) (line 1703, col 0, score 1)
- [komorebi-group-window-hack — L396](komorebi-group-window-hack.md#^ref-dd89372d-396-0) (line 396, col 0, score 1)
- [typed-struct-compiler — L622](typed-struct-compiler.md#^ref-78eeedf7-622-0) (line 622, col 0, score 1)
- [komorebi-group-window-hack — L388](komorebi-group-window-hack.md#^ref-dd89372d-388-0) (line 388, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L829](performance-optimized-polyglot-bridge.md#^ref-f5579967-829-0) (line 829, col 0, score 1)
- [Promethean Pipelines — L345](promethean-pipelines.md#^ref-8b8e6103-345-0) (line 345, col 0, score 1)
- [zero-copy-snapshots-and-workers — L572](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-572-0) (line 572, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L430](migrate-to-provider-tenant-architecture.md#^ref-54382370-430-0) (line 430, col 0, score 0.98)
- [Factorio AI with External Agents — L447](factorio-ai-with-external-agents.md#^ref-a4d90289-447-0) (line 447, col 0, score 0.98)
- [Pipeline Enhancements — L69](pipeline-enhancements.md#^ref-e2135d9f-69-0) (line 69, col 0, score 0.98)
- [Stateful Partitions and Rebalancing — L756](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-756-0) (line 756, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L348](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-348-0) (line 348, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L735](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-735-0) (line 735, col 0, score 1)
- [heartbeat-fragment-demo — L295](heartbeat-fragment-demo.md#^ref-dd00677a-295-0) (line 295, col 0, score 1)
- [ripple-propagation-demo — L256](ripple-propagation-demo.md#^ref-8430617b-256-0) (line 256, col 0, score 1)
- [graph-ds — L550](graph-ds.md#^ref-6620e2f2-550-0) (line 550, col 0, score 1)
- [typed-struct-compiler — L632](typed-struct-compiler.md#^ref-78eeedf7-632-0) (line 632, col 0, score 1)
- [Factorio AI with External Agents — L529](factorio-ai-with-external-agents.md#^ref-a4d90289-529-0) (line 529, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L898](migrate-to-provider-tenant-architecture.md#^ref-54382370-898-0) (line 898, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L209](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-209-0) (line 209, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L394](promethean-copilot-intent-engine.md#^ref-ae24a280-394-0) (line 394, col 0, score 1)
- [field-node-diagram-outline — L350](field-node-diagram-outline.md#^ref-1f32c94a-350-0) (line 350, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L359](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-359-0) (line 359, col 0, score 1)
- [Promethean Infrastructure Setup — L885](promethean-infrastructure-setup.md#^ref-6deed6ac-885-0) (line 885, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L899](migrate-to-provider-tenant-architecture.md#^ref-54382370-899-0) (line 899, col 0, score 1)
- [Dynamic Context Model for Web Components — L856](dynamic-context-model-for-web-components.md#^ref-f7702bf8-856-0) (line 856, col 0, score 1)
- [Fnord Tracer Protocol — L732](fnord-tracer-protocol.md#^ref-fc21f824-732-0) (line 732, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L430](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-430-0) (line 430, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L210](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-210-0) (line 210, col 0, score 1)
- [field-node-diagram-outline — L351](field-node-diagram-outline.md#^ref-1f32c94a-351-0) (line 351, col 0, score 1)
- [Promethean Pipelines — L500](promethean-pipelines.md#^ref-8b8e6103-500-0) (line 500, col 0, score 0.95)
- [Promethean-Copilot-Intent-Engine — L395](promethean-copilot-intent-engine.md#^ref-ae24a280-395-0) (line 395, col 0, score 1)
- [Dynamic Context Model for Web Components — L813](dynamic-context-model-for-web-components.md#^ref-f7702bf8-813-0) (line 813, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L906](migrate-to-provider-tenant-architecture.md#^ref-54382370-906-0) (line 906, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L319](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-319-0) (line 319, col 0, score 1)
- [Pure TypeScript Search Microservice — L896](pure-typescript-search-microservice.md#^ref-d17d3a96-896-0) (line 896, col 0, score 1)
- [Pure TypeScript Search Microservice — L879](pure-typescript-search-microservice.md#^ref-d17d3a96-879-0) (line 879, col 0, score 1)
- [homeostasis-decay-formulas — L591](homeostasis-decay-formulas.md#^ref-37b5d236-591-0) (line 591, col 0, score 0.94)
- [Per-Domain Policy System for JS Crawler — L657](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-657-0) (line 657, col 0, score 1)
- [schema-evolution-workflow — L906](schema-evolution-workflow.md#^ref-d8059b6a-906-0) (line 906, col 0, score 1)
- [Dynamic Context Model for Web Components — L809](dynamic-context-model-for-web-components.md#^ref-f7702bf8-809-0) (line 809, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L368](chroma-toolkit-consolidation-plan.md#^ref-5020e892-368-0) (line 368, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L902](migrate-to-provider-tenant-architecture.md#^ref-54382370-902-0) (line 902, col 0, score 1)
- [Pure TypeScript Search Microservice — L725](pure-typescript-search-microservice.md#^ref-d17d3a96-725-0) (line 725, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L751](performance-optimized-polyglot-bridge.md#^ref-f5579967-751-0) (line 751, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L433](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-433-0) (line 433, col 0, score 1)
- [Dynamic Context Model for Web Components — L860](dynamic-context-model-for-web-components.md#^ref-f7702bf8-860-0) (line 860, col 0, score 1)
- [Fnord Tracer Protocol — L737](fnord-tracer-protocol.md#^ref-fc21f824-737-0) (line 737, col 0, score 1)
- [komorebi-group-window-hack — L426](komorebi-group-window-hack.md#^ref-dd89372d-426-0) (line 426, col 0, score 1)
- [Promethean Chat Activity Report — L171](promethean-chat-activity-report.md#^ref-18344cf9-171-0) (line 171, col 0, score 1)
- [Promethean Infrastructure Setup — L912](promethean-infrastructure-setup.md#^ref-6deed6ac-912-0) (line 912, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L408](model-upgrade-calm-down-guide.md#^ref-db74343f-408-0) (line 408, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L704](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-704-0) (line 704, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L773](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-773-0) (line 773, col 0, score 1)
- [Dynamic Context Model for Web Components — L1173](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1173-0) (line 1173, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L818](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-818-0) (line 818, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L527](migrate-to-provider-tenant-architecture.md#^ref-54382370-527-0) (line 527, col 0, score 0.98)
- [Per-Domain Policy System for JS Crawler — L765](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-765-0) (line 765, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L733](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-733-0) (line 733, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L775](performance-optimized-polyglot-bridge.md#^ref-f5579967-775-0) (line 775, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L1755](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-1755-0) (line 1755, col 0, score 0.98)
- [Canonical Org-Babel Matplotlib Animation Template — L3499](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-3499-0) (line 3499, col 0, score 0.97)
- [Creative Moments — L1998](creative-moments.md#^ref-10d98225-1998-0) (line 1998, col 0, score 0.97)
- [Duck's Attractor States — L4538](ducks-attractor-states.md#^ref-13951643-4538-0) (line 4538, col 0, score 0.97)
- [eidolon-field-math-foundations — L8056](eidolon-field-math-foundations.md#^ref-008f2ac0-8056-0) (line 8056, col 0, score 0.97)
- [TypeScript Patch for Tool Calling Support — L851](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-851-0) (line 851, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L455](chroma-toolkit-consolidation-plan.md#^ref-5020e892-455-0) (line 455, col 0, score 1)
- [Pure TypeScript Search Microservice — L893](pure-typescript-search-microservice.md#^ref-d17d3a96-893-0) (line 893, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L481](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-481-0) (line 481, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L730](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-730-0) (line 730, col 0, score 1)
- [plan-update-confirmation — L1389](plan-update-confirmation.md#^ref-b22d79c6-1389-0) (line 1389, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L313](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-313-0) (line 313, col 0, score 1)
- [Dynamic Context Model for Web Components — L1177](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1177-0) (line 1177, col 0, score 0.96)
- [TypeScript Patch for Tool Calling Support — L693](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-693-0) (line 693, col 0, score 1)
- [Promethean Infrastructure Setup — L970](promethean-infrastructure-setup.md#^ref-6deed6ac-970-0) (line 970, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L492](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-492-0) (line 492, col 0, score 1)
- [schema-evolution-workflow — L972](schema-evolution-workflow.md#^ref-d8059b6a-972-0) (line 972, col 0, score 1)
- [Stateful Partitions and Rebalancing — L813](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-813-0) (line 813, col 0, score 1)
- [typed-struct-compiler — L634](typed-struct-compiler.md#^ref-78eeedf7-634-0) (line 634, col 0, score 1)
- [Dynamic Context Model for Web Components — L1037](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1037-0) (line 1037, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L710](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-710-0) (line 710, col 0, score 1)
- [Stateful Partitions and Rebalancing — L967](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-967-0) (line 967, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L861](migrate-to-provider-tenant-architecture.md#^ref-54382370-861-0) (line 861, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L877](migrate-to-provider-tenant-architecture.md#^ref-54382370-877-0) (line 877, col 0, score 0.99)
- [Stateful Partitions and Rebalancing — L880](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-880-0) (line 880, col 0, score 0.99)
- [Stateful Partitions and Rebalancing — L810](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-810-0) (line 810, col 0, score 0.97)
- [komorebi-group-window-hack — L380](komorebi-group-window-hack.md#^ref-dd89372d-380-0) (line 380, col 0, score 0.97)
- [Dynamic Context Model for Web Components — L808](dynamic-context-model-for-web-components.md#^ref-f7702bf8-808-0) (line 808, col 0, score 0.97)
- [Prompt_Folder_Bootstrap — L350](prompt-folder-bootstrap.md#^ref-bd4f0976-350-0) (line 350, col 0, score 0.97)
- [Ice Box Reorganization — L276](ice-box-reorganization.md#^ref-291c7d91-276-0) (line 276, col 0, score 0.97)
- [Dynamic Context Model for Web Components — L1149](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1149-0) (line 1149, col 0, score 1)
- [Promethean Infrastructure Setup — L918](promethean-infrastructure-setup.md#^ref-6deed6ac-918-0) (line 918, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L737](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-737-0) (line 737, col 0, score 1)
- [eidolon-field-math-foundations — L5037](eidolon-field-math-foundations.md#^ref-008f2ac0-5037-0) (line 5037, col 0, score 0.98)
- [zero-copy-snapshots-and-workers — L672](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-672-0) (line 672, col 0, score 0.97)
- [plan-update-confirmation — L1400](plan-update-confirmation.md#^ref-b22d79c6-1400-0) (line 1400, col 0, score 0.97)
- [eidolon-field-math-foundations — L5029](eidolon-field-math-foundations.md#^ref-008f2ac0-5029-0) (line 5029, col 0, score 0.97)
- [eidolon-field-math-foundations — L6131](eidolon-field-math-foundations.md#^ref-008f2ac0-6131-0) (line 6131, col 0, score 0.97)
- [Promethean Dev Workflow Update — L2219](promethean-dev-workflow-update.md#^ref-03a5578f-2219-0) (line 2219, col 0, score 0.97)
- [Chroma Toolkit Consolidation Plan — L498](chroma-toolkit-consolidation-plan.md#^ref-5020e892-498-0) (line 498, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L584](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-584-0) (line 584, col 0, score 1)
- [schema-evolution-workflow — L913](schema-evolution-workflow.md#^ref-d8059b6a-913-0) (line 913, col 0, score 1)
- [zero-copy-snapshots-and-workers — L598](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-598-0) (line 598, col 0, score 1)
- [komorebi-group-window-hack — L386](komorebi-group-window-hack.md#^ref-dd89372d-386-0) (line 386, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L777](performance-optimized-polyglot-bridge.md#^ref-f5579967-777-0) (line 777, col 0, score 1)
- [Stateful Partitions and Rebalancing — L805](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-805-0) (line 805, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L764](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-764-0) (line 764, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L311](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-311-0) (line 311, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L857](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-857-0) (line 857, col 0, score 1)
- [Promethean Infrastructure Setup — L879](promethean-infrastructure-setup.md#^ref-6deed6ac-879-0) (line 879, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L726](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-726-0) (line 726, col 0, score 1)
- [OpenAPI Validation Report — L111](openapi-validation-report.md#^ref-5c152b08-111-0) (line 111, col 0, score 1)
- [Pure TypeScript Search Microservice — L897](pure-typescript-search-microservice.md#^ref-d17d3a96-897-0) (line 897, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L498](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-498-0) (line 498, col 0, score 1)
- [eidolon-field-math-foundations — L7916](eidolon-field-math-foundations.md#^ref-008f2ac0-7916-0) (line 7916, col 0, score 0.99)
- [typed-struct-compiler — L676](typed-struct-compiler.md#^ref-78eeedf7-676-0) (line 676, col 0, score 1)
- [Pure TypeScript Search Microservice — L919](pure-typescript-search-microservice.md#^ref-d17d3a96-919-0) (line 919, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L705](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-705-0) (line 705, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L702](performance-optimized-polyglot-bridge.md#^ref-f5579967-702-0) (line 702, col 0, score 1)
- [plan-update-confirmation — L1356](plan-update-confirmation.md#^ref-b22d79c6-1356-0) (line 1356, col 0, score 1)
- [sibilant-macro-targets — L474](sibilant-macro-targets.md#^ref-c5c9a5c6-474-0) (line 474, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L445](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-445-0) (line 445, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L767](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-767-0) (line 767, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L599](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-599-0) (line 599, col 0, score 1)
- [Factorio AI with External Agents — L475](factorio-ai-with-external-agents.md#^ref-a4d90289-475-0) (line 475, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L325](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-325-0) (line 325, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L706](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-706-0) (line 706, col 0, score 1)
- [Stateful Partitions and Rebalancing — L814](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-814-0) (line 814, col 0, score 1)
- [Pure TypeScript Search Microservice — L886](pure-typescript-search-microservice.md#^ref-d17d3a96-886-0) (line 886, col 0, score 1)
- [zero-copy-snapshots-and-workers — L593](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-593-0) (line 593, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L786](performance-optimized-polyglot-bridge.md#^ref-f5579967-786-0) (line 786, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L698](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-698-0) (line 698, col 0, score 1)
- [windows-tiling-with-autohotkey — L3025](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-3025-0) (line 3025, col 0, score 0.98)
- [Canonical Org-Babel Matplotlib Animation Template — L1688](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-1688-0) (line 1688, col 0, score 0.98)
- [Duck's Attractor States — L2706](ducks-attractor-states.md#^ref-13951643-2706-0) (line 2706, col 0, score 0.97)
- [Promethean Dev Workflow Update — L3081](promethean-dev-workflow-update.md#^ref-03a5578f-3081-0) (line 3081, col 0, score 0.97)
- [Promethean Dev Workflow Update — L3077](promethean-dev-workflow-update.md#^ref-03a5578f-3077-0) (line 3077, col 0, score 0.97)
- [Promethean Dev Workflow Update — L3132](promethean-dev-workflow-update.md#^ref-03a5578f-3132-0) (line 3132, col 0, score 0.97)
- [Pure TypeScript Search Microservice — L878](pure-typescript-search-microservice.md#^ref-d17d3a96-878-0) (line 878, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L318](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-318-0) (line 318, col 0, score 1)
- [Factorio AI with External Agents — L579](factorio-ai-with-external-agents.md#^ref-a4d90289-579-0) (line 579, col 0, score 0.97)
- [Duck's Attractor States — L253](ducks-attractor-states.md#^ref-13951643-253-0) (line 253, col 0, score 0.97)
- [Pure TypeScript Search Microservice — L1329](pure-typescript-search-microservice.md#^ref-d17d3a96-1329-0) (line 1329, col 0, score 0.96)
- [schema-evolution-workflow — L1311](schema-evolution-workflow.md#^ref-d8059b6a-1311-0) (line 1311, col 0, score 1)
- [Stateful Partitions and Rebalancing — L1283](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-1283-0) (line 1283, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L1115](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-1115-0) (line 1115, col 0, score 0.96)
- [windows-tiling-with-autohotkey — L552](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-552-0) (line 552, col 0, score 0.96)
- [Promethean Documentation Update — L191](promethean-documentation-update.txt#^ref-0b872af2-191-0) (line 191, col 0, score 0.96)
- [Per-Domain Policy System for JS Crawler — L698](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-698-0) (line 698, col 0, score 1)
- [plan-update-confirmation — L1390](plan-update-confirmation.md#^ref-b22d79c6-1390-0) (line 1390, col 0, score 1)
- [schema-evolution-workflow — L726](schema-evolution-workflow.md#^ref-d8059b6a-726-0) (line 726, col 0, score 1)
- [Promethean Infrastructure Setup — L911](promethean-infrastructure-setup.md#^ref-6deed6ac-911-0) (line 911, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L495](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-495-0) (line 495, col 0, score 1)
- [Pure TypeScript Search Microservice — L882](pure-typescript-search-microservice.md#^ref-d17d3a96-882-0) (line 882, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L696](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-696-0) (line 696, col 0, score 1)
- [Stateful Partitions and Rebalancing — L938](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-938-0) (line 938, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L835](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-835-0) (line 835, col 0, score 1)
- [Promethean Pipelines — L437](promethean-pipelines.md#^ref-8b8e6103-437-0) (line 437, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L461](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-461-0) (line 461, col 0, score 1)
- [Docops Feature Updates — L99](docops-feature-updates-3.md#^ref-cdbd21ee-99-0) (line 99, col 0, score 1)
- [Docops Feature Updates — L109](docops-feature-updates.md#^ref-2792d448-109-0) (line 109, col 0, score 1)
- [Docops Feature Updates — L110](docops-feature-updates.md#^ref-2792d448-110-0) (line 110, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L1006](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1006-0) (line 1006, col 0, score 0.98)
- [Pipeline Enhancements — L91](pipeline-enhancements.md#^ref-e2135d9f-91-0) (line 91, col 0, score 0.98)
- [typed-struct-compiler — L657](typed-struct-compiler.md#^ref-78eeedf7-657-0) (line 657, col 0, score 1)
- [graph-ds — L559](graph-ds.md#^ref-6620e2f2-559-0) (line 559, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L453](chroma-toolkit-consolidation-plan.md#^ref-5020e892-453-0) (line 453, col 0, score 1)
- [plan-update-confirmation — L1414](plan-update-confirmation.md#^ref-b22d79c6-1414-0) (line 1414, col 0, score 1)
- [schema-evolution-workflow — L785](schema-evolution-workflow.md#^ref-d8059b6a-785-0) (line 785, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L708](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-708-0) (line 708, col 0, score 1)
- [Factorio AI with External Agents — L400](factorio-ai-with-external-agents.md#^ref-a4d90289-400-0) (line 400, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L795](migrate-to-provider-tenant-architecture.md#^ref-54382370-795-0) (line 795, col 0, score 1)
- [Promethean Infrastructure Setup — L989](promethean-infrastructure-setup.md#^ref-6deed6ac-989-0) (line 989, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L714](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-714-0) (line 714, col 0, score 1)
- [Stateful Partitions and Rebalancing — L948](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-948-0) (line 948, col 0, score 1)
- [plan-update-confirmation — L1807](plan-update-confirmation.md#^ref-b22d79c6-1807-0) (line 1807, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L277](promethean-copilot-intent-engine.md#^ref-ae24a280-277-0) (line 277, col 0, score 0.96)
- [Promethean Pipelines — L320](promethean-pipelines.md#^ref-8b8e6103-320-0) (line 320, col 0, score 1)
- [Factorio AI with External Agents — L512](factorio-ai-with-external-agents.md#^ref-a4d90289-512-0) (line 512, col 0, score 1)
- [Dynamic Context Model for Web Components — L597](dynamic-context-model-for-web-components.md#^ref-f7702bf8-597-0) (line 597, col 0, score 1)
- [The Jar of Echoes — L365](the-jar-of-echoes.md#^ref-18138627-365-0) (line 365, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L357](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-357-0) (line 357, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L405](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-405-0) (line 405, col 0, score 1)
- [Prometheus Observability Stack — L654](prometheus-observability-stack.md#^ref-e90b5a16-654-0) (line 654, col 0, score 1)
- [Promethean Dev Workflow Update — L438](promethean-dev-workflow-update.md#^ref-03a5578f-438-0) (line 438, col 0, score 1)
- [Pure TypeScript Search Microservice — L916](pure-typescript-search-microservice.md#^ref-d17d3a96-916-0) (line 916, col 0, score 1)
- [plan-update-confirmation — L1813](plan-update-confirmation.md#^ref-b22d79c6-1813-0) (line 1813, col 0, score 1)
- [Stateful Partitions and Rebalancing — L869](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-869-0) (line 869, col 0, score 0.98)
- [Pure TypeScript Search Microservice — L846](pure-typescript-search-microservice.md#^ref-d17d3a96-846-0) (line 846, col 0, score 0.97)
- [Chroma Toolkit Consolidation Plan — L325](chroma-toolkit-consolidation-plan.md#^ref-5020e892-325-0) (line 325, col 0, score 0.97)
- [Promethean-Copilot-Intent-Engine — L354](promethean-copilot-intent-engine.md#^ref-ae24a280-354-0) (line 354, col 0, score 0.97)
- [plan-update-confirmation — L1645](plan-update-confirmation.md#^ref-b22d79c6-1645-0) (line 1645, col 0, score 0.97)
- [komorebi-group-window-hack — L368](komorebi-group-window-hack.md#^ref-dd89372d-368-0) (line 368, col 0, score 0.97)
- [schema-evolution-workflow — L923](schema-evolution-workflow.md#^ref-d8059b6a-923-0) (line 923, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L480](protocol-0-the-contradiction-engine.md#^ref-9a93a756-480-0) (line 480, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L349](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-349-0) (line 349, col 0, score 1)
- [Prompt_Folder_Bootstrap — L412](prompt-folder-bootstrap.md#^ref-bd4f0976-412-0) (line 412, col 0, score 1)
- [windows-tiling-with-autohotkey — L398](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-398-0) (line 398, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L547](layer1survivabilityenvelope.md#^ref-64a9f9f9-547-0) (line 547, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L360](model-upgrade-calm-down-guide.md#^ref-db74343f-360-0) (line 360, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L243](promethean-copilot-intent-engine.md#^ref-ae24a280-243-0) (line 243, col 0, score 1)
- [schema-evolution-workflow — L768](schema-evolution-workflow.md#^ref-d8059b6a-768-0) (line 768, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L403](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-403-0) (line 403, col 0, score 1)
- [zero-copy-snapshots-and-workers — L679](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-679-0) (line 679, col 0, score 1)
- [Dynamic Context Model for Web Components — L603](dynamic-context-model-for-web-components.md#^ref-f7702bf8-603-0) (line 603, col 0, score 1)
- [Dynamic Context Model for Web Components — L619](dynamic-context-model-for-web-components.md#^ref-f7702bf8-619-0) (line 619, col 0, score 0.98)
- [Provider-Agnostic Chat Panel Implementation — L414](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-414-0) (line 414, col 0, score 0.98)
- [field-interaction-equations — L390](field-interaction-equations.md#^ref-b09141b7-390-0) (line 390, col 0, score 0.98)
- [Obsidian ChatGPT Plugin Integration Guide — L227](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-227-0) (line 227, col 0, score 0.98)
- [Per-Domain Policy System for JS Crawler — L644](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-644-0) (line 644, col 0, score 0.98)
- [schema-evolution-workflow — L769](schema-evolution-workflow.md#^ref-d8059b6a-769-0) (line 769, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L826](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-826-0) (line 826, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L369](chroma-toolkit-consolidation-plan.md#^ref-5020e892-369-0) (line 369, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L459](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-459-0) (line 459, col 0, score 1)
- [Promethean Infrastructure Setup — L832](promethean-infrastructure-setup.md#^ref-6deed6ac-832-0) (line 832, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L386](model-upgrade-calm-down-guide.md#^ref-db74343f-386-0) (line 386, col 0, score 1)
- [Dynamic Context Model for Web Components — L1110](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1110-0) (line 1110, col 0, score 1)
- [promethean-requirements — L119](promethean-requirements.md#^ref-95205cd3-119-0) (line 119, col 0, score 1)
- [Promethean Pipelines — L525](promethean-pipelines.md#^ref-8b8e6103-525-0) (line 525, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L520](layer1survivabilityenvelope.md#^ref-64a9f9f9-520-0) (line 520, col 0, score 0.99)
- [TypeScript Patch for Tool Calling Support — L917](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-917-0) (line 917, col 0, score 0.99)
- [Prompt_Folder_Bootstrap — L436](prompt-folder-bootstrap.md#^ref-bd4f0976-436-0) (line 436, col 0, score 0.99)
- [Agent Tasks: Persistence Migration to DualStore — L394](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-394-0) (line 394, col 0, score 0.99)
- [plan-update-confirmation — L1386](plan-update-confirmation.md#^ref-b22d79c6-1386-0) (line 1386, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L244](promethean-copilot-intent-engine.md#^ref-ae24a280-244-0) (line 244, col 0, score 0.99)
- [Redirecting Standard Error — L138](redirecting-standard-error.md#^ref-b3555ede-138-0) (line 138, col 0, score 0.98)
- [field-interaction-equations — L499](field-interaction-equations.md#^ref-b09141b7-499-0) (line 499, col 0, score 0.98)
- [Pure TypeScript Search Microservice — L727](pure-typescript-search-microservice.md#^ref-d17d3a96-727-0) (line 727, col 0, score 1)
- [Stateful Partitions and Rebalancing — L993](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-993-0) (line 993, col 0, score 1)
- [schema-evolution-workflow — L1017](schema-evolution-workflow.md#^ref-d8059b6a-1017-0) (line 1017, col 0, score 0.96)
- [Promethean Pipelines — L524](promethean-pipelines.md#^ref-8b8e6103-524-0) (line 524, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L157](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-157-0) (line 157, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L230](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-230-0) (line 230, col 0, score 1)
- [typed-struct-compiler — L671](typed-struct-compiler.md#^ref-78eeedf7-671-0) (line 671, col 0, score 1)
- [Dynamic Context Model for Web Components — L1123](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1123-0) (line 1123, col 0, score 1)
- [Factorio AI with External Agents — L401](factorio-ai-with-external-agents.md#^ref-a4d90289-401-0) (line 401, col 0, score 1)
- [zero-copy-snapshots-and-workers — L530](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-530-0) (line 530, col 0, score 1)
- [Factorio AI with External Agents — L372](factorio-ai-with-external-agents.md#^ref-a4d90289-372-0) (line 372, col 0, score 0.98)
- [Obsidian Templating Plugins Integration Guide — L364](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-364-0) (line 364, col 0, score 0.98)
- [i3-bluetooth-setup — L257](i3-bluetooth-setup.md#^ref-5e408692-257-0) (line 257, col 0, score 0.98)
- [Prompt_Folder_Bootstrap — L376](prompt-folder-bootstrap.md#^ref-bd4f0976-376-0) (line 376, col 0, score 0.98)
- [zero-copy-snapshots-and-workers — L604](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-604-0) (line 604, col 0, score 0.98)
- [Eidolon Field Abstract Model — L328](eidolon-field-abstract-model.md#^ref-5e8b2388-328-0) (line 328, col 0, score 0.98)
- [Model Upgrade Calm-Down Guide — L415](model-upgrade-calm-down-guide.md#^ref-db74343f-415-0) (line 415, col 0, score 0.99)
- [field-dynamics-math-blocks — L538](field-dynamics-math-blocks.md#^ref-7cfc230d-538-0) (line 538, col 0, score 1)
- [Eidolon Field Abstract Model — L392](eidolon-field-abstract-model.md#^ref-5e8b2388-392-0) (line 392, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L304](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-304-0) (line 304, col 0, score 1)
- [Duck's Attractor States — L3920](ducks-attractor-states.md#^ref-13951643-3920-0) (line 3920, col 0, score 0.97)
- [eidolon-field-math-foundations — L6482](eidolon-field-math-foundations.md#^ref-008f2ac0-6482-0) (line 6482, col 0, score 0.97)
- [Promethean Dev Workflow Update — L4027](promethean-dev-workflow-update.md#^ref-03a5578f-4027-0) (line 4027, col 0, score 0.97)
- [windows-tiling-with-autohotkey — L4509](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-4509-0) (line 4509, col 0, score 0.97)
- [Promethean Dev Workflow Update — L301](promethean-dev-workflow-update.md#^ref-03a5578f-301-0) (line 301, col 0, score 0.97)
- [Reawakening Duck — L339](reawakening-duck.md#^ref-59b5670f-339-0) (line 339, col 0, score 1)
- [Fnord Tracer Protocol — L665](fnord-tracer-protocol.md#^ref-fc21f824-665-0) (line 665, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L641](performance-optimized-polyglot-bridge.md#^ref-f5579967-641-0) (line 641, col 0, score 1)
- [field-interaction-equations — L575](field-interaction-equations.md#^ref-b09141b7-575-0) (line 575, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L993](migrate-to-provider-tenant-architecture.md#^ref-54382370-993-0) (line 993, col 0, score 1)
- [plan-update-confirmation — L1544](plan-update-confirmation.md#^ref-b22d79c6-1544-0) (line 1544, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L718](migrate-to-provider-tenant-architecture.md#^ref-54382370-718-0) (line 718, col 0, score 0.97)
- [Migrate to Provider-Tenant Architecture — L792](migrate-to-provider-tenant-architecture.md#^ref-54382370-792-0) (line 792, col 0, score 0.96)
- [Migrate to Provider-Tenant Architecture — L994](migrate-to-provider-tenant-architecture.md#^ref-54382370-994-0) (line 994, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L874](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-874-0) (line 874, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L825](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-825-0) (line 825, col 0, score 0.99)
- [plan-update-confirmation — L1439](plan-update-confirmation.md#^ref-b22d79c6-1439-0) (line 1439, col 0, score 0.99)
- [Fnord Tracer Protocol — L687](fnord-tracer-protocol.md#^ref-fc21f824-687-0) (line 687, col 0, score 0.99)
- [Layer1SurvivabilityEnvelope — L550](layer1survivabilityenvelope.md#^ref-64a9f9f9-550-0) (line 550, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L943](dynamic-context-model-for-web-components.md#^ref-f7702bf8-943-0) (line 943, col 0, score 0.99)
- [Eidolon Field Abstract Model — L516](eidolon-field-abstract-model.md#^ref-5e8b2388-516-0) (line 516, col 0, score 0.99)
- [field-interaction-equations — L502](field-interaction-equations.md#^ref-b09141b7-502-0) (line 502, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L327](layer1survivabilityenvelope.md#^ref-64a9f9f9-327-0) (line 327, col 0, score 1)
- [homeostasis-decay-formulas — L524](homeostasis-decay-formulas.md#^ref-37b5d236-524-0) (line 524, col 0, score 0.97)
- [field-interaction-equations — L343](field-interaction-equations.md#^ref-b09141b7-343-0) (line 343, col 0, score 0.97)
- [Layer1SurvivabilityEnvelope — L453](layer1survivabilityenvelope.md#^ref-64a9f9f9-453-0) (line 453, col 0, score 0.97)
- [eidolon-field-math-foundations — L331](eidolon-field-math-foundations.md#^ref-008f2ac0-331-0) (line 331, col 0, score 0.96)
- [homeostasis-decay-formulas — L343](homeostasis-decay-formulas.md#^ref-37b5d236-343-0) (line 343, col 0, score 0.96)
- [Eidolon Field Abstract Model — L393](eidolon-field-abstract-model.md#^ref-5e8b2388-393-0) (line 393, col 0, score 0.96)
- [Performance-Optimized-Polyglot-Bridge — L780](performance-optimized-polyglot-bridge.md#^ref-f5579967-780-0) (line 780, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L731](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-731-0) (line 731, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L448](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-448-0) (line 448, col 0, score 1)
- [Stateful Partitions and Rebalancing — L877](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-877-0) (line 877, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L858](migrate-to-provider-tenant-architecture.md#^ref-54382370-858-0) (line 858, col 0, score 0.98)
- [schema-evolution-workflow — L995](schema-evolution-workflow.md#^ref-d8059b6a-995-0) (line 995, col 0, score 0.98)
- [Tracing the Signal — L443](tracing-the-signal.md#^ref-c3cd4f65-443-0) (line 443, col 0, score 0.98)
- [Eidolon Field Abstract Model — L498](eidolon-field-abstract-model.md#^ref-5e8b2388-498-0) (line 498, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L194](model-upgrade-calm-down-guide.md#^ref-db74343f-194-0) (line 194, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L367](layer1survivabilityenvelope.md#^ref-64a9f9f9-367-0) (line 367, col 0, score 1)
- [Tracing the Signal — L360](tracing-the-signal.md#^ref-c3cd4f65-360-0) (line 360, col 0, score 1)
- [field-interaction-equations — L481](field-interaction-equations.md#^ref-b09141b7-481-0) (line 481, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L356](protocol-0-the-contradiction-engine.md#^ref-9a93a756-356-0) (line 356, col 0, score 1)
- [Promethean Infrastructure Setup — L1098](promethean-infrastructure-setup.md#^ref-6deed6ac-1098-0) (line 1098, col 0, score 0.98)
- [Obsidian Templating Plugins Integration Guide — L398](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-398-0) (line 398, col 0, score 0.98)
- [Admin Dashboard for User Management — L268](admin-dashboard-for-user-management.md#^ref-2901a3e9-268-0) (line 268, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L965](migrate-to-provider-tenant-architecture.md#^ref-54382370-965-0) (line 965, col 0, score 1)
- [Fnord Tracer Protocol — L680](fnord-tracer-protocol.md#^ref-fc21f824-680-0) (line 680, col 0, score 1)
- [plan-update-confirmation — L1462](plan-update-confirmation.md#^ref-b22d79c6-1462-0) (line 1462, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L2982](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-2982-0) (line 2982, col 0, score 0.97)
- [Creative Moments — L1903](creative-moments.md#^ref-10d98225-1903-0) (line 1903, col 0, score 0.97)
- [Duck's Attractor States — L4443](ducks-attractor-states.md#^ref-13951643-4443-0) (line 4443, col 0, score 0.97)
- [eidolon-field-math-foundations — L5058](eidolon-field-math-foundations.md#^ref-008f2ac0-5058-0) (line 5058, col 0, score 0.97)
- [sibilant-macro-targets — L550](sibilant-macro-targets.md#^ref-c5c9a5c6-550-0) (line 550, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L814](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-814-0) (line 814, col 0, score 1)
- [Promethean Infrastructure Setup — L1041](promethean-infrastructure-setup.md#^ref-6deed6ac-1041-0) (line 1041, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L491](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-491-0) (line 491, col 0, score 1)
- [Eidolon Field Abstract Model — L462](eidolon-field-abstract-model.md#^ref-5e8b2388-462-0) (line 462, col 0, score 0.99)
- [Provider-Agnostic Chat Panel Implementation — L612](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-612-0) (line 612, col 0, score 0.99)
- [Promethean Pipelines — L272](promethean-pipelines.md#^ref-8b8e6103-272-0) (line 272, col 0, score 0.98)
- [Prompt_Folder_Bootstrap — L425](prompt-folder-bootstrap.md#^ref-bd4f0976-425-0) (line 425, col 0, score 0.98)
- [Promethean-Copilot-Intent-Engine — L268](promethean-copilot-intent-engine.md#^ref-ae24a280-268-0) (line 268, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L328](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-328-0) (line 328, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L361](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-361-0) (line 361, col 0, score 1)
- [windows-tiling-with-autohotkey — L2650](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2650-0) (line 2650, col 0, score 0.95)
- [Canonical Org-Babel Matplotlib Animation Template — L2230](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-2230-0) (line 2230, col 0, score 0.95)
- [windows-tiling-with-autohotkey — L3044](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-3044-0) (line 3044, col 0, score 0.94)
- [eidolon-field-math-foundations — L6733](eidolon-field-math-foundations.md#^ref-008f2ac0-6733-0) (line 6733, col 0, score 0.94)
- [Canonical Org-Babel Matplotlib Animation Template — L2348](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-2348-0) (line 2348, col 0, score 0.94)
- [Self-Agency in AI Interaction — L207](self-agency-in-ai-interaction.md#^ref-49a9a860-207-0) (line 207, col 0, score 1)
- [Promethean Dev Workflow Update — L362](promethean-dev-workflow-update.md#^ref-03a5578f-362-0) (line 362, col 0, score 1)
- [schema-evolution-workflow — L1022](schema-evolution-workflow.md#^ref-d8059b6a-1022-0) (line 1022, col 0, score 1)
- [Promethean Pipelines — L232](promethean-pipelines.md#^ref-8b8e6103-232-0) (line 232, col 0, score 1)
- [Factorio AI with External Agents — L346](factorio-ai-with-external-agents.md#^ref-a4d90289-346-0) (line 346, col 0, score 1)
- [Prometheus Observability Stack — L646](prometheus-observability-stack.md#^ref-e90b5a16-646-0) (line 646, col 0, score 1)
- [Promethean State Format — L385](promethean-state-format.md#^ref-23df6ddb-385-0) (line 385, col 0, score 1)
- [Admin Dashboard for User Management — L253](admin-dashboard-for-user-management.md#^ref-2901a3e9-253-0) (line 253, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L437](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-437-0) (line 437, col 0, score 0.96)
- [Obsidian ChatGPT Plugin Integration — L164](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-164-0) (line 164, col 0, score 0.96)
- [Provider-Agnostic Chat Panel Implementation — L523](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-523-0) (line 523, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L786](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-786-0) (line 786, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L741](chroma-toolkit-consolidation-plan.md#^ref-5020e892-741-0) (line 741, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L587](performance-optimized-polyglot-bridge.md#^ref-f5579967-587-0) (line 587, col 0, score 1)
- [Reawakening Duck — L432](reawakening-duck.md#^ref-59b5670f-432-0) (line 432, col 0, score 1)
- [Factorio AI with External Agents — L460](factorio-ai-with-external-agents.md#^ref-a4d90289-460-0) (line 460, col 0, score 0.98)
- [field-interaction-equations — L431](field-interaction-equations.md#^ref-b09141b7-431-0) (line 431, col 0, score 0.97)
- [Dynamic Context Model for Web Components — L931](dynamic-context-model-for-web-components.md#^ref-f7702bf8-931-0) (line 931, col 0, score 0.97)
- [Factorio AI with External Agents — L533](factorio-ai-with-external-agents.md#^ref-a4d90289-533-0) (line 533, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L907](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-907-0) (line 907, col 0, score 1)
- [Smoke Resonance Visualizations — L261](smoke-resonance-visualizations.md#^ref-ac9d3ac5-261-0) (line 261, col 0, score 0.97)
- [eidolon-field-math-foundations — L510](eidolon-field-math-foundations.md#^ref-008f2ac0-510-0) (line 510, col 0, score 0.97)
- [Ice Box Reorganization — L368](ice-box-reorganization.md#^ref-291c7d91-368-0) (line 368, col 0, score 0.97)
- [plan-update-confirmation — L1851](plan-update-confirmation.md#^ref-b22d79c6-1851-0) (line 1851, col 0, score 0.97)
- [Per-Domain Policy System for JS Crawler — L629](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-629-0) (line 629, col 0, score 0.97)
- [Performance-Optimized-Polyglot-Bridge — L970](performance-optimized-polyglot-bridge.md#^ref-f5579967-970-0) (line 970, col 0, score 0.97)
- [TypeScript Patch for Tool Calling Support — L897](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-897-0) (line 897, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L979](migrate-to-provider-tenant-architecture.md#^ref-54382370-979-0) (line 979, col 0, score 1)
- [Promethean Dev Workflow Update — L293](promethean-dev-workflow-update.md#^ref-03a5578f-293-0) (line 293, col 0, score 1)
- [Stateful Partitions and Rebalancing — L897](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-897-0) (line 897, col 0, score 0.99)
- [Stateful Partitions and Rebalancing — L1006](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-1006-0) (line 1006, col 0, score 0.98)
- [Factorio AI with External Agents — L336](factorio-ai-with-external-agents.md#^ref-a4d90289-336-0) (line 336, col 0, score 0.98)
- [Layer1SurvivabilityEnvelope — L571](layer1survivabilityenvelope.md#^ref-64a9f9f9-571-0) (line 571, col 0, score 0.98)
- [Stateful Partitions and Rebalancing — L1033](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-1033-0) (line 1033, col 0, score 0.97)
- [Migrate to Provider-Tenant Architecture — L736](migrate-to-provider-tenant-architecture.md#^ref-54382370-736-0) (line 736, col 0, score 0.97)
- [Per-Domain Policy System for JS Crawler — L915](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-915-0) (line 915, col 0, score 0.96)
- [Performance-Optimized-Polyglot-Bridge — L1119](performance-optimized-polyglot-bridge.md#^ref-f5579967-1119-0) (line 1119, col 0, score 0.96)
- [Promethean_Eidolon_Synchronicity_Model — L349](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-349-0) (line 349, col 0, score 0.96)
- [Promethean Infrastructure Setup — L1205](promethean-infrastructure-setup.md#^ref-6deed6ac-1205-0) (line 1205, col 0, score 0.96)
- [Prometheus Observability Stack — L1018](prometheus-observability-stack.md#^ref-e90b5a16-1018-0) (line 1018, col 0, score 0.96)
- [Prompt_Folder_Bootstrap — L731](prompt-folder-bootstrap.md#^ref-bd4f0976-731-0) (line 731, col 0, score 0.96)
- [Provider-Agnostic Chat Panel Implementation — L656](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-656-0) (line 656, col 0, score 0.96)
- [Pure TypeScript Search Microservice — L1159](pure-typescript-search-microservice.md#^ref-d17d3a96-1159-0) (line 1159, col 0, score 0.96)
- [schema-evolution-workflow — L1018](schema-evolution-workflow.md#^ref-d8059b6a-1018-0) (line 1018, col 0, score 1)
- [Prometheus Observability Stack — L780](prometheus-observability-stack.md#^ref-e90b5a16-780-0) (line 780, col 0, score 0.98)
- [Docops Feature Updates — L85](docops-feature-updates-3.md#^ref-cdbd21ee-85-0) (line 85, col 0, score 0.98)
- [Docops Feature Updates — L131](docops-feature-updates.md#^ref-2792d448-131-0) (line 131, col 0, score 0.98)
- [Model Selection for Lightweight Conversational Tasks — L540](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-540-0) (line 540, col 0, score 0.98)
- [Promethean Documentation Pipeline Overview — L541](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-541-0) (line 541, col 0, score 0.98)
- [Agent Tasks: Persistence Migration to DualStore — L560](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-560-0) (line 560, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L945](dynamic-context-model-for-web-components.md#^ref-f7702bf8-945-0) (line 945, col 0, score 0.98)
- [plan-update-confirmation — L1158](plan-update-confirmation.md#^ref-b22d79c6-1158-0) (line 1158, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L280](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-280-0) (line 280, col 0, score 1)
- [graph-ds — L658](graph-ds.md#^ref-6620e2f2-658-0) (line 658, col 0, score 1)
- [Reawakening Duck — L355](reawakening-duck.md#^ref-59b5670f-355-0) (line 355, col 0, score 1)
- [Dynamic Context Model for Web Components — L1013](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1013-0) (line 1013, col 0, score 0.97)
- [Promethean Documentation Pipeline Overview — L597](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-597-0) (line 597, col 0, score 0.97)
- [Admin Dashboard for User Management — L257](admin-dashboard-for-user-management.md#^ref-2901a3e9-257-0) (line 257, col 0, score 0.97)
- [Promethean Documentation Pipeline Overview — L612](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-612-0) (line 612, col 0, score 0.97)
- [Factorio AI with External Agents — L360](factorio-ai-with-external-agents.md#^ref-a4d90289-360-0) (line 360, col 0, score 0.96)
- [Functional Refactor of TypeScript Document Processing — L438](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-438-0) (line 438, col 0, score 0.98)
- [Functional Refactor of TypeScript Document Processing — L294](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-294-0) (line 294, col 0, score 0.99)
- [Pure TypeScript Search Microservice — L1139](pure-typescript-search-microservice.md#^ref-d17d3a96-1139-0) (line 1139, col 0, score 0.98)
- [TypeScript Patch for Tool Calling Support — L1017](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-1017-0) (line 1017, col 0, score 0.98)
- [Pure TypeScript Search Microservice — L1028](pure-typescript-search-microservice.md#^ref-d17d3a96-1028-0) (line 1028, col 0, score 0.98)
- [Functional Refactor of TypeScript Document Processing — L451](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-451-0) (line 451, col 0, score 0.96)
- [eidolon-field-math-foundations — L791](eidolon-field-math-foundations.md#^ref-008f2ac0-791-0) (line 791, col 0, score 0.96)
- [Functional Refactor of TypeScript Document Processing — L439](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-439-0) (line 439, col 0, score 0.99)
- [eidolon-field-math-foundations — L1869](eidolon-field-math-foundations.md#^ref-008f2ac0-1869-0) (line 1869, col 0, score 0.98)
- [Promethean Dev Workflow Update — L1900](promethean-dev-workflow-update.md#^ref-03a5578f-1900-0) (line 1900, col 0, score 0.98)
- [DSL — L284](chunks/dsl.md#^ref-e87bc036-284-0) (line 284, col 0, score 0.98)
- [Window Management — L197](chunks/window-management.md#^ref-9e8ae388-197-0) (line 197, col 0, score 0.98)
- [komorebi-group-window-hack — L494](komorebi-group-window-hack.md#^ref-dd89372d-494-0) (line 494, col 0, score 0.98)
- [Optimizing Command Limitations in System Design — L302](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-302-0) (line 302, col 0, score 0.98)
- [Promethean-Copilot-Intent-Engine — L734](promethean-copilot-intent-engine.md#^ref-ae24a280-734-0) (line 734, col 0, score 0.98)
- [Promethean State Format — L279](promethean-state-format.md#^ref-23df6ddb-279-0) (line 279, col 0, score 0.98)
- [Chroma Toolkit Consolidation Plan — L985](chroma-toolkit-consolidation-plan.md#^ref-5020e892-985-0) (line 985, col 0, score 0.97)
- [Migrate to Provider-Tenant Architecture — L1685](migrate-to-provider-tenant-architecture.md#^ref-54382370-1685-0) (line 1685, col 0, score 0.97)
- [Model Selection for Lightweight Conversational Tasks — L438](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-438-0) (line 438, col 0, score 0.97)
- [plan-update-confirmation — L1512](plan-update-confirmation.md#^ref-b22d79c6-1512-0) (line 1512, col 0, score 0.97)
- [Obsidian Task Generation — L107](obsidian-task-generation.md#^ref-9b694a91-107-0) (line 107, col 0, score 0.97)
- [Prompt_Folder_Bootstrap — L573](prompt-folder-bootstrap.md#^ref-bd4f0976-573-0) (line 573, col 0, score 0.97)
- [JavaScript — L305](chunks/javascript.md#^ref-c1618c66-305-0) (line 305, col 0, score 0.97)
- [Unique Info Dump Index — L1044](unique-info-dump-index.md#^ref-30ec3ba6-1044-0) (line 1044, col 0, score 0.97)
- [TypeScript Patch for Tool Calling Support — L944](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-944-0) (line 944, col 0, score 0.95)
- [Diagrams — L293](chunks/diagrams.md#^ref-45cd25b5-293-0) (line 293, col 0, score 0.95)
- [DSL — L304](chunks/dsl.md#^ref-e87bc036-304-0) (line 304, col 0, score 0.95)
- [JavaScript — L442](chunks/javascript.md#^ref-c1618c66-442-0) (line 442, col 0, score 0.95)
- [Math Fundamentals — L310](chunks/math-fundamentals.md#^ref-c6e87433-310-0) (line 310, col 0, score 0.95)
- [Services — L297](chunks/services.md#^ref-75ea4a6a-297-0) (line 297, col 0, score 0.95)
- [Simulation Demo — L264](chunks/simulation-demo.md#^ref-557309a3-264-0) (line 264, col 0, score 0.95)
- [obsidian-ignore-node-modules-regex — L294](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-294-0) (line 294, col 0, score 0.95)
- [Chroma Toolkit Consolidation Plan — L987](chroma-toolkit-consolidation-plan.md#^ref-5020e892-987-0) (line 987, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1686](migrate-to-provider-tenant-architecture.md#^ref-54382370-1686-0) (line 1686, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L441](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-441-0) (line 441, col 0, score 1)
- [typed-struct-compiler — L605](typed-struct-compiler.md#^ref-78eeedf7-605-0) (line 605, col 0, score 0.96)
- [plan-update-confirmation — L1210](plan-update-confirmation.md#^ref-b22d79c6-1210-0) (line 1210, col 0, score 0.96)
- [Promethean-Copilot-Intent-Engine — L454](promethean-copilot-intent-engine.md#^ref-ae24a280-454-0) (line 454, col 0, score 0.96)
- [Tracing the Signal — L327](tracing-the-signal.md#^ref-c3cd4f65-327-0) (line 327, col 0, score 0.95)
- [eidolon-field-math-foundations — L2223](eidolon-field-math-foundations.md#^ref-008f2ac0-2223-0) (line 2223, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L293](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-293-0) (line 293, col 0, score 0.99)
- [Model Upgrade Calm-Down Guide — L346](model-upgrade-calm-down-guide.md#^ref-db74343f-346-0) (line 346, col 0, score 0.99)
- [Canonical Org-Babel Matplotlib Animation Template — L706](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-706-0) (line 706, col 0, score 0.93)
- [Creative Moments — L709](creative-moments.md#^ref-10d98225-709-0) (line 709, col 0, score 0.93)
- [Duck's Attractor States — L794](ducks-attractor-states.md#^ref-13951643-794-0) (line 794, col 0, score 0.93)
- [eidolon-field-math-foundations — L1456](eidolon-field-math-foundations.md#^ref-008f2ac0-1456-0) (line 1456, col 0, score 0.93)
- [Functional Refactor of TypeScript Document Processing — L694](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-694-0) (line 694, col 0, score 0.93)
- [ChatGPT Custom Prompts — L174](chatgpt-custom-prompts.md#^ref-930054b3-174-0) (line 174, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L469](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-469-0) (line 469, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L444](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-444-0) (line 444, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L351](model-upgrade-calm-down-guide.md#^ref-db74343f-351-0) (line 351, col 0, score 1)
- [field-dynamics-math-blocks — L351](field-dynamics-math-blocks.md#^ref-7cfc230d-351-0) (line 351, col 0, score 0.97)
- [Functional Refactor of TypeScript Document Processing — L447](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-447-0) (line 447, col 0, score 0.97)
- [ChatGPT Custom Prompts — L177](chatgpt-custom-prompts.md#^ref-930054b3-177-0) (line 177, col 0, score 0.97)
- [Promethean Documentation Pipeline Overview — L472](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-472-0) (line 472, col 0, score 0.97)
- [Debugging Broker Connections and Agent Behavior — L486](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-486-0) (line 486, col 0, score 1)
- [DuckDuckGoSearchPipeline — L180](duckduckgosearchpipeline.md#^ref-e979c50f-180-0) (line 180, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L442](ducks-self-referential-perceptual-loop.md#^ref-71726f04-442-0) (line 442, col 0, score 1)
- [Dynamic Context Model for Web Components — L1396](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1396-0) (line 1396, col 0, score 1)
- [Eidolon Field Abstract Model — L853](eidolon-field-abstract-model.md#^ref-5e8b2388-853-0) (line 853, col 0, score 1)
- [eidolon-node-lifecycle — L300](eidolon-node-lifecycle.md#^ref-938eca9c-300-0) (line 300, col 0, score 1)
- [Factorio AI with External Agents — L662](factorio-ai-with-external-agents.md#^ref-a4d90289-662-0) (line 662, col 0, score 1)
- [field-dynamics-math-blocks — L765](field-dynamics-math-blocks.md#^ref-7cfc230d-765-0) (line 765, col 0, score 1)
- [field-node-diagram-outline — L531](field-node-diagram-outline.md#^ref-1f32c94a-531-0) (line 531, col 0, score 1)
- [field-node-diagram-set — L553](field-node-diagram-set.md#^ref-22b989d5-553-0) (line 553, col 0, score 1)
- [Obsidian Task Generation — L199](obsidian-task-generation.md#^ref-9b694a91-199-0) (line 199, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L877](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-877-0) (line 877, col 0, score 1)
- [Pipeline Enhancements — L101](pipeline-enhancements.md#^ref-e2135d9f-101-0) (line 101, col 0, score 1)
- [plan-update-confirmation — L1959](plan-update-confirmation.md#^ref-b22d79c6-1959-0) (line 1959, col 0, score 1)
- [polyglot-repl-interface-layer — L532](polyglot-repl-interface-layer.md#^ref-9c79206d-532-0) (line 532, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L537](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-537-0) (line 537, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L721](promethean-copilot-intent-engine.md#^ref-ae24a280-721-0) (line 721, col 0, score 1)
- [Promethean Data Sync Protocol — L154](promethean-data-sync-protocol.md#^ref-9fab9e76-154-0) (line 154, col 0, score 1)
- [Promethean Workflow Optimization — L249](promethean-workflow-optimization.md#^ref-d614d983-249-0) (line 249, col 0, score 1)
- [Prometheus Observability Stack — L966](prometheus-observability-stack.md#^ref-e90b5a16-966-0) (line 966, col 0, score 1)
- [Prompt_Folder_Bootstrap — L681](prompt-folder-bootstrap.md#^ref-bd4f0976-681-0) (line 681, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L615](protocol-0-the-contradiction-engine.md#^ref-9a93a756-615-0) (line 615, col 0, score 1)
- [Shared — L290](chunks/shared.md#^ref-623a55f7-290-0) (line 290, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L488](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-488-0) (line 488, col 0, score 1)
- [DuckDuckGoSearchPipeline — L182](duckduckgosearchpipeline.md#^ref-e979c50f-182-0) (line 182, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L444](ducks-self-referential-perceptual-loop.md#^ref-71726f04-444-0) (line 444, col 0, score 1)
- [Dynamic Context Model for Web Components — L1398](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1398-0) (line 1398, col 0, score 1)
- [Eidolon Field Abstract Model — L855](eidolon-field-abstract-model.md#^ref-5e8b2388-855-0) (line 855, col 0, score 1)
- [eidolon-node-lifecycle — L302](eidolon-node-lifecycle.md#^ref-938eca9c-302-0) (line 302, col 0, score 1)
- [Factorio AI with External Agents — L664](factorio-ai-with-external-agents.md#^ref-a4d90289-664-0) (line 664, col 0, score 1)
- [field-dynamics-math-blocks — L767](field-dynamics-math-blocks.md#^ref-7cfc230d-767-0) (line 767, col 0, score 1)
- [field-interaction-equations — L754](field-interaction-equations.md#^ref-b09141b7-754-0) (line 754, col 0, score 1)
- [Promethean Pipelines — L555](promethean-pipelines.md#^ref-8b8e6103-555-0) (line 555, col 0, score 1)
- [promethean-requirements — L179](promethean-requirements.md#^ref-95205cd3-179-0) (line 179, col 0, score 1)
- [Promethean State Format — L546](promethean-state-format.md#^ref-23df6ddb-546-0) (line 546, col 0, score 1)
- [Promethean Workflow Optimization — L251](promethean-workflow-optimization.md#^ref-d614d983-251-0) (line 251, col 0, score 1)
- [Prometheus Observability Stack — L968](prometheus-observability-stack.md#^ref-e90b5a16-968-0) (line 968, col 0, score 1)
- [Prompt_Folder_Bootstrap — L683](prompt-folder-bootstrap.md#^ref-bd4f0976-683-0) (line 683, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L617](protocol-0-the-contradiction-engine.md#^ref-9a93a756-617-0) (line 617, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L676](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-676-0) (line 676, col 0, score 1)
- [Pure TypeScript Search Microservice — L1149](pure-typescript-search-microservice.md#^ref-d17d3a96-1149-0) (line 1149, col 0, score 1)
- [Ice Box Reorganization — L535](ice-box-reorganization.md#^ref-291c7d91-535-0) (line 535, col 0, score 1)
- [Mathematical Samplers — L259](mathematical-samplers.md#^ref-86a691ec-259-0) (line 259, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L339](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-339-0) (line 339, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L431](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-431-0) (line 431, col 0, score 1)
- [Obsidian Task Generation — L202](obsidian-task-generation.md#^ref-9b694a91-202-0) (line 202, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L474](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-474-0) (line 474, col 0, score 1)
- [Optimizing Command Limitations in System Design — L385](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-385-0) (line 385, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L846](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-846-0) (line 846, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L880](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-880-0) (line 880, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L1178](performance-optimized-polyglot-bridge.md#^ref-f5579967-1178-0) (line 1178, col 0, score 1)
- [Synchronicity Waves and Web — L379](synchronicity-waves-and-web.md#^ref-91295f3a-379-0) (line 379, col 0, score 1)
- [unique-templates — L178](templates/unique-templates.md#^ref-c26f0044-178-0) (line 178, col 0, score 1)
- [The Jar of Echoes — L555](the-jar-of-echoes.md#^ref-18138627-555-0) (line 555, col 0, score 1)
- [Tracing the Signal — L551](tracing-the-signal.md#^ref-c3cd4f65-551-0) (line 551, col 0, score 1)
- [ts-to-lisp-transpiler — L456](ts-to-lisp-transpiler.md#^ref-ba11486b-456-0) (line 456, col 0, score 1)
- [typed-struct-compiler — L916](typed-struct-compiler.md#^ref-78eeedf7-916-0) (line 916, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L963](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-963-0) (line 963, col 0, score 1)
- [Unique Concepts — L163](unique-concepts.md#^ref-ed6f3fc9-163-0) (line 163, col 0, score 1)
- [Unique Info Dump Index — L845](unique-info-dump-index.md#^ref-30ec3ba6-845-0) (line 845, col 0, score 1)
- [Services — L335](chunks/services.md#^ref-75ea4a6a-335-0) (line 335, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L493](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-493-0) (line 493, col 0, score 1)
- [DuckDuckGoSearchPipeline — L187](duckduckgosearchpipeline.md#^ref-e979c50f-187-0) (line 187, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L449](ducks-self-referential-perceptual-loop.md#^ref-71726f04-449-0) (line 449, col 0, score 1)
- [Dynamic Context Model for Web Components — L1403](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1403-0) (line 1403, col 0, score 1)
- [Eidolon Field Abstract Model — L860](eidolon-field-abstract-model.md#^ref-5e8b2388-860-0) (line 860, col 0, score 1)
- [eidolon-node-lifecycle — L307](eidolon-node-lifecycle.md#^ref-938eca9c-307-0) (line 307, col 0, score 1)
- [Factorio AI with External Agents — L669](factorio-ai-with-external-agents.md#^ref-a4d90289-669-0) (line 669, col 0, score 1)
- [field-dynamics-math-blocks — L772](field-dynamics-math-blocks.md#^ref-7cfc230d-772-0) (line 772, col 0, score 1)
- [field-interaction-equations — L759](field-interaction-equations.md#^ref-b09141b7-759-0) (line 759, col 0, score 1)
- [field-node-diagram-outline — L538](field-node-diagram-outline.md#^ref-1f32c94a-538-0) (line 538, col 0, score 1)
- [field-node-diagram-set — L560](field-node-diagram-set.md#^ref-22b989d5-560-0) (line 560, col 0, score 1)
- [Smoke Resonance Visualizations — L337](smoke-resonance-visualizations.md#^ref-ac9d3ac5-337-0) (line 337, col 0, score 1)
- [Synchronicity Waves and Web — L381](synchronicity-waves-and-web.md#^ref-91295f3a-381-0) (line 381, col 0, score 1)
- [unique-templates — L180](templates/unique-templates.md#^ref-c26f0044-180-0) (line 180, col 0, score 1)
- [The Jar of Echoes — L557](the-jar-of-echoes.md#^ref-18138627-557-0) (line 557, col 0, score 1)
- [Tracing the Signal — L553](tracing-the-signal.md#^ref-c3cd4f65-553-0) (line 553, col 0, score 1)
- [ts-to-lisp-transpiler — L458](ts-to-lisp-transpiler.md#^ref-ba11486b-458-0) (line 458, col 0, score 1)
- [typed-struct-compiler — L918](typed-struct-compiler.md#^ref-78eeedf7-918-0) (line 918, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L965](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-965-0) (line 965, col 0, score 1)
- [Unique Concepts — L165](unique-concepts.md#^ref-ed6f3fc9-165-0) (line 165, col 0, score 1)
- [Promethean Workflow Optimization — L257](promethean-workflow-optimization.md#^ref-d614d983-257-0) (line 257, col 0, score 1)
- [Prometheus Observability Stack — L974](prometheus-observability-stack.md#^ref-e90b5a16-974-0) (line 974, col 0, score 1)
- [Prompt_Folder_Bootstrap — L689](prompt-folder-bootstrap.md#^ref-bd4f0976-689-0) (line 689, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L623](protocol-0-the-contradiction-engine.md#^ref-9a93a756-623-0) (line 623, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L682](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-682-0) (line 682, col 0, score 1)
- [Pure TypeScript Search Microservice — L1155](pure-typescript-search-microservice.md#^ref-d17d3a96-1155-0) (line 1155, col 0, score 1)
- [Reawakening Duck — L605](reawakening-duck.md#^ref-59b5670f-605-0) (line 605, col 0, score 1)
- [Redirecting Standard Error — L284](redirecting-standard-error.md#^ref-b3555ede-284-0) (line 284, col 0, score 1)
- [ripple-propagation-demo — L518](ripple-propagation-demo.md#^ref-8430617b-518-0) (line 518, col 0, score 1)
- [Synchronicity Waves and Web — L415](synchronicity-waves-and-web.md#^ref-91295f3a-415-0) (line 415, col 0, score 1)
- [unique-templates — L143](templates/unique-templates.md#^ref-c26f0044-143-0) (line 143, col 0, score 1)
- [Tracing the Signal — L524](tracing-the-signal.md#^ref-c3cd4f65-524-0) (line 524, col 0, score 1)
- [ts-to-lisp-transpiler — L480](ts-to-lisp-transpiler.md#^ref-ba11486b-480-0) (line 480, col 0, score 1)
- [typed-struct-compiler — L996](typed-struct-compiler.md#^ref-78eeedf7-996-0) (line 996, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L1107](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-1107-0) (line 1107, col 0, score 1)
- [Unique Concepts — L127](unique-concepts.md#^ref-ed6f3fc9-127-0) (line 127, col 0, score 1)
- [Unique Info Dump Index — L882](unique-info-dump-index.md#^ref-30ec3ba6-882-0) (line 882, col 0, score 1)
- [windows-tiling-with-autohotkey — L544](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-544-0) (line 544, col 0, score 1)
- [eidolon-node-lifecycle — L271](eidolon-node-lifecycle.md#^ref-938eca9c-271-0) (line 271, col 0, score 1)
- [field-dynamics-math-blocks — L684](field-dynamics-math-blocks.md#^ref-7cfc230d-684-0) (line 684, col 0, score 1)
- [field-interaction-equations — L809](field-interaction-equations.md#^ref-b09141b7-809-0) (line 809, col 0, score 1)
- [field-node-diagram-visualizations — L398](field-node-diagram-visualizations.md#^ref-e9b27b06-398-0) (line 398, col 0, score 1)
- [homeostasis-decay-formulas — L824](homeostasis-decay-formulas.md#^ref-37b5d236-824-0) (line 824, col 0, score 1)
- [Promethean Documentation Overview — L51](promethean-documentation-overview.md#^ref-9413237f-51-0) (line 51, col 0, score 1)
- [Promethean Workflow Optimization — L230](promethean-workflow-optimization.md#^ref-d614d983-230-0) (line 230, col 0, score 1)
- [Prompt_Folder_Bootstrap — L884](prompt-folder-bootstrap.md#^ref-bd4f0976-884-0) (line 884, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L687](protocol-0-the-contradiction-engine.md#^ref-9a93a756-687-0) (line 687, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L736](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-736-0) (line 736, col 0, score 1)
- [Reawakening Duck — L489](reawakening-duck.md#^ref-59b5670f-489-0) (line 489, col 0, score 1)
- [Reawakening Duck — L490](reawakening-duck.md#^ref-59b5670f-490-0) (line 490, col 0, score 1)
- [Redirecting Standard Error — L249](redirecting-standard-error.md#^ref-b3555ede-249-0) (line 249, col 0, score 1)
- [ripple-propagation-demo — L445](ripple-propagation-demo.md#^ref-8430617b-445-0) (line 445, col 0, score 1)
- [Self-Agency in AI Interaction — L387](self-agency-in-ai-interaction.md#^ref-49a9a860-387-0) (line 387, col 0, score 1)
- [sibilant-macro-targets — L727](sibilant-macro-targets.md#^ref-c5c9a5c6-727-0) (line 727, col 0, score 1)
- [Smoke Resonance Visualizations — L411](smoke-resonance-visualizations.md#^ref-ac9d3ac5-411-0) (line 411, col 0, score 1)
- [Stateful Partitions and Rebalancing — L1277](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-1277-0) (line 1277, col 0, score 1)
- [Synchronicity Waves and Web — L417](synchronicity-waves-and-web.md#^ref-91295f3a-417-0) (line 417, col 0, score 1)
- [unique-templates — L145](templates/unique-templates.md#^ref-c26f0044-145-0) (line 145, col 0, score 1)
- [Tracing the Signal — L526](tracing-the-signal.md#^ref-c3cd4f65-526-0) (line 526, col 0, score 1)
- [Pure TypeScript Search Microservice — L1324](pure-typescript-search-microservice.md#^ref-d17d3a96-1324-0) (line 1324, col 0, score 1)
- [Stateful Partitions and Rebalancing — L1278](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-1278-0) (line 1278, col 0, score 1)
- [Synchronicity Waves and Web — L418](synchronicity-waves-and-web.md#^ref-91295f3a-418-0) (line 418, col 0, score 1)
- [unique-templates — L146](templates/unique-templates.md#^ref-c26f0044-146-0) (line 146, col 0, score 1)
- [Tracing the Signal — L527](tracing-the-signal.md#^ref-c3cd4f65-527-0) (line 527, col 0, score 1)
- [ts-to-lisp-transpiler — L483](ts-to-lisp-transpiler.md#^ref-ba11486b-483-0) (line 483, col 0, score 1)
- [typed-struct-compiler — L999](typed-struct-compiler.md#^ref-78eeedf7-999-0) (line 999, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L1110](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-1110-0) (line 1110, col 0, score 1)
- [Unique Concepts — L130](unique-concepts.md#^ref-ed6f3fc9-130-0) (line 130, col 0, score 1)
- [Synchronicity Waves and Web — L419](synchronicity-waves-and-web.md#^ref-91295f3a-419-0) (line 419, col 0, score 1)
- [unique-templates — L147](templates/unique-templates.md#^ref-c26f0044-147-0) (line 147, col 0, score 1)
- [Tracing the Signal — L528](tracing-the-signal.md#^ref-c3cd4f65-528-0) (line 528, col 0, score 1)
- [ts-to-lisp-transpiler — L484](ts-to-lisp-transpiler.md#^ref-ba11486b-484-0) (line 484, col 0, score 1)
- [typed-struct-compiler — L1000](typed-struct-compiler.md#^ref-78eeedf7-1000-0) (line 1000, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L1111](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-1111-0) (line 1111, col 0, score 1)
- [Unique Concepts — L131](unique-concepts.md#^ref-ed6f3fc9-131-0) (line 131, col 0, score 1)
- [Unique Info Dump Index — L886](unique-info-dump-index.md#^ref-30ec3ba6-886-0) (line 886, col 0, score 1)
- [windows-tiling-with-autohotkey — L548](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-548-0) (line 548, col 0, score 1)
- [Synchronicity Waves and Web — L420](synchronicity-waves-and-web.md#^ref-91295f3a-420-0) (line 420, col 0, score 1)
- [unique-templates — L148](templates/unique-templates.md#^ref-c26f0044-148-0) (line 148, col 0, score 1)
- [Tracing the Signal — L529](tracing-the-signal.md#^ref-c3cd4f65-529-0) (line 529, col 0, score 1)
- [ts-to-lisp-transpiler — L485](ts-to-lisp-transpiler.md#^ref-ba11486b-485-0) (line 485, col 0, score 1)
- [typed-struct-compiler — L1001](typed-struct-compiler.md#^ref-78eeedf7-1001-0) (line 1001, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L1112](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-1112-0) (line 1112, col 0, score 1)
- [Unique Concepts — L132](unique-concepts.md#^ref-ed6f3fc9-132-0) (line 132, col 0, score 1)
- [Unique Info Dump Index — L887](unique-info-dump-index.md#^ref-30ec3ba6-887-0) (line 887, col 0, score 1)
- [windows-tiling-with-autohotkey — L549](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-549-0) (line 549, col 0, score 1)
- [Synchronicity Waves and Web — L421](synchronicity-waves-and-web.md#^ref-91295f3a-421-0) (line 421, col 0, score 1)
- [unique-templates — L149](templates/unique-templates.md#^ref-c26f0044-149-0) (line 149, col 0, score 1)
- [Tracing the Signal — L530](tracing-the-signal.md#^ref-c3cd4f65-530-0) (line 530, col 0, score 1)
- [ts-to-lisp-transpiler — L486](ts-to-lisp-transpiler.md#^ref-ba11486b-486-0) (line 486, col 0, score 1)
- [typed-struct-compiler — L1002](typed-struct-compiler.md#^ref-78eeedf7-1002-0) (line 1002, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L1113](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-1113-0) (line 1113, col 0, score 1)
- [Unique Concepts — L133](unique-concepts.md#^ref-ed6f3fc9-133-0) (line 133, col 0, score 1)
- [Unique Info Dump Index — L888](unique-info-dump-index.md#^ref-30ec3ba6-888-0) (line 888, col 0, score 1)
- [schema-evolution-workflow — L1310](schema-evolution-workflow.md#^ref-d8059b6a-1310-0) (line 1310, col 0, score 1)
- [Self-Agency in AI Interaction — L392](self-agency-in-ai-interaction.md#^ref-49a9a860-392-0) (line 392, col 0, score 1)
- [sibilant-macro-targets — L732](sibilant-macro-targets.md#^ref-c5c9a5c6-732-0) (line 732, col 0, score 1)
- [Smoke Resonance Visualizations — L416](smoke-resonance-visualizations.md#^ref-ac9d3ac5-416-0) (line 416, col 0, score 1)
- [Stateful Partitions and Rebalancing — L1282](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-1282-0) (line 1282, col 0, score 1)
- [Synchronicity Waves and Web — L422](synchronicity-waves-and-web.md#^ref-91295f3a-422-0) (line 422, col 0, score 1)
- [unique-templates — L150](templates/unique-templates.md#^ref-c26f0044-150-0) (line 150, col 0, score 1)
- [Tracing the Signal — L531](tracing-the-signal.md#^ref-c3cd4f65-531-0) (line 531, col 0, score 1)
- [ts-to-lisp-transpiler — L487](ts-to-lisp-transpiler.md#^ref-ba11486b-487-0) (line 487, col 0, score 1)
- [Promethean Documentation Update — L135](promethean-documentation-update.md#^ref-c0392040-135-0) (line 135, col 0, score 1)
- [ripple-propagation-demo — L451](ripple-propagation-demo.md#^ref-8430617b-451-0) (line 451, col 0, score 1)
- [Self-Agency in AI Interaction — L393](self-agency-in-ai-interaction.md#^ref-49a9a860-393-0) (line 393, col 0, score 1)
- [sibilant-macro-targets — L733](sibilant-macro-targets.md#^ref-c5c9a5c6-733-0) (line 733, col 0, score 1)
- [Smoke Resonance Visualizations — L417](smoke-resonance-visualizations.md#^ref-ac9d3ac5-417-0) (line 417, col 0, score 1)
- [Synchronicity Waves and Web — L423](synchronicity-waves-and-web.md#^ref-91295f3a-423-0) (line 423, col 0, score 1)
- [unique-templates — L151](templates/unique-templates.md#^ref-c26f0044-151-0) (line 151, col 0, score 1)
- [Tracing the Signal — L532](tracing-the-signal.md#^ref-c3cd4f65-532-0) (line 532, col 0, score 1)
- [Redirecting Standard Error — L256](redirecting-standard-error.md#^ref-b3555ede-256-0) (line 256, col 0, score 1)
- [ripple-propagation-demo — L452](ripple-propagation-demo.md#^ref-8430617b-452-0) (line 452, col 0, score 1)
- [schema-evolution-workflow — L1312](schema-evolution-workflow.md#^ref-d8059b6a-1312-0) (line 1312, col 0, score 1)
- [Self-Agency in AI Interaction — L394](self-agency-in-ai-interaction.md#^ref-49a9a860-394-0) (line 394, col 0, score 1)
- [sibilant-macro-targets — L734](sibilant-macro-targets.md#^ref-c5c9a5c6-734-0) (line 734, col 0, score 1)
- [Smoke Resonance Visualizations — L418](smoke-resonance-visualizations.md#^ref-ac9d3ac5-418-0) (line 418, col 0, score 1)
- [Stateful Partitions and Rebalancing — L1284](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-1284-0) (line 1284, col 0, score 1)
- [Synchronicity Waves and Web — L424](synchronicity-waves-and-web.md#^ref-91295f3a-424-0) (line 424, col 0, score 1)
- [unique-templates — L152](templates/unique-templates.md#^ref-c26f0044-152-0) (line 152, col 0, score 1)
- [Tracing the Signal — L533](tracing-the-signal.md#^ref-c3cd4f65-533-0) (line 533, col 0, score 1)
- [Simulation Demo — L362](chunks/simulation-demo.md#^ref-557309a3-362-0) (line 362, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L496](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-496-0) (line 496, col 0, score 1)
- [DuckDuckGoSearchPipeline — L162](duckduckgosearchpipeline.md#^ref-e979c50f-162-0) (line 162, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L491](ducks-self-referential-perceptual-loop.md#^ref-71726f04-491-0) (line 491, col 0, score 1)
- [Dynamic Context Model for Web Components — L771](dynamic-context-model-for-web-components.md#^ref-f7702bf8-771-0) (line 771, col 0, score 1)
- [Eidolon Field Abstract Model — L951](eidolon-field-abstract-model.md#^ref-5e8b2388-951-0) (line 951, col 0, score 1)
- [Factorio AI with External Agents — L722](factorio-ai-with-external-agents.md#^ref-a4d90289-722-0) (line 722, col 0, score 1)
- [field-dynamics-math-blocks — L878](field-dynamics-math-blocks.md#^ref-7cfc230d-878-0) (line 878, col 0, score 1)
- [field-interaction-equations — L925](field-interaction-equations.md#^ref-b09141b7-925-0) (line 925, col 0, score 1)
- [field-node-diagram-outline — L655](field-node-diagram-outline.md#^ref-1f32c94a-655-0) (line 655, col 0, score 1)
- [Stateful Partitions and Rebalancing — L1240](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-1240-0) (line 1240, col 0, score 1)
- [Synchronicity Waves and Web — L466](synchronicity-waves-and-web.md#^ref-91295f3a-466-0) (line 466, col 0, score 1)
- [unique-templates — L154](templates/unique-templates.md#^ref-c26f0044-154-0) (line 154, col 0, score 1)
- [The Jar of Echoes — L539](the-jar-of-echoes.md#^ref-18138627-539-0) (line 539, col 0, score 1)
- [Tracing the Signal — L535](tracing-the-signal.md#^ref-c3cd4f65-535-0) (line 535, col 0, score 1)
- [ts-to-lisp-transpiler — L342](ts-to-lisp-transpiler.md#^ref-ba11486b-342-0) (line 342, col 0, score 1)
- [typed-struct-compiler — L920](typed-struct-compiler.md#^ref-78eeedf7-920-0) (line 920, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L1099](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-1099-0) (line 1099, col 0, score 1)
- [Unique Concepts — L138](unique-concepts.md#^ref-ed6f3fc9-138-0) (line 138, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L686](promethean-copilot-intent-engine.md#^ref-ae24a280-686-0) (line 686, col 0, score 1)
- [Promethean Infrastructure Setup — L1460](promethean-infrastructure-setup.md#^ref-6deed6ac-1460-0) (line 1460, col 0, score 1)
- [Promethean Pipelines — L573](promethean-pipelines.md#^ref-8b8e6103-573-0) (line 573, col 0, score 1)
- [promethean-requirements — L198](promethean-requirements.md#^ref-95205cd3-198-0) (line 198, col 0, score 1)
- [Promethean State Format — L477](promethean-state-format.md#^ref-23df6ddb-477-0) (line 477, col 0, score 1)
- [Promethean Workflow Optimization — L241](promethean-workflow-optimization.md#^ref-d614d983-241-0) (line 241, col 0, score 1)
- [Prometheus Observability Stack — L1035](prometheus-observability-stack.md#^ref-e90b5a16-1035-0) (line 1035, col 0, score 1)
- [Prompt_Folder_Bootstrap — L839](prompt-folder-bootstrap.md#^ref-bd4f0976-839-0) (line 839, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L626](protocol-0-the-contradiction-engine.md#^ref-9a93a756-626-0) (line 626, col 0, score 1)
- [Redirecting Standard Error — L259](redirecting-standard-error.md#^ref-b3555ede-259-0) (line 259, col 0, score 1)
- [Ice Box Reorganization — L628](ice-box-reorganization.md#^ref-291c7d91-628-0) (line 628, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L517](model-upgrade-calm-down-guide.md#^ref-db74343f-517-0) (line 517, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L221](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-221-0) (line 221, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L348](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-348-0) (line 348, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L477](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-477-0) (line 477, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L478](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-478-0) (line 478, col 0, score 1)
- [Obsidian Task Generation — L173](obsidian-task-generation.md#^ref-9b694a91-173-0) (line 173, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L558](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-558-0) (line 558, col 0, score 1)
- [OpenAPI Validation Report — L201](openapi-validation-report.md#^ref-5c152b08-201-0) (line 201, col 0, score 1)
- [Optimizing Command Limitations in System Design — L365](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-365-0) (line 365, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L495](ducks-self-referential-perceptual-loop.md#^ref-71726f04-495-0) (line 495, col 0, score 1)
- [Factorio AI with External Agents — L726](factorio-ai-with-external-agents.md#^ref-a4d90289-726-0) (line 726, col 0, score 1)
- [field-dynamics-math-blocks — L882](field-dynamics-math-blocks.md#^ref-7cfc230d-882-0) (line 882, col 0, score 1)
- [field-interaction-equations — L929](field-interaction-equations.md#^ref-b09141b7-929-0) (line 929, col 0, score 1)
- [field-node-diagram-outline — L659](field-node-diagram-outline.md#^ref-1f32c94a-659-0) (line 659, col 0, score 1)
- [field-node-diagram-set — L703](field-node-diagram-set.md#^ref-22b989d5-703-0) (line 703, col 0, score 1)
- [field-node-diagram-visualizations — L585](field-node-diagram-visualizations.md#^ref-e9b27b06-585-0) (line 585, col 0, score 1)
- [Fnord Tracer Protocol — L1043](fnord-tracer-protocol.md#^ref-fc21f824-1043-0) (line 1043, col 0, score 1)
- [graph-ds — L865](graph-ds.md#^ref-6620e2f2-865-0) (line 865, col 0, score 1)
- [heartbeat-fragment-demo — L652](heartbeat-fragment-demo.md#^ref-dd00677a-652-0) (line 652, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L539](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-539-0) (line 539, col 0, score 1)
- [ChatGPT Custom Prompts — L160](chatgpt-custom-prompts.md#^ref-930054b3-160-0) (line 160, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L867](chroma-toolkit-consolidation-plan.md#^ref-5020e892-867-0) (line 867, col 0, score 1)
- [Diagrams — L508](chunks/diagrams.md#^ref-45cd25b5-508-0) (line 508, col 0, score 1)
- [DSL — L173](chunks/dsl.md#^ref-e87bc036-173-0) (line 173, col 0, score 1)
- [JavaScript — L364](chunks/javascript.md#^ref-c1618c66-364-0) (line 364, col 0, score 1)
- [Math Fundamentals — L377](chunks/math-fundamentals.md#^ref-c6e87433-377-0) (line 377, col 0, score 1)
- [Operations — L147](chunks/operations.md#^ref-f1add613-147-0) (line 147, col 0, score 1)
- [Services — L353](chunks/services.md#^ref-75ea4a6a-353-0) (line 353, col 0, score 1)
- [Shared — L335](chunks/shared.md#^ref-623a55f7-335-0) (line 335, col 0, score 1)
- [ChatGPT Custom Prompts — L161](chatgpt-custom-prompts.md#^ref-930054b3-161-0) (line 161, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L868](chroma-toolkit-consolidation-plan.md#^ref-5020e892-868-0) (line 868, col 0, score 1)
- [Diagrams — L509](chunks/diagrams.md#^ref-45cd25b5-509-0) (line 509, col 0, score 1)
- [DSL — L174](chunks/dsl.md#^ref-e87bc036-174-0) (line 174, col 0, score 1)
- [JavaScript — L365](chunks/javascript.md#^ref-c1618c66-365-0) (line 365, col 0, score 1)
- [Math Fundamentals — L378](chunks/math-fundamentals.md#^ref-c6e87433-378-0) (line 378, col 0, score 1)
- [Operations — L148](chunks/operations.md#^ref-f1add613-148-0) (line 148, col 0, score 1)
- [Services — L354](chunks/services.md#^ref-75ea4a6a-354-0) (line 354, col 0, score 1)
- [Shared — L336](chunks/shared.md#^ref-623a55f7-336-0) (line 336, col 0, score 1)
- [Stateful Partitions and Rebalancing — L1246](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-1246-0) (line 1246, col 0, score 1)
- [Synchronicity Waves and Web — L472](synchronicity-waves-and-web.md#^ref-91295f3a-472-0) (line 472, col 0, score 1)
- [unique-templates — L160](templates/unique-templates.md#^ref-c26f0044-160-0) (line 160, col 0, score 1)
- [The Jar of Echoes — L545](the-jar-of-echoes.md#^ref-18138627-545-0) (line 545, col 0, score 1)
- [Tracing the Signal — L541](tracing-the-signal.md#^ref-c3cd4f65-541-0) (line 541, col 0, score 1)
- [ts-to-lisp-transpiler — L348](ts-to-lisp-transpiler.md#^ref-ba11486b-348-0) (line 348, col 0, score 1)
- [typed-struct-compiler — L926](typed-struct-compiler.md#^ref-78eeedf7-926-0) (line 926, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L1105](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-1105-0) (line 1105, col 0, score 1)
- [Unique Concepts — L144](unique-concepts.md#^ref-ed6f3fc9-144-0) (line 144, col 0, score 1)
- [Stateful Partitions and Rebalancing — L1247](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-1247-0) (line 1247, col 0, score 1)
- [Synchronicity Waves and Web — L473](synchronicity-waves-and-web.md#^ref-91295f3a-473-0) (line 473, col 0, score 1)
- [unique-templates — L161](templates/unique-templates.md#^ref-c26f0044-161-0) (line 161, col 0, score 1)
- [The Jar of Echoes — L546](the-jar-of-echoes.md#^ref-18138627-546-0) (line 546, col 0, score 1)
- [Tracing the Signal — L542](tracing-the-signal.md#^ref-c3cd4f65-542-0) (line 542, col 0, score 1)
- [ts-to-lisp-transpiler — L349](ts-to-lisp-transpiler.md#^ref-ba11486b-349-0) (line 349, col 0, score 1)
- [typed-struct-compiler — L927](typed-struct-compiler.md#^ref-78eeedf7-927-0) (line 927, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L1106](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-1106-0) (line 1106, col 0, score 1)
- [Unique Concepts — L145](unique-concepts.md#^ref-ed6f3fc9-145-0) (line 145, col 0, score 1)
- [eidolon-node-lifecycle — L479](eidolon-node-lifecycle.md#^ref-938eca9c-479-0) (line 479, col 0, score 1)
- [Factorio AI with External Agents — L730](factorio-ai-with-external-agents.md#^ref-a4d90289-730-0) (line 730, col 0, score 1)
- [field-dynamics-math-blocks — L886](field-dynamics-math-blocks.md#^ref-7cfc230d-886-0) (line 886, col 0, score 1)
- [field-interaction-equations — L933](field-interaction-equations.md#^ref-b09141b7-933-0) (line 933, col 0, score 1)
- [field-node-diagram-outline — L663](field-node-diagram-outline.md#^ref-1f32c94a-663-0) (line 663, col 0, score 1)
- [field-node-diagram-visualizations — L590](field-node-diagram-visualizations.md#^ref-e9b27b06-590-0) (line 590, col 0, score 1)
- [Fnord Tracer Protocol — L1048](fnord-tracer-protocol.md#^ref-fc21f824-1048-0) (line 1048, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L399](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-399-0) (line 399, col 0, score 1)
- [Promethean Documentation Overview — L69](promethean-documentation-overview.md#^ref-9413237f-69-0) (line 69, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L527](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-527-0) (line 527, col 0, score 1)
- [Promethean Documentation Update — L146](promethean-documentation-update.md#^ref-c0392040-146-0) (line 146, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L262](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-262-0) (line 262, col 0, score 1)
- [Promethean Infrastructure Setup — L1134](promethean-infrastructure-setup.md#^ref-6deed6ac-1134-0) (line 1134, col 0, score 1)
- [Promethean Pipelines — L562](promethean-pipelines.md#^ref-8b8e6103-562-0) (line 562, col 0, score 1)
- [promethean-requirements — L205](promethean-requirements.md#^ref-95205cd3-205-0) (line 205, col 0, score 1)
- [Promethean State Format — L258](promethean-state-format.md#^ref-23df6ddb-258-0) (line 258, col 0, score 1)
- [Promethean Workflow Optimization — L220](promethean-workflow-optimization.md#^ref-d614d983-220-0) (line 220, col 0, score 1)
- [Prometheus Observability Stack — L742](prometheus-observability-stack.md#^ref-e90b5a16-742-0) (line 742, col 0, score 1)
- [Prompt_Folder_Bootstrap — L365](prompt-folder-bootstrap.md#^ref-bd4f0976-365-0) (line 365, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L534](chroma-toolkit-consolidation-plan.md#^ref-5020e892-534-0) (line 534, col 0, score 1)
- [Diagrams — L329](chunks/diagrams.md#^ref-45cd25b5-329-0) (line 329, col 0, score 1)
- [DSL — L451](chunks/dsl.md#^ref-e87bc036-451-0) (line 451, col 0, score 1)
- [JavaScript — L369](chunks/javascript.md#^ref-c1618c66-369-0) (line 369, col 0, score 1)
- [Math Fundamentals — L382](chunks/math-fundamentals.md#^ref-c6e87433-382-0) (line 382, col 0, score 1)
- [Operations — L152](chunks/operations.md#^ref-f1add613-152-0) (line 152, col 0, score 1)
- [Shared — L246](chunks/shared.md#^ref-623a55f7-246-0) (line 246, col 0, score 1)
- [Window Management — L407](chunks/window-management.md#^ref-9e8ae388-407-0) (line 407, col 0, score 1)
- [Factorio AI with External Agents — L436](factorio-ai-with-external-agents.md#^ref-a4d90289-436-0) (line 436, col 0, score 1)
- [field-dynamics-math-blocks — L518](field-dynamics-math-blocks.md#^ref-7cfc230d-518-0) (line 518, col 0, score 1)
- [field-interaction-equations — L542](field-interaction-equations.md#^ref-b09141b7-542-0) (line 542, col 0, score 1)
- [field-node-diagram-set — L498](field-node-diagram-set.md#^ref-22b989d5-498-0) (line 498, col 0, score 1)
- [field-node-diagram-visualizations — L371](field-node-diagram-visualizations.md#^ref-e9b27b06-371-0) (line 371, col 0, score 1)
- [Reawakening Duck — L259](reawakening-duck.md#^ref-59b5670f-259-0) (line 259, col 0, score 1)
- [Smoke Resonance Visualizations — L302](smoke-resonance-visualizations.md#^ref-ac9d3ac5-302-0) (line 302, col 0, score 1)
- [Stateful Partitions and Rebalancing — L1287](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-1287-0) (line 1287, col 0, score 1)
- [Synchronicity Waves and Web — L319](synchronicity-waves-and-web.md#^ref-91295f3a-319-0) (line 319, col 0, score 1)
- [unique-templates — L164](templates/unique-templates.md#^ref-c26f0044-164-0) (line 164, col 0, score 1)
- [The Jar of Echoes — L306](the-jar-of-echoes.md#^ref-18138627-306-0) (line 306, col 0, score 1)
- [Tracing the Signal — L404](tracing-the-signal.md#^ref-c3cd4f65-404-0) (line 404, col 0, score 1)
- [ts-to-lisp-transpiler — L508](ts-to-lisp-transpiler.md#^ref-ba11486b-508-0) (line 508, col 0, score 1)
- [typed-struct-compiler — L940](typed-struct-compiler.md#^ref-78eeedf7-940-0) (line 940, col 0, score 1)
- [sibilant-macro-targets — L592](sibilant-macro-targets.md#^ref-c5c9a5c6-592-0) (line 592, col 0, score 1)
- [Smoke Resonance Visualizations — L303](smoke-resonance-visualizations.md#^ref-ac9d3ac5-303-0) (line 303, col 0, score 1)
- [Stateful Partitions and Rebalancing — L1288](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-1288-0) (line 1288, col 0, score 1)
- [Synchronicity Waves and Web — L320](synchronicity-waves-and-web.md#^ref-91295f3a-320-0) (line 320, col 0, score 1)
- [unique-templates — L165](templates/unique-templates.md#^ref-c26f0044-165-0) (line 165, col 0, score 1)
- [The Jar of Echoes — L307](the-jar-of-echoes.md#^ref-18138627-307-0) (line 307, col 0, score 1)
- [Tracing the Signal — L405](tracing-the-signal.md#^ref-c3cd4f65-405-0) (line 405, col 0, score 1)
- [ts-to-lisp-transpiler — L509](ts-to-lisp-transpiler.md#^ref-ba11486b-509-0) (line 509, col 0, score 1)
- [typed-struct-compiler — L941](typed-struct-compiler.md#^ref-78eeedf7-941-0) (line 941, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L746](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-746-0) (line 746, col 0, score 1)
- [ChatGPT Custom Prompts — L140](chatgpt-custom-prompts.md#^ref-930054b3-140-0) (line 140, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L537](chroma-toolkit-consolidation-plan.md#^ref-5020e892-537-0) (line 537, col 0, score 1)
- [Diagrams — L332](chunks/diagrams.md#^ref-45cd25b5-332-0) (line 332, col 0, score 1)
- [DSL — L454](chunks/dsl.md#^ref-e87bc036-454-0) (line 454, col 0, score 1)
- [JavaScript — L372](chunks/javascript.md#^ref-c1618c66-372-0) (line 372, col 0, score 1)
- [Math Fundamentals — L385](chunks/math-fundamentals.md#^ref-c6e87433-385-0) (line 385, col 0, score 1)
- [Operations — L155](chunks/operations.md#^ref-f1add613-155-0) (line 155, col 0, score 1)
- [Services — L380](chunks/services.md#^ref-75ea4a6a-380-0) (line 380, col 0, score 1)
- [Shared — L249](chunks/shared.md#^ref-623a55f7-249-0) (line 249, col 0, score 1)
- [komorebi-group-window-hack — L715](komorebi-group-window-hack.md#^ref-dd89372d-715-0) (line 715, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L258](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-258-0) (line 258, col 0, score 1)
- [OpenAPI Validation Report — L212](openapi-validation-report.md#^ref-5c152b08-212-0) (line 212, col 0, score 1)
- [Optimizing Command Limitations in System Design — L159](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-159-0) (line 159, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L691](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-691-0) (line 691, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L989](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-989-0) (line 989, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L742](performance-optimized-polyglot-bridge.md#^ref-f5579967-742-0) (line 742, col 0, score 1)
- [Pipeline Enhancements — L134](pipeline-enhancements.md#^ref-e2135d9f-134-0) (line 134, col 0, score 1)
- [plan-update-confirmation — L1177](plan-update-confirmation.md#^ref-b22d79c6-1177-0) (line 1177, col 0, score 1)
- [polyglot-repl-interface-layer — L411](polyglot-repl-interface-layer.md#^ref-9c79206d-411-0) (line 411, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L560](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-560-0) (line 560, col 0, score 1)
- [eidolon-node-lifecycle — L257](eidolon-node-lifecycle.md#^ref-938eca9c-257-0) (line 257, col 0, score 1)
- [Factorio AI with External Agents — L441](factorio-ai-with-external-agents.md#^ref-a4d90289-441-0) (line 441, col 0, score 1)
- [field-dynamics-math-blocks — L523](field-dynamics-math-blocks.md#^ref-7cfc230d-523-0) (line 523, col 0, score 1)
- [field-interaction-equations — L547](field-interaction-equations.md#^ref-b09141b7-547-0) (line 547, col 0, score 1)
- [field-node-diagram-outline — L322](field-node-diagram-outline.md#^ref-1f32c94a-322-0) (line 322, col 0, score 1)
- [field-node-diagram-set — L503](field-node-diagram-set.md#^ref-22b989d5-503-0) (line 503, col 0, score 1)
- [Fnord Tracer Protocol — L497](fnord-tracer-protocol.md#^ref-fc21f824-497-0) (line 497, col 0, score 1)
- [graph-ds — L635](graph-ds.md#^ref-6620e2f2-635-0) (line 635, col 0, score 1)
- [heartbeat-fragment-demo — L343](heartbeat-fragment-demo.md#^ref-dd00677a-343-0) (line 343, col 0, score 1)
- [homeostasis-decay-formulas — L570](homeostasis-decay-formulas.md#^ref-37b5d236-570-0) (line 570, col 0, score 1)
- [i3-bluetooth-setup — L464](i3-bluetooth-setup.md#^ref-5e408692-464-0) (line 464, col 0, score 1)
- [Ice Box Reorganization — L292](ice-box-reorganization.md#^ref-291c7d91-292-0) (line 292, col 0, score 1)
- [JavaScript — L376](chunks/javascript.md#^ref-c1618c66-376-0) (line 376, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L484](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-484-0) (line 484, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L170](ducks-self-referential-perceptual-loop.md#^ref-71726f04-170-0) (line 170, col 0, score 1)
- [Eidolon Field Abstract Model — L763](eidolon-field-abstract-model.md#^ref-5e8b2388-763-0) (line 763, col 0, score 1)
- [eidolon-node-lifecycle — L259](eidolon-node-lifecycle.md#^ref-938eca9c-259-0) (line 259, col 0, score 1)
- [Factorio AI with External Agents — L443](factorio-ai-with-external-agents.md#^ref-a4d90289-443-0) (line 443, col 0, score 1)
- [field-dynamics-math-blocks — L525](field-dynamics-math-blocks.md#^ref-7cfc230d-525-0) (line 525, col 0, score 1)
- [field-interaction-equations — L549](field-interaction-equations.md#^ref-b09141b7-549-0) (line 549, col 0, score 1)
- [field-node-diagram-outline — L324](field-node-diagram-outline.md#^ref-1f32c94a-324-0) (line 324, col 0, score 1)
- [field-node-diagram-set — L505](field-node-diagram-set.md#^ref-22b989d5-505-0) (line 505, col 0, score 1)
- [field-node-diagram-visualizations — L378](field-node-diagram-visualizations.md#^ref-e9b27b06-378-0) (line 378, col 0, score 1)
- [Diagrams — L298](chunks/diagrams.md#^ref-45cd25b5-298-0) (line 298, col 0, score 1)
- [Tooling — L274](chunks/tooling.md#^ref-6cb4943e-274-0) (line 274, col 0, score 1)
- [eidolon-field-math-foundations — L789](eidolon-field-math-foundations.md#^ref-008f2ac0-789-0) (line 789, col 0, score 1)
- [field-interaction-equations — L732](field-interaction-equations.md#^ref-b09141b7-732-0) (line 732, col 0, score 1)
- [i3-bluetooth-setup — L477](i3-bluetooth-setup.md#^ref-5e408692-477-0) (line 477, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L734](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-734-0) (line 734, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L1242](performance-optimized-polyglot-bridge.md#^ref-f5579967-1242-0) (line 1242, col 0, score 1)
- [polyglot-repl-interface-layer — L511](polyglot-repl-interface-layer.md#^ref-9c79206d-511-0) (line 511, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L508](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-508-0) (line 508, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L1598](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1598-0) (line 1598, col 0, score 0.99)
- [eidolon-field-math-foundations — L1003](eidolon-field-math-foundations.md#^ref-008f2ac0-1003-0) (line 1003, col 0, score 0.99)
- [heartbeat-fragment-demo — L606](heartbeat-fragment-demo.md#^ref-dd00677a-606-0) (line 606, col 0, score 0.99)
- [i3-bluetooth-setup — L297](i3-bluetooth-setup.md#^ref-5e408692-297-0) (line 297, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L1586](migrate-to-provider-tenant-architecture.md#^ref-54382370-1586-0) (line 1586, col 0, score 0.99)
- [obsidian-ignore-node-modules-regex — L449](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-449-0) (line 449, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L1167](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-1167-0) (line 1167, col 0, score 0.99)
- [Tooling — L277](chunks/tooling.md#^ref-6cb4943e-277-0) (line 277, col 0, score 1)
- [eidolon-field-math-foundations — L792](eidolon-field-math-foundations.md#^ref-008f2ac0-792-0) (line 792, col 0, score 1)
- [field-interaction-equations — L735](field-interaction-equations.md#^ref-b09141b7-735-0) (line 735, col 0, score 1)
- [i3-bluetooth-setup — L480](i3-bluetooth-setup.md#^ref-5e408692-480-0) (line 480, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L737](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-737-0) (line 737, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L1245](performance-optimized-polyglot-bridge.md#^ref-f5579967-1245-0) (line 1245, col 0, score 1)
- [polyglot-repl-interface-layer — L514](polyglot-repl-interface-layer.md#^ref-9c79206d-514-0) (line 514, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L393](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-393-0) (line 393, col 0, score 1)
- [Promethean Infrastructure Setup — L1341](promethean-infrastructure-setup.md#^ref-6deed6ac-1341-0) (line 1341, col 0, score 1)
- [eidolon-field-math-foundations — L793](eidolon-field-math-foundations.md#^ref-008f2ac0-793-0) (line 793, col 0, score 1)
- [Prompt_Folder_Bootstrap — L803](prompt-folder-bootstrap.md#^ref-bd4f0976-803-0) (line 803, col 0, score 1)
- [Pure TypeScript Search Microservice — L1087](pure-typescript-search-microservice.md#^ref-d17d3a96-1087-0) (line 1087, col 0, score 1)
- [schema-evolution-workflow — L1211](schema-evolution-workflow.md#^ref-d8059b6a-1211-0) (line 1211, col 0, score 1)
- [Stateful Partitions and Rebalancing — L1207](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-1207-0) (line 1207, col 0, score 1)
- [Ice Box Reorganization — L287](ice-box-reorganization.md#^ref-291c7d91-287-0) (line 287, col 0, score 0.94)
- [komorebi-group-window-hack — L711](komorebi-group-window-hack.md#^ref-dd89372d-711-0) (line 711, col 0, score 0.94)
- [Mathematical Samplers — L275](mathematical-samplers.md#^ref-86a691ec-275-0) (line 275, col 0, score 0.94)
- [Mathematics Sampler — L285](mathematics-sampler.md#^ref-b5e0183e-285-0) (line 285, col 0, score 0.94)
- [MindfulRobotIntegration — L167](mindfulrobotintegration.md#^ref-5f65dfa5-167-0) (line 167, col 0, score 0.94)
- [Post-Linguistic Transhuman Design Frameworks — L556](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-556-0) (line 556, col 0, score 0.94)
- [Promethean-Copilot-Intent-Engine — L246](promethean-copilot-intent-engine.md#^ref-ae24a280-246-0) (line 246, col 0, score 0.94)
- [Promethean Documentation Pipeline Overview — L528](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-528-0) (line 528, col 0, score 0.94)
- [Chroma Toolkit Consolidation Plan — L554](chroma-toolkit-consolidation-plan.md#^ref-5020e892-554-0) (line 554, col 0, score 1)
- [eidolon-field-math-foundations — L794](eidolon-field-math-foundations.md#^ref-008f2ac0-794-0) (line 794, col 0, score 1)
- [field-interaction-equations — L737](field-interaction-equations.md#^ref-b09141b7-737-0) (line 737, col 0, score 1)
- [i3-bluetooth-setup — L482](i3-bluetooth-setup.md#^ref-5e408692-482-0) (line 482, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L739](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-739-0) (line 739, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L890](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-890-0) (line 890, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L1247](performance-optimized-polyglot-bridge.md#^ref-f5579967-1247-0) (line 1247, col 0, score 1)
- [polyglot-repl-interface-layer — L516](polyglot-repl-interface-layer.md#^ref-9c79206d-516-0) (line 516, col 0, score 1)
- [eidolon-field-math-foundations — L795](eidolon-field-math-foundations.md#^ref-008f2ac0-795-0) (line 795, col 0, score 1)
- [Pure TypeScript Search Microservice — L1088](pure-typescript-search-microservice.md#^ref-d17d3a96-1088-0) (line 1088, col 0, score 1)
- [Stateful Partitions and Rebalancing — L1208](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-1208-0) (line 1208, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L989](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-989-0) (line 989, col 0, score 1)
- [Unique Info Dump Index — L799](unique-info-dump-index.md#^ref-30ec3ba6-799-0) (line 799, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L577](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-577-0) (line 577, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L555](chroma-toolkit-consolidation-plan.md#^ref-5020e892-555-0) (line 555, col 0, score 1)
- [Diagrams — L303](chunks/diagrams.md#^ref-45cd25b5-303-0) (line 303, col 0, score 1)
- [Tooling — L279](chunks/tooling.md#^ref-6cb4943e-279-0) (line 279, col 0, score 1)
- [eidolon-field-math-foundations — L796](eidolon-field-math-foundations.md#^ref-008f2ac0-796-0) (line 796, col 0, score 1)
- [field-interaction-equations — L739](field-interaction-equations.md#^ref-b09141b7-739-0) (line 739, col 0, score 1)
- [i3-bluetooth-setup — L484](i3-bluetooth-setup.md#^ref-5e408692-484-0) (line 484, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L741](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-741-0) (line 741, col 0, score 1)
- [Tooling — L280](chunks/tooling.md#^ref-6cb4943e-280-0) (line 280, col 0, score 1)
- [Dynamic Context Model for Web Components — L1384](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1384-0) (line 1384, col 0, score 1)
- [field-interaction-equations — L740](field-interaction-equations.md#^ref-b09141b7-740-0) (line 740, col 0, score 1)
- [i3-bluetooth-setup — L485](i3-bluetooth-setup.md#^ref-5e408692-485-0) (line 485, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L742](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-742-0) (line 742, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L892](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-892-0) (line 892, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L1250](performance-optimized-polyglot-bridge.md#^ref-f5579967-1250-0) (line 1250, col 0, score 1)
- [polyglot-repl-interface-layer — L519](polyglot-repl-interface-layer.md#^ref-9c79206d-519-0) (line 519, col 0, score 1)
- [eidolon-field-math-foundations — L797](eidolon-field-math-foundations.md#^ref-008f2ac0-797-0) (line 797, col 0, score 1)
- [field-interaction-equations — L741](field-interaction-equations.md#^ref-b09141b7-741-0) (line 741, col 0, score 1)
- [i3-bluetooth-setup — L486](i3-bluetooth-setup.md#^ref-5e408692-486-0) (line 486, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L743](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-743-0) (line 743, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L893](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-893-0) (line 893, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L1251](performance-optimized-polyglot-bridge.md#^ref-f5579967-1251-0) (line 1251, col 0, score 1)
- [polyglot-repl-interface-layer — L520](polyglot-repl-interface-layer.md#^ref-9c79206d-520-0) (line 520, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L399](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-399-0) (line 399, col 0, score 1)
- [Promethean Infrastructure Setup — L1347](promethean-infrastructure-setup.md#^ref-6deed6ac-1347-0) (line 1347, col 0, score 1)
- [Dynamic Context Model for Web Components — L1386](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1386-0) (line 1386, col 0, score 1)
- [eidolon-field-math-foundations — L798](eidolon-field-math-foundations.md#^ref-008f2ac0-798-0) (line 798, col 0, score 1)
- [i3-bluetooth-setup — L487](i3-bluetooth-setup.md#^ref-5e408692-487-0) (line 487, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L744](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-744-0) (line 744, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L894](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-894-0) (line 894, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L1252](performance-optimized-polyglot-bridge.md#^ref-f5579967-1252-0) (line 1252, col 0, score 1)
- [polyglot-repl-interface-layer — L521](polyglot-repl-interface-layer.md#^ref-9c79206d-521-0) (line 521, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L400](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-400-0) (line 400, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L582](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-582-0) (line 582, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L560](chroma-toolkit-consolidation-plan.md#^ref-5020e892-560-0) (line 560, col 0, score 1)
- [Dynamic Context Model for Web Components — L1388](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1388-0) (line 1388, col 0, score 1)
- [field-interaction-equations — L743](field-interaction-equations.md#^ref-b09141b7-743-0) (line 743, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L896](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-896-0) (line 896, col 0, score 1)
- [schema-evolution-workflow — L1216](schema-evolution-workflow.md#^ref-d8059b6a-1216-0) (line 1216, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L995](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-995-0) (line 995, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L506](migrate-to-provider-tenant-architecture.md#^ref-54382370-506-0) (line 506, col 0, score 0.99)
- [Model Selection for Lightweight Conversational Tasks — L322](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-322-0) (line 322, col 0, score 0.97)
- [ChatGPT Custom Prompts — L175](chatgpt-custom-prompts.md#^ref-930054b3-175-0) (line 175, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L470](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-470-0) (line 470, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L445](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-445-0) (line 445, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L352](model-upgrade-calm-down-guide.md#^ref-db74343f-352-0) (line 352, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L319](model-upgrade-calm-down-guide.md#^ref-db74343f-319-0) (line 319, col 0, score 0.97)
- [Eidolon Field Abstract Model — L557](eidolon-field-abstract-model.md#^ref-5e8b2388-557-0) (line 557, col 0, score 0.97)
- [field-dynamics-math-blocks — L352](field-dynamics-math-blocks.md#^ref-7cfc230d-352-0) (line 352, col 0, score 0.97)
- [ChatGPT Custom Prompts — L176](chatgpt-custom-prompts.md#^ref-930054b3-176-0) (line 176, col 0, score 0.97)
- [Promethean Documentation Pipeline Overview — L471](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-471-0) (line 471, col 0, score 0.97)
- [Functional Refactor of TypeScript Document Processing — L446](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-446-0) (line 446, col 0, score 0.97)
- [field-dynamics-math-blocks — L347](field-dynamics-math-blocks.md#^ref-7cfc230d-347-0) (line 347, col 0, score 0.97)
- [ChatGPT Custom Prompts — L178](chatgpt-custom-prompts.md#^ref-930054b3-178-0) (line 178, col 0, score 1)
- [field-dynamics-math-blocks — L348](field-dynamics-math-blocks.md#^ref-7cfc230d-348-0) (line 348, col 0, score 0.97)
- [Promethean Documentation Pipeline Overview — L473](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-473-0) (line 473, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L448](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-448-0) (line 448, col 0, score 1)
- [field-dynamics-math-blocks — L349](field-dynamics-math-blocks.md#^ref-7cfc230d-349-0) (line 349, col 0, score 0.97)
- [plan-update-confirmation — L1745](plan-update-confirmation.md#^ref-b22d79c6-1745-0) (line 1745, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L292](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-292-0) (line 292, col 0, score 1)
- [Promethean Dev Workflow Update — L3482](promethean-dev-workflow-update.md#^ref-03a5578f-3482-0) (line 3482, col 0, score 0.98)
- [eidolon-field-math-foundations — L2534](eidolon-field-math-foundations.md#^ref-008f2ac0-2534-0) (line 2534, col 0, score 0.96)
- [Duck's Attractor States — L1811](ducks-attractor-states.md#^ref-13951643-1811-0) (line 1811, col 0, score 0.95)
- [eidolon-field-math-foundations — L2310](eidolon-field-math-foundations.md#^ref-008f2ac0-2310-0) (line 2310, col 0, score 0.95)
- [Functional Refactor of TypeScript Document Processing — L1171](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-1171-0) (line 1171, col 0, score 0.95)
- [Promethean Dev Workflow Update — L1783](promethean-dev-workflow-update.md#^ref-03a5578f-1783-0) (line 1783, col 0, score 0.95)
- [Chroma Toolkit Consolidation Plan — L518](chroma-toolkit-consolidation-plan.md#^ref-5020e892-518-0) (line 518, col 0, score 1)
- [Dynamic Context Model for Web Components — L1000](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1000-0) (line 1000, col 0, score 1)
- [eidolon-node-lifecycle — L480](eidolon-node-lifecycle.md#^ref-938eca9c-480-0) (line 480, col 0, score 1)
- [Factorio AI with External Agents — L731](factorio-ai-with-external-agents.md#^ref-a4d90289-731-0) (line 731, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L621](migrate-to-provider-tenant-architecture.md#^ref-54382370-621-0) (line 621, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L821](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-821-0) (line 821, col 0, score 1)
- [Promethean Infrastructure Setup — L1642](promethean-infrastructure-setup.md#^ref-6deed6ac-1642-0) (line 1642, col 0, score 1)
- [Prompt_Folder_Bootstrap — L967](prompt-folder-bootstrap.md#^ref-bd4f0976-967-0) (line 967, col 0, score 1)
- [eidolon-field-math-foundations — L1013](eidolon-field-math-foundations.md#^ref-008f2ac0-1013-0) (line 1013, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L420](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-420-0) (line 420, col 0, score 1)
- [eidolon-field-math-foundations — L723](eidolon-field-math-foundations.md#^ref-008f2ac0-723-0) (line 723, col 0, score 0.95)
- [eidolon-field-math-foundations — L503](eidolon-field-math-foundations.md#^ref-008f2ac0-503-0) (line 503, col 0, score 0.91)
- [eidolon-field-math-foundations — L430](eidolon-field-math-foundations.md#^ref-008f2ac0-430-0) (line 430, col 0, score 0.9)
- [Agent Tasks: Persistence Migration to DualStore — L1009](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-1009-0) (line 1009, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L520](chroma-toolkit-consolidation-plan.md#^ref-5020e892-520-0) (line 520, col 0, score 1)
- [Dynamic Context Model for Web Components — L1002](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1002-0) (line 1002, col 0, score 1)
- [eidolon-node-lifecycle — L482](eidolon-node-lifecycle.md#^ref-938eca9c-482-0) (line 482, col 0, score 1)
- [Factorio AI with External Agents — L733](factorio-ai-with-external-agents.md#^ref-a4d90289-733-0) (line 733, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L623](migrate-to-provider-tenant-architecture.md#^ref-54382370-623-0) (line 623, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L823](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-823-0) (line 823, col 0, score 1)
- [Promethean Infrastructure Setup — L1644](promethean-infrastructure-setup.md#^ref-6deed6ac-1644-0) (line 1644, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L1010](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-1010-0) (line 1010, col 0, score 1)
- [Dynamic Context Model for Web Components — L1003](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1003-0) (line 1003, col 0, score 1)
- [eidolon-node-lifecycle — L483](eidolon-node-lifecycle.md#^ref-938eca9c-483-0) (line 483, col 0, score 1)
- [Factorio AI with External Agents — L734](factorio-ai-with-external-agents.md#^ref-a4d90289-734-0) (line 734, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L824](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-824-0) (line 824, col 0, score 1)
- [Promethean Infrastructure Setup — L1645](promethean-infrastructure-setup.md#^ref-6deed6ac-1645-0) (line 1645, col 0, score 1)
- [Prompt_Folder_Bootstrap — L970](prompt-folder-bootstrap.md#^ref-bd4f0976-970-0) (line 970, col 0, score 1)
- [sibilant-macro-targets — L980](sibilant-macro-targets.md#^ref-c5c9a5c6-980-0) (line 980, col 0, score 1)
- [zero-copy-snapshots-and-workers — L1044](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-1044-0) (line 1044, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L1011](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-1011-0) (line 1011, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L521](chroma-toolkit-consolidation-plan.md#^ref-5020e892-521-0) (line 521, col 0, score 1)
- [eidolon-node-lifecycle — L484](eidolon-node-lifecycle.md#^ref-938eca9c-484-0) (line 484, col 0, score 1)
- [Factorio AI with External Agents — L735](factorio-ai-with-external-agents.md#^ref-a4d90289-735-0) (line 735, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L625](migrate-to-provider-tenant-architecture.md#^ref-54382370-625-0) (line 625, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L825](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-825-0) (line 825, col 0, score 1)
- [Promethean Infrastructure Setup — L1646](promethean-infrastructure-setup.md#^ref-6deed6ac-1646-0) (line 1646, col 0, score 1)
- [Prompt_Folder_Bootstrap — L971](prompt-folder-bootstrap.md#^ref-bd4f0976-971-0) (line 971, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L1012](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-1012-0) (line 1012, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L890](chroma-toolkit-consolidation-plan.md#^ref-5020e892-890-0) (line 890, col 0, score 1)
- [Dynamic Context Model for Web Components — L1004](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1004-0) (line 1004, col 0, score 1)
- [eidolon-node-lifecycle — L485](eidolon-node-lifecycle.md#^ref-938eca9c-485-0) (line 485, col 0, score 1)
- [Factorio AI with External Agents — L736](factorio-ai-with-external-agents.md#^ref-a4d90289-736-0) (line 736, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L920](migrate-to-provider-tenant-architecture.md#^ref-54382370-920-0) (line 920, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L826](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-826-0) (line 826, col 0, score 1)
- [Promethean Infrastructure Setup — L1647](promethean-infrastructure-setup.md#^ref-6deed6ac-1647-0) (line 1647, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L1014](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-1014-0) (line 1014, col 0, score 1)
- [Dynamic Context Model for Web Components — L1733](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1733-0) (line 1733, col 0, score 1)
- [eidolon-node-lifecycle — L486](eidolon-node-lifecycle.md#^ref-938eca9c-486-0) (line 486, col 0, score 1)
- [Factorio AI with External Agents — L738](factorio-ai-with-external-agents.md#^ref-a4d90289-738-0) (line 738, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1035](migrate-to-provider-tenant-architecture.md#^ref-54382370-1035-0) (line 1035, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L827](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-827-0) (line 827, col 0, score 1)
- [Promethean Infrastructure Setup — L1649](promethean-infrastructure-setup.md#^ref-6deed6ac-1649-0) (line 1649, col 0, score 1)
- [Prompt_Folder_Bootstrap — L973](prompt-folder-bootstrap.md#^ref-bd4f0976-973-0) (line 973, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L1015](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-1015-0) (line 1015, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L892](chroma-toolkit-consolidation-plan.md#^ref-5020e892-892-0) (line 892, col 0, score 1)
- [Dynamic Context Model for Web Components — L1734](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1734-0) (line 1734, col 0, score 1)
- [eidolon-node-lifecycle — L487](eidolon-node-lifecycle.md#^ref-938eca9c-487-0) (line 487, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1036](migrate-to-provider-tenant-architecture.md#^ref-54382370-1036-0) (line 1036, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L828](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-828-0) (line 828, col 0, score 1)
- [Promethean Infrastructure Setup — L1650](promethean-infrastructure-setup.md#^ref-6deed6ac-1650-0) (line 1650, col 0, score 1)
- [Prompt_Folder_Bootstrap — L974](prompt-folder-bootstrap.md#^ref-bd4f0976-974-0) (line 974, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L894](chroma-toolkit-consolidation-plan.md#^ref-5020e892-894-0) (line 894, col 0, score 1)
- [Dynamic Context Model for Web Components — L1736](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1736-0) (line 1736, col 0, score 1)
- [eidolon-node-lifecycle — L489](eidolon-node-lifecycle.md#^ref-938eca9c-489-0) (line 489, col 0, score 1)
- [Factorio AI with External Agents — L740](factorio-ai-with-external-agents.md#^ref-a4d90289-740-0) (line 740, col 0, score 1)
- [eidolon-field-math-foundations — L1021](eidolon-field-math-foundations.md#^ref-008f2ac0-1021-0) (line 1021, col 0, score 1)
- [Math Fundamentals — L333](chunks/math-fundamentals.md#^ref-c6e87433-333-0) (line 333, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L534](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-534-0) (line 534, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L357](ducks-self-referential-perceptual-loop.md#^ref-71726f04-357-0) (line 357, col 0, score 1)
- [Dynamic Context Model for Web Components — L1319](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1319-0) (line 1319, col 0, score 1)
- [Eidolon Field Abstract Model — L903](eidolon-field-abstract-model.md#^ref-5e8b2388-903-0) (line 903, col 0, score 1)
- [eidolon-field-math-foundations — L730](eidolon-field-math-foundations.md#^ref-008f2ac0-730-0) (line 730, col 0, score 1)
- [eidolon-node-lifecycle — L440](eidolon-node-lifecycle.md#^ref-938eca9c-440-0) (line 440, col 0, score 1)
- [Factorio AI with External Agents — L702](factorio-ai-with-external-agents.md#^ref-a4d90289-702-0) (line 702, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L814](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-814-0) (line 814, col 0, score 1)
- [Promethean Infrastructure Setup — L1251](promethean-infrastructure-setup.md#^ref-6deed6ac-1251-0) (line 1251, col 0, score 1)
- [Prometheus Observability Stack — L975](prometheus-observability-stack.md#^ref-e90b5a16-975-0) (line 975, col 0, score 1)
- [Prompt_Folder_Bootstrap — L635](prompt-folder-bootstrap.md#^ref-bd4f0976-635-0) (line 635, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L520](protocol-0-the-contradiction-engine.md#^ref-9a93a756-520-0) (line 520, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L662](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-662-0) (line 662, col 0, score 1)
- [Pure TypeScript Search Microservice — L1204](pure-typescript-search-microservice.md#^ref-d17d3a96-1204-0) (line 1204, col 0, score 1)
- [Reawakening Duck — L659](reawakening-duck.md#^ref-59b5670f-659-0) (line 659, col 0, score 1)
- [ripple-propagation-demo — L624](ripple-propagation-demo.md#^ref-8430617b-624-0) (line 624, col 0, score 1)
- [Promethean Dev Workflow Update — L549](promethean-dev-workflow-update.md#^ref-03a5578f-549-0) (line 549, col 0, score 1)
- [Prompt_Folder_Bootstrap — L636](prompt-folder-bootstrap.md#^ref-bd4f0976-636-0) (line 636, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L521](protocol-0-the-contradiction-engine.md#^ref-9a93a756-521-0) (line 521, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L663](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-663-0) (line 663, col 0, score 1)
- [Pure TypeScript Search Microservice — L1205](pure-typescript-search-microservice.md#^ref-d17d3a96-1205-0) (line 1205, col 0, score 1)
- [Reawakening Duck — L660](reawakening-duck.md#^ref-59b5670f-660-0) (line 660, col 0, score 1)
- [ripple-propagation-demo — L625](ripple-propagation-demo.md#^ref-8430617b-625-0) (line 625, col 0, score 1)
- [schema-evolution-workflow — L1197](schema-evolution-workflow.md#^ref-d8059b6a-1197-0) (line 1197, col 0, score 1)
- [sibilant-macro-targets — L666](sibilant-macro-targets.md#^ref-c5c9a5c6-666-0) (line 666, col 0, score 1)
- [Diagrams — L367](chunks/diagrams.md#^ref-45cd25b5-367-0) (line 367, col 0, score 1)
- [Eidolon Field Abstract Model — L906](eidolon-field-abstract-model.md#^ref-5e8b2388-906-0) (line 906, col 0, score 1)
- [field-node-diagram-outline — L231](field-node-diagram-outline.md#^ref-1f32c94a-231-0) (line 231, col 0, score 1)
- [Fnord Tracer Protocol — L815](fnord-tracer-protocol.md#^ref-fc21f824-815-0) (line 815, col 0, score 1)
- [graph-ds — L930](graph-ds.md#^ref-6620e2f2-930-0) (line 930, col 0, score 1)
- [heartbeat-fragment-demo — L586](heartbeat-fragment-demo.md#^ref-dd00677a-586-0) (line 586, col 0, score 1)
- [homeostasis-decay-formulas — L893](homeostasis-decay-formulas.md#^ref-37b5d236-893-0) (line 893, col 0, score 1)
- [i3-bluetooth-setup — L510](i3-bluetooth-setup.md#^ref-5e408692-510-0) (line 510, col 0, score 1)
- [Ice Box Reorganization — L587](ice-box-reorganization.md#^ref-291c7d91-587-0) (line 587, col 0, score 1)
- [komorebi-group-window-hack — L679](komorebi-group-window-hack.md#^ref-dd89372d-679-0) (line 679, col 0, score 1)
- [Fnord Tracer Protocol — L816](fnord-tracer-protocol.md#^ref-fc21f824-816-0) (line 816, col 0, score 1)
- [graph-ds — L931](graph-ds.md#^ref-6620e2f2-931-0) (line 931, col 0, score 1)
- [heartbeat-fragment-demo — L587](heartbeat-fragment-demo.md#^ref-dd00677a-587-0) (line 587, col 0, score 1)
- [homeostasis-decay-formulas — L894](homeostasis-decay-formulas.md#^ref-37b5d236-894-0) (line 894, col 0, score 1)
- [i3-bluetooth-setup — L511](i3-bluetooth-setup.md#^ref-5e408692-511-0) (line 511, col 0, score 1)
- [Ice Box Reorganization — L588](ice-box-reorganization.md#^ref-291c7d91-588-0) (line 588, col 0, score 1)
- [komorebi-group-window-hack — L680](komorebi-group-window-hack.md#^ref-dd89372d-680-0) (line 680, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L789](layer1survivabilityenvelope.md#^ref-64a9f9f9-789-0) (line 789, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1099](migrate-to-provider-tenant-architecture.md#^ref-54382370-1099-0) (line 1099, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L568](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-568-0) (line 568, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L383](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-383-0) (line 383, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L512](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-512-0) (line 512, col 0, score 1)
- [Prompt_Folder_Bootstrap — L639](prompt-folder-bootstrap.md#^ref-bd4f0976-639-0) (line 639, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L524](protocol-0-the-contradiction-engine.md#^ref-9a93a756-524-0) (line 524, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L666](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-666-0) (line 666, col 0, score 1)
- [Pure TypeScript Search Microservice — L1208](pure-typescript-search-microservice.md#^ref-d17d3a96-1208-0) (line 1208, col 0, score 1)
- [Reawakening Duck — L663](reawakening-duck.md#^ref-59b5670f-663-0) (line 663, col 0, score 1)
- [ripple-propagation-demo — L628](ripple-propagation-demo.md#^ref-8430617b-628-0) (line 628, col 0, score 1)
- [schema-evolution-workflow — L1200](schema-evolution-workflow.md#^ref-d8059b6a-1200-0) (line 1200, col 0, score 1)
- [sibilant-macro-targets — L669](sibilant-macro-targets.md#^ref-c5c9a5c6-669-0) (line 669, col 0, score 1)
- [Prompt_Folder_Bootstrap — L640](prompt-folder-bootstrap.md#^ref-bd4f0976-640-0) (line 640, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L525](protocol-0-the-contradiction-engine.md#^ref-9a93a756-525-0) (line 525, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L667](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-667-0) (line 667, col 0, score 1)
- [Pure TypeScript Search Microservice — L1209](pure-typescript-search-microservice.md#^ref-d17d3a96-1209-0) (line 1209, col 0, score 1)
- [Reawakening Duck — L664](reawakening-duck.md#^ref-59b5670f-664-0) (line 664, col 0, score 1)
- [ripple-propagation-demo — L629](ripple-propagation-demo.md#^ref-8430617b-629-0) (line 629, col 0, score 1)
- [schema-evolution-workflow — L1201](schema-evolution-workflow.md#^ref-d8059b6a-1201-0) (line 1201, col 0, score 1)
- [sibilant-macro-targets — L670](sibilant-macro-targets.md#^ref-c5c9a5c6-670-0) (line 670, col 0, score 1)
- [Smoke Resonance Visualizations — L435](smoke-resonance-visualizations.md#^ref-ac9d3ac5-435-0) (line 435, col 0, score 1)
- [Prompt_Folder_Bootstrap — L641](prompt-folder-bootstrap.md#^ref-bd4f0976-641-0) (line 641, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L526](protocol-0-the-contradiction-engine.md#^ref-9a93a756-526-0) (line 526, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L668](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-668-0) (line 668, col 0, score 1)
- [Pure TypeScript Search Microservice — L1210](pure-typescript-search-microservice.md#^ref-d17d3a96-1210-0) (line 1210, col 0, score 1)
- [Reawakening Duck — L665](reawakening-duck.md#^ref-59b5670f-665-0) (line 665, col 0, score 1)
- [ripple-propagation-demo — L630](ripple-propagation-demo.md#^ref-8430617b-630-0) (line 630, col 0, score 1)
- [schema-evolution-workflow — L1202](schema-evolution-workflow.md#^ref-d8059b6a-1202-0) (line 1202, col 0, score 1)
- [sibilant-macro-targets — L671](sibilant-macro-targets.md#^ref-c5c9a5c6-671-0) (line 671, col 0, score 1)
- [Smoke Resonance Visualizations — L436](smoke-resonance-visualizations.md#^ref-ac9d3ac5-436-0) (line 436, col 0, score 1)
- [DSL — L395](chunks/dsl.md#^ref-e87bc036-395-0) (line 395, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L364](ducks-self-referential-perceptual-loop.md#^ref-71726f04-364-0) (line 364, col 0, score 1)
- [field-dynamics-math-blocks — L855](field-dynamics-math-blocks.md#^ref-7cfc230d-855-0) (line 855, col 0, score 1)
- [field-node-diagram-set — L270](field-node-diagram-set.md#^ref-22b989d5-270-0) (line 270, col 0, score 1)
- [graph-ds — L935](graph-ds.md#^ref-6620e2f2-935-0) (line 935, col 0, score 1)
- [heartbeat-fragment-demo — L591](heartbeat-fragment-demo.md#^ref-dd00677a-591-0) (line 591, col 0, score 1)
- [homeostasis-decay-formulas — L898](homeostasis-decay-formulas.md#^ref-37b5d236-898-0) (line 898, col 0, score 1)
- [i3-bluetooth-setup — L515](i3-bluetooth-setup.md#^ref-5e408692-515-0) (line 515, col 0, score 1)
- [Ice Box Reorganization — L592](ice-box-reorganization.md#^ref-291c7d91-592-0) (line 592, col 0, score 1)
- [komorebi-group-window-hack — L684](komorebi-group-window-hack.md#^ref-dd89372d-684-0) (line 684, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L793](layer1survivabilityenvelope.md#^ref-64a9f9f9-793-0) (line 793, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1103](migrate-to-provider-tenant-architecture.md#^ref-54382370-1103-0) (line 1103, col 0, score 1)
- [Prompt_Folder_Bootstrap — L643](prompt-folder-bootstrap.md#^ref-bd4f0976-643-0) (line 643, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L528](protocol-0-the-contradiction-engine.md#^ref-9a93a756-528-0) (line 528, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L670](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-670-0) (line 670, col 0, score 1)
- [Pure TypeScript Search Microservice — L1212](pure-typescript-search-microservice.md#^ref-d17d3a96-1212-0) (line 1212, col 0, score 1)
- [Reawakening Duck — L667](reawakening-duck.md#^ref-59b5670f-667-0) (line 667, col 0, score 1)
- [ripple-propagation-demo — L632](ripple-propagation-demo.md#^ref-8430617b-632-0) (line 632, col 0, score 1)
- [schema-evolution-workflow — L1204](schema-evolution-workflow.md#^ref-d8059b6a-1204-0) (line 1204, col 0, score 1)
- [sibilant-macro-targets — L673](sibilant-macro-targets.md#^ref-c5c9a5c6-673-0) (line 673, col 0, score 1)
- [i3-bluetooth-setup — L517](i3-bluetooth-setup.md#^ref-5e408692-517-0) (line 517, col 0, score 1)
- [Prometheus Observability Stack — L984](prometheus-observability-stack.md#^ref-e90b5a16-984-0) (line 984, col 0, score 1)
- [Prompt_Folder_Bootstrap — L644](prompt-folder-bootstrap.md#^ref-bd4f0976-644-0) (line 644, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L529](protocol-0-the-contradiction-engine.md#^ref-9a93a756-529-0) (line 529, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L671](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-671-0) (line 671, col 0, score 1)
- [Pure TypeScript Search Microservice — L1213](pure-typescript-search-microservice.md#^ref-d17d3a96-1213-0) (line 1213, col 0, score 1)
- [Reawakening Duck — L668](reawakening-duck.md#^ref-59b5670f-668-0) (line 668, col 0, score 1)
- [ripple-propagation-demo — L633](ripple-propagation-demo.md#^ref-8430617b-633-0) (line 633, col 0, score 1)
- [schema-evolution-workflow — L1205](schema-evolution-workflow.md#^ref-d8059b6a-1205-0) (line 1205, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L279](ducks-self-referential-perceptual-loop.md#^ref-71726f04-279-0) (line 279, col 0, score 1)
- [Dynamic Context Model for Web Components — L1287](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1287-0) (line 1287, col 0, score 1)
- [Reawakening Duck — L427](reawakening-duck.md#^ref-59b5670f-427-0) (line 427, col 0, score 1)
- [Promethean State Format — L382](promethean-state-format.md#^ref-23df6ddb-382-0) (line 382, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L409](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-409-0) (line 409, col 0, score 0.99)
- [eidolon-field-math-foundations — L831](eidolon-field-math-foundations.md#^ref-008f2ac0-831-0) (line 831, col 0, score 0.99)
- [i3-bluetooth-setup — L667](i3-bluetooth-setup.md#^ref-5e408692-667-0) (line 667, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L990](migrate-to-provider-tenant-architecture.md#^ref-54382370-990-0) (line 990, col 0, score 0.99)
- [Model Selection for Lightweight Conversational Tasks — L645](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-645-0) (line 645, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration Guide — L269](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-269-0) (line 269, col 0, score 0.99)
- [unique-templates — L181](templates/unique-templates.md#^ref-c26f0044-181-0) (line 181, col 0, score 1)
- [Tracing the Signal — L554](tracing-the-signal.md#^ref-c3cd4f65-554-0) (line 554, col 0, score 1)
- [ts-to-lisp-transpiler — L515](ts-to-lisp-transpiler.md#^ref-ba11486b-515-0) (line 515, col 0, score 1)
- [typed-struct-compiler — L1006](typed-struct-compiler.md#^ref-78eeedf7-1006-0) (line 1006, col 0, score 1)
- [Unique Concepts — L166](unique-concepts.md#^ref-ed6f3fc9-166-0) (line 166, col 0, score 1)
- [Unique Info Dump Index — L1210](unique-info-dump-index.md#^ref-30ec3ba6-1210-0) (line 1210, col 0, score 1)
- [zero-copy-snapshots-and-workers — L1049](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-1049-0) (line 1049, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L506](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-506-0) (line 506, col 0, score 1)
- [Creative Moments — L243](creative-moments.md#^ref-10d98225-243-0) (line 243, col 0, score 1)
- [ts-to-lisp-transpiler — L516](ts-to-lisp-transpiler.md#^ref-ba11486b-516-0) (line 516, col 0, score 1)
- [typed-struct-compiler — L1007](typed-struct-compiler.md#^ref-78eeedf7-1007-0) (line 1007, col 0, score 1)
- [Unique Concepts — L167](unique-concepts.md#^ref-ed6f3fc9-167-0) (line 167, col 0, score 1)
- [Unique Info Dump Index — L1211](unique-info-dump-index.md#^ref-30ec3ba6-1211-0) (line 1211, col 0, score 1)
- [zero-copy-snapshots-and-workers — L1050](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-1050-0) (line 1050, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L507](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-507-0) (line 507, col 0, score 1)
- [Creative Moments — L244](creative-moments.md#^ref-10d98225-244-0) (line 244, col 0, score 1)
- [Duck's Attractor States — L549](ducks-attractor-states.md#^ref-13951643-549-0) (line 549, col 0, score 1)
- [Pipeline Enhancements — L140](pipeline-enhancements.md#^ref-e2135d9f-140-0) (line 140, col 0, score 1)
- [Promethean Documentation Overview — L90](promethean-documentation-overview.md#^ref-9413237f-90-0) (line 90, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L771](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-771-0) (line 771, col 0, score 1)
- [Promethean Documentation Update — L167](promethean-documentation-update.md#^ref-c0392040-167-0) (line 167, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L449](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-449-0) (line 449, col 0, score 1)
- [Promethean Infrastructure Setup — L1665](promethean-infrastructure-setup.md#^ref-6deed6ac-1665-0) (line 1665, col 0, score 1)
- [Promethean Pipelines — L615](promethean-pipelines.md#^ref-8b8e6103-615-0) (line 615, col 0, score 1)
- [Promethean State Format — L555](promethean-state-format.md#^ref-23df6ddb-555-0) (line 555, col 0, score 1)
- [Promethean Workflow Optimization — L260](promethean-workflow-optimization.md#^ref-d614d983-260-0) (line 260, col 0, score 1)
- [Prometheus Observability Stack — L1169](prometheus-observability-stack.md#^ref-e90b5a16-1169-0) (line 1169, col 0, score 1)
- [Prompt_Folder_Bootstrap — L978](prompt-folder-bootstrap.md#^ref-bd4f0976-978-0) (line 978, col 0, score 1)
- [Redirecting Standard Error — L288](redirecting-standard-error.md#^ref-b3555ede-288-0) (line 288, col 0, score 1)
- [ripple-propagation-demo — L658](ripple-propagation-demo.md#^ref-8430617b-658-0) (line 658, col 0, score 1)
- [schema-evolution-workflow — L1345](schema-evolution-workflow.md#^ref-d8059b6a-1345-0) (line 1345, col 0, score 1)
- [Self-Agency in AI Interaction — L418](self-agency-in-ai-interaction.md#^ref-49a9a860-418-0) (line 418, col 0, score 1)
- [Smoke Resonance Visualizations — L479](smoke-resonance-visualizations.md#^ref-ac9d3ac5-479-0) (line 479, col 0, score 1)
- [Stateful Partitions and Rebalancing — L1317](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-1317-0) (line 1317, col 0, score 1)
- [Synchronicity Waves and Web — L477](synchronicity-waves-and-web.md#^ref-91295f3a-477-0) (line 477, col 0, score 1)
- [unique-templates — L184](templates/unique-templates.md#^ref-c26f0044-184-0) (line 184, col 0, score 1)
- [Tracing the Signal — L557](tracing-the-signal.md#^ref-c3cd4f65-557-0) (line 557, col 0, score 1)
- [ts-to-lisp-transpiler — L518](ts-to-lisp-transpiler.md#^ref-ba11486b-518-0) (line 518, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L785](promethean-copilot-intent-engine.md#^ref-ae24a280-785-0) (line 785, col 0, score 1)
- [Promethean Infrastructure Setup — L1668](promethean-infrastructure-setup.md#^ref-6deed6ac-1668-0) (line 1668, col 0, score 1)
- [Promethean Pipelines — L617](promethean-pipelines.md#^ref-8b8e6103-617-0) (line 617, col 0, score 1)
- [Promethean State Format — L557](promethean-state-format.md#^ref-23df6ddb-557-0) (line 557, col 0, score 1)
- [Promethean Workflow Optimization — L262](promethean-workflow-optimization.md#^ref-d614d983-262-0) (line 262, col 0, score 1)
- [Prometheus Observability Stack — L1171](prometheus-observability-stack.md#^ref-e90b5a16-1171-0) (line 1171, col 0, score 1)
- [Prompt_Folder_Bootstrap — L980](prompt-folder-bootstrap.md#^ref-bd4f0976-980-0) (line 980, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L856](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-856-0) (line 856, col 0, score 1)
- [Redirecting Standard Error — L289](redirecting-standard-error.md#^ref-b3555ede-289-0) (line 289, col 0, score 1)
- [ripple-propagation-demo — L659](ripple-propagation-demo.md#^ref-8430617b-659-0) (line 659, col 0, score 1)
- [Self-Agency in AI Interaction — L419](self-agency-in-ai-interaction.md#^ref-49a9a860-419-0) (line 419, col 0, score 1)
- [Docops Feature Updates — L221](docops-feature-updates.md#^ref-2792d448-221-0) (line 221, col 0, score 1)
- [DuckDuckGoSearchPipeline — L195](duckduckgosearchpipeline.md#^ref-e979c50f-195-0) (line 195, col 0, score 1)
- [Eidolon Field Abstract Model — L965](eidolon-field-abstract-model.md#^ref-5e8b2388-965-0) (line 965, col 0, score 1)
- [eidolon-node-lifecycle — L495](eidolon-node-lifecycle.md#^ref-938eca9c-495-0) (line 495, col 0, score 1)
- [Factorio AI with External Agents — L746](factorio-ai-with-external-agents.md#^ref-a4d90289-746-0) (line 746, col 0, score 1)
- [field-dynamics-math-blocks — L939](field-dynamics-math-blocks.md#^ref-7cfc230d-939-0) (line 939, col 0, score 1)
- [field-interaction-equations — L971](field-interaction-equations.md#^ref-b09141b7-971-0) (line 971, col 0, score 1)
- [field-node-diagram-set — L714](field-node-diagram-set.md#^ref-22b989d5-714-0) (line 714, col 0, score 1)
- [field-node-diagram-visualizations — L596](field-node-diagram-visualizations.md#^ref-e9b27b06-596-0) (line 596, col 0, score 1)
- [Optimizing Command Limitations in System Design — L406](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-406-0) (line 406, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L787](promethean-copilot-intent-engine.md#^ref-ae24a280-787-0) (line 787, col 0, score 1)
- [Promethean Data Sync Protocol — L169](promethean-data-sync-protocol.md#^ref-9fab9e76-169-0) (line 169, col 0, score 1)
- [Promethean Documentation Overview — L94](promethean-documentation-overview.md#^ref-9413237f-94-0) (line 94, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L775](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-775-0) (line 775, col 0, score 1)
- [Promethean Documentation Update — L171](promethean-documentation-update.md#^ref-c0392040-171-0) (line 171, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L453](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-453-0) (line 453, col 0, score 1)
- [Promethean Infrastructure Setup — L1671](promethean-infrastructure-setup.md#^ref-6deed6ac-1671-0) (line 1671, col 0, score 1)
- [Promethean Pipelines — L619](promethean-pipelines.md#^ref-8b8e6103-619-0) (line 619, col 0, score 1)
- [promethean-requirements — L220](promethean-requirements.md#^ref-95205cd3-220-0) (line 220, col 0, score 1)
- [Promethean State Format — L559](promethean-state-format.md#^ref-23df6ddb-559-0) (line 559, col 0, score 1)
- [Prometheus Observability Stack — L1173](prometheus-observability-stack.md#^ref-e90b5a16-1173-0) (line 1173, col 0, score 1)
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
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
