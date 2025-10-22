#!/usr/bin/env node

/**
 * Edge Case Testing for OpenCode CLI Client
 * Tests unusual scenarios, boundary conditions, and stress testing
 */

import { spawn } from 'child_process';
import { join } from 'path';

class EdgeCaseTester {
  private cliPath: string;

  constructor() {
    this.cliPath = join(process.cwd(), 'dist', 'cli.js');
  }

  private async runCommand(args: string[], input?: string): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    return new Promise((resolve) => {
      const child = spawn('node', [this.cliPath, ...args], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, NODE_ENV: 'test' }
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      if (input) {
        child.stdin?.write(input);
        child.stdin?.end();
      }

      child.on('close', (code) => {
        resolve({ stdout, stderr, exitCode: code || 0 });
      });
    });
  }

  async runEdgeCaseTests() {
    console.log('🔬 Running Edge Case Tests...\n');

    // Test 1: Very long arguments
    console.log('Testing very long arguments...');
    const longPrompt = 'a'.repeat(10000);
    const result1 = await this.runCommand(['ollama', 'submit', 'llama2', 'generate', '--prompt', longPrompt]);
    console.log(`Long prompt test: ${result1.exitCode === 0 ? '✅' : '❌'}`);

    // Test 2: Special characters in arguments
    console.log('Testing special characters...');
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?`~"\'\\';
    const result2 = await this.runCommand(['sessions', 'create', `Test with ${specialChars}`]);
    console.log(`Special chars test: ${result2.exitCode === 0 ? '✅' : '❌'}`);

    // Test 3: Unicode characters
    console.log('Testing Unicode characters...');
    const unicode = '🚀 Test with émojis and ñiño';
    const result3 = await this.runCommand(['sessions', 'create', unicode]);
    console.log(`Unicode test: ${result3.exitCode === 0 ? '✅' : '❌'}`);

    // Test 4: Rapid successive commands
    console.log('Testing rapid successive commands...');
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(this.runCommand(['--version']));
    }
    const results = await Promise.all(promises);
    const allSuccess = results.every(r => r.exitCode === 0);
    console.log(`Rapid commands test: ${allSuccess ? '✅' : '❌'}`);

    // Test 5: Invalid JSON in options
    console.log('Testing invalid JSON...');
    const result5 = await this.runCommand(['sessions', 'create', '--files', 'invalid-json']);
    console.log(`Invalid JSON test: ${result5.exitCode !== 0 ? '✅' : '❌'}`);

    // Test 6: Empty strings
    console.log('Testing empty strings...');
    const result6 = await this.runCommand(['ollama', 'submit', 'llama2', 'generate', '--prompt', '']);
    console.log(`Empty prompt test: ${result6.exitCode === 0 ? '✅' : '❌'}`);

    // Test 7: Numeric limits
    console.log('Testing numeric limits...');
    const result7 = await this.runCommand(['sessions', 'list', '--limit', '999999']);
    console.log(`Large limit test: ${result7.exitCode === 0 ? '✅' : '❌'}`);

    // Test 8: Negative numbers
    console.log('Testing negative numbers...');
    const result8 = await this.runCommand(['sessions', 'list', '--limit', '-1']);
    console.log(`Negative limit test: ${result8.exitCode === 0 ? '✅' : '❌'}`);

    // Test 9: Concurrent operations
    console.log('Testing concurrent operations...');
    const concurrentPromises = [
      this.runCommand(['ollama', 'models']),
      this.runCommand(['sessions', 'list']),
      this.runCommand(['pm2', 'list']),
      this.runCommand(['ollama', 'info']),
    ];
    const concurrentResults = await Promise.all(concurrentPromises);
    const concurrentSuccess = concurrentResults.every(r => r.exitCode === 0);
    console.log(`Concurrent operations test: ${concurrentSuccess ? '✅' : '❌'}`);

    // Test 10: Environment variable handling
    console.log('Testing environment variables...');
    const envTest = spawn('node', [this.cliPath, '--version'], {
      env: { ...process.env, OPENCODE_SERVER_URL: 'http://invalid-url:1234' },
      stdio: 'pipe'
    });
    
    let envStdout = '';
    envTest.stdout?.on('data', (data) => {
      envStdout += data.toString();
    });
    
    await new Promise(resolve => {
      envTest.on('close', resolve);
    });
    
    console.log(`Environment variable test: ${envStdout.includes('1.0.0') ? '✅' : '❌'}`);

    console.log('\n🏁 Edge case testing completed!');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new EdgeCaseTester();
  tester.runEdgeCaseTests().catch(console.error);
}

export { EdgeCaseTester };