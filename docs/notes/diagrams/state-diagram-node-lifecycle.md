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

Related notes: [node-type-topology-map](node-type-topology-map.md), [circuit-weight-visualizations](circuit-weight-visualizations.md), [full-system-overview-diagrams](full-system-overview-diagrams.md), [layer1-uptime-diagrams](layer1-uptime-diagrams.md), [field-node-lifecycle-additional-diagrams](field-node-lifecycle-additional-diagrams.md), [state-diagram-node-lifecycle](state-diagram-node-lifecycle.md) [unique/index](../../unique/index.md)

#tags: #diagram #design
