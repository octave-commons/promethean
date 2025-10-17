/**
 * @fileoverview Validation types and interfaces for indexer-service
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import type { z } from 'zod';

/**
 * Validation result type
 */
export type ValidationResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: z.ZodError };

/**
 * Validation context for request processing
 */
export interface ValidationContext {
  request: FastifyRequest;
  reply: FastifyReply;
  operation: string;
  timestamp: string;
}

/**
 * Validation middleware options
 */
export interface ValidationMiddlewareOptions {
  /** Whether to validate request body */
  validateBody?: boolean;
  /** Whether to validate query parameters */
  validateQuery?: boolean;
  /** Whether to validate headers */
  validateHeaders?: boolean;
  /** Whether to validate response */
  validateResponse?: boolean;
  /** Custom error handler */
  onError?: (context: ValidationContext, error: z.ZodError) => void;
}

/**
 * Security validation options
 */
export interface SecurityValidationOptions {
  /** Maximum request body size */
  maxBodySize?: number;
  /** Maximum query string length */
  maxQueryLength?: number;
  /** Maximum number of path segments */
  maxPathSegments?: number;
  /** Whether to enable rate limiting validation */
  enableRateLimitValidation?: boolean;
  /** Whether to enable request size validation */
  enableSizeValidation?: boolean;
}

/**
 * Path validation result with security context
 */
export interface PathValidationResult {
  valid: boolean;
  sanitized?: string;
  securityIssues?: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Request validation summary
 */
export interface RequestValidationSummary {
  operation: string;
  timestamp: string;
  bodyValid: boolean;
  queryValid: boolean;
  headersValid: boolean;
  securityValid: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  processingTimeMs: number;
}

/**
 * Validation error details for security monitoring
 */
export interface ValidationErrorDetails {
  operation: string;
  field: string;
  issue: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  inputValue?: unknown;
  expectedType?: string;
  timestamp: string;
  requestId?: string;
  clientIp?: string;
  userAgent?: string;
}

/**
 * Path body interface for indexer routes
 */
export interface PathBody {
  path?: string | string[];
}
