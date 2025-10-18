# Code Examples - OpenCode Client

## Overview

This document provides practical code examples demonstrating correct usage patterns for the `@promethean/opencode-client` package, with a focus on the recent TypeScript compilation fixes and proper queue management.

## Basic Usage Examples

### 1. Simple Job Submission and Monitoring

```typescript
import { submitJob, getJobStatus, getJobResult } from '@promethean/opencode-client';

async function basicJobExample() {
  try {
    // Submit a generation job
    const jobResult = await submitJob.execute({
      modelName: 'llama2',
      jobType: 'generate',
      prompt: 'Explain the benefits of TypeScript in web development',
      options: {
        temperature: 0.7,
        num_predict: 500
      }
    }, {
      agent: 'example-agent',
      sessionID: 'example-session'
    });

    const { jobId } = JSON.parse(jobResult);
    console.log(`Job submitted with ID: ${jobId}`);

    // Monitor job progress
    await monitorJobUntilComplete(jobId);

  } catch (error) {
    console.error('Job submission failed:', error.message);
  }
}

async function monitorJobUntilComplete(jobId: string) {
  const maxWaitTime = 60000; // 60 seconds
  const checkInterval = 2000; // 2 seconds
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
    const statusResult = await getJobStatus.execute({ jobId });
    const status = JSON.parse(statusResult);

    console.log(`Job ${jobId}: ${status.status}`);

    if (status.status === 'completed') {
      const result = await getJobResult.execute({ jobId });
      const parsedResult = JSON.parse(result);
      console.log('Job completed successfully!');
      console.log('Result:', parsedResult.result);
      return parsedResult.result;
    }

    if (status.status === 'failed') {
      throw new Error(`Job failed: ${status.error?.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, checkInterval));
  }

  throw new Error(`Job ${jobId} timed out after ${maxWaitTime}ms`);
}

// Run the example
basicJobExample();
```

### 2. Chat Conversation Example

```typescript
import { submitJob } from '@promethean/opencode-client';

async function chatExample() {
  const conversation = [
    {
      role: 'system' as const,
      content: 'You are a TypeScript expert. Provide clear, concise answers with code examples.'
    },
    {
      role: 'user' as const,
      content: 'What is the difference between interface and type in TypeScript?'
    }
  ];

  try {
    const chatResult = await submitJob.execute({
      modelName: 'llama2',
      jobType: 'chat',
      messages: conversation,
      options: {
        temperature: 0.5,
        num_predict: 800
      }
    }, {
      agent: 'chat-agent',
      sessionID: 'chat-session'
    });

    const { jobId } = JSON.parse(chatResult);
    console.log(`Chat job submitted: ${jobId}`);

    // Monitor and get result (using the monitor function from previous example)
    const result = await monitorJobUntilComplete(jobId);
    console.log('Chat response:', result);

  } catch (error) {
    console.error('Chat failed:', error.message);
  }
}

chatExample();
```

### 3. Embedding Generation Example

```typescript
import { submitJob } from '@promethean/opencode-client';

async function embeddingExample() {
  const texts = [
    'TypeScript is a typed superset of JavaScript',
    'It adds static type checking to JavaScript',
    'TypeScript compiles to plain JavaScript'
  ];

  try {
    const embeddingResult = await submitJob.execute({
      modelName: 'all-minilm',
      jobType: 'embedding',
      input: texts
    }, {
      agent: 'embedding-agent',
      sessionID: 'embedding-session'
    });

    const { jobId } = JSON.parse(embeddingResult);
    console.log(`Embedding job submitted: ${jobId}`);

    const result = await monitorJobUntilComplete(jobId);
    console.log('Embeddings generated:', result);

    return result;

  } catch (error) {
    console.error('Embedding generation failed:', error.message);
  }
}

embeddingExample();
```

## Advanced Usage Examples

### 4. Batch Processing with Priority Management

```typescript
import { submitJob, getJobStatus, getJobResult, listJobs } from '@promethean/opencode-client';

interface BatchJob {
  id: string;
  prompt: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
}

