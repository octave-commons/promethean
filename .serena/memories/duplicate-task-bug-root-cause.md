# Duplicate Task Creation Bug - Root Cause Analysis

## Date: 2025-10-12

## Bug Location
**File**: `packages/kanban/src/lib/kanban.ts`
**Function**: `ensureUniqueFileBase` (lines 162-171)
**Called from**: `createTask` function (line 1380)

## The Problematic Code
```typescript
const ensureUniqueFileBase = (base: string, used: Map<string, string>, uuid: string): string => {
  const initial = base.length > 0 ? base : fallbackFileBase(uuid);
  let candidate = initial;
  let attempt = 1;
  while (used.has(candidate) && used.get(candidate) !== uuid) {
    attempt += 1;
    candidate = `${initial} ${attempt}`;  // ← CREATES DUPLICATES!
  }
  return candidate;
};
```

## Root Cause Analysis

### 1. Design Flaw: Filename Collision → Numeric Suffix
- When filename collision occurs, function adds numeric suffixes
- Creates "task-name 2", "task-name 3", etc.
- **657 tasks** have numeric suffixes proving this is the source

### 2. Missing Duplicate Detection
- No check for existing tasks with same title/content
- Only checks filename collision, not semantic duplication
- Multiple calls with same title create multiple files

### 3. Non-Idempotent Creation
- `createTask` function is not idempotent
- Same input can create different outputs
- Board regeneration triggers duplicate creation

### 4. Cascade Effect
- Board operations repeatedly call createTask
- Each call can create new duplicates
- Explains why 43 tasks created in last 2 hours

## Evidence

### Scale of Problem
- **657 tasks** with numeric suffixes
- **17 duplicates** of single "cleanup done column" task
- **43 ghost tasks** not tracked by kanban system
- **Active duplication** during normal operations

### Specific Example
"Cleanup done column incomplete tasks" has 17 duplicates:
- cleanup-done-column-incomplete-tasks.md
- cleanup-done-column-incomplete-tasks 2.md
- cleanup-done-column-incomplete-tasks 3.md
- ...
- cleanup-done-column-incomplete-tasks 17.md

## Fix Strategy

### Immediate Fix Required
1. **Add duplicate detection** in `createTask` before file creation
2. **Check existing tasks by title** before creating new ones
3. **Make createTask idempotent** - return existing task if found
4. **Prevent numeric suffix creation** for semantic duplicates

### Implementation Approach
```typescript
// Add at beginning of createTask function
const existingTask = existingTasks.find(task => 
  task.title.toLowerCase().trim() === title.toLowerCase().trim()
);

if (existingTask) {
  return existingTask; // Return existing task instead of creating duplicate
}
```

### Long-term Prevention
1. **Add unique constraints** on task titles within columns
2. **Implement proper duplicate detection** across entire system
3. **Add audit logging** for task creation operations
4. **Create cleanup utilities** for existing duplicates

## Impact Assessment

### Current Impact
- **Data integrity**: Critical corruption with 657 duplicates
- **System performance**: Slower operations due to duplicate processing
- **User confusion**: Multiple identical tasks cluttering board
- **Process compliance**: Impossible to enforce with duplicates

### Risk Level
- **Severity**: Critical - active data corruption
- **Urgency**: High - problem worsening during session
- **Scope**: System-wide - affects all kanban operations

## Next Actions
1. Implement immediate fix in createTask function
2. Create duplicate cleanup utility
3. Add comprehensive testing for idempotency
4. Audit all existing duplicates for cleanup

This is a **critical system integrity bug** that requires immediate intervention to prevent further data corruption.