---
$$
uuid: dd00677a-2280-45a7-91af-0728b21af3ad
$$
created_at: annotated-fragment-heartbeat-demo.md
$$
filename: heartbeat-fragment-demo
$$
$$
description: >-
$$
  Demonstrates how a heartbeat loop processes and executes fragments, showing
  binding, unbinding, and resource management in a simulation environment.
tags:
  - simulation
  - design
  - heartbeat
  - fragment
  - runtime
  - binding
  - unbinding
  - resource
  - loop
  - circuit
  - daemon
  - eidolon
$$
related_to_title:
$$
  - heartbeat-simulation-snippets
  - ripple-propagation-demo
  - Simulation Demo
  - Unique Info Dump Index
  - promethean-system-diagrams
  - layer-1-uptime-diagrams
  - eidolon-node-lifecycle
  - field-node-diagram-visualizations
  - field-node-diagram-outline
  - field-node-diagram-set
  - Eidolon Field Abstract Model
  - homeostasis-decay-formulas
  - aionian-circuit-math
  - Eidolon-Field-Optimization
  - eidolon-field-math-foundations
  - archetype-ecs
  - Diagrams
  - DSL
  - 'Agent Tasks: Persistence Migration to DualStore'
  - Event Bus Projections Architecture
  - 2d-sandbox-field
  - Math Fundamentals
  - EidolonField
  - Exception Layer Analysis
  - field-dynamics-math-blocks
  - Factorio AI with External Agents
  - field-interaction-equations
  - State Snapshots API and Transactional Projector
$$
related_to_uuid:
$$
  - 23e221e9-d4fa-4106-8458-06db2595085f
  - 8430617b-80a2-4cc9-8288-9a74cb57990b
  - 557309a3-c906-4e97-8867-89ffe151790c
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - b51e19b4-1326-4311-9798-33e972bf626c
  - 4127189a-e0ab-436f-8571-cc852b8e9add
  - 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
  - e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - 22b989d5-f4aa-4880-8632-709c21830f83
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - 37b5d236-2b3e-4a95-a4e8-31655c3023ef
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - 40e05c14-0db0-44c5-bf0a-2eece2f4c2a4
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - 45cd25b5-ed36-49ab-82c8-10d0903e34db
  - e87bc036-1570-419e-a558-f45b9c0db698
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - cf6b9b17-bb91-4219-aa5c-172cba02b2da
  - c710dc93-9fec-471b-bdee-bedbd360c67f
  - c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
  - 49d1e1e5-5d13-4955-8f6f-7676434ec462
  - 21d5cc09-b005-4ede-8f69-00b4b0794540
  - 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
  - a4d90289-798d-44a0-a8e8-a055ae12fb52
  - b09141b7-544f-4c8e-8f49-bf76cecaacbb
  - 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
