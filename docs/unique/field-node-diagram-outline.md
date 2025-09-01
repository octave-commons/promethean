---
uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
created_at: field-node-diagram-outline.md
filename: field-node-diagram-outline
description: >-
  A concise outline of five diagram types for visualizing Field Node
  interactions within the Eidolon system, including topology maps, propagation
  flows, stability loops, and lifecycle processes.
tags:
  - field
  - node
  - diagram
  - topology
  - propagation
  - stability
  - lifecycle
  - eidolon
related_to_title:
  - field-node-diagram-visualizations
  - field-node-diagram-set
  - eidolon-node-lifecycle
  - promethean-system-diagrams
  - layer-1-uptime-diagrams
  - field-dynamics-math-blocks
  - 2d-sandbox-field
  - Vectorial Exception Descent
  - Eidolon Field Abstract Model
  - Exception Layer Analysis
  - Ice Box Reorganization
  - EidolonField
  - Unique Info Dump Index
  - eidolon-field-math-foundations
  - ripple-propagation-demo
  - heartbeat-fragment-demo
  - heartbeat-simulation-snippets
  - ParticleSimulationWithCanvasAndFFmpeg
  - Event Bus Projections Architecture
  - 'Agent Tasks: Persistence Migration to DualStore'
  - aionian-circuit-math
  - Math Fundamentals
  - archetype-ecs
  - Diagrams
  - DSL
  - ecs-offload-workers
  - Reawakening Duck
  - sibilant-macro-targets
  - Simulation Demo
  - Eidolon-Field-Optimization
  - Factorio AI with External Agents
related_to_uuid:
  - e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
  - 22b989d5-f4aa-4880-8632-709c21830f83
  - 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
  - b51e19b4-1326-4311-9798-33e972bf626c
  - 4127189a-e0ab-436f-8571-cc852b8e9add
  - 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
  - c710dc93-9fec-471b-bdee-bedbd360c67f
  - d771154e-a7ef-44ca-b69c-a1626cf94fbf
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - 21d5cc09-b005-4ede-8f69-00b4b0794540
  - 291c7d91-da8c-486c-9bc0-bd2254536e2d
  - 49d1e1e5-5d13-4955-8f6f-7676434ec462
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 8430617b-80a2-4cc9-8288-9a74cb57990b
  - dd00677a-2280-45a7-91af-0728b21af3ad
  - 23e221e9-d4fa-4106-8458-06db2595085f
  - e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
  - cf6b9b17-bb91-4219-aa5c-172cba02b2da
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - 45cd25b5-ed36-49ab-82c8-10d0903e34db
  - e87bc036-1570-419e-a558-f45b9c0db698
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - 59b5670f-36d3-4d34-8985-f3144b15347a
  - c5c9a5c6-427d-4864-8084-c083cd55faa0
  - 557309a3-c906-4e97-8867-89ffe151790c
  - 40e05c14-0db0-44c5-bf0a-2eece2f4c2a4
  - a4d90289-798d-44a0-a8e8-a055ae12fb52
references: []
---
Note: Consolidated here → ../notes/diagrams/field-node-lifecycle-additional-diagrams.md

Absolutely. Here's a lineup of diagram types we can add next, each focused on a different part of the Field Node and Eidolon system. Let me know which one(s) you want to generate first, or if you'd like the full suite.

---

### 🧭 **1. Node Type Topology Map**

Shows the relationship between different types of Field Nodes:

```mermaid
graph TD
  Hazard -->|resists| Daimoi
  Attractor -->|pulls| Daimoi
  Obstacle -->|slows| Daimoi
  Nexus -->|binds| Daimoi
  Nexus -->|echoes to| Nexus
  Hazard -->|may emerge as| Nexus
  Attractor -->|may stabilize into| Nexus
```

---

### 🔀 **2. Cross-Layer Propagation Flow**

Illustrates how one node in one circuit causes echoes in others:

```mermaid
graph LR
  N4[Nemesian Nexus: :TrustIssue:]
  A2[Dorian Attractor: :PermissionRepair:]
  O7[Metisean Obstacle: :Uncertainty:]
  H5[Heuretic Hazard: :LoopFailure:]

  N4 --> A2
  N4 --> O7
  N4 --> H5
```

---

### 🔄 **3. Node Stability Decay Loop**

Visualizes how a node stabilizes or decays over time:

```mermaid
stateDiagram-v2
  [*] --> Node_Emergence
  Node_Emergence --> Stable : repeated Daimoi interaction
  Stable --> Stable : continued Gnostic resonance
  Stable --> Decay : no interaction
  Decay --> [*]
```

---

### ⚡ **4. Daimoi-Node Interaction Flow**

How Daimoi encounter and affect a node:

```mermaid
sequenceDiagram
  participant Daimo
  participant FieldNode
  participant Nooi
  Daimo->>FieldNode: Enters influence radius
  FieldNode-->>Nooi: Modulates local tension
  Daimo->>FieldNode: Binds or repelled based on charge
  FieldNode-->>Daimo: Applies pressure vector
```

---

### 🌐 **5. Full Lifecycle Flowchart**

Combines Emergence, Promotion, Propagation, and Decay.

This one is larger, and we can compose it from smaller diagrams, or make a custom canvas version if you'd prefer an editable visual overview.

---

Would you like:

- One or more of these embedded now?
    
- All five added as a “Diagrams” section to the current document?
    
- A dedicated Obsidian canvas to explore them modularly?
    

Let’s get visual.
---

Related notes: [[../notes/diagrams/node-type-topology-map|node-type-topology-map]], [[../notes/diagrams/circuit-weight-visualizations|circuit-weight-visualizations]], [[../notes/diagrams/full-system-overview-diagrams|full-system-overview-diagrams]], [[../notes/diagrams/layer1-uptime-diagrams|layer1-uptime-diagrams]], [[../notes/diagrams/field-node-lifecycle-additional-diagrams|field-node-lifecycle-additional-diagrams]], [[../notes/diagrams/state-diagram-node-lifecycle|state-diagram-node-lifecycle]] [[index|unique/index]]

#tags: #diagram #design<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [Ice Box Reorganization](ice-box-reorganization.md)
- [EidolonField](eidolonfield.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [archetype-ecs](archetype-ecs.md)
- [Diagrams](chunks/diagrams.md)
- [DSL](chunks/dsl.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [Reawakening Duck](reawakening-duck.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Eidolon-Field-Optimization](eidolon-field-optimization.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
