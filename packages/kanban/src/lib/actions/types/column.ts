/**
 * Column types for kanban functional architecture
 * Extracted from @packages/markdown/src/kanban.ts
 */

import type { ColumnState } from './card.js';

export type Column = {
  readonly name: string;
  readonly _headingIndex: number;
};

export type CreateColumnInput = {
  readonly board: {
    readonly columns: readonly ColumnState[];
  };
  readonly name: string;
  readonly position?: number;
};

export type CreateColumnOutput = {
  readonly board: {
    readonly columns: readonly ColumnState[];
  };
  readonly column: Column;
};

export type RemoveColumnInput = {
  readonly board: {
    readonly columns: readonly ColumnState[];
  };
  readonly name: string;
};

export type RemoveColumnOutput = {
  readonly board: {
    readonly columns: readonly ColumnState[];
  };
};

export type ListColumnsInBoardInput = {
  readonly board: {
    readonly columns: readonly ColumnState[];
  };
};

export type ListColumnsInBoardOutput = {
  readonly columns: readonly Column[];
};
