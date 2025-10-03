import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";

import test from "ava";

import { indexForSearch } from "../lib/kanban.js";
import { withTempDir } from "../test-utils/helpers.js";

const TASK_BODY = `Plan the integration so all teams know how to use the index.`;

const writeConfig = async (
  baseDir: string,
  tasksDir: string,
  indexFile: string,
): Promise<string> => {
  const configPath = path.join(baseDir, "promethean.kanban.json");
  const payload = {
    tasksDir,
    indexFile,
    exts: [".md"],
  } as const;
  await writeFile(configPath, JSON.stringify(payload), "utf8");
  return configPath;
};

test("indexForSearch writes JSONL when --write is requested", async (t) => {
  const tempDir = await withTempDir(t);
  const tasksDir = path.join(tempDir, "tasks");
  const indexFile = path.join(tempDir, "index.jsonl");
  await mkdir(tasksDir, { recursive: true });

  const taskFile = path.join(tasksDir, "kb-1.md");
  await writeFile(
    taskFile,
    `---\nid: KB-1\nuuid: "1234"\ntitle: Document indexing\nstatus: doing\npriority: high\nowner: Ada\nlabels:\n  - search\n  - index\ncreated: "2024-01-01"\nupdated: "2024-01-02"\n---\n\n${TASK_BODY}\n`,
    "utf8",
  );

  const configPath = await writeConfig(tempDir, tasksDir, indexFile);
  const env = Object.freeze({
    ...process.env,
    KANBAN_REPO: tempDir,
    KANBAN_CONFIG: configPath,
  });

  const result = await indexForSearch({
    argv: ["indexForSearch", "--write"],
    env,
  });

  t.true(result.wrote);
  t.is(result.count, 1);
  t.is(result.indexFile, indexFile);
  t.is(result.lines.length, 1);

  const written = await readFile(indexFile, "utf8");
  t.is(written, `${result.lines.join("\n")}\n`);

  const parsed = result.lines.map((line) => JSON.parse(line));
  t.deepEqual(parsed, [
    {
      id: "KB-1",
      title: "Document indexing",
      status: "doing",
      priority: "high",
      owner: "Ada",
      labels: ["search", "index"],
      created: "2024-01-01",
      uuid: "1234",
      updated: "2024-01-02",
      path: path.relative(tempDir, taskFile),
    },
  ]);
});
