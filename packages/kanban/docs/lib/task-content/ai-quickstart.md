# TaskAIManager Quick Start Guide

Get up and running with AI-assisted task management in 5 minutes.

## Prerequisites

1. **Ollama Installation**

   ```bash
   # Install Ollama
   curl -fsSL https://ollama.ai/install.sh | sh

   # Start the service
   ollama serve

   # Pull the required model
   ollama pull qwen3:8b
   ```

2. **Verify Installation**

   ```bash
   # Check Ollama is running
   ollama list

   # Test the model
   ollama run qwen3:8b "Hello, world!"
   ```

## Basic Usage

### 1. Import and Initialize

```typescript
import { TaskAIManager } from '@promethean-os/kanban/lib/task-content/ai';

// Create AI manager with default settings
const aiManager = new TaskAIManager();
```

### 2. Analyze a Task

```typescript
// Quick quality analysis
const analysis = await aiManager.analyzeTask({
  uuid: 'your-task-uuid',
  analysisType: 'quality',
});

if (analysis.success) {
  console.log(`Quality Score: ${analysis.analysis.qualityScore}`);
  console.log('Suggestions:', analysis.analysis.suggestions);
}
```

### 3. Improve Task Content

```typescript
// Improve task for developers
const rewrite = await aiManager.rewriteTask({
  uuid: 'your-task-uuid',
  rewriteType: 'improve',
  targetAudience: 'developer',
  tone: 'technical',
});

if (rewrite.success) {
  console.log('Task improved successfully');
  console.log('Changes:', rewrite.changes.summary);
}
```

### 4. Break Down Complex Tasks

```typescript
// Generate subtasks
const breakdown = await aiManager.breakdownTask({
  uuid: 'your-task-uuid',
  breakdownType: 'subtasks',
  complexity: 'medium',
  includeEstimates: true,
});

if (breakdown.success) {
  console.log(`Generated ${breakdown.subtasks.length} subtasks`);
  breakdown.subtasks.forEach((subtask, index) => {
    console.log(`${index + 1}. ${subtask.title}`);
    console.log(`   Est: ${subtask.estimatedHours}h`);
  });
}
```

## Common Workflows

### Workflow 1: Task Quality Improvement

```typescript
async function improveTaskQuality(uuid: string) {
  // Step 1: Analyze current quality
  const analysis = await aiManager.analyzeTask({
    uuid,
    analysisType: 'quality',
    options: { createBackup: true },
  });

  if (!analysis.success) {
    throw new Error(`Analysis failed: ${analysis.error}`);
  }

  // Step 2: Improve if quality is low
  if (analysis.analysis.qualityScore < 70) {
    const rewrite = await aiManager.rewriteTask({
      uuid,
      rewriteType: 'improve',
      targetAudience: 'developer',
      tone: 'technical',
    });

    if (rewrite.success) {
      console.log(`Task ${uuid} improved from ${analysis.analysis.qualityScore} quality score`);
      return rewrite;
    }
  }

  return analysis;
}
```

### Workflow 2: Complex Task Breakdown

```typescript
async function handleComplexTask(uuid: string) {
  // Step 1: Check complexity
  const analysis = await aiManager.analyzeTask({
    uuid,
    analysisType: 'complexity',
  });

  if (!analysis.success) return null;

  // Step 2: Break down if complex
  if (analysis.analysis.complexityScore > 70) {
    const breakdown = await aiManager.breakdownTask({
      uuid,
      breakdownType: 'subtasks',
      complexity: 'complex',
      maxSubtasks: 6,
      includeEstimates: true,
      options: { createBackup: true },
    });

    if (breakdown.success) {
      console.log(`Complex task broken into ${breakdown.subtasks.length} subtasks`);
      console.log(`Total estimated effort: ${breakdown.totalEstimatedHours}h`);
      return breakdown;
    }
  }

  return analysis;
}
```

### Workflow 3: Task Review and Enhancement

```typescript
async function reviewAndEnhanceTask(uuid: string) {
  // Comprehensive analysis
  const [quality, completeness] = await Promise.all([
    aiManager.analyzeTask({ uuid, analysisType: 'quality' }),
    aiManager.analyzeTask({ uuid, analysisType: 'completeness' }),
  ]);

  const issues = [];
  const improvements = [];

  // Collect quality issues
  if (quality.success && quality.analysis.qualityScore < 80) {
    issues.push(...quality.analysis.suggestions);
  }

  // Collect completeness issues
  if (completeness.success && completeness.analysis.completenessScore < 80) {
    issues.push(...completeness.analysis.suggestions);
    improvements.push(...completeness.analysis.subtasks);
  }

  // Apply improvements if needed
  if (issues.length > 0) {
    const rewrite = await aiManager.rewriteTask({
      uuid,
      rewriteType: 'improve',
      instructions: `Address these issues: ${issues.join('; ')}`,
    });

    return {
      originalQuality: quality.analysis?.qualityScore,
      originalCompleteness: completeness.analysis?.completenessScore,
      improvements: rewrite.success ? rewrite.changes.summary : 'Failed to improve',
      suggestedSubtasks: improvements,
    };
  }

  return {
    originalQuality: quality.analysis?.qualityScore,
    originalCompleteness: completeness.analysis?.completenessScore,
    improvements: 'No improvements needed',
    suggestedSubtasks: improvements,
  };
}
```

