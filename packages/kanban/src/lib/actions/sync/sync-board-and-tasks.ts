import { pullFromFiles } from './pull-from-files.js';
import { pushToFiles } from './push-to-files.js';
import type { Board } from '../../types.js';

export type SyncBoardAndTasksInput = {
  board: Board;
  tasksDir: string;
  boardPath: string;
};

export type SyncBoardAndTasksResult = {
  board: { added: number; moved: number };
  tasks: { added: number; moved: number; statusUpdated: number };
  conflicting: string[];
};

export const syncBoardAndTasks = async (
  input: SyncBoardAndTasksInput,
): Promise<SyncBoardAndTasksResult> => {
  const { board, tasksDir, boardPath } = input;

  const boardResult = await pullFromFiles({ board, tasksDir, boardPath });
  const tasksResult = await pushToFiles({ board, tasksDir });

  return {
    board: { added: boardResult.added, moved: boardResult.moved },
    tasks: tasksResult,
    conflicting: boardResult.conflicting,
  };
};
