import { promises as fs } from 'fs';
import type { Board, Task, ColumnData } from '../../types.js';

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
  for (const column of board.columns || []) {
    const taskIndex = column.tasks.findIndex((t: Task) => t.uuid === uuid);
    if (taskIndex >= 0) {
      const task = column.tasks[taskIndex];
      if (task) {
        return {
          task,
          column,
          index: taskIndex,
        };
      }
    }
  }
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
  const [movedTask] = newTasks.splice(index, 1);
  if (movedTask) {
    newTasks.splice(newIndex, 0, movedTask);
  }
  column.tasks = newTasks;

  const toPosition = { column: column.name, index: newIndex };

  // Save board if boardPath provided
  if (boardPath && !options?.dryRun) {
    const { formatMarkdown } = await import('../serializers/markdown-formatter.js');
    const boardContent = formatMarkdown({
      columns: board.columns.map(col => ({
        name: col.name,
        cards: col.tasks.map(task => ({
          id: task.uuid,
          text: task.title || '',
          done: task.status === 'done',
          tags: task.labels || [],
          links: [],
          attrs: {}
        }))
      })),
      frontmatter: {},
      settings: null
    });
    await fs.writeFile(boardPath, boardContent, 'utf8');
  }

  return {
    success: true,
    task: movedTask,
    fromPosition,
    toPosition,
  };
};
