import { loadKanbanConfig } from '../../board/config.js';
import { indexTasks, writeIndexFile, serializeTasks } from '../../board/indexer.js';
import type { IndexTasksOptions } from '../../board/indexer.js';

export type IndexTasksInput = {
  argv?: ReadonlyArray<string>;
  env?: Readonly<NodeJS.ProcessEnv>;
};

export type IndexTasksResult = {
  started: true;
  tasksIndexed: number;
  wroteIndexFile: boolean;
};

export const indexKanbanTasks = async (input: IndexTasksInput = {}): Promise<IndexTasksResult> => {
  const { argv, env } = input;
  const { config, restArgs } = await loadKanbanConfig({ argv, env });

  const tasks = await indexTasks({
    tasksDir: config.tasksDir,
    exts: config.exts,
    repoRoot: config.repo,
  } satisfies IndexTasksOptions);

  const lines = serializeTasks(tasks);
  const shouldWrite = new Set(restArgs).has('--write');
  if (shouldWrite) {
    await writeIndexFile(config.indexFile, lines);
  }

  return {
    started: true,
    tasksIndexed: tasks.length,
    wroteIndexFile: shouldWrite,
  };
};
