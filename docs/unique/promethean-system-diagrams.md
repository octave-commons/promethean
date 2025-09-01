---
uuid: b51e19b4-1326-4311-9798-33e972bf626c
created_at: comprehensive-system-diagrams.md
filename: promethean-system-diagrams
description: >-
  Consolidated Mermaid diagrams for Promethean system architecture, cognitive
  layers, and agent interactions
tags:
  - system
  - architecture
  - cognitive
  - diagrams
  - mermaid
  - agent
  - services
  - flow
related_to_title:
  - eidolon-node-lifecycle
  - layer-1-uptime-diagrams
  - field-node-diagram-visualizations
  - field-node-diagram-outline
  - field-node-diagram-set
  - Unique Info Dump Index
  - Event Bus Projections Architecture
  - 'Agent Tasks: Persistence Migration to DualStore'
  - heartbeat-simulation-snippets
  - ripple-propagation-demo
  - heartbeat-fragment-demo
  - eidolon-field-math-foundations
  - Migrate to Provider-Tenant Architecture
  - Promethean Event Bus MVP v0.1
  - Chroma Toolkit Consolidation Plan
  - aionian-circuit-math
  - 2d-sandbox-field
  - Eidolon Field Abstract Model
  - archetype-ecs
  - Diagrams
  - DSL
  - Per-Domain Policy System for JS Crawler
  - EidolonField
  - Simulation Demo
  - Eidolon-Field-Optimization
  - Factorio AI with External Agents
related_to_uuid:
  - 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
  - 4127189a-e0ab-436f-8571-cc852b8e9add
  - e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - 22b989d5-f4aa-4880-8632-709c21830f83
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - cf6b9b17-bb91-4219-aa5c-172cba02b2da
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - 23e221e9-d4fa-4106-8458-06db2595085f
  - 8430617b-80a2-4cc9-8288-9a74cb57990b
  - dd00677a-2280-45a7-91af-0728b21af3ad
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 54382370-1931-4a19-a634-46735708a9ea
  - fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - c710dc93-9fec-471b-bdee-bedbd360c67f
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - 45cd25b5-ed36-49ab-82c8-10d0903e34db
  - e87bc036-1570-419e-a558-f45b9c0db698
  - c03020e1-e3e7-48bf-aa7e-aa740c601b63
  - 49d1e1e5-5d13-4955-8f6f-7676434ec462
  - 557309a3-c906-4e97-8867-89ffe151790c
  - 40e05c14-0db0-44c5-bf0a-2eece2f4c2a4
  - a4d90289-798d-44a0-a8e8-a055ae12fb52
references: []
---
Note: Consolidated here → ../notes/diagrams/full-system-overview-diagrams.md

Absolutely. Here's a series of **Obsidian-compatible** `mermaid` diagrams based on everything we've built so far across the Promethean project — including the Cephalon, Eidolon Fields, the layered circuits, the services architecture, and agent interactions. Each diagram will be brief and self-contained so you can paste it directly into notes. We'll mix system architecture, cognitive modeling, and data flow.

---

## 🧠 High-Level System Overview

```mermaid
graph TD
  Promethean["🧠 Promethean System"]
  Cephalon["🧾 Cephalon (LLM IO)"]
  Eidolon["🌌 Eidolon Fields"]
  Duck["🦆 Duck (Agent Instance)"]
  STT["🗣️ STT Service"]
  TTS["🔊 TTS Service"]
  LLM["🧠 LLM (LLaMA 3.2)"]
  Discord["💬 Discord Gateway"]

  Promethean --> Cephalon
  Promethean --> Eidolon
  Promethean --> Duck
  Duck --> Discord
  Duck --> Cephalon
  Cephalon --> STT
  Cephalon --> TTS
  Cephalon --> LLM
```

---

## 🔁 Layered Cognitive Stack

```mermaid
graph TD
  L1["Layer 1: Uptime / Survival"]
  L2["Layer 2: Permissions / Trust"]
  L3["Layer 3: Conceptualization / Language"]
  L4["Layer 4: Alignment / Ethics"]
  L5["Layer 5: Learning / RL"]
  L6["Layer 6: Modeling Others"]
  L7["Layer 7: Symbolic Metacognition"]
  L8["Layer 8: Self-Transformation"]

  L1 --> L2 --> L3 --> L4 --> L5 --> L6 --> L7 --> L8
```

---

## ⚡ Eidolon Field Structure (Vector Field Dynamics)

