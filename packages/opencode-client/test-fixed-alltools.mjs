#!/usr/bin/env node

// Test to create a fixed version of AllToolsPlugin
import {
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
  AsyncSubAgentsPlugin,
  EventCapturePlugin,
  TypeCheckerPlugin,
} from './dist/plugins/index.js';

// Fixed version of AllToolsPlugin with better error handling
export const FixedAllToolsPlugin = async (context) => {
  const ctx = context;

  try {
    console.log('Loading plugins...');

    // Load all plugins with error handling
    const plugins = [];

    const pluginLoaders = [
      { name: 'ollama', loader: OllamaPlugin },
      { name: 'process', loader: ProcessPlugin },
      { name: 'directProcess', loader: DirectProcessPlugin },
      { name: 'cache', loader: CachePlugin },
      { name: 'sessions', loader: SessionsPlugin },
      { name: 'events', loader: EventsPlugin },
      { name: 'messages', loader: MessagesPlugin },
      { name: 'messaging', loader: MessagingPlugin },
      { name: 'tasks', loader: TasksPlugin },
      { name: 'sessionInfo', loader: SessionInfoPlugin },
      { name: 'agentManagement', loader: AgentManagementPlugin },
      { name: 'asyncSubAgents', loader: AsyncSubAgentsPlugin },
      { name: 'eventCapture', loader: EventCapturePlugin },
      { name: 'typeChecker', loader: TypeCheckerPlugin },
    ];

    for (const { name, loader } of pluginLoaders) {
      try {
        console.log(`  Loading ${name}...`);
        const plugin = await loader(ctx);
        plugins.push({ name, plugin });
        console.log(`    ✓ ${name} loaded with ${Object.keys(plugin.tool || {}).length} tools`);
      } catch (error) {
        console.error(`    ✗ ${name} failed: ${error.message}`);
        // Continue with other plugins
      }
    }

    // Merge all tools manually
    const allTools = {};
    let totalTools = 0;

    for (const { name, plugin } of plugins) {
      const tools = plugin.tool || {};
      const toolCount = Object.keys(tools).length;
      console.log(`  Merging ${name}: ${toolCount} tools`);

      Object.assign(allTools, tools);
      totalTools += toolCount;
    }

    console.log(`\nTotal tools merged: ${totalTools}`);
    console.log(`Actual tools in object: ${Object.keys(allTools).length}`);

    return {
      tool: allTools,
      // Include hooks from parity plugins
      hooks: {
        asyncSubAgents: plugins.find((p) => p.name === 'asyncSubAgents')?.plugin,
        eventCapture: plugins.find((p) => p.name === 'eventCapture')?.plugin,
        typeChecker: plugins.find((p) => p.name === 'typeChecker')?.plugin,
      },
    };
  } catch (error) {
    console.error('FixedAllToolsPlugin failed:', error.message);
    throw error;
  }
};

// Test the fixed version
async function testFixedAllToolsPlugin() {
  console.log('Testing FixedAllToolsPlugin...\n');

  try {
    // Create a mock client with event support
    const mockClient = {
      request: async (method, params) => {
        return { success: true, data: 'mock response' };
      },
      event: {
        subscribe: async () => ({
          stream: (async function* () {
            // Empty async generator for testing
          })(),
        }),
      },
    };

    const context = { client: mockClient };

    const fixedPlugin = await FixedAllToolsPlugin(context);

    console.log('\nResults:');
    console.log('  Tools returned:', Object.keys(fixedPlugin.tool || {}).length);
    console.log('  Tool names:', Object.keys(fixedPlugin.tool || {}));
  } catch (error) {
    console.error('Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testFixedAllToolsPlugin();
