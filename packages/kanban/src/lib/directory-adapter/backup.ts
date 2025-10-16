/**
 * Backup management for DirectoryAdapter
 * Provides automated backup and recovery for task files
 */

import { promises as fs } from 'fs';
import path from 'path';
import { createHash } from 'crypto';
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
export class TaskBackupManager implements BackupManager {
  private readonly backupDir: string;
  private readonly retentionDays: number;
  private readonly compressionEnabled: boolean;
  private readonly hashVerification: boolean;

  constructor(config: BackupConfig) {
    this.backupDir = config.directory;
    this.retentionDays = config.retentionDays;
    this.compressionEnabled = config.compressionEnabled;
    this.hashVerification = config.hashVerification;

    // Ensure backup directory exists
    this.ensureBackupDirectory();
  }

  /**
   * Create a backup of the specified file
   */
  async createBackup(filePath: string, reason?: string, context?: FileOperationContext): Promise<string> {
    try {
      // Check if file exists
      await fs.access(filePath);

      // Read original file
      const content = await fs.readFile(filePath, 'utf8');
      const stats = await fs.stat(filePath);

      // Generate backup ID and paths
      const backupId = this.generateBackupId(filePath);
      const backupFileName = `${backupId}.md`;
      const backupPath = path.join(this.backupDir, backupFileName);
      const metadataPath = path.join(this.backupDir, `${backupId}.meta.json`);

      // Calculate content hash for integrity
      const contentHash = this.calculateHash(content);

      // Create backup metadata
      const metadata: BackupMetadata = {
        id: backupId,
        originalPath: path.resolve(filePath),
        backupPath,
        timestamp: new Date(),
        reason,
        user: context?.user,
        operation: context?.operation || 'manual',
        fileSize: stats.size,
        contentHash,
        compressed: this.compressionEnabled
      };

      // Write backup file
      const backupContent = this.compressionEnabled ? 
        await this.compressContent(content) : content;
      await fs.writeFile(backupPath, backupContent, 'utf8');

      // Write metadata
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');

      // Verify backup integrity
      if (this.hashVerification) {
        await this.verifyBackupIntegrity(backupPath, contentHash);
      }

      return backupPath;

    } catch (error) {
      throw new Error(`Failed to create backup for ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Restore a backup to the specified target
   */
  async restoreBackup(backupPath: string, targetPath: string): Promise<void> {
    try {
      // Load backup metadata
      const metadata = await this.loadBackupMetadata(backupPath);
      if (!metadata) {
        throw new Error(`Backup metadata not found for ${backupPath}`);
      }

      // Read backup content
      let content = await fs.readFile(backupPath, 'utf8');

      // Decompress if needed
      if (metadata.compressed) {
        content = await this.decompressContent(content);
      }

      // Verify content hash
      if (this.hashVerification) {
        const currentHash = this.calculateHash(content);
        if (currentHash !== metadata.contentHash) {
          throw new Error('Backup integrity verification failed');
        }
      }

      // Ensure target directory exists
      const targetDir = path.dirname(targetPath);
      await fs.mkdir(targetDir, { recursive: true });

      // Write restored content
      await fs.writeFile(targetPath, content, 'utf8');

      // Restore file permissions and timestamps
      const backupStats = await fs.stat(backupPath);
      await fs.utimes(targetPath, backupStats.atime, backupStats.mtime);

    } catch (error) {
      throw new Error(`Failed to restore backup ${backupPath} to ${targetPath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * List all backups, optionally filtered by original file
   */
  async listBackups(filePath?: string): Promise<string[]> {
    try {
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files.filter(file => file.endsWith('.md'));

      if (filePath) {
        // Filter backups for specific file
        const targetPath = path.resolve(filePath);
        const filteredBackups: string[] = [];

        for (const backupFile of backupFiles) {
          const metadata = await this.loadBackupMetadata(path.join(this.backupDir, backupFile));
          if (metadata && metadata.originalPath === targetPath) {
            filteredBackups.push(path.join(this.backupDir, backupFile));
          }
        }

        return filteredBackups.sort((a, b) => {
          // Sort by timestamp (newest first)
          const metaA = await this.loadBackupMetadata(a);
          const metaB = await this.loadBackupMetadata(b);
          return (metaB?.timestamp.getTime() || 0) - (metaA?.timestamp.getTime() || 0);
        });
      }

      return backupFiles.map(file => path.join(this.backupDir, file));

    } catch (error) {
      throw new Error(`Failed to list backups: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Clean up old backups based on retention policy
   */
  async cleanupOldBackups(): Promise<number> {
    try {
      const files = await fs.readdir(this.backupDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);

      let cleanedCount = 0;

      for (const file of files) {
        if (file.endsWith('.meta.json')) {
          const metadataPath = path.join(this.backupDir, file);
          const backupPath = metadataPath.replace('.meta.json', '.md');

          try {
            const metadata = await this.loadBackupMetadata(backupPath);
            if (metadata && metadata.timestamp < cutoffDate) {
              // Delete both backup file and metadata
              await fs.unlink(backupPath).catch(() => {}); // Ignore if file doesn't exist
              await fs.unlink(metadataPath).catch(() => {}); // Ignore if file doesn't exist
              cleanedCount++;
            }
          } catch {
            // Skip corrupted metadata
          }
        }
      }

      return cleanedCount;

    } catch (error) {
      throw new Error(`Failed to cleanup old backups: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get backup statistics
   */
  async getBackupStats(): Promise<{
    totalBackups: number;
    totalSize: number;
    oldestBackup?: Date;
    newestBackup?: Date;
    filesByOriginalPath: Record<string, number>;
  }> {
    try {
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files.filter(file => file.endsWith('.md'));

      let totalSize = 0;
      let oldestTimestamp: Date | undefined;
      let newestTimestamp: Date | undefined;
      const filesByOriginalPath: Record<string, number> = {};

      for (const backupFile of backupFiles) {
        const backupPath = path.join(this.backupDir, backupFile);
        const metadata = await this.loadBackupMetadata(backupPath);

        if (metadata) {
          totalSize += metadata.fileSize;
          
          if (!oldestTimestamp || metadata.timestamp < oldestTimestamp) {
            oldestTimestamp = metadata.timestamp;
          }
          
          if (!newestTimestamp || metadata.timestamp > newestTimestamp) {
            newestTimestamp = metadata.timestamp;
          }

          filesByOriginalPath[metadata.originalPath] = 
            (filesByOriginalPath[metadata.originalPath] || 0) + 1;
        }
      }

      return {
        totalBackups: backupFiles.length,
        totalSize,
        oldestBackup: oldestTimestamp,
        newestBackup: newestTimestamp,
        filesByOriginalPath
      };

    } catch (error) {
      throw new Error(`Failed to get backup statistics: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Ensure backup directory exists
   */
  private async ensureBackupDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create backup directory: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate unique backup ID
   */
  private generateBackupId(filePath: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileHash = this.calculateHash(filePath).substring(0, 8);
    return `${timestamp}-${fileHash}`;
  }

  /**
   * Calculate SHA-256 hash of content
   */
  private calculateHash(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  }

  /**
   * Load backup metadata
   */
  private async loadBackupMetadata(backupPath: string): Promise<BackupMetadata | null> {
    try {
      const metadataPath = backupPath.replace('.md', '.meta.json');
      const metadataContent = await fs.readFile(metadataPath, 'utf8');
      const metadata = JSON.parse(metadataContent) as BackupMetadata;
      
      // Convert timestamp string back to Date object
      metadata.timestamp = new Date(metadata.timestamp);
      
      return metadata;
    } catch {
      return null;
    }
  }

  /**
   * Verify backup integrity
   */
  private async verifyBackupIntegrity(backupPath: string, expectedHash: string): Promise<void> {
    const content = await fs.readFile(backupPath, 'utf8');
    const actualHash = this.calculateHash(content);
    
    if (actualHash !== expectedHash) {
      throw new Error(`Backup integrity check failed for ${backupPath}`);
    }
  }

  /**
   * Compress content (simple implementation)
   */
  private async compressContent(content: string): Promise<string> {
    // For now, just return the content as-is
    // In a real implementation, you might use gzip or other compression
    return Buffer.from(content).toString('base64');
  }

  /**
   * Decompress content
   */
  private async decompressContent(compressedContent: string): Promise<string> {
    // For now, just decode base64
    // In a real implementation, you'd decompress according to the compression method
    return Buffer.from(compressedContent, 'base64').toString('utf8');
  }
}

/**
 * Create backup manager with configuration
 */
export const createBackupManager = (config: BackupConfig): BackupManager => {
  return new TaskBackupManager(config);
};