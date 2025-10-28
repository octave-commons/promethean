/**
 * Fix for kanban search functionality
 *
 * This module addresses the "tasks.map is not a function" error
 * in the markdown output module by providing proper type guards
 * and error handling for search results.
 */
import type { Task } from '../types.js';
/**
 * Safe task mapper that handles null/undefined values
 */
export declare function safeTaskMap<T>(tasks: unknown, mapper: (task: Task) => T): T[];
/**
 * Validate task structure
 */
export declare function isValidTask(task: unknown): task is Task;
/**
 * Safe search results formatter
 */
export declare function formatSearchResults(results: unknown, query: string): string;
/**
 * Patch for the markdown output module
 */
export declare function patchMarkdownOutput(): void;
//# sourceMappingURL=kanban-search-fix.d.ts.map