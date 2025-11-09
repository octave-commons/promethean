#!/usr/bin/env node

// Comprehensive API validation test script
import { AllToolsPlugin } from './dist/plugins/index.js';

async function testAPIValidation() {
  console.log('🔬 Starting API Validation Tests\n');

  // Initialize plugins
  let pluginTools;
  try {
    pluginTools = await AllToolsPlugin({
      // Mock context for testing
      session: {
        get: async () => ({ data: {} }),
      },
    });
    console.log('✅ Plugins initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize plugins:', error.message);
    return;
  }

  const results = [];

  // Test Cache API
  console.log('\n📦 Testing Cache API...');
  try {
    if (pluginTools.tool.cache_clear) {
      console.log('✅ cache_clear tool available');
      results.push({ tool: 'cache_clear', status: 'available' });
    }
    if (pluginTools.tool.cache_get) {
      console.log('✅ cache_get tool available');
      results.push({ tool: 'cache_get', status: 'available' });
    }
    if (pluginTools.tool.cache_list) {
      console.log('✅ cache_list tool available');
      results.push({ tool: 'cache_list', status: 'available' });
    }
    if (pluginTools.tool.cache_set) {
      console.log('✅ cache_set tool available');
      results.push({ tool: 'cache_set', status: 'available' });
    }
  } catch (error) {
    console.error('❌ Cache API test failed:', error.message);
    results.push({ tool: 'cache', status: 'error', error: error.message });
  }

  // Test Events API
  console.log('\n📡 Testing Events API...');
  try {
    if (pluginTools.tool.events_list) {
      console.log('✅ events_list tool available');
      results.push({ tool: 'events_list', status: 'available' });
    }
    if (pluginTools.tool.events_subscribe) {
      console.log('✅ events_subscribe tool available');
      results.push({ tool: 'events_subscribe', status: 'available' });
    }
  } catch (error) {
    console.error('❌ Events API test failed:', error.message);
    results.push({ tool: 'events', status: 'error', error: error.message });
  }

  // Test Ollama API
  console.log('\n🤖 Testing Ollama API...');
  try {
    const ollamaTools = [
      'ollama_submit',
      'ollama_list',
      'ollama_status',
      'ollama_result',
      'ollama_cancel',
      'ollama_models',
      'ollama_info',
      'ollama_cache',
    ];

    ollamaTools.forEach((tool) => {
      if (pluginTools.tool[tool]) {
        console.log(`✅ ${tool} tool available`);
        results.push({ tool, status: 'available' });
      } else {
        console.log(`⚠️  ${tool} tool not found`);
        results.push({ tool, status: 'missing' });
      }
    });
  } catch (error) {
    console.error('❌ Ollama API test failed:', error.message);
    results.push({ tool: 'ollama', status: 'error', error: error.message });
  }

  // Test Agent Management API
  console.log('\n👥 Testing Agent Management API...');
  try {
    const agentTools = [
      'agent_createSession',
      'agent_startSession',
      'agent_stopSession',
      'agent_sendMessage',
      'agent_closeSession',
      'agent_listSessions',
      'agent_getSession',
      'agent_getStats',
      'agent_cleanup',
    ];

    agentTools.forEach((tool) => {
      if (pluginTools.tool[tool]) {
        console.log(`✅ ${tool} tool available`);
        results.push({ tool, status: 'available' });
      } else {
        console.log(`⚠️  ${tool} tool not found`);
        results.push({ tool, status: 'missing' });
      }
    });
  } catch (error) {
    console.error('❌ Agent Management API test failed:', error.message);
    results.push({ tool: 'agent-management', status: 'error', error: error.message });
  }

  // Test Sessions API
  console.log('\n🗂️  Testing Sessions API...');
  try {
    const sessionTools = [
      'sessions_create',
      'sessions_get',
      'sessions_update',
      'sessions_close',
      'sessions_list',
    ];

    sessionTools.forEach((tool) => {
      if (pluginTools.tool[tool]) {
        console.log(`✅ ${tool} tool available`);
        results.push({ tool, status: 'available' });
      } else {
        console.log(`⚠️  ${tool} tool not found`);
        results.push({ tool, status: 'missing' });
      }
    });
  } catch (error) {
    console.error('❌ Sessions API test failed:', error.message);
    results.push({ tool: 'sessions', status: 'error', error: error.message });
  }

  // Test Tasks API
  console.log('\n📋 Testing Tasks API...');
  try {
    const taskTools = [
      'tasks_create',
      'tasks_get',
      'tasks_update',
      'tasks_delete',
      'tasks_list',
      'tasks_search',
      'tasks_complete',
      'tasks_fail',
    ];

    taskTools.forEach((tool) => {
      if (pluginTools.tool[tool]) {
        console.log(`✅ ${tool} tool available`);
        results.push({ tool, status: 'available' });
      } else {
        console.log(`⚠️  ${tool} tool not found`);
        results.push({ tool, status: 'missing' });
      }
    });
  } catch (error) {
    console.error('❌ Tasks API test failed:', error.message);
    results.push({ tool: 'tasks', status: 'error', error: error.message });
  }

  // Test Process API
  console.log('\n⚙️  Testing Process API...');
  try {
    const processTools = [
      'process_start',
      'process_stop',
      'process_status',
      'process_list',
      'process_restart',
      'process_logs',
    ];

    processTools.forEach((tool) => {
      if (pluginTools.tool[tool]) {
        console.log(`✅ ${tool} tool available`);
        results.push({ tool, status: 'available' });
      } else {
        console.log(`⚠️  ${tool} tool not found`);
        results.push({ tool, status: 'missing' });
      }
    });
  } catch (error) {
    console.error('❌ Process API test failed:', error.message);
    results.push({ tool: 'process', status: 'error', error: error.message });
  }

  // Summary
  console.log('\n📊 API Validation Summary');
  console.log('─'.repeat(50));

  const available = results.filter((r) => r.status === 'available').length;
  const missing = results.filter((r) => r.status === 'missing').length;
  const errors = results.filter((r) => r.status === 'error').length;

  console.log(`✅ Available: ${available}`);
  console.log(`⚠️  Missing: ${missing}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`📈 Total: ${results.length}`);

  if (missing > 0) {
    console.log('\n⚠️  Missing tools:');
    results
      .filter((r) => r.status === 'missing')
      .forEach((r) => {
        console.log(`   - ${r.tool}`);
      });
  }

  if (errors > 0) {
    console.log('\n❌ Errors:');
    results
      .filter((r) => r.status === 'error')
      .forEach((r) => {
        console.log(`   - ${r.tool}: ${r.error}`);
      });
  }

  console.log('\n🎯 Validation Complete!');

  return {
    total: results.length,
    available,
    missing,
    errors,
    results,
  };
}

// Run the validation
testAPIValidation()
  .then((summary) => {
    console.log('\n✅ Test completed successfully');
    process.exit(summary.errors > 0 ? 1 : 0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
