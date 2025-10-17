/**
 * @fileoverview Method family interfaces for Omni protocol
 */

import type { JsonSchema, RateInfo, HttpMethod } from "./context.js";

// ============================================================================
// Common Types
// ============================================================================

/**
 * File entry representation
 */
export interface FileEntry {
  /** File name */
  name: string;

  /** Full path relative to root */
  path: string;

  /** File type */
  type: "file" | "directory";

  /** File size in bytes */
  size?: number;

  /** Last modified timestamp */
  modified?: string;

  /** SHA256 hash */
  sha256?: string;

  /** Whether the entry is hidden */
  hidden?: boolean;
}

/**
 * File node for tree representation
 */
export interface FileNode {
  /** Node name */
  name: string;

  /** Full path */
  path: string;

  /** Node type */
  type: "file" | "directory";

  /** File size */
  size?: number;

  /** Last modified */
  modified?: string;

  /** SHA256 hash */
  sha256?: string;

  /** Whether hidden */
  hidden?: boolean;

  /** Child nodes (directories only) */
  children?: FileNode[];
}

/**
 * Write mode for file operations
 */
export type WriteMode = "create" | "overwrite" | "append";

/**
 * Line edit operation
 */
export interface LineEdit {
  /** Line number (1-based) */
  line: number;

  /** Operation type */
  operation: "replace" | "insert" | "delete";

  /** Line content (for replace/insert) */
  content?: string;
}

// ============================================================================
// Files Methods
// ============================================================================

export namespace Files {
  /** Input for listDirectory */
  export interface ListDirectoryInput {
    /** Directory path */
    path: string;

    /** Maximum depth */
    depth?: number;
  }

  /** Output for listDirectory */
  export interface ListDirectoryOutput {
    /** Base path */
    base: string;

    /** File entries */
    entries: FileEntry[];
  }

  /** Input for treeDirectory */
  export interface TreeDirectoryInput {
    /** Directory path */
    path: string;

    /** Depth to traverse */
    depth: number;
  }

  /** Output for treeDirectory */
  export interface TreeDirectoryOutput {
    /** Base path */
    base: string;

    /** Tree structure */
    tree: FileNode[];
  }

  /** Input for viewFile */
  export interface ViewFileInput {
    /** File path */
    path: string;
  }

  /** Output for viewFile */
  export interface ViewFileOutput {
    /** File path */
    path: string;

    /** File content */
    content: string;

    /** SHA256 hash */
    sha256: string;
  }

  /** Input for writeContent */
  export interface WriteContentInput {
    /** File path */
    path: string;

    /** File content */
    content: string;

    /** Write mode */
    mode: WriteMode;
  }

  /** Output for writeContent */
  export interface WriteContentOutput {
    /** File path */
    path: string;

    /** Revision identifier */
    revision: string;
  }

  /** Input for writeLines */
  export interface WriteLinesInput {
    /** File path */
    path: string;

    /** Line operations */
    operations: LineEdit[];
  }

  /** Output for writeLines */
  export interface WriteLinesOutput {
    /** File path */
    path: string;

    /** Revision identifier */
    revision: string;
  }

  /** Input for scheduleReindex */
  export interface ScheduleReindexInput {
    /** Path to reindex (optional for full reindex) */
    path?: string;
  }

  /** Output for scheduleReindex */
  export interface ScheduleReindexOutput {
    /** Whether reindex was scheduled */
    scheduled: boolean;
  }
}

// ============================================================================
// Search Methods
// ============================================================================

export namespace Search {
  /** Grep search result hit */
  export interface GrepHit {
    /** File path */
    file: string;

    /** Line number */
    line: number;

    /** Line content */
    content: string;

    /** Match start/end positions */
    start?: number;
    end?: number;
  }

  /** Input for grep */
  export interface GrepInput {
    /** Search pattern */
    pattern: string;

    /** Search path */
    path?: string;
  }

  /** Output for grep */
  export interface GrepOutput {
    /** Search results */
    results: GrepHit[];
  }

  /** Semantic search result hit */
  export interface SemanticHit {
    /** Document ID */
    id: string;

    /** Document path/identifier */
    path: string;

