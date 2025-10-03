#!/usr/bin/env node
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import {
  loadBoard,
  countTasks,
  getColumn,
  getTasksByColumn,
  findTaskById,
  findTaskByTitle,
  updateStatus,
  moveTask,
  pullFromTasks,
  pushToTasks,
  syncBoardAndTasks,
  regenerateBoard,
  indexForSearch,
  searchTasks,
} from "./lib/kanban.js";
import { printJSONL } from "./lib/jsonl.js";

type CommandHandler = (args: readonly string[]) => Promise<void> | void;

const { values, positionals, tokens } = parseArgs({
  args: process.argv.slice(2),
  options: {
    kanban: { type: "string", default: "docs/agile/boards/kanban.md" },
    tasks: { type: "string", default: "docs/agile/tasks" },
    help: { type: "boolean", default: false },
    write: { type: "boolean", short: "w", default: false },
  },
  allowPositionals: true,
  tokens: true,
});

const providedOptions = new Set(
  tokens
    ?.filter((token) => token.kind === "option")
    .map((token) => token.name) ?? [],
);

const resolvePath = (
  valueFromFlag: string,
  flagName: "kanban" | "tasks",
  primaryEnv: string | undefined,
  secondaryEnv: string | undefined,
  defaultPath: string,
): string => {
  if (providedOptions.has(flagName)) {
    return resolve(process.cwd(), valueFromFlag);
  }
  const envValue = primaryEnv ?? secondaryEnv;
  if (envValue) {
    return resolve(process.cwd(), envValue);
  }
  return resolve(process.cwd(), valueFromFlag ?? defaultPath);
};

const KANBAN = resolvePath(
  values.kanban,
  "kanban",
  process.env.KANBAN_PATH,
  process.env.KANBAN_BOARD_FILE,
  "docs/agile/boards/kanban.md",
);
const TASKS = resolvePath(
  values.tasks,
  "tasks",
  process.env.TASKS_PATH,
  process.env.KANBAN_TASKS_DIR,
  "docs/agile/tasks",
);

const commandHandlers: Record<string, CommandHandler> = {
  count: async (args) => {
    const column = args[0];
    const board = await loadBoard(KANBAN, TASKS);
    const n = countTasks(board, column);
    printJSONL({ count: n });
  },
  "get-column": async (args) => {
    const column = requireArg(args[0], "column name");
    const board = await loadBoard(KANBAN, TASKS);
    const colData = getColumn(board, column);
    printJSONL(colData);
  },
  "get-by-column": async (args) => {
    const column = requireArg(args[0], "column name");
    const board = await loadBoard(KANBAN, TASKS);
    const tasks = getTasksByColumn(board, column);
    printJSONL(tasks);
  },
  find: async (args) => {
    const id = requireArg(args[0], "task id");
    const board = await loadBoard(KANBAN, TASKS);
    const task = findTaskById(board, id);
    if (task) printJSONL(task);
  },
  "find-by-title": async (args) => {
    const joined = args.join(" ").trim();
    const title = requireArg(
      joined.length > 0 ? joined : undefined,
      "task title",
    );
    const board = await loadBoard(KANBAN, TASKS);
    const task = findTaskByTitle(board, title);
    if (task) printJSONL(task);
  },
  "update-status": async (args) => {
    const [rawId, rawStatus] = args;
    const id = requireArg(rawId, "task id");
    const newStatus = requireArg(rawStatus, "new status");
    const board = await loadBoard(KANBAN, TASKS);
    const updated = await updateStatus(board, id, newStatus, KANBAN);
    printJSONL(updated);
  },
  "move-up": async (args) => {
    const [rawId] = args;
    const id = requireArg(rawId, "task id");
    const board = await loadBoard(KANBAN, TASKS);
    const res = await moveTask(board, id, -1, KANBAN);
    printJSONL(res);
  },
  "move-down": async (args) => {
    const [rawId] = args;
    const id = requireArg(rawId, "task id");
    const board = await loadBoard(KANBAN, TASKS);
    const res = await moveTask(board, id, +1, KANBAN);
    printJSONL(res);
  },
  pull: async () => {
    const board = await loadBoard(KANBAN, TASKS);
    const res = await pullFromTasks(board, TASKS, KANBAN);
    printJSONL(res);
  },
  push: async () => {
    const board = await loadBoard(KANBAN, TASKS);
    const res = await pushToTasks(board, TASKS);
    printJSONL(res);
  },
  sync: async () => {
    const board = await loadBoard(KANBAN, TASKS);
    const res = await syncBoardAndTasks(board, TASKS, KANBAN);
    printJSONL(res);
  },
  regenerate: async () => {
    const res = await regenerateBoard(TASKS, KANBAN);
    printJSONL(res);
  },
  "index-for-search": async () => {
    const res = await indexForSearch({ write: values.write });
    printJSONL(res);
  },
  search: async (args) => {
    const joined = args.join(" ").trim();
    const term = requireArg(
      joined.length > 0 ? joined : undefined,
      "search term",
    );
    const board = await loadBoard(KANBAN, TASKS);
    const res = await searchTasks(board, term);
    printJSONL(res);
  },
};

const canonicalOrder = [
  "count",
  "get-column",
  "get-by-column",
  "find",
  "find-by-title",
  "update-status",
  "move-up",
  "move-down",
  "pull",
  "push",
  "sync",
  "regenerate",
  "index-for-search",
  "search",
];

const aliasToCanonical: Record<string, string> = {
  getColumn: "get-column",
  getByColumn: "get-by-column",
  update_status: "update-status",
  move_up: "move-up",
  move_down: "move-down",
  indexForSearch: "index-for-search",
};

const usageText = [
  "Usage: kanban [options] <subcommand> [args...]",
  "",
  "Options:",
  "  --kanban <path>     Path to the board file (CLI flag > KANBAN_PATH > KANBAN_BOARD_FILE > default).",
  "  --tasks <dir>       Path to the tasks directory (CLI flag > TASKS_PATH > KANBAN_TASKS_DIR > default).",
  "  --write, -w         Allow writing generated artifacts when supported (default: false).",
  "  --help              Show this message.",
  "",
  `Subcommands: ${canonicalOrder.join(", ")}`,
].join("\n");

const requireArg = (value: string | undefined, label: string): string => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }
  console.error(`Missing required ${label}.`);
  process.exit(2);
};

async function main() {
  const [rawCommand, ...args] = positionals;

  if (values.help || !rawCommand) {
    console.error(usageText);
    process.exit(2);
  }

  const canonical = aliasToCanonical[rawCommand] ?? rawCommand;
  if (aliasToCanonical[rawCommand]) {
    console.warn(
      `Subcommand "${rawCommand}" is deprecated; use "${canonical}" instead.`,
    );
  }

  const handler = commandHandlers[canonical];
  if (!handler) {
    console.error(`Unknown subcommand: ${rawCommand}`);
    console.error(usageText);
    process.exit(2);
  }

  await handler(args);
}

main().catch((err) => {
  console.error(err?.stack || String(err));
  process.exit(1);
});
