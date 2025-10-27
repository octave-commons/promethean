---
difficulty: hard
scale: large
complexity: high
answer: |
  The agent should identify:
1. Race condition between task loading and cleanup
2. Date comparison logic issues (Date objects vs timestamps)
3. Missing transaction boundaries for database operations
4. Concurrent access to shared Map without proper synchronization
5. Potential issue with task updatedAt field not being updated consistently
6. Missing proper error handling in cleanup logic
7. No audit trail for task deletions
8. Missing proper locking mechanisms for concurrent operations
9. Potential memory leaks from activeTasks Map growing indefinitely
10. Missing proper logging for debugging concurrent operations
11. Need for proper task lifecycle management
12. Missing database constraints and triggers
13. Need for proper retry mechanisms for transient failures
14. Missing monitoring and alerting for task lifecycle events
---

Investigate this complex bug in the Promethean Framework's agent coordination system:

**Bug Report:** Tasks are randomly disappearing from the kanban board under high load.

**Symptoms:**
- Tasks vanish from the database without any deletion logs
- Only occurs when >100 agents are processing tasks simultaneously
- No error messages or exceptions in logs
- Affects both completed and in-progress tasks

**Code Context:**
```typescript
export class TaskCoordinator {
  private activeTasks: Map<string, Task> = new Map();
  
  async processTaskUpdate(taskId: string, update: TaskUpdate): Promise<void> {
    const task = this.activeTasks.get(taskId);
    if (!task) {
      // Task might be in database but not in memory
      const dbTask = await this.loadTaskFromDB(taskId);
      if (dbTask) {
        this.activeTasks.set(taskId, dbTask);
      }
    }
    
    // Apply update
    if (task) {
      Object.assign(task, update);
      await this.saveTaskToDB(task);
      
      // Cleanup old tasks periodically
      if (Math.random() < 0.01) { // 1% chance
        await this.cleanupOldTasks();
      }
    }
  }
  
  private async cleanupOldTasks(): Promise<void> {
    const now = Date.now();
    const cutoff = now - (24 * 60 * 60 * 1000); // 24 hours ago
    
    for (const [taskId, task] of this.activeTasks) {
      if (task.updatedAt < cutoff) {
        // This might be the bug
        this.activeTasks.delete(taskId);
        await this.db.query('DELETE FROM tasks WHERE id = ?', [taskId]);
      }
    }
  }
  
  private async saveTaskToDB(task: Task): Promise<void> {
    // Race condition possible here
    const existing = await this.db.query('SELECT * FROM tasks WHERE id = ?', [task.id]);
    
    if (existing) {
      await this.db.query(
        'UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?',
        [task.status, new Date(), task.id]
      );
    } else {
      await this.db.query(
        'INSERT INTO tasks (id, status, updated_at) VALUES (?, ?, ?)',
        [task.id, task.status, new Date()]
      );
    }
  }
}
```

Analyze the code to identify the root cause of the disappearing tasks and propose a comprehensive fix.