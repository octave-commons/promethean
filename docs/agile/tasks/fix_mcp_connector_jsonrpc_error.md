---
uuid: "0a7d5411-0f71-4ff7-9034-53fba46c1e8f"
title: "Fix MCP github_request connector JSON-RPC schema error"
slug: "fix_mcp_connector_jsonrpc_error"
status: "done"
priority: "P2"
labels: ["bug", "connectors", "mcp"]
created_at: "2025-10-11T19:22:57.822Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---




#InProgress

## 🛠️ Description

- Users calling the `github_request` MCP connector hit JSON-RPC `-32602` errors complaining about missing structured content despite valid tool responses.
- Goal is to diagnose schema handling for tool responses so connectors receive properly structured payloads.

## Description
- **What changed?** Connectors began returning errors when tools with declared output schemas emit primitive payloads instead of full objects.
- **Where is the impact?** MCP server package (`packages/mcp`), specifically the HTTP tool execution path and schema validation pipeline.
- **Why now?** ChatGPT clients are blocked from using repository connectors, preventing code review and PR automation.
- **Supporting context** logs from failing call: `MCP error -32602: Tool github_request has an output schema but no structured content was provided`.

## Goals
- Eliminate JSON-RPC `-32602` errors for tools that produce structured outputs.
- Add regression coverage demonstrating successful responses when payloads satisfy declared schemas.

## Requirements
- [ ] tests cover a tool returning structured JSON via the HTTP transport without errors.
- [ ] documentation for MCP connectors updated if behavior changes.
- [ ] PR merged: (link TBD).
- [ ] Additional constraints or non-functional requirements are addressed: maintain backward compatibility for existing clients.

## Subtasks
1. Reproduce connector failure via unit or integration test.
2. Correct schema validation/encoding logic to accept proper tool outputs.
3. Write regression test for the fixed path.
4. Update docs/changelog as needed.

Estimate: 3

## Session Notes (2025-10-09)
- Planned fix: normalize `structuredContent` emitted by `createMcpServer` so JSON serialization always includes it, even when the
  tool returns `undefined` or other falsy primitives.
- Add regression test that exercises a tool returning a falsy primitive with an output schema to mirror the connector failure.
- Verify Fastify transport continues to surface `structuredContent` through the HTTP proxy.

---

## 🔗 Related Epics

- [[kanban]]

---

## ⛓️ Blocked By

- None

## ⛓️ Blocks

- None

---

## 🔍 Relevant Links

- Error snippet: `MCP error -32602: Tool github_request has an output schema but no structured content was provided`.



