import type { Board } from '../types/board.js';

export type CountTasksInput = {
  board: Board;
};

export type CountTasksResult = number;

/**
 * Count total tasks across all columns in the board
 */
export const countTasks = (
  input: CountTasksInput,
): CountTasksResult => {
  const { board } = input;
  
  return board.columns.reduce((total, column) => total + column.cards.length, 0);
};