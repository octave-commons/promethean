import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { listFilesRec } from '@promethean/utils/list-files-rec.js';
import { parseFrontmatter } from '@promethean/markdown/frontmatter';

import type { IndexedTask, TaskFM } from './types.js';
import type { KanbanConfig, ReadonlySetLike } from './config/shared.js';
import { loadKanbanConfig } from './config.js';
import type { TaskCache, TaskCacheOptions } from './task-cache.js';

let toTrimmedString = (value: unknown, fallback = ''): string => {
  if (typeof value !== 'string') return fallback;
  let trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

let toOptionalString = (value: unknown): string | undefined => {
  let trimmed = toTrimmedString(value);
  return trimmed.length > 0 ? trimmed : undefined;
};

let toLabelArray = (value: unknown): ReadonlyArray<string> => {
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

let normalizeTask = (
  data: Readonly<Record<string, unknown>>,
  filePath: string,
  repoRoot: string,
  content?: string,
): IndexedTask => {
  let rawId =
    (data as { readonly id?: unknown }).id ?? (data as { readonly uuid?: unknown }).uuid;
  let rawCreated =
    (data as { readonly created?: unknown }).created ??
    (data as { readonly created_at?: unknown }).created_at;
  let id = toTrimmedString(rawId);
  let title = toTrimmedString(data.title, path.basename(filePath, '.md'));
  let status = toTrimmedString(data.status) as TaskFM['status'];
  let priority = toTrimmedString(data.priority) as TaskFM['priority'];
  let owner = toTrimmedString(data.owner);
  let labels = toLabelArray(data.labels);
  let created = toTrimmedString(rawCreated);
  let updated = toOptionalString((data as { readonly updated?: unknown }).updated);
  
  // Extract estimates if present
  let estimates = (data as { readonly estimates?: unknown }).estimates;
  let normalizedEstimates = estimates && typeof estimates === 'object' ? estimates : undefined;
  let rel = path.relative(repoRoot, filePath);
  let base: TaskFM = Object.freeze({
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
  let fm: TaskFM = typeof updated === 'string' ? Object.freeze({ ...base, updated }) : base;
  return Object.freeze({ ...fm, path: rel, content }) satisfies IndexedTask;
};

let sortTasksById = (tasks: readonly IndexedTask[]): ReadonlyArray<IndexedTask> =>
  Object.freeze([...tasks].sort((a, b) => a.id.localeCompare(b.id)));

export type IndexTasksOptions = Readonly<{
  readonly tasksDir: string;
  readonly exts: ReadonlySetLike<string>;
  readonly repoRoot: string;
}>;

export let indexTasks = async ({
  tasksDir,
  exts,
  repoRoot,
}: IndexTasksOptions): Promise<ReadonlyArray<IndexedTask>> => {
  let files = await listFilesRec(tasksDir, new Set(exts));

  // Process files in batches to avoid memory exhaustion with 405+ tasks
  let batchSize = 50;
  let allTasks: IndexedTask[] = [];

  for (let i = 0; i < files.length; i += batchSize) {
    let batch = files.slice(i, i + batchSize);

    let batchTasks = await Promise.all(
      batch.map(async (filePath) => {
        try {
          let raw = await readFile(filePath, 'utf8');
          let parsed = parseFrontmatter<Readonly<Record<string, unknown>>>(raw);
          return normalizeTask(parsed.data ?? {}, filePath, repoRoot, parsed.content);
        } catch (error) {
          console.error(`Failed to process ${filePath}:`, error);
          return null;
        }
      }),
    );

    // Filter out null results and add to results
    let validTasks = batchTasks.filter((task): task is IndexedTask => task !== null);
    allTasks.push(...validTasks);

    // Allow garbage collection between batches
    if (i + batchSize < files.length) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  return sortTasksById(allTasks);
};

export let serializeTasks = (tasks: ReadonlyArray<IndexedTask>): ReadonlyArray<string> => {
  // Process in batches to avoid memory spikes with large task arrays
  let batchSize = 100;
  let result: string[] = [];

  for (let i = 0; i < tasks.length; i += batchSize) {
    let batch = tasks.slice(i, i + batchSize);
    let batchSerialized = batch.map((task) => JSON.stringify(task));
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

export let refreshTaskIndex = async (
  config: Readonly<KanbanConfig>,
): Promise<ReadonlyArray<IndexedTask>> => {
  let tasks = await indexTasks({
    tasksDir: config.tasksDir,
    exts: config.exts,
    repoRoot: config.repo,
  });
  let lines = serializeTasks(tasks);
  await writeFile(config.indexFile, `${lines.join('\n')}\n`, 'utf8');
  return tasks;
};
export let writeIndexFile = async (
  indexFilePath: string,
  lines: ReadonlyArray<string>,
): Promise<void> => {
  await writeFile(indexFilePath, `${lines.join('\n')}\n`, 'utf8');
};

/**
 * Get default cache path based on config
 */
let getDefaultCachePath = (config: KanbanConfig): string => {
  return path.join(path.dirname(config.indexFile), '.cache');
};

/**
 * Create task cache options from kanban config
 */
export let createTaskCacheOptions = (
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
export let indexTasksToCache = async (
  options: Readonly<{
    readonly tasksDir: string;
    readonly exts: ReadonlySetLike<string>;
    readonly repoRoot: string;
    readonly cache: TaskCache;
  }>,
): Promise<{ indexed: number; cache: TaskCache }> => {
  let { tasksDir, exts, repoRoot, cache } = options;

  // Clear existing cache to ensure clean rebuild
  await cache.rebuildIndex();

  // Stream tasks from filesystem to avoid memory overload
  let files = await listFilesRec(tasksDir, new Set(exts));
  let indexedCount = 0;

  // Process files in batches to avoid memory issues
  let batchSize = 50;
  for (let i = 0; i < files.length; i += batchSize) {
    let batch = files.slice(i, i + batchSize);

    let batchTasks = await Promise.all(
      batch.map(async (filePath) => {
        try {
          let raw = await readFile(filePath, 'utf8');
          let parsed = parseFrontmatter<Readonly<Record<string, unknown>>>(raw);
          return normalizeTask(parsed.data ?? {}, filePath, repoRoot, parsed.content);
        } catch (error) {
          console.error(`Failed to process ${filePath}:`, error);
          return null;
        }
      }),
    );

    // Filter out null results and index valid tasks
    let validTasks = batchTasks.filter((task): task is IndexedTask => task !== null);

    for (let task of validTasks) {
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
export let migrateJsonlToCache = async (
  config: KanbanConfig,
  cache: TaskCache,
): Promise<{ migrated: number; errors: string[] }> => {
  let errors: string[] = [];
  let migrated = 0;

  try {
    // Check if JSONL index exists
    let raw = await readFile(config.indexFile, 'utf8').catch(() => null);
    if (!raw) {
      return { migrated: 0, errors: ['No existing JSONL index found'] };
    }

    // Parse JSONL lines
    let lines = raw
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
    for (let task of lines) {
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

export let runIndexer = async (
  options?: Readonly<{
    readonly argv?: ReadonlyArray<string>;
    readonly env?: NodeJS.ProcessEnv;
  }>,
): Promise<ReadonlyArray<IndexedTask>> => {
  let { config, restArgs } = await loadKanbanConfig(options);
  let args = new Set(restArgs);
  let shouldWrite = args.has('--write');
  let useCache = args.has('--cache');

  if (useCache) {
    // Use new cache-based indexing
    console.log('Using cache-based indexing...');

    let { createTaskCache } = await import('./task-cache.js');
    let cache = await createTaskCache(createTaskCacheOptions(config));

    let result = await indexTasksToCache({
      tasksDir: config.tasksDir,
      exts: config.exts,
      repoRoot: config.repo,
      cache,
    });

    console.log(`Indexed ${result.indexed} tasks to cache`);
    await cache.close();
    return [];
  }

  let tasks = await indexTasks({
    tasksDir: config.tasksDir,
    exts: config.exts,
    repoRoot: config.repo,
  });
  let lines = serializeTasks(tasks);
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

let isCliExecution = (): boolean => {
  let entry = process.argv[1];
  if (typeof entry !== 'string' || entry.length === 0) {
    return false;
  }
  let modulePath = fileURLToPath(import.meta.url);
  return path.resolve(entry) === modulePath;
};

if (isCliExecution()) {
  runIndexer().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
