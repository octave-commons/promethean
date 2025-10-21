import { Command } from 'commander';
import chalk from 'chalk';
import { spawn } from '../../actions/sessions/spawn.js';
import { createOpencodeClient } from '@opencode-ai/sdk';

export const spawnSessionCommand = new Command('spawn')
  .description('Create a new session and send a spawn message')
  .argument('[title]', 'Session title')
  .option('--title <title>', 'Session title')
  .option('--message <message>', 'Spawn message (default: "spawn")')
  .option('-f, --file <path>', 'Read spawn message from file')
  .action(async (title, options) => {
    try {
      const sessionTitle = options.title || title || 'Spawn Session';

      // Determine spawn message content
      let spawnMessage = options.message || 'spawn';

      if (options.file) {
        try {
          const fs = await import('fs');
          spawnMessage = fs.readFileSync(options.file, 'utf8');
          console.log(chalk.gray(`Loaded spawn message from file: ${options.file}`));
        } catch (fileError) {
          console.error(chalk.red(`Failed to read file: ${fileError}`));
          process.exit(1);
        }
      }

      console.log(chalk.blue('🚀 Spawning new session...'));
      console.log(chalk.gray(`Title: ${sessionTitle}`));
      console.log(
        chalk.gray(
          `Message: ${spawnMessage.substring(0, 100)}${spawnMessage.length > 100 ? '...' : ''}`,
        ),
      );

      // Create OpenCode client
      const client = createOpencodeClient({
        baseUrl: 'http://localhost:4096',
      });

      const result = await spawn({
        title: sessionTitle,
        message: spawnMessage,
        client,
      });

      const spawnData = JSON.parse(result);

      console.log(chalk.green('✓ Session spawned successfully'));
      console.log(`Session ID: ${chalk.cyan(spawnData.session?.id)}`);
      console.log(`Title: ${spawnData.session?.title}`);
      console.log(`Created: ${spawnData.session?.createdAt}`);

      if (spawnData.message) {
        console.log(chalk.green('✓ Spawn message sent successfully'));
        console.log(`Message ID: ${chalk.cyan(spawnData.message.id)}`);
        console.log(`Content: ${spawnData.message.content}`);
      }

      // Ensure process exits cleanly
      setImmediate(() => {
        process.exit(0);
      });
    } catch (error) {
      console.error(
        chalk.red('Error spawning session:'),
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });
