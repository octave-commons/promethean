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
  generateBoardByTags,
  indexForSearch,
  searchTasks,
} from '../lib/kanban.js';
import { serveKanbanUI } from '../lib/ui-server.js';
import { compareTasks, suggestTaskBreakdown, prioritizeTasks } from '../lib/task-tools.js';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

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

export class CommandUsageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CommandUsageError';
  }
}

export class CommandNotFoundError extends Error {
  constructor(command: string) {
    super(`Unknown subcommand: ${command}`);
    this.name = 'CommandNotFoundError';
  }
}

export type CommandResult = unknown;

export type CommandHandler = (
  args: ReadonlyArray<string>,
  context: CliContext,
) => Promise<CommandResult>;

type LoadedBoard = Awaited<ReturnType<typeof loadBoard>>;

type ImmutableLoadedBoard = DeepReadonly<LoadedBoard>;

const requireArg = (value: string | undefined, label: string): string => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }
  throw new CommandUsageError(`Missing required ${label}.`);
};

const parsePort = (value: string): number => {
  const trimmed = value.trim();
  const port = Number.parseInt(trimmed, 10);
  if (!Number.isInteger(port) || port <= 0 || port > 65_535) {
    throw new CommandUsageError(`Invalid port: ${value}`);
  }
  return port;
};

type UiOptions = Readonly<{ host?: string; port?: number }>;

const parseUiOptions = (tokens: ReadonlyArray<string>, acc: UiOptions = {}): UiOptions => {
  if (tokens.length === 0) {
    return acc;
  }
  const [head, ...tail] = tokens;
  const token = head ?? '';
  if (token.startsWith('--port=')) {
    const value = token.slice('--port='.length);
    return parseUiOptions(tail, { ...acc, port: parsePort(value) });
  }
  if (token === '--port') {
    const [next, ...rest] = tail;
    const port = parsePort(requireArg(next, 'port'));
    return parseUiOptions(rest, { ...acc, port });
  }
  if (token.startsWith('--host=')) {
    const value = token.slice('--host='.length).trim();
    if (value.length === 0) {
      throw new CommandUsageError('Invalid host value');
    }
    return parseUiOptions(tail, { ...acc, host: value });
  }
  if (token === '--host') {
    const [next, ...rest] = tail;
    const value = requireArg(next, 'host');
    return parseUiOptions(rest, { ...acc, host: value });
  }
  throw new CommandUsageError(`Unknown ui option: ${token}`);
};

const withBoard = async <T>(
  context: CliContext,
  effect: (board: ImmutableLoadedBoard) => Promise<T> | T,
): Promise<T> => {
  const board = await loadBoard(context.boardFile, context.tasksDir);
  return effect(board as ImmutableLoadedBoard);
};

const handleCount: CommandHandler = (args, context) =>
  withBoard(context, (board) => {
    const mutableBoard = board as unknown as LoadedBoard;
    const count = countTasks(mutableBoard, args[0]);
    return { count };
  });

const handleGetColumn: CommandHandler = (args, context) =>
  withBoard(context, (board) => {
    const mutableBoard = board as unknown as LoadedBoard;
    const column = getColumn(mutableBoard, requireArg(args[0], 'column name'));
    return column;
  });

const handleGetByColumn: CommandHandler = (args, context) =>
  withBoard(context, (board) => {
    const mutableBoard = board as unknown as LoadedBoard;
    const tasks = getTasksByColumn(mutableBoard, requireArg(args[0], 'column name'));
    return tasks;
  });

const handleFind: CommandHandler = (args, context) =>
  withBoard(context, (board) => {
    const mutableBoard = board as unknown as LoadedBoard;
    const task = findTaskById(mutableBoard, requireArg(args[0], 'task id'));
    if (task) {
      return task;
    }
    return null;
  });

const handleFindByTitle: CommandHandler = (args, context) =>
  withBoard(context, (board) => {
    const mutableBoard = board as unknown as LoadedBoard;
    const title = requireArg(args.join(' ').trim(), 'task title');
    const task = findTaskByTitle(mutableBoard, title);
    if (task) {
      return task;
    }
    return null;
  });

const handleUpdateStatus: CommandHandler = (args, context) =>
  withBoard(context, async (board) => {
    const mutableBoard = board as unknown as LoadedBoard;
    const id = requireArg(args[0], 'task id');
    const status = requireArg(args[1], 'new status');
    const updated = await updateStatus(mutableBoard, id, status, context.boardFile, context.tasksDir);
    return updated;
  });

const handleMove =
  (offset: number): CommandHandler =>
  (args, context) =>
    withBoard(context, async (board) => {
      const mutableBoard = board as unknown as LoadedBoard;
      const id = requireArg(args[0], 'task id');
      const result = await moveTask(mutableBoard, id, offset, context.boardFile);
      return result;
    });

const handlePull: CommandHandler = (_args, context) =>
  withBoard(context, async (board) => {
    const mutableBoard = board as unknown as LoadedBoard;
    const result = await pullFromTasks(mutableBoard, context.tasksDir, context.boardFile);
    return result;
  });

const handlePush: CommandHandler = (_args, context) =>
  withBoard(context, async (board) => {
    const mutableBoard = board as unknown as LoadedBoard;
    const result = await pushToTasks(mutableBoard, context.tasksDir);
    return result;
  });

const handleSync: CommandHandler = (_args, context) =>
  withBoard(context, async (board) => {
    const mutableBoard = board as unknown as LoadedBoard;
    const result = await syncBoardAndTasks(mutableBoard, context.tasksDir, context.boardFile);
    return result;
  });

