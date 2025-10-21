# @promethean/ai-learning

Intelligent AI model routing and performance learning system for the Promethean Framework.

## 🎯 Overview

The AI Learning System provides intelligent routing of AI tasks to optimal models based on historical performance data, task classification, and configurable routing strategies. It continuously learns from model performance to improve routing decisions over time.

## 🚀 Features

- **Task Classification**: Automatically categorizes tasks into 10 specialized categories
- **Intelligent Routing**: Multiple routing strategies (best-performance, fastest, cheapest, most-reliable, balanced)
- **Performance Tracking**: Comprehensive performance analysis with confidence metrics
- **Continuous Learning**: Adapts routing decisions based on historical performance
- **Model Management**: Dynamic model registration and capability tracking
- **Analytics**: Detailed insights into model utilization and effectiveness

## 📦 Installation

```bash
pnpm add @promethean/ai-learning
```

## 🔧 Quick Start

```typescript
import { AILearningSystem, type ModelCapabilities } from '@promethean/ai-learning';

// Initialize with available models
const models: Record<string, ModelCapabilities> = {
  'qwen3:8b': {
    maxTokens: 8192,
    supportsStreaming: true,
    supportsJson: true,
    supportsFunctionCalling: false,
    costPerToken: 0.00001,
    speed: 'fast',
    reliability: 0.85,
  },
  'gpt-oss:20b-cloud': {
    maxTokens: 32768,
    supportsStreaming: true,
    supportsJson: true,
    supportsFunctionCalling: true,
    costPerToken: 0.00005,
    speed: 'slow',
    reliability: 0.95,
  },
};

const aiSystem = new AILearningSystem({
  maxCacheSize: 1000,
  defaultStrategy: 'balanced',
});

await aiSystem.initialize(models);

// Route a task to the best model
const routing = await aiSystem.routeTask(
  'Fix this TypeScript error: Property "name" does not exist',
  { context: { jobType: 'generate', taskId: 'task-001' } },
);

console.log(`Selected model: ${routing.selectedModel}`);
console.log(`Confidence: ${routing.confidence}`);
console.log(`Reasoning: ${routing.reasoning}`);

// Record performance feedback
aiSystem.recordPerformance({
  modelName: routing.selectedModel,
  taskCategory: routing.taskCategory,
  score: 0.8,
  scoreSource: 'user-feedback',
  scoreReason: 'Successfully fixed the error',
  timestamp: new Date().toISOString(),
  executionTime: 2500,
  prompt: 'Fix this TypeScript error...',
});
```

## 🎯 Task Categories

The system automatically classifies tasks into these categories:

- `buildfix-ts-errors` - TypeScript error fixing
- `buildfix-general` - General build fixes
- `code-review` - Code review and analysis
- `tdd-analysis` - Test-driven development
- `documentation` - Documentation generation
- `refactoring` - Code refactoring suggestions
- `debugging` - Debugging assistance
- `planning` - Development planning
- `security` - Security analysis
- `general` - General AI tasks

## 🛣️ Routing Strategies

### `best-performance`

Selects the model with the highest historical performance score for the task category.

### `fastest`

Prioritizes response speed over other factors.

### `cheapest`

Selects the most cost-effective model per token.

### `most-reliable`

Chooses the model with the highest reliability score.

### `balanced` (default)

Uses a weighted combination of performance, speed, cost, and reliability.

## 📊 Performance Tracking

The system tracks comprehensive performance metrics:

```typescript
// Get model-specific performance
const performance = aiSystem.getModelPerformance('qwen3:8b', 'buildfix-ts-errors');
console.log(`Average score: ${performance.averageScore}`);
console.log(`Success rate: ${performance.successRate}`);
console.log(`Confidence: ${performance.confidence}`);

// Get system-wide analysis
const analysis = aiSystem.getPerformanceAnalysis();
console.log(`Total entries: ${analysis.totalEntries}`);
console.log(`Recommendations:`, analysis.recommendations);

// Get learning metrics
const metrics = aiSystem.getLearningMetrics();
console.log(`Performance trend: ${metrics.performanceTrend}`);
```

## 🔍 Advanced Usage

### Custom Routing with Context

```typescript
const routing = await aiSystem.routeTask('Review this React component for performance issues', {
  strategy: 'best-performance',
  availableModels: ['qwen3:14b', 'gpt-oss:20b-cloud'],
  context: {
    jobType: 'generate',
    messages: [{ role: 'user', content: 'Please review this component...' }],
    taskId: 'review-001',
  },
});
```

### Batch Performance Recording

```typescript
const scores = [
  {
    modelName: 'qwen3:8b',
    taskCategory: 'buildfix-ts-errors',
    score: 0.8,
    scoreSource: 'user-feedback' as const,
    timestamp: new Date().toISOString(),
    executionTime: 2500,
  },
  // ... more scores
];

aiSystem.recordPerformanceBatch(scores);
```

### System Health Monitoring

```typescript
const health = aiSystem.getSystemHealth();
console.log('System Health:', {
  initialized: health.isInitialized,
  totalModels: health.totalModels,
  totalEntries: health.totalPerformanceEntries,
  averageConfidence: health.averageConfidence,
});
```

