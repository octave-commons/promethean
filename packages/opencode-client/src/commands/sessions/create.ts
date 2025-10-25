import { Command } from 'commander';
import chalk from 'chalk';
import { create } from '../../actions/sessions/create.js';
import { createOpencodeClient } from '@opencode-ai/sdk';
import { sessionActionSerializer } from '../../serializers/session.js';

export const createSessionCommand = new Command('create')
  .description('Create a new session')
  .argument('[title]', 'Session title')
  .option('--agent', 'Create as agent session')
  .option('--title <title>', 'Session title')
  .option('--files <files>', 'Associated files (JSON array)')
  .option('--delegates <delegates>', 'Delegate agents (JSON array)')
  .option('--format <format>', 'Output format (text|json|markdown)', 'text')
  .action(async (title, options) => {
    try {
      const sessionTitle = options.title || title || 'New Session';

      let files: string[] | undefined;
      if (options.files) {
        try {
          files = JSON.parse(options.files);
          if (!Array.isArray(files)) {
            throw new Error('Files must be an array');
          }
        } catch (e) {
          console.error(chalk.red('Invalid JSON in files option. Must be a valid JSON array.'));
          process.exit(1);
        }
      }

      let delegates: string[] | undefined;
      if (options.delegates) {
        try {
          delegates = JSON.parse(options.delegates);
        } catch (e) {
          delegates = [options.delegates]; // Treat as single delegate if not valid JSON
        }
      }

      // Create OpenCode client
      const client = createOpencodeClient({
        baseUrl: 'http://localhost:4096',
      });

      const result = await create({
        title: sessionTitle,
        client,
      });

      if (options.format === 'json') {
        console.log(JSON.stringify(result, null, 2));
      } else if (options.format === 'markdown') {
        console.log(sessionActionSerializer.serialize(result));
      } else {
        console.log(chalk.green('✓ Session created successfully'));
        console.log(`ID: ${result.session?.id}`);
        console.log(`Title: ${result.session?.title}`);
        console.log(`Type: ${options.agent ? 'Agent' : 'Regular'} Session`);
        console.log(`Created: ${result.session?.createdAt}`);

        if (files && files.length > 0) {
          console.log(`Files: ${files.join(', ')}`);
        }

        if (delegates && delegates.length > 0) {
          console.log(`Delegates: ${delegates.join(', ')}`);
        }
      }

      // Ensure process exits cleanly
      setImmediate(() => {
        process.exit(0);
      });
    } catch (error) {
      console.error(
        chalk.red('Error creating session:'),
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });
