# Kanban Test Fixes Plan - 2025-10-28

## Current Status
- **Build**: ✅ TypeScript compilation succeeds
- **Hanging Bug Fix**: ✅ Timeout protection working (confirmed in test output)
- **Tests**: ❌ 25+ failures across 8 categories
- **Tooling**: ❌ Missing lint/typecheck scripts

## Confirmed Test Failure Categories

### 1. **Security/Validation Issues** (Critical Priority)
**Failing Tests:**
- `should sanitize file paths`
- `should detect binary content`
- `should detect path traversal attempts`
- `should allow only markdown files`
- `should detect suspicious file names`

**Root Cause**: Security validation logic incomplete in directory adapter

### 2. **SCAR File Manager Issues** (High Priority)
**Error Patterns:**
- ENOENT errors for missing test directories
- JSON parsing failures for malformed records
- File rotation check failures

**Root Cause**: File system operations lack proper error handling and directory creation

### 3. **Task Content AI Issues** (High Priority)
**Failing Tests:**
- `TaskAIManager.analyzeTask returns structured analysis`
- `TaskAIManager.rewriteTask honours dry-run option`
- `TaskAIManager.breakdownTask produces subtasks`

**Root Cause**: AI manager not properly configured or missing dependencies

### 4. **Markdown Output Formatting Issues** (High Priority)
**Failing Tests:**
- `formatTableCell handles tasks with missing titles`
- `formatTableCell handles tasks with missing UUIDs`
- `formatTable handles special characters in task titles`
- `formatTable handles very long task titles`
- `formatTable handles malformed task objects`
- `formatTable performance with large task arrays`

**Root Cause**: Edge cases in markdown formatting functions not handled properly

### 5. **WIP Enforcement Issues** (Medium Priority)
**Failing Tests:**
- `WIPLimitEnforcement - validates WIP limits correctly`
- `WIPLimitEnforcement - intercepts status transitions`
- `WIPLimitEnforcement - generates compliance reports`
- `WIPLimitEnforcement - tracks violation history`
- `WIPLimitEnforcement - handles admin overrides`
- `WIPLimitEnforcement - warning threshold detection`

**Root Cause**: WIP enforcement logic incomplete or has bugs

### 6. **Task Creation Issues** (Medium Priority)
**Failing Tests:**
- `A task is created from provided template`
- Various integration test failures

**Root Cause**: Task creation logic has edge cases or integration issues

### 7. **Commit Message Generator Issues** (Low Priority)
**Failing Tests:**
- `generateTasksDirectoryMessage with created tasks`
- `generateTasksDirectoryMessage with mixed changes`
- `generateFromTaskDiff creates proper message`

**Root Cause**: Missing or incorrect implementations in commit message generation

### 8. **Transition Rules Issues** (Low Priority - Deprecated)
**Root Cause**: Deprecated functions and missing Clojure DSL configurations

## Fix Implementation Plan

### Phase 1: Add Missing Tooling Scripts
1. Add `lint` and `typecheck` scripts to `/packages/kanban/package.json`
2. Point to root-level ESLint configuration
3. Verify tooling works correctly

### Phase 2: Security/Validation Issues (Critical)
1. Fix path traversal detection in directory adapter
2. Implement binary content detection
3. Fix markdown file validation
4. Add suspicious filename detection

### Phase 3: SCAR File Manager (High)
1. Add proper directory creation logic
2. Fix JSON parsing error handling
3. Fix file rotation check logic
4. Add proper error handling for missing files

### Phase 4: Task Content AI (High)
1. Investigate AI manager configuration
2. Fix missing dependencies or initialization
3. Ensure proper mock setup for tests

### Phase 5: Markdown Output (High)
1. Fix edge case handling for missing titles/UUIDs
2. Add special character escaping
3. Fix performance issues with large arrays
4. Handle malformed task objects gracefully

### Phase 6: Task Creation/WIP Enforcement (Medium)
1. Fix task creation edge cases
2. Fix WIP limit validation logic
3. Fix compliance reporting
4. Add proper admin override handling

### Phase 7: Commit Message Generator/Transition Rules (Low)
1. Fix commit message generation logic
2. Address deprecated transition rules (or mark as deprecated)

## Files to Examine/Modify

**Core Files:**
- `/packages/kanban/package.json` - Add scripts
- `/packages/kanban/src/lib/directory-adapter.ts` - Security fixes
- `/packages/kanban/src/lib/heal/scar-file-manager.ts` - File handling fixes
- `/packages/kanban/src/lib/task-content-ai.ts` - AI manager fixes
- `/packages/kanban/src/lib/markdown-output.ts` - Formatting fixes
- `/packages/kanban/src/lib/wip-enforcement.ts` - WIP fixes
- `/packages/kanban/src/lib/commit-message-generator.ts` - Commit fixes

**Test Files:**
- All corresponding test files for validation

## Success Criteria
- All lint/typecheck commands pass
- All security tests pass
- All SCAR file manager tests pass
- All high priority tests pass
- Build remains successful
- No regressions in previously passing tests