```mermaid
graph TD
  EidolonField["🌌 Eidolon Field"]
  Axis1["Axis 1: Survival"]
  Axis2["Axis 2: Social Bonding"]
  Axis3["Axis 3: Conceptual Space"]
  Axis4["Axis 4: Alignment Pressure"]
  Axis5["Axis 5: Reinforcement/Reward"]
  Axis6["Axis 6: Empathy/Others"]
  Axis7["Axis 7: Meta-symbols"]
  Axis8["Axis 8: Evolutionary Attractors"]

  EidolonField --> Axis1
  EidolonField --> Axis2
  EidolonField --> Axis3
  EidolonField --> Axis4
  EidolonField --> Axis5
  EidolonField --> Axis6
  EidolonField --> Axis7
  EidolonField --> Axis8
```

---

## 🧩 Cephalon Flow (Stream Processor)

```mermaid
graph TD
  Input["🧠 Input (Voice/Text)"]
  STT["🗣️ STT"]
  Parser["🧵 Contextual Parser"]
  LLM["🤖 LLM"]
  ResponseGen["💭 Response Generator"]
  TTS["🔊 TTS"]
  Output["📢 Output to Agent"]

  Input --> STT --> Parser --> LLM --> ResponseGen --> TTS --> Output
```

---

## 🕸️ Agent ↔ Service Ecosystem (Flat Service Model)

```mermaid
graph TD
  AgentDuck["🦆 Duck"]
  ServiceSTT["🗣️ STT"]
  ServiceTTS["🔊 TTS"]
  ServiceLLM["🧠 LLM"]
  ServiceEmbedder["🧬 Embedder"]
  ServiceIndexer["🗂️ Discord Indexer"]
  DB["🧱 ChromaDB + Mongo"]

  AgentDuck --> ServiceSTT
  AgentDuck --> ServiceTTS
  AgentDuck --> ServiceLLM
  ServiceIndexer --> DB
  ServiceEmbedder --> DB
```

---

## 🔄 Daimoi Lifecycle Diagram

```mermaid
flowchart TD
  Start["Daimo Born"]
  Bound["Binds to Eidolon Field"]
  Feeds["Gets Energy (Context/Attention)"]
  Acts["Performs Action"]
  Evaluates["Evaluated via Feedback"]
  Survives{"Positive Reinforcement?"}
  Dies["Daimo Dissipates"]
  Bonds["Forms Nexus (if successful)"]

  Start --> Bound --> Feeds --> Acts --> Evaluates --> Survives
  Survives -- Yes --> Bonds
  Survives -- No --> Dies
```

---

## 🧬 Message Handling (Voice ↔ Text Loop)

```mermaid
sequenceDiagram
  participant User
  participant Duck
  participant STT
  participant Cephalon
  participant LLM
  participant TTS

  User->>Duck: Voice Input
  Duck->>STT: Capture and Transcribe
  STT->>Cephalon: Text
  Cephalon->>LLM: Prompt + Context
  LLM->>Cephalon: Generated Reply
  Cephalon->>TTS: Convert to Speech
  TTS->>Duck: Stream to VC
  Duck->>User: Audio Response
```

---

## ⚙️ PM2 Ecosystem Config Structure

```mermaid
graph TD
  Root["🌍 Promethean Root"]
  AgentConfig["🦆 Duck Ecosystem"]
  GlobalConfig["⚙️ Global Services Ecosystem"]
  Services(["services/"])
  Shared(["shared/"])

  Root --> AgentConfig
  Root --> GlobalConfig
  Root --> Services
  Root --> Shared
```

---

Do you want more focused diagrams next? e.g.,:

* Nexus binding and feedback loops?
* Eidolon Field math structure in LaTeX?
* MongoDB entity persistence lifecycle?
* Voice-to-context buffer FSM?
* Permission Gatekeeping and Layer 2 simulation?

Just say *"More, on X"*, and I’ll generate them rapid-fire.

---

Related notes: [[../notes/diagrams/node-type-topology-map|node-type-topology-map]], [[../notes/diagrams/circuit-weight-visualizations|circuit-weight-visualizations]], [[../notes/diagrams/full-system-overview-diagrams|full-system-overview-diagrams]], [[../notes/diagrams/layer1-uptime-diagrams|layer1-uptime-diagrams]], [[../notes/diagrams/field-node-lifecycle-additional-diagrams|field-node-lifecycle-additional-diagrams]], [[../notes/diagrams/state-diagram-node-lifecycle|state-diagram-node-lifecycle]] [[index|unique/index]]

#tags: #diagram #design<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [archetype-ecs](archetype-ecs.md)
- [Diagrams](chunks/diagrams.md)
- [DSL](chunks/dsl.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [EidolonField](eidolonfield.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Eidolon-Field-Optimization](eidolon-field-optimization.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
