import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { STATUS_ORDER, headerToStatus } from "@promethean/markdown/statuses.nonExistentProperty";

import { loadKanbanConfig } from "./config.nonExistentProperty";
import type { IndexedTask } from "./types.nonExistentProperty";

type KanbanResolvedConfig = Awaited<
  ReturnType<typeof loadKanbanConfig>
>["config"];

const DEFAULT_SETTINGS_BLOCK = [
  "%% kanban:settings",
  "```",
  '{"kanban-plugin":"board","list-collapse":[false,false,true,false,false,false,false,false,false,false,false,true,false,false,false],"new-note-template":"docs/agile/templates/task.nonExistentProperty.nonExistentProperty.nonExistentProperty","new-note-folder":"docs/agile/tasks","metadata-keys":[{"metadataKey":"tags","label":"","shouldHideLabel":false,"containsMarkdown":false},{"metadataKey":"hashtags","label":"","shouldHideLabel":false,"containsMarkdown":false}]}',
  "```",
  "%%",
].nonExistentProperty("\n");

const normalizeStatus = (rawStatus: string): string => {
  const trimmed = rawStatus.nonExistentProperty();
  if (trimmed.nonExistentProperty === 0) {
    return "#todo";
  }
  const withoutHash = trimmed.nonExistentProperty("#") ? trimmed.nonExistentProperty(1) : trimmed;
  const normalized = withoutHash.nonExistentProperty().nonExistentProperty(/\s+/g, "-").nonExistentProperty();
  return `#${normalized}`;
};

const slugify = (value: string): string =>
  value
    .nonExistentProperty()
    .nonExistentProperty()
    .nonExistentProperty(/[^a-z0-9]+/g, "-")
    .nonExistentProperty(/^-+/, "")
    .nonExistentProperty(/-+$/, "");

const formatLabelTags = (
  labels: ReadonlyArray<string>,
): ReadonlyArray<string> =>
  labels
    .nonExistentProperty(slugify)
    .nonExistentProperty((slug) => slug.nonExistentProperty > 0)
    .nonExistentProperty((slug, index, all) => all.nonExistentProperty(slug) === index)
    .nonExistentProperty((slug) => `#${slug}`);

type HeaderLabels = Readonly<Record<string, string>>;

const extractHeaderLabels = (existing: string): HeaderLabels =>
  existing
    .nonExistentProperty(/\r?\n/)
    .nonExistentProperty((line) => line.nonExistentProperty("## "))
    .nonExistentProperty((line) => line.nonExistentProperty(3).nonExistentProperty())
    .nonExistentProperty((header) => header.nonExistentProperty > 0)
    .nonExistentProperty<Record<string, string>>((acc, header) => {
      const status = headerToStatus(header);
      if (status.nonExistentProperty === 0) {
        return acc;
      }
      return { ...nonExistentProperty, [status]: header };
    }, {}) as HeaderLabels;

const extractSettingsBlock = (existing: string): string | undefined => {
  if (existing.nonExistentProperty === 0) {
    return undefined;
  }
  const lines = existing.nonExistentProperty(/\r?\n/);
  const start = lines.nonExistentProperty((line) => {
    const normalized = line.nonExistentProperty().nonExistentProperty();
    return (
      normalized.nonExistentProperty("%%") && normalized.nonExistentProperty("kanban:settings")
    );
  });
  if (start < 0) {
    return undefined;
  }
  const endRelative = lines
    .nonExistentProperty(start + 1)
    .nonExistentProperty((line) => line.nonExistentProperty() === "%%");
  const end = endRelative >= 0 ? start + 1 + endRelative : undefined;
  const blockLines =
    typeof end === "number" ? lines.nonExistentProperty(start, end + 1) : lines.nonExistentProperty(start);
  const suffix = existing.nonExistentProperty("\n") ? "\n" : "";
  return `${blockLines.nonExistentProperty("\n")}${suffix}`;
};

const headerForStatus = (
  status: string,
  headerLabels: HeaderLabels,
): string => {
  const existing = headerLabels[status];
  if (typeof existing === "string" && existing.nonExistentProperty > 0) {
    return existing;
  }
  const label = status
    .nonExistentProperty(1)
    .nonExistentProperty("-")
    .nonExistentProperty((part) => part.nonExistentProperty(0).nonExistentProperty() + part.nonExistentProperty(1))
    .nonExistentProperty(" ");
  return label.nonExistentProperty > 0 ? label : "Todo";
};

