import { promises as fs } from 'node:fs';
import path from 'node:path';
import { parseFrontmatter as parseMarkdownFrontmatter } from '@promethean-os/markdown/frontmatter';

import type { Task } from '../../types.js';
import { NOW_ISO } from '../../core/constants.js';
import {
  sanitizeFileNameBase,
  generateAutoLabels,
  columnKey,
  normalizeColumnDisplayName,
} from '../../utils/string-utils.js';
import {
  deriveFileBaseFromTask,
  ensureTaskFileBase,
  ensureUniqueFileBase,
  resolveTaskSlug,
  fallbackFileBase,
} from '../../core/slugs.js';

export type ReadTasksFolderInput = {
  tasksPath?: string;
};

export type ReadTasksFolderResult = Task[];

type ReadTasksFolderScope = {
  readonly readdir: typeof fs.readdir;
  readonly readFile: typeof fs.readFile;
  readonly stat: typeof fs.stat;
  readonly parseFrontmatter: typeof parseMarkdownFrontmatter;
  readonly now: () => string;
};

const defaultScope: ReadTasksFolderScope = {
  readdir: (dir: string) => fs.readdir(dir, { withFileTypes: true }),
  readFile: fs.readFile,
  stat: fs.stat,
  parseFrontmatter: parseMarkdownFrontmatter,
  now: NOW_ISO,
};

type FrontmatterRecord = Record<string, unknown>;

const coerceString = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  if (typeof value === 'number' || typeof value === 'bigint') {
    return String(value);
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  return undefined;
};

const pickString = (source: FrontmatterRecord, keys: ReadonlyArray<string>): string | undefined => {
  for (const key of keys) {
    const candidate = coerceString(source[key]);
    if (candidate) {
      return candidate;
    }
  }
  return undefined;
};

const parseLabelList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => coerceString(entry))
      .filter((entry): entry is string => typeof entry === 'string')
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
  }

  const text = coerceString(value);
  if (!text) {
    return [];
  }

  return text
    .split(/[\s,]+/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
};

const mergeLabels = (...values: unknown[]): string[] => {
  const merged = new Set<string>();
  for (const value of values) {
    for (const entry of parseLabelList(value)) {
      merged.add(entry);
    }
  }
  return Array.from(merged);
};

const taskFromFrontmatter = (
  fm: FrontmatterRecord,
  body: string,
  now: () => string,
): Task | null => {
  const uuid = pickString(fm, ['uuid', 'id', 'task-id', 'task_id', 'taskId']);
  if (!uuid) {
    return null;
  }

  const rawTitle = pickString(fm, ['title', 'name']);
  const finalTitle = rawTitle && rawTitle.trim().length > 0 ? rawTitle : fallbackFileBase(uuid);
  const status = pickString(fm, ['status', 'state', 'column']) ?? String(fm.status ?? 'Todo');
  const priorityValue = pickString(fm, ['priority', 'prio']);

  const task: Task = {
    uuid,
    title: finalTitle,
    status,
    priority: typeof fm.priority === 'number' ? fm.priority : priorityValue,
    labels: mergeLabels(fm.tags, fm.hashtags, fm.labels),
    created_at: fm.created_at ?? pickString(fm, ['created_at', 'created', 'txn']) ?? now(),
    estimates: (fm.estimates as Task['estimates']) ?? {},
    content: body.trim() || undefined,
    slug: pickString(fm, ['slug']),
  };

  return task;
};

