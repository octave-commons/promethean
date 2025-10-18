# API Documentation

This document provides detailed information about the API abstraction layers used in the OpenCode CLI client.

## Table of Contents

- [Ollama API](#ollama-api)
- [Sessions API](#sessions-api)
- [Error Handling](#error-handling)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)

## Ollama API

The Ollama API provides access to LLM job management, model information, and queue operations.

### Interfaces

#### JobOptions

Options for listing and filtering jobs.

```typescript
interface JobOptions {
  status?: string; // Filter by job status (pending, running, completed, failed, canceled)
  limit?: number; // Maximum number of jobs to return (default: 50)
  agentOnly?: boolean; // Filter for agent-only jobs (default: true)
}
```

#### SubmitJobOptions

Options for submitting new jobs to the queue.

```typescript
interface SubmitJobOptions {
  modelName: string; // Name of the model to use (required)
  jobType: 'generate' | 'chat' | 'embedding'; // Type of job (required)
  priority: 'low' | 'medium' | 'high' | 'urgent'; // Job priority (required)
  jobName?: string; // Optional human-readable job name
  prompt?: string; // Prompt text for generate jobs
  messages?: Array<{ role: string; content: string }>; // Messages for chat jobs
  input?: string | string[]; // Input text for embedding jobs
  options?: {
    // Model-specific options
    temperature?: number; // Sampling temperature (0.0-1.0)
    top_p?: number; // Top-p sampling (0.0-1.0)
    num_ctx?: number; // Context window size
    num_predict?: number; // Maximum tokens to predict
    stop?: string[]; // Stop sequences
    format?: string | object; // Output format (e.g., "json")
  };
}
```

#### Job

Represents a job in the queue.

```typescript
interface Job {
  id: string; // Unique job identifier
  modelName: string; // Model used for the job
  jobType: string; // Type of job
  status: string; // Current status
  jobName?: string; // Human-readable name
  createdAt: string; // ISO timestamp of creation
  updatedAt?: string; // ISO timestamp of last update
}
```

### Functions

#### listJobs

List jobs with optional filtering.

```typescript
async function listJobs(options: JobOptions): Promise<Job[]>;
```

**Parameters:**

- `options`: Filtering and pagination options

**Returns:** Array of job objects

**Example:**

```typescript
const jobs = await listJobs({
  status: 'pending',
  limit: 10,
  agentOnly: true,
});
```

#### submitJob

Submit a new job to the queue.

```typescript
async function submitJob(options: SubmitJobOptions): Promise<Job>;
```

**Parameters:**

- `options`: Job submission options

**Returns:** Created job object with ID

**Example:**

```typescript
const job = await submitJob({
  modelName: 'llama2',
  jobType: 'generate',
  priority: 'high',
  prompt: 'Explain quantum computing',
  options: {
    temperature: 0.7,
    num_predict: 500,
  },
});
```

#### getJobStatus

Get the current status of a specific job.

```typescript
async function getJobStatus(jobId: string): Promise<Job>;
```

**Parameters:**

- `jobId`: Unique job identifier

**Returns:** Current job object

**Example:**

```typescript
const status = await getJobStatus('job_123456');
console.log(`Job status: ${status.status}`);
```

#### getJobResult

Retrieve the result of a completed job.

```typescript
async function getJobResult(jobId: string): Promise<any>;
```

**Parameters:**

- `jobId`: Unique job identifier

**Returns:** Job result data (varies by job type)

**Example:**

```typescript
const result = await getJobResult('job_123456');
console.log('Generated text:', result.response);
```

#### cancelJob

Cancel a pending or running job.

```typescript
async function cancelJob(jobId: string): Promise<void>;
```

**Parameters:**

- `jobId`: Unique job identifier

**Example:**

```typescript
await cancelJob('job_123456');
console.log('Job cancelled');
```

#### listModels

List available Ollama models.

```typescript
async function listModels(detailed = false): Promise<any[]>;
```

**Parameters:**

- `detailed`: Whether to include detailed model information

**Returns:** Array of model objects

**Example:**

```typescript
const models = await listModels(true);
models.forEach((model) => {
  console.log(`${model.name}: ${model.description}`);
});
```

#### getQueueInfo

Get information about the queue status and performance.

```typescript
async function getQueueInfo(): Promise<any>;
```

**Returns:** Queue statistics and status

**Example:**

```typescript
const info = await getQueueInfo();
console.log(`Queue length: ${info.pendingJobs}`);
console.log(`Average wait time: ${info.averageWaitTime}ms`);
```

#### manageCache

Manage the prompt cache for performance optimization.

```typescript
async function manageCache(action: string): Promise<any>;
```

**Parameters:**

- `action`: Cache action ('stats', 'clear', 'clear-expired', 'performance-analysis')

**Returns:** Cache operation results

**Example:**

```typescript
const stats = await manageCache('stats');
console.log(`Cache hit rate: ${stats.hitRate}%`);
```

## Sessions API

The Sessions API provides access to OpenCode session management and search capabilities.

### Interfaces

#### Session

Represents an OpenCode session.

```typescript
interface Session {
  id: string; // Unique session identifier
  title?: string; // Session title
  messageCount?: number; // Number of messages in session
  lastActivityTime?: string; // ISO timestamp of last activity
  activityStatus?: 'active' | 'waiting_for_input' | 'completed' | 'error';
  isAgentTask?: boolean; // Whether session is an agent task
  agentTaskStatus?: string; // Agent task status if applicable
  createdAt?: string; // ISO timestamp of creation
}
```

#### CreateSessionOptions

Options for creating a new session.

```typescript
interface CreateSessionOptions {
  title?: string; // Session title
  files?: string[]; // Files to include in session
  delegates?: string[]; // Agent delegates for the session
}
```

#### ListSessionsOptions

Options for listing sessions.

```typescript
interface ListSessionsOptions {
  limit?: number; // Maximum number of sessions to return (default: 20)
  offset?: number; // Number of sessions to skip (default: 0)
}
```

#### SearchSessionsOptions

Options for searching sessions.

```typescript
interface SearchSessionsOptions {
  query: string; // Search query
  k?: number; // Maximum number of results (default: 5)
}
```

### Functions

#### listSessions

List all active sessions with pagination.

```typescript
async function listSessions(options: ListSessionsOptions = {}): Promise<Session[]>;
```

**Parameters:**

- `options`: Pagination options

**Returns:** Array of session objects

**Example:**

```typescript
const sessions = await listSessions({
  limit: 10,
  offset: 0,
});

sessions.forEach((session) => {
  console.log(`${session.title}: ${session.messageCount} messages`);
});
```

#### getSession

Get details of a specific session.

```typescript
async function getSession(sessionId: string): Promise<Session>;
```

**Parameters:**

- `sessionId`: Unique session identifier

**Returns:** Session object with full details

**Example:**

```typescript
const session = await getSession('sess_123456');
console.log(`Session: ${session.title}`);
console.log(`Status: ${session.activityStatus}`);
```

#### createSession

Create a new session.

```typescript
async function createSession(options: CreateSessionOptions = {}): Promise<Session>;
```

**Parameters:**

- `options`: Session creation options

**Returns:** Created session object

**Example:**

```typescript
const session = await createSession({
  title: 'Code Review Session',
  files: ['src/main.ts', 'src/utils.ts'],
  delegates: ['reviewer', 'security-analyzer'],
});

console.log(`Created session: ${session.id}`);
```

#### closeSession

Close an active session.

```typescript
async function closeSession(sessionId: string): Promise<void>;
```

**Parameters:**

- `sessionId`: Unique session identifier

**Example:**

```typescript
await closeSession('sess_123456');
console.log('Session closed');
```

#### searchSessions

Search past sessions using semantic embeddings.

```typescript
async function searchSessions(options: SearchSessionsOptions): Promise<Session[]>;
```

**Parameters:**

- `options`: Search options

**Returns:** Array of matching sessions

**Example:**

```typescript
const results = await searchSessions({
  query: 'bug fix authentication',
  k: 5,
});

results.forEach((session) => {
  console.log(`Found: ${session.title} (${session.id})`);
});
```

## Error Handling

All API functions throw errors for various failure conditions. Common error types include:

### Network Errors

```typescript
try {
  const jobs = await listJobs();
} catch (error) {
  if (error.name === 'NetworkError') {
    console.error('Network connection failed');
  } else if (error.name === 'TimeoutError') {
    console.error('Request timed out');
  }
}
```

### Authentication Errors

```typescript
try {
  const result = await getJobResult('job_123');
} catch (error) {
  if (error.status === 401) {
    console.error('Authentication required');
  } else if (error.status === 403) {
    console.error('Insufficient permissions');
  }
}
```

### Validation Errors

```typescript
try {
  await submitJob({
    modelName: '', // Invalid empty model name
    jobType: 'generate',
    priority: 'medium',
  });
} catch (error) {
  if (error.name === 'ValidationError') {
    console.error('Validation failed:', error.message);
  }
}
```

## Authentication

The API supports multiple authentication methods:

### Bearer Token Authentication

```typescript
// Set via environment variable
process.env.OPENCODE_AUTH_TOKEN = 'your-bearer-token';

// Or in configuration file
const config = {
  auth: {
    type: 'bearer',
    token: 'your-bearer-token',
  },
};
```

### API Key Authentication

```typescript
const config = {
  auth: {
    type: 'apikey',
    key: 'your-api-key',
    header: 'X-API-Key',
  },
};
```

### Custom Authentication

```typescript
const config = {
  auth: {
    type: 'custom',
    handler: async (request) => {
      // Custom authentication logic
      request.headers.set('Authorization', 'Custom scheme');
    },
  },
};
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

### Rate Limit Headers

```typescript
const response = await apiCall();
console.log('Rate limit remaining:', response.headers.get('X-RateLimit-Remaining'));
console.log('Rate limit reset:', response.headers.get('X-RateLimit-Reset'));
```

### Automatic Retry

The client automatically retries failed requests with exponential backoff:

```typescript
const config = {
  retries: 3,
  retryDelay: 1000, // Initial delay in milliseconds
  retryBackoff: 2, // Backoff multiplier
};
```

### Manual Rate Limit Handling

```typescript
try {
  const result = await apiCall();
} catch (error) {
  if (error.status === 429) {
    const retryAfter = error.headers.get('Retry-After');
    console.log(`Rate limited. Retry after ${retryAfter} seconds`);
  }
}
```

## Configuration

### Environment Variables

```bash
OPENCODE_SERVER_URL=http://localhost:3000
OPENCODE_AUTH_TOKEN=your-token
OPENCODE_TIMEOUT=30000
OPENCODE_RETRIES=3
```

### Configuration File

```json
{
  "server": {
    "url": "http://localhost:3000",
    "timeout": 30000,
    "retries": 3
  },
  "auth": {
    "type": "bearer",
    "token": "your-token"
  },
  "rateLimit": {
    "enabled": true,
    "maxRetries": 3,
    "initialDelay": 1000,
    "backoffMultiplier": 2
  }
}
```

## Best Practices

1. **Error Handling**: Always wrap API calls in try-catch blocks
2. **Timeouts**: Set appropriate timeouts for long-running operations
3. **Pagination**: Use pagination for large result sets
4. **Caching**: Leverage the cache system for repeated requests
5. **Authentication**: Store tokens securely and refresh when needed
6. **Rate Limiting**: Respect rate limits and implement backoff strategies

## Migration from Mock to Production

To replace mock implementations with production API calls:

1. **Update base URL**: Configure the production server endpoint
2. **Add authentication**: Implement proper authentication headers
3. **Handle errors**: Add comprehensive error handling
4. **Add logging**: Implement request/response logging
5. **Test thoroughly**: Test all API endpoints with various scenarios

Example migration:

```typescript
// Before (mock)
export async function listJobs(options: JobOptions): Promise<Job[]> {
  console.log('Mock: Listing jobs with options:', options);
  return [];
}

// After (production)
export async function listJobs(options: JobOptions): Promise<Job[]> {
  const params = new URLSearchParams();
  if (options.status) params.append('status', options.status);
  if (options.limit) params.append('limit', options.limit.toString());
  if (options.agentOnly !== undefined) params.append('agentOnly', options.agentOnly.toString());

  const response = await fetch(`${getServerUrl()}/api/ollama-queue/listJobs?${params}`, {
    headers: getAuthHeaders(),
    signal: AbortSignal.timeout(getTimeout()),
  });

  if (!response.ok) {
    throw new APIError(`Failed to list jobs: ${response.statusText}`, response.status);
  }

  return response.json();
}
```