async function batchProcessingExample() {
  const jobs: BatchJob[] = [
    {
      id: 'urgent-fix',
      prompt: 'Fix this critical TypeScript compilation error',
      priority: 'urgent',
      category: 'bugfix'
    },
    {
      id: 'feature-impl',
      prompt: 'Implement a new TypeScript utility function',
      priority: 'high',
      category: 'feature'
    },
    {
      id: 'documentation',
      prompt: 'Write documentation for the TypeScript module',
      priority: 'low',
      category: 'docs'
    }
  ];

  const submittedJobs = [];

  // Submit all jobs with their priorities
  for (const job of jobs) {
    try {
      const result = await submitJob.execute({
        jobName: `${job.category}-${job.id}`,
        modelName: 'codellama',
        jobType: 'generate',
        prompt: job.prompt,
        priority: job.priority,
        options: {
          temperature: 0.3,
          num_predict: 1000
        }
      }, {
        agent: 'batch-agent',
        sessionID: 'batch-session'
      });

      const parsed = JSON.parse(result);
      submittedJobs.push({
        ...job,
        jobId: parsed.jobId,
        submittedAt: Date.now()
      });

      console.log(`Submitted ${job.id} with priority ${job.priority}`);

    } catch (error) {
      console.error(`Failed to submit job ${job.id}:`, error.message);
    }
  }

  // Monitor all jobs
  const results = await monitorBatchJobs(submittedJobs);
  
  // Process results by priority order
  const urgentResults = results.filter(r => r.priority === 'urgent');
  const highResults = results.filter(r => r.priority === 'high');
  const lowResults = results.filter(r => r.priority === 'low');

  console.log('Urgent results:', urgentResults.length);
  console.log('High priority results:', highResults.length);
  console.log('Low priority results:', lowResults.length);

  return results;
}

async function monitorBatchJobs(jobs: any[]) {
  const results = [];
  const maxWaitTime = 120000; // 2 minutes per job

  for (const job of jobs) {
    try {
      const result = await monitorJobUntilComplete(job.jobId);
      results.push({
        ...job,
        result,
        completedAt: Date.now(),
        duration: Date.now() - job.submittedAt
      });
    } catch (error) {
      console.error(`Job ${job.id} failed:`, error.message);
      results.push({
        ...job,
        error: error.message,
        failedAt: Date.now()
      });
    }
  }

  return results;
}

batchProcessingExample();
```

### 5. Queue Management and Monitoring

```typescript
import { 
  getQueueInfo, 
  startQueueProcessor, 
  stopQueueProcessor,
  manageCache,
  listJobs 
} from '@promethean/opencode-client';

class QueueManager {
  private monitoringInterval: NodeJS.Timeout | null = null;

  async startMonitoring(intervalMs: number = 10000) {
    console.log('Starting queue monitoring...');

    // Ensure processor is running
    const info = await getQueueInfo.execute({});
    const queueData = JSON.parse(info);
    
    if (!queueData.processorActive) {
      console.log('Starting queue processor...');
      startQueueProcessor();
    }

    // Start periodic monitoring
    this.monitoringInterval = setInterval(async () => {
      await this.checkQueueHealth();
    }, intervalMs);

    console.log('Queue monitoring started');
  }

  async checkQueueHealth() {
    try {
      const info = await getQueueInfo.execute({});
      const data = JSON.parse(info);

      console.log('=== Queue Health ===');
      console.log(`Pending: ${data.pending}`);
      console.log(`Running: ${data.running}`);
      console.log(`Completed: ${data.completed}`);
      console.log(`Failed: ${data.failed}`);
      console.log(`Processor Active: ${data.processorActive}`);
      console.log(`Cache Size: ${data.cacheSize}`);

      // Alert on potential issues
      if (data.pending > 20) {
        console.warn('⚠️ High queue backlog detected');
      }

      if (data.running >= data.maxConcurrent) {
        console.warn('⚠️ Max concurrent jobs reached');
      }

      if (!data.processorActive && data.pending > 0) {
        console.error('❌ Processor inactive with pending jobs');
        startQueueProcessor();
      }

    } catch (error) {
      console.error('Queue health check failed:', error.message);
    }
  }

  async getDetailedStats() {
    try {
      const [queueInfo, cacheStats, jobList] = await Promise.all([
        getQueueInfo.execute({}),
        manageCache.execute({ action: 'stats' }),
        listJobs.execute({ limit: 10, agentOnly: false })
      ]);

      return {
        queue: JSON.parse(queueInfo),
        cache: JSON.parse(cacheStats),
        recentJobs: JSON.parse(jobList)
      };
    } catch (error) {
      console.error('Failed to get detailed stats:', error.message);
      return null;
    }
  }

