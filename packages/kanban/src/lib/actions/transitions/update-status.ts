import { promises as fs } from 'node:fs';
import path from 'node:path';

import type { Board, Task, ColumnData } from '../../types.js';
import {
  readTaskFile,
  createBackup,
  updateTimestamp,
  generateDiff,
} from '../../task-content/parser.js';
import { writeBoard, maybeRefreshIndex, ensureColumn as ensureBoardColumn } from '../../serializers/board.js';

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

  const located = findTaskInBoard(board, taskUuid);
  if (!located) {
    return { success: false };
  }

  const { task, column, index } = located;
  const previousStatus = task.status;

  // Skip if status is already the same
  if (previousStatus === newStatus) {
    return { success: true, task, previousStatus };
  }

  // Create backup if requested
  const backupPath =
    options?.createBackup && tasksDir ? await createTaskBackup(tasksDir, taskUuid) : undefined;

  // Remove from existing column
  column.tasks.splice(index, 1);
  column.count = column.tasks.length;

  const targetColumn = ensureBoardColumn(board, newStatus);
  const updatedTask: Task = { ...task, status: targetColumn.name };
  targetColumn.tasks = [...targetColumn.tasks, updatedTask];
  targetColumn.count = targetColumn.tasks.length;

  // Update task file if tasksDir provided
  if (tasksDir) {
    await updateTaskFile(tasksDir, taskUuid, newStatus, options?.dryRun);
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
