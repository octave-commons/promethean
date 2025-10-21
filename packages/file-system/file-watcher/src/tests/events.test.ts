import { mkdtempSync, writeFileSync, promises as fs } from "fs";
import { tmpdir } from "os";
import { join } from "path";

import test from "ava";
import { sleep } from "@promethean/utils";

import { startFileWatcher } from "../index.js";
const EVENTS = {
  board: "file-watcher-board-change",
  add: "file-watcher-task-add",
  change: "file-watcher-task-change",
};

test("emits board change events", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "fw-"));
  const boardDir = join(root, "docs", "agile", "boards");
  const tasksDir = join(root, "docs", "agile", "tasks");
  await fs.mkdir(boardDir, { recursive: true });
  await fs.mkdir(tasksDir, { recursive: true });
  const boardPath = join(boardDir, "kanban.md");
  writeFileSync(boardPath, "initial");

  const events: any[] = [];
  const watcher = startFileWatcher({
    repoRoot: root,
    publish: (type, payload) => events.push({ type, payload }),
  });
  await fs.writeFile(boardPath, "changed");
  await sleep(200);
  (await watcher).close();
  t.true(events.some((e) => e.type === EVENTS.board));
});

test("emits task add and change events", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "fw-"));
  const boardDir = join(root, "docs", "agile", "boards");
  const tasksDir = join(root, "docs", "agile", "tasks");
  await fs.mkdir(boardDir, { recursive: true });
  await fs.mkdir(tasksDir, { recursive: true });
  const boardPath = join(boardDir, "kanban.md");
  writeFileSync(boardPath, "initial");

  const events: any[] = [];
  const watcher = startFileWatcher({
    repoRoot: root,
    publish: (type, payload) => events.push({ type, payload }),
  });
  await sleep(200);
  const taskFile = join(tasksDir, "task.md");
  await fs.writeFile(taskFile, "foo");
  await sleep(300);
  await fs.appendFile(taskFile, "bar");
  await sleep(300);
  (await watcher).close();
  t.true(events.some((e) => e.type === EVENTS.add));
});
