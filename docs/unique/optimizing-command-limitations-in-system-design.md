---
uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
created_at: 2025.08.22.12.08.59.md
filename: Optimizing Command Limitations in System Design
description: >-
  Addressing command limits by consolidating actions, reducing endpoint counts,
  and strategically splitting services to manage complexity without exceeding 30
  commands. Highlights the need for domain-specific services only when
  consolidation becomes infeasible.
tags:
  - command
  - consolidation
  - endpoint
  - service
  - complexity
  - domain
  - ttl
  - agent
related_to_title:
  - typed-struct-compiler
  - Unique Concepts
  - Unique Info Dump Index
  - zero-copy-snapshots-and-workers
  - Canonical Org-Babel Matplotlib Animation Template
  - Creative Moments
  - Duck's Attractor States
  - eidolon-field-math-foundations
  - field-node-diagram-outline
  - field-node-diagram-set
  - field-node-diagram-visualizations
  - Fnord Tracer Protocol
  - Ice Box Reorganization
  - Dynamic Context Model for Web Components
  - Promethean Infrastructure Setup
  - field-dynamics-math-blocks
  - Tracing the Signal
  - Performance-Optimized-Polyglot-Bridge
  - The Jar of Echoes
  - Promethean Dev Workflow Update
  - Promethean Pipelines
  - Promethean Workflow Optimization
  - Prometheus Observability Stack
  - Prompt_Folder_Bootstrap
  - Protocol_0_The_Contradiction_Engine
  - Pure TypeScript Search Microservice
  - Reawakening Duck
  - Self-Agency in AI Interaction
  - TypeScript Patch for Tool Calling Support
  - Functional Refactor of TypeScript Document Processing
  - Redirecting Standard Error
  - schema-evolution-workflow
  - promethean-requirements
  - Model Selection for Lightweight Conversational Tasks
  - Model Upgrade Calm-Down Guide
  - ParticleSimulationWithCanvasAndFFmpeg
  - plan-update-confirmation
  - polyglot-repl-interface-layer
  - Post-Linguistic Transhuman Design Frameworks
  - eidolon-node-lifecycle
  - obsidian-ignore-node-modules-regex
  - Per-Domain Policy System for JS Crawler
  - Promethean-Copilot-Intent-Engine
  - Promethean State Format
  - Obsidian ChatGPT Plugin Integration
  - Stateful Partitions and Rebalancing
  - ts-to-lisp-transpiler
  - Duck's Self-Referential Perceptual Loop
  - unique-templates
  - Eidolon Field Abstract Model
  - field-interaction-equations
  - Synchronicity Waves and Web
  - NPU Voice Code and Sensory Integration
  - sibilant-macro-targets
  - Smoke Resonance Visualizations
  - Obsidian Templating Plugins Integration Guide
  - Obsidian Task Generation
  - OpenAPI Validation Report
  - 'Agent Tasks: Persistence Migration to DualStore'
  - komorebi-group-window-hack
  - Layer1SurvivabilityEnvelope
  - Provider-Agnostic Chat Panel Implementation
  - ripple-propagation-demo
  - Promethean_Eidolon_Synchronicity_Model
  - Obsidian ChatGPT Plugin Integration Guide
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
  - Docops Feature Updates
  - Functional Embedding Pipeline Refactor
  - graph-ds
  - heartbeat-fragment-demo
  - i3-bluetooth-setup
  - Promethean Documentation Pipeline Overview
  - Promethean Chat Activity Report
  - windows-tiling-with-autohotkey
  - Promethean Notes
  - Factorio AI with External Agents
  - MindfulRobotIntegration
  - api-gateway-versioning
  - Board Automation Improvements
  - Board Walk – 2025-08-11
  - homeostasis-decay-formulas
  - Migrate to Provider-Tenant Architecture
  - Admin Dashboard for User Management
  - Window Management
  - Debugging Broker Connections and Agent Behavior
  - Promethean Documentation Update
  - DuckDuckGoSearchPipeline
  - Pipeline Enhancements
  - Promethean Data Sync Protocol
  - Promethean Documentation Overview
  - Mathematical Samplers
  - Mathematics Sampler
  - Mindful Prioritization
  - balanced-bst
  - Agent Reflections and Prompt Evolution
  - Tooling
  - aionian-circuit-math
  - Local-Only-LLM-Workflow
  - AI-First-OS-Model-Context-Protocol
related_to_uuid:
  - 78eeedf7-75bc-4692-a5a7-bb6857270621
  - ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - 62bec6f0-4e13-4f38-aca4-72c84ba02367
  - 1b1338fc-bb4d-41df-828f-e219cc9442eb
  - 10d98225-12e0-4212-8e15-88b57cf7bee5
  - 13951643-1741-46bb-89dc-1beebb122633
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - 22b989d5-f4aa-4880-8632-709c21830f83
  - e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
  - fc21f824-4244-4030-a48e-c4170160ea1d
  - 291c7d91-da8c-486c-9bc0-bd2254536e2d
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
  - c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
  - f5579967-762d-4cfd-851e-4f71b4cb77a1
  - 18138627-a348-4fbb-b447-410dfb400564
  - 03a5578f-d689-45db-95e9-11300e5eee6f
  - 8b8e6103-30a4-4d66-b5f2-87db1612b587
  - d614d983-7795-491f-9437-09f3a43f72cf
  - e90b5a16-d58f-424d-bd36-70e9bd2861ad
  - bd4f0976-0d5b-47f6-a20a-0601d1842dc1
  - 9a93a756-6d33-45d1-aca9-51b74f2b33d2
  - d17d3a96-c84d-4738-a403-6c733b874da2
  - 59b5670f-36d3-4d34-8985-f3144b15347a
  - 49a9a860-944c-467a-b532-4f99186a8593
  - 7b7ca860-780c-44fa-8d3f-be8bd9496fba
  - 1cfae310-35dc-49c2-98f1-b186da25d84b
  - b3555ede-324a-4d24-a885-b0721e74babf
  - d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
  - 95205cd3-c3d5-4047-9c33-9c5ca2b49597
  - d144aa62-348c-4e5d-ae8f-38084c67ceca
  - db74343f-8f84-43a3-adb2-499c6f00be1c
  - e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
  - b22d79c6-825b-4cd3-b0d3-1cef0532bb54
  - 9c79206d-4cb9-4f00-87e0-782dcea37bc7
  - 6bcff92c-4224-453d-9993-1be8d37d47c3
  - 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
  - ffb9b2a9-744d-4a53-9565-130fceae0832
  - c03020e1-e3e7-48bf-aa7e-aa740c601b63
  - ae24a280-678e-4c0b-8cc4-56667fa04172
  - 23df6ddb-05cf-4639-8201-f8291f8a6026
  - ca8e1399-77bf-4f77-82a3-3f703b68706d
  - 4330e8f0-5f46-4235-918b-39b6b93fa561
  - ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
  - 71726f04-eb1c-42a5-a5fe-d8209de6e159
  - c26f0044-26fe-4c43-8ab0-fc4690723e3c
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - b09141b7-544f-4c8e-8f49-bf76cecaacbb
  - 91295f3a-a2af-4050-a2b8-4777ea70c32c
  - 5a02283e-4281-4930-9ca7-e27849de11bd
  - c5c9a5c6-427d-4864-8084-c083cd55faa0
  - ac9d3ac5-9a6a-4180-a67f-1ab7e229d981
  - b39dc9d4-63e2-42d4-bbcd-041ef3167bca
  - 9b694a91-dec5-4708-9462-3f71000ba925
  - 5c152b08-6b69-4bb8-a1a7-66745789c169
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - dd89372d-10de-42a9-8c96-6bc13ea36d02
  - 64a9f9f9-58ee-4996-bdaf-9373845c6b29
  - 43bfe9dd-d433-42ca-9777-f4c40eaba791
  - 8430617b-80a2-4cc9-8288-9a74cb57990b
  - 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
  - 1d3d6c3a-039e-4b96-93c1-95854945e248
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
  - 2792d448-c3b5-4050-93dd-93768529d99c
  - a4a25141-6380-40b9-9cd7-b554b246b303
  - 6620e2f2-de6d-45d8-a722-5d26e160b370
  - dd00677a-2280-45a7-91af-0728b21af3ad
  - 5e408692-0e74-400e-a617-84247c7353ad
  - 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
  - 18344cf9-0c49-4a71-b6c8-b8d84d660fca
  - 0f6f8f38-98d0-438f-9601-58f478acc0b7
  - 1c4046b5-742d-4004-aec6-b47251fef5d6
  - a4d90289-798d-44a0-a8e8-a055ae12fb52
  - 5f65dfa5-dc97-4a6c-ad93-c45c1312e156
  - cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
  - 0580dcd3-533d-4834-8a2f-eae3771960a9
  - ac60a1d6-fd9f-46dc-bbe7-176dd8017c59
  - 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
  - 37b5d236-2b3e-4a95-a4e8-31655c3023ef
  - 54382370-1931-4a19-a634-46735708a9ea
  - 2901a3e9-96f0-497c-ae2c-775f28a702dd
  - 9e8ae388-767a-4ea8-9f2e-88801291d947
  - 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
  - 0b872af2-4197-46f3-b631-afb4e6135585
  - e979c50f-69bb-48b0-8417-e1ee1b31c0c0
  - e2135d9f-c69d-47ee-9b17-0b05e98dc748
  - 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
  - 9413237f-2537-4bbf-8768-db6180970e36
  - c0392040-16a2-41e8-bd54-75110319e3c0
  - 86a691ec-ca1f-4350-824c-0ded1f8ebe70
  - b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
  - 40185d05-010e-45e7-8c2d-2f879bf14218
  - d3e7db72-2e07-4dae-8920-0e07c499a1e5
  - bb7f0835-c347-474f-bfad-eabd873b51ad
  - 6cb4943e-8267-4e27-8618-2ce0a464d173
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - 618198f4-cfad-4677-9df6-0640d8a97bae
references:
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
    score: 0.99
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 705
    col: 0
    score: 0.99
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 719
    col: 0
    score: 0.99
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 601
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 1060
    col: 0
    score: 0.99
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 726
    col: 0
    score: 0.99
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 996
    col: 0
    score: 0.99
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 667
    col: 0
    score: 0.99
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 736
    col: 0
    score: 0.99
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 645
    col: 0
    score: 0.99
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 739
    col: 0
    score: 0.99
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 816
    col: 0
    score: 0.99
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
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 177
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
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 149
    col: 0
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 285
    col: 0
    score: 1
  - uuid: ac60a1d6-fd9f-46dc-bbe7-176dd8017c59
    line: 11
    col: 0
    score: 1
  - uuid: 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
    line: 134
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 193
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 203
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 151
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 281
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 181
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 220
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 110
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 118
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 329
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 559
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 119
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 315
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 548
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 496
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 224
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 125
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 165
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
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 242
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 154
    col: 0
    score: 1
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 108
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 773
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 582
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 300
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 648
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 203
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
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 183
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
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 187
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 343
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 170
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 181
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 99
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 298
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 479
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1147
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 88
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 266
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 738
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
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 382
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 220
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
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 573
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 222
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
    line: 588
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 517
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
  - uuid: 9413237f-2537-4bbf-8768-db6180970e36
    line: 47
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
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 287
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
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 601
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1116
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
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 280
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
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 549
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
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 609
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 3129
    col: 0
    score: 0.88
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 1794
    col: 0
    score: 0.88
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2885
    col: 0
    score: 0.88
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 2562
    col: 0
    score: 0.88
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 1778
    col: 0
    score: 0.88
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2752
    col: 0
    score: 0.88
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 2400
    col: 0
    score: 0.88
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3745
    col: 0
    score: 0.88
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
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 610
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 257
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 1859
    col: 0
    score: 0.89
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 4197
    col: 0
    score: 0.89
  - uuid: 930054b3-ba95-4acf-bb92-0e3ead25ed0b
    line: 129
    col: 0
    score: 0.89
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2970
    col: 0
    score: 0.89
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 2318
    col: 0
    score: 0.89
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 2439
    col: 0
    score: 0.89
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2427
    col: 0
    score: 0.89
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
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 35
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 36
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 171
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1066
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 147
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 120
    col: 0
    score: 1
  - uuid: c0392040-16a2-41e8-bd54-75110319e3c0
    line: 28
    col: 0
    score: 1
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 27
    col: 0
    score: 1
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 112
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 781
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 30
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 41
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
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 43
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 132
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 115
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 499
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 265
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 207
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 242
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 390
    col: 0
    score: 1
  - uuid: 40185d05-010e-45e7-8c2d-2f879bf14218
    line: 40
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 461
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 185
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 171
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 299
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 238
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 383
    col: 0
    score: 1
  - uuid: 40185d05-010e-45e7-8c2d-2f879bf14218
    line: 43
    col: 0
    score: 1
  - uuid: 5f65dfa5-dc97-4a6c-ad93-c45c1312e156
    line: 41
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 266
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
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 391
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 53
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 187
    col: 0
    score: 1
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 69
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 171
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 63
    col: 0
    score: 1
  - uuid: 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
    line: 42
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 128
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 296
    col: 0
    score: 1
  - uuid: c0392040-16a2-41e8-bd54-75110319e3c0
    line: 43
    col: 0
    score: 1
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 42
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 261
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
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 343
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 572
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1107
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
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1054
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 84
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
  - uuid: 9413237f-2537-4bbf-8768-db6180970e36
    line: 40
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
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 808
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
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1046
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 218
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 119
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
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 104
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
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 285
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
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 530
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1101
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 174
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
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 613
    col: 0
    score: 0.91
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1357
    col: 0
    score: 0.91
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1108
    col: 0
    score: 0.91
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 676
    col: 0
    score: 0.91
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 516
    col: 0
    score: 0.91
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 830
    col: 0
    score: 0.91
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1234
    col: 0
    score: 0.91
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 642
    col: 0
    score: 0.91
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1290
    col: 0
    score: 0.91
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
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1517
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 417
    col: 0
    score: 0.99
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 476
    col: 0
    score: 0.99
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 454
    col: 0
    score: 0.99
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 493
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 534
    col: 0
    score: 0.99
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 592
    col: 0
    score: 0.99
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 437
    col: 0
    score: 0.99
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
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 536
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 595
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
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 823
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 396
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 432
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 184
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 116
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 594
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 210
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 118
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 240
    col: 0
    score: 0.98
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 613
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1223
    col: 0
    score: 0.98
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 358
    col: 0
    score: 0.97
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 926
    col: 0
    score: 0.97
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 797
    col: 0
    score: 0.96
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 921
    col: 0
    score: 0.98
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 923
    col: 0
    score: 0.96
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 724
    col: 0
    score: 0.98
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 911
    col: 0
    score: 0.97
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 689
    col: 0
    score: 0.97
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 135
    col: 0
    score: 0.97
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 255
    col: 0
    score: 0.97
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 3384
    col: 0
    score: 0.96
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 6635
    col: 0
    score: 0.96
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 5333
    col: 0
    score: 0.96
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 428
    col: 0
    score: 0.96
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2583
    col: 0
    score: 0.91
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 630
    col: 0
    score: 0.89
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 1011
    col: 0
    score: 0.89
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 874
    col: 0
    score: 0.89
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 576
    col: 0
    score: 0.89
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 914
    col: 0
    score: 0.89
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 648
    col: 0
    score: 0.89
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 342
    col: 0
    score: 0.89
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 770
    col: 0
    score: 0.89
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 697
    col: 0
    score: 0.89
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1218
    col: 0
    score: 0.97
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 862
    col: 0
    score: 0.97
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 324
    col: 0
    score: 0.96
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 342
    col: 0
    score: 0.96
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 428
    col: 0
    score: 0.96
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 498
    col: 0
    score: 0.96
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 903
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 650
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 168
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 621
    col: 0
    score: 0.97
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 566
    col: 0
    score: 0.97
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 634
    col: 0
    score: 0.97
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 653
    col: 0
    score: 0.97
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 675
    col: 0
    score: 0.97
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1002
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 848
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 701
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 856
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 664
    col: 0
    score: 0.97
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 826
    col: 0
    score: 0.97
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 237
    col: 0
    score: 0.97
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 472
    col: 0
    score: 0.97
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 912
    col: 0
    score: 0.97
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
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 250
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1139
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
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 794
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 565
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 991
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 390
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 762
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1057
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 350
    col: 0
    score: 0.99
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 499
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 969
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 529
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 262
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 278
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 464
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 397
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 305
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 319
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 552
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 325
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 271
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 630
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 315
    col: 0
    score: 0.99
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 842
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 880
    col: 0
    score: 0.99
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 527
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 476
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 532
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 336
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 882
    col: 0
    score: 0.99
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 340
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 324
    col: 0
    score: 0.99
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 589
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 985
    col: 0
    score: 0.99
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 686
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 225
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 165
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 332
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 463
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 310
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 464
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 301
    col: 0
    score: 0.98
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 226
    col: 0
    score: 0.97
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 263
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 766
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 700
    col: 0
    score: 0.98
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 648
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1010
    col: 0
    score: 0.98
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 604
    col: 0
    score: 0.98
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 437
    col: 0
    score: 0.98
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 389
    col: 0
    score: 0.98
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1352
    col: 0
    score: 0.98
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1103
    col: 0
    score: 0.98
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 671
    col: 0
    score: 0.98
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 511
    col: 0
    score: 0.98
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 825
    col: 0
    score: 0.98
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1229
    col: 0
    score: 0.98
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 637
    col: 0
    score: 0.98
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1285
    col: 0
    score: 0.98
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 716
    col: 0
    score: 0.98
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 282
    col: 0
    score: 1
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 378
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 341
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 478
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 236
    col: 0
    score: 0.95
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 553
    col: 0
    score: 0.95
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 1251
    col: 0
    score: 0.95
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 1202
    col: 0
    score: 0.95
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 995
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 6645
    col: 0
    score: 0.96
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 346
    col: 0
    score: 0.95
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 447
    col: 0
    score: 0.95
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 275
    col: 0
    score: 0.95
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 340
    col: 0
    score: 0.95
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 641
    col: 0
    score: 0.95
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1228
    col: 0
    score: 0.95
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 388
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1058
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 321
    col: 0
    score: 0.98
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 438
    col: 0
    score: 0.98
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 893
    col: 0
    score: 0.98
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 933
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 840
    col: 0
    score: 0.98
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 445
    col: 0
    score: 0.97
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 521
    col: 0
    score: 0.97
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 322
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 634
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 480
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 377
    col: 0
    score: 0.99
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 817
    col: 0
    score: 0.99
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 522
    col: 0
    score: 0.99
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 531
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1776
    col: 0
    score: 0.98
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 831
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1399
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 2164
    col: 0
    score: 0.98
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2059
    col: 0
    score: 0.98
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 1864
    col: 0
    score: 0.98
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 2899
    col: 0
    score: 0.98
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 1116
    col: 0
    score: 0.97
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 3174
    col: 0
    score: 0.97
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2182
    col: 0
    score: 0.97
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 318
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 291
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 221
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 559
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 326
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 242
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 121
    col: 0
    score: 1
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 336
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1220
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 461
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 334
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 442
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1259
    col: 0
    score: 1
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 414
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 784
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 252
    col: 0
    score: 0.96
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 398
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 344
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1214
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 286
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 316
    col: 0
    score: 1
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 263
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 335
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 339
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 344
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1442
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 557
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 177
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 393
    col: 0
    score: 1
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 322
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 541
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 472
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 4895
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1304
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 476
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 965
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1067
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1674
    col: 0
    score: 0.99
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 541
    col: 0
    score: 0.98
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 610
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 971
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1421
    col: 0
    score: 0.98
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 539
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 350
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 477
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 2168
    col: 0
    score: 0.98
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2064
    col: 0
    score: 0.98
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 250
    col: 0
    score: 0.98
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 183
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3772
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3809
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1186
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 643
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 392
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 328
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1224
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 455
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 445
    col: 0
    score: 1
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 388
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 975
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 470
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1441
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1181
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 273
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 971
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1117
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 522
    col: 0
    score: 0.98
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 428
    col: 0
    score: 0.96
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
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 385
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 735
    col: 0
    score: 0.96
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2184
    col: 0
    score: 0.97
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 3079
    col: 0
    score: 0.97
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 411
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 257
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 1845
    col: 0
    score: 0.97
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 677
    col: 0
    score: 0.96
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 389
    col: 0
    score: 0.96
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 452
    col: 0
    score: 0.96
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 932
    col: 0
    score: 0.95
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 349
    col: 0
    score: 0.95
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 368
    col: 0
    score: 0.95
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 378
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 299
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 349
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
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 559
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 431
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 573
    col: 0
    score: 0.97
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
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 743
    col: 0
    score: 0.96
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 1731
    col: 0
    score: 0.96
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 3358
    col: 0
    score: 0.96
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
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 429
    col: 0
    score: 1
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
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 370
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 534
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 433
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 519
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2265
    col: 0
    score: 0.97
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 1913
    col: 0
    score: 0.97
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 3510
    col: 0
    score: 0.97
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 3557
    col: 0
    score: 0.96
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 292
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 359
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 380
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
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 283
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 353
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 667
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 600
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 280
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 301
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
    score: 0.99
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 531
    col: 0
    score: 0.98
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 601
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 302
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 281
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 776
    col: 0
    score: 0.98
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 425
    col: 0
    score: 0.98
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
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 406
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 422
    col: 0
    score: 1
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 86
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 361
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 205
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 507
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 252
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 3384
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 523
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 490
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 105
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 119
    col: 0
    score: 1
  - uuid: 930054b3-ba95-4acf-bb92-0e3ead25ed0b
    line: 87
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 270
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 246
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 407
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 524
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 491
    col: 0
    score: 1
  - uuid: 930054b3-ba95-4acf-bb92-0e3ead25ed0b
    line: 88
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 271
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 247
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 408
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 509
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 585
    col: 0
    score: 1
  - uuid: 930054b3-ba95-4acf-bb92-0e3ead25ed0b
    line: 89
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 272
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 248
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 409
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 510
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 525
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 586
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 172
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 638
    col: 0
    score: 0.99
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 880
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1055
    col: 0
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1168
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 5999
    col: 0
    score: 0.96
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 6007
    col: 0
    score: 0.96
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 6048
    col: 0
    score: 0.96
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 6015
    col: 0
    score: 0.96
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 371
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 639
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 881
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1056
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1169
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 818
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 132
    col: 0
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1655
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 640
    col: 0
    score: 0.99
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 882
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1057
    col: 0
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1170
    col: 0
    score: 0.99
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 289
    col: 0
    score: 0.99
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 112
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 633
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 346
    col: 0
    score: 0.99
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 883
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 641
    col: 0
    score: 0.99
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 883
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1058
    col: 0
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1171
    col: 0
    score: 0.99
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 564
    col: 0
    score: 0.98
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 508
    col: 0
    score: 0.98
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 779
    col: 0
    score: 0.98
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 347
    col: 0
    score: 0.97
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1012
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 337
    col: 0
    score: 0.97
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 202
    col: 0
    score: 0.93
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 201
    col: 0
    score: 0.97
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 273
    col: 0
    score: 0.97
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 436
    col: 0
    score: 0.97
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 436
    col: 0
    score: 0.97
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 390
    col: 0
    score: 0.93
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 398
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 239
    col: 0
    score: 0.97
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 569
    col: 0
    score: 0.97
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 477
    col: 0
    score: 0.97
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1475
    col: 0
    score: 0.97
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 446
    col: 0
    score: 0.97
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 543
    col: 0
    score: 0.97
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 401
    col: 0
    score: 0.97
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 397
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 602
    col: 0
    score: 0.97
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 303
    col: 0
    score: 0.97
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 282
    col: 0
    score: 0.97
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 152
    col: 0
    score: 0.96
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 426
    col: 0
    score: 0.96
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 249
    col: 0
    score: 0.96
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 795
    col: 0
    score: 0.96
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 297
    col: 0
    score: 0.96
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 790
    col: 0
    score: 0.95
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1712
    col: 0
    score: 0.95
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 979
    col: 0
    score: 0.95
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 244
    col: 0
    score: 0.95
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 296
    col: 0
    score: 0.95
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 313
    col: 0
    score: 0.95
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1168
    col: 0
    score: 0.95
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 506
    col: 0
    score: 0.95
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 396
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 628
    col: 0
    score: 0.97
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 140
    col: 0
    score: 0.97
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 530
    col: 0
    score: 0.96
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 560
    col: 0
    score: 0.96
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 136
    col: 0
    score: 0.96
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 342
    col: 0
    score: 0.96
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 134
    col: 0
    score: 0.96
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 380
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 537
    col: 0
    score: 1
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 87
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 589
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 587
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 141
    col: 0
    score: 0.93
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1214
    col: 0
    score: 0.93
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 476
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1579
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 291
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 268
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 423
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1940
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 403
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 269
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1580
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 292
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 269
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 424
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1941
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 404
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 270
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 458
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 477
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 293
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 270
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 425
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1942
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 405
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 271
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 208
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 478
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1581
    col: 0
    score: 0.98
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 294
    col: 0
    score: 0.98
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 271
    col: 0
    score: 0.98
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 426
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1943
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 406
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 272
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 479
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1582
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 295
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 272
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 427
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1944
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 407
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 273
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 480
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1583
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 273
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 428
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1945
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 408
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 274
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 211
    col: 0
    score: 0.99
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 481
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1584
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 296
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 429
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1946
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 409
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 275
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 4729
    col: 0
    score: 0.98
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 482
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1585
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 297
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 274
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1947
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 410
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 276
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 988
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 408
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1658
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 234
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 226
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1877
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 543
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 427
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 568
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 410
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1661
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 237
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 229
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1880
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 546
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 430
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 571
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 411
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 238
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 230
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1881
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 547
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 431
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 572
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 393
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 412
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1662
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 239
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 231
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1882
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 548
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 432
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 573
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 812
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 571
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1123
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 1157
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 586
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 543
    col: 0
    score: 0.97
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 4318
    col: 0
    score: 0.87
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 4326
    col: 0
    score: 0.85
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 4334
    col: 0
    score: 0.85
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 414
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1664
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 241
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 233
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1884
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 550
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 434
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 575
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 273
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 391
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 338
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 520
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 1185
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 221
    col: 0
    score: 0.99
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 316
    col: 0
    score: 0.99
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 319
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 392
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 339
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 521
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 2096
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 517
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 412
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 652
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 193
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 274
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 393
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 340
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 522
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 2097
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 518
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 413
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 653
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 394
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 341
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 523
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 2098
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 519
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 414
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 654
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 195
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 276
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 395
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 342
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 524
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 2099
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 520
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 415
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 655
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 278
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 344
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 526
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 2101
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 522
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 417
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 657
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 198
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 279
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 397
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 527
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 2102
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 523
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 418
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 658
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 199
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 503
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 524
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 227
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 525
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 280
    col: 0
    score: 0.98
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 398
    col: 0
    score: 0.98
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 345
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1343
    col: 0
    score: 0.98
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 262
    col: 0
    score: 0.98
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 261
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1915
    col: 0
    score: 0.98
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 505
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 230
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 4431
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2023
    col: 0
    score: 0.98
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 4394
    col: 0
    score: 0.96
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 564
    col: 0
    score: 0.96
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2003
    col: 0
    score: 0.97
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 590
    col: 0
    score: 0.94
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 526
    col: 0
    score: 0.94
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 1089
    col: 0
    score: 0.94
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 1063
    col: 0
    score: 0.94
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 893
    col: 0
    score: 0.94
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 544
    col: 0
    score: 0.94
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 766
    col: 0
    score: 0.94
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 507
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 528
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 231
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 442
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 769
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 246
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 208
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 397
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 508
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 529
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 232
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 443
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 614
    col: 0
    score: 0.99
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 209
    col: 0
    score: 0.99
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 398
    col: 0
    score: 0.99
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 456
    col: 0
    score: 0.99
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 329
    col: 0
    score: 0.99
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 509
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 530
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 233
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 444
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 615
    col: 0
    score: 0.99
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 399
    col: 0
    score: 0.99
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 457
    col: 0
    score: 0.99
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 330
    col: 0
    score: 0.99
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 510
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 531
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 234
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 445
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 616
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 248
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 210
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 400
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 154
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 864
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 584
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 704
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1036
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 529
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 199
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1240
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 328
    col: 0
    score: 1
  - uuid: f1add613-656e-4bec-b52b-193fd78c4642
    line: 85
    col: 0
    score: 1
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 207
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 261
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 435
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 103
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 326
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1415
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 618
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 907
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 885
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 842
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 537
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1038
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 531
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 201
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1242
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 330
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 900
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 1250
    col: 0
    score: 1
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 96
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 511
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 874
    col: 0
    score: 1
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 209
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 263
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 105
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 328
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1417
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 620
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 919
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 887
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 942
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 557
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 661
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 875
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 451
    col: 0
    score: 1
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 394
    col: 0
    score: 1
  - uuid: f1add613-656e-4bec-b52b-193fd78c4642
    line: 88
    col: 0
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 361
    col: 0
    score: 1
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 210
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 264
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 438
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 329
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1418
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 621
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 910
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 907
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 709
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1041
    col: 0
    score: 0.96
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 534
    col: 0
    score: 0.96
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 204
    col: 0
    score: 0.96
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1245
    col: 0
    score: 0.96
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 333
    col: 0
    score: 0.96
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 903
    col: 0
    score: 0.96
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 1253
    col: 0
    score: 0.96
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 132
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 877
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 870
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 590
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 710
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1042
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 535
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 205
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1246
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 334
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1043
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 536
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 206
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1247
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 335
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 905
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 1255
    col: 0
    score: 1
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 101
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 516
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 164
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 353
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 519
    col: 0
    score: 1
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 145
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 910
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 1080
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1909
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 566
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 518
    col: 0
    score: 1
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 142
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1044
    col: 0
    score: 1
  - uuid: 86a691ec-ca1f-4350-824c-0ded1f8ebe70
    line: 293
    col: 0
    score: 0.99
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 444
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 112
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 335
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1627
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 627
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 546
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 564
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 668
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1589
    col: 0
    score: 1
  - uuid: 40185d05-010e-45e7-8c2d-2f879bf14218
    line: 106
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 356
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 336
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1628
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 895
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 852
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 547
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 565
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 669
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 302
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 548
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 566
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 670
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1591
    col: 0
    score: 1
  - uuid: 40185d05-010e-45e7-8c2d-2f879bf14218
    line: 108
    col: 0
    score: 1
  - uuid: 5f65dfa5-dc97-4a6c-ad93-c45c1312e156
    line: 108
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 169
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 435
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 402
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 503
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 740
    col: 0
    score: 1
  - uuid: c0392040-16a2-41e8-bd54-75110319e3c0
    line: 90
    col: 0
    score: 1
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 147
    col: 0
    score: 1
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 310
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1581
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 167
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 139
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 183
    col: 0
    score: 1
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 311
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 168
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 140
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 184
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1065
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 597
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 717
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1251
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 542
    col: 0
    score: 1
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 152
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 2079
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 420
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 200
    col: 0
    score: 1
  - uuid: 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
    line: 91
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 505
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 742
    col: 0
    score: 1
  - uuid: c0392040-16a2-41e8-bd54-75110319e3c0
    line: 92
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 2080
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 421
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 201
    col: 0
    score: 1
  - uuid: 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
    line: 92
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 506
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 743
    col: 0
    score: 1
  - uuid: c0392040-16a2-41e8-bd54-75110319e3c0
    line: 93
    col: 0
    score: 1
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 150
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 171
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 143
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 187
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1068
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 599
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 719
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1253
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 544
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 214
    col: 0
    score: 1
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 153
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 145
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 189
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1070
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 601
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 721
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1255
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 546
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 216
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 632
    col: 0
    score: 1
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 156
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 2083
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 602
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 722
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1256
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 547
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 217
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 365
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 346
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 574
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 678
    col: 0
    score: 1
  - uuid: 40185d05-010e-45e7-8c2d-2f879bf14218
    line: 116
    col: 0
    score: 1
  - uuid: 5f65dfa5-dc97-4a6c-ad93-c45c1312e156
    line: 116
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 177
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 633
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 435
    col: 0
    score: 1
  - uuid: 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
    line: 97
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 748
    col: 0
    score: 1
  - uuid: c0392040-16a2-41e8-bd54-75110319e3c0
    line: 98
    col: 0
    score: 1
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 318
    col: 0
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 293
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 478
    col: 0
    score: 1
  - uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
    line: 315
    col: 0
    score: 1
  - uuid: ac60a1d6-fd9f-46dc-bbe7-176dd8017c59
    line: 27
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 176
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 455
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 123
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 366
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 632
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 829
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1638
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 906
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 830
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 558
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 576
    col: 0
    score: 1
  - uuid: 40185d05-010e-45e7-8c2d-2f879bf14218
    line: 118
    col: 0
    score: 1
  - uuid: 5f65dfa5-dc97-4a6c-ad93-c45c1312e156
    line: 118
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 485
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 179
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 412
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 141
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 635
    col: 0
    score: 1
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 159
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 634
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 907
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 831
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 559
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 577
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 681
    col: 0
    score: 1
  - uuid: 40185d05-010e-45e7-8c2d-2f879bf14218
    line: 119
    col: 0
    score: 1
  - uuid: 5f65dfa5-dc97-4a6c-ad93-c45c1312e156
    line: 119
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 486
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1334
    col: 0
    score: 0.87
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1345
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 1317
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 1010
    col: 0
    score: 0.87
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 1222
    col: 0
    score: 0.87
  - uuid: ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
    line: 169
    col: 0
    score: 0.87
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 1214
    col: 0
    score: 0.87
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 1053
    col: 0
    score: 0.87
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 509
    col: 0
    score: 0.87
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 246
    col: 0
    score: 0.87
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1591
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 178
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 150
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 194
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1075
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 607
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 727
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1261
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 552
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 460
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 834
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 562
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 580
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 684
    col: 0
    score: 1
  - uuid: 40185d05-010e-45e7-8c2d-2f879bf14218
    line: 122
    col: 0
    score: 1
  - uuid: 5f65dfa5-dc97-4a6c-ad93-c45c1312e156
    line: 122
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 489
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 183
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 449
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 416
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 181
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 153
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 197
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1078
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 610
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 730
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1264
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 555
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 225
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 288
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 154
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 198
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1079
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 611
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 731
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1265
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 556
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 226
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 464
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 493
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 187
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 453
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 420
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 149
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 643
    col: 0
    score: 1
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 167
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 756
    col: 0
    score: 1
  - uuid: c0392040-16a2-41e8-bd54-75110319e3c0
    line: 106
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 2112
    col: 0
    score: 1
  - uuid: 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
    line: 106
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 757
    col: 0
    score: 1
  - uuid: c0392040-16a2-41e8-bd54-75110319e3c0
    line: 107
    col: 0
    score: 1
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 327
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 184
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 156
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 200
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1081
    col: 0
    score: 1
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 164
    col: 0
    score: 1
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 328
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1599
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 185
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 157
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 201
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1082
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 613
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 734
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 252
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 527
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 574
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 551
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 419
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 551
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 148
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 1771
    col: 0
    score: 0.96
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 151
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 528
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 575
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 552
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 420
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 552
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 149
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 3424
    col: 0
    score: 0.95
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 3432
    col: 0
    score: 0.94
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 152
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 253
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 529
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 576
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 553
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 421
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 553
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 150
    col: 0
    score: 0.99
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 204
    col: 0
    score: 0.98
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 154
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 255
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 578
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 555
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 423
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 555
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 1598
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 981
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 155
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 256
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 531
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 579
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 556
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 424
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 556
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 153
    col: 0
    score: 0.99
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 163
    col: 0
    score: 0.97
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 156
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 257
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 532
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 580
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 557
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 425
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 835
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 154
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 186
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 258
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 533
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 581
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 558
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 426
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 836
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 421
    col: 0
    score: 0.98
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 644
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 691
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1611
    col: 0
    score: 1
  - uuid: 40185d05-010e-45e7-8c2d-2f879bf14218
    line: 129
    col: 0
    score: 1
  - uuid: 5f65dfa5-dc97-4a6c-ad93-c45c1312e156
    line: 129
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 496
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 190
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 456
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 423
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 152
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 646
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 233
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 328
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 519
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 137
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 419
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1554
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 646
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 921
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 911
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 629
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 643
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1613
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 234
    col: 0
    score: 1
  - uuid: f1add613-656e-4bec-b52b-193fd78c4642
    line: 119
    col: 0
    score: 1
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 266
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 329
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 520
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 138
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 420
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1555
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 647
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 922
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 571
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 1162
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 163
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 207
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1088
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 638
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 787
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1274
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 565
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 234
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 363
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 423
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1558
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 650
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 925
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 915
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 633
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 647
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 697
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1617
    col: 0
    score: 1
  - uuid: 40185d05-010e-45e7-8c2d-2f879bf14218
    line: 135
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 165
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 209
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1090
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 640
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 789
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1276
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 567
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 236
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 365
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 166
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 210
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1091
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 641
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 790
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1277
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 568
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 237
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 366
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 161
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 655
    col: 0
    score: 1
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 179
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 2116
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 454
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 587
    col: 0
    score: 1
  - uuid: c0392040-16a2-41e8-bd54-75110319e3c0
    line: 118
    col: 0
    score: 1
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 383
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1611
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 211
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1092
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 642
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 335
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 637
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 651
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 701
    col: 0
    score: 1
  - uuid: 40185d05-010e-45e7-8c2d-2f879bf14218
    line: 139
    col: 0
    score: 1
  - uuid: 5f65dfa5-dc97-4a6c-ad93-c45c1312e156
    line: 139
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 506
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 200
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 466
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 433
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 162
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 590
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1281
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 579
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 1170
    col: 0
    score: 1
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 177
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 198
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 591
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1096
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 646
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 795
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1282
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 573
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 242
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 371
    col: 0
    score: 1
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 138
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 580
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 592
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 647
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 796
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1283
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 574
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 243
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 372
    col: 0
    score: 1
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 139
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 581
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 706
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1625
    col: 0
    score: 1
  - uuid: 40185d05-010e-45e7-8c2d-2f879bf14218
    line: 143
    col: 0
    score: 1
  - uuid: 5f65dfa5-dc97-4a6c-ad93-c45c1312e156
    line: 143
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 510
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 204
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 471
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 438
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 167
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 661
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 460
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 649
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 798
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1285
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 576
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 245
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 374
    col: 0
    score: 1
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 141
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 583
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 650
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 799
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1286
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 577
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 246
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 375
    col: 0
    score: 1
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 142
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 584
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 174
    col: 0
    score: 0.96
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 146
    col: 0
    score: 0.96
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 190
    col: 0
    score: 0.96
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1071
    col: 0
    score: 0.96
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 603
    col: 0
    score: 0.96
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 723
    col: 0
    score: 0.96
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1257
    col: 0
    score: 0.96
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 548
    col: 0
    score: 0.96
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 218
    col: 0
    score: 0.96
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 282
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 492
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 601
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 485
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 811
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 183
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 501
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 490
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 364
    col: 0
    score: 0.99
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 284
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 197
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 494
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 734
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 279
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 814
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 185
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 827
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 285
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 199
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 495
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 604
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 736
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 486
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 816
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 186
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 286
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 200
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 496
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 605
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 737
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 487
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 817
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 187
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 287
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 201
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 497
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 606
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 738
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 488
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 818
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 188
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 288
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 202
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 498
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 607
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 739
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 280
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 819
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 189
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 508
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 4163
    col: 0
    score: 0.97
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 3992
    col: 0
    score: 0.97
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 5246
    col: 0
    score: 0.97
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 3999
    col: 0
    score: 0.97
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 4015
    col: 0
    score: 0.96
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 5269
    col: 0
    score: 0.96
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 4054
    col: 0
    score: 0.96
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 5308
    col: 0
    score: 0.96
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 3983
    col: 0
    score: 0.94
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 509
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 515
    col: 0
    score: 0.86
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 503
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 891
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 674
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 713
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1071
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 446
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 675
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1533
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 466
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 605
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 409
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1588
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 892
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 677
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 903
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 698
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 588
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1559
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 485
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 675
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 714
    col: 0
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 441
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 235
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1589
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 893
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 860
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 840
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 678
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 749
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 596
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 904
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 699
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 589
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 894
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 716
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1074
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 449
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 678
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 473
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1536
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 469
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 895
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 729
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 717
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1075
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 450
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 679
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 474
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1537
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 470
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 608
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 414
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1593
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 897
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 864
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 844
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 682
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 753
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 600
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 908
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 703
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 898
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 681
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 720
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1078
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 453
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 682
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 477
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1540
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 473
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 899
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 733
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 682
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 721
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1079
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 454
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 683
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 478
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1541
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 474
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 399
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1442
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 873
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 404
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 925
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 762
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 646
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 629
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 519
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 955
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1443
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 500
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1025
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 756
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 660
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 756
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 651
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 567
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1085
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 501
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1026
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 757
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 661
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 757
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 652
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 568
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1086
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 603
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 780
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1216
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 660
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 311
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 297
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 363
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 531
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 751
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 1120
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 667
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1982
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 503
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1028
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 759
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 663
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 759
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 654
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 570
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1088
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 633
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 887
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 605
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 581
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 664
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 782
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1218
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 662
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 313
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 299
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 365
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 533
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 753
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 635
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 525
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 961
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 983
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 562
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 888
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 606
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 582
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 665
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 677
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 413
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 338
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 415
    col: 0
    score: 1
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 370
    col: 0
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 272
    col: 0
    score: 1
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 358
    col: 0
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 287
    col: 0
    score: 1
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 212
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 307
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 407
    col: 0
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 138
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 470
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1684
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 492
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 241
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 560
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 503
    col: 0
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 320
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 538
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 2001
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 754
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 509
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 773
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 494
    col: 0
    score: 0.99
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 282
    col: 0
    score: 0.99
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 489
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 354
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 320
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 329
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 318
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 304
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 539
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 2002
    col: 0
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 322
    col: 0
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 141
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1686
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 243
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 856
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 506
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 490
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 355
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 321
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 743
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 319
    col: 0
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 323
    col: 0
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 142
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 764
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 244
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 857
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 491
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 356
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 331
    col: 0
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 324
    col: 0
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 143
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 473
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 765
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 245
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 858
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 507
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 492
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 357
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 332
    col: 0
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 325
    col: 0
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 144
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 474
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1688
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 246
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 859
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 508
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 493
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 358
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 333
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1689
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 766
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 860
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 509
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 494
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 359
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 334
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 334
    col: 0
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 327
    col: 0
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 146
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 476
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1690
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 247
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 861
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 510
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 495
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 360
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 335
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 665
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 568
    col: 0
    score: 1
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 364
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1500
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 456
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 873
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 489
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1120
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 842
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 810
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 666
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 569
    col: 0
    score: 1
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 365
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1501
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 457
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 874
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 490
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1121
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 864
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 667
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 570
    col: 0
    score: 1
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 366
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1502
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 458
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 875
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 491
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1122
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 885
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 341
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 805
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 793
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 581
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 585
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 458
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 903
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 463
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 794
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 778
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 550
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 540
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1391
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 347
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 669
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 867
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 1131
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1209
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 572
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 583
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 1132
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1210
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 573
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 671
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 574
    col: 0
    score: 1
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 370
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1506
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 462
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 672
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 575
    col: 0
    score: 1
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 371
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1507
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 463
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 880
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 496
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1127
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 673
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 576
    col: 0
    score: 1
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 372
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1508
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 464
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 881
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 497
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1128
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 850
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 818
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 577
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1129
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 1163
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 592
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1406
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 234
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 399
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1885
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 569
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 517
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1121
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 764
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 982
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1407
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 235
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 400
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1886
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 570
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 518
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1122
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1408
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 236
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 401
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1887
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 571
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 519
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1123
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 766
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 504
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 1067
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 780
    col: 0
    score: 0.99
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 124
    col: 0
    score: 0.99
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 270
    col: 0
    score: 0.99
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 844
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 583
    col: 0
    score: 0.99
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 395
    col: 0
    score: 0.99
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 985
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1409
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 238
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 403
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1889
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 573
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 521
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1125
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 986
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1410
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 239
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 404
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1890
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 574
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 522
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1126
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 987
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1411
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 405
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1891
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 575
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 523
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1127
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 770
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1412
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 240
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1892
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 576
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 524
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1128
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 771
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1650
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 164
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 236
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1893
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 577
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 525
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 781
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 560
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 990
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1651
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 165
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 237
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1894
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 578
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 526
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 782
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1652
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 166
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 238
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1895
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 579
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 527
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 783
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 562
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 992
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 167
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 239
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1896
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 580
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 528
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 784
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 563
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 993
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1653
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 168
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 240
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1897
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 581
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 529
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 785
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 994
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1654
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 169
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 241
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1898
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 582
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 530
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 786
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 995
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1655
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 242
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1899
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 583
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 531
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 787
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 566
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 996
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1656
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 170
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1900
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 584
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 532
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 788
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 567
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
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 772
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
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 104
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
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 135
    col: 0
    score: 0.99
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 73
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 233
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 511
    col: 0
    score: 0.99
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 856
    col: 0
    score: 0.98
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 744
    col: 0
    score: 0.98
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 994
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 1142
    col: 0
    score: 0.98
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 75
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 513
    col: 0
    score: 0.99
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 569
    col: 0
    score: 0.98
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 1759
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 1093
    col: 0
    score: 0.98
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 1093
    col: 0
    score: 0.98
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 876
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 1104
    col: 0
    score: 0.98
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1654
    col: 0
    score: 1
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 291
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 229
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 732
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 422
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 656
    col: 0
    score: 0.99
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 447
    col: 0
    score: 0.99
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 547
    col: 0
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1658
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 602
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1253
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 902
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1154
    col: 0
    score: 0.99
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 404
    col: 0
    score: 0.99
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 603
    col: 0
    score: 0.99
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 817
    col: 0
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1659
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 2561
    col: 0
    score: 0.95
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 2601
    col: 0
    score: 0.95
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 7873
    col: 0
    score: 0.94
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 2577
    col: 0
    score: 0.94
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 529
    col: 0
    score: 0.94
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 7883
    col: 0
    score: 0.94
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 474
    col: 0
    score: 0.94
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 733
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 837
    col: 0
    score: 0.99
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 320
    col: 0
    score: 0.99
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 373
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1300
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 604
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1255
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 904
    col: 0
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1661
    col: 0
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 734
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 838
    col: 0
    score: 0.99
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 321
    col: 0
    score: 0.99
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 374
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1301
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 605
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1256
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
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 418
    col: 0
    score: 1
  - uuid: ac9d3ac5-9a6a-4180-a67f-1ab7e229d981
    line: 479
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
    line: 482
    col: 0
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 7
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
---
If my limit is 30 commands I am gonna need to: ^ref-98c8ff62-1-0
A. Consolodate existing actions into others with additional parameters
B. Limit the number of actions 
C. Split the actions up into multiple services


