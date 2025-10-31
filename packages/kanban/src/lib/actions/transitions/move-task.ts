import { promises as fs } from 'fs';
import type { Board, Task, ColumnData } from '../../types.js';
import { formatMarkdown } from '../../serializers/index.js';

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
  console.log(`DEBUG findTaskInBoard: looking for UUID ${uuid}`);
  console.log(
    `DEBUG findTaskInBoard: board columns:`,
    board.columns.map((c) => ({ name: c.name, taskCount: c.tasks.length })),
  );

  for (const column of board.columns || []) {
    const taskIndex = column.tasks.findIndex((t: Task) => t.uuid === uuid);
    if (taskIndex >= 0) {
      const task = column.tasks[taskIndex];
      if (task) {
        console.log(
          `DEBUG findTaskInBoard: found task ${task.title} in column ${column.name} at index ${taskIndex}`,
        );
        return {
          task,
          column,
          index: taskIndex,
        };
      }
    }
  }
  console.log(`DEBUG findTaskInBoard: task ${uuid} not found`);
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
    return { success: true, task, fromPosition, toPosition: fromPosition };
  }

  // Move task within column
  const newTasks = [...column.tasks];
  const [removedTask] = newTasks.splice(index, 1);
  const taskToInsert = removedTask ?? task;
  newTasks.splice(newIndex, 0, taskToInsert);
  column.tasks = newTasks;

  const toPosition = { column: column.name, index: newIndex };

  // Save board if boardPath provided
  if (boardPath && !options?.dryRun) {
    const boardContent = formatMarkdown({
      columns: board.columns.map((col) => ({
        name: col.name,
        cards: col.tasks.map((task) => ({
          id: task.uuid,
          text: task.title || '',
          done: task.status === 'done',
          tags: task.labels || [],
          links: [],
          attrs: {},
        })),
      })),
      frontmatter: {},
      settings: null,
    });
    await fs.writeFile(boardPath, boardContent, 'utf8');
  }

  const finalTask = column.tasks[newIndex] ?? taskToInsert;

  return {
    success: true,
    task: finalTask,
    fromPosition,
    toPosition,
  };
};
