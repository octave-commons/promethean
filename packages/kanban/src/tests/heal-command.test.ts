/**
 * Tests for heal command implementation
 */

import test from 'ava';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { temporaryDirectory } from 'tempy';
import { GitTagManager } from '../lib/heal/git-tag-manager.js';
import { ScarHistoryManager } from '../lib/heal/scar-history-manager.js';
import { HealCommand, createHealCommand } from '../lib/heal/heal-command.js';
import { ScarContextBuilder } from '../lib/heal/scar-context-builder.js';
import type { ScarRecord, HealingResult } from '../lib/heal/scar-context-types.js';

test('GitTagManager creates heal tags correctly', async (t) => {
  const tempDir = temporaryDirectory();
  
  // Initialize a git repository
  const { execSync } = await import('node:child_process');
  execSync('git init', { cwd: tempDir });
  execSync('git config user.name "Test User"', { cwd: tempDir });
  execSync('git config user.email "test@example.com"', { cwd: tempDir });
  
  // Create initial commit
  await fs.writeFile(path.join(tempDir, 'test.txt'), 'initial content');
  execSync('git add test.txt', { cwd: tempDir });
  execSync('git commit -m "Initial commit"', { cwd: tempDir });
  
  const gitTagManager = new GitTagManager(tempDir);
  
  const result = await gitTagManager.createHealTag('Test healing operation');
  
  t.true(result.success);
  t.true(result.tag.startsWith('heal-'));
  t.true(result.commitSha.length > 0);
  t.is(result.metadata.annotated, true);
  
  // Verify tag was created
  const tags = await gitTagManager.getHealTags();
  t.true(tags.includes(result.tag));
});

test('GitTagManager stores and retrieves scar records', async (t) => {
  const tempDir = temporaryDirectory();
  
  const gitTagManager = new GitTagManager(tempDir);
  
  const scar: ScarRecord = {
    start: 'a'.repeat(40),
    end: 'b'.repeat(40),
    tag: 'heal-2023-01-01-12-00-00',
    story: 'Test healing operation',
    timestamp: new Date(),
  };
  
  const storeResult = await gitTagManager.storeScarRecord(scar);
  t.true(storeResult.success);
  t.is(storeResult.scarCount, 1);
  
  const retrievedScars = await gitTagManager.loadScarHistory();
  t.is(retrievedScars.length, 1);
  t.is(retrievedScars[0].tag, scar.tag);
  t.is(retrievedScars[0].story, scar.story);
});

test('ScarHistoryManager records healing operations', async (t) => {
  const tempDir = temporaryDirectory();
  
  // Initialize git repo
  const { execSync } = await import('node:child_process');
  execSync('git init', { cwd: tempDir });
  execSync('git config user.name "Test User"', { cwd: tempDir });
  execSync('git config user.email "test@example.com"', { cwd: tempDir });
  
  const scarHistoryManager = new ScarHistoryManager(tempDir);
  
  const context = {
    reason: 'Test healing',
    eventLog: [],
    previousScars: [],
    searchResults: [],
    metadata: {
      tag: 'heal-test',
      narrative: 'Test narrative',
    },
    llmOperations: [],
    gitHistory: [],
  };
  
  const result: HealingResult = {
    status: 'completed',
    summary: 'Test healing completed',
    tasksModified: 2,
    filesChanged: 1,
    errors: [],
  };
  
  const recordResult = await scarHistoryManager.recordHealingOperation(
    context,
    result,
    'a'.repeat(40),
    'b'.repeat(40)
  );
  
  t.true(recordResult.success);
  t.truthy(recordResult.scar);
  t.is(recordResult.scar?.tag, 'heal-test');
  
  // Verify scar can be retrieved
  const scars = await scarHistoryManager.queryScars();
  t.is(scars.length, 1);
  t.is(scars[0].tag, 'heal-test');
});

