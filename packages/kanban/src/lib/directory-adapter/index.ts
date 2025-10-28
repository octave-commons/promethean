/**
 * DirectoryAdapter - Main export
 * Centralizes and secures all task file operations for the Promethean Framework
 */

// Type exports
export type {
  SecurityLevel,
  FileOperationType,
  PathValidationResult,
  FileOperationContext,
  SecurityOptions,
  DirectoryAdapterConfig,
  FileOperationResult,
  TaskFileOperations,
  ListOptions,
  SearchOptions,
  AuditLogEntry,
  SecurityValidator,
  BackupManager,
  PerformanceMetrics,
  DirectoryAdapterEvents,
  DirectoryAdapterError,
  SecurityValidationError,
  FileNotFoundError,
  FilePermissionError,
  FileCorruptionError,
} from './types.js';

// Class exports
export { DirectoryAdapter, createDirectoryAdapter } from './adapter.js';

export {
  TaskSecurityValidator,
  createSecurityValidator,
  DEFAULT_SECURITY_OPTIONS,
} from './security.js';

export { DEFAULT_DIRECTORY_ADAPTER_CONFIG, TEST_CONFIG } from './config.js';

export { TaskBackupManager, createBackupManager } from './backup.js';

// Re-export for convenience
export type { BackupConfig, BackupMetadata } from './backup.js';
