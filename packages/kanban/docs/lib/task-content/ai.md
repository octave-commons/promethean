# TaskAIManager - AI-Assisted Task Management

**Version**: 0.2.0  
**Package**: `@promethean-os/kanban`  
**Module**: `lib/task-content/ai`

> _Integrates with qwen3:8b model for intelligent task analysis, rewriting, and breakdown_

## Overview

The `TaskAIManager` class provides AI-powered capabilities for task management within the Promethean Kanban system. It leverages local LLM models (specifically qwen3:8b via Ollama) to analyze task quality, rewrite content for different audiences, and break down complex tasks into manageable subtasks.

### Key Features

- **Task Analysis**: Quality assessment, complexity evaluation, completeness checking
- **Content Rewriting**: Improve, simplify, expand, or restructure task content
- **Task Breakdown**: Generate subtasks, steps, phases, or component breakdowns
- **Pantheon Integration**: Uses the Pantheon actor system for AI computations
- **Backup Support**: Automatic task backup before modifications
- **Dry Run Mode**: Preview changes without applying them

---

## API Documentation

### Class: TaskAIManager

#### Constructor

```typescript
constructor(config?: TaskAIManagerConfig)
```

Creates a new TaskAIManager instance with optional configuration.

**Parameters**:

- `config` (optional): Configuration object for the AI manager

**Example**:

```typescript
const aiManager = new TaskAIManager({
  model: 'qwen3:8b',
  baseUrl: 'http://localhost:11434',
  timeout: 60000,
  maxTokens: 4096,
  temperature: 0.3,
});
```

#### Configuration Interface

```typescript
interface TaskAIManagerConfig {
  model?: string; // Default: 'qwen3:8b'
  baseUrl?: string; // Default: 'http://localhost:11434'
  timeout?: number; // Default: 60000 (ms)
  maxTokens?: number; // Default: 4096
  temperature?: number; // Default: 0.3
}
```

---

### Methods

#### analyzeTask()

Analyzes a task using AI to provide insights into quality, complexity, completeness, etc.

```typescript
async analyzeTask(request: TaskAnalysisRequest): Promise<TaskAnalysisResult>
```

**Parameters**:

```typescript
interface TaskAnalysisRequest {
  uuid: string;
  analysisType: 'quality' | 'complexity' | 'completeness' | 'breakdown' | 'prioritization';
  context?: {
    projectInfo?: string;
    teamContext?: string;
    deadlines?: string[];
    dependencies?: string[];
  };
  options?: TaskLifecycleOptions;
}
```

**Returns**:

```typescript
interface TaskAnalysisResult {
  success: boolean;
  taskUuid: string;
  analysisType: string;
  analysis: {
    qualityScore?: number; // 0-100
    complexityScore?: number; // 0-100
    completenessScore?: number; // 0-100
    estimatedEffort?: {
      hours: number;
      confidence: number;
      breakdown: string[];
    };
    suggestions: string[];
    risks: string[];
    dependencies: string[];
    subtasks: string[];
  };
  metadata: {
    analyzedAt: Date;
    analyzedBy: string;
    model: string;
    processingTime: number;
  };
  error?: string;
}
```

**Usage Examples**:

```typescript
// Quality analysis
const qualityResult = await aiManager.analyzeTask({
  uuid: 'task-123',
  analysisType: 'quality',
  context: {
    projectInfo: 'E-commerce platform migration',
    teamContext: 'Senior developers with React experience',
  },
  options: {
    createBackup: true,
  },
});

// Complexity analysis
const complexityResult = await aiManager.analyzeTask({
  uuid: 'task-123',
  analysisType: 'complexity',
  context: {
    dependencies: ['Database schema approval', 'API design review'],
  },
});

// Completeness analysis
const completenessResult = await aiManager.analyzeTask({
  uuid: 'task-123',
  analysisType: 'completeness',
});
```

---

#### rewriteTask()

Rewrites task content using AI based on specified requirements.

```typescript
async rewriteTask(request: TaskRewriteRequest): Promise<TaskRewriteResult>
```

**Parameters**:

```typescript
interface TaskRewriteRequest {
  uuid: string;
  rewriteType: 'improve' | 'simplify' | 'expand' | 'restructure' | 'summarize';
  instructions?: string;
  targetAudience?: 'developer' | 'manager' | 'stakeholder' | 'team';
  tone?: 'formal' | 'casual' | 'technical' | 'executive';
  options?: TaskLifecycleOptions;
}
```

**Returns**:

