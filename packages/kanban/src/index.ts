#!/usr/bin/env node
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
import { loadKanbanConfig } from "./board/config.js";
import { processSync } from "./process/sync.js";

const LEGACY_FLAG_MAP = Object.freeze(
  new Map<string, string>([
    ["--kanban", "--board-file"],
    ["--tasks", "--tasks-dir"],
  ]),
);

const normalizeLegacyArgs = (
  args: ReadonlyArray<string>,
): ReadonlyArray<string> =>
  args.map((token) => {
    for (const [legacy, current] of LEGACY_FLAG_MAP.entries()) {
      if (token === legacy) {
        return current;
      }
      if (token.startsWith(`${legacy}=`)) {
        return `${current}=${token.slice(legacy.length + 1)}`;
      }
    }
    return token;
  });

const applyLegacyEnv = (
  env: Readonly<NodeJS.ProcessEnv>,
): NodeJS.ProcessEnv => {
  const nextEnv: NodeJS.ProcessEnv = { ...env };
  if (
    typeof env.KANBAN_PATH === "string" &&
    typeof env.KANBAN_BOARD_FILE !== "string"
  ) {
    nextEnv.KANBAN_BOARD_FILE = env.KANBAN_PATH;
  }
  if (
    typeof env.TASKS_PATH === "string" &&
    typeof env.KANBAN_TASKS_DIR !== "string"
  ) {
    nextEnv.KANBAN_TASKS_DIR = env.TASKS_PATH;
  }
  return nextEnv;
};

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
  const rawArgs = process.argv.slice(2);
  const normalizedArgs = normalizeLegacyArgs(rawArgs);
  const helpRequested =
    normalizedArgs.includes("--help") || normalizedArgs.includes("-h");

  const { config, restArgs } = await loadKanbanConfig({
    argv: normalizedArgs,
    env: applyLegacyEnv(process.env),
  });

  const [cmd, ...args] = restArgs;
  const boardFile = config.boardFile;
  const tasksDir = config.tasksDir;

  if (helpRequested || !cmd) {
    console.error(
      `Usage: kanban [--kanban path] [--tasks path] <subcommand> [args...]\n` +
        `Subcommands: count, getColumn, getByColumn, find, find-by-title, update_status, move_up, move_down, pull, push, sync, regenerate, indexForSearch, search, process_sync`,
    );
    process.exit(2);
  }

  switch (cmd) {
    case "count": {
      const column = args[0];
      const board = await loadBoard(boardFile, tasksDir);
      const n = countTasks(board, column);
      printJSONL({ count: n });
      break;
    }
    case "getColumn": {
      const column = requireArg(args[0], "column name");
      const board = await loadBoard(boardFile, tasksDir);
      const colData = getColumn(board, column);
      printJSONL(colData);
      break;
    }
    case "getByColumn": {
      const column = requireArg(args[0], "column name");
      const board = await loadBoard(boardFile, tasksDir);
      const tasks = getTasksByColumn(board, column);
      printJSONL(tasks);
      break;
    }
    case "find": {
      const id = requireArg(args[0], "task id");
      const board = await loadBoard(boardFile, tasksDir);
      const t = findTaskById(board, id);
      if (t) printJSONL(t);
      break;
    }
    case "find-by-title": {
      const joined = args.join(" ").trim();
      const title = requireArg(
        joined.length > 0 ? joined : undefined,
        "task title",
      );
      const board = await loadBoard(boardFile, tasksDir);
      const t = findTaskByTitle(board, title);
      if (t) printJSONL(t);
      break;
    }
    case "update_status": {
      const [rawId, rawStatus] = args;
      const id = requireArg(rawId, "task id");
      const newStatus = requireArg(rawStatus, "new status");
      const board = await loadBoard(boardFile, tasksDir);
      const updated = await updateStatus(board, id, newStatus, boardFile);
      printJSONL(updated);
      break;
    }
    case "move_up": {
      const [rawId] = args;
      const id = requireArg(rawId, "task id");
      const board = await loadBoard(boardFile, tasksDir);
      const res = await moveTask(board, id, -1, boardFile);
      printJSONL(res);
      break;
    }
    case "move_down": {
      const [rawId] = args;
      const id = requireArg(rawId, "task id");
      const board = await loadBoard(boardFile, tasksDir);
      const res = await moveTask(board, id, +1, boardFile);
      printJSONL(res);
      break;
    }
    case "pull": {
      const board = await loadBoard(boardFile, tasksDir);
      const res = await pullFromTasks(board, tasksDir, boardFile);
      printJSONL(res);
      break;
    }
    case "push": {
      const board = await loadBoard(boardFile, tasksDir);
      const res = await pushToTasks(board, tasksDir);
      printJSONL(res);
      break;
    }
    case "sync": {
      const board = await loadBoard(boardFile, tasksDir);
      const res = await syncBoardAndTasks(board, tasksDir, boardFile);
      printJSONL(res);
      break;
    }
    case "regenerate": {
      const res = await regenerateBoard(tasksDir, boardFile);
      printJSONL(res);
      break;
    }
    case "indexForSearch": {
      const res = await indexForSearch(tasksDir);
      printJSONL(res);
      break;
    }
    case "search": {
      const joined = args.join(" ").trim();
      const term = requireArg(
        joined.length > 0 ? joined : undefined,
        "search term",
      );
      const board = await loadBoard(boardFile, tasksDir);
      const res = await searchTasks(board, term);
      printJSONL(res);
      break;
    }
    case "process_sync": {
      const res = await processSync({
        processFile: process.env.KANBAN_PROCESS_FILE,
        owner: process.env.GITHUB_OWNER,
        repo: process.env.GITHUB_REPO,
        token: process.env.GITHUB_TOKEN,
      });
      printJSONL(res);
      break;
    }
    default:
      console.error(`Unknown subcommand: ${cmd}`);
      process.exit(2);
  }
}

main().catch((err) => {
  console.error(err?.stack || String(err));
  process.exit(1);
});
