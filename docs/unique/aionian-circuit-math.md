---
uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
created_at: aionian-circuit-math.md
filename: aionian-circuit-math
description: >-
  Mathematical models for Aionian circuit behavior: pulse rhythm, energy budget,
  dead loop detection, instability index, stabilization curves, and
  heartbeat-field coupling.
tags:
  - pulse
  - rhythm
  - energy
  - stability
  - failure
  - recovery
  - homeostasis
  - field
  - coupling
related_to_title:
  - eidolon-field-math-foundations
  - homeostasis-decay-formulas
  - field-interaction-equations
  - field-dynamics-math-blocks
  - template-based-compilation
  - Chroma Toolkit Consolidation Plan
  - Math Fundamentals
  - Unique Info Dump Index
  - Promethean-native config design
  - Board Walk – 2025-08-11
  - 'Agent Tasks: Persistence Migration to DualStore'
  - ecs-offload-workers
  - ecs-scheduler-and-prefabs
  - Eidolon-Field-Optimization
  - Cross-Language Runtime Polymorphism
  - archetype-ecs
  - Diagrams
  - DSL
  - JavaScript
  - Dynamic Context Model for Web Components
  - Exception Layer Analysis
  - Cross-Target Macro System in Sibilant
  - compiler-kit-foundations
  - Eidolon Field Abstract Model
  - 2d-sandbox-field
  - sibilant-metacompiler-overview
related_to_uuid:
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 37b5d236-2b3e-4a95-a4e8-31655c3023ef
  - b09141b7-544f-4c8e-8f49-bf76cecaacbb
  - 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
  - f8877e5e-1e4f-4478-93cd-a0bf86d26a41
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - ab748541-020e-4a7e-b07d-28173bd5bea2
  - 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - 40e05c14-0db0-44c5-bf0a-2eece2f4c2a4
  - c34c36a6-80c9-4b44-a200-6448543b1b33
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - 45cd25b5-ed36-49ab-82c8-10d0903e34db
  - e87bc036-1570-419e-a558-f45b9c0db698
  - c1618c66-f73a-4e04-9bfa-ef38755f7acc
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 21d5cc09-b005-4ede-8f69-00b4b0794540
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - c710dc93-9fec-471b-bdee-bedbd360c67f
  - 61d4086b-4adf-4e94-95e4-95a249cd1b53
