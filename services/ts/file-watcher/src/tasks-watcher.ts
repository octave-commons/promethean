import chokidar from "chokidar";
import { FileLocks } from "./file-lock.js";

export interface TasksWatcherOptions {
  tasksPath: string;
  /**
   * Populate a newly created task file using the LLM service.
   */
  populateTask: (path: string) => Promise<void>;
  updateBoard: () => Promise<void>;
  fileLocks: FileLocks;
  lockDelay?: number;
}

export function createTasksWatcher(options: TasksWatcherOptions) {
  const { tasksPath, populateTask, updateBoard, fileLocks } = options;
  const lockDelay = options.lockDelay ?? 100;

  const watcher = chokidar.watch(tasksPath, { ignoreInitial: true });

  watcher.on("add", (path) => {
    if (fileLocks.isLocked(path)) {
      console.log("Ignoring task addition triggered by watcher");
      return;
    }
    console.log("New task file added, populating stub...");
    fileLocks.lock(path);
    populateTask(path)
      .then(() => updateBoard())
      .catch((err) => console.error("populateTask failed", err))
      .finally(() => {
        fileLocks.unlockAfter(path, lockDelay);
      });
  });

  watcher.on("change", (path) => {
    if (fileLocks.isLocked(path)) {
      console.log("Ignoring task change triggered by watcher");
      return;
    }
    console.log("Task file changed, regenerating board...");
    fileLocks.lock(path);
    updateBoard().finally(() => fileLocks.unlockAfter(path, lockDelay));
  });

  return watcher;
}
