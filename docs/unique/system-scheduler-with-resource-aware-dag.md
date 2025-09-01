---
uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
created_at: 2025.08.08.21.08.68.md
filename: System Scheduler with Resource-Aware DAG
description: >-
  A real-time system scheduler for ECS that handles resource-aware dependency
  graphs, conflict-aware batching, and prefab/blueprint management. Integrates
  with existing ECS and graph systems for efficient parallel execution.
tags:
  - scheduler
  - ecs
  - resource
  - dag
  - batching
  - prefab
  - blueprint
  - dependency
  - parallelism
related_to_title:
  - ecs-scheduler-and-prefabs
  - ecs-offload-workers
  - Prompt_Folder_Bootstrap
  - markdown-to-org-transpiler
  - Ollama-LLM-Provider-for-Pseudo-Code-Transpiler
  - Promethean Infrastructure Setup
  - eidolon-field-math-foundations
  - archetype-ecs
  - Performance-Optimized-Polyglot-Bridge
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - JavaScript
  - compiler-kit-foundations
  - Chroma Toolkit Consolidation Plan
  - Local-First Intention→Code Loop with Free Models
  - Interop and Source Maps
  - js-to-lisp-reverse-compiler
  - 'Agent Tasks: Persistence Migration to DualStore'
  - aionian-circuit-math
  - Math Fundamentals
  - Local-Only-LLM-Workflow
  - api-gateway-versioning
  - Debugging Broker Connections and Agent Behavior
  - Dynamic Context Model for Web Components
  - Admin Dashboard for User Management
  - graph-ds
  - Agent Reflections and Prompt Evolution
  - Canonical Org-Babel Matplotlib Animation Template
  - zero-copy-snapshots-and-workers
related_to_uuid:
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - bd4f0976-0d5b-47f6-a20a-0601d1842dc1
  - ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
  - b362e12e-2802-4e41-9a21-6e0c7ad419a2
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - f5579967-762d-4cfd-851e-4f71b4cb77a1
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - c1618c66-f73a-4e04-9bfa-ef38755f7acc
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - 871490c7-a050-429b-88b2-55dfeaa1f8d5
  - cdfac40c-00e4-458f-96a7-4c37d0278731
  - 58191024-d04a-4520-8aae-a18be7b94263
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - 0580dcd3-533d-4834-8a2f-eae3771960a9
  - 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 2901a3e9-96f0-497c-ae2c-775f28a702dd
  - 6620e2f2-de6d-45d8-a722-5d26e160b370
  - bb7f0835-c347-474f-bfad-eabd873b51ad
  - 1b1338fc-bb4d-41df-828f-e219cc9442eb
  - 62bec6f0-4e13-4f38-aca4-72c84ba02367
references:
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 3
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 7
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 246
    col: 1
    score: 1
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 366
    col: 1
    score: 0.87
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 310
    col: 1
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 24
    col: 1
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 42
    col: 1
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 66
    col: 1
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 84
    col: 1
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 103
    col: 1
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 130
    col: 1
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 152
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 338
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 340
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 352
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 364
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 368
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 379
    col: 1
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 446
    col: 1
    score: 1
  - uuid: ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
    line: 289
    col: 1
    score: 1
  - uuid: b362e12e-2802-4e41-9a21-6e0c7ad419a2
    line: 153
    col: 1
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 558
    col: 1
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 105
    col: 1
    score: 0.88
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 429
    col: 1
    score: 0.85
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 497
    col: 1
    score: 0.85
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 381
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 381
    col: 3
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 382
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 382
    col: 3
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 450
    col: 1
    score: 0.9
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 450
    col: 3
    score: 0.9
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 383
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 383
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
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 170
    col: 1
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 170
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
    line: 284
    col: 1
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 284
    col: 3
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 40
    col: 1
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 40
    col: 3
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 384
    col: 1
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 384
    col: 3
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 458
    col: 1
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 458
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
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 16
    col: 1
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 16
    col: 3
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 466
    col: 1
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 466
    col: 3
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 394
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 394
    col: 3
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 367
    col: 1
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 367
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
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 611
    col: 1
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 611
    col: 3
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 462
    col: 1
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 462
    col: 3
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 398
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 398
    col: 3
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 517
    col: 1
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 517
    col: 3
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 472
    col: 1
    score: 0.98
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 472
    col: 3
    score: 0.98
  - uuid: ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
    line: 309
    col: 1
    score: 0.98
  - uuid: ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
    line: 309
    col: 3
    score: 0.98
  - uuid: b362e12e-2802-4e41-9a21-6e0c7ad419a2
    line: 176
    col: 1
    score: 0.98
  - uuid: b362e12e-2802-4e41-9a21-6e0c7ad419a2
    line: 176
    col: 3
    score: 0.98
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 28
    col: 1
    score: 0.97
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 28
    col: 3
    score: 0.97
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 463
    col: 1
    score: 0.98
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 463
    col: 3
    score: 0.98
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 408
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 408
    col: 3
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 193
    col: 1
    score: 0.97
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 193
    col: 3
    score: 0.97
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 410
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 410
    col: 3
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 194
    col: 1
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 194
    col: 3
    score: 0.99
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 411
    col: 1
    score: 0.99
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 411
    col: 3
    score: 0.99
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 413
    col: 1
    score: 0.98
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 413
    col: 3
    score: 0.98
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 195
    col: 1
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 195
    col: 3
    score: 0.99
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 412
    col: 1
    score: 0.99
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 412
    col: 3
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 196
    col: 1
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 196
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
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 197
    col: 1
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 197
    col: 3
    score: 0.99
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 416
    col: 1
    score: 0.98
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 416
    col: 3
    score: 0.98
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 414
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 414
    col: 3
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 198
    col: 1
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 198
    col: 3
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 199
    col: 1
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 199
    col: 3
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 200
    col: 1
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 200
    col: 3
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 201
    col: 1
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 201
    col: 3
    score: 0.99
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 190
    col: 1
    score: 0.97
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 190
    col: 3
    score: 0.97
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 422
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 422
    col: 3
    score: 1
  - uuid: ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
    line: 310
    col: 1
    score: 1
  - uuid: ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
    line: 310
    col: 3
    score: 1
  - uuid: b362e12e-2802-4e41-9a21-6e0c7ad419a2
    line: 177
    col: 1
    score: 1
  - uuid: b362e12e-2802-4e41-9a21-6e0c7ad419a2
    line: 177
    col: 3
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 155
    col: 1
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 155
    col: 3
    score: 0.99
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 474
    col: 1
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 474
    col: 3
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 424
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 424
    col: 3
    score: 1
  - uuid: b362e12e-2802-4e41-9a21-6e0c7ad419a2
    line: 179
    col: 1
    score: 1
  - uuid: b362e12e-2802-4e41-9a21-6e0c7ad419a2
    line: 179
    col: 3
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 157
    col: 1
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 157
    col: 3
    score: 0.98
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 475
    col: 1
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 475
    col: 3
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 425
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 425
    col: 3
    score: 1
  - uuid: ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
    line: 312
    col: 1
    score: 1
  - uuid: ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
    line: 312
    col: 3
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 194
    col: 1
    score: 0.99
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 194
    col: 3
    score: 0.99
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 476
    col: 1
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 476
    col: 3
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 426
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 426
    col: 3
    score: 1
  - uuid: ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
    line: 313
    col: 1
    score: 1
  - uuid: ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
    line: 313
    col: 3
    score: 1
  - uuid: b362e12e-2802-4e41-9a21-6e0c7ad419a2
    line: 180
    col: 1
    score: 1
  - uuid: b362e12e-2802-4e41-9a21-6e0c7ad419a2
    line: 180
    col: 3
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 147
    col: 1
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 147
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
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 478
    col: 1
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 478
    col: 3
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 428
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 428
    col: 3
    score: 1
  - uuid: ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
    line: 315
    col: 1
    score: 1
  - uuid: ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
    line: 315
    col: 3
    score: 1
  - uuid: b362e12e-2802-4e41-9a21-6e0c7ad419a2
    line: 182
    col: 1
    score: 1
  - uuid: b362e12e-2802-4e41-9a21-6e0c7ad419a2
    line: 182
    col: 3
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 479
    col: 1
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 479
    col: 3
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 429
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 429
    col: 3
    score: 1
  - uuid: ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
    line: 316
    col: 1
    score: 1
  - uuid: ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
    line: 316
    col: 3
    score: 1
  - uuid: b362e12e-2802-4e41-9a21-6e0c7ad419a2
    line: 183
    col: 1
    score: 1
  - uuid: b362e12e-2802-4e41-9a21-6e0c7ad419a2
    line: 183
    col: 3
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 480
    col: 1
    score: 0.98
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 480
    col: 3
    score: 0.98
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 434
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 434
    col: 3
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 435
    col: 1
    score: 0.99
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 435
    col: 3
    score: 0.99
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 373
    col: 1
    score: 0.99
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 373
    col: 3
    score: 0.99
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 375
    col: 1
    score: 0.98
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 375
    col: 3
    score: 0.98
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 191
    col: 1
    score: 0.98
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 191
    col: 3
    score: 0.98
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 481
    col: 1
    score: 0.98
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 481
    col: 3
    score: 0.98
