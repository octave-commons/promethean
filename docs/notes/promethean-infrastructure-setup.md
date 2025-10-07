---
```
uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
```
```
created_at: 2025.08.31.12.08.28.md
```
filename: Promethean Infrastructure Setup
```
description: >-
```
  Configures a production-grade infrastructure using Docker Compose with NGINX,
  Ollama, Qdrant, and Tor/Privoxy for secure, JS/TS-only services. All services
  are containerized with minimal dependencies and hidden behind NGINX.
tags:
  - Docker
  - NGINX
  - Ollama
  - Qdrant
  - Tor
  - Privoxy
  - TS
  - API
  - Crawler
  - Embeddings
```
related_to_title:
```
  - api-gateway-versioning
  - Dynamic Context Model for Web Components
  - ecs-offload-workers
  - ecs-scheduler-and-prefabs
  - System Scheduler with Resource-Aware DAG
  - markdown-to-org-transpiler
  - Ollama-LLM-Provider-for-Pseudo-Code-Transpiler
  - observability-infrastructure-setup
  - shared-package-layout-clarification
  - eidolon-field-math-foundations
  - RAG UI Panel with Qdrant and PostgREST
  - Local-Only-LLM-Workflow
  - Pure-Node Crawl Stack with Playwright and Crawlee
  - Shared Package Structure
  - Per-Domain Policy System for JS Crawler
  - Chroma Toolkit Consolidation Plan
  - Pure TypeScript Search Microservice
  - Promethean Web UI Setup
  - Prometheus Observability Stack
  - Debugging Broker Connections and Agent Behavior
  - Promethean-native config design
  - Promethean Full-Stack Docker Setup
  - Performance-Optimized-Polyglot-Bridge
  - Promethean Agent DSL TS Scaffold
  - archetype-ecs
  - 'Agent Tasks: Persistence Migration to DualStore'
  - Migrate to Provider-Tenant Architecture
  - Board Walk – 2025-08-11
  - Voice Access Layer Design
  - js-to-lisp-reverse-compiler
  - Cross-Target Macro System in Sibilant
  - JavaScript
  - Local-First Intention→Code Loop with Free Models
  - aionian-circuit-math
  - Math Fundamentals
  - Local-Offline-Model-Deployment-Strategy
  - AI-Centric OS with MCP Layer
  - i3-config-validation-methods
  - Post-Linguistic Transhuman Design Frameworks
  - Admin Dashboard for User Management
  - Mongo Outbox Implementation
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - universal-intention-code-fabric
  - Sibilant Meta-Prompt DSL
```
related_to_uuid:
```
  - 0580dcd3-533d-4834-8a2f-eae3771960a9
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - ba244286-4e84-425b-8bf6-b80c4eb783fc
  - ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
  - b362e12e-2802-4e41-9a21-6e0c7ad419a2
  - b4e64f8c-4dc9-4941-a877-646c5ada068e
  - 36c8882a-badc-4e18-838d-2c54d7038141
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - e1056831-ae0c-460b-95fa-4cf09b3398c6
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - d527c05d-22e8-4493-8f29-ae3cb67f035b
  - 66a72fc3-4153-41fc-84bd-d6164967a6ff
  - c03020e1-e3e7-48bf-aa7e-aa740c601b63
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - d17d3a96-c84d-4738-a403-6c733b874da2
  - bc5172ca-7a09-42ad-b418-8e42bb14d089
  - e90b5a16-d58f-424d-bd36-70e9bd2861ad
  - 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
  - ab748541-020e-4a7e-b07d-28173bd5bea2
  - 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
  - f5579967-762d-4cfd-851e-4f71b4cb77a1
  - 5158f742-4a3b-466e-bfc3-d83517b64200
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - 54382370-1931-4a19-a634-46735708a9ea
  - 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
  - 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
  - 58191024-d04a-4520-8aae-a18be7b94263
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - c1618c66-f73a-4e04-9bfa-ef38755f7acc
  - 871490c7-a050-429b-88b2-55dfeaa1f8d5
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
  - ad7f1ed3-c9bf-4e85-9eeb-6cc4b53155f3
  - 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
  - d28090ac-f746-4958-aab5-ed1315382c04
  - 6bcff92c-4224-453d-9993-1be8d37d47c3
  - 2901a3e9-96f0-497c-ae2c-775f28a702dd
  - 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - c14edce7-0656-45b2-aaf3-51f042451b7d
  - af5d2824-faad-476c-a389-e912d9bc672c
references:
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 7
    col: 1
    score: 0.98
  - uuid: b4e64f8c-4dc9-4941-a877-646c5ada068e
    line: 44
    col: 1
    score: 0.9
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 51
    col: 1
    score: 0.98
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 79
    col: 1
    score: 0.93
  - uuid: d527c05d-22e8-4493-8f29-ae3cb67f035b
    line: 107
    col: 1
    score: 0.86
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 117
    col: 1
    score: 0.86
  - uuid: 36c8882a-badc-4e18-838d-2c54d7038141
    line: 47
    col: 1
    score: 0.9
  - uuid: 66a72fc3-4153-41fc-84bd-d6164967a6ff
    line: 64
    col: 1
    score: 0.86
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 71
    col: 1
    score: 0.9
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 176
    col: 3
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 275
    col: 3
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 275
    col: 5
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 276
    col: 3
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 276
    col: 5
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 277
    col: 3
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 277
    col: 5
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 379
    col: 1
    score: 0.98
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 446
    col: 1
    score: 0.98
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 377
    col: 1
    score: 0.98
  - uuid: ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
    line: 289
    col: 1
    score: 0.98
  - uuid: b362e12e-2802-4e41-9a21-6e0c7ad419a2
    line: 153
    col: 1
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 105
    col: 1
    score: 0.9
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 163
    col: 1
    score: 0.87
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 41
    col: 1
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 41
    col: 3
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 385
    col: 1
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 385
    col: 3
    score: 1
  - uuid: b4e64f8c-4dc9-4941-a877-646c5ada068e
    line: 363
    col: 1
    score: 1
  - uuid: b4e64f8c-4dc9-4941-a877-646c5ada068e
    line: 363
    col: 3
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 524
    col: 1
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 524
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
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 460
    col: 1
    score: 1
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 460
    col: 3
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 15
    col: 1
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 15
    col: 3
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 388
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 388
    col: 3
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 129
    col: 1
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 129
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
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 171
    col: 1
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 171
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
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 455
    col: 1
    score: 1
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 455
    col: 3
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 455
    col: 1
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 455
    col: 3
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 387
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 387
    col: 3
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 130
    col: 1
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 130
    col: 3
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 456
    col: 1
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 456
    col: 3
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 390
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 390
    col: 3
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 131
    col: 1
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 131
    col: 3
    score: 1
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 424
    col: 1
    score: 1
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 424
    col: 3
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 457
    col: 1
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 457
    col: 3
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 391
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 391
    col: 3
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 132
    col: 1
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 132
    col: 3
    score: 1
  - uuid: 871490c7-a050-429b-88b2-55dfeaa1f8d5
    line: 145
    col: 1
    score: 1
  - uuid: 871490c7-a050-429b-88b2-55dfeaa1f8d5
    line: 145
    col: 3
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 286
    col: 1
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 286
    col: 3
    score: 1
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 560
    col: 1
    score: 1
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 560
    col: 3
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 504
    col: 1
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 504
    col: 3
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 292
    col: 1
    score: 0.93
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 292
    col: 3
    score: 0.93
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
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 278
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 278
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
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 437
    col: 1
    score: 1
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 437
    col: 3
    score: 1
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 604
    col: 1
    score: 1
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 604
    col: 3
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 522
    col: 1
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 522
    col: 3
    score: 1
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 615
    col: 1
    score: 0.94
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 615
    col: 3
    score: 0.94
  - uuid: d28090ac-f746-4958-aab5-ed1315382c04
    line: 56
    col: 1
    score: 1
  - uuid: d28090ac-f746-4958-aab5-ed1315382c04
    line: 56
    col: 3
    score: 1
  - uuid: 871490c7-a050-429b-88b2-55dfeaa1f8d5
    line: 143
    col: 1
    score: 1
  - uuid: 871490c7-a050-429b-88b2-55dfeaa1f8d5
    line: 143
    col: 3
    score: 1
  - uuid: b362e12e-2802-4e41-9a21-6e0c7ad419a2
    line: 167
    col: 1
    score: 1
  - uuid: b362e12e-2802-4e41-9a21-6e0c7ad419a2
    line: 167
    col: 3
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 438
    col: 1
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 438
    col: 3
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 471
    col: 1
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 471
    col: 3
    score: 1
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 607
    col: 1
    score: 1
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 607
    col: 3
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 509
    col: 1
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 509
    col: 3
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 488
    col: 1
    score: 0.95
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 488
    col: 3
    score: 0.95
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 276
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 276
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
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 269
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 269
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
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 288
    col: 1
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 288
    col: 3
    score: 1
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 440
    col: 1
    score: 1
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 440
    col: 3
    score: 1
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 603
    col: 1
    score: 1
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 603
    col: 3
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 510
    col: 1
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 510
    col: 3
    score: 1
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 436
    col: 1
    score: 1
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 436
    col: 3
    score: 1
  - uuid: d527c05d-22e8-4493-8f29-ae3cb67f035b
    line: 428
    col: 1
    score: 1
  - uuid: d527c05d-22e8-4493-8f29-ae3cb67f035b
    line: 428
    col: 3
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 521
    col: 1
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 521
    col: 3
    score: 1
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 364
    col: 1
    score: 1
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 364
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
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 281
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 281
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
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 287
    col: 1
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 287
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
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 602
    col: 1
    score: 1
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 602
    col: 3
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 506
    col: 1
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 506
    col: 3
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 526
    col: 1
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 526
    col: 3
    score: 1
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 362
    col: 1
    score: 1
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 362
    col: 3
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 41
    col: 1
    score: 1
  - uuid: 2901a3e9-96f0-497c-ae2c-775f28a702dd
    line: 41
    col: 3
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 461
    col: 1
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 461
    col: 3
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 397
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 397
    col: 3
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 173
    col: 1
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 173
    col: 3
    score: 1
  - uuid: b4e64f8c-4dc9-4941-a877-646c5ada068e
    line: 368
    col: 1
    score: 1
  - uuid: b4e64f8c-4dc9-4941-a877-646c5ada068e
    line: 368
    col: 3
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 401
    col: 1
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 401
    col: 3
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 400
    col: 1
    score: 0.98
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 400
    col: 3
    score: 0.98
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 514
    col: 1
    score: 0.99
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 514
    col: 3
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 485
    col: 1
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 485
    col: 3
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 487
    col: 1
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 487
    col: 3
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 489
    col: 1
    score: 0.99
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 489
    col: 3
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 287
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 287
    col: 3
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 140
    col: 1
    score: 0.99
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 140
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
  - uuid: d527c05d-22e8-4493-8f29-ae3cb67f035b
    line: 431
    col: 1
    score: 0.99
  - uuid: d527c05d-22e8-4493-8f29-ae3cb67f035b
    line: 431
    col: 3
    score: 0.99
  - uuid: 66a72fc3-4153-41fc-84bd-d6164967a6ff
    line: 173
    col: 1
    score: 1
  - uuid: 66a72fc3-4153-41fc-84bd-d6164967a6ff
    line: 173
    col: 3
    score: 1
  - uuid: d28090ac-f746-4958-aab5-ed1315382c04
    line: 60
    col: 1
    score: 0.98
  - uuid: d28090ac-f746-4958-aab5-ed1315382c04
    line: 60
    col: 3
    score: 0.98
  - uuid: 66a72fc3-4153-41fc-84bd-d6164967a6ff
    line: 176
    col: 1
    score: 0.98
  - uuid: 66a72fc3-4153-41fc-84bd-d6164967a6ff
    line: 176
    col: 3
    score: 0.98
  - uuid: 66a72fc3-4153-41fc-84bd-d6164967a6ff
    line: 172
    col: 1
    score: 0.98
  - uuid: 66a72fc3-4153-41fc-84bd-d6164967a6ff
    line: 172
    col: 3
    score: 0.98
  - uuid: 36c8882a-badc-4e18-838d-2c54d7038141
    line: 177
    col: 1
    score: 0.99
  - uuid: 36c8882a-badc-4e18-838d-2c54d7038141
    line: 177
    col: 3
    score: 0.99
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 330
    col: 1
    score: 0.98
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 330
    col: 3
    score: 0.98
  - uuid: 36c8882a-badc-4e18-838d-2c54d7038141
    line: 180
    col: 1
    score: 0.97
  - uuid: 36c8882a-badc-4e18-838d-2c54d7038141
    line: 180
    col: 3
    score: 0.97
  - uuid: 36c8882a-badc-4e18-838d-2c54d7038141
    line: 179
    col: 1
    score: 0.97
  - uuid: 36c8882a-badc-4e18-838d-2c54d7038141
    line: 179
    col: 3
    score: 0.97
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 530
    col: 1
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 530
    col: 3
    score: 1
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 445
    col: 1
    score: 0.98
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 445
    col: 3
    score: 0.98
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 613
    col: 1
    score: 0.98
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 613
    col: 3
    score: 0.98
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 295
    col: 1
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 295
    col: 3
    score: 1
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 396
    col: 1
    score: 0.99
  - uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
    line: 396
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
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 207
    col: 1
    score: 0.98
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 207
    col: 3
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 154
    col: 1
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 154
    col: 3
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 190
    col: 1
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 190
    col: 3
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 454
    col: 1
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 454
    col: 3
    score: 1
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 527
    col: 1
    score: 1
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 527
    col: 3
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 155
    col: 1
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 155
    col: 3
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 191
    col: 1
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 191
    col: 3
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 455
    col: 1
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 455
    col: 3
    score: 1
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 528
    col: 1
    score: 1
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 528
    col: 3
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 156
    col: 1
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 156
    col: 3
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 192
    col: 1
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 192
    col: 3
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 456
    col: 1
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 456
    col: 3
    score: 1
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 529
    col: 1
    score: 1
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 529
    col: 3
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 157
    col: 1
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 157
    col: 3
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 193
    col: 1
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 193
    col: 3
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 457
    col: 1
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 457
    col: 3
    score: 1
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 530
    col: 1
    score: 1
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 530
    col: 3
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 158
    col: 1
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 158
    col: 3
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 194
    col: 1
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 194
    col: 3
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 458
    col: 1
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 458
    col: 3
    score: 1
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 531
    col: 1
    score: 1
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 531
    col: 3
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 147
    col: 1
    score: 0.99
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 147
    col: 3
    score: 0.99
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 477
    col: 1
    score: 0.99
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 477
    col: 3
    score: 0.99
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 427
    col: 1
    score: 0.99
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 427
    col: 3
    score: 0.99
  - uuid: ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
    line: 314
    col: 1
    score: 0.99
  - uuid: ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
    line: 314
    col: 3
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 452
    col: 1
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 452
    col: 3
    score: 1
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 525
    col: 1
    score: 1
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 525
    col: 3
    score: 1
  - uuid: b362e12e-2802-4e41-9a21-6e0c7ad419a2
    line: 175
    col: 1
    score: 0.99
  - uuid: b362e12e-2802-4e41-9a21-6e0c7ad419a2
    line: 175
    col: 3
    score: 0.99
  - uuid: c14edce7-0656-45b2-aaf3-51f042451b7d
    line: 444
    col: 1
    score: 0.99
  - uuid: c14edce7-0656-45b2-aaf3-51f042451b7d
    line: 444
    col: 3
    score: 0.99
