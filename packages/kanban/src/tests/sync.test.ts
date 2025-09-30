import path from "node:path";
import { mkdir, writeFile, readFile } from "node:fs/promises";

import test from "ava";

import { MarkdownBoard } from "@promethean/markdown/kanban.js";

import { pushToTasks, syncBoardAndTasks } from "../lib/kanban.js";
import {
  makeBoard,
  makeTask,
  snapshotTaskFiles,
  withTempDir,
} from "../test-utils/helpers.js";

test("There are no yaml errors in frontmatter", async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, "board.md");
  const tasksDir = path.join(tempDir, "tasks");
  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, "", "utf8");

  const task = makeTask({
    uuid: "sync-1",
    title: "Sync Task",
    status: "Todo",
    slug: "sync-task",
  });
  const board = makeBoard([
    { name: "Todo", count: 1, limit: null, tasks: [task] },
  ]);

  await pushToTasks(board, tasksDir);
  await syncBoardAndTasks(board, tasksDir, boardPath);

  const boardContent = await readFile(boardPath, "utf8");
  await t.notThrowsAsync(async () => MarkdownBoard.load(boardContent));
});

test("Task file bodies are the same before and after the board regeneration", async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, "board.md");
  const tasksDir = path.join(tempDir, "tasks");
  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, "", "utf8");

  const task = makeTask({
    uuid: "sync-stability",
    title: "Sync Stable",
    status: "Todo",
    slug: "sync-stable",
  });
  const board = makeBoard([
    { name: "Todo", count: 1, limit: null, tasks: [task] },
  ]);

  await pushToTasks(board, tasksDir);
  const before = await snapshotTaskFiles(tasksDir);

  await syncBoardAndTasks(board, tasksDir, boardPath);
  const after = await snapshotTaskFiles(tasksDir);

  t.deepEqual(Array.from(after.entries()), Array.from(before.entries()));
});

test.todo("There are no broken links on the generated board file");
test.todo("There are no redundant board columns");
test.todo(
  "Task statuses are case insensitive, always mapping to a single column regardless of case or punctuation",
);
