---
uuid: "7495aea8-a866-4fae-b5b3-be0c40e72644"
title: "ecs persistence integration cephalon"
slug: "ecs_persistence_integration_cephalon"
status: "incoming"
priority: "P3"
labels: ["cephalon", "ecs", "integration", "persistence"]
created_at: "2025-10-11T19:22:57.817Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

ECS Persistence Integration: Cephalon

Goal: Wire Mongo-backed ECS adapter into Cephalon’s world so transcripts, utterances, and agent messages are persisted consistently.

Scope:
- Instantiate `MongoStorageAdapter` in `start-dialog.scope.ts` and pass into `createAgentWorld`.
- Persist on:
  - `TranscriptFinal` set
  - `Utterance` lifecycle queued → playing → done
  - Agent LLM reply arrival (`agent.llm.result`)
- Hydrate world on startup from Mongo for continuity.

Exit Criteria:
- Conversation flows produce Mongo upserts for components.
- On restart, context is reconstructed from persisted components.

#incoming #ecs #cephalon #mongo
