import { Command } from 'commander';
import chalk from 'chalk';
import { create } from '../../actions/sessions/create.js';
import { createOpencodeClient } from '@opencode-ai/sdk';

export const createSessionCommand = new Command('create')
  .description('Create a new session')
  .argument('[title]', 'Session title')
  .option('--agent', 'Create as agent session')
  .option('--title <title>', 'Session title')
  .option('--files <files>', 'Associated files (JSON array)')
  .option('--delegates <delegates>', 'Delegate agents (JSON array)')
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
      const baseURL = process.env.OPENCODE_API_URL || 'http://localhost:3000';
      const timeout = 30000;
      const maxRetries = 3;
      const logLevel = 'info';

      const authHeader: Record<string, string> = {};
      if (process.env.OPENCODE_API_KEY) {
        authHeader['Authorization'] = `Bearer ${process.env.OPENCODE_API_KEY}`;
      }

      const client = await createOpencodeClient({
        baseUrl: baseURL,
        timeout,
        maxRetries,
        logLevel,
        fetchOptions: { headers: authHeader },
      });

      const result = await create({
        title: sessionTitle,
        client,
      });

      const sessionData = JSON.parse(result);

      console.log(chalk.green('✓ Session created successfully'));
      console.log(`ID: ${sessionData.session?.id}`);
      console.log(`Title: ${sessionData.session?.title}`);
      console.log(`Type: ${options.agent ? 'Agent' : 'Regular'} Session`);
      console.log(`Created: ${sessionData.session?.createdAt}`);

      if (files && files.length > 0) {
        console.log(`Files: ${files.join(', ')}`);
      }

      if (delegates && delegates.length > 0) {
        console.log(`Delegates: ${delegates.join(', ')}`);
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
