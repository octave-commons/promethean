---
$$
uuid: 54382370-1931-4a19-a634-46735708a9ea
$$
$$
created_at: 2025.08.25.18.23.36.md
$$
filename: Migrate to Provider-Tenant Architecture
$$
description: >-
$$
  Refactor Promethean’s Discord services into a provider-agnostic, tenant-scoped
  architecture with shared types, tokenless domain workers, and
  provider-specific storage partitioning. Ensures Discord tokens are confined to
  access layers and enables future expansion to Reddit/Bluesky/Twitch.
tags:
  - architecture
  - discord
  - tenant
  - provider
  - tokenless
  - domain
  - storage
  - partitioning
  - policy
  - effects
$$
related_to_title:
$$
  - 'Agent Tasks: Persistence Migration to DualStore'
  - Promethean-native config design
  - Chroma Toolkit Consolidation Plan
  - Per-Domain Policy System for JS Crawler
  - Promethean Agent Config DSL
  - Sibilant Meta-Prompt DSL
  - Promethean Event Bus MVP v0.1
  - Voice Access Layer Design
  - Cross-Target Macro System in Sibilant
  - js-to-lisp-reverse-compiler
  - Shared Package Structure
  - eidolon-field-math-foundations
  - shared-package-layout-clarification
  - Unique Info Dump Index
  - Dynamic Context Model for Web Components
  - Prometheus Observability Stack
  - Model Selection for Lightweight Conversational Tasks
  - Vectorial Exception Descent
  - prom-lib-rate-limiters-and-replay-api
  - Cross-Language Runtime Polymorphism
  - ecs-offload-workers
  - AI-Centric OS with MCP Layer
  - Board Walk – 2025-08-11
  - Promethean Infrastructure Setup
  - api-gateway-versioning
  - Eidolon Field Abstract Model
  - Exception Layer Analysis
  - Event Bus MVP
  - 2d-sandbox-field
  - aionian-circuit-math
  - Local-First Intention→Code Loop with Free Models
  - Promethean Agent DSL TS Scaffold
  - field-interaction-equations
  - EidolonField
  - i3-bluetooth-setup
  - Math Fundamentals
  - archetype-ecs
  - Diagrams
  - DSL
  - Local-Offline-Model-Deployment-Strategy
  - i3-config-validation-methods
  - Local-Only-LLM-Workflow
  - observability-infrastructure-setup
  - Promethean Full-Stack Docker Setup
  - Event Bus Projections Architecture
  - Pure-Node Crawl Stack with Playwright and Crawlee
  - Post-Linguistic Transhuman Design Frameworks
  - polymorphic-meta-programming-engine
  - Mongo Outbox Implementation
  - Language-Agnostic Mirror System
  - Interop and Source Maps
  - template-based-compilation
  - Prompt_Folder_Bootstrap
  - polyglot-repl-interface-layer
  - sibilant-macro-targets
  - sibilant-meta-string-templating-runtime
  - Universal Lisp Interface
$$
related_to_uuid:
$$
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - ab748541-020e-4a7e-b07d-28173bd5bea2
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - c03020e1-e3e7-48bf-aa7e-aa740c601b63
  - 2c00ce45-08cf-4b81-9883-6157f30b7fae
  - af5d2824-faad-476c-a389-e912d9bc672c
  - fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
  - 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - 58191024-d04a-4520-8aae-a18be7b94263
  - 66a72fc3-4153-41fc-84bd-d6164967a6ff
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 36c8882a-badc-4e18-838d-2c54d7038141
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - e90b5a16-d58f-424d-bd36-70e9bd2861ad
  - d144aa62-348c-4e5d-ae8f-38084c67ceca
  - d771154e-a7ef-44ca-b69c-a1626cf94fbf
  - aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
  - c34c36a6-80c9-4b44-a200-6448543b1b33
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
  - 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - 0580dcd3-533d-4834-8a2f-eae3771960a9
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - 21d5cc09-b005-4ede-8f69-00b4b0794540
  - 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
  - c710dc93-9fec-471b-bdee-bedbd360c67f
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - 871490c7-a050-429b-88b2-55dfeaa1f8d5
  - 5158f742-4a3b-466e-bfc3-d83517b64200
  - b09141b7-544f-4c8e-8f49-bf76cecaacbb
  - 49d1e1e5-5d13-4955-8f6f-7676434ec462
  - 5e408692-0e74-400e-a617-84247c7353ad
  - c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - 45cd25b5-ed36-49ab-82c8-10d0903e34db
  - e87bc036-1570-419e-a558-f45b9c0db698
  - ad7f1ed3-c9bf-4e85-9eeb-6cc4b53155f3
  - d28090ac-f746-4958-aab5-ed1315382c04
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - b4e64f8c-4dc9-4941-a877-646c5ada068e
  - 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
  - cf6b9b17-bb91-4219-aa5c-172cba02b2da
  - d527c05d-22e8-4493-8f29-ae3cb67f035b
  - 6bcff92c-4224-453d-9993-1be8d37d47c3
  - 7bed0b9a-8b22-4b1f-be81-054a179453cb
  - 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
  - d2b3628c-6cad-4664-8551-94ef8280851d
  - cdfac40c-00e4-458f-96a7-4c37d0278731
  - f8877e5e-1e4f-4478-93cd-a0bf86d26a41
  - bd4f0976-0d5b-47f6-a20a-0601d1842dc1
  - 9c79206d-4cb9-4f00-87e0-782dcea37bc7
  - c5c9a5c6-427d-4864-8084-c083cd55faa0
  - 2aafc801-c3e1-4e4f-999d-adb52af3fc41
  - b01856b4-999f-418d-8009-ade49b00eb0f
