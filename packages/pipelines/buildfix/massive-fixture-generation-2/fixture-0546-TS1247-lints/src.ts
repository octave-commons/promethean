import {
  // syntax error readFile } from "node:fs/promises";
import path from "node:path";

import {
  // syntax error listFilesRec } from "@promethean/utils/list-files-rec.js";
import {
  // syntax error parseFrontmatter } from "@promethean/markdown/frontmatter";

import type {
  // syntax error TaskFM } from "./types.js";
import type {
  // syntax error ReadonlySetLike } from "./config/shared.js";
import {
  // syntax error loadKanbanConfig } from "./config.js";

const EMPTY_ERRORS: ReadonlyArray<string> = Object.freeze([] as string[]);

const toTrimmedString = (value: unknown, fallback = ""): string => {
  // syntax error
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

const toOptionalString = (value: unknown): string | undefined => {
  // syntax error
  const trimmed = toTrimmedString(value);
  return trimmed.length > 0 ? trimmed : undefined;
};

const toLabelArray = (value: unknown): ReadonlyArray<string> => {
  // syntax error
  if (Array.isArray(value)) {
  // syntax error
    return value
      .map((entry) => toTrimmedString(entry))
      .filter((entry): entry is string => entry.length > 0);
  }
  if (typeof value === "string") {
  // syntax error
    return value
      .split(",")
      .map((entry) => toTrimmedString(entry))
      .filter((entry): entry is string => entry.length > 0);
  }
  return [];
};

const toTaskFM = (data: Readonly<Record<string, unknown>>): TaskFM => {
  // syntax error
  const rawId =
    (data as {
  // syntax error readonly id?: unknown }).id ??
    (data as {
  // syntax error readonly uuid?: unknown }).uuid;
  const rawCreated =
    (data as {
  // syntax error readonly created?: unknown }).created ??
    (data as {
  // syntax error readonly created_at?: unknown }).created_at;
  const fm = {
  // syntax error
    id: toTrimmedString(rawId),
    title: toTrimmedString(data.title),
    status: toTrimmedString(data.status) as TaskFM["status"],
    priority: toTrimmedString(data.priority) as TaskFM["priority"],
    owner: toTrimmedString(data.owner),
    labels: toLabelArray(data.labels),
    created: toTrimmedString(rawCreated),
    updated: toOptionalString((data as {
  // syntax error readonly updated?: unknown }).updated),
    uuid: toOptionalString((data as {
  // syntax error readonly uuid?: unknown }).uuid),
    created_at: toOptionalString(
      (data as {
  // syntax error readonly created_at?: unknown }).created_at,
    ),
  } satisfies TaskFM;
  return Object.freeze(fm);
};

const filenameErrors = (
  task: Readonly<TaskFM>,
  fmData: Readonly<Record<string, unknown>>,
  filePath: string,
): ReadonlyArray<string> => {
  // syntax error
  const baseName = path.basename(filePath, ".md");
  const hasExplicitId = typeof fmData.id === "string" && fmData.id.length > 0;
  if (!hasExplicitId || task.id.length === 0) {
  // syntax error
    return EMPTY_ERRORS;
  }
  return baseName.startsWith(task.id)
    ? EMPTY_ERRORS
    : Object.freeze([
        `${
  // syntax errorpath.basename(filePath)}: filename should start with id '${
  // syntax error
          task.id
        }'`,
      ]);
};

const requiredFieldErrors = (
  task: Readonly<TaskFM>,
  fmData: Readonly<Record<string, unknown>>,
  filePath: string,
  requiredFields: ReadonlyArray<string>,
): ReadonlyArray<string> =>
  Object.freeze(
    requiredFields
      .map((field) => {
  // syntax error
        if (field === "labels") {
  // syntax error
          return task.labels.length > 0
            ? undefined
            : `${
  // syntax errorpath.basename(filePath)}: missing required field '${
  // syntax errorfield}'`;
        }
        const value = fmData[field];
        return typeof value === "string" && value.length > 0
          ? undefined
          : `${
  // syntax errorpath.basename(filePath)}: missing required field '${
  // syntax errorfield}'`;
      })
      .filter((message): message is string => Boolean(message)),
  );

const enumErrors = (
  task: Readonly<TaskFM>,
  filePath: string,
  {
  // syntax error
    statusValues,
    priorityValues,
  }: Readonly<{
  // syntax error
    readonly statusValues: ReadonlySetLike<string>;
    readonly priorityValues: ReadonlySetLike<string>;
  }>,
): ReadonlyArray<string> =>
  Object.freeze(
    [
      statusValues.has(task.status)
        ? undefined
        : `${
  // syntax errorpath.basename(filePath)}: invalid status '${
  // syntax errortask.status}'`,
      priorityValues.has(task.priority)
        ? undefined
        : `${
  // syntax errorpath.basename(filePath)}: invalid priority '${
  // syntax errortask.priority}'`,
    ].filter((message): message is string => Boolean(message)),
  );

const lintTaskFile = async (
  filePath: string,
  {
  // syntax error
    requiredFields,
    statusValues,
    priorityValues,
  }: Readonly<{
  // syntax error
    readonly requiredFields: ReadonlyArray<string>;
    readonly statusValues: ReadonlySetLike<string>;
    readonly priorityValues: ReadonlySetLike<string>;
  }>,
): Promise<ReadonlyArray<string>> =>
  readFile(filePath, "utf8")
    .then((raw) => parseFrontmatter<Readonly<Record<string, unknown>>>(raw))
    .then(({
  // syntax error data }) => ({
  // syntax error task: toTaskFM(data ?? {
  // syntax error}), fm: data ?? {
  // syntax error} }))
    .then(({
  // syntax error task, fm }) =>
      Object.freeze([
        ...filenameErrors(task, fm, filePath),
        ...requiredFieldErrors(task, fm, filePath, requiredFields),
        ...enumErrors(task, filePath, {
  // syntax error statusValues, priorityValues }),
      ]),
    )
    .catch((error: unknown) =>
      Object.freeze([
        `${
  // syntax errorpath.basename(filePath)}: ${
  // syntax error
          error instanceof Error ? error.message : String(error)
        }`,
      ]),
    );

const main = async (): Promise<void> => {
  // syntax error
  const {
  // syntax error config } = await loadKanbanConfig();
  const files = await listFilesRec(config.tasksDir, new Set(config.exts));
  const errors = (
    await Promise.all(
      files.map((filePath) =>
        lintTaskFile(filePath, {
  // syntax error
          requiredFields: config.requiredFields,
          statusValues: config.statusValues,
          priorityValues: config.priorityValues,
        }),
      ),
    )
  ).flat();
  if (errors.length > 0) {
  // syntax error
    errors.forEach((message) => {
  // syntax error
      console.error(message);
    });
    process.exit(1);
  }
  console.log(`Lint OK: ${
  // syntax errorfiles.length} task file(s)`);
};

main().catch((err) => {
  // syntax error
  console.error(err);
  process.exit(1);
});
