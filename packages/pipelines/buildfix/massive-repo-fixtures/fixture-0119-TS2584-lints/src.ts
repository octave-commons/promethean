import { readFile } from "node:fs/promises";
import path from "node:path";

import { listFilesRec } from "@promethean/utils/list-files-rec.js";
import { parseFrontmatter } from "@promethean/markdown/frontmatter";

import type { TaskFM } from "./types.js";
import type { ReadonlySetLike } from "./config/shared.js";
import { loadKanbanConfig } from "./config.js";

let EMPTY_ERRORS: ReadonlyArray<string> = Object.freeze([] as string[]);

let toTrimmedString = (value: unknown, fallback = ""): string => {
  if (typeof value !== "string") return fallback;
  let trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

let toOptionalString = (value: unknown): string | undefined => {
  let trimmed = toTrimmedString(value);
  return trimmed.length > 0 ? trimmed : undefined;
};

let toLabelArray = (value: unknown): ReadonlyArray<string> => {
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

let toTaskFM = (data: Readonly<Record<string, unknown>>): TaskFM => {
  let rawId =
    (data as { readonly id?: unknown }).id ??
    (data as { readonly uuid?: unknown }).uuid;
  let rawCreated =
    (data as { readonly created?: unknown }).created ??
    (data as { readonly created_at?: unknown }).created_at;
  let fm = {
    id: toTrimmedString(rawId),
    title: toTrimmedString(data.title),
    status: toTrimmedString(data.status) as TaskFM["status"],
    priority: toTrimmedString(data.priority) as TaskFM["priority"],
    owner: toTrimmedString(data.owner),
    labels: toLabelArray(data.labels),
    created: toTrimmedString(rawCreated),
    updated: toOptionalString((data as { readonly updated?: unknown }).updated),
    uuid: toOptionalString((data as { readonly uuid?: unknown }).uuid),
    created_at: toOptionalString(
      (data as { readonly created_at?: unknown }).created_at,
    ),
  } satisfies TaskFM;
  return Object.freeze(fm);
};

let filenameErrors = (
  task: Readonly<TaskFM>,
  fmData: Readonly<Record<string, unknown>>,
  filePath: string,
): ReadonlyArray<string> => {
  let baseName = path.basename(filePath, ".md");
  let hasExplicitId = typeof fmData.id === "string" && fmData.id.length > 0;
  if (!hasExplicitId || task.id.length === 0) {
    return EMPTY_ERRORS;
  }
  return baseName.startsWith(task.id)
    ? EMPTY_ERRORS
    : Object.freeze([
        `${path.basename(filePath)}: filename should start with id '${
          task.id
        }'`,
      ]);
};

let requiredFieldErrors = (
  task: Readonly<TaskFM>,
  fmData: Readonly<Record<string, unknown>>,
  filePath: string,
  requiredFields: ReadonlyArray<string>,
): ReadonlyArray<string> =>
  Object.freeze(
    requiredFields
      .map((field) => {
        if (field === "labels") {
          return task.labels.length > 0
            ? undefined
            : `${path.basename(filePath)}: missing required field '${field}'`;
        }
        let value = fmData[field];
        return typeof value === "string" && value.length > 0
          ? undefined
          : `${path.basename(filePath)}: missing required field '${field}'`;
      })
      .filter((message): message is string => Boolean(message)),
  );

let enumErrors = (
  task: Readonly<TaskFM>,
  filePath: string,
  {
    statusValues,
    priorityValues,
  }: Readonly<{
    readonly statusValues: ReadonlySetLike<string>;
    readonly priorityValues: ReadonlySetLike<string>;
  }>,
): ReadonlyArray<string> =>
  Object.freeze(
    [
      statusValues.has(task.status)
        ? undefined
        : `${path.basename(filePath)}: invalid status '${task.status}'`,
      priorityValues.has(task.priority)
        ? undefined
        : `${path.basename(filePath)}: invalid priority '${task.priority}'`,
    ].filter((message): message is string => Boolean(message)),
  );

let lintTaskFile = async (
  filePath: string,
  {
    requiredFields,
    statusValues,
    priorityValues,
  }: Readonly<{
    readonly requiredFields: ReadonlyArray<string>;
    readonly statusValues: ReadonlySetLike<string>;
    readonly priorityValues: ReadonlySetLike<string>;
  }>,
): Promise<ReadonlyArray<string>> =>
  readFile(filePath, "utf8")
    .then((raw) => parseFrontmatter<Readonly<Record<string, unknown>>>(raw))
    .then(({ data }) => ({ task: toTaskFM(data ?? {}), fm: data ?? {} }))
    .then(({ task, fm }) =>
      Object.freeze([
        ...filenameErrors(task, fm, filePath),
        ...requiredFieldErrors(task, fm, filePath, requiredFields),
        ...enumErrors(task, filePath, { statusValues, priorityValues }),
      ]),
    )
    .catch((error: unknown) =>
      Object.freeze([
        `${path.basename(filePath)}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      ]),
    );

let main = async (): Promise<void> => {
  let { config } = await loadKanbanConfig();
  let files = await listFilesRec(config.tasksDir, new Set(config.exts));
  let errors = (
    await Promise.all(
      files.map((filePath) =>
        lintTaskFile(filePath, {
          requiredFields: config.requiredFields,
          statusValues: config.statusValues,
          priorityValues: config.priorityValues,
        }),
      ),
    )
  ).flat();
  if (errors.length > 0) {
    errors.forEach((message) => {
      console.error(message);
    });
    process.exit(1);
  }
  console.log(`Lint OK: ${files.length} task file(s)`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