```typescript
interface TaskRewriteResult {
  success: boolean;
  taskUuid: string;
  rewriteType: string;
  originalContent: string;
  rewrittenContent: string;
  changes: {
    summary: string;
    highlights: string[];
    additions: string[];
    modifications: string[];
    removals: string[];
  };
  metadata: {
    rewrittenAt: Date;
    rewrittenBy: string;
    model: string;
    processingTime: number;
  };
  error?: string;
}
```

**Usage Examples**:

```typescript
// Improve task content for developers
const improveResult = await aiManager.rewriteTask({
  uuid: 'task-123',
  rewriteType: 'improve',
  targetAudience: 'developer',
  tone: 'technical',
  instructions: 'Add more technical details and implementation considerations',
});

// Simplify for stakeholders
const simplifyResult = await aiManager.rewriteTask({
  uuid: 'task-123',
  rewriteType: 'simplify',
  targetAudience: 'stakeholder',
  tone: 'executive',
});

// Dry run to preview changes
const dryRunResult = await aiManager.rewriteTask({
  uuid: 'task-123',
  rewriteType: 'expand',
  options: {
    dryRun: true,
    createBackup: true,
  },
});
```

---

#### breakdownTask()

Breaks down a task into subtasks, steps, or phases using AI.

```typescript
async breakdownTask(request: TaskBreakdownRequest): Promise<TaskBreakdownResult>
```

**Parameters**:

```typescript
interface TaskBreakdownRequest {
  uuid: string;
  breakdownType: 'subtasks' | 'steps' | 'phases' | 'components';
  maxSubtasks?: number;
  complexity: 'simple' | 'medium' | 'complex';
  includeEstimates?: boolean;
  options?: TaskLifecycleOptions;
}
```

**Returns**:

```typescript
interface TaskBreakdownResult {
  success: boolean;
  taskUuid: string;
  breakdownType: string;
  subtasks: Array<{
    title: string;
    description: string;
    estimatedHours?: number;
    priority?: 'low' | 'medium' | 'high';
    dependencies?: string[];
    acceptanceCriteria?: string[];
  }>;
  totalEstimatedHours?: number;
  metadata: {
    breakdownAt: Date;
    breakdownBy: string;
    model: string;
    processingTime: number;
  };
  error?: string;
}
```

**Usage Examples**:

```typescript
// Break down into subtasks with estimates
const subtaskResult = await aiManager.breakdownTask({
  uuid: 'task-123',
  breakdownType: 'subtasks',
  maxSubtasks: 6,
  complexity: 'medium',
  includeEstimates: true,
  options: {
    createBackup: true,
  },
});

// Break down into phases
const phaseResult = await aiManager.breakdownTask({
  uuid: 'task-123',
  breakdownType: 'phases',
  complexity: 'complex',
  includeEstimates: false,
});

// Component breakdown
const componentResult = await aiManager.breakdownTask({
  uuid: 'task-123',
  breakdownType: 'components',
  maxSubtasks: 4,
  complexity: 'simple',
});
```

---

### Utility Functions

#### createTaskAIManager()

Factory function to create a TaskAIManager instance.

```typescript
export function createTaskAIManager(config?: TaskAIManagerConfig): TaskAIManager;
```

**Example**:

```typescript
const aiManager = createTaskAIManager({
  model: 'qwen3:8b',
  temperature: 0.5,
});
```

---

## Architecture Overview

### System Design

The TaskAIManager follows a layered architecture:

```
┌─────────────────────────────────────┐
│           TaskAIManager              │
│  ┌─────────────────────────────────┐ │
│  │     Public API Methods          │ │
│  │  - analyzeTask()                │ │
│  │  - rewriteTask()                │ │
│  │  - breakdownTask()              │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────┐
│        Pantheon Runtime              │
│  (AI Computation via Actors)         │
└─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────┐
│      TaskContentManager              │
│    (File Operations & Cache)         │
└─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────┐
│         File System                  │
│    (Markdown Task Files)             │
└─────────────────────────────────────┘
```

### Components

1. **TaskAIManager**: Main orchestrator class
2. **Pantheon Runtime**: AI computation engine using actor system
3. **TaskContentManager**: Handles file operations and caching
4. **Task Cache**: Abstract interface for task storage operations
5. **Validation Layer**: Ensures data integrity and structure

### Integration with Kanban System

The AI manager integrates seamlessly with the existing kanban workflow:

