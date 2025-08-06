import chokidar from "chokidar";
import { basename } from "path";
import { stat, writeFile } from "fs/promises";
import { FileLocks } from "./file-lock.js";

export interface TasksWatcherOptions {
  tasksPath: string;
  callLLM: (
    prompt: string,
    context: { role: string; content: string }[],
  ) => Promise<string>;
  updateBoard: () => Promise<void>;
  fileLocks: FileLocks;
  lockDelay?: number;
}

export function createTasksWatcher(options: TasksWatcherOptions) {
  const { tasksPath, callLLM, updateBoard, fileLocks } = options;
  const lockDelay = options.lockDelay ?? 100;

  const watcher = chokidar.watch(tasksPath, { ignoreInitial: true });

  const TEMPLATE_PROMPT =
    "You are an engineering assistant. Given a task title, produce a concise markdown task stub with headings for Goals, Requirements, and Subtasks.";

  watcher.on("add", (path) => {
    if (fileLocks.isLocked(path)) {
      console.log("Ignoring task addition triggered by watcher");
      return;
    }
    console.log("New task file added, populating stub...");
    fileLocks.lock(path);
    (async () => {
      try {
        const info = await stat(path);
        if (info.size > 0) {
          return;
        }
      } catch {}

      try {
        const title = basename(path, ".md").replace(/_/g, " ");
        let content = await callLLM(TEMPLATE_PROMPT, [
          { role: "user", content: `Title: ${title}` },
        ]);
        content = content.trim();
        if (!content) {
          content = `## 🛠️ Task: ${title}\n\n- outline details here`;
        }
        if (!content.startsWith("#")) {
          content = `#Todo\n\n${content}`;
        }
        if (!content.endsWith("\n")) {
          content += "\n";
        }
        await writeFile(path, content);
        await updateBoard();
      } catch (err) {
        console.error("populate_task_llm failed", err);
      } finally {
        fileLocks.unlockAfter(path, lockDelay);
      }
    })();
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
