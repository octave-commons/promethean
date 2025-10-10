---
uuid: "af127b29-3031-4f13-a82b-7d7042581e35"
title: "ecs component schemas core"
slug: "ecs_component_schemas_core"
status: "incoming"
priority: "P3"
tags: ["schemas", "ecs", "component", "core"]
created_at: "2025-10-10T03:23:55.969Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---







ECS Component Schemas (Core Conversation)

Goal: Define canonical ECS components (with JSON Schemas) for conversation and IO.

Components:
- Conversation entities: `UserMessage`, `AgentMessage`, `Turn`, `TranscriptFinal`, `Utterance`, `ContextWindow`.
- IO/state: `RawVAD`, `VAD`, `AudioRef`, `AudioRes`, `VisionFrame`, `VisionRing`, `Policy` (existing).
- LLM: `LLMRequest`, `LLMResult` link to message/turn via ids.

Deliverables:
- `shared/ts/src/agent-ecs/schemas/*.json` for component schemas.
- Mapping doc: component → Mongo collection, indexes, retention policy.

Exit Criteria:
- Schemas published and referenced by adapter & services.

#incoming #ecs #schemas #conversation






