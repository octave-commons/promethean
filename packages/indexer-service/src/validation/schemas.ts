/**
 * @fileoverview Zod schemas for indexer-service validation
 */

import { z } from 'zod';

// Re-export types from types.js for convenience
export type { ValidationResult, PathValidationResult, ValidationErrorDetails } from './types.js';
import type { ValidationResult, PathValidationResult, ValidationErrorDetails } from './types.js';

// ============================================================================
// Base Schemas
// ============================================================================

/**
 * UUID schema with strict validation
 */
export const UUIDSchema = z.string().uuid({
  message: 'Invalid UUID format',
});

/**
 * Safe path schema for file operations
 */
export const SafePathSchema = z
  .string()
  .min(1, 'Path cannot be empty')
  .max(256, 'Path too long (max 256 characters)')
  .regex(/^[a-zA-Z0-9._/-]+$/, 'Path contains invalid characters')
  .refine((path) => !path.includes('\0'), { message: 'Path cannot contain null bytes' })
  .refine((path) => !path.includes('..'), { message: 'Path traversal not allowed' })
  .refine((path) => !path.startsWith('/'), { message: 'Absolute paths not allowed' });

/**
 * Safe path array schema for batch operations
 */
export const SafePathArraySchema = z
  .array(SafePathSchema)
  .min(1, 'At least one path required')
  .max(50, 'Too many paths (max 50)');

/**
 * Search query schema
 */
