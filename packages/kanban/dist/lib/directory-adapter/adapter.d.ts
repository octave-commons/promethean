/**
 * DirectoryAdapter - Main implementation
 * Centralizes and secures all task file operations
 */
import type { IndexedTask } from '../../board/types.js';
import type { TaskCache } from '../../board/task-cache.js';
import type { DirectoryAdapterConfig, TaskFileOperations, FileOperationResult, AuditLogEntry, PerformanceMetrics, ListOptions, SearchOptions } from './types.js';
/**
 * Main DirectoryAdapter implementation
 */
export declare class DirectoryAdapter implements TaskFileOperations {
    private readonly config;
    private readonly securityValidator;
    private readonly backupManager;
    private readonly cache?;
    private readonly auditLog;
    private readonly performanceMetrics;
    constructor(config: DirectoryAdapterConfig, cache?: TaskCache);
    /**
     * Read a task file with full security validation
     */
    readTaskFile(uuid: string): Promise<FileOperationResult<IndexedTask>>;
    /**
     * Write a task file with full security validation
     */
    writeTaskFile(task: IndexedTask): Promise<FileOperationResult<void>>;
    /**
     * Create a new task file
     */
    createTaskFile(task: IndexedTask): Promise<FileOperationResult<void>>;
    /**
     * Update an existing task file
     */
    updateTaskFile(uuid: string, updates: Partial<IndexedTask>): Promise<FileOperationResult<void>>;
    /**
     * Delete a task file
     */
    deleteTaskFile(uuid: string): Promise<FileOperationResult<void>>;
    /**
     * Move/rename a task file
     */
    moveTaskFile(uuid: string, newTitle: string): Promise<FileOperationResult<void>>;
    /**
     * List task files with filtering and pagination
     */
    listTaskFiles(options?: ListOptions): Promise<FileOperationResult<IndexedTask[]>>;
    /**
     * Search task files
     */
    searchTaskFiles(query: string, options?: SearchOptions): Promise<FileOperationResult<IndexedTask[]>>;
    /**
     * Validate task file structure
     */
    validateTaskFile(uuid: string): Promise<FileOperationResult<any>>;
    /**
     * Backup a task file
     */
    backupTaskFile(uuid: string, reason?: string): Promise<FileOperationResult<string>>;
    /**
     * Get performance metrics
     */
    getPerformanceMetrics(): PerformanceMetrics;
    /**
     * Get audit log
     */
    getAuditLog(): AuditLogEntry[];
    /**
     * Clean up resources
     */
    close(): Promise<void>;
    private ensureBaseDirectory;
    private getTaskPath;
    private getTaskPathByTitle;
    private createContext;
    private validateOperation;
    private createSuccessResult;
    private handleError;
    private updateMetrics;
    private logAuditEntry;
    private recordCacheHit;
    private recordCacheMiss;
    private passesFilters;
    private generateRequestId;
}
/**
 * Create DirectoryAdapter with configuration
 */
export declare const createDirectoryAdapter: (config: DirectoryAdapterConfig, cache?: TaskCache) => DirectoryAdapter;
//# sourceMappingURL=adapter.d.ts.map