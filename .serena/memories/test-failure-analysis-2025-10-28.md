# Test Failure Analysis and Plan

## Current State
- Build: ✅ TypeScript compilation succeeds
- Hanging Bug Fix: ✅ Timeout protection working (confirmed in test output)
- Tests: ❌ Multiple failures across different categories

## Test Failure Categories

### 1. **Markdown Output Formatting Issues** (High Priority)
**Failing Tests:**
- `formatTableCell handles tasks with missing titles`
- `formatTableCell handles tasks with missing UUIDs` 
- `formatTable handles special characters in task titles`
- `formatTable handles very long task titles`
- `formatTable handles malformed task objects`
- `formatTable performance with large task arrays`

**Root Cause:** Edge cases in markdown formatting functions not handled properly.

### 2. **Commit Message Generator Issues** (Medium Priority)
**Failing Tests:**
- `generateTasksDirectoryMessage with created tasks`
- `generateTasksDirectoryMessage with mixed changes`
- `generateFromTaskDiff creates proper message`

**Root Cause:** Missing or incorrect implementations in commit message generation.

### 3. **Task Content AI Issues** (High Priority)
**Failing Tests:**
- `TaskAIManager.analyzeTask returns structured analysis`
- `TaskAIManager.rewriteTask honours dry-run option`
- `TaskAIManager.breakdownTask produces subtasks`

**Root Cause:** AI manager likely not properly configured or missing dependencies.

### 4. **WIP Enforcement Issues** (Medium Priority)
**Failing Tests:**
- `WIPLimitEnforcement - validates WIP limits correctly`
- `WIPLimitEnforcement - intercepts status transitions`
- Multiple other WIP enforcement tests

**Root Cause:** WIP enforcement logic incomplete or has bugs.

### 5. **SCAR File Manager Issues** (High Priority)
**Failing Tests:**
- `ensureFile does not create file when disabled`
- `loadScars skips invalid records`
- `loadScars returns empty array for non-existent file`
- `loadScars loads valid scar records`
- Multiple file handling issues

**Root Cause:** File system operations and error handling issues.

### 6. **Task Creation Issues** (Medium Priority)
**Failing Tests:**
- `A task is created from provided template`
- `createTask Rejected promise returned by test`
- `task-duplication-integration` tests

**Root Cause:** Task creation logic has edge cases or integration issues.

### 7. **Transition Rules Issues** (Medium Priority)
**Failing Tests:**
- `TransitionRulesEngine debugging and overview helpers`
- Various transition rule tests

**Root Cause:** Deprecated functions and missing Clojure DSL configurations.

### 8. **Security/Validation Issues** (High Priority)
**Failing Tests:**
- `should sanitize file paths`
- `should detect binary content`
- `should detect path traversal attempts`
- `should allow only markdown files`
- `should detect suspicious file names`

**Root Cause:** Security validation logic incomplete.

## Missing Tooling
- No ESLint configuration
- No Prettier configuration  
- No lint/typecheck scripts in package.json
- Root-level configs exist but not accessible from kanban package

## Priority Order for Fixes
1. **Security Issues** (Critical)
2. **SCAR File Manager** (High - affects healing system)
3. **Task Content AI** (High - affects AI features)
4. **Markdown Output** (High - affects board generation)
5. **Task Creation** (Medium - core functionality)
6. **WIP Enforcement** (Medium - process enforcement)
7. **Commit Message Generator** (Low - auxiliary feature)
8. **Transition Rules** (Low - deprecated anyway)