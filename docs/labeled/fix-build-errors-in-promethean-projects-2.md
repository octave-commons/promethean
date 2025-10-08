---
uuid: 1c2de889-ddba-4e7d-a458-003cfdb0e834
created_at: '2025-10-03T14:06:30Z'
title: 2025.10.03.14.06.30
filename: Fix build errors in Promethean projects
description: >-
  Build errors occurred in the Promethean projects when running the build
  targets for kanban and discord. The errors include TypeScript syntax issues
  and missing module dependencies that need to be resolved.
tags:
  - build
  - typescript
  - error
  - fix
  - promethean
  - kanban
  - discord
---
@codex fix build errors 
❌ > nx run @promethean/kanban:build
```
> tsc -b
```
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
  NX   Running target build for 94 projects failed

Tasks not run because their dependencies failed or --nx-bail=true:

- @promethean/mcp:build

Failed tasks:

- @promethean/kanban:build
- @promethean/discord:build
