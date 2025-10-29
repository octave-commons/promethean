import fs from 'node:fs/promises';
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
    const base = ensureTaskFileBase(task);
    usedNames.set(base, task.uuid);
  }

  await fs.mkdir(tasksDir, { recursive: true }).catch(() => {});

  const existingFiles = new Set<string>();
  try {
    const files = await fs.readdir(tasksDir);
    for (const file of files) {
      if (file.endsWith('.md')) {
        existingFiles.add(file);
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read tasks directory ${tasksDir}:`, error);
  }

  for (const column of board.columns) {
    for (const task of column.tasks) {
      const boardStatus = column.name;
      const baseName = ensureTaskFileBase({ ...task });

      let finalTask: Task = { ...task, status: boardStatus };
      const existingTask = existingByUuid.get(finalTask.uuid);

      if (existingTask && existingTask.slug && existingTask.slug.length > 0) {
        finalTask.slug = existingTask.slug;
      }

      const existingFileBase = existingTask ? ensureTaskFileBase({ ...existingTask }) : null;
      const existingFileName = existingFileBase ? `${existingFileBase}.md` : null;

      let targetBase = finalTask.slug ?? baseName;
      let finalStatus = boardStatus;

      if (existingTask) {
        const normalizedBoardStatus = boardStatus.trim().toLowerCase();
        const normalizedFileStatus = existingTask.status
          ? existingTask.status.trim().toLowerCase()
          : undefined;
        if (normalizedFileStatus && normalizedBoardStatus !== normalizedFileStatus) {
          statusUpdated += 1;
        }
      }

      const baseFileName = `${baseName}.md`;
      if (existingFiles.has(baseFileName)) {
        const conflictingUuid = usedNames.get(baseName);
        if (conflictingUuid && conflictingUuid !== finalTask.uuid) {
          console.log(
            `Duplicate task detected: ${finalTask.uuid} vs ${conflictingUuid}. Using existing file ${baseFileName}`,
          );
          targetBase = baseName;
        } else if (!conflictingUuid) {
          let attempt = 1;
          let candidate = `${baseName} ${attempt}`;
          while (existingFiles.has(`${candidate}.md`)) {
            attempt += 1;
            candidate = `${baseName} ${attempt}`;
          }
          targetBase = candidate;
        }
      } else if (existingFileName && existingFiles.has(existingFileName)) {
        if (existingTask && existingTask.title === finalTask.title) {
          targetBase = existingFileBase!;
        }
      }

      if (!existingTask) {
        targetBase = ensureUniqueFileBase(targetBase, usedNames, finalTask.uuid);
      }

      finalTask.slug = targetBase;
      usedNames.set(targetBase, finalTask.uuid);

      const filename = `${targetBase}.md`;
      const targetPath = path.join(tasksDir, filename);
      const previous = existingByUuid.get(finalTask.uuid);
      const previousPath = previous?.sourcePath;

      let existingContent = '';
      let existingCreatedAt = '';
      if (previous && previousPath) {
        try {
          const existingFileContent = await fs.readFile(previousPath, 'utf8');
          const parsed = await readTasksFolder({ tasksPath: tasksDir });
          const match = parsed.find((task) => task.uuid === finalTask.uuid);
          if (match) {
            existingContent = match.content ?? '';
            existingCreatedAt = match.created_at ?? '';
          }
        } catch (error) {
          console.warn(`Warning: Could not read existing task file ${previousPath}:`, error);
        }
      }

      const finalContent = finalTask.content ?? existingContent;
      const createdAt = existingCreatedAt || finalTask.created_at || new Date().toISOString();

      const content = toFrontmatter({
        ...finalTask,
        status: finalStatus,
        content: finalContent,
        created_at: createdAt,
      });

      await fs.writeFile(targetPath, content, 'utf8');

      if (!previous) {
        added += 1;
      } else if (previousPath && previousPath !== targetPath) {
        moved += 1;
      }
    }
  }

  return { added, moved, statusUpdated };
};
