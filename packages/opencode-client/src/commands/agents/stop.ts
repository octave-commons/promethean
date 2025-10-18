import { Command } from 'commander';
import chalk from 'chalk';
import { UnifiedAgentManager } from '../../api/UnifiedAgentManager.js';

export const stopAgentCommand = new Command('stop')
  .description('Stop an agent session')
  .argument('<sessionId>', 'session ID to stop')
  .option('-m, --message <message>', 'completion message')
  .action(async (sessionId: string, options) => {
    try {
      console.log(chalk.blue(`🛑 Stopping agent session: ${sessionId}`));

      const manager = UnifiedAgentManager.getInstance();

      // Check if session exists
      const existingSession = manager.getAgentSession(sessionId);
      if (!existingSession) {
        console.log(chalk.yellow(`Session not found: ${sessionId}`));
        console.log(chalk.gray('Use "opencode agents list" to see available sessions'));
        return;
      }

      if (existingSession.status !== 'running') {
        console.log(
          chalk.yellow(`Session is not currently running (status: ${existingSession.status})`),
        );
        return;
      }

      await manager.stopAgentSession(sessionId, options.message);

      const updatedSession = manager.getAgentSession(sessionId);
      console.log(chalk.green(`✅ Agent session stopped successfully!`));
      console.log(`Session ID: ${chalk.cyan(sessionId)}`);
      console.log(`Status: ${chalk.blue(updatedSession?.status.toUpperCase() || 'COMPLETED')}`);

      if (options.message) {
        console.log(`Message: ${options.message}`);
      }
    } catch (error) {
      console.error(chalk.red('Error stopping agent:'), error);
      process.exit(1);
    }
  });
