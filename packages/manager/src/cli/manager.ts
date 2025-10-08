#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { Manager } from '../lib/manager';
import { SyncOptions } from '../types';

// Load environment variables
dotenv.config();

const program = new Command();

program
  .name('manager')
  .description('Unified task management across kanban, GitHub, and Trello sources')
  .version('1.0.0');

// Global options
program
  .option('-d, --dry-run', 'Show what would be done without executing')
  .option('-v, --verbose', 'Enable verbose logging')
  .option('--max-tasks <number>', 'Maximum number of tasks to process', '50')
  .option('--sources <names>', 'Comma-separated list of sources to use')
  .option('--targets <names>', 'Comma-separated list of targets to use')
  .option('--deduplication <strategy>', 'Deduplication strategy: exact, normalized, slug-based, fuzzy', 'normalized')
  .option('--config <path>', 'Path to configuration file');

// Pull command - fetch tasks from sources
program
  .command('pull')
  .description('Pull tasks from enabled sources')
  .option('--status <status>', 'Filter by status')
  .option('--label <label>', 'Filter by label')
  .action(async (options) => {
    try {
      const manager = new Manager();
      const syncOptions: Partial<SyncOptions> = {
        dryRun: program.opts().dryRun,
        verbose: program.opts().verbose,
        maxTasks: parseInt(program.opts().maxTasks) || undefined,
        filterByStatus: options.status ? [options.status] : undefined,
        filterByLabel: options.label ? [options.label] : undefined,
        deduplicationStrategy: program.opts().deduplication
      };

      console.log(chalk.blue('🔄 Pulling tasks from sources...'));
      const result = await manager.pull(syncOptions);

      if (result.success) {
        console.log(chalk.green(`\n✅ Successfully pulled ${result.summary.succeededTasks} tasks`));
        console.log(`📊 Total tasks found: ${result.summary.totalTasks}`);
        if (result.summary.failedTasks > 0) {
          console.log(chalk.yellow(`⚠️  ${result.summary.failedTasks} failed`));
        }
      } else {
        console.log(chalk.red('\n❌ Pull operation failed'));
        result.errors.forEach(error => console.log(chalk.red(`   • ${error}`)));
      }
    } catch (error) {
      console.error(chalk.red('❌ Command failed:'), error);
      process.exit(1);
    }
  });

// Push command - push tasks to targets
program
  .command('push')
  .description('Push tasks to enabled targets')
  .option('--status <status>', 'Filter by status')
  .option('--label <label>', 'Filter by label')
  .action(async (options) => {
    try {
      const manager = new Manager();
      const syncOptions: Partial<SyncOptions> = {
        dryRun: program.opts().dryRun,
        verbose: program.opts().verbose,
        maxTasks: parseInt(program.opts().maxTasks) || undefined,
        filterByStatus: options.status ? [options.status] : undefined,
        filterByLabel: options.label ? [options.label] : undefined,
        deduplicationStrategy: program.opts().deduplication
      };

      console.log(chalk.blue('📤 Pushing tasks to targets...'));
      const result = await manager.push(syncOptions);

      if (result.success) {
        console.log(chalk.green(`\n✅ Successfully pushed ${result.summary.succeededTasks} tasks`));
        console.log(`📊 Total tasks processed: ${result.summary.totalTasks}`);
        if (result.summary.failedTasks > 0) {
          console.log(chalk.yellow(`⚠️  ${result.summary.failedTasks} failed`));
        }
      } else {
        console.log(chalk.red('\n❌ Push operation failed'));
        result.errors.forEach(error => console.log(chalk.red(`   • ${error}`)));
      }
    } catch (error) {
      console.error(chalk.red('❌ Command failed:'), error);
      process.exit(1);
    }
  });

// Sync command - synchronize tasks between sources and targets
program
  .command('sync')
  .description('Synchronize tasks between sources and targets')
  .option('--status <status>', 'Filter by status')
  .option('--label <label>', 'Filter by label')
  .action(async (options) => {
    try {
      const manager = new Manager();
      const syncOptions: Partial<SyncOptions> = {
        dryRun: program.opts().dryRun,
        verbose: program.opts().verbose,
        maxTasks: parseInt(program.opts().maxTasks) || undefined,
        filterByStatus: options.status ? [options.status] : undefined,
        filterByLabel: options.label ? [options.label] : undefined
      };

      console.log(chalk.blue('🔄 Synchronizing tasks...'));
      const result = await manager.sync(syncOptions);

      if (result.success) {
        console.log(chalk.green(`\n✅ Successfully synced ${result.summary.succeededTasks} tasks`));
        console.log(`📊 Total tasks processed: ${result.summary.totalTasks}`);
        console.log(`⏱️  Duration: ${(result.duration / 1000).toFixed(2)}s`);
        if (result.summary.failedTasks > 0) {
          console.log(chalk.yellow(`⚠️  ${result.summary.failedTasks} failed`));
        }
        if (result.summary.conflicts > 0) {
          console.log(chalk.yellow(`⚠️  ${result.summary.conflicts} conflicts`));
        }
      } else {
        console.log(chalk.red('\n❌ Sync operation failed'));
        result.errors.forEach(error => console.log(chalk.red(`   • ${error}`)));
      }
    } catch (error) {
      console.error(chalk.red('❌ Command failed:'), error);
      process.exit(1);
    }
  });