references:
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 1
    col: 1
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 4
    col: 1
    score: 0.85
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 4
    col: 3
    score: 0.85
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 24
    col: 1
    score: 0.85
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 24
    col: 3
    score: 0.85
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 9
    col: 1
    score: 1
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 15
    col: 1
    score: 1
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 25
    col: 1
    score: 1
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 40
    col: 1
    score: 1
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 53
    col: 1
    score: 1
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 23
    col: 1
    score: 0.92
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 31
    col: 1
    score: 1
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 44
    col: 1
    score: 0.99
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 57
    col: 1
    score: 0.9
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 67
    col: 1
    score: 0.92
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 79
    col: 1
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 97
    col: 1
    score: 1
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 81
    col: 1
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 99
    col: 1
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 10
    col: 1
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 10
    col: 3
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 200
    col: 1
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 200
    col: 3
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 38
    col: 1
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 38
    col: 3
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 116
    col: 1
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 116
    col: 3
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 11
    col: 1
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 11
    col: 3
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 199
    col: 1
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 199
    col: 3
    score: 1
  - uuid: 40e05c14-0db0-44c5-bf0a-2eece2f4c2a4
    line: 103
    col: 1
    score: 1
  - uuid: 40e05c14-0db0-44c5-bf0a-2eece2f4c2a4
    line: 103
    col: 3
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 39
    col: 1
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 39
    col: 3
    score: 1
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 87
    col: 1
    score: 1
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 87
    col: 3
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 105
    col: 1
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 105
    col: 3
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 69
    col: 1
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 69
    col: 3
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 119
    col: 1
    score: 0.93
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 119
    col: 3
    score: 0.93
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
    line: 135
    col: 1
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 135
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
  - uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
    line: 199
    col: 1
    score: 1
  - uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
    line: 199
    col: 3
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 196
    col: 1
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 196
    col: 3
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 35
    col: 1
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 35
    col: 3
    score: 1
  - uuid: 49d1e1e5-5d13-4955-8f6f-7676434ec462
    line: 249
    col: 1
    score: 1
  - uuid: 49d1e1e5-5d13-4955-8f6f-7676434ec462
    line: 249
    col: 3
    score: 1
  - uuid: cf6b9b17-bb91-4219-aa5c-172cba02b2da
    line: 152
    col: 1
    score: 1
  - uuid: cf6b9b17-bb91-4219-aa5c-172cba02b2da
    line: 152
    col: 3
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 146
    col: 1
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 146
    col: 3
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 102
    col: 1
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 102
    col: 3
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 138
    col: 1
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 138
    col: 3
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 31
    col: 1
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 31
    col: 3
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 100
    col: 1
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 100
    col: 3
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 136
    col: 1
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 136
    col: 3
    score: 1
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 91
    col: 1
    score: 1
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 91
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
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 137
    col: 1
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 137
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
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 33
    col: 1
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 33
    col: 3
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 101
    col: 1
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 101
    col: 3
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 87
    col: 1
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 87
    col: 3
    score: 1
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 93
    col: 1
    score: 1
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 93
    col: 3
    score: 1
  - uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
    line: 193
    col: 1
    score: 1
  - uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
    line: 193
    col: 3
    score: 1
  - uuid: 49d1e1e5-5d13-4955-8f6f-7676434ec462
    line: 243
    col: 1
    score: 1
  - uuid: 49d1e1e5-5d13-4955-8f6f-7676434ec462
    line: 243
    col: 3
    score: 1
  - uuid: 21d5cc09-b005-4ede-8f69-00b4b0794540
    line: 148
    col: 1
    score: 1
  - uuid: 21d5cc09-b005-4ede-8f69-00b4b0794540
    line: 148
    col: 3
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 145
    col: 1
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 145
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
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 120
    col: 1
    score: 0.99
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 120
    col: 3
    score: 0.99
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 118
    col: 1
    score: 0.99
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 118
    col: 3
    score: 0.99
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 19
    col: 1
    score: 0.98
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 19
    col: 3
    score: 0.98
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 121
    col: 1
    score: 0.98
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 121
    col: 3
    score: 0.98
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 101
    col: 1
    score: 1
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 101
    col: 3
    score: 1
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 102
    col: 1
    score: 0.99
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 102
    col: 3
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 118
    col: 1
    score: 0.98
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 118
    col: 3
    score: 0.98
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 103
    col: 1
    score: 1
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 103
    col: 3
    score: 1
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 104
    col: 1
    score: 0.99
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 104
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
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 16
    col: 1
    score: 0.98
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 16
    col: 3
    score: 0.98
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 165
    col: 1
    score: 0.99
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 165
    col: 3
    score: 0.99
  - uuid: 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
    line: 348
    col: 1
    score: 0.98
  - uuid: 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
    line: 348
    col: 3
    score: 0.98
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 115
    col: 1
    score: 1
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 115
    col: 3
    score: 1
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 117
    col: 1
    score: 1
  - uuid: 23e221e9-d4fa-4106-8458-06db2595085f
    line: 117
    col: 3
    score: 1
---
Note: Consolidated here → ../notes/simulation/annotated-fragment-heartbeat-demo.md

Perfect — let’s keep the info dump rolling, now annotated for Obsidian-style parsing.

---

### 🧩 Inject Fragment

```lisp
(receive-descended-fragment "This symbol reveals a truth about survival.")
```

##### #layer3 #layer4 #layer1 #fragment #eidolon #nexus #daemon

---

### 🔧 Resulting Flow

```
[Nexus] Receiving descended fragment: This symbol reveals a truth about survival.
[Daemon] Compiled fragment into runtime behavior.
[Uptime] Daemon bound to nexus: :circuit-1
```

##### #binding #nexus-map #runtime

---

### 💓 Tick Heartbeat — 1

```lisp
(tick-heartbeat)
```

