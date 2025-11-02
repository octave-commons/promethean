import path from 'node:path';

import { loadKanbanConfig } from '../../../board/config.js';
import { readTasksFolder } from '../tasks/read-tasks-folder.js';
import type { ColumnData, Task } from '../../types.js';
import { columnKey, normalizeColumnDisplayName } from '../../utils/string-utils.js';
import { writeBoard, maybeRefreshIndex } from '../../serializers/board.js';

export type GenerateBoardByTagsInput = {
  tasksDir: string;
  boardPath: string;
  tags: string[];
};

export type GenerateBoardByTagsResult = {
  totalTasks: number;
  filteredTags: string[];
};

export const generateBoardByTags = async (
  input: GenerateBoardByTagsInput,
): Promise<GenerateBoardByTagsResult> => {
  const { tasksDir, boardPath, tags } = input;
  const { config } = await loadKanbanConfig();
  const allTasks = await readTasksFolder({ tasksPath: tasksDir });

  const filteredTasks = allTasks.filter((task) => {
    const taskTags = task.labels ?? [];
    return tags.every((tag) => taskTags.includes(tag));
  });

  const statusGroups = new Map<string, { name: string; tasks: Task[] }>();
  for (const task of filteredTasks) {
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
  const columns: ColumnData[] = statusValues.map((statusValue) => {
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

  const tagSuffix = tags.length > 0 ? `-${tags.join('-').replace(/[^a-zA-Z0-9]/g, '_')}` : '';
  const boardDir = path.dirname(boardPath);
  const boardName = path.basename(boardPath, '.md');
  const taggedBoardPath = path.join(boardDir, `${boardName}${tagSuffix}.md`);

  await writeBoard(taggedBoardPath, { columns } as any);
  await maybeRefreshIndex(tasksDir);

  return { totalTasks: filteredTasks.length, filteredTags: tags };
};