// Search command - search tasks across all sources
program
  .command('search <query>')
  .description('Search tasks across all enabled sources')
  .option('--status <status>', 'Filter by status')
  .option('--max-results <number>', 'Maximum results to return', '20')
  .action(async (query, options) => {
    try {
      const manager = new Manager();
      const syncOptions: Partial<SyncOptions> = {
        maxTasks: parseInt(options.maxResults) || undefined,
        filterByStatus: options.status ? [options.status] : undefined
      };

      console.log(chalk.blue(`🔍 Searching for "${query}"...`));
      const tasks = await manager.search(query, syncOptions);

      if (tasks.length === 0) {
        console.log(chalk.yellow('No tasks found matching your query'));
        return;
      }

      console.log(chalk.green(`\n✅ Found ${tasks.length} matching tasks:\n`));
      tasks.forEach((task, index) => {
        console.log(`${chalk.cyan(index + 1)}. ${chalk.bold(task.title)}`);
        console.log(`   ${chalk.gray('Status:')} ${task.status}`);
        console.log(`   ${chalk.gray('Priority:')} ${task.priority}`);
        console.log(`   ${chalk.gray('Source:')} ${task.source}`);
        if (task.labels.length > 0) {
          console.log(`   ${chalk.gray('Labels:')} ${task.labels.join(', ')}`);
        }
        console.log();
      });
    } catch (error) {
      console.error(chalk.red('❌ Search failed:'), error);
      process.exit(1);
    }
  });

// Count command - count tasks across all sources
program
  .command('count')
  .description('Count tasks in each enabled source')
  .action(async () => {
    try {
      const manager = new Manager();
      console.log(chalk.blue('📊 Counting tasks...'));
      const counts = await manager.count();

      console.log(chalk.green('\n📋 Task counts:\n'));
      Object.entries(counts).forEach(([source, count]) => {
        console.log(`${chalk.cyan(source)}: ${chalk.bold(count)} tasks`);
      });

      const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
      console.log(chalk.gray(`\nTotal: ${total} tasks`));
    } catch (error) {
      console.error(chalk.red('❌ Count failed:'), error);
      process.exit(1);
    }
  });

// Status command - get status of a specific task
program
  .command('status <task-uuid>')
  .description('Get status of a specific task')
  .action(async (taskUuid) => {
    try {
      const manager = new Manager();
      console.log(chalk.blue(`🔍 Finding task ${taskUuid}...`));
      const task = await manager.status(taskUuid);

      if (!task) {
        console.log(chalk.yellow(`Task ${taskUuid} not found`));
        return;
      }

      console.log(chalk.green('\n✅ Task found:\n'));
      console.log(`${chalk.bold('Title:')} ${task.title}`);
      console.log(`${chalk.bold('Status:')} ${task.status}`);
      console.log(`${chalk.bold('Priority:')} ${task.priority}`);
      console.log(`${chalk.bold('Source:')} ${task.source}`);
      console.log(`${chalk.bold('Created:')} ${new Date(task.created_at).toLocaleString()}`);
      if (task.updated_at) {
        console.log(`${chalk.bold('Updated:')} ${new Date(task.updated_at).toLocaleString()}`);
      }
      if (task.labels.length > 0) {
        console.log(`${chalk.bold('Labels:')} ${task.labels.join(', ')}`);
      }
      if (task.content) {
        console.log(`\n${chalk.bold('Content:')}\n${task.content}`);
      }
    } catch (error) {
      console.error(chalk.red('❌ Status lookup failed:'), error);
      process.exit(1);
    }
  });

