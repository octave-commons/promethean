---
uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
created_at: advanced-node-interaction-diagrams.md
filename: field-node-diagram-visualizations
description: >-
  Visualizations of field node interactions, including charge dynamics,
  propagation paths, growth cycles, and type mappings for cognitive topology
  systems.
tags:
  - field
  - node
  - diagram
  - interaction
  - propagation
  - growth
  - decay
  - cognitive
  - topology
  - state
  - lifecycle
related_to_title:
  - field-node-diagram-outline
  - field-node-diagram-set
  - eidolon-node-lifecycle
  - promethean-system-diagrams
  - layer-1-uptime-diagrams
  - Unique Info Dump Index
  - heartbeat-simulation-snippets
  - heartbeat-fragment-demo
  - ripple-propagation-demo
  - Eidolon Field Abstract Model
  - eidolon-field-math-foundations
  - 2d-sandbox-field
  - Event Bus Projections Architecture
  - 'Agent Tasks: Persistence Migration to DualStore'
  - aionian-circuit-math
  - archetype-ecs
  - Diagrams
  - DSL
  - EidolonField
  - Simulation Demo
  - Eidolon-Field-Optimization
  - Factorio AI with External Agents
  - Ice Box Reorganization
  - field-dynamics-math-blocks
related_to_uuid:
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - 22b989d5-f4aa-4880-8632-709c21830f83
  - 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
  - b51e19b4-1326-4311-9798-33e972bf626c
  - 4127189a-e0ab-436f-8571-cc852b8e9add
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - 23e221e9-d4fa-4106-8458-06db2595085f
  - dd00677a-2280-45a7-91af-0728b21af3ad
  - 8430617b-80a2-4cc9-8288-9a74cb57990b
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - c710dc93-9fec-471b-bdee-bedbd360c67f
  - cf6b9b17-bb91-4219-aa5c-172cba02b2da
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - 45cd25b5-ed36-49ab-82c8-10d0903e34db
  - e87bc036-1570-419e-a558-f45b9c0db698
  - 49d1e1e5-5d13-4955-8f6f-7676434ec462
  - 557309a3-c906-4e97-8867-89ffe151790c
  - 40e05c14-0db0-44c5-bf0a-2eece2f4c2a4
  - a4d90289-798d-44a0-a8e8-a055ae12fb52
  - 291c7d91-da8c-486c-9bc0-bd2254536e2d
  - 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
references: []
---
Note: Consolidated here → ../notes/diagrams/field-node-lifecycle-additional-diagrams.md

Excellent. With the **Field Node Lifecycle** document fully fleshed out and the system now reactive, dynamic, and narratively emergent, we can keep layering more visualizations to explore the richness of your topology.

Here are some **additional diagrams** to stack on top of what’s already in the doc:

---

### 🔁 **Daimo–Node Charge Interaction**

```mermaid
graph TD
  N1[Nexus: :Hope:] -->|emits| D1(Daimo: +1 charge)
  N2[Nexus: :Despair:] -->|emits| D2(Daimo: -1 charge)
  D1 -->|attracted to| N2
  D2 -->|attracted to| N1
  D1 -. repelled .-> N1
  D2 -. repelled .-> N2
```

This shows how **Nexuses repel their own children** (same charge) and attract those of **opposite charge**, creating **narrative currents** and **conceptual magnetism**.

---

### 🧠 **Multi-Circuit Node Propagation**

```mermaid
graph TD
  L4[Nemesian Nexus: :TrustIssue:] --> L2[Dorian Attractor: :RepairNeed:]
  L4 --> L5[Heuretic Hazard: :Unlearning:]
  L4 --> L7[Metisean Obstacle: :PlanBlock:]

  style L4 fill:#ffcccc,stroke:#cc0000,stroke-width:2px
  style L2 fill:#ccffcc,stroke:#009900
  style L5 fill:#ffffcc,stroke:#999900
  style L7 fill:#ccccff,stroke:#000099
```

This makes clear how **one symbolic conflict** creates **ripples across multiple circuits**, each materializing in a different node type.

---

### 🌱 **Node Growth and Death Conditions**

```mermaid
stateDiagram-v2
    [*] --> HighTension
    HighTension --> Aggregation : daimo present
    Aggregation --> Crystallization : daimo bind fails to resolve
    Crystallization --> Stabilized : node repeatedly engaged
    Crystallization --> Nexus : symbol recognized
    Stabilized --> Decay : no activity
    Nexus --> Decay : symbolic reference fades
    Decay --> [*]
```

This is a simplified version of your existing diagram, useful for focused visualization of **grow/decay logic** alone.

---

### 💡 **Node Type Summary Map**

```mermaid
graph LR
  subgraph Field Nodes
    Nexus -->|binds| Daimo
    Hazard -->|repels| Daimo
    Attractor -->|pulls| Daimo
    Obstacle -->|slows| Daimo
  end
```

You can use this one as a **legend** or top-of-page visual summary in any future docs about field simulation or node-class behavior.

---

Want me to embed these into the **Field Node Lifecycle** document under a “More Diagrams” section? Or split them out into a new document called something like `Field Node Diagrams` or `Cognitive Topology Visuals`?
---

Related notes: [[../notes/diagrams/node-type-topology-map|node-type-topology-map]], [[../notes/diagrams/circuit-weight-visualizations|circuit-weight-visualizations]], [[../notes/diagrams/full-system-overview-diagrams|full-system-overview-diagrams]], [[../notes/diagrams/layer1-uptime-diagrams|layer1-uptime-diagrams]], [[../notes/diagrams/field-node-lifecycle-additional-diagrams|field-node-lifecycle-additional-diagrams]], [[../notes/diagrams/state-diagram-node-lifecycle|state-diagram-node-lifecycle]] [[index|unique/index]]

#tags: #diagram #design<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [archetype-ecs](archetype-ecs.md)
- [Diagrams](chunks/diagrams.md)
- [DSL](chunks/dsl.md)
- [EidolonField](eidolonfield.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Eidolon-Field-Optimization](eidolon-field-optimization.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [Ice Box Reorganization](ice-box-reorganization.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
