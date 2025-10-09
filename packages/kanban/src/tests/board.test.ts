import path from "node:path";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";

import test from "ava";

import {
  archiveTask,
  countTasks,
  createTask,
  deleteTask,
  findTaskById,
  findTaskByTitle,
  getColumn,
  getTasksByColumn,
  moveTask,
  pullFromTasks,
  pushToTasks,
  regenerateBoard,
  renameTask,
  searchTasks,
  syncBoardAndTasks,
  updateStatus,
  updateTaskDescription,
} from "../lib/kanban.js";
import type { Board } from "../lib/types.js";
import {
  getTaskFileByUuid,
  makeBoard,
  makeTask,
  withTempDir,
  writeTaskFile,
} from "../test-utils/helpers.js";

const sampleBoard = (): Board =>
  makeBoard([
    {
      name: "Todo",
      count: 2,
      limit: null,
      tasks: [
        makeTask({ uuid: "todo-1", title: "Write docs", status: "Todo" }),
        makeTask({ uuid: "todo-2", title: "Review PR", status: "Todo" }),
      ],
    },
    {
      name: "Doing",
      count: 1,
      limit: null,
      tasks: [
        makeTask({ uuid: "doing-1", title: "Ship feature", status: "Doing" }),
      ],
    },
  ]);

test("count", (t) => {
  const board = sampleBoard();
  t.is(countTasks(board), 3);
  t.is(countTasks(board, "Todo"), 2);
  t.is(countTasks(board, "Done"), 0);
});

test("getColumn", (t) => {
  const board = sampleBoard();
  t.deepEqual(getColumn(board, "Todo").tasks.length, 2);
  const missing = getColumn(board, "Blocked");
  t.is(missing.name, "Blocked");
  t.deepEqual(missing.tasks, []);
});

test("getByColumn", (t) => {
  const board = sampleBoard();
  t.deepEqual(
    getTasksByColumn(board, "Doing").map((task) => task.uuid),
    ["doing-1"],
  );
});

test("find", (t) => {
  const board = sampleBoard();
  t.truthy(findTaskById(board, "todo-1"));
  t.falsy(findTaskById(board, "missing"));
});

test("find-by-title", (t) => {
  const board = sampleBoard();
  t.is(findTaskByTitle(board, "write docs")?.uuid, "todo-1");
  t.falsy(findTaskByTitle(board, "unknown"));
});

test("update_status", async (t) => {
  const board = sampleBoard();
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, "board.md");
  await writeFile(boardPath, "", "utf8");

  const updated = await updateStatus(board, "todo-1", "Doing", boardPath);
  t.truthy(updated);
  t.is(updated?.status, "Doing");
  t.is(getColumn(board, "Todo").count, 1);
  t.is(getColumn(board, "Doing").count, 2);
  const written = await readFile(boardPath, "utf8");
  t.true(written.startsWith("---\nkanban-plugin: board"));
});

test("move_up", async (t) => {
  const board = sampleBoard();
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, "board.md");
  await writeFile(boardPath, "", "utf8");

  const result = await moveTask(board, "todo-2", -1, boardPath);
  t.truthy(result);
  t.deepEqual(
    getColumn(board, "Todo").tasks.map((task) => task.uuid),
    ["todo-2", "todo-1"],
  );
});

test("move_down", async (t) => {
  const board = sampleBoard();
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, "board.md");
  await writeFile(boardPath, "", "utf8");

  const result = await moveTask(board, "todo-1", +1, boardPath);
  t.truthy(result);
  t.deepEqual(
    getColumn(board, "Todo").tasks.map((task) => task.uuid),
    ["todo-2", "todo-1"],
  );
});

