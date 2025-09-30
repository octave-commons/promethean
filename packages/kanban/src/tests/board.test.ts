import path from "node:path";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";

import test, { type ExecutionContext } from "ava";

import {
  countTasks,
  findTaskById,
  findTaskByTitle,
  getColumn,
  getTasksByColumn,
  indexForSearch,
  moveTask,
  pullFromTasks,
  pushToTasks,
  regenerateBoard,
  searchTasks,
  syncBoardAndTasks,
  updateStatus,
} from "../lib/kanban.js";
import type { Board, ColumnData, Task } from "../lib/types.js";

const makeTask = (
  overrides: Partial<Task> & Pick<Task, "uuid" | "title" | "status">,
): Task => ({
  priority: "P3",
  labels: ["kanban"],
  created_at: "2025-09-01T00:00:00.000Z",
  estimates: {},
  content: "",
  slug: undefined,
  ...overrides,
});

const makeBoard = (columns: ColumnData[]): Board => ({ columns });

const withTempDir = async (t: ExecutionContext) => {
  const dir = await mkdtemp(path.join(tmpdir(), "kanban-test-"));
  t.teardown(async () => {
    await rm(dir, { recursive: true, force: true });
  });
  return dir;
};

const writeTaskFile = async (
  dir: string,
  task: Task,
  extra?: { content?: string; labels?: string[] },
) => {
  const body = extra?.content ?? "Details";
  const labels = extra?.labels ?? task.labels ?? [];
  const labelsLine = `labels:${
    labels.length === 0
      ? " []"
      : ` [${labels.map((label) => JSON.stringify(label)).join(", ")}]`
  }`;
  const frontmatter = `---\nuuid: ${task.uuid}\ntitle: ${task.title}\nstatus: ${task.status}\npriority: ${task.priority ?? ""}\n${labelsLine}\ncreated_at: ${
    task.created_at ?? "2025-09-01T00:00:00.000Z"
  }\n---\n\n${body}\n`;
  const filePath = path.join(dir, `${task.slug ?? task.title}.md`);
  await writeFile(filePath, frontmatter, "utf8");
  return filePath;
};

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
      tasks: [makeTask({ uuid: "doing-1", title: "Ship feature", status: "Doing" })],
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
  t.deepEqual(getTasksByColumn(board, "Doing").map((task) => task.uuid), ["doing-1"]);
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
  t.deepEqual(getColumn(board, "Todo").tasks.map((task) => task.uuid), [
    "todo-2",
    "todo-1",
  ]);
});

test("move_down", async (t) => {
  const board = sampleBoard();
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, "board.md");
  await writeFile(boardPath, "", "utf8");

  const result = await moveTask(board, "todo-1", +1, boardPath);
  t.truthy(result);
  t.deepEqual(getColumn(board, "Todo").tasks.map((task) => task.uuid), [
    "todo-2",
    "todo-1",
  ]);
});

test("pull", async (t) => {
  const board = makeBoard([{ name: "Todo", count: 0, limit: null, tasks: [] }]);
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, "board.md");
  const tasksDir = path.join(tempDir, "tasks");
  await writeFile(boardPath, "", "utf8");
  await mkdir(tasksDir, { recursive: true });

  const taskFile = makeTask({ uuid: "pull-1", title: "Pull task", status: "Doing" });
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
        makeTask({ uuid: "push-1", title: "Push Task", status: "Todo", labels: [] }),
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

  await writeTaskFile(tasksDir, makeTask({
    uuid: "sync-1",
    title: "Sync Task",
    status: "Doing",
  }));

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

  await writeTaskFile(tasksDir, makeTask({
    uuid: "regen-1",
    title: "Write overview",
    status: "Review",
  }));

  const outcome = await regenerateBoard(tasksDir, boardPath);
  t.is(outcome.totalTasks, 1);
  const boardFile = await readFile(boardPath, "utf8");
  t.true(boardFile.startsWith("---\nkanban-plugin: board"));
  t.regex(boardFile, /## Review/);
});

test("indexForSearch", async (t) => {
  t.deepEqual(await indexForSearch("."), { started: true });
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
  t.deepEqual(results.exact.map((task) => task.uuid), ["search-1"]);
  t.deepEqual(results.similar, []);
});

test.todo("createTask");
test.todo("archiveTask");
test.todo("deleteTask");
test.todo("updateTaskDescription");
test.todo("renameTask");
