# Integration Tests for OpenCode Client

This directory contains comprehensive integration tests for the opencode-client package, verifying the complete integration between all system components.

## Test Structure

### 📁 Test Organization

```
src/tests/
├── services/
│   └── indexer.integration.test.ts     # Indexer service integration tests
├── actions/
│   └── index.integration.test.ts       # All action modules integration tests
├── e2e/
│   └── complete-system.integration.test.ts  # End-to-end system tests
├── events/                             # Existing unit tests for events
├── sessions/                           # Existing unit tests for sessions
├── messaging/                          # Existing unit tests for messaging
├── messages/                           # Existing unit tests for messages
├── regression.test.ts                  # Regression tests for critical bugs
└── README.md                           # This file
```

## Test Categories

### 🔄 Indexer Service Integration Tests (`services/indexer.integration.test.ts`)

**Purpose**: Verify the indexer service works correctly with all its components and external dependencies.

**Test Coverage**:

- ✅ Service lifecycle management (start, stop, cleanup)
- ✅ State persistence and recovery across restarts
- ✅ Database integration with real stores
- ✅ Event processing and synchronization
- ✅ Error handling and network resilience
- ✅ Performance under realistic load
- ✅ Concurrent operations handling
- ✅ Statistics tracking and monitoring
- ✅ Factory functions and default instances
- ✅ Full sync operations

**Key Test Scenarios**:

```typescript
// Service lifecycle
test.serial('indexer service lifecycle - start and stop');
test.serial('indexer service handles double start gracefully');

// State persistence
test.serial('indexer state persistence across restarts');

// Database integration
test.serial('indexer integrates with database stores');

// Event processing
test.serial('indexer processes events correctly');

// Error handling
test.serial('indexer handles network errors gracefully');
test.serial('indexer handles consecutive errors and stops after threshold');

// Performance
test.serial('indexer handles concurrent operations');
test.serial('indexer performance under realistic load');
```

### 🎯 Action Modules Integration Tests (`actions/index.integration.test.ts`)

**Purpose**: Verify all action modules work together correctly and integrate with the database and client.

**Test Coverage**:

- ✅ Events actions (subscribe, list)
- ✅ Sessions actions (create, close, get, list, search)
- ✅ Messages actions
- ✅ Messaging actions
- ✅ Cross-module interactions
- ✅ Database integration
- ✅ Error handling and edge cases
- ✅ Performance and concurrency
- ✅ Data consistency across modules

**Key Test Scenarios**:

```typescript
// Events actions
test.serial('events subscribe action integrates with client');
test.serial('events list action integrates with stores');
test.serial('events actions handle client errors gracefully');

// Sessions actions
test.serial('sessions create action integrates with client and stores');
test.serial('sessions get action integrates with stores');
test.serial('sessions list action integrates with stores and pagination');
test.serial('sessions search action integrates with stores');
test.serial('sessions close action works correctly');

// Cross-module integration
test.serial('sessions and messages actions work together');
test.serial('events and sessions actions integrate');
test.serial('all actions handle database errors gracefully');

// Performance
test.serial('actions performance under realistic load');

// Data consistency
test.serial('data consistency across action modules');
test.serial('action modules handle edge cases correctly');
```

### 🌐 End-to-End System Tests (`e2e/complete-system.integration.test.ts`)

**Purpose**: Verify the entire system works together in realistic scenarios.

**Test Coverage**:

- ✅ Complete user journeys
- ✅ Event processing workflows
- ✅ Indexer + Actions integration
- ✅ System resilience and recovery
- ✅ Performance and scalability
- ✅ Data consistency and integrity
- ✅ Error recovery and cleanup

**Key Test Scenarios**:

```typescript
// Complete user journeys
test.serial('complete user journey - session creation to message exchange');
test.serial('complete event processing workflow');

// System integration
test.serial('indexer service integrates with action modules');

// Resilience
test.serial('system resilience - handling partial failures');
test.serial('system resilience - database connection issues');

// Performance
test.serial('system performance under realistic load');
test.serial('system scalability - large dataset handling');

// Data integrity
test.serial('data consistency across all stores');
test.serial('data integrity validation');

// Cleanup and recovery
test.serial('system cleanup and resource management');
test.serial('error recovery and system stability');
```

## Running Tests

### Prerequisites

1. **Database Setup**: Tests use real MongoDB/ChromaDB connections with test databases
2. **Environment**: Set `NODE_ENV=test` to use test configurations
3. **Dependencies**: Ensure all test dependencies are installed

### Commands

```bash
# Run all integration tests
pnpm test

# Run only integration tests (exclude unit tests)
pnpm test -- --match="*integration*"

# Run specific test file
pnpm test src/tests/services/indexer.integration.test.ts

# Run with verbose output
pnpm test -- --verbose

# Run with coverage
pnpm test:coverage
```

### Test Configuration

The tests use the following configuration (see `ava.config.mjs`):

- **Timeout**: 30 seconds per test
- **Concurrency**: 1 (serial execution to avoid database conflicts)
- **Environment**: `NODE_ENV=test`
- **Loader**: `tsx` for TypeScript support

## Test Data and Mocking

### Mock Client

Tests use a comprehensive mock OpenCode client that simulates:

```typescript
const mockClient = {
  session: {
    create: () => Promise.resolve({ data: { id: 'test-id', title: 'Test' } }),
    list: () =>
      Promise.resolve({
        data: [
          /* sessions */
        ],
      }),
    get: () =>
      Promise.resolve({
        data: {
          /* session */
        },
      }),
    close: () => Promise.resolve({ data: { success: true } }),
    messages: () =>
      Promise.resolve({
        data: [
          /* messages */
        ],
      }),
    message: () =>
      Promise.resolve({
        data: {
          /* message */
        },
      }),
  },
  event: {
    subscribe: () =>
      Promise.resolve({
        stream: {
          /* async event iterator */
        },
      }),
  },
};
```

