import { Command } from 'commander';
import chalk from 'chalk';

export const getAgentCommand = new Command('get')
  .description('Get agent details')
  .argument('<agentId>', 'agent ID to retrieve')
  .action(async (agentId: string) => {
    try {
      console.log(chalk.blue(`📖 Getting agent: ${agentId}`));
      // TODO: Implement agent get logic
      console.log(chalk.yellow('Agent get not yet implemented'));
    } catch (error) {
      console.error(chalk.red('Error getting agent:'), error);
      process.exit(1);
    }
  });
