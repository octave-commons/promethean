---
difficulty: medium
scale: medium
complexity: medium
answer: |
  The agent should identify:
1. Redundant comments that repeat the code
2. Missing JSDoc format and type information
3. No documentation of side effects
4. Missing parameter and return type documentation
5. No error condition documentation
6. Missing examples in complex methods
7. Inconsistent comment style
8. Missing architectural decision documentation
---

Review the code comments in this Promethean Framework module:

```typescript
export class TaskManager {
  private tasks: Map<string, Task> = new Map();
  
  // Add a task
  async addTask(task: Task): Promise<void> {
    // Check if task exists
    if (this.tasks.has(task.id)) {
      throw new Error('Task exists');
    }
    
    // Store the task
    this.tasks.set(task.id, task);
    
    // Emit event
    this.emit('task-added', task);
  }
  
  // Get task by ID
  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
  
  // Update task
  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const task = this.tasks.get(id);
    if (!task) {
      throw new Error('Task not found');
    }
    
    // Update properties
    Object.assign(task, updates);
    
    // Save changes
    this.tasks.set(id, task);
    
    return task;
  }
  
  // Delete task
  async deleteTask(id: string): Promise<void> {
    const deleted = this.tasks.delete(id);
    if (!deleted) {
      throw new Error('Task not found');
    }
    
    // Emit event
    this.emit('task-deleted', id);
  }
}
```

Identify comment quality issues and suggest improvements following documentation-driven development practices.