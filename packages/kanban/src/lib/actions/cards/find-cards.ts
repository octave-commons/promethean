/**
 * Find cards action
 * Extracted from MarkdownBoard.listCards method
 */

import { normalizeName } from '../../utils/index.js';
import type { FindCardsInput, FindCardsOutput } from '../types/index.js';

export type FindCardsScope = {
  readonly normalizeName: typeof normalizeName;
};

export const findCards = (
  input: FindCardsInput,
  scope: FindCardsScope = { normalizeName },
): FindCardsOutput => {
  const { board, columnName } = input;
  const { normalizeName } = scope;

  const target = normalizeName(columnName);
  const column = board.columns.find((item) => normalizeName(item.name) === target);

  const cards = column ? column.cards.map((card) => ({ ...card })) : [];

  return {
    cards,
  };
};
