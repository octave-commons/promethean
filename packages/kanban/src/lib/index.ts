/**
 * Main barrel export for kanban functional architecture
 */

// Actions
export * from './actions/index.js';

// Serializers
export * from './serializers/index.js';

// Utilities
export * from './utils/index.js';

// Factories - explicit exports to avoid naming conflicts
export type {
  BoardFactoryDependencies,
  CreateBoardInput,
  ColumnFactoryDependencies,
  CreateColumnInput,
  CardFactoryDependencies,
  CreateCardInput,
} from './factories/index.js';

export {
  createBoardWithDependencies,
  createBoardFromMarkdown,
  createColumn as createColumnWithDependencies,
  createStandardKanbanColumns,
  createCard as createCardWithDependencies,
  createCardFromTask,
} from './factories/index.js';