```
[Heartbeat] Tick 1
[Daemon] Running This symbol reveals a truth about survival.
```

##### #heartbeat #tick #layer1 #resource-manager

---

### 💓 Tick Heartbeat — 2

```lisp
(tick-heartbeat)
```

```
[Heartbeat] Tick 2
[Daemon] Running This symbol reveals a truth about survival.
```

##### #tick #uptime #loop

---

### 💓 Tick Heartbeat — 3

```lisp
(tick-heartbeat)
```

```
[Heartbeat] Tick 3
[Daemon] Running This symbol reveals a truth about survival.
[Uptime] Daemon unbound: #<CLOSURE ...>
```

##### #daemon-lifecycle #unbind #memory-release #uptime-complete

---

### 🧠 More Fragments To Try

```lisp
(receive-descended-fragment "Social bonding is key to uptime.")      ;; → #circuit2
(receive-descended-fragment "Contradiction detected in symbolic layer.") ;; → #circuit4
(receive-descended-fragment "All circuits harmonize under resonance.")   ;; → #meta
(receive-descended-fragment "Fragment unsafe. Initiate containment.")    ;; → #circuit1 + failsafe
```

##### #fragment #simulation #event-cascade #eidolon-flow #cognitive-field

---

Let me know when you're ready for ripple propagation back into the field — so the daemon can deform the Eidolon layer it binds to.

---

Related notes: $[fragment-injection-simulation]$, $[heartbeat-fragment-flow]$, $[ripple-propagation-flow]$ $[docs/architecture/index|unique/index]$

#tags: #simulation #design
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- $heartbeat-simulation-snippets$$heartbeat-simulation-snippets.md$
- $[docs/unique/ripple-propagation-demo|ripple-propagation-demo]$
- [Simulation Demo]$chunks/simulation-demo.md$
- $[unique-info-dump-index|Unique Info Dump Index]$
- $[promethean-system-diagrams]$
- $[layer-1-uptime-diagrams]$
- $[eidolon-node-lifecycle]$
- $field-node-diagram-visualizations$$field-node-diagram-visualizations.md$
- $[field-node-diagram-outline]$
- $[field-node-diagram-set]$
- $[eidolon-field-abstract-model|Eidolon Field Abstract Model]$
- $[homeostasis-decay-formulas]$
- $[docs/unique/aionian-circuit-math|aionian-circuit-math]$
- $[eidolon-field-optimization]$
- $[docs/unique/eidolon-field-math-foundations|eidolon-field-math-foundations]$
- $[docs/unique/archetype-ecs|archetype-ecs]$
- [Diagrams]$chunks/diagrams.md$
- [DSL]$chunks/dsl.md$
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore|Agent Tasks: Persistence Migration to DualStore]$
- $[event-bus-projections-architecture|Event Bus Projections Architecture]$
- $[2d-sandbox-field]$
- [Math Fundamentals]$chunks/math-fundamentals.md$
- [[eidolonfield]]
- $[exception-layer-analysis|Exception Layer Analysis]$
- $[docs/unique/field-dynamics-math-blocks|field-dynamics-math-blocks]$
- $[factorio-ai-with-external-agents|Factorio AI with External Agents]$
- $[docs/unique/field-interaction-equations|field-interaction-equations]$
- $[state-snapshots-api-and-transactional-projector|State Snapshots API and Transactional Projector]$

