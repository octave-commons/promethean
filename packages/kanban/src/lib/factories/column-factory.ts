/**
 * Column Factory
 *
 * Functional equivalent of column constructors.
 * Creates column objects with dependencies injected.
 */

import type { Column, ColumnState, Card } from '../actions/types/index.js';

export interface ColumnFactoryDependencies {
  /** Logger function for debugging */
  logger?: (message: string) => void;
}

export interface CreateColumnInput {
  /** Column name */
  name: string;
  /** Column index in board */
  headingIndex?: number;
}

/**
 * Create a new column with factory dependencies
 */
export const createColumn = (
  input: CreateColumnInput,
  dependencies: ColumnFactoryDependencies = {},
): Column => {
  const { logger } = dependencies;
  const { name, headingIndex = 0 } = input;

  logger?.(`Creating column: ${name}`);

  return {
    name,
    _headingIndex: headingIndex,
  };
};

/**
 * Create a column state with cards
 */
export const createColumnState = (
  input: { name: string; cards?: readonly Card[] },
  dependencies: ColumnFactoryDependencies = {},
): ColumnState => {
  const { logger } = dependencies;
  const { name, cards = [] } = input;

  logger?.(`Creating column state: ${name}`);

  return {
    name,
    cards,
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
    createColumn({ name: 'incoming', headingIndex: 0 }, dependencies),
    createColumn({ name: 'todo', headingIndex: 1 }, dependencies),
    createColumn({ name: 'in_progress', headingIndex: 2 }, dependencies),
    createColumn({ name: 'testing', headingIndex: 3 }, dependencies),
    createColumn({ name: 'review', headingIndex: 4 }, dependencies),
    createColumn({ name: 'document', headingIndex: 5 }, dependencies),
    createColumn({ name: 'done', headingIndex: 6 }, dependencies),
  ];
};
