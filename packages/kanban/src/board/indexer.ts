import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { listFilesRec } from "@promethean/utils/list-files-rec.js";
import { parseFrontmatter } from "@promethean/markdown/frontmatter.js";

import type { IndexedTask, TaskFM } from "./types.js";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(ROOT, "..", "..", "..", "..");

const TASKS_DIR = path.join(REPO, "boards", "tasks");
const INDEX_FILE = path.join(REPO, "boards", "index.json");

const EXTS = new Set([".md"]);

const toTrimmedString = (value: unknown, fallback = ""): string => {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

const toOptionalString = (value: unknown): string | undefined => {
  const trimmed = toTrimmedString(value);
  return trimmed.length > 0 ? trimmed : undefined;
};

const toLabelArray = (value: unknown): ReadonlyArray<string> => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => toTrimmedString(entry))
      .filter((entry): entry is string => entry.length > 0);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => toTrimmedString(entry))
      .filter((entry): entry is string => entry.length > 0);
  }
  return [];
};

const normalizeTask = (
  data: Readonly<Record<string, unknown>>,
  filePath: string,
): IndexedTask => {
  const id = toTrimmedString(data.id);
  const title = toTrimmedString(data.title, path.basename(filePath, ".md"));
  const status = toTrimmedString(data.status);
  const priority = toTrimmedString(data.priority);
  const owner = toTrimmedString(data.owner);
  const labels = toLabelArray(data.labels);
  const created = toTrimmedString(data.created);
  const updated = toOptionalString(
    (data as { readonly updated?: unknown }).updated,
  );
  const rel = path.relative(REPO, filePath);
  const base: TaskFM = Object.freeze({
    id,
    title,
    status,
    priority,
    owner,
    labels,
    created,
  });
  const fm: TaskFM =
    typeof updated === "string" ? Object.freeze({ ...base, updated }) : base;
  return Object.freeze({ ...fm, path: rel }) satisfies IndexedTask;
};

const sortTasksById = (
  tasks: readonly IndexedTask[],
): ReadonlyArray<IndexedTask> =>
  Object.freeze([...tasks].sort((a, b) => a.id.localeCompare(b.id)));

const indexTasks = async (): Promise<ReadonlyArray<IndexedTask>> => {
  const files = await listFilesRec(TASKS_DIR, EXTS);
  const tasks = await Promise.all(
    files.map((filePath) =>
      readFile(filePath, "utf8")
        .then((raw) => {
          const parsed =
            parseFrontmatter<Readonly<Record<string, unknown>>>(raw);
          return parsed.data ?? {};
        })
        .then((data) => normalizeTask(data, filePath)),
    ),
  );
  return sortTasksById(tasks);
};

const main = async (): Promise<void> => {
  const args = new Set(process.argv.slice(2));
  const shouldWrite = args.has("--write");
  const tasks: ReadonlyArray<IndexedTask> = await indexTasks();
  const lines = Object.freeze(tasks.map((task) => JSON.stringify(task)));
  if (shouldWrite) {
    await writeFile(INDEX_FILE, `${lines.join("\n")}\n`, "utf8");
    console.log(`Wrote ${tasks.length} tasks to boards/index.json`);
    return;
  }
  lines.forEach((line) => {
    console.log(line);
  });
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
