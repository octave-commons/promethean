# AI Integration Guide

Learn how to integrate TaskAIManager into your existing workflows and applications.

## Integration Patterns

### 1. CLI Integration

Integrate AI capabilities into the kanban CLI:

```typescript
// src/cli/ai-commands.ts
import { TaskAIManager } from '../lib/task-content/ai.js';
import { createTaskContentManager } from '../lib/task-content/index.js';

export const aiCommands = {
  async analyze(taskUuid: string, type: string) {
    const aiManager = new TaskAIManager();

    const result = await aiManager.analyzeTask({
      uuid: taskUuid,
      analysisType: type as any,
    });

    if (result.success) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.error(`Analysis failed: ${result.error}`);
      process.exit(1);
    }
  },

  async improve(taskUuid: string, options: any) {
    const aiManager = new TaskAIManager();

    const result = await aiManager.rewriteTask({
      uuid: taskUuid,
      rewriteType: 'improve',
      ...options,
    });

    if (result.success) {
      console.log(`Task improved successfully`);
      console.log(`Changes: ${result.changes.summary}`);
    } else {
      console.error(`Improvement failed: ${result.error}`);
      process.exit(1);
    }
  },

  async breakdown(taskUuid: string, options: any) {
    const aiManager = new TaskAIManager();

    const result = await aiManager.breakdownTask({
      uuid: taskUuid,
      ...options,
    });

    if (result.success) {
      console.log(`Generated ${result.subtasks.length} subtasks`);
      result.subtasks.forEach((subtask, index) => {
        console.log(`${index + 1}. ${subtask.title}`);
        if (subtask.estimatedHours) {
          console.log(`   Estimated: ${subtask.estimatedHours}h`);
        }
      });
    } else {
      console.error(`Breakdown failed: ${result.error}`);
      process.exit(1);
    }
  },
};
```

Add to CLI handler:

```typescript
// src/cli/command-handlers.ts
import { aiCommands } from './ai-commands.js';

export async function handleAICommand(args: any[]) {
  const [command, taskUuid, ...options] = args;

  switch (command) {
    case 'analyze':
      await aiCommands.analyze(taskUuid, options[0] || 'quality');
      break;
    case 'improve':
      await aiCommands.improve(taskUuid, parseOptions(options));
      break;
    case 'breakdown':
      await aiCommands.breakdown(taskUuid, parseOptions(options));
      break;
    default:
      console.error(`Unknown AI command: ${command}`);
      break;
  }
}
```

### 2. Web Service Integration

Create REST API endpoints for AI operations:

```typescript
// src/services/ai-service.ts
import { TaskAIManager } from '../lib/task-content/ai.js';
import { createTaskContentManager } from '../lib/task-content/index.js';

export class AIService {
  private aiManager: TaskAIManager;

  constructor() {
    this.aiManager = new TaskAIManager({
      timeout: 120000, // 2 minutes for API requests
      temperature: 0.3,
    });
  }

  async analyzeTask(req: Request, res: Response) {
    try {
      const { uuid, analysisType, context } = req.body;

      const result = await this.aiManager.analyzeTask({
        uuid,
        analysisType,
        context,
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async rewriteTask(req: Request, res: Response) {
    try {
      const { uuid, rewriteType, instructions, targetAudience, tone } = req.body;

      const result = await this.aiManager.rewriteTask({
        uuid,
        rewriteType,
        instructions,
        targetAudience,
        tone,
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async breakdownTask(req: Request, res: Response) {
    try {
      const { uuid, breakdownType, maxSubtasks, complexity, includeEstimates } = req.body;

      const result = await this.aiManager.breakdownTask({
        uuid,
        breakdownType,
        maxSubtasks,
        complexity,
        includeEstimates,
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
```

Express.js integration:

```typescript
// src/web/server.ts
import express from 'express';
import { AIService } from '../services/ai-service.js';

const app = express();
const aiService = new AIService();

app.use(express.json());

// AI endpoints
app.post('/api/ai/analyze', aiService.analyzeTask.bind(aiService));
app.post('/api/ai/rewrite', aiService.rewriteTask.bind(aiService));
app.post('/api/ai/breakdown', aiService.breakdownTask.bind(aiService));

// Health check
app.get('/api/ai/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});
```

### 3. Automated Workflow Integration

Integrate AI into automated task processing pipelines:

