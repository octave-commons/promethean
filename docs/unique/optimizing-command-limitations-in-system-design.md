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
  - Operations
  - Shared
  - Window Management
  - Debugging Broker Connections and Agent Behavior
  - DuckDuckGoSearchPipeline
  - Duck's Self-Referential Perceptual Loop
  - Dynamic Context Model for Web Components
  - Eidolon Field Abstract Model
  - Factorio AI with External Agents
  - Fnord Tracer Protocol
  - Functional Embedding Pipeline Refactor
  - graph-ds
  - i3-bluetooth-setup
  - Tracing the Signal
  - Protocol_0_The_Contradiction_Engine
  - Model Upgrade Calm-Down Guide
  - Diagrams
  - JavaScript
  - Math Fundamentals
  - Services
  - Simulation Demo
  - Tooling
  - Creative Moments
  - Duck's Attractor States
  - eidolon-field-math-foundations
  - eidolon-node-lifecycle
  - field-node-diagram-visualizations
  - Functional Refactor of TypeScript Document Processing
  - heartbeat-fragment-demo
  - komorebi-group-window-hack
  - Layer1SurvivabilityEnvelope
  - Chroma Toolkit Consolidation Plan
  - DSL
  - Promethean Infrastructure Setup
  - Performance-Optimized-Polyglot-Bridge
  - Promethean Documentation Pipeline Overview
  - Promethean Chat Activity Report
  - The Jar of Echoes
  - Promethean Dev Workflow Update
  - Promethean Pipelines
  - Promethean Workflow Optimization
  - Prometheus Observability Stack
  - Prompt_Folder_Bootstrap
  - ts-to-lisp-transpiler
  - Per-Domain Policy System for JS Crawler
  - Pipeline Enhancements
  - plan-update-confirmation
  - polyglot-repl-interface-layer
  - Post-Linguistic Transhuman Design Frameworks
  - Promethean-Copilot-Intent-Engine
  - Docops Feature Updates
  - Promethean_Eidolon_Synchronicity_Model
  - Promethean State Format
  - NPU Voice Code and Sensory Integration
  - Obsidian ChatGPT Plugin Integration Guide
  - Obsidian ChatGPT Plugin Integration
  - obsidian-ignore-node-modules-regex
  - Obsidian Task Generation
  - Obsidian Templating Plugins Integration Guide
  - field-dynamics-math-blocks
  - field-interaction-equations
  - field-node-diagram-outline
  - field-node-diagram-set
  - Migrate to Provider-Tenant Architecture
  - ParticleSimulationWithCanvasAndFFmpeg
  - MindfulRobotIntegration
  - homeostasis-decay-formulas
  - Ice Box Reorganization
  - windows-tiling-with-autohotkey
  - Provider-Agnostic Chat Panel Implementation
  - Pure TypeScript Search Microservice
  - Reawakening Duck
  - Self-Agency in AI Interaction
  - TypeScript Patch for Tool Calling Support
  - Redirecting Standard Error
  - ripple-propagation-demo
  - schema-evolution-workflow
  - Promethean Notes
  - promethean-requirements
  - unique-templates
  - typed-struct-compiler
  - Unique Concepts
  - Unique Info Dump Index
  - Promethean Data Sync Protocol
  - Promethean Documentation Overview
  - Promethean Documentation Update
  - zero-copy-snapshots-and-workers
  - sibilant-macro-targets
  - Stateful Partitions and Rebalancing
  - Smoke Resonance Visualizations
  - Synchronicity Waves and Web
  - Mindful Prioritization
  - OpenAPI Validation Report
  - Mathematical Samplers
  - Model Selection for Lightweight Conversational Tasks
  - Mathematics Sampler
  - Self-Improving Documentation Tool
  - Fastify Static Files Plugin
  - Git Commit Optimization for Code Reviews
  - run-step-api
  - universal-intention-code-fabric
related_to_uuid:
  - f1add613-656e-4bec-b52b-193fd78c4642
  - 623a55f7-685c-486b-abaf-469da1bbbb69
  - 9e8ae388-767a-4ea8-9f2e-88801291d947
  - 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
  - e979c50f-69bb-48b0-8417-e1ee1b31c0c0
  - 71726f04-eb1c-42a5-a5fe-d8209de6e159
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - a4d90289-798d-44a0-a8e8-a055ae12fb52
  - fc21f824-4244-4030-a48e-c4170160ea1d
  - a4a25141-6380-40b9-9cd7-b554b246b303
  - 6620e2f2-de6d-45d8-a722-5d26e160b370
  - 5e408692-0e74-400e-a617-84247c7353ad
  - c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
  - 9a93a756-6d33-45d1-aca9-51b74f2b33d2
  - db74343f-8f84-43a3-adb2-499c6f00be1c
  - 45cd25b5-ed36-49ab-82c8-10d0903e34db
  - c1618c66-f73a-4e04-9bfa-ef38755f7acc
  - c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
  - 75ea4a6a-8270-488d-9d37-799c288e5f70
  - 557309a3-c906-4e97-8867-89ffe151790c
  - 6cb4943e-8267-4e27-8618-2ce0a464d173
  - 10d98225-12e0-4212-8e15-88b57cf7bee5
  - 13951643-1741-46bb-89dc-1beebb122633
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
  - e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
  - 1cfae310-35dc-49c2-98f1-b186da25d84b
  - dd00677a-2280-45a7-91af-0728b21af3ad
  - dd89372d-10de-42a9-8c96-6bc13ea36d02
  - 64a9f9f9-58ee-4996-bdaf-9373845c6b29
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - e87bc036-1570-419e-a558-f45b9c0db698
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - f5579967-762d-4cfd-851e-4f71b4cb77a1
  - 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
  - 18344cf9-0c49-4a71-b6c8-b8d84d660fca
  - 18138627-a348-4fbb-b447-410dfb400564
  - 03a5578f-d689-45db-95e9-11300e5eee6f
  - 8b8e6103-30a4-4d66-b5f2-87db1612b587
  - d614d983-7795-491f-9437-09f3a43f72cf
  - e90b5a16-d58f-424d-bd36-70e9bd2861ad
  - bd4f0976-0d5b-47f6-a20a-0601d1842dc1
  - ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
  - c03020e1-e3e7-48bf-aa7e-aa740c601b63
  - e2135d9f-c69d-47ee-9b17-0b05e98dc748
  - b22d79c6-825b-4cd3-b0d3-1cef0532bb54
  - 9c79206d-4cb9-4f00-87e0-782dcea37bc7
  - 6bcff92c-4224-453d-9993-1be8d37d47c3
  - ae24a280-678e-4c0b-8cc4-56667fa04172
  - cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
  - 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
  - 23df6ddb-05cf-4639-8201-f8291f8a6026
  - 5a02283e-4281-4930-9ca7-e27849de11bd
  - 1d3d6c3a-039e-4b96-93c1-95854945e248
  - ca8e1399-77bf-4f77-82a3-3f703b68706d
  - ffb9b2a9-744d-4a53-9565-130fceae0832
  - 9b694a91-dec5-4708-9462-3f71000ba925
  - b39dc9d4-63e2-42d4-bbcd-041ef3167bca
  - 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
  - b09141b7-544f-4c8e-8f49-bf76cecaacbb
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - 22b989d5-f4aa-4880-8632-709c21830f83
  - 54382370-1931-4a19-a634-46735708a9ea
  - e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
  - 5f65dfa5-dc97-4a6c-ad93-c45c1312e156
  - 37b5d236-2b3e-4a95-a4e8-31655c3023ef
  - 2792d448-c3b5-4050-93dd-93768529d99c
  - 291c7d91-da8c-486c-9bc0-bd2254536e2d
  - 0f6f8f38-98d0-438f-9601-58f478acc0b7
  - 43bfe9dd-d433-42ca-9777-f4c40eaba791
  - d17d3a96-c84d-4738-a403-6c733b874da2
  - 59b5670f-36d3-4d34-8985-f3144b15347a
  - 49a9a860-944c-467a-b532-4f99186a8593
  - 7b7ca860-780c-44fa-8d3f-be8bd9496fba
  - b3555ede-324a-4d24-a885-b0721e74babf
  - 8430617b-80a2-4cc9-8288-9a74cb57990b
  - d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
  - 1c4046b5-742d-4004-aec6-b47251fef5d6
  - 95205cd3-c3d5-4047-9c33-9c5ca2b49597
  - c26f0044-26fe-4c43-8ab0-fc4690723e3c
  - 78eeedf7-75bc-4692-a5a7-bb6857270621
  - ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
  - 9413237f-2537-4bbf-8768-db6180970e36
  - c0392040-16a2-41e8-bd54-75110319e3c0
  - 0b872af2-4197-46f3-b631-afb4e6135585
  - 62bec6f0-4e13-4f38-aca4-72c84ba02367
  - c5c9a5c6-427d-4864-8084-c083cd55faa0
  - 4330e8f0-5f46-4235-918b-39b6b93fa561
  - ac9d3ac5-9a6a-4180-a67f-1ab7e229d981
  - 91295f3a-a2af-4050-a2b8-4777ea70c32c
  - 40185d05-010e-45e7-8c2d-2f879bf14218
  - 5c152b08-6b69-4bb8-a1a7-66745789c169
  - 86a691ec-ca1f-4350-824c-0ded1f8ebe70
  - d144aa62-348c-4e5d-ae8f-38084c67ceca
  - b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
  - 5c307293-04cb-4478-ba2c-4cd85dbec260
  - ce37a9b8-5984-4fb8-b9e7-f72470314975
  - 72e4fd3c-7a07-4a95-91a3-6fca7f7fcaa3
  - 15d25922-0de6-414f-b7d1-e50e2a57b33a
  - c6f3cac5-5fc3-4654-bb0c-0c86334b770a
  - c14edce7-0656-45b2-aaf3-51f042451b7d
references:
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 28
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 25
    col: 0
    score: 1
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 61
    col: 0
    score: 1
  - uuid: f1add613-656e-4bec-b52b-193fd78c4642
    line: 18
    col: 0
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 21
    col: 0
    score: 1
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 51
    col: 0
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 67
    col: 0
    score: 1
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 31
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 17
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 33
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 99
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 46
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 10
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 4516
    col: 0
    score: 0.99
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 6833
    col: 0
    score: 0.99
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 3596
    col: 0
    score: 0.99
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 2846
    col: 0
    score: 0.99
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 5671
    col: 0
    score: 0.99
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 4921
    col: 0
    score: 0.99
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 5384
    col: 0
    score: 0.99
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 4881
    col: 0
    score: 0.99
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 4647
    col: 0
    score: 0.99
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 5410
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 6745
    col: 0
    score: 0.98
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 126
    col: 0
    score: 0.98
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 3997
    col: 0
    score: 0.98
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 4337
    col: 0
    score: 0.98
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 3988
    col: 0
    score: 0.98
  - uuid: f1add613-656e-4bec-b52b-193fd78c4642
    line: 1702
    col: 0
    score: 0.98
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 3766
    col: 0
    score: 0.98
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 3283
    col: 0
    score: 0.98
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 3404
    col: 0
    score: 0.98
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
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 3943
    col: 0
    score: 0.96
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 4841
    col: 0
    score: 0.96
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 5983
    col: 0
    score: 0.96
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 6301
    col: 0
    score: 0.96
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 4848
    col: 0
    score: 0.96
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 4885
    col: 0
    score: 0.96
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 6723
    col: 0
    score: 0.96
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 3095
    col: 0
    score: 0.96
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 2333
    col: 0
    score: 0.96
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 619
    col: 0
    score: 0.98
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 600
    col: 0
    score: 0.98
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 600
    col: 0
    score: 0.98
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 741
    col: 0
    score: 0.98
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 865
    col: 0
    score: 0.98
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 701
    col: 0
    score: 0.98
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 851
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 367
    col: 0
    score: 0.98
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 420
    col: 0
    score: 0.98
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 590
    col: 0
    score: 0.98
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 389
    col: 0
    score: 0.98
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 384
    col: 0
    score: 0.98
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 440
    col: 0
    score: 0.98
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 506
    col: 0
    score: 0.98
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 498
    col: 0
    score: 0.98
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 593
    col: 0
    score: 0.98
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 582
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 1170
    col: 0
    score: 0.98
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 1056
    col: 0
    score: 0.98
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 2022
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 3026
    col: 0
    score: 0.98
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 899
    col: 0
    score: 0.97
  - uuid: ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
    line: 1709
    col: 0
    score: 0.97
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 1227
    col: 0
    score: 0.97
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 1253
    col: 0
    score: 0.97
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 1174
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 1011
    col: 0
    score: 0.98
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 757
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 959
    col: 0
    score: 0.96
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 868
    col: 0
    score: 0.96
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 1000
    col: 0
    score: 0.96
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 1187
    col: 0
    score: 0.96
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 1282
    col: 0
    score: 0.96
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 1130
    col: 0
    score: 0.96
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 1046
    col: 0
    score: 0.96
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 1038
    col: 0
    score: 0.96
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 1246
    col: 0
    score: 0.96
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 1506
    col: 0
    score: 0.98
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 1142
    col: 0
    score: 0.98
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 1256
    col: 0
    score: 0.98
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 626
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 284
    col: 0
    score: 0.98
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 1507
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 594
    col: 0
    score: 0.98
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 969
    col: 0
    score: 0.98
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 691
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 1796
    col: 0
    score: 0.97
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 2017
    col: 0
    score: 0.97
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 1936
    col: 0
    score: 0.96
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 2202
    col: 0
    score: 0.96
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 6662
    col: 0
    score: 0.94
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 1420
    col: 0
    score: 0.94
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 24596
    col: 0
    score: 0.94
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 22800
    col: 0
    score: 0.94
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 22798
    col: 0
    score: 0.94
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 6526
    col: 0
    score: 0.96
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 3712
    col: 0
    score: 0.96
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 3075
    col: 0
    score: 0.96
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 4096
    col: 0
    score: 0.96
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 7335
    col: 0
    score: 0.96
  - uuid: 40185d05-010e-45e7-8c2d-2f879bf14218
    line: 1003
    col: 0
    score: 0.96
  - uuid: 5f65dfa5-dc97-4a6c-ad93-c45c1312e156
    line: 1028
    col: 0
    score: 0.96
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 4902
    col: 0
    score: 0.96
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 3435
    col: 0
    score: 0.96
  - uuid: b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
    line: 1736
    col: 0
    score: 0.87
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 7748
    col: 0
    score: 0.87
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 3847
    col: 0
    score: 0.87
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 4433
    col: 0
    score: 0.87
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 1688
    col: 0
    score: 0.87
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 5168
    col: 0
    score: 0.87
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 1563
    col: 0
    score: 0.87
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 3400
    col: 0
    score: 0.87
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 5381
    col: 0
    score: 0.87
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 7938
    col: 0
    score: 0.94
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 1021
    col: 0
    score: 0.87
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 257
    col: 0
    score: 0.87
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 242
    col: 0
    score: 0.9
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 628
    col: 0
    score: 0.88
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 649
    col: 0
    score: 0.88
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1216
    col: 0
    score: 0.88
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 389
    col: 0
    score: 0.88
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 567
    col: 0
    score: 0.88
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 276
    col: 0
    score: 0.88
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1282
    col: 0
    score: 0.88
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 584
    col: 0
    score: 0.88
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 1086
    col: 0
    score: 0.99
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 1227
    col: 0
    score: 0.99
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 334
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1651
    col: 0
    score: 0.99
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 996
    col: 0
    score: 0.99
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 1052
    col: 0
    score: 0.99
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 1315
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 5432
    col: 0
    score: 0.95
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 2406
    col: 0
    score: 0.95
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 5858
    col: 0
    score: 0.95
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 4673
    col: 0
    score: 0.99
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 1170
    col: 0
    score: 0.99
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 1216
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 4078
    col: 0
    score: 0.98
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 2394
    col: 0
    score: 0.98
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 3457
    col: 0
    score: 0.98
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 1516
    col: 0
    score: 0.98
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 770
    col: 0
    score: 0.97
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 987
    col: 0
    score: 0.97
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 262
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 981
    col: 0
    score: 0.99
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 870
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 951
    col: 0
    score: 0.99
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 762
    col: 0
    score: 0.99
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 364
    col: 0
    score: 0.99
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 902
    col: 0
    score: 0.99
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 956
    col: 0
    score: 0.99
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 919
    col: 0
    score: 0.99
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 824
    col: 0
    score: 0.99
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 2242
    col: 0
    score: 0.97
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 3757
    col: 0
    score: 0.97
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 3479
    col: 0
    score: 0.97
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 5594
    col: 0
    score: 0.97
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 2012
    col: 0
    score: 0.97
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 3225
    col: 0
    score: 0.97
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 4356
    col: 0
    score: 0.97
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 3752
    col: 0
    score: 0.97
  - uuid: 86a691ec-ca1f-4350-824c-0ded1f8ebe70
    line: 1714
    col: 0
    score: 0.97
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 2287
    col: 0
    score: 0.98
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 2339
    col: 0
    score: 0.98
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 3549
    col: 0
    score: 0.98
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 6142
    col: 0
    score: 0.98
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 3887
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 4648
    col: 0
    score: 0.98
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 1299
    col: 0
    score: 0.96
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 1147
    col: 0
    score: 0.96
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 1063
    col: 0
    score: 0.96
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 1055
    col: 0
    score: 0.96
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 1263
    col: 0
    score: 0.96
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 880
    col: 0
    score: 0.96
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 696
    col: 0
    score: 0.96
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 1546
    col: 0
    score: 0.96
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 1209
    col: 0
    score: 0.96
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 4713
    col: 0
    score: 0.9
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 1256
    col: 0
    score: 0.9
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 8974
    col: 0
    score: 0.9
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 882
    col: 0
    score: 0.98
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 1393
    col: 0
    score: 0.98
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 1151
    col: 0
    score: 0.98
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 1363
    col: 0
    score: 0.98
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 585
    col: 0
    score: 0.95
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 512
    col: 0
    score: 0.95
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 765
    col: 0
    score: 0.95
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 588
    col: 0
    score: 0.95
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 511
    col: 0
    score: 0.95
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 921
    col: 0
    score: 0.95
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 600
    col: 0
    score: 0.95
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 327
    col: 0
    score: 0.96
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 311
    col: 0
    score: 0.96
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 1286
    col: 0
    score: 0.96
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 987
    col: 0
    score: 0.96
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 764
    col: 0
    score: 0.96
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 1487
    col: 0
    score: 0.96
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 278
    col: 0
    score: 0.96
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 584
    col: 0
    score: 0.96
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 1201
    col: 0
    score: 0.96
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 795
    col: 0
    score: 0.96
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 840
    col: 0
    score: 0.99
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 763
    col: 0
    score: 0.99
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 1214
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 985
    col: 0
    score: 0.98
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 780
    col: 0
    score: 0.98
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 734
    col: 0
    score: 0.98
  - uuid: 9413237f-2537-4bbf-8768-db6180970e36
    line: 580
    col: 0
    score: 0.96
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 1613
    col: 0
    score: 0.96
  - uuid: c0392040-16a2-41e8-bd54-75110319e3c0
    line: 1271
    col: 0
    score: 0.96
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 3291
    col: 0
    score: 0.96
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 6974
    col: 0
    score: 0.96
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 4005
    col: 0
    score: 0.96
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 1645
    col: 0
    score: 0.96
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 3813
    col: 0
    score: 0.96
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 5781
    col: 0
    score: 0.96
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 5891
    col: 0
    score: 0.96
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 3096
    col: 0
    score: 0.98
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 4355
    col: 0
    score: 0.98
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 4818
    col: 0
    score: 0.98
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 4548
    col: 0
    score: 0.98
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 3722
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 8343
    col: 0
    score: 0.98
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 2432
    col: 0
    score: 0.97
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 1321
    col: 0
    score: 0.97
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 1392
    col: 0
    score: 0.97
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 1287
    col: 0
    score: 0.97
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 1090
    col: 0
    score: 0.97
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 1393
    col: 0
    score: 0.97
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 1177
    col: 0
    score: 0.97
  - uuid: 86a691ec-ca1f-4350-824c-0ded1f8ebe70
    line: 592
    col: 0
    score: 0.97
  - uuid: b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
    line: 587
    col: 0
    score: 0.97
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1655
    col: 0
    score: 0.97
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 1213
    col: 0
    score: 0.97
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 1158
    col: 0
    score: 0.97
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 1317
    col: 0
    score: 0.97
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 1719
    col: 0
    score: 0.97
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 1168
    col: 0
    score: 0.97
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 766
    col: 0
    score: 0.97
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 1605
    col: 0
    score: 0.97
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 1576
    col: 0
    score: 0.98
  - uuid: 86a691ec-ca1f-4350-824c-0ded1f8ebe70
    line: 1804
    col: 0
    score: 0.96
  - uuid: b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
    line: 1835
    col: 0
    score: 0.96
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 1047
    col: 0
    score: 0.95
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 1216
    col: 0
    score: 0.95
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 737
    col: 0
    score: 0.95
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 738
    col: 0
    score: 0.95
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 1475
    col: 0
    score: 0.95
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 3460
    col: 0
    score: 0.97
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 2270
    col: 0
    score: 0.97
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 1850
    col: 0
    score: 0.97
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 2386
    col: 0
    score: 0.97
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2455
    col: 0
    score: 0.97
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2835
    col: 0
    score: 0.97
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 2738
    col: 0
    score: 0.97
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 4503
    col: 0
    score: 0.97
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 2368
    col: 0
    score: 0.97
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 4029
    col: 0
    score: 0.97
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 6026
    col: 0
    score: 0.97
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 4287
    col: 0
    score: 0.97
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 4296
    col: 0
    score: 0.97
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 3969
    col: 0
    score: 0.97
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 5113
    col: 0
    score: 0.97
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 7147
    col: 0
    score: 0.97
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 2385
    col: 0
    score: 0.98
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 699
    col: 0
    score: 0.98
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 932
    col: 0
    score: 0.98
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 621
    col: 0
    score: 0.98
  - uuid: b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
    line: 632
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 941
    col: 0
    score: 0.98
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 6737
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 8420
    col: 0
    score: 0.98
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 1476
    col: 0
    score: 0.98
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 1356
    col: 0
    score: 0.98
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 1429
    col: 0
    score: 0.98
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 4272
    col: 0
    score: 0.98
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 2988
    col: 0
    score: 0.98
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 3280
    col: 0
    score: 0.98
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 3440
    col: 0
    score: 0.98
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 2057
    col: 0
    score: 0.98
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 1222
    col: 0
    score: 0.98
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 8945
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 11865
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 6894
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 9312
    col: 0
    score: 1
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 7607
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 8946
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 11866
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 6895
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 9313
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 4688
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 8947
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 11867
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 6896
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 9314
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 4689
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 8948
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 11868
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 6897
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 9315
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 4690
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 8949
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 11869
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 6898
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 9316
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 4691
    col: 0
    score: 1
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 7611
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 8669
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 12667
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 4080
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 2953
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 4169
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 3315
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 6128
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 8951
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 16012
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 6900
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 9318
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 4693
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 8952
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 16013
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 6901
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 9319
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 4694
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 4695
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 24359
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 1945
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 1837
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 3516
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 5796
    col: 0
    score: 0.99
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 1817
    col: 0
    score: 0.99
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 991
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 5854
    col: 0
    score: 0.99
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 1734
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 2066
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 1867
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 2481
    col: 0
    score: 0.99
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 1269
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 5801
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 10303
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 7856
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 3164
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 6136
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 2949
    col: 0
    score: 0.99
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 3949
    col: 0
    score: 0.99
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 4756
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 4085
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 3004
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 8254
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 3002
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 1902
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 3985
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 1791
    col: 0
    score: 0.99
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 3383
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 5803
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 10305
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 3577
    col: 0
    score: 0.99
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 4688
    col: 0
    score: 0.99
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 3950
    col: 0
    score: 0.99
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 3551
    col: 0
    score: 0.99
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 4774
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 5804
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 10306
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 3578
    col: 0
    score: 0.99
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 4689
    col: 0
    score: 0.99
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 3951
    col: 0
    score: 0.99
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 3739
    col: 0
    score: 0.99
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 4775
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 8907
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 10307
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 3579
    col: 0
    score: 0.99
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 4690
    col: 0
    score: 0.99
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 3952
    col: 0
    score: 0.99
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 3740
    col: 0
    score: 0.99
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 3552
    col: 0
    score: 0.99
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 4776
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 8908
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 10308
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 3580
    col: 0
    score: 0.99
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 4691
    col: 0
    score: 0.99
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 3953
    col: 0
    score: 0.99
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 3741
    col: 0
    score: 0.99
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 3553
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 10309
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 4064
    col: 0
    score: 0.98
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 3759
    col: 0
    score: 0.98
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 4218
    col: 0
    score: 0.98
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 3365
    col: 0
    score: 0.98
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 5129
    col: 0
    score: 0.98
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 8431
    col: 0
    score: 0.98
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 4053
    col: 0
    score: 0.98
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 3742
    col: 0
    score: 0.98
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 3001
    col: 0
    score: 0.99
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 3072
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 4093
    col: 0
    score: 0.99
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 3012
    col: 0
    score: 0.99
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 3986
    col: 0
    score: 0.99
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 3601
    col: 0
    score: 0.99
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 3602
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 3385
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 3604
    col: 0
    score: 0.99
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 3387
    col: 0
    score: 0.99
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 3605
    col: 0
    score: 0.99
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 3614
    col: 0
    score: 0.98
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 3987
    col: 0
    score: 0.98
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 3031
    col: 0
    score: 0.93
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 2269
    col: 0
    score: 0.93
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 3784
    col: 0
    score: 0.93
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 3506
    col: 0
    score: 0.93
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 5621
    col: 0
    score: 0.93
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 5204
    col: 0
    score: 0.93
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 3243
    col: 0
    score: 0.93
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 4383
    col: 0
    score: 0.93
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 3779
    col: 0
    score: 0.93
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 1364
    col: 0
    score: 0.99
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 1599
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6419
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 14477
    col: 0
    score: 0.99
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 11760
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 20158
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 17508
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 12671
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 25725
    col: 0
    score: 0.98
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 678
    col: 0
    score: 0.98
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 4931
    col: 0
    score: 0.98
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 4000
    col: 0
    score: 0.98
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 3931
    col: 0
    score: 0.98
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 4527
    col: 0
    score: 0.98
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 4603
    col: 0
    score: 0.98
  - uuid: 86a691ec-ca1f-4350-824c-0ded1f8ebe70
    line: 1799
    col: 0
    score: 0.98
  - uuid: b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
    line: 1829
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 6159
    col: 0
    score: 0.98
  - uuid: 40185d05-010e-45e7-8c2d-2f879bf14218
    line: 1696
    col: 0
    score: 0.98
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 2060
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 2317
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 1261
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 2272
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 8734
    col: 0
    score: 0.99
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 1819
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 4054
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 2061
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 5465
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 2318
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 1262
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 3271
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 1747
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2362
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 996
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 1256
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 3335
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 5946
    col: 0
    score: 0.99
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 2995
    col: 0
    score: 0.99
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2361
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 998
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 1258
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 4591
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 1960
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 1686
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 4089
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 1725
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 3645
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 7664
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 2288
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2688
    col: 0
    score: 0.99
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 2993
    col: 0
    score: 0.99
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 1528
    col: 0
    score: 0.99
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 2288
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6435
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 2058
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6453
    col: 0
    score: 0.98
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 2315
    col: 0
    score: 0.98
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 1259
    col: 0
    score: 0.98
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2650
    col: 0
    score: 0.98
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 3574
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 7663
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 4049
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 2057
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6452
    col: 0
    score: 0.99
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 2314
    col: 0
    score: 0.99
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 1258
    col: 0
    score: 0.99
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 2656
    col: 0
    score: 0.99
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 1991
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 16838
    col: 0
    score: 0.98
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 1926
    col: 0
    score: 0.98
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2484
    col: 0
    score: 0.98
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 1762
    col: 0
    score: 0.98
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2275
    col: 0
    score: 0.98
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 2286
    col: 0
    score: 0.97
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 1947
    col: 0
    score: 0.97
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 2454
    col: 0
    score: 0.97
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 1058
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 1893
    col: 0
    score: 1
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 890
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 6779
    col: 0
    score: 0.99
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 3120
    col: 0
    score: 0.99
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 1707
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 2389
    col: 0
    score: 0.99
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 3306
    col: 0
    score: 0.99
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 1057
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 2033
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 4381
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 1823
    col: 0
    score: 0.99
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 3752
    col: 0
    score: 0.99
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 2411
    col: 0
    score: 0.99
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 2878
    col: 0
    score: 0.99
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 1722
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 25531
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 25699
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 21689
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 25656
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 16094
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 18452
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 21561
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 25743
    col: 0
    score: 0.99
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 4166
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 3960
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 6895
    col: 0
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 4691
    col: 0
    score: 0.99
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 4081
    col: 0
    score: 0.99
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 1924
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 25558
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 25594
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 19054
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 25437
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 14128
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 24871
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 23470
    col: 0
    score: 0.99
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2196
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 1969
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 12463
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 17356
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 2475
    col: 0
    score: 1
  - uuid: 86a691ec-ca1f-4350-824c-0ded1f8ebe70
    line: 1271
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 2687
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 13654
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 19543
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 2623
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 5755
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 3744
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 4756
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 2631
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 15383
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 13741
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 12464
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 2688
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 5756
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 3745
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 4757
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 2632
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 15384
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 13742
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 12465
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 2689
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 5757
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 3746
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 4758
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 2633
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 15385
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 13743
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 3619
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 12466
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 5758
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 3747
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 4759
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 2634
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 15386
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 13744
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 12467
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 3620
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 5759
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 3748
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 4760
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 2635
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 15387
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 13745
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 12468
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 2692
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 5760
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 3749
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 4761
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 2636
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 15388
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 13746
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 12469
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 2693
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 5761
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 3750
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 4762
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 2637
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 15389
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 13747
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 12470
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 2694
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 3751
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 4763
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 2638
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 15390
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 13748
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 12471
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 2695
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 3624
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 5763
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 4764
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 2639
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 15391
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 13749
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 12472
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 2696
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 3625
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 2321
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 2276
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2368
    col: 0
    score: 0.99
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 999
    col: 0
    score: 0.99
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 1259
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 1958
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 3340
    col: 0
    score: 0.99
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 2320
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 5505
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 1283
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 15826
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 19839
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 22643
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 18661
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 17464
    col: 0
    score: 0.98
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 2282
    col: 0
    score: 0.98
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 2774
    col: 0
    score: 0.98
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 2792
    col: 0
    score: 0.98
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 2831
    col: 0
    score: 0.98
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 2312
    col: 0
    score: 0.98
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 2840
    col: 0
    score: 0.98
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 1861
    col: 0
    score: 0.98
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 2324
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 1734
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6443
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 2865
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 3130
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 12722
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 4075
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 1735
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 2325
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6444
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2642
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 2866
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2652
    col: 0
    score: 0.98
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 1877
    col: 0
    score: 0.98
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 1984
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 1733
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6442
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2641
    col: 0
    score: 0.99
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 3131
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 14642
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 18999
    col: 0
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 4380
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 2496
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1803
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6307
    col: 0
    score: 0.97
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 1925
    col: 0
    score: 0.97
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 1930
    col: 0
    score: 0.97
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 2515
    col: 0
    score: 0.97
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 3528
    col: 0
    score: 0.95
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 2003
    col: 0
    score: 0.95
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 1538
    col: 0
    score: 0.95
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 1503
    col: 0
    score: 0.95
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 1405
    col: 0
    score: 0.95
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 1867
    col: 0
    score: 0.95
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 3078
    col: 0
    score: 0.95
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 6001
    col: 0
    score: 0.95
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 2613
    col: 0
    score: 0.95
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 5213
    col: 0
    score: 0.95
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 5048
    col: 0
    score: 0.95
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 3681
    col: 0
    score: 0.95
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 3139
    col: 0
    score: 0.95
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 2498
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 2055
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6449
    col: 0
    score: 0.99
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 2312
    col: 0
    score: 0.99
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2434
    col: 0
    score: 0.98
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 4025
    col: 0
    score: 0.98
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 1236
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 2542
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 2529
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 2023
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3639
    col: 0
    score: 0.99
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 1496
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 1931
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 2502
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 1237
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 2543
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 1497
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 2574
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 1238
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 2544
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 2531
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 2025
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 1498
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 2575
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 1239
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 2545
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 2532
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 2026
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3637
    col: 0
    score: 0.99
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 3954
    col: 0
    score: 0.99
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 1240
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 2546
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 2533
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 2027
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3638
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 3955
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 4052
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 3399
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 2826
    col: 0
    score: 0.99
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 1488
    col: 0
    score: 0.99
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 1742
    col: 0
    score: 0.97
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 4172
    col: 0
    score: 0.97
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 1985
    col: 0
    score: 0.97
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 2827
    col: 0
    score: 1
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 1489
    col: 0
    score: 1
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 1406
    col: 0
    score: 0.99
  - uuid: ac9d3ac5-9a6a-4180-a67f-1ab7e229d981
    line: 1488
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 1736
    col: 0
    score: 0.99
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 1490
    col: 0
    score: 0.99
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 2053
    col: 0
    score: 0.95
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 2723
    col: 0
    score: 0.95
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 5536
    col: 0
    score: 0.95
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 9718
    col: 0
    score: 0.95
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 9133
    col: 0
    score: 0.95
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 3062
    col: 0
    score: 0.95
  - uuid: 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
    line: 968
    col: 0
    score: 0.95
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 2825
    col: 0
    score: 0.99
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 1492
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 1701
    col: 0
    score: 0.98
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 3244
    col: 0
    score: 0.98
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 2301
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 1999
    col: 0
    score: 0.99
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 2810
    col: 0
    score: 0.99
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 2847
    col: 0
    score: 0.99
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 2460
    col: 0
    score: 0.99
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 1486
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 3168
    col: 0
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 3382
    col: 0
    score: 0.99
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 1381
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3237
    col: 0
    score: 0.98
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 1900
    col: 0
    score: 0.98
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 3690
    col: 0
    score: 0.98
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 2552
    col: 0
    score: 0.99
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 3337
    col: 0
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 2883
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 12321
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 2984
    col: 0
    score: 0.99
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 2261
    col: 0
    score: 0.99
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 3933
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 5231
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 2767
    col: 0
    score: 0.99
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 2760
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 2830
    col: 0
    score: 0.98
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 1846
    col: 0
    score: 0.98
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 2797
    col: 0
    score: 0.98
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 3453
    col: 0
    score: 0.98
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 2332
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 3646
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 1976
    col: 0
    score: 0.97
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 4901
    col: 0
    score: 0.97
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 3787
    col: 0
    score: 0.97
  - uuid: ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
    line: 1461
    col: 0
    score: 0.97
  - uuid: ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
    line: 1452
    col: 0
    score: 0.97
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 5634
    col: 0
    score: 0.97
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 2821
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 2269
    col: 0
    score: 0.99
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 2256
    col: 0
    score: 0.99
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 3274
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 6585
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 2134
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 2891
    col: 0
    score: 0.98
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 2735
    col: 0
    score: 0.98
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 3749
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 4278
    col: 0
    score: 0.98
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 2382
    col: 0
    score: 0.98
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 1322
    col: 0
    score: 0.99
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 1576
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 4916
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 7301
    col: 0
    score: 0.99
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 2192
    col: 0
    score: 0.99
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 2135
    col: 0
    score: 0.99
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 1941
    col: 0
    score: 0.99
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 2042
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 2586
    col: 0
    score: 0.98
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 1604
    col: 0
    score: 0.99
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 2276
    col: 0
    score: 0.99
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 2703
    col: 0
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 2592
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 1678
    col: 0
    score: 0.99
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 2515
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 1686
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 2513
    col: 0
    score: 0.99
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 1685
    col: 0
    score: 0.99
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 2514
    col: 0
    score: 0.99
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 1684
    col: 0
    score: 0.99
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 4188
    col: 0
    score: 0.99
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 2518
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 1689
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 4189
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 2439
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 1683
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 4187
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 2517
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 1688
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 4190
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 1626
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 2639
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 2963
    col: 0
    score: 0.98
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 3482
    col: 0
    score: 0.98
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 3692
    col: 0
    score: 0.98
  - uuid: 86a691ec-ca1f-4350-824c-0ded1f8ebe70
    line: 1447
    col: 0
    score: 0.98
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 2053
    col: 0
    score: 0.98
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 2527
    col: 0
    score: 0.98
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 1082
    col: 0
    score: 0.98
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 3575
    col: 0
    score: 0.98
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 4037
    col: 0
    score: 0.98
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 2860
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2491
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 2763
    col: 0
    score: 0.99
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 3111
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 2151
    col: 0
    score: 0.99
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 3073
    col: 0
    score: 0.97
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 2921
    col: 0
    score: 0.97
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 2431
    col: 0
    score: 0.97
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 1788
    col: 0
    score: 0.97
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 1990
    col: 0
    score: 0.97
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 6419
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3479
    col: 0
    score: 0.99
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 1638
    col: 0
    score: 0.99
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 2135
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 2877
    col: 0
    score: 0.98
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 4125
    col: 0
    score: 0.98
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 2960
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 14785
    col: 0
    score: 0.98
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 2321
    col: 0
    score: 0.98
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 1767
    col: 0
    score: 0.98
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 2918
    col: 0
    score: 0.98
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 2691
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 4900
    col: 0
    score: 0.98
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 5525
    col: 0
    score: 0.98
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 8179
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 3706
    col: 0
    score: 0.98
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 2050
    col: 0
    score: 0.98
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 3979
    col: 0
    score: 0.98
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 2102
    col: 0
    score: 0.98
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 4345
    col: 0
    score: 0.98
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 2762
    col: 0
    score: 0.98
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 2051
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 2480
    col: 0
    score: 0.99
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 3250
    col: 0
    score: 0.99
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 1753
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 2364
    col: 0
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 2180
    col: 0
    score: 0.99
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 1605
    col: 0
    score: 0.99
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 2771
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 25659
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 25608
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 25763
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 25602
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 19563
    col: 0
    score: 0.99
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 11769
    col: 0
    score: 0.99
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 3254
    col: 0
    score: 0.99
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 2446
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1884
    col: 0
    score: 0.99
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 999
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3567
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 2472
    col: 0
    score: 0.99
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 2138
    col: 0
    score: 0.99
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 2300
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 2474
    col: 0
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 2573
    col: 0
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 3201
    col: 0
    score: 0.98
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 2013
    col: 0
    score: 0.98
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 6304
    col: 0
    score: 0.97
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 4796
    col: 0
    score: 0.97
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 3589
    col: 0
    score: 0.97
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 3258
    col: 0
    score: 0.99
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 2450
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1885
    col: 0
    score: 0.99
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 994
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3571
    col: 0
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 2575
    col: 0
    score: 0.99
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 2140
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 4024
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 2445
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1886
    col: 0
    score: 0.99
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 1000
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3568
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 2475
    col: 0
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 2570
    col: 0
    score: 0.99
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 3256
    col: 0
    score: 0.99
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 2449
    col: 0
    score: 0.99
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 997
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3569
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 2471
    col: 0
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 2572
    col: 0
    score: 0.99
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 2141
    col: 0
    score: 0.99
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 3569
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 2682
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2020
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 3254
    col: 0
    score: 0.99
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 2681
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2019
    col: 0
    score: 0.99
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 1429
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 1760
    col: 0
    score: 0.97
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 3704
    col: 0
    score: 0.96
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 3255
    col: 0
    score: 0.99
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 2679
    col: 0
    score: 0.99
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 3253
    col: 0
    score: 0.99
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 2678
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2017
    col: 0
    score: 0.99
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 3256
    col: 0
    score: 0.99
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 2695
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2022
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 28177
    col: 0
    score: 0.99
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 14633
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 26632
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2024
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 5439
    col: 0
    score: 0.99
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 2057
    col: 0
    score: 0.99
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 3458
    col: 0
    score: 0.99
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 3258
    col: 0
    score: 0.99
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 2907
    col: 0
    score: 0.99
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 1657
    col: 0
    score: 0.99
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 956
    col: 0
    score: 0.98
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 1216
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 4315
    col: 0
    score: 0.98
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 2687
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 3694
    col: 0
    score: 0.98
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 1626
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 1628
    col: 0
    score: 0.99
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 3273
    col: 0
    score: 0.99
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 2918
    col: 0
    score: 0.99
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 3612
    col: 0
    score: 0.98
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 1936
    col: 0
    score: 0.98
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 3152
    col: 0
    score: 0.98
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 2631
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 2258
    col: 0
    score: 0.99
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 3604
    col: 0
    score: 0.99
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 2502
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 4188
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3231
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1963
    col: 0
    score: 0.99
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 2632
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 3084
    col: 0
    score: 0.99
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 2259
    col: 0
    score: 0.99
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 2503
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 4189
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3232
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1964
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 3085
    col: 0
    score: 0.99
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 2260
    col: 0
    score: 0.99
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 3605
    col: 0
    score: 0.99
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 2504
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3233
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1965
    col: 0
    score: 0.99
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 1500
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 3086
    col: 0
    score: 0.99
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 2261
    col: 0
    score: 0.99
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 3606
    col: 0
    score: 0.99
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 2505
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 4190
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3234
    col: 0
    score: 0.99
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 1501
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 3087
    col: 0
    score: 0.99
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 2262
    col: 0
    score: 0.99
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 3607
    col: 0
    score: 0.99
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 2506
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 4191
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3235
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1966
    col: 0
    score: 0.99
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 2628
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 3089
    col: 0
    score: 0.99
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 3609
    col: 0
    score: 0.99
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 2578
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 4192
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1968
    col: 0
    score: 0.99
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 1505
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 4136
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 7382
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1827
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 2785
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 3646
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 2625
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 3658
    col: 0
    score: 0.99
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 3771
    col: 0
    score: 0.99
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 3756
    col: 0
    score: 0.99
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 3423
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 4137
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 7383
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1828
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 2786
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 3647
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 2626
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 3659
    col: 0
    score: 0.99
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 3772
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 4138
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 7384
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1829
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 2787
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 3648
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 2627
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 3714
    col: 0
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 3193
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 4140
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 7386
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1831
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 2789
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 3650
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 2629
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 3761
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 6277
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 4141
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 7387
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1832
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 2790
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 3651
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 2630
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 3663
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 3776
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 4142
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 7388
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1833
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 2791
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 3652
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 2631
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 6579
    col: 0
    score: 0.99
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 3199
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 4143
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 7389
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1834
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 2792
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 3653
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 2632
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2850
    col: 0
    score: 0.99
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 6280
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 4144
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 7390
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 1835
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 2793
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 3654
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 2633
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 2189
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 3471
    col: 0
    score: 1
  - uuid: 40185d05-010e-45e7-8c2d-2f879bf14218
    line: 840
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 1693
    col: 0
    score: 0.99
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 1368
    col: 0
    score: 0.99
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 1812
    col: 0
    score: 0.99
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 4225
    col: 0
    score: 0.99
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 2342
    col: 0
    score: 0.99
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2435
    col: 0
    score: 0.99
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 4029
    col: 0
    score: 0.99
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 1957
    col: 0
    score: 0.99
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 3892
    col: 0
    score: 0.99
  - uuid: 5f65dfa5-dc97-4a6c-ad93-c45c1312e156
    line: 873
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 3750
    col: 0
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 4304
    col: 0
    score: 0.99
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 2209
    col: 0
    score: 0.99
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 2930
    col: 0
    score: 0.99
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 1581
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 4836
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 2104
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 4160
    col: 0
    score: 0.98
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 2694
    col: 0
    score: 0.98
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 1776
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 3023
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 5694
    col: 0
    score: 0.98
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 884
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 3190
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 2313
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 3000
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 16733
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 8691
    col: 0
    score: 0.99
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 7937
    col: 0
    score: 0.99
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 4470
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 9440
    col: 0
    score: 0.99
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 4260
    col: 0
    score: 0.99
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 4240
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 7738
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 2384
    col: 0
    score: 0.98
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 5053
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 8482
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 5834
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 6908
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 7876
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 3001
    col: 0
    score: 1
  - uuid: 15d25922-0de6-414f-b7d1-e50e2a57b33a
    line: 1077
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 4472
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 9442
    col: 0
    score: 0.99
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 4262
    col: 0
    score: 0.99
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 4242
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 7740
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 9046
    col: 0
    score: 0.98
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 11972
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 5277
    col: 0
    score: 0.97
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 1901
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6537
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 5849
    col: 0
    score: 0.99
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 1909
    col: 0
    score: 0.99
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 2620
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 2720
    col: 0
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 3536
    col: 0
    score: 0.99
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 2276
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 21751
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 8744
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 3804
    col: 0
    score: 0.99
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 1429
    col: 0
    score: 0.99
  - uuid: f1add613-656e-4bec-b52b-193fd78c4642
    line: 854
    col: 0
    score: 0.99
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 3571
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 2799
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 16666
    col: 0
    score: 0.98
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 2083
    col: 0
    score: 0.98
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 2000
    col: 0
    score: 0.98
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 1862
    col: 0
    score: 0.98
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 2582
    col: 0
    score: 0.98
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 1778
    col: 0
    score: 0.98
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 3573
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 2879
    col: 0
    score: 0.99
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2416
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2094
    col: 0
    score: 0.99
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 3658
    col: 0
    score: 0.98
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 1608
    col: 0
    score: 0.98
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 3936
    col: 0
    score: 0.98
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 2885
    col: 0
    score: 0.98
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 1418
    col: 0
    score: 0.98
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 7377
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 4643
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 14479
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 11552
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 9123
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 12129
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 2108
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 3165
    col: 0
    score: 0.99
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 1687
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 3038
    col: 0
    score: 0.99
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 2084
    col: 0
    score: 0.98
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 2001
    col: 0
    score: 0.98
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 2585
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 4129
    col: 0
    score: 0.98
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 1779
    col: 0
    score: 0.98
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 2642
    col: 0
    score: 0.99
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 2101
    col: 0
    score: 0.99
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 2612
    col: 0
    score: 0.99
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 1528
    col: 0
    score: 0.99
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 1843
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 4378
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 3487
    col: 0
    score: 0.99
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 3629
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 2881
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 3546
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 1852
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 4646
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 4127
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 3315
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 1944
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 2880
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 4648
    col: 0
    score: 0.99
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 3545
    col: 0
    score: 0.99
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 1853
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 4128
    col: 0
    score: 0.99
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 1755
    col: 0
    score: 0.99
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 3317
    col: 0
    score: 0.99
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 1952
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 4644
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 2385
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 2429
    col: 0
    score: 0.98
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 1846
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 4649
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 2390
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 4044
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 1798
    col: 0
    score: 0.99
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 1906
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 3250
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 2604
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 2879
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 2885
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 5298
    col: 0
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 3711
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 1759
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 3313
    col: 0
    score: 0.99
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 2543
    col: 0
    score: 0.98
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 2757
    col: 0
    score: 0.98
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 1604
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 4171
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 3280
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 2151
    col: 0
    score: 0.98
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 2176
    col: 0
    score: 0.98
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 4000
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 5295
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6299
    col: 0
    score: 0.99
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 2845
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 2197
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 2027
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 6739
    col: 0
    score: 0.99
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 2403
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 2656
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 3239
    col: 0
    score: 0.99
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 2418
    col: 0
    score: 0.99
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 2844
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 2195
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 6741
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 1961
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6300
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 3510
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 2853
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6301
    col: 0
    score: 0.99
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 2855
    col: 0
    score: 0.99
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 1732
    col: 0
    score: 0.98
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 1692
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3142
    col: 0
    score: 0.98
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 1282
    col: 0
    score: 0.98
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 1765
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 5029
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 2596
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 2030
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 3369
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 12790
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 2591
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 1766
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 5030
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 2597
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 3370
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 3011
    col: 0
    score: 0.99
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 3508
    col: 0
    score: 0.99
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 2594
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 2200
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 3367
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 6743
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 1960
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 2032
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 1764
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 5028
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 2843
    col: 0
    score: 0.99
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 2595
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 3368
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 6742
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 1958
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 5027
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 3506
    col: 0
    score: 0.99
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 2851
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 4135
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 2034
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 1957
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 1611
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 18028
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 1951
    col: 0
    score: 0.99
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 2035
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 2338
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6305
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 5079
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 2839
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 2202
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 6736
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 1954
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 3388
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 2631
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 2671
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 2485
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 3125
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 3227
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 2377
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 1651
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 2367
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 8329
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 18256
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 11865
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 15568
    col: 0
    score: 0.99
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 8330
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 18257
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 13711
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 14641
    col: 0
    score: 0.99
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 12176
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 12859
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 8278
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 13747
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 13202
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 18263
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 17684
    col: 0
    score: 0.98
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 8283
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 18252
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 12071
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 13195
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 3767
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 2212
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 4378
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 8639
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 13196
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 18253
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 12070
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 16526
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 15849
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 4379
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 8640
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 13197
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 18254
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 13561
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 2910
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 16360
    col: 0
    score: 0.99
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 8644
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 13714
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 13201
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 8331
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 18258
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 14002
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 4585
    col: 0
    score: 0.98
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 2993
    col: 0
    score: 0.98
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 1849
    col: 0
    score: 0.98
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 4189
    col: 0
    score: 0.98
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 2056
    col: 0
    score: 0.98
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 2848
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 3467
    col: 0
    score: 0.98
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 2110
    col: 0
    score: 0.99
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 2721
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 4965
    col: 0
    score: 0.98
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 2216
    col: 0
    score: 0.98
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 3386
    col: 0
    score: 0.98
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 3433
    col: 0
    score: 0.99
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 7624
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 15920
    col: 0
    score: 0.98
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 2218
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 3434
    col: 0
    score: 0.99
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 2106
    col: 0
    score: 0.99
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 2720
    col: 0
    score: 0.99
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 3929
    col: 0
    score: 0.99
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 2444
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 2607
    col: 0
    score: 0.99
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 1874
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 4953
    col: 0
    score: 0.99
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 3038
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 1749
    col: 0
    score: 0.98
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 1333
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1987
    col: 0
    score: 0.98
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 1136
    col: 0
    score: 0.98
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 2293
    col: 0
    score: 0.98
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 1731
    col: 0
    score: 0.98
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 3249
    col: 0
    score: 0.99
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 2964
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 3770
    col: 0
    score: 0.99
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 1424
    col: 0
    score: 0.98
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 2255
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 5011
    col: 0
    score: 0.99
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 3140
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 4122
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 21713
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 22284
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 21715
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 22286
    col: 0
    score: 0.99
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 8859
    col: 0
    score: 0.99
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 2646
    col: 0
    score: 0.99
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 2884
    col: 0
    score: 0.99
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 2427
    col: 0
    score: 0.99
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 2411
    col: 0
    score: 0.99
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 3565
    col: 0
    score: 0.99
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 1468
    col: 0
    score: 0.99
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 2858
    col: 0
    score: 0.99
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 3796
    col: 0
    score: 0.99
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 2162
    col: 0
    score: 0.99
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 1795
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 5537
    col: 0
    score: 0.99
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 1994
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2006
    col: 0
    score: 0.99
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 1425
    col: 0
    score: 0.99
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 3036
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 21709
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 22281
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6649
    col: 0
    score: 0.99
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 2841
    col: 0
    score: 0.98
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 1996
    col: 0
    score: 0.98
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 3568
    col: 0
    score: 0.98
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 1603
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6225
    col: 0
    score: 0.97
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 22305
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 14501
    col: 0
    score: 0.99
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 3591
    col: 0
    score: 0.99
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 3964
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 17504
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 22308
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 14505
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 2674
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 14503
    col: 0
    score: 0.99
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 1400
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 22307
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 14500
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 23519
    col: 0
    score: 0.99
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2789
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 23122
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 18976
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 20863
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 3789
    col: 0
    score: 0.99
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 3807
    col: 0
    score: 0.99
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 2837
    col: 0
    score: 0.99
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 1997
    col: 0
    score: 0.99
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 1785
    col: 0
    score: 0.99
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 2638
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 3790
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 17831
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 5470
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 3738
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 17842
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 23227
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 22314
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 3788
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 5468
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 3739
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 5901
    col: 0
    score: 0.99
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 3421
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 2293
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 9570
    col: 0
    score: 0.99
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 2341
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 2670
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 1726
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 3787
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 3755
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 2293
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 2658
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 2524
    col: 0
    score: 0.99
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 2259
    col: 0
    score: 0.99
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 1683
    col: 0
    score: 0.99
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 2530
    col: 0
    score: 0.99
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 3602
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 20687
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 3182
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 3564
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 7802
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 14339
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 14962
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 2101
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 1981
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 3742
    col: 0
    score: 0.99
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 3611
    col: 0
    score: 0.97
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 5512
    col: 0
    score: 0.97
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 3743
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 3785
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 6893
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 8334
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 7125
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 5930
    col: 0
    score: 0.99
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 2102
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 1980
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 3784
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1944
    col: 0
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 4071
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 4591
    col: 0
    score: 0.99
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 2210
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 19731
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 13745
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 19730
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 13746
    col: 0
    score: 0.99
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 8908
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 15986
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 27009
    col: 0
    score: 0.99
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 9284
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 19733
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 13744
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2177
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 23231
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 20575
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 17488
    col: 0
    score: 0.99
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 2010
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 17509
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 15406
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 18878
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 20365
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 14311
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3215
    col: 0
    score: 0.99
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 1953
    col: 0
    score: 0.99
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 1389
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 19524
    col: 0
    score: 0.97
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 3298
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 5137
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 1952
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 1811
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 3747
    col: 0
    score: 0.98
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 13748
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 15409
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 1959
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 2904
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 1865
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 1923
    col: 0
    score: 0.99
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 2210
    col: 0
    score: 0.99
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 2531
    col: 0
    score: 0.99
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 3111
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 14824
    col: 0
    score: 0.99
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 2283
    col: 0
    score: 0.99
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 2284
    col: 0
    score: 0.99
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 1603
    col: 0
    score: 0.99
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 1778
    col: 0
    score: 0.99
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 2108
    col: 0
    score: 0.99
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 3603
    col: 0
    score: 0.99
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 2186
    col: 0
    score: 0.99
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 2285
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 3135
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 2146
    col: 0
    score: 0.98
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 3510
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2876
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1946
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 4074
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3290
    col: 0
    score: 0.98
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 8684
    col: 0
    score: 0.97
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 13464
    col: 0
    score: 0.97
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 26843
    col: 0
    score: 0.97
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 9060
    col: 0
    score: 0.97
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 13679
    col: 0
    score: 0.97
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 7348
    col: 0
    score: 0.97
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 742
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 2497
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3036
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 4072
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6220
    col: 0
    score: 0.99
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 3522
    col: 0
    score: 0.99
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 2860
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 2196
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2847
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 6631
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 9583
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 4084
    col: 0
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 5200
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6038
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6039
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3032
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 13777
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 2046
    col: 0
    score: 0.99
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 3554
    col: 0
    score: 0.99
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 1872
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 2149
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 14253
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 3167
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6581
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 3582
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 3168
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 2834
    col: 0
    score: 0.97
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 2177
    col: 0
    score: 0.97
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 5015
    col: 0
    score: 0.97
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 3171
    col: 0
    score: 0.99
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 3329
    col: 0
    score: 0.98
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 2314
    col: 0
    score: 0.98
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 2526
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 3169
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 2754
    col: 0
    score: 0.99
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 1682
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 4919
    col: 0
    score: 0.99
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 8484
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 13775
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 17942
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 2047
    col: 0
    score: 0.99
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 1873
    col: 0
    score: 0.99
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 7912
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 13749
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 7911
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 14125
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 14996
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 21662
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 14501
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 13101
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 11943
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 3605
    col: 0
    score: 0.99
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 2392
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 4124
    col: 0
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 3527
    col: 0
    score: 0.97
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 1670
    col: 0
    score: 0.97
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 4264
    col: 0
    score: 0.97
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 11942
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 3603
    col: 0
    score: 0.99
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 2102
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 4123
    col: 0
    score: 0.99
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 861
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 3385
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 2210
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 15611
    col: 0
    score: 0.98
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 13179
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 14379
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 24770
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 17501
    col: 0
    score: 0.98
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 2974
    col: 0
    score: 0.98
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 2911
    col: 0
    score: 0.98
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 940
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 2320
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 1856
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 5700
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 1963
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 2387
    col: 0
    score: 0.99
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 941
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 5698
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 1962
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 3601
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 2321
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 1855
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 942
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 3600
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 17736
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 2322
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 1857
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 5701
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 2388
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 17161
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 14215
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 944
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 3714
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 2323
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 1859
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 17160
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 14213
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 943
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 3713
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 2324
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 1858
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 13966
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 2301
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 2233
    col: 0
    score: 0.99
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 2412
    col: 0
    score: 0.99
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 878
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 22429
    col: 0
    score: 0.98
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 1820
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 13158
    col: 0
    score: 0.99
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 2295
    col: 0
    score: 0.99
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 2377
    col: 0
    score: 0.99
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 1819
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 12978
    col: 0
    score: 0.99
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 1633
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 6181
    col: 0
    score: 0.98
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 12979
    col: 0
    score: 0.99
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 1763
    col: 0
    score: 0.98
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 1885
    col: 0
    score: 0.98
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 3356
    col: 0
    score: 0.98
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 12981
    col: 0
    score: 0.99
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 1817
    col: 0
    score: 0.99
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 3685
    col: 0
    score: 0.98
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 2080
    col: 0
    score: 0.98
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 2456
    col: 0
    score: 0.98
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 1844
    col: 0
    score: 0.97
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 2496
    col: 0
    score: 0.91
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 633
    col: 0
    score: 0.89
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 900
    col: 0
    score: 0.89
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 1118
    col: 0
    score: 0.89
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 861
    col: 0
    score: 0.89
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 884
    col: 0
    score: 0.89
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 831
    col: 0
    score: 0.89
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 1115
    col: 0
    score: 0.89
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 2868
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 17934
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 20258
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 12976
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 13075
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 13768
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 2559
    col: 0
    score: 0.99
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 2547
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 19374
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 1787
    col: 0
    score: 0.99
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 1572
    col: 0
    score: 0.98
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 1671
    col: 0
    score: 0.98
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 2467
    col: 0
    score: 0.98
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 1767
    col: 0
    score: 0.98
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 1906
    col: 0
    score: 0.98
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 1674
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 1790
    col: 0
    score: 0.99
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 2498
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 3044
    col: 0
    score: 0.99
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 907
    col: 0
    score: 0.98
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 2595
    col: 0
    score: 0.98
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 2905
    col: 0
    score: 0.98
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3327
    col: 0
    score: 0.98
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2302
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 1813
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 2944
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 2348
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 2837
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 4185
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 3859
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 4379
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2299
    col: 0
    score: 0.99
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 2945
    col: 0
    score: 0.99
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 2343
    col: 0
    score: 0.99
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 2830
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 4180
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 3854
    col: 0
    score: 0.99
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2300
    col: 0
    score: 0.99
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 1806
    col: 0
    score: 0.99
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 2946
    col: 0
    score: 0.99
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 2344
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 4181
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 3855
    col: 0
    score: 0.99
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 2947
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 2345
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 2831
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 4182
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 3856
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 2588
    col: 0
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 4383
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2296
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 1808
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 2346
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 2832
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 4179
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 3857
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 23742
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 18259
    col: 0
    score: 0.99
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 11845
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 25520
    col: 0
    score: 0.99
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 10218
    col: 0
    score: 0.99
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 11264
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 18042
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 23743
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 2080
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 1733
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 23720
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 23645
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 13489
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 2922
    col: 0
    score: 1
  - uuid: ac9d3ac5-9a6a-4180-a67f-1ab7e229d981
    line: 1529
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 2777
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 4530
    col: 0
    score: 0.99
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 3244
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 16847
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 1929
    col: 0
    score: 0.98
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 18682
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 12321
    col: 0
    score: 0.99
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 2497
    col: 0
    score: 0.99
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 1991
    col: 0
    score: 0.99
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 1217
    col: 0
    score: 0.99
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 2511
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 18685
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 14203
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 2475
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 938
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 2489
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 18686
    col: 0
    score: 0.99
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 2942
    col: 0
    score: 0.99
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 1070
    col: 0
    score: 0.98
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 12322
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 18684
    col: 0
    score: 0.99
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 2862
    col: 0
    score: 0.98
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 1950
    col: 0
    score: 0.98
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 2811
    col: 0
    score: 0.98
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 821
    col: 0
    score: 0.98
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 1045
    col: 0
    score: 0.98
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 18653
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 4642
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 14792
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 15712
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 17577
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 3050
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 12796
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 17336
    col: 0
    score: 0.98
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 16446
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 17585
    col: 0
    score: 0.98
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 2893
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 2439
    col: 0
    score: 0.98
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 1991
    col: 0
    score: 0.98
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 2076
    col: 0
    score: 0.98
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 2157
    col: 0
    score: 0.98
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 2505
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 12317
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6322
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 12657
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 16655
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 17209
    col: 0
    score: 0.99
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 1806
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 2434
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 1598
    col: 0
    score: 0.98
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 2085
    col: 0
    score: 0.99
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 2941
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2772
    col: 0
    score: 0.99
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 1475
    col: 0
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 3336
    col: 0
    score: 0.99
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 3496
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 25132
    col: 0
    score: 0.99
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 2940
    col: 0
    score: 0.98
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 1474
    col: 0
    score: 0.98
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 2083
    col: 0
    score: 0.98
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 3335
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2771
    col: 0
    score: 0.99
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 3495
    col: 0
    score: 0.99
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 2084
    col: 0
    score: 0.97
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 1473
    col: 0
    score: 0.97
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 2939
    col: 0
    score: 0.97
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 3334
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2769
    col: 0
    score: 0.99
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 3494
    col: 0
    score: 0.99
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 2406
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 5471
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 4165
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 4875
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 4420
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 3771
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 4637
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 5472
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 4166
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 4876
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 4421
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 3772
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 4638
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 5473
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 4167
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 4877
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 4422
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 3773
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 4639
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 1639
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 1997
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 3985
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 2086
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 2942
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2773
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 3605
    col: 0
    score: 0.99
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 2087
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 2943
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2774
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 2395
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 19059
    col: 0
    score: 0.98
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 16712
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 20540
    col: 0
    score: 0.99
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 1991
    col: 0
    score: 0.97
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 2256
    col: 0
    score: 0.96
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 2321
    col: 0
    score: 0.96
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 2027
    col: 0
    score: 0.96
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 2822
    col: 0
    score: 0.96
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 25130
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 23657
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 20537
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 16714
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 1841
    col: 0
    score: 0.97
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 1847
    col: 0
    score: 0.97
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 2109
    col: 0
    score: 0.97
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 2467
    col: 0
    score: 0.97
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 22238
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 20538
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 23658
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 16713
    col: 0
    score: 0.99
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 2391
    col: 0
    score: 0.99
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 1993
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 21204
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 23655
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 20535
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 17430
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 2002
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 1641
    col: 0
    score: 0.99
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 1289
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 21205
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 23656
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 17431
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 20733
    col: 0
    score: 0.97
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 23389
    col: 0
    score: 0.97
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 2427
    col: 0
    score: 0.97
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 1290
    col: 0
    score: 0.97
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 20533
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 19269
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 15444
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 18713
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 20534
    col: 0
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 2079
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 3619
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 17942
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 25058
    col: 0
    score: 0.99
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 11747
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 15907
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 25200
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 23854
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 20747
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 1650
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 17426
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 1785
    col: 0
    score: 0.99
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 2475
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 17985
    col: 0
    score: 0.99
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 1518
    col: 0
    score: 0.98
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 651
    col: 0
    score: 0.94
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 748
    col: 0
    score: 0.94
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 772
    col: 0
    score: 0.94
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1337
    col: 0
    score: 0.94
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 458
    col: 0
    score: 0.94
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 765
    col: 0
    score: 0.94
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 404
    col: 0
    score: 0.94
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 364
    col: 0
    score: 0.94
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 799
    col: 0
    score: 0.94
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 525
    col: 0
    score: 0.94
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 560
    col: 0
    score: 0.94
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 17984
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 2085
    col: 0
    score: 0.95
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 17980
    col: 0
    score: 0.99
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 2947
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 17981
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 2215
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 17982
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 2244
    col: 0
    score: 0.98
  - uuid: 9413237f-2537-4bbf-8768-db6180970e36
    line: 736
    col: 0
    score: 0.98
  - uuid: c0392040-16a2-41e8-bd54-75110319e3c0
    line: 1428
    col: 0
    score: 0.98
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 1903
    col: 0
    score: 0.98
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 4188
    col: 0
    score: 0.98
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 3810
    col: 0
    score: 0.98
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 1802
    col: 0
    score: 0.98
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 1694
    col: 0
    score: 0.98
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 1933
    col: 0
    score: 0.98
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 2546
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 2247
    col: 0
    score: 0.99
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 1531
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 2052
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 3075
    col: 0
    score: 0.99
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 2266
    col: 0
    score: 0.99
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 1104
    col: 0
    score: 0.99
  - uuid: f1add613-656e-4bec-b52b-193fd78c4642
    line: 1214
    col: 0
    score: 0.97
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 2439
    col: 0
    score: 0.97
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 2858
    col: 0
    score: 0.97
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 1783
    col: 0
    score: 0.97
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 4153
    col: 0
    score: 0.97
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 1319
    col: 0
    score: 0.97
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 3443
    col: 0
    score: 0.97
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 3401
    col: 0
    score: 0.97
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 4177
    col: 0
    score: 0.97
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 2221
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2139
    col: 0
    score: 0.98
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 2641
    col: 0
    score: 0.97
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 1649
    col: 0
    score: 0.98
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 3069
    col: 0
    score: 0.99
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 1076
    col: 0
    score: 0.99
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 2260
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 8058
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 20828
    col: 0
    score: 0.99
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 1599
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 20829
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2427
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 20826
    col: 0
    score: 0.99
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 1410
    col: 0
    score: 0.99
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 780
    col: 0
    score: 0.98
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 1019
    col: 0
    score: 0.98
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 949
    col: 0
    score: 0.98
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 1009
    col: 0
    score: 0.98
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 952
    col: 0
    score: 0.98
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 868
    col: 0
    score: 0.98
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 849
    col: 0
    score: 0.98
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 1189
    col: 0
    score: 0.98
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 895
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 7742
    col: 0
    score: 0.99
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 7627
    col: 0
    score: 0.99
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 1422
    col: 0
    score: 0.99
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 1375
    col: 0
    score: 0.99
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 3330
    col: 0
    score: 0.98
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 1423
    col: 0
    score: 0.99
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 1376
    col: 0
    score: 0.99
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 3269
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 7744
    col: 0
    score: 0.99
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 7629
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 8323
    col: 0
    score: 0.99
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 869
    col: 0
    score: 0.98
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 1134
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 4005
    col: 0
    score: 0.98
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 1417
    col: 0
    score: 0.99
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 1370
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 2841
    col: 0
    score: 0.99
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 5886
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 4970
    col: 0
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 4463
    col: 0
    score: 0.99
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 2529
    col: 0
    score: 0.99
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 3161
    col: 0
    score: 0.99
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 2063
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 13719
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 11956
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 4214
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 4971
    col: 0
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 4464
    col: 0
    score: 0.99
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 1595
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 5452
    col: 0
    score: 0.99
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 3153
    col: 0
    score: 0.99
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 2803
    col: 0
    score: 0.99
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 2743
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 4215
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 5887
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 4465
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 7625
    col: 0
    score: 0.99
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 5550
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 6385
    col: 0
    score: 0.99
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 2034
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 4294
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 4216
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 6577
    col: 0
    score: 0.99
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 5888
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 4972
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 1894
    col: 0
    score: 0.99
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 1904
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 5340
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 3940
    col: 0
    score: 0.99
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 5890
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 4974
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 4467
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 3163
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 3018
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 6511
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 7791
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 5891
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 4975
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 4468
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 5913
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 22999
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 15592
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 14580
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 17933
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 20506
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 15723
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 17830
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 15235
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 25380
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 13671
    col: 0
    score: 0.98
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 22719
    col: 0
    score: 0.98
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 26196
    col: 0
    score: 0.98
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 5571
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 23874
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 12509
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 23537
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 23662
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 5572
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 4219
    col: 0
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 1939
    col: 0
    score: 0.99
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 4767
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 4867
    col: 0
    score: 0.99
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 3681
    col: 0
    score: 0.99
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 4927
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 5573
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 4220
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 5592
    col: 0
    score: 0.99
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 2719
    col: 0
    score: 0.99
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2877
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6936
    col: 0
    score: 0.99
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 4746
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 8656
    col: 0
    score: 0.99
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 5133
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 3836
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 15741
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 3739
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 2690
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 1993
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 2465
    col: 0
    score: 0.99
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 2304
    col: 0
    score: 0.99
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 2561
    col: 0
    score: 0.99
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 2195
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 2995
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 4677
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 2893
    col: 0
    score: 0.98
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 1173
    col: 0
    score: 0.98
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 1218
    col: 0
    score: 0.98
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 4003
    col: 0
    score: 0.98
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 5569
    col: 0
    score: 0.99
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 3249
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 1725
    col: 0
    score: 0.99
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 3699
    col: 0
    score: 0.99
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 3613
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 6959
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 4044
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 7764
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 4479
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 4226
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 3614
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 6960
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 4045
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 7765
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 4227
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 5903
    col: 0
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 4481
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 1924
    col: 0
    score: 0.99
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 1699
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 4228
    col: 0
    score: 0.99
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 5904
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 4985
    col: 0
    score: 0.99
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 3462
    col: 0
    score: 0.99
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 4117
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 3301
    col: 0
    score: 0.99
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 4376
    col: 0
    score: 0.99
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 5132
    col: 0
    score: 0.99
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 3193
    col: 0
    score: 0.99
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 1949
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2102
    col: 0
    score: 0.99
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 2058
    col: 0
    score: 0.99
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 2033
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 3300
    col: 0
    score: 0.99
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 2100
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 3800
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 4565
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 6381
    col: 0
    score: 0.98
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 2101
    col: 0
    score: 0.99
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 1666
    col: 0
    score: 0.98
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 4008
    col: 0
    score: 0.98
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 1952
    col: 0
    score: 0.98
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 2112
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6159
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 4274
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 10096
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 4925
    col: 0
    score: 0.99
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 3869
    col: 0
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 4520
    col: 0
    score: 0.99
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 3119
    col: 0
    score: 0.99
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 6349
    col: 0
    score: 0.99
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 3457
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 1881
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 12814
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 23932
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 16340
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 20805
    col: 0
    score: 0.99
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 5910
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 4990
    col: 0
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 4487
    col: 0
    score: 0.99
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 2988
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 20512
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 4234
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 4991
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 4488
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 5405
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 3866
    col: 0
    score: 0.99
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 2379
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 9193
    col: 0
    score: 0.99
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 4187
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 3823
    col: 0
    score: 0.97
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 3952
    col: 0
    score: 0.97
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 3357
    col: 0
    score: 0.97
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 1841
    col: 0
    score: 0.97
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 5084
    col: 0
    score: 0.97
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3619
    col: 0
    score: 0.97
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 1002
    col: 0
    score: 0.97
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 7999
    col: 0
    score: 0.97
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 3306
    col: 0
    score: 0.97
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 4236
    col: 0
    score: 0.99
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 5912
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 4992
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 2105
    col: 0
    score: 0.99
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 2117
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 2454
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 4296
    col: 0
    score: 0.99
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 1779
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 3042
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 3373
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 5425
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 4202
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 3114
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 1685
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 4037
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 3043
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 3374
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 5427
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 4203
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 1687
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 4039
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 2614
    col: 0
    score: 0.99
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 2049
    col: 0
    score: 0.99
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 1778
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 3044
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 3375
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 4205
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 1686
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 4038
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 2050
    col: 0
    score: 0.99
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 2483
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6025
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 1791
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3401
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 2618
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 2054
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 1757
    col: 0
    score: 0.99
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 3253
    col: 0
    score: 0.99
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 2739
    col: 0
    score: 0.99
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 1890
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 4295
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 1974
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 2559
    col: 0
    score: 0.99
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 2961
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 4552
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 1993
    col: 0
    score: 1
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 854
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 5495
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 4197
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 4553
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 2487
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 4899
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 4551
    col: 0
    score: 0.99
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 1057
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 2278
    col: 0
    score: 0.99
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 1678
    col: 0
    score: 0.99
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 1627
    col: 0
    score: 0.99
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 1849
    col: 0
    score: 0.99
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 2916
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 3439
    col: 0
    score: 0.98
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 2402
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 4826
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 3570
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 2757
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 3162
    col: 0
    score: 1
  - uuid: b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
    line: 1328
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 2699
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 3737
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 3569
    col: 0
    score: 0.99
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 1885
    col: 0
    score: 0.98
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 3508
    col: 0
    score: 0.98
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 2405
    col: 0
    score: 0.98
  - uuid: b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
    line: 1327
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 3568
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 2977
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 3786
    col: 0
    score: 0.99
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 4530
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 2469
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 7187
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 1781
    col: 0
    score: 0.99
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 2527
    col: 0
    score: 0.99
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 2169
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 2589
    col: 0
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 3851
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 3369
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 2759
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 3839
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 3157
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 1750
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 4822
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 3852
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 3370
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 3838
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 1751
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 4821
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 3853
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 3371
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 3840
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 2240
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 3462
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 2311
    col: 0
    score: 0.97
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 3791
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 9058
    col: 0
    score: 0.97
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 2396
    col: 0
    score: 0.97
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 2185
    col: 0
    score: 0.97
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 5236
    col: 0
    score: 0.99
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 1788
    col: 0
    score: 0.99
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 2460
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 5543
    col: 0
    score: 0.99
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 2713
    col: 0
    score: 0.99
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 2053
    col: 0
    score: 0.99
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 1482
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 3504
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 3353
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 2009
    col: 0
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 2109
    col: 0
    score: 0.96
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 6216
    col: 0
    score: 0.96
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 2374
    col: 0
    score: 0.95
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 1480
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 3502
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 3351
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 1481
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 2405
    col: 0
    score: 0.99
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 2008
    col: 0
    score: 0.99
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 2407
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 2010
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 3500
    col: 0
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 3350
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2391
    col: 0
    score: 0.95
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 1212
    col: 0
    score: 0.95
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 1536
    col: 0
    score: 0.95
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 2186
    col: 0
    score: 0.99
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 2524
    col: 0
    score: 0.99
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 3966
    col: 0
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 7228
    col: 0
    score: 0.99
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 4603
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 4337
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 6331
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 3363
    col: 0
    score: 0.97
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 2287
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 2525
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 3967
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 7229
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 4604
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2716
    col: 0
    score: 0.99
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 1369
    col: 0
    score: 0.99
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 4621
    col: 0
    score: 0.99
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 2288
    col: 0
    score: 0.99
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 2187
    col: 0
    score: 0.99
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 3968
    col: 0
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 7230
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2717
    col: 0
    score: 0.98
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 1370
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 24581
    col: 0
    score: 0.98
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 22780
    col: 0
    score: 0.98
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 2199
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 3210
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 2270
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 2521
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 1467
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 2147
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 6328
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3131
    col: 0
    score: 0.97
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 3211
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 2271
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 2522
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 2148
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1974
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 3262
    col: 0
    score: 0.98
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 2154
    col: 0
    score: 0.98
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 1611
    col: 0
    score: 0.98
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 2776
    col: 0
    score: 0.98
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 2203
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 2275
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 4336
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 6330
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 1607
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 2246
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 2643
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 2731
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 2204
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 6613
    col: 0
    score: 0.99
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 2644
    col: 0
    score: 0.99
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 2732
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6109
    col: 0
    score: 0.99
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 2670
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 4338
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 6332
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 6614
    col: 0
    score: 0.99
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 2247
    col: 0
    score: 0.99
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 2733
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6110
    col: 0
    score: 0.99
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 2671
    col: 0
    score: 0.99
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 5198
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 4339
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 6333
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 6615
    col: 0
    score: 0.99
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 2248
    col: 0
    score: 0.99
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 2645
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6111
    col: 0
    score: 0.99
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 2672
    col: 0
    score: 0.99
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 5199
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 4340
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 6334
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 2755
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 6016
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 2422
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 6616
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 2249
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 2646
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 4341
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 6335
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 6617
    col: 0
    score: 0.99
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 2250
    col: 0
    score: 0.99
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 2647
    col: 0
    score: 0.99
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 2735
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6112
    col: 0
    score: 0.99
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 5201
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6018
    col: 0
    score: 0.99
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 3907
    col: 0
    score: 0.99
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 2474
    col: 0
    score: 0.99
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 3213
    col: 0
    score: 0.99
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 2607
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 3689
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 6025
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 2446
    col: 0
    score: 0.99
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 2172
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 3207
    col: 0
    score: 0.99
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 1321
    col: 0
    score: 0.99
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 2435
    col: 0
    score: 0.97
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 2652
    col: 0
    score: 0.97
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 3513
    col: 0
    score: 0.97
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 2857
    col: 0
    score: 0.97
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 1208
    col: 0
    score: 0.97
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 2173
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 3208
    col: 0
    score: 0.99
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 2601
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 25812
    col: 0
    score: 0.98
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 10238
    col: 0
    score: 0.97
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 10113
    col: 0
    score: 0.97
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 17169
    col: 0
    score: 0.97
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 10668
    col: 0
    score: 0.97
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 2602
    col: 0
    score: 0.99
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 1322
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 15099
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 18186
    col: 0
    score: 0.98
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3220
    col: 0
    score: 0.98
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2594
    col: 0
    score: 0.98
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 1702
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 5255
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 1316
    col: 0
    score: 0.99
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 1328
    col: 0
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 2682
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 12681
    col: 0
    score: 0.98
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 1095
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 5570
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 5256
    col: 0
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 1326
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 2769
    col: 0
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 2681
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 15513
    col: 0
    score: 0.96
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 26048
    col: 0
    score: 0.96
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 5512
    col: 0
    score: 0.96
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 5257
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 1315
    col: 0
    score: 0.99
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 1327
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 2770
    col: 0
    score: 0.99
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 1355
    col: 0
    score: 0.97
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 3074
    col: 0
    score: 0.97
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2743
    col: 0
    score: 0.97
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 5254
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 1317
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 2771
    col: 0
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 2683
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3560
    col: 0
    score: 0.96
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 1909
    col: 0
    score: 0.96
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 1128
    col: 0
    score: 0.96
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 1257
    col: 0
    score: 0.96
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 2994
    col: 0
    score: 0.99
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 2771
    col: 0
    score: 0.92
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 3585
    col: 0
    score: 0.92
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 1534
    col: 0
    score: 0.92
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 2003
    col: 0
    score: 0.92
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 2032
    col: 0
    score: 0.92
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 3179
    col: 0
    score: 0.92
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 2187
    col: 0
    score: 0.92
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 2723
    col: 0
    score: 0.92
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 1471
    col: 0
    score: 0.98
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 6496
    col: 0
    score: 0.97
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 1999
    col: 0
    score: 0.97
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 2572
    col: 0
    score: 0.97
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 2186
    col: 0
    score: 0.99
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 2252
    col: 0
    score: 0.99
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 2997
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 4622
    col: 0
    score: 0.99
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 2056
    col: 0
    score: 0.99
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 1610
    col: 0
    score: 0.99
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 1950
    col: 0
    score: 0.99
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 1638
    col: 0
    score: 0.99
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 1992
    col: 0
    score: 1
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 853
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 2213
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 2279
    col: 0
    score: 0.99
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 1679
    col: 0
    score: 0.99
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 1628
    col: 0
    score: 0.99
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 1850
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 2110
    col: 0
    score: 0.99
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 1062
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 1680
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 1629
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 1851
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 2111
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 2918
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 15237
    col: 0
    score: 0.99
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 3326
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 1538
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 2215
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 3328
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 3329
    col: 0
    score: 0.99
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 3330
    col: 0
    score: 0.99
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 3332
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 1544
    col: 0
    score: 0.99
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 2446
    col: 0
    score: 0.97
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 3340
    col: 0
    score: 0.97
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 9756
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 9036
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 9757
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 9037
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 9758
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 9038
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 9759
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 7816
    col: 0
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 7551
    col: 0
    score: 0.99
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 5653
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 9040
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 1554
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 1555
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 1556
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 1557
    col: 0
    score: 0.99
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 3339
    col: 0
    score: 0.98
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 2792
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 1370
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 3460
    col: 0
    score: 0.99
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 2021
    col: 0
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 2202
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 2800
    col: 0
    score: 0.99
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 2298
    col: 0
    score: 0.99
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 3777
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 3347
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 2383
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 2172
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 7830
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 2793
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 3778
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 9045
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 3348
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 2173
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 7831
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 2794
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 3779
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 9046
    col: 0
    score: 0.99
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 3349
    col: 0
    score: 0.99
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 2384
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 7832
    col: 0
    score: 0.99
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 2795
    col: 0
    score: 0.99
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 3780
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 9047
    col: 0
    score: 0.99
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 3350
    col: 0
    score: 0.99
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 2385
    col: 0
    score: 0.99
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 2174
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 7833
    col: 0
    score: 0.99
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 2796
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 3157
    col: 0
    score: 0.97
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 2211
    col: 0
    score: 0.97
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 3219
    col: 0
    score: 0.97
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 2520
    col: 0
    score: 0.97
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 2331
    col: 0
    score: 0.97
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 3355
    col: 0
    score: 0.99
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 3356
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 3357
    col: 0
    score: 0.99
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 3358
    col: 0
    score: 0.99
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 3360
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 1576
    col: 0
    score: 0.99
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 3783
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 3331
    col: 0
    score: 0.97
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2317
    col: 0
    score: 0.97
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 3609
    col: 0
    score: 0.99
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 3021
    col: 0
    score: 0.99
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 3022
    col: 0
    score: 0.99
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 3283
    col: 0
    score: 0.99
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 2107
    col: 0
    score: 0.99
  - uuid: f1add613-656e-4bec-b52b-193fd78c4642
    line: 1544
    col: 0
    score: 0.99
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 2833
    col: 0
    score: 0.99
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 2580
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 20360
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 25302
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 3364
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 1580
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 1583
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 9057
    col: 0
    score: 0.97
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 2395
    col: 0
    score: 0.97
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 3368
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 1584
    col: 0
    score: 0.99
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 3807
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 9074
    col: 0
    score: 0.98
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 3361
    col: 0
    score: 0.99
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 2028
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 3632
    col: 0
    score: 0.99
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 3044
    col: 0
    score: 0.99
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 3045
    col: 0
    score: 0.99
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 3306
    col: 0
    score: 0.99
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 2130
    col: 0
    score: 0.99
  - uuid: f1add613-656e-4bec-b52b-193fd78c4642
    line: 1567
    col: 0
    score: 0.99
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 2856
    col: 0
    score: 0.99
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 2602
    col: 0
    score: 0.99
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 2743
    col: 0
    score: 0.99
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 2239
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 23337
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 20827
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 23338
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 20828
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 3788
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 9055
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 9077
    col: 0
    score: 0.97
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 1632
    col: 0
    score: 0.97
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 1581
    col: 0
    score: 0.97
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 2213
    col: 0
    score: 0.98
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 2812
    col: 0
    score: 0.98
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 3799
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 9066
    col: 0
    score: 0.98
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 3364
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 6260
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 3796
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 3365
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 6261
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 3797
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 3366
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 6262
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 3798
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 3819
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 9082
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 3287
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6840
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 3314
    col: 0
    score: 0.98
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 3718
    col: 0
    score: 0.98
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 2475
    col: 0
    score: 0.98
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 1814
    col: 0
    score: 0.98
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 3775
    col: 0
    score: 0.98
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 2380
    col: 0
    score: 0.98
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 2441
    col: 0
    score: 0.99
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 3590
    col: 0
    score: 0.98
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 3540
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 4201
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 4588
    col: 0
    score: 0.96
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 1765
    col: 0
    score: 0.99
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 2643
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 5993
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 18953
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 2089
    col: 0
    score: 0.98
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 1776
    col: 0
    score: 0.99
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 3814
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 9078
    col: 0
    score: 0.98
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 2406
    col: 0
    score: 0.98
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 1781
    col: 0
    score: 0.99
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 2484
    col: 0
    score: 0.98
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 2518
    col: 0
    score: 0.97
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 2061
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 1799
    col: 0
    score: 0.99
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 2476
    col: 0
    score: 0.98
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 2544
    col: 0
    score: 0.97
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 11430
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 3906
    col: 0
    score: 0.98
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 2754
    col: 0
    score: 0.98
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2763
    col: 0
    score: 0.98
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 1995
    col: 0
    score: 0.98
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 3914
    col: 0
    score: 0.98
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 3643
    col: 0
    score: 0.98
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 3656
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2772
    col: 0
    score: 0.99
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 2005
    col: 0
    score: 0.99
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 2482
    col: 0
    score: 0.98
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 3291
    col: 0
    score: 0.98
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 3830
    col: 0
    score: 0.98
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 2611
    col: 0
    score: 0.97
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 5534
    col: 0
    score: 0.97
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 5811
    col: 0
    score: 0.97
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 3250
    col: 0
    score: 0.97
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 2347
    col: 0
    score: 0.97
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 3342
    col: 0
    score: 0.97
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 2489
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 7270
    col: 0
    score: 0.99
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 2159
    col: 0
    score: 0.99
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 2102
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 7655
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 3163
    col: 0
    score: 0.99
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 3587
    col: 0
    score: 0.98
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 1718
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 1438
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 2160
    col: 0
    score: 0.99
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 1719
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 1439
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 2486
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 2804
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 2615
    col: 0
    score: 0.99
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 5539
    col: 0
    score: 0.99
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 1720
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 2487
    col: 0
    score: 0.99
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 3295
    col: 0
    score: 0.99
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 4110
    col: 0
    score: 0.98
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 3212
    col: 0
    score: 0.98
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 2616
    col: 0
    score: 0.98
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 1713
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 7649
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 1433
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 1714
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 7264
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 7650
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 1434
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 1715
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 7265
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 7651
    col: 0
    score: 0.99
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 1435
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 7266
    col: 0
    score: 0.99
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 1436
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 3160
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6368
    col: 0
    score: 0.98
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 1869
    col: 0
    score: 0.98
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 3069
    col: 0
    score: 0.98
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 20535
    col: 0
    score: 0.98
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 22740
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 12460
    col: 0
    score: 0.99
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 3634
    col: 0
    score: 0.98
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 4006
    col: 0
    score: 0.98
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 3794
    col: 0
    score: 0.98
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 4009
    col: 0
    score: 0.98
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 4140
    col: 0
    score: 0.98
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 22742
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 12462
    col: 0
    score: 0.99
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 3649
    col: 0
    score: 0.97
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 3908
    col: 0
    score: 0.97
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 2757
    col: 0
    score: 0.97
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2766
    col: 0
    score: 0.97
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 3657
    col: 0
    score: 0.97
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 15081
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 14618
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 23650
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 26694
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 18971
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 5134
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 2253
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 12904
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 3312
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 12920
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 16319
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 21614
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 7962
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 16301
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 14607
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 16955
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 1800
    col: 0
    score: 0.99
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 3175
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 2543
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 5178
    col: 0
    score: 0.99
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 1332
    col: 0
    score: 0.99
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 7514
    col: 0
    score: 0.97
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 6837
    col: 0
    score: 0.97
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 4598
    col: 0
    score: 0.97
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 11221
    col: 0
    score: 0.97
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 11417
    col: 0
    score: 0.97
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 19409
    col: 0
    score: 0.97
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 4252
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 7742
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 7382
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 5964
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 7743
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 7383
    col: 0
    score: 0.99
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 5965
    col: 0
    score: 0.99
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 4281
    col: 0
    score: 0.99
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 3996
    col: 0
    score: 0.99
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 4257
    col: 0
    score: 0.99
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 4253
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 7384
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 5966
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 4282
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 4254
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 7744
    col: 0
    score: 0.99
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 5967
    col: 0
    score: 0.99
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 4283
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 5841
    col: 0
    score: 0.99
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 4255
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 7745
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 7385
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 4284
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 5842
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 6400
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 4256
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 7746
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 7386
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 5968
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 5843
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 6401
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 4257
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 7747
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 7387
    col: 0
    score: 0.99
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 5969
    col: 0
    score: 0.99
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 4285
    col: 0
    score: 0.99
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 1694
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 3238
    col: 0
    score: 0.99
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 2032
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 3923
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 5845
    col: 0
    score: 0.99
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 3632
    col: 0
    score: 0.98
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 3916
    col: 0
    score: 0.97
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2773
    col: 0
    score: 0.97
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 1635
    col: 0
    score: 0.99
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 1693
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 3237
    col: 0
    score: 0.99
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 2600
    col: 0
    score: 0.99
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 1633
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 1692
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 3236
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 2918
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 5303
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 3648
    col: 0
    score: 0.99
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 2756
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2765
    col: 0
    score: 0.99
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 1997
    col: 0
    score: 0.99
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 3621
    col: 0
    score: 0.98
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 12102
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 13026
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 23862
    col: 0
    score: 0.99
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 12026
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 25949
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 16956
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 23382
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2774
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 22408
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 1695
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 23383
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2775
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 22409
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 2911
    col: 0
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 5296
    col: 0
    score: 0.99
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 2440
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 16958
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 23384
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2776
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 22410
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 1696
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 16959
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 23385
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2777
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 22411
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 1697
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 16960
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 23386
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2778
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 22412
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 1698
    col: 0
    score: 0.99
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 2727
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 2824
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 2288
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 2921
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 2373
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 3673
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 2789
    col: 0
    score: 0.99
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 2022
    col: 0
    score: 0.99
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 3619
    col: 0
    score: 0.99
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 3992
    col: 0
    score: 0.99
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 12109
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 18451
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 23868
    col: 0
    score: 0.99
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 12032
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 25953
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 21995
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 23662
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 2183
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 2720
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 2817
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 21996
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 23663
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 2184
    col: 0
    score: 0.99
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 2818
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 21997
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 23664
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 2185
    col: 0
    score: 0.99
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 2721
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 21998
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 23665
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 2186
    col: 0
    score: 0.99
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 2722
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 7353
    col: 0
    score: 0.98
  - uuid: 40185d05-010e-45e7-8c2d-2f879bf14218
    line: 1021
    col: 0
    score: 0.98
  - uuid: 5f65dfa5-dc97-4a6c-ad93-c45c1312e156
    line: 1046
    col: 0
    score: 0.98
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 4920
    col: 0
    score: 0.98
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 3453
    col: 0
    score: 0.98
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 1458
    col: 0
    score: 0.98
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 2501
    col: 0
    score: 0.98
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 2436
    col: 0
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 4555
    col: 0
    score: 0.99
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 3780
    col: 0
    score: 0.99
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 2437
    col: 0
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 4556
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 6595
    col: 0
    score: 0.97
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 2236
    col: 0
    score: 0.97
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 2625
    col: 0
    score: 0.97
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 2724
    col: 0
    score: 0.99
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 12334
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 18616
    col: 0
    score: 0.99
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 12272
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 19296
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 7012
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 5746
    col: 0
    score: 0.99
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 3946
    col: 0
    score: 0.99
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 6242
    col: 0
    score: 0.99
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 6238
    col: 0
    score: 0.99
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 5411
    col: 0
    score: 0.99
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 4440
    col: 0
    score: 0.99
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 6533
    col: 0
    score: 0.99
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 3719
    col: 0
    score: 0.99
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 3082
    col: 0
    score: 0.99
  - uuid: 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
    line: 931
    col: 0
    score: 0.96
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 4676
    col: 0
    score: 0.96
  - uuid: c0392040-16a2-41e8-bd54-75110319e3c0
    line: 949
    col: 0
    score: 0.96
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 1423
    col: 0
    score: 0.96
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 2369
    col: 0
    score: 0.96
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 7467
    col: 0
    score: 0.96
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 1596
    col: 0
    score: 0.96
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 1254
    col: 0
    score: 0.96
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 1635
    col: 0
    score: 0.96
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 8990
    col: 0
    score: 0.99
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 5504
    col: 0
    score: 0.97
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 3812
    col: 0
    score: 0.97
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 913
    col: 0
    score: 0.94
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 831
    col: 0
    score: 0.94
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 928
    col: 0
    score: 0.94
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 654
    col: 0
    score: 0.94
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 500
    col: 0
    score: 0.94
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 763
    col: 0
    score: 0.94
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 818
    col: 0
    score: 0.94
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 856
    col: 0
    score: 0.94
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 4198
    col: 0
    score: 0.99
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 4181
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 6664
    col: 0
    score: 0.96
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 4339
    col: 0
    score: 0.96
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 4278
    col: 0
    score: 0.96
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 3932
    col: 0
    score: 0.96
  - uuid: f1add613-656e-4bec-b52b-193fd78c4642
    line: 1645
    col: 0
    score: 0.96
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 3707
    col: 0
    score: 0.96
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 3238
    col: 0
    score: 0.96
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 3354
    col: 0
    score: 0.96
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 2740
    col: 0
    score: 0.96
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 3599
    col: 0
    score: 0.96
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 2221
    col: 0
    score: 0.96
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 1340
    col: 0
    score: 0.96
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 14971
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 20174
    col: 0
    score: 0.98
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 14159
    col: 0
    score: 0.98
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 2760
    col: 0
    score: 0.98
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 2062
    col: 0
    score: 0.98
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 1860
    col: 0
    score: 0.98
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 3282
    col: 0
    score: 0.98
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 16045
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 8923
    col: 0
    score: 0.99
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 4187
    col: 0
    score: 0.99
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 5729
    col: 0
    score: 0.99
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 5025
    col: 0
    score: 0.99
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 4547
    col: 0
    score: 0.99
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 3862
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 9849
    col: 0
    score: 0.99
  - uuid: 40185d05-010e-45e7-8c2d-2f879bf14218
    line: 1307
    col: 0
    score: 0.99
  - uuid: 5f65dfa5-dc97-4a6c-ad93-c45c1312e156
    line: 1342
    col: 0
    score: 0.99
  - uuid: 9413237f-2537-4bbf-8768-db6180970e36
    line: 859
    col: 0
    score: 0.98
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 4380
    col: 0
    score: 0.98
  - uuid: c0392040-16a2-41e8-bd54-75110319e3c0
    line: 1550
    col: 0
    score: 0.98
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 2013
    col: 0
    score: 0.98
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 3483
    col: 0
    score: 0.98
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 5545
    col: 0
    score: 0.98
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 2193
    col: 0
    score: 0.98
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 3757
    col: 0
    score: 0.98
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 1576
    col: 0
    score: 0.98
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 1927
    col: 0
    score: 0.99
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 2405
    col: 0
    score: 0.99
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 2302
    col: 0
    score: 0.99
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 1928
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 2406
    col: 0
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 2303
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 1929
    col: 0
    score: 0.99
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 2407
    col: 0
    score: 0.99
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 2304
    col: 0
    score: 0.99
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 1931
    col: 0
    score: 0.99
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 2409
    col: 0
    score: 0.99
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 2306
    col: 0
    score: 0.99
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 1932
    col: 0
    score: 0.99
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 2410
    col: 0
    score: 0.99
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 2307
    col: 0
    score: 0.99
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 1933
    col: 0
    score: 0.99
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 2411
    col: 0
    score: 0.99
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 2308
    col: 0
    score: 0.99
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 1926
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 2404
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 1380
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 21684
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 1381
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 18444
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 6605
    col: 0
    score: 0.96
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6093
    col: 0
    score: 0.96
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 2142
    col: 0
    score: 0.96
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 4027
    col: 0
    score: 0.96
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 18445
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 1382
    col: 0
    score: 0.99
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 1452
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 18446
    col: 0
    score: 0.99
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 1383
    col: 0
    score: 0.99
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 1453
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 18448
    col: 0
    score: 0.99
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 1385
    col: 0
    score: 0.99
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 1481
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 18449
    col: 0
    score: 0.99
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 1386
    col: 0
    score: 0.99
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 1456
    col: 0
    score: 0.98
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 2222
    col: 0
    score: 0.98
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 2830
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 18450
    col: 0
    score: 0.99
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 1833
    col: 0
    score: 0.98
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 1818
    col: 0
    score: 0.97
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 18451
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 1389
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 19239
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 17889
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 24798
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 1390
    col: 0
    score: 0.99
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 1899
    col: 0
    score: 0.99
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 3197
    col: 0
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 4243
    col: 0
    score: 0.99
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 4546
    col: 0
    score: 0.99
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 1900
    col: 0
    score: 0.99
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 3198
    col: 0
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 4244
    col: 0
    score: 0.99
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 1901
    col: 0
    score: 0.99
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 3199
    col: 0
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 4245
    col: 0
    score: 0.99
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 1902
    col: 0
    score: 0.99
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 3200
    col: 0
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 4246
    col: 0
    score: 0.99
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 1395
    col: 0
    score: 0.99
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 2212
    col: 0
    score: 0.98
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 1396
    col: 0
    score: 0.99
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 1447
    col: 0
    score: 0.97
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 1397
    col: 0
    score: 0.99
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 2214
    col: 0
    score: 0.97
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 2813
    col: 0
    score: 0.97
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 1813
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 1807
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 3193
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 6586
    col: 0
    score: 0.93
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 19056
    col: 0
    score: 0.93
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 953
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2567
    col: 0
    score: 0.99
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 1399
    col: 0
    score: 0.99
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 2230
    col: 0
    score: 0.95
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 2833
    col: 0
    score: 0.95
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2568
    col: 0
    score: 0.99
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 2219
    col: 0
    score: 0.99
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 1403
    col: 0
    score: 0.99
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 1404
    col: 0
    score: 0.99
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 1405
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 10457
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 11083
    col: 0
    score: 0.99
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 1407
    col: 0
    score: 0.99
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 2217
    col: 0
    score: 0.95
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 1408
    col: 0
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 7439
    col: 0
    score: 0.85
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 1409
    col: 0
    score: 0.99
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 1743
    col: 0
    score: 0.99
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 1410
    col: 0
    score: 0.99
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 1461
    col: 0
    score: 0.99
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 1412
    col: 0
    score: 0.99
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 1746
    col: 0
    score: 0.99
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 1413
    col: 0
    score: 0.99
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 3520
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 9682
    col: 0
    score: 0.98
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 1414
    col: 0
    score: 0.99
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 2683
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 2768
    col: 0
    score: 0.95
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 3926
    col: 0
    score: 0.95
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 3985
    col: 0
    score: 0.95
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 3601
    col: 0
    score: 0.94
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 4446
    col: 0
    score: 0.94
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 3739
    col: 0
    score: 0.94
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 3902
    col: 0
    score: 0.91
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 3581
    col: 0
    score: 0.91
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 1469
    col: 0
    score: 0.99
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 1744
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6841
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 5927
    col: 0
    score: 0.99
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 1330
    col: 0
    score: 0.99
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 2545
    col: 0
    score: 0.99
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 1332
    col: 0
    score: 0.99
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 2547
    col: 0
    score: 0.99
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 1333
    col: 0
    score: 0.99
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 2548
    col: 0
    score: 0.99
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 1472
    col: 0
    score: 0.99
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 2234
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 8837
    col: 0
    score: 0.99
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 2857
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 9070
    col: 0
    score: 0.99
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 3910
    col: 0
    score: 0.99
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 12927
    col: 0
    score: 0.97
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 22051
    col: 0
    score: 0.97
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 16867
    col: 0
    score: 0.97
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 12804
    col: 0
    score: 0.97
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 24339
    col: 0
    score: 0.97
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 11213
    col: 0
    score: 0.97
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 12255
    col: 0
    score: 0.97
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 13748
    col: 0
    score: 0.97
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 27529
    col: 0
    score: 0.89
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 25478
    col: 0
    score: 0.89
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 11670
    col: 0
    score: 0.88
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 2033
    col: 0
    score: 0.97
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 2609
    col: 0
    score: 0.97
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 3129
    col: 0
    score: 0.97
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 3287
    col: 0
    score: 0.97
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 2073
    col: 0
    score: 0.97
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 3139
    col: 0
    score: 0.97
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 2601
    col: 0
    score: 0.97
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 2426
    col: 0
    score: 0.97
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 3152
    col: 0
    score: 0.97
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 2390
    col: 0
    score: 0.97
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 3738
    col: 0
    score: 0.98
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 3760
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 7941
    col: 0
    score: 0.98
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 5164
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 2212
    col: 0
    score: 0.98
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 2578
    col: 0
    score: 0.98
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 4260
    col: 0
    score: 0.98
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 2976
    col: 0
    score: 0.98
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 3843
    col: 0
    score: 0.98
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 3472
    col: 0
    score: 0.98
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 2476
    col: 0
    score: 0.98
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 2895
    col: 0
    score: 0.98
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 1820
    col: 0
    score: 0.98
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2201
    col: 0
    score: 0.98
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 1356
    col: 0
    score: 0.98
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 3480
    col: 0
    score: 0.98
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 3438
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 9958
    col: 0
    score: 0.98
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 2486
    col: 0
    score: 0.99
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 1830
    col: 0
    score: 0.99
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 1366
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 3490
    col: 0
    score: 0.99
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 4223
    col: 0
    score: 0.99
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 5775
    col: 0
    score: 0.99
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 5071
    col: 0
    score: 0.99
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 4584
    col: 0
    score: 0.99
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 4447
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 9874
    col: 0
    score: 0.99
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 3597
    col: 0
    score: 0.99
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 4937
    col: 0
    score: 0.99
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 1490
    col: 0
    score: 0.99
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 360
    col: 0
    score: 0.94
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 408
    col: 0
    score: 0.94
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 277
    col: 0
    score: 0.94
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 408
    col: 0
    score: 0.94
  - uuid: f1add613-656e-4bec-b52b-193fd78c4642
    line: 415
    col: 0
    score: 0.94
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 418
    col: 0
    score: 0.94
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 276
    col: 0
    score: 0.94
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 334
    col: 0
    score: 0.94
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 269
    col: 0
    score: 0.94
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 398
    col: 0
    score: 0.94
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 7541
    col: 0
    score: 0.97
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 3844
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 1873
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 1992
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 3845
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 1874
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 1993
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 1875
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 1994
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 3846
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 6762
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 3847
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 1876
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 1995
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 6763
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 3848
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 1877
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 1996
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 3849
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 1878
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 1997
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 3850
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 1879
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 1998
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 6766
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 3851
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 1876
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 1880
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 1905
    col: 0
    score: 0.99
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 1829
    col: 0
    score: 0.99
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 2538
    col: 0
    score: 0.99
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 1832
    col: 0
    score: 0.99
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 1833
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 22020
    col: 0
    score: 0.99
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 1984
    col: 0
    score: 0.99
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 2336
    col: 0
    score: 0.98
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 2518
    col: 0
    score: 0.98
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 4868
    col: 0
    score: 0.98
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 2842
    col: 0
    score: 0.98
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 2095
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 4056
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 25889
    col: 0
    score: 0.97
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 2523
    col: 0
    score: 0.87
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 4984
    col: 0
    score: 0.87
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 12061
    col: 0
    score: 0.87
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 2631
    col: 0
    score: 0.87
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 2130
    col: 0
    score: 0.98
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 4451
    col: 0
    score: 0.97
  - uuid: c0392040-16a2-41e8-bd54-75110319e3c0
    line: 1360
    col: 0
    score: 0.97
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 2068
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 3100
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 3106
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 2477
    col: 0
    score: 0.97
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 2837
    col: 0
    score: 0.98
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 2497
    col: 0
    score: 0.98
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 1363
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 12675
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 20092
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 23205
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 19663
    col: 0
    score: 0.97
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 16695
    col: 0
    score: 0.97
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 10835
    col: 0
    score: 0.97
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 22004
    col: 0
    score: 0.97
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 10874
    col: 0
    score: 0.97
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 16678
    col: 0
    score: 0.96
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 21965
    col: 0
    score: 0.99
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 1407
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 4930
    col: 0
    score: 0.98
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 2536
    col: 0
    score: 0.98
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 3147
    col: 0
    score: 0.98
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 3819
    col: 0
    score: 0.98
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 3309
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 9123
    col: 0
    score: 0.98
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 3296
    col: 0
    score: 0.98
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 1518
    col: 0
    score: 0.98
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 4008
    col: 0
    score: 0.98
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 3983
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 3518
    col: 0
    score: 0.98
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 2770
    col: 0
    score: 0.97
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 1054
    col: 0
    score: 0.97
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 2145
    col: 0
    score: 0.96
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 7332
    col: 0
    score: 0.96
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 5506
    col: 0
    score: 0.96
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 5696
    col: 0
    score: 0.96
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 5400
    col: 0
    score: 0.96
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 6334
    col: 0
    score: 0.96
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 3383
    col: 0
    score: 0.96
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 3761
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 4031
    col: 0
    score: 1
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 2245
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 3553
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 9696
    col: 0
    score: 0.98
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 1977
    col: 0
    score: 0.98
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 1869
    col: 0
    score: 0.98
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 2460
    col: 0
    score: 0.98
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 3664
    col: 0
    score: 0.97
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 7036
    col: 0
    score: 0.97
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 5490
    col: 0
    score: 0.97
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 5770
    col: 0
    score: 0.97
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 608
    col: 0
    score: 0.96
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 631
    col: 0
    score: 0.96
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 804
    col: 0
    score: 0.96
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 859
    col: 0
    score: 0.96
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 2124
    col: 0
    score: 0.86
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 2857
    col: 0
    score: 0.86
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 3351
    col: 0
    score: 0.86
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 1873
    col: 0
    score: 0.86
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 3407
    col: 0
    score: 0.86
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 1834
    col: 0
    score: 0.86
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 5078
    col: 0
    score: 0.86
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3613
    col: 0
    score: 0.86
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 5902
    col: 0
    score: 0.86
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 1802
    col: 0
    score: 0.99
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 2329
    col: 0
    score: 0.98
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 1927
    col: 0
    score: 0.98
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 3227
    col: 0
    score: 0.98
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 3353
    col: 0
    score: 0.98
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 6381
    col: 0
    score: 0.98
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 4268
    col: 0
    score: 0.98
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 9927
    col: 0
    score: 0.99
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 2757
    col: 0
    score: 0.99
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 1749
    col: 0
    score: 0.99
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 1910
    col: 0
    score: 0.99
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 2479
    col: 0
    score: 0.99
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 2240
    col: 0
    score: 0.97
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 2007
    col: 0
    score: 0.97
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 2484
    col: 0
    score: 0.97
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 2669
    col: 0
    score: 0.97
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 2262
    col: 0
    score: 0.97
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 3050
    col: 0
    score: 0.97
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 11531
    col: 0
    score: 0.99
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 1752
    col: 0
    score: 0.99
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 1913
    col: 0
    score: 0.99
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 2481
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 11533
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 7764
    col: 0
    score: 0.98
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 1911
    col: 0
    score: 0.98
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 2806
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 9636
    col: 0
    score: 0.99
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 1374
    col: 0
    score: 0.99
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 1328
    col: 0
    score: 0.99
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 1748
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 1909
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 2755
    col: 0
    score: 0.99
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 2475
    col: 0
    score: 0.99
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 2481
    col: 0
    score: 0.96
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 1313
    col: 0
    score: 0.94
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 2754
    col: 0
    score: 0.94
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 3002
    col: 0
    score: 0.94
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 2546
    col: 0
    score: 0.94
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 1437
    col: 0
    score: 0.94
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 4831
    col: 0
    score: 0.94
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 2167
    col: 0
    score: 0.98
  - uuid: 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
    line: 1423
    col: 0
    score: 0.98
  - uuid: 9413237f-2537-4bbf-8768-db6180970e36
    line: 757
    col: 0
    score: 0.98
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 3122
    col: 0
    score: 0.98
  - uuid: c0392040-16a2-41e8-bd54-75110319e3c0
    line: 1448
    col: 0
    score: 0.98
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 1911
    col: 0
    score: 0.98
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 3971
    col: 0
    score: 0.98
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 5876
    col: 0
    score: 0.98
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 5464
    col: 0
    score: 0.98
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 1865
    col: 0
    score: 0.98
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 2354
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 4584
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 4579
    col: 0
    score: 0.98
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 1746
    col: 0
    score: 0.97
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 4590
    col: 0
    score: 0.97
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 6318
    col: 0
    score: 0.99
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 2954
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 8532
    col: 0
    score: 0.99
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 1230
    col: 0
    score: 0.97
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 4307
    col: 0
    score: 0.97
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 3737
    col: 0
    score: 0.97
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 3384
    col: 0
    score: 0.97
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 2767
    col: 0
    score: 0.97
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 3626
    col: 0
    score: 0.97
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 4646
    col: 0
    score: 0.97
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 1370
    col: 0
    score: 0.97
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 1624
    col: 0
    score: 0.97
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 1794
    col: 0
    score: 0.97
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 10308
    col: 0
    score: 0.97
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 4095
    col: 0
    score: 0.97
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 4978
    col: 0
    score: 0.97
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 3250
    col: 0
    score: 0.99
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 1671
    col: 0
    score: 0.99
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 4251
    col: 0
    score: 0.99
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 6535
    col: 0
    score: 0.99
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 5834
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 7766
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 5742
    col: 0
    score: 0.99
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 2963
    col: 0
    score: 0.99
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 4324
    col: 0
    score: 0.98
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 5531
    col: 0
    score: 0.98
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 2386
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 8144
    col: 0
    score: 0.98
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 1507
    col: 0
    score: 0.98
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 3354
    col: 0
    score: 0.98
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 6738
    col: 0
    score: 0.98
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 3521
    col: 0
    score: 0.98
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 4677
    col: 0
    score: 0.98
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 4845
    col: 0
    score: 0.98
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 2023
    col: 0
    score: 0.97
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 1656
    col: 0
    score: 0.97
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 1641
    col: 0
    score: 0.97
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 1841
    col: 0
    score: 0.97
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 1648
    col: 0
    score: 0.97
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 1640
    col: 0
    score: 0.97
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 5655
    col: 0
    score: 0.97
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 2722
    col: 0
    score: 0.97
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 2938
    col: 0
    score: 0.99
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 3240
    col: 0
    score: 0.99
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 3048
    col: 0
    score: 0.95
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 1595
    col: 0
    score: 0.95
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 5351
    col: 0
    score: 0.95
  - uuid: 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
    line: 862
    col: 0
    score: 0.95
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 3863
    col: 0
    score: 0.95
  - uuid: c0392040-16a2-41e8-bd54-75110319e3c0
    line: 879
    col: 0
    score: 0.95
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 1342
    col: 0
    score: 0.95
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 2293
    col: 0
    score: 0.95
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 6402
    col: 0
    score: 0.95
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 1515
    col: 0
    score: 0.95
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3784
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 18986
    col: 0
    score: 1
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 1259
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3786
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 5215
    col: 0
    score: 0.99
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 1260
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 3906
    col: 0
    score: 0.96
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 1721
    col: 0
    score: 0.96
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 1556
    col: 0
    score: 0.96
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 1362
    col: 0
    score: 0.96
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 1826
    col: 0
    score: 0.96
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 7932
    col: 0
    score: 0.96
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 5155
    col: 0
    score: 0.96
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 2569
    col: 0
    score: 0.96
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 4251
    col: 0
    score: 0.96
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 2967
    col: 0
    score: 0.96
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 3834
    col: 0
    score: 0.96
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 3463
    col: 0
    score: 0.96
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 3096
    col: 0
    score: 0.96
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 5009
    col: 0
    score: 0.99
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 6004
    col: 0
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 4945
    col: 0
    score: 0.99
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 3854
    col: 0
    score: 0.99
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 6022
    col: 0
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 4963
    col: 0
    score: 0.99
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 3872
    col: 0
    score: 0.99
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 6075
    col: 0
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 4788
    col: 0
    score: 0.99
  - uuid: f1add613-656e-4bec-b52b-193fd78c4642
    line: 1578
    col: 0
    score: 0.95
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 2867
    col: 0
    score: 0.95
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 2754
    col: 0
    score: 0.95
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 2250
    col: 0
    score: 0.95
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 3179
    col: 0
    score: 0.95
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 1698
    col: 0
    score: 0.95
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 4105
    col: 0
    score: 0.95
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 3575
    col: 0
    score: 0.95
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 7686
    col: 0
    score: 0.95
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 6476
    col: 0
    score: 0.99
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 4999
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 10329
    col: 0
    score: 0.99
  - uuid: 40185d05-010e-45e7-8c2d-2f879bf14218
    line: 1790
    col: 0
    score: 0.99
  - uuid: 5f65dfa5-dc97-4a6c-ad93-c45c1312e156
    line: 1823
    col: 0
    score: 0.99
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 4156
    col: 0
    score: 0.99
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 5837
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 6306
    col: 0
    score: 0.99
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 1350
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 7798
    col: 0
    score: 0.98
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 1945
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 7451
    col: 0
    score: 0.98
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 1238
    col: 0
    score: 0.97
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 3635
    col: 0
    score: 0.97
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 2160
    col: 0
    score: 0.97
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 8827
    col: 0
    score: 0.97
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 3417
    col: 0
    score: 0.97
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 9068
    col: 0
    score: 0.97
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 3900
    col: 0
    score: 0.97
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 9620
    col: 0
    score: 0.99
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 1358
    col: 0
    score: 0.99
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 1546
    col: 0
    score: 0.99
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 2699
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 1316
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 9668
    col: 0
    score: 0.98
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 1406
    col: 0
    score: 0.98
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 6712
    col: 0
    score: 0.97
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 3968
    col: 0
    score: 0.97
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 4085
    col: 0
    score: 0.97
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 5557
    col: 0
    score: 0.97
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 1333
    col: 0
    score: 0.99
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 4126
    col: 0
    score: 0.98
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 3681
    col: 0
    score: 0.98
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 1952
    col: 0
    score: 0.98
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 1902
    col: 0
    score: 0.98
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 2797
    col: 0
    score: 0.98
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 3521
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 9683
    col: 0
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 2003
    col: 0
    score: 0.99
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 1340
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 9648
    col: 0
    score: 0.99
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 3768
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 4135
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 9640
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 4127
    col: 0
    score: 0.99
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 4222
    col: 0
    score: 0.99
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 5052
    col: 0
    score: 0.99
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 1913
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 4020
    col: 0
    score: 0.98
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 4188
    col: 0
    score: 0.98
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 3376
    col: 0
    score: 0.98
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 2384
    col: 0
    score: 0.98
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2931
    col: 0
    score: 0.98
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 3634
    col: 0
    score: 0.98
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 4815
    col: 0
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 2498
    col: 0
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 2170
    col: 0
    score: 0.98
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 1853
    col: 0
    score: 0.97
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 2868
    col: 0
    score: 0.97
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 4232
    col: 0
    score: 0.96
  - uuid: ac9d3ac5-9a6a-4180-a67f-1ab7e229d981
    line: 1797
    col: 0
    score: 0.96
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 4041
    col: 0
    score: 0.97
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 1086
    col: 0
    score: 0.97
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 4070
    col: 0
    score: 0.97
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 3858
    col: 0
    score: 0.97
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 2084
    col: 0
    score: 0.97
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 1699
    col: 0
    score: 0.97
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 2181
    col: 0
    score: 0.97
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 5392
    col: 0
    score: 0.97
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 2489
    col: 0
    score: 0.97
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 1984
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 4574
    col: 0
    score: 0.98
  - uuid: c0392040-16a2-41e8-bd54-75110319e3c0
    line: 1336
    col: 0
    score: 0.98
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 3354
    col: 0
    score: 0.98
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 7037
    col: 0
    score: 0.98
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 2065
    col: 0
    score: 0.98
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 5796
    col: 0
    score: 0.98
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 5915
    col: 0
    score: 0.98
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 4449
    col: 0
    score: 0.98
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 6444
    col: 0
    score: 0.98
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 3257
    col: 0
    score: 0.98
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 2140
    col: 0
    score: 0.98
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 4839
    col: 0
    score: 0.98
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 4284
    col: 0
    score: 0.98
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 2557
    col: 0
    score: 0.98
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 6147
    col: 0
    score: 0.98
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 4873
    col: 0
    score: 0.98
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 4340
    col: 0
    score: 0.98
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 2059
    col: 0
    score: 0.98
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 4773
    col: 0
    score: 0.98
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 3978
    col: 0
    score: 0.93
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 2157
    col: 0
    score: 0.93
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 2819
    col: 0
    score: 0.93
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 2890
    col: 0
    score: 0.93
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 3375
    col: 0
    score: 0.93
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 1906
    col: 0
    score: 0.93
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 5935
    col: 0
    score: 0.93
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 1028
    col: 0
    score: 0.93
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 3991
    col: 0
    score: 0.93
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 3364
    col: 0
    score: 0.98
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 3295
    col: 0
    score: 0.98
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 4932
    col: 0
    score: 0.98
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 4001
    col: 0
    score: 0.98
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 3932
    col: 0
    score: 0.98
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 4528
    col: 0
    score: 0.98
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 4604
    col: 0
    score: 0.98
  - uuid: 86a691ec-ca1f-4350-824c-0ded1f8ebe70
    line: 1800
    col: 0
    score: 0.98
  - uuid: b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
    line: 1830
    col: 0
    score: 0.98
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 3673
    col: 0
    score: 0.96
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 5518
    col: 0
    score: 0.96
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 4918
    col: 0
    score: 0.96
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 3148
    col: 0
    score: 0.96
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 3205
    col: 0
    score: 0.96
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 4135
    col: 0
    score: 0.96
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 4969
    col: 0
    score: 0.96
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 4109
    col: 0
    score: 0.87
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 2412
    col: 0
    score: 0.94
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 3914
    col: 0
    score: 0.94
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 3925
    col: 0
    score: 0.97
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 2104
    col: 0
    score: 0.97
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 2766
    col: 0
    score: 0.97
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 2837
    col: 0
    score: 0.97
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 3331
    col: 0
    score: 0.97
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 1853
    col: 0
    score: 0.97
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 3387
    col: 0
    score: 0.97
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 1814
    col: 0
    score: 0.97
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 5058
    col: 0
    score: 0.97
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 3847
    col: 0
    score: 0.99
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 6247
    col: 0
    score: 0.97
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 767
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 1760
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 3003
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 17332
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 16630
    col: 0
    score: 0.99
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 3110
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 16651
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 1759
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 3002
    col: 0
    score: 0.99
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 2749
    col: 0
    score: 0.95
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 1920
    col: 0
    score: 0.95
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 12319
    col: 0
    score: 0.95
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 8488
    col: 0
    score: 0.95
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 2843
    col: 0
    score: 0.95
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 2400
    col: 0
    score: 0.95
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 765
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 3001
    col: 0
    score: 0.99
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 2056
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 15283
    col: 0
    score: 0.98
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 17988
    col: 0
    score: 0.98
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 2446
    col: 0
    score: 0.98
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 1786
    col: 0
    score: 0.98
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 766
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 1758
    col: 0
    score: 0.99
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 2240
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 1789
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 2639
    col: 0
    score: 0.98
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 5722
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 7097
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 7899
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 4761
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 5689
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 7780
    col: 0
    score: 1
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 5461
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 7098
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 7900
    col: 0
    score: 0.99
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 4762
    col: 0
    score: 0.99
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 5690
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 7781
    col: 0
    score: 0.99
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 5645
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 6959
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 6554
    col: 0
    score: 0.99
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 1781
    col: 0
    score: 0.98
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 887
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 7191
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 3374
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 10562
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 3927
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 7465
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 6749
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 5724
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 7099
    col: 0
    score: 0.99
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 4764
    col: 0
    score: 0.99
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 5692
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 7783
    col: 0
    score: 0.99
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 5464
    col: 0
    score: 0.99
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 5647
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 6961
    col: 0
    score: 0.99
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 1226
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 11391
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 7609
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 7992
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 6097
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 1743
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 7473
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6036
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 6573
    col: 0
    score: 1
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 1230
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 11384
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 7985
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 6090
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 6574
    col: 0
    score: 1
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 1231
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 8989
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 11622
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 10848
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 6719
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 6575
    col: 0
    score: 1
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 1232
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 11385
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 7987
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 6092
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 6576
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 11386
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 7604
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 6093
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 7469
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 6577
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 11387
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 7605
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 7988
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 7470
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 6578
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 11388
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 7606
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 7989
    col: 0
    score: 0.99
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 6094
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 7007
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 9238
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 8036
    col: 0
    score: 0.99
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 774
    col: 0
    score: 0.99
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 3010
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 3095
    col: 0
    score: 0.98
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 3251
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 1723
    col: 0
    score: 0.99
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 3701
    col: 0
    score: 0.99
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 2498
    col: 0
    score: 0.98
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 2101
    col: 0
    score: 0.98
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 2339
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 2541
    col: 0
    score: 0.98
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 2175
    col: 0
    score: 0.98
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 2554
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 3003
    col: 0
    score: 0.98
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 1637
    col: 0
    score: 0.98
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 2577
    col: 0
    score: 0.98
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 2286
    col: 0
    score: 0.98
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 3345
    col: 0
    score: 0.97
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 3252
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 1726
    col: 0
    score: 0.99
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 3702
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2147
    col: 0
    score: 0.98
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 1652
    col: 0
    score: 0.98
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 3227
    col: 0
    score: 0.98
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 1479
    col: 0
    score: 0.98
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 3246
    col: 0
    score: 0.99
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 3696
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 5401
    col: 0
    score: 0.98
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 3678
    col: 0
    score: 0.98
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3101
    col: 0
    score: 0.98
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 2435
    col: 0
    score: 0.98
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 3247
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 1727
    col: 0
    score: 0.99
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 3697
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 4360
    col: 0
    score: 0.98
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 4070
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2889
    col: 0
    score: 0.98
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 4510
    col: 0
    score: 0.97
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 1728
    col: 0
    score: 0.99
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 3695
    col: 0
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 1634
    col: 0
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 15794
    col: 0
    score: 0.98
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 2811
    col: 0
    score: 0.98
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 3163
    col: 0
    score: 0.98
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 3245
    col: 0
    score: 0.99
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 1729
    col: 0
    score: 0.99
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 3869
    col: 0
    score: 0.99
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 3579
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2776
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 5297
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 1911
    col: 0
    score: 0.99
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 1812
    col: 0
    score: 0.99
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 2843
    col: 0
    score: 0.99
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 2707
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 5389
    col: 0
    score: 0.99
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 4112
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 7229
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 6484
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 25550
    col: 0
    score: 0.99
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 2695
    col: 0
    score: 0.99
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2853
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6921
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 7455
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3783
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 5704
    col: 0
    score: 0.99
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 2795
    col: 0
    score: 0.99
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 2696
    col: 0
    score: 0.99
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2854
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6922
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3923
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3784
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 5705
    col: 0
    score: 0.99
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 2796
    col: 0
    score: 0.99
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 2697
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2855
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6923
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3924
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 7456
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 5706
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 2797
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 2698
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2856
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6924
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3925
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 7457
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3785
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 2798
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 2699
    col: 0
    score: 0.99
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2857
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6925
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3926
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 7458
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3786
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 5707
    col: 0
    score: 0.99
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 2700
    col: 0
    score: 0.99
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2858
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6926
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3927
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 7459
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3787
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 5708
    col: 0
    score: 0.99
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 2701
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2859
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 7460
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 2800
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 8198
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 4734
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 2333
    col: 0
    score: 0.99
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 1514
    col: 0
    score: 0.99
  - uuid: f1add613-656e-4bec-b52b-193fd78c4642
    line: 847
    col: 0
    score: 0.99
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 1214
    col: 0
    score: 0.99
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 2596
    col: 0
    score: 0.99
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 3059
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 2987
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 15277
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 4654
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 27608
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 10877
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 11592
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 24754
    col: 0
    score: 1
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 9953
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 11012
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 21906
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 21613
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 17491
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 16175
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 22986
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 11493
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 26037
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 15692
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 17489
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 7975
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 15270
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 13126
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 23097
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 17462
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 20531
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 11235
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 8311
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 6852
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 7381
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 1639
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 7905
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 8121
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 994
    col: 0
    score: 0.98
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 1254
    col: 0
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 5281
    col: 0
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 6004
    col: 0
    score: 0.98
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 15107
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 7973
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 17995
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 2127
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 1623
    col: 0
    score: 0.99
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 1693
    col: 0
    score: 0.99
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 3345
    col: 0
    score: 0.99
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 2342
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1956
    col: 0
    score: 0.98
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 2056
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 7986
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 7993
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 5585
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 2712
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2870
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6929
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3940
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 2057
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 2713
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2871
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6930
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3941
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 7471
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3801
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 5720
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 5586
    col: 0
    score: 0.99
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2872
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6931
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3942
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 7472
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3802
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 5721
    col: 0
    score: 0.99
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 2814
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 5587
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 2714
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6932
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3943
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 7473
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3803
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 5722
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 2815
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 5588
    col: 0
    score: 0.99
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 2715
    col: 0
    score: 0.99
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2873
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3944
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 7474
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3804
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 5723
    col: 0
    score: 0.99
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 2816
    col: 0
    score: 0.99
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 12002
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 16750
    col: 0
    score: 1
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 10323
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 11372
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 22859
    col: 0
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 19302
    col: 0
    score: 1
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 1213
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 4839
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 5590
    col: 0
    score: 0.99
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 2717
    col: 0
    score: 0.99
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2875
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6934
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3945
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3806
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 5725
    col: 0
    score: 0.99
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 2818
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 5591
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 2718
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2876
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6935
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3946
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 7476
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 5726
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 2819
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3563
    col: 0
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 1913
    col: 0
    score: 0.99
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 4052
    col: 0
    score: 0.99
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 4646
    col: 0
    score: 0.99
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 1983
    col: 0
    score: 0.99
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 5462
    col: 0
    score: 0.99
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 1944
    col: 0
    score: 0.99
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 5859
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 598
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 6603
    col: 0
    score: 0.99
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 1372
    col: 0
    score: 0.99
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 4493
    col: 0
    score: 0.99
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 4333
    col: 0
    score: 0.99
  - uuid: 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
    line: 1641
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 5593
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 2720
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2878
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6937
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3948
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 7478
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 18763
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 2721
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2879
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6938
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3949
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 7479
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3809
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 5594
    col: 0
    score: 0.99
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2880
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6939
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3950
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 7480
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3810
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 5729
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 5595
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 2722
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6940
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3951
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 7481
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3811
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 5730
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 5596
    col: 0
    score: 0.99
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 2723
    col: 0
    score: 0.99
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2881
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3952
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 7482
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3812
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 5731
    col: 0
    score: 0.99
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 24168
    col: 0
    score: 0.99
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 19479
    col: 0
    score: 0.99
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 13789
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 5597
    col: 0
    score: 0.99
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 2724
    col: 0
    score: 0.99
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2882
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6941
    col: 0
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 7483
    col: 0
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 5598
    col: 0
    score: 0.99
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 2725
    col: 0
    score: 0.99
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2883
    col: 0
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 6942
    col: 0
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3953
    col: 0
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3814
    col: 0
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 5733
    col: 0
    score: 0.99
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 3858
    col: 0
    score: 0.97
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 4689
    col: 0
    score: 0.97
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 4080
    col: 0
    score: 0.97
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 177
    col: 0
    score: 0.93
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 272
    col: 0
    score: 0.93
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 219
    col: 0
    score: 0.93
  - uuid: 91295f3a-a2af-4050-a2b8-4777ea70c32c
    line: 3577
    col: 0
    score: 0.93
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 243
    col: 0
    score: 0.93
  - uuid: c14edce7-0656-45b2-aaf3-51f042451b7d
    line: 388
    col: 0
    score: 0.89
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 3222
    col: 0
    score: 0.95
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 4353
    col: 0
    score: 0.95
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 3749
    col: 0
    score: 0.95
  - uuid: 86a691ec-ca1f-4350-824c-0ded1f8ebe70
    line: 1711
    col: 0
    score: 0.95
  - uuid: b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
    line: 1741
    col: 0
    score: 0.95
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 1828
    col: 0
    score: 0.95
  - uuid: 40185d05-010e-45e7-8c2d-2f879bf14218
    line: 1522
    col: 0
    score: 0.95
  - uuid: 5f65dfa5-dc97-4a6c-ad93-c45c1312e156
    line: 1469
    col: 0
    score: 0.95
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 5492
    col: 0
    score: 0.95
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
- [Operations](chunks/operations.md)
- [Shared](chunks/shared.md)
- [Window Management](chunks/window-management.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [graph-ds](graph-ds.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Tracing the Signal](tracing-the-signal.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [Diagrams](chunks/diagrams.md)
- [JavaScript](chunks/javascript.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Services](chunks/services.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Tooling](chunks/tooling.md)
- [Creative Moments](creative-moments.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [DSL](chunks/dsl.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [Promethean Chat Activity Report](promethean-chat-activity-report.md)
- [The Jar of Echoes](the-jar-of-echoes.md)
- [Promethean Dev Workflow Update](promethean-dev-workflow-update.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Pipeline Enhancements](pipeline-enhancements.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [Docops Feature Updates](docops-feature-updates-2.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [Promethean State Format](promethean-state-format.md)
- [NPU Voice Code and Sensory Integration](npu-voice-code-and-sensory-integration.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [Obsidian Task Generation](obsidian-task-generation.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [field-interaction-equations](field-interaction-equations.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [MindfulRobotIntegration](mindfulrobotintegration.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Docops Feature Updates](docops-feature-updates.md)
- [Ice Box Reorganization](ice-box-reorganization.md)
- [windows-tiling-with-autohotkey](windows-tiling-with-autohotkey.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [Reawakening Duck](reawakening-duck.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [Redirecting Standard Error](redirecting-standard-error.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [Promethean Notes](promethean-notes.md)
- [promethean-requirements](promethean-requirements.md)
- [unique-templates](templates/unique-templates.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [Unique Concepts](unique-concepts.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [Promethean Data Sync Protocol](promethean-data-sync-protocol.md)
- [Promethean Documentation Overview](promethean-documentation-overview.md)
- [Promethean Documentation Update](promethean-documentation-update.md)
- [Promethean Documentation Update](promethean-documentation-update.txt)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Smoke Resonance Visualizations](smoke-resonance-visualizations.md)
- [Synchronicity Waves and Web](synchronicity-waves-and-web.md)
- [Mindful Prioritization](mindful-prioritization.md)
- [OpenAPI Validation Report](openapi-validation-report.md)
- [Mathematical Samplers](mathematical-samplers.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Mathematics Sampler](mathematics-sampler.md)
- [Self-Improving Documentation Tool](self-improving-documentation-tool.md)
- [Fastify Static Files Plugin](fastify-static-files-plugin.md)
- [Git Commit Optimization for Code Reviews](git-commit-optimization-for-code-reviews.md)
- [run-step-api](run-step-api.md)
- [Promethean Documentation Update](promethean-documentation-update-4.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
## Sources
- [Diagrams — L28](chunks/diagrams.md#^ref-45cd25b5-28-0) (line 28, col 0, score 1)
- [JavaScript — L25](chunks/javascript.md#^ref-c1618c66-25-0) (line 25, col 0, score 1)
- [Math Fundamentals — L61](chunks/math-fundamentals.md#^ref-c6e87433-61-0) (line 61, col 0, score 1)
- [Operations — L18](chunks/operations.md#^ref-f1add613-18-0) (line 18, col 0, score 1)
- [Services — L21](chunks/services.md#^ref-75ea4a6a-21-0) (line 21, col 0, score 1)
- [Shared — L51](chunks/shared.md#^ref-623a55f7-51-0) (line 51, col 0, score 1)
- [Simulation Demo — L67](chunks/simulation-demo.md#^ref-557309a3-67-0) (line 67, col 0, score 1)
- [Tooling — L31](chunks/tooling.md#^ref-6cb4943e-31-0) (line 31, col 0, score 1)
- [Window Management — L17](chunks/window-management.md#^ref-9e8ae388-17-0) (line 17, col 0, score 1)
- [Creative Moments — L33](creative-moments.md#^ref-10d98225-33-0) (line 33, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L99](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-99-0) (line 99, col 0, score 1)
- [Docops Feature Updates — L46](docops-feature-updates.md#^ref-2792d448-46-0) (line 46, col 0, score 1)
- [DuckDuckGoSearchPipeline — L10](duckduckgosearchpipeline.md#^ref-e979c50f-10-0) (line 10, col 0, score 1)
- [field-node-diagram-visualizations — L4516](field-node-diagram-visualizations.md#^ref-e9b27b06-4516-0) (line 4516, col 0, score 0.99)
- [Fnord Tracer Protocol — L6833](fnord-tracer-protocol.md#^ref-fc21f824-6833-0) (line 6833, col 0, score 0.99)
- [Functional Embedding Pipeline Refactor — L3596](functional-embedding-pipeline-refactor.md#^ref-a4a25141-3596-0) (line 3596, col 0, score 0.99)
- [Functional Refactor of TypeScript Document Processing — L2846](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-2846-0) (line 2846, col 0, score 0.99)
- [graph-ds — L5671](graph-ds.md#^ref-6620e2f2-5671-0) (line 5671, col 0, score 0.99)
- [heartbeat-fragment-demo — L4921](heartbeat-fragment-demo.md#^ref-dd00677a-4921-0) (line 4921, col 0, score 0.99)
- [i3-bluetooth-setup — L5384](i3-bluetooth-setup.md#^ref-5e408692-5384-0) (line 5384, col 0, score 0.99)
- [Ice Box Reorganization — L4881](ice-box-reorganization.md#^ref-291c7d91-4881-0) (line 4881, col 0, score 0.99)
- [komorebi-group-window-hack — L4647](komorebi-group-window-hack.md#^ref-dd89372d-4647-0) (line 4647, col 0, score 0.99)
- [Layer1SurvivabilityEnvelope — L5410](layer1survivabilityenvelope.md#^ref-64a9f9f9-5410-0) (line 5410, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L6745](chroma-toolkit-consolidation-plan.md#^ref-5020e892-6745-0) (line 6745, col 0, score 0.98)
- [Diagrams — L126](chunks/diagrams.md#^ref-45cd25b5-126-0) (line 126, col 0, score 0.98)
- [DSL — L3997](chunks/dsl.md#^ref-e87bc036-3997-0) (line 3997, col 0, score 0.98)
- [JavaScript — L4337](chunks/javascript.md#^ref-c1618c66-4337-0) (line 4337, col 0, score 0.98)
- [Math Fundamentals — L3988](chunks/math-fundamentals.md#^ref-c6e87433-3988-0) (line 3988, col 0, score 0.98)
- [Operations — L1702](chunks/operations.md#^ref-f1add613-1702-0) (line 1702, col 0, score 0.98)
- [Services — L3766](chunks/services.md#^ref-75ea4a6a-3766-0) (line 3766, col 0, score 0.98)
- [Shared — L3283](chunks/shared.md#^ref-623a55f7-3283-0) (line 3283, col 0, score 0.98)
- [Simulation Demo — L3404](chunks/simulation-demo.md#^ref-557309a3-3404-0) (line 3404, col 0, score 0.98)
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
- [eidolon-node-lifecycle — L3943](eidolon-node-lifecycle.md#^ref-938eca9c-3943-0) (line 3943, col 0, score 0.96)
- [Factorio AI with External Agents — L4841](factorio-ai-with-external-agents.md#^ref-a4d90289-4841-0) (line 4841, col 0, score 0.96)
- [field-dynamics-math-blocks — L5983](field-dynamics-math-blocks.md#^ref-7cfc230d-5983-0) (line 5983, col 0, score 0.96)
- [field-interaction-equations — L6301](field-interaction-equations.md#^ref-b09141b7-6301-0) (line 6301, col 0, score 0.96)
- [field-node-diagram-outline — L4848](field-node-diagram-outline.md#^ref-1f32c94a-4848-0) (line 4848, col 0, score 0.96)
- [field-node-diagram-set — L4885](field-node-diagram-set.md#^ref-22b989d5-4885-0) (line 4885, col 0, score 0.96)
- [Fnord Tracer Protocol — L6723](fnord-tracer-protocol.md#^ref-fc21f824-6723-0) (line 6723, col 0, score 0.96)
- [Functional Embedding Pipeline Refactor — L3095](functional-embedding-pipeline-refactor.md#^ref-a4a25141-3095-0) (line 3095, col 0, score 0.96)
- [Functional Refactor of TypeScript Document Processing — L2333](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-2333-0) (line 2333, col 0, score 0.96)
- [Math Fundamentals — L619](chunks/math-fundamentals.md#^ref-c6e87433-619-0) (line 619, col 0, score 0.98)
- [Services — L600](chunks/services.md#^ref-75ea4a6a-600-0) (line 600, col 0, score 0.98)
- [Shared — L600](chunks/shared.md#^ref-623a55f7-600-0) (line 600, col 0, score 0.98)
- [Window Management — L741](chunks/window-management.md#^ref-9e8ae388-741-0) (line 741, col 0, score 0.98)
- [Creative Moments — L865](creative-moments.md#^ref-10d98225-865-0) (line 865, col 0, score 0.98)
- [Debugging Broker Connections and Agent Behavior — L701](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-701-0) (line 701, col 0, score 0.98)
- [Duck's Attractor States — L851](ducks-attractor-states.md#^ref-13951643-851-0) (line 851, col 0, score 0.98)
- [eidolon-field-math-foundations — L367](eidolon-field-math-foundations.md#^ref-008f2ac0-367-0) (line 367, col 0, score 0.98)
- [eidolon-node-lifecycle — L420](eidolon-node-lifecycle.md#^ref-938eca9c-420-0) (line 420, col 0, score 0.98)
- [Factorio AI with External Agents — L590](factorio-ai-with-external-agents.md#^ref-a4d90289-590-0) (line 590, col 0, score 0.98)
- [field-dynamics-math-blocks — L389](field-dynamics-math-blocks.md#^ref-7cfc230d-389-0) (line 389, col 0, score 0.98)
- [field-interaction-equations — L384](field-interaction-equations.md#^ref-b09141b7-384-0) (line 384, col 0, score 0.98)
- [field-node-diagram-outline — L440](field-node-diagram-outline.md#^ref-1f32c94a-440-0) (line 440, col 0, score 0.98)
- [field-node-diagram-set — L506](field-node-diagram-set.md#^ref-22b989d5-506-0) (line 506, col 0, score 0.98)
- [field-node-diagram-visualizations — L498](field-node-diagram-visualizations.md#^ref-e9b27b06-498-0) (line 498, col 0, score 0.98)
- [Fnord Tracer Protocol — L593](fnord-tracer-protocol.md#^ref-fc21f824-593-0) (line 593, col 0, score 0.98)
- [Functional Embedding Pipeline Refactor — L582](functional-embedding-pipeline-refactor.md#^ref-a4a25141-582-0) (line 582, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L1170](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-1170-0) (line 1170, col 0, score 0.98)
- [zero-copy-snapshots-and-workers — L1056](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-1056-0) (line 1056, col 0, score 0.98)
- [zero-copy-snapshots-and-workers — L2022](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-2022-0) (line 2022, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L3026](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-3026-0) (line 3026, col 0, score 0.98)
- [TypeScript Patch for Tool Calling Support — L899](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-899-0) (line 899, col 0, score 0.97)
- [Unique Concepts — L1709](unique-concepts.md#^ref-ed6f3fc9-1709-0) (line 1709, col 0, score 0.97)
- [Unique Info Dump Index — L1227](unique-info-dump-index.md#^ref-30ec3ba6-1227-0) (line 1227, col 0, score 0.97)
- [windows-tiling-with-autohotkey — L1253](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-1253-0) (line 1253, col 0, score 0.97)
- [zero-copy-snapshots-and-workers — L1174](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-1174-0) (line 1174, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L1011](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-1011-0) (line 1011, col 0, score 0.98)
- [zero-copy-snapshots-and-workers — L757](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-757-0) (line 757, col 0, score 0.98)
- [eidolon-field-math-foundations — L959](eidolon-field-math-foundations.md#^ref-008f2ac0-959-0) (line 959, col 0, score 0.96)
- [eidolon-node-lifecycle — L868](eidolon-node-lifecycle.md#^ref-938eca9c-868-0) (line 868, col 0, score 0.96)
- [Factorio AI with External Agents — L1000](factorio-ai-with-external-agents.md#^ref-a4d90289-1000-0) (line 1000, col 0, score 0.96)
- [field-dynamics-math-blocks — L1187](field-dynamics-math-blocks.md#^ref-7cfc230d-1187-0) (line 1187, col 0, score 0.96)
- [field-interaction-equations — L1282](field-interaction-equations.md#^ref-b09141b7-1282-0) (line 1282, col 0, score 0.96)
- [field-node-diagram-outline — L1130](field-node-diagram-outline.md#^ref-1f32c94a-1130-0) (line 1130, col 0, score 0.96)
- [field-node-diagram-set — L1046](field-node-diagram-set.md#^ref-22b989d5-1046-0) (line 1046, col 0, score 0.96)
- [field-node-diagram-visualizations — L1038](field-node-diagram-visualizations.md#^ref-e9b27b06-1038-0) (line 1038, col 0, score 0.96)
- [Fnord Tracer Protocol — L1246](fnord-tracer-protocol.md#^ref-fc21f824-1246-0) (line 1246, col 0, score 0.96)
- [graph-ds — L1506](graph-ds.md#^ref-6620e2f2-1506-0) (line 1506, col 0, score 0.98)
- [heartbeat-fragment-demo — L1142](heartbeat-fragment-demo.md#^ref-dd00677a-1142-0) (line 1142, col 0, score 0.98)
- [homeostasis-decay-formulas — L1256](homeostasis-decay-formulas.md#^ref-37b5d236-1256-0) (line 1256, col 0, score 0.98)
- [i3-bluetooth-setup — L626](i3-bluetooth-setup.md#^ref-5e408692-626-0) (line 626, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L284](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-284-0) (line 284, col 0, score 0.98)
- [zero-copy-snapshots-and-workers — L1507](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-1507-0) (line 1507, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L594](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-594-0) (line 594, col 0, score 0.98)
- [zero-copy-snapshots-and-workers — L969](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-969-0) (line 969, col 0, score 0.98)
- [zero-copy-snapshots-and-workers — L691](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-691-0) (line 691, col 0, score 1)
- [komorebi-group-window-hack — L1796](komorebi-group-window-hack.md#^ref-dd89372d-1796-0) (line 1796, col 0, score 0.97)
- [komorebi-group-window-hack — L2017](komorebi-group-window-hack.md#^ref-dd89372d-2017-0) (line 2017, col 0, score 0.97)
- [zero-copy-snapshots-and-workers — L1936](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-1936-0) (line 1936, col 0, score 0.96)
- [zero-copy-snapshots-and-workers — L2202](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-2202-0) (line 2202, col 0, score 0.96)
- [Unique Info Dump Index — L6662](unique-info-dump-index.md#^ref-30ec3ba6-6662-0) (line 6662, col 0, score 0.94)
- [heartbeat-fragment-demo — L1420](heartbeat-fragment-demo.md#^ref-dd00677a-1420-0) (line 1420, col 0, score 0.94)
- [eidolon-field-math-foundations — L24596](eidolon-field-math-foundations.md#^ref-008f2ac0-24596-0) (line 24596, col 0, score 0.94)
- [Promethean Dev Workflow Update — L22800](promethean-dev-workflow-update.md#^ref-03a5578f-22800-0) (line 22800, col 0, score 0.94)
- [windows-tiling-with-autohotkey — L22798](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-22798-0) (line 22798, col 0, score 0.94)
- [homeostasis-decay-formulas — L6526](homeostasis-decay-formulas.md#^ref-37b5d236-6526-0) (line 6526, col 0, score 0.96)
- [i3-bluetooth-setup — L3712](i3-bluetooth-setup.md#^ref-5e408692-3712-0) (line 3712, col 0, score 0.96)
- [komorebi-group-window-hack — L3075](komorebi-group-window-hack.md#^ref-dd89372d-3075-0) (line 3075, col 0, score 0.96)
- [Layer1SurvivabilityEnvelope — L4096](layer1survivabilityenvelope.md#^ref-64a9f9f9-4096-0) (line 4096, col 0, score 0.96)
- [Migrate to Provider-Tenant Architecture — L7335](migrate-to-provider-tenant-architecture.md#^ref-54382370-7335-0) (line 7335, col 0, score 0.96)
- [Mindful Prioritization — L1003](mindful-prioritization.md#^ref-40185d05-1003-0) (line 1003, col 0, score 0.96)
- [MindfulRobotIntegration — L1028](mindfulrobotintegration.md#^ref-5f65dfa5-1028-0) (line 1028, col 0, score 0.96)
- [Model Selection for Lightweight Conversational Tasks — L4902](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-4902-0) (line 4902, col 0, score 0.96)
- [Model Upgrade Calm-Down Guide — L3435](model-upgrade-calm-down-guide.md#^ref-db74343f-3435-0) (line 3435, col 0, score 0.96)
- [Mathematics Sampler — L1736](mathematics-sampler.md#^ref-b5e0183e-1736-0) (line 1736, col 0, score 0.87)
- [Migrate to Provider-Tenant Architecture — L7748](migrate-to-provider-tenant-architecture.md#^ref-54382370-7748-0) (line 7748, col 0, score 0.87)
- [Obsidian ChatGPT Plugin Integration — L3847](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-3847-0) (line 3847, col 0, score 0.87)
- [obsidian-ignore-node-modules-regex — L4433](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-4433-0) (line 4433, col 0, score 0.87)
- [Obsidian Task Generation — L1688](obsidian-task-generation.md#^ref-9b694a91-1688-0) (line 1688, col 0, score 0.87)
- [Obsidian Templating Plugins Integration Guide — L5168](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-5168-0) (line 5168, col 0, score 0.87)
- [OpenAPI Validation Report — L1563](openapi-validation-report.md#^ref-5c152b08-1563-0) (line 1563, col 0, score 0.87)
- [ParticleSimulationWithCanvasAndFFmpeg — L3400](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-3400-0) (line 3400, col 0, score 0.87)
- [Per-Domain Policy System for JS Crawler — L5381](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-5381-0) (line 5381, col 0, score 0.87)
- [windows-tiling-with-autohotkey — L7938](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-7938-0) (line 7938, col 0, score 0.94)
- [i3-bluetooth-setup — L1021](i3-bluetooth-setup.md#^ref-5e408692-1021-0) (line 1021, col 0, score 0.87)
- [Ice Box Reorganization — L257](ice-box-reorganization.md#^ref-291c7d91-257-0) (line 257, col 0, score 0.87)
- [Unique Info Dump Index — L242](unique-info-dump-index.md#^ref-30ec3ba6-242-0) (line 242, col 0, score 0.9)
- [Prompt_Folder_Bootstrap — L628](prompt-folder-bootstrap.md#^ref-bd4f0976-628-0) (line 628, col 0, score 0.88)
- [Protocol_0_The_Contradiction_Engine — L649](protocol-0-the-contradiction-engine.md#^ref-9a93a756-649-0) (line 649, col 0, score 0.88)
- [Pure TypeScript Search Microservice — L1216](pure-typescript-search-microservice.md#^ref-d17d3a96-1216-0) (line 1216, col 0, score 0.88)
- [Reawakening Duck — L389](reawakening-duck.md#^ref-59b5670f-389-0) (line 389, col 0, score 0.88)
- [Redirecting Standard Error — L567](redirecting-standard-error.md#^ref-b3555ede-567-0) (line 567, col 0, score 0.88)
- [ripple-propagation-demo — L276](ripple-propagation-demo.md#^ref-8430617b-276-0) (line 276, col 0, score 0.88)
- [schema-evolution-workflow — L1282](schema-evolution-workflow.md#^ref-d8059b6a-1282-0) (line 1282, col 0, score 0.88)
- [Self-Agency in AI Interaction — L584](self-agency-in-ai-interaction.md#^ref-49a9a860-584-0) (line 584, col 0, score 0.88)
- [Tooling — L1086](chunks/tooling.md#^ref-6cb4943e-1086-0) (line 1086, col 0, score 0.99)
- [Debugging Broker Connections and Agent Behavior — L1227](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-1227-0) (line 1227, col 0, score 0.99)
- [Docops Feature Updates — L334](docops-feature-updates.md#^ref-2792d448-334-0) (line 334, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L1651](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1651-0) (line 1651, col 0, score 0.99)
- [eidolon-node-lifecycle — L996](eidolon-node-lifecycle.md#^ref-938eca9c-996-0) (line 996, col 0, score 0.99)
- [Factorio AI with External Agents — L1052](factorio-ai-with-external-agents.md#^ref-a4d90289-1052-0) (line 1052, col 0, score 0.99)
- [field-interaction-equations — L1315](field-interaction-equations.md#^ref-b09141b7-1315-0) (line 1315, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L5432](chroma-toolkit-consolidation-plan.md#^ref-5020e892-5432-0) (line 5432, col 0, score 0.95)
- [Duck's Self-Referential Perceptual Loop — L2406](ducks-self-referential-perceptual-loop.md#^ref-71726f04-2406-0) (line 2406, col 0, score 0.95)
- [field-interaction-equations — L5858](field-interaction-equations.md#^ref-b09141b7-5858-0) (line 5858, col 0, score 0.95)
- [Dynamic Context Model for Web Components — L4673](dynamic-context-model-for-web-components.md#^ref-f7702bf8-4673-0) (line 4673, col 0, score 0.99)
- [Promethean Workflow Optimization — L1170](promethean-workflow-optimization.md#^ref-d614d983-1170-0) (line 1170, col 0, score 0.99)
- [Redirecting Standard Error — L1216](redirecting-standard-error.md#^ref-b3555ede-1216-0) (line 1216, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L4078](migrate-to-provider-tenant-architecture.md#^ref-54382370-4078-0) (line 4078, col 0, score 0.98)
- [Model Upgrade Calm-Down Guide — L2394](model-upgrade-calm-down-guide.md#^ref-db74343f-2394-0) (line 2394, col 0, score 0.98)
- [Promethean Pipelines — L3457](promethean-pipelines.md#^ref-8b8e6103-3457-0) (line 3457, col 0, score 0.98)
- [zero-copy-snapshots-and-workers — L1516](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-1516-0) (line 1516, col 0, score 0.98)
- [unique-templates — L770](templates/unique-templates.md#^ref-c26f0044-770-0) (line 770, col 0, score 0.97)
- [The Jar of Echoes — L987](the-jar-of-echoes.md#^ref-18138627-987-0) (line 987, col 0, score 0.97)
- [Duck's Self-Referential Perceptual Loop — L262](ducks-self-referential-perceptual-loop.md#^ref-71726f04-262-0) (line 262, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L981](dynamic-context-model-for-web-components.md#^ref-f7702bf8-981-0) (line 981, col 0, score 0.99)
- [Eidolon Field Abstract Model — L870](eidolon-field-abstract-model.md#^ref-5e8b2388-870-0) (line 870, col 0, score 0.99)
- [eidolon-field-math-foundations — L951](eidolon-field-math-foundations.md#^ref-008f2ac0-951-0) (line 951, col 0, score 0.99)
- [eidolon-node-lifecycle — L762](eidolon-node-lifecycle.md#^ref-938eca9c-762-0) (line 762, col 0, score 0.99)
- [Factorio AI with External Agents — L364](factorio-ai-with-external-agents.md#^ref-a4d90289-364-0) (line 364, col 0, score 0.99)
- [field-dynamics-math-blocks — L902](field-dynamics-math-blocks.md#^ref-7cfc230d-902-0) (line 902, col 0, score 0.99)
- [field-interaction-equations — L956](field-interaction-equations.md#^ref-b09141b7-956-0) (line 956, col 0, score 0.99)
- [field-node-diagram-outline — L919](field-node-diagram-outline.md#^ref-1f32c94a-919-0) (line 919, col 0, score 0.99)
- [field-node-diagram-set — L824](field-node-diagram-set.md#^ref-22b989d5-824-0) (line 824, col 0, score 0.99)
- [Functional Refactor of TypeScript Document Processing — L2242](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-2242-0) (line 2242, col 0, score 0.97)
- [graph-ds — L3757](graph-ds.md#^ref-6620e2f2-3757-0) (line 3757, col 0, score 0.97)
- [heartbeat-fragment-demo — L3479](heartbeat-fragment-demo.md#^ref-dd00677a-3479-0) (line 3479, col 0, score 0.97)
- [homeostasis-decay-formulas — L5594](homeostasis-decay-formulas.md#^ref-37b5d236-5594-0) (line 5594, col 0, score 0.97)
- [i3-bluetooth-setup — L2012](i3-bluetooth-setup.md#^ref-5e408692-2012-0) (line 2012, col 0, score 0.97)
- [Ice Box Reorganization — L3225](ice-box-reorganization.md#^ref-291c7d91-3225-0) (line 3225, col 0, score 0.97)
- [komorebi-group-window-hack — L4356](komorebi-group-window-hack.md#^ref-dd89372d-4356-0) (line 4356, col 0, score 0.97)
- [Layer1SurvivabilityEnvelope — L3752](layer1survivabilityenvelope.md#^ref-64a9f9f9-3752-0) (line 3752, col 0, score 0.97)
- [Mathematical Samplers — L1714](mathematical-samplers.md#^ref-86a691ec-1714-0) (line 1714, col 0, score 0.97)
- [Synchronicity Waves and Web — L2287](synchronicity-waves-and-web.md#^ref-91295f3a-2287-0) (line 2287, col 0, score 0.98)
- [ts-to-lisp-transpiler — L2339](ts-to-lisp-transpiler.md#^ref-ba11486b-2339-0) (line 2339, col 0, score 0.98)
- [typed-struct-compiler — L3549](typed-struct-compiler.md#^ref-78eeedf7-3549-0) (line 3549, col 0, score 0.98)
- [TypeScript Patch for Tool Calling Support — L6142](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-6142-0) (line 6142, col 0, score 0.98)
- [Unique Info Dump Index — L3887](unique-info-dump-index.md#^ref-30ec3ba6-3887-0) (line 3887, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L4648](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-4648-0) (line 4648, col 0, score 0.98)
- [field-interaction-equations — L1299](field-interaction-equations.md#^ref-b09141b7-1299-0) (line 1299, col 0, score 0.96)
- [field-node-diagram-outline — L1147](field-node-diagram-outline.md#^ref-1f32c94a-1147-0) (line 1147, col 0, score 0.96)
- [field-node-diagram-set — L1063](field-node-diagram-set.md#^ref-22b989d5-1063-0) (line 1063, col 0, score 0.96)
- [field-node-diagram-visualizations — L1055](field-node-diagram-visualizations.md#^ref-e9b27b06-1055-0) (line 1055, col 0, score 0.96)
- [Fnord Tracer Protocol — L1263](fnord-tracer-protocol.md#^ref-fc21f824-1263-0) (line 1263, col 0, score 0.96)
- [Functional Embedding Pipeline Refactor — L880](functional-embedding-pipeline-refactor.md#^ref-a4a25141-880-0) (line 880, col 0, score 0.96)
- [Functional Refactor of TypeScript Document Processing — L696](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-696-0) (line 696, col 0, score 0.96)
- [graph-ds — L1546](graph-ds.md#^ref-6620e2f2-1546-0) (line 1546, col 0, score 0.96)
- [heartbeat-fragment-demo — L1209](heartbeat-fragment-demo.md#^ref-dd00677a-1209-0) (line 1209, col 0, score 0.96)
- [Obsidian Templating Plugins Integration Guide — L4713](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-4713-0) (line 4713, col 0, score 0.9)
- [OpenAPI Validation Report — L1256](openapi-validation-report.md#^ref-5c152b08-1256-0) (line 1256, col 0, score 0.9)
- [plan-update-confirmation — L8974](plan-update-confirmation.md#^ref-b22d79c6-8974-0) (line 8974, col 0, score 0.9)
- [Promethean Notes — L882](promethean-notes.md#^ref-1c4046b5-882-0) (line 882, col 0, score 0.98)
- [Promethean Pipelines — L1393](promethean-pipelines.md#^ref-8b8e6103-1393-0) (line 1393, col 0, score 0.98)
- [Promethean State Format — L1151](promethean-state-format.md#^ref-23df6ddb-1151-0) (line 1151, col 0, score 0.98)
- [Prometheus Observability Stack — L1363](prometheus-observability-stack.md#^ref-e90b5a16-1363-0) (line 1363, col 0, score 0.98)
- [field-node-diagram-outline — L585](field-node-diagram-outline.md#^ref-1f32c94a-585-0) (line 585, col 0, score 0.95)
- [field-node-diagram-set — L512](field-node-diagram-set.md#^ref-22b989d5-512-0) (line 512, col 0, score 0.95)
- [Fnord Tracer Protocol — L765](fnord-tracer-protocol.md#^ref-fc21f824-765-0) (line 765, col 0, score 0.95)
- [Functional Embedding Pipeline Refactor — L588](functional-embedding-pipeline-refactor.md#^ref-a4a25141-588-0) (line 588, col 0, score 0.95)
- [Functional Refactor of TypeScript Document Processing — L511](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-511-0) (line 511, col 0, score 0.95)
- [graph-ds — L921](graph-ds.md#^ref-6620e2f2-921-0) (line 921, col 0, score 0.95)
- [heartbeat-fragment-demo — L600](heartbeat-fragment-demo.md#^ref-dd00677a-600-0) (line 600, col 0, score 0.95)
- [field-node-diagram-set — L327](field-node-diagram-set.md#^ref-22b989d5-327-0) (line 327, col 0, score 0.96)
- [field-node-diagram-visualizations — L311](field-node-diagram-visualizations.md#^ref-e9b27b06-311-0) (line 311, col 0, score 0.96)
- [Fnord Tracer Protocol — L1286](fnord-tracer-protocol.md#^ref-fc21f824-1286-0) (line 1286, col 0, score 0.96)
- [Functional Embedding Pipeline Refactor — L987](functional-embedding-pipeline-refactor.md#^ref-a4a25141-987-0) (line 987, col 0, score 0.96)
- [Functional Refactor of TypeScript Document Processing — L764](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-764-0) (line 764, col 0, score 0.96)
- [graph-ds — L1487](graph-ds.md#^ref-6620e2f2-1487-0) (line 1487, col 0, score 0.96)
- [heartbeat-fragment-demo — L278](heartbeat-fragment-demo.md#^ref-dd00677a-278-0) (line 278, col 0, score 0.96)
- [homeostasis-decay-formulas — L584](homeostasis-decay-formulas.md#^ref-37b5d236-584-0) (line 584, col 0, score 0.96)
- [i3-bluetooth-setup — L1201](i3-bluetooth-setup.md#^ref-5e408692-1201-0) (line 1201, col 0, score 0.96)
- [Ice Box Reorganization — L795](ice-box-reorganization.md#^ref-291c7d91-795-0) (line 795, col 0, score 0.96)
- [Model Upgrade Calm-Down Guide — L840](model-upgrade-calm-down-guide.md#^ref-db74343f-840-0) (line 840, col 0, score 0.99)
- [NPU Voice Code and Sensory Integration — L763](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-763-0) (line 763, col 0, score 0.99)
- [obsidian-ignore-node-modules-regex — L1214](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-1214-0) (line 1214, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L985](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-985-0) (line 985, col 0, score 0.98)
- [zero-copy-snapshots-and-workers — L780](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-780-0) (line 780, col 0, score 0.98)
- [zero-copy-snapshots-and-workers — L734](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-734-0) (line 734, col 0, score 0.98)
- [Promethean Documentation Overview — L580](promethean-documentation-overview.md#^ref-9413237f-580-0) (line 580, col 0, score 0.96)
- [Promethean Documentation Pipeline Overview — L1613](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-1613-0) (line 1613, col 0, score 0.96)
- [Promethean Documentation Update — L1271](promethean-documentation-update.md#^ref-c0392040-1271-0) (line 1271, col 0, score 0.96)
- [Promethean_Eidolon_Synchronicity_Model — L3291](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-3291-0) (line 3291, col 0, score 0.96)
- [Promethean Infrastructure Setup — L6974](promethean-infrastructure-setup.md#^ref-6deed6ac-6974-0) (line 6974, col 0, score 0.96)
- [Promethean Pipelines — L4005](promethean-pipelines.md#^ref-8b8e6103-4005-0) (line 4005, col 0, score 0.96)
- [promethean-requirements — L1645](promethean-requirements.md#^ref-95205cd3-1645-0) (line 1645, col 0, score 0.96)
- [Promethean State Format — L3813](promethean-state-format.md#^ref-23df6ddb-3813-0) (line 3813, col 0, score 0.96)
- [Prometheus Observability Stack — L5781](prometheus-observability-stack.md#^ref-e90b5a16-5781-0) (line 5781, col 0, score 0.96)
- [Prompt_Folder_Bootstrap — L5891](prompt-folder-bootstrap.md#^ref-bd4f0976-5891-0) (line 5891, col 0, score 0.96)
- [heartbeat-fragment-demo — L3096](heartbeat-fragment-demo.md#^ref-dd00677a-3096-0) (line 3096, col 0, score 0.98)
- [homeostasis-decay-formulas — L4355](homeostasis-decay-formulas.md#^ref-37b5d236-4355-0) (line 4355, col 0, score 0.98)
- [i3-bluetooth-setup — L4818](i3-bluetooth-setup.md#^ref-5e408692-4818-0) (line 4818, col 0, score 0.98)
- [Ice Box Reorganization — L4548](ice-box-reorganization.md#^ref-291c7d91-4548-0) (line 4548, col 0, score 0.98)
- [komorebi-group-window-hack — L3722](komorebi-group-window-hack.md#^ref-dd89372d-3722-0) (line 3722, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L8343](migrate-to-provider-tenant-architecture.md#^ref-54382370-8343-0) (line 8343, col 0, score 0.98)
- [Unique Info Dump Index — L2432](unique-info-dump-index.md#^ref-30ec3ba6-2432-0) (line 2432, col 0, score 0.97)
- [heartbeat-fragment-demo — L1321](heartbeat-fragment-demo.md#^ref-dd00677a-1321-0) (line 1321, col 0, score 0.97)
- [homeostasis-decay-formulas — L1392](homeostasis-decay-formulas.md#^ref-37b5d236-1392-0) (line 1392, col 0, score 0.97)
- [i3-bluetooth-setup — L1287](i3-bluetooth-setup.md#^ref-5e408692-1287-0) (line 1287, col 0, score 0.97)
- [Ice Box Reorganization — L1090](ice-box-reorganization.md#^ref-291c7d91-1090-0) (line 1090, col 0, score 0.97)
- [komorebi-group-window-hack — L1393](komorebi-group-window-hack.md#^ref-dd89372d-1393-0) (line 1393, col 0, score 0.97)
- [Layer1SurvivabilityEnvelope — L1177](layer1survivabilityenvelope.md#^ref-64a9f9f9-1177-0) (line 1177, col 0, score 0.97)
- [Mathematical Samplers — L592](mathematical-samplers.md#^ref-86a691ec-592-0) (line 592, col 0, score 0.97)
- [Mathematics Sampler — L587](mathematics-sampler.md#^ref-b5e0183e-587-0) (line 587, col 0, score 0.97)
- [Migrate to Provider-Tenant Architecture — L1655](migrate-to-provider-tenant-architecture.md#^ref-54382370-1655-0) (line 1655, col 0, score 0.97)
- [Prompt_Folder_Bootstrap — L1213](prompt-folder-bootstrap.md#^ref-bd4f0976-1213-0) (line 1213, col 0, score 0.97)
- [Protocol_0_The_Contradiction_Engine — L1158](protocol-0-the-contradiction-engine.md#^ref-9a93a756-1158-0) (line 1158, col 0, score 0.97)
- [Provider-Agnostic Chat Panel Implementation — L1317](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-1317-0) (line 1317, col 0, score 0.97)
- [Pure TypeScript Search Microservice — L1719](pure-typescript-search-microservice.md#^ref-d17d3a96-1719-0) (line 1719, col 0, score 0.97)
- [Reawakening Duck — L1168](reawakening-duck.md#^ref-59b5670f-1168-0) (line 1168, col 0, score 0.97)
- [Redirecting Standard Error — L766](redirecting-standard-error.md#^ref-b3555ede-766-0) (line 766, col 0, score 0.97)
- [schema-evolution-workflow — L1605](schema-evolution-workflow.md#^ref-d8059b6a-1605-0) (line 1605, col 0, score 0.97)
- [zero-copy-snapshots-and-workers — L1576](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-1576-0) (line 1576, col 0, score 0.98)
- [Mathematical Samplers — L1804](mathematical-samplers.md#^ref-86a691ec-1804-0) (line 1804, col 0, score 0.96)
- [Mathematics Sampler — L1835](mathematics-sampler.md#^ref-b5e0183e-1835-0) (line 1835, col 0, score 0.96)
- [Obsidian ChatGPT Plugin Integration — L1047](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-1047-0) (line 1047, col 0, score 0.95)
- [obsidian-ignore-node-modules-regex — L1216](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-1216-0) (line 1216, col 0, score 0.95)
- [Obsidian Task Generation — L737](obsidian-task-generation.md#^ref-9b694a91-737-0) (line 737, col 0, score 0.95)
- [OpenAPI Validation Report — L738](openapi-validation-report.md#^ref-5c152b08-738-0) (line 738, col 0, score 0.95)
- [ParticleSimulationWithCanvasAndFFmpeg — L1475](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-1475-0) (line 1475, col 0, score 0.95)
- [Promethean Infrastructure Setup — L3460](promethean-infrastructure-setup.md#^ref-6deed6ac-3460-0) (line 3460, col 0, score 0.97)
- [typed-struct-compiler — L2270](typed-struct-compiler.md#^ref-78eeedf7-2270-0) (line 2270, col 0, score 0.97)
- [Promethean Dev Workflow Update — L1850](promethean-dev-workflow-update.md#^ref-03a5578f-1850-0) (line 1850, col 0, score 0.97)
- [Self-Agency in AI Interaction — L2386](self-agency-in-ai-interaction.md#^ref-49a9a860-2386-0) (line 2386, col 0, score 0.97)
- [The Jar of Echoes — L2455](the-jar-of-echoes.md#^ref-18138627-2455-0) (line 2455, col 0, score 0.97)
- [windows-tiling-with-autohotkey — L2835](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2835-0) (line 2835, col 0, score 0.97)
- [zero-copy-snapshots-and-workers — L2738](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-2738-0) (line 2738, col 0, score 0.97)
- [Fnord Tracer Protocol — L4503](fnord-tracer-protocol.md#^ref-fc21f824-4503-0) (line 4503, col 0, score 0.97)
- [Per-Domain Policy System for JS Crawler — L2368](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-2368-0) (line 2368, col 0, score 0.97)
- [heartbeat-fragment-demo — L4029](heartbeat-fragment-demo.md#^ref-dd00677a-4029-0) (line 4029, col 0, score 0.97)
- [homeostasis-decay-formulas — L6026](homeostasis-decay-formulas.md#^ref-37b5d236-6026-0) (line 6026, col 0, score 0.97)
- [i3-bluetooth-setup — L4287](i3-bluetooth-setup.md#^ref-5e408692-4287-0) (line 4287, col 0, score 0.97)
- [Ice Box Reorganization — L4296](ice-box-reorganization.md#^ref-291c7d91-4296-0) (line 4296, col 0, score 0.97)
- [komorebi-group-window-hack — L3969](komorebi-group-window-hack.md#^ref-dd89372d-3969-0) (line 3969, col 0, score 0.97)
- [Layer1SurvivabilityEnvelope — L5113](layer1survivabilityenvelope.md#^ref-64a9f9f9-5113-0) (line 5113, col 0, score 0.97)
- [Migrate to Provider-Tenant Architecture — L7147](migrate-to-provider-tenant-architecture.md#^ref-54382370-7147-0) (line 7147, col 0, score 0.97)
- [Pure TypeScript Search Microservice — L2385](pure-typescript-search-microservice.md#^ref-d17d3a96-2385-0) (line 2385, col 0, score 0.98)
- [Functional Embedding Pipeline Refactor — L699](functional-embedding-pipeline-refactor.md#^ref-a4a25141-699-0) (line 699, col 0, score 0.98)
- [graph-ds — L932](graph-ds.md#^ref-6620e2f2-932-0) (line 932, col 0, score 0.98)
- [i3-bluetooth-setup — L621](i3-bluetooth-setup.md#^ref-5e408692-621-0) (line 621, col 0, score 0.98)
- [Mathematics Sampler — L632](mathematics-sampler.md#^ref-b5e0183e-632-0) (line 632, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L941](migrate-to-provider-tenant-architecture.md#^ref-54382370-941-0) (line 941, col 0, score 0.98)
- [Duck's Attractor States — L6737](ducks-attractor-states.md#^ref-13951643-6737-0) (line 6737, col 0, score 0.98)
- [eidolon-field-math-foundations — L8420](eidolon-field-math-foundations.md#^ref-008f2ac0-8420-0) (line 8420, col 0, score 0.98)
- [graph-ds — L1476](graph-ds.md#^ref-6620e2f2-1476-0) (line 1476, col 0, score 0.98)
- [homeostasis-decay-formulas — L1356](homeostasis-decay-formulas.md#^ref-37b5d236-1356-0) (line 1356, col 0, score 0.98)
- [Model Selection for Lightweight Conversational Tasks — L1429](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-1429-0) (line 1429, col 0, score 0.98)
- [Diagrams — L4272](chunks/diagrams.md#^ref-45cd25b5-4272-0) (line 4272, col 0, score 0.98)
- [Shared — L2988](chunks/shared.md#^ref-623a55f7-2988-0) (line 2988, col 0, score 0.98)
- [Simulation Demo — L3280](chunks/simulation-demo.md#^ref-557309a3-3280-0) (line 3280, col 0, score 0.98)
- [Window Management — L3440](chunks/window-management.md#^ref-9e8ae388-3440-0) (line 3440, col 0, score 0.98)
- [Creative Moments — L2057](creative-moments.md#^ref-10d98225-2057-0) (line 2057, col 0, score 0.98)
- [zero-copy-snapshots-and-workers — L1222](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-1222-0) (line 1222, col 0, score 0.98)
- [Creative Moments — L8945](creative-moments.md#^ref-10d98225-8945-0) (line 8945, col 0, score 1)
- [Duck's Attractor States — L11865](ducks-attractor-states.md#^ref-13951643-11865-0) (line 11865, col 0, score 1)
- [eidolon-field-math-foundations — L6894](eidolon-field-math-foundations.md#^ref-008f2ac0-6894-0) (line 6894, col 0, score 1)
- [Promethean Chat Activity Report — L9312](promethean-chat-activity-report.md#^ref-18344cf9-9312-0) (line 9312, col 0, score 1)
- [Promethean Documentation Update — L7607](promethean-documentation-update.txt#^ref-0b872af2-7607-0) (line 7607, col 0, score 1)
- [Creative Moments — L8946](creative-moments.md#^ref-10d98225-8946-0) (line 8946, col 0, score 1)
- [Duck's Attractor States — L11866](ducks-attractor-states.md#^ref-13951643-11866-0) (line 11866, col 0, score 1)
- [eidolon-field-math-foundations — L6895](eidolon-field-math-foundations.md#^ref-008f2ac0-6895-0) (line 6895, col 0, score 1)
- [Promethean Chat Activity Report — L9313](promethean-chat-activity-report.md#^ref-18344cf9-9313-0) (line 9313, col 0, score 1)
- [Promethean Dev Workflow Update — L4688](promethean-dev-workflow-update.md#^ref-03a5578f-4688-0) (line 4688, col 0, score 1)
- [Creative Moments — L8947](creative-moments.md#^ref-10d98225-8947-0) (line 8947, col 0, score 1)
- [Duck's Attractor States — L11867](ducks-attractor-states.md#^ref-13951643-11867-0) (line 11867, col 0, score 1)
- [eidolon-field-math-foundations — L6896](eidolon-field-math-foundations.md#^ref-008f2ac0-6896-0) (line 6896, col 0, score 1)
- [Promethean Chat Activity Report — L9314](promethean-chat-activity-report.md#^ref-18344cf9-9314-0) (line 9314, col 0, score 1)
- [Promethean Dev Workflow Update — L4689](promethean-dev-workflow-update.md#^ref-03a5578f-4689-0) (line 4689, col 0, score 1)
- [Creative Moments — L8948](creative-moments.md#^ref-10d98225-8948-0) (line 8948, col 0, score 1)
- [Duck's Attractor States — L11868](ducks-attractor-states.md#^ref-13951643-11868-0) (line 11868, col 0, score 1)
- [eidolon-field-math-foundations — L6897](eidolon-field-math-foundations.md#^ref-008f2ac0-6897-0) (line 6897, col 0, score 1)
- [Promethean Chat Activity Report — L9315](promethean-chat-activity-report.md#^ref-18344cf9-9315-0) (line 9315, col 0, score 1)
- [Promethean Dev Workflow Update — L4690](promethean-dev-workflow-update.md#^ref-03a5578f-4690-0) (line 4690, col 0, score 1)
- [Creative Moments — L8949](creative-moments.md#^ref-10d98225-8949-0) (line 8949, col 0, score 1)
- [Duck's Attractor States — L11869](ducks-attractor-states.md#^ref-13951643-11869-0) (line 11869, col 0, score 1)
- [eidolon-field-math-foundations — L6898](eidolon-field-math-foundations.md#^ref-008f2ac0-6898-0) (line 6898, col 0, score 1)
- [Promethean Chat Activity Report — L9316](promethean-chat-activity-report.md#^ref-18344cf9-9316-0) (line 9316, col 0, score 1)
- [Promethean Dev Workflow Update — L4691](promethean-dev-workflow-update.md#^ref-03a5578f-4691-0) (line 4691, col 0, score 1)
- [Promethean Documentation Update — L7611](promethean-documentation-update.txt#^ref-0b872af2-7611-0) (line 7611, col 0, score 1)
- [Promethean Notes — L8669](promethean-notes.md#^ref-1c4046b5-8669-0) (line 8669, col 0, score 1)
- [windows-tiling-with-autohotkey — L12667](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-12667-0) (line 12667, col 0, score 1)
- [Promethean Pipelines — L4080](promethean-pipelines.md#^ref-8b8e6103-4080-0) (line 4080, col 0, score 1)
- [Promethean State Format — L2953](promethean-state-format.md#^ref-23df6ddb-2953-0) (line 2953, col 0, score 1)
- [The Jar of Echoes — L4169](the-jar-of-echoes.md#^ref-18138627-4169-0) (line 4169, col 0, score 1)
- [Window Management — L3315](chunks/window-management.md#^ref-9e8ae388-3315-0) (line 3315, col 0, score 1)
- [Eidolon Field Abstract Model — L6128](eidolon-field-abstract-model.md#^ref-5e8b2388-6128-0) (line 6128, col 0, score 1)
- [Creative Moments — L8951](creative-moments.md#^ref-10d98225-8951-0) (line 8951, col 0, score 1)
- [Duck's Attractor States — L16012](ducks-attractor-states.md#^ref-13951643-16012-0) (line 16012, col 0, score 1)
- [eidolon-field-math-foundations — L6900](eidolon-field-math-foundations.md#^ref-008f2ac0-6900-0) (line 6900, col 0, score 1)
- [Promethean Chat Activity Report — L9318](promethean-chat-activity-report.md#^ref-18344cf9-9318-0) (line 9318, col 0, score 1)
- [Promethean Dev Workflow Update — L4693](promethean-dev-workflow-update.md#^ref-03a5578f-4693-0) (line 4693, col 0, score 1)
- [Creative Moments — L8952](creative-moments.md#^ref-10d98225-8952-0) (line 8952, col 0, score 1)
- [Duck's Attractor States — L16013](ducks-attractor-states.md#^ref-13951643-16013-0) (line 16013, col 0, score 1)
- [eidolon-field-math-foundations — L6901](eidolon-field-math-foundations.md#^ref-008f2ac0-6901-0) (line 6901, col 0, score 1)
- [Promethean Chat Activity Report — L9319](promethean-chat-activity-report.md#^ref-18344cf9-9319-0) (line 9319, col 0, score 1)
- [Promethean Dev Workflow Update — L4694](promethean-dev-workflow-update.md#^ref-03a5578f-4694-0) (line 4694, col 0, score 1)
- [Promethean Dev Workflow Update — L4695](promethean-dev-workflow-update.md#^ref-03a5578f-4695-0) (line 4695, col 0, score 1)
- [windows-tiling-with-autohotkey — L24359](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-24359-0) (line 24359, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L1945](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-1945-0) (line 1945, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L1837](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-1837-0) (line 1837, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L3516](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-3516-0) (line 3516, col 0, score 1)
- [Dynamic Context Model for Web Components — L5796](dynamic-context-model-for-web-components.md#^ref-f7702bf8-5796-0) (line 5796, col 0, score 0.99)
- [heartbeat-fragment-demo — L1817](heartbeat-fragment-demo.md#^ref-dd00677a-1817-0) (line 1817, col 0, score 0.99)
- [Docops Feature Updates — L991](docops-feature-updates.md#^ref-2792d448-991-0) (line 991, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L5854](dynamic-context-model-for-web-components.md#^ref-f7702bf8-5854-0) (line 5854, col 0, score 0.99)
- [Functional Embedding Pipeline Refactor — L1734](functional-embedding-pipeline-refactor.md#^ref-a4a25141-1734-0) (line 1734, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L2066](performance-optimized-polyglot-bridge.md#^ref-f5579967-2066-0) (line 2066, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L1867](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-1867-0) (line 1867, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L2481](migrate-to-provider-tenant-architecture.md#^ref-54382370-2481-0) (line 2481, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration Guide — L1269](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-1269-0) (line 1269, col 0, score 0.99)
- [Duck's Attractor States — L5801](ducks-attractor-states.md#^ref-13951643-5801-0) (line 5801, col 0, score 1)
- [Promethean Dev Workflow Update — L10303](promethean-dev-workflow-update.md#^ref-03a5578f-10303-0) (line 10303, col 0, score 1)
- [eidolon-field-math-foundations — L7856](eidolon-field-math-foundations.md#^ref-008f2ac0-7856-0) (line 7856, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L3164](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-3164-0) (line 3164, col 0, score 1)
- [windows-tiling-with-autohotkey — L6136](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-6136-0) (line 6136, col 0, score 1)
- [Creative Moments — L2949](creative-moments.md#^ref-10d98225-2949-0) (line 2949, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration Guide — L3949](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-3949-0) (line 3949, col 0, score 0.99)
- [Promethean Notes — L4756](promethean-notes.md#^ref-1c4046b5-4756-0) (line 4756, col 0, score 1)
- [Promethean Pipelines — L4085](promethean-pipelines.md#^ref-8b8e6103-4085-0) (line 4085, col 0, score 1)
- [Promethean State Format — L3004](promethean-state-format.md#^ref-23df6ddb-3004-0) (line 3004, col 0, score 1)
- [The Jar of Echoes — L8254](the-jar-of-echoes.md#^ref-18138627-8254-0) (line 8254, col 0, score 1)
- [Prompt_Folder_Bootstrap — L3002](prompt-folder-bootstrap.md#^ref-bd4f0976-3002-0) (line 3002, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L1902](protocol-0-the-contradiction-engine.md#^ref-9a93a756-1902-0) (line 1902, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L3985](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-3985-0) (line 3985, col 0, score 1)
- [windows-tiling-with-autohotkey — L1791](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-1791-0) (line 1791, col 0, score 0.99)
- [ts-to-lisp-transpiler — L3383](ts-to-lisp-transpiler.md#^ref-ba11486b-3383-0) (line 3383, col 0, score 1)
- [Duck's Attractor States — L5803](ducks-attractor-states.md#^ref-13951643-5803-0) (line 5803, col 0, score 1)
- [Promethean Dev Workflow Update — L10305](promethean-dev-workflow-update.md#^ref-03a5578f-10305-0) (line 10305, col 0, score 1)
- [DSL — L3577](chunks/dsl.md#^ref-e87bc036-3577-0) (line 3577, col 0, score 0.99)
- [Creative Moments — L4688](creative-moments.md#^ref-10d98225-4688-0) (line 4688, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration Guide — L3950](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-3950-0) (line 3950, col 0, score 0.99)
- [Obsidian Templating Plugins Integration Guide — L3551](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-3551-0) (line 3551, col 0, score 0.99)
- [Promethean Chat Activity Report — L4774](promethean-chat-activity-report.md#^ref-18344cf9-4774-0) (line 4774, col 0, score 0.99)
- [Duck's Attractor States — L5804](ducks-attractor-states.md#^ref-13951643-5804-0) (line 5804, col 0, score 1)
- [Promethean Dev Workflow Update — L10306](promethean-dev-workflow-update.md#^ref-03a5578f-10306-0) (line 10306, col 0, score 1)
- [DSL — L3578](chunks/dsl.md#^ref-e87bc036-3578-0) (line 3578, col 0, score 0.99)
- [Creative Moments — L4689](creative-moments.md#^ref-10d98225-4689-0) (line 4689, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration Guide — L3951](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-3951-0) (line 3951, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration — L3739](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-3739-0) (line 3739, col 0, score 0.99)
- [Promethean Chat Activity Report — L4775](promethean-chat-activity-report.md#^ref-18344cf9-4775-0) (line 4775, col 0, score 0.99)
- [Duck's Attractor States — L8907](ducks-attractor-states.md#^ref-13951643-8907-0) (line 8907, col 0, score 1)
- [Promethean Dev Workflow Update — L10307](promethean-dev-workflow-update.md#^ref-03a5578f-10307-0) (line 10307, col 0, score 1)
- [DSL — L3579](chunks/dsl.md#^ref-e87bc036-3579-0) (line 3579, col 0, score 0.99)
- [Creative Moments — L4690](creative-moments.md#^ref-10d98225-4690-0) (line 4690, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration Guide — L3952](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-3952-0) (line 3952, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration — L3740](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-3740-0) (line 3740, col 0, score 0.99)
- [Obsidian Templating Plugins Integration Guide — L3552](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-3552-0) (line 3552, col 0, score 0.99)
- [Promethean Chat Activity Report — L4776](promethean-chat-activity-report.md#^ref-18344cf9-4776-0) (line 4776, col 0, score 0.99)
- [Duck's Attractor States — L8908](ducks-attractor-states.md#^ref-13951643-8908-0) (line 8908, col 0, score 1)
- [Promethean Dev Workflow Update — L10308](promethean-dev-workflow-update.md#^ref-03a5578f-10308-0) (line 10308, col 0, score 1)
- [DSL — L3580](chunks/dsl.md#^ref-e87bc036-3580-0) (line 3580, col 0, score 0.99)
- [Creative Moments — L4691](creative-moments.md#^ref-10d98225-4691-0) (line 4691, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration Guide — L3953](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-3953-0) (line 3953, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration — L3741](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-3741-0) (line 3741, col 0, score 0.99)
- [Obsidian Templating Plugins Integration Guide — L3553](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-3553-0) (line 3553, col 0, score 0.99)
- [Promethean Dev Workflow Update — L10309](promethean-dev-workflow-update.md#^ref-03a5578f-10309-0) (line 10309, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L4064](promethean-copilot-intent-engine.md#^ref-ae24a280-4064-0) (line 4064, col 0, score 0.98)
- [Protocol_0_The_Contradiction_Engine — L3759](protocol-0-the-contradiction-engine.md#^ref-9a93a756-3759-0) (line 3759, col 0, score 0.98)
- [The Jar of Echoes — L4218](the-jar-of-echoes.md#^ref-18138627-4218-0) (line 4218, col 0, score 0.98)
- [ts-to-lisp-transpiler — L3365](ts-to-lisp-transpiler.md#^ref-ba11486b-3365-0) (line 3365, col 0, score 0.98)
- [TypeScript Patch for Tool Calling Support — L5129](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-5129-0) (line 5129, col 0, score 0.98)
- [Unique Info Dump Index — L8431](unique-info-dump-index.md#^ref-30ec3ba6-8431-0) (line 8431, col 0, score 0.98)
- [Promethean-Copilot-Intent-Engine — L4053](promethean-copilot-intent-engine.md#^ref-ae24a280-4053-0) (line 4053, col 0, score 0.98)
- [Protocol_0_The_Contradiction_Engine — L3742](protocol-0-the-contradiction-engine.md#^ref-9a93a756-3742-0) (line 3742, col 0, score 0.98)
- [Prompt_Folder_Bootstrap — L3001](prompt-folder-bootstrap.md#^ref-bd4f0976-3001-0) (line 3001, col 0, score 0.99)
- [Reawakening Duck — L3072](reawakening-duck.md#^ref-59b5670f-3072-0) (line 3072, col 0, score 1)
- [Promethean Pipelines — L4093](promethean-pipelines.md#^ref-8b8e6103-4093-0) (line 4093, col 0, score 0.99)
- [Promethean State Format — L3012](promethean-state-format.md#^ref-23df6ddb-3012-0) (line 3012, col 0, score 0.99)
- [TypeScript Patch for Tool Calling Support — L3986](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-3986-0) (line 3986, col 0, score 0.99)
- [DSL — L3601](chunks/dsl.md#^ref-e87bc036-3601-0) (line 3601, col 0, score 0.99)
- [DSL — L3602](chunks/dsl.md#^ref-e87bc036-3602-0) (line 3602, col 0, score 1)
- [ts-to-lisp-transpiler — L3385](ts-to-lisp-transpiler.md#^ref-ba11486b-3385-0) (line 3385, col 0, score 1)
- [DSL — L3604](chunks/dsl.md#^ref-e87bc036-3604-0) (line 3604, col 0, score 0.99)
- [ts-to-lisp-transpiler — L3387](ts-to-lisp-transpiler.md#^ref-ba11486b-3387-0) (line 3387, col 0, score 0.99)
- [DSL — L3605](chunks/dsl.md#^ref-e87bc036-3605-0) (line 3605, col 0, score 0.99)
- [DSL — L3614](chunks/dsl.md#^ref-e87bc036-3614-0) (line 3614, col 0, score 0.98)
- [Obsidian ChatGPT Plugin Integration Guide — L3987](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-3987-0) (line 3987, col 0, score 0.98)
- [Functional Embedding Pipeline Refactor — L3031](functional-embedding-pipeline-refactor.md#^ref-a4a25141-3031-0) (line 3031, col 0, score 0.93)
- [Functional Refactor of TypeScript Document Processing — L2269](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-2269-0) (line 2269, col 0, score 0.93)
- [graph-ds — L3784](graph-ds.md#^ref-6620e2f2-3784-0) (line 3784, col 0, score 0.93)
- [heartbeat-fragment-demo — L3506](heartbeat-fragment-demo.md#^ref-dd00677a-3506-0) (line 3506, col 0, score 0.93)
- [homeostasis-decay-formulas — L5621](homeostasis-decay-formulas.md#^ref-37b5d236-5621-0) (line 5621, col 0, score 0.93)
- [i3-bluetooth-setup — L5204](i3-bluetooth-setup.md#^ref-5e408692-5204-0) (line 5204, col 0, score 0.93)
- [Ice Box Reorganization — L3243](ice-box-reorganization.md#^ref-291c7d91-3243-0) (line 3243, col 0, score 0.93)
- [komorebi-group-window-hack — L4383](komorebi-group-window-hack.md#^ref-dd89372d-4383-0) (line 4383, col 0, score 0.93)
- [Layer1SurvivabilityEnvelope — L3779](layer1survivabilityenvelope.md#^ref-64a9f9f9-3779-0) (line 3779, col 0, score 0.93)
- [Obsidian ChatGPT Plugin Integration — L1364](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-1364-0) (line 1364, col 0, score 0.99)
- [Obsidian Templating Plugins Integration Guide — L1599](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-1599-0) (line 1599, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L6419](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6419-0) (line 6419, col 0, score 1)
- [The Jar of Echoes — L14477](the-jar-of-echoes.md#^ref-18138627-14477-0) (line 14477, col 0, score 0.99)
- [Creative Moments — L11760](creative-moments.md#^ref-10d98225-11760-0) (line 11760, col 0, score 0.99)
- [eidolon-field-math-foundations — L20158](eidolon-field-math-foundations.md#^ref-008f2ac0-20158-0) (line 20158, col 0, score 0.99)
- [The Jar of Echoes — L17508](the-jar-of-echoes.md#^ref-18138627-17508-0) (line 17508, col 0, score 0.99)
- [Duck's Attractor States — L12671](ducks-attractor-states.md#^ref-13951643-12671-0) (line 12671, col 0, score 0.98)
- [eidolon-field-math-foundations — L25725](eidolon-field-math-foundations.md#^ref-008f2ac0-25725-0) (line 25725, col 0, score 0.98)
- [The Jar of Echoes — L678](the-jar-of-echoes.md#^ref-18138627-678-0) (line 678, col 0, score 0.98)
- [homeostasis-decay-formulas — L4931](homeostasis-decay-formulas.md#^ref-37b5d236-4931-0) (line 4931, col 0, score 0.98)
- [i3-bluetooth-setup — L4000](i3-bluetooth-setup.md#^ref-5e408692-4000-0) (line 4000, col 0, score 0.98)
- [Ice Box Reorganization — L3931](ice-box-reorganization.md#^ref-291c7d91-3931-0) (line 3931, col 0, score 0.98)
- [komorebi-group-window-hack — L4527](komorebi-group-window-hack.md#^ref-dd89372d-4527-0) (line 4527, col 0, score 0.98)
- [Layer1SurvivabilityEnvelope — L4603](layer1survivabilityenvelope.md#^ref-64a9f9f9-4603-0) (line 4603, col 0, score 0.98)
- [Mathematical Samplers — L1799](mathematical-samplers.md#^ref-86a691ec-1799-0) (line 1799, col 0, score 0.98)
- [Mathematics Sampler — L1829](mathematics-sampler.md#^ref-b5e0183e-1829-0) (line 1829, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L6159](migrate-to-provider-tenant-architecture.md#^ref-54382370-6159-0) (line 6159, col 0, score 0.98)
- [Mindful Prioritization — L1696](mindful-prioritization.md#^ref-40185d05-1696-0) (line 1696, col 0, score 0.98)
- [Duck's Attractor States — L2060](ducks-attractor-states.md#^ref-13951643-2060-0) (line 2060, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L2317](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-2317-0) (line 2317, col 0, score 1)
- [Self-Agency in AI Interaction — L1261](self-agency-in-ai-interaction.md#^ref-49a9a860-1261-0) (line 1261, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L2272](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-2272-0) (line 2272, col 0, score 1)
- [Promethean Chat Activity Report — L8734](promethean-chat-activity-report.md#^ref-18344cf9-8734-0) (line 8734, col 0, score 0.99)
- [Factorio AI with External Agents — L1819](factorio-ai-with-external-agents.md#^ref-a4d90289-1819-0) (line 1819, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L4054](performance-optimized-polyglot-bridge.md#^ref-f5579967-4054-0) (line 4054, col 0, score 1)
- [Duck's Attractor States — L2061](ducks-attractor-states.md#^ref-13951643-2061-0) (line 2061, col 0, score 1)
- [Dynamic Context Model for Web Components — L5465](dynamic-context-model-for-web-components.md#^ref-f7702bf8-5465-0) (line 5465, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L2318](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-2318-0) (line 2318, col 0, score 1)
- [Self-Agency in AI Interaction — L1262](self-agency-in-ai-interaction.md#^ref-49a9a860-1262-0) (line 1262, col 0, score 1)
- [Promethean Pipelines — L3271](promethean-pipelines.md#^ref-8b8e6103-3271-0) (line 3271, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L1747](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-1747-0) (line 1747, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L2362](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2362-0) (line 2362, col 0, score 1)
- [Docops Feature Updates — L996](docops-feature-updates-2.md#^ref-cdbd21ee-996-0) (line 996, col 0, score 1)
- [Docops Feature Updates — L1256](docops-feature-updates.md#^ref-2792d448-1256-0) (line 1256, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L3335](performance-optimized-polyglot-bridge.md#^ref-f5579967-3335-0) (line 3335, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L5946](migrate-to-provider-tenant-architecture.md#^ref-54382370-5946-0) (line 5946, col 0, score 0.99)
- [field-dynamics-math-blocks — L2995](field-dynamics-math-blocks.md#^ref-7cfc230d-2995-0) (line 2995, col 0, score 0.99)
- [Debugging Broker Connections and Agent Behavior — L2361](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2361-0) (line 2361, col 0, score 1)
- [Docops Feature Updates — L998](docops-feature-updates-2.md#^ref-cdbd21ee-998-0) (line 998, col 0, score 1)
- [Docops Feature Updates — L1258](docops-feature-updates.md#^ref-2792d448-1258-0) (line 1258, col 0, score 1)
- [Dynamic Context Model for Web Components — L4591](dynamic-context-model-for-web-components.md#^ref-f7702bf8-4591-0) (line 4591, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L1960](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-1960-0) (line 1960, col 0, score 1)
- [Window Management — L1686](chunks/window-management.md#^ref-9e8ae388-1686-0) (line 1686, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L4089](dynamic-context-model-for-web-components.md#^ref-f7702bf8-4089-0) (line 4089, col 0, score 0.99)
- [Promethean Dev Workflow Update — L1725](promethean-dev-workflow-update.md#^ref-03a5578f-1725-0) (line 1725, col 0, score 1)
- [Prompt_Folder_Bootstrap — L3645](prompt-folder-bootstrap.md#^ref-bd4f0976-3645-0) (line 3645, col 0, score 1)
- [Dynamic Context Model for Web Components — L7664](dynamic-context-model-for-web-components.md#^ref-f7702bf8-7664-0) (line 7664, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L2288](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-2288-0) (line 2288, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L2688](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2688-0) (line 2688, col 0, score 0.99)
- [Model Upgrade Calm-Down Guide — L2993](model-upgrade-calm-down-guide.md#^ref-db74343f-2993-0) (line 2993, col 0, score 0.99)
- [obsidian-ignore-node-modules-regex — L1528](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-1528-0) (line 1528, col 0, score 0.99)
- [Protocol_0_The_Contradiction_Engine — L2288](protocol-0-the-contradiction-engine.md#^ref-9a93a756-2288-0) (line 2288, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L6435](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6435-0) (line 6435, col 0, score 1)
- [Duck's Attractor States — L2058](ducks-attractor-states.md#^ref-13951643-2058-0) (line 2058, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L6453](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6453-0) (line 6453, col 0, score 0.98)
- [Post-Linguistic Transhuman Design Frameworks — L2315](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-2315-0) (line 2315, col 0, score 0.98)
- [Self-Agency in AI Interaction — L1259](self-agency-in-ai-interaction.md#^ref-49a9a860-1259-0) (line 1259, col 0, score 0.98)
- [Debugging Broker Connections and Agent Behavior — L2650](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2650-0) (line 2650, col 0, score 0.98)
- [field-interaction-equations — L3574](field-interaction-equations.md#^ref-b09141b7-3574-0) (line 3574, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L7663](dynamic-context-model-for-web-components.md#^ref-f7702bf8-7663-0) (line 7663, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L4049](performance-optimized-polyglot-bridge.md#^ref-f5579967-4049-0) (line 4049, col 0, score 1)
- [Duck's Attractor States — L2057](ducks-attractor-states.md#^ref-13951643-2057-0) (line 2057, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L6452](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6452-0) (line 6452, col 0, score 0.99)
- [Post-Linguistic Transhuman Design Frameworks — L2314](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-2314-0) (line 2314, col 0, score 0.99)
- [Self-Agency in AI Interaction — L1258](self-agency-in-ai-interaction.md#^ref-49a9a860-1258-0) (line 1258, col 0, score 0.99)
- [Fnord Tracer Protocol — L2656](fnord-tracer-protocol.md#^ref-fc21f824-2656-0) (line 2656, col 0, score 0.99)
- [Protocol_0_The_Contradiction_Engine — L1991](protocol-0-the-contradiction-engine.md#^ref-9a93a756-1991-0) (line 1991, col 0, score 0.99)
- [Promethean Dev Workflow Update — L16838](promethean-dev-workflow-update.md#^ref-03a5578f-16838-0) (line 16838, col 0, score 0.98)
- [Unique Info Dump Index — L1926](unique-info-dump-index.md#^ref-30ec3ba6-1926-0) (line 1926, col 0, score 0.98)
- [Debugging Broker Connections and Agent Behavior — L2484](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2484-0) (line 2484, col 0, score 0.98)
- [Promethean Dev Workflow Update — L1762](promethean-dev-workflow-update.md#^ref-03a5578f-1762-0) (line 1762, col 0, score 0.98)
- [Debugging Broker Connections and Agent Behavior — L2275](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2275-0) (line 2275, col 0, score 0.98)
- [Functional Embedding Pipeline Refactor — L2286](functional-embedding-pipeline-refactor.md#^ref-a4a25141-2286-0) (line 2286, col 0, score 0.97)
- [komorebi-group-window-hack — L1947](komorebi-group-window-hack.md#^ref-dd89372d-1947-0) (line 1947, col 0, score 0.97)
- [Per-Domain Policy System for JS Crawler — L2454](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-2454-0) (line 2454, col 0, score 0.97)
- [OpenAPI Validation Report — L1058](openapi-validation-report.md#^ref-5c152b08-1058-0) (line 1058, col 0, score 1)
- [Self-Agency in AI Interaction — L1893](self-agency-in-ai-interaction.md#^ref-49a9a860-1893-0) (line 1893, col 0, score 1)
- [Pipeline Enhancements — L890](pipeline-enhancements.md#^ref-e2135d9f-890-0) (line 890, col 0, score 0.99)
- [plan-update-confirmation — L6779](plan-update-confirmation.md#^ref-b22d79c6-6779-0) (line 6779, col 0, score 0.99)
- [Prompt_Folder_Bootstrap — L3120](prompt-folder-bootstrap.md#^ref-bd4f0976-3120-0) (line 3120, col 0, score 0.99)
- [Provider-Agnostic Chat Panel Implementation — L1707](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-1707-0) (line 1707, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L2389](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-2389-0) (line 2389, col 0, score 0.99)
- [Eidolon Field Abstract Model — L3306](eidolon-field-abstract-model.md#^ref-5e8b2388-3306-0) (line 3306, col 0, score 0.99)
- [OpenAPI Validation Report — L1057](openapi-validation-report.md#^ref-5c152b08-1057-0) (line 1057, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L2033](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-2033-0) (line 2033, col 0, score 1)
- [Unique Info Dump Index — L4381](unique-info-dump-index.md#^ref-30ec3ba6-4381-0) (line 4381, col 0, score 1)
- [field-dynamics-math-blocks — L1823](field-dynamics-math-blocks.md#^ref-7cfc230d-1823-0) (line 1823, col 0, score 0.99)
- [field-interaction-equations — L3752](field-interaction-equations.md#^ref-b09141b7-3752-0) (line 3752, col 0, score 0.99)
- [homeostasis-decay-formulas — L2411](homeostasis-decay-formulas.md#^ref-37b5d236-2411-0) (line 2411, col 0, score 0.99)
- [Promethean Pipelines — L2878](promethean-pipelines.md#^ref-8b8e6103-2878-0) (line 2878, col 0, score 0.99)
- [Model Selection for Lightweight Conversational Tasks — L1722](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-1722-0) (line 1722, col 0, score 0.98)
- [eidolon-field-math-foundations — L25531](eidolon-field-math-foundations.md#^ref-008f2ac0-25531-0) (line 25531, col 0, score 1)
- [Promethean Dev Workflow Update — L25699](promethean-dev-workflow-update.md#^ref-03a5578f-25699-0) (line 25699, col 0, score 1)
- [windows-tiling-with-autohotkey — L21689](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-21689-0) (line 21689, col 0, score 1)
- [Promethean Dev Workflow Update — L25656](promethean-dev-workflow-update.md#^ref-03a5578f-25656-0) (line 25656, col 0, score 1)
- [The Jar of Echoes — L16094](the-jar-of-echoes.md#^ref-18138627-16094-0) (line 16094, col 0, score 1)
- [windows-tiling-with-autohotkey — L18452](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-18452-0) (line 18452, col 0, score 1)
- [Duck's Attractor States — L21561](ducks-attractor-states.md#^ref-13951643-21561-0) (line 21561, col 0, score 1)
- [Promethean Dev Workflow Update — L25743](promethean-dev-workflow-update.md#^ref-03a5578f-25743-0) (line 25743, col 0, score 0.99)
- [Diagrams — L4166](chunks/diagrams.md#^ref-45cd25b5-4166-0) (line 4166, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L3960](dynamic-context-model-for-web-components.md#^ref-f7702bf8-3960-0) (line 3960, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L6895](migrate-to-provider-tenant-architecture.md#^ref-54382370-6895-0) (line 6895, col 0, score 0.99)
- [Promethean Infrastructure Setup — L4691](promethean-infrastructure-setup.md#^ref-6deed6ac-4691-0) (line 4691, col 0, score 0.99)
- [Pure TypeScript Search Microservice — L4081](pure-typescript-search-microservice.md#^ref-d17d3a96-4081-0) (line 4081, col 0, score 0.99)
- [typed-struct-compiler — L1924](typed-struct-compiler.md#^ref-78eeedf7-1924-0) (line 1924, col 0, score 0.99)
- [eidolon-field-math-foundations — L25558](eidolon-field-math-foundations.md#^ref-008f2ac0-25558-0) (line 25558, col 0, score 0.99)
- [eidolon-field-math-foundations — L25594](eidolon-field-math-foundations.md#^ref-008f2ac0-25594-0) (line 25594, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L19054](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-19054-0) (line 19054, col 0, score 0.99)
- [eidolon-field-math-foundations — L25437](eidolon-field-math-foundations.md#^ref-008f2ac0-25437-0) (line 25437, col 0, score 0.99)
- [The Jar of Echoes — L14128](the-jar-of-echoes.md#^ref-18138627-14128-0) (line 14128, col 0, score 0.99)
- [eidolon-field-math-foundations — L24871](eidolon-field-math-foundations.md#^ref-008f2ac0-24871-0) (line 24871, col 0, score 0.99)
- [eidolon-field-math-foundations — L23470](eidolon-field-math-foundations.md#^ref-008f2ac0-23470-0) (line 23470, col 0, score 0.99)
- [Debugging Broker Connections and Agent Behavior — L2196](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2196-0) (line 2196, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L1969](layer1survivabilityenvelope.md#^ref-64a9f9f9-1969-0) (line 1969, col 0, score 1)
- [Duck's Attractor States — L12463](ducks-attractor-states.md#^ref-13951643-12463-0) (line 12463, col 0, score 1)
- [eidolon-field-math-foundations — L17356](eidolon-field-math-foundations.md#^ref-008f2ac0-17356-0) (line 17356, col 0, score 1)
- [Prompt_Folder_Bootstrap — L2475](prompt-folder-bootstrap.md#^ref-bd4f0976-2475-0) (line 2475, col 0, score 1)
- [Mathematical Samplers — L1271](mathematical-samplers.md#^ref-86a691ec-1271-0) (line 1271, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L2687](model-upgrade-calm-down-guide.md#^ref-db74343f-2687-0) (line 2687, col 0, score 1)
- [Promethean Dev Workflow Update — L13654](promethean-dev-workflow-update.md#^ref-03a5578f-13654-0) (line 13654, col 0, score 1)
- [Promethean Dev Workflow Update — L19543](promethean-dev-workflow-update.md#^ref-03a5578f-19543-0) (line 19543, col 0, score 1)
- [Dynamic Context Model for Web Components — L2623](dynamic-context-model-for-web-components.md#^ref-f7702bf8-2623-0) (line 2623, col 0, score 0.99)
- [eidolon-field-math-foundations — L5755](eidolon-field-math-foundations.md#^ref-008f2ac0-5755-0) (line 5755, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L3744](migrate-to-provider-tenant-architecture.md#^ref-54382370-3744-0) (line 3744, col 0, score 1)
- [Promethean Dev Workflow Update — L4756](promethean-dev-workflow-update.md#^ref-03a5578f-4756-0) (line 4756, col 0, score 1)
- [Promethean Infrastructure Setup — L2631](promethean-infrastructure-setup.md#^ref-6deed6ac-2631-0) (line 2631, col 0, score 1)
- [windows-tiling-with-autohotkey — L15383](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-15383-0) (line 15383, col 0, score 1)
- [The Jar of Echoes — L13741](the-jar-of-echoes.md#^ref-18138627-13741-0) (line 13741, col 0, score 1)
- [Duck's Attractor States — L12464](ducks-attractor-states.md#^ref-13951643-12464-0) (line 12464, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L2688](model-upgrade-calm-down-guide.md#^ref-db74343f-2688-0) (line 2688, col 0, score 1)
- [eidolon-field-math-foundations — L5756](eidolon-field-math-foundations.md#^ref-008f2ac0-5756-0) (line 5756, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L3745](migrate-to-provider-tenant-architecture.md#^ref-54382370-3745-0) (line 3745, col 0, score 1)
- [Promethean Dev Workflow Update — L4757](promethean-dev-workflow-update.md#^ref-03a5578f-4757-0) (line 4757, col 0, score 1)
- [Promethean Infrastructure Setup — L2632](promethean-infrastructure-setup.md#^ref-6deed6ac-2632-0) (line 2632, col 0, score 1)
- [windows-tiling-with-autohotkey — L15384](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-15384-0) (line 15384, col 0, score 1)
- [The Jar of Echoes — L13742](the-jar-of-echoes.md#^ref-18138627-13742-0) (line 13742, col 0, score 1)
- [Duck's Attractor States — L12465](ducks-attractor-states.md#^ref-13951643-12465-0) (line 12465, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L2689](model-upgrade-calm-down-guide.md#^ref-db74343f-2689-0) (line 2689, col 0, score 1)
- [eidolon-field-math-foundations — L5757](eidolon-field-math-foundations.md#^ref-008f2ac0-5757-0) (line 5757, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L3746](migrate-to-provider-tenant-architecture.md#^ref-54382370-3746-0) (line 3746, col 0, score 1)
- [Promethean Dev Workflow Update — L4758](promethean-dev-workflow-update.md#^ref-03a5578f-4758-0) (line 4758, col 0, score 1)
- [Promethean Infrastructure Setup — L2633](promethean-infrastructure-setup.md#^ref-6deed6ac-2633-0) (line 2633, col 0, score 1)
- [windows-tiling-with-autohotkey — L15385](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-15385-0) (line 15385, col 0, score 1)
- [The Jar of Echoes — L13743](the-jar-of-echoes.md#^ref-18138627-13743-0) (line 13743, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L3619](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-3619-0) (line 3619, col 0, score 1)
- [Duck's Attractor States — L12466](ducks-attractor-states.md#^ref-13951643-12466-0) (line 12466, col 0, score 1)
- [eidolon-field-math-foundations — L5758](eidolon-field-math-foundations.md#^ref-008f2ac0-5758-0) (line 5758, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L3747](migrate-to-provider-tenant-architecture.md#^ref-54382370-3747-0) (line 3747, col 0, score 1)
- [Promethean Dev Workflow Update — L4759](promethean-dev-workflow-update.md#^ref-03a5578f-4759-0) (line 4759, col 0, score 1)
- [Promethean Infrastructure Setup — L2634](promethean-infrastructure-setup.md#^ref-6deed6ac-2634-0) (line 2634, col 0, score 1)
- [windows-tiling-with-autohotkey — L15386](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-15386-0) (line 15386, col 0, score 1)
- [The Jar of Echoes — L13744](the-jar-of-echoes.md#^ref-18138627-13744-0) (line 13744, col 0, score 1)
- [Duck's Attractor States — L12467](ducks-attractor-states.md#^ref-13951643-12467-0) (line 12467, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L3620](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-3620-0) (line 3620, col 0, score 1)
- [eidolon-field-math-foundations — L5759](eidolon-field-math-foundations.md#^ref-008f2ac0-5759-0) (line 5759, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L3748](migrate-to-provider-tenant-architecture.md#^ref-54382370-3748-0) (line 3748, col 0, score 1)
- [Promethean Dev Workflow Update — L4760](promethean-dev-workflow-update.md#^ref-03a5578f-4760-0) (line 4760, col 0, score 1)
- [Promethean Infrastructure Setup — L2635](promethean-infrastructure-setup.md#^ref-6deed6ac-2635-0) (line 2635, col 0, score 1)
- [windows-tiling-with-autohotkey — L15387](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-15387-0) (line 15387, col 0, score 1)
- [The Jar of Echoes — L13745](the-jar-of-echoes.md#^ref-18138627-13745-0) (line 13745, col 0, score 1)
- [Duck's Attractor States — L12468](ducks-attractor-states.md#^ref-13951643-12468-0) (line 12468, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L2692](model-upgrade-calm-down-guide.md#^ref-db74343f-2692-0) (line 2692, col 0, score 1)
- [eidolon-field-math-foundations — L5760](eidolon-field-math-foundations.md#^ref-008f2ac0-5760-0) (line 5760, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L3749](migrate-to-provider-tenant-architecture.md#^ref-54382370-3749-0) (line 3749, col 0, score 1)
- [Promethean Dev Workflow Update — L4761](promethean-dev-workflow-update.md#^ref-03a5578f-4761-0) (line 4761, col 0, score 1)
- [Promethean Infrastructure Setup — L2636](promethean-infrastructure-setup.md#^ref-6deed6ac-2636-0) (line 2636, col 0, score 1)
- [windows-tiling-with-autohotkey — L15388](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-15388-0) (line 15388, col 0, score 1)
- [The Jar of Echoes — L13746](the-jar-of-echoes.md#^ref-18138627-13746-0) (line 13746, col 0, score 1)
- [Duck's Attractor States — L12469](ducks-attractor-states.md#^ref-13951643-12469-0) (line 12469, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L2693](model-upgrade-calm-down-guide.md#^ref-db74343f-2693-0) (line 2693, col 0, score 1)
- [eidolon-field-math-foundations — L5761](eidolon-field-math-foundations.md#^ref-008f2ac0-5761-0) (line 5761, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L3750](migrate-to-provider-tenant-architecture.md#^ref-54382370-3750-0) (line 3750, col 0, score 1)
- [Promethean Dev Workflow Update — L4762](promethean-dev-workflow-update.md#^ref-03a5578f-4762-0) (line 4762, col 0, score 1)
- [Promethean Infrastructure Setup — L2637](promethean-infrastructure-setup.md#^ref-6deed6ac-2637-0) (line 2637, col 0, score 1)
- [windows-tiling-with-autohotkey — L15389](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-15389-0) (line 15389, col 0, score 1)
- [The Jar of Echoes — L13747](the-jar-of-echoes.md#^ref-18138627-13747-0) (line 13747, col 0, score 1)
- [Duck's Attractor States — L12470](ducks-attractor-states.md#^ref-13951643-12470-0) (line 12470, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L2694](model-upgrade-calm-down-guide.md#^ref-db74343f-2694-0) (line 2694, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L3751](migrate-to-provider-tenant-architecture.md#^ref-54382370-3751-0) (line 3751, col 0, score 1)
- [Promethean Dev Workflow Update — L4763](promethean-dev-workflow-update.md#^ref-03a5578f-4763-0) (line 4763, col 0, score 1)
- [Promethean Infrastructure Setup — L2638](promethean-infrastructure-setup.md#^ref-6deed6ac-2638-0) (line 2638, col 0, score 1)
- [windows-tiling-with-autohotkey — L15390](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-15390-0) (line 15390, col 0, score 1)
- [The Jar of Echoes — L13748](the-jar-of-echoes.md#^ref-18138627-13748-0) (line 13748, col 0, score 1)
- [Duck's Attractor States — L12471](ducks-attractor-states.md#^ref-13951643-12471-0) (line 12471, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L2695](model-upgrade-calm-down-guide.md#^ref-db74343f-2695-0) (line 2695, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L3624](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-3624-0) (line 3624, col 0, score 1)
- [eidolon-field-math-foundations — L5763](eidolon-field-math-foundations.md#^ref-008f2ac0-5763-0) (line 5763, col 0, score 1)
- [Promethean Dev Workflow Update — L4764](promethean-dev-workflow-update.md#^ref-03a5578f-4764-0) (line 4764, col 0, score 1)
- [Promethean Infrastructure Setup — L2639](promethean-infrastructure-setup.md#^ref-6deed6ac-2639-0) (line 2639, col 0, score 1)
- [windows-tiling-with-autohotkey — L15391](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-15391-0) (line 15391, col 0, score 1)
- [The Jar of Echoes — L13749](the-jar-of-echoes.md#^ref-18138627-13749-0) (line 13749, col 0, score 1)
- [Duck's Attractor States — L12472](ducks-attractor-states.md#^ref-13951643-12472-0) (line 12472, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L2696](model-upgrade-calm-down-guide.md#^ref-db74343f-2696-0) (line 2696, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L3625](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-3625-0) (line 3625, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L2321](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-2321-0) (line 2321, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L2276](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-2276-0) (line 2276, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L2368](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2368-0) (line 2368, col 0, score 0.99)
- [Docops Feature Updates — L999](docops-feature-updates-2.md#^ref-cdbd21ee-999-0) (line 999, col 0, score 0.99)
- [Docops Feature Updates — L1259](docops-feature-updates.md#^ref-2792d448-1259-0) (line 1259, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L1958](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-1958-0) (line 1958, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L3340](performance-optimized-polyglot-bridge.md#^ref-f5579967-3340-0) (line 3340, col 0, score 0.99)
- [ParticleSimulationWithCanvasAndFFmpeg — L2320](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-2320-0) (line 2320, col 0, score 1)
- [Dynamic Context Model for Web Components — L5505](dynamic-context-model-for-web-components.md#^ref-f7702bf8-5505-0) (line 5505, col 0, score 1)
- [ts-to-lisp-transpiler — L1283](ts-to-lisp-transpiler.md#^ref-ba11486b-1283-0) (line 1283, col 0, score 0.99)
- [The Jar of Echoes — L15826](the-jar-of-echoes.md#^ref-18138627-15826-0) (line 15826, col 0, score 0.99)
- [Promethean Dev Workflow Update — L19839](promethean-dev-workflow-update.md#^ref-03a5578f-19839-0) (line 19839, col 0, score 0.99)
- [The Jar of Echoes — L22643](the-jar-of-echoes.md#^ref-18138627-22643-0) (line 22643, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L18661](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-18661-0) (line 18661, col 0, score 0.99)
- [The Jar of Echoes — L17464](the-jar-of-echoes.md#^ref-18138627-17464-0) (line 17464, col 0, score 0.98)
- [komorebi-group-window-hack — L2282](komorebi-group-window-hack.md#^ref-dd89372d-2282-0) (line 2282, col 0, score 0.98)
- [Model Selection for Lightweight Conversational Tasks — L2774](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-2774-0) (line 2774, col 0, score 0.98)
- [Promethean Dev Workflow Update — L2792](promethean-dev-workflow-update.md#^ref-03a5578f-2792-0) (line 2792, col 0, score 0.98)
- [sibilant-macro-targets — L2831](sibilant-macro-targets.md#^ref-c5c9a5c6-2831-0) (line 2831, col 0, score 0.98)
- [Eidolon Field Abstract Model — L2312](eidolon-field-abstract-model.md#^ref-5e8b2388-2312-0) (line 2312, col 0, score 0.98)
- [homeostasis-decay-formulas — L2840](homeostasis-decay-formulas.md#^ref-37b5d236-2840-0) (line 2840, col 0, score 0.98)
- [Model Upgrade Calm-Down Guide — L1861](model-upgrade-calm-down-guide.md#^ref-db74343f-1861-0) (line 1861, col 0, score 0.98)
- [ParticleSimulationWithCanvasAndFFmpeg — L2324](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-2324-0) (line 2324, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L1734](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-1734-0) (line 1734, col 0, score 1)
- [Dynamic Context Model for Web Components — L6443](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6443-0) (line 6443, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L2865](layer1survivabilityenvelope.md#^ref-64a9f9f9-2865-0) (line 2865, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L3130](model-upgrade-calm-down-guide.md#^ref-db74343f-3130-0) (line 3130, col 0, score 1)
- [Promethean Dev Workflow Update — L12722](promethean-dev-workflow-update.md#^ref-03a5578f-12722-0) (line 12722, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L4075](performance-optimized-polyglot-bridge.md#^ref-f5579967-4075-0) (line 4075, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L1735](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-1735-0) (line 1735, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L2325](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-2325-0) (line 2325, col 0, score 1)
- [Dynamic Context Model for Web Components — L6444](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6444-0) (line 6444, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L2642](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2642-0) (line 2642, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L2866](layer1survivabilityenvelope.md#^ref-64a9f9f9-2866-0) (line 2866, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L2652](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2652-0) (line 2652, col 0, score 0.98)
- [Promethean Dev Workflow Update — L1877](promethean-dev-workflow-update.md#^ref-03a5578f-1877-0) (line 1877, col 0, score 0.98)
- [Reawakening Duck — L1984](reawakening-duck.md#^ref-59b5670f-1984-0) (line 1984, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L1733](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-1733-0) (line 1733, col 0, score 1)
- [Dynamic Context Model for Web Components — L6442](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6442-0) (line 6442, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L2641](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2641-0) (line 2641, col 0, score 0.99)
- [Model Upgrade Calm-Down Guide — L3131](model-upgrade-calm-down-guide.md#^ref-db74343f-3131-0) (line 3131, col 0, score 0.99)
- [Duck's Attractor States — L14642](ducks-attractor-states.md#^ref-13951643-14642-0) (line 14642, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L18999](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-18999-0) (line 18999, col 0, score 0.99)
- [Unique Info Dump Index — L4380](unique-info-dump-index.md#^ref-30ec3ba6-4380-0) (line 4380, col 0, score 1)
- [Reawakening Duck — L2496](reawakening-duck.md#^ref-59b5670f-2496-0) (line 2496, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1803](migrate-to-provider-tenant-architecture.md#^ref-54382370-1803-0) (line 1803, col 0, score 1)
- [Dynamic Context Model for Web Components — L6307](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6307-0) (line 6307, col 0, score 0.97)
- [typed-struct-compiler — L1925](typed-struct-compiler.md#^ref-78eeedf7-1925-0) (line 1925, col 0, score 0.97)
- [Functional Embedding Pipeline Refactor — L1930](functional-embedding-pipeline-refactor.md#^ref-a4a25141-1930-0) (line 1930, col 0, score 0.97)
- [Layer1SurvivabilityEnvelope — L2515](layer1survivabilityenvelope.md#^ref-64a9f9f9-2515-0) (line 2515, col 0, score 0.97)
- [Chroma Toolkit Consolidation Plan — L3528](chroma-toolkit-consolidation-plan.md#^ref-5020e892-3528-0) (line 3528, col 0, score 0.95)
- [DSL — L2003](chunks/dsl.md#^ref-e87bc036-2003-0) (line 2003, col 0, score 0.95)
- [JavaScript — L1538](chunks/javascript.md#^ref-c1618c66-1538-0) (line 1538, col 0, score 0.95)
- [Shared — L1503](chunks/shared.md#^ref-623a55f7-1503-0) (line 1503, col 0, score 0.95)
- [Tooling — L1405](chunks/tooling.md#^ref-6cb4943e-1405-0) (line 1405, col 0, score 0.95)
- [Window Management — L1867](chunks/window-management.md#^ref-9e8ae388-1867-0) (line 1867, col 0, score 0.95)
- [Debugging Broker Connections and Agent Behavior — L3078](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-3078-0) (line 3078, col 0, score 0.95)
- [Eidolon Field Abstract Model — L6001](eidolon-field-abstract-model.md#^ref-5e8b2388-6001-0) (line 6001, col 0, score 0.95)
- [eidolon-node-lifecycle — L2613](eidolon-node-lifecycle.md#^ref-938eca9c-2613-0) (line 2613, col 0, score 0.95)
- [field-dynamics-math-blocks — L5213](field-dynamics-math-blocks.md#^ref-7cfc230d-5213-0) (line 5213, col 0, score 0.95)
- [field-interaction-equations — L5048](field-interaction-equations.md#^ref-b09141b7-5048-0) (line 5048, col 0, score 0.95)
- [field-node-diagram-set — L3681](field-node-diagram-set.md#^ref-22b989d5-3681-0) (line 3681, col 0, score 0.95)
- [field-node-diagram-visualizations — L3139](field-node-diagram-visualizations.md#^ref-e9b27b06-3139-0) (line 3139, col 0, score 0.95)
- [Reawakening Duck — L2498](reawakening-duck.md#^ref-59b5670f-2498-0) (line 2498, col 0, score 1)
- [Duck's Attractor States — L2055](ducks-attractor-states.md#^ref-13951643-2055-0) (line 2055, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L6449](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6449-0) (line 6449, col 0, score 0.99)
- [Post-Linguistic Transhuman Design Frameworks — L2312](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-2312-0) (line 2312, col 0, score 0.99)
- [Debugging Broker Connections and Agent Behavior — L2434](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2434-0) (line 2434, col 0, score 0.98)
- [Eidolon Field Abstract Model — L4025](eidolon-field-abstract-model.md#^ref-5e8b2388-4025-0) (line 4025, col 0, score 0.98)
- [eidolon-node-lifecycle — L1236](eidolon-node-lifecycle.md#^ref-938eca9c-1236-0) (line 1236, col 0, score 1)
- [field-node-diagram-outline — L2542](field-node-diagram-outline.md#^ref-1f32c94a-2542-0) (line 2542, col 0, score 1)
- [field-node-diagram-set — L2529](field-node-diagram-set.md#^ref-22b989d5-2529-0) (line 2529, col 0, score 1)
- [field-node-diagram-visualizations — L2023](field-node-diagram-visualizations.md#^ref-e9b27b06-2023-0) (line 2023, col 0, score 1)
- [eidolon-field-math-foundations — L3639](eidolon-field-math-foundations.md#^ref-008f2ac0-3639-0) (line 3639, col 0, score 0.99)
- [Duck's Self-Referential Perceptual Loop — L1496](ducks-self-referential-perceptual-loop.md#^ref-71726f04-1496-0) (line 1496, col 0, score 1)
- [Factorio AI with External Agents — L1931](factorio-ai-with-external-agents.md#^ref-a4d90289-1931-0) (line 1931, col 0, score 1)
- [Reawakening Duck — L2502](reawakening-duck.md#^ref-59b5670f-2502-0) (line 2502, col 0, score 1)
- [eidolon-node-lifecycle — L1237](eidolon-node-lifecycle.md#^ref-938eca9c-1237-0) (line 1237, col 0, score 1)
- [field-node-diagram-outline — L2543](field-node-diagram-outline.md#^ref-1f32c94a-2543-0) (line 2543, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L1497](ducks-self-referential-perceptual-loop.md#^ref-71726f04-1497-0) (line 1497, col 0, score 1)
- [Reawakening Duck — L2574](reawakening-duck.md#^ref-59b5670f-2574-0) (line 2574, col 0, score 1)
- [eidolon-node-lifecycle — L1238](eidolon-node-lifecycle.md#^ref-938eca9c-1238-0) (line 1238, col 0, score 1)
- [field-node-diagram-outline — L2544](field-node-diagram-outline.md#^ref-1f32c94a-2544-0) (line 2544, col 0, score 1)
- [field-node-diagram-set — L2531](field-node-diagram-set.md#^ref-22b989d5-2531-0) (line 2531, col 0, score 1)
- [field-node-diagram-visualizations — L2025](field-node-diagram-visualizations.md#^ref-e9b27b06-2025-0) (line 2025, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L1498](ducks-self-referential-perceptual-loop.md#^ref-71726f04-1498-0) (line 1498, col 0, score 1)
- [Reawakening Duck — L2575](reawakening-duck.md#^ref-59b5670f-2575-0) (line 2575, col 0, score 1)
- [eidolon-node-lifecycle — L1239](eidolon-node-lifecycle.md#^ref-938eca9c-1239-0) (line 1239, col 0, score 1)
- [field-node-diagram-outline — L2545](field-node-diagram-outline.md#^ref-1f32c94a-2545-0) (line 2545, col 0, score 1)
- [field-node-diagram-set — L2532](field-node-diagram-set.md#^ref-22b989d5-2532-0) (line 2532, col 0, score 1)
- [field-node-diagram-visualizations — L2026](field-node-diagram-visualizations.md#^ref-e9b27b06-2026-0) (line 2026, col 0, score 1)
- [eidolon-field-math-foundations — L3637](eidolon-field-math-foundations.md#^ref-008f2ac0-3637-0) (line 3637, col 0, score 0.99)
- [field-dynamics-math-blocks — L3954](field-dynamics-math-blocks.md#^ref-7cfc230d-3954-0) (line 3954, col 0, score 0.99)
- [eidolon-node-lifecycle — L1240](eidolon-node-lifecycle.md#^ref-938eca9c-1240-0) (line 1240, col 0, score 1)
- [field-node-diagram-outline — L2546](field-node-diagram-outline.md#^ref-1f32c94a-2546-0) (line 2546, col 0, score 1)
- [field-node-diagram-set — L2533](field-node-diagram-set.md#^ref-22b989d5-2533-0) (line 2533, col 0, score 1)
- [field-node-diagram-visualizations — L2027](field-node-diagram-visualizations.md#^ref-e9b27b06-2027-0) (line 2027, col 0, score 1)
- [eidolon-field-math-foundations — L3638](eidolon-field-math-foundations.md#^ref-008f2ac0-3638-0) (line 3638, col 0, score 1)
- [field-dynamics-math-blocks — L3955](field-dynamics-math-blocks.md#^ref-7cfc230d-3955-0) (line 3955, col 0, score 1)
- [field-interaction-equations — L4052](field-interaction-equations.md#^ref-b09141b7-4052-0) (line 4052, col 0, score 1)
- [Fnord Tracer Protocol — L3399](fnord-tracer-protocol.md#^ref-fc21f824-3399-0) (line 3399, col 0, score 1)
- [Dynamic Context Model for Web Components — L2826](dynamic-context-model-for-web-components.md#^ref-f7702bf8-2826-0) (line 2826, col 0, score 0.99)
- [Synchronicity Waves and Web — L1488](synchronicity-waves-and-web.md#^ref-91295f3a-1488-0) (line 1488, col 0, score 0.99)
- [Debugging Broker Connections and Agent Behavior — L1742](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-1742-0) (line 1742, col 0, score 0.97)
- [Fnord Tracer Protocol — L4172](fnord-tracer-protocol.md#^ref-fc21f824-4172-0) (line 4172, col 0, score 0.97)
- [ParticleSimulationWithCanvasAndFFmpeg — L1985](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-1985-0) (line 1985, col 0, score 0.97)
- [Dynamic Context Model for Web Components — L2827](dynamic-context-model-for-web-components.md#^ref-f7702bf8-2827-0) (line 2827, col 0, score 1)
- [Synchronicity Waves and Web — L1489](synchronicity-waves-and-web.md#^ref-91295f3a-1489-0) (line 1489, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L1406](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-1406-0) (line 1406, col 0, score 0.99)
- [Smoke Resonance Visualizations — L1488](smoke-resonance-visualizations.md#^ref-ac9d3ac5-1488-0) (line 1488, col 0, score 0.99)
- [Duck's Attractor States — L1736](ducks-attractor-states.md#^ref-13951643-1736-0) (line 1736, col 0, score 0.99)
- [Synchronicity Waves and Web — L1490](synchronicity-waves-and-web.md#^ref-91295f3a-1490-0) (line 1490, col 0, score 0.99)
- [Shared — L2053](chunks/shared.md#^ref-623a55f7-2053-0) (line 2053, col 0, score 0.95)
- [Duck's Self-Referential Perceptual Loop — L2723](ducks-self-referential-perceptual-loop.md#^ref-71726f04-2723-0) (line 2723, col 0, score 0.95)
- [Fnord Tracer Protocol — L5536](fnord-tracer-protocol.md#^ref-fc21f824-5536-0) (line 5536, col 0, score 0.95)
- [Migrate to Provider-Tenant Architecture — L9718](migrate-to-provider-tenant-architecture.md#^ref-54382370-9718-0) (line 9718, col 0, score 0.95)
- [plan-update-confirmation — L9133](plan-update-confirmation.md#^ref-b22d79c6-9133-0) (line 9133, col 0, score 0.95)
- [Post-Linguistic Transhuman Design Frameworks — L3062](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-3062-0) (line 3062, col 0, score 0.95)
- [Promethean Data Sync Protocol — L968](promethean-data-sync-protocol.md#^ref-9fab9e76-968-0) (line 968, col 0, score 0.95)
- [Dynamic Context Model for Web Components — L2825](dynamic-context-model-for-web-components.md#^ref-f7702bf8-2825-0) (line 2825, col 0, score 0.99)
- [Synchronicity Waves and Web — L1492](synchronicity-waves-and-web.md#^ref-91295f3a-1492-0) (line 1492, col 0, score 0.99)
- [Duck's Attractor States — L1701](ducks-attractor-states.md#^ref-13951643-1701-0) (line 1701, col 0, score 0.98)
- [Fnord Tracer Protocol — L3244](fnord-tracer-protocol.md#^ref-fc21f824-3244-0) (line 3244, col 0, score 0.98)
- [Model Selection for Lightweight Conversational Tasks — L2301](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-2301-0) (line 2301, col 0, score 0.98)
- [eidolon-field-math-foundations — L1999](eidolon-field-math-foundations.md#^ref-008f2ac0-1999-0) (line 1999, col 0, score 0.99)
- [Eidolon Field Abstract Model — L2810](eidolon-field-abstract-model.md#^ref-5e8b2388-2810-0) (line 2810, col 0, score 0.99)
- [Stateful Partitions and Rebalancing — L2847](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-2847-0) (line 2847, col 0, score 0.99)
- [TypeScript Patch for Tool Calling Support — L2460](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-2460-0) (line 2460, col 0, score 0.99)
- [Synchronicity Waves and Web — L1486](synchronicity-waves-and-web.md#^ref-91295f3a-1486-0) (line 1486, col 0, score 1)
- [Dynamic Context Model for Web Components — L3168](dynamic-context-model-for-web-components.md#^ref-f7702bf8-3168-0) (line 3168, col 0, score 0.99)
- [Promethean Infrastructure Setup — L3382](promethean-infrastructure-setup.md#^ref-6deed6ac-3382-0) (line 3382, col 0, score 0.99)
- [Redirecting Standard Error — L1381](redirecting-standard-error.md#^ref-b3555ede-1381-0) (line 1381, col 0, score 0.99)
- [eidolon-field-math-foundations — L3237](eidolon-field-math-foundations.md#^ref-008f2ac0-3237-0) (line 3237, col 0, score 0.98)
- [Promethean Dev Workflow Update — L1900](promethean-dev-workflow-update.md#^ref-03a5578f-1900-0) (line 1900, col 0, score 0.98)
- [Stateful Partitions and Rebalancing — L3690](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-3690-0) (line 3690, col 0, score 0.98)
- [Protocol_0_The_Contradiction_Engine — L2552](protocol-0-the-contradiction-engine.md#^ref-9a93a756-2552-0) (line 2552, col 0, score 0.99)
- [Layer1SurvivabilityEnvelope — L3337](layer1survivabilityenvelope.md#^ref-64a9f9f9-3337-0) (line 3337, col 0, score 0.99)
- [Promethean Infrastructure Setup — L2883](promethean-infrastructure-setup.md#^ref-6deed6ac-2883-0) (line 2883, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L12321](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-12321-0) (line 12321, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L2984](dynamic-context-model-for-web-components.md#^ref-f7702bf8-2984-0) (line 2984, col 0, score 0.99)
- [field-node-diagram-set — L2261](field-node-diagram-set.md#^ref-22b989d5-2261-0) (line 2261, col 0, score 0.99)
- [Fnord Tracer Protocol — L3933](fnord-tracer-protocol.md#^ref-fc21f824-3933-0) (line 3933, col 0, score 0.99)
- [plan-update-confirmation — L5231](plan-update-confirmation.md#^ref-b22d79c6-5231-0) (line 5231, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L2767](chroma-toolkit-consolidation-plan.md#^ref-5020e892-2767-0) (line 2767, col 0, score 0.99)
- [Stateful Partitions and Rebalancing — L2760](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-2760-0) (line 2760, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L2830](dynamic-context-model-for-web-components.md#^ref-f7702bf8-2830-0) (line 2830, col 0, score 0.98)
- [Factorio AI with External Agents — L1846](factorio-ai-with-external-agents.md#^ref-a4d90289-1846-0) (line 1846, col 0, score 0.98)
- [Chroma Toolkit Consolidation Plan — L2797](chroma-toolkit-consolidation-plan.md#^ref-5020e892-2797-0) (line 2797, col 0, score 0.98)
- [field-dynamics-math-blocks — L3453](field-dynamics-math-blocks.md#^ref-7cfc230d-3453-0) (line 3453, col 0, score 0.98)
- [field-node-diagram-outline — L2332](field-node-diagram-outline.md#^ref-1f32c94a-2332-0) (line 2332, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L3646](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-3646-0) (line 3646, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L1976](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-1976-0) (line 1976, col 0, score 0.97)
- [typed-struct-compiler — L4901](typed-struct-compiler.md#^ref-78eeedf7-4901-0) (line 4901, col 0, score 0.97)
- [TypeScript Patch for Tool Calling Support — L3787](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-3787-0) (line 3787, col 0, score 0.97)
- [Unique Concepts — L1461](unique-concepts.md#^ref-ed6f3fc9-1461-0) (line 1461, col 0, score 0.97)
- [Unique Concepts — L1452](unique-concepts.md#^ref-ed6f3fc9-1452-0) (line 1452, col 0, score 0.97)
- [Unique Info Dump Index — L5634](unique-info-dump-index.md#^ref-30ec3ba6-5634-0) (line 5634, col 0, score 0.97)
- [plan-update-confirmation — L2821](plan-update-confirmation.md#^ref-b22d79c6-2821-0) (line 2821, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L2269](migrate-to-provider-tenant-architecture.md#^ref-54382370-2269-0) (line 2269, col 0, score 0.99)
- [Services — L2256](chunks/services.md#^ref-75ea4a6a-2256-0) (line 2256, col 0, score 0.99)
- [Debugging Broker Connections and Agent Behavior — L3274](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-3274-0) (line 3274, col 0, score 0.99)
- [eidolon-field-math-foundations — L6585](eidolon-field-math-foundations.md#^ref-008f2ac0-6585-0) (line 6585, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L2134](chroma-toolkit-consolidation-plan.md#^ref-5020e892-2134-0) (line 2134, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L2891](chroma-toolkit-consolidation-plan.md#^ref-5020e892-2891-0) (line 2891, col 0, score 0.98)
- [i3-bluetooth-setup — L2735](i3-bluetooth-setup.md#^ref-5e408692-2735-0) (line 2735, col 0, score 0.98)
- [Promethean-Copilot-Intent-Engine — L3749](promethean-copilot-intent-engine.md#^ref-ae24a280-3749-0) (line 3749, col 0, score 0.98)
- [plan-update-confirmation — L4278](plan-update-confirmation.md#^ref-b22d79c6-4278-0) (line 4278, col 0, score 0.98)
- [Prompt_Folder_Bootstrap — L2382](prompt-folder-bootstrap.md#^ref-bd4f0976-2382-0) (line 2382, col 0, score 0.98)
- [Docops Feature Updates — L1322](docops-feature-updates-2.md#^ref-cdbd21ee-1322-0) (line 1322, col 0, score 0.99)
- [Docops Feature Updates — L1576](docops-feature-updates.md#^ref-2792d448-1576-0) (line 1576, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L4916](dynamic-context-model-for-web-components.md#^ref-f7702bf8-4916-0) (line 4916, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L7301](dynamic-context-model-for-web-components.md#^ref-f7702bf8-7301-0) (line 7301, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration Guide — L2192](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-2192-0) (line 2192, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration — L2135](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-2135-0) (line 2135, col 0, score 0.99)
- [Factorio AI with External Agents — L1941](factorio-ai-with-external-agents.md#^ref-a4d90289-1941-0) (line 1941, col 0, score 0.99)
- [ParticleSimulationWithCanvasAndFFmpeg — L2042](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-2042-0) (line 2042, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L2586](chroma-toolkit-consolidation-plan.md#^ref-5020e892-2586-0) (line 2586, col 0, score 0.98)
- [Eidolon Field Abstract Model — L1604](eidolon-field-abstract-model.md#^ref-5e8b2388-1604-0) (line 1604, col 0, score 0.99)
- [schema-evolution-workflow — L2276](schema-evolution-workflow.md#^ref-d8059b6a-2276-0) (line 2276, col 0, score 0.99)
- [TypeScript Patch for Tool Calling Support — L2703](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-2703-0) (line 2703, col 0, score 0.99)
- [Promethean Infrastructure Setup — L2592](promethean-infrastructure-setup.md#^ref-6deed6ac-2592-0) (line 2592, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L1678](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-1678-0) (line 1678, col 0, score 0.99)
- [Eidolon Field Abstract Model — L2515](eidolon-field-abstract-model.md#^ref-5e8b2388-2515-0) (line 2515, col 0, score 1)
- [field-interaction-equations — L1686](field-interaction-equations.md#^ref-b09141b7-1686-0) (line 1686, col 0, score 1)
- [Eidolon Field Abstract Model — L2513](eidolon-field-abstract-model.md#^ref-5e8b2388-2513-0) (line 2513, col 0, score 0.99)
- [field-interaction-equations — L1685](field-interaction-equations.md#^ref-b09141b7-1685-0) (line 1685, col 0, score 0.99)
- [Eidolon Field Abstract Model — L2514](eidolon-field-abstract-model.md#^ref-5e8b2388-2514-0) (line 2514, col 0, score 0.99)
- [field-interaction-equations — L1684](field-interaction-equations.md#^ref-b09141b7-1684-0) (line 1684, col 0, score 0.99)
- [Fnord Tracer Protocol — L4188](fnord-tracer-protocol.md#^ref-fc21f824-4188-0) (line 4188, col 0, score 0.99)
- [Eidolon Field Abstract Model — L2518](eidolon-field-abstract-model.md#^ref-5e8b2388-2518-0) (line 2518, col 0, score 1)
- [field-interaction-equations — L1689](field-interaction-equations.md#^ref-b09141b7-1689-0) (line 1689, col 0, score 1)
- [Fnord Tracer Protocol — L4189](fnord-tracer-protocol.md#^ref-fc21f824-4189-0) (line 4189, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L2439](migrate-to-provider-tenant-architecture.md#^ref-54382370-2439-0) (line 2439, col 0, score 1)
- [field-interaction-equations — L1683](field-interaction-equations.md#^ref-b09141b7-1683-0) (line 1683, col 0, score 1)
- [Fnord Tracer Protocol — L4187](fnord-tracer-protocol.md#^ref-fc21f824-4187-0) (line 4187, col 0, score 1)
- [Eidolon Field Abstract Model — L2517](eidolon-field-abstract-model.md#^ref-5e8b2388-2517-0) (line 2517, col 0, score 1)
- [field-interaction-equations — L1688](field-interaction-equations.md#^ref-b09141b7-1688-0) (line 1688, col 0, score 1)
- [Fnord Tracer Protocol — L4190](fnord-tracer-protocol.md#^ref-fc21f824-4190-0) (line 4190, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L1626](layer1survivabilityenvelope.md#^ref-64a9f9f9-1626-0) (line 1626, col 0, score 1)
- [Unique Info Dump Index — L2639](unique-info-dump-index.md#^ref-30ec3ba6-2639-0) (line 2639, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L2963](dynamic-context-model-for-web-components.md#^ref-f7702bf8-2963-0) (line 2963, col 0, score 0.98)
- [Factorio AI with External Agents — L3482](factorio-ai-with-external-agents.md#^ref-a4d90289-3482-0) (line 3482, col 0, score 0.98)
- [homeostasis-decay-formulas — L3692](homeostasis-decay-formulas.md#^ref-37b5d236-3692-0) (line 3692, col 0, score 0.98)
- [Mathematical Samplers — L1447](mathematical-samplers.md#^ref-86a691ec-1447-0) (line 1447, col 0, score 0.98)
- [schema-evolution-workflow — L2053](schema-evolution-workflow.md#^ref-d8059b6a-2053-0) (line 2053, col 0, score 0.98)
- [Promethean Pipelines — L2527](promethean-pipelines.md#^ref-8b8e6103-2527-0) (line 2527, col 0, score 0.98)
- [promethean-requirements — L1082](promethean-requirements.md#^ref-95205cd3-1082-0) (line 1082, col 0, score 0.98)
- [Pure TypeScript Search Microservice — L3575](pure-typescript-search-microservice.md#^ref-d17d3a96-3575-0) (line 3575, col 0, score 0.98)
- [Fnord Tracer Protocol — L4037](fnord-tracer-protocol.md#^ref-fc21f824-4037-0) (line 4037, col 0, score 0.98)
- [Promethean Documentation Pipeline Overview — L2860](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-2860-0) (line 2860, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L2491](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2491-0) (line 2491, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L2763](dynamic-context-model-for-web-components.md#^ref-f7702bf8-2763-0) (line 2763, col 0, score 0.99)
- [Factorio AI with External Agents — L3111](factorio-ai-with-external-agents.md#^ref-a4d90289-3111-0) (line 3111, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L2151](migrate-to-provider-tenant-architecture.md#^ref-54382370-2151-0) (line 2151, col 0, score 0.99)
- [Layer1SurvivabilityEnvelope — L3073](layer1survivabilityenvelope.md#^ref-64a9f9f9-3073-0) (line 3073, col 0, score 0.97)
- [sibilant-macro-targets — L2921](sibilant-macro-targets.md#^ref-c5c9a5c6-2921-0) (line 2921, col 0, score 0.97)
- [typed-struct-compiler — L2431](typed-struct-compiler.md#^ref-78eeedf7-2431-0) (line 2431, col 0, score 0.97)
- [Chroma Toolkit Consolidation Plan — L1788](chroma-toolkit-consolidation-plan.md#^ref-5020e892-1788-0) (line 1788, col 0, score 0.97)
- [komorebi-group-window-hack — L1990](komorebi-group-window-hack.md#^ref-dd89372d-1990-0) (line 1990, col 0, score 0.97)
- [plan-update-confirmation — L6419](plan-update-confirmation.md#^ref-b22d79c6-6419-0) (line 6419, col 0, score 0.98)
- [eidolon-field-math-foundations — L3479](eidolon-field-math-foundations.md#^ref-008f2ac0-3479-0) (line 3479, col 0, score 0.99)
- [field-dynamics-math-blocks — L1638](field-dynamics-math-blocks.md#^ref-7cfc230d-1638-0) (line 1638, col 0, score 0.99)
- [field-interaction-equations — L2135](field-interaction-equations.md#^ref-b09141b7-2135-0) (line 2135, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L2877](chroma-toolkit-consolidation-plan.md#^ref-5020e892-2877-0) (line 2877, col 0, score 0.98)
- [Performance-Optimized-Polyglot-Bridge — L4125](performance-optimized-polyglot-bridge.md#^ref-f5579967-4125-0) (line 4125, col 0, score 0.98)
- [Stateful Partitions and Rebalancing — L2960](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-2960-0) (line 2960, col 0, score 0.98)
- [eidolon-field-math-foundations — L14785](eidolon-field-math-foundations.md#^ref-008f2ac0-14785-0) (line 14785, col 0, score 0.98)
- [Performance-Optimized-Polyglot-Bridge — L2321](performance-optimized-polyglot-bridge.md#^ref-f5579967-2321-0) (line 2321, col 0, score 0.98)
- [komorebi-group-window-hack — L1767](komorebi-group-window-hack.md#^ref-dd89372d-1767-0) (line 1767, col 0, score 0.98)
- [Provider-Agnostic Chat Panel Implementation — L2918](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-2918-0) (line 2918, col 0, score 0.98)
- [Diagrams — L2691](chunks/diagrams.md#^ref-45cd25b5-2691-0) (line 2691, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L4900](migrate-to-provider-tenant-architecture.md#^ref-54382370-4900-0) (line 4900, col 0, score 0.98)
- [Promethean Infrastructure Setup — L5525](promethean-infrastructure-setup.md#^ref-6deed6ac-5525-0) (line 5525, col 0, score 0.98)
- [Unique Info Dump Index — L8179](unique-info-dump-index.md#^ref-30ec3ba6-8179-0) (line 8179, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L3706](dynamic-context-model-for-web-components.md#^ref-f7702bf8-3706-0) (line 3706, col 0, score 0.98)
- [Per-Domain Policy System for JS Crawler — L2050](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-2050-0) (line 2050, col 0, score 0.98)
- [Promethean Infrastructure Setup — L3979](promethean-infrastructure-setup.md#^ref-6deed6ac-3979-0) (line 3979, col 0, score 0.98)
- [Pure TypeScript Search Microservice — L2102](pure-typescript-search-microservice.md#^ref-d17d3a96-2102-0) (line 2102, col 0, score 0.98)
- [Fnord Tracer Protocol — L4345](fnord-tracer-protocol.md#^ref-fc21f824-4345-0) (line 4345, col 0, score 0.98)
- [Layer1SurvivabilityEnvelope — L2762](layer1survivabilityenvelope.md#^ref-64a9f9f9-2762-0) (line 2762, col 0, score 0.98)
- [Promethean State Format — L2051](promethean-state-format.md#^ref-23df6ddb-2051-0) (line 2051, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L2480](migrate-to-provider-tenant-architecture.md#^ref-54382370-2480-0) (line 2480, col 0, score 0.99)
- [Layer1SurvivabilityEnvelope — L3250](layer1survivabilityenvelope.md#^ref-64a9f9f9-3250-0) (line 3250, col 0, score 0.99)
- [Model Upgrade Calm-Down Guide — L1753](model-upgrade-calm-down-guide.md#^ref-db74343f-1753-0) (line 1753, col 0, score 0.99)
- [Promethean Dev Workflow Update — L2364](promethean-dev-workflow-update.md#^ref-03a5578f-2364-0) (line 2364, col 0, score 0.99)
- [Promethean Infrastructure Setup — L2180](promethean-infrastructure-setup.md#^ref-6deed6ac-2180-0) (line 2180, col 0, score 0.99)
- [polyglot-repl-interface-layer — L1605](polyglot-repl-interface-layer.md#^ref-9c79206d-1605-0) (line 1605, col 0, score 0.99)
- [Functional Embedding Pipeline Refactor — L2771](functional-embedding-pipeline-refactor.md#^ref-a4a25141-2771-0) (line 2771, col 0, score 0.99)
- [Promethean Dev Workflow Update — L25659](promethean-dev-workflow-update.md#^ref-03a5578f-25659-0) (line 25659, col 0, score 1)
- [eidolon-field-math-foundations — L25608](eidolon-field-math-foundations.md#^ref-008f2ac0-25608-0) (line 25608, col 0, score 1)
- [Promethean Dev Workflow Update — L25763](promethean-dev-workflow-update.md#^ref-03a5578f-25763-0) (line 25763, col 0, score 1)
- [eidolon-field-math-foundations — L25602](eidolon-field-math-foundations.md#^ref-008f2ac0-25602-0) (line 25602, col 0, score 0.99)
- [Promethean Dev Workflow Update — L19563](promethean-dev-workflow-update.md#^ref-03a5578f-19563-0) (line 19563, col 0, score 0.99)
- [Creative Moments — L11769](creative-moments.md#^ref-10d98225-11769-0) (line 11769, col 0, score 0.99)
- [Factorio AI with External Agents — L3254](factorio-ai-with-external-agents.md#^ref-a4d90289-3254-0) (line 3254, col 0, score 0.99)
- [Ice Box Reorganization — L2446](ice-box-reorganization.md#^ref-291c7d91-2446-0) (line 2446, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L1884](migrate-to-provider-tenant-architecture.md#^ref-54382370-1884-0) (line 1884, col 0, score 0.99)
- [OpenAPI Validation Report — L999](openapi-validation-report.md#^ref-5c152b08-999-0) (line 999, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L3567](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3567-0) (line 3567, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L2472](promethean-copilot-intent-engine.md#^ref-ae24a280-2472-0) (line 2472, col 0, score 0.99)
- [Prometheus Observability Stack — L2138](prometheus-observability-stack.md#^ref-e90b5a16-2138-0) (line 2138, col 0, score 0.99)
- [TypeScript Patch for Tool Calling Support — L2300](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-2300-0) (line 2300, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L2474](promethean-copilot-intent-engine.md#^ref-ae24a280-2474-0) (line 2474, col 0, score 0.99)
- [Promethean Infrastructure Setup — L2573](promethean-infrastructure-setup.md#^ref-6deed6ac-2573-0) (line 2573, col 0, score 0.99)
- [Unique Info Dump Index — L3201](unique-info-dump-index.md#^ref-30ec3ba6-3201-0) (line 3201, col 0, score 0.98)
- [zero-copy-snapshots-and-workers — L2013](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-2013-0) (line 2013, col 0, score 0.98)
- [homeostasis-decay-formulas — L6304](homeostasis-decay-formulas.md#^ref-37b5d236-6304-0) (line 6304, col 0, score 0.97)
- [Model Selection for Lightweight Conversational Tasks — L4796](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-4796-0) (line 4796, col 0, score 0.97)
- [zero-copy-snapshots-and-workers — L3589](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-3589-0) (line 3589, col 0, score 0.97)
- [Factorio AI with External Agents — L3258](factorio-ai-with-external-agents.md#^ref-a4d90289-3258-0) (line 3258, col 0, score 0.99)
- [Ice Box Reorganization — L2450](ice-box-reorganization.md#^ref-291c7d91-2450-0) (line 2450, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L1885](migrate-to-provider-tenant-architecture.md#^ref-54382370-1885-0) (line 1885, col 0, score 0.99)
- [OpenAPI Validation Report — L994](openapi-validation-report.md#^ref-5c152b08-994-0) (line 994, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L3571](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3571-0) (line 3571, col 0, score 0.99)
- [Promethean Infrastructure Setup — L2575](promethean-infrastructure-setup.md#^ref-6deed6ac-2575-0) (line 2575, col 0, score 0.99)
- [Prometheus Observability Stack — L2140](prometheus-observability-stack.md#^ref-e90b5a16-2140-0) (line 2140, col 0, score 0.99)
- [plan-update-confirmation — L4024](plan-update-confirmation.md#^ref-b22d79c6-4024-0) (line 4024, col 0, score 1)
- [Ice Box Reorganization — L2445](ice-box-reorganization.md#^ref-291c7d91-2445-0) (line 2445, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L1886](migrate-to-provider-tenant-architecture.md#^ref-54382370-1886-0) (line 1886, col 0, score 0.99)
- [OpenAPI Validation Report — L1000](openapi-validation-report.md#^ref-5c152b08-1000-0) (line 1000, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L3568](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3568-0) (line 3568, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L2475](promethean-copilot-intent-engine.md#^ref-ae24a280-2475-0) (line 2475, col 0, score 0.99)
- [Promethean Infrastructure Setup — L2570](promethean-infrastructure-setup.md#^ref-6deed6ac-2570-0) (line 2570, col 0, score 0.99)
- [Factorio AI with External Agents — L3256](factorio-ai-with-external-agents.md#^ref-a4d90289-3256-0) (line 3256, col 0, score 0.99)
- [Ice Box Reorganization — L2449](ice-box-reorganization.md#^ref-291c7d91-2449-0) (line 2449, col 0, score 0.99)
- [OpenAPI Validation Report — L997](openapi-validation-report.md#^ref-5c152b08-997-0) (line 997, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L3569](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3569-0) (line 3569, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L2471](promethean-copilot-intent-engine.md#^ref-ae24a280-2471-0) (line 2471, col 0, score 0.99)
- [Promethean Infrastructure Setup — L2572](promethean-infrastructure-setup.md#^ref-6deed6ac-2572-0) (line 2572, col 0, score 0.99)
- [Prometheus Observability Stack — L2141](prometheus-observability-stack.md#^ref-e90b5a16-2141-0) (line 2141, col 0, score 0.99)
- [Model Selection for Lightweight Conversational Tasks — L3569](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-3569-0) (line 3569, col 0, score 1)
- [Promethean State Format — L2682](promethean-state-format.md#^ref-23df6ddb-2682-0) (line 2682, col 0, score 1)
- [windows-tiling-with-autohotkey — L2020](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2020-0) (line 2020, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L3254](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-3254-0) (line 3254, col 0, score 0.99)
- [Promethean State Format — L2681](promethean-state-format.md#^ref-23df6ddb-2681-0) (line 2681, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L2019](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2019-0) (line 2019, col 0, score 0.99)
- [ts-to-lisp-transpiler — L1429](ts-to-lisp-transpiler.md#^ref-ba11486b-1429-0) (line 1429, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L1760](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-1760-0) (line 1760, col 0, score 0.97)
- [Unique Info Dump Index — L3704](unique-info-dump-index.md#^ref-30ec3ba6-3704-0) (line 3704, col 0, score 0.96)
- [Model Selection for Lightweight Conversational Tasks — L3255](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-3255-0) (line 3255, col 0, score 0.99)
- [Promethean State Format — L2679](promethean-state-format.md#^ref-23df6ddb-2679-0) (line 2679, col 0, score 0.99)
- [Model Selection for Lightweight Conversational Tasks — L3253](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-3253-0) (line 3253, col 0, score 0.99)
- [Promethean State Format — L2678](promethean-state-format.md#^ref-23df6ddb-2678-0) (line 2678, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L2017](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2017-0) (line 2017, col 0, score 0.99)
- [Model Selection for Lightweight Conversational Tasks — L3256](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-3256-0) (line 3256, col 0, score 0.99)
- [Promethean State Format — L2695](promethean-state-format.md#^ref-23df6ddb-2695-0) (line 2695, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L2022](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2022-0) (line 2022, col 0, score 0.99)
- [eidolon-field-math-foundations — L28177](eidolon-field-math-foundations.md#^ref-008f2ac0-28177-0) (line 28177, col 0, score 0.99)
- [Promethean Chat Activity Report — L14633](promethean-chat-activity-report.md#^ref-18344cf9-14633-0) (line 14633, col 0, score 0.99)
- [Promethean Dev Workflow Update — L26632](promethean-dev-workflow-update.md#^ref-03a5578f-26632-0) (line 26632, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L2024](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2024-0) (line 2024, col 0, score 1)
- [plan-update-confirmation — L5439](plan-update-confirmation.md#^ref-b22d79c6-5439-0) (line 5439, col 0, score 0.99)
- [Eidolon Field Abstract Model — L2057](eidolon-field-abstract-model.md#^ref-5e8b2388-2057-0) (line 2057, col 0, score 0.99)
- [Factorio AI with External Agents — L3458](factorio-ai-with-external-agents.md#^ref-a4d90289-3458-0) (line 3458, col 0, score 0.99)
- [homeostasis-decay-formulas — L3258](homeostasis-decay-formulas.md#^ref-37b5d236-3258-0) (line 3258, col 0, score 0.99)
- [i3-bluetooth-setup — L2907](i3-bluetooth-setup.md#^ref-5e408692-2907-0) (line 2907, col 0, score 0.99)
- [Functional Refactor of TypeScript Document Processing — L1657](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-1657-0) (line 1657, col 0, score 0.99)
- [Docops Feature Updates — L956](docops-feature-updates-2.md#^ref-cdbd21ee-956-0) (line 956, col 0, score 0.98)
- [Docops Feature Updates — L1216](docops-feature-updates.md#^ref-2792d448-1216-0) (line 1216, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L4315](dynamic-context-model-for-web-components.md#^ref-f7702bf8-4315-0) (line 4315, col 0, score 0.98)
- [Fnord Tracer Protocol — L2687](fnord-tracer-protocol.md#^ref-fc21f824-2687-0) (line 2687, col 0, score 0.98)
- [plan-update-confirmation — L3694](plan-update-confirmation.md#^ref-b22d79c6-3694-0) (line 3694, col 0, score 0.98)
- [Functional Refactor of TypeScript Document Processing — L1626](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-1626-0) (line 1626, col 0, score 0.99)
- [Promethean Dev Workflow Update — L1628](promethean-dev-workflow-update.md#^ref-03a5578f-1628-0) (line 1628, col 0, score 0.99)
- [Prompt_Folder_Bootstrap — L3273](prompt-folder-bootstrap.md#^ref-bd4f0976-3273-0) (line 3273, col 0, score 0.99)
- [zero-copy-snapshots-and-workers — L2918](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-2918-0) (line 2918, col 0, score 0.99)
- [field-interaction-equations — L3612](field-interaction-equations.md#^ref-b09141b7-3612-0) (line 3612, col 0, score 0.98)
- [Promethean Dev Workflow Update — L1936](promethean-dev-workflow-update.md#^ref-03a5578f-1936-0) (line 1936, col 0, score 0.98)
- [typed-struct-compiler — L3152](typed-struct-compiler.md#^ref-78eeedf7-3152-0) (line 3152, col 0, score 0.98)
- [Promethean Pipelines — L2631](promethean-pipelines.md#^ref-8b8e6103-2631-0) (line 2631, col 0, score 1)
- [field-dynamics-math-blocks — L2258](field-dynamics-math-blocks.md#^ref-7cfc230d-2258-0) (line 2258, col 0, score 0.99)
- [Fnord Tracer Protocol — L3604](fnord-tracer-protocol.md#^ref-fc21f824-3604-0) (line 3604, col 0, score 0.99)
- [i3-bluetooth-setup — L2502](i3-bluetooth-setup.md#^ref-5e408692-2502-0) (line 2502, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L4188](migrate-to-provider-tenant-architecture.md#^ref-54382370-4188-0) (line 4188, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L3231](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3231-0) (line 3231, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L1963](performance-optimized-polyglot-bridge.md#^ref-f5579967-1963-0) (line 1963, col 0, score 0.99)
- [Promethean Pipelines — L2632](promethean-pipelines.md#^ref-8b8e6103-2632-0) (line 2632, col 0, score 1)
- [Dynamic Context Model for Web Components — L3084](dynamic-context-model-for-web-components.md#^ref-f7702bf8-3084-0) (line 3084, col 0, score 0.99)
- [field-dynamics-math-blocks — L2259](field-dynamics-math-blocks.md#^ref-7cfc230d-2259-0) (line 2259, col 0, score 0.99)
- [i3-bluetooth-setup — L2503](i3-bluetooth-setup.md#^ref-5e408692-2503-0) (line 2503, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L4189](migrate-to-provider-tenant-architecture.md#^ref-54382370-4189-0) (line 4189, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L3232](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3232-0) (line 3232, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L1964](performance-optimized-polyglot-bridge.md#^ref-f5579967-1964-0) (line 1964, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L3085](dynamic-context-model-for-web-components.md#^ref-f7702bf8-3085-0) (line 3085, col 0, score 0.99)
- [field-dynamics-math-blocks — L2260](field-dynamics-math-blocks.md#^ref-7cfc230d-2260-0) (line 2260, col 0, score 0.99)
- [Fnord Tracer Protocol — L3605](fnord-tracer-protocol.md#^ref-fc21f824-3605-0) (line 3605, col 0, score 0.99)
- [i3-bluetooth-setup — L2504](i3-bluetooth-setup.md#^ref-5e408692-2504-0) (line 2504, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L3233](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3233-0) (line 3233, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L1965](performance-optimized-polyglot-bridge.md#^ref-f5579967-1965-0) (line 1965, col 0, score 0.99)
- [Promethean Chat Activity Report — L1500](promethean-chat-activity-report.md#^ref-18344cf9-1500-0) (line 1500, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L3086](dynamic-context-model-for-web-components.md#^ref-f7702bf8-3086-0) (line 3086, col 0, score 0.99)
- [field-dynamics-math-blocks — L2261](field-dynamics-math-blocks.md#^ref-7cfc230d-2261-0) (line 2261, col 0, score 0.99)
- [Fnord Tracer Protocol — L3606](fnord-tracer-protocol.md#^ref-fc21f824-3606-0) (line 3606, col 0, score 0.99)
- [i3-bluetooth-setup — L2505](i3-bluetooth-setup.md#^ref-5e408692-2505-0) (line 2505, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L4190](migrate-to-provider-tenant-architecture.md#^ref-54382370-4190-0) (line 4190, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L3234](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3234-0) (line 3234, col 0, score 0.99)
- [Promethean Chat Activity Report — L1501](promethean-chat-activity-report.md#^ref-18344cf9-1501-0) (line 1501, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L3087](dynamic-context-model-for-web-components.md#^ref-f7702bf8-3087-0) (line 3087, col 0, score 0.99)
- [field-dynamics-math-blocks — L2262](field-dynamics-math-blocks.md#^ref-7cfc230d-2262-0) (line 2262, col 0, score 0.99)
- [Fnord Tracer Protocol — L3607](fnord-tracer-protocol.md#^ref-fc21f824-3607-0) (line 3607, col 0, score 0.99)
- [i3-bluetooth-setup — L2506](i3-bluetooth-setup.md#^ref-5e408692-2506-0) (line 2506, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L4191](migrate-to-provider-tenant-architecture.md#^ref-54382370-4191-0) (line 4191, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L3235](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3235-0) (line 3235, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L1966](performance-optimized-polyglot-bridge.md#^ref-f5579967-1966-0) (line 1966, col 0, score 0.99)
- [Promethean Pipelines — L2628](promethean-pipelines.md#^ref-8b8e6103-2628-0) (line 2628, col 0, score 1)
- [Dynamic Context Model for Web Components — L3089](dynamic-context-model-for-web-components.md#^ref-f7702bf8-3089-0) (line 3089, col 0, score 0.99)
- [Fnord Tracer Protocol — L3609](fnord-tracer-protocol.md#^ref-fc21f824-3609-0) (line 3609, col 0, score 0.99)
- [i3-bluetooth-setup — L2578](i3-bluetooth-setup.md#^ref-5e408692-2578-0) (line 2578, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L4192](migrate-to-provider-tenant-architecture.md#^ref-54382370-4192-0) (line 4192, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L1968](performance-optimized-polyglot-bridge.md#^ref-f5579967-1968-0) (line 1968, col 0, score 0.99)
- [Promethean Chat Activity Report — L1505](promethean-chat-activity-report.md#^ref-18344cf9-1505-0) (line 1505, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L4136](chroma-toolkit-consolidation-plan.md#^ref-5020e892-4136-0) (line 4136, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L7382](migrate-to-provider-tenant-architecture.md#^ref-54382370-7382-0) (line 7382, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L1827](performance-optimized-polyglot-bridge.md#^ref-f5579967-1827-0) (line 1827, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L2785](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-2785-0) (line 2785, col 0, score 1)
- [Promethean Pipelines — L3646](promethean-pipelines.md#^ref-8b8e6103-3646-0) (line 3646, col 0, score 1)
- [zero-copy-snapshots-and-workers — L2625](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-2625-0) (line 2625, col 0, score 1)
- [Diagrams — L3658](chunks/diagrams.md#^ref-45cd25b5-3658-0) (line 3658, col 0, score 0.99)
- [DSL — L3771](chunks/dsl.md#^ref-e87bc036-3771-0) (line 3771, col 0, score 0.99)
- [Math Fundamentals — L3756](chunks/math-fundamentals.md#^ref-c6e87433-3756-0) (line 3756, col 0, score 0.99)
- [Services — L3423](chunks/services.md#^ref-75ea4a6a-3423-0) (line 3423, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L4137](chroma-toolkit-consolidation-plan.md#^ref-5020e892-4137-0) (line 4137, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L7383](migrate-to-provider-tenant-architecture.md#^ref-54382370-7383-0) (line 7383, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L1828](performance-optimized-polyglot-bridge.md#^ref-f5579967-1828-0) (line 1828, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L2786](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-2786-0) (line 2786, col 0, score 1)
- [Promethean Pipelines — L3647](promethean-pipelines.md#^ref-8b8e6103-3647-0) (line 3647, col 0, score 1)
- [zero-copy-snapshots-and-workers — L2626](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-2626-0) (line 2626, col 0, score 1)
- [Diagrams — L3659](chunks/diagrams.md#^ref-45cd25b5-3659-0) (line 3659, col 0, score 0.99)
- [DSL — L3772](chunks/dsl.md#^ref-e87bc036-3772-0) (line 3772, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L4138](chroma-toolkit-consolidation-plan.md#^ref-5020e892-4138-0) (line 4138, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L7384](migrate-to-provider-tenant-architecture.md#^ref-54382370-7384-0) (line 7384, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L1829](performance-optimized-polyglot-bridge.md#^ref-f5579967-1829-0) (line 1829, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L2787](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-2787-0) (line 2787, col 0, score 1)
- [Promethean Pipelines — L3648](promethean-pipelines.md#^ref-8b8e6103-3648-0) (line 3648, col 0, score 1)
- [zero-copy-snapshots-and-workers — L2627](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-2627-0) (line 2627, col 0, score 1)
- [JavaScript — L3714](chunks/javascript.md#^ref-c1618c66-3714-0) (line 3714, col 0, score 1)
- [Simulation Demo — L3193](chunks/simulation-demo.md#^ref-557309a3-3193-0) (line 3193, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L4140](chroma-toolkit-consolidation-plan.md#^ref-5020e892-4140-0) (line 4140, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L7386](migrate-to-provider-tenant-architecture.md#^ref-54382370-7386-0) (line 7386, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L1831](performance-optimized-polyglot-bridge.md#^ref-f5579967-1831-0) (line 1831, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L2789](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-2789-0) (line 2789, col 0, score 1)
- [Promethean Pipelines — L3650](promethean-pipelines.md#^ref-8b8e6103-3650-0) (line 3650, col 0, score 1)
- [zero-copy-snapshots-and-workers — L2629](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-2629-0) (line 2629, col 0, score 1)
- [eidolon-node-lifecycle — L3761](eidolon-node-lifecycle.md#^ref-938eca9c-3761-0) (line 3761, col 0, score 1)
- [field-dynamics-math-blocks — L6277](field-dynamics-math-blocks.md#^ref-7cfc230d-6277-0) (line 6277, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L4141](chroma-toolkit-consolidation-plan.md#^ref-5020e892-4141-0) (line 4141, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L7387](migrate-to-provider-tenant-architecture.md#^ref-54382370-7387-0) (line 7387, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L1832](performance-optimized-polyglot-bridge.md#^ref-f5579967-1832-0) (line 1832, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L2790](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-2790-0) (line 2790, col 0, score 1)
- [Promethean Pipelines — L3651](promethean-pipelines.md#^ref-8b8e6103-3651-0) (line 3651, col 0, score 1)
- [zero-copy-snapshots-and-workers — L2630](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-2630-0) (line 2630, col 0, score 1)
- [Diagrams — L3663](chunks/diagrams.md#^ref-45cd25b5-3663-0) (line 3663, col 0, score 1)
- [DSL — L3776](chunks/dsl.md#^ref-e87bc036-3776-0) (line 3776, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L4142](chroma-toolkit-consolidation-plan.md#^ref-5020e892-4142-0) (line 4142, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L7388](migrate-to-provider-tenant-architecture.md#^ref-54382370-7388-0) (line 7388, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L1833](performance-optimized-polyglot-bridge.md#^ref-f5579967-1833-0) (line 1833, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L2791](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-2791-0) (line 2791, col 0, score 1)
- [Promethean Pipelines — L3652](promethean-pipelines.md#^ref-8b8e6103-3652-0) (line 3652, col 0, score 1)
- [zero-copy-snapshots-and-workers — L2631](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-2631-0) (line 2631, col 0, score 1)
- [homeostasis-decay-formulas — L6579](homeostasis-decay-formulas.md#^ref-37b5d236-6579-0) (line 6579, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration — L3199](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-3199-0) (line 3199, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L4143](chroma-toolkit-consolidation-plan.md#^ref-5020e892-4143-0) (line 4143, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L7389](migrate-to-provider-tenant-architecture.md#^ref-54382370-7389-0) (line 7389, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L1834](performance-optimized-polyglot-bridge.md#^ref-f5579967-1834-0) (line 1834, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L2792](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-2792-0) (line 2792, col 0, score 1)
- [Promethean Pipelines — L3653](promethean-pipelines.md#^ref-8b8e6103-3653-0) (line 3653, col 0, score 1)
- [zero-copy-snapshots-and-workers — L2632](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-2632-0) (line 2632, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L2850](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2850-0) (line 2850, col 0, score 0.99)
- [field-dynamics-math-blocks — L6280](field-dynamics-math-blocks.md#^ref-7cfc230d-6280-0) (line 6280, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L4144](chroma-toolkit-consolidation-plan.md#^ref-5020e892-4144-0) (line 4144, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L7390](migrate-to-provider-tenant-architecture.md#^ref-54382370-7390-0) (line 7390, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L1835](performance-optimized-polyglot-bridge.md#^ref-f5579967-1835-0) (line 1835, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L2793](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-2793-0) (line 2793, col 0, score 1)
- [Promethean Pipelines — L3654](promethean-pipelines.md#^ref-8b8e6103-3654-0) (line 3654, col 0, score 1)
- [zero-copy-snapshots-and-workers — L2633](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-2633-0) (line 2633, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L2189](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-2189-0) (line 2189, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L3471](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-3471-0) (line 3471, col 0, score 1)
- [Mindful Prioritization — L840](mindful-prioritization.md#^ref-40185d05-840-0) (line 840, col 0, score 0.99)
- [Promethean Dev Workflow Update — L1693](promethean-dev-workflow-update.md#^ref-03a5578f-1693-0) (line 1693, col 0, score 0.99)
- [Promethean Workflow Optimization — L1368](promethean-workflow-optimization.md#^ref-d614d983-1368-0) (line 1368, col 0, score 0.99)
- [Factorio AI with External Agents — L1812](factorio-ai-with-external-agents.md#^ref-a4d90289-1812-0) (line 1812, col 0, score 0.99)
- [Fnord Tracer Protocol — L4225](fnord-tracer-protocol.md#^ref-fc21f824-4225-0) (line 4225, col 0, score 0.99)
- [i3-bluetooth-setup — L2342](i3-bluetooth-setup.md#^ref-5e408692-2342-0) (line 2342, col 0, score 0.99)
- [Debugging Broker Connections and Agent Behavior — L2435](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2435-0) (line 2435, col 0, score 0.99)
- [Eidolon Field Abstract Model — L4029](eidolon-field-abstract-model.md#^ref-5e8b2388-4029-0) (line 4029, col 0, score 0.99)
- [Factorio AI with External Agents — L1957](factorio-ai-with-external-agents.md#^ref-a4d90289-1957-0) (line 1957, col 0, score 0.99)
- [homeostasis-decay-formulas — L3892](homeostasis-decay-formulas.md#^ref-37b5d236-3892-0) (line 3892, col 0, score 0.99)
- [MindfulRobotIntegration — L873](mindfulrobotintegration.md#^ref-5f65dfa5-873-0) (line 873, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L3750](promethean-copilot-intent-engine.md#^ref-ae24a280-3750-0) (line 3750, col 0, score 0.99)
- [Unique Info Dump Index — L4304](unique-info-dump-index.md#^ref-30ec3ba6-4304-0) (line 4304, col 0, score 0.99)
- [Eidolon Field Abstract Model — L2209](eidolon-field-abstract-model.md#^ref-5e8b2388-2209-0) (line 2209, col 0, score 0.99)
- [Ice Box Reorganization — L2930](ice-box-reorganization.md#^ref-291c7d91-2930-0) (line 2930, col 0, score 0.99)
- [Model Selection for Lightweight Conversational Tasks — L1581](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-1581-0) (line 1581, col 0, score 0.99)
- [plan-update-confirmation — L4836](plan-update-confirmation.md#^ref-b22d79c6-4836-0) (line 4836, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L2104](chroma-toolkit-consolidation-plan.md#^ref-5020e892-2104-0) (line 2104, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L4160](dynamic-context-model-for-web-components.md#^ref-f7702bf8-4160-0) (line 4160, col 0, score 0.98)
- [Eidolon Field Abstract Model — L2694](eidolon-field-abstract-model.md#^ref-5e8b2388-2694-0) (line 2694, col 0, score 0.98)
- [komorebi-group-window-hack — L1776](komorebi-group-window-hack.md#^ref-dd89372d-1776-0) (line 1776, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L3023](migrate-to-provider-tenant-architecture.md#^ref-54382370-3023-0) (line 3023, col 0, score 0.98)
- [plan-update-confirmation — L5694](plan-update-confirmation.md#^ref-b22d79c6-5694-0) (line 5694, col 0, score 0.98)
- [DuckDuckGoSearchPipeline — L884](duckduckgosearchpipeline.md#^ref-e979c50f-884-0) (line 884, col 0, score 1)
- [Dynamic Context Model for Web Components — L3190](dynamic-context-model-for-web-components.md#^ref-f7702bf8-3190-0) (line 3190, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L2313](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-2313-0) (line 2313, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L3000](promethean-copilot-intent-engine.md#^ref-ae24a280-3000-0) (line 3000, col 0, score 1)
- [Promethean Dev Workflow Update — L16733](promethean-dev-workflow-update.md#^ref-03a5578f-16733-0) (line 16733, col 0, score 1)
- [Duck's Attractor States — L8691](ducks-attractor-states.md#^ref-13951643-8691-0) (line 8691, col 0, score 0.99)
- [Functional Refactor of TypeScript Document Processing — L7937](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-7937-0) (line 7937, col 0, score 0.99)
- [Promethean Chat Activity Report — L4470](promethean-chat-activity-report.md#^ref-18344cf9-4470-0) (line 4470, col 0, score 0.99)
- [Promethean Dev Workflow Update — L9440](promethean-dev-workflow-update.md#^ref-03a5578f-9440-0) (line 9440, col 0, score 0.99)
- [Promethean Documentation Update — L4260](promethean-documentation-update.txt#^ref-0b872af2-4260-0) (line 4260, col 0, score 0.99)
- [Promethean Notes — L4240](promethean-notes.md#^ref-1c4046b5-4240-0) (line 4240, col 0, score 0.99)
- [The Jar of Echoes — L7738](the-jar-of-echoes.md#^ref-18138627-7738-0) (line 7738, col 0, score 0.99)
- [Duck's Attractor States — L2384](ducks-attractor-states.md#^ref-13951643-2384-0) (line 2384, col 0, score 0.98)
- [The Jar of Echoes — L5053](the-jar-of-echoes.md#^ref-18138627-5053-0) (line 5053, col 0, score 1)
- [eidolon-field-math-foundations — L8482](eidolon-field-math-foundations.md#^ref-008f2ac0-8482-0) (line 8482, col 0, score 1)
- [Promethean Dev Workflow Update — L5834](promethean-dev-workflow-update.md#^ref-03a5578f-5834-0) (line 5834, col 0, score 1)
- [windows-tiling-with-autohotkey — L6908](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-6908-0) (line 6908, col 0, score 1)
- [eidolon-field-math-foundations — L7876](eidolon-field-math-foundations.md#^ref-008f2ac0-7876-0) (line 7876, col 0, score 1)
- [Promethean Notes — L3001](promethean-notes.md#^ref-1c4046b5-3001-0) (line 3001, col 0, score 1)
- [run-step-api — L1077](run-step-api.md#^ref-15d25922-1077-0) (line 1077, col 0, score 1)
- [Promethean Chat Activity Report — L4472](promethean-chat-activity-report.md#^ref-18344cf9-4472-0) (line 4472, col 0, score 0.99)
- [Promethean Dev Workflow Update — L9442](promethean-dev-workflow-update.md#^ref-03a5578f-9442-0) (line 9442, col 0, score 0.99)
- [Promethean Documentation Update — L4262](promethean-documentation-update.txt#^ref-0b872af2-4262-0) (line 4262, col 0, score 0.99)
- [Promethean Notes — L4242](promethean-notes.md#^ref-1c4046b5-4242-0) (line 4242, col 0, score 0.99)
- [The Jar of Echoes — L7740](the-jar-of-echoes.md#^ref-18138627-7740-0) (line 7740, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L9046](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-9046-0) (line 9046, col 0, score 0.98)
- [Promethean Dev Workflow Update — L11972](promethean-dev-workflow-update.md#^ref-03a5578f-11972-0) (line 11972, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L5277](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-5277-0) (line 5277, col 0, score 0.97)
- [Debugging Broker Connections and Agent Behavior — L1901](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-1901-0) (line 1901, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L6537](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6537-0) (line 6537, col 0, score 0.99)
- [plan-update-confirmation — L5849](plan-update-confirmation.md#^ref-b22d79c6-5849-0) (line 5849, col 0, score 0.99)
- [polyglot-repl-interface-layer — L1909](polyglot-repl-interface-layer.md#^ref-9c79206d-1909-0) (line 1909, col 0, score 0.99)
- [Promethean Pipelines — L2620](promethean-pipelines.md#^ref-8b8e6103-2620-0) (line 2620, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L2720](migrate-to-provider-tenant-architecture.md#^ref-54382370-2720-0) (line 2720, col 0, score 0.99)
- [Promethean Infrastructure Setup — L3536](promethean-infrastructure-setup.md#^ref-6deed6ac-3536-0) (line 3536, col 0, score 0.99)
- [Promethean Pipelines — L2276](promethean-pipelines.md#^ref-8b8e6103-2276-0) (line 2276, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L21751](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-21751-0) (line 21751, col 0, score 1)
- [Promethean Chat Activity Report — L8744](promethean-chat-activity-report.md#^ref-18344cf9-8744-0) (line 8744, col 0, score 1)
- [Unique Info Dump Index — L3804](unique-info-dump-index.md#^ref-30ec3ba6-3804-0) (line 3804, col 0, score 0.99)
- [Diagrams — L1429](chunks/diagrams.md#^ref-45cd25b5-1429-0) (line 1429, col 0, score 0.99)
- [Operations — L854](chunks/operations.md#^ref-f1add613-854-0) (line 854, col 0, score 0.99)
- [Stateful Partitions and Rebalancing — L3571](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-3571-0) (line 3571, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L2799](protocol-0-the-contradiction-engine.md#^ref-9a93a756-2799-0) (line 2799, col 0, score 0.99)
- [Promethean Dev Workflow Update — L16666](promethean-dev-workflow-update.md#^ref-03a5578f-16666-0) (line 16666, col 0, score 0.98)
- [Duck's Self-Referential Perceptual Loop — L2083](ducks-self-referential-perceptual-loop.md#^ref-71726f04-2083-0) (line 2083, col 0, score 0.98)
- [field-node-diagram-set — L2000](field-node-diagram-set.md#^ref-22b989d5-2000-0) (line 2000, col 0, score 0.98)
- [Fnord Tracer Protocol — L1862](fnord-tracer-protocol.md#^ref-fc21f824-1862-0) (line 1862, col 0, score 0.98)
- [homeostasis-decay-formulas — L2582](homeostasis-decay-formulas.md#^ref-37b5d236-2582-0) (line 2582, col 0, score 0.98)
- [Post-Linguistic Transhuman Design Frameworks — L1778](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-1778-0) (line 1778, col 0, score 0.98)
- [Stateful Partitions and Rebalancing — L3573](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-3573-0) (line 3573, col 0, score 1)
- [Reawakening Duck — L2879](reawakening-duck.md#^ref-59b5670f-2879-0) (line 2879, col 0, score 0.99)
- [Debugging Broker Connections and Agent Behavior — L2416](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2416-0) (line 2416, col 0, score 0.99)
- [The Jar of Echoes — L2094](the-jar-of-echoes.md#^ref-18138627-2094-0) (line 2094, col 0, score 0.99)
- [Layer1SurvivabilityEnvelope — L3658](layer1survivabilityenvelope.md#^ref-64a9f9f9-3658-0) (line 3658, col 0, score 0.98)
- [Tracing the Signal — L1608](tracing-the-signal.md#^ref-c3cd4f65-1608-0) (line 1608, col 0, score 0.98)
- [Eidolon Field Abstract Model — L3936](eidolon-field-abstract-model.md#^ref-5e8b2388-3936-0) (line 3936, col 0, score 0.98)
- [Tracing the Signal — L2885](tracing-the-signal.md#^ref-c3cd4f65-2885-0) (line 2885, col 0, score 0.98)
- [Tracing the Signal — L1418](tracing-the-signal.md#^ref-c3cd4f65-1418-0) (line 1418, col 0, score 0.98)
- [Creative Moments — L7377](creative-moments.md#^ref-10d98225-7377-0) (line 7377, col 0, score 1)
- [Duck's Attractor States — L4643](ducks-attractor-states.md#^ref-13951643-4643-0) (line 4643, col 0, score 1)
- [eidolon-field-math-foundations — L14479](eidolon-field-math-foundations.md#^ref-008f2ac0-14479-0) (line 14479, col 0, score 1)
- [Promethean Dev Workflow Update — L11552](promethean-dev-workflow-update.md#^ref-03a5578f-11552-0) (line 11552, col 0, score 1)
- [The Jar of Echoes — L9123](the-jar-of-echoes.md#^ref-18138627-9123-0) (line 9123, col 0, score 1)
- [windows-tiling-with-autohotkey — L12129](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-12129-0) (line 12129, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L2108](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-2108-0) (line 2108, col 0, score 1)
- [plan-update-confirmation — L3165](plan-update-confirmation.md#^ref-b22d79c6-3165-0) (line 3165, col 0, score 0.99)
- [Prompt_Folder_Bootstrap — L1687](prompt-folder-bootstrap.md#^ref-bd4f0976-1687-0) (line 1687, col 0, score 0.99)
- [The Jar of Echoes — L3038](the-jar-of-echoes.md#^ref-18138627-3038-0) (line 3038, col 0, score 0.99)
- [Duck's Self-Referential Perceptual Loop — L2084](ducks-self-referential-perceptual-loop.md#^ref-71726f04-2084-0) (line 2084, col 0, score 0.98)
- [field-node-diagram-set — L2001](field-node-diagram-set.md#^ref-22b989d5-2001-0) (line 2001, col 0, score 0.98)
- [homeostasis-decay-formulas — L2585](homeostasis-decay-formulas.md#^ref-37b5d236-2585-0) (line 2585, col 0, score 0.98)
- [plan-update-confirmation — L4129](plan-update-confirmation.md#^ref-b22d79c6-4129-0) (line 4129, col 0, score 0.98)
- [Post-Linguistic Transhuman Design Frameworks — L1779](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-1779-0) (line 1779, col 0, score 0.98)
- [i3-bluetooth-setup — L2642](i3-bluetooth-setup.md#^ref-5e408692-2642-0) (line 2642, col 0, score 0.99)
- [Prometheus Observability Stack — L2101](prometheus-observability-stack.md#^ref-e90b5a16-2101-0) (line 2101, col 0, score 0.99)
- [Pure TypeScript Search Microservice — L2612](pure-typescript-search-microservice.md#^ref-d17d3a96-2612-0) (line 2612, col 0, score 0.99)
- [Redirecting Standard Error — L1528](redirecting-standard-error.md#^ref-b3555ede-1528-0) (line 1528, col 0, score 0.99)
- [Model Upgrade Calm-Down Guide — L1843](model-upgrade-calm-down-guide.md#^ref-db74343f-1843-0) (line 1843, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L4378](performance-optimized-polyglot-bridge.md#^ref-f5579967-4378-0) (line 4378, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L3487](promethean-copilot-intent-engine.md#^ref-ae24a280-3487-0) (line 3487, col 0, score 0.99)
- [Pure TypeScript Search Microservice — L3629](pure-typescript-search-microservice.md#^ref-d17d3a96-3629-0) (line 3629, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L2881](chroma-toolkit-consolidation-plan.md#^ref-5020e892-2881-0) (line 2881, col 0, score 1)
- [Stateful Partitions and Rebalancing — L3546](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-3546-0) (line 3546, col 0, score 1)
- [homeostasis-decay-formulas — L1852](homeostasis-decay-formulas.md#^ref-37b5d236-1852-0) (line 1852, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L4646](migrate-to-provider-tenant-architecture.md#^ref-54382370-4646-0) (line 4646, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L4127](performance-optimized-polyglot-bridge.md#^ref-f5579967-4127-0) (line 4127, col 0, score 1)
- [schema-evolution-workflow — L3315](schema-evolution-workflow.md#^ref-d8059b6a-3315-0) (line 3315, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L1944](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-1944-0) (line 1944, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L2880](chroma-toolkit-consolidation-plan.md#^ref-5020e892-2880-0) (line 2880, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L4648](migrate-to-provider-tenant-architecture.md#^ref-54382370-4648-0) (line 4648, col 0, score 0.99)
- [Stateful Partitions and Rebalancing — L3545](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-3545-0) (line 3545, col 0, score 0.99)
- [homeostasis-decay-formulas — L1853](homeostasis-decay-formulas.md#^ref-37b5d236-1853-0) (line 1853, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L4128](performance-optimized-polyglot-bridge.md#^ref-f5579967-4128-0) (line 4128, col 0, score 0.99)
- [Provider-Agnostic Chat Panel Implementation — L1755](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-1755-0) (line 1755, col 0, score 0.99)
- [schema-evolution-workflow — L3317](schema-evolution-workflow.md#^ref-d8059b6a-3317-0) (line 3317, col 0, score 0.99)
- [obsidian-ignore-node-modules-regex — L1952](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-1952-0) (line 1952, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L4644](migrate-to-provider-tenant-architecture.md#^ref-54382370-4644-0) (line 4644, col 0, score 1)
- [Stateful Partitions and Rebalancing — L2385](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-2385-0) (line 2385, col 0, score 1)
- [Factorio AI with External Agents — L2429](factorio-ai-with-external-agents.md#^ref-a4d90289-2429-0) (line 2429, col 0, score 0.98)
- [Model Selection for Lightweight Conversational Tasks — L1846](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-1846-0) (line 1846, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L4649](migrate-to-provider-tenant-architecture.md#^ref-54382370-4649-0) (line 4649, col 0, score 1)
- [Stateful Partitions and Rebalancing — L2390](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-2390-0) (line 2390, col 0, score 1)
- [Eidolon Field Abstract Model — L4044](eidolon-field-abstract-model.md#^ref-5e8b2388-4044-0) (line 4044, col 0, score 0.99)
- [eidolon-field-math-foundations — L1798](eidolon-field-math-foundations.md#^ref-008f2ac0-1798-0) (line 1798, col 0, score 0.99)
- [komorebi-group-window-hack — L1906](komorebi-group-window-hack.md#^ref-dd89372d-1906-0) (line 1906, col 0, score 1)
- [Pure TypeScript Search Microservice — L3250](pure-typescript-search-microservice.md#^ref-d17d3a96-3250-0) (line 3250, col 0, score 1)
- [typed-struct-compiler — L2604](typed-struct-compiler.md#^ref-78eeedf7-2604-0) (line 2604, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L2879](chroma-toolkit-consolidation-plan.md#^ref-5020e892-2879-0) (line 2879, col 0, score 1)
- [homeostasis-decay-formulas — L2885](homeostasis-decay-formulas.md#^ref-37b5d236-2885-0) (line 2885, col 0, score 0.99)
- [plan-update-confirmation — L5298](plan-update-confirmation.md#^ref-b22d79c6-5298-0) (line 5298, col 0, score 0.99)
- [Promethean Infrastructure Setup — L3711](promethean-infrastructure-setup.md#^ref-6deed6ac-3711-0) (line 3711, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L1759](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-1759-0) (line 1759, col 0, score 1)
- [schema-evolution-workflow — L3313](schema-evolution-workflow.md#^ref-d8059b6a-3313-0) (line 3313, col 0, score 0.99)
- [Model Selection for Lightweight Conversational Tasks — L2543](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-2543-0) (line 2543, col 0, score 0.98)
- [Model Upgrade Calm-Down Guide — L2757](model-upgrade-calm-down-guide.md#^ref-db74343f-2757-0) (line 2757, col 0, score 0.98)
- [ParticleSimulationWithCanvasAndFFmpeg — L1604](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-1604-0) (line 1604, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L4171](dynamic-context-model-for-web-components.md#^ref-f7702bf8-4171-0) (line 4171, col 0, score 1)
- [schema-evolution-workflow — L3280](schema-evolution-workflow.md#^ref-d8059b6a-3280-0) (line 3280, col 0, score 1)
- [Dynamic Context Model for Web Components — L2151](dynamic-context-model-for-web-components.md#^ref-f7702bf8-2151-0) (line 2151, col 0, score 0.98)
- [Per-Domain Policy System for JS Crawler — L2176](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-2176-0) (line 2176, col 0, score 0.98)
- [schema-evolution-workflow — L4000](schema-evolution-workflow.md#^ref-d8059b6a-4000-0) (line 4000, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L5295](dynamic-context-model-for-web-components.md#^ref-f7702bf8-5295-0) (line 5295, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L6299](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6299-0) (line 6299, col 0, score 0.99)
- [Layer1SurvivabilityEnvelope — L2845](layer1survivabilityenvelope.md#^ref-64a9f9f9-2845-0) (line 2845, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L2197](migrate-to-provider-tenant-architecture.md#^ref-54382370-2197-0) (line 2197, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L2027](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-2027-0) (line 2027, col 0, score 0.99)
- [plan-update-confirmation — L6739](plan-update-confirmation.md#^ref-b22d79c6-6739-0) (line 6739, col 0, score 0.99)
- [Ice Box Reorganization — L2403](ice-box-reorganization.md#^ref-291c7d91-2403-0) (line 2403, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L2656](promethean-copilot-intent-engine.md#^ref-ae24a280-2656-0) (line 2656, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L3239](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-3239-0) (line 3239, col 0, score 0.99)
- [Pure TypeScript Search Microservice — L2418](pure-typescript-search-microservice.md#^ref-d17d3a96-2418-0) (line 2418, col 0, score 0.99)
- [Layer1SurvivabilityEnvelope — L2844](layer1survivabilityenvelope.md#^ref-64a9f9f9-2844-0) (line 2844, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L2195](migrate-to-provider-tenant-architecture.md#^ref-54382370-2195-0) (line 2195, col 0, score 1)
- [plan-update-confirmation — L6741](plan-update-confirmation.md#^ref-b22d79c6-6741-0) (line 6741, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L1961](promethean-copilot-intent-engine.md#^ref-ae24a280-1961-0) (line 1961, col 0, score 1)
- [Dynamic Context Model for Web Components — L6300](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6300-0) (line 6300, col 0, score 1)
- [Promethean Pipelines — L3510](promethean-pipelines.md#^ref-8b8e6103-3510-0) (line 3510, col 0, score 1)
- [schema-evolution-workflow — L2853](schema-evolution-workflow.md#^ref-d8059b6a-2853-0) (line 2853, col 0, score 1)
- [Dynamic Context Model for Web Components — L6301](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6301-0) (line 6301, col 0, score 0.99)
- [schema-evolution-workflow — L2855](schema-evolution-workflow.md#^ref-d8059b6a-2855-0) (line 2855, col 0, score 0.99)
- [i3-bluetooth-setup — L1732](i3-bluetooth-setup.md#^ref-5e408692-1732-0) (line 1732, col 0, score 0.98)
- [komorebi-group-window-hack — L1692](komorebi-group-window-hack.md#^ref-dd89372d-1692-0) (line 1692, col 0, score 0.98)
- [eidolon-field-math-foundations — L3142](eidolon-field-math-foundations.md#^ref-008f2ac0-3142-0) (line 3142, col 0, score 0.98)
- [Obsidian ChatGPT Plugin Integration Guide — L1282](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-1282-0) (line 1282, col 0, score 0.98)
- [Factorio AI with External Agents — L1765](factorio-ai-with-external-agents.md#^ref-a4d90289-1765-0) (line 1765, col 0, score 1)
- [windows-tiling-with-autohotkey — L5029](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-5029-0) (line 5029, col 0, score 1)
- [graph-ds — L2596](graph-ds.md#^ref-6620e2f2-2596-0) (line 2596, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L2030](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-2030-0) (line 2030, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L3369](performance-optimized-polyglot-bridge.md#^ref-f5579967-3369-0) (line 3369, col 0, score 1)
- [Duck's Attractor States — L12790](ducks-attractor-states.md#^ref-13951643-12790-0) (line 12790, col 0, score 1)
- [Ice Box Reorganization — L2591](ice-box-reorganization.md#^ref-291c7d91-2591-0) (line 2591, col 0, score 1)
- [Factorio AI with External Agents — L1766](factorio-ai-with-external-agents.md#^ref-a4d90289-1766-0) (line 1766, col 0, score 1)
- [windows-tiling-with-autohotkey — L5030](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-5030-0) (line 5030, col 0, score 1)
- [graph-ds — L2597](graph-ds.md#^ref-6620e2f2-2597-0) (line 2597, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L3370](performance-optimized-polyglot-bridge.md#^ref-f5579967-3370-0) (line 3370, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L3011](layer1survivabilityenvelope.md#^ref-64a9f9f9-3011-0) (line 3011, col 0, score 0.99)
- [Promethean Pipelines — L3508](promethean-pipelines.md#^ref-8b8e6103-3508-0) (line 3508, col 0, score 0.99)
- [graph-ds — L2594](graph-ds.md#^ref-6620e2f2-2594-0) (line 2594, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L2200](migrate-to-provider-tenant-architecture.md#^ref-54382370-2200-0) (line 2200, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L3367](performance-optimized-polyglot-bridge.md#^ref-f5579967-3367-0) (line 3367, col 0, score 1)
- [plan-update-confirmation — L6743](plan-update-confirmation.md#^ref-b22d79c6-6743-0) (line 6743, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L1960](promethean-copilot-intent-engine.md#^ref-ae24a280-1960-0) (line 1960, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L2032](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-2032-0) (line 2032, col 0, score 1)
- [Factorio AI with External Agents — L1764](factorio-ai-with-external-agents.md#^ref-a4d90289-1764-0) (line 1764, col 0, score 1)
- [windows-tiling-with-autohotkey — L5028](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-5028-0) (line 5028, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L2843](layer1survivabilityenvelope.md#^ref-64a9f9f9-2843-0) (line 2843, col 0, score 0.99)
- [graph-ds — L2595](graph-ds.md#^ref-6620e2f2-2595-0) (line 2595, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L3368](performance-optimized-polyglot-bridge.md#^ref-f5579967-3368-0) (line 3368, col 0, score 1)
- [plan-update-confirmation — L6742](plan-update-confirmation.md#^ref-b22d79c6-6742-0) (line 6742, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L1958](promethean-copilot-intent-engine.md#^ref-ae24a280-1958-0) (line 1958, col 0, score 1)
- [windows-tiling-with-autohotkey — L5027](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-5027-0) (line 5027, col 0, score 1)
- [Promethean Pipelines — L3506](promethean-pipelines.md#^ref-8b8e6103-3506-0) (line 3506, col 0, score 0.99)
- [schema-evolution-workflow — L2851](schema-evolution-workflow.md#^ref-d8059b6a-2851-0) (line 2851, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L4135](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-4135-0) (line 4135, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L2034](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-2034-0) (line 2034, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L1957](promethean-copilot-intent-engine.md#^ref-ae24a280-1957-0) (line 1957, col 0, score 0.99)
- [Promethean Dev Workflow Update — L1611](promethean-dev-workflow-update.md#^ref-03a5578f-1611-0) (line 1611, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L18028](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-18028-0) (line 18028, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L1951](chroma-toolkit-consolidation-plan.md#^ref-5020e892-1951-0) (line 1951, col 0, score 0.99)
- [Functional Embedding Pipeline Refactor — L2035](functional-embedding-pipeline-refactor.md#^ref-a4a25141-2035-0) (line 2035, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L2338](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-2338-0) (line 2338, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L6305](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6305-0) (line 6305, col 0, score 1)
- [windows-tiling-with-autohotkey — L5079](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-5079-0) (line 5079, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L2839](layer1survivabilityenvelope.md#^ref-64a9f9f9-2839-0) (line 2839, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L2202](migrate-to-provider-tenant-architecture.md#^ref-54382370-2202-0) (line 2202, col 0, score 1)
- [plan-update-confirmation — L6736](plan-update-confirmation.md#^ref-b22d79c6-6736-0) (line 6736, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L1954](promethean-copilot-intent-engine.md#^ref-ae24a280-1954-0) (line 1954, col 0, score 1)
- [Stateful Partitions and Rebalancing — L3388](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-3388-0) (line 3388, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L2631](chroma-toolkit-consolidation-plan.md#^ref-5020e892-2631-0) (line 2631, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L2671](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-2671-0) (line 2671, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L2485](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-2485-0) (line 2485, col 0, score 1)
- [Pure TypeScript Search Microservice — L3125](pure-typescript-search-microservice.md#^ref-d17d3a96-3125-0) (line 3125, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L3227](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-3227-0) (line 3227, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L2377](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-2377-0) (line 2377, col 0, score 1)
- [polyglot-repl-interface-layer — L1651](polyglot-repl-interface-layer.md#^ref-9c79206d-1651-0) (line 1651, col 0, score 1)
- [sibilant-macro-targets — L2367](sibilant-macro-targets.md#^ref-c5c9a5c6-2367-0) (line 2367, col 0, score 1)
- [Creative Moments — L8329](creative-moments.md#^ref-10d98225-8329-0) (line 8329, col 0, score 1)
- [eidolon-field-math-foundations — L18256](eidolon-field-math-foundations.md#^ref-008f2ac0-18256-0) (line 18256, col 0, score 1)
- [The Jar of Echoes — L11865](the-jar-of-echoes.md#^ref-18138627-11865-0) (line 11865, col 0, score 0.99)
- [eidolon-field-math-foundations — L15568](eidolon-field-math-foundations.md#^ref-008f2ac0-15568-0) (line 15568, col 0, score 0.99)
- [Creative Moments — L8330](creative-moments.md#^ref-10d98225-8330-0) (line 8330, col 0, score 1)
- [eidolon-field-math-foundations — L18257](eidolon-field-math-foundations.md#^ref-008f2ac0-18257-0) (line 18257, col 0, score 1)
- [Promethean Dev Workflow Update — L13711](promethean-dev-workflow-update.md#^ref-03a5578f-13711-0) (line 13711, col 0, score 1)
- [windows-tiling-with-autohotkey — L14641](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-14641-0) (line 14641, col 0, score 0.99)
- [Creative Moments — L12176](creative-moments.md#^ref-10d98225-12176-0) (line 12176, col 0, score 0.99)
- [Promethean Dev Workflow Update — L12859](promethean-dev-workflow-update.md#^ref-03a5578f-12859-0) (line 12859, col 0, score 1)
- [Creative Moments — L8278](creative-moments.md#^ref-10d98225-8278-0) (line 8278, col 0, score 1)
- [Duck's Attractor States — L13747](ducks-attractor-states.md#^ref-13951643-13747-0) (line 13747, col 0, score 1)
- [windows-tiling-with-autohotkey — L13202](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-13202-0) (line 13202, col 0, score 1)
- [eidolon-field-math-foundations — L18263](eidolon-field-math-foundations.md#^ref-008f2ac0-18263-0) (line 18263, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L17684](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-17684-0) (line 17684, col 0, score 0.98)
- [Creative Moments — L8283](creative-moments.md#^ref-10d98225-8283-0) (line 8283, col 0, score 1)
- [eidolon-field-math-foundations — L18252](eidolon-field-math-foundations.md#^ref-008f2ac0-18252-0) (line 18252, col 0, score 1)
- [The Jar of Echoes — L12071](the-jar-of-echoes.md#^ref-18138627-12071-0) (line 12071, col 0, score 1)
- [windows-tiling-with-autohotkey — L13195](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-13195-0) (line 13195, col 0, score 1)
- [homeostasis-decay-formulas — L3767](homeostasis-decay-formulas.md#^ref-37b5d236-3767-0) (line 3767, col 0, score 1)
- [Tracing the Signal — L2212](tracing-the-signal.md#^ref-c3cd4f65-2212-0) (line 2212, col 0, score 1)
- [plan-update-confirmation — L4378](plan-update-confirmation.md#^ref-b22d79c6-4378-0) (line 4378, col 0, score 1)
- [Promethean Chat Activity Report — L8639](promethean-chat-activity-report.md#^ref-18344cf9-8639-0) (line 8639, col 0, score 1)
- [windows-tiling-with-autohotkey — L13196](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-13196-0) (line 13196, col 0, score 1)
- [eidolon-field-math-foundations — L18253](eidolon-field-math-foundations.md#^ref-008f2ac0-18253-0) (line 18253, col 0, score 1)
- [The Jar of Echoes — L12070](the-jar-of-echoes.md#^ref-18138627-12070-0) (line 12070, col 0, score 1)
- [eidolon-field-math-foundations — L16526](eidolon-field-math-foundations.md#^ref-008f2ac0-16526-0) (line 16526, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L15849](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-15849-0) (line 15849, col 0, score 0.98)
- [plan-update-confirmation — L4379](plan-update-confirmation.md#^ref-b22d79c6-4379-0) (line 4379, col 0, score 1)
- [Promethean Chat Activity Report — L8640](promethean-chat-activity-report.md#^ref-18344cf9-8640-0) (line 8640, col 0, score 1)
- [windows-tiling-with-autohotkey — L13197](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-13197-0) (line 13197, col 0, score 1)
- [eidolon-field-math-foundations — L18254](eidolon-field-math-foundations.md#^ref-008f2ac0-18254-0) (line 18254, col 0, score 1)
- [Promethean Dev Workflow Update — L13561](promethean-dev-workflow-update.md#^ref-03a5578f-13561-0) (line 13561, col 0, score 1)
- [eidolon-field-math-foundations — L2910](eidolon-field-math-foundations.md#^ref-008f2ac0-2910-0) (line 2910, col 0, score 1)
- [Promethean Dev Workflow Update — L16360](promethean-dev-workflow-update.md#^ref-03a5578f-16360-0) (line 16360, col 0, score 0.99)
- [Promethean Chat Activity Report — L8644](promethean-chat-activity-report.md#^ref-18344cf9-8644-0) (line 8644, col 0, score 1)
- [Promethean Dev Workflow Update — L13714](promethean-dev-workflow-update.md#^ref-03a5578f-13714-0) (line 13714, col 0, score 1)
- [windows-tiling-with-autohotkey — L13201](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-13201-0) (line 13201, col 0, score 1)
- [Creative Moments — L8331](creative-moments.md#^ref-10d98225-8331-0) (line 8331, col 0, score 1)
- [eidolon-field-math-foundations — L18258](eidolon-field-math-foundations.md#^ref-008f2ac0-18258-0) (line 18258, col 0, score 1)
- [Duck's Attractor States — L14002](ducks-attractor-states.md#^ref-13951643-14002-0) (line 14002, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L4585](performance-optimized-polyglot-bridge.md#^ref-f5579967-4585-0) (line 4585, col 0, score 0.98)
- [Model Selection for Lightweight Conversational Tasks — L2993](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-2993-0) (line 2993, col 0, score 0.98)
- [Post-Linguistic Transhuman Design Frameworks — L1849](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-1849-0) (line 1849, col 0, score 0.98)
- [Promethean Documentation Pipeline Overview — L4189](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-4189-0) (line 4189, col 0, score 0.98)
- [Fnord Tracer Protocol — L2056](fnord-tracer-protocol.md#^ref-fc21f824-2056-0) (line 2056, col 0, score 0.98)
- [Ice Box Reorganization — L2848](ice-box-reorganization.md#^ref-291c7d91-2848-0) (line 2848, col 0, score 0.98)
- [plan-update-confirmation — L3467](plan-update-confirmation.md#^ref-b22d79c6-3467-0) (line 3467, col 0, score 0.98)
- [Promethean Pipelines — L2110](promethean-pipelines.md#^ref-8b8e6103-2110-0) (line 2110, col 0, score 0.99)
- [Tracing the Signal — L2721](tracing-the-signal.md#^ref-c3cd4f65-2721-0) (line 2721, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L4965](dynamic-context-model-for-web-components.md#^ref-f7702bf8-4965-0) (line 4965, col 0, score 0.98)
- [Obsidian Templating Plugins Integration Guide — L2216](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-2216-0) (line 2216, col 0, score 0.98)
- [Promethean-Copilot-Intent-Engine — L3386](promethean-copilot-intent-engine.md#^ref-ae24a280-3386-0) (line 3386, col 0, score 0.98)
- [Promethean Documentation Pipeline Overview — L3433](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-3433-0) (line 3433, col 0, score 0.99)
- [Promethean Notes — L7624](promethean-notes.md#^ref-1c4046b5-7624-0) (line 7624, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L15920](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-15920-0) (line 15920, col 0, score 0.98)
- [Promethean-Copilot-Intent-Engine — L2218](promethean-copilot-intent-engine.md#^ref-ae24a280-2218-0) (line 2218, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L3434](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-3434-0) (line 3434, col 0, score 0.99)
- [Promethean Pipelines — L2106](promethean-pipelines.md#^ref-8b8e6103-2106-0) (line 2106, col 0, score 0.99)
- [Tracing the Signal — L2720](tracing-the-signal.md#^ref-c3cd4f65-2720-0) (line 2720, col 0, score 0.99)
- [Eidolon Field Abstract Model — L3929](eidolon-field-abstract-model.md#^ref-5e8b2388-3929-0) (line 3929, col 0, score 0.99)
- [Model Upgrade Calm-Down Guide — L2444](model-upgrade-calm-down-guide.md#^ref-db74343f-2444-0) (line 2444, col 0, score 0.99)
- [Promethean Dev Workflow Update — L2607](promethean-dev-workflow-update.md#^ref-03a5578f-2607-0) (line 2607, col 0, score 0.99)
- [Promethean Pipelines — L1874](promethean-pipelines.md#^ref-8b8e6103-1874-0) (line 1874, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L4953](dynamic-context-model-for-web-components.md#^ref-f7702bf8-4953-0) (line 4953, col 0, score 0.99)
- [Model Selection for Lightweight Conversational Tasks — L3038](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-3038-0) (line 3038, col 0, score 0.99)
- [Duck's Attractor States — L1749](ducks-attractor-states.md#^ref-13951643-1749-0) (line 1749, col 0, score 0.98)
- [Creative Moments — L1333](creative-moments.md#^ref-10d98225-1333-0) (line 1333, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L1987](dynamic-context-model-for-web-components.md#^ref-f7702bf8-1987-0) (line 1987, col 0, score 0.98)
- [NPU Voice Code and Sensory Integration — L1136](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-1136-0) (line 1136, col 0, score 0.98)
- [Promethean Dev Workflow Update — L2293](promethean-dev-workflow-update.md#^ref-03a5578f-2293-0) (line 2293, col 0, score 0.98)
- [Synchronicity Waves and Web — L1731](synchronicity-waves-and-web.md#^ref-91295f3a-1731-0) (line 1731, col 0, score 0.98)
- [Eidolon Field Abstract Model — L3249](eidolon-field-abstract-model.md#^ref-5e8b2388-3249-0) (line 3249, col 0, score 0.99)
- [field-dynamics-math-blocks — L2964](field-dynamics-math-blocks.md#^ref-7cfc230d-2964-0) (line 2964, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L3770](promethean-copilot-intent-engine.md#^ref-ae24a280-3770-0) (line 3770, col 0, score 0.99)
- [Creative Moments — L1424](creative-moments.md#^ref-10d98225-1424-0) (line 1424, col 0, score 0.98)
- [Obsidian Templating Plugins Integration Guide — L2255](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-2255-0) (line 2255, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L5011](dynamic-context-model-for-web-components.md#^ref-f7702bf8-5011-0) (line 5011, col 0, score 0.99)
- [Eidolon Field Abstract Model — L3140](eidolon-field-abstract-model.md#^ref-5e8b2388-3140-0) (line 3140, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L4122](migrate-to-provider-tenant-architecture.md#^ref-54382370-4122-0) (line 4122, col 0, score 0.99)
- [Duck's Attractor States — L21713](ducks-attractor-states.md#^ref-13951643-21713-0) (line 21713, col 0, score 0.99)
- [eidolon-field-math-foundations — L22284](eidolon-field-math-foundations.md#^ref-008f2ac0-22284-0) (line 22284, col 0, score 0.99)
- [Duck's Attractor States — L21715](ducks-attractor-states.md#^ref-13951643-21715-0) (line 21715, col 0, score 0.99)
- [eidolon-field-math-foundations — L22286](eidolon-field-math-foundations.md#^ref-008f2ac0-22286-0) (line 22286, col 0, score 0.99)
- [Creative Moments — L8859](creative-moments.md#^ref-10d98225-8859-0) (line 8859, col 0, score 0.99)
- [Prompt_Folder_Bootstrap — L2646](prompt-folder-bootstrap.md#^ref-bd4f0976-2646-0) (line 2646, col 0, score 0.99)
- [Protocol_0_The_Contradiction_Engine — L2884](protocol-0-the-contradiction-engine.md#^ref-9a93a756-2884-0) (line 2884, col 0, score 0.99)
- [Pure TypeScript Search Microservice — L2427](pure-typescript-search-microservice.md#^ref-d17d3a96-2427-0) (line 2427, col 0, score 0.99)
- [Tracing the Signal — L2411](tracing-the-signal.md#^ref-c3cd4f65-2411-0) (line 2411, col 0, score 0.99)
- [Fnord Tracer Protocol — L3565](fnord-tracer-protocol.md#^ref-fc21f824-3565-0) (line 3565, col 0, score 0.99)
- [Promethean Workflow Optimization — L1468](promethean-workflow-optimization.md#^ref-d614d983-1468-0) (line 1468, col 0, score 0.99)
- [Protocol_0_The_Contradiction_Engine — L2858](protocol-0-the-contradiction-engine.md#^ref-9a93a756-2858-0) (line 2858, col 0, score 0.99)
- [Eidolon Field Abstract Model — L3796](eidolon-field-abstract-model.md#^ref-5e8b2388-3796-0) (line 3796, col 0, score 0.99)
- [i3-bluetooth-setup — L2162](i3-bluetooth-setup.md#^ref-5e408692-2162-0) (line 2162, col 0, score 0.99)
- [Model Selection for Lightweight Conversational Tasks — L1795](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-1795-0) (line 1795, col 0, score 0.99)
- [plan-update-confirmation — L5537](plan-update-confirmation.md#^ref-b22d79c6-5537-0) (line 5537, col 0, score 0.99)
- [Self-Agency in AI Interaction — L1994](self-agency-in-ai-interaction.md#^ref-49a9a860-1994-0) (line 1994, col 0, score 0.99)
- [The Jar of Echoes — L2006](the-jar-of-echoes.md#^ref-18138627-2006-0) (line 2006, col 0, score 0.99)
- [Creative Moments — L1425](creative-moments.md#^ref-10d98225-1425-0) (line 1425, col 0, score 0.99)
- [Reawakening Duck — L3036](reawakening-duck.md#^ref-59b5670f-3036-0) (line 3036, col 0, score 0.99)
- [Duck's Attractor States — L21709](ducks-attractor-states.md#^ref-13951643-21709-0) (line 21709, col 0, score 0.99)
- [eidolon-field-math-foundations — L22281](eidolon-field-math-foundations.md#^ref-008f2ac0-22281-0) (line 22281, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L6649](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6649-0) (line 6649, col 0, score 0.99)
- [Ice Box Reorganization — L2841](ice-box-reorganization.md#^ref-291c7d91-2841-0) (line 2841, col 0, score 0.98)
- [Debugging Broker Connections and Agent Behavior — L1996](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-1996-0) (line 1996, col 0, score 0.98)
- [Layer1SurvivabilityEnvelope — L3568](layer1survivabilityenvelope.md#^ref-64a9f9f9-3568-0) (line 3568, col 0, score 0.98)
- [Reawakening Duck — L1603](reawakening-duck.md#^ref-59b5670f-1603-0) (line 1603, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L6225](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6225-0) (line 6225, col 0, score 0.97)
- [eidolon-field-math-foundations — L22305](eidolon-field-math-foundations.md#^ref-008f2ac0-22305-0) (line 22305, col 0, score 0.99)
- [Promethean Dev Workflow Update — L14501](promethean-dev-workflow-update.md#^ref-03a5578f-14501-0) (line 14501, col 0, score 0.99)
- [DSL — L3591](chunks/dsl.md#^ref-e87bc036-3591-0) (line 3591, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration Guide — L3964](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-3964-0) (line 3964, col 0, score 0.99)
- [The Jar of Echoes — L17504](the-jar-of-echoes.md#^ref-18138627-17504-0) (line 17504, col 0, score 0.99)
- [eidolon-field-math-foundations — L22308](eidolon-field-math-foundations.md#^ref-008f2ac0-22308-0) (line 22308, col 0, score 0.99)
- [Promethean Dev Workflow Update — L14505](promethean-dev-workflow-update.md#^ref-03a5578f-14505-0) (line 14505, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L2674](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-2674-0) (line 2674, col 0, score 0.99)
- [Promethean Dev Workflow Update — L14503](promethean-dev-workflow-update.md#^ref-03a5578f-14503-0) (line 14503, col 0, score 0.99)
- [Creative Moments — L1400](creative-moments.md#^ref-10d98225-1400-0) (line 1400, col 0, score 0.98)
- [eidolon-field-math-foundations — L22307](eidolon-field-math-foundations.md#^ref-008f2ac0-22307-0) (line 22307, col 0, score 0.99)
- [Promethean Dev Workflow Update — L14500](promethean-dev-workflow-update.md#^ref-03a5578f-14500-0) (line 14500, col 0, score 0.99)
- [Promethean Dev Workflow Update — L23519](promethean-dev-workflow-update.md#^ref-03a5578f-23519-0) (line 23519, col 0, score 0.99)
- [Debugging Broker Connections and Agent Behavior — L2789](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2789-0) (line 2789, col 0, score 0.99)
- [eidolon-field-math-foundations — L23122](eidolon-field-math-foundations.md#^ref-008f2ac0-23122-0) (line 23122, col 0, score 0.99)
- [Promethean Dev Workflow Update — L18976](promethean-dev-workflow-update.md#^ref-03a5578f-18976-0) (line 18976, col 0, score 0.99)
- [Duck's Attractor States — L20863](ducks-attractor-states.md#^ref-13951643-20863-0) (line 20863, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L3789](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-3789-0) (line 3789, col 0, score 0.99)
- [Eidolon Field Abstract Model — L3807](eidolon-field-abstract-model.md#^ref-5e8b2388-3807-0) (line 3807, col 0, score 0.99)
- [Protocol_0_The_Contradiction_Engine — L2837](protocol-0-the-contradiction-engine.md#^ref-9a93a756-2837-0) (line 2837, col 0, score 0.99)
- [Tracing the Signal — L1997](tracing-the-signal.md#^ref-c3cd4f65-1997-0) (line 1997, col 0, score 0.99)
- [Prompt_Folder_Bootstrap — L1785](prompt-folder-bootstrap.md#^ref-bd4f0976-1785-0) (line 1785, col 0, score 0.99)
- [Protocol_0_The_Contradiction_Engine — L2638](protocol-0-the-contradiction-engine.md#^ref-9a93a756-2638-0) (line 2638, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L3790](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-3790-0) (line 3790, col 0, score 0.99)
- [eidolon-field-math-foundations — L17831](eidolon-field-math-foundations.md#^ref-008f2ac0-17831-0) (line 17831, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L5470](migrate-to-provider-tenant-architecture.md#^ref-54382370-5470-0) (line 5470, col 0, score 0.99)
- [plan-update-confirmation — L3738](plan-update-confirmation.md#^ref-b22d79c6-3738-0) (line 3738, col 0, score 0.99)
- [eidolon-field-math-foundations — L17842](eidolon-field-math-foundations.md#^ref-008f2ac0-17842-0) (line 17842, col 0, score 0.99)
- [eidolon-field-math-foundations — L23227](eidolon-field-math-foundations.md#^ref-008f2ac0-23227-0) (line 23227, col 0, score 0.99)
- [eidolon-field-math-foundations — L22314](eidolon-field-math-foundations.md#^ref-008f2ac0-22314-0) (line 22314, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L3788](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-3788-0) (line 3788, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L5468](migrate-to-provider-tenant-architecture.md#^ref-54382370-5468-0) (line 5468, col 0, score 1)
- [plan-update-confirmation — L3739](plan-update-confirmation.md#^ref-b22d79c6-3739-0) (line 3739, col 0, score 1)
- [eidolon-field-math-foundations — L5901](eidolon-field-math-foundations.md#^ref-008f2ac0-5901-0) (line 5901, col 0, score 0.99)
- [Prometheus Observability Stack — L3421](prometheus-observability-stack.md#^ref-e90b5a16-3421-0) (line 3421, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L2293](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-2293-0) (line 2293, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L9570](migrate-to-provider-tenant-architecture.md#^ref-54382370-9570-0) (line 9570, col 0, score 0.99)
- [Factorio AI with External Agents — L2341](factorio-ai-with-external-agents.md#^ref-a4d90289-2341-0) (line 2341, col 0, score 1)
- [Fnord Tracer Protocol — L2670](fnord-tracer-protocol.md#^ref-fc21f824-2670-0) (line 2670, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L1726](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-1726-0) (line 1726, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L3787](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-3787-0) (line 3787, col 0, score 1)
- [Promethean Infrastructure Setup — L3755](promethean-infrastructure-setup.md#^ref-6deed6ac-3755-0) (line 3755, col 0, score 1)
- [Prometheus Observability Stack — L2293](prometheus-observability-stack.md#^ref-e90b5a16-2293-0) (line 2293, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L2658](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-2658-0) (line 2658, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L2524](performance-optimized-polyglot-bridge.md#^ref-f5579967-2524-0) (line 2524, col 0, score 0.99)
- [Functional Embedding Pipeline Refactor — L2259](functional-embedding-pipeline-refactor.md#^ref-a4a25141-2259-0) (line 2259, col 0, score 0.99)
- [Functional Refactor of TypeScript Document Processing — L1683](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-1683-0) (line 1683, col 0, score 0.99)
- [Provider-Agnostic Chat Panel Implementation — L2530](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-2530-0) (line 2530, col 0, score 0.99)
- [Pure TypeScript Search Microservice — L3602](pure-typescript-search-microservice.md#^ref-d17d3a96-3602-0) (line 3602, col 0, score 1)
- [eidolon-field-math-foundations — L20687](eidolon-field-math-foundations.md#^ref-008f2ac0-20687-0) (line 20687, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L3182](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-3182-0) (line 3182, col 0, score 1)
- [Promethean Infrastructure Setup — L3564](promethean-infrastructure-setup.md#^ref-6deed6ac-3564-0) (line 3564, col 0, score 1)
- [Creative Moments — L7802](creative-moments.md#^ref-10d98225-7802-0) (line 7802, col 0, score 1)
- [The Jar of Echoes — L14339](the-jar-of-echoes.md#^ref-18138627-14339-0) (line 14339, col 0, score 1)
- [windows-tiling-with-autohotkey — L14962](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-14962-0) (line 14962, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L2101](functional-embedding-pipeline-refactor.md#^ref-a4a25141-2101-0) (line 2101, col 0, score 1)
- [sibilant-macro-targets — L1981](sibilant-macro-targets.md#^ref-c5c9a5c6-1981-0) (line 1981, col 0, score 1)
- [plan-update-confirmation — L3742](plan-update-confirmation.md#^ref-b22d79c6-3742-0) (line 3742, col 0, score 0.99)
- [Creative Moments — L3611](creative-moments.md#^ref-10d98225-3611-0) (line 3611, col 0, score 0.97)
- [Duck's Attractor States — L5512](ducks-attractor-states.md#^ref-13951643-5512-0) (line 5512, col 0, score 0.97)
- [plan-update-confirmation — L3743](plan-update-confirmation.md#^ref-b22d79c6-3743-0) (line 3743, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L3785](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-3785-0) (line 3785, col 0, score 0.99)
- [Duck's Attractor States — L6893](ducks-attractor-states.md#^ref-13951643-6893-0) (line 6893, col 0, score 0.99)
- [eidolon-field-math-foundations — L8334](eidolon-field-math-foundations.md#^ref-008f2ac0-8334-0) (line 8334, col 0, score 0.99)
- [Promethean Dev Workflow Update — L7125](promethean-dev-workflow-update.md#^ref-03a5578f-7125-0) (line 7125, col 0, score 0.99)
- [The Jar of Echoes — L5930](the-jar-of-echoes.md#^ref-18138627-5930-0) (line 5930, col 0, score 0.99)
- [Functional Embedding Pipeline Refactor — L2102](functional-embedding-pipeline-refactor.md#^ref-a4a25141-2102-0) (line 2102, col 0, score 1)
- [sibilant-macro-targets — L1980](sibilant-macro-targets.md#^ref-c5c9a5c6-1980-0) (line 1980, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L3784](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-3784-0) (line 3784, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L1944](migrate-to-provider-tenant-architecture.md#^ref-54382370-1944-0) (line 1944, col 0, score 0.99)
- [Promethean Infrastructure Setup — L4071](promethean-infrastructure-setup.md#^ref-6deed6ac-4071-0) (line 4071, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L4591](migrate-to-provider-tenant-architecture.md#^ref-54382370-4591-0) (line 4591, col 0, score 0.99)
- [Promethean Pipelines — L2210](promethean-pipelines.md#^ref-8b8e6103-2210-0) (line 2210, col 0, score 0.99)
- [eidolon-field-math-foundations — L19731](eidolon-field-math-foundations.md#^ref-008f2ac0-19731-0) (line 19731, col 0, score 1)
- [Promethean Dev Workflow Update — L13745](promethean-dev-workflow-update.md#^ref-03a5578f-13745-0) (line 13745, col 0, score 1)
- [eidolon-field-math-foundations — L19730](eidolon-field-math-foundations.md#^ref-008f2ac0-19730-0) (line 19730, col 0, score 0.99)
- [Promethean Dev Workflow Update — L13746](promethean-dev-workflow-update.md#^ref-03a5578f-13746-0) (line 13746, col 0, score 0.99)
- [Creative Moments — L8908](creative-moments.md#^ref-10d98225-8908-0) (line 8908, col 0, score 0.99)
- [Duck's Attractor States — L15986](ducks-attractor-states.md#^ref-13951643-15986-0) (line 15986, col 0, score 0.99)
- [eidolon-field-math-foundations — L27009](eidolon-field-math-foundations.md#^ref-008f2ac0-27009-0) (line 27009, col 0, score 0.99)
- [Promethean Chat Activity Report — L9284](promethean-chat-activity-report.md#^ref-18344cf9-9284-0) (line 9284, col 0, score 0.99)
- [eidolon-field-math-foundations — L19733](eidolon-field-math-foundations.md#^ref-008f2ac0-19733-0) (line 19733, col 0, score 0.99)
- [Promethean Dev Workflow Update — L13744](promethean-dev-workflow-update.md#^ref-03a5578f-13744-0) (line 13744, col 0, score 0.99)
- [The Jar of Echoes — L2177](the-jar-of-echoes.md#^ref-18138627-2177-0) (line 2177, col 0, score 0.99)
- [eidolon-field-math-foundations — L23231](eidolon-field-math-foundations.md#^ref-008f2ac0-23231-0) (line 23231, col 0, score 0.99)
- [Duck's Attractor States — L20575](ducks-attractor-states.md#^ref-13951643-20575-0) (line 20575, col 0, score 0.99)
- [The Jar of Echoes — L17488](the-jar-of-echoes.md#^ref-18138627-17488-0) (line 17488, col 0, score 0.99)
- [TypeScript Patch for Tool Calling Support — L2010](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-2010-0) (line 2010, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L17509](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-17509-0) (line 17509, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L15406](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-15406-0) (line 15406, col 0, score 0.99)
- [Promethean Dev Workflow Update — L18878](promethean-dev-workflow-update.md#^ref-03a5578f-18878-0) (line 18878, col 0, score 0.99)
- [eidolon-field-math-foundations — L20365](eidolon-field-math-foundations.md#^ref-008f2ac0-20365-0) (line 20365, col 0, score 0.99)
- [Promethean Dev Workflow Update — L14311](promethean-dev-workflow-update.md#^ref-03a5578f-14311-0) (line 14311, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L3215](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3215-0) (line 3215, col 0, score 0.99)
- [Duck's Self-Referential Perceptual Loop — L1953](ducks-self-referential-perceptual-loop.md#^ref-71726f04-1953-0) (line 1953, col 0, score 0.99)
- [Self-Agency in AI Interaction — L1389](self-agency-in-ai-interaction.md#^ref-49a9a860-1389-0) (line 1389, col 0, score 0.99)
- [eidolon-field-math-foundations — L19524](eidolon-field-math-foundations.md#^ref-008f2ac0-19524-0) (line 19524, col 0, score 0.97)
- [Factorio AI with External Agents — L3298](factorio-ai-with-external-agents.md#^ref-a4d90289-3298-0) (line 3298, col 0, score 1)
- [plan-update-confirmation — L5137](plan-update-confirmation.md#^ref-b22d79c6-5137-0) (line 5137, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L1952](ducks-self-referential-perceptual-loop.md#^ref-71726f04-1952-0) (line 1952, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L1811](model-upgrade-calm-down-guide.md#^ref-db74343f-1811-0) (line 1811, col 0, score 1)
- [plan-update-confirmation — L3747](plan-update-confirmation.md#^ref-b22d79c6-3747-0) (line 3747, col 0, score 0.98)
- [Promethean Dev Workflow Update — L13748](promethean-dev-workflow-update.md#^ref-03a5578f-13748-0) (line 13748, col 0, score 1)
- [windows-tiling-with-autohotkey — L15409](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-15409-0) (line 15409, col 0, score 1)
- [graph-ds — L1959](graph-ds.md#^ref-6620e2f2-1959-0) (line 1959, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L2904](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-2904-0) (line 2904, col 0, score 1)
- [zero-copy-snapshots-and-workers — L1865](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-1865-0) (line 1865, col 0, score 1)
- [field-dynamics-math-blocks — L1923](field-dynamics-math-blocks.md#^ref-7cfc230d-1923-0) (line 1923, col 0, score 0.99)
- [homeostasis-decay-formulas — L2210](homeostasis-decay-formulas.md#^ref-37b5d236-2210-0) (line 2210, col 0, score 0.99)
- [Promethean State Format — L2531](promethean-state-format.md#^ref-23df6ddb-2531-0) (line 2531, col 0, score 0.99)
- [Prompt_Folder_Bootstrap — L3111](prompt-folder-bootstrap.md#^ref-bd4f0976-3111-0) (line 3111, col 0, score 0.99)
- [Promethean Dev Workflow Update — L14824](promethean-dev-workflow-update.md#^ref-03a5578f-14824-0) (line 14824, col 0, score 0.99)
- [Obsidian Templating Plugins Integration Guide — L2283](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-2283-0) (line 2283, col 0, score 0.99)
- [Obsidian Templating Plugins Integration Guide — L2284](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-2284-0) (line 2284, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration Guide — L1603](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-1603-0) (line 1603, col 0, score 0.99)
- [Obsidian Templating Plugins Integration Guide — L1778](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-1778-0) (line 1778, col 0, score 0.99)
- [Prompt_Folder_Bootstrap — L2108](prompt-folder-bootstrap.md#^ref-bd4f0976-2108-0) (line 2108, col 0, score 0.99)
- [TypeScript Patch for Tool Calling Support — L3603](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-3603-0) (line 3603, col 0, score 0.99)
- [Self-Agency in AI Interaction — L2186](self-agency-in-ai-interaction.md#^ref-49a9a860-2186-0) (line 2186, col 0, score 0.99)
- [Obsidian Templating Plugins Integration Guide — L2285](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-2285-0) (line 2285, col 0, score 1)
- [plan-update-confirmation — L3135](plan-update-confirmation.md#^ref-b22d79c6-3135-0) (line 3135, col 0, score 1)
- [i3-bluetooth-setup — L2146](i3-bluetooth-setup.md#^ref-5e408692-2146-0) (line 2146, col 0, score 0.98)
- [Model Selection for Lightweight Conversational Tasks — L3510](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-3510-0) (line 3510, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L2876](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2876-0) (line 2876, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1946](migrate-to-provider-tenant-architecture.md#^ref-54382370-1946-0) (line 1946, col 0, score 1)
- [Promethean Infrastructure Setup — L4074](promethean-infrastructure-setup.md#^ref-6deed6ac-4074-0) (line 4074, col 0, score 1)
- [eidolon-field-math-foundations — L3290](eidolon-field-math-foundations.md#^ref-008f2ac0-3290-0) (line 3290, col 0, score 0.98)
- [Creative Moments — L8684](creative-moments.md#^ref-10d98225-8684-0) (line 8684, col 0, score 0.97)
- [Duck's Attractor States — L13464](ducks-attractor-states.md#^ref-13951643-13464-0) (line 13464, col 0, score 0.97)
- [eidolon-field-math-foundations — L26843](eidolon-field-math-foundations.md#^ref-008f2ac0-26843-0) (line 26843, col 0, score 0.97)
- [Promethean Chat Activity Report — L9060](promethean-chat-activity-report.md#^ref-18344cf9-9060-0) (line 9060, col 0, score 0.97)
- [Promethean Dev Workflow Update — L13679](promethean-dev-workflow-update.md#^ref-03a5578f-13679-0) (line 13679, col 0, score 0.97)
- [Promethean Documentation Update — L7348](promethean-documentation-update.txt#^ref-0b872af2-7348-0) (line 7348, col 0, score 0.97)
- [Pipeline Enhancements — L742](pipeline-enhancements.md#^ref-e2135d9f-742-0) (line 742, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L2497](migrate-to-provider-tenant-architecture.md#^ref-54382370-2497-0) (line 2497, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L3036](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3036-0) (line 3036, col 0, score 1)
- [Promethean Infrastructure Setup — L4072](promethean-infrastructure-setup.md#^ref-6deed6ac-4072-0) (line 4072, col 0, score 1)
- [Dynamic Context Model for Web Components — L6220](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6220-0) (line 6220, col 0, score 0.99)
- [Fnord Tracer Protocol — L3522](fnord-tracer-protocol.md#^ref-fc21f824-3522-0) (line 3522, col 0, score 0.99)
- [Ice Box Reorganization — L2860](ice-box-reorganization.md#^ref-291c7d91-2860-0) (line 2860, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L2196](promethean-copilot-intent-engine.md#^ref-ae24a280-2196-0) (line 2196, col 0, score 0.99)
- [The Jar of Echoes — L2847](the-jar-of-echoes.md#^ref-18138627-2847-0) (line 2847, col 0, score 0.99)
- [eidolon-field-math-foundations — L6631](eidolon-field-math-foundations.md#^ref-008f2ac0-6631-0) (line 6631, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L9583](migrate-to-provider-tenant-architecture.md#^ref-54382370-9583-0) (line 9583, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L4084](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-4084-0) (line 4084, col 0, score 0.99)
- [Promethean Infrastructure Setup — L5200](promethean-infrastructure-setup.md#^ref-6deed6ac-5200-0) (line 5200, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L6038](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6038-0) (line 6038, col 0, score 1)
- [Dynamic Context Model for Web Components — L6039](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6039-0) (line 6039, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L3032](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3032-0) (line 3032, col 0, score 1)
- [The Jar of Echoes — L13777](the-jar-of-echoes.md#^ref-18138627-13777-0) (line 13777, col 0, score 1)
- [field-node-diagram-set — L2046](field-node-diagram-set.md#^ref-22b989d5-2046-0) (line 2046, col 0, score 0.99)
- [Fnord Tracer Protocol — L3554](fnord-tracer-protocol.md#^ref-fc21f824-3554-0) (line 3554, col 0, score 0.99)
- [graph-ds — L1872](graph-ds.md#^ref-6620e2f2-1872-0) (line 1872, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L2149](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-2149-0) (line 2149, col 0, score 0.99)
- [The Jar of Echoes — L14253](the-jar-of-echoes.md#^ref-18138627-14253-0) (line 14253, col 0, score 0.98)
- [plan-update-confirmation — L3167](plan-update-confirmation.md#^ref-b22d79c6-3167-0) (line 3167, col 0, score 1)
- [Dynamic Context Model for Web Components — L6581](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6581-0) (line 6581, col 0, score 1)
- [Factorio AI with External Agents — L3582](factorio-ai-with-external-agents.md#^ref-a4d90289-3582-0) (line 3582, col 0, score 1)
- [plan-update-confirmation — L3168](plan-update-confirmation.md#^ref-b22d79c6-3168-0) (line 3168, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L2834](chroma-toolkit-consolidation-plan.md#^ref-5020e892-2834-0) (line 2834, col 0, score 0.97)
- [komorebi-group-window-hack — L2177](komorebi-group-window-hack.md#^ref-dd89372d-2177-0) (line 2177, col 0, score 0.97)
- [Migrate to Provider-Tenant Architecture — L5015](migrate-to-provider-tenant-architecture.md#^ref-54382370-5015-0) (line 5015, col 0, score 0.97)
- [plan-update-confirmation — L3171](plan-update-confirmation.md#^ref-b22d79c6-3171-0) (line 3171, col 0, score 0.99)
- [field-dynamics-math-blocks — L3329](field-dynamics-math-blocks.md#^ref-7cfc230d-3329-0) (line 3329, col 0, score 0.98)
- [homeostasis-decay-formulas — L2314](homeostasis-decay-formulas.md#^ref-37b5d236-2314-0) (line 2314, col 0, score 0.98)
- [Ice Box Reorganization — L2526](ice-box-reorganization.md#^ref-291c7d91-2526-0) (line 2526, col 0, score 0.98)
- [plan-update-confirmation — L3169](plan-update-confirmation.md#^ref-b22d79c6-3169-0) (line 3169, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L2754](dynamic-context-model-for-web-components.md#^ref-f7702bf8-2754-0) (line 2754, col 0, score 0.99)
- [Ice Box Reorganization — L1682](ice-box-reorganization.md#^ref-291c7d91-1682-0) (line 1682, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L4919](migrate-to-provider-tenant-architecture.md#^ref-54382370-4919-0) (line 4919, col 0, score 0.99)
- [Creative Moments — L8484](creative-moments.md#^ref-10d98225-8484-0) (line 8484, col 0, score 1)
- [The Jar of Echoes — L13775](the-jar-of-echoes.md#^ref-18138627-13775-0) (line 13775, col 0, score 1)
- [windows-tiling-with-autohotkey — L17942](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-17942-0) (line 17942, col 0, score 1)
- [field-node-diagram-set — L2047](field-node-diagram-set.md#^ref-22b989d5-2047-0) (line 2047, col 0, score 0.99)
- [graph-ds — L1873](graph-ds.md#^ref-6620e2f2-1873-0) (line 1873, col 0, score 0.99)
- [Creative Moments — L7912](creative-moments.md#^ref-10d98225-7912-0) (line 7912, col 0, score 1)
- [Promethean Dev Workflow Update — L13749](promethean-dev-workflow-update.md#^ref-03a5578f-13749-0) (line 13749, col 0, score 1)
- [Creative Moments — L7911](creative-moments.md#^ref-10d98225-7911-0) (line 7911, col 0, score 1)
- [Promethean Dev Workflow Update — L14125](promethean-dev-workflow-update.md#^ref-03a5578f-14125-0) (line 14125, col 0, score 1)
- [windows-tiling-with-autohotkey — L14996](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-14996-0) (line 14996, col 0, score 1)
- [Duck's Attractor States — L21662](ducks-attractor-states.md#^ref-13951643-21662-0) (line 21662, col 0, score 0.99)
- [Duck's Attractor States — L14501](ducks-attractor-states.md#^ref-13951643-14501-0) (line 14501, col 0, score 0.99)
- [Promethean Dev Workflow Update — L13101](promethean-dev-workflow-update.md#^ref-03a5578f-13101-0) (line 13101, col 0, score 0.99)
- [The Jar of Echoes — L11943](the-jar-of-echoes.md#^ref-18138627-11943-0) (line 11943, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L3605](migrate-to-provider-tenant-architecture.md#^ref-54382370-3605-0) (line 3605, col 0, score 0.99)
- [Model Selection for Lightweight Conversational Tasks — L2392](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-2392-0) (line 2392, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L4124](performance-optimized-polyglot-bridge.md#^ref-f5579967-4124-0) (line 4124, col 0, score 0.99)
- [Promethean Infrastructure Setup — L3527](promethean-infrastructure-setup.md#^ref-6deed6ac-3527-0) (line 3527, col 0, score 0.97)
- [Promethean Pipelines — L1670](promethean-pipelines.md#^ref-8b8e6103-1670-0) (line 1670, col 0, score 0.97)
- [Fnord Tracer Protocol — L4264](fnord-tracer-protocol.md#^ref-fc21f824-4264-0) (line 4264, col 0, score 0.97)
- [The Jar of Echoes — L11942](the-jar-of-echoes.md#^ref-18138627-11942-0) (line 11942, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L3603](migrate-to-provider-tenant-architecture.md#^ref-54382370-3603-0) (line 3603, col 0, score 0.99)
- [Model Selection for Lightweight Conversational Tasks — L2102](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-2102-0) (line 2102, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L4123](performance-optimized-polyglot-bridge.md#^ref-f5579967-4123-0) (line 4123, col 0, score 0.99)
- [Docops Feature Updates — L861](docops-feature-updates.md#^ref-2792d448-861-0) (line 861, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L3385](dynamic-context-model-for-web-components.md#^ref-f7702bf8-3385-0) (line 3385, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L2210](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-2210-0) (line 2210, col 0, score 0.99)
- [eidolon-field-math-foundations — L15611](eidolon-field-math-foundations.md#^ref-008f2ac0-15611-0) (line 15611, col 0, score 0.98)
- [Promethean Dev Workflow Update — L13179](promethean-dev-workflow-update.md#^ref-03a5578f-13179-0) (line 13179, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L14379](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-14379-0) (line 14379, col 0, score 0.98)
- [eidolon-field-math-foundations — L24770](eidolon-field-math-foundations.md#^ref-008f2ac0-24770-0) (line 24770, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L17501](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-17501-0) (line 17501, col 0, score 0.98)
- [Pure TypeScript Search Microservice — L2974](pure-typescript-search-microservice.md#^ref-d17d3a96-2974-0) (line 2974, col 0, score 0.98)
- [typed-struct-compiler — L2911](typed-struct-compiler.md#^ref-78eeedf7-2911-0) (line 2911, col 0, score 0.98)
- [Docops Feature Updates — L940](docops-feature-updates.md#^ref-2792d448-940-0) (line 940, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L2320](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-2320-0) (line 2320, col 0, score 1)
- [sibilant-macro-targets — L1856](sibilant-macro-targets.md#^ref-c5c9a5c6-1856-0) (line 1856, col 0, score 1)
- [Dynamic Context Model for Web Components — L5700](dynamic-context-model-for-web-components.md#^ref-f7702bf8-5700-0) (line 5700, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L1963](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-1963-0) (line 1963, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L2387](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-2387-0) (line 2387, col 0, score 0.99)
- [Docops Feature Updates — L941](docops-feature-updates.md#^ref-2792d448-941-0) (line 941, col 0, score 1)
- [Dynamic Context Model for Web Components — L5698](dynamic-context-model-for-web-components.md#^ref-f7702bf8-5698-0) (line 5698, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L1962](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-1962-0) (line 1962, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L3601](migrate-to-provider-tenant-architecture.md#^ref-54382370-3601-0) (line 3601, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L2321](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-2321-0) (line 2321, col 0, score 1)
- [sibilant-macro-targets — L1855](sibilant-macro-targets.md#^ref-c5c9a5c6-1855-0) (line 1855, col 0, score 1)
- [Docops Feature Updates — L942](docops-feature-updates.md#^ref-2792d448-942-0) (line 942, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L3600](migrate-to-provider-tenant-architecture.md#^ref-54382370-3600-0) (line 3600, col 0, score 1)
- [Promethean Dev Workflow Update — L17736](promethean-dev-workflow-update.md#^ref-03a5578f-17736-0) (line 17736, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L2322](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-2322-0) (line 2322, col 0, score 1)
- [sibilant-macro-targets — L1857](sibilant-macro-targets.md#^ref-c5c9a5c6-1857-0) (line 1857, col 0, score 1)
- [Dynamic Context Model for Web Components — L5701](dynamic-context-model-for-web-components.md#^ref-f7702bf8-5701-0) (line 5701, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L2388](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-2388-0) (line 2388, col 0, score 1)
- [Promethean Dev Workflow Update — L17161](promethean-dev-workflow-update.md#^ref-03a5578f-17161-0) (line 17161, col 0, score 1)
- [windows-tiling-with-autohotkey — L14215](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-14215-0) (line 14215, col 0, score 1)
- [Docops Feature Updates — L944](docops-feature-updates.md#^ref-2792d448-944-0) (line 944, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L3714](migrate-to-provider-tenant-architecture.md#^ref-54382370-3714-0) (line 3714, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L2323](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-2323-0) (line 2323, col 0, score 1)
- [sibilant-macro-targets — L1859](sibilant-macro-targets.md#^ref-c5c9a5c6-1859-0) (line 1859, col 0, score 1)
- [Promethean Dev Workflow Update — L17160](promethean-dev-workflow-update.md#^ref-03a5578f-17160-0) (line 17160, col 0, score 1)
- [windows-tiling-with-autohotkey — L14213](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-14213-0) (line 14213, col 0, score 1)
- [Docops Feature Updates — L943](docops-feature-updates.md#^ref-2792d448-943-0) (line 943, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L3713](migrate-to-provider-tenant-architecture.md#^ref-54382370-3713-0) (line 3713, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L2324](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-2324-0) (line 2324, col 0, score 1)
- [sibilant-macro-targets — L1858](sibilant-macro-targets.md#^ref-c5c9a5c6-1858-0) (line 1858, col 0, score 1)
- [Promethean Dev Workflow Update — L13966](promethean-dev-workflow-update.md#^ref-03a5578f-13966-0) (line 13966, col 0, score 1)
- [Ice Box Reorganization — L2301](ice-box-reorganization.md#^ref-291c7d91-2301-0) (line 2301, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L2233](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-2233-0) (line 2233, col 0, score 0.99)
- [Prompt_Folder_Bootstrap — L2412](prompt-folder-bootstrap.md#^ref-bd4f0976-2412-0) (line 2412, col 0, score 0.99)
- [Docops Feature Updates — L878](docops-feature-updates-2.md#^ref-cdbd21ee-878-0) (line 878, col 0, score 0.98)
- [eidolon-field-math-foundations — L22429](eidolon-field-math-foundations.md#^ref-008f2ac0-22429-0) (line 22429, col 0, score 0.98)
- [Layer1SurvivabilityEnvelope — L1820](layer1survivabilityenvelope.md#^ref-64a9f9f9-1820-0) (line 1820, col 0, score 0.99)
- [Duck's Attractor States — L13158](ducks-attractor-states.md#^ref-13951643-13158-0) (line 13158, col 0, score 0.99)
- [Promethean Pipelines — L2295](promethean-pipelines.md#^ref-8b8e6103-2295-0) (line 2295, col 0, score 0.99)
- [ParticleSimulationWithCanvasAndFFmpeg — L2377](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-2377-0) (line 2377, col 0, score 0.99)
- [Layer1SurvivabilityEnvelope — L1819](layer1survivabilityenvelope.md#^ref-64a9f9f9-1819-0) (line 1819, col 0, score 0.99)
- [Duck's Attractor States — L12978](ducks-attractor-states.md#^ref-13951643-12978-0) (line 12978, col 0, score 0.99)
- [Functional Refactor of TypeScript Document Processing — L1633](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-1633-0) (line 1633, col 0, score 0.98)
- [plan-update-confirmation — L6181](plan-update-confirmation.md#^ref-b22d79c6-6181-0) (line 6181, col 0, score 0.98)
- [Duck's Attractor States — L12979](ducks-attractor-states.md#^ref-13951643-12979-0) (line 12979, col 0, score 0.99)
- [heartbeat-fragment-demo — L1763](heartbeat-fragment-demo.md#^ref-dd00677a-1763-0) (line 1763, col 0, score 0.98)
- [homeostasis-decay-formulas — L1885](homeostasis-decay-formulas.md#^ref-37b5d236-1885-0) (line 1885, col 0, score 0.98)
- [Model Selection for Lightweight Conversational Tasks — L3356](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-3356-0) (line 3356, col 0, score 0.98)
- [Duck's Attractor States — L12981](ducks-attractor-states.md#^ref-13951643-12981-0) (line 12981, col 0, score 0.99)
- [Layer1SurvivabilityEnvelope — L1817](layer1survivabilityenvelope.md#^ref-64a9f9f9-1817-0) (line 1817, col 0, score 0.99)
- [Eidolon Field Abstract Model — L3685](eidolon-field-abstract-model.md#^ref-5e8b2388-3685-0) (line 3685, col 0, score 0.98)
- [Duck's Self-Referential Perceptual Loop — L2080](ducks-self-referential-perceptual-loop.md#^ref-71726f04-2080-0) (line 2080, col 0, score 0.98)
- [Promethean Dev Workflow Update — L2456](promethean-dev-workflow-update.md#^ref-03a5578f-2456-0) (line 2456, col 0, score 0.98)
- [zero-copy-snapshots-and-workers — L1844](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-1844-0) (line 1844, col 0, score 0.97)
- [typed-struct-compiler — L2496](typed-struct-compiler.md#^ref-78eeedf7-2496-0) (line 2496, col 0, score 0.91)
- [field-node-diagram-visualizations — L633](field-node-diagram-visualizations.md#^ref-e9b27b06-633-0) (line 633, col 0, score 0.89)
- [Fnord Tracer Protocol — L900](fnord-tracer-protocol.md#^ref-fc21f824-900-0) (line 900, col 0, score 0.89)
- [Functional Embedding Pipeline Refactor — L1118](functional-embedding-pipeline-refactor.md#^ref-a4a25141-1118-0) (line 1118, col 0, score 0.89)
- [Functional Refactor of TypeScript Document Processing — L861](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-861-0) (line 861, col 0, score 0.89)
- [heartbeat-fragment-demo — L884](heartbeat-fragment-demo.md#^ref-dd00677a-884-0) (line 884, col 0, score 0.89)
- [homeostasis-decay-formulas — L831](homeostasis-decay-formulas.md#^ref-37b5d236-831-0) (line 831, col 0, score 0.89)
- [i3-bluetooth-setup — L1115](i3-bluetooth-setup.md#^ref-5e408692-1115-0) (line 1115, col 0, score 0.89)
- [Promethean-Copilot-Intent-Engine — L2868](promethean-copilot-intent-engine.md#^ref-ae24a280-2868-0) (line 2868, col 0, score 1)
- [eidolon-field-math-foundations — L17934](eidolon-field-math-foundations.md#^ref-008f2ac0-17934-0) (line 17934, col 0, score 0.99)
- [The Jar of Echoes — L20258](the-jar-of-echoes.md#^ref-18138627-20258-0) (line 20258, col 0, score 0.99)
- [Duck's Attractor States — L12976](ducks-attractor-states.md#^ref-13951643-12976-0) (line 12976, col 0, score 1)
- [Duck's Attractor States — L13075](ducks-attractor-states.md#^ref-13951643-13075-0) (line 13075, col 0, score 1)
- [The Jar of Echoes — L13768](the-jar-of-echoes.md#^ref-18138627-13768-0) (line 13768, col 0, score 1)
- [field-node-diagram-outline — L2559](field-node-diagram-outline.md#^ref-1f32c94a-2559-0) (line 2559, col 0, score 0.99)
- [field-node-diagram-set — L2547](field-node-diagram-set.md#^ref-22b989d5-2547-0) (line 2547, col 0, score 0.99)
- [eidolon-field-math-foundations — L19374](eidolon-field-math-foundations.md#^ref-008f2ac0-19374-0) (line 19374, col 0, score 0.99)
- [eidolon-field-math-foundations — L1787](eidolon-field-math-foundations.md#^ref-008f2ac0-1787-0) (line 1787, col 0, score 0.99)
- [field-dynamics-math-blocks — L1572](field-dynamics-math-blocks.md#^ref-7cfc230d-1572-0) (line 1572, col 0, score 0.98)
- [field-interaction-equations — L1671](field-interaction-equations.md#^ref-b09141b7-1671-0) (line 1671, col 0, score 0.98)
- [field-node-diagram-outline — L2467](field-node-diagram-outline.md#^ref-1f32c94a-2467-0) (line 2467, col 0, score 0.98)
- [field-node-diagram-set — L1767](field-node-diagram-set.md#^ref-22b989d5-1767-0) (line 1767, col 0, score 0.98)
- [heartbeat-fragment-demo — L1906](heartbeat-fragment-demo.md#^ref-dd00677a-1906-0) (line 1906, col 0, score 0.98)
- [homeostasis-decay-formulas — L1674](homeostasis-decay-formulas.md#^ref-37b5d236-1674-0) (line 1674, col 0, score 0.98)
- [eidolon-field-math-foundations — L1790](eidolon-field-math-foundations.md#^ref-008f2ac0-1790-0) (line 1790, col 0, score 0.99)
- [field-node-diagram-outline — L2498](field-node-diagram-outline.md#^ref-1f32c94a-2498-0) (line 2498, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L3044](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-3044-0) (line 3044, col 0, score 0.99)
- [Docops Feature Updates — L907](docops-feature-updates-2.md#^ref-cdbd21ee-907-0) (line 907, col 0, score 0.98)
- [Functional Embedding Pipeline Refactor — L2595](functional-embedding-pipeline-refactor.md#^ref-a4a25141-2595-0) (line 2595, col 0, score 0.98)
- [Model Selection for Lightweight Conversational Tasks — L2905](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-2905-0) (line 2905, col 0, score 0.98)
- [Per-Domain Policy System for JS Crawler — L3327](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3327-0) (line 3327, col 0, score 0.98)
- [Debugging Broker Connections and Agent Behavior — L2302](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2302-0) (line 2302, col 0, score 1)
- [Factorio AI with External Agents — L1813](factorio-ai-with-external-agents.md#^ref-a4d90289-1813-0) (line 1813, col 0, score 1)
- [Fnord Tracer Protocol — L2944](fnord-tracer-protocol.md#^ref-fc21f824-2944-0) (line 2944, col 0, score 1)
- [i3-bluetooth-setup — L2348](i3-bluetooth-setup.md#^ref-5e408692-2348-0) (line 2348, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L2837](layer1survivabilityenvelope.md#^ref-64a9f9f9-2837-0) (line 2837, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L4185](migrate-to-provider-tenant-architecture.md#^ref-54382370-4185-0) (line 4185, col 0, score 1)
- [plan-update-confirmation — L3859](plan-update-confirmation.md#^ref-b22d79c6-3859-0) (line 3859, col 0, score 1)
- [Unique Info Dump Index — L4379](unique-info-dump-index.md#^ref-30ec3ba6-4379-0) (line 4379, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L2299](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2299-0) (line 2299, col 0, score 0.99)
- [Fnord Tracer Protocol — L2945](fnord-tracer-protocol.md#^ref-fc21f824-2945-0) (line 2945, col 0, score 0.99)
- [i3-bluetooth-setup — L2343](i3-bluetooth-setup.md#^ref-5e408692-2343-0) (line 2343, col 0, score 0.99)
- [Layer1SurvivabilityEnvelope — L2830](layer1survivabilityenvelope.md#^ref-64a9f9f9-2830-0) (line 2830, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L4180](migrate-to-provider-tenant-architecture.md#^ref-54382370-4180-0) (line 4180, col 0, score 0.99)
- [plan-update-confirmation — L3854](plan-update-confirmation.md#^ref-b22d79c6-3854-0) (line 3854, col 0, score 0.99)
- [Debugging Broker Connections and Agent Behavior — L2300](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2300-0) (line 2300, col 0, score 0.99)
- [Factorio AI with External Agents — L1806](factorio-ai-with-external-agents.md#^ref-a4d90289-1806-0) (line 1806, col 0, score 0.99)
- [Fnord Tracer Protocol — L2946](fnord-tracer-protocol.md#^ref-fc21f824-2946-0) (line 2946, col 0, score 0.99)
- [i3-bluetooth-setup — L2344](i3-bluetooth-setup.md#^ref-5e408692-2344-0) (line 2344, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L4181](migrate-to-provider-tenant-architecture.md#^ref-54382370-4181-0) (line 4181, col 0, score 0.99)
- [plan-update-confirmation — L3855](plan-update-confirmation.md#^ref-b22d79c6-3855-0) (line 3855, col 0, score 0.99)
- [Fnord Tracer Protocol — L2947](fnord-tracer-protocol.md#^ref-fc21f824-2947-0) (line 2947, col 0, score 1)
- [i3-bluetooth-setup — L2345](i3-bluetooth-setup.md#^ref-5e408692-2345-0) (line 2345, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L2831](layer1survivabilityenvelope.md#^ref-64a9f9f9-2831-0) (line 2831, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L4182](migrate-to-provider-tenant-architecture.md#^ref-54382370-4182-0) (line 4182, col 0, score 1)
- [plan-update-confirmation — L3856](plan-update-confirmation.md#^ref-b22d79c6-3856-0) (line 3856, col 0, score 1)
- [Fnord Tracer Protocol — L2588](fnord-tracer-protocol.md#^ref-fc21f824-2588-0) (line 2588, col 0, score 0.99)
- [Unique Info Dump Index — L4383](unique-info-dump-index.md#^ref-30ec3ba6-4383-0) (line 4383, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L2296](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2296-0) (line 2296, col 0, score 1)
- [Factorio AI with External Agents — L1808](factorio-ai-with-external-agents.md#^ref-a4d90289-1808-0) (line 1808, col 0, score 1)
- [i3-bluetooth-setup — L2346](i3-bluetooth-setup.md#^ref-5e408692-2346-0) (line 2346, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L2832](layer1survivabilityenvelope.md#^ref-64a9f9f9-2832-0) (line 2832, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L4179](migrate-to-provider-tenant-architecture.md#^ref-54382370-4179-0) (line 4179, col 0, score 1)
- [plan-update-confirmation — L3857](plan-update-confirmation.md#^ref-b22d79c6-3857-0) (line 3857, col 0, score 1)
- [eidolon-field-math-foundations — L23742](eidolon-field-math-foundations.md#^ref-008f2ac0-23742-0) (line 23742, col 0, score 1)
- [Duck's Attractor States — L18259](ducks-attractor-states.md#^ref-13951643-18259-0) (line 18259, col 0, score 0.99)
- [Promethean Chat Activity Report — L11845](promethean-chat-activity-report.md#^ref-18344cf9-11845-0) (line 11845, col 0, score 0.99)
- [Promethean Dev Workflow Update — L25520](promethean-dev-workflow-update.md#^ref-03a5578f-25520-0) (line 25520, col 0, score 0.99)
- [Promethean Documentation Update — L10218](promethean-documentation-update.txt#^ref-0b872af2-10218-0) (line 10218, col 0, score 0.99)
- [Promethean Notes — L11264](promethean-notes.md#^ref-1c4046b5-11264-0) (line 11264, col 0, score 0.99)
- [The Jar of Echoes — L18042](the-jar-of-echoes.md#^ref-18138627-18042-0) (line 18042, col 0, score 0.99)
- [eidolon-field-math-foundations — L23743](eidolon-field-math-foundations.md#^ref-008f2ac0-23743-0) (line 23743, col 0, score 1)
- [Eidolon Field Abstract Model — L2080](eidolon-field-abstract-model.md#^ref-5e8b2388-2080-0) (line 2080, col 0, score 1)
- [field-dynamics-math-blocks — L1733](field-dynamics-math-blocks.md#^ref-7cfc230d-1733-0) (line 1733, col 0, score 1)
- [eidolon-field-math-foundations — L23720](eidolon-field-math-foundations.md#^ref-008f2ac0-23720-0) (line 23720, col 0, score 1)
- [eidolon-field-math-foundations — L23645](eidolon-field-math-foundations.md#^ref-008f2ac0-23645-0) (line 23645, col 0, score 1)
- [The Jar of Echoes — L13489](the-jar-of-echoes.md#^ref-18138627-13489-0) (line 13489, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L2922](model-upgrade-calm-down-guide.md#^ref-db74343f-2922-0) (line 2922, col 0, score 1)
- [Smoke Resonance Visualizations — L1529](smoke-resonance-visualizations.md#^ref-ac9d3ac5-1529-0) (line 1529, col 0, score 1)
- [Promethean Dev Workflow Update — L2777](promethean-dev-workflow-update.md#^ref-03a5578f-2777-0) (line 2777, col 0, score 1)
- [plan-update-confirmation — L4530](plan-update-confirmation.md#^ref-b22d79c6-4530-0) (line 4530, col 0, score 0.99)
- [Model Upgrade Calm-Down Guide — L3244](model-upgrade-calm-down-guide.md#^ref-db74343f-3244-0) (line 3244, col 0, score 0.99)
- [Promethean Dev Workflow Update — L16847](promethean-dev-workflow-update.md#^ref-03a5578f-16847-0) (line 16847, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L1929](promethean-copilot-intent-engine.md#^ref-ae24a280-1929-0) (line 1929, col 0, score 0.98)
- [Promethean Dev Workflow Update — L18682](promethean-dev-workflow-update.md#^ref-03a5578f-18682-0) (line 18682, col 0, score 0.99)
- [The Jar of Echoes — L12321](the-jar-of-echoes.md#^ref-18138627-12321-0) (line 12321, col 0, score 0.99)
- [field-node-diagram-set — L2497](field-node-diagram-set.md#^ref-22b989d5-2497-0) (line 2497, col 0, score 0.99)
- [field-node-diagram-visualizations — L1991](field-node-diagram-visualizations.md#^ref-e9b27b06-1991-0) (line 1991, col 0, score 0.99)
- [eidolon-node-lifecycle — L1217](eidolon-node-lifecycle.md#^ref-938eca9c-1217-0) (line 1217, col 0, score 0.99)
- [field-node-diagram-set — L2511](field-node-diagram-set.md#^ref-22b989d5-2511-0) (line 2511, col 0, score 0.99)
- [Promethean Dev Workflow Update — L18685](promethean-dev-workflow-update.md#^ref-03a5578f-18685-0) (line 18685, col 0, score 1)
- [The Jar of Echoes — L14203](the-jar-of-echoes.md#^ref-18138627-14203-0) (line 14203, col 0, score 1)
- [field-node-diagram-outline — L2475](field-node-diagram-outline.md#^ref-1f32c94a-2475-0) (line 2475, col 0, score 1)
- [Obsidian Task Generation — L938](obsidian-task-generation.md#^ref-9b694a91-938-0) (line 938, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L2489](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-2489-0) (line 2489, col 0, score 1)
- [Promethean Dev Workflow Update — L18686](promethean-dev-workflow-update.md#^ref-03a5578f-18686-0) (line 18686, col 0, score 0.99)
- [Fnord Tracer Protocol — L2942](fnord-tracer-protocol.md#^ref-fc21f824-2942-0) (line 2942, col 0, score 0.99)
- [Docops Feature Updates — L1070](docops-feature-updates.md#^ref-2792d448-1070-0) (line 1070, col 0, score 0.98)
- [The Jar of Echoes — L12322](the-jar-of-echoes.md#^ref-18138627-12322-0) (line 12322, col 0, score 0.99)
- [Promethean Dev Workflow Update — L18684](promethean-dev-workflow-update.md#^ref-03a5578f-18684-0) (line 18684, col 0, score 0.99)
- [Eidolon Field Abstract Model — L2862](eidolon-field-abstract-model.md#^ref-5e8b2388-2862-0) (line 2862, col 0, score 0.98)
- [Self-Agency in AI Interaction — L1950](self-agency-in-ai-interaction.md#^ref-49a9a860-1950-0) (line 1950, col 0, score 0.98)
- [Promethean Dev Workflow Update — L2811](promethean-dev-workflow-update.md#^ref-03a5578f-2811-0) (line 2811, col 0, score 0.98)
- [Docops Feature Updates — L821](docops-feature-updates-2.md#^ref-cdbd21ee-821-0) (line 821, col 0, score 0.98)
- [Docops Feature Updates — L1045](docops-feature-updates.md#^ref-2792d448-1045-0) (line 1045, col 0, score 0.98)
- [Promethean Dev Workflow Update — L18653](promethean-dev-workflow-update.md#^ref-03a5578f-18653-0) (line 18653, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L4642](migrate-to-provider-tenant-architecture.md#^ref-54382370-4642-0) (line 4642, col 0, score 0.99)
- [Promethean Dev Workflow Update — L14792](promethean-dev-workflow-update.md#^ref-03a5578f-14792-0) (line 14792, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L15712](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-15712-0) (line 15712, col 0, score 0.99)
- [eidolon-field-math-foundations — L17577](eidolon-field-math-foundations.md#^ref-008f2ac0-17577-0) (line 17577, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L3050](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-3050-0) (line 3050, col 0, score 1)
- [Duck's Attractor States — L12796](ducks-attractor-states.md#^ref-13951643-12796-0) (line 12796, col 0, score 0.98)
- [eidolon-field-math-foundations — L17336](eidolon-field-math-foundations.md#^ref-008f2ac0-17336-0) (line 17336, col 0, score 0.98)
- [Promethean Dev Workflow Update — L16446](promethean-dev-workflow-update.md#^ref-03a5578f-16446-0) (line 16446, col 0, score 0.98)
- [eidolon-field-math-foundations — L17585](eidolon-field-math-foundations.md#^ref-008f2ac0-17585-0) (line 17585, col 0, score 0.98)
- [Promethean Pipelines — L2893](promethean-pipelines.md#^ref-8b8e6103-2893-0) (line 2893, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L2439](chroma-toolkit-consolidation-plan.md#^ref-5020e892-2439-0) (line 2439, col 0, score 0.98)
- [Eidolon Field Abstract Model — L1991](eidolon-field-abstract-model.md#^ref-5e8b2388-1991-0) (line 1991, col 0, score 0.98)
- [field-interaction-equations — L2076](field-interaction-equations.md#^ref-b09141b7-2076-0) (line 2076, col 0, score 0.98)
- [homeostasis-decay-formulas — L2157](homeostasis-decay-formulas.md#^ref-37b5d236-2157-0) (line 2157, col 0, score 0.98)
- [field-node-diagram-outline — L2505](field-node-diagram-outline.md#^ref-1f32c94a-2505-0) (line 2505, col 0, score 1)
- [The Jar of Echoes — L12317](the-jar-of-echoes.md#^ref-18138627-12317-0) (line 12317, col 0, score 1)
- [Dynamic Context Model for Web Components — L6322](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6322-0) (line 6322, col 0, score 0.99)
- [Duck's Attractor States — L12657](ducks-attractor-states.md#^ref-13951643-12657-0) (line 12657, col 0, score 0.99)
- [The Jar of Echoes — L16655](the-jar-of-echoes.md#^ref-18138627-16655-0) (line 16655, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L17209](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-17209-0) (line 17209, col 0, score 0.99)
- [Functional Refactor of TypeScript Document Processing — L1806](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-1806-0) (line 1806, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L2434](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-2434-0) (line 2434, col 0, score 0.99)
- [The Jar of Echoes — L1598](the-jar-of-echoes.md#^ref-18138627-1598-0) (line 1598, col 0, score 0.98)
- [Factorio AI with External Agents — L2085](factorio-ai-with-external-agents.md#^ref-a4d90289-2085-0) (line 2085, col 0, score 0.99)
- [Prometheus Observability Stack — L2941](prometheus-observability-stack.md#^ref-e90b5a16-2941-0) (line 2941, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L2772](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2772-0) (line 2772, col 0, score 0.99)
- [JavaScript — L1475](chunks/javascript.md#^ref-c1618c66-1475-0) (line 1475, col 0, score 0.99)
- [Unique Info Dump Index — L3336](unique-info-dump-index.md#^ref-30ec3ba6-3336-0) (line 3336, col 0, score 0.99)
- [typed-struct-compiler — L3496](typed-struct-compiler.md#^ref-78eeedf7-3496-0) (line 3496, col 0, score 0.99)
- [eidolon-field-math-foundations — L25132](eidolon-field-math-foundations.md#^ref-008f2ac0-25132-0) (line 25132, col 0, score 0.99)
- [Prometheus Observability Stack — L2940](prometheus-observability-stack.md#^ref-e90b5a16-2940-0) (line 2940, col 0, score 0.98)
- [JavaScript — L1474](chunks/javascript.md#^ref-c1618c66-1474-0) (line 1474, col 0, score 0.98)
- [Factorio AI with External Agents — L2083](factorio-ai-with-external-agents.md#^ref-a4d90289-2083-0) (line 2083, col 0, score 0.98)
- [Unique Info Dump Index — L3335](unique-info-dump-index.md#^ref-30ec3ba6-3335-0) (line 3335, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L2771](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2771-0) (line 2771, col 0, score 0.99)
- [typed-struct-compiler — L3495](typed-struct-compiler.md#^ref-78eeedf7-3495-0) (line 3495, col 0, score 0.99)
- [Factorio AI with External Agents — L2084](factorio-ai-with-external-agents.md#^ref-a4d90289-2084-0) (line 2084, col 0, score 0.97)
- [JavaScript — L1473](chunks/javascript.md#^ref-c1618c66-1473-0) (line 1473, col 0, score 0.97)
- [Prometheus Observability Stack — L2939](prometheus-observability-stack.md#^ref-e90b5a16-2939-0) (line 2939, col 0, score 0.97)
- [Unique Info Dump Index — L3334](unique-info-dump-index.md#^ref-30ec3ba6-3334-0) (line 3334, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L2769](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2769-0) (line 2769, col 0, score 0.99)
- [typed-struct-compiler — L3494](typed-struct-compiler.md#^ref-78eeedf7-3494-0) (line 3494, col 0, score 0.99)
- [graph-ds — L2406](graph-ds.md#^ref-6620e2f2-2406-0) (line 2406, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L5471](chroma-toolkit-consolidation-plan.md#^ref-5020e892-5471-0) (line 5471, col 0, score 1)
- [eidolon-field-math-foundations — L4165](eidolon-field-math-foundations.md#^ref-008f2ac0-4165-0) (line 4165, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L4875](performance-optimized-polyglot-bridge.md#^ref-f5579967-4875-0) (line 4875, col 0, score 1)
- [Promethean Infrastructure Setup — L4420](promethean-infrastructure-setup.md#^ref-6deed6ac-4420-0) (line 4420, col 0, score 1)
- [Prompt_Folder_Bootstrap — L3771](prompt-folder-bootstrap.md#^ref-bd4f0976-3771-0) (line 3771, col 0, score 1)
- [zero-copy-snapshots-and-workers — L4637](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-4637-0) (line 4637, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L5472](chroma-toolkit-consolidation-plan.md#^ref-5020e892-5472-0) (line 5472, col 0, score 1)
- [eidolon-field-math-foundations — L4166](eidolon-field-math-foundations.md#^ref-008f2ac0-4166-0) (line 4166, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L4876](performance-optimized-polyglot-bridge.md#^ref-f5579967-4876-0) (line 4876, col 0, score 1)
- [Promethean Infrastructure Setup — L4421](promethean-infrastructure-setup.md#^ref-6deed6ac-4421-0) (line 4421, col 0, score 1)
- [Prompt_Folder_Bootstrap — L3772](prompt-folder-bootstrap.md#^ref-bd4f0976-3772-0) (line 3772, col 0, score 1)
- [zero-copy-snapshots-and-workers — L4638](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-4638-0) (line 4638, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L5473](chroma-toolkit-consolidation-plan.md#^ref-5020e892-5473-0) (line 5473, col 0, score 1)
- [eidolon-field-math-foundations — L4167](eidolon-field-math-foundations.md#^ref-008f2ac0-4167-0) (line 4167, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L4877](performance-optimized-polyglot-bridge.md#^ref-f5579967-4877-0) (line 4877, col 0, score 1)
- [Promethean Infrastructure Setup — L4422](promethean-infrastructure-setup.md#^ref-6deed6ac-4422-0) (line 4422, col 0, score 1)
- [Prompt_Folder_Bootstrap — L3773](prompt-folder-bootstrap.md#^ref-bd4f0976-3773-0) (line 3773, col 0, score 1)
- [zero-copy-snapshots-and-workers — L4639](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-4639-0) (line 4639, col 0, score 1)
- [JavaScript — L1639](chunks/javascript.md#^ref-c1618c66-1639-0) (line 1639, col 0, score 1)
- [Promethean Pipelines — L1997](promethean-pipelines.md#^ref-8b8e6103-1997-0) (line 1997, col 0, score 1)
- [Unique Info Dump Index — L3985](unique-info-dump-index.md#^ref-30ec3ba6-3985-0) (line 3985, col 0, score 1)
- [Factorio AI with External Agents — L2086](factorio-ai-with-external-agents.md#^ref-a4d90289-2086-0) (line 2086, col 0, score 1)
- [Prometheus Observability Stack — L2942](prometheus-observability-stack.md#^ref-e90b5a16-2942-0) (line 2942, col 0, score 1)
- [windows-tiling-with-autohotkey — L2773](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2773-0) (line 2773, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L3605](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-3605-0) (line 3605, col 0, score 0.99)
- [Factorio AI with External Agents — L2087](factorio-ai-with-external-agents.md#^ref-a4d90289-2087-0) (line 2087, col 0, score 1)
- [Prometheus Observability Stack — L2943](prometheus-observability-stack.md#^ref-e90b5a16-2943-0) (line 2943, col 0, score 1)
- [windows-tiling-with-autohotkey — L2774](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2774-0) (line 2774, col 0, score 1)
- [graph-ds — L2395](graph-ds.md#^ref-6620e2f2-2395-0) (line 2395, col 0, score 1)
- [windows-tiling-with-autohotkey — L19059](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-19059-0) (line 19059, col 0, score 0.98)
- [The Jar of Echoes — L16712](the-jar-of-echoes.md#^ref-18138627-16712-0) (line 16712, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L20540](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-20540-0) (line 20540, col 0, score 0.99)
- [Promethean Pipelines — L1991](promethean-pipelines.md#^ref-8b8e6103-1991-0) (line 1991, col 0, score 0.97)
- [Eidolon Field Abstract Model — L2256](eidolon-field-abstract-model.md#^ref-5e8b2388-2256-0) (line 2256, col 0, score 0.96)
- [Fnord Tracer Protocol — L2321](fnord-tracer-protocol.md#^ref-fc21f824-2321-0) (line 2321, col 0, score 0.96)
- [Promethean Pipelines — L2027](promethean-pipelines.md#^ref-8b8e6103-2027-0) (line 2027, col 0, score 0.96)
- [field-dynamics-math-blocks — L2822](field-dynamics-math-blocks.md#^ref-7cfc230d-2822-0) (line 2822, col 0, score 0.96)
- [eidolon-field-math-foundations — L25130](eidolon-field-math-foundations.md#^ref-008f2ac0-25130-0) (line 25130, col 0, score 0.99)
- [Promethean Dev Workflow Update — L23657](promethean-dev-workflow-update.md#^ref-03a5578f-23657-0) (line 23657, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L20537](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-20537-0) (line 20537, col 0, score 0.99)
- [The Jar of Echoes — L16714](the-jar-of-echoes.md#^ref-18138627-16714-0) (line 16714, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L1841](chroma-toolkit-consolidation-plan.md#^ref-5020e892-1841-0) (line 1841, col 0, score 0.97)
- [Functional Embedding Pipeline Refactor — L1847](functional-embedding-pipeline-refactor.md#^ref-a4a25141-1847-0) (line 1847, col 0, score 0.97)
- [graph-ds — L2109](graph-ds.md#^ref-6620e2f2-2109-0) (line 2109, col 0, score 0.97)
- [typed-struct-compiler — L2467](typed-struct-compiler.md#^ref-78eeedf7-2467-0) (line 2467, col 0, score 0.97)
- [eidolon-field-math-foundations — L22238](eidolon-field-math-foundations.md#^ref-008f2ac0-22238-0) (line 22238, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L20538](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-20538-0) (line 20538, col 0, score 0.99)
- [Promethean Dev Workflow Update — L23658](promethean-dev-workflow-update.md#^ref-03a5578f-23658-0) (line 23658, col 0, score 0.99)
- [The Jar of Echoes — L16713](the-jar-of-echoes.md#^ref-18138627-16713-0) (line 16713, col 0, score 0.99)
- [graph-ds — L2391](graph-ds.md#^ref-6620e2f2-2391-0) (line 2391, col 0, score 0.99)
- [Promethean Pipelines — L1993](promethean-pipelines.md#^ref-8b8e6103-1993-0) (line 1993, col 0, score 0.99)
- [eidolon-field-math-foundations — L21204](eidolon-field-math-foundations.md#^ref-008f2ac0-21204-0) (line 21204, col 0, score 1)
- [Promethean Dev Workflow Update — L23655](promethean-dev-workflow-update.md#^ref-03a5578f-23655-0) (line 23655, col 0, score 1)
- [windows-tiling-with-autohotkey — L20535](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-20535-0) (line 20535, col 0, score 1)
- [Duck's Attractor States — L17430](ducks-attractor-states.md#^ref-13951643-17430-0) (line 17430, col 0, score 1)
- [Promethean Pipelines — L2002](promethean-pipelines.md#^ref-8b8e6103-2002-0) (line 2002, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L1641](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-1641-0) (line 1641, col 0, score 0.99)
- [Services — L1289](chunks/services.md#^ref-75ea4a6a-1289-0) (line 1289, col 0, score 0.99)
- [eidolon-field-math-foundations — L21205](eidolon-field-math-foundations.md#^ref-008f2ac0-21205-0) (line 21205, col 0, score 1)
- [Promethean Dev Workflow Update — L23656](promethean-dev-workflow-update.md#^ref-03a5578f-23656-0) (line 23656, col 0, score 1)
- [Duck's Attractor States — L17431](ducks-attractor-states.md#^ref-13951643-17431-0) (line 17431, col 0, score 1)
- [Duck's Attractor States — L20733](ducks-attractor-states.md#^ref-13951643-20733-0) (line 20733, col 0, score 0.97)
- [eidolon-field-math-foundations — L23389](eidolon-field-math-foundations.md#^ref-008f2ac0-23389-0) (line 23389, col 0, score 0.97)
- [graph-ds — L2427](graph-ds.md#^ref-6620e2f2-2427-0) (line 2427, col 0, score 0.97)
- [Services — L1290](chunks/services.md#^ref-75ea4a6a-1290-0) (line 1290, col 0, score 0.97)
- [windows-tiling-with-autohotkey — L20533](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-20533-0) (line 20533, col 0, score 1)
- [Promethean Dev Workflow Update — L19269](promethean-dev-workflow-update.md#^ref-03a5578f-19269-0) (line 19269, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L15444](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-15444-0) (line 15444, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L18713](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-18713-0) (line 18713, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L20534](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-20534-0) (line 20534, col 0, score 1)
- [Services — L2079](chunks/services.md#^ref-75ea4a6a-2079-0) (line 2079, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L3619](migrate-to-provider-tenant-architecture.md#^ref-54382370-3619-0) (line 3619, col 0, score 0.99)
- [The Jar of Echoes — L17942](the-jar-of-echoes.md#^ref-18138627-17942-0) (line 17942, col 0, score 0.99)
- [eidolon-field-math-foundations — L25058](eidolon-field-math-foundations.md#^ref-008f2ac0-25058-0) (line 25058, col 0, score 0.99)
- [Creative Moments — L11747](creative-moments.md#^ref-10d98225-11747-0) (line 11747, col 0, score 0.99)
- [eidolon-field-math-foundations — L15907](eidolon-field-math-foundations.md#^ref-008f2ac0-15907-0) (line 15907, col 0, score 0.99)
- [eidolon-field-math-foundations — L25200](eidolon-field-math-foundations.md#^ref-008f2ac0-25200-0) (line 25200, col 0, score 1)
- [Promethean Dev Workflow Update — L23854](promethean-dev-workflow-update.md#^ref-03a5578f-23854-0) (line 23854, col 0, score 1)
- [windows-tiling-with-autohotkey — L20747](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-20747-0) (line 20747, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L1650](functional-embedding-pipeline-refactor.md#^ref-a4a25141-1650-0) (line 1650, col 0, score 0.99)
- [Promethean Dev Workflow Update — L17426](promethean-dev-workflow-update.md#^ref-03a5578f-17426-0) (line 17426, col 0, score 0.99)
- [eidolon-field-math-foundations — L1785](eidolon-field-math-foundations.md#^ref-008f2ac0-1785-0) (line 1785, col 0, score 0.99)
- [graph-ds — L2475](graph-ds.md#^ref-6620e2f2-2475-0) (line 2475, col 0, score 0.99)
- [The Jar of Echoes — L17985](the-jar-of-echoes.md#^ref-18138627-17985-0) (line 17985, col 0, score 0.99)
- [heartbeat-fragment-demo — L1518](heartbeat-fragment-demo.md#^ref-dd00677a-1518-0) (line 1518, col 0, score 0.98)
- [ParticleSimulationWithCanvasAndFFmpeg — L651](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-651-0) (line 651, col 0, score 0.94)
- [Per-Domain Policy System for JS Crawler — L748](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-748-0) (line 748, col 0, score 0.94)
- [Performance-Optimized-Polyglot-Bridge — L772](performance-optimized-polyglot-bridge.md#^ref-f5579967-772-0) (line 772, col 0, score 0.94)
- [plan-update-confirmation — L1337](plan-update-confirmation.md#^ref-b22d79c6-1337-0) (line 1337, col 0, score 0.94)
- [polyglot-repl-interface-layer — L458](polyglot-repl-interface-layer.md#^ref-9c79206d-458-0) (line 458, col 0, score 0.94)
- [Post-Linguistic Transhuman Design Frameworks — L765](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-765-0) (line 765, col 0, score 0.94)
- [Redirecting Standard Error — L404](redirecting-standard-error.md#^ref-b3555ede-404-0) (line 404, col 0, score 0.94)
- [ripple-propagation-demo — L364](ripple-propagation-demo.md#^ref-8430617b-364-0) (line 364, col 0, score 0.94)
- [schema-evolution-workflow — L799](schema-evolution-workflow.md#^ref-d8059b6a-799-0) (line 799, col 0, score 0.94)
- [Self-Agency in AI Interaction — L525](self-agency-in-ai-interaction.md#^ref-49a9a860-525-0) (line 525, col 0, score 0.94)
- [sibilant-macro-targets — L560](sibilant-macro-targets.md#^ref-c5c9a5c6-560-0) (line 560, col 0, score 0.94)
- [The Jar of Echoes — L17984](the-jar-of-echoes.md#^ref-18138627-17984-0) (line 17984, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L2085](dynamic-context-model-for-web-components.md#^ref-f7702bf8-2085-0) (line 2085, col 0, score 0.95)
- [The Jar of Echoes — L17980](the-jar-of-echoes.md#^ref-18138627-17980-0) (line 17980, col 0, score 0.99)
- [Factorio AI with External Agents — L2947](factorio-ai-with-external-agents.md#^ref-a4d90289-2947-0) (line 2947, col 0, score 0.99)
- [The Jar of Echoes — L17981](the-jar-of-echoes.md#^ref-18138627-17981-0) (line 17981, col 0, score 1)
- [Eidolon Field Abstract Model — L2215](eidolon-field-abstract-model.md#^ref-5e8b2388-2215-0) (line 2215, col 0, score 0.99)
- [The Jar of Echoes — L17982](the-jar-of-echoes.md#^ref-18138627-17982-0) (line 17982, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L2244](dynamic-context-model-for-web-components.md#^ref-f7702bf8-2244-0) (line 2244, col 0, score 0.98)
- [Promethean Documentation Overview — L736](promethean-documentation-overview.md#^ref-9413237f-736-0) (line 736, col 0, score 0.98)
- [Promethean Documentation Update — L1428](promethean-documentation-update.md#^ref-c0392040-1428-0) (line 1428, col 0, score 0.98)
- [Promethean_Eidolon_Synchronicity_Model — L1903](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-1903-0) (line 1903, col 0, score 0.98)
- [Promethean Infrastructure Setup — L4188](promethean-infrastructure-setup.md#^ref-6deed6ac-4188-0) (line 4188, col 0, score 0.98)
- [Promethean Pipelines — L3810](promethean-pipelines.md#^ref-8b8e6103-3810-0) (line 3810, col 0, score 0.98)
- [promethean-requirements — L1802](promethean-requirements.md#^ref-95205cd3-1802-0) (line 1802, col 0, score 0.98)
- [Promethean State Format — L1694](promethean-state-format.md#^ref-23df6ddb-1694-0) (line 1694, col 0, score 0.98)
- [Promethean Workflow Optimization — L1933](promethean-workflow-optimization.md#^ref-d614d983-1933-0) (line 1933, col 0, score 0.98)
- [Prometheus Observability Stack — L2546](prometheus-observability-stack.md#^ref-e90b5a16-2546-0) (line 2546, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L2247](dynamic-context-model-for-web-components.md#^ref-f7702bf8-2247-0) (line 2247, col 0, score 0.99)
- [heartbeat-fragment-demo — L1531](heartbeat-fragment-demo.md#^ref-dd00677a-1531-0) (line 1531, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L2052](promethean-copilot-intent-engine.md#^ref-ae24a280-2052-0) (line 2052, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L3075](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-3075-0) (line 3075, col 0, score 0.99)
- [sibilant-macro-targets — L2266](sibilant-macro-targets.md#^ref-c5c9a5c6-2266-0) (line 2266, col 0, score 0.99)
- [Docops Feature Updates — L1104](docops-feature-updates-2.md#^ref-cdbd21ee-1104-0) (line 1104, col 0, score 0.99)
- [Operations — L1214](chunks/operations.md#^ref-f1add613-1214-0) (line 1214, col 0, score 0.97)
- [Shared — L2439](chunks/shared.md#^ref-623a55f7-2439-0) (line 2439, col 0, score 0.97)
- [Window Management — L2858](chunks/window-management.md#^ref-9e8ae388-2858-0) (line 2858, col 0, score 0.97)
- [Creative Moments — L1783](creative-moments.md#^ref-10d98225-1783-0) (line 1783, col 0, score 0.97)
- [Debugging Broker Connections and Agent Behavior — L4153](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-4153-0) (line 4153, col 0, score 0.97)
- [DuckDuckGoSearchPipeline — L1319](duckduckgosearchpipeline.md#^ref-e979c50f-1319-0) (line 1319, col 0, score 0.97)
- [Duck's Attractor States — L3443](ducks-attractor-states.md#^ref-13951643-3443-0) (line 3443, col 0, score 0.97)
- [Duck's Self-Referential Perceptual Loop — L3401](ducks-self-referential-perceptual-loop.md#^ref-71726f04-3401-0) (line 3401, col 0, score 0.97)
- [Factorio AI with External Agents — L4177](factorio-ai-with-external-agents.md#^ref-a4d90289-4177-0) (line 4177, col 0, score 0.97)
- [TypeScript Patch for Tool Calling Support — L2221](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-2221-0) (line 2221, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L2139](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2139-0) (line 2139, col 0, score 0.98)
- [Promethean Documentation Pipeline Overview — L2641](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-2641-0) (line 2641, col 0, score 0.97)
- [Duck's Self-Referential Perceptual Loop — L1649](ducks-self-referential-perceptual-loop.md#^ref-71726f04-1649-0) (line 1649, col 0, score 0.98)
- [Promethean Documentation Pipeline Overview — L3069](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-3069-0) (line 3069, col 0, score 0.99)
- [Promethean Workflow Optimization — L1076](promethean-workflow-optimization.md#^ref-d614d983-1076-0) (line 1076, col 0, score 0.99)
- [sibilant-macro-targets — L2260](sibilant-macro-targets.md#^ref-c5c9a5c6-2260-0) (line 2260, col 0, score 0.99)
- [eidolon-field-math-foundations — L8058](eidolon-field-math-foundations.md#^ref-008f2ac0-8058-0) (line 8058, col 0, score 0.99)
- [eidolon-field-math-foundations — L20828](eidolon-field-math-foundations.md#^ref-008f2ac0-20828-0) (line 20828, col 0, score 0.99)
- [field-dynamics-math-blocks — L1599](field-dynamics-math-blocks.md#^ref-7cfc230d-1599-0) (line 1599, col 0, score 0.99)
- [eidolon-field-math-foundations — L20829](eidolon-field-math-foundations.md#^ref-008f2ac0-20829-0) (line 20829, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L2427](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2427-0) (line 2427, col 0, score 0.98)
- [eidolon-field-math-foundations — L20826](eidolon-field-math-foundations.md#^ref-008f2ac0-20826-0) (line 20826, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration Guide — L1410](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-1410-0) (line 1410, col 0, score 0.99)
- [eidolon-node-lifecycle — L780](eidolon-node-lifecycle.md#^ref-938eca9c-780-0) (line 780, col 0, score 0.98)
- [Factorio AI with External Agents — L1019](factorio-ai-with-external-agents.md#^ref-a4d90289-1019-0) (line 1019, col 0, score 0.98)
- [field-dynamics-math-blocks — L949](field-dynamics-math-blocks.md#^ref-7cfc230d-949-0) (line 949, col 0, score 0.98)
- [field-interaction-equations — L1009](field-interaction-equations.md#^ref-b09141b7-1009-0) (line 1009, col 0, score 0.98)
- [field-node-diagram-outline — L952](field-node-diagram-outline.md#^ref-1f32c94a-952-0) (line 952, col 0, score 0.98)
- [field-node-diagram-set — L868](field-node-diagram-set.md#^ref-22b989d5-868-0) (line 868, col 0, score 0.98)
- [field-node-diagram-visualizations — L849](field-node-diagram-visualizations.md#^ref-e9b27b06-849-0) (line 849, col 0, score 0.98)
- [Fnord Tracer Protocol — L1189](fnord-tracer-protocol.md#^ref-fc21f824-1189-0) (line 1189, col 0, score 0.98)
- [Functional Embedding Pipeline Refactor — L895](functional-embedding-pipeline-refactor.md#^ref-a4a25141-895-0) (line 895, col 0, score 0.98)
- [eidolon-field-math-foundations — L7742](eidolon-field-math-foundations.md#^ref-008f2ac0-7742-0) (line 7742, col 0, score 0.99)
- [Functional Refactor of TypeScript Document Processing — L7627](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-7627-0) (line 7627, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration Guide — L1422](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-1422-0) (line 1422, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration — L1375](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-1375-0) (line 1375, col 0, score 0.99)
- [Eidolon Field Abstract Model — L3330](eidolon-field-abstract-model.md#^ref-5e8b2388-3330-0) (line 3330, col 0, score 0.98)
- [Obsidian ChatGPT Plugin Integration Guide — L1423](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-1423-0) (line 1423, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration — L1376](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-1376-0) (line 1376, col 0, score 0.99)
- [Eidolon Field Abstract Model — L3269](eidolon-field-abstract-model.md#^ref-5e8b2388-3269-0) (line 3269, col 0, score 0.98)
- [eidolon-field-math-foundations — L7744](eidolon-field-math-foundations.md#^ref-008f2ac0-7744-0) (line 7744, col 0, score 0.99)
- [Functional Refactor of TypeScript Document Processing — L7629](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-7629-0) (line 7629, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L8323](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-8323-0) (line 8323, col 0, score 0.99)
- [Docops Feature Updates — L869](docops-feature-updates-2.md#^ref-cdbd21ee-869-0) (line 869, col 0, score 0.98)
- [Docops Feature Updates — L1134](docops-feature-updates.md#^ref-2792d448-1134-0) (line 1134, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L4005](dynamic-context-model-for-web-components.md#^ref-f7702bf8-4005-0) (line 4005, col 0, score 0.98)
- [Obsidian ChatGPT Plugin Integration Guide — L1417](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-1417-0) (line 1417, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration — L1370](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-1370-0) (line 1370, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L2841](chroma-toolkit-consolidation-plan.md#^ref-5020e892-2841-0) (line 2841, col 0, score 0.99)
- [field-interaction-equations — L5886](field-interaction-equations.md#^ref-b09141b7-5886-0) (line 5886, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L4970](performance-optimized-polyglot-bridge.md#^ref-f5579967-4970-0) (line 4970, col 0, score 0.99)
- [Promethean Infrastructure Setup — L4463](promethean-infrastructure-setup.md#^ref-6deed6ac-4463-0) (line 4463, col 0, score 0.99)
- [Provider-Agnostic Chat Panel Implementation — L2529](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-2529-0) (line 2529, col 0, score 0.99)
- [Pure TypeScript Search Microservice — L3161](pure-typescript-search-microservice.md#^ref-d17d3a96-3161-0) (line 3161, col 0, score 0.99)
- [TypeScript Patch for Tool Calling Support — L2063](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-2063-0) (line 2063, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L13719](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-13719-0) (line 13719, col 0, score 0.99)
- [The Jar of Echoes — L11956](the-jar-of-echoes.md#^ref-18138627-11956-0) (line 11956, col 0, score 0.99)
- [eidolon-field-math-foundations — L4214](eidolon-field-math-foundations.md#^ref-008f2ac0-4214-0) (line 4214, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L4971](performance-optimized-polyglot-bridge.md#^ref-f5579967-4971-0) (line 4971, col 0, score 0.99)
- [Promethean Infrastructure Setup — L4464](promethean-infrastructure-setup.md#^ref-6deed6ac-4464-0) (line 4464, col 0, score 0.99)
- [Layer1SurvivabilityEnvelope — L1595](layer1survivabilityenvelope.md#^ref-64a9f9f9-1595-0) (line 1595, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L5452](chroma-toolkit-consolidation-plan.md#^ref-5020e892-5452-0) (line 5452, col 0, score 0.99)
- [DSL — L3153](chunks/dsl.md#^ref-e87bc036-3153-0) (line 3153, col 0, score 0.99)
- [Window Management — L2803](chunks/window-management.md#^ref-9e8ae388-2803-0) (line 2803, col 0, score 0.99)
- [komorebi-group-window-hack — L2743](komorebi-group-window-hack.md#^ref-dd89372d-2743-0) (line 2743, col 0, score 0.99)
- [eidolon-field-math-foundations — L4215](eidolon-field-math-foundations.md#^ref-008f2ac0-4215-0) (line 4215, col 0, score 1)
- [field-interaction-equations — L5887](field-interaction-equations.md#^ref-b09141b7-5887-0) (line 5887, col 0, score 1)
- [Promethean Infrastructure Setup — L4465](promethean-infrastructure-setup.md#^ref-6deed6ac-4465-0) (line 4465, col 0, score 1)
- [Dynamic Context Model for Web Components — L7625](dynamic-context-model-for-web-components.md#^ref-f7702bf8-7625-0) (line 7625, col 0, score 0.99)
- [schema-evolution-workflow — L5550](schema-evolution-workflow.md#^ref-d8059b6a-5550-0) (line 5550, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L6385](chroma-toolkit-consolidation-plan.md#^ref-5020e892-6385-0) (line 6385, col 0, score 0.99)
- [Tooling — L2034](chunks/tooling.md#^ref-6cb4943e-2034-0) (line 2034, col 0, score 0.99)
- [eidolon-field-math-foundations — L4294](eidolon-field-math-foundations.md#^ref-008f2ac0-4294-0) (line 4294, col 0, score 0.99)
- [eidolon-field-math-foundations — L4216](eidolon-field-math-foundations.md#^ref-008f2ac0-4216-0) (line 4216, col 0, score 1)
- [eidolon-field-math-foundations — L6577](eidolon-field-math-foundations.md#^ref-008f2ac0-6577-0) (line 6577, col 0, score 0.99)
- [field-interaction-equations — L5888](field-interaction-equations.md#^ref-b09141b7-5888-0) (line 5888, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L4972](performance-optimized-polyglot-bridge.md#^ref-f5579967-4972-0) (line 4972, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L1894](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-1894-0) (line 1894, col 0, score 0.99)
- [typed-struct-compiler — L1904](typed-struct-compiler.md#^ref-78eeedf7-1904-0) (line 1904, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L5340](chroma-toolkit-consolidation-plan.md#^ref-5020e892-5340-0) (line 5340, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L3940](dynamic-context-model-for-web-components.md#^ref-f7702bf8-3940-0) (line 3940, col 0, score 0.99)
- [field-interaction-equations — L5890](field-interaction-equations.md#^ref-b09141b7-5890-0) (line 5890, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L4974](performance-optimized-polyglot-bridge.md#^ref-f5579967-4974-0) (line 4974, col 0, score 1)
- [Promethean Infrastructure Setup — L4467](promethean-infrastructure-setup.md#^ref-6deed6ac-4467-0) (line 4467, col 0, score 1)
- [Promethean Chat Activity Report — L3163](promethean-chat-activity-report.md#^ref-18344cf9-3163-0) (line 3163, col 0, score 1)
- [Promethean Notes — L3018](promethean-notes.md#^ref-1c4046b5-3018-0) (line 3018, col 0, score 1)
- [The Jar of Echoes — L6511](the-jar-of-echoes.md#^ref-18138627-6511-0) (line 6511, col 0, score 1)
- [windows-tiling-with-autohotkey — L7791](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-7791-0) (line 7791, col 0, score 1)
- [field-interaction-equations — L5891](field-interaction-equations.md#^ref-b09141b7-5891-0) (line 5891, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L4975](performance-optimized-polyglot-bridge.md#^ref-f5579967-4975-0) (line 4975, col 0, score 1)
- [Promethean Infrastructure Setup — L4468](promethean-infrastructure-setup.md#^ref-6deed6ac-4468-0) (line 4468, col 0, score 1)
- [plan-update-confirmation — L5913](plan-update-confirmation.md#^ref-b22d79c6-5913-0) (line 5913, col 0, score 1)
- [windows-tiling-with-autohotkey — L22999](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-22999-0) (line 22999, col 0, score 0.99)
- [The Jar of Echoes — L15592](the-jar-of-echoes.md#^ref-18138627-15592-0) (line 15592, col 0, score 0.99)
- [The Jar of Echoes — L14580](the-jar-of-echoes.md#^ref-18138627-14580-0) (line 14580, col 0, score 0.99)
- [The Jar of Echoes — L17933](the-jar-of-echoes.md#^ref-18138627-17933-0) (line 17933, col 0, score 1)
- [Promethean Dev Workflow Update — L20506](promethean-dev-workflow-update.md#^ref-03a5578f-20506-0) (line 20506, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L15723](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-15723-0) (line 15723, col 0, score 0.99)
- [The Jar of Echoes — L17830](the-jar-of-echoes.md#^ref-18138627-17830-0) (line 17830, col 0, score 0.99)
- [Duck's Attractor States — L15235](ducks-attractor-states.md#^ref-13951643-15235-0) (line 15235, col 0, score 0.99)
- [Promethean Dev Workflow Update — L25380](promethean-dev-workflow-update.md#^ref-03a5578f-25380-0) (line 25380, col 0, score 1)
- [Creative Moments — L13671](creative-moments.md#^ref-10d98225-13671-0) (line 13671, col 0, score 0.98)
- [Duck's Attractor States — L22719](ducks-attractor-states.md#^ref-13951643-22719-0) (line 22719, col 0, score 0.98)
- [Promethean Dev Workflow Update — L26196](promethean-dev-workflow-update.md#^ref-03a5578f-26196-0) (line 26196, col 0, score 0.98)
- [Chroma Toolkit Consolidation Plan — L5571](chroma-toolkit-consolidation-plan.md#^ref-5020e892-5571-0) (line 5571, col 0, score 0.99)
- [Promethean Dev Workflow Update — L23874](promethean-dev-workflow-update.md#^ref-03a5578f-23874-0) (line 23874, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L12509](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-12509-0) (line 12509, col 0, score 0.99)
- [Promethean Dev Workflow Update — L23537](promethean-dev-workflow-update.md#^ref-03a5578f-23537-0) (line 23537, col 0, score 0.99)
- [Promethean Dev Workflow Update — L23662](promethean-dev-workflow-update.md#^ref-03a5578f-23662-0) (line 23662, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L5572](chroma-toolkit-consolidation-plan.md#^ref-5020e892-5572-0) (line 5572, col 0, score 1)
- [eidolon-field-math-foundations — L4219](eidolon-field-math-foundations.md#^ref-008f2ac0-4219-0) (line 4219, col 0, score 1)
- [Simulation Demo — L1939](chunks/simulation-demo.md#^ref-557309a3-1939-0) (line 1939, col 0, score 0.99)
- [Eidolon Field Abstract Model — L4767](eidolon-field-abstract-model.md#^ref-5e8b2388-4767-0) (line 4767, col 0, score 0.99)
- [eidolon-field-math-foundations — L4867](eidolon-field-math-foundations.md#^ref-008f2ac0-4867-0) (line 4867, col 0, score 0.99)
- [Factorio AI with External Agents — L3681](factorio-ai-with-external-agents.md#^ref-a4d90289-3681-0) (line 3681, col 0, score 0.99)
- [field-dynamics-math-blocks — L4927](field-dynamics-math-blocks.md#^ref-7cfc230d-4927-0) (line 4927, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L5573](chroma-toolkit-consolidation-plan.md#^ref-5020e892-5573-0) (line 5573, col 0, score 1)
- [eidolon-field-math-foundations — L4220](eidolon-field-math-foundations.md#^ref-008f2ac0-4220-0) (line 4220, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L5592](chroma-toolkit-consolidation-plan.md#^ref-5020e892-5592-0) (line 5592, col 0, score 0.99)
- [Diagrams — L2719](chunks/diagrams.md#^ref-45cd25b5-2719-0) (line 2719, col 0, score 0.99)
- [Debugging Broker Connections and Agent Behavior — L2877](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2877-0) (line 2877, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L6936](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6936-0) (line 6936, col 0, score 0.99)
- [i3-bluetooth-setup — L4746](i3-bluetooth-setup.md#^ref-5e408692-4746-0) (line 4746, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L8656](migrate-to-provider-tenant-architecture.md#^ref-54382370-8656-0) (line 8656, col 0, score 0.99)
- [Model Selection for Lightweight Conversational Tasks — L5133](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-5133-0) (line 5133, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L3836](dynamic-context-model-for-web-components.md#^ref-f7702bf8-3836-0) (line 3836, col 0, score 1)
- [eidolon-field-math-foundations — L15741](eidolon-field-math-foundations.md#^ref-008f2ac0-15741-0) (line 15741, col 0, score 1)
- [Fnord Tracer Protocol — L3739](fnord-tracer-protocol.md#^ref-fc21f824-3739-0) (line 3739, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L2690](performance-optimized-polyglot-bridge.md#^ref-f5579967-2690-0) (line 2690, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L1993](chroma-toolkit-consolidation-plan.md#^ref-5020e892-1993-0) (line 1993, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L2465](promethean-copilot-intent-engine.md#^ref-ae24a280-2465-0) (line 2465, col 0, score 0.99)
- [Promethean State Format — L2304](promethean-state-format.md#^ref-23df6ddb-2304-0) (line 2304, col 0, score 0.99)
- [schema-evolution-workflow — L2561](schema-evolution-workflow.md#^ref-d8059b6a-2561-0) (line 2561, col 0, score 0.99)
- [Promethean Pipelines — L2195](promethean-pipelines.md#^ref-8b8e6103-2195-0) (line 2195, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L2995](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-2995-0) (line 2995, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L4677](dynamic-context-model-for-web-components.md#^ref-f7702bf8-4677-0) (line 4677, col 0, score 0.98)
- [plan-update-confirmation — L2893](plan-update-confirmation.md#^ref-b22d79c6-2893-0) (line 2893, col 0, score 0.98)
- [Promethean Workflow Optimization — L1173](promethean-workflow-optimization.md#^ref-d614d983-1173-0) (line 1173, col 0, score 0.98)
- [Redirecting Standard Error — L1218](redirecting-standard-error.md#^ref-b3555ede-1218-0) (line 1218, col 0, score 0.98)
- [schema-evolution-workflow — L4003](schema-evolution-workflow.md#^ref-d8059b6a-4003-0) (line 4003, col 0, score 0.98)
- [Chroma Toolkit Consolidation Plan — L5569](chroma-toolkit-consolidation-plan.md#^ref-5020e892-5569-0) (line 5569, col 0, score 0.99)
- [Model Upgrade Calm-Down Guide — L3249](model-upgrade-calm-down-guide.md#^ref-db74343f-3249-0) (line 3249, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L1725](promethean-copilot-intent-engine.md#^ref-ae24a280-1725-0) (line 1725, col 0, score 0.99)
- [Promethean Pipelines — L3699](promethean-pipelines.md#^ref-8b8e6103-3699-0) (line 3699, col 0, score 0.99)
- [i3-bluetooth-setup — L3613](i3-bluetooth-setup.md#^ref-5e408692-3613-0) (line 3613, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L6959](migrate-to-provider-tenant-architecture.md#^ref-54382370-6959-0) (line 6959, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L4044](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-4044-0) (line 4044, col 0, score 1)
- [plan-update-confirmation — L7764](plan-update-confirmation.md#^ref-b22d79c6-7764-0) (line 7764, col 0, score 1)
- [Promethean Infrastructure Setup — L4479](promethean-infrastructure-setup.md#^ref-6deed6ac-4479-0) (line 4479, col 0, score 1)
- [eidolon-field-math-foundations — L4226](eidolon-field-math-foundations.md#^ref-008f2ac0-4226-0) (line 4226, col 0, score 1)
- [i3-bluetooth-setup — L3614](i3-bluetooth-setup.md#^ref-5e408692-3614-0) (line 3614, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L6960](migrate-to-provider-tenant-architecture.md#^ref-54382370-6960-0) (line 6960, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L4045](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-4045-0) (line 4045, col 0, score 1)
- [plan-update-confirmation — L7765](plan-update-confirmation.md#^ref-b22d79c6-7765-0) (line 7765, col 0, score 1)
- [eidolon-field-math-foundations — L4227](eidolon-field-math-foundations.md#^ref-008f2ac0-4227-0) (line 4227, col 0, score 1)
- [field-interaction-equations — L5903](field-interaction-equations.md#^ref-b09141b7-5903-0) (line 5903, col 0, score 0.99)
- [Promethean Infrastructure Setup — L4481](promethean-infrastructure-setup.md#^ref-6deed6ac-4481-0) (line 4481, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L1924](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-1924-0) (line 1924, col 0, score 0.99)
- [JavaScript — L1699](chunks/javascript.md#^ref-c1618c66-1699-0) (line 1699, col 0, score 0.99)
- [eidolon-field-math-foundations — L4228](eidolon-field-math-foundations.md#^ref-008f2ac0-4228-0) (line 4228, col 0, score 0.99)
- [field-interaction-equations — L5904](field-interaction-equations.md#^ref-b09141b7-5904-0) (line 5904, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L4985](performance-optimized-polyglot-bridge.md#^ref-f5579967-4985-0) (line 4985, col 0, score 0.99)
- [TypeScript Patch for Tool Calling Support — L3462](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-3462-0) (line 3462, col 0, score 0.99)
- [i3-bluetooth-setup — L4117](i3-bluetooth-setup.md#^ref-5e408692-4117-0) (line 4117, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L3301](migrate-to-provider-tenant-architecture.md#^ref-54382370-3301-0) (line 3301, col 0, score 0.99)
- [Stateful Partitions and Rebalancing — L4376](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-4376-0) (line 4376, col 0, score 0.99)
- [TypeScript Patch for Tool Calling Support — L5132](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-5132-0) (line 5132, col 0, score 0.99)
- [zero-copy-snapshots-and-workers — L3193](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-3193-0) (line 3193, col 0, score 0.99)
- [TypeScript Patch for Tool Calling Support — L1949](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-1949-0) (line 1949, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L2102](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2102-0) (line 2102, col 0, score 0.99)
- [ripple-propagation-demo — L2058](ripple-propagation-demo.md#^ref-8430617b-2058-0) (line 2058, col 0, score 0.99)
- [Factorio AI with External Agents — L2033](factorio-ai-with-external-agents.md#^ref-a4d90289-2033-0) (line 2033, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L3300](migrate-to-provider-tenant-architecture.md#^ref-54382370-3300-0) (line 3300, col 0, score 0.99)
- [Model Upgrade Calm-Down Guide — L2100](model-upgrade-calm-down-guide.md#^ref-db74343f-2100-0) (line 2100, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L3800](chroma-toolkit-consolidation-plan.md#^ref-5020e892-3800-0) (line 3800, col 0, score 0.98)
- [eidolon-field-math-foundations — L4565](eidolon-field-math-foundations.md#^ref-008f2ac0-4565-0) (line 4565, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L6381](migrate-to-provider-tenant-architecture.md#^ref-54382370-6381-0) (line 6381, col 0, score 0.98)
- [Model Upgrade Calm-Down Guide — L2101](model-upgrade-calm-down-guide.md#^ref-db74343f-2101-0) (line 2101, col 0, score 0.99)
- [JavaScript — L1666](chunks/javascript.md#^ref-c1618c66-1666-0) (line 1666, col 0, score 0.98)
- [Unique Info Dump Index — L4008](unique-info-dump-index.md#^ref-30ec3ba6-4008-0) (line 4008, col 0, score 0.98)
- [TypeScript Patch for Tool Calling Support — L1952](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-1952-0) (line 1952, col 0, score 0.98)
- [Model Upgrade Calm-Down Guide — L2112](model-upgrade-calm-down-guide.md#^ref-db74343f-2112-0) (line 2112, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L6159](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6159-0) (line 6159, col 0, score 0.98)
- [eidolon-field-math-foundations — L4274](eidolon-field-math-foundations.md#^ref-008f2ac0-4274-0) (line 4274, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L10096](migrate-to-provider-tenant-architecture.md#^ref-54382370-10096-0) (line 10096, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L4925](performance-optimized-polyglot-bridge.md#^ref-f5579967-4925-0) (line 4925, col 0, score 0.99)
- [Post-Linguistic Transhuman Design Frameworks — L3869](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-3869-0) (line 3869, col 0, score 0.99)
- [Promethean Infrastructure Setup — L4520](promethean-infrastructure-setup.md#^ref-6deed6ac-4520-0) (line 4520, col 0, score 0.99)
- [Provider-Agnostic Chat Panel Implementation — L3119](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-3119-0) (line 3119, col 0, score 0.99)
- [Pure TypeScript Search Microservice — L6349](pure-typescript-search-microservice.md#^ref-d17d3a96-6349-0) (line 6349, col 0, score 0.99)
- [TypeScript Patch for Tool Calling Support — L3457](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-3457-0) (line 3457, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L1881](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-1881-0) (line 1881, col 0, score 1)
- [Promethean Dev Workflow Update — L12814](promethean-dev-workflow-update.md#^ref-03a5578f-12814-0) (line 12814, col 0, score 1)
- [Promethean Dev Workflow Update — L23932](promethean-dev-workflow-update.md#^ref-03a5578f-23932-0) (line 23932, col 0, score 0.99)
- [The Jar of Echoes — L16340](the-jar-of-echoes.md#^ref-18138627-16340-0) (line 16340, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L20805](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-20805-0) (line 20805, col 0, score 0.99)
- [field-interaction-equations — L5910](field-interaction-equations.md#^ref-b09141b7-5910-0) (line 5910, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L4990](performance-optimized-polyglot-bridge.md#^ref-f5579967-4990-0) (line 4990, col 0, score 0.99)
- [Promethean Infrastructure Setup — L4487](promethean-infrastructure-setup.md#^ref-6deed6ac-4487-0) (line 4487, col 0, score 0.99)
- [Fnord Tracer Protocol — L2988](fnord-tracer-protocol.md#^ref-fc21f824-2988-0) (line 2988, col 0, score 0.99)
- [Duck's Attractor States — L20512](ducks-attractor-states.md#^ref-13951643-20512-0) (line 20512, col 0, score 0.99)
- [eidolon-field-math-foundations — L4234](eidolon-field-math-foundations.md#^ref-008f2ac0-4234-0) (line 4234, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L4991](performance-optimized-polyglot-bridge.md#^ref-f5579967-4991-0) (line 4991, col 0, score 1)
- [Promethean Infrastructure Setup — L4488](promethean-infrastructure-setup.md#^ref-6deed6ac-4488-0) (line 4488, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L5405](chroma-toolkit-consolidation-plan.md#^ref-5020e892-5405-0) (line 5405, col 0, score 0.99)
- [Duck's Attractor States — L3866](ducks-attractor-states.md#^ref-13951643-3866-0) (line 3866, col 0, score 0.99)
- [Duck's Self-Referential Perceptual Loop — L2379](ducks-self-referential-perceptual-loop.md#^ref-71726f04-2379-0) (line 2379, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L9193](migrate-to-provider-tenant-architecture.md#^ref-54382370-9193-0) (line 9193, col 0, score 0.99)
- [Promethean Pipelines — L4187](promethean-pipelines.md#^ref-8b8e6103-4187-0) (line 4187, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L3823](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-3823-0) (line 3823, col 0, score 0.97)
- [Model Upgrade Calm-Down Guide — L3952](model-upgrade-calm-down-guide.md#^ref-db74343f-3952-0) (line 3952, col 0, score 0.97)
- [obsidian-ignore-node-modules-regex — L3357](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-3357-0) (line 3357, col 0, score 0.97)
- [OpenAPI Validation Report — L1841](openapi-validation-report.md#^ref-5c152b08-1841-0) (line 1841, col 0, score 0.97)
- [ParticleSimulationWithCanvasAndFFmpeg — L5084](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-5084-0) (line 5084, col 0, score 0.97)
- [Per-Domain Policy System for JS Crawler — L3619](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3619-0) (line 3619, col 0, score 0.97)
- [Pipeline Enhancements — L1002](pipeline-enhancements.md#^ref-e2135d9f-1002-0) (line 1002, col 0, score 0.97)
- [plan-update-confirmation — L7999](plan-update-confirmation.md#^ref-b22d79c6-7999-0) (line 7999, col 0, score 0.97)
- [polyglot-repl-interface-layer — L3306](polyglot-repl-interface-layer.md#^ref-9c79206d-3306-0) (line 3306, col 0, score 0.97)
- [eidolon-field-math-foundations — L4236](eidolon-field-math-foundations.md#^ref-008f2ac0-4236-0) (line 4236, col 0, score 0.99)
- [field-interaction-equations — L5912](field-interaction-equations.md#^ref-b09141b7-5912-0) (line 5912, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L4992](performance-optimized-polyglot-bridge.md#^ref-f5579967-4992-0) (line 4992, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L2105](promethean-copilot-intent-engine.md#^ref-ae24a280-2105-0) (line 2105, col 0, score 0.99)
- [Pure TypeScript Search Microservice — L2117](pure-typescript-search-microservice.md#^ref-d17d3a96-2117-0) (line 2117, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L2454](dynamic-context-model-for-web-components.md#^ref-f7702bf8-2454-0) (line 2454, col 0, score 0.99)
- [eidolon-field-math-foundations — L4296](eidolon-field-math-foundations.md#^ref-008f2ac0-4296-0) (line 4296, col 0, score 0.99)
- [zero-copy-snapshots-and-workers — L1779](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-1779-0) (line 1779, col 0, score 1)
- [Fnord Tracer Protocol — L3042](fnord-tracer-protocol.md#^ref-fc21f824-3042-0) (line 3042, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L3373](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-3373-0) (line 3373, col 0, score 1)
- [plan-update-confirmation — L5425](plan-update-confirmation.md#^ref-b22d79c6-5425-0) (line 5425, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L4202](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-4202-0) (line 4202, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L3114](performance-optimized-polyglot-bridge.md#^ref-f5579967-3114-0) (line 3114, col 0, score 1)
- [JavaScript — L1685](chunks/javascript.md#^ref-c1618c66-1685-0) (line 1685, col 0, score 1)
- [Unique Info Dump Index — L4037](unique-info-dump-index.md#^ref-30ec3ba6-4037-0) (line 4037, col 0, score 1)
- [Fnord Tracer Protocol — L3043](fnord-tracer-protocol.md#^ref-fc21f824-3043-0) (line 3043, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L3374](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-3374-0) (line 3374, col 0, score 1)
- [plan-update-confirmation — L5427](plan-update-confirmation.md#^ref-b22d79c6-5427-0) (line 5427, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L4203](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-4203-0) (line 4203, col 0, score 1)
- [JavaScript — L1687](chunks/javascript.md#^ref-c1618c66-1687-0) (line 1687, col 0, score 1)
- [Unique Info Dump Index — L4039](unique-info-dump-index.md#^ref-30ec3ba6-4039-0) (line 4039, col 0, score 1)
- [schema-evolution-workflow — L2614](schema-evolution-workflow.md#^ref-d8059b6a-2614-0) (line 2614, col 0, score 0.99)
- [typed-struct-compiler — L2049](typed-struct-compiler.md#^ref-78eeedf7-2049-0) (line 2049, col 0, score 0.99)
- [zero-copy-snapshots-and-workers — L1778](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-1778-0) (line 1778, col 0, score 1)
- [Fnord Tracer Protocol — L3044](fnord-tracer-protocol.md#^ref-fc21f824-3044-0) (line 3044, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L3375](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-3375-0) (line 3375, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L4205](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-4205-0) (line 4205, col 0, score 1)
- [JavaScript — L1686](chunks/javascript.md#^ref-c1618c66-1686-0) (line 1686, col 0, score 1)
- [Unique Info Dump Index — L4038](unique-info-dump-index.md#^ref-30ec3ba6-4038-0) (line 4038, col 0, score 1)
- [typed-struct-compiler — L2050](typed-struct-compiler.md#^ref-78eeedf7-2050-0) (line 2050, col 0, score 0.99)
- [Factorio AI with External Agents — L2483](factorio-ai-with-external-agents.md#^ref-a4d90289-2483-0) (line 2483, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L6025](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6025-0) (line 6025, col 0, score 1)
- [Factorio AI with External Agents — L1791](factorio-ai-with-external-agents.md#^ref-a4d90289-1791-0) (line 1791, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L3401](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3401-0) (line 3401, col 0, score 1)
- [schema-evolution-workflow — L2618](schema-evolution-workflow.md#^ref-d8059b6a-2618-0) (line 2618, col 0, score 1)
- [typed-struct-compiler — L2054](typed-struct-compiler.md#^ref-78eeedf7-2054-0) (line 2054, col 0, score 1)
- [field-node-diagram-visualizations — L1757](field-node-diagram-visualizations.md#^ref-e9b27b06-1757-0) (line 1757, col 0, score 0.99)
- [Fnord Tracer Protocol — L3253](fnord-tracer-protocol.md#^ref-fc21f824-3253-0) (line 3253, col 0, score 0.99)
- [i3-bluetooth-setup — L2739](i3-bluetooth-setup.md#^ref-5e408692-2739-0) (line 2739, col 0, score 0.99)
- [Layer1SurvivabilityEnvelope — L1890](layer1survivabilityenvelope.md#^ref-64a9f9f9-1890-0) (line 1890, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L4295](migrate-to-provider-tenant-architecture.md#^ref-54382370-4295-0) (line 4295, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L1974](promethean-copilot-intent-engine.md#^ref-ae24a280-1974-0) (line 1974, col 0, score 0.99)
- [Promethean Dev Workflow Update — L2559](promethean-dev-workflow-update.md#^ref-03a5578f-2559-0) (line 2559, col 0, score 0.99)
- [Prometheus Observability Stack — L2961](prometheus-observability-stack.md#^ref-e90b5a16-2961-0) (line 2961, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L4552](migrate-to-provider-tenant-architecture.md#^ref-54382370-4552-0) (line 4552, col 0, score 1)
- [graph-ds — L1993](graph-ds.md#^ref-6620e2f2-1993-0) (line 1993, col 0, score 1)
- [unique-templates — L854](templates/unique-templates.md#^ref-c26f0044-854-0) (line 854, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L5495](chroma-toolkit-consolidation-plan.md#^ref-5020e892-5495-0) (line 5495, col 0, score 1)
- [eidolon-field-math-foundations — L4197](eidolon-field-math-foundations.md#^ref-008f2ac0-4197-0) (line 4197, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L4553](migrate-to-provider-tenant-architecture.md#^ref-54382370-4553-0) (line 4553, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L2487](model-upgrade-calm-down-guide.md#^ref-db74343f-2487-0) (line 2487, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L4899](performance-optimized-polyglot-bridge.md#^ref-f5579967-4899-0) (line 4899, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L4551](migrate-to-provider-tenant-architecture.md#^ref-54382370-4551-0) (line 4551, col 0, score 0.99)
- [Docops Feature Updates — L1057](docops-feature-updates.md#^ref-2792d448-1057-0) (line 1057, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L2278](dynamic-context-model-for-web-components.md#^ref-f7702bf8-2278-0) (line 2278, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration Guide — L1678](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-1678-0) (line 1678, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration — L1627](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-1627-0) (line 1627, col 0, score 0.99)
- [Obsidian Templating Plugins Integration Guide — L1849](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-1849-0) (line 1849, col 0, score 0.99)
- [Promethean Pipelines — L2916](promethean-pipelines.md#^ref-8b8e6103-2916-0) (line 2916, col 0, score 0.99)
- [plan-update-confirmation — L3439](plan-update-confirmation.md#^ref-b22d79c6-3439-0) (line 3439, col 0, score 0.98)
- [Eidolon Field Abstract Model — L2402](eidolon-field-abstract-model.md#^ref-5e8b2388-2402-0) (line 2402, col 0, score 1)
- [plan-update-confirmation — L4826](plan-update-confirmation.md#^ref-b22d79c6-4826-0) (line 4826, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L3570](promethean-copilot-intent-engine.md#^ref-ae24a280-3570-0) (line 3570, col 0, score 1)
- [Promethean State Format — L2757](promethean-state-format.md#^ref-23df6ddb-2757-0) (line 2757, col 0, score 1)
- [Prompt_Folder_Bootstrap — L3162](prompt-folder-bootstrap.md#^ref-bd4f0976-3162-0) (line 3162, col 0, score 1)
- [Mathematics Sampler — L1328](mathematics-sampler.md#^ref-b5e0183e-1328-0) (line 1328, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L2699](migrate-to-provider-tenant-architecture.md#^ref-54382370-2699-0) (line 2699, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L3737](performance-optimized-polyglot-bridge.md#^ref-f5579967-3737-0) (line 3737, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L3569](promethean-copilot-intent-engine.md#^ref-ae24a280-3569-0) (line 3569, col 0, score 0.99)
- [field-interaction-equations — L1885](field-interaction-equations.md#^ref-b09141b7-1885-0) (line 1885, col 0, score 0.98)
- [homeostasis-decay-formulas — L3508](homeostasis-decay-formulas.md#^ref-37b5d236-3508-0) (line 3508, col 0, score 0.98)
- [Layer1SurvivabilityEnvelope — L2405](layer1survivabilityenvelope.md#^ref-64a9f9f9-2405-0) (line 2405, col 0, score 0.98)
- [Mathematics Sampler — L1327](mathematics-sampler.md#^ref-b5e0183e-1327-0) (line 1327, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L3568](promethean-copilot-intent-engine.md#^ref-ae24a280-3568-0) (line 3568, col 0, score 1)
- [Stateful Partitions and Rebalancing — L2977](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-2977-0) (line 2977, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L3786](dynamic-context-model-for-web-components.md#^ref-f7702bf8-3786-0) (line 3786, col 0, score 0.99)
- [Fnord Tracer Protocol — L4530](fnord-tracer-protocol.md#^ref-fc21f824-4530-0) (line 4530, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L2469](dynamic-context-model-for-web-components.md#^ref-f7702bf8-2469-0) (line 2469, col 0, score 0.99)
- [plan-update-confirmation — L7187](plan-update-confirmation.md#^ref-b22d79c6-7187-0) (line 7187, col 0, score 0.99)
- [Promethean Dev Workflow Update — L1781](promethean-dev-workflow-update.md#^ref-03a5578f-1781-0) (line 1781, col 0, score 0.99)
- [Prometheus Observability Stack — L2527](prometheus-observability-stack.md#^ref-e90b5a16-2527-0) (line 2527, col 0, score 0.99)
- [Pure TypeScript Search Microservice — L2169](pure-typescript-search-microservice.md#^ref-d17d3a96-2169-0) (line 2169, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L2589](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-2589-0) (line 2589, col 0, score 0.99)
- [Promethean Infrastructure Setup — L3851](promethean-infrastructure-setup.md#^ref-6deed6ac-3851-0) (line 3851, col 0, score 1)
- [Promethean Pipelines — L3369](promethean-pipelines.md#^ref-8b8e6103-3369-0) (line 3369, col 0, score 1)
- [Promethean State Format — L2759](promethean-state-format.md#^ref-23df6ddb-2759-0) (line 2759, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L3839](performance-optimized-polyglot-bridge.md#^ref-f5579967-3839-0) (line 3839, col 0, score 1)
- [Prompt_Folder_Bootstrap — L3157](prompt-folder-bootstrap.md#^ref-bd4f0976-3157-0) (line 3157, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L1750](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-1750-0) (line 1750, col 0, score 1)
- [plan-update-confirmation — L4822](plan-update-confirmation.md#^ref-b22d79c6-4822-0) (line 4822, col 0, score 1)
- [Promethean Infrastructure Setup — L3852](promethean-infrastructure-setup.md#^ref-6deed6ac-3852-0) (line 3852, col 0, score 1)
- [Promethean Pipelines — L3370](promethean-pipelines.md#^ref-8b8e6103-3370-0) (line 3370, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L3838](performance-optimized-polyglot-bridge.md#^ref-f5579967-3838-0) (line 3838, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L1751](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-1751-0) (line 1751, col 0, score 1)
- [plan-update-confirmation — L4821](plan-update-confirmation.md#^ref-b22d79c6-4821-0) (line 4821, col 0, score 1)
- [Promethean Infrastructure Setup — L3853](promethean-infrastructure-setup.md#^ref-6deed6ac-3853-0) (line 3853, col 0, score 1)
- [Promethean Pipelines — L3371](promethean-pipelines.md#^ref-8b8e6103-3371-0) (line 3371, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L3840](performance-optimized-polyglot-bridge.md#^ref-f5579967-3840-0) (line 3840, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L2240](migrate-to-provider-tenant-architecture.md#^ref-54382370-2240-0) (line 2240, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L3462](performance-optimized-polyglot-bridge.md#^ref-f5579967-3462-0) (line 3462, col 0, score 1)
- [Self-Agency in AI Interaction — L2311](self-agency-in-ai-interaction.md#^ref-49a9a860-2311-0) (line 2311, col 0, score 0.97)
- [Debugging Broker Connections and Agent Behavior — L3791](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-3791-0) (line 3791, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L9058](dynamic-context-model-for-web-components.md#^ref-f7702bf8-9058-0) (line 9058, col 0, score 0.97)
- [Obsidian ChatGPT Plugin Integration Guide — L2396](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-2396-0) (line 2396, col 0, score 0.97)
- [Obsidian ChatGPT Plugin Integration — L2185](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-2185-0) (line 2185, col 0, score 0.97)
- [plan-update-confirmation — L5236](plan-update-confirmation.md#^ref-b22d79c6-5236-0) (line 5236, col 0, score 0.99)
- [polyglot-repl-interface-layer — L1788](polyglot-repl-interface-layer.md#^ref-9c79206d-1788-0) (line 1788, col 0, score 0.99)
- [i3-bluetooth-setup — L2460](i3-bluetooth-setup.md#^ref-5e408692-2460-0) (line 2460, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L5543](migrate-to-provider-tenant-architecture.md#^ref-54382370-5543-0) (line 5543, col 0, score 0.99)
- [Provider-Agnostic Chat Panel Implementation — L2713](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-2713-0) (line 2713, col 0, score 0.99)
- [Factorio AI with External Agents — L2053](factorio-ai-with-external-agents.md#^ref-a4d90289-2053-0) (line 2053, col 0, score 0.99)
- [JavaScript — L1482](chunks/javascript.md#^ref-c1618c66-1482-0) (line 1482, col 0, score 1)
- [typed-struct-compiler — L3504](typed-struct-compiler.md#^ref-78eeedf7-3504-0) (line 3504, col 0, score 1)
- [Unique Info Dump Index — L3353](unique-info-dump-index.md#^ref-30ec3ba6-3353-0) (line 3353, col 0, score 1)
- [Promethean Pipelines — L2009](promethean-pipelines.md#^ref-8b8e6103-2009-0) (line 2009, col 0, score 0.99)
- [Unique Info Dump Index — L2109](unique-info-dump-index.md#^ref-30ec3ba6-2109-0) (line 2109, col 0, score 0.96)
- [plan-update-confirmation — L6216](plan-update-confirmation.md#^ref-b22d79c6-6216-0) (line 6216, col 0, score 0.96)
- [eidolon-field-math-foundations — L2374](eidolon-field-math-foundations.md#^ref-008f2ac0-2374-0) (line 2374, col 0, score 0.95)
- [JavaScript — L1480](chunks/javascript.md#^ref-c1618c66-1480-0) (line 1480, col 0, score 1)
- [typed-struct-compiler — L3502](typed-struct-compiler.md#^ref-78eeedf7-3502-0) (line 3502, col 0, score 1)
- [Unique Info Dump Index — L3351](unique-info-dump-index.md#^ref-30ec3ba6-3351-0) (line 3351, col 0, score 1)
- [JavaScript — L1481](chunks/javascript.md#^ref-c1618c66-1481-0) (line 1481, col 0, score 1)
- [graph-ds — L2405](graph-ds.md#^ref-6620e2f2-2405-0) (line 2405, col 0, score 0.99)
- [Promethean Pipelines — L2008](promethean-pipelines.md#^ref-8b8e6103-2008-0) (line 2008, col 0, score 0.99)
- [graph-ds — L2407](graph-ds.md#^ref-6620e2f2-2407-0) (line 2407, col 0, score 1)
- [Promethean Pipelines — L2010](promethean-pipelines.md#^ref-8b8e6103-2010-0) (line 2010, col 0, score 1)
- [typed-struct-compiler — L3500](typed-struct-compiler.md#^ref-78eeedf7-3500-0) (line 3500, col 0, score 0.99)
- [Unique Info Dump Index — L3350](unique-info-dump-index.md#^ref-30ec3ba6-3350-0) (line 3350, col 0, score 0.99)
- [The Jar of Echoes — L2391](the-jar-of-echoes.md#^ref-18138627-2391-0) (line 2391, col 0, score 0.95)
- [Diagrams — L1212](chunks/diagrams.md#^ref-45cd25b5-1212-0) (line 1212, col 0, score 0.95)
- [Math Fundamentals — L1536](chunks/math-fundamentals.md#^ref-c6e87433-1536-0) (line 1536, col 0, score 0.95)
- [sibilant-macro-targets — L2186](sibilant-macro-targets.md#^ref-c5c9a5c6-2186-0) (line 2186, col 0, score 0.99)
- [ts-to-lisp-transpiler — L2524](ts-to-lisp-transpiler.md#^ref-ba11486b-2524-0) (line 2524, col 0, score 0.99)
- [typed-struct-compiler — L3966](typed-struct-compiler.md#^ref-78eeedf7-3966-0) (line 3966, col 0, score 0.99)
- [Unique Info Dump Index — L7228](unique-info-dump-index.md#^ref-30ec3ba6-7228-0) (line 7228, col 0, score 0.99)
- [zero-copy-snapshots-and-workers — L4603](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-4603-0) (line 4603, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L4337](migrate-to-provider-tenant-architecture.md#^ref-54382370-4337-0) (line 4337, col 0, score 1)
- [plan-update-confirmation — L6331](plan-update-confirmation.md#^ref-b22d79c6-6331-0) (line 6331, col 0, score 1)
- [Eidolon Field Abstract Model — L3363](eidolon-field-abstract-model.md#^ref-5e8b2388-3363-0) (line 3363, col 0, score 0.97)
- [DSL — L2287](chunks/dsl.md#^ref-e87bc036-2287-0) (line 2287, col 0, score 1)
- [ts-to-lisp-transpiler — L2525](ts-to-lisp-transpiler.md#^ref-ba11486b-2525-0) (line 2525, col 0, score 1)
- [typed-struct-compiler — L3967](typed-struct-compiler.md#^ref-78eeedf7-3967-0) (line 3967, col 0, score 1)
- [Unique Info Dump Index — L7229](unique-info-dump-index.md#^ref-30ec3ba6-7229-0) (line 7229, col 0, score 1)
- [zero-copy-snapshots-and-workers — L4604](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-4604-0) (line 4604, col 0, score 1)
- [The Jar of Echoes — L2716](the-jar-of-echoes.md#^ref-18138627-2716-0) (line 2716, col 0, score 0.99)
- [Window Management — L1369](chunks/window-management.md#^ref-9e8ae388-1369-0) (line 1369, col 0, score 0.99)
- [zero-copy-snapshots-and-workers — L4621](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-4621-0) (line 4621, col 0, score 0.99)
- [DSL — L2288](chunks/dsl.md#^ref-e87bc036-2288-0) (line 2288, col 0, score 0.99)
- [sibilant-macro-targets — L2187](sibilant-macro-targets.md#^ref-c5c9a5c6-2187-0) (line 2187, col 0, score 0.99)
- [typed-struct-compiler — L3968](typed-struct-compiler.md#^ref-78eeedf7-3968-0) (line 3968, col 0, score 0.99)
- [Unique Info Dump Index — L7230](unique-info-dump-index.md#^ref-30ec3ba6-7230-0) (line 7230, col 0, score 0.99)
- [The Jar of Echoes — L2717](the-jar-of-echoes.md#^ref-18138627-2717-0) (line 2717, col 0, score 0.98)
- [Window Management — L1370](chunks/window-management.md#^ref-9e8ae388-1370-0) (line 1370, col 0, score 0.98)
- [eidolon-field-math-foundations — L24581](eidolon-field-math-foundations.md#^ref-008f2ac0-24581-0) (line 24581, col 0, score 0.98)
- [Promethean Dev Workflow Update — L22780](promethean-dev-workflow-update.md#^ref-03a5578f-22780-0) (line 22780, col 0, score 0.98)
- [graph-ds — L2199](graph-ds.md#^ref-6620e2f2-2199-0) (line 2199, col 0, score 1)
- [Pure TypeScript Search Microservice — L3210](pure-typescript-search-microservice.md#^ref-d17d3a96-3210-0) (line 3210, col 0, score 1)
- [Stateful Partitions and Rebalancing — L2270](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-2270-0) (line 2270, col 0, score 1)
- [typed-struct-compiler — L2521](typed-struct-compiler.md#^ref-78eeedf7-2521-0) (line 2521, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L1467](functional-embedding-pipeline-refactor.md#^ref-a4a25141-1467-0) (line 1467, col 0, score 1)
- [Promethean Dev Workflow Update — L2147](promethean-dev-workflow-update.md#^ref-03a5578f-2147-0) (line 2147, col 0, score 1)
- [plan-update-confirmation — L6328](plan-update-confirmation.md#^ref-b22d79c6-6328-0) (line 6328, col 0, score 0.99)
- [eidolon-field-math-foundations — L3131](eidolon-field-math-foundations.md#^ref-008f2ac0-3131-0) (line 3131, col 0, score 0.97)
- [Pure TypeScript Search Microservice — L3211](pure-typescript-search-microservice.md#^ref-d17d3a96-3211-0) (line 3211, col 0, score 1)
- [Stateful Partitions and Rebalancing — L2271](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-2271-0) (line 2271, col 0, score 1)
- [typed-struct-compiler — L2522](typed-struct-compiler.md#^ref-78eeedf7-2522-0) (line 2522, col 0, score 1)
- [Promethean Dev Workflow Update — L2148](promethean-dev-workflow-update.md#^ref-03a5578f-2148-0) (line 2148, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L1974](migrate-to-provider-tenant-architecture.md#^ref-54382370-1974-0) (line 1974, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L3262](dynamic-context-model-for-web-components.md#^ref-f7702bf8-3262-0) (line 3262, col 0, score 0.98)
- [Performance-Optimized-Polyglot-Bridge — L2154](performance-optimized-polyglot-bridge.md#^ref-f5579967-2154-0) (line 2154, col 0, score 0.98)
- [Redirecting Standard Error — L1611](redirecting-standard-error.md#^ref-b3555ede-1611-0) (line 1611, col 0, score 0.98)
- [typed-struct-compiler — L2776](typed-struct-compiler.md#^ref-78eeedf7-2776-0) (line 2776, col 0, score 0.98)
- [graph-ds — L2203](graph-ds.md#^ref-6620e2f2-2203-0) (line 2203, col 0, score 1)
- [Stateful Partitions and Rebalancing — L2275](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-2275-0) (line 2275, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L4336](migrate-to-provider-tenant-architecture.md#^ref-54382370-4336-0) (line 4336, col 0, score 1)
- [plan-update-confirmation — L6330](plan-update-confirmation.md#^ref-b22d79c6-6330-0) (line 6330, col 0, score 1)
- [komorebi-group-window-hack — L1607](komorebi-group-window-hack.md#^ref-dd89372d-1607-0) (line 1607, col 0, score 1)
- [DSL — L2246](chunks/dsl.md#^ref-e87bc036-2246-0) (line 2246, col 0, score 1)
- [JavaScript — L2643](chunks/javascript.md#^ref-c1618c66-2643-0) (line 2643, col 0, score 1)
- [Window Management — L2731](chunks/window-management.md#^ref-9e8ae388-2731-0) (line 2731, col 0, score 1)
- [graph-ds — L2204](graph-ds.md#^ref-6620e2f2-2204-0) (line 2204, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L6613](chroma-toolkit-consolidation-plan.md#^ref-5020e892-6613-0) (line 6613, col 0, score 0.99)
- [JavaScript — L2644](chunks/javascript.md#^ref-c1618c66-2644-0) (line 2644, col 0, score 0.99)
- [Window Management — L2732](chunks/window-management.md#^ref-9e8ae388-2732-0) (line 2732, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L6109](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6109-0) (line 6109, col 0, score 0.99)
- [komorebi-group-window-hack — L2670](komorebi-group-window-hack.md#^ref-dd89372d-2670-0) (line 2670, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L4338](migrate-to-provider-tenant-architecture.md#^ref-54382370-4338-0) (line 4338, col 0, score 1)
- [plan-update-confirmation — L6332](plan-update-confirmation.md#^ref-b22d79c6-6332-0) (line 6332, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L6614](chroma-toolkit-consolidation-plan.md#^ref-5020e892-6614-0) (line 6614, col 0, score 0.99)
- [DSL — L2247](chunks/dsl.md#^ref-e87bc036-2247-0) (line 2247, col 0, score 0.99)
- [Window Management — L2733](chunks/window-management.md#^ref-9e8ae388-2733-0) (line 2733, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L6110](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6110-0) (line 6110, col 0, score 0.99)
- [komorebi-group-window-hack — L2671](komorebi-group-window-hack.md#^ref-dd89372d-2671-0) (line 2671, col 0, score 0.99)
- [sibilant-macro-targets — L5198](sibilant-macro-targets.md#^ref-c5c9a5c6-5198-0) (line 5198, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L4339](migrate-to-provider-tenant-architecture.md#^ref-54382370-4339-0) (line 4339, col 0, score 1)
- [plan-update-confirmation — L6333](plan-update-confirmation.md#^ref-b22d79c6-6333-0) (line 6333, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L6615](chroma-toolkit-consolidation-plan.md#^ref-5020e892-6615-0) (line 6615, col 0, score 0.99)
- [DSL — L2248](chunks/dsl.md#^ref-e87bc036-2248-0) (line 2248, col 0, score 0.99)
- [JavaScript — L2645](chunks/javascript.md#^ref-c1618c66-2645-0) (line 2645, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L6111](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6111-0) (line 6111, col 0, score 0.99)
- [komorebi-group-window-hack — L2672](komorebi-group-window-hack.md#^ref-dd89372d-2672-0) (line 2672, col 0, score 0.99)
- [sibilant-macro-targets — L5199](sibilant-macro-targets.md#^ref-c5c9a5c6-5199-0) (line 5199, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L4340](migrate-to-provider-tenant-architecture.md#^ref-54382370-4340-0) (line 4340, col 0, score 1)
- [plan-update-confirmation — L6334](plan-update-confirmation.md#^ref-b22d79c6-6334-0) (line 6334, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L2755](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-2755-0) (line 2755, col 0, score 1)
- [plan-update-confirmation — L6016](plan-update-confirmation.md#^ref-b22d79c6-6016-0) (line 6016, col 0, score 1)
- [Pure TypeScript Search Microservice — L2422](pure-typescript-search-microservice.md#^ref-d17d3a96-2422-0) (line 2422, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L6616](chroma-toolkit-consolidation-plan.md#^ref-5020e892-6616-0) (line 6616, col 0, score 1)
- [DSL — L2249](chunks/dsl.md#^ref-e87bc036-2249-0) (line 2249, col 0, score 1)
- [JavaScript — L2646](chunks/javascript.md#^ref-c1618c66-2646-0) (line 2646, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L4341](migrate-to-provider-tenant-architecture.md#^ref-54382370-4341-0) (line 4341, col 0, score 1)
- [plan-update-confirmation — L6335](plan-update-confirmation.md#^ref-b22d79c6-6335-0) (line 6335, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L6617](chroma-toolkit-consolidation-plan.md#^ref-5020e892-6617-0) (line 6617, col 0, score 0.99)
- [DSL — L2250](chunks/dsl.md#^ref-e87bc036-2250-0) (line 2250, col 0, score 0.99)
- [JavaScript — L2647](chunks/javascript.md#^ref-c1618c66-2647-0) (line 2647, col 0, score 0.99)
- [Window Management — L2735](chunks/window-management.md#^ref-9e8ae388-2735-0) (line 2735, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L6112](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6112-0) (line 6112, col 0, score 0.99)
- [sibilant-macro-targets — L5201](sibilant-macro-targets.md#^ref-c5c9a5c6-5201-0) (line 5201, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L6018](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6018-0) (line 6018, col 0, score 0.99)
- [Eidolon Field Abstract Model — L3907](eidolon-field-abstract-model.md#^ref-5e8b2388-3907-0) (line 3907, col 0, score 0.99)
- [Factorio AI with External Agents — L2474](factorio-ai-with-external-agents.md#^ref-a4d90289-2474-0) (line 2474, col 0, score 0.99)
- [field-interaction-equations — L3213](field-interaction-equations.md#^ref-b09141b7-3213-0) (line 3213, col 0, score 0.99)
- [graph-ds — L2607](graph-ds.md#^ref-6620e2f2-2607-0) (line 2607, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L3689](performance-optimized-polyglot-bridge.md#^ref-f5579967-3689-0) (line 3689, col 0, score 0.99)
- [plan-update-confirmation — L6025](plan-update-confirmation.md#^ref-b22d79c6-6025-0) (line 6025, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L2446](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-2446-0) (line 2446, col 0, score 0.99)
- [sibilant-macro-targets — L2172](sibilant-macro-targets.md#^ref-c5c9a5c6-2172-0) (line 2172, col 0, score 1)
- [field-interaction-equations — L3207](field-interaction-equations.md#^ref-b09141b7-3207-0) (line 3207, col 0, score 0.99)
- [Promethean Notes — L1321](promethean-notes.md#^ref-1c4046b5-1321-0) (line 1321, col 0, score 0.99)
- [zero-copy-snapshots-and-workers — L2435](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-2435-0) (line 2435, col 0, score 0.97)
- [Per-Domain Policy System for JS Crawler — L2652](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-2652-0) (line 2652, col 0, score 0.97)
- [Promethean Pipelines — L3513](promethean-pipelines.md#^ref-8b8e6103-3513-0) (line 3513, col 0, score 0.97)
- [schema-evolution-workflow — L2857](schema-evolution-workflow.md#^ref-d8059b6a-2857-0) (line 2857, col 0, score 0.97)
- [Simulation Demo — L1208](chunks/simulation-demo.md#^ref-557309a3-1208-0) (line 1208, col 0, score 0.97)
- [sibilant-macro-targets — L2173](sibilant-macro-targets.md#^ref-c5c9a5c6-2173-0) (line 2173, col 0, score 1)
- [field-interaction-equations — L3208](field-interaction-equations.md#^ref-b09141b7-3208-0) (line 3208, col 0, score 0.99)
- [graph-ds — L2601](graph-ds.md#^ref-6620e2f2-2601-0) (line 2601, col 0, score 0.99)
- [eidolon-field-math-foundations — L25812](eidolon-field-math-foundations.md#^ref-008f2ac0-25812-0) (line 25812, col 0, score 0.98)
- [Creative Moments — L10238](creative-moments.md#^ref-10d98225-10238-0) (line 10238, col 0, score 0.97)
- [Creative Moments — L10113](creative-moments.md#^ref-10d98225-10113-0) (line 10113, col 0, score 0.97)
- [Duck's Attractor States — L17169](ducks-attractor-states.md#^ref-13951643-17169-0) (line 17169, col 0, score 0.97)
- [Promethean Chat Activity Report — L10668](promethean-chat-activity-report.md#^ref-18344cf9-10668-0) (line 10668, col 0, score 0.97)
- [graph-ds — L2602](graph-ds.md#^ref-6620e2f2-2602-0) (line 2602, col 0, score 0.99)
- [Promethean Notes — L1322](promethean-notes.md#^ref-1c4046b5-1322-0) (line 1322, col 0, score 0.99)
- [The Jar of Echoes — L15099](the-jar-of-echoes.md#^ref-18138627-15099-0) (line 15099, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L18186](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-18186-0) (line 18186, col 0, score 0.98)
- [Per-Domain Policy System for JS Crawler — L3220](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3220-0) (line 3220, col 0, score 0.98)
- [The Jar of Echoes — L2594](the-jar-of-echoes.md#^ref-18138627-2594-0) (line 2594, col 0, score 0.98)
- [Chroma Toolkit Consolidation Plan — L1702](chroma-toolkit-consolidation-plan.md#^ref-5020e892-1702-0) (line 1702, col 0, score 0.98)
- [plan-update-confirmation — L5255](plan-update-confirmation.md#^ref-b22d79c6-5255-0) (line 5255, col 0, score 1)
- [DSL — L1316](chunks/dsl.md#^ref-e87bc036-1316-0) (line 1316, col 0, score 0.99)
- [JavaScript — L1328](chunks/javascript.md#^ref-c1618c66-1328-0) (line 1328, col 0, score 0.99)
- [Unique Info Dump Index — L2682](unique-info-dump-index.md#^ref-30ec3ba6-2682-0) (line 2682, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L12681](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-12681-0) (line 12681, col 0, score 0.98)
- [Obsidian Task Generation — L1095](obsidian-task-generation.md#^ref-9b694a91-1095-0) (line 1095, col 0, score 0.98)
- [plan-update-confirmation — L5570](plan-update-confirmation.md#^ref-b22d79c6-5570-0) (line 5570, col 0, score 0.98)
- [plan-update-confirmation — L5256](plan-update-confirmation.md#^ref-b22d79c6-5256-0) (line 5256, col 0, score 1)
- [JavaScript — L1326](chunks/javascript.md#^ref-c1618c66-1326-0) (line 1326, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L2769](migrate-to-provider-tenant-architecture.md#^ref-54382370-2769-0) (line 2769, col 0, score 0.99)
- [Unique Info Dump Index — L2681](unique-info-dump-index.md#^ref-30ec3ba6-2681-0) (line 2681, col 0, score 0.99)
- [Duck's Attractor States — L15513](ducks-attractor-states.md#^ref-13951643-15513-0) (line 15513, col 0, score 0.96)
- [eidolon-field-math-foundations — L26048](eidolon-field-math-foundations.md#^ref-008f2ac0-26048-0) (line 26048, col 0, score 0.96)
- [Chroma Toolkit Consolidation Plan — L5512](chroma-toolkit-consolidation-plan.md#^ref-5020e892-5512-0) (line 5512, col 0, score 0.96)
- [plan-update-confirmation — L5257](plan-update-confirmation.md#^ref-b22d79c6-5257-0) (line 5257, col 0, score 1)
- [DSL — L1315](chunks/dsl.md#^ref-e87bc036-1315-0) (line 1315, col 0, score 0.99)
- [JavaScript — L1327](chunks/javascript.md#^ref-c1618c66-1327-0) (line 1327, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L2770](migrate-to-provider-tenant-architecture.md#^ref-54382370-2770-0) (line 2770, col 0, score 0.99)
- [ripple-propagation-demo — L1355](ripple-propagation-demo.md#^ref-8430617b-1355-0) (line 1355, col 0, score 0.97)
- [homeostasis-decay-formulas — L3074](homeostasis-decay-formulas.md#^ref-37b5d236-3074-0) (line 3074, col 0, score 0.97)
- [The Jar of Echoes — L2743](the-jar-of-echoes.md#^ref-18138627-2743-0) (line 2743, col 0, score 0.97)
- [plan-update-confirmation — L5254](plan-update-confirmation.md#^ref-b22d79c6-5254-0) (line 5254, col 0, score 1)
- [DSL — L1317](chunks/dsl.md#^ref-e87bc036-1317-0) (line 1317, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L2771](migrate-to-provider-tenant-architecture.md#^ref-54382370-2771-0) (line 2771, col 0, score 0.99)
- [Unique Info Dump Index — L2683](unique-info-dump-index.md#^ref-30ec3ba6-2683-0) (line 2683, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L3560](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3560-0) (line 3560, col 0, score 0.96)
- [Unique Info Dump Index — L1909](unique-info-dump-index.md#^ref-30ec3ba6-1909-0) (line 1909, col 0, score 0.96)
- [Tooling — L1128](chunks/tooling.md#^ref-6cb4943e-1128-0) (line 1128, col 0, score 0.96)
- [Math Fundamentals — L1257](chunks/math-fundamentals.md#^ref-c6e87433-1257-0) (line 1257, col 0, score 0.96)
- [Pure TypeScript Search Microservice — L2994](pure-typescript-search-microservice.md#^ref-d17d3a96-2994-0) (line 2994, col 0, score 0.99)
- [Factorio AI with External Agents — L2771](factorio-ai-with-external-agents.md#^ref-a4d90289-2771-0) (line 2771, col 0, score 0.92)
- [Fnord Tracer Protocol — L3585](fnord-tracer-protocol.md#^ref-fc21f824-3585-0) (line 3585, col 0, score 0.92)
- [Functional Embedding Pipeline Refactor — L1534](functional-embedding-pipeline-refactor.md#^ref-a4a25141-1534-0) (line 1534, col 0, score 0.92)
- [Performance-Optimized-Polyglot-Bridge — L2003](performance-optimized-polyglot-bridge.md#^ref-f5579967-2003-0) (line 2003, col 0, score 0.92)
- [schema-evolution-workflow — L2032](schema-evolution-workflow.md#^ref-d8059b6a-2032-0) (line 2032, col 0, score 0.92)
- [TypeScript Patch for Tool Calling Support — L3179](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-3179-0) (line 3179, col 0, score 0.92)
- [Diagrams — L2187](chunks/diagrams.md#^ref-45cd25b5-2187-0) (line 2187, col 0, score 0.92)
- [field-node-diagram-outline — L2723](field-node-diagram-outline.md#^ref-1f32c94a-2723-0) (line 2723, col 0, score 0.92)
- [heartbeat-fragment-demo — L1471](heartbeat-fragment-demo.md#^ref-dd00677a-1471-0) (line 1471, col 0, score 0.98)
- [Chroma Toolkit Consolidation Plan — L6496](chroma-toolkit-consolidation-plan.md#^ref-5020e892-6496-0) (line 6496, col 0, score 0.97)
- [ParticleSimulationWithCanvasAndFFmpeg — L1999](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-1999-0) (line 1999, col 0, score 0.97)
- [Performance-Optimized-Polyglot-Bridge — L2572](performance-optimized-polyglot-bridge.md#^ref-f5579967-2572-0) (line 2572, col 0, score 0.97)
- [Eidolon Field Abstract Model — L2186](eidolon-field-abstract-model.md#^ref-5e8b2388-2186-0) (line 2186, col 0, score 0.99)
- [Fnord Tracer Protocol — L2252](fnord-tracer-protocol.md#^ref-fc21f824-2252-0) (line 2252, col 0, score 0.99)
- [Model Selection for Lightweight Conversational Tasks — L2997](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-2997-0) (line 2997, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L4622](performance-optimized-polyglot-bridge.md#^ref-f5579967-4622-0) (line 4622, col 0, score 0.99)
- [Factorio AI with External Agents — L2056](factorio-ai-with-external-agents.md#^ref-a4d90289-2056-0) (line 2056, col 0, score 0.99)
- [Functional Embedding Pipeline Refactor — L1610](functional-embedding-pipeline-refactor.md#^ref-a4a25141-1610-0) (line 1610, col 0, score 0.99)
- [graph-ds — L1950](graph-ds.md#^ref-6620e2f2-1950-0) (line 1950, col 0, score 0.99)
- [ParticleSimulationWithCanvasAndFFmpeg — L1638](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-1638-0) (line 1638, col 0, score 0.99)
- [graph-ds — L1992](graph-ds.md#^ref-6620e2f2-1992-0) (line 1992, col 0, score 1)
- [unique-templates — L853](templates/unique-templates.md#^ref-c26f0044-853-0) (line 853, col 0, score 1)
- [typed-struct-compiler — L2213](typed-struct-compiler.md#^ref-78eeedf7-2213-0) (line 2213, col 0, score 1)
- [Dynamic Context Model for Web Components — L2279](dynamic-context-model-for-web-components.md#^ref-f7702bf8-2279-0) (line 2279, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration Guide — L1679](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-1679-0) (line 1679, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration — L1628](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-1628-0) (line 1628, col 0, score 0.99)
- [Obsidian Templating Plugins Integration Guide — L1850](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-1850-0) (line 1850, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L2110](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-2110-0) (line 2110, col 0, score 0.99)
- [Docops Feature Updates — L1062](docops-feature-updates.md#^ref-2792d448-1062-0) (line 1062, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L1680](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-1680-0) (line 1680, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L1629](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-1629-0) (line 1629, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L1851](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-1851-0) (line 1851, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L2111](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-2111-0) (line 2111, col 0, score 1)
- [Promethean Pipelines — L2918](promethean-pipelines.md#^ref-8b8e6103-2918-0) (line 2918, col 0, score 1)
- [Promethean Dev Workflow Update — L15237](promethean-dev-workflow-update.md#^ref-03a5578f-15237-0) (line 15237, col 0, score 0.99)
- [Model Upgrade Calm-Down Guide — L3326](model-upgrade-calm-down-guide.md#^ref-db74343f-3326-0) (line 3326, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L1538](promethean-copilot-intent-engine.md#^ref-ae24a280-1538-0) (line 1538, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L2215](chroma-toolkit-consolidation-plan.md#^ref-5020e892-2215-0) (line 2215, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L3328](model-upgrade-calm-down-guide.md#^ref-db74343f-3328-0) (line 3328, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L3329](model-upgrade-calm-down-guide.md#^ref-db74343f-3329-0) (line 3329, col 0, score 0.99)
- [Model Upgrade Calm-Down Guide — L3330](model-upgrade-calm-down-guide.md#^ref-db74343f-3330-0) (line 3330, col 0, score 0.99)
- [Model Upgrade Calm-Down Guide — L3332](model-upgrade-calm-down-guide.md#^ref-db74343f-3332-0) (line 3332, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L1544](promethean-copilot-intent-engine.md#^ref-ae24a280-1544-0) (line 1544, col 0, score 0.99)
- [DSL — L2446](chunks/dsl.md#^ref-e87bc036-2446-0) (line 2446, col 0, score 0.97)
- [windows-tiling-with-autohotkey — L3340](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-3340-0) (line 3340, col 0, score 0.97)
- [Migrate to Provider-Tenant Architecture — L9756](migrate-to-provider-tenant-architecture.md#^ref-54382370-9756-0) (line 9756, col 0, score 1)
- [Dynamic Context Model for Web Components — L9036](dynamic-context-model-for-web-components.md#^ref-f7702bf8-9036-0) (line 9036, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L9757](migrate-to-provider-tenant-architecture.md#^ref-54382370-9757-0) (line 9757, col 0, score 1)
- [Dynamic Context Model for Web Components — L9037](dynamic-context-model-for-web-components.md#^ref-f7702bf8-9037-0) (line 9037, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L9758](migrate-to-provider-tenant-architecture.md#^ref-54382370-9758-0) (line 9758, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L9038](dynamic-context-model-for-web-components.md#^ref-f7702bf8-9038-0) (line 9038, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L9759](migrate-to-provider-tenant-architecture.md#^ref-54382370-9759-0) (line 9759, col 0, score 0.99)
- [plan-update-confirmation — L7816](plan-update-confirmation.md#^ref-b22d79c6-7816-0) (line 7816, col 0, score 0.99)
- [Promethean Infrastructure Setup — L7551](promethean-infrastructure-setup.md#^ref-6deed6ac-7551-0) (line 7551, col 0, score 0.99)
- [TypeScript Patch for Tool Calling Support — L5653](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-5653-0) (line 5653, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L9040](dynamic-context-model-for-web-components.md#^ref-f7702bf8-9040-0) (line 9040, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L1554](promethean-copilot-intent-engine.md#^ref-ae24a280-1554-0) (line 1554, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L1555](promethean-copilot-intent-engine.md#^ref-ae24a280-1555-0) (line 1555, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L1556](promethean-copilot-intent-engine.md#^ref-ae24a280-1556-0) (line 1556, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L1557](promethean-copilot-intent-engine.md#^ref-ae24a280-1557-0) (line 1557, col 0, score 0.99)
- [Model Upgrade Calm-Down Guide — L3339](model-upgrade-calm-down-guide.md#^ref-db74343f-3339-0) (line 3339, col 0, score 0.98)
- [Promethean State Format — L2792](promethean-state-format.md#^ref-23df6ddb-2792-0) (line 2792, col 0, score 1)
- [ts-to-lisp-transpiler — L1370](ts-to-lisp-transpiler.md#^ref-ba11486b-1370-0) (line 1370, col 0, score 1)
- [Prometheus Observability Stack — L3460](prometheus-observability-stack.md#^ref-e90b5a16-3460-0) (line 3460, col 0, score 0.99)
- [Pure TypeScript Search Microservice — L2021](pure-typescript-search-microservice.md#^ref-d17d3a96-2021-0) (line 2021, col 0, score 0.99)
- [Unique Info Dump Index — L2202](unique-info-dump-index.md#^ref-30ec3ba6-2202-0) (line 2202, col 0, score 1)
- [Promethean State Format — L2800](promethean-state-format.md#^ref-23df6ddb-2800-0) (line 2800, col 0, score 0.99)
- [ts-to-lisp-transpiler — L2298](ts-to-lisp-transpiler.md#^ref-ba11486b-2298-0) (line 2298, col 0, score 0.99)
- [Debugging Broker Connections and Agent Behavior — L3777](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-3777-0) (line 3777, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L3347](model-upgrade-calm-down-guide.md#^ref-db74343f-3347-0) (line 3347, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L2383](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-2383-0) (line 2383, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L2172](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-2172-0) (line 2172, col 0, score 1)
- [plan-update-confirmation — L7830](plan-update-confirmation.md#^ref-b22d79c6-7830-0) (line 7830, col 0, score 1)
- [Promethean State Format — L2793](promethean-state-format.md#^ref-23df6ddb-2793-0) (line 2793, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L3778](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-3778-0) (line 3778, col 0, score 1)
- [Dynamic Context Model for Web Components — L9045](dynamic-context-model-for-web-components.md#^ref-f7702bf8-9045-0) (line 9045, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L3348](model-upgrade-calm-down-guide.md#^ref-db74343f-3348-0) (line 3348, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L2173](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-2173-0) (line 2173, col 0, score 1)
- [plan-update-confirmation — L7831](plan-update-confirmation.md#^ref-b22d79c6-7831-0) (line 7831, col 0, score 1)
- [Promethean State Format — L2794](promethean-state-format.md#^ref-23df6ddb-2794-0) (line 2794, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L3779](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-3779-0) (line 3779, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L9046](dynamic-context-model-for-web-components.md#^ref-f7702bf8-9046-0) (line 9046, col 0, score 0.99)
- [Model Upgrade Calm-Down Guide — L3349](model-upgrade-calm-down-guide.md#^ref-db74343f-3349-0) (line 3349, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration Guide — L2384](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-2384-0) (line 2384, col 0, score 0.99)
- [plan-update-confirmation — L7832](plan-update-confirmation.md#^ref-b22d79c6-7832-0) (line 7832, col 0, score 0.99)
- [Promethean State Format — L2795](promethean-state-format.md#^ref-23df6ddb-2795-0) (line 2795, col 0, score 0.99)
- [Debugging Broker Connections and Agent Behavior — L3780](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-3780-0) (line 3780, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L9047](dynamic-context-model-for-web-components.md#^ref-f7702bf8-9047-0) (line 9047, col 0, score 0.99)
- [Model Upgrade Calm-Down Guide — L3350](model-upgrade-calm-down-guide.md#^ref-db74343f-3350-0) (line 3350, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration Guide — L2385](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-2385-0) (line 2385, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration — L2174](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-2174-0) (line 2174, col 0, score 0.99)
- [plan-update-confirmation — L7833](plan-update-confirmation.md#^ref-b22d79c6-7833-0) (line 7833, col 0, score 0.99)
- [Promethean State Format — L2796](promethean-state-format.md#^ref-23df6ddb-2796-0) (line 2796, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L3157](performance-optimized-polyglot-bridge.md#^ref-f5579967-3157-0) (line 3157, col 0, score 0.97)
- [Provider-Agnostic Chat Panel Implementation — L2211](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-2211-0) (line 2211, col 0, score 0.97)
- [schema-evolution-workflow — L3219](schema-evolution-workflow.md#^ref-d8059b6a-3219-0) (line 3219, col 0, score 0.97)
- [Stateful Partitions and Rebalancing — L2520](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-2520-0) (line 2520, col 0, score 0.97)
- [TypeScript Patch for Tool Calling Support — L2331](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-2331-0) (line 2331, col 0, score 0.97)
- [Model Upgrade Calm-Down Guide — L3355](model-upgrade-calm-down-guide.md#^ref-db74343f-3355-0) (line 3355, col 0, score 0.99)
- [Model Upgrade Calm-Down Guide — L3356](model-upgrade-calm-down-guide.md#^ref-db74343f-3356-0) (line 3356, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L3357](model-upgrade-calm-down-guide.md#^ref-db74343f-3357-0) (line 3357, col 0, score 0.99)
- [Model Upgrade Calm-Down Guide — L3358](model-upgrade-calm-down-guide.md#^ref-db74343f-3358-0) (line 3358, col 0, score 0.99)
- [Model Upgrade Calm-Down Guide — L3360](model-upgrade-calm-down-guide.md#^ref-db74343f-3360-0) (line 3360, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L1576](promethean-copilot-intent-engine.md#^ref-ae24a280-1576-0) (line 1576, col 0, score 0.99)
- [Debugging Broker Connections and Agent Behavior — L3783](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-3783-0) (line 3783, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L3331](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-3331-0) (line 3331, col 0, score 0.97)
- [windows-tiling-with-autohotkey — L2317](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2317-0) (line 2317, col 0, score 0.97)
- [Chroma Toolkit Consolidation Plan — L3609](chroma-toolkit-consolidation-plan.md#^ref-5020e892-3609-0) (line 3609, col 0, score 0.99)
- [Diagrams — L3021](chunks/diagrams.md#^ref-45cd25b5-3021-0) (line 3021, col 0, score 0.99)
- [DSL — L3022](chunks/dsl.md#^ref-e87bc036-3022-0) (line 3022, col 0, score 0.99)
- [JavaScript — L3283](chunks/javascript.md#^ref-c1618c66-3283-0) (line 3283, col 0, score 0.99)
- [Math Fundamentals — L2107](chunks/math-fundamentals.md#^ref-c6e87433-2107-0) (line 2107, col 0, score 0.99)
- [Operations — L1544](chunks/operations.md#^ref-f1add613-1544-0) (line 1544, col 0, score 0.99)
- [Services — L2833](chunks/services.md#^ref-75ea4a6a-2833-0) (line 2833, col 0, score 0.99)
- [Shared — L2580](chunks/shared.md#^ref-623a55f7-2580-0) (line 2580, col 0, score 0.99)
- [Duck's Attractor States — L20360](ducks-attractor-states.md#^ref-13951643-20360-0) (line 20360, col 0, score 1)
- [eidolon-field-math-foundations — L25302](eidolon-field-math-foundations.md#^ref-008f2ac0-25302-0) (line 25302, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L3364](model-upgrade-calm-down-guide.md#^ref-db74343f-3364-0) (line 3364, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L1580](promethean-copilot-intent-engine.md#^ref-ae24a280-1580-0) (line 1580, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L1583](promethean-copilot-intent-engine.md#^ref-ae24a280-1583-0) (line 1583, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L9057](dynamic-context-model-for-web-components.md#^ref-f7702bf8-9057-0) (line 9057, col 0, score 0.97)
- [Obsidian ChatGPT Plugin Integration Guide — L2395](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-2395-0) (line 2395, col 0, score 0.97)
- [Model Upgrade Calm-Down Guide — L3368](model-upgrade-calm-down-guide.md#^ref-db74343f-3368-0) (line 3368, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L1584](promethean-copilot-intent-engine.md#^ref-ae24a280-1584-0) (line 1584, col 0, score 0.99)
- [Debugging Broker Connections and Agent Behavior — L3807](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-3807-0) (line 3807, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L9074](dynamic-context-model-for-web-components.md#^ref-f7702bf8-9074-0) (line 9074, col 0, score 0.98)
- [Model Upgrade Calm-Down Guide — L3361](model-upgrade-calm-down-guide.md#^ref-db74343f-3361-0) (line 3361, col 0, score 0.99)
- [Pure TypeScript Search Microservice — L2028](pure-typescript-search-microservice.md#^ref-d17d3a96-2028-0) (line 2028, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L3632](chroma-toolkit-consolidation-plan.md#^ref-5020e892-3632-0) (line 3632, col 0, score 0.99)
- [Diagrams — L3044](chunks/diagrams.md#^ref-45cd25b5-3044-0) (line 3044, col 0, score 0.99)
- [DSL — L3045](chunks/dsl.md#^ref-e87bc036-3045-0) (line 3045, col 0, score 0.99)
- [JavaScript — L3306](chunks/javascript.md#^ref-c1618c66-3306-0) (line 3306, col 0, score 0.99)
- [Math Fundamentals — L2130](chunks/math-fundamentals.md#^ref-c6e87433-2130-0) (line 2130, col 0, score 0.99)
- [Operations — L1567](chunks/operations.md#^ref-f1add613-1567-0) (line 1567, col 0, score 0.99)
- [Services — L2856](chunks/services.md#^ref-75ea4a6a-2856-0) (line 2856, col 0, score 0.99)
- [Shared — L2602](chunks/shared.md#^ref-623a55f7-2602-0) (line 2602, col 0, score 0.99)
- [Simulation Demo — L2743](chunks/simulation-demo.md#^ref-557309a3-2743-0) (line 2743, col 0, score 0.99)
- [Tooling — L2239](chunks/tooling.md#^ref-6cb4943e-2239-0) (line 2239, col 0, score 0.99)
- [Promethean Dev Workflow Update — L23337](promethean-dev-workflow-update.md#^ref-03a5578f-23337-0) (line 23337, col 0, score 1)
- [The Jar of Echoes — L20827](the-jar-of-echoes.md#^ref-18138627-20827-0) (line 20827, col 0, score 1)
- [Promethean Dev Workflow Update — L23338](promethean-dev-workflow-update.md#^ref-03a5578f-23338-0) (line 23338, col 0, score 1)
- [The Jar of Echoes — L20828](the-jar-of-echoes.md#^ref-18138627-20828-0) (line 20828, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L3788](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-3788-0) (line 3788, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L9055](dynamic-context-model-for-web-components.md#^ref-f7702bf8-9055-0) (line 9055, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L9077](dynamic-context-model-for-web-components.md#^ref-f7702bf8-9077-0) (line 9077, col 0, score 0.97)
- [Obsidian ChatGPT Plugin Integration Guide — L1632](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-1632-0) (line 1632, col 0, score 0.97)
- [Obsidian ChatGPT Plugin Integration — L1581](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-1581-0) (line 1581, col 0, score 0.97)
- [Window Management — L2213](chunks/window-management.md#^ref-9e8ae388-2213-0) (line 2213, col 0, score 0.98)
- [komorebi-group-window-hack — L2812](komorebi-group-window-hack.md#^ref-dd89372d-2812-0) (line 2812, col 0, score 0.98)
- [Debugging Broker Connections and Agent Behavior — L3799](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-3799-0) (line 3799, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L9066](dynamic-context-model-for-web-components.md#^ref-f7702bf8-9066-0) (line 9066, col 0, score 0.98)
- [Chroma Toolkit Consolidation Plan — L3364](chroma-toolkit-consolidation-plan.md#^ref-5020e892-3364-0) (line 3364, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L6260](migrate-to-provider-tenant-architecture.md#^ref-54382370-6260-0) (line 6260, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L3796](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-3796-0) (line 3796, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L3365](chroma-toolkit-consolidation-plan.md#^ref-5020e892-3365-0) (line 3365, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L6261](migrate-to-provider-tenant-architecture.md#^ref-54382370-6261-0) (line 6261, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L3797](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-3797-0) (line 3797, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L3366](chroma-toolkit-consolidation-plan.md#^ref-5020e892-3366-0) (line 3366, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L6262](migrate-to-provider-tenant-architecture.md#^ref-54382370-6262-0) (line 6262, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L3798](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-3798-0) (line 3798, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L3819](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-3819-0) (line 3819, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L9082](dynamic-context-model-for-web-components.md#^ref-f7702bf8-9082-0) (line 9082, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L3287](chroma-toolkit-consolidation-plan.md#^ref-5020e892-3287-0) (line 3287, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L6840](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6840-0) (line 6840, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L3314](migrate-to-provider-tenant-architecture.md#^ref-54382370-3314-0) (line 3314, col 0, score 0.98)
- [Model Selection for Lightweight Conversational Tasks — L3718](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-3718-0) (line 3718, col 0, score 0.98)
- [DSL — L2475](chunks/dsl.md#^ref-e87bc036-2475-0) (line 2475, col 0, score 0.98)
- [Debugging Broker Connections and Agent Behavior — L1814](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-1814-0) (line 1814, col 0, score 0.98)
- [Debugging Broker Connections and Agent Behavior — L3775](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-3775-0) (line 3775, col 0, score 0.98)
- [Obsidian ChatGPT Plugin Integration Guide — L2380](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-2380-0) (line 2380, col 0, score 0.98)
- [Duck's Self-Referential Perceptual Loop — L2441](ducks-self-referential-perceptual-loop.md#^ref-71726f04-2441-0) (line 2441, col 0, score 0.99)
- [DSL — L3590](chunks/dsl.md#^ref-e87bc036-3590-0) (line 3590, col 0, score 0.98)
- [DSL — L3540](chunks/dsl.md#^ref-e87bc036-3540-0) (line 3540, col 0, score 0.99)
- [The Jar of Echoes — L4201](the-jar-of-echoes.md#^ref-18138627-4201-0) (line 4201, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L4588](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-4588-0) (line 4588, col 0, score 0.96)
- [Debugging Broker Connections and Agent Behavior — L1765](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-1765-0) (line 1765, col 0, score 0.99)
- [field-interaction-equations — L2643](field-interaction-equations.md#^ref-b09141b7-2643-0) (line 2643, col 0, score 0.99)
- [eidolon-field-math-foundations — L5993](eidolon-field-math-foundations.md#^ref-008f2ac0-5993-0) (line 5993, col 0, score 1)
- [windows-tiling-with-autohotkey — L18953](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-18953-0) (line 18953, col 0, score 1)
- [Dynamic Context Model for Web Components — L2089](dynamic-context-model-for-web-components.md#^ref-f7702bf8-2089-0) (line 2089, col 0, score 0.98)
- [Debugging Broker Connections and Agent Behavior — L1776](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-1776-0) (line 1776, col 0, score 0.99)
- [Debugging Broker Connections and Agent Behavior — L3814](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-3814-0) (line 3814, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L9078](dynamic-context-model-for-web-components.md#^ref-f7702bf8-9078-0) (line 9078, col 0, score 0.98)
- [Obsidian ChatGPT Plugin Integration Guide — L2406](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-2406-0) (line 2406, col 0, score 0.98)
- [Debugging Broker Connections and Agent Behavior — L1781](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-1781-0) (line 1781, col 0, score 0.99)
- [DSL — L2484](chunks/dsl.md#^ref-e87bc036-2484-0) (line 2484, col 0, score 0.98)
- [DSL — L2518](chunks/dsl.md#^ref-e87bc036-2518-0) (line 2518, col 0, score 0.97)
- [Eidolon Field Abstract Model — L2061](eidolon-field-abstract-model.md#^ref-5e8b2388-2061-0) (line 2061, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L1799](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-1799-0) (line 1799, col 0, score 0.99)
- [DSL — L2476](chunks/dsl.md#^ref-e87bc036-2476-0) (line 2476, col 0, score 0.98)
- [DSL — L2544](chunks/dsl.md#^ref-e87bc036-2544-0) (line 2544, col 0, score 0.97)
- [Duck's Attractor States — L11430](ducks-attractor-states.md#^ref-13951643-11430-0) (line 11430, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L3906](promethean-copilot-intent-engine.md#^ref-ae24a280-3906-0) (line 3906, col 0, score 0.98)
- [Prometheus Observability Stack — L2754](prometheus-observability-stack.md#^ref-e90b5a16-2754-0) (line 2754, col 0, score 0.98)
- [The Jar of Echoes — L2763](the-jar-of-echoes.md#^ref-18138627-2763-0) (line 2763, col 0, score 0.98)
- [ts-to-lisp-transpiler — L1995](ts-to-lisp-transpiler.md#^ref-ba11486b-1995-0) (line 1995, col 0, score 0.98)
- [Promethean-Copilot-Intent-Engine — L3914](promethean-copilot-intent-engine.md#^ref-ae24a280-3914-0) (line 3914, col 0, score 0.98)
- [DSL — L3643](chunks/dsl.md#^ref-e87bc036-3643-0) (line 3643, col 0, score 0.98)
- [Obsidian Templating Plugins Integration Guide — L3656](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-3656-0) (line 3656, col 0, score 0.99)
- [The Jar of Echoes — L2772](the-jar-of-echoes.md#^ref-18138627-2772-0) (line 2772, col 0, score 0.99)
- [ts-to-lisp-transpiler — L2005](ts-to-lisp-transpiler.md#^ref-ba11486b-2005-0) (line 2005, col 0, score 0.99)
- [DSL — L2482](chunks/dsl.md#^ref-e87bc036-2482-0) (line 2482, col 0, score 0.98)
- [Obsidian ChatGPT Plugin Integration Guide — L3291](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-3291-0) (line 3291, col 0, score 0.98)
- [Obsidian Templating Plugins Integration Guide — L3830](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-3830-0) (line 3830, col 0, score 0.98)
- [DSL — L2611](chunks/dsl.md#^ref-e87bc036-2611-0) (line 2611, col 0, score 0.97)
- [field-dynamics-math-blocks — L5534](field-dynamics-math-blocks.md#^ref-7cfc230d-5534-0) (line 5534, col 0, score 0.97)
- [field-interaction-equations — L5811](field-interaction-equations.md#^ref-b09141b7-5811-0) (line 5811, col 0, score 0.97)
- [obsidian-ignore-node-modules-regex — L3250](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-3250-0) (line 3250, col 0, score 0.97)
- [polyglot-repl-interface-layer — L2347](polyglot-repl-interface-layer.md#^ref-9c79206d-2347-0) (line 2347, col 0, score 0.97)
- [Promethean Dev Workflow Update — L3342](promethean-dev-workflow-update.md#^ref-03a5578f-3342-0) (line 3342, col 0, score 0.97)
- [DSL — L2489](chunks/dsl.md#^ref-e87bc036-2489-0) (line 2489, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L7270](dynamic-context-model-for-web-components.md#^ref-f7702bf8-7270-0) (line 7270, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration Guide — L2159](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-2159-0) (line 2159, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration — L2102](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-2102-0) (line 2102, col 0, score 0.99)
- [plan-update-confirmation — L7655](plan-update-confirmation.md#^ref-b22d79c6-7655-0) (line 7655, col 0, score 0.99)
- [The Jar of Echoes — L3163](the-jar-of-echoes.md#^ref-18138627-3163-0) (line 3163, col 0, score 0.99)
- [DSL — L3587](chunks/dsl.md#^ref-e87bc036-3587-0) (line 3587, col 0, score 0.98)
- [Ice Box Reorganization — L1718](ice-box-reorganization.md#^ref-291c7d91-1718-0) (line 1718, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L1438](protocol-0-the-contradiction-engine.md#^ref-9a93a756-1438-0) (line 1438, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L2160](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-2160-0) (line 2160, col 0, score 0.99)
- [Ice Box Reorganization — L1719](ice-box-reorganization.md#^ref-291c7d91-1719-0) (line 1719, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L1439](protocol-0-the-contradiction-engine.md#^ref-9a93a756-1439-0) (line 1439, col 0, score 1)
- [DSL — L2486](chunks/dsl.md#^ref-e87bc036-2486-0) (line 2486, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L2804](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-2804-0) (line 2804, col 0, score 1)
- [DSL — L2615](chunks/dsl.md#^ref-e87bc036-2615-0) (line 2615, col 0, score 0.99)
- [field-dynamics-math-blocks — L5539](field-dynamics-math-blocks.md#^ref-7cfc230d-5539-0) (line 5539, col 0, score 0.99)
- [Ice Box Reorganization — L1720](ice-box-reorganization.md#^ref-291c7d91-1720-0) (line 1720, col 0, score 1)
- [DSL — L2487](chunks/dsl.md#^ref-e87bc036-2487-0) (line 2487, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration Guide — L3295](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-3295-0) (line 3295, col 0, score 0.99)
- [homeostasis-decay-formulas — L4110](homeostasis-decay-formulas.md#^ref-37b5d236-4110-0) (line 4110, col 0, score 0.98)
- [schema-evolution-workflow — L3212](schema-evolution-workflow.md#^ref-d8059b6a-3212-0) (line 3212, col 0, score 0.98)
- [DSL — L2616](chunks/dsl.md#^ref-e87bc036-2616-0) (line 2616, col 0, score 0.98)
- [Ice Box Reorganization — L1713](ice-box-reorganization.md#^ref-291c7d91-1713-0) (line 1713, col 0, score 1)
- [plan-update-confirmation — L7649](plan-update-confirmation.md#^ref-b22d79c6-7649-0) (line 7649, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L1433](protocol-0-the-contradiction-engine.md#^ref-9a93a756-1433-0) (line 1433, col 0, score 1)
- [Ice Box Reorganization — L1714](ice-box-reorganization.md#^ref-291c7d91-1714-0) (line 1714, col 0, score 1)
- [Dynamic Context Model for Web Components — L7264](dynamic-context-model-for-web-components.md#^ref-f7702bf8-7264-0) (line 7264, col 0, score 1)
- [plan-update-confirmation — L7650](plan-update-confirmation.md#^ref-b22d79c6-7650-0) (line 7650, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L1434](protocol-0-the-contradiction-engine.md#^ref-9a93a756-1434-0) (line 1434, col 0, score 1)
- [Ice Box Reorganization — L1715](ice-box-reorganization.md#^ref-291c7d91-1715-0) (line 1715, col 0, score 1)
- [Dynamic Context Model for Web Components — L7265](dynamic-context-model-for-web-components.md#^ref-f7702bf8-7265-0) (line 7265, col 0, score 0.99)
- [plan-update-confirmation — L7651](plan-update-confirmation.md#^ref-b22d79c6-7651-0) (line 7651, col 0, score 0.99)
- [Protocol_0_The_Contradiction_Engine — L1435](protocol-0-the-contradiction-engine.md#^ref-9a93a756-1435-0) (line 1435, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L7266](dynamic-context-model-for-web-components.md#^ref-f7702bf8-7266-0) (line 7266, col 0, score 0.99)
- [Protocol_0_The_Contradiction_Engine — L1436](protocol-0-the-contradiction-engine.md#^ref-9a93a756-1436-0) (line 1436, col 0, score 0.99)
- [The Jar of Echoes — L3160](the-jar-of-echoes.md#^ref-18138627-3160-0) (line 3160, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L6368](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6368-0) (line 6368, col 0, score 0.98)
- [polyglot-repl-interface-layer — L1869](polyglot-repl-interface-layer.md#^ref-9c79206d-1869-0) (line 1869, col 0, score 0.98)
- [typed-struct-compiler — L3069](typed-struct-compiler.md#^ref-78eeedf7-3069-0) (line 3069, col 0, score 0.98)
- [Duck's Attractor States — L20535](ducks-attractor-states.md#^ref-13951643-20535-0) (line 20535, col 0, score 0.98)
- [The Jar of Echoes — L22740](the-jar-of-echoes.md#^ref-18138627-22740-0) (line 22740, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L12460](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-12460-0) (line 12460, col 0, score 0.99)
- [DSL — L3634](chunks/dsl.md#^ref-e87bc036-3634-0) (line 3634, col 0, score 0.98)
- [Obsidian ChatGPT Plugin Integration Guide — L4006](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-4006-0) (line 4006, col 0, score 0.98)
- [Obsidian ChatGPT Plugin Integration — L3794](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-3794-0) (line 3794, col 0, score 0.98)
- [Promethean-Copilot-Intent-Engine — L4009](promethean-copilot-intent-engine.md#^ref-ae24a280-4009-0) (line 4009, col 0, score 0.98)
- [Promethean Pipelines — L4140](promethean-pipelines.md#^ref-8b8e6103-4140-0) (line 4140, col 0, score 0.98)
- [The Jar of Echoes — L22742](the-jar-of-echoes.md#^ref-18138627-22742-0) (line 22742, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L12462](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-12462-0) (line 12462, col 0, score 0.99)
- [Obsidian Templating Plugins Integration Guide — L3649](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-3649-0) (line 3649, col 0, score 0.97)
- [Promethean-Copilot-Intent-Engine — L3908](promethean-copilot-intent-engine.md#^ref-ae24a280-3908-0) (line 3908, col 0, score 0.97)
- [Prometheus Observability Stack — L2757](prometheus-observability-stack.md#^ref-e90b5a16-2757-0) (line 2757, col 0, score 0.97)
- [The Jar of Echoes — L2766](the-jar-of-echoes.md#^ref-18138627-2766-0) (line 2766, col 0, score 0.97)
- [Obsidian Templating Plugins Integration Guide — L3657](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-3657-0) (line 3657, col 0, score 0.97)
- [Duck's Attractor States — L15081](ducks-attractor-states.md#^ref-13951643-15081-0) (line 15081, col 0, score 0.99)
- [Promethean Dev Workflow Update — L14618](promethean-dev-workflow-update.md#^ref-03a5578f-14618-0) (line 14618, col 0, score 0.99)
- [eidolon-field-math-foundations — L23650](eidolon-field-math-foundations.md#^ref-008f2ac0-23650-0) (line 23650, col 0, score 0.99)
- [eidolon-field-math-foundations — L26694](eidolon-field-math-foundations.md#^ref-008f2ac0-26694-0) (line 26694, col 0, score 0.99)
- [Promethean Dev Workflow Update — L18971](promethean-dev-workflow-update.md#^ref-03a5578f-18971-0) (line 18971, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L5134](dynamic-context-model-for-web-components.md#^ref-f7702bf8-5134-0) (line 5134, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L2253](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-2253-0) (line 2253, col 0, score 1)
- [Promethean Dev Workflow Update — L12904](promethean-dev-workflow-update.md#^ref-03a5578f-12904-0) (line 12904, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L3312](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-3312-0) (line 3312, col 0, score 1)
- [Duck's Attractor States — L12920](ducks-attractor-states.md#^ref-13951643-12920-0) (line 12920, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L16319](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-16319-0) (line 16319, col 0, score 1)
- [Duck's Attractor States — L21614](ducks-attractor-states.md#^ref-13951643-21614-0) (line 21614, col 0, score 1)
- [Promethean Notes — L7962](promethean-notes.md#^ref-1c4046b5-7962-0) (line 7962, col 0, score 1)
- [windows-tiling-with-autohotkey — L16301](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-16301-0) (line 16301, col 0, score 1)
- [Promethean Dev Workflow Update — L14607](promethean-dev-workflow-update.md#^ref-03a5578f-14607-0) (line 14607, col 0, score 1)
- [The Jar of Echoes — L16955](the-jar-of-echoes.md#^ref-18138627-16955-0) (line 16955, col 0, score 1)
- [Fnord Tracer Protocol — L1800](fnord-tracer-protocol.md#^ref-fc21f824-1800-0) (line 1800, col 0, score 0.99)
- [Model Upgrade Calm-Down Guide — L3175](model-upgrade-calm-down-guide.md#^ref-db74343f-3175-0) (line 3175, col 0, score 0.99)
- [Promethean Dev Workflow Update — L2543](promethean-dev-workflow-update.md#^ref-03a5578f-2543-0) (line 2543, col 0, score 0.99)
- [plan-update-confirmation — L5178](plan-update-confirmation.md#^ref-b22d79c6-5178-0) (line 5178, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration Guide — L1332](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-1332-0) (line 1332, col 0, score 0.99)
- [Creative Moments — L7514](creative-moments.md#^ref-10d98225-7514-0) (line 7514, col 0, score 0.97)
- [Promethean Dev Workflow Update — L6837](promethean-dev-workflow-update.md#^ref-03a5578f-6837-0) (line 6837, col 0, score 0.97)
- [Duck's Attractor States — L4598](ducks-attractor-states.md#^ref-13951643-4598-0) (line 4598, col 0, score 0.97)
- [eidolon-field-math-foundations — L11221](eidolon-field-math-foundations.md#^ref-008f2ac0-11221-0) (line 11221, col 0, score 0.97)
- [The Jar of Echoes — L11417](the-jar-of-echoes.md#^ref-18138627-11417-0) (line 11417, col 0, score 0.97)
- [eidolon-field-math-foundations — L19409](eidolon-field-math-foundations.md#^ref-008f2ac0-19409-0) (line 19409, col 0, score 0.97)
- [Creative Moments — L4252](creative-moments.md#^ref-10d98225-4252-0) (line 4252, col 0, score 1)
- [Duck's Attractor States — L7742](ducks-attractor-states.md#^ref-13951643-7742-0) (line 7742, col 0, score 1)
- [eidolon-field-math-foundations — L7382](eidolon-field-math-foundations.md#^ref-008f2ac0-7382-0) (line 7382, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L5964](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-5964-0) (line 5964, col 0, score 1)
- [Duck's Attractor States — L7743](ducks-attractor-states.md#^ref-13951643-7743-0) (line 7743, col 0, score 0.99)
- [eidolon-field-math-foundations — L7383](eidolon-field-math-foundations.md#^ref-008f2ac0-7383-0) (line 7383, col 0, score 0.99)
- [Functional Refactor of TypeScript Document Processing — L5965](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-5965-0) (line 5965, col 0, score 0.99)
- [Promethean Chat Activity Report — L4281](promethean-chat-activity-report.md#^ref-18344cf9-4281-0) (line 4281, col 0, score 0.99)
- [Promethean Documentation Update — L3996](promethean-documentation-update.txt#^ref-0b872af2-3996-0) (line 3996, col 0, score 0.99)
- [Promethean Notes — L4257](promethean-notes.md#^ref-1c4046b5-4257-0) (line 4257, col 0, score 0.99)
- [Creative Moments — L4253](creative-moments.md#^ref-10d98225-4253-0) (line 4253, col 0, score 1)
- [eidolon-field-math-foundations — L7384](eidolon-field-math-foundations.md#^ref-008f2ac0-7384-0) (line 7384, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L5966](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-5966-0) (line 5966, col 0, score 1)
- [Promethean Chat Activity Report — L4282](promethean-chat-activity-report.md#^ref-18344cf9-4282-0) (line 4282, col 0, score 1)
- [Creative Moments — L4254](creative-moments.md#^ref-10d98225-4254-0) (line 4254, col 0, score 0.99)
- [Duck's Attractor States — L7744](ducks-attractor-states.md#^ref-13951643-7744-0) (line 7744, col 0, score 0.99)
- [Functional Refactor of TypeScript Document Processing — L5967](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-5967-0) (line 5967, col 0, score 0.99)
- [Promethean Chat Activity Report — L4283](promethean-chat-activity-report.md#^ref-18344cf9-4283-0) (line 4283, col 0, score 0.99)
- [Promethean Dev Workflow Update — L5841](promethean-dev-workflow-update.md#^ref-03a5578f-5841-0) (line 5841, col 0, score 0.99)
- [Creative Moments — L4255](creative-moments.md#^ref-10d98225-4255-0) (line 4255, col 0, score 1)
- [Duck's Attractor States — L7745](ducks-attractor-states.md#^ref-13951643-7745-0) (line 7745, col 0, score 1)
- [eidolon-field-math-foundations — L7385](eidolon-field-math-foundations.md#^ref-008f2ac0-7385-0) (line 7385, col 0, score 1)
- [Promethean Chat Activity Report — L4284](promethean-chat-activity-report.md#^ref-18344cf9-4284-0) (line 4284, col 0, score 1)
- [Promethean Dev Workflow Update — L5842](promethean-dev-workflow-update.md#^ref-03a5578f-5842-0) (line 5842, col 0, score 1)
- [windows-tiling-with-autohotkey — L6400](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-6400-0) (line 6400, col 0, score 1)
- [Creative Moments — L4256](creative-moments.md#^ref-10d98225-4256-0) (line 4256, col 0, score 1)
- [Duck's Attractor States — L7746](ducks-attractor-states.md#^ref-13951643-7746-0) (line 7746, col 0, score 1)
- [eidolon-field-math-foundations — L7386](eidolon-field-math-foundations.md#^ref-008f2ac0-7386-0) (line 7386, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L5968](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-5968-0) (line 5968, col 0, score 1)
- [Promethean Dev Workflow Update — L5843](promethean-dev-workflow-update.md#^ref-03a5578f-5843-0) (line 5843, col 0, score 1)
- [windows-tiling-with-autohotkey — L6401](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-6401-0) (line 6401, col 0, score 1)
- [Creative Moments — L4257](creative-moments.md#^ref-10d98225-4257-0) (line 4257, col 0, score 0.99)
- [Duck's Attractor States — L7747](ducks-attractor-states.md#^ref-13951643-7747-0) (line 7747, col 0, score 0.99)
- [eidolon-field-math-foundations — L7387](eidolon-field-math-foundations.md#^ref-008f2ac0-7387-0) (line 7387, col 0, score 0.99)
- [Functional Refactor of TypeScript Document Processing — L5969](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-5969-0) (line 5969, col 0, score 0.99)
- [Promethean Chat Activity Report — L4285](promethean-chat-activity-report.md#^ref-18344cf9-4285-0) (line 4285, col 0, score 0.99)
- [Duck's Self-Referential Perceptual Loop — L1694](ducks-self-referential-perceptual-loop.md#^ref-71726f04-1694-0) (line 1694, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L3238](dynamic-context-model-for-web-components.md#^ref-f7702bf8-3238-0) (line 3238, col 0, score 0.99)
- [Reawakening Duck — L2032](reawakening-duck.md#^ref-59b5670f-2032-0) (line 2032, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L3923](promethean-copilot-intent-engine.md#^ref-ae24a280-3923-0) (line 3923, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L5845](migrate-to-provider-tenant-architecture.md#^ref-54382370-5845-0) (line 5845, col 0, score 0.99)
- [Obsidian Templating Plugins Integration Guide — L3632](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-3632-0) (line 3632, col 0, score 0.98)
- [Promethean-Copilot-Intent-Engine — L3916](promethean-copilot-intent-engine.md#^ref-ae24a280-3916-0) (line 3916, col 0, score 0.97)
- [The Jar of Echoes — L2773](the-jar-of-echoes.md#^ref-18138627-2773-0) (line 2773, col 0, score 0.97)
- [JavaScript — L1635](chunks/javascript.md#^ref-c1618c66-1635-0) (line 1635, col 0, score 0.99)
- [Duck's Self-Referential Perceptual Loop — L1693](ducks-self-referential-perceptual-loop.md#^ref-71726f04-1693-0) (line 1693, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L3237](dynamic-context-model-for-web-components.md#^ref-f7702bf8-3237-0) (line 3237, col 0, score 0.99)
- [Ice Box Reorganization — L2600](ice-box-reorganization.md#^ref-291c7d91-2600-0) (line 2600, col 0, score 0.99)
- [JavaScript — L1633](chunks/javascript.md#^ref-c1618c66-1633-0) (line 1633, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L1692](ducks-self-referential-perceptual-loop.md#^ref-71726f04-1692-0) (line 1692, col 0, score 1)
- [Dynamic Context Model for Web Components — L3236](dynamic-context-model-for-web-components.md#^ref-f7702bf8-3236-0) (line 3236, col 0, score 1)
- [ripple-propagation-demo — L2918](ripple-propagation-demo.md#^ref-8430617b-2918-0) (line 2918, col 0, score 1)
- [Unique Info Dump Index — L5303](unique-info-dump-index.md#^ref-30ec3ba6-5303-0) (line 5303, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L3648](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-3648-0) (line 3648, col 0, score 0.99)
- [Prometheus Observability Stack — L2756](prometheus-observability-stack.md#^ref-e90b5a16-2756-0) (line 2756, col 0, score 0.99)
- [The Jar of Echoes — L2765](the-jar-of-echoes.md#^ref-18138627-2765-0) (line 2765, col 0, score 0.99)
- [ts-to-lisp-transpiler — L1997](ts-to-lisp-transpiler.md#^ref-ba11486b-1997-0) (line 1997, col 0, score 0.99)
- [Obsidian Templating Plugins Integration Guide — L3621](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-3621-0) (line 3621, col 0, score 0.98)
- [Creative Moments — L12102](creative-moments.md#^ref-10d98225-12102-0) (line 12102, col 0, score 0.99)
- [Duck's Attractor States — L13026](ducks-attractor-states.md#^ref-13951643-13026-0) (line 13026, col 0, score 0.99)
- [eidolon-field-math-foundations — L23862](eidolon-field-math-foundations.md#^ref-008f2ac0-23862-0) (line 23862, col 0, score 0.99)
- [Promethean Chat Activity Report — L12026](promethean-chat-activity-report.md#^ref-18344cf9-12026-0) (line 12026, col 0, score 0.99)
- [Promethean Dev Workflow Update — L25949](promethean-dev-workflow-update.md#^ref-03a5578f-25949-0) (line 25949, col 0, score 0.99)
- [eidolon-field-math-foundations — L16956](eidolon-field-math-foundations.md#^ref-008f2ac0-16956-0) (line 16956, col 0, score 1)
- [Promethean Dev Workflow Update — L23382](promethean-dev-workflow-update.md#^ref-03a5578f-23382-0) (line 23382, col 0, score 1)
- [The Jar of Echoes — L2774](the-jar-of-echoes.md#^ref-18138627-2774-0) (line 2774, col 0, score 1)
- [windows-tiling-with-autohotkey — L22408](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-22408-0) (line 22408, col 0, score 1)
- [eidolon-node-lifecycle — L1695](eidolon-node-lifecycle.md#^ref-938eca9c-1695-0) (line 1695, col 0, score 1)
- [Promethean Dev Workflow Update — L23383](promethean-dev-workflow-update.md#^ref-03a5578f-23383-0) (line 23383, col 0, score 1)
- [The Jar of Echoes — L2775](the-jar-of-echoes.md#^ref-18138627-2775-0) (line 2775, col 0, score 1)
- [windows-tiling-with-autohotkey — L22409](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-22409-0) (line 22409, col 0, score 1)
- [ripple-propagation-demo — L2911](ripple-propagation-demo.md#^ref-8430617b-2911-0) (line 2911, col 0, score 0.99)
- [Unique Info Dump Index — L5296](unique-info-dump-index.md#^ref-30ec3ba6-5296-0) (line 5296, col 0, score 0.99)
- [Reawakening Duck — L2440](reawakening-duck.md#^ref-59b5670f-2440-0) (line 2440, col 0, score 0.98)
- [eidolon-field-math-foundations — L16958](eidolon-field-math-foundations.md#^ref-008f2ac0-16958-0) (line 16958, col 0, score 1)
- [Promethean Dev Workflow Update — L23384](promethean-dev-workflow-update.md#^ref-03a5578f-23384-0) (line 23384, col 0, score 1)
- [The Jar of Echoes — L2776](the-jar-of-echoes.md#^ref-18138627-2776-0) (line 2776, col 0, score 1)
- [windows-tiling-with-autohotkey — L22410](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-22410-0) (line 22410, col 0, score 1)
- [eidolon-node-lifecycle — L1696](eidolon-node-lifecycle.md#^ref-938eca9c-1696-0) (line 1696, col 0, score 0.99)
- [eidolon-field-math-foundations — L16959](eidolon-field-math-foundations.md#^ref-008f2ac0-16959-0) (line 16959, col 0, score 1)
- [Promethean Dev Workflow Update — L23385](promethean-dev-workflow-update.md#^ref-03a5578f-23385-0) (line 23385, col 0, score 1)
- [The Jar of Echoes — L2777](the-jar-of-echoes.md#^ref-18138627-2777-0) (line 2777, col 0, score 1)
- [windows-tiling-with-autohotkey — L22411](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-22411-0) (line 22411, col 0, score 1)
- [eidolon-node-lifecycle — L1697](eidolon-node-lifecycle.md#^ref-938eca9c-1697-0) (line 1697, col 0, score 0.99)
- [eidolon-field-math-foundations — L16960](eidolon-field-math-foundations.md#^ref-008f2ac0-16960-0) (line 16960, col 0, score 1)
- [Promethean Dev Workflow Update — L23386](promethean-dev-workflow-update.md#^ref-03a5578f-23386-0) (line 23386, col 0, score 1)
- [The Jar of Echoes — L2778](the-jar-of-echoes.md#^ref-18138627-2778-0) (line 2778, col 0, score 1)
- [windows-tiling-with-autohotkey — L22412](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-22412-0) (line 22412, col 0, score 1)
- [eidolon-node-lifecycle — L1698](eidolon-node-lifecycle.md#^ref-938eca9c-1698-0) (line 1698, col 0, score 0.99)
- [field-node-diagram-outline — L2727](field-node-diagram-outline.md#^ref-1f32c94a-2727-0) (line 2727, col 0, score 1)
- [field-node-diagram-set — L2824](field-node-diagram-set.md#^ref-22b989d5-2824-0) (line 2824, col 0, score 1)
- [field-node-diagram-visualizations — L2288](field-node-diagram-visualizations.md#^ref-e9b27b06-2288-0) (line 2288, col 0, score 1)
- [graph-ds — L2921](graph-ds.md#^ref-6620e2f2-2921-0) (line 2921, col 0, score 1)
- [heartbeat-fragment-demo — L2373](heartbeat-fragment-demo.md#^ref-dd00677a-2373-0) (line 2373, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L3673](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-3673-0) (line 3673, col 0, score 0.99)
- [The Jar of Echoes — L2789](the-jar-of-echoes.md#^ref-18138627-2789-0) (line 2789, col 0, score 0.99)
- [ts-to-lisp-transpiler — L2022](ts-to-lisp-transpiler.md#^ref-ba11486b-2022-0) (line 2022, col 0, score 0.99)
- [DSL — L3619](chunks/dsl.md#^ref-e87bc036-3619-0) (line 3619, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration Guide — L3992](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-3992-0) (line 3992, col 0, score 0.99)
- [Creative Moments — L12109](creative-moments.md#^ref-10d98225-12109-0) (line 12109, col 0, score 0.99)
- [Duck's Attractor States — L18451](ducks-attractor-states.md#^ref-13951643-18451-0) (line 18451, col 0, score 0.99)
- [eidolon-field-math-foundations — L23868](eidolon-field-math-foundations.md#^ref-008f2ac0-23868-0) (line 23868, col 0, score 0.99)
- [Promethean Chat Activity Report — L12032](promethean-chat-activity-report.md#^ref-18344cf9-12032-0) (line 12032, col 0, score 0.99)
- [Promethean Dev Workflow Update — L25953](promethean-dev-workflow-update.md#^ref-03a5578f-25953-0) (line 25953, col 0, score 0.99)
- [eidolon-field-math-foundations — L21995](eidolon-field-math-foundations.md#^ref-008f2ac0-21995-0) (line 21995, col 0, score 1)
- [windows-tiling-with-autohotkey — L23662](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-23662-0) (line 23662, col 0, score 1)
- [Diagrams — L2183](chunks/diagrams.md#^ref-45cd25b5-2183-0) (line 2183, col 0, score 1)
- [field-node-diagram-outline — L2720](field-node-diagram-outline.md#^ref-1f32c94a-2720-0) (line 2720, col 0, score 1)
- [field-node-diagram-set — L2817](field-node-diagram-set.md#^ref-22b989d5-2817-0) (line 2817, col 0, score 1)
- [eidolon-field-math-foundations — L21996](eidolon-field-math-foundations.md#^ref-008f2ac0-21996-0) (line 21996, col 0, score 1)
- [windows-tiling-with-autohotkey — L23663](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-23663-0) (line 23663, col 0, score 1)
- [Diagrams — L2184](chunks/diagrams.md#^ref-45cd25b5-2184-0) (line 2184, col 0, score 0.99)
- [field-node-diagram-set — L2818](field-node-diagram-set.md#^ref-22b989d5-2818-0) (line 2818, col 0, score 0.99)
- [eidolon-field-math-foundations — L21997](eidolon-field-math-foundations.md#^ref-008f2ac0-21997-0) (line 21997, col 0, score 1)
- [windows-tiling-with-autohotkey — L23664](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-23664-0) (line 23664, col 0, score 1)
- [Diagrams — L2185](chunks/diagrams.md#^ref-45cd25b5-2185-0) (line 2185, col 0, score 0.99)
- [field-node-diagram-outline — L2721](field-node-diagram-outline.md#^ref-1f32c94a-2721-0) (line 2721, col 0, score 0.99)
- [eidolon-field-math-foundations — L21998](eidolon-field-math-foundations.md#^ref-008f2ac0-21998-0) (line 21998, col 0, score 1)
- [windows-tiling-with-autohotkey — L23665](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-23665-0) (line 23665, col 0, score 1)
- [Diagrams — L2186](chunks/diagrams.md#^ref-45cd25b5-2186-0) (line 2186, col 0, score 0.99)
- [field-node-diagram-outline — L2722](field-node-diagram-outline.md#^ref-1f32c94a-2722-0) (line 2722, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L7353](migrate-to-provider-tenant-architecture.md#^ref-54382370-7353-0) (line 7353, col 0, score 0.98)
- [Mindful Prioritization — L1021](mindful-prioritization.md#^ref-40185d05-1021-0) (line 1021, col 0, score 0.98)
- [MindfulRobotIntegration — L1046](mindfulrobotintegration.md#^ref-5f65dfa5-1046-0) (line 1046, col 0, score 0.98)
- [Model Selection for Lightweight Conversational Tasks — L4920](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-4920-0) (line 4920, col 0, score 0.98)
- [Model Upgrade Calm-Down Guide — L3453](model-upgrade-calm-down-guide.md#^ref-db74343f-3453-0) (line 3453, col 0, score 0.98)
- [NPU Voice Code and Sensory Integration — L1458](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-1458-0) (line 1458, col 0, score 0.98)
- [Obsidian ChatGPT Plugin Integration Guide — L2501](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-2501-0) (line 2501, col 0, score 0.98)
- [field-node-diagram-outline — L2436](field-node-diagram-outline.md#^ref-1f32c94a-2436-0) (line 2436, col 0, score 0.99)
- [Unique Info Dump Index — L4555](unique-info-dump-index.md#^ref-30ec3ba6-4555-0) (line 4555, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration — L3780](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-3780-0) (line 3780, col 0, score 0.99)
- [field-node-diagram-outline — L2437](field-node-diagram-outline.md#^ref-1f32c94a-2437-0) (line 2437, col 0, score 0.99)
- [Unique Info Dump Index — L4556](unique-info-dump-index.md#^ref-30ec3ba6-4556-0) (line 4556, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L6595](chroma-toolkit-consolidation-plan.md#^ref-5020e892-6595-0) (line 6595, col 0, score 0.97)
- [DSL — L2236](chunks/dsl.md#^ref-e87bc036-2236-0) (line 2236, col 0, score 0.97)
- [JavaScript — L2625](chunks/javascript.md#^ref-c1618c66-2625-0) (line 2625, col 0, score 0.97)
- [Stateful Partitions and Rebalancing — L2724](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-2724-0) (line 2724, col 0, score 0.99)
- [Creative Moments — L12334](creative-moments.md#^ref-10d98225-12334-0) (line 12334, col 0, score 0.99)
- [Duck's Attractor States — L18616](ducks-attractor-states.md#^ref-13951643-18616-0) (line 18616, col 0, score 0.99)
- [Promethean Chat Activity Report — L12272](promethean-chat-activity-report.md#^ref-18344cf9-12272-0) (line 12272, col 0, score 0.99)
- [Promethean Dev Workflow Update — L19296](promethean-dev-workflow-update.md#^ref-03a5578f-19296-0) (line 19296, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L7012](dynamic-context-model-for-web-components.md#^ref-f7702bf8-7012-0) (line 7012, col 0, score 0.99)
- [eidolon-field-math-foundations — L5746](eidolon-field-math-foundations.md#^ref-008f2ac0-5746-0) (line 5746, col 0, score 0.99)
- [Factorio AI with External Agents — L3946](factorio-ai-with-external-agents.md#^ref-a4d90289-3946-0) (line 3946, col 0, score 0.99)
- [field-dynamics-math-blocks — L6242](field-dynamics-math-blocks.md#^ref-7cfc230d-6242-0) (line 6242, col 0, score 0.99)
- [field-interaction-equations — L6238](field-interaction-equations.md#^ref-b09141b7-6238-0) (line 6238, col 0, score 0.99)
- [Fnord Tracer Protocol — L5411](fnord-tracer-protocol.md#^ref-fc21f824-5411-0) (line 5411, col 0, score 0.99)
- [graph-ds — L4440](graph-ds.md#^ref-6620e2f2-4440-0) (line 4440, col 0, score 0.99)
- [homeostasis-decay-formulas — L6533](homeostasis-decay-formulas.md#^ref-37b5d236-6533-0) (line 6533, col 0, score 0.99)
- [i3-bluetooth-setup — L3719](i3-bluetooth-setup.md#^ref-5e408692-3719-0) (line 3719, col 0, score 0.99)
- [komorebi-group-window-hack — L3082](komorebi-group-window-hack.md#^ref-dd89372d-3082-0) (line 3082, col 0, score 0.99)
- [Promethean Data Sync Protocol — L931](promethean-data-sync-protocol.md#^ref-9fab9e76-931-0) (line 931, col 0, score 0.96)
- [Promethean Documentation Pipeline Overview — L4676](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-4676-0) (line 4676, col 0, score 0.96)
- [Promethean Documentation Update — L949](promethean-documentation-update.md#^ref-c0392040-949-0) (line 949, col 0, score 0.96)
- [Promethean Documentation Update — L1423](promethean-documentation-update.txt#^ref-0b872af2-1423-0) (line 1423, col 0, score 0.96)
- [Promethean_Eidolon_Synchronicity_Model — L2369](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-2369-0) (line 2369, col 0, score 0.96)
- [Promethean Infrastructure Setup — L7467](promethean-infrastructure-setup.md#^ref-6deed6ac-7467-0) (line 7467, col 0, score 0.96)
- [Promethean Notes — L1596](promethean-notes.md#^ref-1c4046b5-1596-0) (line 1596, col 0, score 0.96)
- [promethean-requirements — L1254](promethean-requirements.md#^ref-95205cd3-1254-0) (line 1254, col 0, score 0.96)
- [Promethean Workflow Optimization — L1635](promethean-workflow-optimization.md#^ref-d614d983-1635-0) (line 1635, col 0, score 0.96)
- [Creative Moments — L8990](creative-moments.md#^ref-10d98225-8990-0) (line 8990, col 0, score 0.99)
- [Fnord Tracer Protocol — L5504](fnord-tracer-protocol.md#^ref-fc21f824-5504-0) (line 5504, col 0, score 0.97)
- [i3-bluetooth-setup — L3812](i3-bluetooth-setup.md#^ref-5e408692-3812-0) (line 3812, col 0, score 0.97)
- [Duck's Self-Referential Perceptual Loop — L913](ducks-self-referential-perceptual-loop.md#^ref-71726f04-913-0) (line 913, col 0, score 0.94)
- [Dynamic Context Model for Web Components — L831](dynamic-context-model-for-web-components.md#^ref-f7702bf8-831-0) (line 831, col 0, score 0.94)
- [eidolon-field-math-foundations — L928](eidolon-field-math-foundations.md#^ref-008f2ac0-928-0) (line 928, col 0, score 0.94)
- [eidolon-node-lifecycle — L654](eidolon-node-lifecycle.md#^ref-938eca9c-654-0) (line 654, col 0, score 0.94)
- [Factorio AI with External Agents — L500](factorio-ai-with-external-agents.md#^ref-a4d90289-500-0) (line 500, col 0, score 0.94)
- [field-dynamics-math-blocks — L763](field-dynamics-math-blocks.md#^ref-7cfc230d-763-0) (line 763, col 0, score 0.94)
- [field-interaction-equations — L818](field-interaction-equations.md#^ref-b09141b7-818-0) (line 818, col 0, score 0.94)
- [field-node-diagram-outline — L856](field-node-diagram-outline.md#^ref-1f32c94a-856-0) (line 856, col 0, score 0.94)
- [zero-copy-snapshots-and-workers — L4198](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-4198-0) (line 4198, col 0, score 0.99)
- [zero-copy-snapshots-and-workers — L4181](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-4181-0) (line 4181, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L6664](chroma-toolkit-consolidation-plan.md#^ref-5020e892-6664-0) (line 6664, col 0, score 0.96)
- [Diagrams — L4339](chunks/diagrams.md#^ref-45cd25b5-4339-0) (line 4339, col 0, score 0.96)
- [JavaScript — L4278](chunks/javascript.md#^ref-c1618c66-4278-0) (line 4278, col 0, score 0.96)
- [Math Fundamentals — L3932](chunks/math-fundamentals.md#^ref-c6e87433-3932-0) (line 3932, col 0, score 0.96)
- [Operations — L1645](chunks/operations.md#^ref-f1add613-1645-0) (line 1645, col 0, score 0.96)
- [Services — L3707](chunks/services.md#^ref-75ea4a6a-3707-0) (line 3707, col 0, score 0.96)
- [Shared — L3238](chunks/shared.md#^ref-623a55f7-3238-0) (line 3238, col 0, score 0.96)
- [Simulation Demo — L3354](chunks/simulation-demo.md#^ref-557309a3-3354-0) (line 3354, col 0, score 0.96)
- [Tooling — L2740](chunks/tooling.md#^ref-6cb4943e-2740-0) (line 2740, col 0, score 0.96)
- [Window Management — L3599](chunks/window-management.md#^ref-9e8ae388-3599-0) (line 3599, col 0, score 0.96)
- [Creative Moments — L2221](creative-moments.md#^ref-10d98225-2221-0) (line 2221, col 0, score 0.96)
- [Docops Feature Updates — L1340](docops-feature-updates-2.md#^ref-cdbd21ee-1340-0) (line 1340, col 0, score 0.96)
- [The Jar of Echoes — L14971](the-jar-of-echoes.md#^ref-18138627-14971-0) (line 14971, col 0, score 0.98)
- [eidolon-field-math-foundations — L20174](eidolon-field-math-foundations.md#^ref-008f2ac0-20174-0) (line 20174, col 0, score 0.98)
- [Promethean Dev Workflow Update — L14159](promethean-dev-workflow-update.md#^ref-03a5578f-14159-0) (line 14159, col 0, score 0.98)
- [Ice Box Reorganization — L2760](ice-box-reorganization.md#^ref-291c7d91-2760-0) (line 2760, col 0, score 0.98)
- [Model Selection for Lightweight Conversational Tasks — L2062](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-2062-0) (line 2062, col 0, score 0.98)
- [Promethean Documentation Pipeline Overview — L1860](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-1860-0) (line 1860, col 0, score 0.98)
- [Prompt_Folder_Bootstrap — L3282](prompt-folder-bootstrap.md#^ref-bd4f0976-3282-0) (line 3282, col 0, score 0.98)
- [The Jar of Echoes — L16045](the-jar-of-echoes.md#^ref-18138627-16045-0) (line 16045, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L8923](dynamic-context-model-for-web-components.md#^ref-f7702bf8-8923-0) (line 8923, col 0, score 0.99)
- [Factorio AI with External Agents — L4187](factorio-ai-with-external-agents.md#^ref-a4d90289-4187-0) (line 4187, col 0, score 0.99)
- [Fnord Tracer Protocol — L5729](fnord-tracer-protocol.md#^ref-fc21f824-5729-0) (line 5729, col 0, score 0.99)
- [graph-ds — L5025](graph-ds.md#^ref-6620e2f2-5025-0) (line 5025, col 0, score 0.99)
- [i3-bluetooth-setup — L4547](i3-bluetooth-setup.md#^ref-5e408692-4547-0) (line 4547, col 0, score 0.99)
- [komorebi-group-window-hack — L3862](komorebi-group-window-hack.md#^ref-dd89372d-3862-0) (line 3862, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L9849](migrate-to-provider-tenant-architecture.md#^ref-54382370-9849-0) (line 9849, col 0, score 0.99)
- [Mindful Prioritization — L1307](mindful-prioritization.md#^ref-40185d05-1307-0) (line 1307, col 0, score 0.99)
- [MindfulRobotIntegration — L1342](mindfulrobotintegration.md#^ref-5f65dfa5-1342-0) (line 1342, col 0, score 0.99)
- [Promethean Documentation Overview — L859](promethean-documentation-overview.md#^ref-9413237f-859-0) (line 859, col 0, score 0.98)
- [Promethean Documentation Pipeline Overview — L4380](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-4380-0) (line 4380, col 0, score 0.98)
- [Promethean Documentation Update — L1550](promethean-documentation-update.md#^ref-c0392040-1550-0) (line 1550, col 0, score 0.98)
- [Promethean Documentation Update — L2013](promethean-documentation-update.txt#^ref-0b872af2-2013-0) (line 2013, col 0, score 0.98)
- [Promethean_Eidolon_Synchronicity_Model — L3483](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-3483-0) (line 3483, col 0, score 0.98)
- [Promethean Infrastructure Setup — L5545](promethean-infrastructure-setup.md#^ref-6deed6ac-5545-0) (line 5545, col 0, score 0.98)
- [Promethean Notes — L2193](promethean-notes.md#^ref-1c4046b5-2193-0) (line 2193, col 0, score 0.98)
- [Promethean Pipelines — L3757](promethean-pipelines.md#^ref-8b8e6103-3757-0) (line 3757, col 0, score 0.98)
- [promethean-requirements — L1576](promethean-requirements.md#^ref-95205cd3-1576-0) (line 1576, col 0, score 0.98)
- [Functional Refactor of TypeScript Document Processing — L1927](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-1927-0) (line 1927, col 0, score 0.99)
- [Post-Linguistic Transhuman Design Frameworks — L2405](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-2405-0) (line 2405, col 0, score 0.99)
- [sibilant-macro-targets — L2302](sibilant-macro-targets.md#^ref-c5c9a5c6-2302-0) (line 2302, col 0, score 0.99)
- [Functional Refactor of TypeScript Document Processing — L1928](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-1928-0) (line 1928, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L2406](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-2406-0) (line 2406, col 0, score 1)
- [sibilant-macro-targets — L2303](sibilant-macro-targets.md#^ref-c5c9a5c6-2303-0) (line 2303, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L1929](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-1929-0) (line 1929, col 0, score 0.99)
- [Post-Linguistic Transhuman Design Frameworks — L2407](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-2407-0) (line 2407, col 0, score 0.99)
- [sibilant-macro-targets — L2304](sibilant-macro-targets.md#^ref-c5c9a5c6-2304-0) (line 2304, col 0, score 0.99)
- [Functional Refactor of TypeScript Document Processing — L1931](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-1931-0) (line 1931, col 0, score 0.99)
- [Post-Linguistic Transhuman Design Frameworks — L2409](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-2409-0) (line 2409, col 0, score 0.99)
- [sibilant-macro-targets — L2306](sibilant-macro-targets.md#^ref-c5c9a5c6-2306-0) (line 2306, col 0, score 0.99)
- [Functional Refactor of TypeScript Document Processing — L1932](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-1932-0) (line 1932, col 0, score 0.99)
- [Post-Linguistic Transhuman Design Frameworks — L2410](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-2410-0) (line 2410, col 0, score 0.99)
- [sibilant-macro-targets — L2307](sibilant-macro-targets.md#^ref-c5c9a5c6-2307-0) (line 2307, col 0, score 0.99)
- [Functional Refactor of TypeScript Document Processing — L1933](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-1933-0) (line 1933, col 0, score 0.99)
- [Post-Linguistic Transhuman Design Frameworks — L2411](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-2411-0) (line 2411, col 0, score 0.99)
- [sibilant-macro-targets — L2308](sibilant-macro-targets.md#^ref-c5c9a5c6-2308-0) (line 2308, col 0, score 0.99)
- [Functional Refactor of TypeScript Document Processing — L1926](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-1926-0) (line 1926, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L2404](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-2404-0) (line 2404, col 0, score 1)
- [ts-to-lisp-transpiler — L1380](ts-to-lisp-transpiler.md#^ref-ba11486b-1380-0) (line 1380, col 0, score 1)
- [windows-tiling-with-autohotkey — L21684](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-21684-0) (line 21684, col 0, score 1)
- [ts-to-lisp-transpiler — L1381](ts-to-lisp-transpiler.md#^ref-ba11486b-1381-0) (line 1381, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L18444](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-18444-0) (line 18444, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L6605](chroma-toolkit-consolidation-plan.md#^ref-5020e892-6605-0) (line 6605, col 0, score 0.96)
- [Dynamic Context Model for Web Components — L6093](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6093-0) (line 6093, col 0, score 0.96)
- [ts-to-lisp-transpiler — L2142](ts-to-lisp-transpiler.md#^ref-ba11486b-2142-0) (line 2142, col 0, score 0.96)
- [typed-struct-compiler — L4027](typed-struct-compiler.md#^ref-78eeedf7-4027-0) (line 4027, col 0, score 0.96)
- [windows-tiling-with-autohotkey — L18445](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-18445-0) (line 18445, col 0, score 1)
- [ts-to-lisp-transpiler — L1382](ts-to-lisp-transpiler.md#^ref-ba11486b-1382-0) (line 1382, col 0, score 0.99)
- [DSL — L1452](chunks/dsl.md#^ref-e87bc036-1452-0) (line 1452, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L18446](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-18446-0) (line 18446, col 0, score 0.99)
- [ts-to-lisp-transpiler — L1383](ts-to-lisp-transpiler.md#^ref-ba11486b-1383-0) (line 1383, col 0, score 0.99)
- [DSL — L1453](chunks/dsl.md#^ref-e87bc036-1453-0) (line 1453, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L18448](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-18448-0) (line 18448, col 0, score 0.99)
- [ts-to-lisp-transpiler — L1385](ts-to-lisp-transpiler.md#^ref-ba11486b-1385-0) (line 1385, col 0, score 0.99)
- [DSL — L1481](chunks/dsl.md#^ref-e87bc036-1481-0) (line 1481, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L18449](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-18449-0) (line 18449, col 0, score 0.99)
- [ts-to-lisp-transpiler — L1386](ts-to-lisp-transpiler.md#^ref-ba11486b-1386-0) (line 1386, col 0, score 0.99)
- [DSL — L1456](chunks/dsl.md#^ref-e87bc036-1456-0) (line 1456, col 0, score 0.98)
- [Window Management — L2222](chunks/window-management.md#^ref-9e8ae388-2222-0) (line 2222, col 0, score 0.98)
- [komorebi-group-window-hack — L2830](komorebi-group-window-hack.md#^ref-dd89372d-2830-0) (line 2830, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L18450](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-18450-0) (line 18450, col 0, score 0.99)
- [Functional Embedding Pipeline Refactor — L1833](functional-embedding-pipeline-refactor.md#^ref-a4a25141-1833-0) (line 1833, col 0, score 0.98)
- [Functional Refactor of TypeScript Document Processing — L1818](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-1818-0) (line 1818, col 0, score 0.97)
- [windows-tiling-with-autohotkey — L18451](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-18451-0) (line 18451, col 0, score 1)
- [ts-to-lisp-transpiler — L1389](ts-to-lisp-transpiler.md#^ref-ba11486b-1389-0) (line 1389, col 0, score 1)
- [Promethean Dev Workflow Update — L19239](promethean-dev-workflow-update.md#^ref-03a5578f-19239-0) (line 19239, col 0, score 1)
- [The Jar of Echoes — L17889](the-jar-of-echoes.md#^ref-18138627-17889-0) (line 17889, col 0, score 1)
- [eidolon-field-math-foundations — L24798](eidolon-field-math-foundations.md#^ref-008f2ac0-24798-0) (line 24798, col 0, score 1)
- [ts-to-lisp-transpiler — L1390](ts-to-lisp-transpiler.md#^ref-ba11486b-1390-0) (line 1390, col 0, score 0.99)
- [JavaScript — L1899](chunks/javascript.md#^ref-c1618c66-1899-0) (line 1899, col 0, score 0.99)
- [graph-ds — L3197](graph-ds.md#^ref-6620e2f2-3197-0) (line 3197, col 0, score 0.99)
- [Unique Info Dump Index — L4243](unique-info-dump-index.md#^ref-30ec3ba6-4243-0) (line 4243, col 0, score 0.99)
- [zero-copy-snapshots-and-workers — L4546](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-4546-0) (line 4546, col 0, score 0.99)
- [JavaScript — L1900](chunks/javascript.md#^ref-c1618c66-1900-0) (line 1900, col 0, score 0.99)
- [graph-ds — L3198](graph-ds.md#^ref-6620e2f2-3198-0) (line 3198, col 0, score 0.99)
- [Unique Info Dump Index — L4244](unique-info-dump-index.md#^ref-30ec3ba6-4244-0) (line 4244, col 0, score 0.99)
- [JavaScript — L1901](chunks/javascript.md#^ref-c1618c66-1901-0) (line 1901, col 0, score 0.99)
- [graph-ds — L3199](graph-ds.md#^ref-6620e2f2-3199-0) (line 3199, col 0, score 0.99)
- [Unique Info Dump Index — L4245](unique-info-dump-index.md#^ref-30ec3ba6-4245-0) (line 4245, col 0, score 0.99)
- [JavaScript — L1902](chunks/javascript.md#^ref-c1618c66-1902-0) (line 1902, col 0, score 0.99)
- [graph-ds — L3200](graph-ds.md#^ref-6620e2f2-3200-0) (line 3200, col 0, score 0.99)
- [Unique Info Dump Index — L4246](unique-info-dump-index.md#^ref-30ec3ba6-4246-0) (line 4246, col 0, score 0.99)
- [ts-to-lisp-transpiler — L1395](ts-to-lisp-transpiler.md#^ref-ba11486b-1395-0) (line 1395, col 0, score 0.99)
- [Window Management — L2212](chunks/window-management.md#^ref-9e8ae388-2212-0) (line 2212, col 0, score 0.98)
- [ts-to-lisp-transpiler — L1396](ts-to-lisp-transpiler.md#^ref-ba11486b-1396-0) (line 1396, col 0, score 0.99)
- [DSL — L1447](chunks/dsl.md#^ref-e87bc036-1447-0) (line 1447, col 0, score 0.97)
- [ts-to-lisp-transpiler — L1397](ts-to-lisp-transpiler.md#^ref-ba11486b-1397-0) (line 1397, col 0, score 0.99)
- [Window Management — L2214](chunks/window-management.md#^ref-9e8ae388-2214-0) (line 2214, col 0, score 0.97)
- [komorebi-group-window-hack — L2813](komorebi-group-window-hack.md#^ref-dd89372d-2813-0) (line 2813, col 0, score 0.97)
- [typed-struct-compiler — L1813](typed-struct-compiler.md#^ref-78eeedf7-1813-0) (line 1813, col 0, score 1)
- [typed-struct-compiler — L1807](typed-struct-compiler.md#^ref-78eeedf7-1807-0) (line 1807, col 0, score 1)
- [graph-ds — L3193](graph-ds.md#^ref-6620e2f2-3193-0) (line 3193, col 0, score 0.99)
- [Duck's Attractor States — L6586](ducks-attractor-states.md#^ref-13951643-6586-0) (line 6586, col 0, score 0.93)
- [windows-tiling-with-autohotkey — L19056](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-19056-0) (line 19056, col 0, score 0.93)
- [Obsidian Task Generation — L953](obsidian-task-generation.md#^ref-9b694a91-953-0) (line 953, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L2567](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2567-0) (line 2567, col 0, score 0.99)
- [ts-to-lisp-transpiler — L1399](ts-to-lisp-transpiler.md#^ref-ba11486b-1399-0) (line 1399, col 0, score 0.99)
- [Window Management — L2230](chunks/window-management.md#^ref-9e8ae388-2230-0) (line 2230, col 0, score 0.95)
- [komorebi-group-window-hack — L2833](komorebi-group-window-hack.md#^ref-dd89372d-2833-0) (line 2833, col 0, score 0.95)
- [windows-tiling-with-autohotkey — L2568](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2568-0) (line 2568, col 0, score 0.99)
- [Window Management — L2219](chunks/window-management.md#^ref-9e8ae388-2219-0) (line 2219, col 0, score 0.99)
- [ts-to-lisp-transpiler — L1403](ts-to-lisp-transpiler.md#^ref-ba11486b-1403-0) (line 1403, col 0, score 0.99)
- [ts-to-lisp-transpiler — L1404](ts-to-lisp-transpiler.md#^ref-ba11486b-1404-0) (line 1404, col 0, score 0.99)
- [ts-to-lisp-transpiler — L1405](ts-to-lisp-transpiler.md#^ref-ba11486b-1405-0) (line 1405, col 0, score 0.99)
- [Promethean Dev Workflow Update — L10457](promethean-dev-workflow-update.md#^ref-03a5578f-10457-0) (line 10457, col 0, score 0.99)
- [The Jar of Echoes — L11083](the-jar-of-echoes.md#^ref-18138627-11083-0) (line 11083, col 0, score 0.99)
- [ts-to-lisp-transpiler — L1407](ts-to-lisp-transpiler.md#^ref-ba11486b-1407-0) (line 1407, col 0, score 0.99)
- [Window Management — L2217](chunks/window-management.md#^ref-9e8ae388-2217-0) (line 2217, col 0, score 0.95)
- [ts-to-lisp-transpiler — L1408](ts-to-lisp-transpiler.md#^ref-ba11486b-1408-0) (line 1408, col 0, score 0.99)
- [Unique Info Dump Index — L7439](unique-info-dump-index.md#^ref-30ec3ba6-7439-0) (line 7439, col 0, score 0.85)
- [ts-to-lisp-transpiler — L1409](ts-to-lisp-transpiler.md#^ref-ba11486b-1409-0) (line 1409, col 0, score 0.99)
- [DSL — L1743](chunks/dsl.md#^ref-e87bc036-1743-0) (line 1743, col 0, score 0.99)
- [ts-to-lisp-transpiler — L1410](ts-to-lisp-transpiler.md#^ref-ba11486b-1410-0) (line 1410, col 0, score 0.99)
- [DSL — L1461](chunks/dsl.md#^ref-e87bc036-1461-0) (line 1461, col 0, score 0.99)
- [ts-to-lisp-transpiler — L1412](ts-to-lisp-transpiler.md#^ref-ba11486b-1412-0) (line 1412, col 0, score 0.99)
- [DSL — L1746](chunks/dsl.md#^ref-e87bc036-1746-0) (line 1746, col 0, score 0.99)
- [ts-to-lisp-transpiler — L1413](ts-to-lisp-transpiler.md#^ref-ba11486b-1413-0) (line 1413, col 0, score 0.99)
- [DSL — L3520](chunks/dsl.md#^ref-e87bc036-3520-0) (line 3520, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L9682](dynamic-context-model-for-web-components.md#^ref-f7702bf8-9682-0) (line 9682, col 0, score 0.98)
- [ts-to-lisp-transpiler — L1414](ts-to-lisp-transpiler.md#^ref-ba11486b-1414-0) (line 1414, col 0, score 0.99)
- [zero-copy-snapshots-and-workers — L2683](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-2683-0) (line 2683, col 0, score 1)
- [ts-to-lisp-transpiler — L2768](ts-to-lisp-transpiler.md#^ref-ba11486b-2768-0) (line 2768, col 0, score 0.95)
- [typed-struct-compiler — L3926](typed-struct-compiler.md#^ref-78eeedf7-3926-0) (line 3926, col 0, score 0.95)
- [windows-tiling-with-autohotkey — L3985](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-3985-0) (line 3985, col 0, score 0.95)
- [Unique Info Dump Index — L3601](unique-info-dump-index.md#^ref-30ec3ba6-3601-0) (line 3601, col 0, score 0.94)
- [zero-copy-snapshots-and-workers — L4446](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-4446-0) (line 4446, col 0, score 0.94)
- [Unique Info Dump Index — L3739](unique-info-dump-index.md#^ref-30ec3ba6-3739-0) (line 3739, col 0, score 0.94)
- [typed-struct-compiler — L3902](typed-struct-compiler.md#^ref-78eeedf7-3902-0) (line 3902, col 0, score 0.91)
- [Unique Info Dump Index — L3581](unique-info-dump-index.md#^ref-30ec3ba6-3581-0) (line 3581, col 0, score 0.91)
- [DSL — L1469](chunks/dsl.md#^ref-e87bc036-1469-0) (line 1469, col 0, score 0.99)
- [DSL — L1744](chunks/dsl.md#^ref-e87bc036-1744-0) (line 1744, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L6841](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6841-0) (line 6841, col 0, score 0.99)
- [plan-update-confirmation — L5927](plan-update-confirmation.md#^ref-b22d79c6-5927-0) (line 5927, col 0, score 0.99)
- [JavaScript — L1330](chunks/javascript.md#^ref-c1618c66-1330-0) (line 1330, col 0, score 0.99)
- [i3-bluetooth-setup — L2545](i3-bluetooth-setup.md#^ref-5e408692-2545-0) (line 2545, col 0, score 0.99)
- [JavaScript — L1332](chunks/javascript.md#^ref-c1618c66-1332-0) (line 1332, col 0, score 0.99)
- [i3-bluetooth-setup — L2547](i3-bluetooth-setup.md#^ref-5e408692-2547-0) (line 2547, col 0, score 0.99)
- [JavaScript — L1333](chunks/javascript.md#^ref-c1618c66-1333-0) (line 1333, col 0, score 0.99)
- [i3-bluetooth-setup — L2548](i3-bluetooth-setup.md#^ref-5e408692-2548-0) (line 2548, col 0, score 0.99)
- [DSL — L1472](chunks/dsl.md#^ref-e87bc036-1472-0) (line 1472, col 0, score 0.99)
- [Window Management — L2234](chunks/window-management.md#^ref-9e8ae388-2234-0) (line 2234, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L8837](dynamic-context-model-for-web-components.md#^ref-f7702bf8-8837-0) (line 8837, col 0, score 0.99)
- [komorebi-group-window-hack — L2857](komorebi-group-window-hack.md#^ref-dd89372d-2857-0) (line 2857, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L9070](migrate-to-provider-tenant-architecture.md#^ref-54382370-9070-0) (line 9070, col 0, score 0.99)
- [ParticleSimulationWithCanvasAndFFmpeg — L3910](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-3910-0) (line 3910, col 0, score 0.99)
- [Creative Moments — L12927](creative-moments.md#^ref-10d98225-12927-0) (line 12927, col 0, score 0.97)
- [Duck's Attractor States — L22051](ducks-attractor-states.md#^ref-13951643-22051-0) (line 22051, col 0, score 0.97)
- [eidolon-field-math-foundations — L16867](eidolon-field-math-foundations.md#^ref-008f2ac0-16867-0) (line 16867, col 0, score 0.97)
- [Promethean Chat Activity Report — L12804](promethean-chat-activity-report.md#^ref-18344cf9-12804-0) (line 12804, col 0, score 0.97)
- [Promethean Dev Workflow Update — L24339](promethean-dev-workflow-update.md#^ref-03a5578f-24339-0) (line 24339, col 0, score 0.97)
- [Promethean Documentation Update — L11213](promethean-documentation-update.txt#^ref-0b872af2-11213-0) (line 11213, col 0, score 0.97)
- [Promethean Notes — L12255](promethean-notes.md#^ref-1c4046b5-12255-0) (line 12255, col 0, score 0.97)
- [windows-tiling-with-autohotkey — L13748](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-13748-0) (line 13748, col 0, score 0.97)
- [eidolon-field-math-foundations — L27529](eidolon-field-math-foundations.md#^ref-008f2ac0-27529-0) (line 27529, col 0, score 0.89)
- [Promethean Dev Workflow Update — L25478](promethean-dev-workflow-update.md#^ref-03a5578f-25478-0) (line 25478, col 0, score 0.89)
- [Creative Moments — L11670](creative-moments.md#^ref-10d98225-11670-0) (line 11670, col 0, score 0.88)
- [eidolon-node-lifecycle — L2033](eidolon-node-lifecycle.md#^ref-938eca9c-2033-0) (line 2033, col 0, score 0.97)
- [Factorio AI with External Agents — L2609](factorio-ai-with-external-agents.md#^ref-a4d90289-2609-0) (line 2609, col 0, score 0.97)
- [field-dynamics-math-blocks — L3129](field-dynamics-math-blocks.md#^ref-7cfc230d-3129-0) (line 3129, col 0, score 0.97)
- [field-interaction-equations — L3287](field-interaction-equations.md#^ref-b09141b7-3287-0) (line 3287, col 0, score 0.97)
- [field-node-diagram-outline — L2073](field-node-diagram-outline.md#^ref-1f32c94a-2073-0) (line 2073, col 0, score 0.97)
- [field-node-diagram-set — L3139](field-node-diagram-set.md#^ref-22b989d5-3139-0) (line 3139, col 0, score 0.97)
- [field-node-diagram-visualizations — L2601](field-node-diagram-visualizations.md#^ref-e9b27b06-2601-0) (line 2601, col 0, score 0.97)
- [Fnord Tracer Protocol — L2426](fnord-tracer-protocol.md#^ref-fc21f824-2426-0) (line 2426, col 0, score 0.97)
- [Functional Embedding Pipeline Refactor — L3152](functional-embedding-pipeline-refactor.md#^ref-a4a25141-3152-0) (line 3152, col 0, score 0.97)
- [Functional Refactor of TypeScript Document Processing — L2390](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-2390-0) (line 2390, col 0, score 0.97)
- [Debugging Broker Connections and Agent Behavior — L3738](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-3738-0) (line 3738, col 0, score 0.98)
- [Duck's Self-Referential Perceptual Loop — L3760](ducks-self-referential-perceptual-loop.md#^ref-71726f04-3760-0) (line 3760, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L7941](dynamic-context-model-for-web-components.md#^ref-f7702bf8-7941-0) (line 7941, col 0, score 0.98)
- [Eidolon Field Abstract Model — L5164](eidolon-field-abstract-model.md#^ref-5e8b2388-5164-0) (line 5164, col 0, score 0.98)
- [eidolon-field-math-foundations — L2212](eidolon-field-math-foundations.md#^ref-008f2ac0-2212-0) (line 2212, col 0, score 0.98)
- [eidolon-node-lifecycle — L2578](eidolon-node-lifecycle.md#^ref-938eca9c-2578-0) (line 2578, col 0, score 0.98)
- [field-dynamics-math-blocks — L4260](field-dynamics-math-blocks.md#^ref-7cfc230d-4260-0) (line 4260, col 0, score 0.98)
- [field-interaction-equations — L2976](field-interaction-equations.md#^ref-b09141b7-2976-0) (line 2976, col 0, score 0.98)
- [field-node-diagram-outline — L3843](field-node-diagram-outline.md#^ref-1f32c94a-3843-0) (line 3843, col 0, score 0.98)
- [field-node-diagram-set — L3472](field-node-diagram-set.md#^ref-22b989d5-3472-0) (line 3472, col 0, score 0.98)
- [Shared — L2476](chunks/shared.md#^ref-623a55f7-2476-0) (line 2476, col 0, score 0.98)
- [Window Management — L2895](chunks/window-management.md#^ref-9e8ae388-2895-0) (line 2895, col 0, score 0.98)
- [Creative Moments — L1820](creative-moments.md#^ref-10d98225-1820-0) (line 1820, col 0, score 0.98)
- [Debugging Broker Connections and Agent Behavior — L2201](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2201-0) (line 2201, col 0, score 0.98)
- [DuckDuckGoSearchPipeline — L1356](duckduckgosearchpipeline.md#^ref-e979c50f-1356-0) (line 1356, col 0, score 0.98)
- [Duck's Attractor States — L3480](ducks-attractor-states.md#^ref-13951643-3480-0) (line 3480, col 0, score 0.98)
- [Duck's Self-Referential Perceptual Loop — L3438](ducks-self-referential-perceptual-loop.md#^ref-71726f04-3438-0) (line 3438, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L9958](dynamic-context-model-for-web-components.md#^ref-f7702bf8-9958-0) (line 9958, col 0, score 0.98)
- [Shared — L2486](chunks/shared.md#^ref-623a55f7-2486-0) (line 2486, col 0, score 0.99)
- [Creative Moments — L1830](creative-moments.md#^ref-10d98225-1830-0) (line 1830, col 0, score 0.99)
- [DuckDuckGoSearchPipeline — L1366](duckduckgosearchpipeline.md#^ref-e979c50f-1366-0) (line 1366, col 0, score 0.99)
- [Duck's Attractor States — L3490](ducks-attractor-states.md#^ref-13951643-3490-0) (line 3490, col 0, score 0.99)
- [Factorio AI with External Agents — L4223](factorio-ai-with-external-agents.md#^ref-a4d90289-4223-0) (line 4223, col 0, score 0.99)
- [Fnord Tracer Protocol — L5775](fnord-tracer-protocol.md#^ref-fc21f824-5775-0) (line 5775, col 0, score 0.99)
- [graph-ds — L5071](graph-ds.md#^ref-6620e2f2-5071-0) (line 5071, col 0, score 0.99)
- [i3-bluetooth-setup — L4584](i3-bluetooth-setup.md#^ref-5e408692-4584-0) (line 4584, col 0, score 0.99)
- [Layer1SurvivabilityEnvelope — L4447](layer1survivabilityenvelope.md#^ref-64a9f9f9-4447-0) (line 4447, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L9874](migrate-to-provider-tenant-architecture.md#^ref-54382370-9874-0) (line 9874, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration — L3597](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-3597-0) (line 3597, col 0, score 0.99)
- [Obsidian Templating Plugins Integration Guide — L4937](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-4937-0) (line 4937, col 0, score 0.99)
- [OpenAPI Validation Report — L1490](openapi-validation-report.md#^ref-5c152b08-1490-0) (line 1490, col 0, score 0.99)
- [Diagrams — L360](chunks/diagrams.md#^ref-45cd25b5-360-0) (line 360, col 0, score 0.94)
- [DSL — L408](chunks/dsl.md#^ref-e87bc036-408-0) (line 408, col 0, score 0.94)
- [JavaScript — L277](chunks/javascript.md#^ref-c1618c66-277-0) (line 277, col 0, score 0.94)
- [Math Fundamentals — L408](chunks/math-fundamentals.md#^ref-c6e87433-408-0) (line 408, col 0, score 0.94)
- [Operations — L415](chunks/operations.md#^ref-f1add613-415-0) (line 415, col 0, score 0.94)
- [Services — L418](chunks/services.md#^ref-75ea4a6a-418-0) (line 418, col 0, score 0.94)
- [Shared — L276](chunks/shared.md#^ref-623a55f7-276-0) (line 276, col 0, score 0.94)
- [Simulation Demo — L334](chunks/simulation-demo.md#^ref-557309a3-334-0) (line 334, col 0, score 0.94)
- [Tooling — L269](chunks/tooling.md#^ref-6cb4943e-269-0) (line 269, col 0, score 0.94)
- [Window Management — L398](chunks/window-management.md#^ref-9e8ae388-398-0) (line 398, col 0, score 0.94)
- [Unique Info Dump Index — L7541](unique-info-dump-index.md#^ref-30ec3ba6-7541-0) (line 7541, col 0, score 0.97)
- [Eidolon Field Abstract Model — L3844](eidolon-field-abstract-model.md#^ref-5e8b2388-3844-0) (line 3844, col 0, score 1)
- [Factorio AI with External Agents — L1873](factorio-ai-with-external-agents.md#^ref-a4d90289-1873-0) (line 1873, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L1992](model-upgrade-calm-down-guide.md#^ref-db74343f-1992-0) (line 1992, col 0, score 1)
- [Eidolon Field Abstract Model — L3845](eidolon-field-abstract-model.md#^ref-5e8b2388-3845-0) (line 3845, col 0, score 1)
- [Factorio AI with External Agents — L1874](factorio-ai-with-external-agents.md#^ref-a4d90289-1874-0) (line 1874, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L1993](model-upgrade-calm-down-guide.md#^ref-db74343f-1993-0) (line 1993, col 0, score 1)
- [Factorio AI with External Agents — L1875](factorio-ai-with-external-agents.md#^ref-a4d90289-1875-0) (line 1875, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L1994](model-upgrade-calm-down-guide.md#^ref-db74343f-1994-0) (line 1994, col 0, score 1)
- [Eidolon Field Abstract Model — L3846](eidolon-field-abstract-model.md#^ref-5e8b2388-3846-0) (line 3846, col 0, score 1)
- [Duck's Attractor States — L6762](ducks-attractor-states.md#^ref-13951643-6762-0) (line 6762, col 0, score 1)
- [Eidolon Field Abstract Model — L3847](eidolon-field-abstract-model.md#^ref-5e8b2388-3847-0) (line 3847, col 0, score 1)
- [Factorio AI with External Agents — L1876](factorio-ai-with-external-agents.md#^ref-a4d90289-1876-0) (line 1876, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L1995](model-upgrade-calm-down-guide.md#^ref-db74343f-1995-0) (line 1995, col 0, score 1)
- [Duck's Attractor States — L6763](ducks-attractor-states.md#^ref-13951643-6763-0) (line 6763, col 0, score 1)
- [Eidolon Field Abstract Model — L3848](eidolon-field-abstract-model.md#^ref-5e8b2388-3848-0) (line 3848, col 0, score 1)
- [Factorio AI with External Agents — L1877](factorio-ai-with-external-agents.md#^ref-a4d90289-1877-0) (line 1877, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L1996](model-upgrade-calm-down-guide.md#^ref-db74343f-1996-0) (line 1996, col 0, score 1)
- [Eidolon Field Abstract Model — L3849](eidolon-field-abstract-model.md#^ref-5e8b2388-3849-0) (line 3849, col 0, score 1)
- [Factorio AI with External Agents — L1878](factorio-ai-with-external-agents.md#^ref-a4d90289-1878-0) (line 1878, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L1997](model-upgrade-calm-down-guide.md#^ref-db74343f-1997-0) (line 1997, col 0, score 1)
- [Eidolon Field Abstract Model — L3850](eidolon-field-abstract-model.md#^ref-5e8b2388-3850-0) (line 3850, col 0, score 1)
- [Factorio AI with External Agents — L1879](factorio-ai-with-external-agents.md#^ref-a4d90289-1879-0) (line 1879, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L1998](model-upgrade-calm-down-guide.md#^ref-db74343f-1998-0) (line 1998, col 0, score 1)
- [Duck's Attractor States — L6766](ducks-attractor-states.md#^ref-13951643-6766-0) (line 6766, col 0, score 1)
- [Eidolon Field Abstract Model — L3851](eidolon-field-abstract-model.md#^ref-5e8b2388-3851-0) (line 3851, col 0, score 1)
- [eidolon-field-math-foundations — L1876](eidolon-field-math-foundations.md#^ref-008f2ac0-1876-0) (line 1876, col 0, score 1)
- [Factorio AI with External Agents — L1880](factorio-ai-with-external-agents.md#^ref-a4d90289-1880-0) (line 1880, col 0, score 1)
- [Duck's Attractor States — L1905](ducks-attractor-states.md#^ref-13951643-1905-0) (line 1905, col 0, score 0.99)
- [Model Selection for Lightweight Conversational Tasks — L1829](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-1829-0) (line 1829, col 0, score 0.99)
- [DSL — L2538](chunks/dsl.md#^ref-e87bc036-2538-0) (line 2538, col 0, score 0.99)
- [Model Selection for Lightweight Conversational Tasks — L1832](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-1832-0) (line 1832, col 0, score 0.99)
- [Model Selection for Lightweight Conversational Tasks — L1833](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-1833-0) (line 1833, col 0, score 1)
- [eidolon-field-math-foundations — L22020](eidolon-field-math-foundations.md#^ref-008f2ac0-22020-0) (line 22020, col 0, score 0.99)
- [zero-copy-snapshots-and-workers — L1984](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-1984-0) (line 1984, col 0, score 0.99)
- [Promethean Documentation Update — L2336](promethean-documentation-update.txt#^ref-0b872af2-2336-0) (line 2336, col 0, score 0.98)
- [Promethean Notes — L2518](promethean-notes.md#^ref-1c4046b5-2518-0) (line 2518, col 0, score 0.98)
- [The Jar of Echoes — L4868](the-jar-of-echoes.md#^ref-18138627-4868-0) (line 4868, col 0, score 0.98)
- [Prompt_Folder_Bootstrap — L2842](prompt-folder-bootstrap.md#^ref-bd4f0976-2842-0) (line 2842, col 0, score 0.98)
- [Pure TypeScript Search Microservice — L2095](pure-typescript-search-microservice.md#^ref-d17d3a96-2095-0) (line 2095, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L4056](dynamic-context-model-for-web-components.md#^ref-f7702bf8-4056-0) (line 4056, col 0, score 0.98)
- [eidolon-field-math-foundations — L25889](eidolon-field-math-foundations.md#^ref-008f2ac0-25889-0) (line 25889, col 0, score 0.97)
- [Creative Moments — L2523](creative-moments.md#^ref-10d98225-2523-0) (line 2523, col 0, score 0.87)
- [Duck's Attractor States — L4984](ducks-attractor-states.md#^ref-13951643-4984-0) (line 4984, col 0, score 0.87)
- [eidolon-field-math-foundations — L12061](eidolon-field-math-foundations.md#^ref-008f2ac0-12061-0) (line 12061, col 0, score 0.87)
- [Promethean Chat Activity Report — L2631](promethean-chat-activity-report.md#^ref-18344cf9-2631-0) (line 2631, col 0, score 0.87)
- [Self-Agency in AI Interaction — L2130](self-agency-in-ai-interaction.md#^ref-49a9a860-2130-0) (line 2130, col 0, score 0.98)
- [Promethean Documentation Pipeline Overview — L4451](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-4451-0) (line 4451, col 0, score 0.97)
- [Promethean Documentation Update — L1360](promethean-documentation-update.md#^ref-c0392040-1360-0) (line 1360, col 0, score 0.97)
- [Stateful Partitions and Rebalancing — L2068](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-2068-0) (line 2068, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L3100](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-3100-0) (line 3100, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L3106](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-3106-0) (line 3106, col 0, score 1)
- [DSL — L2477](chunks/dsl.md#^ref-e87bc036-2477-0) (line 2477, col 0, score 0.97)
- [Promethean-Copilot-Intent-Engine — L2837](promethean-copilot-intent-engine.md#^ref-ae24a280-2837-0) (line 2837, col 0, score 0.98)
- [Promethean Documentation Pipeline Overview — L2497](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-2497-0) (line 2497, col 0, score 0.98)
- [Window Management — L1363](chunks/window-management.md#^ref-9e8ae388-1363-0) (line 1363, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L12675](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-12675-0) (line 12675, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L20092](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-20092-0) (line 20092, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L23205](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-23205-0) (line 23205, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L19663](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-19663-0) (line 19663, col 0, score 0.97)
- [windows-tiling-with-autohotkey — L16695](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-16695-0) (line 16695, col 0, score 0.97)
- [Promethean Notes — L10835](promethean-notes.md#^ref-1c4046b5-10835-0) (line 10835, col 0, score 0.97)
- [windows-tiling-with-autohotkey — L22004](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-22004-0) (line 22004, col 0, score 0.97)
- [Promethean Notes — L10874](promethean-notes.md#^ref-1c4046b5-10874-0) (line 10874, col 0, score 0.97)
- [windows-tiling-with-autohotkey — L16678](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-16678-0) (line 16678, col 0, score 0.96)
- [eidolon-field-math-foundations — L21965](eidolon-field-math-foundations.md#^ref-008f2ac0-21965-0) (line 21965, col 0, score 0.99)
- [Creative Moments — L1407](creative-moments.md#^ref-10d98225-1407-0) (line 1407, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L4930](dynamic-context-model-for-web-components.md#^ref-f7702bf8-4930-0) (line 4930, col 0, score 0.98)
- [JavaScript — L2536](chunks/javascript.md#^ref-c1618c66-2536-0) (line 2536, col 0, score 0.98)
- [Math Fundamentals — L3147](chunks/math-fundamentals.md#^ref-c6e87433-3147-0) (line 3147, col 0, score 0.98)
- [Duck's Attractor States — L3819](ducks-attractor-states.md#^ref-13951643-3819-0) (line 3819, col 0, score 0.98)
- [Duck's Self-Referential Perceptual Loop — L3309](ducks-self-referential-perceptual-loop.md#^ref-71726f04-3309-0) (line 3309, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L9123](dynamic-context-model-for-web-components.md#^ref-f7702bf8-9123-0) (line 9123, col 0, score 0.98)
- [Debugging Broker Connections and Agent Behavior — L3296](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-3296-0) (line 3296, col 0, score 0.98)
- [DuckDuckGoSearchPipeline — L1518](duckduckgosearchpipeline.md#^ref-e979c50f-1518-0) (line 1518, col 0, score 0.98)
- [Duck's Attractor States — L4008](ducks-attractor-states.md#^ref-13951643-4008-0) (line 4008, col 0, score 0.98)
- [Duck's Self-Referential Perceptual Loop — L3983](ducks-self-referential-perceptual-loop.md#^ref-71726f04-3983-0) (line 3983, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L3518](dynamic-context-model-for-web-components.md#^ref-f7702bf8-3518-0) (line 3518, col 0, score 0.98)
- [Promethean Dev Workflow Update — L2770](promethean-dev-workflow-update.md#^ref-03a5578f-2770-0) (line 2770, col 0, score 0.97)
- [Promethean Workflow Optimization — L1054](promethean-workflow-optimization.md#^ref-d614d983-1054-0) (line 1054, col 0, score 0.97)
- [Promethean_Eidolon_Synchronicity_Model — L2145](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-2145-0) (line 2145, col 0, score 0.96)
- [Promethean Infrastructure Setup — L7332](promethean-infrastructure-setup.md#^ref-6deed6ac-7332-0) (line 7332, col 0, score 0.96)
- [Prometheus Observability Stack — L5506](prometheus-observability-stack.md#^ref-e90b5a16-5506-0) (line 5506, col 0, score 0.96)
- [Prompt_Folder_Bootstrap — L5696](prompt-folder-bootstrap.md#^ref-bd4f0976-5696-0) (line 5696, col 0, score 0.96)
- [Provider-Agnostic Chat Panel Implementation — L5400](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-5400-0) (line 5400, col 0, score 0.96)
- [Pure TypeScript Search Microservice — L6334](pure-typescript-search-microservice.md#^ref-d17d3a96-6334-0) (line 6334, col 0, score 0.96)
- [ripple-propagation-demo — L3383](ripple-propagation-demo.md#^ref-8430617b-3383-0) (line 3383, col 0, score 0.96)
- [The Jar of Echoes — L3761](the-jar-of-echoes.md#^ref-18138627-3761-0) (line 3761, col 0, score 1)
- [windows-tiling-with-autohotkey — L4031](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-4031-0) (line 4031, col 0, score 1)
- [Synchronicity Waves and Web — L2245](synchronicity-waves-and-web.md#^ref-91295f3a-2245-0) (line 2245, col 0, score 1)
- [DSL — L3553](chunks/dsl.md#^ref-e87bc036-3553-0) (line 3553, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L9696](dynamic-context-model-for-web-components.md#^ref-f7702bf8-9696-0) (line 9696, col 0, score 0.98)
- [Obsidian ChatGPT Plugin Integration Guide — L1977](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-1977-0) (line 1977, col 0, score 0.98)
- [Obsidian ChatGPT Plugin Integration — L1869](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-1869-0) (line 1869, col 0, score 0.98)
- [Obsidian Templating Plugins Integration Guide — L2460](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-2460-0) (line 2460, col 0, score 0.98)
- [Duck's Self-Referential Perceptual Loop — L3664](ducks-self-referential-perceptual-loop.md#^ref-71726f04-3664-0) (line 3664, col 0, score 0.97)
- [Dynamic Context Model for Web Components — L7036](dynamic-context-model-for-web-components.md#^ref-f7702bf8-7036-0) (line 7036, col 0, score 0.97)
- [Eidolon Field Abstract Model — L5490](eidolon-field-abstract-model.md#^ref-5e8b2388-5490-0) (line 5490, col 0, score 0.97)
- [eidolon-field-math-foundations — L5770](eidolon-field-math-foundations.md#^ref-008f2ac0-5770-0) (line 5770, col 0, score 0.97)
- [eidolon-node-lifecycle — L608](eidolon-node-lifecycle.md#^ref-938eca9c-608-0) (line 608, col 0, score 0.96)
- [Factorio AI with External Agents — L631](factorio-ai-with-external-agents.md#^ref-a4d90289-631-0) (line 631, col 0, score 0.96)
- [field-dynamics-math-blocks — L804](field-dynamics-math-blocks.md#^ref-7cfc230d-804-0) (line 804, col 0, score 0.96)
- [field-interaction-equations — L859](field-interaction-equations.md#^ref-b09141b7-859-0) (line 859, col 0, score 0.96)
- [NPU Voice Code and Sensory Integration — L2124](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-2124-0) (line 2124, col 0, score 0.86)
- [Obsidian ChatGPT Plugin Integration — L2857](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-2857-0) (line 2857, col 0, score 0.86)
- [obsidian-ignore-node-modules-regex — L3351](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-3351-0) (line 3351, col 0, score 0.86)
- [Obsidian Task Generation — L1873](obsidian-task-generation.md#^ref-9b694a91-1873-0) (line 1873, col 0, score 0.86)
- [Obsidian Templating Plugins Integration Guide — L3407](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-3407-0) (line 3407, col 0, score 0.86)
- [OpenAPI Validation Report — L1834](openapi-validation-report.md#^ref-5c152b08-1834-0) (line 1834, col 0, score 0.86)
- [ParticleSimulationWithCanvasAndFFmpeg — L5078](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-5078-0) (line 5078, col 0, score 0.86)
- [Per-Domain Policy System for JS Crawler — L3613](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3613-0) (line 3613, col 0, score 0.86)
- [Performance-Optimized-Polyglot-Bridge — L5902](performance-optimized-polyglot-bridge.md#^ref-f5579967-5902-0) (line 5902, col 0, score 0.86)
- [Functional Embedding Pipeline Refactor — L1802](functional-embedding-pipeline-refactor.md#^ref-a4a25141-1802-0) (line 1802, col 0, score 0.99)
- [Services — L2329](chunks/services.md#^ref-75ea4a6a-2329-0) (line 2329, col 0, score 0.98)
- [Tooling — L1927](chunks/tooling.md#^ref-6cb4943e-1927-0) (line 1927, col 0, score 0.98)
- [Duck's Self-Referential Perceptual Loop — L3227](ducks-self-referential-perceptual-loop.md#^ref-71726f04-3227-0) (line 3227, col 0, score 0.98)
- [eidolon-node-lifecycle — L3353](eidolon-node-lifecycle.md#^ref-938eca9c-3353-0) (line 3353, col 0, score 0.98)
- [field-dynamics-math-blocks — L6381](field-dynamics-math-blocks.md#^ref-7cfc230d-6381-0) (line 6381, col 0, score 0.98)
- [field-node-diagram-set — L4268](field-node-diagram-set.md#^ref-22b989d5-4268-0) (line 4268, col 0, score 0.98)
- [Duck's Attractor States — L9927](ducks-attractor-states.md#^ref-13951643-9927-0) (line 9927, col 0, score 0.99)
- [Eidolon Field Abstract Model — L2757](eidolon-field-abstract-model.md#^ref-5e8b2388-2757-0) (line 2757, col 0, score 0.99)
- [heartbeat-fragment-demo — L1749](heartbeat-fragment-demo.md#^ref-dd00677a-1749-0) (line 1749, col 0, score 0.99)
- [homeostasis-decay-formulas — L1910](homeostasis-decay-formulas.md#^ref-37b5d236-1910-0) (line 1910, col 0, score 0.99)
- [ripple-propagation-demo — L2479](ripple-propagation-demo.md#^ref-8430617b-2479-0) (line 2479, col 0, score 0.99)
- [Pure TypeScript Search Microservice — L2240](pure-typescript-search-microservice.md#^ref-d17d3a96-2240-0) (line 2240, col 0, score 0.97)
- [Prompt_Folder_Bootstrap — L2007](prompt-folder-bootstrap.md#^ref-bd4f0976-2007-0) (line 2007, col 0, score 0.97)
- [Pure TypeScript Search Microservice — L2484](pure-typescript-search-microservice.md#^ref-d17d3a96-2484-0) (line 2484, col 0, score 0.97)
- [Reawakening Duck — L2669](reawakening-duck.md#^ref-59b5670f-2669-0) (line 2669, col 0, score 0.97)
- [schema-evolution-workflow — L2262](schema-evolution-workflow.md#^ref-d8059b6a-2262-0) (line 2262, col 0, score 0.97)
- [Stateful Partitions and Rebalancing — L3050](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-3050-0) (line 3050, col 0, score 0.97)
- [Duck's Attractor States — L11531](ducks-attractor-states.md#^ref-13951643-11531-0) (line 11531, col 0, score 0.99)
- [heartbeat-fragment-demo — L1752](heartbeat-fragment-demo.md#^ref-dd00677a-1752-0) (line 1752, col 0, score 0.99)
- [homeostasis-decay-formulas — L1913](homeostasis-decay-formulas.md#^ref-37b5d236-1913-0) (line 1913, col 0, score 0.99)
- [ripple-propagation-demo — L2481](ripple-propagation-demo.md#^ref-8430617b-2481-0) (line 2481, col 0, score 0.99)
- [Duck's Attractor States — L11533](ducks-attractor-states.md#^ref-13951643-11533-0) (line 11533, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L7764](dynamic-context-model-for-web-components.md#^ref-f7702bf8-7764-0) (line 7764, col 0, score 0.98)
- [Obsidian ChatGPT Plugin Integration — L1911](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-1911-0) (line 1911, col 0, score 0.98)
- [Obsidian Templating Plugins Integration Guide — L2806](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-2806-0) (line 2806, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L9636](dynamic-context-model-for-web-components.md#^ref-f7702bf8-9636-0) (line 9636, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration Guide — L1374](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-1374-0) (line 1374, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration — L1328](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-1328-0) (line 1328, col 0, score 0.99)
- [heartbeat-fragment-demo — L1748](heartbeat-fragment-demo.md#^ref-dd00677a-1748-0) (line 1748, col 0, score 1)
- [homeostasis-decay-formulas — L1909](homeostasis-decay-formulas.md#^ref-37b5d236-1909-0) (line 1909, col 0, score 1)
- [Eidolon Field Abstract Model — L2755](eidolon-field-abstract-model.md#^ref-5e8b2388-2755-0) (line 2755, col 0, score 0.99)
- [ripple-propagation-demo — L2475](ripple-propagation-demo.md#^ref-8430617b-2475-0) (line 2475, col 0, score 0.99)
- [DSL — L2481](chunks/dsl.md#^ref-e87bc036-2481-0) (line 2481, col 0, score 0.96)
- [ripple-propagation-demo — L1313](ripple-propagation-demo.md#^ref-8430617b-1313-0) (line 1313, col 0, score 0.94)
- [Unique Info Dump Index — L2754](unique-info-dump-index.md#^ref-30ec3ba6-2754-0) (line 2754, col 0, score 0.94)
- [field-node-diagram-set — L3002](field-node-diagram-set.md#^ref-22b989d5-3002-0) (line 3002, col 0, score 0.94)
- [field-node-diagram-visualizations — L2546](field-node-diagram-visualizations.md#^ref-e9b27b06-2546-0) (line 2546, col 0, score 0.94)
- [heartbeat-fragment-demo — L1437](heartbeat-fragment-demo.md#^ref-dd00677a-1437-0) (line 1437, col 0, score 0.94)
- [homeostasis-decay-formulas — L4831](homeostasis-decay-formulas.md#^ref-37b5d236-4831-0) (line 4831, col 0, score 0.94)
- [Promethean Chat Activity Report — L2167](promethean-chat-activity-report.md#^ref-18344cf9-2167-0) (line 2167, col 0, score 0.98)
- [Promethean Data Sync Protocol — L1423](promethean-data-sync-protocol.md#^ref-9fab9e76-1423-0) (line 1423, col 0, score 0.98)
- [Promethean Documentation Overview — L757](promethean-documentation-overview.md#^ref-9413237f-757-0) (line 757, col 0, score 0.98)
- [Promethean Documentation Pipeline Overview — L3122](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-3122-0) (line 3122, col 0, score 0.98)
- [Promethean Documentation Update — L1448](promethean-documentation-update.md#^ref-c0392040-1448-0) (line 1448, col 0, score 0.98)
- [Promethean Documentation Update — L1911](promethean-documentation-update.txt#^ref-0b872af2-1911-0) (line 1911, col 0, score 0.98)
- [The Jar of Echoes — L3971](the-jar-of-echoes.md#^ref-18138627-3971-0) (line 3971, col 0, score 0.98)
- [TypeScript Patch for Tool Calling Support — L5876](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-5876-0) (line 5876, col 0, score 0.98)
- [Unique Info Dump Index — L5464](unique-info-dump-index.md#^ref-30ec3ba6-5464-0) (line 5464, col 0, score 0.98)
- [Promethean-Copilot-Intent-Engine — L1865](promethean-copilot-intent-engine.md#^ref-ae24a280-1865-0) (line 1865, col 0, score 0.98)
- [Unique Info Dump Index — L2354](unique-info-dump-index.md#^ref-30ec3ba6-2354-0) (line 2354, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L4584](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-4584-0) (line 4584, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L4579](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-4579-0) (line 4579, col 0, score 0.98)
- [typed-struct-compiler — L1746](typed-struct-compiler.md#^ref-78eeedf7-1746-0) (line 1746, col 0, score 0.97)
- [windows-tiling-with-autohotkey — L4590](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-4590-0) (line 4590, col 0, score 0.97)
- [Chroma Toolkit Consolidation Plan — L6318](chroma-toolkit-consolidation-plan.md#^ref-5020e892-6318-0) (line 6318, col 0, score 0.99)
- [i3-bluetooth-setup — L2954](i3-bluetooth-setup.md#^ref-5e408692-2954-0) (line 2954, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L8532](migrate-to-provider-tenant-architecture.md#^ref-54382370-8532-0) (line 8532, col 0, score 0.99)
- [Diagrams — L1230](chunks/diagrams.md#^ref-45cd25b5-1230-0) (line 1230, col 0, score 0.97)
- [JavaScript — L4307](chunks/javascript.md#^ref-c1618c66-4307-0) (line 4307, col 0, score 0.97)
- [Services — L3737](chunks/services.md#^ref-75ea4a6a-3737-0) (line 3737, col 0, score 0.97)
- [Simulation Demo — L3384](chunks/simulation-demo.md#^ref-557309a3-3384-0) (line 3384, col 0, score 0.97)
- [Tooling — L2767](chunks/tooling.md#^ref-6cb4943e-2767-0) (line 2767, col 0, score 0.97)
- [Window Management — L3626](chunks/window-management.md#^ref-9e8ae388-3626-0) (line 3626, col 0, score 0.97)
- [Debugging Broker Connections and Agent Behavior — L4646](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-4646-0) (line 4646, col 0, score 0.97)
- [Docops Feature Updates — L1370](docops-feature-updates-2.md#^ref-cdbd21ee-1370-0) (line 1370, col 0, score 0.97)
- [Docops Feature Updates — L1624](docops-feature-updates.md#^ref-2792d448-1624-0) (line 1624, col 0, score 0.97)
- [DuckDuckGoSearchPipeline — L1794](duckduckgosearchpipeline.md#^ref-e979c50f-1794-0) (line 1794, col 0, score 0.97)
- [Dynamic Context Model for Web Components — L10308](dynamic-context-model-for-web-components.md#^ref-f7702bf8-10308-0) (line 10308, col 0, score 0.97)
- [eidolon-node-lifecycle — L4095](eidolon-node-lifecycle.md#^ref-938eca9c-4095-0) (line 4095, col 0, score 0.97)
- [Factorio AI with External Agents — L4978](factorio-ai-with-external-agents.md#^ref-a4d90289-4978-0) (line 4978, col 0, score 0.97)
- [Provider-Agnostic Chat Panel Implementation — L3250](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-3250-0) (line 3250, col 0, score 0.99)
- [Reawakening Duck — L1671](reawakening-duck.md#^ref-59b5670f-1671-0) (line 1671, col 0, score 0.99)
- [ripple-propagation-demo — L4251](ripple-propagation-demo.md#^ref-8430617b-4251-0) (line 4251, col 0, score 0.99)
- [schema-evolution-workflow — L6535](schema-evolution-workflow.md#^ref-d8059b6a-6535-0) (line 6535, col 0, score 0.99)
- [sibilant-macro-targets — L5834](sibilant-macro-targets.md#^ref-c5c9a5c6-5834-0) (line 5834, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L7766](dynamic-context-model-for-web-components.md#^ref-f7702bf8-7766-0) (line 7766, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L5742](chroma-toolkit-consolidation-plan.md#^ref-5020e892-5742-0) (line 5742, col 0, score 0.99)
- [Diagrams — L2963](chunks/diagrams.md#^ref-45cd25b5-2963-0) (line 2963, col 0, score 0.99)
- [ParticleSimulationWithCanvasAndFFmpeg — L4324](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-4324-0) (line 4324, col 0, score 0.98)
- [Per-Domain Policy System for JS Crawler — L5531](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-5531-0) (line 5531, col 0, score 0.98)
- [Performance-Optimized-Polyglot-Bridge — L2386](performance-optimized-polyglot-bridge.md#^ref-f5579967-2386-0) (line 2386, col 0, score 0.98)
- [plan-update-confirmation — L8144](plan-update-confirmation.md#^ref-b22d79c6-8144-0) (line 8144, col 0, score 0.98)
- [polyglot-repl-interface-layer — L1507](polyglot-repl-interface-layer.md#^ref-9c79206d-1507-0) (line 1507, col 0, score 0.98)
- [Promethean Dev Workflow Update — L3354](promethean-dev-workflow-update.md#^ref-03a5578f-3354-0) (line 3354, col 0, score 0.98)
- [Promethean Infrastructure Setup — L6738](promethean-infrastructure-setup.md#^ref-6deed6ac-6738-0) (line 6738, col 0, score 0.98)
- [Promethean State Format — L3521](promethean-state-format.md#^ref-23df6ddb-3521-0) (line 3521, col 0, score 0.98)
- [Prometheus Observability Stack — L4677](prometheus-observability-stack.md#^ref-e90b5a16-4677-0) (line 4677, col 0, score 0.98)
- [Prompt_Folder_Bootstrap — L4845](prompt-folder-bootstrap.md#^ref-bd4f0976-4845-0) (line 4845, col 0, score 0.98)
- [Math Fundamentals — L2023](chunks/math-fundamentals.md#^ref-c6e87433-2023-0) (line 2023, col 0, score 0.97)
- [Services — L1656](chunks/services.md#^ref-75ea4a6a-1656-0) (line 1656, col 0, score 0.97)
- [Shared — L1641](chunks/shared.md#^ref-623a55f7-1641-0) (line 1641, col 0, score 0.97)
- [Simulation Demo — L1841](chunks/simulation-demo.md#^ref-557309a3-1841-0) (line 1841, col 0, score 0.97)
- [Tooling — L1648](chunks/tooling.md#^ref-6cb4943e-1648-0) (line 1648, col 0, score 0.97)
- [Window Management — L1640](chunks/window-management.md#^ref-9e8ae388-1640-0) (line 1640, col 0, score 0.97)
- [Eidolon Field Abstract Model — L5655](eidolon-field-abstract-model.md#^ref-5e8b2388-5655-0) (line 5655, col 0, score 0.97)
- [obsidian-ignore-node-modules-regex — L2722](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-2722-0) (line 2722, col 0, score 0.97)
- [Shared — L2938](chunks/shared.md#^ref-623a55f7-2938-0) (line 2938, col 0, score 0.99)
- [Simulation Demo — L3240](chunks/simulation-demo.md#^ref-557309a3-3240-0) (line 3240, col 0, score 0.99)
- [Post-Linguistic Transhuman Design Frameworks — L3048](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-3048-0) (line 3048, col 0, score 0.95)
- [Promethean Chat Activity Report — L1595](promethean-chat-activity-report.md#^ref-18344cf9-1595-0) (line 1595, col 0, score 0.95)
- [Promethean-Copilot-Intent-Engine — L5351](promethean-copilot-intent-engine.md#^ref-ae24a280-5351-0) (line 5351, col 0, score 0.95)
- [Promethean Data Sync Protocol — L862](promethean-data-sync-protocol.md#^ref-9fab9e76-862-0) (line 862, col 0, score 0.95)
- [Promethean Dev Workflow Update — L3863](promethean-dev-workflow-update.md#^ref-03a5578f-3863-0) (line 3863, col 0, score 0.95)
- [Promethean Documentation Update — L879](promethean-documentation-update.md#^ref-c0392040-879-0) (line 879, col 0, score 0.95)
- [Promethean Documentation Update — L1342](promethean-documentation-update.txt#^ref-0b872af2-1342-0) (line 1342, col 0, score 0.95)
- [Promethean_Eidolon_Synchronicity_Model — L2293](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-2293-0) (line 2293, col 0, score 0.95)
- [Promethean Infrastructure Setup — L6402](promethean-infrastructure-setup.md#^ref-6deed6ac-6402-0) (line 6402, col 0, score 0.95)
- [Promethean Notes — L1515](promethean-notes.md#^ref-1c4046b5-1515-0) (line 1515, col 0, score 0.95)
- [eidolon-field-math-foundations — L3784](eidolon-field-math-foundations.md#^ref-008f2ac0-3784-0) (line 3784, col 0, score 1)
- [Promethean Dev Workflow Update — L18986](promethean-dev-workflow-update.md#^ref-03a5578f-18986-0) (line 18986, col 0, score 1)
- [Math Fundamentals — L1259](chunks/math-fundamentals.md#^ref-c6e87433-1259-0) (line 1259, col 0, score 0.99)
- [eidolon-field-math-foundations — L3786](eidolon-field-math-foundations.md#^ref-008f2ac0-3786-0) (line 3786, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L5215](chroma-toolkit-consolidation-plan.md#^ref-5020e892-5215-0) (line 5215, col 0, score 0.99)
- [Math Fundamentals — L1260](chunks/math-fundamentals.md#^ref-c6e87433-1260-0) (line 1260, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L3906](chroma-toolkit-consolidation-plan.md#^ref-5020e892-3906-0) (line 3906, col 0, score 0.96)
- [Services — L1721](chunks/services.md#^ref-75ea4a6a-1721-0) (line 1721, col 0, score 0.96)
- [Simulation Demo — L1556](chunks/simulation-demo.md#^ref-557309a3-1556-0) (line 1556, col 0, score 0.96)
- [Tooling — L1362](chunks/tooling.md#^ref-6cb4943e-1362-0) (line 1362, col 0, score 0.96)
- [Window Management — L1826](chunks/window-management.md#^ref-9e8ae388-1826-0) (line 1826, col 0, score 0.96)
- [Dynamic Context Model for Web Components — L7932](dynamic-context-model-for-web-components.md#^ref-f7702bf8-7932-0) (line 7932, col 0, score 0.96)
- [Eidolon Field Abstract Model — L5155](eidolon-field-abstract-model.md#^ref-5e8b2388-5155-0) (line 5155, col 0, score 0.96)
- [eidolon-node-lifecycle — L2569](eidolon-node-lifecycle.md#^ref-938eca9c-2569-0) (line 2569, col 0, score 0.96)
- [field-dynamics-math-blocks — L4251](field-dynamics-math-blocks.md#^ref-7cfc230d-4251-0) (line 4251, col 0, score 0.96)
- [field-interaction-equations — L2967](field-interaction-equations.md#^ref-b09141b7-2967-0) (line 2967, col 0, score 0.96)
- [field-node-diagram-outline — L3834](field-node-diagram-outline.md#^ref-1f32c94a-3834-0) (line 3834, col 0, score 0.96)
- [field-node-diagram-set — L3463](field-node-diagram-set.md#^ref-22b989d5-3463-0) (line 3463, col 0, score 0.96)
- [field-node-diagram-visualizations — L3096](field-node-diagram-visualizations.md#^ref-e9b27b06-3096-0) (line 3096, col 0, score 0.96)
- [TypeScript Patch for Tool Calling Support — L5009](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-5009-0) (line 5009, col 0, score 0.99)
- [TypeScript Patch for Tool Calling Support — L6004](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-6004-0) (line 6004, col 0, score 0.99)
- [Unique Info Dump Index — L4945](unique-info-dump-index.md#^ref-30ec3ba6-4945-0) (line 4945, col 0, score 0.99)
- [zero-copy-snapshots-and-workers — L3854](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-3854-0) (line 3854, col 0, score 0.99)
- [TypeScript Patch for Tool Calling Support — L6022](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-6022-0) (line 6022, col 0, score 0.99)
- [Unique Info Dump Index — L4963](unique-info-dump-index.md#^ref-30ec3ba6-4963-0) (line 4963, col 0, score 0.99)
- [zero-copy-snapshots-and-workers — L3872](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-3872-0) (line 3872, col 0, score 0.99)
- [TypeScript Patch for Tool Calling Support — L6075](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-6075-0) (line 6075, col 0, score 0.99)
- [Unique Info Dump Index — L4788](unique-info-dump-index.md#^ref-30ec3ba6-4788-0) (line 4788, col 0, score 0.99)
- [Operations — L1578](chunks/operations.md#^ref-f1add613-1578-0) (line 1578, col 0, score 0.95)
- [Services — L2867](chunks/services.md#^ref-75ea4a6a-2867-0) (line 2867, col 0, score 0.95)
- [Simulation Demo — L2754](chunks/simulation-demo.md#^ref-557309a3-2754-0) (line 2754, col 0, score 0.95)
- [Tooling — L2250](chunks/tooling.md#^ref-6cb4943e-2250-0) (line 2250, col 0, score 0.95)
- [Window Management — L3179](chunks/window-management.md#^ref-9e8ae388-3179-0) (line 3179, col 0, score 0.95)
- [DuckDuckGoSearchPipeline — L1698](duckduckgosearchpipeline.md#^ref-e979c50f-1698-0) (line 1698, col 0, score 0.95)
- [Duck's Attractor States — L4105](ducks-attractor-states.md#^ref-13951643-4105-0) (line 4105, col 0, score 0.95)
- [Duck's Self-Referential Perceptual Loop — L3575](ducks-self-referential-perceptual-loop.md#^ref-71726f04-3575-0) (line 3575, col 0, score 0.95)
- [Dynamic Context Model for Web Components — L7686](dynamic-context-model-for-web-components.md#^ref-f7702bf8-7686-0) (line 7686, col 0, score 0.95)
- [eidolon-field-math-foundations — L6476](eidolon-field-math-foundations.md#^ref-008f2ac0-6476-0) (line 6476, col 0, score 0.99)
- [Fnord Tracer Protocol — L4999](fnord-tracer-protocol.md#^ref-fc21f824-4999-0) (line 4999, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L10329](migrate-to-provider-tenant-architecture.md#^ref-54382370-10329-0) (line 10329, col 0, score 0.99)
- [Mindful Prioritization — L1790](mindful-prioritization.md#^ref-40185d05-1790-0) (line 1790, col 0, score 0.99)
- [MindfulRobotIntegration — L1823](mindfulrobotintegration.md#^ref-5f65dfa5-1823-0) (line 1823, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration Guide — L4156](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-4156-0) (line 4156, col 0, score 0.99)
- [ParticleSimulationWithCanvasAndFFmpeg — L5837](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-5837-0) (line 5837, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L6306](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-6306-0) (line 6306, col 0, score 0.99)
- [Pipeline Enhancements — L1350](pipeline-enhancements.md#^ref-e2135d9f-1350-0) (line 1350, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L7798](dynamic-context-model-for-web-components.md#^ref-f7702bf8-7798-0) (line 7798, col 0, score 0.98)
- [Obsidian ChatGPT Plugin Integration — L1945](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-1945-0) (line 1945, col 0, score 0.98)
- [plan-update-confirmation — L7451](plan-update-confirmation.md#^ref-b22d79c6-7451-0) (line 7451, col 0, score 0.98)
- [DSL — L1238](chunks/dsl.md#^ref-e87bc036-1238-0) (line 1238, col 0, score 0.97)
- [JavaScript — L3635](chunks/javascript.md#^ref-c1618c66-3635-0) (line 3635, col 0, score 0.97)
- [Window Management — L2160](chunks/window-management.md#^ref-9e8ae388-2160-0) (line 2160, col 0, score 0.97)
- [Dynamic Context Model for Web Components — L8827](dynamic-context-model-for-web-components.md#^ref-f7702bf8-8827-0) (line 8827, col 0, score 0.97)
- [komorebi-group-window-hack — L3417](komorebi-group-window-hack.md#^ref-dd89372d-3417-0) (line 3417, col 0, score 0.97)
- [Migrate to Provider-Tenant Architecture — L9068](migrate-to-provider-tenant-architecture.md#^ref-54382370-9068-0) (line 9068, col 0, score 0.97)
- [ParticleSimulationWithCanvasAndFFmpeg — L3900](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-3900-0) (line 3900, col 0, score 0.97)
- [Dynamic Context Model for Web Components — L9620](dynamic-context-model-for-web-components.md#^ref-f7702bf8-9620-0) (line 9620, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration Guide — L1358](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-1358-0) (line 1358, col 0, score 0.99)
- [Obsidian Templating Plugins Integration Guide — L1546](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-1546-0) (line 1546, col 0, score 0.99)
- [Functional Refactor of TypeScript Document Processing — L2699](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-2699-0) (line 2699, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L1316](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-1316-0) (line 1316, col 0, score 1)
- [Dynamic Context Model for Web Components — L9668](dynamic-context-model-for-web-components.md#^ref-f7702bf8-9668-0) (line 9668, col 0, score 0.98)
- [Obsidian ChatGPT Plugin Integration Guide — L1406](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-1406-0) (line 1406, col 0, score 0.98)
- [Chroma Toolkit Consolidation Plan — L6712](chroma-toolkit-consolidation-plan.md#^ref-5020e892-6712-0) (line 6712, col 0, score 0.97)
- [DSL — L3968](chunks/dsl.md#^ref-e87bc036-3968-0) (line 3968, col 0, score 0.97)
- [Duck's Self-Referential Perceptual Loop — L4085](ducks-self-referential-perceptual-loop.md#^ref-71726f04-4085-0) (line 4085, col 0, score 0.97)
- [field-dynamics-math-blocks — L5557](field-dynamics-math-blocks.md#^ref-7cfc230d-5557-0) (line 5557, col 0, score 0.97)
- [Obsidian ChatGPT Plugin Integration — L1333](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-1333-0) (line 1333, col 0, score 0.99)
- [i3-bluetooth-setup — L4126](i3-bluetooth-setup.md#^ref-5e408692-4126-0) (line 4126, col 0, score 0.98)
- [Provider-Agnostic Chat Panel Implementation — L3681](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-3681-0) (line 3681, col 0, score 0.98)
- [sibilant-macro-targets — L1952](sibilant-macro-targets.md#^ref-c5c9a5c6-1952-0) (line 1952, col 0, score 0.98)
- [Obsidian ChatGPT Plugin Integration — L1902](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-1902-0) (line 1902, col 0, score 0.98)
- [Obsidian Templating Plugins Integration Guide — L2797](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-2797-0) (line 2797, col 0, score 0.98)
- [DSL — L3521](chunks/dsl.md#^ref-e87bc036-3521-0) (line 3521, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L9683](dynamic-context-model-for-web-components.md#^ref-f7702bf8-9683-0) (line 9683, col 0, score 0.99)
- [Unique Info Dump Index — L2003](unique-info-dump-index.md#^ref-30ec3ba6-2003-0) (line 2003, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration — L1340](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-1340-0) (line 1340, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L9648](dynamic-context-model-for-web-components.md#^ref-f7702bf8-9648-0) (line 9648, col 0, score 0.99)
- [Promethean State Format — L3768](promethean-state-format.md#^ref-23df6ddb-3768-0) (line 3768, col 0, score 0.99)
- [The Jar of Echoes — L4135](the-jar-of-echoes.md#^ref-18138627-4135-0) (line 4135, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L9640](dynamic-context-model-for-web-components.md#^ref-f7702bf8-9640-0) (line 9640, col 0, score 0.99)
- [The Jar of Echoes — L4127](the-jar-of-echoes.md#^ref-18138627-4127-0) (line 4127, col 0, score 0.99)
- [ts-to-lisp-transpiler — L4222](ts-to-lisp-transpiler.md#^ref-ba11486b-4222-0) (line 4222, col 0, score 0.99)
- [TypeScript Patch for Tool Calling Support — L5052](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-5052-0) (line 5052, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration — L1913](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-1913-0) (line 1913, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L4020](chroma-toolkit-consolidation-plan.md#^ref-5020e892-4020-0) (line 4020, col 0, score 0.98)
- [Diagrams — L4188](chunks/diagrams.md#^ref-45cd25b5-4188-0) (line 4188, col 0, score 0.98)
- [JavaScript — L3376](chunks/javascript.md#^ref-c1618c66-3376-0) (line 3376, col 0, score 0.98)
- [Services — L2384](chunks/services.md#^ref-75ea4a6a-2384-0) (line 2384, col 0, score 0.98)
- [Debugging Broker Connections and Agent Behavior — L2931](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2931-0) (line 2931, col 0, score 0.98)
- [Duck's Self-Referential Perceptual Loop — L3634](ducks-self-referential-perceptual-loop.md#^ref-71726f04-3634-0) (line 3634, col 0, score 0.98)
- [field-node-diagram-outline — L4815](field-node-diagram-outline.md#^ref-1f32c94a-4815-0) (line 4815, col 0, score 0.99)
- [Unique Info Dump Index — L2498](unique-info-dump-index.md#^ref-30ec3ba6-2498-0) (line 2498, col 0, score 0.99)
- [Unique Info Dump Index — L2170](unique-info-dump-index.md#^ref-30ec3ba6-2170-0) (line 2170, col 0, score 0.98)
- [Layer1SurvivabilityEnvelope — L1853](layer1survivabilityenvelope.md#^ref-64a9f9f9-1853-0) (line 1853, col 0, score 0.97)
- [Promethean Pipelines — L2868](promethean-pipelines.md#^ref-8b8e6103-2868-0) (line 2868, col 0, score 0.97)
- [Reawakening Duck — L4232](reawakening-duck.md#^ref-59b5670f-4232-0) (line 4232, col 0, score 0.96)
- [Smoke Resonance Visualizations — L1797](smoke-resonance-visualizations.md#^ref-ac9d3ac5-1797-0) (line 1797, col 0, score 0.96)
- [Model Upgrade Calm-Down Guide — L4041](model-upgrade-calm-down-guide.md#^ref-db74343f-4041-0) (line 4041, col 0, score 0.97)
- [NPU Voice Code and Sensory Integration — L1086](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-1086-0) (line 1086, col 0, score 0.97)
- [Obsidian ChatGPT Plugin Integration Guide — L4070](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-4070-0) (line 4070, col 0, score 0.97)
- [Obsidian ChatGPT Plugin Integration — L3858](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-3858-0) (line 3858, col 0, score 0.97)
- [obsidian-ignore-node-modules-regex — L2084](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-2084-0) (line 2084, col 0, score 0.97)
- [Obsidian Task Generation — L1699](obsidian-task-generation.md#^ref-9b694a91-1699-0) (line 1699, col 0, score 0.97)
- [ParticleSimulationWithCanvasAndFFmpeg — L2181](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-2181-0) (line 2181, col 0, score 0.97)
- [Per-Domain Policy System for JS Crawler — L5392](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-5392-0) (line 5392, col 0, score 0.97)
- [Performance-Optimized-Polyglot-Bridge — L2489](performance-optimized-polyglot-bridge.md#^ref-f5579967-2489-0) (line 2489, col 0, score 0.97)
- [windows-tiling-with-autohotkey — L1984](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-1984-0) (line 1984, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L4574](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-4574-0) (line 4574, col 0, score 0.98)
- [Promethean Documentation Update — L1336](promethean-documentation-update.md#^ref-c0392040-1336-0) (line 1336, col 0, score 0.98)
- [Promethean_Eidolon_Synchronicity_Model — L3354](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-3354-0) (line 3354, col 0, score 0.98)
- [Promethean Infrastructure Setup — L7037](promethean-infrastructure-setup.md#^ref-6deed6ac-7037-0) (line 7037, col 0, score 0.98)
- [Promethean Workflow Optimization — L2065](promethean-workflow-optimization.md#^ref-d614d983-2065-0) (line 2065, col 0, score 0.98)
- [Prometheus Observability Stack — L5796](prometheus-observability-stack.md#^ref-e90b5a16-5796-0) (line 5796, col 0, score 0.98)
- [Prompt_Folder_Bootstrap — L5915](prompt-folder-bootstrap.md#^ref-bd4f0976-5915-0) (line 5915, col 0, score 0.98)
- [Provider-Agnostic Chat Panel Implementation — L4449](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-4449-0) (line 4449, col 0, score 0.98)
- [Pure TypeScript Search Microservice — L6444](pure-typescript-search-microservice.md#^ref-d17d3a96-6444-0) (line 6444, col 0, score 0.98)
- [Reawakening Duck — L3257](reawakening-duck.md#^ref-59b5670f-3257-0) (line 3257, col 0, score 0.98)
- [Redirecting Standard Error — L2140](redirecting-standard-error.md#^ref-b3555ede-2140-0) (line 2140, col 0, score 0.98)
- [Promethean-Copilot-Intent-Engine — L4839](promethean-copilot-intent-engine.md#^ref-ae24a280-4839-0) (line 4839, col 0, score 0.98)
- [Promethean Dev Workflow Update — L4284](promethean-dev-workflow-update.md#^ref-03a5578f-4284-0) (line 4284, col 0, score 0.98)
- [Promethean_Eidolon_Synchronicity_Model — L2557](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-2557-0) (line 2557, col 0, score 0.98)
- [Promethean Infrastructure Setup — L6147](promethean-infrastructure-setup.md#^ref-6deed6ac-6147-0) (line 6147, col 0, score 0.98)
- [Prometheus Observability Stack — L4873](prometheus-observability-stack.md#^ref-e90b5a16-4873-0) (line 4873, col 0, score 0.98)
- [Prompt_Folder_Bootstrap — L4340](prompt-folder-bootstrap.md#^ref-bd4f0976-4340-0) (line 4340, col 0, score 0.98)
- [Protocol_0_The_Contradiction_Engine — L2059](protocol-0-the-contradiction-engine.md#^ref-9a93a756-2059-0) (line 2059, col 0, score 0.98)
- [Provider-Agnostic Chat Panel Implementation — L4773](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-4773-0) (line 4773, col 0, score 0.98)
- [Model Upgrade Calm-Down Guide — L3978](model-upgrade-calm-down-guide.md#^ref-db74343f-3978-0) (line 3978, col 0, score 0.93)
- [NPU Voice Code and Sensory Integration — L2157](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-2157-0) (line 2157, col 0, score 0.93)
- [Obsidian ChatGPT Plugin Integration Guide — L2819](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-2819-0) (line 2819, col 0, score 0.93)
- [Obsidian ChatGPT Plugin Integration — L2890](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-2890-0) (line 2890, col 0, score 0.93)
- [obsidian-ignore-node-modules-regex — L3375](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-3375-0) (line 3375, col 0, score 0.93)
- [Obsidian Task Generation — L1906](obsidian-task-generation.md#^ref-9b694a91-1906-0) (line 1906, col 0, score 0.93)
- [Performance-Optimized-Polyglot-Bridge — L5935](performance-optimized-polyglot-bridge.md#^ref-f5579967-5935-0) (line 5935, col 0, score 0.93)
- [Pipeline Enhancements — L1028](pipeline-enhancements.md#^ref-e2135d9f-1028-0) (line 1028, col 0, score 0.93)
- [Post-Linguistic Transhuman Design Frameworks — L3991](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-3991-0) (line 3991, col 0, score 0.93)
- [graph-ds — L3364](graph-ds.md#^ref-6620e2f2-3364-0) (line 3364, col 0, score 0.98)
- [heartbeat-fragment-demo — L3295](heartbeat-fragment-demo.md#^ref-dd00677a-3295-0) (line 3295, col 0, score 0.98)
- [homeostasis-decay-formulas — L4932](homeostasis-decay-formulas.md#^ref-37b5d236-4932-0) (line 4932, col 0, score 0.98)
- [i3-bluetooth-setup — L4001](i3-bluetooth-setup.md#^ref-5e408692-4001-0) (line 4001, col 0, score 0.98)
- [Ice Box Reorganization — L3932](ice-box-reorganization.md#^ref-291c7d91-3932-0) (line 3932, col 0, score 0.98)
- [komorebi-group-window-hack — L4528](komorebi-group-window-hack.md#^ref-dd89372d-4528-0) (line 4528, col 0, score 0.98)
- [Layer1SurvivabilityEnvelope — L4604](layer1survivabilityenvelope.md#^ref-64a9f9f9-4604-0) (line 4604, col 0, score 0.98)
- [Mathematical Samplers — L1800](mathematical-samplers.md#^ref-86a691ec-1800-0) (line 1800, col 0, score 0.98)
- [Mathematics Sampler — L1830](mathematics-sampler.md#^ref-b5e0183e-1830-0) (line 1830, col 0, score 0.98)
- [Promethean State Format — L3673](promethean-state-format.md#^ref-23df6ddb-3673-0) (line 3673, col 0, score 0.96)
- [Prometheus Observability Stack — L5518](prometheus-observability-stack.md#^ref-e90b5a16-5518-0) (line 5518, col 0, score 0.96)
- [Prompt_Folder_Bootstrap — L4918](prompt-folder-bootstrap.md#^ref-bd4f0976-4918-0) (line 4918, col 0, score 0.96)
- [Protocol_0_The_Contradiction_Engine — L3148](protocol-0-the-contradiction-engine.md#^ref-9a93a756-3148-0) (line 3148, col 0, score 0.96)
- [The Jar of Echoes — L3205](the-jar-of-echoes.md#^ref-18138627-3205-0) (line 3205, col 0, score 0.96)
- [ts-to-lisp-transpiler — L4135](ts-to-lisp-transpiler.md#^ref-ba11486b-4135-0) (line 4135, col 0, score 0.96)
- [TypeScript Patch for Tool Calling Support — L4969](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-4969-0) (line 4969, col 0, score 0.96)
- [Promethean Pipelines — L4109](promethean-pipelines.md#^ref-8b8e6103-4109-0) (line 4109, col 0, score 0.87)
- [Model Selection for Lightweight Conversational Tasks — L2412](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-2412-0) (line 2412, col 0, score 0.94)
- [Model Upgrade Calm-Down Guide — L3914](model-upgrade-calm-down-guide.md#^ref-db74343f-3914-0) (line 3914, col 0, score 0.94)
- [Model Upgrade Calm-Down Guide — L3925](model-upgrade-calm-down-guide.md#^ref-db74343f-3925-0) (line 3925, col 0, score 0.97)
- [NPU Voice Code and Sensory Integration — L2104](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-2104-0) (line 2104, col 0, score 0.97)
- [Obsidian ChatGPT Plugin Integration Guide — L2766](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-2766-0) (line 2766, col 0, score 0.97)
- [Obsidian ChatGPT Plugin Integration — L2837](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-2837-0) (line 2837, col 0, score 0.97)
- [obsidian-ignore-node-modules-regex — L3331](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-3331-0) (line 3331, col 0, score 0.97)
- [Obsidian Task Generation — L1853](obsidian-task-generation.md#^ref-9b694a91-1853-0) (line 1853, col 0, score 0.97)
- [Obsidian Templating Plugins Integration Guide — L3387](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-3387-0) (line 3387, col 0, score 0.97)
- [OpenAPI Validation Report — L1814](openapi-validation-report.md#^ref-5c152b08-1814-0) (line 1814, col 0, score 0.97)
- [ParticleSimulationWithCanvasAndFFmpeg — L5058](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-5058-0) (line 5058, col 0, score 0.97)
- [windows-tiling-with-autohotkey — L3847](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-3847-0) (line 3847, col 0, score 0.99)
- [TypeScript Patch for Tool Calling Support — L6247](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-6247-0) (line 6247, col 0, score 0.97)
- [Pipeline Enhancements — L767](pipeline-enhancements.md#^ref-e2135d9f-767-0) (line 767, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L1760](promethean-copilot-intent-engine.md#^ref-ae24a280-1760-0) (line 1760, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L3003](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-3003-0) (line 3003, col 0, score 0.99)
- [Duck's Attractor States — L17332](ducks-attractor-states.md#^ref-13951643-17332-0) (line 17332, col 0, score 0.99)
- [eidolon-field-math-foundations — L16630](eidolon-field-math-foundations.md#^ref-008f2ac0-16630-0) (line 16630, col 0, score 0.99)
- [field-dynamics-math-blocks — L3110](field-dynamics-math-blocks.md#^ref-7cfc230d-3110-0) (line 3110, col 0, score 0.99)
- [eidolon-field-math-foundations — L16651](eidolon-field-math-foundations.md#^ref-008f2ac0-16651-0) (line 16651, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L1759](promethean-copilot-intent-engine.md#^ref-ae24a280-1759-0) (line 1759, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L3002](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-3002-0) (line 3002, col 0, score 0.99)
- [Promethean Pipelines — L2749](promethean-pipelines.md#^ref-8b8e6103-2749-0) (line 2749, col 0, score 0.95)
- [Reawakening Duck — L1920](reawakening-duck.md#^ref-59b5670f-1920-0) (line 1920, col 0, score 0.95)
- [windows-tiling-with-autohotkey — L12319](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-12319-0) (line 12319, col 0, score 0.95)
- [Creative Moments — L8488](creative-moments.md#^ref-10d98225-8488-0) (line 8488, col 0, score 0.95)
- [Eidolon Field Abstract Model — L2843](eidolon-field-abstract-model.md#^ref-5e8b2388-2843-0) (line 2843, col 0, score 0.95)
- [Prompt_Folder_Bootstrap — L2400](prompt-folder-bootstrap.md#^ref-bd4f0976-2400-0) (line 2400, col 0, score 0.95)
- [Pipeline Enhancements — L765](pipeline-enhancements.md#^ref-e2135d9f-765-0) (line 765, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L3001](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-3001-0) (line 3001, col 0, score 0.99)
- [ripple-propagation-demo — L2056](ripple-propagation-demo.md#^ref-8430617b-2056-0) (line 2056, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L15283](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-15283-0) (line 15283, col 0, score 0.98)
- [Promethean Dev Workflow Update — L17988](promethean-dev-workflow-update.md#^ref-03a5578f-17988-0) (line 17988, col 0, score 0.98)
- [Performance-Optimized-Polyglot-Bridge — L2446](performance-optimized-polyglot-bridge.md#^ref-f5579967-2446-0) (line 2446, col 0, score 0.98)
- [polyglot-repl-interface-layer — L1786](polyglot-repl-interface-layer.md#^ref-9c79206d-1786-0) (line 1786, col 0, score 0.98)
- [Pipeline Enhancements — L766](pipeline-enhancements.md#^ref-e2135d9f-766-0) (line 766, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L1758](promethean-copilot-intent-engine.md#^ref-ae24a280-1758-0) (line 1758, col 0, score 0.99)
- [komorebi-group-window-hack — L2240](komorebi-group-window-hack.md#^ref-dd89372d-2240-0) (line 2240, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L1789](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-1789-0) (line 1789, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L2639](dynamic-context-model-for-web-components.md#^ref-f7702bf8-2639-0) (line 2639, col 0, score 0.98)
- [Creative Moments — L5722](creative-moments.md#^ref-10d98225-5722-0) (line 5722, col 0, score 1)
- [Duck's Attractor States — L7097](ducks-attractor-states.md#^ref-13951643-7097-0) (line 7097, col 0, score 1)
- [eidolon-field-math-foundations — L7899](eidolon-field-math-foundations.md#^ref-008f2ac0-7899-0) (line 7899, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L4761](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-4761-0) (line 4761, col 0, score 1)
- [Promethean Chat Activity Report — L5689](promethean-chat-activity-report.md#^ref-18344cf9-5689-0) (line 5689, col 0, score 1)
- [Promethean Dev Workflow Update — L7780](promethean-dev-workflow-update.md#^ref-03a5578f-7780-0) (line 7780, col 0, score 1)
- [Promethean Documentation Update — L5461](promethean-documentation-update.txt#^ref-0b872af2-5461-0) (line 5461, col 0, score 1)
- [Duck's Attractor States — L7098](ducks-attractor-states.md#^ref-13951643-7098-0) (line 7098, col 0, score 0.99)
- [eidolon-field-math-foundations — L7900](eidolon-field-math-foundations.md#^ref-008f2ac0-7900-0) (line 7900, col 0, score 0.99)
- [Functional Refactor of TypeScript Document Processing — L4762](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-4762-0) (line 4762, col 0, score 0.99)
- [Promethean Chat Activity Report — L5690](promethean-chat-activity-report.md#^ref-18344cf9-5690-0) (line 5690, col 0, score 0.99)
- [Promethean Dev Workflow Update — L7781](promethean-dev-workflow-update.md#^ref-03a5578f-7781-0) (line 7781, col 0, score 0.99)
- [Promethean Notes — L5645](promethean-notes.md#^ref-1c4046b5-5645-0) (line 5645, col 0, score 0.99)
- [The Jar of Echoes — L6959](the-jar-of-echoes.md#^ref-18138627-6959-0) (line 6959, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L6554](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-6554-0) (line 6554, col 0, score 0.99)
- [Self-Agency in AI Interaction — L1781](self-agency-in-ai-interaction.md#^ref-49a9a860-1781-0) (line 1781, col 0, score 0.98)
- [Docops Feature Updates — L887](docops-feature-updates-2.md#^ref-cdbd21ee-887-0) (line 887, col 0, score 1)
- [Promethean Dev Workflow Update — L7191](promethean-dev-workflow-update.md#^ref-03a5578f-7191-0) (line 7191, col 0, score 1)
- [Creative Moments — L3374](creative-moments.md#^ref-10d98225-3374-0) (line 3374, col 0, score 1)
- [eidolon-field-math-foundations — L10562](eidolon-field-math-foundations.md#^ref-008f2ac0-10562-0) (line 10562, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L3927](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-3927-0) (line 3927, col 0, score 1)
- [Promethean Dev Workflow Update — L7465](promethean-dev-workflow-update.md#^ref-03a5578f-7465-0) (line 7465, col 0, score 1)
- [windows-tiling-with-autohotkey — L6749](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-6749-0) (line 6749, col 0, score 1)
- [Creative Moments — L5724](creative-moments.md#^ref-10d98225-5724-0) (line 5724, col 0, score 0.99)
- [Duck's Attractor States — L7099](ducks-attractor-states.md#^ref-13951643-7099-0) (line 7099, col 0, score 0.99)
- [Functional Refactor of TypeScript Document Processing — L4764](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-4764-0) (line 4764, col 0, score 0.99)
- [Promethean Chat Activity Report — L5692](promethean-chat-activity-report.md#^ref-18344cf9-5692-0) (line 5692, col 0, score 0.99)
- [Promethean Dev Workflow Update — L7783](promethean-dev-workflow-update.md#^ref-03a5578f-7783-0) (line 7783, col 0, score 0.99)
- [Promethean Documentation Update — L5464](promethean-documentation-update.txt#^ref-0b872af2-5464-0) (line 5464, col 0, score 0.99)
- [Promethean Notes — L5647](promethean-notes.md#^ref-1c4046b5-5647-0) (line 5647, col 0, score 0.99)
- [The Jar of Echoes — L6961](the-jar-of-echoes.md#^ref-18138627-6961-0) (line 6961, col 0, score 0.99)
- [Shared — L1226](chunks/shared.md#^ref-623a55f7-1226-0) (line 1226, col 0, score 1)
- [Duck's Attractor States — L11391](ducks-attractor-states.md#^ref-13951643-11391-0) (line 11391, col 0, score 1)
- [eidolon-field-math-foundations — L7609](eidolon-field-math-foundations.md#^ref-008f2ac0-7609-0) (line 7609, col 0, score 1)
- [Promethean Dev Workflow Update — L7992](promethean-dev-workflow-update.md#^ref-03a5578f-7992-0) (line 7992, col 0, score 1)
- [The Jar of Echoes — L6097](the-jar-of-echoes.md#^ref-18138627-6097-0) (line 6097, col 0, score 1)
- [Unique Info Dump Index — L1743](unique-info-dump-index.md#^ref-30ec3ba6-1743-0) (line 1743, col 0, score 1)
- [windows-tiling-with-autohotkey — L7473](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-7473-0) (line 7473, col 0, score 1)
- [Dynamic Context Model for Web Components — L6036](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6036-0) (line 6036, col 0, score 1)
- [plan-update-confirmation — L6573](plan-update-confirmation.md#^ref-b22d79c6-6573-0) (line 6573, col 0, score 1)
- [Shared — L1230](chunks/shared.md#^ref-623a55f7-1230-0) (line 1230, col 0, score 1)
- [Duck's Attractor States — L11384](ducks-attractor-states.md#^ref-13951643-11384-0) (line 11384, col 0, score 1)
- [Promethean Dev Workflow Update — L7985](promethean-dev-workflow-update.md#^ref-03a5578f-7985-0) (line 7985, col 0, score 1)
- [The Jar of Echoes — L6090](the-jar-of-echoes.md#^ref-18138627-6090-0) (line 6090, col 0, score 1)
- [plan-update-confirmation — L6574](plan-update-confirmation.md#^ref-b22d79c6-6574-0) (line 6574, col 0, score 1)
- [Shared — L1231](chunks/shared.md#^ref-623a55f7-1231-0) (line 1231, col 0, score 1)
- [eidolon-field-math-foundations — L8989](eidolon-field-math-foundations.md#^ref-008f2ac0-8989-0) (line 8989, col 0, score 1)
- [Promethean Dev Workflow Update — L11622](promethean-dev-workflow-update.md#^ref-03a5578f-11622-0) (line 11622, col 0, score 1)
- [The Jar of Echoes — L10848](the-jar-of-echoes.md#^ref-18138627-10848-0) (line 10848, col 0, score 1)
- [windows-tiling-with-autohotkey — L6719](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-6719-0) (line 6719, col 0, score 1)
- [plan-update-confirmation — L6575](plan-update-confirmation.md#^ref-b22d79c6-6575-0) (line 6575, col 0, score 1)
- [Shared — L1232](chunks/shared.md#^ref-623a55f7-1232-0) (line 1232, col 0, score 1)
- [Duck's Attractor States — L11385](ducks-attractor-states.md#^ref-13951643-11385-0) (line 11385, col 0, score 0.99)
- [Promethean Dev Workflow Update — L7987](promethean-dev-workflow-update.md#^ref-03a5578f-7987-0) (line 7987, col 0, score 0.99)
- [The Jar of Echoes — L6092](the-jar-of-echoes.md#^ref-18138627-6092-0) (line 6092, col 0, score 0.99)
- [plan-update-confirmation — L6576](plan-update-confirmation.md#^ref-b22d79c6-6576-0) (line 6576, col 0, score 1)
- [Duck's Attractor States — L11386](ducks-attractor-states.md#^ref-13951643-11386-0) (line 11386, col 0, score 0.99)
- [eidolon-field-math-foundations — L7604](eidolon-field-math-foundations.md#^ref-008f2ac0-7604-0) (line 7604, col 0, score 0.99)
- [The Jar of Echoes — L6093](the-jar-of-echoes.md#^ref-18138627-6093-0) (line 6093, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L7469](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-7469-0) (line 7469, col 0, score 0.99)
- [plan-update-confirmation — L6577](plan-update-confirmation.md#^ref-b22d79c6-6577-0) (line 6577, col 0, score 1)
- [Duck's Attractor States — L11387](ducks-attractor-states.md#^ref-13951643-11387-0) (line 11387, col 0, score 0.99)
- [eidolon-field-math-foundations — L7605](eidolon-field-math-foundations.md#^ref-008f2ac0-7605-0) (line 7605, col 0, score 0.99)
- [Promethean Dev Workflow Update — L7988](promethean-dev-workflow-update.md#^ref-03a5578f-7988-0) (line 7988, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L7470](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-7470-0) (line 7470, col 0, score 0.99)
- [plan-update-confirmation — L6578](plan-update-confirmation.md#^ref-b22d79c6-6578-0) (line 6578, col 0, score 1)
- [Duck's Attractor States — L11388](ducks-attractor-states.md#^ref-13951643-11388-0) (line 11388, col 0, score 0.99)
- [eidolon-field-math-foundations — L7606](eidolon-field-math-foundations.md#^ref-008f2ac0-7606-0) (line 7606, col 0, score 0.99)
- [Promethean Dev Workflow Update — L7989](promethean-dev-workflow-update.md#^ref-03a5578f-7989-0) (line 7989, col 0, score 0.99)
- [The Jar of Echoes — L6094](the-jar-of-echoes.md#^ref-18138627-6094-0) (line 6094, col 0, score 0.99)
- [Duck's Attractor States — L7007](ducks-attractor-states.md#^ref-13951643-7007-0) (line 7007, col 0, score 0.99)
- [eidolon-field-math-foundations — L9238](eidolon-field-math-foundations.md#^ref-008f2ac0-9238-0) (line 9238, col 0, score 0.99)
- [Promethean Dev Workflow Update — L8036](promethean-dev-workflow-update.md#^ref-03a5578f-8036-0) (line 8036, col 0, score 0.99)
- [Pipeline Enhancements — L774](pipeline-enhancements.md#^ref-e2135d9f-774-0) (line 774, col 0, score 0.99)
- [Promethean Documentation Pipeline Overview — L3010](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-3010-0) (line 3010, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L3095](chroma-toolkit-consolidation-plan.md#^ref-5020e892-3095-0) (line 3095, col 0, score 0.98)
- [Model Upgrade Calm-Down Guide — L3251](model-upgrade-calm-down-guide.md#^ref-db74343f-3251-0) (line 3251, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L1723](promethean-copilot-intent-engine.md#^ref-ae24a280-1723-0) (line 1723, col 0, score 0.99)
- [Promethean Pipelines — L3701](promethean-pipelines.md#^ref-8b8e6103-3701-0) (line 3701, col 0, score 0.99)
- [Eidolon Field Abstract Model — L2498](eidolon-field-abstract-model.md#^ref-5e8b2388-2498-0) (line 2498, col 0, score 0.98)
- [field-node-diagram-set — L2101](field-node-diagram-set.md#^ref-22b989d5-2101-0) (line 2101, col 0, score 0.98)
- [Fnord Tracer Protocol — L2339](fnord-tracer-protocol.md#^ref-fc21f824-2339-0) (line 2339, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L2541](dynamic-context-model-for-web-components.md#^ref-f7702bf8-2541-0) (line 2541, col 0, score 0.98)
- [Factorio AI with External Agents — L2175](factorio-ai-with-external-agents.md#^ref-a4d90289-2175-0) (line 2175, col 0, score 0.98)
- [graph-ds — L2554](graph-ds.md#^ref-6620e2f2-2554-0) (line 2554, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L3003](migrate-to-provider-tenant-architecture.md#^ref-54382370-3003-0) (line 3003, col 0, score 0.98)
- [obsidian-ignore-node-modules-regex — L1637](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-1637-0) (line 1637, col 0, score 0.98)
- [Obsidian Templating Plugins Integration Guide — L2577](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-2577-0) (line 2577, col 0, score 0.98)
- [Post-Linguistic Transhuman Design Frameworks — L2286](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-2286-0) (line 2286, col 0, score 0.98)
- [Model Upgrade Calm-Down Guide — L3345](model-upgrade-calm-down-guide.md#^ref-db74343f-3345-0) (line 3345, col 0, score 0.97)
- [Model Upgrade Calm-Down Guide — L3252](model-upgrade-calm-down-guide.md#^ref-db74343f-3252-0) (line 3252, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L1726](promethean-copilot-intent-engine.md#^ref-ae24a280-1726-0) (line 1726, col 0, score 0.99)
- [Promethean Pipelines — L3702](promethean-pipelines.md#^ref-8b8e6103-3702-0) (line 3702, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L2147](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2147-0) (line 2147, col 0, score 0.98)
- [Functional Refactor of TypeScript Document Processing — L1652](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-1652-0) (line 1652, col 0, score 0.98)
- [Model Upgrade Calm-Down Guide — L3227](model-upgrade-calm-down-guide.md#^ref-db74343f-3227-0) (line 3227, col 0, score 0.98)
- [polyglot-repl-interface-layer — L1479](polyglot-repl-interface-layer.md#^ref-9c79206d-1479-0) (line 1479, col 0, score 0.98)
- [Model Upgrade Calm-Down Guide — L3246](model-upgrade-calm-down-guide.md#^ref-db74343f-3246-0) (line 3246, col 0, score 0.99)
- [Promethean Pipelines — L3696](promethean-pipelines.md#^ref-8b8e6103-3696-0) (line 3696, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L5401](migrate-to-provider-tenant-architecture.md#^ref-54382370-5401-0) (line 5401, col 0, score 0.98)
- [plan-update-confirmation — L3678](plan-update-confirmation.md#^ref-b22d79c6-3678-0) (line 3678, col 0, score 0.98)
- [Per-Domain Policy System for JS Crawler — L3101](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3101-0) (line 3101, col 0, score 0.98)
- [Prometheus Observability Stack — L2435](prometheus-observability-stack.md#^ref-e90b5a16-2435-0) (line 2435, col 0, score 0.98)
- [Model Upgrade Calm-Down Guide — L3247](model-upgrade-calm-down-guide.md#^ref-db74343f-3247-0) (line 3247, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L1727](promethean-copilot-intent-engine.md#^ref-ae24a280-1727-0) (line 1727, col 0, score 0.99)
- [Promethean Pipelines — L3697](promethean-pipelines.md#^ref-8b8e6103-3697-0) (line 3697, col 0, score 0.99)
- [plan-update-confirmation — L4360](plan-update-confirmation.md#^ref-b22d79c6-4360-0) (line 4360, col 0, score 0.98)
- [Promethean Infrastructure Setup — L4070](promethean-infrastructure-setup.md#^ref-6deed6ac-4070-0) (line 4070, col 0, score 0.98)
- [windows-tiling-with-autohotkey — L2889](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2889-0) (line 2889, col 0, score 0.98)
- [Fnord Tracer Protocol — L4510](fnord-tracer-protocol.md#^ref-fc21f824-4510-0) (line 4510, col 0, score 0.97)
- [Promethean-Copilot-Intent-Engine — L1728](promethean-copilot-intent-engine.md#^ref-ae24a280-1728-0) (line 1728, col 0, score 0.99)
- [Promethean Pipelines — L3695](promethean-pipelines.md#^ref-8b8e6103-3695-0) (line 3695, col 0, score 0.99)
- [Unique Info Dump Index — L1634](unique-info-dump-index.md#^ref-30ec3ba6-1634-0) (line 1634, col 0, score 0.98)
- [eidolon-field-math-foundations — L15794](eidolon-field-math-foundations.md#^ref-008f2ac0-15794-0) (line 15794, col 0, score 0.98)
- [Stateful Partitions and Rebalancing — L2811](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-2811-0) (line 2811, col 0, score 0.98)
- [typed-struct-compiler — L3163](typed-struct-compiler.md#^ref-78eeedf7-3163-0) (line 3163, col 0, score 0.98)
- [Model Upgrade Calm-Down Guide — L3245](model-upgrade-calm-down-guide.md#^ref-db74343f-3245-0) (line 3245, col 0, score 0.99)
- [Promethean-Copilot-Intent-Engine — L1729](promethean-copilot-intent-engine.md#^ref-ae24a280-1729-0) (line 1729, col 0, score 0.99)
- [plan-update-confirmation — L3869](plan-update-confirmation.md#^ref-b22d79c6-3869-0) (line 3869, col 0, score 0.99)
- [schema-evolution-workflow — L3579](schema-evolution-workflow.md#^ref-d8059b6a-3579-0) (line 3579, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L2776](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2776-0) (line 2776, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L5297](dynamic-context-model-for-web-components.md#^ref-f7702bf8-5297-0) (line 5297, col 0, score 0.99)
- [Duck's Attractor States — L1911](ducks-attractor-states.md#^ref-13951643-1911-0) (line 1911, col 0, score 0.99)
- [Duck's Self-Referential Perceptual Loop — L1812](ducks-self-referential-perceptual-loop.md#^ref-71726f04-1812-0) (line 1812, col 0, score 0.99)
- [Reawakening Duck — L2843](reawakening-duck.md#^ref-59b5670f-2843-0) (line 2843, col 0, score 0.99)
- [Stateful Partitions and Rebalancing — L2707](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-2707-0) (line 2707, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L5389](chroma-toolkit-consolidation-plan.md#^ref-5020e892-5389-0) (line 5389, col 0, score 0.99)
- [Diagrams — L4112](chunks/diagrams.md#^ref-45cd25b5-4112-0) (line 4112, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L7229](dynamic-context-model-for-web-components.md#^ref-f7702bf8-7229-0) (line 7229, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L6484](migrate-to-provider-tenant-architecture.md#^ref-54382370-6484-0) (line 6484, col 0, score 0.99)
- [Promethean Dev Workflow Update — L25550](promethean-dev-workflow-update.md#^ref-03a5578f-25550-0) (line 25550, col 0, score 0.99)
- [Diagrams — L2695](chunks/diagrams.md#^ref-45cd25b5-2695-0) (line 2695, col 0, score 0.99)
- [Debugging Broker Connections and Agent Behavior — L2853](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2853-0) (line 2853, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L6921](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6921-0) (line 6921, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L7455](migrate-to-provider-tenant-architecture.md#^ref-54382370-7455-0) (line 7455, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L3783](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3783-0) (line 3783, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L5704](performance-optimized-polyglot-bridge.md#^ref-f5579967-5704-0) (line 5704, col 0, score 0.99)
- [Post-Linguistic Transhuman Design Frameworks — L2795](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-2795-0) (line 2795, col 0, score 0.99)
- [Diagrams — L2696](chunks/diagrams.md#^ref-45cd25b5-2696-0) (line 2696, col 0, score 0.99)
- [Debugging Broker Connections and Agent Behavior — L2854](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2854-0) (line 2854, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L6922](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6922-0) (line 6922, col 0, score 0.99)
- [eidolon-field-math-foundations — L3923](eidolon-field-math-foundations.md#^ref-008f2ac0-3923-0) (line 3923, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L3784](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3784-0) (line 3784, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L5705](performance-optimized-polyglot-bridge.md#^ref-f5579967-5705-0) (line 5705, col 0, score 0.99)
- [Post-Linguistic Transhuman Design Frameworks — L2796](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-2796-0) (line 2796, col 0, score 0.99)
- [Diagrams — L2697](chunks/diagrams.md#^ref-45cd25b5-2697-0) (line 2697, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L2855](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2855-0) (line 2855, col 0, score 1)
- [Dynamic Context Model for Web Components — L6923](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6923-0) (line 6923, col 0, score 1)
- [eidolon-field-math-foundations — L3924](eidolon-field-math-foundations.md#^ref-008f2ac0-3924-0) (line 3924, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L7456](migrate-to-provider-tenant-architecture.md#^ref-54382370-7456-0) (line 7456, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L5706](performance-optimized-polyglot-bridge.md#^ref-f5579967-5706-0) (line 5706, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L2797](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-2797-0) (line 2797, col 0, score 1)
- [Diagrams — L2698](chunks/diagrams.md#^ref-45cd25b5-2698-0) (line 2698, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L2856](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2856-0) (line 2856, col 0, score 1)
- [Dynamic Context Model for Web Components — L6924](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6924-0) (line 6924, col 0, score 1)
- [eidolon-field-math-foundations — L3925](eidolon-field-math-foundations.md#^ref-008f2ac0-3925-0) (line 3925, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L7457](migrate-to-provider-tenant-architecture.md#^ref-54382370-7457-0) (line 7457, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L3785](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3785-0) (line 3785, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L2798](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-2798-0) (line 2798, col 0, score 1)
- [Diagrams — L2699](chunks/diagrams.md#^ref-45cd25b5-2699-0) (line 2699, col 0, score 0.99)
- [Debugging Broker Connections and Agent Behavior — L2857](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2857-0) (line 2857, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L6925](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6925-0) (line 6925, col 0, score 0.99)
- [eidolon-field-math-foundations — L3926](eidolon-field-math-foundations.md#^ref-008f2ac0-3926-0) (line 3926, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L7458](migrate-to-provider-tenant-architecture.md#^ref-54382370-7458-0) (line 7458, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L3786](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3786-0) (line 3786, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L5707](performance-optimized-polyglot-bridge.md#^ref-f5579967-5707-0) (line 5707, col 0, score 0.99)
- [Diagrams — L2700](chunks/diagrams.md#^ref-45cd25b5-2700-0) (line 2700, col 0, score 0.99)
- [Debugging Broker Connections and Agent Behavior — L2858](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2858-0) (line 2858, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L6926](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6926-0) (line 6926, col 0, score 0.99)
- [eidolon-field-math-foundations — L3927](eidolon-field-math-foundations.md#^ref-008f2ac0-3927-0) (line 3927, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L7459](migrate-to-provider-tenant-architecture.md#^ref-54382370-7459-0) (line 7459, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L3787](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3787-0) (line 3787, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L5708](performance-optimized-polyglot-bridge.md#^ref-f5579967-5708-0) (line 5708, col 0, score 0.99)
- [Diagrams — L2701](chunks/diagrams.md#^ref-45cd25b5-2701-0) (line 2701, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L2859](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2859-0) (line 2859, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L7460](migrate-to-provider-tenant-architecture.md#^ref-54382370-7460-0) (line 7460, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L2800](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-2800-0) (line 2800, col 0, score 1)
- [Unique Info Dump Index — L8198](unique-info-dump-index.md#^ref-30ec3ba6-8198-0) (line 8198, col 0, score 1)
- [zero-copy-snapshots-and-workers — L4734](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-4734-0) (line 4734, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L2333](migrate-to-provider-tenant-architecture.md#^ref-54382370-2333-0) (line 2333, col 0, score 0.99)
- [Window Management — L1514](chunks/window-management.md#^ref-9e8ae388-1514-0) (line 1514, col 0, score 0.99)
- [Operations — L847](chunks/operations.md#^ref-f1add613-847-0) (line 847, col 0, score 0.99)
- [Services — L1214](chunks/services.md#^ref-75ea4a6a-1214-0) (line 1214, col 0, score 0.99)
- [Eidolon Field Abstract Model — L2596](eidolon-field-abstract-model.md#^ref-5e8b2388-2596-0) (line 2596, col 0, score 0.99)
- [Prompt_Folder_Bootstrap — L3059](prompt-folder-bootstrap.md#^ref-bd4f0976-3059-0) (line 3059, col 0, score 0.99)
- [eidolon-field-math-foundations — L2987](eidolon-field-math-foundations.md#^ref-008f2ac0-2987-0) (line 2987, col 0, score 0.99)
- [Duck's Attractor States — L15277](ducks-attractor-states.md#^ref-13951643-15277-0) (line 15277, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L4654](chroma-toolkit-consolidation-plan.md#^ref-5020e892-4654-0) (line 4654, col 0, score 0.99)
- [eidolon-field-math-foundations — L27608](eidolon-field-math-foundations.md#^ref-008f2ac0-27608-0) (line 27608, col 0, score 1)
- [Creative Moments — L10877](creative-moments.md#^ref-10d98225-10877-0) (line 10877, col 0, score 1)
- [Promethean Chat Activity Report — L11592](promethean-chat-activity-report.md#^ref-18344cf9-11592-0) (line 11592, col 0, score 1)
- [Promethean Dev Workflow Update — L24754](promethean-dev-workflow-update.md#^ref-03a5578f-24754-0) (line 24754, col 0, score 1)
- [Promethean Documentation Update — L9953](promethean-documentation-update.txt#^ref-0b872af2-9953-0) (line 9953, col 0, score 1)
- [Promethean Notes — L11012](promethean-notes.md#^ref-1c4046b5-11012-0) (line 11012, col 0, score 1)
- [The Jar of Echoes — L21906](the-jar-of-echoes.md#^ref-18138627-21906-0) (line 21906, col 0, score 1)
- [eidolon-field-math-foundations — L21613](eidolon-field-math-foundations.md#^ref-008f2ac0-21613-0) (line 21613, col 0, score 1)
- [Promethean Dev Workflow Update — L17491](promethean-dev-workflow-update.md#^ref-03a5578f-17491-0) (line 17491, col 0, score 1)
- [eidolon-field-math-foundations — L16175](eidolon-field-math-foundations.md#^ref-008f2ac0-16175-0) (line 16175, col 0, score 1)
- [windows-tiling-with-autohotkey — L22986](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-22986-0) (line 22986, col 0, score 1)
- [The Jar of Echoes — L11493](the-jar-of-echoes.md#^ref-18138627-11493-0) (line 11493, col 0, score 1)
- [eidolon-field-math-foundations — L26037](eidolon-field-math-foundations.md#^ref-008f2ac0-26037-0) (line 26037, col 0, score 1)
- [windows-tiling-with-autohotkey — L15692](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-15692-0) (line 15692, col 0, score 1)
- [Promethean Dev Workflow Update — L17489](promethean-dev-workflow-update.md#^ref-03a5578f-17489-0) (line 17489, col 0, score 1)
- [Promethean Infrastructure Setup — L7975](promethean-infrastructure-setup.md#^ref-6deed6ac-7975-0) (line 7975, col 0, score 1)
- [Duck's Attractor States — L15270](ducks-attractor-states.md#^ref-13951643-15270-0) (line 15270, col 0, score 1)
- [Promethean Dev Workflow Update — L13126](promethean-dev-workflow-update.md#^ref-03a5578f-13126-0) (line 13126, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L23097](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-23097-0) (line 23097, col 0, score 0.99)
- [Duck's Attractor States — L17462](ducks-attractor-states.md#^ref-13951643-17462-0) (line 17462, col 0, score 0.99)
- [Promethean Dev Workflow Update — L20531](promethean-dev-workflow-update.md#^ref-03a5578f-20531-0) (line 20531, col 0, score 1)
- [eidolon-field-math-foundations — L11235](eidolon-field-math-foundations.md#^ref-008f2ac0-11235-0) (line 11235, col 0, score 1)
- [Promethean Chat Activity Report — L8311](promethean-chat-activity-report.md#^ref-18344cf9-8311-0) (line 8311, col 0, score 1)
- [Promethean Dev Workflow Update — L6852](promethean-dev-workflow-update.md#^ref-03a5578f-6852-0) (line 6852, col 0, score 1)
- [windows-tiling-with-autohotkey — L7381](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-7381-0) (line 7381, col 0, score 1)
- [Factorio AI with External Agents — L1639](factorio-ai-with-external-agents.md#^ref-a4d90289-1639-0) (line 1639, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L7905](migrate-to-provider-tenant-architecture.md#^ref-54382370-7905-0) (line 7905, col 0, score 1)
- [Unique Info Dump Index — L8121](unique-info-dump-index.md#^ref-30ec3ba6-8121-0) (line 8121, col 0, score 1)
- [Docops Feature Updates — L994](docops-feature-updates-2.md#^ref-cdbd21ee-994-0) (line 994, col 0, score 0.98)
- [Docops Feature Updates — L1254](docops-feature-updates.md#^ref-2792d448-1254-0) (line 1254, col 0, score 0.98)
- [Dynamic Context Model for Web Components — L5281](dynamic-context-model-for-web-components.md#^ref-f7702bf8-5281-0) (line 5281, col 0, score 0.98)
- [Migrate to Provider-Tenant Architecture — L6004](migrate-to-provider-tenant-architecture.md#^ref-54382370-6004-0) (line 6004, col 0, score 0.98)
- [Duck's Attractor States — L15107](ducks-attractor-states.md#^ref-13951643-15107-0) (line 15107, col 0, score 1)
- [Promethean Infrastructure Setup — L7973](promethean-infrastructure-setup.md#^ref-6deed6ac-7973-0) (line 7973, col 0, score 1)
- [Duck's Attractor States — L17995](ducks-attractor-states.md#^ref-13951643-17995-0) (line 17995, col 0, score 0.99)
- [Duck's Attractor States — L2127](ducks-attractor-states.md#^ref-13951643-2127-0) (line 2127, col 0, score 1)
- [komorebi-group-window-hack — L1623](komorebi-group-window-hack.md#^ref-dd89372d-1623-0) (line 1623, col 0, score 0.99)
- [field-dynamics-math-blocks — L1693](field-dynamics-math-blocks.md#^ref-7cfc230d-1693-0) (line 1693, col 0, score 0.99)
- [homeostasis-decay-formulas — L3345](homeostasis-decay-formulas.md#^ref-37b5d236-3345-0) (line 3345, col 0, score 0.99)
- [Layer1SurvivabilityEnvelope — L2342](layer1survivabilityenvelope.md#^ref-64a9f9f9-2342-0) (line 2342, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L1956](migrate-to-provider-tenant-architecture.md#^ref-54382370-1956-0) (line 1956, col 0, score 0.98)
- [typed-struct-compiler — L2056](typed-struct-compiler.md#^ref-78eeedf7-2056-0) (line 2056, col 0, score 1)
- [Promethean Infrastructure Setup — L7986](promethean-infrastructure-setup.md#^ref-6deed6ac-7986-0) (line 7986, col 0, score 1)
- [Promethean Infrastructure Setup — L7993](promethean-infrastructure-setup.md#^ref-6deed6ac-7993-0) (line 7993, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L5585](chroma-toolkit-consolidation-plan.md#^ref-5020e892-5585-0) (line 5585, col 0, score 1)
- [Diagrams — L2712](chunks/diagrams.md#^ref-45cd25b5-2712-0) (line 2712, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L2870](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2870-0) (line 2870, col 0, score 1)
- [Dynamic Context Model for Web Components — L6929](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6929-0) (line 6929, col 0, score 1)
- [eidolon-field-math-foundations — L3940](eidolon-field-math-foundations.md#^ref-008f2ac0-3940-0) (line 3940, col 0, score 1)
- [typed-struct-compiler — L2057](typed-struct-compiler.md#^ref-78eeedf7-2057-0) (line 2057, col 0, score 1)
- [Diagrams — L2713](chunks/diagrams.md#^ref-45cd25b5-2713-0) (line 2713, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L2871](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2871-0) (line 2871, col 0, score 1)
- [Dynamic Context Model for Web Components — L6930](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6930-0) (line 6930, col 0, score 1)
- [eidolon-field-math-foundations — L3941](eidolon-field-math-foundations.md#^ref-008f2ac0-3941-0) (line 3941, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L7471](migrate-to-provider-tenant-architecture.md#^ref-54382370-7471-0) (line 7471, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L3801](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3801-0) (line 3801, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L5720](performance-optimized-polyglot-bridge.md#^ref-f5579967-5720-0) (line 5720, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L5586](chroma-toolkit-consolidation-plan.md#^ref-5020e892-5586-0) (line 5586, col 0, score 0.99)
- [Debugging Broker Connections and Agent Behavior — L2872](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2872-0) (line 2872, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L6931](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6931-0) (line 6931, col 0, score 0.99)
- [eidolon-field-math-foundations — L3942](eidolon-field-math-foundations.md#^ref-008f2ac0-3942-0) (line 3942, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L7472](migrate-to-provider-tenant-architecture.md#^ref-54382370-7472-0) (line 7472, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L3802](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3802-0) (line 3802, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L5721](performance-optimized-polyglot-bridge.md#^ref-f5579967-5721-0) (line 5721, col 0, score 0.99)
- [Post-Linguistic Transhuman Design Frameworks — L2814](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-2814-0) (line 2814, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L5587](chroma-toolkit-consolidation-plan.md#^ref-5020e892-5587-0) (line 5587, col 0, score 1)
- [Diagrams — L2714](chunks/diagrams.md#^ref-45cd25b5-2714-0) (line 2714, col 0, score 1)
- [Dynamic Context Model for Web Components — L6932](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6932-0) (line 6932, col 0, score 1)
- [eidolon-field-math-foundations — L3943](eidolon-field-math-foundations.md#^ref-008f2ac0-3943-0) (line 3943, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L7473](migrate-to-provider-tenant-architecture.md#^ref-54382370-7473-0) (line 7473, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L3803](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3803-0) (line 3803, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L5722](performance-optimized-polyglot-bridge.md#^ref-f5579967-5722-0) (line 5722, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L2815](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-2815-0) (line 2815, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L5588](chroma-toolkit-consolidation-plan.md#^ref-5020e892-5588-0) (line 5588, col 0, score 0.99)
- [Diagrams — L2715](chunks/diagrams.md#^ref-45cd25b5-2715-0) (line 2715, col 0, score 0.99)
- [Debugging Broker Connections and Agent Behavior — L2873](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2873-0) (line 2873, col 0, score 0.99)
- [eidolon-field-math-foundations — L3944](eidolon-field-math-foundations.md#^ref-008f2ac0-3944-0) (line 3944, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L7474](migrate-to-provider-tenant-architecture.md#^ref-54382370-7474-0) (line 7474, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L3804](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3804-0) (line 3804, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L5723](performance-optimized-polyglot-bridge.md#^ref-f5579967-5723-0) (line 5723, col 0, score 0.99)
- [Post-Linguistic Transhuman Design Frameworks — L2816](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-2816-0) (line 2816, col 0, score 0.99)
- [Creative Moments — L12002](creative-moments.md#^ref-10d98225-12002-0) (line 12002, col 0, score 1)
- [Promethean Dev Workflow Update — L16750](promethean-dev-workflow-update.md#^ref-03a5578f-16750-0) (line 16750, col 0, score 1)
- [Promethean Documentation Update — L10323](promethean-documentation-update.txt#^ref-0b872af2-10323-0) (line 10323, col 0, score 1)
- [Promethean Notes — L11372](promethean-notes.md#^ref-1c4046b5-11372-0) (line 11372, col 0, score 1)
- [The Jar of Echoes — L22859](the-jar-of-echoes.md#^ref-18138627-22859-0) (line 22859, col 0, score 1)
- [windows-tiling-with-autohotkey — L19302](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-19302-0) (line 19302, col 0, score 1)
- [Tooling — L1213](chunks/tooling.md#^ref-6cb4943e-1213-0) (line 1213, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L4839](dynamic-context-model-for-web-components.md#^ref-f7702bf8-4839-0) (line 4839, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L5590](chroma-toolkit-consolidation-plan.md#^ref-5020e892-5590-0) (line 5590, col 0, score 0.99)
- [Diagrams — L2717](chunks/diagrams.md#^ref-45cd25b5-2717-0) (line 2717, col 0, score 0.99)
- [Debugging Broker Connections and Agent Behavior — L2875](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2875-0) (line 2875, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L6934](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6934-0) (line 6934, col 0, score 0.99)
- [eidolon-field-math-foundations — L3945](eidolon-field-math-foundations.md#^ref-008f2ac0-3945-0) (line 3945, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L3806](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3806-0) (line 3806, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L5725](performance-optimized-polyglot-bridge.md#^ref-f5579967-5725-0) (line 5725, col 0, score 0.99)
- [Post-Linguistic Transhuman Design Frameworks — L2818](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-2818-0) (line 2818, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L5591](chroma-toolkit-consolidation-plan.md#^ref-5020e892-5591-0) (line 5591, col 0, score 1)
- [Diagrams — L2718](chunks/diagrams.md#^ref-45cd25b5-2718-0) (line 2718, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L2876](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2876-0) (line 2876, col 0, score 1)
- [Dynamic Context Model for Web Components — L6935](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6935-0) (line 6935, col 0, score 1)
- [eidolon-field-math-foundations — L3946](eidolon-field-math-foundations.md#^ref-008f2ac0-3946-0) (line 3946, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L7476](migrate-to-provider-tenant-architecture.md#^ref-54382370-7476-0) (line 7476, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L5726](performance-optimized-polyglot-bridge.md#^ref-f5579967-5726-0) (line 5726, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L2819](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-2819-0) (line 2819, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L3563](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3563-0) (line 3563, col 0, score 0.99)
- [Unique Info Dump Index — L1913](unique-info-dump-index.md#^ref-30ec3ba6-1913-0) (line 1913, col 0, score 0.99)
- [Obsidian ChatGPT Plugin Integration — L4052](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-4052-0) (line 4052, col 0, score 0.99)
- [obsidian-ignore-node-modules-regex — L4646](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-4646-0) (line 4646, col 0, score 0.99)
- [Obsidian Task Generation — L1983](obsidian-task-generation.md#^ref-9b694a91-1983-0) (line 1983, col 0, score 0.99)
- [Obsidian Templating Plugins Integration Guide — L5462](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-5462-0) (line 5462, col 0, score 0.99)
- [OpenAPI Validation Report — L1944](openapi-validation-report.md#^ref-5c152b08-1944-0) (line 1944, col 0, score 0.99)
- [ParticleSimulationWithCanvasAndFFmpeg — L5859](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-5859-0) (line 5859, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L598](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-598-0) (line 598, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L6603](performance-optimized-polyglot-bridge.md#^ref-f5579967-6603-0) (line 6603, col 0, score 0.99)
- [Pipeline Enhancements — L1372](pipeline-enhancements.md#^ref-e2135d9f-1372-0) (line 1372, col 0, score 0.99)
- [polyglot-repl-interface-layer — L4493](polyglot-repl-interface-layer.md#^ref-9c79206d-4493-0) (line 4493, col 0, score 0.99)
- [Post-Linguistic Transhuman Design Frameworks — L4333](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-4333-0) (line 4333, col 0, score 0.99)
- [Promethean Data Sync Protocol — L1641](promethean-data-sync-protocol.md#^ref-9fab9e76-1641-0) (line 1641, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L5593](chroma-toolkit-consolidation-plan.md#^ref-5020e892-5593-0) (line 5593, col 0, score 1)
- [Diagrams — L2720](chunks/diagrams.md#^ref-45cd25b5-2720-0) (line 2720, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L2878](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2878-0) (line 2878, col 0, score 1)
- [Dynamic Context Model for Web Components — L6937](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6937-0) (line 6937, col 0, score 1)
- [eidolon-field-math-foundations — L3948](eidolon-field-math-foundations.md#^ref-008f2ac0-3948-0) (line 3948, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L7478](migrate-to-provider-tenant-architecture.md#^ref-54382370-7478-0) (line 7478, col 0, score 1)
- [Promethean Dev Workflow Update — L18763](promethean-dev-workflow-update.md#^ref-03a5578f-18763-0) (line 18763, col 0, score 1)
- [Diagrams — L2721](chunks/diagrams.md#^ref-45cd25b5-2721-0) (line 2721, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L2879](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2879-0) (line 2879, col 0, score 1)
- [Dynamic Context Model for Web Components — L6938](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6938-0) (line 6938, col 0, score 1)
- [eidolon-field-math-foundations — L3949](eidolon-field-math-foundations.md#^ref-008f2ac0-3949-0) (line 3949, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L7479](migrate-to-provider-tenant-architecture.md#^ref-54382370-7479-0) (line 7479, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L3809](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3809-0) (line 3809, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L5594](chroma-toolkit-consolidation-plan.md#^ref-5020e892-5594-0) (line 5594, col 0, score 0.99)
- [Debugging Broker Connections and Agent Behavior — L2880](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2880-0) (line 2880, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L6939](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6939-0) (line 6939, col 0, score 0.99)
- [eidolon-field-math-foundations — L3950](eidolon-field-math-foundations.md#^ref-008f2ac0-3950-0) (line 3950, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L7480](migrate-to-provider-tenant-architecture.md#^ref-54382370-7480-0) (line 7480, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L3810](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3810-0) (line 3810, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L5729](performance-optimized-polyglot-bridge.md#^ref-f5579967-5729-0) (line 5729, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L5595](chroma-toolkit-consolidation-plan.md#^ref-5020e892-5595-0) (line 5595, col 0, score 1)
- [Diagrams — L2722](chunks/diagrams.md#^ref-45cd25b5-2722-0) (line 2722, col 0, score 1)
- [Dynamic Context Model for Web Components — L6940](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6940-0) (line 6940, col 0, score 1)
- [eidolon-field-math-foundations — L3951](eidolon-field-math-foundations.md#^ref-008f2ac0-3951-0) (line 3951, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L7481](migrate-to-provider-tenant-architecture.md#^ref-54382370-7481-0) (line 7481, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L3811](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3811-0) (line 3811, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L5730](performance-optimized-polyglot-bridge.md#^ref-f5579967-5730-0) (line 5730, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L5596](chroma-toolkit-consolidation-plan.md#^ref-5020e892-5596-0) (line 5596, col 0, score 0.99)
- [Diagrams — L2723](chunks/diagrams.md#^ref-45cd25b5-2723-0) (line 2723, col 0, score 0.99)
- [Debugging Broker Connections and Agent Behavior — L2881](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2881-0) (line 2881, col 0, score 0.99)
- [eidolon-field-math-foundations — L3952](eidolon-field-math-foundations.md#^ref-008f2ac0-3952-0) (line 3952, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L7482](migrate-to-provider-tenant-architecture.md#^ref-54382370-7482-0) (line 7482, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L3812](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3812-0) (line 3812, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L5731](performance-optimized-polyglot-bridge.md#^ref-f5579967-5731-0) (line 5731, col 0, score 0.99)
- [Promethean Dev Workflow Update — L24168](promethean-dev-workflow-update.md#^ref-03a5578f-24168-0) (line 24168, col 0, score 0.99)
- [Duck's Attractor States — L19479](ducks-attractor-states.md#^ref-13951643-19479-0) (line 19479, col 0, score 0.99)
- [windows-tiling-with-autohotkey — L13789](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-13789-0) (line 13789, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L5597](chroma-toolkit-consolidation-plan.md#^ref-5020e892-5597-0) (line 5597, col 0, score 0.99)
- [Diagrams — L2724](chunks/diagrams.md#^ref-45cd25b5-2724-0) (line 2724, col 0, score 0.99)
- [Debugging Broker Connections and Agent Behavior — L2882](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2882-0) (line 2882, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L6941](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6941-0) (line 6941, col 0, score 0.99)
- [Migrate to Provider-Tenant Architecture — L7483](migrate-to-provider-tenant-architecture.md#^ref-54382370-7483-0) (line 7483, col 0, score 0.99)
- [Chroma Toolkit Consolidation Plan — L5598](chroma-toolkit-consolidation-plan.md#^ref-5020e892-5598-0) (line 5598, col 0, score 0.99)
- [Diagrams — L2725](chunks/diagrams.md#^ref-45cd25b5-2725-0) (line 2725, col 0, score 0.99)
- [Debugging Broker Connections and Agent Behavior — L2883](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-2883-0) (line 2883, col 0, score 0.99)
- [Dynamic Context Model for Web Components — L6942](dynamic-context-model-for-web-components.md#^ref-f7702bf8-6942-0) (line 6942, col 0, score 0.99)
- [eidolon-field-math-foundations — L3953](eidolon-field-math-foundations.md#^ref-008f2ac0-3953-0) (line 3953, col 0, score 0.99)
- [Per-Domain Policy System for JS Crawler — L3814](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3814-0) (line 3814, col 0, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L5733](performance-optimized-polyglot-bridge.md#^ref-f5579967-5733-0) (line 5733, col 0, score 0.99)
- [ts-to-lisp-transpiler — L3858](ts-to-lisp-transpiler.md#^ref-ba11486b-3858-0) (line 3858, col 0, score 0.97)
- [typed-struct-compiler — L4689](typed-struct-compiler.md#^ref-78eeedf7-4689-0) (line 4689, col 0, score 0.97)
- [TypeScript Patch for Tool Calling Support — L4080](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-4080-0) (line 4080, col 0, score 0.97)
- [Pipeline Enhancements — L177](pipeline-enhancements.md#^ref-e2135d9f-177-0) (line 177, col 0, score 0.93)
- [Post-Linguistic Transhuman Design Frameworks — L272](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-272-0) (line 272, col 0, score 0.93)
- [Unique Info Dump Index — L219](unique-info-dump-index.md#^ref-30ec3ba6-219-0) (line 219, col 0, score 0.93)
- [Synchronicity Waves and Web — L3577](synchronicity-waves-and-web.md#^ref-91295f3a-3577-0) (line 3577, col 0, score 0.93)
- [Promethean_Eidolon_Synchronicity_Model — L243](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-243-0) (line 243, col 0, score 0.93)
- [universal-intention-code-fabric — L388](universal-intention-code-fabric.md#^ref-c14edce7-388-0) (line 388, col 0, score 0.89)
- [Ice Box Reorganization — L3222](ice-box-reorganization.md#^ref-291c7d91-3222-0) (line 3222, col 0, score 0.95)
- [komorebi-group-window-hack — L4353](komorebi-group-window-hack.md#^ref-dd89372d-4353-0) (line 4353, col 0, score 0.95)
- [Layer1SurvivabilityEnvelope — L3749](layer1survivabilityenvelope.md#^ref-64a9f9f9-3749-0) (line 3749, col 0, score 0.95)
- [Mathematical Samplers — L1711](mathematical-samplers.md#^ref-86a691ec-1711-0) (line 1711, col 0, score 0.95)
- [Mathematics Sampler — L1741](mathematics-sampler.md#^ref-b5e0183e-1741-0) (line 1741, col 0, score 0.95)
- [Migrate to Provider-Tenant Architecture — L1828](migrate-to-provider-tenant-architecture.md#^ref-54382370-1828-0) (line 1828, col 0, score 0.95)
- [Mindful Prioritization — L1522](mindful-prioritization.md#^ref-40185d05-1522-0) (line 1522, col 0, score 0.95)
- [MindfulRobotIntegration — L1469](mindfulrobotintegration.md#^ref-5f65dfa5-1469-0) (line 1469, col 0, score 0.95)
- [Model Selection for Lightweight Conversational Tasks — L5492](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-5492-0) (line 5492, col 0, score 0.95)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
