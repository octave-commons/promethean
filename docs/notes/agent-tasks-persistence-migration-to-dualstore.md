---
$$
uuid: 93d2ba51-8689-49ee-94e2-296092e48058
$$
$$
created_at: 2025.08.24.10.12.32.md
$$
filename: 'Agent Tasks: Persistence Migration to DualStore'
$$
description: >-
$$
  Migrate all services from legacy persistence to a shared DualStore module,
  deprecating old implementations and updating documentation, tests, and
  codebase.
tags:
  - persistence
  - migration
  - dualstore
  - cephalon
  - smartgpt
  - discord
  - kanban
  - markdown
  - tests
  - docs
$$
related_to_title:
$$
  - TypeScript Patch for Tool Calling Support
  - Promethean-native config design
  - Migrate to Provider-Tenant Architecture
  - Per-Domain Policy System for JS Crawler
  - eidolon-field-math-foundations
  - Chroma Toolkit Consolidation Plan
  - promethean-system-diagrams
  - prom-lib-rate-limiters-and-replay-api
  - Promethean Event Bus MVP v0.1
  - ecs-scheduler-and-prefabs
  - field-node-diagram-outline
  - ecs-offload-workers
  - field-node-diagram-set
  - aionian-circuit-math
  - Board Walk – 2025-08-11
  - Cross-Language Runtime Polymorphism
  - Math Fundamentals
  - eidolon-node-lifecycle
  - Event Bus Projections Architecture
  - Promethean Infrastructure Setup
  - Dynamic Context Model for Web Components
  - Event Bus MVP
  - Pure-Node Crawl Stack with Playwright and Crawlee
  - Exception Layer Analysis
  - Fnord Tracer Protocol
  - Mongo Outbox Implementation
  - js-to-lisp-reverse-compiler
  - plan-update-confirmation
  - Cross-Target Macro System in Sibilant
  - markdown-to-org-transpiler
  - Ollama-LLM-Provider-for-Pseudo-Code-Transpiler
  - Voice Access Layer Design
  - Promethean Agent Config DSL
  - Sibilant Meta-Prompt DSL
  - Model Selection for Lightweight Conversational Tasks
$$
related_to_uuid:
$$
  - 7b7ca860-780c-44fa-8d3f-be8bd9496fba
  - ab748541-020e-4a7e-b07d-28173bd5bea2
  - 54382370-1931-4a19-a634-46735708a9ea
  - c03020e1-e3e7-48bf-aa7e-aa740c601b63
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - b51e19b4-1326-4311-9798-33e972bf626c
  - aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
  - fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - 22b989d5-f4aa-4880-8632-709c21830f83
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
  - c34c36a6-80c9-4b44-a200-6448543b1b33
  - c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
  - 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
  - cf6b9b17-bb91-4219-aa5c-172cba02b2da
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
  - d527c05d-22e8-4493-8f29-ae3cb67f035b
  - 21d5cc09-b005-4ede-8f69-00b4b0794540
  - fc21f824-4244-4030-a48e-c4170160ea1d
  - 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
  - 58191024-d04a-4520-8aae-a18be7b94263
  - b22d79c6-825b-4cd3-b0d3-1cef0532bb54
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
  - b362e12e-2802-4e41-9a21-6e0c7ad419a2
  - 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
  - 2c00ce45-08cf-4b81-9883-6157f30b7fae
  - af5d2824-faad-476c-a389-e912d9bc672c
  - d144aa62-348c-4e5d-ae8f-38084c67ceca
