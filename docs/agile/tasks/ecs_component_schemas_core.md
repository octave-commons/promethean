ECS Component Schemas (Core Conversation)

Goal: Define canonical ECS components (with JSON Schemas) for conversation and IO.

Components:
- Conversation entities: `UserMessage`, `AgentMessage`, `Turn`, `TranscriptFinal`, `Utterance`, `ContextWindow`.
- IO/state: `RawVAD`, `VAD`, `AudioRef`, `AudioRes`, `VisionFrame`, `VisionRing`, `Policy` (existing).
- LLM: `LLMRequest`, `LLMResult` (link to message/turn via ids).

Deliverables:
- `shared/ts/src/agent-ecs/schemas/*.json` for component schemas.
- Mapping doc: component → Mongo collection, indexes, retention policy.

Exit Criteria:
- Schemas published and referenced by adapter & services.

#ecs #schemas #conversation #accepted
