/**
 * File System Migration Adapter
 *
 * This module migrates the file-system indexer to use the unified indexing API.
 * It provides backward compatibility while transitioning to the unified approach.
 */

import type { UnifiedIndexingClient } from '@promethean-os/persistence';
import type { IndexableContent } from '@promethean-os/persistence';
import { transformIndexedFile } from '@promethean-os/persistence';

import { readFile, stat } from 'node:fs/promises';
import { basename, extname } from 'node:path';

/**
 * File indexing options
 */
export type FileIndexingOptions = {
    batchSize?: number;
    excludePatterns?: string[];
    includePatterns?: string[];
    followSymlinks?: boolean;
    maxDepth?: number;
};

/**
 * File indexing statistics
 */
export type FileIndexingStats = {
    totalFiles: number;
    indexedFiles: number;
    skippedFiles: number;
    errors: string[];
    duration: number;
};

/**
 * File index entry
 */
export type FileIndexEntry = {
    id: string;
    filePath: string;
    fileName: string;
    content: string;
    fileSize: number;
    lastModified: Date;
    fileType: string;
    metadata: any;
};

/**
 * File search result
 */
export type FileSearchResult = {
    entry: FileIndexEntry;
    score: number;
    highlights: string[];
};

/**
 * Migrated file indexer that uses the unified indexing API
 */
export class UnifiedFileIndexer {
    private unifiedClient: UnifiedIndexingClient;

    constructor(unifiedClient: UnifiedIndexingClient) {
        this.unifiedClient = unifiedClient;
    }

