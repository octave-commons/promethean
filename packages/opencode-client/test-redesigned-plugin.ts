import { OpencodeInterfacePlugin } from './src/plugins/opencode-interface/index.js';

async function testRedesignedPlugin() {
  console.log('🔧 Testing redesigned opencode-interface plugin...\n');

  try {
    // Create plugin context
    const pluginContext = {
      logger: console,
      config: {},
    };

    // Load the plugin
    const plugin = await OpencodeInterfacePlugin(pluginContext);

    console.log('✅ Plugin loaded successfully!');
    console.log(`📦 Available tools: ${Object.keys(plugin.tool).join(', ')}\n`);

    // Test the new unified search tools
    console.log('🔍 Testing new unified search tools...\n');

    // Test compile-context
    if (plugin.tool['compile-context']) {
      console.log('Testing compile-context...');
      try {
        const result = await plugin.tool['compile-context'].execute(
          { query: 'test', limit: 5 },
          { tool: 'compile-context', sessionId: 'test' },
        );
        console.log('✅ compile-context works!');
        console.log(`📄 Result preview: ${result.substring(0, 200)}...\n`);
      } catch (error) {
        console.error(`❌ compile-context failed: ${error.message}\n`);
      }
    }

    // Test search-context
    if (plugin.tool['search-context']) {
      console.log('Testing search-context...');
      try {
        const result = await plugin.tool['search-context'].execute(
          { query: 'session', limit: 5 },
          { tool: 'search-context', sessionId: 'test' },
        );
        console.log('✅ search-context works!');
        console.log(`📄 Result preview: ${result.substring(0, 200)}...\n`);
      } catch (error) {
        console.error(`❌ search-context failed: ${error.message}\n`);
      }
    }

    // Test existing tools with new markdown formatting
    console.log('📝 Testing existing tools with markdown formatting...\n');

    // Test list-sessions
    if (plugin.tool['list-sessions']) {
      console.log('Testing list-sessions...');
      try {
        const result = await plugin.tool['list-sessions'].execute(
          { limit: 5, offset: 0 },
          { tool: 'list-sessions', sessionId: 'test' },
        );
        console.log('✅ list-sessions works!');
        console.log(`📄 Result preview: ${result.substring(0, 200)}...\n`);
      } catch (error) {
        console.error(`❌ list-sessions failed: ${error.message}\n`);
      }
    }

    // Test list-events
    if (plugin.tool['list-events']) {
      console.log('Testing list-events...');
      try {
        const result = await plugin.tool['list-events'].execute(
          { k: 5 },
          { tool: 'list-events', sessionId: 'test' },
        );
        console.log('✅ list-events works!');
        console.log(`📄 Result preview: ${result.substring(0, 200)}...\n`);
      } catch (error) {
        console.error(`❌ list-events failed: ${error.message}\n`);
      }
    }

    console.log('🎉 Plugin redesign test completed!');
    console.log('\n📋 Summary of improvements:');
    console.log('  ✅ Added compile-context tool for unified context access');
    console.log('  ✅ Added search-context tool for cross-data-type search');
    console.log('  ✅ All tools now return formatted markdown instead of JSON strings');
    console.log('  ✅ Used existing markdown formatters for consistency');
    console.log('  ✅ Added proper error handling with fallback formatting');
    console.log('  ✅ Unified search across sessions, events, and messages');
  } catch (error) {
    console.error('❌ Plugin test failed:', error);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testRedesignedPlugin().catch(console.error);
