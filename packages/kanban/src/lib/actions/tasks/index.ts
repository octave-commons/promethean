/**
 * Barrel exports for task actions
 */

export { createTaskAction as createTask } from './create-task.js';

// Fallback re-exports to legacy implementations until functional versions are completed
export {
  findTaskById,
  findTaskByTitle,
  readTasksFolder,
  updateTaskDescription,
  renameTask,
  archiveTask,
  deleteTask,
  mergeTasks,
} from '../../kanban.js';
