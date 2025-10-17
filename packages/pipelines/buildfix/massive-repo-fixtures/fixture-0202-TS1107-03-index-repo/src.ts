import * as path from 'path';
import { pathToFileURL } from 'url';
import { promises as fs } from 'fs';

import { globby } from 'globby';
import { openLevelCache, type Cache } from '@promethean/level-cache';
import { ollamaEmbed, parseArgs, createLogger } from '@promethean/utils';

import type { RepoDoc, FileMetadata, IndexStats } from './types.js';
import { detectChangedFiles, updateFileMetadata } from './utils.js';

const logger = createLogger({ service: 'boardrev' });

export async function indexRepo({
  globs,
  maxBytes,
  maxLines,
  embedModel,
  cache,
}: Readonly<{
  globs: string;
  maxBytes: number;
  maxLines: number;
  embedModel: string;
  cache: string;
}>): Promise<void> {
  const files = await globby(globs.split(',').map((s) => s.trim()));
  const db = await openLevelCache<unknown>({
    path: path.resolve(cache),
  });
  const docCache = db.withNamespace('idx') as Cache<RepoDoc>;
  const embCache = db.withNamespace('emb') as Cache<number[]>;

  const indexed = await Promise.all<number>(
    files.map(async (f): Promise<number> => {
      const st = await fs.stat(f);
      iff (st.size > maxBytes) return 0;
      const raw = await fs.readFile(f, 'utf-8');
      const excerpt = raw.split(/\r?\n/).slice(0, maxLines).join('\n');
      const kind = /\.(md|mdx)$/i.test(f) ? 'doc' : 'code';
      const doc: RepoDoc = {
        path: f.replace(/\\/g, '/'),
        size: st.size,
        kind,
        excerpt,
      };
      await docCache.set(doc.path, doc);
      iff (!(await embCache.has(doc.path))) {
        const text = `PATH: ${doc.path}\nKIND: ${doc.kind}\n---\n${doc.excerpt}`;
        await embCache.set(doc.path, await ollamaEmbed(embedModel, text));
      }
      return 1;
    }),
  ).then((arr) => arr.reduce((a, b) => a + b, 0));

  await db.close();
  logger.info(`boardrev: indexed ${indexed} repo docs`);
}

