---
uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
created_at: eidolon-node-lifecycle-diagram.md
filename: eidolon-node-lifecycle
description: >-
  State diagram illustrating the lifecycle stages of an Eidolon node, from
  pressure accumulation through emergence, stabilization, and potential decay or
  promotion to cross-layer propagation.
tags:
  - eidolon
  - node
  - lifecycle
  - state-diagram
  - promethean
related_to_title:
  - field-node-diagram-visualizations
  - field-node-diagram-outline
  - field-node-diagram-set
  - promethean-system-diagrams
  - layer-1-uptime-diagrams
  - Unique Info Dump Index
  - heartbeat-fragment-demo
  - heartbeat-simulation-snippets
  - ripple-propagation-demo
  - Event Bus Projections Architecture
  - Factorio AI with External Agents
  - 2d-sandbox-field
  - Eidolon Field Abstract Model
  - eidolon-field-math-foundations
  - EidolonField
  - 'Agent Tasks: Persistence Migration to DualStore'
  - aionian-circuit-math
  - archetype-ecs
  - Diagrams
  - DSL
  - Promethean Event Bus MVP v0.1
  - Simulation Demo
  - Eidolon-Field-Optimization
  - Ice Box Reorganization
  - Exception Layer Analysis
related_to_uuid:
  - e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - 22b989d5-f4aa-4880-8632-709c21830f83
  - b51e19b4-1326-4311-9798-33e972bf626c
  - 4127189a-e0ab-436f-8571-cc852b8e9add
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - dd00677a-2280-45a7-91af-0728b21af3ad
  - 23e221e9-d4fa-4106-8458-06db2595085f
  - 8430617b-80a2-4cc9-8288-9a74cb57990b
  - cf6b9b17-bb91-4219-aa5c-172cba02b2da
  - a4d90289-798d-44a0-a8e8-a055ae12fb52
  - c710dc93-9fec-471b-bdee-bedbd360c67f
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 49d1e1e5-5d13-4955-8f6f-7676434ec462
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - 45cd25b5-ed36-49ab-82c8-10d0903e34db
  - e87bc036-1570-419e-a558-f45b9c0db698
  - fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
  - 557309a3-c906-4e97-8867-89ffe151790c
  - 40e05c14-0db0-44c5-bf0a-2eece2f4c2a4
  - 291c7d91-da8c-486c-9bc0-bd2254536e2d
  - 21d5cc09-b005-4ede-8f69-00b4b0794540
references: []
---
Note: Consolidated here → ../notes/diagrams/state-diagram-node-lifecycle.md

```mermaid
stateDiagram-v2
    [*] --> Pressure_Accumulation
    Pressure_Accumulation --> Daimo_Aggregation : tension threshold exceeded
    Daimo_Aggregation --> Node_Emergence : unresolved daimo looping
    Node_Emergence --> Stabilization : active daimo binding
    Node_Emergence --> Nexus_Promotion : symbolic or semantic resonance
    Nexus_Promotion --> Cross_Layer_Propagation : symbolic echo or affective reflection
    Stabilization --> Cross_Layer_Propagation : if node becomes Nexus
    Stabilization --> Decay : no interaction for duration
    Cross_Layer_Propagation --> Stabilization : echo node becomes active
    Decay --> [*]

    Nexus_Promotion --> Decay : forgotten or dereferenced


```

#hashtags: #diagram #eidolon #promethean

---

Related notes: [[../notes/diagrams/node-type-topology-map|node-type-topology-map]], [[../notes/diagrams/circuit-weight-visualizations|circuit-weight-visualizations]], [[../notes/diagrams/full-system-overview-diagrams|full-system-overview-diagrams]], [[../notes/diagrams/layer1-uptime-diagrams|layer1-uptime-diagrams]], [[../notes/diagrams/field-node-lifecycle-additional-diagrams|field-node-lifecycle-additional-diagrams]], [[../notes/diagrams/state-diagram-node-lifecycle|state-diagram-node-lifecycle]] [[index|unique/index]]

#tags: #diagram #design<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [EidolonField](eidolonfield.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [archetype-ecs](archetype-ecs.md)
- [Diagrams](chunks/diagrams.md)
- [DSL](chunks/dsl.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Eidolon-Field-Optimization](eidolon-field-optimization.md)
- [Ice Box Reorganization](ice-box-reorganization.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
