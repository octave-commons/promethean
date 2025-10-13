# Kanban Board Regeneration Fix

## Problem
The `regenerateBoard` function was only creating columns for configured status values from the default configuration (`['open', 'doing', 'blocked', 'done', 'dropped']`), but tests were creating tasks with different statuses (`'todo'`, `'ready'`, `'in-progress'`). This caused tasks to be lost during board regeneration because their statuses didn't match any configured columns.

## Root Cause
In `packages/kanban/src/lib/kanban.ts`, the `regenerateBoard` function was only generating columns for `config.statusValues`, ignoring any existing task statuses that weren't in the configuration.

## Solution
Modified the `regenerateBoard` function to:
1. Create columns for all configured statuses (preserving existing behavior)
2. Additionally create columns for any existing task statuses that aren't in the configuration
3. Combine both sets of columns for the final board

## Changes Made
- Updated `regenerateBoard` function in `packages/kanban/src/lib/kanban.ts`
- Added logic to detect and include additional status groups from existing tasks
- Maintained backward compatibility by keeping configured columns first
- Set WIP limits to `null` for unconfigured columns

## Test Results
- All 127 tests now pass (was 126 passing, 1 failing)
- The failing test "integration: board operations do not create duplicate files" now passes
- No regressions introduced

## Impact
- Fixes board regeneration for tasks with non-standard status values
- Maintains all existing functionality
- Improves flexibility for custom workflows