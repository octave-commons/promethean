---
uuid: "7bf846df-951a-4202-b3a2-078fd37328c9"
title: "Makefile automation audit → pnpm workflow shift"
slug: "makefile-automation-audit-pnpm-workflow-shift"
status: "incoming"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-12T02:22:05.425Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---









































































































## 🗂 Source

- Path: docs/labeled/2025.09.30.20.07.29.md

## 📝 Context Summary

# Makefile automation audit → pnpm workflow shift

## Summary
- Audited task backlog and board exports referencing `Makefile`/`Makefile.hy`.
- Confirmed no active automation depends on the legacy Makefile stack; pnpm + `scripts/dev.mjs` already cover dev workflows.
- Re-scoped backlog items to focus on pnpm workspace scripts and documentation instead of resurrecting Makefile targets.

## Impacted tasks
- `replace agent automation makefile targets with pnpm scripts`
- `audit makefile.hy remnants and confirm deprecation`
- `update github actions automation to pnpm scripts`
- `replace polyglot makefile with pnpm-first workflow docs`

## Follow-ups
- Update README/onboarding docs to describe pnpm-first workflows.
- Ensure CI pipelines adopt pnpm scripts before closing related tasks.
- Continue cataloging any lingering references to `Makefile.hy` during routine docs updates.

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs








































































































