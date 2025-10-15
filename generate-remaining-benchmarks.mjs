import fs from 'fs/promises';
import path from 'path';

async function createBenchmarkFile(category, name, difficulty, scale, complexity, content, answer) {
  const dir = `/home/err/devel/promethean/docs/benchmarks/prompts/${category}`;

  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }

  const filePath = path.join(dir, `${name}.md`);

  const fileContent = `---
difficulty: ${difficulty}
scale: ${scale}
complexity: ${complexity}
answer: |
  ${answer}
---

${content}`;

  try {
    await fs.writeFile(filePath, fileContent, 'utf8');
    console.log(`Generated: ${filePath}`);
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
  }
}

// Architecture Prompts
await createBenchmarkFile(
  'architecture',
  'microservices-design',
  'hard',
  'large',
  'high',
  `Review this microservices architecture for the Promethean Framework:

\`\`\`typescript
// Agent Service
export class AgentService {
  async createAgent(config: AgentConfig): Promise<Agent> {
    // Direct database calls
    const agent = await this.db.create('agents', config);
    
    // Direct HTTP calls to other services
    await fetch('http://task-service/agents/' + agent.id + '/init');
    await fetch('http://notification-service/notify', {
      method: 'POST',
      body: JSON.stringify({ type: 'agent-created', agentId: agent.id })
    });
    
    return agent;
  }
}

// Task Service
export class TaskService {
  async assignTask(taskId: string, agentId: string): Promise<void> {
    const task = await this.db.findById('tasks', taskId);
    task.assignee = agentId;
    await this.db.save('tasks', task);
    
    // Direct call to agent service
    const response = await fetch('http://agent-service/' + agentId + '/assign-task');
    const agent = await response.json();
    
    // Update agent status
    await this.db.save('agents', { ...agent, currentTask: taskId });
  }
}

// Notification Service
export class NotificationService {
  async sendNotification(userId: string, message: string): Promise<void> {
    // Direct email sending
    await this.emailService.send(userId, message);
    
    // Direct WebSocket push
    this.websocketServer.clients.forEach(client => {
      if (client.userId === userId) {
        client.send(JSON.stringify({ message }));
      }
    });
  }
}
\`\`\`

Identify architectural anti-patterns and design improvements for a scalable microservices architecture.`,
  `The agent should identify:
1. Tight coupling between services through direct HTTP calls
2. Missing service discovery and load balancing
3. No message queue for asynchronous communication
4. Missing circuit breaker patterns
5. No distributed tracing or monitoring
6. Missing API gateway for external communication
7. No event-driven architecture patterns
8. Missing data consistency patterns (sagas, event sourcing)
9. No proper error handling and retry mechanisms
10. Missing service mesh for inter-service communication
11. No proper separation of concerns
12. Missing scalability and resilience patterns`,
);

await createBenchmarkFile(
  'architecture',
  'event-driven-design',
  'expert',
  'enterprise',
  'very-high',
  `Review this event-driven architecture for the Promethean Framework's Agent OS:

\`\`\`typescript
// Event Publisher
export class TaskEventPublisher {
  async publishTaskCreated(task: Task): Promise<void> {
    const event = {
      type: 'task.created',
      data: task,
      timestamp: new Date().toISOString(),
      id: generateUUID()
    };
    
    // Direct publishing to multiple systems
    await this.eventBus.publish('task-events', event);
    await this.notificationQueue.send('notifications', event);
    await this.auditLog.write(event);
    await this.searchIndex.index('tasks', task);
  }
}

// Event Handler
export class TaskEventHandler {
  @EventHandler('task.created')
  async handleTaskCreated(event: TaskEvent): Promise<void> {
    // Complex business logic in event handler
    const task = event.data;
    
    if (task.priority === 'P0') {
      // Direct service calls from event handler
      const agents = await this.agentService.findAvailableAgents();
      for (const agent of agents) {
        await this.assignmentService.assignTask(task.id, agent.id);
      }
    }
    
    // Side effects in event handler
    await this.notificationService.notifyStakeholders(task);
    await this.reportService.updateMetrics(task);
    await this.cacheService.invalidate('task-lists');
  }
}

// Event Sourcing Attempt
export class TaskAggregate {
  private events: TaskEvent[] = [];
  private state: Task;
  
  applyEvent(event: TaskEvent): void {
    // Simple event application without versioning
    switch (event.type) {
      case 'task.created':
        this.state = event.data;
        break;
      case 'task.assigned':
        this.state.assignee = event.data.assignee;
        break;
      case 'task.completed':
        this.state.status = 'done';
        break;
    }
    
    this.events.push(event);
  }
}
\`\`\`

Identify event-driven architecture issues and design a robust event system for enterprise-scale agent coordination.`,
  `The agent should identify:
1. Missing event schema validation and versioning
2. No event ordering or idempotency guarantees
3. Complex business logic in event handlers
4. Missing event replay and snapshot capabilities
5. No dead letter queue handling
6. Missing event correlation and tracing
7. No proper event store implementation
8. Missing saga pattern for distributed transactions
9. No event schema evolution strategy
10. Missing event monitoring and alerting
11. No proper event partitioning strategy
12. Missing event security and authorization
13. No event testing and validation strategies
14. Missing event performance optimization`,
);

