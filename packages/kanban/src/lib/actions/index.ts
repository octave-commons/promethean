/**
 * Barrel exports for all kanban actions
 */

// Types
export type {
  Card,
  ColumnState,
  BoardFrontmatter,
  KanbanSettings,
  Board,
  Column,
  CreateCardInput,
  CreateCardOutput,
  UpdateCardInput,
  UpdateCardOutput,
  MoveCardInput,
  MoveCardOutput,
  RemoveCardInput,
  RemoveCardOutput,
  FindCardsInput,
  FindCardsOutput,
  LoadBoardInput,
  LoadBoardOutput,
  SaveBoardInput,
  SaveBoardOutput,
  ListColumnsInput,
  GetFrontmatterInput,
  SetFrontmatterInput,
  GetKanbanSettingsInput,
  SetKanbanSettingsInput,
  CreateColumnInput,
  CreateColumnOutput,
  RemoveColumnInput,
  RemoveColumnOutput,
  ListColumnsInBoardInput,
  ListColumnsInBoardOutput,
} from './types/index.js';

// Board Actions
export type {
  LoadBoardScope,
  SaveBoardScope,
  GetFrontmatterOutput,
  SetFrontmatterOutput,
  GetKanbanSettingsOutput,
  SetKanbanSettingsOutput,
} from './boards/index.js';

export {
  loadBoard,
  saveBoard,
  getFrontmatter,
  setFrontmatter,
  getKanbanSettings,
  setKanbanSettings,
  listColumns,
} from './boards/index.js';

// Column Actions
export type {
  CreateColumnScope,
  RemoveColumnScope,
  ListColumnsInBoardScope,
} from './columns/index.js';

export { createColumn, removeColumn, listColumnsInBoard } from './columns/index.js';

// Card Actions
export type {
  CreateCardScope,
  RemoveCardScope,
  MoveCardScope,
  UpdateCardScope,
  FindCardsScope,
} from './cards/index.js';

export { createCard, removeCard, moveCard, updateCard, findCards } from './cards/index.js';
