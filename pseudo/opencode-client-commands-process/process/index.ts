import { Command } from 'commander';
import { listProcessesCommand } from './list.js';
import { startProcessCommand } from './start.js';
import { stopProcessCommand } from './stop.js';
import { getProcessStatusCommand } from './status.js';

export const processCommands = new Command('process')
  .description('Process management and monitoring')
  .alias('proc');

processCommands
  .addCommand(listProcessesCommand)
  .addCommand(startProcessCommand)
  .addCommand(stopProcessCommand)
  .addCommand(getProcessStatusCommand);