// Refactoring Prompts
await createBenchmarkFile(
  'refactoring',
  'code-smell-detection',
  'medium',
  'medium',
  'medium',
  `Review this Promethean Framework code for code smells and refactoring opportunities:

\`\`\`typescript
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
\`\`\`

Identify code smells and refactor this code following clean code principles and Promethean Framework standards.`,
  `The agent should identify:
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
12. Missing testability due to tight coupling`,
);

await createBenchmarkFile(
  'refactoring',
  'legacy-system-modernization',
  'expert',
  'enterprise',
  'very-high',
  `Review this legacy Promethean Framework system that needs modernization:

\`\`\`typescript
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
\`\`\`

Design a comprehensive refactoring strategy to modernize this legacy system while maintaining backward compatibility.`,
  `The agent should identify:
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
15. Missing modern TypeScript features and patterns`,
);

// Debugging Prompts
await createBenchmarkFile(
  'debugging',
  'complex-bug-investigation',
  'hard',
  'large',
  'high',
  `Investigate this complex bug in the Promethean Framework's agent coordination system:

**Bug Report:** Tasks are randomly disappearing from the kanban board under high load.

**Symptoms:**
- Tasks vanish from the database without any deletion logs
- Only occurs when >100 agents are processing tasks simultaneously
- No error messages or exceptions in logs
- Affects both completed and in-progress tasks

**Code Context:**
\`\`\`typescript
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
\`\`\`

Analyze the code to identify the root cause of the disappearing tasks and propose a comprehensive fix.`,
  `The agent should identify:
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
14. Missing monitoring and alerting for task lifecycle events`,
);

// Migration Prompts
await createBenchmarkFile(
  'migration',
  'typescript-to-clojurescript',
  'expert',
  'enterprise',
  'very-high',
  `Plan the migration of this TypeScript package to ClojureScript for the Promethean Framework:

**Current TypeScript Package:**
\`\`\`typescript
// packages/task-core/src/task-manager.ts
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  assignee?: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  dependencies: string[];
}

export class TaskManager {
  private tasks: Map<string, Task> = new Map();
  private eventEmitter: EventEmitter;
  
  constructor(eventEmitter: EventEmitter) {
    this.eventEmitter = eventEmitter;
  }
  
  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const task: Task = {
      ...taskData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.tasks.set(task.id, task);
    this.eventEmitter.emit('task:created', task);
    
    return task;
  }
  
  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const task = this.tasks.get(id);
    if (!task) {
      throw new Error('Task not found');
    }
    
    const updatedTask = { ...task, ...updates, updatedAt: new Date() };
    this.tasks.set(id, updatedTask);
    this.eventEmitter.emit('task:updated', updatedTask);
    
    return updatedTask;
  }
  
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

// Usage in other packages
import { TaskManager, Task } from '@promethean/task-core';
\`\`\`

**Requirements:**
1. Maintain full API compatibility with existing TypeScript consumers
2. Leverage ClojureScript's strengths (immutability, functional programming)
3. Integrate with existing Promethean Framework infrastructure
4. Support both ClojureScript and TypeScript development workflows
5. Maintain performance characteristics
6. Ensure smooth migration path with zero downtime

Design a comprehensive migration strategy and provide the initial ClojureScript implementation.`,
  `The agent should identify:
1. Need for interop layer between TypeScript and ClojureScript
2. Strategy for maintaining API compatibility during transition
3. Approach for handling TypeScript interfaces in ClojureScript
4. Plan for migrating event system to ClojureScript patterns
5. Strategy for maintaining immutable data structures
6. Approach for error handling and validation in ClojureScript
7. Plan for build system integration (shadow-cljs with existing TypeScript build)
8. Strategy for testing both implementations during migration
9. Approach for documentation and developer experience
10. Plan for gradual migration of dependent packages
11. Strategy for performance optimization in ClojureScript
12. Approach for debugging and development tools
13. Plan for deployment and bundling considerations
14. Strategy for team training and knowledge transfer`,
);

