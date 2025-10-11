---
uuid: "2d7bc869-0bc6-4d6b-891c-d7657cb8e4f4"
title: "Shadow CLJS migration — step 2 shared components -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task -core -task"
slug: "shadow-cljs-migration-step-2-shared-components"
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

Port shared UI web components to the new ClojureScript tooling and publish them for downstream packages.

## Description
- **What changed?** After the foundational configuration lands, migrate `@promethean/ui-components` and `sites/components/` to CLJS with HTML macros.
- **Where is the impact?** UI component packages, shared component registry, build outputs consumed by front-end apps.
- **Why now?** Provides a validated component set before application-specific migrations.
- **Supporting context** Continuation of Shadow-CLJS migration plan 2025-10-03.

## Goals
- Reimplement core web components in CLJS using macro helpers.
- Ensure published artefacts remain import-compatible for existing consumers.
- Validate builds/tests for updated packages.

## Requirements
- [ ] CLJS components compile and register correctly.
- [ ] Downstream packages confirmed to work with new outputs.
- [ ] Documentation updated to reflect new source of truth.

## Subtasks
1. Audit current component exports and templates.
2. Port modules to CLJS with macros.
3. Update build scripts and package exports.
```
4. Smoke-test consuming packages.
```
5. Document migration.

Estimate: 5

---

## 🔗 Related Epics

- [[kanban]]

---

## ⛓️ Blocked By

- Shadow CLJS migration — step 1 foundation

## ⛓️ Blocks

- Shadow CLJS migration — step 3 application roll-out

---

## 🔍 Relevant Links

- Shadow-CLJS migration plan 2025-10-03


