references:
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 115
    col: 1
    score: 0.93
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 8
    col: 3
    score: 0.9
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 39
    col: 1
    score: 0.98
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 39
    col: 3
    score: 0.98
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 47
    col: 3
    score: 0.98
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 47
    col: 5
    score: 0.98
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 48
    col: 3
    score: 0.98
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 48
    col: 5
    score: 0.98
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 49
    col: 3
    score: 0.98
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 49
    col: 5
    score: 0.98
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 12
    col: 1
    score: 0.92
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 12
    col: 5
    score: 0.92
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 158
    col: 1
    score: 0.89
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 158
    col: 3
    score: 0.89
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 100
    col: 5
    score: 0.86
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 100
    col: 7
    score: 0.86
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 6
    col: 1
    score: 0.94
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 6
    col: 5
    score: 0.94
  - uuid: 2c00ce45-08cf-4b81-9883-6157f30b7fae
    line: 143
    col: 1
    score: 0.91
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 120
    col: 1
    score: 0.88
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 120
    col: 3
    score: 0.88
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 302
    col: 1
    score: 0.86
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 173
    col: 1
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 173
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
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 168
    col: 1
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 168
    col: 3
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 134
    col: 1
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 134
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
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 132
    col: 1
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 132
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
  - uuid: 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
    line: 402
    col: 1
    score: 1
  - uuid: 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
    line: 402
    col: 3
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 169
    col: 1
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 169
    col: 3
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 387
    col: 1
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 387
    col: 3
    score: 1
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 410
    col: 1
    score: 1
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 410
    col: 3
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 172
    col: 1
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 172
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
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 137
    col: 1
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 137
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
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 552
    col: 1
    score: 1
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 552
    col: 3
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 104
    col: 1
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 104
    col: 3
    score: 1
  - uuid: 871490c7-a050-429b-88b2-55dfeaa1f8d5
    line: 144
    col: 1
    score: 1
  - uuid: 871490c7-a050-429b-88b2-55dfeaa1f8d5
    line: 144
    col: 3
    score: 1
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 893
    col: 1
    score: 1
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 893
    col: 3
    score: 1
  - uuid: c34c36a6-80c9-4b44-a200-6448543b1b33
    line: 206
    col: 1
    score: 1
  - uuid: c34c36a6-80c9-4b44-a200-6448543b1b33
    line: 206
    col: 3
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 393
    col: 1
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 393
    col: 3
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 158
    col: 1
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 158
    col: 3
    score: 1
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 417
    col: 1
    score: 1
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 417
    col: 3
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 179
    col: 1
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 179
    col: 3
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 389
    col: 1
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 389
    col: 3
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 522
    col: 1
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 522
    col: 3
    score: 1
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 533
    col: 1
    score: 1
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 533
    col: 3
    score: 1
  - uuid: 5158f742-4a3b-466e-bfc3-d83517b64200
    line: 832
    col: 1
    score: 1
  - uuid: 5158f742-4a3b-466e-bfc3-d83517b64200
    line: 832
    col: 3
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 581
    col: 1
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 581
    col: 3
    score: 1
  - uuid: 36c8882a-badc-4e18-838d-2c54d7038141
    line: 166
    col: 1
    score: 1
  - uuid: 36c8882a-badc-4e18-838d-2c54d7038141
    line: 166
    col: 3
    score: 1
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 307
    col: 1
    score: 1
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 307
    col: 3
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 133
    col: 1
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 133
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
  - uuid: d28090ac-f746-4958-aab5-ed1315382c04
    line: 55
    col: 1
    score: 1
  - uuid: d28090ac-f746-4958-aab5-ed1315382c04
    line: 55
    col: 3
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 182
    col: 1
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 182
    col: 3
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 91
    col: 1
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 91
    col: 3
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 576
    col: 1
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 576
    col: 3
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 158
    col: 1
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 158
    col: 3
    score: 1
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 457
    col: 1
    score: 1
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 457
    col: 3
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 9
    col: 1
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 9
    col: 3
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 10
    col: 1
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 10
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
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 167
    col: 1
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 167
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
  - uuid: 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
    line: 403
    col: 1
    score: 1
  - uuid: 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
    line: 403
    col: 3
    score: 1
  - uuid: ad7f1ed3-c9bf-4e85-9eeb-6cc4b53155f3
    line: 293
    col: 1
    score: 1
  - uuid: ad7f1ed3-c9bf-4e85-9eeb-6cc4b53155f3
    line: 293
    col: 3
    score: 1
  - uuid: b4e64f8c-4dc9-4941-a877-646c5ada068e
    line: 361
    col: 1
    score: 1
  - uuid: b4e64f8c-4dc9-4941-a877-646c5ada068e
    line: 361
    col: 3
    score: 1
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 439
    col: 1
    score: 1
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 439
    col: 3
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 174
    col: 1
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 174
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
  - uuid: 7bed0b9a-8b22-4b1f-be81-054a179453cb
    line: 206
    col: 1
    score: 1
  - uuid: 7bed0b9a-8b22-4b1f-be81-054a179453cb
    line: 206
    col: 3
    score: 1
  - uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
    line: 195
    col: 1
    score: 1
  - uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
    line: 195
    col: 3
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 192
    col: 1
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 192
    col: 3
    score: 1
  - uuid: 49d1e1e5-5d13-4955-8f6f-7676434ec462
    line: 244
    col: 1
    score: 1
  - uuid: 49d1e1e5-5d13-4955-8f6f-7676434ec462
    line: 244
    col: 3
    score: 1
  - uuid: 21d5cc09-b005-4ede-8f69-00b4b0794540
    line: 147
    col: 1
    score: 1
  - uuid: 21d5cc09-b005-4ede-8f69-00b4b0794540
    line: 147
    col: 3
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 136
    col: 1
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 136
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
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 555
    col: 1
    score: 1
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 555
    col: 3
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 140
    col: 1
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 140
    col: 3
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 598
    col: 1
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 598
    col: 3
    score: 1
  - uuid: d527c05d-22e8-4493-8f29-ae3cb67f035b
    line: 435
    col: 1
    score: 0.99
  - uuid: d527c05d-22e8-4493-8f29-ae3cb67f035b
    line: 435
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
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 478
    col: 1
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 478
    col: 3
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 159
    col: 1
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 159
    col: 3
    score: 1
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 409
    col: 1
    score: 1
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 409
    col: 3
    score: 1
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 407
    col: 1
    score: 0.99
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 407
    col: 3
    score: 0.99
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
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 184
    col: 1
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 184
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
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 185
    col: 1
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 185
    col: 3
    score: 0.99
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 405
    col: 1
    score: 1
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 405
    col: 3
    score: 1
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 408
    col: 1
    score: 1
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 408
    col: 3
    score: 1
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 406
    col: 1
    score: 1
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 406
    col: 3
    score: 1
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 410
    col: 1
    score: 1
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 410
    col: 3
    score: 1
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 216
    col: 1
    score: 1
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 216
    col: 3
    score: 1
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 217
    col: 1
    score: 0.99
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 217
    col: 3
    score: 0.99
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 142
    col: 1
    score: 0.99
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 142
    col: 3
    score: 0.99
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 401
    col: 1
    score: 0.99
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 401
    col: 3
    score: 0.99
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 195
    col: 1
    score: 0.99
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 195
    col: 3
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 182
    col: 1
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 182
    col: 3
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 183
    col: 1
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 183
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
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 181
    col: 1
    score: 0.99
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 181
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
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 110
    col: 1
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 110
    col: 3
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 197
    col: 1
    score: 0.99
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 197
    col: 3
    score: 0.99
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 399
    col: 1
    score: 0.99
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 399
    col: 3
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 112
    col: 1
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 112
    col: 3
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 111
    col: 1
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 111
    col: 3
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 198
    col: 1
    score: 0.99
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 198
    col: 3
    score: 0.99
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 400
    col: 1
    score: 0.99
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 400
    col: 3
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 113
    col: 1
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 113
    col: 3
    score: 0.99
  - uuid: f8877e5e-1e4f-4478-93cd-a0bf86d26a41
    line: 126
    col: 1
    score: 0.99
  - uuid: f8877e5e-1e4f-4478-93cd-a0bf86d26a41
    line: 126
    col: 3
    score: 0.99
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 322
    col: 1
    score: 0.99
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 322
    col: 3
    score: 0.99
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 203
    col: 1
    score: 0.99
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 203
    col: 3
    score: 0.99
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 202
    col: 1
    score: 0.99
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 202
    col: 3
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 405
    col: 1
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 405
    col: 3
    score: 1
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 398
    col: 1
    score: 1
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 398
    col: 3
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 397
    col: 1
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 397
    col: 3
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 188
    col: 1
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 188
    col: 3
    score: 1
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 428
    col: 1
    score: 1
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 428
    col: 3
    score: 1
  - uuid: d771154e-a7ef-44ca-b69c-a1626cf94fbf
    line: 171
    col: 1
    score: 0.98
  - uuid: d771154e-a7ef-44ca-b69c-a1626cf94fbf
    line: 171
    col: 3
    score: 0.98
  - uuid: b01856b4-999f-418d-8009-ade49b00eb0f
    line: 213
    col: 1
    score: 0.98
  - uuid: b01856b4-999f-418d-8009-ade49b00eb0f
    line: 213
    col: 3
    score: 0.98
  - uuid: d771154e-a7ef-44ca-b69c-a1626cf94fbf
    line: 168
    col: 1
    score: 0.98
  - uuid: d771154e-a7ef-44ca-b69c-a1626cf94fbf
    line: 168
    col: 3
    score: 0.98
  - uuid: d771154e-a7ef-44ca-b69c-a1626cf94fbf
    line: 167
    col: 1
    score: 0.98
  - uuid: d771154e-a7ef-44ca-b69c-a1626cf94fbf
    line: 167
    col: 3
    score: 0.98
---
# Codex Task — Migrate to Provider-Tenant Architecture (Discord now, others later)

**Goal:** Refactor Promethean’s Discord-bound services into a **provider-agnostic, tenant-scoped** architecture. Discord is the first provider; design must generalize cleanly to Reddit/Bluesky/Twitch without further structural changes.

---

## Scope

### In

* Add `provider` and `tenant` to the **message envelope** and **topics**.
* Introduce **Provider Registry** (`providers.yml`) and shared types.
* Create **access layer** for Discord: `discord-gateway` + `discord-rest` (tokened).
* Convert five “weird” services into **tokenless domain workers**:

  * `discord-message-indexer`
  * `discord-attachment-indexer`
  * `discord-message-embedder`
  * `attachment-embedder`
  * `cephalon-discord` (adapter binding only)
* Add **normalized domain events** (`SocialMessageCreated`) and **commands** (`PostMessage`).
* Partition storage & embeddings **by provider+tenant**.
* Wire **policy** so only access layer has `provider.*` capabilities.
* CI rule to **ban tokens** outside access layer.

