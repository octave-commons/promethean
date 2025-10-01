import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

import test from "ava";

import { createTask } from "../lib/kanban.js";
import {
  getTaskFileByUuid,
  makeBoard,
  makeTask,
  withTempDir,
  writeTaskFile,
} from "../test-utils/helpers.js";

const BLOCKED_BY_HEADING = "## ⛓️ Blocked By";
const BLOCKS_HEADING = "## ⛓️ Blocks";

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const extractSection = (
  markdown: string,
  heading: string,
): string | undefined => {
  const pattern = new RegExp(
    `${escapeRegExp(heading)}\\s*\n([\\s\\S]*?)(?=^##\\s+|$)`,
    "m",
  );
  const match = pattern.exec(markdown);
  if (!match) return undefined;
  return match[1]?.trim();
};

const ensureTemplate = async (
  tempDir: string,
  content: string,
): Promise<string> => {
  const templatePath = path.join(tempDir, "template.md");
  await writeFile(templatePath, content, "utf8");
  return templatePath;
};

test("A task is created from the provided template", async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, "board.md");
  const tasksDir = path.join(tempDir, "tasks");
  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, "", "utf8");

  const template = [
    "## Body",
    "",
    "{{BODY}}",
    "",
    BLOCKED_BY_HEADING,
    "Nothing",
    "",
    BLOCKS_HEADING,
    "Nothing",
    "",
  ].join("\n");
  const templatePath = await ensureTemplate(tempDir, template);

  const board = makeBoard([{ name: "Todo", count: 0, limit: null, tasks: [] }]);

  const created = await createTask(
    board,
    "Todo",
    {
      title: "Draft template task",
      templatePath,
      body: "Fill me in",
    },
    tasksDir,
    boardPath,
  );

  t.truthy(created.slug);
  const persisted = await getTaskFileByUuid(tasksDir, created.uuid);
  t.truthy(persisted);
  t.true(persisted!.content.includes("Draft template task"));
  t.true(persisted!.content.includes("Fill me in"));
});

test("when no template is provided, a default template is used", async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, "board.md");
  const tasksDir = path.join(tempDir, "tasks");
  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, "", "utf8");

  const template = [
    "## Overview",
    "",
    "{{BODY}}",
    "",
    BLOCKED_BY_HEADING,
    "Nothing",
    "",
    BLOCKS_HEADING,
    "Nothing",
    "",
  ].join("\n");
  const defaultTemplatePath = await ensureTemplate(tempDir, template);

  const board = makeBoard([{ name: "Todo", count: 0, limit: null, tasks: [] }]);

  const created = await createTask(
    board,
    "Todo",
    {
      title: "Default Template",
      defaultTemplatePath,
      body: "Default body",
    },
    tasksDir,
    boardPath,
  );

  const persisted = await getTaskFileByUuid(tasksDir, created.uuid);
  t.truthy(persisted);
  const section = extractSection(persisted!.content, "## Overview");
  t.is(section, "Default body");
});

test("The template's body section is populated with the provided text in the newly created task", async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, "board.md");
  const tasksDir = path.join(tempDir, "tasks");
  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, "", "utf8");

  const template = [
    "## Body",
    "",
    "{{BODY}}",
    "",
    BLOCKED_BY_HEADING,
    "Nothing",
    "",
    BLOCKS_HEADING,
    "Nothing",
    "",
  ].join("\n");
  const templatePath = await ensureTemplate(tempDir, template);

  const board = makeBoard([{ name: "Todo", count: 0, limit: null, tasks: [] }]);

  const created = await createTask(
    board,
    "Todo",
    {
      title: "Body Filled Task",
      templatePath,
      body: "Detailed notes go here",
    },
    tasksDir,
    boardPath,
  );

  const persisted = await getTaskFileByUuid(tasksDir, created.uuid);
  t.truthy(persisted);
  const section = extractSection(persisted!.content, "## Body");
  t.is(section, "Detailed notes go here");
});

test("A task's blocked by section contains wikilinks to the tasks that it is blocked by", async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, "board.md");
  const tasksDir = path.join(tempDir, "tasks");
  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, "", "utf8");

  const baseContent = `${BLOCKED_BY_HEADING}\n\nNothing\n\n${BLOCKS_HEADING}\n\nNothing\n`;
  const blocker = makeTask({
    uuid: "blocker-1",
    title: "Existing Blocker",
    status: "Todo",
    slug: "existing-blocker",
    content: baseContent,
  });
  const board = makeBoard([
    {
      name: "Todo",
      count: 1,
      limit: null,
      tasks: [blocker],
    },
  ]);
  await writeTaskFile(tasksDir, blocker, { content: baseContent });

  const templatePath = await ensureTemplate(tempDir, baseContent);

  const created = await createTask(
    board,
    "Todo",
    {
      title: "Blocked Task",
      templatePath,
      blockedBy: ["blocker-1"],
    },
    tasksDir,
    boardPath,
  );

  const persisted = await getTaskFileByUuid(tasksDir, created.uuid);
  t.truthy(persisted);
  const section = extractSection(persisted!.content, BLOCKED_BY_HEADING);
  t.truthy(section);
  t.regex(section!, /\[\[existing-blocker\|Existing Blocker\]\]/);
});

