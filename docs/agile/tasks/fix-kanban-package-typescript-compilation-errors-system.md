---
uuid: "b4c5d6e7-8f9a-1b2c-3d4e-5f6a7b8c9d0e"
title: "Fix kanban package TypeScript compilation errors -system  -system  -system  -system  -system  -system  -system  -system  -system  -system  -system  -system  -system  -system  -system  -system  -system  -system  -system  -system  -system  -system  -system"
slug: "fix-kanban-package-typescript-compilation-errors-system"
status: "ready"
priority: "P2"
labels: ["bugfix", "build-system", "kanban", "typescript"]
created_at: "2025-10-11T03:39:14.373Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## Issue

TypeScript compilation errors in the kanban package due to type mismatches in `loadKanbanConfig()` function calls.

## Technical Details

The `loadKanbanConfig()` function in `packages/kanban/src/board/config.ts` returns:
```typescript
{ config, restArgs }
```

But code in `packages/kanban/src/cli/command-handlers.ts` expects:
```typescript
{ config, configPath }  // ❌ configPath doesn't exist
```

**Affected locations:**
- Line 178: References non-existent `configPath` property
- Line 457: References non-existent `configPath` property

## Acceptance Criteria

1. Fix type mismatches in command-handlers.ts
2. Use the correct return values from `loadKanbanConfig()`
3. Ensure TypeScript compilation succeeds for kanban package
4. Verify CI pipeline builds without type errors

## Files to Modify

- `packages/kanban/src/cli/command-handlers.ts` (fix type usage)

## Root Cause Analysis

The issue stems from a mismatch between the actual function signature and expected return values. The `loadKanbanConfig()` function was updated to return `restArgs` instead of `configPath`, but the calling code wasn't updated accordingly.

## Verification Steps

1. Build kanban package: `pnpm --filter @promethean/kanban build`
2. Run full repository build: `pnpm build`
3. Check for remaining TypeScript errors
4. Verify CI pipeline passes on the fix
