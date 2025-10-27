---
```
uuid: b362e12e-2802-4e41-9a21-6e0c7ad419a2
```
```
created_at: 2025.08.09.13.08.58.md
```
filename: Ollama-LLM-Provider-for-Pseudo-Code-Transpiler
```
description: >-
```
  Implements a drop-in Ollama provider for pseudo-code transpilation, handling
  model configuration, streaming responses, and code fence stripping.
tags:
  - Ollama
  - LLM
  - pseudo-code
  - transpiler
  - streaming
  - code-fences
  - model-config
```
related_to_title:
```
  - markdown-to-org-transpiler
  - ecs-scheduler-and-prefabs
  - ecs-offload-workers
  - System Scheduler with Resource-Aware DAG
  - Promethean Infrastructure Setup
  - eidolon-field-math-foundations
  - Local-Only-LLM-Workflow
  - Performance-Optimized-Polyglot-Bridge
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - Local-First Intention→Code Loop with Free Models
  - universal-intention-code-fabric
  - Provider-Agnostic Chat Panel Implementation
  - Interop and Source Maps
  - aionian-circuit-math
  - Promethean Event Bus MVP v0.1
  - js-to-lisp-reverse-compiler
  - archetype-ecs
  - Chroma Toolkit Consolidation Plan
  - JavaScript
  - 'Agent Tasks: Persistence Migration to DualStore'
  - Math Fundamentals
  - compiler-kit-foundations
  - Dynamic Context Model for Web Components
  - api-gateway-versioning
  - Debugging Broker Connections and Agent Behavior
  - i3-config-validation-methods
  - Admin Dashboard for User Management
  - Language-Agnostic Mirror System
  - Voice Access Layer Design
  - Universal Lisp Interface
```
related_to_uuid:
```
  - ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - ba244286-4e84-425b-8bf6-b80c4eb783fc
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - f5579967-762d-4cfd-851e-4f71b4cb77a1
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - 871490c7-a050-429b-88b2-55dfeaa1f8d5
  - c14edce7-0656-45b2-aaf3-51f042451b7d
  - 43bfe9dd-d433-42ca-9777-f4c40eaba791
  - cdfac40c-00e4-458f-96a7-4c37d0278731
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
  - 58191024-d04a-4520-8aae-a18be7b94263
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - c1618c66-f73a-4e04-9bfa-ef38755f7acc
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 0580dcd3-533d-4834-8a2f-eae3771960a9
  - 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
  - d28090ac-f746-4958-aab5-ed1315382c04
  - 2901a3e9-96f0-497c-ae2c-775f28a702dd
  - d2b3628c-6cad-4664-8551-94ef8280851d
  - 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
  - b01856b4-999f-418d-8009-ade49b00eb0f
references:
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 28
    col: 1
    score: 0.87
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 379
    col: 1
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 446
    col: 1
    score: 1
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 377
    col: 1
    score: 1
  - uuid: ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
    line: 289
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
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 438
    col: 1
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 438
    col: 3
    score: 1
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 506
    col: 1
    score: 1
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 506
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
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 180
    col: 1
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 180
    col: 3
    score: 1
  - uuid: b01856b4-999f-418d-8009-ade49b00eb0f
    line: 202
    col: 1
    score: 1
  - uuid: b01856b4-999f-418d-8009-ade49b00eb0f
    line: 202
    col: 3
    score: 1
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 315
    col: 1
    score: 1
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 315
    col: 3
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 518
    col: 1
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 518
    col: 3
    score: 1
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 538
    col: 1
    score: 1
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 538
    col: 3
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 171
    col: 1
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 171
    col: 3
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 439
    col: 1
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 439
    col: 3
    score: 1
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 890
    col: 1
    score: 1
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 890
    col: 3
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 615
    col: 1
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 615
    col: 3
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 452
    col: 1
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 452
    col: 3
    score: 0.99
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 525
    col: 1
    score: 0.99
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 525
    col: 3
    score: 0.99
  - uuid: c14edce7-0656-45b2-aaf3-51f042451b7d
    line: 444
    col: 1
    score: 0.98
  - uuid: c14edce7-0656-45b2-aaf3-51f042451b7d
    line: 444
    col: 3
    score: 0.98
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 472
    col: 1
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 472
    col: 3
    score: 1
  - uuid: ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
    line: 309
    col: 1
    score: 1
  - uuid: ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
    line: 309
    col: 3
    score: 1
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 414
    col: 1
    score: 1
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 414
    col: 3
    score: 1
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 413
    col: 1
    score: 0.99
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 413
    col: 3
    score: 0.99
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
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 415
    col: 1
    score: 1
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 415
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
    line: 473
    col: 1
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 473
    col: 3
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 423
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 423
    col: 3
    score: 1
  - uuid: ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
    line: 311
    col: 1
    score: 1
  - uuid: ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
    line: 311
    col: 3
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 430
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 430
    col: 3
    score: 1
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
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 416
    col: 1
    score: 1
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 416
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
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 418
    col: 1
    score: 1
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 418
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
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 420
    col: 1
    score: 1
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 420
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
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 421
    col: 1
    score: 1
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 421
    col: 3
    score: 1