references:
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 115
    col: 1
    score: 0.95
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 100
    col: 1
    score: 0.92
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 100
    col: 3
    score: 0.92
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 38
    col: 4
    score: 0.9
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 38
    col: 6
    score: 0.9
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 98
    col: 3
    score: 0.89
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 98
    col: 5
    score: 0.89
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 105
    col: 1
    score: 0.88
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 111
    col: 1
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 143
    col: 1
    score: 1
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 39
    col: 1
    score: 1
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 39
    col: 3
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 39
    col: 4
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 39
    col: 6
    score: 0.98
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 38
    col: 1
    score: 0.92
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 38
    col: 3
    score: 0.92
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 37
    col: 1
    score: 0.91
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 37
    col: 3
    score: 0.91
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 255
    col: 1
    score: 0.88
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 255
    col: 3
    score: 0.88
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 394
    col: 1
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 394
    col: 3
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 995
    col: 1
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 995
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
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 168
    col: 1
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 168
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
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 169
    col: 1
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 169
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
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 136
    col: 1
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 136
    col: 3
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 269
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 269
    col: 3
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 582
    col: 1
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 582
    col: 3
    score: 1
  - uuid: d527c05d-22e8-4493-8f29-ae3cb67f035b
    line: 425
    col: 1
    score: 1
  - uuid: d527c05d-22e8-4493-8f29-ae3cb67f035b
    line: 425
    col: 3
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 151
    col: 1
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 151
    col: 3
    score: 1
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 14
    col: 1
    score: 1
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 14
    col: 3
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 460
    col: 1
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 460
    col: 3
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 393
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 393
    col: 3
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 156
    col: 1
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 156
    col: 3
    score: 1
  - uuid: 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
    line: 136
    col: 1
    score: 1
  - uuid: 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
    line: 136
    col: 3
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 386
    col: 1
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 386
    col: 3
    score: 1
  - uuid: 21d5cc09-b005-4ede-8f69-00b4b0794540
    line: 155
    col: 1
    score: 1
  - uuid: 21d5cc09-b005-4ede-8f69-00b4b0794540
    line: 155
    col: 3
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 34
    col: 1
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 34
    col: 3
    score: 1
  - uuid: cf6b9b17-bb91-4219-aa5c-172cba02b2da
    line: 149
    col: 1
    score: 1
  - uuid: cf6b9b17-bb91-4219-aa5c-172cba02b2da
    line: 149
    col: 3
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 103
    col: 1
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 103
    col: 3
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 139
    col: 1
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 139
    col: 3
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 166
    col: 1
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 166
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
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 175
    col: 1
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 175
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
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 287
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 287
    col: 3
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 598
    col: 1
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 598
    col: 3
    score: 0.99
  - uuid: d527c05d-22e8-4493-8f29-ae3cb67f035b
    line: 433
    col: 1
    score: 0.99
  - uuid: d527c05d-22e8-4493-8f29-ae3cb67f035b
    line: 433
    col: 3
    score: 0.99
  - uuid: d527c05d-22e8-4493-8f29-ae3cb67f035b
    line: 435
    col: 1
    score: 0.99
  - uuid: d527c05d-22e8-4493-8f29-ae3cb67f035b
    line: 435
    col: 3
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 483
    col: 1
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 483
    col: 3
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 178
    col: 1
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 178
    col: 3
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 484
    col: 1
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 484
    col: 3
    score: 0.99
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 331
    col: 1
    score: 0.99
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 331
    col: 3
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 481
    col: 1
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 481
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
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 179
    col: 1
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 179
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
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 403
    col: 1
    score: 1
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 403
    col: 3
    score: 1
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 902
    col: 1
    score: 0.99
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 902
    col: 3
    score: 0.99
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 214
    col: 1
    score: 0.99
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 214
    col: 3
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 480
    col: 1
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 480
    col: 3
    score: 1
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 404
    col: 1
    score: 0.99
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 404
    col: 3
    score: 0.99
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 215
    col: 1
    score: 0.99
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 215
    col: 3
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 482
    col: 1
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 482
    col: 3
    score: 1
  - uuid: 2c00ce45-08cf-4b81-9883-6157f30b7fae
    line: 322
    col: 1
    score: 1
  - uuid: 2c00ce45-08cf-4b81-9883-6157f30b7fae
    line: 322
    col: 3
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 477
    col: 1
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 477
    col: 3
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 427
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 427
    col: 3
    score: 1
  - uuid: ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
    line: 314
    col: 1
    score: 1
  - uuid: ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
    line: 314
    col: 3
    score: 1
  - uuid: b362e12e-2802-4e41-9a21-6e0c7ad419a2
    line: 181
    col: 1
    score: 1
  - uuid: b362e12e-2802-4e41-9a21-6e0c7ad419a2
    line: 181
    col: 3
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 402
    col: 1
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 402
    col: 3
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 403
    col: 1
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 403
    col: 3
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 289
    col: 1
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 289
    col: 3
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 290
    col: 1
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 290
    col: 3
    score: 0.98
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 180
    col: 1
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 180
    col: 3
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 181
    col: 1
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 181
    col: 3
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 190
    col: 1
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 190
    col: 3
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 188
    col: 1
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 188
    col: 3
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 191
    col: 1
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 191
    col: 3
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 189
    col: 1
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 189
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
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 408
    col: 1
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 408
    col: 3
    score: 0.99
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 143
    col: 1
    score: 0.99
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 143
    col: 3
    score: 0.99
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 205
    col: 1
    score: 0.99
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 205
    col: 3
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 409
    col: 1
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 409
    col: 3
    score: 0.99
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 206
    col: 1
    score: 0.99
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 206
    col: 3
    score: 0.99
---
# 🤖 Agent Tasks: Persistence Migration to DualStore

---

## 🗂 Task 1 — Setup Shared Persistence Module

* [ ] Create directory `shared/ts/persistence/`.
* [ ] Add:

  * `clients.ts`
  * `types.ts`
  * `dualStore.ts` (enhanced version with alias, timestamp, UUID, mostRelevant).
  * `contextStore.ts` (from Cephalon’s ContextManager).
  * `maintenance.ts`
  * `index.ts`
* [ ] Add `README.md` explaining usage of `DualStore` + `ContextStore`.

✅ Output: Shared persistence module exists, documented, builds cleanly.

---

## 🗂 Task 2 — Deprecate Legacy Persistence

