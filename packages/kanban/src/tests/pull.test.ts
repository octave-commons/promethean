import path from "node:path";
import { mkdir, writeFile, readFile } from "node:fs/promises";

import test from "ava";

import { MarkdownBoard } from "@promethean/markdown/kanban.js";

import { pullFromTasks } from "../lib/kanban.js";
import {
  makeBoard,
  makeTask,
  snapshotTaskFiles,
  withTempDir,
  writeTaskFile,
} from "../test-utils/helpers.js";

test("There are no yaml errors in frontmatter", async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, "board.md");
  const tasksDir = path.join(tempDir, "tasks");
  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, "", "utf8");

  const board = makeBoard([{ name: "Todo", count: 0, limit: null, tasks: [] }]);
  const task = makeTask({
    uuid: "pull-task",
    title: "Pull Task",
    status: "Doing",
    slug: "pull-task",
    content: "Task body",
  });
  await writeTaskFile(tasksDir, task, { content: "Details" });

  await pullFromTasks(board, tasksDir, boardPath);

  const boardContent = await readFile(boardPath, "utf8");
  await t.notThrowsAsync(async () => MarkdownBoard.load(boardContent));
});

test("Task file bodies are the same before and after the board pull", async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, "board.md");
  const tasksDir = path.join(tempDir, "tasks");
  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, "", "utf8");

  const board = makeBoard([{ name: "Todo", count: 0, limit: null, tasks: [] }]);
  const task = makeTask({
    uuid: "pull-stability",
    title: "Stable Task",
    status: "Todo",
    slug: "stable-task",
  });
  await writeTaskFile(tasksDir, task, { content: "Stable details" });

  const before = await snapshotTaskFiles(tasksDir);
  await pullFromTasks(board, tasksDir, boardPath);
  const after = await snapshotTaskFiles(tasksDir);

  t.deepEqual(Array.from(after.entries()), Array.from(before.entries()));
});

test("pullFromTasks replaces stale board entries with canonical task data", async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, "board.md");
  const tasksDir = path.join(tempDir, "tasks");
  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, "", "utf8");

  const staleBoardTask = makeTask({
    uuid: "random-generated-uuid",
    title: "Duplicated Investigation",
    status: "Document",
    slug: "random-generated-uuid",
  });

  const board = makeBoard([
    {
      name: "Document",
      count: 1,
      limit: null,
      tasks: [staleBoardTask],
    },
  ]);

  const canonicalTask = makeTask({
    uuid: "canonical-investigation-uuid",
    title: "Duplicated Investigation",
    status: "Document",
    slug: "canonical-investigation",
  });

  await writeTaskFile(tasksDir, canonicalTask, { content: "Canonical body" });

  await pullFromTasks(board, tasksDir, boardPath);

  const documentColumn = board.columns.find((col) => col.name === "Document");
  t.truthy(documentColumn);
  t.is(documentColumn?.tasks.length, 1);
  t.is(documentColumn?.tasks[0]?.uuid, "canonical-investigation-uuid");

  const updatedBoardContent = await readFile(boardPath, "utf8");
  t.false(updatedBoardContent.includes("random-generated-uuid"));
  t.true(updatedBoardContent.includes("canonical-investigation-uuid"));
});
