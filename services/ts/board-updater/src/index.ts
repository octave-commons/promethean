import { spawn } from "child_process";
import { join } from "path";
import WebSocket from "ws";

const QUEUE = "file-watcher-kanban-update";
const SERVICE_ID = "board-updater";

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

  function send(message: object) {
    ws.send(JSON.stringify(message));
  }

  async function handleTask(task: any) {
    console.log("Running board updater task...");
    try {
      await runPython(join("scripts", "hashtags_to_kanban.py"), repoRoot);
      send({ action: "ack", taskId: task.id, workerId: SERVICE_ID });
    } catch (err) {
      console.error("update board failed", err);
      // NOTE: We still ack to avoid retry loops. Retry logic can be added later.
      send({ action: "ack", taskId: task.id, workerId: SERVICE_ID });
    }
    // After finishing, mark ready for next task
    send({ action: "ready", queue: QUEUE, workerId: SERVICE_ID });
  }

  ws.on("open", () => {
    console.log("board updater connected to broker");
    send({ action: "ready", queue: QUEUE, workerId: SERVICE_ID });
  });

  ws.on("message", (raw: WebSocket.RawData) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg?.action === "task-assigned" && msg.task) {
        handleTask(msg.task);
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
