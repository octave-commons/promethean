import { promises as fs, mkdtempSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

import test from "ava";
import {
  getMemoryBroker,
  resetMemoryBroker,
} from "@promethean/test-utils/broker.js";
import { sleep } from "@promethean/utils/sleep.js";

import { startFileWatcher } from "../index.js";

type MemoryBrokerLogEntry = ReturnType<typeof getMemoryBroker>["logs"][number];
type PublishLogEntry = Extract<MemoryBrokerLogEntry, { action: "publish" }> & {
  readonly data: { readonly type: string };
};

function isPublishLogEntry(
  entry: MemoryBrokerLogEntry,
): entry is PublishLogEntry {
  if (entry.action !== "publish") return false;
  const { data } = entry;
  return (
    typeof data === "object" &&
    data !== null &&
    "type" in data &&
    typeof (data as { type?: unknown }).type === "string"
  );
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

  const logs = getMemoryBroker("fw-unit").logs.filter(isPublishLogEntry);
  const types = logs.map((l) => l.data.type);
  t.true(types.includes("file-watcher-board-change"));
  t.true(types.includes("file-watcher-task-add"));
  t.true(types.includes("file-watcher-task-change"));

  await svc.close();
});