---
Heck yes—let’s wire a **real system scheduler** on top of the ECS you’ve got, plus **resources**, **dependency graph**, **conflict-aware batching**, and **prefabs/blueprints**. Paste these under `shared/js/prom-lib/ds/`.

# 1) System Scheduler (archetype ECS + resource-aware DAG)

```ts
// shared/js/prom-lib/ds/ecs.scheduler.ts
// MIT. Zero deps (uses your World from ecs.ts and Graph from graph.ts)

import { World, CommandBuffer, ComponentType, Query } from "./ecs";
import { Graph } from "./graph";

export type Stage = "startup" | "update" | "late" | "render" | "cleanup";
export const DEFAULT_STAGE_ORDER: Stage[] = ["startup","update","late","render","cleanup"];

export type ResourceName = string;

export interface SystemContext {
  world: World;
  dt: number;
  time: number;
  resources: ResourceBag;
  cmd: CommandBuffer;
  stage: Stage;
}

export interface QuerySpec {
  all?: ComponentType<any>[];
  any?: ComponentType<any>[];
  none?: ComponentType<any>[];
  changed?: ComponentType<any>[];
}

export interface SystemSpec {
  name: string;
  stage?: Stage;
  before?: string[];                 // run before these
  after?: string[];                  // run after these
  reads?: ResourceName[];            // read-only resources
  writes?: ResourceName[];           // write resources (conflicts block parallelism)
  readsComponents?: ComponentType<any>[];   // optional: component reads (for conflict hints)
  writesComponents?: ComponentType<any>[];  // optional: component writes
  query?: (w: World) => QuerySpec;   // build once at compile-time
  run(ctx: SystemContext): void | Promise<void>;
  // Optional: skip this system if its query has no matching entities this frame
  skipIfEmpty?: boolean;
}

export type CompiledSystem = SystemSpec & {
  id: string;
  stage: Stage;
  queryMask?: Query;                 // compiled bitmasks
};

export type Batch = { stage: Stage; systems: CompiledSystem[] };

export interface SchedulePlan {
  stages: Stage[];
  batchesByStage: Map<Stage, Batch[]>; // each batch can run in parallel (conflict-free)
  topoOrder: string[];                 // flattened order (for debugging)
}

export class ResourceBag {
  private map = new Map<ResourceName, any>();
  define<T>(name: ResourceName, initial: T): this {
    if (this.map.has(name)) throw new Error(`resource exists: ${name}`);
    this.map.set(name, initial);
    return this;
  }
  get<T>(name: ResourceName): T {
    if (!this.map.has(name)) throw new Error(`missing resource: ${name}`);
    return this.map.get(name);
  }
  set<T>(name: ResourceName, value: T): void {
    if (!this.map.has(name)) throw new Error(`missing resource: ${name}`);
    this.map.set(name, value);
  }
  has(name: ResourceName) { return this.map.has(name); }
}

export class Scheduler {
  private world: World;
  private systems: SystemSpec[] = [];
  private resources = new ResourceBag();
  private plan?: SchedulePlan;
  private stageOrder: Stage[];

  constructor(world: World, stageOrder: Stage[] = DEFAULT_STAGE_ORDER) {
    this.world = world;
    this.stageOrder = stageOrder.slice();
  }

  resourcesBag() { return this.resources; }

  register(sys: SystemSpec): this {
    if (!sys.name) throw new Error("system must have a name");
    this.systems.push(sys);
    return this;
  }

  compile(): SchedulePlan {
    // expand & compile queries
    const compiled: CompiledSystem[] = this.systems.map(s => {
      const stage = s.stage ?? "update";
      let queryMask: Query | undefined;
      if (s.query) {
        const q = s.query(this.world);
        queryMask = this.world.makeQuery({
          all: q.all, any: q.any, none: q.none, changed: q.changed
        });
      }
      return { ...s, id: s.name, stage, queryMask };
    });

    // barrier edges for stage order
    const stageRank = new Map<Stage, number>(this.stageOrder.map((s, i) => [s, i]));

    // dependency graph
    const g = new Graph<{ sys: CompiledSystem }, { reason: string }>({ directed: true });
    for (const s of compiled) g.addNode(s.id, { sys: s });

    // explicit before/after
    for (const s of compiled) {
      for (const a of (s.after ?? [])) if (a !== s.name) g.addEdge(a, s.name, { data: { reason: "after" }});
      for (const b of (s.before ?? [])) if (b !== s.name) g.addEdge(s.name, b, { data: { reason: "before" }});
    }

    // stage barriers (later stage depends on earlier stage)
    for (const a of compiled) {
      for (const b of compiled) {
        if (a.id === b.id) continue;
        const ra = stageRank.get(a.stage)!;
        const rb = stageRank.get(b.stage)!;
        if (ra < rb) g.addEdge(a.id, b.id, { data: { reason: `stage:${a.stage}->${b.stage}` }});
      }
    }

    // conflict edges (resources + component write hazards)
    const reads = (s: CompiledSystem) => new Set([...(s.reads ?? []), ...(s.readsComponents ?? []).map(c => `cmp:${c.id}`)]);
    const writes = (s: CompiledSystem) => new Set([...(s.writes ?? []), ...(s.writesComponents ?? []).map(c => `cmp:${c.id}`)]);

    for (let i=0;i<compiled.length;i++) {
      for (let j=i+1;j<compiled.length;j++) {
        const A = compiled[i], B = compiled[j];
        // same stage only — different stages already ordered
        if (A.stage !== B.stage) continue;

        const rA = reads(A), wA = writes(A);
        const rB = reads(B), wB = writes(B);

        const writeRead = intersects(wA, union(rB, wB)) || intersects(wB, union(rA, wA));
        if (writeRead) {
          // order: writers before readers; if both write same, tie-break by name
          const conflictOn = [...intersection(union(wA,wB), union(rA,rB,wA,wB))][0] ?? "unknown";
          if (intersects(wA, union(rB, wB)) && !intersects(wB, union(rA, wA))) {
            g.addEdge(A.id, B.id, { data: { reason: `conflict:${conflictOn}` }});
          } else if (intersects(wB, union(rA, wA)) && !intersects(wA, union(rB, wB))) {
            g.addEdge(B.id, A.id, { data: { reason: `conflict:${conflictOn}` }});
          } else {
            // both write same thing; deterministic order by name
            const [first, second] = A.id < B.id ? [A, B] : [B, A];
            g.addEdge(first.id, second.id, { data: { reason: `conflict:${conflictOn}:tie` }});
          }
        }
      }
    }

    // topo sort
    const order = g.topologicalSort(); // throws if cycle
    // layer into batches by removing edges level-by-level within each stage
    const batchesByStage = new Map<Stage, Batch[]>();
    for (const stage of this.stageOrder) {
      const nodes = order
        .map(id => g.getNode(id)?.data?.sys as CompiledSystem)
        .filter(s => s.stage === stage);
      // Greedy batching: place systems into earliest batch where no conflicts with batch members
      const batches: Batch[] = [];
      for (const s of nodes) {
        let placed = false;
        for (const b of batches) {
          if (!conflictsInBatch(b.systems, s)) {
            b.systems.push(s); placed = true; break;
          }
        }
        if (!placed) batches.push({ stage, systems: [s] });
      }
      batchesByStage.set(stage, batches);
    }

    this.plan = { stages: this.stageOrder, batchesByStage, topoOrder: order };
    return this.plan;
  }

  async runFrame(dt: number, time: number, { parallel = true } = {}) {
    if (!this.plan) this.compile();
    const cmd = this.world.beginTick();

    try {
      for (const stage of this.plan!.stages) {
        const batches = this.plan!.batchesByStage.get(stage)!;
        for (const batch of batches) {
          // Optionally skip systems with empty queries
          const runOne = async (s: CompiledSystem) => {
            if (s.skipIfEmpty && s.queryMask) {
              let any = false;
              for (const _ of this.world.iter(s.queryMask)) { any = true; break; }
              if (!any) return;
            }
            const ctx: SystemContext = { world: this.world, dt, time, resources: this.resources, cmd, stage };
            return s.run(ctx);
          };
          if (parallel) {
            await Promise.all(batch.systems.map(runOne));
          } else {
            for (const s of batch.systems) await runOne(s);
          }
        }
      }
    } finally {
      cmd.flush();
      this.world.endTick();
    }
  }
}

// --- helpers ---
function intersects<T>(a: Set<T>, b: Set<T>): boolean { for (const x of a) if (b.has(x)) return true; return false; }
function union<T>(a: Set<T>, b: Set<T>): Set<T> { const s = new Set<T>(a); for (const x of b) s.add(x); return s; }
function intersection<T>(a: Set<T>, b: Set<T>): Set<T> { const s = new Set<T>(); for (const x of a) if (b.has(x)) s.add(x); return s; }
function conflictsInBatch(existing: CompiledSystem[], candidate: CompiledSystem): boolean {
  const rC = new Set([...(candidate.reads ?? []), ...(candidate.readsComponents ?? []).map(c => `cmp:${c.id}`)]);
  const wC = new Set([...(candidate.writes ?? []), ...(candidate.writesComponents ?? []).map(c => `cmp:${c.id}`)]);
  for (const e of existing) {
    const rE = new Set([...(e.reads ?? []), ...(e.readsComponents ?? []).map(c => `cmp:${c.id}`)]);
    const wE = new Set([...(e.writes ?? []), ...(e.writesComponents ?? []).map(c => `cmp:${c.id}`)]);
    const conflict = intersects(wC, union(rE, wE)) || intersects(wE, union(rC, wC));
    if (conflict) return true;
  }
  return false;
}
```

