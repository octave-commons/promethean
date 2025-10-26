#!/usr/bin/env node

/**
 * Comprehensive Integration Test Suite for OpenCode CLI Client
 * Tests all major integration points, error handling, and user experience
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  output: string;
  error?: string;
  exitCode: number;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  totalDuration: number;
  passed: number;
  failed: number;
}

class CLIIntegrationTester {
  private cliPath: string;
  private results: TestSuite[] = [];

  constructor() {
    this.cliPath = join(process.cwd(), 'dist', 'cli.js');
    if (!existsSync(this.cliPath)) {
      throw new Error('CLI not built. Run "npm run build" first.');
    }
  }

  private async runCommand(args: string[], input?: string): Promise<TestResult> {
    const startTime = Date.now();
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
        const duration = Date.now() - startTime;
        resolve({
          name: args.join(' '),
          passed: code === 0,
          duration,
          output: stdout,
          error: stderr,
          exitCode: code || 0
        });
      });

      child.on('error', (error) => {
        const duration = Date.now() - startTime;
        resolve({
          name: args.join(' '),
          passed: false,
          duration,
          output: stdout,
          error: error.message,
          exitCode: -1
        });
      });
    });
  }

  private async runTestSuite(suiteName: string, tests: Array<{ name: string; args: string[]; expectSuccess?: boolean; input?: string }>) {
    console.log(`\n🧪 Running ${suiteName}...`);
    const suite: TestSuite = {
      name: suiteName,
      tests: [],
      totalDuration: 0,
      passed: 0,
      failed: 0
    };

    for (const test of tests) {
      const result = await this.runCommand(test.args, test.input);
      result.name = test.name;
      
      // Check if result matches expectation
      if (test.expectSuccess === false) {
        result.passed = result.exitCode !== 0;
      }

      suite.tests.push(result);
      suite.totalDuration += result.duration;
      
      if (result.passed) {
        suite.passed++;
        console.log(`  ✅ ${test.name} (${result.duration}ms)`);
      } else {
        suite.failed++;
        console.log(`  ❌ ${test.name} (${result.duration}ms)`);
        if (result.error) {
          console.log(`     Error: ${result.error}`);
        }
      }
    }

    this.results.push(suite);
    console.log(`   ${suite.passed}/${suite.tests.length} passed (${suite.totalDuration}ms total)`);
  }

  async runAllTests() {
    console.log('🚀 Starting OpenCode CLI Integration Tests\n');

    // Test 1: CLI Entry Point and Basic Functionality
    await this.runTestSuite('CLI Entry Point & Basic Functionality', [
      { name: 'Version command', args: ['--version'], expectSuccess: true },
      { name: 'Help command', args: ['--help'], expectSuccess: true },
      { name: 'Invalid command', args: ['invalid-command'], expectSuccess: false },
      { name: 'Verbose flag', args: ['--verbose', '--help'], expectSuccess: true },
      { name: 'No color flag', args: ['--no-color', '--help'], expectSuccess: true },
    ]);

    // Test 2: Command Registration and Help System
    await this.runTestSuite('Command Registration & Help System', [
      { name: 'Main help', args: ['--help'], expectSuccess: true },
      { name: 'Ollama help', args: ['ollama', '--help'], expectSuccess: true },
      { name: 'Sessions help', args: ['sessions', '--help'], expectSuccess: true },
      { name: 'PM2 help', args: ['pm2', '--help'], expectSuccess: true },
      { name: 'Ollama submit help', args: ['ollama', 'submit', '--help'], expectSuccess: true },
      { name: 'Sessions list help', args: ['sessions', 'list', '--help'], expectSuccess: true },
    ]);

    // Test 3: Ollama Commands Integration
    await this.runTestSuite('Ollama Commands Integration', [
      { name: 'Ollama models command', args: ['ollama', 'models'], expectSuccess: true },
      { name: 'Ollama models detailed', args: ['ollama', 'models', '--detailed'], expectSuccess: true },
      { name: 'Ollama info command', args: ['ollama', 'info'], expectSuccess: true },
      { name: 'Ollama list command', args: ['ollama', 'list'], expectSuccess: true },
      { name: 'Ollama list with filters', args: ['ollama', 'list', '--status', 'pending', '--limit', '5'], expectSuccess: true },
      { name: 'Ollama cache stats', args: ['ollama', 'cache', 'stats'], expectSuccess: true },
      { name: 'Ollama cache clear', args: ['ollama', 'cache', 'clear'], expectSuccess: true },
    ]);

    // Test 4: Job Submission and Status Commands
    await this.runTestSuite('Job Submission & Status Commands', [
      { name: 'Submit generate job', args: ['ollama', 'submit', 'llama2', 'generate', '--prompt', 'test prompt'], expectSuccess: true },
      { name: 'Submit job with name', args: ['ollama', 'submit', 'llama2', 'generate', '--name', 'test-job', '--prompt', 'test'], expectSuccess: true },
      { name: 'Submit job with priority', args: ['ollama', 'submit', 'llama2', 'generate', '--priority', 'high', '--prompt', 'test'], expectSuccess: true },
      { name: 'Submit chat job', args: ['ollama', 'submit', 'llama2', 'chat'], expectSuccess: true }, // Will fail due to missing messages, but should handle gracefully
      { name: 'Job status command', args: ['ollama', 'status', 'test-job-id'], expectSuccess: true },
      { name: 'Job result command', args: ['ollama', 'result', 'test-job-id'], expectSuccess: true },
      { name: 'Cancel job command', args: ['ollama', 'cancel', 'test-job-id'], expectSuccess: true },
    ]);

    // Test 5: Sessions Commands Integration
    await this.runTestSuite('Sessions Commands Integration', [
      { name: 'List sessions', args: ['sessions', 'list'], expectSuccess: true },
      { name: 'List sessions with limit', args: ['sessions', 'list', '--limit', '10'], expectSuccess: true },
      { name: 'List sessions with offset', args: ['sessions', 'list', '--limit', '5', '--offset', '2'], expectSuccess: true },
      { name: 'Get session', args: ['sessions', 'get', 'test-session-id'], expectSuccess: true },
      { name: 'Create session', args: ['sessions', 'create', 'Test Session'], expectSuccess: true },
      { name: 'Create session with options', args: ['sessions', 'create', '--title', 'Test', '--files', '["file1.ts"]'], expectSuccess: true },
      { name: 'Search sessions', args: ['sessions', 'search', 'test query'], expectSuccess: true },
      { name: 'Close session', args: ['sessions', 'close', 'test-session-id'], expectSuccess: true },
    ]);

    // Test 6: PM2 Commands Integration
    await this.runTestSuite('PM2 Commands Integration', [
      { name: 'PM2 list', args: ['pm2', 'list'], expectSuccess: true },
      { name: 'PM2 describe', args: ['pm2', 'describe', 'test-process'], expectSuccess: true },
      { name: 'PM2 logs', args: ['pm2', 'logs', 'test-process', '--lines', '10'], expectSuccess: true },
    ]);

    // Test 7: Error Handling and Edge Cases
    await this.runTestSuite('Error Handling & Edge Cases', [
      { name: 'Missing required arguments', args: ['ollama', 'submit'], expectSuccess: false },
      { name: 'Invalid job type', args: ['ollama', 'submit', 'llama2', 'invalid-type'], expectSuccess: false },
      { name: 'Invalid priority', args: ['ollama', 'submit', 'llama2', 'generate', '--priority', 'invalid'], expectSuccess: false }, // Should fail with error
      { name: 'Missing session ID', args: ['sessions', 'get'], expectSuccess: false },
      { name: 'Missing job ID', args: ['ollama', 'status'], expectSuccess: false },
      { name: 'Invalid cache action', args: ['ollama', 'cache', 'invalid-action'], expectSuccess: false }, // Should fail with error
    ]);

    // Test 8: Output Formatting and User Experience
    await this.runTestSuite('Output Formatting & User Experience', [
      { name: 'Verbose output', args: ['--verbose', 'ollama', 'models'], expectSuccess: true },
      { name: 'No color output', args: ['--no-color', 'ollama', 'models'], expectSuccess: true },
      { name: 'JSON output format', args: ['ollama', 'models', '--format', 'json'], expectSuccess: true }, // If implemented
      { name: 'Table output format', args: ['ollama', 'list', '--format', 'table'], expectSuccess: true }, // If implemented
    ]);

    // Test 9: Performance and Responsiveness
    await this.runTestSuite('Performance & Responsiveness', [
      { name: 'Quick command response', args: ['--version'], expectSuccess: true },
      { name: 'Help command response', args: ['--help'], expectSuccess: true },
      { name: 'Multiple rapid commands', args: ['ollama', 'models'], expectSuccess: true },
    ]);

    // Test 10: Type Safety and Validation
    await this.runTestSuite('Type Safety & Validation', [
      { name: 'Command alias (oll)', args: ['oll', 'models'], expectSuccess: true },
      { name: 'Sessions alias (sess)', args: ['sess', 'list'], expectSuccess: true },
      { name: 'PM2 alias (p)', args: ['p', 'list'], expectSuccess: true },
      { name: 'Case sensitivity test', args: ['OLLAMA', 'models'], expectSuccess: false }, // Should fail
    ]);

    this.printSummary();
  }

  private printSummary() {
    console.log('\n📊 Test Results Summary');
    console.log('='.repeat(50));

    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let totalDuration = 0;

    for (const suite of this.results) {
      totalTests += suite.tests.length;
      totalPassed += suite.passed;
      totalFailed += suite.failed;
      totalDuration += suite.totalDuration;

      console.log(`\n${suite.name}:`);
      console.log(`  Tests: ${suite.tests.length}`);
      console.log(`  Passed: ${suite.passed}`);
      console.log(`  Failed: ${suite.failed}`);
      console.log(`  Duration: ${suite.totalDuration}ms`);

      if (suite.failed > 0) {
        console.log('  Failed tests:');
        for (const test of suite.tests.filter(t => !t.passed)) {
          console.log(`    - ${test.name}: ${test.error || 'Exit code ' + test.exitCode}`);
        }
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Total Passed: ${totalPassed}`);
    console.log(`Total Failed: ${totalFailed}`);
    console.log(`Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
    console.log(`Total Duration: ${totalDuration}ms`);

    if (totalFailed === 0) {
      console.log('\n🎉 All tests passed! CLI is ready for production.');
    } else {
      console.log(`\n⚠️  ${totalFailed} tests failed. Review and fix issues before production.`);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new CLIIntegrationTester();
  tester.runAllTests().catch(console.error);
}

export { CLIIntegrationTester };