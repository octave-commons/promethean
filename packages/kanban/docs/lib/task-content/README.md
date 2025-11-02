# TaskAIManager Documentation

Complete documentation for the AI-assisted task management system in Promethean Kanban.

## Overview

The TaskAIManager provides intelligent task analysis, rewriting, and breakdown capabilities using local LLM models. It integrates seamlessly with the existing kanban workflow to enhance task quality and developer productivity.

## Documentation Structure

- **[Main Documentation](./ai.md)** - Complete API reference and architecture guide
- **[Quick Start Guide](./ai-quickstart.md)** - Get started in 5 minutes
- **[Integration Guide](./ai-integration.md)** - Integration patterns and examples
- **[Customization Guide](./ai-customization.md)** - Extend and customize the AI system
- **[Troubleshooting Guide](./ai-troubleshooting.md)** - Common issues and solutions

## Quick Links

### Getting Started

1. [Install Prerequisites](./ai-quickstart.md#prerequisites)
2. [Basic Usage](./ai-quickstart.md#basic-usage)
3. [Common Workflows](./ai-quickstart.md#common-workflows)

### API Reference

- [TaskAIManager Class](./ai.md#taskaimanager-class)
- [Analysis Methods](./ai.md#analyzetask)
- [Rewrite Methods](./ai.md#rewritetask)
- [Breakdown Methods](./ai.md#breakdowntask)

### Integration

- [CLI Integration](./ai-integration.md#cli-integration)
- [Web Service Integration](./ai-integration.md#web-service-integration)
- [Automated Workflows](./ai-integration.md#automated-workflow-integration)

### Advanced Topics

- [Custom Analysis Types](./ai-customization.md#extending-analysis-types)
- [Custom Rewrite Types](./ai-customization.md#custom-rewrite-types)
- [Multi-Model Support](./ai-customization.md#custom-model-integration)
- [Configuration Management](./ai-customization.md#configuration-customization)

### Support

- [Troubleshooting](./ai-troubleshooting.md) - Common issues and solutions
- [Performance Optimization](./ai-troubleshooting.md#performance-issues) - Performance tuning
- [Error Recovery](./ai-troubleshooting.md#error-scenarios-and-recovery) - Resilience patterns

## Key Features

### 🧠 Intelligent Analysis

- **Quality Assessment**: Evaluate task clarity, completeness, and measurability
- **Complexity Analysis**: Assess technical complexity and effort requirements
- **Completeness Checking**: Identify missing requirements and acceptance criteria
- **Prioritization Support**: Get AI-assisted priority recommendations

### ✨ Content Enhancement

- **Smart Rewriting**: Improve clarity, add technical details, enhance structure
- **Audience Adaptation**: Tailor content for developers, managers, or stakeholders
- **Tone Adjustment**: Match content style (technical, formal, casual, executive)

### 📋 Task Breakdown

- **Subtask Generation**: Break complex tasks into manageable components
- **Step-by-Step Planning**: Create detailed implementation roadmaps
- **Phase Organization**: Structure work into logical phases
- **Effort Estimation**: Get AI-powered time and effort estimates

### 🔧 Integration & Automation

- **Kanban Integration**: Seamless integration with existing task management
- **Backup Support**: Automatic task backup before modifications
- **Dry Run Mode**: Preview changes before applying
- **Batch Processing**: Handle multiple tasks efficiently

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 TaskAIManager                    │
│  ┌─────────────────────────────────────────┐     │
│  │        AI Operations               │     │
│  │  ┌─────────┬─────────────┐   │     │
│  │  │ Analysis │ Rewrite │Breakdown│     │
│  │  └─────────┴─────────────┘   │     │
│  └─────────────────────────────────────────┘     │
│                                           │
│  ┌─────────────────────────────────────────┐     │
│  │      Pantheon Runtime              │     │
│  │     (Actor System)                │     │
│  └─────────────────────────────────────────┘     │
│                                           │
│  ┌─────────────────────────────────────────┐     │
│  │    TaskContentManager              │     │
│  │     (File Operations)              │     │
│  └─────────────────────────────────────────┘     │
│                                           │
│  ┌─────────────────────────────────────────┐     │
│  │        File System                 │     │
│  │     (Markdown Task Files)          │     │
│  └─────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

## Supported Models

### Primary Model

- **qwen3:8b**: Default model for balanced performance and quality
- **Local Processing**: All AI operations happen locally via Ollama
- **Privacy**: No data sent to external services

### Alternative Models

- **llama2**: Faster, lighter-weight option
- **codellama**: Specialized for code generation
- **mistral**: High-quality alternative
- **Custom Models**: Add your own models via configuration

## Configuration Options

```typescript
interface TaskAIManagerConfig {
  model?: string; // AI model name (default: 'qwen3:8b')
  baseUrl?: string; // Ollama endpoint (default: 'http://localhost:11434')
  timeout?: number; // Request timeout in ms (default: 60000)
  maxTokens?: number; // Response token limit (default: 4096)
  temperature?: number; // Creativity level 0.0-1.0 (default: 0.3)
}
```

## Usage Examples

### Basic Analysis

```typescript
import { TaskAIManager } from '@promethean-os/kanban/lib/task-content/ai.js';

const aiManager = new TaskAIManager();

// Analyze task quality
const analysis = await aiManager.analyzeTask({
  uuid: 'task-123',
  analysisType: 'quality',
  context: {
    projectInfo: 'E-commerce platform',
    teamContext: 'Senior React developers',
  },
});

console.log(`Quality Score: ${analysis.analysis.qualityScore}`);
console.log('Suggestions:', analysis.analysis.suggestions);
```

### Content Improvement

```typescript
// Improve task for developers
const rewrite = await aiManager.rewriteTask({
  uuid: 'task-123',
  rewriteType: 'improve',
  targetAudience: 'developer',
  tone: 'technical',
  instructions: 'Add more implementation details',
});

console.log('Improvements:', rewrite.changes.summary);
```

### Task Breakdown

```typescript
// Break down into subtasks with estimates
const breakdown = await aiManager.breakdownTask({
  uuid: 'task-123',
  breakdownType: 'subtasks',
  complexity: 'medium',
  maxSubtasks: 6,
  includeEstimates: true,
});

console.log(`Generated ${breakdown.subtasks.length} subtasks`);
console.log(`Total estimated: ${breakdown.totalEstimatedHours} hours`);
```

## Best Practices

### 1. Always Use Backups

```typescript
const result = await aiManager.rewriteTask({
  uuid: 'task-123',
  rewriteType: 'improve',
  options: { createBackup: true }, // Always backup before changes
});
```

### 2. Preview Changes First

```typescript
// Dry run to preview changes
const preview = await aiManager.rewriteTask({
  uuid: 'task-123',
  rewriteType: 'improve',
  options: { dryRun: true },
});

if (preview.success && preview.changes.additions.length > 0) {
  // Apply actual changes
  const actual = await aiManager.rewriteTask({
    uuid: 'task-123',
    rewriteType: 'improve',
  });
}
```

### 3. Handle Errors Gracefully

```typescript
try {
  const result = await aiManager.analyzeTask(request);

  if (!result.success) {
    console.error('Analysis failed:', result.error);
    return;
  }

  // Process successful result
} catch (error) {
  console.error('Unexpected error:', error);
  // Implement fallback or retry logic
}
```

### 4. Optimize Performance

```typescript
// Use appropriate configuration for different use cases
const fastAI = new TaskAIManager({
  timeout: 30000, // Quick operations
  maxTokens: 1024, // Smaller responses
  temperature: 0.1, // More deterministic
});

const qualityAI = new TaskAIManager({
  timeout: 120000, // Complex analysis
  maxTokens: 8192, // Detailed responses
  temperature: 0.3, // More creative
});
```

## Error Handling

### Common Error Types

- **Connection Errors**: Ollama service unavailable
- **Timeout Errors**: Operations taking too long
- **Validation Errors**: Invalid task content or structure
- **Parse Errors**: Malformed AI responses

### Recovery Strategies

- **Retry Logic**: Exponential backoff for transient failures
- **Circuit Breakers**: Stop operations during sustained failures
- **Fallback Responses**: Provide basic functionality when AI unavailable
- **Graceful Degradation**: Reduce functionality rather than fail completely

## Monitoring and Observability

### Performance Metrics

- **Response Time**: Track AI operation duration
- **Success Rate**: Monitor operation success/failure ratio
- **Token Usage**: Track model token consumption
- **Error Rates**: Monitor frequency and types of errors

### Logging

```typescript
// Enable comprehensive logging
const aiManager = new TaskAIManager({
  // ... config
});

// All operations are logged with:
// - Request details
// - Response metadata
// - Processing time
// - Success/failure status
// - Error information (if applicable)
```

## Testing

### Unit Tests

```bash
# Run AI-specific tests
pnpm --filter @promethean-os/kanban test src/tests/task-content-ai.test.ts
```

### Integration Tests

```bash
# Run full test suite
pnpm --filter @promethean-os/kanban test
```

### Mock Testing

```typescript
// Use mock AI manager for reliable testing
import { MockTaskAIManager } from './test/mock-ai-manager.js';

const mockAI = new MockTaskAIManager();
const result = await mockAI.analyzeTask({
  uuid: 'test-task',
  analysisType: 'quality',
});
```

## Migration Guide

### From Manual Task Management

1. **Install Dependencies**: Set up Ollama and required models
2. **Update Configuration**: Configure AI manager settings
3. **Integrate Gradually**: Start with analysis, add rewriting and breakdown
4. **Train Team**: Educate developers on AI-assisted workflows
5. **Monitor Performance**: Track improvements and optimize usage

### Configuration Migration

```typescript
// Before: Manual task processing
function processTask(taskId: string) {
  // Manual review and improvement
}

// After: AI-assisted processing
async function processTaskWithAI(taskId: string) {
  const aiManager = new TaskAIManager();

  // AI analysis
  const analysis = await aiManager.analyzeTask({
    uuid: taskId,
    analysisType: 'quality',
  });

  // AI improvement if needed
  if (analysis.success && analysis.analysis.qualityScore < 70) {
    await aiManager.rewriteTask({
      uuid: taskId,
      rewriteType: 'improve',
    });
  }

  // AI breakdown if complex
  const complexity = await aiManager.analyzeTask({
    uuid: taskId,
    analysisType: 'complexity',
  });

  if (complexity.success && complexity.analysis.complexityScore > 70) {
    await aiManager.breakdownTask({
      uuid: taskId,
      breakdownType: 'subtasks',
    });
  }
}
```

## Contributing

### Development Setup

```bash
# Clone repository
git clone https://github.com/riatzukiza/promethean.git
cd promethean/packages/kanban

# Install dependencies
pnpm install

# Start development
pnpm build:watch
```

### Adding New Features

1. **Extend Types**: Add new request/response interfaces
2. **Implement Logic**: Add analysis/rewrite/breakdown functions
3. **Add Tests**: Cover new functionality with comprehensive tests
4. **Update Documentation**: Keep docs in sync with code
5. **Version Control**: Follow semantic versioning and changelog

### Code Style

- **TypeScript**: Use strict type checking and modern features
- **Functional**: Prefer pure functions and immutable data
- **Async/Await**: Use modern async/await patterns
- **Error Handling**: Comprehensive error handling with proper types
- **Testing**: Maintain high test coverage (>80%)

## Support

### Documentation

- **[Complete API Reference](./ai.md)** - Full method documentation
- **[Getting Started Guide](./ai-quickstart.md)** - Step-by-step setup
- **[Integration Examples](./ai-integration.md)** - Real-world integration patterns
- **[Troubleshooting](./ai-troubleshooting.md)** - Common issues and solutions

### Community

- **GitHub Issues**: [Report bugs and request features](https://github.com/riatzukiza/promethean/issues)
- **GitHub Discussions**: [Ask questions and share experiences](https://github.com/riatzukiza/promethean/discussions)
- **Documentation**: [Contribute to docs](https://github.com/riatzukiza/promethean/tree/main/packages/kanban/docs)

### Performance and Reliability

- **System Requirements**: Minimum 8GB RAM, recommended 16GB
- **Network**: Stable internet connection for model downloads
- **Storage**: 10GB+ disk space for models and cache

---

_Last Updated: 2025-10-26_  
_Version: 0.2.0_  
_Package: @promethean-os/kanban_
