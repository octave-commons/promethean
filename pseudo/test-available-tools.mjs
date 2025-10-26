#!/usr/bin/env node

// Test to see what tools are actually available
import { AllToolsPlugin } from './dist/plugins/index.js';

async function testAvailableTools() {
  console.log('🔍 Checking Available Tools\n');

  try {
    const pluginTools = await AllToolsPlugin({
      session: {
        get: async () => ({ data: {} }),
      },
    });

    console.log('📋 All Available Tools:');
    console.log('─'.repeat(40));

    if (pluginTools.tool) {
      const toolNames = Object.keys(pluginTools.tool);
      if (toolNames.length === 0) {
        console.log('No tools found');
      } else {
        toolNames.forEach((toolName) => {
          console.log(`✅ ${toolName}`);
        });
        console.log(`\n📈 Total tools: ${toolNames.length}`);
      }
    } else {
      console.log('No tool object found in plugin');
    }

    // Check for hooks
    console.log('\n🪝 Available Hooks:');
    console.log('─'.repeat(40));
    const hookNames = Object.keys(pluginTools).filter((key) => key !== 'tool');
    if (hookNames.length === 0) {
      console.log('No hooks found');
    } else {
      hookNames.forEach((hookName) => {
        console.log(`✅ ${hookName}`);
      });
      console.log(`\n📈 Total hooks: ${hookNames.length}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAvailableTools();
