/**
 * Legacy compatibility layer for kanban library
 * Bridges old API with new functional architecture
 */

// Re-export everything from main functional architecture
export * from './index.js';

// Re-export legacy types for backward compatibility
export type { Task, ColumnData, Board as LegacyBoard } from './types.js';

// Import functional actions for compatibility wrappers
import { loadBoard as loadBoardFunctional } from './actions/boards/index.js';
import { updateStatus as updateStatusFunctional } from './actions/transitions/update-status.js';
import { moveTask as moveTaskFunctional } from './actions/transitions/move-task.js';
import {
  createTask as createTaskFunctional,
  deleteTask as deleteTaskFunctional,
  updateTaskDescription as updateTaskDescriptionFunctional,
  renameTask as renameTaskFunctional,
} from './actions/tasks/index.js';
import { pullFromFiles } from './actions/sync/pull-from-files.js';
import { pushToFiles } from './actions/sync/push-to-files.js';
import { syncBoardAndTasks as syncBoardAndTasksAction } from './actions/sync/sync-board-and-tasks.js';
import { regenerateBoard as regenerateBoardAction } from './actions/boards/regenerate.js';
import { searchBoard } from './actions/search/search-board.js';
import { indexKanbanTasks } from './actions/search/index-tasks.js';
import { generateBoardByTags as generateBoardByTagsAction } from './actions/search/generate-board-by-tags.js';
import type { Board as FunctionalBoard } from './actions/types/board.js';
import type { Board as LegacyBoard, Task as LegacyTask, ColumnData } from './types.js';
import { stringify as stringifyYaml } from 'yaml';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { readTaskFile } from './task-content/parser.js';
import { writeBoard as writeBoardFile } from './serializers/board.js';

// Helper to ensure optional results resolve to concrete values for the legacy surface
const ensureTask = (task: LegacyTask | undefined, context: string): LegacyTask => {
  if (!task) {
    throw new Error(
      `Legacy compatibility layer expected a task from ${context}, but none was returned.`,
    );
  }
  return task;
};

type SearchTasksResult = {
  exact: LegacyTask[];
  similar: LegacyTask[];
};

type IndexForSearchResult = {
  started: true;
  tasksIndexed: number;
  wroteIndexFile: boolean;
};

const findTaskFile = async (tasksDir: string, uuid: string): Promise<string | null> => {
  try {
    const entries = await fs.readdir(tasksDir);
    for (const file of entries) {
      if (!file.endsWith('.md')) continue;
      const fullPath = path.join(tasksDir, file);
      try {
        const content = await fs.readFile(fullPath, 'utf8');
        if (
          content.includes(`uuid: "${uuid}`) ||
          content.includes(`uuid: '${uuid}`) ||
          content.includes(`uuid: ${uuid}`)
        ) {
          return fullPath;
        }
      } catch (_) {
        // Ignore unreadable files
      }
    }
  } catch (_) {
    return null;
  }
  return null;
};

// Legacy countTasks wrapper - supports optional column filtering
export const countTasks = (board: LegacyBoard, columnName?: string): number => {
  if (columnName) {
    const normalized = columnName.toLowerCase();
    const column = board.columns.find((col) => col.name.toLowerCase() === normalized);
    return column ? column.tasks.length : 0;
  }

  return board.columns.reduce((total, column) => total + column.tasks.length, 0);
};

// Helper function to convert functional Board to legacy Board format
const convertToLegacyBoard = (functionalBoard: FunctionalBoard): LegacyBoard => {
  return {
    columns: functionalBoard.columns.map((col) => ({
      name: col.name,
      count: col.cards.length,
      tasks: col.cards.map((card) => ({
        uuid: card.id,
        title: card.text,
        status: card.done ? 'done' : 'todo',
        labels: [...card.tags],
        links: [...card.links],
        attrs: { ...card.attrs },
      })),
    })),
  };
};

