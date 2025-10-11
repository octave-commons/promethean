---
uuid: "0ed899b3-b815-4384-89ad-a1ff76d6a6e5"
title: "Shadow CLJS migration — step 3 application roll-out -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task"
slug: "shadow-cljs-migration-step-3-app-rollout"
status: "done"
priority: "P2"
labels: ["framework-core", "codex-task", "frontend"]
created_at: "2025-10-11T01:03:40.887Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---



























#Todo

## 🛠️ Description

Transition individual front-end applications from TypeScript builds to Shadow-CLJS using the shared component/macro library.

## Description
- **What changed?** After shared components ship, migrate each `packages/frontends/*` project to CLJS entry points with macro-generated HTML.
- **Where is the impact?** Application packages, build scripts, dev servers, asset output directories.
- **Why now?** Enables consistent tooling and template macros across the product surface.
- **Supporting context** Shadow-CLJS migration plan 2025-10-03.

## Goals
- Deliver parity builds for each app using Shadow-CLJS.
- Update package scripts and documentation to reference the new build pipeline.
- Validate dev server compatibility (e.g., Vite proxies).

## Requirements
- [ ] Each migrated app compiles via Shadow-CLJS.
- [ ] Local dev workflow documented and functioning.
- [ ] Legacy TypeScript build scripts retired once parity is confirmed.

## Subtasks
1. Prioritize candidate apps and outline dependencies.
2. Port entry points + configure outputs per app.
3. Update Nx/PNPM tasks for builds and watches.
4. Validate dev server integration.
5. Document migration per app.

Estimate: 8 (split per app as needed)

---

## 🔗 Related Epics

- [[kanban]]

---

## ⛓️ Blocked By

- Shadow CLJS migration — step 2 shared components

## ⛓️ Blocks

- Shadow CLJS migration — step 4 decommission legacy toolchain

---

## 🔍 Relevant Links

- Shadow-CLJS migration plan 2025-10-03


























