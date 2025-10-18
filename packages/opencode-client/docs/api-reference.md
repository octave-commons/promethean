# API Reference - OpenCode Client Ollama Integration

## Overview

This document provides comprehensive API documentation for the Ollama queue integration functions and tools available in the `@promethean/opencode-client` package.

## Core Queue Management Functions

### `startQueueProcessor()`

Starts the background queue processor if it's not already running.

```typescript
function startQueueProcessor(): void
```

**Behavior:**
- Checks if a processing interval is already active using `getProcessingInterval()`
- If not active, creates a new interval that calls `processQueue()` every 1000ms
- Sets the interval using `setProcessingInterval()`
- Immediately processes any pending jobs

**Usage Example:**
```typescript
import { startQueueProcessor } from '@promethean/opencode-client';

// Start the queue processor
startQueueProcessor();
```

### `stopQueueProcessor()`

Stops the background queue processor safely.

```typescript
function stopQueueProcessor(): void
```

**Behavior:**
- Calls `clearProcessingInterval()` to properly clean up the interval
- Sets the internal interval state to `null`
- Prevents further automatic queue processing

**Usage Example:**
```typescript
import { stopQueueProcessor } from '@promethean/opencode-client';

// Stop the queue processor
stopQueueProcessor();
```

## Ollama Tools

### `submitJob`

Submits a new LLM job to the queue for processing.

```typescript
export const submitJob: any = tool({
  description: 'Submit a new LLM job to the queue',
  args: {
    jobName?: string,                    // Optional name for the job
    modelName: string,                   // Ollama model name to use
    jobType: 'generate' | 'chat' | 'embedding', // Type of job
    prompt?: string,                     // Prompt for generate jobs
    messages?: Array<{                   // Messages for chat jobs
      role: 'system' | 'user' | 'assistant';
      content: string;
    }>,
    input?: string | string[],           // Input for embedding jobs
    priority?: 'low' | 'medium' | 'high' | 'urgent', // Job priority
    options?: {                          // Ollama generation options
      temperature?: number;
      top_p?: number;
      num_ctx?: number;
      num_predict?: number;
      stop?: string[];
      format?: 'json' | object;
    }
  },
  async execute(args, context): Promise<string>
});
```

**Parameters:**
- `jobName` (optional): Human-readable name for the job
- `modelName` (required): Name of the Ollama model to use
- `jobType` (required): Type of job to execute
- `prompt` (required for generate): Text prompt for generation
- `messages` (required for chat): Array of chat messages
- `input` (required for embedding): Text or array of texts to embed
- `priority` (optional, default: 'medium'): Job execution priority
- `options` (optional): Ollama model configuration options

**Returns:**
JSON string containing:
```typescript
{
  jobId: string,           // Unique job identifier
  jobName?: string,        // Job name if provided
  status: 'pending',       // Initial job status
  queuePosition: number    // Position in pending queue
}
```

**Example Usage:**
```typescript
// Generate job
const result = await submitJob.execute({
  modelName: 'llama2',
  jobType: 'generate',
  prompt: 'Explain TypeScript compilation',
  priority: 'high'
}, { agent: 'agent-123', sessionID: 'session-456' });

// Chat job
const chatResult = await submitJob.execute({
  modelName: 'llama2',
  jobType: 'chat',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is TypeScript?' }
  ]
}, { agent: 'agent-123', sessionID: 'session-456' });
```

### `getJobStatus`

Retrieves the current status of a specific job.

```typescript
export const getJobStatus: any = tool({
  description: 'Get status of a specific job',
  args: {
    jobId: string    // Job ID to check
  },
  async execute({ jobId }): Promise<string>
});
```

**Returns:**
JSON string containing:
```typescript
{
  id: string,
  name?: string,
  status: 'pending' | 'running' | 'completed' | 'failed' | 'canceled',
  priority: 'low' | 'medium' | 'high' | 'urgent',
  createdAt: number,
  updatedAt: number,
  startedAt?: number,
  completedAt?: number,
  error?: { message: string; code?: string }
}
```

### `getJobResult`

Retrieves the result of a completed job.

```typescript
export const getJobResult: any = tool({
  description: 'Get result of a completed job',
  args: {
    jobId: string    // Job ID to get result from
  },
  async execute({ jobId }): Promise<string>
});
```

**Returns:**
JSON string containing:
```typescript
{
  id: string,
  name?: string,
  status: 'completed',
  result: unknown,      // Job execution result
  completedAt: number
}
```

**Throws:**
- `Error` if job not found
- `Error` if job is not completed

### `listJobs`

Lists jobs with optional filtering capabilities.