- **Task Discovery**: Uses the same task cache and file system as the main kanban system
- **Content Management**: Leverages `TaskContentManager` for safe file operations
- **Backup System**: Integrates with the existing backup mechanism
- **Validation**: Uses the same validation rules as manual edits
- **Metadata Tracking**: Maintains audit trails and processing metadata

### Data Flow

```
User Request → TaskAIManager → Pantheon Actor → LLM Model
     │                │                │           │
     ▼                ▼                ▼           ▼
Task UUID →   Content Read →   AI Analysis →   Structured Result
     │                │                │           │
     ▼                ▼                ▼           ▼
Options →   Backup Create →   Validation →   File Update (if not dry-run)
```

---

## Implementation Guide

### Setup and Configuration

#### Prerequisites

1. **Ollama Installation**: Install and run Ollama locally

   ```bash
   # Install Ollama
   curl -fsSL https://ollama.ai/install.sh | sh

   # Start Ollama service
   ollama serve

   # Pull the required model
   ollama pull qwen3:8b
   ```

2. **Environment Setup**: Ensure required environment variables
   ```bash
   export LLM_DRIVER=ollama
   export LLM_MODEL=qwen3:8b
   export AGENT_NAME=your-agent-name  # Optional
   ```

#### Basic Setup

```typescript
import { TaskAIManager, createTaskAIManager } from '@promethean-os/kanban/lib/task-content/ai';

// Method 1: Direct instantiation
const aiManager = new TaskAIManager({
  model: 'qwen3:8b',
  baseUrl: 'http://localhost:11434',
  timeout: 60000,
  maxTokens: 4096,
  temperature: 0.3,
});

// Method 2: Factory function
const aiManager = createTaskAIManager({
  temperature: 0.5, // Use defaults for other options
});
```

#### Integration with Existing Workflow

```typescript
import { createTaskContentManager } from '@promethean-os/kanban/lib/task-content';

// Create content manager with real file cache
const contentManager = createTaskContentManager('./docs/agile/tasks');

// Create AI manager with custom configuration
const aiManager = new TaskAIManager({
  model: 'qwen3:8b',
  timeout: 120000, // 2 minutes for complex tasks
  temperature: 0.2, // More deterministic results
});

// Use in your workflow
async function processTaskWithAI(taskUuid: string) {
  // Analyze task quality
  const analysis = await aiManager.analyzeTask({
    uuid: taskUuid,
    analysisType: 'quality',
    options: { createBackup: true },
  });

  if (analysis.success && analysis.analysis.qualityScore < 70) {
    // Improve task content
    const rewrite = await aiManager.rewriteTask({
      uuid: taskUuid,
      rewriteType: 'improve',
      targetAudience: 'developer',
      tone: 'technical',
    });

    if (rewrite.success) {
      console.log(`Task ${taskUuid} improved successfully`);
    }
  }

  // Break down if complex
  if (analysis.success && analysis.analysis.complexityScore > 70) {
    const breakdown = await aiManager.breakdownTask({
      uuid: taskUuid,
      breakdownType: 'subtasks',
      complexity: 'complex',
      includeEstimates: true,
    });

    if (breakdown.success) {
      console.log(`Generated ${breakdown.subtasks.length} subtasks`);
    }
  }
}
```

### Best Practices

#### 1. Error Handling

```typescript
async function safeAnalyzeTask(uuid: string) {
  try {
    const result = await aiManager.analyzeTask({
      uuid,
      analysisType: 'quality',
    });

    if (!result.success) {
      console.error(`Analysis failed: ${result.error}`);
      return null;
    }

    return result;
  } catch (error) {
    console.error(`Unexpected error: ${error}`);
    return null;
  }
}
```

#### 2. Backup Strategy

```typescript
// Always create backups for destructive operations
const result = await aiManager.rewriteTask({
  uuid: 'task-123',
  rewriteType: 'improve',
  options: {
    createBackup: true,
    validateStructure: true,
  },
});
```

#### 3. Dry Run for Testing

```typescript
// Preview changes before applying
const dryRun = await aiManager.rewriteTask({
  uuid: 'task-123',
  rewriteType: 'expand',
  options: { dryRun: true },
});

if (dryRun.success) {
  console.log('Preview of changes:');
  console.log(dryRun.changes.summary);

  // Apply changes if satisfied
  const actual = await aiManager.rewriteTask({
    uuid: 'task-123',
    rewriteType: 'expand',
  });
}
```

#### 4. Performance Optimization

