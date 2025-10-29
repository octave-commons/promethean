---
uuid: 'bc61f5f6-302a-4e58-b023-597430a8b5f2'
title: 'Break down kanban.ts into functional architecture'
slug: 'bc61f5f6-break-down-kanban-functional-architecture'
status: 'in_progress'
priority: 'P1'
labels: ['refactoring', 'architecture', 'kanban', 'functional-programming', 'code-quality']
created_at: '2025-10-28T00:00:00.000Z'
estimates:
  complexity: '7'
  scale: 'medium'
  time_to_completion: '4-6 days'
---

# Break down kanban.ts into functional architecture

## Executive Summary

**🎯 UPDATE**: Functional architecture refactoring is **~60% complete** with solid foundation implemented. Need to complete missing actions and migrate integration points to fully replace legacy `kanban.ts` monolith with pure functional architecture.

**✅ Completed**: Board, Card, Column actions + Serializers + Factories + Types  
**🔄 Remaining**: Task lifecycle, Transition, Search actions + Integration migration  
**📈 Impact**: Will complete migration to pure functional architecture with full type safety and testability.

## Current State Analysis

### ✅ **Already Completed (~60% done)**

The functional architecture refactoring is **substantially complete** with solid foundation:

**Implemented Actions:**

- **Board Actions**: `load-board.ts`, `save-board.ts`, `query-board.ts` ✅
- **Column Actions**: `create-column.ts`, `remove-column.ts`, `list-columns.ts` ✅
- **Card Actions**: `create-card.ts`, `remove-card.ts`, `move-card.ts`, `update-card.ts`, `find-cards.ts` ✅
- **Task Actions**: `create-task.ts` (partial implementation) ✅

**Supporting Infrastructure:**

- **Serializers**: `markdown-formatter.ts`, template processing ✅
- **Factories**: Board, Card, Column factories with dependency injection ✅
- **Types**: Complete type definitions with input/output contracts ✅
- **Utilities**: String utils, constants ✅

### ❌ **Remaining Work (~40% needed)**

**Missing Core Task Actions:**

- `update-task-description.ts`
- `rename-task.ts`
- `archive-task.ts`
- `delete-task.ts`
- `merge-tasks.ts`

**Missing Transition Actions:**

- `update-status.ts` (different from card move)
- `move-task.ts` (task-level transitions)

**Missing Search Actions:**

- `search-tasks.ts`
- `index-for-search.ts`

**Missing Utility Functions:**

- `find-task-by-id.ts`
- `find-task-by-title.ts`
- `get-column.ts`
- `get-tasks-by-column.ts`
- `count-tasks.ts`

**Missing Board Operations:**

- `sync-board-tasks.ts`
- `regenerate-board.ts`

### 🔗 **Integration Gap**

Main exports in `src/index.ts` still point to legacy `kanban.ts` functions instead of new functional actions. CLI command handlers also need updating.

## Target Architecture

### Actions (Pure Functions)

- **Board Actions**: `load-board.ts`, `save-board.ts`, `query-board.ts`
- **Column Actions**: `add-column.ts`, `remove-column.ts`, `list-columns.ts`
- **Card Actions**: `add-card.ts`, `remove-card.ts`, `move-card.ts`, `update-card.ts`, `find-cards.ts`

### Factories (Dependency Injection)

- **Board Factory**: Board creation with injected dependencies
- **Column Factory**: Column creation with validation
- **Card Factory**: Card creation with ID generation

### Serializers (Data Transformation)

- **Markdown Parser**: Parse markdown to board structure
- **Markdown Formatter**: Format board to markdown
- **Card Serializer**: Card data parsing/formatting

### Types (Shared Definitions)

- Extract and organize all type definitions
- Create input/output types for each action
- Ensure compatibility with existing kanban types

## Implementation Plan

### ✅ **Phase 1-4: COMPLETED** (Foundation + Core Actions + Factories)

All foundational work is complete:

- Types extracted and organized ✅
- Serializers implemented ✅
- Core actions (boards, cards, columns) implemented ✅
- Factories with dependency injection ✅
- Barrel exports and clean imports ✅

