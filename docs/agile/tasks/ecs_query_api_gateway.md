---
$$
uuid: e2059e9f-f2a2-4bc4-bcc7-eece59c16f88
$$
title: ecs query api gateway
status: todo
priority: P3
labels: []
$$
created_at: '2025-09-15T02:02:58.512Z'
$$
---
ECS Query API Gateway

Goal: Expose a small HTTP API for reading ECS-backed data (Mongo) for dashboards, agents, and tools.

Endpoints (examples):
- `GET /agents/:id/state` – AgentStateSnapshot
- `GET /conversations/:channelId/recent?limit=50` – ConversationLog
- `GET /turns/:id` – turn details and related messages

Exit Criteria:
- Service scaffolding + 2–3 endpoints with tests.

#incoming #ecs #api #mongo