const fallbackTaskFromRaw = (filePath: string, raw: string): Task | null => {
  if (!raw.startsWith('---')) {
    return null;
  }

  let cursor = 3;
  if (raw[cursor] === '\r') cursor += 1;
  if (raw[cursor] === '\n') cursor += 1;

  const closingIndexLF = raw.indexOf('\n---', cursor);
  const closingIndexCRLF = raw.indexOf('\r\n---', cursor);
  let boundaryIndex = closingIndexLF;
  let newlineLength = 1;
  if (closingIndexCRLF !== -1 && (closingIndexLF === -1 || closingIndexCRLF < closingIndexLF)) {
    boundaryIndex = closingIndexCRLF;
    newlineLength = 2;
  }

  if (boundaryIndex === -1) {
    return null;
  }

  const frontmatterContent = raw.slice(cursor, boundaryIndex);
  const bodyContent = raw.slice(boundaryIndex + newlineLength + 3);

  const getValue = (key: string): string | undefined => {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`^${escapedKey}\\s*:\\s*(.+)$`, 'im');
    const match = frontmatterContent.match(pattern);
    return match?.[1];
  };

  const uuid = getValue('uuid');
  if (!uuid) {
    return null;
  }

  const baseName = path.basename(filePath, path.extname(filePath));
  const title = getValue('title') ?? sanitizeFileNameBase(baseName);
  const status = getValue('status') ?? 'Todo';
  const priority = getValue('priority');
  const labelsRaw = getValue('labels');
  const labels = labelsRaw
    ? labelsRaw
        .replace(/^\[/, '')
        .replace(/\]$/, '')
        .split(/[\s,]+/)
        .map((entry) => entry.replace(/^['"]|['"]$/g, '').trim())
        .filter((entry) => entry.length > 0)
    : [];

  const task: Task = {
    uuid,
    title,
    status,
    priority,
    labels,
    created_at: getValue('created_at') ?? NOW_ISO(),
    estimates: {},
    content: bodyContent.trim(),
  };

  return task;
};

const ensureLabelsPresent = (task: Task, body: string | undefined): Task => {
  if (task.labels && task.labels.length > 0) {
    return task;
  }
  const generated = generateAutoLabels(task.title ?? '', body);
  if (generated.length === 0) {
    return task;
  }
  return { ...task, labels: [...generated] };
};

const ensureStatusNormalization = (task: Task): Task => ({
  ...task,
  status: normalizeColumnDisplayName(String(task.status ?? 'Todo')),
});

const withSourcePath = (task: Task, filePath: string): Task => ({
  ...task,
  sourcePath: filePath,
});

const enrichSlug = (
  task: Task,
  filePath: string,
  usedSlugs: Map<string, string>,
): Task => {
  const baseName = path.basename(filePath, path.extname(filePath));
  const resolvedSlug = resolveTaskSlug(task, baseName);
  const slugged: Task = { ...task, slug: resolvedSlug };

  const ensuredBase = ensureTaskFileBase(slugged);
  const uniqueBase = ensureUniqueFileBase(ensuredBase, usedSlugs, slugged.uuid);
  if (uniqueBase !== ensuredBase) {
    slugged.slug = uniqueBase;
  }
  usedSlugs.set(slugged.slug ?? uniqueBase, slugged.uuid);
  return slugged;
};

const normalizeFrontmatter = (raw: string): string => raw;

export const readTasksFolder = async (
  input: ReadTasksFolderInput = {},
  scope: ReadTasksFolderScope = defaultScope,
): Promise<ReadTasksFolderResult> => {
  const tasksPath = input.tasksPath ?? './docs/agile/tasks';

  try {
    const stats = await scope.stat(tasksPath);
    if (!stats.isDirectory()) {
      throw new Error(`Tasks path is not a directory: ${tasksPath}`);
    }
  } catch (error) {
    throw new Error(
      `Failed to read tasks folder: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  const entries = await scope.readdir(tasksPath);
  const files = entries.filter((entry) => entry.isFile()).map((entry) => entry.name);

  const tasks: Task[] = [];
  const usedSlugs = new Map<string, string>();

  for (const file of files) {
    if (!file.endsWith('.md') && !file.endsWith('.json')) {
      continue;
    }

    const filePath = path.join(tasksPath, file);

    try {
      const content = await scope.readFile(filePath, 'utf8');

      if (file.endsWith('.json')) {
        try {
          const data = JSON.parse(content);
          if (data && typeof data.uuid === 'string' && typeof data.title === 'string') {
            const task: Task = {
              ...(data as Task),
              status: data.status ?? 'Todo',
              content: data.content ?? '',
              labels: Array.isArray(data.labels) ? (data.labels as string[]) : [],
              created_at: data.created_at ?? scope.now(),
            };

            const enriched = enrichSlug(
              ensureLabelsPresent(withSourcePath(task, filePath), task.content),
              filePath,
              usedSlugs,
            );
            tasks.push(ensureStatusNormalization(enriched));
          }
        } catch (error) {
          console.warn(`Failed to parse JSON task ${file}:`, error);
        }
        continue;
      }

      try {
        const normalized = normalizeFrontmatter(content);
        const { data, content: body } = scope.parseFrontmatter<FrontmatterRecord>(normalized);
        const parsed = taskFromFrontmatter(data ?? {}, body ?? '', scope.now);
        if (parsed) {
          const enriched = enrichSlug(
            ensureLabelsPresent(withSourcePath(parsed, filePath), body ?? parsed.content),
            filePath,
            usedSlugs,
          );
          tasks.push(ensureStatusNormalization(enriched));
          continue;
        }
      } catch (error) {
        console.warn(`Failed to parse frontmatter for ${file}:`, error);
      }

      const fallback = fallbackTaskFromRaw(filePath, content);
      if (fallback) {
        const enriched = enrichSlug(
          ensureLabelsPresent(withSourcePath(fallback, filePath), fallback.content),
          filePath,
          usedSlugs,
        );
        tasks.push(ensureStatusNormalization(enriched));
      } else {
        console.warn(`Unable to parse task file ${file}`);
      }
    } catch (error) {
      console.warn(`Failed to read task file ${file}:`, error);
    }
  }

  return tasks;
};