### Test Data Setup

Each test sets up realistic test data:

```typescript
async function setupTestData() {
  // Sessions
  await sessionStore.insert({
    id: 'session_test-1',
    text: JSON.stringify({ id: 'test-session-1', title: 'Test Session' }),
    timestamp: Date.now(),
    metadata: { type: 'session' },
  });

  // Messages
  await messageStore.insert({
    id: 'message_test-1',
    text: JSON.stringify({ info: { id: 'msg-1' }, parts: [{ text: 'Hello' }] }),
    timestamp: Date.now(),
    metadata: { type: 'message' },
  });

  // Events
  await eventStore.insert({
    id: 'event_test-1',
    text: JSON.stringify({
      type: 'session.updated',
      properties: {
        /* ... */
      },
    }),
    timestamp: Date.now(),
    metadata: { type: 'event' },
  });
}
```

## Test Isolation and Cleanup

### Database Isolation

- Tests use unique database names with timestamps
- Each test cleans up its data to avoid conflicts
- Serial execution prevents database contention

### Resource Cleanup

```typescript
test.afterEach.always(async () => {
  sinon.restore(); // Clean up mocks
  // Cleanup any running services
  await stopDefaultIndexer();
});
```

## Performance Benchmarks

### Expected Performance

- **Individual operations**: < 1000ms
- **Concurrent operations**: < 5000ms
- **Large dataset operations**: < 10000ms
- **End-to-end workflows**: < 15000ms

### Load Testing

Tests verify performance under realistic load:

```typescript
test.serial('system performance under realistic load', async (t) => {
  const startTime = Date.now();

  // Simulate realistic user activity
  const operations = [
    create({ title: 'Test Session', client: mockClient }),
    listSessions({ limit: 20, offset: 0 }),
    search({ query: 'Test', k: 10 }),
    // ... more operations
  ];

  await Promise.allSettled(operations);

  const duration = Date.now() - startTime;
  t.true(duration < 10000, `Operations took ${duration}ms, expected < 10000ms`);
});
```

## Error Handling Tests

### Network Errors

```typescript
test.serial('actions handle client errors gracefully', async (t) => {
  const mockClient = createMockClient();
  mockClient.session.create.rejects(new Error('Network error'));

  const error = await t.throwsAsync(() =>
    create({
      title: 'Test Session',
      client: mockClient,
    }),
  );

  t.true(error?.message.includes('Failed to create session'));
});
```

### Database Errors

```typescript
test.serial('all actions handle database errors gracefully', async (t) => {
  const originalInsert = sessionStore.insert;
  sessionStore.insert = sinon.stub().rejects(new Error('Database error'));

  const result = await listSessions({ limit: 10, offset: 0 });
  t.truthy(result); // Should return error response, not throw

  sessionStore.insert = originalInsert; // Restore
});
```

## Continuous Integration

### GitHub Actions

Tests are configured to run in CI with:

```yaml
- name: Run integration tests
  run: |
    cd packages/opencode-client
    pnpm install
    pnpm test
```

### Test Requirements

- ✅ All tests must pass
- ✅ Coverage threshold: > 80%
- ✅ Performance benchmarks must be met
- ✅ No memory leaks or resource issues

## Debugging Tests

### Common Issues

1. **Database Connection Errors**

   - Ensure MongoDB/ChromaDB is running
   - Check connection strings in test environment

2. **Timeout Errors**

   - Increase timeout in `ava.config.mjs`
   - Check for infinite loops or blocking operations

3. **Mock Issues**
   - Verify mock setup in `beforeEach`
   - Check that mocks are properly restored

### Debug Commands

```bash
# Run with Node.js debugging
node --inspect-brk node_modules/.bin/ava src/tests/services/indexer.integration.test.ts

# Run with verbose logging
DEBUG=* pnpm test

# Run specific test with debugging
pnpm test -- --match="specific test name" --verbose
```

## Contributing

### Adding New Tests

1. **Follow the pattern**: Use existing tests as templates
2. **Use descriptive names**: Test names should clearly describe what's being tested
3. **Include setup/teardown**: Ensure proper test isolation
4. **Mock external dependencies**: Use the mock client pattern
5. **Test both success and failure**: Cover error scenarios

### Test Review Checklist

- [ ] Test has a clear, descriptive name
- [ ] Test follows AAA pattern (Arrange, Act, Assert)
- [ ] Test includes proper setup and teardown
- [ ] Test covers both success and failure scenarios
- [ ] Test uses appropriate mocks and stubs
- [ ] Test assertions are specific and meaningful
- [ ] Test runs independently (no dependencies on other tests)
- [ ] Test cleans up resources properly

## Future Enhancements

### Planned Improvements

1. **Visual Testing**: Add screenshot-based UI tests
2. **Load Testing**: Integration with k6 or Artillery for stress testing
3. **Contract Testing**: Verify API contracts with consumer-driven tests
4. **Chaos Engineering**: Simulate random failures to test resilience
5. **Performance Monitoring**: Integration with APM tools for test metrics

### Test Metrics

Track the following metrics over time:

- Test execution time
- Test success rate
- Code coverage percentage
- Performance benchmark results
- Error rates and types

---

For questions or issues with the integration tests, please refer to the [project documentation](../../../README.md) or create an issue in the project repository.
