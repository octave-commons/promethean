import { Command } from 'commander';
import { listTasksCommand } from './list.js';
import { getTaskCommand } from './get.js';
import { createTaskCommand } from './create.js';
import { updateTaskCommand } from './update.js';

export const tasksCommands = new Command('tasks')
  .description('Task management and monitoring')
  .alias('t');

tasksCommands
  .addCommand(listTasksCommand)
  .addCommand(getTaskCommand)
  .addCommand(createTaskCommand)
  .addCommand(updateTaskCommand);
