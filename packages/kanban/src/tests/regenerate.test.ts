import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";

import test from "ava";

import { MarkdownBoard } from "@promethean/markdown/kanban.js";

import { regenerateBoard } from "../lib/kanban.js";
import {
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

  const task = makeTask({
    uuid: "regen-1",
    title: "Regenerate Task",
    status: "Review",
    slug: "regen-task",
  });
  await writeTaskFile(tasksDir, task, { content: "Body" });

  await regenerateBoard(tasksDir, boardPath);

  const boardContent = await readFile(boardPath, "utf8");
  await t.notThrowsAsync(async () => MarkdownBoard.load(boardContent));
});

test("Task file bodies are the same before and after the board regeneration", async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, "board.md");
  const tasksDir = path.join(tempDir, "tasks");
  await mkdir(tasksDir, { recursive: true });

  const task = makeTask({
    uuid: "regen-stability",
    title: "Stable Regen",
    status: "Todo",
    slug: "regen-stable",
  });
  await writeTaskFile(tasksDir, task, { content: "Constant" });

  const before = await snapshotTaskFiles(tasksDir);
  await regenerateBoard(tasksDir, boardPath);
  const after = await snapshotTaskFiles(tasksDir);

  t.deepEqual(Array.from(after.entries()), Array.from(before.entries()));
});

test("regenerateBoard retains tasks from both canonical and legacy schemas", async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, "board.md");
  const tasksDir = path.join(tempDir, "tasks");
  await mkdir(tasksDir, { recursive: true });

  const canonical = makeTask({
    uuid: "canonical-uuid-1",
    title: "Canonical Task",
    status: "Todo",
    slug: "canonical-task",
  });
  await writeTaskFile(tasksDir, canonical, { content: "Canonical body" });

  const legacyFrontmatter = [
    "---",
    "task-id: TASK-LEGACY-1",
    "title: Legacy Task",
    "state: Breakdown",
    "priority: p2",
    "labels:",
    "  - legacy",
    "created: 2025-02-02T00:00:00Z",
    "---",
    "",
    "Legacy body",
    "",
  ].join("\n");
  await writeFile(
    path.join(tasksDir, "legacy-task.md"),
    legacyFrontmatter,
    "utf8",
  );

  const result = await regenerateBoard(tasksDir, boardPath);

  t.is(result.totalTasks, 2);

  const boardContent = await readFile(boardPath, "utf8");
  t.regex(boardContent, /\(uuid:canonical-uuid-1\)/);
  t.regex(boardContent, /\(uuid:TASK-LEGACY-1\)/);
});

test("regenerateBoard links to the hyphenated basename when titles have spaces", async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, "board.md");
  const tasksDir = path.join(tempDir, "tasks");
  await mkdir(tasksDir, { recursive: true });

  const task = makeTask({
    uuid: "regen-hyphen",
    title: "Spaced Out Task",
    status: "Todo",
    slug: "spaced-out-task",
  });
  await writeTaskFile(tasksDir, task, { content: "Body" });

  await regenerateBoard(tasksDir, boardPath);

  const boardContent = await readFile(boardPath, "utf8");
  t.true(
    boardContent.includes("[[spaced-out-task|Spaced Out Task]]"),
    "Board should link to the hyphenated basename",
  );
  t.false(
    boardContent.includes("[[Spaced Out Task]]"),
    "Board should not link directly to the spaced title",
  );
});

test("regenerateBoard drops stale fallback entries from existing board", async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, "board.md");
  const tasksDir = path.join(tempDir, "tasks");
  await mkdir(tasksDir, { recursive: true });

  const canonical = makeTask({
    uuid: "regen-dedupe-uuid",
    title: "Regenerate Dup",
    status: "Document",
    slug: "regenerate-dup",
    content: "Canonical record",
  });
  await writeTaskFile(tasksDir, canonical, { content: canonical.content });

  const duplicateBoardContent = `---\nkanban-plugin: board\n---\n\n## Document\n\n- [ ] [[Task stale|Regenerate Dup]] prio:P2 (uuid:stale-dedupe-uuid)\n- [ ] [[regenerate-dup|Regenerate Dup]] prio:P2 (uuid:${canonical.uuid})\n`;
  await writeFile(boardPath, duplicateBoardContent, "utf8");

  const result = await regenerateBoard(tasksDir, boardPath);
  t.is(result.totalTasks, 1);

  const regeneratedBoard = await readFile(boardPath, "utf8");
  const uuids = Array.from(regeneratedBoard.matchAll(/\(uuid:([^)]+)\)/g)).map(
    (match) => match[1],
  );
  t.deepEqual(uuids, [canonical.uuid]);
});
