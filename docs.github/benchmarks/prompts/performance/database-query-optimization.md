---
difficulty: hard
scale: large
complexity: high
answer: |
  The agent should identify:
1. N+1 query problems requiring eager loading
2. Missing database indexes for frequent queries
3. No query result caching
4. Missing pagination for large result sets
5. Inefficient LIKE queries without full-text search
6. No connection pooling optimization
7. Missing query execution plans analysis
8. No database connection transaction optimization
9. Missing read replica usage for read-heavy operations
10. No query batching for bulk operations
11. Missing database monitoring and slow query logging
12. No prepared statement usage
---

Review this database access code for the Promethean Framework's kanban system:

```typescript
class KanbanRepository {
  async getTasksByColumn(column: string): Promise<Task[]> {
    // N+1 query problem
    const tasks = await this.db.query('SELECT * FROM tasks WHERE column = ?', [column]);
    
    for (const task of tasks) {
      // Separate query for each task's dependencies
      task.dependencies = await this.db.query(
        'SELECT * FROM dependencies WHERE task_id = ?', 
        [task.id]
      );
      
      // Separate query for each task's comments
      task.comments = await this.db.query(
        'SELECT * FROM comments WHERE task_id = ? ORDER BY created_at DESC', 
        [task.id]
      );
      
      // Separate query for each task's assignee
      if (task.assignee_id) {
        task.assignee = await this.db.query(
          'SELECT * FROM users WHERE id = ?', 
          [task.assignee_id]
        );
      }
    }
    
    return tasks;
  }

  async getBoardStatistics(boardId: string): Promise<any> {
    // Multiple separate queries
    const totalTasks = await this.db.query(
      'SELECT COUNT(*) FROM tasks WHERE board_id = ?', 
      [boardId]
    );
    
    const tasksByColumn = await this.db.query(
      'SELECT column, COUNT(*) FROM tasks WHERE board_id = ? GROUP BY column', 
      [boardId]
    );
    
    const overdueTasks = await this.db.query(
      'SELECT * FROM tasks WHERE board_id = ? AND due_date < NOW()', 
      [boardId]
    );
    
    // Process results in application code
    return {
      total: totalTasks[0].count,
      byColumn: tasksByColumn,
      overdue: overdueTasks.length
    };
  }

  async searchTasks(query: string, filters: any): Promise<Task[]> {
    let sql = 'SELECT * FROM tasks WHERE 1=1';
    const params = [];
    
    // Dynamic query building without proper indexing
    if (query) {
      sql += ' AND title LIKE ?';
      params.push(`%${query}%`);
    }
    
    if (filters.priority) {
      sql += ' AND priority = ?';
      params.push(filters.priority);
    }
    
    if (filters.assignee) {
      sql += ' AND assignee_id = ?';
      params.push(filters.assignee);
    }
    
    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }
    
    // No LIMIT or pagination
    return await this.db.query(sql, params);
  }
}
```

Identify database performance issues and design an optimized data access strategy for high-load kanban operations.