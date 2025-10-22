/**
 * Job Queue Types for Agent OS
 * 
 * Defines job submission, tracking, and management structures.
 */

import { z } from 'zod';

import type { AgentIdentifier } from './agent.js';
import type { MessagePriority } from './agent.js';

/**
 * Job Definition - what a job should do
 */
export type JobDefinition = {
  id?: string;
  type: string;
  targetAgent: AgentIdentifier;
  payload: unknown;
  timeout?: number; // milliseconds
  retryPolicy?: RetryPolicy;
  dependencies?: string[]; // job IDs
}

export const JobDefinitionSchema = z.object({
  id: z.string().optional(),
  type: z.string(),
  targetAgent: z.any(), // AgentIdentifier - circular reference
  payload: z.unknown(),
  timeout: z.number().optional(),
  retryPolicy: RetryPolicySchema.optional(),
  dependencies: z.array(z.string()).optional(),
});

/**
 * Job Options - how a job should be executed
 */
export type JobOptions = {
  priority?: MessagePriority;
  deliverAt?: string; // ISO8601
  maxRetries?: number;
  callback?: JobCallback;
}

export const JobOptionsSchema = z.object({
  priority: z.enum(['critical', 'high', 'normal', 'low', 'background']).optional(),
  deliverAt: z.string().datetime().optional(),
  maxRetries: z.number().optional(),
  callback: JobCallbackSchema.optional(),
});

/**
 * Retry Policy - how to handle job failures
 */
export type RetryPolicy = {
  maxAttempts: number;
  backoffStrategy: 'fixed' | 'exponential' | 'linear';
  baseDelay: number; // milliseconds
  maxDelay?: number; // milliseconds
}

export const RetryPolicySchema = z.object({
  maxAttempts: z.number(),
  backoffStrategy: z.enum(['fixed', 'exponential', 'linear']),
  baseDelay: z.number(),
  maxDelay: z.number().optional(),
});

/**
 * Job Callback - how to notify about job completion
 */
export type JobCallback = {
  type: 'webhook' | 'poll' | 'event';
  endpoint?: string;
  event?: string;
}

export const JobCallbackSchema = z.object({
  type: z.enum(['webhook', 'poll', 'event']),
  endpoint: z.string().optional(),
  event: z.string().optional(),
});

/**
 * Job Status - current state of a job
 */
export enum JobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout',
}

export const JobStatusSchema = z.nativeEnum(JobStatus);

/**
 * Job Status Information - detailed job state
 */
export type JobStatusInfo = {
  id: string;
  status: JobStatus;
  progress?: number; // 0-100
  result?: unknown;
  error?: JobError;
  createdAt: string; // ISO8601
  startedAt?: string; // ISO8601
  completedAt?: string; // ISO8601
  attempts: number;
}

export const JobStatusInfoSchema = z.object({
  id: z.string(),
  status: JobStatusSchema,
  progress: z.number().min(0).max(100).optional(),
  result: z.unknown().optional(),
  error: JobErrorSchema.optional(),
  createdAt: z.string().datetime(),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  attempts: z.number(),
});

/**
 * Job Error - detailed error information
 */
export type JobError = {
  code: string;
  message: string;
  details?: unknown;
  retryable: boolean;
}

export const JobErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
  retryable: z.boolean(),
});

/**
 * Job Filter - for querying jobs
 */
export type JobFilter = {
  status?: JobStatus[];
  agentId?: string;
  type?: string;
  createdAfter?: string; // ISO8601
  createdBefore?: string; // ISO8601
  limit?: number;
  offset?: number;
}

export const JobFilterSchema = z.object({
  status: z.array(JobStatusSchema).optional(),
  agentId: z.string().optional(),
  type: z.string().optional(),
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

/**
 * Job Result - output of a completed job
 */
export type JobResult = {
  success: boolean;
  result?: unknown;
  error?: JobError;
  metadata?: Record<string, unknown>;
  duration?: number; // milliseconds
}

export const JobResultSchema = z.object({
  success: z.boolean(),
  result: z.unknown().optional(),
  error: JobErrorSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
  duration: z.number().optional(),
});

/**
 * Job Processor - interface for job processing
 */
export type JobProcessor = {
  process(job: JobDefinition): Promise<JobResult>;
  canProcess(jobType: string): boolean;
  getCapabilities(): ProcessorCapability[];
}

export type ProcessorCapability = {
  jobType: string;
  maxConcurrency: number;
  timeout: number;
  resources: ResourceRequirement[];
}

export type ResourceRequirement = {
  type: 'cpu' | 'memory' | 'disk' | 'network' | 'gpu';
  amount: number;
  unit: string;
}

/**
 * Helper functions
 */
export function createJobDefinition(
  type: string,
  targetAgent: AgentIdentifier,
  payload: unknown,
  options?: Partial<JobDefinition>
): JobDefinition {
  return {
    type,
    targetAgent,
    payload,
    ...options,
  };
}

export function createRetryPolicy(
  maxAttempts: number,
  backoffStrategy: RetryPolicy['backoffStrategy'],
  baseDelay: number,
  maxDelay?: number
): RetryPolicy {
  return {
    maxAttempts,
    backoffStrategy,
    baseDelay,
    maxDelay,
  };
}

export function createJobCallback(
  type: JobCallback['type'],
  endpoint?: string,
  event?: string
): JobCallback {
  return { type, endpoint, event };
}

export function createJobError(
  code: string,
  message: string,
  retryable: boolean,
  details?: unknown
): JobError {
  return { code, message, details, retryable };
}

export function createJobResult(
  success: boolean,
  result?: unknown,
  error?: JobError,
  metadata?: Record<string, unknown>
): JobResult {
  return { success, result, error, metadata };
}