  async emergencyCleanup() {
    console.log('Performing emergency cleanup...');

    try {
      // Clear cache if it's too large
      const cacheStats = await manageCache.execute({ action: 'stats' });
      const cacheData = JSON.parse(cacheStats);

      if (cacheData.totalSize > 5000) {
        console.log('Clearing large cache...');
        await manageCache.execute({ action: 'clear' });
      }

      // Restart processor if needed
      const queueInfo = await getQueueInfo.execute({});
      const queueData = JSON.parse(queueInfo);

      if (!queueData.processorActive) {
        startQueueProcessor();
      }

      console.log('Emergency cleanup completed');

    } catch (error) {
      console.error('Emergency cleanup failed:', error.message);
    }
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('Queue monitoring stopped');
    }
  }
}

// Usage example
async function queueManagementExample() {
  const manager = new QueueManager();

  // Start monitoring
  await manager.startMonitoring(5000); // Every 5 seconds

  // Get detailed stats
  const stats = await manager.getDetailedStats();
  if (stats) {
    console.log('Detailed Stats:', JSON.stringify(stats, null, 2));
  }

  // Let it run for a while
  setTimeout(async () => {
    await manager.emergencyCleanup();
    manager.stopMonitoring();
  }, 60000); // Run for 1 minute
}

queueManagementExample();
```

### 6. Cache Management and Feedback

```typescript
import { 
  manageCache, 
  submitFeedback, 
  submitJob, 
  getJobResult 
} from '@promethean/opencode-client';

class CacheManager {
  async analyzeCachePerformance() {
    try {
      const analysis = await manageCache.execute({ action: 'performance-analysis' });
      const data = JSON.parse(analysis);

      console.log('=== Cache Performance Analysis ===');
      console.log(`Total entries: ${data.totalEntries}`);
      console.log(`Models: ${Object.keys(data.models).length}`);

      // Show performance by category
      for (const [category, categoryData] of Object.entries(data.performanceByCategory)) {
        const dataAny = categoryData as any;
        console.log(`${category}:`);
        console.log(`  Average score: ${dataAny.averageScore?.toFixed(3)}`);
        console.log(`  Total jobs: ${dataAny.count}`);
      }

      return data;

    } catch (error) {
      console.error('Cache analysis failed:', error.message);
      return null;
    }
  }

  async submitSmartFeedback(
    prompt: string, 
    modelName: string, 
    jobType: 'generate' | 'chat',
    result: any,
    executionTime: number,
    userScore?: number
  ) {
    try {
      // Determine automatic score based on execution time and result quality
      let autoScore = 0.5; // Neutral score

      if (executionTime < 5000) {
        autoScore += 0.2; // Fast execution
      } else if (executionTime > 30000) {
        autoScore -= 0.2; // Slow execution
      }

      if (result && typeof result === 'string' && result.length > 50) {
        autoScore += 0.1; // Good result length
      }

      // Use user score if provided, otherwise use automatic score
      const finalScore = userScore !== undefined ? userScore : autoScore;

      // Determine task category from prompt
      const taskCategory = this.inferTaskCategory(prompt);

      const feedbackResult = await submitFeedback.execute({
        prompt,
        modelName,
        jobType,
        score: finalScore,
        reason: userScore !== undefined 
          ? `User feedback: ${finalScore}` 
          : `Auto-score: ${finalScore.toFixed(2)} (execution time: ${executionTime}ms)`,
        taskCategory
      });

      console.log(`Feedback submitted: score=${finalScore.toFixed(3)}, category=${taskCategory}`);
      return JSON.parse(feedbackResult);

    } catch (error) {
      console.error('Feedback submission failed:', error.message);
      return null;
    }
  }

  private inferTaskCategory(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes('typescript') && lowerPrompt.includes('error')) {
      return 'buildfix-ts-errors';
    }
    if (lowerPrompt.includes('fix') || lowerPrompt.includes('bug')) {
      return 'bugfix';
    }
    if (lowerPrompt.includes('test') || lowerPrompt.includes('spec')) {
      return 'testing';
    }
    if (lowerPrompt.includes('document') || lowerPrompt.includes('readme')) {
      return 'documentation';
    }
    if (lowerPrompt.includes('code') || lowerPrompt.includes('implement')) {
      return 'coding';
    }
    if (lowerPrompt.includes('explain') || lowerPrompt.includes('what is')) {
      return 'explanation';
    }