### 🔄 **Phase 5: Complete Missing Actions** (Days 1-2)

**Priority 1: Core Task Lifecycle**

1. **Task Actions**: `update-description`, `rename-task`, `archive-task`, `delete-task`, `merge-tasks`
2. **Transition Actions**: `update-status`, `move-task`

**Priority 2: Search & Utilities**  
3. **Search Actions**: `search-tasks`, `index-for-search` 4. **Utility Functions**: `find-task-by-id`, `find-task-by-title`, `get-column`, etc.

**Priority 3: Board Operations** 5. **Board Actions**: `sync-board-tasks`, `regenerate-board`

### 🔗 **Phase 6: Integration Migration** (Day 3)

1. **Update Main Exports**: Point `src/index.ts` to functional actions instead of legacy `kanban.ts`
2. **Update CLI Handlers**: Migrate command handlers to use new actions
3. **Maintain Compatibility**: Ensure backward compatibility during transition

### ✅ **Phase 7: Validation & Cleanup** (Day 4)

1. **Comprehensive Testing**: Run full test suite with new architecture
2. **Performance Validation**: Ensure no performance regression
3. **Legacy Cleanup**: Remove deprecated code from `kanban.ts`
4. **Documentation Update**: Update API docs and migration guide

## Technical Details

### Directory Structure

```
packages/kanban/src/lib/
├── actions/
│   ├── boards/
│   ├── columns/
│   └── cards/
├── factories/
├── serializers/
└── types/
```

### Function Pattern

Each action will follow the established pattern:

```typescript
export type ActionInput = {
  /* ... */
};
export type ActionScope = {
  /* dependencies */
};
export type ActionOutput = {
  /* ... */
};

export const actionName = (input: ActionInput, scope: ActionScope): ActionOutput => {
  // Pure function implementation
};
```

## Benefits

1. **Testability**: Pure functions are easy to unit test
2. **Composability**: Functions can be combined in flexible ways
3. **Type Safety**: Explicit contracts for all operations
4. **Maintainability**: Clear separation of concerns
5. **Reusability**: Actions can be used in different contexts
6. **Alignment**: Consistent with existing functional patterns

## Success Criteria

1. **Functional Architecture**: All operations implemented as pure functions
2. **Type Safety**: Complete TypeScript coverage with strict mode
3. **Test Coverage**: Comprehensive test suite for all functions
4. **Backward Compatibility**: Existing functionality preserved
5. **Performance**: No performance degradation
6. **Documentation**: Clear API documentation

## Risk Assessment

**Medium Risk**: This is a significant refactoring that touches core functionality.

**Mitigation**:

- Implement incrementally with testing at each phase
- Maintain backward compatibility during transition
- Comprehensive test coverage before deployment
- Rollback procedures if needed

## Dependencies

- Access to kanban package source code
- Understanding of existing functional patterns
- Test environment setup
- Documentation of current behavior

## Deliverables

1. **Functional Actions**: Complete set of pure functions
2. **Factories**: Dependency injection factories
3. **Serializers**: Markdown processing functions
4. **Type Definitions**: Complete type system
5. **Test Suite**: Comprehensive test coverage
6. **Migration Guide**: Documentation for using new structure
7. **Performance Benchmarks**: Validation of no performance loss

## Testing Strategy

### Unit Tests

- Test each pure function independently
- Validate input/output contracts
- Test edge cases and error conditions

### Integration Tests

- Test complete workflows
- Test with existing kanban system
- Validate backward compatibility

### Performance Tests

- Benchmark against current implementation
- Validate no performance regression
- Test with large datasets

## Timeline

**✅ Phases 1-4**: COMPLETED (Foundation + Core Actions + Factories)
**🔄 Phase 5**: 2 days (Complete Missing Actions)
**🔗 Phase 6**: 1 day (Integration Migration)  
**✅ Phase 7**: 1 day (Validation & Cleanup)

**📊 Remaining Time**: 3-4 days (60% complete, 40% remaining)

**🎯 Current Focus**: Complete missing task lifecycle and transition actions, then migrate integration points.
