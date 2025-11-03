// SPDX-License-Identifier: GPL-3.0-only
// Error Types - Core types for the Promethean error handling system

import { z } from 'zod';

/**
 * Base error context for correlation and tracking
 */
export interface ErrorContext {
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly userId?: string;
  readonly sessionId?: string;
  readonly traceId?: string;
  readonly service?: string;
  readonly module?: string;
  readonly function?: string;
  readonly timestamp?: string;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Error severity levels
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Error categories for classification
 */
export type ErrorCategory =
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'network'
  | 'database'
  | 'external'
  | 'business'
  | 'system'
  | 'configuration'
  | 'timeout'
  | 'rate-limit'
  | 'not-found'
  | 'conflict'
  | 'internal';

/**
 * Standardized error response structure
 */
export interface ErrorResponse {
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly category: ErrorCategory;
    readonly severity: ErrorSeverity;
    readonly context?: ErrorContext;
    readonly details?: unknown;
    readonly stack?: string;
    readonly timestamp: string;
    readonly requestId?: string;
  };
}

/**
 * Base Promethean error interface
 */
export interface PrometheanError extends Error {
  readonly code: string;
  readonly category: ErrorCategory;
  readonly severity: ErrorSeverity;
  readonly context?: ErrorContext;
  readonly details?: unknown;
  readonly timestamp: string;
  readonly requestId?: string;
  toJSON: () => ErrorResponse;
}

/**
 * Error creation options
 */
export interface ErrorOptions {
  readonly code?: string;
  readonly category?: ErrorCategory;
  readonly severity?: ErrorSeverity;
  readonly context?: ErrorContext;
  readonly details?: unknown;
  readonly cause?: Error;
}

// Zod schemas for validation
export const ErrorContextSchema = z.object({
  correlationId: z.string().optional(),
  requestId: z.string().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  traceId: z.string().optional(),
  service: z.string().optional(),
  module: z.string().optional(),
  function: z.string().optional(),
  timestamp: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    category: z.enum([
      'validation',
      'authentication',
      'authorization',
      'network',
      'database',
      'external',
      'business',
      'system',
      'configuration',
      'timeout',
      'rate-limit',
      'not-found',
      'conflict',
      'internal',
    ]),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    context: ErrorContextSchema.optional(),
    details: z.unknown().optional(),
    stack: z.string().optional(),
    timestamp: z.string(),
    requestId: z.string().optional(),
  }),
});

export const PrometheanErrorSchema = z.object({
  name: z.string(),
  message: z.string(),
  code: z.string(),
  category: z.enum([
    'validation',
    'authentication',
    'authorization',
    'network',
    'database',
    'external',
    'business',
    'system',
    'configuration',
    'timeout',
    'rate-limit',
    'not-found',
    'conflict',
    'internal',
  ]),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  context: ErrorContextSchema.optional(),
  details: z.unknown().optional(),
  timestamp: z.string(),
  requestId: z.string().optional(),
  stack: z.string().optional(),
});