test("A task's blocking section contains wikilinks to the tasks that it blocks", async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, "board.md");
  const tasksDir = path.join(tempDir, "tasks");
  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, "", "utf8");

  const baseContent = `${BLOCKED_BY_HEADING}\n\nNothing\n\n${BLOCKS_HEADING}\n\nNothing\n`;
  const blocked = makeTask({
    uuid: "blocked-1",
    title: "Blocked Task",
    status: "Todo",
    slug: "blocked-task",
    content: baseContent,
  });
  const board = makeBoard([
    {
      name: "Todo",
      count: 1,
      limit: null,
      tasks: [blocked],
    },
  ]);
  await writeTaskFile(tasksDir, blocked, { content: baseContent });

  const templatePath = await ensureTemplate(tempDir, baseContent);

  const created = await createTask(
    board,
    "Todo",
    {
      title: "Blocking Task",
      templatePath,
      blocking: ["blocked-1"],
    },
    tasksDir,
    boardPath,
  );

  const persisted = await getTaskFileByUuid(tasksDir, created.uuid);
  t.truthy(persisted);
  const section = extractSection(persisted!.content, BLOCKS_HEADING);
  t.truthy(section);
  t.regex(section!, /\[\[blocked-task\|Blocked Task\]\]/);
});

test("When a task is created with a blocking section, the blocked task's blocked by section is also updated", async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, "board.md");
  const tasksDir = path.join(tempDir, "tasks");
  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, "", "utf8");

  const baseContent = `${BLOCKED_BY_HEADING}\n\nNothing\n\n${BLOCKS_HEADING}\n\nNothing\n`;
  const blocked = makeTask({
    uuid: "blocked-2",
    title: "Task waiting",
    status: "Todo",
    slug: "task-waiting",
    content: baseContent,
  });
  const board = makeBoard([
    {
      name: "Todo",
      count: 1,
      limit: null,
      tasks: [blocked],
    },
  ]);
  await writeTaskFile(tasksDir, blocked, { content: baseContent });

  const templatePath = await ensureTemplate(tempDir, baseContent);

  const created = await createTask(
    board,
    "Todo",
    {
      title: "New blocker",
      templatePath,
      blocking: ["blocked-2"],
    },
    tasksDir,
    boardPath,
  );

  const blockedPersisted = await getTaskFileByUuid(tasksDir, "blocked-2");
  t.truthy(blockedPersisted);
  const section = extractSection(blockedPersisted!.content, BLOCKED_BY_HEADING);
  t.truthy(section);
  t.regex(section!, /\[\[[^|]+\|New blocker\]\]/i);
  const newTask = await getTaskFileByUuid(tasksDir, created.uuid);
  t.truthy(newTask);
});

test("When a task is created with a blocked by section, the blocking task's blocking section is also updated", async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, "board.md");
  const tasksDir = path.join(tempDir, "tasks");
  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, "", "utf8");

  const baseContent = `${BLOCKED_BY_HEADING}\n\nNothing\n\n${BLOCKS_HEADING}\n\nNothing\n`;
  const blocker = makeTask({
    uuid: "blocker-2",
    title: "Existing helper",
    status: "Todo",
    slug: "existing-helper",
    content: baseContent,
  });
  const board = makeBoard([
    {
      name: "Todo",
      count: 1,
      limit: null,
      tasks: [blocker],
    },
  ]);
  await writeTaskFile(tasksDir, blocker, { content: baseContent });

  const templatePath = await ensureTemplate(tempDir, baseContent);

  const created = await createTask(
    board,
    "Todo",
    {
      title: "Blocked task",
      templatePath,
      blockedBy: ["blocker-2"],
    },
    tasksDir,
    boardPath,
  );

  const blockerPersisted = await getTaskFileByUuid(tasksDir, "blocker-2");
  t.truthy(blockerPersisted);
  const section = extractSection(blockerPersisted!.content, BLOCKS_HEADING);
  t.truthy(section);
  t.regex(section!, /\[\[[^|]+\|Blocked task\]\]/i);
  const newTask = await getTaskFileByUuid(tasksDir, created.uuid);
  t.truthy(newTask);
});
