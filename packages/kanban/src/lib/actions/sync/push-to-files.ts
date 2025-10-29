import { promises as fs } from 'node:fs';
import path from 'node:path';

import type { Board, Task } from '../../types.js';
import { ensureTaskFileBase, ensureUniqueFileBase } from '../../core/slugs.js';
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

  const usedNames = new Map<string, string>();
  for (const task of existingTasks) {
    const base = ensureTaskFileBase({ ...task });
    usedNames.set(base, task.uuid);
  }

  await fs.mkdir(tasksDir, { recursive: true }).catch(() => {});

  for (const column of board.columns) {
    for (const task of column.tasks) {
      const boardStatus = column.name;
      const baseName = ensureTaskFileBase({ ...task });
      const existingTask = existingByUuid.get(task.uuid);

      let finalTask: Task = { ...task, status: boardStatus };
      if (existingTask?.slug) {
        finalTask.slug = existingTask.slug;
      }

      let targetBase = finalTask.slug ?? baseName;

      if (existingTask) {
        const normalizedBoardStatus = boardStatus.trim().toLowerCase();
        const normalizedFileStatus = existingTask.status
          ? existingTask.status.trim().toLowerCase()
          : undefined;
        if (normalizedFileStatus && normalizedBoardStatus !== normalizedFileStatus) {
          statusUpdated += 1;
        }
      }

      targetBase = ensureUniqueFileBase(targetBase, usedNames, finalTask.uuid);
      usedNames.set(targetBase, finalTask.uuid);

      finalTask = { ...finalTask, slug: targetBase };

      const filename = `${targetBase}.md`;
      const targetPath = path.join(tasksDir, filename);

      await fs.writeFile(
        targetPath,
        toFrontmatter({ ...finalTask, content: finalTask.content ?? '' }),
        'utf8',
      );

      if (!existingTask) {
        added += 1;
      } else {
        const existingPath = existingTask.sourcePath;
        if (existingPath && path.resolve(existingPath) !== path.resolve(targetPath)) {
          moved += 1;
        }
      }
    }
  }

  return { added, moved, statusUpdated };
};
