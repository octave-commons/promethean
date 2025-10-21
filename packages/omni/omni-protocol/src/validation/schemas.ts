/**
 * @fileoverview Zod schemas for Omni protocol validation
 */

import { z } from "zod";

/**
 * Base headers schema
 */
export const OmniHeadersSchema = z
  .object({
    authorization: z.string().optional(),
    priority: z.enum(["low", "normal", "high", "critical"]).optional(),
    timeout: z.number().positive().optional(),
    retryCount: z.number().nonnegative().optional(),
    routing: z
      .object({
        key: z.string().optional(),
        exchange: z.string().optional(),
      })
      .optional(),
    metadata: z
      .record(z.union([z.string(), z.number(), z.boolean()]))
      .optional(),
    contentEncoding: z.string().optional(),
    expiresAt: z.string().datetime().optional(),
  })
  .optional();

/**
 * Base payload schema
 */
export const OmniPayloadSchema = z.object({
  version: z.string().optional(),
  contentType: z.string().optional(),
  data: z.unknown().optional(),
});

/**
 * Base message schema
 */
export const OmniMessageSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  payload: OmniPayloadSchema,
  headers: OmniHeadersSchema,
  timestamp: z.string().datetime(),
  source: z.string().min(1),
  destination: z.string().optional(),
  correlationId: z.string().uuid().optional(),
});

/**
 * Request message schema
 */
export const OmniRequestSchema = OmniMessageSchema.extend({
  type: z.literal("request"),
  payload: OmniPayloadSchema.extend({
    action: z.string().min(1),
    params: z.record(z.unknown()).optional(),
  }),
});

/**
 * Response message schema
 */
export const OmniResponseSchema = OmniMessageSchema.extend({
  type: z.literal("response"),
  payload: OmniPayloadSchema.extend({
    success: z.boolean(),
    data: z.unknown().optional(),
    error: z
      .object({
        code: z.string(),
        message: z.string(),
        details: z.record(z.unknown()).optional(),
      })
      .optional(),
  }),
  correlationId: z.string().uuid(),
});

/**
 * Event message schema
 */
export const OmniEventSchema = OmniMessageSchema.extend({
  type: z.literal("event"),
  payload: OmniPayloadSchema.extend({
    event: z.string().min(1),
    data: z.unknown().optional(),
  }),
});

/**
 * Union schema for all message types
 */
export const OmniMessageUnionSchema = z.discriminatedUnion("type", [
  OmniRequestSchema,
  OmniResponseSchema,
  OmniEventSchema,
]);

/**
 * Error schemas
 */
export const OmniErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
  stack: z.string().optional(),
});

export const OmniValidationErrorSchema = OmniErrorSchema.extend({
  code: z.literal("VALIDATION_ERROR"),
  path: z.string().optional(),
  expected: z.string().optional(),
  received: z.unknown().optional(),
});

export const OmniTimeoutErrorSchema = OmniErrorSchema.extend({
  code: z.literal("TIMEOUT_ERROR"),
  timeout: z.number().positive(),
  operation: z.string().optional(),
});

export const OmniAuthErrorSchema = OmniErrorSchema.extend({
  code: z.literal("AUTH_ERROR"),
  authType: z.enum(["missing", "invalid", "expired", "insufficient"]),
});

export const OmniRoutingErrorSchema = OmniErrorSchema.extend({
  code: z.literal("ROUTING_ERROR"),
  destination: z.string().optional(),
  reason: z.enum([
    "unknown_destination",
    "unreachable",
    "queue_full",
    "permission_denied",
  ]),
});

/**
 * Union schema for all error types
 */
export const OmniProtocolErrorSchema = z.discriminatedUnion("code", [
  OmniValidationErrorSchema,
  OmniTimeoutErrorSchema,
  OmniAuthErrorSchema,
  OmniRoutingErrorSchema,
]);

// ============================================================================
// Context Schemas
// ============================================================================

/**
 * Request subject schema
 */
export const RequestSubjectSchema = z.object({
  id: z.string(),
  displayName: z.string().optional(),
  rbacRoles: z.array(z.string()),
});

/**
 * Request capabilities schema
 */
export const RequestCapabilitiesSchema = z.object({
  execEnabled: z.boolean(),
  githubEnabled: z.boolean(),
  sinksEnabled: z.boolean(),
});

/**
 * Request audit schema
 */
export const RequestAuditSchema = z.object({
  source: z.enum(["rest", "graphql", "websocket", "mcp", "extension"]),
  userAgent: z.string().optional(),
  ip: z.string().optional(),
});

/**
 * Request context schema
 */
export const RequestContextSchema = z.object({
  requestId: z.string(),
  subject: RequestSubjectSchema.nullable(),
  rootPath: z.string(),
  headers: z.record(z.union([z.string(), z.array(z.string())])),
  capabilities: RequestCapabilitiesSchema,
  locale: z.string().optional(),
  audit: RequestAuditSchema,
});

// ============================================================================
// Method Schemas
// ============================================================================

/**
 * File entry schema
 */
export const FileEntrySchema = z.object({
  name: z.string(),
  path: z.string(),
  type: z.enum(["file", "directory"]),
  size: z.number().optional(),
  modified: z.string().optional(),
  sha256: z.string().optional(),
  hidden: z.boolean().optional(),
});