// Kanban Prompts
await createBenchmarkFile(
  'kanban',
  'workflow-optimization',
  'medium',
  'medium',
  'medium',
  `Review this kanban workflow implementation for the Promethean Framework:

\`\`\`typescript
export class KanbanWorkflow {
  private columns = ['incoming', 'ready', 'todo', 'in-progress', 'testing', 'done'];
  private wipLimits = {
    'todo': 10,
    'in-progress': 5,
    'testing': 8
  };
  
  async moveTask(taskId: string, fromColumn: string, toColumn: string): Promise<boolean> {
    // Check if move is valid
    if (!this.isValidTransition(fromColumn, toColumn)) {
      throw new Error('Invalid workflow transition');
    }
    
    // Check WIP limits
    if (this.wipLimits[toColumn]) {
      const currentCount = await this.getTaskCount(toColumn);
      if (currentCount >= this.wipLimits[toColumn]) {
        throw new Error('WIP limit exceeded');
      }
    }
    
    // Move the task
    await this.updateTaskColumn(taskId, toColumn);
    
    // Simple notification
    console.log(\`Task \${taskId} moved from \${fromColumn} to \${toColumn}\`);
    
    return true;
  }
  
  private isValidTransition(from: string, to: string): boolean {
    // Hard-coded transition rules
    const validTransitions = {
      'incoming': ['ready'],
      'ready': ['todo'],
      'todo': ['in-progress'],
      'in-progress': ['testing', 'todo'],
      'testing': ['done', 'in-progress'],
      'done': []
    };
    
    return validTransitions[from]?.includes(to) || false;
  }
  
  // Missing features:
  // - No swimlanes
  // - No task dependencies
  // - No cycle time tracking
  // - No bottleneck detection
  // - No automated workflow suggestions
}
\`\`\`

Identify workflow optimization opportunities and design improvements for enterprise-scale kanban operations.`,
  `The agent should identify:
1. Missing swimlane support for different work types
2. No task dependency management and blocking
3. Missing cycle time and lead time metrics
4. No bottleneck detection and analysis
5. Missing workflow analytics and optimization suggestions
6. No automated task assignment based on capacity
7. Missing integration with external systems (CI/CD, monitoring)
8. No customizable workflow definitions per team/project
9. Missing advanced WIP limit strategies (class of service)
10. No workflow simulation and what-if analysis
11. Missing historical data analysis for process improvement
12. No integration with team capacity planning
13. Missing automated workflow rule enforcement
14. No support for distributed teams and time zones`,
);

// Agent Development Prompts
await createBenchmarkFile(
  'agent-development',
  'multi-agent-orchestration',
  'expert',
  'enterprise',
  'very-high',
  `Design a multi-agent orchestration system for the Promethean Framework:

**Requirements:**
- Coordinate 1000+ specialized agents
- Handle complex task dependencies and workflows
- Support dynamic agent creation and destruction
- Provide fault tolerance and self-healing
- Enable agent communication and collaboration
- Support real-time monitoring and optimization

**Current Basic Implementation:**
\`\`\`typescript
export class BasicAgentOrchestrator {
  private agents: Map<string, Agent> = new Map();
  private taskQueue: Task[] = [];
  
  async registerAgent(agent: Agent): Promise<void> {
    this.agents.set(agent.id, agent);
  }
  
  async submitTask(task: Task): Promise<void> {
    this.taskQueue.push(task);
    await this.processQueue();
  }
  
  private async processQueue(): Promise<void> {
    while (this.taskQueue.length > 0) {
      const task = this.taskQueue.shift()!;
      const agent = this.selectAgent(task);
      
      if (agent) {
        await agent.process(task);
      } else {
        // No available agent - task is dropped
        console.log('No agent available for task:', task.id);
      }
    }
  }
  
  private selectAgent(task: Task): Agent | null {
    // Simple random selection
    const agents = Array.from(this.agents.values());
    return agents[Math.floor(Math.random() * agents.length)];
  }
}
\`\`\`

Design a comprehensive multi-agent orchestration architecture that addresses enterprise-scale requirements including:
1. Agent lifecycle management
2. Task scheduling and dependency resolution
3. Load balancing and resource optimization
4. Fault tolerance and recovery
5. Agent communication protocols
6. Performance monitoring and optimization
7. Security and access control
8. Scalability and elasticity

Provide detailed implementation plans and code examples for key components.`,
  `The agent should identify:
1. Need for sophisticated task scheduling with dependency graphs
2. Missing agent capability matching and selection algorithms
3. No resource management and capacity planning
4. Missing fault tolerance and retry mechanisms
5. No agent communication and collaboration protocols
6. Missing monitoring, observability, and performance metrics
7. No security model for agent interactions
8. Missing dynamic scaling and auto-scaling capabilities
9. No distributed coordination for multi-node deployment
10. Missing event-driven architecture for agent coordination
11. No agent state management and persistence
12. Missing workflow orchestration and business process support
13. No agent marketplace or discovery service
14. Missing testing and simulation capabilities
15. No integration with external systems and APIs`,
);

console.log('All remaining benchmarks generated successfully!');
