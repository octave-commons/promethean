import { Command } from 'commander';
import chalk from 'chalk';

export const createAgentCommand = new Command('create')
  .description('Create a new agent')
  .argument('<task>', 'task description')
  .option('-t, --title <title>', 'agent title')
  .action(async (task: string, options) => {
    try {
      console.log(chalk.blue(`➕ Creating agent with task: ${task}`));
      // TODO: Implement agent create logic
      console.log(chalk.yellow('Agent create not yet implemented'));
    } catch (error) {
      console.error(chalk.red('Error creating agent:'), error);
      process.exit(1);
    }
  });
