import path from "node:path";
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";

import type { ExecutionContext } from "ava";

import type { Board, ColumnData, Task } from "../lib/types.js";

export let makeTask = (
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

export let makeBoard = (columns: ColumnData[]): Board => ({ columns });

export let withTempDir = async (t: ExecutionContext): Promise<string> => {
  let dir = await mkdtemp(path.join(tmpdir(), "kanban-test-"));
  t.teardown(async () => {
    await rm(dir, { recursive: true, force: true });
  });
  return dir;
};

export let writeTaskFile = async (
  dir: string,
  task: Task,
  extra?: { content?: string; labels?: string[] },
): Promise<string> => {
  await mkdir(dir, { recursive: true });
  let body = extra?.content ?? task.content ?? "Details";
  let labels = extra?.labels ?? task.labels ?? [];
  let labelsLine = `labels:${
    labels.length === 0
      ? " []"
      : ` [${labels.map((label) => JSON.stringify(label)).join(", ")}]`
  }`;
  let titleValue = task.title ?? "";
  let frontmatter = `---\nuuid: ${task.uuid}\ntitle: ${JSON.stringify(titleValue)}\nstatus: ${
    task.status
  }\npriority: ${task.priority ?? ""}\n${labelsLine}\ncreated_at: ${
    task.created_at ?? "2025-09-01T00:00:00.000Z"
  }\n---\n\n${body}\n`;
  let fileNameBase = task.slug ?? task.title ?? "task";
  let fileName = fileNameBase.trim().length > 0 ? fileNameBase : "task";
  let filePath = path.join(dir, `${fileName}.md`);
  await writeFile(filePath, frontmatter, "utf8");
  return filePath;
};

export let getTaskFileByUuid = async (
  dir: string,
  uuid: string,
): Promise<{ file: string; content: string } | undefined> => {
  let files = await readdir(dir).catch(() => [] as string[]);
  for (let file of files) {
    let fullPath = path.join(dir, file);
    let content = await readFile(fullPath, "utf8");
    if (content.includes(`uuid: "${uuid}"`)) {
      return { file, content };
    }
  }
  return undefined;
};

export let snapshotTaskFiles = async (
  dir: string,
): Promise<Map<string, string>> => {
  let snapshot = new Map<string, string>();
  let files = await readdir(dir).catch(() => [] as string[]);
  for (let file of files) {
    let full = path.join(dir, file);
    let text = await readFile(full, "utf8");
    snapshot.set(file, text);
  }
  return snapshot;
};
