---
```
uuid: 1b910444-6b1e-4bb3-99a1-e926e9f76a4d
```
```
created_at: '2025-10-03T14:06:30Z'
```
title: 2025.10.03.14.06.30
filename: Fix build errors in Promethean projects
```
description: >-
```
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
```
related_to_uuid: []
```
```
related_to_title: []
```
references: []
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
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- _None_
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