---
Nice—picking it back up. Last we aligned on: **all ports hidden behind NGINX**, **no SaaS/tokens**, **JS/TS-only services**, **Dockerfiles live in `./images/`**, and **infra kept out of source**. We also said to include **Ollama**, **Qdrant** (local vector DB), **Tor +Privoxy** for optional crawler routing, a **TS crawler**, a **TS embeddings service** no Python; `@xenova/transformers`, and a tiny **TS API Gateway** to give you a clean interface. Here’s the concrete drop:

# 📁 File tree (where to put things)

```
/images/
  ts-service.docker
  nginx.docker
/infrastructure/compose/
  stack.yml
  nginx.conf
/services/ts/
  api-gateway/
    package.json
    src/server.ts
  crawler/
    package.json
    src/main.ts
  embeddings/
    package.json
    src/server.ts
/shared/ts/
  package.json
  src/http.ts
  src/clients/ollama.ts
  src/clients/qdrant.ts
  src/clients/crawler.ts
  src/clients/embeddings.ts
```

# 🐳 `./images/ts-service.docker`

```dockerfile
# Minimal, reproducible TS base (no Python)
FROM node:22-slim

ENV NODE_ENV=production \
    PNPM_HOME=/usr/local/share/pnpm \
    PATH=/usr/local/share/pnpm:PATH

RUN corepack enable && apt-get update && apt-get install -y --no-install-recommends \
      dumb-init ca-certificates tini \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
USER node
# Services copy their own files in their image build (multi-stage or on top of this)
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
```

# 🧰 `./images/nginx.docker`

```dockerfile
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/nginx.conf
```

# 🌐 `./infrastructure/compose/nginx.conf`

```nginx
worker_processes auto;
events { worker_connections 1024; }
http {
  sendfile on;
  upstream api_gateway  { server api-gateway:8080; }
  upstream ollama_up    { server ollama:11434; }
  upstream qdrant_up    { server qdrant:6333; }
  upstream crawler_up   { server crawler:3000; }
  upstream embeds_up    { server embeddings:7070; }

  server {
    listen 80;

    # flat API surface
    location /api/ {
      proxy_pass http://api_gateway/;
      proxy_set_header Host host;
      proxy_http_version 1.1;
    }

    # direct service mounts (optional; can be hidden behind /api if you prefer)
    location /ollama/   { proxy_pass http://ollama_up/; }
    location /qdrant/   { proxy_pass http://qdrant_up/; }
    location /crawler/  { proxy_pass http://crawler_up/; }
    location /embeddings/ { proxy_pass http://embeds_up/; }
  }
}
```

# 🧩 `./infrastructure/compose/stack.yml`

```yaml
version: "3.9"

networks:
  prom-net: { driver: bridge }

volumes:
  ollama-data:
  qdrant-data:

services:
  nginx:
    build:
      context: ../../
      dockerfile: images/nginx.docker
    image: promethean/nginx:local
    depends_on:
      - api-gateway
    ports:
      - "80:80"            # only exposed host port
    networks: [prom-net]

  ollama:
    image: ollama/ollama:latest
    restart: unless-stopped
    environment:
      - OLLAMA_HOST=0.0.0.0
    volumes:
      - ollama-data:/root/.ollama
    # Optional NVIDIA GPU:
    deploy:
      resources:
        reservations:
          devices:
            - capabilities: ["gpu"]
    networks: [prom-net]

  qdrant:
    image: qdrant/qdrant:latest
    restart: unless-stopped
    volumes:
      - qdrant-data:/qdrant/storage
    networks: [prom-net]

  tor:
    image: dperson/torproxy
    restart: unless-stopped
    networks: [prom-net]

  privoxy:
    image: vimagick/privoxy
    restart: unless-stopped
    environment:
      - FORWARD_SOCKS5=tor:9050
    networks: [prom-net]
    depends_on: [tor]

  crawler:
    build:
      context: ../../
      dockerfile: images/ts-service.docker
    image: promethean/crawler:local
    working_dir: /app
    volumes:
      - ../../services/ts/crawler:/app
    command: ["node", "--enable-source-maps", "dist/main.js"]
    environment:
      - HTTP_PROXY=http://privoxy:8118
      - HTTPS_PROXY=http://privoxy:8118
      - NO_PROXY=nginx,api-gateway,qdrant,ollama,embeddings,localhost,127.0.0.1
    networks: [prom-net]
    depends_on: [privoxy]

  embeddings:
    build:
      context: ../../
      dockerfile: images/ts-service.docker
    image: promethean/embeddings:local
    working_dir: /app
    volumes:
      - ../../services/ts/embeddings:/app
    command: ["node", "--enable-source-maps", "dist/server.js"]
    environment:
      - MODEL_ID={MODEL_ID:-Xenova/nomic-embed-text-v1.5}
      # Alternative CLIP: "Xenova/clip-vit-large-patch14"
    networks: [prom-net]

  api-gateway:
    build:
      context: ../../
      dockerfile: images/ts-service.docker
    image: promethean/api-gateway:local
    working_dir: /app
    volumes:
      - ../../services/ts/api-gateway:/app
    command: ["node", "--enable-source-maps", "dist/server.js"]
    environment:
      - UPSTREAM_OLLAMA=http://ollama:11434
      - UPSTREAM_QDRANT=http://qdrant:6333
      - UPSTREAM_CRAWLER=http://crawler:3000
      - UPSTREAM_EMBEDDINGS=http://embeddings:7070
    depends_on: [ollama, qdrant]
    networks: [prom-net]
```

# 🧪 `services/ts/api-gateway/package.json`

```json
{
  "name": "api-gateway",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p .",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "hono": "^4.5.7",
    "undici": "^6.19.8",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "tsx": "^4.19.2",
    "typescript": "^5.5.4"
  }
}
```

# 🔌 `services/ts/api-gateway/src/server.ts`

```typescript
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { fetch as f } from 'undici'

const app = new Hono()

const OLLAMA = process.env.UPSTREAM_OLLAMA!
const QDRANT = process.env.UPSTREAM_QDRANT!
const CRAWLER = process.env.UPSTREAM_CRAWLER!
const EMBEDS = process.env.UPSTREAM_EMBEDDINGS!

app.get('/health', c => c.json({ ok: true }))

// Example: proxy chat to Ollama
app.post('/llm/chat', async (c) => {
  const body = await c.req.json()
  const r = await f(`{OLLAMA}/api/chat`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' }
  })
  return c.newResponse(r.body, r)
})

// Example: embeddings
app.post('/embeddings', async (c) => {
  const body = await c.req.json()
  const r = await f(`{EMBEDS}/embeddings`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' }
  })
  return c.newResponse(r.body, r)
})

// Example: vector upsert to Qdrant
app.post('/vectors/upsert', async (c) => {
  const body = await c.req.json()
  const r = await f(`{QDRANT}/collections/{body.collection}/points?wait=true`, {
    method: 'PUT',
    body: JSON.stringify({ points: body.points }),
    headers: { 'content-type': 'application/json' }
  })
  return c.newResponse(r.body, r)
})

// Example: crawl
app.post('/crawl', async (c) => {
  const body = await c.req.json()
  const r = await f(`{CRAWLER}/crawl`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' }
  })
  return c.newResponse(r.body, r)
})

serve({ fetch: app.fetch, port: 8080 })
```

# 🕷️ `services/ts/crawler/package.json`

```json
{
  "name": "crawler",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/main.ts",
    "build": "tsc -p .",
    "start": "node dist/main.js"
  },
  "dependencies": {
    "got": "^14.4.2",
    "cheerio": "^1.0.0-rc.12",
    "hono": "^4.5.7"
  },
  "devDependencies": {
    "tsx": "^4.19.2",
    "typescript": "^5.5.4"
  }
}
```

# 🌐 `services/ts/crawler/src/main.ts`

```ts
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import got from 'got'
import * as cheerio from 'cheerio'

const app = new Hono()

app.post('/crawl', async (c) => {
  const { url } = await c.req.json() as { url: string }
  const html = await got(url, { timeout: { request: 15000 } }).text()
  const  = cheerio.load(html)

  const title = ('title').first().text()
  const text = ('body').text().replace(/\s+/g, ' ').trim().slice(0, 20000)

  return c.json({ url, title, text })
})

serve({ fetch: app.fetch, port: 3000 })
```

# 🧠 `services/ts/embeddings/package.json`

```json
{
  "name": "embeddings",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p .",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "@xenova/transformers": "^2.17.2",
    "hono": "^4.5.7"
  },
  "devDependencies": {
    "tsx": "^4.19.2",
    "typescript": "^5.5.4"
  }
}
```

# 🔡 `services/ts/embeddings/src/server.ts`

```ts
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { pipeline } from '@xenova/transformers'

const MODEL_ID = process.env.MODEL_ID || 'Xenova/nomic-embed-text-v1.5'

let embedder: any
async function getEmbedder() {
  if (!embedder) {
    embedder = await pipeline('feature-extraction', MODEL_ID)
  }
  return embedder
}

const app = new Hono()

app.post('/embeddings', async (c) => {
  const { input } = await c.req.json() as { input: string[] | string }
  const run = await getEmbedder()
  const arr = Array.isArray(input) ? input : [input]
  const outputs = await Promise.all(arr.map(async (t) => (await run(t)).data))
  return c.json({ embeddings: outputs })
})

serve({ fetch: app.fetch, port: 7070 })
```

# 🧱 Shared TS interface (SDK)

> Note: per your rule, imports should look like `@shared/ts/dist/...` after build. Here I show source; your build should output to `@shared/ts/dist/...`.

## `shared/ts/package.json`

```json
{
  "name": "@shared/ts",
  "type": "module",
  "private": true,
  "exports": {
    "./dist/*": "./dist/*"
  },
  "scripts": {
    "build": "tsc -p ."
  },
  "devDependencies": {
    "typescript": "^5.5.4",
    "zod": "^3.23.8"
  },
  "dependencies": {
    "undici": "^6.19.8"
  }
}
```

## `shared/ts/src/http.ts`

```ts
import { fetch } from 'undici'

export async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers || {}) }
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP {res.status} {res.statusText}: {text}`)
  }
  return res.json() as Promise<T>
}

export const api = (base = '') => ({
  get:  <T>(p: string) => jsonFetch<T>(base + p),
  post: <T>(p: string, body: unknown) =>
    jsonFetch<T>(base + p, { method: 'POST', body: JSON.stringify(body) }),
})
```

## `shared/ts/src/clients/ollama.ts`

```ts
import { api } from '../http.js'

export type ChatMsg = { role: 'system' | 'user' | 'assistant'; content: string }
export type ChatReq = { model: string; messages: ChatMsg[] }
export type ChatResp = { message: ChatMsg; done: boolean }

export const createOllamaClient = (base = '/api') => {
  const a = api(base)
  return {
    chat: (req: ChatReq) => a.post<ChatResp>('/llm/chat', req)
  }
}
```

## `shared/ts/src/clients/qdrant.ts`

```ts
import { api } from '../http.js'
type Point = { id: string | number; vector: number[]; payload?: Record<string, unknown> }

export const createQdrantClient = (base = '/api') => {
  const a = api(base)
  return {
    upsert: (collection: string, points: Point[]) =>
      a.post(`/vectors/upsert`, { collection, points })
  }
}
```

## `shared/ts/src/clients/crawler.ts`

```ts
import { api } from '../http.js'
export type CrawlResult = { url: string; title: string; text: string }

export const createCrawlerClient = (base = '/api') => {
  const a = api(base)
  return {
    crawl: (url: string) => a.post<CrawlResult>('/crawl', { url })
  }
}
```

## `shared/ts/src/clients/embeddings.ts`

```ts
import { api } from '../http.js'

export type EmbeddingsResp = { embeddings: number[][] }

export const createEmbeddingsClient = (base = '/api') => {
  const a = api(base)
  return {
    embed: (input: string[] | string) =>
      a.post<EmbeddingsResp>('/embeddings', { input })
  }
}
```

# 🗺️ Mermaid (you like diagrams)

```mermaid
flowchart LR
  subgraph Host[Host]
    NGINX["NGINX :80"]
  end

  subgraph prom-net
    AG["api-gateway :8080"]
    OLLAMA["ollama :11434"]
    QD["qdrant :6333"]
    CRAWL["crawler :3000"]
    EMB["embeddings :7070"]
    TOR["tor :9050"]
    PRX["privoxy :8118"]
  end

  NGINX -->|/api/*| AG
  NGINX -->|/ollama/*| OLLAMA
  NGINX -->|/qdrant/*| QD
  NGINX -->|/crawler/*| CRAWL
  NGINX -->|/embeddings/*| EMB

  CRAWL -->|HTTP(S) via| PRX --> TOR
  AG --> OLLAMA
  AG --> QD
  AG --> CRAWL
  AG --> EMB
```

---

## How to run

1. Build once from repo root:

```bash
docker compose -f infrastructure/compose/stack.yml build
```

2. Dev mode hot-reload with volumes already set:

* In each TS service folder, run `pnpm i && pnpm build` (or `pnpm dev` if you prefer local runs).
* Then:

```bash
docker compose -f infrastructure/compose/stack.yml up -d
```

3. Test endpoints (all via NGINX, single port :80):

* Health: `curl http://localhost/ api/health` (note the space removed → `/api/health`)
* Chat: `curl -X POST http://localhost/api/llm/chat -d '{"model":"qwen2.5-coder:7b","messages":[{"role":"user","content":"hello"}]}' -H 'content-type: application/json'`
* Crawl: `curl -X POST http://localhost/api/crawl```
-d '{"url":"
```https://example.com"}'```
-H 'content-type: application/json'`
```
* Embeddings: `curl -X POST http://localhost/api/embeddings -d '{"input":["hello world"]}' -H 'content-type: application/json'`

---

If you want, I can also add:

* a **/rag/query** route in the gateway crawl → embed → similarity search in Qdrant → optional LLM answer,
* a **WS** endpoint for streaming LLM tokens,
* or fold `/ollama`, `/qdrant`, `/crawler`, `/embeddings` behind `/api/*` only (fully opaque services).

