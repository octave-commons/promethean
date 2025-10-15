/**
 * Core types for the Scar Context system used in heal command implementation.
 * Provides type-safe interfaces for tracking healing operations, event logs, and metadata management.
 */

/**
 * Main scar context interface that contains all healing operation data
 */
export interface ScarContext {
  /** Reason for the healing operation */
  reason: string;
  /** Sequential log of all operations performed during healing */
  eventLog: EventLogEntry[];
  /** Previous scar records for historical context */
  previousScars: ScarRecord[];
  /** Search results that informed the healing decision */
  searchResults: SearchResult[];
  /** Metadata containing git tag and narrative information */
  metadata: {
    tag: string;
    narrative: string;
  };
  /** LLM operations performed during the healing process */
  llmOperations: LLMOperation[];
  /** Git commit history relevant to the healing operation */
  gitHistory: GitCommit[];
}

/**
 * Individual event log entry for tracking operations
 */
export interface EventLogEntry {
  /** Timestamp when the operation occurred */
  timestamp: Date;
  /** Type of operation that was performed */
  operation: string;
  /** Additional details about the operation */
  details: Record<string, any>;
  /** Severity level of the event */
  severity: 'info' | 'warning' | 'error';
}

/**
 * Record of a previous scar (healing operation)
 */
export interface ScarRecord {
  /** Starting git SHA for the scar range */
  start: string;
  /** Ending git SHA for the scar range */
  end: string;
  /** Git tag associated with this scar */
  tag: string;
  /** Story/narrative of what was healed */
  story: string;
  /** When this scar was created */
  timestamp: Date;
}

/**
 * Search result from task/database queries
 */
export interface SearchResult {
  /** Unique identifier of the found task */
  taskId: string;
  /** Title of the found task */
  title: string;
  /** Relevance score (0-1, higher is more relevant) */
  relevance: number;
  /** Content snippet showing why this result matched */
  snippet: string;
}

/**
 * LLM operation performed during healing
 */
export interface LLMOperation {
  /** Unique identifier for this operation */
  id: string;
  /** Type of LLM operation performed */
  operation: string;
  /** Input data sent to the LLM */
  input: any;
  /** Output data received from the LLM */
  output: any;
  /** When this operation was performed */
  timestamp: Date;
  /** Number of tokens consumed (if available) */
  tokensUsed?: number;
}

/**
 * Git commit information
 */
export interface GitCommit {
  /** Full SHA hash of the commit */
  sha: string;
  /** Commit message */
  message: string;
  /** Author of the commit */
  author: string;
  /** When the commit was made */
  timestamp: Date;
  /** List of files changed in this commit */
  files: string[];
}

/**
 * Configuration options for scar context creation
 */
export interface ScarContextOptions {
  /** Maximum number of previous scars to retain */
  maxPreviousScars?: number;
  /** Maximum number of search results to store */
  maxSearchResults?: number;
  /** Maximum number of LLM operations to track */
  maxLLMOperations?: number;
  /** Maximum git history depth */
  maxGitHistory?: number;
}

/**
 * Healing operation status
 */
export type HealingStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'rolled_back';

/**
 * Healing operation result
 */
export interface HealingResult {
  /** Status of the healing operation */
  status: HealingStatus;
  /** Summary of what was accomplished */
  summary: string;
  /** Number of tasks modified */
  tasksModified: number;
  /** Number of files changed */
  filesChanged: number;
  /** Any errors that occurred during healing */
  errors: string[];
  /** Timestamp when healing completed */
  completedAt?: Date;
}
