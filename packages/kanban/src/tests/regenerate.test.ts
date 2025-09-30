import path from "node:path";
import { mkdir, readFile } from "node:fs/promises";

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

test(
  "Task file bodies are the same before and after the board regeneration",
  async (t) => {
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
  },
);
