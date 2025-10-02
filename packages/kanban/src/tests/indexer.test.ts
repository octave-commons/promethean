import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";

import test from "ava";

import { indexForSearch } from "../lib/kanban.js";
import { withTempDir } from "../test-utils/helpers.js";

const writeTaskMarkdown = async (
  dir: string,
  fileName: string,
  task: Readonly<{
    id: string;
    uuid: string;
    title: string;
    status: string;
    priority: string;
    owner: string;
    labels: ReadonlyArray<string>;
    created: string;
    body: string;
  }>,
): Promise<void> => {
  const frontmatter = [
    "---",
    `id: ${task.id}`,
    `uuid: ${task.uuid}`,
    `title: ${task.title}`,
    `status: ${task.status}`,
    `priority: ${task.priority}`,
    `owner: ${task.owner}`,
    "labels:",
    ...task.labels.map((label) => `  - ${label}`),
    `created: "${task.created}"`,
    "---",
    "",
    task.body,
    "",
  ].join("\n");
  await writeFile(path.join(dir, fileName), frontmatter, "utf8");
};

test("indexForSearch writes JSONL index when --write is provided", async (t) => {
  const repoDir = await withTempDir(t);
  const tasksDir = path.join(repoDir, "docs", "agile", "tasks");
  const boardsDir = path.join(repoDir, "docs", "agile", "boards");
  const indexFile = path.join(boardsDir, "index.jsonl");
  await mkdir(tasksDir, { recursive: true });
  await mkdir(boardsDir, { recursive: true });
  const configPath = path.join(repoDir, "promethean.kanban.json");
  await writeFile(
    configPath,
    `${JSON.stringify(
      {
        tasksDir: "docs/agile/tasks",
        indexFile: "docs/agile/boards/index.jsonl",
        boardFile: "docs/agile/boards/generated.md",
        exts: [".md"],
        requiredFields: [
          "id",
          "title",
          "status",
          "priority",
          "owner",
          "labels",
          "created",
        ],
        statusValues: ["todo", "doing", "review", "done"],
        priorityValues: ["low", "medium", "high", "critical"],
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  await writeTaskMarkdown(tasksDir, "task-one.md", {
    id: "TASK-001",
    uuid: "task-001",
    title: "Design search index",
    status: "Todo",
    priority: "high",
    owner: "Alex",
    labels: ["search", "design"],
    created: "2024-01-01",
    body: "Draft the initial search indexing strategy.",
  });

  await writeTaskMarkdown(tasksDir, "task-two.md", {
    id: "TASK-002",
    uuid: "task-002",
    title: "Implement search indexing",
    status: "Doing",
    priority: "medium",
    owner: "Blake",
    labels: ["search", "index"],
    created: "2024-01-05",
    body: "Build the CLI wiring for the search index.",
  });

  const result = await indexForSearch(tasksDir, {
    argv: ["--write"],
    env: {
      KANBAN_REPO: repoDir,
      KANBAN_CONFIG: configPath,
      KANBAN_TASKS_DIR: tasksDir,
      KANBAN_INDEX_FILE: indexFile,
    },
  });

  t.deepEqual(result, {
    started: true,
    tasksIndexed: 2,
    wroteIndexFile: true,
  });

  const raw = await readFile(indexFile, "utf8");
  t.true(raw.endsWith("\n"));
  const lines = raw
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as Record<string, unknown>);

  t.deepEqual(lines, [
    {
      id: "TASK-001",
      title: "Design search index",
      status: "Todo",
      priority: "high",
      owner: "Alex",
      labels: ["search", "design"],
      created: "2024-01-01",
      uuid: "task-001",
      path: "docs/agile/tasks/task-one.md",
    },
    {
      id: "TASK-002",
      title: "Implement search indexing",
      status: "Doing",
      priority: "medium",
      owner: "Blake",
      labels: ["search", "index"],
      created: "2024-01-05",
      uuid: "task-002",
      path: "docs/agile/tasks/task-two.md",
    },
  ]);
});
