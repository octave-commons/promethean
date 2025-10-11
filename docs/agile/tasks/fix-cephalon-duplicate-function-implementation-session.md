---
uuid: "9f8e7a1b-2c3d-4e5f-6a7b-8c9d0e1f2a3b"
title: "Fix cephalon duplicate function implementation -session    -session    -session    -session    -session    -session    -session    -session    -session    -session    -session    -session    -session    -session    -session    -session    -session    -session    -session    -session    -session    -session    -session"
slug: "fix-cephalon-duplicate-function-implementation-session"
status: "ready"
priority: "P2"
labels: ["bugfix", "cephalon", "typescript", "voice-session"]
created_at: "2025-10-11T03:39:14.373Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## Issue

The file `packages/cephalon/src/actions/start-dialog.scope.ts` contains a duplicate implementation of the `runClassicStartDialog` function:

- **Line 216**: Correct implementation includes `attachClassicVoiceSessionListeners(bot, agent)`
- **Line 327**: Duplicate implementation missing the critical voice session listener attachment

## Technical Details

The duplicate function is missing this essential call:
```typescript
attachClassicVoiceSessionListeners(bot, agent);
```

This could lead to improper voice session initialization and affect Discord voice functionality.

## Acceptance Criteria

1. Remove the duplicate `runClassicStartDialog` function starting at line 327
2. Ensure the correct implementation (line 216) remains intact
3. Verify TypeScript compilation succeeds
4. Test that voice session initialization works correctly

## Files to Modify

- `packages/cephalon/src/actions/start-dialog.scope.ts` (remove duplicate function)

## Verification Steps

1. Build the cephalon package: `pnpm --filter @promethean/cephalon build`
2. Run full repository build: `pnpm build`
3. Check for any remaining TypeScript errors
4. Verify CI pipeline passes on the fix
