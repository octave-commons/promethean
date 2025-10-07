---
```
uuid: 36eddbb2-91d6-4930-8ad8-4fdc004e6672
```
title: ecs projection jobs
status: todo
priority: P3
labels: []
```
created_at: '2025-09-15T02:02:58.512Z'
```
---
ECS Projections and Compaction Jobs

Goal: Add background jobs to project ECS component state into query-friendly collections and compact time-series.

Projections:
- `ConversationLog`: denormalized stream of user/agent messages by channel/user.
- `AgentStateSnapshot`: current turn, speaking status, last VAD, last utterance.

Compaction:
- TTL or bucketed retention for high-churn components (VAD, RawVAD).
- Periodic snapshots to reduce read amplification.

Exit Criteria:
- Scripts/processes under `services/ts/cephalon/scripts/` or a shared service.
- Verified indexes and query latencies.

#incoming #ecs #projections #compaction

