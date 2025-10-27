/**
 * Rebuild Event Log Command
 *
 * Command to reconstruct kanban event log from git history
 */

import type { CommandHandler } from '../cli/command-handlers.js';
import type { KanbanConfig } from '../board/config/shared.js';
import { loadKanbanConfig } from '../board/config.js';
import { makeEventLogManager } from '../board/event-log/index.js';
import { makeGitEventReconstructor } from './git-event-reconstructor.js';

export interface RebuildEventLogOptions {
  since?: string;
  taskUuid?: string;
  dryRun?: boolean;
  force?: boolean;
  verbose?: boolean;
}

/**
 * Create a rebuild event log command
 */
export const createRebuildEventLogCommand = (boardFile: string, tasksDir: string) => {
  const execute: CommandHandler = async (args) => {
    const configResult = await loadKanbanConfig({
      argv: process.argv,
      env: process.env,
    });

    const options = parseOptions(args);

    console.log('🔄 Rebuilding Kanban Event Log from Git History');
    console.log('');

    if (options.dryRun) {
      console.log('🔍 DRY RUN MODE - No changes will be made');
      console.log('');
    }

    // Initialize event log manager
    const eventLogManager = makeEventLogManager(configResult.config);

    // Initialize git event reconstructor
    const gitReconstructor = makeGitEventReconstructor(configResult.config, {
      repoRoot: process.cwd(),
      since: options.since,
      taskUuidFilter: options.taskUuid,
    });

    // Check if event log already exists
    const existingStats = await eventLogManager.getLogStats();
    if (existingStats.totalEvents > 0 && !options.force) {
      console.log(`⚠️  Event log already contains ${existingStats.totalEvents} events`);
      console.log('   Use --force to overwrite existing events');
      console.log('');
      return {
        success: false,
        reason: 'Event log not empty - use --force to overwrite',
        existingEvents: existingStats.totalEvents,
      };
    }

    // Reconstruct events from git history
    const reconstructedEvents = gitReconstructor.reconstructEvents({
      taskUuidFilter: options.taskUuid,
      verbose: options.verbose,
    });

    if (reconstructedEvents.length === 0) {
      console.log('ℹ️  No status transitions found in git history');
      return { success: true, eventsFound: 0 };
    }

    // Get reconstruction statistics
    const stats = gitReconstructor.getReconstructionStats(reconstructedEvents);

    console.log('📊 Reconstruction Results:');
    console.log(`   Total events: ${stats.totalEvents}`);
    console.log(`   Unique tasks: ${stats.uniqueTasks}`);
    console.log(
      `   Date range: ${stats.dateRange.earliest ? new Date(stats.dateRange.earliest).toLocaleDateString() : 'N/A'} to ${stats.dateRange.latest ? new Date(stats.dateRange.latest).toLocaleDateString() : 'N/A'}`,
    );
    console.log('');

    // Show transition types
    if (Object.keys(stats.transitionTypes).length > 0) {
      console.log('🔄 Transition Types:');
      const sortedTransitions = Object.entries(stats.transitionTypes)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10); // Top 10

      for (const [transition, count] of sortedTransitions) {
        console.log(`   ${transition}: ${count}`);
      }
      console.log('');
    }

    if (options.dryRun) {
      console.log('🔍 DRY RUN - Would write these events to event log');
      console.log(`   Run without --dry-run to actually write events`);
      return {
        success: true,
        dryRun: true,
        eventsFound: stats.totalEvents,
        events: reconstructedEvents,
      };
    }

    // Write events to event log
    if (!options.force && existingStats.totalEvents > 0) {
      console.log('🗑️  Clearing existing event log...');
      await eventLogManager.clearLog();
    }

    console.log('📝 Writing events to event log...');
    let writtenCount = 0;

    for (const event of reconstructedEvents) {
      try {
        await eventLogManager.logTransition(event.taskId, event.fromStatus, event.toStatus, {
          actor: event.actor,
          reason: event.reason,
          metadata: event.metadata,
        });
        writtenCount++;
      } catch (error) {
        console.warn(`⚠️  Failed to write event for task ${event.taskId}: ${error}`);
      }
    }

    // Verify results
    const finalStats = await eventLogManager.getLogStats();

    console.log('');
    console.log('✅ Event Log Rebuild Complete');
    console.log(`   Events written: ${writtenCount}`);
    console.log(`   Total events in log: ${finalStats.totalEvents}`);
    console.log(`   Unique tasks: ${finalStats.uniqueTasks}`);

    if (writtenCount < reconstructedEvents.length) {
      const failed = reconstructedEvents.length - writtenCount;
      console.log(`   ⚠️  ${failed} events failed to write`);
    }

    return {
      success: true,
      eventsWritten: writtenCount,
      eventsTotal: finalStats.totalEvents,
      uniqueTasks: finalStats.uniqueTasks,
    };
  };

  return { execute };
};

/**
 * Parse command line options
 */
function parseOptions(args: readonly string[]): RebuildEventLogOptions {
  const options: RebuildEventLogOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--since=')) {
      options.since = arg.slice(8);
    } else if (arg === '--since' && i + 1 < args.length) {
      options.since = args[i + 1];
      i++; // Skip next arg
    } else if (arg.startsWith('--task-uuid=')) {
      options.taskUuid = arg.slice(13);
    } else if (arg === '--task-uuid' && i + 1 < args.length) {
      options.taskUuid = args[i + 1];
      i++; // Skip next arg
    } else if (arg === '--dry-run' || arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--force' || arg === '-f') {
      options.force = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    }
  }

  return options;
}
