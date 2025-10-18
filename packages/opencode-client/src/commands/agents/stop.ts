import { Command } from 'commander';
import chalk from 'chalk';

export const stopAgentCommand = new Command('stop')
  .description('Stop an agent')
  .argument('<agentId>', 'agent ID to stop')
  .option('-m, --message <message>', 'completion message')
  .action(async (agentId: string, _options) => {
    try {
      console.log(chalk.blue(`🛑 Stopping agent: ${agentId}`));
      // TODO: Implement agent stop logic
      console.log(chalk.yellow('Agent stop not yet implemented'));
    } catch (error) {
      console.error(chalk.red('Error stopping agent:'), error);
      process.exit(1);
    }
  });
