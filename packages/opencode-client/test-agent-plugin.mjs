#!/usr/bin/env node

/**
 * Test script to verify agent management plugin works correctly
 */

import { AgentManagementPlugin } from './dist/plugins/agent-management.js';

async function testPlugin() {
  console.log('🧪 Testing Agent Management Plugin...\n');

  try {
    // Mock client context
    const mockClient = {
      request: async (tool, args) => {
        console.log(`📞 Mock client request: ${tool}`, args);
        return { success: true, data: 'mock response' };
      },
    };

    const mockContext = { client: mockClient };

    // Initialize plugin
    const plugin = await AgentManagementPlugin(mockContext);

    console.log('✅ Plugin initialized successfully');
    console.log('📋 Available tools:', Object.keys(plugin.tool));

    // Test creating a session
    console.log('\n🔧 Testing agent.createSession tool...');
    const result = await plugin.tool['agent.createSession'].execute(
      {
        task: 'Test task for plugin verification',
        initialMessage: 'Hello from plugin test!',
        autoStart: true,
      },
      mockContext,
    );

    console.log('📤 Result:', result);

    // Test listing sessions
    console.log('\n🔧 Testing agent.listSessions tool...');
    const listResult = await plugin.tool['agent.listSessions'].execute({}, mockContext);
    console.log('📤 List Result:', listResult);

    console.log('\n✅ Plugin test completed successfully!');
  } catch (error) {
    console.error('❌ Plugin test failed:', error);
    process.exit(1);
  }
}

testPlugin();
