---
uuid: "8b52c0aa-1f68-4db1-bd4e-612c7c9f853c"
title: "Create MCP tool for Nx package scaffolding"
slug: "create-nx-package-mcp-tool"
status: "done"
priority: "P3"
labels: ["mcp", "package", "tool", "create"]
created_at: "2025-10-07T20:25:05.644Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🛠️ Description

Add an MCP tool that runs the workspace Nx package generator so agents can scaffold new packages consistently with repository presets.

---

## 🎯 Goals

- Allow MCP clients to create new packages by calling the existing Nx generator.
- Support preset selection that maps to repository package templates.
- Provide dry-run support so agents can preview the scaffold when needed.

---

## 📦 Requirements

- [x] Implement an MCP tool that executes the Nx package generator with name and preset inputs.
- [x] Accept human-friendly preset aliases (library, service, frontend) that map to generator presets.
- [x] Return stdout/stderr and exit information so agents can audit generator runs.
- [x] Cover the new tool with unit tests.
- [x] Document the tool in package change notes.

---

## 📋 Subtasks

- [x] Define schema validation and preset normalization for the tool input.
- [x] Implement command execution via pnpm exec nx.
- [x] Add AVA tests for argument construction and alias mapping.
- [x] Register the tool with the MCP server registry.
- [x] Add changelog entry summarizing the tool.

---

## 🔗 Related Epics
```
#framework-core
```
---

## ⛓️ Blocked By

Nothing

## ⛓️ Blocks

Nothing

---

## 🔍 Relevant Links

- [[kanban]]
- tools/generators/package/README.md
- packages/mcp/src/tools/pnpm.ts

## Notes
- Story Points: 3

#done
