/**
 * Column Factory
 * 
 * Functional equivalent of column constructors.
 * Creates column objects with dependencies injected.
 */

import type { Column } from '../actions/types/index.js';

export interface ColumnFactoryDependencies {
  /** Logger function for debugging */
  logger?: (message: string) => void;
  /** Default WIP limit if none specified */
  defaultWipLimit?: number;
}

export interface CreateColumnInput {
  /** Column name */
  name: string;
  /** WIP limit for the column */
  wipLimit?: number;
  /** Whether column is archived */
  archived?: boolean;
}

/**
 * Create a new column with factory dependencies
 */
export const createColumn = (
  input: CreateColumnInput,
  dependencies: ColumnFactoryDependencies = {},
): Column => {
  const { logger, defaultWipLimit = 3 } = dependencies;
  const { name, wipLimit, archived = false } = input;

  logger?.(`Creating column: ${name}`);

  return {
    name,
    wipLimit: wipLimit ?? defaultWipLimit,
    archived,
  };
};

/**
 * Create a standard set of kanban columns
 */
export const createStandardKanbanColumns = (
  dependencies: ColumnFactoryDependencies = {},
): Column[] => {
  const { logger } = dependencies;
  
  logger?.('Creating standard kanban columns');

  return [
    createColumn({ name: 'incoming' }, dependencies),
    createColumn({ name: 'todo' }, dependencies),
    createColumn({ name: 'in_progress', wipLimit: 3 }, dependencies),
    createColumn({ name: 'testing' }, dependencies),
    createColumn({ name: 'review' }, dependencies),
    createColumn({ name: 'document' }, dependencies),
    createColumn({ name: 'done' }, dependencies),
  ];
};