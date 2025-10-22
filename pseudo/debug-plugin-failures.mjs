#!/usr/bin/env node

// Test script to identify which plugins are failing in AllToolsPlugin
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

async function debugPluginFailures() {
  console.log('Testing each plugin for failures...\n');

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

    const plugins = [
      { name: 'OllamaPlugin', plugin: OllamaPlugin },
      { name: 'ProcessPlugin', plugin: ProcessPlugin },
      { name: 'DirectProcessPlugin', plugin: DirectProcessPlugin },
      { name: 'CachePlugin', plugin: CachePlugin },
      { name: 'SessionsPlugin', plugin: SessionsPlugin },
      { name: 'EventsPlugin', plugin: EventsPlugin },
      { name: 'MessagesPlugin', plugin: MessagesPlugin },
      { name: 'MessagingPlugin', plugin: MessagingPlugin },
      { name: 'TasksPlugin', plugin: TasksPlugin },
      { name: 'SessionInfoPlugin', plugin: SessionInfoPlugin },
      { name: 'AgentManagementPlugin', plugin: AgentManagementPlugin },
      { name: 'AsyncSubAgentsPlugin', plugin: AsyncSubAgentsPlugin },
      { name: 'EventCapturePlugin', plugin: EventCapturePlugin },
      { name: 'TypeCheckerPlugin', plugin: TypeCheckerPlugin },
    ];

    const results = [];

    for (const { name, plugin } of plugins) {
      try {
        console.log(`Testing ${name}...`);
        const result = await plugin(context);
        const toolCount = Object.keys(result.tool || {}).length;
        console.log(`  ✓ ${name}: ${toolCount} tools`);
        results.push({ name, success: true, toolCount, tools: result.tool });
      } catch (error) {
        console.log(`  ✗ ${name}: FAILED - ${error.message}`);
        results.push({ name, success: false, error: error.message });
      }
    }

    console.log('\nSummary:');
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    console.log(`  Successful plugins: ${successful.length}`);
    console.log(`  Failed plugins: ${failed.length}`);

    if (failed.length > 0) {
      console.log('\nFailed plugins:');
      failed.forEach(({ name, error }) => {
        console.log(`  - ${name}: ${error}`);
      });
    }

    console.log('\nSuccessful plugins and tool counts:');
    successful.forEach(({ name, toolCount }) => {
      console.log(`  - ${name}: ${toolCount} tools`);
    });

    // Calculate expected total
    const expectedTotal = successful.reduce((sum, { toolCount }) => sum + toolCount, 0);
    console.log(`\nExpected total tools: ${expectedTotal}`);
  } catch (error) {
    console.error('Failed to debug plugin failures:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugPluginFailures();
