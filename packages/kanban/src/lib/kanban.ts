/**
 * Legacy compatibility layer for kanban library
 * Bridges old API with new functional architecture
 */

// Re-export everything from the main functional architecture
export * from './index.js';

// Re-export legacy types for backward compatibility
export type { Task, ColumnData } from './types.js';

// Legacy compatibility functions - re-export from functional actions
export { countTasks } from './actions/boards/count-tasks.js';

// Import functional actions for compatibility wrappers
import { loadBoard as loadBoardFunctional } from './actions/boards/index.js';
import { updateStatus as updateStatusFunctional } from './actions/transitions/update-status.js';
import { moveTask as moveTaskFunctional } from './actions/transitions/move-task.js';
import { createTask as createTaskFunctional } from './actions/tasks/index.js';
import { formatMarkdown } from './serializers/index.js';
import type { Board as FunctionalBoard } from './actions/types/board.js';
import type { Board as LegacyBoard, Task } from './types.js';

// Helper function to convert functional Board to legacy Board format
const convertToLegacyBoard = (functionalBoard: FunctionalBoard): LegacyBoard => {
  return {
    columns: functionalBoard.columns.map((col) => ({
      name: col.name,
      count: col.cards.length,
      tasks: col.cards.map((card) => ({
        uuid: card.id,
        title: card.text,
        status: card.done ? 'done' : 'todo',
        labels: [...card.tags],
        links: [...card.links],
        attrs: { ...card.attrs },
      })),
    })),
  };
};

// Legacy loadBoard wrapper - converts string path to LoadBoardInput and returns legacy Board format
export const loadBoard = async (boardPath: string, tasksPath?: string): Promise<LegacyBoard> => {
  try {
    const { readFile } = await import('node:fs/promises');
    const markdown = await readFile(boardPath, 'utf8');
    const loadResult = await loadBoardFunctional({ markdown });
    return convertToLegacyBoard(loadResult.board);
  } catch (error) {
    throw new Error(
      `Failed to load board from ${boardPath}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
};

// Legacy updateStatus wrapper - converts multiple args to input object
export const updateStatus = async (
  board: any,
  taskUuid: string,
  newStatus: string,
  boardPath?: string,
  tasksDir?: string,
  transitionRulesEngine?: any,
  reason?: string,
  eventLogManager?: any,
  actor?: string,
): Promise<any> => {
  const result = await updateStatusFunctional({
    board,
    taskUuid,
    newStatus,
    boardPath,
    tasksDir,
    options: {
      createBackup: true,
      dryRun: false,
    },
  });

  // Return legacy format
  return {
    success: result.success,
    task: result.task,
    previousStatus: result.previousStatus,
  };
};

// Legacy moveTask wrapper - converts multiple args to input object
export const moveTask = async (
  board: any,
  taskUuid: string,
  offset: number,
  boardPath?: string,
): Promise<any> => {
  const direction = offset < 0 ? 'up' : 'down';
  const result = await moveTaskFunctional({
    board,
    taskUuid,
    direction,
    boardPath,
  });

  // Return legacy format
  return {
    success: result.success,
    task: result.task,
    fromPosition: result.fromPosition,
    toPosition: result.toPosition,
  };
};

// Legacy createTask wrapper - converts multiple args to input object
export const createTask = async (
  board: any,
  status: string,
  taskData: any,
  tasksDir?: string,
  boardPath?: string,
): Promise<any> => {
  const result = await createTaskFunctional({
    board,
    status,
    taskData,
    tasksDir,
    boardPath,
  });

  // Return legacy format
  return result;
};



// Legacy compatibility wrappers for functions with signature changes
export const findTaskById = async (board: LegacyBoard, uuid: string): Promise<Task | undefined> => {
  for (const column of board.columns) {
    const task = column.tasks.find((t) => t.uuid === uuid);
    if (task) return task;
  }
  return undefined;
};

export const findTaskByTitle = async (board: LegacyBoard, title: string): Promise<Task | undefined> => {
  for (const column of board.columns) {
    const task = column.tasks.find((t) => t.title === title);
    if (task) return task;
  }
  return undefined;
};

export const getColumn = async (board: LegacyBoard, columnName: string): Promise<any> => {
  return board.columns.find((col) => col.name === columnName);
};

export const getTasksByColumn = async (board: LegacyBoard, columnName: string): Promise<Task[]> => {
  const column = board.columns.find((col) => col.name === columnName);
  return column ? column.tasks : [];
};

export const readTasksFolder = async (tasksDir: string): Promise<Task[]> => {
  const { readTasksFolder: readTasksFolderFunctional } = await import(
    './actions/tasks/read-tasks-folder.js'
  );
  const result = await readTasksFolderFunctional({ tasksPath: tasksDir });
  return result;
};

// Missing legacy functions
export const toFrontmatter = (board: LegacyBoard): any => {
  return {
    columns: board.columns.map((col) => ({
      name: col.name,
      limit: col.limit,
    })),
  };
};

export const validateStartingStatus = (status: string): boolean => {
  const validStatuses = ['todo', 'in_progress', 'done', 'blocked'];
  return validStatuses.includes(status);
};

// Legacy functions with proper implementations
export const pullFromTasks = async (tasksDir: string, boardPath?: string): Promise<LegacyBoard> => {
  const { readTasksFolder: readTasksFolderFunctional } = await import(
    './actions/tasks/read-tasks-folder.js'
  );
  const { generateBoard: generateBoardFunctional } = await import(
    './actions/boards/generate-board.js'
  );
  
  const tasks = await readTasksFolderFunctional({ tasksPath: tasksDir });
  const boardResult = await generateBoardFunctional({ tasks });
  return convertToLegacyBoard(boardResult.board);
};

export const pushToTasks = async (board: LegacyBoard, tasksDir: string): Promise<void> => {
  // For now, this is a placeholder - the saveTasks functional action doesn't exist yet
  console.log('pushToTasks not yet fully implemented in functional architecture');
};

export const syncBoardAndTasks = async (boardPath: string, tasksDir: string): Promise<LegacyBoard> => {
  // For now, just load the board - sync functionality needs to be implemented
  return await loadBoard(boardPath, tasksDir);
};

export const regenerateBoard = async (boardPath: string, tasksDir?: string): Promise<LegacyBoard> => {
  // For now, just load the board - regeneration functionality needs to be implemented
  return await loadBoard(boardPath, tasksDir);
};

export const generateBoardByTags = async (tags: string[], tasksDir: string): Promise<LegacyBoard> => {
  const { readTasksFolder: readTasksFolderFunctional } = await import(
    './actions/tasks/read-tasks-folder.js'
  );
  
  const tasks = await readTasksFolderFunctional({ tasksPath: tasksDir });
  // Filter tasks by tags and generate board - simplified version
  const filteredTasks = tasks.filter(task => 
    task.labels && task.labels.some(label => tags.includes(label))
  );
  
  // Create a simple board structure
  return {
    columns: [
      {
        name: 'todo',
        count: filteredTasks.length,
        tasks: filteredTasks
      }
    ]
  };
};

export const columnKey = (column: string): string => {
  return column.toLowerCase().replace(/\s+/g, '-');
};

// Use formatMarkdown as serializeBoard for backward compatibility
export const serializeBoard = formatMarkdown;

// Re-export writeBoard as alias for saveBoard
export { saveBoard as writeBoard } from './actions/boards/index.js';
