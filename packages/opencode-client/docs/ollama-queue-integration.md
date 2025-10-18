# Ollama Queue Integration Guide

## Overview

This guide provides comprehensive documentation for working with the Ollama queue integration in the `@promethean/opencode-client` package. It covers the architecture, usage patterns, and best practices for managing asynchronous LLM job processing.

## Architecture

### Queue System Components

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client Tools  │───▶│   Job Queue      │───▶│  Ollama API     │
│                 │    │                  │    │                 │
│ • submitJob     │    │ • Pending Jobs   │    │ • Generate      │
│ • getJobStatus  │    │ • Active Jobs    │    │ • Chat          │
│ • cancelJob     │    │ • Completed Jobs │    │ • Embedding     │
│ • listJobs      │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌──────────────────┐            │
         └──────────────▶│  Cache Layer     │◀───────────┘
                        │                  │
                        │ • Prompt Cache   │
                        │ • Embeddings     │
                        │ • Performance    │
                        └──────────────────┘
```

### Core Components

1. **Job Queue**: In-memory queue managing job lifecycle
2. **Processor**: Background worker that processes jobs at intervals
3. **Cache Layer**: Intelligent caching system for prompt/response pairs
4. **Ollama Integration**: Direct communication with Ollama API

## Getting Started

### Basic Setup

```typescript
import { 
  submitJob, 
  getJobStatus, 
  getJobResult,
  startQueueProcessor,
  stopQueueProcessor 
} from '@promethean/opencode-client';

// The queue processor starts automatically when the first job is submitted
// but you can control it manually if needed
startQueueProcessor();
```

### Submitting Your First Job

```typescript
// Simple generation job
const jobResult = await submitJob.execute({
  modelName: 'llama2',
  jobType: 'generate',
  prompt: 'Explain the benefits of TypeScript',
  priority: 'medium'
}, {
  agent: 'my-agent',
  sessionID: 'session-123'
});

console.log('Job submitted:', JSON.parse(jobResult));
// Output: { jobId: "uuid", jobName: undefined, status: "pending", queuePosition: 1 }
```

### Checking Job Status

```typescript
// Wait for completion and check status
const status = await getJobStatus.execute({
  jobId: "uuid-from-submission"
});

const jobInfo = JSON.parse(status);
console.log('Job status:', jobInfo.status);

