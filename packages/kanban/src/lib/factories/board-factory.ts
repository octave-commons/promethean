/**
 * Board Factory
 * 
 * Functional equivalent of board constructors.
 * Creates board objects with dependencies injected.
 */

import type { Board, BoardFrontmatter, KanbanSettings, Column } from '../actions/types/index.js';
import { createColumn } from './column-factory.js';

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
  const boardColumns: Column[] = columns.length > 0 
    ? columns.map(col => createColumn({ name: col.name, wipLimit: col.wipLimit }))
    : [
        createColumn({ name: 'incoming' }),
        createColumn({ name: 'todo' }),
        createColumn({ name: 'in_progress' }),
        createColumn({ name: 'testing' }),
        createColumn({ name: 'review' }),
        createColumn({ name: 'document' }),
        createColumn({ name: 'done' }),
      ];

  // Merge settings with defaults
  const mergedSettings: KanbanSettings = {
    wipLimits: { in_progress: 3 },
    ...defaultSettings,
    ...settings,
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
  markdown: string,
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