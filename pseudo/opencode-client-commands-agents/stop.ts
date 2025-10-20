import { Command } from 'commander';
import chalk from 'chalk';
// Simple mock functions
async function getAgentSession(_sessionId: string): Promise<any> {
  return null;
}

async function stopAgentSession(_sessionId: string, _message?: string): Promise<void> {
  console.log('Stopping agent session');
}

export const stopAgentCommand = new Command('stop')
  .description('Stop an agent session')
  .argument('<sessionId>', 'session ID to stop')
  .option('-m, --message <message>', 'completion message')
  .action(async (sessionId: string, options) => {
    try {
      console.log(chalk.blue(`🛑 Stopping agent session: ${sessionId}`));

      // Check if session exists
      const existingSession = await getAgentSession(sessionId);
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

      await stopAgentSession(sessionId, options.message);

      const updatedSession = await getAgentSession(sessionId);
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
