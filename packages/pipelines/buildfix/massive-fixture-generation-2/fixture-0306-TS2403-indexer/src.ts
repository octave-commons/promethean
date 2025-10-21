import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { listFilesRec } from '@promethean/utils/list-files-rec.js';
import { parseFrontmatter } from '@promethean/markdown/frontmatter';

import type { IndexedTask, TaskFM } from './types.js';
import type { KanbanConfig, ReadonlySetLike } from './config/shared.js';
import { loadKanbanConfig } from './config.js';
import type { TaskCache, TaskCacheOptions } from './task-cache.js';

const toTrimmedString = (value: unknown, fallback = ''): string => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

const toOptionalString = (value: unknown): string | undefined => {
  const trimmed = toTrimmedString(value);
  return trimmed.length > 0 ? trimmed : undefined;
};

const toLabelArray = (value: unknown): ReadonlyArray<string> => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => toTrimmedString(entry))
      .filter((entry): entry is string => entry.length > 0);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((entry) => toTrimmedString(entry))
      .filter((entry): entry is string => entry.length > 0);
  }
  return [];
};

const normalizeTask = (
  data: Readonly<Record<string, unknown>>,
  filePath: string,
  repoRoot: string,
  content?: string,
): IndexedTask => {
  const rawId =
    (data as { readonly id?: unknown }).id ?? (data as { readonly uuid?: unknown }).uuid;
  const rawCreated =
    (data as { readonly created?: unknown }).created ??
    (data as { readonly created_at?: unknown }).created_at;
  const id = toTrimmedString(rawId);
  const title = toTrimmedString(data.title, path.basename(filePath, '.md'));
  const status = toTrimmedString(data.status) as TaskFM['status'];
  const priority = toTrimmedString(data.priority) as TaskFM['priority'];
  const owner = toTrimmedString(data.owner);
  const labels = toLabelArray(data.labels);
  const created = toTrimmedString(rawCreated);
  const updated = toOptionalString((data as { readonly updated?: unknown }).updated);
  
  // Extract estimates if present
  const estimates = (data as { readonly estimates?: unknown }).estimates;
  const normalizedEstimates = estimates && typeof estimates === 'object' ? estimates : undefined;
  const rel = path.relative(repoRoot, filePath);
  const base: TaskFM = Object.freeze({
    id,
    title,
    status,
    priority,
    owner,
    labels,
    created,
    uuid: toOptionalString((data as { readonly uuid?: unknown }).uuid),
    created_at: toOptionalString((data as { readonly created_at?: unknown }).created_at),
    estimates: normalizedEstimates,
  });
  const fm: TaskFM = typeof updated === 'string' ? Object.freeze({ ...base, updated }) : base;
  return Object.freeze({ ...fm, path: rel, content }) satisfies IndexedTask;
};

const sortTasksById = (tasks: readonly IndexedTask[]): ReadonlyArray<IndexedTask> =>
  Object.freeze([...tasks].sort((a, b) => a.id.localeCompare(b.id)));

export type IndexTasksOptions = Readonly<{
  readonly tasksDir: string;
  readonly exts: ReadonlySetLike<string>;
  readonly repoRoot: string;
}>;

export const indexTasks = async ({
  tasksDir,
  exts,
  repoRoot,
}: IndexTasksOptions): Promise<ReadonlyArray<IndexedTask>> => {
  const files = await listFilesRec(tasksDir, new Set(exts));

  // Process files in batches to avoid memory exhaustion with 405+ tasks
  const batchSize = 50;
  const allTasks: IndexedTask[] = [];

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);

    const batchTasks = await Promise.all(
      batch.map(async (filePath) => {
        try {
          const raw = await readFile(filePath, 'utf8');
          const parsed = parseFrontmatter<Readonly<Record<string, unknown>>>(raw);
          return normalizeTask(parsed.data ?? {}, filePath, repoRoot, parsed.content);
        } catch (error) {
          console.error(`Failed to process ${filePath}:`, error);
          return null;
        }
      }),
    );

    // Filter out null results and add to results
    const validTasks = batchTasks.filter((task): task is IndexedTask => task !== null);
    allTasks.push(...validTasks);

    // Allow garbage collection between batches
    if (i + batchSize < files.length) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  return sortTasksById(allTasks);
};

export const serializeTasks = (tasks: ReadonlyArray<IndexedTask>): ReadonlyArray<string> => {
  // Process in batches to avoid memory spikes with large task arrays
  const batchSize = 100;
  const result: string[] = [];

  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    const batchSerialized = batch.map((task) => JSON.stringify(task));
    result.push(...batchSerialized);

    // Allow garbage collection between batches
    if (i + batchSize < tasks.length) {
      // Force sync to allow GC
      if (global.gc) {
        global.gc();
      }
    }
  }

  return Object.freeze(result);
};

export const refreshTaskIndex = async (
  config: Readonly<KanbanConfig>,
): Promise<ReadonlyArray<IndexedTask>> => {
  const tasks = await indexTasks({
    tasksDir: config.tasksDir,
    exts: config.exts,
    repoRoot: config.repo,
  });
  const lines = serializeTasks(tasks);
  await writeFile(config.indexFile, `${lines.join('\n')}\n`, 'utf8');
  return tasks;
};
export const writeIndexFile = async (
  indexFilePath: string,
  lines: ReadonlyArray<string>,
): Promise<void> => {
  await writeFile(indexFilePath, `${lines.join('\n')}\n`, 'utf8');
};

