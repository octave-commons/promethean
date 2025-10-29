/**
 * Barrel export for kanban library - re-exports functional architecture
 * This file maintains backward compatibility for imports expecting '../kanban.js'
 */

// Re-export everything from the main functional architecture
export * from './index.js';

// Re-export legacy types for backward compatibility
export type { Task, ColumnData } from './types.js';

// Legacy compatibility functions - map old API to new functional architecture
import { formatMarkdown } from './serializers/index.js';

// Legacy compatibility functions - re-export from functional actions
export { countTasks } from './actions/boards/count-tasks.js';
export { getColumn } from './actions/columns/get-column.js';
export { getTasksByColumn } from './actions/columns/get-tasks-by-column.js';
export { findTaskById } from './actions/tasks/find-task-by-id.js';
export { findTaskByTitle } from './actions/tasks/find-task-by-title.js';
export { readTasksFolder } from './actions/tasks/read-tasks-folder.js';

// Export createTask from tasks index (already aliased)
export { createTask } from './actions/tasks/index.js';

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
