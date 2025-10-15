import fs from 'fs/promises';
import path from 'path';

async function createBenchmarkFile(category, name, difficulty, scale, complexity, content, answer) {
  const dir = `/home/err/devel/promethean/docs/benchmarks/prompts/${category}`;

  // Ensure directory exists
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

// Documentation Prompts
await createBenchmarkFile(
  'documentation',
  'api-documentation-review',
  'easy',
  'small',
  'low',
  `Review this API documentation for completeness and clarity:

\`\`\`typescript
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
\`\`\`

Identify documentation issues and improve according to Promethean Framework standards.`,
  `The agent should identify:
1. Missing parameter type descriptions
2. Incomplete return type documentation
3. Missing examples and usage patterns
4. No error documentation
5. Missing @throws annotations
6. Incomplete class-level documentation
7. Missing cross-references to related APIs`,
);

await createBenchmarkFile(
  'documentation',
  'readme-structure-review',
  'medium',
  'medium',
  'medium',
  `Review this README.md for a Promethean Framework package:

\`\`\`markdown
# @promethean/agent-service

This package provides agent services.

## Installation

npm install @promethean/agent-service

## Usage

import { AgentService } from '@promethean/agent-service';

const service = new AgentService();
service.start();

## API

- AgentService
- start()
- stop()
- process()

## License

MIT
\`\`\`

Identify missing documentation elements and structure improvements needed for a production-ready package.`,
  `The agent should identify:
1. Missing package description and purpose
2. Incomplete installation instructions
3. Missing configuration options
4. No usage examples
5. Incomplete API documentation
6. Missing development setup
7. No contributing guidelines
8. Missing troubleshooting section
9. No changelog or version info
10. Missing prerequisites and requirements`,
);

await createBenchmarkFile(
  'documentation',
  'code-comment-review',
  'medium',
  'medium',
  'medium',
  `Review the code comments in this Promethean Framework module:

\`\`\`typescript
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
\`\`\`

Identify comment quality issues and suggest improvements following documentation-driven development practices.`,
  `The agent should identify:
1. Redundant comments that repeat the code
2. Missing JSDoc format and type information
3. No documentation of side effects
4. Missing parameter and return type documentation
5. No error condition documentation
6. Missing examples in complex methods
7. Inconsistent comment style
8. Missing architectural decision documentation`,
);

// Testing Prompts
await createBenchmarkFile(
  'testing',
  'unit-test-coverage',
  'easy',
  'small',
  'low',
  `Review this test file for coverage and quality:

\`\`\`typescript
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
\`\`\`

Identify missing test cases and improve test quality following TDD best practices.`,
  `The agent should identify:
1. Missing error case testing
2. No edge case coverage
3. Missing boundary condition tests
4. No integration with dependencies
5. Missing async error handling tests
6. No performance or load testing
7. Missing validation tests
8. No cleanup or teardown
9. Missing test organization and structure
10. No test documentation or descriptions`,
);

await createBenchmarkFile(
  'testing',
  'test-doubles-and-mocks',
  'medium',
  'medium',
  'medium',
  `Review this test that uses mocks for a Promethean Framework service:

\`\`\`typescript
import { test } from 'ava';
import sinon from 'sinon';

import { MCPService } from '../src/mcp-service';
import { Database } from '../src/database';

test('MCPService processes message', async t => {
  const dbStub = sinon.createStubInstance(Database);
  dbStub.get.returns(Promise.resolve({ id: '123', data: 'test' }));
  
  const service = new MCPService(dbStub as any);
  const result = await service.processMessage({
    type: 'test',
    payload: { id: '123' }
  });
  
  t.truthy(result.success);
  t.true(dbStub.get.called);
});

test('MCPService handles error', async t => {
  const dbStub = sinon.createStubInstance(Database);
  dbStub.get.throws(new Error('DB Error'));
  
  const service = new MCPService(dbStub as any);
  const result = await service.processMessage({
    type: 'test',
    payload: { id: '123' }
  });
  
  t.false(result.success);
});
\`\`\`

Identify mocking anti-patterns and suggest improvements for better test isolation and maintainability.`,
  `The agent should identify:
1. Over-mocking and testing implementation details
2. Missing verification of mock interactions
3. No setup/teardown for test isolation
4. Missing assertion on specific error types
5. Mock returning unrealistic data
6. No testing of edge cases with mocks
7. Missing integration test alternatives
8. Poor test naming and organization
9. No documentation of mock behavior
10. Missing test data factories`,
);

await createBenchmarkFile(
  'testing',
  'integration-testing-strategy',
  'hard',
  'large',
  'high',
  `Review this integration test for the Promethean Framework's kanban system:

\`\`\`typescript
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
\`\`\`

Identify integration testing issues and design a comprehensive integration testing strategy for the kanban system.`,
  `The agent should identify:
1. Missing test isolation and cleanup
2. No testing of concurrent operations
3. Missing failure scenarios and recovery
4. No performance testing under load
5. Missing database transaction testing
6. No event bus integration verification
7. Missing cross-service interaction testing
8. No testing of data consistency
9. Missing environment-specific testing
10. No testing of scaling behavior`,
);

// Security Prompts
await createBenchmarkFile(
  'security',
  'input-validation-security',
  'medium',
  'medium',
  'medium',
  `Review this input validation code for security vulnerabilities:

\`\`\`typescript
export class InputValidator {
  static validateFilePath(path: string): boolean {
    // Basic path validation
    return !path.includes('..') && !path.startsWith('/');
  }

  static validateTaskData(data: any): boolean {
    if (!data.title || typeof data.title !== 'string') {
      return false;
    }
    
    if (data.priority && !['P0', 'P1', 'P2', 'P3'].includes(data.priority)) {
      return false;
    }
    
    return true;
  }

  static sanitizeInput(input: string): string {
    return input.replace(/<script[^>]*>.*?<\/script>/gi, '');
  }

  static validateJSON(jsonString: string): boolean {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  }
}
\`\`\`

Identify security vulnerabilities and suggest improvements following security best practices.`,
  `The agent should identify:
1. Insufficient path traversal protection
2. Missing input length limits
3. Incomplete XSS protection
4. No validation of nested objects
5. Missing encoding/escaping strategies
6. No rate limiting considerations
7. Missing audit logging
8. No protection against injection attacks
9. Missing content-type validation
10. No handling of Unicode attacks`,
);

await createBenchmarkFile(
  'security',
  'authentication-authorization-review',
  'hard',
  'large',
  'high',
  `Review this authentication and authorization implementation:

\`\`\`typescript
export class AuthService {
  async authenticate(token: string): Promise<User | null> {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
      return await this.userRepository.findById(payload.userId);
    } catch (error) {
      return null;
    }
  }

  async authorize(user: User, resource: string, action: string): Promise<boolean> {
    // Simple role-based check
    if (user.role === 'admin') {
      return true;
    }
    
    if (action === 'read' && user.permissions.includes('read')) {
      return true;
    }
    
    if (action === 'write' && user.permissions.includes('write')) {
      return true;
    }
    
    return false;
  }

  async generateToken(user: User): Promise<string> {
    return jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );
  }
}
\`\`\`

Identify security vulnerabilities and design a robust auth/authz system for the Promethean Framework.`,
  `The agent should identify:
1. Missing token revocation mechanism
2. No protection against token replay
3. Insufficient authorization granularity
4. Missing audit logging for auth events
5. No rate limiting on auth attempts
6. Missing secure token storage
7. No multi-factor authentication
8. Missing session management
9. No protection against privilege escalation
10. Missing role hierarchy validation
11. No resource-based access control
12. Missing security headers implementation`,
);

console.log('All documentation, testing, and security benchmarks generated successfully!');
