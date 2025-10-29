/**
 * Legacy compatibility layer for kanban library
 * Bridges old API with new functional architecture
 */

// Re-export everything from the main functional architecture
export * from './index.js';

// Re-export legacy types for backward compatibility
export type { Task, ColumnData } from './types.js';

// Legacy compatibility functions - re-export from functional actions
export { countTasks } from './actions/boards/count-tasks.js';
export { getColumn } from './actions/columns/get-column.js';
export { getTasksByColumn } from './actions/columns/get-tasks-by-column.js';
export { findTaskById } from './actions/tasks/find-task-by-id.js';
export { findTaskByTitle } from './actions/tasks/find-task-by-title.js';
export { readTasksFolder } from './actions/tasks/read-tasks-folder.js';

// Import functional actions for compatibility wrappers
import { loadBoard as loadBoardFunctional } from './actions/boards/index.js';
import { updateStatus as updateStatusFunctional } from './actions/transitions/update-status.js';
import { moveTask as moveTaskFunctional } from './actions/transitions/move-task.js';
import { createTask as createTaskFunctional } from './actions/tasks/index.js';
import { saveBoard as saveBoardFunctional } from './actions/boards/index.js';
import { formatMarkdown } from './serializers/index.js';
import type { LoadBoardOutput } from './actions/types/board.js';

// Legacy loadBoard wrapper - converts string path to LoadBoardInput
export const loadBoard = async (
  boardPath: string,
  tasksPath?: string,
): Promise<LoadBoardOutput> => {
  try {
    const { readFile } = await import('node:fs/promises');
    const markdown = await readFile(boardPath, 'utf8');
    return loadBoardFunctional({ markdown });
  } catch (error) {
    throw new Error(
      `Failed to load board from ${boardPath}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
};

// Legacy updateStatus wrapper - converts multiple args to input object
export const updateStatus = async (
  board: any,
  taskUuid: string,
  newStatus: string,
  boardPath?: string,
  tasksDir?: string,
  transitionRulesEngine?: any,
  reason?: string,
  eventLogManager?: any,
  actor?: string,
): Promise<any> => {
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
  board: any,
  taskUuid: string,
  offset: number,
  boardPath?: string,
): Promise<any> => {
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
  board: any,
  status: string,
  taskData: any,
  tasksDir?: string,
  boardPath?: string,
): Promise<any> => {
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

// Placeholder functions for missing exports
export const pullFromTasks = async (): Promise<void> => {
  throw new Error('pullFromTasks not yet implemented in functional architecture');
};

export const pushToTasks = async (): Promise<void> => {
  throw new Error('pushToTasks not yet implemented in functional architecture');
};

export const syncBoardAndTasks = async (): Promise<void> => {
  throw new Error('syncBoardAndTasks not yet implemented in functional architecture');
};

export const regenerateBoard = async (): Promise<void> => {
  throw new Error('regenerateBoard not yet implemented in functional architecture');
};

export const generateBoardByTags = async (): Promise<void> => {
  throw new Error('generateBoardByTags not yet implemented in functional architecture');
};

export const columnKey = (column: string): string => {
  return column.toLowerCase().replace(/\s+/g, '-');
};

// Use formatMarkdown as serializeBoard for backward compatibility
export const serializeBoard = formatMarkdown;

// Re-export writeBoard as alias for saveBoard
export { saveBoard as writeBoard } from './actions/boards/index.js';
