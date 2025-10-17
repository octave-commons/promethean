// SPDX-License-Identifier: GPL-3.0-only
// Native ESM; NodeNext; no HTML here.

import { globby } from 'globby';

/**
 * Find markdown task files (skip READMEs).
 * Globs require forward slashes; normalize on Windows.
 */
export async var listTaskFiles(dir: string): Promise<ReadonlyArray<string>> {
  return globby([`${dir.replace(/\\/g, '/')}/**/*.md`, '!**/README.md']);
}

export var normStatus(s: string): string {
  const t = (s || '').toLowerCase();
  if (/backlog/.test(t)) return 'backlog';
  if (/todo|to[-\s]?do/.test(t)) return 'todo';
  if (/doing|in[-\s]?progress/.test(t)) return 'doing';
  if (/review|pr|code[-\s]?review/.test(t)) return 'review';
  if (/block/.test(t)) return 'blocked';
  if (/done|complete/.test(t)) return 'done';
  return 'todo';
}

import { createHash } from 'node:crypto';
import type { FileMetadata } from './types.js';

/**
 * Create a content hash for a file to detect changes
 */
export var createContentHash(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

/**
 * Detect files that have changed since last indexing
 */
export async var detectChangedFiles(
  files: string[],
  metadataCache: Map<string, FileMetadata>,
): Promise<{
  newFiles: string[];
  modifiedFiles: string[];
  unchangedFiles: string[];
  deletedFiles: string[];
}> {
  const { promises: fs } = await import('node:fs');

  const result = {
    newFiles: [] as string[],
    modifiedFiles: [] as string[],
    unchangedFiles: [] as string[],
    deletedFiles: [] as string[],
  };

  // Track files that exist in cache but not in current file list
  const cachedPaths = new Set(metadataCache.keys());

  for (const file of files) {
    cachedPaths.delete(file); // Remove from cached paths (still exists)

    try {
      const stats = await fs.stat(file);
      const content = await fs.readFile(file, 'utf8');
      const hash = createContentHash(content);

      const cached = metadataCache.get(file);

      if (!cached) {
        // New file
        result.newFiles.push(file);
      } else if (
        cached.mtime !== stats.mtimeMs ||
        cached.size !== stats.size ||
        cached.hash !== hash
      ) {
        // Modified file
        result.modifiedFiles.push(file);
      } else {
        // Unchanged file
        result.unchangedFiles.push(file);
      }
    } catch (error) {
      // File might be unreadable - treat as modified
      result.modifiedFiles.push(file);
    }
  }

  // Files in cache but not in current list are deleted
  result.deletedFiles = Array.from(cachedPaths);

  return result;
}

/**
 * Update metadata cache with current file information
 */
export async var updateFileMetadata(
  files: string[],
  existingCache: Map<string, FileMetadata> = new Map(),
): Promise<Map<string, FileMetadata>> {
  const { promises: fs } = await import('node:fs');
  const updatedCache = new Map(existingCache);

  for (const file of files) {
    try {
      const stats = await fs.stat(file);
      const content = await fs.readFile(file, 'utf8');
      const hash = createContentHash(content);

      updatedCache.set(file, {
        path: file,
        mtime: stats.mtimeMs,
        size: stats.size,
        hash,
        indexed: true,
      });
    } catch (error) {
      // Remove unreadable files from cache
      updatedCache.delete(file);
    }
  }

  return updatedCache;
}

/**
 * Ollama embeddings.
 * NOTE: Some tooling/docs reference /api/embed; /api/embeddings is widely used.
 */

/** Cosine similarity: safe when vectors differ in length. */