export const SearchQuerySchema = z
  .string()
  .min(1, 'Search query cannot be empty')
  .max(1000, 'Search query too long (max 1000 characters)')
  .regex(/^[^<>|&;`$'"\\]*$/, 'Search query contains invalid characters');

/**
 * Result count schema with bounds
 */
export const ResultCountSchema = z
  .number()
  .int('Result count must be integer')
  .min(1, 'Result count must be at least 1')
  .max(100, 'Result count cannot exceed 100');

// ============================================================================
// Request Body Schemas
// ============================================================================

/**
 * Path operation request schema
 */
export const PathOperationRequestSchema = z.object({
  path: z.union([SafePathSchema, SafePathArraySchema]),
});

/**
 * Single path operation request schema
 */
export const SinglePathOperationRequestSchema = z.object({
  path: SafePathSchema,
});

/**
 * Search request schema
 */
export const SearchRequestSchema = z.object({
  q: SearchQuerySchema,
  n: ResultCountSchema.optional().default(8),
});

/**
 * Reindex request schema
 */
export const ReindexRequestSchema = z.object({
  path: SafePathArraySchema.optional(),
  force: z.boolean().optional().default(false),
});

// ============================================================================
// Response Schemas
// ============================================================================

/**
 * Base success response schema
 */
export const BaseSuccessResponseSchema = z.object({
  ok: z.literal(true),
});

/**
 * Base error response schema
 */
export const BaseErrorResponseSchema = z.object({
  ok: z.literal(false),
  error: z.string(),
  requestId: z.string().optional(),
});

/**
 * Indexer status response schema
 */
export const IndexerStatusResponseSchema = BaseSuccessResponseSchema.extend({
  status: z.object({
    state: z.enum(['idle', 'busy', 'error']),
    progress: z.number().min(0).max(1).optional(),
    currentOperation: z.string().optional(),
    queuedOperations: z.number().min(0),
  }),
});

/**
 * Operation result response schema
 */
export const OperationResultResponseSchema = BaseSuccessResponseSchema.extend({
  scheduled: z.boolean(),
  operationId: UUIDSchema.optional(),
  estimatedDuration: z.number().optional(),
});

/**
 * Search response schema
 */
export const SearchResponseSchema = BaseSuccessResponseSchema.extend({
  results: z.array(
    z.object({
      path: SafePathSchema,
      score: z.number().min(0).max(1),
      content: z.string().max(500).optional(), // Preview only
      metadata: z.record(z.unknown()).optional(),
    }),
  ),
  totalResults: z.number().min(0),
  queryTime: z.number().min(0),
});

// ============================================================================
// Query Parameter Schemas
// ============================================================================

/**
 * Common query parameters schema
 */
export const CommonQuerySchema = z.object({
  requestId: z.string().optional(),
  timeout: z.number().positive().max(300000).optional(), // 5 min max
  priority: z.enum(['low', 'normal', 'high']).optional(),
});

/**
 * Pagination query schema
 */
export const PaginationQuerySchema = CommonQuerySchema.extend({
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
});

// ============================================================================
// Header Schemas
// ============================================================================

/**
 * Authorization header schema
 */
export const AuthorizationHeaderSchema = z.object({
  authorization: z.string().min(1, 'Authorization header required'),
});

/**
 * Content type header schema
 */
export const ContentTypeHeaderSchema = z.object({
  'content-type': z.string().regex(/^application\/json/, 'Content-Type must be application/json'),
});

/**
 * Common headers schema
 */
export const CommonHeadersSchema = z.object({
  'user-agent': z.string().optional(),
  'x-request-id': z.string().optional(),
  'x-forwarded-for': z.string().optional(),
  'x-real-ip': z.string().optional(),
});

// ============================================================================
// Security Schemas
// ============================================================================

/**
 * Security metadata schema
 */
export const SecurityMetadataSchema = z.object({
  clientIp: z.string().ip({ version: 'v4' }).optional(),
  userAgent: z.string().max(500).optional(),
  requestId: z.string().optional(),
  timestamp: z.string().datetime(),
  riskScore: z.number().min(0).max(1),
  securityFlags: z.array(z.string()),
});

/**
 * Rate limit info schema
 */
export const RateLimitInfoSchema = z.object({
  limit: z.number().min(0),
  remaining: z.number().min(0),
  reset: z.number().min(0),
  retryAfter: z.number().optional(),
});

// ============================================================================
// Union Schemas
// ============================================================================

/**
 * All possible response schemas
 */
export const ResponseUnionSchema = z.discriminatedUnion('ok', [
  BaseSuccessResponseSchema,
  BaseErrorResponseSchema,
  IndexerStatusResponseSchema,
  OperationResultResponseSchema,
  SearchResponseSchema,
]);

/**
 * All possible request schemas
 */
export const RequestUnionSchema = z.object({
  // Base request object - can be extended with discriminators if needed
  type: z.string().optional(),
});

// ============================================================================
// Schema Registry
// ============================================================================

/**
 * Schema registry for easy access
 */
export const SchemaRegistry = {
  // Request schemas
  PathOperationRequest: PathOperationRequestSchema,
  SinglePathOperationRequest: SinglePathOperationRequestSchema,
  SearchRequest: SearchRequestSchema,
  ReindexRequest: ReindexRequestSchema,

  // Response schemas
  BaseSuccessResponse: BaseSuccessResponseSchema,
  BaseErrorResponse: BaseErrorResponseSchema,
  IndexerStatusResponse: IndexerStatusResponseSchema,
  OperationResultResponse: OperationResultResponseSchema,
  SearchResponse: SearchResponseSchema,

  // Query schemas
  CommonQuery: CommonQuerySchema,
  PaginationQuery: PaginationQuerySchema,

  // Header schemas
  AuthorizationHeader: AuthorizationHeaderSchema,
  ContentTypeHeader: ContentTypeHeaderSchema,
  CommonHeaders: CommonHeadersSchema,

  // Security schemas
  SecurityMetadata: SecurityMetadataSchema,
  RateLimitInfo: RateLimitInfoSchema,

  // Base schemas
  UUID: UUIDSchema,
  SafePath: SafePathSchema,
  SafePathArray: SafePathArraySchema,
  SearchQuery: SearchQuerySchema,
  ResultCount: ResultCountSchema,
} as const;

/**
 * Type for schema registry keys
 */
export type SchemaRegistryKey = keyof typeof SchemaRegistry;

/**
 * Get a schema by name
 */
export function getSchema(name: SchemaRegistryKey) {
  return SchemaRegistry[name];
}