if (jobInfo.status === 'completed') {
  const result = await getJobResult.execute({
    jobId: "uuid-from-submission"
  });
  console.log('Job result:', JSON.parse(result));
}
```

## Job Types and Usage

### 1. Generate Jobs

For single-prompt text generation:

```typescript
const generateJob = await submitJob.execute({
  modelName: 'codellama',
  jobType: 'generate',
  prompt: 'Write a TypeScript function that validates email addresses',
  options: {
    temperature: 0.3,
    num_predict: 500
  }
}, context);
```

### 2. Chat Jobs

For conversational interactions:

```typescript
const chatJob = await submitJob.execute({
  modelName: 'llama2',
  jobType: 'chat',
  messages: [
    {
      role: 'system',
      content: 'You are a TypeScript expert. Provide clear, concise answers.'
    },
    {
      role: 'user',
      content: 'What is the difference between interface and type in TypeScript?'
    }
  ],
  options: {
    temperature: 0.5
  }
}, context);
```

### 3. Embedding Jobs

For generating text embeddings:

```typescript
const embeddingJob = await submitJob.execute({
  modelName: 'all-minilm',
  jobType: 'embedding',
  input: 'TypeScript is a typed superset of JavaScript'
}, context);
```

## Advanced Usage Patterns

### Batch Job Processing

```typescript
async function processBatch(prompts: string[], modelName: string) {
  const jobs = [];
  
  // Submit all jobs
  for (const prompt of prompts) {
    const job = await submitJob.execute({
      modelName,
      jobType: 'generate',
      prompt,
      priority: 'medium'
    }, context);
    jobs.push(JSON.parse(job));
  }
  
  // Wait for all to complete
  const results = [];
  for (const job of jobs) {
    let status = 'pending';
    while (status !== 'completed' && status !== 'failed') {
      const statusResult = await getJobStatus.execute({ jobId: job.jobId });
      status = JSON.parse(statusResult).status;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    if (status === 'completed') {
      const result = await getJobResult.execute({ jobId: job.jobId });
      results.push(JSON.parse(result));
    }
  }
  
  return results;
}
```

### Priority-Based Processing

```typescript
// High priority urgent task
const urgentJob = await submitJob.execute({
  modelName: 'llama2',
  jobType: 'generate',
  prompt: 'Fix this critical bug in production',
  priority: 'urgent'
}, context);

// Low priority background task
const backgroundJob = await submitJob.execute({
  modelName: 'llama2',
  jobType: 'generate',
  prompt: 'Generate documentation for this module',
  priority: 'low'
}, context);
```

### Job Monitoring

```typescript
async function monitorJob(jobId: string, timeoutMs: number = 60000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    const statusResult = await getJobStatus.execute({ jobId });
    const status = JSON.parse(statusResult);
    
    console.log(`Job ${jobId}: ${status.status}`);
    
    if (status.status === 'completed') {
      const result = await getJobResult.execute({ jobId });
      return JSON.parse(result);
    }
    
    if (status.status === 'failed') {
      throw new Error(`Job failed: ${status.error?.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  throw new Error(`Job ${jobId} timed out after ${timeoutMs}ms`);
}
```

## Cache Management

### Understanding the Cache

The queue system includes an intelligent caching layer that:

- Stores prompt/response pairs to avoid redundant API calls
- Uses semantic similarity to find related cached responses
- Tracks performance metrics for model routing optimization
- Supports user feedback for continuous improvement

### Cache Operations

```typescript
import { manageCache } from '@promethean/opencode-client';

// Get cache statistics
const stats = await manageCache.execute({ action: 'stats' });
console.log('Cache stats:', JSON.parse(stats));

// Clear cache (useful for testing or when models change)
const clearResult = await manageCache.execute({ action: 'clear' });

// Performance analysis
const analysis = await manageCache.execute({ action: 'performance-analysis' });
console.log('Performance analysis:', JSON.parse(analysis));
```

### Submitting Feedback

```typescript
import { submitFeedback } from '@promethean/opencode-client';

// After getting a job result, submit feedback
await submitFeedback.execute({
  prompt: 'Explain TypeScript generics',
  modelName: 'llama2',
  jobType: 'generate',
  score: 0.8,  // -1 (terrible) to 1 (excellent)
  reason: 'Clear explanation with good examples',
  taskCategory: 'documentation'
});
```

## Queue Management

### Manual Queue Control

```typescript
import { startQueueProcessor, stopQueueProcessor, getQueueInfo } from '@promethean/opencode-client';

// Check if processor is running
const queueInfo = await getQueueInfo.execute({});
const info = JSON.parse(queueInfo);
console.log('Processor active:', info.processorActive);

// Manual control (usually not needed as it auto-starts)
if (!info.processorActive) {
  startQueueProcessor();
}

// Stop processor (cleanup on shutdown)
process.on('SIGINT', () => {
  stopQueueProcessor();
  process.exit(0);
});
```

### Queue Monitoring

```typescript
async function monitorQueue() {
  const info = await getQueueInfo.execute({});
  const queueData = JSON.parse(info);
  
  console.log('Queue Status:');
  console.log(`  Pending: ${queueData.pending}`);
  console.log(`  Running: ${queueData.running}`);
  console.log(`  Completed: ${queueData.completed}`);
  console.log(`  Failed: ${queueData.failed}`);
  console.log(`  Max Concurrent: ${queueData.maxConcurrent}`);
  console.log(`  Cache Size: ${queueData.cacheSize}`);
  
  if (queueData.pending > 10) {
    console.warn('High queue backlog detected!');
  }
}

// Monitor every 30 seconds
setInterval(monitorQueue, 30000);
```

## Error Handling

### Common Error Scenarios

```typescript
async function robustJobSubmission(prompt: string) {
  try {
    const job = await submitJob.execute({
      modelName: 'llama2',
      jobType: 'generate',
      prompt
    }, context);
    
    return JSON.parse(job);
  } catch (error) {
    if (error.message.includes('model')) {
      console.error('Model not available, trying fallback...');
      return await submitJob.execute({
        modelName: 'llama2-7b',  // Fallback model
        jobType: 'generate',
        prompt
      }, context);
    }
    throw error;
  }
}
```

### Job Failure Handling

```typescript
async function handleJobFailure(jobId: string) {
  const status = await getJobStatus.execute({ jobId });
  const jobInfo = JSON.parse(status);
  
  if (jobInfo.status === 'failed') {
    console.error('Job failed:', jobInfo.error?.message);
    
    // Retry logic for transient failures
    if (jobInfo.error?.message?.includes('timeout')) {
      console.log('Retrying job due to timeout...');
      // Resubmit with different options
      return await submitJob.execute({
        modelName: 'llama2',
        jobType: 'generate',
        prompt: 'original prompt here',
        options: { num_predict: 200 }  // Reduce complexity
      }, context);
    }
  }
}
```

## Best Practices

### 1. Job Naming

Always provide meaningful job names for better tracking:

```typescript
const job = await submitJob.execute({
  jobName: 'generate-typescript-validator',
  modelName: 'codellama',
  jobType: 'generate',
  prompt: 'Create a TypeScript validator function...'
}, context);
```

### 2. Priority Management

Use priorities appropriately:

```typescript
// Critical system tasks
await submitJob.execute({
  priority: 'urgent',
  // ... other params
}, context);

// User-interactive tasks
await submitJob.execute({
  priority: 'high',
  // ... other params
}, context);

// Background processing
await submitJob.execute({
  priority: 'low',
  // ... other params
}, context);
```

### 3. Resource Management

Monitor and manage queue resources:

```typescript
// Check queue health before submitting
const queueInfo = await getQueueInfo.execute({});
const info = JSON.parse(queueInfo);

if (info.pending > 50) {
  console.warn('Queue is congested, consider delaying non-urgent jobs');
}
```

### 4. Error Recovery

Implement robust error handling:

```typescript
async function submitWithRetry(params: any, maxRetries: number = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await submitJob.execute(params, context);
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      console.log(`Attempt ${attempt} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}
```

## Performance Optimization

### 1. Cache Utilization

The cache automatically improves performance, but you can optimize further:

```typescript
// Use consistent prompts for better cache hits
const standardizedPrompt = `Explain ${concept} in TypeScript programming`;

// Submit feedback to improve routing
await submitFeedback.execute({
  prompt: standardizedPrompt,
  modelName: 'llama2',
  jobType: 'generate',
  score: 0.9,
  taskCategory: 'educational-content'
});
```

### 2. Batch Processing

Group similar tasks to take advantage of caching:

```typescript
// Process related concepts together
const concepts = ['interfaces', 'types', 'generics', 'decorators'];
const jobs = concepts.map(concept => 
  submitJob.execute({
    modelName: 'llama2',
    jobType: 'generate',
    prompt: `Explain ${concept} in TypeScript with examples`
  }, context)
);
```

### 3. Model Selection

Choose appropriate models for different tasks:

```typescript
const modelForTask = {
  'code-generation': 'codellama',
  'general-chat': 'llama2',
  'embeddings': 'all-minilm',
  'analysis': 'mistral'
};

const modelName = modelForTask[taskType] || 'llama2';
```

## Troubleshooting

### Common Issues

1. **Jobs stuck in pending**: Check if queue processor is running
2. **High failure rate**: Verify Ollama service is accessible
3. **Memory usage**: Monitor cache size and clear if needed
4. **Type errors**: Ensure proper function usage as documented

### Debug Information

```typescript
// Enable debug logging
process.env.DEBUG = 'ollama-queue';

// Get detailed queue information
const debugInfo = await getQueueInfo.execute({});
console.log('Debug info:', JSON.parse(debugInfo, null, 2));
```

For more troubleshooting information, see the [Troubleshooting Guide](./troubleshooting.md).