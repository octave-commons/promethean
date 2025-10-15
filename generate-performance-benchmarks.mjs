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

// Performance Prompts
await createBenchmarkFile(
  'performance',
  'memory-optimization',
  'medium',
  'medium',
  'medium',
  `Review this Promethean Framework agent code for memory optimization opportunities:

\`\`\`typescript
class AgentProcessor {
  private cache: Map<string, any> = new Map();
  private activeTasks: Task[] = [];
  private results: Result[] = [];
  
  async processBatch(tasks: Task[]): Promise<Result[]> {
    // Load all tasks into memory
    this.activeTasks = [...tasks];
    
    for (const task of tasks) {
      const result = await this.processTask(task);
      this.results.push(result);
      
      // Cache every result
      this.cache.set(task.id, result);
    }
    
    return this.results;
  }

  private async processTask(task: Task): Promise<Result> {
    // Create large intermediate objects
    const context = {
      task: task,
      metadata: this.generateLargeMetadata(),
      history: await this.getFullHistory(task.id),
      dependencies: await this.getAllDependencies(task)
    };
    
    const result = await this.executeWithLargeContext(context);
    
    // Keep context in memory for potential reuse
    (task as any).lastContext = context;
    
    return result;
  }

  private generateLargeMetadata(): any {
    // Generate 1MB of metadata
    return {
      timestamp: Date.now(),
      agent: this.agentInfo,
      environment: process.env,
      systemInfo: require('os').userInfo(),
      // ... many more properties
    };
  }
}
\`\`\`

Identify memory leaks and optimization opportunities for enterprise-scale agent processing.`,
  `The agent should identify:
1. Memory leaks from cached objects never being cleared
2. Large object creation in hot paths
3. Missing memory limits and cleanup
4. Inefficient data structures for large datasets
5. Missing streaming for large data processing
6. No memory monitoring or alerts
7. Potential memory fragmentation
8. Missing object pooling for frequently created objects
9. No garbage collection optimization
10. Missing memory profiling hooks`,
);

await createBenchmarkFile(
  'performance',
  'database-query-optimization',
  'hard',
  'large',
  'high',
  `Review this database access code for the Promethean Framework's kanban system:

\`\`\`typescript
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
      params.push(\`%\${query}%\`);
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
\`\`\`

Identify database performance issues and design an optimized data access strategy for high-load kanban operations.`,
  `The agent should identify:
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
12. No prepared statement usage`,
);

await createBenchmarkFile(
  'performance',
  'concurrency-and-scaling',
  'expert',
  'enterprise',
  'very-high',
  `Review this concurrent agent orchestration code for scalability issues:

\`\`\`typescript
class AgentOrchestrator {
  private agents: Agent[] = [];
  private taskQueue: Task[] = [];
  private maxConcurrency = 10;
  
  async processWorkload(workload: Workload): Promise<BatchResult> {
    const results: Result[] = [];
    const promises: Promise<Result>[] = [];
    
    // Unbounded concurrency
    for (const task of workload.tasks) {
      const promise = this.executeTask(task);
      promises.push(promise);
      
      // No concurrency limiting
      if (promises.length >= this.maxConcurrency) {
        const settled = await Promise.allSettled(promises);
        results.push(...this.extractResults(settled));
        promises.length = 0;
      }
    }
    
    // Process remaining promises
    if (promises.length > 0) {
      const settled = await Promise.allSettled(promises);
      results.push(...this.extractResults(settled));
    }
    
    return { results, total: workload.tasks.length };
  }

  private async executeTask(task: Task): Promise<Result> {
    // No resource management or backpressure
    const agent = this.selectAgent(task);
    
    // No timeout or cancellation
    const result = await agent.process(task);
    
    // No circuit breaker pattern
    return result;
  }

  async scaleHorizontally(requestCount: number): Promise<void> {
    // Naive scaling approach
    const currentLoad = this.getCurrentLoad();
    
    if (currentLoad > 0.8) {
      // Add more agents without considering resource limits
      for (let i = 0; i < 5; i++) {
        const agent = new Agent();
        await agent.start();
        this.agents.push(agent);
      }
    }
  }

  private selectAgent(task: Task): Agent {
    // Simple round-robin without considering agent load
    const index = Math.floor(Math.random() * this.agents.length);
    return this.agents[index];
  }
}
\`\`\`

Identify concurrency and scalability bottlenecks for enterprise-scale agent orchestration processing millions of tasks.`,
  `The agent should identify:
1. Missing proper concurrency limiting and backpressure
2. No resource pooling or management
3. Missing circuit breaker patterns for fault tolerance
4. No load balancing strategies
5. Missing timeout and cancellation mechanisms
6. No monitoring or metrics for scaling decisions
7. Missing distributed coordination for multi-instance deployment
8. No graceful degradation under load
9. Missing rate limiting and throttling
10. No auto-scaling based on metrics
11. Missing deadlock detection and prevention
12. No resource exhaustion protection
13. Missing distributed tracing for performance analysis
14. No proper error handling and retry strategies
15. Missing data partitioning strategies for scale`,
);

console.log('Performance benchmarks generated successfully!');
