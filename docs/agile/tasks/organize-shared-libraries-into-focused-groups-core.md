---
uuid: "42feae0b-46f6-4580-b9bf-071720c0dc79"
title: "Organize shared libraries into focused groups -core"
slug: "organize-shared-libraries-into-focused-groups-core"
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

- Plan the third wave of the package reorg, splitting general-purpose libraries into `packages/libs/runtime/` and `packages/libs/domain/` (or similar) buckets.

## Description
- **What changed?** Frontends moved to `packages/frontends/`, and services are queued for a dedicated namespace.
- **Where is the impact?** Applies to reusable modules that currently sit at `packages/*` but are neither frontends nor deployable services.
- **Why now?** Keeps the `packages/` root from regrowing into an unmanageable mix after the initial clean-up.
- **Supporting context** Continuation of the multi-stage workspace organization effort.

## Goals
- Define criteria distinguishing runtime utilities from domain-specific modules.
- Draft the folder hierarchy for library subgroups and confirm with stakeholders.
- Enumerate packages that will move in each subgroup.

## Requirements
- [ ] Publish a proposal for the library taxonomy.
- [ ] Update workspace discovery paths once structure is agreed.
- [ ] Prepare migration notes and acceptance tests for affected packages.
- [ ] Ensure documentation reflects the new layout.

## Subtasks
1. Audit current library packages and classify them into runtime vs. domain.
2. Validate the taxonomy with maintainers and capture acceptance notes.
3. Stage the move plan and identify automation/documentation updates needed.

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

- Pending proposal.