### Out $Non-goals$

* Implementing Reddit/Bluesky/Twitch adapters (stubs optional).
* Changing STT/TTS/LLM internals.
* Replacing PM2. (Use existing process manager.)

---

## Deliverables

1. **Shared library additions** under `shared/ts` $compiled to `@shared/ts/dist/...`$:

   * `agent-envelope.ts` → add `provider`, `tenant`.
   * `topic.ts` → `topic({provider,tenant,area,name})`.
   * `urn.ts` → `toUrn()/fromUrn()` helpers.
   * `events.ts` → `SocialMessageCreated`, `PostMessage` types.
   * `provider-registry.ts` → loads `providers.yml`.
   * `policy.ts` → `provider.*` caps enforced here.
   * `effects.ts` → tenant-scoped `mongo()`, `chroma()`, `http.fetch()`, `rest.request()`.
$$
2. **New services**
$$
   * `services/ts/discord-gateway/`
   * `services/ts/discord-rest/`
$$
3. **Refactors (tokenless)**
$$
   * `services/ts/discord-message-indexer/`
   * `services/ts/discord-attachment-indexer/`
   * `services/ts/discord-message-embedder/`
   * `services/ts/attachment-embedder/`
   * `services/ts/cephalon-discord/`
$$
4. **Config**
$$
   * `providers.yml` with `discord/duck` tenant.
   * `ecosystem.discord.js` (PM2) to boot per-tenant access layer.
$$
5. **DB & Vector schema**
$$
   * Unique indexes including `{ provider, tenant, foreign_id }`.
   * Chroma namespaces: `<provider>__<tenant>__messages`, `<provider>__<tenant>__attachments`.
$$
6. **Tests**
$$
   * Golden tests for envelopes/topics and normalized events.
   * Mocks for gateway, rest proxy, and policy.
   * CI grep rule to fail build if tokens appear outside access layer.

---

## Acceptance Criteria

* [ ] All pub/sub messages include `provider` and `tenant`.
* [ ] Topics follow: `promethean.p.<provider>.t.<tenant>.<area>.<name>`.
* [ ] Discord tokens exist **only** in `discord-gateway` and `discord-rest`.
* [ ] Workers run with **no Discord SDK** or tokens; interact via bus and shared effects.
* [ ] `SocialMessageCreated` emitted for live Discord messages and consumed by indexers/embedders.
* [ ] Replies flow through `PostMessage` → `discord-rest` (no direct SDK).
* [ ] Storage and Chroma partitioned by provider+tenant, with unique indexes.
* [ ] Policy blocks `provider.*` caps for non-access agents (tested).
* [ ] PM2 can start one or more tenants by changing `providers.yml` + env.
* [ ] CI fails if secrets are found outside access layer.

---

## Implementation Plan (sequenced, atomic commits)

### 1) Shared types & envelope

* Update `shared/ts/agent-envelope.ts`:

  * Add `provider: string`, `tenant: string`.
  * Bump **contract version**.
* Add `shared/ts/topic.ts`: `topic({provider,tenant,area,name})`.
* Add `shared/ts/events.ts`: `SocialMessageCreated`, `PostMessage`.
* Add `shared/ts/urn.ts`: URN helpers.
* Add `shared/ts/provider-registry.ts`: file-backed registry for `providers.yml`.
* Add `shared/ts/policy.ts`: capability types; enforce `provider.*` only for access agents.
* Add `shared/ts/effects.ts`: wrappers for mongo/chroma/http and **bus-based rest.request**.

**Tests:** unit tests for type guards, topic formatting, URN round-trip.

### 2) Providers config

* Create `providers.yml`:

  ```
  providers:
    - provider: discord
      tenant: duck
      credentials:
        bot_token: ${DISCORD_TOKEN_DUCK}
        app_id: "123..."
      allow:
        guilds: ["111111111111111111"]
        channels: ["*"]
      storage:
        mongo_db: "promethean_discord_duck"
        chroma_ns: "discord__duck"
  ```

* Add loader + schema validation (zod).

### 3) Discord access layer

* **discord-rest**:

  * Fastify service consuming `promethean.p.discord.t.<tenant>.rest.request`.
  * Global **bucket map** + `retry_after_ms` handling.
  * Emits `...rest.response` with `ok`, `status`, `bucket`, `retry_after_ms`.
  * Handles `PostMessage` command: map to `POST /channels/{id}/messages`.
* **discord-gateway**:

  * WS gateway with intents; normalize `MESSAGE_CREATE` into `SocialMessageCreated`.
  * Emit raw event topic **and** normalized event.
  * Health pings (seq, ping, shard).

**Tests:** simulate rate-limit, reconnect, normalized payload snapshot.

### 4) Domain workers refactor (tokenless)

* Replace Discord SDK calls with:

  * publish `rest.request` and await `rest.response` (corr id).
* Consume `SocialMessageCreated` instead of raw payloads where possible.
* Indexers upsert on `{ provider, tenant, foreign_id }`.
* Embedders write to `<provider>__<tenant>__*` collections.
* `cephalon-discord` produces `PostMessage` instead of calling SDK.

**Tests:** golden tests: event → DB upsert; text → PostMessage; attachment hashing.

### 5) Storage & embeddings

* Migrations:

  * Add compound unique indexes $`provider`,`tenant`,`foreign_id`$.
  * Rename/alias existing collections & chroma namespaces.
* Backfill jobs remain; now publish to `promethean.p.discord.t.<tenant>.jobs.backfill.messages.enqueue`.

**Tests:** verify uniqueness, namespace selection from tenant registry.

### 6) PM2 & env

* `ecosystem.discord.js` to spawn per-tenant access agents using `TENANTS` env or reading `providers.yml`.
* Ensure workers start once, access layer per tenant.

### 7) CI & lint rules

* Add secret-leak guard:

  * Grep for `DISCORD_TOKEN|CLIENT_SECRET|REFRESH_TOKEN` outside `services/ts/discord-*/` and `providers.yml`.
  * Fail build on matches.
* Type-check ensures all publishes include `provider`, `tenant`.

---

## File/Dir Changes (relative to repo root)

* `shared/ts/src/agent-envelope.ts` (update)
* `shared/ts/src/topic.ts` (new)
* `shared/ts/src/events.ts` (new)
* `shared/ts/src/urn.ts` (new)
* `shared/ts/src/provider-registry.ts` (new)
* `shared/ts/src/policy.ts` (new)
* `shared/ts/src/effects.ts` (new)
* `services/ts/discord-rest/` (new)
* `services/ts/discord-gateway/` (new)
* `services/ts/discord-message-indexer/` (refactor)
* `services/ts/discord-attachment-indexer/` (refactor)
* `services/ts/discord-message-embedder/` (refactor)
* `services/ts/attachment-embedder/` (refactor)
* `services/ts/cephalon-discord/` (refactor)
* `config/providers.yml` (new)
* `ecosystem.discord.js` (new)
* DB migrations: scripts under `scripts/migrate/2025-08-provider-tenant/`

---

## Test Plan

* **Unit:** shared helpers, topic, URN, policy checks.
* **Integration (mocked):** gateway emits normalized event → indexer upserts; cephalon publishes `PostMessage` → rest proxy receives correct route/body.
* **E2E (dev env):** run gateway against Discord test guild; verify:

  * live messages appear in `messages` $provider+tenant fields$
  * embeddings land in namespaced collections
  * replying via `PostMessage` posts in channel
* **Performance:** ensure rest proxy honors buckets; no 429 storm under backfill.

---

## Risks & Mitigations

* **Token leak** → CI grep + codeowners review on `providers.yml`.
* **Rate-limit regressions** → Bucket map with circuit breaker; exponential backoff.
* **Schema drift** → Versioned envelope; golden tests for normalized events.
* **Backfill overload** → Queue with max concurrency per tenant; sleep on `retry_after_ms`.

---

## Rollback Plan

* Keep old Discord worker processes & direct SDK code behind a feature flag `DISCORD_LEGACY=true`.
* Migration is reversible by switching topics back and disabling access layer.
* DB migrations add **new indexes and collections**; do **not** drop old until cutover verified.

---

## Milestones (suggested commits)

