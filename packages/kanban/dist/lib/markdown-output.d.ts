/**
 * Markdown Output Utilities for Kanban CLI
 *
 * Provides formatted markdown output for different kanban data types
 * to replace JSONL as the default output format.
 */
import type { Task, Board } from './types.js';
import type { IndexedTask } from '../board/types.js';
/**
 * Format a single task as markdown
 */
export declare function formatTask(task: Task | IndexedTask): string;
/**
 * Format multiple tasks as markdown list
 */
export declare function formatTaskList(tasks: (Task | IndexedTask)[]): string;
/**
 * Format tasks grouped by status as markdown board
 */
export declare function formatTaskBoard(tasks: (Task | IndexedTask)[]): string;
/**
 * Format a board as markdown
 */
export declare function formatBoard(board: Board): string;
/**
 * Format search results as markdown
 */
export declare function formatSearchResults(results: (Task | IndexedTask)[], query: string): string;
/**
 * Format task count as markdown
 */
export declare function formatTaskCount(counts: Record<string, number>): string;
/**
 * Format audit results as markdown
 */
export declare function formatAuditResults(results: {
    issues: Array<{
        type: string;
        message: string;
        file?: string;
    }>;
    summary: {
        total: number;
        errors: number;
        warnings: number;
    };
}): string;
/**
 * Format a value for table display, handling arrays and objects properly
 */
export declare function formatTableCell(value: any): string;
/**
 * Format generic data as markdown table
 */
export declare function formatTable(data: Record<string, any>[], headers?: string[]): string;
/**
 * Main print function that outputs markdown to stdout
 */
export declare function printMarkdown(data: any, type?: 'task' | 'tasks' | 'board' | 'search' | 'count' | 'audit' | 'table', context?: any): void;
//# sourceMappingURL=markdown-output.d.ts.map