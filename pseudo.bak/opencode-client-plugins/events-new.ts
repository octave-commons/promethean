// SPDX-License-Identifier: GPL-3.0-only
// Events plugin - wraps all events factory tools with client injection

import type { Plugin } from '@opencode-ai/plugin';
import { eventsToolFactories } from '../factories/index.js';

export const EventsPlugin: Plugin = async ({ client }) => {
  // Inject client into all events tools
  const handleSessionIdleTool = eventsToolFactories.createHandleSessionIdleTool();
  const handleSessionUpdatedTool = eventsToolFactories.createHandleSessionUpdatedTool();
  const handleMessageUpdatedTool = eventsToolFactories.createHandleMessageUpdatedTool();
  const extractSessionIdTool = eventsToolFactories.createExtractSessionIdTool();
  const getSessionMessagesTool = eventsToolFactories.createGetSessionMessagesTool();
  const detectTaskCompletionTool = eventsToolFactories.createDetectTaskCompletionTool();
  const processSessionMessagesTool = eventsToolFactories.createProcessSessionMessagesTool();

  return {
    tool: {
      'events_handleSessionIdle': {
        ...handleSessionIdleTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return handleSessionIdleTool.execute(args, enhancedContext);
        },
      },
      'events_handleSessionUpdated': {
        ...handleSessionUpdatedTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return handleSessionUpdatedTool.execute(args, enhancedContext);
        },
      },
      'events_handleMessageUpdated': {
        ...handleMessageUpdatedTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return handleMessageUpdatedTool.execute(args, enhancedContext);
        },
      },
      'events_extractSessionId': {
        ...extractSessionIdTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return extractSessionIdTool.execute(args, enhancedContext);
        },
      },
      'events_getSessionMessages': {
        ...getSessionMessagesTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return getSessionMessagesTool.execute(args, enhancedContext);
        },
      },
      'events_detectTaskCompletion': {
        ...detectTaskCompletionTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return detectTaskCompletionTool.execute(args, enhancedContext);
        },
      },
      'events_processSessionMessages': {
        ...processSessionMessagesTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return processSessionMessagesTool.execute(args, enhancedContext);
        },
      },
    },
  };
};
