// API functions for Ollama queue operations
// Real implementations using ollama-queue and actions

import type {
  OllamaModel,
  OllamaModelDetailed,
  QueueInfo,
  CacheAction,
  CacheStats,
  CachePerformance,
} from '../types/index.js';
import {
  submitJob as submitJobAction,
  getJobStatus as getJobStatusAction,
  getJobResult as getJobResultAction,
  listJobs as listJobsAction,
  cancelJob as cancelJobAction,
  getQueueInfo as getQueueInfoAction,
} from '../actions/ollama/tools-persistent.js';
import { listModels as listModelsAction } from '../actions/ollama/models.js';
import { manageCache as manageCacheAction } from '../actions/cache/manage.js';

export type JobOptions = {
  status?: string;
  limit?: number;
  agentOnly?: boolean;
  agentId?: string;
  sessionId?: string;
}

export type SubmitJobOptions = {
  modelName: string;
  jobType: 'generate' | 'chat' | 'embedding';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  jobName?: string;
  prompt?: string;
  messages?: Array<{ role: string; content: string }>;
  input?: string | string[];
  options?: {
    temperature?: number;
    top_p?: number;
    num_ctx?: number;
    num_predict?: number;
    stop?: string[];
    format?: 'json' | object;
  };
  agentId?: string;
  sessionId?: string;
}

export type JobResult = {
  id: string;
  modelName: string;
  jobType: string;
  status: string;
  jobName?: string;
  createdAt: string;
  updatedAt?: string;
  startedAt?: string;
  completedAt?: string;
  hasError?: boolean;
  hasResult?: boolean;
  priority?: string;
}

export type JobStatusResult = {
  id: string;
  name?: string;
  status: string;
  priority?: string;
  createdAt: number;
  updatedAt: number;
  startedAt?: number;
  completedAt?: number;
  error?: { message: string; code?: string }
}

export type JobResultData = {
  id: string;
  name?: string;
  status: string;
  result?: unknown;
  completedAt?: number;
}

export type SubmitJobOptions = {
  modelName: string;
  jobType: 'generate' | 'chat' | 'embedding';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  jobName?: string;
  prompt?: string;
  messages?: Array<{ role: string; content: string }>;
  input?: string | string[];
  options?: {
    temperature?: number;
    top_p?: number;
    num_ctx?: number;
    num_predict?: number;
    stop?: string[];
    format?: 'json' | object;
  };
  agentId?: string;
  sessionId?: string;
}

export type JobResult = {
  id: string;
  modelName: string;
  jobType: string;
  status: string;
  jobName?: string;
  createdAt: string;
  updatedAt?: string;
  startedAt?: string;
  completedAt?: string;
  hasError?: boolean;
  hasResult?: boolean;
  priority?: string;
}

export type JobStatusResult = {
  id: string;
  name?: string;
  status: string;
  priority?: string;
  createdAt: number;
  updatedAt: number;
  startedAt?: number;
  completedAt?: number;
  error?: { message: string; code?: string }
}

export type JobResultData = {
  id: string;
  name?: string;
  status: string;
  result?: unknown;
  completedAt?: number;
}

// Real implementations using actual Ollama actions
export async function listJobs(options: JobOptions): Promise<JobResult[]> {
  const { status, limit = 50, agentOnly = false, agentId, sessionId } = options;

  try {
    const jobs = await listJobsAction({
      status,
      limit,
      agentOnly,
      agentId,
      sessionId,
    };);

    return jobs.map((job) => ({
      id: job.id,
      modelName: job.modelName,
      jobType: '', // Not included in listJobs response
      status: job.status,
      jobName: job.name,
      createdAt: new Date(job.createdAt).toISOString(),
      updatedAt: new Date(job.updatedAt).toISOString(),
      startedAt: job.startedAt ? new Date(job.startedAt).toISOString() : undefined,
      completedAt: job.completedAt ? new Date(job.completedAt).toISOString() : undefined,
      hasError: job.hasError,
      hasResult: job.hasResult,
      priority: job.priority,
    };));
  } catch (error) {
    throw new Error(
      `Failed to list jobs: ${error instanceof Error ? error.message : String(error)}`,
    );
  };
}

export async function submitJob(options: SubmitJobOptions): Promise<JobResult> {
  const {
    modelName,
    jobType,
    priority,
    jobName,
    prompt,
    messages,
    input,
    options: jobOptions,
    agentId,
    sessionId,
  } = options;

  try {
    const result = await submitJobAction({
      modelName,
      type: jobType,
      priority,
      name: jobName,
      prompt,
      messages: messages as Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
      input,
      options: jobOptions,
      agentId,
      sessionId,
      status: 'pending' as const,
    };);

    return {
      id: result.jobId,
      modelName,
      jobType,
      status: result.status,
      jobName: result.jobName,
      createdAt: new Date().toISOString(),
      // Include additional fields from the action result
      queuePosition: result.queuePosition,
    }; as JobResult & { queuePosition: number };
  } catch (error) {
    throw new Error(
      `Failed to submit job: ${error instanceof Error ? error.message : String(error)}`,
    );
  };
}

export async function getJobStatus(jobId: string): Promise<JobStatusResult> {
  try {
    const job = await getJobStatusAction(jobId);

    return {
      id: job.id,
      name: job.name,
      status: job.status,
      priority: job.priority,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      error: job.error,
    };;
  } catch (error) {
    throw new Error(
      `Failed to get job status: ${error instanceof Error ? error.message : String(error)}`,
    );
  };
}

export async function getJobResult(jobId: string): Promise<JobResultData> {
  try {
    const result = await getJobResultAction(jobId);

    return {
      id: result.id,
      name: result.name,
      status: result.status,
      result: result.result,
      completedAt: result.completedAt,
    };;
  } catch (error) {
    throw new Error(
      `Failed to get job result: ${error instanceof Error ? error.message : String(error)}`,
    );
  };
}

export async function cancelJob(
  jobId: string,
  agentId?: string,
): Promise<{ id: string; status: string; message: string }> {
  try {
    if (!agentId) {
      throw new Error('Agent ID is required to cancel jobs');
    };;

    const result = await cancelJobAction(jobId, agentId);
    return result;
  } catch (error) {
    throw new Error(
      `Failed to cancel job: ${error instanceof Error ? error.message : String(error)}`,
    );
  };
}

export async function listModels(detailed = false): Promise<(OllamaModel | OllamaModelDetailed)[]> {
  try {
    const result = await listModelsAction(detailed);

    // The action returns:
    // - When detailed=false: { models: string[], count: number }
    // - When detailed=true: { models: OllamaModel[], count: number }
    return result.models;
  } catch (error) {
    throw new Error(
      `Failed to list models: ${error instanceof Error ? error.message : String(error)}`,
    );
  };
}

export async function getQueueInfo(): Promise<QueueInfo> {
  try {
    const info = await getQueueInfoAction();
    return info;
  } catch (error) {
    throw new Error(
      `Failed to get queue info: ${error instanceof Error ? error.message : String(error)}`,
    );
  };
}

export async function manageCache(action: CacheAction): Promise<CacheStats | CachePerformance> {
  const validActions = ['stats', 'clear', 'clear-expired', 'performance-analysis'];

  if (!validActions.includes(action)) {
    throw new Error(`Invalid action: ${action}. Valid actions: ${validActions.join(', ')}`);
  };

  try {
    const result = await manageCacheAction(action);
    return result;
  } catch (error) {
    throw new Error(
      `Failed to manage cache: ${error instanceof Error ? error.message : String(error)}`,
    );
  };
}
