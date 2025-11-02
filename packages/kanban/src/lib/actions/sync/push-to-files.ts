import { promises as fs } from 'node:fs';
import path from 'node:path';

import type { Board, Task } from '../../types.js';
import { ensureTaskFileBase, ensureUniqueFileBase } from '../../core/slugs.js';
import { normalizeColumnDisplayName } from '../../utils/string-utils.js';
import { readTasksFolder } from '../tasks/read-tasks-folder.js';
import { toFrontmatter } from '../../serializers/task-frontmatter.js';

export type PushToFilesInput = {
  board: Board;
  tasksDir: string;
};

export type PushToFilesResult = {
  added: number;
  moved: number;
  statusUpdated: number;
};

export const pushToFiles = async (input: PushToFilesInput): Promise<PushToFilesResult> => {
  const { board, tasksDir } = input;

  let added = 0;
  let moved = 0;
  let statusUpdated = 0;

  const existingTasks = await readTasksFolder({ tasksPath: tasksDir });
  const existingByUuid = new Map(existingTasks.map((task) => [task.uuid, task]));
  const existingBySlug = new Map(existingTasks.map((task) => [ensureTaskFileBase({ ...task }), task]));

  const usedNames = new Map<string, string>();
  for (const task of existingTasks) {
    const base = ensureTaskFileBase({ ...task });
    usedNames.set(base, task.uuid);
  }

  await fs.mkdir(tasksDir, { recursive: true }).catch(() => {});

  for (const column of board.columns) {
    const updatedTasks: Task[] = [];

    for (const task of column.tasks) {
      const boardStatus = column.name;
      let finalTask: Task = { ...task, status: boardStatus };
      let existing = existingByUuid.get(finalTask.uuid);

      if (!existing) {
        const baseName = ensureTaskFileBase({ ...finalTask });
        const existingTaskForSlug = existingBySlug.get(baseName);
        if (existingTaskForSlug) {
          existing = existingTaskForSlug;
          finalTask = {
            ...finalTask,
            uuid: existingTaskForSlug.uuid,
            created_at: existingTaskForSlug.created_at,
            content: finalTask.content ?? existingTaskForSlug.content,
          };
          existingByUuid.set(finalTask.uuid, existingTaskForSlug);
        }
      }

      if (!existing) {
        added += 1;
      } else {
        const normalizedBoardStatus = normalizeColumnDisplayName(boardStatus);
        const normalizedFileStatus = normalizeColumnDisplayName(existing.status ?? '');
        if (normalizedBoardStatus !== normalizedFileStatus) {
          statusUpdated += 1;
        }
      }

      const existingSlug = existing ? ensureTaskFileBase({ ...existing }) : undefined;
      const baseName = ensureTaskFileBase({ ...finalTask });
      let targetBase = ensureUniqueFileBase(baseName, usedNames, finalTask.uuid);

      if (existingSlug && existingSlug !== targetBase) {
        moved += 1;
      }

      usedNames.set(targetBase, finalTask.uuid);

      const targetPath = path.join(tasksDir, `${targetBase}.md`);

      const content = finalTask.content ?? existing?.content ?? '';
      const createdAt = existing?.created_at ?? finalTask.created_at ?? new Date().toISOString();

      const taskToPersist: Task = {
        ...finalTask,
        slug: targetBase,
        status: boardStatus,
        content,
        created_at: createdAt,
        sourcePath: targetPath,
      };

      await fs.writeFile(targetPath, toFrontmatter(taskToPersist), 'utf8');
      updatedTasks.push(taskToPersist);
    }

    column.tasks = updatedTasks;
    column.count = updatedTasks.length;
  }

  return { added, moved, statusUpdated };
};
