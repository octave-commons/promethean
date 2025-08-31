import test from "ava";
import { promises as fs, mkdtempSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { startFileWatcher } from "../index.js";
import {
  getMemoryBroker,
  resetMemoryBroker,
} from "@promethean/test-utils/broker.js";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

test("publishes board/task events via memory broker", async (t) => {
  resetMemoryBroker("fw-unit");
  process.env.BROKER_URL = "memory://fw-unit";
  const root = mkdtempSync(join(tmpdir(), "fw-"));
  const boardDir = join(root, "docs", "agile", "boards");
  const tasksDir = join(root, "docs", "agile", "tasks");
  await fs.mkdir(boardDir, { recursive: true });
  await fs.mkdir(tasksDir, { recursive: true });
  const boardPath = join(boardDir, "kanban.md");
  writeFileSync(boardPath, "initial");

  const svc = await startFileWatcher({ repoRoot: root });
  await sleep(100);

  // trigger board change
  await fs.writeFile(boardPath, "changed");
  // trigger task add and change
  const task = join(tasksDir, "t1.md");
  await sleep(150);
  await fs.writeFile(task, "x");
  await sleep(150);
  await fs.appendFile(task, "y");
  await sleep(200);

  const logs = getMemoryBroker("fw-unit").logs.filter(
    (l) => l.action === "publish",
  );
  const types = logs.map((l) => l.data.type);
  t.true(types.includes("file-watcher-board-change"));
  t.true(types.includes("file-watcher-task-add"));
  t.true(types.includes("file-watcher-task-change"));

  await svc.close();
});
