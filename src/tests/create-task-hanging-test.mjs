#!/usr/bin/env node

/**
 * E2E Test for pnpm kanban create hanging bug
 *
 * This test creates an isolated environment to reproduce the hanging issue
 * and identify exactly where the process gets stuck.
 */

import { execSync, spawn } from 'node:child_process';
import { realpath, mkdtemp, rm, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { setTimeout } from 'node:timers/promises';

const TEST_TIMEOUT = 30000; // 30 seconds timeout
const LOG_PREFIX = '[KANBAN-TEST]';

class TestLogger {
  constructor(testId) {
    this.testId = testId;
  }

  log(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`${LOG_PREFIX} [${timestamp}] ${message}`);
    if (data) {
      console.log(`${LOG_PREFIX} [${timestamp}] DATA:`, JSON.stringify(data, null, 2));
    }
  }

  error(message, error = null) {
    const timestamp = new Date().toISOString();
    console.error(`${LOG_PREFIX} [${timestamp}] ERROR: ${message}`);
    if (error) {
      console.error(`${LOG_PREFIX} [${timestamp}] ERROR DETAILS:`, error);
    }
  }
}

class KanbanCreateTest {
  constructor() {
    this.testId = `test-${Date.now()}`;
    this.logger = new TestLogger(this.testId);
    this.testDir = null;
    this.startTime = null;
  }

  async setup() {
    this.logger.log('Setting up test environment...');

    // Create temporary test directory
    this.testDir = await mkdtemp(join(tmpdir(), 'kanban-test-'));
    this.logger.log(`Created test directory: ${this.testDir}`);

    // Create basic kanban config
    const config = {
      _comment: 'Test configuration for kanban create hanging bug',
      tasksDir: 'docs/agile/tasks',
      indexFile: '',
      boardFile: 'docs/agile/boards/generated.md',
      cachePath: 'docs/agile/boards/.cache',
      exts: ['.md'],
      requiredFields: ['title', 'status', 'priority'],
      statusValues: ['incoming', 'ready', 'todo', 'in_progress', 'review', 'done'],
      priorityValues: ['P0', 'P1', 'P2', 'P3'],
      wipLimits: {
        incoming: 999,
        ready: 10,
        todo: 5,
        in_progress: 3,
        review: 3,
        done: 999,
      },
    };

    const configPath = join(this.testDir, 'promethean.kanban.json');
    await writeFile(configPath, JSON.stringify(config, null, 2));
    this.logger.log(`Created config file: ${configPath}`);

    // Create directory structure
    const tasksDir = join(this.testDir, 'docs', 'agile', 'tasks');
    const boardsDir = join(this.testDir, 'docs', 'agile', 'boards');

    await execSync(`mkdir -p "${tasksDir}" "${boardsDir}"`, { cwd: this.testDir });
    this.logger.log('Created directory structure');

    // Initialize git repository
    await execSync('git init', { cwd: this.testDir });
    await execSync('git config user.name "Test User"', { cwd: this.testDir });
    await execSync('git config user.email "test@example.com"', { cwd: this.testDir });
    this.logger.log('Initialized git repository');

    // Create initial board file
    const initialBoard = `# Kanban Board

## Incoming (0)

## Ready (0)

## Todo (0)

## In Progress (0)

## Review (0)

## Done (0)
`;

    const boardPath = join(this.testDir, 'docs', 'agile', 'boards', 'generated.md');
    await writeFile(boardPath, initialBoard);
    this.logger.log('Created initial board file');

    // Add and commit initial files
    await execSync('git add .', { cwd: this.testDir });
    await execSync('git commit -m "Initial setup"', { cwd: this.testDir });
    this.logger.log('Committed initial files');

    // Get kanban package path - the test is in src/tests/, so we need to go up to project root, then to packages/kanban
    const packageRoot = resolve(__dirname, '..', '..', 'packages', 'kanban');
    this.logger.log(`Kanban package root: ${packageRoot}`);

    return {
      testDir: this.testDir,
      configPath,
      boardPath,
      tasksDir,
      packageRoot,
    };
  }

