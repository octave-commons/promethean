import { Command } from 'commander';
import chalk from 'chalk';
import { UnifiedAgentManager } from '../../api/UnifiedAgentManager.js';

export const startAgentCommand = new Command('start')
  .description('Start an agent session')
  .argument('<sessionId>', 'session ID to start')
  .action(async (sessionId: string) => {
    try {
      console.log(chalk.blue(`🚀 Starting agent session: ${sessionId}`));

      const manager = UnifiedAgentManager.getInstance();

      // Check if session exists
      const existingSession = manager.getAgentSession(sessionId);
      if (!existingSession) {
        console.log(chalk.yellow(`Session not found: ${sessionId}`));
        console.log(chalk.gray('Use "opencode agents list" to see available sessions'));
        return;
      }

      if (existingSession.status === 'running') {
        console.log(chalk.yellow('Session is already running'));
        return;
      }

      await manager.startAgentSession(sessionId);

      const updatedSession = manager.getAgentSession(sessionId);
      console.log(chalk.green(`✅ Agent session started successfully!`));
      console.log(`Session ID: ${chalk.cyan(sessionId)}`);
      console.log(`Status: ${chalk.blue(updatedSession?.status.toUpperCase() || 'RUNNING')}`);
    } catch (error) {
      console.error(chalk.red('Error starting agent:'), error);
      process.exit(1);
    }
  });