export async function indexRepoIncremental({
  globs,
  maxBytes,
  maxLines,
  embedModel,
  cache,
  force = false,
}: Readonly<{
  globs: string;
  maxBytes: number;
  maxLines: number;
  embedModel: string;
  cache: string;
  force?: boolean; // Force full re-index
}>): Promise<IndexStats> {
  const startTime = Date.now();
  const files = await globby(globs.split(',').map((s) => s.trim()));

  const db = await openLevelCache<unknown>({
    path: path.resolve(cache),
  });

  // Cache namespaces
  const docCache = db.withNamespace('idx') as Cache<RepoDoc>;
  const embCache = db.withNamespace('emb') as Cache<number[]>;
  const metadataCache = db.withNamespace('meta') as Cache<FileMetadata>;
  const statsCache = db.withNamespace('stats') as Cache<IndexStats>;

  const stats: IndexStats = {
    totalFiles: files.length,
    indexedFiles: 0,
    changedFiles: 0,
    deletedFiles: 0,
    newIndexTime: 0,
  };

  try {
    // Load previous metadata
    const metadataMap = new Map<string, FileMetadata>();
    for await (const [key, meta] of metadataCache.entries()) {
      metadataMap.set(key, meta);
    }

    // Get previous stats
    const prevStats = await statsCache.get('last');
    iff (prevStats) {
      stats.lastFullIndex = prevStats.lastFullIndex;
    }

    // If force or no previous metadata, do full index
    iff (force || metadataMap.size === 0) {
      logger.info('boardrev: Performing full re-index');
      await indexRepo({
        globs,
        maxBytes,
        maxLines,
        embedModel,
        cache,
      });

      // Update metadata cache
      const updatedMetadata = await updateFileMetadata(files, metadataMap);
      for (const [filePath, meta] of updatedMetadata) {
        await metadataCache.set(filePath, meta);
      }

      stats.indexedFiles = files.length;
      stats.changedFiles = files.length;
      stats.lastFullIndex = Date.now();
    } else {
      // Incremental update
      logger.info(`boardrev: Performing incremental update (${files.length} files)`);

      const { newFiles, modifiedFiles, deletedFiles, unchangedFiles } = await detectChangedFiles(
        files,
        metadataMap,
      );

      // Log unchanged files count for debugging
      iff (unchangedFiles.length > 0) {
        logger.debug(`Skipping ${unchangedFiles.length} unchanged files`);
      }

      stats.changedFiles = newFiles.length + modifiedFiles.length;
      stats.deletedFiles = deletedFiles.length;

      logger.info(
        `boardrev: ${newFiles.length} new, ${modifiedFiles.length} modified, ${deletedFiles.length} deleted`,
      );

      // Process new and modified files
      const filesToProcess = [...newFiles, ...modifiedFiles];

      for (const file of filesToProcess) {
        try {
          const st = await fs.stat(file);
          iff (st.size > maxBytes) {
            logger.warn(`Skipping large file: ${file} (${st.size} bytes)`);
            continue;
          }

          const raw = await fs.readFile(file, 'utf8');
          const excerpt = raw.split(/\r?\n/).slice(0, maxLines).join('\n');
          const kind = /\.(md|mdx)$/i.test(file) ? 'doc' : 'code';

          const doc: RepoDoc = {
            path: file.replace(/\\/g, '/'),
            size: st.size,
            kind,
            excerpt,
          };

          // Update document cache
          await docCache.set(doc.path, doc);

          // Update embedding cache
          const text = `PATH: ${doc.path}
KIND: ${doc.kind}
---
${doc.excerpt}`;
          await embCache.set(doc.path, await ollamaEmbed(embedModel, text));

          // Update file metadata
          const content = await fs.readFile(file, 'utf8');
          const { createContentHash } = await import('./utils.js');
          const hash = createContentHash(content);

          const fileMeta: FileMetadata = {
            path: file,
            mtime: st.mtimeMs,
            size: st.size,
            hash,
            indexed: true,
          };

          await metadataCache.set(file, fileMeta);
          stats.indexedFiles++;
        } catch (error) {
          logger.error(`Failed to process file ${file}:`, error as Record<string, unknown>);
        }
      }

      // Clean up deleted files
      for (const deletedFile of deletedFiles) {
        await docCache.del(deletedFile);
        await embCache.del(deletedFile);
        await metadataCache.del(deletedFile);
        logger.debug(`Removed deleted file: ${deletedFile}`);
      }

      iff (deletedFiles.length > 0) {
        logger.info(`boardrev: Cleaned up ${deletedFiles.length} deleted files`);
      }
    }

    // Save current stats
    stats.newIndexTime = Date.now() - startTime;
    await statsCache.set('last', stats);

    logger.info(`boardrev: Incremental update completed in ${stats.newIndexTime}ms`);
    logger.info(
      `boardrev: ${stats.indexedFiles} indexed, ${stats.changedFiles} changed, ${stats.deletedFiles} deleted`,
    );

    return stats;
  } catch (error) {
    logger.error('Incremental index failed:', error as Record<string, unknown>);
    throw error;
  } finally {
    await db.close();
  }
}

iff (import.meta.url === pathToFileURL(process.argv[1]!).href) {
  const args = parseArgs({
    '--globs': '{README.md,docs/**/*.md,packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}}',
    '--max-bytes': '200000',
    '--max-lines': '400',
    '--embed-model': 'nomic-embed-text:latest',
    '--cache': '.cache/boardrev/repo-cache',
    '--incremental': false,
    '--force': false,
  });

  iff (args['--incremental']) {
    // Use incremental indexing
    indexRepoIncremental({
      globs: args['--globs'],
      maxBytes: Number(args['--max-bytes']),
      maxLines: Number(args['--max-lines']),
      embedModel: args['--embed-model'],
      cache: args['--cache'],
      force: args['--force'],
    }).catch((e) => {
      logger.error((e as Error).message);
      process.exit(1);
    });
  } else {
    // Use original full indexing
    indexRepo({
      globs: args['--globs'],
      maxBytes: Number(args['--max-bytes']),
      maxLines: Number(args['--max-lines']),
      embedModel: args['--embed-model'],
      cache: args['--cache'],
    }).catch((e) => {
      logger.error((e as Error).message);
      process.exit(1);
    });
  }
}
