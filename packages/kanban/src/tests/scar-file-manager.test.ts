/**
 * Unit tests for ScarFileManager
 */

import test from 'ava';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { ScarFileManager } from '../lib/heal/scar-file-manager.js';
import type { ScarRecord } from '../lib/heal/scar-context-types.js';

// Mock scar records for testing
const mockScarRecords: ScarRecord[] = [
  {
    start: 'abc123',
    end: 'def456',
    tag: 'heal-2025-01-01-10-00-00',
    story: 'Fixed duplicate task issue',
    timestamp: new Date('2025-01-01T10:00:00Z'),
  },
  {
    start: 'def456',
    end: 'ghi789',
    tag: 'heal-2025-01-02-15-30-00',
    story: 'Updated task validation logic',
    timestamp: new Date('2025-01-02T15:30:00Z'),
  },
];

test.beforeEach(async (t) => {
  // Create a temporary directory for each test
  const testDir = path.join(process.cwd(), 'test-scar-file-manager-temp');
  await fs.mkdir(testDir, { recursive: true });
  t.context.testDir = testDir;
  t.context.testFilePath = path.join(testDir, 'test-scars.jsonl');
});

test.afterEach.always(async (t) => {
  // Clean up test directory
  const testDir = t.context.testDir as string;
  try {
    await fs.rm(testDir, { recursive: true, force: true });
  } catch (error) {
    // Ignore cleanup errors
  }
});

test('ScarFileManager constructor with default config', (t) => {
  const manager = new ScarFileManager();
  
  t.true(manager['config'].filePath.includes('.kanban/scars/scars.jsonl'));
  t.true(manager['config'].createIfMissing);
  t.is(manager['config'].maxFileSize, 10 * 1024 * 1024);
  t.true(manager['config'].validateOnRead);
  t.is(manager['config'].encoding, 'utf8');
});

test('ScarFileManager constructor with custom config', (t) => {
  const testFilePath = t.context.testFilePath as string;
  const manager = new ScarFileManager({
    filePath: testFilePath,
    createIfMissing: false,
    maxFileSize: 1024,
    validateOnRead: false,
    encoding: 'ascii',
  });
  
  t.is(manager['config'].filePath, testFilePath);
  t.false(manager['config'].createIfMissing);
  t.is(manager['config'].maxFileSize, 1024);
  t.false(manager['config'].validateOnRead);
  t.is(manager['config'].encoding, 'ascii');
});

test('loadScars returns empty array for non-existent file', async (t) => {
  const testFilePath = t.context.testFilePath as string;
  const manager = new ScarFileManager({ filePath: testFilePath });
  
  const scars = await manager.loadScars();
  
  t.true(Array.isArray(scars));
  t.is(scars.length, 0);
});

test('loadScars loads valid scar records', async (t) => {
  const testFilePath = t.context.testFilePath as string;
  const manager = new ScarFileManager({ filePath: testFilePath });
  
  // Create test file with scar records
  const lines = mockScarRecords.map(scar => 
    JSON.stringify({ ...scar, timestamp: scar.timestamp.toISOString() })
  );
  await fs.writeFile(testFilePath, lines.join('\n') + '\n');
  
  const scars = await manager.loadScars();
  
  t.is(scars.length, 2);
  t.is(scars[0].tag, 'heal-2025-01-01-10-00-00');
  t.is(scars[1].tag, 'heal-2025-01-02-15-30-00');
  t.true(scars[0].timestamp instanceof Date);
  t.true(scars[1].timestamp instanceof Date);
});

test('loadScars skips invalid records', async (t) => {
  const testFilePath = t.context.testFilePath as string;
  const manager = new ScarFileManager({ filePath: testFilePath });
  
  // Create test file with mixed valid and invalid records
  const lines = [
    JSON.stringify(mockScarRecords[0]),
    'invalid json line',
    JSON.stringify({ ...mockScarRecords[1], timestamp: mockScarRecords[1].timestamp.toISOString() }),
    '{"incomplete": "record"}',
  ];
  await fs.writeFile(testFilePath, lines.join('\n') + '\n');
  
  const scars = await manager.loadScars();
  
  t.is(scars.length, 2); // Only valid records should be loaded
});

