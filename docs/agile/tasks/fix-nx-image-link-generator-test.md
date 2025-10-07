---
uuid: "ac42755d-b90e-4d8d-bb16-46bc251fc210"
title: "Fix nx task @promethean/image-link-generator:test"
slug: "fix-nx-image-link-generator-test"
status: "review"
priority: "P2"
labels: ["image", "link", "generator", "test"]
created_at: "2025-10-07T20:25:05.643Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---


# In Review

## 🛠️ Description

- Address failures when running the Nx target `@promethean/image-link-generator:test`.
- Ensure the package's test runner executes successfully from a clean checkout.

## Description
- **What changed?** Identified flaky or failing tests in the image-link-generator package; need to adjust implementation or test configuration so the nx task passes consistently.
- **Where is the impact?** `packages/image-link-generator` package and any utilities it depends on.
- **Why now?** The user requested the Nx test task be fixed so CI can succeed.
- **Supporting context** (See repo history and Nx target configuration.)

## Goals
- Nx test command completes without error for `@promethean/image-link-generator`.
- Any updated logic remains covered by tests and linting with no regressions.

## Requirements
- [x] `pnpm nx test @promethean/image-link-generator` passes locally. 2025-10-06
- [ ] Update documentation or changelog if behavior changes.
- [ ] PR merged.
- [ ] Additional constraints or non-functional requirements are addressed: follow repo coding standards and keep ESLint clean.

## Subtasks
1. Reproduce the current test failure and capture logs.
2. Identify the root cause and implement fix within package scope.
3. Add or update tests to cover the corrected behavior.

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

- Link to supporting docs or references.