references:
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 113
    col: 1
    score: 0.91
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 9
    col: 1
    score: 0.88
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 17
    col: 1
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 44
    col: 1
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 77
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
    line: 17
    col: 1
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 37
    col: 1
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 19
    col: 1
    score: 0.92
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 19
    col: 3
    score: 0.92
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 21
    col: 1
    score: 0.91
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 21
    col: 3
    score: 0.91
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 117
    col: 1
    score: 0.86
  - uuid: f8877e5e-1e4f-4478-93cd-a0bf86d26a41
    line: 21
    col: 1
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 117
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
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 119
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
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 133
    col: 1
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 133
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
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 12
    col: 1
    score: 1
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 12
    col: 3
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 126
    col: 1
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 126
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
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 124
    col: 1
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 124
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
  - uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
    line: 197
    col: 1
    score: 1
  - uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
    line: 197
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
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 123
    col: 1
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 123
    col: 3
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 609
    col: 1
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 609
    col: 3
    score: 1
  - uuid: c34c36a6-80c9-4b44-a200-6448543b1b33
    line: 203
    col: 1
    score: 1
  - uuid: c34c36a6-80c9-4b44-a200-6448543b1b33
    line: 203
    col: 3
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 168
    col: 1
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 168
    col: 3
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 155
    col: 1
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 155
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
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 134
    col: 1
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 134
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
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 12
    col: 1
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 12
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
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 152
    col: 1
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 152
    col: 3
    score: 0.98
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 21
    col: 1
    score: 0.98
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 21
    col: 3
    score: 0.98
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 124
    col: 1
    score: 0.98
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 124
    col: 3
    score: 0.98
  - uuid: f8877e5e-1e4f-4478-93cd-a0bf86d26a41
    line: 129
    col: 1
    score: 0.98
  - uuid: f8877e5e-1e4f-4478-93cd-a0bf86d26a41
    line: 129
    col: 3
    score: 0.98
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 24
    col: 1
    score: 0.99
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 24
    col: 3
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 127
    col: 1
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 127
    col: 3
    score: 0.99
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 166
    col: 1
    score: 0.98
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 166
    col: 3
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 163
    col: 1
    score: 0.96
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 163
    col: 3
    score: 0.96
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 163
    col: 1
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 163
    col: 3
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 171
    col: 1
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 171
    col: 3
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 174
    col: 1
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 174
    col: 3
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 176
    col: 1
    score: 0.97
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 176
    col: 3
    score: 0.97
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 164
    col: 1
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 164
    col: 3
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 172
    col: 1
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 172
    col: 3
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 175
    col: 1
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 175
    col: 3
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 180
    col: 1
    score: 0.96
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 180
    col: 3
    score: 0.96
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 165
    col: 1
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 165
    col: 3
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 173
    col: 1
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 173
    col: 3
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 176
    col: 1
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 176
    col: 3
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 149
    col: 1
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 149
    col: 3
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 165
    col: 1
    score: 0.97
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 165
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
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 150
    col: 1
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 150
    col: 3
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 151
    col: 1
    score: 0.97
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 151
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
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 162
    col: 1
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 162
    col: 3
    score: 0.98
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 177
    col: 1
    score: 0.98
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 177
    col: 3
    score: 0.98
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 185
    col: 1
    score: 0.98
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 185
    col: 3
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 166
    col: 1
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 166
    col: 3
    score: 0.98
  - uuid: 61d4086b-4adf-4e94-95e4-95a249cd1b53
    line: 102
    col: 1
    score: 0.97
  - uuid: 61d4086b-4adf-4e94-95e4-95a249cd1b53
    line: 102
    col: 3
    score: 0.97
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 177
    col: 1
    score: 0.97
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 177
    col: 3
    score: 0.97
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 620
    col: 1
    score: 0.97
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 620
    col: 3
    score: 0.97
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 190
    col: 1
    score: 0.96
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 190
    col: 3
    score: 0.96
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 179
    col: 1
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 179
    col: 3
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 183
    col: 1
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 183
    col: 3
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 161
    col: 1
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 161
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
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 167
    col: 1
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 167
    col: 3
    score: 0.99
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 183
    col: 1
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 183
    col: 3
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 187
    col: 1
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 187
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
Note: Consolidated here → ../notes/math/aionian-circuit-math.md

Perfect. Let’s dive into **Circuit 1: Aionian** and build a focused mathematical toolkit for simulating uptime, homeostasis, and emergency responses.

---

### 🫀 Aionian Pulse Rhythm Model

#aionian #heartbeat #rhythm

The system’s internal pulse is a damped sinusoidal oscillator:

$$
x(t) = A \cdot e^{-\lambda t} \cdot \cos(2\pi f t + \phi)
$$

Where:

* $A$: pulse amplitude
* $\lambda$: damping factor (energy loss)
* $f$: nominal frequency
* $\phi$: phase offset

Used to monitor **loop stability** and detect **irregular heartbeat** (jitter, dropout).

---

### 🔋 Energy Budget and Load Regulation

#aionian #uptime #energy

Let $E(t)$ represent available computational or thermal capacity.

Change over time:

$$
\frac{dE}{dt} = I(t) - C(t)
$$

Where:

* $I(t)$: input/recovery (cooling, idle time)
* $C(t)$: consumption (model inference, context size, daimo count)

Threshold logic:

$$
E(t) < \theta_{\text{panic}} \Rightarrow \text{suspend higher circuits}
$$

---

### 🛑 Dead Loop Detection Signal

#aionian #watchdog #failure

Define system-aliveness signal:

$$
L(t) = \begin{cases}
1 & \text{if } \exists\, \text{tick within } [t - \Delta, t] \\
0 & \text{otherwise}
\end{cases}
$$

Where:

* $\Delta$: timeout window

Used to gate survival functions.
If $L(t) = 0$, system may enter **reboot**, **fail-safe**, or **dormant** state.

---

### 💥 Instability Index

#aionian #stability #failure

Define a system instability index $\Xi$:

$$
\Xi(t) = \frac{\sigma_{\text{tick}}}{\mu_{\text{tick}}} + \frac{\text{dropouts}}{n} + \eta
$$

