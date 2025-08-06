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
  runPython,
  callLLM,
  writeFile,
  mongoCollection,
  socket,
  maxConcurrentLLMTasks = 1,
}: TasksWatcherOptions) {
  const watcher = chokidar.watch(tasksPath, { ignoreInitial: true });

  const queue: string[] = [];
  let active = 0;

  async function process(path: string) {
    active++;
    try {
      await runPython?.(path);
      const content = await callLLM?.(path);
      if (content) await writeFile?.(path, content);
      await mongoCollection?.updateOne?.({}, {} as any);
      socket?.emit?.("task-processed", { path });
    } finally {
      active--;
      if (queue.length > 0) {
        process(queue.shift()!);
      }
    }
  }

  watcher.on("add", (path) => {
    publish(EVENTS.add, { path });
    queue.push(path);
    if (active < maxConcurrentLLMTasks) {
      process(queue.shift()!);
    }
  });

  watcher.on("change", (path) => {
    publish(EVENTS.change, { path });
  });

  return watcher;
}