## Tiny usage

```ts
import { World } from "./ecs";
import { Scheduler } from "./ecs.scheduler";

type Position = {x:number;y:number};
type Velocity = {x:number;y:number};
type Lifetime = {t:number};

const world = new World();
const CPos = world.defineComponent<Position>({ name:"Pos", defaults:()=>({x:0,y:0}) });
const CVel = world.defineComponent<Velocity>({ name:"Vel", defaults:()=>({x:0,y:0}) });
const CLife = world.defineComponent<Lifetime>({ name:"Life", defaults:()=>({t:1}) });

const sched = new Scheduler(world);
sched.resourcesBag().define("frame", { count: 0 });

sched
  .register({
    name: "physics",
    stage: "update",
    reads: ["frame"], writesComponents: [CPos],
    query: w => ({ all:[CPos, CVel] }),
    run: ({ world, dt }) => {
      const q = world.makeQuery({ all:[CPos, CVel] });
      for (const [e, _get, pos, vel] of world.iter(q, CPos, CVel)) {
        pos!.x += vel!.x * dt; pos!.y += vel!.y * dt;
        world.set(e, CPos, pos!);
      }
    }
  })
  .register({
    name: "decay",
    stage: "update",
    writesComponents: [CLife],
    query: w => ({ all:[CLife] }),
    run: ({ world, dt }) => {
      const q = world.makeQuery({ all:[CLife] });
      for (const [e, _get, life] of world.iter(q, CLife)) {
        life!.t -= dt;
        if (life!.t <= 0) world.destroyEntity(e);
        else world.set(e, CLife, life!);
      }
    }
  })
  .register({
    name: "render",
    stage: "render",
    readsComponents: [CPos],
    query: w => ({ all:[CPos], changed:[CPos] }),
    skipIfEmpty: true,
    after: ["physics"], // explicit
    run: ({ world }) => {
      const q = world.makeQuery({ all:[CPos], changed:[CPos] });
      for (const [e, _get, pos] of world.iter(q, CPos)) {
        // draw pos...
      }
    }
  });

await sched.runFrame(0.016, performance.now());
```

