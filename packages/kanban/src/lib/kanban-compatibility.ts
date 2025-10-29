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
  createTask as createTaskAction,
  archiveTask as archiveTaskAction,
  deleteTask as deleteTaskAction,
  updateTaskDescription as updateTaskDescriptionAction,
  renameTask as renameTaskAction,
} from './actions/tasks/index.js';
import { searchTasks as searchTasksAction } from './actions/search/search-tasks.js';
import { indexForSearch as indexForSearchAction } from './actions/search/index-for-search.js';
import { formatMarkdown } from './serializers/index.js';
import type { ColumnState, Card } from './actions/types/card.js';
import type { Board as FunctionalBoard } from './actions/types/board.js';
import type { Board as LegacyBoard, Task as LegacyTask } from './types.js';
import type { SearchTasksResult } from './actions/search/search-tasks.js';
import type { IndexForSearchResult } from './actions/search/index-for-search.js';
import { stringify as stringifyYaml } from 'yaml';

// Helper to ensure optional results resolve to concrete values for the legacy surface
const ensureTask = (task: LegacyTask | undefined, context: string): LegacyTask => {
  if (!task) {
    throw new Error(
      `Legacy compatibility layer expected a task from ${context}, but none was returned.`,
    );
  }
  return task;
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

  const { task, board: updatedBoard } = await createTaskAction({
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
export const getColumn = (
  board: LegacyBoard,
  columnName: string,
): ColumnData => {
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
  _board: LegacyBoard,
  _tasksDir: string,
  _boardPath: string,
): Promise<{ added: number; moved: number; statusUpdated?: number }> => {
  // Placeholder implementation
  return { added: 0, moved: 0, statusUpdated: 0 };
};

export const pushToTasks = async (
  _board: LegacyBoard,
  _tasksDir: string,
): Promise<{ added: number; moved: number; statusUpdated?: number }> => {
  // Placeholder implementation
  return { added: 0, moved: 0, statusUpdated: 0 };
};

export const syncBoardAndTasks = async (
  _board: LegacyBoard,
  _tasksDir: string,
  _boardPath: string,
): Promise<{
  board: { added: number; moved: number };
  tasks: { added: number; moved: number; statusUpdated: number };
  conflicting: Array<{ task: LegacyTask; issue: string }>;
}> => {
  // Placeholder implementation
  return {
    board: { added: 0, moved: 0 },
    tasks: { added: 0, moved: 0, statusUpdated: 0 },
    conflicting: [],
  };
};

export const regenerateBoard = async (_tasksDir: string, _boardPath: string): Promise<{
  success: boolean;
  totalTasks: number;
}> => {
  // Placeholder implementation
  return { success: true, totalTasks: 0 };
};

export const generateBoardByTags = async (
  _tasksDir: string,
  _boardPath: string,
  _tags: string[],
): Promise<{ success: boolean }> => {
  // Placeholder implementation
  return { success: true };
};

export const indexForSearch = async (_tasksDir: string): Promise<{ success: boolean }> => {
  // Placeholder implementation
  return { success: true };
};

export const searchTasks = async (
  board: LegacyBoard,
  term: string,
): Promise<SearchTasksResult> => {
  return searchTasksAction({
    board,
    term,
    options: {
      includeContent: true,
    },
  });
};

export const deleteTask = async (
  board: LegacyBoard,
  uuid: string,
  _tasksDir: string,
  _boardPath: string,
): Promise<boolean> => {
  // Remove task from board
  for (const column of board.columns) {
    const taskIndex = column.tasks.findIndex((task) => task.uuid === uuid);
    if (taskIndex !== -1) {
      column.tasks.splice(taskIndex, 1);
      return true;
    }
  }
  return false;
};

export const updateTaskDescription = async (
  board: LegacyBoard,
  uuid: string,
  description: string,
  _tasksDir: string,
  _boardPath: string,
): Promise<LegacyTask | undefined> => {
  // Find and update task
  for (const column of board.columns) {
    const task = column.tasks.find((t) => t.uuid === uuid);
    if (task) {
      task.content = description;
      return task;
    }
  }
  return undefined;
};

export const renameTask = async (
  board: LegacyBoard,
  uuid: string,
  newTitle: string,
  _tasksDir: string,
  _boardPath: string,
): Promise<LegacyTask | undefined> => {
  // Find and update task
  for (const column of board.columns) {
    const task = column.tasks.find((t) => t.uuid === uuid);
    if (task) {
      task.title = newTitle;
      return task;
    }
  }
  return undefined;
};

export const writeBoard = async (boardPath: string, board: LegacyBoard): Promise<void> => {
  const { writeFile } = await import('node:fs/promises');

  // Convert to markdown and write
  const columns: ColumnState[] = board.columns.map((col) => ({
    name: col.name,
    cards: col.tasks.map((task): Card => {
      const enhancedTask = task as LegacyTask & {
        links?: readonly string[];
        attrs?: Record<string, unknown>;
      };
      const attrs: Record<string, string> = enhancedTask.attrs
        ? Object.fromEntries(
            Object.entries(enhancedTask.attrs).map(([key, value]) => [key, String(value)]),
          )
        : {};
      return {
        id: task.uuid,
        text: task.title,
        done: task.status === 'done',
        tags: task.labels ? [...task.labels] : [],
        links: enhancedTask.links ? [...enhancedTask.links] : [],
        attrs,
      };
    }),
  }));

  const markdown = formatMarkdown({
    frontmatter: {},
    settings: {},
    columns,
  });
  await writeFile(boardPath, markdown, 'utf8');
};

export const readTasksFolder = async (tasksDir: string): Promise<LegacyTask[]> => {
  const { readTasksFolder: readTasksFolderFunctional } = await import(
    './actions/tasks/read-tasks-folder.js'
  );
  const result = await readTasksFolderFunctional({ tasksPath: tasksDir });
  return result as LegacyTask[];
};

// Missing legacy functions
export const toFrontmatter = (board: LegacyBoard): unknown => {
  return {
    columns: board.columns.map((col) => ({
      name: col.name,
      limit: col.limit,
    })),
  };
};

export const validateStartingStatus = (status: string): boolean => {
  const validStatuses = ['todo', 'in_progress', 'done', 'blocked'];
  return validStatuses.includes(status);
};

export const columnKey = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '_');
};