```typescript
// src/workflows/task-processor.ts
import { TaskAIManager } from '../lib/task-content/ai.js';
import { TaskContentManager } from '../lib/task-content/index.js';

export class TaskProcessor {
  private aiManager: TaskAIManager;
  private contentManager: TaskContentManager;

  constructor() {
    this.aiManager = new TaskAIManager({
      temperature: 0.2, // More deterministic for automation
      timeout: 90000,
    });
    this.contentManager = createTaskContentManager('./docs/agile/tasks');
  }

  async processNewTask(uuid: string) {
    console.log(`Processing new task: ${uuid}`);

    // Step 1: Quality analysis
    const quality = await this.aiManager.analyzeTask({
      uuid,
      analysisType: 'quality',
      options: { createBackup: true },
    });

    if (!quality.success) {
      console.error(`Quality analysis failed: ${quality.error}`);
      return;
    }

    // Step 2: Auto-improve if quality is low
    if (quality.analysis.qualityScore < 60) {
      console.log(`Auto-improving task (quality: ${quality.analysis.qualityScore})`);

      const improvement = await this.aiManager.rewriteTask({
        uuid,
        rewriteType: 'improve',
        targetAudience: 'developer',
        tone: 'technical',
      });

      if (improvement.success) {
        console.log(`Task improved: ${improvement.changes.summary}`);
      }
    }

    // Step 3: Break down if complex
    const complexity = await this.aiManager.analyzeTask({
      uuid,
      analysisType: 'complexity',
    });

    if (complexity.success && complexity.analysis.complexityScore > 70) {
      console.log(
        `Breaking down complex task (complexity: ${complexity.analysis.complexityScore})`,
      );

      const breakdown = await this.aiManager.breakdownTask({
        uuid,
        breakdownType: 'subtasks',
        complexity: 'complex',
        maxSubtasks: 5,
        includeEstimates: true,
      });

      if (breakdown.success) {
        console.log(`Generated ${breakdown.subtasks.length} subtasks`);
        // Here you could create actual subtask files
      }
    }
  }

  async batchProcessTasks(uuids: string[]) {
    const results = await Promise.allSettled(uuids.map((uuid) => this.processNewTask(uuid)));

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    console.log(`Batch processing complete: ${successful} successful, ${failed} failed`);
  }
}
```

### 4. Git Hook Integration

Add AI analysis to git hooks:

```typescript
// scripts/git-hooks/pre-commit.ts
import { TaskAIManager } from '../lib/task-content/ai.js';
import { simpleGit } from 'simple-git';

async function preCommitHook() {
  const git = simpleGit();
  const aiManager = new TaskAIManager();

  // Get modified task files
  const status = await git.status();
  const modifiedTasks = status.modified
    .filter((file) => file.startsWith('docs/agile/tasks/') && file.endsWith('.md'))
    .map((file) => file.replace('docs/agile/tasks/', '').replace('.md', ''));

  if (modifiedTasks.length === 0) {
    console.log('No task files modified, skipping AI analysis');
    return;
  }

  console.log(`Analyzing ${modifiedTasks.length} modified tasks...`);

  for (const uuid of modifiedTasks) {
    const analysis = await aiManager.analyzeTask({
      uuid,
      analysisType: 'quality',
    });

    if (analysis.success && analysis.analysis.qualityScore < 50) {
      console.warn(`⚠️  Task ${uuid} has low quality score (${analysis.analysis.qualityScore})`);
      console.warn('Suggestions:');
      analysis.analysis.suggestions.forEach((suggestion) => {
        console.warn(`  - ${suggestion}`);
      });

      // Ask user if they want to continue
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const answer = await new Promise((resolve) => {
        rl.question('Continue with commit? (y/N) ', resolve);
      });

      rl.close();

      if (answer.toLowerCase() !== 'y') {
        console.log('Commit cancelled');
        process.exit(1);
      }
    }
  }

  console.log('AI analysis complete, proceeding with commit');
}

preCommitHook().catch((error) => {
  console.error('Pre-commit hook failed:', error);
  process.exit(1);
});
```

### 5. CI/CD Pipeline Integration

Add AI quality gates to CI/CD:

```typescript
// .github/workflows/ai-quality-check.yml
name: AI Quality Check

on:
  pull_request:
    paths:
      - 'docs/agile/tasks/**'

jobs:
  ai-quality-check:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd packages/kanban
          npm ci

      - name: Setup Ollama
        run: |
          curl -fsSL https://ollama.ai/install.sh | sh
          ollama serve &
          ollama pull qwen3:8b

      - name: Run AI Quality Check
        run: |
          cd packages/kanban
          node scripts/quality-check.js
```

