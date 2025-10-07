---
```
uuid: 5fe4fdf3-0fda-42fb-8f98-93859577d08f
```
title: Shadow CLJS migration — step 4 decommission legacy toolchain
status: icebox
priority: P3
labels:
  - framework-core
  - codex-task
  - frontend
```
created_at: '2025-10-03T21:10:00.000Z'
```
---
#IceBox

## 🛠️ Description

Retire legacy TypeScript/Vite build paths and finalize documentation once all front-ends rely on Shadow-CLJS.

## Description
- **What changed?** Remove redundant configs, scripts, and docs once CLJS builds cover all browser bundles.
- **Where is the impact?** Package scripts, CI pipelines, documentation, tooling dependencies.
- **Why now?** Avoids duplicate build systems and keeps repo maintainable.
- **Supporting context** Final step of Shadow-CLJS migration plan 2025-10-03.

## Goals
- Delete unused TS build configs and scripts.
- Update documentation to make Shadow-CLJS the default front-end workflow.
- Ensure CI reflects the simplified pipeline.

## Requirements
- [ ] All packages confirmed on Shadow-CLJS builds.
- [ ] CI updated and green without legacy steps.
- [ ] Docs refreshed.

## Subtasks
1. Audit repo for obsolete TS/Vite scripts.
2. Remove redundant configs and dependencies.
3. Update docs and onboarding guides.
```
4. Verify CI/test coverage.
```
Estimate: 5

---

## 🔗 Related Epics

- [[kanban]]

---

## ⛓️ Blocked By

- Shadow CLJS migration — step 3 application roll-out

## ⛓️ Blocks

- None

---

## 🔍 Relevant Links

- Shadow-CLJS migration plan 2025-10-03