```typescript
// Configure timeouts appropriately
const aiManager = new TaskAIManager({
  timeout: 30000, // 30 seconds for simple analysis
  maxTokens: 2048, // Limit token usage
  temperature: 0.1, // More deterministic for consistent results
});

// Batch processing for multiple tasks
async function batchAnalyzeTasks(uuids: string[]) {
  const results = await Promise.allSettled(
    uuids.map((uuid) =>
      aiManager.analyzeTask({
        uuid,
        analysisType: 'quality',
      }),
    ),
  );

  return results.map((result, index) => ({
    uuid: uuids[index],
    success: result.status === 'fulfilled' ? result.value.success : false,
    data: result.status === 'fulfilled' ? result.value : null,
    error: result.status === 'rejected' ? result.reason : null,
  }));
}
```

---

## AI Integration Details

### Model Configuration

#### Supported Models

The system is designed to work with local LLM models via Ollama:

- **Primary**: `qwen3:8b` (8 billion parameter model)
- **Alternatives**: Any model available in your Ollama instance

#### Model Parameters

```typescript
interface ModelConfiguration {
  model: string; // Model name in Ollama
  baseUrl: string; // Ollama API endpoint
  timeout: number; // Request timeout in milliseconds
  maxTokens: number; // Maximum tokens in response
  temperature: number; // Creativity level (0.0-1.0)
}
```

**Recommended Settings**:

| Use Case  | Temperature | Max Tokens | Timeout |
| --------- | ----------- | ---------- | ------- |
| Analysis  | 0.1-0.3     | 2048       | 30s     |
| Rewriting | 0.3-0.5     | 4096       | 60s     |
| Breakdown | 0.2-0.4     | 3072       | 45s     |

### Prompt Engineering

The system uses structured prompts for consistent results:

#### Analysis Prompts

```typescript
// Quality Analysis Prompt Structure
const qualityPrompt = `
Analyze the following task for quality:
Title: ${task.title}
Content: ${task.content}

Evaluate:
1. Clarity and specificity
2. Completeness of requirements
3. Measurability of acceptance criteria
4. Technical feasibility

Provide scores (0-100) and actionable suggestions.
`;
```

#### Rewrite Prompts

```typescript
// Rewrite Prompt Structure
const rewritePrompt = `
Rewrite this task for ${targetAudience} audience with ${tone} tone.

Original Content: ${originalContent}
Instructions: ${instructions}

Focus on:
- Clear objectives
- Specific acceptance criteria
- Actionable requirements
- Appropriate technical depth
`;
```

#### Breakdown Prompts

```typescript
// Breakdown Prompt Structure
const breakdownPrompt = `
Break down this task into ${breakdownType}:
${maxSubtasks ? `Maximum ${maxSubtasks} items` : ''}
Complexity: ${complexity}

Task: ${task.title}
Description: ${task.content}

Generate structured subtasks with:
- Clear titles
- Detailed descriptions
- Estimated hours
- Dependencies
- Acceptance criteria
`;
```

### Response Handling

#### Validation Pipeline

1. **Structure Validation**: Ensures response matches expected schema
2. **Content Validation**: Validates data types and ranges
3. **Business Logic Validation**: Applies domain-specific rules

#### Error Recovery

```typescript
private validateAnalysisResult(analysis: any): any {
  const result: any = {};

  // Clamp scores to valid ranges
  if (typeof analysis.qualityScore === 'number') {
    result.qualityScore = Math.min(100, Math.max(0, analysis.qualityScore));
  }

  // Ensure arrays are properly formatted
  result.suggestions = Array.isArray(analysis.suggestions) ? analysis.suggestions : [];
  result.risks = Array.isArray(analysis.risks) ? analysis.risks : [];

  return result;
}
```

### Customization Possibilities

#### Custom Analysis Types

```typescript
// Extend analysis types
interface CustomAnalysisRequest extends TaskAnalysisRequest {
  analysisType: 'quality' | 'complexity' | 'completeness' | 'security' | 'performance';
}

// Add custom analysis logic
function generateCustomAnalysis(params: TaskAnalysisParams): any {
  const { task, analysisType } = params;

  switch (analysisType) {
    case 'security':
      return {
        securityScore: calculateSecurityScore(task),
        vulnerabilities: identifySecurityIssues(task),
        recommendations: generateSecurityRecommendations(task),
      };
    // ... other cases
  }
}
```

#### Custom Rewrite Styles

