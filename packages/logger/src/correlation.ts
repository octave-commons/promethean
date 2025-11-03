// SPDX-License-Identifier: GPL-3.0-only
// Correlation Utilities - Correlation ID management and extraction

import type { CorrelationContext } from './types.js';

/**
 * Generate a unique correlation ID
 */
export const generateCorrelationId = (): string => {
  return `corr_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Generate a unique request ID
 */
export const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Generate a unique trace ID
 */
export const generateTraceId = (): string => {
  return `trace_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Extract correlation context from request headers or environment
 */
export const extractCorrelationContext = (headers?: Record<string, string>): CorrelationContext => {
  const context: CorrelationContext = {};

  // Extract from headers if provided
  if (headers) {
    context.correlationId = headers['x-correlation-id'] || headers['correlation-id'];
    context.requestId = headers['x-request-id'] || headers['request-id'];
    context.userId = headers['x-user-id'] || headers['user-id'];
    context.sessionId = headers['x-session-id'] || headers['session-id'];
    context.traceId = headers['x-trace-id'] || headers['trace-id'];
  }

  // Extract from environment as fallback
  const envCorrelationId = context.correlationId || process.env.CORRELATION_ID;
  const envRequestId = context.requestId || process.env.REQUEST_ID;
  const envUserId = context.userId || process.env.USER_ID;
  const envSessionId = context.sessionId || process.env.SESSION_ID;
  const envTraceId = context.traceId || process.env.TRACE_ID;

  // Generate missing IDs if needed
  const finalCorrelationId = envCorrelationId || generateCorrelationId();
  const finalRequestId = envRequestId || generateRequestId();

  return {
    correlationId: finalCorrelationId,
    requestId: finalRequestId,
    userId: envUserId,
    sessionId: envSessionId,
    traceId: envTraceId,
  };
};

/**
 * Create correlation context with generated IDs
 */
export const createCorrelationContext = (
  overrides?: Partial<CorrelationContext>,
): CorrelationContext => {
  return {
    correlationId: generateCorrelationId(),
    requestId: generateRequestId(),
    traceId: generateTraceId(),
    ...overrides,
  };
};

/**
 * Merge correlation contexts
 */
export const mergeCorrelationContext = (
  base: CorrelationContext,
  override: CorrelationContext,
): CorrelationContext => {
  return {
    correlationId: override.correlationId || base.correlationId,
    requestId: override.requestId || base.requestId,
    userId: override.userId || base.userId,
    sessionId: override.sessionId || base.sessionId,
    traceId: override.traceId || base.traceId,
  };
};