    /** Relevance score */
    score: number;

    /** Document content snippet */
    snippet?: string;

    /** Metadata */
    metadata?: Record<string, unknown>;
  }

  /** Input for semantic search */
  export interface SemanticInput {
    /** Search query */
    query: string;

    /** Result limit */
    limit?: number;
  }

  /** Output for semantic search */
  export interface SemanticOutput {
    /** Search results */
    results: SemanticHit[];
  }

  /** Web search result hit */
  export interface WebHit {
    /** Result title */
    title: string;

    /** Result URL */
    url: string;

    /** Result snippet */
    snippet: string;

    /** Source */
    source?: string;
  }

  /** Input for web search */
  export interface WebInput {
    /** Search query */
    query: string;

    /** Result limit */
    limit?: number;
  }

  /** Output for web search */
  export interface WebOutput {
    /** Search results */
    results: WebHit[];
  }
}

// ============================================================================
// Sinks Methods
// ============================================================================

export namespace Sinks {
  /** Sink summary information */
  export interface SinkSummary {
    /** Sink identifier */
    id: string;

    /** Sink type */
    type: string;

    /** Sink name */
    name: string;

    /** Description */
    description?: string;

    /** Whether sink is active */
    active: boolean;

    /** Configuration */
    config?: Record<string, unknown>;
  }

  /** Input for list */
  export interface ListInput {}

  /** Output for list */
  export interface ListOutput {
    /** Available sinks */
    sinks: SinkSummary[];
  }

  /** Sink search result hit */
  export interface SinkHit {
    /** Sink ID */
    sinkId: string;

    /** Document ID */
    documentId: string;

    /** Content */
    content: string;

    /** Relevance score */
    score?: number;

    /** Metadata */
    metadata?: Record<string, unknown>;
  }

  /** Input for search */
  export interface SearchInput {
    /** Sink identifier */
    sinkId: string;

    /** Search query */
    query: string;
  }

  /** Output for search */
  export interface SearchOutput {
    /** Search results */
    results: SinkHit[];
  }
}

// ============================================================================
// Indexer Methods
// ============================================================================

export namespace Indexer {
  /** Indexer status information */
  export interface IndexerStatus {
    /** Overall status */
    status: "idle" | "indexing" | "paused" | "error";

    /** Active jobs */
    activeJobs: number;

    /** Completed jobs */
    completedJobs: number;

    /** Total files processed */
    totalFiles: number;

    /** Last indexed timestamp */
    lastIndexed?: string;

    /** Error message if in error state */
    error?: string;
  }

  /** Input for status */
  export interface StatusInput {}

  /** Output for status */
  export interface StatusOutput {
    /** Current status */
    status: IndexerStatus;
  }

  /** Control actions */
  export type ControlAction = "pause" | "resume" | "reindex";

  /** Input for control */
  export interface ControlInput {
    /** Action to perform */
    action: ControlAction;

    /** Target (optional) */
    target?: string;
  }

  /** Output for control */
  export interface ControlOutput {
    /** Updated status */
    status: IndexerStatus;
  }
}

// ============================================================================
// Agents Methods
// ============================================================================

export namespace Agents {
  /** Agent summary information */
  export interface AgentSummary {
    /** Agent ID */
    id: string;

    /** Agent name */
    name: string;

    /** Agent type/preset */
    preset: string;

    /** Current status */
    status: "stopped" | "starting" | "running" | "stopping" | "error";

    /** Start time */
    startTime?: string;

    /** Uptime in milliseconds */
    uptimeMs?: number;
  }

  /** Agent input data */
  export interface AgentInput {
    /** Input data */
    data: Record<string, unknown>;

    /** Configuration */
    config?: Record<string, unknown>;
  }

  /** Agent handle for interaction */
  export interface AgentHandle {
    /** Agent ID */
    id: string;

    /** Agent name */
    name: string;

    /** Current status */
    status: AgentSummary["status"];

    /** Communication channel */
    channel: string;
  }

  /** Agent status details */
  export interface AgentStatus {
    /** Agent ID */
    id: string;

    /** Current status */
    status: AgentSummary["status"];

