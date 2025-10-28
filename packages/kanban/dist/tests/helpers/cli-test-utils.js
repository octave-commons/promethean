import path from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { executeCommand } from '../../cli/command-handlers.js';
import { loadBoard } from '../../lib/kanban.js';
import { withTempDir } from '../../test-utils/helpers.js';
// Re-export withTempDir for test files
export { withTempDir };
/**
 * Load a board fixture from JSON file
 */
export const loadBoardFixture = async (fixturePath) => {
    const content = await readFile(fixturePath, 'utf8');
    return JSON.parse(content);
};
/**
 * Convert fixture data to board format and write to board file
 */
export const setupBoardFromFixture = async (t, fixturePath) => {
    const tempDir = await withTempDir(t);
    const boardPath = path.join(tempDir, 'board.md');
    const tasksDir = path.join(tempDir, 'tasks');
    const fixture = await loadBoardFixture(fixturePath);
    // Create empty board file - the kanban functions will write to it
    await writeFile(boardPath, '', 'utf8');
    const context = {
        boardFile: boardPath,
        tasksDir,
        argv: [],
    };
    return { context, fixture };
};
/**
 * Execute a kanban command and capture results
 */
export const executeKanbanCommand = async (command, args, context) => {
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    let stdout = '';
    let stderr = '';
    let exitCode = 0;
    let result;
    try {
        // Capture console output
        console.log = (...args) => {
            stdout += args.join(' ') + '\n';
        };
        console.error = (...args) => {
            stderr += args.join(' ') + '\n';
        };
        // Execute the command
        result = await executeCommand(command, args, context);
    }
    catch (error) {
        stderr += error instanceof Error ? error.message : String(error);
        exitCode = 1;
    }
    finally {
        // Restore console methods
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
    }
    return { stdout, stderr, exitCode, result };
};
/**
 * Get current task order in a column
 */
export const getTaskOrder = async (context, columnName) => {
    const board = await loadBoard(context.boardFile, context.tasksDir);
    const column = board.columns.find((col) => col.name.toLowerCase() === columnName.toLowerCase());
    if (!column) {
        throw new Error(`Column '${columnName}' not found`);
    }
    return column.tasks.map((task) => task.uuid);
};
/**
 * Verify board file persistence
 */
export const verifyBoardPersistence = async (context, expectedTaskOrder) => {
    try {
        const board = await loadBoard(context.boardFile, context.tasksDir);
        for (const [columnName, expectedOrder] of Object.entries(expectedTaskOrder)) {
            const column = board.columns.find((col) => col.name.toLowerCase() === columnName.toLowerCase());
            if (!column) {
                return false;
            }
            const actualOrder = column.tasks.map((task) => task.uuid);
            if (JSON.stringify(actualOrder) !== JSON.stringify(expectedOrder)) {
                return false;
            }
        }
        return true;
    }
    catch (error) {
        return false;
    }
};
/**
 * Performance measurement utility
 */
export const measurePerformance = async (operation) => {
    const startTime = performance.now();
    const result = await operation();
    const endTime = performance.now();
    return {
        result,
        durationMs: Math.round(endTime - startTime),
    };
};
/**
 * Create a large board for performance testing
 */
export const createLargeBoard = async (taskCount) => {
    const tasks = [];
    for (let i = 1; i <= taskCount; i++) {
        const paddedIndex = i.toString().padStart(3, '0');
        tasks.push({
            uuid: `perf-task-${paddedIndex}`,
            title: `Performance test task ${i}`,
            status: 'Todo',
            priority: `P${((i % 3) + 1).toString()}`,
            labels: [`category-${(i % 5) + 1}`, `performance-test`],
            created_at: `2025-01-01T${Math.floor(i / 4)
                .toString()
                .padStart(2, '0')}:${((i % 4) * 15).toString().padStart(2, '0')}:00.000Z`,
            content: `This is performance test task number ${i} with some content to simulate real tasks.`,
        });
    }
    return {
        name: 'Large Performance Test Board',
        columns: [
            {
                name: 'Todo',
                count: taskCount,
                limit: null,
                tasks,
            },
        ],
    };
};
/**
 * Generate random UUID for testing
 */
export const generateRandomUuid = () => {
    return 'test-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
};
/**
 * Verify task exists in board
 */
export const verifyTaskExists = async (context, taskUuid) => {
    try {
        const board = await loadBoard(context.boardFile, context.tasksDir);
        for (const column of board.columns) {
            if (column.tasks.some((task) => task.uuid === taskUuid)) {
                return true;
            }
        }
        return false;
    }
    catch (error) {
        return false;
    }
};
/**
 * Get task position in column
 */
export const getTaskPosition = async (context, taskUuid) => {
    try {
        const board = await loadBoard(context.boardFile, context.tasksDir);
        for (const column of board.columns) {
            const position = column.tasks.findIndex((task) => task.uuid === taskUuid);
            if (position !== -1) {
                return { column: column.name, position };
            }
        }
        return null;
    }
    catch (error) {
        return null;
    }
};
//# sourceMappingURL=cli-test-utils.js.map