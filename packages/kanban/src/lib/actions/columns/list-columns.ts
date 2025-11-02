/**
 * List columns in board action
 * Extracted from MarkdownBoard.listColumns method
 */

import type { ListColumnsInBoardInput, ListColumnsInBoardOutput } from '../types/index.js';

export const listColumnsInBoard = (input: ListColumnsInBoardInput): ListColumnsInBoardOutput => {
  const { board } = input;

  return {
    columns: board.columns.map((column, index) => ({
      name: column.name,
      _headingIndex: index,
    })),
  };
};
