---
difficulty: hard
scale: large
complexity: high
answer: |
  The agent should identify:
1. Missing test isolation and cleanup
2. No testing of concurrent operations
3. Missing failure scenarios and recovery
4. No performance testing under load
5. Missing database transaction testing
6. No event bus integration verification
7. Missing cross-service interaction testing
8. No testing of data consistency
9. Missing environment-specific testing
10. No testing of scaling behavior
---

Review this integration test for the Promethean Framework's kanban system:

```typescript
import { test } from 'ava';

import { KanbanService } from '../src/kanban-service';
import { Database } from '../src/database';
import { EventBus } from '../src/event-bus';

test.serial('Kanban integration test', async t => {
  // Setup
  const db = new Database(process.env.TEST_DB_URL);
  const eventBus = new EventBus();
  const kanban = new KanbanService(db, eventBus);
  
  await kanban.initialize();
  
  // Test task creation and workflow
  const task = await kanban.createTask({
    title: 'Integration Test Task',
    priority: 'P1'
  });
  
  await kanban.moveTask(task.id, 'todo');
  await kanban.moveTask(task.id, 'in-progress');
  await kanban.moveTask(task.id, 'done');
  
  const finalState = await kanban.getTask(task.id);
  t.is(finalState.status, 'done');
  
  // Cleanup
  await kanban.destroy();
  await db.close();
});
```

Identify integration testing issues and design a comprehensive integration testing strategy for the kanban system.