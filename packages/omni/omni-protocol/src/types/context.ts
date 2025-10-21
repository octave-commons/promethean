/**
 * @fileoverview RequestContext and related protocol interfaces
 */

/**
 * Subject information for authenticated requests
 */
export interface RequestSubject {
  /** Unique identifier for the subject */
  id: string;

  /** Display name for the subject */
  displayName?: string;

  /** RBAC roles assigned to the subject */
  rbacRoles: string[];
}

/**
 * Capability flags for the current request context
 */
export interface RequestCapabilities {
  /** Whether execution commands are enabled */
  execEnabled: boolean;

  /** Whether GitHub API access is enabled */
  githubEnabled: boolean;

  /** Whether sink operations are enabled */
  sinksEnabled: boolean;
}

/**
 * Audit information for request tracking
 */
export interface RequestAudit {
  /** Source of the request */
  source: "rest" | "graphql" | "websocket" | "mcp" | "extension";

  /** User agent string if available */
  userAgent?: string;

  /** IP address if available */
  ip?: string;
}

/**
 * Normalized request context derived from transport-specific auth and metadata
 */
export interface RequestContext {
  /** Unique identifier for this request */
  requestId: string;

  /** Authenticated subject information, null for unauthenticated requests */
  subject: RequestSubject | null;

  /** Root path for file operations (sandbox boundary) */
  rootPath: string;

  /** HTTP headers or transport-specific metadata */
  headers: Record<string, string | string[]>;

  /** Capability flags for this request */
  capabilities: RequestCapabilities;

  /** Locale for internationalization */
  locale?: string;

  /** Audit and tracking information */
  audit: RequestAudit;
}

/**
 * Method metadata for adapter generation
 */
export interface MethodMetadata {
  /** Method identifier */
  method: string;

  /** Human-readable summary */
  summary: string;

  /** Required RBAC roles */
  rbac?: string[];

  /** Method tags for grouping */
  tags?: string[];

  /** Deprecation status */
  deprecated?: boolean;

  /** JSON Schema for input validation */
  inputSchema: JsonSchema;

  /** JSON Schema for output validation */
  outputSchema: JsonSchema;
}

/**
 * JSON Schema type definition
 */
export type JsonSchema = Record<string, unknown>;

/**
 * HTTP method types
 */
export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS";

/**
 * Rate limit information from GitHub API
 */
export interface RateInfo {
  /** Number of requests remaining in current window */
  remaining: number;

  /** Number of requests allowed in current window */
  limit: number;

  /** Unix timestamp when rate limit resets */
  reset: number;

  /** Resource being rate limited */
  resource: string;
}
