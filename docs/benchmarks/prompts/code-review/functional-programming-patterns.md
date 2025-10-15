---
difficulty: medium
scale: medium
complexity: medium
answer: |
  The agent should identify:
1. Mutation of input arrays (non-functional)
2. Missing pure function principles
3. Side effects in data transformation
4. Opportunities for immutability
5. Better functional composition patterns
---

Review this code for adherence to functional programming principles in the Promethean Framework:

```typescript
interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'P0' | 'P1' | 'P2' | 'P3';
}

function updateTaskStatus(tasks: Task[], taskId: string, newStatus: Task['status']): Task[] {
  // Find and update the task
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].id === taskId) {
      tasks[i].status = newStatus;
      break;
    }
  }
  return tasks;
}

function getHighPriorityTasks(tasks: Task[]): Task[] {
  const result: Task[] = [];
  for (const task of tasks) {
    if (task.priority === 'P0' || task.priority === 'P1') {
      result.push(task);
    }
  }
  return result;
}

function processTasks(tasks: Task[]): Task[] {
  // Update all P0 tasks to in-progress
  for (const task of tasks) {
    if (task.priority === 'P0') {
      task.status = 'in-progress';
    }
  }
  
  // Filter out completed tasks
  return tasks.filter(task => task.status !== 'done');
}
```

Identify violations of functional programming principles and refactor to be more idiomatic for the Promethean Framework's functional style.