/**
 * Get default cache path based on config
 */
const getDefaultCachePath = (config: KanbanConfig): string => {
  return path.join(path.dirname(config.indexFile), '.cache');
};

/**
 * Create task cache options from kanban config
 */
export const createTaskCacheOptions = (
  config: KanbanConfig,
  overrides?: Partial<TaskCacheOptions>,
): TaskCacheOptions => ({
  path: overrides?.path ?? getDefaultCachePath(config),
  namespace: overrides?.namespace ?? 'kanban',
  defaultTtlMs: overrides?.defaultTtlMs ?? 24 * 60 * 60 * 1000, // 24 hours
  ...overrides,
});

/**
 * Index tasks into cache with streaming support
 */
export const indexTasksToCache = async (
  options: Readonly<{
    readonly tasksDir: string;
    readonly exts: ReadonlySetLike<string>;
    readonly repoRoot: string;
    readonly cache: TaskCache;
  }>,
): Promise<{ indexed: number; cache: TaskCache }> => {
  const { tasksDir, exts, repoRoot, cache } = options;

  // Clear existing cache to ensure clean rebuild
  await cache.rebuildIndex();

  // Stream tasks from filesystem to avoid memory overload
  const files = await listFilesRec(tasksDir, new Set(exts));
  let indexedCount = 0;

  // Process files in batches to avoid memory issues
  const batchSize = 50;
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);

    const batchTasks = await Promise.all(
      batch.map(async (filePath) => {
        try {
          const raw = await readFile(filePath, 'utf8');
          const parsed = parseFrontmatter<Readonly<Record<string, unknown>>>(raw);
          return normalizeTask(parsed.data ?? {}, filePath, repoRoot, parsed.content);
        } catch (error) {
          console.error(`Failed to process ${filePath}:`, error);
          return null;
        }
      }),
    );

    // Filter out null results and index valid tasks
    const validTasks = batchTasks.filter((task): task is IndexedTask => task !== null);

    for (const task of validTasks) {
      await cache.setTask(task);
      indexedCount++;
    }

    // Optional: yield progress for large operations
    if (i > 0 && i % (batchSize * 10) === 0) {
      console.log(`Indexed ${indexedCount}/${files.length} tasks...`);
    }
  }

  return { indexed: indexedCount, cache };
};

/**
 * Migrate existing JSONL index to TaskCache
 */
export const migrateJsonlToCache = async (
  config: KanbanConfig,
  cache: TaskCache,
): Promise<{ migrated: number; errors: string[] }> => {
  const errors: string[] = [];
  let migrated = 0;

  try {
    // Check if JSONL index exists
    const raw = await readFile(config.indexFile, 'utf8').catch(() => null);
    if (!raw) {
      return { migrated: 0, errors: ['No existing JSONL index found'] };
    }

    // Parse JSONL lines
    const lines = raw
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .map((line) => {
        try {
          return JSON.parse(line) as IndexedTask;
        } catch (error) {
          errors.push(`Invalid JSON line: ${line.substring(0, 100)}...`);
          return null;
        }
      })
      .filter((task): task is IndexedTask => task !== null);

    // Migrate tasks to cache
    for (const task of lines) {
      try {
        await cache.setTask(task);
        migrated++;
      } catch (error) {
        errors.push(
          `Failed to migrate task ${task.uuid}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    console.log(`Migrated ${migrated} tasks from JSONL to cache`);
  } catch (error) {
    errors.push(`Migration failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  return { migrated, errors };
};

export const runIndexer = async (
  options?: Readonly<{
    readonly argv?: ReadonlyArray<string>;
    readonly env?: NodeJS.ProcessEnv;
  }>,
): Promise<ReadonlyArray<IndexedTask>> => {
  const { config, restArgs } = await loadKanbanConfig(options);
  const args = new Set(restArgs);
  const shouldWrite = args.has('--write');
  const useCache = args.has('--cache');

  if (useCache) {
    // Use new cache-based indexing
    console.log('Using cache-based indexing...');

    const { createTaskCache } = await import('./task-cache.js');
    const cache = await createTaskCache(createTaskCacheOptions(config));

    const result = await indexTasksToCache({
      tasksDir: config.tasksDir,
      exts: config.exts,
      repoRoot: config.repo,
      cache,
    });

    console.log(`Indexed ${result.indexed} tasks to cache`);
    await cache.close();
    return [];
  }

  const tasks = await indexTasks({
    tasksDir: config.tasksDir,
    exts: config.exts,
    repoRoot: config.repo,
  });
  const lines = serializeTasks(tasks);
  if (shouldWrite) {
    await writeIndexFile(config.indexFile, lines);
    console.log(`Wrote ${tasks.length} tasks to ${path.relative(config.repo, config.indexFile)}`);
    return tasks;
  }
  lines.forEach((line) => {
    console.log(line);
  });
  return tasks;
};

const isCliExecution = (): boolean => {
  const entry = process.argv[1];
  if (typeof entry !== 'string' || entry.length === 0) {
    return false;
  }
  const modulePath = fileURLToPath(import.meta.url);
  return path.resolve(entry) === modulePath;
};

if (isCliExecution()) {
  runIndexer().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

undefinedVariable;