/**
 * Core API Types for Promethean Unified API System
 * 
 * This file contains the fundamental type definitions that power the unified
 * API architecture across all Promethean services.
 */

/**
 * Base API response wrapper for successful responses
 */
export type ApiResponse<T> = {
  readonly success: true;
  readonly data: T;
  readonly meta: {
    readonly timestamp: string; // ISO 8601 format
    readonly requestId: string; // Unique request identifier
    readonly version: string; // API version
    readonly pagination?: PaginationMeta;
    readonly rateLimit?: RateLimitMeta;
  };
};

/**
 * Base API response wrapper for error responses
 */
export type ApiError = {
  readonly success: false;
  readonly error: {
    readonly code: string; // Machine-readable error code
    readonly message: string; // Human-readable error message
    readonly details?: unknown; // Additional error context
    readonly stack?: string; // Development only
  };
  readonly meta: {
    readonly timestamp: string;
    readonly requestId: string;
    readonly version: string;
  };
};

/**
 * Pagination metadata for list responses
 */
export type PaginationMeta = {
  readonly page: number; // Current page (1-based)
  readonly limit: number; // Items per page
  readonly total: number; // Total items
  readonly totalPages: number; // Total pages
  readonly hasNext: boolean; // Has next page
  readonly hasPrev: boolean; // Has previous page
};

/**
 * Rate limiting metadata
 */
export type RateLimitMeta = {
  readonly limit: number; // Request limit
  readonly remaining: number; // Remaining requests
  readonly reset: number; // Unix timestamp when limit resets
  readonly retryAfter?: number; // Seconds to wait (429 responses)
};

/**
 * Request context passed through middleware chain
 */
export type RequestContext = {
  readonly requestId: string;
  readonly userId?: string;
  readonly userAgent?: string;
  readonly ip?: string;
  readonly timestamp: number;
  readonly version: string;
  readonly method: string;
  readonly path: string;
};

/**
 * Health check response structure
 */
export type HealthCheck = {
  readonly status: 'healthy' | 'degraded' | 'unhealthy';
  readonly timestamp: string;
  readonly version: string;
  readonly checks: {
    readonly database: HealthCheckResult;
    readonly externalServices: HealthCheckResult;
    readonly memory: HealthCheckResult;
    readonly disk: HealthCheckResult;
  };
};

/**
 * Individual health check result
 */
export type HealthCheckResult = {
  readonly status: 'pass' | 'fail' | 'warn';
  readonly message?: string;
  readonly duration?: number; // Response time in milliseconds
  readonly details?: Record<string, unknown>;
};

/**
 * Request metrics for monitoring
 */
export type RequestMetrics = {
  readonly method: string;
  readonly path: string;
  readonly statusCode: number;
  readonly responseTime: number;
  readonly userAgent?: string;
  readonly userId?: string;
  readonly requestId: string;
  readonly timestamp: number;
};

/**
 * Error report for tracking and debugging
 */
export type ErrorReport = {
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly stack?: string;
  };
  readonly request: {
    readonly method: string;
    readonly path: string;
    readonly headers: Record<string, string>;
    readonly body?: unknown;
  };
  readonly user?: {
    readonly id: string;
    readonly role: string;
  };
  readonly context: {
    readonly timestamp: string;
    readonly requestId: string;
    readonly version: string;
  };
};

/**
 * JWT token payload structure
 */
export type JwtPayload = {
  readonly sub: string; // User ID
  readonly iat: number; // Issued at
  readonly exp: number; // Expires at
  readonly scope: readonly string[]; // Permissions
  readonly role: string; // User role
};

/**
 * API version information
 */
export type ApiVersion = {
  readonly version: string;
  readonly status: 'current' | 'previous' | 'deprecated' | 'beta';
  readonly deprecationDate?: string;
  readonly sunsetDate?: string;
  readonly migrationGuide?: string;
};

/**
 * Cache configuration for endpoints
 */
export type CacheConfig = {
  readonly ttl: number; // Time to live in seconds
  readonly varyBy?: readonly string[]; // Cache variation factors
  readonly tags?: readonly string[]; // Cache invalidation tags
};

/**
 * Rate limit configuration
 */
export type RateLimitConfig = {
  readonly requests: number; // Request count
  readonly window: number; // Time window in seconds
  readonly burst?: number; // Burst capacity
  readonly skipSuccessfulRequests?: boolean;
  readonly skipFailedRequests?: boolean;
};

/**
 * Middleware configuration
 */
export type MiddlewareConfig = {
  readonly cors?: {
    readonly origin: string | readonly string[];
    readonly credentials?: boolean;
    readonly methods?: readonly string[];
    readonly headers?: readonly string[];
  };
  readonly rateLimit?: RateLimitConfig;
  readonly security?: {
    readonly headers?: Record<string, string>;
    readonly csrf?: boolean;
    readonly hsts?: boolean;
  };
};

/**
 * API endpoint configuration
 */
export type EndpointConfig = {
  readonly path: string;
  readonly method: string;
  readonly version: string;
  readonly auth?: boolean;
  readonly rateLimit?: RateLimitConfig;
  readonly cache?: CacheConfig;
  readonly validation?: {
    readonly body?: string; // Schema reference
    readonly query?: string; // Schema reference
    readonly params?: string; // Schema reference
  };
};

/**
 * Union type for all possible API responses
 */
export type ApiResult<T = unknown> = ApiResponse<T> | ApiError;

/**
 * Type guard to check if response is successful
 */
export const isSuccess = <T>(response: ApiResult<T>): response is ApiResponse<T> => 
  response.success;

/**
 * Type guard to check if response is an error
 */
export const isError = <T>(response: ApiResult<T>): response is ApiError => 
  !response.success;