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

// New parity plugins from pseudo/opencode-plugins/
import { AsyncSubAgentsPlugin } from './async-sub-agents.js';
import { EventCapturePlugin } from './event-capture.js';
import { TypeCheckerPlugin } from './type-checker.js';

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
  // New parity plugins
  AsyncSubAgentsPlugin,
  EventCapturePlugin,
  TypeCheckerPlugin,
};

// Combined plugin that includes all tools
export const AllToolsPlugin = async (context: { client?: unknown; [key: string]: unknown }) => {
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
  // New parity plugins
  const asyncSubAgentsPlugin = await AsyncSubAgentsPlugin(context);
  const eventCapturePlugin = await EventCapturePlugin(context);
  const typeCheckerPlugin = await TypeCheckerPlugin(context);

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
      // New parity plugins
      ...asyncSubAgentsPlugin.tool,
      ...eventCapturePlugin.tool,
      ...typeCheckerPlugin.tool,
    },
    // Merge hooks from all plugins
    ...asyncSubAgentsPlugin,
    ...eventCapturePlugin,
    ...typeCheckerPlugin,
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

// New parity plugins from pseudo/opencode-plugins/
export const ParityPlugins = {
  asyncSubAgents: AsyncSubAgentsPlugin,
  eventCapture: EventCapturePlugin,
  typeChecker: TypeCheckerPlugin,
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
  // New parity plugins from pseudo/opencode-plugins/
  asyncSubAgents: {
    name: 'Async Sub-Agents Plugin',
    description: 'Asynchronous sub-agent spawning, monitoring, and inter-agent communication',
    toolCount: 11,
    plugin: AsyncSubAgentsPlugin,
    source: 'pseudo/opencode-plugins/async-sub-agents-final.ts',
  },
  eventCapture: {
    name: 'Event Capture Plugin',
    description: 'Comprehensive event capture and semantic search functionality',
    toolCount: 4,
    plugin: EventCapturePlugin,
    source: 'pseudo/opencode-plugins/event-capture-simplified.ts',
  },
  typeChecker: {
    name: 'Type Checker Plugin',
    description: 'Automatic type checking for TypeScript, Clojure, and Babashka files',
    toolCount: 0, // Hook-based plugin
    plugin: TypeCheckerPlugin,
    source: 'pseudo/opencode-plugins/type-checker.ts',
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