    /**
     * Index a directory using the unified API
     */
    async indexDirectory(directoryPath: string, options: FileIndexingOptions = {}): Promise<FileIndexingStats> {
        const startTime = Date.now();
        const stats: FileIndexingStats = {
            totalFiles: 0,
            indexedFiles: 0,
            skippedFiles: 0,
            errors: [],
            duration: 0,
        };

        try {
            const files = await this.scanDirectory(directoryPath, options);
            stats.totalFiles = files.length;

            // Convert files to unified content format
            const unifiedContents: IndexableContent[] = [];

            for (const filePath of files) {
                try {
                    const fileEntry = await this.createFileIndexEntry(filePath, options);
                    const unifiedContent = transformIndexedFile(
                        {
                            path: fileEntry.filePath,
                            content: fileEntry.content,
                        },
                        {
                            type: 'file',
                            source: 'filesystem',
                            path: fileEntry.filePath,
                            fileSize: fileEntry.fileSize,
                            fileType: fileEntry.fileType,
                            lastModified: fileEntry.lastModified.getTime(),
                            ...options,
                        } as any,
                    );

                    unifiedContents.push(unifiedContent);
                    stats.indexedFiles++;
                } catch (error) {
                    stats.skippedFiles++;
                    stats.errors.push(`${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }

            // Batch index using the unified API
            if (unifiedContents.length > 0) {
                await this.unifiedClient.indexBatch(unifiedContents, {
                    validate: true,
                    batchSize: options.batchSize || 50,
                });
            }
        } catch (error) {
            stats.errors.push(`Directory scanning failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        stats.duration = Date.now() - startTime;
        return stats;
    }

    /**
     * Index a single file using the unified API
     */
    async indexFile(filePath: string, options: FileIndexingOptions = {}): Promise<FileIndexEntry> {
        // Create unified content
        const fileEntry = await this.createFileIndexEntry(filePath, options);
        const unifiedContent = transformIndexedFile(
            {
                path: fileEntry.filePath,
                content: fileEntry.content,
            },
            {
                type: 'file',
                source: 'filesystem',
                path: fileEntry.filePath,
                fileSize: fileEntry.fileSize,
                fileType: fileEntry.fileType,
                lastModified: fileEntry.lastModified.getTime(),
                ...options,
            } as any,
        );

        // Index using the unified API
        await this.unifiedClient.index(unifiedContent, {
            validate: true,
        });

        return fileEntry;
    }

    /**
     * Search files using the unified API
     */
    async search(query: string, limit: number = 10): Promise<FileSearchResult[]> {
        const unifiedResults = await this.unifiedClient.search({
            query,
            limit,
            type: 'file',
            includeContent: true,
        });

        // Convert back to file system format
        return unifiedResults.results.map((result) => ({
            entry: {
                id: result.content.id,
                filePath: (result.content.metadata as any)?.path || '',
                fileName: (result.content.metadata as any)?.fileName || '',
                content: result.content.content,
                fileSize: (result.content.metadata as any)?.fileSize || 0,
                lastModified: new Date(result.content.timestamp),
                fileType: (result.content.metadata as any)?.fileType || 'unknown',
                metadata: result.content.metadata,
            },
            score: result.score,
            highlights: result.highlights || [],
        }));
    }

    /**
     * Get file by path using the unified API
     */
    async getFileByPath(filePath: string): Promise<FileIndexEntry | null> {
        // Search by file path in metadata
        const searchResults = await this.unifiedClient.search({
            limit: 1000,
            type: 'file',
            metadata: { path: filePath },
        });

        const result = searchResults.results.find((r) => (r.content.metadata as any)?.path === filePath);

        if (!result) return null;

        return {
            id: result.content.id,
            filePath: (result.content.metadata as any)?.path || '',
            fileName: (result.content.metadata as any)?.fileName || '',
            content: result.content.content,
            fileSize: (result.content.metadata as any)?.fileSize || 0,
            lastModified: new Date(result.content.timestamp),
            fileType: (result.content.metadata as any)?.fileType || 'unknown',
            metadata: result.content.metadata,
        };
    }

    /**
     * Get recent files using the unified API
     */
    async getRecentFiles(limit: number = 10): Promise<FileIndexEntry[]> {
        const searchResults = await this.unifiedClient.search({
            limit,
            type: 'file',
            includeContent: true,
        });

        return searchResults.results.map((result) => ({
            id: result.content.id,
            filePath: (result.content.metadata as any)?.path || '',
            fileName: (result.content.metadata as any)?.fileName || '',
            content: result.content.content,
            fileSize: (result.content.metadata as any)?.fileSize || 0,
            lastModified: new Date(result.content.timestamp),
            fileType: (result.content.metadata as any)?.fileType || 'unknown',
            metadata: result.content.metadata,
        }));
    }

    /**
     * Remove file using the unified API
     */
    async removeFile(filePath: string): Promise<boolean> {
        const fileEntry = await this.getFileByPath(filePath);
        if (!fileEntry) return false;

        return await this.unifiedClient.delete(fileEntry.id);
    }

    /**
     * Get statistics using the unified API
     */
    async getStats(): Promise<{
        totalFiles: number;
        totalSize: number;
        fileTypes: Record<string, number>;
    }> {
        const fileStats = await this.unifiedClient.getByType('file');

        const fileTypes: Record<string, number> = {};
        let totalSize = 0;

        for (const file of fileStats) {
            const fileType = (file.metadata as any)?.fileType || 'unknown';
            fileTypes[fileType] = (fileTypes[fileType] || 0) + 1;
            totalSize += (file.metadata as any)?.fileSize || 0;
        }

        return {
            totalFiles: fileStats.length,
            totalSize,
            fileTypes,
        };
    }

    /**
     * Create a file index entry
     */
    private async createFileIndexEntry(filePath: string, options: FileIndexingOptions = {}): Promise<FileIndexEntry> {
        // Basic path validation
        if (filePath.includes('..')) {
            throw new Error('Invalid file path: directory traversal not allowed');
        }

        const fileStats = await stat(filePath);
        const content = await readFile(filePath, 'utf-8');

        return {
            id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            filePath,
            fileName: basename(filePath),
            content,
            fileSize: fileStats.size,
            lastModified: fileStats.mtime,
            fileType: extname(filePath).toLowerCase().slice(1) || 'unknown',
            metadata: {
                indexedAt: new Date(),
                ...options,
            },
        };
    }

    /**
     * Scan a directory
     */
    private async scanDirectory(directoryPath: string, options: FileIndexingOptions = {}): Promise<string[]> {
        // Simple directory scanning for now - using Node.js fs as fallback
        try {
            const { readdir } = await import('node:fs/promises');
            const { join } = await import('node:path');

            const entries = await readdir(directoryPath, { withFileTypes: true });
            const files: string[] = [];

            for (const entry of entries) {
                if (entry.isFile()) {
                    const fullPath = join(directoryPath, entry.name);
                    if (this.shouldIncludeFile(fullPath, options)) {
                        files.push(fullPath);
                    }
                }
            }

            return files;
        } catch (error) {
            console.warn('Failed to scan directory:', error);
            return [];
        }
    }

    /**
     * Check if a file should be included
     */
    private shouldIncludeFile(filePath: string, options: FileIndexingOptions): boolean {
        const fileName = basename(filePath);
        const fileExt = extname(filePath).toLowerCase();

        // Check exclude patterns
        if (options.excludePatterns) {
            for (const pattern of options.excludePatterns) {
                if (fileName.includes(pattern) || filePath.includes(pattern)) {
                    return false;
                }
            }
        }

        // Check include patterns (if specified)
        if (options.includePatterns && options.includePatterns.length > 0) {
            return options.includePatterns.some(
                (pattern) => fileName.includes(pattern) || fileExt.includes(pattern) || filePath.includes(pattern),
            );
        }

        // Default exclude common non-text files
        const excludeExtensions = ['.exe', '.dll', '.so', '.dylib', '.bin', '.img', '.iso'];
        if (excludeExtensions.includes(fileExt)) {
            return false;
        }

        return true;
    }
}

/**
 * Factory function to create a unified file indexer
 */
export function createUnifiedFileIndexer(unifiedClient: UnifiedIndexingClient): UnifiedFileIndexer {
    return new UnifiedFileIndexer(unifiedClient);
}
