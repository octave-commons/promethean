# Comprehensive Task: Write Integration and End-to-End Tests for Kanban Move Commands

## Overview
Create comprehensive integration and end-to-end test coverage for the `kanban move_up` and `kanban move_down` CLI commands. Current testing only covers the internal `moveTask` function with mock data, leaving critical gaps in CLI integration, file persistence, and workflow verification.

## Current State Analysis
**Existing Coverage:**
- ✅ Unit tests for `moveTask` function in `packages/kanban/src/tests/board.test.ts`
- ✅ Basic move_up/move_down functionality tested with mock boards
- ❌ No CLI command integration tests
- ❌ No end-to-end workflow tests
- ❌ No real board fixture testing
- ❌ No file persistence verification
- ❌ CLI testing infrastructure has environment issues

**Critical Gaps:**
1. CLI command handlers (`handleMove`) are untested
2. No verification of board file persistence after moves
3. No testing with real board fixtures (only mock data)
4. No error handling validation for edge cases
5. No workflow integration testing

## Acceptance Criteria

### 1. Integration Test Suite
- [ ] Create `packages/kanban/src/tests/move-commands-integration.test.ts`
- [ ] Test both `move_up` and `move_down` CLI commands end-to-end
- [ ] Use real board fixtures instead of mock data
- [ ] Verify file persistence after command execution
- [ ] Test command-line argument parsing and validation

### 2. Real Board Fixtures
- [ ] Create realistic board fixture files in `packages/kanban/src/fixtures/`
- [ ] Include multi-column boards with various task counts
- [ ] Cover edge cases: single task columns, empty columns, full columns
- [ ] Include tasks with different priorities, labels, and content

### 3. End-to-End Workflow Testing
- [ ] Test complete move workflows: CLI → board file → in-memory state
- [ ] Verify board regeneration preserves move operations
- [ ] Test concurrent move operations (race conditions)
- [ ] Validate task ordering consistency across operations

### 4. Error Handling Test Cases
- [ ] Invalid task UUID handling
- [ ] Moving tasks in single-item columns
- [ ] Moving first item up (no-op scenarios)
- [ ] Moving last item down (no-op scenarios)
- [ ] Non-existent task handling
- [ ] Corrupted board file handling
- [ ] Permission issues with file operations

### 5. File Persistence Verification
- [ ] Verify board file is updated correctly after moves
- [ ] Test board file format integrity
- [ ] Validate task ordering in markdown output
- [ ] Test board regeneration after moves
- [ ] Verify no duplicate tasks are created

### 6. Performance and Edge Cases
- [ ] Large board performance (100+ tasks)
- [ ] Deep column stacks (10+ tasks per column)
- [ ] Special characters in task titles
- [ ] Unicode and international character support
- [ ] Very long task content handling

## Implementation Requirements

### Test Structure
```
packages/kanban/src/tests/
├── move-commands-integration.test.ts     // Main integration tests
├── move-commands-e2e.test.ts            // End-to-end workflow tests
├── fixtures/
│   ├── multi-column-board.json          // Real board fixture
│   ├── single-task-columns.json         // Edge case fixture
│   └── large-board.json                 // Performance test fixture
└── helpers/
    ├── cli-test-utils.ts                // CLI testing utilities
    └── fixture-loader.ts                // Fixture management
```

### CLI Testing Infrastructure
- [ ] Create CLI testing utilities that bypass environment issues
- [ ] Implement proper process isolation for CLI commands
- [ ] Add mock stdin/stdout handling for CLI testing
- [ ] Create temporary directory management for test isolation

### Test Scenarios

#### Basic Move Operations
1. **Move Up First Task**: Verify no change when moving first task up
2. **Move Down Last Task**: Verify no change when moving last task down
3. **Move Middle Task Up**: Verify proper reordering
4. **Move Middle Task Down**: Verify proper reordering
5. **Move Between Columns**: Test cross-column moves (if supported)

