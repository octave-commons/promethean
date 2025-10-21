import { Command } from 'commander';
import chalk from 'chalk';
import { createAgentSession } from '../../api/UnifiedAgentManager.js';

export const createAgentCommand = new Command('create')
  .description('Create a new agent session')
  .argument('<task>', 'task description')
  .option('-t, --title <title>', 'session title')
  .option('-f, --files <files...>', 'files to include')
  .option('-d, --delegates <delegates...>', 'delegate agents')
  .option('-p, --priority <priority>', 'task priority (low, medium, high, urgent)')
  .option('--no-start', "create session but don't start it automatically")
  .option('-j, --json', 'output in JSON format')
  .action(async (task: string, options) => {
    try {
      console.log(chalk.blue(`➕ Creating agent session with task: ${task}`));

      const sessionOptions = {
        autoStart: !options.noStart,
      };

      const createOptions: any = {
        title: options.title,
        files: options.files,
        delegates: options.delegates,
      };

      if (options.priority) {
        createOptions.priority = options.priority;
      }

      const session = await createAgentSession(task, undefined, createOptions, sessionOptions);

      if (options.json) {
        console.log(JSON.stringify(session, null, 2));
      } else {
        console.log(chalk.green(`✅ Agent session created successfully!`));
        console.log(`Session ID: ${chalk.cyan(session.sessionId)}`);
        console.log(`Status: ${chalk.blue(session.status.toUpperCase())}`);
        console.log(`Title: ${session.session.title || 'Untitled'}`);
        console.log(`Task: ${session.task.task}`);
        console.log(`Auto-start: ${options.noStart ? 'No' : 'Yes'}`);

        if (session.session.files && session.session.files.length > 0) {
          console.log(`Files: ${session.session.files.join(', ')}`);
        }
      }
    } catch (error) {
      console.error(chalk.red('Error creating agent:'), error);
      process.exit(1);
    }
  });
