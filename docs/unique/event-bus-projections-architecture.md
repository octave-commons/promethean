---
uuid: cdb74242-b61d-4b7e-9288-5859e040e512
created_at: event-bus-projections-architecture.md
filename: Event Bus Projections Architecture
title: Event Bus Projections Architecture
description: >-
  This document outlines the architecture for event-driven systems using an
  event bus with projections. It includes publishers, event hubs, event stores,
  stream processing, and read models. The system handles event delivery, state
  management, and error recovery through mechanisms like outboxes, DLQs, and
  snapshots.
tags:
  - event bus
  - projections
  - event-driven architecture
  - stream processing
  - outbox
  - dlq
  - read models
  - event store
  - mongodb
  - cursor store
related_to_uuid:
  - cfa2be7b-13fd-404b-aaa4-80abc4fa8cd2
  - cdb74242-b61d-4b7e-9288-5859e040e512
  - 21d5cc09-b005-4ede-8f69-00b4b0794540
  - 41ce0216-f8cc-4eed-8d9a-fcc25be21425
  - cdf2c6e4-0dbd-4f19-b645-ac619a6f267d
  - 4127189a-e0ab-436f-8571-cc852b8e9add
  - 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
  - cbfe3513-6a4a-4d2e-915d-ddfab583b2de
  - 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - 2c00ce45-08cf-4b81-9883-6157f30b7fae
  - b362e12e-2802-4e41-9a21-6e0c7ad419a2
  - 80d4d883-59f9-401b-8699-7a2723148b1e
  - 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
  - 5becb573-0a78-486b-8d3c-199b3c7a79ec
  - b6ae7dfa-0c53-4eb9-aea8-65072b825bee
  - 871490c7-a050-429b-88b2-55dfeaa1f8d5
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - d2b3628c-6cad-4664-8551-94ef8280851d
  - 8b256935-02f6-4da2-a406-bf6b8415276f
  - 3abeaf12-5a59-45f1-80d8-82b031b84b96
related_to_title:
  - prompt-folder-bootstrap
  - Event Bus Projections Architecture
  - Exception Layer Analysis
  - refactor-relations
  - Unique Info Dump Index
  - layer-1-uptime-diagrams
  - Event Bus MVP
  - Lispy Macros with syntax-rules
  - Voice Access Layer Design
  - Local-Only-LLM-Workflow
  - Promethean Agent Config DSL
  - Ollama-LLM-Provider-for-Pseudo-Code-Transpiler
  - Refactor 05-footers.ts
  - State Snapshots API and Transactional Projector
  - Agent Reflections and Prompt Evolution
  - Ghostly Smoke Interference
  - Local-First Intention→Code Loop with Free Models
  - ecs-offload-workers
  - Language-Agnostic Mirror System
  - Chroma-Embedding-Refactor
  - sibilant-metacompiler
references:
  - uuid: cfa2be7b-13fd-404b-aaa4-80abc4fa8cd2
    line: 1
    col: 0
    score: 1
  - uuid: cfa2be7b-13fd-404b-aaa4-80abc4fa8cd2
    line: 3
    col: 0
    score: 1
  - uuid: cfa2be7b-13fd-404b-aaa4-80abc4fa8cd2
    line: 9
    col: 0
    score: 1
  - uuid: cfa2be7b-13fd-404b-aaa4-80abc4fa8cd2
    line: 15
    col: 0
    score: 1
  - uuid: cdb74242-b61d-4b7e-9288-5859e040e512
    line: 111
    col: 0
    score: 0.99
  - uuid: 21d5cc09-b005-4ede-8f69-00b4b0794540
    line: 63
    col: 0
    score: 0.88
  - uuid: 41ce0216-f8cc-4eed-8d9a-fcc25be21425
    line: 10
    col: 0
    score: 0.86
  - uuid: cdf2c6e4-0dbd-4f19-b645-ac619a6f267d
    line: 55
    col: 0
    score: 0.85
---
Note: Consolidated here → ../notes/diagrams/event-bus-projections-diagrams.md ^ref-cf6b9b17-1-0

Got you. Here are a few **Mermaid graphs** you can paste straight into your notes. ^ref-cf6b9b17-3-0

