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
