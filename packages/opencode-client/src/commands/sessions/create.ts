import { Command } from 'commander';
import chalk from 'chalk';
import { sessionStore } from '../../index.js';

interface CreateSessionResponse {
  session?: {
    id: string;
    title: string;
    createdAt: string;
  };
}

async function createApiSession(_options: {
  title: string;
  files?: string[];
  delegates?: string[];
}): Promise<CreateSessionResponse> {
  const sessionId = `session-${Date.now()}`;
  const sessionData = {
    id: sessionId,
    title: _options.title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active',
    type: 'regular',
  };

  // Store the session in the context store
  await sessionStore.insert({
    id: sessionId,
    text: JSON.stringify(sessionData),
    timestamp: new Date().toISOString(),
    metadata: {
      type: 'session',
      status: 'active',
      title: _options.title,
    },
  });

  return {
    session: sessionData,
  };
}

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

      const result: CreateSessionResponse = await createApiSession({
        title: sessionTitle,
        files,
        delegates,
      });

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