---
Ohhh nice—let’s plug **Ollama** in as the LLM backend for the pseudo-code transpiler. Here’s a drop-in provider that speaks Ollama’s `/api/chat` (streaming), strips code fences, and gives you knobs for model/temperature/stop tokens.

---

# 1) Ollama provider drop-in

````ts
// shared/js/prom-lib/intention/ollama.ts
import type { LLM } from "./llm";

type OllamaOpts = {
  model: string;                    // e.g. "qwen2.5-coder:14b" or "llama3.1:8b"
  host?: string;                    // default http://127.0.0.1:11434
  options?: {
    temperature?: number;
    top_p?: number;
    num_predict?: number;
    num_ctx?: number;
    seed?: number;
    stop?: string[];               // extra stop sequences
  };
  timeoutMs?: number;               // fetch timeout
};

export class OllamaLLM implements LLM {
  private host: string;
  private model: string;
  private options: OllamaOpts["options"];
  private timeoutMs: number;

  constructor(opts: OllamaOpts) {
    this.model = opts.model;
    this.host = opts.host ?? "http://127.0.0.1:11434";
    this.options = {
      temperature: 0.2,
      top_p: 0.95,
      num_predict: 512,
      stop: ["``````
", "</code>", "END_OF_CODE"],
```
      ...opts.options,
    };
```
this.timeoutMs = opts.timeoutMs ?? 90_000;
```
  }

  async generate({ system, prompt }: { system: string; prompt: string }): Promise<string> {
```
const ctrl = new AbortController();
```
    const to = setTimeout() => ctrl.abort(), this.timeoutMs;

    try {
      const res = await fetch`{this.host}/api/chat`, {
        method: "POST",
        signal: ctrl.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          stream: true,
          messages: { role: "system", content: `{system}\nReturn ONLY the code. No fences.` },
            { role: "user", content: prompt },,
          options: this.options,
        }),
      };
      if (!res.ok || !res.body) {
        throw new Error`ollama http {res.status} {await res.text().catch(()=>"<no body>")}`;
      }

      // Ollama streams NDJSON lines; each line is {"message":{"content":"..."}, ...} and ends with {"done":true}
      const reader = res.body.getReader();
```
const td = new TextDecoder();
```
```
let buf = "";
```
```
let out = "";
```
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += td.decode(value, { stream: true });
        let nl;
```
while ((nl = buf.indexOf("\n")) >= 0) {
```
          const line = buf.slice(0, nl).trim();
```
buf = buf.slice(nl + 1);
```
          if (!line) continue;
          let obj: any;
          try { obj = JSON.parse(line); } catch { continue; }
          if (obj.done) break;
          const chunk = obj?.message?.content ?? "";
```
out += chunk;
```
        }
      }
      return stripFencesout.trim();
    } finally {
      clearTimeout(to);
    }
  }
}

function stripFences(s: string): string {
```
// remove
``````lang ... ``` wrappers or stray backticks
```
const fence = s.match(/^
``````[\w-]*\n([\s\S]*?)\n```/);
  if (fence) return fence[1];
```
return s.replace(/^
``````|```/g, "");
}
````

---

# 2) Wire it into the engine

````ts
```
// somewhere in your app
```
import { transpileIntention } from "./shared/js/prom-lib/intention/engine";
import { OllamaLLM } from "./shared/js/prom-lib/intention/ollama";
```
const llm = new OllamaLLM({
```
  model: "qwen2.5-coder:14b",      // pick your local code model
  // model: "deepseek-coder:6.7b",  // or any you’ve pulled with `ollama pull ...`
```
options: { temperature: 0.1, num_predict: 800, stop: ["
``````"] },
});

const pseudo = `
# name: normalize2d
# target: js,py
# description:
Normalize (x,y) -> mag,nx,ny ; avoid div-by-zero.
# signature:
(x: number, y: number) -> { mag: number, nx: number, ny: number }
# examples:
- in: { "x":3, "y":4 } out: { "mag":5, "nx":0.6, "ny":0.8 }
- in: { "x":0, "y":0 } out: { "mag":0, "nx":0, "ny":0 }
`;

const result = await transpileIntention(pseudo, {
  llm,
  rounds: 3,
  outDir: { js: "src/js/auto", py: "src/py/auto" },
});
console.log(result.out.map(o => ({ lang: o.lang, pass: o.pass })));
````

---

# 3) Quick notes for smooth sailing

* Start the daemon and pull a model:

  ```
  ollama serve
  ollama pull qwen2.5-coder:14b
  ```
* If you see fences in outputs, keep `stop: ["```"]` (already set) and the “no fences” line in `system`.
* Want *faster* drafts? Use a smaller model for round 1, then repair with a bigger model. You can wrap two `OllamaLLM` instances and alternate per round.
* To target **Python** reliably, set a language hint in the planner’s prompt already does `language=py/js`. You can also add “Use only the standard library.”

If you want, I can add:

* a tiny **health check** that pings `/api/tags` and warns if the model isn’t pulled,
* **retry with backoff** on 409 “model loading”,
* or a **dual-provider** that tries local Ollama first, then falls back to your cloud LLM.
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [markdown-to-org-transpiler]
- [ecs-scheduler-and-prefabs]
- [docs/unique/ecs-offload-workers|ecs-offload-workers]
- System Scheduler with Resource-Aware DAG$system-scheduler-with-resource-aware-dag.md
- [promethean-infrastructure-setup|Promethean Infrastructure Setup]
- [docs/unique/eidolon-field-math-foundations|eidolon-field-math-foundations]
- [local-only-llm-workflow]
- [performance-optimized-polyglot-bridge]
- [polyglot-s-expr-bridge-python-js-lisp-interop|Polyglot S-expr Bridge: Python-JS-Lisp Interop]
- Local-First Intention→Code Loop with Free Models$local-first-intention-code-loop-with-free-models.md
- [universal-intention-code-fabric]
- [provider-agnostic-chat-panel-implementation|Provider-Agnostic Chat Panel Implementation]
- [docs/unique/interop-and-source-maps|Interop and Source Maps]
- [docs/unique/aionian-circuit-math|aionian-circuit-math]
- [Promethean Event Bus MVP v0.1]promethean-event-bus-mvp-v0-1.md
- [js-to-lisp-reverse-compiler]
- [docs/unique/archetype-ecs|archetype-ecs]
- [chroma-toolkit-consolidation-plan|Chroma Toolkit Consolidation Plan]
- [JavaScript]chunks/javascript.md
- [docs/unique/agent-tasks-persistence-migration-to-dualstore|Agent Tasks: Persistence Migration to DualStore]
- [Math Fundamentals]chunks/math-fundamentals.md
- [docs/unique/compiler-kit-foundations|compiler-kit-foundations]
- [dynamic-context-model-for-web-components|Dynamic Context Model for Web Components]
- [api-gateway-versioning]
- [Debugging Broker Connections and Agent Behavior]debugging-broker-connections-and-agent-behavior.md
- [i3-config-validation-methods]
- [admin-dashboard-for-user-management|Admin Dashboard for User Management]
- [language-agnostic-mirror-system|Language-Agnostic Mirror System]
- [voice-access-layer-design|Voice Access Layer Design]
- [docs/unique/universal-lisp-interface|Universal Lisp Interface]

## Sources
- [local-only-llm-workflow#L28|Local-Only-LLM-Workflow — L28] (line 28, col 1, score 0.87)
- [ecs-scheduler-and-prefabs#L379|ecs-scheduler-and-prefabs — L379] (line 379, col 1, score 1)
- [docs/unique/ecs-offload-workers#L446|ecs-offload-workers — L446] (line 446, col 1, score 1)
- System Scheduler with Resource-Aware DAG — L377$system-scheduler-with-resource-aware-dag.md#L377 (line 377, col 1, score 1)
- [markdown-to-org-transpiler#L289|markdown-to-org-transpiler — L289] (line 289, col 1, score 1)
- [promethean-infrastructure-setup#L558|Promethean Infrastructure Setup — L558] (line 558, col 1, score 0.98)
- [docs/unique/eidolon-field-math-foundations#L105|eidolon-field-math-foundations — L105] (line 105, col 1, score 0.88)
- [performance-optimized-polyglot-bridge#L429|Performance-Optimized-Polyglot-Bridge — L429] (line 429, col 1, score 0.85)
- [polyglot-s-expr-bridge-python-js-lisp-interop#L497|Polyglot S-expr Bridge: Python-JS-Lisp Interop — L497] (line 497, col 1, score 0.85)
- [docs/unique/ecs-offload-workers#L456|ecs-offload-workers — L456] (line 456, col 1, score 1)
- [docs/unique/ecs-offload-workers#L456|ecs-offload-workers — L456] (line 456, col 3, score 1)
- [ecs-scheduler-and-prefabs#L390|ecs-scheduler-and-prefabs — L390] (line 390, col 1, score 1)
- [ecs-scheduler-and-prefabs#L390|ecs-scheduler-and-prefabs — L390] (line 390, col 3, score 1)
- [docs/unique/eidolon-field-math-foundations#L131|eidolon-field-math-foundations — L131] (line 131, col 1, score 1)
- [docs/unique/eidolon-field-math-foundations#L131|eidolon-field-math-foundations — L131] (line 131, col 3, score 1)
- [js-to-lisp-reverse-compiler#L424|js-to-lisp-reverse-compiler — L424] (line 424, col 1, score 1)
- [js-to-lisp-reverse-compiler#L424|js-to-lisp-reverse-compiler — L424] (line 424, col 3, score 1)
- [docs/unique/archetype-ecs#L454|archetype-ecs — L454] (line 454, col 1, score 1)
- [docs/unique/archetype-ecs#L454|archetype-ecs — L454] (line 454, col 3, score 1)
- [chroma-toolkit-consolidation-plan#L171|Chroma Toolkit Consolidation Plan — L171] (line 171, col 1, score 1)
- [chroma-toolkit-consolidation-plan#L171|Chroma Toolkit Consolidation Plan — L171] (line 171, col 3, score 1)
- [JavaScript — L14]chunks/javascript.md#L14 (line 14, col 1, score 1)
- [JavaScript — L14]chunks/javascript.md#L14 (line 14, col 3, score 1)
- [docs/unique/ecs-offload-workers#L454|ecs-offload-workers — L454] (line 454, col 1, score 1)
- [docs/unique/ecs-offload-workers#L454|ecs-offload-workers — L454] (line 454, col 3, score 1)
- [docs/unique/archetype-ecs#L460|archetype-ecs — L460] (line 460, col 1, score 1)
- [docs/unique/archetype-ecs#L460|archetype-ecs — L460] (line 460, col 3, score 1)
- [JavaScript — L15]chunks/javascript.md#L15 (line 15, col 1, score 1)
- [JavaScript — L15]chunks/javascript.md#L15 (line 15, col 3, score 1)
- [ecs-scheduler-and-prefabs#L388|ecs-scheduler-and-prefabs — L388] (line 388, col 1, score 1)
- [ecs-scheduler-and-prefabs#L388|ecs-scheduler-and-prefabs — L388] (line 388, col 3, score 1)
- [docs/unique/eidolon-field-math-foundations#L129|eidolon-field-math-foundations — L129] (line 129, col 1, score 1)
- [docs/unique/eidolon-field-math-foundations#L129|eidolon-field-math-foundations — L129] (line 129, col 3, score 1)
- [docs/unique/archetype-ecs#L455|archetype-ecs — L455] (line 455, col 1, score 1)
- [docs/unique/archetype-ecs#L455|archetype-ecs — L455] (line 455, col 3, score 1)
- [docs/unique/ecs-offload-workers#L455|ecs-offload-workers — L455] (line 455, col 1, score 1)
- [docs/unique/ecs-offload-workers#L455|ecs-offload-workers — L455] (line 455, col 3, score 1)
- [ecs-scheduler-and-prefabs#L387|ecs-scheduler-and-prefabs — L387] (line 387, col 1, score 1)
- [ecs-scheduler-and-prefabs#L387|ecs-scheduler-and-prefabs — L387] (line 387, col 3, score 1)
- [docs/unique/eidolon-field-math-foundations#L130|eidolon-field-math-foundations — L130] (line 130, col 1, score 1)
- [docs/unique/eidolon-field-math-foundations#L130|eidolon-field-math-foundations — L130] (line 130, col 3, score 1)
- [api-gateway-versioning#L284|api-gateway-versioning — L284] (line 284, col 1, score 1)
- [api-gateway-versioning#L284|api-gateway-versioning — L284] (line 284, col 3, score 1)
- [Debugging Broker Connections and Agent Behavior — L40]debugging-broker-connections-and-agent-behavior.md#L40 (line 40, col 1, score 1)
- [Debugging Broker Connections and Agent Behavior — L40]debugging-broker-connections-and-agent-behavior.md#L40 (line 40, col 3, score 1)
- [dynamic-context-model-for-web-components#L384|Dynamic Context Model for Web Components — L384] (line 384, col 1, score 1)
- [dynamic-context-model-for-web-components#L384|Dynamic Context Model for Web Components — L384] (line 384, col 3, score 1)
- [docs/unique/ecs-offload-workers#L458|ecs-offload-workers — L458] (line 458, col 1, score 1)
- [docs/unique/ecs-offload-workers#L458|ecs-offload-workers — L458] (line 458, col 3, score 1)
- [docs/unique/agent-tasks-persistence-migration-to-dualstore#L133|Agent Tasks: Persistence Migration to DualStore — L133] (line 133, col 1, score 1)
- [docs/unique/agent-tasks-persistence-migration-to-dualstore#L133|Agent Tasks: Persistence Migration to DualStore — L133] (line 133, col 3, score 1)
- [docs/unique/aionian-circuit-math#L151|aionian-circuit-math — L151] (line 151, col 1, score 1)
- [docs/unique/aionian-circuit-math#L151|aionian-circuit-math — L151] (line 151, col 3, score 1)
- [Math Fundamentals — L14]chunks/math-fundamentals.md#L14 (line 14, col 1, score 1)
- [Math Fundamentals — L14]chunks/math-fundamentals.md#L14 (line 14, col 3, score 1)
- [docs/unique/ecs-offload-workers#L460|ecs-offload-workers — L460] (line 460, col 1, score 1)
- [docs/unique/ecs-offload-workers#L460|ecs-offload-workers — L460] (line 460, col 3, score 1)
- [i3-config-validation-methods#L56|i3-config-validation-methods — L56] (line 56, col 1, score 1)
- [i3-config-validation-methods#L56|i3-config-validation-methods — L56] (line 56, col 3, score 1)
- Local-First Intention→Code Loop with Free Models — L143$local-first-intention-code-loop-with-free-models.md#L143 (line 143, col 1, score 1)
- Local-First Intention→Code Loop with Free Models — L143$local-first-intention-code-loop-with-free-models.md#L143 (line 143, col 3, score 1)
- [performance-optimized-polyglot-bridge#L438|Performance-Optimized-Polyglot-Bridge — L438] (line 438, col 1, score 1)
- [performance-optimized-polyglot-bridge#L438|Performance-Optimized-Polyglot-Bridge — L438] (line 438, col 3, score 1)
- [polyglot-s-expr-bridge-python-js-lisp-interop#L506|Polyglot S-expr Bridge: Python-JS-Lisp Interop — L506] (line 506, col 1, score 1)
- [polyglot-s-expr-bridge-python-js-lisp-interop#L506|Polyglot S-expr Bridge: Python-JS-Lisp Interop — L506] (line 506, col 3, score 1)
- [admin-dashboard-for-user-management#L41|Admin Dashboard for User Management — L41] (line 41, col 1, score 1)
- [admin-dashboard-for-user-management#L41|Admin Dashboard for User Management — L41] (line 41, col 3, score 1)
- [docs/unique/ecs-offload-workers#L461|ecs-offload-workers — L461] (line 461, col 1, score 1)
- [docs/unique/ecs-offload-workers#L461|ecs-offload-workers — L461] (line 461, col 3, score 1)
- [ecs-scheduler-and-prefabs#L397|ecs-scheduler-and-prefabs — L397] (line 397, col 1, score 1)
- [ecs-scheduler-and-prefabs#L397|ecs-scheduler-and-prefabs — L397] (line 397, col 3, score 1)
- [local-only-llm-workflow#L173|Local-Only-LLM-Workflow — L173] (line 173, col 1, score 1)
- [local-only-llm-workflow#L173|Local-Only-LLM-Workflow — L173] (line 173, col 3, score 1)
- [docs/unique/compiler-kit-foundations#L611|compiler-kit-foundations — L611] (line 611, col 1, score 1)
- [docs/unique/compiler-kit-foundations#L611|compiler-kit-foundations — L611] (line 611, col 3, score 1)
- [docs/unique/ecs-offload-workers#L462|ecs-offload-workers — L462] (line 462, col 1, score 1)
- [docs/unique/ecs-offload-workers#L462|ecs-offload-workers — L462] (line 462, col 3, score 1)
- [ecs-scheduler-and-prefabs#L398|ecs-scheduler-and-prefabs — L398] (line 398, col 1, score 1)
- [ecs-scheduler-and-prefabs#L398|ecs-scheduler-and-prefabs — L398] (line 398, col 3, score 1)
- [docs/unique/interop-and-source-maps#L517|Interop and Source Maps — L517] (line 517, col 1, score 1)
- [docs/unique/interop-and-source-maps#L517|Interop and Source Maps — L517] (line 517, col 3, score 1)
- [local-only-llm-workflow#L180|Local-Only-LLM-Workflow — L180] (line 180, col 1, score 1)
- [local-only-llm-workflow#L180|Local-Only-LLM-Workflow — L180] (line 180, col 3, score 1)
- [docs/unique/universal-lisp-interface#L202|Universal Lisp Interface — L202] (line 202, col 1, score 1)
- [docs/unique/universal-lisp-interface#L202|Universal Lisp Interface — L202] (line 202, col 3, score 1)
- [voice-access-layer-design#L315|Voice Access Layer Design — L315] (line 315, col 1, score 1)
- [voice-access-layer-design#L315|Voice Access Layer Design — L315] (line 315, col 3, score 1)
- [docs/unique/interop-and-source-maps#L518|Interop and Source Maps — L518] (line 518, col 1, score 1)
- [docs/unique/interop-and-source-maps#L518|Interop and Source Maps — L518] (line 518, col 3, score 1)
- [language-agnostic-mirror-system#L538|Language-Agnostic Mirror System — L538] (line 538, col 1, score 1)
- [language-agnostic-mirror-system#L538|Language-Agnostic Mirror System — L538] (line 538, col 3, score 1)
- [local-only-llm-workflow#L171|Local-Only-LLM-Workflow — L171] (line 171, col 1, score 1)
- [local-only-llm-workflow#L171|Local-Only-LLM-Workflow — L171] (line 171, col 3, score 1)
- [performance-optimized-polyglot-bridge#L439|Performance-Optimized-Polyglot-Bridge — L439] (line 439, col 1, score 1)
- [performance-optimized-polyglot-bridge#L439|Performance-Optimized-Polyglot-Bridge — L439] (line 439, col 3, score 1)
- [Promethean Event Bus MVP v0.1 — L890]promethean-event-bus-mvp-v0-1.md#L890 (line 890, col 1, score 1)
- [Promethean Event Bus MVP v0.1 — L890]promethean-event-bus-mvp-v0-1.md#L890 (line 890, col 3, score 1)
- [promethean-infrastructure-setup#L615|Promethean Infrastructure Setup — L615] (line 615, col 1, score 0.99)
- [promethean-infrastructure-setup#L615|Promethean Infrastructure Setup — L615] (line 615, col 3, score 0.99)
- [performance-optimized-polyglot-bridge#L452|Performance-Optimized-Polyglot-Bridge — L452] (line 452, col 1, score 0.99)
- [performance-optimized-polyglot-bridge#L452|Performance-Optimized-Polyglot-Bridge — L452] (line 452, col 3, score 0.99)
- [polyglot-s-expr-bridge-python-js-lisp-interop#L525|Polyglot S-expr Bridge: Python-JS-Lisp Interop — L525] (line 525, col 1, score 0.99)
- [polyglot-s-expr-bridge-python-js-lisp-interop#L525|Polyglot S-expr Bridge: Python-JS-Lisp Interop — L525] (line 525, col 3, score 0.99)
- [universal-intention-code-fabric#L444|universal-intention-code-fabric — L444] (line 444, col 1, score 0.98)
- [universal-intention-code-fabric#L444|universal-intention-code-fabric — L444] (line 444, col 3, score 0.98)
- [docs/unique/ecs-offload-workers#L472|ecs-offload-workers — L472] (line 472, col 1, score 1)
- [docs/unique/ecs-offload-workers#L472|ecs-offload-workers — L472] (line 472, col 3, score 1)
- [markdown-to-org-transpiler#L309|markdown-to-org-transpiler — L309] (line 309, col 1, score 1)
- [markdown-to-org-transpiler#L309|markdown-to-org-transpiler — L309] (line 309, col 3, score 1)
- System Scheduler with Resource-Aware DAG — L414$system-scheduler-with-resource-aware-dag.md#L414 (line 414, col 1, score 1)
- System Scheduler with Resource-Aware DAG — L414$system-scheduler-with-resource-aware-dag.md#L414 (line 414, col 3, score 1)
- System Scheduler with Resource-Aware DAG — L413$system-scheduler-with-resource-aware-dag.md#L413 (line 413, col 1, score 0.99)
- System Scheduler with Resource-Aware DAG — L413$system-scheduler-with-resource-aware-dag.md#L413 (line 413, col 3, score 0.99)
- [ecs-scheduler-and-prefabs#L422|ecs-scheduler-and-prefabs — L422] (line 422, col 1, score 1)
- [ecs-scheduler-and-prefabs#L422|ecs-scheduler-and-prefabs — L422] (line 422, col 3, score 1)
- [markdown-to-org-transpiler#L310|markdown-to-org-transpiler — L310] (line 310, col 1, score 1)
- [markdown-to-org-transpiler#L310|markdown-to-org-transpiler — L310] (line 310, col 3, score 1)
- System Scheduler with Resource-Aware DAG — L415$system-scheduler-with-resource-aware-dag.md#L415 (line 415, col 1, score 1)
- System Scheduler with Resource-Aware DAG — L415$system-scheduler-with-resource-aware-dag.md#L415 (line 415, col 3, score 1)
- [docs/unique/eidolon-field-math-foundations#L155|eidolon-field-math-foundations — L155] (line 155, col 1, score 0.99)
- [docs/unique/eidolon-field-math-foundations#L155|eidolon-field-math-foundations — L155] (line 155, col 3, score 0.99)
- [docs/unique/ecs-offload-workers#L473|ecs-offload-workers — L473] (line 473, col 1, score 1)
- [docs/unique/ecs-offload-workers#L473|ecs-offload-workers — L473] (line 473, col 3, score 1)
- [ecs-scheduler-and-prefabs#L423|ecs-scheduler-and-prefabs — L423] (line 423, col 1, score 1)
- [ecs-scheduler-and-prefabs#L423|ecs-scheduler-and-prefabs — L423] (line 423, col 3, score 1)
- [markdown-to-org-transpiler#L311|markdown-to-org-transpiler — L311] (line 311, col 1, score 1)
- [markdown-to-org-transpiler#L311|markdown-to-org-transpiler — L311] (line 311, col 3, score 1)
- [ecs-scheduler-and-prefabs#L430|ecs-scheduler-and-prefabs — L430] (line 430, col 1, score 1)
- [ecs-scheduler-and-prefabs#L430|ecs-scheduler-and-prefabs — L430] (line 430, col 3, score 1)
- [docs/unique/ecs-offload-workers#L474|ecs-offload-workers — L474] (line 474, col 1, score 1)
- [docs/unique/ecs-offload-workers#L474|ecs-offload-workers — L474] (line 474, col 3, score 1)
- [ecs-scheduler-and-prefabs#L424|ecs-scheduler-and-prefabs — L424] (line 424, col 1, score 1)
- [ecs-scheduler-and-prefabs#L424|ecs-scheduler-and-prefabs — L424] (line 424, col 3, score 1)
- System Scheduler with Resource-Aware DAG — L416$system-scheduler-with-resource-aware-dag.md#L416 (line 416, col 1, score 1)
- System Scheduler with Resource-Aware DAG — L416$system-scheduler-with-resource-aware-dag.md#L416 (line 416, col 3, score 1)
- [docs/unique/eidolon-field-math-foundations#L157|eidolon-field-math-foundations — L157] (line 157, col 1, score 0.98)
- [docs/unique/eidolon-field-math-foundations#L157|eidolon-field-math-foundations — L157] (line 157, col 3, score 0.98)
- [docs/unique/ecs-offload-workers#L476|ecs-offload-workers — L476] (line 476, col 1, score 1)
- [docs/unique/ecs-offload-workers#L476|ecs-offload-workers — L476] (line 476, col 3, score 1)
- [ecs-scheduler-and-prefabs#L426|ecs-scheduler-and-prefabs — L426] (line 426, col 1, score 1)
- [ecs-scheduler-and-prefabs#L426|ecs-scheduler-and-prefabs — L426] (line 426, col 3, score 1)
- [markdown-to-org-transpiler#L313|markdown-to-org-transpiler — L313] (line 313, col 1, score 1)
- [markdown-to-org-transpiler#L313|markdown-to-org-transpiler — L313] (line 313, col 3, score 1)
- System Scheduler with Resource-Aware DAG — L418$system-scheduler-with-resource-aware-dag.md#L418 (line 418, col 1, score 1)
- System Scheduler with Resource-Aware DAG — L418$system-scheduler-with-resource-aware-dag.md#L418 (line 418, col 3, score 1)
- [docs/unique/agent-tasks-persistence-migration-to-dualstore#L147|Agent Tasks: Persistence Migration to DualStore — L147] (line 147, col 1, score 1)
- [docs/unique/agent-tasks-persistence-migration-to-dualstore#L147|Agent Tasks: Persistence Migration to DualStore — L147] (line 147, col 3, score 1)
- [docs/unique/ecs-offload-workers#L477|ecs-offload-workers — L477] (line 477, col 1, score 1)
- [docs/unique/ecs-offload-workers#L477|ecs-offload-workers — L477] (line 477, col 3, score 1)
- [ecs-scheduler-and-prefabs#L427|ecs-scheduler-and-prefabs — L427] (line 427, col 1, score 1)
- [ecs-scheduler-and-prefabs#L427|ecs-scheduler-and-prefabs — L427] (line 427, col 3, score 1)
- [markdown-to-org-transpiler#L314|markdown-to-org-transpiler — L314] (line 314, col 1, score 1)
- [markdown-to-org-transpiler#L314|markdown-to-org-transpiler — L314] (line 314, col 3, score 1)
- [docs/unique/ecs-offload-workers#L478|ecs-offload-workers — L478] (line 478, col 1, score 1)
- [docs/unique/ecs-offload-workers#L478|ecs-offload-workers — L478] (line 478, col 3, score 1)
- [ecs-scheduler-and-prefabs#L428|ecs-scheduler-and-prefabs — L428] (line 428, col 1, score 1)
- [ecs-scheduler-and-prefabs#L428|ecs-scheduler-and-prefabs — L428] (line 428, col 3, score 1)
- [markdown-to-org-transpiler#L315|markdown-to-org-transpiler — L315] (line 315, col 1, score 1)
- [markdown-to-org-transpiler#L315|markdown-to-org-transpiler — L315] (line 315, col 3, score 1)
- System Scheduler with Resource-Aware DAG — L420$system-scheduler-with-resource-aware-dag.md#L420 (line 420, col 1, score 1)
- System Scheduler with Resource-Aware DAG — L420$system-scheduler-with-resource-aware-dag.md#L420 (line 420, col 3, score 1)
- [docs/unique/ecs-offload-workers#L479|ecs-offload-workers — L479] (line 479, col 1, score 1)
- [docs/unique/ecs-offload-workers#L479|ecs-offload-workers — L479] (line 479, col 3, score 1)
- [ecs-scheduler-and-prefabs#L429|ecs-scheduler-and-prefabs — L429] (line 429, col 1, score 1)
- [ecs-scheduler-and-prefabs#L429|ecs-scheduler-and-prefabs — L429] (line 429, col 3, score 1)
- [markdown-to-org-transpiler#L316|markdown-to-org-transpiler — L316] (line 316, col 1, score 1)
- [markdown-to-org-transpiler#L316|markdown-to-org-transpiler — L316] (line 316, col 3, score 1)
- System Scheduler with Resource-Aware DAG — L421$system-scheduler-with-resource-aware-dag.md#L421 (line 421, col 1, score 1)
- System Scheduler with Resource-Aware DAG — L421$system-scheduler-with-resource-aware-dag.md#L421 (line 421, col 3, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