/**
 * File node schema (recursive)
 */
export const FileNodeSchema: z.ZodType<import("../types/methods.js").FileNode> =
  z.object({
    name: z.string(),
    path: z.string(),
    type: z.enum(["file", "directory"]),
    size: z.number().optional(),
    modified: z.string().optional(),
    sha256: z.string().optional(),
    hidden: z.boolean().optional(),
    children: z.array(z.lazy(() => FileNodeSchema)).optional(),
  });

/**
 * Line edit schema
 */
export const LineEditSchema = z.object({
  line: z.number().positive(),
  operation: z.enum(["replace", "insert", "delete"]),
  content: z.string().optional(),
});

// ============================================================================
// Envelope Schemas
// ============================================================================

/**
 * Error code schema
 */
export const ErrorCodeSchema = z.enum([
  "PERMISSION_DENIED",
  "NOT_FOUND",
  "INVALID_ARGUMENT",
  "FAILED_PRECONDITION",
  "INTERNAL",
  "UNAVAILABLE",
  "DEADLINE_EXCEEDED",
  "ALREADY_EXISTS",
  "RESOURCE_EXHAUSTED",
  "UNAUTHENTICATED",
  "UNKNOWN",
]);

/**
 * Error envelope schema
 */
export const ErrorEnvelopeSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    code: ErrorCodeSchema,
    message: z.string(),
    details: z.record(z.unknown()).optional(),
    retryable: z.boolean().optional(),
    docUrl: z.string().optional(),
  }),
});

/**
 * Base success envelope schema
 */
export const SuccessEnvelopeSchema = z.object({
  ok: z.literal(true),
});

/**
 * Files list directory success schema
 */
export const FilesListDirectorySuccessSchema = SuccessEnvelopeSchema.extend({
  base: z.string(),
  entries: z.array(FileEntrySchema),
});

/**
 * Files tree directory success schema
 */
export const FilesTreeDirectorySuccessSchema = SuccessEnvelopeSchema.extend({
  base: z.string(),
  tree: z.array(FileNodeSchema),
});

/**
 * Files view file success schema
 */
export const FilesViewFileSuccessSchema = SuccessEnvelopeSchema.extend({
  path: z.string(),
  content: z.string(),
  sha256: z.string(),
});

/**
 * Files write success schema
 */
export const FilesWriteSuccessSchema = SuccessEnvelopeSchema.extend({
  path: z.string(),
  revision: z.string(),
});

/**
 * Files reindex success schema
 */
export const FilesReindexSuccessSchema = SuccessEnvelopeSchema.extend({
  scheduled: z.boolean(),
});

// ============================================================================
// Stream Event Schemas
// ============================================================================

/**
 * Base stream event schema
 */
export const StreamEventSchema = z.object({
  event: z.string(),
  data: z.unknown(),
  ts: z.string().datetime(),
  seq: z.number().nonnegative(),
});

/**
 * Agent log event data schema
 */
export const AgentLogEventDataSchema = z.object({
  agentId: z.string(),
  level: z.enum(["debug", "info", "warn", "error"]),
  message: z.string(),
  chunk: z.boolean().optional(),
  source: z.string().optional(),
});

/**
 * Agent log event schema
 */
export const AgentLogEventSchema = StreamEventSchema.extend({
  event: z.literal("agent.log"),
  data: AgentLogEventDataSchema,
});

/**
 * Agent status event data schema
 */
export const AgentStatusEventDataSchema = z.object({
  agentId: z.string(),
  status: z.enum(["stopped", "starting", "running", "stopping", "error"]),
  uptimeMs: z.number().optional(),
  metrics: z.record(z.number()).optional(),
});

/**
 * Agent status event schema
 */
export const AgentStatusEventSchema = StreamEventSchema.extend({
  event: z.literal("agent.status"),
  data: AgentStatusEventDataSchema,
});

/**
 * Stream heartbeat event schema
 */
export const StreamHeartbeatEventSchema = StreamEventSchema.extend({
  event: z.literal("stream.heartbeat"),
  data: z.object({
    intervalMs: z.number().positive(),
  }),
});

/**
 * Stream end event schema
 */
export const StreamEndEventSchema = StreamEventSchema.extend({
  event: z.literal("stream.end"),
  data: z.object({
    ok: z.boolean(),
    error: ErrorEnvelopeSchema.optional(),
  }),
});

/**
 * Union schema for all stream events
 */
export const StreamEventUnionSchema = z.discriminatedUnion("event", [
  AgentLogEventSchema,
  AgentStatusEventSchema,
  StreamHeartbeatEventSchema,
  StreamEndEventSchema,
]);

// ============================================================================
// Union Schemas
// ============================================================================

/**
 * Union schema for all envelopes
 */
export const EnvelopeUnionSchema = z.union([
  ErrorEnvelopeSchema,
  FilesListDirectorySuccessSchema,
  FilesTreeDirectorySuccessSchema,
  FilesViewFileSuccessSchema,
  FilesWriteSuccessSchema,
  FilesReindexSuccessSchema,
]);