// Legacy loadBoard wrapper - converts string path to LoadBoardInput and returns legacy Board format
export const loadBoard = async (boardPath: string, _tasksPath?: string): Promise<LegacyBoard> => {
  try {
    const { readFile } = await import('node:fs/promises');
    const markdown = await readFile(boardPath, 'utf8');
    const loadResult = await loadBoardFunctional({ markdown });
    return convertToLegacyBoard(loadResult.board);
  } catch (error) {
    throw new Error(
      `Failed to load board from ${boardPath}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
};

// Legacy updateStatus wrapper - converts multiple args to input object
export const updateStatus = async (
  board: LegacyBoard,
  taskUuid: string,
  newStatus: string,
  boardPath?: string,
  tasksDir?: string,
  ..._deprecatedArgs: ReadonlyArray<unknown>
): Promise<LegacyTask> => {
  const result = await updateStatusFunctional({
    board,
    taskUuid,
    newStatus,
    boardPath,
    tasksDir,
    options: {
      createBackup: true,
      dryRun: false,
    },
  });

  const task = ensureTask(result.task as LegacyTask | undefined, 'updateStatus');

  // Return legacy format
  return task;
};

// Legacy moveTask wrapper - converts multiple args to input object
export const moveTask = async (
  board: LegacyBoard,
  taskUuid: string,
  offset: number,
  boardPath?: string,
): Promise<{
  success: boolean;
  task: LegacyTask;
  fromPosition: { column: string; index: number } | undefined;
  toPosition: { column: string; index: number } | undefined;
}> => {
  const direction = offset < 0 ? 'up' : 'down';
  const result = await moveTaskFunctional({
    board,
    taskUuid,
    direction,
    boardPath,
  });

  // Handle case where task is not found
  if (!result.success && !result.task) {
    throw new Error(`Task with UUID ${taskUuid} not found`);
  }

  const task = ensureTask(result.task as LegacyTask | undefined, 'moveTask');

  // Return legacy format
  return {
    success: result.success,
    task,
    fromPosition: result.fromPosition,
    toPosition: result.toPosition,
  };
};

// Legacy createTask wrapper - converts multiple args to input object
export const createTask = async (
  board: LegacyBoard,
  status: string,
  taskData: {
    title?: string;
    content?: string;
    body?: string;
    priority?: string;
    labels?: string[];
    templatePath?: string;
    defaultTemplatePath?: string;
    blocking?: string[];
    blockedBy?: string[];
    uuid?: string;
  },
  tasksDir?: string,
  boardPath?: string,
): Promise<LegacyTask> => {
  const title = taskData.title?.trim() ?? '';
  const normalizedTitle = title.length > 0 ? title : `Task ${Date.now()}`;

  const { task, board: updatedBoard } = await createTaskFunctional({
    board,
    column: status,
    input: {
      title: normalizedTitle,
      content: taskData.content,
      body: taskData.body,
      labels: taskData.labels,
      priority: taskData.priority,
      templatePath: taskData.templatePath,
      defaultTemplatePath: taskData.defaultTemplatePath,
      blocking: taskData.blocking,
      blockedBy: taskData.blockedBy,
      uuid: taskData.uuid,
    },
    tasksDir: tasksDir ?? './docs/agile/tasks',
    boardPath: boardPath ?? './docs/agile/board.md',
  });

  if (updatedBoard) {
    board.columns = updatedBoard.columns.map((column) => ({
      ...column,
      tasks: [...column.tasks],
    }));
  }

  return task;
};

export const archiveTask = async (
  board: LegacyBoard,
  uuid: string,
  tasksDir: string,
  boardPath: string,
): Promise<LegacyTask | undefined> => {
  const task = findTaskById(board, uuid);
  if (!task) {
    return undefined;
  }

  const sourceColumn = board.columns.find((column) =>
    column.tasks.some((candidate) => candidate.uuid === uuid),
  );
  if (sourceColumn) {
    sourceColumn.tasks = sourceColumn.tasks.filter((candidate) => candidate.uuid !== uuid);
    sourceColumn.count = sourceColumn.tasks.length;
  }

  task.status = 'Archive';

  let archiveColumn = board.columns.find((column) => column.name === 'Archive');
  if (!archiveColumn) {
    archiveColumn = {
      name: 'Archive',
      count: 0,
      limit: null,
      tasks: [],
    };
    board.columns.push(archiveColumn);
  }

  archiveColumn.tasks = [...archiveColumn.tasks, task];
  archiveColumn.count = archiveColumn.tasks.length;

  if (tasksDir) {
    const taskFilePath = await findTaskFile(tasksDir, uuid);
    if (taskFilePath) {
      try {
        const parsed = await readTaskFile(taskFilePath);
        const frontmatter = {
          ...(parsed.frontmatter ?? {}),
          status: 'Archive',
          title: task.title,
        } as Record<string, unknown>;
        if (task.labels && task.labels.length > 0) {
          frontmatter.labels = task.labels;
        }
        const yamlContent = stringifyYaml(frontmatter).trimEnd();
        const body = (parsed.body ?? '').trimEnd();
        const rewritten =
          body.length > 0 ? `---\n${yamlContent}\n---\n\n${body}\n` : `---\n${yamlContent}\n---\n`;
        await fs.writeFile(taskFilePath, rewritten, 'utf8');
      } catch (_) {
        // Ignore file update failures to keep CLI resilient
      }
    }
  }

  if (boardPath) {
    await writeBoardFile(boardPath, board);
  }

  return task;
};

// Legacy compatibility wrappers for functions with signature changes
export const findTaskById = (board: LegacyBoard, uuid: string): LegacyTask | undefined => {
  for (const column of board.columns) {
    const task = column.tasks.find((t) => t.uuid === uuid);
    if (task) return task;
  }
  return undefined;
};

export const findTaskByTitle = (board: LegacyBoard, title: string): LegacyTask | undefined => {
  const normalized = title.toLowerCase();
  for (const column of board.columns) {
    const task = column.tasks.find((t) => t.title.toLowerCase() === normalized);
    if (task) return task;
  }
  return undefined;
};

// Additional wrapper functions needed by CLI
export const getColumn = (board: LegacyBoard, columnName: string): ColumnData => {
  const found = board.columns.find(
    (column) => column.name.toLowerCase() === columnName.toLowerCase(),
  );
  if (found) {
    return found;
  }
  return {
    name: columnName,
    count: 0,
    limit: null,
    tasks: [],
  };
};

export const getTasksByColumn = (board: LegacyBoard, columnName: string): LegacyTask[] => {
  const column = getColumn(board, columnName);
  return column.tasks;
};

export const pullFromTasks = async (
  board: LegacyBoard,
  tasksDir: string,
  boardPath: string,
): Promise<{ added: number; moved: number }> => {
  const result = await pullFromFiles({ board, tasksDir, boardPath });
  return { added: result.added, moved: result.moved };
};

export const pushToTasks = async (
  board: LegacyBoard,
  tasksDir: string,
): Promise<{ added: number; moved: number; statusUpdated: number }> => {
  return pushToFiles({ board, tasksDir });
};

export const syncBoardAndTasks = async (
  board: LegacyBoard,
  tasksDir: string,
  boardPath: string,
): Promise<{
  board: { added: number; moved: number };
  tasks: { added: number; moved: number; statusUpdated: number };
  conflicting: string[];
}> => {
  const result = await syncBoardAndTasksAction({ board, tasksDir, boardPath });
  return {
    board: result.board,
    tasks: result.tasks,
    conflicting: result.conflicting,
  };
};

export const regenerateBoard = async (
  tasksDir: string,
  boardPath: string,
): Promise<{
  success: boolean;
  totalTasks: number;
}> => {
  const result = await regenerateBoardAction({ tasksDir, boardPath });
  return { success: true, totalTasks: result.totalTasks };
};

export const generateBoardByTags = async (
  tasksDir: string,
  boardPath: string,
  tags: string[],
): Promise<{ success: boolean; totalTasks?: number; filteredTags?: string[] }> => {
  const result = await generateBoardByTagsAction({ tasksDir, boardPath, tags });
  return { success: true, totalTasks: result.totalTasks, filteredTags: result.filteredTags };
};

export const indexForSearch = async (
  _tasksDir: string,
  options?: {
    argv?: ReadonlyArray<string>;
    env?: Record<string, string | undefined>;
  },
): Promise<IndexForSearchResult> => {
  return indexKanbanTasks({
    argv: options?.argv,
    env: options?.env,
  });
};

export const searchTasks = async (board: LegacyBoard, term: string): Promise<SearchTasksResult> => {
  return searchBoard({ board, term });
};

export const deleteTask = async (
  board: LegacyBoard,
  uuid: string,
  tasksDir: string,
  boardPath: string,
): Promise<boolean> => {
  const result = await deleteTaskFunctional({
    board,
    taskUuid: uuid,
    tasksDir,
    boardPath,
  });
  return result.success;
};

export const updateTaskDescription = async (
  board: LegacyBoard,
  uuid: string,
  description: string,
  tasksDir: string,
  boardPath: string,
): Promise<LegacyTask | undefined> => {
  await updateTaskDescriptionFunctional({
    board,
    taskUuid: uuid,
    newContent: description,
    tasksDir,
    boardPath,
  });
  return board.columns.flatMap((col) => col.tasks).find((task) => task.uuid === uuid);
};

export const renameTask = async (
  board: LegacyBoard,
  uuid: string,
  newTitle: string,
  tasksDir: string,
  boardPath: string,
): Promise<LegacyTask | undefined> => {
  await renameTaskFunctional({
    board,
    taskUuid: uuid,
    newTitle,
    tasksDir,
    boardPath,
  });
  return board.columns.flatMap((col) => col.tasks).find((task) => task.uuid === uuid);
};
export { writeBoard } from './serializers/board.js';

export const readTasksFolder = async (tasksDir: string): Promise<LegacyTask[]> => {
  const { readTasksFolder: readTasksFolderFunctional } = await import(
    './actions/tasks/read-tasks-folder.js'
  );
  const result = await readTasksFolderFunctional({ tasksPath: tasksDir });
  return result as LegacyTask[];
};

// Missing legacy functions
export const toFrontmatter = (task: LegacyTask): string => {
  const frontmatter: Record<string, unknown> = {
    uuid: task.uuid,
    title: task.title,
    status: task.status,
  };

  if (task.priority !== undefined) frontmatter.priority = task.priority;
  if (task.labels && task.labels.length > 0) frontmatter.labels = task.labels;
  if (task.slug) frontmatter.slug = task.slug;
  if (task.created_at) frontmatter.created_at = task.created_at;
  if (task.estimates) frontmatter.estimates = task.estimates;
  const yamlContent = stringifyYaml(frontmatter).trimEnd();
  const header = `---\n${yamlContent}\n---\n`;
  const body = (task.content ?? '').trim();

  if (body.length === 0) {
    return header;
  }

  return `${header}\n${body}\n`;
};

export const validateStartingStatus = async (status: string): Promise<void> => {
  const { validateAndNormalizeStatus } = await import('./status-normalization.js');

  try {
    await validateAndNormalizeStatus(status);
  } catch (error) {
    throw new Error(
      `Invalid starting status: "${status}". Tasks can only be created with starting statuses: icebox, incoming. Use --status flag to specify a valid starting status.`,
    );
  }
};

export const columnKey = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '_');
};
