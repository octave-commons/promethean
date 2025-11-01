# AI Learning Package

AI learning package for adaptive model optimization and training.

## Overview

The `@promethean-os/ai-learning` package provides machine learning capabilities for:

- Model training and optimization
- Learning from user interactions
- Adaptive performance improvement
- Knowledge base enhancement

## Features

- **Adaptive Learning**: Models improve based on usage patterns
- **Performance Optimization**: Continuous model refinement
- **Knowledge Integration**: Learning from system interactions
- **Feedback Loops**: User-guided improvement

## Usage

```typescript
import { createAILearningSystem } from '@promethean-os/ai-learning';

const aiSystem = createAILearningSystem({
  modelPath: './models/base-model',
  learningRate: 0.001,
  feedbackEnabled: true,
});

// Train on user interactions
await aiSystem.learnFromInteraction({
  input: userQuery,
  output: systemResponse,
  feedback: userFeedback,
});
```

## Configuration

```typescript
interface AILearningConfig {
  modelPath: string;
  learningRate: number;
  batchSize: number;
  feedbackEnabled: boolean;
  persistenceEnabled: boolean;
}
```

## 📁 Implementation

### Core Files
- **Main Entry**: [`src/index.ts`](../../../packages/ai-learning/src/index.ts) (14 lines)
- **Learning System**: [`src/learning-system.ts`](../../../packages/ai-learning/src/learning-system.ts) (298 lines)
- **Model Router**: [`src/model-router.ts`](../../../packages/ai-learning/src/model-router.ts) (362 lines)
- **Performance Tracker**: [`src/performance-tracker.ts`](../../../packages/ai-learning/src/performance-tracker.ts) (407 lines)
- **Task Classifier**: [`src/task-classifier.ts`](../../../packages/ai-learning/src/task-classifier.ts) (218 lines)
- **Types**: [`src/types.ts`](../../../packages/ai-learning/src/types.ts) (188 lines)

### Key Classes & Functions
- **AILearningSystem**: [`AILearningSystem`](../../../packages/ai-learning/src/learning-system.ts#L19) - Main orchestrator for AI model management
- **ModelRouter**: [`ModelRouter`](../../../packages/ai-learning/src/model-router.ts#L14) - Routes tasks to optimal models
- **PerformanceTracker**: [`PerformanceTracker`](../../../packages/ai-learning/src/performance-tracker.ts#L14) - Tracks model performance metrics
- **TaskClassifier**: [`TaskClassifier`](../../../packages/ai-learning/src/task-classifier.ts#L6) - Classifies tasks by category
- **EidolonFieldClassifier**: [`EidolonFieldClassifier`](../../../packages/ai-learning/src/eidolon-field-classifier.ts#L10) - Field-based classification system

### View Source
- **GitHub**: [View on GitHub](https://github.com/promethean-ai/promethean/tree/main/packages/ai-learning/src)
- **VS Code**: [Open in VS Code](vscode://file/packages/ai-learning/src)

## 📚 API Reference

### Classes

#### AILearningSystem
**Location**: [`src/learning-system.ts`](../../../packages/ai-learning/src/learning-system.ts#L19)

**Description**: Main orchestrator for intelligent AI model management.

**Key Methods**:
- [`initialize()`](../../../packages/ai-learning/src/learning-system.ts#L28) - Initialize with available models
- [`routeTask()`](../../../packages/ai-learning/src/learning-system.ts#L45) - Route task to best model
- [`recordPerformance()`](../../../packages/ai-learning/src/learning-system.ts#L78) - Record performance feedback
- [`getPerformanceAnalysis()`](../../../packages/ai-learning/src/learning-system.ts#L125) - Get performance analysis

#### ModelRouter
**Location**: [`src/model-router.ts`](../../../packages/ai-learning/src/model-router.ts#L14)

**Description**: Routes tasks to optimal models based on performance data.

**Key Methods**:
- [`selectBestModel()`](../../../packages/ai-learning/src/model-router.ts#L45) - Select best model for task
- [`registerModel()`](../../../packages/ai-learning/src/model-router.ts#L89) - Register new model
- [`recordRoutingFeedback()`](../../../packages/ai-learning/src/model-router.ts#L156) - Record routing feedback

#### PerformanceTracker
**Location**: [`src/performance-tracker.ts`](../../../packages/ai-learning/src/performance-tracker.ts#L14)

**Description**: Tracks and analyzes model performance metrics.

**Key Methods**:
- [`recordScore()`](../../../packages/ai-learning/src/performance-tracker.ts#L45) - Record performance score
- [`getModelPerformance()`](../../../packages/ai-learning/src/performance-tracker.ts#L89) - Get model performance
- [`getPerformanceAnalysis()`](../../../packages/ai-learning/src/performance-tracker.ts#L234) - Get performance analysis

### Interfaces

#### TaskEmbedding
**Location**: [`src/types.ts`](../../../packages/ai-learning/src/types.ts#L151)

**Description**: Task embedding representation for classification.

#### LearningStats
**Location**: [`src/types.ts`](../../../packages/ai-learning/src/types.ts#L181)

**Description**: Learning system statistics and metrics.

## Development Status

🚧 **Under Development** - Core learning algorithms implemented, integration in progress.

## Dependencies

- `@promethean-os/llm` - Base LLM integration
- `@promethean-os/persistence` - Model storage
- `@promethean-os/logger` - Learning metrics

## Related Packages

- [[llm]] - Core LLM functionality
- [[persistence]] - Data storage
- [[monitoring]] - Performance tracking
