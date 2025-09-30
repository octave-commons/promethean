import path from "node:path";
import { mkdir } from "node:fs/promises";

import test from "ava";

import { parseFrontmatter as parseMarkdownFrontmatter } from "@promethean/markdown/frontmatter";

import { pushToTasks } from "../lib/kanban.js";
import { makeBoard, makeTask, snapshotTaskFiles, withTempDir } from "../test-utils/helpers.js";

test("There are no yaml errors in frontmatter", async (t) => {
  const tempDir = await withTempDir(t);
  const tasksDir = path.join(tempDir, "tasks");
  await mkdir(tasksDir, { recursive: true });

  const task = makeTask({
    uuid: "push-1",
    title: "Push Test",
    status: "Todo",
    slug: "push-test",
    content: "Task body",
  });
  const board = makeBoard([
    { name: "Todo", count: 1, limit: null, tasks: [task] },
  ]);

  await pushToTasks(board, tasksDir);

  const snapshot = await snapshotTaskFiles(tasksDir);
  for (const [, content] of snapshot.entries()) {
    t.notThrows(() => parseMarkdownFrontmatter(content));
  }
});

test("Task file bodies are the same before and after the push", async (t) => {
  const tempDir = await withTempDir(t);
  const tasksDir = path.join(tempDir, "tasks");
  await mkdir(tasksDir, { recursive: true });

  const task = makeTask({
    uuid: "push-stability",
    title: "Stable Push",
    status: "Todo",
    slug: "stable-push",
    content: "Push body",
  });
  const board = makeBoard([
    { name: "Todo", count: 1, limit: null, tasks: [task] },
  ]);

  // Seed the filesystem with the expected content.
  await pushToTasks(board, tasksDir);
  const before = await snapshotTaskFiles(tasksDir);

  await pushToTasks(board, tasksDir);
  const after = await snapshotTaskFiles(tasksDir);

  t.deepEqual(Array.from(after.entries()), Array.from(before.entries()));
});
