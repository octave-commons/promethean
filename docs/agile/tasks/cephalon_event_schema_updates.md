---
uuid: "6840269b-1415-4ae0-90b5-5d520b6a88a8"
title: "cephalon event schema updates"
slug: "cephalon_event_schema_updates"
status: "incoming"
priority: "P3"
labels: ["agent", "cephalon", "event", "schema"]
created_at: "2025-10-11T19:22:57.817Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

Cephalon: Event schema updates for speech pipeline

Goal: Define/align event topics and payloads for transcript and utterance lifecycle to make downstream processing consistent.

Why: We publish `agent.transcript.final` and consume `agent.llm.result` but lack standardized schemas. Add versions in `bridge/events/`.

Scope:
- Add/extend specs in `bridge/events/events.md` and `events.json` for:
  - `agent.transcript.final.v1`
  - `agent.utterance.started.v1` / `agent.utterance.finished.v1`
  - `agent.llm.result.v1`
- Include fields: `turnId`, `ts`, `text`, `channelId`, `userId`, `utteranceId`.

Exit Criteria:
- Schemas documented and referenced by publishers/subscribers.

#incoming #cephalon #events #schemas
