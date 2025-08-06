import chokidar from "chokidar";
const EVENTS = {
  add: "file-watcher-task-add",
  change: "file-watcher-task-change",
};

export interface TasksWatcherOptions {
  tasksPath: string;
  publish: (type: string, payload: any) => void;
}

export function createTasksWatcher({
  tasksPath,
  publish,
}: TasksWatcherOptions) {
  const watcher = chokidar.watch(tasksPath, { ignoreInitial: true });

  watcher.on("add", (path) => {
    publish(EVENTS.add, { path });
  });

  watcher.on("change", (path) => {
    publish(EVENTS.change, { path });
  });

  return watcher;
}
