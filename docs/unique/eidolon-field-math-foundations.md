---
uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
created_at: eidolon-field-math-foundations.md
filename: eidolon-field-math-foundations
description: >-
  Mathematical framework defining Eidolon Field, Daimoi, and Field Node
  mechanics with scalar fields, gradients, motion equations, and node
  potentials.
tags:
  - eidolon
  - field
  - math
  - daimoi
  - node
  - potential
  - gradient
  - scalar
  - vector
  - motion
  - equation
  - theory
related_to_title:
  - field-dynamics-math-blocks
  - field-interaction-equations
  - aionian-circuit-math
  - homeostasis-decay-formulas
  - Promethean Infrastructure Setup
  - ecs-scheduler-and-prefabs
  - ecs-offload-workers
  - System Scheduler with Resource-Aware DAG
  - markdown-to-org-transpiler
  - Ollama-LLM-Provider-for-Pseudo-Code-Transpiler
  - 'Agent Tasks: Persistence Migration to DualStore'
  - Math Fundamentals
  - Unique Info Dump Index
  - Per-Domain Policy System for JS Crawler
  - field-node-diagram-outline
  - 2d-sandbox-field
  - Eidolon-Field-Optimization
  - Eidolon Field Abstract Model
  - eidolon-node-lifecycle
  - Chroma Toolkit Consolidation Plan
  - EidolonField
  - archetype-ecs
  - JavaScript
  - Local-Only-LLM-Workflow
  - js-to-lisp-reverse-compiler
  - Local-First Intention→Code Loop with Free Models
  - Migrate to Provider-Tenant Architecture
  - prom-lib-rate-limiters-and-replay-api
  - Diagrams
  - DSL
  - Cross-Target Macro System in Sibilant
  - Dynamic Context Model for Web Components
  - api-gateway-versioning
  - Debugging Broker Connections and Agent Behavior
  - Pure-Node Crawl Stack with Playwright and Crawlee
  - Performance-Optimized-Polyglot-Bridge
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - RAG UI Panel with Qdrant and PostgREST
  - infinite_depth_smoke_animation
related_to_uuid:
  - 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
  - b09141b7-544f-4c8e-8f49-bf76cecaacbb
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - 37b5d236-2b3e-4a95-a4e8-31655c3023ef
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - ba244286-4e84-425b-8bf6-b80c4eb783fc
  - ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
  - b362e12e-2802-4e41-9a21-6e0c7ad419a2
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - c03020e1-e3e7-48bf-aa7e-aa740c601b63
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - c710dc93-9fec-471b-bdee-bedbd360c67f
  - 40e05c14-0db0-44c5-bf0a-2eece2f4c2a4
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - 49d1e1e5-5d13-4955-8f6f-7676434ec462
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - c1618c66-f73a-4e04-9bfa-ef38755f7acc
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - 58191024-d04a-4520-8aae-a18be7b94263
  - 871490c7-a050-429b-88b2-55dfeaa1f8d5
  - 54382370-1931-4a19-a634-46735708a9ea
  - aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
  - 45cd25b5-ed36-49ab-82c8-10d0903e34db
  - e87bc036-1570-419e-a558-f45b9c0db698
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 0580dcd3-533d-4834-8a2f-eae3771960a9
  - 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
  - d527c05d-22e8-4493-8f29-ae3cb67f035b
  - f5579967-762d-4cfd-851e-4f71b4cb77a1
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - e1056831-ae0c-460b-95fa-4cf09b3398c6
  - 92a052a5-3351-4898-8cab-758181a86adb
