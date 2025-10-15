import fs from 'fs/promises';
import path from 'path';

// Define categories and their prompts
const benchmarkPrompts = {
  'code-review': [
    {
      name: 'typescript-type-safety',
      difficulty: 'easy',
      scale: 'small',
      complexity: 'low',
      content: `Review this TypeScript code for type safety issues and suggest improvements:

\`\`\`typescript
function processUserData(data: any) {
  const result = {
    id: data.id,
    name: data.firstName + ' ' + data.lastName,
    email: data.emailAddress,
    age: data.age
  };
  
  return result;
}

function validateUser(user) {
  if (user.age < 18) {
    return false;
  }
  return true;
}

const userData = processUserData({
  id: '123',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  age: 25
});

console.log(userData.name);
\`\`\`

Identify all type safety issues and provide a refactored version with proper TypeScript types.`,
      answer: `The agent should identify:
1. Missing type annotations for function parameters
2. Use of 'any' type that should be more specific
3. Missing return type annotations
4. Potential null/undefined issues
5. Interface vs type usage inconsistencies`,
    },
    {
      name: 'functional-programming-patterns',
      difficulty: 'medium',
      scale: 'medium',
      complexity: 'medium',
      content: `Review this code for adherence to functional programming principles in the Promethean Framework:

\`\`\`typescript
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
\`\`\`

Identify violations of functional programming principles and refactor to be more idiomatic for the Promethean Framework's functional style.`,
      answer: `The agent should identify:
1. Mutation of input arrays (non-functional)
2. Missing pure function principles
3. Side effects in data transformation
4. Opportunities for immutability
5. Better functional composition patterns`,
    },
    {
      name: 'error-handling-patterns',
      difficulty: 'medium',
      scale: 'medium',
      complexity: 'medium',
      content: `Review this error handling code in a Promethean Framework service:

\`\`\`typescript
class MCPService {
  async executeCommand(command: string, params: any[]) {
    try {
      const result = await this.client.execute(command, params);
      return result;
    } catch (error) {
      console.log('Error executing command:', error);
      return null;
    }
  }

  async processFile(filePath: string) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(content);
      return parsed;
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('File not found');
      } else if (error instanceof SyntaxError) {
        console.log('Invalid JSON');
      }
      throw error;
    }
  }

  async validateInput(input: unknown) {
    if (!input || typeof input !== 'object') {
      throw new Error('Invalid input');
    }
    
    const obj = input as any;
    if (!obj.id || !obj.type) {
      throw new Error('Missing required fields');
    }
    
    return true;
  }
}
\`\`\`

Identify error handling anti-patterns and suggest improvements following Promethean Framework best practices.`,
      answer: `The agent should identify:
1. Generic error catching without specific handling
2. Inconsistent error logging approaches
3. Missing error context and metadata
4. Poor error recovery strategies
5. Need for custom error types and proper error propagation`,
    },
    {
      name: 'async-patterns-review',
      difficulty: 'hard',
      scale: 'large',
      complexity: 'high',
      content: `Review this async code for performance and correctness issues in a Promethean Framework agent:

\`\`\`typescript
class AgentOrchestrator {
  private agents: Agent[] = [];
  
  async executeTask(task: Task): Promise<Result[]> {
    const results: Result[] = [];
    
    // Sequential execution
    for (const agent of this.agents) {
      const result = await agent.process(task);
      results.push(result);
    }
    
    return results;
  }

  async processBatch(tasks: Task[]): Promise<Result[]> {
    const allResults: Result[] = [];
    
    for (const task of tasks) {
      try {
        const results = await this.executeTask(task);
        allResults.push(...results);
      } catch (error) {
        console.error('Task failed:', task.id, error);
      }
    }
    
    return allResults;
  }

  async fetchDependencies(task: Task): Promise<Dependency[]> {
    const deps: Dependency[] = [];
    
    // Fetch all dependencies sequentially
    for (const depId of task.dependencies) {
      const dep = await this.dependencyService.get(depId);
      if (dep) {
        deps.push(dep);
      }
    }
    
    return deps;
  }

  async runWithTimeout<T>(fn: () => Promise<T>, timeout: number): Promise<T> {
    let timeoutId: NodeJS.Timeout;
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('Timeout')), timeout);
    });
    
    try {
      return await Promise.race([fn(), timeoutPromise]);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
\`\`\`

Identify async/await anti-patterns, performance bottlenecks, and suggest improvements for enterprise-scale agent orchestration.`,
      answer: `The agent should identify:
1. Sequential execution where parallel would be better
2. Missing concurrency limits and resource management
3. Poor error handling in batch processing
4. Inefficient dependency fetching
5. Memory leaks in timeout handling
6. Missing cancellation token support
7. Need for proper backpressure handling`,
    },
    {
      name: 'security-code-review',
      difficulty: 'expert',
      scale: 'enterprise',
      complexity: 'very-high',
      content: `Perform a comprehensive security review of this MCP tool implementation:

\`\`\`typescript
export class FileOperationsTool {
  constructor(private config: ToolConfig) {}

  async readFile(filePath: string): Promise<string> {
    // Direct file system access without validation
    const fullPath = path.join(this.config.basePath, filePath);
    return fs.readFileSync(fullPath, 'utf8');
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    const fullPath = path.join(this.config.basePath, filePath);
    
    // Create directory if it doesn't exist
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(fullPath, content);
  }

  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(this.config.basePath, filePath);
    fs.unlinkSync(fullPath);
  }

  async listFiles(directory: string): Promise<string[]> {
    const fullPath = path.join(this.config.basePath, directory);
    return fs.readdirSync(fullPath);
  }

  async executeCommand(command: string, args: string[]): Promise<string> {
    // Direct command execution
    const { execSync } = require('child_process');
    const cmd = command + ' ' + args.join(' ');
    return execSync(cmd, { encoding: 'utf8' });
  }

  validatePath(filePath: string): boolean {
    // Basic validation
    return !filePath.includes('..') && !filePath.startsWith('/');
  }
}
\`\`\`

Identify all security vulnerabilities and provide a secure implementation following Promethean Framework security standards.`,
      answer: `The agent should identify:
1. Path traversal vulnerabilities
2. Command injection risks
3. Missing authorization checks
4. Inadequate input validation
5. Resource exhaustion vulnerabilities
6. Missing audit logging
7. Insecure file permissions
8. Need for sandboxing
9. Missing rate limiting
10. Insufficient error handling for security`,
    },
  ],

  documentation: [
    {
      name: 'api-documentation-review',
      difficulty: 'easy',
      scale: 'small',
      complexity: 'low',
      content: `Review this API documentation for completeness and clarity:

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
      answer: `The agent should identify:
1. Missing parameter type descriptions
2. Incomplete return type documentation
3. Missing examples and usage patterns
4. No error documentation
5. Missing @throws annotations
6. Incomplete class-level documentation
7. Missing cross-references to related APIs`,
    },
    {
      name: 'readme-structure-review',
      difficulty: 'medium',
      scale: 'medium',
      complexity: 'medium',
      content: `Review this README.md for a Promethean Framework package:

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
      answer: `The agent should identify:
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
    },
    {
      name: 'code-comment-review',
      difficulty: 'medium',
      scale: 'medium',
      complexity: 'medium',
      content: `Review the code comments in this Promethean Framework module:

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
      answer: `The agent should identify:
1. Redundant comments that repeat the code
2. Missing JSDoc format and type information
3. No documentation of side effects
4. Missing parameter and return type documentation
5. No error condition documentation
6. Missing examples in complex methods
7. Inconsistent comment style
8. Missing architectural decision documentation`,
    },
    {
      name: 'technical-writing-assessment',
      difficulty: 'hard',
      scale: 'large',
      complexity: 'high',
      content: `Review this technical documentation for the Promethean Framework's Agent OS:

\`\`\`markdown
# Agent OS Architecture

The Agent OS is a system for running AI agents. It has components that work together.

## Components

### Core
The core handles basic operations.

### Message System
Agents communicate using messages.

### Context Manager
Manages agent context.

### Protocol Layer
Handles communication protocols.

## Usage

Create an agent and run it.

## Configuration

Configure the system using config files.

## Deployment

Deploy to production using Docker.
\`\`\`

This documentation is for a critical system component. Identify all deficiencies and rewrite it to meet enterprise documentation standards.`,
      answer: `The agent should identify:
1. Vague and incomplete descriptions
2. Missing architectural diagrams
3. No specific examples or code snippets
4. Missing API specifications
5. No performance characteristics
6. Missing security considerations
7. No troubleshooting or monitoring info
8. Incomplete configuration documentation
9. Missing scalability information
10. No version compatibility details`,
    },
    {
      name: 'documentation-architecture-review',
      difficulty: 'expert',
      scale: 'enterprise',
      complexity: 'very-high',
      content: `Review the documentation structure for the entire Promethean Framework. Current structure:

\`\`\`
docs/
├── README.md
├── agents/
│   ├── agent1.md
│   └── agent2.md
├── api/
│   └── rest.md
└── guides/
    ├── setup.md
    └── deployment.md
\`\`\`

The framework has 50+ packages, multiple agent types, complex configuration, and enterprise deployment requirements. Analyze the current documentation architecture and design a comprehensive documentation strategy that scales with the framework's complexity.`,
      answer: `The agent should identify:
1. Missing documentation hierarchy and taxonomy
2. No documentation generation automation
3. Missing API reference auto-generation
4. No versioning strategy for documentation
5. Missing developer onboarding path
6. No architectural decision records (ADRs)
7. Missing troubleshooting and debugging guides
8. No performance and scaling documentation
9. Missing security and compliance documentation
10. No integration testing documentation
11. Missing contribution guidelines
12. No documentation quality metrics`,
    },
  ],

  testing: [
    {
      name: 'unit-test-coverage',
      difficulty: 'easy',
      scale: 'small',
      complexity: 'low',
      content: `Review this test file for coverage and quality:

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
      answer: `The agent should identify:
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
    },
    {
      name: 'test-doubles-and-mocks',
      difficulty: 'medium',
      scale: 'medium',
      complexity: 'medium',
      content: `Review this test that uses mocks for a Promethean Framework service:

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
      answer: `The agent should identify:
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
    },
    {
      name: 'integration-testing-strategy',
      difficulty: 'hard',
      scale: 'large',
      complexity: 'high',
      content: `Review this integration test for the Promethean Framework's kanban system:

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
      answer: `The agent should identify:
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
    },
    {
      name: 'performance-testing-design',
      difficulty: 'expert',
      scale: 'enterprise',
      complexity: 'very-high',
      content: `Design a comprehensive performance testing strategy for the Promethean Framework's agent orchestration system. The system needs to handle:

- 1000+ concurrent agents
- 10,000+ tasks per hour
- Sub-second response times
- Memory usage under 2GB
- 99.9% uptime

Current performance test:

\`\`\`typescript
test('Performance test', async t => {
  const startTime = Date.now();
  
  for (let i = 0; i < 100; i++) {
    await agent.process(createTask());
  }
  
  const duration = Date.now() - startTime;
  t.true(duration < 5000); // 5 seconds
});
\`\`\`

Analyze the current approach and design a production-ready performance testing suite.`,
      answer: `The agent should identify:
1. Missing realistic load patterns
2. No baseline or benchmark establishment
3. Missing resource utilization monitoring
4. No testing of memory leaks
5. Missing scalability testing
6. No testing under failure conditions
7. Missing performance regression detection
8. No testing of different deployment scenarios
9. Missing performance profiling and analysis
10. No continuous performance monitoring
11. Missing performance SLA definition
12. No testing of performance degradation over time`,
    },
  ],

  security: [
    {
      name: 'input-validation-security',
      difficulty: 'medium',
      scale: 'medium',
      complexity: 'medium',
      content: `Review this input validation code for security vulnerabilities:

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
      answer: `The agent should identify:
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
    },
    {
      name: 'authentication-authorization-review',
      difficulty: 'hard',
      scale: 'large',
      complexity: 'high',
      content: `Review this authentication and authorization implementation:

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
      answer: `The agent should identify:
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
    },
    {
      name: 'enterprise-security-audit',
      difficulty: 'expert',
      scale: 'enterprise',
      complexity: 'very-high',
      content: `Perform a comprehensive security audit of this Promethean Framework MCP tool implementation:

\`\`\`typescript
export class SystemMCPTool {
  constructor(
    private config: SystemConfig,
    private logger: Logger
  ) {}

  async executeSystemCommand(command: string, args: string[]): Promise<string> {
    // Execute system command with user input
    const { execSync } = require('child_process');
    const fullCommand = \`\${command} \${args.join(' ')}\`;
    
    this.logger.info('Executing command:', fullCommand);
    
    try {
      const result = execSync(fullCommand, { 
        encoding: 'utf8',
        timeout: 30000
      });
      return result;
    } catch (error) {
      this.logger.error('Command failed:', error.message);
      throw error;
    }
  }

  async readFile(filePath: string): Promise<string> {
    // Read file with user-provided path
    const resolvedPath = path.resolve(this.config.workingDirectory, filePath);
    return fs.readFileSync(resolvedPath, 'utf8');
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    const resolvedPath = path.resolve(this.config.workingDirectory, filePath);
    
    // Ensure directory exists
    const dir = path.dirname(resolvedPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(resolvedPath, content);
  }

  async networkRequest(url: string, options: any = {}): Promise<any> {
    // Make HTTP request to user-provided URL
    const response = await fetch(url, options);
    return response.json();
  }

  validateAccess(user: User, operation: string): boolean {
    // Simple access check
    return user.role === 'admin' || 
           this.config.allowedOperations.includes(operation);
  }
}
\`\`\`

Identify all security vulnerabilities and provide a secure implementation suitable for enterprise deployment.`,
      answer: `The agent should identify:
1. Command injection vulnerabilities
2. Path traversal attacks
3. Arbitrary file write vulnerabilities
4. Server-side request forgery (SSRF)
5. Missing input sanitization and validation
6. Inadequate access control mechanisms
7. Missing security headers and CSP
8. No audit logging for security events
9. Missing rate limiting and DoS protection
10. Insufficient error handling that leaks information
11. Missing secure configuration management
12. No encryption for sensitive data
13. Missing security testing and validation
14. No incident response procedures
15. Missing compliance and regulatory considerations`,
    },
  ],
};

// Generate all the benchmark files
async function generateBenchmarks() {
  const baseDir = '/home/err/devel/promethean/docs/benchmarks/prompts';

  for (const [category, prompts] of Object.entries(benchmarkPrompts)) {
    const categoryDir = path.join(baseDir, category);

    for (const prompt of prompts) {
      const filePath = path.join(categoryDir, `${prompt.name}.md`);
      const content = `---
difficulty: ${prompt.difficulty}
scale: ${prompt.scale}
complexity: ${prompt.complexity}
answer: |
  ${prompt.answer}
---

${prompt.content}`;

      try {
        await fs.promises.writeFile(filePath, content, 'utf8');
        console.log(`Generated: ${filePath}`);
      } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
      }
    }
  }
}

generateBenchmarks().catch(console.error);
