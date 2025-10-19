/**
 * DirectoryAdapter - Main implementation
 * Centralizes and secures all task file operations
 */

import { promises as fs } from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';
import { createLogger, type LogFields } from '@promethean/utils';
import matter from 'gray-matter';
import type { IndexedTask } from '../../board/types.js';
import type { TaskCache } from '../../board/task-cache.js';
import type {
  DirectoryAdapterConfig,
  TaskFileOperations,
  FileOperationResult,
  FileOperationContext,
  SecurityValidator,
  BackupManager,
  AuditLogEntry,
  PerformanceMetrics,
  ListOptions,
  SearchOptions,
} from './types.js';
import { DirectoryAdapterError, SecurityValidationError, FileNotFoundError } from './types.js';
import type { FileOperationType } from './types.js';
import { createSecurityValidator } from './security.js';
import { createBackupManager } from './backup.js';

const logger = createLogger({ service: 'directory-adapter' });

/**
 * Main DirectoryAdapter implementation
 */
export class DirectoryAdapter implements TaskFileOperations {
  private readonly config: DirectoryAdapterConfig;
  private readonly securityValidator: SecurityValidator;
  private readonly backupManager: BackupManager;
  private readonly cache?: TaskCache;
  private readonly auditLog: AuditLogEntry[] = [];
  private readonly performanceMetrics: PerformanceMetrics = {
    operationCounts: {} as any,
    averageDurations: {} as any,
    errorRates: {} as any,
    cacheHitRate: 0,
    totalOperations: 0,
    lastReset: new Date(),
  };

  constructor(config: DirectoryAdapterConfig, cache?: TaskCache) {
    this.config = config;
    this.cache = cache;
    this.securityValidator = createSecurityValidator(config.security);
    // Transform backup config to match BackupConfig interface
    const backupConfig = {
      directory: config.backup.directory,
      retentionDays: config.backup.retentionDays,
      compressionEnabled: config.backup.compressionEnabled,
      hashVerification: config.backup.hashVerification,
    };
    this.backupManager = createBackupManager(backupConfig);

    // Ensure base directory exists
    this.ensureBaseDirectory();
  }

  /**
   * Read a task file with full security validation
   */
  async readTaskFile(uuid: string): Promise<FileOperationResult<IndexedTask>> {
    const context = this.createContext('read', this.getTaskPath(uuid));
    const startTime = performance.now();

    try {
      // Check cache first
      if (this.cache) {
        const cachedTask = await this.cache.getTask(uuid);
        if (cachedTask) {
          this.recordCacheHit('read', context.path);
          return this.createSuccessResult(cachedTask, context, startTime);
        }
        this.recordCacheMiss('read', context.path);
      }

      // Validate operation
      await this.validateOperation(context);

      // Read file
      const filePath = this.getTaskPath(uuid);
      const content = await fs.readFile(filePath, 'utf8');
      const stats = await fs.stat(filePath);

      // Validate content
      const contentValidation = await this.securityValidator.validateFileContent(content, context);
      if (!contentValidation.valid) {
        throw new SecurityValidationError(
          'Content validation failed',
          contentValidation.securityIssues,
          filePath,
          'read',
        );
      }

      // Parse task
      const parsed = matter(content);
      const task: IndexedTask = {
        id: uuid,
        uuid,
        title: parsed.data.title || '',
        status: parsed.data.status || 'todo',
        priority: parsed.data.priority || 'medium',
        owner: parsed.data.owner || '',
        labels: parsed.data.labels || [],
        created: parsed.data.created || stats.birthtime.toISOString(),
        updated: parsed.data.updated || stats.mtime.toISOString(),
        path: filePath,
        content: parsed.content,
      };

      // Update cache
      if (this.cache) {
        await this.cache.setTask(task);
      }

      return this.createSuccessResult(task, context, startTime);
    } catch (error) {
      return this.handleError(error, context, startTime);
    }
  }