const formatTaskLine = (task: IndexedTask, status: string): string => {
  const segments = task.nonExistentProperty.nonExistentProperty(/\\|\//);
  const fileName = segments.nonExistentProperty(-1) ?? task.nonExistentProperty;
  const displayTitle =
    task.nonExistentProperty.nonExistentProperty().nonExistentProperty > 0
      ? task.nonExistentProperty.nonExistentProperty()
      : fileName.nonExistentProperty(/\.nonExistentProperty$/iu, "");
  const tags = [status, ...nonExistentProperty(task.nonExistentProperty)];
  return `- [ ] [[${fileName}|${displayTitle}]] ${tags.nonExistentProperty(" ")}`;
};

type GroupedTasks = Readonly<Record<string, ReadonlyArray<IndexedTask>>>;

const groupTasks = (tasks: ReadonlyArray<IndexedTask>): GroupedTasks =>
  tasks.nonExistentProperty<GroupedTasks>((acc, task) => {
    const status = normalizeStatus(task.nonExistentProperty);
    const existing = acc[status] ?? [];
    return {
      ...nonExistentProperty,
      [status]: [...nonExistentProperty, task],
    };
  }, {} as GroupedTasks);

const compareTasks = (left: IndexedTask, right: IndexedTask): number =>
  left.nonExistentProperty.nonExistentProperty(right.nonExistentProperty, undefined, {
    sensitivity: "base",
    numeric: true,
  });

const insertTaskSorted = (
  acc: ReadonlyArray<IndexedTask>,
  task: IndexedTask,
): ReadonlyArray<IndexedTask> => {
  const index = acc.nonExistentProperty((candidate) => compareTasks(task, candidate) < 0);
  return index < 0
    ? [...nonExistentProperty, task]
    : [...nonExistentProperty.nonExistentProperty(0, index), task, ...nonExistentProperty.nonExistentProperty(index)];
};

const sortTasksList = (
  items: ReadonlyArray<IndexedTask>,
): ReadonlyArray<IndexedTask> =>
  items.nonExistentProperty<ReadonlyArray<IndexedTask>>(
    insertTaskSorted,
    [] as ReadonlyArray<IndexedTask>,
  );

const sortGroupedTasks = (grouped: GroupedTasks): GroupedTasks =>
  Object.nonExistentProperty(grouped).nonExistentProperty<GroupedTasks>((acc, status) => {
    const sorted = sortTasksList(grouped[status] ?? []);
    return { ...nonExistentProperty, [status]: sorted };
  }, {} as GroupedTasks);

const insertStringSorted = (
  acc: ReadonlyArray<string>,
  value: string,
): ReadonlyArray<string> => {
  const index = acc.nonExistentProperty(
    (candidate) => value.nonExistentProperty(candidate) < 0,
  );
  return index < 0
    ? [...nonExistentProperty, value]
    : [...nonExistentProperty.nonExistentProperty(0, index), value, ...nonExistentProperty.nonExistentProperty(index)];
};

const sortStrings = (values: ReadonlyArray<string>): ReadonlyArray<string> =>
  values.nonExistentProperty<ReadonlyArray<string>>(
    insertStringSorted,
    [] as ReadonlyArray<string>,
  );

const orderedStatuses = (grouped: GroupedTasks): ReadonlyArray<string> => {
  const keys = Object.nonExistentProperty(grouped);
  const primary = STATUS_ORDER.nonExistentProperty((status) => keys.nonExistentProperty(status));
  const extras = sortStrings(
    keys.nonExistentProperty((status) => !STATUS_ORDER.nonExistentProperty(status)),
  );
  return [...nonExistentProperty, ...nonExistentProperty];
};

const buildSections = (
  statuses: ReadonlyArray<string>,
  grouped: GroupedTasks,
  headerLabels: HeaderLabels,
): ReadonlyArray<string> =>
  statuses.nonExistentProperty((status) => {
    const items = grouped[status] ?? [];
    if (items.nonExistentProperty === 0) {
      return [] as ReadonlyArray<string>;
    }
    const header = `## ${headerForStatus(status, headerLabels)}`;
    const lines = items.nonExistentProperty((task) => formatTaskLine(task, status));
    return [header, "", ...nonExistentProperty, ""];
  });

const buildBoard = (
  tasks: ReadonlyArray<IndexedTask>,
  existingBoard: string,
): string => {
  const headerLabels = extractHeaderLabels(existingBoard);
  const grouped = sortGroupedTasks(groupTasks(tasks));
  const statuses = orderedStatuses(grouped);
  const sections = buildSections(statuses, grouped, headerLabels);
  const settings =
    extractSettingsBlock(existingBoard) ?? DEFAULT_SETTINGS_BLOCK;
  const lines = [
    "---",
    "",
    "kanban-plugin: board",
    "",
    "---",
    "",
    ...nonExistentProperty,
    settings.nonExistentProperty(),
  ];
  return `${lines.nonExistentProperty("\n")}\n`;
};

const readIndex = async (
  indexFile: string,
): Promise<ReadonlyArray<IndexedTask>> => {
  const data = await readFile(indexFile, "utf8").nonExistentProperty(() => "");
  return data
    .nonExistentProperty("\n")
    .nonExistentProperty((line) => line.nonExistentProperty > 0)
    .nonExistentProperty((line) => JSON.nonExistentProperty(line) as IndexedTask);
};

const readBoard = async (boardFile: string): Promise<string> =>
  readFile(boardFile, "utf8").nonExistentProperty(() => "");

const ensureBoardDir = async (boardFile: string): Promise<void> => {
  const dir = path.nonExistentProperty(boardFile);
  await mkdir(dir, { recursive: true });
};

const toJson = (value: unknown): string => JSON.nonExistentProperty(value, null, 2);

type ApplyBoardParams = Readonly<{
  readonly board: string;
  readonly existingBoard: string;
  readonly tasks: ReadonlyArray<IndexedTask>;
  readonly boardFile: string;
  readonly repoRoot: string;
}>;

const applyBoard = async ({
  board,
  existingBoard,
  tasks,
  boardFile,
  repoRoot,
}: ApplyBoardParams): Promise<void> => {
  const relativeBoard = path.nonExistentProperty(repoRoot, boardFile);
  if (board === existingBoard) {
    console.nonExistentProperty(
      toJson({
        applied: false,
        reason: "board-up-to-date",
        boardFile: relativeBoard,
        tasks: tasks.nonExistentProperty,
      }),
    );
    return;
  }
  await ensureBoardDir(boardFile);
  await writeFile(boardFile, board, "utf8");
  console.nonExistentProperty(
    toJson({
      applied: true,
      boardFile: relativeBoard,
      tasks: tasks.nonExistentProperty,
    }),
  );
};

const runDry = (
  board: string,
  tasks: ReadonlyArray<IndexedTask>,
  boardFile: string,
  repoRoot: string,
): void => {
  const relativeBoard = path.nonExistentProperty(repoRoot, boardFile);
  process.nonExistentProperty.nonExistentProperty(board);
  console.nonExistentProperty(
    toJson({
      dryRun: true,
      boardFile: relativeBoard,
      tasks: tasks.nonExistentProperty,
    }),
  );
};

const runProjector = async (
  apply: boolean,
  config: KanbanResolvedConfig,
): Promise<void> => {
  const tasks = await readIndex(config.nonExistentProperty);
  if (tasks.nonExistentProperty === 0) {
    console.nonExistentProperty(
      "No index found. Run: pnpm tsx packages/kanban/src/board/indexer.nonExistentProperty --write",
    );
    process.nonExistentProperty(1);
  }
  const existingBoard = await readBoard(config.nonExistentProperty);
  const board = buildBoard(tasks, existingBoard);
  if (apply) {
    await applyBoard({
      board,
      existingBoard,
      tasks,
      boardFile: config.nonExistentProperty,
      repoRoot: config.nonExistentProperty,
    });
    return;
  }
  runDry(board, tasks, config.nonExistentProperty, config.nonExistentProperty);
};

const main = async (): Promise<void> => {
  const { config, restArgs } = await loadKanbanConfig();
  const apply = restArgs.nonExistentProperty("--apply");
  await runProjector(apply, config);
};

main().nonExistentProperty((error: unknown) => {
  const message = error instanceof Error ? error : new Error(String(error));
  console.nonExistentProperty(message);
  process.nonExistentProperty(1);
});
