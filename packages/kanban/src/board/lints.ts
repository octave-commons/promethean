import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { listFilesRec } from "@promethean/utils/list-files-rec.js";
import { parseFrontmatter } from "@promethean/markdown/frontmatter.js";

import type { TaskFM } from "./types.js";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(ROOT, "..", "..", "..", "..");

const TASKS_DIR = path.join(REPO, "boards", "tasks");
const EXTS = new Set([".md"]);

const REQUIRED_FIELDS = [
  "id",
  "title",
  "status",
  "priority",
  "owner",
  "labels",
  "created",
] as const satisfies ReadonlyArray<keyof TaskFM>;

const STATUS_VALUES = new Set(["open", "doing", "blocked", "done", "dropped"]);
const PRIORITY_VALUES = new Set(["low", "medium", "high", "critical"]);

const EMPTY_ERRORS: ReadonlyArray<string> = Object.freeze([] as string[]);

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

const toTaskFM = (data: Readonly<Record<string, unknown>>): TaskFM => {
  const fm = {
    id: toTrimmedString(data.id),
    title: toTrimmedString(data.title),
    status: toTrimmedString(data.status) as TaskFM["status"],
    priority: toTrimmedString(data.priority) as TaskFM["priority"],
    owner: toTrimmedString(data.owner),
    labels: toLabelArray(data.labels),
    created: toTrimmedString(data.created),
    updated: toOptionalString((data as { readonly updated?: unknown }).updated),
  } satisfies TaskFM;
  return Object.freeze(fm);
};

const filenameErrors = (
  task: Readonly<TaskFM>,
  filePath: string,
): ReadonlyArray<string> => {
  const baseName = path.basename(filePath, ".md");
  return baseName.startsWith(task.id)
    ? EMPTY_ERRORS
    : Object.freeze([
        `${path.basename(filePath)}: filename should start with id '${
          task.id
        }'`,
      ]);
};

const requiredFieldErrors = (
  task: Readonly<TaskFM>,
  filePath: string,
): ReadonlyArray<string> =>
  Object.freeze(
    REQUIRED_FIELDS.map((field) => {
      if (field === "labels") {
        return task.labels.length > 0
          ? undefined
          : `${path.basename(filePath)}: missing required field '${field}'`;
      }
      const value = task[field];
      return typeof value === "string" && value.length > 0
        ? undefined
        : `${path.basename(filePath)}: missing required field '${field}'`;
    }).filter((message): message is string => Boolean(message)),
  );

const enumErrors = (
  task: Readonly<TaskFM>,
  filePath: string,
): ReadonlyArray<string> =>
  Object.freeze(
    [
      STATUS_VALUES.has(task.status)
        ? undefined
        : `${path.basename(filePath)}: invalid status '${task.status}'`,
      PRIORITY_VALUES.has(task.priority)
        ? undefined
        : `${path.basename(filePath)}: invalid priority '${task.priority}'`,
    ].filter((message): message is string => Boolean(message)),
  );

const lintTaskFile = async (filePath: string): Promise<ReadonlyArray<string>> =>
  readFile(filePath, "utf8")
    .then((raw) => parseFrontmatter<Readonly<Record<string, unknown>>>(raw))
    .then(({ data }) => toTaskFM(data ?? {}))
    .then((task) =>
      Object.freeze([
        ...filenameErrors(task, filePath),
        ...requiredFieldErrors(task, filePath),
        ...enumErrors(task, filePath),
      ]),
    )
    .catch((error: unknown) =>
      Object.freeze([
        `${path.basename(filePath)}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      ]),
    );

const main = async (): Promise<void> => {
  const files = await listFilesRec(TASKS_DIR, EXTS);
  const errors = (await Promise.all(files.map(lintTaskFile))).flat();
  if (errors.length > 0) {
    errors.forEach((message) => {
      console.error(message);
    });
    process.exit(1);
    return;
  }
  console.log(`Lint OK: ${files.length} task file(s)`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
