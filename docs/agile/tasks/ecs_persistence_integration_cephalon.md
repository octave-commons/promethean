ECS Persistence Integration: Cephalon

Goal: Wire Mongo-backed ECS adapter into Cephalon’s world so transcripts, utterances, and agent messages are persisted consistently.

Scope:
- Instantiate `MongoStorageAdapter` in `start-dialog.scope.ts` and pass into `createAgentWorld`.
- Persist on:
  - `TranscriptFinal` set
  - `Utterance` lifecycle (queued → playing → done)
  - Agent LLM reply arrival (`agent.llm.result`)
- Hydrate world on startup from Mongo for continuity.

Exit Criteria:
- Conversation flows produce Mongo upserts for components.
- On restart, context is reconstructed from persisted components.

#incoming #ecs #cephalon #mongo
