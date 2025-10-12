---
uuid: "4bf47f12-8489-46ea-bee4-ee5d826541e1"
title: "Setup MCP exec server from approved commands"
slug: "setup-mcp-exec-server"
status: "done"
priority: "P2"
labels: ["mcp", "tooling"]
created_at: "2025-10-11T19:23:08.661Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

#InProgress

## 🛠️ Description

- Provision an MCP server endpoint that exposes a safe exec tool constrained to a vetted command allowlist.

## Description
- **What changed?** Need to add an allowlisted exec tool and wire it into the MCP server catalog/configuration.
- **Where is the impact?** `@promethean/mcp` package plus root MCP configuration files.
- **Why now?** Enables codex clients to run deterministic shell pipelines without broad command execution rights.
- **Supporting context** `promethean.mcp.json` configuration, MCP tool registry docs.

## Goals
- Provide an `exec.run` MCP tool that only executes commands from a JSON allowlist.
- Expose the tool via HTTP endpoint so clients can call it.
- Cover parsing + execution behaviours with AVA tests.

## Requirements
- [x] test X passes: `pnpm --filter @promethean/mcp test`
- [x] doc Y updated: Update MCP configuration docs if necessary.
- [ ] PR merged: (link TBD)
- [x] Additional constraints or non-functional requirements are addressed: ensure timeout + output capture guardrails.

## Subtasks
1. Design command allowlist schema and loader.
2. Implement exec tool(s) leveraging allowlist.
3. Register tool(s) and update configuration + tests.

Estimate: 3

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

- `packages/mcp` module docs
