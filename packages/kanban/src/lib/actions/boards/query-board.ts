/**
 * Query board actions
 * Extracted from MarkdownBoard query methods
 */

import type {
  ListColumnsInput,
  GetFrontmatterInput,
  SetFrontmatterInput,
  GetKanbanSettingsInput,
  SetKanbanSettingsInput,
  BoardFrontmatter,
  KanbanSettings,
  Column,
  ColumnState,
} from '../types/index.js';
import { freezeRecord } from '../../utils/index.js';

export type GetFrontmatterOutput = {
  readonly frontmatter: BoardFrontmatter;
};

export const getFrontmatter = (input: GetFrontmatterInput): GetFrontmatterOutput => {
  const { board } = input;
  return {
    frontmatter: freezeRecord(board.frontmatter as Record<string, unknown>),
  };
};

export type SetFrontmatterOutput = {
  readonly board: {
    readonly columns: readonly ColumnState[];
    readonly frontmatter: BoardFrontmatter;
    readonly settings: KanbanSettings | null;
  };
};

export const setFrontmatter = (input: SetFrontmatterInput): SetFrontmatterOutput => {
  const { board, patch } = input;
  return {
    board: {
      ...board,
      frontmatter: freezeRecord({
        ...(board.frontmatter as Record<string, unknown>),
        ...(patch as Record<string, unknown>),
      }),
    },
  };
};

export type GetKanbanSettingsOutput = {
  readonly settings: KanbanSettings | null;
};

export const getKanbanSettings = (input: GetKanbanSettingsInput): GetKanbanSettingsOutput => {
  const { board } = input;
  return {
    settings: board.settings
      ? Object.freeze({ ...(board.settings as Record<string, unknown>) })
      : null,
  };
};

export type SetKanbanSettingsOutput = {
  readonly board: {
    readonly columns: readonly ColumnState[];
    readonly frontmatter: BoardFrontmatter;
    readonly settings: KanbanSettings;
  };
};

export const setKanbanSettings = (input: SetKanbanSettingsInput): SetKanbanSettingsOutput => {
  const { board, settings } = input;
  return {
    board: {
      ...board,
      settings: Object.freeze({ ...(settings as Record<string, unknown>) }),
    },
  };
};

export type ListColumnsOutput = {
  readonly columns: readonly Column[];
};

export const listColumns = (input: ListColumnsInput): ListColumnsOutput => {
  const { board } = input;
  return {
    columns: board.columns.map((column, index) => ({
      name: column.name,
      _headingIndex: index,
    })),
  };
};
