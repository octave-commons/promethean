---
uuid: "72027fb4-71c0-4c0c-bc91-bb569da6edf3"
title: "fix-build-errors-in-promethean-projects"
slug: "fix-build-errors-in-promethean-projects"
status: "incoming"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-08T20:10:46.028Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🗂 Source

- Path: docs/labeled/fix-build-errors-in-promethean-projects.md

## 📝 Context Summary

---

title: 2025.10.03.14.06.30
filename: Fix build errors in Promethean projects

  Build failures occurred in the kanban and discord projects due to TypeScript
  errors and missing dependencies. The kanban project has syntax errors in
  sync.ts while the discord project lacks the 'csv-parse/sync' module.
tags:
  - typescript
  - build
  - error
  - dependency
  - kanban
  - discord

references: []
---
@codex fix build errors 
❌ > nx run @promethean/kanban:build

  Error: src/process/sync.ts(57,13): error TS1002: Unterminated string literal.
  Error: src/process/sync.ts(58,1): error TS1005: ',' expected.
  Error: src/process/sync.ts(58,4): error TS1002: Unterminated string literal.
  Error: src/process/sync.ts(59,5): error TS1005: ',' expected.
  Error: src/process/sync.ts(59,39): error TS1005: ')' expected.
❌ > nx run @promethean/discord:build
  
  > pnpm run build
  
  
  > @promethean/discord@0.0.1 build /home/runner/work/promethean/promethean/packages/discord
  > tsc
  
  Error: src/automod/automod.ts(13,23): error TS2307: Cannot find module 'csv-parse/sync' or its corresponding type declarations.
   ELIFECYCLE  Command failed with exit code 2.
  NX   Running target build for 

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs
