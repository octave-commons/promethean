import type { Board } from '../types/board.js';
import type { Card } from '../types/card.js';

export type FindTaskByTitleInput = {
  board: Board;
  title: string;
};

export type FindTaskByTitleResult = Card | undefined;

/**
 * Find a task/card by its title across all columns in the board
 */
export const findTaskByTitle = (
  input: FindTaskByTitleInput,
): FindTaskByTitleResult => {
  const { board, title } = input;

  for (const column of board.columns) {
    const card = column.cards.find((c) => c.text === title);
    if (card) return card;
  }

  return undefined;
};