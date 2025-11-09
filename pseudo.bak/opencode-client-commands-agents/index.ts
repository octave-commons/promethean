import { Command } from 'commander';
import { listAgentsCommand } from './list.js';
import { getAgentCommand } from './get.js';
import { createAgentCommand } from './create.js';
import { startAgentCommand } from './start.js';
import { stopAgentCommand } from './stop.js';

export const agentCommands = new Command('agents')
  .description('Agent management and monitoring')
  .alias('ag');

agentCommands
  .addCommand(listAgentsCommand)
  .addCommand(getAgentCommand)
  .addCommand(createAgentCommand)
  .addCommand(startAgentCommand)
  .addCommand(stopAgentCommand);
