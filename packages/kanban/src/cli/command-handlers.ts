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
  createTask,
  deleteTask,
  updateTaskDescription,
  renameTask,
  columnKey,
  writeBoard,
} from '../lib/kanban.js';

import {
  isEpic,
  getEpicSubtasks,
  addSubtaskToEpic,
  removeSubtaskFromEpic,
  createEpic,
  getAllEpics,
} from '../lib/epic.js';
import type { Board } from '../lib/types.js';
import { makeEventLogManager, type EventLogManager } from '../board/event-log/index.js';
import { loadKanbanConfig } from '../board/config.js';
import { serveKanbanUI } from '../lib/ui-server.js';
import { compareTasks, suggestTaskBreakdown, prioritizeTasks } from '../lib/task-tools.js';
import { KanbanDevServer } from '../lib/dev-server.js';
import {
  analyzeColumnNormalization,
  applyColumnNormalization,
} from '../lib/pantheon/column-normalizer.js';

import { TransitionRulesEngine, createTransitionRulesEngine } from '../lib/transition-rules.js';
import { TaskGitTracker } from '../lib/task-git-tracker.js';
import { createWIPLimitEnforcement } from '../lib/wip-enforcement.js';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { readdir } from 'node:fs/promises';

// Get the equivalent of __dirname in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
  readonly argv: ReadonlyArray<string>;
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

/**
 * Find the actual task file path by searching for the UUID in file contents
 */
