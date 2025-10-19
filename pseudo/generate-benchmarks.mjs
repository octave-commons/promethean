import fs from 'fs/promises';
import path from 'path';

// Create a simple function to generate individual files
async function createBenchmarkFile(category, name, difficulty, scale, complexity, content, answer) {
  const dir = `/home/err/devel/promethean/docs/benchmarks/prompts/${category}`;
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

// Code Review Prompts
await createBenchmarkFile(
  'code-review',
  'typescript-type-safety',
  'easy',
  'small',
  'low',
  `Review this TypeScript code for type safety issues and suggest improvements:

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
  `The agent should identify:
1. Missing type annotations for function parameters
2. Use of 'any' type that should be more specific
3. Missing return type annotations
4. Potential null/undefined issues
5. Interface vs type usage inconsistencies`,
);

await createBenchmarkFile(
  'code-review',
  'functional-programming-patterns',
  'medium',
  'medium',
  'medium',
  `Review this code for adherence to functional programming principles in the Promethean Framework:

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
  `The agent should identify:
1. Mutation of input arrays (non-functional)
2. Missing pure function principles
3. Side effects in data transformation
4. Opportunities for immutability
5. Better functional composition patterns`,
);

await createBenchmarkFile(
  'code-review',
  'error-handling-patterns',
  'medium',
  'medium',
  'medium',
  `Review this error handling code in a Promethean Framework service:

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
  `The agent should identify:
1. Generic error catching without specific handling
2. Inconsistent error logging approaches
3. Missing error context and metadata
4. Poor error recovery strategies
5. Need for custom error types and proper error propagation`,
);

await createBenchmarkFile(
  'code-review',
  'async-patterns-review',
  'hard',
  'large',
  'high',
  `Review this async code for performance and correctness issues in a Promethean Framework agent:

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
  `The agent should identify:
1. Sequential execution where parallel would be better
2. Missing concurrency limits and resource management
3. Poor error handling in batch processing
4. Inefficient dependency fetching
5. Memory leaks in timeout handling
6. Missing cancellation token support
7. Need for proper backpressure handling`,
);

await createBenchmarkFile(
  'code-review',
  'security-code-review',
  'expert',
  'enterprise',
  'very-high',
  `Perform a comprehensive security review of this MCP tool implementation:

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
  `The agent should identify:
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
);

console.log('Code review benchmarks generated successfully!');
