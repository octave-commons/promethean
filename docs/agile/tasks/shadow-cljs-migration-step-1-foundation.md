---
uuid: "7a1a45fb-51d3-4d7b-b143-3834cf8aad3c"
title: "Shadow CLJS migration — step 1 foundation -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task"
slug: "shadow-cljs-migration-step-1-foundation"
status: "in_progress"
priority: "P2"
tags: ["framework-core", "codex-task", "frontend"]
created_at: "2025-10-10T03:23:55.970Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---







#InProgress

## 🛠️ Description

Lay the groundwork for compiling Promethean browser bundles with Shadow-CLJS so that future slices can migrate shared UI components and app front-ends.

## Description
- **What changed?** Need to introduce multi-target browser builds in `shadow-cljs.edn`, wiring Nx/PNPM scripts and setting up a shared CLJS utilities package.
- **Where is the impact?** `shadow-cljs.edn`, new helper library under `packages/`, CI scripts that call build/watch commands, and developer docs.
- **Why now?** Unlocks the migration plan requested by the user; without the shared configuration the later steps cannot proceed.
- **Supporting context** Derived from agent proposal 2025-10-03 session for Shadow-CLJS migration.

## Goals
- Define initial browser build entries in `shadow-cljs.edn` mirroring existing TS outputs.
- Scaffold a shared `packages/shadow-ui` (or similar) with HTML macro placeholders.
- Provide PNPM/Nx scripts to build/watch the new Shadow targets.
- Document usage in repository docs so contributors understand the workflow.

## Requirements
- [ ] shadow-cljs builds succeed locally for the new targets.
- [ ] pnpm scripts updated and documented.
- [ ] Added docs live in repo `docs/` or package README.
- [ ] Tests/builds updated for touched packages.

## Subtasks
1. Inventory existing frontend packages and desired output dirs.
2. Expand `shadow-cljs.edn` with browser build configs.
3. Create shared CLJS macro/util package scaffold.
4. Update scripts/docs for new workflow.
5. Verify builds.

Estimate: 5

---

## 🔗 Related Epics

- [[kanban]]

---

## ⛓️ Blocked By

- None

## ⛓️ Blocks

- Shadow CLJS migration — step 2 shared components (pending)

---

## 🔍 Relevant Links

- Shadow-CLJS migration plan 2025-10-03

## Notes
- 2025-10-03: Initial Shadow-CLJS scaffolding committed (build targets, scripts, shared package).
- 2025-10-03: `shadow-cljs release` invocation blocked by Maven network access in sandbox; see session logs.






