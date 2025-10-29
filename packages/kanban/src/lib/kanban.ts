/**
 * Barrel export for kanban library - re-exports functional architecture
 * This file maintains backward compatibility for imports expecting '../kanban.js'
 */

// Re-export everything from the main functional architecture
export * from './index.js';

// Re-export legacy types for backward compatibility
export type { Task, ColumnData } from './types.js';

// Legacy compatibility functions - map old API to new functional architecture
import type { Board } from './actions/types/board.js';
import { formatMarkdown } from './serializers/index.js';
import { promises as fs } from 'fs';
import path from 'path';

// Legacy function wrappers - handle both Board types
export const countTasks = (board: any): number => {
  // Handle new functional Board type
  if (board.columns && Array.isArray(board.columns) && board.columns.length > 0 && board.columns[0].cards) {
    return board.columns.reduce((total: number, column: any) => total + column.cards.length, 0);
  }
  // Handle legacy Board type
  if (board.columns && Array.isArray(board.columns) && board.columns.length > 0 && board.columns[0].tasks) {
    return board.columns.reduce((total: number, column: any) => total + column.tasks.length, 0);
  }
  return 0;
};
  return board.columns.reduce((total, column) => total + column.cards.length, 0);
};

export const getColumn = (board: Board, columnName: string): Board['columns'][0] | undefined => {
  return board.columns.find((col) => col.name === columnName);
};

export const getTasksByColumn = (
  board: Board,
  columnName: string,
): Board['columns'][0]['cards'] => {
  const column = board.columns.find((col) => col.name === columnName);
  return column ? column.cards : [];
};

export const findTaskById = (
  board: Board,
  taskId: string,
): Board['columns'][0]['cards'][0] | undefined => {
  for (const column of board.columns) {
    const card = column.cards.find((c) => c.id === taskId);
    if (card) return card;
  }
  return undefined;
};

export const findTaskByTitle = (
  board: Board,
  title: string,
): Board['columns'][0]['cards'][0] | undefined => {
  for (const column of board.columns) {
    const card = column.cards.find((c) => c.text === title);
    if (card) return card;
  }
  return undefined;
};

// Add readTasksFolder function
export const readTasksFolder = async (tasksPath?: string): Promise<any[]> => {
  const { readTasksFolder: readTasksFolderFunc } = await import('./actions/tasks/index.js');
  return readTasksFolderFunc({ tasksPath });
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