Quality check script:

```typescript
// scripts/quality-check.js
import { TaskAIManager } from '../lib/task-content/ai.js';
import { simpleGit } from 'simple-git';

async function qualityCheck() {
  const git = simpleGit();
  const aiManager = new TaskAIManager();

  // Get changed files in PR
  const diff = await git.diff(['--name-only', 'origin/main...HEAD']);
  const changedTasks = diff
    .split('\n')
    .filter((file) => file.startsWith('docs/agile/tasks/') && file.endsWith('.md'))
    .map((file) => file.replace('docs/agile/tasks/', '').replace('.md', ''));

  if (changedTasks.length === 0) {
    console.log('No task files changed');
    return;
  }

  console.log(`Checking quality of ${changedTasks.length} tasks...`);

  let failedTasks = 0;

  for (const uuid of changedTasks) {
    const analysis = await aiManager.analyzeTask({
      uuid,
      analysisType: 'quality',
    });

    if (!analysis.success) {
      console.error(`❌ Failed to analyze ${uuid}: ${analysis.error}`);
      failedTasks++;
      continue;
    }

    const score = analysis.analysis.qualityScore;
    if (score < 60) {
      console.error(`❌ Task ${uuid} quality too low: ${score}/100`);
      console.error('Suggestions:');
      analysis.analysis.suggestions.forEach((suggestion) => {
        console.error(`  - ${suggestion}`);
      });
      failedTasks++;
    } else {
      console.log(`✅ Task ${uuid} quality OK: ${score}/100`);
    }
  }

  if (failedTasks > 0) {
    console.error(`\n❌ ${failedTasks} tasks failed quality check`);
    process.exit(1);
  }

  console.log('\n✅ All tasks passed quality check');
}

qualityCheck().catch((error) => {
  console.error('Quality check failed:', error);
  process.exit(1);
});
```

## Configuration Management

### Environment-Specific Configuration

```typescript
// config/ai-config.ts
interface AIConfig {
  development: TaskAIManagerConfig;
  staging: TaskAIManagerConfig;
  production: TaskAIManagerConfig;
}

export const aiConfig: AIConfig = {
  development: {
    model: 'qwen3:8b',
    baseUrl: 'http://localhost:11434',
    timeout: 60000,
    maxTokens: 2048,
    temperature: 0.3,
  },

  staging: {
    model: 'qwen3:8b',
    baseUrl: process.env.OLLAMA_URL || 'http://ollama:11434',
    timeout: 90000,
    maxTokens: 3072,
    temperature: 0.2,
  },

  production: {
    model: 'qwen3:8b',
    baseUrl: process.env.OLLAMA_URL || 'http://ollama:11434',
    timeout: 120000,
    maxTokens: 4096,
    temperature: 0.1,
  },
};

export function getAIConfig(): TaskAIManagerConfig {
  const env = process.env.NODE_ENV || 'development';
  return aiConfig[env as keyof AIConfig] || aiConfig.development;
}
```

### Dynamic Configuration

```typescript
// src/services/ai-config-manager.ts
export class AIConfigManager {
  private config: TaskAIManagerConfig;
  private watchers: Array<(config: TaskAIManagerConfig) => void> = [];

  constructor(initialConfig: TaskAIManagerConfig) {
    this.config = { ...initialConfig };
  }

  updateConfig(updates: Partial<TaskAIManagerConfig>) {
    this.config = { ...this.config, ...updates };
    this.notifyWatchers();
  }

  getConfig(): TaskAIManagerConfig {
    return { ...this.config };
  }

  watch(callback: (config: TaskAIManagerConfig) => void) {
    this.watchers.push(callback);
  }

  private notifyWatchers() {
    this.watchers.forEach((callback) => callback(this.getConfig()));
  }

  // Auto-adjust based on performance
  optimizeForPerformance(metrics: { avgResponseTime: number; errorRate: number }) {
    const updates: Partial<TaskAIManagerConfig> = {};

    if (metrics.avgResponseTime > 30000) {
      // Slow responses, reduce token limit
      updates.maxTokens = Math.max(1024, (this.config.maxTokens || 4096) * 0.8);
    }

    if (metrics.errorRate > 0.1) {
      // High error rate, increase timeout
      updates.timeout = Math.min(180000, (this.config.timeout || 60000) * 1.5);
    }

    if (Object.keys(updates).length > 0) {
      this.updateConfig(updates);
      console.log('AI config optimized:', updates);
    }
  }
}
```

