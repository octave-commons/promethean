import { Command } from 'commander';
import chalk from 'chalk';
import {
  identifyDuplicateSessions,
  cleanupDuplicateSessions,
  getSessionStats,
} from '../../utils/session-cleanup.js';

export const sessionsDiagnoseCommand = new Command('diagnose')
  .description('Diagnose and clean up session issues')
  .option('--stats', 'Show session statistics')
  .option('--identify-duplicates', 'Identify duplicate sessions')
  .option('--cleanup', 'Clean up duplicate sessions (dry run by default)')
  .option('--force', 'Actually perform cleanup (not just dry run)')
  .action(async (options) => {
    try {
      if (options.stats || (!options.identifyDuplicates && !options.cleanup)) {
        console.log(chalk.blue('📊 Session Statistics:'));
        const stats = await getSessionStats();

        console.log(`Total sessions: ${chalk.yellow(stats.total)}`);
        console.log(`Unique sessions: ${chalk.green(stats.unique)}`);
        console.log(`Duplicate sessions: ${chalk.red(stats.duplicates)}`);

        if (stats.oldestSession) {
          console.log(`Oldest session: ${chalk.gray(stats.oldestSession)}`);
        }
        if (stats.newestSession) {
          console.log(`Newest session: ${chalk.gray(stats.newestSession)}`);
        }

        if (stats.duplicates > 0) {
          console.log(chalk.red(`\\n⚠️  Found ${stats.duplicates} duplicate sessions!`));
          console.log(chalk.gray('Run with --identify-duplicates to see details.'));
          console.log(chalk.gray('Run with --cleanup --force to remove duplicates.'));
        }
      }

      if (options.identifyDuplicates) {
        console.log(chalk.blue('🔍 Identifying Duplicate Sessions:'));
        const { duplicates, total } = await identifyDuplicateSessions();

        if (total === 0) {
          console.log(chalk.green('✅ No duplicate sessions found.'));
        } else {
          console.log(chalk.red(`Found ${total} sessions with duplicates:`));
          duplicates.slice(0, 10).forEach((sessionId, index) => {
            console.log(chalk.red(`  ${index + 1}. ${sessionId}`));
          });

          if (duplicates.length > 10) {
            console.log(chalk.gray(`  ... and ${duplicates.length - 10} more`));
          }
        }
      }

      if (options.cleanup) {
        console.log(chalk.blue('🧹 Cleaning Up Duplicate Sessions:'));

        if (!options.force) {
          console.log(chalk.yellow('DRY RUN MODE - No changes will be made.'));
          console.log(chalk.gray('Use --force to actually perform cleanup.'));
        }

        const { cleaned, errors } = await cleanupDuplicateSessions();

        if (errors.length > 0) {
          console.log(chalk.red('Errors during cleanup:'));
          errors.forEach((error) => console.log(chalk.red(`  - ${error}`)));
        }

        if (options.force) {
          console.log(chalk.green(`✅ Cleaned up ${cleaned} duplicate sessions.`));
        } else {
          console.log(chalk.yellow(`🔍 Would clean up ${cleaned} duplicate sessions.`));
        }
      }

      // Ensure process exits cleanly
      setImmediate(() => {
        process.exit(0);
      });
    } catch (error) {
      console.error(chalk.red('Error during session diagnosis:'), error);
      process.exit(1);
    }
  });
