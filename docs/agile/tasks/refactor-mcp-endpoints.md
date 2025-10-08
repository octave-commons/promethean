---
uuid: "121c9492-1226-4dae-b654-f39cdfe2364f"
title: "Refactor MCP package for multi-endpoint HTTP transport /TASK-20240705-mcp-http /kanban /InProgress /err /p3 /EPC-000 :auto :ts :@promethean/mcp"
slug: "refactor-mcp-endpoints"
status: "review"
priority: "p3"
labels: ["task", "board", "state", "owner", "priority", "epic", "board", "lang", "package"]
created_at: "2025-10-07T20:25:05.643Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
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




