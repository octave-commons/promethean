/**
 * Scar File Manager for JSONL scar file handling
 * Manages scar records in JSONL format with proper validation and error handling
 */
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
export declare class ScarFileManager {
    private readonly config;
    private readonly filePath;
    constructor(config?: ScarFileManagerConfig);
    /**
     * Load all scar records from the file
     */
    loadScars(): Promise<ScarRecord[]>;
    /**
     * Add a new scar record to the file
     */
    addScar(scar: ScarRecord): Promise<ScarFileResult>;
    /**
     * Add multiple scar records
     */
    addScars(scars: ScarRecord[]): Promise<ScarFileResult>;
    /**
     * Get scar file statistics
     */
    getStats(): Promise<ScarFileStats>;
    /**
     * Search scar records by criteria
     */
    searchScars(criteria: {
        tagPattern?: string;
        dateRange?: {
            start?: Date;
            end?: Date;
        };
        storyContains?: string;
        limit?: number;
    }): Promise<ScarRecord[]>;
    /**
     * Remove scar records by criteria
     */
    removeScars(criteria: {
        olderThan?: Date;
        tagPattern?: string;
        limit?: number;
    }): Promise<ScarFileResult>;
    /**
     * Validate scar file format
     */
    validateFile(): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    /**
     * Ensure the scar file exists
     */
    ensureFile(): Promise<void>;
    /**
     * Check if file exists
     */
    private fileExists;
    /**
     * Validate scar record structure
     */
    private validateScarRecord;
    /**
     * Check if file rotation is needed
     */
    private checkFileRotation;
    /**
     * Rotate the scar file
     */
    private rotateFile;
    /**
     * Rewrite the entire file with given scars
     */
    private rewriteFile;
}
/**
 * Create a scar file manager
 */
export declare function createScarFileManager(config?: ScarFileManagerConfig): ScarFileManager;
//# sourceMappingURL=scar-file-manager.d.ts.map