#!/usr/bin/env node

// Test script to debug AllToolsPlugin merging
import { AllToolsPlugin } from './dist/plugins/index.js';

async function debugAllToolsPlugin() {
  console.log('Debugging AllToolsPlugin merging...\n');

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

    // Import individual plugins to test them one by one
    const { CachePlugin } = await import('./dist/plugins/cache.js');
    const { OllamaPlugin } = await import('./dist/plugins/ollama.js');
    const { SessionsPlugin } = await import('./dist/plugins/sessions.js');
    const { EventCapturePlugin } = await import('./dist/plugins/event-capture.js');

    console.log('Testing plugins individually:');

    const cachePlugin = await CachePlugin(context);
    console.log('  CachePlugin tools:', Object.keys(cachePlugin.tool || {}).length);

    const ollamaPlugin = await OllamaPlugin(context);
    console.log('  OllamaPlugin tools:', Object.keys(ollamaPlugin.tool || {}).length);

    const sessionsPlugin = await SessionsPlugin(context);
    console.log('  SessionsPlugin tools:', Object.keys(sessionsPlugin.tool || {}).length);

    const eventCapturePlugin = await EventCapturePlugin(context);
    console.log('  EventCapturePlugin tools:', Object.keys(eventCapturePlugin.tool || {}).length);

    // Now test the merge manually
    console.log('\nManual merge test:');
    const manualMerge = {
      tool: {
        ...cachePlugin.tool,
        ...ollamaPlugin.tool,
        ...sessionsPlugin.tool,
        ...eventCapturePlugin.tool,
      },
    };
    console.log('  Manual merge tools:', Object.keys(manualMerge.tool || {}).length);
    console.log('  Manual merge tools list:', Object.keys(manualMerge.tool || {}));

    // Now test AllToolsPlugin
    console.log('\nTesting AllToolsPlugin:');
    const allToolsPlugin = await AllToolsPlugin(context);
    console.log('  AllToolsPlugin tools:', Object.keys(allToolsPlugin.tool || {}).length);
    console.log('  AllToolsPlugin tools list:', Object.keys(allToolsPlugin.tool || {}));
  } catch (error) {
    console.error('Failed to debug AllToolsPlugin:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugAllToolsPlugin();
