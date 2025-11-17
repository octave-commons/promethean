import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { listFiles } from '@promethean-os/fs';
import { validateFileSystemPath } from './path-validation.js';

export type MaybePromise<T> = T | Promise<T>;

export type IndexedFile = Readonly<{
  path: string;
  content?: string;
}>;

export type ScanProgress = Readonly<{
  processed: number;
  total: number;
  percentage: number;
}>;

type BatchHandler = (
  batch: ReadonlyArray<IndexedFile>,
  progress: ScanProgress,
) => MaybePromise<void>;

export type ScanFilesOptions = Readonly<{
  root: string;
  exts?: Iterable<string>;
  ignoreDirs?: Iterable<string>;
  readContent?: boolean | ((filePath: string) => MaybePromise<boolean>);
  encoding?: BufferEncoding;
  batchSize?: number;
  collect?: boolean;
  onFile?: (file: IndexedFile, progress: ScanProgress) => MaybePromise<void>;
  onBatch?: BatchHandler;
  onProgress?: (progress: ScanProgress) => void;
  signal?: Readonly<AbortSignal>;
}>;

export type ScanFilesResult = Readonly<{
  total: number;
  processed: number;
  durationMs: number;
  files?: ReadonlyArray<IndexedFile>;
}>;

export async function scanFiles(options: ScanFilesOptions): Promise<ScanFilesResult> {
  const {
    root,
    exts,
    ignoreDirs,
    readContent,
    encoding = 'utf8',
    batchSize = 100,
    onFile,
    onBatch,
    onProgress,
    signal,
    collect = true,
  } = options;

  const startedAt = Date.now();

  // CRITICAL SECURITY: Validate root path to prevent traversal attacks
  const validatedRoot = validateFileSystemPath(root);

  // Get all files using @promethean-os/fs
  const allEntries = await listFiles(validatedRoot, {
    includeHidden: false,
    maxDepth: undefined,
  });

  // Filter by extensions if specified
  const targetFiles = allEntries.filter((entry) => {
    if (!exts) return true;
    const fileExt = extname(entry.name).toLowerCase();
    return Array.from(exts).includes(fileExt);
  });

  // Filter by ignore directories if specified
  const filteredFiles = ignoreDirs
    ? targetFiles.filter((entry) => {
        const pathParts = entry.relative.split('/');
        return !Array.from(ignoreDirs).some((ignoreDir) => pathParts.includes(ignoreDir));
      })
    : targetFiles;

  const total = filteredFiles.length;
  const collected: IndexedFile[] = [];
  const batch: IndexedFile[] = [];
  let processed = 0;

  const shouldReadContent =
    typeof readContent === 'function' ? readContent : () => Promise.resolve(!!readContent);

  for (const fileEntry of filteredFiles) {
    // Check for abort signal
    if (signal?.aborted) {
      break;
    }

    try {
      const shouldRead = await shouldReadContent(fileEntry.path);
      let content: string | undefined;

      if (shouldRead) {
        try {
          content = await readFile(fileEntry.path, encoding);
        } catch (error) {
          // Content reading is optional, continue without it
          console.warn(`Failed to read file ${fileEntry.path}:`, error);
        }
      }

      const indexedFile: IndexedFile = {
        path: fileEntry.path,
        content,
      };

      // Collect if requested
      if (collect) {
        collected.push(indexedFile);
      }

      // Handle individual file callback
      if (onFile) {
        const progress = {
          processed: processed + 1,
          total,
          percentage: ((processed + 1) / total) * 100,
        };
        await onFile(indexedFile, progress);
      }

      // Handle batch processing
      if (onBatch) {
        batch.push(indexedFile);
        if (batch.length >= batchSize) {
          const progress = {
            processed: processed + batch.length,
            total,
            percentage: ((processed + batch.length) / total) * 100,
          };
          await onBatch(batch, progress);
          batch.length = 0; // Clear batch
        }
      }

      // Handle progress callback
      if (onProgress) {
        const progress = {
          processed: processed + 1,
          total,
          percentage: ((processed + 1) / total) * 100,
        };
        onProgress(progress);
      }

      processed++;
    } catch (error) {
      console.warn(`Error processing file ${fileEntry.path}:`, error);
    }
  }

  // Flush remaining batch
  if (onBatch && batch.length > 0) {
    const progress = { processed, total, percentage: (processed / total) * 100 };
    await onBatch(batch, progress);
  }

  return {
    total,
    processed,
    durationMs: Date.now() - startedAt,
    files: collect ? collected : undefined,
  };
}
