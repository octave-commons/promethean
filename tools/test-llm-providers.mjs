#!/usr/bin/env node

import { MultiProviderLLM } from './llm-providers.mjs';

/**
 * Test script for LLM providers with fallback system
 */

async function testProviders() {
  console.log('🧪 Testing LLM Provider System\n');

  // Create multi-provider instance
  const llm = MultiProviderLLM.createFromConfig();

  console.log('📋 Available providers:');
  console.log('   - Ollama (local):', process.env.OLLAMA_ENABLED !== 'false' ? '✅ Enabled' : '❌ Disabled');
  console.log('   - OpenAI:', process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Not configured');
  console.log('   - ZAI:', process.env.ZAI_API_KEY && process.env.ZAI_BASE_URL ? '✅ Configured' : '❌ Not configured');
  console.log('   - OpenRouter:', process.env.OPENROUTER_API_KEY ? '✅ Configured' : '❌ Not configured');
  console.log('');

  // Test all providers
  const results = await llm.testAllProviders();

  if (results.length === 0) {
    console.log('❌ No LLM providers configured');
    console.log('');
    console.log('💡 To set up providers, configure these environment variables:');
    console.log('');
    console.log('🦙 Ollama (Local):');
    console.log('   export OLLAMA_ENABLED=true');
    console.log('   export OLLAMA_MODEL=qwen2.5-coder:7b');
    console.log('   # Make sure Ollama is running: ollama serve');
    console.log('');
    console.log('🤖 OpenAI:');
    console.log('   export OPENAI_API_KEY=your_api_key');
    console.log('   export OPENAI_MODEL=gpt-4  # optional');
    console.log('   export OPENAI_BASE_URL=https://api.openai.com/v1  # optional');
    console.log('');
    console.log('⚡ ZAI:');
    console.log('   export ZAI_API_KEY=your_api_key');
    console.log('   export ZAI_BASE_URL=your_base_url');
    console.log('   export ZAI_MODEL=qwen2.5-coder-7b-instruct  # optional');
    console.log('');
    console.log('🌐 OpenRouter:');
    console.log('   export OPENROUTER_API_KEY=your_api_key');
    console.log('   export OPENROUTER_MODEL=qwen/qwen-2.5-coder-7b-instruct  # optional');
    return;
  }

  // Test conflict resolution if we have available providers
  const availableProviders = results.filter(r => r.success);
  if (availableProviders.length > 0) {
    console.log('\n🔬 Testing conflict resolution...');

    const testConflict = `<<<<<<< HEAD
function calculateTotal(items, tax = 0.1) {
  // Original implementation
  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;
  }
=======
function calculateTotal(items, tax = 0.1, discount = 0) {
  // Enhanced implementation on main branch
  let total = 0;
  for (const item of items) {
    const itemTotal = item.price * item.quantity;
    total += itemTotal * (1 - discount);
  }
  return total * (1 + tax);
}`;

    try {
      console.log('Sending test conflict to available providers...');
      const resolved = await llm.resolveConflict(testConflict);

      if (resolved) {
        console.log('✅ Conflict resolution test successful!');
        console.log(`Provider used: ${llm.getCurrentProvider()}`);
        console.log('');
        console.log('Resolved content:');
        console.log('```');
        console.log(resolved);
        console.log('```');
      } else {
        console.log('❌ Conflict resolution test failed');
      }
    } catch (error) {
      console.log(`❌ Conflict resolution test failed: ${error.message}`);
    }
  }

  // Show fallback log
  const fallbackLog = llm.getFallbackLog();
  if (fallbackLog.length > 0) {
    console.log('\n🔄 Fallback Log:');
    fallbackLog.forEach(log => {
      console.log(`   ${log.provider}: ${log.error}`);
    });
  }
}

async function testEnvironmentSetup() {
  console.log('🔍 Checking environment setup...\n');

  const requiredVars = {
    'GitHub CLI': () => {
      try {
        const { execSync } = require('child_process');
        execSync('gh --version', { stdio: 'ignore' });
        return true;
      } catch {
        return false;
      }
    }
  };

  const optionalVars = {
    'Ollama': process.env.OLLAMA_ENABLED !== 'false',
    'OpenAI API': !!process.env.OPENAI_API_KEY,
    'ZAI API': !!(process.env.ZAI_API_KEY && process.env.ZAI_BASE_URL),
    'OpenRouter API': !!process.env.OPENROUTER_API_KEY
  };

  console.log('Required Dependencies:');
  for (const [name, available] of Object.entries(requiredVars)) {
    const status = available() ? '✅' : '❌';
    console.log(`   ${status} ${name}`);
  }

  console.log('\nOptional LLM Providers:');
  for (const [name, available] of Object.entries(optionalVars)) {
    const status = available ? '✅' : '❌';
    console.log(`   ${status} ${name}`);
  }
}

// Main execution
async function main() {
  await testEnvironmentSetup();
  console.log('');
  await testProviders();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}