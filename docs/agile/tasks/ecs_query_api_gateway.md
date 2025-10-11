---
uuid: "e2059e9f-f2a2-4bc4-bcc7-eece59c16f88"
title: "ecs query api gateway"
slug: "ecs_query_api_gateway"
status: "incoming"
priority: "P3"
labels: ["ecs", "api", "query", "gateway"]
created_at: "2025-10-11T01:03:32.220Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
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

























