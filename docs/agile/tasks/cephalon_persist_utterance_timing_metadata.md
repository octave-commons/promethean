---
uuid: "03a056bc-c24c-472b-b75a-0b817f370cb7"
title: "cephalon persist utterance timing metadata"
slug: "cephalon_persist_utterance_timing_metadata"
status: "incoming"
priority: "P3"
labels: ["utterance", "timing", "metadata", "cephalon"]
created_at: "2025-10-11T01:03:32.220Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---


























Cephalon: Persist utterance timing metadata

Goal: Record `startTime` and `endTime` for agent utterances to support turn-taking analytics and better context windows.

Why: We currently store only text in `agent_messages` when using classic path; ECS path stores nothing. Add consistent timing metadata.

Scope:
- Emit a local event when utterance playback starts and ends ECS audio player hook exists in `start-dialog.scope.ts`.
- On start: record `startTime` store provisional doc with `endTime` null or buffer until end.
- On end: upsert the doc (match by an utterance id) to set `endTime`.

Exit Criteria:
- Each agent utterance in `agent_messages` includes `{ startTime, endTime }`.
- Test that simulates playback hooks and asserts DB update.
```
#incoming #cephalon #timing #agent_messages
```

