## Configuration Options

### Custom Model Settings

```typescript
const aiManager = new TaskAIManager({
  model: 'qwen3:8b', // Model name
  baseUrl: 'http://localhost:11434', // Ollama endpoint
  timeout: 60000, // Request timeout (ms)
  maxTokens: 4096, // Response token limit
  temperature: 0.3, // Creativity level (0.0-1.0)
});
```

### Performance vs Quality Trade-offs

```typescript
// Fast configuration (quick analysis)
const fastAI = new TaskAIManager({
  timeout: 30000,
  maxTokens: 1024,
  temperature: 0.1,
});

// High-quality configuration (detailed analysis)
const qualityAI = new TaskAIManager({
  timeout: 120000,
  maxTokens: 8192,
  temperature: 0.4,
});
```

## Error Handling

### Basic Error Handling

```typescript
async function safeAnalyze(uuid: string) {
  try {
    const result = await aiManager.analyzeTask({
      uuid,
      analysisType: 'quality',
    });

    if (!result.success) {
      console.error('Analysis failed:', result.error);
      return null;
    }

    return result;
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
}
```

### Retry Logic

```typescript
async function resilientOperation(operation: () => Promise<any>, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;

      console.warn(`Attempt ${attempt} failed, retrying...`);
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
}
```

## Tips and Best Practices

### 1. Always Use Backups

```typescript
const result = await aiManager.rewriteTask({
  uuid: 'task-123',
  rewriteType: 'improve',
  options: { createBackup: true }, // Always backup before changes
});
```

### 2. Use Dry Run for Testing

```typescript
// Preview changes before applying
const preview = await aiManager.rewriteTask({
  uuid: 'task-123',
  rewriteType: 'expand',
  options: { dryRun: true },
});

if (preview.success && preview.changes.additions.length > 0) {
  // Apply actual changes
  const actual = await aiManager.rewriteTask({
    uuid: 'task-123',
    rewriteType: 'expand',
  });
}
```

### 3. Batch Processing

```typescript
async function batchAnalyze(uuids: string[]) {
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
    success: result.status === 'fulfilled',
    data: result.status === 'fulfilled' ? result.value : null,
    error: result.status === 'rejected' ? result.reason : null,
  }));
}
```

### 4. Context-Rich Analysis

```typescript
const result = await aiManager.analyzeTask({
  uuid: 'task-123',
  analysisType: 'quality',
  context: {
    projectInfo: 'E-commerce platform migration to microservices',
    teamContext: 'Senior developers with React and Node.js experience',
    deadlines: ['2024-03-15', '2024-04-01'],
    dependencies: ['Database schema approval', 'API design review'],
  },
});
```

## Troubleshooting

### Common Issues

1. **"Task not found"**

   - Verify the task UUID exists
   - Check the task file path
   - Ensure the task has valid frontmatter

2. **"Connection failed"**

   - Check if Ollama is running: `ollama list`
   - Verify the model is available: `ollama pull qwen3:8b`
   - Check the baseUrl configuration

3. **"Timeout"**
   - Increase the timeout value
   - Reduce maxTokens for faster responses
   - Check system resources

### Debug Mode

```typescript
// Enable debug logging
const aiManager = new TaskAIManager({
  timeout: 120000, // Longer timeout for debugging
  temperature: 0.1, // More deterministic results
});

// Add logging around operations
console.log('Starting analysis...');
const result = await aiManager.analyzeTask(request);
console.log('Analysis completed:', result.success ? 'SUCCESS' : 'FAILED');
```

## Next Steps

- Read the [complete API documentation](./ai.md)
- Learn about [integration patterns](./ai-integration.md)
- Explore [advanced customization](./ai-customization.md)
- Check out the [troubleshooting guide](./ai-troubleshooting.md)

## Support

- **Issues**: [GitHub Issues](https://github.com/riatzukiza/promethean/issues)
- **Documentation**: [Promethean Docs](https://docs.promethean-os.com)
- **Community**: [GitHub Discussions](https://github.com/riatzukiza/promethean/discussions)