test("pull", async (t) => {
  const board = makeBoard([{ name: "Todo", count: 0, limit: null, tasks: [] }]);
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, "board.md");
  const tasksDir = path.join(tempDir, "tasks");
  await writeFile(boardPath, "", "utf8");
  await mkdir(tasksDir, { recursive: true });

  const taskFile = makeTask({
    uuid: "pull-1",
    title: "Pull task",
    status: "Doing",
  });
  await writeTaskFile(tasksDir, taskFile);

  const result = await pullFromTasks(board, tasksDir, boardPath);
  t.deepEqual(result, { added: 1, moved: 0 });
  const doingColumn = getColumn(board, "Doing");
  t.is(doingColumn.tasks.length, 1);
  const pulledTask = doingColumn.tasks[0]!;
  t.true((pulledTask.labels?.length ?? 0) >= 1);
});

test("push", async (t) => {
  const tempDir = await withTempDir(t);
  const tasksDir = path.join(tempDir, "tasks");
  await mkdir(tasksDir, { recursive: true });
  const board = makeBoard([
    {
      name: "Todo",
      count: 1,
      limit: null,
      tasks: [
        makeTask({
          uuid: "push-1",
          title: "Push Task",
          status: "Todo",
          labels: [],
        }),
      ],
    },
  ]);

  await pushToTasks(board, tasksDir);
  const files = await readdir(tasksDir);
  t.is(files.length, 1);
  const fileName = files[0]!;
  const content = await readFile(path.join(tasksDir, fileName), "utf8");
  t.regex(content, /slug: "Push Task"/);
  t.regex(content, /labels: \[/);
});

test("sync", async (t) => {
  const tempDir = await withTempDir(t);
  const tasksDir = path.join(tempDir, "tasks");
  await mkdir(tasksDir, { recursive: true });
  const boardPath = path.join(tempDir, "board.md");
  await writeFile(boardPath, "", "utf8");

  const board = makeBoard([
    {
      name: "Todo",
      count: 1,
      limit: null,
      tasks: [makeTask({ uuid: "sync-1", title: "Sync Task", status: "Todo" })],
    },
  ]);

  await writeTaskFile(
    tasksDir,
    makeTask({
      uuid: "sync-1",
      title: "Sync Task",
      status: "Doing",
    }),
  );

  const result = await syncBoardAndTasks(board, tasksDir, boardPath);
  t.deepEqual(result.board, { added: 0, moved: 1 });
  t.deepEqual(result.tasks, { added: 0, moved: 1 });
  t.deepEqual(result.conflicting, ["sync-1"]);
});

test("regenerate", async (t) => {
  const tempDir = await withTempDir(t);
  const tasksDir = path.join(tempDir, "tasks");
  const boardPath = path.join(tempDir, "board.md");
  await mkdir(tasksDir, { recursive: true });

  await writeTaskFile(
    tasksDir,
    makeTask({
      uuid: "regen-1",
      title: "Write overview",
      status: "Review",
    }),
  );

  const outcome = await regenerateBoard(tasksDir, boardPath);
  t.is(outcome.totalTasks, 1);
  const boardFile = await readFile(boardPath, "utf8");
  t.true(boardFile.startsWith("---\nkanban-plugin: board"));
  t.regex(boardFile, /## review/);
});

test("search", async (t) => {
  const board = makeBoard([
    {
      name: "Todo",
      count: 1,
      limit: null,
      tasks: [
        makeTask({
          uuid: "search-1",
          title: "Investigate indexing",
          status: "Todo",
          labels: ["search", "index"],
          content: "Ensure the indexing pipeline covers markdown docs",
        }),
      ],
    },
  ]);

  const results = await searchTasks(board, "indexing");
  t.deepEqual(
    results.exact.map((task) => task.uuid),
    ["search-1"],
  );
  t.deepEqual(results.similar, []);
});

test("createTask", async (t) => {
  const board = makeBoard([{ name: "Todo", count: 0, limit: null, tasks: [] }]);
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, "board.md");
  const tasksDir = path.join(tempDir, "tasks");
  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, "", "utf8");

  const created = await createTask(
    board,
    "Todo",
    {
      title: "Draft release notes",
      content: "Summarize key features for the release",
      labels: ["release"],
      priority: "P1",
    },
    tasksDir,
    boardPath,
  );

  const todoColumn = getColumn(board, "Todo");
  t.truthy(created.uuid);
  t.is(todoColumn.tasks.length, 1);
  t.is(todoColumn.tasks[0]?.title, "Draft release notes");
  const persisted = await getTaskFileByUuid(tasksDir, created.uuid);
  t.truthy(persisted);
  t.regex(persisted!.content, /title: "Draft release notes"/);
  t.regex(persisted!.content, /Summarize key features for the release/);
  const boardFile = await readFile(boardPath, "utf8");
  t.regex(boardFile, /Draft release notes/);
});

