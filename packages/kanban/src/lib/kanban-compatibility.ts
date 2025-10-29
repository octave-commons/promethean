/**
 * Legacy compatibility layer for kanban library
 * Bridges old API with new functional architecture
 */

// Re-export everything from main functional architecture
export * from './index.js';

// Re-export legacy types for backward compatibility
export type { Task, ColumnData } from './types.js';

// Legacy compatibility functions - re-export from functional actions
export { countTasks } from './actions/boards/count-tasks.js';

// Import functional actions for compatibility wrappers
import { loadBoard as loadBoardFunctional } from './actions/boards/index.js';
import { updateStatus as updateStatusFunctional } from './actions/transitions/update-status.js';
import { moveTask as moveTaskFunctional } from './actions/transitions/move-task.js';
import { createTask as createTaskFunctional } from './actions/tasks/index.js';
import { formatMarkdown } from './serializers/index.js';
import type { Board as FunctionalBoard } from './actions/types/board.js';
import type { Board as LegacyBoard, Task } from './types.js';

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
export const loadBoard = async (boardPath: string): Promise<LegacyBoard> => {
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
): Promise<{
  success: boolean;
  task: Task;
  previousStatus: string;
  added?: number;
  moved?: number;
  statusUpdated?: number;
}> => {
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

  // Return legacy format
  return {
    success: result.success,
    task: result.task,
    previousStatus: result.previousStatus,
  };
};

// Legacy moveTask wrapper - converts multiple args to input object
export const moveTask = async (
  board: LegacyBoard,
  taskUuid: string,
  offset: number,
  boardPath?: string,
): Promise<{
  success: boolean;
  task: Task;
  fromPosition: number;
  toPosition: number;
}> => {
  const direction = offset < 0 ? 'up' : 'down';
  const result = await moveTaskFunctional({
    board,
    taskUuid,
    direction,
    boardPath,
  });

  // Return legacy format
  return {
    success: result.success,
    task: result.task,
    fromPosition: result.fromPosition,
    toPosition: result.toPosition,
  };
};

// Legacy createTask wrapper - converts multiple args to input object
export const createTask = async (
  board: LegacyBoard,
  status: string,
  taskData: { title?: string; content?: string; priority?: string; labels?: string[] },
  tasksDir?: string,
  boardPath?: string,
): Promise<Task> => {
  const result = await createTaskFunctional({
    board,
    status,
    taskData,
    tasksDir,
    boardPath,
  });

  // Return legacy format
  return result;
};

// Legacy compatibility wrappers for functions with signature changes
export const findTaskById = async (board: LegacyBoard, uuid: string): Promise<Task | undefined> => {
  for (const column of board.columns) {
    const task = column.tasks.find((t) => t.uuid === uuid);
    if (task) return task;
  }
  return undefined;
};

export const findTaskByTitle = async (
  board: LegacyBoard,
  title: string,
): Promise<Task | undefined> => {
  for (const column of board.columns) {
    const task = column.tasks.find((t) => t.title === title);
    if (task) return task;
  }
  return undefined;
};

// Additional wrapper functions needed by CLI
export const getColumn = async (
  board: LegacyBoard,
  columnName: string,
): Promise<{ name: string; tasks: Task[] }> => {
  const column = board.columns.find((col) => col.name === columnName);
  if (!column) {
    throw new Error(`Column "${columnName}" not found`);
  }
  return {
    name: column.name,
    tasks: column.tasks,
  };
};

export const getTasksByColumn = async (board: LegacyBoard, columnName: string): Promise<Task[]> => {
  const column = board.columns.find((col) => col.name === columnName);
  if (!column) {
    throw new Error(`Column "${columnName}" not found`);
  }
  return column.tasks;
};

export const pullFromTasks = async (
  board: LegacyBoard,
  tasksDir: string,
  boardPath: string,
): Promise<{ added: number; moved: number; statusUpdated?: number }> => {
  // Placeholder implementation
  return { added: 0, moved: 0, statusUpdated: 0 };
};

export const pushToTasks = async (
  board: LegacyBoard,
  tasksDir: string,
): Promise<{ added: number; moved: number; statusUpdated?: number }> => {
  // Placeholder implementation
  return { added: 0, moved: 0, statusUpdated: 0 };
};

export const syncBoardAndTasks = async (
  board: LegacyBoard,
  tasksDir: string,
  boardPath: string,
): Promise<{
  board: { added: number; moved: number };
  tasks: { added: number; moved: number; statusUpdated: number };
  conflicting: Array<{ task: Task; issue: string }>;
}> => {
  // Placeholder implementation
  return {
    board: { added: 0, moved: 0 },
    tasks: { added: 0, moved: 0, statusUpdated: 0 },
    conflicting: [],
  };
};

export const regenerateBoard = async (
  tasksDir: string,
  boardPath: string,
): Promise<{ success: boolean }> => {
  // Placeholder implementation
  return { success: true };
};

export const generateBoardByTags = async (
  tasksDir: string,
  boardPath: string,
  tags: string[],
): Promise<{ success: boolean }> => {
  // Placeholder implementation
  return { success: true };
};

export const indexForSearch = async (tasksDir: string): Promise<{ success: boolean }> => {
  // Placeholder implementation
  return { success: true };
};

export const searchTasks = async (board: LegacyBoard, term: string): Promise<Task[]> => {
  const results: Task[] = [];
  for (const column of board.columns) {
    const matchingTasks = column.tasks.filter(
      (task) => task.title.includes(term) || (task.content && task.content.includes(term)),
    );
    results.push(...matchingTasks);
  }
  return results;
};

export const deleteTask = async (
  board: LegacyBoard,
  uuid: string,
  tasksDir: string,
  boardPath: string,
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
  tasksDir: string,
  boardPath: string,
): Promise<Task | undefined> => {
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
  tasksDir: string,
  boardPath: string,
): Promise<Task | undefined> => {
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
  const markdown = formatMarkdown({
    frontmatter: {},
    settings: {},
    columns: board.columns.map((col) => ({
      name: col.name,
      cards: col.tasks.map((task) => ({
        id: task.uuid,
        text: task.title,
        done: task.status === 'done',
        tags: task.labels || [],
        links: task.links || [],
        attrs: task.attrs || {},
      })),
    })),
  });
  await writeFile(boardPath, markdown, 'utf8');
};

export const readTasksFolder = async (tasksDir: string): Promise<Task[]> => {
  const { readTasksFolder: readTasksFolderFunctional } = await import(
    './actions/tasks/read-tasks-folder.js'
  );
  const result = await readTasksFolderFunctional({ tasksPath: tasksDir });
  return result;
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
