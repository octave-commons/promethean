/**
 * Barrel exports for search/indexing actions
 */

// Search and indexing actions for Kanban system
export type { SearchTasksInput, SearchTasksResult } from './search-tasks.js';
export { searchTasks } from './search-tasks.js';

export type { IndexForSearchInput, IndexForSearchResult } from './index-for-search.js';
export { indexForSearch } from './index-for-search.js';
