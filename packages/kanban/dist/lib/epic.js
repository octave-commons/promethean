import { findTaskById } from './kanban.js';
// Local implementations since these aren't exported from kanban.ts
const normalizeColumnDisplayName = (value) => {
    const trimmed = value.replace(/\s*\(\s*\d+\s*\)\s*$/g, '').trim();
    return trimmed.length > 0 ? trimmed : 'Todo';
};
/**
 * Check if a task is an epic
 */
export const isEpic = (task) => {
    return task.type === 'epic' && Array.isArray(task.subtaskIds) && task.subtaskIds.length > 0;
};
/**
 * Check if a task is a subtask
 */
export const isSubtask = (task) => {
    return task.type === 'task' && typeof task.epicId === 'string' && task.epicId.length > 0;
};
/**
 * Get all subtasks for an epic from the board
 */
export const getEpicSubtasks = (board, epic) => {
    const subtasks = [];
    for (const column of board.columns) {
        for (const task of column.tasks) {
            if (task.epicId === epic.uuid) {
                subtasks.push(task);
            }
        }
    }
    return subtasks;
};
/**
 * Get the epic for a subtask
 */
export const getSubtaskEpic = (board, subtask) => {
    const epic = findTaskById(board, subtask.epicId);
    return epic && isEpic(epic) ? epic : null;
};
/**
 * Calculate aggregate status for an epic based on its subtasks
 */
export const calculateEpicStatus = (subtasks) => {
    if (subtasks.length === 0) {
        return 'pending';
    }
    const statuses = subtasks.map((task) => normalizeColumnDisplayName(task.status));
    const doneStatuses = ['done', 'completed', 'document'];
    const inProgressStatuses = ['in_progress', 'testing', 'review'];
    const blockedStatuses = ['blocked'];
    // If all subtasks are done, epic is completed
    if (statuses.every((status) => doneStatuses.includes(status))) {
        return 'completed';
    }
    // If any subtask is blocked, epic is blocked
    if (statuses.some((status) => blockedStatuses.includes(status))) {
        return 'blocked';
    }
    // If any subtask is in progress, epic is in progress
    if (statuses.some((status) => inProgressStatuses.includes(status))) {
        return 'in_progress';
    }
    // Otherwise, epic is pending
    return 'pending';
};
/**
 * Validate if an epic can transition to a new status based on subtask statuses
 */
export const validateEpicTransition = (epic, newStatus, board) => {
    const subtasks = getEpicSubtasks(board, epic);
    const normalizedNewStatus = normalizeColumnDisplayName(newStatus);
    // Define transition rules
    const transitionRules = {
        done: {
            requiredSubtaskStatuses: ['done', 'completed', 'document'],
            allowPartial: false,
        },
        testing: {
            requiredSubtaskStatuses: ['done', 'completed', 'document', 'testing', 'review'],
            allowPartial: true,
        },
        review: {
            requiredSubtaskStatuses: ['done', 'completed', 'document', 'testing', 'review'],
            allowPartial: true,
        },
    };
    const rule = transitionRules[normalizedNewStatus];
    if (!rule) {
        return { allowed: true }; // No restrictions for other statuses
    }
    const blockedSubtasks = [];
    for (const subtask of subtasks) {
        const subtaskStatus = normalizeColumnDisplayName(subtask.status);
        if (!rule.requiredSubtaskStatuses.includes(subtaskStatus)) {
            blockedSubtasks.push(subtask.uuid);
        }
    }
    if (blockedSubtasks.length > 0 && !rule.allowPartial) {
        return {
            allowed: false,
            reason: `Epic cannot move to '${normalizedNewStatus}' until all subtasks are completed. Blocked by ${blockedSubtasks.length} subtask(s).`,
            blockedBy: blockedSubtasks,
        };
    }
    const warnings = [];
    if (blockedSubtasks.length > 0 && rule.allowPartial) {
        warnings.push(`${blockedSubtasks.length} subtask(s) are not yet in required states for '${normalizedNewStatus}'.`);
    }
    return {
        allowed: true,
        warnings: warnings.length > 0 ? warnings : undefined,
    };
};
/**
 * Add a subtask to an epic
 */
