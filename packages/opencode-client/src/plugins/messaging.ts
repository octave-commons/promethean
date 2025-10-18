// SPDX-License-Identifier: GPL-3.0-only
// Messaging plugin - wraps all messaging factory tools with client injection

import type { Plugin } from '@opencode-ai/plugin';
import { messagingToolFactories } from '../factories/index.js';

export const MessagingPlugin: Plugin = async ({ client }) => {
  // Inject client into all messaging tools
  const sendMessageTool = messagingToolFactories.createSendMessageTool();
  const verifyAgentExistsTool = messagingToolFactories.createVerifyAgentExistsTool();
  const getSenderSessionIdTool = messagingToolFactories.createGetSenderSessionIdTool();
  const formatMessageTool = messagingToolFactories.createFormatMessageTool();
  const logCommunicationTool = messagingToolFactories.createLogCommunicationTool();

  return {
    tool: {
      'messaging.send': {
        ...sendMessageTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return sendMessageTool.execute(args, enhancedContext);
        },
      },
      'messaging.verifyAgent': {
        ...verifyAgentExistsTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return verifyAgentExistsTool.execute(args, enhancedContext);
        },
      },
      'messaging.getSenderId': {
        ...getSenderSessionIdTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return getSenderSessionIdTool.execute(args, enhancedContext);
        },
      },
      'messaging.format': {
        ...formatMessageTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return formatMessageTool.execute(args, enhancedContext);
        },
      },
      'messaging.log': {
        ...logCommunicationTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return logCommunicationTool.execute(args, enhancedContext);
        },
      },
    },
  };
};