# 2) Prefabs / Blueprints

```ts
// shared/js/prom-lib/ds/ecs.prefab.ts
import { World, ComponentType } from "./ecs";

export type BlueprintStep<T=any> = { c: ComponentType<T>, v?: T | ((i: number) => T) };
export interface Blueprint {
  name: string;
  steps: BlueprintStep[];
}

export function makeBlueprint(name: string, steps: BlueprintStep[]): Blueprint {
  return { name, steps };
}

export function spawn(world: World, bp: Blueprint, count = 1, overrides?: Partial<Record<number, any>>): number[] {
  const ids: number[] = [];
  for (let i=0;i<count;i++) {
    const e = world.createEntity();
    for (const s of bp.steps) {
      const val = typeof s.v === "function" ? (s.v as any)(i) : s.v;
      world.addComponent(e, s.c as any, overrides?.[s.c.id] ?? val);
    }
    ids.push(e);
  }
  return ids;
}
```

**Usage:**

```ts
import { makeBlueprint, spawn } from "./ecs.prefab";
const Bullet = makeBlueprint("Bullet", [
  { c: CPos, v: (i)=>({x:i*10, y:0}) },
  { c: CVel, v: {x:0,y:100} },
  { c: CLife, v: {t:2} }
]);
spawn(world, Bullet, 100); // spawns 100 bullets fast
```

# 3) Visual: system graph (you’ll see batches)

```mermaid
flowchart LR
  subgraph update
    physics --> decay
  end
  subgraph render
    render
  end
  classDef stage fill:#eef,stroke:#55f,color:#000;
  class render,physics,decay stage;
```

*(In practice the scheduler builds a full DAG and packs conflict-free systems into parallel **batches** per stage.)*

# 4) Sibilant sprinkles (pseudo)

```lisp
; shared/sibilant/prom/ds/ecs-scheduler.sib (pseudo)
(defn scheduler [world] (new Scheduler world))
(defn sys [name stage query reads writes run]
  {:name name :stage stage :query query :reads reads :writes writes :run run})
(defn add-sys! [sched sys] (.register sched sys))
(defn tick! [sched dt t] (.runFrame sched dt t))
```

---

If you want, I can add:

* a **worker\_threads** pool for true parallel execution,
* a **timeline tracer** (per-system duration, Gantt output),
* or a **hot-reload** API to add/remove systems at runtime without full recompiles.
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [archetype-ecs](archetype-ecs.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [JavaScript](chunks/javascript.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [graph-ds](graph-ds.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)

## Sources
- [ecs-scheduler-and-prefabs — L3](ecs-scheduler-and-prefabs.md#L3) (line 3, col 1, score 1)
- [ecs-scheduler-and-prefabs — L7](ecs-scheduler-and-prefabs.md#L7) (line 7, col 1, score 1)
- [ecs-scheduler-and-prefabs — L246](ecs-scheduler-and-prefabs.md#L246) (line 246, col 1, score 1)
- [archetype-ecs — L366](archetype-ecs.md#L366) (line 366, col 1, score 0.87)
- [ecs-scheduler-and-prefabs — L310](ecs-scheduler-and-prefabs.md#L310) (line 310, col 1, score 1)
- [Prompt_Folder_Bootstrap — L24](prompt-folder-bootstrap.md#L24) (line 24, col 1, score 1)
- [Prompt_Folder_Bootstrap — L42](prompt-folder-bootstrap.md#L42) (line 42, col 1, score 1)
- [Prompt_Folder_Bootstrap — L66](prompt-folder-bootstrap.md#L66) (line 66, col 1, score 1)
- [Prompt_Folder_Bootstrap — L84](prompt-folder-bootstrap.md#L84) (line 84, col 1, score 1)
- [Prompt_Folder_Bootstrap — L103](prompt-folder-bootstrap.md#L103) (line 103, col 1, score 1)
- [Prompt_Folder_Bootstrap — L130](prompt-folder-bootstrap.md#L130) (line 130, col 1, score 1)
- [Prompt_Folder_Bootstrap — L152](prompt-folder-bootstrap.md#L152) (line 152, col 1, score 1)
- [ecs-scheduler-and-prefabs — L338](ecs-scheduler-and-prefabs.md#L338) (line 338, col 1, score 1)
- [ecs-scheduler-and-prefabs — L340](ecs-scheduler-and-prefabs.md#L340) (line 340, col 1, score 1)
- [ecs-scheduler-and-prefabs — L352](ecs-scheduler-and-prefabs.md#L352) (line 352, col 1, score 1)
- [ecs-scheduler-and-prefabs — L364](ecs-scheduler-and-prefabs.md#L364) (line 364, col 1, score 1)
- [ecs-scheduler-and-prefabs — L368](ecs-scheduler-and-prefabs.md#L368) (line 368, col 1, score 1)
- [ecs-scheduler-and-prefabs — L379](ecs-scheduler-and-prefabs.md#L379) (line 379, col 1, score 1)
- [ecs-offload-workers — L446](ecs-offload-workers.md#L446) (line 446, col 1, score 1)
- [markdown-to-org-transpiler — L289](markdown-to-org-transpiler.md#L289) (line 289, col 1, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L153](ollama-llm-provider-for-pseudo-code-transpiler.md#L153) (line 153, col 1, score 1)
- [Promethean Infrastructure Setup — L558](promethean-infrastructure-setup.md#L558) (line 558, col 1, score 0.98)
- [eidolon-field-math-foundations — L105](eidolon-field-math-foundations.md#L105) (line 105, col 1, score 0.88)
- [Performance-Optimized-Polyglot-Bridge — L429](performance-optimized-polyglot-bridge.md#L429) (line 429, col 1, score 0.85)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L497](polyglot-s-expr-bridge-python-js-lisp-interop.md#L497) (line 497, col 1, score 0.85)
- [ecs-scheduler-and-prefabs — L381](ecs-scheduler-and-prefabs.md#L381) (line 381, col 1, score 1)
- [ecs-scheduler-and-prefabs — L381](ecs-scheduler-and-prefabs.md#L381) (line 381, col 3, score 1)
- [ecs-scheduler-and-prefabs — L382](ecs-scheduler-and-prefabs.md#L382) (line 382, col 1, score 1)
- [ecs-scheduler-and-prefabs — L382](ecs-scheduler-and-prefabs.md#L382) (line 382, col 3, score 1)
- [ecs-offload-workers — L450](ecs-offload-workers.md#L450) (line 450, col 1, score 0.9)
- [ecs-offload-workers — L450](ecs-offload-workers.md#L450) (line 450, col 3, score 0.9)
- [ecs-scheduler-and-prefabs — L383](ecs-scheduler-and-prefabs.md#L383) (line 383, col 1, score 1)
- [ecs-scheduler-and-prefabs — L383](ecs-scheduler-and-prefabs.md#L383) (line 383, col 3, score 1)
- [archetype-ecs — L454](archetype-ecs.md#L454) (line 454, col 1, score 1)
- [archetype-ecs — L454](archetype-ecs.md#L454) (line 454, col 3, score 1)
- [Chroma Toolkit Consolidation Plan — L171](chroma-toolkit-consolidation-plan.md#L171) (line 171, col 1, score 1)
- [Chroma Toolkit Consolidation Plan — L171](chroma-toolkit-consolidation-plan.md#L171) (line 171, col 3, score 1)
- [JavaScript — L14](chunks/javascript.md#L14) (line 14, col 1, score 1)
- [JavaScript — L14](chunks/javascript.md#L14) (line 14, col 3, score 1)
- [ecs-offload-workers — L454](ecs-offload-workers.md#L454) (line 454, col 1, score 1)
- [ecs-offload-workers — L454](ecs-offload-workers.md#L454) (line 454, col 3, score 1)
- [archetype-ecs — L460](archetype-ecs.md#L460) (line 460, col 1, score 1)
- [archetype-ecs — L460](archetype-ecs.md#L460) (line 460, col 3, score 1)
- [JavaScript — L15](chunks/javascript.md#L15) (line 15, col 1, score 1)
- [JavaScript — L15](chunks/javascript.md#L15) (line 15, col 3, score 1)
- [ecs-scheduler-and-prefabs — L388](ecs-scheduler-and-prefabs.md#L388) (line 388, col 1, score 1)
- [ecs-scheduler-and-prefabs — L388](ecs-scheduler-and-prefabs.md#L388) (line 388, col 3, score 1)
- [eidolon-field-math-foundations — L129](eidolon-field-math-foundations.md#L129) (line 129, col 1, score 1)
- [eidolon-field-math-foundations — L129](eidolon-field-math-foundations.md#L129) (line 129, col 3, score 1)
- [Agent Reflections and Prompt Evolution — L138](agent-reflections-and-prompt-evolution.md#L138) (line 138, col 1, score 1)
- [Agent Reflections and Prompt Evolution — L138](agent-reflections-and-prompt-evolution.md#L138) (line 138, col 3, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L110](canonical-org-babel-matplotlib-animation-template.md#L110) (line 110, col 1, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L110](canonical-org-babel-matplotlib-animation-template.md#L110) (line 110, col 3, score 1)
- [Chroma Toolkit Consolidation Plan — L170](chroma-toolkit-consolidation-plan.md#L170) (line 170, col 1, score 1)
- [Chroma Toolkit Consolidation Plan — L170](chroma-toolkit-consolidation-plan.md#L170) (line 170, col 3, score 1)
- [ecs-scheduler-and-prefabs — L389](ecs-scheduler-and-prefabs.md#L389) (line 389, col 1, score 1)
- [ecs-scheduler-and-prefabs — L389](ecs-scheduler-and-prefabs.md#L389) (line 389, col 3, score 1)
- [ecs-offload-workers — L456](ecs-offload-workers.md#L456) (line 456, col 1, score 1)
- [ecs-offload-workers — L456](ecs-offload-workers.md#L456) (line 456, col 3, score 1)
- [ecs-scheduler-and-prefabs — L390](ecs-scheduler-and-prefabs.md#L390) (line 390, col 1, score 1)
- [ecs-scheduler-and-prefabs — L390](ecs-scheduler-and-prefabs.md#L390) (line 390, col 3, score 1)
- [eidolon-field-math-foundations — L131](eidolon-field-math-foundations.md#L131) (line 131, col 1, score 1)
- [eidolon-field-math-foundations — L131](eidolon-field-math-foundations.md#L131) (line 131, col 3, score 1)
- [js-to-lisp-reverse-compiler — L424](js-to-lisp-reverse-compiler.md#L424) (line 424, col 1, score 1)
- [js-to-lisp-reverse-compiler — L424](js-to-lisp-reverse-compiler.md#L424) (line 424, col 3, score 1)
- [ecs-offload-workers — L457](ecs-offload-workers.md#L457) (line 457, col 1, score 1)
- [ecs-offload-workers — L457](ecs-offload-workers.md#L457) (line 457, col 3, score 1)
- [ecs-scheduler-and-prefabs — L391](ecs-scheduler-and-prefabs.md#L391) (line 391, col 1, score 1)
- [ecs-scheduler-and-prefabs — L391](ecs-scheduler-and-prefabs.md#L391) (line 391, col 3, score 1)
- [eidolon-field-math-foundations — L132](eidolon-field-math-foundations.md#L132) (line 132, col 1, score 1)
- [eidolon-field-math-foundations — L132](eidolon-field-math-foundations.md#L132) (line 132, col 3, score 1)
- [Local-First Intention→Code Loop with Free Models — L145](local-first-intention-code-loop-with-free-models.md#L145) (line 145, col 1, score 1)
- [Local-First Intention→Code Loop with Free Models — L145](local-first-intention-code-loop-with-free-models.md#L145) (line 145, col 3, score 1)
- [api-gateway-versioning — L284](api-gateway-versioning.md#L284) (line 284, col 1, score 1)
- [api-gateway-versioning — L284](api-gateway-versioning.md#L284) (line 284, col 3, score 1)
- [Debugging Broker Connections and Agent Behavior — L40](debugging-broker-connections-and-agent-behavior.md#L40) (line 40, col 1, score 1)
- [Debugging Broker Connections and Agent Behavior — L40](debugging-broker-connections-and-agent-behavior.md#L40) (line 40, col 3, score 1)
- [Dynamic Context Model for Web Components — L384](dynamic-context-model-for-web-components.md#L384) (line 384, col 1, score 1)
- [Dynamic Context Model for Web Components — L384](dynamic-context-model-for-web-components.md#L384) (line 384, col 3, score 1)
- [ecs-offload-workers — L458](ecs-offload-workers.md#L458) (line 458, col 1, score 1)
- [ecs-offload-workers — L458](ecs-offload-workers.md#L458) (line 458, col 3, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L133](agent-tasks-persistence-migration-to-dualstore.md#L133) (line 133, col 1, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L133](agent-tasks-persistence-migration-to-dualstore.md#L133) (line 133, col 3, score 1)
- [aionian-circuit-math — L151](aionian-circuit-math.md#L151) (line 151, col 1, score 1)
- [aionian-circuit-math — L151](aionian-circuit-math.md#L151) (line 151, col 3, score 1)
- [Math Fundamentals — L14](chunks/math-fundamentals.md#L14) (line 14, col 1, score 1)
- [Math Fundamentals — L14](chunks/math-fundamentals.md#L14) (line 14, col 3, score 1)
- [ecs-offload-workers — L460](ecs-offload-workers.md#L460) (line 460, col 1, score 1)
- [ecs-offload-workers — L460](ecs-offload-workers.md#L460) (line 460, col 3, score 1)
- [JavaScript — L16](chunks/javascript.md#L16) (line 16, col 1, score 1)
- [JavaScript — L16](chunks/javascript.md#L16) (line 16, col 3, score 1)
- [ecs-offload-workers — L466](ecs-offload-workers.md#L466) (line 466, col 1, score 1)
- [ecs-offload-workers — L466](ecs-offload-workers.md#L466) (line 466, col 3, score 1)
- [ecs-scheduler-and-prefabs — L394](ecs-scheduler-and-prefabs.md#L394) (line 394, col 1, score 1)
- [ecs-scheduler-and-prefabs — L394](ecs-scheduler-and-prefabs.md#L394) (line 394, col 3, score 1)
- [graph-ds — L367](graph-ds.md#L367) (line 367, col 1, score 1)
- [graph-ds — L367](graph-ds.md#L367) (line 367, col 3, score 1)
- [Admin Dashboard for User Management — L41](admin-dashboard-for-user-management.md#L41) (line 41, col 1, score 1)
- [Admin Dashboard for User Management — L41](admin-dashboard-for-user-management.md#L41) (line 41, col 3, score 1)
- [ecs-offload-workers — L461](ecs-offload-workers.md#L461) (line 461, col 1, score 1)
- [ecs-offload-workers — L461](ecs-offload-workers.md#L461) (line 461, col 3, score 1)
- [ecs-scheduler-and-prefabs — L397](ecs-scheduler-and-prefabs.md#L397) (line 397, col 1, score 1)
- [ecs-scheduler-and-prefabs — L397](ecs-scheduler-and-prefabs.md#L397) (line 397, col 3, score 1)
- [Local-Only-LLM-Workflow — L173](local-only-llm-workflow.md#L173) (line 173, col 1, score 1)
- [Local-Only-LLM-Workflow — L173](local-only-llm-workflow.md#L173) (line 173, col 3, score 1)
- [compiler-kit-foundations — L611](compiler-kit-foundations.md#L611) (line 611, col 1, score 1)
- [compiler-kit-foundations — L611](compiler-kit-foundations.md#L611) (line 611, col 3, score 1)
- [ecs-offload-workers — L462](ecs-offload-workers.md#L462) (line 462, col 1, score 1)
- [ecs-offload-workers — L462](ecs-offload-workers.md#L462) (line 462, col 3, score 1)
- [ecs-scheduler-and-prefabs — L398](ecs-scheduler-and-prefabs.md#L398) (line 398, col 1, score 1)
- [ecs-scheduler-and-prefabs — L398](ecs-scheduler-and-prefabs.md#L398) (line 398, col 3, score 1)
- [Interop and Source Maps — L517](interop-and-source-maps.md#L517) (line 517, col 1, score 1)
- [Interop and Source Maps — L517](interop-and-source-maps.md#L517) (line 517, col 3, score 1)
- [ecs-offload-workers — L472](ecs-offload-workers.md#L472) (line 472, col 1, score 0.98)
- [ecs-offload-workers — L472](ecs-offload-workers.md#L472) (line 472, col 3, score 0.98)
- [markdown-to-org-transpiler — L309](markdown-to-org-transpiler.md#L309) (line 309, col 1, score 0.98)
- [markdown-to-org-transpiler — L309](markdown-to-org-transpiler.md#L309) (line 309, col 3, score 0.98)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L176](ollama-llm-provider-for-pseudo-code-transpiler.md#L176) (line 176, col 1, score 0.98)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L176](ollama-llm-provider-for-pseudo-code-transpiler.md#L176) (line 176, col 3, score 0.98)
- [JavaScript — L28](chunks/javascript.md#L28) (line 28, col 1, score 0.97)
- [JavaScript — L28](chunks/javascript.md#L28) (line 28, col 3, score 0.97)
- [archetype-ecs — L463](archetype-ecs.md#L463) (line 463, col 1, score 0.98)
- [archetype-ecs — L463](archetype-ecs.md#L463) (line 463, col 3, score 0.98)
- [ecs-scheduler-and-prefabs — L408](ecs-scheduler-and-prefabs.md#L408) (line 408, col 1, score 1)
- [ecs-scheduler-and-prefabs — L408](ecs-scheduler-and-prefabs.md#L408) (line 408, col 3, score 1)
- [Prompt_Folder_Bootstrap — L193](prompt-folder-bootstrap.md#L193) (line 193, col 1, score 0.97)
- [Prompt_Folder_Bootstrap — L193](prompt-folder-bootstrap.md#L193) (line 193, col 3, score 0.97)
- [ecs-scheduler-and-prefabs — L410](ecs-scheduler-and-prefabs.md#L410) (line 410, col 1, score 1)
- [ecs-scheduler-and-prefabs — L410](ecs-scheduler-and-prefabs.md#L410) (line 410, col 3, score 1)
- [Chroma Toolkit Consolidation Plan — L194](chroma-toolkit-consolidation-plan.md#L194) (line 194, col 1, score 0.99)
- [Chroma Toolkit Consolidation Plan — L194](chroma-toolkit-consolidation-plan.md#L194) (line 194, col 3, score 0.99)
- [ecs-scheduler-and-prefabs — L411](ecs-scheduler-and-prefabs.md#L411) (line 411, col 1, score 0.99)
- [ecs-scheduler-and-prefabs — L411](ecs-scheduler-and-prefabs.md#L411) (line 411, col 3, score 0.99)
- [ecs-scheduler-and-prefabs — L413](ecs-scheduler-and-prefabs.md#L413) (line 413, col 1, score 0.98)
- [ecs-scheduler-and-prefabs — L413](ecs-scheduler-and-prefabs.md#L413) (line 413, col 3, score 0.98)
- [Chroma Toolkit Consolidation Plan — L195](chroma-toolkit-consolidation-plan.md#L195) (line 195, col 1, score 0.99)
- [Chroma Toolkit Consolidation Plan — L195](chroma-toolkit-consolidation-plan.md#L195) (line 195, col 3, score 0.99)
- [ecs-scheduler-and-prefabs — L412](ecs-scheduler-and-prefabs.md#L412) (line 412, col 1, score 0.99)
- [ecs-scheduler-and-prefabs — L412](ecs-scheduler-and-prefabs.md#L412) (line 412, col 3, score 0.99)
- [Chroma Toolkit Consolidation Plan — L196](chroma-toolkit-consolidation-plan.md#L196) (line 196, col 1, score 0.99)
- [Chroma Toolkit Consolidation Plan — L196](chroma-toolkit-consolidation-plan.md#L196) (line 196, col 3, score 0.99)
- [ecs-scheduler-and-prefabs — L415](ecs-scheduler-and-prefabs.md#L415) (line 415, col 1, score 0.99)
- [ecs-scheduler-and-prefabs — L415](ecs-scheduler-and-prefabs.md#L415) (line 415, col 3, score 0.99)
- [Chroma Toolkit Consolidation Plan — L197](chroma-toolkit-consolidation-plan.md#L197) (line 197, col 1, score 0.99)
- [Chroma Toolkit Consolidation Plan — L197](chroma-toolkit-consolidation-plan.md#L197) (line 197, col 3, score 0.99)
- [ecs-scheduler-and-prefabs — L416](ecs-scheduler-and-prefabs.md#L416) (line 416, col 1, score 0.98)
- [ecs-scheduler-and-prefabs — L416](ecs-scheduler-and-prefabs.md#L416) (line 416, col 3, score 0.98)
- [ecs-scheduler-and-prefabs — L414](ecs-scheduler-and-prefabs.md#L414) (line 414, col 1, score 1)
- [ecs-scheduler-and-prefabs — L414](ecs-scheduler-and-prefabs.md#L414) (line 414, col 3, score 1)
- [Chroma Toolkit Consolidation Plan — L198](chroma-toolkit-consolidation-plan.md#L198) (line 198, col 1, score 0.99)
- [Chroma Toolkit Consolidation Plan — L198](chroma-toolkit-consolidation-plan.md#L198) (line 198, col 3, score 0.99)
- [Chroma Toolkit Consolidation Plan — L199](chroma-toolkit-consolidation-plan.md#L199) (line 199, col 1, score 0.99)
- [Chroma Toolkit Consolidation Plan — L199](chroma-toolkit-consolidation-plan.md#L199) (line 199, col 3, score 0.99)
- [Chroma Toolkit Consolidation Plan — L200](chroma-toolkit-consolidation-plan.md#L200) (line 200, col 1, score 0.99)
- [Chroma Toolkit Consolidation Plan — L200](chroma-toolkit-consolidation-plan.md#L200) (line 200, col 3, score 0.99)
- [Chroma Toolkit Consolidation Plan — L201](chroma-toolkit-consolidation-plan.md#L201) (line 201, col 1, score 0.99)
- [Chroma Toolkit Consolidation Plan — L201](chroma-toolkit-consolidation-plan.md#L201) (line 201, col 3, score 0.99)
- [Local-Only-LLM-Workflow — L190](local-only-llm-workflow.md#L190) (line 190, col 1, score 0.97)
- [Local-Only-LLM-Workflow — L190](local-only-llm-workflow.md#L190) (line 190, col 3, score 0.97)
- [ecs-scheduler-and-prefabs — L422](ecs-scheduler-and-prefabs.md#L422) (line 422, col 1, score 1)
- [ecs-scheduler-and-prefabs — L422](ecs-scheduler-and-prefabs.md#L422) (line 422, col 3, score 1)
- [markdown-to-org-transpiler — L310](markdown-to-org-transpiler.md#L310) (line 310, col 1, score 1)
- [markdown-to-org-transpiler — L310](markdown-to-org-transpiler.md#L310) (line 310, col 3, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L177](ollama-llm-provider-for-pseudo-code-transpiler.md#L177) (line 177, col 1, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L177](ollama-llm-provider-for-pseudo-code-transpiler.md#L177) (line 177, col 3, score 1)
- [eidolon-field-math-foundations — L155](eidolon-field-math-foundations.md#L155) (line 155, col 1, score 0.99)
- [eidolon-field-math-foundations — L155](eidolon-field-math-foundations.md#L155) (line 155, col 3, score 0.99)
- [ecs-offload-workers — L474](ecs-offload-workers.md#L474) (line 474, col 1, score 1)
- [ecs-offload-workers — L474](ecs-offload-workers.md#L474) (line 474, col 3, score 1)
- [ecs-scheduler-and-prefabs — L424](ecs-scheduler-and-prefabs.md#L424) (line 424, col 1, score 1)
- [ecs-scheduler-and-prefabs — L424](ecs-scheduler-and-prefabs.md#L424) (line 424, col 3, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L179](ollama-llm-provider-for-pseudo-code-transpiler.md#L179) (line 179, col 1, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L179](ollama-llm-provider-for-pseudo-code-transpiler.md#L179) (line 179, col 3, score 1)
- [eidolon-field-math-foundations — L157](eidolon-field-math-foundations.md#L157) (line 157, col 1, score 0.98)
- [eidolon-field-math-foundations — L157](eidolon-field-math-foundations.md#L157) (line 157, col 3, score 0.98)
- [ecs-offload-workers — L475](ecs-offload-workers.md#L475) (line 475, col 1, score 1)
- [ecs-offload-workers — L475](ecs-offload-workers.md#L475) (line 475, col 3, score 1)
- [ecs-scheduler-and-prefabs — L425](ecs-scheduler-and-prefabs.md#L425) (line 425, col 1, score 1)
- [ecs-scheduler-and-prefabs — L425](ecs-scheduler-and-prefabs.md#L425) (line 425, col 3, score 1)
- [markdown-to-org-transpiler — L312](markdown-to-org-transpiler.md#L312) (line 312, col 1, score 1)
- [markdown-to-org-transpiler — L312](markdown-to-org-transpiler.md#L312) (line 312, col 3, score 1)
- [Local-Only-LLM-Workflow — L194](local-only-llm-workflow.md#L194) (line 194, col 1, score 0.99)
- [Local-Only-LLM-Workflow — L194](local-only-llm-workflow.md#L194) (line 194, col 3, score 0.99)
- [ecs-offload-workers — L476](ecs-offload-workers.md#L476) (line 476, col 1, score 1)
- [ecs-offload-workers — L476](ecs-offload-workers.md#L476) (line 476, col 3, score 1)
- [ecs-scheduler-and-prefabs — L426](ecs-scheduler-and-prefabs.md#L426) (line 426, col 1, score 1)
- [ecs-scheduler-and-prefabs — L426](ecs-scheduler-and-prefabs.md#L426) (line 426, col 3, score 1)
- [markdown-to-org-transpiler — L313](markdown-to-org-transpiler.md#L313) (line 313, col 1, score 1)
- [markdown-to-org-transpiler — L313](markdown-to-org-transpiler.md#L313) (line 313, col 3, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L180](ollama-llm-provider-for-pseudo-code-transpiler.md#L180) (line 180, col 1, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L180](ollama-llm-provider-for-pseudo-code-transpiler.md#L180) (line 180, col 3, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L147](agent-tasks-persistence-migration-to-dualstore.md#L147) (line 147, col 1, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L147](agent-tasks-persistence-migration-to-dualstore.md#L147) (line 147, col 3, score 1)
- [ecs-offload-workers — L477](ecs-offload-workers.md#L477) (line 477, col 1, score 1)
- [ecs-offload-workers — L477](ecs-offload-workers.md#L477) (line 477, col 3, score 1)
- [ecs-scheduler-and-prefabs — L427](ecs-scheduler-and-prefabs.md#L427) (line 427, col 1, score 1)
- [ecs-scheduler-and-prefabs — L427](ecs-scheduler-and-prefabs.md#L427) (line 427, col 3, score 1)
- [markdown-to-org-transpiler — L314](markdown-to-org-transpiler.md#L314) (line 314, col 1, score 1)
- [markdown-to-org-transpiler — L314](markdown-to-org-transpiler.md#L314) (line 314, col 3, score 1)
- [ecs-offload-workers — L478](ecs-offload-workers.md#L478) (line 478, col 1, score 1)
- [ecs-offload-workers — L478](ecs-offload-workers.md#L478) (line 478, col 3, score 1)
- [ecs-scheduler-and-prefabs — L428](ecs-scheduler-and-prefabs.md#L428) (line 428, col 1, score 1)
- [ecs-scheduler-and-prefabs — L428](ecs-scheduler-and-prefabs.md#L428) (line 428, col 3, score 1)
- [markdown-to-org-transpiler — L315](markdown-to-org-transpiler.md#L315) (line 315, col 1, score 1)
- [markdown-to-org-transpiler — L315](markdown-to-org-transpiler.md#L315) (line 315, col 3, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L182](ollama-llm-provider-for-pseudo-code-transpiler.md#L182) (line 182, col 1, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L182](ollama-llm-provider-for-pseudo-code-transpiler.md#L182) (line 182, col 3, score 1)
- [ecs-offload-workers — L479](ecs-offload-workers.md#L479) (line 479, col 1, score 1)
- [ecs-offload-workers — L479](ecs-offload-workers.md#L479) (line 479, col 3, score 1)
- [ecs-scheduler-and-prefabs — L429](ecs-scheduler-and-prefabs.md#L429) (line 429, col 1, score 1)
- [ecs-scheduler-and-prefabs — L429](ecs-scheduler-and-prefabs.md#L429) (line 429, col 3, score 1)
- [markdown-to-org-transpiler — L316](markdown-to-org-transpiler.md#L316) (line 316, col 1, score 1)
- [markdown-to-org-transpiler — L316](markdown-to-org-transpiler.md#L316) (line 316, col 3, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L183](ollama-llm-provider-for-pseudo-code-transpiler.md#L183) (line 183, col 1, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L183](ollama-llm-provider-for-pseudo-code-transpiler.md#L183) (line 183, col 3, score 1)
- [ecs-offload-workers — L480](ecs-offload-workers.md#L480) (line 480, col 1, score 0.98)
- [ecs-offload-workers — L480](ecs-offload-workers.md#L480) (line 480, col 3, score 0.98)
- [ecs-scheduler-and-prefabs — L434](ecs-scheduler-and-prefabs.md#L434) (line 434, col 1, score 1)
- [ecs-scheduler-and-prefabs — L434](ecs-scheduler-and-prefabs.md#L434) (line 434, col 3, score 1)
- [ecs-scheduler-and-prefabs — L435](ecs-scheduler-and-prefabs.md#L435) (line 435, col 1, score 0.99)
- [ecs-scheduler-and-prefabs — L435](ecs-scheduler-and-prefabs.md#L435) (line 435, col 3, score 0.99)
- [zero-copy-snapshots-and-workers — L373](zero-copy-snapshots-and-workers.md#L373) (line 373, col 1, score 0.99)
- [zero-copy-snapshots-and-workers — L373](zero-copy-snapshots-and-workers.md#L373) (line 373, col 3, score 0.99)
- [zero-copy-snapshots-and-workers — L375](zero-copy-snapshots-and-workers.md#L375) (line 375, col 1, score 0.98)
- [zero-copy-snapshots-and-workers — L375](zero-copy-snapshots-and-workers.md#L375) (line 375, col 3, score 0.98)
- [Local-Only-LLM-Workflow — L191](local-only-llm-workflow.md#L191) (line 191, col 1, score 0.98)
- [Local-Only-LLM-Workflow — L191](local-only-llm-workflow.md#L191) (line 191, col 3, score 0.98)
- [ecs-offload-workers — L481](ecs-offload-workers.md#L481) (line 481, col 1, score 0.98)
- [ecs-offload-workers — L481](ecs-offload-workers.md#L481) (line 481, col 3, score 0.98)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
