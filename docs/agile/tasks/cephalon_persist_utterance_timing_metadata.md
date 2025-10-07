---
uuid: 03a056bc-c24c-472b-b75a-0b817f370cb7
title: cephalon persist utterance timing metadata
status: todo
priority: P3
labels: []
created_at: '2025-09-15T02:02:58.509Z'
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