* [ ] In **Cephalon**, mark `collectionManager.ts` as **deprecated**.
* [ ] In **SmartGPT Bridge**, mark `DualSink.js` + `mongo.js` as **deprecated**.
* [ ] In each service’s `AGENTS.md`, update:

  * Remove references to local persistence implementations.
  * Replace with:

    ```
    Persistence is handled via shared module: @shared/ts/persistence/DualStore
    ```

✅ Output: No governance doc refers to `CollectionManager` or `DualSink`.

---

## 🗂 Task 3 — Service Migrations

### Cephalon

* [ ] Replace all imports of `CollectionManager` with `DualStore`.
* [ ] Replace `ContextManager` with `ContextStore` from shared.
* [ ] Adjust methods:

  * `addEntry` → `insert`
  * `getMostRecent` → `getMostRecent`
  * `getMostRelevant` → `getMostRelevant`

### SmartGPT Bridge

* [ ] Remove `DualSink` usage.
* [ ] Replace with `DualStore.create$"bridge_logs"$`.
* [ ] Move cleanup jobs to `shared/ts/persistence/maintenance.ts`.

### Discord-embedder

* [ ] Remove raw `MongoClient` + `ChromaClient`.
* [ ] Replace with `DualStore.create$"discord_messages"$`.

### Kanban Processor

* [ ] Replace raw `MongoClient` with `DualStore`.
* [ ] Enable optional Chroma indexing for tasks.

### Markdown Graph

* [ ] Replace raw `MongoClient` with `DualStore`.
* [ ] Add optional embedding for graph queries if needed.

✅ Output: All services use `DualStore` instead of local clients.

---

## 🗂 Task 4 — Update Tests

* [ ] Write unit tests for `DualStore`:

  * Insert, recent fetch, relevance query.
* [ ] Write unit tests for `ContextStore`:

  * Create multiple collections, insert entries, compile context.
* [ ] Update existing Cephalon + Bridge tests to reference new shared persistence.

✅ Output: All persistence tests point to shared module.

---

## 🗂 Task 5 — Update Docs

* [ ] Update root `AGENTS.md`: add **Shared Persistence** section.
* [ ] Add new doc `docs/reports/persistence-migration-checklist.md` (we already drafted this).
* [ ] Add `docs/reports/persistence-dependency-graph.md` for before/after diagrams.
* [ ] Ensure diagrams show all services routing through `DualStore`.

✅ Output: Documentation reflects new persistence architecture.

---

## 🗂 Task 6 — Cleanup

* [ ] Delete legacy files after migration is verified:

  * `services/ts/cephalon/src/collectionManager.ts`
  * `services/ts/cephalon/src/contextManager.ts`
  * `services/ts/smartgpt-bridge/src/utils/DualSink.js`
  * `services/ts/smartgpt-bridge/src/mongo.js`
* [ ] Confirm `git grep "MongoClient" services/ts/` and `git grep "ChromaClient" services/ts/` return **no service-local usage**.

✅ Output: Repo contains only `DualStore`/`ContextStore` persistence code.

---

## 🏁 Final Deliverable

* All services $`cephalon`, `bridge`, `discord-embedder`, `kanban-processor`, `markdown-graph`$ use the shared persistence layer.
* Legacy persistence modules removed.
* Tests green.
* Docs updated.
* Obsidian diagrams show unified architecture.

---

👉 Do you want me to **encode these tasks into a YAML workflow** (like a `tasks.yaml` for an autonomous migration agent), so it can be scheduled/executed step by step?
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- $[typescript-patch-for-tool-calling-support|TypeScript Patch for Tool Calling Support]$
- $[promethean-native-config-design|Promethean-native config design]$
- $[migrate-to-provider-tenant-architecture|Migrate to Provider-Tenant Architecture]$
- $[per-domain-policy-system-for-js-crawler|Per-Domain Policy System for JS Crawler]$
- $[docs/unique/eidolon-field-math-foundations|eidolon-field-math-foundations]$
- $[chroma-toolkit-consolidation-plan|Chroma Toolkit Consolidation Plan]$
- $[promethean-system-diagrams]$
- $[prom-lib-rate-limiters-and-replay-api]$
- [Promethean Event Bus MVP v0.1]$promethean-event-bus-mvp-v0-1.md$
- $[ecs-scheduler-and-prefabs]$
- $[field-node-diagram-outline]$
- $[docs/unique/ecs-offload-workers|ecs-offload-workers]$
- $[field-node-diagram-set]$
- $[docs/unique/aionian-circuit-math|aionian-circuit-math]$
- $[board-walk-2025-08-11|Board Walk – 2025-08-11]$
- $[cross-language-runtime-polymorphism|Cross-Language Runtime Polymorphism]$
- [Math Fundamentals]$chunks/math-fundamentals.md$
- $[eidolon-node-lifecycle]$
- $[event-bus-projections-architecture|Event Bus Projections Architecture]$
- $[promethean-infrastructure-setup|Promethean Infrastructure Setup]$
- $[dynamic-context-model-for-web-components|Dynamic Context Model for Web Components]$
- $[docs/unique/event-bus-mvp|Event Bus MVP]$
- $[pure-node-crawl-stack-with-playwright-and-crawlee|Pure-Node Crawl Stack with Playwright and Crawlee]$
- $[exception-layer-analysis|Exception Layer Analysis]$
- $[fnord-tracer-protocol|Fnord Tracer Protocol]$
- $[mongo-outbox-implementation|Mongo Outbox Implementation]$
- $[js-to-lisp-reverse-compiler]$
- $plan-update-confirmation$$plan-update-confirmation.md$
- $[cross-target-macro-system-in-sibilant|Cross-Target Macro System in Sibilant]$
- $[markdown-to-org-transpiler]$
- $[ollama-llm-provider-for-pseudo-code-transpiler]$
- $[voice-access-layer-design|Voice Access Layer Design]$
- $[promethean-agent-config-dsl|Promethean Agent Config DSL]$
- $[sibilant-meta-prompt-dsl|Sibilant Meta-Prompt DSL]$
- $[model-selection-for-lightweight-conversational-tasks|Model Selection for Lightweight Conversational Tasks]$

