---
uuid: "2b11548c-942d-4ea7-a692-bf97ec39dc74"
title: "Fix DS package missing dependencies causing build failures -system -package"
slug: "fix-ds-package-dependencies 10"
status: "todo"
priority: "P2"
labels: ["build-system", "dependencies", "ds-package", "typescript"]
created_at: "2025-10-12T23:41:48.142Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---



## Task Completed

Successfully fixed the DS package missing dependencies issue:

### Problem Identified:

- The DS package was missing its main entry point file (`src/index.ts`)
- Package.json expected `dist/index.js` and `dist/index.d.ts` but these weren't being generated
- This caused the package to be incomplete and potentially cause build failures when used as a dependency

### Solution Implemented:

- Created `src/index.ts` with proper exports for all modules
- Resolved naming conflicts between `ecs.ts` and `ecs.scheduler.ts` (both exported `SystemSpec`)
- Used selective exports with `export type` for TypeScript compliance with `isolatedModules`
- Renamed conflicting `SystemSpec` from scheduler to `SchedulerSystemSpec`

### Files Modified:

- `packages/ds/src/index.ts` - Created new entry point with comprehensive exports

### Verification:

- Package builds successfully (`pnpm run build`)
- All tests pass (11/11 tests passing)
- Generated `dist/index.js` and `dist/index.d.ts` files as expected
- No TypeScript compilation errors
- Proper module exports for external consumers


