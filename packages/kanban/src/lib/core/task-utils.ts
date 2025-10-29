import path from 'node:path';

import type { Board, ColumnData, Task } from '../types.js';
import { sanitizeFileNameBase } from '../utils/string-utils.js';
import { ensureTaskFileBase, resolveTaskSlug } from './slugs.js';

export type LocatedTask = { column: ColumnData; index: number; task: Task };

export const locateTask = (board: Board, uuid: string): LocatedTask | undefined => {
  for (const column of board.columns) {
    const index = column.tasks.findIndex((task) => task.uuid === uuid);
    if (index >= 0) {
      return { column, index, task: column.tasks[index]! };
    }
  }
  return undefined;
};

export const resolveTaskFilePath = async (task: Task, tasksDir: string): Promise<string | null> => {
  if (!tasksDir) {
    return null;
  }

  if (task.slug) {
    const candidate = path.join(tasksDir, `${sanitizeFileNameBase(task.slug)}.md`);
    return candidate;
  }

  if (task.sourcePath) {
    return task.sourcePath;
  }

  const slug = resolveTaskSlug(task, ensureTaskFileBase({ ...task }));
  return path.join(tasksDir, `${slug}.md`);
};

export const assignStableSlugs = (board: Board): void => {
  const used = new Set<string>();
  for (const column of board.columns) {
    column.tasks = column.tasks.map((task) => {
      const slug = ensureTaskFileBase({ ...task });
      if (used.has(slug)) {
        let counter = 2;
        let candidate = `${slug}-${counter}`;
        while (used.has(candidate)) {
          counter += 1;
          candidate = `${slug}-${counter}`;
        }
        task.slug = candidate;
        used.add(candidate);
      } else {
        task.slug = slug;
        used.add(slug);
      }
      return task;
    });
  }
};

export const columnStatusKey = (value: string): string => sanitizeFileNameBase(value).toLowerCase();
