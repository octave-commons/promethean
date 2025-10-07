---
task-id: TASK-20240705-mcp-http
title: Refactor MCP package for multi-endpoint HTTP transport
state: InProgress
prev: null
$$
txn: '2024-07-05T00:00:00Z-0000'
$$
owner: err
priority: p3
size: s
$$
epic: EPC-000
$$
$$
depends_on: []
$$
labels:
  - 'board:auto'
  - 'lang:ts'
  - 'package:@promethean/mcp'
due: null
links: []
artifacts: []
$$
rationale: >-
$$
  Allow a single MCP package to expose multiple HTTP endpoints configured via
  promethean.mcp.json.
$$
proposed_transitions:
$$
  - New->Accepted
  - Accepted->Breakdown
  - Breakdown->Ready
  - Ready->Todo
  - Todo->InProgress
  - InProgress->InReview
  - InReview->Done
  - Done->Archive
  - InProgress->Todo
  - Todo->Breakdown
  - Breakdown->Archive
tags:
  - task/TASK-20240705-mcp-http
  - board/kanban
  - state/InProgress
  - owner/err
  - priority/p3
  - epic/EPC-000
$$
uuid: 121c9492-1226-4dae-b654-f39cdfe2364f
$$
$$
created_at: '2025-10-06T01:50:48.296Z'
$$
status: todo
---
## Context
- **What changed?**: Need to extend MCP transport loader to support multiple HTTP endpoints from config.
- **Where?**: `packages/mcp`
- **Why now?**: Enables testing different MCP tool sets while sharing one package build.

## Inputs / Artifacts
- `promethean.mcp.json`

## Definition of Done
- [ ] Config schema accepts endpoint map for HTTP transports.
- [ ] MCP HTTP server registers each configured endpoint with its toolset.
- [ ] Tests cover multi-endpoint configuration.
- [ ] Documentation updated if needed.

## Plan
1. Inspect current MCP package configuration parsing.
2. Update configuration types and loader to accept `endpoints` map.
3. Adjust HTTP server composition to register multiple routers.
4. Add tests verifying configuration and runtime wiring.


