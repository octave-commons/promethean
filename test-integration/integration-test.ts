#!/usr/bin/env node

/**
 * Integration Test for Testing→Review Transition Rule
 *
 * This script tests the comprehensive testing transition implementation
 * with real coverage reports and task scenarios.
 */

import { readFileSync } from 'fs';
import { TransitionRulesEngine } from '../packages/kanban/src/lib/transition-rules.js';
import type { Task, Board } from '../packages/kanban/src/lib/types.js';

// Test configuration
const TEST_CONFIG = {
  highCoverageTaskPath: 'test-integration/test-task-high-coverage.md',
  lowCoverageTaskPath: 'test-integration/test-task-low-coverage.md',
  timeoutMs: 35000, // 35 seconds (slightly more than 30s limit)
};

// Mock board for testing
const mockBoard: Board = {
  columns: [
    { name: 'Testing', count: 0, limit: 5, tasks: [] },
    { name: 'Review', count: 0, limit: 5, tasks: [] },
  ],
};

/**
 * Load and parse a task file
 */
function loadTask(filePath: string): Task {
  const content = readFileSync(filePath, 'utf-8');
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!frontmatterMatch) {
    throw new Error(`Invalid task file format: ${filePath}`);
  }

  const [, frontmatterStr, body] = frontmatterMatch;
  const frontmatter = parseFrontmatter(frontmatterStr);

  return {
    uuid: frontmatter.uuid,
    title: frontmatter.title,
    status: frontmatter.status,
    priority: frontmatter.priority,
    labels: frontmatter.tags || [],
    content: body.trim(),
    created_at: frontmatter.created,
  };
}

/**
 * Simple YAML frontmatter parser
 */
function parseFrontmatter(yamlStr: string): Record<string, any> {
  const result: Record<string, any> = {};
  const lines = yamlStr.split('\n');

  for (const line of lines) {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      const [, key, value] = match;
      if (value.startsWith('[') && value.endsWith(']')) {
        // Parse array
        result[key] = value
          .slice(1, -1)
          .split(',')
          .map((v) => v.trim().replace(/['"]/g, ''));
      } else if (value === 'true' || value === 'false') {
        result[key] = value === 'true';
      } else {
        result[key] = value.replace(/['"]/g, '');
      }
    }
  }

  return result;
}

/**
 * Test scenario: High coverage task should pass transition
 */
async function testHighCoverageTransition(): Promise<boolean> {
  console.log('\n🧪 Testing High Coverage Transition...');

  try {
    const task = loadTask(TEST_CONFIG.highCoverageTaskPath);
    const engine = new TransitionRulesEngine();
    await engine.initialize();

    console.log(`📋 Task: ${task.title}`);
    console.log(`📊 Status: ${task.status} → review`);

    const result = await engine.validateTransition(task.status, 'review', task, mockBoard);

    console.log(`✅ Result: ${result.allowed ? 'ALLOWED' : 'BLOCKED'}`);
    if (!result.allowed) {
      console.log(`🚫 Reasons: ${result.reason}`);
      console.log(`📝 Violations: ${result.ruleViolations.join(', ')}`);
    }

    return result.allowed;
  } catch (error) {
    console.error(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

/**
 * Test scenario: Low coverage task should fail transition
 */
async function testLowCoverageTransition(): Promise<boolean> {
  console.log('\n🧪 Testing Low Coverage Transition...');

  try {
    const task = loadTask(TEST_CONFIG.lowCoverageTaskPath);
    const engine = new TransitionRulesEngine();
    await engine.initialize();

    console.log(`📋 Task: ${task.title}`);
    console.log(`📊 Status: ${task.status} → review`);

    const result = await engine.validateTransition(task.status, 'review', task, mockBoard);

    console.log(`✅ Result: ${result.allowed ? 'ALLOWED' : 'BLOCKED'}`);
    if (!result.allowed) {
      console.log(`🚫 Reasons: ${result.reason}`);
      console.log(`📝 Violations: ${result.ruleViolations.join(', ')}`);
    }

    return !result.allowed; // Should be blocked
  } catch (error) {
    console.error(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

/**
 * Test scenario: Missing coverage report should fail
 */
async function testMissingCoverageReport(): Promise<boolean> {
  console.log('\n🧪 Testing Missing Coverage Report...');

  try {
    const task: Task = {
      uuid: 'missing-coverage-task',
      title: 'Test Task - Missing Coverage',
      status: 'testing',
      priority: 'P1',
      labels: ['test'],
      content: 'This task has no coverage report specified.',
      created_at: new Date().toISOString(),
    };

    const engine = new TransitionRulesEngine();
    await engine.initialize();

    console.log(`📋 Task: ${task.title}`);
    console.log(`📊 Status: ${task.status} → review`);

    const result = await engine.validateTransition(task.status, 'review', task, mockBoard);

    console.log(`✅ Result: ${result.allowed ? 'ALLOWED' : 'BLOCKED'}`);
    if (!result.allowed) {
      console.log(`🚫 Reasons: ${result.reason}`);
      console.log(`📝 Violations: ${result.ruleViolations.join(', ')}`);
    }

    return !result.allowed; // Should be blocked
  } catch (error) {
    console.error(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

/**
 * Performance test: Ensure validation completes within 30 seconds
 */
async function testPerformance(): Promise<boolean> {
  console.log('\n🧪 Testing Performance...');

  try {
    const task = loadTask(TEST_CONFIG.highCoverageTaskPath);
    const engine = new TransitionRulesEngine();
    await engine.initialize();

    const startTime = Date.now();

    console.log(`📋 Task: ${task.title}`);
    console.log(`⏱️  Starting validation...`);

    const result = await engine.validateTransition(task.status, 'review', task, mockBoard);

    const duration = Date.now() - startTime;
    console.log(`⏱️  Validation completed in ${duration}ms`);

    const withinLimit = duration <= TEST_CONFIG.timeoutMs;
    console.log(
      `✅ Performance: ${withinLimit ? 'PASS' : 'FAIL'} (${duration}ms <= ${TEST_CONFIG.timeoutMs}ms)`,
    );

    return withinLimit;
  } catch (error) {
    console.error(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

/**
 * Run all integration tests
 */
async function runIntegrationTests(): Promise<void> {
  console.log('🚀 Starting Testing→Review Transition Integration Tests');
  console.log('='.repeat(60));

  const results = {
    highCoverage: await testHighCoverageTransition(),
    lowCoverage: await testLowCoverageTransition(),
    missingCoverage: await testMissingCoverageReport(),
    performance: await testPerformance(),
  };

  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Results Summary:');
  console.log(`✅ High Coverage Transition: ${results.highCoverage ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Low Coverage Transition: ${results.lowCoverage ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Missing Coverage Report: ${results.missingCoverage ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Performance Test: ${results.performance ? 'PASS' : 'FAIL'}`);

  const allPassed = Object.values(results).every(Boolean);
  console.log(`\n🎯 Overall Result: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);

  if (!allPassed) {
    console.log('\n❌ Integration tests failed. Check the implementation.');
    process.exit(1);
  } else {
    console.log(
      '\n✅ All integration tests passed! The testing→review transition is working correctly.',
    );
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runIntegrationTests().catch(console.error);
}

export { runIntegrationTests };