We can do A and B right now through descriptions to the agents. ^ref-98c8ff62-7-0
C will require us to find multiple domains to put different parts of the system behind.
That is not automatable, and it means *even more services*
Complexity is already very high.

I am confident we can get our current endpoints down below 30. We only start splitting up the actions into multiple services/domains when it becomes impossible or unreasonable to consolidate them. ^ref-98c8ff62-12-0

I think we can get better codex context thinking about it if all searches have a ttl on them... ^ref-98c8ff62-14-0
It's gotta be more complicated than that though...
you need a special agent who's job it is to ...

knowledge graph... ^ref-98c8ff62-18-0


markdown parser... ^ref-98c8ff62-21-0

markdown AST ^ref-98c8ff62-23-0


markdown dom... ^ref-98c8ff62-26-0
markdown is designed to compile to html...
html has the dom... the dom allows a system to be mutated and changed...
Document Object Model.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [typed-struct-compiler](typed-struct-compiler.md)
- [Unique Concepts](unique-concepts.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [Creative Moments](creative-moments.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [Ice Box Reorganization](ice-box-reorganization.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [Tracing the Signal](tracing-the-signal.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [The Jar of Echoes](the-jar-of-echoes.md)
- [Promethean Dev Workflow Update](promethean-dev-workflow-update.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [Reawakening Duck](reawakening-duck.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [Redirecting Standard Error](redirecting-standard-error.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [promethean-requirements](promethean-requirements.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [Promethean State Format](promethean-state-format.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [unique-templates](templates/unique-templates.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [field-interaction-equations](field-interaction-equations.md)
- [Synchronicity Waves and Web](synchronicity-waves-and-web.md)
- [NPU Voice Code and Sensory Integration](npu-voice-code-and-sensory-integration.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [Smoke Resonance Visualizations](smoke-resonance-visualizations.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [Obsidian Task Generation](obsidian-task-generation.md)
- [OpenAPI Validation Report](openapi-validation-report.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
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
- [Docops Feature Updates](docops-feature-updates.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [graph-ds](graph-ds.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [Promethean Chat Activity Report](promethean-chat-activity-report.md)
- [windows-tiling-with-autohotkey](windows-tiling-with-autohotkey.md)
- [Promethean Notes](promethean-notes.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [MindfulRobotIntegration](mindfulrobotintegration.md)
- [Docops Feature Updates](docops-feature-updates-3.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [Window Management](chunks/window-management.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Promethean Documentation Update](promethean-documentation-update.txt)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Pipeline Enhancements](pipeline-enhancements.md)
- [Promethean Data Sync Protocol](promethean-data-sync-protocol.md)
- [Promethean Documentation Overview](promethean-documentation-overview.md)
- [Promethean Documentation Update](promethean-documentation-update.md)
- [Mathematical Samplers](mathematical-samplers.md)
- [Mathematics Sampler](mathematics-sampler.md)
- [Mindful Prioritization](mindful-prioritization.md)
- [balanced-bst](balanced-bst.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Tooling](chunks/tooling.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
## Sources
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
- [Docops Feature Updates — L226](docops-feature-updates.md#^ref-2792d448-226-0) (line 226, col 0, score 0.99)
- [field-node-diagram-outline — L705](field-node-diagram-outline.md#^ref-1f32c94a-705-0) (line 705, col 0, score 0.99)
- [field-node-diagram-set — L719](field-node-diagram-set.md#^ref-22b989d5-719-0) (line 719, col 0, score 0.99)
- [field-node-diagram-visualizations — L601](field-node-diagram-visualizations.md#^ref-e9b27b06-601-0) (line 601, col 0, score 1)
- [Fnord Tracer Protocol — L1060](fnord-tracer-protocol.md#^ref-fc21f824-1060-0) (line 1060, col 0, score 0.99)
- [Functional Embedding Pipeline Refactor — L726](functional-embedding-pipeline-refactor.md#^ref-a4a25141-726-0) (line 726, col 0, score 0.99)
- [graph-ds — L996](graph-ds.md#^ref-6620e2f2-996-0) (line 996, col 0, score 0.99)
- [heartbeat-fragment-demo — L667](heartbeat-fragment-demo.md#^ref-dd00677a-667-0) (line 667, col 0, score 0.99)
- [i3-bluetooth-setup — L736](i3-bluetooth-setup.md#^ref-5e408692-736-0) (line 736, col 0, score 0.99)
- [Ice Box Reorganization — L645](ice-box-reorganization.md#^ref-291c7d91-645-0) (line 645, col 0, score 0.99)
- [komorebi-group-window-hack — L739](komorebi-group-window-hack.md#^ref-dd89372d-739-0) (line 739, col 0, score 0.99)
- [Layer1SurvivabilityEnvelope — L816](layer1survivabilityenvelope.md#^ref-64a9f9f9-816-0) (line 816, col 0, score 0.99)
- [Promethean Pipelines — L170](promethean-pipelines.md#^ref-8b8e6103-170-0) (line 170, col 0, score 1)
- [Promethean Workflow Optimization — L88](promethean-workflow-optimization.md#^ref-d614d983-88-0) (line 88, col 0, score 1)
- [Prometheus Observability Stack — L609](prometheus-observability-stack.md#^ref-e90b5a16-609-0) (line 609, col 0, score 1)
- [Prompt_Folder_Bootstrap — L313](prompt-folder-bootstrap.md#^ref-bd4f0976-313-0) (line 313, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L226](protocol-0-the-contradiction-engine.md#^ref-9a93a756-226-0) (line 226, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L369](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-369-0) (line 369, col 0, score 1)
- [Pure TypeScript Search Microservice — L689](pure-typescript-search-microservice.md#^ref-d17d3a96-689-0) (line 689, col 0, score 1)
- [Reawakening Duck — L253](reawakening-duck.md#^ref-59b5670f-253-0) (line 253, col 0, score 1)
- [Self-Agency in AI Interaction — L127](self-agency-in-ai-interaction.md#^ref-49a9a860-127-0) (line 127, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L552](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-552-0) (line 552, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L245](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-245-0) (line 245, col 0, score 1)
- [Prompt_Folder_Bootstrap — L242](prompt-folder-bootstrap.md#^ref-bd4f0976-242-0) (line 242, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L285](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-285-0) (line 285, col 0, score 1)
- [Pure TypeScript Search Microservice — L659](pure-typescript-search-microservice.md#^ref-d17d3a96-659-0) (line 659, col 0, score 1)
- [Reawakening Duck — L169](reawakening-duck.md#^ref-59b5670f-169-0) (line 169, col 0, score 1)
- [Redirecting Standard Error — L58](redirecting-standard-error.md#^ref-b3555ede-58-0) (line 58, col 0, score 1)
- [ripple-propagation-demo — L155](ripple-propagation-demo.md#^ref-8430617b-155-0) (line 155, col 0, score 1)
- [schema-evolution-workflow — L621](schema-evolution-workflow.md#^ref-d8059b6a-621-0) (line 621, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L521](performance-optimized-polyglot-bridge.md#^ref-f5579967-521-0) (line 521, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L289](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-289-0) (line 289, col 0, score 1)
- [Promethean Infrastructure Setup — L786](promethean-infrastructure-setup.md#^ref-6deed6ac-786-0) (line 786, col 0, score 1)
- [Promethean Notes — L78](promethean-notes.md#^ref-1c4046b5-78-0) (line 78, col 0, score 1)
- [Promethean Pipelines — L177](promethean-pipelines.md#^ref-8b8e6103-177-0) (line 177, col 0, score 1)
- [promethean-requirements — L96](promethean-requirements.md#^ref-95205cd3-96-0) (line 96, col 0, score 1)
- [Prometheus Observability Stack — L615](prometheus-observability-stack.md#^ref-e90b5a16-615-0) (line 615, col 0, score 1)
- [Prompt_Folder_Bootstrap — L285](prompt-folder-bootstrap.md#^ref-bd4f0976-285-0) (line 285, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L366](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-366-0) (line 366, col 0, score 1)
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
- [Tooling — L41](chunks/tooling.md#^ref-6cb4943e-41-0) (line 41, col 0, score 1)
- [Docops Feature Updates — L48](docops-feature-updates-3.md#^ref-cdbd21ee-48-0) (line 48, col 0, score 1)
- [Docops Feature Updates — L79](docops-feature-updates.md#^ref-2792d448-79-0) (line 79, col 0, score 1)
- [eidolon-node-lifecycle — L69](eidolon-node-lifecycle.md#^ref-938eca9c-69-0) (line 69, col 0, score 1)
- [field-node-diagram-outline — L158](field-node-diagram-outline.md#^ref-1f32c94a-158-0) (line 158, col 0, score 1)
- [field-node-diagram-set — L178](field-node-diagram-set.md#^ref-22b989d5-178-0) (line 178, col 0, score 1)
- [field-node-diagram-visualizations — L126](field-node-diagram-visualizations.md#^ref-e9b27b06-126-0) (line 126, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L410](functional-embedding-pipeline-refactor.md#^ref-a4a25141-410-0) (line 410, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L228](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-228-0) (line 228, col 0, score 1)
- [aionian-circuit-math — L149](aionian-circuit-math.md#^ref-f2d83a77-149-0) (line 149, col 0, score 1)
- [api-gateway-versioning — L285](api-gateway-versioning.md#^ref-0580dcd3-285-0) (line 285, col 0, score 1)
- [Board Automation Improvements — L11](board-automation-improvements.md#^ref-ac60a1d6-11-0) (line 11, col 0, score 1)
- [Board Walk – 2025-08-11 — L134](board-walk-2025-08-11.md#^ref-7aa1eb92-134-0) (line 134, col 0, score 1)
- [field-dynamics-math-blocks — L193](field-dynamics-math-blocks.md#^ref-7cfc230d-193-0) (line 193, col 0, score 1)
- [field-node-diagram-set — L203](field-node-diagram-set.md#^ref-22b989d5-203-0) (line 203, col 0, score 1)
- [field-node-diagram-visualizations — L151](field-node-diagram-visualizations.md#^ref-e9b27b06-151-0) (line 151, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L281](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-281-0) (line 281, col 0, score 1)
- [heartbeat-fragment-demo — L181](heartbeat-fragment-demo.md#^ref-dd00677a-181-0) (line 181, col 0, score 1)
- [homeostasis-decay-formulas — L220](homeostasis-decay-formulas.md#^ref-37b5d236-220-0) (line 220, col 0, score 1)
- [Ice Box Reorganization — L110](ice-box-reorganization.md#^ref-291c7d91-110-0) (line 110, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L118](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-118-0) (line 118, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L329](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-329-0) (line 329, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L559](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-559-0) (line 559, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L119](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-119-0) (line 119, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L315](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-315-0) (line 315, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L548](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-548-0) (line 548, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L496](performance-optimized-polyglot-bridge.md#^ref-f5579967-496-0) (line 496, col 0, score 1)
- [polyglot-repl-interface-layer — L224](polyglot-repl-interface-layer.md#^ref-9c79206d-224-0) (line 224, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L125](promethean-copilot-intent-engine.md#^ref-ae24a280-125-0) (line 125, col 0, score 1)
- [Promethean State Format — L165](promethean-state-format.md#^ref-23df6ddb-165-0) (line 165, col 0, score 1)
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
- [Pure TypeScript Search Microservice — L605](pure-typescript-search-microservice.md#^ref-d17d3a96-605-0) (line 605, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L561](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-561-0) (line 561, col 0, score 1)
- [schema-evolution-workflow — L645](schema-evolution-workflow.md#^ref-d8059b6a-645-0) (line 645, col 0, score 1)
- [Stateful Partitions and Rebalancing — L671](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-671-0) (line 671, col 0, score 1)
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
- [polyglot-repl-interface-layer — L242](polyglot-repl-interface-layer.md#^ref-9c79206d-242-0) (line 242, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L154](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-154-0) (line 154, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L108](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-108-0) (line 108, col 0, score 1)
- [Promethean Infrastructure Setup — L773](promethean-infrastructure-setup.md#^ref-6deed6ac-773-0) (line 773, col 0, score 1)
- [Prometheus Observability Stack — L582](prometheus-observability-stack.md#^ref-e90b5a16-582-0) (line 582, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L300](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-300-0) (line 300, col 0, score 1)
- [Pure TypeScript Search Microservice — L648](pure-typescript-search-microservice.md#^ref-d17d3a96-648-0) (line 648, col 0, score 1)
- [Reawakening Duck — L203](reawakening-duck.md#^ref-59b5670f-203-0) (line 203, col 0, score 1)
- [Promethean Documentation Update — L50](promethean-documentation-update.txt#^ref-0b872af2-50-0) (line 50, col 0, score 1)
- [Promethean Notes — L53](promethean-notes.md#^ref-1c4046b5-53-0) (line 53, col 0, score 1)
- [Promethean Pipelines — L132](promethean-pipelines.md#^ref-8b8e6103-132-0) (line 132, col 0, score 1)
- [promethean-requirements — L64](promethean-requirements.md#^ref-95205cd3-64-0) (line 64, col 0, score 1)
- [Promethean Workflow Optimization — L62](promethean-workflow-optimization.md#^ref-d614d983-62-0) (line 62, col 0, score 1)
- [Prometheus Observability Stack — L570](prometheus-observability-stack.md#^ref-e90b5a16-570-0) (line 570, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L167](protocol-0-the-contradiction-engine.md#^ref-9a93a756-167-0) (line 167, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L288](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-288-0) (line 288, col 0, score 1)
- [Pure TypeScript Search Microservice — L634](pure-typescript-search-microservice.md#^ref-d17d3a96-634-0) (line 634, col 0, score 1)
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
- [Promethean Pipelines — L183](promethean-pipelines.md#^ref-8b8e6103-183-0) (line 183, col 0, score 1)
- [promethean-requirements — L58](promethean-requirements.md#^ref-95205cd3-58-0) (line 58, col 0, score 1)
- [Promethean Workflow Optimization — L42](promethean-workflow-optimization.md#^ref-d614d983-42-0) (line 42, col 0, score 1)
- [Prometheus Observability Stack — L589](prometheus-observability-stack.md#^ref-e90b5a16-589-0) (line 589, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L314](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-314-0) (line 314, col 0, score 1)
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
- [Prometheus Observability Stack — L608](prometheus-observability-stack.md#^ref-e90b5a16-608-0) (line 608, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L224](protocol-0-the-contradiction-engine.md#^ref-9a93a756-224-0) (line 224, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L329](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-329-0) (line 329, col 0, score 1)
- [Pure TypeScript Search Microservice — L686](pure-typescript-search-microservice.md#^ref-d17d3a96-686-0) (line 686, col 0, score 1)
- [Redirecting Standard Error — L93](redirecting-standard-error.md#^ref-b3555ede-93-0) (line 93, col 0, score 1)
- [ripple-propagation-demo — L212](ripple-propagation-demo.md#^ref-8430617b-212-0) (line 212, col 0, score 1)
- [schema-evolution-workflow — L592](schema-evolution-workflow.md#^ref-d8059b6a-592-0) (line 592, col 0, score 1)
- [Self-Agency in AI Interaction — L106](self-agency-in-ai-interaction.md#^ref-49a9a860-106-0) (line 106, col 0, score 1)
- [Synchronicity Waves and Web — L192](synchronicity-waves-and-web.md#^ref-91295f3a-192-0) (line 192, col 0, score 1)
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
- [Promethean Infrastructure Setup — L737](promethean-infrastructure-setup.md#^ref-6deed6ac-737-0) (line 737, col 0, score 1)
- [Promethean Notes — L74](promethean-notes.md#^ref-1c4046b5-74-0) (line 74, col 0, score 1)
- [Promethean Pipelines — L147](promethean-pipelines.md#^ref-8b8e6103-147-0) (line 147, col 0, score 1)
- [promethean-requirements — L77](promethean-requirements.md#^ref-95205cd3-77-0) (line 77, col 0, score 1)
- [Promethean State Format — L107](promethean-state-format.md#^ref-23df6ddb-107-0) (line 107, col 0, score 1)
- [Promethean Workflow Optimization — L74](promethean-workflow-optimization.md#^ref-d614d983-74-0) (line 74, col 0, score 1)
- [Prometheus Observability Stack — L604](prometheus-observability-stack.md#^ref-e90b5a16-604-0) (line 604, col 0, score 1)
- [Prompt_Folder_Bootstrap — L232](prompt-folder-bootstrap.md#^ref-bd4f0976-232-0) (line 232, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L215](protocol-0-the-contradiction-engine.md#^ref-9a93a756-215-0) (line 215, col 0, score 1)
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
- [homeostasis-decay-formulas — L187](homeostasis-decay-formulas.md#^ref-37b5d236-187-0) (line 187, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L343](migrate-to-provider-tenant-architecture.md#^ref-54382370-343-0) (line 343, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L170](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-170-0) (line 170, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L181](model-upgrade-calm-down-guide.md#^ref-db74343f-181-0) (line 181, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L99](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-99-0) (line 99, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L298](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-298-0) (line 298, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L479](performance-optimized-polyglot-bridge.md#^ref-f5579967-479-0) (line 479, col 0, score 1)
- [plan-update-confirmation — L1147](plan-update-confirmation.md#^ref-b22d79c6-1147-0) (line 1147, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L88](promethean-copilot-intent-engine.md#^ref-ae24a280-88-0) (line 88, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L266](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-266-0) (line 266, col 0, score 1)
- [Promethean Infrastructure Setup — L738](promethean-infrastructure-setup.md#^ref-6deed6ac-738-0) (line 738, col 0, score 1)
- [Eidolon Field Abstract Model — L320](eidolon-field-abstract-model.md#^ref-5e8b2388-320-0) (line 320, col 0, score 1)
- [eidolon-field-math-foundations — L183](eidolon-field-math-foundations.md#^ref-008f2ac0-183-0) (line 183, col 0, score 1)
- [Factorio AI with External Agents — L250](factorio-ai-with-external-agents.md#^ref-a4d90289-250-0) (line 250, col 0, score 1)
- [field-dynamics-math-blocks — L177](field-dynamics-math-blocks.md#^ref-7cfc230d-177-0) (line 177, col 0, score 1)
- [field-interaction-equations — L191](field-interaction-equations.md#^ref-b09141b7-191-0) (line 191, col 0, score 1)
- [field-node-diagram-outline — L149](field-node-diagram-outline.md#^ref-1f32c94a-149-0) (line 149, col 0, score 1)
- [Fnord Tracer Protocol — L366](fnord-tracer-protocol.md#^ref-fc21f824-366-0) (line 366, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L382](functional-embedding-pipeline-refactor.md#^ref-a4a25141-382-0) (line 382, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L220](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-220-0) (line 220, col 0, score 1)
- [komorebi-group-window-hack — L236](komorebi-group-window-hack.md#^ref-dd89372d-236-0) (line 236, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L289](layer1survivabilityenvelope.md#^ref-64a9f9f9-289-0) (line 289, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L344](migrate-to-provider-tenant-architecture.md#^ref-54382370-344-0) (line 344, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L166](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-166-0) (line 166, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L130](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-130-0) (line 130, col 0, score 1)
- [polyglot-repl-interface-layer — L199](polyglot-repl-interface-layer.md#^ref-9c79206d-199-0) (line 199, col 0, score 1)
- [Promethean Chat Activity Report — L143](promethean-chat-activity-report.md#^ref-18344cf9-143-0) (line 143, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L94](promethean-copilot-intent-engine.md#^ref-ae24a280-94-0) (line 94, col 0, score 1)
- [Promethean Dev Workflow Update — L87](promethean-dev-workflow-update.md#^ref-03a5578f-87-0) (line 87, col 0, score 1)
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
- [Protocol_0_The_Contradiction_Engine — L160](protocol-0-the-contradiction-engine.md#^ref-9a93a756-160-0) (line 160, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L276](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-276-0) (line 276, col 0, score 1)
- [Pure TypeScript Search Microservice — L628](pure-typescript-search-microservice.md#^ref-d17d3a96-628-0) (line 628, col 0, score 1)
- [Reawakening Duck — L161](reawakening-duck.md#^ref-59b5670f-161-0) (line 161, col 0, score 1)
- [Redirecting Standard Error — L35](redirecting-standard-error.md#^ref-b3555ede-35-0) (line 35, col 0, score 1)
- [schema-evolution-workflow — L603](schema-evolution-workflow.md#^ref-d8059b6a-603-0) (line 603, col 0, score 1)
- [Self-Agency in AI Interaction — L57](self-agency-in-ai-interaction.md#^ref-49a9a860-57-0) (line 57, col 0, score 1)
- [sibilant-macro-targets — L250](sibilant-macro-targets.md#^ref-c5c9a5c6-250-0) (line 250, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L572](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-572-0) (line 572, col 0, score 1)
- [eidolon-field-math-foundations — L2563](eidolon-field-math-foundations.md#^ref-008f2ac0-2563-0) (line 2563, col 0, score 0.93)
- [Duck's Attractor States — L2162](ducks-attractor-states.md#^ref-13951643-2162-0) (line 2162, col 0, score 0.92)
- [Duck's Attractor States — L2138](ducks-attractor-states.md#^ref-13951643-2138-0) (line 2138, col 0, score 0.92)
- [Duck's Attractor States — L2146](ducks-attractor-states.md#^ref-13951643-2146-0) (line 2146, col 0, score 0.92)
- [The Jar of Echoes — L2382](the-jar-of-echoes.md#^ref-18138627-2382-0) (line 2382, col 0, score 0.92)
- [eidolon-field-math-foundations — L3746](eidolon-field-math-foundations.md#^ref-008f2ac0-3746-0) (line 3746, col 0, score 0.92)
- [Duck's Attractor States — L3771](ducks-attractor-states.md#^ref-13951643-3771-0) (line 3771, col 0, score 0.92)
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
- [TypeScript Patch for Tool Calling Support — L573](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-573-0) (line 573, col 0, score 1)
- [Promethean Pipelines — L222](promethean-pipelines.md#^ref-8b8e6103-222-0) (line 222, col 0, score 1)
- [Promethean State Format — L110](promethean-state-format.md#^ref-23df6ddb-110-0) (line 110, col 0, score 1)
- [Promethean Workflow Optimization — L98](promethean-workflow-optimization.md#^ref-d614d983-98-0) (line 98, col 0, score 1)
- [Prometheus Observability Stack — L563](prometheus-observability-stack.md#^ref-e90b5a16-563-0) (line 563, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L158](protocol-0-the-contradiction-engine.md#^ref-9a93a756-158-0) (line 158, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L282](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-282-0) (line 282, col 0, score 1)
- [Pure TypeScript Search Microservice — L637](pure-typescript-search-microservice.md#^ref-d17d3a96-637-0) (line 637, col 0, score 1)
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
- [TypeScript Patch for Tool Calling Support — L588](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-588-0) (line 588, col 0, score 1)
- [Prometheus Observability Stack — L517](prometheus-observability-stack.md#^ref-e90b5a16-517-0) (line 517, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L305](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-305-0) (line 305, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L487](performance-optimized-polyglot-bridge.md#^ref-f5579967-487-0) (line 487, col 0, score 1)
- [Pipeline Enhancements — L49](pipeline-enhancements.md#^ref-e2135d9f-49-0) (line 49, col 0, score 1)
- [plan-update-confirmation — L1032](plan-update-confirmation.md#^ref-b22d79c6-1032-0) (line 1032, col 0, score 1)
- [polyglot-repl-interface-layer — L213](polyglot-repl-interface-layer.md#^ref-9c79206d-213-0) (line 213, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L129](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-129-0) (line 129, col 0, score 1)
- [Promethean Chat Activity Report — L95](promethean-chat-activity-report.md#^ref-18344cf9-95-0) (line 95, col 0, score 1)
- [Promethean Data Sync Protocol — L74](promethean-data-sync-protocol.md#^ref-9fab9e76-74-0) (line 74, col 0, score 1)
- [Promethean Dev Workflow Update — L88](promethean-dev-workflow-update.md#^ref-03a5578f-88-0) (line 88, col 0, score 1)
- [Promethean Documentation Overview — L47](promethean-documentation-overview.md#^ref-9413237f-47-0) (line 47, col 0, score 1)
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
- [Obsidian ChatGPT Plugin Integration Guide — L75](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-75-0) (line 75, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L74](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-74-0) (line 74, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L145](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-145-0) (line 145, col 0, score 1)
- [Obsidian Task Generation — L47](obsidian-task-generation.md#^ref-9b694a91-47-0) (line 47, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L146](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-146-0) (line 146, col 0, score 1)
- [OpenAPI Validation Report — L63](openapi-validation-report.md#^ref-5c152b08-63-0) (line 63, col 0, score 1)
- [Promethean Notes — L36](promethean-notes.md#^ref-1c4046b5-36-0) (line 36, col 0, score 1)
- [promethean-requirements — L49](promethean-requirements.md#^ref-95205cd3-49-0) (line 49, col 0, score 1)
- [Promethean State Format — L126](promethean-state-format.md#^ref-23df6ddb-126-0) (line 126, col 0, score 1)
- [Promethean Workflow Optimization — L51](promethean-workflow-optimization.md#^ref-d614d983-51-0) (line 51, col 0, score 1)
- [Prompt_Folder_Bootstrap — L287](prompt-folder-bootstrap.md#^ref-bd4f0976-287-0) (line 287, col 0, score 1)
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
- [Per-Domain Policy System for JS Crawler — L601](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-601-0) (line 601, col 0, score 1)
- [plan-update-confirmation — L1116](plan-update-confirmation.md#^ref-b22d79c6-1116-0) (line 1116, col 0, score 1)
- [graph-ds — L474](graph-ds.md#^ref-6620e2f2-474-0) (line 474, col 0, score 1)
- [homeostasis-decay-formulas — L257](homeostasis-decay-formulas.md#^ref-37b5d236-257-0) (line 257, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L260](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-260-0) (line 260, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L162](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-162-0) (line 162, col 0, score 1)
- [Obsidian Task Generation — L85](obsidian-task-generation.md#^ref-9b694a91-85-0) (line 85, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L161](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-161-0) (line 161, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L382](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-382-0) (line 382, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L577](performance-optimized-polyglot-bridge.md#^ref-f5579967-577-0) (line 577, col 0, score 1)
- [plan-update-confirmation — L1128](plan-update-confirmation.md#^ref-b22d79c6-1128-0) (line 1128, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L120](promethean-copilot-intent-engine.md#^ref-ae24a280-120-0) (line 120, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L280](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-280-0) (line 280, col 0, score 1)
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
- [Protocol_0_The_Contradiction_Engine — L184](protocol-0-the-contradiction-engine.md#^ref-9a93a756-184-0) (line 184, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L283](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-283-0) (line 283, col 0, score 1)
- [Pure TypeScript Search Microservice — L629](pure-typescript-search-microservice.md#^ref-d17d3a96-629-0) (line 629, col 0, score 1)
- [Redirecting Standard Error — L36](redirecting-standard-error.md#^ref-b3555ede-36-0) (line 36, col 0, score 1)
- [schema-evolution-workflow — L623](schema-evolution-workflow.md#^ref-d8059b6a-623-0) (line 623, col 0, score 1)
- [Self-Agency in AI Interaction — L58](self-agency-in-ai-interaction.md#^ref-49a9a860-58-0) (line 58, col 0, score 1)
- [Smoke Resonance Visualizations — L108](smoke-resonance-visualizations.md#^ref-ac9d3ac5-108-0) (line 108, col 0, score 1)
- [Stateful Partitions and Rebalancing — L654](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-654-0) (line 654, col 0, score 1)
- [Synchronicity Waves and Web — L123](synchronicity-waves-and-web.md#^ref-91295f3a-123-0) (line 123, col 0, score 1)
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
- [Per-Domain Policy System for JS Crawler — L549](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-549-0) (line 549, col 0, score 1)
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
- [Pure TypeScript Search Microservice — L600](pure-typescript-search-microservice.md#^ref-d17d3a96-600-0) (line 600, col 0, score 1)
- [schema-evolution-workflow — L583](schema-evolution-workflow.md#^ref-d8059b6a-583-0) (line 583, col 0, score 1)
- [Stateful Partitions and Rebalancing — L610](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-610-0) (line 610, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L546](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-546-0) (line 546, col 0, score 1)
- [Unique Info Dump Index — L150](unique-info-dump-index.md#^ref-30ec3ba6-150-0) (line 150, col 0, score 1)
- [DuckDuckGoSearchPipeline — L30](duckduckgosearchpipeline.md#^ref-e979c50f-30-0) (line 30, col 0, score 1)
- [OpenAPI Validation Report — L47](openapi-validation-report.md#^ref-5c152b08-47-0) (line 47, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L148](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-148-0) (line 148, col 0, score 1)
- [Promethean Chat Activity Report — L60](promethean-chat-activity-report.md#^ref-18344cf9-60-0) (line 60, col 0, score 1)
- [Promethean Data Sync Protocol — L39](promethean-data-sync-protocol.md#^ref-9fab9e76-39-0) (line 39, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L168](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-168-0) (line 168, col 0, score 1)
- [Promethean Documentation Update — L40](promethean-documentation-update.md#^ref-c0392040-40-0) (line 40, col 0, score 1)
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
- [TypeScript Patch for Tool Calling Support — L547](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-547-0) (line 547, col 0, score 1)
- [Promethean Documentation Update — L21](promethean-documentation-update.txt#^ref-0b872af2-21-0) (line 21, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L87](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-87-0) (line 87, col 0, score 1)
- [Promethean Notes — L24](promethean-notes.md#^ref-1c4046b5-24-0) (line 24, col 0, score 1)
- [Promethean Pipelines — L128](promethean-pipelines.md#^ref-8b8e6103-128-0) (line 128, col 0, score 1)
- [promethean-requirements — L35](promethean-requirements.md#^ref-95205cd3-35-0) (line 35, col 0, score 1)
- [Promethean State Format — L131](promethean-state-format.md#^ref-23df6ddb-131-0) (line 131, col 0, score 1)
- [Promethean Workflow Optimization — L33](promethean-workflow-optimization.md#^ref-d614d983-33-0) (line 33, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L268](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-268-0) (line 268, col 0, score 1)
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
- [TypeScript Patch for Tool Calling Support — L609](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-609-0) (line 609, col 0, score 1)
- [Promethean Dev Workflow Update — L3129](promethean-dev-workflow-update.md#^ref-03a5578f-3129-0) (line 3129, col 0, score 0.88)
- [The Jar of Echoes — L1794](the-jar-of-echoes.md#^ref-18138627-1794-0) (line 1794, col 0, score 0.88)
- [windows-tiling-with-autohotkey — L2885](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2885-0) (line 2885, col 0, score 0.88)
- [eidolon-field-math-foundations — L2562](eidolon-field-math-foundations.md#^ref-008f2ac0-2562-0) (line 2562, col 0, score 0.88)
- [Canonical Org-Babel Matplotlib Animation Template — L1778](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-1778-0) (line 1778, col 0, score 0.88)
- [The Jar of Echoes — L2752](the-jar-of-echoes.md#^ref-18138627-2752-0) (line 2752, col 0, score 0.88)
- [Promethean Dev Workflow Update — L2400](promethean-dev-workflow-update.md#^ref-03a5578f-2400-0) (line 2400, col 0, score 0.88)
- [eidolon-field-math-foundations — L3745](eidolon-field-math-foundations.md#^ref-008f2ac0-3745-0) (line 3745, col 0, score 0.88)
- [Pure TypeScript Search Microservice — L635](pure-typescript-search-microservice.md#^ref-d17d3a96-635-0) (line 635, col 0, score 1)
- [Reawakening Duck — L172](reawakening-duck.md#^ref-59b5670f-172-0) (line 172, col 0, score 1)
- [Redirecting Standard Error — L73](redirecting-standard-error.md#^ref-b3555ede-73-0) (line 73, col 0, score 1)
- [ripple-propagation-demo — L162](ripple-propagation-demo.md#^ref-8430617b-162-0) (line 162, col 0, score 1)
- [schema-evolution-workflow — L612](schema-evolution-workflow.md#^ref-d8059b6a-612-0) (line 612, col 0, score 1)
- [Self-Agency in AI Interaction — L94](self-agency-in-ai-interaction.md#^ref-49a9a860-94-0) (line 94, col 0, score 1)
- [sibilant-macro-targets — L246](sibilant-macro-targets.md#^ref-c5c9a5c6-246-0) (line 246, col 0, score 1)
- [Stateful Partitions and Rebalancing — L638](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-638-0) (line 638, col 0, score 1)
- [unique-templates — L55](templates/unique-templates.md#^ref-c26f0044-55-0) (line 55, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L610](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-610-0) (line 610, col 0, score 1)
- [windows-tiling-with-autohotkey — L257](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-257-0) (line 257, col 0, score 1)
- [The Jar of Echoes — L1859](the-jar-of-echoes.md#^ref-18138627-1859-0) (line 1859, col 0, score 0.89)
- [eidolon-field-math-foundations — L4197](eidolon-field-math-foundations.md#^ref-008f2ac0-4197-0) (line 4197, col 0, score 0.89)
- [ChatGPT Custom Prompts — L129](chatgpt-custom-prompts.md#^ref-930054b3-129-0) (line 129, col 0, score 0.89)
- [The Jar of Echoes — L2970](the-jar-of-echoes.md#^ref-18138627-2970-0) (line 2970, col 0, score 0.89)
- [Duck's Attractor States — L2318](ducks-attractor-states.md#^ref-13951643-2318-0) (line 2318, col 0, score 0.89)
- [Canonical Org-Babel Matplotlib Animation Template — L2439](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-2439-0) (line 2439, col 0, score 0.89)
- [The Jar of Echoes — L2427](the-jar-of-echoes.md#^ref-18138627-2427-0) (line 2427, col 0, score 0.89)
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
- [NPU Voice Code and Sensory Integration — L35](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-35-0) (line 35, col 0, score 1)
- [Obsidian Task Generation — L36](obsidian-task-generation.md#^ref-9b694a91-36-0) (line 36, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L171](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-171-0) (line 171, col 0, score 1)
- [plan-update-confirmation — L1066](plan-update-confirmation.md#^ref-b22d79c6-1066-0) (line 1066, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L147](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-147-0) (line 147, col 0, score 1)
- [Promethean Dev Workflow Update — L120](promethean-dev-workflow-update.md#^ref-03a5578f-120-0) (line 120, col 0, score 1)
- [Promethean Documentation Update — L28](promethean-documentation-update.md#^ref-c0392040-28-0) (line 28, col 0, score 1)
- [Promethean Documentation Update — L27](promethean-documentation-update.txt#^ref-0b872af2-27-0) (line 27, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L112](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-112-0) (line 112, col 0, score 1)
- [Promethean Infrastructure Setup — L781](promethean-infrastructure-setup.md#^ref-6deed6ac-781-0) (line 781, col 0, score 1)
- [Promethean Notes — L30](promethean-notes.md#^ref-1c4046b5-30-0) (line 30, col 0, score 1)
- [promethean-requirements — L41](promethean-requirements.md#^ref-95205cd3-41-0) (line 41, col 0, score 1)
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
- [Promethean Documentation Overview — L22](promethean-documentation-overview.md#^ref-9413237f-22-0) (line 22, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L176](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-176-0) (line 176, col 0, score 1)
- [Promethean Documentation Update — L50](promethean-documentation-update.md#^ref-c0392040-50-0) (line 50, col 0, score 1)
- [Promethean Documentation Update — L49](promethean-documentation-update.txt#^ref-0b872af2-49-0) (line 49, col 0, score 1)
- [Promethean Notes — L52](promethean-notes.md#^ref-1c4046b5-52-0) (line 52, col 0, score 1)
- [Promethean Pipelines — L122](promethean-pipelines.md#^ref-8b8e6103-122-0) (line 122, col 0, score 1)
- [promethean-requirements — L63](promethean-requirements.md#^ref-95205cd3-63-0) (line 63, col 0, score 1)
- [Promethean State Format — L136](promethean-state-format.md#^ref-23df6ddb-136-0) (line 136, col 0, score 1)
- [Promethean Workflow Optimization — L61](promethean-workflow-optimization.md#^ref-d614d983-61-0) (line 61, col 0, score 1)
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
- [DuckDuckGoSearchPipeline — L43](duckduckgosearchpipeline.md#^ref-e979c50f-43-0) (line 43, col 0, score 1)
- [Duck's Attractor States — L132](ducks-attractor-states.md#^ref-13951643-132-0) (line 132, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L115](ducks-self-referential-perceptual-loop.md#^ref-71726f04-115-0) (line 115, col 0, score 1)
- [Dynamic Context Model for Web Components — L499](dynamic-context-model-for-web-components.md#^ref-f7702bf8-499-0) (line 499, col 0, score 1)
- [eidolon-field-math-foundations — L265](eidolon-field-math-foundations.md#^ref-008f2ac0-265-0) (line 265, col 0, score 1)
- [Factorio AI with External Agents — L207](factorio-ai-with-external-agents.md#^ref-a4d90289-207-0) (line 207, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L242](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-242-0) (line 242, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L390](migrate-to-provider-tenant-architecture.md#^ref-54382370-390-0) (line 390, col 0, score 1)
- [Mindful Prioritization — L40](mindful-prioritization.md#^ref-40185d05-40-0) (line 40, col 0, score 1)
- [graph-ds — L461](graph-ds.md#^ref-6620e2f2-461-0) (line 461, col 0, score 1)
- [i3-bluetooth-setup — L185](i3-bluetooth-setup.md#^ref-5e408692-185-0) (line 185, col 0, score 1)
- [Ice Box Reorganization — L171](ice-box-reorganization.md#^ref-291c7d91-171-0) (line 171, col 0, score 1)
- [komorebi-group-window-hack — L299](komorebi-group-window-hack.md#^ref-dd89372d-299-0) (line 299, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L238](layer1survivabilityenvelope.md#^ref-64a9f9f9-238-0) (line 238, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L383](migrate-to-provider-tenant-architecture.md#^ref-54382370-383-0) (line 383, col 0, score 1)
- [Mindful Prioritization — L43](mindful-prioritization.md#^ref-40185d05-43-0) (line 43, col 0, score 1)
- [MindfulRobotIntegration — L41](mindfulrobotintegration.md#^ref-5f65dfa5-41-0) (line 41, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L266](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-266-0) (line 266, col 0, score 1)
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
- [Migrate to Provider-Tenant Architecture — L391](migrate-to-provider-tenant-architecture.md#^ref-54382370-391-0) (line 391, col 0, score 1)
- [Obsidian Task Generation — L53](obsidian-task-generation.md#^ref-9b694a91-53-0) (line 53, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L187](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-187-0) (line 187, col 0, score 1)
- [OpenAPI Validation Report — L69](openapi-validation-report.md#^ref-5c152b08-69-0) (line 69, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L171](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-171-0) (line 171, col 0, score 1)
- [Promethean Chat Activity Report — L63](promethean-chat-activity-report.md#^ref-18344cf9-63-0) (line 63, col 0, score 1)
- [Promethean Data Sync Protocol — L42](promethean-data-sync-protocol.md#^ref-9fab9e76-42-0) (line 42, col 0, score 1)
- [Promethean Dev Workflow Update — L128](promethean-dev-workflow-update.md#^ref-03a5578f-128-0) (line 128, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L296](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-296-0) (line 296, col 0, score 1)
- [Promethean Documentation Update — L43](promethean-documentation-update.md#^ref-c0392040-43-0) (line 43, col 0, score 1)
- [Promethean Documentation Update — L42](promethean-documentation-update.txt#^ref-0b872af2-42-0) (line 42, col 0, score 1)
- [windows-tiling-with-autohotkey — L261](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-261-0) (line 261, col 0, score 1)
- [promethean-requirements — L68](promethean-requirements.md#^ref-95205cd3-68-0) (line 68, col 0, score 1)
- [Reawakening Duck — L211](reawakening-duck.md#^ref-59b5670f-211-0) (line 211, col 0, score 1)
- [Redirecting Standard Error — L75](redirecting-standard-error.md#^ref-b3555ede-75-0) (line 75, col 0, score 1)
- [schema-evolution-workflow — L629](schema-evolution-workflow.md#^ref-d8059b6a-629-0) (line 629, col 0, score 1)
- [Self-Agency in AI Interaction — L95](self-agency-in-ai-interaction.md#^ref-49a9a860-95-0) (line 95, col 0, score 1)
- [sibilant-macro-targets — L264](sibilant-macro-targets.md#^ref-c5c9a5c6-264-0) (line 264, col 0, score 1)
- [Smoke Resonance Visualizations — L144](smoke-resonance-visualizations.md#^ref-ac9d3ac5-144-0) (line 144, col 0, score 1)
- [Stateful Partitions and Rebalancing — L658](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-658-0) (line 658, col 0, score 1)
- [Synchronicity Waves and Web — L140](synchronicity-waves-and-web.md#^ref-91295f3a-140-0) (line 140, col 0, score 1)
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
- [Debugging Broker Connections and Agent Behavior — L123](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-123-0) (line 123, col 0, score 1)
- [DuckDuckGoSearchPipeline — L65](duckduckgosearchpipeline.md#^ref-e979c50f-65-0) (line 65, col 0, score 1)
- [Dynamic Context Model for Web Components — L485](dynamic-context-model-for-web-components.md#^ref-f7702bf8-485-0) (line 485, col 0, score 1)
- [Eidolon Field Abstract Model — L257](eidolon-field-abstract-model.md#^ref-5e8b2388-257-0) (line 257, col 0, score 1)
- [eidolon-field-math-foundations — L221](eidolon-field-math-foundations.md#^ref-008f2ac0-221-0) (line 221, col 0, score 1)
- [eidolon-node-lifecycle — L99](eidolon-node-lifecycle.md#^ref-938eca9c-99-0) (line 99, col 0, score 1)
- [Factorio AI with External Agents — L227](factorio-ai-with-external-agents.md#^ref-a4d90289-227-0) (line 227, col 0, score 1)
- [field-dynamics-math-blocks — L212](field-dynamics-math-blocks.md#^ref-7cfc230d-212-0) (line 212, col 0, score 1)
- [field-interaction-equations — L226](field-interaction-equations.md#^ref-b09141b7-226-0) (line 226, col 0, score 1)
- [Ice Box Reorganization — L146](ice-box-reorganization.md#^ref-291c7d91-146-0) (line 146, col 0, score 1)
- [komorebi-group-window-hack — L289](komorebi-group-window-hack.md#^ref-dd89372d-289-0) (line 289, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L281](layer1survivabilityenvelope.md#^ref-64a9f9f9-281-0) (line 281, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L265](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-265-0) (line 265, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L160](model-upgrade-calm-down-guide.md#^ref-db74343f-160-0) (line 160, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L195](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-195-0) (line 195, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L343](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-343-0) (line 343, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L572](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-572-0) (line 572, col 0, score 1)
- [plan-update-confirmation — L1107](plan-update-confirmation.md#^ref-b22d79c6-1107-0) (line 1107, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L241](layer1survivabilityenvelope.md#^ref-64a9f9f9-241-0) (line 241, col 0, score 1)
- [Mathematical Samplers — L125](mathematical-samplers.md#^ref-86a691ec-125-0) (line 125, col 0, score 1)
- [Mathematics Sampler — L131](mathematics-sampler.md#^ref-b5e0183e-131-0) (line 131, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L387](migrate-to-provider-tenant-architecture.md#^ref-54382370-387-0) (line 387, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L223](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-223-0) (line 223, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L179](model-upgrade-calm-down-guide.md#^ref-db74343f-179-0) (line 179, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L105](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-105-0) (line 105, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L106](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-106-0) (line 106, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L139](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-139-0) (line 139, col 0, score 1)
- [Promethean Pipelines — L180](promethean-pipelines.md#^ref-8b8e6103-180-0) (line 180, col 0, score 1)
- [Promethean State Format — L149](promethean-state-format.md#^ref-23df6ddb-149-0) (line 149, col 0, score 1)
- [Prompt_Folder_Bootstrap — L274](prompt-folder-bootstrap.md#^ref-bd4f0976-274-0) (line 274, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L205](protocol-0-the-contradiction-engine.md#^ref-9a93a756-205-0) (line 205, col 0, score 1)
- [Reawakening Duck — L190](reawakening-duck.md#^ref-59b5670f-190-0) (line 190, col 0, score 1)
- [ripple-propagation-demo — L185](ripple-propagation-demo.md#^ref-8430617b-185-0) (line 185, col 0, score 1)
- [schema-evolution-workflow — L618](schema-evolution-workflow.md#^ref-d8059b6a-618-0) (line 618, col 0, score 1)
- [sibilant-macro-targets — L223](sibilant-macro-targets.md#^ref-c5c9a5c6-223-0) (line 223, col 0, score 1)
- [Simulation Demo — L90](chunks/simulation-demo.md#^ref-557309a3-90-0) (line 90, col 0, score 1)
- [Window Management — L91](chunks/window-management.md#^ref-9e8ae388-91-0) (line 91, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L107](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-107-0) (line 107, col 0, score 1)
- [Docops Feature Updates — L49](docops-feature-updates.md#^ref-2792d448-49-0) (line 49, col 0, score 1)
- [Duck's Attractor States — L148](ducks-attractor-states.md#^ref-13951643-148-0) (line 148, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L103](ducks-self-referential-perceptual-loop.md#^ref-71726f04-103-0) (line 103, col 0, score 1)
- [Dynamic Context Model for Web Components — L495](dynamic-context-model-for-web-components.md#^ref-f7702bf8-495-0) (line 495, col 0, score 1)
- [Eidolon Field Abstract Model — L264](eidolon-field-abstract-model.md#^ref-5e8b2388-264-0) (line 264, col 0, score 1)
- [eidolon-node-lifecycle — L120](eidolon-node-lifecycle.md#^ref-938eca9c-120-0) (line 120, col 0, score 1)
- [Promethean Chat Activity Report — L151](promethean-chat-activity-report.md#^ref-18344cf9-151-0) (line 151, col 0, score 1)
- [Promethean Pipelines — L105](promethean-pipelines.md#^ref-8b8e6103-105-0) (line 105, col 0, score 1)
- [Promethean State Format — L150](promethean-state-format.md#^ref-23df6ddb-150-0) (line 150, col 0, score 1)
- [Prompt_Folder_Bootstrap — L258](prompt-folder-bootstrap.md#^ref-bd4f0976-258-0) (line 258, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L164](protocol-0-the-contradiction-engine.md#^ref-9a93a756-164-0) (line 164, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L351](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-351-0) (line 351, col 0, score 1)
- [ripple-propagation-demo — L201](ripple-propagation-demo.md#^ref-8430617b-201-0) (line 201, col 0, score 1)
- [schema-evolution-workflow — L609](schema-evolution-workflow.md#^ref-d8059b6a-609-0) (line 609, col 0, score 1)
- [Self-Agency in AI Interaction — L133](self-agency-in-ai-interaction.md#^ref-49a9a860-133-0) (line 133, col 0, score 1)
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
- [Window Management — L84](chunks/window-management.md#^ref-9e8ae388-84-0) (line 84, col 0, score 1)
- [Creative Moments — L60](creative-moments.md#^ref-10d98225-60-0) (line 60, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L128](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-128-0) (line 128, col 0, score 1)
- [DuckDuckGoSearchPipeline — L61](duckduckgosearchpipeline.md#^ref-e979c50f-61-0) (line 61, col 0, score 1)
- [Duck's Attractor States — L163](ducks-attractor-states.md#^ref-13951643-163-0) (line 163, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L124](ducks-self-referential-perceptual-loop.md#^ref-71726f04-124-0) (line 124, col 0, score 1)
- [Dynamic Context Model for Web Components — L481](dynamic-context-model-for-web-components.md#^ref-f7702bf8-481-0) (line 481, col 0, score 1)
- [Eidolon Field Abstract Model — L260](eidolon-field-abstract-model.md#^ref-5e8b2388-260-0) (line 260, col 0, score 1)
- [eidolon-node-lifecycle — L100](eidolon-node-lifecycle.md#^ref-938eca9c-100-0) (line 100, col 0, score 1)
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
- [Pure TypeScript Search Microservice — L575](pure-typescript-search-microservice.md#^ref-d17d3a96-575-0) (line 575, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L157](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-157-0) (line 157, col 0, score 1)
- [Obsidian Task Generation — L65](obsidian-task-generation.md#^ref-9b694a91-65-0) (line 65, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L359](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-359-0) (line 359, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L539](performance-optimized-polyglot-bridge.md#^ref-f5579967-539-0) (line 539, col 0, score 1)
- [Pipeline Enhancements — L33](pipeline-enhancements.md#^ref-e2135d9f-33-0) (line 33, col 0, score 1)
- [polyglot-repl-interface-layer — L259](polyglot-repl-interface-layer.md#^ref-9c79206d-259-0) (line 259, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L182](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-182-0) (line 182, col 0, score 1)
- [Promethean Chat Activity Report — L79](promethean-chat-activity-report.md#^ref-18344cf9-79-0) (line 79, col 0, score 1)
- [Pure TypeScript Search Microservice — L676](pure-typescript-search-microservice.md#^ref-d17d3a96-676-0) (line 676, col 0, score 1)
- [Redirecting Standard Error — L81](redirecting-standard-error.md#^ref-b3555ede-81-0) (line 81, col 0, score 1)
- [ripple-propagation-demo — L194](ripple-propagation-demo.md#^ref-8430617b-194-0) (line 194, col 0, score 1)
- [schema-evolution-workflow — L650](schema-evolution-workflow.md#^ref-d8059b6a-650-0) (line 650, col 0, score 1)
- [Self-Agency in AI Interaction — L100](self-agency-in-ai-interaction.md#^ref-49a9a860-100-0) (line 100, col 0, score 1)
- [sibilant-macro-targets — L285](sibilant-macro-targets.md#^ref-c5c9a5c6-285-0) (line 285, col 0, score 1)
- [Smoke Resonance Visualizations — L170](smoke-resonance-visualizations.md#^ref-ac9d3ac5-170-0) (line 170, col 0, score 1)
- [Stateful Partitions and Rebalancing — L686](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-686-0) (line 686, col 0, score 1)
- [Synchronicity Waves and Web — L171](synchronicity-waves-and-web.md#^ref-91295f3a-171-0) (line 171, col 0, score 1)
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
- [Board Walk – 2025-08-11 — L133](board-walk-2025-08-11.md#^ref-7aa1eb92-133-0) (line 133, col 0, score 1)
- [Pure TypeScript Search Microservice — L598](pure-typescript-search-microservice.md#^ref-d17d3a96-598-0) (line 598, col 0, score 1)
- [Stateful Partitions and Rebalancing — L605](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-605-0) (line 605, col 0, score 1)
- [typed-struct-compiler — L393](typed-struct-compiler.md#^ref-78eeedf7-393-0) (line 393, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L567](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-567-0) (line 567, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L92](ducks-self-referential-perceptual-loop.md#^ref-71726f04-92-0) (line 92, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L75](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-75-0) (line 75, col 0, score 1)
- [Obsidian Task Generation — L72](obsidian-task-generation.md#^ref-9b694a91-72-0) (line 72, col 0, score 1)
- [OpenAPI Validation Report — L89](openapi-validation-report.md#^ref-5c152b08-89-0) (line 89, col 0, score 1)
- [plan-update-confirmation — L1054](plan-update-confirmation.md#^ref-b22d79c6-1054-0) (line 1054, col 0, score 1)
- [Promethean Chat Activity Report — L84](promethean-chat-activity-report.md#^ref-18344cf9-84-0) (line 84, col 0, score 1)
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
- [ParticleSimulationWithCanvasAndFFmpeg — L364](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-364-0) (line 364, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L548](performance-optimized-polyglot-bridge.md#^ref-f5579967-548-0) (line 548, col 0, score 1)
- [Pipeline Enhancements — L43](pipeline-enhancements.md#^ref-e2135d9f-43-0) (line 43, col 0, score 1)
- [polyglot-repl-interface-layer — L266](polyglot-repl-interface-layer.md#^ref-9c79206d-266-0) (line 266, col 0, score 1)
- [Promethean Data Sync Protocol — L67](promethean-data-sync-protocol.md#^ref-9fab9e76-67-0) (line 67, col 0, score 1)
- [Promethean Documentation Overview — L40](promethean-documentation-overview.md#^ref-9413237f-40-0) (line 40, col 0, score 1)
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
- [Model Selection for Lightweight Conversational Tasks — L257](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-257-0) (line 257, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L154](model-upgrade-calm-down-guide.md#^ref-db74343f-154-0) (line 154, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L216](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-216-0) (line 216, col 0, score 1)
- [OpenAPI Validation Report — L102](openapi-validation-report.md#^ref-5c152b08-102-0) (line 102, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L605](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-605-0) (line 605, col 0, score 1)
- [plan-update-confirmation — L1111](plan-update-confirmation.md#^ref-b22d79c6-1111-0) (line 1111, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L169](promethean-copilot-intent-engine.md#^ref-ae24a280-169-0) (line 169, col 0, score 1)
- [Promethean Dev Workflow Update — L185](promethean-dev-workflow-update.md#^ref-03a5578f-185-0) (line 185, col 0, score 1)
- [Promethean Infrastructure Setup — L808](promethean-infrastructure-setup.md#^ref-6deed6ac-808-0) (line 808, col 0, score 1)
- [komorebi-group-window-hack — L242](komorebi-group-window-hack.md#^ref-dd89372d-242-0) (line 242, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L200](layer1survivabilityenvelope.md#^ref-64a9f9f9-200-0) (line 200, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L194](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-194-0) (line 194, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L172](model-upgrade-calm-down-guide.md#^ref-db74343f-172-0) (line 172, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L91](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-91-0) (line 91, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L87](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-87-0) (line 87, col 0, score 1)
- [Obsidian Task Generation — L88](obsidian-task-generation.md#^ref-9b694a91-88-0) (line 88, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L150](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-150-0) (line 150, col 0, score 1)
- [plan-update-confirmation — L1046](plan-update-confirmation.md#^ref-b22d79c6-1046-0) (line 1046, col 0, score 1)
- [polyglot-repl-interface-layer — L218](polyglot-repl-interface-layer.md#^ref-9c79206d-218-0) (line 218, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L119](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-119-0) (line 119, col 0, score 1)
- [eidolon-field-math-foundations — L140](eidolon-field-math-foundations.md#^ref-008f2ac0-140-0) (line 140, col 0, score 1)
- [Admin Dashboard for User Management — L76](admin-dashboard-for-user-management.md#^ref-2901a3e9-76-0) (line 76, col 0, score 1)
- [Operations — L33](chunks/operations.md#^ref-f1add613-33-0) (line 33, col 0, score 1)
- [Duck's Attractor States — L98](ducks-attractor-states.md#^ref-13951643-98-0) (line 98, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L179](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-179-0) (line 179, col 0, score 1)
- [Mathematical Samplers — L116](mathematical-samplers.md#^ref-86a691ec-116-0) (line 116, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L136](model-upgrade-calm-down-guide.md#^ref-db74343f-136-0) (line 136, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L95](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-95-0) (line 95, col 0, score 1)
- [Promethean Chat Activity Report — L104](promethean-chat-activity-report.md#^ref-18344cf9-104-0) (line 104, col 0, score 1)
- [Pure TypeScript Search Microservice — L606](pure-typescript-search-microservice.md#^ref-d17d3a96-606-0) (line 606, col 0, score 1)
- [Stateful Partitions and Rebalancing — L619](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-619-0) (line 619, col 0, score 1)
- [Creative Moments — L90](creative-moments.md#^ref-10d98225-90-0) (line 90, col 0, score 1)
- [Promethean Documentation Update — L80](promethean-documentation-update.txt#^ref-0b872af2-80-0) (line 80, col 0, score 1)
- [Promethean Notes — L87](promethean-notes.md#^ref-1c4046b5-87-0) (line 87, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L582](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-582-0) (line 582, col 0, score 1)
- [Fnord Tracer Protocol — L363](fnord-tracer-protocol.md#^ref-fc21f824-363-0) (line 363, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L407](migrate-to-provider-tenant-architecture.md#^ref-54382370-407-0) (line 407, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L267](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-267-0) (line 267, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L158](model-upgrade-calm-down-guide.md#^ref-db74343f-158-0) (line 158, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L594](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-594-0) (line 594, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L558](performance-optimized-polyglot-bridge.md#^ref-f5579967-558-0) (line 558, col 0, score 1)
- [plan-update-confirmation — L1106](plan-update-confirmation.md#^ref-b22d79c6-1106-0) (line 1106, col 0, score 1)
- [Promethean Chat Activity Report — L158](promethean-chat-activity-report.md#^ref-18344cf9-158-0) (line 158, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L188](promethean-copilot-intent-engine.md#^ref-ae24a280-188-0) (line 188, col 0, score 1)
- [Promethean Dev Workflow Update — L213](promethean-dev-workflow-update.md#^ref-03a5578f-213-0) (line 213, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L285](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-285-0) (line 285, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L218](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-218-0) (line 218, col 0, score 1)
- [Ice Box Reorganization — L167](ice-box-reorganization.md#^ref-291c7d91-167-0) (line 167, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L264](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-264-0) (line 264, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L144](model-upgrade-calm-down-guide.md#^ref-db74343f-144-0) (line 144, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L91](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-91-0) (line 91, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L144](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-144-0) (line 144, col 0, score 1)
- [Obsidian Task Generation — L93](obsidian-task-generation.md#^ref-9b694a91-93-0) (line 93, col 0, score 1)
- [OpenAPI Validation Report — L108](openapi-validation-report.md#^ref-5c152b08-108-0) (line 108, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L530](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-530-0) (line 530, col 0, score 1)
- [plan-update-confirmation — L1101](plan-update-confirmation.md#^ref-b22d79c6-1101-0) (line 1101, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L174](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-174-0) (line 174, col 0, score 1)
- [Promethean Workflow Optimization — L95](promethean-workflow-optimization.md#^ref-d614d983-95-0) (line 95, col 0, score 1)
- [Prometheus Observability Stack — L621](prometheus-observability-stack.md#^ref-e90b5a16-621-0) (line 621, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L238](protocol-0-the-contradiction-engine.md#^ref-9a93a756-238-0) (line 238, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L344](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-344-0) (line 344, col 0, score 1)
- [Pure TypeScript Search Microservice — L640](pure-typescript-search-microservice.md#^ref-d17d3a96-640-0) (line 640, col 0, score 1)
- [Reawakening Duck — L232](reawakening-duck.md#^ref-59b5670f-232-0) (line 232, col 0, score 1)
- [Redirecting Standard Error — L102](redirecting-standard-error.md#^ref-b3555ede-102-0) (line 102, col 0, score 1)
- [ripple-propagation-demo — L180](ripple-propagation-demo.md#^ref-8430617b-180-0) (line 180, col 0, score 1)
- [Self-Agency in AI Interaction — L120](self-agency-in-ai-interaction.md#^ref-49a9a860-120-0) (line 120, col 0, score 1)
- [Promethean Dev Workflow Update — L167](promethean-dev-workflow-update.md#^ref-03a5578f-167-0) (line 167, col 0, score 1)
- [Promethean Documentation Update — L101](promethean-documentation-update.txt#^ref-0b872af2-101-0) (line 101, col 0, score 1)
- [Promethean Infrastructure Setup — L766](promethean-infrastructure-setup.md#^ref-6deed6ac-766-0) (line 766, col 0, score 1)
- [Promethean Notes — L111](promethean-notes.md#^ref-1c4046b5-111-0) (line 111, col 0, score 1)
- [Promethean Pipelines — L158](promethean-pipelines.md#^ref-8b8e6103-158-0) (line 158, col 0, score 1)
- [Promethean State Format — L177](promethean-state-format.md#^ref-23df6ddb-177-0) (line 177, col 0, score 1)
- [Prompt_Folder_Bootstrap — L310](prompt-folder-bootstrap.md#^ref-bd4f0976-310-0) (line 310, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L370](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-370-0) (line 370, col 0, score 1)
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
- [Promethean Documentation Pipeline Overview — L281](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-281-0) (line 281, col 0, score 1)
- [Promethean Infrastructure Setup — L746](promethean-infrastructure-setup.md#^ref-6deed6ac-746-0) (line 746, col 0, score 1)
- [Promethean Pipelines — L186](promethean-pipelines.md#^ref-8b8e6103-186-0) (line 186, col 0, score 1)
- [Promethean State Format — L179](promethean-state-format.md#^ref-23df6ddb-179-0) (line 179, col 0, score 1)
- [Prometheus Observability Stack — L550](prometheus-observability-stack.md#^ref-e90b5a16-550-0) (line 550, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L163](protocol-0-the-contradiction-engine.md#^ref-9a93a756-163-0) (line 163, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L319](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-319-0) (line 319, col 0, score 1)
- [Pure TypeScript Search Microservice — L619](pure-typescript-search-microservice.md#^ref-d17d3a96-619-0) (line 619, col 0, score 1)
- [Reawakening Duck — L237](reawakening-duck.md#^ref-59b5670f-237-0) (line 237, col 0, score 1)
- [i3-bluetooth-setup — L104](i3-bluetooth-setup.md#^ref-5e408692-104-0) (line 104, col 0, score 1)
- [Fnord Tracer Protocol — L374](fnord-tracer-protocol.md#^ref-fc21f824-374-0) (line 374, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L407](functional-embedding-pipeline-refactor.md#^ref-a4a25141-407-0) (line 407, col 0, score 1)
- [homeostasis-decay-formulas — L270](homeostasis-decay-formulas.md#^ref-37b5d236-270-0) (line 270, col 0, score 1)
- [Promethean Dev Workflow Update — L164](promethean-dev-workflow-update.md#^ref-03a5578f-164-0) (line 164, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L282](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-282-0) (line 282, col 0, score 1)
- [Promethean Pipelines — L207](promethean-pipelines.md#^ref-8b8e6103-207-0) (line 207, col 0, score 1)
- [promethean-requirements — L89](promethean-requirements.md#^ref-95205cd3-89-0) (line 89, col 0, score 1)
- [Promethean State Format — L197](promethean-state-format.md#^ref-23df6ddb-197-0) (line 197, col 0, score 1)
- [Promethean Dev Workflow Update — L613](promethean-dev-workflow-update.md#^ref-03a5578f-613-0) (line 613, col 0, score 0.91)
- [Promethean Infrastructure Setup — L1357](promethean-infrastructure-setup.md#^ref-6deed6ac-1357-0) (line 1357, col 0, score 0.91)
- [Prometheus Observability Stack — L1108](prometheus-observability-stack.md#^ref-e90b5a16-1108-0) (line 1108, col 0, score 0.91)
- [Prompt_Folder_Bootstrap — L676](prompt-folder-bootstrap.md#^ref-bd4f0976-676-0) (line 676, col 0, score 0.91)
- [Protocol_0_The_Contradiction_Engine — L516](protocol-0-the-contradiction-engine.md#^ref-9a93a756-516-0) (line 516, col 0, score 0.91)
- [Provider-Agnostic Chat Panel Implementation — L830](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-830-0) (line 830, col 0, score 0.91)
- [Pure TypeScript Search Microservice — L1234](pure-typescript-search-microservice.md#^ref-d17d3a96-1234-0) (line 1234, col 0, score 0.91)
- [ripple-propagation-demo — L642](ripple-propagation-demo.md#^ref-8430617b-642-0) (line 642, col 0, score 0.91)
- [schema-evolution-workflow — L1290](schema-evolution-workflow.md#^ref-d8059b6a-1290-0) (line 1290, col 0, score 0.91)
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
- [plan-update-confirmation — L1517](plan-update-confirmation.md#^ref-b22d79c6-1517-0) (line 1517, col 0, score 1)
- [DSL — L417](chunks/dsl.md#^ref-e87bc036-417-0) (line 417, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration Guide — L476](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-476-0) (line 476, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration — L454](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-454-0) (line 454, col 0, score 0.99)
- [Obsidian Templating Plugins Integration Guide — L493](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-493-0) (line 493, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L534](promethean-copilot-intent-engine.md#^ref-ae24a280-534-0) (line 534, col 0, score 0.99)
- [Promethean Pipelines — L592](promethean-pipelines.md#^ref-8b8e6103-592-0) (line 592, col 0, score 0.99)
- [Promethean State Format — L437](promethean-state-format.md#^ref-23df6ddb-437-0) (line 437, col 0, score 0.99)
- [DSL — L420](chunks/dsl.md#^ref-e87bc036-420-0) (line 420, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L479](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-479-0) (line 479, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L457](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-457-0) (line 457, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L496](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-496-0) (line 496, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L536](promethean-copilot-intent-engine.md#^ref-ae24a280-536-0) (line 536, col 0, score 1)
- [Promethean Pipelines — L595](promethean-pipelines.md#^ref-8b8e6103-595-0) (line 595, col 0, score 1)
- [Promethean State Format — L440](promethean-state-format.md#^ref-23df6ddb-440-0) (line 440, col 0, score 1)
- [ts-to-lisp-transpiler — L401](ts-to-lisp-transpiler.md#^ref-ba11486b-401-0) (line 401, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L823](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-823-0) (line 823, col 0, score 1)
- [windows-tiling-with-autohotkey — L396](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-396-0) (line 396, col 0, score 1)
- [i3-bluetooth-setup — L432](i3-bluetooth-setup.md#^ref-5e408692-432-0) (line 432, col 0, score 1)
- [Promethean Chat Activity Report — L184](promethean-chat-activity-report.md#^ref-18344cf9-184-0) (line 184, col 0, score 1)
- [Docops Feature Updates — L116](docops-feature-updates.md#^ref-2792d448-116-0) (line 116, col 0, score 1)
- [Dynamic Context Model for Web Components — L594](dynamic-context-model-for-web-components.md#^ref-f7702bf8-594-0) (line 594, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L210](ducks-self-referential-perceptual-loop.md#^ref-71726f04-210-0) (line 210, col 0, score 1)
- [Obsidian Task Generation — L118](obsidian-task-generation.md#^ref-9b694a91-118-0) (line 118, col 0, score 1)
- [Promethean Dev Workflow Update — L240](promethean-dev-workflow-update.md#^ref-03a5578f-240-0) (line 240, col 0, score 0.98)
- [Prompt_Folder_Bootstrap — L613](prompt-folder-bootstrap.md#^ref-bd4f0976-613-0) (line 613, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L1223](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1223-0) (line 1223, col 0, score 0.98)
- [Agent Reflections and Prompt Evolution — L358](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-358-0) (line 358, col 0, score 0.97)
- [Dynamic Context Model for Web Components — L926](dynamic-context-model-for-web-components.md#^ref-f7702bf8-926-0) (line 926, col 0, score 0.97)
- [Performance-Optimized-Polyglot-Bridge — L797](performance-optimized-polyglot-bridge.md#^ref-f5579967-797-0) (line 797, col 0, score 0.96)
- [Performance-Optimized-Polyglot-Bridge — L921](performance-optimized-polyglot-bridge.md#^ref-f5579967-921-0) (line 921, col 0, score 0.98)
- [Performance-Optimized-Polyglot-Bridge — L923](performance-optimized-polyglot-bridge.md#^ref-f5579967-923-0) (line 923, col 0, score 0.96)
- [TypeScript Patch for Tool Calling Support — L724](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-724-0) (line 724, col 0, score 0.98)
- [TypeScript Patch for Tool Calling Support — L911](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-911-0) (line 911, col 0, score 0.97)
- [TypeScript Patch for Tool Calling Support — L689](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-689-0) (line 689, col 0, score 0.97)
- [OpenAPI Validation Report — L135](openapi-validation-report.md#^ref-5c152b08-135-0) (line 135, col 0, score 0.97)
- [Self-Agency in AI Interaction — L255](self-agency-in-ai-interaction.md#^ref-49a9a860-255-0) (line 255, col 0, score 0.97)
- [Canonical Org-Babel Matplotlib Animation Template — L3384](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-3384-0) (line 3384, col 0, score 0.96)
- [eidolon-field-math-foundations — L6635](eidolon-field-math-foundations.md#^ref-008f2ac0-6635-0) (line 6635, col 0, score 0.96)
- [Promethean Dev Workflow Update — L5333](promethean-dev-workflow-update.md#^ref-03a5578f-5333-0) (line 5333, col 0, score 0.96)
- [DSL — L428](chunks/dsl.md#^ref-e87bc036-428-0) (line 428, col 0, score 0.96)
- [windows-tiling-with-autohotkey — L2583](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2583-0) (line 2583, col 0, score 0.91)
- [field-node-diagram-outline — L630](field-node-diagram-outline.md#^ref-1f32c94a-630-0) (line 630, col 0, score 0.89)
- [Fnord Tracer Protocol — L1011](fnord-tracer-protocol.md#^ref-fc21f824-1011-0) (line 1011, col 0, score 0.89)
- [graph-ds — L874](graph-ds.md#^ref-6620e2f2-874-0) (line 874, col 0, score 0.89)
- [heartbeat-fragment-demo — L576](heartbeat-fragment-demo.md#^ref-dd00677a-576-0) (line 576, col 0, score 0.89)
- [homeostasis-decay-formulas — L914](homeostasis-decay-formulas.md#^ref-37b5d236-914-0) (line 914, col 0, score 0.89)
- [i3-bluetooth-setup — L648](i3-bluetooth-setup.md#^ref-5e408692-648-0) (line 648, col 0, score 0.89)
- [Ice Box Reorganization — L342](ice-box-reorganization.md#^ref-291c7d91-342-0) (line 342, col 0, score 0.89)
- [Layer1SurvivabilityEnvelope — L770](layer1survivabilityenvelope.md#^ref-64a9f9f9-770-0) (line 770, col 0, score 0.89)
- [Migrate to Provider-Tenant Architecture — L697](migrate-to-provider-tenant-architecture.md#^ref-54382370-697-0) (line 697, col 0, score 0.89)
- [Dynamic Context Model for Web Components — L1218](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1218-0) (line 1218, col 0, score 0.97)
- [TypeScript Patch for Tool Calling Support — L862](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-862-0) (line 862, col 0, score 0.97)
- [Reawakening Duck — L324](reawakening-duck.md#^ref-59b5670f-324-0) (line 324, col 0, score 0.96)
- [Debugging Broker Connections and Agent Behavior — L342](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-342-0) (line 342, col 0, score 0.96)
- [Model Upgrade Calm-Down Guide — L428](model-upgrade-calm-down-guide.md#^ref-db74343f-428-0) (line 428, col 0, score 0.96)
- [Layer1SurvivabilityEnvelope — L498](layer1survivabilityenvelope.md#^ref-64a9f9f9-498-0) (line 498, col 0, score 0.96)
- [Performance-Optimized-Polyglot-Bridge — L903](performance-optimized-polyglot-bridge.md#^ref-f5579967-903-0) (line 903, col 0, score 1)
- [homeostasis-decay-formulas — L650](homeostasis-decay-formulas.md#^ref-37b5d236-650-0) (line 650, col 0, score 1)
- [Self-Agency in AI Interaction — L168](self-agency-in-ai-interaction.md#^ref-49a9a860-168-0) (line 168, col 0, score 1)
- [Fnord Tracer Protocol — L621](fnord-tracer-protocol.md#^ref-fc21f824-621-0) (line 621, col 0, score 0.97)
- [eidolon-field-math-foundations — L566](eidolon-field-math-foundations.md#^ref-008f2ac0-566-0) (line 566, col 0, score 0.97)
- [field-dynamics-math-blocks — L634](field-dynamics-math-blocks.md#^ref-7cfc230d-634-0) (line 634, col 0, score 0.97)
- [field-interaction-equations — L653](field-interaction-equations.md#^ref-b09141b7-653-0) (line 653, col 0, score 0.97)
- [homeostasis-decay-formulas — L675](homeostasis-decay-formulas.md#^ref-37b5d236-675-0) (line 675, col 0, score 0.97)
- [Promethean Infrastructure Setup — L1002](promethean-infrastructure-setup.md#^ref-6deed6ac-1002-0) (line 1002, col 0, score 1)
- [Stateful Partitions and Rebalancing — L848](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-848-0) (line 848, col 0, score 1)
- [Prometheus Observability Stack — L701](prometheus-observability-stack.md#^ref-e90b5a16-701-0) (line 701, col 0, score 1)
- [schema-evolution-workflow — L856](schema-evolution-workflow.md#^ref-d8059b6a-856-0) (line 856, col 0, score 1)
- [Dynamic Context Model for Web Components — L664](dynamic-context-model-for-web-components.md#^ref-f7702bf8-664-0) (line 664, col 0, score 0.97)
- [Stateful Partitions and Rebalancing — L826](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-826-0) (line 826, col 0, score 0.97)
- [Synchronicity Waves and Web — L237](synchronicity-waves-and-web.md#^ref-91295f3a-237-0) (line 237, col 0, score 0.97)
- [Chroma Toolkit Consolidation Plan — L472](chroma-toolkit-consolidation-plan.md#^ref-5020e892-472-0) (line 472, col 0, score 0.97)
- [schema-evolution-workflow — L912](schema-evolution-workflow.md#^ref-d8059b6a-912-0) (line 912, col 0, score 0.97)
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
- [ParticleSimulationWithCanvasAndFFmpeg — L691](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-691-0) (line 691, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L989](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-989-0) (line 989, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L742](performance-optimized-polyglot-bridge.md#^ref-f5579967-742-0) (line 742, col 0, score 1)
- [Pipeline Enhancements — L134](pipeline-enhancements.md#^ref-e2135d9f-134-0) (line 134, col 0, score 1)
- [plan-update-confirmation — L1177](plan-update-confirmation.md#^ref-b22d79c6-1177-0) (line 1177, col 0, score 1)
- [polyglot-repl-interface-layer — L411](polyglot-repl-interface-layer.md#^ref-9c79206d-411-0) (line 411, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L560](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-560-0) (line 560, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L250](promethean-copilot-intent-engine.md#^ref-ae24a280-250-0) (line 250, col 0, score 1)
- [Promethean Infrastructure Setup — L1139](promethean-infrastructure-setup.md#^ref-6deed6ac-1139-0) (line 1139, col 0, score 1)
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
- [Migrate to Provider-Tenant Architecture — L794](migrate-to-provider-tenant-architecture.md#^ref-54382370-794-0) (line 794, col 0, score 1)
- [Unique Info Dump Index — L565](unique-info-dump-index.md#^ref-30ec3ba6-565-0) (line 565, col 0, score 1)
- [Stateful Partitions and Rebalancing — L991](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-991-0) (line 991, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L390](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-390-0) (line 390, col 0, score 1)
- [schema-evolution-workflow — L762](schema-evolution-workflow.md#^ref-d8059b6a-762-0) (line 762, col 0, score 1)
- [Promethean Infrastructure Setup — L1057](promethean-infrastructure-setup.md#^ref-6deed6ac-1057-0) (line 1057, col 0, score 1)
- [field-node-diagram-outline — L350](field-node-diagram-outline.md#^ref-1f32c94a-350-0) (line 350, col 0, score 0.99)
- [Promethean Pipelines — L499](promethean-pipelines.md#^ref-8b8e6103-499-0) (line 499, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L969](dynamic-context-model-for-web-components.md#^ref-f7702bf8-969-0) (line 969, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L529](functional-embedding-pipeline-refactor.md#^ref-a4a25141-529-0) (line 529, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L262](model-upgrade-calm-down-guide.md#^ref-db74343f-262-0) (line 262, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L278](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-278-0) (line 278, col 0, score 1)
- [Eidolon Field Abstract Model — L464](eidolon-field-abstract-model.md#^ref-5e8b2388-464-0) (line 464, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L397](protocol-0-the-contradiction-engine.md#^ref-9a93a756-397-0) (line 397, col 0, score 1)
- [field-interaction-equations — L305](field-interaction-equations.md#^ref-b09141b7-305-0) (line 305, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L319](layer1survivabilityenvelope.md#^ref-64a9f9f9-319-0) (line 319, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L552](migrate-to-provider-tenant-architecture.md#^ref-54382370-552-0) (line 552, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L325](promethean-copilot-intent-engine.md#^ref-ae24a280-325-0) (line 325, col 0, score 1)
- [i3-bluetooth-setup — L271](i3-bluetooth-setup.md#^ref-5e408692-271-0) (line 271, col 0, score 1)
- [zero-copy-snapshots-and-workers — L630](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-630-0) (line 630, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L315](model-upgrade-calm-down-guide.md#^ref-db74343f-315-0) (line 315, col 0, score 0.99)
- [schema-evolution-workflow — L842](schema-evolution-workflow.md#^ref-d8059b6a-842-0) (line 842, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L880](migrate-to-provider-tenant-architecture.md#^ref-54382370-880-0) (line 880, col 0, score 0.99)
- [Layer1SurvivabilityEnvelope — L527](layer1survivabilityenvelope.md#^ref-64a9f9f9-527-0) (line 527, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L476](migrate-to-provider-tenant-architecture.md#^ref-54382370-476-0) (line 476, col 0, score 1)
- [Factorio AI with External Agents — L532](factorio-ai-with-external-agents.md#^ref-a4d90289-532-0) (line 532, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L336](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-336-0) (line 336, col 0, score 1)
- [Promethean Infrastructure Setup — L882](promethean-infrastructure-setup.md#^ref-6deed6ac-882-0) (line 882, col 0, score 0.99)
- [Ice Box Reorganization — L340](ice-box-reorganization.md#^ref-291c7d91-340-0) (line 340, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L324](promethean-copilot-intent-engine.md#^ref-ae24a280-324-0) (line 324, col 0, score 0.99)
- [Factorio AI with External Agents — L589](factorio-ai-with-external-agents.md#^ref-a4d90289-589-0) (line 589, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L985](migrate-to-provider-tenant-architecture.md#^ref-54382370-985-0) (line 985, col 0, score 0.99)
- [Eidolon Field Abstract Model — L686](eidolon-field-abstract-model.md#^ref-5e8b2388-686-0) (line 686, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L225](model-upgrade-calm-down-guide.md#^ref-db74343f-225-0) (line 225, col 0, score 1)
- [Window Management — L165](chunks/window-management.md#^ref-9e8ae388-165-0) (line 165, col 0, score 1)
- [windows-tiling-with-autohotkey — L332](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-332-0) (line 332, col 0, score 1)
- [komorebi-group-window-hack — L463](komorebi-group-window-hack.md#^ref-dd89372d-463-0) (line 463, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L310](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-310-0) (line 310, col 0, score 1)
- [The Jar of Echoes — L464](the-jar-of-echoes.md#^ref-18138627-464-0) (line 464, col 0, score 1)
- [windows-tiling-with-autohotkey — L301](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-301-0) (line 301, col 0, score 0.98)
- [Debugging Broker Connections and Agent Behavior — L226](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-226-0) (line 226, col 0, score 0.97)
- [Model Upgrade Calm-Down Guide — L263](model-upgrade-calm-down-guide.md#^ref-db74343f-263-0) (line 263, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L766](migrate-to-provider-tenant-architecture.md#^ref-54382370-766-0) (line 766, col 0, score 1)
- [Dynamic Context Model for Web Components — L700](dynamic-context-model-for-web-components.md#^ref-f7702bf8-700-0) (line 700, col 0, score 0.98)
- [Fnord Tracer Protocol — L648](fnord-tracer-protocol.md#^ref-fc21f824-648-0) (line 648, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L1010](migrate-to-provider-tenant-architecture.md#^ref-54382370-1010-0) (line 1010, col 0, score 0.98)
- [Performance-Optimized-Polyglot-Bridge — L604](performance-optimized-polyglot-bridge.md#^ref-f5579967-604-0) (line 604, col 0, score 0.98)
- [Promethean-Copilot-Intent-Engine — L437](promethean-copilot-intent-engine.md#^ref-ae24a280-437-0) (line 437, col 0, score 0.98)
- [field-dynamics-math-blocks — L389](field-dynamics-math-blocks.md#^ref-7cfc230d-389-0) (line 389, col 0, score 0.98)
- [Promethean Infrastructure Setup — L1352](promethean-infrastructure-setup.md#^ref-6deed6ac-1352-0) (line 1352, col 0, score 0.98)
- [Prometheus Observability Stack — L1103](prometheus-observability-stack.md#^ref-e90b5a16-1103-0) (line 1103, col 0, score 0.98)
- [Prompt_Folder_Bootstrap — L671](prompt-folder-bootstrap.md#^ref-bd4f0976-671-0) (line 671, col 0, score 0.98)
- [Protocol_0_The_Contradiction_Engine — L511](protocol-0-the-contradiction-engine.md#^ref-9a93a756-511-0) (line 511, col 0, score 0.98)
- [Provider-Agnostic Chat Panel Implementation — L825](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-825-0) (line 825, col 0, score 0.98)
- [Pure TypeScript Search Microservice — L1229](pure-typescript-search-microservice.md#^ref-d17d3a96-1229-0) (line 1229, col 0, score 0.98)
- [ripple-propagation-demo — L637](ripple-propagation-demo.md#^ref-8430617b-637-0) (line 637, col 0, score 0.98)
- [schema-evolution-workflow — L1285](schema-evolution-workflow.md#^ref-d8059b6a-1285-0) (line 1285, col 0, score 0.98)
- [sibilant-macro-targets — L716](sibilant-macro-targets.md#^ref-c5c9a5c6-716-0) (line 716, col 0, score 0.98)
- [Debugging Broker Connections and Agent Behavior — L282](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-282-0) (line 282, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L378](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-378-0) (line 378, col 0, score 1)
- [Prompt_Folder_Bootstrap — L341](prompt-folder-bootstrap.md#^ref-bd4f0976-341-0) (line 341, col 0, score 1)
- [The Jar of Echoes — L478](the-jar-of-echoes.md#^ref-18138627-478-0) (line 478, col 0, score 1)
- [Promethean Pipelines — L236](promethean-pipelines.md#^ref-8b8e6103-236-0) (line 236, col 0, score 0.95)
- [Creative Moments — L553](creative-moments.md#^ref-10d98225-553-0) (line 553, col 0, score 0.95)
- [Duck's Attractor States — L1251](ducks-attractor-states.md#^ref-13951643-1251-0) (line 1251, col 0, score 0.95)
- [Functional Refactor of TypeScript Document Processing — L1202](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-1202-0) (line 1202, col 0, score 0.95)
- [Stateful Partitions and Rebalancing — L995](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-995-0) (line 995, col 0, score 1)
- [eidolon-field-math-foundations — L6645](eidolon-field-math-foundations.md#^ref-008f2ac0-6645-0) (line 6645, col 0, score 0.96)
- [Admin Dashboard for User Management — L346](admin-dashboard-for-user-management.md#^ref-2901a3e9-346-0) (line 346, col 0, score 0.95)
- [Protocol_0_The_Contradiction_Engine — L447](protocol-0-the-contradiction-engine.md#^ref-9a93a756-447-0) (line 447, col 0, score 0.95)
- [obsidian-ignore-node-modules-regex — L275](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-275-0) (line 275, col 0, score 0.95)
- [Agent Tasks: Persistence Migration to DualStore — L340](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-340-0) (line 340, col 0, score 0.95)
- [Fnord Tracer Protocol — L641](fnord-tracer-protocol.md#^ref-fc21f824-641-0) (line 641, col 0, score 0.95)
- [plan-update-confirmation — L1228](plan-update-confirmation.md#^ref-b22d79c6-1228-0) (line 1228, col 0, score 0.95)
- [Provider-Agnostic Chat Panel Implementation — L388](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-388-0) (line 388, col 0, score 1)
- [Promethean Infrastructure Setup — L1058](promethean-infrastructure-setup.md#^ref-6deed6ac-1058-0) (line 1058, col 0, score 1)
- [homeostasis-decay-formulas — L321](homeostasis-decay-formulas.md#^ref-37b5d236-321-0) (line 321, col 0, score 0.98)
- [Provider-Agnostic Chat Panel Implementation — L438](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-438-0) (line 438, col 0, score 0.98)
- [schema-evolution-workflow — L893](schema-evolution-workflow.md#^ref-d8059b6a-893-0) (line 893, col 0, score 0.98)
- [Performance-Optimized-Polyglot-Bridge — L933](performance-optimized-polyglot-bridge.md#^ref-f5579967-933-0) (line 933, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L840](migrate-to-provider-tenant-architecture.md#^ref-54382370-840-0) (line 840, col 0, score 0.98)
- [Chroma Toolkit Consolidation Plan — L445](chroma-toolkit-consolidation-plan.md#^ref-5020e892-445-0) (line 445, col 0, score 0.97)
- [Factorio AI with External Agents — L521](factorio-ai-with-external-agents.md#^ref-a4d90289-521-0) (line 521, col 0, score 0.97)
- [Factorio AI with External Agents — L322](factorio-ai-with-external-agents.md#^ref-a4d90289-322-0) (line 322, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L634](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-634-0) (line 634, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L480](migrate-to-provider-tenant-architecture.md#^ref-54382370-480-0) (line 480, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L377](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-377-0) (line 377, col 0, score 0.99)
- [schema-evolution-workflow — L817](schema-evolution-workflow.md#^ref-d8059b6a-817-0) (line 817, col 0, score 0.99)
- [Promethean Pipelines — L522](promethean-pipelines.md#^ref-8b8e6103-522-0) (line 522, col 0, score 0.99)
- [Layer1SurvivabilityEnvelope — L531](layer1survivabilityenvelope.md#^ref-64a9f9f9-531-0) (line 531, col 0, score 0.99)
- [plan-update-confirmation — L1776](plan-update-confirmation.md#^ref-b22d79c6-1776-0) (line 1776, col 0, score 0.98)
- [Per-Domain Policy System for JS Crawler — L831](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-831-0) (line 831, col 0, score 0.98)
- [plan-update-confirmation — L1399](plan-update-confirmation.md#^ref-b22d79c6-1399-0) (line 1399, col 0, score 1)
- [Promethean Dev Workflow Update — L2164](promethean-dev-workflow-update.md#^ref-03a5578f-2164-0) (line 2164, col 0, score 0.98)
- [The Jar of Echoes — L2059](the-jar-of-echoes.md#^ref-18138627-2059-0) (line 2059, col 0, score 0.98)
- [The Jar of Echoes — L1864](the-jar-of-echoes.md#^ref-18138627-1864-0) (line 1864, col 0, score 0.98)
- [Promethean Dev Workflow Update — L2899](promethean-dev-workflow-update.md#^ref-03a5578f-2899-0) (line 2899, col 0, score 0.98)
- [Creative Moments — L1116](creative-moments.md#^ref-10d98225-1116-0) (line 1116, col 0, score 0.97)
- [The Jar of Echoes — L3174](the-jar-of-echoes.md#^ref-18138627-3174-0) (line 3174, col 0, score 0.97)
- [The Jar of Echoes — L2182](the-jar-of-echoes.md#^ref-18138627-2182-0) (line 2182, col 0, score 0.97)
- [Obsidian Templating Plugins Integration Guide — L318](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-318-0) (line 318, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L291](promethean-copilot-intent-engine.md#^ref-ae24a280-291-0) (line 291, col 0, score 1)
- [Self-Agency in AI Interaction — L221](self-agency-in-ai-interaction.md#^ref-49a9a860-221-0) (line 221, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L559](layer1survivabilityenvelope.md#^ref-64a9f9f9-559-0) (line 559, col 0, score 1)
- [Promethean Dev Workflow Update — L326](promethean-dev-workflow-update.md#^ref-03a5578f-326-0) (line 326, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L242](model-upgrade-calm-down-guide.md#^ref-db74343f-242-0) (line 242, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L121](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-121-0) (line 121, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L336](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-336-0) (line 336, col 0, score 1)
- [plan-update-confirmation — L1220](plan-update-confirmation.md#^ref-b22d79c6-1220-0) (line 1220, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L461](promethean-copilot-intent-engine.md#^ref-ae24a280-461-0) (line 461, col 0, score 1)
- [Prompt_Folder_Bootstrap — L334](prompt-folder-bootstrap.md#^ref-bd4f0976-334-0) (line 334, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L442](protocol-0-the-contradiction-engine.md#^ref-9a93a756-442-0) (line 442, col 0, score 1)
- [Dynamic Context Model for Web Components — L1259](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1259-0) (line 1259, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L414](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-414-0) (line 414, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L784](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-784-0) (line 784, col 0, score 1)
- [Self-Agency in AI Interaction — L252](self-agency-in-ai-interaction.md#^ref-49a9a860-252-0) (line 252, col 0, score 0.96)
- [Agent Reflections and Prompt Evolution — L398](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-398-0) (line 398, col 0, score 1)
- [The Jar of Echoes — L344](the-jar-of-echoes.md#^ref-18138627-344-0) (line 344, col 0, score 1)
- [plan-update-confirmation — L1214](plan-update-confirmation.md#^ref-b22d79c6-1214-0) (line 1214, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L286](promethean-copilot-intent-engine.md#^ref-ae24a280-286-0) (line 286, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L316](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-316-0) (line 316, col 0, score 1)
- [Synchronicity Waves and Web — L263](synchronicity-waves-and-web.md#^ref-91295f3a-263-0) (line 263, col 0, score 1)
- [Tracing the Signal — L335](tracing-the-signal.md#^ref-c3cd4f65-335-0) (line 335, col 0, score 1)
- [i3-bluetooth-setup — L339](i3-bluetooth-setup.md#^ref-5e408692-339-0) (line 339, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L344](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-344-0) (line 344, col 0, score 1)
- [plan-update-confirmation — L1442](plan-update-confirmation.md#^ref-b22d79c6-1442-0) (line 1442, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L557](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-557-0) (line 557, col 0, score 1)
- [Self-Agency in AI Interaction — L177](self-agency-in-ai-interaction.md#^ref-49a9a860-177-0) (line 177, col 0, score 1)
- [Ice Box Reorganization — L393](ice-box-reorganization.md#^ref-291c7d91-393-0) (line 393, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L322](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-322-0) (line 322, col 0, score 1)
- [Factorio AI with External Agents — L541](factorio-ai-with-external-agents.md#^ref-a4d90289-541-0) (line 541, col 0, score 1)
- [windows-tiling-with-autohotkey — L472](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-472-0) (line 472, col 0, score 1)
- [eidolon-field-math-foundations — L4895](eidolon-field-math-foundations.md#^ref-008f2ac0-4895-0) (line 4895, col 0, score 0.98)
- [plan-update-confirmation — L1304](plan-update-confirmation.md#^ref-b22d79c6-1304-0) (line 1304, col 0, score 1)
- [windows-tiling-with-autohotkey — L476](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-476-0) (line 476, col 0, score 1)
- [Pure TypeScript Search Microservice — L965](pure-typescript-search-microservice.md#^ref-d17d3a96-965-0) (line 965, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1067](migrate-to-provider-tenant-architecture.md#^ref-54382370-1067-0) (line 1067, col 0, score 0.99)
- [plan-update-confirmation — L1674](plan-update-confirmation.md#^ref-b22d79c6-1674-0) (line 1674, col 0, score 0.99)
- [Agent Tasks: Persistence Migration to DualStore — L541](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-541-0) (line 541, col 0, score 0.98)
- [Promethean Documentation Pipeline Overview — L610](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-610-0) (line 610, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L971](migrate-to-provider-tenant-architecture.md#^ref-54382370-971-0) (line 971, col 0, score 0.98)
- [plan-update-confirmation — L1421](plan-update-confirmation.md#^ref-b22d79c6-1421-0) (line 1421, col 0, score 0.98)
- [Factorio AI with External Agents — L539](factorio-ai-with-external-agents.md#^ref-a4d90289-539-0) (line 539, col 0, score 1)
- [The Jar of Echoes — L350](the-jar-of-echoes.md#^ref-18138627-350-0) (line 350, col 0, score 1)
- [windows-tiling-with-autohotkey — L477](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-477-0) (line 477, col 0, score 1)
- [Promethean Dev Workflow Update — L2168](promethean-dev-workflow-update.md#^ref-03a5578f-2168-0) (line 2168, col 0, score 0.98)
- [The Jar of Echoes — L2064](the-jar-of-echoes.md#^ref-18138627-2064-0) (line 2064, col 0, score 0.98)
- [Model Upgrade Calm-Down Guide — L250](model-upgrade-calm-down-guide.md#^ref-db74343f-250-0) (line 250, col 0, score 0.98)
- [Self-Agency in AI Interaction — L183](self-agency-in-ai-interaction.md#^ref-49a9a860-183-0) (line 183, col 0, score 0.98)
- [eidolon-field-math-foundations — L3772](eidolon-field-math-foundations.md#^ref-008f2ac0-3772-0) (line 3772, col 0, score 0.98)
- [eidolon-field-math-foundations — L3809](eidolon-field-math-foundations.md#^ref-008f2ac0-3809-0) (line 3809, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L1186](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1186-0) (line 1186, col 0, score 1)
- [Fnord Tracer Protocol — L643](fnord-tracer-protocol.md#^ref-fc21f824-643-0) (line 643, col 0, score 1)
- [Ice Box Reorganization — L392](ice-box-reorganization.md#^ref-291c7d91-392-0) (line 392, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L328](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-328-0) (line 328, col 0, score 1)
- [plan-update-confirmation — L1224](plan-update-confirmation.md#^ref-b22d79c6-1224-0) (line 1224, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L455](protocol-0-the-contradiction-engine.md#^ref-9a93a756-455-0) (line 455, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L445](layer1survivabilityenvelope.md#^ref-64a9f9f9-445-0) (line 445, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L388](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-388-0) (line 388, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L975](performance-optimized-polyglot-bridge.md#^ref-f5579967-975-0) (line 975, col 0, score 1)
- [windows-tiling-with-autohotkey — L470](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-470-0) (line 470, col 0, score 1)
- [plan-update-confirmation — L1441](plan-update-confirmation.md#^ref-b22d79c6-1441-0) (line 1441, col 0, score 1)
- [Dynamic Context Model for Web Components — L1181](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1181-0) (line 1181, col 0, score 1)
- [Self-Agency in AI Interaction — L273](self-agency-in-ai-interaction.md#^ref-49a9a860-273-0) (line 273, col 0, score 1)
- [Pure TypeScript Search Microservice — L971](pure-typescript-search-microservice.md#^ref-d17d3a96-971-0) (line 971, col 0, score 1)
- [Promethean Infrastructure Setup — L1117](promethean-infrastructure-setup.md#^ref-6deed6ac-1117-0) (line 1117, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L522](migrate-to-provider-tenant-architecture.md#^ref-54382370-522-0) (line 522, col 0, score 0.98)
- [Promethean Pipelines — L428](promethean-pipelines.md#^ref-8b8e6103-428-0) (line 428, col 0, score 0.96)
- [Agent Tasks: Persistence Migration to DualStore — L434](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-434-0) (line 434, col 0, score 1)
- [graph-ds — L520](graph-ds.md#^ref-6620e2f2-520-0) (line 520, col 0, score 1)
- [field-node-diagram-set — L356](field-node-diagram-set.md#^ref-22b989d5-356-0) (line 356, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L385](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-385-0) (line 385, col 0, score 1)
- [Fnord Tracer Protocol — L735](fnord-tracer-protocol.md#^ref-fc21f824-735-0) (line 735, col 0, score 0.96)
- [The Jar of Echoes — L2184](the-jar-of-echoes.md#^ref-18138627-2184-0) (line 2184, col 0, score 0.97)
- [The Jar of Echoes — L3079](the-jar-of-echoes.md#^ref-18138627-3079-0) (line 3079, col 0, score 0.97)
- [Promethean Documentation Pipeline Overview — L411](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-411-0) (line 411, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L257](promethean-copilot-intent-engine.md#^ref-ae24a280-257-0) (line 257, col 0, score 1)
- [The Jar of Echoes — L1845](the-jar-of-echoes.md#^ref-18138627-1845-0) (line 1845, col 0, score 0.97)
- [Migrate to Provider-Tenant Architecture — L677](migrate-to-provider-tenant-architecture.md#^ref-54382370-677-0) (line 677, col 0, score 0.96)
- [Model Selection for Lightweight Conversational Tasks — L389](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-389-0) (line 389, col 0, score 0.96)
- [Agent Tasks: Persistence Migration to DualStore — L452](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-452-0) (line 452, col 0, score 0.96)
- [Performance-Optimized-Polyglot-Bridge — L932](performance-optimized-polyglot-bridge.md#^ref-f5579967-932-0) (line 932, col 0, score 0.95)
- [Model Selection for Lightweight Conversational Tasks — L349](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-349-0) (line 349, col 0, score 0.95)
- [Promethean Documentation Pipeline Overview — L368](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-368-0) (line 368, col 0, score 0.95)
- [Promethean-Copilot-Intent-Engine — L378](promethean-copilot-intent-engine.md#^ref-ae24a280-378-0) (line 378, col 0, score 1)
- [Promethean Pipelines — L299](promethean-pipelines.md#^ref-8b8e6103-299-0) (line 299, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L349](layer1survivabilityenvelope.md#^ref-64a9f9f9-349-0) (line 349, col 0, score 1)
- [field-node-diagram-set — L355](field-node-diagram-set.md#^ref-22b989d5-355-0) (line 355, col 0, score 1)
- [graph-ds — L522](graph-ds.md#^ref-6620e2f2-522-0) (line 522, col 0, score 1)
- [Duck's Attractor States — L2056](ducks-attractor-states.md#^ref-13951643-2056-0) (line 2056, col 0, score 0.97)
- [Canonical Org-Babel Matplotlib Animation Template — L2497](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-2497-0) (line 2497, col 0, score 0.96)
- [Duck's Attractor States — L2052](ducks-attractor-states.md#^ref-13951643-2052-0) (line 2052, col 0, score 0.96)
- [Fnord Tracer Protocol — L559](fnord-tracer-protocol.md#^ref-fc21f824-559-0) (line 559, col 0, score 1)
- [Promethean Pipelines — L431](promethean-pipelines.md#^ref-8b8e6103-431-0) (line 431, col 0, score 1)
- [Unique Info Dump Index — L573](unique-info-dump-index.md#^ref-30ec3ba6-573-0) (line 573, col 0, score 0.97)
- [Factorio AI with External Agents — L326](factorio-ai-with-external-agents.md#^ref-a4d90289-326-0) (line 326, col 0, score 0.96)
- [Layer1SurvivabilityEnvelope — L494](layer1survivabilityenvelope.md#^ref-64a9f9f9-494-0) (line 494, col 0, score 0.96)
- [Self-Agency in AI Interaction — L257](self-agency-in-ai-interaction.md#^ref-49a9a860-257-0) (line 257, col 0, score 0.96)
- [Fnord Tracer Protocol — L743](fnord-tracer-protocol.md#^ref-fc21f824-743-0) (line 743, col 0, score 0.96)
- [Creative Moments — L1731](creative-moments.md#^ref-10d98225-1731-0) (line 1731, col 0, score 0.96)
- [Duck's Attractor States — L3358](ducks-attractor-states.md#^ref-13951643-3358-0) (line 3358, col 0, score 0.96)
- [obsidian-ignore-node-modules-regex — L260](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-260-0) (line 260, col 0, score 1)
- [Obsidian Task Generation — L103](obsidian-task-generation.md#^ref-9b694a91-103-0) (line 103, col 0, score 1)
- [Promethean Workflow Optimization — L114](promethean-workflow-optimization.md#^ref-d614d983-114-0) (line 114, col 0, score 1)
- [Promethean Pipelines — L429](promethean-pipelines.md#^ref-8b8e6103-429-0) (line 429, col 0, score 1)
- [field-interaction-equations — L308](field-interaction-equations.md#^ref-b09141b7-308-0) (line 308, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L272](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-272-0) (line 272, col 0, score 1)
- [graph-ds — L524](graph-ds.md#^ref-6620e2f2-524-0) (line 524, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L201](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-201-0) (line 201, col 0, score 1)
- [field-node-diagram-outline — L370](field-node-diagram-outline.md#^ref-1f32c94a-370-0) (line 370, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L534](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-534-0) (line 534, col 0, score 1)
- [Promethean Pipelines — L433](promethean-pipelines.md#^ref-8b8e6103-433-0) (line 433, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L519](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-519-0) (line 519, col 0, score 1)
- [The Jar of Echoes — L2265](the-jar-of-echoes.md#^ref-18138627-2265-0) (line 2265, col 0, score 0.97)
- [The Jar of Echoes — L1913](the-jar-of-echoes.md#^ref-18138627-1913-0) (line 1913, col 0, score 0.97)
- [Promethean Dev Workflow Update — L3510](promethean-dev-workflow-update.md#^ref-03a5578f-3510-0) (line 3510, col 0, score 0.97)
- [Promethean Dev Workflow Update — L3557](promethean-dev-workflow-update.md#^ref-03a5578f-3557-0) (line 3557, col 0, score 0.96)
- [field-node-diagram-set — L292](field-node-diagram-set.md#^ref-22b989d5-292-0) (line 292, col 0, score 1)
- [Prompt_Folder_Bootstrap — L359](prompt-folder-bootstrap.md#^ref-bd4f0976-359-0) (line 359, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L380](promethean-copilot-intent-engine.md#^ref-ae24a280-380-0) (line 380, col 0, score 1)
- [field-node-diagram-visualizations — L261](field-node-diagram-visualizations.md#^ref-e9b27b06-261-0) (line 261, col 0, score 1)
- [Synchronicity Waves and Web — L246](synchronicity-waves-and-web.md#^ref-91295f3a-246-0) (line 246, col 0, score 1)
- [field-node-diagram-outline — L283](field-node-diagram-outline.md#^ref-1f32c94a-283-0) (line 283, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L353](layer1survivabilityenvelope.md#^ref-64a9f9f9-353-0) (line 353, col 0, score 1)
- [Fnord Tracer Protocol — L667](fnord-tracer-protocol.md#^ref-fc21f824-667-0) (line 667, col 0, score 1)
- [graph-ds — L600](graph-ds.md#^ref-6620e2f2-600-0) (line 600, col 0, score 1)
- [Admin Dashboard for User Management — L280](admin-dashboard-for-user-management.md#^ref-2901a3e9-280-0) (line 280, col 0, score 1)
- [Promethean Pipelines — L301](promethean-pipelines.md#^ref-8b8e6103-301-0) (line 301, col 0, score 1)
- [JavaScript — L151](chunks/javascript.md#^ref-c1618c66-151-0) (line 151, col 0, score 0.99)
- [typed-struct-compiler — L775](typed-struct-compiler.md#^ref-78eeedf7-775-0) (line 775, col 0, score 0.99)
- [Unique Info Dump Index — L424](unique-info-dump-index.md#^ref-30ec3ba6-424-0) (line 424, col 0, score 0.99)
- [sibilant-macro-targets — L326](sibilant-macro-targets.md#^ref-c5c9a5c6-326-0) (line 326, col 0, score 0.99)
- [typed-struct-compiler — L531](typed-struct-compiler.md#^ref-78eeedf7-531-0) (line 531, col 0, score 0.98)
- [graph-ds — L601](graph-ds.md#^ref-6620e2f2-601-0) (line 601, col 0, score 1)
- [Promethean Pipelines — L302](promethean-pipelines.md#^ref-8b8e6103-302-0) (line 302, col 0, score 1)
- [Admin Dashboard for User Management — L281](admin-dashboard-for-user-management.md#^ref-2901a3e9-281-0) (line 281, col 0, score 1)
- [typed-struct-compiler — L776](typed-struct-compiler.md#^ref-78eeedf7-776-0) (line 776, col 0, score 0.98)
- [Unique Info Dump Index — L425](unique-info-dump-index.md#^ref-30ec3ba6-425-0) (line 425, col 0, score 0.98)
- [eidolon-field-math-foundations — L6337](eidolon-field-math-foundations.md#^ref-008f2ac0-6337-0) (line 6337, col 0, score 0.95)
- [Promethean Dev Workflow Update — L4806](promethean-dev-workflow-update.md#^ref-03a5578f-4806-0) (line 4806, col 0, score 0.95)
- [windows-tiling-with-autohotkey — L4038](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-4038-0) (line 4038, col 0, score 0.95)
- [The Jar of Echoes — L2945](the-jar-of-echoes.md#^ref-18138627-2945-0) (line 2945, col 0, score 0.95)
- [sibilant-macro-targets — L406](sibilant-macro-targets.md#^ref-c5c9a5c6-406-0) (line 406, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L422](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-422-0) (line 422, col 0, score 1)
- [unique-templates — L86](templates/unique-templates.md#^ref-c26f0044-86-0) (line 86, col 0, score 1)
- [Promethean State Format — L361](promethean-state-format.md#^ref-23df6ddb-361-0) (line 361, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L205](ducks-self-referential-perceptual-loop.md#^ref-71726f04-205-0) (line 205, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L507](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-507-0) (line 507, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L252](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-252-0) (line 252, col 0, score 1)
- [The Jar of Echoes — L3384](the-jar-of-echoes.md#^ref-18138627-3384-0) (line 3384, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L523](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-523-0) (line 523, col 0, score 1)
- [Prompt_Folder_Bootstrap — L490](prompt-folder-bootstrap.md#^ref-bd4f0976-490-0) (line 490, col 0, score 1)
- [Obsidian Task Generation — L105](obsidian-task-generation.md#^ref-9b694a91-105-0) (line 105, col 0, score 1)
- [Promethean Workflow Optimization — L119](promethean-workflow-optimization.md#^ref-d614d983-119-0) (line 119, col 0, score 1)
- [ChatGPT Custom Prompts — L87](chatgpt-custom-prompts.md#^ref-930054b3-87-0) (line 87, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L270](promethean-copilot-intent-engine.md#^ref-ae24a280-270-0) (line 270, col 0, score 1)
- [heartbeat-fragment-demo — L246](heartbeat-fragment-demo.md#^ref-dd00677a-246-0) (line 246, col 0, score 1)
- [sibilant-macro-targets — L407](sibilant-macro-targets.md#^ref-c5c9a5c6-407-0) (line 407, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L524](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-524-0) (line 524, col 0, score 1)
- [Prompt_Folder_Bootstrap — L491](prompt-folder-bootstrap.md#^ref-bd4f0976-491-0) (line 491, col 0, score 1)
- [ChatGPT Custom Prompts — L88](chatgpt-custom-prompts.md#^ref-930054b3-88-0) (line 88, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L271](promethean-copilot-intent-engine.md#^ref-ae24a280-271-0) (line 271, col 0, score 1)
- [heartbeat-fragment-demo — L247](heartbeat-fragment-demo.md#^ref-dd00677a-247-0) (line 247, col 0, score 1)
- [sibilant-macro-targets — L408](sibilant-macro-targets.md#^ref-c5c9a5c6-408-0) (line 408, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L509](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-509-0) (line 509, col 0, score 1)
- [Dynamic Context Model for Web Components — L585](dynamic-context-model-for-web-components.md#^ref-f7702bf8-585-0) (line 585, col 0, score 1)
- [ChatGPT Custom Prompts — L89](chatgpt-custom-prompts.md#^ref-930054b3-89-0) (line 89, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L272](promethean-copilot-intent-engine.md#^ref-ae24a280-272-0) (line 272, col 0, score 1)
- [heartbeat-fragment-demo — L248](heartbeat-fragment-demo.md#^ref-dd00677a-248-0) (line 248, col 0, score 1)
- [sibilant-macro-targets — L409](sibilant-macro-targets.md#^ref-c5c9a5c6-409-0) (line 409, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L510](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-510-0) (line 510, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L525](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-525-0) (line 525, col 0, score 1)
- [Dynamic Context Model for Web Components — L586](dynamic-context-model-for-web-components.md#^ref-f7702bf8-586-0) (line 586, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L172](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-172-0) (line 172, col 0, score 0.99)
- [eidolon-field-math-foundations — L638](eidolon-field-math-foundations.md#^ref-008f2ac0-638-0) (line 638, col 0, score 0.99)
- [field-interaction-equations — L880](field-interaction-equations.md#^ref-b09141b7-880-0) (line 880, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L1055](performance-optimized-polyglot-bridge.md#^ref-f5579967-1055-0) (line 1055, col 0, score 0.99)
- [Promethean Infrastructure Setup — L1168](promethean-infrastructure-setup.md#^ref-6deed6ac-1168-0) (line 1168, col 0, score 0.99)
- [eidolon-field-math-foundations — L5999](eidolon-field-math-foundations.md#^ref-008f2ac0-5999-0) (line 5999, col 0, score 0.96)
- [eidolon-field-math-foundations — L6007](eidolon-field-math-foundations.md#^ref-008f2ac0-6007-0) (line 6007, col 0, score 0.96)
- [eidolon-field-math-foundations — L6048](eidolon-field-math-foundations.md#^ref-008f2ac0-6048-0) (line 6048, col 0, score 0.96)
- [eidolon-field-math-foundations — L6015](eidolon-field-math-foundations.md#^ref-008f2ac0-6015-0) (line 6015, col 0, score 0.96)
- [Admin Dashboard for User Management — L371](admin-dashboard-for-user-management.md#^ref-2901a3e9-371-0) (line 371, col 0, score 1)
- [eidolon-field-math-foundations — L639](eidolon-field-math-foundations.md#^ref-008f2ac0-639-0) (line 639, col 0, score 1)
- [field-interaction-equations — L881](field-interaction-equations.md#^ref-b09141b7-881-0) (line 881, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L1056](performance-optimized-polyglot-bridge.md#^ref-f5579967-1056-0) (line 1056, col 0, score 1)
- [Promethean Infrastructure Setup — L1169](promethean-infrastructure-setup.md#^ref-6deed6ac-1169-0) (line 1169, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L818](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-818-0) (line 818, col 0, score 1)
- [Docops Feature Updates — L132](docops-feature-updates.md#^ref-2792d448-132-0) (line 132, col 0, score 0.99)
- [Promethean Infrastructure Setup — L1655](promethean-infrastructure-setup.md#^ref-6deed6ac-1655-0) (line 1655, col 0, score 0.99)
- [eidolon-field-math-foundations — L640](eidolon-field-math-foundations.md#^ref-008f2ac0-640-0) (line 640, col 0, score 0.99)
- [field-interaction-equations — L882](field-interaction-equations.md#^ref-b09141b7-882-0) (line 882, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L1057](performance-optimized-polyglot-bridge.md#^ref-f5579967-1057-0) (line 1057, col 0, score 0.99)
- [Promethean Infrastructure Setup — L1170](promethean-infrastructure-setup.md#^ref-6deed6ac-1170-0) (line 1170, col 0, score 0.99)
- [Model Upgrade Calm-Down Guide — L289](model-upgrade-calm-down-guide.md#^ref-db74343f-289-0) (line 289, col 0, score 0.99)
- [AI-First-OS-Model-Context-Protocol — L112](ai-first-os-model-context-protocol.md#^ref-618198f4-112-0) (line 112, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L633](migrate-to-provider-tenant-architecture.md#^ref-54382370-633-0) (line 633, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L346](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-346-0) (line 346, col 0, score 0.99)
- [TypeScript Patch for Tool Calling Support — L883](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-883-0) (line 883, col 0, score 0.99)
- [eidolon-field-math-foundations — L641](eidolon-field-math-foundations.md#^ref-008f2ac0-641-0) (line 641, col 0, score 0.99)
- [field-interaction-equations — L883](field-interaction-equations.md#^ref-b09141b7-883-0) (line 883, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L1058](performance-optimized-polyglot-bridge.md#^ref-f5579967-1058-0) (line 1058, col 0, score 0.99)
- [Promethean Infrastructure Setup — L1171](promethean-infrastructure-setup.md#^ref-6deed6ac-1171-0) (line 1171, col 0, score 0.99)
- [typed-struct-compiler — L564](typed-struct-compiler.md#^ref-78eeedf7-564-0) (line 564, col 0, score 0.98)
- [zero-copy-snapshots-and-workers — L508](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-508-0) (line 508, col 0, score 0.98)
- [schema-evolution-workflow — L779](schema-evolution-workflow.md#^ref-d8059b6a-779-0) (line 779, col 0, score 0.98)
- [Promethean Documentation Pipeline Overview — L347](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-347-0) (line 347, col 0, score 0.97)
- [Dynamic Context Model for Web Components — L1012](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1012-0) (line 1012, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L337](model-upgrade-calm-down-guide.md#^ref-db74343f-337-0) (line 337, col 0, score 0.97)
- [Obsidian ChatGPT Plugin Integration Guide — L202](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-202-0) (line 202, col 0, score 0.93)
- [Obsidian ChatGPT Plugin Integration — L201](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-201-0) (line 201, col 0, score 0.97)
- [Obsidian Templating Plugins Integration Guide — L273](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-273-0) (line 273, col 0, score 0.97)
- [Promethean Pipelines — L436](promethean-pipelines.md#^ref-8b8e6103-436-0) (line 436, col 0, score 0.97)
- [Reawakening Duck — L436](reawakening-duck.md#^ref-59b5670f-436-0) (line 436, col 0, score 0.97)
- [Promethean Documentation Pipeline Overview — L390](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-390-0) (line 390, col 0, score 0.93)
- [sibilant-macro-targets — L398](sibilant-macro-targets.md#^ref-c5c9a5c6-398-0) (line 398, col 0, score 1)
- [Promethean State Format — L239](promethean-state-format.md#^ref-23df6ddb-239-0) (line 239, col 0, score 0.97)
- [Provider-Agnostic Chat Panel Implementation — L569](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-569-0) (line 569, col 0, score 0.97)
- [Promethean-Copilot-Intent-Engine — L477](promethean-copilot-intent-engine.md#^ref-ae24a280-477-0) (line 477, col 0, score 0.97)
- [plan-update-confirmation — L1475](plan-update-confirmation.md#^ref-b22d79c6-1475-0) (line 1475, col 0, score 0.97)
- [Eidolon Field Abstract Model — L446](eidolon-field-abstract-model.md#^ref-5e8b2388-446-0) (line 446, col 0, score 0.97)
- [Prompt_Folder_Bootstrap — L543](prompt-folder-bootstrap.md#^ref-bd4f0976-543-0) (line 543, col 0, score 0.97)
- [Promethean State Format — L401](promethean-state-format.md#^ref-23df6ddb-401-0) (line 401, col 0, score 0.97)
- [sibilant-macro-targets — L397](sibilant-macro-targets.md#^ref-c5c9a5c6-397-0) (line 397, col 0, score 1)
- [graph-ds — L602](graph-ds.md#^ref-6620e2f2-602-0) (line 602, col 0, score 0.97)
- [Promethean Pipelines — L303](promethean-pipelines.md#^ref-8b8e6103-303-0) (line 303, col 0, score 0.97)
- [Admin Dashboard for User Management — L282](admin-dashboard-for-user-management.md#^ref-2901a3e9-282-0) (line 282, col 0, score 0.97)
- [JavaScript — L152](chunks/javascript.md#^ref-c1618c66-152-0) (line 152, col 0, score 0.96)
- [Unique Info Dump Index — L426](unique-info-dump-index.md#^ref-30ec3ba6-426-0) (line 426, col 0, score 0.96)
- [DSL — L249](chunks/dsl.md#^ref-e87bc036-249-0) (line 249, col 0, score 0.96)
- [sibilant-macro-targets — L795](sibilant-macro-targets.md#^ref-c5c9a5c6-795-0) (line 795, col 0, score 0.96)
- [ts-to-lisp-transpiler — L297](ts-to-lisp-transpiler.md#^ref-ba11486b-297-0) (line 297, col 0, score 0.96)
- [Migrate to Provider-Tenant Architecture — L790](migrate-to-provider-tenant-architecture.md#^ref-54382370-790-0) (line 790, col 0, score 0.95)
- [plan-update-confirmation — L1712](plan-update-confirmation.md#^ref-b22d79c6-1712-0) (line 1712, col 0, score 0.95)
- [Chroma Toolkit Consolidation Plan — L979](chroma-toolkit-consolidation-plan.md#^ref-5020e892-979-0) (line 979, col 0, score 0.95)
- [DSL — L244](chunks/dsl.md#^ref-e87bc036-244-0) (line 244, col 0, score 0.95)
- [JavaScript — L296](chunks/javascript.md#^ref-c1618c66-296-0) (line 296, col 0, score 0.95)
- [Window Management — L313](chunks/window-management.md#^ref-9e8ae388-313-0) (line 313, col 0, score 0.95)
- [Dynamic Context Model for Web Components — L1168](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1168-0) (line 1168, col 0, score 0.95)
- [komorebi-group-window-hack — L506](komorebi-group-window-hack.md#^ref-dd89372d-506-0) (line 506, col 0, score 0.95)
- [sibilant-macro-targets — L396](sibilant-macro-targets.md#^ref-c5c9a5c6-396-0) (line 396, col 0, score 1)
- [graph-ds — L628](graph-ds.md#^ref-6620e2f2-628-0) (line 628, col 0, score 0.97)
- [Promethean Notes — L140](promethean-notes.md#^ref-1c4046b5-140-0) (line 140, col 0, score 0.97)
- [field-interaction-equations — L530](field-interaction-equations.md#^ref-b09141b7-530-0) (line 530, col 0, score 0.96)
- [Migrate to Provider-Tenant Architecture — L560](migrate-to-provider-tenant-architecture.md#^ref-54382370-560-0) (line 560, col 0, score 0.96)
- [DSL — L136](chunks/dsl.md#^ref-e87bc036-136-0) (line 136, col 0, score 0.96)
- [Unique Info Dump Index — L342](unique-info-dump-index.md#^ref-30ec3ba6-342-0) (line 342, col 0, score 0.96)
- [JavaScript — L134](chunks/javascript.md#^ref-c1618c66-134-0) (line 134, col 0, score 0.96)
- [Promethean Documentation Pipeline Overview — L380](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-380-0) (line 380, col 0, score 1)
- [graph-ds — L537](graph-ds.md#^ref-6620e2f2-537-0) (line 537, col 0, score 1)
- [unique-templates — L87](templates/unique-templates.md#^ref-c26f0044-87-0) (line 87, col 0, score 1)
- [Dynamic Context Model for Web Components — L589](dynamic-context-model-for-web-components.md#^ref-f7702bf8-589-0) (line 589, col 0, score 1)
- [typed-struct-compiler — L587](typed-struct-compiler.md#^ref-78eeedf7-587-0) (line 587, col 0, score 1)
- [Docops Feature Updates — L141](docops-feature-updates.md#^ref-2792d448-141-0) (line 141, col 0, score 0.93)
- [Dynamic Context Model for Web Components — L1214](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1214-0) (line 1214, col 0, score 0.93)
- [Debugging Broker Connections and Agent Behavior — L476](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-476-0) (line 476, col 0, score 1)
- [Dynamic Context Model for Web Components — L1579](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1579-0) (line 1579, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L291](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-291-0) (line 291, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L268](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-268-0) (line 268, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L423](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-423-0) (line 423, col 0, score 1)
- [plan-update-confirmation — L1940](plan-update-confirmation.md#^ref-b22d79c6-1940-0) (line 1940, col 0, score 1)
- [Promethean State Format — L403](promethean-state-format.md#^ref-23df6ddb-403-0) (line 403, col 0, score 1)
- [ts-to-lisp-transpiler — L269](ts-to-lisp-transpiler.md#^ref-ba11486b-269-0) (line 269, col 0, score 1)
- [Dynamic Context Model for Web Components — L1580](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1580-0) (line 1580, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L292](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-292-0) (line 292, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L269](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-269-0) (line 269, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L424](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-424-0) (line 424, col 0, score 1)
- [plan-update-confirmation — L1941](plan-update-confirmation.md#^ref-b22d79c6-1941-0) (line 1941, col 0, score 1)
- [Promethean State Format — L404](promethean-state-format.md#^ref-23df6ddb-404-0) (line 404, col 0, score 1)
- [ts-to-lisp-transpiler — L270](ts-to-lisp-transpiler.md#^ref-ba11486b-270-0) (line 270, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L458](model-upgrade-calm-down-guide.md#^ref-db74343f-458-0) (line 458, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L477](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-477-0) (line 477, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L293](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-293-0) (line 293, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L270](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-270-0) (line 270, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L425](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-425-0) (line 425, col 0, score 1)
- [plan-update-confirmation — L1942](plan-update-confirmation.md#^ref-b22d79c6-1942-0) (line 1942, col 0, score 1)
- [Promethean State Format — L405](promethean-state-format.md#^ref-23df6ddb-405-0) (line 405, col 0, score 1)
- [ts-to-lisp-transpiler — L271](ts-to-lisp-transpiler.md#^ref-ba11486b-271-0) (line 271, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L208](promethean-copilot-intent-engine.md#^ref-ae24a280-208-0) (line 208, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L478](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-478-0) (line 478, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L1581](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1581-0) (line 1581, col 0, score 0.98)
- [Obsidian ChatGPT Plugin Integration Guide — L294](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-294-0) (line 294, col 0, score 0.98)
- [Obsidian ChatGPT Plugin Integration — L271](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-271-0) (line 271, col 0, score 0.98)
- [Obsidian Templating Plugins Integration Guide — L426](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-426-0) (line 426, col 0, score 0.98)
- [plan-update-confirmation — L1943](plan-update-confirmation.md#^ref-b22d79c6-1943-0) (line 1943, col 0, score 1)
- [Promethean State Format — L406](promethean-state-format.md#^ref-23df6ddb-406-0) (line 406, col 0, score 1)
- [ts-to-lisp-transpiler — L272](ts-to-lisp-transpiler.md#^ref-ba11486b-272-0) (line 272, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L479](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-479-0) (line 479, col 0, score 1)
- [Dynamic Context Model for Web Components — L1582](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1582-0) (line 1582, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L295](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-295-0) (line 295, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L272](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-272-0) (line 272, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L427](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-427-0) (line 427, col 0, score 1)
- [plan-update-confirmation — L1944](plan-update-confirmation.md#^ref-b22d79c6-1944-0) (line 1944, col 0, score 1)
- [Promethean State Format — L407](promethean-state-format.md#^ref-23df6ddb-407-0) (line 407, col 0, score 1)
- [ts-to-lisp-transpiler — L273](ts-to-lisp-transpiler.md#^ref-ba11486b-273-0) (line 273, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L480](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-480-0) (line 480, col 0, score 1)
- [Dynamic Context Model for Web Components — L1583](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1583-0) (line 1583, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L273](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-273-0) (line 273, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L428](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-428-0) (line 428, col 0, score 1)
- [plan-update-confirmation — L1945](plan-update-confirmation.md#^ref-b22d79c6-1945-0) (line 1945, col 0, score 1)
- [Promethean State Format — L408](promethean-state-format.md#^ref-23df6ddb-408-0) (line 408, col 0, score 1)
- [ts-to-lisp-transpiler — L274](ts-to-lisp-transpiler.md#^ref-ba11486b-274-0) (line 274, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L211](promethean-copilot-intent-engine.md#^ref-ae24a280-211-0) (line 211, col 0, score 0.99)
- [Debugging Broker Connections and Agent Behavior — L481](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-481-0) (line 481, col 0, score 1)
- [Dynamic Context Model for Web Components — L1584](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1584-0) (line 1584, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L296](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-296-0) (line 296, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L429](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-429-0) (line 429, col 0, score 1)
- [plan-update-confirmation — L1946](plan-update-confirmation.md#^ref-b22d79c6-1946-0) (line 1946, col 0, score 1)
- [Promethean State Format — L409](promethean-state-format.md#^ref-23df6ddb-409-0) (line 409, col 0, score 1)
- [ts-to-lisp-transpiler — L275](ts-to-lisp-transpiler.md#^ref-ba11486b-275-0) (line 275, col 0, score 1)
- [Promethean Dev Workflow Update — L4729](promethean-dev-workflow-update.md#^ref-03a5578f-4729-0) (line 4729, col 0, score 0.98)
- [Debugging Broker Connections and Agent Behavior — L482](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-482-0) (line 482, col 0, score 1)
- [Dynamic Context Model for Web Components — L1585](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1585-0) (line 1585, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L297](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-297-0) (line 297, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L274](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-274-0) (line 274, col 0, score 1)
- [plan-update-confirmation — L1947](plan-update-confirmation.md#^ref-b22d79c6-1947-0) (line 1947, col 0, score 1)
- [Promethean State Format — L410](promethean-state-format.md#^ref-23df6ddb-410-0) (line 410, col 0, score 1)
- [ts-to-lisp-transpiler — L276](ts-to-lisp-transpiler.md#^ref-ba11486b-276-0) (line 276, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L988](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-988-0) (line 988, col 0, score 1)
- [DSL — L408](chunks/dsl.md#^ref-e87bc036-408-0) (line 408, col 0, score 1)
- [Dynamic Context Model for Web Components — L1658](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1658-0) (line 1658, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L234](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-234-0) (line 234, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L226](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-226-0) (line 226, col 0, score 1)
- [plan-update-confirmation — L1877](plan-update-confirmation.md#^ref-b22d79c6-1877-0) (line 1877, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L543](promethean-copilot-intent-engine.md#^ref-ae24a280-543-0) (line 543, col 0, score 1)
- [Promethean State Format — L427](promethean-state-format.md#^ref-23df6ddb-427-0) (line 427, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L568](protocol-0-the-contradiction-engine.md#^ref-9a93a756-568-0) (line 568, col 0, score 1)
- [DSL — L410](chunks/dsl.md#^ref-e87bc036-410-0) (line 410, col 0, score 1)
- [Dynamic Context Model for Web Components — L1661](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1661-0) (line 1661, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L237](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-237-0) (line 237, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L229](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-229-0) (line 229, col 0, score 1)
- [plan-update-confirmation — L1880](plan-update-confirmation.md#^ref-b22d79c6-1880-0) (line 1880, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L546](promethean-copilot-intent-engine.md#^ref-ae24a280-546-0) (line 546, col 0, score 1)
- [Promethean State Format — L430](promethean-state-format.md#^ref-23df6ddb-430-0) (line 430, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L571](protocol-0-the-contradiction-engine.md#^ref-9a93a756-571-0) (line 571, col 0, score 1)
- [DSL — L411](chunks/dsl.md#^ref-e87bc036-411-0) (line 411, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L238](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-238-0) (line 238, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L230](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-230-0) (line 230, col 0, score 1)
- [plan-update-confirmation — L1881](plan-update-confirmation.md#^ref-b22d79c6-1881-0) (line 1881, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L547](promethean-copilot-intent-engine.md#^ref-ae24a280-547-0) (line 547, col 0, score 1)
- [Promethean State Format — L431](promethean-state-format.md#^ref-23df6ddb-431-0) (line 431, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L572](protocol-0-the-contradiction-engine.md#^ref-9a93a756-572-0) (line 572, col 0, score 1)
- [ts-to-lisp-transpiler — L393](ts-to-lisp-transpiler.md#^ref-ba11486b-393-0) (line 393, col 0, score 1)
- [DSL — L412](chunks/dsl.md#^ref-e87bc036-412-0) (line 412, col 0, score 1)
- [Dynamic Context Model for Web Components — L1662](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1662-0) (line 1662, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L239](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-239-0) (line 239, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L231](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-231-0) (line 231, col 0, score 1)
- [plan-update-confirmation — L1882](plan-update-confirmation.md#^ref-b22d79c6-1882-0) (line 1882, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L548](promethean-copilot-intent-engine.md#^ref-ae24a280-548-0) (line 548, col 0, score 1)
- [Promethean State Format — L432](promethean-state-format.md#^ref-23df6ddb-432-0) (line 432, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L573](protocol-0-the-contradiction-engine.md#^ref-9a93a756-573-0) (line 573, col 0, score 1)
- [eidolon-field-math-foundations — L812](eidolon-field-math-foundations.md#^ref-008f2ac0-812-0) (line 812, col 0, score 1)
- [Promethean Dev Workflow Update — L571](promethean-dev-workflow-update.md#^ref-03a5578f-571-0) (line 571, col 0, score 1)
- [schema-evolution-workflow — L1123](schema-evolution-workflow.md#^ref-d8059b6a-1123-0) (line 1123, col 0, score 1)
- [Stateful Partitions and Rebalancing — L1157](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-1157-0) (line 1157, col 0, score 1)
- [windows-tiling-with-autohotkey — L586](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-586-0) (line 586, col 0, score 1)
- [windows-tiling-with-autohotkey — L543](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-543-0) (line 543, col 0, score 0.97)
- [windows-tiling-with-autohotkey — L4318](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-4318-0) (line 4318, col 0, score 0.87)
- [windows-tiling-with-autohotkey — L4326](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-4326-0) (line 4326, col 0, score 0.85)
- [windows-tiling-with-autohotkey — L4334](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-4334-0) (line 4334, col 0, score 0.85)
- [DSL — L414](chunks/dsl.md#^ref-e87bc036-414-0) (line 414, col 0, score 1)
- [Dynamic Context Model for Web Components — L1664](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1664-0) (line 1664, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L241](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-241-0) (line 241, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L233](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-233-0) (line 233, col 0, score 1)
- [plan-update-confirmation — L1884](plan-update-confirmation.md#^ref-b22d79c6-1884-0) (line 1884, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L550](promethean-copilot-intent-engine.md#^ref-ae24a280-550-0) (line 550, col 0, score 1)
- [Promethean State Format — L434](promethean-state-format.md#^ref-23df6ddb-434-0) (line 434, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L575](protocol-0-the-contradiction-engine.md#^ref-9a93a756-575-0) (line 575, col 0, score 1)
- [DSL — L273](chunks/dsl.md#^ref-e87bc036-273-0) (line 273, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L391](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-391-0) (line 391, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L338](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-338-0) (line 338, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L520](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-520-0) (line 520, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L1185](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-1185-0) (line 1185, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L221](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-221-0) (line 221, col 0, score 0.99)
- [Model Selection for Lightweight Conversational Tasks — L316](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-316-0) (line 316, col 0, score 0.99)
- [Services — L319](chunks/services.md#^ref-75ea4a6a-319-0) (line 319, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L392](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-392-0) (line 392, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L339](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-339-0) (line 339, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L521](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-521-0) (line 521, col 0, score 1)
- [plan-update-confirmation — L2096](plan-update-confirmation.md#^ref-b22d79c6-2096-0) (line 2096, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L517](promethean-copilot-intent-engine.md#^ref-ae24a280-517-0) (line 517, col 0, score 1)
- [Promethean State Format — L412](promethean-state-format.md#^ref-23df6ddb-412-0) (line 412, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L652](protocol-0-the-contradiction-engine.md#^ref-9a93a756-652-0) (line 652, col 0, score 1)
- [ts-to-lisp-transpiler — L193](ts-to-lisp-transpiler.md#^ref-ba11486b-193-0) (line 193, col 0, score 1)
- [DSL — L274](chunks/dsl.md#^ref-e87bc036-274-0) (line 274, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L393](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-393-0) (line 393, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L340](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-340-0) (line 340, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L522](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-522-0) (line 522, col 0, score 1)
- [plan-update-confirmation — L2097](plan-update-confirmation.md#^ref-b22d79c6-2097-0) (line 2097, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L518](promethean-copilot-intent-engine.md#^ref-ae24a280-518-0) (line 518, col 0, score 1)
- [Promethean State Format — L413](promethean-state-format.md#^ref-23df6ddb-413-0) (line 413, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L653](protocol-0-the-contradiction-engine.md#^ref-9a93a756-653-0) (line 653, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L394](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-394-0) (line 394, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L341](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-341-0) (line 341, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L523](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-523-0) (line 523, col 0, score 1)
- [plan-update-confirmation — L2098](plan-update-confirmation.md#^ref-b22d79c6-2098-0) (line 2098, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L519](promethean-copilot-intent-engine.md#^ref-ae24a280-519-0) (line 519, col 0, score 1)
- [Promethean State Format — L414](promethean-state-format.md#^ref-23df6ddb-414-0) (line 414, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L654](protocol-0-the-contradiction-engine.md#^ref-9a93a756-654-0) (line 654, col 0, score 1)
- [ts-to-lisp-transpiler — L195](ts-to-lisp-transpiler.md#^ref-ba11486b-195-0) (line 195, col 0, score 1)
- [DSL — L276](chunks/dsl.md#^ref-e87bc036-276-0) (line 276, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L395](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-395-0) (line 395, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L342](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-342-0) (line 342, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L524](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-524-0) (line 524, col 0, score 1)
- [plan-update-confirmation — L2099](plan-update-confirmation.md#^ref-b22d79c6-2099-0) (line 2099, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L520](promethean-copilot-intent-engine.md#^ref-ae24a280-520-0) (line 520, col 0, score 1)
- [Promethean State Format — L415](promethean-state-format.md#^ref-23df6ddb-415-0) (line 415, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L655](protocol-0-the-contradiction-engine.md#^ref-9a93a756-655-0) (line 655, col 0, score 1)
- [DSL — L278](chunks/dsl.md#^ref-e87bc036-278-0) (line 278, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L344](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-344-0) (line 344, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L526](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-526-0) (line 526, col 0, score 1)
- [plan-update-confirmation — L2101](plan-update-confirmation.md#^ref-b22d79c6-2101-0) (line 2101, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L522](promethean-copilot-intent-engine.md#^ref-ae24a280-522-0) (line 522, col 0, score 1)
- [Promethean State Format — L417](promethean-state-format.md#^ref-23df6ddb-417-0) (line 417, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L657](protocol-0-the-contradiction-engine.md#^ref-9a93a756-657-0) (line 657, col 0, score 1)
- [ts-to-lisp-transpiler — L198](ts-to-lisp-transpiler.md#^ref-ba11486b-198-0) (line 198, col 0, score 1)
- [DSL — L279](chunks/dsl.md#^ref-e87bc036-279-0) (line 279, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L397](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-397-0) (line 397, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L527](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-527-0) (line 527, col 0, score 1)
- [plan-update-confirmation — L2102](plan-update-confirmation.md#^ref-b22d79c6-2102-0) (line 2102, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L523](promethean-copilot-intent-engine.md#^ref-ae24a280-523-0) (line 523, col 0, score 1)
- [Promethean State Format — L418](promethean-state-format.md#^ref-23df6ddb-418-0) (line 418, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L658](protocol-0-the-contradiction-engine.md#^ref-9a93a756-658-0) (line 658, col 0, score 1)
- [ts-to-lisp-transpiler — L199](ts-to-lisp-transpiler.md#^ref-ba11486b-199-0) (line 199, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L503](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-503-0) (line 503, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L524](promethean-copilot-intent-engine.md#^ref-ae24a280-524-0) (line 524, col 0, score 1)
- [ts-to-lisp-transpiler — L227](ts-to-lisp-transpiler.md#^ref-ba11486b-227-0) (line 227, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L525](promethean-copilot-intent-engine.md#^ref-ae24a280-525-0) (line 525, col 0, score 1)
- [DSL — L280](chunks/dsl.md#^ref-e87bc036-280-0) (line 280, col 0, score 0.98)
- [Obsidian ChatGPT Plugin Integration Guide — L398](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-398-0) (line 398, col 0, score 0.98)
- [Obsidian ChatGPT Plugin Integration — L345](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-345-0) (line 345, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L1343](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1343-0) (line 1343, col 0, score 0.98)
- [Obsidian ChatGPT Plugin Integration Guide — L262](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-262-0) (line 262, col 0, score 0.98)
- [Obsidian ChatGPT Plugin Integration — L261](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-261-0) (line 261, col 0, score 0.98)
- [plan-update-confirmation — L1915](plan-update-confirmation.md#^ref-b22d79c6-1915-0) (line 1915, col 0, score 0.98)
- [Obsidian Templating Plugins Integration Guide — L505](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-505-0) (line 505, col 0, score 1)
- [ts-to-lisp-transpiler — L230](ts-to-lisp-transpiler.md#^ref-ba11486b-230-0) (line 230, col 0, score 1)
- [The Jar of Echoes — L4431](the-jar-of-echoes.md#^ref-18138627-4431-0) (line 4431, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L2023](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2023-0) (line 2023, col 0, score 0.98)
- [The Jar of Echoes — L4394](the-jar-of-echoes.md#^ref-18138627-4394-0) (line 4394, col 0, score 0.96)
- [Prompt_Folder_Bootstrap — L564](prompt-folder-bootstrap.md#^ref-bd4f0976-564-0) (line 564, col 0, score 0.96)
- [windows-tiling-with-autohotkey — L2003](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2003-0) (line 2003, col 0, score 0.97)
- [Canonical Org-Babel Matplotlib Animation Template — L590](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-590-0) (line 590, col 0, score 0.94)
- [Creative Moments — L526](creative-moments.md#^ref-10d98225-526-0) (line 526, col 0, score 0.94)
- [Duck's Attractor States — L1089](ducks-attractor-states.md#^ref-13951643-1089-0) (line 1089, col 0, score 0.94)
- [eidolon-field-math-foundations — L1063](eidolon-field-math-foundations.md#^ref-008f2ac0-1063-0) (line 1063, col 0, score 0.94)
- [Functional Refactor of TypeScript Document Processing — L893](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-893-0) (line 893, col 0, score 0.94)
- [Promethean Chat Activity Report — L544](promethean-chat-activity-report.md#^ref-18344cf9-544-0) (line 544, col 0, score 0.94)
- [Promethean Dev Workflow Update — L766](promethean-dev-workflow-update.md#^ref-03a5578f-766-0) (line 766, col 0, score 0.94)
- [Obsidian Templating Plugins Integration Guide — L507](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-507-0) (line 507, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L528](promethean-copilot-intent-engine.md#^ref-ae24a280-528-0) (line 528, col 0, score 1)
- [ts-to-lisp-transpiler — L231](ts-to-lisp-transpiler.md#^ref-ba11486b-231-0) (line 231, col 0, score 1)
- [The Jar of Echoes — L442](the-jar-of-echoes.md#^ref-18138627-442-0) (line 442, col 0, score 1)
- [Prometheus Observability Stack — L769](prometheus-observability-stack.md#^ref-e90b5a16-769-0) (line 769, col 0, score 1)
- [Diagrams — L246](chunks/diagrams.md#^ref-45cd25b5-246-0) (line 246, col 0, score 1)
- [eidolon-node-lifecycle — L208](eidolon-node-lifecycle.md#^ref-938eca9c-208-0) (line 208, col 0, score 1)
- [field-node-diagram-outline — L397](field-node-diagram-outline.md#^ref-1f32c94a-397-0) (line 397, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L508](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-508-0) (line 508, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L529](promethean-copilot-intent-engine.md#^ref-ae24a280-529-0) (line 529, col 0, score 1)
- [ts-to-lisp-transpiler — L232](ts-to-lisp-transpiler.md#^ref-ba11486b-232-0) (line 232, col 0, score 1)
- [The Jar of Echoes — L443](the-jar-of-echoes.md#^ref-18138627-443-0) (line 443, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L614](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-614-0) (line 614, col 0, score 0.99)
- [eidolon-node-lifecycle — L209](eidolon-node-lifecycle.md#^ref-938eca9c-209-0) (line 209, col 0, score 0.99)
- [field-node-diagram-outline — L398](field-node-diagram-outline.md#^ref-1f32c94a-398-0) (line 398, col 0, score 0.99)
- [field-node-diagram-set — L456](field-node-diagram-set.md#^ref-22b989d5-456-0) (line 456, col 0, score 0.99)
- [field-node-diagram-visualizations — L329](field-node-diagram-visualizations.md#^ref-e9b27b06-329-0) (line 329, col 0, score 0.99)
- [Obsidian Templating Plugins Integration Guide — L509](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-509-0) (line 509, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L530](promethean-copilot-intent-engine.md#^ref-ae24a280-530-0) (line 530, col 0, score 1)
- [ts-to-lisp-transpiler — L233](ts-to-lisp-transpiler.md#^ref-ba11486b-233-0) (line 233, col 0, score 1)
- [The Jar of Echoes — L444](the-jar-of-echoes.md#^ref-18138627-444-0) (line 444, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L615](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-615-0) (line 615, col 0, score 0.99)
- [field-node-diagram-outline — L399](field-node-diagram-outline.md#^ref-1f32c94a-399-0) (line 399, col 0, score 0.99)
- [field-node-diagram-set — L457](field-node-diagram-set.md#^ref-22b989d5-457-0) (line 457, col 0, score 0.99)
- [field-node-diagram-visualizations — L330](field-node-diagram-visualizations.md#^ref-e9b27b06-330-0) (line 330, col 0, score 0.99)
- [Obsidian Templating Plugins Integration Guide — L510](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-510-0) (line 510, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L531](promethean-copilot-intent-engine.md#^ref-ae24a280-531-0) (line 531, col 0, score 1)
- [ts-to-lisp-transpiler — L234](ts-to-lisp-transpiler.md#^ref-ba11486b-234-0) (line 234, col 0, score 1)
- [The Jar of Echoes — L445](the-jar-of-echoes.md#^ref-18138627-445-0) (line 445, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L616](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-616-0) (line 616, col 0, score 1)
- [Diagrams — L248](chunks/diagrams.md#^ref-45cd25b5-248-0) (line 248, col 0, score 1)
- [eidolon-node-lifecycle — L210](eidolon-node-lifecycle.md#^ref-938eca9c-210-0) (line 210, col 0, score 1)
- [field-node-diagram-outline — L400](field-node-diagram-outline.md#^ref-1f32c94a-400-0) (line 400, col 0, score 1)
- [Promethean Notes — L154](promethean-notes.md#^ref-1c4046b5-154-0) (line 154, col 0, score 1)
- [Prompt_Folder_Bootstrap — L864](prompt-folder-bootstrap.md#^ref-bd4f0976-864-0) (line 864, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L584](protocol-0-the-contradiction-engine.md#^ref-9a93a756-584-0) (line 584, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L704](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-704-0) (line 704, col 0, score 1)
- [Pure TypeScript Search Microservice — L1036](pure-typescript-search-microservice.md#^ref-d17d3a96-1036-0) (line 1036, col 0, score 1)
- [Reawakening Duck — L529](reawakening-duck.md#^ref-59b5670f-529-0) (line 529, col 0, score 1)
- [Redirecting Standard Error — L199](redirecting-standard-error.md#^ref-b3555ede-199-0) (line 199, col 0, score 1)
- [schema-evolution-workflow — L1240](schema-evolution-workflow.md#^ref-d8059b6a-1240-0) (line 1240, col 0, score 1)
- [Self-Agency in AI Interaction — L328](self-agency-in-ai-interaction.md#^ref-49a9a860-328-0) (line 328, col 0, score 1)
- [Operations — L85](chunks/operations.md#^ref-f1add613-85-0) (line 85, col 0, score 1)
- [Shared — L207](chunks/shared.md#^ref-623a55f7-207-0) (line 207, col 0, score 1)
- [Window Management — L261](chunks/window-management.md#^ref-9e8ae388-261-0) (line 261, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L435](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-435-0) (line 435, col 0, score 1)
- [DuckDuckGoSearchPipeline — L103](duckduckgosearchpipeline.md#^ref-e979c50f-103-0) (line 103, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L326](ducks-self-referential-perceptual-loop.md#^ref-71726f04-326-0) (line 326, col 0, score 1)
- [Dynamic Context Model for Web Components — L1415](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1415-0) (line 1415, col 0, score 1)
- [Factorio AI with External Agents — L618](factorio-ai-with-external-agents.md#^ref-a4d90289-618-0) (line 618, col 0, score 1)
- [field-dynamics-math-blocks — L907](field-dynamics-math-blocks.md#^ref-7cfc230d-907-0) (line 907, col 0, score 1)
- [Fnord Tracer Protocol — L885](fnord-tracer-protocol.md#^ref-fc21f824-885-0) (line 885, col 0, score 1)
- [graph-ds — L842](graph-ds.md#^ref-6620e2f2-842-0) (line 842, col 0, score 1)
- [i3-bluetooth-setup — L537](i3-bluetooth-setup.md#^ref-5e408692-537-0) (line 537, col 0, score 1)
- [Pure TypeScript Search Microservice — L1038](pure-typescript-search-microservice.md#^ref-d17d3a96-1038-0) (line 1038, col 0, score 1)
- [Reawakening Duck — L531](reawakening-duck.md#^ref-59b5670f-531-0) (line 531, col 0, score 1)
- [Redirecting Standard Error — L201](redirecting-standard-error.md#^ref-b3555ede-201-0) (line 201, col 0, score 1)
- [schema-evolution-workflow — L1242](schema-evolution-workflow.md#^ref-d8059b6a-1242-0) (line 1242, col 0, score 1)
- [Self-Agency in AI Interaction — L330](self-agency-in-ai-interaction.md#^ref-49a9a860-330-0) (line 330, col 0, score 1)
- [sibilant-macro-targets — L900](sibilant-macro-targets.md#^ref-c5c9a5c6-900-0) (line 900, col 0, score 1)
- [Stateful Partitions and Rebalancing — L1250](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-1250-0) (line 1250, col 0, score 1)
- [unique-templates — L96](templates/unique-templates.md#^ref-c26f0044-96-0) (line 96, col 0, score 1)
- [The Jar of Echoes — L511](the-jar-of-echoes.md#^ref-18138627-511-0) (line 511, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L874](chroma-toolkit-consolidation-plan.md#^ref-5020e892-874-0) (line 874, col 0, score 1)
- [Shared — L209](chunks/shared.md#^ref-623a55f7-209-0) (line 209, col 0, score 1)
- [Window Management — L263](chunks/window-management.md#^ref-9e8ae388-263-0) (line 263, col 0, score 1)
- [DuckDuckGoSearchPipeline — L105](duckduckgosearchpipeline.md#^ref-e979c50f-105-0) (line 105, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L328](ducks-self-referential-perceptual-loop.md#^ref-71726f04-328-0) (line 328, col 0, score 1)
- [Dynamic Context Model for Web Components — L1417](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1417-0) (line 1417, col 0, score 1)
- [Factorio AI with External Agents — L620](factorio-ai-with-external-agents.md#^ref-a4d90289-620-0) (line 620, col 0, score 1)
- [field-interaction-equations — L919](field-interaction-equations.md#^ref-b09141b7-919-0) (line 919, col 0, score 1)
- [Fnord Tracer Protocol — L887](fnord-tracer-protocol.md#^ref-fc21f824-887-0) (line 887, col 0, score 1)
- [homeostasis-decay-formulas — L942](homeostasis-decay-formulas.md#^ref-37b5d236-942-0) (line 942, col 0, score 1)
- [komorebi-group-window-hack — L557](komorebi-group-window-hack.md#^ref-dd89372d-557-0) (line 557, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L661](layer1survivabilityenvelope.md#^ref-64a9f9f9-661-0) (line 661, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L875](chroma-toolkit-consolidation-plan.md#^ref-5020e892-875-0) (line 875, col 0, score 1)
- [JavaScript — L451](chunks/javascript.md#^ref-c1618c66-451-0) (line 451, col 0, score 1)
- [Math Fundamentals — L394](chunks/math-fundamentals.md#^ref-c6e87433-394-0) (line 394, col 0, score 1)
- [Operations — L88](chunks/operations.md#^ref-f1add613-88-0) (line 88, col 0, score 1)
- [Services — L361](chunks/services.md#^ref-75ea4a6a-361-0) (line 361, col 0, score 1)
- [Shared — L210](chunks/shared.md#^ref-623a55f7-210-0) (line 210, col 0, score 1)
- [Window Management — L264](chunks/window-management.md#^ref-9e8ae388-264-0) (line 264, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L438](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-438-0) (line 438, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L329](ducks-self-referential-perceptual-loop.md#^ref-71726f04-329-0) (line 329, col 0, score 1)
- [Dynamic Context Model for Web Components — L1418](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1418-0) (line 1418, col 0, score 1)
- [Factorio AI with External Agents — L621](factorio-ai-with-external-agents.md#^ref-a4d90289-621-0) (line 621, col 0, score 1)
- [field-dynamics-math-blocks — L910](field-dynamics-math-blocks.md#^ref-7cfc230d-910-0) (line 910, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L907](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-907-0) (line 907, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L709](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-709-0) (line 709, col 0, score 1)
- [Pure TypeScript Search Microservice — L1041](pure-typescript-search-microservice.md#^ref-d17d3a96-1041-0) (line 1041, col 0, score 0.96)
- [Reawakening Duck — L534](reawakening-duck.md#^ref-59b5670f-534-0) (line 534, col 0, score 0.96)
- [Redirecting Standard Error — L204](redirecting-standard-error.md#^ref-b3555ede-204-0) (line 204, col 0, score 0.96)
- [schema-evolution-workflow — L1245](schema-evolution-workflow.md#^ref-d8059b6a-1245-0) (line 1245, col 0, score 0.96)
- [Self-Agency in AI Interaction — L333](self-agency-in-ai-interaction.md#^ref-49a9a860-333-0) (line 333, col 0, score 0.96)
- [sibilant-macro-targets — L903](sibilant-macro-targets.md#^ref-c5c9a5c6-903-0) (line 903, col 0, score 0.96)
- [Stateful Partitions and Rebalancing — L1253](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-1253-0) (line 1253, col 0, score 0.96)
- [promethean-requirements — L132](promethean-requirements.md#^ref-95205cd3-132-0) (line 132, col 0, score 1)
- [Prometheus Observability Stack — L877](prometheus-observability-stack.md#^ref-e90b5a16-877-0) (line 877, col 0, score 1)
- [Prompt_Folder_Bootstrap — L870](prompt-folder-bootstrap.md#^ref-bd4f0976-870-0) (line 870, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L590](protocol-0-the-contradiction-engine.md#^ref-9a93a756-590-0) (line 590, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L710](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-710-0) (line 710, col 0, score 1)
- [Pure TypeScript Search Microservice — L1042](pure-typescript-search-microservice.md#^ref-d17d3a96-1042-0) (line 1042, col 0, score 1)
- [Reawakening Duck — L535](reawakening-duck.md#^ref-59b5670f-535-0) (line 535, col 0, score 1)
- [Redirecting Standard Error — L205](redirecting-standard-error.md#^ref-b3555ede-205-0) (line 205, col 0, score 1)
- [schema-evolution-workflow — L1246](schema-evolution-workflow.md#^ref-d8059b6a-1246-0) (line 1246, col 0, score 1)
- [Self-Agency in AI Interaction — L334](self-agency-in-ai-interaction.md#^ref-49a9a860-334-0) (line 334, col 0, score 1)
- [Pure TypeScript Search Microservice — L1043](pure-typescript-search-microservice.md#^ref-d17d3a96-1043-0) (line 1043, col 0, score 1)
- [Reawakening Duck — L536](reawakening-duck.md#^ref-59b5670f-536-0) (line 536, col 0, score 1)
- [Redirecting Standard Error — L206](redirecting-standard-error.md#^ref-b3555ede-206-0) (line 206, col 0, score 1)
- [schema-evolution-workflow — L1247](schema-evolution-workflow.md#^ref-d8059b6a-1247-0) (line 1247, col 0, score 1)
- [Self-Agency in AI Interaction — L335](self-agency-in-ai-interaction.md#^ref-49a9a860-335-0) (line 335, col 0, score 1)
- [sibilant-macro-targets — L905](sibilant-macro-targets.md#^ref-c5c9a5c6-905-0) (line 905, col 0, score 1)
- [Stateful Partitions and Rebalancing — L1255](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-1255-0) (line 1255, col 0, score 1)
- [unique-templates — L101](templates/unique-templates.md#^ref-c26f0044-101-0) (line 101, col 0, score 1)
- [The Jar of Echoes — L516](the-jar-of-echoes.md#^ref-18138627-516-0) (line 516, col 0, score 1)
- [Creative Moments — L164](creative-moments.md#^ref-10d98225-164-0) (line 164, col 0, score 1)
- [Duck's Attractor States — L353](ducks-attractor-states.md#^ref-13951643-353-0) (line 353, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L519](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-519-0) (line 519, col 0, score 1)
- [OpenAPI Validation Report — L145](openapi-validation-report.md#^ref-5c152b08-145-0) (line 145, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L910](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-910-0) (line 910, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L1080](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-1080-0) (line 1080, col 0, score 1)
- [plan-update-confirmation — L1909](plan-update-confirmation.md#^ref-b22d79c6-1909-0) (line 1909, col 0, score 1)
- [polyglot-repl-interface-layer — L566](polyglot-repl-interface-layer.md#^ref-9c79206d-566-0) (line 566, col 0, score 1)
- [Promethean Dev Workflow Update — L518](promethean-dev-workflow-update.md#^ref-03a5578f-518-0) (line 518, col 0, score 1)
- [Promethean Documentation Update — L142](promethean-documentation-update.txt#^ref-0b872af2-142-0) (line 142, col 0, score 1)
- [Pure TypeScript Search Microservice — L1044](pure-typescript-search-microservice.md#^ref-d17d3a96-1044-0) (line 1044, col 0, score 1)
- [Mathematical Samplers — L293](mathematical-samplers.md#^ref-86a691ec-293-0) (line 293, col 0, score 0.99)
- [Debugging Broker Connections and Agent Behavior — L444](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-444-0) (line 444, col 0, score 1)
- [DuckDuckGoSearchPipeline — L112](duckduckgosearchpipeline.md#^ref-e979c50f-112-0) (line 112, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L335](ducks-self-referential-perceptual-loop.md#^ref-71726f04-335-0) (line 335, col 0, score 1)
- [Dynamic Context Model for Web Components — L1627](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1627-0) (line 1627, col 0, score 1)
- [Factorio AI with External Agents — L627](factorio-ai-with-external-agents.md#^ref-a4d90289-627-0) (line 627, col 0, score 1)
- [i3-bluetooth-setup — L546](i3-bluetooth-setup.md#^ref-5e408692-546-0) (line 546, col 0, score 1)
- [komorebi-group-window-hack — L564](komorebi-group-window-hack.md#^ref-dd89372d-564-0) (line 564, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L668](layer1survivabilityenvelope.md#^ref-64a9f9f9-668-0) (line 668, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1589](migrate-to-provider-tenant-architecture.md#^ref-54382370-1589-0) (line 1589, col 0, score 1)
- [Mindful Prioritization — L106](mindful-prioritization.md#^ref-40185d05-106-0) (line 106, col 0, score 1)
- [Duck's Attractor States — L356](ducks-attractor-states.md#^ref-13951643-356-0) (line 356, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L336](ducks-self-referential-perceptual-loop.md#^ref-71726f04-336-0) (line 336, col 0, score 1)
- [Dynamic Context Model for Web Components — L1628](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1628-0) (line 1628, col 0, score 1)
- [Fnord Tracer Protocol — L895](fnord-tracer-protocol.md#^ref-fc21f824-895-0) (line 895, col 0, score 1)
- [graph-ds — L852](graph-ds.md#^ref-6620e2f2-852-0) (line 852, col 0, score 1)
- [i3-bluetooth-setup — L547](i3-bluetooth-setup.md#^ref-5e408692-547-0) (line 547, col 0, score 1)
- [komorebi-group-window-hack — L565](komorebi-group-window-hack.md#^ref-dd89372d-565-0) (line 565, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L669](layer1survivabilityenvelope.md#^ref-64a9f9f9-669-0) (line 669, col 0, score 1)
- [Factorio AI with External Agents — L302](factorio-ai-with-external-agents.md#^ref-a4d90289-302-0) (line 302, col 0, score 1)
- [i3-bluetooth-setup — L548](i3-bluetooth-setup.md#^ref-5e408692-548-0) (line 548, col 0, score 1)
- [komorebi-group-window-hack — L566](komorebi-group-window-hack.md#^ref-dd89372d-566-0) (line 566, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L670](layer1survivabilityenvelope.md#^ref-64a9f9f9-670-0) (line 670, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1591](migrate-to-provider-tenant-architecture.md#^ref-54382370-1591-0) (line 1591, col 0, score 1)
- [Mindful Prioritization — L108](mindful-prioritization.md#^ref-40185d05-108-0) (line 108, col 0, score 1)
- [MindfulRobotIntegration — L108](mindfulrobotintegration.md#^ref-5f65dfa5-108-0) (line 108, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L169](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-169-0) (line 169, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L435](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-435-0) (line 435, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L402](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-402-0) (line 402, col 0, score 1)
- [Promethean Dev Workflow Update — L503](promethean-dev-workflow-update.md#^ref-03a5578f-503-0) (line 503, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L740](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-740-0) (line 740, col 0, score 1)
- [Promethean Documentation Update — L90](promethean-documentation-update.md#^ref-c0392040-90-0) (line 90, col 0, score 1)
- [Promethean Documentation Update — L147](promethean-documentation-update.txt#^ref-0b872af2-147-0) (line 147, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L310](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-310-0) (line 310, col 0, score 1)
- [Promethean Infrastructure Setup — L1581](promethean-infrastructure-setup.md#^ref-6deed6ac-1581-0) (line 1581, col 0, score 1)
- [Promethean Notes — L167](promethean-notes.md#^ref-1c4046b5-167-0) (line 167, col 0, score 1)
- [promethean-requirements — L139](promethean-requirements.md#^ref-95205cd3-139-0) (line 139, col 0, score 1)
- [Promethean Workflow Optimization — L183](promethean-workflow-optimization.md#^ref-d614d983-183-0) (line 183, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L311](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-311-0) (line 311, col 0, score 1)
- [Promethean Notes — L168](promethean-notes.md#^ref-1c4046b5-168-0) (line 168, col 0, score 1)
- [promethean-requirements — L140](promethean-requirements.md#^ref-95205cd3-140-0) (line 140, col 0, score 1)
- [Promethean Workflow Optimization — L184](promethean-workflow-optimization.md#^ref-d614d983-184-0) (line 184, col 0, score 1)
- [Prometheus Observability Stack — L1065](prometheus-observability-stack.md#^ref-e90b5a16-1065-0) (line 1065, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L597](protocol-0-the-contradiction-engine.md#^ref-9a93a756-597-0) (line 597, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L717](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-717-0) (line 717, col 0, score 1)
- [Pure TypeScript Search Microservice — L1251](pure-typescript-search-microservice.md#^ref-d17d3a96-1251-0) (line 1251, col 0, score 1)
- [Reawakening Duck — L542](reawakening-duck.md#^ref-59b5670f-542-0) (line 542, col 0, score 1)
- [OpenAPI Validation Report — L152](openapi-validation-report.md#^ref-5c152b08-152-0) (line 152, col 0, score 1)
- [plan-update-confirmation — L2079](plan-update-confirmation.md#^ref-b22d79c6-2079-0) (line 2079, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L420](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-420-0) (line 420, col 0, score 1)
- [Promethean Chat Activity Report — L200](promethean-chat-activity-report.md#^ref-18344cf9-200-0) (line 200, col 0, score 1)
- [Promethean Data Sync Protocol — L91](promethean-data-sync-protocol.md#^ref-9fab9e76-91-0) (line 91, col 0, score 1)
- [Promethean Dev Workflow Update — L505](promethean-dev-workflow-update.md#^ref-03a5578f-505-0) (line 505, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L742](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-742-0) (line 742, col 0, score 1)
- [Promethean Documentation Update — L92](promethean-documentation-update.md#^ref-c0392040-92-0) (line 92, col 0, score 1)
- [plan-update-confirmation — L2080](plan-update-confirmation.md#^ref-b22d79c6-2080-0) (line 2080, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L421](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-421-0) (line 421, col 0, score 1)
- [Promethean Chat Activity Report — L201](promethean-chat-activity-report.md#^ref-18344cf9-201-0) (line 201, col 0, score 1)
- [Promethean Data Sync Protocol — L92](promethean-data-sync-protocol.md#^ref-9fab9e76-92-0) (line 92, col 0, score 1)
- [Promethean Dev Workflow Update — L506](promethean-dev-workflow-update.md#^ref-03a5578f-506-0) (line 506, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L743](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-743-0) (line 743, col 0, score 1)
- [Promethean Documentation Update — L93](promethean-documentation-update.md#^ref-c0392040-93-0) (line 93, col 0, score 1)
- [Promethean Documentation Update — L150](promethean-documentation-update.txt#^ref-0b872af2-150-0) (line 150, col 0, score 1)
- [Promethean Notes — L171](promethean-notes.md#^ref-1c4046b5-171-0) (line 171, col 0, score 1)
- [promethean-requirements — L143](promethean-requirements.md#^ref-95205cd3-143-0) (line 143, col 0, score 1)
- [Promethean Workflow Optimization — L187](promethean-workflow-optimization.md#^ref-d614d983-187-0) (line 187, col 0, score 1)
- [Prometheus Observability Stack — L1068](prometheus-observability-stack.md#^ref-e90b5a16-1068-0) (line 1068, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L599](protocol-0-the-contradiction-engine.md#^ref-9a93a756-599-0) (line 599, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L719](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-719-0) (line 719, col 0, score 1)
- [Pure TypeScript Search Microservice — L1253](pure-typescript-search-microservice.md#^ref-d17d3a96-1253-0) (line 1253, col 0, score 1)
- [Reawakening Duck — L544](reawakening-duck.md#^ref-59b5670f-544-0) (line 544, col 0, score 1)
- [Redirecting Standard Error — L214](redirecting-standard-error.md#^ref-b3555ede-214-0) (line 214, col 0, score 1)
- [Promethean Documentation Update — L153](promethean-documentation-update.txt#^ref-0b872af2-153-0) (line 153, col 0, score 1)
- [promethean-requirements — L145](promethean-requirements.md#^ref-95205cd3-145-0) (line 145, col 0, score 1)
- [Promethean Workflow Optimization — L189](promethean-workflow-optimization.md#^ref-d614d983-189-0) (line 189, col 0, score 1)
- [Prometheus Observability Stack — L1070](prometheus-observability-stack.md#^ref-e90b5a16-1070-0) (line 1070, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L601](protocol-0-the-contradiction-engine.md#^ref-9a93a756-601-0) (line 601, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L721](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-721-0) (line 721, col 0, score 1)
- [Pure TypeScript Search Microservice — L1255](pure-typescript-search-microservice.md#^ref-d17d3a96-1255-0) (line 1255, col 0, score 1)
- [Reawakening Duck — L546](reawakening-duck.md#^ref-59b5670f-546-0) (line 546, col 0, score 1)
- [Redirecting Standard Error — L216](redirecting-standard-error.md#^ref-b3555ede-216-0) (line 216, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L632](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-632-0) (line 632, col 0, score 1)
- [OpenAPI Validation Report — L156](openapi-validation-report.md#^ref-5c152b08-156-0) (line 156, col 0, score 1)
- [plan-update-confirmation — L2083](plan-update-confirmation.md#^ref-b22d79c6-2083-0) (line 2083, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L602](protocol-0-the-contradiction-engine.md#^ref-9a93a756-602-0) (line 602, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L722](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-722-0) (line 722, col 0, score 1)
- [Pure TypeScript Search Microservice — L1256](pure-typescript-search-microservice.md#^ref-d17d3a96-1256-0) (line 1256, col 0, score 1)
- [Reawakening Duck — L547](reawakening-duck.md#^ref-59b5670f-547-0) (line 547, col 0, score 1)
- [Redirecting Standard Error — L217](redirecting-standard-error.md#^ref-b3555ede-217-0) (line 217, col 0, score 1)
- [Duck's Attractor States — L365](ducks-attractor-states.md#^ref-13951643-365-0) (line 365, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L346](ducks-self-referential-perceptual-loop.md#^ref-71726f04-346-0) (line 346, col 0, score 1)
- [komorebi-group-window-hack — L574](komorebi-group-window-hack.md#^ref-dd89372d-574-0) (line 574, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L678](layer1survivabilityenvelope.md#^ref-64a9f9f9-678-0) (line 678, col 0, score 1)
- [Mindful Prioritization — L116](mindful-prioritization.md#^ref-40185d05-116-0) (line 116, col 0, score 1)
- [MindfulRobotIntegration — L116](mindfulrobotintegration.md#^ref-5f65dfa5-116-0) (line 116, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L177](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-177-0) (line 177, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L633](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-633-0) (line 633, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L435](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-435-0) (line 435, col 0, score 1)
- [Promethean Data Sync Protocol — L97](promethean-data-sync-protocol.md#^ref-9fab9e76-97-0) (line 97, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L748](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-748-0) (line 748, col 0, score 1)
- [Promethean Documentation Update — L98](promethean-documentation-update.md#^ref-c0392040-98-0) (line 98, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L318](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-318-0) (line 318, col 0, score 1)
- [api-gateway-versioning — L293](api-gateway-versioning.md#^ref-0580dcd3-293-0) (line 293, col 0, score 1)
- [Admin Dashboard for User Management — L478](admin-dashboard-for-user-management.md#^ref-2901a3e9-478-0) (line 478, col 0, score 1)
- [balanced-bst — L315](balanced-bst.md#^ref-d3e7db72-315-0) (line 315, col 0, score 1)
- [Board Automation Improvements — L27](board-automation-improvements.md#^ref-ac60a1d6-27-0) (line 27, col 0, score 1)
- [Creative Moments — L176](creative-moments.md#^ref-10d98225-176-0) (line 176, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L455](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-455-0) (line 455, col 0, score 1)
- [DuckDuckGoSearchPipeline — L123](duckduckgosearchpipeline.md#^ref-e979c50f-123-0) (line 123, col 0, score 1)
- [Duck's Attractor States — L366](ducks-attractor-states.md#^ref-13951643-366-0) (line 366, col 0, score 1)
- [Factorio AI with External Agents — L632](factorio-ai-with-external-agents.md#^ref-a4d90289-632-0) (line 632, col 0, score 1)
- [graph-ds — L829](graph-ds.md#^ref-6620e2f2-829-0) (line 829, col 0, score 1)
- [Dynamic Context Model for Web Components — L1638](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1638-0) (line 1638, col 0, score 1)
- [Fnord Tracer Protocol — L906](fnord-tracer-protocol.md#^ref-fc21f824-906-0) (line 906, col 0, score 1)
- [graph-ds — L830](graph-ds.md#^ref-6620e2f2-830-0) (line 830, col 0, score 1)
- [i3-bluetooth-setup — L558](i3-bluetooth-setup.md#^ref-5e408692-558-0) (line 558, col 0, score 1)
- [komorebi-group-window-hack — L576](komorebi-group-window-hack.md#^ref-dd89372d-576-0) (line 576, col 0, score 1)
- [Mindful Prioritization — L118](mindful-prioritization.md#^ref-40185d05-118-0) (line 118, col 0, score 1)
- [MindfulRobotIntegration — L118](mindfulrobotintegration.md#^ref-5f65dfa5-118-0) (line 118, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L485](model-upgrade-calm-down-guide.md#^ref-db74343f-485-0) (line 485, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L179](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-179-0) (line 179, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L412](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-412-0) (line 412, col 0, score 1)
- [Obsidian Task Generation — L141](obsidian-task-generation.md#^ref-9b694a91-141-0) (line 141, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L635](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-635-0) (line 635, col 0, score 1)
- [OpenAPI Validation Report — L159](openapi-validation-report.md#^ref-5c152b08-159-0) (line 159, col 0, score 1)
- [Factorio AI with External Agents — L634](factorio-ai-with-external-agents.md#^ref-a4d90289-634-0) (line 634, col 0, score 1)
- [Fnord Tracer Protocol — L907](fnord-tracer-protocol.md#^ref-fc21f824-907-0) (line 907, col 0, score 1)
- [graph-ds — L831](graph-ds.md#^ref-6620e2f2-831-0) (line 831, col 0, score 1)
- [i3-bluetooth-setup — L559](i3-bluetooth-setup.md#^ref-5e408692-559-0) (line 559, col 0, score 1)
- [komorebi-group-window-hack — L577](komorebi-group-window-hack.md#^ref-dd89372d-577-0) (line 577, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L681](layer1survivabilityenvelope.md#^ref-64a9f9f9-681-0) (line 681, col 0, score 1)
- [Mindful Prioritization — L119](mindful-prioritization.md#^ref-40185d05-119-0) (line 119, col 0, score 1)
- [MindfulRobotIntegration — L119](mindfulrobotintegration.md#^ref-5f65dfa5-119-0) (line 119, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L486](model-upgrade-calm-down-guide.md#^ref-db74343f-486-0) (line 486, col 0, score 1)
- [Pure TypeScript Search Microservice — L1334](pure-typescript-search-microservice.md#^ref-d17d3a96-1334-0) (line 1334, col 0, score 0.87)
- [schema-evolution-workflow — L1345](schema-evolution-workflow.md#^ref-d8059b6a-1345-0) (line 1345, col 0, score 1)
- [Stateful Partitions and Rebalancing — L1317](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-1317-0) (line 1317, col 0, score 1)
- [typed-struct-compiler — L1010](typed-struct-compiler.md#^ref-78eeedf7-1010-0) (line 1010, col 0, score 0.87)
- [TypeScript Patch for Tool Calling Support — L1222](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-1222-0) (line 1222, col 0, score 0.87)
- [Unique Concepts — L169](unique-concepts.md#^ref-ed6f3fc9-169-0) (line 169, col 0, score 0.87)
- [Unique Info Dump Index — L1214](unique-info-dump-index.md#^ref-30ec3ba6-1214-0) (line 1214, col 0, score 0.87)
- [zero-copy-snapshots-and-workers — L1053](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-1053-0) (line 1053, col 0, score 0.87)
- [Canonical Org-Babel Matplotlib Animation Template — L509](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-509-0) (line 509, col 0, score 0.87)
- [Creative Moments — L246](creative-moments.md#^ref-10d98225-246-0) (line 246, col 0, score 0.87)
- [Promethean Infrastructure Setup — L1591](promethean-infrastructure-setup.md#^ref-6deed6ac-1591-0) (line 1591, col 0, score 1)
- [Promethean Notes — L178](promethean-notes.md#^ref-1c4046b5-178-0) (line 178, col 0, score 1)
- [promethean-requirements — L150](promethean-requirements.md#^ref-95205cd3-150-0) (line 150, col 0, score 1)
- [Promethean Workflow Optimization — L194](promethean-workflow-optimization.md#^ref-d614d983-194-0) (line 194, col 0, score 1)
- [Prometheus Observability Stack — L1075](prometheus-observability-stack.md#^ref-e90b5a16-1075-0) (line 1075, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L607](protocol-0-the-contradiction-engine.md#^ref-9a93a756-607-0) (line 607, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L727](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-727-0) (line 727, col 0, score 1)
- [Pure TypeScript Search Microservice — L1261](pure-typescript-search-microservice.md#^ref-d17d3a96-1261-0) (line 1261, col 0, score 1)
- [Reawakening Duck — L552](reawakening-duck.md#^ref-59b5670f-552-0) (line 552, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L460](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-460-0) (line 460, col 0, score 1)
- [graph-ds — L834](graph-ds.md#^ref-6620e2f2-834-0) (line 834, col 0, score 1)
- [i3-bluetooth-setup — L562](i3-bluetooth-setup.md#^ref-5e408692-562-0) (line 562, col 0, score 1)
- [komorebi-group-window-hack — L580](komorebi-group-window-hack.md#^ref-dd89372d-580-0) (line 580, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L684](layer1survivabilityenvelope.md#^ref-64a9f9f9-684-0) (line 684, col 0, score 1)
- [Mindful Prioritization — L122](mindful-prioritization.md#^ref-40185d05-122-0) (line 122, col 0, score 1)
- [MindfulRobotIntegration — L122](mindfulrobotintegration.md#^ref-5f65dfa5-122-0) (line 122, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L489](model-upgrade-calm-down-guide.md#^ref-db74343f-489-0) (line 489, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L183](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-183-0) (line 183, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L449](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-449-0) (line 449, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L416](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-416-0) (line 416, col 0, score 1)
- [Promethean Notes — L181](promethean-notes.md#^ref-1c4046b5-181-0) (line 181, col 0, score 1)
- [promethean-requirements — L153](promethean-requirements.md#^ref-95205cd3-153-0) (line 153, col 0, score 1)
- [Promethean Workflow Optimization — L197](promethean-workflow-optimization.md#^ref-d614d983-197-0) (line 197, col 0, score 1)
- [Prometheus Observability Stack — L1078](prometheus-observability-stack.md#^ref-e90b5a16-1078-0) (line 1078, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L610](protocol-0-the-contradiction-engine.md#^ref-9a93a756-610-0) (line 610, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L730](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-730-0) (line 730, col 0, score 1)
- [Pure TypeScript Search Microservice — L1264](pure-typescript-search-microservice.md#^ref-d17d3a96-1264-0) (line 1264, col 0, score 1)
- [Reawakening Duck — L555](reawakening-duck.md#^ref-59b5670f-555-0) (line 555, col 0, score 1)
- [Redirecting Standard Error — L225](redirecting-standard-error.md#^ref-b3555ede-225-0) (line 225, col 0, score 1)
- [Window Management — L288](chunks/window-management.md#^ref-9e8ae388-288-0) (line 288, col 0, score 1)
- [promethean-requirements — L154](promethean-requirements.md#^ref-95205cd3-154-0) (line 154, col 0, score 1)
- [Promethean Workflow Optimization — L198](promethean-workflow-optimization.md#^ref-d614d983-198-0) (line 198, col 0, score 1)
- [Prometheus Observability Stack — L1079](prometheus-observability-stack.md#^ref-e90b5a16-1079-0) (line 1079, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L611](protocol-0-the-contradiction-engine.md#^ref-9a93a756-611-0) (line 611, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L731](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-731-0) (line 731, col 0, score 1)
- [Pure TypeScript Search Microservice — L1265](pure-typescript-search-microservice.md#^ref-d17d3a96-1265-0) (line 1265, col 0, score 1)
- [Reawakening Duck — L556](reawakening-duck.md#^ref-59b5670f-556-0) (line 556, col 0, score 1)
- [Redirecting Standard Error — L226](redirecting-standard-error.md#^ref-b3555ede-226-0) (line 226, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L464](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-464-0) (line 464, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L493](model-upgrade-calm-down-guide.md#^ref-db74343f-493-0) (line 493, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L187](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-187-0) (line 187, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L453](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-453-0) (line 453, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L420](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-420-0) (line 420, col 0, score 1)
- [Obsidian Task Generation — L149](obsidian-task-generation.md#^ref-9b694a91-149-0) (line 149, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L643](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-643-0) (line 643, col 0, score 1)
- [OpenAPI Validation Report — L167](openapi-validation-report.md#^ref-5c152b08-167-0) (line 167, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L756](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-756-0) (line 756, col 0, score 1)
- [Promethean Documentation Update — L106](promethean-documentation-update.md#^ref-c0392040-106-0) (line 106, col 0, score 1)
- [plan-update-confirmation — L2112](plan-update-confirmation.md#^ref-b22d79c6-2112-0) (line 2112, col 0, score 1)
- [Promethean Data Sync Protocol — L106](promethean-data-sync-protocol.md#^ref-9fab9e76-106-0) (line 106, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L757](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-757-0) (line 757, col 0, score 1)
- [Promethean Documentation Update — L107](promethean-documentation-update.md#^ref-c0392040-107-0) (line 107, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L327](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-327-0) (line 327, col 0, score 1)
- [Promethean Notes — L184](promethean-notes.md#^ref-1c4046b5-184-0) (line 184, col 0, score 1)
- [promethean-requirements — L156](promethean-requirements.md#^ref-95205cd3-156-0) (line 156, col 0, score 1)
- [Promethean Workflow Optimization — L200](promethean-workflow-optimization.md#^ref-d614d983-200-0) (line 200, col 0, score 1)
- [Prometheus Observability Stack — L1081](prometheus-observability-stack.md#^ref-e90b5a16-1081-0) (line 1081, col 0, score 1)
- [Promethean Documentation Update — L164](promethean-documentation-update.txt#^ref-0b872af2-164-0) (line 164, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L328](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-328-0) (line 328, col 0, score 1)
- [Promethean Infrastructure Setup — L1599](promethean-infrastructure-setup.md#^ref-6deed6ac-1599-0) (line 1599, col 0, score 1)
- [Promethean Notes — L185](promethean-notes.md#^ref-1c4046b5-185-0) (line 185, col 0, score 1)
- [promethean-requirements — L157](promethean-requirements.md#^ref-95205cd3-157-0) (line 157, col 0, score 1)
- [Promethean Workflow Optimization — L201](promethean-workflow-optimization.md#^ref-d614d983-201-0) (line 201, col 0, score 1)
- [Prometheus Observability Stack — L1082](prometheus-observability-stack.md#^ref-e90b5a16-1082-0) (line 1082, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L613](protocol-0-the-contradiction-engine.md#^ref-9a93a756-613-0) (line 613, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L734](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-734-0) (line 734, col 0, score 1)
- [Window Management — L252](chunks/window-management.md#^ref-9e8ae388-252-0) (line 252, col 0, score 1)
- [komorebi-group-window-hack — L527](komorebi-group-window-hack.md#^ref-dd89372d-527-0) (line 527, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L574](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-574-0) (line 574, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L551](promethean-copilot-intent-engine.md#^ref-ae24a280-551-0) (line 551, col 0, score 1)
- [Promethean State Format — L419](promethean-state-format.md#^ref-23df6ddb-419-0) (line 419, col 0, score 1)
- [Unique Info Dump Index — L551](unique-info-dump-index.md#^ref-30ec3ba6-551-0) (line 551, col 0, score 1)
- [ts-to-lisp-transpiler — L148](ts-to-lisp-transpiler.md#^ref-ba11486b-148-0) (line 148, col 0, score 0.99)
- [Duck's Attractor States — L1771](ducks-attractor-states.md#^ref-13951643-1771-0) (line 1771, col 0, score 0.96)
- [DSL — L151](chunks/dsl.md#^ref-e87bc036-151-0) (line 151, col 0, score 1)
- [komorebi-group-window-hack — L528](komorebi-group-window-hack.md#^ref-dd89372d-528-0) (line 528, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L575](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-575-0) (line 575, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L552](promethean-copilot-intent-engine.md#^ref-ae24a280-552-0) (line 552, col 0, score 1)
- [Promethean State Format — L420](promethean-state-format.md#^ref-23df6ddb-420-0) (line 420, col 0, score 1)
- [Unique Info Dump Index — L552](unique-info-dump-index.md#^ref-30ec3ba6-552-0) (line 552, col 0, score 1)
- [ts-to-lisp-transpiler — L149](ts-to-lisp-transpiler.md#^ref-ba11486b-149-0) (line 149, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L3424](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-3424-0) (line 3424, col 0, score 0.95)
- [windows-tiling-with-autohotkey — L3432](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-3432-0) (line 3432, col 0, score 0.94)
- [DSL — L152](chunks/dsl.md#^ref-e87bc036-152-0) (line 152, col 0, score 1)
- [Window Management — L253](chunks/window-management.md#^ref-9e8ae388-253-0) (line 253, col 0, score 1)
- [komorebi-group-window-hack — L529](komorebi-group-window-hack.md#^ref-dd89372d-529-0) (line 529, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L576](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-576-0) (line 576, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L553](promethean-copilot-intent-engine.md#^ref-ae24a280-553-0) (line 553, col 0, score 1)
- [Promethean State Format — L421](promethean-state-format.md#^ref-23df6ddb-421-0) (line 421, col 0, score 1)
- [Unique Info Dump Index — L553](unique-info-dump-index.md#^ref-30ec3ba6-553-0) (line 553, col 0, score 1)
- [ts-to-lisp-transpiler — L150](ts-to-lisp-transpiler.md#^ref-ba11486b-150-0) (line 150, col 0, score 0.99)
- [JavaScript — L204](chunks/javascript.md#^ref-c1618c66-204-0) (line 204, col 0, score 0.98)
- [DSL — L154](chunks/dsl.md#^ref-e87bc036-154-0) (line 154, col 0, score 1)
- [Window Management — L255](chunks/window-management.md#^ref-9e8ae388-255-0) (line 255, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L578](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-578-0) (line 578, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L555](promethean-copilot-intent-engine.md#^ref-ae24a280-555-0) (line 555, col 0, score 1)
- [Promethean State Format — L423](promethean-state-format.md#^ref-23df6ddb-423-0) (line 423, col 0, score 1)
- [Unique Info Dump Index — L555](unique-info-dump-index.md#^ref-30ec3ba6-555-0) (line 555, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L1598](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-1598-0) (line 1598, col 0, score 1)
- [Creative Moments — L981](creative-moments.md#^ref-10d98225-981-0) (line 981, col 0, score 1)
- [DSL — L155](chunks/dsl.md#^ref-e87bc036-155-0) (line 155, col 0, score 1)
- [Window Management — L256](chunks/window-management.md#^ref-9e8ae388-256-0) (line 256, col 0, score 1)
- [komorebi-group-window-hack — L531](komorebi-group-window-hack.md#^ref-dd89372d-531-0) (line 531, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L579](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-579-0) (line 579, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L556](promethean-copilot-intent-engine.md#^ref-ae24a280-556-0) (line 556, col 0, score 1)
- [Promethean State Format — L424](promethean-state-format.md#^ref-23df6ddb-424-0) (line 424, col 0, score 1)
- [Unique Info Dump Index — L556](unique-info-dump-index.md#^ref-30ec3ba6-556-0) (line 556, col 0, score 1)
- [ts-to-lisp-transpiler — L153](ts-to-lisp-transpiler.md#^ref-ba11486b-153-0) (line 153, col 0, score 0.99)
- [Diagrams — L163](chunks/diagrams.md#^ref-45cd25b5-163-0) (line 163, col 0, score 0.97)
- [DSL — L156](chunks/dsl.md#^ref-e87bc036-156-0) (line 156, col 0, score 1)
- [Window Management — L257](chunks/window-management.md#^ref-9e8ae388-257-0) (line 257, col 0, score 1)
- [komorebi-group-window-hack — L532](komorebi-group-window-hack.md#^ref-dd89372d-532-0) (line 532, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L580](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-580-0) (line 580, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L557](promethean-copilot-intent-engine.md#^ref-ae24a280-557-0) (line 557, col 0, score 1)
- [Promethean State Format — L425](promethean-state-format.md#^ref-23df6ddb-425-0) (line 425, col 0, score 1)
- [Unique Info Dump Index — L835](unique-info-dump-index.md#^ref-30ec3ba6-835-0) (line 835, col 0, score 1)
- [ts-to-lisp-transpiler — L154](ts-to-lisp-transpiler.md#^ref-ba11486b-154-0) (line 154, col 0, score 1)
- [DSL — L186](chunks/dsl.md#^ref-e87bc036-186-0) (line 186, col 0, score 1)
- [Window Management — L258](chunks/window-management.md#^ref-9e8ae388-258-0) (line 258, col 0, score 1)
- [komorebi-group-window-hack — L533](komorebi-group-window-hack.md#^ref-dd89372d-533-0) (line 533, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L581](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-581-0) (line 581, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L558](promethean-copilot-intent-engine.md#^ref-ae24a280-558-0) (line 558, col 0, score 1)
- [Promethean State Format — L426](promethean-state-format.md#^ref-23df6ddb-426-0) (line 426, col 0, score 1)
- [Unique Info Dump Index — L836](unique-info-dump-index.md#^ref-30ec3ba6-836-0) (line 836, col 0, score 1)
- [JavaScript — L421](chunks/javascript.md#^ref-c1618c66-421-0) (line 421, col 0, score 0.98)
- [Factorio AI with External Agents — L644](factorio-ai-with-external-agents.md#^ref-a4d90289-644-0) (line 644, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L691](layer1survivabilityenvelope.md#^ref-64a9f9f9-691-0) (line 691, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1611](migrate-to-provider-tenant-architecture.md#^ref-54382370-1611-0) (line 1611, col 0, score 1)
- [Mindful Prioritization — L129](mindful-prioritization.md#^ref-40185d05-129-0) (line 129, col 0, score 1)
- [MindfulRobotIntegration — L129](mindfulrobotintegration.md#^ref-5f65dfa5-129-0) (line 129, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L496](model-upgrade-calm-down-guide.md#^ref-db74343f-496-0) (line 496, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L190](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-190-0) (line 190, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L456](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-456-0) (line 456, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L423](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-423-0) (line 423, col 0, score 1)
- [Obsidian Task Generation — L152](obsidian-task-generation.md#^ref-9b694a91-152-0) (line 152, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L646](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-646-0) (line 646, col 0, score 1)
- [Admin Dashboard for User Management — L233](admin-dashboard-for-user-management.md#^ref-2901a3e9-233-0) (line 233, col 0, score 1)
- [Window Management — L328](chunks/window-management.md#^ref-9e8ae388-328-0) (line 328, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L519](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-519-0) (line 519, col 0, score 1)
- [DuckDuckGoSearchPipeline — L137](duckduckgosearchpipeline.md#^ref-e979c50f-137-0) (line 137, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L419](ducks-self-referential-perceptual-loop.md#^ref-71726f04-419-0) (line 419, col 0, score 1)
- [Dynamic Context Model for Web Components — L1554](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1554-0) (line 1554, col 0, score 1)
- [Factorio AI with External Agents — L646](factorio-ai-with-external-agents.md#^ref-a4d90289-646-0) (line 646, col 0, score 1)
- [Fnord Tracer Protocol — L921](fnord-tracer-protocol.md#^ref-fc21f824-921-0) (line 921, col 0, score 1)
- [graph-ds — L911](graph-ds.md#^ref-6620e2f2-911-0) (line 911, col 0, score 1)
- [i3-bluetooth-setup — L629](i3-bluetooth-setup.md#^ref-5e408692-629-0) (line 629, col 0, score 1)
- [komorebi-group-window-hack — L643](komorebi-group-window-hack.md#^ref-dd89372d-643-0) (line 643, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1613](migrate-to-provider-tenant-architecture.md#^ref-54382370-1613-0) (line 1613, col 0, score 1)
- [Admin Dashboard for User Management — L234](admin-dashboard-for-user-management.md#^ref-2901a3e9-234-0) (line 234, col 0, score 1)
- [Operations — L119](chunks/operations.md#^ref-f1add613-119-0) (line 119, col 0, score 1)
- [Shared — L266](chunks/shared.md#^ref-623a55f7-266-0) (line 266, col 0, score 1)
- [Window Management — L329](chunks/window-management.md#^ref-9e8ae388-329-0) (line 329, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L520](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-520-0) (line 520, col 0, score 1)
- [DuckDuckGoSearchPipeline — L138](duckduckgosearchpipeline.md#^ref-e979c50f-138-0) (line 138, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L420](ducks-self-referential-perceptual-loop.md#^ref-71726f04-420-0) (line 420, col 0, score 1)
- [Dynamic Context Model for Web Components — L1555](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1555-0) (line 1555, col 0, score 1)
- [Factorio AI with External Agents — L647](factorio-ai-with-external-agents.md#^ref-a4d90289-647-0) (line 647, col 0, score 1)
- [Fnord Tracer Protocol — L922](fnord-tracer-protocol.md#^ref-fc21f824-922-0) (line 922, col 0, score 1)
- [The Jar of Echoes — L571](the-jar-of-echoes.md#^ref-18138627-571-0) (line 571, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L1162](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-1162-0) (line 1162, col 0, score 1)
- [promethean-requirements — L163](promethean-requirements.md#^ref-95205cd3-163-0) (line 163, col 0, score 1)
- [Promethean Workflow Optimization — L207](promethean-workflow-optimization.md#^ref-d614d983-207-0) (line 207, col 0, score 1)
- [Prometheus Observability Stack — L1088](prometheus-observability-stack.md#^ref-e90b5a16-1088-0) (line 1088, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L638](protocol-0-the-contradiction-engine.md#^ref-9a93a756-638-0) (line 638, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L787](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-787-0) (line 787, col 0, score 1)
- [Pure TypeScript Search Microservice — L1274](pure-typescript-search-microservice.md#^ref-d17d3a96-1274-0) (line 1274, col 0, score 1)
- [Reawakening Duck — L565](reawakening-duck.md#^ref-59b5670f-565-0) (line 565, col 0, score 1)
- [Redirecting Standard Error — L234](redirecting-standard-error.md#^ref-b3555ede-234-0) (line 234, col 0, score 1)
- [Self-Agency in AI Interaction — L363](self-agency-in-ai-interaction.md#^ref-49a9a860-363-0) (line 363, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L423](ducks-self-referential-perceptual-loop.md#^ref-71726f04-423-0) (line 423, col 0, score 1)
- [Dynamic Context Model for Web Components — L1558](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1558-0) (line 1558, col 0, score 1)
- [Factorio AI with External Agents — L650](factorio-ai-with-external-agents.md#^ref-a4d90289-650-0) (line 650, col 0, score 1)
- [Fnord Tracer Protocol — L925](fnord-tracer-protocol.md#^ref-fc21f824-925-0) (line 925, col 0, score 1)
- [graph-ds — L915](graph-ds.md#^ref-6620e2f2-915-0) (line 915, col 0, score 1)
- [i3-bluetooth-setup — L633](i3-bluetooth-setup.md#^ref-5e408692-633-0) (line 633, col 0, score 1)
- [komorebi-group-window-hack — L647](komorebi-group-window-hack.md#^ref-dd89372d-647-0) (line 647, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L697](layer1survivabilityenvelope.md#^ref-64a9f9f9-697-0) (line 697, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1617](migrate-to-provider-tenant-architecture.md#^ref-54382370-1617-0) (line 1617, col 0, score 1)
- [Mindful Prioritization — L135](mindful-prioritization.md#^ref-40185d05-135-0) (line 135, col 0, score 1)
- [promethean-requirements — L165](promethean-requirements.md#^ref-95205cd3-165-0) (line 165, col 0, score 1)
- [Promethean Workflow Optimization — L209](promethean-workflow-optimization.md#^ref-d614d983-209-0) (line 209, col 0, score 1)
- [Prometheus Observability Stack — L1090](prometheus-observability-stack.md#^ref-e90b5a16-1090-0) (line 1090, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L640](protocol-0-the-contradiction-engine.md#^ref-9a93a756-640-0) (line 640, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L789](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-789-0) (line 789, col 0, score 1)
- [Pure TypeScript Search Microservice — L1276](pure-typescript-search-microservice.md#^ref-d17d3a96-1276-0) (line 1276, col 0, score 1)
- [Reawakening Duck — L567](reawakening-duck.md#^ref-59b5670f-567-0) (line 567, col 0, score 1)
- [Redirecting Standard Error — L236](redirecting-standard-error.md#^ref-b3555ede-236-0) (line 236, col 0, score 1)
- [Self-Agency in AI Interaction — L365](self-agency-in-ai-interaction.md#^ref-49a9a860-365-0) (line 365, col 0, score 1)
- [promethean-requirements — L166](promethean-requirements.md#^ref-95205cd3-166-0) (line 166, col 0, score 1)
- [Promethean Workflow Optimization — L210](promethean-workflow-optimization.md#^ref-d614d983-210-0) (line 210, col 0, score 1)
- [Prometheus Observability Stack — L1091](prometheus-observability-stack.md#^ref-e90b5a16-1091-0) (line 1091, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L641](protocol-0-the-contradiction-engine.md#^ref-9a93a756-641-0) (line 641, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L790](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-790-0) (line 790, col 0, score 1)
- [Pure TypeScript Search Microservice — L1277](pure-typescript-search-microservice.md#^ref-d17d3a96-1277-0) (line 1277, col 0, score 1)
- [Reawakening Duck — L568](reawakening-duck.md#^ref-59b5670f-568-0) (line 568, col 0, score 1)
- [Redirecting Standard Error — L237](redirecting-standard-error.md#^ref-b3555ede-237-0) (line 237, col 0, score 1)
- [Self-Agency in AI Interaction — L366](self-agency-in-ai-interaction.md#^ref-49a9a860-366-0) (line 366, col 0, score 1)
- [Obsidian Task Generation — L161](obsidian-task-generation.md#^ref-9b694a91-161-0) (line 161, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L655](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-655-0) (line 655, col 0, score 1)
- [OpenAPI Validation Report — L179](openapi-validation-report.md#^ref-5c152b08-179-0) (line 179, col 0, score 1)
- [plan-update-confirmation — L2116](plan-update-confirmation.md#^ref-b22d79c6-2116-0) (line 2116, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L454](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-454-0) (line 454, col 0, score 1)
- [Promethean Dev Workflow Update — L587](promethean-dev-workflow-update.md#^ref-03a5578f-587-0) (line 587, col 0, score 1)
- [Promethean Documentation Update — L118](promethean-documentation-update.md#^ref-c0392040-118-0) (line 118, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L383](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-383-0) (line 383, col 0, score 1)
- [Promethean Infrastructure Setup — L1611](promethean-infrastructure-setup.md#^ref-6deed6ac-1611-0) (line 1611, col 0, score 1)
- [Promethean Workflow Optimization — L211](promethean-workflow-optimization.md#^ref-d614d983-211-0) (line 211, col 0, score 1)
- [Prometheus Observability Stack — L1092](prometheus-observability-stack.md#^ref-e90b5a16-1092-0) (line 1092, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L642](protocol-0-the-contradiction-engine.md#^ref-9a93a756-642-0) (line 642, col 0, score 1)
- [Window Management — L335](chunks/window-management.md#^ref-9e8ae388-335-0) (line 335, col 0, score 1)
- [i3-bluetooth-setup — L637](i3-bluetooth-setup.md#^ref-5e408692-637-0) (line 637, col 0, score 1)
- [komorebi-group-window-hack — L651](komorebi-group-window-hack.md#^ref-dd89372d-651-0) (line 651, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L701](layer1survivabilityenvelope.md#^ref-64a9f9f9-701-0) (line 701, col 0, score 1)
- [Mindful Prioritization — L139](mindful-prioritization.md#^ref-40185d05-139-0) (line 139, col 0, score 1)
- [MindfulRobotIntegration — L139](mindfulrobotintegration.md#^ref-5f65dfa5-139-0) (line 139, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L506](model-upgrade-calm-down-guide.md#^ref-db74343f-506-0) (line 506, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L200](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-200-0) (line 200, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L466](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-466-0) (line 466, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L433](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-433-0) (line 433, col 0, score 1)
- [Obsidian Task Generation — L162](obsidian-task-generation.md#^ref-9b694a91-162-0) (line 162, col 0, score 1)
- [Promethean Dev Workflow Update — L590](promethean-dev-workflow-update.md#^ref-03a5578f-590-0) (line 590, col 0, score 1)
- [Pure TypeScript Search Microservice — L1281](pure-typescript-search-microservice.md#^ref-d17d3a96-1281-0) (line 1281, col 0, score 1)
- [The Jar of Echoes — L579](the-jar-of-echoes.md#^ref-18138627-579-0) (line 579, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L1170](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-1170-0) (line 1170, col 0, score 1)
- [Promethean Documentation Update — L177](promethean-documentation-update.txt#^ref-0b872af2-177-0) (line 177, col 0, score 1)
- [Promethean Notes — L198](promethean-notes.md#^ref-1c4046b5-198-0) (line 198, col 0, score 1)
- [Promethean Dev Workflow Update — L591](promethean-dev-workflow-update.md#^ref-03a5578f-591-0) (line 591, col 0, score 1)
- [Prometheus Observability Stack — L1096](prometheus-observability-stack.md#^ref-e90b5a16-1096-0) (line 1096, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L646](protocol-0-the-contradiction-engine.md#^ref-9a93a756-646-0) (line 646, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L795](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-795-0) (line 795, col 0, score 1)
- [Pure TypeScript Search Microservice — L1282](pure-typescript-search-microservice.md#^ref-d17d3a96-1282-0) (line 1282, col 0, score 1)
- [Reawakening Duck — L573](reawakening-duck.md#^ref-59b5670f-573-0) (line 573, col 0, score 1)
- [Redirecting Standard Error — L242](redirecting-standard-error.md#^ref-b3555ede-242-0) (line 242, col 0, score 1)
- [Self-Agency in AI Interaction — L371](self-agency-in-ai-interaction.md#^ref-49a9a860-371-0) (line 371, col 0, score 1)
- [unique-templates — L138](templates/unique-templates.md#^ref-c26f0044-138-0) (line 138, col 0, score 1)
- [The Jar of Echoes — L580](the-jar-of-echoes.md#^ref-18138627-580-0) (line 580, col 0, score 1)
- [Promethean Dev Workflow Update — L592](promethean-dev-workflow-update.md#^ref-03a5578f-592-0) (line 592, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L647](protocol-0-the-contradiction-engine.md#^ref-9a93a756-647-0) (line 647, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L796](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-796-0) (line 796, col 0, score 1)
- [Pure TypeScript Search Microservice — L1283](pure-typescript-search-microservice.md#^ref-d17d3a96-1283-0) (line 1283, col 0, score 1)
- [Reawakening Duck — L574](reawakening-duck.md#^ref-59b5670f-574-0) (line 574, col 0, score 1)
- [Redirecting Standard Error — L243](redirecting-standard-error.md#^ref-b3555ede-243-0) (line 243, col 0, score 1)
- [Self-Agency in AI Interaction — L372](self-agency-in-ai-interaction.md#^ref-49a9a860-372-0) (line 372, col 0, score 1)
- [unique-templates — L139](templates/unique-templates.md#^ref-c26f0044-139-0) (line 139, col 0, score 1)
- [The Jar of Echoes — L581](the-jar-of-echoes.md#^ref-18138627-581-0) (line 581, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L706](layer1survivabilityenvelope.md#^ref-64a9f9f9-706-0) (line 706, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1625](migrate-to-provider-tenant-architecture.md#^ref-54382370-1625-0) (line 1625, col 0, score 1)
- [Mindful Prioritization — L143](mindful-prioritization.md#^ref-40185d05-143-0) (line 143, col 0, score 1)
- [MindfulRobotIntegration — L143](mindfulrobotintegration.md#^ref-5f65dfa5-143-0) (line 143, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L510](model-upgrade-calm-down-guide.md#^ref-db74343f-510-0) (line 510, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L204](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-204-0) (line 204, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L471](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-471-0) (line 471, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L438](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-438-0) (line 438, col 0, score 1)
- [Obsidian Task Generation — L167](obsidian-task-generation.md#^ref-9b694a91-167-0) (line 167, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L661](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-661-0) (line 661, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L460](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-460-0) (line 460, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L649](protocol-0-the-contradiction-engine.md#^ref-9a93a756-649-0) (line 649, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L798](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-798-0) (line 798, col 0, score 1)
- [Pure TypeScript Search Microservice — L1285](pure-typescript-search-microservice.md#^ref-d17d3a96-1285-0) (line 1285, col 0, score 1)
- [Reawakening Duck — L576](reawakening-duck.md#^ref-59b5670f-576-0) (line 576, col 0, score 1)
- [Redirecting Standard Error — L245](redirecting-standard-error.md#^ref-b3555ede-245-0) (line 245, col 0, score 1)
- [Self-Agency in AI Interaction — L374](self-agency-in-ai-interaction.md#^ref-49a9a860-374-0) (line 374, col 0, score 1)
- [unique-templates — L141](templates/unique-templates.md#^ref-c26f0044-141-0) (line 141, col 0, score 1)
- [The Jar of Echoes — L583](the-jar-of-echoes.md#^ref-18138627-583-0) (line 583, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L650](protocol-0-the-contradiction-engine.md#^ref-9a93a756-650-0) (line 650, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L799](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-799-0) (line 799, col 0, score 1)
- [Pure TypeScript Search Microservice — L1286](pure-typescript-search-microservice.md#^ref-d17d3a96-1286-0) (line 1286, col 0, score 1)
- [Reawakening Duck — L577](reawakening-duck.md#^ref-59b5670f-577-0) (line 577, col 0, score 1)
- [Redirecting Standard Error — L246](redirecting-standard-error.md#^ref-b3555ede-246-0) (line 246, col 0, score 1)
- [Self-Agency in AI Interaction — L375](self-agency-in-ai-interaction.md#^ref-49a9a860-375-0) (line 375, col 0, score 1)
- [unique-templates — L142](templates/unique-templates.md#^ref-c26f0044-142-0) (line 142, col 0, score 1)
- [The Jar of Echoes — L584](the-jar-of-echoes.md#^ref-18138627-584-0) (line 584, col 0, score 1)
- [Promethean Notes — L174](promethean-notes.md#^ref-1c4046b5-174-0) (line 174, col 0, score 0.96)
- [promethean-requirements — L146](promethean-requirements.md#^ref-95205cd3-146-0) (line 146, col 0, score 0.96)
- [Promethean Workflow Optimization — L190](promethean-workflow-optimization.md#^ref-d614d983-190-0) (line 190, col 0, score 0.96)
- [Prometheus Observability Stack — L1071](prometheus-observability-stack.md#^ref-e90b5a16-1071-0) (line 1071, col 0, score 0.96)
- [Protocol_0_The_Contradiction_Engine — L603](protocol-0-the-contradiction-engine.md#^ref-9a93a756-603-0) (line 603, col 0, score 0.96)
- [Provider-Agnostic Chat Panel Implementation — L723](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-723-0) (line 723, col 0, score 0.96)
- [Pure TypeScript Search Microservice — L1257](pure-typescript-search-microservice.md#^ref-d17d3a96-1257-0) (line 1257, col 0, score 0.96)
- [Reawakening Duck — L548](reawakening-duck.md#^ref-59b5670f-548-0) (line 548, col 0, score 0.96)
- [Redirecting Standard Error — L218](redirecting-standard-error.md#^ref-b3555ede-218-0) (line 218, col 0, score 0.96)
- [DSL — L282](chunks/dsl.md#^ref-e87bc036-282-0) (line 282, col 0, score 1)
- [komorebi-group-window-hack — L492](komorebi-group-window-hack.md#^ref-dd89372d-492-0) (line 492, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L601](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-601-0) (line 601, col 0, score 1)
- [Promethean State Format — L485](promethean-state-format.md#^ref-23df6ddb-485-0) (line 485, col 0, score 1)
- [sibilant-macro-targets — L811](sibilant-macro-targets.md#^ref-c5c9a5c6-811-0) (line 811, col 0, score 1)
- [ts-to-lisp-transpiler — L183](ts-to-lisp-transpiler.md#^ref-ba11486b-183-0) (line 183, col 0, score 1)
- [windows-tiling-with-autohotkey — L501](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-501-0) (line 501, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L490](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-490-0) (line 490, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L364](promethean-copilot-intent-engine.md#^ref-ae24a280-364-0) (line 364, col 0, score 0.99)
- [DSL — L284](chunks/dsl.md#^ref-e87bc036-284-0) (line 284, col 0, score 1)
- [Window Management — L197](chunks/window-management.md#^ref-9e8ae388-197-0) (line 197, col 0, score 1)
- [komorebi-group-window-hack — L494](komorebi-group-window-hack.md#^ref-dd89372d-494-0) (line 494, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L734](promethean-copilot-intent-engine.md#^ref-ae24a280-734-0) (line 734, col 0, score 1)
- [Promethean State Format — L279](promethean-state-format.md#^ref-23df6ddb-279-0) (line 279, col 0, score 1)
- [sibilant-macro-targets — L814](sibilant-macro-targets.md#^ref-c5c9a5c6-814-0) (line 814, col 0, score 1)
- [ts-to-lisp-transpiler — L185](ts-to-lisp-transpiler.md#^ref-ba11486b-185-0) (line 185, col 0, score 1)
- [Unique Info Dump Index — L827](unique-info-dump-index.md#^ref-30ec3ba6-827-0) (line 827, col 0, score 1)
- [DSL — L285](chunks/dsl.md#^ref-e87bc036-285-0) (line 285, col 0, score 1)
- [Window Management — L199](chunks/window-management.md#^ref-9e8ae388-199-0) (line 199, col 0, score 1)
- [komorebi-group-window-hack — L495](komorebi-group-window-hack.md#^ref-dd89372d-495-0) (line 495, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L604](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-604-0) (line 604, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L736](promethean-copilot-intent-engine.md#^ref-ae24a280-736-0) (line 736, col 0, score 1)
- [Promethean State Format — L486](promethean-state-format.md#^ref-23df6ddb-486-0) (line 486, col 0, score 1)
- [sibilant-macro-targets — L816](sibilant-macro-targets.md#^ref-c5c9a5c6-816-0) (line 816, col 0, score 1)
- [ts-to-lisp-transpiler — L186](ts-to-lisp-transpiler.md#^ref-ba11486b-186-0) (line 186, col 0, score 1)
- [DSL — L286](chunks/dsl.md#^ref-e87bc036-286-0) (line 286, col 0, score 1)
- [Window Management — L200](chunks/window-management.md#^ref-9e8ae388-200-0) (line 200, col 0, score 1)
- [komorebi-group-window-hack — L496](komorebi-group-window-hack.md#^ref-dd89372d-496-0) (line 496, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L605](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-605-0) (line 605, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L737](promethean-copilot-intent-engine.md#^ref-ae24a280-737-0) (line 737, col 0, score 1)
- [Promethean State Format — L487](promethean-state-format.md#^ref-23df6ddb-487-0) (line 487, col 0, score 1)
- [sibilant-macro-targets — L817](sibilant-macro-targets.md#^ref-c5c9a5c6-817-0) (line 817, col 0, score 1)
- [ts-to-lisp-transpiler — L187](ts-to-lisp-transpiler.md#^ref-ba11486b-187-0) (line 187, col 0, score 1)
- [DSL — L287](chunks/dsl.md#^ref-e87bc036-287-0) (line 287, col 0, score 1)
- [Window Management — L201](chunks/window-management.md#^ref-9e8ae388-201-0) (line 201, col 0, score 1)
- [komorebi-group-window-hack — L497](komorebi-group-window-hack.md#^ref-dd89372d-497-0) (line 497, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L606](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-606-0) (line 606, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L738](promethean-copilot-intent-engine.md#^ref-ae24a280-738-0) (line 738, col 0, score 1)
- [Promethean State Format — L488](promethean-state-format.md#^ref-23df6ddb-488-0) (line 488, col 0, score 1)
- [sibilant-macro-targets — L818](sibilant-macro-targets.md#^ref-c5c9a5c6-818-0) (line 818, col 0, score 1)
- [ts-to-lisp-transpiler — L188](ts-to-lisp-transpiler.md#^ref-ba11486b-188-0) (line 188, col 0, score 1)
- [DSL — L288](chunks/dsl.md#^ref-e87bc036-288-0) (line 288, col 0, score 1)
- [Window Management — L202](chunks/window-management.md#^ref-9e8ae388-202-0) (line 202, col 0, score 1)
- [komorebi-group-window-hack — L498](komorebi-group-window-hack.md#^ref-dd89372d-498-0) (line 498, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L607](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-607-0) (line 607, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L739](promethean-copilot-intent-engine.md#^ref-ae24a280-739-0) (line 739, col 0, score 1)
- [Promethean State Format — L280](promethean-state-format.md#^ref-23df6ddb-280-0) (line 280, col 0, score 1)
- [sibilant-macro-targets — L819](sibilant-macro-targets.md#^ref-c5c9a5c6-819-0) (line 819, col 0, score 1)
- [ts-to-lisp-transpiler — L189](ts-to-lisp-transpiler.md#^ref-ba11486b-189-0) (line 189, col 0, score 1)
- [windows-tiling-with-autohotkey — L508](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-508-0) (line 508, col 0, score 1)
- [The Jar of Echoes — L4163](the-jar-of-echoes.md#^ref-18138627-4163-0) (line 4163, col 0, score 0.97)
- [Duck's Attractor States — L3992](ducks-attractor-states.md#^ref-13951643-3992-0) (line 3992, col 0, score 0.97)
- [eidolon-field-math-foundations — L5246](eidolon-field-math-foundations.md#^ref-008f2ac0-5246-0) (line 5246, col 0, score 0.97)
- [Duck's Attractor States — L3999](ducks-attractor-states.md#^ref-13951643-3999-0) (line 3999, col 0, score 0.97)
- [Duck's Attractor States — L4015](ducks-attractor-states.md#^ref-13951643-4015-0) (line 4015, col 0, score 0.96)
- [eidolon-field-math-foundations — L5269](eidolon-field-math-foundations.md#^ref-008f2ac0-5269-0) (line 5269, col 0, score 0.96)
- [Duck's Attractor States — L4054](ducks-attractor-states.md#^ref-13951643-4054-0) (line 4054, col 0, score 0.96)
- [eidolon-field-math-foundations — L5308](eidolon-field-math-foundations.md#^ref-008f2ac0-5308-0) (line 5308, col 0, score 0.96)
- [Duck's Attractor States — L3983](ducks-attractor-states.md#^ref-13951643-3983-0) (line 3983, col 0, score 0.94)
- [windows-tiling-with-autohotkey — L509](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-509-0) (line 509, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L515](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-515-0) (line 515, col 0, score 0.86)
- [Duck's Attractor States — L503](ducks-attractor-states.md#^ref-13951643-503-0) (line 503, col 0, score 1)
- [eidolon-field-math-foundations — L891](eidolon-field-math-foundations.md#^ref-008f2ac0-891-0) (line 891, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L674](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-674-0) (line 674, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L713](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-713-0) (line 713, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L1071](performance-optimized-polyglot-bridge.md#^ref-f5579967-1071-0) (line 1071, col 0, score 1)
- [polyglot-repl-interface-layer — L446](polyglot-repl-interface-layer.md#^ref-9c79206d-446-0) (line 446, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L675](promethean-copilot-intent-engine.md#^ref-ae24a280-675-0) (line 675, col 0, score 1)
- [Promethean Infrastructure Setup — L1533](promethean-infrastructure-setup.md#^ref-6deed6ac-1533-0) (line 1533, col 0, score 1)
- [Promethean State Format — L466](promethean-state-format.md#^ref-23df6ddb-466-0) (line 466, col 0, score 1)
- [Prompt_Folder_Bootstrap — L605](prompt-folder-bootstrap.md#^ref-bd4f0976-605-0) (line 605, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L409](ducks-self-referential-perceptual-loop.md#^ref-71726f04-409-0) (line 409, col 0, score 1)
- [Dynamic Context Model for Web Components — L1588](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1588-0) (line 1588, col 0, score 1)
- [eidolon-field-math-foundations — L892](eidolon-field-math-foundations.md#^ref-008f2ac0-892-0) (line 892, col 0, score 1)
- [field-node-diagram-outline — L677](field-node-diagram-outline.md#^ref-1f32c94a-677-0) (line 677, col 0, score 1)
- [homeostasis-decay-formulas — L903](homeostasis-decay-formulas.md#^ref-37b5d236-903-0) (line 903, col 0, score 1)
- [i3-bluetooth-setup — L698](i3-bluetooth-setup.md#^ref-5e408692-698-0) (line 698, col 0, score 1)
- [komorebi-group-window-hack — L588](komorebi-group-window-hack.md#^ref-dd89372d-588-0) (line 588, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1559](migrate-to-provider-tenant-architecture.md#^ref-54382370-1559-0) (line 1559, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L485](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-485-0) (line 485, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L675](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-675-0) (line 675, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L714](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-714-0) (line 714, col 0, score 1)
- [Admin Dashboard for User Management — L441](admin-dashboard-for-user-management.md#^ref-2901a3e9-441-0) (line 441, col 0, score 1)
- [Window Management — L235](chunks/window-management.md#^ref-9e8ae388-235-0) (line 235, col 0, score 1)
- [Dynamic Context Model for Web Components — L1589](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1589-0) (line 1589, col 0, score 1)
- [eidolon-field-math-foundations — L893](eidolon-field-math-foundations.md#^ref-008f2ac0-893-0) (line 893, col 0, score 1)
- [field-dynamics-math-blocks — L860](field-dynamics-math-blocks.md#^ref-7cfc230d-860-0) (line 860, col 0, score 1)
- [field-interaction-equations — L840](field-interaction-equations.md#^ref-b09141b7-840-0) (line 840, col 0, score 1)
- [field-node-diagram-outline — L678](field-node-diagram-outline.md#^ref-1f32c94a-678-0) (line 678, col 0, score 1)
- [graph-ds — L749](graph-ds.md#^ref-6620e2f2-749-0) (line 749, col 0, score 1)
- [heartbeat-fragment-demo — L596](heartbeat-fragment-demo.md#^ref-dd00677a-596-0) (line 596, col 0, score 1)
- [homeostasis-decay-formulas — L904](homeostasis-decay-formulas.md#^ref-37b5d236-904-0) (line 904, col 0, score 1)
- [i3-bluetooth-setup — L699](i3-bluetooth-setup.md#^ref-5e408692-699-0) (line 699, col 0, score 1)
- [komorebi-group-window-hack — L589](komorebi-group-window-hack.md#^ref-dd89372d-589-0) (line 589, col 0, score 1)
- [eidolon-field-math-foundations — L894](eidolon-field-math-foundations.md#^ref-008f2ac0-894-0) (line 894, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L716](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-716-0) (line 716, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L1074](performance-optimized-polyglot-bridge.md#^ref-f5579967-1074-0) (line 1074, col 0, score 1)
- [polyglot-repl-interface-layer — L449](polyglot-repl-interface-layer.md#^ref-9c79206d-449-0) (line 449, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L678](promethean-copilot-intent-engine.md#^ref-ae24a280-678-0) (line 678, col 0, score 1)
- [Promethean Dev Workflow Update — L473](promethean-dev-workflow-update.md#^ref-03a5578f-473-0) (line 473, col 0, score 1)
- [Promethean Infrastructure Setup — L1536](promethean-infrastructure-setup.md#^ref-6deed6ac-1536-0) (line 1536, col 0, score 1)
- [Promethean State Format — L469](promethean-state-format.md#^ref-23df6ddb-469-0) (line 469, col 0, score 1)
- [eidolon-field-math-foundations — L895](eidolon-field-math-foundations.md#^ref-008f2ac0-895-0) (line 895, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L729](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-729-0) (line 729, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L717](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-717-0) (line 717, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L1075](performance-optimized-polyglot-bridge.md#^ref-f5579967-1075-0) (line 1075, col 0, score 1)
- [polyglot-repl-interface-layer — L450](polyglot-repl-interface-layer.md#^ref-9c79206d-450-0) (line 450, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L679](promethean-copilot-intent-engine.md#^ref-ae24a280-679-0) (line 679, col 0, score 1)
- [Promethean Dev Workflow Update — L474](promethean-dev-workflow-update.md#^ref-03a5578f-474-0) (line 474, col 0, score 1)
- [Promethean Infrastructure Setup — L1537](promethean-infrastructure-setup.md#^ref-6deed6ac-1537-0) (line 1537, col 0, score 1)
- [Promethean State Format — L470](promethean-state-format.md#^ref-23df6ddb-470-0) (line 470, col 0, score 1)
- [windows-tiling-with-autohotkey — L608](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-608-0) (line 608, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L414](ducks-self-referential-perceptual-loop.md#^ref-71726f04-414-0) (line 414, col 0, score 1)
- [Dynamic Context Model for Web Components — L1593](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1593-0) (line 1593, col 0, score 1)
- [eidolon-field-math-foundations — L897](eidolon-field-math-foundations.md#^ref-008f2ac0-897-0) (line 897, col 0, score 1)
- [field-dynamics-math-blocks — L864](field-dynamics-math-blocks.md#^ref-7cfc230d-864-0) (line 864, col 0, score 1)
- [field-interaction-equations — L844](field-interaction-equations.md#^ref-b09141b7-844-0) (line 844, col 0, score 1)
- [field-node-diagram-outline — L682](field-node-diagram-outline.md#^ref-1f32c94a-682-0) (line 682, col 0, score 1)
- [graph-ds — L753](graph-ds.md#^ref-6620e2f2-753-0) (line 753, col 0, score 1)
- [heartbeat-fragment-demo — L600](heartbeat-fragment-demo.md#^ref-dd00677a-600-0) (line 600, col 0, score 1)
- [homeostasis-decay-formulas — L908](homeostasis-decay-formulas.md#^ref-37b5d236-908-0) (line 908, col 0, score 1)
- [i3-bluetooth-setup — L703](i3-bluetooth-setup.md#^ref-5e408692-703-0) (line 703, col 0, score 1)
- [eidolon-field-math-foundations — L898](eidolon-field-math-foundations.md#^ref-008f2ac0-898-0) (line 898, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L681](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-681-0) (line 681, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L720](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-720-0) (line 720, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L1078](performance-optimized-polyglot-bridge.md#^ref-f5579967-1078-0) (line 1078, col 0, score 1)
- [polyglot-repl-interface-layer — L453](polyglot-repl-interface-layer.md#^ref-9c79206d-453-0) (line 453, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L682](promethean-copilot-intent-engine.md#^ref-ae24a280-682-0) (line 682, col 0, score 1)
- [Promethean Dev Workflow Update — L477](promethean-dev-workflow-update.md#^ref-03a5578f-477-0) (line 477, col 0, score 1)
- [Promethean Infrastructure Setup — L1540](promethean-infrastructure-setup.md#^ref-6deed6ac-1540-0) (line 1540, col 0, score 1)
- [Promethean State Format — L473](promethean-state-format.md#^ref-23df6ddb-473-0) (line 473, col 0, score 1)
- [eidolon-field-math-foundations — L899](eidolon-field-math-foundations.md#^ref-008f2ac0-899-0) (line 899, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L733](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-733-0) (line 733, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L682](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-682-0) (line 682, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L721](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-721-0) (line 721, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L1079](performance-optimized-polyglot-bridge.md#^ref-f5579967-1079-0) (line 1079, col 0, score 1)
- [polyglot-repl-interface-layer — L454](polyglot-repl-interface-layer.md#^ref-9c79206d-454-0) (line 454, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L683](promethean-copilot-intent-engine.md#^ref-ae24a280-683-0) (line 683, col 0, score 1)
- [Promethean Dev Workflow Update — L478](promethean-dev-workflow-update.md#^ref-03a5578f-478-0) (line 478, col 0, score 1)
- [Promethean Infrastructure Setup — L1541](promethean-infrastructure-setup.md#^ref-6deed6ac-1541-0) (line 1541, col 0, score 1)
- [Promethean State Format — L474](promethean-state-format.md#^ref-23df6ddb-474-0) (line 474, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L399](ducks-self-referential-perceptual-loop.md#^ref-71726f04-399-0) (line 399, col 0, score 1)
- [Dynamic Context Model for Web Components — L1442](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1442-0) (line 1442, col 0, score 1)
- [Eidolon Field Abstract Model — L873](eidolon-field-abstract-model.md#^ref-5e8b2388-873-0) (line 873, col 0, score 1)
- [eidolon-node-lifecycle — L404](eidolon-node-lifecycle.md#^ref-938eca9c-404-0) (line 404, col 0, score 1)
- [field-dynamics-math-blocks — L925](field-dynamics-math-blocks.md#^ref-7cfc230d-925-0) (line 925, col 0, score 1)
- [field-interaction-equations — L762](field-interaction-equations.md#^ref-b09141b7-762-0) (line 762, col 0, score 1)
- [field-node-diagram-outline — L646](field-node-diagram-outline.md#^ref-1f32c94a-646-0) (line 646, col 0, score 1)
- [field-node-diagram-set — L629](field-node-diagram-set.md#^ref-22b989d5-629-0) (line 629, col 0, score 1)
- [field-node-diagram-visualizations — L519](field-node-diagram-visualizations.md#^ref-e9b27b06-519-0) (line 519, col 0, score 1)
- [Fnord Tracer Protocol — L955](fnord-tracer-protocol.md#^ref-fc21f824-955-0) (line 955, col 0, score 1)
- [Dynamic Context Model for Web Components — L1443](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1443-0) (line 1443, col 0, score 1)
- [Promethean State Format — L500](promethean-state-format.md#^ref-23df6ddb-500-0) (line 500, col 0, score 1)
- [Prometheus Observability Stack — L1025](prometheus-observability-stack.md#^ref-e90b5a16-1025-0) (line 1025, col 0, score 1)
- [Prompt_Folder_Bootstrap — L756](prompt-folder-bootstrap.md#^ref-bd4f0976-756-0) (line 756, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L660](protocol-0-the-contradiction-engine.md#^ref-9a93a756-660-0) (line 660, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L756](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-756-0) (line 756, col 0, score 1)
- [Reawakening Duck — L651](reawakening-duck.md#^ref-59b5670f-651-0) (line 651, col 0, score 1)
- [ripple-propagation-demo — L567](ripple-propagation-demo.md#^ref-8430617b-567-0) (line 567, col 0, score 1)
- [schema-evolution-workflow — L1085](schema-evolution-workflow.md#^ref-d8059b6a-1085-0) (line 1085, col 0, score 1)
- [Promethean State Format — L501](promethean-state-format.md#^ref-23df6ddb-501-0) (line 501, col 0, score 1)
- [Prometheus Observability Stack — L1026](prometheus-observability-stack.md#^ref-e90b5a16-1026-0) (line 1026, col 0, score 1)
- [Prompt_Folder_Bootstrap — L757](prompt-folder-bootstrap.md#^ref-bd4f0976-757-0) (line 757, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L661](protocol-0-the-contradiction-engine.md#^ref-9a93a756-661-0) (line 661, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L757](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-757-0) (line 757, col 0, score 1)
- [Reawakening Duck — L652](reawakening-duck.md#^ref-59b5670f-652-0) (line 652, col 0, score 1)
- [ripple-propagation-demo — L568](ripple-propagation-demo.md#^ref-8430617b-568-0) (line 568, col 0, score 1)
- [schema-evolution-workflow — L1086](schema-evolution-workflow.md#^ref-d8059b6a-1086-0) (line 1086, col 0, score 1)
- [i3-bluetooth-setup — L603](i3-bluetooth-setup.md#^ref-5e408692-603-0) (line 603, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L780](layer1survivabilityenvelope.md#^ref-64a9f9f9-780-0) (line 780, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1216](migrate-to-provider-tenant-architecture.md#^ref-54382370-1216-0) (line 1216, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L660](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-660-0) (line 660, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L311](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-311-0) (line 311, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L297](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-297-0) (line 297, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L363](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-363-0) (line 363, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L531](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-531-0) (line 531, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L751](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-751-0) (line 751, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L1120](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-1120-0) (line 1120, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L667](performance-optimized-polyglot-bridge.md#^ref-f5579967-667-0) (line 667, col 0, score 1)
- [plan-update-confirmation — L1982](plan-update-confirmation.md#^ref-b22d79c6-1982-0) (line 1982, col 0, score 1)
- [Promethean State Format — L503](promethean-state-format.md#^ref-23df6ddb-503-0) (line 503, col 0, score 1)
- [Prometheus Observability Stack — L1028](prometheus-observability-stack.md#^ref-e90b5a16-1028-0) (line 1028, col 0, score 1)
- [Prompt_Folder_Bootstrap — L759](prompt-folder-bootstrap.md#^ref-bd4f0976-759-0) (line 759, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L663](protocol-0-the-contradiction-engine.md#^ref-9a93a756-663-0) (line 663, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L759](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-759-0) (line 759, col 0, score 1)
- [Reawakening Duck — L654](reawakening-duck.md#^ref-59b5670f-654-0) (line 654, col 0, score 1)
- [ripple-propagation-demo — L570](ripple-propagation-demo.md#^ref-8430617b-570-0) (line 570, col 0, score 1)
- [schema-evolution-workflow — L1088](schema-evolution-workflow.md#^ref-d8059b6a-1088-0) (line 1088, col 0, score 1)
- [sibilant-macro-targets — L633](sibilant-macro-targets.md#^ref-c5c9a5c6-633-0) (line 633, col 0, score 1)
- [homeostasis-decay-formulas — L887](homeostasis-decay-formulas.md#^ref-37b5d236-887-0) (line 887, col 0, score 1)
- [i3-bluetooth-setup — L605](i3-bluetooth-setup.md#^ref-5e408692-605-0) (line 605, col 0, score 1)
- [Ice Box Reorganization — L581](ice-box-reorganization.md#^ref-291c7d91-581-0) (line 581, col 0, score 1)
- [komorebi-group-window-hack — L664](komorebi-group-window-hack.md#^ref-dd89372d-664-0) (line 664, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L782](layer1survivabilityenvelope.md#^ref-64a9f9f9-782-0) (line 782, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1218](migrate-to-provider-tenant-architecture.md#^ref-54382370-1218-0) (line 1218, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L662](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-662-0) (line 662, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L313](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-313-0) (line 313, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L299](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-299-0) (line 299, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L365](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-365-0) (line 365, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L533](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-533-0) (line 533, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L753](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-753-0) (line 753, col 0, score 1)
- [field-node-diagram-set — L635](field-node-diagram-set.md#^ref-22b989d5-635-0) (line 635, col 0, score 1)
- [field-node-diagram-visualizations — L525](field-node-diagram-visualizations.md#^ref-e9b27b06-525-0) (line 525, col 0, score 1)
- [Fnord Tracer Protocol — L961](fnord-tracer-protocol.md#^ref-fc21f824-961-0) (line 961, col 0, score 1)
- [graph-ds — L983](graph-ds.md#^ref-6620e2f2-983-0) (line 983, col 0, score 1)
- [heartbeat-fragment-demo — L562](heartbeat-fragment-demo.md#^ref-dd00677a-562-0) (line 562, col 0, score 1)
- [homeostasis-decay-formulas — L888](homeostasis-decay-formulas.md#^ref-37b5d236-888-0) (line 888, col 0, score 1)
- [i3-bluetooth-setup — L606](i3-bluetooth-setup.md#^ref-5e408692-606-0) (line 606, col 0, score 1)
- [Ice Box Reorganization — L582](ice-box-reorganization.md#^ref-291c7d91-582-0) (line 582, col 0, score 1)
- [komorebi-group-window-hack — L665](komorebi-group-window-hack.md#^ref-dd89372d-665-0) (line 665, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L677](chroma-toolkit-consolidation-plan.md#^ref-5020e892-677-0) (line 677, col 0, score 1)
- [Diagrams — L413](chunks/diagrams.md#^ref-45cd25b5-413-0) (line 413, col 0, score 1)
- [DSL — L338](chunks/dsl.md#^ref-e87bc036-338-0) (line 338, col 0, score 1)
- [JavaScript — L415](chunks/javascript.md#^ref-c1618c66-415-0) (line 415, col 0, score 1)
- [Math Fundamentals — L370](chunks/math-fundamentals.md#^ref-c6e87433-370-0) (line 370, col 0, score 1)
- [Services — L272](chunks/services.md#^ref-75ea4a6a-272-0) (line 272, col 0, score 1)
- [Shared — L358](chunks/shared.md#^ref-623a55f7-358-0) (line 358, col 0, score 1)
- [Simulation Demo — L287](chunks/simulation-demo.md#^ref-557309a3-287-0) (line 287, col 0, score 1)
- [Tooling — L212](chunks/tooling.md#^ref-6cb4943e-212-0) (line 212, col 0, score 1)
- [Window Management — L307](chunks/window-management.md#^ref-9e8ae388-307-0) (line 307, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L407](ducks-self-referential-perceptual-loop.md#^ref-71726f04-407-0) (line 407, col 0, score 1)
- [Simulation Demo — L138](chunks/simulation-demo.md#^ref-557309a3-138-0) (line 138, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L470](ducks-self-referential-perceptual-loop.md#^ref-71726f04-470-0) (line 470, col 0, score 1)
- [Dynamic Context Model for Web Components — L1684](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1684-0) (line 1684, col 0, score 1)
- [Eidolon Field Abstract Model — L492](eidolon-field-abstract-model.md#^ref-5e8b2388-492-0) (line 492, col 0, score 1)
- [eidolon-node-lifecycle — L241](eidolon-node-lifecycle.md#^ref-938eca9c-241-0) (line 241, col 0, score 1)
- [field-interaction-equations — L560](field-interaction-equations.md#^ref-b09141b7-560-0) (line 560, col 0, score 1)
- [field-node-diagram-outline — L503](field-node-diagram-outline.md#^ref-1f32c94a-503-0) (line 503, col 0, score 1)
- [Services — L320](chunks/services.md#^ref-75ea4a6a-320-0) (line 320, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L538](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-538-0) (line 538, col 0, score 1)
- [plan-update-confirmation — L2001](plan-update-confirmation.md#^ref-b22d79c6-2001-0) (line 2001, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L754](promethean-copilot-intent-engine.md#^ref-ae24a280-754-0) (line 754, col 0, score 1)
- [Promethean State Format — L509](promethean-state-format.md#^ref-23df6ddb-509-0) (line 509, col 0, score 1)
- [Prompt_Folder_Bootstrap — L773](prompt-folder-bootstrap.md#^ref-bd4f0976-773-0) (line 773, col 0, score 1)
- [Eidolon Field Abstract Model — L494](eidolon-field-abstract-model.md#^ref-5e8b2388-494-0) (line 494, col 0, score 0.99)
- [heartbeat-fragment-demo — L282](heartbeat-fragment-demo.md#^ref-dd00677a-282-0) (line 282, col 0, score 0.99)
- [field-node-diagram-set — L489](field-node-diagram-set.md#^ref-22b989d5-489-0) (line 489, col 0, score 1)
- [field-node-diagram-visualizations — L354](field-node-diagram-visualizations.md#^ref-e9b27b06-354-0) (line 354, col 0, score 1)
- [heartbeat-fragment-demo — L320](heartbeat-fragment-demo.md#^ref-dd00677a-320-0) (line 320, col 0, score 1)
- [homeostasis-decay-formulas — L329](homeostasis-decay-formulas.md#^ref-37b5d236-329-0) (line 329, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L318](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-318-0) (line 318, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L304](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-304-0) (line 304, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L539](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-539-0) (line 539, col 0, score 1)
- [plan-update-confirmation — L2002](plan-update-confirmation.md#^ref-b22d79c6-2002-0) (line 2002, col 0, score 1)
- [Services — L322](chunks/services.md#^ref-75ea4a6a-322-0) (line 322, col 0, score 1)
- [Simulation Demo — L141](chunks/simulation-demo.md#^ref-557309a3-141-0) (line 141, col 0, score 1)
- [Dynamic Context Model for Web Components — L1686](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1686-0) (line 1686, col 0, score 1)
- [eidolon-node-lifecycle — L243](eidolon-node-lifecycle.md#^ref-938eca9c-243-0) (line 243, col 0, score 1)
- [field-interaction-equations — L856](field-interaction-equations.md#^ref-b09141b7-856-0) (line 856, col 0, score 1)
- [field-node-diagram-outline — L506](field-node-diagram-outline.md#^ref-1f32c94a-506-0) (line 506, col 0, score 1)
- [field-node-diagram-set — L490](field-node-diagram-set.md#^ref-22b989d5-490-0) (line 490, col 0, score 1)
- [field-node-diagram-visualizations — L355](field-node-diagram-visualizations.md#^ref-e9b27b06-355-0) (line 355, col 0, score 1)
- [heartbeat-fragment-demo — L321](heartbeat-fragment-demo.md#^ref-dd00677a-321-0) (line 321, col 0, score 1)
- [homeostasis-decay-formulas — L743](homeostasis-decay-formulas.md#^ref-37b5d236-743-0) (line 743, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L319](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-319-0) (line 319, col 0, score 1)
- [Services — L323](chunks/services.md#^ref-75ea4a6a-323-0) (line 323, col 0, score 1)
- [Simulation Demo — L142](chunks/simulation-demo.md#^ref-557309a3-142-0) (line 142, col 0, score 1)
- [Eidolon Field Abstract Model — L764](eidolon-field-abstract-model.md#^ref-5e8b2388-764-0) (line 764, col 0, score 1)
- [eidolon-node-lifecycle — L244](eidolon-node-lifecycle.md#^ref-938eca9c-244-0) (line 244, col 0, score 1)
- [field-interaction-equations — L857](field-interaction-equations.md#^ref-b09141b7-857-0) (line 857, col 0, score 1)
- [field-node-diagram-set — L491](field-node-diagram-set.md#^ref-22b989d5-491-0) (line 491, col 0, score 1)
- [field-node-diagram-visualizations — L356](field-node-diagram-visualizations.md#^ref-e9b27b06-356-0) (line 356, col 0, score 1)
- [heartbeat-fragment-demo — L331](heartbeat-fragment-demo.md#^ref-dd00677a-331-0) (line 331, col 0, score 1)
- [Services — L324](chunks/services.md#^ref-75ea4a6a-324-0) (line 324, col 0, score 1)
- [Simulation Demo — L143](chunks/simulation-demo.md#^ref-557309a3-143-0) (line 143, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L473](ducks-self-referential-perceptual-loop.md#^ref-71726f04-473-0) (line 473, col 0, score 1)
- [Eidolon Field Abstract Model — L765](eidolon-field-abstract-model.md#^ref-5e8b2388-765-0) (line 765, col 0, score 1)
- [eidolon-node-lifecycle — L245](eidolon-node-lifecycle.md#^ref-938eca9c-245-0) (line 245, col 0, score 1)
- [field-interaction-equations — L858](field-interaction-equations.md#^ref-b09141b7-858-0) (line 858, col 0, score 1)
- [field-node-diagram-outline — L507](field-node-diagram-outline.md#^ref-1f32c94a-507-0) (line 507, col 0, score 1)
- [field-node-diagram-set — L492](field-node-diagram-set.md#^ref-22b989d5-492-0) (line 492, col 0, score 1)
- [field-node-diagram-visualizations — L357](field-node-diagram-visualizations.md#^ref-e9b27b06-357-0) (line 357, col 0, score 1)
- [heartbeat-fragment-demo — L332](heartbeat-fragment-demo.md#^ref-dd00677a-332-0) (line 332, col 0, score 1)
- [Services — L325](chunks/services.md#^ref-75ea4a6a-325-0) (line 325, col 0, score 1)
- [Simulation Demo — L144](chunks/simulation-demo.md#^ref-557309a3-144-0) (line 144, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L474](ducks-self-referential-perceptual-loop.md#^ref-71726f04-474-0) (line 474, col 0, score 1)
- [Dynamic Context Model for Web Components — L1688](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1688-0) (line 1688, col 0, score 1)
- [eidolon-node-lifecycle — L246](eidolon-node-lifecycle.md#^ref-938eca9c-246-0) (line 246, col 0, score 1)
- [field-interaction-equations — L859](field-interaction-equations.md#^ref-b09141b7-859-0) (line 859, col 0, score 1)
- [field-node-diagram-outline — L508](field-node-diagram-outline.md#^ref-1f32c94a-508-0) (line 508, col 0, score 1)
- [field-node-diagram-set — L493](field-node-diagram-set.md#^ref-22b989d5-493-0) (line 493, col 0, score 1)
- [field-node-diagram-visualizations — L358](field-node-diagram-visualizations.md#^ref-e9b27b06-358-0) (line 358, col 0, score 1)
- [heartbeat-fragment-demo — L333](heartbeat-fragment-demo.md#^ref-dd00677a-333-0) (line 333, col 0, score 1)
- [Dynamic Context Model for Web Components — L1689](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1689-0) (line 1689, col 0, score 1)
- [Eidolon Field Abstract Model — L766](eidolon-field-abstract-model.md#^ref-5e8b2388-766-0) (line 766, col 0, score 1)
- [field-interaction-equations — L860](field-interaction-equations.md#^ref-b09141b7-860-0) (line 860, col 0, score 1)
- [field-node-diagram-outline — L509](field-node-diagram-outline.md#^ref-1f32c94a-509-0) (line 509, col 0, score 1)
- [field-node-diagram-set — L494](field-node-diagram-set.md#^ref-22b989d5-494-0) (line 494, col 0, score 1)
- [field-node-diagram-visualizations — L359](field-node-diagram-visualizations.md#^ref-e9b27b06-359-0) (line 359, col 0, score 1)
- [heartbeat-fragment-demo — L334](heartbeat-fragment-demo.md#^ref-dd00677a-334-0) (line 334, col 0, score 1)
- [homeostasis-decay-formulas — L334](homeostasis-decay-formulas.md#^ref-37b5d236-334-0) (line 334, col 0, score 1)
- [Services — L327](chunks/services.md#^ref-75ea4a6a-327-0) (line 327, col 0, score 1)
- [Simulation Demo — L146](chunks/simulation-demo.md#^ref-557309a3-146-0) (line 146, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L476](ducks-self-referential-perceptual-loop.md#^ref-71726f04-476-0) (line 476, col 0, score 1)
- [Dynamic Context Model for Web Components — L1690](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1690-0) (line 1690, col 0, score 1)
- [eidolon-node-lifecycle — L247](eidolon-node-lifecycle.md#^ref-938eca9c-247-0) (line 247, col 0, score 1)
- [field-interaction-equations — L861](field-interaction-equations.md#^ref-b09141b7-861-0) (line 861, col 0, score 1)
- [field-node-diagram-outline — L510](field-node-diagram-outline.md#^ref-1f32c94a-510-0) (line 510, col 0, score 1)
- [field-node-diagram-set — L495](field-node-diagram-set.md#^ref-22b989d5-495-0) (line 495, col 0, score 1)
- [field-node-diagram-visualizations — L360](field-node-diagram-visualizations.md#^ref-e9b27b06-360-0) (line 360, col 0, score 1)
- [heartbeat-fragment-demo — L335](heartbeat-fragment-demo.md#^ref-dd00677a-335-0) (line 335, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L665](promethean-copilot-intent-engine.md#^ref-ae24a280-665-0) (line 665, col 0, score 1)
- [Promethean Dev Workflow Update — L568](promethean-dev-workflow-update.md#^ref-03a5578f-568-0) (line 568, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L364](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-364-0) (line 364, col 0, score 1)
- [Promethean Infrastructure Setup — L1500](promethean-infrastructure-setup.md#^ref-6deed6ac-1500-0) (line 1500, col 0, score 1)
- [Promethean State Format — L456](promethean-state-format.md#^ref-23df6ddb-456-0) (line 456, col 0, score 1)
- [Prompt_Folder_Bootstrap — L873](prompt-folder-bootstrap.md#^ref-bd4f0976-873-0) (line 873, col 0, score 1)
- [ripple-propagation-demo — L489](ripple-propagation-demo.md#^ref-8430617b-489-0) (line 489, col 0, score 1)
- [schema-evolution-workflow — L1120](schema-evolution-workflow.md#^ref-d8059b6a-1120-0) (line 1120, col 0, score 1)
- [sibilant-macro-targets — L842](sibilant-macro-targets.md#^ref-c5c9a5c6-842-0) (line 842, col 0, score 1)
- [eidolon-field-math-foundations — L810](eidolon-field-math-foundations.md#^ref-008f2ac0-810-0) (line 810, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L666](promethean-copilot-intent-engine.md#^ref-ae24a280-666-0) (line 666, col 0, score 1)
- [Promethean Dev Workflow Update — L569](promethean-dev-workflow-update.md#^ref-03a5578f-569-0) (line 569, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L365](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-365-0) (line 365, col 0, score 1)
- [Promethean Infrastructure Setup — L1501](promethean-infrastructure-setup.md#^ref-6deed6ac-1501-0) (line 1501, col 0, score 1)
- [Promethean State Format — L457](promethean-state-format.md#^ref-23df6ddb-457-0) (line 457, col 0, score 1)
- [Prompt_Folder_Bootstrap — L874](prompt-folder-bootstrap.md#^ref-bd4f0976-874-0) (line 874, col 0, score 1)
- [ripple-propagation-demo — L490](ripple-propagation-demo.md#^ref-8430617b-490-0) (line 490, col 0, score 1)
- [schema-evolution-workflow — L1121](schema-evolution-workflow.md#^ref-d8059b6a-1121-0) (line 1121, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L864](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-864-0) (line 864, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L667](promethean-copilot-intent-engine.md#^ref-ae24a280-667-0) (line 667, col 0, score 1)
- [Promethean Dev Workflow Update — L570](promethean-dev-workflow-update.md#^ref-03a5578f-570-0) (line 570, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L366](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-366-0) (line 366, col 0, score 1)
- [Promethean Infrastructure Setup — L1502](promethean-infrastructure-setup.md#^ref-6deed6ac-1502-0) (line 1502, col 0, score 1)
- [Promethean State Format — L458](promethean-state-format.md#^ref-23df6ddb-458-0) (line 458, col 0, score 1)
- [Prompt_Folder_Bootstrap — L875](prompt-folder-bootstrap.md#^ref-bd4f0976-875-0) (line 875, col 0, score 1)
- [ripple-propagation-demo — L491](ripple-propagation-demo.md#^ref-8430617b-491-0) (line 491, col 0, score 1)
- [schema-evolution-workflow — L1122](schema-evolution-workflow.md#^ref-d8059b6a-1122-0) (line 1122, col 0, score 1)
- [Eidolon Field Abstract Model — L885](eidolon-field-abstract-model.md#^ref-5e8b2388-885-0) (line 885, col 0, score 1)
- [eidolon-node-lifecycle — L341](eidolon-node-lifecycle.md#^ref-938eca9c-341-0) (line 341, col 0, score 1)
- [field-dynamics-math-blocks — L805](field-dynamics-math-blocks.md#^ref-7cfc230d-805-0) (line 805, col 0, score 1)
- [field-interaction-equations — L793](field-interaction-equations.md#^ref-b09141b7-793-0) (line 793, col 0, score 1)
- [field-node-diagram-outline — L581](field-node-diagram-outline.md#^ref-1f32c94a-581-0) (line 581, col 0, score 1)
- [field-node-diagram-set — L585](field-node-diagram-set.md#^ref-22b989d5-585-0) (line 585, col 0, score 1)
- [field-node-diagram-visualizations — L458](field-node-diagram-visualizations.md#^ref-e9b27b06-458-0) (line 458, col 0, score 1)
- [graph-ds — L903](graph-ds.md#^ref-6620e2f2-903-0) (line 903, col 0, score 1)
- [heartbeat-fragment-demo — L463](heartbeat-fragment-demo.md#^ref-dd00677a-463-0) (line 463, col 0, score 1)
- [field-interaction-equations — L794](field-interaction-equations.md#^ref-b09141b7-794-0) (line 794, col 0, score 1)
- [homeostasis-decay-formulas — L778](homeostasis-decay-formulas.md#^ref-37b5d236-778-0) (line 778, col 0, score 1)
- [Ice Box Reorganization — L550](ice-box-reorganization.md#^ref-291c7d91-550-0) (line 550, col 0, score 1)
- [komorebi-group-window-hack — L540](komorebi-group-window-hack.md#^ref-dd89372d-540-0) (line 540, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1391](migrate-to-provider-tenant-architecture.md#^ref-54382370-1391-0) (line 1391, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L347](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-347-0) (line 347, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L669](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-669-0) (line 669, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L867](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-867-0) (line 867, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L1131](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-1131-0) (line 1131, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L1209](performance-optimized-polyglot-bridge.md#^ref-f5579967-1209-0) (line 1209, col 0, score 1)
- [polyglot-repl-interface-layer — L572](polyglot-repl-interface-layer.md#^ref-9c79206d-572-0) (line 572, col 0, score 1)
- [field-node-diagram-outline — L583](field-node-diagram-outline.md#^ref-1f32c94a-583-0) (line 583, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L1132](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-1132-0) (line 1132, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L1210](performance-optimized-polyglot-bridge.md#^ref-f5579967-1210-0) (line 1210, col 0, score 1)
- [polyglot-repl-interface-layer — L573](polyglot-repl-interface-layer.md#^ref-9c79206d-573-0) (line 573, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L671](promethean-copilot-intent-engine.md#^ref-ae24a280-671-0) (line 671, col 0, score 1)
- [Promethean Dev Workflow Update — L574](promethean-dev-workflow-update.md#^ref-03a5578f-574-0) (line 574, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L370](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-370-0) (line 370, col 0, score 1)
- [Promethean Infrastructure Setup — L1506](promethean-infrastructure-setup.md#^ref-6deed6ac-1506-0) (line 1506, col 0, score 1)
- [Promethean State Format — L462](promethean-state-format.md#^ref-23df6ddb-462-0) (line 462, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L672](promethean-copilot-intent-engine.md#^ref-ae24a280-672-0) (line 672, col 0, score 1)
- [Promethean Dev Workflow Update — L575](promethean-dev-workflow-update.md#^ref-03a5578f-575-0) (line 575, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L371](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-371-0) (line 371, col 0, score 1)
- [Promethean Infrastructure Setup — L1507](promethean-infrastructure-setup.md#^ref-6deed6ac-1507-0) (line 1507, col 0, score 1)
- [Promethean State Format — L463](promethean-state-format.md#^ref-23df6ddb-463-0) (line 463, col 0, score 1)
- [Prompt_Folder_Bootstrap — L880](prompt-folder-bootstrap.md#^ref-bd4f0976-880-0) (line 880, col 0, score 1)
- [ripple-propagation-demo — L496](ripple-propagation-demo.md#^ref-8430617b-496-0) (line 496, col 0, score 1)
- [schema-evolution-workflow — L1127](schema-evolution-workflow.md#^ref-d8059b6a-1127-0) (line 1127, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L673](promethean-copilot-intent-engine.md#^ref-ae24a280-673-0) (line 673, col 0, score 1)
- [Promethean Dev Workflow Update — L576](promethean-dev-workflow-update.md#^ref-03a5578f-576-0) (line 576, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L372](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-372-0) (line 372, col 0, score 1)
- [Promethean Infrastructure Setup — L1508](promethean-infrastructure-setup.md#^ref-6deed6ac-1508-0) (line 1508, col 0, score 1)
- [Promethean State Format — L464](promethean-state-format.md#^ref-23df6ddb-464-0) (line 464, col 0, score 1)
- [Prompt_Folder_Bootstrap — L881](prompt-folder-bootstrap.md#^ref-bd4f0976-881-0) (line 881, col 0, score 1)
- [ripple-propagation-demo — L497](ripple-propagation-demo.md#^ref-8430617b-497-0) (line 497, col 0, score 1)
- [schema-evolution-workflow — L1128](schema-evolution-workflow.md#^ref-d8059b6a-1128-0) (line 1128, col 0, score 1)
- [sibilant-macro-targets — L850](sibilant-macro-targets.md#^ref-c5c9a5c6-850-0) (line 850, col 0, score 1)
- [eidolon-field-math-foundations — L818](eidolon-field-math-foundations.md#^ref-008f2ac0-818-0) (line 818, col 0, score 1)
- [Promethean Dev Workflow Update — L577](promethean-dev-workflow-update.md#^ref-03a5578f-577-0) (line 577, col 0, score 1)
- [schema-evolution-workflow — L1129](schema-evolution-workflow.md#^ref-d8059b6a-1129-0) (line 1129, col 0, score 1)
- [Stateful Partitions and Rebalancing — L1163](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-1163-0) (line 1163, col 0, score 1)
- [windows-tiling-with-autohotkey — L592](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-592-0) (line 592, col 0, score 1)
- [Dynamic Context Model for Web Components — L1406](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1406-0) (line 1406, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L234](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-234-0) (line 234, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L399](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-399-0) (line 399, col 0, score 1)
- [plan-update-confirmation — L1885](plan-update-confirmation.md#^ref-b22d79c6-1885-0) (line 1885, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L569](promethean-copilot-intent-engine.md#^ref-ae24a280-569-0) (line 569, col 0, score 1)
- [Promethean State Format — L517](promethean-state-format.md#^ref-23df6ddb-517-0) (line 517, col 0, score 1)
- [Prometheus Observability Stack — L1121](prometheus-observability-stack.md#^ref-e90b5a16-1121-0) (line 1121, col 0, score 1)
- [Prompt_Folder_Bootstrap — L764](prompt-folder-bootstrap.md#^ref-bd4f0976-764-0) (line 764, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L982](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-982-0) (line 982, col 0, score 1)
- [Dynamic Context Model for Web Components — L1407](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1407-0) (line 1407, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L235](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-235-0) (line 235, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L400](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-400-0) (line 400, col 0, score 1)
- [plan-update-confirmation — L1886](plan-update-confirmation.md#^ref-b22d79c6-1886-0) (line 1886, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L570](promethean-copilot-intent-engine.md#^ref-ae24a280-570-0) (line 570, col 0, score 1)
- [Promethean State Format — L518](promethean-state-format.md#^ref-23df6ddb-518-0) (line 518, col 0, score 1)
- [Prometheus Observability Stack — L1122](prometheus-observability-stack.md#^ref-e90b5a16-1122-0) (line 1122, col 0, score 1)
- [Dynamic Context Model for Web Components — L1408](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1408-0) (line 1408, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L236](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-236-0) (line 236, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L401](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-401-0) (line 401, col 0, score 1)
- [plan-update-confirmation — L1887](plan-update-confirmation.md#^ref-b22d79c6-1887-0) (line 1887, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L571](promethean-copilot-intent-engine.md#^ref-ae24a280-571-0) (line 571, col 0, score 1)
- [Promethean State Format — L519](promethean-state-format.md#^ref-23df6ddb-519-0) (line 519, col 0, score 1)
- [Prometheus Observability Stack — L1123](prometheus-observability-stack.md#^ref-e90b5a16-1123-0) (line 1123, col 0, score 1)
- [Prompt_Folder_Bootstrap — L766](prompt-folder-bootstrap.md#^ref-bd4f0976-766-0) (line 766, col 0, score 1)
- [The Jar of Echoes — L504](the-jar-of-echoes.md#^ref-18138627-504-0) (line 504, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L1067](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-1067-0) (line 1067, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L780](chroma-toolkit-consolidation-plan.md#^ref-5020e892-780-0) (line 780, col 0, score 0.99)
- [Math Fundamentals — L124](chunks/math-fundamentals.md#^ref-c6e87433-124-0) (line 124, col 0, score 0.99)
- [Simulation Demo — L270](chunks/simulation-demo.md#^ref-557309a3-270-0) (line 270, col 0, score 0.99)
- [Eidolon Field Abstract Model — L844](eidolon-field-abstract-model.md#^ref-5e8b2388-844-0) (line 844, col 0, score 0.99)
- [eidolon-field-math-foundations — L583](eidolon-field-math-foundations.md#^ref-008f2ac0-583-0) (line 583, col 0, score 0.99)
- [eidolon-node-lifecycle — L395](eidolon-node-lifecycle.md#^ref-938eca9c-395-0) (line 395, col 0, score 0.99)
- [Agent Tasks: Persistence Migration to DualStore — L985](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-985-0) (line 985, col 0, score 1)
- [Dynamic Context Model for Web Components — L1409](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1409-0) (line 1409, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L238](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-238-0) (line 238, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L403](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-403-0) (line 403, col 0, score 1)
- [plan-update-confirmation — L1889](plan-update-confirmation.md#^ref-b22d79c6-1889-0) (line 1889, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L573](promethean-copilot-intent-engine.md#^ref-ae24a280-573-0) (line 573, col 0, score 1)
- [Promethean State Format — L521](promethean-state-format.md#^ref-23df6ddb-521-0) (line 521, col 0, score 1)
- [Prometheus Observability Stack — L1125](prometheus-observability-stack.md#^ref-e90b5a16-1125-0) (line 1125, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L986](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-986-0) (line 986, col 0, score 1)
- [Dynamic Context Model for Web Components — L1410](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1410-0) (line 1410, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L239](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-239-0) (line 239, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L404](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-404-0) (line 404, col 0, score 1)
- [plan-update-confirmation — L1890](plan-update-confirmation.md#^ref-b22d79c6-1890-0) (line 1890, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L574](promethean-copilot-intent-engine.md#^ref-ae24a280-574-0) (line 574, col 0, score 1)
- [Promethean State Format — L522](promethean-state-format.md#^ref-23df6ddb-522-0) (line 522, col 0, score 1)
- [Prometheus Observability Stack — L1126](prometheus-observability-stack.md#^ref-e90b5a16-1126-0) (line 1126, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L987](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-987-0) (line 987, col 0, score 1)
- [Dynamic Context Model for Web Components — L1411](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1411-0) (line 1411, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L405](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-405-0) (line 405, col 0, score 1)
- [plan-update-confirmation — L1891](plan-update-confirmation.md#^ref-b22d79c6-1891-0) (line 1891, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L575](promethean-copilot-intent-engine.md#^ref-ae24a280-575-0) (line 575, col 0, score 1)
- [Promethean State Format — L523](promethean-state-format.md#^ref-23df6ddb-523-0) (line 523, col 0, score 1)
- [Prometheus Observability Stack — L1127](prometheus-observability-stack.md#^ref-e90b5a16-1127-0) (line 1127, col 0, score 1)
- [Prompt_Folder_Bootstrap — L770](prompt-folder-bootstrap.md#^ref-bd4f0976-770-0) (line 770, col 0, score 1)
- [Dynamic Context Model for Web Components — L1412](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1412-0) (line 1412, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L240](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-240-0) (line 240, col 0, score 1)
- [plan-update-confirmation — L1892](plan-update-confirmation.md#^ref-b22d79c6-1892-0) (line 1892, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L576](promethean-copilot-intent-engine.md#^ref-ae24a280-576-0) (line 576, col 0, score 1)
- [Promethean State Format — L524](promethean-state-format.md#^ref-23df6ddb-524-0) (line 524, col 0, score 1)
- [Prometheus Observability Stack — L1128](prometheus-observability-stack.md#^ref-e90b5a16-1128-0) (line 1128, col 0, score 1)
- [Prompt_Folder_Bootstrap — L771](prompt-folder-bootstrap.md#^ref-bd4f0976-771-0) (line 771, col 0, score 1)
- [Dynamic Context Model for Web Components — L1650](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1650-0) (line 1650, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L164](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-164-0) (line 164, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L236](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-236-0) (line 236, col 0, score 1)
- [plan-update-confirmation — L1893](plan-update-confirmation.md#^ref-b22d79c6-1893-0) (line 1893, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L577](promethean-copilot-intent-engine.md#^ref-ae24a280-577-0) (line 577, col 0, score 1)
- [Promethean State Format — L525](promethean-state-format.md#^ref-23df6ddb-525-0) (line 525, col 0, score 1)
- [Prompt_Folder_Bootstrap — L781](prompt-folder-bootstrap.md#^ref-bd4f0976-781-0) (line 781, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L560](protocol-0-the-contradiction-engine.md#^ref-9a93a756-560-0) (line 560, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L990](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-990-0) (line 990, col 0, score 1)
- [Dynamic Context Model for Web Components — L1651](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1651-0) (line 1651, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L165](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-165-0) (line 165, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L237](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-237-0) (line 237, col 0, score 1)
- [plan-update-confirmation — L1894](plan-update-confirmation.md#^ref-b22d79c6-1894-0) (line 1894, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L578](promethean-copilot-intent-engine.md#^ref-ae24a280-578-0) (line 578, col 0, score 1)
- [Promethean State Format — L526](promethean-state-format.md#^ref-23df6ddb-526-0) (line 526, col 0, score 1)
- [Prompt_Folder_Bootstrap — L782](prompt-folder-bootstrap.md#^ref-bd4f0976-782-0) (line 782, col 0, score 1)
- [Dynamic Context Model for Web Components — L1652](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1652-0) (line 1652, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L166](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-166-0) (line 166, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L238](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-238-0) (line 238, col 0, score 1)
- [plan-update-confirmation — L1895](plan-update-confirmation.md#^ref-b22d79c6-1895-0) (line 1895, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L579](promethean-copilot-intent-engine.md#^ref-ae24a280-579-0) (line 579, col 0, score 1)
- [Promethean State Format — L527](promethean-state-format.md#^ref-23df6ddb-527-0) (line 527, col 0, score 1)
- [Prompt_Folder_Bootstrap — L783](prompt-folder-bootstrap.md#^ref-bd4f0976-783-0) (line 783, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L562](protocol-0-the-contradiction-engine.md#^ref-9a93a756-562-0) (line 562, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L992](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-992-0) (line 992, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L167](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-167-0) (line 167, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L239](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-239-0) (line 239, col 0, score 1)
- [plan-update-confirmation — L1896](plan-update-confirmation.md#^ref-b22d79c6-1896-0) (line 1896, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L580](promethean-copilot-intent-engine.md#^ref-ae24a280-580-0) (line 580, col 0, score 1)
- [Promethean State Format — L528](promethean-state-format.md#^ref-23df6ddb-528-0) (line 528, col 0, score 1)
- [Prompt_Folder_Bootstrap — L784](prompt-folder-bootstrap.md#^ref-bd4f0976-784-0) (line 784, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L563](protocol-0-the-contradiction-engine.md#^ref-9a93a756-563-0) (line 563, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L993](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-993-0) (line 993, col 0, score 1)
- [Dynamic Context Model for Web Components — L1653](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1653-0) (line 1653, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L168](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-168-0) (line 168, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L240](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-240-0) (line 240, col 0, score 1)
- [plan-update-confirmation — L1897](plan-update-confirmation.md#^ref-b22d79c6-1897-0) (line 1897, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L581](promethean-copilot-intent-engine.md#^ref-ae24a280-581-0) (line 581, col 0, score 1)
- [Promethean State Format — L529](promethean-state-format.md#^ref-23df6ddb-529-0) (line 529, col 0, score 1)
- [Prompt_Folder_Bootstrap — L785](prompt-folder-bootstrap.md#^ref-bd4f0976-785-0) (line 785, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L994](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-994-0) (line 994, col 0, score 1)
- [Dynamic Context Model for Web Components — L1654](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1654-0) (line 1654, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L169](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-169-0) (line 169, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L241](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-241-0) (line 241, col 0, score 1)
- [plan-update-confirmation — L1898](plan-update-confirmation.md#^ref-b22d79c6-1898-0) (line 1898, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L582](promethean-copilot-intent-engine.md#^ref-ae24a280-582-0) (line 582, col 0, score 1)
- [Promethean State Format — L530](promethean-state-format.md#^ref-23df6ddb-530-0) (line 530, col 0, score 1)
- [Prompt_Folder_Bootstrap — L786](prompt-folder-bootstrap.md#^ref-bd4f0976-786-0) (line 786, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L995](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-995-0) (line 995, col 0, score 1)
- [Dynamic Context Model for Web Components — L1655](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1655-0) (line 1655, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L242](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-242-0) (line 242, col 0, score 1)
- [plan-update-confirmation — L1899](plan-update-confirmation.md#^ref-b22d79c6-1899-0) (line 1899, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L583](promethean-copilot-intent-engine.md#^ref-ae24a280-583-0) (line 583, col 0, score 1)
- [Promethean State Format — L531](promethean-state-format.md#^ref-23df6ddb-531-0) (line 531, col 0, score 1)
- [Prompt_Folder_Bootstrap — L787](prompt-folder-bootstrap.md#^ref-bd4f0976-787-0) (line 787, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L566](protocol-0-the-contradiction-engine.md#^ref-9a93a756-566-0) (line 566, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L996](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-996-0) (line 996, col 0, score 1)
- [Dynamic Context Model for Web Components — L1656](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1656-0) (line 1656, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L170](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-170-0) (line 170, col 0, score 1)
- [plan-update-confirmation — L1900](plan-update-confirmation.md#^ref-b22d79c6-1900-0) (line 1900, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L584](promethean-copilot-intent-engine.md#^ref-ae24a280-584-0) (line 584, col 0, score 1)
- [Promethean State Format — L532](promethean-state-format.md#^ref-23df6ddb-532-0) (line 532, col 0, score 1)
- [Prompt_Folder_Bootstrap — L788](prompt-folder-bootstrap.md#^ref-bd4f0976-788-0) (line 788, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L567](protocol-0-the-contradiction-engine.md#^ref-9a93a756-567-0) (line 567, col 0, score 1)
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
- [ParticleSimulationWithCanvasAndFFmpeg — L772](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-772-0) (line 772, col 0, score 1)
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
- [ParticleSimulationWithCanvasAndFFmpeg — L846](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-846-0) (line 846, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L880](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-880-0) (line 880, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L1178](performance-optimized-polyglot-bridge.md#^ref-f5579967-1178-0) (line 1178, col 0, score 1)
- [Pipeline Enhancements — L104](pipeline-enhancements.md#^ref-e2135d9f-104-0) (line 104, col 0, score 1)
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
- [AI-First-OS-Model-Context-Protocol — L135](ai-first-os-model-context-protocol.md#^ref-618198f4-135-0) (line 135, col 0, score 0.99)
- [Pipeline Enhancements — L73](pipeline-enhancements.md#^ref-e2135d9f-73-0) (line 73, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L233](promethean-copilot-intent-engine.md#^ref-ae24a280-233-0) (line 233, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L511](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-511-0) (line 511, col 0, score 0.99)
- [Canonical Org-Babel Matplotlib Animation Template — L856](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-856-0) (line 856, col 0, score 0.98)
- [Creative Moments — L744](creative-moments.md#^ref-10d98225-744-0) (line 744, col 0, score 0.98)
- [Duck's Attractor States — L994](ducks-attractor-states.md#^ref-13951643-994-0) (line 994, col 0, score 0.98)
- [eidolon-field-math-foundations — L1142](eidolon-field-math-foundations.md#^ref-008f2ac0-1142-0) (line 1142, col 0, score 0.98)
- [Pipeline Enhancements — L75](pipeline-enhancements.md#^ref-e2135d9f-75-0) (line 75, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L513](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-513-0) (line 513, col 0, score 0.99)
- [Canonical Org-Babel Matplotlib Animation Template — L569](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-569-0) (line 569, col 0, score 0.98)
- [Duck's Attractor States — L1759](ducks-attractor-states.md#^ref-13951643-1759-0) (line 1759, col 0, score 0.98)
- [eidolon-field-math-foundations — L1093](eidolon-field-math-foundations.md#^ref-008f2ac0-1093-0) (line 1093, col 0, score 0.98)
- [Promethean Dev Workflow Update — L1093](promethean-dev-workflow-update.md#^ref-03a5578f-1093-0) (line 1093, col 0, score 0.98)
- [The Jar of Echoes — L876](the-jar-of-echoes.md#^ref-18138627-876-0) (line 876, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L1104](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-1104-0) (line 1104, col 0, score 0.98)
- [Promethean Infrastructure Setup — L1654](promethean-infrastructure-setup.md#^ref-6deed6ac-1654-0) (line 1654, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L291](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-291-0) (line 291, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L229](promethean-copilot-intent-engine.md#^ref-ae24a280-229-0) (line 229, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L732](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-732-0) (line 732, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L422](promethean-copilot-intent-engine.md#^ref-ae24a280-422-0) (line 422, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L656](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-656-0) (line 656, col 0, score 0.99)
- [Model Upgrade Calm-Down Guide — L447](model-upgrade-calm-down-guide.md#^ref-db74343f-447-0) (line 447, col 0, score 0.99)
- [Promethean Pipelines — L547](promethean-pipelines.md#^ref-8b8e6103-547-0) (line 547, col 0, score 0.99)
- [Promethean Infrastructure Setup — L1658](promethean-infrastructure-setup.md#^ref-6deed6ac-1658-0) (line 1658, col 0, score 1)
- [eidolon-field-math-foundations — L602](eidolon-field-math-foundations.md#^ref-008f2ac0-602-0) (line 602, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L1253](migrate-to-provider-tenant-architecture.md#^ref-54382370-1253-0) (line 1253, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L902](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-902-0) (line 902, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L1154](performance-optimized-polyglot-bridge.md#^ref-f5579967-1154-0) (line 1154, col 0, score 0.99)
- [Post-Linguistic Transhuman Design Frameworks — L404](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-404-0) (line 404, col 0, score 0.99)
- [Promethean Pipelines — L603](promethean-pipelines.md#^ref-8b8e6103-603-0) (line 603, col 0, score 0.99)
- [Prometheus Observability Stack — L817](prometheus-observability-stack.md#^ref-e90b5a16-817-0) (line 817, col 0, score 0.99)
- [Promethean Infrastructure Setup — L1659](promethean-infrastructure-setup.md#^ref-6deed6ac-1659-0) (line 1659, col 0, score 1)
- [Duck's Attractor States — L2561](ducks-attractor-states.md#^ref-13951643-2561-0) (line 2561, col 0, score 0.95)
- [Duck's Attractor States — L2601](ducks-attractor-states.md#^ref-13951643-2601-0) (line 2601, col 0, score 0.95)
- [eidolon-field-math-foundations — L7873](eidolon-field-math-foundations.md#^ref-008f2ac0-7873-0) (line 7873, col 0, score 0.94)
- [Duck's Attractor States — L2577](ducks-attractor-states.md#^ref-13951643-2577-0) (line 2577, col 0, score 0.94)
- [Prompt_Folder_Bootstrap — L529](prompt-folder-bootstrap.md#^ref-bd4f0976-529-0) (line 529, col 0, score 0.94)
- [eidolon-field-math-foundations — L7883](eidolon-field-math-foundations.md#^ref-008f2ac0-7883-0) (line 7883, col 0, score 0.94)
- [Eidolon Field Abstract Model — L474](eidolon-field-abstract-model.md#^ref-5e8b2388-474-0) (line 474, col 0, score 0.94)
- [Agent Tasks: Persistence Migration to DualStore — L733](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-733-0) (line 733, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L837](chroma-toolkit-consolidation-plan.md#^ref-5020e892-837-0) (line 837, col 0, score 0.99)
- [Diagrams — L320](chunks/diagrams.md#^ref-45cd25b5-320-0) (line 320, col 0, score 0.99)
- [Debugging Broker Connections and Agent Behavior — L373](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-373-0) (line 373, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L1300](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1300-0) (line 1300, col 0, score 0.99)
- [eidolon-field-math-foundations — L604](eidolon-field-math-foundations.md#^ref-008f2ac0-604-0) (line 604, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L1255](migrate-to-provider-tenant-architecture.md#^ref-54382370-1255-0) (line 1255, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L904](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-904-0) (line 904, col 0, score 0.99)
- [Promethean Infrastructure Setup — L1661](promethean-infrastructure-setup.md#^ref-6deed6ac-1661-0) (line 1661, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L734](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-734-0) (line 734, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L838](chroma-toolkit-consolidation-plan.md#^ref-5020e892-838-0) (line 838, col 0, score 0.99)
- [Diagrams — L321](chunks/diagrams.md#^ref-45cd25b5-321-0) (line 321, col 0, score 0.99)
- [Debugging Broker Connections and Agent Behavior — L374](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-374-0) (line 374, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L1301](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1301-0) (line 1301, col 0, score 0.99)
- [eidolon-field-math-foundations — L605](eidolon-field-math-foundations.md#^ref-008f2ac0-605-0) (line 605, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L1256](migrate-to-provider-tenant-architecture.md#^ref-54382370-1256-0) (line 1256, col 0, score 0.99)
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
- [Self-Agency in AI Interaction — L418](self-agency-in-ai-interaction.md#^ref-49a9a860-418-0) (line 418, col 0, score 1)
- [Smoke Resonance Visualizations — L479](smoke-resonance-visualizations.md#^ref-ac9d3ac5-479-0) (line 479, col 0, score 1)
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
- [Smoke Resonance Visualizations — L482](smoke-resonance-visualizations.md#^ref-ac9d3ac5-482-0) (line 482, col 0, score 1)
- [Local-Only-LLM-Workflow — L7](local-only-llm-workflow.md#^ref-9a8ab57e-7-0) (line 7, col 0, score 1)
- [Smoke Resonance Visualizations — L483](smoke-resonance-visualizations.md#^ref-ac9d3ac5-483-0) (line 483, col 0, score 1)
- [Stateful Partitions and Rebalancing — L1321](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-1321-0) (line 1321, col 0, score 1)
- [Tracing the Signal — L561](tracing-the-signal.md#^ref-c3cd4f65-561-0) (line 561, col 0, score 1)
- [ts-to-lisp-transpiler — L522](ts-to-lisp-transpiler.md#^ref-ba11486b-522-0) (line 522, col 0, score 1)
- [typed-struct-compiler — L1015](typed-struct-compiler.md#^ref-78eeedf7-1015-0) (line 1015, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L1228](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-1228-0) (line 1228, col 0, score 1)
- [Unique Concepts — L173](unique-concepts.md#^ref-ed6f3fc9-173-0) (line 173, col 0, score 1)
- [zero-copy-snapshots-and-workers — L1057](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-1057-0) (line 1057, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L513](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-513-0) (line 513, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
