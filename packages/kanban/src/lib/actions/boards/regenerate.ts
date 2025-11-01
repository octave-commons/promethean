import { loadKanbanConfig } from '../../../board/config.js';
import { readTasksFolder } from '../tasks/read-tasks-folder.js';
import type { Board, ColumnData, Task } from '../../types.js';
import { columnKey, normalizeColumnDisplayName } from '../../utils/string-utils.js';
import { writeBoard, maybeRefreshIndex } from '../../serializers/board.js';

export type RegenerateBoardInput = {
  tasksDir: string;
  boardPath: string;
};

export type RegenerateBoardResult = {
  totalTasks: number;
};

export const regenerateBoard = async (
  input: RegenerateBoardInput,
): Promise<RegenerateBoardResult> => {
  const { tasksDir, boardPath } = input;
  const { config } = await loadKanbanConfig();
  const tasks = await readTasksFolder({ tasksPath: tasksDir });

  const statusGroups = new Map<string, { name: string; tasks: Task[] }>();
  for (const task of tasks) {
    const statusRaw = String(task.status || 'Todo').trim();
    const displayName = normalizeColumnDisplayName(statusRaw);
    const key = columnKey(statusRaw);
    const group = statusGroups.get(key);
    if (group) {
      group.tasks.push({ ...task, status: displayName });
    } else {
      statusGroups.set(key, {
        name: displayName,
        tasks: [{ ...task, status: displayName }],
      });
    }
  }

  const statusValues = Array.from(config.statusValues) as string[];
  const configuredKeys = new Set(statusValues.map((value) => columnKey(value)));

  const configuredColumns: ColumnData[] = statusValues.map((statusValue) => {
    const displayName = normalizeColumnDisplayName(statusValue);
    const key = columnKey(statusValue);
    const group = statusGroups.get(key);
    return {
      name: displayName,
      count: group?.tasks.length ?? 0,
      limit: config.wipLimits[statusValue] ?? null,
      tasks: group ? [...group.tasks] : [],
    };
  });

  const additionalColumns: ColumnData[] = Array.from(statusGroups.entries())
    .filter(([key]) => !configuredKeys.has(key))
    .map(([, group]) => ({
      name: group.name,
      count: group.tasks.length,
      limit: null,
      tasks: [...group.tasks],
    }));

  const board: Board = {
    columns: [...configuredColumns, ...additionalColumns],
  } as Board;

  await writeBoard(boardPath, board);
  await maybeRefreshIndex(tasksDir);

  return { totalTasks: tasks.length };
};
