---
uuid: 16cd2d98-3b2e-44c7-a06c-f4b92b8ccc2d
created_at: '2025-09-30T20:07:29Z'
title: 2025.09.30.20.07.29
filename: pnpm-workflow-shift
description: >-
  Audit of legacy Makefile automation and transition to pnpm scripts for dev
  workflows. Confirmed no active dependencies on Makefile stack, re-scoped
  backlog to focus on pnpm workspace scripts and documentation updates. Ensures
  CI pipelines adopt pnpm scripts before closing related tasks.
tags:
  - automation
  - pnpm
  - makefile
  - dev-workflows
  - ci-cd
  - workflow-shift
  - documentation
  - backlog
---
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
