import { Command } from 'commander';
import chalk from 'chalk';

export const createSession = new Command('create')
  .description('Create a new session')
  .argument('[title]', 'Session title')
  .option('--agent', 'Create as agent session')
  .option('--title <title>', 'Session title')
  .option('--files <files>', 'Associated files (JSON array)')
  .option('--delegates <delegates>', 'Delegate agents (JSON array)')
  .action(async (title, options) => {
    try {
      const sessionTitle = options.title || title || 'New Session';
      const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      console.log(chalk.green('✓ Session created successfully'));
      console.log(`ID: ${sessionId}`);
      console.log(`Title: ${sessionTitle}`);
      console.log(`Type: ${options.agent ? 'Agent' : 'Regular'} Session`);
      
      if (options.files) {
        try {
          const files = JSON.parse(options.files);
          if (!Array.isArray(files)) {
            throw new Error('Files must be an array');
          }
          console.log(`Files: ${files.join(', ')}`);
        } catch (e) {
          console.error(chalk.red('Invalid JSON in files option. Must be a valid JSON array.'));
          process.exit(1);
        }
      }
      
      if (options.delegates) {
        try {
          const delegates = JSON.parse(options.delegates);
          console.log(`Delegates: ${delegates.join(', ')}`);
        } catch (e) {
          console.log(`Delegates: ${options.delegates}`);
        }
      }
    } catch (error) {
      console.error(chalk.red('Error creating session:'), error.message);
      process.exit(1);
    }
  });
