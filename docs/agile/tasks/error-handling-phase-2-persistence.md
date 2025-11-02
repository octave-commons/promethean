---
uuid: 'error-handling-pantheon-001-phase-2'
title: 'Phase 2: Standardize Error Handling in pantheon-persistence'
slug: 'error-handling-phase-2-persistence'
status: 'ready'
priority: 'P1'
storyPoints: 5
lastCommitSha: 'pending'
labels: ['pantheon', 'error-handling', 'phase-2', 'persistence']
created_at: '2025-10-26T18:35:00Z'
estimates:
  complexity: 'medium'
---

# Phase 2: Standardize Error Handling in pantheon-persistence

## Description

Replace generic `Error` usage in `pantheon-persistence` with standardized error types from the enhanced core framework. Implement proper error context and recovery patterns.

## Current State Analysis

From code analysis:

- ❌ Multiple generic `Error` throws in `src/index.ts`
- ❌ Inconsistent error message formatting
- ❌ Missing error context and correlation IDs
- ❌ No error recovery patterns
- ✅ Has dedicated error handling tests in `src/tests/error-handling.test.ts`

## Acceptance Criteria

### Replace Generic Errors

- [ ] Replace all `throw new Error(...)` with appropriate Pantheon error types
- [ ] Add proper error codes and categories
- [ ] Include relevant context metadata

### Error Context Enhancement

- [ ] Add operation context to all errors
- [ ] Include store manager and collection information
- [ ] Add correlation IDs for tracing

### Error Recovery Patterns

- [ ] Implement retry logic for transient errors
- [ ] Add circuit breaker patterns for persistent failures
- [ ] Create error recovery utilities

### Integration with Core Framework

- [ ] Import and use enhanced error types from `pantheon-core`
- [ ] Implement error monitoring hooks
- [ ] Add error metrics collection

## Implementation Details

### Key Areas to Update

#### Store Manager Operations

```typescript
// Before
throw new Error('getStoreManagers must return an array of DualStoreManager objects');

// After
throw new PersistenceError(
  'Store manager retrieval failed: invalid return type',
  'STORE_MANAGERS_INVALID_TYPE',
  ErrorCategory.PERSISTENCE,
  {
    operation: 'getStoreManagers',
    expectedType: 'DualStoreManager[]',
    actualType: typeof result,
  },
);
```

#### Database Operations

```typescript
// Before
throw new Error(
  `Store manager retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
);

// After
throw new PersistenceError(
  'Store manager retrieval failed',
  'STORE_MANAGER_RETRIEVAL_FAILED',
  ErrorCategory.PERSISTENCE,
  {
    operation: 'getStoreManagers',
    sourceId: source.id,
    sourceType: source.type,
  },
  error instanceof Error ? error : new Error(String(error)),
);
```

### Error Recovery Implementation

```typescript
export class PersistenceAdapter {
  async withRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries: number = 3,
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === maxRetries || !isRetryableError(lastError)) {
          throw new PersistenceError(
            `Operation ${operationName} failed after ${attempt} attempts`,
            'OPERATION_FAILED',
            ErrorCategory.PERSISTENCE,
            {
              operation: operationName,
              attempts: attempt,
              maxRetries,
            },
            lastError,
          );
        }

        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw lastError!;
  }
}
```

## Files to Update

- `packages/pantheon-persistence/src/index.ts` - Main adapter implementation
- `packages/pantheon-persistence/src/tests/error-handling.test.ts` - Update tests
- `packages/pantheon-persistence/src/tests/fixtures/mock-managers.ts` - Mock error handling

## Success Metrics

- 100% of generic errors replaced with structured error types
- All errors include proper context and correlation IDs
- Error recovery patterns implemented for transient failures
- Test coverage updated to cover new error types

## Dependencies

- Phase 1: Enhanced Core Error Framework completion
- `pantheon-core` enhanced error types

## Notes

Focus on maintaining backward compatibility while improving error handling. The persistence layer is critical for data integrity, so error handling must be robust and informative.