## Monitoring and Observability

### Performance Monitoring

```typescript
// src/monitoring/ai-monitor.ts
export class AIMonitor {
  private metrics: {
    requests: number;
    errors: number;
    totalResponseTime: number;
    modelUsage: Record<string, number>;
  } = {
    requests: 0,
    errors: 0,
    totalResponseTime: 0,
    modelUsage: {},
  };

  recordRequest(result: any, processingTime: number) {
    this.metrics.requests++;
    this.metrics.totalResponseTime += processingTime;

    if (!result.success) {
      this.metrics.errors++;
    }

    const model = result.metadata?.model || 'unknown';
    this.metrics.modelUsage[model] = (this.metrics.modelUsage[model] || 0) + 1;
  }

  getMetrics() {
    const avgResponseTime =
      this.metrics.requests > 0 ? this.metrics.totalResponseTime / this.metrics.requests : 0;

    const errorRate = this.metrics.requests > 0 ? this.metrics.errors / this.metrics.requests : 0;

    return {
      ...this.metrics,
      avgResponseTime,
      errorRate,
    };
  }

  reset() {
    this.metrics = {
      requests: 0,
      errors: 0,
      totalResponseTime: 0,
      modelUsage: {},
    };
  }
}

// Wrap AI manager with monitoring
export function createMonitoredAIManager(config: TaskAIManagerConfig) {
  const aiManager = new TaskAIManager(config);
  const monitor = new AIMonitor();

  return {
    async analyzeTask(request: TaskAnalysisRequest) {
      const start = Date.now();
      const result = await aiManager.analyzeTask(request);
      const processingTime = Date.now() - start;

      monitor.recordRequest(result, processingTime);
      return result;
    },

    async rewriteTask(request: TaskRewriteRequest) {
      const start = Date.now();
      const result = await aiManager.rewriteTask(request);
      const processingTime = Date.now() - start;

      monitor.recordRequest(result, processingTime);
      return result;
    },

    async breakdownTask(request: TaskBreakdownRequest) {
      const start = Date.now();
      const result = await aiManager.breakdownTask(request);
      const processingTime = Date.now() - start;

      monitor.recordRequest(result, processingTime);
      return result;
    },

    getMetrics: () => monitor.getMetrics(),
    resetMetrics: () => monitor.reset(),
  };
}
```

### Logging Integration

```typescript
// src/logging/ai-logger.ts
import winston from 'winston';

export const aiLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.File({ filename: 'logs/ai-operations.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

export function logAIOperation(
  operation: string,
  request: any,
  result: any,
  processingTime: number,
) {
  aiLogger.info('AI Operation', {
    operation,
    request: {
      uuid: request.uuid,
      type: request.analysisType || request.rewriteType || request.breakdownType,
    },
    result: {
      success: result.success,
      error: result.error,
    },
    processingTime,
    timestamp: new Date().toISOString(),
  });
}
```

## Error Handling and Resilience

### Circuit Breaker Pattern

```typescript
// src/resilience/circuit-breaker.ts
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private threshold = 5,
    private timeout = 60000, // 1 minute
    private monitor = (state: string) => {},
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
        this.monitor('HALF_OPEN');
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      this.monitor('CLOSED');
    }
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
      this.monitor('OPEN');
    }
  }
}

// Usage with AI manager
export function createResilientAIManager(config: TaskAIManagerConfig) {
  const aiManager = new TaskAIManager(config);
  const circuitBreaker = new CircuitBreaker(
    5, // 5 failures trigger open
    60000, // 1 minute timeout
    (state) => console.log(`Circuit breaker state: ${state}`),
  );

  return {
    async analyzeTask(request: TaskAnalysisRequest) {
      return circuitBreaker.execute(() => aiManager.analyzeTask(request));
    },

    async rewriteTask(request: TaskRewriteRequest) {
      return circuitBreaker.execute(() => aiManager.rewriteTask(request));
    },

    async breakdownTask(request: TaskBreakdownRequest) {
      return circuitBreaker.execute(() => aiManager.breakdownTask(request));
    },
  };
}
```

## Testing Integration

### Mock AI Manager for Testing

