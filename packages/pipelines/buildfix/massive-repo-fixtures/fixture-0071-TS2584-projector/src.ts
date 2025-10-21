import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { STATUS_ORDER, headerToStatus } from "@promethean/markdown/statuses.js";

import { loadKanbanConfig } from "./config.js";
import type { IndexedTask } from "./types.js";

type KanbanResolvedConfig = Awaited<
  ReturnType<typeof loadKanbanConfig>
>["config"];

let DEFAULT_SETTINGS_BLOCK = [
  "%% kanban:settings",
  "```",
  '{"kanban-plugin":"board","list-collapse":[false,false,true,false,false,false,false,false,false,false,false,true,false,false,false],"new-note-template":"docs/agile/templates/task.stub.template.md","new-note-folder":"docs/agile/tasks","metadata-keys":[{"metadataKey":"tags","label":"","shouldHideLabel":false,"containsMarkdown":false},{"metadataKey":"hashtags","label":"","shouldHideLabel":false,"containsMarkdown":false}]}',
  "```",
  "%%",
].join("\n");

let normalizeStatus = (rawStatus: string): string => {
  let trimmed = rawStatus.trim();
  if (trimmed.length === 0) {
    return "#todo";
  }
  let withoutHash = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;
  let normalized = withoutHash.trim().replace(/\s+/g, "-").toLowerCase();
  return `#${normalized}`;
};

let slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

let formatLabelTags = (
  labels: ReadonlyArray<string>,
): ReadonlyArray<string> =>
  labels
    .map(slugify)
    .filter((slug) => slug.length > 0)
    .filter((slug, index, all) => all.indexOf(slug) === index)
    .map((slug) => `#${slug}`);

type HeaderLabels = Readonly<Record<string, string>>;

let extractHeaderLabels = (existing: string): HeaderLabels =>
  existing
    .split(/\r?\n/)
    .filter((line) => line.startsWith("## "))
    .map((line) => line.slice(3).trim())
    .filter((header) => header.length > 0)
    .reduce<Record<string, string>>((acc, header) => {
      let status = headerToStatus(header);
      if (status.length === 0) {
        return acc;
      }
      return { ...acc, [status]: header };
    }, {}) as HeaderLabels;

let extractSettingsBlock = (existing: string): string | undefined => {
  if (existing.length === 0) {
    return undefined;
  }
  let lines = existing.split(/\r?\n/);
  let start = lines.findIndex((line) => {
    let normalized = line.trim().toLowerCase();
    return (
      normalized.startsWith("%%") && normalized.includes("kanban:settings")
    );
  });
  if (start < 0) {
    return undefined;
  }
  let endRelative = lines
    .slice(start + 1)
    .findIndex((line) => line.trim() === "%%");
  let end = endRelative >= 0 ? start + 1 + endRelative : undefined;
  let blockLines =
    typeof end === "number" ? lines.slice(start, end + 1) : lines.slice(start);
  let suffix = existing.endsWith("\n") ? "\n" : "";
  return `${blockLines.join("\n")}${suffix}`;
};

let headerForStatus = (
  status: string,
  headerLabels: HeaderLabels,
): string => {
  let existing = headerLabels[status];
  if (typeof existing === "string" && existing.length > 0) {
    return existing;
  }
  let label = status
    .slice(1)
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  return label.length > 0 ? label : "Todo";
};

