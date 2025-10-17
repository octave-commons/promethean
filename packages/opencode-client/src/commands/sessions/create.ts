import { Command } from 'commander';
import chalk from 'chalk';

export const createSession = new Command('create')
  .description('Create a new session')
  .argument('[title]', 'Session title')
  .option('--agent', 'Create as agent session')
  .action(async (title, options) => {
    try {
      const sessionTitle = title || 'New Session';
      const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      console.log(chalk.green('✓ Session created successfully'));
      console.log(`ID: ${sessionId}`);
      console.log(`Title: ${sessionTitle}`);
      console.log(`Type: ${options.agent ? 'Agent' : 'Regular'} Session`);
    } catch (error) {
      console.error(chalk.red('Error creating session:'), error.message);
      process.exit(1);
    }
  });
