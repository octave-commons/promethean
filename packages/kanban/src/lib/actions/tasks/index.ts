/**
 * Barrel exports for task actions
 */

// Export types
export type { CreateTaskInput } from './create-task.js';
export type { RenameTaskInput, RenameTaskResult } from './rename-task.js';
export type { DeleteTaskInput, DeleteTaskResult } from './delete-task.js';
export type { ArchiveTaskInput, ArchiveTaskResult } from './archive-task.js';
export type { MergeTasksInput, MergeTasksResult } from './merge-tasks.js';

// Export functions
export { createTaskAction as createTask } from './create-task.js';
export { updateTaskDescription } from './update-description.js';
export { renameTask } from './rename-task.js';
export { archiveTask } from './archive-task.js';
export { deleteTask } from './delete-task.js';
export { mergeTasks } from './merge-tasks.js';

// Utility/finder functions fall back to legacy kanban for now
export { findTaskById, findTaskByTitle, readTasksFolder } from '../../kanban.js';
