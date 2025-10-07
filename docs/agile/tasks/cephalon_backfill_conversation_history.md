---
```
uuid: a31bb3f1-3b68-483a-8280-e78386abf03b
```
title: cephalon backfill conversation history
status: ready
priority: P2
labels: []
```
created_at: '2025-09-15T02:02:58.509Z'
```
---
Cephalon: Backfill conversation history (optional)

Goal: Migrate recent logs/outputs into `transcripts` and `agent_messages` to seed context for active users.

Why: After restoring persistence, agents may still loop until enough new context accumulates.

Scope:
- Define a simple script to scan recent Discord messages and TTS logs (if available) to backfill collections.
- Idempotent: avoid duplicates by keying on timestamps and message IDs.

Exit Criteria:
- Backfill script present in `services/ts/cephalon/scripts/` and documented; safe to run.

#incoming #cephalon #backfill #context

Notes:
- History gap remains the top follow-up; schedule this slice immediately once active feature work pauses so persistence catches up.

