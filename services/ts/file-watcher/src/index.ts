import { join } from "path";
import WebSocket from "ws";
import { createBoardWatcher } from "./board-watcher.js";
import { createTasksWatcher } from "./tasks-watcher.js";

export interface FileWatcherOptions {
  repoRoot?: string;
  publish?: (type: string, payload: any) => void;
}

const defaultRepoRoot = process.env.REPO_ROOT || "";

export function startFileWatcher(options: FileWatcherOptions = {}) {
  const repoRoot = options.repoRoot ?? defaultRepoRoot;
  const boardPath = join(repoRoot, "docs", "agile", "boards", "kanban.md");
  const tasksPath = join(repoRoot, "docs", "agile", "tasks");

  const brokerUrl = process.env.BROKER_URL || "ws://localhost:7000";
  const ws = options.publish ? undefined : new WebSocket(brokerUrl);

  function publish(type: string, payload: any) {
    if (options.publish) return options.publish(type, payload);
    if (ws && ws.readyState === ws.OPEN) {
      ws.send(
        JSON.stringify({
          action: "publish",
          message: { type, payload, source: "file-watcher" },
        }),
      );
    }
  }

  ws?.on("open", () => console.log("file watcher connected to broker"));

  const boardWatcher = createBoardWatcher({ boardPath, publish });
  const tasksWatcher = createTasksWatcher({ tasksPath, publish });

  return {
    boardWatcher,
    tasksWatcher,
    async close() {
      await Promise.all([boardWatcher.close(), tasksWatcher.close()]);
      ws?.close();
    },
  };
}

if (process.env.NODE_ENV !== "test") {
  startFileWatcher();
  console.log("File watcher running...");
}
