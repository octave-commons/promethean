import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { listFilesRec } from "@promethean/utils/list-files-rec.js";
import { parseFrontmatter } from "@promethean/markdown/frontmatter";

import type { IndexedTask, TaskFM } from "./types.js";
import type { KanbanConfig, ReadonlySetLike } from "./config/shared.js";
import { loadKanbanConfig } from "./config.js";

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
  repoRoot: string,
): IndexedTask => {
  const rawId =
    (data as { readonly id?: unknown }).id ??
    (data as { readonly uuid?: unknown }).uuid;
  const rawCreated =
    (data as { readonly created?: unknown }).created ??
    (data as { readonly created_at?: unknown }).created_at;
  const id = toTrimmedString(rawId);
  const title = toTrimmedString(data.title, path.basename(filePath, ".md"));
  const status = toTrimmedString(data.status) as TaskFM["status"];
  const priority = toTrimmedString(data.priority) as TaskFM["priority"];
  const owner = toTrimmedString(data.owner);
  const labels = toLabelArray(data.labels);
  const created = toTrimmedString(rawCreated);
  const updated = toOptionalString(
    (data as { readonly updated?: unknown }).updated,
  );
  const rel = path.relative(repoRoot, filePath);
  const base: TaskFM = Object.freeze({
    id,
    title,
    status,
    priority,
    owner,
    labels,
    created,
    uuid: toOptionalString((data as { readonly uuid?: unknown }).uuid),
    created_at: toOptionalString(
      (data as { readonly created_at?: unknown }).created_at,
    ),
  });
  const fm: TaskFM =
    typeof updated === "string" ? Object.freeze({ ...base, updated }) : base;
  return Object.freeze({ ...fm, path: rel }) satisfies IndexedTask;
};

const sortTasksById = (
  tasks: readonly IndexedTask[],
): ReadonlyArray<IndexedTask> =>
  Object.freeze([...tasks].sort((a, b) => a.id.localeCompare(b.id)));

export const indexTasks = async ({
  tasksDir,
  exts,
  repoRoot,
}: Readonly<{
  readonly tasksDir: string;
  readonly exts: ReadonlySetLike<string>;
  readonly repoRoot: string;
}>): Promise<ReadonlyArray<IndexedTask>> => {
  const files = await listFilesRec(tasksDir, new Set(exts));
  const tasks = await Promise.all(
    files.map((filePath) =>
      readFile(filePath, "utf8")
        .then((raw) => {
          const parsed =
            parseFrontmatter<Readonly<Record<string, unknown>>>(raw);
          return parsed.data ?? {};
        })
        .then((data) => normalizeTask(data, filePath, repoRoot)),
    ),
  );
  return sortTasksById(tasks);
};

export const serializeTasks = (
  tasks: ReadonlyArray<IndexedTask>,
): ReadonlyArray<string> =>
  Object.freeze(tasks.map((task) => JSON.stringify(task)));

export const refreshTaskIndex = async (
  config: Readonly<KanbanConfig>,
): Promise<ReadonlyArray<IndexedTask>> => {
  const tasks = await indexTasks({
    tasksDir: config.tasksDir,
    exts: config.exts,
    repoRoot: config.repo,
  });
  const lines = serializeTasks(tasks);
  await writeFile(config.indexFile, `${lines.join("\n")}\n`, "utf8");
  return tasks;
};

export const runIndexer = async (
  options?: Readonly<{
    readonly argv?: ReadonlyArray<string>;
    readonly env?: NodeJS.ProcessEnv;
  }>,
): Promise<ReadonlyArray<IndexedTask>> => {
  const { config, restArgs } = await loadKanbanConfig(options);
  const args = new Set(restArgs);
  const shouldWrite = args.has("--write");
  const tasks = await indexTasks({
    tasksDir: config.tasksDir,
    exts: config.exts,
    repoRoot: config.repo,
  });
  const lines = serializeTasks(tasks);
  if (shouldWrite) {
    await writeFile(config.indexFile, `${lines.join("\n")}\n`, "utf8");
    console.log(
      `Wrote ${tasks.length} tasks to ${path.relative(
        config.repo,
        config.indexFile,
      )}`,
    );
    return tasks;
  }
  lines.forEach((line) => {
    console.log(line);
  });
  return tasks;
};

const isCliEntrypoint = (): boolean => {
  const entry = process.argv[1];
  if (!entry) {
    return false;
  }
  const current = fileURLToPath(import.meta.url);
  return path.resolve(entry) === current;
};

if (isCliEntrypoint()) {
  runIndexer().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