async function findTaskFilePath(tasksDir: string, taskUuid: string): Promise<string | null> {
  try {
    const files = await readdir(tasksDir, { withFileTypes: true });

    for (const file of files) {
      if (!file.isFile() || !file.name.endsWith('.md')) {
        continue;
      }

      const filePath = path.join(tasksDir, file.name);
      try {
        const content = await readFile(filePath, 'utf8');
        if (content.includes(`uuid: "${taskUuid}"`) || content.includes(`uuid: '${taskUuid}'`)) {
          return filePath;
        }
      } catch (error) {
        // Skip files that can't be read
        continue;
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

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
    // Treat undefined argument as empty string to ensure consistent behavior
    const column = args[0] !== undefined ? args[0] : '';
    const count = countTasks(mutableBoard, column);
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

    // Parse optional reason parameter for audit corrections
    let reason: string | undefined;
    const reasonIndex = args.findIndex((arg) => arg === '--reason' || arg === '-r');
    if (reasonIndex >= 0 && args[reasonIndex + 1]) {
      reason = args[reasonIndex + 1];
    }

    // Initialize transition rules engine with proper config loading
    let transitionRulesEngine: TransitionRulesEngine | undefined;

    // Try multiple reasonable config paths
    const possiblePaths = [
      // From current working directory (could be repo root)
      path.resolve(process.cwd(), 'promethean.kanban.json'),
      // From board file directory (go up from docs/agile/boards)
      path.resolve(path.dirname(context.boardFile), '../promethean.kanban.json'),
      // From board file directory (go up two levels to repo root)
      path.resolve(path.dirname(context.boardFile), '../../promethean.kanban.json'),
      // From board file directory (go up three levels from boards to repo root)
      path.resolve(path.dirname(context.boardFile), '../../../promethean.kanban.json'),
      // From package location (kanban package to repo root)
      path.resolve(__dirname, '../../promethean.kanban.json'),
      // Direct relative to board file
      context.boardFile.replace('/boards/generated.md', '/promethean.kanban.json'),
    ];

    try {
      transitionRulesEngine = await createTransitionRulesEngine(possiblePaths);
    } catch (error) {
      // Gracefully handle missing config or initialization errors
      console.warn(
        'Warning: Transition rules engine not available:',
        error instanceof Error ? error.message : String(error),
      );
    }

    // Initialize event log manager
    let eventLogManager: EventLogManager | undefined;
    try {
      const configResult = await loadKanbanConfig({
        argv: process.argv,
        env: process.env,
      });
      eventLogManager = makeEventLogManager(configResult.config);
    } catch (error) {
      console.warn(
        'Warning: Event log manager not available:',
        error instanceof Error ? error.message : String(error),
      );
    }

    const updated = await updateStatus(
      mutableBoard,
      id,
      status,
      context.boardFile,
      context.tasksDir,
      transitionRulesEngine,
      reason,
      eventLogManager,
      'human',
    );
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

    // Enhanced logging for pull operation
    if (result.moved > 0) {
      console.log(
        `📝 Pull completed: ${result.added} added, ${result.moved} status changes from files`,
      );
    } else {
      console.log(`📋 Pull completed: ${result.added} added, ${result.moved} moved`);
    }

    return result;
  });

const handlePush: CommandHandler = (_args, context) =>
  withBoard(context, async (board) => {
    const mutableBoard = board as unknown as LoadedBoard;
    const result = await pushToTasks(mutableBoard, context.tasksDir);

    // Enhanced logging for manual edit detection
    if (result.statusUpdated > 0) {
      console.log(
        `📝 Push completed: ${result.added} added, ${result.moved} moved, ${result.statusUpdated} manual edits preserved`,
      );
    } else {
      console.log(`📋 Push completed: ${result.added} added, ${result.moved} moved`);
    }

    return result;
  });

const handleSync: CommandHandler = (_args, context) =>
  withBoard(context, async (board) => {
    const mutableBoard = board as unknown as LoadedBoard;
    const result = await syncBoardAndTasks(mutableBoard, context.tasksDir, context.boardFile);

    // Enhanced logging for sync operation
    const totalChanges =
      result.board.added +
      result.board.moved +
      result.tasks.added +
      result.tasks.moved +
      result.tasks.statusUpdated;
    const conflictCount = result.conflicting.length;

    if (conflictCount > 0) {
      console.log(`⚠️  Sync completed with ${conflictCount} conflict(s) resolved`);
    } else {
      console.log(`✅ Sync completed successfully`);
    }

    console.log(`📊 Board: ${result.board.added} added, ${result.board.moved} moved`);
    console.log(
      `📁 Files: ${result.tasks.added} added, ${result.tasks.moved} moved, ${result.tasks.statusUpdated} status updates`,
    );
    console.log(`🔄 Total changes: ${totalChanges}`);

    return result;
  });

const handleRegenerate: CommandHandler = (_args, context) => {
  return regenerateBoard(context.tasksDir, context.boardFile);
};

const handleGenerateByTags: CommandHandler = (args, context) => {
  if (args.length === 0) {
    throw new CommandUsageError('generate-by-tags requires at least one tag');
  }

  const tags = args.map((arg) => arg.trim()).filter((tag) => tag.length > 0);
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

type DevOptions = Readonly<{
  host?: string;
  port?: number;
  noAutoGit?: boolean;
  noAutoOpen?: boolean;
  debounceMs?: number;
}>;

const parseDevOptions = (tokens: ReadonlyArray<string>, acc: DevOptions = {}): DevOptions => {
  if (tokens.length === 0) {
    return acc;
  }
  const [head, ...tail] = tokens;
  const token = head ?? '';

  if (token.startsWith('--port=')) {
    const value = token.slice('--port='.length);
    return parseDevOptions(tail, { ...acc, port: parsePort(value) });
  }
  if (token === '--port') {
    const [next, ...rest] = tail;
    const port = parsePort(requireArg(next, 'port'));
    return parseDevOptions(rest, { ...acc, port });
  }
  if (token.startsWith('--host=')) {
    const value = token.slice('--host='.length).trim();
    if (value.length === 0) {
      throw new CommandUsageError('Invalid host value');
    }
    return parseDevOptions(tail, { ...acc, host: value });
  }
  if (token === '--host') {
    const [next, ...rest] = tail;
    const value = requireArg(next, 'host');
    return parseDevOptions(rest, { ...acc, host: value });
  }
  if (token === '--no-auto-git') {
    return parseDevOptions(tail, { ...acc, noAutoGit: true });
  }
  if (token === '--no-auto-open') {
    return parseDevOptions(tail, { ...acc, noAutoOpen: true });
  }
  if (token.startsWith('--debounce=')) {
    const value = token.slice('--debounce='.length);
    const debounce = Number.parseInt(value, 10);
    if (!Number.isInteger(debounce) || debounce < 100 || debounce > 10000) {
      throw new CommandUsageError('Debounce must be between 100ms and 10s');
    }
    return parseDevOptions(tail, { ...acc, debounceMs: debounce });
  }

  throw new CommandUsageError(`Unknown dev option: ${token}`);
};

const handleDev: CommandHandler = async (args, context) => {
  const options = parseDevOptions(args);

  const devServer = new KanbanDevServer({
    boardFile: context.boardFile,
    tasksDir: context.tasksDir,
    host: options.host,
    port: options.port,
    autoGit: !options.noAutoGit,
    autoOpen: !options.noAutoOpen,
    debounceMs: options.debounceMs,
  });

  // Handle graceful shutdown
  const cleanup = async () => {
    console.log('\n[kanban-dev] Shutting down development server...');
    await devServer.stop();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  try {
    await devServer.start();
    console.log('[kanban-dev] Development server is running. Press Ctrl+C to stop.');

    // Keep the process alive
    return new Promise(() => {}); // Never resolves
  } catch (error) {
    console.error('[kanban-dev] Failed to start development server:', error);
    throw error;
  }
};

const handleShowTransitions: CommandHandler = async (_args, context) => {
  try {
    // Try multiple reasonable config paths
    const possiblePaths = [
      // From current working directory (could be repo root)
      path.resolve(process.cwd(), 'promethean.kanban.json'),
      // From board file directory (go up from docs/agile/boards)
      path.resolve(path.dirname(context.boardFile), '../promethean.kanban.json'),
      // From board file directory (go up two levels to repo root)
      path.resolve(path.dirname(context.boardFile), '../../promethean.kanban.json'),
      // From board file directory (go up three levels from boards to repo root)
      path.resolve(path.dirname(context.boardFile), '../../../promethean.kanban.json'),
      // From package location (kanban package to repo root)
      path.resolve(__dirname, '../../promethean.kanban.json'),
      // Direct relative to board file
      context.boardFile.replace('/boards/generated.md', '/promethean.kanban.json'),
    ];

    let transitionRulesEngine: TransitionRulesEngine | undefined;
    try {
      transitionRulesEngine = await createTransitionRulesEngine(possiblePaths);
    } catch (error) {
      // Gracefully handle missing config or initialization errors
      console.warn(
        'Warning: Transition rules engine not available:',
        error instanceof Error ? error.message : String(error),
      );
    }

    if (!transitionRulesEngine) {
      throw new Error('Could not find or load transition rules configuration');
    }

    const overview = transitionRulesEngine.getTransitionsOverview();
    console.log('# 🔄 Kanban Transition Rules Overview');
    console.log('');
    console.log(`## Status: ${overview.enabled ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`## Enforcement: ${overview.enforcementMode}`);
    if (overview.dslAvailable) {
      console.log(`## DSL: 🟢 Clojure DSL available`);
    } else {
      console.log(`## DSL: 🔴 Clojure DSL not available`);
    }
    console.log('');

    if (overview.validTransitions.length > 0) {
      console.log('## Valid Transitions:');
      for (const transition of overview.validTransitions) {
        console.log(`- ${transition.from} → ${transition.to}`);
        if (transition.description) {
          console.log(`  ${transition.description}`);
        }
      }
      console.log('');
    }

    if (overview.globalRules.length > 0) {
      console.log('## Global Rules:');
      for (const rule of overview.globalRules) {
        console.log(`- ${rule}`);
      }
      console.log('');
    }

    return overview;
  } catch (error) {
    console.error(
      'Error loading transition rules:',
      error instanceof Error ? error.message : String(error),
    );
    return { error: error instanceof Error ? error.message : String(error) };
  }
};

const handleShowProcess: CommandHandler = async (_args, _context) => {
  const section = 'overview';

  // Resolve the process.md path relative to the kanban package
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const repoRoot = path.resolve(__dirname, '../../../..');
  const processDocPath = path.join(repoRoot, 'docs/agile/process.md');

  try {
    const processContent = await readFile(processDocPath, 'utf8');

    // Extract the overview section
    const sectionRegex = new RegExp(
      `^#{1,3}\\s+.*${section}.*$[\\s\\S]*?(?=\\n#{1,3}\\s+|\\n$|$)`,
      'im',
    );
    const match = processContent.match(sectionRegex);

    if (match) {
      console.log(match[0].trim());
    } else {
      console.log('# 📋 Promethean Development Process');
      console.log('');
      console.log(
        'This document outlines the 6-step workflow for task development in the Promethean framework.',
      );
      console.log('');
      console.log(
        'Key transitions: Incoming→Accepted→Breakdown→Ready→Todo→In Progress→Review→Document→Done',
      );
      console.log('');
      console.log('For detailed process information, see: docs/agile/process.md');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error reading process document: ${message}`);
  }

  return null;
};

const handleList: CommandHandler = (args, context) =>
  withBoard(context, async (board) => {
    // Default columns to show
    const defaultColumns = ['ready', 'todo', 'in_progress', 'in_review', 'document'];

    // Parse optional columns filter
    let columnsToShow = defaultColumns;
    const showAll = args.includes('--all') || args.includes('-a');

    if (showAll) {
      columnsToShow = board.columns.map((col) => columnKey(col.name));
    } else {
      const customColumns = args.filter((arg) => !arg.startsWith('--'));
      if (customColumns.length > 0) {
        columnsToShow = customColumns.map((col) => columnKey(col));
      }
    }

    console.log('📋 Kanban Board Status');
    console.log('');

    let totalViolations = 0;
    const allTasks: any[] = [];

    for (const columnName of columnsToShow) {
      const column = board.columns.find((col) => columnKey(col.name) === columnName);
      if (!column) continue;

      const displayName = column.name;
      const taskCount = column.tasks.length;
      const limit = column.limit;

      // Check for WIP limit violations
      const wipViolation = limit && taskCount > limit;
      if (wipViolation) totalViolations++;

      // Display column header with status indicators
      let statusIcon = '✅';
      if (wipViolation) {
        statusIcon = '🚨';
      } else if (taskCount === 0) {
        statusIcon = '⭕';
      } else if (limit && taskCount >= limit * 0.8) {
        statusIcon = '⚠️';
      }

      console.log(`${statusIcon} ${displayName} (${taskCount}${limit ? `/${limit}` : ''})`);

      if (wipViolation) {
        console.log(`   ❌ WIP LIMIT VIOLATION: ${taskCount} > ${limit}`);
      }

      // Show tasks in this column
      if (column.tasks.length > 0) {
        column.tasks.forEach((task) => {
          const priority = task.priority ? ` [${task.priority}]` : '';
          const uuid = task.uuid.slice(0, 8);
          console.log(`   • ${task.title}${priority} (${uuid}...)`);
        });
        // Collect tasks for markdown output
        allTasks.push(...column.tasks.slice());
      } else {
        console.log(`   (empty)`);
      }
      console.log('');
    }

    // Summary
    if (totalViolations > 0) {
      console.log(`🚨 ${totalViolations} process violation(s) found`);
    } else {
      console.log('✅ No process violations detected');
    }

    // Show WIP limits summary
    const limitedColumns = board.columns.filter((col) => col.limit);
    if (limitedColumns.length > 0) {
      console.log('');
      console.log('📊 WIP Limits Summary:');
      limitedColumns.forEach((col) => {
        const percentage = col.limit ? Math.round((col.tasks.length / col.limit) * 100) : 0;
        const status = percentage > 100 ? '🚨' : percentage > 80 ? '⚠️' : '✅';
        console.log(`   ${status} ${col.name}: ${col.tasks.length}/${col.limit} (${percentage}%)`);
      });
    }

    // Return tasks for markdown output, along with violations metadata
    return {
      tasks: allTasks,
      violations: totalViolations,
    };
  });

const handleAudit: CommandHandler = (args, context) =>
  withBoard(context, async (board) => {
    const configResult = await loadKanbanConfig({
      argv: process.argv,
      env: process.env,
    });

    const eventLogManager = makeEventLogManager(configResult.config);
    const dryRun = !args.includes('--fix');
    const verbose = args.includes('--verbose');
    const columnFilter = args.find((arg) => arg.startsWith('--column='))?.split('=')[1];

    console.log(`🔍 Kanban Audit ${dryRun ? '(DRY RUN)' : '(FIX MODE)'}`);
    if (columnFilter) {
      console.log(`📋 Filtering by column: ${columnFilter}`);
    }
    console.log('');

    // Get all task histories from event log
    const allHistories = await eventLogManager.getAllTaskHistories();
    const allEvents = await eventLogManager.readEventLog();

    // Initialize git tracker for commit validation
    const gitTracker = new TaskGitTracker({ repoRoot: process.cwd() });

    console.log('🔍 Analyzing task state consistency...');

    // Collect all tasks for concurrent processing
    const allTasks = board.columns.flatMap((column) => {
      if (columnFilter && columnKey(column.name) !== columnKey(columnFilter)) {
        return [];
      }
      return column.tasks.map((task) => ({ task, columnName: column.name }));
    });

    const totalTasks = allTasks.length;
    let processedTasks = 0;

    // Process all tasks concurrently
    const taskAnalyses = await Promise.all(
      allTasks.map(async ({ task, columnName }) => {
        const [replayResult, taskFilePath] = await Promise.all([
          eventLogManager.replayTaskTransitions(task.uuid, task.status),
          findTaskFilePath(context.tasksDir, task.uuid),
        ]);

        const statusAnalysis = gitTracker.analyzeTaskStatus(
          task,
          taskFilePath || `${context.tasksDir}/${task.uuid}.md`,
        );

        // Update progress
        processedTasks++;
        if (processedTasks % 50 === 0 || processedTasks === totalTasks) {
          process.stderr.write(
            `\r📊 Progress: ${processedTasks}/${totalTasks} (${Math.round((processedTasks / totalTasks) * 100)}%)`,
          );
        }

        return {
          task,
          columnName,
          replayResult,
          taskFilePath,
          statusAnalysis,
        };
      }),
    );

    process.stderr.write('\r✅ Analysis complete\n');

    // Aggregate results
    const results = {
      inconsistencies: [] as Array<{
        task: any;
        current: string;
        expected: string;
        invalidEvent?: any;
      }>,
      orphanedTasks: [] as Array<{
        task: any;
        issues: string[];
        recommendations: string[];
      }>,
      untrackedTasks: [] as Array<{
        task: any;
        issues: string[];
        recommendations: string[];
      }>,
      tasksWithIssues: [] as Array<{
        task: any;
        issues: string[];
        recommendations: string[];
      }>,
      healthyTasks: 0,
    };

    for (const analysis of taskAnalyses) {
      const { task, replayResult, statusAnalysis } = analysis;

      if (statusAnalysis.isTrulyOrphaned) {
        results.orphanedTasks.push({
          task,
          issues: statusAnalysis.issues,
          recommendations: statusAnalysis.recommendations,
        });
      } else if (statusAnalysis.isUntracked) {
        results.untrackedTasks.push({
          task,
          issues: statusAnalysis.issues,
          recommendations: statusAnalysis.recommendations,
        });
      } else if (!statusAnalysis.isHealthy) {
        results.tasksWithIssues.push({
          task,
          issues: statusAnalysis.issues,
          recommendations: statusAnalysis.recommendations,
        });
      } else {
        results.healthyTasks++;
      }

      if (replayResult.finalStatus !== task.status) {
        results.inconsistencies.push({
          task,
          current: task.status,
          expected: replayResult.finalStatus,
          invalidEvent: replayResult.invalidEvent,
        });
      }
    }

    // Calculate counts for compatibility
    const inconsistenciesFound = results.inconsistencies.length;
    const illegalTransitionsFound = results.inconsistencies.filter(
      (inc) => inc.invalidEvent,
    ).length;
    const orphanedTasksFound = results.orphanedTasks.length;
    const untrackedTasksFound = results.untrackedTasks.length;
    const healthyTasksFound = results.healthyTasks;
    let inconsistenciesFixed = 0;

    // Output results
    if (!verbose) {
      // Summarized output for normal mode (default)
      console.log(`📊 AUDIT RESULTS:`);
      console.log(`   ✅ Healthy tasks: ${healthyTasksFound}`);
      if (inconsistenciesFound > 0) {
        console.log(`   ❌ Inconsistencies: ${inconsistenciesFound}`);
      }
      if (illegalTransitionsFound > 0) {
        console.log(`   🚨 Illegal transitions: ${illegalTransitionsFound}`);
      }
      if (orphanedTasksFound > 0) {
        console.log(`   🚨 Orphaned tasks: ${orphanedTasksFound}`);
      }
      if (untrackedTasksFound > 0) {
        console.log(`   ⚠️  Untracked tasks: ${untrackedTasksFound}`);
      }
      if (results.tasksWithIssues.length > 0) {
        console.log(`   ⚠️  Tasks with issues: ${results.tasksWithIssues.length}`);
      }
      console.log('');

      if (inconsistenciesFound > 0 || orphanedTasksFound > 0 || untrackedTasksFound > 0) {
        console.log('💡 Use --verbose for detailed breakdown');
        if (dryRun) {
          console.log('💡 Use --fix to automatically correct inconsistencies');
        }
      }
    } else {
      // Detailed output for verbose mode
      for (const orphaned of results.orphanedTasks) {
        console.log(`🚨 TRULY ORPHANED TASK: "${orphaned.task.title}"`);
        console.log(`   Task ID: ${orphaned.task.uuid}`);
        console.log(`   Status: ${orphaned.task.status}`);
        console.log(`   Issues: ${orphaned.issues.join(', ')}`);
        console.log(`   Recommendations:`);
        orphaned.recommendations.forEach((rec) => console.log(`     • ${rec}`));
        console.log('');
      }

      for (const untracked of results.untrackedTasks) {
        console.log(`⚠️  UNTRACKED TASK: "${untracked.task.title}"`);
        console.log(`   Task ID: ${untracked.task.uuid}`);
        console.log(`   Status: ${untracked.task.status}`);
        console.log(`   Issues: ${untracked.issues.join(', ')}`);
        console.log(`   Recommendations:`);
        untracked.recommendations.forEach((rec) => console.log(`     • ${rec}`));
        console.log('');
      }

      for (const issue of results.tasksWithIssues) {
        console.log(`⚠️  TASK WITH ISSUES: "${issue.task.title}"`);
        console.log(`   Task ID: ${issue.task.uuid}`);
        console.log(`   Status: ${issue.task.status}`);
        console.log(`   Issues: ${issue.issues.join(', ')}`);
        console.log(`   Recommendations:`);
        issue.recommendations.forEach((rec) => console.log(`     • ${rec}`));
        console.log('');
      }

      for (const inconsistency of results.inconsistencies) {
        console.log(`❌ INCONSISTENCY: Task "${inconsistency.task.title}"`);
        console.log(`   Current status: ${inconsistency.current}`);
        console.log(`   Expected status: ${inconsistency.expected}`);
        console.log(`   Task ID: ${inconsistency.task.uuid}`);

        if (inconsistency.invalidEvent) {
          console.log(
            `   🚨 ILLEGAL TRANSITION: ${inconsistency.invalidEvent.fromStatus} → ${inconsistency.invalidEvent.toStatus}`,
          );
          console.log(`   Event ID: ${inconsistency.invalidEvent.id}`);
          console.log(`   Timestamp: ${inconsistency.invalidEvent.timestamp}`);
        }

        if (!dryRun) {
          try {
            // Fix the task status
            await updateStatus(
              board as Board,
              inconsistency.task.uuid,
              inconsistency.expected,
              context.boardFile,
              context.tasksDir,
              undefined,
              `Audit correction: Reset to last valid state from event log`,
              eventLogManager,
              'system',
            );
            inconsistenciesFixed++;
            console.log(`   ✅ FIXED: Status reset to ${inconsistency.expected}`);
          } catch (error) {
            console.log(`   ❌ FAILED TO FIX: ${error}`);
          }
        }
        console.log('');
      }
    }

    // Check for tasks that exist in event log but not in board
    const boardTaskIds = new Set(allTasks.map(({ task }) => task.uuid));

    const orphanedEvents = Array.from(allHistories.entries())
      .filter(([taskId, events]) => !boardTaskIds.has(taskId) && events.length > 0)
      .map(([taskId, events]) => ({ taskId, events }));

    if (orphanedEvents.length > 0) {
      if (verbose) {
        for (const { taskId, events } of orphanedEvents) {
          console.log(
            `⚠️  ORPHANED EVENTS: Task ${taskId} has ${events.length} events but not found in board`,
          );
          const lastEvent = events[events.length - 1];
          if (lastEvent) {
            console.log(`   Last event: ${lastEvent.toStatus} at ${lastEvent.timestamp}`);
          }
          console.log('');
        }
      } else {
        console.log(
          `⚠️  Orphaned events: ${orphanedEvents.length} tasks have events but not in board`,
        );
      }
    }

    // Handle untracked tasks in fix mode
    if (!dryRun && untrackedTasksFound > 0) {
      console.log('🔧 UNTRACKED TASKS:');
      console.log('📝 Commit tracking will be updated automatically on next kanban operation');
      console.log('');

      if (verbose) {
        for (const untracked of results.untrackedTasks) {
          console.log(`⚠️  UNTRACKED TASK: "${untracked.task.title}"`);
          console.log(`   Task ID: ${untracked.task.uuid}`);
          console.log(`   Status: ${untracked.task.status}`);
          console.log(`   Recommendation: Commit tracking will be updated on next operation`);
          console.log('');
        }
      }
    }

    // Pantheon-driven column normalization
    const canonicalStatuses = Array.from(configResult.config.statusValues ?? []);
    const columnAnalysis = await analyzeColumnNormalization(
      board.columns.map((col) => col.name),
      canonicalStatuses,
    );

    const actionableGroups = columnAnalysis.groups.filter((group) =>
      group.members.some((member) => member.action !== 'keep'),
    );

    if (actionableGroups.length > 0) {
      console.log('🧠 Pantheon Workflow: Column Normalization');
      for (const group of actionableGroups) {
        console.log(`   Canonical column "${group.canonicalName}":`);
        for (const member of group.members) {
          if (member.action === 'keep') continue;
          const verb = member.action === 'merge' ? 'merge into' : 'rename to';
          console.log(
            `     • ${member.originalName} → ${verb} ${group.canonicalName} (${member.reason})`,
          );
        }
      }

      if (dryRun) {
        console.log(
          '   💡 Run with --fix to apply these column normalization changes automatically',
        );
      } else {
        const applied = applyColumnNormalization(board as Board, columnAnalysis);
        if (applied > 0) {
          await writeBoard(context.boardFile, board as Board);
          console.log(
            `   ✅ Applied ${applied} column normalization ${applied === 1 ? 'update' : 'updates'}`,
          );
        } else {
          console.log('   ℹ️ Column names already aligned with canonical workflow states');
        }
      }
      console.log('');
    }

    // Final summary
    const totalTasksAnalyzed = allTasks.length;
    console.log('📊 AUDIT SUMMARY:');
    console.log(`   Total tasks analyzed: ${totalTasksAnalyzed}`);
    console.log(`   Total events in log: ${allEvents.length}`);
    console.log(`   Inconsistencies found: ${inconsistenciesFound}`);
    console.log(`   Illegal transitions: ${illegalTransitionsFound}`);
    console.log('');
    console.log('🔍 TASK STATUS BREAKDOWN:');
    console.log(
      `   ✅ Healthy tasks: ${healthyTasksFound} (${((healthyTasksFound / totalTasksAnalyzed) * 100).toFixed(1)}%)`,
    );
    console.log(
      `   ⚠️  Untracked tasks: ${untrackedTasksFound} (${((untrackedTasksFound / totalTasksAnalyzed) * 100).toFixed(1)}%)`,
    );
    console.log(
      `   🚨 Truly orphaned tasks: ${orphanedTasksFound} (${((orphanedTasksFound / totalTasksAnalyzed) * 100).toFixed(1)}%)`,
    );

    if (!dryRun) {
      console.log(`   Inconsistencies fixed: ${inconsistenciesFixed}`);
    }

    console.log('');

    if (inconsistenciesFound > 0) {
      if (dryRun) {
        console.log('💡 Run with --fix to automatically correct these inconsistencies');
      } else {
        console.log('✅ Audit completed with automatic corrections');
      }
    } else {
      console.log('✅ No inconsistencies found - board state is consistent with event log');
    }

    // Return structure expected by markdown formatter
    const issues = [];

    if (inconsistenciesFound > 0) {
      issues.push({
        type: 'error',
        message: `${inconsistenciesFound} status inconsistency${inconsistenciesFound === 1 ? '' : 'es'} found`,
      });
    }

    if (illegalTransitionsFound > 0) {
      issues.push({
        type: 'error',
        message: `${illegalTransitionsFound} illegal transition${illegalTransitionsFound === 1 ? '' : 's'} found`,
      });
    }

    if (orphanedTasksFound > 0) {
      issues.push({
        type: 'error',
        message: `${orphanedTasksFound} orphaned task${orphanedTasksFound === 1 ? '' : 's'} found`,
      });
    }

    if (untrackedTasksFound > 0) {
      issues.push({
        type: 'warning',
        message: `${untrackedTasksFound} untracked task${untrackedTasksFound === 1 ? '' : 's'} found`,
      });
    }

    if (results.tasksWithIssues.length > 0) {
      issues.push({
        type: 'warning',
        message: `${results.tasksWithIssues.length} task${results.tasksWithIssues.length === 1 ? '' : 's'} with issues`,
      });
    }

    return {
      issues,
      summary: {
        total: totalTasksAnalyzed,
        errors: inconsistenciesFound + illegalTransitionsFound + orphanedTasksFound,
        warnings: untrackedTasksFound + results.tasksWithIssues.length,
      },
      // Keep old structure for backward compatibility
      inconsistenciesFound,
      inconsistenciesFixed,
      illegalTransitionsFound,
      orphanedTasksFound,
      untrackedTasksFound,
      healthyTasksFound,
      dryRun,
    };
  });

const handleCommitStats: CommandHandler = (_args, context) =>
  withBoard(context, async (board) => {
    const gitTracker = new TaskGitTracker({ repoRoot: process.cwd() });

    // Collect all tasks from the board and convert to expected format
    const allTasks: any[] = [];
    for (const column of board.columns) {
      for (const task of column.tasks) {
        allTasks.push({
          frontmatter: task, // Task object itself contains the frontmatter fields
        });
      }
    }

    // Get commit tracking statistics
    const stats = gitTracker.getCommitTrackingStats(allTasks);

    console.log('📊 Kanban Commit Tracking Statistics');
    console.log('');
    console.log(`Total tasks: ${stats.total}`);
    console.log(`Tasks with commit tracking: ${stats.withCommitTracking}`);
    console.log(`Orphaned tasks: ${stats.orphaned}`);
    console.log(`Tracking coverage: ${(100 - stats.orphanageRate).toFixed(1)}%`);
    console.log('');

    if (stats.orphaned > 0) {
      console.log(`⚠️  Found ${stats.orphaned} orphaned task(s) lacking proper commit tracking`);
      console.log('   Run "pnpm kanban audit --fix" to add commit tracking to these tasks');
      console.log('');
    }

    if (stats.withCommitTracking > 0) {
      console.log('✅ Commit tracking is working for tracked tasks');
      console.log('   Each task change creates a git commit with standardized messages');
      console.log('   Task files include lastCommitSha and commitHistory fields');
      console.log('');
    }

    return stats;
  });

const handleEnforceWipLimits: CommandHandler = (args, context) =>
  withBoard(context, async (board) => {
    const configResult = await loadKanbanConfig({
      argv: process.argv,
      env: process.env,
    });

    const eventLogManager = makeEventLogManager(configResult.config);
    const dryRun = !args.includes('--fix');
    const columnFilter = args.find((arg) => arg.startsWith('--column='))?.split('=')[1];

    console.log(`🚧 WIP Limits Enforcement ${dryRun ? '(DRY RUN)' : '(FIX MODE)'}`);
    if (columnFilter) {
      console.log(`📋 Filtering by column: ${columnFilter}`);
    }
    console.log('');

    let totalViolations = 0;
    let totalCorrections = 0;

    for (const column of board.columns) {
      if (columnFilter && columnKey(column.name) !== columnKey(columnFilter)) {
        continue;
      }

      if (column.limit && column.tasks.length > column.limit) {
        const violationCount = column.tasks.length - column.limit;
        totalViolations += violationCount;

        console.log(`🚨 WIP VIOLATION: ${column.name}`);
        console.log(
          `   Current: ${column.tasks.length}/${column.limit} (${violationCount} over limit)`,
        );

        // Sort tasks by priority (lower priority number = higher priority)
        const sortedTasks = [...column.tasks].sort((a, b) => {
          const priorityA = getPriorityNumeric(a.priority);
          const priorityB = getPriorityNumeric(b.priority);
          return priorityB - priorityA; // Reverse sort (higher priority first)
        });

        // Tasks to move back (lowest priority)
        const tasksToMove = sortedTasks.slice(-violationCount);

        console.log(`   Tasks to move back: ${tasksToMove.length}`);

        for (const task of tasksToMove) {
          console.log(`   - "${task.title}" (${task.priority})`);

          if (!dryRun) {
            try {
              // Find the previous column in the workflow
              const previousColumn = findPreviousColumn(column.name, board.columns);
              if (previousColumn) {
                await updateStatus(
                  board as Board,
                  task.uuid,
                  previousColumn.name,
                  context.boardFile,
                  context.tasksDir,
                  undefined,
                  `WIP limit enforcement: moved from ${column.name} to ${previousColumn.name}`,
                  eventLogManager,
                  'system',
                );
                totalCorrections++;
                console.log(`     ✅ Moved to ${previousColumn.name}`);
              } else {
                console.log(`     ⚠️  No previous column found for ${column.name}`);
              }
            } catch (error) {
              console.log(`     ❌ Failed to move: ${error}`);
            }
          }
        }
        console.log('');
      }
    }

    console.log('📊 WIP ENFORCEMENT SUMMARY:');
    console.log(`   Total violations: ${totalViolations}`);
    console.log(`   Total corrections: ${totalCorrections}`);

    if (totalViolations > 0) {
      if (dryRun) {
        console.log('💡 Run with --fix to automatically move lowest priority tasks');
      } else {
        console.log('✅ WIP limits enforced');
      }
    } else {
      console.log('✅ No WIP limit violations found');
    }

    return { violations: totalViolations, corrections: totalCorrections, dryRun };
  });

// Helper function to find previous column in workflow
const findPreviousColumn = (
  currentColumnName: string,
  columns: ReadonlyArray<{ name: string }>,
) => {
  const workflowOrder = [
    'icebox',
    'incoming',
    'accepted',
    'breakdown',
    'blocked',
    'ready',
    'todo',
    'in_progress',
    'review',
    'document',
    'done',
    'rejected',
  ];
  const currentIndex = workflowOrder.findIndex(
    (col) => columnKey(col) === columnKey(currentColumnName),
  );

  if (currentIndex <= 0) return null;

  const previousColumnName = workflowOrder[currentIndex - 1];
  if (!previousColumnName) return null;
  return columns.find((col) => columnKey(col.name) === columnKey(previousColumnName)) || null;
};

// Helper function to get numeric priority
const getPriorityNumeric = (priority: string | number | undefined): number => {
  if (typeof priority === 'number') return priority;
  if (typeof priority === 'string') {
    const match = priority.match(/P(\d+)/i);
    if (match?.[1]) return parseInt(match[1], 10);
    if (priority.toLowerCase() === 'critical') return 0;
    if (priority.toLowerCase() === 'high') return 1;
    if (priority.toLowerCase() === 'medium') return 2;
    if (priority.toLowerCase() === 'low') return 3;
  }
  return 3; // Default to low priority
};

// WIP Limit Enforcement Commands

const handleWipMonitor: CommandHandler = (args, context) =>
  withBoard(context, async (board) => {
    const configResult = await loadKanbanConfig();
    const wipEnforcement = await createWIPLimitEnforcement({
      config: configResult.config,
    });

    const monitor = await wipEnforcement.getCapacityMonitor(board as Board);
    const watchMode = args.includes('--watch');
    const interval = parseInt(
      args.find((arg) => arg.startsWith('--interval='))?.split('=')[1] || '5000',
    );

    console.log('📊 Real-time WIP Capacity Monitor');
    console.log(`🕐 Last updated: ${new Date(monitor.timestamp).toLocaleString()}`);
    console.log('');

    const displayMonitor = (data: typeof monitor) => {
      console.clear();
      console.log('📊 Real-time WIP Capacity Monitor');
      console.log(`🕐 Last updated: ${new Date(data.timestamp).toLocaleString()}`);
      console.log(`🚨 Total violations: ${data.totalViolations}`);
      console.log(`📈 Average utilization: ${data.utilization.average.toFixed(1)}%`);
      console.log('');

      for (const column of data.columns) {
        const icon =
          column.status === 'critical'
            ? '🚨'
            : column.status === 'violation'
              ? '❌'
              : column.status === 'warning'
                ? '⚠️'
                : '✅';

        const utilizationBar = column.limit
          ? '█'.repeat(Math.floor(column.utilization / 10)) +
            '░'.repeat(10 - Math.floor(column.utilization / 10))
          : 'N/A';

        console.log(
          `${icon} ${column.name.padEnd(15)} ${column.current.toString().padStart(3)}/${column.limit?.toString().padStart(3) || '∞'} ${utilizationBar} ${column.utilization.toFixed(1)}%`,
        );
      }

      console.log('');
      if (data.totalViolations > 0) {
        console.log('💡 Run "kanban enforce-wip-limits --fix" to resolve violations');
      }
      if (watchMode) {
        console.log('🔄 Watching for changes... (Ctrl+C to stop)');
      }
    };

    if (watchMode) {
      console.log('🔄 Starting real-time monitoring...');
      const intervalId = setInterval(async () => {
        const freshMonitor = await wipEnforcement.getCapacityMonitor();
        displayMonitor(freshMonitor);
      }, interval);

      // Handle Ctrl+C to stop watching
      process.on('SIGINT', () => {
        clearInterval(intervalId);
        console.log('\n👋 Monitoring stopped');
        process.exit(0);
      });

      // Initial display
      displayMonitor(monitor);
    } else {
      displayMonitor(monitor);
    }

    return monitor;
  });

const handleWipCompliance: CommandHandler = (args, context) =>
  withBoard(context, async (_board) => {
    const configResult = await loadKanbanConfig();
    const wipEnforcement = await createWIPLimitEnforcement({
      config: configResult.config,
    });

    const timeframe = (args.find((arg) => arg.startsWith('--timeframe='))?.split('=')[1] ||
      '24h') as '24h' | '7d' | '30d';
    const format = args.includes('--json') ? 'json' : 'table';

    console.log(`📋 WIP Compliance Report (${timeframe})`);
    console.log('');

    const report = await wipEnforcement.generateComplianceReport(timeframe);

    if (format === 'json') {
      return report;
    }

    console.log(`📊 Summary:`);
    console.log(`   Total violations: ${report.totalViolations}`);
    console.log(`   Override rate: ${report.overrideRate.toFixed(1)}%`);
    console.log('');

    if (Object.keys(report.violationsByColumn).length > 0) {
      console.log('📊 Violations by Column:');
      for (const [column, count] of Object.entries(report.violationsByColumn)) {
        console.log(`   ${column}: ${count}`);
      }
      console.log('');
    }

    if (Object.keys(report.violationsBySeverity).length > 0) {
      console.log('🚨 Violations by Severity:');
      for (const [severity, count] of Object.entries(report.violationsBySeverity)) {
        const icon = severity === 'critical' ? '🚨' : severity === 'error' ? '❌' : '⚠️';
        console.log(`   ${icon} ${severity}: ${count}`);
      }
      console.log('');
    }

    if (report.topViolatedColumns.length > 0) {
      console.log('🔥 Top Violated Columns:');
      for (const { column, violations } of report.topViolatedColumns) {
        console.log(`   ${column}: ${violations} violations`);
      }
      console.log('');
    }

    if (report.recommendations.length > 0) {
      console.log('💡 Recommendations:');
      for (const recommendation of report.recommendations) {
        console.log(`   ${recommendation}`);
      }
    }

    return report;
  });

const handleWipViolations: CommandHandler = (args, context) =>
  withBoard(context, async (_board) => {
    const configResult = await loadKanbanConfig();
    const wipEnforcement = await createWIPLimitEnforcement({
      config: configResult.config,
    });

    const limit = parseInt(args.find((arg) => arg.startsWith('--limit='))?.split('=')[1] || '20');
    const column = args.find((arg) => arg.startsWith('--column='))?.split('=')[1];
    const severity = args.find((arg) => arg.startsWith('--severity='))?.split('=')[1] as
      | 'warning'
      | 'error'
      | 'critical'
      | undefined;
    const since = args.find((arg) => arg.startsWith('--since='))?.split('=')[1];

    console.log('🚨 WIP Limit Violations History');
    if (column) console.log(`📋 Column: ${column}`);
    if (severity) console.log(`🔍 Severity: ${severity}`);
    if (since) console.log(`📅 Since: ${since}`);
    console.log('');

    const violations = wipEnforcement.getViolationHistory({
      limit,
      column,
      severity,
      since,
    });

    if (violations.length === 0) {
      console.log('✅ No violations found matching the criteria');
      return [];
    }

    for (const violation of violations) {
      const icon =
        violation.severity === 'critical' ? '🚨' : violation.severity === 'error' ? '❌' : '⚠️';

      console.log(`${icon} ${new Date(violation.timestamp).toLocaleString()}`);
      console.log(`   Task: ${violation.taskTitle}`);
      console.log(`   Column: ${violation.column} (${violation.current}/${violation.limit})`);
      console.log(`   Utilization: ${violation.utilization.toFixed(1)}%`);
      console.log(`   Blocked: ${violation.blocked ? 'Yes' : 'No'}`);

      if (violation.overrideReason) {
        console.log(`   🔓 Override: ${violation.overrideReason} by ${violation.overrideBy}`);
      }

      if (violation.suggestions.length > 0) {
        console.log(`   💡 Suggestions:`);
        for (const suggestion of violation.suggestions) {
          console.log(`     • ${suggestion.description}`);
        }
      }
      console.log('');
    }

    return violations;
  });

const handleWipSuggestions: CommandHandler = (args, context) =>
  withBoard(context, async (board) => {
    const configResult = await loadKanbanConfig();
    const wipEnforcement = await createWIPLimitEnforcement({
      config: configResult.config,
    });

    const column = requireArg(args[0], 'column name');
    const apply = args.includes('--apply');

    console.log(`💡 Capacity Balancing Suggestions for "${column}"`);
    console.log('');

    const suggestions = await wipEnforcement.generateCapacitySuggestions(column, board as Board);

    if (suggestions.length === 0) {
      console.log('✅ No capacity balancing suggestions needed');
      return [];
    }

    for (const suggestion of suggestions) {
      const icon =
        suggestion.priority === 'high' ? '🔥' : suggestion.priority === 'medium' ? '⚡' : '💡';

      console.log(`${icon} ${suggestion.description}`);
      console.log(`   Priority: ${suggestion.priority}`);
      console.log(`   Impact: ${suggestion.impact.taskCount} tasks affected`);

      if (suggestion.tasks && suggestion.tasks.length > 0) {
        console.log(`   Tasks to move:`);
        for (const task of suggestion.tasks) {
          console.log(`     • ${task.title} (${task.priority})`);
        }
      }
      console.log('');
    }

    if (apply && suggestions.length > 0) {
      console.log('🔧 Applying suggestions...');
      // Implementation for applying suggestions would go here
      console.log('⚠️  Auto-apply feature not yet implemented');
    }

    return suggestions;
  });

// CRUD Commands Implementation

const parseCreateTaskArgs = (args: ReadonlyArray<string>) => {
  if (args.length === 0) {
    throw new CommandUsageError('create requires a title');
  }

  // Parse optional flags and separate title from flags
  const result: {
    title: string;
    content?: string;
    priority?: string;
    labels?: string[];
    status?: string;
  } = { title: '' };

  const titleParts: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg) continue;

    // Handle flags
    if (arg.startsWith('--content=')) {
      result.content = arg.slice('--content='.length);
    } else if (arg === '--content' && i + 1 < args.length && args[i + 1]) {
      result.content = args[i + 1];
      i++; // Skip next arg
    } else if (arg.startsWith('--priority=')) {
      result.priority = arg.slice('--priority='.length);
    } else if (arg === '--priority' && i + 1 < args.length && args[i + 1]) {
      result.priority = args[i + 1];
      i++; // Skip next arg
    } else if (arg.startsWith('--status=')) {
      result.status = arg.slice('--status='.length);
    } else if (arg === '--status' && i + 1 < args.length && args[i + 1]) {
      result.status = args[i + 1];
      i++; // Skip next arg
    } else if (arg.startsWith('--labels=')) {
      const labelsStr = arg.slice('--labels='.length);
      result.labels = labelsStr
        .split(',')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
    } else if (arg === '--labels' && i + 1 < args.length && args[i + 1]) {
      const labelsStr = args[i + 1];
      if (labelsStr) {
        result.labels = labelsStr
          .split(',')
          .map((l) => l.trim())
          .filter((l) => l.length > 0);
      }
      i++; // Skip next arg
    } else {
      // Add to title parts (non-flag arguments)
      titleParts.push(arg);
    }
  }

  const title = titleParts.join(' ').trim();
  if (title.length === 0) {
    throw new CommandUsageError('create requires a title');
  }
  result.title = title;

  return result;
};

const handleCreate: CommandHandler = (args, context) =>
  withBoard(context, async (board) => {
    const mutableBoard = board as unknown as Board;
    const taskArgs = parseCreateTaskArgs(args);

    const newTask = await createTask(
      mutableBoard,
      taskArgs.status || 'incoming',
      {
        title: taskArgs.title,
        content: taskArgs.content,
        priority: taskArgs.priority,
        labels: taskArgs.labels,
      },
      context.tasksDir,
      context.boardFile,
    );

    console.log(`✅ Created task "${newTask.title}" (${newTask.uuid.slice(0, 8)}...)`);
    console.log(`   Status: ${newTask.status}`);
    if (newTask.priority) {
      console.log(`   Priority: ${newTask.priority}`);
    }
    if (newTask.labels && newTask.labels.length > 0) {
      console.log(`   Labels: ${newTask.labels.join(', ')}`);
    }

    // Show commit tracking information
    if (newTask.lastCommitSha) {
      console.log(`   Commit: ${newTask.lastCommitSha.slice(0, 8)}...`);
    }

    return newTask;
  });

const parseUpdateTaskArgs = (args: ReadonlyArray<string>) => {
  if (args.length === 0) {
    throw new CommandUsageError('update requires a task UUID');
  }

  const uuid = requireArg(args[0], 'task UUID');

  // Parse optional flags
  const result: {
    uuid: string;
    title?: string;
    content?: string;
    priority?: string;
    status?: string;
  } = { uuid };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (!arg) continue;

    if (arg.startsWith('--title=')) {
      result.title = arg.slice('--title='.length);
    } else if (arg === '--title' && i + 1 < args.length && args[i + 1]) {
      result.title = args[i + 1];
      i++; // Skip next arg
    } else if (arg.startsWith('--content=')) {
      result.content = arg.slice('--content='.length);
    } else if (arg === '--content' && i + 1 < args.length && args[i + 1]) {
      result.content = args[i + 1];
      i++; // Skip next arg
    } else if (arg.startsWith('--priority=')) {
      result.priority = arg.slice('--priority='.length);
    } else if (arg === '--priority' && i + 1 < args.length && args[i + 1]) {
      result.priority = args[i + 1];
      i++; // Skip next arg
    }
  }

  return result;
};

const handleUpdate: CommandHandler = (args, context) =>
  withBoard(context, async (board) => {
    const mutableBoard = board as unknown as Board;
    const updateArgs = parseUpdateTaskArgs(args);

    let updatedTask;

    // Update title if provided
    if (updateArgs.title) {
      updatedTask = await renameTask(
        mutableBoard,
        updateArgs.uuid,
        updateArgs.title,
        context.tasksDir,
        context.boardFile,
      );
      if (updatedTask) {
        console.log(`✅ Updated title to "${updateArgs.title}"`);
      }
    }

    // Update content/description if provided
    if (updateArgs.content) {
      updatedTask = await updateTaskDescription(
        mutableBoard,
        updateArgs.uuid,
        updateArgs.content,
        context.tasksDir,
        context.boardFile,
      );
      if (updatedTask) {
        console.log(`✅ Updated task description`);
      }
    }

    if (!updatedTask) {
      throw new CommandUsageError(`Task with UUID ${updateArgs.uuid} not found`);
    }

    return updatedTask;
  });

const parseDeleteTaskArgs = (args: ReadonlyArray<string>) => {
  if (args.length === 0) {
    throw new CommandUsageError('delete requires a task UUID');
  }

  const uuid = requireArg(args[0], 'task UUID');
  const confirm = args.includes('--confirm') || args.includes('-y');

  return { uuid, confirm };
};

const handleDelete: CommandHandler = (args, context) =>
  withBoard(context, async (board) => {
    const mutableBoard = board as unknown as Board;
    const deleteArgs = parseDeleteTaskArgs(args);

    // First, find the task to show what will be deleted
    const task = findTaskById(mutableBoard, deleteArgs.uuid);
    if (!task) {
      throw new CommandUsageError(`Task with UUID ${deleteArgs.uuid} not found`);
    }

    // Ask for confirmation unless --confirm flag is provided
    if (!deleteArgs.confirm) {
      console.log(`⚠️  About to delete task:`);
      console.log(`   Title: ${task.title}`);
      console.log(`   UUID: ${task.uuid}`);
      console.log(`   Status: ${task.status}`);
      console.log('');
      console.log('This action cannot be undone. Use --confirm to proceed with deletion.');
      return { deleted: false, task };
    }

    const deleted = await deleteTask(
      mutableBoard,
      deleteArgs.uuid,
      context.tasksDir,
      context.boardFile,
    );

    if (deleted) {
      console.log(`✅ Deleted task "${task.title}" (${task.uuid.slice(0, 8)}...)`);
      return { deleted: true, task };
    } else {
      console.log(`❌ Failed to delete task with UUID ${deleteArgs.uuid}`);
      return { deleted: false, task };
    }
  });

// Epic command handlers
const parseCreateEpicArgs = (args: ReadonlyArray<string>) => {
  if (args.length === 0) {
    throw new CommandUsageError('create-epic requires a title');
  }

  const title = requireArg(args[0], 'epic title');
  const content = args.find((arg) => arg.startsWith('--content='))?.slice(11);
  const subtaskUuids = args
    .filter((arg) => arg.startsWith('--subtask='))
    .map((arg) => arg.slice(10));

  return { title, content, subtaskUuids };
};

const handleCreateEpic: CommandHandler = (args, context) =>
  withBoard(context, async (board) => {
    const mutableBoard = board as unknown as Board;
    const epicArgs = parseCreateEpicArgs(args);

    // Validate subtask UUIDs if provided
    if (epicArgs.subtaskUuids.length > 0) {
      for (const subtaskUuid of epicArgs.subtaskUuids) {
        const subtask = findTaskById(mutableBoard, subtaskUuid);
        if (!subtask) {
          throw new CommandUsageError(`Subtask with UUID ${subtaskUuid} not found`);
        }
        if (isEpic(subtask)) {
          throw new CommandUsageError(`Cannot add epic ${subtaskUuid} as a subtask`);
        }
      }
    }

    const newEpic = createEpic(epicArgs.title, epicArgs.content, epicArgs.subtaskUuids);

    // Add epic to the incoming column
    const incomingColumn = mutableBoard.columns.find((col) => col.name === 'incoming');
    if (incomingColumn) {
      incomingColumn.tasks.push(newEpic);
    }

    // Link subtasks to epic if provided
    if (epicArgs.subtaskUuids.length > 0) {
      for (const subtaskUuid of epicArgs.subtaskUuids) {
        const result = addSubtaskToEpic(mutableBoard, newEpic.uuid, subtaskUuid);
        if (!result.success) {
          console.warn(`⚠️  Failed to link subtask ${subtaskUuid}: ${result.reason}`);
        }
      }
    }

    console.log(`✅ Created epic "${newEpic.title}" (${newEpic.uuid.slice(0, 8)}...)`);
    console.log(`   Status: ${newEpic.status}`);
    console.log(`   Epic Status: ${newEpic.epicStatus}`);
    if (epicArgs.subtaskUuids.length > 0) {
      console.log(`   Subtasks: ${epicArgs.subtaskUuids.length}`);
    }

    return newEpic;
  });

const parseAddTaskArgs = (args: ReadonlyArray<string>) => {
  if (args.length < 2) {
    throw new CommandUsageError('add-task requires epic UUID and task UUID');
  }

  const epicUuid = requireArg(args[0], 'epic UUID');
  const taskUuid = requireArg(args[1], 'task UUID');

  return { epicUuid, taskUuid };
};

const handleAddTask: CommandHandler = (args, context) =>
  withBoard(context, async (board) => {
    const mutableBoard = board as unknown as Board;
    const taskArgs = parseAddTaskArgs(args);

    const result = addSubtaskToEpic(mutableBoard, taskArgs.epicUuid, taskArgs.taskUuid);

    if (!result.success) {
      throw new CommandUsageError(result.reason || 'Failed to add task to epic');
    }

    const epic = findTaskById(mutableBoard, taskArgs.epicUuid);
    const task = findTaskById(mutableBoard, taskArgs.taskUuid);

    console.log(`✅ Added task "${task?.title}" to epic "${epic?.title}"`);
    console.log(`   Epic UUID: ${taskArgs.epicUuid.slice(0, 8)}...`);
    console.log(`   Task UUID: ${taskArgs.taskUuid.slice(0, 8)}...`);

    return { success: true, epic, task };
  });

const parseRemoveTaskArgs = (args: ReadonlyArray<string>) => {
  if (args.length < 2) {
    throw new CommandUsageError('remove-task requires epic UUID and task UUID');
  }

  const epicUuid = requireArg(args[0], 'epic UUID');
  const taskUuid = requireArg(args[1], 'task UUID');

  return { epicUuid, taskUuid };
};

const handleRemoveTask: CommandHandler = (args, context) =>
  withBoard(context, async (board) => {
    const mutableBoard = board as unknown as Board;
    const taskArgs = parseRemoveTaskArgs(args);

    const result = removeSubtaskFromEpic(mutableBoard, taskArgs.epicUuid, taskArgs.taskUuid);

    if (!result.success) {
      throw new CommandUsageError(result.reason || 'Failed to remove task from epic');
    }

    const epic = findTaskById(mutableBoard, taskArgs.epicUuid);
    const task = findTaskById(mutableBoard, taskArgs.taskUuid);

    console.log(`✅ Removed task "${task?.title}" from epic "${epic?.title}"`);
    console.log(`   Epic UUID: ${taskArgs.epicUuid.slice(0, 8)}...`);
    console.log(`   Task UUID: ${taskArgs.taskUuid.slice(0, 8)}...`);

    return { success: true, epic, task };
  });

const handleListEpics: CommandHandler = (_, context) =>
  withBoard(context, async (board) => {
    const mutableBoard = board as unknown as Board;
    const epics = getAllEpics(mutableBoard);

    if (epics.length === 0) {
      console.log('No epics found.');
      return { epics: [] };
    }

    console.log(`Found ${epics.length} epic(s):`);
    console.log('');

    for (const epic of epics) {
      const subtasks = getEpicSubtasks(mutableBoard, epic);
      console.log(`📋 ${epic.title}`);
      console.log(`   UUID: ${epic.uuid}`);
      console.log(`   Status: ${epic.status} (Epic: ${epic.epicStatus})`);
      console.log(`   Subtasks: ${subtasks.length}`);
      if (subtasks.length > 0) {
        console.log(`   Subtask breakdown:`);
        const statusCounts = subtasks.reduce(
          (acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );
        Object.entries(statusCounts).forEach(([status, count]) => {
          console.log(`     ${status}: ${count}`);
        });
      }
      console.log('');
    }

    return { epics };
  });

const handleEpicStatus: CommandHandler = (args, context) =>
  withBoard(context, async (board) => {
    if (args.length === 0) {
      throw new CommandUsageError('epic-status requires an epic UUID');
    }

    const mutableBoard = board as unknown as Board;
    const epicUuid = requireArg(args[0], 'epic UUID');
    const epic = findTaskById(mutableBoard, epicUuid);

    if (!epic) {
      throw new CommandUsageError(`Epic with UUID ${epicUuid} not found`);
    }

    if (!isEpic(epic)) {
      throw new CommandUsageError(`Task ${epicUuid} is not an epic`);
    }

    const subtasks = getEpicSubtasks(mutableBoard, epic);

    console.log(`📋 Epic: ${epic.title}`);
    console.log(`   UUID: ${epic.uuid}`);
    console.log(`   Status: ${epic.status} (Epic: ${epic.epicStatus})`);
    console.log(`   Subtasks: ${subtasks.length}`);
    console.log('');

    if (subtasks.length > 0) {
      console.log('Subtasks:');
      for (const subtask of subtasks) {
        console.log(`   • ${subtask.title}`);
        console.log(`     UUID: ${subtask.uuid}`);
        console.log(`     Status: ${subtask.status}`);
        console.log('');
      }
    } else {
      console.log('No subtasks found for this epic.');
    }

    return { epic, subtasks };
  });

const handleInit: CommandHandler = async (args, _context) => {
  // Check both args and raw process.argv for --config flag
  const rawConfigArg = process.argv.find((arg) => arg.startsWith('--config='));
  const configPath =
    rawConfigArg?.slice(9) ||
    args.find((arg) => arg.startsWith('--config='))?.slice(9) ||
    'promethean.kanban.json';
  const force = args.includes('--force') || args.includes('-f');

  // Check if config already exists
  try {
    await readFile(configPath, 'utf8');
    if (!force) {
      console.log(`❌ Configuration file "${configPath}" already exists.`);
      console.log('   Use --force to overwrite existing configuration.');
      return { created: false, reason: 'exists' };
    }
  } catch {
    // File doesn't exist, which is what we want
  }

  // Simple starter configuration
  const simpleConfig = {
    _comment: 'Promethean Kanban Configuration - Simple starter config',
    _description: 'Basic kanban configuration for new projects. Customize as needed.',
    _usage: "Use 'kanban regenerate' to create the board from tasks.",

    tasksDir: 'docs/agile/tasks',
    indexFile: '',
    boardFile: 'docs/agile/boards/generated.md',
    cachePath: 'docs/agile/boards/.cache',
    exts: ['.md'],

    requiredFields: ['title', 'status', 'priority'],

    statusValues: ['incoming', 'ready', 'todo', 'in_progress', 'review', 'done'],

    priorityValues: ['P0', 'P1', 'P2', 'P3'],

    wipLimits: {
      incoming: 999,
      ready: 10,
      todo: 5,
      in_progress: 3,
      review: 3,
      done: 999,
    },

    _starter_tasks: [
      {
        title: 'Set up development environment',
        status: 'todo',
        priority: 'P0',
        content: 'Install dependencies, configure IDE, set up git hooks',
      },
      {
        title: 'Create project documentation',
        status: 'incoming',
        priority: 'P1',
        content: 'Add README, setup instructions, and project overview',
      },
      {
        title: 'Implement core feature',
        status: 'incoming',
        priority: 'P2',
        content: 'Build the main functionality for the project',
      },
    ],
  };

  try {
    // Ensure directory exists
    const configDir = path.dirname(configPath);
    await mkdir(configDir, { recursive: true });

    // Write configuration file
    await writeFile(configPath, JSON.stringify(simpleConfig, null, 2), 'utf8');

    console.log(`✅ Created kanban configuration: ${configPath}`);
    console.log('');
    console.log('📋 Next steps:');
    console.log(`   1. Create tasks directory: mkdir -p ${simpleConfig.tasksDir}`);
    console.log(`   2. Add some task files to ${simpleConfig.tasksDir}/`);
    console.log(`   3. Generate board: kanban regenerate`);
    console.log('');
    console.log('💡 Example task file format:');
    console.log('---');
    console.log('title: "My Task"');
    console.log('status: "todo"');
    console.log('priority: "P1"');
    console.log('---');
    console.log('');
    console.log('Task description goes here...');

    return { created: true, path: configPath };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`❌ Failed to create configuration: ${message}`);
    return { created: false, reason: message };
  }
};

/**
 * Handle heal command for kanban board healing operations
 */
const handleHeal: CommandHandler = (args, context) =>
  withBoard(context, async () => {
    const { createHealCommand } = await import('../lib/heal/heal-command.js');

    if (args.length === 0) {
      throw new CommandUsageError('heal command requires a reason for healing operation');
    }

    const reason = args.join(' ');
    const healCommand = createHealCommand(context.boardFile, context.tasksDir);
    const argv = context.argv || [];

    // Parse command line options
    const options = {
      reason,
      dryRun: argv.includes('--dry-run'),
      createTags: !argv.includes('--no-tags'),
      pushTags: argv.includes('--push-tags'),
      analyzeGit: !argv.includes('--no-git'),
      gitHistoryDepth: parseArgValue(argv, '--git-depth', 50),
      searchTerms: parseArgValues(argv, '--search'),
      columnFilter: parseArgValues(argv, '--column'),
      labelFilter: parseArgValues(argv, '--label'),
      includeTaskAnalysis: !argv.includes('--no-task-analysis'),
      includePerformanceMetrics: !argv.includes('--no-metrics'),
    };

    console.log(`🏥 Starting kanban healing operation...`);
    console.log(`   Reason: ${reason}`);
    console.log(`   Dry run: ${options.dryRun ? 'Yes' : 'No'}`);
    console.log(`   Create tags: ${options.createTags ? 'Yes' : 'No'}`);
    console.log('');

    if (argv.includes('--recommendations')) {
      // Show healing recommendations
      const recommendations = await healCommand.getHealingRecommendations(options);

      console.log('🔍 Healing Recommendations:');
      if (recommendations.recommendations.length > 0) {
        recommendations.recommendations.forEach((rec) => {
          console.log(`   • ${rec}`);
        });
      } else {
        console.log('   No specific recommendations at this time.');
      }

      if (recommendations.criticalIssues.length > 0) {
        console.log('');
        console.log('⚠️  Critical Issues:');
        recommendations.criticalIssues.forEach((issue) => {
          const icon =
            issue.severity === 'critical'
              ? '🚨'
              : issue.severity === 'high'
                ? '⚠️'
                : issue.severity === 'medium'
                  ? '⚡'
                  : 'ℹ️';
          console.log(`   ${icon} ${issue.description}`);
          console.log(`      Suggested action: ${issue.suggestedAction}`);
        });
      }

      if (recommendations.relatedScars.length > 0) {
        console.log('');
        console.log('📚 Related Healing Operations:');
        recommendations.relatedScars.forEach((scar) => {
          console.log(`   • ${scar.scar.tag} (relevance: ${Math.round(scar.relevance * 100)}%)`);
          console.log(`     ${scar.reason}`);
        });
      }

      return { recommendations };
    }

    if (context.argv.includes('--analyze-history')) {
      // Show scar history analysis
      const analysis = await healCommand.getScarHistoryAnalysis();

      console.log('📈 Scar History Analysis:');
      console.log(`   Total healing operations: ${analysis.totalScars}`);
      console.log(`   Success rate: ${analysis.successRate.toFixed(1)}%`);

      if (analysis.averageHealingTime) {
        console.log(`   Average healing time: ${analysis.averageHealingTime.toFixed(1)} hours`);
      }

      if (analysis.commonReasons.length > 0) {
        console.log('');
        console.log('🔝 Most Common Healing Reasons:');
        analysis.commonReasons.slice(0, 5).forEach((reason) => {
          console.log(
            `   ${reason.reason}: ${reason.count} times (${reason.percentage.toFixed(1)}%)`,
          );
        });
      }

      if (analysis.frequentlyHealedFiles.length > 0) {
        console.log('');
        console.log('📁 Frequently Healed Files:');
        analysis.frequentlyHealedFiles.slice(0, 10).forEach((file) => {
          console.log(`   ${file.file}: ${file.count} times`);
        });
      }

      return { analysis };
    }

    // Execute the healing operation
    const result = await healCommand.execute(options);

    console.log('');
    console.log('🏥 Healing Operation Results:');
    console.log(`   Status: ${result.status}`);
    console.log(`   Summary: ${result.summary}`);
    console.log(`   Tasks modified: ${result.tasksModified}`);
    console.log(`   Files changed: ${result.filesChanged}`);

    if (result.contextBuildTime) {
      console.log(`   Context build time: ${result.contextBuildTime}ms`);
    }

    if (result.healingTime) {
      console.log(`   Healing time: ${result.healingTime}ms`);
    }

    if (result.totalTime) {
      console.log(`   Total time: ${result.totalTime}ms`);
    }

    if (result.scar) {
      console.log('');
      console.log('🏷️  Scar Record Created:');
      console.log(`   Tag: ${result.scar.tag}`);
      console.log(
        `   Range: ${result.scar.startSha.substring(0, 8)}..${result.scar.endSha.substring(0, 8)}`,
      );
    }

    if (result.tagResult) {
      console.log('');
      console.log('🏷️  Git Tag:');
      if (result.tagResult.success) {
        console.log(`   Created: ${result.tagResult.tag}`);
      } else {
        console.log(`   Failed: ${result.tagResult.error}`);
      }
    }

    if (result.errors.length > 0) {
      console.log('');
      console.log('❌ Errors:');
      result.errors.forEach((error) => {
        console.log(`   • ${error}`);
      });
    }

    return result;
  });

/**
 * Parse a single argument value (e.g., --depth 50)
 */
function parseArgValue(argv: ReadonlyArray<string>, flag: string, defaultValue: any): any {
  const index = argv.indexOf(flag);
  if (index === -1 || index === argv.length - 1) {
    return defaultValue;
  }

  const value = argv[index + 1];
  if (!value) {
    return defaultValue;
  }

  // Try to parse as number
  const numValue = parseInt(value, 10);
  if (!isNaN(numValue)) {
    return numValue;
  }

  // Return as string
  return value;
}

/**
 * Parse multiple argument values (e.g., --search term1 --search term2)
 */
function parseArgValues(argv: ReadonlyArray<string>, flag: string): string[] {
  const values: string[] = [];
  let index = argv.indexOf(flag);

  while (index !== -1 && index < argv.length - 1) {
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      break; // Next flag encountered
    }
    values.push(value);
    index = argv.indexOf(flag, index + 1);
  }

  return values;
}
export const COMMAND_HANDLERS: Readonly<Record<string, CommandHandler>> = Object.freeze({
  heal: handleHeal,
  count: handleCount,
  getColumn: handleGetColumn,
  getByColumn: handleGetByColumn,
  find: handleFind,
  'find-by-title': handleFindByTitle,
  update_status: handleUpdateStatus,
  'update-status': handleUpdateStatus,
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
  dev: handleDev,
  process: handleProcess,
  'show-process': handleShowProcess,
  'show-transitions': handleShowTransitions,
  'compare-tasks': handleCompareTasks,
  'breakdown-task': handleBreakdownTask,
  'prioritize-tasks': handlePrioritizeTasks,
  list: handleList,
  audit: handleAudit,
  'enforce-wip-limits': handleEnforceWipLimits,
  'wip-monitor': handleWipMonitor,
  'wip-compliance': handleWipCompliance,
  'wip-violations': handleWipViolations,
  'wip-suggestions': handleWipSuggestions,
  'commit-stats': handleCommitStats,
  // CRUD commands
  create: handleCreate,
  update: handleUpdate,
  delete: handleDelete,
  // Epic commands
  'create-epic': handleCreateEpic,
  'add-task': handleAddTask,
  'remove-task': handleRemoveTask,
  'list-epics': handleListEpics,
  'epic-status': handleEpicStatus,
  // Setup commands
  init: handleInit,
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
