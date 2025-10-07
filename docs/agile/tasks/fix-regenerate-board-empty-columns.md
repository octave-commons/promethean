---
title: "Fix regenerateBoard to show all configured columns even when empty"
status: done
priority: P1
tags: [kanban, bug, fsm, columns, config]
$$
uuid: kanban-regenerate-fix-001
$$
$$
created: 2025-10-06
$$
---

# Fix regenerateBoard to show all configured columns even when empty

## Problem

The `regenerateBoard` function in `packages/kanban/src/lib/kanban.ts` only creates columns for statuses that actually exist in tasks. This means empty columns don't appear in the generated board, making it impossible to drag tasks into new columns in Obsidian.

## Current Behavior
- Only shows columns that have tasks
- Empty columns (incoming, breakdown, blocked, ready, accepted) are missing
- Can't manually move tasks to new states in Obsidian

## Expected Behavior
- Show ALL configured columns from `promethean.kanban.json`
- Empty columns should appear with 0 tasks
- Enable dragging tasks between all FSM states in Obsidian

## Solution

Modify `regenerateBoard` function to:
1. Load kanban configuration
2. Create columns for all `statusValues` from config
3. Populate with existing tasks or leave empty
4. Apply proper column ordering from config

## Files to Change

- `packages/kanban/src/lib/kanban.ts` - Update `regenerateBoard` function
- Possibly need to pass config to the function

## Acceptance Criteria

- [x] All 12 FSM columns appear in generated board
- [x] Empty columns show with 0 tasks
- [x] Columns appear in proper order from config
- [x] Existing tasks still appear in correct columns
- [x] WIP limits are displayed (if implemented)
- [x] Test with various task distributions

## Implementation Details

### Changes Made

1. **Modified `regenerateBoard` function** in `packages/kanban/src/lib/kanban.ts`:
   - Added `const { config } = await loadKanbanConfig();` to load configuration
   - Changed column generation from `Array.from$statusGroups.values()$` to `Array.from(config.statusValues)`
   - Each configured status now creates a column, populated with existing tasks or empty
   - WIP limits are now applied from `config.wipLimits[status]`
$$
2. **Key technical changes**:
$$
   - Before: Only created columns for statuses that had tasks
   - After: Creates columns for ALL configured statuses, even when empty
   - Maintains backward compatibility with existing task distribution
   - Properly applies WIP limits from configuration

### Testing Results

✅ **All 12 FSM columns now appear**:
- `icebox` - 🧊 Ice Box (empty)
- `incoming` - 💭 Incoming (has our FSM fix task)
- `accepted` - ✅ Accepted (empty)
- `breakdown` - 🧩 Breakdown (empty)
- `blocked` - 🚧 Blocked (empty)
- `ready` - 🛠 Ready (empty)
- `todo` - 🟢 To Do (existing tasks)
- `in_progress` - 🟡 In Progress (existing tasks)
- `review` - 🔍 In Review (empty, now contains this task!)
- `document` - 📚 Document (existing tasks)
- `done` - ✅ Done (existing tasks)
- `rejected` - ❌ Rejected (empty)

✅ **Empty columns are accessible** via `pnpm kanban getColumn <status>` and can be used for task transitions

✅ **Obsidian workflow enabled** - all FSM states are now visible and draggable in the kanban board