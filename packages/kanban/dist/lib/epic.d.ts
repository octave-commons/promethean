import type { Task, EpicTask, Subtask, EpicValidationResult, Board } from './types.js';
/**
 * Check if a task is an epic
 */
export declare const isEpic: (task: Task) => task is EpicTask;
/**
 * Check if a task is a subtask
 */
export declare const isSubtask: (task: Task) => task is Subtask;
/**
 * Get all subtasks for an epic from the board
 */
export declare const getEpicSubtasks: (board: Board, epic: EpicTask) => Task[];
/**
 * Get the epic for a subtask
 */
export declare const getSubtaskEpic: (board: Board, subtask: Subtask) => EpicTask | null;
/**
 * Calculate aggregate status for an epic based on its subtasks
 */
export declare const calculateEpicStatus: (subtasks: Task[]) => EpicTask["epicStatus"];
/**
 * Validate if an epic can transition to a new status based on subtask statuses
 */
export declare const validateEpicTransition: (epic: EpicTask, newStatus: string, board: Board) => EpicValidationResult;
/**
 * Add a subtask to an epic
 */
export declare const addSubtaskToEpic: (board: Board, epicUuid: string, subtaskUuid: string) => {
    success: boolean;
    reason?: string;
};
/**
 * Remove a subtask from an epic
 */
export declare const removeSubtaskFromEpic: (board: Board, epicUuid: string, subtaskUuid: string) => {
    success: boolean;
    reason?: string;
};
/**
 * Create a new epic
 */
export declare const createEpic: (title: string, description?: string, subtaskUuids?: string[]) => EpicTask;
/**
 * Update epic status based on current subtask statuses
 */
export declare const updateEpicStatus: (board: Board, epic: EpicTask) => void;
/**
 * Get all epics from the board
 */
export declare const getAllEpics: (board: Board) => EpicTask[];
/**
 * Get all subtasks from the board
 */
export declare const getAllSubtasks: (board: Board) => Subtask[];
//# sourceMappingURL=epic.d.ts.map