import chokidar from "chokidar";
import { join } from "path";
import { FileLocks } from "./file-lock.js";

export interface BoardWatcherOptions {
  boardPath: string;
  tasksPath: string;
  runPython: (
    script: string,
    capture?: boolean,
    args?: string[],
  ) => Promise<string | void>;
  processKanban: (emit?: boolean) => Promise<void>;
  fileLocks: FileLocks;
  lockDelay?: number;
}

export function createBoardWatcher(options: BoardWatcherOptions) {
  const { boardPath, tasksPath, runPython, processKanban, fileLocks } = options;
  const lockDelay = options.lockDelay ?? 100;

  const watcher = chokidar.watch(boardPath, { ignoreInitial: true });
  watcher.on("change", () => {
    if (fileLocks.isLocked(boardPath)) {
      console.log("Ignoring board change triggered by watcher");
      return;
    }
    console.log("Board changed, syncing hashtags...");
    fileLocks.lock(boardPath);
    fileLocks.lock(tasksPath);
    runPython(join("scripts", "kanban_to_hashtags.py"))
      .then(() => processKanban())
      .catch((err) => console.error("kanban_to_hashtags failed", err))
      .finally(() => {
        fileLocks.unlockAfter(boardPath, lockDelay);
        fileLocks.unlockAfter(tasksPath, lockDelay);
      });
  });
  return watcher;
}