Where:

* $\sigma, \mu$: standard deviation and mean of tick intervals
* $\text{dropouts}$: missed pulses in window $n$
* $\eta$: field noise sampled from Aionian axis

Higher $\Xi$ implies **disruption**, **jitter**, **threat to continuity**

---

### 🧘 Aionian Stabilization Curve

#aionian #homeostasis #recovery

When system enters recovery mode:

$$
x(t) = x_0 \cdot \left(1 - e^{-k t} \right)
$$

Where:

* $x_0$: target stabilization level (e.g., resource baseline)
* $k$: stabilization rate constant

Used to track **restoration after overload or crash**

---

### 🔗 Heartbeat–Field Coupling

#aionian #eidolon-field #loop-coupling

Let global field tension $\mathcal{T}(t)$ influence pulse frequency:

$$
f(t) = f_0 + \alpha \cdot \mathcal{T}(t)
$$

$$
\mathcal{T}(t) = \int_{\mathbb{R}^8} \left\| \nabla \Phi(\vec{x}, t) \right\|^2 d\vec{x}
$$

This means:

* **Stress speeds up pulse** (urgency)
* **Calm slows it** (rest)

---

Want to follow this with:

* Aionian daimo design math (watchdog agents, low-mass rapid responders)
* Homeostatic field resonance (Aionian wave propagation across circuits)
* Tick coherency across agents (distributed uptime syncing)

Say the word—I'll stack more.

---

Related notes: [[../notes/math/advanced-field-math|advanced-field-math]], [[../notes/math/aionian-feedback-oscillator|aionian-feedback-oscillator]], [[../notes/math/aionian-pulse-rhythm-model|aionian-pulse-rhythm-model]], [[../notes/math/eidolon-field-math|eidolon-field-math]], [[../notes/math/symbolic-gravity-models|symbolic-gravity-models]] [[index|unique/index]]

