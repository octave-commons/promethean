import { join } from "path";
import BrokerClient from "@shared/js/brokerClient.js";
import { createBoardWatcher } from "./board-watcher.js";
import { createTasksWatcher } from "./tasks-watcher.js";

export interface FileWatcherOptions {
  repoRoot?: string;
  publish?: (type: string, payload: any) => void;
  maxConcurrentLLMTasks?: number;
}

const defaultRepoRoot = process.env.REPO_ROOT || "";

export function startFileWatcher(options: FileWatcherOptions = {}) {
  const repoRoot = options.repoRoot ?? defaultRepoRoot;
  const boardPath = join(repoRoot, "docs", "agile", "boards", "kanban.md");
  const tasksPath = join(repoRoot, "docs", "agile", "tasks");

  const broker = options.publish
    ? undefined
    : new BrokerClient({
        url: process.env.BROKER_URL || "ws://localhost:7000",
      });

  async function publish(type: string, payload: any) {
    if (options.publish) return options.publish(type, payload);
    await broker!.connect();
    broker!.publish(type, payload, { source: "file-watcher" });
  }

  broker?.connect().then(() => console.log("file watcher connected to broker"));

  const boardWatcher = createBoardWatcher({ boardPath, publish });
  const tasksWatcher = createTasksWatcher({
    tasksPath,
    publish,
  });

  return {
    boardWatcher,
    tasksWatcher,
    async close() {
      await Promise.all([boardWatcher.close(), tasksWatcher.close()]);
      (broker as any)?.socket?.close?.();
    },
  };
}

if (process.env.NODE_ENV !== "test") {
  startFileWatcher();
  console.log("File watcher running...");
}