  /**
   * Write a task file with full security validation
   */
  async writeTaskFile(task: IndexedTask): Promise<FileOperationResult<void>> {
    const taskPath = task.path || this.getTaskPath(task.uuid || task.id);
    const context = this.createContext('write', taskPath);
    const startTime = performance.now();

    try {
      // Validate operation
      await this.validateOperation(context);

      // Create backup if enabled
      let backupPath = '';
      if (this.config.backup.enabled) {
        backupPath = await this.backupManager.createBackup(context.path, 'write', context);
      }

      // Prepare content
      const frontmatter = {
        uuid: task.uuid,
        title: task.title,
        status: task.status,
        priority: task.priority,
        owner: task.owner,
        labels: task.labels,
        created: task.created,
        updated: new Date().toISOString(),
      };

      const content = matter.stringify(task.content || '', frontmatter);

      // Validate content
      const contentValidation = await this.securityValidator.validateFileContent(content, context);
      if (!contentValidation.valid) {
        throw new SecurityValidationError(
          'Content validation failed',
          contentValidation.securityIssues,
          context.path,
          'write',
        );
      }

      // Ensure directory exists
      const dir = path.dirname(context.path);
      await fs.mkdir(dir, { recursive: true });

      // Write file
      await fs.writeFile(context.path, content, 'utf8');

      // Update cache
      if (this.cache) {
        await this.cache.setTask({ ...task, path: context.path });
      }

      const result = this.createSuccessResult(undefined, context, startTime);
      if (backupPath) {
        result.metadata.backupPath = backupPath;
      }

      return result;
    } catch (error) {
      return this.handleError(error, context, startTime);
    }
  }

  /**
   * Create a new task file
   */
  async createTaskFile(task: IndexedTask): Promise<FileOperationResult<void>> {
    const context = this.createContext('create', this.getTaskPath(task.uuid || task.id));
    const startTime = performance.now();

    try {
      // Check if file already exists
      try {
        await fs.access(context.path);
        throw new DirectoryAdapterError(
          'Task file already exists',
          'FILE_EXISTS',
          'create',
          context.path,
        );
      } catch (error) {
        if ((error as any).code !== 'ENOENT') {
          throw error;
        }
      }

      // Validate operation
      await this.validateOperation(context);

      // Prepare content with creation timestamp
      const frontmatter = {
        uuid: task.uuid,
        title: task.title,
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        owner: task.owner || '',
        labels: task.labels || [],
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      };

      const content = matter.stringify(task.content || '', frontmatter);

      // Validate content
      const contentValidation = await this.securityValidator.validateFileContent(content, context);
      if (!contentValidation.valid) {
        throw new SecurityValidationError(
          'Content validation failed',
          contentValidation.securityIssues,
          context.path,
          'create',
        );
      }

      // Ensure directory exists
      const dir = path.dirname(context.path);
      await fs.mkdir(dir, { recursive: true });

      // Write file
      await fs.writeFile(context.path, content, 'utf8');

      // Update cache
      if (this.cache) {
        await this.cache.setTask({ ...task, path: context.path });
      }

      return this.createSuccessResult(undefined, context, startTime);
    } catch (error) {
      return this.handleError(error, context, startTime);
    }
  }

  /**
   * Update an existing task file
   */
  async updateTaskFile(
    uuid: string,
    updates: Partial<IndexedTask>,
  ): Promise<FileOperationResult<void>> {
    const context = this.createContext('update', this.getTaskPath(uuid));
    const startTime = performance.now();

    try {
      // Read existing task
      const existingResult = await this.readTaskFile(uuid);
      if (!existingResult.success || !existingResult.data) {
        throw new FileNotFoundError(context.path, 'update');
      }

      const existingTask = existingResult.data;

      // Create backup if enabled
      let backupPath = '';
      if (this.config.backup.enabled) {
        backupPath = await this.backupManager.createBackup(context.path, 'update', context);
      }

      // Merge updates
      const updatedTask: IndexedTask = {
        ...existingTask,
        ...updates,
        uuid, // Ensure UUID is preserved
        updated: new Date().toISOString(),
      };

      // Write updated task
      const writeResult = await this.writeTaskFile(updatedTask);
      if (!writeResult.success) {
        throw writeResult.error
          ? new Error(writeResult.error)
          : new Error('Write operation failed');
      }

      const result = this.createSuccessResult(undefined, context, startTime);
      if (backupPath) {
        result.metadata.backupPath = backupPath;
      }

      return result;
    } catch (error) {
      return this.handleError(error, context, startTime);
    }
  }

  /**
   * Delete a task file
   */
  async deleteTaskFile(uuid: string): Promise<FileOperationResult<void>> {
    const context = this.createContext('delete', this.getTaskPath(uuid));
    const startTime = performance.now();

    try {
      // Create backup if enabled
      let backupPath = '';
      if (this.config.backup.enabled) {
        backupPath = await this.backupManager.createBackup(context.path, 'delete', context);
      }

      // Validate operation
      await this.validateOperation(context);

      // Check if file exists
      await fs.access(context.path);

      // Delete file
      await fs.unlink(context.path);

      // Remove from cache
      if (this.cache) {
        await this.cache.removeTask(uuid);
      }

      const result = this.createSuccessResult(undefined, context, startTime);
      if (backupPath) {
        result.metadata.backupPath = backupPath;
      }

      return result;
    } catch (error) {
      return this.handleError(error, context, startTime);
    }
  }

