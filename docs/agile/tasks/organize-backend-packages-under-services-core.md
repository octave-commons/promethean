---
uuid: "90c25667-5a2b-4c8c-9d40-5b03e54675f2"
title: "Organize backend packages under services -core"
slug: "organize-backend-packages-under-services-core"
status: "done"
priority: "p3"
labels: ["framework-core", "refactor"]
created_at: "2025-10-11T19:22:57.823Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

#Todo

## 🛠️ Description

- Track the second wave of the package reorg, relocating service and backend-oriented workspaces into a `packages/services/` namespace.

## Description
- **What changed?** Frontend packages now live in `packages/frontends/`, enabling a similar grouping for API and worker services.
- **Where is the impact?** Applies to packages that expose Fastify or worker processes e.g., `auth-service`, `broker`, `webcrawler-service`.
- **Why now?** Aligns service code to a predictable path ahead of deployment automation updates.
- **Supporting context** Follow-on slice from the frontend reorganization.

## Goals
- Inventory candidates for the services group with acceptance notes.
- Update Nx and pnpm discovery to account for `packages/services/*`.
- Adjust deployment scripts and docs referencing the old paths.

## Requirements
- [ ] Confirm service list and capture acceptance criteria.
- [ ] Update workspace config and project files for moved services.
- [ ] Validate builds/lints for the relocated packages.
- [ ] Document migration notes.

## Subtasks
1. Collect a definitive list of service packages and categorize their runtimes.
2. Draft migration steps and update scripts/configs accordingly.
3. Execute the moves and regression test the builds.

Estimate: 5

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

- Pending implementation notes.