test('addScar adds single scar record', async (t) => {
  const testFilePath = t.context.testFilePath as string;
  const manager = new ScarFileManager({ filePath: testFilePath });
  
  const result = await manager.addScar(mockScarRecords[0]);
  
  t.true(result.success);
  t.is(result.recordCount, 1);
  t.true(typeof result.metadata?.addedAt === 'string');
  t.true(typeof result.metadata?.recordSize === 'number');
  
  // Verify file was created and contains the record
  const scars = await manager.loadScars();
  t.is(scars.length, 1);
  t.is(scars[0].tag, mockScarRecords[0].tag);
});

test('addScar rejects invalid scar record', async (t) => {
  const testFilePath = t.context.testFilePath as string;
  const manager = new ScarFileManager({ filePath: testFilePath });
  
  const invalidScar = {
    start: 'abc123',
    // Missing required fields
  } as any;
  
  const result = await manager.addScar(invalidScar);
  
  t.false(result.success);
  t.true(result.error?.includes('Invalid scar record structure'));
});

test('addScars adds multiple scar records', async (t) => {
  const testFilePath = t.context.testFilePath as string;
  const manager = new ScarFileManager({ filePath: testFilePath });
  
  const result = await manager.addScars(mockScarRecords);
  
  t.true(result.success);
  t.is(result.recordCount, 2);
  
  // Verify all records were added
  const scars = await manager.loadScars();
  t.is(scars.length, 2);
});

test('addScars rejects partially invalid records', async (t) => {
  const testFilePath = t.context.testFilePath as string;
  const manager = new ScarFileManager({ filePath: testFilePath });
  
  const mixedRecords = [
    mockScarRecords[0],
    { invalid: 'record' } as any,
    mockScarRecords[1],
  ];
  
  const result = await manager.addScars(mixedRecords);
  
  t.false(result.success);
  t.true(result.error?.includes('Invalid scar records'));
});

test('getStats returns correct statistics', async (t) => {
  const testFilePath = t.context.testFilePath as string;
  const manager = new ScarFileManager({ filePath: testFilePath });
  
  // Add some records first
  await manager.addScars(mockScarRecords);
  
  const stats = await manager.getStats();
  
  t.true(stats.exists);
  t.is(stats.totalRecords, 2);
  t.true(stats.fileSize > 0);
  t.is(stats.filePath, testFilePath);
  t.true(stats.lastModified instanceof Date);
});

test('getStats for non-existent file', async (t) => {
  const testFilePath = t.context.testFilePath as string;
  const manager = new ScarFileManager({ filePath: testFilePath });
  
  const stats = await manager.getStats();
  
  t.false(stats.exists);
  t.is(stats.totalRecords, 0);
  t.is(stats.fileSize, 0);
  t.is(stats.filePath, testFilePath);
});

test('searchScars by tag pattern', async (t) => {
  const testFilePath = t.context.testFilePath as string;
  const manager = new ScarFileManager({ filePath: testFilePath });
  
  await manager.addScars(mockScarRecords);
  
  const results = await manager.searchScars({ tagPattern: '2025-01-01' });
  
  t.is(results.length, 1);
  t.is(results[0].tag, 'heal-2025-01-01-10-00-00');
});

test('searchScars by date range', async (t) => {
  const testFilePath = t.context.testFilePath as string;
  const manager = new ScarFileManager({ filePath: testFilePath });
  
  await manager.addScars(mockScarRecords);
  
  const results = await manager.searchScars({
    dateRange: {
      start: new Date('2025-01-01T00:00:00Z'),
      end: new Date('2025-01-01T23:59:59Z'),
    },
  });
  
  t.is(results.length, 1);
  t.is(results[0].tag, 'heal-2025-01-01-10-00-00');
});

test('searchScars by story content', async (t) => {
  const testFilePath = t.context.testFilePath as string;
  const manager = new ScarFileManager({ filePath: testFilePath });
  
  await manager.addScars(mockScarRecords);
  
  const results = await manager.searchScars({ storyContains: 'duplicate' });
  
  t.is(results.length, 1);
  t.is(results[0].tag, 'heal-2025-01-01-10-00-00');
});

