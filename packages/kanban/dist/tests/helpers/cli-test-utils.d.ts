import type { ExecutionContext } from 'ava';
import { type CliContext } from '../../cli/command-handlers.js';
import { withTempDir } from '../../test-utils/helpers.js';
export { withTempDir };
/**
 * CLI testing utilities that bypass environment issues by using direct function calls
 * instead of process spawning.
 */
export interface CliTestResult {
    stdout: string;
    stderr: string;
    exitCode: number;
    result?: unknown;
}
export interface BoardFixture {
    name: string;
    columns: Array<{
        name: string;
        count: number;
        limit: number | null;
        tasks: Array<{
            uuid: string;
            title: string;
            status: string;
            priority: string;
            labels: string[];
            created_at: string;
            content: string;
        }>;
    }>;
}
/**
 * Load a board fixture from JSON file
 */
export declare const loadBoardFixture: (fixturePath: string) => Promise<BoardFixture>;
/**
 * Convert fixture data to board format and write to board file
 */
export declare const setupBoardFromFixture: (t: ExecutionContext, fixturePath: string) => Promise<{
    context: CliContext;
    fixture: BoardFixture;
}>;
/**
 * Execute a kanban command and capture results
 */
export declare const executeKanbanCommand: (command: string, args: string[], context: CliContext) => Promise<CliTestResult>;
/**
 * Get current task order in a column
 */
export declare const getTaskOrder: (context: CliContext, columnName: string) => Promise<string[]>;
/**
 * Verify board file persistence
 */
export declare const verifyBoardPersistence: (context: CliContext, expectedTaskOrder: Record<string, string[]>) => Promise<boolean>;
/**
 * Performance measurement utility
 */
export declare const measurePerformance: <T>(operation: () => Promise<T>) => Promise<{
    result: T;
    durationMs: number;
}>;
/**
 * Create a large board for performance testing
 */
export declare const createLargeBoard: (taskCount: number) => Promise<BoardFixture>;
/**
 * Generate random UUID for testing
 */
export declare const generateRandomUuid: () => string;
/**
 * Verify task exists in board
 */
export declare const verifyTaskExists: (context: CliContext, taskUuid: string) => Promise<boolean>;
/**
 * Get task position in column
 */
export declare const getTaskPosition: (context: CliContext, taskUuid: string) => Promise<{
    column: string;
    position: number;
} | null>;
//# sourceMappingURL=cli-test-utils.d.ts.map