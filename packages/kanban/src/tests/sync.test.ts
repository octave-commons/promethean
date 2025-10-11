import path from "node:path";
import { mkdir, writeFile, readFile } from "node:fs/promises";

import test from "ava";

import { MarkdownBoard } from "@promethean/markdown/kanban.js";

import { pushToTasks, syncBoardAndTasks } from "../lib/kanban.js";
import {
  makeBoard,
  makeTask,
  snapshotTaskFiles,
  writeTaskFile,
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

  // Compare content after normalizing trailing newlines (sync operation normalizes whitespace)
  const normalizeContent = (content: string) => content.replace(/\n+$/, '\n\n');
  const normalizedBefore = Array.from(before.entries()).map(([file, content]) => [file, normalizeContent(content)]);
  const normalizedAfter = Array.from(after.entries()).map(([file, content]) => [file, normalizeContent(content)]);
  t.deepEqual(normalizedAfter, normalizedBefore);
});

test("There are no broken links on the generated board file", async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, "board.md");
  const tasksDir = path.join(tempDir, "tasks");

  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, "", "utf8");

  const todoTask = makeTask({
    uuid: "sync-links-1",
    title: "Duplicate Task",
    status: "Todo",
    slug: undefined,
  });
  const todoTaskDuplicate = makeTask({
    uuid: "sync-links-2",
    title: "Duplicate Task",
    status: "Todo",
    slug: undefined,
  });
  const inProgressTask = makeTask({
    uuid: "sync-links-3",
    title: "Progress Task",
    status: "In Progress",
    slug: undefined,
  });

  const board = makeBoard([
    {
      name: "Todo",
      count: 2,
      limit: null,
      tasks: [todoTask, todoTaskDuplicate],
    },
    {
      name: "In Progress",
      count: 1,
      limit: null,
      tasks: [inProgressTask],
    },
  ]);

  await pushToTasks(board, tasksDir);
  await syncBoardAndTasks(board, tasksDir, boardPath);

  const boardContent = await readFile(boardPath, "utf8");
  const snapshot = await snapshotTaskFiles(tasksDir);
  const existingFiles = new Set(snapshot.keys());
  const wikiLinkTargets = Array.from(boardContent.matchAll(/\[\[([^\]]+)\]\]/g))
    .map((match) => match[1] ?? "")
    .map((target) => target.split("|", 1)[0]?.trim() ?? "")
    .filter((target) => target.length > 0);

  t.true(
    wikiLinkTargets.length > 0,
    "Expected at least one task link on board",
  );
  for (const target of wikiLinkTargets) {
    t.true(
      existingFiles.has(`${target}.md`),
      `Expected board link [[${target}]] to have a matching task file`,
    );
  }
});

test("There are no redundant board columns", async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, "board.md");
  const tasksDir = path.join(tempDir, "tasks");

  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, "", "utf8");

  const upperTask = makeTask({
    uuid: "sync-columns-1",
    title: "Upper Task",
    status: "Todo (13)",
  });
  const lowerTask = makeTask({
    uuid: "sync-columns-2",
    title: "Lower Task",
    status: "todo",
  });

  const board = makeBoard([
    { name: "Todo (13)", count: 1, limit: null, tasks: [upperTask] },
    { name: "todo", count: 1, limit: null, tasks: [lowerTask] },
  ]);

  await pushToTasks(board, tasksDir);
  await syncBoardAndTasks(board, tasksDir, boardPath);

  t.is(board.columns.length, 1);
  t.is(board.columns[0]?.name, "Todo");
  t.is(board.columns[0]?.tasks.length, 2);

  const boardContent = await readFile(boardPath, "utf8");
  const headings = Array.from(boardContent.matchAll(/^##\s+(.+)$/gm))
    .map((match) => match[1] ?? "")
    .map((heading) => heading.trim())
    .filter((heading) => heading.length > 0);
  t.deepEqual(headings, ["Todo"]);

  const snapshot = await snapshotTaskFiles(tasksDir);
  for (const [, content] of snapshot.entries()) {
    t.true(
      content.includes('status: "Todo"'),
      "Expected task status to normalize to canonical column name",
    );
  }
});

test("Task statuses are case insensitive, always mapping to a single column regardless of case or punctuation", async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, "board.md");
  const tasksDir = path.join(tempDir, "tasks");

  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, "", "utf8");

  const statusVariants = ["In-Progress", "in-progress", "IN-PROGRESS"] as const;
  await Promise.all(
    statusVariants.map(async (status, index) => {
      const task = makeTask({
        uuid: `sync-status-${index}`,
        title: `Case Task ${index + 1}`,
        status,
        slug: `case-task-${index + 1}`,
      });
      await writeTaskFile(tasksDir, task);
    }),
  );

  const board = makeBoard([
    { name: "In-Progress", count: 0, limit: null, tasks: [] },
  ]);

  await syncBoardAndTasks(board, tasksDir, boardPath);

  t.is(board.columns.length, 1);
  t.is(board.columns[0]?.name, "In-Progress");
  t.is(board.columns[0]?.tasks.length, statusVariants.length);

  const boardContent = await readFile(boardPath, "utf8");
  const headings = Array.from(boardContent.matchAll(/^##\s+(.+)$/gm))
    .map((match) => match[1] ?? "")
    .map((heading) => heading.trim())
    .filter((heading) => heading.length > 0);
  t.deepEqual(headings, ["In-Progress"]);

  const snapshot = await snapshotTaskFiles(tasksDir);
  for (const [, content] of snapshot.entries()) {
    t.true(
      content.includes('status: "In-Progress"'),
      "Expected task status to normalize to the canonical column name",
    );
  }
});

test("syncBoardAndTasks removes duplicate fallback entries", async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, "board.md");
  const tasksDir = path.join(tempDir, "tasks");

  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, "", "utf8");

  const canonical = makeTask({
    uuid: "sync-dedupe-canonical",
    title: "Sync Dedupe",
    status: "Document",
    slug: "sync-dedupe",
  });
  const stale = makeTask({
    uuid: "sync-dedupe-stale",
    title: "Sync Dedupe",
    status: "Document",
    slug: "Task deadbeef",
  });

  const board = makeBoard([
    {
      name: "Document",
      count: 2,
      limit: null,
      tasks: [stale, canonical],
    },
  ]);

  await writeTaskFile(tasksDir, canonical, { content: "Canonical sync content" });

  await syncBoardAndTasks(board, tasksDir, boardPath);

  const documentColumn = board.columns[0];
  t.truthy(documentColumn);
  t.is(documentColumn?.tasks.length, 1);
  t.is(documentColumn?.tasks[0]?.uuid, canonical.uuid);

  const snapshot = await snapshotTaskFiles(tasksDir);
  t.deepEqual(Array.from(snapshot.keys()), ["sync-dedupe.md"]);

  const boardContent = await readFile(boardPath, "utf8");
  t.false(boardContent.includes("sync-dedupe-stale"));
  t.true(boardContent.includes(canonical.uuid));
});