```typescript
// Add custom rewrite types
interface CustomRewriteRequest extends TaskRewriteRequest {
  rewriteType: 'improve' | 'simplify' | 'security-focused' | 'performance-optimized';
  customInstructions?: string;
}

// Custom rewrite logic
function generateCustomRewrite(params: TaskRewriteParams): { content: string; summary: string } {
  const { task, rewriteType, customInstructions } = params;

  // Implement custom rewrite logic based on type
  switch (rewriteType) {
    case 'security-focused':
      return generateSecurityRewrite(task, customInstructions);
    case 'performance-optimized':
      return generatePerformanceRewrite(task, customInstructions);
    // ... other cases
  }
}
```

---

## Troubleshooting and FAQ

### Common Issues and Solutions

#### 1. Ollama Connection Issues

**Problem**: `Error: Failed to connect to Ollama service`

**Solutions**:

```bash
# Check if Ollama is running
ollama list

# Start Ollama service
ollama serve

# Verify model is available
ollama pull qwen3:8b
```

**Configuration Fix**:

```typescript
const aiManager = new TaskAIManager({
  baseUrl: 'http://localhost:11434', // Verify correct port
  timeout: 120000, // Increase timeout for slower models
});
```

#### 2. Task Not Found

**Problem**: `Task ${uuid} not found`

**Solutions**:

```typescript
// Verify task exists
const contentManager = createTaskContentManager('./docs/agile/tasks');
const task = await contentManager.readTask(uuid);

if (!task) {
  console.error(`Task ${uuid} does not exist`);
  return;
}

// Then proceed with AI operations
```

#### 3. Model Response Timeout

**Problem**: AI operations timing out

**Solutions**:

```typescript
// Increase timeout for complex operations
const aiManager = new TaskAIManager({
  timeout: 180000, // 3 minutes
  maxTokens: 2048, // Reduce token usage to speed up
});

// Or use simpler analysis types
const result = await aiManager.analyzeTask({
  uuid: 'task-123',
  analysisType: 'quality', // Faster than 'complexity'
});
```

#### 4. Invalid AI Responses

**Problem**: AI returns malformed or incomplete responses

**Solutions**:

```typescript
// The system includes validation and fallback
const result = await aiManager.analyzeTask({
  uuid: 'task-123',
  analysisType: 'quality',
});

if (!result.success) {
  console.error('Analysis failed:', result.error);

  // Retry with different parameters
  const retry = await aiManager.analyzeTask({
    uuid: 'task-123',
    analysisType: 'quality',
    context: {}, // Simplify context
  });
}
```

### Performance Considerations

#### 1. Response Time Optimization

```typescript
// Configure for faster responses
const fastAIManager = new TaskAIManager({
  temperature: 0.1, // More deterministic
  maxTokens: 1024, // Shorter responses
  timeout: 30000, // 30 second timeout
});

// Use simpler analysis types
const quickAnalysis = await fastAIManager.analyzeTask({
  uuid: 'task-123',
  analysisType: 'quality', // Faster than complexity analysis
});
```

#### 2. Memory Usage

```typescript
// Process tasks in batches to manage memory
async function processBatch(uuids: string[], batchSize = 5) {
  for (let i = 0; i < uuids.length; i += batchSize) {
    const batch = uuids.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map((uuid) => aiManager.analyzeTask({ uuid, analysisType: 'quality' })),
    );

    // Process results
    results.forEach((result) => {
      if (result.success) {
        console.log(`Processed ${result.taskUuid}`);
      }
    });

    // Small delay between batches
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
```

#### 3. Caching Strategy

```typescript
// Cache analysis results to avoid repeated AI calls
const analysisCache = new Map<string, TaskAnalysisResult>();

async function cachedAnalysis(uuid: string, analysisType: string) {
  const cacheKey = `${uuid}-${analysisType}`;

  if (analysisCache.has(cacheKey)) {
    return analysisCache.get(cacheKey)!;
  }

  const result = await aiManager.analyzeTask({ uuid, analysisType });

  if (result.success) {
    analysisCache.set(cacheKey, result);
  }

  return result;
}
```

### Error Scenarios and Recovery

#### 1. Network Failures

```typescript
async function resilientAnalysis(request: TaskAnalysisRequest, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await aiManager.analyzeTask(request);
      if (result.success) return result;

      if (attempt === retries) {
        throw new Error(`Analysis failed after ${retries} attempts: ${result.error}`);
      }
    } catch (error) {
      console.warn(`Attempt ${attempt} failed:`, error);

      if (attempt === retries) throw error;

      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}
```

#### 2. Model Unavailable

