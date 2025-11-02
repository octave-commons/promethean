import type { Board } from '../types/board.js';

export type GetColumnInput = {
  board: Board;
  columnName: string;
};

export type GetColumnResult = Board['columns'][0] | undefined;

/**
 * Get a specific column by name from the board
 */
export const getColumn = (
  input: GetColumnInput,
): GetColumnResult => {
  const { board, columnName } = input;
  
  return board.columns.find((col) => col.name === columnName);
};