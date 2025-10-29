import type { Board } from '../types/board.js';
import type { Card } from '../types/card.js';

export type FindTaskByIdInput = {
  board: Board;
  taskId: string;
};

export type FindTaskByIdResult = Card | undefined;

/**
 * Find a task/card by its ID across all columns in the board
 */
export const findTaskById = (
  input: FindTaskByIdInput,
): FindTaskByIdResult => {
  const { board, taskId } = input;

  for (const column of board.columns) {
    const card = column.cards.find((c) => c.id === taskId);
    if (card) return card;
  }

  return undefined;
};