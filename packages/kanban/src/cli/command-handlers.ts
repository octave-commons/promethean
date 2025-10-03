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
} from "../lib/kanban.js";
import { printJSONL } from "../lib/jsonl.js";
import { serveKanbanUI } from "../lib/ui-server.js";

type Primitive = string | number | boolean | symbol | null | undefined | bigint;

type DeepReadonly<T> = T extends Primitive
  ? T
  : T extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepReadonly<U>>
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

export type CliContext = Readonly<{
  readonly boardFile: string;
  readonly tasksDir: string;
}>;

export type CommandHandler = (
  args: ReadonlyArray<string>,
  context: CliContext,
) => Promise<void>;

type LoadedBoard = Awaited<ReturnType<typeof loadBoard>>;

type ImmutableLoadedBoard = DeepReadonly<LoadedBoard>;

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

const parsePort = (value: string): number => {
  const trimmed = value.trim();
  const port = Number.parseInt(trimmed, 10);
  if (!Number.isInteger(port) || port <= 0 || port > 65_535) {
    console.error(`Invalid port: ${value}`);
    process.exit(2);
  }
  return port;
};

type UiOptions = Readonly<{ host?: string; port?: number }>;

const parseUiOptions = (
  tokens: ReadonlyArray<string>,
  acc: UiOptions = {},
): UiOptions => {
  if (tokens.length === 0) {
    return acc;
  }
  const [head, ...tail] = tokens;
  const token = head ?? "";
  if (token.startsWith("--port=")) {
    const value = token.slice("--port=".length);
    return parseUiOptions(tail, { ...acc, port: parsePort(value) });
  }
  if (token === "--port") {
    const [next, ...rest] = tail;
    const port = parsePort(requireArg(next, "port"));
    return parseUiOptions(rest, { ...acc, port });
  }
  if (token.startsWith("--host=")) {
    const value = token.slice("--host=".length).trim();
    if (value.length === 0) {
      console.error("Invalid host value");
      process.exit(2);
    }
    return parseUiOptions(tail, { ...acc, host: value });
  }
  if (token === "--host") {
    const [next, ...rest] = tail;
    const value = requireArg(next, "host");
    return parseUiOptions(rest, { ...acc, host: value });
  }
  console.error(`Unknown ui option: ${token}`);
  process.exit(2);
};

const withBoard = async <T>(
  context: CliContext,
  effect: (board: ImmutableLoadedBoard) => Promise<T>,
): Promise<T> => {
  const board = await loadBoard(context.boardFile, context.tasksDir);
  return effect(board as ImmutableLoadedBoard);
};

const handleCount: CommandHandler = async (args, context) =>
  withBoard(context, async (board) => {
    const mutableBoard = board as unknown as LoadedBoard;
    const count = countTasks(mutableBoard, args[0]);
    printJSONL({ count });
  });

const handleGetColumn: CommandHandler = async (args, context) =>
  withBoard(context, async (board) => {
    const mutableBoard = board as unknown as LoadedBoard;
    const column = getColumn(mutableBoard, requireArg(args[0], "column name"));
    printJSONL(column);
  });

const handleGetByColumn: CommandHandler = async (args, context) =>
  withBoard(context, async (board) => {
    const mutableBoard = board as unknown as LoadedBoard;
    const tasks = getTasksByColumn(
      mutableBoard,
      requireArg(args[0], "column name"),
    );
    printJSONL(tasks);
  });

const handleFind: CommandHandler = async (args, context) =>
  withBoard(context, async (board) => {
    const mutableBoard = board as unknown as LoadedBoard;
    const task = findTaskById(mutableBoard, requireArg(args[0], "task id"));
    if (task) {
      printJSONL(task);
    }
  });

const handleFindByTitle: CommandHandler = async (args, context) =>
  withBoard(context, async (board) => {
    const mutableBoard = board as unknown as LoadedBoard;
    const title = requireArg(args.join(" ").trim(), "task title");
    const task = findTaskByTitle(mutableBoard, title);
    if (task) {
      printJSONL(task);
    }
  });

const handleUpdateStatus: CommandHandler = async (args, context) =>
  withBoard(context, async (board) => {
    const mutableBoard = board as unknown as LoadedBoard;
    const id = requireArg(args[0], "task id");
    const status = requireArg(args[1], "new status");
    const updated = await updateStatus(
      mutableBoard,
      id,
      status,
      context.boardFile,
    );
    printJSONL(updated);
  });

const handleMove =
  (offset: number): CommandHandler =>
  async (args, context) =>
    withBoard(context, async (board) => {
      const mutableBoard = board as unknown as LoadedBoard;
      const id = requireArg(args[0], "task id");
      const result = await moveTask(
        mutableBoard,
        id,
        offset,
        context.boardFile,
      );
      printJSONL(result);
    });

const handlePull: CommandHandler = async (_args, context) =>
  withBoard(context, async (board) => {
    const mutableBoard = board as unknown as LoadedBoard;
    const result = await pullFromTasks(
      mutableBoard,
      context.tasksDir,
      context.boardFile,
    );
    printJSONL(result);
  });

const handlePush: CommandHandler = async (_args, context) =>
  withBoard(context, async (board) => {
    const mutableBoard = board as unknown as LoadedBoard;
    const result = await pushToTasks(mutableBoard, context.tasksDir);
    printJSONL(result);
  });

const handleSync: CommandHandler = async (_args, context) =>
  withBoard(context, async (board) => {
    const mutableBoard = board as unknown as LoadedBoard;
    const result = await syncBoardAndTasks(
      mutableBoard,
      context.tasksDir,
      context.boardFile,
    );
    printJSONL(result);
  });

const handleRegenerate: CommandHandler = async (_args, context) => {
  const result = await regenerateBoard(context.tasksDir, context.boardFile);
  printJSONL(result);
};

const handleIndexForSearch: CommandHandler = async (_args, context) => {
  const result = await indexForSearch(context.tasksDir);
  printJSONL(result);
};

const handleSearch: CommandHandler = async (args, context) =>
  withBoard(context, async (board) => {
    const mutableBoard = board as unknown as LoadedBoard;
    const term = requireArg(args.join(" ").trim(), "search term");
    const result = await searchTasks(mutableBoard, term);
    printJSONL(result);
  });

const handleUi: CommandHandler = async (args, context) => {
  const options = parseUiOptions(args);
  await serveKanbanUI({
    boardFile: context.boardFile,
    tasksDir: context.tasksDir,
    host: options.host,
    port: options.port,
  });
};

export const COMMAND_HANDLERS: Readonly<Record<string, CommandHandler>> =
  Object.freeze({
    count: handleCount,
    getColumn: handleGetColumn,
    getByColumn: handleGetByColumn,
    find: handleFind,
    "find-by-title": handleFindByTitle,
    update_status: handleUpdateStatus,
    move_up: handleMove(-1),
    move_down: handleMove(1),
    pull: handlePull,
    push: handlePush,
    sync: handleSync,
    regenerate: handleRegenerate,
    indexForSearch: handleIndexForSearch,
    search: handleSearch,
    ui: handleUi,
  });

export const runCommand = async (
  command: string,
  args: ReadonlyArray<string>,
  context: CliContext,
): Promise<void> => {
  const handler = COMMAND_HANDLERS[command];
  if (!handler) {
    console.error(`Unknown subcommand: ${command}`);
    process.exit(2);
  }
  await handler(args, context);
};