// Update-status command - update status of a specific task
program
  .command('update-status <task-uuid> <new-status>')
  .description('Update status of a specific task across all targets')
  .action(async (taskUuid, newStatus) => {
    try {
      const manager = new Manager();
      console.log(chalk.blue(`🔄 Updating task ${taskUuid} to status "${newStatus}"...`));

      if (program.opts().dryRun) {
        console.log(chalk.yellow('🔍 DRY RUN: Would update task status'));
        return;
      }

      const result = await manager.updateStatus(taskUuid, newStatus);

      if (result.success) {
        console.log(chalk.green(`\n✅ Successfully updated task status in ${result.summary.succeededTasks} targets`));
        if (result.summary.failedTasks > 0) {
          console.log(chalk.yellow(`⚠️  ${result.summary.failedTasks} targets failed`));
          result.errors.forEach(error => console.log(chalk.red(`   • ${error}`)));
        }
      } else {
        console.log(chalk.red('\n❌ Status update failed'));
        result.errors.forEach(error => console.log(chalk.red(`   • ${error}`)));
      }
    } catch (error) {
      console.error(chalk.red('❌ Status update failed:'), error);
      process.exit(1);
    }
  });

// Health command - check health of all connections
program
  .command('health')
  .description('Check connection health for all sources and targets')
  .action(async () => {
    try {
      const manager = new Manager();
      console.log(chalk.blue('🏥 Checking connection health...'));
      const health = await manager.healthCheck();

      console.log(chalk.green('\n📋 Connection status:\n'));
      Object.entries(health).forEach(([name, healthy]) => {
        const status = healthy ? chalk.green('✅ Connected') : chalk.red('❌ Failed');
        console.log(`${chalk.cyan(name)}: ${status}`);
      });

      const healthyCount = Object.values(health).filter(Boolean).length;
      const totalCount = Object.keys(health).length;
      console.log(chalk.gray(`\n${healthyCount}/${totalCount} connections healthy`));
    } catch (error) {
      console.error(chalk.red('❌ Health check failed:'), error);
      process.exit(1);
    }
  });

// Config command - show current configuration
program
  .command('config')
  .description('Show current configuration')
  .option('--sources', 'Show only sources')
  .option('--targets', 'Show only targets')
  .action(async (options) => {
    try {
      const manager = new Manager();
      const config = manager.getConfig();

      console.log(chalk.blue('⚙️  Current configuration:\n'));

      if (!options.targets) {
        console.log(chalk.bold('📥 Sources:'));
        config.sources.forEach(source => {
          const status = source.enabled ? chalk.green('enabled') : chalk.red('disabled');
          console.log(`  ${chalk.cyan(source.name)} (${source.type}): ${status}`);
        });
        console.log();
      }

      if (!options.sources) {
        console.log(chalk.bold('📤 Targets:'));
        config.targets.forEach(target => {
          const status = target.enabled ? chalk.green('enabled') : chalk.red('disabled');
          console.log(`  ${chalk.cyan(target.name)} (${target.type}): ${status}`);
        });
        console.log();
      }

      console.log(chalk.bold('🔧 Default options:'));
      console.log(`  Dry run: ${config.defaultOptions.dryRun ? chalk.green('yes') : chalk.red('no')}`);
      console.log(`  Max tasks: ${config.defaultOptions.maxTasks || 'unlimited'}`);
      console.log(`  Verbose: ${config.defaultOptions.verbose ? chalk.green('yes') : chalk.red('no')}`);
      console.log(`  Conflict resolution: ${config.conflictResolution}`);
    } catch (error) {
      console.error(chalk.red('❌ Config display failed:'), error);
      process.exit(1);
    }
  });

// Enable/disable commands
program
  .command('enable <source-or-target>')
  .description('Enable a source or target')
  .action(async (name) => {
    try {
      const manager = new Manager();

      // Try as source first, then as target
      try {
        manager.enableSource(name);
        console.log(chalk.green(`✅ Enabled source: ${name}`));
      } catch {
        try {
          manager.enableTarget(name);
          console.log(chalk.green(`✅ Enabled target: ${name}`));
        } catch {
          console.log(chalk.red(`❌ '${name}' is not a valid source or target`));
        }
      }
    } catch (error) {
      console.error(chalk.red('❌ Enable failed:'), error);
      process.exit(1);
    }
  });

program
  .command('disable <source-or-target>')
  .description('Disable a source or target')
  .action(async (name) => {
    try {
      const manager = new Manager();

      // Try as source first, then as target
      try {
        manager.disableSource(name);
        console.log(chalk.green(`✅ Disabled source: ${name}`));
      } catch {
        try {
          manager.disableTarget(name);
          console.log(chalk.green(`✅ Disabled target: ${name}`));
        } catch {
          console.log(chalk.red(`❌ '${name}' is not a valid source or target`));
        }
      }
    } catch (error) {
      console.error(chalk.red('❌ Disable failed:'), error);
      process.exit(1);
    }
  });

// Parse and run
program.parse();

// Handle unknown commands
program.on('command:*', () => {
  console.error(chalk.red('❌ Invalid command: %s'), program.args.join(' '));
  console.log('See --help for a list of available commands.');
  process.exit(1);
});