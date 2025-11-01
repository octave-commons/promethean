import type { Task } from '../types.js';
import { ensureTaskFileBase } from '../core/slugs.js';
import { ensureSectionExists } from '../serializers/markdown-serializer.js';
import { BLOCKED_BY_HEADING, BLOCKS_HEADING } from '../core/constants.js';

export const uniqueStrings = (values: ReadonlyArray<string> | undefined): string[] =>
  Array.from(
    new Set(
      (values ?? [])
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value) && value.length > 0),
    ),
  );

export const wikiLinkForTask = (task: Task): string => {
  const base = ensureTaskFileBase({ ...task });
  const display = task.title && task.title.trim().length > 0 ? task.title.trim() : base;
  return display === base ? `[[${base}]]` : `[[${base}|${display}]]`;
};

export const ensureTaskContent = (task: Task, fallback?: Task): string => {
  const baseContent =
    task.content && task.content.length > 0 ? task.content : (fallback?.content ?? '');
  const withBlocked = ensureSectionExists(baseContent, BLOCKED_BY_HEADING);
  return ensureSectionExists(withBlocked, BLOCKS_HEADING);
};
