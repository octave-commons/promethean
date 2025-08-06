import { spawn } from "child_process";
import { join } from "path";
import WebSocket from "ws";

const EVENTS = {
  add: "file-watcher-task-add",
  change: "file-watcher-task-change",
};

const defaultRepoRoot = process.env.REPO_ROOT || "";

function runPython(script: string, repoRoot: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("python", [script], { cwd: repoRoot });
    proc.stderr.on("data", (c) => process.stderr.write(c));
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Process exited with code ${code}`));
    });
  });
}

export function startBoardUpdater(repoRoot = defaultRepoRoot) {
  const brokerUrl = process.env.BROKER_URL || "ws://localhost:7000";
  const ws = new WebSocket(brokerUrl);

  async function handleTaskChange() {
    try {
      await runPython(join("scripts", "hashtags_to_kanban.py"), repoRoot);
    } catch (err) {
      console.error("update board failed", err);
    }
  }

  ws.on("open", () => {
    ws.send(JSON.stringify({ action: "subscribe", topic: EVENTS.add }));
    ws.send(JSON.stringify({ action: "subscribe", topic: EVENTS.change }));
    console.log("board updater connected to broker");
  });

  ws.on("message", (raw: WebSocket.RawData) => {
    try {
      const { event } = JSON.parse(raw.toString());
      if (event?.type === EVENTS.add || event?.type === EVENTS.change) {
        handleTaskChange();
      }
    } catch (err) {
      console.error("invalid broker message", err);
    }
  });

  return {
    async close() {
      ws.close();
    },
  };
}

if (process.env.NODE_ENV !== "test") {
  startBoardUpdater();
  console.log("Board updater running...");
}