## Sources
- $[per-domain-policy-system-for-js-crawler#L115|Per-Domain Policy System for JS Crawler — L115]$ (line 115, col 1, score 0.95)
- $[migrate-to-provider-tenant-architecture#L100|Migrate to Provider-Tenant Architecture — L100]$ (line 100, col 1, score 0.92)
- $[migrate-to-provider-tenant-architecture#L100|Migrate to Provider-Tenant Architecture — L100]$ (line 100, col 3, score 0.92)
- $[migrate-to-provider-tenant-architecture#L38|Migrate to Provider-Tenant Architecture — L38]$ (line 38, col 4, score 0.9)
- $[migrate-to-provider-tenant-architecture#L38|Migrate to Provider-Tenant Architecture — L38]$ (line 38, col 6, score 0.9)
- $[migrate-to-provider-tenant-architecture#L98|Migrate to Provider-Tenant Architecture — L98]$ (line 98, col 3, score 0.89)
- $[migrate-to-provider-tenant-architecture#L98|Migrate to Provider-Tenant Architecture — L98]$ (line 98, col 5, score 0.89)
- $[docs/unique/eidolon-field-math-foundations#L105|eidolon-field-math-foundations — L105]$ (line 105, col 1, score 0.88)
- $[typescript-patch-for-tool-calling-support#L111|TypeScript Patch for Tool Calling Support — L111]$ (line 111, col 1, score 1)
- $[typescript-patch-for-tool-calling-support#L143|TypeScript Patch for Tool Calling Support — L143]$ (line 143, col 1, score 1)
- $[promethean-native-config-design#L39|Promethean-native config design — L39]$ (line 39, col 1, score 1)
- $[promethean-native-config-design#L39|Promethean-native config design — L39]$ (line 39, col 3, score 1)
- $[migrate-to-provider-tenant-architecture#L39|Migrate to Provider-Tenant Architecture — L39]$ (line 39, col 4, score 0.98)
- $[migrate-to-provider-tenant-architecture#L39|Migrate to Provider-Tenant Architecture — L39]$ (line 39, col 6, score 0.98)
- $[promethean-native-config-design#L38|Promethean-native config design — L38]$ (line 38, col 1, score 0.92)
- $[promethean-native-config-design#L38|Promethean-native config design — L38]$ (line 38, col 3, score 0.92)
- $[promethean-native-config-design#L37|Promethean-native config design — L37]$ (line 37, col 1, score 0.91)
- $[promethean-native-config-design#L37|Promethean-native config design — L37]$ (line 37, col 3, score 0.91)
- $[migrate-to-provider-tenant-architecture#L255|Migrate to Provider-Tenant Architecture — L255]$ (line 255, col 1, score 0.88)
- $[migrate-to-provider-tenant-architecture#L255|Migrate to Provider-Tenant Architecture — L255]$ (line 255, col 3, score 0.88)
- $[dynamic-context-model-for-web-components#L394|Dynamic Context Model for Web Components — L394]$ (line 394, col 1, score 1)
- $[dynamic-context-model-for-web-components#L394|Dynamic Context Model for Web Components — L394]$ (line 394, col 3, score 1)
- $plan-update-confirmation — L995$$plan-update-confirmation.md#L995$ (line 995, col 1, score 1)
- $plan-update-confirmation — L995$$plan-update-confirmation.md#L995$ (line 995, col 3, score 1)
- $[docs/unique/aionian-circuit-math#L159|aionian-circuit-math — L159]$ (line 159, col 1, score 1)
- $[docs/unique/aionian-circuit-math#L159|aionian-circuit-math — L159]$ (line 159, col 3, score 1)
- $[board-walk-2025-08-11#L134|Board Walk – 2025-08-11 — L134]$ (line 134, col 1, score 1)
- $[board-walk-2025-08-11#L134|Board Walk – 2025-08-11 — L134]$ (line 134, col 3, score 1)
- $[chroma-toolkit-consolidation-plan#L168|Chroma Toolkit Consolidation Plan — L168]$ (line 168, col 1, score 1)
- $[chroma-toolkit-consolidation-plan#L168|Chroma Toolkit Consolidation Plan — L168]$ (line 168, col 3, score 1)
- $[cross-language-runtime-polymorphism#L209|Cross-Language Runtime Polymorphism — L209]$ (line 209, col 1, score 1)
- $[cross-language-runtime-polymorphism#L209|Cross-Language Runtime Polymorphism — L209]$ (line 209, col 3, score 1)
- $[chroma-toolkit-consolidation-plan#L169|Chroma Toolkit Consolidation Plan — L169]$ (line 169, col 1, score 1)
- $[chroma-toolkit-consolidation-plan#L169|Chroma Toolkit Consolidation Plan — L169]$ (line 169, col 3, score 1)
- $[cross-target-macro-system-in-sibilant#L175|Cross-Target Macro System in Sibilant — L175]$ (line 175, col 1, score 1)
- $[cross-target-macro-system-in-sibilant#L175|Cross-Target Macro System in Sibilant — L175]$ (line 175, col 3, score 1)
- $[dynamic-context-model-for-web-components#L392|Dynamic Context Model for Web Components — L392]$ (line 392, col 1, score 1)
- $[dynamic-context-model-for-web-components#L392|Dynamic Context Model for Web Components — L392]$ (line 392, col 3, score 1)
- $[js-to-lisp-reverse-compiler#L414|js-to-lisp-reverse-compiler — L414]$ (line 414, col 1, score 1)
- $[js-to-lisp-reverse-compiler#L414|js-to-lisp-reverse-compiler — L414]$ (line 414, col 3, score 1)
- $[docs/unique/eidolon-field-math-foundations#L136|eidolon-field-math-foundations — L136]$ (line 136, col 1, score 1)
- $[docs/unique/eidolon-field-math-foundations#L136|eidolon-field-math-foundations — L136]$ (line 136, col 3, score 1)
- $[migrate-to-provider-tenant-architecture#L269|Migrate to Provider-Tenant Architecture — L269]$ (line 269, col 1, score 1)
- $[migrate-to-provider-tenant-architecture#L269|Migrate to Provider-Tenant Architecture — L269]$ (line 269, col 3, score 1)
- $[promethean-infrastructure-setup#L582|Promethean Infrastructure Setup — L582]$ (line 582, col 1, score 1)
- $[promethean-infrastructure-setup#L582|Promethean Infrastructure Setup — L582]$ (line 582, col 3, score 1)
- $[pure-node-crawl-stack-with-playwright-and-crawlee#L425|Pure-Node Crawl Stack with Playwright and Crawlee — L425]$ (line 425, col 1, score 1)
- $[pure-node-crawl-stack-with-playwright-and-crawlee#L425|Pure-Node Crawl Stack with Playwright and Crawlee — L425]$ (line 425, col 3, score 1)
- $[docs/unique/aionian-circuit-math#L151|aionian-circuit-math — L151]$ (line 151, col 1, score 1)
- $[docs/unique/aionian-circuit-math#L151|aionian-circuit-math — L151]$ (line 151, col 3, score 1)
- [Math Fundamentals — L14]$chunks/math-fundamentals.md#L14$ (line 14, col 1, score 1)
- [Math Fundamentals — L14]$chunks/math-fundamentals.md#L14$ (line 14, col 3, score 1)
- $[docs/unique/ecs-offload-workers#L460|ecs-offload-workers — L460]$ (line 460, col 1, score 1)
- $[docs/unique/ecs-offload-workers#L460|ecs-offload-workers — L460]$ (line 460, col 3, score 1)
- $[ecs-scheduler-and-prefabs#L393|ecs-scheduler-and-prefabs — L393]$ (line 393, col 1, score 1)
- $[ecs-scheduler-and-prefabs#L393|ecs-scheduler-and-prefabs — L393]$ (line 393, col 3, score 1)
- $[docs/unique/aionian-circuit-math#L156|aionian-circuit-math — L156]$ (line 156, col 1, score 1)
- $[docs/unique/aionian-circuit-math#L156|aionian-circuit-math — L156]$ (line 156, col 3, score 1)
- $[board-walk-2025-08-11#L136|Board Walk – 2025-08-11 — L136]$ (line 136, col 1, score 1)
- $[board-walk-2025-08-11#L136|Board Walk – 2025-08-11 — L136]$ (line 136, col 3, score 1)
- $[dynamic-context-model-for-web-components#L386|Dynamic Context Model for Web Components — L386]$ (line 386, col 1, score 1)
- $[dynamic-context-model-for-web-components#L386|Dynamic Context Model for Web Components — L386]$ (line 386, col 3, score 1)
- $[exception-layer-analysis#L155|Exception Layer Analysis — L155]$ (line 155, col 1, score 1)
- $[exception-layer-analysis#L155|Exception Layer Analysis — L155]$ (line 155, col 3, score 1)
- $[eidolon-node-lifecycle#L34|eidolon-node-lifecycle — L34]$ (line 34, col 1, score 1)
- $[eidolon-node-lifecycle#L34|eidolon-node-lifecycle — L34]$ (line 34, col 3, score 1)
- $[event-bus-projections-architecture#L149|Event Bus Projections Architecture — L149]$ (line 149, col 1, score 1)
- $[event-bus-projections-architecture#L149|Event Bus Projections Architecture — L149]$ (line 149, col 3, score 1)
- $[field-node-diagram-outline#L103|field-node-diagram-outline — L103]$ (line 103, col 1, score 1)
- $[field-node-diagram-outline#L103|field-node-diagram-outline — L103]$ (line 103, col 3, score 1)
- $[field-node-diagram-set#L139|field-node-diagram-set — L139]$ (line 139, col 1, score 1)
- $[field-node-diagram-set#L139|field-node-diagram-set — L139]$ (line 139, col 3, score 1)
- $[chroma-toolkit-consolidation-plan#L166|Chroma Toolkit Consolidation Plan — L166]$ (line 166, col 1, score 1)
- $[chroma-toolkit-consolidation-plan#L166|Chroma Toolkit Consolidation Plan — L166]$ (line 166, col 3, score 1)
- $[docs/unique/event-bus-mvp#L551|Event Bus MVP — L551]$ (line 551, col 1, score 1)
- $[docs/unique/event-bus-mvp#L551|Event Bus MVP — L551]$ (line 551, col 3, score 1)
- $[migrate-to-provider-tenant-architecture#L284|Migrate to Provider-Tenant Architecture — L284]$ (line 284, col 1, score 1)
- $[migrate-to-provider-tenant-architecture#L284|Migrate to Provider-Tenant Architecture — L284]$ (line 284, col 3, score 1)
- $[mongo-outbox-implementation#L555|Mongo Outbox Implementation — L555]$ (line 555, col 1, score 1)
- $[mongo-outbox-implementation#L555|Mongo Outbox Implementation — L555]$ (line 555, col 3, score 1)
- $[chroma-toolkit-consolidation-plan#L175|Chroma Toolkit Consolidation Plan — L175]$ (line 175, col 1, score 1)
- $[chroma-toolkit-consolidation-plan#L175|Chroma Toolkit Consolidation Plan — L175]$ (line 175, col 3, score 1)
- $[docs/unique/event-bus-mvp#L547|Event Bus MVP — L547]$ (line 547, col 1, score 1)
- $[docs/unique/event-bus-mvp#L547|Event Bus MVP — L547]$ (line 547, col 3, score 1)
- $[event-bus-projections-architecture#L150|Event Bus Projections Architecture — L150]$ (line 150, col 1, score 1)
- $[event-bus-projections-architecture#L150|Event Bus Projections Architecture — L150]$ (line 150, col 3, score 1)
- $[fnord-tracer-protocol#L244|Fnord Tracer Protocol — L244]$ (line 244, col 1, score 1)
- $[fnord-tracer-protocol#L244|Fnord Tracer Protocol — L244]$ (line 244, col 3, score 1)
- $[migrate-to-provider-tenant-architecture#L287|Migrate to Provider-Tenant Architecture — L287]$ (line 287, col 1, score 1)
- $[migrate-to-provider-tenant-architecture#L287|Migrate to Provider-Tenant Architecture — L287]$ (line 287, col 3, score 1)
- $[promethean-infrastructure-setup#L598|Promethean Infrastructure Setup — L598]$ (line 598, col 1, score 0.99)
- $[promethean-infrastructure-setup#L598|Promethean Infrastructure Setup — L598]$ (line 598, col 3, score 0.99)
- $[pure-node-crawl-stack-with-playwright-and-crawlee#L433|Pure-Node Crawl Stack with Playwright and Crawlee — L433]$ (line 433, col 1, score 0.99)
- $[pure-node-crawl-stack-with-playwright-and-crawlee#L433|Pure-Node Crawl Stack with Playwright and Crawlee — L433]$ (line 433, col 3, score 0.99)
- $[pure-node-crawl-stack-with-playwright-and-crawlee#L435|Pure-Node Crawl Stack with Playwright and Crawlee — L435]$ (line 435, col 1, score 0.99)
- $[pure-node-crawl-stack-with-playwright-and-crawlee#L435|Pure-Node Crawl Stack with Playwright and Crawlee — L435]$ (line 435, col 3, score 0.99)
- $[per-domain-policy-system-for-js-crawler#L483|Per-Domain Policy System for JS Crawler — L483]$ (line 483, col 1, score 1)
- $[per-domain-policy-system-for-js-crawler#L483|Per-Domain Policy System for JS Crawler — L483]$ (line 483, col 3, score 1)
- $[chroma-toolkit-consolidation-plan#L178|Chroma Toolkit Consolidation Plan — L178]$ (line 178, col 1, score 1)
- $[chroma-toolkit-consolidation-plan#L178|Chroma Toolkit Consolidation Plan — L178]$ (line 178, col 3, score 1)
- $[per-domain-policy-system-for-js-crawler#L484|Per-Domain Policy System for JS Crawler — L484]$ (line 484, col 1, score 0.99)
- $[per-domain-policy-system-for-js-crawler#L484|Per-Domain Policy System for JS Crawler — L484]$ (line 484, col 3, score 0.99)
- $[voice-access-layer-design#L331|Voice Access Layer Design — L331]$ (line 331, col 1, score 0.99)
- $[voice-access-layer-design#L331|Voice Access Layer Design — L331]$ (line 331, col 3, score 0.99)
- $[per-domain-policy-system-for-js-crawler#L481|Per-Domain Policy System for JS Crawler — L481]$ (line 481, col 1, score 1)
- $[per-domain-policy-system-for-js-crawler#L481|Per-Domain Policy System for JS Crawler — L481]$ (line 481, col 3, score 1)
- $[promethean-agent-config-dsl#L321|Promethean Agent Config DSL — L321]$ (line 321, col 1, score 1)
- $[promethean-agent-config-dsl#L321|Promethean Agent Config DSL — L321]$ (line 321, col 3, score 1)
- $[chroma-toolkit-consolidation-plan#L179|Chroma Toolkit Consolidation Plan — L179]$ (line 179, col 1, score 1)
- $[chroma-toolkit-consolidation-plan#L179|Chroma Toolkit Consolidation Plan — L179]$ (line 179, col 3, score 1)
- $[per-domain-policy-system-for-js-crawler#L479|Per-Domain Policy System for JS Crawler — L479]$ (line 479, col 1, score 1)
- $[per-domain-policy-system-for-js-crawler#L479|Per-Domain Policy System for JS Crawler — L479]$ (line 479, col 3, score 1)
- $[promethean-native-config-design#L403|Promethean-native config design — L403]$ (line 403, col 1, score 1)
- $[promethean-native-config-design#L403|Promethean-native config design — L403]$ (line 403, col 3, score 1)
- [Promethean Event Bus MVP v0.1 — L902]$promethean-event-bus-mvp-v0-1.md#L902$ (line 902, col 1, score 0.99)
- [Promethean Event Bus MVP v0.1 — L902]$promethean-event-bus-mvp-v0-1.md#L902$ (line 902, col 3, score 0.99)
- $[sibilant-meta-prompt-dsl#L214|Sibilant Meta-Prompt DSL — L214]$ (line 214, col 1, score 0.99)
- $[sibilant-meta-prompt-dsl#L214|Sibilant Meta-Prompt DSL — L214]$ (line 214, col 3, score 0.99)
- $[per-domain-policy-system-for-js-crawler#L480|Per-Domain Policy System for JS Crawler — L480]$ (line 480, col 1, score 1)
- $[per-domain-policy-system-for-js-crawler#L480|Per-Domain Policy System for JS Crawler — L480]$ (line 480, col 3, score 1)
- $[promethean-native-config-design#L404|Promethean-native config design — L404]$ (line 404, col 1, score 0.99)
- $[promethean-native-config-design#L404|Promethean-native config design — L404]$ (line 404, col 3, score 0.99)
- $[sibilant-meta-prompt-dsl#L215|Sibilant Meta-Prompt DSL — L215]$ (line 215, col 1, score 0.99)
- $[sibilant-meta-prompt-dsl#L215|Sibilant Meta-Prompt DSL — L215]$ (line 215, col 3, score 0.99)
- $[per-domain-policy-system-for-js-crawler#L482|Per-Domain Policy System for JS Crawler — L482]$ (line 482, col 1, score 1)
- $[per-domain-policy-system-for-js-crawler#L482|Per-Domain Policy System for JS Crawler — L482]$ (line 482, col 3, score 1)
- $[promethean-agent-config-dsl#L322|Promethean Agent Config DSL — L322]$ (line 322, col 1, score 1)
- $[promethean-agent-config-dsl#L322|Promethean Agent Config DSL — L322]$ (line 322, col 3, score 1)
- $[docs/unique/ecs-offload-workers#L477|ecs-offload-workers — L477]$ (line 477, col 1, score 1)
- $[docs/unique/ecs-offload-workers#L477|ecs-offload-workers — L477]$ (line 477, col 3, score 1)
- $[ecs-scheduler-and-prefabs#L427|ecs-scheduler-and-prefabs — L427]$ (line 427, col 1, score 1)
- $[ecs-scheduler-and-prefabs#L427|ecs-scheduler-and-prefabs — L427]$ (line 427, col 3, score 1)
- $[markdown-to-org-transpiler#L314|markdown-to-org-transpiler — L314]$ (line 314, col 1, score 1)
- $[markdown-to-org-transpiler#L314|markdown-to-org-transpiler — L314]$ (line 314, col 3, score 1)
- $[ollama-llm-provider-for-pseudo-code-transpiler#L181|Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L181]$ (line 181, col 1, score 1)
- $[ollama-llm-provider-for-pseudo-code-transpiler#L181|Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L181]$ (line 181, col 3, score 1)
- $[dynamic-context-model-for-web-components#L402|Dynamic Context Model for Web Components — L402]$ (line 402, col 1, score 0.99)
- $[dynamic-context-model-for-web-components#L402|Dynamic Context Model for Web Components — L402]$ (line 402, col 3, score 0.99)
- $[dynamic-context-model-for-web-components#L403|Dynamic Context Model for Web Components — L403]$ (line 403, col 1, score 0.99)
- $[dynamic-context-model-for-web-components#L403|Dynamic Context Model for Web Components — L403]$ (line 403, col 3, score 0.99)
- $[migrate-to-provider-tenant-architecture#L289|Migrate to Provider-Tenant Architecture — L289]$ (line 289, col 1, score 0.99)
- $[migrate-to-provider-tenant-architecture#L289|Migrate to Provider-Tenant Architecture — L289]$ (line 289, col 3, score 0.99)
- $[migrate-to-provider-tenant-architecture#L290|Migrate to Provider-Tenant Architecture — L290]$ (line 290, col 1, score 0.98)
- $[migrate-to-provider-tenant-architecture#L290|Migrate to Provider-Tenant Architecture — L290]$ (line 290, col 3, score 0.98)
- $[chroma-toolkit-consolidation-plan#L180|Chroma Toolkit Consolidation Plan — L180]$ (line 180, col 1, score 1)
- $[chroma-toolkit-consolidation-plan#L180|Chroma Toolkit Consolidation Plan — L180]$ (line 180, col 3, score 1)
- $[chroma-toolkit-consolidation-plan#L181|Chroma Toolkit Consolidation Plan — L181]$ (line 181, col 1, score 1)
- $[chroma-toolkit-consolidation-plan#L181|Chroma Toolkit Consolidation Plan — L181]$ (line 181, col 3, score 1)
- $[chroma-toolkit-consolidation-plan#L190|Chroma Toolkit Consolidation Plan — L190]$ (line 190, col 1, score 0.99)
- $[chroma-toolkit-consolidation-plan#L190|Chroma Toolkit Consolidation Plan — L190]$ (line 190, col 3, score 0.99)
- $[chroma-toolkit-consolidation-plan#L188|Chroma Toolkit Consolidation Plan — L188]$ (line 188, col 1, score 0.99)
- $[chroma-toolkit-consolidation-plan#L188|Chroma Toolkit Consolidation Plan — L188]$ (line 188, col 3, score 0.99)
- $[chroma-toolkit-consolidation-plan#L191|Chroma Toolkit Consolidation Plan — L191]$ (line 191, col 1, score 0.99)
- $[chroma-toolkit-consolidation-plan#L191|Chroma Toolkit Consolidation Plan — L191]$ (line 191, col 3, score 0.99)
- $[chroma-toolkit-consolidation-plan#L189|Chroma Toolkit Consolidation Plan — L189]$ (line 189, col 1, score 0.99)
- $[chroma-toolkit-consolidation-plan#L189|Chroma Toolkit Consolidation Plan — L189]$ (line 189, col 3, score 0.99)
- $[model-selection-for-lightweight-conversational-tasks#L144|Model Selection for Lightweight Conversational Tasks — L144]$ (line 144, col 1, score 0.99)
- $[model-selection-for-lightweight-conversational-tasks#L144|Model Selection for Lightweight Conversational Tasks — L144]$ (line 144, col 3, score 0.99)
- $[dynamic-context-model-for-web-components#L408|Dynamic Context Model for Web Components — L408]$ (line 408, col 1, score 0.99)
- $[dynamic-context-model-for-web-components#L408|Dynamic Context Model for Web Components — L408]$ (line 408, col 3, score 0.99)
- $[model-selection-for-lightweight-conversational-tasks#L143|Model Selection for Lightweight Conversational Tasks — L143]$ (line 143, col 1, score 0.99)
- $[model-selection-for-lightweight-conversational-tasks#L143|Model Selection for Lightweight Conversational Tasks — L143]$ (line 143, col 3, score 0.99)
- $[sibilant-meta-prompt-dsl#L205|Sibilant Meta-Prompt DSL — L205]$ (line 205, col 1, score 0.99)
- $[sibilant-meta-prompt-dsl#L205|Sibilant Meta-Prompt DSL — L205]$ (line 205, col 3, score 0.99)
- $[dynamic-context-model-for-web-components#L409|Dynamic Context Model for Web Components — L409]$ (line 409, col 1, score 0.99)
- $[dynamic-context-model-for-web-components#L409|Dynamic Context Model for Web Components — L409]$ (line 409, col 3, score 0.99)
- $[sibilant-meta-prompt-dsl#L206|Sibilant Meta-Prompt DSL — L206]$ (line 206, col 1, score 0.99)
- $[sibilant-meta-prompt-dsl#L206|Sibilant Meta-Prompt DSL — L206]$ (line 206, col 3, score 0.99)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