```typescript
async function fallbackAnalysis(request: TaskAnalysisRequest) {
  try {
    return await aiManager.analyzeTask(request);
  } catch (error) {
    console.warn('AI analysis failed, using fallback:', error);

    // Provide basic analysis without AI
    return {
      success: true,
      taskUuid: request.uuid,
      analysisType: request.analysisType,
      analysis: {
        qualityScore: 50,
        suggestions: ['Manual review recommended'],
        risks: ['AI analysis unavailable'],
        dependencies: [],
        subtasks: [],
      },
      metadata: {
        analyzedAt: new Date(),
        analyzedBy: 'fallback-system',
        model: 'none',
        processingTime: 0,
      },
    };
  }
}
```

### FAQ

**Q: Can I use different LLM models?**
A: Yes, any model available in your Ollama instance can be used by specifying it in the configuration.

**Q: How accurate are the AI analyses?**
A: Accuracy depends on model quality and task complexity. The qwen3:8b model provides good results for most software development tasks.

**Q: Can I customize the analysis criteria?**
A: Yes, you can extend the system by modifying the prompt generation functions in the source code.

**Q: Is my data sent to external services?**
A: No, all AI processing happens locally using your Ollama instance.

**Q: How do I handle large tasks?**
A: For very large tasks, consider breaking them down first or using the 'steps' breakdown type for incremental processing.

**Q: Can I integrate with external AI services?**
A: The current implementation uses Ollama, but the architecture can be extended to support other AI providers.

---

## Testing

### Unit Tests

The system includes comprehensive unit tests:

```bash
# Run AI-specific tests
pnpm --filter @promethean-os/kanban test src/tests/task-content-ai.test.ts

# Run all kanban tests
pnpm --filter @promethean-os/kanban test
```

### Test Examples

```typescript
import test from 'ava';
import { TaskAIManager } from '../lib/task-content/ai.js';

const manager = new TaskAIManager({
  model: 'qwen3:test',
  timeout: 1000,
});

test('TaskAIManager.analyzeTask returns structured analysis', async (t) => {
  const result = await manager.analyzeTask({
    uuid: 'demo-task',
    analysisType: 'quality',
  });

  t.true(result.success);
  t.is(result.taskUuid, 'demo-task');
  t.truthy(result.analysis.suggestions.length);
  t.true(typeof result.metadata.processingTime === 'number');
});
```

---

## Migration Guide

### From Manual Task Management

1. **Install Dependencies**: Ensure Ollama is installed and running
2. **Update Configuration**: Add AI manager configuration to your setup
3. **Gradual Integration**: Start with analysis, then add rewriting and breakdown
4. **Backup Strategy**: Enable automatic backups during transition

### Configuration Migration

```typescript
// Before: Manual task processing
async function processTask(uuid: string) {
  const task = await readTask(uuid);
  // Manual analysis and improvement
}

// After: AI-assisted processing
async function processTask(uuid: string) {
  const aiManager = createTaskAIManager();

  // AI analysis
  const analysis = await aiManager.analyzeTask({
    uuid,
    analysisType: 'quality',
  });

  // AI improvement if needed
  if (analysis.success && analysis.analysis.qualityScore < 70) {
    await aiManager.rewriteTask({
      uuid,
      rewriteType: 'improve',
    });
  }
}
```

---

## Contributing

### Development Setup

```bash
# Clone the repository
git clone https://github.com/riatzukiza/promethean.git
cd promethean/packages/kanban

# Install dependencies
pnpm install

# Build the package
pnpm build

# Run tests
pnpm test
```

### Adding New AI Features

1. **Extend Types**: Add new request/response interfaces in `types.ts`
2. **Implement Logic**: Add methods to `TaskAIManager` class
3. **Add Prompts**: Create prompt generation functions
4. **Write Tests**: Add comprehensive test coverage
5. **Update Documentation**: Keep this documentation current

### Code Style

- Follow TypeScript best practices
- Use functional programming patterns
- Include comprehensive error handling
- Add detailed JSDoc comments
- Maintain test coverage above 80%

---

## License

This module is part of the Promethean OS project and is licensed under GPL-3.0-only. See the [LICENSE](../../../LICENSE.txt) file for details.

---

## Support

For issues, questions, or contributions:

- **Issues**: [GitHub Issues](https://github.com/riatzukiza/promethean/issues)
- **Discussions**: [GitHub Discussions](https://github.com/riatzukiza/promethean/discussions)
- **Documentation**: [Promethean Docs](https://docs.promethean-os.com)

---

_Last Updated: 2025-10-26_  
_Version: 0.2.0_
