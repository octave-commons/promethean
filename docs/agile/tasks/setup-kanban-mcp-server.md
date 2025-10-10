---
uuid: "936b26de-61b4-4d8d-94d7-171315a56ac9"
title: "Setup MCP server endpoint for kanban tooling"
slug: "setup-kanban-mcp-server"
status: "ready"
priority: "P2"
tags: ["mcp", "kanban", "automation"]
created_at: "2025-10-10T03:23:55.970Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---







#InProgress
#Ready

## 🛠️ Description

- Wire the unified MCP server to expose tooling from the `@promethean/kanban` package.
- Ensure the HTTP transport serves a `/kanban` endpoint with the full toolset needed for board management.
- Provide regression tests around the kanban MCP adapters so future refactors stay safe.

## Description

- **What changed?** We need to expose kanban board automation through the MCP service instead of ad-hoc CLI scripts.
- **Where is the impact?** Changes land in `packages/mcp` plus the shared `promethean.mcp.json` config that powers tooling.
- **Why now?** Kanban automation is required for Codex Cloud agent workflows and should be accessible over MCP.
- **Supporting context** `packages/mcp/src/index.ts`, `packages/mcp/src/tools`, `@promethean/kanban` library exports.

## Goals

- Deliver kanban-aware MCP tools for listing, searching, and updating board tasks.
- Update configuration/documentation so the new endpoint is discoverable.
- Cover the adapters with AVA tests exercising read/write flows against sample boards.

## Requirements

- [ ] test X passes: Ensure `pnpm --filter @promethean/mcp test` succeeds locally.
- [ ] doc Y updated: Document the new kanban MCP tools in `packages/mcp/README.md`.
- [ ] PR merged: (link to the PR) summarizing the MCP kanban endpoint work.
- [ ] Additional constraints or non-functional requirements are addressed: Keep implementation functional and avoid shared mutable state in tool factories.

## Subtasks

1. Design tool factories that wrap `@promethean/kanban` helpers with MCP schemas.
2. Extend the MCP config/registry so the kanban endpoint is reachable over HTTP.
3. Backfill tests covering get/update/search flows with temporary board fixtures.

Estimate: 3 (Fibonacci).

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

- `packages/mcp/src/tools/kanban.ts`
- `promethean.mcp.json`

## 🔄 Related PRs & Issues

- **Issue #1640:** Setup MCP server endpoint for kanban tooling (GitHub issue tracking this task)
- **PR #1655:** "fix: guard MCP JSON adapter against nil server specs" - Related MCP infrastructure work that supports kanban MCP endpoint stability






