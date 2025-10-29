import path from 'node:path';

import type { Board, ColumnData, Task } from '../../types.js';
import { columnKey, normalizeColumnDisplayName } from '../../utils/string-utils.js';
import { mergeColumnsCaseInsensitive } from '../../core/columns.js';
import { ensureTaskFileBase } from '../../core/slugs.js';
import { readTasksFolder } from '../tasks/read-tasks-folder.js';
import { writeBoard, maybeRefreshIndex } from '../../serializers/board.js';

export type PullFromFilesInput = {
  board: Board;
  tasksDir: string;
  boardPath: string;
};

export type PullFromFilesResult = {
  added: number;
  moved: number;
  conflicting: string[];
};

const locateTask = (board: Board, uuid: string): { column: ColumnData; index: number } | undefined => {
  for (const column of board.columns) {
    const index = column.tasks.findIndex((task) => task.uuid === uuid);
    if (index >= 0) {
      return { column, index };
    }
  }
  return undefined;
};

export const pullFromFiles = async (input: PullFromFilesInput): Promise<PullFromFilesResult> => {
  const { board, tasksDir, boardPath } = input;

  board.columns = mergeColumnsCaseInsensitive(board.columns);
  const fileTasks = await readTasksFolder({ tasksPath: tasksDir });

  let added = 0;
  let moved = 0;
  const canonicalTitles = new Set<string>();
  const seenTaskIds = new Set<string>();
  const conflicting: string[] = [];

  const byId = new Map<string, { column: ColumnData; index: number }>();
  board.columns.forEach((column) =>
    column.tasks.forEach((task, index) => byId.set(task.uuid, { column, index })),
  );

  for (const fileTask of fileTasks) {
    const normalizedStatus = normalizeColumnDisplayName(String(fileTask.status || 'Todo'));
    const statusKey = columnKey(normalizedStatus);
    const normalizedTask: Task = { ...fileTask, status: normalizedStatus };
    const titleKey = (normalizedTask.title ?? '').trim().toLowerCase();

    if (titleKey.length > 0) {
      canonicalTitles.add(titleKey);
    }

    seenTaskIds.add(normalizedTask.uuid);

    const location = byId.get(fileTask.uuid);
    if (!location) {
      let column = board.columns.find((col) => columnKey(col.name) === statusKey);
      if (!column) {
        column = { name: normalizedStatus, count: 0, limit: null, tasks: [] };
        board.columns.push(column);
      } else if (column.name !== normalizeColumnDisplayName(column.name)) {
        column.name = normalizeColumnDisplayName(column.name);
      }
      column.tasks = [...column.tasks, normalizedTask];
      column.count = column.tasks.length;
      added += 1;
      byId.set(normalizedTask.uuid, { column, index: column.tasks.length - 1 });
      continue;
    }

    const currentColumn = location.column;
    const currentTask = currentColumn.tasks[location.index];

    currentColumn.tasks[location.index] = {
      ...currentTask,
      ...normalizedTask,
      status: currentColumn.name,
    };

    const currentKey = columnKey(currentColumn.name);
    if (currentKey !== statusKey) {
      currentColumn.tasks.splice(location.index, 1);
      currentColumn.count = currentColumn.tasks.length;

      let destination = board.columns.find((col) => columnKey(col.name) === statusKey);
      if (!destination) {
        destination = { name: normalizedStatus, count: 0, limit: null, tasks: [] };
        board.columns.push(destination);
      } else if (destination.name !== normalizeColumnDisplayName(destination.name)) {
        destination.name = normalizeColumnDisplayName(destination.name);
      }

      destination.tasks = [...destination.tasks, { ...normalizedTask, status: destination.name }];
      destination.count = destination.tasks.length;
      moved += 1;
      byId.set(normalizedTask.uuid, { column: destination, index: destination.tasks.length - 1 });
    }
  }

  for (const column of board.columns) {
    column.tasks = column.tasks.filter((task) => {
      const titleMatch = canonicalTitles.has((task.title ?? '').trim().toLowerCase());
      const idMatch = seenTaskIds.has(task.uuid);
      if (!idMatch && !titleMatch) {
        conflicting.push(task.uuid);
        return false;
      }
      return true;
    });
    column.count = column.tasks.length;
  }

  await writeBoard(boardPath, board);
  await maybeRefreshIndex(tasksDir);

  return { added, moved, conflicting };
};