#### Complex Workflows
1. **Sequential Moves**: Multiple moves in sequence
2. **Reverse Moves**: Move up then move down same task
3. **Bulk Reordering**: Complete column reordering via moves
4. **Mixed Operations**: Moves combined with other kanban operations

#### Error Conditions
1. **Invalid UUID**: Non-existent task UUID
2. **Malformed UUID**: Invalid UUID format
3. **Empty Board**: Operations on empty board
4. **Corrupted Files**: Board file with invalid syntax
5. **Permission Denied**: Read-only board files

#### File System Integration
1. **Board Persistence**: Verify board file updates
2. **Regeneration**: Board regeneration after moves
3. **Sync Operations**: Move operations with sync/push/pull
4. **Concurrent Access**: Multiple processes modifying board

## Technical Specifications

### Test Framework Requirements
- Use AVA test framework (consistent with existing tests)
- Leverage existing `withTempDir` helper for isolation
- Extend existing `makeBoard`/`makeTask` helpers for fixtures
- Use `esmock` for CLI command isolation

### CLI Command Testing Pattern
```typescript
const executeKanbanCommand = async (
  command: string,
  args: string[],
  cwd: string
): Promise<{ stdout: string; stderr: string; exitCode: number }> => {
  // Implementation for isolated CLI execution
};
```

### Fixture Format
```json
{
  "name": "Multi-Column Test Board",
  "columns": [
    {
      "name": "Todo",
      "tasks": [
        {
          "uuid": "task-1",
          "title": "First task",
          "status": "Todo",
          "priority": "P1",
          "content": "Task content here"
        }
      ]
    }
  ]
}
```

### Verification Requirements
- Task ordering verification in board state
- File content verification for persistence
- CLI output verification for user feedback
- Error message verification for invalid operations
- Performance benchmarks for large boards

## Success Metrics

### Coverage Targets
- [ ] 95%+ code coverage for move command handlers
- [ ] 100% coverage for error handling paths
- [ ] All edge cases covered with specific tests
- [ ] Performance tests for boards up to 1000 tasks

### Quality Gates
- [ ] All tests pass consistently
- [ ] No flaky tests (race conditions handled)
- [ ] Tests run in reasonable time (<5 seconds total)
- [ ] Memory usage stays within bounds for large boards

## Dependencies

### Required Packages
- `ava` (existing)
- `esmock` (existing)
- Node.js `child_process` for CLI testing
- File system utilities for fixture management

### Integration Points
- `packages/kanban/src/cli/command-handlers.ts`
- `packages/kanban/src/lib/kanban.js` (moveTask function)
- `packages/kanban/src/test-utils/helpers.js`
- Board file format and parsing logic

## Risk Mitigation

### Known Issues
- CLI environment problems in existing tests
- Process spawning limitations in test environment
- File system permission variations across platforms

### Mitigation Strategies
- Use direct function calls instead of process spawning where possible
- Implement proper test isolation and cleanup
- Create platform-agnostic file handling
- Add retry logic for flaky file operations

## Timeline Estimate

**Phase 1: Foundation (2-3 hours)**
- Create CLI testing utilities
- Set up fixture infrastructure
- Implement basic integration test structure

**Phase 2: Core Tests (3-4 hours)**
- Implement basic move operation tests
- Add error handling test cases
- Create real board fixtures

**Phase 3: Advanced Scenarios (2-3 hours)**
- Add end-to-end workflow tests
- Implement performance tests
- Add concurrent operation tests

**Phase 4: Validation (1-2 hours)**
- Run full test suite
- Verify coverage metrics
- Document test scenarios

**Total Estimated Effort: 8-12 hours**

## Deliverables

1. **Integration Test Suite**: Complete test coverage for move commands
2. **Board Fixtures**: Realistic test data for various scenarios
3. **CLI Testing Utilities**: Reusable infrastructure for other CLI tests
4. **Documentation**: Test scenarios and usage guidelines
5. **Performance Benchmarks**: Baseline metrics for large board operations

This task provides comprehensive test coverage for the kanban move commands, ensuring reliability and preventing regressions in this critical workflow functionality.