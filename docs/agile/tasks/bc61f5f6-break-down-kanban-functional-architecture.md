---
uuid: 'bc61f5f6-302a-4e58-b023-597430a8b5f2'
title: 'Break down kanban.ts into functional architecture'
slug: 'bc61f5f6-break-down-kanban-functional-architecture'
status: 'incoming'
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

Refactor `@packages/markdown/src/kanban.ts` MarkdownBoard class into functional architecture following established patterns in the codebase. This will improve testability, maintainability, and alignment with functional programming principles.

## Current State Analysis

The current `MarkdownBoard` class contains:

- Mixed concerns (parsing, formatting, business logic)
- Monolithic structure with all functionality in one class
- Hard to test individual components
- Tight coupling between operations

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

### Phase 1: Foundation (Day 1)

1. **Extract Types**: Move all type definitions to dedicated files
2. **Create Serializers**: Extract markdown parsing/formatting functions
3. **Extract Utilities**: Move shared utility functions

### Phase 2: Core Actions (Days 2-3)

1. **Board Actions**: Implement load, save, and query operations
2. **Column Actions**: Implement add, remove, and list operations
3. **Card Actions**: Implement add, remove, move, update, and find operations

### Phase 3: Factories (Day 4)

1. **Board Factory**: Create board with dependency injection
2. **Column Factory**: Create column with validation
3. **Card Factory**: Create card with ID generation

### Phase 4: Integration (Days 5-6)

1. **Index Files**: Create barrel exports for clean imports
2. **Migration**: Update existing code to use new structure
3. **Testing**: Ensure all functionality works correctly

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

**Phase 1**: 1 day (Foundation)
**Phase 2**: 2 days (Core Actions)
**Phase 3**: 1 day (Factories)
**Phase 4**: 2 days (Integration)

**Total Estimated Time**: 4-6 days
