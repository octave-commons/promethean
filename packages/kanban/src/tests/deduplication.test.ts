import path from "node:path";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";

import test from "ava";

import {
  pullFromTasks,
  pushToTasks,
  regenerateBoard,
  syncBoardAndTasks,
} from "../lib/kanban.js";
import {
  makeBoard,
  makeTask,
  withTempDir,
  writeTaskFile,
} from "../test-utils/helpers.js";

test("syncBoardAndTasks removes stale fallback-slug duplicates", async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, "board.md");
  const tasksDir = path.join(tempDir, "tasks");
  await mkdir(tasksDir, { recursive: true });

  const canonical = makeTask({
    uuid: "canonical-investigation-uuid",
    title: "Duplicated Investigation",
    status: "Document",
    slug: "canonical-investigation",
    content: "Canonical body",
  });

  const stale = makeTask({
    uuid: "stale-fallback-uuid",
    title: "Duplicated Investigation",
    status: "Document",
    slug: "Task deadbeef",
    content: "Outdated body",
  });

  const board = makeBoard([
    {
      name: "Document",
      count: 2,
      limit: null,
      tasks: [stale, canonical],
    },
  ]);

  await writeTaskFile(tasksDir, canonical, { content: canonical.content });

  const result = await syncBoardAndTasks(board, tasksDir, boardPath);
  t.deepEqual(result.conflicting, []);
  const documentColumn = board.columns[0];
  t.truthy(documentColumn);
  t.is(documentColumn?.tasks.length, 1);
  t.is(documentColumn?.tasks[0]?.uuid, canonical.uuid);

  const files = await readdir(tasksDir);
  t.deepEqual(files.sort(), ["canonical-investigation.md"]);

  const boardContent = await readFile(boardPath, "utf8");
  t.false(boardContent.includes("stale-fallback-uuid"));
  t.true(boardContent.includes("canonical-investigation-uuid"));
});

test("regenerateBoard overwrites duplicate board entries", async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, "board.md");
  const tasksDir = path.join(tempDir, "tasks");
  await mkdir(tasksDir, { recursive: true });

  const canonical = makeTask({
    uuid: "regen-canonical-uuid",
    title: "Regression Slice",
    status: "Document",
    slug: "regression-slice",
    content: "Canonical content",
  });

  await writeTaskFile(tasksDir, canonical, { content: canonical.content });

  const boardMd = `---\nkanban-plugin: board\n---\n\n## Document\n\n- [ ] [[Task deadbeef|Regression Slice]] prio:P2 (uuid:stale-uuid)\n- [ ] [[regression-slice|Regression Slice]] prio:P2 (uuid:${canonical.uuid})\n`;
  await mkdir(path.dirname(boardPath), { recursive: true });
  await writeFile(boardPath, boardMd, "utf8");

  const regenResult = await regenerateBoard(tasksDir, boardPath);
  t.is(regenResult.totalTasks, 1);

  const boardContent = await readFile(boardPath, "utf8");
  const uuidMatches = Array.from(boardContent.matchAll(/\(uuid:([^)]+)\)/g)).map(
    (match) => match[1],
  );
  t.deepEqual(uuidMatches, [canonical.uuid]);
});

test("pull + push pipeline keeps board and tasks aligned", async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, "board.md");
  const tasksDir = path.join(tempDir, "tasks");
  await mkdir(tasksDir, { recursive: true });

  const canonical = makeTask({
    uuid: "pipeline-canonical",
    title: "Pipeline Slice",
    status: "Document",
    slug: "pipeline-slice",
    content: "Pipeline content",
  });

  const stale = makeTask({
    uuid: "pipeline-stale",
    title: "Pipeline Slice",
    status: "Document",
    slug: "Task deadbeef",
    content: "Stale entry",
  });

  const board = makeBoard([
    {
      name: "Document",
      count: 2,
      limit: null,
      tasks: [stale, canonical],
    },
  ]);

  await writeTaskFile(tasksDir, canonical, { content: canonical.content });

  await pullFromTasks(board, tasksDir, boardPath);
  await pushToTasks(board, tasksDir);

  const files = await readdir(tasksDir);
  t.deepEqual(files.sort(), ["pipeline-slice.md"]);
  const documentColumn = board.columns[0];
  t.truthy(documentColumn);
  t.is(documentColumn?.tasks.length, 1);
  t.is(documentColumn?.tasks[0]?.uuid, canonical.uuid);
});
