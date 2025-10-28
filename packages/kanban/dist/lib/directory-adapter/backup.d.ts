/**
 * Backup management for DirectoryAdapter
 * Provides automated backup and recovery for task files
 */
import type { BackupManager, FileOperationContext } from './types.js';
/**
 * Backup configuration
 */
export interface BackupConfig {
    directory: string;
    retentionDays: number;
    compressionEnabled: boolean;
    hashVerification: boolean;
}
/**
 * Backup metadata
 */
export interface BackupMetadata {
    id: string;
    originalPath: string;
    backupPath: string;
    timestamp: Date;
    reason?: string;
    user?: string;
    operation: string;
    fileSize: number;
    contentHash: string;
    compressed: boolean;
}
/**
 * Backup manager implementation
 */
export declare class TaskBackupManager implements BackupManager {
    private readonly backupDir;
    private readonly retentionDays;
    private readonly compressionEnabled;
    private readonly hashVerification;
    constructor(config: BackupConfig);
    /**
     * Create a backup of the specified file
     */
    createBackup(filePath: string, reason?: string, context?: FileOperationContext): Promise<string>;
    /**
     * Restore a backup to the specified target
     */
    restoreBackup(backupPath: string, targetPath: string): Promise<void>;
    /**
     * List all backups, optionally filtered by original file
     */
    listBackups(filePath?: string): Promise<string[]>;
    /**
     * Clean up old backups based on retention policy
     */
    cleanupOldBackups(): Promise<number>;
    /**
     * Get backup statistics
     */
    getBackupStats(): Promise<{
        totalBackups: number;
        totalSize: number;
        oldestBackup?: Date;
        newestBackup?: Date;
        filesByOriginalPath: Record<string, number>;
    }>;
    /**
     * Ensure backup directory exists
     */
    private ensureBackupDirectory;
    /**
     * Generate unique backup ID
     */
    private generateBackupId;
    /**
     * Calculate SHA-256 hash of content
     */
    private calculateHash;
    /**
     * Load backup metadata
     */
    private loadBackupMetadata;
    /**
     * Verify backup integrity
     */
    private verifyBackupIntegrity;
    /**
     * Compress content (simple implementation)
     */
    private compressContent;
    /**
     * Decompress content
     */
    private decompressContent;
}
/**
 * Create backup manager with configuration
 */
export declare const createBackupManager: (config: BackupConfig) => BackupManager;
//# sourceMappingURL=backup.d.ts.map