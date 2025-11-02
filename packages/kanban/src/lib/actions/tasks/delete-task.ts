import { promises as fs } from 'node:fs';
import path from 'node:path';

import { readTaskFile, createBackup } from '../../task-content/parser.js';
import { writeBoard, maybeRefreshIndex } from '../../serializers/board.js';
import type { Board } from '../../types.js';
import { locateTask } from '../../core/task-utils.js';

export type DeleteTaskInput = {
  board: Board;
  tasksDir: string;
  taskUuid: string;
  options?: { createBackup?: boolean };
  boardPath?: string;
};

export type DeleteTaskResult = { success: boolean; taskPath?: string; backupPath?: string };

const findTaskFile = async (tasksDir: string, uuid: string): Promise<string | null> => {
  const files = await fs.readdir(tasksDir);
  const byName = files.find((f) => f.includes(uuid) && f.endsWith('.md'));
  if (byName) return path.join(tasksDir, byName);

  for (const f of files) {
    if (!f.endsWith('.md')) continue;
    const p = path.join(tasksDir, f);
    try {
      const { frontmatter } = await readTaskFile(p);
      if (frontmatter && frontmatter.uuid === uuid) return p;
    } catch (_) {
      // ignore parse errors
    }
  }

  return null;
};

export const deleteTask = async (input: DeleteTaskInput): Promise<DeleteTaskResult> => {
  const { board, tasksDir, taskUuid, options, boardPath } = input;
  const filePath = await findTaskFile(tasksDir, taskUuid);
  if (!filePath) return { success: false };

  let backupPath: string | undefined;
  if (options?.createBackup) {
    backupPath = await createBackup(filePath);
  }

  try {
    await fs.unlink(filePath);
  } catch (err) {
    return { success: false };
  }

  // Remove from in-memory board if provided
  const located = locateTask(board, taskUuid);
  if (located) {
    const { column, index } = located;
    column.tasks.splice(index, 1);
    column.count = column.tasks.length;
  }

  if (boardPath) {
    await writeBoard(boardPath, board);
  }
  await maybeRefreshIndex(tasksDir);

  return { success: true, taskPath: filePath, backupPath };
};
