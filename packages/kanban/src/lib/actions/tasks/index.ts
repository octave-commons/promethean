/**
 * Barrel exports for task actions
 */

export { createTaskAction as createTask } from './create-task.js';
export { updateTaskDescription } from './update-description.js';

// Use functional or fallback implementations for other task lifecycle actions
export { renameTask } from './rename-task.js';
export { archiveTask } from './archive-task.js';
export { deleteTask } from './delete-task.js';
export { mergeTasks } from './merge-tasks.js';

// Utility/finder functions fall back to legacy kanban for now
export { findTaskById, findTaskByTitle, readTasksFolder } from '../../kanban.js';
