import type { Board, Task, ColumnData } from '../../types.js';
import { debug } from '../../utils/logger.js';
import { writeBoard } from '../../serializers/board.js';

export type MoveTaskInput = {
  board: Board;
  taskUuid: string;
  direction: 'up' | 'down';
  boardPath?: string;
  options?: { dryRun?: boolean };
};

export type MoveTaskResult = {
  success: boolean;
  task?: Task;
  fromPosition?: { column: string; index: number };
  toPosition?: { column: string; index: number };
};

const findTaskInBoard = (
  board: Board,
  uuid: string,
): { task: Task; column: ColumnData; index: number } | undefined => {
  debug(`findTaskInBoard: looking for UUID ${uuid}`);
  debug(
    `findTaskInBoard: board columns:`,
    board.columns.map((c) => ({ name: c.name, taskCount: c.tasks.length })),
  );

  for (const column of board.columns || []) {
    const taskIndex = column.tasks.findIndex((t: Task) => t.uuid === uuid);
    if (taskIndex >= 0) {
      const task = column.tasks[taskIndex];
      if (task) {
        debug(
          `findTaskInBoard: found task ${task.title} in column ${column.name} at index ${taskIndex}`,
        );
        return {
          task,
          column,
          index: taskIndex,
        };
      }
    }
  }
  debug(`findTaskInBoard: task ${uuid} not found`);
  return undefined;
};

export const moveTask = async (input: MoveTaskInput): Promise<MoveTaskResult> => {
  const { board, taskUuid, direction, boardPath, options } = input;

  const located = findTaskInBoard(board, taskUuid);
  if (!located) {
    return { success: false };
  }

  const { task, column, index } = located;
  const fromPosition = { column: column.name, index };

  // Calculate new index
  const newIndex =
    direction === 'up' ? Math.max(0, index - 1) : Math.min(column.tasks.length - 1, index + 1);

  // Skip if no movement needed
  if (newIndex === index) {
    const normalizedTask =
      task.status === column.name ? task : ({ ...task, status: column.name } as Task);
    if (normalizedTask !== task) {
      column.tasks = [
        ...column.tasks.slice(0, index),
        normalizedTask,
        ...column.tasks.slice(index + 1),
      ];
      column.count = column.tasks.length;
    }
    return { success: true, task: normalizedTask, fromPosition, toPosition: fromPosition };
  }

  // Move task within column
  const newTasks = [...column.tasks];
  const [removedTask] = newTasks.splice(index, 1);
  const taskToInsert = removedTask ?? task;
  const taskWithUpdatedStatus: Task = {
    ...taskToInsert,
    status: column.name,
  };
  newTasks.splice(newIndex, 0, taskWithUpdatedStatus);
  column.tasks = newTasks;
  column.count = column.tasks.length;

  const toPosition = { column: column.name, index: newIndex };

  // Save board if boardPath provided
  if (boardPath && !options?.dryRun) {
    await writeBoard(boardPath, board);
  }

  const finalTask = column.tasks[newIndex] ?? taskWithUpdatedStatus;

  return {
    success: true,
    task: finalTask,
    fromPosition,
    toPosition,
  };
};
