/**
 * Scar File Manager for JSONL scar file handling
 * Manages scar records in JSONL format with proper validation and error handling
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { ScarRecord } from './scar-context-types.js';

/**
 * Scar file manager configuration
 */
export interface ScarFileManagerConfig {
  /** Path to the scar file */
  filePath?: string;
  /** Whether to create the file if it doesn't exist */
  createIfMissing?: boolean;
  /** Maximum file size before rotation (in bytes) */
  maxFileSize?: number;
  /** Whether to validate records on read */
  validateOnRead?: boolean;
  /** Encoding for the file */
  encoding?: BufferEncoding;
}

/**
 * Scar file statistics
 */
export interface ScarFileStats {
  /** Total number of scar records */
  totalRecords: number;
  /** File size in bytes */
  fileSize: number;
  /** File path */
  filePath: string;
  /** Whether file exists */
  exists: boolean;
  /** Date of last modification */
  lastModified?: Date;
}

/**
 * Scar file operation result
 */
export interface ScarFileResult {
  /** Whether the operation was successful */
  success: boolean;
  /** Number of records affected */
  recordCount?: number;
  /** Any error message if operation failed */
  error?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Scar file manager for JSONL format handling
 */
export class ScarFileManager {
  private readonly config: Required<ScarFileManagerConfig>;
  private readonly filePath: string;

  constructor(config: ScarFileManagerConfig = {}) {
    this.config = {
      filePath: config.filePath || '.kanban/scars/scars.jsonl',
      createIfMissing: config.createIfMissing ?? true,
      maxFileSize: config.maxFileSize || 10 * 1024 * 1024, // 10MB
      validateOnRead: config.validateOnRead ?? true,
      encoding: config.encoding || 'utf8',
    };
    this.filePath = path.resolve(this.config.filePath);
  }

