#!/usr/bin/env tsx

// Test script to debug opencode-interface plugin connection
import { OpencodeInterfacePlugin } from './src/plugins/opencode-interface/index.js';

console.log('Testing OpencodeInterfacePlugin...');

try {
  // Test with minimal context - the plugin should handle missing context gracefully
  const plugin = await OpencodeInterfacePlugin({} as any);
  console.log('Plugin loaded successfully:', typeof plugin);
  console.log('Available tools:', Object.keys(plugin.tool || {}));
  
  // Test the list-sessions tool
  if (plugin.tool?.['list-sessions']) {
    console.log('Testing list-sessions tool...');
    const result = await plugin.tool['list-sessions'].execute({
      limit: 5,
      offset: 0,
      format: 'json'
    });
    console.log('list-sessions result (first 200 chars):', typeof result === 'string' ? result.substring(0, 200) : result);
  } else {
    console.log('list-sessions tool not found');
  }
} catch (error) {
  console.error('Error testing plugin:', error);
  console.error('Stack:', error instanceof Error ? error.stack : 'No stack available');
}
} catch (error) {
  console.error('Error testing plugin:', error);
  console.error('Stack:', error instanceof Error ? error.stack : 'No stack available');
}
