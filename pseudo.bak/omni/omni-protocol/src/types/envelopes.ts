/**
 * @fileoverview Success and error envelope types for Omni protocol
 */

import type { JsonSchema, RateInfo } from "./context.js";
import type { FileEntry, FileNode } from "./methods.js";
import type { Sinks } from "./methods.js";
import type { Indexer } from "./methods.js";
import type { Agents } from "./methods.js";
import type { Metadata } from "./methods.js";

// ============================================================================
// Error Envelope Types
// ============================================================================

/**
 * Standard error envelope format
 */
export interface ErrorEnvelope {
  /** Success flag (always false for errors) */
  ok: false;

  /** Error information */
  error: {
    /** Error code following gRPC-inspired taxonomy */
    code: ErrorCode;

    /** Human-readable error message */
    message: string;

    /** Additional error details */
    details?: Record<string, unknown>;

    /** Whether the error is retryable */
    retryable?: boolean;

    /** Documentation URL for this error */
    docUrl?: string;
  };
}

/**
 * Standard error codes following gRPC taxonomy
 */
export type ErrorCode =
  | "PERMISSION_DENIED"
  | "NOT_FOUND"
  | "INVALID_ARGUMENT"
  | "FAILED_PRECONDITION"
  | "INTERNAL"
  | "UNAVAILABLE"
  | "DEADLINE_EXCEEDED"
  | "ALREADY_EXISTS"
  | "RESOURCE_EXHAUSTED"
  | "UNAUTHENTICATED"
  | "UNKNOWN";

// ============================================================================
// Success Envelope Types
// ============================================================================

/**
 * Base success envelope
 */
export interface SuccessEnvelope {
  /** Success flag (always true for success) */
  ok: true;
}

/**
 * Files list directory success envelope
 */
export interface FilesListDirectorySuccess extends SuccessEnvelope {
  /** Base directory path */
  base: string;

  /** File entries */
  entries: FileEntry[];
}

/**
 * Files tree directory success envelope
 */
export interface FilesTreeDirectorySuccess extends SuccessEnvelope {
  /** Base directory path */
  base: string;

  /** Tree structure */
  tree: FileNode[];
}

/**
 * Files view file success envelope
 */
export interface FilesViewFileSuccess extends SuccessEnvelope {
  /** File path */
  path: string;

  /** File content */
  content: string;

  /** SHA256 hash */
  sha256: string;
}

/**
 * Files write success envelope
 */
export interface FilesWriteSuccess extends SuccessEnvelope {
  /** File path */
  path: string;

  /** Revision identifier */
  revision: string;
}

/**
 * Files reindex success envelope
 */
export interface FilesReindexSuccess extends SuccessEnvelope {
  /** Whether reindex was scheduled */
  scheduled: boolean;
}

/**
 * Search results success envelope
 */
export interface SearchResultsSuccess<T = unknown> extends SuccessEnvelope {
  /** Search results */
  results: T[];
}

/**
 * Sinks list success envelope
 */
export interface SinksListSuccess extends SuccessEnvelope {
  /** Available sinks */
  sinks: Sinks.SinkSummary[];
}

/**
 * Sinks search success envelope
 */
export interface SinksSearchSuccess extends SuccessEnvelope {
  /** Search results */
  results: Sinks.SinkHit[];
}

/**
 * Indexer status success envelope
 */
export interface IndexerStatusSuccess extends SuccessEnvelope {
  /** Indexer status */
  status: Indexer.IndexerStatus;
}

/**
 * Agents list success envelope
 */
export interface AgentsListSuccess extends SuccessEnvelope {
  /** Available agents */
  agents: Agents.AgentSummary[];
}

/**
 * Agents start success envelope
 */
export interface AgentsStartSuccess extends SuccessEnvelope {
  /** Agent handle */
  agent: Agents.AgentHandle;
}

/**
 * Agents status success envelope
 */
export interface AgentsStatusSuccess extends SuccessEnvelope {
  /** Agent status */
  status: Agents.AgentStatus;
}

/**
 * Agents tail success envelope
 */
export interface AgentsTailSuccess extends SuccessEnvelope {
  /** Log lines */
  lines: Agents.AgentLogLine[];
}

/**
 * Agents control success envelope
 */
export interface AgentsControlSuccess extends SuccessEnvelope {
  /** Updated status */
  status: Agents.AgentStatus;
}

/**
 * Exec run success envelope
 */
export interface ExecRunSuccess extends SuccessEnvelope {
  /** Exit code */
  exitCode: number;

  /** Standard output */
  stdout: string;

  /** Standard error */
  stderr: string;
}

/**
 * GitHub API success envelope
 */
export interface GitHubApiSuccess extends SuccessEnvelope {
  /** Response data */
  data: unknown;

  /** Rate limit information */
  rateLimit: RateInfo;
}

/**
 * GitHub rate limit success envelope
 */
export interface GitHubRateLimitSuccess extends SuccessEnvelope {
  /** Rate limit information */
  rateLimit: RateInfo;
}

/**
 * Metadata OpenAPI success envelope
 */
export interface MetadataOpenapiSuccess extends SuccessEnvelope {
  /** OpenAPI document */
  document: JsonSchema;
}

/**
 * Metadata health success envelope
 */
export interface MetadataHealthSuccess extends SuccessEnvelope {
  /** Overall status */
  status: "ok";

  /** Health check details */
  details: Metadata.HealthCheck[];
}

// ============================================================================
// Union Types
// ============================================================================

/**
 * Union of all success envelope types
 */
export type SuccessEnvelopeUnion =
  | FilesListDirectorySuccess
  | FilesTreeDirectorySuccess
  | FilesViewFileSuccess
  | FilesWriteSuccess
  | FilesReindexSuccess
  | SearchResultsSuccess
  | SinksListSuccess
  | SinksSearchSuccess
  | IndexerStatusSuccess
  | AgentsListSuccess
  | AgentsStartSuccess
  | AgentsStatusSuccess
  | AgentsTailSuccess
  | AgentsControlSuccess
  | ExecRunSuccess
  | GitHubApiSuccess
  | GitHubRateLimitSuccess
  | MetadataOpenapiSuccess
  | MetadataHealthSuccess
  | SuccessEnvelope;

/**
 * Union of all envelope types (success and error)
 */
export type EnvelopeUnion = SuccessEnvelopeUnion | ErrorEnvelope;

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Type guard to check if an envelope is a success envelope
 */
export function isSuccessEnvelope<T extends SuccessEnvelope>(
  envelope: EnvelopeUnion,
): envelope is T {
  return envelope.ok === true;
}

/**
 * Type guard to check if an envelope is an error envelope
 */
export function isErrorEnvelope(
  envelope: EnvelopeUnion,
): envelope is ErrorEnvelope {
  return envelope.ok === false;
}

/**
 * Create a success envelope
 */
export function createSuccessEnvelope<T extends SuccessEnvelope>(
  data: Omit<T, "ok">,
): T {
  return { ok: true, ...data } as T;
}

/**
 * Create an error envelope
 */
export function createErrorEnvelope(
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>,
  options?: {
    retryable?: boolean;
    docUrl?: string;
  },
): ErrorEnvelope {
  return {
    ok: false,
    error: {
      code,
      message,
      details,
      retryable: options?.retryable,
      docUrl: options?.docUrl,
    },
  };
}
