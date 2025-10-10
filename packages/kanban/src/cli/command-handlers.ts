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
} from '../lib/kanban.js';
import type { Board } from '../lib/types.js';
import { EventLogManager } from '../board/event-log.js';
import { loadKanbanConfig } from '../board/config.js';
import { serveKanbanUI } from '../lib/ui-server.js';
import { compareTasks, suggestTaskBreakdown, prioritizeTasks } from '../lib/task-tools.js';
import { KanbanDevServer } from '../lib/dev-server.js';

const columnKey = (name: string): string => name.toLowerCase().replace(/[\s_-]/g, '');
import { TransitionRulesEngine, createTransitionRulesEngine } from '../lib/transition-rules.js';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

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
      eventLogManager = new EventLogManager(configResult.config);
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

    return { violations: totalViolations };
  });

const handleAudit: CommandHandler = (args, context) =>
  withBoard(context, async (board) => {
    const configResult = await loadKanbanConfig({
      argv: process.argv,
      env: process.env,
    });

    const eventLogManager = new EventLogManager(configResult.config);
    const dryRun = !args.includes('--fix');
    const columnFilter = args.find((arg) => arg.startsWith('--column='))?.split('=')[1];

    console.log(`🔍 Kanban Audit ${dryRun ? '(DRY RUN)' : '(FIX MODE)'}`);
    if (columnFilter) {
      console.log(`📋 Filtering by column: ${columnFilter}`);
    }
    console.log('');

    // Get all task histories from event log
    const allHistories = await eventLogManager.getAllTaskHistories();
    const allEvents = await eventLogManager.readEventLog();

    let inconsistenciesFound = 0;
    let inconsistenciesFixed = 0;
    let illegalTransitionsFound = 0;

    console.log('🔍 Analyzing task state consistency...');
    console.log('');

    // Check each task in the board against its event log
    for (const column of board.columns) {
      if (columnFilter && columnKey(column.name) !== columnKey(columnFilter)) {
        continue;
      }

      for (const task of column.tasks) {
        const replayResult = await eventLogManager.replayTaskTransitions(task.uuid, task.status);

        // Check if current status matches replayed status
        if (replayResult.finalStatus !== task.status) {
          inconsistenciesFound++;
          console.log(`❌ INCONSISTENCY: Task "${task.title}"`);
          console.log(`   Current status: ${task.status}`);
          console.log(`   Expected status: ${replayResult.finalStatus}`);
          console.log(`   Task ID: ${task.uuid}`);

          if (replayResult.invalidEvent) {
            console.log(
              `   🚨 ILLEGAL TRANSITION: ${replayResult.invalidEvent.fromStatus} → ${replayResult.invalidEvent.toStatus}`,
            );
            console.log(`   Event ID: ${replayResult.invalidEvent.id}`);
            console.log(`   Timestamp: ${replayResult.invalidEvent.timestamp}`);
            illegalTransitionsFound++;
          }

          if (!dryRun && replayResult.lastValidEvent) {
            try {
              // Fix the task status
              await updateStatus(
                board as Board,
                task.uuid,
                replayResult.finalStatus,
                context.boardFile,
                context.tasksDir,
                undefined,
                `Audit correction: Reset to last valid state from event log`,
                eventLogManager,
                'system',
              );
              inconsistenciesFixed++;
              console.log(`   ✅ FIXED: Status reset to ${replayResult.finalStatus}`);
            } catch (error) {
              console.log(`   ❌ FAILED TO FIX: ${error}`);
            }
          }
          console.log('');
        }
      }
    }

    // Check for tasks that exist in event log but not in board
    const boardTaskIds = new Set();
    for (const column of board.columns) {
      for (const task of column.tasks) {
        boardTaskIds.add(task.uuid);
      }
    }

    for (const [taskId, events] of allHistories) {
      if (!boardTaskIds.has(taskId) && events.length > 0) {
        console.log(
          `⚠️  ORPHANED EVENTS: Task ${taskId} has ${events.length} events but not found in board`,
        );
        const lastEvent = events[events.length - 1];
        if (lastEvent) {
          console.log(`   Last event: ${lastEvent.toStatus} at ${lastEvent.timestamp}`);
        }
        console.log('');
      }
    }

    // Summary
    console.log('📊 AUDIT SUMMARY:');
    console.log(
      `   Total tasks analyzed: ${board.columns.reduce((sum, col) => sum + col.tasks.length, 0)}`,
    );
    console.log(`   Total events in log: ${allEvents.length}`);
    console.log(`   Inconsistencies found: ${inconsistenciesFound}`);
    console.log(`   Illegal transitions: ${illegalTransitionsFound}`);

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

    return {
      inconsistenciesFound,
      inconsistenciesFixed,
      illegalTransitionsFound,
      dryRun,
    };
  });

const handleEnforceWipLimits: CommandHandler = (args, context) =>
  withBoard(context, async (board) => {
    const configResult = await loadKanbanConfig({
      argv: process.argv,
      env: process.env,
    });

    const eventLogManager = new EventLogManager(configResult.config);
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
      result.labels = labelsStr.split(',').map(l => l.trim()).filter(l => l.length > 0);
    } else if (arg === '--labels' && i + 1 < args.length && args[i + 1]) {
      const labelsStr = args[i + 1];
      if (labelsStr) {
        result.labels = labelsStr.split(',').map(l => l.trim()).filter(l => l.length > 0);
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

export const COMMAND_HANDLERS: Readonly<Record<string, CommandHandler>> = Object.freeze({
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
  // CRUD commands
  create: handleCreate,
  update: handleUpdate,
  delete: handleDelete,
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