  /**
   * Move/rename a task file
   */
  async moveTaskFile(uuid: string, newTitle: string): Promise<FileOperationResult<void>> {
    const oldPath = this.getTaskPath(uuid);
    const newPath = this.getTaskPathByTitle(newTitle);
    const context = this.createContext('move', oldPath, { newPath });
    const startTime = performance.now();

    try {
      // Validate operation
      await this.validateOperation(context);

      // Check if source file exists
      await fs.access(oldPath);

      // Check if destination already exists
      try {
        await fs.access(newPath);
        throw new DirectoryAdapterError(
          'Destination file already exists',
          'DESTINATION_EXISTS',
          'move',
          newPath,
        );
      } catch (error) {
        if ((error as any).code !== 'ENOENT') {
          throw error;
        }
      }

      // Create backup if enabled
      let backupPath = '';
      if (this.config.backup.enabled) {
        backupPath = await this.backupManager.createBackup(oldPath, 'move', context);
      }

      // Read and update task
      const readResult = await this.readTaskFile(uuid);
      if (!readResult.success || !readResult.data) {
        throw new FileNotFoundError(oldPath, 'move');
      }

      const task = readResult.data;
      const updatedTask = {
        ...task,
        title: newTitle,
        path: newPath,
      };

      // Write to new location
      const writeResult = await this.writeTaskFile(updatedTask);
      if (!writeResult.success) {
        throw writeResult.error
          ? new Error(writeResult.error)
          : new Error('Write operation failed');
      }

      // Delete old file
      await fs.unlink(oldPath);

      // Update cache
      if (this.cache) {
        await this.cache.removeTask(uuid);
        await this.cache.setTask(task);
      }

      const result = this.createSuccessResult(undefined, context, startTime);
      if (backupPath) {
        result.metadata.backupPath = backupPath;
      }

      return result;
    } catch (error) {
      return this.handleError(error, context, startTime);
    }
  }

  /**
   * List task files with filtering and pagination
   */
  async listTaskFiles(options?: ListOptions): Promise<FileOperationResult<IndexedTask[]>> {
    const context = this.createContext('list', this.config.baseDirectory);
    const startTime = performance.now();

    try {
      // Use cache if available and no complex filtering
      if (this.cache && !options?.filter && !options?.sort) {
        const tasks: IndexedTask[] = [];
        const limit = options?.pagination?.limit;
        let count = 0;

        for await (const task of this.cache.getTasksByStatus('')) {
          if (limit && count >= limit) break;
          tasks.push(task);
          count++;
        }

        return this.createSuccessResult(tasks, context, startTime);
      }

      // Fallback to file system listing
      const tasks: IndexedTask[] = [];
      const files = await fs.readdir(this.config.baseDirectory);
      const markdownFiles = files.filter((file) => file.endsWith('.md'));

      for (const file of markdownFiles) {
        const filePath = path.join(this.config.baseDirectory, file);
        try {
          const content = await fs.readFile(filePath, 'utf8');
          const parsed = matter(content);
          const stats = await fs.stat(filePath);

          const task: IndexedTask = {
            id: parsed.data.uuid || '',
            uuid: parsed.data.uuid || '',
            title: parsed.data.title || path.basename(file, '.md'),
            status: parsed.data.status || 'todo',
            priority: parsed.data.priority || 'medium',
            owner: parsed.data.owner || '',
            labels: parsed.data.labels || [],
            created: parsed.data.created || stats.birthtime.toISOString(),
            updated: parsed.data.updated || stats.mtime.toISOString(),
            path: filePath,
            content: parsed.content,
          };

          // Apply filters
          if (this.passesFilters(task, options?.filter)) {
            tasks.push(task);
          }
        } catch (error) {
          logger.warn(`Failed to parse task file ${file}:`, error as LogFields);
        }
      }

      // Apply sorting
      if (options?.sort) {
        tasks.sort((a, b) => {
          const aValue = a[options.sort!.field];
          const bValue = b[options.sort!.field];
          const order = options.sort!.order === 'desc' ? -1 : 1;

          // Handle undefined values
          if (aValue === undefined && bValue === undefined) return 0;
          if (aValue === undefined) return 1 * order;
          if (bValue === undefined) return -1 * order;

          if (aValue < bValue) return -1 * order;
          if (aValue > bValue) return 1 * order;
          return 0;
        });
      }

      // Apply pagination
      if (options?.pagination) {
        const { offset, limit } = options.pagination;
        return this.createSuccessResult(tasks.slice(offset, offset + limit), context, startTime);
      }

      return this.createSuccessResult(tasks, context, startTime);
    } catch (error) {
      return this.handleError(error, context, startTime);
    }
  }

