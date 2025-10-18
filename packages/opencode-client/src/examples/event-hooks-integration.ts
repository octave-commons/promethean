// SPDX-License-Identifier: GPL-3.0-only
// Event Hooks Integration Example

/**
 * This example demonstrates how to use the EventHooksPlugin
 * to monitor and extend tool execution in OpenCode.
 */

import { EventHooksPlugin } from '../src/plugins/event-hooks.js';
import {
  hookManager,
  registerBeforeHook,
  registerAfterHook,
} from '../src/hooks/tool-execute-hooks.js';

async function demonstrateEventHooks() {
  console.log('🚀 Event Hooks Integration Example');
  console.log('=====================================');

  // 1. Register some example hooks
  console.log('\n📝 Registering example hooks...');

  // Security logging hook
  registerBeforeHook(
    'security-audit',
    async (context) => {
      console.log(`🔒 Security audit: ${context.metadata?.originalTool || 'unknown tool'}`);
      console.log(`   Args: ${JSON.stringify(context.args)}`);
      return context.args;
    },
    {
      tools: ['*'], // Monitor all tools
      priority: 1,
      timeout: 5000,
    },
  );

  // Performance monitoring hook
  registerAfterHook(
    'performance-monitor',
    async (context) => {
      const execTime = context.result.executionTime || 0;
      console.log(
        `⚡ Performance: ${context.metadata?.originalTool || 'unknown tool'} took ${execTime}ms`,
      );
      return context.result;
    },
    {
      tools: ['*'],
      priority: 10,
      timeout: 3000,
    },
  );

  // Tool-specific enhancement hook
  registerAfterHook(
    'result-enhancer',
    async (context) => {
      if (context.metadata?.originalTool === 'example.tool') {
        return {
          ...context.result,
          enhanced: true,
          timestamp: new Date().toISOString(),
        };
      }
      return context.result;
    },
    {
      tools: ['example.tool'],
      priority: 5,
      timeout: 2000,
    },
  );

  // 4. Show final statistics
  console.log('\n📈 Final hook statistics:');
  const finalStats = hookManager.getStatistics();
  console.log(JSON.stringify(finalStats, null, 2));

  console.log('\n✅ Event hooks integration example completed!');
  console.log('\n💡 In a real OpenCode environment:');
  console.log('   - The EventHooksPlugin would automatically hook into tool execution');
  console.log('   - Security, performance, and enhancement hooks would run transparently');
  console.log('   - All hooks would be observable through the plugin tools');
}

// Example of how to use the EventHooksPlugin in OpenCode
export function createOpenCodeConfig() {
  return {
    plugins: [
      {
        name: 'event-hooks',
        plugin: EventHooksPlugin,
        config: {
          // Plugin configuration options
          enableLogging: true,
          defaultTimeout: 5000,
        },
      },
    ],
  };
}

// Run the example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateEventHooks().catch(console.error);
}
