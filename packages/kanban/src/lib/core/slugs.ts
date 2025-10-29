import type { Task } from '../types.js';
import { sanitizeFileNameBase } from '../utils/string-utils.js';

const FALLBACK_SLUG_REGEX = /^task [0-9a-f]{8}(?: \d+)?$/i;

export const fallbackFileBase = (uuid: string): string => `Task ${uuid.slice(0, 8)}`;

export const isFallbackSlug = (slug: string, uuid: string): boolean => {
  const normalizedSlug = slug.trim().toLowerCase();
  const normalizedUuid = uuid.replace(/[^0-9a-f]/gi, '').toLowerCase();
  const slugWithoutDelimiters = normalizedSlug.replace(/[^0-9a-f]/gi, '');
  return FALLBACK_SLUG_REGEX.test(normalizedSlug) || slugWithoutDelimiters === normalizedUuid;
};

export const deriveFileBaseFromTask = (task: Pick<Task, 'slug' | 'title' | 'uuid'>): string => {
  const fromSlug = typeof task.slug === 'string' ? sanitizeFileNameBase(task.slug) : '';
  if (fromSlug.length > 0 && !isFallbackSlug(fromSlug, task.uuid)) {
    return fromSlug;
  }

  const fromTitle = sanitizeFileNameBase(task.title ?? '');
  if (fromTitle.length > 0) {
    return fromTitle;
  }

  return fallbackFileBase(task.uuid);
};

export const ensureTaskFileBase = (task: Task): string => {
  const base = deriveFileBaseFromTask(task);
  if (!task.slug || task.slug !== base) {
    task.slug = base;
  }
  return base;
};

export const resolveTaskSlug = (
  task: Pick<Task, 'slug' | 'title' | 'uuid'>,
  baseName: string,
): string => {
  const sanitizedBase = sanitizeFileNameBase(baseName);
  const explicitSlug =
    typeof task.slug === 'string' && task.slug.trim().length > 0 ? task.slug.trim() : undefined;
  const fallbackSource = sanitizedBase.length > 0 ? sanitizedBase : (task.title ?? sanitizedBase);
  const slugSource = explicitSlug ?? fallbackSource;
  const normalized = sanitizeFileNameBase(slugSource ?? '');
  if (normalized.length > 0) {
    return normalized;
  }
  return fallbackFileBase(task.uuid);
};

export const slugMatchesSourcePath = (task: Task): boolean => {
  if (!task.sourcePath) {
    return false;
  }

  const normalizedSlug =
    typeof task.slug === 'string' && task.slug.length > 0 ? sanitizeFileNameBase(task.slug) : '';
  if (normalizedSlug.length === 0) {
    return false;
  }

  const normalizedSource = sanitizeFileNameBase(
    task.sourcePath.replace(/\\/g, '/').split('/').pop()?.replace(/\.[^.]+$/, '') ?? '',
  );

  return normalizedSource.length > 0 && normalizedSlug === normalizedSource;
};

type EnsureUniqueOptions = {
  readonly maxBaseLength?: number;
};

export const ensureUniqueFileBase = (
  base: string,
  used: Map<string, string>,
  uuid: string,
  options: EnsureUniqueOptions = {},
): string => {
  const MAX_BASENAME_LENGTH = options.maxBaseLength ?? 120;
  const initial = base.length > 0 ? base : fallbackFileBase(uuid);

  const truncateForAttempt = (baseStr: string, attemptNum: number): string => {
    const suffix = attemptNum > 1 ? ` ${attemptNum}` : '';
    const allowed = Math.max(1, MAX_BASENAME_LENGTH - suffix.length);
    const trimmed = baseStr.trim();
    if (trimmed.length <= allowed) {
      return trimmed;
    }
    const head = Math.floor(allowed * 0.6);
    const tail = allowed - head;
    return `${trimmed.slice(0, head).trim()} ${trimmed.slice(-tail).trim()}`.trim();
  };

  let attempt = 1;
  let candidate = truncateForAttempt(initial, attempt);
  while (used.has(candidate) && used.get(candidate) !== uuid) {
    attempt += 1;
    candidate = truncateForAttempt(initial, attempt);
  }
  return candidate;
};

export type { Task };
