/**
 * Board Factory
 *
 * Functional equivalent of board constructors.
 * Creates board objects with dependencies injected.
 */

import type {
  Board,
  BoardFrontmatter,
  KanbanSettings,
  ColumnState,
} from '../actions/types/index.js';
import { createColumnState } from './column-factory.js';

export interface BoardFactoryDependencies {
  /** Logger function for debugging */
  logger?: (message: string) => void;
  /** Default settings to use when none provided */
  defaultSettings?: KanbanSettings;
}

export interface CreateBoardInput {
  /** Board title */
  title: string;
  /** Board frontmatter */
  frontmatter?: BoardFrontmatter;
  /** Board settings */
  settings?: KanbanSettings;
  /** Board columns */
  columns?: Array<{ name: string; wipLimit?: number }>;
}

/**
 * Create a new board with factory dependencies
 */
export const createBoardWithDependencies = (
  input: CreateBoardInput,
  dependencies: BoardFactoryDependencies = {},
): Board => {
  const { logger, defaultSettings } = dependencies;
  const { title, frontmatter = {}, settings = {}, columns = [] } = input;

  logger?.(`Creating board: ${title}`);

  // Create default columns if none provided
  const boardColumns: readonly ColumnState[] =
    columns.length > 0
      ? columns.map((col) => createColumnState({ name: col.name }))
      : [
          createColumnState({ name: 'incoming' }),
          createColumnState({ name: 'todo' }),
          createColumnState({ name: 'in_progress' }),
          createColumnState({ name: 'testing' }),
          createColumnState({ name: 'review' }),
          createColumnState({ name: 'document' }),
          createColumnState({ name: 'done' }),
        ];

  // Merge settings with defaults
  const mergedSettings: KanbanSettings = {
    wipLimits: { in_progress: 3 },
    ...defaultSettings,
    ...settings,
  };

  return {
    frontmatter: {
      title,
      ...frontmatter,
    },
    settings: mergedSettings,
    columns: boardColumns,
  };

  return {
    title,
    frontmatter: {
      title,
      ...frontmatter,
    },
    settings: mergedSettings,
    columns: boardColumns,
  };
};

/**
 * Create a board from markdown content
 */
export const createBoardFromMarkdown = (
  _markdown: string,
  dependencies: BoardFactoryDependencies = {},
): Board => {
  const { logger } = dependencies;

  logger?.('Creating board from markdown');

  // This would integrate with the markdown parser
  // For now, return a basic board structure
  return createBoardWithDependencies(
    {
      title: 'Imported Board',
      frontmatter: {},
    },
    dependencies,
  );
};
