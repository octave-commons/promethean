// SPDX-License-Identifier: GPL-3.0-only
// Messages plugin - wraps all messages factory tools with client injection

import type { Plugin } from '@opencode-ai/plugin';
import { messagesToolFactories } from '../factories/index.js';

export const MessagesPlugin: Plugin = async ({ client }) => {
  // Inject client into all messages tools
  const detectTaskCompletionMessagesTool =
    messagesToolFactories.createDetectTaskCompletionMessagesTool();
  const processMessageTool = messagesToolFactories.createProcessMessageTool();
  const processSessionMessagesMessagesTool =
    messagesToolFactories.createProcessSessionMessagesMessagesTool();
  const getSessionMessagesMessagesTool =
    messagesToolFactories.createGetSessionMessagesMessagesTool();

  return {
    tool: {
      'messages_detectTaskCompletion': {
        ...detectTaskCompletionMessagesTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return detectTaskCompletionMessagesTool.execute(args, enhancedContext);
        },
      },
      'messages_process': {
        ...processMessageTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return processMessageTool.execute(args, enhancedContext);
        },
      },
      'messages_processSession': {
        ...processSessionMessagesMessagesTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return processSessionMessagesMessagesTool.execute(args, enhancedContext);
        },
      },
      'messages_getSession': {
        ...getSessionMessagesMessagesTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return getSessionMessagesMessagesTool.execute(args, enhancedContext);
        },
      },
    },
  };
};