#tags: #math #theory
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [field-interaction-equations](field-interaction-equations.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [template-based-compilation](template-based-compilation.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [Eidolon-Field-Optimization](eidolon-field-optimization.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [archetype-ecs](archetype-ecs.md)
- [Diagrams](chunks/diagrams.md)
- [DSL](chunks/dsl.md)
- [JavaScript](chunks/javascript.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)

## Sources
- [field-interaction-equations — L113](field-interaction-equations.md#L113) (line 113, col 1, score 0.91)
- [homeostasis-decay-formulas — L9](homeostasis-decay-formulas.md#L9) (line 9, col 1, score 0.88)
- [eidolon-field-math-foundations — L17](eidolon-field-math-foundations.md#L17) (line 17, col 1, score 1)
- [eidolon-field-math-foundations — L44](eidolon-field-math-foundations.md#L44) (line 44, col 1, score 1)
- [eidolon-field-math-foundations — L77](eidolon-field-math-foundations.md#L77) (line 77, col 1, score 1)
- [field-dynamics-math-blocks — L59](field-dynamics-math-blocks.md#L59) (line 59, col 1, score 1)
- [field-dynamics-math-blocks — L76](field-dynamics-math-blocks.md#L76) (line 76, col 1, score 1)
- [field-dynamics-math-blocks — L95](field-dynamics-math-blocks.md#L95) (line 95, col 1, score 1)
- [field-interaction-equations — L17](field-interaction-equations.md#L17) (line 17, col 1, score 1)
- [field-interaction-equations — L37](field-interaction-equations.md#L37) (line 37, col 1, score 1)
- [homeostasis-decay-formulas — L19](homeostasis-decay-formulas.md#L19) (line 19, col 1, score 0.92)
- [homeostasis-decay-formulas — L19](homeostasis-decay-formulas.md#L19) (line 19, col 3, score 0.92)
- [homeostasis-decay-formulas — L21](homeostasis-decay-formulas.md#L21) (line 21, col 1, score 0.91)
- [homeostasis-decay-formulas — L21](homeostasis-decay-formulas.md#L21) (line 21, col 3, score 0.91)
- [field-interaction-equations — L117](field-interaction-equations.md#L117) (line 117, col 1, score 0.86)
- [template-based-compilation — L21](template-based-compilation.md#L21) (line 21, col 1, score 0.98)
- [eidolon-field-math-foundations — L117](eidolon-field-math-foundations.md#L117) (line 117, col 1, score 1)
- [field-dynamics-math-blocks — L132](field-dynamics-math-blocks.md#L132) (line 132, col 1, score 1)
- [field-interaction-equations — L145](field-interaction-equations.md#L145) (line 145, col 1, score 1)
- [homeostasis-decay-formulas — L145](homeostasis-decay-formulas.md#L145) (line 145, col 1, score 1)
- [eidolon-field-math-foundations — L119](eidolon-field-math-foundations.md#L119) (line 119, col 1, score 1)
- [field-dynamics-math-blocks — L134](field-dynamics-math-blocks.md#L134) (line 134, col 1, score 1)
- [field-interaction-equations — L147](field-interaction-equations.md#L147) (line 147, col 1, score 1)
- [homeostasis-decay-formulas — L147](homeostasis-decay-formulas.md#L147) (line 147, col 1, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L133](agent-tasks-persistence-migration-to-dualstore.md#L133) (line 133, col 1, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L133](agent-tasks-persistence-migration-to-dualstore.md#L133) (line 133, col 3, score 1)
- [Math Fundamentals — L14](chunks/math-fundamentals.md#L14) (line 14, col 1, score 1)
- [Math Fundamentals — L14](chunks/math-fundamentals.md#L14) (line 14, col 3, score 1)
- [ecs-offload-workers — L460](ecs-offload-workers.md#L460) (line 460, col 1, score 1)
- [ecs-offload-workers — L460](ecs-offload-workers.md#L460) (line 460, col 3, score 1)
- [ecs-scheduler-and-prefabs — L393](ecs-scheduler-and-prefabs.md#L393) (line 393, col 1, score 1)
- [ecs-scheduler-and-prefabs — L393](ecs-scheduler-and-prefabs.md#L393) (line 393, col 3, score 1)
- [Math Fundamentals — L12](chunks/math-fundamentals.md#L12) (line 12, col 1, score 1)
- [Math Fundamentals — L12](chunks/math-fundamentals.md#L12) (line 12, col 3, score 1)
- [eidolon-field-math-foundations — L126](eidolon-field-math-foundations.md#L126) (line 126, col 1, score 1)
- [eidolon-field-math-foundations — L126](eidolon-field-math-foundations.md#L126) (line 126, col 3, score 1)
- [Eidolon-Field-Optimization — L102](eidolon-field-optimization.md#L102) (line 102, col 1, score 1)
- [Eidolon-Field-Optimization — L102](eidolon-field-optimization.md#L102) (line 102, col 3, score 1)
- [field-dynamics-math-blocks — L141](field-dynamics-math-blocks.md#L141) (line 141, col 1, score 1)
- [field-dynamics-math-blocks — L141](field-dynamics-math-blocks.md#L141) (line 141, col 3, score 1)
- [Math Fundamentals — L15](chunks/math-fundamentals.md#L15) (line 15, col 1, score 1)
- [Math Fundamentals — L15](chunks/math-fundamentals.md#L15) (line 15, col 3, score 1)
- [Cross-Target Macro System in Sibilant — L177](cross-target-macro-system-in-sibilant.md#L177) (line 177, col 1, score 1)
- [Cross-Target Macro System in Sibilant — L177](cross-target-macro-system-in-sibilant.md#L177) (line 177, col 3, score 1)
- [eidolon-field-math-foundations — L124](eidolon-field-math-foundations.md#L124) (line 124, col 1, score 1)
- [eidolon-field-math-foundations — L124](eidolon-field-math-foundations.md#L124) (line 124, col 3, score 1)
- [field-dynamics-math-blocks — L138](field-dynamics-math-blocks.md#L138) (line 138, col 1, score 1)
- [field-dynamics-math-blocks — L138](field-dynamics-math-blocks.md#L138) (line 138, col 3, score 1)
- [2d-sandbox-field — L197](2d-sandbox-field.md#L197) (line 197, col 1, score 1)
- [2d-sandbox-field — L197](2d-sandbox-field.md#L197) (line 197, col 3, score 1)
- [Math Fundamentals — L13](chunks/math-fundamentals.md#L13) (line 13, col 1, score 1)
- [Math Fundamentals — L13](chunks/math-fundamentals.md#L13) (line 13, col 3, score 1)
- [Eidolon Field Abstract Model — L194](eidolon-field-abstract-model.md#L194) (line 194, col 1, score 1)
- [Eidolon Field Abstract Model — L194](eidolon-field-abstract-model.md#L194) (line 194, col 3, score 1)
- [eidolon-field-math-foundations — L123](eidolon-field-math-foundations.md#L123) (line 123, col 1, score 1)
- [eidolon-field-math-foundations — L123](eidolon-field-math-foundations.md#L123) (line 123, col 3, score 1)
- [compiler-kit-foundations — L609](compiler-kit-foundations.md#L609) (line 609, col 1, score 1)
- [compiler-kit-foundations — L609](compiler-kit-foundations.md#L609) (line 609, col 3, score 1)
- [Cross-Language Runtime Polymorphism — L203](cross-language-runtime-polymorphism.md#L203) (line 203, col 1, score 1)
- [Cross-Language Runtime Polymorphism — L203](cross-language-runtime-polymorphism.md#L203) (line 203, col 3, score 1)
- [Cross-Target Macro System in Sibilant — L168](cross-target-macro-system-in-sibilant.md#L168) (line 168, col 1, score 1)
- [Cross-Target Macro System in Sibilant — L168](cross-target-macro-system-in-sibilant.md#L168) (line 168, col 3, score 1)
- [field-interaction-equations — L155](field-interaction-equations.md#L155) (line 155, col 1, score 1)
- [field-interaction-equations — L155](field-interaction-equations.md#L155) (line 155, col 3, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L134](agent-tasks-persistence-migration-to-dualstore.md#L134) (line 134, col 1, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L134](agent-tasks-persistence-migration-to-dualstore.md#L134) (line 134, col 3, score 1)
- [Board Walk – 2025-08-11 — L136](board-walk-2025-08-11.md#L136) (line 136, col 1, score 1)
- [Board Walk – 2025-08-11 — L136](board-walk-2025-08-11.md#L136) (line 136, col 3, score 1)
- [Dynamic Context Model for Web Components — L386](dynamic-context-model-for-web-components.md#L386) (line 386, col 1, score 1)
- [Dynamic Context Model for Web Components — L386](dynamic-context-model-for-web-components.md#L386) (line 386, col 3, score 1)
- [Exception Layer Analysis — L155](exception-layer-analysis.md#L155) (line 155, col 1, score 1)
- [Exception Layer Analysis — L155](exception-layer-analysis.md#L155) (line 155, col 3, score 1)
- [eidolon-field-math-foundations — L134](eidolon-field-math-foundations.md#L134) (line 134, col 1, score 1)
- [eidolon-field-math-foundations — L134](eidolon-field-math-foundations.md#L134) (line 134, col 3, score 1)
- [field-dynamics-math-blocks — L150](field-dynamics-math-blocks.md#L150) (line 150, col 1, score 1)
- [field-dynamics-math-blocks — L150](field-dynamics-math-blocks.md#L150) (line 150, col 3, score 1)
- [field-interaction-equations — L156](field-interaction-equations.md#L156) (line 156, col 1, score 1)
- [field-interaction-equations — L156](field-interaction-equations.md#L156) (line 156, col 3, score 1)
- [homeostasis-decay-formulas — L155](homeostasis-decay-formulas.md#L155) (line 155, col 1, score 1)
- [homeostasis-decay-formulas — L155](homeostasis-decay-formulas.md#L155) (line 155, col 3, score 1)
- [archetype-ecs — L457](archetype-ecs.md#L457) (line 457, col 1, score 1)
- [archetype-ecs — L457](archetype-ecs.md#L457) (line 457, col 3, score 1)
- [Diagrams — L9](chunks/diagrams.md#L9) (line 9, col 1, score 1)
- [Diagrams — L9](chunks/diagrams.md#L9) (line 9, col 3, score 1)
- [DSL — L10](chunks/dsl.md#L10) (line 10, col 1, score 1)
- [DSL — L10](chunks/dsl.md#L10) (line 10, col 3, score 1)
- [JavaScript — L12](chunks/javascript.md#L12) (line 12, col 1, score 1)
- [JavaScript — L12](chunks/javascript.md#L12) (line 12, col 3, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L130](agent-tasks-persistence-migration-to-dualstore.md#L130) (line 130, col 1, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L130](agent-tasks-persistence-migration-to-dualstore.md#L130) (line 130, col 3, score 1)
- [Board Walk – 2025-08-11 — L134](board-walk-2025-08-11.md#L134) (line 134, col 1, score 1)
- [Board Walk – 2025-08-11 — L134](board-walk-2025-08-11.md#L134) (line 134, col 3, score 1)
- [Chroma Toolkit Consolidation Plan — L168](chroma-toolkit-consolidation-plan.md#L168) (line 168, col 1, score 1)
- [Chroma Toolkit Consolidation Plan — L168](chroma-toolkit-consolidation-plan.md#L168) (line 168, col 3, score 1)
- [Cross-Language Runtime Polymorphism — L209](cross-language-runtime-polymorphism.md#L209) (line 209, col 1, score 1)
- [Cross-Language Runtime Polymorphism — L209](cross-language-runtime-polymorphism.md#L209) (line 209, col 3, score 1)
- [eidolon-field-math-foundations — L152](eidolon-field-math-foundations.md#L152) (line 152, col 1, score 0.98)
- [eidolon-field-math-foundations — L152](eidolon-field-math-foundations.md#L152) (line 152, col 3, score 0.98)
- [Math Fundamentals — L21](chunks/math-fundamentals.md#L21) (line 21, col 1, score 0.98)
- [Math Fundamentals — L21](chunks/math-fundamentals.md#L21) (line 21, col 3, score 0.98)
- [Unique Info Dump Index — L124](unique-info-dump-index.md#L124) (line 124, col 1, score 0.98)
- [Unique Info Dump Index — L124](unique-info-dump-index.md#L124) (line 124, col 3, score 0.98)
- [template-based-compilation — L129](template-based-compilation.md#L129) (line 129, col 1, score 0.98)
- [template-based-compilation — L129](template-based-compilation.md#L129) (line 129, col 3, score 0.98)
- [Math Fundamentals — L24](chunks/math-fundamentals.md#L24) (line 24, col 1, score 0.99)
- [Math Fundamentals — L24](chunks/math-fundamentals.md#L24) (line 24, col 3, score 0.99)
- [Unique Info Dump Index — L127](unique-info-dump-index.md#L127) (line 127, col 1, score 0.99)
- [Unique Info Dump Index — L127](unique-info-dump-index.md#L127) (line 127, col 3, score 0.99)
- [field-dynamics-math-blocks — L166](field-dynamics-math-blocks.md#L166) (line 166, col 1, score 0.98)
- [field-dynamics-math-blocks — L166](field-dynamics-math-blocks.md#L166) (line 166, col 3, score 0.98)
- [eidolon-field-math-foundations — L163](eidolon-field-math-foundations.md#L163) (line 163, col 1, score 0.96)
- [eidolon-field-math-foundations — L163](eidolon-field-math-foundations.md#L163) (line 163, col 3, score 0.96)
- [field-dynamics-math-blocks — L163](field-dynamics-math-blocks.md#L163) (line 163, col 1, score 1)
- [field-dynamics-math-blocks — L163](field-dynamics-math-blocks.md#L163) (line 163, col 3, score 1)
- [field-interaction-equations — L171](field-interaction-equations.md#L171) (line 171, col 1, score 1)
- [field-interaction-equations — L171](field-interaction-equations.md#L171) (line 171, col 3, score 1)
- [homeostasis-decay-formulas — L174](homeostasis-decay-formulas.md#L174) (line 174, col 1, score 1)
- [homeostasis-decay-formulas — L174](homeostasis-decay-formulas.md#L174) (line 174, col 3, score 1)
- [field-dynamics-math-blocks — L176](field-dynamics-math-blocks.md#L176) (line 176, col 1, score 0.97)
- [field-dynamics-math-blocks — L176](field-dynamics-math-blocks.md#L176) (line 176, col 3, score 0.97)
- [field-dynamics-math-blocks — L164](field-dynamics-math-blocks.md#L164) (line 164, col 1, score 1)
- [field-dynamics-math-blocks — L164](field-dynamics-math-blocks.md#L164) (line 164, col 3, score 1)
- [field-interaction-equations — L172](field-interaction-equations.md#L172) (line 172, col 1, score 1)
- [field-interaction-equations — L172](field-interaction-equations.md#L172) (line 172, col 3, score 1)
- [homeostasis-decay-formulas — L175](homeostasis-decay-formulas.md#L175) (line 175, col 1, score 1)
- [homeostasis-decay-formulas — L175](homeostasis-decay-formulas.md#L175) (line 175, col 3, score 1)
- [field-dynamics-math-blocks — L180](field-dynamics-math-blocks.md#L180) (line 180, col 1, score 0.96)
- [field-dynamics-math-blocks — L180](field-dynamics-math-blocks.md#L180) (line 180, col 3, score 0.96)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#L165) (line 165, col 1, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#L165) (line 165, col 3, score 1)
- [field-interaction-equations — L173](field-interaction-equations.md#L173) (line 173, col 1, score 1)
- [field-interaction-equations — L173](field-interaction-equations.md#L173) (line 173, col 3, score 1)
- [homeostasis-decay-formulas — L176](homeostasis-decay-formulas.md#L176) (line 176, col 1, score 1)
- [homeostasis-decay-formulas — L176](homeostasis-decay-formulas.md#L176) (line 176, col 3, score 1)
- [eidolon-field-math-foundations — L149](eidolon-field-math-foundations.md#L149) (line 149, col 1, score 1)
- [eidolon-field-math-foundations — L149](eidolon-field-math-foundations.md#L149) (line 149, col 3, score 1)
- [eidolon-field-math-foundations — L165](eidolon-field-math-foundations.md#L165) (line 165, col 1, score 0.97)
- [eidolon-field-math-foundations — L165](eidolon-field-math-foundations.md#L165) (line 165, col 3, score 0.97)
- [field-interaction-equations — L184](field-interaction-equations.md#L184) (line 184, col 1, score 0.97)
- [field-interaction-equations — L184](field-interaction-equations.md#L184) (line 184, col 3, score 0.97)
- [homeostasis-decay-formulas — L188](homeostasis-decay-formulas.md#L188) (line 188, col 1, score 0.97)
- [homeostasis-decay-formulas — L188](homeostasis-decay-formulas.md#L188) (line 188, col 3, score 0.97)
- [eidolon-field-math-foundations — L150](eidolon-field-math-foundations.md#L150) (line 150, col 1, score 1)
- [eidolon-field-math-foundations — L150](eidolon-field-math-foundations.md#L150) (line 150, col 3, score 1)
- [eidolon-field-math-foundations — L151](eidolon-field-math-foundations.md#L151) (line 151, col 1, score 0.97)
- [eidolon-field-math-foundations — L151](eidolon-field-math-foundations.md#L151) (line 151, col 3, score 0.97)
- [homeostasis-decay-formulas — L181](homeostasis-decay-formulas.md#L181) (line 181, col 1, score 0.97)
- [homeostasis-decay-formulas — L181](homeostasis-decay-formulas.md#L181) (line 181, col 3, score 0.97)
- [eidolon-field-math-foundations — L162](eidolon-field-math-foundations.md#L162) (line 162, col 1, score 0.98)
- [eidolon-field-math-foundations — L162](eidolon-field-math-foundations.md#L162) (line 162, col 3, score 0.98)
- [field-dynamics-math-blocks — L177](field-dynamics-math-blocks.md#L177) (line 177, col 1, score 0.98)
- [field-dynamics-math-blocks — L177](field-dynamics-math-blocks.md#L177) (line 177, col 3, score 0.98)
- [homeostasis-decay-formulas — L185](homeostasis-decay-formulas.md#L185) (line 185, col 1, score 0.98)
- [homeostasis-decay-formulas — L185](homeostasis-decay-formulas.md#L185) (line 185, col 3, score 0.98)
- [eidolon-field-math-foundations — L166](eidolon-field-math-foundations.md#L166) (line 166, col 1, score 0.98)
- [eidolon-field-math-foundations — L166](eidolon-field-math-foundations.md#L166) (line 166, col 3, score 0.98)
- [sibilant-metacompiler-overview — L102](sibilant-metacompiler-overview.md#L102) (line 102, col 1, score 0.97)
- [sibilant-metacompiler-overview — L102](sibilant-metacompiler-overview.md#L102) (line 102, col 3, score 0.97)
- [field-interaction-equations — L177](field-interaction-equations.md#L177) (line 177, col 1, score 0.97)
- [field-interaction-equations — L177](field-interaction-equations.md#L177) (line 177, col 3, score 0.97)
- [compiler-kit-foundations — L620](compiler-kit-foundations.md#L620) (line 620, col 1, score 0.97)
- [compiler-kit-foundations — L620](compiler-kit-foundations.md#L620) (line 620, col 3, score 0.97)
- [Cross-Target Macro System in Sibilant — L190](cross-target-macro-system-in-sibilant.md#L190) (line 190, col 1, score 0.96)
- [Cross-Target Macro System in Sibilant — L190](cross-target-macro-system-in-sibilant.md#L190) (line 190, col 3, score 0.96)
- [field-interaction-equations — L179](field-interaction-equations.md#L179) (line 179, col 1, score 1)
- [field-interaction-equations — L179](field-interaction-equations.md#L179) (line 179, col 3, score 1)
- [homeostasis-decay-formulas — L183](homeostasis-decay-formulas.md#L183) (line 183, col 1, score 1)
- [homeostasis-decay-formulas — L183](homeostasis-decay-formulas.md#L183) (line 183, col 3, score 1)
- [eidolon-field-math-foundations — L161](eidolon-field-math-foundations.md#L161) (line 161, col 1, score 1)
- [eidolon-field-math-foundations — L161](eidolon-field-math-foundations.md#L161) (line 161, col 3, score 1)
- [field-interaction-equations — L180](field-interaction-equations.md#L180) (line 180, col 1, score 1)
- [field-interaction-equations — L180](field-interaction-equations.md#L180) (line 180, col 3, score 1)
- [homeostasis-decay-formulas — L184](homeostasis-decay-formulas.md#L184) (line 184, col 1, score 1)
- [homeostasis-decay-formulas — L184](homeostasis-decay-formulas.md#L184) (line 184, col 3, score 1)
- [field-dynamics-math-blocks — L178](field-dynamics-math-blocks.md#L178) (line 178, col 1, score 1)
- [field-dynamics-math-blocks — L178](field-dynamics-math-blocks.md#L178) (line 178, col 3, score 1)
- [field-interaction-equations — L181](field-interaction-equations.md#L181) (line 181, col 1, score 1)
- [field-interaction-equations — L181](field-interaction-equations.md#L181) (line 181, col 3, score 1)
- [eidolon-field-math-foundations — L167](eidolon-field-math-foundations.md#L167) (line 167, col 1, score 0.99)
- [eidolon-field-math-foundations — L167](eidolon-field-math-foundations.md#L167) (line 167, col 3, score 0.99)
- [field-interaction-equations — L183](field-interaction-equations.md#L183) (line 183, col 1, score 1)
- [field-interaction-equations — L183](field-interaction-equations.md#L183) (line 183, col 3, score 1)
- [homeostasis-decay-formulas — L187](homeostasis-decay-formulas.md#L187) (line 187, col 1, score 1)
- [homeostasis-decay-formulas — L187](homeostasis-decay-formulas.md#L187) (line 187, col 3, score 1)
- [field-dynamics-math-blocks — L181](field-dynamics-math-blocks.md#L181) (line 181, col 1, score 1)
- [field-dynamics-math-blocks — L181](field-dynamics-math-blocks.md#L181) (line 181, col 3, score 1)
- [homeostasis-decay-formulas — L189](homeostasis-decay-formulas.md#L189) (line 189, col 1, score 1)
- [homeostasis-decay-formulas — L189](homeostasis-decay-formulas.md#L189) (line 189, col 3, score 1)
- [field-dynamics-math-blocks — L182](field-dynamics-math-blocks.md#L182) (line 182, col 1, score 1)
- [field-dynamics-math-blocks — L182](field-dynamics-math-blocks.md#L182) (line 182, col 3, score 1)
- [field-interaction-equations — L185](field-interaction-equations.md#L185) (line 185, col 1, score 1)
- [field-interaction-equations — L185](field-interaction-equations.md#L185) (line 185, col 3, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