```mermaid
flowchart TB
  subgraph Publishers [Producers]
    SvcA[Service A]
    SvcB[Service B]
    OutboxA[(Mongo Outbox)]
    SvcA -->|tx + outbox.add| OutboxA
    OutboxA -->|drainer| PubAPI[Event Bus .publish()]
  end

  subgraph Gateway [Event Hub]
    WS[WS Gateway (AUTH/JWT + ACL + leases)]
    HTTP[HTTP /publish]
    PubAPI --> EB[(EventBus)]
    WS --> EB
    HTTP --> EB
  end

  EB --> ES[(EventStore - Mongo)]
  EB --> CS[(CursorStore - Mongo)]
  ES --- Ops[Ops Dashboard /cursors /lag]
  ES --- ReplayAPI[Replay / Export NDJSON]
  ES --- Metrics[Prometheus metrics]

  subgraph Processing [Stream Processing]
    Proj1[Process Projector: heartbeat→process.state]
    TxProj[Transactional Projector]
    Changelog[Changelog → Mongo 'processes']
    Compactor[Compactor → process.state.snapshot]
    Proj1 --> EB
    TxProj --> DB[(Mongo DB)]
    EB --> Proj1
    EB --> TxProj
    EB --> Compactor
    EB -->|dlq.* on fail| DLQ[[DLQ Topics]]
  end

  subgraph ReadModels [Read APIs]
    SnapColl[(processes snapshot)]
    SnapshotAPI[Snapshot API /snap/:key]
    Changefeed[Mongo Changefeed → processes.changed]
    DB --> SnapColl
    SnapColl --> SnapshotAPI
    Changefeed --> EB
  end
```
^ref-cf6b9b17-5-0 ^ref-cf6b9b17-51-0

---
 ^ref-cf6b9b17-54-0
```mermaid
flowchart LR
  HBR[heartbeat.received] --> PS[process.state (compaction, key=host:name:pid)]
  PS --> PSS[process.state.snapshot]
  PS --> CHG[Changelog → 'processes' collection]
  CHG --> SNAP[(processes)]
  SNAP --> API[Snapshot API]
  HBR -->|on handler error (N tries)| DLQ[dlq.heartbeat.received]
  DLQ -->|replay tool| HBR
^ref-cf6b9b17-54-0
```

--- ^ref-cf6b9b17-67-0

```mermaid
flowchart TB
  subgraph Partitions [Stateful Partitions (N=8)]
    P0((0)):::p
    P1((1)):::p
    P2((2)):::p
    P3((3)):::p
    P4((4)):::p
    P5((5)):::p
    P6((6)):::p
    P7((7)):::p
  end

  subgraph GroupG [Consumer Group "analyzers"]
    W1[worker-a]:::w
    W2[worker-b]:::w
    W3[worker-c]:::w
  end

  Coordinator[PartitionCoordinator\n(join/heartbeat/sweep/assign)]:::c

  Coordinator -->|rendezvous assign| W1
  Coordinator -->|rendezvous assign| W2
  Coordinator -->|rendezvous assign| W3

  P0 -.owned by.-> W1
  P1 -.owned by.-> W2
  P2 -.owned by.-> W3
  P3 -.owned by.-> W1
  P4 -.owned by.-> W2
  P5 -.owned by.-> W3
  P6 -.owned by.-> W1
  P7 -.owned by.-> W2

  classDef p fill:#eef,stroke:#88f;
  classDef w fill:#efe,stroke:#4a4;
^ref-cf6b9b17-67-0
  classDef c fill:#ffe,stroke:#aa4;
```
 ^ref-cf6b9b17-108-0
---

```mermaid
erDiagram
  EVENT ||--o{ CURSOR : advances
  EVENT ||--o{ DLQ : onFailure
  EVENT {
    string id PK
    string topic
    number ts
    string key
    json   payload
    json   headers
  }
  CURSOR {
    string id PK "topic::group"
    string topic
    string group
    string lastId
    number lastTs
  }
  OUTBOX ||--o{ EVENT : publishes
  OUTBOX {
    string _id PK
    string topic
    json   payload
    string status
    number lease_until
  }
  SNAPSHOT {
    string _key PK
    json   doc
    number _ts
^ref-cf6b9b17-108-0
    number _v ^ref-cf6b9b17-143-0
  }
``` ^ref-cf6b9b17-145-0
^ref-cf6b9b17-111-0
 ^ref-cf6b9b17-147-0
If you want this **as a single canvas**, say the word and I’ll stitch these into one big overview with legends + color keys.
   json   doc
    number _ts
^ref-cf6b9b17-108-0
    number _v ^ref-cf6b9b17-143-0
  }
``` ^ref-cf6b9b17-145-0
^ref-cf6b9b17-111-0
 ^ref-cf6b9b17-147-0
If you want this **as a single canvas**, say the word and I’ll stitch these into one big overview with legends + color keys.
