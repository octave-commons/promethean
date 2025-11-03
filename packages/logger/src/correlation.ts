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
  const getHeaderValue = (key: string): string | undefined =>
    headers?.[`x-${key}`] || headers?.[key];

  const getEnvValue = (key: string): string | undefined => process.env[key.toUpperCase()];

  const correlationId =
    getHeaderValue('correlation-id') || getEnvValue('CORRELATION_ID') || generateCorrelationId();
  const requestId =
    getHeaderValue('request-id') || getEnvValue('REQUEST_ID') || generateRequestId();
  const userId = getHeaderValue('user-id') || getEnvValue('USER_ID');
  const sessionId = getHeaderValue('session-id') || getEnvValue('SESSION_ID');
  const traceId = getHeaderValue('trace-id') || getEnvValue('TRACE_ID');

  return {
    correlationId,
    requestId,
    userId,
    sessionId,
    traceId,
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
): CorrelationContext => ({
  correlationId: override.correlationId || base.correlationId,
  requestId: override.requestId || base.requestId,
  userId: override.userId || base.userId,
  sessionId: override.sessionId || base.sessionId,
  traceId: override.traceId || base.traceId,
});
