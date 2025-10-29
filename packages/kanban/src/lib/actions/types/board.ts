/**
 * Board types for kanban functional architecture
 * Extracted from @packages/markdown/src/kanban.ts
 */

import type { Card, ColumnState, BoardFrontmatter, KanbanSettings } from './card.js';

export type Board = {
  readonly columns: readonly ColumnState[];
  readonly frontmatter: BoardFrontmatter;
  readonly settings: KanbanSettings | null;
};

export type LoadBoardInput = {
  readonly markdown: string;
};

export type LoadBoardOutput = {
  readonly board: Board;
};

export type SaveBoardInput = {
  readonly board: Board;
};

export type SaveBoardOutput = {
  readonly markdown: string;
};

export type QueryBoardInput = {
  readonly board: Board;
};

export type ListColumnsInput = {
  readonly board: Board;
};

export type ListColumnsOutput = {
  readonly columns: readonly Column[];
};

export type GetFrontmatterInput = {
  readonly board: Board;
};

export type SetFrontmatterInput = {
  readonly board: Board;
  readonly patch: BoardFrontmatter;
};

export type GetKanbanSettingsInput = {
  readonly board: Board;
};

export type SetKanbanSettingsInput = {
  readonly board: Board;
  readonly settings: KanbanSettings;
};
