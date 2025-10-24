/**
 * Tests for ScarContext integration
 */

import test from 'ava';
import { promises as fs } from 'fs';
import { join } from 'path';
import { ScarContext } from '../core/scar-context.js';
import { ScarType, ScarSeverity } from '../types/index.js';

test('ScarContext analyzes corrupted files', async (t) => {
  const context = new ScarContext({ dryRun: true });

  // Create a temporary file with double extension
  const testContent = '# Test Task\n\nThis is a test task.';
  const testFile = join(process.cwd(), 'test.md.md');

  try {
    await fs.writeFile(testFile, testContent, 'utf-8');

    const result = await context.analyzeFile(testFile);

    t.true(result.isCorrupted);
    t.is(result.corruptions.length, 1);
    t.is(result.corruptions[0]!.type, ScarType.FILENAME_CORRUPTION);
    t.is(result.corruptions[0]!.severity, ScarSeverity.HIGH);
  } finally {
    // Clean up
    try {
      await fs.unlink(testFile);
    } catch {
      // Ignore cleanup errors
    }
  }
});

test('ScarContext heals corrupted files', async (t) => {
  const context = new ScarContext({ dryRun: true, backupEnabled: false });

  // Create a temporary file with content issues
  const testContent = '//* This is a corrupted comment\n# Test Task\n\nThis is â€smartâ€ text.';
  const testFile = join(process.cwd(), 'test-content.md');

  try {
    await fs.writeFile(testFile, testContent, 'utf-8');

    const results = await context.healFile(testFile, false);

    t.true(results.length > 0);

    // Check that some healings were successful
    const successfulHealings = results.filter((r) => r.success);
    t.true(successfulHealings.length > 0);

    // Check that changes were made
    const changes = results.flatMap((r) => r.changesMade || []);
    t.true(changes.length > 0);
  } finally {
    // Clean up
    try {
      await fs.unlink(testFile);
    } catch {
      // Ignore cleanup errors
    }
  }
});

test('ScarContext generates scar reports', async (t) => {
  const context = new ScarContext({ dryRun: true });

  const report = await context.generateScarReport();

  t.is(typeof report, 'string');
  t.true(report.includes('# Scar Healing Report'));
  t.true(report.includes('## Summary'));
});