### Data Export/Import

```typescript
// Export learning data
const data = aiSystem.exportData();
// Save to file or database...

// Import learning data
aiSystem.importData({
  performanceScores: data.performanceScores,
  modelCapabilities: data.modelCapabilities,
});
```

## 📈 Integration Examples

### With Ollama Queue

```typescript
// In your ollama-queue implementation
const routing = await aiSystem.routeTask(prompt, {
  context: { jobType, messages, taskId },
});

// Submit job with selected model
const jobId = await ollamaQueue.submitJob({
  modelName: routing.selectedModel,
  jobType,
  prompt,
  // ... other options
});

// Record performance when job completes
const result = await ollamaQueue.getJobResult(jobId);
aiSystem.recordPerformance({
  modelName: routing.selectedModel,
  taskCategory: routing.taskCategory,
  score: result.success ? 0.8 : -0.5,
  scoreSource: 'auto-eval',
  timestamp: new Date().toISOString(),
  executionTime: result.executionTime,
});
```

### With BuildFix System

```typescript
// Route BuildFix tasks intelligently
const routing = await aiSystem.routeTask(errorContext, {
  strategy: 'best-performance',
  context: { jobType: 'generate', taskId: errorId },
});

// Use the selected model for fixing
const fixResult = await applyFix(routing.selectedModel, errorContext);

// Record the outcome
aiSystem.recordPerformance({
  modelName: routing.selectedModel,
  taskCategory: 'buildfix-ts-errors',
  score: fixResult.success ? 0.9 : -0.3,
  scoreSource: 'deterministic',
  scoreReason: fixResult.reason,
  timestamp: new Date().toISOString(),
  executionTime: fixResult.executionTime,
});
```

## 🛠️ API Reference

### Classes

#### `AILearningSystem`

Main orchestrator class for AI learning and routing.

**Methods:**

- `initialize(models)` - Initialize with available models
- `routeTask(prompt, options?)` - Route task to optimal model
- `recordPerformance(score)` - Record single performance score
- `recordPerformanceBatch(scores)` - Record multiple scores
- `getModelPerformance(modelName, category?)` - Get model performance
- `queryPerformance(query)` - Query performance data
- `getPerformanceAnalysis()` - Get comprehensive analysis
- `getLearningMetrics()` - Get learning metrics
- `getRoutingStatistics()` - Get routing statistics
- `getSystemHealth()` - Get system health status
- `exportData()` - Export learning data
- `importData(data)` - Import learning data

#### `TaskClassifier`

Static methods for task classification.

**Methods:**

- `classifyTask(prompt, context?)` - Classify task into category
- `getAllCategories()` - Get all available categories
- `getClassificationScores(prompt, context?)` - Get classification scores

#### `PerformanceTracker`

Tracks and analyzes model performance.

**Methods:**

- `recordScore(score)` - Record performance score
- `getScores(query)` - Get filtered scores
- `getModelPerformance(modelName, category?)` - Get model analysis
- `getPerformanceAnalysis()` - Get comprehensive analysis

#### `ModelRouter`

Intelligent model routing logic.

**Methods:**

- `selectBestModel(prompt, options?)` - Select optimal model
- `registerModel(name, capabilities)` - Register model
- `getRoutingStatistics()` - Get routing stats

### Types

#### `ModelCapabilities`

```typescript
type ModelCapabilities = {
  maxTokens: number;
  supportsStreaming: boolean;
  supportsJson: boolean;
  supportsFunctionCalling: boolean;
  costPerToken: number;
  speed: 'fast' | 'medium' | 'slow';
  reliability: number; // 0 to 1
};
```

#### `AIPerformanceScore`

```typescript
type AIPerformanceScore = {
  score: number; // -1 to 1
  scoreSource: 'deterministic' | 'user-feedback' | 'auto-eval';
  scoreReason?: string;
  taskCategory: TaskCategory;
  executionTime?: number;
  tokensUsed?: number;
  modelName: string;
  timestamp: string;
  prompt?: string;
  result?: any;
};
```

#### `AIRoutingDecision`

```typescript
type AIRoutingDecision = {
  taskId?: string;
  prompt: string;
  taskCategory: TaskCategory;
  selectedModel: string;
  alternativeModels: string[];
  confidence: number; // 0 to 1
  reasoning: string;
  timestamp: string;
  expectedPerformance: number;
  riskLevel: 'low' | 'medium' | 'high';
};
```

## 🧪 Testing

Run the example to see the system in action:

```bash
pnpm tsx packages/ai-learning/example.ts
```

## 📚 Documentation

- **[Vector Compression Research](./docs/vector-compression-research.md)** - Comprehensive analysis of cutting-edge vector compression solutions for improving Eidolon field integration performance
- **[Eidolon Field Integration Status](./EIDOLON_FIELD_INTEGRATION_STATUS.md)** - Current status and implementation details for Eidolon field classification

## 🤝 Contributing

This package is part of the Promethean Framework. Please follow the contribution guidelines in the main repository.

## 📄 License

MIT License - see LICENSE file in the main repository.
