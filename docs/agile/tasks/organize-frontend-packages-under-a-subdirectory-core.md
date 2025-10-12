---
uuid: "2b28533b-0e70-4b18-80dc-1c8f96e24735"
title: "Organize frontend packages under a subdirectory -core"
slug: "organize-frontend-packages-under-a-subdirectory-core"
status: "done"
priority: "p3"
labels: ["framework-core", "refactor"]
created_at: "2025-10-11T19:22:57.823Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

#InProgress

## 🛠️ Description

- Track the incremental workspace reorganization requested during the frontend split discussion.

## Description
- **What changed?** Planning identified an initial slice to move obvious `-frontend` packages into a dedicated namespace while keeping other packages untouched.
- **Where is the impact?** Impacts the `packages/` workspace layout, Nx project declarations, and pnpm workspace discovery.
- **Why now?** Enables gradual cleanup of the crowded `packages/` folder and establishes a repeatable pattern for future moves.
- **Supporting context** Prior conversation outlining the phased migration approach.

## Goals
- Ensure pnpm and Nx resolve packages nested under `packages/frontends/`.
- Relocate the existing `-frontend` packages without breaking their build/lint commands.
- Capture follow-up tasks for splitting out backends, libraries, and tooling packages.

## Requirements
- [ ] pnpm can still discover and install workspace packages after the move.
- [ ] Nx targets for relocated frontends run from their new paths.
- [ ] Update documentation with the planned future iterations.
- [ ] Record the follow-up tasks needed for the remaining packages.

## Subtasks
1. Update workspace discovery settings (pnpm, Nx) to account for nested folders.
2. Move the `-frontend` packages into `packages/frontends/` and adjust their configuration.
3. Validate builds/lints for the moved packages and document future slices.

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

- Pending PR once work is complete.
