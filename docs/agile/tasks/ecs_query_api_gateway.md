ECS Query API Gateway

Goal: Expose a small HTTP API for reading ECS-backed data (Mongo) for dashboards, agents, and tools.

Endpoints (examples):
- `GET /agents/:id/state` – AgentStateSnapshot
- `GET /conversations/:channelId/recent?limit=50` – ConversationLog
- `GET /turns/:id` – turn details and related messages

Exit Criteria:
- Service scaffolding + 2–3 endpoints with tests.

#ecs #api #mongo #accepted
