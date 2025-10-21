---
difficulty: medium
scale: medium
complexity: medium
answer: |
  The agent should identify:
1. Over-mocking and testing implementation details
2. Missing verification of mock interactions
3. No setup/teardown for test isolation
4. Missing assertion on specific error types
5. Mock returning unrealistic data
6. No testing of edge cases with mocks
7. Missing integration test alternatives
8. Poor test naming and organization
9. No documentation of mock behavior
10. Missing test data factories
---

Review this test that uses mocks for a Promethean Framework service:

```typescript
import { test } from 'ava';
import sinon from 'sinon';

import { MCPService } from '../src/mcp-service';
import { Database } from '../src/database';

test('MCPService processes message', async t => {
  const dbStub = sinon.createStubInstance(Database);
  dbStub.get.returns(Promise.resolve({ id: '123', data: 'test' }));
  
  const service = new MCPService(dbStub as any);
  const result = await service.processMessage({
    type: 'test',
    payload: { id: '123' }
  });
  
  t.truthy(result.success);
  t.true(dbStub.get.called);
});

test('MCPService handles error', async t => {
  const dbStub = sinon.createStubInstance(Database);
  dbStub.get.throws(new Error('DB Error'));
  
  const service = new MCPService(dbStub as any);
  const result = await service.processMessage({
    type: 'test',
    payload: { id: '123' }
  });
  
  t.false(result.success);
});
```

Identify mocking anti-patterns and suggest improvements for better test isolation and maintainability.