---
difficulty: easy
scale: small
complexity: low
answer: |
  The agent should identify:
1. Missing error case testing
2. No edge case coverage
3. Missing boundary condition tests
4. No integration with dependencies
5. Missing async error handling tests
6. No performance or load testing
7. Missing validation tests
8. No cleanup or teardown
9. Missing test organization and structure
10. No test documentation or descriptions
---

Review this test file for coverage and quality:

```typescript
import { test } from 'ava';

import { TaskService } from '../src/task-service';

test('TaskService creates task', async t => {
  const service = new TaskService();
  const task = await service.createTask({
    title: 'Test Task',
    priority: 'P1'
  });
  
  t.truthy(task.id);
  t.is(task.title, 'Test Task');
});

test('TaskService gets task', async t => {
  const service = new TaskService();
  const task = await service.createTask({
    title: 'Test Task',
    priority: 'P1'
  });
  
  const retrieved = await service.getTask(task.id);
  t.is(retrieved.id, task.id);
});
```

Identify missing test cases and improve test quality following TDD best practices.