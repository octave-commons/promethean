// SPDX-License-Identifier: GPL-3.0-only
// Agent Management plugin - wraps all agent management factory tools with client injection

import type { Plugin } from '@opencode-ai/plugin';
import {
  createCreateAgentSessionTool,
  createStartAgentSessionTool,
  createStopAgentSessionTool,
  createSendAgentMessageTool,
  createCloseAgentSessionTool,
  createListAgentSessionsTool,
  createGetAgentSessionTool,
  createGetAgentStatsTool,
  createCleanupAgentSessionsTool,
} from '../factories/index.js';

export const AgentManagementPlugin: Plugin = async ({ client }) => {
  // Inject client into all agent management tools
  const createAgentSessionTool = createCreateAgentSessionTool();
  const startAgentSessionTool = createStartAgentSessionTool();
  const stopAgentSessionTool = createStopAgentSessionTool();
  const sendAgentMessageTool = createSendAgentMessageTool();
  const closeAgentSessionTool = createCloseAgentSessionTool();
  const listAgentSessionsTool = createListAgentSessionsTool();
  const getAgentSessionTool = createGetAgentSessionTool();
  const getAgentStatsTool = createGetAgentStatsTool();
  const cleanupAgentSessionsTool = createCleanupAgentSessionsTool();

  return {
    tool: {
      'agent.createSession': {
        ...createAgentSessionTool,
        async execute(args: any, context: any) {
          // Inject client into context
          const enhancedContext = { ...context, client };
          return createAgentSessionTool.execute(args, enhancedContext);
        },
      },
      'agent.startSession': {
        ...startAgentSessionTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return startAgentSessionTool.execute(args, enhancedContext);
        },
      },
      'agent.stopSession': {
        ...stopAgentSessionTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return stopAgentSessionTool.execute(args, enhancedContext);
        },
      },
      'agent.sendMessage': {
        ...sendAgentMessageTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return sendAgentMessageTool.execute(args, enhancedContext);
        },
      },
      'agent.closeSession': {
        ...closeAgentSessionTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return closeAgentSessionTool.execute(args, enhancedContext);
        },
      },
      'agent.listSessions': {
        ...listAgentSessionsTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return listAgentSessionsTool.execute(args, enhancedContext);
        },
      },
      'agent.getSession': {
        ...getAgentSessionTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return getAgentSessionTool.execute(args, enhancedContext);
        },
      },
      'agent.getStats': {
        ...getAgentStatsTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return getAgentStatsTool.execute(args, enhancedContext);
        },
      },
      'agent.cleanup': {
        ...cleanupAgentSessionsTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return cleanupAgentSessionsTool.execute(args, enhancedContext);
        },
      },
    },
  };
};
