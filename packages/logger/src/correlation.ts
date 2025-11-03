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
  if (!context.correlationId) {
    context.correlationId = process.env.CORRELATION_ID;
  }
  if (!context.requestId) {
    context.requestId = process.env.REQUEST_ID;
  }
  if (!context.userId) {
    context.userId = process.env.USER_ID;
  }
  if (!context.sessionId) {
    context.sessionId = process.env.SESSION_ID;
  }
  if (!context.traceId) {
    context.traceId = process.env.TRACE_ID;
  }

  // Generate missing IDs if needed
  if (!context.correlationId) {
    context.correlationId = generateCorrelationId();
  }
  if (!context.requestId) {
    context.requestId = generateRequestId();
  }

  return context;
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