```typescript
// src/test/mock-ai-manager.ts
export class MockTaskAIManager {
  private responses: Map<string, any> = new Map();

  setMockResponse(key: string, response: any) {
    this.responses.set(key, response);
  }

  async analyzeTask(request: TaskAnalysisRequest) {
    const key = `analyze-${request.uuid}-${request.analysisType}`;
    const mock = this.responses.get(key);

    if (mock) {
      return { ...mock, taskUuid: request.uuid, analysisType: request.analysisType };
    }

    // Default mock response
    return {
      success: true,
      taskUuid: request.uuid,
      analysisType: request.analysisType,
      analysis: {
        qualityScore: 75,
        suggestions: ['Mock suggestion'],
        risks: [],
        dependencies: [],
        subtasks: [],
      },
      metadata: {
        analyzedAt: new Date(),
        analyzedBy: 'mock',
        model: 'mock-model',
        processingTime: 100,
      },
    };
  }

  async rewriteTask(request: TaskRewriteRequest) {
    const key = `rewrite-${request.uuid}-${request.rewriteType}`;
    const mock = this.responses.get(key);

    if (mock) {
      return { ...mock, taskUuid: request.uuid, rewriteType: request.rewriteType };
    }

    return {
      success: true,
      taskUuid: request.uuid,
      rewriteType: request.rewriteType,
      originalContent: 'Original content',
      rewrittenContent: 'Rewritten content',
      changes: {
        summary: 'Mock changes',
        highlights: [],
        additions: ['New content'],
        modifications: [],
        removals: [],
      },
      metadata: {
        rewrittenAt: new Date(),
        rewrittenBy: 'mock',
        model: 'mock-model',
        processingTime: 150,
      },
    };
  }

  async breakdownTask(request: TaskBreakdownRequest) {
    const key = `breakdown-${request.uuid}-${request.breakdownType}`;
    const mock = this.responses.get(key);

    if (mock) {
      return { ...mock, taskUuid: request.uuid, breakdownType: request.breakdownType };
    }

    return {
      success: true,
      taskUuid: request.uuid,
      breakdownType: request.breakdownType,
      subtasks: [
        {
          title: 'Mock subtask 1',
          description: 'Mock description',
          estimatedHours: 2,
          priority: 'medium',
          dependencies: [],
          acceptanceCriteria: ['Mock criteria'],
        },
      ],
      totalEstimatedHours: 2,
      metadata: {
        breakdownAt: new Date(),
        breakdownBy: 'mock',
        model: 'mock-model',
        processingTime: 200,
      },
    };
  }
}
```

### Integration Tests

```typescript
// src/tests/ai-integration.test.ts
import test from 'ava';
import { TaskAIManager } from '../lib/task-content/ai.js';
import { MockTaskAIManager } from '../test/mock-ai-manager.js';

test('AI integration with real manager', async (t) => {
  // Skip if Ollama is not available
  if (!process.env.CI && !(await isOllamaAvailable())) {
    t.pass('Skipping test - Ollama not available');
    return;
  }

  const aiManager = new TaskAIManager({ timeout: 30000 });

  const result = await aiManager.analyzeTask({
    uuid: 'test-task',
    analysisType: 'quality',
  });

  t.true(result.success);
  t.is(result.taskUuid, 'test-task');
  t.true(typeof result.analysis.qualityScore === 'number');
});

test('AI integration with mock manager', async (t) => {
  const mockAI = new MockTaskAIManager();

  mockAI.setMockResponse('analyze-test-task-quality', {
    success: true,
    analysis: {
      qualityScore: 85,
      suggestions: ['Test suggestion'],
    },
  });

  const result = await mockAI.analyzeTask({
    uuid: 'test-task',
    analysisType: 'quality',
  });

  t.true(result.success);
  t.is(result.analysis.qualityScore, 85);
  t.deepEqual(result.analysis.suggestions, ['Test suggestion']);
});

async function isOllamaAvailable(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    return response.ok;
  } catch {
    return false;
  }
}
```

## Best Practices

### 1. Configuration Management

- Use environment-specific configurations
- Implement dynamic configuration updates
- Monitor and optimize based on performance metrics

### 2. Error Handling

- Implement circuit breakers for resilience
- Use retry logic with exponential backoff
- Provide meaningful error messages

### 3. Performance

- Monitor response times and error rates
- Implement caching for repeated requests
- Use batch processing for multiple operations

### 4. Testing

- Use mock AI managers for unit tests
- Implement integration tests with real AI
- Test error scenarios and edge cases

### 5. Security

- Validate input parameters
- Sanitize AI responses
- Implement rate limiting

### 6. Observability

- Log all AI operations
- Track performance metrics
- Monitor model usage and costs

This integration guide provides comprehensive patterns for incorporating AI capabilities into various parts of your system while maintaining reliability and performance.
