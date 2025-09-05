---
uuid: 975de447-e9ae-4abe-97a8-46e04f83629b
created_at: eidolon-node-lifecycle.md
filename: Eidolon Node Lifecycle
title: Eidolon Node Lifecycle
description: >-
  A state diagram illustrating the lifecycle stages of an Eidolon node, from
  pressure accumulation through daimo aggregation to stabilization, nexus
  promotion, cross-layer propagation, and eventual decay. The diagram shows how
  nodes transition between states based on tension thresholds, unresolved loops,
  active bindings, and symbolic resonance. It highlights the conditions under
  which nodes become stable or fade from the system.
tags:
  - state diagram
  - eidolon
  - node lifecycle
  - daimo
  - stabilization
  - nexus promotion
  - cross-layer propagation
  - decay
---
Note: Consolidated here → ../notes/diagrams/state-diagram-node-lifecycle.md ^ref-938eca9c-1-0

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
^ref-938eca9c-3-0
 ^ref-938eca9c-21-0
#hashtags: #diagram #eidolon #promethean

---
 ^ref-938eca9c-25-0
Related notes: [[../notes/diagrams/node-type-topology-map|node-type-topology-map]], [[../notes/diagrams/circuit-weight-visualizations|circuit-weight-visualizations]], [[../notes/diagrams/full-system-overview-diagrams|full-system-overview-diagrams]], [[../notes/diagrams/layer1-uptime-diagrams|layer1-uptime-diagrams]], [[../notes/diagrams/field-node-lifecycle-additional-diagrams|field-node-lifecycle-additional-diagrams]], [[../notes/diagrams/state-diagram-node-lifecycle|state-diagram-node-lifecycle]] [[index|unique/index]]
 ^ref-938eca9c-27-0
#tags: #diagram #design