What do you want next—RAG flow wired end-to-end or WS streaming?
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [api-gateway-versioning]
- [dynamic-context-model-for-web-components|Dynamic Context Model for Web Components]
- [docs/unique/ecs-offload-workers|ecs-offload-workers]
- [ecs-scheduler-and-prefabs]
- System Scheduler with Resource-Aware DAG$system-scheduler-with-resource-aware-dag.md
- [markdown-to-org-transpiler]
- [ollama-llm-provider-for-pseudo-code-transpiler]
- [observability-infrastructure-setup]
- [shared-package-layout-clarification]
- [docs/unique/eidolon-field-math-foundations|eidolon-field-math-foundations]
- [rag-ui-panel-with-qdrant-and-postgrest|RAG UI Panel with Qdrant and PostgREST]
- [local-only-llm-workflow]
- [pure-node-crawl-stack-with-playwright-and-crawlee|Pure-Node Crawl Stack with Playwright and Crawlee]
- [shared-package-structure|Shared Package Structure]
- [per-domain-policy-system-for-js-crawler|Per-Domain Policy System for JS Crawler]
- [chroma-toolkit-consolidation-plan|Chroma Toolkit Consolidation Plan]
- [pure-typescript-search-microservice|Pure TypeScript Search Microservice]
- [promethean-web-ui-setup|Promethean Web UI Setup]
- [prometheus-observability-stack|Prometheus Observability Stack]
- [Debugging Broker Connections and Agent Behavior]debugging-broker-connections-and-agent-behavior.md
<<<<<<< HEAD
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [dynamic-context-model-for-web-components|Dynamic Context Model for Web Components]
- [eidolon-field-abstract-model|Eidolon Field Abstract Model]
- [eidolon-node-lifecycle]
- [factorio-ai-with-external-agents|Factorio AI with External Agents]
- [docs/unique/field-interaction-equations|field-interaction-equations]
- [fnord-tracer-protocol|Fnord Tracer Protocol]
- [i3-bluetooth-setup]
- [docs/unique/field-dynamics-math-blocks|field-dynamics-math-blocks]
- [ducks-self-referential-perceptual-loop|Duck's Self-Referential Perceptual Loop]
- [graph-ds]
- [per-domain-policy-system-for-js-crawler|Per-Domain Policy System for JS Crawler]
- [pure-typescript-search-microservice|Pure TypeScript Search Microservice]
- [post-linguistic-transhuman-design-frameworks|Post-Linguistic Transhuman Design Frameworks]
- [heartbeat-fragment-demo]
- [sibilant-macro-targets]
- [docs/unique/promethean-state-format|Promethean State Format]
- [docs/unique/eidolon-field-math-foundations|eidolon-field-math-foundations]
- [ducks-attractor-states|Duck's Attractor States]
- [promethean-dev-workflow-update|Promethean Dev Workflow Update]
- [creative-moments|Creative Moments]
- [promethean-chat-activity-report|Promethean Chat Activity Report]
- [schema-evolution-workflow]
## Sources
- [creative-moments#^ref-10d98225-94-0|Creative Moments — L94] (line 94, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L63]debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-63-0 (line 63, col 0, score 1)
- [Docops Feature Updates — L66]docops-feature-updates-3.md#^ref-cdbd21ee-66-0 (line 66, col 0, score 1)
- [DuckDuckGoSearchPipeline — L93]duckduckgosearchpipeline.md#^ref-e979c50f-93-0 (line 93, col 0, score 1)
- [ducks-self-referential-perceptual-loop#^ref-71726f04-73-0|Duck's Self-Referential Perceptual Loop — L73] (line 73, col 0, score 1)
- [dynamic-context-model-for-web-components#^ref-f7702bf8-403-0|Dynamic Context Model for Web Components — L403] (line 403, col 0, score 1)
- komorebi-group-window-hack — L270$komorebi-group-window-hack.md#^ref-dd89372d-270-0 (line 270, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L221]layer1survivabilityenvelope.md#^ref-64a9f9f9-221-0 (line 221, col 0, score 1)
- [mathematical-samplers#^ref-86a691ec-80-0|Mathematical Samplers — L80] (line 80, col 0, score 1)
- [mathematics-sampler#^ref-b5e0183e-86-0|Mathematics Sampler — L86] (line 86, col 0, score 1)
- [migrate-to-provider-tenant-architecture#^ref-54382370-342-0|Migrate to Provider-Tenant Architecture — L342] (line 342, col 0, score 1)
- [mindful-prioritization#^ref-40185d05-22-0|Mindful Prioritization — L22] (line 22, col 0, score 1)
- [MindfulRobotIntegration — L21]mindfulrobotintegration.md#^ref-5f65dfa5-21-0 (line 21, col 0, score 1)
- [model-selection-for-lightweight-conversational-tasks#^ref-d144aa62-133-0|Model Selection for Lightweight Conversational Tasks — L133] (line 133, col 0, score 1)
- [model-upgrade-calm-down-guide#^ref-db74343f-98-0|Model Upgrade Calm-Down Guide — L98] (line 98, col 0, score 1)
- [docops-feature-updates#^ref-2792d448-61-0|Docops Feature Updates — L61] (line 61, col 0, score 1)
- [ducks-attractor-states#^ref-13951643-99-0|Duck's Attractor States — L99] (line 99, col 0, score 1)
- [ducks-self-referential-perceptual-loop#^ref-71726f04-80-0|Duck's Self-Referential Perceptual Loop — L80] (line 80, col 0, score 1)
- [dynamic-context-model-for-web-components#^ref-f7702bf8-405-0|Dynamic Context Model for Web Components — L405] (line 405, col 0, score 1)
- [eidolon-field-abstract-model#^ref-5e8b2388-216-0|Eidolon Field Abstract Model — L216] (line 216, col 0, score 1)
- [factorio-ai-with-external-agents#^ref-a4d90289-189-0|Factorio AI with External Agents — L189] (line 189, col 0, score 1)
- [docs/unique/field-interaction-equations#^ref-b09141b7-172-0|field-interaction-equations — L172] (line 172, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L175]layer1survivabilityenvelope.md#^ref-64a9f9f9-175-0 (line 175, col 0, score 1)
- [mathematical-samplers#^ref-86a691ec-90-0|Mathematical Samplers — L90] (line 90, col 0, score 1)
- [migrate-to-provider-tenant-architecture#^ref-54382370-298-0|Migrate to Provider-Tenant Architecture — L298] (line 298, col 0, score 1)
- [promethean-chat-activity-report#^ref-18344cf9-48-0|Promethean Chat Activity Report — L48] (line 48, col 0, score 1)
- [obsidian-chatgpt-plugin-integration-guide#^ref-1d3d6c3a-75-0|Obsidian ChatGPT Plugin Integration Guide — L75] (line 75, col 0, score 1)
- [obsidian-chatgpt-plugin-integration#^ref-ca8e1399-74-0|Obsidian ChatGPT Plugin Integration — L74] (line 74, col 0, score 1)
- [docs/unique/obsidian-ignore-node-modules-regex#^ref-ffb9b2a9-145-0|obsidian-ignore-node-modules-regex — L145] (line 145, col 0, score 1)
- [obsidian-task-generation#^ref-9b694a91-47-0|Obsidian Task Generation — L47] (line 47, col 0, score 1)
- [obsidian-templating-plugins-integration-guide#^ref-b39dc9d4-146-0|Obsidian Templating Plugins Integration Guide — L146] (line 146, col 0, score 1)
- [openapi-validation-report#^ref-5c152b08-63-0|OpenAPI Validation Report — L63] (line 63, col 0, score 1)
- [optimizing-command-limitations-in-system-design#^ref-98c8ff62-72-0|Optimizing Command Limitations in System Design — L72] (line 72, col 0, score 1)
- [promethean-notes#^ref-1c4046b5-36-0|Promethean Notes — L36] (line 36, col 0, score 1)
- [promethean-requirements#^ref-95205cd3-49-0|promethean-requirements — L49] (line 49, col 0, score 1)
- [docs/unique/promethean-state-format#^ref-23df6ddb-126-0|Promethean State Format — L126] (line 126, col 0, score 1)
- [promethean-workflow-optimization#^ref-d614d983-51-0|Promethean Workflow Optimization — L51] (line 51, col 0, score 1)
- [Docops Feature Updates — L44]docops-feature-updates-3.md#^ref-cdbd21ee-44-0 (line 44, col 0, score 1)
- [creative-moments#^ref-10d98225-8-0|Creative Moments — L8] (line 8, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L38]debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-38-0 (line 38, col 0, score 1)
- [Docops Feature Updates — L56]docops-feature-updates-3.md#^ref-cdbd21ee-56-0 (line 56, col 0, score 1)
- [creative-moments#^ref-10d98225-75-0|Creative Moments — L75] (line 75, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L104]debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-104-0 (line 104, col 0, score 1)
- [Docops Feature Updates — L46]docops-feature-updates-3.md#^ref-cdbd21ee-46-0 (line 46, col 0, score 1)
- [docops-feature-updates#^ref-2792d448-64-0|Docops Feature Updates — L64] (line 64, col 0, score 1)
- [DuckDuckGoSearchPipeline — L40]duckduckgosearchpipeline.md#^ref-e979c50f-40-0 (line 40, col 0, score 1)
- [ducks-attractor-states#^ref-13951643-137-0|Duck's Attractor States — L137] (line 137, col 0, score 1)
- [ducks-self-referential-perceptual-loop#^ref-71726f04-82-0|Duck's Self-Referential Perceptual Loop — L82] (line 82, col 0, score 1)
- [dynamic-context-model-for-web-components#^ref-f7702bf8-454-0|Dynamic Context Model for Web Components — L454] (line 454, col 0, score 1)
- [dynamic-context-model-for-web-components#^ref-f7702bf8-412-0|Dynamic Context Model for Web Components — L412] (line 412, col 0, score 1)
- [eidolon-field-abstract-model#^ref-5e8b2388-261-0|Eidolon Field Abstract Model — L261] (line 261, col 0, score 1)
- [docs/unique/eidolon-field-math-foundations#^ref-008f2ac0-181-0|eidolon-field-math-foundations — L181] (line 181, col 0, score 1)
- [eidolon-node-lifecycle#^ref-938eca9c-90-0|eidolon-node-lifecycle — L90] (line 90, col 0, score 1)
- [factorio-ai-with-external-agents#^ref-a4d90289-157-0|Factorio AI with External Agents — L157] (line 157, col 0, score 1)
- [docs/unique/field-dynamics-math-blocks#^ref-7cfc230d-205-0|field-dynamics-math-blocks — L205] (line 205, col 0, score 1)
- [field-node-diagram-set#^ref-22b989d5-203-0|field-node-diagram-set — L203] (line 203, col 0, score 1)
- field-node-diagram-visualizations — L95$field-node-diagram-visualizations.md#^ref-e9b27b06-95-0 (line 95, col 0, score 1)
- [graph-ds#^ref-6620e2f2-371-0|graph-ds — L371] (line 371, col 0, score 1)
- [heartbeat-fragment-demo#^ref-dd00677a-141-0|heartbeat-fragment-demo — L141] (line 141, col 0, score 1)
- [homeostasis-decay-formulas#^ref-37b5d236-222-0|homeostasis-decay-formulas — L222] (line 222, col 0, score 1)
- [i3-bluetooth-setup#^ref-5e408692-107-0|i3-bluetooth-setup — L107] (line 107, col 0, score 1)
- [creative-moments#^ref-10d98225-28-0|Creative Moments — L28] (line 28, col 0, score 1)
- [Docops Feature Updates — L65]docops-feature-updates-3.md#^ref-cdbd21ee-65-0 (line 65, col 0, score 1)
- [docops-feature-updates#^ref-2792d448-86-0|Docops Feature Updates — L86] (line 86, col 0, score 1)
- [ducks-attractor-states#^ref-13951643-123-0|Duck's Attractor States — L123] (line 123, col 0, score 1)
- [ducks-self-referential-perceptual-loop#^ref-71726f04-34-0|Duck's Self-Referential Perceptual Loop — L34] (line 34, col 0, score 1)
- [dynamic-context-model-for-web-components#^ref-f7702bf8-442-0|Dynamic Context Model for Web Components — L442] (line 442, col 0, score 1)
- [eidolon-field-abstract-model#^ref-5e8b2388-218-0|Eidolon Field Abstract Model — L218] (line 218, col 0, score 1)
- [docs/unique/eidolon-field-math-foundations#^ref-008f2ac0-176-0|eidolon-field-math-foundations — L176] (line 176, col 0, score 1)
- [eidolon-node-lifecycle#^ref-938eca9c-70-0|eidolon-node-lifecycle — L70] (line 70, col 0, score 1)
- [docs/unique/eidolon-field-math-foundations#^ref-008f2ac0-148-0|eidolon-field-math-foundations — L148] (line 148, col 0, score 1)
- [eidolon-node-lifecycle#^ref-938eca9c-36-0|eidolon-node-lifecycle — L36] (line 36, col 0, score 1)
- [factorio-ai-with-external-agents#^ref-a4d90289-166-0|Factorio AI with External Agents — L166] (line 166, col 0, score 1)
- [docs/unique/field-dynamics-math-blocks#^ref-7cfc230d-148-0|field-dynamics-math-blocks — L148] (line 148, col 0, score 1)
- [docs/unique/field-interaction-equations#^ref-b09141b7-153-0|field-interaction-equations — L153] (line 153, col 0, score 1)
- [field-node-diagram-outline#^ref-1f32c94a-118-0|field-node-diagram-outline — L118] (line 118, col 0, score 1)
- [field-node-diagram-set#^ref-22b989d5-168-0|field-node-diagram-set — L168] (line 168, col 0, score 1)
- field-node-diagram-visualizations — L103$field-node-diagram-visualizations.md#^ref-e9b27b06-103-0 (line 103, col 0, score 1)
- [functional-embedding-pipeline-refactor#^ref-a4a25141-380-0|Functional Embedding Pipeline Refactor — L380] (line 380, col 0, score 1)
- [functional-refactor-of-typescript-document-processing#^ref-1cfae310-194-0|Functional Refactor of TypeScript Document Processing — L194] (line 194, col 0, score 1)
- [Docops Feature Updates — L85]docops-feature-updates-3.md#^ref-cdbd21ee-85-0 (line 85, col 0, score 1)
- [ducks-attractor-states#^ref-13951643-93-0|Duck's Attractor States — L93] (line 93, col 0, score 1)
- [ducks-self-referential-perceptual-loop#^ref-71726f04-64-0|Duck's Self-Referential Perceptual Loop — L64] (line 64, col 0, score 1)
- [factorio-ai-with-external-agents#^ref-a4d90289-153-0|Factorio AI with External Agents — L153] (line 153, col 0, score 1)
- [docs/unique/field-dynamics-math-blocks#^ref-7cfc230d-141-0|field-dynamics-math-blocks — L141] (line 141, col 0, score 1)
- [docops-feature-updates#^ref-2792d448-35-0|Docops Feature Updates — L35] (line 35, col 0, score 1)
- [ducks-attractor-states#^ref-13951643-94-0|Duck's Attractor States — L94] (line 94, col 0, score 1)
- [ducks-self-referential-perceptual-loop#^ref-71726f04-53-0|Duck's Self-Referential Perceptual Loop — L53] (line 53, col 0, score 1)
- [dynamic-context-model-for-web-components#^ref-f7702bf8-424-0|Dynamic Context Model for Web Components — L424] (line 424, col 0, score 1)
- [eidolon-field-abstract-model#^ref-5e8b2388-209-0|Eidolon Field Abstract Model — L209] (line 209, col 0, score 1)
- [docs/unique/eidolon-field-math-foundations#^ref-008f2ac0-142-0|eidolon-field-math-foundations — L142] (line 142, col 0, score 1)
- [eidolon-node-lifecycle#^ref-938eca9c-39-0|eidolon-node-lifecycle — L39] (line 39, col 0, score 1)
- [creative-moments#^ref-10d98225-50-0|Creative Moments — L50] (line 50, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L89]debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-89-0 (line 89, col 0, score 1)
- [Docops Feature Updates — L32]docops-feature-updates-3.md#^ref-cdbd21ee-32-0 (line 32, col 0, score 1)
- [docops-feature-updates#^ref-2792d448-49-0|Docops Feature Updates — L49] (line 49, col 0, score 1)
- [DuckDuckGoSearchPipeline — L95]duckduckgosearchpipeline.md#^ref-e979c50f-95-0 (line 95, col 0, score 1)
- [ducks-attractor-states#^ref-13951643-133-0|Duck's Attractor States — L133] (line 133, col 0, score 1)
- [ducks-self-referential-perceptual-loop#^ref-71726f04-59-0|Duck's Self-Referential Perceptual Loop — L59] (line 59, col 0, score 1)
- [eidolon-field-abstract-model#^ref-5e8b2388-252-0|Eidolon Field Abstract Model — L252] (line 252, col 0, score 1)
```
=======
```
- [promethean-native-config-design|Promethean-native config design]
- [promethean-full-stack-docker-setup|Promethean Full-Stack Docker Setup]
- [performance-optimized-polyglot-bridge]
- [promethean-agent-dsl-ts-scaffold|Promethean Agent DSL TS Scaffold]
- [docs/unique/archetype-ecs|archetype-ecs]
- [docs/unique/agent-tasks-persistence-migration-to-dualstore|Agent Tasks: Persistence Migration to DualStore]
- [migrate-to-provider-tenant-architecture|Migrate to Provider-Tenant Architecture]
- [board-walk-2025-08-11|Board Walk – 2025-08-11]
- [voice-access-layer-design|Voice Access Layer Design]
- [js-to-lisp-reverse-compiler]
- [cross-target-macro-system-in-sibilant|Cross-Target Macro System in Sibilant]
- [JavaScript]chunks/javascript.md
- Local-First Intention→Code Loop with Free Models$local-first-intention-code-loop-with-free-models.md
- [docs/unique/aionian-circuit-math|aionian-circuit-math]
- [Math Fundamentals]chunks/math-fundamentals.md
- [local-offline-model-deployment-strategy]
- [ai-centric-os-with-mcp-layer|AI-Centric OS with MCP Layer]
- [i3-config-validation-methods]
- [post-linguistic-transhuman-design-frameworks|Post-Linguistic Transhuman Design Frameworks]
- [admin-dashboard-for-user-management|Admin Dashboard for User Management]
- [mongo-outbox-implementation|Mongo Outbox Implementation]
- [polyglot-s-expr-bridge-python-js-lisp-interop|Polyglot S-expr Bridge: Python-JS-Lisp Interop]
- [universal-intention-code-fabric]
- [sibilant-meta-prompt-dsl|Sibilant Meta-Prompt DSL]

## Sources
- [api-gateway-versioning#L7|api-gateway-versioning — L7] (line 7, col 1, score 0.98)
- [observability-infrastructure-setup#L44|observability-infrastructure-setup — L44] (line 44, col 1, score 0.9)
- [api-gateway-versioning#L51|api-gateway-versioning — L51] (line 51, col 1, score 0.98)
- [api-gateway-versioning#L79|api-gateway-versioning — L79] (line 79, col 1, score 0.93)
- [pure-node-crawl-stack-with-playwright-and-crawlee#L107|Pure-Node Crawl Stack with Playwright and Crawlee — L107] (line 107, col 1, score 0.86)
- [per-domain-policy-system-for-js-crawler#L117|Per-Domain Policy System for JS Crawler — L117] (line 117, col 1, score 0.86)
- [shared-package-layout-clarification#L47|shared-package-layout-clarification — L47] (line 47, col 1, score 0.9)
- [shared-package-structure#L64|Shared Package Structure — L64] (line 64, col 1, score 0.86)
- [rag-ui-panel-with-qdrant-and-postgrest#L71|RAG UI Panel with Qdrant and PostgREST — L71] (line 71, col 1, score 0.9)
- [dynamic-context-model-for-web-components#L176|Dynamic Context Model for Web Components — L176] (line 176, col 3, score 1)
- [api-gateway-versioning#L275|api-gateway-versioning — L275] (line 275, col 3, score 1)
- [api-gateway-versioning#L275|api-gateway-versioning — L275] (line 275, col 5, score 1)
- [api-gateway-versioning#L276|api-gateway-versioning — L276] (line 276, col 3, score 1)
- [api-gateway-versioning#L276|api-gateway-versioning — L276] (line 276, col 5, score 1)
- [api-gateway-versioning#L277|api-gateway-versioning — L277] (line 277, col 3, score 1)
- [api-gateway-versioning#L277|api-gateway-versioning — L277] (line 277, col 5, score 1)
- [ecs-scheduler-and-prefabs#L379|ecs-scheduler-and-prefabs — L379] (line 379, col 1, score 0.98)
- [docs/unique/ecs-offload-workers#L446|ecs-offload-workers — L446] (line 446, col 1, score 0.98)
- System Scheduler with Resource-Aware DAG — L377$system-scheduler-with-resource-aware-dag.md#L377 (line 377, col 1, score 0.98)
- [markdown-to-org-transpiler#L289|markdown-to-org-transpiler — L289] (line 289, col 1, score 0.98)
- [ollama-llm-provider-for-pseudo-code-transpiler#L153|Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L153] (line 153, col 1, score 0.98)
- [docs/unique/eidolon-field-math-foundations#L105|eidolon-field-math-foundations — L105] (line 105, col 1, score 0.9)
- [local-only-llm-workflow#L163|Local-Only-LLM-Workflow — L163] (line 163, col 1, score 0.87)
- [Debugging Broker Connections and Agent Behavior — L41]debugging-broker-connections-and-agent-behavior.md#L41 (line 41, col 1, score 1)
- [Debugging Broker Connections and Agent Behavior — L41]debugging-broker-connections-and-agent-behavior.md#L41 (line 41, col 3, score 1)
- [dynamic-context-model-for-web-components#L385|Dynamic Context Model for Web Components — L385] (line 385, col 1, score 1)
- [dynamic-context-model-for-web-components#L385|Dynamic Context Model for Web Components — L385] (line 385, col 3, score 1)
- [observability-infrastructure-setup#L363|observability-infrastructure-setup — L363] (line 363, col 1, score 1)
- [observability-infrastructure-setup#L363|observability-infrastructure-setup — L363] (line 363, col 3, score 1)
- [pure-typescript-search-microservice#L524|Pure TypeScript Search Microservice — L524] (line 524, col 1, score 1)
- [pure-typescript-search-microservice#L524|Pure TypeScript Search Microservice — L524] (line 524, col 3, score 1)
- [api-gateway-versioning#L285|api-gateway-versioning — L285] (line 285, col 1, score 1)
- [api-gateway-versioning#L285|api-gateway-versioning — L285] (line 285, col 3, score 1)
- [board-walk-2025-08-11#L135|Board Walk – 2025-08-11 — L135] (line 135, col 1, score 1)
- [board-walk-2025-08-11#L135|Board Walk – 2025-08-11 — L135] (line 135, col 3, score 1)
- [chroma-toolkit-consolidation-plan#L167|Chroma Toolkit Consolidation Plan — L167] (line 167, col 1, score 1)
- [chroma-toolkit-consolidation-plan#L167|Chroma Toolkit Consolidation Plan — L167] (line 167, col 3, score 1)
- [cross-target-macro-system-in-sibilant#L180|Cross-Target Macro System in Sibilant — L180] (line 180, col 1, score 1)
- [cross-target-macro-system-in-sibilant#L180|Cross-Target Macro System in Sibilant — L180] (line 180, col 3, score 1)
- [docs/unique/archetype-ecs#L460|archetype-ecs — L460] (line 460, col 1, score 1)
- [docs/unique/archetype-ecs#L460|archetype-ecs — L460] (line 460, col 3, score 1)
- [JavaScript — L15]chunks/javascript.md#L15 (line 15, col 1, score 1)
- [JavaScript — L15]chunks/javascript.md#L15 (line 15, col 3, score 1)
- [ecs-scheduler-and-prefabs#L388|ecs-scheduler-and-prefabs — L388] (line 388, col 1, score 1)
- [ecs-scheduler-and-prefabs#L388|ecs-scheduler-and-prefabs — L388] (line 388, col 3, score 1)
- [docs/unique/eidolon-field-math-foundations#L129|eidolon-field-math-foundations — L129] (line 129, col 1, score 1)
- [docs/unique/eidolon-field-math-foundations#L129|eidolon-field-math-foundations — L129] (line 129, col 3, score 1)
- [docs/unique/archetype-ecs#L454|archetype-ecs — L454] (line 454, col 1, score 1)
- [docs/unique/archetype-ecs#L454|archetype-ecs — L454] (line 454, col 3, score 1)
- [chroma-toolkit-consolidation-plan#L171|Chroma Toolkit Consolidation Plan — L171] (line 171, col 1, score 1)
- [chroma-toolkit-consolidation-plan#L171|Chroma Toolkit Consolidation Plan — L171] (line 171, col 3, score 1)
- [JavaScript — L14]chunks/javascript.md#L14 (line 14, col 1, score 1)
- [JavaScript — L14]chunks/javascript.md#L14 (line 14, col 3, score 1)
- [docs/unique/ecs-offload-workers#L454|ecs-offload-workers — L454] (line 454, col 1, score 1)
- [docs/unique/ecs-offload-workers#L454|ecs-offload-workers — L454] (line 454, col 3, score 1)
- [docs/unique/archetype-ecs#L455|archetype-ecs — L455] (line 455, col 1, score 1)
- [docs/unique/archetype-ecs#L455|archetype-ecs — L455] (line 455, col 3, score 1)
- [docs/unique/ecs-offload-workers#L455|ecs-offload-workers — L455] (line 455, col 1, score 1)
- [docs/unique/ecs-offload-workers#L455|ecs-offload-workers — L455] (line 455, col 3, score 1)
- [ecs-scheduler-and-prefabs#L387|ecs-scheduler-and-prefabs — L387] (line 387, col 1, score 1)
- [ecs-scheduler-and-prefabs#L387|ecs-scheduler-and-prefabs — L387] (line 387, col 3, score 1)
- [docs/unique/eidolon-field-math-foundations#L130|eidolon-field-math-foundations — L130] (line 130, col 1, score 1)
- [docs/unique/eidolon-field-math-foundations#L130|eidolon-field-math-foundations — L130] (line 130, col 3, score 1)
- [docs/unique/ecs-offload-workers#L456|ecs-offload-workers — L456] (line 456, col 1, score 1)
- [docs/unique/ecs-offload-workers#L456|ecs-offload-workers — L456] (line 456, col 3, score 1)
- [ecs-scheduler-and-prefabs#L390|ecs-scheduler-and-prefabs — L390] (line 390, col 1, score 1)
- [ecs-scheduler-and-prefabs#L390|ecs-scheduler-and-prefabs — L390] (line 390, col 3, score 1)
- [docs/unique/eidolon-field-math-foundations#L131|eidolon-field-math-foundations — L131] (line 131, col 1, score 1)
- [docs/unique/eidolon-field-math-foundations#L131|eidolon-field-math-foundations — L131] (line 131, col 3, score 1)
- [js-to-lisp-reverse-compiler#L424|js-to-lisp-reverse-compiler — L424] (line 424, col 1, score 1)
- [js-to-lisp-reverse-compiler#L424|js-to-lisp-reverse-compiler — L424] (line 424, col 3, score 1)
- [docs/unique/ecs-offload-workers#L457|ecs-offload-workers — L457] (line 457, col 1, score 1)
- [docs/unique/ecs-offload-workers#L457|ecs-offload-workers — L457] (line 457, col 3, score 1)
- [ecs-scheduler-and-prefabs#L391|ecs-scheduler-and-prefabs — L391] (line 391, col 1, score 1)
- [ecs-scheduler-and-prefabs#L391|ecs-scheduler-and-prefabs — L391] (line 391, col 3, score 1)
- [docs/unique/eidolon-field-math-foundations#L132|eidolon-field-math-foundations — L132] (line 132, col 1, score 1)
- [docs/unique/eidolon-field-math-foundations#L132|eidolon-field-math-foundations — L132] (line 132, col 3, score 1)
- Local-First Intention→Code Loop with Free Models — L145$local-first-intention-code-loop-with-free-models.md#L145 (line 145, col 1, score 1)
- Local-First Intention→Code Loop with Free Models — L145$local-first-intention-code-loop-with-free-models.md#L145 (line 145, col 3, score 1)
- [api-gateway-versioning#L286|api-gateway-versioning — L286] (line 286, col 1, score 1)
- [api-gateway-versioning#L286|api-gateway-versioning — L286] (line 286, col 3, score 1)
- [mongo-outbox-implementation#L560|Mongo Outbox Implementation — L560] (line 560, col 1, score 1)
- [mongo-outbox-implementation#L560|Mongo Outbox Implementation — L560] (line 560, col 3, score 1)
- [prometheus-observability-stack#L504|Prometheus Observability Stack — L504] (line 504, col 1, score 1)
- [prometheus-observability-stack#L504|Prometheus Observability Stack — L504] (line 504, col 3, score 1)
- [api-gateway-versioning#L292|api-gateway-versioning — L292] (line 292, col 1, score 0.93)
- [api-gateway-versioning#L292|api-gateway-versioning — L292] (line 292, col 3, score 0.93)
- [i3-config-validation-methods#L55|i3-config-validation-methods — L55] (line 55, col 1, score 1)
- [i3-config-validation-methods#L55|i3-config-validation-methods — L55] (line 55, col 3, score 1)
- [local-only-llm-workflow#L182|Local-Only-LLM-Workflow — L182] (line 182, col 1, score 1)
- [local-only-llm-workflow#L182|Local-Only-LLM-Workflow — L182] (line 182, col 3, score 1)
- [migrate-to-provider-tenant-architecture#L278|Migrate to Provider-Tenant Architecture — L278] (line 278, col 1, score 1)
- [migrate-to-provider-tenant-architecture#L278|Migrate to Provider-Tenant Architecture — L278] (line 278, col 3, score 1)
- [post-linguistic-transhuman-design-frameworks#L91|Post-Linguistic Transhuman Design Frameworks — L91] (line 91, col 1, score 1)
- [post-linguistic-transhuman-design-frameworks#L91|Post-Linguistic Transhuman Design Frameworks — L91] (line 91, col 3, score 1)
- [docs/unique/agent-tasks-persistence-migration-to-dualstore#L133|Agent Tasks: Persistence Migration to DualStore — L133] (line 133, col 1, score 1)
- [docs/unique/agent-tasks-persistence-migration-to-dualstore#L133|Agent Tasks: Persistence Migration to DualStore — L133] (line 133, col 3, score 1)
- [docs/unique/aionian-circuit-math#L151|aionian-circuit-math — L151] (line 151, col 1, score 1)
- [docs/unique/aionian-circuit-math#L151|aionian-circuit-math — L151] (line 151, col 3, score 1)
- [Math Fundamentals — L14]chunks/math-fundamentals.md#L14 (line 14, col 1, score 1)
- [Math Fundamentals — L14]chunks/math-fundamentals.md#L14 (line 14, col 3, score 1)
- [docs/unique/ecs-offload-workers#L460|ecs-offload-workers — L460] (line 460, col 1, score 1)
- [docs/unique/ecs-offload-workers#L460|ecs-offload-workers — L460] (line 460, col 3, score 1)
- [promethean-full-stack-docker-setup#L437|Promethean Full-Stack Docker Setup — L437] (line 437, col 1, score 1)
- [promethean-full-stack-docker-setup#L437|Promethean Full-Stack Docker Setup — L437] (line 437, col 3, score 1)
- [promethean-web-ui-setup#L604|Promethean Web UI Setup — L604] (line 604, col 1, score 1)
- [promethean-web-ui-setup#L604|Promethean Web UI Setup — L604] (line 604, col 3, score 1)
- [pure-typescript-search-microservice#L522|Pure TypeScript Search Microservice — L522] (line 522, col 1, score 1)
- [pure-typescript-search-microservice#L522|Pure TypeScript Search Microservice — L522] (line 522, col 3, score 1)
- [promethean-web-ui-setup#L615|Promethean Web UI Setup — L615] (line 615, col 1, score 0.94)
- [promethean-web-ui-setup#L615|Promethean Web UI Setup — L615] (line 615, col 3, score 0.94)
- [i3-config-validation-methods#L56|i3-config-validation-methods — L56] (line 56, col 1, score 1)
- [i3-config-validation-methods#L56|i3-config-validation-methods — L56] (line 56, col 3, score 1)
- Local-First Intention→Code Loop with Free Models — L143$local-first-intention-code-loop-with-free-models.md#L143 (line 143, col 1, score 1)
- Local-First Intention→Code Loop with Free Models — L143$local-first-intention-code-loop-with-free-models.md#L143 (line 143, col 3, score 1)
- [ollama-llm-provider-for-pseudo-code-transpiler#L167|Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L167] (line 167, col 1, score 1)
- [ollama-llm-provider-for-pseudo-code-transpiler#L167|Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L167] (line 167, col 3, score 1)
- [performance-optimized-polyglot-bridge#L438|Performance-Optimized-Polyglot-Bridge — L438] (line 438, col 1, score 1)
- [performance-optimized-polyglot-bridge#L438|Performance-Optimized-Polyglot-Bridge — L438] (line 438, col 3, score 1)
- [per-domain-policy-system-for-js-crawler#L471|Per-Domain Policy System for JS Crawler — L471] (line 471, col 1, score 1)
- [per-domain-policy-system-for-js-crawler#L471|Per-Domain Policy System for JS Crawler — L471] (line 471, col 3, score 1)
- [promethean-web-ui-setup#L607|Promethean Web UI Setup — L607] (line 607, col 1, score 1)
- [promethean-web-ui-setup#L607|Promethean Web UI Setup — L607] (line 607, col 3, score 1)
- [prometheus-observability-stack#L509|Prometheus Observability Stack — L509] (line 509, col 1, score 1)
- [prometheus-observability-stack#L509|Prometheus Observability Stack — L509] (line 509, col 3, score 1)
- [per-domain-policy-system-for-js-crawler#L488|Per-Domain Policy System for JS Crawler — L488] (line 488, col 1, score 0.95)
- [per-domain-policy-system-for-js-crawler#L488|Per-Domain Policy System for JS Crawler — L488] (line 488, col 3, score 0.95)
- [migrate-to-provider-tenant-architecture#L276|Migrate to Provider-Tenant Architecture — L276] (line 276, col 1, score 1)
- [migrate-to-provider-tenant-architecture#L276|Migrate to Provider-Tenant Architecture — L276] (line 276, col 3, score 1)
- [promethean-agent-dsl-ts-scaffold#L832|Promethean Agent DSL TS Scaffold — L832] (line 832, col 1, score 1)
- [promethean-agent-dsl-ts-scaffold#L832|Promethean Agent DSL TS Scaffold — L832] (line 832, col 3, score 1)
- [shared-package-layout-clarification#L166|shared-package-layout-clarification — L166] (line 166, col 1, score 1)
- [shared-package-layout-clarification#L166|shared-package-layout-clarification — L166] (line 166, col 3, score 1)
- [voice-access-layer-design#L307|Voice Access Layer Design — L307] (line 307, col 1, score 1)
- [voice-access-layer-design#L307|Voice Access Layer Design — L307] (line 307, col 3, score 1)
- [docs/unique/agent-tasks-persistence-migration-to-dualstore#L132|Agent Tasks: Persistence Migration to DualStore — L132] (line 132, col 1, score 1)
- [docs/unique/agent-tasks-persistence-migration-to-dualstore#L132|Agent Tasks: Persistence Migration to DualStore — L132] (line 132, col 3, score 1)
- [docs/unique/eidolon-field-math-foundations#L136|eidolon-field-math-foundations — L136] (line 136, col 1, score 1)
- [docs/unique/eidolon-field-math-foundations#L136|eidolon-field-math-foundations — L136] (line 136, col 3, score 1)
- [migrate-to-provider-tenant-architecture#L269|Migrate to Provider-Tenant Architecture — L269] (line 269, col 1, score 1)
- [migrate-to-provider-tenant-architecture#L269|Migrate to Provider-Tenant Architecture — L269] (line 269, col 3, score 1)
- [pure-node-crawl-stack-with-playwright-and-crawlee#L425|Pure-Node Crawl Stack with Playwright and Crawlee — L425] (line 425, col 1, score 1)
- [pure-node-crawl-stack-with-playwright-and-crawlee#L425|Pure-Node Crawl Stack with Playwright and Crawlee — L425] (line 425, col 3, score 1)
- [docs/unique/agent-tasks-persistence-migration-to-dualstore#L134|Agent Tasks: Persistence Migration to DualStore — L134] (line 134, col 1, score 1)
- [docs/unique/agent-tasks-persistence-migration-to-dualstore#L134|Agent Tasks: Persistence Migration to DualStore — L134] (line 134, col 3, score 1)
- [docs/unique/aionian-circuit-math#L156|aionian-circuit-math — L156] (line 156, col 1, score 1)
- [docs/unique/aionian-circuit-math#L156|aionian-circuit-math — L156] (line 156, col 3, score 1)
- [board-walk-2025-08-11#L136|Board Walk – 2025-08-11 — L136] (line 136, col 1, score 1)
- [board-walk-2025-08-11#L136|Board Walk – 2025-08-11 — L136] (line 136, col 3, score 1)
- [dynamic-context-model-for-web-components#L386|Dynamic Context Model for Web Components — L386] (line 386, col 1, score 1)
- [dynamic-context-model-for-web-components#L386|Dynamic Context Model for Web Components — L386] (line 386, col 3, score 1)
- [api-gateway-versioning#L288|api-gateway-versioning — L288] (line 288, col 1, score 1)
- [api-gateway-versioning#L288|api-gateway-versioning — L288] (line 288, col 3, score 1)
- [promethean-full-stack-docker-setup#L440|Promethean Full-Stack Docker Setup — L440] (line 440, col 1, score 1)
- [promethean-full-stack-docker-setup#L440|Promethean Full-Stack Docker Setup — L440] (line 440, col 3, score 1)
- [promethean-web-ui-setup#L603|Promethean Web UI Setup — L603] (line 603, col 1, score 1)
- [promethean-web-ui-setup#L603|Promethean Web UI Setup — L603] (line 603, col 3, score 1)
- [prometheus-observability-stack#L510|Prometheus Observability Stack — L510] (line 510, col 1, score 1)
- [prometheus-observability-stack#L510|Prometheus Observability Stack — L510] (line 510, col 3, score 1)
- [promethean-full-stack-docker-setup#L436|Promethean Full-Stack Docker Setup — L436] (line 436, col 1, score 1)
- [promethean-full-stack-docker-setup#L436|Promethean Full-Stack Docker Setup — L436] (line 436, col 3, score 1)
- [pure-node-crawl-stack-with-playwright-and-crawlee#L428|Pure-Node Crawl Stack with Playwright and Crawlee — L428] (line 428, col 1, score 1)
- [pure-node-crawl-stack-with-playwright-and-crawlee#L428|Pure-Node Crawl Stack with Playwright and Crawlee — L428] (line 428, col 3, score 1)
- [pure-typescript-search-microservice#L521|Pure TypeScript Search Microservice — L521] (line 521, col 1, score 1)
- [pure-typescript-search-microservice#L521|Pure TypeScript Search Microservice — L521] (line 521, col 3, score 1)
- [rag-ui-panel-with-qdrant-and-postgrest#L364|RAG UI Panel with Qdrant and PostgREST — L364] (line 364, col 1, score 1)
- [rag-ui-panel-with-qdrant-and-postgrest#L364|RAG UI Panel with Qdrant and PostgREST — L364] (line 364, col 3, score 1)
- [ai-centric-os-with-mcp-layer#L403|AI-Centric OS with MCP Layer — L403] (line 403, col 1, score 1)
- [ai-centric-os-with-mcp-layer#L403|AI-Centric OS with MCP Layer — L403] (line 403, col 3, score 1)
- [local-offline-model-deployment-strategy#L293|Local-Offline-Model-Deployment-Strategy — L293] (line 293, col 1, score 1)
- [local-offline-model-deployment-strategy#L293|Local-Offline-Model-Deployment-Strategy — L293] (line 293, col 3, score 1)
- [migrate-to-provider-tenant-architecture#L281|Migrate to Provider-Tenant Architecture — L281] (line 281, col 1, score 1)
- [migrate-to-provider-tenant-architecture#L281|Migrate to Provider-Tenant Architecture — L281] (line 281, col 3, score 1)
- [observability-infrastructure-setup#L361|observability-infrastructure-setup — L361] (line 361, col 1, score 1)
- [observability-infrastructure-setup#L361|observability-infrastructure-setup — L361] (line 361, col 3, score 1)
- [api-gateway-versioning#L287|api-gateway-versioning — L287] (line 287, col 1, score 1)
- [api-gateway-versioning#L287|api-gateway-versioning — L287] (line 287, col 3, score 1)
- [docs/unique/agent-tasks-persistence-migration-to-dualstore#L130|Agent Tasks: Persistence Migration to DualStore — L130] (line 130, col 1, score 1)
- [docs/unique/agent-tasks-persistence-migration-to-dualstore#L130|Agent Tasks: Persistence Migration to DualStore — L130] (line 130, col 3, score 1)
- [docs/unique/aionian-circuit-math#L159|aionian-circuit-math — L159] (line 159, col 1, score 1)
- [docs/unique/aionian-circuit-math#L159|aionian-circuit-math — L159] (line 159, col 3, score 1)
- [board-walk-2025-08-11#L134|Board Walk – 2025-08-11 — L134] (line 134, col 1, score 1)
- [board-walk-2025-08-11#L134|Board Walk – 2025-08-11 — L134] (line 134, col 3, score 1)
- [chroma-toolkit-consolidation-plan#L168|Chroma Toolkit Consolidation Plan — L168] (line 168, col 1, score 1)
- [chroma-toolkit-consolidation-plan#L168|Chroma Toolkit Consolidation Plan — L168] (line 168, col 3, score 1)
- [promethean-web-ui-setup#L602|Promethean Web UI Setup — L602] (line 602, col 1, score 1)
- [promethean-web-ui-setup#L602|Promethean Web UI Setup — L602] (line 602, col 3, score 1)
- [prometheus-observability-stack#L506|Prometheus Observability Stack — L506] (line 506, col 1, score 1)
- [prometheus-observability-stack#L506|Prometheus Observability Stack — L506] (line 506, col 3, score 1)
- [pure-typescript-search-microservice#L526|Pure TypeScript Search Microservice — L526] (line 526, col 1, score 1)
- [pure-typescript-search-microservice#L526|Pure TypeScript Search Microservice — L526] (line 526, col 3, score 1)
- [rag-ui-panel-with-qdrant-and-postgrest#L362|RAG UI Panel with Qdrant and PostgREST — L362] (line 362, col 1, score 1)
- [rag-ui-panel-with-qdrant-and-postgrest#L362|RAG UI Panel with Qdrant and PostgREST — L362] (line 362, col 3, score 1)
- [admin-dashboard-for-user-management#L41|Admin Dashboard for User Management — L41] (line 41, col 1, score 1)
- [admin-dashboard-for-user-management#L41|Admin Dashboard for User Management — L41] (line 41, col 3, score 1)
- [docs/unique/ecs-offload-workers#L461|ecs-offload-workers — L461] (line 461, col 1, score 1)
- [docs/unique/ecs-offload-workers#L461|ecs-offload-workers — L461] (line 461, col 3, score 1)
- [ecs-scheduler-and-prefabs#L397|ecs-scheduler-and-prefabs — L397] (line 397, col 1, score 1)
- [ecs-scheduler-and-prefabs#L397|ecs-scheduler-and-prefabs — L397] (line 397, col 3, score 1)
- [local-only-llm-workflow#L173|Local-Only-LLM-Workflow — L173] (line 173, col 1, score 1)
- [local-only-llm-workflow#L173|Local-Only-LLM-Workflow — L173] (line 173, col 3, score 1)
- [observability-infrastructure-setup#L368|observability-infrastructure-setup — L368] (line 368, col 1, score 1)
- [observability-infrastructure-setup#L368|observability-infrastructure-setup — L368] (line 368, col 3, score 1)
- [dynamic-context-model-for-web-components#L401|Dynamic Context Model for Web Components — L401] (line 401, col 1, score 0.98)
- [dynamic-context-model-for-web-components#L401|Dynamic Context Model for Web Components — L401] (line 401, col 3, score 0.98)
- [dynamic-context-model-for-web-components#L400|Dynamic Context Model for Web Components — L400] (line 400, col 1, score 0.98)
- [dynamic-context-model-for-web-components#L400|Dynamic Context Model for Web Components — L400] (line 400, col 3, score 0.98)
- [prometheus-observability-stack#L514|Prometheus Observability Stack — L514] (line 514, col 1, score 0.99)
- [prometheus-observability-stack#L514|Prometheus Observability Stack — L514] (line 514, col 3, score 0.99)
- [per-domain-policy-system-for-js-crawler#L485|Per-Domain Policy System for JS Crawler — L485] (line 485, col 1, score 0.99)
- [per-domain-policy-system-for-js-crawler#L485|Per-Domain Policy System for JS Crawler — L485] (line 485, col 3, score 0.99)
- [per-domain-policy-system-for-js-crawler#L487|Per-Domain Policy System for JS Crawler — L487] (line 487, col 1, score 0.99)
- [per-domain-policy-system-for-js-crawler#L487|Per-Domain Policy System for JS Crawler — L487] (line 487, col 3, score 0.99)
- [per-domain-policy-system-for-js-crawler#L489|Per-Domain Policy System for JS Crawler — L489] (line 489, col 1, score 0.99)
- [per-domain-policy-system-for-js-crawler#L489|Per-Domain Policy System for JS Crawler — L489] (line 489, col 3, score 0.99)
- [migrate-to-provider-tenant-architecture#L287|Migrate to Provider-Tenant Architecture — L287] (line 287, col 1, score 1)
- [migrate-to-provider-tenant-architecture#L287|Migrate to Provider-Tenant Architecture — L287] (line 287, col 3, score 1)
- [docs/unique/agent-tasks-persistence-migration-to-dualstore#L140|Agent Tasks: Persistence Migration to DualStore — L140] (line 140, col 1, score 0.99)
- [docs/unique/agent-tasks-persistence-migration-to-dualstore#L140|Agent Tasks: Persistence Migration to DualStore — L140] (line 140, col 3, score 0.99)
- [pure-node-crawl-stack-with-playwright-and-crawlee#L435|Pure-Node Crawl Stack with Playwright and Crawlee — L435] (line 435, col 1, score 0.99)
- [pure-node-crawl-stack-with-playwright-and-crawlee#L435|Pure-Node Crawl Stack with Playwright and Crawlee — L435] (line 435, col 3, score 0.99)
- [pure-node-crawl-stack-with-playwright-and-crawlee#L431|Pure-Node Crawl Stack with Playwright and Crawlee — L431] (line 431, col 1, score 0.99)
- [pure-node-crawl-stack-with-playwright-and-crawlee#L431|Pure-Node Crawl Stack with Playwright and Crawlee — L431] (line 431, col 3, score 0.99)
- [shared-package-structure#L173|Shared Package Structure — L173] (line 173, col 1, score 1)
- [shared-package-structure#L173|Shared Package Structure — L173] (line 173, col 3, score 1)
- [i3-config-validation-methods#L60|i3-config-validation-methods — L60] (line 60, col 1, score 0.98)
- [i3-config-validation-methods#L60|i3-config-validation-methods — L60] (line 60, col 3, score 0.98)
- [shared-package-structure#L176|Shared Package Structure — L176] (line 176, col 1, score 0.98)
- [shared-package-structure#L176|Shared Package Structure — L176] (line 176, col 3, score 0.98)
- [shared-package-structure#L172|Shared Package Structure — L172] (line 172, col 1, score 0.98)
- [shared-package-structure#L172|Shared Package Structure — L172] (line 172, col 3, score 0.98)
- [shared-package-layout-clarification#L177|shared-package-layout-clarification — L177] (line 177, col 1, score 0.99)
- [shared-package-layout-clarification#L177|shared-package-layout-clarification — L177] (line 177, col 3, score 0.99)
- [voice-access-layer-design#L330|Voice Access Layer Design — L330] (line 330, col 1, score 0.98)
- [voice-access-layer-design#L330|Voice Access Layer Design — L330] (line 330, col 3, score 0.98)
- [shared-package-layout-clarification#L180|shared-package-layout-clarification — L180] (line 180, col 1, score 0.97)
- [shared-package-layout-clarification#L180|shared-package-layout-clarification — L180] (line 180, col 3, score 0.97)
- [shared-package-layout-clarification#L179|shared-package-layout-clarification — L179] (line 179, col 1, score 0.97)
- [shared-package-layout-clarification#L179|shared-package-layout-clarification — L179] (line 179, col 3, score 0.97)
- [pure-typescript-search-microservice#L530|Pure TypeScript Search Microservice — L530] (line 530, col 1, score 1)
- [pure-typescript-search-microservice#L530|Pure TypeScript Search Microservice — L530] (line 530, col 3, score 1)
- [promethean-full-stack-docker-setup#L445|Promethean Full-Stack Docker Setup — L445] (line 445, col 1, score 0.98)
- [promethean-full-stack-docker-setup#L445|Promethean Full-Stack Docker Setup — L445] (line 445, col 3, score 0.98)
- [promethean-web-ui-setup#L613|Promethean Web UI Setup — L613] (line 613, col 1, score 0.98)
- [promethean-web-ui-setup#L613|Promethean Web UI Setup — L613] (line 613, col 3, score 0.98)
- [api-gateway-versioning#L295|api-gateway-versioning — L295] (line 295, col 1, score 1)
- [api-gateway-versioning#L295|api-gateway-versioning — L295] (line 295, col 3, score 1)
- [promethean-native-config-design#L396|Promethean-native config design — L396] (line 396, col 1, score 0.99)
- [promethean-native-config-design#L396|Promethean-native config design — L396] (line 396, col 3, score 0.99)
- [promethean-native-config-design#L395|Promethean-native config design — L395] (line 395, col 1, score 0.99)
- [promethean-native-config-design#L395|Promethean-native config design — L395] (line 395, col 3, score 0.99)
- [sibilant-meta-prompt-dsl#L207|Sibilant Meta-Prompt DSL — L207] (line 207, col 1, score 0.98)
- [sibilant-meta-prompt-dsl#L207|Sibilant Meta-Prompt DSL — L207] (line 207, col 3, score 0.98)
- [docs/unique/eidolon-field-math-foundations#L154|eidolon-field-math-foundations — L154] (line 154, col 1, score 1)
- [docs/unique/eidolon-field-math-foundations#L154|eidolon-field-math-foundations — L154] (line 154, col 3, score 1)
- [local-only-llm-workflow#L190|Local-Only-LLM-Workflow — L190] (line 190, col 1, score 1)
- [local-only-llm-workflow#L190|Local-Only-LLM-Workflow — L190] (line 190, col 3, score 1)
- [performance-optimized-polyglot-bridge#L454|Performance-Optimized-Polyglot-Bridge — L454] (line 454, col 1, score 1)
- [performance-optimized-polyglot-bridge#L454|Performance-Optimized-Polyglot-Bridge — L454] (line 454, col 3, score 1)
- [polyglot-s-expr-bridge-python-js-lisp-interop#L527|Polyglot S-expr Bridge: Python-JS-Lisp Interop — L527] (line 527, col 1, score 1)
- [polyglot-s-expr-bridge-python-js-lisp-interop#L527|Polyglot S-expr Bridge: Python-JS-Lisp Interop — L527] (line 527, col 3, score 1)
- [docs/unique/eidolon-field-math-foundations#L155|eidolon-field-math-foundations — L155] (line 155, col 1, score 1)
- [docs/unique/eidolon-field-math-foundations#L155|eidolon-field-math-foundations — L155] (line 155, col 3, score 1)
- [local-only-llm-workflow#L191|Local-Only-LLM-Workflow — L191] (line 191, col 1, score 1)
- [local-only-llm-workflow#L191|Local-Only-LLM-Workflow — L191] (line 191, col 3, score 1)
- [performance-optimized-polyglot-bridge#L455|Performance-Optimized-Polyglot-Bridge — L455] (line 455, col 1, score 1)
- [performance-optimized-polyglot-bridge#L455|Performance-Optimized-Polyglot-Bridge — L455] (line 455, col 3, score 1)
- [polyglot-s-expr-bridge-python-js-lisp-interop#L528|Polyglot S-expr Bridge: Python-JS-Lisp Interop — L528] (line 528, col 1, score 1)
- [polyglot-s-expr-bridge-python-js-lisp-interop#L528|Polyglot S-expr Bridge: Python-JS-Lisp Interop — L528] (line 528, col 3, score 1)
- [docs/unique/eidolon-field-math-foundations#L156|eidolon-field-math-foundations — L156] (line 156, col 1, score 1)
- [docs/unique/eidolon-field-math-foundations#L156|eidolon-field-math-foundations — L156] (line 156, col 3, score 1)
- [local-only-llm-workflow#L192|Local-Only-LLM-Workflow — L192] (line 192, col 1, score 1)
- [local-only-llm-workflow#L192|Local-Only-LLM-Workflow — L192] (line 192, col 3, score 1)
- [performance-optimized-polyglot-bridge#L456|Performance-Optimized-Polyglot-Bridge — L456] (line 456, col 1, score 1)
- [performance-optimized-polyglot-bridge#L456|Performance-Optimized-Polyglot-Bridge — L456] (line 456, col 3, score 1)
- [polyglot-s-expr-bridge-python-js-lisp-interop#L529|Polyglot S-expr Bridge: Python-JS-Lisp Interop — L529] (line 529, col 1, score 1)
- [polyglot-s-expr-bridge-python-js-lisp-interop#L529|Polyglot S-expr Bridge: Python-JS-Lisp Interop — L529] (line 529, col 3, score 1)
- [docs/unique/eidolon-field-math-foundations#L157|eidolon-field-math-foundations — L157] (line 157, col 1, score 1)
- [docs/unique/eidolon-field-math-foundations#L157|eidolon-field-math-foundations — L157] (line 157, col 3, score 1)
- [local-only-llm-workflow#L193|Local-Only-LLM-Workflow — L193] (line 193, col 1, score 1)
- [local-only-llm-workflow#L193|Local-Only-LLM-Workflow — L193] (line 193, col 3, score 1)
- [performance-optimized-polyglot-bridge#L457|Performance-Optimized-Polyglot-Bridge — L457] (line 457, col 1, score 1)
- [performance-optimized-polyglot-bridge#L457|Performance-Optimized-Polyglot-Bridge — L457] (line 457, col 3, score 1)
- [polyglot-s-expr-bridge-python-js-lisp-interop#L530|Polyglot S-expr Bridge: Python-JS-Lisp Interop — L530] (line 530, col 1, score 1)
- [polyglot-s-expr-bridge-python-js-lisp-interop#L530|Polyglot S-expr Bridge: Python-JS-Lisp Interop — L530] (line 530, col 3, score 1)
- [docs/unique/eidolon-field-math-foundations#L158|eidolon-field-math-foundations — L158] (line 158, col 1, score 1)
- [docs/unique/eidolon-field-math-foundations#L158|eidolon-field-math-foundations — L158] (line 158, col 3, score 1)
- [local-only-llm-workflow#L194|Local-Only-LLM-Workflow — L194] (line 194, col 1, score 1)
- [local-only-llm-workflow#L194|Local-Only-LLM-Workflow — L194] (line 194, col 3, score 1)
- [performance-optimized-polyglot-bridge#L458|Performance-Optimized-Polyglot-Bridge — L458] (line 458, col 1, score 1)
- [performance-optimized-polyglot-bridge#L458|Performance-Optimized-Polyglot-Bridge — L458] (line 458, col 3, score 1)
- [polyglot-s-expr-bridge-python-js-lisp-interop#L531|Polyglot S-expr Bridge: Python-JS-Lisp Interop — L531] (line 531, col 1, score 1)
- [polyglot-s-expr-bridge-python-js-lisp-interop#L531|Polyglot S-expr Bridge: Python-JS-Lisp Interop — L531] (line 531, col 3, score 1)
- [docs/unique/agent-tasks-persistence-migration-to-dualstore#L147|Agent Tasks: Persistence Migration to DualStore — L147] (line 147, col 1, score 0.99)
- [docs/unique/agent-tasks-persistence-migration-to-dualstore#L147|Agent Tasks: Persistence Migration to DualStore — L147] (line 147, col 3, score 0.99)
- [docs/unique/ecs-offload-workers#L477|ecs-offload-workers — L477] (line 477, col 1, score 0.99)
- [docs/unique/ecs-offload-workers#L477|ecs-offload-workers — L477] (line 477, col 3, score 0.99)
- [ecs-scheduler-and-prefabs#L427|ecs-scheduler-and-prefabs — L427] (line 427, col 1, score 0.99)
- [ecs-scheduler-and-prefabs#L427|ecs-scheduler-and-prefabs — L427] (line 427, col 3, score 0.99)
- [markdown-to-org-transpiler#L314|markdown-to-org-transpiler — L314] (line 314, col 1, score 0.99)
- [markdown-to-org-transpiler#L314|markdown-to-org-transpiler — L314] (line 314, col 3, score 0.99)
- [performance-optimized-polyglot-bridge#L452|Performance-Optimized-Polyglot-Bridge — L452] (line 452, col 1, score 1)
- [performance-optimized-polyglot-bridge#L452|Performance-Optimized-Polyglot-Bridge — L452] (line 452, col 3, score 1)
- [polyglot-s-expr-bridge-python-js-lisp-interop#L525|Polyglot S-expr Bridge: Python-JS-Lisp Interop — L525] (line 525, col 1, score 1)
- [polyglot-s-expr-bridge-python-js-lisp-interop#L525|Polyglot S-expr Bridge: Python-JS-Lisp Interop — L525] (line 525, col 3, score 1)
- [ollama-llm-provider-for-pseudo-code-transpiler#L175|Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L175] (line 175, col 1, score 0.99)
- [ollama-llm-provider-for-pseudo-code-transpiler#L175|Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L175] (line 175, col 3, score 0.99)
- [universal-intention-code-fabric#L444|universal-intention-code-fabric — L444] (line 444, col 1, score 0.99)
- [universal-intention-code-fabric#L444|universal-intention-code-fabric — L444] (line 444, col 3, score 0.99)
```
>>>>>>> stealth/obsidian
```
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