  /**
   * Search task files
   */
  async searchTaskFiles(
    query: string,
    options?: SearchOptions,
  ): Promise<FileOperationResult<IndexedTask[]>> {
    const context = this.createContext('search', this.config.baseDirectory, { query });
    const startTime = performance.now();

    try {
      // Use cache search if available
      if (this.cache) {
        const tasks: IndexedTask[] = [];
        const limit = options?.limit;
        let count = 0;

        for await (const task of this.cache.searchTasks(query)) {
          if (limit && count >= limit) break;
          tasks.push(task);
          count++;
        }

        return this.createSuccessResult(tasks, context, startTime);
      }

      // Fallback to file system search
      const allTasksResult = await this.listTaskFiles();
      if (!allTasksResult.success || !allTasksResult.data) {
        throw new Error('Failed to list tasks for search');
      }

      const queryLower = query.toLowerCase();
      const fields = options?.fields || ['title', 'content'];
      const matchedTasks = allTasksResult.data.filter((task) => {
        return fields.some((field) => {
          const value = task[field as keyof IndexedTask];
          return value && String(value).toLowerCase().includes(queryLower);
        });
      });

      const limitedTasks = options?.limit ? matchedTasks.slice(0, options.limit) : matchedTasks;

      return this.createSuccessResult(limitedTasks, context, startTime);
    } catch (error) {
      return this.handleError(error, context, startTime);
    }
  }