    return 'general';
  }

  async optimizeCache() {
    try {
      const stats = await manageCache.execute({ action: 'stats' });
      const data = JSON.parse(stats);

      console.log('=== Cache Optimization ===');
      console.log(`Current size: ${data.totalSize} entries`);
      console.log(`Model count: ${data.modelCount}`);

      // Clear cache if it's getting too large
      if (data.totalSize > 10000) {
        console.log('Cache too large, clearing...');
        await manageCache.execute({ action: 'clear' });
        return { action: 'cleared', reason: 'size_limit' };
      }

      // Analyze performance and suggest optimizations
      const analysis = await this.analyzeCachePerformance();
      if (analysis) {
        const lowPerformingCategories = Object.entries(analysis.performanceByCategory)
          .filter(([_, data]) => (data as any).averageScore < 0.3)
          .map(([category]) => category);

        if (lowPerformingCategories.length > 0) {
          console.log('Low performing categories:', lowPerformingCategories);
          return { 
            action: 'analyze', 
            lowPerformingCategories,
            recommendation: 'Consider using different models for these categories'
          };
        }
      }

      return { action: 'optimal', reason: 'cache performing well' };

    } catch (error) {
      console.error('Cache optimization failed:', error.message);
      return { action: 'error', error: error.message };
    }
  }
}

// Usage example
async function cacheManagementExample() {
  const cacheManager = new CacheManager();

  // Submit a job and provide feedback
  const startTime = Date.now();
  const jobResult = await submitJob.execute({
    modelName: 'llama2',
    jobType: 'generate',
    prompt: 'Explain TypeScript generics with examples',
    options: { temperature: 0.5, num_predict: 800 }
  }, { agent: 'cache-demo', sessionID: 'cache-session' });

  const { jobId } = JSON.parse(jobResult);
  const result = await monitorJobUntilComplete(jobId);
  const executionTime = Date.now() - startTime;

  // Submit smart feedback
  await cacheManager.submitSmartFeedback(
    'Explain TypeScript generics with examples',
    'llama2',
    'generate',
    result,
    executionTime,
    0.8 // User score
  );

  // Analyze cache performance
  await cacheManager.analyzeCachePerformance();

  // Optimize cache
  const optimization = await cacheManager.optimizeCache();
  console.log('Optimization result:', optimization);
}

cacheManagementExample();
```

## Error Handling Examples

### 7. Robust Error Handling and Recovery

```typescript
import { 
  submitJob, 
  getJobStatus, 
  cancelJob,
  listModels,
  getQueueInfo 
} from '@promethean/opencode-client';

class RobustJobManager {
  private maxRetries = 3;
  private retryDelay = 2000;