1. **M1:** Shared types + envelope + topics $+ tests$.
2. **M2:** Provider registry + providers.yml + policy gate.
3. **M3:** discord-rest proxy (green tests).
4. **M4:** discord-gateway normalizer (green tests).
5. **M5:** Refactor indexers/embedders → tokenless $unit + integration tests$.
6. **M6:** cephalon-discord → PostMessage path (integration test).
$$
7. **M7:** Schema migrations + embeddings namespaces.
$$
$$
8. **M8:** PM2 wiring + E2E on dev guild.
$$
$$
9. **M9:** CI secret guard + docs.
$$
---

## Definition of Done (DoD)

* No service outside `discord-*` has access to Discord tokens nor imports Discord SDK.
* **All** Discord traffic $in/out$ flows via the bus topics with `provider` and `tenant`.
* Normalized event & command types are documented and enforced in code.
* One additional tenant can be added by editing `providers.yml` and starting access layer—**no worker code changes**.
* Docs updated: `docs/agents.md`, `docs/providers.md`, `docs/topics.md`.

---

If Codex needs stubs, generate them; keep imports on **@shared/ts/dist/**. Prefer Zod for runtime validation. Keep tests deterministic; record sample Discord payloads as fixtures.

\#hashtags
\#promethean #codex-task #migration #multi-provider #multi-tenant #discord #access-layer #event-driven #policy #observability #typescript #broker #refactor
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore|Agent Tasks: Persistence Migration to DualStore]$
- $[promethean-native-config-design|Promethean-native config design]$
- $[chroma-toolkit-consolidation-plan|Chroma Toolkit Consolidation Plan]$
- $[per-domain-policy-system-for-js-crawler|Per-Domain Policy System for JS Crawler]$
- $[promethean-agent-config-dsl|Promethean Agent Config DSL]$
- $[sibilant-meta-prompt-dsl|Sibilant Meta-Prompt DSL]$
- [Promethean Event Bus MVP v0.1]$promethean-event-bus-mvp-v0-1.md$
- $[voice-access-layer-design|Voice Access Layer Design]$
- $[cross-target-macro-system-in-sibilant|Cross-Target Macro System in Sibilant]$
- $[js-to-lisp-reverse-compiler]$
- $[shared-package-structure|Shared Package Structure]$
- $[docs/unique/eidolon-field-math-foundations|eidolon-field-math-foundations]$
- $[shared-package-layout-clarification]$
- $[unique-info-dump-index|Unique Info Dump Index]$
- $[dynamic-context-model-for-web-components|Dynamic Context Model for Web Components]$
- $[prometheus-observability-stack|Prometheus Observability Stack]$
- $[model-selection-for-lightweight-conversational-tasks|Model Selection for Lightweight Conversational Tasks]$
- $[vectorial-exception-descent|Vectorial Exception Descent]$
- $[prom-lib-rate-limiters-and-replay-api]$
- $[cross-language-runtime-polymorphism|Cross-Language Runtime Polymorphism]$
- $[docs/unique/ecs-offload-workers|ecs-offload-workers]$
- $[ai-centric-os-with-mcp-layer|AI-Centric OS with MCP Layer]$
- $[board-walk-2025-08-11|Board Walk – 2025-08-11]$
- $[promethean-infrastructure-setup|Promethean Infrastructure Setup]$
- $[api-gateway-versioning]$
- $[eidolon-field-abstract-model|Eidolon Field Abstract Model]$
- $[exception-layer-analysis|Exception Layer Analysis]$
- $[docs/unique/event-bus-mvp|Event Bus MVP]$
- $[2d-sandbox-field]$
- $[docs/unique/aionian-circuit-math|aionian-circuit-math]$
- $Local-First Intention→Code Loop with Free Models$$local-first-intention-code-loop-with-free-models.md$
- $[promethean-agent-dsl-ts-scaffold|Promethean Agent DSL TS Scaffold]$
- $[docs/unique/field-interaction-equations|field-interaction-equations]$
- [[eidolonfield]]
- $[i3-bluetooth-setup]$
- [Math Fundamentals]$chunks/math-fundamentals.md$
- $[docs/unique/archetype-ecs|archetype-ecs]$
- [Diagrams]$chunks/diagrams.md$
- [DSL]$chunks/dsl.md$
- $[local-offline-model-deployment-strategy]$
- $[i3-config-validation-methods]$
- $[local-only-llm-workflow]$
- $[observability-infrastructure-setup]$
- $[promethean-full-stack-docker-setup|Promethean Full-Stack Docker Setup]$
- $[event-bus-projections-architecture|Event Bus Projections Architecture]$
- $[pure-node-crawl-stack-with-playwright-and-crawlee|Pure-Node Crawl Stack with Playwright and Crawlee]$
- $[post-linguistic-transhuman-design-frameworks|Post-Linguistic Transhuman Design Frameworks]$
- $[polymorphic-meta-programming-engine]$
- $[mongo-outbox-implementation|Mongo Outbox Implementation]$
- $[language-agnostic-mirror-system|Language-Agnostic Mirror System]$
- $[docs/unique/interop-and-source-maps|Interop and Source Maps]$
- $[docs/unique/template-based-compilation|template-based-compilation]$
- $[prompt-folder-bootstrap|Prompt_Folder_Bootstrap]$
- $[polyglot-repl-interface-layer]$
- $[sibilant-macro-targets]$
- $[sibilant-meta-string-templating-runtime]$
- $[docs/unique/universal-lisp-interface|Universal Lisp Interface]$

## Sources
- $[per-domain-policy-system-for-js-crawler#L115|Per-Domain Policy System for JS Crawler — L115]$ (line 115, col 1, score 0.93)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L8|Agent Tasks: Persistence Migration to DualStore — L8]$ (line 8, col 3, score 0.9)
- $[promethean-native-config-design#L39|Promethean-native config design — L39]$ (line 39, col 1, score 0.98)
- $[promethean-native-config-design#L39|Promethean-native config design — L39]$ (line 39, col 3, score 0.98)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L47|Agent Tasks: Persistence Migration to DualStore — L47]$ (line 47, col 3, score 0.98)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L47|Agent Tasks: Persistence Migration to DualStore — L47]$ (line 47, col 5, score 0.98)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L48|Agent Tasks: Persistence Migration to DualStore — L48]$ (line 48, col 3, score 0.98)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L48|Agent Tasks: Persistence Migration to DualStore — L48]$ (line 48, col 5, score 0.98)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L49|Agent Tasks: Persistence Migration to DualStore — L49]$ (line 49, col 3, score 0.98)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L49|Agent Tasks: Persistence Migration to DualStore — L49]$ (line 49, col 5, score 0.98)
- $[chroma-toolkit-consolidation-plan#L12|Chroma Toolkit Consolidation Plan — L12]$ (line 12, col 1, score 0.92)
- $[chroma-toolkit-consolidation-plan#L12|Chroma Toolkit Consolidation Plan — L12]$ (line 12, col 5, score 0.92)
- $[sibilant-meta-prompt-dsl#L158|Sibilant Meta-Prompt DSL — L158]$ (line 158, col 1, score 0.89)
- $[sibilant-meta-prompt-dsl#L158|Sibilant Meta-Prompt DSL — L158]$ (line 158, col 3, score 0.89)
- [Promethean Event Bus MVP v0.1 — L100]$promethean-event-bus-mvp-v0-1.md#L100$ (line 100, col 5, score 0.86)
- [Promethean Event Bus MVP v0.1 — L100]$promethean-event-bus-mvp-v0-1.md#L100$ (line 100, col 7, score 0.86)
- $[chroma-toolkit-consolidation-plan#L6|Chroma Toolkit Consolidation Plan — L6]$ (line 6, col 1, score 0.94)
- $[chroma-toolkit-consolidation-plan#L6|Chroma Toolkit Consolidation Plan — L6]$ (line 6, col 5, score 0.94)
- $[promethean-agent-config-dsl#L143|Promethean Agent Config DSL — L143]$ (line 143, col 1, score 0.91)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L120|Agent Tasks: Persistence Migration to DualStore — L120]$ (line 120, col 1, score 0.88)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L120|Agent Tasks: Persistence Migration to DualStore — L120]$ (line 120, col 3, score 0.88)
- $[voice-access-layer-design#L302|Voice Access Layer Design — L302]$ (line 302, col 1, score 0.86)
- $[chroma-toolkit-consolidation-plan#L173|Chroma Toolkit Consolidation Plan — L173]$ (line 173, col 1, score 1)
- $[chroma-toolkit-consolidation-plan#L173|Chroma Toolkit Consolidation Plan — L173]$ (line 173, col 3, score 1)
- $[docs/unique/eidolon-field-math-foundations#L133|eidolon-field-math-foundations — L133]$ (line 133, col 1, score 1)
- $[docs/unique/eidolon-field-math-foundations#L133|eidolon-field-math-foundations — L133]$ (line 133, col 3, score 1)
- $[per-domain-policy-system-for-js-crawler#L472|Per-Domain Policy System for JS Crawler — L472]$ (line 472, col 1, score 1)
- $[per-domain-policy-system-for-js-crawler#L472|Per-Domain Policy System for JS Crawler — L472]$ (line 472, col 3, score 1)
- $[prom-lib-rate-limiters-and-replay-api#L390|prom-lib-rate-limiters-and-replay-api — L390]$ (line 390, col 1, score 1)
- $[prom-lib-rate-limiters-and-replay-api#L390|prom-lib-rate-limiters-and-replay-api — L390]$ (line 390, col 3, score 1)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L130|Agent Tasks: Persistence Migration to DualStore — L130]$ (line 130, col 1, score 1)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L130|Agent Tasks: Persistence Migration to DualStore — L130]$ (line 130, col 3, score 1)
- $[docs/unique/aionian-circuit-math#L159|aionian-circuit-math — L159]$ (line 159, col 1, score 1)
- $[docs/unique/aionian-circuit-math#L159|aionian-circuit-math — L159]$ (line 159, col 3, score 1)
- $[board-walk-2025-08-11#L134|Board Walk – 2025-08-11 — L134]$ (line 134, col 1, score 1)
- $[board-walk-2025-08-11#L134|Board Walk – 2025-08-11 — L134]$ (line 134, col 3, score 1)
- $[chroma-toolkit-consolidation-plan#L168|Chroma Toolkit Consolidation Plan — L168]$ (line 168, col 1, score 1)
- $[chroma-toolkit-consolidation-plan#L168|Chroma Toolkit Consolidation Plan — L168]$ (line 168, col 3, score 1)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L134|Agent Tasks: Persistence Migration to DualStore — L134]$ (line 134, col 1, score 1)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L134|Agent Tasks: Persistence Migration to DualStore — L134]$ (line 134, col 3, score 1)
- $[docs/unique/aionian-circuit-math#L156|aionian-circuit-math — L156]$ (line 156, col 1, score 1)
- $[docs/unique/aionian-circuit-math#L156|aionian-circuit-math — L156]$ (line 156, col 3, score 1)
- $[board-walk-2025-08-11#L136|Board Walk – 2025-08-11 — L136]$ (line 136, col 1, score 1)
- $[board-walk-2025-08-11#L136|Board Walk – 2025-08-11 — L136]$ (line 136, col 3, score 1)
- $[dynamic-context-model-for-web-components#L386|Dynamic Context Model for Web Components — L386]$ (line 386, col 1, score 1)
- $[dynamic-context-model-for-web-components#L386|Dynamic Context Model for Web Components — L386]$ (line 386, col 3, score 1)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L132|Agent Tasks: Persistence Migration to DualStore — L132]$ (line 132, col 1, score 1)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L132|Agent Tasks: Persistence Migration to DualStore — L132]$ (line 132, col 3, score 1)
- $[docs/unique/eidolon-field-math-foundations#L136|eidolon-field-math-foundations — L136]$ (line 136, col 1, score 1)
- $[docs/unique/eidolon-field-math-foundations#L136|eidolon-field-math-foundations — L136]$ (line 136, col 3, score 1)
- $[promethean-infrastructure-setup#L582|Promethean Infrastructure Setup — L582]$ (line 582, col 1, score 1)
- $[promethean-infrastructure-setup#L582|Promethean Infrastructure Setup — L582]$ (line 582, col 3, score 1)
- $[pure-node-crawl-stack-with-playwright-and-crawlee#L425|Pure-Node Crawl Stack with Playwright and Crawlee — L425]$ (line 425, col 1, score 1)
- $[pure-node-crawl-stack-with-playwright-and-crawlee#L425|Pure-Node Crawl Stack with Playwright and Crawlee — L425]$ (line 425, col 3, score 1)
- $[ai-centric-os-with-mcp-layer#L402|AI-Centric OS with MCP Layer — L402]$ (line 402, col 1, score 1)
- $[ai-centric-os-with-mcp-layer#L402|AI-Centric OS with MCP Layer — L402]$ (line 402, col 3, score 1)
- $[cross-target-macro-system-in-sibilant#L169|Cross-Target Macro System in Sibilant — L169]$ (line 169, col 1, score 1)
- $[cross-target-macro-system-in-sibilant#L169|Cross-Target Macro System in Sibilant — L169]$ (line 169, col 3, score 1)
- $[dynamic-context-model-for-web-components#L387|Dynamic Context Model for Web Components — L387]$ (line 387, col 1, score 1)
- $[dynamic-context-model-for-web-components#L387|Dynamic Context Model for Web Components — L387]$ (line 387, col 3, score 1)
- $[js-to-lisp-reverse-compiler#L410|js-to-lisp-reverse-compiler — L410]$ (line 410, col 1, score 1)
- $[js-to-lisp-reverse-compiler#L410|js-to-lisp-reverse-compiler — L410]$ (line 410, col 3, score 1)
- $[chroma-toolkit-consolidation-plan#L172|Chroma Toolkit Consolidation Plan — L172]$ (line 172, col 1, score 1)
- $[chroma-toolkit-consolidation-plan#L172|Chroma Toolkit Consolidation Plan — L172]$ (line 172, col 3, score 1)
- $[cross-language-runtime-polymorphism#L201|Cross-Language Runtime Polymorphism — L201]$ (line 201, col 1, score 1)
- $[cross-language-runtime-polymorphism#L201|Cross-Language Runtime Polymorphism — L201]$ (line 201, col 3, score 1)
- $[cross-target-macro-system-in-sibilant#L178|Cross-Target Macro System in Sibilant — L178]$ (line 178, col 1, score 1)
- $[cross-target-macro-system-in-sibilant#L178|Cross-Target Macro System in Sibilant — L178]$ (line 178, col 3, score 1)
- [[eidolonfield#L251|EidolonField — L251]] (line 251, col 1, score 1)
- [[eidolonfield#L251|EidolonField — L251]] (line 251, col 3, score 1)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L137|Agent Tasks: Persistence Migration to DualStore — L137]$ (line 137, col 1, score 1)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L137|Agent Tasks: Persistence Migration to DualStore — L137]$ (line 137, col 3, score 1)
- $[chroma-toolkit-consolidation-plan#L175|Chroma Toolkit Consolidation Plan — L175]$ (line 175, col 1, score 1)
- $[chroma-toolkit-consolidation-plan#L175|Chroma Toolkit Consolidation Plan — L175]$ (line 175, col 3, score 1)
- $[docs/unique/event-bus-mvp#L547|Event Bus MVP — L547]$ (line 547, col 1, score 1)
- $[docs/unique/event-bus-mvp#L547|Event Bus MVP — L547]$ (line 547, col 3, score 1)
- $[event-bus-projections-architecture#L150|Event Bus Projections Architecture — L150]$ (line 150, col 1, score 1)
- $[event-bus-projections-architecture#L150|Event Bus Projections Architecture — L150]$ (line 150, col 3, score 1)
- $[docs/unique/event-bus-mvp#L552|Event Bus MVP — L552]$ (line 552, col 1, score 1)
- $[docs/unique/event-bus-mvp#L552|Event Bus MVP — L552]$ (line 552, col 3, score 1)
- $[i3-bluetooth-setup#L104|i3-bluetooth-setup — L104]$ (line 104, col 1, score 1)
- $[i3-bluetooth-setup#L104|i3-bluetooth-setup — L104]$ (line 104, col 3, score 1)
- $Local-First Intention→Code Loop with Free Models — L144$$local-first-intention-code-loop-with-free-models.md#L144$ (line 144, col 1, score 1)
- $Local-First Intention→Code Loop with Free Models — L144$$local-first-intention-code-loop-with-free-models.md#L144$ (line 144, col 3, score 1)
- [Promethean Event Bus MVP v0.1 — L893]$promethean-event-bus-mvp-v0-1.md#L893$ (line 893, col 1, score 1)
- [Promethean Event Bus MVP v0.1 — L893]$promethean-event-bus-mvp-v0-1.md#L893$ (line 893, col 3, score 1)
- $[cross-language-runtime-polymorphism#L206|Cross-Language Runtime Polymorphism — L206]$ (line 206, col 1, score 1)
- $[cross-language-runtime-polymorphism#L206|Cross-Language Runtime Polymorphism — L206]$ (line 206, col 3, score 1)
- $[dynamic-context-model-for-web-components#L393|Dynamic Context Model for Web Components — L393]$ (line 393, col 1, score 1)
- $[dynamic-context-model-for-web-components#L393|Dynamic Context Model for Web Components — L393]$ (line 393, col 3, score 1)
- $[docs/unique/field-interaction-equations#L158|field-interaction-equations — L158]$ (line 158, col 1, score 1)
- $[docs/unique/field-interaction-equations#L158|field-interaction-equations — L158]$ (line 158, col 3, score 1)
- $[js-to-lisp-reverse-compiler#L417|js-to-lisp-reverse-compiler — L417]$ (line 417, col 1, score 1)
- $[js-to-lisp-reverse-compiler#L417|js-to-lisp-reverse-compiler — L417]$ (line 417, col 3, score 1)
- $[cross-target-macro-system-in-sibilant#L179|Cross-Target Macro System in Sibilant — L179]$ (line 179, col 1, score 1)
- $[cross-target-macro-system-in-sibilant#L179|Cross-Target Macro System in Sibilant — L179]$ (line 179, col 3, score 1)
- $[dynamic-context-model-for-web-components#L389|Dynamic Context Model for Web Components — L389]$ (line 389, col 1, score 1)
- $[dynamic-context-model-for-web-components#L389|Dynamic Context Model for Web Components — L389]$ (line 389, col 3, score 1)
- $[docs/unique/interop-and-source-maps#L522|Interop and Source Maps — L522]$ (line 522, col 1, score 1)
- $[docs/unique/interop-and-source-maps#L522|Interop and Source Maps — L522]$ (line 522, col 3, score 1)
- $[language-agnostic-mirror-system#L533|Language-Agnostic Mirror System — L533]$ (line 533, col 1, score 1)
- $[language-agnostic-mirror-system#L533|Language-Agnostic Mirror System — L533]$ (line 533, col 3, score 1)
- $[promethean-agent-dsl-ts-scaffold#L832|Promethean Agent DSL TS Scaffold — L832]$ (line 832, col 1, score 1)
- $[promethean-agent-dsl-ts-scaffold#L832|Promethean Agent DSL TS Scaffold — L832]$ (line 832, col 3, score 1)
- $[promethean-infrastructure-setup#L581|Promethean Infrastructure Setup — L581]$ (line 581, col 1, score 1)
- $[promethean-infrastructure-setup#L581|Promethean Infrastructure Setup — L581]$ (line 581, col 3, score 1)
- $[shared-package-layout-clarification#L166|shared-package-layout-clarification — L166]$ (line 166, col 1, score 1)
- $[shared-package-layout-clarification#L166|shared-package-layout-clarification — L166]$ (line 166, col 3, score 1)
- $[voice-access-layer-design#L307|Voice Access Layer Design — L307]$ (line 307, col 1, score 1)
- $[voice-access-layer-design#L307|Voice Access Layer Design — L307]$ (line 307, col 3, score 1)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L133|Agent Tasks: Persistence Migration to DualStore — L133]$ (line 133, col 1, score 1)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L133|Agent Tasks: Persistence Migration to DualStore — L133]$ (line 133, col 3, score 1)
- $[docs/unique/aionian-circuit-math#L151|aionian-circuit-math — L151]$ (line 151, col 1, score 1)
- $[docs/unique/aionian-circuit-math#L151|aionian-circuit-math — L151]$ (line 151, col 3, score 1)
- [Math Fundamentals — L14]$chunks/math-fundamentals.md#L14$ (line 14, col 1, score 1)
- [Math Fundamentals — L14]$chunks/math-fundamentals.md#L14$ (line 14, col 3, score 1)
- $[docs/unique/ecs-offload-workers#L460|ecs-offload-workers — L460]$ (line 460, col 1, score 1)
- $[docs/unique/ecs-offload-workers#L460|ecs-offload-workers — L460]$ (line 460, col 3, score 1)
- $[i3-config-validation-methods#L55|i3-config-validation-methods — L55]$ (line 55, col 1, score 1)
- $[i3-config-validation-methods#L55|i3-config-validation-methods — L55]$ (line 55, col 3, score 1)
- $[local-only-llm-workflow#L182|Local-Only-LLM-Workflow — L182]$ (line 182, col 1, score 1)
- $[local-only-llm-workflow#L182|Local-Only-LLM-Workflow — L182]$ (line 182, col 3, score 1)
- $[post-linguistic-transhuman-design-frameworks#L91|Post-Linguistic Transhuman Design Frameworks — L91]$ (line 91, col 1, score 1)
- $[post-linguistic-transhuman-design-frameworks#L91|Post-Linguistic Transhuman Design Frameworks — L91]$ (line 91, col 3, score 1)
- $[promethean-infrastructure-setup#L576|Promethean Infrastructure Setup — L576]$ (line 576, col 1, score 1)
- $[promethean-infrastructure-setup#L576|Promethean Infrastructure Setup — L576]$ (line 576, col 3, score 1)
- $[docs/unique/aionian-circuit-math#L158|aionian-circuit-math — L158]$ (line 158, col 1, score 1)
- $[docs/unique/aionian-circuit-math#L158|aionian-circuit-math — L158]$ (line 158, col 3, score 1)
- $[docs/unique/archetype-ecs#L457|archetype-ecs — L457]$ (line 457, col 1, score 1)
- $[docs/unique/archetype-ecs#L457|archetype-ecs — L457]$ (line 457, col 3, score 1)
- [Diagrams — L9]$chunks/diagrams.md#L9$ (line 9, col 1, score 1)
- [Diagrams — L9]$chunks/diagrams.md#L9$ (line 9, col 3, score 1)
- [DSL — L10]$chunks/dsl.md#L10$ (line 10, col 1, score 1)
- [DSL — L10]$chunks/dsl.md#L10$ (line 10, col 3, score 1)
- $[api-gateway-versioning#L285|api-gateway-versioning — L285]$ (line 285, col 1, score 1)
- $[api-gateway-versioning#L285|api-gateway-versioning — L285]$ (line 285, col 3, score 1)
- $[board-walk-2025-08-11#L135|Board Walk – 2025-08-11 — L135]$ (line 135, col 1, score 1)
- $[board-walk-2025-08-11#L135|Board Walk – 2025-08-11 — L135]$ (line 135, col 3, score 1)
- $[chroma-toolkit-consolidation-plan#L167|Chroma Toolkit Consolidation Plan — L167]$ (line 167, col 1, score 1)
- $[chroma-toolkit-consolidation-plan#L167|Chroma Toolkit Consolidation Plan — L167]$ (line 167, col 3, score 1)
- $[cross-target-macro-system-in-sibilant#L180|Cross-Target Macro System in Sibilant — L180]$ (line 180, col 1, score 1)
- $[cross-target-macro-system-in-sibilant#L180|Cross-Target Macro System in Sibilant — L180]$ (line 180, col 3, score 1)
- $[ai-centric-os-with-mcp-layer#L403|AI-Centric OS with MCP Layer — L403]$ (line 403, col 1, score 1)
- $[ai-centric-os-with-mcp-layer#L403|AI-Centric OS with MCP Layer — L403]$ (line 403, col 3, score 1)
- $[local-offline-model-deployment-strategy#L293|Local-Offline-Model-Deployment-Strategy — L293]$ (line 293, col 1, score 1)
- $[local-offline-model-deployment-strategy#L293|Local-Offline-Model-Deployment-Strategy — L293]$ (line 293, col 3, score 1)
- $[observability-infrastructure-setup#L361|observability-infrastructure-setup — L361]$ (line 361, col 1, score 1)
- $[observability-infrastructure-setup#L361|observability-infrastructure-setup — L361]$ (line 361, col 3, score 1)
- $[promethean-full-stack-docker-setup#L439|Promethean Full-Stack Docker Setup — L439]$ (line 439, col 1, score 1)
- $[promethean-full-stack-docker-setup#L439|Promethean Full-Stack Docker Setup — L439]$ (line 439, col 3, score 1)
- $[chroma-toolkit-consolidation-plan#L174|Chroma Toolkit Consolidation Plan — L174]$ (line 174, col 1, score 1)
- $[chroma-toolkit-consolidation-plan#L174|Chroma Toolkit Consolidation Plan — L174]$ (line 174, col 3, score 1)
- $[i3-bluetooth-setup#L105|i3-bluetooth-setup — L105]$ (line 105, col 1, score 1)
- $[i3-bluetooth-setup#L105|i3-bluetooth-setup — L105]$ (line 105, col 3, score 1)
- $[polymorphic-meta-programming-engine#L206|polymorphic-meta-programming-engine — L206]$ (line 206, col 1, score 1)
- $[polymorphic-meta-programming-engine#L206|polymorphic-meta-programming-engine — L206]$ (line 206, col 3, score 1)
- $[2d-sandbox-field#L195|2d-sandbox-field — L195]$ (line 195, col 1, score 1)
- $[2d-sandbox-field#L195|2d-sandbox-field — L195]$ (line 195, col 3, score 1)
- $[eidolon-field-abstract-model#L192|Eidolon Field Abstract Model — L192]$ (line 192, col 1, score 1)
- $[eidolon-field-abstract-model#L192|Eidolon Field Abstract Model — L192]$ (line 192, col 3, score 1)
- [[eidolonfield#L244|EidolonField — L244]] (line 244, col 1, score 1)
- [[eidolonfield#L244|EidolonField — L244]] (line 244, col 3, score 1)
- $[exception-layer-analysis#L147|Exception Layer Analysis — L147]$ (line 147, col 1, score 1)
- $[exception-layer-analysis#L147|Exception Layer Analysis — L147]$ (line 147, col 3, score 1)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L136|Agent Tasks: Persistence Migration to DualStore — L136]$ (line 136, col 1, score 1)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L136|Agent Tasks: Persistence Migration to DualStore — L136]$ (line 136, col 3, score 1)
- $[chroma-toolkit-consolidation-plan#L166|Chroma Toolkit Consolidation Plan — L166]$ (line 166, col 1, score 1)
- $[chroma-toolkit-consolidation-plan#L166|Chroma Toolkit Consolidation Plan — L166]$ (line 166, col 3, score 1)
- $[docs/unique/event-bus-mvp#L551|Event Bus MVP — L551]$ (line 551, col 1, score 1)
- $[docs/unique/event-bus-mvp#L551|Event Bus MVP — L551]$ (line 551, col 3, score 1)
- $[mongo-outbox-implementation#L555|Mongo Outbox Implementation — L555]$ (line 555, col 1, score 1)
- $[mongo-outbox-implementation#L555|Mongo Outbox Implementation — L555]$ (line 555, col 3, score 1)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L140|Agent Tasks: Persistence Migration to DualStore — L140]$ (line 140, col 1, score 1)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L140|Agent Tasks: Persistence Migration to DualStore — L140]$ (line 140, col 3, score 1)
- $[promethean-infrastructure-setup#L598|Promethean Infrastructure Setup — L598]$ (line 598, col 1, score 1)
- $[promethean-infrastructure-setup#L598|Promethean Infrastructure Setup — L598]$ (line 598, col 3, score 1)
- $[pure-node-crawl-stack-with-playwright-and-crawlee#L435|Pure-Node Crawl Stack with Playwright and Crawlee — L435]$ (line 435, col 1, score 0.99)
- $[pure-node-crawl-stack-with-playwright-and-crawlee#L435|Pure-Node Crawl Stack with Playwright and Crawlee — L435]$ (line 435, col 3, score 0.99)
- $[pure-node-crawl-stack-with-playwright-and-crawlee#L433|Pure-Node Crawl Stack with Playwright and Crawlee — L433]$ (line 433, col 1, score 0.99)
- $[pure-node-crawl-stack-with-playwright-and-crawlee#L433|Pure-Node Crawl Stack with Playwright and Crawlee — L433]$ (line 433, col 3, score 0.99)
- $[per-domain-policy-system-for-js-crawler#L478|Per-Domain Policy System for JS Crawler — L478]$ (line 478, col 1, score 1)
- $[per-domain-policy-system-for-js-crawler#L478|Per-Domain Policy System for JS Crawler — L478]$ (line 478, col 3, score 1)
- $[docs/unique/eidolon-field-math-foundations#L159|eidolon-field-math-foundations — L159]$ (line 159, col 1, score 1)
- $[docs/unique/eidolon-field-math-foundations#L159|eidolon-field-math-foundations — L159]$ (line 159, col 3, score 1)
- $[promethean-native-config-design#L409|Promethean-native config design — L409]$ (line 409, col 1, score 1)
- $[promethean-native-config-design#L409|Promethean-native config design — L409]$ (line 409, col 3, score 1)
- $[promethean-native-config-design#L407|Promethean-native config design — L407]$ (line 407, col 1, score 0.99)
- $[promethean-native-config-design#L407|Promethean-native config design — L407]$ (line 407, col 3, score 0.99)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L154|Agent Tasks: Persistence Migration to DualStore — L154]$ (line 154, col 1, score 0.99)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L154|Agent Tasks: Persistence Migration to DualStore — L154]$ (line 154, col 3, score 0.99)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L156|Agent Tasks: Persistence Migration to DualStore — L156]$ (line 156, col 1, score 0.99)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L156|Agent Tasks: Persistence Migration to DualStore — L156]$ (line 156, col 3, score 0.99)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L155|Agent Tasks: Persistence Migration to DualStore — L155]$ (line 155, col 1, score 0.99)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L155|Agent Tasks: Persistence Migration to DualStore — L155]$ (line 155, col 3, score 0.99)
- $[chroma-toolkit-consolidation-plan#L184|Chroma Toolkit Consolidation Plan — L184]$ (line 184, col 1, score 0.99)
- $[chroma-toolkit-consolidation-plan#L184|Chroma Toolkit Consolidation Plan — L184]$ (line 184, col 3, score 0.99)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L157|Agent Tasks: Persistence Migration to DualStore — L157]$ (line 157, col 1, score 0.99)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L157|Agent Tasks: Persistence Migration to DualStore — L157]$ (line 157, col 3, score 0.99)
- $[chroma-toolkit-consolidation-plan#L185|Chroma Toolkit Consolidation Plan — L185]$ (line 185, col 1, score 0.99)
- $[chroma-toolkit-consolidation-plan#L185|Chroma Toolkit Consolidation Plan — L185]$ (line 185, col 3, score 0.99)
- $[promethean-native-config-design#L405|Promethean-native config design — L405]$ (line 405, col 1, score 1)
- $[promethean-native-config-design#L405|Promethean-native config design — L405]$ (line 405, col 3, score 1)
- $[promethean-native-config-design#L408|Promethean-native config design — L408]$ (line 408, col 1, score 1)
- $[promethean-native-config-design#L408|Promethean-native config design — L408]$ (line 408, col 3, score 1)
- $[promethean-native-config-design#L406|Promethean-native config design — L406]$ (line 406, col 1, score 1)
- $[promethean-native-config-design#L406|Promethean-native config design — L406]$ (line 406, col 3, score 1)
- $[promethean-native-config-design#L410|Promethean-native config design — L410]$ (line 410, col 1, score 1)
- $[promethean-native-config-design#L410|Promethean-native config design — L410]$ (line 410, col 3, score 1)
- $[sibilant-meta-prompt-dsl#L216|Sibilant Meta-Prompt DSL — L216]$ (line 216, col 1, score 1)
- $[sibilant-meta-prompt-dsl#L216|Sibilant Meta-Prompt DSL — L216]$ (line 216, col 3, score 1)
- $[sibilant-meta-prompt-dsl#L217|Sibilant Meta-Prompt DSL — L217]$ (line 217, col 1, score 0.99)
- $[sibilant-meta-prompt-dsl#L217|Sibilant Meta-Prompt DSL — L217]$ (line 217, col 3, score 0.99)
- $[model-selection-for-lightweight-conversational-tasks#L142|Model Selection for Lightweight Conversational Tasks — L142]$ (line 142, col 1, score 0.99)
- $[model-selection-for-lightweight-conversational-tasks#L142|Model Selection for Lightweight Conversational Tasks — L142]$ (line 142, col 3, score 0.99)
- $[prom-lib-rate-limiters-and-replay-api#L401|prom-lib-rate-limiters-and-replay-api — L401]$ (line 401, col 1, score 0.99)
- $[prom-lib-rate-limiters-and-replay-api#L401|prom-lib-rate-limiters-and-replay-api — L401]$ (line 401, col 3, score 0.99)
- $[prompt-folder-bootstrap#L195|Prompt_Folder_Bootstrap — L195]$ (line 195, col 1, score 0.99)
- $[prompt-folder-bootstrap#L195|Prompt_Folder_Bootstrap — L195]$ (line 195, col 3, score 0.99)
- $[chroma-toolkit-consolidation-plan#L182|Chroma Toolkit Consolidation Plan — L182]$ (line 182, col 1, score 1)
- $[chroma-toolkit-consolidation-plan#L182|Chroma Toolkit Consolidation Plan — L182]$ (line 182, col 3, score 1)
- $[chroma-toolkit-consolidation-plan#L183|Chroma Toolkit Consolidation Plan — L183]$ (line 183, col 1, score 0.99)
- $[chroma-toolkit-consolidation-plan#L183|Chroma Toolkit Consolidation Plan — L183]$ (line 183, col 3, score 0.99)
- $[polyglot-repl-interface-layer#L170|polyglot-repl-interface-layer — L170]$ (line 170, col 1, score 0.99)
- $[polyglot-repl-interface-layer#L170|polyglot-repl-interface-layer — L170]$ (line 170, col 3, score 0.99)
- $[sibilant-macro-targets#L181|sibilant-macro-targets — L181]$ (line 181, col 1, score 0.99)
- $[sibilant-macro-targets#L181|sibilant-macro-targets — L181]$ (line 181, col 3, score 0.99)
- $[sibilant-meta-string-templating-runtime#L132|sibilant-meta-string-templating-runtime — L132]$ (line 132, col 1, score 0.99)
- $[sibilant-meta-string-templating-runtime#L132|sibilant-meta-string-templating-runtime — L132]$ (line 132, col 3, score 0.99)
- $[unique-info-dump-index#L110|Unique Info Dump Index — L110]$ (line 110, col 1, score 1)
- $[unique-info-dump-index#L110|Unique Info Dump Index — L110]$ (line 110, col 3, score 1)
- $[prompt-folder-bootstrap#L197|Prompt_Folder_Bootstrap — L197]$ (line 197, col 1, score 0.99)
- $[prompt-folder-bootstrap#L197|Prompt_Folder_Bootstrap — L197]$ (line 197, col 3, score 0.99)
- $[prom-lib-rate-limiters-and-replay-api#L399|prom-lib-rate-limiters-and-replay-api — L399]$ (line 399, col 1, score 0.99)
- $[prom-lib-rate-limiters-and-replay-api#L399|prom-lib-rate-limiters-and-replay-api — L399]$ (line 399, col 3, score 0.99)
- $[unique-info-dump-index#L112|Unique Info Dump Index — L112]$ (line 112, col 1, score 0.99)
- $[unique-info-dump-index#L112|Unique Info Dump Index — L112]$ (line 112, col 3, score 0.99)
- $[unique-info-dump-index#L111|Unique Info Dump Index — L111]$ (line 111, col 1, score 1)
- $[unique-info-dump-index#L111|Unique Info Dump Index — L111]$ (line 111, col 3, score 1)
- $[prompt-folder-bootstrap#L198|Prompt_Folder_Bootstrap — L198]$ (line 198, col 1, score 0.99)
- $[prompt-folder-bootstrap#L198|Prompt_Folder_Bootstrap — L198]$ (line 198, col 3, score 0.99)
- $[prom-lib-rate-limiters-and-replay-api#L400|prom-lib-rate-limiters-and-replay-api — L400]$ (line 400, col 1, score 0.99)
- $[prom-lib-rate-limiters-and-replay-api#L400|prom-lib-rate-limiters-and-replay-api — L400]$ (line 400, col 3, score 0.99)
- $[unique-info-dump-index#L113|Unique Info Dump Index — L113]$ (line 113, col 1, score 0.99)
- $[unique-info-dump-index#L113|Unique Info Dump Index — L113]$ (line 113, col 3, score 0.99)
- $[docs/unique/template-based-compilation#L126|template-based-compilation — L126]$ (line 126, col 1, score 0.99)
- $[docs/unique/template-based-compilation#L126|template-based-compilation — L126]$ (line 126, col 3, score 0.99)
- $[voice-access-layer-design#L322|Voice Access Layer Design — L322]$ (line 322, col 1, score 0.99)
- $[voice-access-layer-design#L322|Voice Access Layer Design — L322]$ (line 322, col 3, score 0.99)
- $[sibilant-meta-prompt-dsl#L203|Sibilant Meta-Prompt DSL — L203]$ (line 203, col 1, score 0.99)
- $[sibilant-meta-prompt-dsl#L203|Sibilant Meta-Prompt DSL — L203]$ (line 203, col 3, score 0.99)
- $[sibilant-meta-prompt-dsl#L202|Sibilant Meta-Prompt DSL — L202]$ (line 202, col 1, score 0.99)
- $[sibilant-meta-prompt-dsl#L202|Sibilant Meta-Prompt DSL — L202]$ (line 202, col 3, score 0.99)
- $[dynamic-context-model-for-web-components#L405|Dynamic Context Model for Web Components — L405]$ (line 405, col 1, score 1)
- $[dynamic-context-model-for-web-components#L405|Dynamic Context Model for Web Components — L405]$ (line 405, col 3, score 1)
- $[promethean-native-config-design#L398|Promethean-native config design — L398]$ (line 398, col 1, score 1)
- $[promethean-native-config-design#L398|Promethean-native config design — L398]$ (line 398, col 3, score 1)
- $[dynamic-context-model-for-web-components#L397|Dynamic Context Model for Web Components — L397]$ (line 397, col 1, score 1)
- $[dynamic-context-model-for-web-components#L397|Dynamic Context Model for Web Components — L397]$ (line 397, col 3, score 1)
- $[cross-target-macro-system-in-sibilant#L188|Cross-Target Macro System in Sibilant — L188]$ (line 188, col 1, score 1)
- $[cross-target-macro-system-in-sibilant#L188|Cross-Target Macro System in Sibilant — L188]$ (line 188, col 3, score 1)
- $[js-to-lisp-reverse-compiler#L428|js-to-lisp-reverse-compiler — L428]$ (line 428, col 1, score 1)
- $[js-to-lisp-reverse-compiler#L428|js-to-lisp-reverse-compiler — L428]$ (line 428, col 3, score 1)
- $[vectorial-exception-descent#L171|Vectorial Exception Descent — L171]$ (line 171, col 1, score 0.98)
- $[vectorial-exception-descent#L171|Vectorial Exception Descent — L171]$ (line 171, col 3, score 0.98)
- $[docs/unique/universal-lisp-interface#L213|Universal Lisp Interface — L213]$ (line 213, col 1, score 0.98)
- $[docs/unique/universal-lisp-interface#L213|Universal Lisp Interface — L213]$ (line 213, col 3, score 0.98)
- $[vectorial-exception-descent#L168|Vectorial Exception Descent — L168]$ (line 168, col 1, score 0.98)
- $[vectorial-exception-descent#L168|Vectorial Exception Descent — L168]$ (line 168, col 3, score 0.98)
- $[vectorial-exception-descent#L167|Vectorial Exception Descent — L167]$ (line 167, col 1, score 0.98)
- $[vectorial-exception-descent#L167|Vectorial Exception Descent — L167]$ (line 167, col 3, score 0.98)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