test('ScarHistoryManager provides healing recommendations', async (t) => {
  const tempDir = temporaryDirectory();
  
  const scarHistoryManager = new ScarHistoryManager(tempDir);
  
  // Create some test scars
  const testScars: ScarRecord[] = [
    {
      start: 'a'.repeat(40),
      end: 'b'.repeat(40),
      tag: 'heal-duplicate-tasks',
      story: 'Healing operation: Fixed duplicate tasks',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
    {
      start: 'c'.repeat(40),
      end: 'd'.repeat(40),
      tag: 'heal-wip-violation',
      story: 'Healing operation: Fixed WIP limit violations',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    },
  ];
  
  for (const scar of testScars) {
    await scarHistoryManager.recordHealingOperation(
      {
        reason: 'Test healing',
        eventLog: [],
        previousScars: [],
        searchResults: [],
        metadata: { tag: scar.tag, narrative: 'Test' },
        llmOperations: [],
        gitHistory: [],
      },
      {
        status: 'completed',
        summary: 'Test completed',
        tasksModified: 1,
        filesChanged: 1,
        errors: [],
      },
      scar.start,
      scar.end
    );
  }
  
  const relatedScars = await scarHistoryManager.findRelatedScars('duplicate tasks issue');
  t.true(relatedScars.length > 0);
  t.true(relatedScars[0].relevance > 0);
  t.true(relatedScars[0].reason.includes('keywords'));
});

test('HealCommand executes dry run correctly', async (t) => {
  const tempDir = temporaryDirectory();
  const boardFile = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');
  
  // Create minimal board structure
  await fs.mkdir(tasksDir, { recursive: true });
  await fs.writeFile(boardFile, '# Test Board\n\n## Todo\n\n## Done\n');
  
  const healCommand = createHealCommand(boardFile, tasksDir);
  
  const result = await healCommand.execute({
    reason: 'Test dry run healing',
    dryRun: true,
    createTags: false,
  });
  
  t.is(result.status, 'completed');
  t.true(result.summary?.includes('Dry run'));
  t.is(result.tasksModified, 0);
  t.is(result.filesChanged, 0);
  t.truthy(result.totalTime);
  t.truthy(result.contextBuildTime);
});

test('HealCommand provides recommendations', async (t) => {
  const tempDir = temporaryDirectory();
  const boardFile = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');
  
  // Create board with issues
  await fs.mkdir(tasksDir, { recursive: true });
  await fs.writeFile(boardFile, `
# Test Board

## Todo [WIP: 2]
- Task 1
- Task 2
- Task 3

## Done
  `.trim());
  
  const healCommand = createHealCommand(boardFile, tasksDir);
  
  const recommendations = await healCommand.getHealingRecommendations({
    reason: 'WIP violation issue',
  });
  
  t.true(Array.isArray(recommendations.recommendations));
  t.true(Array.isArray(recommendations.criticalIssues));
  t.true(Array.isArray(recommendations.relatedScars));
  
  // Should detect WIP violation
  const wipIssues = recommendations.criticalIssues.filter(issue => issue.type === 'wip_violation');
  t.true(wipIssues.length > 0);
});

test('ScarContextBuilder builds valid context', async (t) => {
  const tempDir = temporaryDirectory();
  const boardFile = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');
  
  // Create minimal board structure
  await fs.mkdir(tasksDir, { recursive: true });
  await fs.writeFile(boardFile, '# Test Board\n\n## Todo\n\n## Done\n');
  
  const contextBuilder = new ScarContextBuilder(boardFile, tasksDir);
  
  const context = await contextBuilder.buildContext('Test context building', {
    includeTaskAnalysis: true,
    includePerformanceMetrics: true,
    maxGitHistory: 10,
  });
  
  t.is(context.reason, 'Test context building');
  t.true(Array.isArray(context.eventLog));
  t.true(Array.isArray(context.previousScars));
  t.true(Array.isArray(context.searchResults));
  t.true(Array.isArray(context.llmOperations));
  t.true(Array.isArray(context.gitHistory));
  
  t.truthy(context.metadata.tag);
  t.truthy(context.metadata.narrative);
  t.true(context.metadata.tag.startsWith('heal-'));
  
  // Should have events for context building process
  const startEvent = context.eventLog.find(e => e.operation === 'start-context-building');
  t.truthy(startEvent);
  
  const completionEvent = context.eventLog.find(e => e.operation === 'context-building-completed');
  t.truthy(completionEvent);
});

test('GitTagManager handles tag deletion', async (t) => {
  const tempDir = temporaryDirectory();
  
  // Initialize git repo
  const { execSync } = await import('node:child_process');
  execSync('git init', { cwd: tempDir });
  execSync('git config user.name "Test User"', { cwd: tempDir });
  execSync('git config user.email "test@example.com"', { cwd: tempDir });
  
  // Create initial commit
  await fs.writeFile(path.join(tempDir, 'test.txt'), 'content');
  execSync('git add test.txt', { cwd: tempDir });
  execSync('git commit -m "Initial"', { cwd: tempDir });
  
  const gitTagManager = new GitTagManager(tempDir);
  
  // Create a tag
  const createResult = await gitTagManager.createHealTag('Test tag');
  t.true(createResult.success);
  
  // Verify tag exists
  let tags = await gitTagManager.getHealTags();
  t.true(tags.includes(createResult.tag));
  
  // Delete the tag
  const deleteResult = await gitTagManager.deleteTag(createResult.tag);
  t.true(deleteResult.success);
  
  // Verify tag is gone
  tags = await gitTagManager.getHealTags();
  t.false(tags.includes(createResult.tag));
});

test('ScarHistoryManager exports and imports scars', async (t) => {
  const tempDir = temporaryDirectory();
  const scarHistoryManager = new ScarHistoryManager(tempDir);
  
  // Create test scars
  const testScars: ScarRecord[] = [
    {
      start: 'a'.repeat(40),
      end: 'b'.repeat(40),
      tag: 'heal-test-1',
      story: 'Test healing 1',
      timestamp: new Date('2023-01-01'),
    },
    {
      start: 'c'.repeat(40),
      end: 'd'.repeat(40),
      tag: 'heal-test-2',
      story: 'Test healing 2',
      timestamp: new Date('2023-01-02'),
    },
  ];
  
  // Store scars
  for (const scar of testScars) {
    await scarHistoryManager.recordHealingOperation(
      {
        reason: 'Test',
        eventLog: [],
        previousScars: [],
        searchResults: [],
        metadata: { tag: scar.tag, narrative: 'Test' },
        llmOperations: [],
        gitHistory: [],
      },
      {
        status: 'completed',
        summary: 'Test',
        tasksModified: 1,
        filesChanged: 1,
        errors: [],
      },
      scar.start,
      scar.end
    );
  }
  
  // Export as JSON
  const jsonExport = await scarHistoryManager.exportScars('json');
  const exportedScars = JSON.parse(jsonExport);
  t.is(exportedScars.length, 2);
  
  // Export as CSV
  const csvExport = await scarHistoryManager.exportScars('csv');
  t.true(csvExport.includes('tag,start,end,timestamp,story'));
  t.true(csvExport.includes('heal-test-1'));
  
  // Export as Markdown
  const mdExport = await scarHistoryManager.exportScars('markdown');
  t.true(mdExport.includes('# Scar History'));
  t.true(mdExport.includes('## heal-test-1'));
  
  // Test import
  const importResult = await scarHistoryManager.importScars(jsonExport, 'json');
  t.true(importResult.success);
  t.is(importResult.imported, 0); // Should be 0 because they're duplicates
  t.is(importResult.duplicates, 2);
});

test('HealCommand handles errors gracefully', async (t) => {
  const tempDir = temporaryDirectory();
  const boardFile = path.join(tempDir, 'nonexistent-board.md');
  const tasksDir = path.join(tempDir, 'nonexistent-tasks');
  
  const healCommand = createHealCommand(boardFile, tasksDir);
  
  const result = await healCommand.execute({
    reason: 'Test error handling',
  });
  
  t.is(result.status, 'failed');
  t.true(result.summary?.includes('failed'));
  t.true(result.errors.length > 0);
  t.truthy(result.totalTime);
});

test('ScarHistoryManager analyzes scar patterns', async (t) => {
  const tempDir = temporaryDirectory();
  const scarHistoryManager = new ScarHistoryManager(tempDir);
  
  // Create scars with different patterns
  const reasons = ['duplicate tasks', 'WIP violation', 'duplicate tasks', 'missing content'];
  
  for (let i = 0; i < reasons.length; i++) {
    await scarHistoryManager.recordHealingOperation(
      {
        reason: reasons[i],
        eventLog: [],
        previousScars: [],
                        searchResults: [],
        metadata: { tag: `heal-test-${i}`, narrative: 'Test' },
        llmOperations: [],
        gitHistory: [],
      },
                  {
        status: 'completed',
        summary: 'Test',
        tasksModified: 1,
        filesChanged: 1,
        errors: [],
      },
      'a'.repeat(40),
      'b'.repeat(40)
    );
  }
  
  const analysis = await scarHistoryManager.analyzeScars();
  
  t.is(analysis.totalScars, 4);
  t.true(analysis.successRate > 0);
  
  // Should find "duplicate tasks" as a common reason
  const duplicateReason = analysis.commonReasons.find(r => r.reason.includes('duplicate tasks'));
  t.truthy(duplicateReason);
  t.is(duplicateReason?.count, 2);
});