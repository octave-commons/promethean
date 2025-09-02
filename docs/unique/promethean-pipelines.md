---
uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
created_at: 2025.08.31.16.57.42.md
filename: Promethean Pipelines
description: >-
  A set of idempotent, marker-safe pipelines for detecting API drift, generating
  semver recommendations, creating type dependency graphs, and automating
  documentation tasks. These pipelines cache outputs under `.cache/<pkg>` and
  follow a consistent workflow for scalable repo analysis.
tags:
  - api-diff
  - semver
  - typegraph
  - codemods
  - i18npack
  - licscan
  - test-gap
  - glossary
  - adr-bot
  - riskmap
  - docs
  - pipeline
related_to_uuid:
  - a4a25141-6380-40b9-9cd7-b554b246b303
  - 78eeedf7-75bc-4692-a5a7-bb6857270621
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
  - d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
  - db74343f-8f84-43a3-adb2-499c6f00be1c
  - bd4f0976-0d5b-47f6-a20a-0601d1842dc1
  - 4330e8f0-5f46-4235-918b-39b6b93fa561
  - 291c7d91-da8c-486c-9bc0-bd2254536e2d
  - 10d98225-12e0-4212-8e15-88b57cf7bee5
  - 13951643-1741-46bb-89dc-1beebb122633
  - 18138627-a348-4fbb-b447-410dfb400564
  - 1b1338fc-bb4d-41df-828f-e219cc9442eb
  - b09141b7-544f-4c8e-8f49-bf76cecaacbb
  - d144aa62-348c-4e5d-ae8f-38084c67ceca
  - a4d90289-798d-44a0-a8e8-a055ae12fb52
  - 49a9a860-944c-467a-b532-4f99186a8593
  - 9a93a756-6d33-45d1-aca9-51b74f2b33d2
  - 7b7ca860-780c-44fa-8d3f-be8bd9496fba
  - 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - b22d79c6-825b-4cd3-b0d3-1cef0532bb54
  - c03020e1-e3e7-48bf-aa7e-aa740c601b63
  - e90b5a16-d58f-424d-bd36-70e9bd2861ad
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - 91295f3a-a2af-4050-a2b8-4777ea70c32c
  - c26f0044-26fe-4c43-8ab0-fc4690723e3c
  - c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
  - ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
  - ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
  - 1cfae310-35dc-49c2-98f1-b186da25d84b
  - ffb9b2a9-744d-4a53-9565-130fceae0832
  - fc21f824-4244-4030-a48e-c4170160ea1d
  - b3555ede-324a-4d24-a885-b0721e74babf
  - 8430617b-80a2-4cc9-8288-9a74cb57990b
  - c5c9a5c6-427d-4864-8084-c083cd55faa0
  - ac9d3ac5-9a6a-4180-a67f-1ab7e229d981
  - 6620e2f2-de6d-45d8-a722-5d26e160b370
  - 37b5d236-2b3e-4a95-a4e8-31655c3023ef
  - 64a9f9f9-58ee-4996-bdaf-9373845c6b29
  - ae24a280-678e-4c0b-8cc4-56667fa04172
  - 2901a3e9-96f0-497c-ae2c-775f28a702dd
  - 95205cd3-c3d5-4047-9c33-9c5ca2b49597
  - d614d983-7795-491f-9437-09f3a43f72cf
  - 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
  - 5c152b08-6b69-4bb8-a1a7-66745789c169
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - 22b989d5-f4aa-4880-8632-709c21830f83
  - 9b694a91-dec5-4708-9462-3f71000ba925
  - 23df6ddb-05cf-4639-8201-f8291f8a6026
  - 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
  - 62bec6f0-4e13-4f38-aca4-72c84ba02367
  - 5a02283e-4281-4930-9ca7-e27849de11bd
  - bb7f0835-c347-474f-bfad-eabd873b51ad
  - dd89372d-10de-42a9-8c96-6bc13ea36d02
  - d17d3a96-c84d-4738-a403-6c733b874da2
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - e87bc036-1570-419e-a558-f45b9c0db698
  - e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
  - 59b5670f-36d3-4d34-8985-f3144b15347a
  - ca8e1399-77bf-4f77-82a3-3f703b68706d
  - 43bfe9dd-d433-42ca-9777-f4c40eaba791
  - 1d3d6c3a-039e-4b96-93c1-95854945e248
  - b39dc9d4-63e2-42d4-bbcd-041ef3167bca
  - 18344cf9-0c49-4a71-b6c8-b8d84d660fca
  - 0f6f8f38-98d0-438f-9601-58f478acc0b7
  - 03a5578f-d689-45db-95e9-11300e5eee6f
  - 6cb4943e-8267-4e27-8618-2ce0a464d173
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - 2792d448-c3b5-4050-93dd-93768529d99c
  - 0b872af2-4197-46f3-b631-afb4e6135585
  - 5e408692-0e74-400e-a617-84247c7353ad
  - f5579967-762d-4cfd-851e-4f71b4cb77a1
  - 9c79206d-4cb9-4f00-87e0-782dcea37bc7
  - 6bcff92c-4224-453d-9993-1be8d37d47c3
  - 54382370-1931-4a19-a634-46735708a9ea
  - c1618c66-f73a-4e04-9bfa-ef38755f7acc
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
  - e2135d9f-c69d-47ee-9b17-0b05e98dc748
  - 71726f04-eb1c-42a5-a5fe-d8209de6e159
  - e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
  - dd00677a-2280-45a7-91af-0728b21af3ad
  - 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
  - 45cd25b5-ed36-49ab-82c8-10d0903e34db
  - 623a55f7-685c-486b-abaf-469da1bbbb69
  - 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
  - cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
  - 930054b3-ba95-4acf-bb92-0e3ead25ed0b
  - f1add613-656e-4bec-b52b-193fd78c4642
  - 9e8ae388-767a-4ea8-9f2e-88801291d947
  - 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
  - c0392040-16a2-41e8-bd54-75110319e3c0
  - 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
  - 557309a3-c906-4e97-8867-89ffe151790c
  - 75ea4a6a-8270-488d-9d37-799c288e5f70
  - 86a691ec-ca1f-4350-824c-0ded1f8ebe70
  - 9413237f-2537-4bbf-8768-db6180970e36
  - b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
  - 40185d05-010e-45e7-8c2d-2f879bf14218
  - e979c50f-69bb-48b0-8417-e1ee1b31c0c0
  - 0580dcd3-533d-4834-8a2f-eae3771960a9
  - d3e7db72-2e07-4dae-8920-0e07c499a1e5
  - ac60a1d6-fd9f-46dc-bbe7-176dd8017c59
  - 5f65dfa5-dc97-4a6c-ad93-c45c1312e156
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - 1c4046b5-742d-4004-aec6-b47251fef5d6
related_to_title:
  - Functional Embedding Pipeline Refactor
  - typed-struct-compiler
  - eidolon-field-math-foundations
  - Promethean Documentation Pipeline Overview
  - schema-evolution-workflow
  - Model Upgrade Calm-Down Guide
  - Prompt_Folder_Bootstrap
  - Stateful Partitions and Rebalancing
  - Ice Box Reorganization
  - Creative Moments
  - Duck's Attractor States
  - The Jar of Echoes
  - Canonical Org-Babel Matplotlib Animation Template
  - field-interaction-equations
  - Model Selection for Lightweight Conversational Tasks
  - Factorio AI with External Agents
  - Self-Agency in AI Interaction
  - Protocol_0_The_Contradiction_Engine
  - TypeScript Patch for Tool Calling Support
  - Optimizing Command Limitations in System Design
  - Unique Info Dump Index
  - plan-update-confirmation
  - Per-Domain Policy System for JS Crawler
  - Prometheus Observability Stack
  - Promethean Infrastructure Setup
  - Eidolon Field Abstract Model
  - Synchronicity Waves and Web
  - unique-templates
  - Tracing the Signal
  - ts-to-lisp-transpiler
  - Unique Concepts
  - Functional Refactor of TypeScript Document Processing
  - obsidian-ignore-node-modules-regex
  - Fnord Tracer Protocol
  - Redirecting Standard Error
  - ripple-propagation-demo
  - sibilant-macro-targets
  - Smoke Resonance Visualizations
  - graph-ds
  - homeostasis-decay-formulas
  - Layer1SurvivabilityEnvelope
  - Promethean-Copilot-Intent-Engine
  - Admin Dashboard for User Management
  - promethean-requirements
  - Promethean Workflow Optimization
  - Debugging Broker Connections and Agent Behavior
  - OpenAPI Validation Report
  - field-node-diagram-outline
  - field-node-diagram-set
  - Obsidian Task Generation
  - Promethean State Format
  - field-dynamics-math-blocks
  - zero-copy-snapshots-and-workers
  - NPU Voice Code and Sensory Integration
  - Agent Reflections and Prompt Evolution
  - komorebi-group-window-hack
  - Pure TypeScript Search Microservice
  - Dynamic Context Model for Web Components
  - DSL
  - ParticleSimulationWithCanvasAndFFmpeg
  - Reawakening Duck
  - Obsidian ChatGPT Plugin Integration
  - Provider-Agnostic Chat Panel Implementation
  - Obsidian ChatGPT Plugin Integration Guide
  - Obsidian Templating Plugins Integration Guide
  - Promethean Chat Activity Report
  - windows-tiling-with-autohotkey
  - Promethean Dev Workflow Update
  - Tooling
  - 'Agent Tasks: Persistence Migration to DualStore'
  - Docops Feature Updates
  - Promethean Documentation Update
  - i3-bluetooth-setup
  - Performance-Optimized-Polyglot-Bridge
  - polyglot-repl-interface-layer
  - Post-Linguistic Transhuman Design Frameworks
  - Migrate to Provider-Tenant Architecture
  - JavaScript
  - Chroma Toolkit Consolidation Plan
  - Math Fundamentals
  - Pipeline Enhancements
  - Duck's Self-Referential Perceptual Loop
  - field-node-diagram-visualizations
  - heartbeat-fragment-demo
  - Promethean_Eidolon_Synchronicity_Model
  - Diagrams
  - Shared
  - Board Walk – 2025-08-11
  - ChatGPT Custom Prompts
  - Operations
  - Window Management
  - Promethean Data Sync Protocol
  - eidolon-node-lifecycle
  - Simulation Demo
  - Services
  - Mathematical Samplers
  - Promethean Documentation Overview
  - Mathematics Sampler
  - Mindful Prioritization
  - DuckDuckGoSearchPipeline
  - api-gateway-versioning
  - balanced-bst
  - Board Automation Improvements
  - MindfulRobotIntegration
  - archetype-ecs
  - Promethean Notes
references:
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
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 295
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 127
    col: 0
    score: 1
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 66
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1076
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 169
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 58
    col: 0
    score: 1
  - uuid: 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
    line: 37
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 145
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 199
    col: 0
    score: 1
  - uuid: c0392040-16a2-41e8-bd54-75110319e3c0
    line: 38
    col: 0
    score: 1
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 37
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
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 385
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
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 75
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 74
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 145
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 47
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 146
    col: 0
    score: 1
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 63
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 72
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 36
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 49
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 126
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 51
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
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 149
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 288
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 415
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
  - uuid: 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
    line: 133
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 598
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 605
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 393
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 567
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 92
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 75
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 72
    col: 0
    score: 1
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 89
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 125
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1054
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
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 151
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
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 276
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
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 327
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
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 335
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
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 226
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 174
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 326
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 467
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 204
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 245
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 167
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 334
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 140
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 143
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
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 410
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 228
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
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 45
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 560
    col: 0
    score: 1
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 187
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 66
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 186
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 212
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 162
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 191
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 233
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 129
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 212
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
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 121
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 120
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 575
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 193
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 644
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 178
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 150
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 266
    col: 0
    score: 1
  - uuid: ac9d3ac5-9a6a-4180-a67f-1ab7e229d981
    line: 138
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
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 166
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
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 424
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
    score: 0.86
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 537
    col: 0
    score: 0.86
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 360
    col: 0
    score: 0.86
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1322
    col: 0
    score: 0.86
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
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 44
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
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 50
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 53
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
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 173
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
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 404
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 155
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 191
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 142
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 347
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 171
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 122
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 92
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 302
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 481
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
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 737
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 74
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
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 322
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
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 366
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
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 371
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
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 372
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
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 697
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 257
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 154
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 216
    col: 0
    score: 1
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 102
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 131
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 605
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1111
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 169
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 185
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
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 435
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 684
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 603
    col: 0
    score: 0.99
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 347
    col: 0
    score: 0.99
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 520
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 755
    col: 0
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 173
    col: 0
    score: 0.9
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
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 382
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 220
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
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 570
    col: 0
    score: 1
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 52
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 197
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 101
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 139
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 260
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 188
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 197
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 270
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 167
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
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 423
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 409
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
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 229
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 240
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 195
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 221
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 170
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 310
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 462
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 199
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 240
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 141
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 756
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
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 617
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 521
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 289
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 786
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 78
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 96
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 615
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 285
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 366
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 243
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
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 411
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
  - uuid: ac9d3ac5-9a6a-4180-a67f-1ab7e229d981
    line: 166
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 419
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
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 133
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 126
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 42
    col: 0
    score: 1
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 225
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 195
    col: 0
    score: 1
  - uuid: 930054b3-ba95-4acf-bb92-0e3ead25ed0b
    line: 67
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 232
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 82
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 52
    col: 0
    score: 1
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 120
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 744
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 47
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 58
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 42
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 589
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 314
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 658
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 552
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 245
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 242
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 285
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 659
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 169
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 58
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 155
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 621
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
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 401
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
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 281
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 746
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
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 222
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
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 391
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
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 258
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 267
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 126
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 211
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 538
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 282
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 392
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 276
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 270
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 147
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
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 147
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 311
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 534
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 565
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 222
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 198
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 186
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 759
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 571
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 248
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 273
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
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 128
    col: 0
    score: 1
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 169
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 815
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 94
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 272
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 201
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 356
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 706
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 236
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 241
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 93
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 155
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 190
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 525
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 228
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 238
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 260
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 265
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 127
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 214
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 279
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 278
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 253
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 152
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 215
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
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 166
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 161
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 230
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 207
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 249
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 204
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 212
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 163
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 202
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 296
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 438
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 215
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 112
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
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 809
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
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 119
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
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 85
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 184
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 610
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 289
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 254
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 343
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 681
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 677
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
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 104
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 374
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 407
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
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 94
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 101
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 458
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 231
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 193
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 84
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 175
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 188
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 218
    col: 0
    score: 1
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 237
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 267
    col: 0
    score: 1
  - uuid: f1add613-656e-4bec-b52b-193fd78c4642
    line: 73
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 170
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 67
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 96
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 139
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 548
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 349
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 213
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 259
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 296
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 546
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 257
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 223
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 332
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 411
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 248
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 146
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 298
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 96
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 309
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 532
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 533
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1040
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 210
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 261
    col: 0
    score: 1
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 140
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 764
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
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 422
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
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 96
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
  - uuid: ac9d3ac5-9a6a-4180-a67f-1ab7e229d981
    line: 153
    col: 0
    score: 1
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
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 474
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 257
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 260
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 162
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 85
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 161
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 76
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 382
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 577
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1128
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 120
    col: 0
    score: 1
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
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 175
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 256
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 373
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 409
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 153
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 140
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 177
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 290
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 168
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 166
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
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 378
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
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 573
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 110
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 98
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 563
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 158
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 282
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 637
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 624
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 798
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1079
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 281
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 334
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1611
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 228
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 701
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 439
    col: 0
    score: 1
  - uuid: 930054b3-ba95-4acf-bb92-0e3ead25ed0b
    line: 92
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 269
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 449
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 198
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 197
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 110
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 333
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 259
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 104
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 388
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 335
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 552
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 673
    col: 0
    score: 1
  - uuid: 930054b3-ba95-4acf-bb92-0e3ead25ed0b
    line: 120
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 242
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 746
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 451
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 367
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 698
    col: 0
    score: 0.97
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1537
    col: 0
    score: 0.97
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 154
    col: 0
    score: 0.97
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 553
    col: 0
    score: 0.97
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 332
    col: 0
    score: 0.95
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 120
    col: 0
    score: 0.95
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 574
    col: 0
    score: 0.95
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 81
    col: 0
    score: 0.97
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 348
    col: 0
    score: 0.97
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1363
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 105
    col: 0
    score: 0.97
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 360
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 849
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 937
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1603
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 507
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1008
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 269
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 423
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 578
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 406
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 295
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 532
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 346
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 622
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
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 385
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 646
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 253
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 164
    col: 0
    score: 0.96
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 437
    col: 0
    score: 0.96
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 506
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 460
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 590
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 438
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 724
    col: 0
    score: 0.98
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 521
    col: 0
    score: 0.98
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 315
    col: 0
    score: 0.97
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 487
    col: 0
    score: 0.97
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 453
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1018
    col: 0
    score: 0.99
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 760
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 797
    col: 0
    score: 0.99
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 674
    col: 0
    score: 0.99
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 533
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1194
    col: 0
    score: 0.98
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 955
    col: 0
    score: 0.98
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 646
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 568
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 2556
    col: 0
    score: 0.96
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2426
    col: 0
    score: 0.97
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 2174
    col: 0
    score: 0.96
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 91
    col: 0
    score: 0.96
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 537
    col: 0
    score: 0.96
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 398
    col: 0
    score: 0.96
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 644
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 788
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 390
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 281
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 915
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 189
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1106
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 944
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 842
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 415
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 330
    col: 0
    score: 0.98
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 730
    col: 0
    score: 0.98
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 312
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 466
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 640
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 873
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 418
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 935
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 674
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 888
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 406
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1188
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 942
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 491
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 220
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 455
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 125
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 755
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 486
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 460
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 559
    col: 0
    score: 1
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 85
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 337
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 564
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 659
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 512
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 389
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 358
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 437
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 382
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 563
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 777
    col: 0
    score: 1
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 296
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 2589
    col: 0
    score: 0.98
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 2383
    col: 0
    score: 0.98
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 2422
    col: 0
    score: 0.98
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 352
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 468
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 263
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 488
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 595
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 469
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 627
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1347
    col: 0
    score: 1
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 405
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 395
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 736
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 645
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 702
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 609
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
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 918
    col: 0
    score: 0.95
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 367
    col: 0
    score: 0.95
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1491
    col: 0
    score: 0.95
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 843
    col: 0
    score: 0.95
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 1003
    col: 0
    score: 0.95
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 619
    col: 0
    score: 0.95
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1287
    col: 0
    score: 0.95
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 936
    col: 0
    score: 0.95
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 887
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 925
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 827
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 539
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 745
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1002
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 583
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 740
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 871
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 888
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 926
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 828
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 540
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 746
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1003
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 584
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 741
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 872
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 742
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 998
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 3458
    col: 0
    score: 0.97
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 4471
    col: 0
    score: 0.94
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 3746
    col: 0
    score: 0.94
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2613
    col: 0
    score: 0.94
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 4498
    col: 0
    score: 0.93
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 3781
    col: 0
    score: 0.93
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 4582
    col: 0
    score: 0.91
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 630
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 1011
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 874
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 576
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 914
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 648
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 342
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 770
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 697
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 709
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 621
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 891
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 929
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 831
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 543
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 749
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1006
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 587
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 744
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1356
    col: 0
    score: 0.92
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1107
    col: 0
    score: 0.92
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 675
    col: 0
    score: 0.92
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 515
    col: 0
    score: 0.92
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 829
    col: 0
    score: 0.92
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1233
    col: 0
    score: 0.92
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 641
    col: 0
    score: 0.92
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1289
    col: 0
    score: 0.92
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 420
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 874
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 904
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 634
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 645
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 535
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 1015
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 877
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 579
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 917
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 932
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 834
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 546
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 752
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1009
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 590
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 747
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 878
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 841
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 933
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 835
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 547
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 753
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1010
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 591
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 748
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 879
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 636
    col: 0
    score: 0.98
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 502
    col: 0
    score: 0.98
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 396
    col: 0
    score: 0.98
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 362
    col: 0
    score: 0.98
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 283
    col: 0
    score: 0.98
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 877
    col: 0
    score: 0.98
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 907
    col: 0
    score: 0.98
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 637
    col: 0
    score: 0.98
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 648
    col: 0
    score: 0.98
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 538
    col: 0
    score: 0.98
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 1018
    col: 0
    score: 0.98
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 316
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1331
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 427
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1345
    col: 0
    score: 0.98
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 410
    col: 0
    score: 0.98
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 600
    col: 0
    score: 0.98
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1011
    col: 0
    score: 0.98
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 392
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 582
    col: 0
    score: 0.98
  - uuid: b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
    line: 224
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 265
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 686
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 404
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 557
    col: 0
    score: 1
  - uuid: 86a691ec-ca1f-4350-824c-0ded1f8ebe70
    line: 218
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 816
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 617
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 256
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 517
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1302
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 683
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 558
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 815
    col: 0
    score: 1
  - uuid: b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
    line: 223
    col: 0
    score: 1
  - uuid: 86a691ec-ca1f-4350-824c-0ded1f8ebe70
    line: 217
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 327
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 513
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 274
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 300
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 254
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 565
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 439
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 4121
    col: 0
    score: 0.98
  - uuid: 930054b3-ba95-4acf-bb92-0e3ead25ed0b
    line: 97
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 501
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 3255
    col: 0
    score: 0.97
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 1087
    col: 0
    score: 0.97
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 3588
    col: 0
    score: 0.97
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 235
    col: 0
    score: 0.97
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 500
    col: 0
    score: 0.97
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1802
    col: 0
    score: 0.97
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 284
    col: 0
    score: 0.98
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 286
    col: 0
    score: 0.98
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 433
    col: 0
    score: 0.97
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 504
    col: 0
    score: 0.97
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 768
    col: 0
    score: 0.97
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 377
    col: 0
    score: 0.97
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 339
    col: 0
    score: 0.96
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 465
    col: 0
    score: 0.95
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 380
    col: 0
    score: 0.95
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 260
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 870
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 447
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 271
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
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 196
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 431
    col: 0
    score: 0.96
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 3359
    col: 0
    score: 0.96
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 3276
    col: 0
    score: 0.96
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 239
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 999
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 379
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 716
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 466
    col: 0
    score: 0.94
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 4500
    col: 0
    score: 0.94
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 3757
    col: 0
    score: 0.94
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2220
    col: 0
    score: 0.94
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 3998
    col: 0
    score: 0.94
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 3797
    col: 0
    score: 0.94
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 4129
    col: 0
    score: 0.94
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 3868
    col: 0
    score: 0.94
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 318
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1183
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 345
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 555
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 733
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 186
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2099
    col: 0
    score: 0.97
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 1997
    col: 0
    score: 0.97
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 487
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 367
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1128
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 299
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 378
    col: 0
    score: 1
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 95
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 479
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 97
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 647
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 317
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 606
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 790
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1075
    col: 0
    score: 0.96
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 874
    col: 0
    score: 0.96
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 748
    col: 0
    score: 0.96
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 680
    col: 0
    score: 0.96
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1102
    col: 0
    score: 0.95
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 527
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
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 278
    col: 0
    score: 0.98
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 479
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 951
    col: 0
    score: 0.98
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 512
    col: 0
    score: 0.98
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 353
    col: 0
    score: 0.98
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 455
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 343
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 623
    col: 0
    score: 0.99
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 462
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 759
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 612
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 628
    col: 0
    score: 0.98
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 256
    col: 0
    score: 0.99
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 384
    col: 0
    score: 0.97
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 425
    col: 0
    score: 0.98
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 814
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1736
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 398
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 372
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 333
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 727
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 662
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 292
    col: 0
    score: 0.99
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 374
    col: 0
    score: 0.99
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 429
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 7440
    col: 0
    score: 0.95
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 4875
    col: 0
    score: 0.94
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 4108
    col: 0
    score: 0.94
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 1281
    col: 0
    score: 0.94
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 432
    col: 0
    score: 0.94
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 1068
    col: 0
    score: 0.94
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 2278
    col: 0
    score: 0.94
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 1034
    col: 0
    score: 0.94
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 424
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 215
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 762
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 351
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 493
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 406
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 321
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 4222
    col: 0
    score: 0.97
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 7058
    col: 0
    score: 0.97
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 607
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 515
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 387
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 644
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 6735
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 3551
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 5413
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 3911
    col: 0
    score: 0.99
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 272
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 414
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 252
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 231
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 249
    col: 0
    score: 0.97
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1746
    col: 0
    score: 0.97
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 886
    col: 0
    score: 0.97
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 770
    col: 0
    score: 0.97
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1294
    col: 0
    score: 0.97
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 359
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 492
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 357
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 432
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 394
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 574
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1216
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1159
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 818
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 909
    col: 0
    score: 0.99
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 827
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 984
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1576
    col: 0
    score: 0.97
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1463
    col: 0
    score: 0.95
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 395
    col: 0
    score: 0.95
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 754
    col: 0
    score: 0.95
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 436
    col: 0
    score: 0.94
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 294
    col: 0
    score: 0.94
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 802
    col: 0
    score: 0.94
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2651
    col: 0
    score: 0.94
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1554
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1064
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 338
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 482
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 385
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 868
    col: 0
    score: 0.98
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 657
    col: 0
    score: 0.98
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 359
    col: 0
    score: 0.97
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 592
    col: 0
    score: 1
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
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 435
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 332
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 358
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 719
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 830
    col: 0
    score: 1
  - uuid: 930054b3-ba95-4acf-bb92-0e3ead25ed0b
    line: 98
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1240
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 302
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 875
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 623
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1489
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 808
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 245
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 833
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 395
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1283
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1634
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 227
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 322
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 350
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 370
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1066
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 627
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 820
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 881
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 331
    col: 0
    score: 1
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 110
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 937
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 363
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 332
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 747
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 528
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 475
    col: 0
    score: 0.97
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 499
    col: 0
    score: 0.97
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1871
    col: 0
    score: 0.97
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 336
    col: 0
    score: 0.98
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 523
    col: 0
    score: 0.97
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 331
    col: 0
    score: 0.97
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 617
    col: 0
    score: 0.96
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 722
    col: 0
    score: 0.96
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 925
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 479
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
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 623
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 554
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 476
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 339
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
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2331
    col: 0
    score: 0.93
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 624
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 555
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 477
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 340
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
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 420
    col: 0
    score: 0.96
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 350
    col: 0
    score: 0.97
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 625
    col: 0
    score: 0.96
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 478
    col: 0
    score: 0.96
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1228
    col: 0
    score: 0.98
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 906
    col: 0
    score: 0.97
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 474
    col: 0
    score: 0.97
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 342
    col: 0
    score: 0.97
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 923
    col: 0
    score: 0.97
  - uuid: 930054b3-ba95-4acf-bb92-0e3ead25ed0b
    line: 106
    col: 0
    score: 0.97
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 262
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 481
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 982
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 432
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1084
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 740
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 525
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 797
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 348
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 801
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 417
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 255
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 948
    col: 0
    score: 0.96
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 821
    col: 0
    score: 0.96
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 240
    col: 0
    score: 0.96
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 356
    col: 0
    score: 0.96
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1685
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 474
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 298
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 961
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 221
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 1350
    col: 0
    score: 0.98
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 963
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 1520
    col: 0
    score: 0.98
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 557
    col: 0
    score: 0.98
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 366
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 229
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1065
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 821
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 931
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 838
    col: 0
    score: 0.94
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1468
    col: 0
    score: 0.96
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 324
    col: 0
    score: 0.94
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 967
    col: 0
    score: 0.94
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 349
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 378
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 355
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 522
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 186
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 2056
    col: 0
    score: 0.97
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 2497
    col: 0
    score: 0.96
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 2052
    col: 0
    score: 0.96
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1687
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2927
    col: 0
    score: 0.96
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 3618
    col: 0
    score: 0.95
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 3632
    col: 0
    score: 0.95
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 3623
    col: 0
    score: 0.95
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 6829
    col: 0
    score: 0.95
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 3712
    col: 0
    score: 0.95
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 3658
    col: 0
    score: 0.95
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 600
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 191
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 280
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 151
    col: 0
    score: 0.99
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 775
    col: 0
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 424
    col: 0
    score: 0.99
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 326
    col: 0
    score: 0.98
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 531
    col: 0
    score: 0.98
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 601
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 192
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 281
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 776
    col: 0
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 425
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 6337
    col: 0
    score: 0.95
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 4806
    col: 0
    score: 0.95
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 4038
    col: 0
    score: 0.95
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2945
    col: 0
    score: 0.95
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 282
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 602
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 152
    col: 0
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 426
    col: 0
    score: 0.99
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 472
    col: 0
    score: 0.99
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 298
    col: 0
    score: 0.98
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 336
    col: 0
    score: 0.98
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 405
    col: 0
    score: 0.98
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 652
    col: 0
    score: 0.98
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 635
    col: 0
    score: 0.98
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 283
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 153
    col: 0
    score: 0.99
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 778
    col: 0
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 427
    col: 0
    score: 0.99
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 708
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 805
    col: 0
    score: 0.95
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 329
    col: 0
    score: 0.98
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 203
    col: 0
    score: 0.98
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 133
    col: 0
    score: 0.98
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 604
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 154
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 779
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 428
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 291
    col: 0
    score: 0.98
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 535
    col: 0
    score: 0.98
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 509
    col: 0
    score: 0.98
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 565
    col: 0
    score: 0.98
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 311
    col: 0
    score: 0.98
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 727
    col: 0
    score: 0.96
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 993
    col: 0
    score: 0.96
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1017
    col: 0
    score: 0.97
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 851
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1449
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 682
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 933
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 855
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1075
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 817
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 798
    col: 0
    score: 0.99
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 761
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1450
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 683
    col: 0
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 934
    col: 0
    score: 0.99
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 856
    col: 0
    score: 0.99
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1076
    col: 0
    score: 0.99
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 289
    col: 0
    score: 0.96
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 804
    col: 0
    score: 0.96
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 762
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 852
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 684
    col: 0
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 935
    col: 0
    score: 0.99
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 857
    col: 0
    score: 0.99
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1077
    col: 0
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1417
    col: 0
    score: 0.97
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1131
    col: 0
    score: 0.97
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 711
    col: 0
    score: 0.96
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 742
    col: 0
    score: 0.96
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 1027
    col: 0
    score: 0.96
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 1287
    col: 0
    score: 0.96
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 639
    col: 0
    score: 0.96
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 670
    col: 0
    score: 0.96
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 887
    col: 0
    score: 0.96
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 982
    col: 0
    score: 0.96
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 764
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 854
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1452
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 685
    col: 0
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 937
    col: 0
    score: 0.99
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 859
    col: 0
    score: 0.99
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1079
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 423
    col: 0
    score: 0.98
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 765
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 855
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1453
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 686
    col: 0
    score: 0.99
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 860
    col: 0
    score: 0.99
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1080
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 877
    col: 0
    score: 0.98
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 948
    col: 0
    score: 0.98
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 767
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 857
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1455
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 688
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1232
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1082
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 433
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1541
    col: 0
    score: 0.98
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 829
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 152
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1483
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 1067
    col: 0
    score: 0.98
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 609
    col: 0
    score: 0.97
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1000
    col: 0
    score: 0.97
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 1015
    col: 0
    score: 0.97
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 916
    col: 0
    score: 0.97
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 426
    col: 0
    score: 1
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 447
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 564
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 121
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1265
    col: 0
    score: 0.98
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 336
    col: 0
    score: 0.98
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 538
    col: 0
    score: 0.98
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 559
    col: 0
    score: 0.98
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 545
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 484
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 325
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 445
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 431
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 509
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 688
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 446
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 649
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 1133
    col: 0
    score: 0.95
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2528
    col: 0
    score: 0.95
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 3130
    col: 0
    score: 0.94
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 1890
    col: 0
    score: 0.94
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 4430
    col: 0
    score: 0.94
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 7149
    col: 0
    score: 0.94
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 1869
    col: 0
    score: 0.94
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 1573
    col: 0
    score: 0.94
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 1769
    col: 0
    score: 0.94
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 161
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 629
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 370
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 868
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 935
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 702
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 742
    col: 0
    score: 0.95
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 816
    col: 0
    score: 0.95
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 512
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 594
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
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 356
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 424
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 673
    col: 0
    score: 0.97
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 256
    col: 0
    score: 0.96
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1281
    col: 0
    score: 0.96
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 386
    col: 0
    score: 0.96
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 658
    col: 0
    score: 0.96
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 366
    col: 0
    score: 0.96
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 197
    col: 0
    score: 0.96
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 432
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 347
    col: 0
    score: 0.96
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 509
    col: 0
    score: 0.95
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 1130
    col: 0
    score: 0.95
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 1896
    col: 0
    score: 0.95
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 1107
    col: 0
    score: 0.95
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 526
    col: 0
    score: 0.95
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 1206
    col: 0
    score: 0.95
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
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 714
    col: 0
    score: 0.98
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 396
    col: 0
    score: 0.98
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 978
    col: 0
    score: 0.98
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1129
    col: 0
    score: 0.98
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 435
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 651
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1798
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 400
    col: 0
    score: 0.96
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 506
    col: 0
    score: 0.96
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 352
    col: 0
    score: 0.96
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 190
    col: 0
    score: 0.96
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 547
    col: 0
    score: 0.95
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1085
    col: 0
    score: 0.98
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 372
    col: 0
    score: 0.98
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 627
    col: 0
    score: 0.98
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 556
    col: 0
    score: 0.98
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 955
    col: 0
    score: 0.98
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 791
    col: 0
    score: 0.98
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 391
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 457
    col: 0
    score: 0.98
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 456
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 122
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 573
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 436
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
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 132
    col: 0
    score: 0.97
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 190
    col: 0
    score: 0.97
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 372
    col: 0
    score: 0.97
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 685
    col: 0
    score: 0.97
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 558
    col: 0
    score: 0.97
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 93
    col: 0
    score: 0.97
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 598
    col: 0
    score: 0.97
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1422
    col: 0
    score: 0.97
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 832
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 879
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 291
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 403
    col: 0
    score: 0.95
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 692
    col: 0
    score: 0.95
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1034
    col: 0
    score: 0.95
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 315
    col: 0
    score: 0.95
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1481
    col: 0
    score: 0.95
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 419
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1060
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 363
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 5993
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 4353
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 7477
    col: 0
    score: 0.98
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 294
    col: 0
    score: 0.98
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 783
    col: 0
    score: 0.97
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 887
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 877
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 273
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 526
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 109
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 167
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1298
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 347
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 333
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 500
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 226
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1766
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 541
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 444
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 2928
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 3254
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1357
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 899
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 259
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 914
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 449
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 555
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 5295
    col: 0
    score: 0.98
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2933
    col: 0
    score: 0.98
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 215
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 376
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
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 725
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 368
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 575
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 836
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 383
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 382
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 3032
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 3223
    col: 0
    score: 0.98
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 3323
    col: 0
    score: 0.97
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2514
    col: 0
    score: 0.96
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2841
    col: 0
    score: 0.96
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 281
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 355
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 446
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 668
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 3578
    col: 0
    score: 0.98
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 1318
    col: 0
    score: 0.98
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 2896
    col: 0
    score: 0.98
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 1410
    col: 0
    score: 0.98
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 4232
    col: 0
    score: 0.98
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 688
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 259
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 478
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1157
    col: 0
    score: 0.98
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 435
    col: 0
    score: 0.98
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 510
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1795
    col: 0
    score: 0.98
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 204
    col: 0
    score: 0.98
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 996
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 399
    col: 0
    score: 0.97
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 330
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 408
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 450
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 461
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1359
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 197
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1027
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 357
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 685
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 654
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
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 502
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 338
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 925
    col: 0
    score: 0.99
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 924
    col: 0
    score: 0.98
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 900
    col: 0
    score: 0.98
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 379
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 447
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 3369
    col: 0
    score: 0.97
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2000
    col: 0
    score: 0.96
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 2741
    col: 0
    score: 0.95
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 2034
    col: 0
    score: 0.94
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 203
    col: 0
    score: 0.94
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 432
    col: 0
    score: 0.94
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1094
    col: 0
    score: 0.96
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1777
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 441
    col: 0
    score: 1
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
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 139
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
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 572
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 570
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 622
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 447
    col: 0
    score: 0.98
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 69
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 430
    col: 0
    score: 0.98
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 857
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 733
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 681
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 839
    col: 0
    score: 0.96
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 1221
    col: 0
    score: 0.96
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 1882
    col: 0
    score: 0.96
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 1442
    col: 0
    score: 0.96
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 1545
    col: 0
    score: 0.96
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 710
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 693
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 522
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 276
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 648
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 676
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1064
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 268
    col: 0
    score: 0.97
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 447
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 400
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 344
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 274
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 151
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 208
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 389
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 339
    col: 0
    score: 1
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 84
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 353
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 2483
    col: 0
    score: 0.96
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 3497
    col: 0
    score: 0.95
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 3520
    col: 0
    score: 0.95
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1202
    col: 0
    score: 0.95
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 3577
    col: 0
    score: 0.94
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 2163
    col: 0
    score: 0.94
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 483
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 621
    col: 0
    score: 0.96
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 456
    col: 0
    score: 0.96
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 266
    col: 0
    score: 0.96
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 805
    col: 0
    score: 1
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 88
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 941
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 825
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 318
    col: 0
    score: 0.96
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 339
    col: 0
    score: 0.96
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1366
    col: 0
    score: 0.96
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 381
    col: 0
    score: 0.95
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 600
    col: 0
    score: 0.95
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 825
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 458
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 715
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 451
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 336
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 829
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 151
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1627
    col: 0
    score: 0.97
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 620
    col: 0
    score: 0.97
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 135
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 528
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 514
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 689
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 199
    col: 0
    score: 0.94
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 213
    col: 0
    score: 0.94
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 240
    col: 0
    score: 0.94
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 187
    col: 0
    score: 0.94
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 196
    col: 0
    score: 0.94
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 489
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 356
    col: 0
    score: 0.94
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 333
    col: 0
    score: 0.93
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 334
    col: 0
    score: 0.93
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 136
    col: 0
    score: 0.93
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 193
    col: 0
    score: 0.93
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 3029
    col: 0
    score: 0.93
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 2033
    col: 0
    score: 0.93
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 193
    col: 0
    score: 0.93
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 958
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 455
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1242
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 702
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 911
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 792
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1738
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 865
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 273
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 846
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 734
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 335
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 838
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 549
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1000
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 833
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 457
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 440
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 447
    col: 0
    score: 0.98
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 458
    col: 0
    score: 0.98
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 294
    col: 0
    score: 0.98
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 377
    col: 0
    score: 0.97
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 831
    col: 0
    score: 0.97
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 886
    col: 0
    score: 0.97
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 458
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 459
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 1037
    col: 0
    score: 0.98
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 145
    col: 0
    score: 0.98
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 1175
    col: 0
    score: 0.98
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 889
    col: 0
    score: 0.98
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 1610
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 1405
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1695
    col: 0
    score: 0.98
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 718
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 487
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1697
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 717
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1858
    col: 0
    score: 0.98
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 963
    col: 0
    score: 0.98
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 662
    col: 0
    score: 0.96
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 448
    col: 0
    score: 0.96
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 711
    col: 0
    score: 0.96
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1847
    col: 0
    score: 0.96
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 248
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 819
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 850
    col: 0
    score: 0.98
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 654
    col: 0
    score: 0.98
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 247
    col: 0
    score: 0.98
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 804
    col: 0
    score: 0.98
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 114
    col: 0
    score: 0.98
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 320
    col: 0
    score: 0.98
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 592
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 877
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 407
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 374
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 244
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 283
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1344
    col: 0
    score: 0.98
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 464
    col: 0
    score: 0.98
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 544
    col: 0
    score: 0.98
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 378
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 621
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 872
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 856
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 703
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 891
    col: 0
    score: 0.98
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 798
    col: 0
    score: 0.98
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 800
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 812
    col: 0
    score: 0.98
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 486
    col: 0
    score: 0.98
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 244
    col: 0
    score: 0.99
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 602
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 219
    col: 0
    score: 0.98
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 520
    col: 0
    score: 0.99
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 394
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 648
    col: 0
    score: 0.98
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 384
    col: 0
    score: 0.98
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 663
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 428
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 415
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 856
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1152
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1657
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 396
    col: 0
    score: 0.96
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 205
    col: 0
    score: 0.96
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 766
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 329
    col: 0
    score: 0.99
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 334
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 457
    col: 0
    score: 0.99
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 487
    col: 0
    score: 0.99
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 302
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 594
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 983
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 938
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 388
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 366
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 858
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 558
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 322
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 922
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 827
    col: 0
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 850
    col: 0
    score: 0.99
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 310
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 310
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 756
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 247
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 106
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 372
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 724
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 721
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 467
    col: 0
    score: 0.97
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 302
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 137
    col: 0
    score: 0.97
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 874
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 717
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 551
    col: 0
    score: 0.97
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 880
    col: 0
    score: 0.97
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 525
    col: 0
    score: 0.97
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 301
    col: 0
    score: 0.98
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 793
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 873
    col: 0
    score: 0.98
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 523
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1711
    col: 0
    score: 0.98
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 459
    col: 0
    score: 0.98
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 473
    col: 0
    score: 0.97
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 431
    col: 0
    score: 0.97
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 418
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 833
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 704
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 400
    col: 0
    score: 0.99
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 459
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 940
    col: 0
    score: 0.99
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 90
    col: 0
    score: 0.99
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 140
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1723
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 123
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 315
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 961
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 826
    col: 0
    score: 0.99
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 601
    col: 0
    score: 0.99
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 769
    col: 0
    score: 0.99
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 305
    col: 0
    score: 0.99
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 386
    col: 0
    score: 0.99
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 702
    col: 0
    score: 0.96
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 855
    col: 0
    score: 0.96
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 514
    col: 0
    score: 0.96
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 807
    col: 0
    score: 0.96
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 4243
    col: 0
    score: 0.96
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 653
    col: 0
    score: 0.96
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 148
    col: 0
    score: 0.96
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 306
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 141
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 875
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 528
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 720
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 552
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1073
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 191
    col: 0
    score: 0.95
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1848
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 799
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 408
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 336
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 484
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 377
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1635
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 852
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 870
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 353
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 370
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 401
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 376
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 826
    col: 0
    score: 0.98
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 425
    col: 0
    score: 0.98
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 406
    col: 0
    score: 0.97
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2082
    col: 0
    score: 0.96
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2104
    col: 0
    score: 0.96
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2043
    col: 0
    score: 0.95
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 269
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1209
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1311
    col: 0
    score: 0.98
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 1515
    col: 0
    score: 0.97
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 1081
    col: 0
    score: 0.97
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 454
    col: 0
    score: 0.97
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 558
    col: 0
    score: 0.97
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 365
    col: 0
    score: 0.97
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 491
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 917
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1008
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 450
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 977
    col: 0
    score: 0.99
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 844
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1668
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 339
    col: 0
    score: 0.95
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 572
    col: 0
    score: 0.95
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 541
    col: 0
    score: 0.95
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 216
    col: 0
    score: 0.95
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1070
    col: 0
    score: 0.97
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 395
    col: 0
    score: 0.95
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 507
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 483
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 566
    col: 0
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 251
    col: 0
    score: 0.96
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 432
    col: 0
    score: 0.96
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 702
    col: 0
    score: 0.96
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 551
    col: 0
    score: 0.96
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 551
    col: 0
    score: 0.96
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 950
    col: 0
    score: 0.96
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 500
    col: 0
    score: 0.96
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 523
    col: 0
    score: 0.96
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 669
    col: 0
    score: 0.96
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1069
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 868
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 949
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 875
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 683
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1005
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 350
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1710
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 857
    col: 0
    score: 0.98
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 427
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 848
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 845
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1850
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 527
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 202
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1246
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 468
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 357
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 238
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 997
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1629
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 676
    col: 0
    score: 0.97
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 358
    col: 0
    score: 0.97
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 1006
    col: 0
    score: 0.97
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 731
    col: 0
    score: 0.98
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 653
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 788
    col: 0
    score: 0.98
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 389
    col: 0
    score: 0.97
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 645
    col: 0
    score: 0.97
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 183
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 700
    col: 0
    score: 0.97
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 648
    col: 0
    score: 0.97
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 416
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 192
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 404
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1593
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 443
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 420
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
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 753
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 608
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 790
    col: 0
    score: 0.97
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 928
    col: 0
    score: 0.97
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 924
    col: 0
    score: 0.96
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 358
    col: 0
    score: 0.96
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 718
    col: 0
    score: 0.95
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 825
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 968
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 966
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 349
    col: 0
    score: 0.97
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 875
    col: 0
    score: 0.96
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 793
    col: 0
    score: 0.96
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 767
    col: 0
    score: 0.96
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1646
    col: 0
    score: 0.96
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 853
    col: 0
    score: 0.96
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 904
    col: 0
    score: 0.95
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 988
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 873
    col: 0
    score: 0.99
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 639
    col: 0
    score: 0.99
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 239
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1841
    col: 0
    score: 0.98
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 150
    col: 0
    score: 0.97
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 207
    col: 0
    score: 0.97
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 964
    col: 0
    score: 0.97
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1160
    col: 0
    score: 0.97
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 277
    col: 0
    score: 0.97
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 376
    col: 0
    score: 0.97
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 253
    col: 0
    score: 0.96
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 467
    col: 0
    score: 0.95
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1873
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 287
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 524
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 865
    col: 0
    score: 0.99
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 605
    col: 0
    score: 0.96
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 602
    col: 0
    score: 0.96
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 148
    col: 0
    score: 0.96
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 205
    col: 0
    score: 0.96
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 439
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 528
    col: 0
    score: 0.98
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 421
    col: 0
    score: 0.98
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 411
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1726
    col: 0
    score: 0.98
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 435
    col: 0
    score: 0.98
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 399
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 605
    col: 0
    score: 0.98
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 168
    col: 0
    score: 0.97
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 471
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 222
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 290
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 225
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 509
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 898
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 382
    col: 0
    score: 0.99
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 287
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 218
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 1947
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 535
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1196
    col: 0
    score: 0.98
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 956
    col: 0
    score: 0.98
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 795
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 345
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 454
    col: 0
    score: 0.99
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 405
    col: 0
    score: 0.98
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 270
    col: 0
    score: 0.98
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 271
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 767
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1419
    col: 0
    score: 0.98
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 558
    col: 0
    score: 0.98
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 785
    col: 0
    score: 0.98
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 1061
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1020
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1238
    col: 0
    score: 1
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 436
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 509
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 390
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 491
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 511
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 346
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 738
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 492
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 517
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 613
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 811
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 851
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 934
    col: 0
    score: 0.97
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 359
    col: 0
    score: 0.97
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 906
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 854
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 394
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 534
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 287
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 439
    col: 0
    score: 0.96
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 993
    col: 0
    score: 0.96
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 575
    col: 0
    score: 0.96
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 426
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 456
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
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 446
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 407
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2367
    col: 0
    score: 0.98
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2930
    col: 0
    score: 0.97
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 137
    col: 0
    score: 0.96
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 358
    col: 0
    score: 0.96
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2236
    col: 0
    score: 0.95
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 78
    col: 0
    score: 0.95
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 333
    col: 0
    score: 0.95
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2545
    col: 0
    score: 0.95
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1023
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1487
    col: 0
    score: 0.98
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 678
    col: 0
    score: 0.98
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 143
    col: 0
    score: 0.98
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 200
    col: 0
    score: 0.98
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 404
    col: 0
    score: 0.98
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 269
    col: 0
    score: 0.98
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 270
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 766
    col: 0
    score: 0.98
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 572
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 831
    col: 0
    score: 0.99
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 458
    col: 0
    score: 0.99
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 854
    col: 0
    score: 0.99
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 233
    col: 0
    score: 0.99
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 292
    col: 0
    score: 0.99
  - uuid: 86a691ec-ca1f-4350-824c-0ded1f8ebe70
    line: 223
    col: 0
    score: 0.99
  - uuid: b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
    line: 232
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 667
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 742
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 358
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 313
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1564
    col: 0
    score: 0.97
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 345
    col: 0
    score: 0.97
  - uuid: 86a691ec-ca1f-4350-824c-0ded1f8ebe70
    line: 160
    col: 0
    score: 1
  - uuid: b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
    line: 171
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
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 180
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 177
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 174
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 375
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
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 181
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 178
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
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 278
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
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 385
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 152
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 565
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
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 179
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 176
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 119
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1435
    col: 0
    score: 0.98
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 454
    col: 0
    score: 0.98
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 401
    col: 0
    score: 0.98
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 610
    col: 0
    score: 0.98
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 495
    col: 0
    score: 0.98
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 89
    col: 0
    score: 0.98
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 151
    col: 0
    score: 0.98
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 888
    col: 0
    score: 0.99
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 885
    col: 0
    score: 0.97
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 943
    col: 0
    score: 0.98
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 972
    col: 0
    score: 0.97
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 1029
    col: 0
    score: 0.95
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 878
    col: 0
    score: 0.94
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 1036
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 543
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 347
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 520
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 936
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 548
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 238
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 940
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2294
    col: 0
    score: 0.97
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 1060
    col: 0
    score: 0.97
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 3064
    col: 0
    score: 0.97
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 3083
    col: 0
    score: 0.96
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2492
    col: 0
    score: 0.96
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2323
    col: 0
    score: 0.96
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 2523
    col: 0
    score: 0.96
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2457
    col: 0
    score: 0.96
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 1921
    col: 0
    score: 0.94
  - uuid: 930054b3-ba95-4acf-bb92-0e3ead25ed0b
    line: 121
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 837
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 485
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 364
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 349
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1758
    col: 0
    score: 0.99
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 385
    col: 0
    score: 0.99
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 398
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1020
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 254
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2354
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 2479
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 3259
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 3251
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 3205
    col: 0
    score: 0.98
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2277
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 3274
    col: 0
    score: 0.98
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 385
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 434
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 520
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 356
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 735
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 184
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2184
    col: 0
    score: 0.97
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 3079
    col: 0
    score: 0.97
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 308
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 272
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 524
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 201
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 200
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 260
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 103
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 114
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 353
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 359
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 190
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 261
    col: 0
    score: 1
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 246
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 292
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 667
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 380
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 559
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 187
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 573
    col: 0
    score: 0.97
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 743
    col: 0
    score: 0.96
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 326
    col: 0
    score: 0.96
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 494
    col: 0
    score: 0.96
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 257
    col: 0
    score: 0.96
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 765
    col: 0
    score: 0.96
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1107
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 576
    col: 0
    score: 1
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 369
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 667
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 457
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 576
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 837
    col: 0
    score: 0.96
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 1219
    col: 0
    score: 0.96
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 534
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 519
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 370
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 189
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2265
    col: 0
    score: 0.97
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 3510
    col: 0
    score: 0.96
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 429
    col: 0
    score: 0.96
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 469
    col: 0
    score: 0.96
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 200
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 199
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 271
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 472
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 420
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 375
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2984
    col: 0
    score: 0.98
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 280
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 3014
    col: 0
    score: 0.98
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 441
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 631
    col: 0
    score: 0.97
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 375
    col: 0
    score: 0.97
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 1024
    col: 0
    score: 0.97
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 1472
    col: 0
    score: 0.97
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 575
    col: 0
    score: 0.97
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 376
    col: 0
    score: 0.97
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 1127
    col: 0
    score: 0.97
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 202
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 201
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 273
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 390
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 141
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1214
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 436
    col: 0
    score: 0.97
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 337
    col: 0
    score: 0.97
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 543
    col: 0
    score: 0.97
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 591
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 835
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
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 781
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 387
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 364
    col: 0
    score: 0.97
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 144
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 444
    col: 0
    score: 0.97
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 211
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 194
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 266
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 2268
    col: 0
    score: 0.98
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 145
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 365
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 445
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 212
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 195
    col: 0
    score: 0.99
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 267
    col: 0
    score: 0.99
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 366
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 713
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 445
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 560
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 199
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 591
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 400
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 562
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1508
    col: 0
    score: 0.99
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 714
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 446
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 561
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 229
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 592
    col: 0
    score: 1
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 475
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 563
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1509
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 715
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 447
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 230
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 593
    col: 0
    score: 1
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 476
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 401
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1510
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 674
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 716
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 231
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 594
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 348
    col: 0
    score: 0.99
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 477
    col: 0
    score: 0.99
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 402
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 564
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1511
    col: 0
    score: 0.99
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 675
    col: 0
    score: 0.99
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 717
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 232
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 595
    col: 0
    score: 1
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 478
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 565
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1512
    col: 0
    score: 0.99
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 676
    col: 0
    score: 0.99
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 173
    col: 0
    score: 0.97
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 718
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 596
    col: 0
    score: 1
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 479
    col: 0
    score: 0.99
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 404
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 566
    col: 0
    score: 0.99
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 677
    col: 0
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 1056
    col: 0
    score: 0.99
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 421
    col: 0
    score: 0.98
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 719
    col: 0
    score: 1
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 480
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 405
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 567
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1513
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 1057
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 135
    col: 0
    score: 0.98
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 341
    col: 0
    score: 0.98
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 720
    col: 0
    score: 1
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 481
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 406
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 568
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1514
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 678
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 1058
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 364
    col: 0
    score: 0.99
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 195
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 525
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 108
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 166
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 283
    col: 0
    score: 0.95
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 2644
    col: 0
    score: 0.95
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 118
    col: 0
    score: 0.94
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 141
    col: 0
    score: 0.94
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 534
    col: 0
    score: 0.94
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 523
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 918
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 440
    col: 0
    score: 0.98
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 452
    col: 0
    score: 0.97
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 281
    col: 0
    score: 0.97
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1175
    col: 0
    score: 0.97
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 282
    col: 0
    score: 0.97
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 521
    col: 0
    score: 0.97
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 393
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1156
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 275
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 1309
    col: 0
    score: 0.97
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 2887
    col: 0
    score: 0.97
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 1401
    col: 0
    score: 0.97
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 4223
    col: 0
    score: 0.97
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 1101
    col: 0
    score: 0.97
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 630
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 994
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 473
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 279
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 992
    col: 0
    score: 0.92
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 466
    col: 0
    score: 0.91
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 294
    col: 0
    score: 0.91
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 679
    col: 0
    score: 0.9
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 329
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 356
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 428
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 383
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 557
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 323
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 292
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1163
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 303
    col: 0
    score: 0.98
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 876
    col: 0
    score: 0.95
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 410
    col: 0
    score: 0.95
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 975
    col: 0
    score: 0.95
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 4271
    col: 0
    score: 0.94
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 1956
    col: 0
    score: 0.93
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 290
    col: 0
    score: 0.93
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3770
    col: 0
    score: 0.93
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 736
    col: 0
    score: 0.98
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 216
    col: 0
    score: 0.98
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 500
    col: 0
    score: 0.98
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 789
    col: 0
    score: 0.97
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 642
    col: 0
    score: 0.97
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 344
    col: 0
    score: 0.96
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1563
    col: 0
    score: 0.96
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 467
    col: 0
    score: 0.96
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 608
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 254
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 360
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 324
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 401
    col: 0
    score: 0.97
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 400
    col: 0
    score: 0.97
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 405
    col: 0
    score: 0.97
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 514
    col: 0
    score: 0.97
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1095
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1204
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 826
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 347
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 806
    col: 0
    score: 0.99
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 446
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
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 552
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 241
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 166
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 393
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 506
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 262
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 2198
    col: 0
    score: 0.97
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3932
    col: 0
    score: 0.97
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 667
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 531
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 331
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 366
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 369
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 947
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 354
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 363
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 1829
    col: 0
    score: 0.97
  - uuid: b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
    line: 253
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 626
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 391
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 581
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 644
    col: 0
    score: 0.98
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 378
    col: 0
    score: 0.98
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 414
    col: 0
    score: 0.98
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 420
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 699
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 415
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 352
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 476
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 915
    col: 0
    score: 0.98
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 390
    col: 0
    score: 0.98
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 462
    col: 0
    score: 0.98
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 336
    col: 0
    score: 0.98
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 268
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 453
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 756
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 412
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 594
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 530
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 323
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 2590
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 4811
    col: 0
    score: 0.98
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 655
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 584
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 323
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 363
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 770
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 654
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 682
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 330
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 480
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 455
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 288
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 318
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 250
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 537
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 581
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 582
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 748
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1003
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 288
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 350
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 391
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 159
    col: 0
    score: 0.94
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 299
    col: 0
    score: 0.94
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 320
    col: 0
    score: 0.94
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 277
    col: 0
    score: 0.94
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 478
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 561
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 625
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 361
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 564
    col: 0
    score: 0.97
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 619
    col: 0
    score: 0.97
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 527
    col: 0
    score: 0.97
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 394
    col: 0
    score: 0.97
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 628
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 869
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 243
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 595
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 372
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 166
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 845
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 992
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 555
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 994
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 615
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 932
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 864
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 172
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 711
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 373
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 237
    col: 0
    score: 1
  - uuid: ac9d3ac5-9a6a-4180-a67f-1ab7e229d981
    line: 240
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 839
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 867
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 933
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 891
    col: 0
    score: 0.95
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 528
    col: 0
    score: 0.93
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 961
    col: 0
    score: 0.93
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 959
    col: 0
    score: 0.93
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2012
    col: 0
    score: 0.96
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 707
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 861
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 852
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 157
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 725
    col: 0
    score: 0.95
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 991
    col: 0
    score: 0.95
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 744
    col: 0
    score: 0.93
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 771
    col: 0
    score: 0.93
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 647
    col: 0
    score: 0.93
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1693
    col: 0
    score: 0.93
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 235
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 616
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 857
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 838
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 996
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 600
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 377
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 164
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 843
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 934
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 871
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 416
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 829
    col: 0
    score: 0.98
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 850
    col: 0
    score: 0.97
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 1007
    col: 0
    score: 0.97
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 993
    col: 0
    score: 0.97
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 705
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 939
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 865
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 375
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 850
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 1119
    col: 0
    score: 0.94
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 818
    col: 0
    score: 0.94
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 1538
    col: 0
    score: 0.94
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 622
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 709
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 870
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 849
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 928
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 171
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 700
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 847
    col: 0
    score: 0.96
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1001
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 936
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 712
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 699
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 605
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 381
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1003
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 162
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 931
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 1483
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 602
    col: 0
    score: 0.97
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 175
    col: 0
    score: 0.97
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 255
    col: 0
    score: 0.97
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 275
    col: 0
    score: 0.97
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 603
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 167
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 714
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 246
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3183
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3118
    col: 0
    score: 0.97
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 1988
    col: 0
    score: 0.97
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 72
    col: 0
    score: 0.96
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 710
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 158
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 858
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 515
    col: 0
    score: 0.91
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1231
    col: 0
    score: 0.91
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 572
    col: 0
    score: 0.91
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 650
    col: 0
    score: 0.91
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 776
    col: 0
    score: 0.91
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1018
    col: 0
    score: 0.91
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1568
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 748
    col: 0
    score: 0.97
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 486
    col: 0
    score: 0.97
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 431
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 925
    col: 0
    score: 0.98
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 328
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1387
    col: 0
    score: 0.98
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 386
    col: 0
    score: 0.98
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 721
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 557
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1070
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 949
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 327
    col: 0
    score: 1
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 358
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1223
    col: 0
    score: 0.98
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 267
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 421
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 809
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1570
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 820
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 499
    col: 0
    score: 0.98
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 316
    col: 0
    score: 0.98
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 528
    col: 0
    score: 0.97
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1189
    col: 0
    score: 0.97
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 949
    col: 0
    score: 0.97
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1573
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 746
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 359
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 350
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 511
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 394
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 360
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 855
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 731
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1574
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 746
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 434
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 754
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1767
    col: 0
    score: 0.97
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 930
    col: 0
    score: 0.97
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 844
    col: 0
    score: 0.97
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1575
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 922
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 574
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 93
    col: 0
    score: 0.97
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 154
    col: 0
    score: 0.97
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 510
    col: 0
    score: 0.97
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 1490
    col: 0
    score: 0.87
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 562
    col: 0
    score: 0.87
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1567
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 488
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 383
    col: 0
    score: 0.97
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 810
    col: 0
    score: 0.97
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 514
    col: 0
    score: 0.97
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 302
    col: 0
    score: 0.97
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 874
    col: 0
    score: 0.97
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1518
    col: 0
    score: 0.97
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 350
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 459
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 691
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 501
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 838
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 651
    col: 0
    score: 0.96
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 342
    col: 0
    score: 0.96
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1605
    col: 0
    score: 0.96
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 749
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 490
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1566
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 385
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 339
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1701
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 350
    col: 0
    score: 0.96
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 410
    col: 0
    score: 0.96
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1661
    col: 0
    score: 0.96
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 237
    col: 0
    score: 0.96
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 229
    col: 0
    score: 0.96
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 424
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 944
    col: 0
    score: 0.98
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 826
    col: 0
    score: 0.98
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1027
    col: 0
    score: 0.98
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 241
    col: 0
    score: 0.98
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 156
    col: 0
    score: 0.98
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 155
    col: 0
    score: 0.98
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 228
    col: 0
    score: 0.98
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 493
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 427
    col: 0
    score: 0.97
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1033
    col: 0
    score: 0.97
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 572
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
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 885
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 856
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 732
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 573
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 899
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 210
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 430
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 395
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 351
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 213
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 858
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1078
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 616
    col: 0
    score: 0.97
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 368
    col: 0
    score: 0.97
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 475
    col: 0
    score: 0.97
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 406
    col: 0
    score: 0.97
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 360
    col: 0
    score: 0.97
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 219
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1080
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 564
    col: 0
    score: 0.98
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 521
    col: 0
    score: 0.96
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1475
    col: 0
    score: 0.96
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 446
    col: 0
    score: 0.96
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 543
    col: 0
    score: 0.96
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 760
    col: 0
    score: 0.96
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1076
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 991
    col: 0
    score: 1
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 365
    col: 0
    score: 0.97
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 387
    col: 0
    score: 0.97
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 960
    col: 0
    score: 0.97
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 1205
    col: 0
    score: 0.97
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 958
    col: 0
    score: 0.97
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 852
    col: 0
    score: 0.97
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 968
    col: 0
    score: 0.97
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 398
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 537
    col: 0
    score: 0.98
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 120
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 960
    col: 0
    score: 0.99
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 821
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 923
    col: 0
    score: 0.99
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 439
    col: 0
    score: 0.99
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 521
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 388
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 552
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 596
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 408
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 390
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 102
    col: 0
    score: 0.96
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 368
    col: 0
    score: 0.95
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 498
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 507
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 563
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 205
    col: 0
    score: 0.97
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1286
    col: 0
    score: 0.97
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 187
    col: 0
    score: 0.97
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 504
    col: 0
    score: 0.97
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 485
    col: 0
    score: 0.97
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 549
    col: 0
    score: 0.97
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 156
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 213
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 473
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 348
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 2232
    col: 0
    score: 0.98
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2186
    col: 0
    score: 0.97
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 2959
    col: 0
    score: 0.97
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 2115
    col: 0
    score: 0.97
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 988
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 352
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 647
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 350
    col: 0
    score: 1
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 418
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 926
    col: 0
    score: 0.98
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 919
    col: 0
    score: 0.98
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 772
    col: 0
    score: 0.97
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 713
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 775
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 641
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 174
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 540
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 287
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 726
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 456
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 422
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 370
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 806
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 730
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2498
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 6299
    col: 0
    score: 0.99
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 3255
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 7366
    col: 0
    score: 0.99
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 2533
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 7318
    col: 0
    score: 0.98
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 324
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1164
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 452
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 747
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1526
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 243
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 242
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 407
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 325
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1165
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 453
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 748
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 805
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1527
    col: 0
    score: 0.99
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 244
    col: 0
    score: 0.99
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 243
    col: 0
    score: 0.99
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 326
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1166
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 454
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 749
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 806
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 245
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 244
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 409
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 587
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 327
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1167
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 750
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 455
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 807
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1528
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 245
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 410
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1168
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 751
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 456
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 808
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1529
    col: 0
    score: 0.99
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 246
    col: 0
    score: 0.99
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 411
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 589
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1169
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 752
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 809
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1530
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 247
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 246
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 590
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 894
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 754
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 510
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 440
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 637
    col: 0
    score: 0.98
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 522
    col: 0
    score: 0.98
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 384
    col: 0
    score: 0.98
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 325
    col: 0
    score: 0.98
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 890
    col: 0
    score: 0.98
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 715
    col: 0
    score: 0.98
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 355
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 106
    col: 0
    score: 1
  - uuid: 930054b3-ba95-4acf-bb92-0e3ead25ed0b
    line: 119
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 328
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 349
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 341
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 199
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 988
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 531
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 377
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 817
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 173
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 634
    col: 0
    score: 0.99
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 322
    col: 0
    score: 0.99
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 213
    col: 0
    score: 0.99
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 627
    col: 0
    score: 0.98
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 801
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 857
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 500
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
    score: 0.96
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 604
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 671
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 158
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
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1123
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 401
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 917
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1386
    col: 0
    score: 0.99
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 436
    col: 0
    score: 0.99
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 427
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 638
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 344
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 1897
    col: 0
    score: 0.97
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2089
    col: 0
    score: 0.97
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 1905
    col: 0
    score: 0.97
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 1919
    col: 0
    score: 0.97
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3403
    col: 0
    score: 0.97
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1752
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 437
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 604
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 452
    col: 0
    score: 0.97
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 533
    col: 0
    score: 0.97
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 412
    col: 0
    score: 0.97
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 573
    col: 0
    score: 0.97
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 363
    col: 0
    score: 0.97
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 290
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 629
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 647
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 299
    col: 0
    score: 0.99
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 356
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1553
    col: 0
    score: 0.99
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 411
    col: 0
    score: 0.99
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 430
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 451
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 639
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 348
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 717
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 628
    col: 0
    score: 1
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 98
    col: 0
    score: 0.99
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 133
    col: 0
    score: 0.99
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 144
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 346
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
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 190
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 294
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 486
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 418
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 214
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 482
    col: 0
    score: 0.98
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 493
    col: 0
    score: 0.97
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 533
    col: 0
    score: 0.97
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 398
    col: 0
    score: 0.96
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 805
    col: 0
    score: 0.96
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 416
    col: 0
    score: 0.96
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 624
    col: 0
    score: 0.96
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
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 660
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 923
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 715
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 949
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 905
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 280
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 908
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2076
    col: 0
    score: 0.97
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 362
    col: 0
    score: 0.97
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 454
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 404
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 277
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 593
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 729
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1104
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 611
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 999
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 388
    col: 0
    score: 0.99
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 1004
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 646
    col: 0
    score: 0.99
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 773
    col: 0
    score: 0.99
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 987
    col: 0
    score: 0.99
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 419
    col: 0
    score: 0.99
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 330
    col: 0
    score: 0.99
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 306
    col: 0
    score: 0.99
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 121
    col: 0
    score: 0.98
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 324
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 567
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 362
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 359
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 661
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 405
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 697
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 721
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 902
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1343
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 283
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 578
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 928
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 484
    col: 0
    score: 0.97
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 536
    col: 0
    score: 0.97
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1283
    col: 0
    score: 0.97
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 170
    col: 0
    score: 0.97
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 810
    col: 0
    score: 0.97
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 976
    col: 0
    score: 0.97
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 266
    col: 0
    score: 0.97
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 872
    col: 0
    score: 0.98
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 665
    col: 0
    score: 0.98
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 631
    col: 0
    score: 0.98
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 769
    col: 0
    score: 0.98
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 817
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 495
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 982
    col: 0
    score: 0.98
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 653
    col: 0
    score: 0.98
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1352
    col: 0
    score: 0.99
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1103
    col: 0
    score: 0.99
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 671
    col: 0
    score: 0.99
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 511
    col: 0
    score: 0.99
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 825
    col: 0
    score: 0.99
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1229
    col: 0
    score: 0.99
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 637
    col: 0
    score: 0.99
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1285
    col: 0
    score: 0.99
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 716
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 367
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 581
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 5923
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 4559
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 4656
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 5953
    col: 0
    score: 0.98
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 4589
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 4685
    col: 0
    score: 0.98
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 274
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 741
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 387
    col: 0
    score: 0.94
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 857
    col: 0
    score: 0.94
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 721
    col: 0
    score: 0.94
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1437
    col: 0
    score: 0.94
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 804
    col: 0
    score: 0.94
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 712
    col: 0
    score: 0.94
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 389
    col: 0
    score: 1
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 362
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 345
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 954
    col: 0
    score: 0.97
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 949
    col: 0
    score: 0.96
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 432
    col: 0
    score: 0.96
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 3127
    col: 0
    score: 0.96
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 1887
    col: 0
    score: 0.96
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1312
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 231
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1061
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 461
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 139
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 354
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1044
    col: 0
    score: 0.98
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 913
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1313
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 232
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1062
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 462
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 140
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 355
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1045
    col: 0
    score: 0.98
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 914
    col: 0
    score: 0.98
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 447
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 422
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 656
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 393
    col: 0
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1654
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 229
    col: 0
    score: 0.99
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 291
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 732
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 442
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 758
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 357
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 748
    col: 0
    score: 0.96
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 412
    col: 0
    score: 0.96
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 958
    col: 0
    score: 0.96
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 472
    col: 0
    score: 0.96
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 847
    col: 0
    score: 0.95
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 451
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 435
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1324
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 465
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 423
    col: 0
    score: 0.95
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 289
    col: 0
    score: 0.95
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 939
    col: 0
    score: 0.95
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 483
    col: 0
    score: 0.95
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 394
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2813
    col: 0
    score: 0.97
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 2119
    col: 0
    score: 0.97
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 3159
    col: 0
    score: 0.97
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 2565
    col: 0
    score: 0.97
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 2140
    col: 0
    score: 0.96
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 2172
    col: 0
    score: 0.95
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3743
    col: 0
    score: 0.95
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 506
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 455
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 324
    col: 0
    score: 1
  - uuid: 86a691ec-ca1f-4350-824c-0ded1f8ebe70
    line: 143
    col: 0
    score: 1
  - uuid: b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
    line: 150
    col: 0
    score: 1
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
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 398
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
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 675
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
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 648
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
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 663
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 865
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
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1311
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
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 1283
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
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 613
    col: 0
    score: 0.94
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1357
    col: 0
    score: 0.94
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1108
    col: 0
    score: 0.94
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 676
    col: 0
    score: 0.94
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 516
    col: 0
    score: 0.94
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 830
    col: 0
    score: 0.94
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1234
    col: 0
    score: 0.94
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 642
    col: 0
    score: 0.94
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1290
    col: 0
    score: 0.94
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 417
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 476
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 454
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 493
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 534
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 437
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 588
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 1286
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 418
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 477
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 455
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 494
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 535
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 438
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 399
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1452
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 419
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 478
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 456
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 495
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 470
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 439
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 400
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 442
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 420
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 479
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 457
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 496
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 146
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 536
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 440
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 401
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 480
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 458
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 497
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 537
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 441
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 402
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 422
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 481
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 459
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 498
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 538
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 442
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 403
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 417
    col: 0
    score: 0.98
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 423
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 482
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 460
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 499
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 539
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 443
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 404
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 580
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 484
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 462
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 501
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 541
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 445
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 406
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 745
    col: 0
    score: 0.96
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 480
    col: 0
    score: 0.95
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 517
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 602
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1253
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 902
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1154
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 404
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 817
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 992
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 1125
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 836
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 319
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 372
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 603
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1254
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1155
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 993
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 910
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 802
    col: 0
    score: 0.99
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 733
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 837
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 320
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 373
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1300
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 604
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1255
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 904
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 734
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 838
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 321
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 374
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1301
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 605
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1256
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 905
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 735
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 839
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 322
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 375
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1302
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1257
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 906
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1158
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1303
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 606
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 907
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1159
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 409
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 822
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 997
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 1130
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 914
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 736
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 323
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 376
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1304
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 607
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1258
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 908
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1160
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 999
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 930
    col: 0
    score: 0.97
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 841
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 325
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 378
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1306
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 609
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1260
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 910
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1162
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 739
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 842
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 326
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 379
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1307
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 610
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1261
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1163
    col: 0
    score: 1
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
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 854
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
  - uuid: ac9d3ac5-9a6a-4180-a67f-1ab7e229d981
    line: 480
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
    line: 482
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
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 1
    col: 0
    score: 1
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 3
    col: 0
    score: 1
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 7
    col: 0
    score: 1
---
love that. treat repos like dataflows and CLIs like transforms. here are high-leverage pipelines we can bolt on next (all idempotent, marker-safe, cached under `.cache/<pkg>`): ^ref-8b8e6103-1-0

## menu of new pipelines

1. **apidiff** — detect API drift & breaking changes ^ref-8b8e6103-5-0

   * scan exported symbols → compare across git refs (e.g., `main` vs `HEAD`) → classify breaks → write `docs/packages/<pkg>/api-diff.md` + tasks. ^ref-8b8e6103-7-0
   * outputs: semver bump suggestion per package, “fix or docs?” tasks. ^ref-8b8e6103-8-0

2. **semver-guard** — compute required semver and open a task/PR stub ^ref-8b8e6103-10-0

   * inputs: apidiff results, changelog fragments → decide `major|minor|patch` → write `docs/agile/tasks/semver-<pkg>.md`. ^ref-8b8e6103-12-0

3. **typegraph** — TS type dependency graph ^ref-8b8e6103-14-0

   * crawl types/interfaces → emit Mermaid graphs per module + cross-package type edges → `docs/packages/<pkg>/types.md`. ^ref-8b8e6103-16-0

4. **cookbook** — auto example miner ^ref-8b8e6103-18-0

   * harvest examples from tests/docs/snippets → normalize & run small runners → write `docs/cookbook/<topic>.md` with verified outputs. ^ref-8b8e6103-20-0

5. **test-gap** — semantic test coverage ^ref-8b8e6103-22-0

   * map functions ↔ tests (by name, imports, embeddings) → flag high-risk/low-coverage → create tasks per cluster. ^ref-8b8e6103-24-0

6. **codemods** — transform kits for consolidation ^ref-8b8e6103-26-0

   * from `simtasks` clusters → synthesize jscodeshift/ts-morph codemods → write under `codemods/<cluster>/` with dry-run report + task. ^ref-8b8e6103-28-0

7. **i18npack** — string extraction & dedupe ^ref-8b8e6103-30-0

   * extract literals → cluster near-dupes → propose keys → write `i18n/<locale>.json` and tasks to wire calls. ^ref-8b8e6103-32-0

8. **licscan** — license & header compliance

   * detect license of each dependency (from lockfile) + check file headers → write `docs/compliance/license-report.md` + fixup tasks. ^ref-8b8e6103-36-0

9. **perf-bench** — microbench common idioms ^ref-8b8e6103-38-0

   * auto-gen small benchmarks for hot functions → record runs → write `docs/bench/<pkg>.md` with tables & trend deltas. ^ref-8b8e6103-40-0

10. **glossary** — repo knowledge graph ^ref-8b8e6103-42-0

* extract terms from docs/code → link occurrences → `docs/glossary/*.md` and back-links in footers. ^ref-8b8e6103-44-0

11. **adr-bot** — decision trail

* generate ADR stubs from merged tasks/PRs → place in `docs/adr/NNN-*.md`, cross-linked to affected packages. ^ref-8b8e6103-48-0

12. **riskmap** — dependency risk heatmap ^ref-8b8e6103-50-0

* combine in-graph centrality + age of last change + test-gap → write `docs/ops/riskmap.md` and “stabilize X” tasks.

---

## orchestration sketch

```mermaid
flowchart LR
  A[scan symbols/types] --> B[embed/compare]
  B --> C[cluster/score]
  C --> D[plans (Ollama)]
  D --> E[docs pages]
  D --> F[tasks]
  B --> G[graphs (api/type/pkg)]
  G --> E
```
^ref-8b8e6103-58-0 ^ref-8b8e6103-68-0

---

## consistent shape (each package)

* **01-scan** → JSON facts ^ref-8b8e6103-74-0
* **02-embed** (optional) ^ref-8b8e6103-75-0
* **03-analyze** (diff/cluster/score) ^ref-8b8e6103-76-0
* **04-plan** (LLM JSON, zod-validated, cached) ^ref-8b8e6103-77-0
* **05-write** (docs + tasks, marker-bounded) ^ref-8b8e6103-78-0
* all steps support `--dry-run`, read config from `*.config.json`, and keep outputs deterministic.

---

## quick starters to build next
 ^ref-8b8e6103-84-0
* **apidiff** (fast win): reuse `@promethean/symdocs` scan output; add `03-diff.ts` (compare against saved baseline in `.cache/apidiff/<pkg>.json`) and `05-write.ts` for a per-package report + semver recommendation. ^ref-8b8e6103-85-0
* **codemods** (pairs nicely with `simtasks`): add `simtasks:06-codemods` to synthesize ts-morph transforms from a plan and emit runnable codemods with a dry-run CLI.
 ^ref-8b8e6103-87-0
pick 2 and I’ll spin the files. if you want, we can also add a tiny **runner** (`pipelines.json` → runs steps with change detection) so new steps slot in without touching existing scripts.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Ice Box Reorganization](ice-box-reorganization.md)
- [Creative Moments](creative-moments.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [The Jar of Echoes](the-jar-of-echoes.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [field-interaction-equations](field-interaction-equations.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [Optimizing Command Limitations in System Design](optimizing-command-limitations-in-system-design.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [Synchronicity Waves and Web](synchronicity-waves-and-web.md)
- [unique-templates](templates/unique-templates.md)
- [Tracing the Signal](tracing-the-signal.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [Unique Concepts](unique-concepts.md)
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [Redirecting Standard Error](redirecting-standard-error.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [Smoke Resonance Visualizations](smoke-resonance-visualizations.md)
- [graph-ds](graph-ds.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [promethean-requirements](promethean-requirements.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [OpenAPI Validation Report](openapi-validation-report.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [Obsidian Task Generation](obsidian-task-generation.md)
- [Promethean State Format](promethean-state-format.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [NPU Voice Code and Sensory Integration](npu-voice-code-and-sensory-integration.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [DSL](chunks/dsl.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [Reawakening Duck](reawakening-duck.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [Promethean Chat Activity Report](promethean-chat-activity-report.md)
- [windows-tiling-with-autohotkey](windows-tiling-with-autohotkey.md)
- [Promethean Dev Workflow Update](promethean-dev-workflow-update.md)
- [Tooling](chunks/tooling.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [Docops Feature Updates](docops-feature-updates.md)
- [Promethean Documentation Update](promethean-documentation-update.txt)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [JavaScript](chunks/javascript.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Pipeline Enhancements](pipeline-enhancements.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [Diagrams](chunks/diagrams.md)
- [Shared](chunks/shared.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Docops Feature Updates](docops-feature-updates-3.md)
- [ChatGPT Custom Prompts](chatgpt-custom-prompts.md)
- [Operations](chunks/operations.md)
- [Window Management](chunks/window-management.md)
- [Promethean Data Sync Protocol](promethean-data-sync-protocol.md)
- [Promethean Documentation Update](promethean-documentation-update.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Services](chunks/services.md)
- [Mathematical Samplers](mathematical-samplers.md)
- [Promethean Documentation Overview](promethean-documentation-overview.md)
- [Mathematics Sampler](mathematics-sampler.md)
- [Mindful Prioritization](mindful-prioritization.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [balanced-bst](balanced-bst.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [MindfulRobotIntegration](mindfulrobotintegration.md)
- [archetype-ecs](archetype-ecs.md)
- [Promethean Notes](promethean-notes.md)
## Sources
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
- [ChatGPT Custom Prompts — L18](chatgpt-custom-prompts.md#^ref-930054b3-18-0) (line 18, col 0, score 1)
- [unique-templates — L12](templates/unique-templates.md#^ref-c26f0044-12-0) (line 12, col 0, score 1)
- [The Jar of Echoes — L139](the-jar-of-echoes.md#^ref-18138627-139-0) (line 139, col 0, score 1)
- [Tracing the Signal — L104](tracing-the-signal.md#^ref-c3cd4f65-104-0) (line 104, col 0, score 1)
- [ts-to-lisp-transpiler — L45](ts-to-lisp-transpiler.md#^ref-ba11486b-45-0) (line 45, col 0, score 1)
- [typed-struct-compiler — L411](typed-struct-compiler.md#^ref-78eeedf7-411-0) (line 411, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L566](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-566-0) (line 566, col 0, score 1)
- [Unique Concepts — L10](unique-concepts.md#^ref-ed6f3fc9-10-0) (line 10, col 0, score 1)
- [Unique Info Dump Index — L144](unique-info-dump-index.md#^ref-30ec3ba6-144-0) (line 144, col 0, score 1)
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
- [Chroma Toolkit Consolidation Plan — L295](chroma-toolkit-consolidation-plan.md#^ref-5020e892-295-0) (line 295, col 0, score 1)
- [JavaScript — L127](chunks/javascript.md#^ref-c1618c66-127-0) (line 127, col 0, score 1)
- [OpenAPI Validation Report — L66](openapi-validation-report.md#^ref-5c152b08-66-0) (line 66, col 0, score 1)
- [plan-update-confirmation — L1076](plan-update-confirmation.md#^ref-b22d79c6-1076-0) (line 1076, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L169](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-169-0) (line 169, col 0, score 1)
- [Promethean Chat Activity Report — L58](promethean-chat-activity-report.md#^ref-18344cf9-58-0) (line 58, col 0, score 1)
- [Promethean Data Sync Protocol — L37](promethean-data-sync-protocol.md#^ref-9fab9e76-37-0) (line 37, col 0, score 1)
- [Promethean Dev Workflow Update — L145](promethean-dev-workflow-update.md#^ref-03a5578f-145-0) (line 145, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L199](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-199-0) (line 199, col 0, score 1)
- [Promethean Documentation Update — L38](promethean-documentation-update.md#^ref-c0392040-38-0) (line 38, col 0, score 1)
- [Promethean Documentation Update — L37](promethean-documentation-update.txt#^ref-0b872af2-37-0) (line 37, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L93](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-93-0) (line 93, col 0, score 1)
- [Window Management — L81](chunks/window-management.md#^ref-9e8ae388-81-0) (line 81, col 0, score 1)
- [field-interaction-equations — L228](field-interaction-equations.md#^ref-b09141b7-228-0) (line 228, col 0, score 1)
- [field-node-diagram-outline — L183](field-node-diagram-outline.md#^ref-1f32c94a-183-0) (line 183, col 0, score 1)
- [field-node-diagram-set — L213](field-node-diagram-set.md#^ref-22b989d5-213-0) (line 213, col 0, score 1)
- [field-node-diagram-visualizations — L160](field-node-diagram-visualizations.md#^ref-e9b27b06-160-0) (line 160, col 0, score 1)
- [Fnord Tracer Protocol — L371](fnord-tracer-protocol.md#^ref-fc21f824-371-0) (line 371, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L385](functional-embedding-pipeline-refactor.md#^ref-a4a25141-385-0) (line 385, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L206](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-206-0) (line 206, col 0, score 1)
- [graph-ds — L440](graph-ds.md#^ref-6620e2f2-440-0) (line 440, col 0, score 1)
- [heartbeat-fragment-demo — L189](heartbeat-fragment-demo.md#^ref-dd00677a-189-0) (line 189, col 0, score 1)
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
- [Obsidian ChatGPT Plugin Integration Guide — L75](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-75-0) (line 75, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L74](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-74-0) (line 74, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L145](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-145-0) (line 145, col 0, score 1)
- [Obsidian Task Generation — L47](obsidian-task-generation.md#^ref-9b694a91-47-0) (line 47, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L146](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-146-0) (line 146, col 0, score 1)
- [OpenAPI Validation Report — L63](openapi-validation-report.md#^ref-5c152b08-63-0) (line 63, col 0, score 1)
- [Optimizing Command Limitations in System Design — L72](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-72-0) (line 72, col 0, score 1)
- [Promethean Notes — L36](promethean-notes.md#^ref-1c4046b5-36-0) (line 36, col 0, score 1)
- [promethean-requirements — L49](promethean-requirements.md#^ref-95205cd3-49-0) (line 49, col 0, score 1)
- [Promethean State Format — L126](promethean-state-format.md#^ref-23df6ddb-126-0) (line 126, col 0, score 1)
- [Promethean Workflow Optimization — L51](promethean-workflow-optimization.md#^ref-d614d983-51-0) (line 51, col 0, score 1)
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
- [field-node-diagram-visualizations — L149](field-node-diagram-visualizations.md#^ref-e9b27b06-149-0) (line 149, col 0, score 1)
- [Fnord Tracer Protocol — L288](fnord-tracer-protocol.md#^ref-fc21f824-288-0) (line 288, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L415](functional-embedding-pipeline-refactor.md#^ref-a4a25141-415-0) (line 415, col 0, score 1)
- [graph-ds — L417](graph-ds.md#^ref-6620e2f2-417-0) (line 417, col 0, score 1)
- [heartbeat-fragment-demo — L177](heartbeat-fragment-demo.md#^ref-dd00677a-177-0) (line 177, col 0, score 1)
- [homeostasis-decay-formulas — L214](homeostasis-decay-formulas.md#^ref-37b5d236-214-0) (line 214, col 0, score 1)
- [i3-bluetooth-setup — L151](i3-bluetooth-setup.md#^ref-5e408692-151-0) (line 151, col 0, score 1)
- [Ice Box Reorganization — L121](ice-box-reorganization.md#^ref-291c7d91-121-0) (line 121, col 0, score 1)
- [komorebi-group-window-hack — L238](komorebi-group-window-hack.md#^ref-dd89372d-238-0) (line 238, col 0, score 1)
- [Reawakening Duck — L164](reawakening-duck.md#^ref-59b5670f-164-0) (line 164, col 0, score 1)
- [Redirecting Standard Error — L39](redirecting-standard-error.md#^ref-b3555ede-39-0) (line 39, col 0, score 1)
- [schema-evolution-workflow — L625](schema-evolution-workflow.md#^ref-d8059b6a-625-0) (line 625, col 0, score 1)
- [Self-Agency in AI Interaction — L60](self-agency-in-ai-interaction.md#^ref-49a9a860-60-0) (line 60, col 0, score 1)
- [sibilant-macro-targets — L253](sibilant-macro-targets.md#^ref-c5c9a5c6-253-0) (line 253, col 0, score 1)
- [Smoke Resonance Visualizations — L128](smoke-resonance-visualizations.md#^ref-ac9d3ac5-128-0) (line 128, col 0, score 1)
- [Stateful Partitions and Rebalancing — L644](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-644-0) (line 644, col 0, score 1)
- [Synchronicity Waves and Web — L125](synchronicity-waves-and-web.md#^ref-91295f3a-125-0) (line 125, col 0, score 1)
- [JavaScript — L76](chunks/javascript.md#^ref-c1618c66-76-0) (line 76, col 0, score 1)
- [Math Fundamentals — L69](chunks/math-fundamentals.md#^ref-c6e87433-69-0) (line 69, col 0, score 1)
- [Services — L62](chunks/services.md#^ref-75ea4a6a-62-0) (line 62, col 0, score 1)
- [Tooling — L54](chunks/tooling.md#^ref-6cb4943e-54-0) (line 54, col 0, score 1)
- [Window Management — L56](chunks/window-management.md#^ref-9e8ae388-56-0) (line 56, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L87](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-87-0) (line 87, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L82](ducks-self-referential-perceptual-loop.md#^ref-71726f04-82-0) (line 82, col 0, score 1)
- [Dynamic Context Model for Web Components — L467](dynamic-context-model-for-web-components.md#^ref-f7702bf8-467-0) (line 467, col 0, score 1)
- [field-dynamics-math-blocks — L205](field-dynamics-math-blocks.md#^ref-7cfc230d-205-0) (line 205, col 0, score 1)
- [Board Walk – 2025-08-11 — L133](board-walk-2025-08-11.md#^ref-7aa1eb92-133-0) (line 133, col 0, score 1)
- [Pure TypeScript Search Microservice — L598](pure-typescript-search-microservice.md#^ref-d17d3a96-598-0) (line 598, col 0, score 1)
- [Stateful Partitions and Rebalancing — L605](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-605-0) (line 605, col 0, score 1)
- [typed-struct-compiler — L393](typed-struct-compiler.md#^ref-78eeedf7-393-0) (line 393, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L567](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-567-0) (line 567, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L92](ducks-self-referential-perceptual-loop.md#^ref-71726f04-92-0) (line 92, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L75](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-75-0) (line 75, col 0, score 1)
- [Obsidian Task Generation — L72](obsidian-task-generation.md#^ref-9b694a91-72-0) (line 72, col 0, score 1)
- [OpenAPI Validation Report — L89](openapi-validation-report.md#^ref-5c152b08-89-0) (line 89, col 0, score 1)
- [Optimizing Command Limitations in System Design — L125](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-125-0) (line 125, col 0, score 1)
- [plan-update-confirmation — L1054](plan-update-confirmation.md#^ref-b22d79c6-1054-0) (line 1054, col 0, score 1)
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
- [Model Selection for Lightweight Conversational Tasks — L209](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-209-0) (line 209, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L137](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-137-0) (line 137, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L138](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-138-0) (line 138, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L207](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-207-0) (line 207, col 0, score 1)
- [Pipeline Enhancements — L59](pipeline-enhancements.md#^ref-e2135d9f-59-0) (line 59, col 0, score 1)
- [plan-update-confirmation — L1100](plan-update-confirmation.md#^ref-b22d79c6-1100-0) (line 1100, col 0, score 1)
- [polyglot-repl-interface-layer — L230](polyglot-repl-interface-layer.md#^ref-9c79206d-230-0) (line 230, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L125](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-125-0) (line 125, col 0, score 1)
- [Promethean Chat Activity Report — L147](promethean-chat-activity-report.md#^ref-18344cf9-147-0) (line 147, col 0, score 1)
- [Promethean Chat Activity Report — L151](promethean-chat-activity-report.md#^ref-18344cf9-151-0) (line 151, col 0, score 1)
- [Promethean State Format — L150](promethean-state-format.md#^ref-23df6ddb-150-0) (line 150, col 0, score 1)
- [Prompt_Folder_Bootstrap — L258](prompt-folder-bootstrap.md#^ref-bd4f0976-258-0) (line 258, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L164](protocol-0-the-contradiction-engine.md#^ref-9a93a756-164-0) (line 164, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L351](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-351-0) (line 351, col 0, score 1)
- [ripple-propagation-demo — L201](ripple-propagation-demo.md#^ref-8430617b-201-0) (line 201, col 0, score 1)
- [schema-evolution-workflow — L609](schema-evolution-workflow.md#^ref-d8059b6a-609-0) (line 609, col 0, score 1)
- [Self-Agency in AI Interaction — L133](self-agency-in-ai-interaction.md#^ref-49a9a860-133-0) (line 133, col 0, score 1)
- [sibilant-macro-targets — L276](sibilant-macro-targets.md#^ref-c5c9a5c6-276-0) (line 276, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L541](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-541-0) (line 541, col 0, score 1)
- [zero-copy-snapshots-and-workers — L375](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-375-0) (line 375, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L78](ducks-self-referential-perceptual-loop.md#^ref-71726f04-78-0) (line 78, col 0, score 1)
- [Factorio AI with External Agents — L176](factorio-ai-with-external-agents.md#^ref-a4d90289-176-0) (line 176, col 0, score 1)
- [field-node-diagram-outline — L154](field-node-diagram-outline.md#^ref-1f32c94a-154-0) (line 154, col 0, score 1)
- [field-node-diagram-set — L175](field-node-diagram-set.md#^ref-22b989d5-175-0) (line 175, col 0, score 1)
- [field-node-diagram-visualizations — L123](field-node-diagram-visualizations.md#^ref-e9b27b06-123-0) (line 123, col 0, score 1)
- [Fnord Tracer Protocol — L274](fnord-tracer-protocol.md#^ref-fc21f824-274-0) (line 274, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L327](functional-embedding-pipeline-refactor.md#^ref-a4a25141-327-0) (line 327, col 0, score 1)
- [graph-ds — L412](graph-ds.md#^ref-6620e2f2-412-0) (line 412, col 0, score 1)
- [heartbeat-fragment-demo — L159](heartbeat-fragment-demo.md#^ref-dd00677a-159-0) (line 159, col 0, score 1)
- [Ice Box Reorganization — L95](ice-box-reorganization.md#^ref-291c7d91-95-0) (line 95, col 0, score 1)
- [eidolon-field-math-foundations — L140](eidolon-field-math-foundations.md#^ref-008f2ac0-140-0) (line 140, col 0, score 1)
- [Admin Dashboard for User Management — L76](admin-dashboard-for-user-management.md#^ref-2901a3e9-76-0) (line 76, col 0, score 1)
- [Operations — L33](chunks/operations.md#^ref-f1add613-33-0) (line 33, col 0, score 1)
- [Duck's Attractor States — L98](ducks-attractor-states.md#^ref-13951643-98-0) (line 98, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L179](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-179-0) (line 179, col 0, score 1)
- [Mathematical Samplers — L116](mathematical-samplers.md#^ref-86a691ec-116-0) (line 116, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L136](model-upgrade-calm-down-guide.md#^ref-db74343f-136-0) (line 136, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L95](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-95-0) (line 95, col 0, score 1)
- [Optimizing Command Limitations in System Design — L133](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-133-0) (line 133, col 0, score 1)
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
- [Model Upgrade Calm-Down Guide — L71](model-upgrade-calm-down-guide.md#^ref-db74343f-71-0) (line 71, col 0, score 1)
- [Duck's Attractor States — L105](ducks-attractor-states.md#^ref-13951643-105-0) (line 105, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L71](ducks-self-referential-perceptual-loop.md#^ref-71726f04-71-0) (line 71, col 0, score 1)
- [Factorio AI with External Agents — L183](factorio-ai-with-external-agents.md#^ref-a4d90289-183-0) (line 183, col 0, score 1)
- [Fnord Tracer Protocol — L279](fnord-tracer-protocol.md#^ref-fc21f824-279-0) (line 279, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L335](functional-embedding-pipeline-refactor.md#^ref-a4a25141-335-0) (line 335, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L159](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-159-0) (line 159, col 0, score 1)
- [graph-ds — L423](graph-ds.md#^ref-6620e2f2-423-0) (line 423, col 0, score 1)
- [i3-bluetooth-setup — L158](i3-bluetooth-setup.md#^ref-5e408692-158-0) (line 158, col 0, score 1)
- [Ice Box Reorganization — L103](ice-box-reorganization.md#^ref-291c7d91-103-0) (line 103, col 0, score 1)
- [komorebi-group-window-hack — L253](komorebi-group-window-hack.md#^ref-dd89372d-253-0) (line 253, col 0, score 1)
- [field-node-diagram-set — L226](field-node-diagram-set.md#^ref-22b989d5-226-0) (line 226, col 0, score 1)
- [field-node-diagram-visualizations — L174](field-node-diagram-visualizations.md#^ref-e9b27b06-174-0) (line 174, col 0, score 1)
- [Fnord Tracer Protocol — L326](fnord-tracer-protocol.md#^ref-fc21f824-326-0) (line 326, col 0, score 1)
- [graph-ds — L467](graph-ds.md#^ref-6620e2f2-467-0) (line 467, col 0, score 1)
- [heartbeat-fragment-demo — L204](heartbeat-fragment-demo.md#^ref-dd00677a-204-0) (line 204, col 0, score 1)
- [homeostasis-decay-formulas — L245](homeostasis-decay-formulas.md#^ref-37b5d236-245-0) (line 245, col 0, score 1)
- [i3-bluetooth-setup — L167](i3-bluetooth-setup.md#^ref-5e408692-167-0) (line 167, col 0, score 1)
- [komorebi-group-window-hack — L334](komorebi-group-window-hack.md#^ref-dd89372d-334-0) (line 334, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L140](model-upgrade-calm-down-guide.md#^ref-db74343f-140-0) (line 140, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L143](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-143-0) (line 143, col 0, score 1)
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
- [Tooling — L41](chunks/tooling.md#^ref-6cb4943e-41-0) (line 41, col 0, score 1)
- [Docops Feature Updates — L48](docops-feature-updates-3.md#^ref-cdbd21ee-48-0) (line 48, col 0, score 1)
- [Docops Feature Updates — L79](docops-feature-updates.md#^ref-2792d448-79-0) (line 79, col 0, score 1)
- [eidolon-node-lifecycle — L69](eidolon-node-lifecycle.md#^ref-938eca9c-69-0) (line 69, col 0, score 1)
- [field-node-diagram-outline — L158](field-node-diagram-outline.md#^ref-1f32c94a-158-0) (line 158, col 0, score 1)
- [field-node-diagram-set — L178](field-node-diagram-set.md#^ref-22b989d5-178-0) (line 178, col 0, score 1)
- [field-node-diagram-visualizations — L126](field-node-diagram-visualizations.md#^ref-e9b27b06-126-0) (line 126, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L410](functional-embedding-pipeline-refactor.md#^ref-a4a25141-410-0) (line 410, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L228](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-228-0) (line 228, col 0, score 1)
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
- [Admin Dashboard for User Management — L45](admin-dashboard-for-user-management.md#^ref-2901a3e9-45-0) (line 45, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L560](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-560-0) (line 560, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L187](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-187-0) (line 187, col 0, score 1)
- [JavaScript — L66](chunks/javascript.md#^ref-c1618c66-66-0) (line 66, col 0, score 1)
- [field-node-diagram-outline — L186](field-node-diagram-outline.md#^ref-1f32c94a-186-0) (line 186, col 0, score 1)
- [field-node-diagram-set — L212](field-node-diagram-set.md#^ref-22b989d5-212-0) (line 212, col 0, score 1)
- [field-node-diagram-visualizations — L162](field-node-diagram-visualizations.md#^ref-e9b27b06-162-0) (line 162, col 0, score 1)
- [heartbeat-fragment-demo — L191](heartbeat-fragment-demo.md#^ref-dd00677a-191-0) (line 191, col 0, score 1)
- [homeostasis-decay-formulas — L233](homeostasis-decay-formulas.md#^ref-37b5d236-233-0) (line 233, col 0, score 1)
- [Ice Box Reorganization — L129](ice-box-reorganization.md#^ref-291c7d91-129-0) (line 129, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L212](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-212-0) (line 212, col 0, score 1)
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
- [Creative Moments — L121](creative-moments.md#^ref-10d98225-121-0) (line 121, col 0, score 1)
- [Promethean Notes — L120](promethean-notes.md#^ref-1c4046b5-120-0) (line 120, col 0, score 1)
- [Prometheus Observability Stack — L575](prometheus-observability-stack.md#^ref-e90b5a16-575-0) (line 575, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L193](protocol-0-the-contradiction-engine.md#^ref-9a93a756-193-0) (line 193, col 0, score 1)
- [Pure TypeScript Search Microservice — L644](pure-typescript-search-microservice.md#^ref-d17d3a96-644-0) (line 644, col 0, score 1)
- [ripple-propagation-demo — L178](ripple-propagation-demo.md#^ref-8430617b-178-0) (line 178, col 0, score 1)
- [Self-Agency in AI Interaction — L150](self-agency-in-ai-interaction.md#^ref-49a9a860-150-0) (line 150, col 0, score 1)
- [sibilant-macro-targets — L266](sibilant-macro-targets.md#^ref-c5c9a5c6-266-0) (line 266, col 0, score 1)
- [Smoke Resonance Visualizations — L138](smoke-resonance-visualizations.md#^ref-ac9d3ac5-138-0) (line 138, col 0, score 1)
- [Promethean Documentation Overview — L22](promethean-documentation-overview.md#^ref-9413237f-22-0) (line 22, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L176](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-176-0) (line 176, col 0, score 1)
- [Promethean Documentation Update — L50](promethean-documentation-update.md#^ref-c0392040-50-0) (line 50, col 0, score 1)
- [Promethean Documentation Update — L49](promethean-documentation-update.txt#^ref-0b872af2-49-0) (line 49, col 0, score 1)
- [Promethean Notes — L52](promethean-notes.md#^ref-1c4046b5-52-0) (line 52, col 0, score 1)
- [promethean-requirements — L63](promethean-requirements.md#^ref-95205cd3-63-0) (line 63, col 0, score 1)
- [Promethean State Format — L136](promethean-state-format.md#^ref-23df6ddb-136-0) (line 136, col 0, score 1)
- [Promethean Workflow Optimization — L61](promethean-workflow-optimization.md#^ref-d614d983-61-0) (line 61, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L166](protocol-0-the-contradiction-engine.md#^ref-9a93a756-166-0) (line 166, col 0, score 1)
- [Pure TypeScript Search Microservice — L606](pure-typescript-search-microservice.md#^ref-d17d3a96-606-0) (line 606, col 0, score 1)
- [Stateful Partitions and Rebalancing — L619](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-619-0) (line 619, col 0, score 1)
- [Creative Moments — L90](creative-moments.md#^ref-10d98225-90-0) (line 90, col 0, score 1)
- [Promethean Documentation Update — L80](promethean-documentation-update.txt#^ref-0b872af2-80-0) (line 80, col 0, score 1)
- [Promethean Notes — L87](promethean-notes.md#^ref-1c4046b5-87-0) (line 87, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L582](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-582-0) (line 582, col 0, score 1)
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
- [heartbeat-fragment-demo — L142](heartbeat-fragment-demo.md#^ref-dd00677a-142-0) (line 142, col 0, score 1)
- [Factorio AI with External Agents — L193](factorio-ai-with-external-agents.md#^ref-a4d90289-193-0) (line 193, col 0, score 1)
- [field-dynamics-math-blocks — L183](field-dynamics-math-blocks.md#^ref-7cfc230d-183-0) (line 183, col 0, score 1)
- [field-interaction-equations — L197](field-interaction-equations.md#^ref-b09141b7-197-0) (line 197, col 0, score 1)
- [field-node-diagram-outline — L157](field-node-diagram-outline.md#^ref-1f32c94a-157-0) (line 157, col 0, score 1)
- [field-node-diagram-set — L189](field-node-diagram-set.md#^ref-22b989d5-189-0) (line 189, col 0, score 1)
- [field-node-diagram-visualizations — L135](field-node-diagram-visualizations.md#^ref-e9b27b06-135-0) (line 135, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L424](functional-embedding-pipeline-refactor.md#^ref-a4a25141-424-0) (line 424, col 0, score 1)
- [graph-ds — L415](graph-ds.md#^ref-6620e2f2-415-0) (line 415, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L148](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-148-0) (line 148, col 0, score 1)
- [ts-to-lisp-transpiler — L159](ts-to-lisp-transpiler.md#^ref-ba11486b-159-0) (line 159, col 0, score 0.86)
- [Window Management — L140](chunks/window-management.md#^ref-9e8ae388-140-0) (line 140, col 0, score 0.86)
- [Chroma Toolkit Consolidation Plan — L304](chroma-toolkit-consolidation-plan.md#^ref-5020e892-304-0) (line 304, col 0, score 0.86)
- [typed-struct-compiler — L684](typed-struct-compiler.md#^ref-78eeedf7-684-0) (line 684, col 0, score 0.86)
- [DSL — L390](chunks/dsl.md#^ref-e87bc036-390-0) (line 390, col 0, score 0.86)
- [Simulation Demo — L311](chunks/simulation-demo.md#^ref-557309a3-311-0) (line 311, col 0, score 0.86)
- [Tooling — L223](chunks/tooling.md#^ref-6cb4943e-223-0) (line 223, col 0, score 0.86)
- [Window Management — L388](chunks/window-management.md#^ref-9e8ae388-388-0) (line 388, col 0, score 0.86)
- [Debugging Broker Connections and Agent Behavior — L537](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-537-0) (line 537, col 0, score 0.86)
- [Duck's Self-Referential Perceptual Loop — L360](ducks-self-referential-perceptual-loop.md#^ref-71726f04-360-0) (line 360, col 0, score 0.86)
- [Dynamic Context Model for Web Components — L1322](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1322-0) (line 1322, col 0, score 0.86)
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
- [TypeScript Patch for Tool Calling Support — L547](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-547-0) (line 547, col 0, score 1)
- [Promethean Documentation Update — L21](promethean-documentation-update.txt#^ref-0b872af2-21-0) (line 21, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L87](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-87-0) (line 87, col 0, score 1)
- [Promethean Notes — L24](promethean-notes.md#^ref-1c4046b5-24-0) (line 24, col 0, score 1)
- [promethean-requirements — L35](promethean-requirements.md#^ref-95205cd3-35-0) (line 35, col 0, score 1)
- [Promethean State Format — L131](promethean-state-format.md#^ref-23df6ddb-131-0) (line 131, col 0, score 1)
- [Promethean Workflow Optimization — L33](promethean-workflow-optimization.md#^ref-d614d983-33-0) (line 33, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L268](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-268-0) (line 268, col 0, score 1)
- [Redirecting Standard Error — L44](redirecting-standard-error.md#^ref-b3555ede-44-0) (line 44, col 0, score 1)
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
- [Promethean Documentation Update — L50](promethean-documentation-update.txt#^ref-0b872af2-50-0) (line 50, col 0, score 1)
- [Promethean Notes — L53](promethean-notes.md#^ref-1c4046b5-53-0) (line 53, col 0, score 1)
- [promethean-requirements — L64](promethean-requirements.md#^ref-95205cd3-64-0) (line 64, col 0, score 1)
- [Promethean Workflow Optimization — L62](promethean-workflow-optimization.md#^ref-d614d983-62-0) (line 62, col 0, score 1)
- [Prometheus Observability Stack — L570](prometheus-observability-stack.md#^ref-e90b5a16-570-0) (line 570, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L167](protocol-0-the-contradiction-engine.md#^ref-9a93a756-167-0) (line 167, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L288](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-288-0) (line 288, col 0, score 1)
- [Pure TypeScript Search Microservice — L634](pure-typescript-search-microservice.md#^ref-d17d3a96-634-0) (line 634, col 0, score 1)
- [Reawakening Duck — L173](reawakening-duck.md#^ref-59b5670f-173-0) (line 173, col 0, score 1)
- [Pure TypeScript Search Microservice — L605](pure-typescript-search-microservice.md#^ref-d17d3a96-605-0) (line 605, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L561](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-561-0) (line 561, col 0, score 1)
- [schema-evolution-workflow — L645](schema-evolution-workflow.md#^ref-d8059b6a-645-0) (line 645, col 0, score 1)
- [Stateful Partitions and Rebalancing — L671](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-671-0) (line 671, col 0, score 1)
- [Pure TypeScript Search Microservice — L635](pure-typescript-search-microservice.md#^ref-d17d3a96-635-0) (line 635, col 0, score 1)
- [Reawakening Duck — L172](reawakening-duck.md#^ref-59b5670f-172-0) (line 172, col 0, score 1)
- [Redirecting Standard Error — L73](redirecting-standard-error.md#^ref-b3555ede-73-0) (line 73, col 0, score 1)
- [ripple-propagation-demo — L162](ripple-propagation-demo.md#^ref-8430617b-162-0) (line 162, col 0, score 1)
- [schema-evolution-workflow — L612](schema-evolution-workflow.md#^ref-d8059b6a-612-0) (line 612, col 0, score 1)
- [Self-Agency in AI Interaction — L94](self-agency-in-ai-interaction.md#^ref-49a9a860-94-0) (line 94, col 0, score 1)
- [sibilant-macro-targets — L246](sibilant-macro-targets.md#^ref-c5c9a5c6-246-0) (line 246, col 0, score 1)
- [Stateful Partitions and Rebalancing — L638](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-638-0) (line 638, col 0, score 1)
- [unique-templates — L55](templates/unique-templates.md#^ref-c26f0044-55-0) (line 55, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L123](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-123-0) (line 123, col 0, score 1)
- [DuckDuckGoSearchPipeline — L65](duckduckgosearchpipeline.md#^ref-e979c50f-65-0) (line 65, col 0, score 1)
- [Dynamic Context Model for Web Components — L485](dynamic-context-model-for-web-components.md#^ref-f7702bf8-485-0) (line 485, col 0, score 1)
- [Eidolon Field Abstract Model — L257](eidolon-field-abstract-model.md#^ref-5e8b2388-257-0) (line 257, col 0, score 1)
- [eidolon-field-math-foundations — L221](eidolon-field-math-foundations.md#^ref-008f2ac0-221-0) (line 221, col 0, score 1)
- [eidolon-node-lifecycle — L99](eidolon-node-lifecycle.md#^ref-938eca9c-99-0) (line 99, col 0, score 1)
- [Factorio AI with External Agents — L227](factorio-ai-with-external-agents.md#^ref-a4d90289-227-0) (line 227, col 0, score 1)
- [field-dynamics-math-blocks — L212](field-dynamics-math-blocks.md#^ref-7cfc230d-212-0) (line 212, col 0, score 1)
- [field-interaction-equations — L226](field-interaction-equations.md#^ref-b09141b7-226-0) (line 226, col 0, score 1)
- [promethean-requirements — L68](promethean-requirements.md#^ref-95205cd3-68-0) (line 68, col 0, score 1)
- [Reawakening Duck — L211](reawakening-duck.md#^ref-59b5670f-211-0) (line 211, col 0, score 1)
- [Redirecting Standard Error — L75](redirecting-standard-error.md#^ref-b3555ede-75-0) (line 75, col 0, score 1)
- [schema-evolution-workflow — L629](schema-evolution-workflow.md#^ref-d8059b6a-629-0) (line 629, col 0, score 1)
- [Self-Agency in AI Interaction — L95](self-agency-in-ai-interaction.md#^ref-49a9a860-95-0) (line 95, col 0, score 1)
- [sibilant-macro-targets — L264](sibilant-macro-targets.md#^ref-c5c9a5c6-264-0) (line 264, col 0, score 1)
- [Smoke Resonance Visualizations — L144](smoke-resonance-visualizations.md#^ref-ac9d3ac5-144-0) (line 144, col 0, score 1)
- [Stateful Partitions and Rebalancing — L658](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-658-0) (line 658, col 0, score 1)
- [Synchronicity Waves and Web — L140](synchronicity-waves-and-web.md#^ref-91295f3a-140-0) (line 140, col 0, score 1)
- [Window Management — L84](chunks/window-management.md#^ref-9e8ae388-84-0) (line 84, col 0, score 1)
- [Creative Moments — L60](creative-moments.md#^ref-10d98225-60-0) (line 60, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L128](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-128-0) (line 128, col 0, score 1)
- [DuckDuckGoSearchPipeline — L61](duckduckgosearchpipeline.md#^ref-e979c50f-61-0) (line 61, col 0, score 1)
- [Duck's Attractor States — L163](ducks-attractor-states.md#^ref-13951643-163-0) (line 163, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L124](ducks-self-referential-perceptual-loop.md#^ref-71726f04-124-0) (line 124, col 0, score 1)
- [Dynamic Context Model for Web Components — L481](dynamic-context-model-for-web-components.md#^ref-f7702bf8-481-0) (line 481, col 0, score 1)
- [Eidolon Field Abstract Model — L260](eidolon-field-abstract-model.md#^ref-5e8b2388-260-0) (line 260, col 0, score 1)
- [eidolon-node-lifecycle — L100](eidolon-node-lifecycle.md#^ref-938eca9c-100-0) (line 100, col 0, score 1)
- [Pure TypeScript Search Microservice — L575](pure-typescript-search-microservice.md#^ref-d17d3a96-575-0) (line 575, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L157](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-157-0) (line 157, col 0, score 1)
- [Obsidian Task Generation — L65](obsidian-task-generation.md#^ref-9b694a91-65-0) (line 65, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L359](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-359-0) (line 359, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L539](performance-optimized-polyglot-bridge.md#^ref-f5579967-539-0) (line 539, col 0, score 1)
- [Pipeline Enhancements — L33](pipeline-enhancements.md#^ref-e2135d9f-33-0) (line 33, col 0, score 1)
- [polyglot-repl-interface-layer — L259](polyglot-repl-interface-layer.md#^ref-9c79206d-259-0) (line 259, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L182](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-182-0) (line 182, col 0, score 1)
- [Promethean Chat Activity Report — L79](promethean-chat-activity-report.md#^ref-18344cf9-79-0) (line 79, col 0, score 1)
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
- [Pure TypeScript Search Microservice — L676](pure-typescript-search-microservice.md#^ref-d17d3a96-676-0) (line 676, col 0, score 1)
- [Redirecting Standard Error — L81](redirecting-standard-error.md#^ref-b3555ede-81-0) (line 81, col 0, score 1)
- [ripple-propagation-demo — L194](ripple-propagation-demo.md#^ref-8430617b-194-0) (line 194, col 0, score 1)
- [schema-evolution-workflow — L650](schema-evolution-workflow.md#^ref-d8059b6a-650-0) (line 650, col 0, score 1)
- [Self-Agency in AI Interaction — L100](self-agency-in-ai-interaction.md#^ref-49a9a860-100-0) (line 100, col 0, score 1)
- [sibilant-macro-targets — L285](sibilant-macro-targets.md#^ref-c5c9a5c6-285-0) (line 285, col 0, score 1)
- [Smoke Resonance Visualizations — L170](smoke-resonance-visualizations.md#^ref-ac9d3ac5-170-0) (line 170, col 0, score 1)
- [Stateful Partitions and Rebalancing — L686](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-686-0) (line 686, col 0, score 1)
- [Synchronicity Waves and Web — L171](synchronicity-waves-and-web.md#^ref-91295f3a-171-0) (line 171, col 0, score 1)
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
- [Pure TypeScript Search Microservice — L668](pure-typescript-search-microservice.md#^ref-d17d3a96-668-0) (line 668, col 0, score 1)
- [Reawakening Duck — L213](reawakening-duck.md#^ref-59b5670f-213-0) (line 213, col 0, score 1)
- [Redirecting Standard Error — L83](redirecting-standard-error.md#^ref-b3555ede-83-0) (line 83, col 0, score 1)
- [schema-evolution-workflow — L647](schema-evolution-workflow.md#^ref-d8059b6a-647-0) (line 647, col 0, score 1)
- [Smoke Resonance Visualizations — L163](smoke-resonance-visualizations.md#^ref-ac9d3ac5-163-0) (line 163, col 0, score 1)
- [Stateful Partitions and Rebalancing — L682](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-682-0) (line 682, col 0, score 1)
- [Synchronicity Waves and Web — L168](synchronicity-waves-and-web.md#^ref-91295f3a-168-0) (line 168, col 0, score 1)
- [unique-templates — L65](templates/unique-templates.md#^ref-c26f0044-65-0) (line 65, col 0, score 1)
- [The Jar of Echoes — L191](the-jar-of-echoes.md#^ref-18138627-191-0) (line 191, col 0, score 1)
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
- [graph-ds — L404](graph-ds.md#^ref-6620e2f2-404-0) (line 404, col 0, score 1)
- [heartbeat-fragment-demo — L155](heartbeat-fragment-demo.md#^ref-dd00677a-155-0) (line 155, col 0, score 1)
- [homeostasis-decay-formulas — L191](homeostasis-decay-formulas.md#^ref-37b5d236-191-0) (line 191, col 0, score 1)
- [i3-bluetooth-setup — L142](i3-bluetooth-setup.md#^ref-5e408692-142-0) (line 142, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L347](migrate-to-provider-tenant-architecture.md#^ref-54382370-347-0) (line 347, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L171](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-171-0) (line 171, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L122](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-122-0) (line 122, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L92](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-92-0) (line 92, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L302](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-302-0) (line 302, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L481](performance-optimized-polyglot-bridge.md#^ref-f5579967-481-0) (line 481, col 0, score 1)
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
- [Promethean Infrastructure Setup — L737](promethean-infrastructure-setup.md#^ref-6deed6ac-737-0) (line 737, col 0, score 1)
- [Promethean Notes — L74](promethean-notes.md#^ref-1c4046b5-74-0) (line 74, col 0, score 1)
- [promethean-requirements — L77](promethean-requirements.md#^ref-95205cd3-77-0) (line 77, col 0, score 1)
- [Promethean State Format — L107](promethean-state-format.md#^ref-23df6ddb-107-0) (line 107, col 0, score 1)
- [Promethean Workflow Optimization — L74](promethean-workflow-optimization.md#^ref-d614d983-74-0) (line 74, col 0, score 1)
- [Prometheus Observability Stack — L604](prometheus-observability-stack.md#^ref-e90b5a16-604-0) (line 604, col 0, score 1)
- [Prompt_Folder_Bootstrap — L232](prompt-folder-bootstrap.md#^ref-bd4f0976-232-0) (line 232, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L215](protocol-0-the-contradiction-engine.md#^ref-9a93a756-215-0) (line 215, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L322](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-322-0) (line 322, col 0, score 1)
- [Prometheus Observability Stack — L608](prometheus-observability-stack.md#^ref-e90b5a16-608-0) (line 608, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L224](protocol-0-the-contradiction-engine.md#^ref-9a93a756-224-0) (line 224, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L329](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-329-0) (line 329, col 0, score 1)
- [Pure TypeScript Search Microservice — L686](pure-typescript-search-microservice.md#^ref-d17d3a96-686-0) (line 686, col 0, score 1)
- [Redirecting Standard Error — L93](redirecting-standard-error.md#^ref-b3555ede-93-0) (line 93, col 0, score 1)
- [ripple-propagation-demo — L212](ripple-propagation-demo.md#^ref-8430617b-212-0) (line 212, col 0, score 1)
- [schema-evolution-workflow — L592](schema-evolution-workflow.md#^ref-d8059b6a-592-0) (line 592, col 0, score 1)
- [Self-Agency in AI Interaction — L106](self-agency-in-ai-interaction.md#^ref-49a9a860-106-0) (line 106, col 0, score 1)
- [Synchronicity Waves and Web — L192](synchronicity-waves-and-web.md#^ref-91295f3a-192-0) (line 192, col 0, score 1)
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
- [Functional Embedding Pipeline Refactor — L366](functional-embedding-pipeline-refactor.md#^ref-a4a25141-366-0) (line 366, col 0, score 1)
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
- [Duck's Self-Referential Perceptual Loop — L131](ducks-self-referential-perceptual-loop.md#^ref-71726f04-131-0) (line 131, col 0, score 1)
- [eidolon-field-math-foundations — L225](eidolon-field-math-foundations.md#^ref-008f2ac0-225-0) (line 225, col 0, score 1)
- [Factorio AI with External Agents — L237](factorio-ai-with-external-agents.md#^ref-a4d90289-237-0) (line 237, col 0, score 1)
- [field-dynamics-math-blocks — L223](field-dynamics-math-blocks.md#^ref-7cfc230d-223-0) (line 223, col 0, score 1)
- [field-interaction-equations — L233](field-interaction-equations.md#^ref-b09141b7-233-0) (line 233, col 0, score 1)
- [Fnord Tracer Protocol — L339](fnord-tracer-protocol.md#^ref-fc21f824-339-0) (line 339, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L371](functional-embedding-pipeline-refactor.md#^ref-a4a25141-371-0) (line 371, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L193](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-193-0) (line 193, col 0, score 1)
- [graph-ds — L476](graph-ds.md#^ref-6620e2f2-476-0) (line 476, col 0, score 1)
- [i3-bluetooth-setup — L209](i3-bluetooth-setup.md#^ref-5e408692-209-0) (line 209, col 0, score 1)
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
- [Functional Embedding Pipeline Refactor — L372](functional-embedding-pipeline-refactor.md#^ref-a4a25141-372-0) (line 372, col 0, score 1)
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
- [Promethean Dev Workflow Update — L167](promethean-dev-workflow-update.md#^ref-03a5578f-167-0) (line 167, col 0, score 1)
- [Promethean Documentation Update — L101](promethean-documentation-update.txt#^ref-0b872af2-101-0) (line 101, col 0, score 1)
- [Promethean Infrastructure Setup — L766](promethean-infrastructure-setup.md#^ref-6deed6ac-766-0) (line 766, col 0, score 1)
- [Promethean Notes — L111](promethean-notes.md#^ref-1c4046b5-111-0) (line 111, col 0, score 1)
- [Promethean State Format — L177](promethean-state-format.md#^ref-23df6ddb-177-0) (line 177, col 0, score 1)
- [Prompt_Folder_Bootstrap — L310](prompt-folder-bootstrap.md#^ref-bd4f0976-310-0) (line 310, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L370](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-370-0) (line 370, col 0, score 1)
- [Pure TypeScript Search Microservice — L697](pure-typescript-search-microservice.md#^ref-d17d3a96-697-0) (line 697, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L257](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-257-0) (line 257, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L154](model-upgrade-calm-down-guide.md#^ref-db74343f-154-0) (line 154, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L216](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-216-0) (line 216, col 0, score 1)
- [OpenAPI Validation Report — L102](openapi-validation-report.md#^ref-5c152b08-102-0) (line 102, col 0, score 1)
- [Optimizing Command Limitations in System Design — L131](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-131-0) (line 131, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L605](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-605-0) (line 605, col 0, score 1)
- [plan-update-confirmation — L1111](plan-update-confirmation.md#^ref-b22d79c6-1111-0) (line 1111, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L169](promethean-copilot-intent-engine.md#^ref-ae24a280-169-0) (line 169, col 0, score 1)
- [Promethean Dev Workflow Update — L185](promethean-dev-workflow-update.md#^ref-03a5578f-185-0) (line 185, col 0, score 1)
- [Ice Box Reorganization — L146](ice-box-reorganization.md#^ref-291c7d91-146-0) (line 146, col 0, score 1)
- [komorebi-group-window-hack — L289](komorebi-group-window-hack.md#^ref-dd89372d-289-0) (line 289, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L281](layer1survivabilityenvelope.md#^ref-64a9f9f9-281-0) (line 281, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L265](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-265-0) (line 265, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L160](model-upgrade-calm-down-guide.md#^ref-db74343f-160-0) (line 160, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L195](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-195-0) (line 195, col 0, score 1)
- [Optimizing Command Limitations in System Design — L110](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-110-0) (line 110, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L343](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-343-0) (line 343, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L572](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-572-0) (line 572, col 0, score 1)
- [schema-evolution-workflow — L566](schema-evolution-workflow.md#^ref-d8059b6a-566-0) (line 566, col 0, score 1)
- [Stateful Partitions and Rebalancing — L602](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-602-0) (line 602, col 0, score 1)
- [Pure TypeScript Search Microservice — L641](pure-typescript-search-microservice.md#^ref-d17d3a96-641-0) (line 641, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L656](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-656-0) (line 656, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L435](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-435-0) (line 435, col 0, score 1)
- [Fnord Tracer Protocol — L684](fnord-tracer-protocol.md#^ref-fc21f824-684-0) (line 684, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L603](migrate-to-provider-tenant-architecture.md#^ref-54382370-603-0) (line 603, col 0, score 0.99)
- [Factorio AI with External Agents — L347](factorio-ai-with-external-agents.md#^ref-a4d90289-347-0) (line 347, col 0, score 0.99)
- [Fnord Tracer Protocol — L520](fnord-tracer-protocol.md#^ref-fc21f824-520-0) (line 520, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L755](migrate-to-provider-tenant-architecture.md#^ref-54382370-755-0) (line 755, col 0, score 1)
- [Services — L173](chunks/services.md#^ref-75ea4a6a-173-0) (line 173, col 0, score 0.9)
- [Eidolon Field Abstract Model — L320](eidolon-field-abstract-model.md#^ref-5e8b2388-320-0) (line 320, col 0, score 1)
- [eidolon-field-math-foundations — L183](eidolon-field-math-foundations.md#^ref-008f2ac0-183-0) (line 183, col 0, score 1)
- [Factorio AI with External Agents — L250](factorio-ai-with-external-agents.md#^ref-a4d90289-250-0) (line 250, col 0, score 1)
- [field-dynamics-math-blocks — L177](field-dynamics-math-blocks.md#^ref-7cfc230d-177-0) (line 177, col 0, score 1)
- [field-interaction-equations — L191](field-interaction-equations.md#^ref-b09141b7-191-0) (line 191, col 0, score 1)
- [field-node-diagram-outline — L149](field-node-diagram-outline.md#^ref-1f32c94a-149-0) (line 149, col 0, score 1)
- [Fnord Tracer Protocol — L366](fnord-tracer-protocol.md#^ref-fc21f824-366-0) (line 366, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L382](functional-embedding-pipeline-refactor.md#^ref-a4a25141-382-0) (line 382, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L220](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-220-0) (line 220, col 0, score 1)
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
- [Stateful Partitions and Rebalancing — L669](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-669-0) (line 669, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L628](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-628-0) (line 628, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L2877](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-2877-0) (line 2877, col 0, score 0.86)
- [windows-tiling-with-autohotkey — L2709](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2709-0) (line 2709, col 0, score 0.86)
- [eidolon-field-math-foundations — L4316](eidolon-field-math-foundations.md#^ref-008f2ac0-4316-0) (line 4316, col 0, score 0.86)
- [Canonical Org-Babel Matplotlib Animation Template — L3243](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-3243-0) (line 3243, col 0, score 0.86)
- [eidolon-field-math-foundations — L7354](eidolon-field-math-foundations.md#^ref-008f2ac0-7354-0) (line 7354, col 0, score 0.86)
- [Canonical Org-Babel Matplotlib Animation Template — L3270](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-3270-0) (line 3270, col 0, score 0.86)
- [eidolon-field-math-foundations — L7381](eidolon-field-math-foundations.md#^ref-008f2ac0-7381-0) (line 7381, col 0, score 0.86)
- [TypeScript Patch for Tool Calling Support — L570](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-570-0) (line 570, col 0, score 1)
- [Pipeline Enhancements — L52](pipeline-enhancements.md#^ref-e2135d9f-52-0) (line 52, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L197](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-197-0) (line 197, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L101](promethean-copilot-intent-engine.md#^ref-ae24a280-101-0) (line 101, col 0, score 1)
- [Promethean Dev Workflow Update — L139](promethean-dev-workflow-update.md#^ref-03a5578f-139-0) (line 139, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L260](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-260-0) (line 260, col 0, score 1)
- [Promethean State Format — L188](promethean-state-format.md#^ref-23df6ddb-188-0) (line 188, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L197](protocol-0-the-contradiction-engine.md#^ref-9a93a756-197-0) (line 197, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L270](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-270-0) (line 270, col 0, score 1)
- [Reawakening Duck — L167](reawakening-duck.md#^ref-59b5670f-167-0) (line 167, col 0, score 1)
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
- [Functional Embedding Pipeline Refactor — L423](functional-embedding-pipeline-refactor.md#^ref-a4a25141-423-0) (line 423, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L409](functional-embedding-pipeline-refactor.md#^ref-a4a25141-409-0) (line 409, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L227](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-227-0) (line 227, col 0, score 1)
- [heartbeat-fragment-demo — L200](heartbeat-fragment-demo.md#^ref-dd00677a-200-0) (line 200, col 0, score 1)
- [homeostasis-decay-formulas — L237](homeostasis-decay-formulas.md#^ref-37b5d236-237-0) (line 237, col 0, score 1)
- [i3-bluetooth-setup — L179](i3-bluetooth-setup.md#^ref-5e408692-179-0) (line 179, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L382](migrate-to-provider-tenant-architecture.md#^ref-54382370-382-0) (line 382, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L222](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-222-0) (line 222, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L109](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-109-0) (line 109, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L110](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-110-0) (line 110, col 0, score 1)
- [Promethean Workflow Optimization — L88](promethean-workflow-optimization.md#^ref-d614d983-88-0) (line 88, col 0, score 1)
- [Prometheus Observability Stack — L609](prometheus-observability-stack.md#^ref-e90b5a16-609-0) (line 609, col 0, score 1)
- [Prompt_Folder_Bootstrap — L313](prompt-folder-bootstrap.md#^ref-bd4f0976-313-0) (line 313, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L226](protocol-0-the-contradiction-engine.md#^ref-9a93a756-226-0) (line 226, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L369](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-369-0) (line 369, col 0, score 1)
- [Pure TypeScript Search Microservice — L689](pure-typescript-search-microservice.md#^ref-d17d3a96-689-0) (line 689, col 0, score 1)
- [Reawakening Duck — L253](reawakening-duck.md#^ref-59b5670f-253-0) (line 253, col 0, score 1)
- [Self-Agency in AI Interaction — L127](self-agency-in-ai-interaction.md#^ref-49a9a860-127-0) (line 127, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L241](layer1survivabilityenvelope.md#^ref-64a9f9f9-241-0) (line 241, col 0, score 1)
- [Mathematical Samplers — L125](mathematical-samplers.md#^ref-86a691ec-125-0) (line 125, col 0, score 1)
- [Mathematics Sampler — L131](mathematics-sampler.md#^ref-b5e0183e-131-0) (line 131, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L387](migrate-to-provider-tenant-architecture.md#^ref-54382370-387-0) (line 387, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L223](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-223-0) (line 223, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L179](model-upgrade-calm-down-guide.md#^ref-db74343f-179-0) (line 179, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L105](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-105-0) (line 105, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L106](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-106-0) (line 106, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L139](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-139-0) (line 139, col 0, score 1)
- [Promethean Workflow Optimization — L95](promethean-workflow-optimization.md#^ref-d614d983-95-0) (line 95, col 0, score 1)
- [Prometheus Observability Stack — L621](prometheus-observability-stack.md#^ref-e90b5a16-621-0) (line 621, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L238](protocol-0-the-contradiction-engine.md#^ref-9a93a756-238-0) (line 238, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L344](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-344-0) (line 344, col 0, score 1)
- [Pure TypeScript Search Microservice — L640](pure-typescript-search-microservice.md#^ref-d17d3a96-640-0) (line 640, col 0, score 1)
- [Reawakening Duck — L232](reawakening-duck.md#^ref-59b5670f-232-0) (line 232, col 0, score 1)
- [Redirecting Standard Error — L102](redirecting-standard-error.md#^ref-b3555ede-102-0) (line 102, col 0, score 1)
- [ripple-propagation-demo — L180](ripple-propagation-demo.md#^ref-8430617b-180-0) (line 180, col 0, score 1)
- [Self-Agency in AI Interaction — L120](self-agency-in-ai-interaction.md#^ref-49a9a860-120-0) (line 120, col 0, score 1)
- [Ice Box Reorganization — L193](ice-box-reorganization.md#^ref-291c7d91-193-0) (line 193, col 0, score 1)
- [komorebi-group-window-hack — L322](komorebi-group-window-hack.md#^ref-dd89372d-322-0) (line 322, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L293](layer1survivabilityenvelope.md#^ref-64a9f9f9-293-0) (line 293, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L173](model-upgrade-calm-down-guide.md#^ref-db74343f-173-0) (line 173, col 0, score 1)
- [Obsidian Task Generation — L91](obsidian-task-generation.md#^ref-9b694a91-91-0) (line 91, col 0, score 1)
- [OpenAPI Validation Report — L103](openapi-validation-report.md#^ref-5c152b08-103-0) (line 103, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L595](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-595-0) (line 595, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L555](performance-optimized-polyglot-bridge.md#^ref-f5579967-555-0) (line 555, col 0, score 1)
- [plan-update-confirmation — L1102](plan-update-confirmation.md#^ref-b22d79c6-1102-0) (line 1102, col 0, score 1)
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
- [field-dynamics-math-blocks — L229](field-dynamics-math-blocks.md#^ref-7cfc230d-229-0) (line 229, col 0, score 1)
- [field-interaction-equations — L240](field-interaction-equations.md#^ref-b09141b7-240-0) (line 240, col 0, score 1)
- [field-node-diagram-outline — L195](field-node-diagram-outline.md#^ref-1f32c94a-195-0) (line 195, col 0, score 1)
- [field-node-diagram-set — L221](field-node-diagram-set.md#^ref-22b989d5-221-0) (line 221, col 0, score 1)
- [field-node-diagram-visualizations — L170](field-node-diagram-visualizations.md#^ref-e9b27b06-170-0) (line 170, col 0, score 1)
- [Fnord Tracer Protocol — L310](fnord-tracer-protocol.md#^ref-fc21f824-310-0) (line 310, col 0, score 1)
- [graph-ds — L462](graph-ds.md#^ref-6620e2f2-462-0) (line 462, col 0, score 1)
- [heartbeat-fragment-demo — L199](heartbeat-fragment-demo.md#^ref-dd00677a-199-0) (line 199, col 0, score 1)
- [homeostasis-decay-formulas — L240](homeostasis-decay-formulas.md#^ref-37b5d236-240-0) (line 240, col 0, score 1)
- [Ice Box Reorganization — L141](ice-box-reorganization.md#^ref-291c7d91-141-0) (line 141, col 0, score 1)
- [Promethean Infrastructure Setup — L756](promethean-infrastructure-setup.md#^ref-6deed6ac-756-0) (line 756, col 0, score 1)
- [promethean-requirements — L91](promethean-requirements.md#^ref-95205cd3-91-0) (line 91, col 0, score 1)
- [Promethean State Format — L200](promethean-state-format.md#^ref-23df6ddb-200-0) (line 200, col 0, score 1)
- [Prometheus Observability Stack — L552](prometheus-observability-stack.md#^ref-e90b5a16-552-0) (line 552, col 0, score 1)
- [Prompt_Folder_Bootstrap — L288](prompt-folder-bootstrap.md#^ref-bd4f0976-288-0) (line 288, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L188](protocol-0-the-contradiction-engine.md#^ref-9a93a756-188-0) (line 188, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L323](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-323-0) (line 323, col 0, score 1)
- [Pure TypeScript Search Microservice — L617](pure-typescript-search-microservice.md#^ref-d17d3a96-617-0) (line 617, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L521](performance-optimized-polyglot-bridge.md#^ref-f5579967-521-0) (line 521, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L289](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-289-0) (line 289, col 0, score 1)
- [Promethean Infrastructure Setup — L786](promethean-infrastructure-setup.md#^ref-6deed6ac-786-0) (line 786, col 0, score 1)
- [Promethean Notes — L78](promethean-notes.md#^ref-1c4046b5-78-0) (line 78, col 0, score 1)
- [promethean-requirements — L96](promethean-requirements.md#^ref-95205cd3-96-0) (line 96, col 0, score 1)
- [Prometheus Observability Stack — L615](prometheus-observability-stack.md#^ref-e90b5a16-615-0) (line 615, col 0, score 1)
- [Prompt_Folder_Bootstrap — L285](prompt-folder-bootstrap.md#^ref-bd4f0976-285-0) (line 285, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L366](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-366-0) (line 366, col 0, score 1)
- [Reawakening Duck — L243](reawakening-duck.md#^ref-59b5670f-243-0) (line 243, col 0, score 1)
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
- [Per-Domain Policy System for JS Crawler — L500](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-500-0) (line 500, col 0, score 1)
- [Prometheus Observability Stack — L505](prometheus-observability-stack.md#^ref-e90b5a16-505-0) (line 505, col 0, score 1)
- [Pure TypeScript Search Microservice — L576](pure-typescript-search-microservice.md#^ref-d17d3a96-576-0) (line 576, col 0, score 1)
- [ChatGPT Custom Prompts — L80](chatgpt-custom-prompts.md#^ref-930054b3-80-0) (line 80, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L140](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-140-0) (line 140, col 0, score 1)
- [Dynamic Context Model for Web Components — L519](dynamic-context-model-for-web-components.md#^ref-f7702bf8-519-0) (line 519, col 0, score 1)
- [Factorio AI with External Agents — L284](factorio-ai-with-external-agents.md#^ref-a4d90289-284-0) (line 284, col 0, score 1)
- [field-dynamics-math-blocks — L259](field-dynamics-math-blocks.md#^ref-7cfc230d-259-0) (line 259, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L411](functional-embedding-pipeline-refactor.md#^ref-a4a25141-411-0) (line 411, col 0, score 1)
- [Promethean State Format — L149](promethean-state-format.md#^ref-23df6ddb-149-0) (line 149, col 0, score 1)
- [Prompt_Folder_Bootstrap — L274](prompt-folder-bootstrap.md#^ref-bd4f0976-274-0) (line 274, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L205](protocol-0-the-contradiction-engine.md#^ref-9a93a756-205-0) (line 205, col 0, score 1)
- [Reawakening Duck — L190](reawakening-duck.md#^ref-59b5670f-190-0) (line 190, col 0, score 1)
- [ripple-propagation-demo — L185](ripple-propagation-demo.md#^ref-8430617b-185-0) (line 185, col 0, score 1)
- [schema-evolution-workflow — L618](schema-evolution-workflow.md#^ref-d8059b6a-618-0) (line 618, col 0, score 1)
- [sibilant-macro-targets — L223](sibilant-macro-targets.md#^ref-c5c9a5c6-223-0) (line 223, col 0, score 1)
- [Smoke Resonance Visualizations — L166](smoke-resonance-visualizations.md#^ref-ac9d3ac5-166-0) (line 166, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L419](functional-embedding-pipeline-refactor.md#^ref-a4a25141-419-0) (line 419, col 0, score 1)
- [i3-bluetooth-setup — L180](i3-bluetooth-setup.md#^ref-5e408692-180-0) (line 180, col 0, score 1)
- [komorebi-group-window-hack — L294](komorebi-group-window-hack.md#^ref-dd89372d-294-0) (line 294, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L230](layer1survivabilityenvelope.md#^ref-64a9f9f9-230-0) (line 230, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L386](migrate-to-provider-tenant-architecture.md#^ref-54382370-386-0) (line 386, col 0, score 1)
- [Mindful Prioritization — L36](mindful-prioritization.md#^ref-40185d05-36-0) (line 36, col 0, score 1)
- [MindfulRobotIntegration — L34](mindfulrobotintegration.md#^ref-5f65dfa5-34-0) (line 34, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L251](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-251-0) (line 251, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L41](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-41-0) (line 41, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L110](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-110-0) (line 110, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L133](protocol-0-the-contradiction-engine.md#^ref-9a93a756-133-0) (line 133, col 0, score 1)
- [The Jar of Echoes — L126](the-jar-of-echoes.md#^ref-18138627-126-0) (line 126, col 0, score 1)
- [ts-to-lisp-transpiler — L42](ts-to-lisp-transpiler.md#^ref-ba11486b-42-0) (line 42, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L225](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-225-0) (line 225, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L195](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-195-0) (line 195, col 0, score 1)
- [ChatGPT Custom Prompts — L67](chatgpt-custom-prompts.md#^ref-930054b3-67-0) (line 67, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L232](chroma-toolkit-consolidation-plan.md#^ref-5020e892-232-0) (line 232, col 0, score 1)
- [Diagrams — L82](chunks/diagrams.md#^ref-45cd25b5-82-0) (line 82, col 0, score 1)
- [DuckDuckGoSearchPipeline — L52](duckduckgosearchpipeline.md#^ref-e979c50f-52-0) (line 52, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L120](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-120-0) (line 120, col 0, score 1)
- [Promethean Infrastructure Setup — L744](promethean-infrastructure-setup.md#^ref-6deed6ac-744-0) (line 744, col 0, score 1)
- [Promethean Notes — L47](promethean-notes.md#^ref-1c4046b5-47-0) (line 47, col 0, score 1)
- [promethean-requirements — L58](promethean-requirements.md#^ref-95205cd3-58-0) (line 58, col 0, score 1)
- [Promethean Workflow Optimization — L42](promethean-workflow-optimization.md#^ref-d614d983-42-0) (line 42, col 0, score 1)
- [Prometheus Observability Stack — L589](prometheus-observability-stack.md#^ref-e90b5a16-589-0) (line 589, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L314](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-314-0) (line 314, col 0, score 1)
- [Pure TypeScript Search Microservice — L658](pure-typescript-search-microservice.md#^ref-d17d3a96-658-0) (line 658, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L552](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-552-0) (line 552, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L245](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-245-0) (line 245, col 0, score 1)
- [Prompt_Folder_Bootstrap — L242](prompt-folder-bootstrap.md#^ref-bd4f0976-242-0) (line 242, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L285](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-285-0) (line 285, col 0, score 1)
- [Pure TypeScript Search Microservice — L659](pure-typescript-search-microservice.md#^ref-d17d3a96-659-0) (line 659, col 0, score 1)
- [Reawakening Duck — L169](reawakening-duck.md#^ref-59b5670f-169-0) (line 169, col 0, score 1)
- [Redirecting Standard Error — L58](redirecting-standard-error.md#^ref-b3555ede-58-0) (line 58, col 0, score 1)
- [ripple-propagation-demo — L155](ripple-propagation-demo.md#^ref-8430617b-155-0) (line 155, col 0, score 1)
- [schema-evolution-workflow — L621](schema-evolution-workflow.md#^ref-d8059b6a-621-0) (line 621, col 0, score 1)
- [eidolon-field-math-foundations — L181](eidolon-field-math-foundations.md#^ref-008f2ac0-181-0) (line 181, col 0, score 1)
- [Fnord Tracer Protocol — L372](fnord-tracer-protocol.md#^ref-fc21f824-372-0) (line 372, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L401](functional-embedding-pipeline-refactor.md#^ref-a4a25141-401-0) (line 401, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L207](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-207-0) (line 207, col 0, score 1)
- [graph-ds — L469](graph-ds.md#^ref-6620e2f2-469-0) (line 469, col 0, score 1)
- [heartbeat-fragment-demo — L217](heartbeat-fragment-demo.md#^ref-dd00677a-217-0) (line 217, col 0, score 1)
- [i3-bluetooth-setup — L226](i3-bluetooth-setup.md#^ref-5e408692-226-0) (line 226, col 0, score 1)
- [Ice Box Reorganization — L191](ice-box-reorganization.md#^ref-291c7d91-191-0) (line 191, col 0, score 1)
- [Mathematical Samplers — L121](mathematical-samplers.md#^ref-86a691ec-121-0) (line 121, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L160](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-160-0) (line 160, col 0, score 1)
- [Optimizing Command Limitations in System Design — L75](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-75-0) (line 75, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L601](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-601-0) (line 601, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L281](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-281-0) (line 281, col 0, score 1)
- [Promethean Infrastructure Setup — L746](promethean-infrastructure-setup.md#^ref-6deed6ac-746-0) (line 746, col 0, score 1)
- [Promethean State Format — L179](promethean-state-format.md#^ref-23df6ddb-179-0) (line 179, col 0, score 1)
- [Prometheus Observability Stack — L550](prometheus-observability-stack.md#^ref-e90b5a16-550-0) (line 550, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L163](protocol-0-the-contradiction-engine.md#^ref-9a93a756-163-0) (line 163, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L319](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-319-0) (line 319, col 0, score 1)
- [Pure TypeScript Search Microservice — L619](pure-typescript-search-microservice.md#^ref-d17d3a96-619-0) (line 619, col 0, score 1)
- [Reawakening Duck — L237](reawakening-duck.md#^ref-59b5670f-237-0) (line 237, col 0, score 1)
- [ripple-propagation-demo — L222](ripple-propagation-demo.md#^ref-8430617b-222-0) (line 222, col 0, score 1)
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
- [Factorio AI with External Agents — L277](factorio-ai-with-external-agents.md#^ref-a4d90289-277-0) (line 277, col 0, score 1)
- [field-node-diagram-set — L250](field-node-diagram-set.md#^ref-22b989d5-250-0) (line 250, col 0, score 1)
- [Fnord Tracer Protocol — L364](fnord-tracer-protocol.md#^ref-fc21f824-364-0) (line 364, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L391](functional-embedding-pipeline-refactor.md#^ref-a4a25141-391-0) (line 391, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L222](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-222-0) (line 222, col 0, score 1)
- [graph-ds — L504](graph-ds.md#^ref-6620e2f2-504-0) (line 504, col 0, score 1)
- [homeostasis-decay-formulas — L281](homeostasis-decay-formulas.md#^ref-37b5d236-281-0) (line 281, col 0, score 1)
- [i3-bluetooth-setup — L222](i3-bluetooth-setup.md#^ref-5e408692-222-0) (line 222, col 0, score 1)
- [Mathematical Samplers — L119](mathematical-samplers.md#^ref-86a691ec-119-0) (line 119, col 0, score 1)
- [Mathematics Sampler — L121](mathematics-sampler.md#^ref-b5e0183e-121-0) (line 121, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L276](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-276-0) (line 276, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L258](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-258-0) (line 258, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L267](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-267-0) (line 267, col 0, score 1)
- [Creative Moments — L126](creative-moments.md#^ref-10d98225-126-0) (line 126, col 0, score 1)
- [Duck's Attractor States — L211](ducks-attractor-states.md#^ref-13951643-211-0) (line 211, col 0, score 1)
- [Dynamic Context Model for Web Components — L538](dynamic-context-model-for-web-components.md#^ref-f7702bf8-538-0) (line 538, col 0, score 1)
- [eidolon-field-math-foundations — L282](eidolon-field-math-foundations.md#^ref-008f2ac0-282-0) (line 282, col 0, score 1)
- [Fnord Tracer Protocol — L392](fnord-tracer-protocol.md#^ref-fc21f824-392-0) (line 392, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L276](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-276-0) (line 276, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L270](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-270-0) (line 270, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L147](model-upgrade-calm-down-guide.md#^ref-db74343f-147-0) (line 147, col 0, score 1)
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
- [field-node-diagram-visualizations — L147](field-node-diagram-visualizations.md#^ref-e9b27b06-147-0) (line 147, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L311](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-311-0) (line 311, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L534](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-534-0) (line 534, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L565](performance-optimized-polyglot-bridge.md#^ref-f5579967-565-0) (line 565, col 0, score 1)
- [polyglot-repl-interface-layer — L222](polyglot-repl-interface-layer.md#^ref-9c79206d-222-0) (line 222, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L198](promethean-copilot-intent-engine.md#^ref-ae24a280-198-0) (line 198, col 0, score 1)
- [Promethean Dev Workflow Update — L186](promethean-dev-workflow-update.md#^ref-03a5578f-186-0) (line 186, col 0, score 1)
- [Promethean Infrastructure Setup — L759](promethean-infrastructure-setup.md#^ref-6deed6ac-759-0) (line 759, col 0, score 1)
- [Prometheus Observability Stack — L571](prometheus-observability-stack.md#^ref-e90b5a16-571-0) (line 571, col 0, score 1)
- [Prompt_Folder_Bootstrap — L248](prompt-folder-bootstrap.md#^ref-bd4f0976-248-0) (line 248, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L273](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-273-0) (line 273, col 0, score 1)
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
- [Unique Info Dump Index — L128](unique-info-dump-index.md#^ref-30ec3ba6-128-0) (line 128, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L169](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-169-0) (line 169, col 0, score 1)
- [Promethean Infrastructure Setup — L815](promethean-infrastructure-setup.md#^ref-6deed6ac-815-0) (line 815, col 0, score 1)
- [promethean-requirements — L94](promethean-requirements.md#^ref-95205cd3-94-0) (line 94, col 0, score 1)
- [Prompt_Folder_Bootstrap — L272](prompt-folder-bootstrap.md#^ref-bd4f0976-272-0) (line 272, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L201](protocol-0-the-contradiction-engine.md#^ref-9a93a756-201-0) (line 201, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L356](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-356-0) (line 356, col 0, score 1)
- [Pure TypeScript Search Microservice — L706](pure-typescript-search-microservice.md#^ref-d17d3a96-706-0) (line 706, col 0, score 1)
- [Reawakening Duck — L236](reawakening-duck.md#^ref-59b5670f-236-0) (line 236, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L241](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-241-0) (line 241, col 0, score 1)
- [Creative Moments — L93](creative-moments.md#^ref-10d98225-93-0) (line 93, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L155](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-155-0) (line 155, col 0, score 1)
- [Duck's Attractor States — L190](ducks-attractor-states.md#^ref-13951643-190-0) (line 190, col 0, score 1)
- [Dynamic Context Model for Web Components — L525](dynamic-context-model-for-web-components.md#^ref-f7702bf8-525-0) (line 525, col 0, score 1)
- [eidolon-field-math-foundations — L228](eidolon-field-math-foundations.md#^ref-008f2ac0-228-0) (line 228, col 0, score 1)
- [field-interaction-equations — L238](field-interaction-equations.md#^ref-b09141b7-238-0) (line 238, col 0, score 1)
- [field-node-diagram-set — L260](field-node-diagram-set.md#^ref-22b989d5-260-0) (line 260, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L265](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-265-0) (line 265, col 0, score 1)
- [Creative Moments — L127](creative-moments.md#^ref-10d98225-127-0) (line 127, col 0, score 1)
- [Duck's Attractor States — L214](ducks-attractor-states.md#^ref-13951643-214-0) (line 214, col 0, score 1)
- [eidolon-field-math-foundations — L279](eidolon-field-math-foundations.md#^ref-008f2ac0-279-0) (line 279, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L278](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-278-0) (line 278, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L253](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-253-0) (line 253, col 0, score 1)
- [Promethean Chat Activity Report — L152](promethean-chat-activity-report.md#^ref-18344cf9-152-0) (line 152, col 0, score 1)
- [Promethean Dev Workflow Update — L215](promethean-dev-workflow-update.md#^ref-03a5578f-215-0) (line 215, col 0, score 1)
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
- [Debugging Broker Connections and Agent Behavior — L166](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-166-0) (line 166, col 0, score 1)
- [Duck's Attractor States — L161](ducks-attractor-states.md#^ref-13951643-161-0) (line 161, col 0, score 1)
- [Eidolon Field Abstract Model — L230](eidolon-field-abstract-model.md#^ref-5e8b2388-230-0) (line 230, col 0, score 1)
- [eidolon-field-math-foundations — L207](eidolon-field-math-foundations.md#^ref-008f2ac0-207-0) (line 207, col 0, score 1)
- [Factorio AI with External Agents — L249](factorio-ai-with-external-agents.md#^ref-a4d90289-249-0) (line 249, col 0, score 1)
- [field-dynamics-math-blocks — L204](field-dynamics-math-blocks.md#^ref-7cfc230d-204-0) (line 204, col 0, score 1)
- [field-interaction-equations — L212](field-interaction-equations.md#^ref-b09141b7-212-0) (line 212, col 0, score 1)
- [field-node-diagram-outline — L163](field-node-diagram-outline.md#^ref-1f32c94a-163-0) (line 163, col 0, score 1)
- [field-node-diagram-set — L202](field-node-diagram-set.md#^ref-22b989d5-202-0) (line 202, col 0, score 1)
- [Fnord Tracer Protocol — L296](fnord-tracer-protocol.md#^ref-fc21f824-296-0) (line 296, col 0, score 1)
- [graph-ds — L438](graph-ds.md#^ref-6620e2f2-438-0) (line 438, col 0, score 1)
- [homeostasis-decay-formulas — L215](homeostasis-decay-formulas.md#^ref-37b5d236-215-0) (line 215, col 0, score 1)
- [Ice Box Reorganization — L112](ice-box-reorganization.md#^ref-291c7d91-112-0) (line 112, col 0, score 1)
- [komorebi-group-window-hack — L236](komorebi-group-window-hack.md#^ref-dd89372d-236-0) (line 236, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L289](layer1survivabilityenvelope.md#^ref-64a9f9f9-289-0) (line 289, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L344](migrate-to-provider-tenant-architecture.md#^ref-54382370-344-0) (line 344, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L166](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-166-0) (line 166, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L130](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-130-0) (line 130, col 0, score 1)
- [polyglot-repl-interface-layer — L199](polyglot-repl-interface-layer.md#^ref-9c79206d-199-0) (line 199, col 0, score 1)
- [Promethean Chat Activity Report — L143](promethean-chat-activity-report.md#^ref-18344cf9-143-0) (line 143, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L94](promethean-copilot-intent-engine.md#^ref-ae24a280-94-0) (line 94, col 0, score 1)
- [Promethean Dev Workflow Update — L87](promethean-dev-workflow-update.md#^ref-03a5578f-87-0) (line 87, col 0, score 1)
- [Promethean Infrastructure Setup — L809](promethean-infrastructure-setup.md#^ref-6deed6ac-809-0) (line 809, col 0, score 1)
- [Promethean State Format — L171](promethean-state-format.md#^ref-23df6ddb-171-0) (line 171, col 0, score 1)
- [Promethean Workflow Optimization — L87](promethean-workflow-optimization.md#^ref-d614d983-87-0) (line 87, col 0, score 1)
- [Prometheus Observability Stack — L617](prometheus-observability-stack.md#^ref-e90b5a16-617-0) (line 617, col 0, score 1)
- [Prompt_Folder_Bootstrap — L315](prompt-folder-bootstrap.md#^ref-bd4f0976-315-0) (line 315, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L338](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-338-0) (line 338, col 0, score 1)
- [Pure TypeScript Search Microservice — L698](pure-typescript-search-microservice.md#^ref-d17d3a96-698-0) (line 698, col 0, score 1)
- [Reawakening Duck — L242](reawakening-duck.md#^ref-59b5670f-242-0) (line 242, col 0, score 1)
- [Redirecting Standard Error — L119](redirecting-standard-error.md#^ref-b3555ede-119-0) (line 119, col 0, score 1)
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
- [Simulation Demo — L90](chunks/simulation-demo.md#^ref-557309a3-90-0) (line 90, col 0, score 1)
- [Window Management — L91](chunks/window-management.md#^ref-9e8ae388-91-0) (line 91, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L107](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-107-0) (line 107, col 0, score 1)
- [Docops Feature Updates — L49](docops-feature-updates.md#^ref-2792d448-49-0) (line 49, col 0, score 1)
- [Duck's Attractor States — L148](ducks-attractor-states.md#^ref-13951643-148-0) (line 148, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L103](ducks-self-referential-perceptual-loop.md#^ref-71726f04-103-0) (line 103, col 0, score 1)
- [Dynamic Context Model for Web Components — L495](dynamic-context-model-for-web-components.md#^ref-f7702bf8-495-0) (line 495, col 0, score 1)
- [Eidolon Field Abstract Model — L264](eidolon-field-abstract-model.md#^ref-5e8b2388-264-0) (line 264, col 0, score 1)
- [eidolon-node-lifecycle — L120](eidolon-node-lifecycle.md#^ref-938eca9c-120-0) (line 120, col 0, score 1)
- [Promethean Notes — L85](promethean-notes.md#^ref-1c4046b5-85-0) (line 85, col 0, score 1)
- [Promethean State Format — L184](promethean-state-format.md#^ref-23df6ddb-184-0) (line 184, col 0, score 1)
- [Prometheus Observability Stack — L610](prometheus-observability-stack.md#^ref-e90b5a16-610-0) (line 610, col 0, score 1)
- [Prompt_Folder_Bootstrap — L289](prompt-folder-bootstrap.md#^ref-bd4f0976-289-0) (line 289, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L254](protocol-0-the-contradiction-engine.md#^ref-9a93a756-254-0) (line 254, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L343](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-343-0) (line 343, col 0, score 1)
- [Pure TypeScript Search Microservice — L681](pure-typescript-search-microservice.md#^ref-d17d3a96-681-0) (line 681, col 0, score 1)
- [schema-evolution-workflow — L677](schema-evolution-workflow.md#^ref-d8059b6a-677-0) (line 677, col 0, score 1)
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
- [i3-bluetooth-setup — L104](i3-bluetooth-setup.md#^ref-5e408692-104-0) (line 104, col 0, score 1)
- [Fnord Tracer Protocol — L374](fnord-tracer-protocol.md#^ref-fc21f824-374-0) (line 374, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L407](functional-embedding-pipeline-refactor.md#^ref-a4a25141-407-0) (line 407, col 0, score 1)
- [homeostasis-decay-formulas — L270](homeostasis-decay-formulas.md#^ref-37b5d236-270-0) (line 270, col 0, score 1)
- [Promethean Dev Workflow Update — L164](promethean-dev-workflow-update.md#^ref-03a5578f-164-0) (line 164, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L282](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-282-0) (line 282, col 0, score 1)
- [promethean-requirements — L89](promethean-requirements.md#^ref-95205cd3-89-0) (line 89, col 0, score 1)
- [Promethean State Format — L197](promethean-state-format.md#^ref-23df6ddb-197-0) (line 197, col 0, score 1)
- [Prometheus Observability Stack — L625](prometheus-observability-stack.md#^ref-e90b5a16-625-0) (line 625, col 0, score 1)
- [Window Management — L94](chunks/window-management.md#^ref-9e8ae388-94-0) (line 94, col 0, score 1)
- [Docops Feature Updates — L101](docops-feature-updates.md#^ref-2792d448-101-0) (line 101, col 0, score 1)
- [Dynamic Context Model for Web Components — L458](dynamic-context-model-for-web-components.md#^ref-f7702bf8-458-0) (line 458, col 0, score 1)
- [Eidolon Field Abstract Model — L231](eidolon-field-abstract-model.md#^ref-5e8b2388-231-0) (line 231, col 0, score 1)
- [eidolon-field-math-foundations — L193](eidolon-field-math-foundations.md#^ref-008f2ac0-193-0) (line 193, col 0, score 1)
- [eidolon-node-lifecycle — L84](eidolon-node-lifecycle.md#^ref-938eca9c-84-0) (line 84, col 0, score 1)
- [Factorio AI with External Agents — L175](factorio-ai-with-external-agents.md#^ref-a4d90289-175-0) (line 175, col 0, score 1)
- [field-dynamics-math-blocks — L188](field-dynamics-math-blocks.md#^ref-7cfc230d-188-0) (line 188, col 0, score 1)
- [field-interaction-equations — L218](field-interaction-equations.md#^ref-b09141b7-218-0) (line 218, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L237](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-237-0) (line 237, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L267](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-267-0) (line 267, col 0, score 1)
- [Operations — L73](chunks/operations.md#^ref-f1add613-73-0) (line 73, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L170](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-170-0) (line 170, col 0, score 1)
- [Docops Feature Updates — L67](docops-feature-updates-3.md#^ref-cdbd21ee-67-0) (line 67, col 0, score 1)
- [Docops Feature Updates — L96](docops-feature-updates.md#^ref-2792d448-96-0) (line 96, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L139](ducks-self-referential-perceptual-loop.md#^ref-71726f04-139-0) (line 139, col 0, score 1)
- [Dynamic Context Model for Web Components — L548](dynamic-context-model-for-web-components.md#^ref-f7702bf8-548-0) (line 548, col 0, score 1)
- [Fnord Tracer Protocol — L349](fnord-tracer-protocol.md#^ref-fc21f824-349-0) (line 349, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L213](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-213-0) (line 213, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L259](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-259-0) (line 259, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L296](chroma-toolkit-consolidation-plan.md#^ref-5020e892-296-0) (line 296, col 0, score 1)
- [Dynamic Context Model for Web Components — L546](dynamic-context-model-for-web-components.md#^ref-f7702bf8-546-0) (line 546, col 0, score 1)
- [Factorio AI with External Agents — L257](factorio-ai-with-external-agents.md#^ref-a4d90289-257-0) (line 257, col 0, score 1)
- [i3-bluetooth-setup — L223](i3-bluetooth-setup.md#^ref-5e408692-223-0) (line 223, col 0, score 1)
- [komorebi-group-window-hack — L332](komorebi-group-window-hack.md#^ref-dd89372d-332-0) (line 332, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L411](migrate-to-provider-tenant-architecture.md#^ref-54382370-411-0) (line 411, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L248](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-248-0) (line 248, col 0, score 1)
- [i3-bluetooth-setup — L146](i3-bluetooth-setup.md#^ref-5e408692-146-0) (line 146, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L298](layer1survivabilityenvelope.md#^ref-64a9f9f9-298-0) (line 298, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L96](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-96-0) (line 96, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L309](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-309-0) (line 309, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L532](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-532-0) (line 532, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L533](performance-optimized-polyglot-bridge.md#^ref-f5579967-533-0) (line 533, col 0, score 1)
- [plan-update-confirmation — L1040](plan-update-confirmation.md#^ref-b22d79c6-1040-0) (line 1040, col 0, score 1)
- [polyglot-repl-interface-layer — L210](polyglot-repl-interface-layer.md#^ref-9c79206d-210-0) (line 210, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L261](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-261-0) (line 261, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L140](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-140-0) (line 140, col 0, score 1)
- [Promethean Infrastructure Setup — L764](promethean-infrastructure-setup.md#^ref-6deed6ac-764-0) (line 764, col 0, score 1)
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
- [Creative Moments — L79](creative-moments.md#^ref-10d98225-79-0) (line 79, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L145](ducks-self-referential-perceptual-loop.md#^ref-71726f04-145-0) (line 145, col 0, score 1)
- [Dynamic Context Model for Web Components — L543](dynamic-context-model-for-web-components.md#^ref-f7702bf8-543-0) (line 543, col 0, score 1)
- [Factorio AI with External Agents — L282](factorio-ai-with-external-agents.md#^ref-a4d90289-282-0) (line 282, col 0, score 1)
- [field-dynamics-math-blocks — L255](field-dynamics-math-blocks.md#^ref-7cfc230d-255-0) (line 255, col 0, score 1)
- [Fnord Tracer Protocol — L386](fnord-tracer-protocol.md#^ref-fc21f824-386-0) (line 386, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L422](functional-embedding-pipeline-refactor.md#^ref-a4a25141-422-0) (line 422, col 0, score 1)
- [homeostasis-decay-formulas — L276](homeostasis-decay-formulas.md#^ref-37b5d236-276-0) (line 276, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L414](migrate-to-provider-tenant-architecture.md#^ref-54382370-414-0) (line 414, col 0, score 1)
- [Promethean Notes — L96](promethean-notes.md#^ref-1c4046b5-96-0) (line 96, col 0, score 1)
- [Promethean State Format — L199](promethean-state-format.md#^ref-23df6ddb-199-0) (line 199, col 0, score 1)
- [Prompt_Folder_Bootstrap — L280](prompt-folder-bootstrap.md#^ref-bd4f0976-280-0) (line 280, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L291](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-291-0) (line 291, col 0, score 1)
- [Reawakening Duck — L208](reawakening-duck.md#^ref-59b5670f-208-0) (line 208, col 0, score 1)
- [ripple-propagation-demo — L192](ripple-propagation-demo.md#^ref-8430617b-192-0) (line 192, col 0, score 1)
- [schema-evolution-workflow — L620](schema-evolution-workflow.md#^ref-d8059b6a-620-0) (line 620, col 0, score 1)
- [sibilant-macro-targets — L244](sibilant-macro-targets.md#^ref-c5c9a5c6-244-0) (line 244, col 0, score 1)
- [Smoke Resonance Visualizations — L153](smoke-resonance-visualizations.md#^ref-ac9d3ac5-153-0) (line 153, col 0, score 1)
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
- [graph-ds — L474](graph-ds.md#^ref-6620e2f2-474-0) (line 474, col 0, score 1)
- [homeostasis-decay-formulas — L257](homeostasis-decay-formulas.md#^ref-37b5d236-257-0) (line 257, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L260](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-260-0) (line 260, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L162](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-162-0) (line 162, col 0, score 1)
- [Obsidian Task Generation — L85](obsidian-task-generation.md#^ref-9b694a91-85-0) (line 85, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L161](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-161-0) (line 161, col 0, score 1)
- [Optimizing Command Limitations in System Design — L76](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-76-0) (line 76, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L382](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-382-0) (line 382, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L577](performance-optimized-polyglot-bridge.md#^ref-f5579967-577-0) (line 577, col 0, score 1)
- [plan-update-confirmation — L1128](plan-update-confirmation.md#^ref-b22d79c6-1128-0) (line 1128, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L120](promethean-copilot-intent-engine.md#^ref-ae24a280-120-0) (line 120, col 0, score 1)
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
- [polyglot-repl-interface-layer — L175](polyglot-repl-interface-layer.md#^ref-9c79206d-175-0) (line 175, col 0, score 1)
- [field-node-diagram-set — L256](field-node-diagram-set.md#^ref-22b989d5-256-0) (line 256, col 0, score 1)
- [Fnord Tracer Protocol — L373](fnord-tracer-protocol.md#^ref-fc21f824-373-0) (line 373, col 0, score 1)
- [graph-ds — L409](graph-ds.md#^ref-6620e2f2-409-0) (line 409, col 0, score 1)
- [heartbeat-fragment-demo — L153](heartbeat-fragment-demo.md#^ref-dd00677a-153-0) (line 153, col 0, score 1)
- [i3-bluetooth-setup — L140](i3-bluetooth-setup.md#^ref-5e408692-140-0) (line 140, col 0, score 1)
- [Ice Box Reorganization — L177](ice-box-reorganization.md#^ref-291c7d91-177-0) (line 177, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L290](layer1survivabilityenvelope.md#^ref-64a9f9f9-290-0) (line 290, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L168](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-168-0) (line 168, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L166](model-upgrade-calm-down-guide.md#^ref-db74343f-166-0) (line 166, col 0, score 1)
- [Dynamic Context Model for Web Components — L545](dynamic-context-model-for-web-components.md#^ref-f7702bf8-545-0) (line 545, col 0, score 1)
- [field-dynamics-math-blocks — L262](field-dynamics-math-blocks.md#^ref-7cfc230d-262-0) (line 262, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L378](functional-embedding-pipeline-refactor.md#^ref-a4a25141-378-0) (line 378, col 0, score 1)
- [graph-ds — L491](graph-ds.md#^ref-6620e2f2-491-0) (line 491, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L309](layer1survivabilityenvelope.md#^ref-64a9f9f9-309-0) (line 309, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L379](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-379-0) (line 379, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L589](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-589-0) (line 589, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L566](performance-optimized-polyglot-bridge.md#^ref-f5579967-566-0) (line 566, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L573](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-573-0) (line 573, col 0, score 1)
- [Promethean State Format — L110](promethean-state-format.md#^ref-23df6ddb-110-0) (line 110, col 0, score 1)
- [Promethean Workflow Optimization — L98](promethean-workflow-optimization.md#^ref-d614d983-98-0) (line 98, col 0, score 1)
- [Prometheus Observability Stack — L563](prometheus-observability-stack.md#^ref-e90b5a16-563-0) (line 563, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L158](protocol-0-the-contradiction-engine.md#^ref-9a93a756-158-0) (line 158, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L282](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-282-0) (line 282, col 0, score 1)
- [Pure TypeScript Search Microservice — L637](pure-typescript-search-microservice.md#^ref-d17d3a96-637-0) (line 637, col 0, score 1)
- [schema-evolution-workflow — L624](schema-evolution-workflow.md#^ref-d8059b6a-624-0) (line 624, col 0, score 1)
- [Prometheus Observability Stack — L798](prometheus-observability-stack.md#^ref-e90b5a16-798-0) (line 798, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1079](migrate-to-provider-tenant-architecture.md#^ref-54382370-1079-0) (line 1079, col 0, score 1)
- [polyglot-repl-interface-layer — L281](polyglot-repl-interface-layer.md#^ref-9c79206d-281-0) (line 281, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L334](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-334-0) (line 334, col 0, score 1)
- [plan-update-confirmation — L1611](plan-update-confirmation.md#^ref-b22d79c6-1611-0) (line 1611, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L228](promethean-copilot-intent-engine.md#^ref-ae24a280-228-0) (line 228, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L701](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-701-0) (line 701, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L439](model-upgrade-calm-down-guide.md#^ref-db74343f-439-0) (line 439, col 0, score 1)
- [ChatGPT Custom Prompts — L92](chatgpt-custom-prompts.md#^ref-930054b3-92-0) (line 92, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L269](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-269-0) (line 269, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L449](model-upgrade-calm-down-guide.md#^ref-db74343f-449-0) (line 449, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L198](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-198-0) (line 198, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L197](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-197-0) (line 197, col 0, score 1)
- [Promethean Workflow Optimization — L110](promethean-workflow-optimization.md#^ref-d614d983-110-0) (line 110, col 0, score 1)
- [Ice Box Reorganization — L333](ice-box-reorganization.md#^ref-291c7d91-333-0) (line 333, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L259](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-259-0) (line 259, col 0, score 1)
- [Obsidian Task Generation — L104](obsidian-task-generation.md#^ref-9b694a91-104-0) (line 104, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L388](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-388-0) (line 388, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L335](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-335-0) (line 335, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L552](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-552-0) (line 552, col 0, score 1)
- [zero-copy-snapshots-and-workers — L673](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-673-0) (line 673, col 0, score 1)
- [ChatGPT Custom Prompts — L120](chatgpt-custom-prompts.md#^ref-930054b3-120-0) (line 120, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L242](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-242-0) (line 242, col 0, score 1)
- [Pure TypeScript Search Microservice — L746](pure-typescript-search-microservice.md#^ref-d17d3a96-746-0) (line 746, col 0, score 1)
- [Promethean Dev Workflow Update — L451](promethean-dev-workflow-update.md#^ref-03a5578f-451-0) (line 451, col 0, score 1)
- [polyglot-repl-interface-layer — L367](polyglot-repl-interface-layer.md#^ref-9c79206d-367-0) (line 367, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L698](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-698-0) (line 698, col 0, score 0.97)
- [plan-update-confirmation — L1537](plan-update-confirmation.md#^ref-b22d79c6-1537-0) (line 1537, col 0, score 0.97)
- [Obsidian ChatGPT Plugin Integration Guide — L154](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-154-0) (line 154, col 0, score 0.97)
- [sibilant-macro-targets — L553](sibilant-macro-targets.md#^ref-c5c9a5c6-553-0) (line 553, col 0, score 0.97)
- [polyglot-repl-interface-layer — L332](polyglot-repl-interface-layer.md#^ref-9c79206d-332-0) (line 332, col 0, score 0.95)
- [promethean-requirements — L120](promethean-requirements.md#^ref-95205cd3-120-0) (line 120, col 0, score 0.95)
- [Dynamic Context Model for Web Components — L574](dynamic-context-model-for-web-components.md#^ref-f7702bf8-574-0) (line 574, col 0, score 0.95)
- [Pipeline Enhancements — L81](pipeline-enhancements.md#^ref-e2135d9f-81-0) (line 81, col 0, score 0.97)
- [Prompt_Folder_Bootstrap — L348](prompt-folder-bootstrap.md#^ref-bd4f0976-348-0) (line 348, col 0, score 0.97)
- [plan-update-confirmation — L1363](plan-update-confirmation.md#^ref-b22d79c6-1363-0) (line 1363, col 0, score 1)
- [Docops Feature Updates — L105](docops-feature-updates.md#^ref-2792d448-105-0) (line 105, col 0, score 0.97)
- [Model Selection for Lightweight Conversational Tasks — L360](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-360-0) (line 360, col 0, score 1)
- [Promethean Infrastructure Setup — L849](promethean-infrastructure-setup.md#^ref-6deed6ac-849-0) (line 849, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L937](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-937-0) (line 937, col 0, score 1)
- [plan-update-confirmation — L1603](plan-update-confirmation.md#^ref-b22d79c6-1603-0) (line 1603, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L507](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-507-0) (line 507, col 0, score 1)
- [Promethean Infrastructure Setup — L1008](promethean-infrastructure-setup.md#^ref-6deed6ac-1008-0) (line 1008, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L269](model-upgrade-calm-down-guide.md#^ref-db74343f-269-0) (line 269, col 0, score 1)
- [Promethean Dev Workflow Update — L423](promethean-dev-workflow-update.md#^ref-03a5578f-423-0) (line 423, col 0, score 1)
- [Dynamic Context Model for Web Components — L578](dynamic-context-model-for-web-components.md#^ref-f7702bf8-578-0) (line 578, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L406](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-406-0) (line 406, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L295](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-295-0) (line 295, col 0, score 1)
- [Fnord Tracer Protocol — L532](fnord-tracer-protocol.md#^ref-fc21f824-532-0) (line 532, col 0, score 1)
- [Factorio AI with External Agents — L346](factorio-ai-with-external-agents.md#^ref-a4d90289-346-0) (line 346, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L622](functional-embedding-pipeline-refactor.md#^ref-a4a25141-622-0) (line 622, col 0, score 1)
- [Promethean Dev Workflow Update — L362](promethean-dev-workflow-update.md#^ref-03a5578f-362-0) (line 362, col 0, score 1)
- [schema-evolution-workflow — L1022](schema-evolution-workflow.md#^ref-d8059b6a-1022-0) (line 1022, col 0, score 1)
- [Promethean State Format — L385](promethean-state-format.md#^ref-23df6ddb-385-0) (line 385, col 0, score 1)
- [Prometheus Observability Stack — L646](prometheus-observability-stack.md#^ref-e90b5a16-646-0) (line 646, col 0, score 1)
- [Admin Dashboard for User Management — L253](admin-dashboard-for-user-management.md#^ref-2901a3e9-253-0) (line 253, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L164](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-164-0) (line 164, col 0, score 0.96)
- [Functional Refactor of TypeScript Document Processing — L437](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-437-0) (line 437, col 0, score 0.96)
- [Model Selection for Lightweight Conversational Tasks — L506](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-506-0) (line 506, col 0, score 1)
- [Fnord Tracer Protocol — L460](fnord-tracer-protocol.md#^ref-fc21f824-460-0) (line 460, col 0, score 1)
- [Dynamic Context Model for Web Components — L590](dynamic-context-model-for-web-components.md#^ref-f7702bf8-590-0) (line 590, col 0, score 1)
- [Tracing the Signal — L438](tracing-the-signal.md#^ref-c3cd4f65-438-0) (line 438, col 0, score 1)
- [Pure TypeScript Search Microservice — L724](pure-typescript-search-microservice.md#^ref-d17d3a96-724-0) (line 724, col 0, score 0.98)
- [Model Selection for Lightweight Conversational Tasks — L521](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-521-0) (line 521, col 0, score 0.98)
- [Promethean State Format — L315](promethean-state-format.md#^ref-23df6ddb-315-0) (line 315, col 0, score 0.97)
- [Factorio AI with External Agents — L487](factorio-ai-with-external-agents.md#^ref-a4d90289-487-0) (line 487, col 0, score 0.97)
- [Model Upgrade Calm-Down Guide — L453](model-upgrade-calm-down-guide.md#^ref-db74343f-453-0) (line 453, col 0, score 1)
- [Promethean Infrastructure Setup — L1018](promethean-infrastructure-setup.md#^ref-6deed6ac-1018-0) (line 1018, col 0, score 0.99)
- [Pure TypeScript Search Microservice — L760](pure-typescript-search-microservice.md#^ref-d17d3a96-760-0) (line 760, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L797](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-797-0) (line 797, col 0, score 0.99)
- [Prometheus Observability Stack — L674](prometheus-observability-stack.md#^ref-e90b5a16-674-0) (line 674, col 0, score 0.99)
- [i3-bluetooth-setup — L533](i3-bluetooth-setup.md#^ref-5e408692-533-0) (line 533, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L1194](migrate-to-provider-tenant-architecture.md#^ref-54382370-1194-0) (line 1194, col 0, score 0.98)
- [Per-Domain Policy System for JS Crawler — L955](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-955-0) (line 955, col 0, score 0.98)
- [Fnord Tracer Protocol — L646](fnord-tracer-protocol.md#^ref-fc21f824-646-0) (line 646, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L568](layer1survivabilityenvelope.md#^ref-64a9f9f9-568-0) (line 568, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L2556](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-2556-0) (line 2556, col 0, score 0.96)
- [windows-tiling-with-autohotkey — L2426](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2426-0) (line 2426, col 0, score 0.97)
- [Canonical Org-Babel Matplotlib Animation Template — L2174](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-2174-0) (line 2174, col 0, score 0.96)
- [DuckDuckGoSearchPipeline — L91](duckduckgosearchpipeline.md#^ref-e979c50f-91-0) (line 91, col 0, score 0.96)
- [Model Selection for Lightweight Conversational Tasks — L537](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-537-0) (line 537, col 0, score 0.96)
- [Promethean-Copilot-Intent-Engine — L398](promethean-copilot-intent-engine.md#^ref-ae24a280-398-0) (line 398, col 0, score 0.96)
- [Fnord Tracer Protocol — L644](fnord-tracer-protocol.md#^ref-fc21f824-644-0) (line 644, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L788](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-788-0) (line 788, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L390](promethean-copilot-intent-engine.md#^ref-ae24a280-390-0) (line 390, col 0, score 1)
- [Promethean Dev Workflow Update — L281](promethean-dev-workflow-update.md#^ref-03a5578f-281-0) (line 281, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L915](performance-optimized-polyglot-bridge.md#^ref-f5579967-915-0) (line 915, col 0, score 1)
- [Redirecting Standard Error — L189](redirecting-standard-error.md#^ref-b3555ede-189-0) (line 189, col 0, score 1)
- [Dynamic Context Model for Web Components — L1106](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1106-0) (line 1106, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L944](migrate-to-provider-tenant-architecture.md#^ref-54382370-944-0) (line 944, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L842](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-842-0) (line 842, col 0, score 1)
- [Promethean Dev Workflow Update — L415](promethean-dev-workflow-update.md#^ref-03a5578f-415-0) (line 415, col 0, score 1)
- [Promethean Dev Workflow Update — L330](promethean-dev-workflow-update.md#^ref-03a5578f-330-0) (line 330, col 0, score 0.98)
- [Pure TypeScript Search Microservice — L730](pure-typescript-search-microservice.md#^ref-d17d3a96-730-0) (line 730, col 0, score 0.98)
- [Factorio AI with External Agents — L312](factorio-ai-with-external-agents.md#^ref-a4d90289-312-0) (line 312, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L466](migrate-to-provider-tenant-architecture.md#^ref-54382370-466-0) (line 466, col 0, score 1)
- [Prometheus Observability Stack — L640](prometheus-observability-stack.md#^ref-e90b5a16-640-0) (line 640, col 0, score 1)
- [Promethean Infrastructure Setup — L873](promethean-infrastructure-setup.md#^ref-6deed6ac-873-0) (line 873, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L418](model-upgrade-calm-down-guide.md#^ref-db74343f-418-0) (line 418, col 0, score 1)
- [Stateful Partitions and Rebalancing — L935](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-935-0) (line 935, col 0, score 1)
- [zero-copy-snapshots-and-workers — L674](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-674-0) (line 674, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L888](performance-optimized-polyglot-bridge.md#^ref-f5579967-888-0) (line 888, col 0, score 1)
- [Factorio AI with External Agents — L406](factorio-ai-with-external-agents.md#^ref-a4d90289-406-0) (line 406, col 0, score 1)
- [plan-update-confirmation — L1188](plan-update-confirmation.md#^ref-b22d79c6-1188-0) (line 1188, col 0, score 1)
- [Stateful Partitions and Rebalancing — L942](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-942-0) (line 942, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L491](layer1survivabilityenvelope.md#^ref-64a9f9f9-491-0) (line 491, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L220](model-upgrade-calm-down-guide.md#^ref-db74343f-220-0) (line 220, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L455](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-455-0) (line 455, col 0, score 1)
- [promethean-requirements — L125](promethean-requirements.md#^ref-95205cd3-125-0) (line 125, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L755](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-755-0) (line 755, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L486](chroma-toolkit-consolidation-plan.md#^ref-5020e892-486-0) (line 486, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L460](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-460-0) (line 460, col 0, score 1)
- [Unique Info Dump Index — L559](unique-info-dump-index.md#^ref-30ec3ba6-559-0) (line 559, col 0, score 1)
- [unique-templates — L85](templates/unique-templates.md#^ref-c26f0044-85-0) (line 85, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L337](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-337-0) (line 337, col 0, score 1)
- [Dynamic Context Model for Web Components — L564](dynamic-context-model-for-web-components.md#^ref-f7702bf8-564-0) (line 564, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L659](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-659-0) (line 659, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L512](promethean-copilot-intent-engine.md#^ref-ae24a280-512-0) (line 512, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L389](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-389-0) (line 389, col 0, score 1)
- [Reawakening Duck — L358](reawakening-duck.md#^ref-59b5670f-358-0) (line 358, col 0, score 1)
- [Prompt_Folder_Bootstrap — L437](prompt-folder-bootstrap.md#^ref-bd4f0976-437-0) (line 437, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L382](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-382-0) (line 382, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L563](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-563-0) (line 563, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L777](migrate-to-provider-tenant-architecture.md#^ref-54382370-777-0) (line 777, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L296](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-296-0) (line 296, col 0, score 1)
- [Promethean Dev Workflow Update — L2589](promethean-dev-workflow-update.md#^ref-03a5578f-2589-0) (line 2589, col 0, score 0.98)
- [Canonical Org-Babel Matplotlib Animation Template — L2383](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-2383-0) (line 2383, col 0, score 0.98)
- [Promethean Dev Workflow Update — L2422](promethean-dev-workflow-update.md#^ref-03a5578f-2422-0) (line 2422, col 0, score 0.98)
- [polyglot-repl-interface-layer — L352](polyglot-repl-interface-layer.md#^ref-9c79206d-352-0) (line 352, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L468](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-468-0) (line 468, col 0, score 1)
- [Admin Dashboard for User Management — L263](admin-dashboard-for-user-management.md#^ref-2901a3e9-263-0) (line 263, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L488](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-488-0) (line 488, col 0, score 1)
- [Dynamic Context Model for Web Components — L595](dynamic-context-model-for-web-components.md#^ref-f7702bf8-595-0) (line 595, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L469](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-469-0) (line 469, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L627](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-627-0) (line 627, col 0, score 1)
- [plan-update-confirmation — L1347](plan-update-confirmation.md#^ref-b22d79c6-1347-0) (line 1347, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L405](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-405-0) (line 405, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L395](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-395-0) (line 395, col 0, score 1)
- [Stateful Partitions and Rebalancing — L736](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-736-0) (line 736, col 0, score 1)
- [Fnord Tracer Protocol — L645](fnord-tracer-protocol.md#^ref-fc21f824-645-0) (line 645, col 0, score 1)
- [schema-evolution-workflow — L702](schema-evolution-workflow.md#^ref-d8059b6a-702-0) (line 702, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L609](performance-optimized-polyglot-bridge.md#^ref-f5579967-609-0) (line 609, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L366](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-366-0) (line 366, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L816](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-816-0) (line 816, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L918](chroma-toolkit-consolidation-plan.md#^ref-5020e892-918-0) (line 918, col 0, score 0.95)
- [Services — L367](chunks/services.md#^ref-75ea4a6a-367-0) (line 367, col 0, score 0.95)
- [Dynamic Context Model for Web Components — L1491](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1491-0) (line 1491, col 0, score 0.95)
- [eidolon-field-math-foundations — L843](eidolon-field-math-foundations.md#^ref-008f2ac0-843-0) (line 843, col 0, score 0.95)
- [Per-Domain Policy System for JS Crawler — L1003](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-1003-0) (line 1003, col 0, score 0.95)
- [Promethean-Copilot-Intent-Engine — L619](promethean-copilot-intent-engine.md#^ref-ae24a280-619-0) (line 619, col 0, score 0.95)
- [Promethean Infrastructure Setup — L1287](promethean-infrastructure-setup.md#^ref-6deed6ac-1287-0) (line 1287, col 0, score 0.95)
- [Prometheus Observability Stack — L936](prometheus-observability-stack.md#^ref-e90b5a16-936-0) (line 936, col 0, score 0.95)
- [Promethean Infrastructure Setup — L887](promethean-infrastructure-setup.md#^ref-6deed6ac-887-0) (line 887, col 0, score 1)
- [Prometheus Observability Stack — L925](prometheus-observability-stack.md#^ref-e90b5a16-925-0) (line 925, col 0, score 1)
- [Prompt_Folder_Bootstrap — L827](prompt-folder-bootstrap.md#^ref-bd4f0976-827-0) (line 827, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L539](protocol-0-the-contradiction-engine.md#^ref-9a93a756-539-0) (line 539, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L745](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-745-0) (line 745, col 0, score 1)
- [Pure TypeScript Search Microservice — L1002](pure-typescript-search-microservice.md#^ref-d17d3a96-1002-0) (line 1002, col 0, score 1)
- [ripple-propagation-demo — L583](ripple-propagation-demo.md#^ref-8430617b-583-0) (line 583, col 0, score 1)
- [schema-evolution-workflow — L740](schema-evolution-workflow.md#^ref-d8059b6a-740-0) (line 740, col 0, score 1)
- [sibilant-macro-targets — L871](sibilant-macro-targets.md#^ref-c5c9a5c6-871-0) (line 871, col 0, score 1)
- [Promethean Infrastructure Setup — L888](promethean-infrastructure-setup.md#^ref-6deed6ac-888-0) (line 888, col 0, score 1)
- [Prometheus Observability Stack — L926](prometheus-observability-stack.md#^ref-e90b5a16-926-0) (line 926, col 0, score 1)
- [Prompt_Folder_Bootstrap — L828](prompt-folder-bootstrap.md#^ref-bd4f0976-828-0) (line 828, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L540](protocol-0-the-contradiction-engine.md#^ref-9a93a756-540-0) (line 540, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L746](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-746-0) (line 746, col 0, score 1)
- [Pure TypeScript Search Microservice — L1003](pure-typescript-search-microservice.md#^ref-d17d3a96-1003-0) (line 1003, col 0, score 1)
- [ripple-propagation-demo — L584](ripple-propagation-demo.md#^ref-8430617b-584-0) (line 584, col 0, score 1)
- [schema-evolution-workflow — L741](schema-evolution-workflow.md#^ref-d8059b6a-741-0) (line 741, col 0, score 1)
- [sibilant-macro-targets — L872](sibilant-macro-targets.md#^ref-c5c9a5c6-872-0) (line 872, col 0, score 1)
- [schema-evolution-workflow — L742](schema-evolution-workflow.md#^ref-d8059b6a-742-0) (line 742, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L998](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-998-0) (line 998, col 0, score 1)
- [The Jar of Echoes — L3458](the-jar-of-echoes.md#^ref-18138627-3458-0) (line 3458, col 0, score 0.97)
- [The Jar of Echoes — L4471](the-jar-of-echoes.md#^ref-18138627-4471-0) (line 4471, col 0, score 0.94)
- [windows-tiling-with-autohotkey — L3746](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-3746-0) (line 3746, col 0, score 0.94)
- [The Jar of Echoes — L2613](the-jar-of-echoes.md#^ref-18138627-2613-0) (line 2613, col 0, score 0.94)
- [The Jar of Echoes — L4498](the-jar-of-echoes.md#^ref-18138627-4498-0) (line 4498, col 0, score 0.93)
- [windows-tiling-with-autohotkey — L3781](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-3781-0) (line 3781, col 0, score 0.93)
- [The Jar of Echoes — L4582](the-jar-of-echoes.md#^ref-18138627-4582-0) (line 4582, col 0, score 0.91)
- [field-node-diagram-outline — L630](field-node-diagram-outline.md#^ref-1f32c94a-630-0) (line 630, col 0, score 1)
- [Fnord Tracer Protocol — L1011](fnord-tracer-protocol.md#^ref-fc21f824-1011-0) (line 1011, col 0, score 1)
- [graph-ds — L874](graph-ds.md#^ref-6620e2f2-874-0) (line 874, col 0, score 1)
- [heartbeat-fragment-demo — L576](heartbeat-fragment-demo.md#^ref-dd00677a-576-0) (line 576, col 0, score 1)
- [homeostasis-decay-formulas — L914](homeostasis-decay-formulas.md#^ref-37b5d236-914-0) (line 914, col 0, score 1)
- [i3-bluetooth-setup — L648](i3-bluetooth-setup.md#^ref-5e408692-648-0) (line 648, col 0, score 1)
- [Ice Box Reorganization — L342](ice-box-reorganization.md#^ref-291c7d91-342-0) (line 342, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L770](layer1survivabilityenvelope.md#^ref-64a9f9f9-770-0) (line 770, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L697](migrate-to-provider-tenant-architecture.md#^ref-54382370-697-0) (line 697, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L709](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-709-0) (line 709, col 0, score 1)
- [Promethean Dev Workflow Update — L621](promethean-dev-workflow-update.md#^ref-03a5578f-621-0) (line 621, col 0, score 1)
- [Promethean Infrastructure Setup — L891](promethean-infrastructure-setup.md#^ref-6deed6ac-891-0) (line 891, col 0, score 1)
- [Prometheus Observability Stack — L929](prometheus-observability-stack.md#^ref-e90b5a16-929-0) (line 929, col 0, score 1)
- [Prompt_Folder_Bootstrap — L831](prompt-folder-bootstrap.md#^ref-bd4f0976-831-0) (line 831, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L543](protocol-0-the-contradiction-engine.md#^ref-9a93a756-543-0) (line 543, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L749](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-749-0) (line 749, col 0, score 1)
- [Pure TypeScript Search Microservice — L1006](pure-typescript-search-microservice.md#^ref-d17d3a96-1006-0) (line 1006, col 0, score 1)
- [ripple-propagation-demo — L587](ripple-propagation-demo.md#^ref-8430617b-587-0) (line 587, col 0, score 1)
- [schema-evolution-workflow — L744](schema-evolution-workflow.md#^ref-d8059b6a-744-0) (line 744, col 0, score 1)
- [Promethean Infrastructure Setup — L1356](promethean-infrastructure-setup.md#^ref-6deed6ac-1356-0) (line 1356, col 0, score 0.92)
- [Prometheus Observability Stack — L1107](prometheus-observability-stack.md#^ref-e90b5a16-1107-0) (line 1107, col 0, score 0.92)
- [Prompt_Folder_Bootstrap — L675](prompt-folder-bootstrap.md#^ref-bd4f0976-675-0) (line 675, col 0, score 0.92)
- [Protocol_0_The_Contradiction_Engine — L515](protocol-0-the-contradiction-engine.md#^ref-9a93a756-515-0) (line 515, col 0, score 0.92)
- [Provider-Agnostic Chat Panel Implementation — L829](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-829-0) (line 829, col 0, score 0.92)
- [Pure TypeScript Search Microservice — L1233](pure-typescript-search-microservice.md#^ref-d17d3a96-1233-0) (line 1233, col 0, score 0.92)
- [ripple-propagation-demo — L641](ripple-propagation-demo.md#^ref-8430617b-641-0) (line 641, col 0, score 0.92)
- [schema-evolution-workflow — L1289](schema-evolution-workflow.md#^ref-d8059b6a-1289-0) (line 1289, col 0, score 0.92)
- [eidolon-node-lifecycle — L420](eidolon-node-lifecycle.md#^ref-938eca9c-420-0) (line 420, col 0, score 1)
- [field-dynamics-math-blocks — L874](field-dynamics-math-blocks.md#^ref-7cfc230d-874-0) (line 874, col 0, score 1)
- [field-interaction-equations — L904](field-interaction-equations.md#^ref-b09141b7-904-0) (line 904, col 0, score 1)
- [field-node-diagram-outline — L634](field-node-diagram-outline.md#^ref-1f32c94a-634-0) (line 634, col 0, score 1)
- [field-node-diagram-set — L645](field-node-diagram-set.md#^ref-22b989d5-645-0) (line 645, col 0, score 1)
- [field-node-diagram-visualizations — L535](field-node-diagram-visualizations.md#^ref-e9b27b06-535-0) (line 535, col 0, score 1)
- [Fnord Tracer Protocol — L1015](fnord-tracer-protocol.md#^ref-fc21f824-1015-0) (line 1015, col 0, score 1)
- [graph-ds — L877](graph-ds.md#^ref-6620e2f2-877-0) (line 877, col 0, score 1)
- [heartbeat-fragment-demo — L579](heartbeat-fragment-demo.md#^ref-dd00677a-579-0) (line 579, col 0, score 1)
- [homeostasis-decay-formulas — L917](homeostasis-decay-formulas.md#^ref-37b5d236-917-0) (line 917, col 0, score 1)
- [Prometheus Observability Stack — L932](prometheus-observability-stack.md#^ref-e90b5a16-932-0) (line 932, col 0, score 1)
- [Prompt_Folder_Bootstrap — L834](prompt-folder-bootstrap.md#^ref-bd4f0976-834-0) (line 834, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L546](protocol-0-the-contradiction-engine.md#^ref-9a93a756-546-0) (line 546, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L752](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-752-0) (line 752, col 0, score 1)
- [Pure TypeScript Search Microservice — L1009](pure-typescript-search-microservice.md#^ref-d17d3a96-1009-0) (line 1009, col 0, score 1)
- [ripple-propagation-demo — L590](ripple-propagation-demo.md#^ref-8430617b-590-0) (line 590, col 0, score 1)
- [schema-evolution-workflow — L747](schema-evolution-workflow.md#^ref-d8059b6a-747-0) (line 747, col 0, score 1)
- [sibilant-macro-targets — L878](sibilant-macro-targets.md#^ref-c5c9a5c6-878-0) (line 878, col 0, score 1)
- [eidolon-field-math-foundations — L841](eidolon-field-math-foundations.md#^ref-008f2ac0-841-0) (line 841, col 0, score 1)
- [Prometheus Observability Stack — L933](prometheus-observability-stack.md#^ref-e90b5a16-933-0) (line 933, col 0, score 1)
- [Prompt_Folder_Bootstrap — L835](prompt-folder-bootstrap.md#^ref-bd4f0976-835-0) (line 835, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L547](protocol-0-the-contradiction-engine.md#^ref-9a93a756-547-0) (line 547, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L753](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-753-0) (line 753, col 0, score 1)
- [Pure TypeScript Search Microservice — L1010](pure-typescript-search-microservice.md#^ref-d17d3a96-1010-0) (line 1010, col 0, score 1)
- [ripple-propagation-demo — L591](ripple-propagation-demo.md#^ref-8430617b-591-0) (line 591, col 0, score 1)
- [schema-evolution-workflow — L748](schema-evolution-workflow.md#^ref-d8059b6a-748-0) (line 748, col 0, score 1)
- [sibilant-macro-targets — L879](sibilant-macro-targets.md#^ref-c5c9a5c6-879-0) (line 879, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L636](chroma-toolkit-consolidation-plan.md#^ref-5020e892-636-0) (line 636, col 0, score 0.98)
- [Diagrams — L502](chunks/diagrams.md#^ref-45cd25b5-502-0) (line 502, col 0, score 0.98)
- [JavaScript — L396](chunks/javascript.md#^ref-c1618c66-396-0) (line 396, col 0, score 0.98)
- [Math Fundamentals — L362](chunks/math-fundamentals.md#^ref-c6e87433-362-0) (line 362, col 0, score 0.98)
- [Services — L283](chunks/services.md#^ref-75ea4a6a-283-0) (line 283, col 0, score 0.98)
- [field-dynamics-math-blocks — L877](field-dynamics-math-blocks.md#^ref-7cfc230d-877-0) (line 877, col 0, score 0.98)
- [field-interaction-equations — L907](field-interaction-equations.md#^ref-b09141b7-907-0) (line 907, col 0, score 0.98)
- [field-node-diagram-outline — L637](field-node-diagram-outline.md#^ref-1f32c94a-637-0) (line 637, col 0, score 0.98)
- [field-node-diagram-set — L648](field-node-diagram-set.md#^ref-22b989d5-648-0) (line 648, col 0, score 0.98)
- [field-node-diagram-visualizations — L538](field-node-diagram-visualizations.md#^ref-e9b27b06-538-0) (line 538, col 0, score 0.98)
- [Fnord Tracer Protocol — L1018](fnord-tracer-protocol.md#^ref-fc21f824-1018-0) (line 1018, col 0, score 0.98)
- [Admin Dashboard for User Management — L316](admin-dashboard-for-user-management.md#^ref-2901a3e9-316-0) (line 316, col 0, score 1)
- [plan-update-confirmation — L1331](plan-update-confirmation.md#^ref-b22d79c6-1331-0) (line 1331, col 0, score 1)
- [Promethean Dev Workflow Update — L427](promethean-dev-workflow-update.md#^ref-03a5578f-427-0) (line 427, col 0, score 0.98)
- [plan-update-confirmation — L1345](plan-update-confirmation.md#^ref-b22d79c6-1345-0) (line 1345, col 0, score 0.98)
- [Promethean Documentation Pipeline Overview — L410](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-410-0) (line 410, col 0, score 0.98)
- [Performance-Optimized-Polyglot-Bridge — L600](performance-optimized-polyglot-bridge.md#^ref-f5579967-600-0) (line 600, col 0, score 0.98)
- [Promethean Infrastructure Setup — L1011](promethean-infrastructure-setup.md#^ref-6deed6ac-1011-0) (line 1011, col 0, score 0.98)
- [Model Upgrade Calm-Down Guide — L392](model-upgrade-calm-down-guide.md#^ref-db74343f-392-0) (line 392, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L582](dynamic-context-model-for-web-components.md#^ref-f7702bf8-582-0) (line 582, col 0, score 0.98)
- [Mathematics Sampler — L224](mathematics-sampler.md#^ref-b5e0183e-224-0) (line 224, col 0, score 1)
- [Admin Dashboard for User Management — L265](admin-dashboard-for-user-management.md#^ref-2901a3e9-265-0) (line 265, col 0, score 1)
- [zero-copy-snapshots-and-workers — L686](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-686-0) (line 686, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L404](promethean-copilot-intent-engine.md#^ref-ae24a280-404-0) (line 404, col 0, score 1)
- [Prompt_Folder_Bootstrap — L557](prompt-folder-bootstrap.md#^ref-bd4f0976-557-0) (line 557, col 0, score 1)
- [Mathematical Samplers — L218](mathematical-samplers.md#^ref-86a691ec-218-0) (line 218, col 0, score 1)
- [schema-evolution-workflow — L816](schema-evolution-workflow.md#^ref-d8059b6a-816-0) (line 816, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L617](performance-optimized-polyglot-bridge.md#^ref-f5579967-617-0) (line 617, col 0, score 1)
- [Admin Dashboard for User Management — L256](admin-dashboard-for-user-management.md#^ref-2901a3e9-256-0) (line 256, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L517](layer1survivabilityenvelope.md#^ref-64a9f9f9-517-0) (line 517, col 0, score 1)
- [plan-update-confirmation — L1302](plan-update-confirmation.md#^ref-b22d79c6-1302-0) (line 1302, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L683](migrate-to-provider-tenant-architecture.md#^ref-54382370-683-0) (line 683, col 0, score 1)
- [Prompt_Folder_Bootstrap — L558](prompt-folder-bootstrap.md#^ref-bd4f0976-558-0) (line 558, col 0, score 1)
- [schema-evolution-workflow — L815](schema-evolution-workflow.md#^ref-d8059b6a-815-0) (line 815, col 0, score 1)
- [Mathematics Sampler — L223](mathematics-sampler.md#^ref-b5e0183e-223-0) (line 223, col 0, score 1)
- [Mathematical Samplers — L217](mathematical-samplers.md#^ref-86a691ec-217-0) (line 217, col 0, score 1)
- [Ice Box Reorganization — L327](ice-box-reorganization.md#^ref-291c7d91-327-0) (line 327, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L513](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-513-0) (line 513, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L274](promethean-copilot-intent-engine.md#^ref-ae24a280-274-0) (line 274, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L300](model-upgrade-calm-down-guide.md#^ref-db74343f-300-0) (line 300, col 0, score 1)
- [Admin Dashboard for User Management — L254](admin-dashboard-for-user-management.md#^ref-2901a3e9-254-0) (line 254, col 0, score 1)
- [Dynamic Context Model for Web Components — L565](dynamic-context-model-for-web-components.md#^ref-f7702bf8-565-0) (line 565, col 0, score 1)
- [Prompt_Folder_Bootstrap — L439](prompt-folder-bootstrap.md#^ref-bd4f0976-439-0) (line 439, col 0, score 1)
- [eidolon-field-math-foundations — L4121](eidolon-field-math-foundations.md#^ref-008f2ac0-4121-0) (line 4121, col 0, score 0.98)
- [ChatGPT Custom Prompts — L97](chatgpt-custom-prompts.md#^ref-930054b3-97-0) (line 97, col 0, score 1)
- [field-dynamics-math-blocks — L501](field-dynamics-math-blocks.md#^ref-7cfc230d-501-0) (line 501, col 0, score 1)
- [Promethean Dev Workflow Update — L3255](promethean-dev-workflow-update.md#^ref-03a5578f-3255-0) (line 3255, col 0, score 0.97)
- [Promethean Notes — L1087](promethean-notes.md#^ref-1c4046b5-1087-0) (line 1087, col 0, score 0.97)
- [Promethean Dev Workflow Update — L3588](promethean-dev-workflow-update.md#^ref-03a5578f-3588-0) (line 3588, col 0, score 0.97)
- [Tracing the Signal — L235](tracing-the-signal.md#^ref-c3cd4f65-235-0) (line 235, col 0, score 0.97)
- [Fnord Tracer Protocol — L500](fnord-tracer-protocol.md#^ref-fc21f824-500-0) (line 500, col 0, score 0.97)
- [plan-update-confirmation — L1802](plan-update-confirmation.md#^ref-b22d79c6-1802-0) (line 1802, col 0, score 0.97)
- [Canonical Org-Babel Matplotlib Animation Template — L284](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-284-0) (line 284, col 0, score 0.98)
- [obsidian-ignore-node-modules-regex — L286](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-286-0) (line 286, col 0, score 0.98)
- [ParticleSimulationWithCanvasAndFFmpeg — L433](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-433-0) (line 433, col 0, score 0.97)
- [Agent Reflections and Prompt Evolution — L504](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-504-0) (line 504, col 0, score 0.97)
- [Chroma Toolkit Consolidation Plan — L768](chroma-toolkit-consolidation-plan.md#^ref-5020e892-768-0) (line 768, col 0, score 0.97)
- [Canonical Org-Babel Matplotlib Animation Template — L377](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-377-0) (line 377, col 0, score 0.97)
- [Debugging Broker Connections and Agent Behavior — L339](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-339-0) (line 339, col 0, score 0.96)
- [ParticleSimulationWithCanvasAndFFmpeg — L465](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-465-0) (line 465, col 0, score 0.95)
- [i3-bluetooth-setup — L380](i3-bluetooth-setup.md#^ref-5e408692-380-0) (line 380, col 0, score 0.95)
- [Admin Dashboard for User Management — L260](admin-dashboard-for-user-management.md#^ref-2901a3e9-260-0) (line 260, col 0, score 1)
- [Stateful Partitions and Rebalancing — L870](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-870-0) (line 870, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L447](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-447-0) (line 447, col 0, score 1)
- [Duck's Attractor States — L271](ducks-attractor-states.md#^ref-13951643-271-0) (line 271, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L373](model-upgrade-calm-down-guide.md#^ref-db74343f-373-0) (line 373, col 0, score 1)
- [Prompt_Folder_Bootstrap — L505](prompt-folder-bootstrap.md#^ref-bd4f0976-505-0) (line 505, col 0, score 1)
- [typed-struct-compiler — L672](typed-struct-compiler.md#^ref-78eeedf7-672-0) (line 672, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L196](ducks-self-referential-perceptual-loop.md#^ref-71726f04-196-0) (line 196, col 0, score 1)
- [Prompt_Folder_Bootstrap — L431](prompt-folder-bootstrap.md#^ref-bd4f0976-431-0) (line 431, col 0, score 0.96)
- [Promethean Dev Workflow Update — L3359](promethean-dev-workflow-update.md#^ref-03a5578f-3359-0) (line 3359, col 0, score 0.96)
- [The Jar of Echoes — L3276](the-jar-of-echoes.md#^ref-18138627-3276-0) (line 3276, col 0, score 0.96)
- [Duck's Attractor States — L239](ducks-attractor-states.md#^ref-13951643-239-0) (line 239, col 0, score 1)
- [Promethean Infrastructure Setup — L999](promethean-infrastructure-setup.md#^ref-6deed6ac-999-0) (line 999, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L379](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-379-0) (line 379, col 0, score 1)
- [Dynamic Context Model for Web Components — L716](dynamic-context-model-for-web-components.md#^ref-f7702bf8-716-0) (line 716, col 0, score 1)
- [windows-tiling-with-autohotkey — L466](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-466-0) (line 466, col 0, score 0.94)
- [windows-tiling-with-autohotkey — L4500](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-4500-0) (line 4500, col 0, score 0.94)
- [The Jar of Echoes — L3757](the-jar-of-echoes.md#^ref-18138627-3757-0) (line 3757, col 0, score 0.94)
- [windows-tiling-with-autohotkey — L2220](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2220-0) (line 2220, col 0, score 0.94)
- [windows-tiling-with-autohotkey — L3998](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-3998-0) (line 3998, col 0, score 0.94)
- [The Jar of Echoes — L3797](the-jar-of-echoes.md#^ref-18138627-3797-0) (line 3797, col 0, score 0.94)
- [windows-tiling-with-autohotkey — L4129](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-4129-0) (line 4129, col 0, score 0.94)
- [The Jar of Echoes — L3868](the-jar-of-echoes.md#^ref-18138627-3868-0) (line 3868, col 0, score 0.94)
- [Model Upgrade Calm-Down Guide — L318](model-upgrade-calm-down-guide.md#^ref-db74343f-318-0) (line 318, col 0, score 1)
- [plan-update-confirmation — L1183](plan-update-confirmation.md#^ref-b22d79c6-1183-0) (line 1183, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L345](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-345-0) (line 345, col 0, score 1)
- [Eidolon Field Abstract Model — L555](eidolon-field-abstract-model.md#^ref-5e8b2388-555-0) (line 555, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L733](performance-optimized-polyglot-bridge.md#^ref-f5579967-733-0) (line 733, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L186](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-186-0) (line 186, col 0, score 1)
- [windows-tiling-with-autohotkey — L2099](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2099-0) (line 2099, col 0, score 0.97)
- [Promethean Dev Workflow Update — L1997](promethean-dev-workflow-update.md#^ref-03a5578f-1997-0) (line 1997, col 0, score 0.97)
- [Layer1SurvivabilityEnvelope — L487](layer1survivabilityenvelope.md#^ref-64a9f9f9-487-0) (line 487, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L367](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-367-0) (line 367, col 0, score 1)
- [Dynamic Context Model for Web Components — L1128](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1128-0) (line 1128, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L299](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-299-0) (line 299, col 0, score 1)
- [Ice Box Reorganization — L378](ice-box-reorganization.md#^ref-291c7d91-378-0) (line 378, col 0, score 1)
- [Pipeline Enhancements — L95](pipeline-enhancements.md#^ref-e2135d9f-95-0) (line 95, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L479](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-479-0) (line 479, col 0, score 1)
- [Docops Feature Updates — L97](docops-feature-updates-3.md#^ref-cdbd21ee-97-0) (line 97, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L647](performance-optimized-polyglot-bridge.md#^ref-f5579967-647-0) (line 647, col 0, score 1)
- [Admin Dashboard for User Management — L317](admin-dashboard-for-user-management.md#^ref-2901a3e9-317-0) (line 317, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L606](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-606-0) (line 606, col 0, score 1)
- [schema-evolution-workflow — L790](schema-evolution-workflow.md#^ref-d8059b6a-790-0) (line 790, col 0, score 1)
- [Promethean Infrastructure Setup — L1075](promethean-infrastructure-setup.md#^ref-6deed6ac-1075-0) (line 1075, col 0, score 0.96)
- [Per-Domain Policy System for JS Crawler — L874](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-874-0) (line 874, col 0, score 0.96)
- [Dynamic Context Model for Web Components — L748](dynamic-context-model-for-web-components.md#^ref-f7702bf8-748-0) (line 748, col 0, score 0.96)
- [Prometheus Observability Stack — L680](prometheus-observability-stack.md#^ref-e90b5a16-680-0) (line 680, col 0, score 0.96)
- [Promethean Infrastructure Setup — L1102](promethean-infrastructure-setup.md#^ref-6deed6ac-1102-0) (line 1102, col 0, score 0.95)
- [Functional Embedding Pipeline Refactor — L527](functional-embedding-pipeline-refactor.md#^ref-a4a25141-527-0) (line 527, col 0, score 1)
- [Docops Feature Updates — L134](docops-feature-updates-3.md#^ref-cdbd21ee-134-0) (line 134, col 0, score 1)
- [Docops Feature Updates — L192](docops-feature-updates.md#^ref-2792d448-192-0) (line 192, col 0, score 1)
- [Pure TypeScript Search Microservice — L871](pure-typescript-search-microservice.md#^ref-d17d3a96-871-0) (line 871, col 0, score 0.97)
- [Dynamic Context Model for Web Components — L888](dynamic-context-model-for-web-components.md#^ref-f7702bf8-888-0) (line 888, col 0, score 0.97)
- [field-dynamics-math-blocks — L593](field-dynamics-math-blocks.md#^ref-7cfc230d-593-0) (line 593, col 0, score 0.95)
- [field-interaction-equations — L641](field-interaction-equations.md#^ref-b09141b7-641-0) (line 641, col 0, score 0.95)
- [Promethean Dev Workflow Update — L3483](promethean-dev-workflow-update.md#^ref-03a5578f-3483-0) (line 3483, col 0, score 0.93)
- [Promethean Dev Workflow Update — L3746](promethean-dev-workflow-update.md#^ref-03a5578f-3746-0) (line 3746, col 0, score 0.93)
- [Admin Dashboard for User Management — L278](admin-dashboard-for-user-management.md#^ref-2901a3e9-278-0) (line 278, col 0, score 0.98)
- [sibilant-macro-targets — L479](sibilant-macro-targets.md#^ref-c5c9a5c6-479-0) (line 479, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L951](migrate-to-provider-tenant-architecture.md#^ref-54382370-951-0) (line 951, col 0, score 0.98)
- [Provider-Agnostic Chat Panel Implementation — L512](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-512-0) (line 512, col 0, score 0.98)
- [Promethean State Format — L353](promethean-state-format.md#^ref-23df6ddb-353-0) (line 353, col 0, score 0.98)
- [komorebi-group-window-hack — L455](komorebi-group-window-hack.md#^ref-dd89372d-455-0) (line 455, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L343](chroma-toolkit-consolidation-plan.md#^ref-5020e892-343-0) (line 343, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L623](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-623-0) (line 623, col 0, score 0.99)
- [Eidolon Field Abstract Model — L462](eidolon-field-abstract-model.md#^ref-5e8b2388-462-0) (line 462, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L759](migrate-to-provider-tenant-architecture.md#^ref-54382370-759-0) (line 759, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L612](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-612-0) (line 612, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L628](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-628-0) (line 628, col 0, score 0.98)
- [obsidian-ignore-node-modules-regex — L256](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-256-0) (line 256, col 0, score 0.99)
- [Model Upgrade Calm-Down Guide — L384](model-upgrade-calm-down-guide.md#^ref-db74343f-384-0) (line 384, col 0, score 0.97)
- [Prompt_Folder_Bootstrap — L425](prompt-folder-bootstrap.md#^ref-bd4f0976-425-0) (line 425, col 0, score 0.98)
- [Per-Domain Policy System for JS Crawler — L814](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-814-0) (line 814, col 0, score 0.99)
- [plan-update-confirmation — L1736](plan-update-confirmation.md#^ref-b22d79c6-1736-0) (line 1736, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L398](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-398-0) (line 398, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L372](model-upgrade-calm-down-guide.md#^ref-db74343f-372-0) (line 372, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L333](promethean-copilot-intent-engine.md#^ref-ae24a280-333-0) (line 333, col 0, score 1)
- [Dynamic Context Model for Web Components — L727](dynamic-context-model-for-web-components.md#^ref-f7702bf8-727-0) (line 727, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L662](performance-optimized-polyglot-bridge.md#^ref-f5579967-662-0) (line 662, col 0, score 0.99)
- [Promethean Dev Workflow Update — L292](promethean-dev-workflow-update.md#^ref-03a5578f-292-0) (line 292, col 0, score 0.99)
- [Model Upgrade Calm-Down Guide — L374](model-upgrade-calm-down-guide.md#^ref-db74343f-374-0) (line 374, col 0, score 0.99)
- [Prompt_Folder_Bootstrap — L429](prompt-folder-bootstrap.md#^ref-bd4f0976-429-0) (line 429, col 0, score 1)
- [eidolon-field-math-foundations — L7440](eidolon-field-math-foundations.md#^ref-008f2ac0-7440-0) (line 7440, col 0, score 0.95)
- [Promethean Dev Workflow Update — L4875](promethean-dev-workflow-update.md#^ref-03a5578f-4875-0) (line 4875, col 0, score 0.94)
- [windows-tiling-with-autohotkey — L4108](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-4108-0) (line 4108, col 0, score 0.94)
- [Canonical Org-Babel Matplotlib Animation Template — L1281](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-1281-0) (line 1281, col 0, score 0.94)
- [Creative Moments — L432](creative-moments.md#^ref-10d98225-432-0) (line 432, col 0, score 0.94)
- [Duck's Attractor States — L1068](ducks-attractor-states.md#^ref-13951643-1068-0) (line 1068, col 0, score 0.94)
- [eidolon-field-math-foundations — L2278](eidolon-field-math-foundations.md#^ref-008f2ac0-2278-0) (line 2278, col 0, score 0.94)
- [Functional Refactor of TypeScript Document Processing — L1034](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-1034-0) (line 1034, col 0, score 0.94)
- [Factorio AI with External Agents — L424](factorio-ai-with-external-agents.md#^ref-a4d90289-424-0) (line 424, col 0, score 1)
- [Admin Dashboard for User Management — L215](admin-dashboard-for-user-management.md#^ref-2901a3e9-215-0) (line 215, col 0, score 1)
- [Prometheus Observability Stack — L762](prometheus-observability-stack.md#^ref-e90b5a16-762-0) (line 762, col 0, score 1)
- [windows-tiling-with-autohotkey — L351](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-351-0) (line 351, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L493](chroma-toolkit-consolidation-plan.md#^ref-5020e892-493-0) (line 493, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L406](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-406-0) (line 406, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L321](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-321-0) (line 321, col 0, score 1)
- [Duck's Attractor States — L4222](ducks-attractor-states.md#^ref-13951643-4222-0) (line 4222, col 0, score 0.97)
- [eidolon-field-math-foundations — L7058](eidolon-field-math-foundations.md#^ref-008f2ac0-7058-0) (line 7058, col 0, score 0.97)
- [Dynamic Context Model for Web Components — L607](dynamic-context-model-for-web-components.md#^ref-f7702bf8-607-0) (line 607, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L515](chroma-toolkit-consolidation-plan.md#^ref-5020e892-515-0) (line 515, col 0, score 1)
- [i3-bluetooth-setup — L387](i3-bluetooth-setup.md#^ref-5e408692-387-0) (line 387, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L644](migrate-to-provider-tenant-architecture.md#^ref-54382370-644-0) (line 644, col 0, score 1)
- [eidolon-field-math-foundations — L6735](eidolon-field-math-foundations.md#^ref-008f2ac0-6735-0) (line 6735, col 0, score 0.99)
- [Duck's Attractor States — L3551](ducks-attractor-states.md#^ref-13951643-3551-0) (line 3551, col 0, score 0.99)
- [eidolon-field-math-foundations — L5413](eidolon-field-math-foundations.md#^ref-008f2ac0-5413-0) (line 5413, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L3911](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-3911-0) (line 3911, col 0, score 0.99)
- [Admin Dashboard for User Management — L272](admin-dashboard-for-user-management.md#^ref-2901a3e9-272-0) (line 272, col 0, score 1)
- [Fnord Tracer Protocol — L414](fnord-tracer-protocol.md#^ref-fc21f824-414-0) (line 414, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L252](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-252-0) (line 252, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L231](model-upgrade-calm-down-guide.md#^ref-db74343f-231-0) (line 231, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L249](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-249-0) (line 249, col 0, score 0.97)
- [plan-update-confirmation — L1746](plan-update-confirmation.md#^ref-b22d79c6-1746-0) (line 1746, col 0, score 0.97)
- [TypeScript Patch for Tool Calling Support — L886](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-886-0) (line 886, col 0, score 0.97)
- [Dynamic Context Model for Web Components — L770](dynamic-context-model-for-web-components.md#^ref-f7702bf8-770-0) (line 770, col 0, score 0.97)
- [plan-update-confirmation — L1294](plan-update-confirmation.md#^ref-b22d79c6-1294-0) (line 1294, col 0, score 0.97)
- [Model Upgrade Calm-Down Guide — L359](model-upgrade-calm-down-guide.md#^ref-db74343f-359-0) (line 359, col 0, score 1)
- [Prompt_Folder_Bootstrap — L492](prompt-folder-bootstrap.md#^ref-bd4f0976-492-0) (line 492, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L357](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-357-0) (line 357, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L432](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-432-0) (line 432, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L394](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-394-0) (line 394, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L574](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-574-0) (line 574, col 0, score 1)
- [Dynamic Context Model for Web Components — L1216](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1216-0) (line 1216, col 0, score 1)
- [plan-update-confirmation — L1159](plan-update-confirmation.md#^ref-b22d79c6-1159-0) (line 1159, col 0, score 1)
- [schema-evolution-workflow — L818](schema-evolution-workflow.md#^ref-d8059b6a-818-0) (line 818, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L909](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-909-0) (line 909, col 0, score 0.99)
- [schema-evolution-workflow — L827](schema-evolution-workflow.md#^ref-d8059b6a-827-0) (line 827, col 0, score 1)
- [Stateful Partitions and Rebalancing — L984](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-984-0) (line 984, col 0, score 0.99)
- [plan-update-confirmation — L1576](plan-update-confirmation.md#^ref-b22d79c6-1576-0) (line 1576, col 0, score 0.97)
- [plan-update-confirmation — L1463](plan-update-confirmation.md#^ref-b22d79c6-1463-0) (line 1463, col 0, score 0.95)
- [Fnord Tracer Protocol — L395](fnord-tracer-protocol.md#^ref-fc21f824-395-0) (line 395, col 0, score 0.95)
- [Fnord Tracer Protocol — L754](fnord-tracer-protocol.md#^ref-fc21f824-754-0) (line 754, col 0, score 0.95)
- [windows-tiling-with-autohotkey — L436](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-436-0) (line 436, col 0, score 0.94)
- [Agent Tasks: Persistence Migration to DualStore — L294](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-294-0) (line 294, col 0, score 0.94)
- [TypeScript Patch for Tool Calling Support — L802](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-802-0) (line 802, col 0, score 0.94)
- [windows-tiling-with-autohotkey — L2651](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2651-0) (line 2651, col 0, score 0.94)
- [plan-update-confirmation — L1554](plan-update-confirmation.md#^ref-b22d79c6-1554-0) (line 1554, col 0, score 1)
- [Dynamic Context Model for Web Components — L1064](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1064-0) (line 1064, col 0, score 1)
- [Factorio AI with External Agents — L338](factorio-ai-with-external-agents.md#^ref-a4d90289-338-0) (line 338, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L482](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-482-0) (line 482, col 0, score 1)
- [windows-tiling-with-autohotkey — L385](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-385-0) (line 385, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L868](migrate-to-provider-tenant-architecture.md#^ref-54382370-868-0) (line 868, col 0, score 0.98)
- [Performance-Optimized-Polyglot-Bridge — L657](performance-optimized-polyglot-bridge.md#^ref-f5579967-657-0) (line 657, col 0, score 0.98)
- [Agent Tasks: Persistence Migration to DualStore — L359](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-359-0) (line 359, col 0, score 0.97)
- [Functional Embedding Pipeline Refactor — L592](functional-embedding-pipeline-refactor.md#^ref-a4a25141-592-0) (line 592, col 0, score 1)
- [typed-struct-compiler — L657](typed-struct-compiler.md#^ref-78eeedf7-657-0) (line 657, col 0, score 1)
- [graph-ds — L559](graph-ds.md#^ref-6620e2f2-559-0) (line 559, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L453](chroma-toolkit-consolidation-plan.md#^ref-5020e892-453-0) (line 453, col 0, score 1)
- [plan-update-confirmation — L1414](plan-update-confirmation.md#^ref-b22d79c6-1414-0) (line 1414, col 0, score 1)
- [schema-evolution-workflow — L785](schema-evolution-workflow.md#^ref-d8059b6a-785-0) (line 785, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L708](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-708-0) (line 708, col 0, score 1)
- [Factorio AI with External Agents — L400](factorio-ai-with-external-agents.md#^ref-a4d90289-400-0) (line 400, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L435](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-435-0) (line 435, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L332](model-upgrade-calm-down-guide.md#^ref-db74343f-332-0) (line 332, col 0, score 1)
- [Promethean Dev Workflow Update — L358](promethean-dev-workflow-update.md#^ref-03a5578f-358-0) (line 358, col 0, score 1)
- [typed-struct-compiler — L719](typed-struct-compiler.md#^ref-78eeedf7-719-0) (line 719, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L830](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-830-0) (line 830, col 0, score 1)
- [ChatGPT Custom Prompts — L98](chatgpt-custom-prompts.md#^ref-930054b3-98-0) (line 98, col 0, score 1)
- [plan-update-confirmation — L1240](plan-update-confirmation.md#^ref-b22d79c6-1240-0) (line 1240, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L302](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-302-0) (line 302, col 0, score 1)
- [Dynamic Context Model for Web Components — L875](dynamic-context-model-for-web-components.md#^ref-f7702bf8-875-0) (line 875, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L623](performance-optimized-polyglot-bridge.md#^ref-f5579967-623-0) (line 623, col 0, score 1)
- [Promethean Infrastructure Setup — L1489](promethean-infrastructure-setup.md#^ref-6deed6ac-1489-0) (line 1489, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L808](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-808-0) (line 808, col 0, score 1)
- [Promethean State Format — L245](promethean-state-format.md#^ref-23df6ddb-245-0) (line 245, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L833](migrate-to-provider-tenant-architecture.md#^ref-54382370-833-0) (line 833, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L395](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-395-0) (line 395, col 0, score 1)
- [plan-update-confirmation — L1283](plan-update-confirmation.md#^ref-b22d79c6-1283-0) (line 1283, col 0, score 1)
- [plan-update-confirmation — L1634](plan-update-confirmation.md#^ref-b22d79c6-1634-0) (line 1634, col 0, score 1)
- [Promethean Dev Workflow Update — L227](promethean-dev-workflow-update.md#^ref-03a5578f-227-0) (line 227, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L322](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-322-0) (line 322, col 0, score 1)
- [windows-tiling-with-autohotkey — L350](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-350-0) (line 350, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L370](chroma-toolkit-consolidation-plan.md#^ref-5020e892-370-0) (line 370, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1066](migrate-to-provider-tenant-architecture.md#^ref-54382370-1066-0) (line 1066, col 0, score 1)
- [zero-copy-snapshots-and-workers — L627](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-627-0) (line 627, col 0, score 1)
- [Pure TypeScript Search Microservice — L820](pure-typescript-search-microservice.md#^ref-d17d3a96-820-0) (line 820, col 0, score 1)
- [Promethean Infrastructure Setup — L881](promethean-infrastructure-setup.md#^ref-6deed6ac-881-0) (line 881, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L331](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-331-0) (line 331, col 0, score 1)
- [OpenAPI Validation Report — L110](openapi-validation-report.md#^ref-5c152b08-110-0) (line 110, col 0, score 1)
- [schema-evolution-workflow — L937](schema-evolution-workflow.md#^ref-d8059b6a-937-0) (line 937, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L363](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-363-0) (line 363, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L332](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-332-0) (line 332, col 0, score 1)
- [Dynamic Context Model for Web Components — L747](dynamic-context-model-for-web-components.md#^ref-f7702bf8-747-0) (line 747, col 0, score 1)
- [graph-ds — L528](graph-ds.md#^ref-6620e2f2-528-0) (line 528, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L475](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-475-0) (line 475, col 0, score 0.97)
- [Promethean-Copilot-Intent-Engine — L499](promethean-copilot-intent-engine.md#^ref-ae24a280-499-0) (line 499, col 0, score 0.97)
- [plan-update-confirmation — L1871](plan-update-confirmation.md#^ref-b22d79c6-1871-0) (line 1871, col 0, score 0.97)
- [Model Upgrade Calm-Down Guide — L336](model-upgrade-calm-down-guide.md#^ref-db74343f-336-0) (line 336, col 0, score 0.98)
- [Agent Tasks: Persistence Migration to DualStore — L523](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-523-0) (line 523, col 0, score 0.97)
- [Unique Info Dump Index — L331](unique-info-dump-index.md#^ref-30ec3ba6-331-0) (line 331, col 0, score 0.97)
- [Per-Domain Policy System for JS Crawler — L617](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-617-0) (line 617, col 0, score 0.96)
- [Per-Domain Policy System for JS Crawler — L722](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-722-0) (line 722, col 0, score 0.96)
- [Dynamic Context Model for Web Components — L925](dynamic-context-model-for-web-components.md#^ref-f7702bf8-925-0) (line 925, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L479](functional-embedding-pipeline-refactor.md#^ref-a4a25141-479-0) (line 479, col 0, score 1)
- [typed-struct-compiler — L583](typed-struct-compiler.md#^ref-78eeedf7-583-0) (line 583, col 0, score 1)
- [plan-update-confirmation — L1626](plan-update-confirmation.md#^ref-b22d79c6-1626-0) (line 1626, col 0, score 1)
- [windows-tiling-with-autohotkey — L1952](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-1952-0) (line 1952, col 0, score 0.97)
- [Promethean Dev Workflow Update — L1933](promethean-dev-workflow-update.md#^ref-03a5578f-1933-0) (line 1933, col 0, score 0.97)
- [Factorio AI with External Agents — L391](factorio-ai-with-external-agents.md#^ref-a4d90289-391-0) (line 391, col 0, score 0.97)
- [Promethean Infrastructure Setup — L1064](promethean-infrastructure-setup.md#^ref-6deed6ac-1064-0) (line 1064, col 0, score 0.97)
- [obsidian-ignore-node-modules-regex — L218](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-218-0) (line 218, col 0, score 0.97)
- [typed-struct-compiler — L623](typed-struct-compiler.md#^ref-78eeedf7-623-0) (line 623, col 0, score 1)
- [graph-ds — L554](graph-ds.md#^ref-6620e2f2-554-0) (line 554, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L476](functional-embedding-pipeline-refactor.md#^ref-a4a25141-476-0) (line 476, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L339](chroma-toolkit-consolidation-plan.md#^ref-5020e892-339-0) (line 339, col 0, score 1)
- [Promethean Infrastructure Setup — L940](promethean-infrastructure-setup.md#^ref-6deed6ac-940-0) (line 940, col 0, score 0.96)
- [typed-struct-compiler — L578](typed-struct-compiler.md#^ref-78eeedf7-578-0) (line 578, col 0, score 0.93)
- [Migrate to Provider-Tenant Architecture — L968](migrate-to-provider-tenant-architecture.md#^ref-54382370-968-0) (line 968, col 0, score 0.93)
- [The Jar of Echoes — L2331](the-jar-of-echoes.md#^ref-18138627-2331-0) (line 2331, col 0, score 0.93)
- [typed-struct-compiler — L624](typed-struct-compiler.md#^ref-78eeedf7-624-0) (line 624, col 0, score 1)
- [graph-ds — L555](graph-ds.md#^ref-6620e2f2-555-0) (line 555, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L477](functional-embedding-pipeline-refactor.md#^ref-a4a25141-477-0) (line 477, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L340](chroma-toolkit-consolidation-plan.md#^ref-5020e892-340-0) (line 340, col 0, score 1)
- [i3-bluetooth-setup — L381](i3-bluetooth-setup.md#^ref-5e408692-381-0) (line 381, col 0, score 0.98)
- [Promethean Dev Workflow Update — L2610](promethean-dev-workflow-update.md#^ref-03a5578f-2610-0) (line 2610, col 0, score 0.96)
- [Tracing the Signal — L420](tracing-the-signal.md#^ref-c3cd4f65-420-0) (line 420, col 0, score 0.96)
- [i3-bluetooth-setup — L350](i3-bluetooth-setup.md#^ref-5e408692-350-0) (line 350, col 0, score 0.97)
- [typed-struct-compiler — L625](typed-struct-compiler.md#^ref-78eeedf7-625-0) (line 625, col 0, score 0.96)
- [Functional Embedding Pipeline Refactor — L478](functional-embedding-pipeline-refactor.md#^ref-a4a25141-478-0) (line 478, col 0, score 0.96)
- [Dynamic Context Model for Web Components — L1228](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1228-0) (line 1228, col 0, score 0.98)
- [Stateful Partitions and Rebalancing — L906](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-906-0) (line 906, col 0, score 0.97)
- [Functional Embedding Pipeline Refactor — L474](functional-embedding-pipeline-refactor.md#^ref-a4a25141-474-0) (line 474, col 0, score 0.97)
- [windows-tiling-with-autohotkey — L342](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-342-0) (line 342, col 0, score 0.97)
- [Dynamic Context Model for Web Components — L923](dynamic-context-model-for-web-components.md#^ref-f7702bf8-923-0) (line 923, col 0, score 0.97)
- [ChatGPT Custom Prompts — L106](chatgpt-custom-prompts.md#^ref-930054b3-106-0) (line 106, col 0, score 0.97)
- [Promethean-Copilot-Intent-Engine — L262](promethean-copilot-intent-engine.md#^ref-ae24a280-262-0) (line 262, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L481](chroma-toolkit-consolidation-plan.md#^ref-5020e892-481-0) (line 481, col 0, score 1)
- [Stateful Partitions and Rebalancing — L982](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-982-0) (line 982, col 0, score 1)
- [komorebi-group-window-hack — L432](komorebi-group-window-hack.md#^ref-dd89372d-432-0) (line 432, col 0, score 1)
- [Promethean Infrastructure Setup — L1084](promethean-infrastructure-setup.md#^ref-6deed6ac-1084-0) (line 1084, col 0, score 1)
- [Pure TypeScript Search Microservice — L740](pure-typescript-search-microservice.md#^ref-d17d3a96-740-0) (line 740, col 0, score 1)
- [zero-copy-snapshots-and-workers — L525](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-525-0) (line 525, col 0, score 1)
- [Prometheus Observability Stack — L797](prometheus-observability-stack.md#^ref-e90b5a16-797-0) (line 797, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L348](layer1survivabilityenvelope.md#^ref-64a9f9f9-348-0) (line 348, col 0, score 1)
- [Prometheus Observability Stack — L801](prometheus-observability-stack.md#^ref-e90b5a16-801-0) (line 801, col 0, score 1)
- [i3-bluetooth-setup — L417](i3-bluetooth-setup.md#^ref-5e408692-417-0) (line 417, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L255](promethean-copilot-intent-engine.md#^ref-ae24a280-255-0) (line 255, col 0, score 1)
- [Pure TypeScript Search Microservice — L948](pure-typescript-search-microservice.md#^ref-d17d3a96-948-0) (line 948, col 0, score 0.96)
- [Stateful Partitions and Rebalancing — L821](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-821-0) (line 821, col 0, score 0.96)
- [Admin Dashboard for User Management — L240](admin-dashboard-for-user-management.md#^ref-2901a3e9-240-0) (line 240, col 0, score 0.96)
- [Agent Tasks: Persistence Migration to DualStore — L356](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-356-0) (line 356, col 0, score 0.96)
- [plan-update-confirmation — L1685](plan-update-confirmation.md#^ref-b22d79c6-1685-0) (line 1685, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L474](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-474-0) (line 474, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L298](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-298-0) (line 298, col 0, score 1)
- [Promethean Infrastructure Setup — L961](promethean-infrastructure-setup.md#^ref-6deed6ac-961-0) (line 961, col 0, score 1)
- [Promethean Dev Workflow Update — L221](promethean-dev-workflow-update.md#^ref-03a5578f-221-0) (line 221, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L1350](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-1350-0) (line 1350, col 0, score 0.98)
- [Creative Moments — L963](creative-moments.md#^ref-10d98225-963-0) (line 963, col 0, score 0.98)
- [eidolon-field-math-foundations — L1520](eidolon-field-math-foundations.md#^ref-008f2ac0-1520-0) (line 1520, col 0, score 0.98)
- [Promethean Chat Activity Report — L557](promethean-chat-activity-report.md#^ref-18344cf9-557-0) (line 557, col 0, score 0.98)
- [Chroma Toolkit Consolidation Plan — L366](chroma-toolkit-consolidation-plan.md#^ref-5020e892-366-0) (line 366, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L229](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-229-0) (line 229, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1065](migrate-to-provider-tenant-architecture.md#^ref-54382370-1065-0) (line 1065, col 0, score 1)
- [Pure TypeScript Search Microservice — L821](pure-typescript-search-microservice.md#^ref-d17d3a96-821-0) (line 821, col 0, score 1)
- [Promethean Infrastructure Setup — L931](promethean-infrastructure-setup.md#^ref-6deed6ac-931-0) (line 931, col 0, score 1)
- [Promethean Infrastructure Setup — L838](promethean-infrastructure-setup.md#^ref-6deed6ac-838-0) (line 838, col 0, score 0.94)
- [plan-update-confirmation — L1468](plan-update-confirmation.md#^ref-b22d79c6-1468-0) (line 1468, col 0, score 0.96)
- [Post-Linguistic Transhuman Design Frameworks — L324](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-324-0) (line 324, col 0, score 0.94)
- [Pure TypeScript Search Microservice — L967](pure-typescript-search-microservice.md#^ref-d17d3a96-967-0) (line 967, col 0, score 0.94)
- [Layer1SurvivabilityEnvelope — L349](layer1survivabilityenvelope.md#^ref-64a9f9f9-349-0) (line 349, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L378](promethean-copilot-intent-engine.md#^ref-ae24a280-378-0) (line 378, col 0, score 1)
- [field-node-diagram-set — L355](field-node-diagram-set.md#^ref-22b989d5-355-0) (line 355, col 0, score 1)
- [graph-ds — L522](graph-ds.md#^ref-6620e2f2-522-0) (line 522, col 0, score 1)
- [Optimizing Command Limitations in System Design — L186](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-186-0) (line 186, col 0, score 1)
- [Duck's Attractor States — L2056](ducks-attractor-states.md#^ref-13951643-2056-0) (line 2056, col 0, score 0.97)
- [Canonical Org-Babel Matplotlib Animation Template — L2497](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-2497-0) (line 2497, col 0, score 0.96)
- [Duck's Attractor States — L2052](ducks-attractor-states.md#^ref-13951643-2052-0) (line 2052, col 0, score 0.96)
- [plan-update-confirmation — L1687](plan-update-confirmation.md#^ref-b22d79c6-1687-0) (line 1687, col 0, score 1)
- [The Jar of Echoes — L2927](the-jar-of-echoes.md#^ref-18138627-2927-0) (line 2927, col 0, score 0.96)
- [windows-tiling-with-autohotkey — L3618](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-3618-0) (line 3618, col 0, score 0.95)
- [windows-tiling-with-autohotkey — L3632](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-3632-0) (line 3632, col 0, score 0.95)
- [windows-tiling-with-autohotkey — L3623](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-3623-0) (line 3623, col 0, score 0.95)
- [eidolon-field-math-foundations — L6829](eidolon-field-math-foundations.md#^ref-008f2ac0-6829-0) (line 6829, col 0, score 0.95)
- [Promethean Dev Workflow Update — L3712](promethean-dev-workflow-update.md#^ref-03a5578f-3712-0) (line 3712, col 0, score 0.95)
- [windows-tiling-with-autohotkey — L3658](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-3658-0) (line 3658, col 0, score 0.95)
- [graph-ds — L600](graph-ds.md#^ref-6620e2f2-600-0) (line 600, col 0, score 1)
- [Optimizing Command Limitations in System Design — L191](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-191-0) (line 191, col 0, score 1)
- [Admin Dashboard for User Management — L280](admin-dashboard-for-user-management.md#^ref-2901a3e9-280-0) (line 280, col 0, score 1)
- [JavaScript — L151](chunks/javascript.md#^ref-c1618c66-151-0) (line 151, col 0, score 0.99)
- [typed-struct-compiler — L775](typed-struct-compiler.md#^ref-78eeedf7-775-0) (line 775, col 0, score 0.99)
- [Unique Info Dump Index — L424](unique-info-dump-index.md#^ref-30ec3ba6-424-0) (line 424, col 0, score 0.99)
- [sibilant-macro-targets — L326](sibilant-macro-targets.md#^ref-c5c9a5c6-326-0) (line 326, col 0, score 0.98)
- [typed-struct-compiler — L531](typed-struct-compiler.md#^ref-78eeedf7-531-0) (line 531, col 0, score 0.98)
- [graph-ds — L601](graph-ds.md#^ref-6620e2f2-601-0) (line 601, col 0, score 1)
- [Optimizing Command Limitations in System Design — L192](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-192-0) (line 192, col 0, score 1)
- [Admin Dashboard for User Management — L281](admin-dashboard-for-user-management.md#^ref-2901a3e9-281-0) (line 281, col 0, score 1)
- [typed-struct-compiler — L776](typed-struct-compiler.md#^ref-78eeedf7-776-0) (line 776, col 0, score 0.99)
- [Unique Info Dump Index — L425](unique-info-dump-index.md#^ref-30ec3ba6-425-0) (line 425, col 0, score 0.99)
- [eidolon-field-math-foundations — L6337](eidolon-field-math-foundations.md#^ref-008f2ac0-6337-0) (line 6337, col 0, score 0.95)
- [Promethean Dev Workflow Update — L4806](promethean-dev-workflow-update.md#^ref-03a5578f-4806-0) (line 4806, col 0, score 0.95)
- [windows-tiling-with-autohotkey — L4038](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-4038-0) (line 4038, col 0, score 0.95)
- [The Jar of Echoes — L2945](the-jar-of-echoes.md#^ref-18138627-2945-0) (line 2945, col 0, score 0.95)
- [Admin Dashboard for User Management — L282](admin-dashboard-for-user-management.md#^ref-2901a3e9-282-0) (line 282, col 0, score 1)
- [graph-ds — L602](graph-ds.md#^ref-6620e2f2-602-0) (line 602, col 0, score 1)
- [JavaScript — L152](chunks/javascript.md#^ref-c1618c66-152-0) (line 152, col 0, score 0.99)
- [Unique Info Dump Index — L426](unique-info-dump-index.md#^ref-30ec3ba6-426-0) (line 426, col 0, score 0.99)
- [Functional Embedding Pipeline Refactor — L472](functional-embedding-pipeline-refactor.md#^ref-a4a25141-472-0) (line 472, col 0, score 0.99)
- [Ice Box Reorganization — L298](ice-box-reorganization.md#^ref-291c7d91-298-0) (line 298, col 0, score 0.98)
- [DSL — L336](chunks/dsl.md#^ref-e87bc036-336-0) (line 336, col 0, score 0.98)
- [Duck's Self-Referential Perceptual Loop — L405](ducks-self-referential-perceptual-loop.md#^ref-71726f04-405-0) (line 405, col 0, score 0.98)
- [field-node-diagram-outline — L652](field-node-diagram-outline.md#^ref-1f32c94a-652-0) (line 652, col 0, score 0.98)
- [field-node-diagram-set — L635](field-node-diagram-set.md#^ref-22b989d5-635-0) (line 635, col 0, score 0.98)
- [Admin Dashboard for User Management — L283](admin-dashboard-for-user-management.md#^ref-2901a3e9-283-0) (line 283, col 0, score 1)
- [JavaScript — L153](chunks/javascript.md#^ref-c1618c66-153-0) (line 153, col 0, score 0.99)
- [typed-struct-compiler — L778](typed-struct-compiler.md#^ref-78eeedf7-778-0) (line 778, col 0, score 0.99)
- [Unique Info Dump Index — L427](unique-info-dump-index.md#^ref-30ec3ba6-427-0) (line 427, col 0, score 0.99)
- [schema-evolution-workflow — L708](schema-evolution-workflow.md#^ref-d8059b6a-708-0) (line 708, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L805](migrate-to-provider-tenant-architecture.md#^ref-54382370-805-0) (line 805, col 0, score 0.95)
- [Promethean-Copilot-Intent-Engine — L329](promethean-copilot-intent-engine.md#^ref-ae24a280-329-0) (line 329, col 0, score 0.98)
- [Debugging Broker Connections and Agent Behavior — L203](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-203-0) (line 203, col 0, score 0.98)
- [Services — L133](chunks/services.md#^ref-75ea4a6a-133-0) (line 133, col 0, score 0.98)
- [graph-ds — L604](graph-ds.md#^ref-6620e2f2-604-0) (line 604, col 0, score 1)
- [JavaScript — L154](chunks/javascript.md#^ref-c1618c66-154-0) (line 154, col 0, score 1)
- [typed-struct-compiler — L779](typed-struct-compiler.md#^ref-78eeedf7-779-0) (line 779, col 0, score 1)
- [Unique Info Dump Index — L428](unique-info-dump-index.md#^ref-30ec3ba6-428-0) (line 428, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L291](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-291-0) (line 291, col 0, score 0.98)
- [typed-struct-compiler — L535](typed-struct-compiler.md#^ref-78eeedf7-535-0) (line 535, col 0, score 0.98)
- [zero-copy-snapshots-and-workers — L509](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-509-0) (line 509, col 0, score 0.98)
- [typed-struct-compiler — L565](typed-struct-compiler.md#^ref-78eeedf7-565-0) (line 565, col 0, score 0.98)
- [Chroma Toolkit Consolidation Plan — L311](chroma-toolkit-consolidation-plan.md#^ref-5020e892-311-0) (line 311, col 0, score 0.98)
- [Pure TypeScript Search Microservice — L727](pure-typescript-search-microservice.md#^ref-d17d3a96-727-0) (line 727, col 0, score 0.96)
- [Stateful Partitions and Rebalancing — L993](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-993-0) (line 993, col 0, score 0.96)
- [schema-evolution-workflow — L1017](schema-evolution-workflow.md#^ref-d8059b6a-1017-0) (line 1017, col 0, score 0.97)
- [eidolon-field-math-foundations — L851](eidolon-field-math-foundations.md#^ref-008f2ac0-851-0) (line 851, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1449](migrate-to-provider-tenant-architecture.md#^ref-54382370-1449-0) (line 1449, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L682](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-682-0) (line 682, col 0, score 1)
- [Promethean Infrastructure Setup — L933](promethean-infrastructure-setup.md#^ref-6deed6ac-933-0) (line 933, col 0, score 1)
- [Prometheus Observability Stack — L855](prometheus-observability-stack.md#^ref-e90b5a16-855-0) (line 855, col 0, score 1)
- [Pure TypeScript Search Microservice — L1075](pure-typescript-search-microservice.md#^ref-d17d3a96-1075-0) (line 1075, col 0, score 1)
- [Dynamic Context Model for Web Components — L817](dynamic-context-model-for-web-components.md#^ref-f7702bf8-817-0) (line 817, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L798](chroma-toolkit-consolidation-plan.md#^ref-5020e892-798-0) (line 798, col 0, score 0.99)
- [Agent Tasks: Persistence Migration to DualStore — L761](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-761-0) (line 761, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L1450](migrate-to-provider-tenant-architecture.md#^ref-54382370-1450-0) (line 1450, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L683](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-683-0) (line 683, col 0, score 0.99)
- [Promethean Infrastructure Setup — L934](promethean-infrastructure-setup.md#^ref-6deed6ac-934-0) (line 934, col 0, score 0.99)
- [Prometheus Observability Stack — L856](prometheus-observability-stack.md#^ref-e90b5a16-856-0) (line 856, col 0, score 0.99)
- [Pure TypeScript Search Microservice — L1076](pure-typescript-search-microservice.md#^ref-d17d3a96-1076-0) (line 1076, col 0, score 0.99)
- [Promethean State Format — L289](promethean-state-format.md#^ref-23df6ddb-289-0) (line 289, col 0, score 0.96)
- [Agent Tasks: Persistence Migration to DualStore — L804](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-804-0) (line 804, col 0, score 0.96)
- [Agent Tasks: Persistence Migration to DualStore — L762](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-762-0) (line 762, col 0, score 0.99)
- [eidolon-field-math-foundations — L852](eidolon-field-math-foundations.md#^ref-008f2ac0-852-0) (line 852, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L684](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-684-0) (line 684, col 0, score 0.99)
- [Promethean Infrastructure Setup — L935](promethean-infrastructure-setup.md#^ref-6deed6ac-935-0) (line 935, col 0, score 0.99)
- [Prometheus Observability Stack — L857](prometheus-observability-stack.md#^ref-e90b5a16-857-0) (line 857, col 0, score 0.99)
- [Pure TypeScript Search Microservice — L1077](pure-typescript-search-microservice.md#^ref-d17d3a96-1077-0) (line 1077, col 0, score 0.99)
- [Promethean Infrastructure Setup — L1417](promethean-infrastructure-setup.md#^ref-6deed6ac-1417-0) (line 1417, col 0, score 0.97)
- [Prometheus Observability Stack — L1131](prometheus-observability-stack.md#^ref-e90b5a16-1131-0) (line 1131, col 0, score 0.97)
- [Promethean Documentation Update — L711](promethean-documentation-update.txt#^ref-0b872af2-711-0) (line 711, col 0, score 0.96)
- [Promethean Notes — L742](promethean-notes.md#^ref-1c4046b5-742-0) (line 742, col 0, score 0.96)
- [The Jar of Echoes — L1027](the-jar-of-echoes.md#^ref-18138627-1027-0) (line 1027, col 0, score 0.96)
- [windows-tiling-with-autohotkey — L1287](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-1287-0) (line 1287, col 0, score 0.96)
- [Promethean Documentation Update — L639](promethean-documentation-update.txt#^ref-0b872af2-639-0) (line 639, col 0, score 0.96)
- [Promethean Notes — L670](promethean-notes.md#^ref-1c4046b5-670-0) (line 670, col 0, score 0.96)
- [The Jar of Echoes — L887](the-jar-of-echoes.md#^ref-18138627-887-0) (line 887, col 0, score 0.96)
- [windows-tiling-with-autohotkey — L982](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-982-0) (line 982, col 0, score 0.96)
- [Agent Tasks: Persistence Migration to DualStore — L764](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-764-0) (line 764, col 0, score 0.99)
- [eidolon-field-math-foundations — L854](eidolon-field-math-foundations.md#^ref-008f2ac0-854-0) (line 854, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L1452](migrate-to-provider-tenant-architecture.md#^ref-54382370-1452-0) (line 1452, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L685](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-685-0) (line 685, col 0, score 0.99)
- [Promethean Infrastructure Setup — L937](promethean-infrastructure-setup.md#^ref-6deed6ac-937-0) (line 937, col 0, score 0.99)
- [Prometheus Observability Stack — L859](prometheus-observability-stack.md#^ref-e90b5a16-859-0) (line 859, col 0, score 0.99)
- [Pure TypeScript Search Microservice — L1079](pure-typescript-search-microservice.md#^ref-d17d3a96-1079-0) (line 1079, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L423](migrate-to-provider-tenant-architecture.md#^ref-54382370-423-0) (line 423, col 0, score 0.98)
- [Agent Tasks: Persistence Migration to DualStore — L765](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-765-0) (line 765, col 0, score 0.99)
- [eidolon-field-math-foundations — L855](eidolon-field-math-foundations.md#^ref-008f2ac0-855-0) (line 855, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L1453](migrate-to-provider-tenant-architecture.md#^ref-54382370-1453-0) (line 1453, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L686](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-686-0) (line 686, col 0, score 0.99)
- [Prometheus Observability Stack — L860](prometheus-observability-stack.md#^ref-e90b5a16-860-0) (line 860, col 0, score 0.99)
- [Pure TypeScript Search Microservice — L1080](pure-typescript-search-microservice.md#^ref-d17d3a96-1080-0) (line 1080, col 0, score 0.99)
- [eidolon-field-math-foundations — L877](eidolon-field-math-foundations.md#^ref-008f2ac0-877-0) (line 877, col 0, score 0.98)
- [Prometheus Observability Stack — L948](prometheus-observability-stack.md#^ref-e90b5a16-948-0) (line 948, col 0, score 0.98)
- [Agent Tasks: Persistence Migration to DualStore — L767](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-767-0) (line 767, col 0, score 1)
- [eidolon-field-math-foundations — L857](eidolon-field-math-foundations.md#^ref-008f2ac0-857-0) (line 857, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1455](migrate-to-provider-tenant-architecture.md#^ref-54382370-1455-0) (line 1455, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L688](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-688-0) (line 688, col 0, score 1)
- [Promethean Infrastructure Setup — L1232](promethean-infrastructure-setup.md#^ref-6deed6ac-1232-0) (line 1232, col 0, score 1)
- [Pure TypeScript Search Microservice — L1082](pure-typescript-search-microservice.md#^ref-d17d3a96-1082-0) (line 1082, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L433](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-433-0) (line 433, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L1541](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1541-0) (line 1541, col 0, score 0.98)
- [schema-evolution-workflow — L829](schema-evolution-workflow.md#^ref-d8059b6a-829-0) (line 829, col 0, score 1)
- [Promethean Notes — L152](promethean-notes.md#^ref-1c4046b5-152-0) (line 152, col 0, score 1)
- [plan-update-confirmation — L1483](plan-update-confirmation.md#^ref-b22d79c6-1483-0) (line 1483, col 0, score 1)
- [Promethean Notes — L1067](promethean-notes.md#^ref-1c4046b5-1067-0) (line 1067, col 0, score 0.98)
- [Fnord Tracer Protocol — L609](fnord-tracer-protocol.md#^ref-fc21f824-609-0) (line 609, col 0, score 0.97)
- [schema-evolution-workflow — L1000](schema-evolution-workflow.md#^ref-d8059b6a-1000-0) (line 1000, col 0, score 0.97)
- [Stateful Partitions and Rebalancing — L1015](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-1015-0) (line 1015, col 0, score 0.97)
- [TypeScript Patch for Tool Calling Support — L916](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-916-0) (line 916, col 0, score 0.97)
- [Promethean-Copilot-Intent-Engine — L426](promethean-copilot-intent-engine.md#^ref-ae24a280-426-0) (line 426, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L447](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-447-0) (line 447, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L564](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-564-0) (line 564, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L121](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-121-0) (line 121, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L1265](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1265-0) (line 1265, col 0, score 0.98)
- [Agent Reflections and Prompt Evolution — L336](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-336-0) (line 336, col 0, score 0.98)
- [Factorio AI with External Agents — L538](factorio-ai-with-external-agents.md#^ref-a4d90289-538-0) (line 538, col 0, score 0.98)
- [Layer1SurvivabilityEnvelope — L559](layer1survivabilityenvelope.md#^ref-64a9f9f9-559-0) (line 559, col 0, score 0.98)
- [Fnord Tracer Protocol — L545](fnord-tracer-protocol.md#^ref-fc21f824-545-0) (line 545, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L484](promethean-copilot-intent-engine.md#^ref-ae24a280-484-0) (line 484, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L325](protocol-0-the-contradiction-engine.md#^ref-9a93a756-325-0) (line 325, col 0, score 1)
- [Eidolon Field Abstract Model — L445](eidolon-field-abstract-model.md#^ref-5e8b2388-445-0) (line 445, col 0, score 1)
- [Promethean Dev Workflow Update — L431](promethean-dev-workflow-update.md#^ref-03a5578f-431-0) (line 431, col 0, score 1)
- [field-interaction-equations — L509](field-interaction-equations.md#^ref-b09141b7-509-0) (line 509, col 0, score 1)
- [Dynamic Context Model for Web Components — L688](dynamic-context-model-for-web-components.md#^ref-f7702bf8-688-0) (line 688, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L446](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-446-0) (line 446, col 0, score 1)
- [Prometheus Observability Stack — L649](prometheus-observability-stack.md#^ref-e90b5a16-649-0) (line 649, col 0, score 1)
- [Creative Moments — L1133](creative-moments.md#^ref-10d98225-1133-0) (line 1133, col 0, score 0.95)
- [windows-tiling-with-autohotkey — L2528](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2528-0) (line 2528, col 0, score 0.95)
- [Canonical Org-Babel Matplotlib Animation Template — L3130](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-3130-0) (line 3130, col 0, score 0.94)
- [Creative Moments — L1890](creative-moments.md#^ref-10d98225-1890-0) (line 1890, col 0, score 0.94)
- [Duck's Attractor States — L4430](ducks-attractor-states.md#^ref-13951643-4430-0) (line 4430, col 0, score 0.94)
- [eidolon-field-math-foundations — L7149](eidolon-field-math-foundations.md#^ref-008f2ac0-7149-0) (line 7149, col 0, score 0.94)
- [Promethean Chat Activity Report — L1869](promethean-chat-activity-report.md#^ref-18344cf9-1869-0) (line 1869, col 0, score 0.94)
- [Promethean Documentation Update — L1573](promethean-documentation-update.txt#^ref-0b872af2-1573-0) (line 1573, col 0, score 0.94)
- [Promethean Notes — L1769](promethean-notes.md#^ref-1c4046b5-1769-0) (line 1769, col 0, score 0.94)
- [Redirecting Standard Error — L161](redirecting-standard-error.md#^ref-b3555ede-161-0) (line 161, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L629](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-629-0) (line 629, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L370](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-370-0) (line 370, col 0, score 1)
- [schema-evolution-workflow — L868](schema-evolution-workflow.md#^ref-d8059b6a-868-0) (line 868, col 0, score 1)
- [Pure TypeScript Search Microservice — L935](pure-typescript-search-microservice.md#^ref-d17d3a96-935-0) (line 935, col 0, score 1)
- [Dynamic Context Model for Web Components — L702](dynamic-context-model-for-web-components.md#^ref-f7702bf8-702-0) (line 702, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L742](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-742-0) (line 742, col 0, score 0.95)
- [Performance-Optimized-Polyglot-Bridge — L816](performance-optimized-polyglot-bridge.md#^ref-f5579967-816-0) (line 816, col 0, score 0.95)
- [Factorio AI with External Agents — L512](factorio-ai-with-external-agents.md#^ref-a4d90289-512-0) (line 512, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L594](functional-embedding-pipeline-refactor.md#^ref-a4a25141-594-0) (line 594, col 0, score 1)
- [Dynamic Context Model for Web Components — L597](dynamic-context-model-for-web-components.md#^ref-f7702bf8-597-0) (line 597, col 0, score 1)
- [The Jar of Echoes — L365](the-jar-of-echoes.md#^ref-18138627-365-0) (line 365, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L357](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-357-0) (line 357, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L405](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-405-0) (line 405, col 0, score 1)
- [Prometheus Observability Stack — L654](prometheus-observability-stack.md#^ref-e90b5a16-654-0) (line 654, col 0, score 1)
- [Promethean Dev Workflow Update — L438](promethean-dev-workflow-update.md#^ref-03a5578f-438-0) (line 438, col 0, score 1)
- [Factorio AI with External Agents — L356](factorio-ai-with-external-agents.md#^ref-a4d90289-356-0) (line 356, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L424](promethean-copilot-intent-engine.md#^ref-ae24a280-424-0) (line 424, col 0, score 1)
- [Eidolon Field Abstract Model — L673](eidolon-field-abstract-model.md#^ref-5e8b2388-673-0) (line 673, col 0, score 0.97)
- [Debugging Broker Connections and Agent Behavior — L256](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-256-0) (line 256, col 0, score 0.96)
- [plan-update-confirmation — L1281](plan-update-confirmation.md#^ref-b22d79c6-1281-0) (line 1281, col 0, score 0.96)
- [Agent Reflections and Prompt Evolution — L386](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-386-0) (line 386, col 0, score 0.96)
- [Prometheus Observability Stack — L658](prometheus-observability-stack.md#^ref-e90b5a16-658-0) (line 658, col 0, score 0.96)
- [Protocol_0_The_Contradiction_Engine — L366](protocol-0-the-contradiction-engine.md#^ref-9a93a756-366-0) (line 366, col 0, score 0.96)
- [Self-Agency in AI Interaction — L197](self-agency-in-ai-interaction.md#^ref-49a9a860-197-0) (line 197, col 0, score 0.96)
- [Promethean Dev Workflow Update — L432](promethean-dev-workflow-update.md#^ref-03a5578f-432-0) (line 432, col 0, score 1)
- [Promethean Dev Workflow Update — L347](promethean-dev-workflow-update.md#^ref-03a5578f-347-0) (line 347, col 0, score 0.96)
- [Creative Moments — L509](creative-moments.md#^ref-10d98225-509-0) (line 509, col 0, score 0.95)
- [Duck's Attractor States — L1130](ducks-attractor-states.md#^ref-13951643-1130-0) (line 1130, col 0, score 0.95)
- [eidolon-field-math-foundations — L1896](eidolon-field-math-foundations.md#^ref-008f2ac0-1896-0) (line 1896, col 0, score 0.95)
- [Functional Refactor of TypeScript Document Processing — L1107](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-1107-0) (line 1107, col 0, score 0.95)
- [Promethean Chat Activity Report — L526](promethean-chat-activity-report.md#^ref-18344cf9-526-0) (line 526, col 0, score 0.95)
- [Promethean Dev Workflow Update — L1206](promethean-dev-workflow-update.md#^ref-03a5578f-1206-0) (line 1206, col 0, score 0.95)
- [Layer1SurvivabilityEnvelope — L413](layer1survivabilityenvelope.md#^ref-64a9f9f9-413-0) (line 413, col 0, score 1)
- [schema-evolution-workflow — L980](schema-evolution-workflow.md#^ref-d8059b6a-980-0) (line 980, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L296](model-upgrade-calm-down-guide.md#^ref-db74343f-296-0) (line 296, col 0, score 1)
- [typed-struct-compiler — L590](typed-struct-compiler.md#^ref-78eeedf7-590-0) (line 590, col 0, score 0.98)
- [zero-copy-snapshots-and-workers — L517](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-517-0) (line 517, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L714](migrate-to-provider-tenant-architecture.md#^ref-54382370-714-0) (line 714, col 0, score 0.98)
- [ParticleSimulationWithCanvasAndFFmpeg — L396](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-396-0) (line 396, col 0, score 0.98)
- [Stateful Partitions and Rebalancing — L978](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-978-0) (line 978, col 0, score 0.98)
- [Promethean Infrastructure Setup — L1129](promethean-infrastructure-setup.md#^ref-6deed6ac-1129-0) (line 1129, col 0, score 0.98)
- [Promethean Dev Workflow Update — L435](promethean-dev-workflow-update.md#^ref-03a5578f-435-0) (line 435, col 0, score 1)
- [Prometheus Observability Stack — L651](prometheus-observability-stack.md#^ref-e90b5a16-651-0) (line 651, col 0, score 1)
- [plan-update-confirmation — L1798](plan-update-confirmation.md#^ref-b22d79c6-1798-0) (line 1798, col 0, score 1)
- [Promethean Dev Workflow Update — L400](promethean-dev-workflow-update.md#^ref-03a5578f-400-0) (line 400, col 0, score 0.96)
- [Functional Embedding Pipeline Refactor — L506](functional-embedding-pipeline-refactor.md#^ref-a4a25141-506-0) (line 506, col 0, score 0.96)
- [Chroma Toolkit Consolidation Plan — L352](chroma-toolkit-consolidation-plan.md#^ref-5020e892-352-0) (line 352, col 0, score 0.96)
- [Self-Agency in AI Interaction — L190](self-agency-in-ai-interaction.md#^ref-49a9a860-190-0) (line 190, col 0, score 0.96)
- [Migrate to Provider-Tenant Architecture — L547](migrate-to-provider-tenant-architecture.md#^ref-54382370-547-0) (line 547, col 0, score 0.95)
- [Promethean Infrastructure Setup — L1085](promethean-infrastructure-setup.md#^ref-6deed6ac-1085-0) (line 1085, col 0, score 0.98)
- [Ice Box Reorganization — L372](ice-box-reorganization.md#^ref-291c7d91-372-0) (line 372, col 0, score 0.98)
- [Performance-Optimized-Polyglot-Bridge — L627](performance-optimized-polyglot-bridge.md#^ref-f5579967-627-0) (line 627, col 0, score 0.98)
- [ParticleSimulationWithCanvasAndFFmpeg — L556](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-556-0) (line 556, col 0, score 0.98)
- [Performance-Optimized-Polyglot-Bridge — L955](performance-optimized-polyglot-bridge.md#^ref-f5579967-955-0) (line 955, col 0, score 0.98)
- [Prometheus Observability Stack — L791](prometheus-observability-stack.md#^ref-e90b5a16-791-0) (line 791, col 0, score 0.98)
- [Tracing the Signal — L391](tracing-the-signal.md#^ref-c3cd4f65-391-0) (line 391, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L457](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-457-0) (line 457, col 0, score 0.98)
- [Eidolon Field Abstract Model — L456](eidolon-field-abstract-model.md#^ref-5e8b2388-456-0) (line 456, col 0, score 1)
- [Docops Feature Updates — L122](docops-feature-updates.md#^ref-2792d448-122-0) (line 122, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L573](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-573-0) (line 573, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L436](functional-embedding-pipeline-refactor.md#^ref-a4a25141-436-0) (line 436, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L457](chroma-toolkit-consolidation-plan.md#^ref-5020e892-457-0) (line 457, col 0, score 0.99)
- [Stateful Partitions and Rebalancing — L947](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-947-0) (line 947, col 0, score 0.99)
- [schema-evolution-workflow — L904](schema-evolution-workflow.md#^ref-d8059b6a-904-0) (line 904, col 0, score 0.99)
- [Model Selection for Lightweight Conversational Tasks — L335](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-335-0) (line 335, col 0, score 0.96)
- [Docops Feature Updates — L132](docops-feature-updates-3.md#^ref-cdbd21ee-132-0) (line 132, col 0, score 0.97)
- [Docops Feature Updates — L190](docops-feature-updates.md#^ref-2792d448-190-0) (line 190, col 0, score 0.97)
- [Agent Tasks: Persistence Migration to DualStore — L372](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-372-0) (line 372, col 0, score 0.97)
- [TypeScript Patch for Tool Calling Support — L685](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-685-0) (line 685, col 0, score 0.97)
- [Unique Info Dump Index — L558](unique-info-dump-index.md#^ref-30ec3ba6-558-0) (line 558, col 0, score 0.97)
- [Pipeline Enhancements — L93](pipeline-enhancements.md#^ref-e2135d9f-93-0) (line 93, col 0, score 0.97)
- [Provider-Agnostic Chat Panel Implementation — L598](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-598-0) (line 598, col 0, score 0.97)
- [plan-update-confirmation — L1422](plan-update-confirmation.md#^ref-b22d79c6-1422-0) (line 1422, col 0, score 0.97)
- [Migrate to Provider-Tenant Architecture — L832](migrate-to-provider-tenant-architecture.md#^ref-54382370-832-0) (line 832, col 0, score 1)
- [Dynamic Context Model for Web Components — L879](dynamic-context-model-for-web-components.md#^ref-f7702bf8-879-0) (line 879, col 0, score 1)
- [Reawakening Duck — L291](reawakening-duck.md#^ref-59b5670f-291-0) (line 291, col 0, score 1)
- [windows-tiling-with-autohotkey — L403](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-403-0) (line 403, col 0, score 0.95)
- [Fnord Tracer Protocol — L692](fnord-tracer-protocol.md#^ref-fc21f824-692-0) (line 692, col 0, score 0.95)
- [Promethean Infrastructure Setup — L1034](promethean-infrastructure-setup.md#^ref-6deed6ac-1034-0) (line 1034, col 0, score 0.95)
- [i3-bluetooth-setup — L315](i3-bluetooth-setup.md#^ref-5e408692-315-0) (line 315, col 0, score 0.95)
- [plan-update-confirmation — L1481](plan-update-confirmation.md#^ref-b22d79c6-1481-0) (line 1481, col 0, score 0.95)
- [Layer1SurvivabilityEnvelope — L419](layer1survivabilityenvelope.md#^ref-64a9f9f9-419-0) (line 419, col 0, score 1)
- [Promethean Infrastructure Setup — L1060](promethean-infrastructure-setup.md#^ref-6deed6ac-1060-0) (line 1060, col 0, score 1)
- [Reawakening Duck — L363](reawakening-duck.md#^ref-59b5670f-363-0) (line 363, col 0, score 1)
- [eidolon-field-math-foundations — L5993](eidolon-field-math-foundations.md#^ref-008f2ac0-5993-0) (line 5993, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L4353](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-4353-0) (line 4353, col 0, score 0.98)
- [eidolon-field-math-foundations — L7477](eidolon-field-math-foundations.md#^ref-008f2ac0-7477-0) (line 7477, col 0, score 0.98)
- [Promethean-Copilot-Intent-Engine — L294](promethean-copilot-intent-engine.md#^ref-ae24a280-294-0) (line 294, col 0, score 0.98)
- [Per-Domain Policy System for JS Crawler — L783](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-783-0) (line 783, col 0, score 0.97)
- [Dynamic Context Model for Web Components — L887](dynamic-context-model-for-web-components.md#^ref-f7702bf8-887-0) (line 887, col 0, score 1)
- [Pure TypeScript Search Microservice — L877](pure-typescript-search-microservice.md#^ref-d17d3a96-877-0) (line 877, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L273](model-upgrade-calm-down-guide.md#^ref-db74343f-273-0) (line 273, col 0, score 1)
- [Fnord Tracer Protocol — L526](fnord-tracer-protocol.md#^ref-fc21f824-526-0) (line 526, col 0, score 1)
- [Docops Feature Updates — L109](docops-feature-updates-3.md#^ref-cdbd21ee-109-0) (line 109, col 0, score 1)
- [Docops Feature Updates — L167](docops-feature-updates.md#^ref-2792d448-167-0) (line 167, col 0, score 1)
- [plan-update-confirmation — L1298](plan-update-confirmation.md#^ref-b22d79c6-1298-0) (line 1298, col 0, score 1)
- [sibilant-macro-targets — L347](sibilant-macro-targets.md#^ref-c5c9a5c6-347-0) (line 347, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L333](model-upgrade-calm-down-guide.md#^ref-db74343f-333-0) (line 333, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L500](promethean-copilot-intent-engine.md#^ref-ae24a280-500-0) (line 500, col 0, score 1)
- [Promethean Dev Workflow Update — L226](promethean-dev-workflow-update.md#^ref-03a5578f-226-0) (line 226, col 0, score 1)
- [plan-update-confirmation — L1766](plan-update-confirmation.md#^ref-b22d79c6-1766-0) (line 1766, col 0, score 1)
- [Prompt_Folder_Bootstrap — L541](prompt-folder-bootstrap.md#^ref-bd4f0976-541-0) (line 541, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L444](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-444-0) (line 444, col 0, score 1)
- [Promethean Dev Workflow Update — L2928](promethean-dev-workflow-update.md#^ref-03a5578f-2928-0) (line 2928, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L3254](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-3254-0) (line 3254, col 0, score 0.98)
- [plan-update-confirmation — L1357](plan-update-confirmation.md#^ref-b22d79c6-1357-0) (line 1357, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L899](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-899-0) (line 899, col 0, score 1)
- [Admin Dashboard for User Management — L259](admin-dashboard-for-user-management.md#^ref-2901a3e9-259-0) (line 259, col 0, score 1)
- [Dynamic Context Model for Web Components — L914](dynamic-context-model-for-web-components.md#^ref-f7702bf8-914-0) (line 914, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L449](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-449-0) (line 449, col 0, score 1)
- [Prompt_Folder_Bootstrap — L555](prompt-folder-bootstrap.md#^ref-bd4f0976-555-0) (line 555, col 0, score 1)
- [Promethean Dev Workflow Update — L5295](promethean-dev-workflow-update.md#^ref-03a5578f-5295-0) (line 5295, col 0, score 0.98)
- [The Jar of Echoes — L2933](the-jar-of-echoes.md#^ref-18138627-2933-0) (line 2933, col 0, score 0.98)
- [Debugging Broker Connections and Agent Behavior — L215](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-215-0) (line 215, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L376](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-376-0) (line 376, col 0, score 1)
- [Dynamic Context Model for Web Components — L860](dynamic-context-model-for-web-components.md#^ref-f7702bf8-860-0) (line 860, col 0, score 1)
- [Fnord Tracer Protocol — L737](fnord-tracer-protocol.md#^ref-fc21f824-737-0) (line 737, col 0, score 1)
- [komorebi-group-window-hack — L426](komorebi-group-window-hack.md#^ref-dd89372d-426-0) (line 426, col 0, score 1)
- [Pure TypeScript Search Microservice — L725](pure-typescript-search-microservice.md#^ref-d17d3a96-725-0) (line 725, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L368](chroma-toolkit-consolidation-plan.md#^ref-5020e892-368-0) (line 368, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L575](functional-embedding-pipeline-refactor.md#^ref-a4a25141-575-0) (line 575, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L836](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-836-0) (line 836, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L383](promethean-copilot-intent-engine.md#^ref-ae24a280-383-0) (line 383, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L382](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-382-0) (line 382, col 0, score 1)
- [windows-tiling-with-autohotkey — L3032](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-3032-0) (line 3032, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L3223](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-3223-0) (line 3223, col 0, score 0.98)
- [The Jar of Echoes — L3323](the-jar-of-echoes.md#^ref-18138627-3323-0) (line 3323, col 0, score 0.97)
- [windows-tiling-with-autohotkey — L2514](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2514-0) (line 2514, col 0, score 0.96)
- [The Jar of Echoes — L2841](the-jar-of-echoes.md#^ref-18138627-2841-0) (line 2841, col 0, score 0.96)
- [Ice Box Reorganization — L281](ice-box-reorganization.md#^ref-291c7d91-281-0) (line 281, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L355](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-355-0) (line 355, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L446](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-446-0) (line 446, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L668](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-668-0) (line 668, col 0, score 1)
- [windows-tiling-with-autohotkey — L3578](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-3578-0) (line 3578, col 0, score 0.98)
- [Creative Moments — L1318](creative-moments.md#^ref-10d98225-1318-0) (line 1318, col 0, score 0.98)
- [Duck's Attractor States — L2896](ducks-attractor-states.md#^ref-13951643-2896-0) (line 2896, col 0, score 0.98)
- [Promethean Chat Activity Report — L1410](promethean-chat-activity-report.md#^ref-18344cf9-1410-0) (line 1410, col 0, score 0.98)
- [Promethean Dev Workflow Update — L4232](promethean-dev-workflow-update.md#^ref-03a5578f-4232-0) (line 4232, col 0, score 0.98)
- [TypeScript Patch for Tool Calling Support — L688](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-688-0) (line 688, col 0, score 1)
- [Self-Agency in AI Interaction — L259](self-agency-in-ai-interaction.md#^ref-49a9a860-259-0) (line 259, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L478](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-478-0) (line 478, col 0, score 1)
- [plan-update-confirmation — L1157](plan-update-confirmation.md#^ref-b22d79c6-1157-0) (line 1157, col 0, score 0.98)
- [Reawakening Duck — L435](reawakening-duck.md#^ref-59b5670f-435-0) (line 435, col 0, score 0.98)
- [Fnord Tracer Protocol — L510](fnord-tracer-protocol.md#^ref-fc21f824-510-0) (line 510, col 0, score 0.98)
- [plan-update-confirmation — L1795](plan-update-confirmation.md#^ref-b22d79c6-1795-0) (line 1795, col 0, score 0.98)
- [Self-Agency in AI Interaction — L204](self-agency-in-ai-interaction.md#^ref-49a9a860-204-0) (line 204, col 0, score 0.98)
- [Stateful Partitions and Rebalancing — L996](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-996-0) (line 996, col 0, score 1)
- [windows-tiling-with-autohotkey — L399](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-399-0) (line 399, col 0, score 0.97)
- [Model Upgrade Calm-Down Guide — L330](model-upgrade-calm-down-guide.md#^ref-db74343f-330-0) (line 330, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L408](promethean-copilot-intent-engine.md#^ref-ae24a280-408-0) (line 408, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L450](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-450-0) (line 450, col 0, score 1)
- [komorebi-group-window-hack — L461](komorebi-group-window-hack.md#^ref-dd89372d-461-0) (line 461, col 0, score 1)
- [plan-update-confirmation — L1359](plan-update-confirmation.md#^ref-b22d79c6-1359-0) (line 1359, col 0, score 1)
- [Admin Dashboard for User Management — L197](admin-dashboard-for-user-management.md#^ref-2901a3e9-197-0) (line 197, col 0, score 1)
- [schema-evolution-workflow — L1027](schema-evolution-workflow.md#^ref-d8059b6a-1027-0) (line 1027, col 0, score 1)
- [sibilant-macro-targets — L357](sibilant-macro-targets.md#^ref-c5c9a5c6-357-0) (line 357, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L685](migrate-to-provider-tenant-architecture.md#^ref-54382370-685-0) (line 685, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L654](performance-optimized-polyglot-bridge.md#^ref-f5579967-654-0) (line 654, col 0, score 1)
- [Docops Feature Updates — L92](docops-feature-updates-3.md#^ref-cdbd21ee-92-0) (line 92, col 0, score 1)
- [Docops Feature Updates — L153](docops-feature-updates.md#^ref-2792d448-153-0) (line 153, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L502](functional-embedding-pipeline-refactor.md#^ref-a4a25141-502-0) (line 502, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L338](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-338-0) (line 338, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L925](migrate-to-provider-tenant-architecture.md#^ref-54382370-925-0) (line 925, col 0, score 0.99)
- [schema-evolution-workflow — L924](schema-evolution-workflow.md#^ref-d8059b6a-924-0) (line 924, col 0, score 0.98)
- [TypeScript Patch for Tool Calling Support — L900](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-900-0) (line 900, col 0, score 0.98)
- [Promethean-Copilot-Intent-Engine — L379](promethean-copilot-intent-engine.md#^ref-ae24a280-379-0) (line 379, col 0, score 1)
- [windows-tiling-with-autohotkey — L447](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-447-0) (line 447, col 0, score 1)
- [windows-tiling-with-autohotkey — L3369](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-3369-0) (line 3369, col 0, score 0.97)
- [windows-tiling-with-autohotkey — L2000](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2000-0) (line 2000, col 0, score 0.96)
- [Promethean Dev Workflow Update — L2741](promethean-dev-workflow-update.md#^ref-03a5578f-2741-0) (line 2741, col 0, score 0.95)
- [Duck's Attractor States — L2034](ducks-attractor-states.md#^ref-13951643-2034-0) (line 2034, col 0, score 0.94)
- [Duck's Self-Referential Perceptual Loop — L203](ducks-self-referential-perceptual-loop.md#^ref-71726f04-203-0) (line 203, col 0, score 0.94)
- [Factorio AI with External Agents — L432](factorio-ai-with-external-agents.md#^ref-a4d90289-432-0) (line 432, col 0, score 0.94)
- [Dynamic Context Model for Web Components — L1094](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1094-0) (line 1094, col 0, score 0.96)
- [plan-update-confirmation — L1777](plan-update-confirmation.md#^ref-b22d79c6-1777-0) (line 1777, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L441](functional-embedding-pipeline-refactor.md#^ref-a4a25141-441-0) (line 441, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L796](migrate-to-provider-tenant-architecture.md#^ref-54382370-796-0) (line 796, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L409](layer1survivabilityenvelope.md#^ref-64a9f9f9-409-0) (line 409, col 0, score 0.96)
- [Promethean-Copilot-Intent-Engine — L337](promethean-copilot-intent-engine.md#^ref-ae24a280-337-0) (line 337, col 0, score 0.96)
- [Promethean Documentation Pipeline Overview — L453](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-453-0) (line 453, col 0, score 0.96)
- [Redirecting Standard Error — L139](redirecting-standard-error.md#^ref-b3555ede-139-0) (line 139, col 0, score 1)
- [komorebi-group-window-hack — L388](komorebi-group-window-hack.md#^ref-dd89372d-388-0) (line 388, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L829](performance-optimized-polyglot-bridge.md#^ref-f5579967-829-0) (line 829, col 0, score 1)
- [zero-copy-snapshots-and-workers — L572](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-572-0) (line 572, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L570](functional-embedding-pipeline-refactor.md#^ref-a4a25141-570-0) (line 570, col 0, score 1)
- [typed-struct-compiler — L622](typed-struct-compiler.md#^ref-78eeedf7-622-0) (line 622, col 0, score 1)
- [Factorio AI with External Agents — L447](factorio-ai-with-external-agents.md#^ref-a4d90289-447-0) (line 447, col 0, score 0.98)
- [Pipeline Enhancements — L69](pipeline-enhancements.md#^ref-e2135d9f-69-0) (line 69, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L430](migrate-to-provider-tenant-architecture.md#^ref-54382370-430-0) (line 430, col 0, score 0.98)
- [Performance-Optimized-Polyglot-Bridge — L857](performance-optimized-polyglot-bridge.md#^ref-f5579967-857-0) (line 857, col 0, score 1)
- [Fnord Tracer Protocol — L733](fnord-tracer-protocol.md#^ref-fc21f824-733-0) (line 733, col 0, score 1)
- [zero-copy-snapshots-and-workers — L681](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-681-0) (line 681, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L839](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-839-0) (line 839, col 0, score 0.96)
- [Duck's Attractor States — L1221](ducks-attractor-states.md#^ref-13951643-1221-0) (line 1221, col 0, score 0.96)
- [eidolon-field-math-foundations — L1882](eidolon-field-math-foundations.md#^ref-008f2ac0-1882-0) (line 1882, col 0, score 0.96)
- [Promethean Dev Workflow Update — L1442](promethean-dev-workflow-update.md#^ref-03a5578f-1442-0) (line 1442, col 0, score 0.96)
- [The Jar of Echoes — L1545](the-jar-of-echoes.md#^ref-18138627-1545-0) (line 1545, col 0, score 0.96)
- [Fnord Tracer Protocol — L710](fnord-tracer-protocol.md#^ref-fc21f824-710-0) (line 710, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L693](performance-optimized-polyglot-bridge.md#^ref-f5579967-693-0) (line 693, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L522](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-522-0) (line 522, col 0, score 1)
- [Promethean State Format — L276](promethean-state-format.md#^ref-23df6ddb-276-0) (line 276, col 0, score 1)
- [Prometheus Observability Stack — L648](prometheus-observability-stack.md#^ref-e90b5a16-648-0) (line 648, col 0, score 1)
- [zero-copy-snapshots-and-workers — L676](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-676-0) (line 676, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1064](migrate-to-provider-tenant-architecture.md#^ref-54382370-1064-0) (line 1064, col 0, score 1)
- [Tracing the Signal — L268](tracing-the-signal.md#^ref-c3cd4f65-268-0) (line 268, col 0, score 0.97)
- [sibilant-macro-targets — L447](sibilant-macro-targets.md#^ref-c5c9a5c6-447-0) (line 447, col 0, score 1)
- [windows-tiling-with-autohotkey — L400](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-400-0) (line 400, col 0, score 1)
- [polyglot-repl-interface-layer — L344](polyglot-repl-interface-layer.md#^ref-9c79206d-344-0) (line 344, col 0, score 1)
- [Promethean State Format — L274](promethean-state-format.md#^ref-23df6ddb-274-0) (line 274, col 0, score 1)
- [Docops Feature Updates — L151](docops-feature-updates-3.md#^ref-cdbd21ee-151-0) (line 151, col 0, score 1)
- [Docops Feature Updates — L208](docops-feature-updates.md#^ref-2792d448-208-0) (line 208, col 0, score 1)
- [i3-bluetooth-setup — L389](i3-bluetooth-setup.md#^ref-5e408692-389-0) (line 389, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L339](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-339-0) (line 339, col 0, score 1)
- [Pipeline Enhancements — L84](pipeline-enhancements.md#^ref-e2135d9f-84-0) (line 84, col 0, score 1)
- [polyglot-repl-interface-layer — L353](polyglot-repl-interface-layer.md#^ref-9c79206d-353-0) (line 353, col 0, score 1)
- [eidolon-field-math-foundations — L2483](eidolon-field-math-foundations.md#^ref-008f2ac0-2483-0) (line 2483, col 0, score 0.96)
- [Promethean Dev Workflow Update — L3497](promethean-dev-workflow-update.md#^ref-03a5578f-3497-0) (line 3497, col 0, score 0.95)
- [Promethean Dev Workflow Update — L3520](promethean-dev-workflow-update.md#^ref-03a5578f-3520-0) (line 3520, col 0, score 0.95)
- [Dynamic Context Model for Web Components — L1202](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1202-0) (line 1202, col 0, score 0.95)
- [Promethean Dev Workflow Update — L3577](promethean-dev-workflow-update.md#^ref-03a5578f-3577-0) (line 3577, col 0, score 0.94)
- [Canonical Org-Babel Matplotlib Animation Template — L2163](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-2163-0) (line 2163, col 0, score 0.94)
- [Functional Embedding Pipeline Refactor — L483](functional-embedding-pipeline-refactor.md#^ref-a4a25141-483-0) (line 483, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L621](functional-embedding-pipeline-refactor.md#^ref-a4a25141-621-0) (line 621, col 0, score 0.96)
- [field-dynamics-math-blocks — L456](field-dynamics-math-blocks.md#^ref-7cfc230d-456-0) (line 456, col 0, score 0.96)
- [Admin Dashboard for User Management — L266](admin-dashboard-for-user-management.md#^ref-2901a3e9-266-0) (line 266, col 0, score 0.96)
- [Pure TypeScript Search Microservice — L805](pure-typescript-search-microservice.md#^ref-d17d3a96-805-0) (line 805, col 0, score 1)
- [Pipeline Enhancements — L88](pipeline-enhancements.md#^ref-e2135d9f-88-0) (line 88, col 0, score 1)
- [Promethean Infrastructure Setup — L941](promethean-infrastructure-setup.md#^ref-6deed6ac-941-0) (line 941, col 0, score 1)
- [Pure TypeScript Search Microservice — L825](pure-typescript-search-microservice.md#^ref-d17d3a96-825-0) (line 825, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L318](chroma-toolkit-consolidation-plan.md#^ref-5020e892-318-0) (line 318, col 0, score 0.96)
- [Agent Tasks: Persistence Migration to DualStore — L339](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-339-0) (line 339, col 0, score 0.96)
- [plan-update-confirmation — L1366](plan-update-confirmation.md#^ref-b22d79c6-1366-0) (line 1366, col 0, score 0.96)
- [Ice Box Reorganization — L381](ice-box-reorganization.md#^ref-291c7d91-381-0) (line 381, col 0, score 0.95)
- [Dynamic Context Model for Web Components — L600](dynamic-context-model-for-web-components.md#^ref-f7702bf8-600-0) (line 600, col 0, score 0.95)
- [Promethean Infrastructure Setup — L825](promethean-infrastructure-setup.md#^ref-6deed6ac-825-0) (line 825, col 0, score 1)
- [Factorio AI with External Agents — L458](factorio-ai-with-external-agents.md#^ref-a4d90289-458-0) (line 458, col 0, score 1)
- [typed-struct-compiler — L715](typed-struct-compiler.md#^ref-78eeedf7-715-0) (line 715, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L451](model-upgrade-calm-down-guide.md#^ref-db74343f-451-0) (line 451, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L336](promethean-copilot-intent-engine.md#^ref-ae24a280-336-0) (line 336, col 0, score 1)
- [Pure TypeScript Search Microservice — L829](pure-typescript-search-microservice.md#^ref-d17d3a96-829-0) (line 829, col 0, score 1)
- [Redirecting Standard Error — L151](redirecting-standard-error.md#^ref-b3555ede-151-0) (line 151, col 0, score 1)
- [plan-update-confirmation — L1627](plan-update-confirmation.md#^ref-b22d79c6-1627-0) (line 1627, col 0, score 0.97)
- [typed-struct-compiler — L620](typed-struct-compiler.md#^ref-78eeedf7-620-0) (line 620, col 0, score 0.97)
- [ts-to-lisp-transpiler — L135](ts-to-lisp-transpiler.md#^ref-ba11486b-135-0) (line 135, col 0, score 1)
- [typed-struct-compiler — L528](typed-struct-compiler.md#^ref-78eeedf7-528-0) (line 528, col 0, score 1)
- [graph-ds — L514](graph-ds.md#^ref-6620e2f2-514-0) (line 514, col 0, score 1)
- [schema-evolution-workflow — L689](schema-evolution-workflow.md#^ref-d8059b6a-689-0) (line 689, col 0, score 1)
- [Diagrams — L199](chunks/diagrams.md#^ref-45cd25b5-199-0) (line 199, col 0, score 0.94)
- [DSL — L213](chunks/dsl.md#^ref-e87bc036-213-0) (line 213, col 0, score 0.94)
- [JavaScript — L240](chunks/javascript.md#^ref-c1618c66-240-0) (line 240, col 0, score 0.94)
- [Math Fundamentals — L187](chunks/math-fundamentals.md#^ref-c6e87433-187-0) (line 187, col 0, score 0.94)
- [Services — L196](chunks/services.md#^ref-75ea4a6a-196-0) (line 196, col 0, score 0.94)
- [Promethean Documentation Pipeline Overview — L489](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-489-0) (line 489, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L356](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-356-0) (line 356, col 0, score 0.94)
- [Promethean Documentation Pipeline Overview — L333](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-333-0) (line 333, col 0, score 0.93)
- [Debugging Broker Connections and Agent Behavior — L334](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-334-0) (line 334, col 0, score 0.93)
- [Docops Feature Updates — L136](docops-feature-updates-3.md#^ref-cdbd21ee-136-0) (line 136, col 0, score 0.93)
- [Docops Feature Updates — L193](docops-feature-updates.md#^ref-2792d448-193-0) (line 193, col 0, score 0.93)
- [Promethean Dev Workflow Update — L3029](promethean-dev-workflow-update.md#^ref-03a5578f-3029-0) (line 3029, col 0, score 0.93)
- [Duck's Attractor States — L2033](ducks-attractor-states.md#^ref-13951643-2033-0) (line 2033, col 0, score 0.93)
- [Admin Dashboard for User Management — L193](admin-dashboard-for-user-management.md#^ref-2901a3e9-193-0) (line 193, col 0, score 0.93)
- [Pure TypeScript Search Microservice — L958](pure-typescript-search-microservice.md#^ref-d17d3a96-958-0) (line 958, col 0, score 1)
- [field-dynamics-math-blocks — L455](field-dynamics-math-blocks.md#^ref-7cfc230d-455-0) (line 455, col 0, score 1)
- [Dynamic Context Model for Web Components — L1242](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1242-0) (line 1242, col 0, score 1)
- [typed-struct-compiler — L702](typed-struct-compiler.md#^ref-78eeedf7-702-0) (line 702, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L911](performance-optimized-polyglot-bridge.md#^ref-f5579967-911-0) (line 911, col 0, score 1)
- [schema-evolution-workflow — L792](schema-evolution-workflow.md#^ref-d8059b6a-792-0) (line 792, col 0, score 1)
- [plan-update-confirmation — L1738](plan-update-confirmation.md#^ref-b22d79c6-1738-0) (line 1738, col 0, score 1)
- [Stateful Partitions and Rebalancing — L865](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-865-0) (line 865, col 0, score 1)
- [Promethean Dev Workflow Update — L273](promethean-dev-workflow-update.md#^ref-03a5578f-273-0) (line 273, col 0, score 1)
- [schema-evolution-workflow — L846](schema-evolution-workflow.md#^ref-d8059b6a-846-0) (line 846, col 0, score 1)
- [Pure TypeScript Search Microservice — L734](pure-typescript-search-microservice.md#^ref-d17d3a96-734-0) (line 734, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L335](promethean-copilot-intent-engine.md#^ref-ae24a280-335-0) (line 335, col 0, score 1)
- [Dynamic Context Model for Web Components — L838](dynamic-context-model-for-web-components.md#^ref-f7702bf8-838-0) (line 838, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L549](layer1survivabilityenvelope.md#^ref-64a9f9f9-549-0) (line 549, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1000](migrate-to-provider-tenant-architecture.md#^ref-54382370-1000-0) (line 1000, col 0, score 1)
- [Promethean Infrastructure Setup — L833](promethean-infrastructure-setup.md#^ref-6deed6ac-833-0) (line 833, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L457](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-457-0) (line 457, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L440](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-440-0) (line 440, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L447](migrate-to-provider-tenant-architecture.md#^ref-54382370-447-0) (line 447, col 0, score 0.98)
- [ParticleSimulationWithCanvasAndFFmpeg — L458](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-458-0) (line 458, col 0, score 0.98)
- [Factorio AI with External Agents — L294](factorio-ai-with-external-agents.md#^ref-a4d90289-294-0) (line 294, col 0, score 0.98)
- [Admin Dashboard for User Management — L377](admin-dashboard-for-user-management.md#^ref-2901a3e9-377-0) (line 377, col 0, score 0.97)
- [Agent Tasks: Persistence Migration to DualStore — L831](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-831-0) (line 831, col 0, score 0.97)
- [field-interaction-equations — L886](field-interaction-equations.md#^ref-b09141b7-886-0) (line 886, col 0, score 0.97)
- [Promethean Documentation Pipeline Overview — L458](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-458-0) (line 458, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L459](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-459-0) (line 459, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L1037](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-1037-0) (line 1037, col 0, score 0.98)
- [Window Management — L145](chunks/window-management.md#^ref-9e8ae388-145-0) (line 145, col 0, score 0.98)
- [Canonical Org-Babel Matplotlib Animation Template — L1175](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-1175-0) (line 1175, col 0, score 0.98)
- [Creative Moments — L889](creative-moments.md#^ref-10d98225-889-0) (line 889, col 0, score 0.98)
- [Duck's Attractor States — L1610](ducks-attractor-states.md#^ref-13951643-1610-0) (line 1610, col 0, score 0.98)
- [eidolon-field-math-foundations — L1405](eidolon-field-math-foundations.md#^ref-008f2ac0-1405-0) (line 1405, col 0, score 0.98)
- [plan-update-confirmation — L1695](plan-update-confirmation.md#^ref-b22d79c6-1695-0) (line 1695, col 0, score 0.98)
- [typed-struct-compiler — L718](typed-struct-compiler.md#^ref-78eeedf7-718-0) (line 718, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L487](migrate-to-provider-tenant-architecture.md#^ref-54382370-487-0) (line 487, col 0, score 0.98)
- [plan-update-confirmation — L1697](plan-update-confirmation.md#^ref-b22d79c6-1697-0) (line 1697, col 0, score 1)
- [typed-struct-compiler — L717](typed-struct-compiler.md#^ref-78eeedf7-717-0) (line 717, col 0, score 1)
- [plan-update-confirmation — L1858](plan-update-confirmation.md#^ref-b22d79c6-1858-0) (line 1858, col 0, score 0.98)
- [Promethean Infrastructure Setup — L963](promethean-infrastructure-setup.md#^ref-6deed6ac-963-0) (line 963, col 0, score 0.98)
- [Promethean Documentation Pipeline Overview — L662](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-662-0) (line 662, col 0, score 0.96)
- [Migrate to Provider-Tenant Architecture — L448](migrate-to-provider-tenant-architecture.md#^ref-54382370-448-0) (line 448, col 0, score 0.96)
- [Per-Domain Policy System for JS Crawler — L711](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-711-0) (line 711, col 0, score 0.96)
- [plan-update-confirmation — L1847](plan-update-confirmation.md#^ref-b22d79c6-1847-0) (line 1847, col 0, score 0.96)
- [obsidian-ignore-node-modules-regex — L248](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-248-0) (line 248, col 0, score 1)
- [Pure TypeScript Search Microservice — L819](pure-typescript-search-microservice.md#^ref-d17d3a96-819-0) (line 819, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L850](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-850-0) (line 850, col 0, score 0.98)
- [Promethean Documentation Pipeline Overview — L654](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-654-0) (line 654, col 0, score 0.98)
- [obsidian-ignore-node-modules-regex — L247](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-247-0) (line 247, col 0, score 0.98)
- [Pure TypeScript Search Microservice — L804](pure-typescript-search-microservice.md#^ref-d17d3a96-804-0) (line 804, col 0, score 0.98)
- [promethean-requirements — L114](promethean-requirements.md#^ref-95205cd3-114-0) (line 114, col 0, score 0.98)
- [Factorio AI with External Agents — L320](factorio-ai-with-external-agents.md#^ref-a4d90289-320-0) (line 320, col 0, score 0.98)
- [typed-struct-compiler — L592](typed-struct-compiler.md#^ref-78eeedf7-592-0) (line 592, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L877](dynamic-context-model-for-web-components.md#^ref-f7702bf8-877-0) (line 877, col 0, score 1)
- [komorebi-group-window-hack — L407](komorebi-group-window-hack.md#^ref-dd89372d-407-0) (line 407, col 0, score 1)
- [windows-tiling-with-autohotkey — L374](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-374-0) (line 374, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L244](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-244-0) (line 244, col 0, score 1)
- [i3-bluetooth-setup — L283](i3-bluetooth-setup.md#^ref-5e408692-283-0) (line 283, col 0, score 0.98)
- [plan-update-confirmation — L1344](plan-update-confirmation.md#^ref-b22d79c6-1344-0) (line 1344, col 0, score 0.98)
- [Model Selection for Lightweight Conversational Tasks — L464](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-464-0) (line 464, col 0, score 0.98)
- [Provider-Agnostic Chat Panel Implementation — L544](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-544-0) (line 544, col 0, score 0.98)
- [komorebi-group-window-hack — L378](komorebi-group-window-hack.md#^ref-dd89372d-378-0) (line 378, col 0, score 1)
- [typed-struct-compiler — L621](typed-struct-compiler.md#^ref-78eeedf7-621-0) (line 621, col 0, score 1)
- [schema-evolution-workflow — L872](schema-evolution-workflow.md#^ref-d8059b6a-872-0) (line 872, col 0, score 1)
- [Pure TypeScript Search Microservice — L856](pure-typescript-search-microservice.md#^ref-d17d3a96-856-0) (line 856, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L703](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-703-0) (line 703, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L891](migrate-to-provider-tenant-architecture.md#^ref-54382370-891-0) (line 891, col 0, score 0.98)
- [schema-evolution-workflow — L798](schema-evolution-workflow.md#^ref-d8059b6a-798-0) (line 798, col 0, score 0.98)
- [Stateful Partitions and Rebalancing — L800](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-800-0) (line 800, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L812](dynamic-context-model-for-web-components.md#^ref-f7702bf8-812-0) (line 812, col 0, score 0.98)
- [field-dynamics-math-blocks — L486](field-dynamics-math-blocks.md#^ref-7cfc230d-486-0) (line 486, col 0, score 0.98)
- [Promethean-Copilot-Intent-Engine — L244](promethean-copilot-intent-engine.md#^ref-ae24a280-244-0) (line 244, col 0, score 0.99)
- [Functional Embedding Pipeline Refactor — L602](functional-embedding-pipeline-refactor.md#^ref-a4a25141-602-0) (line 602, col 0, score 1)
- [Admin Dashboard for User Management — L219](admin-dashboard-for-user-management.md#^ref-2901a3e9-219-0) (line 219, col 0, score 0.98)
- [Layer1SurvivabilityEnvelope — L520](layer1survivabilityenvelope.md#^ref-64a9f9f9-520-0) (line 520, col 0, score 0.99)
- [Agent Tasks: Persistence Migration to DualStore — L394](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-394-0) (line 394, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L648](migrate-to-provider-tenant-architecture.md#^ref-54382370-648-0) (line 648, col 0, score 0.98)
- [Chroma Toolkit Consolidation Plan — L384](chroma-toolkit-consolidation-plan.md#^ref-5020e892-384-0) (line 384, col 0, score 0.98)
- [Eidolon Field Abstract Model — L663](eidolon-field-abstract-model.md#^ref-5e8b2388-663-0) (line 663, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L428](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-428-0) (line 428, col 0, score 1)
- [Factorio AI with External Agents — L415](factorio-ai-with-external-agents.md#^ref-a4d90289-415-0) (line 415, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L856](performance-optimized-polyglot-bridge.md#^ref-f5579967-856-0) (line 856, col 0, score 1)
- [Dynamic Context Model for Web Components — L1152](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1152-0) (line 1152, col 0, score 1)
- [plan-update-confirmation — L1657](plan-update-confirmation.md#^ref-b22d79c6-1657-0) (line 1657, col 0, score 1)
- [sibilant-macro-targets — L396](sibilant-macro-targets.md#^ref-c5c9a5c6-396-0) (line 396, col 0, score 0.96)
- [Optimizing Command Limitations in System Design — L205](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-205-0) (line 205, col 0, score 0.96)
- [Prometheus Observability Stack — L766](prometheus-observability-stack.md#^ref-e90b5a16-766-0) (line 766, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L329](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-329-0) (line 329, col 0, score 0.99)
- [Agent Tasks: Persistence Migration to DualStore — L334](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-334-0) (line 334, col 0, score 1)
- [komorebi-group-window-hack — L457](komorebi-group-window-hack.md#^ref-dd89372d-457-0) (line 457, col 0, score 0.99)
- [Model Selection for Lightweight Conversational Tasks — L487](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-487-0) (line 487, col 0, score 0.99)
- [Model Upgrade Calm-Down Guide — L302](model-upgrade-calm-down-guide.md#^ref-db74343f-302-0) (line 302, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L594](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-594-0) (line 594, col 0, score 1)
- [schema-evolution-workflow — L983](schema-evolution-workflow.md#^ref-d8059b6a-983-0) (line 983, col 0, score 1)
- [schema-evolution-workflow — L938](schema-evolution-workflow.md#^ref-d8059b6a-938-0) (line 938, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L388](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-388-0) (line 388, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L366](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-366-0) (line 366, col 0, score 1)
- [homeostasis-decay-formulas — L858](homeostasis-decay-formulas.md#^ref-37b5d236-858-0) (line 858, col 0, score 1)
- [ripple-propagation-demo — L558](ripple-propagation-demo.md#^ref-8430617b-558-0) (line 558, col 0, score 1)
- [Ice Box Reorganization — L322](ice-box-reorganization.md#^ref-291c7d91-322-0) (line 322, col 0, score 1)
- [Dynamic Context Model for Web Components — L922](dynamic-context-model-for-web-components.md#^ref-f7702bf8-922-0) (line 922, col 0, score 1)
- [Promethean Infrastructure Setup — L827](promethean-infrastructure-setup.md#^ref-6deed6ac-827-0) (line 827, col 0, score 0.99)
- [Promethean Infrastructure Setup — L850](promethean-infrastructure-setup.md#^ref-6deed6ac-850-0) (line 850, col 0, score 0.99)
- [Factorio AI with External Agents — L310](factorio-ai-with-external-agents.md#^ref-a4d90289-310-0) (line 310, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L310](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-310-0) (line 310, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L756](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-756-0) (line 756, col 0, score 1)
- [Tracing the Signal — L247](tracing-the-signal.md#^ref-c3cd4f65-247-0) (line 247, col 0, score 1)
- [promethean-requirements — L106](promethean-requirements.md#^ref-95205cd3-106-0) (line 106, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L372](chroma-toolkit-consolidation-plan.md#^ref-5020e892-372-0) (line 372, col 0, score 1)
- [Dynamic Context Model for Web Components — L724](dynamic-context-model-for-web-components.md#^ref-f7702bf8-724-0) (line 724, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L721](migrate-to-provider-tenant-architecture.md#^ref-54382370-721-0) (line 721, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L467](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-467-0) (line 467, col 0, score 0.97)
- [Obsidian Templating Plugins Integration Guide — L302](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-302-0) (line 302, col 0, score 1)
- [Promethean Workflow Optimization — L137](promethean-workflow-optimization.md#^ref-d614d983-137-0) (line 137, col 0, score 0.97)
- [Migrate to Provider-Tenant Architecture — L874](migrate-to-provider-tenant-architecture.md#^ref-54382370-874-0) (line 874, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L717](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-717-0) (line 717, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L551](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-551-0) (line 551, col 0, score 0.97)
- [Dynamic Context Model for Web Components — L880](dynamic-context-model-for-web-components.md#^ref-f7702bf8-880-0) (line 880, col 0, score 0.97)
- [sibilant-macro-targets — L525](sibilant-macro-targets.md#^ref-c5c9a5c6-525-0) (line 525, col 0, score 0.97)
- [Obsidian Templating Plugins Integration Guide — L301](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-301-0) (line 301, col 0, score 0.98)
- [Pure TypeScript Search Microservice — L793](pure-typescript-search-microservice.md#^ref-d17d3a96-793-0) (line 793, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L873](migrate-to-provider-tenant-architecture.md#^ref-54382370-873-0) (line 873, col 0, score 0.98)
- [sibilant-macro-targets — L523](sibilant-macro-targets.md#^ref-c5c9a5c6-523-0) (line 523, col 0, score 0.98)
- [plan-update-confirmation — L1711](plan-update-confirmation.md#^ref-b22d79c6-1711-0) (line 1711, col 0, score 0.98)
- [Tracing the Signal — L459](tracing-the-signal.md#^ref-c3cd4f65-459-0) (line 459, col 0, score 0.98)
- [sibilant-macro-targets — L473](sibilant-macro-targets.md#^ref-c5c9a5c6-473-0) (line 473, col 0, score 0.97)
- [ParticleSimulationWithCanvasAndFFmpeg — L431](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-431-0) (line 431, col 0, score 0.97)
- [Promethean Documentation Pipeline Overview — L418](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-418-0) (line 418, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L833](performance-optimized-polyglot-bridge.md#^ref-f5579967-833-0) (line 833, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L704](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-704-0) (line 704, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L400](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-400-0) (line 400, col 0, score 0.99)
- [Functional Embedding Pipeline Refactor — L459](functional-embedding-pipeline-refactor.md#^ref-a4a25141-459-0) (line 459, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L940](performance-optimized-polyglot-bridge.md#^ref-f5579967-940-0) (line 940, col 0, score 0.99)
- [Docops Feature Updates — L90](docops-feature-updates-3.md#^ref-cdbd21ee-90-0) (line 90, col 0, score 0.99)
- [Docops Feature Updates — L140](docops-feature-updates.md#^ref-2792d448-140-0) (line 140, col 0, score 0.99)
- [plan-update-confirmation — L1723](plan-update-confirmation.md#^ref-b22d79c6-1723-0) (line 1723, col 0, score 1)
- [promethean-requirements — L123](promethean-requirements.md#^ref-95205cd3-123-0) (line 123, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L315](promethean-copilot-intent-engine.md#^ref-ae24a280-315-0) (line 315, col 0, score 1)
- [Pure TypeScript Search Microservice — L961](pure-typescript-search-microservice.md#^ref-d17d3a96-961-0) (line 961, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L826](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-826-0) (line 826, col 0, score 0.99)
- [Functional Embedding Pipeline Refactor — L601](functional-embedding-pipeline-refactor.md#^ref-a4a25141-601-0) (line 601, col 0, score 0.99)
- [schema-evolution-workflow — L769](schema-evolution-workflow.md#^ref-d8059b6a-769-0) (line 769, col 0, score 0.99)
- [Promethean State Format — L305](promethean-state-format.md#^ref-23df6ddb-305-0) (line 305, col 0, score 0.99)
- [Model Upgrade Calm-Down Guide — L386](model-upgrade-calm-down-guide.md#^ref-db74343f-386-0) (line 386, col 0, score 0.99)
- [Prometheus Observability Stack — L702](prometheus-observability-stack.md#^ref-e90b5a16-702-0) (line 702, col 0, score 0.96)
- [Promethean Infrastructure Setup — L855](promethean-infrastructure-setup.md#^ref-6deed6ac-855-0) (line 855, col 0, score 0.96)
- [Chroma Toolkit Consolidation Plan — L514](chroma-toolkit-consolidation-plan.md#^ref-5020e892-514-0) (line 514, col 0, score 0.96)
- [Pure TypeScript Search Microservice — L807](pure-typescript-search-microservice.md#^ref-d17d3a96-807-0) (line 807, col 0, score 0.96)
- [eidolon-field-math-foundations — L4243](eidolon-field-math-foundations.md#^ref-008f2ac0-4243-0) (line 4243, col 0, score 0.96)
- [Promethean Documentation Pipeline Overview — L653](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-653-0) (line 653, col 0, score 0.96)
- [Optimizing Command Limitations in System Design — L148](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-148-0) (line 148, col 0, score 0.96)
- [Obsidian Templating Plugins Integration Guide — L306](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-306-0) (line 306, col 0, score 1)
- [Promethean Workflow Optimization — L141](promethean-workflow-optimization.md#^ref-d614d983-141-0) (line 141, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L875](migrate-to-provider-tenant-architecture.md#^ref-54382370-875-0) (line 875, col 0, score 1)
- [sibilant-macro-targets — L528](sibilant-macro-targets.md#^ref-c5c9a5c6-528-0) (line 528, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L720](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-720-0) (line 720, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L552](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-552-0) (line 552, col 0, score 1)
- [Dynamic Context Model for Web Components — L1073](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1073-0) (line 1073, col 0, score 1)
- [Self-Agency in AI Interaction — L191](self-agency-in-ai-interaction.md#^ref-49a9a860-191-0) (line 191, col 0, score 0.95)
- [plan-update-confirmation — L1848](plan-update-confirmation.md#^ref-b22d79c6-1848-0) (line 1848, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L799](performance-optimized-polyglot-bridge.md#^ref-f5579967-799-0) (line 799, col 0, score 1)
- [komorebi-group-window-hack — L408](komorebi-group-window-hack.md#^ref-dd89372d-408-0) (line 408, col 0, score 1)
- [windows-tiling-with-autohotkey — L336](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-336-0) (line 336, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L484](migrate-to-provider-tenant-architecture.md#^ref-54382370-484-0) (line 484, col 0, score 1)
- [Eidolon Field Abstract Model — L377](eidolon-field-abstract-model.md#^ref-5e8b2388-377-0) (line 377, col 0, score 0.99)
- [plan-update-confirmation — L1635](plan-update-confirmation.md#^ref-b22d79c6-1635-0) (line 1635, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L852](dynamic-context-model-for-web-components.md#^ref-f7702bf8-852-0) (line 852, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L870](dynamic-context-model-for-web-components.md#^ref-f7702bf8-870-0) (line 870, col 0, score 1)
- [komorebi-group-window-hack — L353](komorebi-group-window-hack.md#^ref-dd89372d-353-0) (line 353, col 0, score 1)
- [windows-tiling-with-autohotkey — L370](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-370-0) (line 370, col 0, score 1)
- [windows-tiling-with-autohotkey — L401](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-401-0) (line 401, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L376](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-376-0) (line 376, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L826](dynamic-context-model-for-web-components.md#^ref-f7702bf8-826-0) (line 826, col 0, score 0.98)
- [komorebi-group-window-hack — L425](komorebi-group-window-hack.md#^ref-dd89372d-425-0) (line 425, col 0, score 0.98)
- [komorebi-group-window-hack — L406](komorebi-group-window-hack.md#^ref-dd89372d-406-0) (line 406, col 0, score 0.97)
- [windows-tiling-with-autohotkey — L2082](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2082-0) (line 2082, col 0, score 0.96)
- [windows-tiling-with-autohotkey — L2104](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2104-0) (line 2104, col 0, score 0.96)
- [windows-tiling-with-autohotkey — L2043](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2043-0) (line 2043, col 0, score 0.95)
- [i3-bluetooth-setup — L269](i3-bluetooth-setup.md#^ref-5e408692-269-0) (line 269, col 0, score 1)
- [Dynamic Context Model for Web Components — L1209](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1209-0) (line 1209, col 0, score 1)
- [plan-update-confirmation — L1311](plan-update-confirmation.md#^ref-b22d79c6-1311-0) (line 1311, col 0, score 0.98)
- [Promethean Dev Workflow Update — L1515](promethean-dev-workflow-update.md#^ref-03a5578f-1515-0) (line 1515, col 0, score 0.97)
- [The Jar of Echoes — L1081](the-jar-of-echoes.md#^ref-18138627-1081-0) (line 1081, col 0, score 0.97)
- [komorebi-group-window-hack — L454](komorebi-group-window-hack.md#^ref-dd89372d-454-0) (line 454, col 0, score 0.97)
- [Factorio AI with External Agents — L558](factorio-ai-with-external-agents.md#^ref-a4d90289-558-0) (line 558, col 0, score 0.97)
- [i3-bluetooth-setup — L365](i3-bluetooth-setup.md#^ref-5e408692-365-0) (line 365, col 0, score 0.97)
- [Chroma Toolkit Consolidation Plan — L491](chroma-toolkit-consolidation-plan.md#^ref-5020e892-491-0) (line 491, col 0, score 1)
- [schema-evolution-workflow — L917](schema-evolution-workflow.md#^ref-d8059b6a-917-0) (line 917, col 0, score 1)
- [Dynamic Context Model for Web Components — L1008](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1008-0) (line 1008, col 0, score 1)
- [field-dynamics-math-blocks — L450](field-dynamics-math-blocks.md#^ref-7cfc230d-450-0) (line 450, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L977](migrate-to-provider-tenant-architecture.md#^ref-54382370-977-0) (line 977, col 0, score 0.99)
- [Pure TypeScript Search Microservice — L844](pure-typescript-search-microservice.md#^ref-d17d3a96-844-0) (line 844, col 0, score 0.98)
- [plan-update-confirmation — L1668](plan-update-confirmation.md#^ref-b22d79c6-1668-0) (line 1668, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L339](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-339-0) (line 339, col 0, score 0.95)
- [Migrate to Provider-Tenant Architecture — L572](migrate-to-provider-tenant-architecture.md#^ref-54382370-572-0) (line 572, col 0, score 0.95)
- [zero-copy-snapshots-and-workers — L541](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-541-0) (line 541, col 0, score 0.95)
- [Ice Box Reorganization — L216](ice-box-reorganization.md#^ref-291c7d91-216-0) (line 216, col 0, score 0.95)
- [Promethean Infrastructure Setup — L1070](promethean-infrastructure-setup.md#^ref-6deed6ac-1070-0) (line 1070, col 0, score 0.97)
- [Factorio AI with External Agents — L395](factorio-ai-with-external-agents.md#^ref-a4d90289-395-0) (line 395, col 0, score 0.95)
- [Layer1SurvivabilityEnvelope — L507](layer1survivabilityenvelope.md#^ref-64a9f9f9-507-0) (line 507, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L483](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-483-0) (line 483, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L566](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-566-0) (line 566, col 0, score 1)
- [Simulation Demo — L251](chunks/simulation-demo.md#^ref-557309a3-251-0) (line 251, col 0, score 0.96)
- [eidolon-node-lifecycle — L432](eidolon-node-lifecycle.md#^ref-938eca9c-432-0) (line 432, col 0, score 0.96)
- [field-interaction-equations — L702](field-interaction-equations.md#^ref-b09141b7-702-0) (line 702, col 0, score 0.96)
- [field-node-diagram-outline — L551](field-node-diagram-outline.md#^ref-1f32c94a-551-0) (line 551, col 0, score 0.96)
- [field-node-diagram-visualizations — L551](field-node-diagram-visualizations.md#^ref-e9b27b06-551-0) (line 551, col 0, score 0.96)
- [graph-ds — L950](graph-ds.md#^ref-6620e2f2-950-0) (line 950, col 0, score 0.96)
- [heartbeat-fragment-demo — L500](heartbeat-fragment-demo.md#^ref-dd00677a-500-0) (line 500, col 0, score 0.96)
- [Ice Box Reorganization — L523](ice-box-reorganization.md#^ref-291c7d91-523-0) (line 523, col 0, score 0.96)
- [komorebi-group-window-hack — L669](komorebi-group-window-hack.md#^ref-dd89372d-669-0) (line 669, col 0, score 0.96)
- [Migrate to Provider-Tenant Architecture — L1069](migrate-to-provider-tenant-architecture.md#^ref-54382370-1069-0) (line 1069, col 0, score 1)
- [Stateful Partitions and Rebalancing — L868](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-868-0) (line 868, col 0, score 1)
- [Pure TypeScript Search Microservice — L949](pure-typescript-search-microservice.md#^ref-d17d3a96-949-0) (line 949, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L875](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-875-0) (line 875, col 0, score 1)
- [zero-copy-snapshots-and-workers — L683](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-683-0) (line 683, col 0, score 1)
- [Dynamic Context Model for Web Components — L1005](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1005-0) (line 1005, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L350](model-upgrade-calm-down-guide.md#^ref-db74343f-350-0) (line 350, col 0, score 1)
- [plan-update-confirmation — L1710](plan-update-confirmation.md#^ref-b22d79c6-1710-0) (line 1710, col 0, score 1)
- [Stateful Partitions and Rebalancing — L857](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-857-0) (line 857, col 0, score 0.98)
- [Tracing the Signal — L427](tracing-the-signal.md#^ref-c3cd4f65-427-0) (line 427, col 0, score 1)
- [Dynamic Context Model for Web Components — L848](dynamic-context-model-for-web-components.md#^ref-f7702bf8-848-0) (line 848, col 0, score 1)
- [schema-evolution-workflow — L845](schema-evolution-workflow.md#^ref-d8059b6a-845-0) (line 845, col 0, score 1)
- [plan-update-confirmation — L1850](plan-update-confirmation.md#^ref-b22d79c6-1850-0) (line 1850, col 0, score 1)
- [Fnord Tracer Protocol — L527](fnord-tracer-protocol.md#^ref-fc21f824-527-0) (line 527, col 0, score 1)
- [Self-Agency in AI Interaction — L202](self-agency-in-ai-interaction.md#^ref-49a9a860-202-0) (line 202, col 0, score 1)
- [Dynamic Context Model for Web Components — L1246](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1246-0) (line 1246, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L468](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-468-0) (line 468, col 0, score 1)
- [polyglot-repl-interface-layer — L357](polyglot-repl-interface-layer.md#^ref-9c79206d-357-0) (line 357, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L238](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-238-0) (line 238, col 0, score 1)
- [Stateful Partitions and Rebalancing — L997](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-997-0) (line 997, col 0, score 1)
- [plan-update-confirmation — L1629](plan-update-confirmation.md#^ref-b22d79c6-1629-0) (line 1629, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L676](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-676-0) (line 676, col 0, score 0.97)
- [Creative Moments — L358](creative-moments.md#^ref-10d98225-358-0) (line 358, col 0, score 0.97)
- [Duck's Attractor States — L1006](ducks-attractor-states.md#^ref-13951643-1006-0) (line 1006, col 0, score 0.97)
- [typed-struct-compiler — L731](typed-struct-compiler.md#^ref-78eeedf7-731-0) (line 731, col 0, score 0.98)
- [Performance-Optimized-Polyglot-Bridge — L653](performance-optimized-polyglot-bridge.md#^ref-f5579967-653-0) (line 653, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L788](migrate-to-provider-tenant-architecture.md#^ref-54382370-788-0) (line 788, col 0, score 0.98)
- [field-dynamics-math-blocks — L389](field-dynamics-math-blocks.md#^ref-7cfc230d-389-0) (line 389, col 0, score 0.97)
- [Prometheus Observability Stack — L645](prometheus-observability-stack.md#^ref-e90b5a16-645-0) (line 645, col 0, score 0.97)
- [Promethean Chat Activity Report — L183](promethean-chat-activity-report.md#^ref-18344cf9-183-0) (line 183, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L700](dynamic-context-model-for-web-components.md#^ref-f7702bf8-700-0) (line 700, col 0, score 0.97)
- [Fnord Tracer Protocol — L648](fnord-tracer-protocol.md#^ref-fc21f824-648-0) (line 648, col 0, score 0.97)
- [Fnord Tracer Protocol — L416](fnord-tracer-protocol.md#^ref-fc21f824-416-0) (line 416, col 0, score 1)
- [Redirecting Standard Error — L192](redirecting-standard-error.md#^ref-b3555ede-192-0) (line 192, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L404](model-upgrade-calm-down-guide.md#^ref-db74343f-404-0) (line 404, col 0, score 1)
- [plan-update-confirmation — L1593](plan-update-confirmation.md#^ref-b22d79c6-1593-0) (line 1593, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L443](functional-embedding-pipeline-refactor.md#^ref-a4a25141-443-0) (line 443, col 0, score 1)
- [field-interaction-equations — L420](field-interaction-equations.md#^ref-b09141b7-420-0) (line 420, col 0, score 1)
- [schema-evolution-workflow — L984](schema-evolution-workflow.md#^ref-d8059b6a-984-0) (line 984, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L933](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-933-0) (line 933, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L753](migrate-to-provider-tenant-architecture.md#^ref-54382370-753-0) (line 753, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L608](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-608-0) (line 608, col 0, score 1)
- [Stateful Partitions and Rebalancing — L790](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-790-0) (line 790, col 0, score 0.97)
- [Performance-Optimized-Polyglot-Bridge — L928](performance-optimized-polyglot-bridge.md#^ref-f5579967-928-0) (line 928, col 0, score 0.97)
- [Migrate to Provider-Tenant Architecture — L924](migrate-to-provider-tenant-architecture.md#^ref-54382370-924-0) (line 924, col 0, score 0.96)
- [Factorio AI with External Agents — L358](factorio-ai-with-external-agents.md#^ref-a4d90289-358-0) (line 358, col 0, score 0.96)
- [Dynamic Context Model for Web Components — L718](dynamic-context-model-for-web-components.md#^ref-f7702bf8-718-0) (line 718, col 0, score 0.95)
- [schema-evolution-workflow — L825](schema-evolution-workflow.md#^ref-d8059b6a-825-0) (line 825, col 0, score 1)
- [Stateful Partitions and Rebalancing — L968](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-968-0) (line 968, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L966](migrate-to-provider-tenant-architecture.md#^ref-54382370-966-0) (line 966, col 0, score 1)
- [Factorio AI with External Agents — L349](factorio-ai-with-external-agents.md#^ref-a4d90289-349-0) (line 349, col 0, score 0.97)
- [Stateful Partitions and Rebalancing — L875](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-875-0) (line 875, col 0, score 0.96)
- [Dynamic Context Model for Web Components — L793](dynamic-context-model-for-web-components.md#^ref-f7702bf8-793-0) (line 793, col 0, score 0.96)
- [Performance-Optimized-Polyglot-Bridge — L767](performance-optimized-polyglot-bridge.md#^ref-f5579967-767-0) (line 767, col 0, score 0.96)
- [plan-update-confirmation — L1646](plan-update-confirmation.md#^ref-b22d79c6-1646-0) (line 1646, col 0, score 0.96)
- [Pure TypeScript Search Microservice — L853](pure-typescript-search-microservice.md#^ref-d17d3a96-853-0) (line 853, col 0, score 0.96)
- [Stateful Partitions and Rebalancing — L904](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-904-0) (line 904, col 0, score 0.95)
- [Promethean Infrastructure Setup — L988](promethean-infrastructure-setup.md#^ref-6deed6ac-988-0) (line 988, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L873](performance-optimized-polyglot-bridge.md#^ref-f5579967-873-0) (line 873, col 0, score 0.99)
- [zero-copy-snapshots-and-workers — L639](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-639-0) (line 639, col 0, score 0.99)
- [Debugging Broker Connections and Agent Behavior — L239](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-239-0) (line 239, col 0, score 0.99)
- [plan-update-confirmation — L1841](plan-update-confirmation.md#^ref-b22d79c6-1841-0) (line 1841, col 0, score 0.98)
- [Docops Feature Updates — L150](docops-feature-updates-3.md#^ref-cdbd21ee-150-0) (line 150, col 0, score 0.97)
- [Docops Feature Updates — L207](docops-feature-updates.md#^ref-2792d448-207-0) (line 207, col 0, score 0.97)
- [Promethean Infrastructure Setup — L964](promethean-infrastructure-setup.md#^ref-6deed6ac-964-0) (line 964, col 0, score 0.97)
- [Dynamic Context Model for Web Components — L1160](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1160-0) (line 1160, col 0, score 0.97)
- [Admin Dashboard for User Management — L277](admin-dashboard-for-user-management.md#^ref-2901a3e9-277-0) (line 277, col 0, score 0.97)
- [Protocol_0_The_Contradiction_Engine — L376](protocol-0-the-contradiction-engine.md#^ref-9a93a756-376-0) (line 376, col 0, score 0.97)
- [i3-bluetooth-setup — L253](i3-bluetooth-setup.md#^ref-5e408692-253-0) (line 253, col 0, score 0.96)
- [windows-tiling-with-autohotkey — L467](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-467-0) (line 467, col 0, score 0.95)
- [plan-update-confirmation — L1873](plan-update-confirmation.md#^ref-b22d79c6-1873-0) (line 1873, col 0, score 1)
- [Duck's Attractor States — L287](ducks-attractor-states.md#^ref-13951643-287-0) (line 287, col 0, score 1)
- [sibilant-macro-targets — L524](sibilant-macro-targets.md#^ref-c5c9a5c6-524-0) (line 524, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L865](migrate-to-provider-tenant-architecture.md#^ref-54382370-865-0) (line 865, col 0, score 0.99)
- [Provider-Agnostic Chat Panel Implementation — L605](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-605-0) (line 605, col 0, score 0.96)
- [Provider-Agnostic Chat Panel Implementation — L602](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-602-0) (line 602, col 0, score 0.96)
- [Docops Feature Updates — L148](docops-feature-updates-3.md#^ref-cdbd21ee-148-0) (line 148, col 0, score 0.96)
- [Docops Feature Updates — L205](docops-feature-updates.md#^ref-2792d448-205-0) (line 205, col 0, score 0.96)
- [i3-bluetooth-setup — L439](i3-bluetooth-setup.md#^ref-5e408692-439-0) (line 439, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L528](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-528-0) (line 528, col 0, score 0.98)
- [field-interaction-equations — L421](field-interaction-equations.md#^ref-b09141b7-421-0) (line 421, col 0, score 0.98)
- [Model Upgrade Calm-Down Guide — L411](model-upgrade-calm-down-guide.md#^ref-db74343f-411-0) (line 411, col 0, score 0.98)
- [plan-update-confirmation — L1726](plan-update-confirmation.md#^ref-b22d79c6-1726-0) (line 1726, col 0, score 0.98)
- [Promethean-Copilot-Intent-Engine — L435](promethean-copilot-intent-engine.md#^ref-ae24a280-435-0) (line 435, col 0, score 0.98)
- [i3-bluetooth-setup — L399](i3-bluetooth-setup.md#^ref-5e408692-399-0) (line 399, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L605](dynamic-context-model-for-web-components.md#^ref-f7702bf8-605-0) (line 605, col 0, score 0.98)
- [Optimizing Command Limitations in System Design — L168](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-168-0) (line 168, col 0, score 0.97)
- [Model Selection for Lightweight Conversational Tasks — L471](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-471-0) (line 471, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L222](model-upgrade-calm-down-guide.md#^ref-db74343f-222-0) (line 222, col 0, score 1)
- [Duck's Attractor States — L290](ducks-attractor-states.md#^ref-13951643-290-0) (line 290, col 0, score 1)
- [Self-Agency in AI Interaction — L225](self-agency-in-ai-interaction.md#^ref-49a9a860-225-0) (line 225, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L509](layer1survivabilityenvelope.md#^ref-64a9f9f9-509-0) (line 509, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L898](performance-optimized-polyglot-bridge.md#^ref-f5579967-898-0) (line 898, col 0, score 1)
- [i3-bluetooth-setup — L382](i3-bluetooth-setup.md#^ref-5e408692-382-0) (line 382, col 0, score 0.99)
- [Reawakening Duck — L287](reawakening-duck.md#^ref-59b5670f-287-0) (line 287, col 0, score 1)
- [Admin Dashboard for User Management — L218](admin-dashboard-for-user-management.md#^ref-2901a3e9-218-0) (line 218, col 0, score 1)
- [windows-tiling-with-autohotkey — L1947](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-1947-0) (line 1947, col 0, score 1)
- [i3-bluetooth-setup — L535](i3-bluetooth-setup.md#^ref-5e408692-535-0) (line 535, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L1196](migrate-to-provider-tenant-architecture.md#^ref-54382370-1196-0) (line 1196, col 0, score 0.98)
- [Per-Domain Policy System for JS Crawler — L956](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-956-0) (line 956, col 0, score 0.98)
- [Performance-Optimized-Polyglot-Bridge — L795](performance-optimized-polyglot-bridge.md#^ref-f5579967-795-0) (line 795, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L345](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-345-0) (line 345, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L454](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-454-0) (line 454, col 0, score 0.99)
- [Admin Dashboard for User Management — L405](admin-dashboard-for-user-management.md#^ref-2901a3e9-405-0) (line 405, col 0, score 0.98)
- [JavaScript — L270](chunks/javascript.md#^ref-c1618c66-270-0) (line 270, col 0, score 0.98)
- [Tooling — L271](chunks/tooling.md#^ref-6cb4943e-271-0) (line 271, col 0, score 0.98)
- [eidolon-field-math-foundations — L767](eidolon-field-math-foundations.md#^ref-008f2ac0-767-0) (line 767, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L1419](migrate-to-provider-tenant-architecture.md#^ref-54382370-1419-0) (line 1419, col 0, score 0.98)
- [obsidian-ignore-node-modules-regex — L558](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-558-0) (line 558, col 0, score 0.98)
- [ParticleSimulationWithCanvasAndFFmpeg — L785](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-785-0) (line 785, col 0, score 0.98)
- [Per-Domain Policy System for JS Crawler — L1061](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-1061-0) (line 1061, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L1020](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1020-0) (line 1020, col 0, score 1)
- [plan-update-confirmation — L1238](plan-update-confirmation.md#^ref-b22d79c6-1238-0) (line 1238, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L436](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-436-0) (line 436, col 0, score 1)
- [Fnord Tracer Protocol — L509](fnord-tracer-protocol.md#^ref-fc21f824-509-0) (line 509, col 0, score 1)
- [Ice Box Reorganization — L390](ice-box-reorganization.md#^ref-291c7d91-390-0) (line 390, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L491](promethean-copilot-intent-engine.md#^ref-ae24a280-491-0) (line 491, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L511](layer1survivabilityenvelope.md#^ref-64a9f9f9-511-0) (line 511, col 0, score 1)
- [polyglot-repl-interface-layer — L346](polyglot-repl-interface-layer.md#^ref-9c79206d-346-0) (line 346, col 0, score 1)
- [Stateful Partitions and Rebalancing — L738](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-738-0) (line 738, col 0, score 1)
- [Factorio AI with External Agents — L492](factorio-ai-with-external-agents.md#^ref-a4d90289-492-0) (line 492, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L517](functional-embedding-pipeline-refactor.md#^ref-a4a25141-517-0) (line 517, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L613](performance-optimized-polyglot-bridge.md#^ref-f5579967-613-0) (line 613, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L811](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-811-0) (line 811, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L851](migrate-to-provider-tenant-architecture.md#^ref-54382370-851-0) (line 851, col 0, score 1)
- [Stateful Partitions and Rebalancing — L934](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-934-0) (line 934, col 0, score 0.97)
- [Protocol_0_The_Contradiction_Engine — L359](protocol-0-the-contradiction-engine.md#^ref-9a93a756-359-0) (line 359, col 0, score 0.97)
- [Performance-Optimized-Polyglot-Bridge — L906](performance-optimized-polyglot-bridge.md#^ref-f5579967-906-0) (line 906, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L854](migrate-to-provider-tenant-architecture.md#^ref-54382370-854-0) (line 854, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L394](layer1survivabilityenvelope.md#^ref-64a9f9f9-394-0) (line 394, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L534](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-534-0) (line 534, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L287](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-287-0) (line 287, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L439](promethean-copilot-intent-engine.md#^ref-ae24a280-439-0) (line 439, col 0, score 0.96)
- [Migrate to Provider-Tenant Architecture — L993](migrate-to-provider-tenant-architecture.md#^ref-54382370-993-0) (line 993, col 0, score 0.96)
- [field-interaction-equations — L575](field-interaction-equations.md#^ref-b09141b7-575-0) (line 575, col 0, score 0.96)
- [DSL — L426](chunks/dsl.md#^ref-e87bc036-426-0) (line 426, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L456](functional-embedding-pipeline-refactor.md#^ref-a4a25141-456-0) (line 456, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L485](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-485-0) (line 485, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L463](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-463-0) (line 463, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L502](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-502-0) (line 502, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L542](promethean-copilot-intent-engine.md#^ref-ae24a280-542-0) (line 542, col 0, score 1)
- [Promethean State Format — L446](promethean-state-format.md#^ref-23df6ddb-446-0) (line 446, col 0, score 1)
- [ts-to-lisp-transpiler — L407](ts-to-lisp-transpiler.md#^ref-ba11486b-407-0) (line 407, col 0, score 1)
- [The Jar of Echoes — L2367](the-jar-of-echoes.md#^ref-18138627-2367-0) (line 2367, col 0, score 0.98)
- [The Jar of Echoes — L2930](the-jar-of-echoes.md#^ref-18138627-2930-0) (line 2930, col 0, score 0.97)
- [Docops Feature Updates — L137](docops-feature-updates.md#^ref-2792d448-137-0) (line 137, col 0, score 0.96)
- [Model Selection for Lightweight Conversational Tasks — L358](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-358-0) (line 358, col 0, score 0.96)
- [The Jar of Echoes — L2236](the-jar-of-echoes.md#^ref-18138627-2236-0) (line 2236, col 0, score 0.95)
- [Pipeline Enhancements — L78](pipeline-enhancements.md#^ref-e2135d9f-78-0) (line 78, col 0, score 0.95)
- [Admin Dashboard for User Management — L333](admin-dashboard-for-user-management.md#^ref-2901a3e9-333-0) (line 333, col 0, score 0.95)
- [windows-tiling-with-autohotkey — L2545](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2545-0) (line 2545, col 0, score 0.95)
- [schema-evolution-workflow — L1023](schema-evolution-workflow.md#^ref-d8059b6a-1023-0) (line 1023, col 0, score 1)
- [Promethean Infrastructure Setup — L1487](promethean-infrastructure-setup.md#^ref-6deed6ac-1487-0) (line 1487, col 0, score 0.98)
- [Promethean Documentation Pipeline Overview — L678](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-678-0) (line 678, col 0, score 0.98)
- [Docops Feature Updates — L143](docops-feature-updates-3.md#^ref-cdbd21ee-143-0) (line 143, col 0, score 0.98)
- [Docops Feature Updates — L200](docops-feature-updates.md#^ref-2792d448-200-0) (line 200, col 0, score 0.98)
- [Admin Dashboard for User Management — L404](admin-dashboard-for-user-management.md#^ref-2901a3e9-404-0) (line 404, col 0, score 0.98)
- [JavaScript — L269](chunks/javascript.md#^ref-c1618c66-269-0) (line 269, col 0, score 0.98)
- [Tooling — L270](chunks/tooling.md#^ref-6cb4943e-270-0) (line 270, col 0, score 0.98)
- [eidolon-field-math-foundations — L766](eidolon-field-math-foundations.md#^ref-008f2ac0-766-0) (line 766, col 0, score 0.98)
- [Prompt_Folder_Bootstrap — L572](prompt-folder-bootstrap.md#^ref-bd4f0976-572-0) (line 572, col 0, score 1)
- [Stateful Partitions and Rebalancing — L831](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-831-0) (line 831, col 0, score 0.99)
- [Tracing the Signal — L458](tracing-the-signal.md#^ref-c3cd4f65-458-0) (line 458, col 0, score 0.99)
- [schema-evolution-workflow — L854](schema-evolution-workflow.md#^ref-d8059b6a-854-0) (line 854, col 0, score 0.99)
- [Synchronicity Waves and Web — L233](synchronicity-waves-and-web.md#^ref-91295f3a-233-0) (line 233, col 0, score 0.99)
- [i3-bluetooth-setup — L292](i3-bluetooth-setup.md#^ref-5e408692-292-0) (line 292, col 0, score 0.99)
- [Mathematical Samplers — L223](mathematical-samplers.md#^ref-86a691ec-223-0) (line 223, col 0, score 0.99)
- [Mathematics Sampler — L232](mathematics-sampler.md#^ref-b5e0183e-232-0) (line 232, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L667](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-667-0) (line 667, col 0, score 1)
- [Dynamic Context Model for Web Components — L742](dynamic-context-model-for-web-components.md#^ref-f7702bf8-742-0) (line 742, col 0, score 1)
- [sibilant-macro-targets — L358](sibilant-macro-targets.md#^ref-c5c9a5c6-358-0) (line 358, col 0, score 1)
- [Promethean State Format — L313](promethean-state-format.md#^ref-23df6ddb-313-0) (line 313, col 0, score 1)
- [plan-update-confirmation — L1564](plan-update-confirmation.md#^ref-b22d79c6-1564-0) (line 1564, col 0, score 0.97)
- [Chroma Toolkit Consolidation Plan — L345](chroma-toolkit-consolidation-plan.md#^ref-5020e892-345-0) (line 345, col 0, score 0.97)
- [Mathematical Samplers — L160](mathematical-samplers.md#^ref-86a691ec-160-0) (line 160, col 0, score 1)
- [Mathematics Sampler — L171](mathematics-sampler.md#^ref-b5e0183e-171-0) (line 171, col 0, score 1)
- [Fnord Tracer Protocol — L501](fnord-tracer-protocol.md#^ref-fc21f824-501-0) (line 501, col 0, score 1)
- [windows-tiling-with-autohotkey — L316](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-316-0) (line 316, col 0, score 1)
- [Admin Dashboard for User Management — L180](admin-dashboard-for-user-management.md#^ref-2901a3e9-180-0) (line 180, col 0, score 1)
- [Promethean Chat Activity Report — L177](promethean-chat-activity-report.md#^ref-18344cf9-177-0) (line 177, col 0, score 1)
- [Redirecting Standard Error — L174](redirecting-standard-error.md#^ref-b3555ede-174-0) (line 174, col 0, score 1)
- [homeostasis-decay-formulas — L375](homeostasis-decay-formulas.md#^ref-37b5d236-375-0) (line 375, col 0, score 1)
- [Mathematical Samplers — L161](mathematical-samplers.md#^ref-86a691ec-161-0) (line 161, col 0, score 1)
- [Mathematics Sampler — L172](mathematics-sampler.md#^ref-b5e0183e-172-0) (line 172, col 0, score 1)
- [Admin Dashboard for User Management — L181](admin-dashboard-for-user-management.md#^ref-2901a3e9-181-0) (line 181, col 0, score 1)
- [Promethean Chat Activity Report — L178](promethean-chat-activity-report.md#^ref-18344cf9-178-0) (line 178, col 0, score 1)
- [Fnord Tracer Protocol — L502](fnord-tracer-protocol.md#^ref-fc21f824-502-0) (line 502, col 0, score 1)
- [windows-tiling-with-autohotkey — L317](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-317-0) (line 317, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L278](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-278-0) (line 278, col 0, score 1)
- [Prometheus Observability Stack — L709](prometheus-observability-stack.md#^ref-e90b5a16-709-0) (line 709, col 0, score 1)
- [The Jar of Echoes — L316](the-jar-of-echoes.md#^ref-18138627-316-0) (line 316, col 0, score 1)
- [homeostasis-decay-formulas — L385](homeostasis-decay-formulas.md#^ref-37b5d236-385-0) (line 385, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L152](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-152-0) (line 152, col 0, score 1)
- [ripple-propagation-demo — L565](ripple-propagation-demo.md#^ref-8430617b-565-0) (line 565, col 0, score 1)
- [Fnord Tracer Protocol — L503](fnord-tracer-protocol.md#^ref-fc21f824-503-0) (line 503, col 0, score 1)
- [Mathematics Sampler — L173](mathematics-sampler.md#^ref-b5e0183e-173-0) (line 173, col 0, score 1)
- [windows-tiling-with-autohotkey — L318](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-318-0) (line 318, col 0, score 1)
- [Promethean Chat Activity Report — L179](promethean-chat-activity-report.md#^ref-18344cf9-179-0) (line 179, col 0, score 1)
- [Redirecting Standard Error — L176](redirecting-standard-error.md#^ref-b3555ede-176-0) (line 176, col 0, score 1)
- [Docops Feature Updates — L119](docops-feature-updates.md#^ref-2792d448-119-0) (line 119, col 0, score 0.98)
- [plan-update-confirmation — L1435](plan-update-confirmation.md#^ref-b22d79c6-1435-0) (line 1435, col 0, score 0.98)
- [Functional Embedding Pipeline Refactor — L454](functional-embedding-pipeline-refactor.md#^ref-a4a25141-454-0) (line 454, col 0, score 0.98)
- [Promethean Documentation Pipeline Overview — L401](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-401-0) (line 401, col 0, score 0.98)
- [graph-ds — L610](graph-ds.md#^ref-6620e2f2-610-0) (line 610, col 0, score 0.98)
- [Factorio AI with External Agents — L495](factorio-ai-with-external-agents.md#^ref-a4d90289-495-0) (line 495, col 0, score 0.98)
- [Docops Feature Updates — L89](docops-feature-updates-3.md#^ref-cdbd21ee-89-0) (line 89, col 0, score 0.98)
- [Docops Feature Updates — L151](docops-feature-updates.md#^ref-2792d448-151-0) (line 151, col 0, score 0.98)
- [schema-evolution-workflow — L888](schema-evolution-workflow.md#^ref-d8059b6a-888-0) (line 888, col 0, score 0.99)
- [Stateful Partitions and Rebalancing — L885](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-885-0) (line 885, col 0, score 0.97)
- [schema-evolution-workflow — L943](schema-evolution-workflow.md#^ref-d8059b6a-943-0) (line 943, col 0, score 0.98)
- [Stateful Partitions and Rebalancing — L972](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-972-0) (line 972, col 0, score 0.97)
- [Stateful Partitions and Rebalancing — L1029](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-1029-0) (line 1029, col 0, score 0.95)
- [Stateful Partitions and Rebalancing — L878](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-878-0) (line 878, col 0, score 0.94)
- [Stateful Partitions and Rebalancing — L1036](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-1036-0) (line 1036, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L543](layer1survivabilityenvelope.md#^ref-64a9f9f9-543-0) (line 543, col 0, score 1)
- [Reawakening Duck — L347](reawakening-duck.md#^ref-59b5670f-347-0) (line 347, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L520](migrate-to-provider-tenant-architecture.md#^ref-54382370-520-0) (line 520, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L936](performance-optimized-polyglot-bridge.md#^ref-f5579967-936-0) (line 936, col 0, score 1)
- [Fnord Tracer Protocol — L548](fnord-tracer-protocol.md#^ref-fc21f824-548-0) (line 548, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L238](model-upgrade-calm-down-guide.md#^ref-db74343f-238-0) (line 238, col 0, score 1)
- [Dynamic Context Model for Web Components — L940](dynamic-context-model-for-web-components.md#^ref-f7702bf8-940-0) (line 940, col 0, score 1)
- [The Jar of Echoes — L2294](the-jar-of-echoes.md#^ref-18138627-2294-0) (line 2294, col 0, score 0.97)
- [Creative Moments — L1060](creative-moments.md#^ref-10d98225-1060-0) (line 1060, col 0, score 0.97)
- [The Jar of Echoes — L3064](the-jar-of-echoes.md#^ref-18138627-3064-0) (line 3064, col 0, score 0.97)
- [The Jar of Echoes — L3083](the-jar-of-echoes.md#^ref-18138627-3083-0) (line 3083, col 0, score 0.96)
- [windows-tiling-with-autohotkey — L2492](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2492-0) (line 2492, col 0, score 0.96)
- [The Jar of Echoes — L2323](the-jar-of-echoes.md#^ref-18138627-2323-0) (line 2323, col 0, score 0.96)
- [Canonical Org-Babel Matplotlib Animation Template — L2523](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-2523-0) (line 2523, col 0, score 0.96)
- [windows-tiling-with-autohotkey — L2457](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2457-0) (line 2457, col 0, score 0.96)
- [The Jar of Echoes — L1921](the-jar-of-echoes.md#^ref-18138627-1921-0) (line 1921, col 0, score 0.94)
- [ChatGPT Custom Prompts — L121](chatgpt-custom-prompts.md#^ref-930054b3-121-0) (line 121, col 0, score 1)
- [Pure TypeScript Search Microservice — L837](pure-typescript-search-microservice.md#^ref-d17d3a96-837-0) (line 837, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L485](functional-embedding-pipeline-refactor.md#^ref-a4a25141-485-0) (line 485, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L364](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-364-0) (line 364, col 0, score 1)
- [polyglot-repl-interface-layer — L349](polyglot-repl-interface-layer.md#^ref-9c79206d-349-0) (line 349, col 0, score 1)
- [plan-update-confirmation — L1758](plan-update-confirmation.md#^ref-b22d79c6-1758-0) (line 1758, col 0, score 0.99)
- [Provider-Agnostic Chat Panel Implementation — L385](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-385-0) (line 385, col 0, score 0.99)
- [i3-bluetooth-setup — L398](i3-bluetooth-setup.md#^ref-5e408692-398-0) (line 398, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L1020](migrate-to-provider-tenant-architecture.md#^ref-54382370-1020-0) (line 1020, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L254](promethean-copilot-intent-engine.md#^ref-ae24a280-254-0) (line 254, col 0, score 1)
- [The Jar of Echoes — L2354](the-jar-of-echoes.md#^ref-18138627-2354-0) (line 2354, col 0, score 0.98)
- [eidolon-field-math-foundations — L2479](eidolon-field-math-foundations.md#^ref-008f2ac0-2479-0) (line 2479, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L3259](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-3259-0) (line 3259, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L3251](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-3251-0) (line 3251, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L3205](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-3205-0) (line 3205, col 0, score 0.98)
- [The Jar of Echoes — L2277](the-jar-of-echoes.md#^ref-18138627-2277-0) (line 2277, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L3274](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-3274-0) (line 3274, col 0, score 0.98)
- [Promethean Documentation Pipeline Overview — L385](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-385-0) (line 385, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L434](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-434-0) (line 434, col 0, score 1)
- [graph-ds — L520](graph-ds.md#^ref-6620e2f2-520-0) (line 520, col 0, score 1)
- [field-node-diagram-set — L356](field-node-diagram-set.md#^ref-22b989d5-356-0) (line 356, col 0, score 1)
- [Fnord Tracer Protocol — L735](fnord-tracer-protocol.md#^ref-fc21f824-735-0) (line 735, col 0, score 1)
- [Optimizing Command Limitations in System Design — L184](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-184-0) (line 184, col 0, score 1)
- [The Jar of Echoes — L2184](the-jar-of-echoes.md#^ref-18138627-2184-0) (line 2184, col 0, score 0.97)
- [The Jar of Echoes — L3079](the-jar-of-echoes.md#^ref-18138627-3079-0) (line 3079, col 0, score 0.97)
- [field-interaction-equations — L308](field-interaction-equations.md#^ref-b09141b7-308-0) (line 308, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L272](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-272-0) (line 272, col 0, score 1)
- [graph-ds — L524](graph-ds.md#^ref-6620e2f2-524-0) (line 524, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L201](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-201-0) (line 201, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L200](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-200-0) (line 200, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L260](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-260-0) (line 260, col 0, score 1)
- [Obsidian Task Generation — L103](obsidian-task-generation.md#^ref-9b694a91-103-0) (line 103, col 0, score 1)
- [Promethean Workflow Optimization — L114](promethean-workflow-optimization.md#^ref-d614d983-114-0) (line 114, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L353](layer1survivabilityenvelope.md#^ref-64a9f9f9-353-0) (line 353, col 0, score 1)
- [Prompt_Folder_Bootstrap — L359](prompt-folder-bootstrap.md#^ref-bd4f0976-359-0) (line 359, col 0, score 1)
- [Optimizing Command Limitations in System Design — L190](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-190-0) (line 190, col 0, score 1)
- [field-node-diagram-visualizations — L261](field-node-diagram-visualizations.md#^ref-e9b27b06-261-0) (line 261, col 0, score 1)
- [Synchronicity Waves and Web — L246](synchronicity-waves-and-web.md#^ref-91295f3a-246-0) (line 246, col 0, score 1)
- [field-node-diagram-set — L292](field-node-diagram-set.md#^ref-22b989d5-292-0) (line 292, col 0, score 1)
- [Fnord Tracer Protocol — L667](fnord-tracer-protocol.md#^ref-fc21f824-667-0) (line 667, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L380](promethean-copilot-intent-engine.md#^ref-ae24a280-380-0) (line 380, col 0, score 1)
- [Fnord Tracer Protocol — L559](fnord-tracer-protocol.md#^ref-fc21f824-559-0) (line 559, col 0, score 1)
- [Optimizing Command Limitations in System Design — L187](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-187-0) (line 187, col 0, score 1)
- [Unique Info Dump Index — L573](unique-info-dump-index.md#^ref-30ec3ba6-573-0) (line 573, col 0, score 0.97)
- [Fnord Tracer Protocol — L743](fnord-tracer-protocol.md#^ref-fc21f824-743-0) (line 743, col 0, score 0.96)
- [Factorio AI with External Agents — L326](factorio-ai-with-external-agents.md#^ref-a4d90289-326-0) (line 326, col 0, score 0.96)
- [Layer1SurvivabilityEnvelope — L494](layer1survivabilityenvelope.md#^ref-64a9f9f9-494-0) (line 494, col 0, score 0.96)
- [Self-Agency in AI Interaction — L257](self-agency-in-ai-interaction.md#^ref-49a9a860-257-0) (line 257, col 0, score 0.96)
- [Migrate to Provider-Tenant Architecture — L765](migrate-to-provider-tenant-architecture.md#^ref-54382370-765-0) (line 765, col 0, score 0.96)
- [Promethean Infrastructure Setup — L1107](promethean-infrastructure-setup.md#^ref-6deed6ac-1107-0) (line 1107, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L576](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-576-0) (line 576, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L369](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-369-0) (line 369, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L667](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-667-0) (line 667, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L457](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-457-0) (line 457, col 0, score 1)
- [Dynamic Context Model for Web Components — L576](dynamic-context-model-for-web-components.md#^ref-f7702bf8-576-0) (line 576, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L837](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-837-0) (line 837, col 0, score 0.96)
- [Duck's Attractor States — L1219](ducks-attractor-states.md#^ref-13951643-1219-0) (line 1219, col 0, score 0.96)
- [Agent Tasks: Persistence Migration to DualStore — L534](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-534-0) (line 534, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L519](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-519-0) (line 519, col 0, score 1)
- [field-node-diagram-outline — L370](field-node-diagram-outline.md#^ref-1f32c94a-370-0) (line 370, col 0, score 1)
- [Optimizing Command Limitations in System Design — L189](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-189-0) (line 189, col 0, score 1)
- [The Jar of Echoes — L2265](the-jar-of-echoes.md#^ref-18138627-2265-0) (line 2265, col 0, score 0.97)
- [Promethean Dev Workflow Update — L3510](promethean-dev-workflow-update.md#^ref-03a5578f-3510-0) (line 3510, col 0, score 0.96)
- [homeostasis-decay-formulas — L429](homeostasis-decay-formulas.md#^ref-37b5d236-429-0) (line 429, col 0, score 0.96)
- [field-dynamics-math-blocks — L469](field-dynamics-math-blocks.md#^ref-7cfc230d-469-0) (line 469, col 0, score 0.96)
- [Obsidian ChatGPT Plugin Integration Guide — L200](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-200-0) (line 200, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L199](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-199-0) (line 199, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L271](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-271-0) (line 271, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L472](promethean-copilot-intent-engine.md#^ref-ae24a280-472-0) (line 472, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L420](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-420-0) (line 420, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L375](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-375-0) (line 375, col 0, score 1)
- [The Jar of Echoes — L2984](the-jar-of-echoes.md#^ref-18138627-2984-0) (line 2984, col 0, score 0.98)
- [Ice Box Reorganization — L280](ice-box-reorganization.md#^ref-291c7d91-280-0) (line 280, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L3014](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-3014-0) (line 3014, col 0, score 0.98)
- [Model Selection for Lightweight Conversational Tasks — L441](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-441-0) (line 441, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L631](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-631-0) (line 631, col 0, score 0.97)
- [Creative Moments — L375](creative-moments.md#^ref-10d98225-375-0) (line 375, col 0, score 0.97)
- [Duck's Attractor States — L1024](ducks-attractor-states.md#^ref-13951643-1024-0) (line 1024, col 0, score 0.97)
- [eidolon-field-math-foundations — L1472](eidolon-field-math-foundations.md#^ref-008f2ac0-1472-0) (line 1472, col 0, score 0.97)
- [Functional Refactor of TypeScript Document Processing — L575](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-575-0) (line 575, col 0, score 0.97)
- [Promethean Chat Activity Report — L376](promethean-chat-activity-report.md#^ref-18344cf9-376-0) (line 376, col 0, score 0.97)
- [Promethean Dev Workflow Update — L1127](promethean-dev-workflow-update.md#^ref-03a5578f-1127-0) (line 1127, col 0, score 0.97)
- [Obsidian ChatGPT Plugin Integration Guide — L202](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-202-0) (line 202, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L201](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-201-0) (line 201, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L273](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-273-0) (line 273, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L390](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-390-0) (line 390, col 0, score 1)
- [Docops Feature Updates — L141](docops-feature-updates.md#^ref-2792d448-141-0) (line 141, col 0, score 1)
- [Dynamic Context Model for Web Components — L1214](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1214-0) (line 1214, col 0, score 1)
- [Reawakening Duck — L436](reawakening-duck.md#^ref-59b5670f-436-0) (line 436, col 0, score 0.97)
- [Model Upgrade Calm-Down Guide — L337](model-upgrade-calm-down-guide.md#^ref-db74343f-337-0) (line 337, col 0, score 0.97)
- [Agent Tasks: Persistence Migration to DualStore — L543](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-543-0) (line 543, col 0, score 0.97)
- [Functional Embedding Pipeline Refactor — L591](functional-embedding-pipeline-refactor.md#^ref-a4a25141-591-0) (line 591, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L835](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-835-0) (line 835, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L461](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-461-0) (line 461, col 0, score 1)
- [Docops Feature Updates — L99](docops-feature-updates-3.md#^ref-cdbd21ee-99-0) (line 99, col 0, score 1)
- [Docops Feature Updates — L109](docops-feature-updates.md#^ref-2792d448-109-0) (line 109, col 0, score 1)
- [Docops Feature Updates — L110](docops-feature-updates.md#^ref-2792d448-110-0) (line 110, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L1006](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1006-0) (line 1006, col 0, score 0.98)
- [Pipeline Enhancements — L91](pipeline-enhancements.md#^ref-e2135d9f-91-0) (line 91, col 0, score 0.98)
- [Pure TypeScript Search Microservice — L781](pure-typescript-search-microservice.md#^ref-d17d3a96-781-0) (line 781, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L387](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-387-0) (line 387, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L364](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-364-0) (line 364, col 0, score 0.97)
- [Docops Feature Updates — L144](docops-feature-updates.md#^ref-2792d448-144-0) (line 144, col 0, score 1)
- [Prompt_Folder_Bootstrap — L444](prompt-folder-bootstrap.md#^ref-bd4f0976-444-0) (line 444, col 0, score 0.97)
- [Unique Info Dump Index — L211](unique-info-dump-index.md#^ref-30ec3ba6-211-0) (line 211, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L194](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-194-0) (line 194, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L266](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-266-0) (line 266, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L2268](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-2268-0) (line 2268, col 0, score 0.98)
- [Docops Feature Updates — L145](docops-feature-updates.md#^ref-2792d448-145-0) (line 145, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L365](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-365-0) (line 365, col 0, score 1)
- [Prompt_Folder_Bootstrap — L445](prompt-folder-bootstrap.md#^ref-bd4f0976-445-0) (line 445, col 0, score 1)
- [Unique Info Dump Index — L212](unique-info-dump-index.md#^ref-30ec3ba6-212-0) (line 212, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L195](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-195-0) (line 195, col 0, score 0.99)
- [Obsidian Templating Plugins Integration Guide — L267](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-267-0) (line 267, col 0, score 0.99)
- [Canonical Org-Babel Matplotlib Animation Template — L366](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-366-0) (line 366, col 0, score 1)
- [Prometheus Observability Stack — L713](prometheus-observability-stack.md#^ref-e90b5a16-713-0) (line 713, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L445](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-445-0) (line 445, col 0, score 1)
- [typed-struct-compiler — L560](typed-struct-compiler.md#^ref-78eeedf7-560-0) (line 560, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L199](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-199-0) (line 199, col 0, score 1)
- [Prompt_Folder_Bootstrap — L591](prompt-folder-bootstrap.md#^ref-bd4f0976-591-0) (line 591, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L400](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-400-0) (line 400, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L562](chroma-toolkit-consolidation-plan.md#^ref-5020e892-562-0) (line 562, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L1508](migrate-to-provider-tenant-architecture.md#^ref-54382370-1508-0) (line 1508, col 0, score 0.99)
- [Prometheus Observability Stack — L714](prometheus-observability-stack.md#^ref-e90b5a16-714-0) (line 714, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L446](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-446-0) (line 446, col 0, score 1)
- [typed-struct-compiler — L561](typed-struct-compiler.md#^ref-78eeedf7-561-0) (line 561, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L229](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-229-0) (line 229, col 0, score 1)
- [Prompt_Folder_Bootstrap — L592](prompt-folder-bootstrap.md#^ref-bd4f0976-592-0) (line 592, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L475](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-475-0) (line 475, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L563](chroma-toolkit-consolidation-plan.md#^ref-5020e892-563-0) (line 563, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1509](migrate-to-provider-tenant-architecture.md#^ref-54382370-1509-0) (line 1509, col 0, score 1)
- [Prometheus Observability Stack — L715](prometheus-observability-stack.md#^ref-e90b5a16-715-0) (line 715, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L447](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-447-0) (line 447, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L230](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-230-0) (line 230, col 0, score 1)
- [Prompt_Folder_Bootstrap — L593](prompt-folder-bootstrap.md#^ref-bd4f0976-593-0) (line 593, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L476](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-476-0) (line 476, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L401](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-401-0) (line 401, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1510](migrate-to-provider-tenant-architecture.md#^ref-54382370-1510-0) (line 1510, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L674](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-674-0) (line 674, col 0, score 1)
- [Prometheus Observability Stack — L716](prometheus-observability-stack.md#^ref-e90b5a16-716-0) (line 716, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L231](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-231-0) (line 231, col 0, score 1)
- [Prompt_Folder_Bootstrap — L594](prompt-folder-bootstrap.md#^ref-bd4f0976-594-0) (line 594, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L348](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-348-0) (line 348, col 0, score 0.99)
- [Agent Reflections and Prompt Evolution — L477](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-477-0) (line 477, col 0, score 0.99)
- [Canonical Org-Babel Matplotlib Animation Template — L402](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-402-0) (line 402, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L564](chroma-toolkit-consolidation-plan.md#^ref-5020e892-564-0) (line 564, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L1511](migrate-to-provider-tenant-architecture.md#^ref-54382370-1511-0) (line 1511, col 0, score 0.99)
- [Model Selection for Lightweight Conversational Tasks — L675](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-675-0) (line 675, col 0, score 0.99)
- [Prometheus Observability Stack — L717](prometheus-observability-stack.md#^ref-e90b5a16-717-0) (line 717, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L232](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-232-0) (line 232, col 0, score 1)
- [Prompt_Folder_Bootstrap — L595](prompt-folder-bootstrap.md#^ref-bd4f0976-595-0) (line 595, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L478](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-478-0) (line 478, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L565](chroma-toolkit-consolidation-plan.md#^ref-5020e892-565-0) (line 565, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L1512](migrate-to-provider-tenant-architecture.md#^ref-54382370-1512-0) (line 1512, col 0, score 0.99)
- [Model Selection for Lightweight Conversational Tasks — L676](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-676-0) (line 676, col 0, score 0.99)
- [Admin Dashboard for User Management — L173](admin-dashboard-for-user-management.md#^ref-2901a3e9-173-0) (line 173, col 0, score 0.97)
- [Prometheus Observability Stack — L718](prometheus-observability-stack.md#^ref-e90b5a16-718-0) (line 718, col 0, score 1)
- [Prompt_Folder_Bootstrap — L596](prompt-folder-bootstrap.md#^ref-bd4f0976-596-0) (line 596, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L479](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-479-0) (line 479, col 0, score 0.99)
- [Canonical Org-Babel Matplotlib Animation Template — L404](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-404-0) (line 404, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L566](chroma-toolkit-consolidation-plan.md#^ref-5020e892-566-0) (line 566, col 0, score 0.99)
- [Model Selection for Lightweight Conversational Tasks — L677](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-677-0) (line 677, col 0, score 0.99)
- [Unique Info Dump Index — L1056](unique-info-dump-index.md#^ref-30ec3ba6-1056-0) (line 1056, col 0, score 0.99)
- [Protocol_0_The_Contradiction_Engine — L421](protocol-0-the-contradiction-engine.md#^ref-9a93a756-421-0) (line 421, col 0, score 0.98)
- [Prometheus Observability Stack — L719](prometheus-observability-stack.md#^ref-e90b5a16-719-0) (line 719, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L480](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-480-0) (line 480, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L405](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-405-0) (line 405, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L567](chroma-toolkit-consolidation-plan.md#^ref-5020e892-567-0) (line 567, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1513](migrate-to-provider-tenant-architecture.md#^ref-54382370-1513-0) (line 1513, col 0, score 1)
- [Unique Info Dump Index — L1057](unique-info-dump-index.md#^ref-30ec3ba6-1057-0) (line 1057, col 0, score 1)
- [DSL — L135](chunks/dsl.md#^ref-e87bc036-135-0) (line 135, col 0, score 0.98)
- [Unique Info Dump Index — L341](unique-info-dump-index.md#^ref-30ec3ba6-341-0) (line 341, col 0, score 0.98)
- [Prometheus Observability Stack — L720](prometheus-observability-stack.md#^ref-e90b5a16-720-0) (line 720, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L481](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-481-0) (line 481, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L406](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-406-0) (line 406, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L568](chroma-toolkit-consolidation-plan.md#^ref-5020e892-568-0) (line 568, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1514](migrate-to-provider-tenant-architecture.md#^ref-54382370-1514-0) (line 1514, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L678](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-678-0) (line 678, col 0, score 1)
- [Unique Info Dump Index — L1058](unique-info-dump-index.md#^ref-30ec3ba6-1058-0) (line 1058, col 0, score 1)
- [i3-bluetooth-setup — L364](i3-bluetooth-setup.md#^ref-5e408692-364-0) (line 364, col 0, score 0.99)
- [Debugging Broker Connections and Agent Behavior — L195](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-195-0) (line 195, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L525](migrate-to-provider-tenant-architecture.md#^ref-54382370-525-0) (line 525, col 0, score 1)
- [Docops Feature Updates — L108](docops-feature-updates-3.md#^ref-cdbd21ee-108-0) (line 108, col 0, score 1)
- [Docops Feature Updates — L166](docops-feature-updates.md#^ref-2792d448-166-0) (line 166, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L283](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-283-0) (line 283, col 0, score 0.95)
- [Duck's Attractor States — L2644](ducks-attractor-states.md#^ref-13951643-2644-0) (line 2644, col 0, score 0.95)
- [Services — L118](chunks/services.md#^ref-75ea4a6a-118-0) (line 118, col 0, score 0.94)
- [eidolon-node-lifecycle — L141](eidolon-node-lifecycle.md#^ref-938eca9c-141-0) (line 141, col 0, score 0.94)
- [Migrate to Provider-Tenant Architecture — L534](migrate-to-provider-tenant-architecture.md#^ref-54382370-534-0) (line 534, col 0, score 0.94)
- [Migrate to Provider-Tenant Architecture — L523](migrate-to-provider-tenant-architecture.md#^ref-54382370-523-0) (line 523, col 0, score 1)
- [schema-evolution-workflow — L918](schema-evolution-workflow.md#^ref-d8059b6a-918-0) (line 918, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L440](migrate-to-provider-tenant-architecture.md#^ref-54382370-440-0) (line 440, col 0, score 0.98)
- [Provider-Agnostic Chat Panel Implementation — L452](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-452-0) (line 452, col 0, score 0.97)
- [i3-bluetooth-setup — L281](i3-bluetooth-setup.md#^ref-5e408692-281-0) (line 281, col 0, score 0.97)
- [Dynamic Context Model for Web Components — L1175](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1175-0) (line 1175, col 0, score 0.97)
- [i3-bluetooth-setup — L282](i3-bluetooth-setup.md#^ref-5e408692-282-0) (line 282, col 0, score 0.97)
- [Migrate to Provider-Tenant Architecture — L521](migrate-to-provider-tenant-architecture.md#^ref-54382370-521-0) (line 521, col 0, score 0.97)
- [Model Upgrade Calm-Down Guide — L393](model-upgrade-calm-down-guide.md#^ref-db74343f-393-0) (line 393, col 0, score 1)
- [plan-update-confirmation — L1156](plan-update-confirmation.md#^ref-b22d79c6-1156-0) (line 1156, col 0, score 1)
- [Promethean Dev Workflow Update — L275](promethean-dev-workflow-update.md#^ref-03a5578f-275-0) (line 275, col 0, score 1)
- [Creative Moments — L1309](creative-moments.md#^ref-10d98225-1309-0) (line 1309, col 0, score 0.97)
- [Duck's Attractor States — L2887](ducks-attractor-states.md#^ref-13951643-2887-0) (line 2887, col 0, score 0.97)
- [Promethean Chat Activity Report — L1401](promethean-chat-activity-report.md#^ref-18344cf9-1401-0) (line 1401, col 0, score 0.97)
- [Promethean Dev Workflow Update — L4223](promethean-dev-workflow-update.md#^ref-03a5578f-4223-0) (line 4223, col 0, score 0.97)
- [Promethean Documentation Update — L1101](promethean-documentation-update.txt#^ref-0b872af2-1101-0) (line 1101, col 0, score 0.97)
- [Promethean Documentation Pipeline Overview — L630](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-630-0) (line 630, col 0, score 1)
- [Stateful Partitions and Rebalancing — L994](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-994-0) (line 994, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L473](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-473-0) (line 473, col 0, score 1)
- [i3-bluetooth-setup — L279](i3-bluetooth-setup.md#^ref-5e408692-279-0) (line 279, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L992](migrate-to-provider-tenant-architecture.md#^ref-54382370-992-0) (line 992, col 0, score 0.92)
- [ParticleSimulationWithCanvasAndFFmpeg — L466](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-466-0) (line 466, col 0, score 0.91)
- [Canonical Org-Babel Matplotlib Animation Template — L294](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-294-0) (line 294, col 0, score 0.91)
- [Performance-Optimized-Polyglot-Bridge — L679](performance-optimized-polyglot-bridge.md#^ref-f5579967-679-0) (line 679, col 0, score 0.9)
- [Model Upgrade Calm-Down Guide — L329](model-upgrade-calm-down-guide.md#^ref-db74343f-329-0) (line 329, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L356](promethean-copilot-intent-engine.md#^ref-ae24a280-356-0) (line 356, col 0, score 1)
- [Prompt_Folder_Bootstrap — L428](prompt-folder-bootstrap.md#^ref-bd4f0976-428-0) (line 428, col 0, score 1)
- [Ice Box Reorganization — L383](ice-box-reorganization.md#^ref-291c7d91-383-0) (line 383, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L557](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-557-0) (line 557, col 0, score 1)
- [Reawakening Duck — L323](reawakening-duck.md#^ref-59b5670f-323-0) (line 323, col 0, score 1)
- [Duck's Attractor States — L292](ducks-attractor-states.md#^ref-13951643-292-0) (line 292, col 0, score 1)
- [plan-update-confirmation — L1163](plan-update-confirmation.md#^ref-b22d79c6-1163-0) (line 1163, col 0, score 1)
- [The Jar of Echoes — L303](the-jar-of-echoes.md#^ref-18138627-303-0) (line 303, col 0, score 0.98)
- [Promethean Notes — L876](promethean-notes.md#^ref-1c4046b5-876-0) (line 876, col 0, score 0.95)
- [Duck's Attractor States — L410](ducks-attractor-states.md#^ref-13951643-410-0) (line 410, col 0, score 0.95)
- [eidolon-field-math-foundations — L975](eidolon-field-math-foundations.md#^ref-008f2ac0-975-0) (line 975, col 0, score 0.95)
- [eidolon-field-math-foundations — L4271](eidolon-field-math-foundations.md#^ref-008f2ac0-4271-0) (line 4271, col 0, score 0.94)
- [Promethean Dev Workflow Update — L1956](promethean-dev-workflow-update.md#^ref-03a5578f-1956-0) (line 1956, col 0, score 0.93)
- [eidolon-field-math-foundations — L290](eidolon-field-math-foundations.md#^ref-008f2ac0-290-0) (line 290, col 0, score 0.93)
- [eidolon-field-math-foundations — L3770](eidolon-field-math-foundations.md#^ref-008f2ac0-3770-0) (line 3770, col 0, score 0.93)
- [Dynamic Context Model for Web Components — L736](dynamic-context-model-for-web-components.md#^ref-f7702bf8-736-0) (line 736, col 0, score 0.98)
- [Admin Dashboard for User Management — L216](admin-dashboard-for-user-management.md#^ref-2901a3e9-216-0) (line 216, col 0, score 0.98)
- [field-dynamics-math-blocks — L500](field-dynamics-math-blocks.md#^ref-7cfc230d-500-0) (line 500, col 0, score 0.98)
- [Stateful Partitions and Rebalancing — L789](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-789-0) (line 789, col 0, score 0.97)
- [Performance-Optimized-Polyglot-Bridge — L642](performance-optimized-polyglot-bridge.md#^ref-f5579967-642-0) (line 642, col 0, score 0.97)
- [Admin Dashboard for User Management — L344](admin-dashboard-for-user-management.md#^ref-2901a3e9-344-0) (line 344, col 0, score 0.96)
- [plan-update-confirmation — L1563](plan-update-confirmation.md#^ref-b22d79c6-1563-0) (line 1563, col 0, score 0.96)
- [Agent Tasks: Persistence Migration to DualStore — L467](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-467-0) (line 467, col 0, score 0.96)
- [field-interaction-equations — L608](field-interaction-equations.md#^ref-b09141b7-608-0) (line 608, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L254](model-upgrade-calm-down-guide.md#^ref-db74343f-254-0) (line 254, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L360](layer1survivabilityenvelope.md#^ref-64a9f9f9-360-0) (line 360, col 0, score 1)
- [field-dynamics-math-blocks — L324](field-dynamics-math-blocks.md#^ref-7cfc230d-324-0) (line 324, col 0, score 1)
- [eidolon-field-math-foundations — L401](eidolon-field-math-foundations.md#^ref-008f2ac0-401-0) (line 401, col 0, score 0.97)
- [Eidolon Field Abstract Model — L400](eidolon-field-abstract-model.md#^ref-5e8b2388-400-0) (line 400, col 0, score 0.97)
- [field-interaction-equations — L405](field-interaction-equations.md#^ref-b09141b7-405-0) (line 405, col 0, score 0.97)
- [homeostasis-decay-formulas — L514](homeostasis-decay-formulas.md#^ref-37b5d236-514-0) (line 514, col 0, score 0.97)
- [Dynamic Context Model for Web Components — L1095](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1095-0) (line 1095, col 0, score 1)
- [plan-update-confirmation — L1204](plan-update-confirmation.md#^ref-b22d79c6-1204-0) (line 1204, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L826](migrate-to-provider-tenant-architecture.md#^ref-54382370-826-0) (line 826, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L347](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-347-0) (line 347, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L806](performance-optimized-polyglot-bridge.md#^ref-f5579967-806-0) (line 806, col 0, score 0.99)
- [Functional Embedding Pipeline Refactor — L446](functional-embedding-pipeline-refactor.md#^ref-a4a25141-446-0) (line 446, col 0, score 0.99)
- [sibilant-macro-targets — L510](sibilant-macro-targets.md#^ref-c5c9a5c6-510-0) (line 510, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L688](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-688-0) (line 688, col 0, score 0.99)
- [Fnord Tracer Protocol — L552](fnord-tracer-protocol.md#^ref-fc21f824-552-0) (line 552, col 0, score 1)
- [field-node-diagram-visualizations — L241](field-node-diagram-visualizations.md#^ref-e9b27b06-241-0) (line 241, col 0, score 1)
- [eidolon-node-lifecycle — L166](eidolon-node-lifecycle.md#^ref-938eca9c-166-0) (line 166, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L393](layer1survivabilityenvelope.md#^ref-64a9f9f9-393-0) (line 393, col 0, score 1)
- [field-dynamics-math-blocks — L506](field-dynamics-math-blocks.md#^ref-7cfc230d-506-0) (line 506, col 0, score 1)
- [field-node-diagram-outline — L262](field-node-diagram-outline.md#^ref-1f32c94a-262-0) (line 262, col 0, score 1)
- [Promethean Dev Workflow Update — L2198](promethean-dev-workflow-update.md#^ref-03a5578f-2198-0) (line 2198, col 0, score 0.97)
- [eidolon-field-math-foundations — L3932](eidolon-field-math-foundations.md#^ref-008f2ac0-3932-0) (line 3932, col 0, score 0.97)
- [Dynamic Context Model for Web Components — L667](dynamic-context-model-for-web-components.md#^ref-f7702bf8-667-0) (line 667, col 0, score 1)
- [Fnord Tracer Protocol — L531](fnord-tracer-protocol.md#^ref-fc21f824-531-0) (line 531, col 0, score 1)
- [The Jar of Echoes — L331](the-jar-of-echoes.md#^ref-18138627-331-0) (line 331, col 0, score 1)
- [Tracing the Signal — L366](tracing-the-signal.md#^ref-c3cd4f65-366-0) (line 366, col 0, score 1)
- [field-node-diagram-set — L369](field-node-diagram-set.md#^ref-22b989d5-369-0) (line 369, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L947](performance-optimized-polyglot-bridge.md#^ref-f5579967-947-0) (line 947, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L354](protocol-0-the-contradiction-engine.md#^ref-9a93a756-354-0) (line 354, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L363](layer1survivabilityenvelope.md#^ref-64a9f9f9-363-0) (line 363, col 0, score 1)
- [Duck's Attractor States — L1829](ducks-attractor-states.md#^ref-13951643-1829-0) (line 1829, col 0, score 0.97)
- [Mathematics Sampler — L253](mathematics-sampler.md#^ref-b5e0183e-253-0) (line 253, col 0, score 1)
- [Fnord Tracer Protocol — L626](fnord-tracer-protocol.md#^ref-fc21f824-626-0) (line 626, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L391](layer1survivabilityenvelope.md#^ref-64a9f9f9-391-0) (line 391, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L581](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-581-0) (line 581, col 0, score 1)
- [field-interaction-equations — L644](field-interaction-equations.md#^ref-b09141b7-644-0) (line 644, col 0, score 0.98)
- [Layer1SurvivabilityEnvelope — L378](layer1survivabilityenvelope.md#^ref-64a9f9f9-378-0) (line 378, col 0, score 0.98)
- [ParticleSimulationWithCanvasAndFFmpeg — L414](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-414-0) (line 414, col 0, score 0.98)
- [sibilant-macro-targets — L420](sibilant-macro-targets.md#^ref-c5c9a5c6-420-0) (line 420, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L699](dynamic-context-model-for-web-components.md#^ref-f7702bf8-699-0) (line 699, col 0, score 1)
- [i3-bluetooth-setup — L415](i3-bluetooth-setup.md#^ref-5e408692-415-0) (line 415, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L352](protocol-0-the-contradiction-engine.md#^ref-9a93a756-352-0) (line 352, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L476](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-476-0) (line 476, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L915](migrate-to-provider-tenant-architecture.md#^ref-54382370-915-0) (line 915, col 0, score 0.98)
- [Model Upgrade Calm-Down Guide — L390](model-upgrade-calm-down-guide.md#^ref-db74343f-390-0) (line 390, col 0, score 0.98)
- [Model Selection for Lightweight Conversational Tasks — L462](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-462-0) (line 462, col 0, score 0.98)
- [Admin Dashboard for User Management — L336](admin-dashboard-for-user-management.md#^ref-2901a3e9-336-0) (line 336, col 0, score 0.98)
- [heartbeat-fragment-demo — L268](heartbeat-fragment-demo.md#^ref-dd00677a-268-0) (line 268, col 0, score 1)
- [homeostasis-decay-formulas — L453](homeostasis-decay-formulas.md#^ref-37b5d236-453-0) (line 453, col 0, score 1)
- [Fnord Tracer Protocol — L756](fnord-tracer-protocol.md#^ref-fc21f824-756-0) (line 756, col 0, score 1)
- [field-dynamics-math-blocks — L412](field-dynamics-math-blocks.md#^ref-7cfc230d-412-0) (line 412, col 0, score 1)
- [Eidolon Field Abstract Model — L594](eidolon-field-abstract-model.md#^ref-5e8b2388-594-0) (line 594, col 0, score 1)
- [eidolon-field-math-foundations — L530](eidolon-field-math-foundations.md#^ref-008f2ac0-530-0) (line 530, col 0, score 1)
- [field-node-diagram-set — L323](field-node-diagram-set.md#^ref-22b989d5-323-0) (line 323, col 0, score 1)
- [eidolon-field-math-foundations — L2590](eidolon-field-math-foundations.md#^ref-008f2ac0-2590-0) (line 2590, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L4811](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-4811-0) (line 4811, col 0, score 0.98)
- [graph-ds — L655](graph-ds.md#^ref-6620e2f2-655-0) (line 655, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L584](performance-optimized-polyglot-bridge.md#^ref-f5579967-584-0) (line 584, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L323](promethean-copilot-intent-engine.md#^ref-ae24a280-323-0) (line 323, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L363](chroma-toolkit-consolidation-plan.md#^ref-5020e892-363-0) (line 363, col 0, score 1)
- [schema-evolution-workflow — L770](schema-evolution-workflow.md#^ref-d8059b6a-770-0) (line 770, col 0, score 1)
- [Eidolon Field Abstract Model — L654](eidolon-field-abstract-model.md#^ref-5e8b2388-654-0) (line 654, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L682](migrate-to-provider-tenant-architecture.md#^ref-54382370-682-0) (line 682, col 0, score 1)
- [Reawakening Duck — L330](reawakening-duck.md#^ref-59b5670f-330-0) (line 330, col 0, score 1)
- [field-dynamics-math-blocks — L480](field-dynamics-math-blocks.md#^ref-7cfc230d-480-0) (line 480, col 0, score 1)
- [Fnord Tracer Protocol — L455](fnord-tracer-protocol.md#^ref-fc21f824-455-0) (line 455, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L288](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-288-0) (line 288, col 0, score 1)
- [field-interaction-equations — L318](field-interaction-equations.md#^ref-b09141b7-318-0) (line 318, col 0, score 1)
- [field-node-diagram-visualizations — L250](field-node-diagram-visualizations.md#^ref-e9b27b06-250-0) (line 250, col 0, score 1)
- [eidolon-field-math-foundations — L537](eidolon-field-math-foundations.md#^ref-008f2ac0-537-0) (line 537, col 0, score 1)
- [Eidolon Field Abstract Model — L581](eidolon-field-abstract-model.md#^ref-5e8b2388-581-0) (line 581, col 0, score 1)
- [homeostasis-decay-formulas — L582](homeostasis-decay-formulas.md#^ref-37b5d236-582-0) (line 582, col 0, score 1)
- [Fnord Tracer Protocol — L748](fnord-tracer-protocol.md#^ref-fc21f824-748-0) (line 748, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1003](migrate-to-provider-tenant-architecture.md#^ref-54382370-1003-0) (line 1003, col 0, score 1)
- [heartbeat-fragment-demo — L288](heartbeat-fragment-demo.md#^ref-dd00677a-288-0) (line 288, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L350](layer1survivabilityenvelope.md#^ref-64a9f9f9-350-0) (line 350, col 0, score 1)
- [homeostasis-decay-formulas — L391](homeostasis-decay-formulas.md#^ref-37b5d236-391-0) (line 391, col 0, score 1)
- [eidolon-node-lifecycle — L159](eidolon-node-lifecycle.md#^ref-938eca9c-159-0) (line 159, col 0, score 0.94)
- [field-node-diagram-outline — L299](field-node-diagram-outline.md#^ref-1f32c94a-299-0) (line 299, col 0, score 0.94)
- [field-node-diagram-set — L320](field-node-diagram-set.md#^ref-22b989d5-320-0) (line 320, col 0, score 0.94)
- [field-node-diagram-visualizations — L277](field-node-diagram-visualizations.md#^ref-e9b27b06-277-0) (line 277, col 0, score 0.94)
- [field-interaction-equations — L478](field-interaction-equations.md#^ref-b09141b7-478-0) (line 478, col 0, score 1)
- [Fnord Tracer Protocol — L561](fnord-tracer-protocol.md#^ref-fc21f824-561-0) (line 561, col 0, score 1)
- [homeostasis-decay-formulas — L625](homeostasis-decay-formulas.md#^ref-37b5d236-625-0) (line 625, col 0, score 1)
- [eidolon-field-math-foundations — L361](eidolon-field-math-foundations.md#^ref-008f2ac0-361-0) (line 361, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L564](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-564-0) (line 564, col 0, score 0.97)
- [field-interaction-equations — L619](field-interaction-equations.md#^ref-b09141b7-619-0) (line 619, col 0, score 0.97)
- [homeostasis-decay-formulas — L527](homeostasis-decay-formulas.md#^ref-37b5d236-527-0) (line 527, col 0, score 0.97)
- [Eidolon Field Abstract Model — L394](eidolon-field-abstract-model.md#^ref-5e8b2388-394-0) (line 394, col 0, score 0.97)
- [Promethean Documentation Pipeline Overview — L628](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-628-0) (line 628, col 0, score 1)
- [schema-evolution-workflow — L869](schema-evolution-workflow.md#^ref-d8059b6a-869-0) (line 869, col 0, score 1)
- [Duck's Attractor States — L243](ducks-attractor-states.md#^ref-13951643-243-0) (line 243, col 0, score 1)
- [Fnord Tracer Protocol — L595](fnord-tracer-protocol.md#^ref-fc21f824-595-0) (line 595, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L372](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-372-0) (line 372, col 0, score 1)
- [Redirecting Standard Error — L166](redirecting-standard-error.md#^ref-b3555ede-166-0) (line 166, col 0, score 1)
- [Stateful Partitions and Rebalancing — L845](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-845-0) (line 845, col 0, score 1)
- [Promethean Infrastructure Setup — L992](promethean-infrastructure-setup.md#^ref-6deed6ac-992-0) (line 992, col 0, score 1)
- [Factorio AI with External Agents — L555](factorio-ai-with-external-agents.md#^ref-a4d90289-555-0) (line 555, col 0, score 1)
- [Promethean Infrastructure Setup — L994](promethean-infrastructure-setup.md#^ref-6deed6ac-994-0) (line 994, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L615](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-615-0) (line 615, col 0, score 1)
- [Pure TypeScript Search Microservice — L932](pure-typescript-search-microservice.md#^ref-d17d3a96-932-0) (line 932, col 0, score 1)
- [schema-evolution-workflow — L864](schema-evolution-workflow.md#^ref-d8059b6a-864-0) (line 864, col 0, score 1)
- [Redirecting Standard Error — L172](redirecting-standard-error.md#^ref-b3555ede-172-0) (line 172, col 0, score 1)
- [Dynamic Context Model for Web Components — L711](dynamic-context-model-for-web-components.md#^ref-f7702bf8-711-0) (line 711, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L373](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-373-0) (line 373, col 0, score 1)
- [Duck's Attractor States — L237](ducks-attractor-states.md#^ref-13951643-237-0) (line 237, col 0, score 1)
- [Smoke Resonance Visualizations — L240](smoke-resonance-visualizations.md#^ref-ac9d3ac5-240-0) (line 240, col 0, score 1)
- [Stateful Partitions and Rebalancing — L839](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-839-0) (line 839, col 0, score 1)
- [schema-evolution-workflow — L867](schema-evolution-workflow.md#^ref-d8059b6a-867-0) (line 867, col 0, score 1)
- [Pure TypeScript Search Microservice — L933](pure-typescript-search-microservice.md#^ref-d17d3a96-933-0) (line 933, col 0, score 1)
- [schema-evolution-workflow — L891](schema-evolution-workflow.md#^ref-d8059b6a-891-0) (line 891, col 0, score 0.95)
- [windows-tiling-with-autohotkey — L528](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-528-0) (line 528, col 0, score 0.93)
- [Stateful Partitions and Rebalancing — L961](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-961-0) (line 961, col 0, score 0.93)
- [schema-evolution-workflow — L959](schema-evolution-workflow.md#^ref-d8059b6a-959-0) (line 959, col 0, score 0.93)
- [windows-tiling-with-autohotkey — L2012](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2012-0) (line 2012, col 0, score 0.96)
- [Dynamic Context Model for Web Components — L707](dynamic-context-model-for-web-components.md#^ref-f7702bf8-707-0) (line 707, col 0, score 1)
- [schema-evolution-workflow — L861](schema-evolution-workflow.md#^ref-d8059b6a-861-0) (line 861, col 0, score 1)
- [Stateful Partitions and Rebalancing — L852](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-852-0) (line 852, col 0, score 1)
- [Redirecting Standard Error — L157](redirecting-standard-error.md#^ref-b3555ede-157-0) (line 157, col 0, score 1)
- [schema-evolution-workflow — L725](schema-evolution-workflow.md#^ref-d8059b6a-725-0) (line 725, col 0, score 0.95)
- [Promethean Infrastructure Setup — L991](promethean-infrastructure-setup.md#^ref-6deed6ac-991-0) (line 991, col 0, score 0.95)
- [Per-Domain Policy System for JS Crawler — L744](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-744-0) (line 744, col 0, score 0.93)
- [Stateful Partitions and Rebalancing — L771](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-771-0) (line 771, col 0, score 0.93)
- [zero-copy-snapshots-and-workers — L647](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-647-0) (line 647, col 0, score 0.93)
- [plan-update-confirmation — L1693](plan-update-confirmation.md#^ref-b22d79c6-1693-0) (line 1693, col 0, score 0.93)
- [Duck's Attractor States — L235](ducks-attractor-states.md#^ref-13951643-235-0) (line 235, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L616](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-616-0) (line 616, col 0, score 1)
- [schema-evolution-workflow — L857](schema-evolution-workflow.md#^ref-d8059b6a-857-0) (line 857, col 0, score 1)
- [Stateful Partitions and Rebalancing — L838](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-838-0) (line 838, col 0, score 1)
- [Promethean Infrastructure Setup — L996](promethean-infrastructure-setup.md#^ref-6deed6ac-996-0) (line 996, col 0, score 1)
- [Fnord Tracer Protocol — L600](fnord-tracer-protocol.md#^ref-fc21f824-600-0) (line 600, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L377](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-377-0) (line 377, col 0, score 1)
- [Redirecting Standard Error — L164](redirecting-standard-error.md#^ref-b3555ede-164-0) (line 164, col 0, score 1)
- [Stateful Partitions and Rebalancing — L843](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-843-0) (line 843, col 0, score 1)
- [Pure TypeScript Search Microservice — L934](pure-typescript-search-microservice.md#^ref-d17d3a96-934-0) (line 934, col 0, score 1)
- [schema-evolution-workflow — L871](schema-evolution-workflow.md#^ref-d8059b6a-871-0) (line 871, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L416](layer1survivabilityenvelope.md#^ref-64a9f9f9-416-0) (line 416, col 0, score 1)
- [Stateful Partitions and Rebalancing — L829](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-829-0) (line 829, col 0, score 0.98)
- [schema-evolution-workflow — L850](schema-evolution-workflow.md#^ref-d8059b6a-850-0) (line 850, col 0, score 0.97)
- [Stateful Partitions and Rebalancing — L1007](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-1007-0) (line 1007, col 0, score 0.97)
- [schema-evolution-workflow — L993](schema-evolution-workflow.md#^ref-d8059b6a-993-0) (line 993, col 0, score 0.97)
- [Dynamic Context Model for Web Components — L705](dynamic-context-model-for-web-components.md#^ref-f7702bf8-705-0) (line 705, col 0, score 1)
- [Pure TypeScript Search Microservice — L939](pure-typescript-search-microservice.md#^ref-d17d3a96-939-0) (line 939, col 0, score 1)
- [schema-evolution-workflow — L865](schema-evolution-workflow.md#^ref-d8059b6a-865-0) (line 865, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L375](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-375-0) (line 375, col 0, score 1)
- [Stateful Partitions and Rebalancing — L850](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-850-0) (line 850, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L1119](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-1119-0) (line 1119, col 0, score 0.94)
- [Creative Moments — L818](creative-moments.md#^ref-10d98225-818-0) (line 818, col 0, score 0.94)
- [Promethean Dev Workflow Update — L1538](promethean-dev-workflow-update.md#^ref-03a5578f-1538-0) (line 1538, col 0, score 0.94)
- [Promethean Documentation Pipeline Overview — L622](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-622-0) (line 622, col 0, score 1)
- [Dynamic Context Model for Web Components — L709](dynamic-context-model-for-web-components.md#^ref-f7702bf8-709-0) (line 709, col 0, score 1)
- [schema-evolution-workflow — L870](schema-evolution-workflow.md#^ref-d8059b6a-870-0) (line 870, col 0, score 1)
- [Stateful Partitions and Rebalancing — L849](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-849-0) (line 849, col 0, score 1)
- [Pure TypeScript Search Microservice — L928](pure-typescript-search-microservice.md#^ref-d17d3a96-928-0) (line 928, col 0, score 1)
- [Redirecting Standard Error — L171](redirecting-standard-error.md#^ref-b3555ede-171-0) (line 171, col 0, score 1)
- [Prometheus Observability Stack — L700](prometheus-observability-stack.md#^ref-e90b5a16-700-0) (line 700, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L847](migrate-to-provider-tenant-architecture.md#^ref-54382370-847-0) (line 847, col 0, score 0.96)
- [Promethean Infrastructure Setup — L1001](promethean-infrastructure-setup.md#^ref-6deed6ac-1001-0) (line 1001, col 0, score 1)
- [Pure TypeScript Search Microservice — L936](pure-typescript-search-microservice.md#^ref-d17d3a96-936-0) (line 936, col 0, score 1)
- [Dynamic Context Model for Web Components — L712](dynamic-context-model-for-web-components.md#^ref-f7702bf8-712-0) (line 712, col 0, score 1)
- [Prometheus Observability Stack — L699](prometheus-observability-stack.md#^ref-e90b5a16-699-0) (line 699, col 0, score 1)
- [Fnord Tracer Protocol — L605](fnord-tracer-protocol.md#^ref-fc21f824-605-0) (line 605, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L381](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-381-0) (line 381, col 0, score 1)
- [Promethean Infrastructure Setup — L1003](promethean-infrastructure-setup.md#^ref-6deed6ac-1003-0) (line 1003, col 0, score 1)
- [Redirecting Standard Error — L162](redirecting-standard-error.md#^ref-b3555ede-162-0) (line 162, col 0, score 1)
- [Pure TypeScript Search Microservice — L931](pure-typescript-search-microservice.md#^ref-d17d3a96-931-0) (line 931, col 0, score 1)
- [eidolon-field-math-foundations — L1483](eidolon-field-math-foundations.md#^ref-008f2ac0-1483-0) (line 1483, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L602](migrate-to-provider-tenant-architecture.md#^ref-54382370-602-0) (line 602, col 0, score 0.97)
- [Promethean Chat Activity Report — L175](promethean-chat-activity-report.md#^ref-18344cf9-175-0) (line 175, col 0, score 0.97)
- [Promethean Dev Workflow Update — L255](promethean-dev-workflow-update.md#^ref-03a5578f-255-0) (line 255, col 0, score 0.97)
- [Promethean-Copilot-Intent-Engine — L275](promethean-copilot-intent-engine.md#^ref-ae24a280-275-0) (line 275, col 0, score 0.97)
- [Fnord Tracer Protocol — L603](fnord-tracer-protocol.md#^ref-fc21f824-603-0) (line 603, col 0, score 1)
- [Redirecting Standard Error — L167](redirecting-standard-error.md#^ref-b3555ede-167-0) (line 167, col 0, score 1)
- [Dynamic Context Model for Web Components — L714](dynamic-context-model-for-web-components.md#^ref-f7702bf8-714-0) (line 714, col 0, score 1)
- [Duck's Attractor States — L246](ducks-attractor-states.md#^ref-13951643-246-0) (line 246, col 0, score 1)
- [eidolon-field-math-foundations — L3183](eidolon-field-math-foundations.md#^ref-008f2ac0-3183-0) (line 3183, col 0, score 0.98)
- [eidolon-field-math-foundations — L3118](eidolon-field-math-foundations.md#^ref-008f2ac0-3118-0) (line 3118, col 0, score 0.97)
- [windows-tiling-with-autohotkey — L1988](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-1988-0) (line 1988, col 0, score 0.97)
- [Pipeline Enhancements — L72](pipeline-enhancements.md#^ref-e2135d9f-72-0) (line 72, col 0, score 0.96)
- [Dynamic Context Model for Web Components — L710](dynamic-context-model-for-web-components.md#^ref-f7702bf8-710-0) (line 710, col 0, score 1)
- [Redirecting Standard Error — L158](redirecting-standard-error.md#^ref-b3555ede-158-0) (line 158, col 0, score 1)
- [schema-evolution-workflow — L858](schema-evolution-workflow.md#^ref-d8059b6a-858-0) (line 858, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L515](layer1survivabilityenvelope.md#^ref-64a9f9f9-515-0) (line 515, col 0, score 0.91)
- [plan-update-confirmation — L1231](plan-update-confirmation.md#^ref-b22d79c6-1231-0) (line 1231, col 0, score 0.91)
- [graph-ds — L572](graph-ds.md#^ref-6620e2f2-572-0) (line 572, col 0, score 0.91)
- [typed-struct-compiler — L650](typed-struct-compiler.md#^ref-78eeedf7-650-0) (line 650, col 0, score 0.91)
- [Stateful Partitions and Rebalancing — L776](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-776-0) (line 776, col 0, score 0.91)
- [Dynamic Context Model for Web Components — L1018](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1018-0) (line 1018, col 0, score 0.91)
- [plan-update-confirmation — L1568](plan-update-confirmation.md#^ref-b22d79c6-1568-0) (line 1568, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L748](performance-optimized-polyglot-bridge.md#^ref-f5579967-748-0) (line 748, col 0, score 0.97)
- [Factorio AI with External Agents — L486](factorio-ai-with-external-agents.md#^ref-a4d90289-486-0) (line 486, col 0, score 0.97)
- [komorebi-group-window-hack — L431](komorebi-group-window-hack.md#^ref-dd89372d-431-0) (line 431, col 0, score 1)
- [Promethean Infrastructure Setup — L925](promethean-infrastructure-setup.md#^ref-6deed6ac-925-0) (line 925, col 0, score 0.98)
- [Factorio AI with External Agents — L328](factorio-ai-with-external-agents.md#^ref-a4d90289-328-0) (line 328, col 0, score 0.98)
- [plan-update-confirmation — L1387](plan-update-confirmation.md#^ref-b22d79c6-1387-0) (line 1387, col 0, score 0.98)
- [Promethean Documentation Pipeline Overview — L386](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-386-0) (line 386, col 0, score 0.98)
- [TypeScript Patch for Tool Calling Support — L721](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-721-0) (line 721, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L557](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-557-0) (line 557, col 0, score 1)
- [Dynamic Context Model for Web Components — L1070](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1070-0) (line 1070, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L949](performance-optimized-polyglot-bridge.md#^ref-f5579967-949-0) (line 949, col 0, score 1)
- [Factorio AI with External Agents — L327](factorio-ai-with-external-agents.md#^ref-a4d90289-327-0) (line 327, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L358](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-358-0) (line 358, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L1223](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1223-0) (line 1223, col 0, score 0.98)
- [Agent Reflections and Prompt Evolution — L267](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-267-0) (line 267, col 0, score 1)
- [DSL — L421](chunks/dsl.md#^ref-e87bc036-421-0) (line 421, col 0, score 1)
- [schema-evolution-workflow — L809](schema-evolution-workflow.md#^ref-d8059b6a-809-0) (line 809, col 0, score 1)
- [plan-update-confirmation — L1570](plan-update-confirmation.md#^ref-b22d79c6-1570-0) (line 1570, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L820](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-820-0) (line 820, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L499](migrate-to-provider-tenant-architecture.md#^ref-54382370-499-0) (line 499, col 0, score 0.98)
- [Promethean-Copilot-Intent-Engine — L316](promethean-copilot-intent-engine.md#^ref-ae24a280-316-0) (line 316, col 0, score 0.98)
- [i3-bluetooth-setup — L528](i3-bluetooth-setup.md#^ref-5e408692-528-0) (line 528, col 0, score 0.97)
- [Migrate to Provider-Tenant Architecture — L1189](migrate-to-provider-tenant-architecture.md#^ref-54382370-1189-0) (line 1189, col 0, score 0.97)
- [Per-Domain Policy System for JS Crawler — L949](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-949-0) (line 949, col 0, score 0.97)
- [plan-update-confirmation — L1573](plan-update-confirmation.md#^ref-b22d79c6-1573-0) (line 1573, col 0, score 1)
- [Dynamic Context Model for Web Components — L746](dynamic-context-model-for-web-components.md#^ref-f7702bf8-746-0) (line 746, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L359](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-359-0) (line 359, col 0, score 1)
- [field-node-diagram-outline — L350](field-node-diagram-outline.md#^ref-1f32c94a-350-0) (line 350, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L511](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-511-0) (line 511, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L394](promethean-copilot-intent-engine.md#^ref-ae24a280-394-0) (line 394, col 0, score 1)
- [Promethean State Format — L360](promethean-state-format.md#^ref-23df6ddb-360-0) (line 360, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L855](dynamic-context-model-for-web-components.md#^ref-f7702bf8-855-0) (line 855, col 0, score 1)
- [Fnord Tracer Protocol — L731](fnord-tracer-protocol.md#^ref-fc21f824-731-0) (line 731, col 0, score 1)
- [plan-update-confirmation — L1574](plan-update-confirmation.md#^ref-b22d79c6-1574-0) (line 1574, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L746](performance-optimized-polyglot-bridge.md#^ref-f5579967-746-0) (line 746, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L434](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-434-0) (line 434, col 0, score 1)
- [Stateful Partitions and Rebalancing — L754](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-754-0) (line 754, col 0, score 0.98)
- [plan-update-confirmation — L1767](plan-update-confirmation.md#^ref-b22d79c6-1767-0) (line 1767, col 0, score 0.97)
- [Performance-Optimized-Polyglot-Bridge — L930](performance-optimized-polyglot-bridge.md#^ref-f5579967-930-0) (line 930, col 0, score 0.97)
- [schema-evolution-workflow — L844](schema-evolution-workflow.md#^ref-d8059b6a-844-0) (line 844, col 0, score 0.97)
- [plan-update-confirmation — L1575](plan-update-confirmation.md#^ref-b22d79c6-1575-0) (line 1575, col 0, score 1)
- [Promethean Infrastructure Setup — L922](promethean-infrastructure-setup.md#^ref-6deed6ac-922-0) (line 922, col 0, score 1)
- [sibilant-macro-targets — L574](sibilant-macro-targets.md#^ref-c5c9a5c6-574-0) (line 574, col 0, score 1)
- [Docops Feature Updates — L93](docops-feature-updates-3.md#^ref-cdbd21ee-93-0) (line 93, col 0, score 0.97)
- [Docops Feature Updates — L154](docops-feature-updates.md#^ref-2792d448-154-0) (line 154, col 0, score 0.97)
- [field-interaction-equations — L510](field-interaction-equations.md#^ref-b09141b7-510-0) (line 510, col 0, score 0.97)
- [Promethean Dev Workflow Update — L1490](promethean-dev-workflow-update.md#^ref-03a5578f-1490-0) (line 1490, col 0, score 0.87)
- [Promethean Documentation Update — L562](promethean-documentation-update.txt#^ref-0b872af2-562-0) (line 562, col 0, score 0.87)
- [plan-update-confirmation — L1567](plan-update-confirmation.md#^ref-b22d79c6-1567-0) (line 1567, col 0, score 1)
- [Factorio AI with External Agents — L488](factorio-ai-with-external-agents.md#^ref-a4d90289-488-0) (line 488, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L383](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-383-0) (line 383, col 0, score 0.97)
- [Chroma Toolkit Consolidation Plan — L810](chroma-toolkit-consolidation-plan.md#^ref-5020e892-810-0) (line 810, col 0, score 0.97)
- [Duck's Attractor States — L514](ducks-attractor-states.md#^ref-13951643-514-0) (line 514, col 0, score 0.97)
- [Duck's Self-Referential Perceptual Loop — L302](ducks-self-referential-perceptual-loop.md#^ref-71726f04-302-0) (line 302, col 0, score 0.97)
- [field-interaction-equations — L874](field-interaction-equations.md#^ref-b09141b7-874-0) (line 874, col 0, score 0.97)
- [Migrate to Provider-Tenant Architecture — L1518](migrate-to-provider-tenant-architecture.md#^ref-54382370-1518-0) (line 1518, col 0, score 0.97)
- [Model Selection for Lightweight Conversational Tasks — L350](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-350-0) (line 350, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L459](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-459-0) (line 459, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L691](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-691-0) (line 691, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L501](promethean-copilot-intent-engine.md#^ref-ae24a280-501-0) (line 501, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L838](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-838-0) (line 838, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L651](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-651-0) (line 651, col 0, score 0.96)
- [Agent Tasks: Persistence Migration to DualStore — L342](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-342-0) (line 342, col 0, score 0.96)
- [plan-update-confirmation — L1605](plan-update-confirmation.md#^ref-b22d79c6-1605-0) (line 1605, col 0, score 0.96)
- [Performance-Optimized-Polyglot-Bridge — L749](performance-optimized-polyglot-bridge.md#^ref-f5579967-749-0) (line 749, col 0, score 1)
- [Factorio AI with External Agents — L490](factorio-ai-with-external-agents.md#^ref-a4d90289-490-0) (line 490, col 0, score 1)
- [plan-update-confirmation — L1566](plan-update-confirmation.md#^ref-b22d79c6-1566-0) (line 1566, col 0, score 1)
- [sibilant-macro-targets — L385](sibilant-macro-targets.md#^ref-c5c9a5c6-385-0) (line 385, col 0, score 1)
- [polyglot-repl-interface-layer — L339](polyglot-repl-interface-layer.md#^ref-9c79206d-339-0) (line 339, col 0, score 1)
- [plan-update-confirmation — L1701](plan-update-confirmation.md#^ref-b22d79c6-1701-0) (line 1701, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L350](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-350-0) (line 350, col 0, score 0.96)
- [DSL — L410](chunks/dsl.md#^ref-e87bc036-410-0) (line 410, col 0, score 0.96)
- [Dynamic Context Model for Web Components — L1661](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1661-0) (line 1661, col 0, score 0.96)
- [Obsidian ChatGPT Plugin Integration Guide — L237](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-237-0) (line 237, col 0, score 0.96)
- [Obsidian ChatGPT Plugin Integration — L229](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-229-0) (line 229, col 0, score 0.96)
- [komorebi-group-window-hack — L424](komorebi-group-window-hack.md#^ref-dd89372d-424-0) (line 424, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L944](performance-optimized-polyglot-bridge.md#^ref-f5579967-944-0) (line 944, col 0, score 0.98)
- [Per-Domain Policy System for JS Crawler — L826](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-826-0) (line 826, col 0, score 0.98)
- [Promethean Infrastructure Setup — L1027](promethean-infrastructure-setup.md#^ref-6deed6ac-1027-0) (line 1027, col 0, score 0.98)
- [Model Upgrade Calm-Down Guide — L241](model-upgrade-calm-down-guide.md#^ref-db74343f-241-0) (line 241, col 0, score 0.98)
- [Obsidian ChatGPT Plugin Integration Guide — L156](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-156-0) (line 156, col 0, score 0.98)
- [Obsidian ChatGPT Plugin Integration — L155](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-155-0) (line 155, col 0, score 0.98)
- [Obsidian Templating Plugins Integration Guide — L228](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-228-0) (line 228, col 0, score 0.98)
- [Factorio AI with External Agents — L493](factorio-ai-with-external-agents.md#^ref-a4d90289-493-0) (line 493, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L427](model-upgrade-calm-down-guide.md#^ref-db74343f-427-0) (line 427, col 0, score 0.97)
- [Promethean Infrastructure Setup — L1033](promethean-infrastructure-setup.md#^ref-6deed6ac-1033-0) (line 1033, col 0, score 0.97)
- [Functional Embedding Pipeline Refactor — L572](functional-embedding-pipeline-refactor.md#^ref-a4a25141-572-0) (line 572, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L898](migrate-to-provider-tenant-architecture.md#^ref-54382370-898-0) (line 898, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L209](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-209-0) (line 209, col 0, score 1)
- [Promethean Infrastructure Setup — L885](promethean-infrastructure-setup.md#^ref-6deed6ac-885-0) (line 885, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L856](dynamic-context-model-for-web-components.md#^ref-f7702bf8-856-0) (line 856, col 0, score 1)
- [Fnord Tracer Protocol — L732](fnord-tracer-protocol.md#^ref-fc21f824-732-0) (line 732, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L573](functional-embedding-pipeline-refactor.md#^ref-a4a25141-573-0) (line 573, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L899](migrate-to-provider-tenant-architecture.md#^ref-54382370-899-0) (line 899, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L210](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-210-0) (line 210, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L430](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-430-0) (line 430, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L395](promethean-copilot-intent-engine.md#^ref-ae24a280-395-0) (line 395, col 0, score 1)
- [field-node-diagram-outline — L351](field-node-diagram-outline.md#^ref-1f32c94a-351-0) (line 351, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L213](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-213-0) (line 213, col 0, score 1)
- [Dynamic Context Model for Web Components — L858](dynamic-context-model-for-web-components.md#^ref-f7702bf8-858-0) (line 858, col 0, score 1)
- [Promethean Infrastructure Setup — L1078](promethean-infrastructure-setup.md#^ref-6deed6ac-1078-0) (line 1078, col 0, score 1)
- [Dynamic Context Model for Web Components — L616](dynamic-context-model-for-web-components.md#^ref-f7702bf8-616-0) (line 616, col 0, score 0.97)
- [Canonical Org-Babel Matplotlib Animation Template — L368](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-368-0) (line 368, col 0, score 0.97)
- [ParticleSimulationWithCanvasAndFFmpeg — L475](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-475-0) (line 475, col 0, score 0.97)
- [Chroma Toolkit Consolidation Plan — L406](chroma-toolkit-consolidation-plan.md#^ref-5020e892-406-0) (line 406, col 0, score 0.97)
- [Protocol_0_The_Contradiction_Engine — L360](protocol-0-the-contradiction-engine.md#^ref-9a93a756-360-0) (line 360, col 0, score 0.97)
- [Debugging Broker Connections and Agent Behavior — L219](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-219-0) (line 219, col 0, score 1)
- [Promethean Infrastructure Setup — L1080](promethean-infrastructure-setup.md#^ref-6deed6ac-1080-0) (line 1080, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L564](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-564-0) (line 564, col 0, score 0.98)
- [Agent Tasks: Persistence Migration to DualStore — L521](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-521-0) (line 521, col 0, score 0.96)
- [plan-update-confirmation — L1475](plan-update-confirmation.md#^ref-b22d79c6-1475-0) (line 1475, col 0, score 0.96)
- [Eidolon Field Abstract Model — L446](eidolon-field-abstract-model.md#^ref-5e8b2388-446-0) (line 446, col 0, score 0.96)
- [Prompt_Folder_Bootstrap — L543](prompt-folder-bootstrap.md#^ref-bd4f0976-543-0) (line 543, col 0, score 0.96)
- [Performance-Optimized-Polyglot-Bridge — L760](performance-optimized-polyglot-bridge.md#^ref-f5579967-760-0) (line 760, col 0, score 0.96)
- [Promethean Infrastructure Setup — L1076](promethean-infrastructure-setup.md#^ref-6deed6ac-1076-0) (line 1076, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L991](migrate-to-provider-tenant-architecture.md#^ref-54382370-991-0) (line 991, col 0, score 1)
- [Promethean Documentation Update — L365](promethean-documentation-update.txt#^ref-0b872af2-365-0) (line 365, col 0, score 0.97)
- [Promethean Notes — L387](promethean-notes.md#^ref-1c4046b5-387-0) (line 387, col 0, score 0.97)
- [Duck's Attractor States — L960](ducks-attractor-states.md#^ref-13951643-960-0) (line 960, col 0, score 0.97)
- [eidolon-field-math-foundations — L1205](eidolon-field-math-foundations.md#^ref-008f2ac0-1205-0) (line 1205, col 0, score 0.97)
- [Promethean Dev Workflow Update — L958](promethean-dev-workflow-update.md#^ref-03a5578f-958-0) (line 958, col 0, score 0.97)
- [The Jar of Echoes — L852](the-jar-of-echoes.md#^ref-18138627-852-0) (line 852, col 0, score 0.97)
- [windows-tiling-with-autohotkey — L968](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-968-0) (line 968, col 0, score 0.97)
- [Provider-Agnostic Chat Panel Implementation — L398](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-398-0) (line 398, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L537](migrate-to-provider-tenant-architecture.md#^ref-54382370-537-0) (line 537, col 0, score 0.98)
- [Tooling — L120](chunks/tooling.md#^ref-6cb4943e-120-0) (line 120, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L960](dynamic-context-model-for-web-components.md#^ref-f7702bf8-960-0) (line 960, col 0, score 0.99)
- [schema-evolution-workflow — L821](schema-evolution-workflow.md#^ref-d8059b6a-821-0) (line 821, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L923](migrate-to-provider-tenant-architecture.md#^ref-54382370-923-0) (line 923, col 0, score 0.99)
- [Agent Tasks: Persistence Migration to DualStore — L439](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-439-0) (line 439, col 0, score 0.99)
- [zero-copy-snapshots-and-workers — L521](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-521-0) (line 521, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L388](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-388-0) (line 388, col 0, score 1)
- [homeostasis-decay-formulas — L552](homeostasis-decay-formulas.md#^ref-37b5d236-552-0) (line 552, col 0, score 1)
- [typed-struct-compiler — L596](typed-struct-compiler.md#^ref-78eeedf7-596-0) (line 596, col 0, score 1)
- [Factorio AI with External Agents — L408](factorio-ai-with-external-agents.md#^ref-a4d90289-408-0) (line 408, col 0, score 1)
- [sibilant-macro-targets — L390](sibilant-macro-targets.md#^ref-c5c9a5c6-390-0) (line 390, col 0, score 1)
- [promethean-requirements — L102](promethean-requirements.md#^ref-95205cd3-102-0) (line 102, col 0, score 0.96)
- [Factorio AI with External Agents — L368](factorio-ai-with-external-agents.md#^ref-a4d90289-368-0) (line 368, col 0, score 0.95)
- [field-interaction-equations — L498](field-interaction-equations.md#^ref-b09141b7-498-0) (line 498, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L507](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-507-0) (line 507, col 0, score 1)
- [Factorio AI with External Agents — L563](factorio-ai-with-external-agents.md#^ref-a4d90289-563-0) (line 563, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L205](model-upgrade-calm-down-guide.md#^ref-db74343f-205-0) (line 205, col 0, score 0.97)
- [plan-update-confirmation — L1286](plan-update-confirmation.md#^ref-b22d79c6-1286-0) (line 1286, col 0, score 0.97)
- [Duck's Self-Referential Perceptual Loop — L187](ducks-self-referential-perceptual-loop.md#^ref-71726f04-187-0) (line 187, col 0, score 0.97)
- [Promethean-Copilot-Intent-Engine — L504](promethean-copilot-intent-engine.md#^ref-ae24a280-504-0) (line 504, col 0, score 0.97)
- [Protocol_0_The_Contradiction_Engine — L485](protocol-0-the-contradiction-engine.md#^ref-9a93a756-485-0) (line 485, col 0, score 0.97)
- [Prompt_Folder_Bootstrap — L549](prompt-folder-bootstrap.md#^ref-bd4f0976-549-0) (line 549, col 0, score 0.97)
- [Docops Feature Updates — L156](docops-feature-updates-3.md#^ref-cdbd21ee-156-0) (line 156, col 0, score 1)
- [Docops Feature Updates — L213](docops-feature-updates.md#^ref-2792d448-213-0) (line 213, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L473](promethean-copilot-intent-engine.md#^ref-ae24a280-473-0) (line 473, col 0, score 1)
- [Admin Dashboard for User Management — L348](admin-dashboard-for-user-management.md#^ref-2901a3e9-348-0) (line 348, col 0, score 1)
- [Duck's Attractor States — L2232](ducks-attractor-states.md#^ref-13951643-2232-0) (line 2232, col 0, score 0.98)
- [The Jar of Echoes — L2186](the-jar-of-echoes.md#^ref-18138627-2186-0) (line 2186, col 0, score 0.97)
- [Promethean Dev Workflow Update — L2959](promethean-dev-workflow-update.md#^ref-03a5578f-2959-0) (line 2959, col 0, score 0.97)
- [Canonical Org-Babel Matplotlib Animation Template — L2115](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-2115-0) (line 2115, col 0, score 0.97)
- [Stateful Partitions and Rebalancing — L988](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-988-0) (line 988, col 0, score 1)
- [Admin Dashboard for User Management — L352](admin-dashboard-for-user-management.md#^ref-2901a3e9-352-0) (line 352, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L647](migrate-to-provider-tenant-architecture.md#^ref-54382370-647-0) (line 647, col 0, score 1)
- [Prompt_Folder_Bootstrap — L350](prompt-folder-bootstrap.md#^ref-bd4f0976-350-0) (line 350, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L418](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-418-0) (line 418, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L926](migrate-to-provider-tenant-architecture.md#^ref-54382370-926-0) (line 926, col 0, score 0.98)
- [schema-evolution-workflow — L919](schema-evolution-workflow.md#^ref-d8059b6a-919-0) (line 919, col 0, score 0.98)
- [Fnord Tracer Protocol — L772](fnord-tracer-protocol.md#^ref-fc21f824-772-0) (line 772, col 0, score 0.97)
- [TypeScript Patch for Tool Calling Support — L713](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-713-0) (line 713, col 0, score 1)
- [Stateful Partitions and Rebalancing — L775](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-775-0) (line 775, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L641](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-641-0) (line 641, col 0, score 1)
- [Promethean Chat Activity Report — L174](promethean-chat-activity-report.md#^ref-18344cf9-174-0) (line 174, col 0, score 1)
- [eidolon-field-math-foundations — L540](eidolon-field-math-foundations.md#^ref-008f2ac0-540-0) (line 540, col 0, score 1)
- [Self-Agency in AI Interaction — L287](self-agency-in-ai-interaction.md#^ref-49a9a860-287-0) (line 287, col 0, score 1)
- [Pure TypeScript Search Microservice — L726](pure-typescript-search-microservice.md#^ref-d17d3a96-726-0) (line 726, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L456](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-456-0) (line 456, col 0, score 1)
- [The Jar of Echoes — L422](the-jar-of-echoes.md#^ref-18138627-422-0) (line 422, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L370](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-370-0) (line 370, col 0, score 1)
- [schema-evolution-workflow — L806](schema-evolution-workflow.md#^ref-d8059b6a-806-0) (line 806, col 0, score 1)
- [typed-struct-compiler — L730](typed-struct-compiler.md#^ref-78eeedf7-730-0) (line 730, col 0, score 1)
- [windows-tiling-with-autohotkey — L2498](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2498-0) (line 2498, col 0, score 0.99)
- [eidolon-field-math-foundations — L6299](eidolon-field-math-foundations.md#^ref-008f2ac0-6299-0) (line 6299, col 0, score 0.99)
- [Canonical Org-Babel Matplotlib Animation Template — L3255](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-3255-0) (line 3255, col 0, score 0.99)
- [eidolon-field-math-foundations — L7366](eidolon-field-math-foundations.md#^ref-008f2ac0-7366-0) (line 7366, col 0, score 0.99)
- [Canonical Org-Babel Matplotlib Animation Template — L2533](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-2533-0) (line 2533, col 0, score 0.98)
- [eidolon-field-math-foundations — L7318](eidolon-field-math-foundations.md#^ref-008f2ac0-7318-0) (line 7318, col 0, score 0.98)
- [Model Upgrade Calm-Down Guide — L324](model-upgrade-calm-down-guide.md#^ref-db74343f-324-0) (line 324, col 0, score 1)
- [plan-update-confirmation — L1164](plan-update-confirmation.md#^ref-b22d79c6-1164-0) (line 1164, col 0, score 1)
- [Prompt_Folder_Bootstrap — L452](prompt-folder-bootstrap.md#^ref-bd4f0976-452-0) (line 452, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L747](migrate-to-provider-tenant-architecture.md#^ref-54382370-747-0) (line 747, col 0, score 1)
- [Dynamic Context Model for Web Components — L1526](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1526-0) (line 1526, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L243](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-243-0) (line 243, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L242](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-242-0) (line 242, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L407](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-407-0) (line 407, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L325](model-upgrade-calm-down-guide.md#^ref-db74343f-325-0) (line 325, col 0, score 1)
- [plan-update-confirmation — L1165](plan-update-confirmation.md#^ref-b22d79c6-1165-0) (line 1165, col 0, score 1)
- [Prompt_Folder_Bootstrap — L453](prompt-folder-bootstrap.md#^ref-bd4f0976-453-0) (line 453, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L748](migrate-to-provider-tenant-architecture.md#^ref-54382370-748-0) (line 748, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L805](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-805-0) (line 805, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L1527](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1527-0) (line 1527, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration Guide — L244](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-244-0) (line 244, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration — L243](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-243-0) (line 243, col 0, score 0.99)
- [Model Upgrade Calm-Down Guide — L326](model-upgrade-calm-down-guide.md#^ref-db74343f-326-0) (line 326, col 0, score 1)
- [plan-update-confirmation — L1166](plan-update-confirmation.md#^ref-b22d79c6-1166-0) (line 1166, col 0, score 1)
- [Prompt_Folder_Bootstrap — L454](prompt-folder-bootstrap.md#^ref-bd4f0976-454-0) (line 454, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L749](migrate-to-provider-tenant-architecture.md#^ref-54382370-749-0) (line 749, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L806](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-806-0) (line 806, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L245](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-245-0) (line 245, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L244](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-244-0) (line 244, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L409](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-409-0) (line 409, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L587](promethean-copilot-intent-engine.md#^ref-ae24a280-587-0) (line 587, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L327](model-upgrade-calm-down-guide.md#^ref-db74343f-327-0) (line 327, col 0, score 1)
- [plan-update-confirmation — L1167](plan-update-confirmation.md#^ref-b22d79c6-1167-0) (line 1167, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L750](migrate-to-provider-tenant-architecture.md#^ref-54382370-750-0) (line 750, col 0, score 1)
- [Prompt_Folder_Bootstrap — L455](prompt-folder-bootstrap.md#^ref-bd4f0976-455-0) (line 455, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L807](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-807-0) (line 807, col 0, score 1)
- [Dynamic Context Model for Web Components — L1528](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1528-0) (line 1528, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L245](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-245-0) (line 245, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L410](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-410-0) (line 410, col 0, score 1)
- [plan-update-confirmation — L1168](plan-update-confirmation.md#^ref-b22d79c6-1168-0) (line 1168, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L751](migrate-to-provider-tenant-architecture.md#^ref-54382370-751-0) (line 751, col 0, score 1)
- [Prompt_Folder_Bootstrap — L456](prompt-folder-bootstrap.md#^ref-bd4f0976-456-0) (line 456, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L808](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-808-0) (line 808, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L1529](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1529-0) (line 1529, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration Guide — L246](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-246-0) (line 246, col 0, score 0.99)
- [Obsidian Templating Plugins Integration Guide — L411](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-411-0) (line 411, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L589](promethean-copilot-intent-engine.md#^ref-ae24a280-589-0) (line 589, col 0, score 0.99)
- [plan-update-confirmation — L1169](plan-update-confirmation.md#^ref-b22d79c6-1169-0) (line 1169, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L752](migrate-to-provider-tenant-architecture.md#^ref-54382370-752-0) (line 752, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L809](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-809-0) (line 809, col 0, score 1)
- [Dynamic Context Model for Web Components — L1530](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1530-0) (line 1530, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L247](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-247-0) (line 247, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L246](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-246-0) (line 246, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L590](promethean-copilot-intent-engine.md#^ref-ae24a280-590-0) (line 590, col 0, score 1)
- [Prometheus Observability Stack — L894](prometheus-observability-stack.md#^ref-e90b5a16-894-0) (line 894, col 0, score 1)
- [schema-evolution-workflow — L754](schema-evolution-workflow.md#^ref-d8059b6a-754-0) (line 754, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L510](layer1survivabilityenvelope.md#^ref-64a9f9f9-510-0) (line 510, col 0, score 1)
- [Tracing the Signal — L440](tracing-the-signal.md#^ref-c3cd4f65-440-0) (line 440, col 0, score 1)
- [Dynamic Context Model for Web Components — L637](dynamic-context-model-for-web-components.md#^ref-f7702bf8-637-0) (line 637, col 0, score 0.98)
- [Functional Embedding Pipeline Refactor — L522](functional-embedding-pipeline-refactor.md#^ref-a4a25141-522-0) (line 522, col 0, score 0.98)
- [Ice Box Reorganization — L384](ice-box-reorganization.md#^ref-291c7d91-384-0) (line 384, col 0, score 0.98)
- [Factorio AI with External Agents — L325](factorio-ai-with-external-agents.md#^ref-a4d90289-325-0) (line 325, col 0, score 0.98)
- [Stateful Partitions and Rebalancing — L890](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-890-0) (line 890, col 0, score 0.98)
- [schema-evolution-workflow — L715](schema-evolution-workflow.md#^ref-d8059b6a-715-0) (line 715, col 0, score 0.98)
- [sibilant-macro-targets — L355](sibilant-macro-targets.md#^ref-c5c9a5c6-355-0) (line 355, col 0, score 1)
- [Docops Feature Updates — L106](docops-feature-updates.md#^ref-2792d448-106-0) (line 106, col 0, score 1)
- [ChatGPT Custom Prompts — L119](chatgpt-custom-prompts.md#^ref-930054b3-119-0) (line 119, col 0, score 1)
- [Ice Box Reorganization — L328](ice-box-reorganization.md#^ref-291c7d91-328-0) (line 328, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L349](model-upgrade-calm-down-guide.md#^ref-db74343f-349-0) (line 349, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L341](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-341-0) (line 341, col 0, score 1)
- [Admin Dashboard for User Management — L199](admin-dashboard-for-user-management.md#^ref-2901a3e9-199-0) (line 199, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L988](chroma-toolkit-consolidation-plan.md#^ref-5020e892-988-0) (line 988, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L531](layer1survivabilityenvelope.md#^ref-64a9f9f9-531-0) (line 531, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L377](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-377-0) (line 377, col 0, score 1)
- [schema-evolution-workflow — L817](schema-evolution-workflow.md#^ref-d8059b6a-817-0) (line 817, col 0, score 1)
- [Optimizing Command Limitations in System Design — L173](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-173-0) (line 173, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L634](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-634-0) (line 634, col 0, score 0.99)
- [Factorio AI with External Agents — L322](factorio-ai-with-external-agents.md#^ref-a4d90289-322-0) (line 322, col 0, score 0.99)
- [Admin Dashboard for User Management — L213](admin-dashboard-for-user-management.md#^ref-2901a3e9-213-0) (line 213, col 0, score 0.99)
- [graph-ds — L627](graph-ds.md#^ref-6620e2f2-627-0) (line 627, col 0, score 0.98)
- [Performance-Optimized-Polyglot-Bridge — L801](performance-optimized-polyglot-bridge.md#^ref-f5579967-801-0) (line 801, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L857](dynamic-context-model-for-web-components.md#^ref-f7702bf8-857-0) (line 857, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L500](functional-embedding-pipeline-refactor.md#^ref-a4a25141-500-0) (line 500, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L273](promethean-copilot-intent-engine.md#^ref-ae24a280-273-0) (line 273, col 0, score 1)
- [windows-tiling-with-autohotkey — L352](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-352-0) (line 352, col 0, score 0.97)
- [Duck's Attractor States — L1950](ducks-attractor-states.md#^ref-13951643-1950-0) (line 1950, col 0, score 0.96)
- [Dynamic Context Model for Web Components — L1648](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1648-0) (line 1648, col 0, score 0.96)
- [Promethean Infrastructure Setup — L1600](promethean-infrastructure-setup.md#^ref-6deed6ac-1600-0) (line 1600, col 0, score 0.96)
- [Canonical Org-Babel Matplotlib Animation Template — L756](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-756-0) (line 756, col 0, score 0.96)
- [Functional Embedding Pipeline Refactor — L604](functional-embedding-pipeline-refactor.md#^ref-a4a25141-604-0) (line 604, col 0, score 1)
- [typed-struct-compiler — L671](typed-struct-compiler.md#^ref-78eeedf7-671-0) (line 671, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L158](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-158-0) (line 158, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L157](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-157-0) (line 157, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L230](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-230-0) (line 230, col 0, score 1)
- [Dynamic Context Model for Web Components — L1123](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1123-0) (line 1123, col 0, score 1)
- [Factorio AI with External Agents — L401](factorio-ai-with-external-agents.md#^ref-a4d90289-401-0) (line 401, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L917](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-917-0) (line 917, col 0, score 0.99)
- [plan-update-confirmation — L1386](plan-update-confirmation.md#^ref-b22d79c6-1386-0) (line 1386, col 0, score 0.99)
- [Prompt_Folder_Bootstrap — L436](prompt-folder-bootstrap.md#^ref-bd4f0976-436-0) (line 436, col 0, score 0.99)
- [komorebi-group-window-hack — L427](komorebi-group-window-hack.md#^ref-dd89372d-427-0) (line 427, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L638](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-638-0) (line 638, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L344](chroma-toolkit-consolidation-plan.md#^ref-5020e892-344-0) (line 344, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L1897](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-1897-0) (line 1897, col 0, score 0.97)
- [The Jar of Echoes — L2089](the-jar-of-echoes.md#^ref-18138627-2089-0) (line 2089, col 0, score 0.97)
- [Canonical Org-Babel Matplotlib Animation Template — L1905](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-1905-0) (line 1905, col 0, score 0.97)
- [Canonical Org-Babel Matplotlib Animation Template — L1919](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-1919-0) (line 1919, col 0, score 0.97)
- [eidolon-field-math-foundations — L3403](eidolon-field-math-foundations.md#^ref-008f2ac0-3403-0) (line 3403, col 0, score 0.97)
- [plan-update-confirmation — L1752](plan-update-confirmation.md#^ref-b22d79c6-1752-0) (line 1752, col 0, score 1)
- [Tracing the Signal — L437](tracing-the-signal.md#^ref-c3cd4f65-437-0) (line 437, col 0, score 1)
- [Dynamic Context Model for Web Components — L604](dynamic-context-model-for-web-components.md#^ref-f7702bf8-604-0) (line 604, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L452](layer1survivabilityenvelope.md#^ref-64a9f9f9-452-0) (line 452, col 0, score 0.97)
- [field-dynamics-math-blocks — L533](field-dynamics-math-blocks.md#^ref-7cfc230d-533-0) (line 533, col 0, score 0.97)
- [field-node-diagram-set — L412](field-node-diagram-set.md#^ref-22b989d5-412-0) (line 412, col 0, score 0.97)
- [field-interaction-equations — L573](field-interaction-equations.md#^ref-b09141b7-573-0) (line 573, col 0, score 0.97)
- [Functional Refactor of TypeScript Document Processing — L363](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-363-0) (line 363, col 0, score 0.97)
- [Protocol_0_The_Contradiction_Engine — L290](protocol-0-the-contradiction-engine.md#^ref-9a93a756-290-0) (line 290, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L629](migrate-to-provider-tenant-architecture.md#^ref-54382370-629-0) (line 629, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L647](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-647-0) (line 647, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L299](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-299-0) (line 299, col 0, score 0.99)
- [Obsidian Templating Plugins Integration Guide — L356](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-356-0) (line 356, col 0, score 0.99)
- [plan-update-confirmation — L1553](plan-update-confirmation.md#^ref-b22d79c6-1553-0) (line 1553, col 0, score 0.99)
- [i3-bluetooth-setup — L411](i3-bluetooth-setup.md#^ref-5e408692-411-0) (line 411, col 0, score 0.99)
- [komorebi-group-window-hack — L430](komorebi-group-window-hack.md#^ref-dd89372d-430-0) (line 430, col 0, score 1)
- [field-dynamics-math-blocks — L451](field-dynamics-math-blocks.md#^ref-7cfc230d-451-0) (line 451, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L639](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-639-0) (line 639, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L348](chroma-toolkit-consolidation-plan.md#^ref-5020e892-348-0) (line 348, col 0, score 1)
- [Dynamic Context Model for Web Components — L717](dynamic-context-model-for-web-components.md#^ref-f7702bf8-717-0) (line 717, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L628](migrate-to-provider-tenant-architecture.md#^ref-54382370-628-0) (line 628, col 0, score 1)
- [Pipeline Enhancements — L98](pipeline-enhancements.md#^ref-e2135d9f-98-0) (line 98, col 0, score 0.99)
- [Docops Feature Updates — L133](docops-feature-updates-3.md#^ref-cdbd21ee-133-0) (line 133, col 0, score 0.99)
- [Redirecting Standard Error — L144](redirecting-standard-error.md#^ref-b3555ede-144-0) (line 144, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L346](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-346-0) (line 346, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L477](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-477-0) (line 477, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L805](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-805-0) (line 805, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L190](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-190-0) (line 190, col 0, score 1)
- [Reawakening Duck — L294](reawakening-duck.md#^ref-59b5670f-294-0) (line 294, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L486](functional-embedding-pipeline-refactor.md#^ref-a4a25141-486-0) (line 486, col 0, score 1)
- [Prompt_Folder_Bootstrap — L418](prompt-folder-bootstrap.md#^ref-bd4f0976-418-0) (line 418, col 0, score 1)
- [Admin Dashboard for User Management — L214](admin-dashboard-for-user-management.md#^ref-2901a3e9-214-0) (line 214, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L482](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-482-0) (line 482, col 0, score 0.98)
- [Layer1SurvivabilityEnvelope — L493](layer1survivabilityenvelope.md#^ref-64a9f9f9-493-0) (line 493, col 0, score 0.97)
- [Provider-Agnostic Chat Panel Implementation — L533](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-533-0) (line 533, col 0, score 0.97)
- [Reawakening Duck — L398](reawakening-duck.md#^ref-59b5670f-398-0) (line 398, col 0, score 0.96)
- [Performance-Optimized-Polyglot-Bridge — L805](performance-optimized-polyglot-bridge.md#^ref-f5579967-805-0) (line 805, col 0, score 0.96)
- [field-interaction-equations — L416](field-interaction-equations.md#^ref-b09141b7-416-0) (line 416, col 0, score 0.96)
- [homeostasis-decay-formulas — L624](homeostasis-decay-formulas.md#^ref-37b5d236-624-0) (line 624, col 0, score 0.96)
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
- [Per-Domain Policy System for JS Crawler — L660](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-660-0) (line 660, col 0, score 1)
- [Promethean Infrastructure Setup — L923](promethean-infrastructure-setup.md#^ref-6deed6ac-923-0) (line 923, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L715](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-715-0) (line 715, col 0, score 1)
- [Stateful Partitions and Rebalancing — L949](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-949-0) (line 949, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L905](performance-optimized-polyglot-bridge.md#^ref-f5579967-905-0) (line 905, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L280](promethean-copilot-intent-engine.md#^ref-ae24a280-280-0) (line 280, col 0, score 1)
- [schema-evolution-workflow — L908](schema-evolution-workflow.md#^ref-d8059b6a-908-0) (line 908, col 0, score 1)
- [windows-tiling-with-autohotkey — L2076](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2076-0) (line 2076, col 0, score 0.97)
- [Agent Tasks: Persistence Migration to DualStore — L362](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-362-0) (line 362, col 0, score 0.97)
- [Agent Tasks: Persistence Migration to DualStore — L454](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-454-0) (line 454, col 0, score 1)
- [Factorio AI with External Agents — L404](factorio-ai-with-external-agents.md#^ref-a4d90289-404-0) (line 404, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L277](promethean-copilot-intent-engine.md#^ref-ae24a280-277-0) (line 277, col 0, score 1)
- [homeostasis-decay-formulas — L593](homeostasis-decay-formulas.md#^ref-37b5d236-593-0) (line 593, col 0, score 1)
- [Pure TypeScript Search Microservice — L729](pure-typescript-search-microservice.md#^ref-d17d3a96-729-0) (line 729, col 0, score 1)
- [Promethean Infrastructure Setup — L1104](promethean-infrastructure-setup.md#^ref-6deed6ac-1104-0) (line 1104, col 0, score 1)
- [Dynamic Context Model for Web Components — L611](dynamic-context-model-for-web-components.md#^ref-f7702bf8-611-0) (line 611, col 0, score 1)
- [Stateful Partitions and Rebalancing — L999](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-999-0) (line 999, col 0, score 1)
- [Ice Box Reorganization — L388](ice-box-reorganization.md#^ref-291c7d91-388-0) (line 388, col 0, score 0.99)
- [Stateful Partitions and Rebalancing — L1004](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-1004-0) (line 1004, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L646](migrate-to-provider-tenant-architecture.md#^ref-54382370-646-0) (line 646, col 0, score 0.99)
- [schema-evolution-workflow — L773](schema-evolution-workflow.md#^ref-d8059b6a-773-0) (line 773, col 0, score 0.99)
- [Stateful Partitions and Rebalancing — L987](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-987-0) (line 987, col 0, score 0.99)
- [Agent Reflections and Prompt Evolution — L419](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-419-0) (line 419, col 0, score 0.99)
- [Factorio AI with External Agents — L330](factorio-ai-with-external-agents.md#^ref-a4d90289-330-0) (line 330, col 0, score 0.99)
- [Promethean State Format — L306](promethean-state-format.md#^ref-23df6ddb-306-0) (line 306, col 0, score 0.99)
- [Docops Feature Updates — L121](docops-feature-updates.md#^ref-2792d448-121-0) (line 121, col 0, score 0.98)
- [Factorio AI with External Agents — L324](factorio-ai-with-external-agents.md#^ref-a4d90289-324-0) (line 324, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L567](layer1survivabilityenvelope.md#^ref-64a9f9f9-567-0) (line 567, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L362](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-362-0) (line 362, col 0, score 1)
- [Promethean Dev Workflow Update — L359](promethean-dev-workflow-update.md#^ref-03a5578f-359-0) (line 359, col 0, score 1)
- [Eidolon Field Abstract Model — L661](eidolon-field-abstract-model.md#^ref-5e8b2388-661-0) (line 661, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L405](promethean-copilot-intent-engine.md#^ref-ae24a280-405-0) (line 405, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L697](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-697-0) (line 697, col 0, score 1)
- [typed-struct-compiler — L721](typed-struct-compiler.md#^ref-78eeedf7-721-0) (line 721, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L902](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-902-0) (line 902, col 0, score 1)
- [plan-update-confirmation — L1343](plan-update-confirmation.md#^ref-b22d79c6-1343-0) (line 1343, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L283](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-283-0) (line 283, col 0, score 1)
- [Factorio AI with External Agents — L578](factorio-ai-with-external-agents.md#^ref-a4d90289-578-0) (line 578, col 0, score 1)
- [Stateful Partitions and Rebalancing — L928](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-928-0) (line 928, col 0, score 1)
- [homeostasis-decay-formulas — L484](homeostasis-decay-formulas.md#^ref-37b5d236-484-0) (line 484, col 0, score 0.97)
- [typed-struct-compiler — L536](typed-struct-compiler.md#^ref-78eeedf7-536-0) (line 536, col 0, score 0.97)
- [Dynamic Context Model for Web Components — L1283](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1283-0) (line 1283, col 0, score 0.97)
- [Diagrams — L170](chunks/diagrams.md#^ref-45cd25b5-170-0) (line 170, col 0, score 0.97)
- [Eidolon Field Abstract Model — L810](eidolon-field-abstract-model.md#^ref-5e8b2388-810-0) (line 810, col 0, score 0.97)
- [eidolon-field-math-foundations — L976](eidolon-field-math-foundations.md#^ref-008f2ac0-976-0) (line 976, col 0, score 0.97)
- [eidolon-node-lifecycle — L266](eidolon-node-lifecycle.md#^ref-938eca9c-266-0) (line 266, col 0, score 0.97)
- [Promethean Infrastructure Setup — L872](promethean-infrastructure-setup.md#^ref-6deed6ac-872-0) (line 872, col 0, score 0.98)
- [Prometheus Observability Stack — L665](prometheus-observability-stack.md#^ref-e90b5a16-665-0) (line 665, col 0, score 0.98)
- [Per-Domain Policy System for JS Crawler — L631](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-631-0) (line 631, col 0, score 0.98)
- [Pure TypeScript Search Microservice — L769](pure-typescript-search-microservice.md#^ref-d17d3a96-769-0) (line 769, col 0, score 0.98)
- [Per-Domain Policy System for JS Crawler — L817](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-817-0) (line 817, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L495](migrate-to-provider-tenant-architecture.md#^ref-54382370-495-0) (line 495, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L982](migrate-to-provider-tenant-architecture.md#^ref-54382370-982-0) (line 982, col 0, score 0.98)
- [Per-Domain Policy System for JS Crawler — L653](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-653-0) (line 653, col 0, score 0.98)
- [Promethean Infrastructure Setup — L1352](promethean-infrastructure-setup.md#^ref-6deed6ac-1352-0) (line 1352, col 0, score 0.99)
- [Prometheus Observability Stack — L1103](prometheus-observability-stack.md#^ref-e90b5a16-1103-0) (line 1103, col 0, score 0.99)
- [Prompt_Folder_Bootstrap — L671](prompt-folder-bootstrap.md#^ref-bd4f0976-671-0) (line 671, col 0, score 0.99)
- [Protocol_0_The_Contradiction_Engine — L511](protocol-0-the-contradiction-engine.md#^ref-9a93a756-511-0) (line 511, col 0, score 0.99)
- [Provider-Agnostic Chat Panel Implementation — L825](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-825-0) (line 825, col 0, score 0.99)
- [Pure TypeScript Search Microservice — L1229](pure-typescript-search-microservice.md#^ref-d17d3a96-1229-0) (line 1229, col 0, score 0.99)
- [ripple-propagation-demo — L637](ripple-propagation-demo.md#^ref-8430617b-637-0) (line 637, col 0, score 0.99)
- [schema-evolution-workflow — L1285](schema-evolution-workflow.md#^ref-d8059b6a-1285-0) (line 1285, col 0, score 0.99)
- [sibilant-macro-targets — L716](sibilant-macro-targets.md#^ref-c5c9a5c6-716-0) (line 716, col 0, score 0.99)
- [Promethean Dev Workflow Update — L367](promethean-dev-workflow-update.md#^ref-03a5578f-367-0) (line 367, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L581](performance-optimized-polyglot-bridge.md#^ref-f5579967-581-0) (line 581, col 0, score 1)
- [eidolon-field-math-foundations — L5923](eidolon-field-math-foundations.md#^ref-008f2ac0-5923-0) (line 5923, col 0, score 0.99)
- [Promethean Dev Workflow Update — L4559](promethean-dev-workflow-update.md#^ref-03a5578f-4559-0) (line 4559, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L4656](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-4656-0) (line 4656, col 0, score 0.99)
- [eidolon-field-math-foundations — L5953](eidolon-field-math-foundations.md#^ref-008f2ac0-5953-0) (line 5953, col 0, score 0.98)
- [Promethean Dev Workflow Update — L4589](promethean-dev-workflow-update.md#^ref-03a5578f-4589-0) (line 4589, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L4685](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-4685-0) (line 4685, col 0, score 0.98)
- [i3-bluetooth-setup — L274](i3-bluetooth-setup.md#^ref-5e408692-274-0) (line 274, col 0, score 1)
- [Stateful Partitions and Rebalancing — L741](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-741-0) (line 741, col 0, score 1)
- [komorebi-group-window-hack — L387](komorebi-group-window-hack.md#^ref-dd89372d-387-0) (line 387, col 0, score 0.94)
- [Migrate to Provider-Tenant Architecture — L857](migrate-to-provider-tenant-architecture.md#^ref-54382370-857-0) (line 857, col 0, score 0.94)
- [Performance-Optimized-Polyglot-Bridge — L721](performance-optimized-polyglot-bridge.md#^ref-f5579967-721-0) (line 721, col 0, score 0.94)
- [plan-update-confirmation — L1437](plan-update-confirmation.md#^ref-b22d79c6-1437-0) (line 1437, col 0, score 0.94)
- [Dynamic Context Model for Web Components — L804](dynamic-context-model-for-web-components.md#^ref-f7702bf8-804-0) (line 804, col 0, score 0.94)
- [Per-Domain Policy System for JS Crawler — L712](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-712-0) (line 712, col 0, score 0.94)
- [Model Upgrade Calm-Down Guide — L389](model-upgrade-calm-down-guide.md#^ref-db74343f-389-0) (line 389, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L362](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-362-0) (line 362, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L345](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-345-0) (line 345, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L954](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-954-0) (line 954, col 0, score 0.97)
- [TypeScript Patch for Tool Calling Support — L949](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-949-0) (line 949, col 0, score 0.96)
- [Model Upgrade Calm-Down Guide — L432](model-upgrade-calm-down-guide.md#^ref-db74343f-432-0) (line 432, col 0, score 0.96)
- [Canonical Org-Babel Matplotlib Animation Template — L3127](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-3127-0) (line 3127, col 0, score 0.96)
- [Creative Moments — L1887](creative-moments.md#^ref-10d98225-1887-0) (line 1887, col 0, score 0.96)
- [plan-update-confirmation — L1312](plan-update-confirmation.md#^ref-b22d79c6-1312-0) (line 1312, col 0, score 1)
- [Promethean Dev Workflow Update — L231](promethean-dev-workflow-update.md#^ref-03a5578f-231-0) (line 231, col 0, score 1)
- [Promethean Infrastructure Setup — L1061](promethean-infrastructure-setup.md#^ref-6deed6ac-1061-0) (line 1061, col 0, score 1)
- [Factorio AI with External Agents — L461](factorio-ai-with-external-agents.md#^ref-a4d90289-461-0) (line 461, col 0, score 1)
- [Promethean Workflow Optimization — L139](promethean-workflow-optimization.md#^ref-d614d983-139-0) (line 139, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L354](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-354-0) (line 354, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L1044](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1044-0) (line 1044, col 0, score 0.98)
- [Promethean Infrastructure Setup — L913](promethean-infrastructure-setup.md#^ref-6deed6ac-913-0) (line 913, col 0, score 0.98)
- [plan-update-confirmation — L1313](plan-update-confirmation.md#^ref-b22d79c6-1313-0) (line 1313, col 0, score 1)
- [Promethean Dev Workflow Update — L232](promethean-dev-workflow-update.md#^ref-03a5578f-232-0) (line 232, col 0, score 1)
- [Promethean Infrastructure Setup — L1062](promethean-infrastructure-setup.md#^ref-6deed6ac-1062-0) (line 1062, col 0, score 1)
- [Factorio AI with External Agents — L462](factorio-ai-with-external-agents.md#^ref-a4d90289-462-0) (line 462, col 0, score 1)
- [Promethean Workflow Optimization — L140](promethean-workflow-optimization.md#^ref-d614d983-140-0) (line 140, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L355](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-355-0) (line 355, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L1045](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1045-0) (line 1045, col 0, score 0.98)
- [Promethean Infrastructure Setup — L914](promethean-infrastructure-setup.md#^ref-6deed6ac-914-0) (line 914, col 0, score 0.98)
- [Model Upgrade Calm-Down Guide — L447](model-upgrade-calm-down-guide.md#^ref-db74343f-447-0) (line 447, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L422](promethean-copilot-intent-engine.md#^ref-ae24a280-422-0) (line 422, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L656](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-656-0) (line 656, col 0, score 1)
- [Optimizing Command Limitations in System Design — L393](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-393-0) (line 393, col 0, score 0.99)
- [Promethean Infrastructure Setup — L1654](promethean-infrastructure-setup.md#^ref-6deed6ac-1654-0) (line 1654, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L229](promethean-copilot-intent-engine.md#^ref-ae24a280-229-0) (line 229, col 0, score 0.99)
- [Agent Reflections and Prompt Evolution — L291](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-291-0) (line 291, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L732](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-732-0) (line 732, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L442](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-442-0) (line 442, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L758](migrate-to-provider-tenant-architecture.md#^ref-54382370-758-0) (line 758, col 0, score 1)
- [Reawakening Duck — L357](reawakening-duck.md#^ref-59b5670f-357-0) (line 357, col 0, score 1)
- [Pure TypeScript Search Microservice — L748](pure-typescript-search-microservice.md#^ref-d17d3a96-748-0) (line 748, col 0, score 0.96)
- [Model Upgrade Calm-Down Guide — L412](model-upgrade-calm-down-guide.md#^ref-db74343f-412-0) (line 412, col 0, score 0.96)
- [Promethean Infrastructure Setup — L958](promethean-infrastructure-setup.md#^ref-6deed6ac-958-0) (line 958, col 0, score 0.96)
- [Migrate to Provider-Tenant Architecture — L472](migrate-to-provider-tenant-architecture.md#^ref-54382370-472-0) (line 472, col 0, score 0.96)
- [Per-Domain Policy System for JS Crawler — L847](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-847-0) (line 847, col 0, score 0.95)
- [windows-tiling-with-autohotkey — L451](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-451-0) (line 451, col 0, score 1)
- [i3-bluetooth-setup — L435](i3-bluetooth-setup.md#^ref-5e408692-435-0) (line 435, col 0, score 1)
- [plan-update-confirmation — L1324](plan-update-confirmation.md#^ref-b22d79c6-1324-0) (line 1324, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L465](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-465-0) (line 465, col 0, score 1)
- [i3-bluetooth-setup — L423](i3-bluetooth-setup.md#^ref-5e408692-423-0) (line 423, col 0, score 0.95)
- [Agent Tasks: Persistence Migration to DualStore — L289](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-289-0) (line 289, col 0, score 0.95)
- [schema-evolution-workflow — L939](schema-evolution-workflow.md#^ref-d8059b6a-939-0) (line 939, col 0, score 0.95)
- [windows-tiling-with-autohotkey — L483](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-483-0) (line 483, col 0, score 0.95)
- [Model Upgrade Calm-Down Guide — L394](model-upgrade-calm-down-guide.md#^ref-db74343f-394-0) (line 394, col 0, score 1)
- [The Jar of Echoes — L2813](the-jar-of-echoes.md#^ref-18138627-2813-0) (line 2813, col 0, score 0.97)
- [Duck's Attractor States — L2119](ducks-attractor-states.md#^ref-13951643-2119-0) (line 2119, col 0, score 0.97)
- [The Jar of Echoes — L3159](the-jar-of-echoes.md#^ref-18138627-3159-0) (line 3159, col 0, score 0.97)
- [eidolon-field-math-foundations — L2565](eidolon-field-math-foundations.md#^ref-008f2ac0-2565-0) (line 2565, col 0, score 0.97)
- [Duck's Attractor States — L2140](ducks-attractor-states.md#^ref-13951643-2140-0) (line 2140, col 0, score 0.96)
- [Duck's Attractor States — L2172](ducks-attractor-states.md#^ref-13951643-2172-0) (line 2172, col 0, score 0.95)
- [eidolon-field-math-foundations — L3743](eidolon-field-math-foundations.md#^ref-008f2ac0-3743-0) (line 3743, col 0, score 0.95)
- [Factorio AI with External Agents — L506](factorio-ai-with-external-agents.md#^ref-a4d90289-506-0) (line 506, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L455](model-upgrade-calm-down-guide.md#^ref-db74343f-455-0) (line 455, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L324](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-324-0) (line 324, col 0, score 1)
- [Mathematical Samplers — L143](mathematical-samplers.md#^ref-86a691ec-143-0) (line 143, col 0, score 1)
- [Mathematics Sampler — L150](mathematics-sampler.md#^ref-b5e0183e-150-0) (line 150, col 0, score 1)
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
- [Promethean Documentation Overview — L69](promethean-documentation-overview.md#^ref-9413237f-69-0) (line 69, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L527](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-527-0) (line 527, col 0, score 1)
- [Promethean Documentation Update — L146](promethean-documentation-update.md#^ref-c0392040-146-0) (line 146, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L262](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-262-0) (line 262, col 0, score 1)
- [Promethean Infrastructure Setup — L1134](promethean-infrastructure-setup.md#^ref-6deed6ac-1134-0) (line 1134, col 0, score 1)
- [promethean-requirements — L205](promethean-requirements.md#^ref-95205cd3-205-0) (line 205, col 0, score 1)
- [Promethean State Format — L258](promethean-state-format.md#^ref-23df6ddb-258-0) (line 258, col 0, score 1)
- [Promethean Workflow Optimization — L220](promethean-workflow-optimization.md#^ref-d614d983-220-0) (line 220, col 0, score 1)
- [Prometheus Observability Stack — L742](prometheus-observability-stack.md#^ref-e90b5a16-742-0) (line 742, col 0, score 1)
- [Prompt_Folder_Bootstrap — L365](prompt-folder-bootstrap.md#^ref-bd4f0976-365-0) (line 365, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L398](protocol-0-the-contradiction-engine.md#^ref-9a93a756-398-0) (line 398, col 0, score 1)
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
- [Functional Embedding Pipeline Refactor — L675](functional-embedding-pipeline-refactor.md#^ref-a4a25141-675-0) (line 675, col 0, score 1)
- [graph-ds — L635](graph-ds.md#^ref-6620e2f2-635-0) (line 635, col 0, score 1)
- [heartbeat-fragment-demo — L343](heartbeat-fragment-demo.md#^ref-dd00677a-343-0) (line 343, col 0, score 1)
- [homeostasis-decay-formulas — L570](homeostasis-decay-formulas.md#^ref-37b5d236-570-0) (line 570, col 0, score 1)
- [i3-bluetooth-setup — L464](i3-bluetooth-setup.md#^ref-5e408692-464-0) (line 464, col 0, score 1)
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
- [promethean-requirements — L198](promethean-requirements.md#^ref-95205cd3-198-0) (line 198, col 0, score 1)
- [Promethean State Format — L477](promethean-state-format.md#^ref-23df6ddb-477-0) (line 477, col 0, score 1)
- [Promethean Workflow Optimization — L241](promethean-workflow-optimization.md#^ref-d614d983-241-0) (line 241, col 0, score 1)
- [Prometheus Observability Stack — L1035](prometheus-observability-stack.md#^ref-e90b5a16-1035-0) (line 1035, col 0, score 1)
- [Prompt_Folder_Bootstrap — L839](prompt-folder-bootstrap.md#^ref-bd4f0976-839-0) (line 839, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L626](protocol-0-the-contradiction-engine.md#^ref-9a93a756-626-0) (line 626, col 0, score 1)
- [Redirecting Standard Error — L259](redirecting-standard-error.md#^ref-b3555ede-259-0) (line 259, col 0, score 1)
- [ripple-propagation-demo — L648](ripple-propagation-demo.md#^ref-8430617b-648-0) (line 648, col 0, score 1)
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
- [Functional Embedding Pipeline Refactor — L663](functional-embedding-pipeline-refactor.md#^ref-a4a25141-663-0) (line 663, col 0, score 1)
- [graph-ds — L865](graph-ds.md#^ref-6620e2f2-865-0) (line 865, col 0, score 1)
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
- [schema-evolution-workflow — L1311](schema-evolution-workflow.md#^ref-d8059b6a-1311-0) (line 1311, col 0, score 1)
- [Self-Agency in AI Interaction — L393](self-agency-in-ai-interaction.md#^ref-49a9a860-393-0) (line 393, col 0, score 1)
- [sibilant-macro-targets — L733](sibilant-macro-targets.md#^ref-c5c9a5c6-733-0) (line 733, col 0, score 1)
- [Smoke Resonance Visualizations — L417](smoke-resonance-visualizations.md#^ref-ac9d3ac5-417-0) (line 417, col 0, score 1)
- [Stateful Partitions and Rebalancing — L1283](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-1283-0) (line 1283, col 0, score 1)
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
- [Promethean Dev Workflow Update — L613](promethean-dev-workflow-update.md#^ref-03a5578f-613-0) (line 613, col 0, score 0.94)
- [Promethean Infrastructure Setup — L1357](promethean-infrastructure-setup.md#^ref-6deed6ac-1357-0) (line 1357, col 0, score 0.94)
- [Prometheus Observability Stack — L1108](prometheus-observability-stack.md#^ref-e90b5a16-1108-0) (line 1108, col 0, score 0.94)
- [Prompt_Folder_Bootstrap — L676](prompt-folder-bootstrap.md#^ref-bd4f0976-676-0) (line 676, col 0, score 0.94)
- [Protocol_0_The_Contradiction_Engine — L516](protocol-0-the-contradiction-engine.md#^ref-9a93a756-516-0) (line 516, col 0, score 0.94)
- [Provider-Agnostic Chat Panel Implementation — L830](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-830-0) (line 830, col 0, score 0.94)
- [Pure TypeScript Search Microservice — L1234](pure-typescript-search-microservice.md#^ref-d17d3a96-1234-0) (line 1234, col 0, score 0.94)
- [ripple-propagation-demo — L642](ripple-propagation-demo.md#^ref-8430617b-642-0) (line 642, col 0, score 0.94)
- [schema-evolution-workflow — L1290](schema-evolution-workflow.md#^ref-d8059b6a-1290-0) (line 1290, col 0, score 0.94)
- [DSL — L417](chunks/dsl.md#^ref-e87bc036-417-0) (line 417, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L476](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-476-0) (line 476, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L454](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-454-0) (line 454, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L493](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-493-0) (line 493, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L534](promethean-copilot-intent-engine.md#^ref-ae24a280-534-0) (line 534, col 0, score 1)
- [Promethean State Format — L437](promethean-state-format.md#^ref-23df6ddb-437-0) (line 437, col 0, score 1)
- [Creative Moments — L588](creative-moments.md#^ref-10d98225-588-0) (line 588, col 0, score 1)
- [Duck's Attractor States — L1286](ducks-attractor-states.md#^ref-13951643-1286-0) (line 1286, col 0, score 1)
- [DSL — L418](chunks/dsl.md#^ref-e87bc036-418-0) (line 418, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L477](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-477-0) (line 477, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L455](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-455-0) (line 455, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L494](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-494-0) (line 494, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L535](promethean-copilot-intent-engine.md#^ref-ae24a280-535-0) (line 535, col 0, score 1)
- [Promethean State Format — L438](promethean-state-format.md#^ref-23df6ddb-438-0) (line 438, col 0, score 1)
- [ts-to-lisp-transpiler — L399](ts-to-lisp-transpiler.md#^ref-ba11486b-399-0) (line 399, col 0, score 1)
- [plan-update-confirmation — L1452](plan-update-confirmation.md#^ref-b22d79c6-1452-0) (line 1452, col 0, score 1)
- [DSL — L419](chunks/dsl.md#^ref-e87bc036-419-0) (line 419, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L478](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-478-0) (line 478, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L456](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-456-0) (line 456, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L495](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-495-0) (line 495, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L470](promethean-copilot-intent-engine.md#^ref-ae24a280-470-0) (line 470, col 0, score 1)
- [Promethean State Format — L439](promethean-state-format.md#^ref-23df6ddb-439-0) (line 439, col 0, score 1)
- [ts-to-lisp-transpiler — L400](ts-to-lisp-transpiler.md#^ref-ba11486b-400-0) (line 400, col 0, score 1)
- [komorebi-group-window-hack — L442](komorebi-group-window-hack.md#^ref-dd89372d-442-0) (line 442, col 0, score 1)
- [DSL — L420](chunks/dsl.md#^ref-e87bc036-420-0) (line 420, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L479](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-479-0) (line 479, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L457](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-457-0) (line 457, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L496](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-496-0) (line 496, col 0, score 1)
- [Optimizing Command Limitations in System Design — L146](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-146-0) (line 146, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L536](promethean-copilot-intent-engine.md#^ref-ae24a280-536-0) (line 536, col 0, score 1)
- [Promethean State Format — L440](promethean-state-format.md#^ref-23df6ddb-440-0) (line 440, col 0, score 1)
- [ts-to-lisp-transpiler — L401](ts-to-lisp-transpiler.md#^ref-ba11486b-401-0) (line 401, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L480](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-480-0) (line 480, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L458](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-458-0) (line 458, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L497](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-497-0) (line 497, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L537](promethean-copilot-intent-engine.md#^ref-ae24a280-537-0) (line 537, col 0, score 1)
- [Promethean State Format — L441](promethean-state-format.md#^ref-23df6ddb-441-0) (line 441, col 0, score 1)
- [ts-to-lisp-transpiler — L402](ts-to-lisp-transpiler.md#^ref-ba11486b-402-0) (line 402, col 0, score 1)
- [DSL — L422](chunks/dsl.md#^ref-e87bc036-422-0) (line 422, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L481](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-481-0) (line 481, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L459](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-459-0) (line 459, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L498](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-498-0) (line 498, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L538](promethean-copilot-intent-engine.md#^ref-ae24a280-538-0) (line 538, col 0, score 1)
- [Promethean State Format — L442](promethean-state-format.md#^ref-23df6ddb-442-0) (line 442, col 0, score 1)
- [ts-to-lisp-transpiler — L403](ts-to-lisp-transpiler.md#^ref-ba11486b-403-0) (line 403, col 0, score 1)
- [Prompt_Folder_Bootstrap — L417](prompt-folder-bootstrap.md#^ref-bd4f0976-417-0) (line 417, col 0, score 0.98)
- [DSL — L423](chunks/dsl.md#^ref-e87bc036-423-0) (line 423, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L482](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-482-0) (line 482, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L460](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-460-0) (line 460, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L499](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-499-0) (line 499, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L539](promethean-copilot-intent-engine.md#^ref-ae24a280-539-0) (line 539, col 0, score 1)
- [Promethean State Format — L443](promethean-state-format.md#^ref-23df6ddb-443-0) (line 443, col 0, score 1)
- [ts-to-lisp-transpiler — L404](ts-to-lisp-transpiler.md#^ref-ba11486b-404-0) (line 404, col 0, score 1)
- [Factorio AI with External Agents — L580](factorio-ai-with-external-agents.md#^ref-a4d90289-580-0) (line 580, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L484](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-484-0) (line 484, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L462](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-462-0) (line 462, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L501](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-501-0) (line 501, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L541](promethean-copilot-intent-engine.md#^ref-ae24a280-541-0) (line 541, col 0, score 1)
- [Promethean State Format — L445](promethean-state-format.md#^ref-23df6ddb-445-0) (line 445, col 0, score 1)
- [ts-to-lisp-transpiler — L406](ts-to-lisp-transpiler.md#^ref-ba11486b-406-0) (line 406, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L745](migrate-to-provider-tenant-architecture.md#^ref-54382370-745-0) (line 745, col 0, score 0.96)
- [Promethean Documentation Update — L480](promethean-documentation-update.txt#^ref-0b872af2-480-0) (line 480, col 0, score 0.95)
- [Promethean Dev Workflow Update — L517](promethean-dev-workflow-update.md#^ref-03a5578f-517-0) (line 517, col 0, score 0.98)
- [eidolon-field-math-foundations — L602](eidolon-field-math-foundations.md#^ref-008f2ac0-602-0) (line 602, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1253](migrate-to-provider-tenant-architecture.md#^ref-54382370-1253-0) (line 1253, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L902](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-902-0) (line 902, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L1154](performance-optimized-polyglot-bridge.md#^ref-f5579967-1154-0) (line 1154, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L404](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-404-0) (line 404, col 0, score 1)
- [Prometheus Observability Stack — L817](prometheus-observability-stack.md#^ref-e90b5a16-817-0) (line 817, col 0, score 1)
- [Pure TypeScript Search Microservice — L992](pure-typescript-search-microservice.md#^ref-d17d3a96-992-0) (line 992, col 0, score 1)
- [Unique Info Dump Index — L1125](unique-info-dump-index.md#^ref-30ec3ba6-1125-0) (line 1125, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L836](chroma-toolkit-consolidation-plan.md#^ref-5020e892-836-0) (line 836, col 0, score 1)
- [Diagrams — L319](chunks/diagrams.md#^ref-45cd25b5-319-0) (line 319, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L372](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-372-0) (line 372, col 0, score 1)
- [eidolon-field-math-foundations — L603](eidolon-field-math-foundations.md#^ref-008f2ac0-603-0) (line 603, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1254](migrate-to-provider-tenant-architecture.md#^ref-54382370-1254-0) (line 1254, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L1155](performance-optimized-polyglot-bridge.md#^ref-f5579967-1155-0) (line 1155, col 0, score 1)
- [Pure TypeScript Search Microservice — L993](pure-typescript-search-microservice.md#^ref-d17d3a96-993-0) (line 993, col 0, score 1)
- [zero-copy-snapshots-and-workers — L910](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-910-0) (line 910, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L802](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-802-0) (line 802, col 0, score 0.99)
- [Agent Tasks: Persistence Migration to DualStore — L733](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-733-0) (line 733, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L837](chroma-toolkit-consolidation-plan.md#^ref-5020e892-837-0) (line 837, col 0, score 1)
- [Diagrams — L320](chunks/diagrams.md#^ref-45cd25b5-320-0) (line 320, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L373](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-373-0) (line 373, col 0, score 1)
- [Dynamic Context Model for Web Components — L1300](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1300-0) (line 1300, col 0, score 1)
- [eidolon-field-math-foundations — L604](eidolon-field-math-foundations.md#^ref-008f2ac0-604-0) (line 604, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1255](migrate-to-provider-tenant-architecture.md#^ref-54382370-1255-0) (line 1255, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L904](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-904-0) (line 904, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L734](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-734-0) (line 734, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L838](chroma-toolkit-consolidation-plan.md#^ref-5020e892-838-0) (line 838, col 0, score 1)
- [Diagrams — L321](chunks/diagrams.md#^ref-45cd25b5-321-0) (line 321, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L374](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-374-0) (line 374, col 0, score 1)
- [Dynamic Context Model for Web Components — L1301](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1301-0) (line 1301, col 0, score 1)
- [eidolon-field-math-foundations — L605](eidolon-field-math-foundations.md#^ref-008f2ac0-605-0) (line 605, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1256](migrate-to-provider-tenant-architecture.md#^ref-54382370-1256-0) (line 1256, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L905](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-905-0) (line 905, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L735](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-735-0) (line 735, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L839](chroma-toolkit-consolidation-plan.md#^ref-5020e892-839-0) (line 839, col 0, score 1)
- [Diagrams — L322](chunks/diagrams.md#^ref-45cd25b5-322-0) (line 322, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L375](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-375-0) (line 375, col 0, score 1)
- [Dynamic Context Model for Web Components — L1302](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1302-0) (line 1302, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1257](migrate-to-provider-tenant-architecture.md#^ref-54382370-1257-0) (line 1257, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L906](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-906-0) (line 906, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L1158](performance-optimized-polyglot-bridge.md#^ref-f5579967-1158-0) (line 1158, col 0, score 1)
- [Dynamic Context Model for Web Components — L1303](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1303-0) (line 1303, col 0, score 1)
- [eidolon-field-math-foundations — L606](eidolon-field-math-foundations.md#^ref-008f2ac0-606-0) (line 606, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L907](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-907-0) (line 907, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L1159](performance-optimized-polyglot-bridge.md#^ref-f5579967-1159-0) (line 1159, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L409](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-409-0) (line 409, col 0, score 1)
- [Prometheus Observability Stack — L822](prometheus-observability-stack.md#^ref-e90b5a16-822-0) (line 822, col 0, score 1)
- [Pure TypeScript Search Microservice — L997](pure-typescript-search-microservice.md#^ref-d17d3a96-997-0) (line 997, col 0, score 1)
- [Unique Info Dump Index — L1130](unique-info-dump-index.md#^ref-30ec3ba6-1130-0) (line 1130, col 0, score 1)
- [zero-copy-snapshots-and-workers — L914](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-914-0) (line 914, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L736](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-736-0) (line 736, col 0, score 1)
- [Diagrams — L323](chunks/diagrams.md#^ref-45cd25b5-323-0) (line 323, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L376](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-376-0) (line 376, col 0, score 1)
- [Dynamic Context Model for Web Components — L1304](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1304-0) (line 1304, col 0, score 1)
- [eidolon-field-math-foundations — L607](eidolon-field-math-foundations.md#^ref-008f2ac0-607-0) (line 607, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1258](migrate-to-provider-tenant-architecture.md#^ref-54382370-1258-0) (line 1258, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L908](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-908-0) (line 908, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L1160](performance-optimized-polyglot-bridge.md#^ref-f5579967-1160-0) (line 1160, col 0, score 1)
- [Pure TypeScript Search Microservice — L999](pure-typescript-search-microservice.md#^ref-d17d3a96-999-0) (line 999, col 0, score 1)
- [eidolon-field-math-foundations — L930](eidolon-field-math-foundations.md#^ref-008f2ac0-930-0) (line 930, col 0, score 0.97)
- [Chroma Toolkit Consolidation Plan — L841](chroma-toolkit-consolidation-plan.md#^ref-5020e892-841-0) (line 841, col 0, score 1)
- [Diagrams — L325](chunks/diagrams.md#^ref-45cd25b5-325-0) (line 325, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L378](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-378-0) (line 378, col 0, score 1)
- [Dynamic Context Model for Web Components — L1306](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1306-0) (line 1306, col 0, score 1)
- [eidolon-field-math-foundations — L609](eidolon-field-math-foundations.md#^ref-008f2ac0-609-0) (line 609, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1260](migrate-to-provider-tenant-architecture.md#^ref-54382370-1260-0) (line 1260, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L910](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-910-0) (line 910, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L1162](performance-optimized-polyglot-bridge.md#^ref-f5579967-1162-0) (line 1162, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L739](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-739-0) (line 739, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L842](chroma-toolkit-consolidation-plan.md#^ref-5020e892-842-0) (line 842, col 0, score 1)
- [Diagrams — L326](chunks/diagrams.md#^ref-45cd25b5-326-0) (line 326, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L379](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-379-0) (line 379, col 0, score 1)
- [Dynamic Context Model for Web Components — L1307](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1307-0) (line 1307, col 0, score 1)
- [eidolon-field-math-foundations — L610](eidolon-field-math-foundations.md#^ref-008f2ac0-610-0) (line 610, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1261](migrate-to-provider-tenant-architecture.md#^ref-54382370-1261-0) (line 1261, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L1163](performance-optimized-polyglot-bridge.md#^ref-f5579967-1163-0) (line 1163, col 0, score 1)
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
- [Promethean State Format — L555](promethean-state-format.md#^ref-23df6ddb-555-0) (line 555, col 0, score 1)
- [Promethean Workflow Optimization — L260](promethean-workflow-optimization.md#^ref-d614d983-260-0) (line 260, col 0, score 1)
- [Prometheus Observability Stack — L1169](prometheus-observability-stack.md#^ref-e90b5a16-1169-0) (line 1169, col 0, score 1)
- [Prompt_Folder_Bootstrap — L978](prompt-folder-bootstrap.md#^ref-bd4f0976-978-0) (line 978, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L854](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-854-0) (line 854, col 0, score 1)
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
- [Promethean State Format — L557](promethean-state-format.md#^ref-23df6ddb-557-0) (line 557, col 0, score 1)
- [Promethean Workflow Optimization — L262](promethean-workflow-optimization.md#^ref-d614d983-262-0) (line 262, col 0, score 1)
- [Prometheus Observability Stack — L1171](prometheus-observability-stack.md#^ref-e90b5a16-1171-0) (line 1171, col 0, score 1)
- [Prompt_Folder_Bootstrap — L980](prompt-folder-bootstrap.md#^ref-bd4f0976-980-0) (line 980, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L856](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-856-0) (line 856, col 0, score 1)
- [Redirecting Standard Error — L289](redirecting-standard-error.md#^ref-b3555ede-289-0) (line 289, col 0, score 1)
- [ripple-propagation-demo — L659](ripple-propagation-demo.md#^ref-8430617b-659-0) (line 659, col 0, score 1)
- [Self-Agency in AI Interaction — L419](self-agency-in-ai-interaction.md#^ref-49a9a860-419-0) (line 419, col 0, score 1)
- [Smoke Resonance Visualizations — L480](smoke-resonance-visualizations.md#^ref-ac9d3ac5-480-0) (line 480, col 0, score 1)
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
- [promethean-requirements — L220](promethean-requirements.md#^ref-95205cd3-220-0) (line 220, col 0, score 1)
- [Promethean State Format — L559](promethean-state-format.md#^ref-23df6ddb-559-0) (line 559, col 0, score 1)
- [Prometheus Observability Stack — L1173](prometheus-observability-stack.md#^ref-e90b5a16-1173-0) (line 1173, col 0, score 1)
- [Smoke Resonance Visualizations — L482](smoke-resonance-visualizations.md#^ref-ac9d3ac5-482-0) (line 482, col 0, score 1)
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
- [archetype-ecs — L1](archetype-ecs.md#^ref-8f4c1e86-1-0) (line 1, col 0, score 1)
- [archetype-ecs — L3](archetype-ecs.md#^ref-8f4c1e86-3-0) (line 3, col 0, score 1)
- [archetype-ecs — L7](archetype-ecs.md#^ref-8f4c1e86-7-0) (line 7, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
