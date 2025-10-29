/**
 * Column types for kanban functional architecture
 * Extracted from @packages/markdown/src/kanban.ts
 */

import type { Card, ColumnState } from './card.js';

export type Column = {
  readonly name: string;
  readonly _headingIndex: number;
};

export type AddColumnInput = {
  readonly board: {
    readonly columns: readonly ColumnState[];
  };
  readonly name: string;
  readonly position?: number;
};

export type RemoveColumnInput = {
  readonly board: {
    readonly columns: readonly ColumnState[];
  };
  readonly name: string;
};

export type ListColumnsInput = {
  readonly board: {
    readonly columns: readonly ColumnState[];
  };
};

export type ListColumnsOutput = {
  readonly columns: readonly Column[];
};

export type ListCardsInput = {
  readonly board: {
    readonly columns: readonly ColumnState[];
  };
  readonly columnName: string;
};

export type ListCardsOutput = {
  readonly cards: readonly Card[];
};