  async submitJobWithRetry(
    params: any, 
    context: any, 
    retries: number = this.maxRetries
  ): Promise<any> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`Submitting job (attempt ${attempt}/${retries})`);
        
        const result = await submitJob.execute(params, context);
        console.log('Job submitted successfully');
        return JSON.parse(result);

      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error.message);

        if (attempt === retries) {
          throw new Error(`Job submission failed after ${retries} attempts: ${error.message}`);
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }
  }

  async handleJobFailure(jobId: string, error: Error): Promise<void> {
    console.error(`Job ${jobId} failed:`, error.message);

    try {
      const status = await getJobStatus.execute({ jobId });
      const jobInfo = JSON.parse(status);

      // Determine failure type and appropriate action
      if (error.message.includes('timeout')) {
        console.log('Timeout detected, retrying with shorter response...');
        await this.retryWithShorterResponse(jobInfo);
      } else if (error.message.includes('model')) {
        console.log('Model error detected, trying fallback model...');
        await this.retryWithFallbackModel(jobInfo);
      } else if (error.message.includes('queue')) {
        console.log('Queue error detected, checking queue health...');
        await this.handleQueueError();
      }

    } catch (statusError) {
      console.error('Failed to get job status for error handling:', statusError.message);
    }
  }

  private async retryWithShorterResponse(originalJob: any): Promise<void> {
    try {
      await submitJob.execute({
        modelName: originalJob.modelName,
        jobType: originalJob.type,
        prompt: originalJob.prompt,
        options: {
          ...originalJob.options,
          num_predict: Math.min((originalJob.options?.num_predict || 1000) / 2, 200)
        }
      }, {
        agent: originalJob.agentId,
        sessionID: originalJob.sessionId
      });

      console.log('Retried job with shorter response length');

    } catch (error) {
      console.error('Retry with shorter response failed:', error.message);
    }
  }

  private async retryWithFallbackModel(originalJob: any): Promise<void> {
    try {
      const models = await listModels.execute({ detailed: false });
      const availableModels = JSON.parse(models).models;

      // Find a fallback model (prefer smaller/simpler models)
      const fallbackModel = availableModels.find((model: string) => 
        model !== originalJob.modelName && 
        (model.includes('7b') || model.includes('small'))
      ) || availableModels[0];

      if (fallbackModel) {
        await submitJob.execute({
          modelName: fallbackModel,
          jobType: originalJob.type,
          prompt: originalJob.prompt,
          options: originalJob.options
        }, {
          agent: originalJob.agentId,
          sessionID: originalJob.sessionId
        });

        console.log(`Retried job with fallback model: ${fallbackModel}`);
      }

    } catch (error) {
      console.error('Retry with fallback model failed:', error.message);
    }
  }

  private async handleQueueError(): Promise<void> {
    try {
      const queueInfo = await getQueueInfo.execute({});
      const data = JSON.parse(queueInfo);

      console.log('Queue status during error:', data);

      if (!data.processorActive) {
        console.log('Restarting queue processor...');
        // This would use the proper function from the queue package
        // startQueueProcessor();
      }

      if (data.pending > 50) {
        console.log('High queue backlog detected, consider canceling low-priority jobs');
        // Implementation for canceling low-priority jobs would go here
      }

    } catch (error) {
      console.error('Failed to handle queue error:', error.message);
    }
  }

  async gracefulShutdown(): Promise<void> {
    console.log('Initiating graceful shutdown...');

    try {
      // Cancel all pending jobs for this agent
      const jobs = await listJobs.execute({ 
        status: 'pending', 
        agentOnly: true,
        limit: 100 
      });
      
      const jobList = JSON.parse(jobs);
      
      for (const job of jobList) {
        try {
          await cancelJob.execute({ jobId: job.id });
          console.log(`Canceled job: ${job.id}`);
        } catch (error) {
          console.error(`Failed to cancel job ${job.id}:`, error.message);
        }
      }

      console.log('Graceful shutdown completed');

    } catch (error) {
      console.error('Graceful shutdown failed:', error.message);
    }
  }
}

// Usage example
async function robustErrorHandlingExample() {
  const manager = new RobustJobManager();

  try {
    // Submit job with retry logic
    const job = await manager.submitJobWithRetry({
      modelName: 'llama2',
      jobType: 'generate',
      prompt: 'Complex TypeScript task that might fail',
      options: { num_predict: 2000 }
    }, {
      agent: 'robust-agent',
      sessionID: 'robust-session'
    });

    console.log('Job submitted successfully:', job);

    // Simulate error handling
    // await manager.handleJobFailure(job.jobId, new Error('Simulated timeout'));

  } catch (error) {
    console.error('All retry attempts failed:', error.message);
    await manager.gracefulShutdown();
  }
}

robustErrorHandlingExample();
```

## TypeScript Best Practices Examples

### 8. Type-Safe Job Management

```typescript
import { submitJob, getJobStatus, getJobResult } from '@promethean/opencode-client';

// Define proper types for job parameters
interface GenerateJobParams {
  modelName: string;
  prompt: string;
  options?: {
    temperature?: number;
    num_predict?: number;
    top_p?: number;
  };
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  jobName?: string;
}

interface ChatJobParams {
  modelName: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  options?: {
    temperature?: number;
    num_predict?: number;
  };
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  jobName?: string;
}

interface EmbeddingJobParams {
  modelName: string;
  input: string | string[];
  jobName?: string;
}

// Type-safe job submission functions
class TypedJobManager {
  async submitGenerateJob(params: GenerateJobParams, context: {
    agent: string;
    sessionID: string;
  }): Promise<{ jobId: string; status: string }> {
    const result = await submitJob.execute({
      modelName: params.modelName,
      jobType: 'generate' as const,
      prompt: params.prompt,
      options: params.options,
      priority: params.priority || 'medium',
      jobName: params.jobName
    }, context);

    return JSON.parse(result);
  }

  async submitChatJob(params: ChatJobParams, context: {
    agent: string;
    sessionID: string;
  }): Promise<{ jobId: string; status: string }> {
    const result = await submitJob.execute({
      modelName: params.modelName,
      jobType: 'chat' as const,
      messages: params.messages,
      options: params.options,
      priority: params.priority || 'medium',
      jobName: params.jobName
    }, context);

    return JSON.parse(result);
  }

