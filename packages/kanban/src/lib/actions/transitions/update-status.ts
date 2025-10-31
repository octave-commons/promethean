import { promises as fs } from 'node:fs';
import path from 'node:path';

import type { Board, Task, ColumnData } from '../../types.js';
import {
  readTaskFile,
  createBackup,
  updateTimestamp,
  generateDiff,
} from '../../task-content/parser.js';
import {
  writeBoard,
  maybeRefreshIndex,
  ensureColumn as ensureBoardColumn,
} from '../../serializers/board.js';
import { columnKey } from '../../utils/string-utils.js';

export type UpdateStatusInput = {
  board: Board;
  taskUuid: string;
  newStatus: string;
  boardPath?: string;
  tasksDir?: string;
  options?: { createBackup?: boolean; dryRun?: boolean };
};

export type UpdateStatusResult = {
  success: boolean;
  task?: Record<string, unknown>;
  previousStatus?: string;
  diff?: string;
  backupPath?: string;
};

const findTaskInBoard = (
  board: Board,
  uuid: string,
): { task: Task; column: ColumnData; index: number } | undefined => {
  for (const column of board.columns || []) {
    const taskIndex = column.tasks.findIndex((t: Task) => t.uuid === uuid);
    if (taskIndex >= 0) {
      const task = column.tasks[taskIndex];
      if (task) {
        return {
          task,
          column,
          index: taskIndex,
        };
      }
    }
  }
  return undefined;
};

const createTaskBackup = async (
  tasksDir: string,
  taskUuid: string,
): Promise<string | undefined> => {
  const taskFile = await findTaskFile(tasksDir, taskUuid);
  return taskFile ? await createBackup(taskFile) : undefined;
};

const updateTaskFile = async (
  tasksDir: string,
  taskUuid: string,
  newStatus: string,
  dryRun = false,
): Promise<void> => {
  const taskFile = await findTaskFile(tasksDir, taskUuid);
  if (!taskFile) return;

  const parsed = await readTaskFile(taskFile);
  const frontmatter = parsed.frontmatter || {};
  const body = parsed.body || '';

  const updatedFrontmatter = updateTimestamp({ ...frontmatter, status: newStatus });
  const yaml = (await import('yaml')).stringify(updatedFrontmatter).trim();
  const newContent = `---\n${yaml}\n---\n\n${body}`;

  if (!dryRun) {
    await fs.writeFile(taskFile, newContent, 'utf8');
  }
};

export const updateStatus = async (input: UpdateStatusInput): Promise<UpdateStatusResult> => {
  const { board, taskUuid, newStatus, boardPath, tasksDir, options } = input;

  // Debug: entry log
  try {
    // eslint-disable-next-line no-console
    console.debug('[updateStatus] entry', { taskUuid, newStatus, boardPath, tasksDir });
  } catch (_) {
    // ignore
  }

  const located = findTaskInBoard(board, taskUuid);
  if (!located) {
    try {
      // eslint-disable-next-line no-console
      console.debug('[updateStatus] task not found', { taskUuid });
    } catch (_) {}
    return { success: false };
  }

  const { task, column, index } = located;
  const previousStatus = task.status;

  // Skip if status is already the same (compare canonical keys)
  const prevKey = previousStatus ? columnKey(String(previousStatus)) : '';
  const newKey = columnKey(String(newStatus));

  try {
    // eslint-disable-next-line no-console
    console.debug('[updateStatus] status keys', { previousStatus, prevKey, newStatus, newKey });
  } catch (_) {}

  if (prevKey === newKey) {
    try {
      // eslint-disable-next-line no-console
      console.debug('[updateStatus] no-op: canonical keys equal');
    } catch (_) {}
    return { success: true, task, previousStatus };
  }

  // Create backup if requested
  const backupPath =
    options?.createBackup && tasksDir ? await createTaskBackup(tasksDir, taskUuid) : undefined;

  // Remove from existing column
  column.tasks.splice(index, 1);
  column.count = column.tasks.length;

  const targetColumn = ensureBoardColumn(board, newStatus);

  try {
    // eslint-disable-next-line no-console
    console.debug('[updateStatus] targetColumn', { name: targetColumn.name });
  } catch (_) {}

  const updatedTask: Task = { ...task, status: targetColumn.name };
  targetColumn.tasks = [...targetColumn.tasks, updatedTask];
  targetColumn.count = targetColumn.tasks.length;

  // Update task file if tasksDir provided (write normalized display name)
  if (tasksDir) {
    try {
      // eslint-disable-next-line no-console
      console.debug('[updateStatus] updating task file', {
        tasksDir,
        taskUuid,
        statusToWrite: targetColumn.name,
      });
    } catch (_) {}
    await updateTaskFile(tasksDir, taskUuid, targetColumn.name, options?.dryRun);
  }

  // Save board if boardPath provided
  if (boardPath && !options?.dryRun) {
    await writeBoard(boardPath, board);
    if (tasksDir) {
      await maybeRefreshIndex(tasksDir);
    }
  }

  const diff = options?.createBackup
    ? generateDiff(JSON.stringify(task), JSON.stringify(updatedTask))
    : undefined;

  try {
    // eslint-disable-next-line no-console
    console.debug('[updateStatus] result', { previousStatus, newStatus: targetColumn.name });
  } catch (_) {}

  return {
    success: true,
    task: updatedTask,
    previousStatus,
    diff,
    backupPath,
  };
};

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