```typescript
export const listJobs: any = tool({
  description: 'List jobs with optional filtering',
  args: {
    status?: 'pending' | 'running' | 'completed' | 'failed' | 'canceled',
    limit?: number,        // Default: 50
    agentOnly?: boolean    // Default: true
  },
  async execute(args, context): Promise<string>
});
```

**Returns:**
JSON string containing array of job summaries:
```typescript
[{
  id: string,
  name?: string,
  status: JobStatus,
  priority: JobPriority,
  modelName: string,
  createdAt: number,
  updatedAt: number,
  startedAt?: number,
  completedAt?: number,
  hasError: boolean,
  hasResult: boolean
}]
```

### `cancelJob`

Cancels a pending job.

```typescript
export const cancelJob: any = tool({
  description: 'Cancel a pending job',
  args: {
    jobId: string    // Job ID to cancel
  },
  async execute({ jobId }, context): Promise<string>
});
```

**Returns:**
JSON string containing:
```typescript
{
  id: string,
  status: 'canceled',
  message: string
}
```

**Throws:**
- `Error` if job not found
- `Error` if job belongs to another agent
- `Error` if job is not in pending status

### `listModels`

Lists available Ollama models.

```typescript
export const listModels: any = tool({
  description: 'List available Ollama models',
  args: {
    detailed?: boolean   // Default: false
  },
  async execute({ detailed }): Promise<string>
});
```

**Returns:**
JSON string containing:
```typescript
{
  models: string[] | OllamaModel[],  // Model names or detailed objects
  count: number                      // Total number of models
}
```

### `getQueueInfo`

Retrieves queue statistics and information.

```typescript
export const getQueueInfo = tool({
  description: 'Get queue statistics and information',
  args: {},
  async execute(): Promise<string>
});
```

**Returns:**
JSON string containing:
```typescript
{
  pending: number,           // Pending jobs count
  running: number,           // Currently running jobs
  completed: number,         // Completed jobs count
  failed: number,            // Failed jobs count
  canceled: number,          // Canceled jobs count
  total: number,             // Total jobs in queue
  maxConcurrent: number,     // Maximum concurrent jobs
  processorActive: boolean,  // Whether processor is running
  cacheSize: number          // Total cache entries
}
```

### `manageCache`

Manages the prompt cache with various operations.

```typescript
export const manageCache: any = tool({
  description: 'Manage prompt cache (clear, get stats, etc.)',
  args: {
    action: 'stats' | 'clear' | 'clear-expired' | 'performance-analysis'
  },
  async execute({ action }): Promise<string>
});
```

**Actions:**

- **`stats`**: Returns cache statistics
- **`clear`**: Clears all cache entries
- **`clear-expired`**: Clears expired entries (not implemented for in-memory cache)
- **`performance-analysis`**: Analyzes performance across cached entries

**Example:**
```typescript
// Get cache statistics
const stats = await manageCache.execute({ action: 'stats' });

// Clear cache
const clearResult = await manageCache.execute({ action: 'clear' });
```

### `submitFeedback`

Submits feedback on a cached result to improve model routing.

```typescript
export const submitFeedback: any = tool({
  description: 'Submit feedback on a cached result to improve model routing',
  args: {
    prompt: string,           // Original prompt
    modelName: string,        // Model that generated result
    jobType: 'generate' | 'chat', // Job type
    score: number,            // Feedback score (-1 to 1)
    reason?: string,          // Reason for feedback
    taskCategory?: string     // Task category for routing
  },
  async execute({ prompt, modelName, jobType, score, reason, taskCategory }): Promise<string>
});
```

**Returns:**
JSON string containing:
```typescript
{
  message: string,
  score: number,
  modelName: string,
  jobType: string,
  taskCategory?: string
}
```

## Type Definitions

### JobStatus
```typescript
type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'canceled';
```

### JobPriority
```typescript
type JobPriority = 'low' | 'medium' | 'high' | 'urgent';
```

### JobType
```typescript
type JobType = 'generate' | 'chat' | 'embedding';
```

### OllamaOptions
```typescript
type OllamaOptions = Readonly<{
  temperature?: number;
  top_p?: number;
  num_ctx?: number;
  num_predict?: number;
  stop?: readonly string[];
  format?: 'json' | object;
}>;
```

## Error Handling

All tools throw `Error` objects with descriptive messages for:

- Invalid input parameters
- Job not found
- Permission issues (agent ownership)
- Invalid job state transitions
- Ollama API communication failures
- Cache operation failures

## Context Requirements

All tools require a context object with:
```typescript
{
  agent: string,      // Agent identifier
  sessionID: string   // Session identifier
}
```

This context is used for:
- Job ownership validation
- Agent-specific job filtering
- Session-based job tracking