test('searchScars with limit', async (t) => {
  const testFilePath = t.context.testFilePath as string;
  const manager = new ScarFileManager({ filePath: testFilePath });
  
  await manager.addScars(mockScarRecords);
  
  const results = await manager.searchScars({ limit: 1 });
  
  t.is(results.length, 1);
  // Should return the most recent one first
  t.is(results[0].tag, 'heal-2025-01-02-15-30-00');
});

test('removeScars by date', async (t) => {
  const testFilePath = t.context.testFilePath as string;
  const manager = new ScarFileManager({ filePath: testFilePath });
  
  await manager.addScars(mockScarRecords);
  
  const result = await manager.removeScars({
    olderThan: new Date('2025-01-02T00:00:00Z'),
  });
  
  t.true(result.success);
  t.is(result.recordCount, 1); // Should remove the older record
  
  const remainingScars = await manager.loadScars();
  t.is(remainingScars.length, 1);
  t.is(remainingScars[0].tag, 'heal-2025-01-02-15-30-00');
});

test('removeScars by tag pattern', async (t) => {
  const testFilePath = t.context.testFilePath as string;
  const manager = new ScarFileManager({ filePath: testFilePath });
  
  await manager.addScars(mockScarRecords);
  
  const result = await manager.removeScars({
    tagPattern: '2025-01-01',
  });
  
  t.true(result.success);
  t.is(result.recordCount, 1);
  
  const remainingScars = await manager.loadScars();
  t.is(remainingScars.length, 1);
  t.is(remainingScars[0].tag, 'heal-2025-01-02-15-30-00');
});

test('removeScars with limit', async (t) => {
  const testFilePath = t.context.testFilePath as string;
  const manager = new ScarFileManager({ filePath: testFilePath });
  
  await manager.addScars(mockScarRecords);
  
  const result = await manager.removeScars({ limit: 1 });
  
  t.true(result.success);
  t.is(result.recordCount, 1);
  t.is(result.metadata?.remaining, 1);
  
  const remainingScars = await manager.loadScars();
  t.is(remainingScars.length, 1);
  // Should keep the most recent one
  t.is(remainingScars[0].tag, 'heal-2025-01-02-15-30-00');
});

test('validateFile with valid file', async (t) => {
  const testFilePath = t.context.testFilePath as string;
  const manager = new ScarFileManager({ filePath: testFilePath });
  
  await manager.addScars(mockScarRecords);
  
  const result = await manager.validateFile();
  
  t.true(result.valid);
  t.is(result.errors.length, 0);
});

test('validateFile with invalid file', async (t) => {
  const testFilePath = t.context.testFilePath as string;
  const manager = new ScarFileManager({ filePath: testFilePath });
  
  // Create file with invalid content
  await fs.writeFile(testFilePath, 'invalid json\n{"incomplete": "record"}');
  
  const result = await manager.validateFile();
  
  t.false(result.valid);
  t.true(result.errors.length > 0);
});

test('validateFile for non-existent file', async (t) => {
  const testFilePath = t.context.testFilePath as string;
  const manager = new ScarFileManager({ filePath: testFilePath });
  
  const result = await manager.validateFile();
  
  t.false(result.valid);
  t.true(result.errors.some(error => error.includes('does not exist')));
});

test('ensureFile creates file when missing', async (t) => {
  const testFilePath = t.context.testFilePath as string;
  const manager = new ScarFileManager({ filePath: testFilePath, createIfMissing: true });
  
  await manager.ensureFile();
  
  const exists = await fs.access(testFilePath).then(() => true).catch(() => false);
  t.true(exists);
});

test('ensureFile does not create file when disabled', async (t) => {
  const testFilePath = t.context.testFilePath as string;
  const manager = new ScarFileManager({ filePath: testFilePath, createIfMissing: false });
  
  await manager.ensureFile();
  
  const exists = await fs.access(testFilePath).then(() => true).catch(() => false);
  t.false(exists);
});

test('createScarFileManager factory function', (t) => {
  const manager = ScarFileManager.createScarFileManager({
    filePath: '/test/path',
    maxFileSize: 1024,
  });
  
  t.true(manager instanceof ScarFileManager);
  t.is(manager['config'].filePath, '/test/path');
  t.is(manager['config'].maxFileSize, 1024);
});