    /** Uptime in milliseconds */
    uptimeMs?: number;

    /** Last activity */
    lastActivity?: string;

    /** Error message if applicable */
    error?: string;

    /** Metrics */
    metrics?: Record<string, number>;
  }

  /** Agent log line */
  export interface AgentLogLine {
    /** Timestamp */
    timestamp: string;

    /** Log level */
    level: "debug" | "info" | "warn" | "error";

    /** Log message */
    message: string;

    /** Source component */
    source?: string;
  }

  /** Input for list */
  export interface ListInput {}

  /** Output for list */
  export interface ListOutput {
    /** Available agents */
    agents: AgentSummary[];
  }

  /** Input for start */
  export interface StartInput {
    /** Agent preset */
    preset: string;

    /** Agent input */
    input: AgentInput;
  }

  /** Output for start */
  export interface StartOutput {
    /** Agent handle */
    agent: AgentHandle;
  }

  /** Input for status */
  export interface StatusInput {
    /** Agent ID */
    agentId: string;
  }

  /** Output for status */
  export interface StatusOutput {
    /** Agent status */
    status: AgentStatus;
  }

  /** Input for tail */
  export interface TailInput {
    /** Agent ID */
    agentId: string;

    /** Number of lines */
    limit?: number;
  }

  /** Output for tail */
  export interface TailOutput {
    /** Log lines */
    lines: AgentLogLine[];
  }

  /** Control actions */
  export type ControlAction = "stop" | "restart";

  /** Input for control */
  export interface ControlInput {
    /** Agent ID */
    agentId: string;

    /** Action to perform */
    action: ControlAction;
  }

  /** Output for control */
  export interface ControlOutput {
    /** Updated status */
    status: AgentStatus;
  }

  /** Input for streamLogs */
  export interface StreamLogsInput {
    /** Agent ID */
    agentId: string;
  }
}

// ============================================================================
// Exec Methods
// ============================================================================

export namespace Exec {
  /** Input for run */
  export interface RunInput {
    /** Working directory */
    cwd?: string;

    /** Command to execute */
    command: string;

    /** Timeout in milliseconds */
    timeoutMs?: number;
  }

  /** Output for run */
  export interface RunOutput {
    /** Exit code */
    exitCode: number;

    /** Standard output */
    stdout: string;

    /** Standard error */
    stderr: string;
  }
}

// ============================================================================
// GitHub Methods
// ============================================================================

export namespace GitHub {
  /** Input for REST API call */
  export interface RestInput {
    /** API route */
    route: string;

    /** HTTP method */
    method: HttpMethod;

    /** Request parameters */
    params?: JsonSchema;
  }

  /** Output for REST API call */
  export interface RestOutput {
    /** Response data */
    data: unknown;

    /** Rate limit info */
    rateLimit: RateInfo;
  }

  /** Input for GraphQL query */
  export interface GraphqlInput {
    /** GraphQL query */
    query: string;

    /** Query variables */
    variables?: JsonSchema;
  }

  /** Output for GraphQL query */
  export interface GraphqlOutput {
    /** Response data */
    data: unknown;

    /** Rate limit info */
    rateLimit: RateInfo;
  }

  /** Input for rateLimit */
  export interface RateLimitInput {}

  /** Output for rateLimit */
  export interface RateLimitOutput {
    /** Rate limit info */
    rateLimit: RateInfo;
  }
}

// ============================================================================
// Metadata Methods
// ============================================================================

export namespace Metadata {
  /** Input for openapi */
  export interface OpenapiInput {}

  /** Output for openapi */
  export interface OpenapiOutput {
    /** OpenAPI document */
    document: JsonSchema;
  }

  /** Health check result */
  export interface HealthCheck {
    /** Service name */
    service: string;

    /** Health status */
    status: "healthy" | "unhealthy" | "degraded";

    /** Response time in milliseconds */
    responseTime?: number;

    /** Additional details */
    details?: Record<string, unknown>;
  }

  /** Input for health */
  export interface HealthInput {}

  /** Output for health */
  export interface HealthOutput {
    /** Overall status */
    status: "ok";

    /** Health checks */
    details: HealthCheck[];
  }
}
