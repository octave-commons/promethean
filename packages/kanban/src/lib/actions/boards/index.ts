/**
 * Barrel exports for board actions
 */

export type { LoadBoardScope } from './load-board.js';

export { loadBoard } from './load-board.js';

export type { SaveBoardScope } from './save-board.js';

export { saveBoard } from './save-board.js';

export type {
  GetFrontmatterOutput,
  SetFrontmatterOutput,
  GetKanbanSettingsOutput,
  SetKanbanSettingsOutput,
  ListColumnsOutput,
} from './query-board.js';

export type { CountTasksInput, CountTasksResult } from './count-tasks.js';
export { countTasks } from './count-tasks.js';

export {
  getFrontmatter,
  setFrontmatter,
  getKanbanSettings,
  setKanbanSettings,
  listColumns,
} from './query-board.js';