  async submitEmbeddingJob(params: EmbeddingJobParams, context: {
    agent: string;
    sessionID: string;
  }): Promise<{ jobId: string; status: string }> {
    const result = await submitJob.execute({
      modelName: params.modelName,
      jobType: 'embedding' as const,
      input: params.input,
      jobName: params.jobName
    }, context);

    return JSON.parse(result);
  }

  // Type-safe job monitoring
  async waitForJobCompletion(jobId: string, timeoutMs: number = 60000): Promise<{
    id: string;
    status: 'completed' | 'failed';
    result?: any;
    error?: string;
  }> {
    const startTime = Date.now();
    const checkInterval = 2000;

    while (Date.now() - startTime < timeoutMs) {
      const statusResult = await getJobStatus.execute({ jobId });
      const status = JSON.parse(statusResult);

      if (status.status === 'completed') {
        const result = await getJobResult.execute({ jobId });
        const parsedResult = JSON.parse(result);
        
        return {
          id: jobId,
          status: 'completed',
          result: parsedResult.result
        };
      }

      if (status.status === 'failed') {
        return {
          id: jobId,
          status: 'failed',
          error: status.error?.message
        };
      }

      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }

    throw new Error(`Job ${jobId} timed out after ${timeoutMs}ms`);
  }
}

// Usage example with proper typing
async function typedJobExample() {
  const manager = new TypedJobManager();

  try {
    // Generate job with type safety
    const generateJob = await manager.submitGenerateJob({
      modelName: 'llama2',
      prompt: 'Explain TypeScript type safety',
      options: {
        temperature: 0.7,
        num_predict: 500
      },
      priority: 'high',
      jobName: 'typescript-explanation'
    }, {
      agent: 'typed-agent',
      sessionID: 'typed-session'
    });

    console.log('Generate job submitted:', generateJob);

    // Wait for completion with type safety
    const result = await manager.waitForJobCompletion(generateJob.jobId);
    
    if (result.status === 'completed') {
      console.log('Job completed successfully');
      console.log('Result:', result.result);
    } else {
      console.error('Job failed:', result.error);
    }

  } catch (error) {
    console.error('Typed job example failed:', error.message);
  }
}

typedJobExample();
```

## Migration Examples

### 9. Migrating from Old Queue Management

```typescript
// ❌ OLD PATTERN (before TypeScript fixes)
function oldStopQueueProcessor() {
  setProcessingInterval(null); // Type error!
}

// ✅ NEW PATTERN (after TypeScript fixes)
import { clearProcessingInterval } from '@promethean/ollama-queue';

function newStopQueueProcessor() {
  clearProcessingInterval(); // Type-safe and correct
}

// Migration helper
class MigrationHelper {
  static migrateOldCode() {
    console.log('=== Migration Example ===');
    
    // Old way (causes TypeScript errors)
    console.log('❌ Old way: setProcessingInterval(null)');
    console.log('   - Causes TypeScript compilation error');
    console.log('   - Type mismatch: null not assignable to NodeJS.Timeout');
    
    // New way (type-safe)
    console.log('✅ New way: clearProcessingInterval()');
    console.log('   - Type-safe function');
    console.log('   - Properly handles internal state');
    console.log('   - No TypeScript errors');
    
    // Example of proper usage
    this.demonstrateProperUsage();
  }
  
  private static async demonstrateProperUsage() {
    // Import the correct functions
    import { 
      startQueueProcessor, 
      clearProcessingInterval, 
      getProcessingInterval 
    } from '@promethean/ollama-queue';
    
    // Proper queue management
    console.log('Starting queue processor...');
    startQueueProcessor();
    
    // Check if it's running
    const isRunning = !!getProcessingInterval();
    console.log(`Processor running: ${isRunning}`);
    
    // Proper cleanup
    console.log('Stopping queue processor...');
    clearProcessingInterval();
    
    // Verify it's stopped
    const isStillRunning = !!getProcessingInterval();
    console.log(`Processor still running: ${isStillRunning}`);
  }
}

// Run migration example
MigrationHelper.migrateOldCode();
```

These examples demonstrate the correct usage patterns for the `@promethean/opencode-client` package, incorporating the recent TypeScript compilation fixes and following best practices for type safety, error handling, and queue management.