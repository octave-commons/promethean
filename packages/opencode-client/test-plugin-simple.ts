#!/usr/bin/env tsx

// Simple test to check if opencode-interface plugin can be loaded
console.log('Starting plugin test...');

try {
  // First test: Can we import the plugin?
  const { OpencodeInterfacePlugin } = await import('./src/plugins/opencode-interface/index.js');
  console.log('✓ Plugin imported successfully');
  console.log('Plugin function type:', typeof OpencodeInterfacePlugin);

  // Second test: Can we call the plugin function?
  // Note: This might fail due to missing dependencies, but we can catch the error
  try {
    const pluginResult = await OpencodeInterfacePlugin({} as any);
    console.log('✓ Plugin function executed');
    console.log('Plugin result type:', typeof pluginResult);
    console.log('Has tools:', !!pluginResult.tool);
    if (pluginResult.tool) {
      console.log('Available tools:', Object.keys(pluginResult.tool));
    }
  } catch (pluginError) {
    console.log('⚠ Plugin function failed (expected due to missing context):');
    console.log('Error:', pluginError instanceof Error ? pluginError.message : String(pluginError));
  }

  console.log('✓ Basic plugin structure test completed');
} catch (importError) {
  console.error('✗ Failed to import plugin:');
  console.error('Error:', importError instanceof Error ? importError.message : String(importError));
  if (importError instanceof Error && importError.stack) {
    console.error('Stack:', importError.stack);
  }
}