references:
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 5
    col: 1
    score: 0.86
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 5
    col: 3
    score: 0.86
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 27
    col: 1
    score: 0.86
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 27
    col: 3
    score: 0.86
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 17
    col: 1
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 40
    col: 1
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 66
    col: 1
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 85
    col: 1
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 105
    col: 1
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 59
    col: 1
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 76
    col: 1
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 95
    col: 1
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 58
    col: 1
    score: 0.87
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 558
    col: 1
    score: 0.9
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 379
    col: 1
    score: 0.88
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 446
    col: 1
    score: 0.88
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 377
    col: 1
    score: 0.88
  - uuid: ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
    line: 289
    col: 1
    score: 0.88
  - uuid: b362e12e-2802-4e41-9a21-6e0c7ad419a2
    line: 153
    col: 1
    score: 0.88
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 8
    col: 3
    score: 0.88
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 145
    col: 1
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 132
    col: 1
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 145
    col: 1
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 145
    col: 1
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 147
    col: 1
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 134
    col: 1
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 147
    col: 1
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 147
    col: 1
    score: 1
  - uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
    line: 197
    col: 1
    score: 1
  - uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
    line: 197
    col: 3
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 154
    col: 1
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 154
    col: 3
    score: 1
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 13
    col: 1
    score: 1
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 13
    col: 3
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 194
    col: 1
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 194
    col: 3
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 153
    col: 1
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 153
    col: 3
    score: 1
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 15
    col: 1
    score: 1
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 15
    col: 3
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 177
    col: 1
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 177
    col: 3
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 138
    col: 1
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 138
    col: 3
    score: 1
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 16
    col: 1
    score: 1
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 16
    col: 3
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 142
    col: 1
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 142
    col: 3
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 154
    col: 1
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 154
    col: 3
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 154
    col: 1
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 154
    col: 3
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 152
    col: 1
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 152
    col: 3
    score: 1
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 12
    col: 1
    score: 1
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 12
    col: 3
    score: 1
  - uuid: 40e05c14-0db0-44c5-bf0a-2eece2f4c2a4
    line: 102
    col: 1
    score: 1
  - uuid: 40e05c14-0db0-44c5-bf0a-2eece2f4c2a4
    line: 102
    col: 3
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 141
    col: 1
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 141
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
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 177
    col: 1
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 177
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
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 179
    col: 1
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 179
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
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 424
    col: 1
    score: 1
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 424
    col: 3
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 176
    col: 1
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 176
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
  - uuid: 871490c7-a050-429b-88b2-55dfeaa1f8d5
    line: 145
    col: 1
    score: 1
  - uuid: 871490c7-a050-429b-88b2-55dfeaa1f8d5
    line: 145
    col: 3
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 174
    col: 1
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 174
    col: 3
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 173
    col: 1
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 173
    col: 3
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 266
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 266
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
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 157
    col: 1
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 157
    col: 3
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 150
    col: 1
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 150
    col: 3
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 156
    col: 1
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 156
    col: 3
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 155
    col: 1
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 155
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
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 132
    col: 1
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 132
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
  - uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
    line: 198
    col: 1
    score: 1
  - uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
    line: 198
    col: 3
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 195
    col: 1
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 195
    col: 3
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 32
    col: 1
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 32
    col: 3
    score: 1
  - uuid: 49d1e1e5-5d13-4955-8f6f-7676434ec462
    line: 248
    col: 1
    score: 1
  - uuid: 49d1e1e5-5d13-4955-8f6f-7676434ec462
    line: 248
    col: 3
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 154
    col: 1
    score: 0.97
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 154
    col: 3
    score: 0.97
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 162
    col: 1
    score: 0.97
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 162
    col: 3
    score: 0.97
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 128
    col: 1
    score: 0.96
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 128
    col: 3
    score: 0.96
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 155
    col: 1
    score: 0.96
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 155
    col: 3
    score: 0.96
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 163
    col: 1
    score: 0.98
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 163
    col: 3
    score: 0.98
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 156
    col: 1
    score: 0.99
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 156
    col: 3
    score: 0.99
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 165
    col: 1
    score: 0.99
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 165
    col: 3
    score: 0.99
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 164
    col: 1
    score: 0.98
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 164
    col: 3
    score: 0.98
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 25
    col: 1
    score: 0.98
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 25
    col: 3
    score: 0.98
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 157
    col: 1
    score: 0.99
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 157
    col: 3
    score: 0.99
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 166
    col: 1
    score: 0.99
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 166
    col: 3
    score: 0.99
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 165
    col: 1
    score: 0.99
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 165
    col: 3
    score: 0.99
  - uuid: 92a052a5-3351-4898-8cab-758181a86adb
    line: 96
    col: 1
    score: 0.98
  - uuid: 92a052a5-3351-4898-8cab-758181a86adb
    line: 96
    col: 3
    score: 0.98
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 158
    col: 1
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 158
    col: 3
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 166
    col: 1
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 166
    col: 3
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 169
    col: 1
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 169
    col: 3
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 161
    col: 1
    score: 0.97
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 161
    col: 3
    score: 0.97
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 159
    col: 1
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 159
    col: 3
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 167
    col: 1
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 167
    col: 3
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 170
    col: 1
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 170
    col: 3
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 160
    col: 1
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 160
    col: 3
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 168
    col: 1
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 168
    col: 3
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 171
    col: 1
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 171
    col: 3
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 169
    col: 1
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 169
    col: 3
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 172
    col: 1
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 172
    col: 3
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 162
    col: 1
    score: 0.98
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 162
    col: 3
    score: 0.98
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 170
    col: 1
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 170
    col: 3
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 173
    col: 1
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 173
    col: 3
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 167
    col: 1
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 167
    col: 3
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 183
    col: 1
    score: 0.97
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 183
    col: 3
    score: 0.97
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 184
    col: 1
    score: 0.97
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 184
    col: 3
    score: 0.97
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 188
    col: 1
    score: 0.97
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 188
    col: 3
    score: 0.97
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 168
    col: 1
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 168
    col: 3
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 169
    col: 1
    score: 0.97
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 169
    col: 3
    score: 0.97
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 181
    col: 1
    score: 0.97
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 181
    col: 3
    score: 0.97
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 21
    col: 1
    score: 0.99
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 21
    col: 3
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 124
    col: 1
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 124
    col: 3
    score: 0.99
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 176
    col: 1
    score: 0.99
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 176
    col: 3
    score: 0.99
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 162
    col: 1
    score: 0.98
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 162
    col: 3
    score: 0.98
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 369
    col: 1
    score: 1
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 369
    col: 3
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 189
    col: 1
    score: 0.99
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 189
    col: 3
    score: 0.99
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 476
    col: 1
    score: 0.99
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 476
    col: 3
    score: 0.99
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 426
    col: 1
    score: 0.99
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 426
    col: 3
    score: 0.99
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
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 609
    col: 1
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 609
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
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 610
    col: 1
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 610
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
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 611
    col: 1
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 611
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
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 612
    col: 1
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 612
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
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 613
    col: 1
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 613
    col: 3
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 478
    col: 1
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 478
    col: 3
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 288
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 288
    col: 3
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 307
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 307
    col: 3
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 293
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 293
    col: 3
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 175
    col: 1
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 175
    col: 3
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 178
    col: 1
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 178
    col: 3
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 182
    col: 1
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 182
    col: 3
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 179
    col: 1
    score: 0.98
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 179
    col: 3
    score: 0.98
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 179
    col: 1
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 179
    col: 3
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 180
    col: 1
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 180
    col: 3
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 184
    col: 1
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 184
    col: 3
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 180
    col: 1
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 180
    col: 3
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 177
    col: 1
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 177
    col: 3
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 185
    col: 1
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 185
    col: 3
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 184
    col: 1
    score: 0.99
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 184
    col: 3
    score: 0.99
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 181
    col: 1
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 181
    col: 3
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 178
    col: 1
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 178
    col: 3
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 181
    col: 1
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 181
    col: 3
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 185
    col: 1
    score: 0.99
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 185
    col: 3
    score: 0.99
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 182
    col: 1
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 182
    col: 3
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 186
    col: 1
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 186
    col: 3
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 181
    col: 1
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 181
    col: 3
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 189
    col: 1
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 189
    col: 3
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 182
    col: 1
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 182
    col: 3
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 185
    col: 1
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 185
    col: 3
    score: 1
---
Note: Consolidated here → ../notes/math/eidolon-field-math-foundations.md

Excellent—let’s start layering in some math to express the **Eidolon Field**, **Daimoi**, and **Field Node mechanics**. I’ll structure this into self-contained math blocks, each ready to drop into a note and render in Obsidian’s LaTeX-style markdown (with `$$`).

Let’s begin with core constructs:

---

### 🧮 **1. Eidolon Field Scalar Value at a Point**

We define the Eidolon field $\Phi$ as a scalar field over an 8-dimensional space:

$$
\Phi: \mathbb{R}^8 \to \mathbb{R}, \quad \Phi(\vec{x}) = \sum_{i=1}^8 \phi_i(x_i)
$$

Where:

* $\vec{x} = (x_1, x_2, \dots, x_8)$ is the position in field space, with each $x_i$ corresponding to a circuit axis
* $\phi_i$ is the scalar tension along axis $i$

---

### 🧲 **2. Gradient (Pressure) Vector at a Point**

The local “wind” a daimo feels is the gradient of field tension:

$$
\vec{F}(\vec{x}) = -\nabla \Phi(\vec{x}) = \left( -\frac{\partial \Phi}{\partial x_1}, \dots, -\frac{\partial \Phi}{\partial x_8} \right)
$$

This is the **negative gradient**, guiding Daimoi toward lower tension.

---

### 🧠 **3. Daimo State Vector**

Each Daimo is defined by:

$$
\delta = \left( \vec{p}, \vec{v}, m, q \right)
$$

Where:

