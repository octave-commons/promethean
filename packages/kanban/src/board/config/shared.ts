import path from "node:path";

export type RawKanbanConfig = Readonly<{
  readonly tasksDir?: string;
  readonly indexFile?: string;
  readonly boardFile?: string;
  readonly exts?: ReadonlyArray<string>;
  readonly requiredFields?: ReadonlyArray<string>;
  readonly statusValues?: ReadonlyArray<string>;
  readonly priorityValues?: ReadonlyArray<string>;
}>;

export type KanbanConfig = Readonly<{
  readonly repo: string;
  readonly tasksDir: string;
  readonly indexFile: string;
  readonly boardFile: string;
  readonly exts: ReadonlySetLike<string>;
  readonly requiredFields: ReadonlyArray<string>;
  readonly statusValues: ReadonlySetLike<string>;
  readonly priorityValues: ReadonlySetLike<string>;
}>;

export type LoadKanbanConfigResult = Readonly<{
  readonly config: KanbanConfig;
  readonly restArgs: ReadonlyArray<string>;
}>;

export const DEFAULT_CONFIG_BASENAME = "promethean.kanban.json" as const;

export const MARKERS = Object.freeze([
  "pnpm-workspace.yaml",
  "package.json",
  ".git",
] as const);

export const ENV_KEYS = {
  repo: "KANBAN_REPO",
  config: "KANBAN_CONFIG",
  tasksDir: "KANBAN_TASKS_DIR",
  indexFile: "KANBAN_INDEX_FILE",
  boardFile: "KANBAN_BOARD_FILE",
  exts: "KANBAN_EXTS",
  requiredFields: "KANBAN_REQUIRED_FIELDS",
  statusValues: "KANBAN_STATUS_VALUES",
  priorityValues: "KANBAN_PRIORITY_VALUES",
} as const;

export const ARG_KEYS = new Map<string, keyof typeof ENV_KEYS>([
  ["repo", "repo"],
  ["config", "config"],
  ["tasks-dir", "tasksDir"],
  ["index-file", "indexFile"],
  ["board-file", "boardFile"],
  ["exts", "exts"],
  ["required-fields", "requiredFields"],
  ["status-values", "statusValues"],
  ["priority-values", "priorityValues"],
]);

export type EnvArgKey = keyof typeof ENV_KEYS;

export type OverrideMap = Readonly<
  Partial<Record<EnvArgKey, string | ReadonlyArray<string>>>
>;

export type ArrayKey =
  | "exts"
  | "requiredFields"
  | "statusValues"
  | "priorityValues";

export const ARRAY_KEYS: ReadonlySet<EnvArgKey> = Object.freeze(
  new Set<EnvArgKey>([
    "exts",
    "requiredFields",
    "statusValues",
    "priorityValues",
  ]),
);

export type Defaults = Readonly<{
  readonly tasksDir: string;
  readonly indexFile: string;
  readonly boardFile: string;
  readonly exts: ReadonlyArray<string>;
  readonly requiredFields: ReadonlyArray<string>;
  readonly statusValues: ReadonlyArray<string>;
  readonly priorityValues: ReadonlyArray<string>;
}>;

export type ReadonlySetLike<T> = Readonly<{
  readonly has: (value: T) => boolean;
  readonly [Symbol.iterator]: () => IterableIterator<T>;
}>;

export const resolveWithBase = (base: string, candidate: string): string =>
  path.isAbsolute(candidate) ? candidate : path.resolve(base, candidate);

export const parseList = (value: string | undefined): ReadonlyArray<string> =>
  typeof value === "string"
    ? value
        .split(",")
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0)
    : [];

export const normalizeExts = (
  values: ReadonlyArray<string>,
): ReadonlyArray<string> =>
  values
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .map((value) =>
      value.startsWith(".") ? value.toLowerCase() : `.${value.toLowerCase()}`,
    );

export const arrayHasKey = (key: EnvArgKey): key is ArrayKey =>
  ARRAY_KEYS.has(key);

export const defaultConfigForRepo = (repo: string): Defaults =>
  ({
    tasksDir: path.join(repo, "docs", "agile", "tasks"),
    indexFile: path.join(repo, "docs", "agile", "boards", "index.jsonl"),
    boardFile: path.join(repo, "docs", "agile", "boards", "generated.md"),
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
    statusValues: ["open", "doing", "blocked", "done", "dropped"],
    priorityValues: ["low", "medium", "high", "critical"],
  }) as const;
