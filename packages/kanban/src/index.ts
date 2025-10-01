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

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    kanban: { type: "string", default: "docs/agile/boards/kanban.md" },
    tasks: { type: "string", default: "docs/agile/tasks" },
    help: { type: "boolean", default: false },
  },
  allowPositionals: true,
});

const KANBAN = resolve(process.cwd(), process.env.KANBAN_PATH || values.kanban);
const TASKS = resolve(process.cwd(), process.env.TASKS_PATH || values.tasks);

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
  const [cmd, ...args] = positionals;

  if (values.help || !cmd) {
    console.error(
      `Usage: kanban [--kanban path] [--tasks path] <subcommand> [args...]\n` +
        `Subcommands: count, getColumn, getByColumn, find, find-by-title, update_status, move_up, move_down, pull, push, sync, regenerate, indexForSearch, search`,
    );
    process.exit(2);
  }

  switch (cmd) {
    case "count": {
      const column = args[0];
      const board = await loadBoard(KANBAN, TASKS);
      const n = countTasks(board, column);
      printJSONL({ count: n });
      break;
    }
    case "getColumn": {
      const column = requireArg(args[0], "column name");
      const board = await loadBoard(KANBAN, TASKS);
      const colData = getColumn(board, column);
      printJSONL(colData);
      break;
    }
    case "getByColumn": {
      const column = requireArg(args[0], "column name");
      const board = await loadBoard(KANBAN, TASKS);
      const tasks = getTasksByColumn(board, column);
      printJSONL(tasks);
      break;
    }
    case "find": {
      const id = requireArg(args[0], "task id");
      const board = await loadBoard(KANBAN, TASKS);
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
      const board = await loadBoard(KANBAN, TASKS);
      const t = findTaskByTitle(board, title);
      if (t) printJSONL(t);
      break;
    }
    case "update_status": {
      const [rawId, rawStatus] = args;
      const id = requireArg(rawId, "task id");
      const newStatus = requireArg(rawStatus, "new status");
      const board = await loadBoard(KANBAN, TASKS);
      const updated = await updateStatus(board, id, newStatus, KANBAN);
      printJSONL(updated);
      break;
    }
    case "move_up": {
      const [rawId] = args;
      const id = requireArg(rawId, "task id");
      const board = await loadBoard(KANBAN, TASKS);
      const res = await moveTask(board, id, -1, KANBAN);
      printJSONL(res);
      break;
    }
    case "move_down": {
      const [rawId] = args;
      const id = requireArg(rawId, "task id");
      const board = await loadBoard(KANBAN, TASKS);
      const res = await moveTask(board, id, +1, KANBAN);
      printJSONL(res);
      break;
    }
    case "pull": {
      const board = await loadBoard(KANBAN, TASKS);
      const res = await pullFromTasks(board, TASKS, KANBAN);
      printJSONL(res);
      break;
    }
    case "push": {
      const board = await loadBoard(KANBAN, TASKS);
      const res = await pushToTasks(board, TASKS);
      printJSONL(res);
      break;
    }
    case "sync": {
      const board = await loadBoard(KANBAN, TASKS);
      const res = await syncBoardAndTasks(board, TASKS, KANBAN);
      printJSONL(res);
      break;
    }
    case "regenerate": {
      const res = await regenerateBoard(TASKS, KANBAN);
      printJSONL(res);
      break;
    }
    case "indexForSearch": {
      const res = await indexForSearch(TASKS);
      printJSONL(res);
      break;
    }
    case "search": {
      const joined = args.join(" ").trim();
      const term = requireArg(
        joined.length > 0 ? joined : undefined,
        "search term",
      );
      const board = await loadBoard(KANBAN, TASKS);
      const res = await searchTasks(board, term);
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
