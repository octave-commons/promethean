import type { Board } from '../types/board.js';

export type GetTasksByColumnInput = {
  board: Board;
  columnName: string;
};

export type GetTasksByColumnResult = Board['columns'][0]['cards'];

/**
 * Get all tasks/cards in a specific column
 */
export const getTasksByColumn = (
  input: GetTasksByColumnInput,
): GetTasksByColumnResult => {
  const { board, columnName } = input;
  
  const column = board.columns.find((col) => col.name === columnName);
  return column ? column.cards : [];
};