  /**
   * Validate task file structure
   */
  async validateTaskFile(uuid: string): Promise<FileOperationResult<any>> {
    const context = this.createContext('validate', this.getTaskPath(uuid));
    const startTime = performance.now();

    try {
      const readResult = await this.readTaskFile(uuid);
      if (!readResult.success) {
        return readResult;
      }

      // Basic validation
      const task = readResult.data!;
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!task.uuid) errors.push('Missing UUID');
      if (!task.title) errors.push('Missing title');
      if (!task.status) warnings.push('Missing status');
      if (!task.priority) warnings.push('Missing priority');

      const validation = {
        valid: errors.length === 0,
        errors,
        warnings,
        suggestions: [],
      };

      return this.createSuccessResult(validation, context, startTime);
    } catch (error) {
      return this.handleError(error, context, startTime);
    }
  }

  /**
   * Backup a task file
   */
  async backupTaskFile(uuid: string, reason?: string): Promise<FileOperationResult<string>> {
    const context = this.createContext('backup', this.getTaskPath(uuid));
    const startTime = performance.now();

    try {
      const backupPath = await this.backupManager.createBackup(
        this.getTaskPath(uuid),
        reason,
        context,
      );

      return this.createSuccessResult(backupPath, context, startTime);
    } catch (error) {
      return this.handleError(error, context, startTime);
    }
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Get audit log
   */
  getAuditLog(): AuditLogEntry[] {
    return [...this.auditLog];
  }

  /**
   * Clean up resources
   */
  async close(): Promise<void> {
    if (this.cache) {
      await this.cache.close();
    }
  }

  // Private helper methods

  private async ensureBaseDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.config.baseDirectory, { recursive: true });
    } catch (error) {
      logger.error('Failed to create base directory:', error as LogFields);
    }
  }

  private getTaskPath(uuid: string): string {
    return path.join(this.config.baseDirectory, `${uuid}.md`);
  }

  private getTaskPathByTitle(title: string): string {
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9-_]/g, '_');
    return path.join(this.config.baseDirectory, `${sanitizedTitle}.md`);
  }

  private createContext(
    operation: FileOperationType,
    filePath: string,
    additionalMetadata?: Record<string, any>,
  ): FileOperationContext {
    return {
      operation,
      path: filePath,
      timestamp: new Date(),
      requestId: this.generateRequestId(),
      metadata: {
        ...additionalMetadata,
        baseDirectory: this.config.baseDirectory,
      },
    };
  }

  private async validateOperation(context: FileOperationContext): Promise<void> {
    // Validate path security
    const pathValidation = await this.securityValidator.validatePath(context.path, context);
    if (!pathValidation.valid) {
      throw new SecurityValidationError(
        'Path validation failed',
        pathValidation.securityIssues,
        context.path,
        context.operation,
      );
    }

    // Validate operation context
    const operationValid = await this.securityValidator.validateOperation(context);
    if (!operationValid) {
      throw new SecurityValidationError(
        'Operation validation failed',
        ['Operation not allowed'],
        context.path,
        context.operation,
      );
    }
  }

  private createSuccessResult<T>(
    data: T,
    context: FileOperationContext,
    startTime: number,
  ): FileOperationResult<T> {
    const duration = performance.now() - startTime;

    this.updateMetrics(context.operation, duration, true);
    this.logAuditEntry(context, true, undefined, duration);

    return {
      success: true,
      data,
      metadata: {
        operation: context.operation,
        path: context.path,
        duration,
        timestamp: context.timestamp,
        securityValidations: {
          valid: true,
          normalizedPath: context.path,
          securityIssues: [],
          warnings: [],
        },
      },
    };
  }

  private handleError(
    error: unknown,
    context: FileOperationContext,
    startTime: number,
  ): FileOperationResult {
    const duration = performance.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    this.updateMetrics(context.operation, duration, false);
    this.logAuditEntry(context, false, errorMessage, duration);

    logger.error(`Operation ${context.operation} failed on ${context.path}:`, error as LogFields);

    return {
      success: false,
      error: errorMessage,
      metadata: {
        operation: context.operation,
        path: context.path,
        duration,
        timestamp: context.timestamp,
        securityValidations: {
          valid: true,
          normalizedPath: context.path,
          securityIssues: [],
          warnings: [],
        },
      },
    };
  }

  private updateMetrics(operation: FileOperationType, duration: number, success: boolean): void {
    this.performanceMetrics.totalOperations++;
    this.performanceMetrics.operationCounts[operation] =
      (this.performanceMetrics.operationCounts[operation] || 0) + 1;

    // Update average duration
    const currentAvg = this.performanceMetrics.averageDurations[operation] || 0;
    const count = this.performanceMetrics.operationCounts[operation];
    this.performanceMetrics.averageDurations[operation] =
      (currentAvg * (count - 1) + duration) / count;

    // Update error rate
    if (!success) {
      const errorCount = (this.performanceMetrics.errorRates[operation] || 0) + 1;
      this.performanceMetrics.errorRates[operation] = errorCount / count;
    }
  }

  private logAuditEntry(
    context: FileOperationContext,
    success: boolean,
    error?: string,
    duration?: number,
  ): void {
    if (!this.config.security.auditLog) return;

    const entry: AuditLogEntry = {
      id: this.generateRequestId(),
      timestamp: context.timestamp,
      operation: context.operation,
      path: context.path,
      user: context.user,
      success,
      error,
      securityIssues: [],
      duration: duration || 0,
      metadata: context.metadata,
    };

    this.auditLog.push(entry);

    // Keep audit log size manageable
    if (this.auditLog.length > 10000) {
      this.auditLog.splice(0, 1000);
    }
  }

  private recordCacheHit(_operation: FileOperationType, _path: string): void {
    this.performanceMetrics.cacheHitRate = (this.performanceMetrics.cacheHitRate + 1) / 2; // Simple moving average
  }

  private recordCacheMiss(_operation: FileOperationType, _path: string): void {
    this.performanceMetrics.cacheHitRate = this.performanceMetrics.cacheHitRate * 0.9; // Decay
  }

  private passesFilters(task: IndexedTask, filter?: ListOptions['filter']): boolean {
    if (!filter) return true;

    if (filter.status && !filter.status.includes(task.status)) return false;
    if (filter.priority && !filter.priority.includes(task.priority)) return false;
    if (filter.labels && !filter.labels.some((label) => task.labels.includes(label))) return false;
    if (filter.dateRange) {
      const created = new Date(task.created);
      if (created < filter.dateRange.start || created > filter.dateRange.end) return false;
    }

    return true;
  }

  private generateRequestId(): string {
    return (
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    );
  }
}

/**
 * Create DirectoryAdapter with configuration
 */
export const createDirectoryAdapter = (
  config: DirectoryAdapterConfig,
  cache?: TaskCache,
): DirectoryAdapter => {
  return new DirectoryAdapter(config, cache);
};