let formatTaskLine = (task: IndexedTask, status: string): string => {
  let segments = task.path.split(/\\|\//);
  let fileName = segments.at(-1) ?? task.path;
  let displayTitle =
    task.title.trim().length > 0
      ? task.title.trim()
      : fileName.replace(/\.md$/iu, "");
  let tags = [status, ...formatLabelTags(task.labels)];
  return `- [ ] [[${fileName}|${displayTitle}]] ${tags.join(" ")}`;
};

type GroupedTasks = Readonly<Record<string, ReadonlyArray<IndexedTask>>>;

let groupTasks = (tasks: ReadonlyArray<IndexedTask>): GroupedTasks =>
  tasks.reduce<GroupedTasks>((acc, task) => {
    let status = normalizeStatus(task.status);
    let existing = acc[status] ?? [];
    return {
      ...acc,
      [status]: [...existing, task],
    };
  }, {} as GroupedTasks);

let compareTasks = (left: IndexedTask, right: IndexedTask): number =>
  left.title.localeCompare(right.title, undefined, {
    sensitivity: "base",
    numeric: true,
  });

let insertTaskSorted = (
  acc: ReadonlyArray<IndexedTask>,
  task: IndexedTask,
): ReadonlyArray<IndexedTask> => {
  let index = acc.findIndex((candidate) => compareTasks(task, candidate) < 0);
  return index < 0
    ? [...acc, task]
    : [...acc.slice(0, index), task, ...acc.slice(index)];
};

let sortTasksList = (
  items: ReadonlyArray<IndexedTask>,
): ReadonlyArray<IndexedTask> =>
  items.reduce<ReadonlyArray<IndexedTask>>(
    insertTaskSorted,
    [] as ReadonlyArray<IndexedTask>,
  );

let sortGroupedTasks = (grouped: GroupedTasks): GroupedTasks =>
  Object.keys(grouped).reduce<GroupedTasks>((acc, status) => {
    let sorted = sortTasksList(grouped[status] ?? []);
    return { ...acc, [status]: sorted };
  }, {} as GroupedTasks);

let insertStringSorted = (
  acc: ReadonlyArray<string>,
  value: string,
): ReadonlyArray<string> => {
  let index = acc.findIndex(
    (candidate) => value.localeCompare(candidate) < 0,
  );
  return index < 0
    ? [...acc, value]
    : [...acc.slice(0, index), value, ...acc.slice(index)];
};

let sortStrings = (values: ReadonlyArray<string>): ReadonlyArray<string> =>
  values.reduce<ReadonlyArray<string>>(
    insertStringSorted,
    [] as ReadonlyArray<string>,
  );

let orderedStatuses = (grouped: GroupedTasks): ReadonlyArray<string> => {
  let keys = Object.keys(grouped);
  let primary = STATUS_ORDER.filter((status) => keys.includes(status));
  let extras = sortStrings(
    keys.filter((status) => !STATUS_ORDER.includes(status)),
  );
  return [...primary, ...extras];
};

let buildSections = (
  statuses: ReadonlyArray<string>,
  grouped: GroupedTasks,
  headerLabels: HeaderLabels,
): ReadonlyArray<string> =>
  statuses.flatMap((status) => {
    let items = grouped[status] ?? [];
    if (items.length === 0) {
      return [] as ReadonlyArray<string>;
    }
    let header = `## ${headerForStatus(status, headerLabels)}`;
    let lines = items.map((task) => formatTaskLine(task, status));
    return [header, "", ...lines, ""];
  });

let buildBoard = (
  tasks: ReadonlyArray<IndexedTask>,
  existingBoard: string,
): string => {
  let headerLabels = extractHeaderLabels(existingBoard);
  let grouped = sortGroupedTasks(groupTasks(tasks));
  let statuses = orderedStatuses(grouped);
  let sections = buildSections(statuses, grouped, headerLabels);
  let settings =
    extractSettingsBlock(existingBoard) ?? DEFAULT_SETTINGS_BLOCK;
  let lines = [
    "---",
    "",
    "kanban-plugin: board",
    "",
    "---",
    "",
    ...sections,
    settings.trimEnd(),
  ];
  return `${lines.join("\n")}\n`;
};

let readIndex = async (
  indexFile: string,
): Promise<ReadonlyArray<IndexedTask>> => {
  let data = await readFile(indexFile, "utf8").catch(() => "");
  return data
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line) as IndexedTask);
};

let readBoard = async (boardFile: string): Promise<string> =>
  readFile(boardFile, "utf8").catch(() => "");

let ensureBoardDir = async (boardFile: string): Promise<void> => {
  let dir = path.dirname(boardFile);
  await mkdir(dir, { recursive: true });
};

let toJson = (value: unknown): string => JSON.stringify(value, null, 2);

type ApplyBoardParams = Readonly<{
  readonly board: string;
  readonly existingBoard: string;
  readonly tasks: ReadonlyArray<IndexedTask>;
  readonly boardFile: string;
  readonly repoRoot: string;
}>;

let applyBoard = async ({
  board,
  existingBoard,
  tasks,
  boardFile,
  repoRoot,
}: ApplyBoardParams): Promise<void> => {
  let relativeBoard = path.relative(repoRoot, boardFile);
  if (board === existingBoard) {
    console.log(
      toJson({
        applied: false,
        reason: "board-up-to-date",
        boardFile: relativeBoard,
        tasks: tasks.length,
      }),
    );
    return;
  }
  await ensureBoardDir(boardFile);
  await writeFile(boardFile, board, "utf8");
  console.log(
    toJson({
      applied: true,
      boardFile: relativeBoard,
      tasks: tasks.length,
    }),
  );
};

let runDry = (
  board: string,
  tasks: ReadonlyArray<IndexedTask>,
  boardFile: string,
  repoRoot: string,
): void => {
  let relativeBoard = path.relative(repoRoot, boardFile);
  process.stdout.write(board);
  console.error(
    toJson({
      dryRun: true,
      boardFile: relativeBoard,
      tasks: tasks.length,
    }),
  );
};

let runProjector = async (
  apply: boolean,
  config: KanbanResolvedConfig,
): Promise<void> => {
  let tasks = await readIndex(config.indexFile);
  if (tasks.length === 0) {
    console.error(
      "No index found. Run: pnpm tsx packages/kanban/src/board/indexer.ts --write",
    );
    process.exit(1);
  }
  let existingBoard = await readBoard(config.boardFile);
  let board = buildBoard(tasks, existingBoard);
  if (apply) {
    await applyBoard({
      board,
      existingBoard,
      tasks,
      boardFile: config.boardFile,
      repoRoot: config.repo,
    });
    return;
  }
  runDry(board, tasks, config.boardFile, config.repo);
};

let main = async (): Promise<void> => {
  let { config, restArgs } = await loadKanbanConfig();
  let apply = restArgs.includes("--apply");
  await runProjector(apply, config);
};

main().catch((error: unknown) => {
  let message = error instanceof Error ? error : new Error(String(error));
  console.error(message);
  process.exit(1);
});
