#!/usr/bin/env tsx

// Test plugin tool execution with actual API calls
console.log('Testing plugin tool execution...');

try {
  const { OpencodeInterfacePlugin } = await import('./src/plugins/opencode-interface/index.js');

  // Execute plugin with minimal context
  const plugin = await OpencodeInterfacePlugin({} as any);

  if (plugin.tool?.['list-sessions']) {
    console.log('Testing list-sessions tool with actual API call...');

    // This should work since it uses local actions, not the API client
    const result = await plugin.tool['list-sessions'].execute({
      limit: 2,
      offset: 0,
      format: 'json',
    });

    console.log('Result type:', typeof result);
    console.log('Result length:', result?.length || 'N/A');

    if (typeof result === 'string') {
      try {
        const parsed = JSON.parse(result);
        console.log('Parsed result keys:', Object.keys(parsed));
        if (parsed.sessions) {
          console.log('Sessions count:', parsed.sessions.length);
        }
      } catch (e) {
        console.log('Result is not valid JSON, first 200 chars:', result.substring(0, 200));
      }
    } else {
      console.log('Result is not a string:', result);
    }
  } else {
    console.log('list-sessions tool not found');
  }
} catch (error) {
  console.error('Error:', error);
  console.error('Message:', error instanceof Error ? error.message : String(error));
}

export {};
