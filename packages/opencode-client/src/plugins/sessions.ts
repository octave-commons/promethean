// SPDX-License-Identifier: GPL-3.0-only
// Sessions plugin - wraps all sessions factory tools with client injection

import type { Plugin } from '@opencode-ai/plugin';
import { sessionsToolFactories } from '../factories/index.js';

export const SessionsPlugin: Plugin = async ({ client }) => {
  // Inject client into all sessions tools
  const createSessionTool = sessionsToolFactories.createCreateSessionTool();
  const getSessionTool = sessionsToolFactories.createGetSessionTool();
  const listSessionsTool = sessionsToolFactories.createListSessionsTool();
  const closeSessionTool = sessionsToolFactories.createCloseSessionTool();
  const searchSessionsTool = sessionsToolFactories.createSearchSessionsTool();

  return {
    tool: {
      'sessions.create': {
        ...createSessionTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return createSessionTool.execute(args, enhancedContext);
        },
      },
      'sessions.get': {
        ...getSessionTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return getSessionTool.execute(args, enhancedContext);
        },
      },
      'sessions.list': {
        ...listSessionsTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return listSessionsTool.execute(args, enhancedContext);
        },
      },
      'sessions.close': {
        ...closeSessionTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return closeSessionTool.execute(args, enhancedContext);
        },
      },
      'sessions.search': {
        ...searchSessionsTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return searchSessionsTool.execute(args, enhancedContext);
        },
      },
    },
  };
};
