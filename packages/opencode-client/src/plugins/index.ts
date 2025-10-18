// SPDX-License-Identifier: GPL-3.0-only
// Plugins index - exports all tool plugins with client injection

import { OllamaPlugin } from './ollama.js';
import { ProcessPlugin } from './process.js';
import { DirectProcessPlugin } from './direct-process.js';
import { CachePlugin } from './cache.js';
import { SessionsPlugin } from './sessions.js';
import { EventsPlugin } from './events-new.js';
import { MessagesPlugin } from './messages.js';
import { MessagingPlugin } from './messaging.js';
import { TasksPlugin } from './tasks.js';
import { SessionInfoPlugin } from './session-info.js';
import { AgentManagementPlugin } from './agent-management.js';

// Individual plugin exports
export {
  OllamaPlugin,
  ProcessPlugin,
  DirectProcessPlugin,
  CachePlugin,
  SessionsPlugin,
  EventsPlugin,
  MessagesPlugin,
  MessagingPlugin,
  TasksPlugin,
  SessionInfoPlugin,
  AgentManagementPlugin,
};

// Combined plugin that includes all tools
export const AllToolsPlugin = async (context: any) => {
  const ollamaPlugin = await OllamaPlugin(context);
  const processPlugin = await ProcessPlugin(context);
  const directProcessPlugin = await DirectProcessPlugin(context);
  const cachePlugin = await CachePlugin(context);
  const sessionsPlugin = await SessionsPlugin(context);
  const eventsPlugin = await EventsPlugin(context);
  const messagesPlugin = await MessagesPlugin(context);
  const messagingPlugin = await MessagingPlugin(context);
  const tasksPlugin = await TasksPlugin(context);
  const sessionInfoPlugin = await SessionInfoPlugin(context);
  const agentManagementPlugin = await AgentManagementPlugin(context);

  return {
    tool: {
      // Merge all tools from all plugins
      ...ollamaPlugin.tool,
      ...processPlugin.tool,
      ...directProcessPlugin.tool,
      ...cachePlugin.tool,
      ...sessionsPlugin.tool,
      ...eventsPlugin.tool,
      ...messagesPlugin.tool,
      ...messagingPlugin.tool,
      ...tasksPlugin.tool,
      ...sessionInfoPlugin.tool,
      ...agentManagementPlugin.tool,
    },
  };
};

// Plugin categories for selective loading
export const CorePlugins = {
  ollama: OllamaPlugin,
  process: ProcessPlugin,
  directProcess: DirectProcessPlugin,
  cache: CachePlugin,
  sessionInfo: SessionInfoPlugin,
};

export const CommunicationPlugins = {
  sessions: SessionsPlugin,
  events: EventsPlugin,
  messages: MessagesPlugin,
  messaging: MessagingPlugin,
};

export const ManagementPlugins = {
  tasks: TasksPlugin,
  agentManagement: AgentManagementPlugin,
};

// Plugin metadata
export const PluginRegistry = {
  ollama: {
    name: 'Ollama Plugin',
    description: 'LLM job queue and model management tools',
    toolCount: 9,
    plugin: OllamaPlugin,
  },
  process: {
    name: 'Process Plugin',
    description: 'Process management and monitoring tools',
    toolCount: 6,
    plugin: ProcessPlugin,
  },
  directProcess: {
    name: 'Direct Process Plugin',
    description: 'Direct process tools with client injection',
    toolCount: 6,
    plugin: DirectProcessPlugin,
  },
  sessionInfo: {
    name: 'Session Info Plugin',
    description: 'Session information tool with client injection',
    toolCount: 1,
    plugin: SessionInfoPlugin,
  },
  cache: {
    name: 'Cache Plugin',
    description: 'Cache management and optimization tools',
    toolCount: 5,
    plugin: CachePlugin,
  },
  sessions: {
    name: 'Sessions Plugin',
    description: 'Session management and interaction tools',
    toolCount: 5,
    plugin: SessionsPlugin,
  },
  events: {
    name: 'Events Plugin',
    description: 'Event handling and processing tools',
    toolCount: 7,
    plugin: EventsPlugin,
  },
  messages: {
    name: 'Messages Plugin',
    description: 'Message processing and analysis tools',
    toolCount: 4,
    plugin: MessagesPlugin,
  },
  messaging: {
    name: 'Messaging Plugin',
    description: 'Inter-agent messaging and communication tools',
    toolCount: 5,
    plugin: MessagingPlugin,
  },
  tasks: {
    name: 'Tasks Plugin',
    description: 'Task management and monitoring tools',
    toolCount: 8,
    plugin: TasksPlugin,
  },
  agentManagement: {
    name: 'Agent Management Plugin',
    description: 'Unified agent session management tools',
    toolCount: 9,
    plugin: AgentManagementPlugin,
  },
};

// Helper function to create plugins by category
export async function createPlugin(category: keyof typeof PluginRegistry, context: any) {
  const pluginConfig = PluginRegistry[category];
  if (!pluginConfig) {
    throw new Error(`Unknown plugin category: ${category}`);
  }
  return pluginConfig.plugin(context);
}

// Helper function to create multiple plugins
export async function createPlugins(categories: (keyof typeof PluginRegistry)[], context: any) {
  const plugins = await Promise.all(categories.map((category) => createPlugin(category, context)));

  return {
    tool: plugins.reduce(
      (acc, plugin) => ({
        ...acc,
        ...plugin.tool,
      }),
      {},
    ),
  };
}