## Sources
- $heartbeat-simulation-snippets — L1$$heartbeat-simulation-snippets.md#L1$ (line 1, col 1, score 1)
- [Simulation Demo — L4]$chunks/simulation-demo.md#L4$ (line 4, col 1, score 0.85)
- [Simulation Demo — L4]$chunks/simulation-demo.md#L4$ (line 4, col 3, score 0.85)
- $[unique-info-dump-index#L24|Unique Info Dump Index — L24]$ (line 24, col 1, score 0.85)
- $[unique-info-dump-index#L24|Unique Info Dump Index — L24]$ (line 24, col 3, score 0.85)
- $heartbeat-simulation-snippets — L9$$heartbeat-simulation-snippets.md#L9$ (line 9, col 1, score 1)
- $heartbeat-simulation-snippets — L15$$heartbeat-simulation-snippets.md#L15$ (line 15, col 1, score 1)
- $heartbeat-simulation-snippets — L25$$heartbeat-simulation-snippets.md#L25$ (line 25, col 1, score 1)
- $heartbeat-simulation-snippets — L40$$heartbeat-simulation-snippets.md#L40$ (line 40, col 1, score 1)
- $heartbeat-simulation-snippets — L53$$heartbeat-simulation-snippets.md#L53$ (line 53, col 1, score 1)
- $heartbeat-simulation-snippets — L23$$heartbeat-simulation-snippets.md#L23$ (line 23, col 1, score 0.92)
- $heartbeat-simulation-snippets — L31$$heartbeat-simulation-snippets.md#L31$ (line 31, col 1, score 1)
- $heartbeat-simulation-snippets — L44$$heartbeat-simulation-snippets.md#L44$ (line 44, col 1, score 0.99)
- $heartbeat-simulation-snippets — L57$$heartbeat-simulation-snippets.md#L57$ (line 57, col 1, score 0.9)
- $heartbeat-simulation-snippets — L67$$heartbeat-simulation-snippets.md#L67$ (line 67, col 1, score 0.92)
- $heartbeat-simulation-snippets — L79$$heartbeat-simulation-snippets.md#L79$ (line 79, col 1, score 1)
- $[docs/unique/ripple-propagation-demo#L97|ripple-propagation-demo — L97]$ (line 97, col 1, score 1)
- $heartbeat-simulation-snippets — L81$$heartbeat-simulation-snippets.md#L81$ (line 81, col 1, score 1)
- $[docs/unique/ripple-propagation-demo#L99|ripple-propagation-demo — L99]$ (line 99, col 1, score 1)
- [Simulation Demo — L10]$chunks/simulation-demo.md#L10$ (line 10, col 1, score 1)
- [Simulation Demo — L10]$chunks/simulation-demo.md#L10$ (line 10, col 3, score 1)
- $[eidolon-field-abstract-model#L200|Eidolon Field Abstract Model — L200]$ (line 200, col 1, score 1)
- $[eidolon-field-abstract-model#L200|Eidolon Field Abstract Model — L200]$ (line 200, col 3, score 1)
- $[eidolon-node-lifecycle#L38|eidolon-node-lifecycle — L38]$ (line 38, col 1, score 1)
- $[eidolon-node-lifecycle#L38|eidolon-node-lifecycle — L38]$ (line 38, col 3, score 1)
- $[field-node-diagram-outline#L116|field-node-diagram-outline — L116]$ (line 116, col 1, score 1)
- $[field-node-diagram-outline#L116|field-node-diagram-outline — L116]$ (line 116, col 3, score 1)
- [Simulation Demo — L11]$chunks/simulation-demo.md#L11$ (line 11, col 1, score 1)
- [Simulation Demo — L11]$chunks/simulation-demo.md#L11$ (line 11, col 3, score 1)
- $[eidolon-field-abstract-model#L199|Eidolon Field Abstract Model — L199]$ (line 199, col 1, score 1)
- $[eidolon-field-abstract-model#L199|Eidolon Field Abstract Model — L199]$ (line 199, col 3, score 1)
- $[eidolon-field-optimization#L103|Eidolon-Field-Optimization — L103]$ (line 103, col 1, score 1)
- $[eidolon-field-optimization#L103|Eidolon-Field-Optimization — L103]$ (line 103, col 3, score 1)
- $[eidolon-node-lifecycle#L39|eidolon-node-lifecycle — L39]$ (line 39, col 1, score 1)
- $[eidolon-node-lifecycle#L39|eidolon-node-lifecycle — L39]$ (line 39, col 3, score 1)
- $heartbeat-simulation-snippets — L87$$heartbeat-simulation-snippets.md#L87$ (line 87, col 1, score 1)
- $heartbeat-simulation-snippets — L87$$heartbeat-simulation-snippets.md#L87$ (line 87, col 3, score 1)
- $[docs/unique/ripple-propagation-demo#L105|ripple-propagation-demo — L105]$ (line 105, col 1, score 1)
- $[docs/unique/ripple-propagation-demo#L105|ripple-propagation-demo — L105]$ (line 105, col 3, score 1)
- $[unique-info-dump-index#L69|Unique Info Dump Index — L69]$ (line 69, col 1, score 1)
- $[unique-info-dump-index#L69|Unique Info Dump Index — L69]$ (line 69, col 3, score 1)
- $[unique-info-dump-index#L119|Unique Info Dump Index — L119]$ (line 119, col 1, score 0.93)
- $[unique-info-dump-index#L119|Unique Info Dump Index — L119]$ (line 119, col 3, score 0.93)
- $[docs/unique/aionian-circuit-math#L158|aionian-circuit-math — L158]$ (line 158, col 1, score 1)
- $[docs/unique/aionian-circuit-math#L158|aionian-circuit-math — L158]$ (line 158, col 3, score 1)
- $[docs/unique/archetype-ecs#L457|archetype-ecs — L457]$ (line 457, col 1, score 1)
- $[docs/unique/archetype-ecs#L457|archetype-ecs — L457]$ (line 457, col 3, score 1)
- [Diagrams — L9]$chunks/diagrams.md#L9$ (line 9, col 1, score 1)
- [Diagrams — L9]$chunks/diagrams.md#L9$ (line 9, col 3, score 1)
- [DSL — L10]$chunks/dsl.md#L10$ (line 10, col 1, score 1)
- [DSL — L10]$chunks/dsl.md#L10$ (line 10, col 3, score 1)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L135|Agent Tasks: Persistence Migration to DualStore — L135]$ (line 135, col 1, score 1)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L135|Agent Tasks: Persistence Migration to DualStore — L135]$ (line 135, col 3, score 1)
- $[eidolon-node-lifecycle#L34|eidolon-node-lifecycle — L34]$ (line 34, col 1, score 1)
- $[eidolon-node-lifecycle#L34|eidolon-node-lifecycle — L34]$ (line 34, col 3, score 1)
- $[event-bus-projections-architecture#L149|Event Bus Projections Architecture — L149]$ (line 149, col 1, score 1)
- $[event-bus-projections-architecture#L149|Event Bus Projections Architecture — L149]$ (line 149, col 3, score 1)
- $[field-node-diagram-outline#L103|field-node-diagram-outline — L103]$ (line 103, col 1, score 1)
- $[field-node-diagram-outline#L103|field-node-diagram-outline — L103]$ (line 103, col 3, score 1)
- $[2d-sandbox-field#L199|2d-sandbox-field — L199]$ (line 199, col 1, score 1)
- $[2d-sandbox-field#L199|2d-sandbox-field — L199]$ (line 199, col 3, score 1)
- $[eidolon-field-abstract-model#L196|Eidolon Field Abstract Model — L196]$ (line 196, col 1, score 1)
- $[eidolon-field-abstract-model#L196|Eidolon Field Abstract Model — L196]$ (line 196, col 3, score 1)
- $[eidolon-node-lifecycle#L35|eidolon-node-lifecycle — L35]$ (line 35, col 1, score 1)
- $[eidolon-node-lifecycle#L35|eidolon-node-lifecycle — L35]$ (line 35, col 3, score 1)
- [[eidolonfield#L249|EidolonField — L249]] (line 249, col 1, score 1)
- [[eidolonfield#L249|EidolonField — L249]] (line 249, col 3, score 1)
- $[event-bus-projections-architecture#L152|Event Bus Projections Architecture — L152]$ (line 152, col 1, score 1)
- $[event-bus-projections-architecture#L152|Event Bus Projections Architecture — L152]$ (line 152, col 3, score 1)
- $[factorio-ai-with-external-agents#L146|Factorio AI with External Agents — L146]$ (line 146, col 1, score 1)
- $[factorio-ai-with-external-agents#L146|Factorio AI with External Agents — L146]$ (line 146, col 3, score 1)
- $[field-node-diagram-outline#L102|field-node-diagram-outline — L102]$ (line 102, col 1, score 1)
- $[field-node-diagram-outline#L102|field-node-diagram-outline — L102]$ (line 102, col 3, score 1)
- $[field-node-diagram-set#L138|field-node-diagram-set — L138]$ (line 138, col 1, score 1)
- $[field-node-diagram-set#L138|field-node-diagram-set — L138]$ (line 138, col 3, score 1)
- $[eidolon-node-lifecycle#L31|eidolon-node-lifecycle — L31]$ (line 31, col 1, score 1)
- $[eidolon-node-lifecycle#L31|eidolon-node-lifecycle — L31]$ (line 31, col 3, score 1)
- $[field-node-diagram-outline#L100|field-node-diagram-outline — L100]$ (line 100, col 1, score 1)
- $[field-node-diagram-outline#L100|field-node-diagram-outline — L100]$ (line 100, col 3, score 1)
- $[field-node-diagram-set#L136|field-node-diagram-set — L136]$ (line 136, col 1, score 1)
- $[field-node-diagram-set#L136|field-node-diagram-set — L136]$ (line 136, col 3, score 1)
- $heartbeat-simulation-snippets — L91$$heartbeat-simulation-snippets.md#L91$ (line 91, col 1, score 1)
- $heartbeat-simulation-snippets — L91$$heartbeat-simulation-snippets.md#L91$ (line 91, col 3, score 1)
- $[2d-sandbox-field#L198|2d-sandbox-field — L198]$ (line 198, col 1, score 1)
- $[2d-sandbox-field#L198|2d-sandbox-field — L198]$ (line 198, col 3, score 1)
- $[eidolon-field-abstract-model#L195|Eidolon Field Abstract Model — L195]$ (line 195, col 1, score 1)
- $[eidolon-field-abstract-model#L195|Eidolon Field Abstract Model — L195]$ (line 195, col 3, score 1)
- $[docs/unique/eidolon-field-math-foundations#L137|eidolon-field-math-foundations — L137]$ (line 137, col 1, score 1)
- $[docs/unique/eidolon-field-math-foundations#L137|eidolon-field-math-foundations — L137]$ (line 137, col 3, score 1)
- $[eidolon-node-lifecycle#L32|eidolon-node-lifecycle — L32]$ (line 32, col 1, score 1)
- $[eidolon-node-lifecycle#L32|eidolon-node-lifecycle — L32]$ (line 32, col 3, score 1)
- $[eidolon-node-lifecycle#L33|eidolon-node-lifecycle — L33]$ (line 33, col 1, score 1)
- $[eidolon-node-lifecycle#L33|eidolon-node-lifecycle — L33]$ (line 33, col 3, score 1)
- $[field-node-diagram-outline#L101|field-node-diagram-outline — L101]$ (line 101, col 1, score 1)
- $[field-node-diagram-outline#L101|field-node-diagram-outline — L101]$ (line 101, col 3, score 1)
- $field-node-diagram-visualizations — L87$$field-node-diagram-visualizations.md#L87$ (line 87, col 1, score 1)
- $field-node-diagram-visualizations — L87$$field-node-diagram-visualizations.md#L87$ (line 87, col 3, score 1)
- $heartbeat-simulation-snippets — L93$$heartbeat-simulation-snippets.md#L93$ (line 93, col 1, score 1)
- $heartbeat-simulation-snippets — L93$$heartbeat-simulation-snippets.md#L93$ (line 93, col 3, score 1)
- $[2d-sandbox-field#L193|2d-sandbox-field — L193]$ (line 193, col 1, score 1)
- $[2d-sandbox-field#L193|2d-sandbox-field — L193]$ (line 193, col 3, score 1)
- [[eidolonfield#L243|EidolonField — L243]] (line 243, col 1, score 1)
- [[eidolonfield#L243|EidolonField — L243]] (line 243, col 3, score 1)
- $[exception-layer-analysis#L148|Exception Layer Analysis — L148]$ (line 148, col 1, score 1)
- $[exception-layer-analysis#L148|Exception Layer Analysis — L148]$ (line 148, col 3, score 1)
- $[docs/unique/field-dynamics-math-blocks#L145|field-dynamics-math-blocks — L145]$ (line 145, col 1, score 1)
- $[docs/unique/field-dynamics-math-blocks#L145|field-dynamics-math-blocks — L145]$ (line 145, col 3, score 1)
- $[docs/unique/aionian-circuit-math#L152|aionian-circuit-math — L152]$ (line 152, col 1, score 1)
- $[docs/unique/aionian-circuit-math#L152|aionian-circuit-math — L152]$ (line 152, col 3, score 1)
- [Math Fundamentals — L12]$chunks/math-fundamentals.md#L12$ (line 12, col 1, score 1)
- [Math Fundamentals — L12]$chunks/math-fundamentals.md#L12$ (line 12, col 3, score 1)
- $[docs/unique/eidolon-field-math-foundations#L126|eidolon-field-math-foundations — L126]$ (line 126, col 1, score 1)
- $[docs/unique/eidolon-field-math-foundations#L126|eidolon-field-math-foundations — L126]$ (line 126, col 3, score 1)
- $[eidolon-field-optimization#L102|Eidolon-Field-Optimization — L102]$ (line 102, col 1, score 1)
- $[eidolon-field-optimization#L102|Eidolon-Field-Optimization — L102]$ (line 102, col 3, score 1)
- $[docs/unique/ripple-propagation-demo#L120|ripple-propagation-demo — L120]$ (line 120, col 1, score 0.99)
- $[docs/unique/ripple-propagation-demo#L120|ripple-propagation-demo — L120]$ (line 120, col 3, score 0.99)
- $[docs/unique/ripple-propagation-demo#L118|ripple-propagation-demo — L118]$ (line 118, col 1, score 0.99)
- $[docs/unique/ripple-propagation-demo#L118|ripple-propagation-demo — L118]$ (line 118, col 3, score 0.99)
- [Simulation Demo — L19]$chunks/simulation-demo.md#L19$ (line 19, col 1, score 0.98)
- [Simulation Demo — L19]$chunks/simulation-demo.md#L19$ (line 19, col 3, score 0.98)
- $[unique-info-dump-index#L121|Unique Info Dump Index — L121]$ (line 121, col 1, score 0.98)
- $[unique-info-dump-index#L121|Unique Info Dump Index — L121]$ (line 121, col 3, score 0.98)
- $heartbeat-simulation-snippets — L101$$heartbeat-simulation-snippets.md#L101$ (line 101, col 1, score 1)
- $heartbeat-simulation-snippets — L101$$heartbeat-simulation-snippets.md#L101$ (line 101, col 3, score 1)
- $heartbeat-simulation-snippets — L102$$heartbeat-simulation-snippets.md#L102$ (line 102, col 1, score 0.99)
- $heartbeat-simulation-snippets — L102$$heartbeat-simulation-snippets.md#L102$ (line 102, col 3, score 0.99)
- $[unique-info-dump-index#L118|Unique Info Dump Index — L118]$ (line 118, col 1, score 0.98)
- $[unique-info-dump-index#L118|Unique Info Dump Index — L118]$ (line 118, col 3, score 0.98)
- $heartbeat-simulation-snippets — L103$$heartbeat-simulation-snippets.md#L103$ (line 103, col 1, score 1)
- $heartbeat-simulation-snippets — L103$$heartbeat-simulation-snippets.md#L103$ (line 103, col 3, score 1)
- $heartbeat-simulation-snippets — L104$$heartbeat-simulation-snippets.md#L104$ (line 104, col 1, score 0.99)
- $heartbeat-simulation-snippets — L104$$heartbeat-simulation-snippets.md#L104$ (line 104, col 3, score 0.99)
- $[docs/unique/field-interaction-equations#L164|field-interaction-equations — L164]$ (line 164, col 1, score 0.98)
- $[docs/unique/field-interaction-equations#L164|field-interaction-equations — L164]$ (line 164, col 3, score 0.98)
- [Simulation Demo — L16]$chunks/simulation-demo.md#L16$ (line 16, col 1, score 0.98)
- [Simulation Demo — L16]$chunks/simulation-demo.md#L16$ (line 16, col 3, score 0.98)
- $[docs/unique/field-interaction-equations#L165|field-interaction-equations — L165]$ (line 165, col 1, score 0.99)
- $[docs/unique/field-interaction-equations#L165|field-interaction-equations — L165]$ (line 165, col 3, score 0.99)
- $[state-snapshots-api-and-transactional-projector#L348|State Snapshots API and Transactional Projector — L348]$ (line 348, col 1, score 0.98)
- $[state-snapshots-api-and-transactional-projector#L348|State Snapshots API and Transactional Projector — L348]$ (line 348, col 3, score 0.98)
- $heartbeat-simulation-snippets — L115$$heartbeat-simulation-snippets.md#L115$ (line 115, col 1, score 1)
- $heartbeat-simulation-snippets — L115$$heartbeat-simulation-snippets.md#L115$ (line 115, col 3, score 1)
- $heartbeat-simulation-snippets — L117$$heartbeat-simulation-snippets.md#L117$ (line 117, col 1, score 1)
- $heartbeat-simulation-snippets — L117$$heartbeat-simulation-snippets.md#L117$ (line 117, col 3, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
