---
$$
uuid: 911d511f-7f6d-4f01-86c0-5129765a3f8f
$$
title: Group tooling and CLI packages
status: todo
priority: p3
$$
labels: ["framework-core", "refactor"]
$$
$$
created_at: '2025-09-27T00:14:00.000Z'
$$
---
#Todo

## 🛠️ Description

- Capture the follow-up slice for isolating CLI and operational tooling packages under `packages/tools/` (or similar).

## Description
- **What changed?** The frontend reorg established the pattern for nested namespaces and highlighted the need to cluster CLIs separately from runtime libraries.
- **Where is the impact?** Applies to packages that publish binaries or automation scripts $`promethean-cli`, `kanban-cli`, `pm2-helpers`, etc.$.
- **Why now?** Keeps operational tooling discoverable and enables targeted CI/test pipelines.
- **Supporting context** Builds on the staged refactor plan agreed in the earlier discussion.

## Goals
- Define inclusion criteria for tooling vs. libraries.
- Outline new folder structure $e.g., `packages/tools/cli`, `packages/tools/ops`$.
- Note required updates to release docs and automation scripts.

## Requirements
- [ ] Inventory CLI/tooling packages with owners and release processes.
- [ ] Draft migration plan with acceptance criteria.
- [ ] Ensure Nx/pnpm configs support additional nested directories.
- [ ] Document guidelines for new tooling packages.

## Subtasks
1. Audit packages exposing `bin` entries or CLI commands.
2. Validate proposed structure with maintainers and capture follow-up actions.
3. Stage documentation and automation updates before moving packages.

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

- Pending analysis.