  /**
   * Load all scar records from the file
   */
  async loadScars(): Promise<ScarRecord[]> {
    try {
      // Check if file exists
      const exists = await this.fileExists();
      if (!exists) {
        return [];
      }

      const content = await fs.readFile(this.filePath, { encoding: this.config.encoding });
      const lines = content.split('\n').filter((line) => line.trim().length > 0);

      const scars: ScarRecord[] = [];

      for (const line of lines) {
        try {
          const scar = JSON.parse(line) as ScarRecord;

          // Validate record structure
          if (this.config.validateOnRead && !this.validateScarRecord(scar)) {
            console.warn(`Invalid scar record found in ${this.filePath}: ${line}`);
            continue;
          }

          // Convert timestamp to Date object
          if (typeof scar.timestamp === 'string') {
            scar.timestamp = new Date(scar.timestamp);
          }

          // Validate timestamp
          if (isNaN(scar.timestamp.getTime())) {
            console.warn(`Invalid timestamp in scar record: ${scar.timestamp}`);
            continue;
          }

          scars.push(scar);
        } catch (error) {
          console.warn(`Failed to parse scar record line: ${line}`, error);
        }
      }

      return scars;
    } catch (error) {
      throw new Error(`Failed to load scar records: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Add a new scar record to the file
   */
  async addScar(scar: ScarRecord): Promise<ScarFileResult> {
    try {
      // Validate scar record
      if (!this.validateScarRecord(scar)) {
        return {
          success: false,
          error: 'Invalid scar record structure',
        };
      }

      // Ensure file exists
      await this.ensureFile();

      // Prepare record for storage
      const storageRecord = {
        ...scar,
        timestamp: scar.timestamp.toISOString(),
      };

      // Append to file
      const line = JSON.stringify(storageRecord) + '\n';
      await fs.appendFile(this.filePath, line, { encoding: this.config.encoding });

      // Check if file rotation is needed
      await this.checkFileRotation();

      return {
        success: true,
        recordCount: 1,
        metadata: {
          addedAt: new Date().toISOString(),
          recordSize: line.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to add scar record: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Add multiple scar records
   */
  async addScars(scars: ScarRecord[]): Promise<ScarFileResult> {
    if (scars.length === 0) {
      return { success: true, recordCount: 0 };
    }

    try {
      // Validate all records
      const validScars = scars.filter((scar) => this.validateScarRecord(scar));
      if (validScars.length !== scars.length) {
        return {
          success: false,
          error: `Invalid scar records: ${scars.length - validScars.length} records failed validation`,
        };
      }

      // Ensure file exists
      await this.ensureFile();

      // Prepare records for storage
      const lines = validScars.map((scar) => {
        const storageRecord = {
          ...scar,
          timestamp: scar.timestamp.toISOString(),
        };
        return JSON.stringify(storageRecord);
      });

      // Append to file
      const content = lines.join('\n') + '\n';
      await fs.appendFile(this.filePath, content, { encoding: this.config.encoding });

      // Check if file rotation is needed
      await this.checkFileRotation();

      return {
        success: true,
        recordCount: validScars.length,
        metadata: {
          addedAt: new Date().toISOString(),
          totalSize: content.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to add scar records: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Get scar file statistics
   */
  async getStats(): Promise<ScarFileStats> {
    try {
      const exists = await this.fileExists();
      
      if (!exists) {
        return {
          totalRecords: 0,
          fileSize: 0,
          filePath: this.filePath,
          exists: false,
        };
      }

      const stats = await fs.stat(this.filePath);
      const scars = await this.loadScars();

      return {
        totalRecords: scars.length,
        fileSize: stats.size,
        filePath: this.filePath,
        exists: true,
        lastModified: stats.mtime,
      };
    } catch (error) {
      return {
        totalRecords: 0,
        fileSize: 0,
        filePath: this.filePath,
        exists: false,
      };
    }
  }

  /**
   * Search scar records by criteria
   */
  async searchScars(criteria: {
    tagPattern?: string;
    dateRange?: { start?: Date; end?: Date };
    storyContains?: string;
    limit?: number;
  }): Promise<ScarRecord[]> {
    const scars = await this.loadScars();
    let filteredScars = [...scars];

    // Apply filters
    if (criteria.tagPattern) {
      const pattern = new RegExp(criteria.tagPattern, 'i');
      filteredScars = filteredScars.filter((scar) => pattern.test(scar.tag));
    }

    if (criteria.dateRange) {
      const { start, end } = criteria.dateRange;
      if (start) {
        filteredScars = filteredScars.filter((scar) => scar.timestamp >= start);
      }
      if (end) {
        filteredScars = filteredScars.filter((scar) => scar.timestamp <= end);
      }
    }

    if (criteria.storyContains) {
      const searchTerm = criteria.storyContains.toLowerCase();
      filteredScars = filteredScars.filter((scar) => 
        scar.story.toLowerCase().includes(searchTerm)
      );
    }

    // Sort by timestamp (newest first)
    filteredScars.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply limit
    if (criteria.limit && criteria.limit > 0) {
      filteredScars = filteredScars.slice(0, criteria.limit);
    }

    return filteredScars;
  }

  /**
   * Remove scar records by criteria
   */
  async removeScars(criteria: {
    olderThan?: Date;
    tagPattern?: string;
    limit?: number;
  }): Promise<ScarFileResult> {
    try {
      const scars = await this.loadScars();
      let scarsToKeep = [...scars];

      // Apply filters for removal
      if (criteria.olderThan) {
        scarsToKeep = scarsToKeep.filter((scar) => scar.timestamp >= criteria.olderThan!);
      }

      if (criteria.tagPattern) {
        const pattern = new RegExp(criteria.tagPattern, 'i');
        scarsToKeep = scarsToKeep.filter((scar) => !pattern.test(scar.tag));
      }

      // Apply limit (keep most recent)
      if (criteria.limit && criteria.limit > 0) {
        scarsToKeep.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        scarsToKeep = scarsToKeep.slice(0, criteria.limit);
      }

      // Rewrite file with remaining scars
      await this.rewriteFile(scarsToKeep);

      const removedCount = scars.length - scarsToKeep.length;

      return {
        success: true,
        recordCount: removedCount,
        metadata: {
          remaining: scarsToKeep.length,
          removed: removedCount,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to remove scar records: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Validate scar file format
   */
  async validateFile(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      const exists = await this.fileExists();
      if (!exists) {
        errors.push('Scar file does not exist');
        return { valid: false, errors };
      }

      const content = await fs.readFile(this.filePath, { encoding: this.config.encoding });
      const lines = content.split('\n');

      let lineNumber = 0;
      for (const line of lines) {
        lineNumber++;

        if (line.trim().length === 0) continue;

        try {
          const scar = JSON.parse(line) as ScarRecord;
          
          if (!this.validateScarRecord(scar)) {
            errors.push(`Invalid scar record at line ${lineNumber}`);
          }
        } catch (parseError) {
          errors.push(`Invalid JSON at line ${lineNumber}: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
        }
      }

      return { valid: errors.length === 0, errors };
    } catch (error) {
      errors.push(`Failed to validate file: ${error instanceof Error ? error.message : String(error)}`);
      return { valid: false, errors };
    }
  }

