---
```
uuid: 0710bcba-3a0f-4c33-9c83-7f6e858d8d32
```
title: cephalon store user transcripts unified
status: todo
priority: P3
labels: []
```
created_at: '2025-09-15T02:02:58.509Z'
```
---
Cephalon: Store user transcripts via a unified handler

Goal: Centralize transcript persistence for user speech in one path used by both `join-voice` and `start-dialog` flows.

Why: Transcript storage currently wired in `join-voice.scope.ts` but not in the ECS `start-dialog` orchestration beyond bus publish. Unify to avoid regressions.

Scope:
- Extract a helper `persistTranscript(bot, transcript)` and call it from both `join-voice` and `start-dialog` transcriptEnd listeners.
- Ensure consistent metadata: `{ userId, userName, channel, recipient, is_transcript: true }` plus timing.

Exit Criteria:
- User transcripts reliably stored in `transcripts` for both flows.
- Test exercising both scopes with a fake transcript and asserting Mongo insert.

#incoming #cephalon #transcripts #persistence

