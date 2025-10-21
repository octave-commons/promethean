---
difficulty: expert
scale: enterprise
complexity: very-high
answer: |
  The agent should identify:
1. God class violating Single Responsibility Principle
2. Tight coupling to database and file system
3. Missing abstraction layers and interfaces
4. No dependency injection or inversion of control
5. Mixed concerns (business logic, data access, notifications)
6. No error handling or logging framework
7. Security vulnerabilities (SQL injection, missing validation)
8. No testing strategy or testability
9. Missing configuration management
10. No monitoring or observability
11. Synchronous blocking operations
12. No API versioning or backward compatibility strategy
13. Missing domain-driven design patterns
14. No event-driven architecture
15. Missing modern TypeScript features and patterns
---

Review this legacy Promethean Framework system that needs modernization:

```typescript
// Legacy Task System (circa 2020)
export class LegacyTaskSystem {
  private db: any; // Direct database connection
  private fileSystem: any; // Direct file system access
  
  // God class with too many responsibilities
  async processTaskRequest(request: any): Promise<any> {
    // Parse incoming request (no validation)
    const data = JSON.parse(request.body);
    
    // Direct database queries throughout
    const user = this.db.query('SELECT * FROM users WHERE id = ' + data.userId);
    const project = this.db.query('SELECT * FROM projects WHERE id = ' + data.projectId);
    
    // Business logic mixed with data access
    if (user.role === 'admin' || project.ownerId === user.id) {
      const task = {
        id: this.generateId(),
        title: data.title,
        description: data.description,
        // ... many more fields
      };
      
      this.db.query('INSERT INTO tasks VALUES (' + JSON.stringify(task) + ')');
      
      // File operations mixed in
      const logEntry = 'Task created: ' + task.id + ' at ' + new Date();
      this.fileSystem.writeFile('/var/log/tasks.log', logEntry);
      
      // Email sending mixed in
      this.sendEmail(user.email, 'Task Created', 'Your task has been created');
      
      return { success: true, taskId: task.id };
    }
    
    return { success: false, error: 'Unauthorized' };
  }
  
  // More god methods...
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
  
  private sendEmail(to: string, subject: string, body: string): void {
    // Direct email sending implementation
    // ... 50 lines of email logic
  }
}

// Usage throughout the codebase
const legacySystem = new LegacyTaskSystem();
const result = legacySystem.processTaskRequest(req);
```

Design a comprehensive refactoring strategy to modernize this legacy system while maintaining backward compatibility.