  /**
   * Ensure the scar file exists
   */
  async ensureFile(): Promise<void> {
    if (!this.config.createIfMissing) {
      return;
    }

    const exists = await this.fileExists();
    if (!exists) {
      // Create directory if it doesn't exist
      const dir = path.dirname(this.filePath);
      await fs.mkdir(dir, { recursive: true });

      // Create empty file
      await fs.writeFile(this.filePath, '', { encoding: this.config.encoding });
    }
  }

  /**
   * Check if file exists
   */
  private async fileExists(): Promise<boolean> {
    try {
      await fs.access(this.filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate scar record structure
   */
  private validateScarRecord(scar: any): scar is ScarRecord {
    return (
      scar &&
      typeof scar === 'object' &&
      typeof scar.start === 'string' &&
      typeof scar.end === 'string' &&
      typeof scar.tag === 'string' &&
      typeof scar.story === 'string' &&
      scar.timestamp && (typeof scar.timestamp === 'string' || scar.timestamp instanceof Date)
    );
  }

  /**
   * Check if file rotation is needed
   */
  private async checkFileRotation(): Promise<void> {
    try {
      const stats = await fs.stat(this.filePath);
      if (stats.size > this.config.maxFileSize) {
        await this.rotateFile();
      }
    } catch (error) {
      console.warn('Failed to check file rotation:', error);
    }
  }

  /**
   * Rotate the scar file
   */
  private async rotateFile(): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const rotatedPath = `${this.filePath}.${timestamp}`;
      
      // Move current file to rotated name
      await fs.rename(this.filePath, rotatedPath);
      
      // Create new empty file
      await fs.writeFile(this.filePath, '', { encoding: this.config.encoding });
      
      console.log(`Scar file rotated to: ${rotatedPath}`);
    } catch (error) {
      console.warn('Failed to rotate scar file:', error);
    }
  }

  /**
   * Rewrite the entire file with given scars
   */
  private async rewriteFile(scars: ScarRecord[]): Promise<void> {
    const lines = scars.map((scar) => {
      const storageRecord = {
        ...scar,
        timestamp: scar.timestamp.toISOString(),
      };
      return JSON.stringify(storageRecord);
    });

    const content = lines.join('\n') + (lines.length > 0 ? '\n' : '');
    await fs.writeFile(this.filePath, content, { encoding: this.config.encoding });
  }
}

/**
 * Create a scar file manager
 */
export function createScarFileManager(config?: ScarFileManagerConfig): ScarFileManager {
  return new ScarFileManager(config);
}