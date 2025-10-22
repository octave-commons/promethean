/**
 * Core Types for Data Collection Interfaces
 * Provides unified type definitions for all data collection operations
 */

/**
 * Base result type for all data collection operations
 */
export interface CollectionResult<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: CollectionError;
  readonly fallback?: T;
  readonly source: string;
  readonly timestamp: number;
  readonly collectionMethod: string;
}

/**
 * Error information for collection failures
 */
export interface CollectionError {
  readonly message: string;
  readonly type: string;
  readonly cause?: unknown;
}

/**
 * Configuration for individual collectors
 */
export interface CollectorConfig {
  readonly enabled: boolean;
  readonly timeout: number;
  readonly retryAttempts: number;
  readonly fallbackStrategy: FallbackStrategy;
}

/**
 * Fallback strategies for collection failures
 */
export enum FallbackStrategy {
  NONE = 'none',
  DEFAULT = 'default',
  CACHED = 'cached',
  ESTIMATED = 'estimated',
}

/**
 * Environment data collection types
 */
export interface EnvironmentData {
  readonly agentName?: string;
  readonly environment?: string;
  readonly debugLevel?: string;
  readonly nodeEnv?: string;
  readonly customVars?: Record<string, string>;
  readonly collectionMethod: string;
  readonly timestamp: number;
}

export interface EnvironmentCollectorConfig extends CollectorConfig {
  readonly variables: readonly string[];
  readonly caseSensitive: boolean;
}

/**
 * Kanban data collection types
 */
export interface KanbanTask {
  readonly id: string;
  readonly title: string;
  readonly status: string;
  readonly assignee?: string;
  readonly priority?: number;
  readonly tags?: readonly string[];
  readonly createdAt: number;
  readonly updatedAt: number;
}

export interface KanbanColumn {
  readonly id: string;
  readonly name: string;
  readonly wipLimit?: number;
  readonly taskCount: number;
}

export interface KanbanData {
  readonly tasks: readonly KanbanTask[];
  readonly columns: readonly KanbanColumn[];
  readonly wipLimits: Record<string, number>;
  readonly collectionMethod: string;
  readonly command?: string;
  readonly timestamp: number;
}

export interface KanbanCollectorConfig extends CollectorConfig {
  readonly kanbanCommand: string;
  readonly boardId?: string;
  readonly includeArchived: boolean;
}

/**
 * File index data collection types
 */
export interface FileInfo {
  readonly path: string;
  readonly name: string;
  readonly extension: string;
  readonly size: number;
  readonly lastModified: number;
  readonly type: 'file' | 'directory';
}

export interface PackageInfo {
  readonly name: string;
  readonly version: string;
  readonly path: string;
  readonly dependencies: readonly string[];
  readonly scripts: Record<string, string>;
}

export interface ToolInfo {
  readonly name: string;
  readonly path: string;
  readonly description?: string;
  readonly type: 'script' | 'binary' | 'alias';
}

export interface FileIndexData {
  readonly packages: readonly PackageInfo[];
  readonly tools: readonly ToolInfo[];
  readonly configs: Record<string, unknown>;
  readonly files: readonly FileInfo[];
  readonly collectionMethod: string;
  readonly basePath: string;
  readonly timestamp: number;
}

export interface FileIndexCollectorConfig extends CollectorConfig {
  readonly basePath: string;
  readonly scanDirs: readonly string[];
  readonly fileTypes: readonly string[];
  readonly excludePatterns: readonly string[];
}

/**
 * Composite collection types
 */
export interface AgentContext {
  readonly environment: CollectionResult<EnvironmentData>;
  readonly kanban: CollectionResult<KanbanData>;
  readonly fileIndex: CollectionResult<FileIndexData>;
}

export interface CollectionManagerConfig {
  readonly collectors: {
    readonly environment: EnvironmentCollectorConfig;
    readonly kanban: KanbanCollectorConfig;
    readonly fileIndex: FileIndexCollectorConfig;
  };
  readonly globalTimeout: number;
  readonly parallelCollection: boolean;
  readonly validation: boolean;
}

/**
 * Collector metadata and capabilities
 */
export interface CollectorMetadata {
  readonly type: string;
  readonly version: string;
  readonly capabilities: readonly string[];
  readonly dependencies: readonly string[];
  readonly availability: boolean;
}

/**
 * Validation schemas
 */
export interface ValidationSchema {
  readonly type: 'object' | 'array' | 'string' | 'number' | 'boolean';
  readonly required?: boolean;
  readonly properties?: Record<string, ValidationSchema>;
  readonly items?: ValidationSchema;
  readonly enum?: readonly string[];
  readonly minimum?: number;
  readonly maximum?: number;
  readonly pattern?: string;
}

/**
 * Collection events
 */
export interface CollectionEvent {
  readonly type: 'collection_started' | 'collection_completed' | 'collection_failed' | 'fallback_used';
  readonly collector: string;
  readonly timestamp: number;
  readonly data?: unknown;
  readonly error?: CollectionError;
}

/**
 * Performance metrics for collection operations
 */
export interface CollectionMetrics {
  readonly collector: string;
  readonly duration: number;
  readonly itemCount: number;
  readonly success: boolean;
  readonly retryCount: number;
  readonly timestamp: number;
}