import { AILearningSystem, type ModelCapabilities } from './src/index.js';

// Example usage of the AI Learning System
async function demonstrateAILearning() {
  console.log('🤖 AI Learning System Demo\n');

  // Initialize the learning system with available models
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
    'qwen3:14b': {
      maxTokens: 16384,
      supportsStreaming: true,
      supportsJson: true,
      supportsFunctionCalling: true,
      costPerToken: 0.000025,
      speed: 'medium',
      reliability: 0.9,
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

  console.log('✅ AI Learning System initialized');
  console.log(`📊 Available models: ${aiSystem.getAvailableModels().join(', ')}\n`);

  // Example 1: Route a BuildFix task
  console.log('🔧 Example 1: BuildFix TypeScript Error Task');
  const buildfixPrompt = 'Fix this TypeScript error: Property "name" does not exist on type "User"';
  const routing1 = await aiSystem.routeTask(buildfixPrompt, {
    context: { jobType: 'generate', taskId: 'buildfix-001' },
  });

  console.log(`📍 Selected model: ${routing1.selectedModel}`);
  console.log(`🎯 Task category: ${routing1.taskCategory}`);
  console.log(`📈 Confidence: ${(routing1.confidence * 100).toFixed(1)}%`);
  console.log(`💭 Reasoning: ${routing1.reasoning}\n`);

  // Example 2: Route a code review task
  console.log('📋 Example 2: Code Review Task');
  const codeReviewPrompt = 'Review this React component for performance issues and best practices';
  const routing2 = await aiSystem.routeTask(codeReviewPrompt, {
    strategy: 'best-performance',
    context: { jobType: 'generate', taskId: 'review-001' },
  });

  console.log(`📍 Selected model: ${routing2.selectedModel}`);
  console.log(`🎯 Task category: ${routing2.taskCategory}`);
  console.log(`📈 Confidence: ${(routing2.confidence * 100).toFixed(1)}%`);
  console.log(`💭 Reasoning: ${routing2.reasoning}\n`);

  // Example 3: Record performance feedback
  console.log('📊 Example 3: Recording Performance Feedback');

  // Simulate completed tasks with performance scores
  aiSystem.recordPerformance({
    modelName: routing1.selectedModel,
    taskCategory: routing1.taskCategory,
    score: 0.8, // Good performance
    scoreSource: 'user-feedback',
    scoreReason: 'Successfully fixed TypeScript error',
    timestamp: new Date().toISOString(),
    executionTime: 2500,
    prompt: buildfixPrompt,
  });

  aiSystem.recordPerformance({
    modelName: routing2.selectedModel,
    taskCategory: routing2.taskCategory,
    score: 0.9, // Excellent performance
    scoreSource: 'user-feedback',
    scoreReason: 'Provided comprehensive code review',
    timestamp: new Date().toISOString(),
    executionTime: 3200,
    prompt: codeReviewPrompt,
  });

  console.log('✅ Performance feedback recorded\n');

  // Example 4: Get system insights
  console.log('📈 Example 4: System Insights');
  const health = aiSystem.getSystemHealth();
  console.log(`🏥 System Health:`);
  console.log(`   - Initialized: ${health.isInitialized}`);
  console.log(`   - Total models: ${health.totalModels}`);
  console.log(`   - Performance entries: ${health.totalPerformanceEntries}`);
  console.log(`   - Total routings: ${health.totalRoutings}`);
  console.log(`   - Average confidence: ${(health.averageConfidence * 100).toFixed(1)}%\n`);

  // Example 5: Performance analysis
  console.log('🔍 Example 5: Performance Analysis');
  const analysis = aiSystem.getPerformanceAnalysis();
  console.log(`📊 Performance Analysis:`);
  console.log(`   - Total entries: ${analysis.totalEntries}`);
  console.log(`   - Models tracked: ${Object.keys(analysis.models).length}`);
  console.log(`   - Task categories: ${Object.keys(analysis.taskCategories).length}`);

  if (analysis.recommendations.length > 0) {
    console.log(`   - Recommendations:`);
    analysis.recommendations.forEach((rec, i) => {
      console.log(`     ${i + 1}. ${rec}`);
    });
  }
  console.log('');

  // Example 6: Learning metrics
  console.log('📚 Example 6: Learning Metrics');
  const metrics = aiSystem.getLearningMetrics();
  console.log(`📊 Learning Metrics:`);
  console.log(`   - Total jobs: ${metrics.totalJobs}`);
  console.log(`   - Successful jobs: ${metrics.successfulJobs}`);
  console.log(`   - Failed jobs: ${metrics.failedJobs}`);
  console.log(`   - Average score: ${metrics.averageScore.toFixed(2)}`);
  console.log(`   - Performance trend: ${metrics.performanceTrend}`);
  console.log('');

  // Example 7: Model-specific performance
  console.log('🎯 Example 7: Model-Specific Performance');
  for (const modelName of aiSystem.getAvailableModels()) {
    const performance = aiSystem.getModelPerformance(modelName);
    if (performance) {
      console.log(`🤖 ${modelName}:`);
      console.log(`   - Average score: ${performance.averageScore.toFixed(2)}`);
      console.log(`   - Success rate: ${(performance.successRate * 100).toFixed(1)}%`);
      console.log(`   - Total jobs: ${performance.totalJobs}`);
      console.log(`   - Confidence: ${(performance.confidence * 100).toFixed(1)}%`);
    }
  }

  console.log(
    '\n🎉 Demo completed! The AI Learning System is now tracking performance and making intelligent routing decisions.',
  );
}

// Run the demo
demonstrateAILearning().catch(console.error);

export { demonstrateAILearning };
