# @promethean-os/ollama-queue

Ollama LLM job queue system for async background processing.

## Features

- **Job Queue Management**: Submit, track, and manage async LLM jobs
- **Multiple Job Types**: Support for generate, chat, and embedding jobs
- **Priority System**: Configure job priority (low, medium, high, urgent)
- **Concurrent Processing**: Configurable concurrent job limits
- **Error Handling**: Robust error handling and job status tracking
- **Model Management**: List and query available Ollama models

## Installation

```bash
pnpm add @promethean-os/ollama-queue
```

## Usage

```typescript
import {
  submitJob,
  getJobStatus,
  getJobResult,
  listJobs,
  cancelJob,
  listModels,
  getQueueInfo,
  JobType,
  JobPriority,
} from '@promethean-os/ollama-queue';

// Submit a generation job
const job = submitJob({
  jobName: 'Generate story',
  modelName: 'llama2',
  jobType: JobType.GENERATE,
  prompt: 'Write a short story about AI',
  priority: JobPriority.MEDIUM,
  agentId: 'agent-123',
  sessionId: 'session-456',
});

// Check job status
const status = getJobStatus(job.jobId);

// Get job result (when completed)
const result = getJobResult(job.jobId);

// List jobs
const jobs = listJobs({
  status: 'completed',
  limit: 10,
  agentId: 'agent-123',
});

// Cancel a job
cancelJob(job.jobId, 'agent-123');

// List available models
const models = await listModels(true);

// Get queue statistics
const queueInfo = getQueueInfo();
```

## Environment Variables

- `OLLAMA_URL`: Ollama server URL (default: `http://localhost:11434`)

## Types

### JobType

- `generate`: Text generation jobs
- `chat`: Conversational chat jobs
- `embedding`: Text embedding jobs

### JobPriority

- `low`: Low priority
- `medium`: Medium priority (default)
- `high`: High priority
- `urgent`: Urgent priority

### JobStatus

- `pending`: Waiting in queue
- `running`: Currently processing
- `completed`: Finished successfully
- `failed`: Failed with error
- `canceled`: Canceled by user

## License

GPL-3.0-only