* $\vec{p} \in \mathbb{R}^8$: position in the Eidolon field
* $\vec{v} \in \mathbb{R}^8$: velocity vector
* $m \in \mathbb{R}^+$: mass (inertia to field pressure)
* $q \in \mathbb{R}$: charge (affective polarity)

---

### 🌀 **4. Daimo Motion Equation**

Using basic Newtonian dynamics in field space:

$$
\frac{d\vec{v}}{dt} = \frac{1}{m} \cdot \vec{F}(\vec{p})
$$

$$
\frac{d\vec{p}}{dt} = \vec{v}
$$

These equations evolve each daimo’s state as it traverses field gradients.

---

### 💥 **5. Node Potential Influence**

Each Field Node $N_k$ adds localized potential energy to the field:

$$
\Phi_{N_k}(\vec{x}) = A_k \cdot \exp\left(-\frac{\|\vec{x} - \vec{x}_k\|^2}{2\sigma_k^2}\right)
$$

Where:

* $\vec{x}_k$: position of the node
* $A_k$: strength (positive = attractor, negative = hazard)
* $\sigma_k$: spread of influence (controls “size” of node)

The total field is then:

$$
\Phi(\vec{x}) = \sum_k \Phi_{N_k}(\vec{x}) + \text{global background field}
$$

---

### 🔄 **6. Daimo–Node Interaction Potential**

At binding distance $\epsilon$, a daimo may bind to a Nexus if:

$$
\|\vec{p}_\delta - \vec{x}_N\| < \epsilon \quad \text{and} \quad \text{sign}(q_\delta) \neq \text{sign}(A_N)
$$

This expresses **charge attraction** logic and symbolic binding condition.

---

Want to keep going?

I can add:

* symbolic entropy equations (for field disorder)
* daimo fusion math (charge conservation)
* node decay over time ($A_k(t)$)
* daimo generation from field energy
* or anything else you're hungry for.

Say the word—I'll write it up.

---

Related notes: [[../notes/math/advanced-field-math|advanced-field-math]], [[../notes/math/aionian-feedback-oscillator|aionian-feedback-oscillator]], [[../notes/math/aionian-pulse-rhythm-model|aionian-pulse-rhythm-model]], [[../notes/math/eidolon-field-math|eidolon-field-math]], [[../notes/math/symbolic-gravity-models|symbolic-gravity-models]] [[index|unique/index]]