  async runCreateTask(taskTitle, options = {}) {
    this.logger.log(`Starting create task test: "${taskTitle}"`);
    this.startTime = Date.now();

    const { packageRoot, testDir } = await this.setup();

    // Build the command - use the CLI binary
    const kanbanBin = join(packageRoot, 'dist', 'cli.js');
    const args = ['create', taskTitle, '--status', 'incoming', '--priority', 'P1'];

    if (options.content) {
      args.push('--content', options.content);
    }

    this.logger.log(`Executing: node ${kanbanBin} ${args.join(' ')}`);
    this.logger.log(`Working directory: ${testDir}`);

    return new Promise((resolve, reject) => {
      const child = spawn('node', [kanbanBin, ...args], {
        cwd: testDir,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          NODE_ENV: 'test',
          KANBAN_TEST_MODE: 'true',
        },
      });

      let stdout = '';
      let stderr = '';
      let resolved = false;

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          this.logger.error(`TEST TIMEOUT after ${TEST_TIMEOUT}ms`);
          child.kill('SIGTERM');

          // Try to get stack trace if possible
          setTimeout(() => {
            child.kill('SIGKILL');
            reject(new Error(`Test timed out after ${TEST_TIMEOUT}ms`));
          }, 5000);
        }
      }, TEST_TIMEOUT);

      child.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        this.logger.log('STDOUT:', output.trim());
      });

      child.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        this.logger.log('STDERR:', output.trim());
      });

      child.on('error', (error) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          this.logger.error('Process error:', error);
          reject(error);
        }
      });

      child.on('exit', (code, signal) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);

          const duration = Date.now() - this.startTime;
          this.logger.log(`Process exited with code ${code}, signal ${signal}`);
          this.logger.log(`Total duration: ${duration}ms`);

          if (code === 0) {
            resolve({
              code,
              signal,
              stdout,
              stderr,
              duration,
              success: true,
            });
          } else {
            reject(new Error(`Process failed with code ${code}: ${stderr}`));
          }
        }
      });
    });
  }

  async cleanup() {
    if (this.testDir) {
      this.logger.log(`Cleaning up test directory: ${this.testDir}`);
      try {
        await rm(this.testDir, { recursive: true, force: true });
        this.logger.log('Cleanup completed');
      } catch (error) {
        this.logger.error('Cleanup failed:', error);
      }
    }
  }

  async runTestSuite() {
    this.logger.log('Starting kanban create hanging test suite');

    const testCases = [
      {
        name: 'Basic task creation',
        title: 'Test Task 1',
        options: {},
      },
      {
        name: 'Task with content',
        title: 'Test Task 2',
        options: {
          content: 'This is a test task with content',
        },
      },
      {
        name: 'Duplicate task test',
        title: 'Test Task 1', // Same as first test
        options: {},
      },
      {
        name: 'Long title test',
        title:
          'This is a very long task title that might cause issues with file naming and slug generation',
        options: {},
      },
    ];

    const results = [];

    for (const testCase of testCases) {
      this.logger.log(`\n=== Running test: ${testCase.name} ===`);

      try {
        const result = await this.runCreateTask(testCase.title, testCase.options);
        results.push({
          ...testCase,
          result,
          status: 'passed',
        });
        this.logger.log(`✅ Test passed: ${testCase.name}`);
      } catch (error) {
        results.push({
          ...testCase,
          error: error.message,
          status: 'failed',
        });
        this.logger.log(`❌ Test failed: ${testCase.name} - ${error.message}`);
      }

      // Small delay between tests
      await setTimeout(1000);
    }

    this.logger.log('\n=== Test Results Summary ===');
    results.forEach((result) => {
      const status = result.status === 'passed' ? '✅' : '❌';
      console.log(`${status} ${result.name}: ${result.status}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      if (result.result) {
        console.log(`   Duration: ${result.result.duration}ms`);
      }
    });

    const passed = results.filter((r) => r.status === 'passed').length;
    const failed = results.filter((r) => r.status === 'failed').length;

    console.log(`\nSummary: ${passed} passed, ${failed} failed`);

    if (failed > 0) {
      this.logger.log('Some tests failed - hanging bug reproduced!');
      process.exit(1);
    } else {
      this.logger.log('All tests passed - no hanging detected in this run');
      process.exit(0);
    }
  }
}

// Main execution
async function main() {
  const test = new KanbanCreateTest();

  try {
    await test.runTestSuite();
  } catch (error) {
    test.logger.error('Test suite failed:', error);
    process.exit(1);
  } finally {
    await test.cleanup();
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error(`${LOG_PREFIX} Uncaught exception:`, error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`${LOG_PREFIX} Unhandled rejection at:`, promise, 'reason:', reason);
  process.exit(1);
});

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
