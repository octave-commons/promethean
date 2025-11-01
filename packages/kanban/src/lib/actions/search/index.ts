/**
 * Barrel exports for search/indexing actions
 */

// Search and indexing actions for Kanban system
export { searchBoard } from './search-board.js';
export type { SearchBoardInput, SearchBoardResult } from './search-board.js';

export { indexKanbanTasks } from './index-tasks.js';
export type { IndexTasksInput, IndexTasksResult } from './index-tasks.js';

export { generateBoardByTags } from './generate-board-by-tags.js';
export type { GenerateBoardByTagsInput, GenerateBoardByTagsResult } from './generate-board-by-tags.js';
