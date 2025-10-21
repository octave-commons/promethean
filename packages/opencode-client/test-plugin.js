// Simple test script to verify the plugin works
import { OpencodeInterfacePlugin } from './dist/plugins/opencode-interface/index.js';

async function testPlugin() {
  try {
    console.log('Testing plugin import...');

    const mockContext = {
      client: {},
      project: { name: 'test' },
      directory: '/tmp',
      worktree: {},
      $: {},
    };

    console.log('Initializing plugin...');
    const plugin = await OpencodeInterfacePlugin(mockContext);

    console.log('Plugin initialized successfully!');
    console.log('Available tools:', Object.keys(plugin.tool || {}));

    // Test a simple tool call
    if (plugin.tool && plugin.tool['list-sessions']) {
      console.log('Testing list-sessions tool...');
      try {
        const result = await plugin.tool['list-sessions'].execute({ limit: 5, format: 'json' });
        console.log('Tool executed successfully:', result.substring(0, 100) + '...');
      } catch (error) {
        console.log('Tool execution failed (expected if no server running):', error.message);
      }
    }

    console.log('Plugin test completed successfully!');
  } catch (error) {
    console.error('Plugin test failed:', error);
    process.exit(1);
  }
}

testPlugin();
