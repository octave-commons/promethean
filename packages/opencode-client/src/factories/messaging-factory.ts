// SPDX-License-Identifier: GPL-3.0-only
// Factory functions for messaging tools

import { tool } from '@opencode-ai/plugin/tool';
import {
  sendMessage,
  verifyAgentExists,
  getSenderSessionId,
  formatMessage,
  logCommunication,
} from '../actions/messaging/index.js';

// Factory for sendMessage tool
export function createSendMessageTool(): any {
  return tool({
    description: 'Send a message to another agent',
    args: {
      sessionId: tool.schema.string().describe('Session ID of the target agent'),
      message: tool.schema.string().describe('Message content to send'),
      priority: tool.schema
        .enum(['low', 'medium', 'high', 'urgent'])
        .default('medium')
        .describe('Message priority level'),
      messageType: tool.schema
        .enum(['task_update', 'status_request', 'collaboration', 'alert', 'info'])
        .default('info')
        .describe('Type of message being sent'),
    },
    async execute(args, context) {
      const { sessionId, message, priority, messageType } = args;
      const client = (context as any).client;
      const sessionStore = (context as any).sessionStore;
      const agentTaskStore = (context as any).agentTaskStore;
      const agentTasks = (context as any).agentTasks;

      if (!client || !sessionStore || !agentTaskStore || !agentTasks) {
        throw new Error('Required context not available for messaging');
      }

      const messagingContext = {
        sessionStore,
        agentTaskStore,
        agentTasks,
      };

      const result = await sendMessage(
        messagingContext,
        client,
        sessionId,
        message,
        priority,
        messageType,
      );

      return JSON.stringify({
        success: true,
        result,
        sessionId,
        priority,
        messageType,
      });
    },
  });
}

// Factory for verifyAgentExists tool
export function createVerifyAgentExistsTool(): any {
  return tool({
    description: 'Verify if an agent exists with the given session ID',
    args: {
      sessionId: tool.schema.string().describe('Session ID to verify'),
    },
    async execute(args, context) {
      const { sessionId } = args;
      const sessionStore = (context as any).sessionStore;
      const agentTaskStore = (context as any).agentTaskStore;
      const agentTasks = (context as any).agentTasks;

      if (!sessionStore || !agentTaskStore || !agentTasks) {
        throw new Error('Required context not available for agent verification');
      }

      const messagingContext = {
        sessionStore,
        agentTaskStore,
        agentTasks,
      };

      const exists = await verifyAgentExists(messagingContext, sessionId);

      return JSON.stringify({
        sessionId,
        exists,
        verified: true,
      });
    },
  });
}

// Factory for getSenderSessionId tool
export function createGetSenderSessionIdTool(): any {
  return tool({
    description: 'Get the session ID of the current sender',
    args: {},
    async execute(_args, context) {
      const client = (context as any).client;

      if (!client) {
        throw new Error('Client not available in context');
      }

      const senderSessionId = await getSenderSessionId(client);

      return JSON.stringify({
        senderSessionId,
        retrieved: true,
      });
    },
  });
}

// Factory for formatMessage tool
export function createFormatMessageTool(): any {
  return tool({
    description: 'Format a message for inter-agent communication',
    args: {
      senderId: tool.schema.string().describe('Session ID of the sender'),
      recipientId: tool.schema.string().describe('Session ID of the recipient'),
      message: tool.schema.string().describe('Message content to format'),
      priority: tool.schema
        .enum(['low', 'medium', 'high', 'urgent'])
        .default('medium')
        .describe('Message priority level'),
      messageType: tool.schema
        .enum(['task_update', 'status_request', 'collaboration', 'alert', 'info'])
        .default('info')
        .describe('Type of message being sent'),
    },
    async execute({ senderId, recipientId, message, priority, messageType }) {
      const formattedMessage = formatMessage(senderId, recipientId, message, priority, messageType);

      return JSON.stringify({
        formattedMessage,
        senderId,
        recipientId,
        priority,
        messageType,
      });
    },
  });
}

// Factory for logCommunication tool
export function createLogCommunicationTool(): any {
  return tool({
    description: 'Log inter-agent communication to the session store',
    args: {
      senderId: tool.schema.string().describe('Session ID of the sender'),
      recipientId: tool.schema.string().describe('Session ID of the recipient'),
      message: tool.schema.string().describe('Message content that was sent'),
      priority: tool.schema
        .enum(['low', 'medium', 'high', 'urgent'])
        .default('medium')
        .describe('Message priority level'),
      messageType: tool.schema
        .enum(['task_update', 'status_request', 'collaboration', 'alert', 'info'])
        .default('info')
        .describe('Type of message that was sent'),
    },
    async execute(args, context) {
      const { senderId, recipientId, message, priority, messageType } = args;
      const sessionStore = (context as any).sessionStore;
      const agentTaskStore = (context as any).agentTaskStore;
      const agentTasks = (context as any).agentTasks;

      if (!sessionStore || !agentTaskStore || !agentTasks) {
        throw new Error('Required context not available for communication logging');
      }

      const messagingContext = {
        sessionStore,
        agentTaskStore,
        agentTasks,
      };

      await logCommunication(
        messagingContext,
        senderId,
        recipientId,
        message,
        priority,
        messageType,
      );

      return JSON.stringify({
        success: true,
        senderId,
        recipientId,
        priority,
        messageType,
        logged: true,
      });
    },
  });
}

// Export all factory functions
export const messagingToolFactories = {
  createSendMessageTool,
  createVerifyAgentExistsTool,
  createGetSenderSessionIdTool,
  createFormatMessageTool,
  createLogCommunicationTool,
};
