---
difficulty: medium
scale: medium
complexity: medium
answer: |
  The agent should identify:
1. Long method with multiple responsibilities (Single Responsibility Principle violation)
2. Duplicate code in notification logic
3. Magic strings and numbers
4. Poor error handling and validation
5. Missing abstraction levels
6. Primitive obsession (using basic types instead of domain objects)
7. Missing dependency injection
8. Hard-coded notification logic
9. No separation of concerns
10. Missing interface segregation
11. Poor naming conventions
12. Missing testability due to tight coupling
---

Review this Promethean Framework code for code smells and refactoring opportunities:

```typescript
export class TaskManager {
  private tasks: any[] = [];
  
  // Long method with multiple responsibilities
  async processNewTask(title: string, priority: string, assignee: string, description: string, dueDate: string, tags: string[]): Promise<void> {
    // Validation
    if (!title || title.length < 3) {
      throw new Error('Title too short');
    }
    if (!['P0', 'P1', 'P2', 'P3'].includes(priority)) {
      throw new Error('Invalid priority');
    }
    if (!assignee) {
      throw new Error('Assignee required');
    }
    
    // Task creation
    const task = {
      id: Math.random().toString(36).substr(2, 9),
      title: title,
      priority: priority,
      assignee: assignee,
      description: description,
      dueDate: dueDate,
      tags: tags,
      status: 'todo',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Save to database
    this.tasks.push(task);
    
    // Send notifications
    if (priority === 'P0') {
      // Email notification
      console.log('Sending email for P0 task: ' + title);
      
      // Slack notification
      console.log('Sending Slack notification for: ' + assignee);
      
      // SMS notification
      console.log('Sending SMS to on-call engineer');
    }
    
    // Update metrics
    console.log('Task created successfully');
  }
  
  // Duplicate code
  async updateTaskStatus(taskId: string, newStatus: string): Promise<void> {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error('Task not found');
    }
    
    if (!['todo', 'in-progress', 'done', 'blocked'].includes(newStatus)) {
      throw new Error('Invalid status');
    }
    
    task.status = newStatus;
    task.updatedAt = new Date();
    
    // Similar notification logic
    if (newStatus === 'done') {
      console.log('Sending completion email for: ' + task.title);
      console.log('Updating project metrics');
    }
  }
}
```

Identify code smells and refactor this code following clean code principles and Promethean Framework standards.