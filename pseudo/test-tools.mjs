#!/usr/bin/env node

// Test script to validate all tools are working
import { AllToolsPlugin } from './dist/plugins/index.js';

async function testAllTools() {
  console.log('Testing AllToolsPlugin...');

  try {
    // Create a mock client with event support
    const mockClient = {
      request: async (method, params) => {
        console.log(`Mock client request: ${method}`, params);
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
    const plugin = await AllToolsPlugin(context);

    console.log('Plugin created successfully');
    console.log('Available tools:', Object.keys(plugin.tool || {}));
    console.log('Total tools:', Object.keys(plugin.tool || {}).length);

    // List all tools by category
    const tools = plugin.tool || {};
    const categories = {};

    for (const [name, tool] of Object.entries(tools)) {
      const category = name.split('.')[0];
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(name);
    }

    console.log('\nTools by category:');
    for (const [category, toolList] of Object.entries(categories)) {
      console.log(`  ${category}: ${toolList.length} tools`);
      toolList.forEach((tool) => console.log(`    - ${tool}`));
    }

    // Test a few tools that don't require external dependencies
    console.log('\nTesting sample tools:');

    // Test cache initialize
    if (tools['cache.initialize']) {
      try {
        console.log('Testing cache.initialize...');
        const result = await tools['cache.initialize'].execute({}, {});
        console.log('✓ cache.initialize works:', typeof result);
      } catch (error) {
        console.log('✗ cache.initialize failed:', error.message);
      }
    }

    // Test ollama listModels
    if (tools['ollama.listModels']) {
      try {
        console.log('Testing ollama.listModels...');
        const result = await tools['ollama.listModels'].execute({}, {});
        console.log('✓ ollama.listModels works:', typeof result);
      } catch (error) {
        console.log('✗ ollama.listModels failed:', error.message);
      }
    }

    // Test sessions list
    if (tools['sessions.list']) {
      try {
        console.log('Testing sessions.list...');
        const result = await tools['sessions.list'].execute({}, {});
        console.log('✓ sessions.list works:', typeof result);
      } catch (error) {
        console.log('✗ sessions.list failed:', error.message);
      }
    }
  } catch (error) {
    console.error('Failed to create plugin:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAllTools();