const handleRegenerate: CommandHandler = (_args, context) => {
  return regenerateBoard(context.tasksDir, context.boardFile);
};

const handleGenerateByTags: CommandHandler = (args, context) => {
  if (args.length === 0) {
    throw new CommandUsageError('generate-by-tags requires at least one tag');
  }

  const tags = args.map(arg => arg.trim()).filter(tag => tag.length > 0);
  if (tags.length === 0) {
    throw new CommandUsageError('No valid tags provided');
  }

  return generateBoardByTags(context.tasksDir, context.boardFile, tags);
};

const handleIndexForSearch: CommandHandler = (_args, context) => {
  return indexForSearch(context.tasksDir);
};

const handleSearch: CommandHandler = (args, context) =>
  withBoard(context, async (board) => {
    const mutableBoard = board as unknown as LoadedBoard;
    const term = requireArg(args.join(' ').trim(), 'search term');
    const result = await searchTasks(mutableBoard, term);
    return result;
  });

const handleUi: CommandHandler = async (args, context) => {
  const options = parseUiOptions(args);
  await serveKanbanUI({
    boardFile: context.boardFile,
    tasksDir: context.tasksDir,
    host: options.host,
    port: options.port,
  });
  return null;
};

const parseSectionFlag = (tokens: ReadonlyArray<string>): string | undefined => {
  for (const [index, token] of tokens.entries()) {
    if (token === '--section') {
      return tokens[index + 1];
    }
    if (token.startsWith('--section=')) {
      const value = token.slice('--section='.length);
      if (value.length > 0) {
        return value;
      }
    }
  }
  return undefined;
};

const handleProcess: CommandHandler = async (args) => {
  const section = parseSectionFlag(args);

  // Resolve the process.md path relative to the kanban package
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const repoRoot = path.resolve(__dirname, '../../../..');
  const processDocPath = path.join(repoRoot, 'docs/agile/process.md');

  try {
    const processContent = await readFile(processDocPath, 'utf8');

    if (section) {
      // Extract a specific section
      const sectionRegex = new RegExp(
        `^#{1,3}\\s+.*${section}.*$[\\s\\S]*?(?=\n#{1,3}\\s+|\n$|$)`,
        'im',
      );
      const match = processContent.match(sectionRegex);

      if (match) {
        console.log(match[0].trim());
      } else {
        console.error(`Section "${section}" not found in process document`);
        console.log('Available sections:');
        const sections = processContent.match(/^#{1,3}\s+(.+)$/gm) || [];
        sections.forEach((s) => console.log(`  - ${s.replace(/^#{1,3}\s+/, '')}`));
        process.exit(1);
      }
    } else {
      // Display the full process document with a brief header
      console.log('# 📋 Promethean Development Process');
      console.log('');
      console.log(
        'This document outlines the 6-step workflow for task development in the Promethean framework.',
      );
      console.log('Use --section <name> to view specific sections.');
      console.log('');
      console.log('Available sections: overview, fsm, transitions, blocking');
      console.log('');
      console.log('--- Full Process Document ---');
      console.log('');
      console.log(processContent);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error reading process document: ${message}`);
    process.exit(1);
  }
};

const handleCompareTasks: CommandHandler = async (args, context) => {
  if (args.length === 0) {
    throw new CommandUsageError('compare-tasks requires task UUIDs separated by commas');
  }

  const taskUuids = args[0]!.split(',');
  const comparisons = await compareTasks(taskUuids, context.boardFile, context.tasksDir);
  return comparisons;
};

const handleBreakdownTask: CommandHandler = async (args, context) => {
  if (args.length === 0) {
    throw new CommandUsageError('breakdown-task requires a task UUID');
  }

  const taskUuid = args[0]!;
  const breakdown = await suggestTaskBreakdown(taskUuid, context.tasksDir);
  return breakdown;
};

const handlePrioritizeTasks: CommandHandler = async (_args, _context) => {
  if (_args.length === 0) {
    throw new CommandUsageError('prioritize-tasks requires task UUIDs separated by commas');
  }

  const taskUuids = _args[0]!.split(',');
  const priorities = await prioritizeTasks(taskUuids, {});
  return priorities;
};

export const COMMAND_HANDLERS: Readonly<Record<string, CommandHandler>> = Object.freeze({
  count: handleCount,
  getColumn: handleGetColumn,
  getByColumn: handleGetByColumn,
  find: handleFind,
  'find-by-title': handleFindByTitle,
  update_status: handleUpdateStatus,
  move_up: handleMove(-1),
  move_down: handleMove(1),
  pull: handlePull,
  push: handlePush,
  sync: handleSync,
  regenerate: handleRegenerate,
  'generate-by-tags': handleGenerateByTags,
  indexForSearch: handleIndexForSearch,
  search: handleSearch,
  ui: handleUi,
  process: handleProcess,
  'compare-tasks': handleCompareTasks,
  'breakdown-task': handleBreakdownTask,
  'prioritize-tasks': handlePrioritizeTasks,
});

export const AVAILABLE_COMMANDS: ReadonlyArray<string> = Object.freeze(
  Object.keys(COMMAND_HANDLERS),
);

export const REMOTE_COMMANDS: ReadonlyArray<string> = Object.freeze(
  AVAILABLE_COMMANDS.filter((command) => command !== 'ui'),
);

export const executeCommand = async (
  command: string,
  args: ReadonlyArray<string>,
  context: CliContext,
): Promise<CommandResult> => {
  const handler = COMMAND_HANDLERS[command];
  if (!handler) {
    throw new CommandNotFoundError(command);
  }
  return handler(args, context);
};
