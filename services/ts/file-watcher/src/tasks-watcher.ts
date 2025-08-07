import chokidar from "chokidar";
const EVENTS = {
  add: "file-watcher-task-add",
  change: "file-watcher-task-change",
};

export interface TasksWatcherOptions {
  tasksPath: string;
  publish: (type: string, payload: any) => void;
  runPython?: (path: string) => Promise<any>;
  callLLM?: (path: string) => Promise<string>;
  writeFile?: (path: string, content: string) => Promise<void>;
  mongoCollection?: { updateOne: (...args: any[]) => Promise<any> };
  socket?: { emit: (...args: any[]) => void };
  maxConcurrentLLMTasks?: number;
}

export function createTasksWatcher({
  tasksPath,
  publish,
  socket,
}: TasksWatcherOptions) {
  const watcher = chokidar.watch(tasksPath, { ignoreInitial: true });

  watcher.on("add", (path) => {
    publish(EVENTS.add, { path });
    queue.push(path);
  });

  watcher.on("change", (path) => {
    publish(EVENTS.change, { path });
  });

  return watcher;
}