#tags: #math #theory
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [field-interaction-equations](field-interaction-equations.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Eidolon-Field-Optimization](eidolon-field-optimization.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [EidolonField](eidolonfield.md)
- [archetype-ecs](archetype-ecs.md)
- [JavaScript](chunks/javascript.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [Diagrams](chunks/diagrams.md)
- [DSL](chunks/dsl.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [infinite_depth_smoke_animation](infinite-depth-smoke-animation.md)

## Sources
- [Math Fundamentals — L5](chunks/math-fundamentals.md#L5) (line 5, col 1, score 0.86)
- [Math Fundamentals — L5](chunks/math-fundamentals.md#L5) (line 5, col 3, score 0.86)
- [Unique Info Dump Index — L27](unique-info-dump-index.md#L27) (line 27, col 1, score 0.86)
- [Unique Info Dump Index — L27](unique-info-dump-index.md#L27) (line 27, col 3, score 0.86)
- [aionian-circuit-math — L17](aionian-circuit-math.md#L17) (line 17, col 1, score 1)
- [aionian-circuit-math — L40](aionian-circuit-math.md#L40) (line 40, col 1, score 1)
- [aionian-circuit-math — L66](aionian-circuit-math.md#L66) (line 66, col 1, score 1)
- [aionian-circuit-math — L85](aionian-circuit-math.md#L85) (line 85, col 1, score 1)
- [aionian-circuit-math — L105](aionian-circuit-math.md#L105) (line 105, col 1, score 1)
- [field-dynamics-math-blocks — L59](field-dynamics-math-blocks.md#L59) (line 59, col 1, score 1)
- [field-dynamics-math-blocks — L76](field-dynamics-math-blocks.md#L76) (line 76, col 1, score 1)
- [field-dynamics-math-blocks — L95](field-dynamics-math-blocks.md#L95) (line 95, col 1, score 1)
- [field-interaction-equations — L58](field-interaction-equations.md#L58) (line 58, col 1, score 0.87)
- [Promethean Infrastructure Setup — L558](promethean-infrastructure-setup.md#L558) (line 558, col 1, score 0.9)
- [ecs-scheduler-and-prefabs — L379](ecs-scheduler-and-prefabs.md#L379) (line 379, col 1, score 0.88)
- [ecs-offload-workers — L446](ecs-offload-workers.md#L446) (line 446, col 1, score 0.88)
- [System Scheduler with Resource-Aware DAG — L377](system-scheduler-with-resource-aware-dag.md#L377) (line 377, col 1, score 0.88)
- [markdown-to-org-transpiler — L289](markdown-to-org-transpiler.md#L289) (line 289, col 1, score 0.88)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L153](ollama-llm-provider-for-pseudo-code-transpiler.md#L153) (line 153, col 1, score 0.88)
- [Agent Tasks: Persistence Migration to DualStore — L8](agent-tasks-persistence-migration-to-dualstore.md#L8) (line 8, col 3, score 0.88)
- [aionian-circuit-math — L145](aionian-circuit-math.md#L145) (line 145, col 1, score 1)
- [field-dynamics-math-blocks — L132](field-dynamics-math-blocks.md#L132) (line 132, col 1, score 1)
- [field-interaction-equations — L145](field-interaction-equations.md#L145) (line 145, col 1, score 1)
- [homeostasis-decay-formulas — L145](homeostasis-decay-formulas.md#L145) (line 145, col 1, score 1)
- [aionian-circuit-math — L147](aionian-circuit-math.md#L147) (line 147, col 1, score 1)
- [field-dynamics-math-blocks — L134](field-dynamics-math-blocks.md#L134) (line 134, col 1, score 1)
- [field-interaction-equations — L147](field-interaction-equations.md#L147) (line 147, col 1, score 1)
- [homeostasis-decay-formulas — L147](homeostasis-decay-formulas.md#L147) (line 147, col 1, score 1)
- [2d-sandbox-field — L197](2d-sandbox-field.md#L197) (line 197, col 1, score 1)
- [2d-sandbox-field — L197](2d-sandbox-field.md#L197) (line 197, col 3, score 1)
- [aionian-circuit-math — L154](aionian-circuit-math.md#L154) (line 154, col 1, score 1)
- [aionian-circuit-math — L154](aionian-circuit-math.md#L154) (line 154, col 3, score 1)
- [Math Fundamentals — L13](chunks/math-fundamentals.md#L13) (line 13, col 1, score 1)
- [Math Fundamentals — L13](chunks/math-fundamentals.md#L13) (line 13, col 3, score 1)
- [Eidolon Field Abstract Model — L194](eidolon-field-abstract-model.md#L194) (line 194, col 1, score 1)
- [Eidolon Field Abstract Model — L194](eidolon-field-abstract-model.md#L194) (line 194, col 3, score 1)
- [aionian-circuit-math — L153](aionian-circuit-math.md#L153) (line 153, col 1, score 1)
- [aionian-circuit-math — L153](aionian-circuit-math.md#L153) (line 153, col 3, score 1)
- [Math Fundamentals — L15](chunks/math-fundamentals.md#L15) (line 15, col 1, score 1)
- [Math Fundamentals — L15](chunks/math-fundamentals.md#L15) (line 15, col 3, score 1)
- [Cross-Target Macro System in Sibilant — L177](cross-target-macro-system-in-sibilant.md#L177) (line 177, col 1, score 1)
- [Cross-Target Macro System in Sibilant — L177](cross-target-macro-system-in-sibilant.md#L177) (line 177, col 3, score 1)
- [field-dynamics-math-blocks — L138](field-dynamics-math-blocks.md#L138) (line 138, col 1, score 1)
- [field-dynamics-math-blocks — L138](field-dynamics-math-blocks.md#L138) (line 138, col 3, score 1)
- [Math Fundamentals — L16](chunks/math-fundamentals.md#L16) (line 16, col 1, score 1)
- [Math Fundamentals — L16](chunks/math-fundamentals.md#L16) (line 16, col 3, score 1)
- [field-dynamics-math-blocks — L142](field-dynamics-math-blocks.md#L142) (line 142, col 1, score 1)
- [field-dynamics-math-blocks — L142](field-dynamics-math-blocks.md#L142) (line 142, col 3, score 1)
- [field-interaction-equations — L154](field-interaction-equations.md#L154) (line 154, col 1, score 1)
- [field-interaction-equations — L154](field-interaction-equations.md#L154) (line 154, col 3, score 1)
- [homeostasis-decay-formulas — L154](homeostasis-decay-formulas.md#L154) (line 154, col 1, score 1)
- [homeostasis-decay-formulas — L154](homeostasis-decay-formulas.md#L154) (line 154, col 3, score 1)
- [aionian-circuit-math — L152](aionian-circuit-math.md#L152) (line 152, col 1, score 1)
- [aionian-circuit-math — L152](aionian-circuit-math.md#L152) (line 152, col 3, score 1)
- [Math Fundamentals — L12](chunks/math-fundamentals.md#L12) (line 12, col 1, score 1)
- [Math Fundamentals — L12](chunks/math-fundamentals.md#L12) (line 12, col 3, score 1)
- [Eidolon-Field-Optimization — L102](eidolon-field-optimization.md#L102) (line 102, col 1, score 1)
- [Eidolon-Field-Optimization — L102](eidolon-field-optimization.md#L102) (line 102, col 3, score 1)
- [field-dynamics-math-blocks — L141](field-dynamics-math-blocks.md#L141) (line 141, col 1, score 1)
- [field-dynamics-math-blocks — L141](field-dynamics-math-blocks.md#L141) (line 141, col 3, score 1)
- [api-gateway-versioning — L284](api-gateway-versioning.md#L284) (line 284, col 1, score 1)
- [api-gateway-versioning — L284](api-gateway-versioning.md#L284) (line 284, col 3, score 1)
- [Debugging Broker Connections and Agent Behavior — L40](debugging-broker-connections-and-agent-behavior.md#L40) (line 40, col 1, score 1)
- [Debugging Broker Connections and Agent Behavior — L40](debugging-broker-connections-and-agent-behavior.md#L40) (line 40, col 3, score 1)
- [Dynamic Context Model for Web Components — L384](dynamic-context-model-for-web-components.md#L384) (line 384, col 1, score 1)
- [Dynamic Context Model for Web Components — L384](dynamic-context-model-for-web-components.md#L384) (line 384, col 3, score 1)
- [ecs-offload-workers — L458](ecs-offload-workers.md#L458) (line 458, col 1, score 1)
- [ecs-offload-workers — L458](ecs-offload-workers.md#L458) (line 458, col 3, score 1)
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
- [Local-Only-LLM-Workflow — L177](local-only-llm-workflow.md#L177) (line 177, col 1, score 1)
- [Local-Only-LLM-Workflow — L177](local-only-llm-workflow.md#L177) (line 177, col 3, score 1)
- [archetype-ecs — L455](archetype-ecs.md#L455) (line 455, col 1, score 1)
- [archetype-ecs — L455](archetype-ecs.md#L455) (line 455, col 3, score 1)
- [ecs-offload-workers — L455](ecs-offload-workers.md#L455) (line 455, col 1, score 1)
- [ecs-offload-workers — L455](ecs-offload-workers.md#L455) (line 455, col 3, score 1)
- [ecs-scheduler-and-prefabs — L387](ecs-scheduler-and-prefabs.md#L387) (line 387, col 1, score 1)
- [ecs-scheduler-and-prefabs — L387](ecs-scheduler-and-prefabs.md#L387) (line 387, col 3, score 1)
- [Local-Only-LLM-Workflow — L179](local-only-llm-workflow.md#L179) (line 179, col 1, score 1)
- [Local-Only-LLM-Workflow — L179](local-only-llm-workflow.md#L179) (line 179, col 3, score 1)
- [ecs-offload-workers — L456](ecs-offload-workers.md#L456) (line 456, col 1, score 1)
- [ecs-offload-workers — L456](ecs-offload-workers.md#L456) (line 456, col 3, score 1)
- [ecs-scheduler-and-prefabs — L390](ecs-scheduler-and-prefabs.md#L390) (line 390, col 1, score 1)
- [ecs-scheduler-and-prefabs — L390](ecs-scheduler-and-prefabs.md#L390) (line 390, col 3, score 1)
- [js-to-lisp-reverse-compiler — L424](js-to-lisp-reverse-compiler.md#L424) (line 424, col 1, score 1)
- [js-to-lisp-reverse-compiler — L424](js-to-lisp-reverse-compiler.md#L424) (line 424, col 3, score 1)
- [Local-Only-LLM-Workflow — L176](local-only-llm-workflow.md#L176) (line 176, col 1, score 1)
- [Local-Only-LLM-Workflow — L176](local-only-llm-workflow.md#L176) (line 176, col 3, score 1)
- [ecs-offload-workers — L457](ecs-offload-workers.md#L457) (line 457, col 1, score 1)
- [ecs-offload-workers — L457](ecs-offload-workers.md#L457) (line 457, col 3, score 1)
- [ecs-scheduler-and-prefabs — L391](ecs-scheduler-and-prefabs.md#L391) (line 391, col 1, score 1)
- [ecs-scheduler-and-prefabs — L391](ecs-scheduler-and-prefabs.md#L391) (line 391, col 3, score 1)
- [Local-First Intention→Code Loop with Free Models — L145](local-first-intention-code-loop-with-free-models.md#L145) (line 145, col 1, score 1)
- [Local-First Intention→Code Loop with Free Models — L145](local-first-intention-code-loop-with-free-models.md#L145) (line 145, col 3, score 1)
- [Local-Only-LLM-Workflow — L174](local-only-llm-workflow.md#L174) (line 174, col 1, score 1)
- [Local-Only-LLM-Workflow — L174](local-only-llm-workflow.md#L174) (line 174, col 3, score 1)
- [Chroma Toolkit Consolidation Plan — L173](chroma-toolkit-consolidation-plan.md#L173) (line 173, col 1, score 1)
- [Chroma Toolkit Consolidation Plan — L173](chroma-toolkit-consolidation-plan.md#L173) (line 173, col 3, score 1)
- [Migrate to Provider-Tenant Architecture — L266](migrate-to-provider-tenant-architecture.md#L266) (line 266, col 1, score 1)
- [Migrate to Provider-Tenant Architecture — L266](migrate-to-provider-tenant-architecture.md#L266) (line 266, col 3, score 1)
- [Per-Domain Policy System for JS Crawler — L472](per-domain-policy-system-for-js-crawler.md#L472) (line 472, col 1, score 1)
- [Per-Domain Policy System for JS Crawler — L472](per-domain-policy-system-for-js-crawler.md#L472) (line 472, col 3, score 1)
- [prom-lib-rate-limiters-and-replay-api — L390](prom-lib-rate-limiters-and-replay-api.md#L390) (line 390, col 1, score 1)
- [prom-lib-rate-limiters-and-replay-api — L390](prom-lib-rate-limiters-and-replay-api.md#L390) (line 390, col 3, score 1)
- [aionian-circuit-math — L157](aionian-circuit-math.md#L157) (line 157, col 1, score 1)
- [aionian-circuit-math — L157](aionian-circuit-math.md#L157) (line 157, col 3, score 1)
- [field-dynamics-math-blocks — L150](field-dynamics-math-blocks.md#L150) (line 150, col 1, score 1)
- [field-dynamics-math-blocks — L150](field-dynamics-math-blocks.md#L150) (line 150, col 3, score 1)
- [field-interaction-equations — L156](field-interaction-equations.md#L156) (line 156, col 1, score 1)
- [field-interaction-equations — L156](field-interaction-equations.md#L156) (line 156, col 3, score 1)
- [homeostasis-decay-formulas — L155](homeostasis-decay-formulas.md#L155) (line 155, col 1, score 1)
- [homeostasis-decay-formulas — L155](homeostasis-decay-formulas.md#L155) (line 155, col 3, score 1)
- [aionian-circuit-math — L158](aionian-circuit-math.md#L158) (line 158, col 1, score 1)
- [aionian-circuit-math — L158](aionian-circuit-math.md#L158) (line 158, col 3, score 1)
- [archetype-ecs — L457](archetype-ecs.md#L457) (line 457, col 1, score 1)
- [archetype-ecs — L457](archetype-ecs.md#L457) (line 457, col 3, score 1)
- [Diagrams — L9](chunks/diagrams.md#L9) (line 9, col 1, score 1)
- [Diagrams — L9](chunks/diagrams.md#L9) (line 9, col 3, score 1)
- [DSL — L10](chunks/dsl.md#L10) (line 10, col 1, score 1)
- [DSL — L10](chunks/dsl.md#L10) (line 10, col 3, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L132](agent-tasks-persistence-migration-to-dualstore.md#L132) (line 132, col 1, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L132](agent-tasks-persistence-migration-to-dualstore.md#L132) (line 132, col 3, score 1)
- [Migrate to Provider-Tenant Architecture — L269](migrate-to-provider-tenant-architecture.md#L269) (line 269, col 1, score 1)
- [Migrate to Provider-Tenant Architecture — L269](migrate-to-provider-tenant-architecture.md#L269) (line 269, col 3, score 1)
- [Promethean Infrastructure Setup — L582](promethean-infrastructure-setup.md#L582) (line 582, col 1, score 1)
- [Promethean Infrastructure Setup — L582](promethean-infrastructure-setup.md#L582) (line 582, col 3, score 1)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L425](pure-node-crawl-stack-with-playwright-and-crawlee.md#L425) (line 425, col 1, score 1)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L425](pure-node-crawl-stack-with-playwright-and-crawlee.md#L425) (line 425, col 3, score 1)
- [2d-sandbox-field — L198](2d-sandbox-field.md#L198) (line 198, col 1, score 1)
- [2d-sandbox-field — L198](2d-sandbox-field.md#L198) (line 198, col 3, score 1)
- [Eidolon Field Abstract Model — L195](eidolon-field-abstract-model.md#L195) (line 195, col 1, score 1)
- [Eidolon Field Abstract Model — L195](eidolon-field-abstract-model.md#L195) (line 195, col 3, score 1)
- [eidolon-node-lifecycle — L32](eidolon-node-lifecycle.md#L32) (line 32, col 1, score 1)
- [eidolon-node-lifecycle — L32](eidolon-node-lifecycle.md#L32) (line 32, col 3, score 1)
- [EidolonField — L248](eidolonfield.md#L248) (line 248, col 1, score 1)
- [EidolonField — L248](eidolonfield.md#L248) (line 248, col 3, score 1)
- [field-dynamics-math-blocks — L154](field-dynamics-math-blocks.md#L154) (line 154, col 1, score 0.97)
- [field-dynamics-math-blocks — L154](field-dynamics-math-blocks.md#L154) (line 154, col 3, score 0.97)
- [field-interaction-equations — L162](field-interaction-equations.md#L162) (line 162, col 1, score 0.97)
- [field-interaction-equations — L162](field-interaction-equations.md#L162) (line 162, col 3, score 0.97)
- [Unique Info Dump Index — L128](unique-info-dump-index.md#L128) (line 128, col 1, score 0.96)
- [Unique Info Dump Index — L128](unique-info-dump-index.md#L128) (line 128, col 3, score 0.96)
- [field-dynamics-math-blocks — L155](field-dynamics-math-blocks.md#L155) (line 155, col 1, score 0.96)
- [field-dynamics-math-blocks — L155](field-dynamics-math-blocks.md#L155) (line 155, col 3, score 0.96)
- [field-interaction-equations — L163](field-interaction-equations.md#L163) (line 163, col 1, score 0.98)
- [field-interaction-equations — L163](field-interaction-equations.md#L163) (line 163, col 3, score 0.98)
- [field-dynamics-math-blocks — L156](field-dynamics-math-blocks.md#L156) (line 156, col 1, score 0.99)
- [field-dynamics-math-blocks — L156](field-dynamics-math-blocks.md#L156) (line 156, col 3, score 0.99)
- [homeostasis-decay-formulas — L165](homeostasis-decay-formulas.md#L165) (line 165, col 1, score 0.99)
- [homeostasis-decay-formulas — L165](homeostasis-decay-formulas.md#L165) (line 165, col 3, score 0.99)
- [field-interaction-equations — L164](field-interaction-equations.md#L164) (line 164, col 1, score 0.98)
- [field-interaction-equations — L164](field-interaction-equations.md#L164) (line 164, col 3, score 0.98)
- [Math Fundamentals — L25](chunks/math-fundamentals.md#L25) (line 25, col 1, score 0.98)
- [Math Fundamentals — L25](chunks/math-fundamentals.md#L25) (line 25, col 3, score 0.98)
- [field-dynamics-math-blocks — L157](field-dynamics-math-blocks.md#L157) (line 157, col 1, score 0.99)
- [field-dynamics-math-blocks — L157](field-dynamics-math-blocks.md#L157) (line 157, col 3, score 0.99)
- [homeostasis-decay-formulas — L166](homeostasis-decay-formulas.md#L166) (line 166, col 1, score 0.99)
- [homeostasis-decay-formulas — L166](homeostasis-decay-formulas.md#L166) (line 166, col 3, score 0.99)
- [field-interaction-equations — L165](field-interaction-equations.md#L165) (line 165, col 1, score 0.99)
- [field-interaction-equations — L165](field-interaction-equations.md#L165) (line 165, col 3, score 0.99)
- [infinite_depth_smoke_animation — L96](infinite-depth-smoke-animation.md#L96) (line 96, col 1, score 0.98)
- [infinite_depth_smoke_animation — L96](infinite-depth-smoke-animation.md#L96) (line 96, col 3, score 0.98)
- [field-dynamics-math-blocks — L158](field-dynamics-math-blocks.md#L158) (line 158, col 1, score 1)
- [field-dynamics-math-blocks — L158](field-dynamics-math-blocks.md#L158) (line 158, col 3, score 1)
- [field-interaction-equations — L166](field-interaction-equations.md#L166) (line 166, col 1, score 1)
- [field-interaction-equations — L166](field-interaction-equations.md#L166) (line 166, col 3, score 1)
- [homeostasis-decay-formulas — L169](homeostasis-decay-formulas.md#L169) (line 169, col 1, score 1)
- [homeostasis-decay-formulas — L169](homeostasis-decay-formulas.md#L169) (line 169, col 3, score 1)
- [field-dynamics-math-blocks — L161](field-dynamics-math-blocks.md#L161) (line 161, col 1, score 0.97)
- [field-dynamics-math-blocks — L161](field-dynamics-math-blocks.md#L161) (line 161, col 3, score 0.97)
- [field-dynamics-math-blocks — L159](field-dynamics-math-blocks.md#L159) (line 159, col 1, score 1)
- [field-dynamics-math-blocks — L159](field-dynamics-math-blocks.md#L159) (line 159, col 3, score 1)
- [field-interaction-equations — L167](field-interaction-equations.md#L167) (line 167, col 1, score 1)
- [field-interaction-equations — L167](field-interaction-equations.md#L167) (line 167, col 3, score 1)
- [homeostasis-decay-formulas — L170](homeostasis-decay-formulas.md#L170) (line 170, col 1, score 1)
- [homeostasis-decay-formulas — L170](homeostasis-decay-formulas.md#L170) (line 170, col 3, score 1)
- [field-dynamics-math-blocks — L160](field-dynamics-math-blocks.md#L160) (line 160, col 1, score 1)
- [field-dynamics-math-blocks — L160](field-dynamics-math-blocks.md#L160) (line 160, col 3, score 1)
- [field-interaction-equations — L168](field-interaction-equations.md#L168) (line 168, col 1, score 1)
- [field-interaction-equations — L168](field-interaction-equations.md#L168) (line 168, col 3, score 1)
- [homeostasis-decay-formulas — L171](homeostasis-decay-formulas.md#L171) (line 171, col 1, score 1)
- [homeostasis-decay-formulas — L171](homeostasis-decay-formulas.md#L171) (line 171, col 3, score 1)
- [field-interaction-equations — L169](field-interaction-equations.md#L169) (line 169, col 1, score 1)
- [field-interaction-equations — L169](field-interaction-equations.md#L169) (line 169, col 3, score 1)
- [homeostasis-decay-formulas — L172](homeostasis-decay-formulas.md#L172) (line 172, col 1, score 1)
- [homeostasis-decay-formulas — L172](homeostasis-decay-formulas.md#L172) (line 172, col 3, score 1)
- [field-dynamics-math-blocks — L162](field-dynamics-math-blocks.md#L162) (line 162, col 1, score 0.98)
- [field-dynamics-math-blocks — L162](field-dynamics-math-blocks.md#L162) (line 162, col 3, score 0.98)
- [field-interaction-equations — L170](field-interaction-equations.md#L170) (line 170, col 1, score 1)
- [field-interaction-equations — L170](field-interaction-equations.md#L170) (line 170, col 3, score 1)
- [homeostasis-decay-formulas — L173](homeostasis-decay-formulas.md#L173) (line 173, col 1, score 1)
- [homeostasis-decay-formulas — L173](homeostasis-decay-formulas.md#L173) (line 173, col 3, score 1)
- [aionian-circuit-math — L167](aionian-circuit-math.md#L167) (line 167, col 1, score 1)
- [aionian-circuit-math — L167](aionian-circuit-math.md#L167) (line 167, col 3, score 1)
- [aionian-circuit-math — L183](aionian-circuit-math.md#L183) (line 183, col 1, score 0.97)
- [aionian-circuit-math — L183](aionian-circuit-math.md#L183) (line 183, col 3, score 0.97)
- [field-interaction-equations — L184](field-interaction-equations.md#L184) (line 184, col 1, score 0.97)
- [field-interaction-equations — L184](field-interaction-equations.md#L184) (line 184, col 3, score 0.97)
- [homeostasis-decay-formulas — L188](homeostasis-decay-formulas.md#L188) (line 188, col 1, score 0.97)
- [homeostasis-decay-formulas — L188](homeostasis-decay-formulas.md#L188) (line 188, col 3, score 0.97)
- [aionian-circuit-math — L168](aionian-circuit-math.md#L168) (line 168, col 1, score 1)
- [aionian-circuit-math — L168](aionian-circuit-math.md#L168) (line 168, col 3, score 1)
- [aionian-circuit-math — L169](aionian-circuit-math.md#L169) (line 169, col 1, score 0.97)
- [aionian-circuit-math — L169](aionian-circuit-math.md#L169) (line 169, col 3, score 0.97)
- [homeostasis-decay-formulas — L181](homeostasis-decay-formulas.md#L181) (line 181, col 1, score 0.97)
- [homeostasis-decay-formulas — L181](homeostasis-decay-formulas.md#L181) (line 181, col 3, score 0.97)
- [Math Fundamentals — L21](chunks/math-fundamentals.md#L21) (line 21, col 1, score 0.99)
- [Math Fundamentals — L21](chunks/math-fundamentals.md#L21) (line 21, col 3, score 0.99)
- [Unique Info Dump Index — L124](unique-info-dump-index.md#L124) (line 124, col 1, score 0.99)
- [Unique Info Dump Index — L124](unique-info-dump-index.md#L124) (line 124, col 3, score 0.99)
- [aionian-circuit-math — L176](aionian-circuit-math.md#L176) (line 176, col 1, score 0.99)
- [aionian-circuit-math — L176](aionian-circuit-math.md#L176) (line 176, col 3, score 0.99)
- [aionian-circuit-math — L162](aionian-circuit-math.md#L162) (line 162, col 1, score 0.98)
- [aionian-circuit-math — L162](aionian-circuit-math.md#L162) (line 162, col 3, score 0.98)
- [RAG UI Panel with Qdrant and PostgREST — L369](rag-ui-panel-with-qdrant-and-postgrest.md#L369) (line 369, col 1, score 1)
- [RAG UI Panel with Qdrant and PostgREST — L369](rag-ui-panel-with-qdrant-and-postgrest.md#L369) (line 369, col 3, score 1)
- [Local-Only-LLM-Workflow — L189](local-only-llm-workflow.md#L189) (line 189, col 1, score 0.99)
- [Local-Only-LLM-Workflow — L189](local-only-llm-workflow.md#L189) (line 189, col 3, score 0.99)
- [ecs-offload-workers — L476](ecs-offload-workers.md#L476) (line 476, col 1, score 0.99)
- [ecs-offload-workers — L476](ecs-offload-workers.md#L476) (line 476, col 3, score 0.99)
- [ecs-scheduler-and-prefabs — L426](ecs-scheduler-and-prefabs.md#L426) (line 426, col 1, score 0.99)
- [ecs-scheduler-and-prefabs — L426](ecs-scheduler-and-prefabs.md#L426) (line 426, col 3, score 0.99)
- [Local-Only-LLM-Workflow — L190](local-only-llm-workflow.md#L190) (line 190, col 1, score 1)
- [Local-Only-LLM-Workflow — L190](local-only-llm-workflow.md#L190) (line 190, col 3, score 1)
- [Performance-Optimized-Polyglot-Bridge — L454](performance-optimized-polyglot-bridge.md#L454) (line 454, col 1, score 1)
- [Performance-Optimized-Polyglot-Bridge — L454](performance-optimized-polyglot-bridge.md#L454) (line 454, col 3, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L527](polyglot-s-expr-bridge-python-js-lisp-interop.md#L527) (line 527, col 1, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L527](polyglot-s-expr-bridge-python-js-lisp-interop.md#L527) (line 527, col 3, score 1)
- [Promethean Infrastructure Setup — L609](promethean-infrastructure-setup.md#L609) (line 609, col 1, score 1)
- [Promethean Infrastructure Setup — L609](promethean-infrastructure-setup.md#L609) (line 609, col 3, score 1)
- [Local-Only-LLM-Workflow — L191](local-only-llm-workflow.md#L191) (line 191, col 1, score 1)
- [Local-Only-LLM-Workflow — L191](local-only-llm-workflow.md#L191) (line 191, col 3, score 1)
- [Performance-Optimized-Polyglot-Bridge — L455](performance-optimized-polyglot-bridge.md#L455) (line 455, col 1, score 1)
- [Performance-Optimized-Polyglot-Bridge — L455](performance-optimized-polyglot-bridge.md#L455) (line 455, col 3, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L528](polyglot-s-expr-bridge-python-js-lisp-interop.md#L528) (line 528, col 1, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L528](polyglot-s-expr-bridge-python-js-lisp-interop.md#L528) (line 528, col 3, score 1)
- [Promethean Infrastructure Setup — L610](promethean-infrastructure-setup.md#L610) (line 610, col 1, score 1)
- [Promethean Infrastructure Setup — L610](promethean-infrastructure-setup.md#L610) (line 610, col 3, score 1)
- [Local-Only-LLM-Workflow — L192](local-only-llm-workflow.md#L192) (line 192, col 1, score 1)
- [Local-Only-LLM-Workflow — L192](local-only-llm-workflow.md#L192) (line 192, col 3, score 1)
- [Performance-Optimized-Polyglot-Bridge — L456](performance-optimized-polyglot-bridge.md#L456) (line 456, col 1, score 1)
- [Performance-Optimized-Polyglot-Bridge — L456](performance-optimized-polyglot-bridge.md#L456) (line 456, col 3, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L529](polyglot-s-expr-bridge-python-js-lisp-interop.md#L529) (line 529, col 1, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L529](polyglot-s-expr-bridge-python-js-lisp-interop.md#L529) (line 529, col 3, score 1)
- [Promethean Infrastructure Setup — L611](promethean-infrastructure-setup.md#L611) (line 611, col 1, score 1)
- [Promethean Infrastructure Setup — L611](promethean-infrastructure-setup.md#L611) (line 611, col 3, score 1)
- [Local-Only-LLM-Workflow — L193](local-only-llm-workflow.md#L193) (line 193, col 1, score 1)
- [Local-Only-LLM-Workflow — L193](local-only-llm-workflow.md#L193) (line 193, col 3, score 1)
- [Performance-Optimized-Polyglot-Bridge — L457](performance-optimized-polyglot-bridge.md#L457) (line 457, col 1, score 1)
- [Performance-Optimized-Polyglot-Bridge — L457](performance-optimized-polyglot-bridge.md#L457) (line 457, col 3, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L530](polyglot-s-expr-bridge-python-js-lisp-interop.md#L530) (line 530, col 1, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L530](polyglot-s-expr-bridge-python-js-lisp-interop.md#L530) (line 530, col 3, score 1)
- [Promethean Infrastructure Setup — L612](promethean-infrastructure-setup.md#L612) (line 612, col 1, score 1)
- [Promethean Infrastructure Setup — L612](promethean-infrastructure-setup.md#L612) (line 612, col 3, score 1)
- [Local-Only-LLM-Workflow — L194](local-only-llm-workflow.md#L194) (line 194, col 1, score 1)
- [Local-Only-LLM-Workflow — L194](local-only-llm-workflow.md#L194) (line 194, col 3, score 1)
- [Performance-Optimized-Polyglot-Bridge — L458](performance-optimized-polyglot-bridge.md#L458) (line 458, col 1, score 1)
- [Performance-Optimized-Polyglot-Bridge — L458](performance-optimized-polyglot-bridge.md#L458) (line 458, col 3, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L531](polyglot-s-expr-bridge-python-js-lisp-interop.md#L531) (line 531, col 1, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L531](polyglot-s-expr-bridge-python-js-lisp-interop.md#L531) (line 531, col 3, score 1)
- [Promethean Infrastructure Setup — L613](promethean-infrastructure-setup.md#L613) (line 613, col 1, score 1)
- [Promethean Infrastructure Setup — L613](promethean-infrastructure-setup.md#L613) (line 613, col 3, score 1)
- [Per-Domain Policy System for JS Crawler — L478](per-domain-policy-system-for-js-crawler.md#L478) (line 478, col 1, score 1)
- [Per-Domain Policy System for JS Crawler — L478](per-domain-policy-system-for-js-crawler.md#L478) (line 478, col 3, score 1)
- [Migrate to Provider-Tenant Architecture — L288](migrate-to-provider-tenant-architecture.md#L288) (line 288, col 1, score 1)
- [Migrate to Provider-Tenant Architecture — L288](migrate-to-provider-tenant-architecture.md#L288) (line 288, col 3, score 1)
- [Migrate to Provider-Tenant Architecture — L307](migrate-to-provider-tenant-architecture.md#L307) (line 307, col 1, score 1)
- [Migrate to Provider-Tenant Architecture — L307](migrate-to-provider-tenant-architecture.md#L307) (line 307, col 3, score 1)
- [Migrate to Provider-Tenant Architecture — L293](migrate-to-provider-tenant-architecture.md#L293) (line 293, col 1, score 1)
- [Migrate to Provider-Tenant Architecture — L293](migrate-to-provider-tenant-architecture.md#L293) (line 293, col 3, score 1)
- [field-dynamics-math-blocks — L175](field-dynamics-math-blocks.md#L175) (line 175, col 1, score 1)
- [field-dynamics-math-blocks — L175](field-dynamics-math-blocks.md#L175) (line 175, col 3, score 1)
- [field-interaction-equations — L178](field-interaction-equations.md#L178) (line 178, col 1, score 1)
- [field-interaction-equations — L178](field-interaction-equations.md#L178) (line 178, col 3, score 1)
- [homeostasis-decay-formulas — L182](homeostasis-decay-formulas.md#L182) (line 182, col 1, score 1)
- [homeostasis-decay-formulas — L182](homeostasis-decay-formulas.md#L182) (line 182, col 3, score 1)
- [field-dynamics-math-blocks — L179](field-dynamics-math-blocks.md#L179) (line 179, col 1, score 0.98)
- [field-dynamics-math-blocks — L179](field-dynamics-math-blocks.md#L179) (line 179, col 3, score 0.98)
- [aionian-circuit-math — L179](aionian-circuit-math.md#L179) (line 179, col 1, score 1)
- [aionian-circuit-math — L179](aionian-circuit-math.md#L179) (line 179, col 3, score 1)
- [field-interaction-equations — L180](field-interaction-equations.md#L180) (line 180, col 1, score 1)
- [field-interaction-equations — L180](field-interaction-equations.md#L180) (line 180, col 3, score 1)
- [homeostasis-decay-formulas — L184](homeostasis-decay-formulas.md#L184) (line 184, col 1, score 1)
- [homeostasis-decay-formulas — L184](homeostasis-decay-formulas.md#L184) (line 184, col 3, score 1)
- [aionian-circuit-math — L180](aionian-circuit-math.md#L180) (line 180, col 1, score 1)
- [aionian-circuit-math — L180](aionian-circuit-math.md#L180) (line 180, col 3, score 1)
- [field-dynamics-math-blocks — L177](field-dynamics-math-blocks.md#L177) (line 177, col 1, score 1)
- [field-dynamics-math-blocks — L177](field-dynamics-math-blocks.md#L177) (line 177, col 3, score 1)
- [homeostasis-decay-formulas — L185](homeostasis-decay-formulas.md#L185) (line 185, col 1, score 1)
- [homeostasis-decay-formulas — L185](homeostasis-decay-formulas.md#L185) (line 185, col 3, score 1)
- [aionian-circuit-math — L184](aionian-circuit-math.md#L184) (line 184, col 1, score 0.99)
- [aionian-circuit-math — L184](aionian-circuit-math.md#L184) (line 184, col 3, score 0.99)
- [aionian-circuit-math — L181](aionian-circuit-math.md#L181) (line 181, col 1, score 1)
- [aionian-circuit-math — L181](aionian-circuit-math.md#L181) (line 181, col 3, score 1)
- [field-dynamics-math-blocks — L178](field-dynamics-math-blocks.md#L178) (line 178, col 1, score 1)
- [field-dynamics-math-blocks — L178](field-dynamics-math-blocks.md#L178) (line 178, col 3, score 1)
- [field-interaction-equations — L181](field-interaction-equations.md#L181) (line 181, col 1, score 1)
- [field-interaction-equations — L181](field-interaction-equations.md#L181) (line 181, col 3, score 1)
- [aionian-circuit-math — L185](aionian-circuit-math.md#L185) (line 185, col 1, score 0.99)
- [aionian-circuit-math — L185](aionian-circuit-math.md#L185) (line 185, col 3, score 0.99)
- [field-interaction-equations — L182](field-interaction-equations.md#L182) (line 182, col 1, score 1)
- [field-interaction-equations — L182](field-interaction-equations.md#L182) (line 182, col 3, score 1)
- [homeostasis-decay-formulas — L186](homeostasis-decay-formulas.md#L186) (line 186, col 1, score 1)
- [homeostasis-decay-formulas — L186](homeostasis-decay-formulas.md#L186) (line 186, col 3, score 1)
- [field-dynamics-math-blocks — L181](field-dynamics-math-blocks.md#L181) (line 181, col 1, score 1)
- [field-dynamics-math-blocks — L181](field-dynamics-math-blocks.md#L181) (line 181, col 3, score 1)
- [homeostasis-decay-formulas — L189](homeostasis-decay-formulas.md#L189) (line 189, col 1, score 1)
- [homeostasis-decay-formulas — L189](homeostasis-decay-formulas.md#L189) (line 189, col 3, score 1)
- [field-dynamics-math-blocks — L182](field-dynamics-math-blocks.md#L182) (line 182, col 1, score 1)
- [field-dynamics-math-blocks — L182](field-dynamics-math-blocks.md#L182) (line 182, col 3, score 1)
- [field-interaction-equations — L185](field-interaction-equations.md#L185) (line 185, col 1, score 1)
- [field-interaction-equations — L185](field-interaction-equations.md#L185) (line 185, col 3, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
