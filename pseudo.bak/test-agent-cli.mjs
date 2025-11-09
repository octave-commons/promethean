#!/usr/bin/env node

// Test script for agent-cli commands with proper store initialization
import { initializeStores, sessionStore, agentTaskStore } from './dist/index.js';
import { DualStoreManager } from '@promethean/persistence';

async function initializeTestStores() {
  console.log('🔧 Initializing test stores...');
  try {
    const testSessionStore = await DualStoreManager.create('test-sessions', 'text', 'timestamp');
    const testAgentTaskStore = await DualStoreManager.create(
      'test-agent-tasks',
      'text',
      'timestamp',
    );

    initializeStores(testSessionStore, testAgentTaskStore);
    console.log('✅ Test stores initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize test stores:', error.message);
    return false;
  }
}

async function testCommand(command, args = []) {
  console.log(`\n🧪 Testing: agent-cli ${command} ${args.join(' ')}`);
  try {
    const { spawn } = await import('child_process');
    const result = await new Promise((resolve, reject) => {
      const proc = spawn('node', ['dist/cli/AgentCLI.js', command, ...args], {
        cwd: process.cwd(),
        stdio: 'pipe',
        env: { ...process.env, OPENCODE_DEBUG: '1' },
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        resolve({ code, stdout, stderr });
      });

      proc.on('error', reject);
    });

    console.log('Exit code:', result.code);
    if (result.stdout) console.log('STDOUT:', result.stdout);
    if (result.stderr) console.log('STDERR:', result.stderr);

    return result.code === 0;
  } catch (error) {
    console.error('❌ Command failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Agent CLI Command Tests\n');

  // Initialize stores first
  const initialized = await initializeTestStores();
  if (!initialized) {
    console.log('❌ Cannot proceed without store initialization');
    process.exit(1);
  }

  const tests = [
    { command: 'list', description: 'List sessions' },
    { command: 'stats', description: 'Show statistics' },
    { command: 'create', args: ['Test task for validation'], description: 'Create session' },
    { command: 'help', description: 'Show help' },
  ];

  const results = [];

  for (const test of tests) {
    const success = await testCommand(test.command, test.args || []);
    results.push({ ...test, success });
  }

  console.log('\n📊 Test Results Summary:');
  console.log('─'.repeat(50));

  let passed = 0;
  let failed = 0;

  results.forEach((result) => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.description} (${result.command})`);
    if (result.success) passed++;
    else failed++;
  });

  console.log('─'.repeat(50));
  console.log(`Total: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    console.log('\n⚠️  Some tests failed. Check the output above for details.');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed!');
  }
}

runTests().catch(console.error);
