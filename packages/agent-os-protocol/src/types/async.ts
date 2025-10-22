/**
 * Async Operation Types for Agent OS
 * 
 * Defines async context, operations, and management structures.
 */

import { z } from 'zod';
import type { MessagePriority } from './agent.js';

/**
 * Async Operation - represents an asynchronous operation
 */
export interface AsyncOperation {
  id?: string;
  type: string;
  timeout?: number;
  checkpoint?: boolean;
  cleanup?: CleanupPolicy;
}

export const AsyncOperationSchema = z.object({
  id: z.string().optional(),
  type: z.string(),
  timeout: z.number().optional(),
  checkpoint: z.boolean().optional(),
  cleanup: CleanupPolicySchema.optional(),
});

/**
 * Async Options - options for async operations
 */
export interface AsyncOptions {
  priority?: MessagePriority;
  callbacks?: AsyncCallbacks;
  persistence?: PersistenceOptions;
}

export const AsyncOptionsSchema = z.object({
  priority: z.enum(['critical', 'high', 'normal', 'low', 'background']).optional(),
  callbacks: AsyncCallbacksSchema.optional(),
  persistence: PersistenceOptionsSchema.optional(),
});

/**
 * Async Callbacks - callbacks for async operation events
 */
export interface AsyncCallbacks {
  onProgress?: string; // event name
  onComplete?: string; // event name
  onError?: string; // event name
  onTimeout?: string; // event name
}

export const AsyncCallbacksSchema = z.object({
  onProgress: z.string().optional(),
  onComplete: z.string().optional(),
  onError: z.string().optional(),
  onTimeout: z.string().optional(),
});

/**
 * Cleanup Policy - how to clean up async operations
 */
export interface CleanupPolicy {
  type: 'immediate' | 'delayed' | 'manual';
  delay?: number; // milliseconds
  retainResults?: boolean;
  maxRetentionTime?: number; // milliseconds
}

export const CleanupPolicySchema = z.object({
  type: z.enum(['immediate', 'delayed', 'manual']),
  delay: z.number().optional(),
  retainResults: z.boolean().optional(),
  maxRetentionTime: z.number().optional(),
});

/**
 * Persistence Options - how to persist async operations
 */
export interface PersistenceOptions {
  enabled: boolean;
  storage?: 'memory' | 'redis' | 'database';
  ttl?: number; // seconds
  compression?: boolean;
  encryption?: boolean;
}

export const PersistenceOptionsSchema = z.object({
  enabled: z.boolean(),
  storage: z.enum(['memory', 'redis', 'database']).optional(),
  ttl: z.number().optional(),
  compression: z.boolean().optional(),
  encryption: z.boolean().optional(),
});

/**
 * Async Status - current state of async operation
 */
export enum AsyncStatus {
  CREATED = 'created',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout',
}

export const AsyncStatusSchema = z.nativeEnum(AsyncStatus);

/**
 * Async Context - context for async operations
 */
export interface AsyncContext {
  operationId: string;
  status: AsyncStatus;
  createdAt: string; // ISO8601
  startedAt?: string; // ISO8601
  completedAt?: string; // ISO8601
  timeoutAt?: string; // ISO8601
  progress?: number; // 0-100
  result?: unknown;
  error?: AsyncError;
  metadata?: Record<string, unknown>;
}

export const AsyncContextSchema = z.object({
  operationId: z.string(),
  status: AsyncStatusSchema,
  createdAt: z.string().datetime(),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  timeoutAt: z.string().datetime().optional(),
  progress: z.number().min(0).max(100).optional(),
  result: z.unknown().optional(),
  error: AsyncErrorSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Async Error - detailed error information for async operations
 */
export interface AsyncError {
  code: string;
  message: string;
  recoverable: boolean;
  details?: unknown;
  stack?: string;
}

export const AsyncErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  recoverable: z.boolean(),
  details: z.unknown().optional(),
  stack: z.string().optional(),
});

/**
 * Async Updates - updates that can be applied to async operations
 */
export interface AsyncUpdates {
  status?: AsyncStatus;
  progress?: number; // 0-100
  result?: unknown;
  error?: AsyncError;
  metadata?: Record<string, unknown>;
}

export const AsyncUpdatesSchema = z.object({
  status: AsyncStatusSchema.optional(),
  progress: z.number().min(0).max(100).optional(),
  result: z.unknown().optional(),
  error: AsyncErrorSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Async Operation Result - result of async operation
 */
export interface AsyncOperationResult {
  operationId: string;
  status: AsyncStatus;
  previousStatus: AsyncStatus;
  result?: unknown;
  error?: AsyncError;
  duration?: number; // milliseconds
}

export const AsyncOperationResultSchema = z.object({
  operationId: z.string(),
  status: AsyncStatusSchema,
  previousStatus: AsyncStatusSchema,
  result: z.unknown().optional(),
  error: AsyncErrorSchema.optional(),
  duration: z.number().optional(),
});

/**
 * Async Manager Interface
 */
export interface AsyncManager {
  create(operation: AsyncOperation, options?: AsyncOptions): Promise<string>;
  update(operationId: string, updates: AsyncUpdates): Promise<AsyncOperationResult>;
  get(operationId: string): Promise<AsyncContext | null>;
  list(filter?: AsyncFilter): Promise<AsyncContext[]>;
  cancel(operationId: string, reason?: string): Promise<boolean>;
  cleanup(operationId: string): Promise<boolean>;
  extendTimeout(operationId: string, additionalTime: number): Promise<boolean>;
}

/**
 * Async Filter - for querying async operations
 */
export interface AsyncFilter {
  status?: AsyncStatus[];
  type?: string;
  createdAfter?: string; // ISO8601
  createdBefore?: string; // ISO8601
  limit?: number;
  offset?: number;
}

export const AsyncFilterSchema = z.object({
  status: z.array(AsyncStatusSchema).optional(),
  type: z.string().optional(),
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

/**
 * Helper functions
 */
export function createAsyncOperation(
  type: string,
  options?: Partial<AsyncOperation>
): AsyncOperation {
  return {
    type,
    ...options,
  };
}

export function createAsyncOptions(
  priority?: MessagePriority,
  callbacks?: AsyncCallbacks,
  persistence?: PersistenceOptions
): AsyncOptions {
  return { priority, callbacks, persistence };
}

export function createAsyncCallbacks(
  onProgress?: string,
  onComplete?: string,
  onError?: string,
  onTimeout?: string
): AsyncCallbacks {
  return { onProgress, onComplete, onError, onTimeout };
}

export function createCleanupPolicy(
  type: CleanupPolicy['type'],
  delay?: number,
  retainResults?: boolean
): CleanupPolicy {
  return { type, delay, retainResults };
}

export function createPersistenceOptions(
  enabled: boolean,
  storage?: PersistenceOptions['storage'],
  ttl?: number
): PersistenceOptions {
  return { enabled, storage, ttl };
}

export function createAsyncError(
  code: string,
  message: string,
  recoverable: boolean,
  details?: unknown
): AsyncError {
  return { code, message, recoverable, details };
}

export function createAsyncUpdates(
  status?: AsyncStatus,
  progress?: number,
  result?: unknown,
  error?: AsyncError
): AsyncUpdates {
  return { status, progress, result, error };
}

export function createAsyncContext(
  operationId: string,
  status: AsyncStatus,
  options?: Partial<AsyncContext>
): AsyncContext {
  return {
    operationId,
    status,
    createdAt: new Date().toISOString(),
    ...options,
  };
}