export const addSubtaskToEpic = (board, epicUuid, subtaskUuid) => {
    const epic = findTaskById(board, epicUuid);
    const subtask = findTaskById(board, subtaskUuid);
    if (!epic) {
        return { success: false, reason: `Epic with UUID ${epicUuid} not found` };
    }
    if (!isEpic(epic)) {
        return { success: false, reason: `Task ${epicUuid} is not an epic` };
    }
    if (!subtask) {
        return { success: false, reason: `Subtask with UUID ${subtaskUuid} not found` };
    }
    if (isEpic(subtask)) {
        return { success: false, reason: `Cannot add an epic as a subtask` };
    }
    if (subtask.epicId === epicUuid) {
        return {
            success: false,
            reason: `Subtask ${subtaskUuid} is already linked to epic ${epicUuid}`,
        };
    }
    if (subtask.epicId) {
        return { success: false, reason: `Subtask ${subtaskUuid} is already linked to another epic` };
    }
    // Update subtask
    subtask.type = 'task';
    subtask.epicId = epicUuid;
    // Update epic
    if (!epic.subtaskIds.includes(subtaskUuid)) {
        epic.subtaskIds.push(subtaskUuid);
    }
    // Update epic status
    const subtasks = getEpicSubtasks(board, epic);
    epic.epicStatus = calculateEpicStatus(subtasks);
    return { success: true };
};
/**
 * Remove a subtask from an epic
 */
export const removeSubtaskFromEpic = (board, epicUuid, subtaskUuid) => {
    const epic = findTaskById(board, epicUuid);
    const subtask = findTaskById(board, subtaskUuid);
    if (!epic) {
        return { success: false, reason: `Epic with UUID ${epicUuid} not found` };
    }
    if (!isEpic(epic)) {
        return { success: false, reason: `Task ${epicUuid} is not an epic` };
    }
    if (!subtask) {
        return { success: false, reason: `Subtask with UUID ${subtaskUuid} not found` };
    }
    if (subtask.epicId !== epicUuid) {
        return { success: false, reason: `Subtask ${subtaskUuid} is not linked to epic ${epicUuid}` };
    }
    // Update subtask
    delete subtask.epicId;
    subtask.type = 'task';
    // Update epic
    epic.subtaskIds = epic.subtaskIds.filter((id) => id !== subtaskUuid);
    // Update epic status
    const subtasks = getEpicSubtasks(board, epic);
    epic.epicStatus = calculateEpicStatus(subtasks);
    return { success: true };
};
/**
 * Create a new epic
 */
export const createEpic = (title, description, subtaskUuids) => {
    const uuid = crypto.randomUUID();
    return {
        uuid,
        title,
        status: 'incoming',
        type: 'epic',
        subtaskIds: subtaskUuids || [],
        epicStatus: 'pending',
        priority: 'P0',
        labels: ['epic'],
        created_at: new Date().toISOString(),
        estimates: {},
        content: description || '',
    };
};
/**
 * Update epic status based on current subtask statuses
 */
export const updateEpicStatus = (board, epic) => {
    const subtasks = getEpicSubtasks(board, epic);
    epic.epicStatus = calculateEpicStatus(subtasks);
};
/**
 * Get all epics from the board
 */
export const getAllEpics = (board) => {
    const epics = [];
    for (const column of board.columns) {
        for (const task of column.tasks) {
            if (isEpic(task)) {
                epics.push(task);
            }
        }
    }
    return epics;
};
/**
 * Get all subtasks from the board
 */
export const getAllSubtasks = (board) => {
    const subtasks = [];
    for (const column of board.columns) {
        for (const task of column.tasks) {
            if (isSubtask(task)) {
                subtasks.push(task);
            }
        }
    }
    return subtasks;
};
//# sourceMappingURL=epic.js.map