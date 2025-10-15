---
difficulty: easy
scale: small
complexity: low
answer: |
  The agent should identify:
1. Missing parameter type descriptions
2. Incomplete return type documentation
3. Missing examples and usage patterns
4. No error documentation
5. Missing @throws annotations
6. Incomplete class-level documentation
7. Missing cross-references to related APIs
---

Review this API documentation for completeness and clarity:

```typescript
/**
 * Kanban Service
 */
export class KanbanService {
  /**
   * Get tasks
   * @param column - column name
   * @returns tasks
   */
  async getTasks(column?: string): Promise<Task[]> {
    // implementation
  }

  /**
   * Update task
   * @param id - task id
   * @param data - task data
   */
  async updateTask(id: string, data: any): Promise<Task> {
    // implementation
  }

  /**
   * Move task
   * @param id - task id
   * @param column - new column
   */
  async moveTask(id: string, column: string): Promise<void> {
    // implementation
  }
}
```

Identify documentation issues and improve according to Promethean Framework standards.