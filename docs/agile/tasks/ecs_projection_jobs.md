---
uuid: "36eddbb2-91d6-4930-8ad8-4fdc004e6672"
title: "ecs projection jobs"
slug: "ecs_projection_jobs"
status: "incoming"
priority: "P3"
labels: ["ecs", "jobs", "projection", "projections"]
created_at: "2025-10-07T20:25:05.643Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
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