test("archiveTask", async (t) => {
  const board = sampleBoard();
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, "board.md");
  const tasksDir = path.join(tempDir, "tasks");
  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, "", "utf8");
  await writeTaskFile(tasksDir, board.columns[0]!.tasks[0]!);
  await writeTaskFile(tasksDir, board.columns[0]!.tasks[1]!);
  await writeTaskFile(tasksDir, board.columns[1]!.tasks[0]!);

  const archived = await archiveTask(board, "todo-1", tasksDir, boardPath);
  t.truthy(archived);
  t.is(getColumn(board, "Todo").tasks.length, 1);
  t.true(
    getColumn(board, "Archive").tasks.some((task) => task.uuid === "todo-1"),
  );
  const persisted = await getTaskFileByUuid(tasksDir, "todo-1");
  t.truthy(persisted);
  t.regex(persisted!.content, /status: "Archive"/);
  const boardFile = await readFile(boardPath, "utf8");
  t.regex(boardFile, /## Archive/);
});

test("deleteTask", async (t) => {
  const board = sampleBoard();
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, "board.md");
  const tasksDir = path.join(tempDir, "tasks");
  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, "", "utf8");
  await writeTaskFile(tasksDir, board.columns[0]!.tasks[0]!);

  const removed = await deleteTask(board, "todo-1", tasksDir, boardPath);
  t.true(removed);
  t.false(
    getColumn(board, "Todo").tasks.some((task) => task.uuid === "todo-1"),
  );
  const persisted = await getTaskFileByUuid(tasksDir, "todo-1");
  t.falsy(persisted);
  const boardFile = await readFile(boardPath, "utf8");
  t.false(boardFile.includes("todo-1"));
});

test("updateTaskDescription", async (t) => {
  const board = sampleBoard();
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, "board.md");
  const tasksDir = path.join(tempDir, "tasks");
  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, "", "utf8");
  await writeTaskFile(tasksDir, board.columns[0]!.tasks[0]!);

  const updated = await updateTaskDescription(
    board,
    "todo-1",
    "Updated task body",
    tasksDir,
    boardPath,
  );

  t.truthy(updated);
  t.is(
    getColumn(board, "Todo").tasks.find((task) => task.uuid === "todo-1")
      ?.content,
    "Updated task body",
  );
  const persisted = await getTaskFileByUuid(tasksDir, "todo-1");
  t.truthy(persisted);
  t.regex(persisted!.content, /Updated task body/);
});

test("renameTask", async (t) => {
  const board = sampleBoard();
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, "board.md");
  const tasksDir = path.join(tempDir, "tasks");
  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, "", "utf8");
  await pushToTasks(board, tasksDir);
  const original = findTaskById(board, "todo-1");
  t.truthy(original);
  const oldSlug = original!.slug;

  const renamed = await renameTask(
    board,
    "todo-1",
    "Document architecture",
    tasksDir,
    boardPath,
  );

  t.truthy(renamed);
  t.is(renamed!.title, "Document architecture");
  t.not(renamed!.slug, oldSlug);
  const persisted = await getTaskFileByUuid(tasksDir, "todo-1");
  t.truthy(persisted);
  t.regex(persisted!.content, /title: "Document architecture"/);
  const files = await readdir(tasksDir);
  if (oldSlug) {
    t.false(files.includes(`${oldSlug}.md`));
  }
  const boardFile = await readFile(boardPath, "utf8");
  t.regex(boardFile, /Document architecture/);
});
