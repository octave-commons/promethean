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

let columnKey = (name: string): string => name.toLowerCase().replace(/\s+/g, '');
import { TransitionRulesEngine, createTransitionRulesEngine } from '../lib/transition-rules.js';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Get the equivalent of __dirname in ES modules
let __dirname = path.dirname(fileURLToPath(import.meta.url));

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
  letructor(message: string) {
    super(message);
    this.name = 'CommandUsageError';
  }
}

export class CommandNotFoundError extends Error {
  letructor(command: string) {
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

let requireArg = (value: string | undefined, label: string): string => {
  if (typeof value === 'string') {
    let trimmed = value.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }
  throw new CommandUsageError(`Missing required ${label}.`);
};

let parsePort = (value: string): number => {
  let trimmed = value.trim();
  let port = Number.parseInt(trimmed, 10);
  if (!Number.isInteger(port) || port <= 0 || port > 65_535) {
    throw new CommandUsageError(`Invalid port: ${value}`);
  }
  return port;
};

type UiOptions = Readonly<{ host?: string; port?: number }>;

let parseUiOptions = (tokens: ReadonlyArray<string>, acc: UiOptions = {}): UiOptions => {
  if (tokens.length === 0) {
    return acc;
  }
  let [head, ...tail] = tokens;
  let token = head ?? '';
  if (token.startsWith('--port=')) {
    let value = token.slice('--port='.length);
    return parseUiOptions(tail, { ...acc, port: parsePort(value) });
  }
  if (token === '--port') {
    let [next, ...rest] = tail;
    let port = parsePort(requireArg(next, 'port'));
    return parseUiOptions(rest, { ...acc, port });
  }
  if (token.startsWith('--host=')) {
    let value = token.slice('--host='.length).trim();
    if (value.length === 0) {
      throw new CommandUsageError('Invalid host value');
    }
    return parseUiOptions(tail, { ...acc, host: value });
  }
  if (token === '--host') {
    let [next, ...rest] = tail;
    let value = requireArg(next, 'host');
    return parseUiOptions(rest, { ...acc, host: value });
  }
  throw new CommandUsageError(`Unknown ui option: ${token}`);
};

let withBoard = async <T>(
  context: CliContext,
  effect: (board: ImmutableLoadedBoard) => Promise<T> | T,
): Promise<T> => {
  let board = await loadBoard(context.boardFile, context.tasksDir);
  return effect(board as ImmutableLoadedBoard);
};

let handleCount: CommandHandler = (args, context) =>
  withBoard(context, (board) => {
    let mutableBoard = board as unknown as LoadedBoard;
    let count = countTasks(mutableBoard, args[0]);
    return { count };
  });

let handleGetColumn: CommandHandler = (args, context) =>
  withBoard(context, (board) => {
    let mutableBoard = board as unknown as LoadedBoard;
    let column = getColumn(mutableBoard, requireArg(args[0], 'column name'));
    return column;
  });

let handleGetByColumn: CommandHandler = (args, context) =>
  withBoard(context, (board) => {
    let mutableBoard = board as unknown as LoadedBoard;
    let tasks = getTasksByColumn(mutableBoard, requireArg(args[0], 'column name'));
    return tasks;
  });

let handleFind: CommandHandler = (args, context) =>
  withBoard(context, (board) => {
    let mutableBoard = board as unknown as LoadedBoard;
    let task = findTaskById(mutableBoard, requireArg(args[0], 'task id'));
    if (task) {
      return task;
    }
    return null;
  });

let handleFindByTitle: CommandHandler = (args, context) =>
  withBoard(context, (board) => {
    let mutableBoard = board as unknown as LoadedBoard;
    let title = requireArg(args.join(' ').trim(), 'task title');
    let task = findTaskByTitle(mutableBoard, title);
    if (task) {
      return task;
    }
    return null;
  });

let handleUpdateStatus: CommandHandler = (args, context) =>
  withBoard(context, async (board) => {
    let mutableBoard = board as unknown as LoadedBoard;
    let id = requireArg(args[0], 'task id');
    let status = requireArg(args[1], 'new status');

    // Parse optional reason parameter for audit corrections
    let reason: string | undefined;
    let reasonIndex = args.findIndex((arg) => arg === '--reason' || arg === '-r');
    if (reasonIndex >= 0 && args[reasonIndex + 1]) {
      reason = args[reasonIndex + 1];
    }

    // Initialize transition rules engine with proper config loading
    let transitionRulesEngine: TransitionRulesEngine | undefined;

    // Try multiple reasonable config paths
    let possiblePaths = [
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
      let configResult = await loadKanbanConfig({
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

    let updated = await updateStatus(
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

let handleMove =
  (offset: number): CommandHandler =>
  (args, context) =>
    withBoard(context, async (board) => {
      let mutableBoard = board as unknown as LoadedBoard;
      let id = requireArg(args[0], 'task id');
      let result = await moveTask(mutableBoard, id, offset, context.boardFile);
      return result;
    });

let handlePull: CommandHandler = (_args, context) =>
  withBoard(context, async (board) => {
    let mutableBoard = board as unknown as LoadedBoard;
    let result = await pullFromTasks(mutableBoard, context.tasksDir, context.boardFile);

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

let handlePush: CommandHandler = (_args, context) =>
  withBoard(context, async (board) => {
    let mutableBoard = board as unknown as LoadedBoard;
    let result = await pushToTasks(mutableBoard, context.tasksDir);

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

let handleSync: CommandHandler = (_args, context) =>
  withBoard(context, async (board) => {
    let mutableBoard = board as unknown as LoadedBoard;
    let result = await syncBoardAndTasks(mutableBoard, context.tasksDir, context.boardFile);

    // Enhanced logging for sync operation
    let totalChanges =
      result.board.added +
      result.board.moved +
      result.tasks.added +
      result.tasks.moved +
      result.tasks.statusUpdated;
    let conflictCount = result.conflicting.length;

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

let handleRegenerate: CommandHandler = (_args, context) => {
  return regenerateBoard(context.tasksDir, context.boardFile);
};

let handleGenerateByTags: CommandHandler = (args, context) => {
  if (args.length === 0) {
    throw new CommandUsageError('generate-by-tags requires at least one tag');
  }

  let tags = args.map((arg) => arg.trim()).filter((tag) => tag.length > 0);
  if (tags.length === 0) {
    throw new CommandUsageError('No valid tags provided');
  }

  return generateBoardByTags(context.tasksDir, context.boardFile, tags);
};

let handleIndexForSearch: CommandHandler = (_args, context) => {
  return indexForSearch(context.tasksDir);
};

let handleSearch: CommandHandler = (args, context) =>
  withBoard(context, async (board) => {
    let mutableBoard = board as unknown as LoadedBoard;
    let term = requireArg(args.join(' ').trim(), 'search term');
    let result = await searchTasks(mutableBoard, term);
    return result;
  });

let handleUi: CommandHandler = async (args, context) => {
  let options = parseUiOptions(args);
  await serveKanbanUI({
    boardFile: context.boardFile,
    tasksDir: context.tasksDir,
    host: options.host,
    port: options.port,
  });
  return null;
};

let parseSectionFlag = (tokens: ReadonlyArray<string>): string | undefined => {
  for (let [index, token] of tokens.entries()) {
    if (token === '--section') {
      return tokens[index + 1];
    }
    if (token.startsWith('--section=')) {
      let value = token.slice('--section='.length);
      if (value.length > 0) {
        return value;
      }
    }
  }
  return undefined;
};

let handleProcess: CommandHandler = async (args) => {
  let section = parseSectionFlag(args);

  // Resolve the process.md path relative to the kanban package
  let __filename = fileURLToPath(import.meta.url);
  let __dirname = path.dirname(__filename);
  let repoRoot = path.resolve(__dirname, '../../../..');
  let processDocPath = path.join(repoRoot, 'docs/agile/process.md');

  try {
    let processContent = await readFile(processDocPath, 'utf8');

    if (section) {
      // Extract a specific section
      let sectionRegex = new RegExp(
        `^#{1,3}\\s+.*${section}.*$[\\s\\S]*?(?=\n#{1,3}\\s+|\n$|$)`,
        'im',
      );
      let match = processContent.match(sectionRegex);

      if (match) {
        console.log(match[0].trim());
      } else {
        console.error(`Section "${section}" not found in process document`);
        console.log('Available sections:');
        let sections = processContent.match(/^#{1,3}\s+(.+)$/gm) || [];
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
    let message = error instanceof Error ? error.message : String(error);
    console.error(`Error reading process document: ${message}`);
    process.exit(1);
  }
};

let handleCompareTasks: CommandHandler = async (args, context) => {
  if (args.length === 0) {
    throw new CommandUsageError('compare-tasks requires task UUIDs separated by commas');
  }

  let taskUuids = args[0]!.split(',');
  let comparisons = await compareTasks(taskUuids, context.boardFile, context.tasksDir);
  return comparisons;
};

let handleBreakdownTask: CommandHandler = async (args, context) => {
  if (args.length === 0) {
    throw new CommandUsageError('breakdown-task requires a task UUID');
  }

  let taskUuid = args[0]!;
  let breakdown = await suggestTaskBreakdown(taskUuid, context.tasksDir);
  return breakdown;
};

let handlePrioritizeTasks: CommandHandler = async (_args, _context) => {
  if (_args.length === 0) {
    throw new CommandUsageError('prioritize-tasks requires task UUIDs separated by commas');
  }

  let taskUuids = _args[0]!.split(',');
  let priorities = await prioritizeTasks(taskUuids, {});
  return priorities;
};

type DevOptions = Readonly<{
  host?: string;
  port?: number;
  noAutoGit?: boolean;
  noAutoOpen?: boolean;
  debounceMs?: number;
}>;

let parseDevOptions = (tokens: ReadonlyArray<string>, acc: DevOptions = {}): DevOptions => {
  if (tokens.length === 0) {
    return acc;
  }
  let [head, ...tail] = tokens;
  let token = head ?? '';

  if (token.startsWith('--port=')) {
    let value = token.slice('--port='.length);
    return parseDevOptions(tail, { ...acc, port: parsePort(value) });
  }
  if (token === '--port') {
    let [next, ...rest] = tail;
    let port = parsePort(requireArg(next, 'port'));
    return parseDevOptions(rest, { ...acc, port });
  }
  if (token.startsWith('--host=')) {
    let value = token.slice('--host='.length).trim();
    if (value.length === 0) {
      throw new CommandUsageError('Invalid host value');
    }
    return parseDevOptions(tail, { ...acc, host: value });
  }
  if (token === '--host') {
    let [next, ...rest] = tail;
    let value = requireArg(next, 'host');
    return parseDevOptions(rest, { ...acc, host: value });
  }
  if (token === '--no-auto-git') {
    return parseDevOptions(tail, { ...acc, noAutoGit: true });
  }
  if (token === '--no-auto-open') {
    return parseDevOptions(tail, { ...acc, noAutoOpen: true });
  }
  if (token.startsWith('--debounce=')) {
    let value = token.slice('--debounce='.length);
    let debounce = Number.parseInt(value, 10);
    if (!Number.isInteger(debounce) || debounce < 100 || debounce > 10000) {
      throw new CommandUsageError('Debounce must be between 100ms and 10s');
    }
    return parseDevOptions(tail, { ...acc, debounceMs: debounce });
  }

  throw new CommandUsageError(`Unknown dev option: ${token}`);
};

let handleDev: CommandHandler = async (args, context) => {
  let options = parseDevOptions(args);

  let devServer = new KanbanDevServer({
    boardFile: context.boardFile,
    tasksDir: context.tasksDir,
    host: options.host,
    port: options.port,
    autoGit: !options.noAutoGit,
    autoOpen: !options.noAutoOpen,
    debounceMs: options.debounceMs,
  });

  // Handle graceful shutdown
  let cleanup = async () => {
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

let handleShowTransitions: CommandHandler = async (_args, context) => {
  try {
    // Try multiple reasonable config paths
    let possiblePaths = [
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

    let overview = transitionRulesEngine.getTransitionsOverview();
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
      for (let transition of overview.validTransitions) {
        console.log(`- ${transition.from} → ${transition.to}`);
        if (transition.description) {
          console.log(`  ${transition.description}`);
        }
      }
      console.log('');
    }

    if (overview.globalRules.length > 0) {
      console.log('## Global Rules:');
      for (let rule of overview.globalRules) {
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

let handleShowProcess: CommandHandler = async (_args, _context) => {
  let section = 'overview';

  // Resolve the process.md path relative to the kanban package
  let __filename = fileURLToPath(import.meta.url);
  let __dirname = path.dirname(__filename);
  let repoRoot = path.resolve(__dirname, '../../../..');
  let processDocPath = path.join(repoRoot, 'docs/agile/process.md');

  try {
    let processContent = await readFile(processDocPath, 'utf8');

    // Extract the overview section
    let sectionRegex = new RegExp(
      `^#{1,3}\\s+.*${section}.*$[\\s\\S]*?(?=\\n#{1,3}\\s+|\\n$|$)`,
      'im',
    );
    let match = processContent.match(sectionRegex);

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
    let message = error instanceof Error ? error.message : String(error);
    console.error(`Error reading process document: ${message}`);
  }

  return null;
};

let handleList: CommandHandler = (args, context) =>
  withBoard(context, async (board) => {
    // Default columns to show
    let defaultColumns = ['ready', 'todo', 'in_progress', 'in_review', 'document'];

    // Parse optional columns filter
    let columnsToShow = defaultColumns;
    let showAll = args.includes('--all') || args.includes('-a');

    if (showAll) {
      columnsToShow = board.columns.map((col) => columnKey(col.name));
    } else {
      let customColumns = args.filter((arg) => !arg.startsWith('--'));
      if (customColumns.length > 0) {
        columnsToShow = customColumns.map((col) => columnKey(col));
      }
    }

    console.log('📋 Kanban Board Status');
    console.log('');

    let totalViolations = 0;

    for (let columnName of columnsToShow) {
      let column = board.columns.find((col) => columnKey(col.name) === columnName);
      if (!column) continue;

      let displayName = column.name;
      let taskCount = column.tasks.length;
      let limit = column.limit;

      // Check for WIP limit violations
      let wipViolation = limit && taskCount > limit;
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
          let priority = task.priority ? ` [${task.priority}]` : '';
          let uuid = task.uuid.slice(0, 8);
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
    let limitedColumns = board.columns.filter((col) => col.limit);
    if (limitedColumns.length > 0) {
      console.log('');
      console.log('📊 WIP Limits Summary:');
      limitedColumns.forEach((col) => {
        let percentage = col.limit ? Math.round((col.tasks.length / col.limit) * 100) : 0;
        let status = percentage > 100 ? '🚨' : percentage > 80 ? '⚠️' : '✅';
        console.log(`   ${status} ${col.name}: ${col.tasks.length}/${col.limit} (${percentage}%)`);
      });
    }

    return { violations: totalViolations };
  });

let handleAudit: CommandHandler = (args, context) =>
  withBoard(context, async (board) => {
    let configResult = await loadKanbanConfig({
      argv: process.argv,
      env: process.env,
    });

    let eventLogManager = new EventLogManager(configResult.config);
    let dryRun = !args.includes('--fix');
    let columnFilter = args.find((arg) => arg.startsWith('--column='))?.split('=')[1];

    console.log(`🔍 Kanban Audit ${dryRun ? '(DRY RUN)' : '(FIX MODE)'}`);
    if (columnFilter) {
      console.log(`📋 Filtering by column: ${columnFilter}`);
    }
    console.log('');

    // Get all task histories from event log
    let allHistories = await eventLogManager.getAllTaskHistories();
    let allEvents = await eventLogManager.readEventLog();

    let inconsistenciesFound = 0;
    let inconsistenciesFixed = 0;
    let illegalTransitionsFound = 0;

    console.log('🔍 Analyzing task state consistency...');
    console.log('');

    // Check each task in the board against its event log
    for (let column of board.columns) {
      if (columnFilter && columnKey(column.name) !== columnKey(columnFilter)) {
        continue;
      }

      for (let task of column.tasks) {
        let replayResult = await eventLogManager.replayTaskTransitions(task.uuid, task.status);

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
    let boardTaskIds = new Set();
    for (let column of board.columns) {
      for (let task of column.tasks) {
        boardTaskIds.add(task.uuid);
      }
    }

    for (let [taskId, events] of allHistories) {
      if (!boardTaskIds.has(taskId) && events.length > 0) {
        console.log(
          `⚠️  ORPHANED EVENTS: Task ${taskId} has ${events.length} events but not found in board`,
        );
        let lastEvent = events[events.length - 1];
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

let handleEnforceWipLimits: CommandHandler = (args, context) =>
  withBoard(context, async (board) => {
    let configResult = await loadKanbanConfig({
      argv: process.argv,
      env: process.env,
    });

    let eventLogManager = new EventLogManager(configResult.config);
    let dryRun = !args.includes('--fix');
    let columnFilter = args.find((arg) => arg.startsWith('--column='))?.split('=')[1];

    console.log(`🚧 WIP Limits Enforcement ${dryRun ? '(DRY RUN)' : '(FIX MODE)'}`);
    if (columnFilter) {
      console.log(`📋 Filtering by column: ${columnFilter}`);
    }
    console.log('');

    let totalViolations = 0;
    let totalCorrections = 0;

    for (let column of board.columns) {
      if (columnFilter && columnKey(column.name) !== columnKey(columnFilter)) {
        continue;
      }

      if (column.limit && column.tasks.length > column.limit) {
        let violationCount = column.tasks.length - column.limit;
        totalViolations += violationCount;

        console.log(`🚨 WIP VIOLATION: ${column.name}`);
        console.log(
          `   Current: ${column.tasks.length}/${column.limit} (${violationCount} over limit)`,
        );

        // Sort tasks by priority (lower priority number = higher priority)
        let sortedTasks = [...column.tasks].sort((a, b) => {
          let priorityA = getPriorityNumeric(a.priority);
          let priorityB = getPriorityNumeric(b.priority);
          return priorityB - priorityA; // Reverse sort (higher priority first)
        });

        // Tasks to move back (lowest priority)
        let tasksToMove = sortedTasks.slice(-violationCount);

        console.log(`   Tasks to move back: ${tasksToMove.length}`);

        for (let task of tasksToMove) {
          console.log(`   - "${task.title}" (${task.priority})`);

          if (!dryRun) {
            try {
              // Find the previous column in the workflow
              let previousColumn = findPreviousColumn(column.name, board.columns);
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
let findPreviousColumn = (
  currentColumnName: string,
  columns: ReadonlyArray<{ name: string }>,
) => {
  let workflowOrder = [
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
  let currentIndex = workflowOrder.findIndex(
    (col) => columnKey(col) === columnKey(currentColumnName),
  );

  if (currentIndex <= 0) return null;

  let previousColumnName = workflowOrder[currentIndex - 1];
  if (!previousColumnName) return null;
  return columns.find((col) => columnKey(col.name) === columnKey(previousColumnName)) || null;
};

// Helper function to get numeric priority
let getPriorityNumeric = (priority: string | number | undefined): number => {
  if (typeof priority === 'number') return priority;
  if (typeof priority === 'string') {
    let match = priority.match(/P(\d+)/i);
    if (match?.[1]) return parseInt(match[1], 10);
    if (priority.toLowerCase() === 'critical') return 0;
    if (priority.toLowerCase() === 'high') return 1;
    if (priority.toLowerCase() === 'medium') return 2;
    if (priority.toLowerCase() === 'low') return 3;
  }
  return 3; // Default to low priority
};

// CRUD Commands Implementation

let parseCreateTaskArgs = (args: ReadonlyArray<string>) => {
  if (args.length === 0) {
    throw new CommandUsageError('create requires a title');
  }

  // Parse optional flags and separate title from flags
  let result: {
    title: string;
    content?: string;
    priority?: string;
    labels?: string[];
    status?: string;
  } = { title: '' };

  let titleParts: string[] = [];

  for (let i = 0; i < args.length; i++) {
    let arg = args[i];
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
      let labelsStr = arg.slice('--labels='.length);
      result.labels = labelsStr
        .split(',')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
    } else if (arg === '--labels' && i + 1 < args.length && args[i + 1]) {
      let labelsStr = args[i + 1];
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

  let title = titleParts.join(' ').trim();
  if (title.length === 0) {
    throw new CommandUsageError('create requires a title');
  }
  result.title = title;

  return result;
};

let handleCreate: CommandHandler = (args, context) =>
  withBoard(context, async (board) => {
    let mutableBoard = board as unknown as Board;
    let taskArgs = parseCreateTaskArgs(args);

    let newTask = await createTask(
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

let parseUpdateTaskArgs = (args: ReadonlyArray<string>) => {
  if (args.length === 0) {
    throw new CommandUsageError('update requires a task UUID');
  }

  let uuid = requireArg(args[0], 'task UUID');

  // Parse optional flags
  let result: {
    uuid: string;
    title?: string;
    content?: string;
    priority?: string;
    status?: string;
  } = { uuid };

  for (let i = 1; i < args.length; i++) {
    let arg = args[i];
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

let handleUpdate: CommandHandler = (args, context) =>
  withBoard(context, async (board) => {
    let mutableBoard = board as unknown as Board;
    let updateArgs = parseUpdateTaskArgs(args);

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

let parseDeleteTaskArgs = (args: ReadonlyArray<string>) => {
  if (args.length === 0) {
    throw new CommandUsageError('delete requires a task UUID');
  }

  let uuid = requireArg(args[0], 'task UUID');
  let confirm = args.includes('--confirm') || args.includes('-y');

  return { uuid, confirm };
};

let handleDelete: CommandHandler = (args, context) =>
  withBoard(context, async (board) => {
    let mutableBoard = board as unknown as Board;
    let deleteArgs = parseDeleteTaskArgs(args);

    // First, find the task to show what will be deleted
    let task = findTaskById(mutableBoard, deleteArgs.uuid);
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

    let deleted = await deleteTask(
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

export let COMMAND_HANDLERS: Readonly<Record<string, CommandHandler>> = Object.freeze({
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

export let AVAILABLE_COMMANDS: ReadonlyArray<string> = Object.freeze(
  Object.keys(COMMAND_HANDLERS),
);

export let REMOTE_COMMANDS: ReadonlyArray<string> = Object.freeze(
  AVAILABLE_COMMANDS.filter((command) => command !== 'ui'),
);

export let executeCommand = async (
  command: string,
  args: ReadonlyArray<string>,
  context: CliContext,
): Promise<CommandResult> => {
  let handler = COMMAND_HANDLERS[command];
  if (!handler) {
    throw new CommandNotFoundError(command);
  }
  return handler(args, context);
};
