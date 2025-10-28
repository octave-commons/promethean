import type { EventLogManager } from '../board/event-log/index.js';
import type { Board, ColumnData, Task } from './types.js';
export type { Task } from './types.js';
export declare const columnKey: (name: string) => string;
type CreateTaskInput = {
    title: string;
    content?: string;
    body?: string;
    labels?: string[];
    priority?: Task['priority'];
    estimates?: Task['estimates'];
    created_at?: string;
    uuid?: string;
    slug?: string;
    templatePath?: string;
    defaultTemplatePath?: string;
    blocking?: string[];
    blockedBy?: string[];
};
export declare const readTasksFolder: (dir: string) => Promise<Task[]>;
export declare const loadBoard: (boardPath: string, tasksDir: string) => Promise<Board>;
export declare const countTasks: (board: Board, column?: string) => number;
export declare const getColumn: (board: Board, column: string) => ColumnData;
export declare const getTasksByColumn: (board: Board, column: string) => Task[];
export declare const findTaskById: (board: Board, uuid: string) => Task | undefined;
export declare const findTaskByTitle: (board: Board, title: string) => Task | undefined;
/**
 * Validates that a status is a valid starting status for new tasks.
 *
 * Based on kanban workflow rules, tasks should only be created in icebox or incoming
 * to ensure proper workflow adherence and prevent bypassing of intake/planning stages.
 *
 * @param column - The column name to validate as a starting status
 * @throws {Error} When the column is not a valid starting status. The error message
 *                 includes the invalid status, list of valid statuses, and usage guidance.
 *
 * @example
 * // Valid usage - no error thrown
 * validateStartingStatus('icebox');
 * validateStartingStatus('incoming');
 *
 * @example
 * // Invalid usage - throws error
 * try {
 *   validateStartingStatus('todo');
 * } catch (error) {
 *   console.log(error.message);
 *   // Output: Invalid starting status: "todo". Tasks can only be created with starting statuses: icebox, incoming. Use --status flag to specify a valid starting status when creating tasks.
 * }
 *
 * @since 2025.10.15
 * @see {@link createTask} - Function that uses this validation
 * @see {@link https://github.com/promethean/docs/agile/process.md} - Kanban workflow documentation
 */
export declare const validateStartingStatus: (column: string) => void;
declare const serializeBoard: (board: Board) => string;
export declare const writeBoard: (boardPath: string, board: Board) => Promise<void>;
export declare const updateStatus: (board: Board, uuid: string, newStatus: string, boardPath: string, tasksDir?: string, transitionRulesEngine?: import("./transition-rules.js").TransitionRulesEngine, correctionReason?: string, eventLogManager?: EventLogManager, actor?: "agent" | "human" | "system") => Promise<Task | undefined>;
export declare const moveTask: (board: Board, uuid: string, delta: number, boardPath: string) => Promise<{
    uuid: string;
    column: string;
    rank: number;
} | undefined>;
declare const toFrontmatter: (t: Task) => string;
export declare const pullFromTasks: (board: Board, tasksDir: string, boardPath: string) => Promise<{
    added: number;
    moved: number;
}>;
export declare const pushToTasks: (board: Board, tasksDir: string) => Promise<{
    added: number;
    moved: number;
    statusUpdated: number;
}>;
declare const applyTemplateReplacements: (template: string, replacements: Record<string, string>) => string;
export { applyTemplateReplacements };
export declare const createTask: (board: Board, column: string, input: CreateTaskInput, tasksDir: string, boardPath: string) => Promise<Task>;
export declare const archiveTask: (board: Board, uuid: string, tasksDir: string, boardPath: string, options?: {
    columnName?: string;
}) => Promise<Task | undefined>;
export declare const deleteTask: (board: Board, uuid: string, tasksDir: string, boardPath: string) => Promise<boolean>;
export declare const updateTaskDescription: (board: Board, uuid: string, content: string, tasksDir: string, boardPath: string) => Promise<Task | undefined>;
export declare const renameTask: (board: Board, uuid: string, newTitle: string, tasksDir: string, boardPath: string) => Promise<Task | undefined>;
export declare const syncBoardAndTasks: (board: Board, tasksDir: string, boardPath: string) => Promise<{
    board: {
        added: number;
        moved: number;
    };
    tasks: {
        added: number;
        moved: number;
        statusUpdated: number;
    };
    conflicting: string[];
}>;
export declare const regenerateBoard: (tasksDir: string, boardPath: string) => Promise<{
    totalTasks: number;
}>;
export declare const mergeTasks: (board: Board, sourceUuids: string[], targetUuid: string, tasksDir: string, boardPath: string, options?: {
    mergeStrategy?: "append" | "combine" | "replace";
    preserveSources?: boolean;
}) => Promise<Task | undefined>;
export declare const indexForSearch: (_tasksDir: string, options?: Readonly<{
    readonly argv?: ReadonlyArray<string>;
    readonly env?: Readonly<NodeJS.ProcessEnv>;
}>) => Promise<Readonly<{
    readonly started: true;
    readonly tasksIndexed: number;
    readonly wroteIndexFile: boolean;
}>>;
export declare const searchTasks: (board: Board, term: string) => Promise<{
    exact: Task[];
    similar: Task[];
}>;
/**
 * Generate a board filtered by specific tags
 */
export declare const generateBoardByTags: (tasksDir: string, boardPath: string, tags: string[]) => Promise<{
    totalTasks: number;
    filteredTags: string[];
}>;
import type { TaskAnalysisResult, TaskRewriteResult, TaskBreakdownResult } from './task-content/types.js';
export declare const analyzeTask: (board: Board, uuid: string, analysisType: "quality" | "complexity" | "completeness" | "breakdown" | "prioritization", _tasksDir: string, _boardPath: string, context?: {
    projectInfo?: string;
    teamContext?: string;
    deadlines?: string[];
    dependencies?: string[];
}, options?: {
    createBackup?: boolean;
    dryRun?: boolean;
}) => Promise<TaskAnalysisResult | undefined>;
export declare const rewriteTask: (board: Board, uuid: string, rewriteType: "improve" | "simplify" | "expand" | "restructure" | "summarize", _tasksDir: string, _boardPath: string, options?: {
    instructions?: string;
    targetAudience?: "developer" | "manager" | "stakeholder" | "team";
    tone?: "formal" | "casual" | "technical" | "executive";
    createBackup?: boolean;
    dryRun?: boolean;
}) => Promise<TaskRewriteResult | undefined>;
export { toFrontmatter, serializeBoard };
export declare const breakdownTask: (board: Board, uuid: string, breakdownType: "subtasks" | "steps" | "phases" | "components", _tasksDir: string, _boardPath: string, options?: {
    maxSubtasks?: number;
    complexity?: "simple" | "medium" | "complex";
    includeEstimates?: boolean;
    createBackup?: boolean;
    dryRun?: boolean;
}) => Promise<TaskBreakdownResult | undefined>;
//# sourceMappingURL=kanban.d.ts.map