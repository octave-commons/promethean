/**
 * DirectoryAdapter Types
 * Provides secure, standardized file operations for task management
 */

import type { IndexedTask } from '../../board/types.js';
import type { TaskValidationResult } from '../task-content/types.js';

/**
 * Security validation levels
 */
export type SecurityLevel = 'strict' | 'moderate' | 'permissive';

/**
 * File operation types
 */
export type FileOperationType =
  | 'read'
  | 'write'
  | 'create'
  | 'update'
  | 'delete'
  | 'move'
  | 'copy'
  | 'list'
  | 'search'
  | 'validate'
  | 'backup';

/**
 * Path validation result
 */
export interface PathValidationResult {
  valid: boolean;
  normalizedPath: string;
  securityIssues: string[];
  warnings: string[];
}

/**
 * File operation context
 */
export interface FileOperationContext {
  operation: FileOperationType;
  path: string;
  user?: string;
  timestamp: Date;
  requestId?: string;
  metadata?: Record<string, any>;
}

/**
 * Security validation options
 */
export interface SecurityOptions {
  level: SecurityLevel;
  allowedExtensions: readonly string[];
  maxFileSize: number;
  allowPathTraversal: boolean;
  allowSymlinks: boolean;
  requireAuthentication: boolean;
  auditLog: boolean;
}

/**
 * Directory adapter configuration
 */
export interface DirectoryAdapterConfig {
  /** Base directory for task files */
  baseDirectory: string;
  /** Security validation options */
  security: SecurityOptions;
  /** Backup configuration */
  backup: {
    enabled: boolean;
    directory: string;
    retentionDays: number;
    compressionEnabled: boolean;
    hashVerification: boolean;
  };
  /** Cache integration */
  cache: {
    enabled: boolean;
    ttl: number; // milliseconds
  };
  /** Performance options */
  performance: {
    enableStreaming: boolean;
    batchSize: number;
    maxConcurrentOps: number;
  };
}

/**
 * File operation result
 */
export interface FileOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata: {
    operation: FileOperationType;
    path: string;
    duration: number;
    timestamp: Date;
    securityValidations: PathValidationResult;
    backupPath?: string;
  };
}

/**
 * Task file operations interface
 */
export interface TaskFileOperations {
  /** Read a task file */
  readTaskFile(uuid: string): Promise<FileOperationResult<IndexedTask>>;

  /** Write a task file */
  writeTaskFile(task: IndexedTask): Promise<FileOperationResult<void>>;

  /** Create a new task file */
  createTaskFile(task: IndexedTask): Promise<FileOperationResult<void>>;

  /** Update an existing task file */
  updateTaskFile(uuid: string, updates: Partial<IndexedTask>): Promise<FileOperationResult<void>>;

  /** Delete a task file */
  deleteTaskFile(uuid: string): Promise<FileOperationResult<void>>;

  /** Move/rename a task file */
  moveTaskFile(uuid: string, newTitle: string): Promise<FileOperationResult<void>>;

  /** List task files */
  listTaskFiles(options?: ListOptions): Promise<FileOperationResult<IndexedTask[]>>;

  /** Search task files */
  searchTaskFiles(
    query: string,
    options?: SearchOptions,
  ): Promise<FileOperationResult<IndexedTask[]>>;

  /** Validate task file structure */
  validateTaskFile(uuid: string): Promise<FileOperationResult<TaskValidationResult>>;

  /** Backup a task file */
  backupTaskFile(uuid: string, reason?: string): Promise<FileOperationResult<string>>;
}

/** List operation options */
export interface ListOptions {
  filter?: {
    status?: string[];
    priority?: string[];
    labels?: string[];
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
  sort?: {
    field: 'title' | 'created' | 'updated' | 'priority' | 'status';
    order: 'asc' | 'desc';
  };
  pagination?: {
    offset: number;
    limit: number;
  };
}

/** Search operation options */
export interface SearchOptions {
  fields?: ('title' | 'content' | 'labels' | 'status')[];
  fuzzy?: boolean;
  caseSensitive?: boolean;
  limit?: number;
}

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  operation: FileOperationType;
  path: string;
  user?: string;
  success: boolean;
  error?: string;
  securityIssues: string[];
  duration: number;
  metadata?: Record<string, any>;
}

/**
 * Security validator interface
 */
export interface SecurityValidator {
  validatePath(path: string, context: FileOperationContext): Promise<PathValidationResult>;
  validateFileContent(
    content: string,
    context: FileOperationContext,
  ): Promise<PathValidationResult>;
  validateOperation(context: FileOperationContext): Promise<boolean>;
}

/**
 * Backup manager interface
 */
export interface BackupManager {
  createBackup(filePath: string, reason?: string, context?: FileOperationContext): Promise<string>;
  restoreBackup(backupPath: string, targetPath: string): Promise<void>;
  listBackups(filePath?: string): Promise<string[]>;
  cleanupOldBackups(): Promise<number>;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  operationCounts: Record<FileOperationType, number>;
  averageDurations: Record<FileOperationType, number>;
  errorRates: Record<FileOperationType, number>;
  cacheHitRate: number;
  totalOperations: number;
  lastReset: Date;
}

/**
 * Directory adapter events
 */
export interface DirectoryAdapterEvents {
  'operation:start': (context: FileOperationContext) => void;
  'operation:success': (result: FileOperationResult) => void;
  'operation:error': (error: Error, context: FileOperationContext) => void;
  'security:violation': (violation: PathValidationResult, context: FileOperationContext) => void;
  'backup:created': (backupPath: string, originalPath: string) => void;
  'cache:hit': (operation: FileOperationType, path: string) => void;
  'cache:miss': (operation: FileOperationType, path: string) => void;
}

/**
 * Error types
 */
export class DirectoryAdapterError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly operation?: FileOperationType,
    public readonly path?: string,
    public override readonly cause?: Error,
  ) {
    super(message);
    this.name = 'DirectoryAdapterError';
  }
}

export class SecurityValidationError extends DirectoryAdapterError {
  constructor(
    message: string,
    public readonly securityIssues: string[],
    path?: string,
    operation?: FileOperationType,
  ) {
    super(message, 'SECURITY_VALIDATION_ERROR', operation, path);
    this.name = 'SecurityValidationError';
  }
}

export class FileNotFoundError extends DirectoryAdapterError {
  constructor(path: string, operation?: FileOperationType) {
    super(`File not found: ${path}`, 'FILE_NOT_FOUND', operation, path);
    this.name = 'FileNotFoundError';
  }
}

export class FilePermissionError extends DirectoryAdapterError {
  constructor(path: string, operation?: FileOperationType) {
    super(`Permission denied: ${path}`, 'FILE_PERMISSION_ERROR', operation, path);
    this.name = 'FilePermissionError';
  }
}

export class FileCorruptionError extends DirectoryAdapterError {
  constructor(path: string, reason: string, operation?: FileOperationType) {
    super(
      `File corruption detected: ${path} - ${reason}`,
      'FILE_CORRUPTION_ERROR',
      operation,
      path,
    );
    this.name = 'FileCorruptionError';
  }
}
