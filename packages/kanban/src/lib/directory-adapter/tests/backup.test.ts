/**
 * Backup manager tests for DirectoryAdapter
 */

import test from 'ava';
import { promises as fs } from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { TaskBackupManager, createBackupManager } from '../backup.js';
import type { BackupConfig, FileOperationContext } from '../types.js';

const createTestDirectory = async (): Promise<string> => {
  const testDir = await fs.mkdtemp(path.join(tmpdir(), 'backup-test-'));
  return testDir;
};

const createTestFile = async (dir: string, name: string, content: string): Promise<string> => {
  const filePath = path.join(dir, name);
  await fs.writeFile(filePath, content, 'utf8');
  return filePath;
};

const createContext = (operation: any, filePath: string): FileOperationContext => ({
  operation,
  path: filePath,
  timestamp: new Date(),
  requestId: 'test-request-id',
  user: 'test-user',
});

test.beforeEach(async (t) => {
  t.context.testDir = await createTestDirectory();
  t.context.backupDir = path.join(t.context.testDir, 'backups');
  t.context.config = {
    directory: t.context.backupDir,
    retentionDays: 30,
    compressionEnabled: false,
    hashVerification: true,
  };
});

test.afterEach(async (t) => {
  try {
    await fs.rm(t.context.testDir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
});

test('should create backup manager', (t) => {
  const { config } = t.context;
  const backupManager = createBackupManager(config);

  t.true(backupManager instanceof TaskBackupManager);
});

test('should create backup of file', async (t) => {
  const { testDir, config } = t.context;
  const backupManager = createBackupManager(config);

  // Create test file
  const originalContent = '# Test Task\n\nThis is test content.';
  const testFile = await createTestFile(testDir, 'test-task.md', originalContent);

  // Create backup
  const context = createContext('backup', testFile);
  const backupPath = await backupManager.createBackup(testFile, 'test backup', context);

  t.truthy(backupPath);
  t.true(
    await fs
      .access(backupPath)
      .then(() => true)
      .catch(() => false),
  );

  // Verify backup content
  const backupContent = await fs.readFile(backupPath, 'utf8');
  t.is(backupContent, originalContent);

  // Verify metadata exists
  const metadataPath = backupPath.replace('.md', '.meta.json');
  t.true(
    await fs
      .access(metadataPath)
      .then(() => true)
      .catch(() => false),
  );

  const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
  t.is(metadata.originalPath, path.resolve(testFile));
  t.is(metadata.reason, 'test backup');
  t.is(metadata.user, 'test-user');
  t.is(metadata.operation, 'backup');
});

test('should restore backup', async (t) => {
  const { testDir, config } = t.context;
  const backupManager = createBackupManager(config);

  // Create original file
  const originalContent = '# Original Task\n\nOriginal content.';
  const testFile = await createTestFile(testDir, 'restore-test.md', originalContent);

  // Create backup
  const backupPath = await backupManager.createBackup(testFile, 'restore test');

  // Modify original file
  const modifiedContent = '# Modified Task\n\nModified content.';
  await fs.writeFile(testFile, modifiedContent, 'utf8');

  // Restore from backup
  await backupManager.restoreBackup(backupPath, testFile);

  // Verify restoration
  const restoredContent = await fs.readFile(testFile, 'utf8');
  t.is(restoredContent, originalContent);
});

test('should list backups', async (t) => {
  const { testDir, config } = t.context;
  const backupManager = createBackupManager(config);

  // Create multiple files and backups
  const file1 = await createTestFile(testDir, 'file1.md', 'Content 1');
  const file2 = await createTestFile(testDir, 'file2.md', 'Content 2');

  await backupManager.createBackup(file1, 'backup 1');
  await backupManager.createBackup(file2, 'backup 2');
  await backupManager.createBackup(file1, 'backup 3'); // Second backup of file1

  // List all backups
  const allBackups = await backupManager.listBackups();
  t.is(allBackups.length, 3);

  // List backups for specific file
  const file1Backups = await backupManager.listBackups(file1);
  t.is(file1Backups.length, 2);

  // Verify backups are sorted by timestamp (newest first)
  const file1Metadata1 = JSON.parse(
    await fs.readFile(file1Backups[0].replace('.md', '.meta.json'), 'utf8'),
  );
  const file1Metadata2 = JSON.parse(
    await fs.readFile(file1Backups[1].replace('.md', '.meta.json'), 'utf8'),
  );
  t.true(file1Metadata1.timestamp >= file1Metadata2.timestamp);
});

test('should cleanup old backups', async (t) => {
  const { testDir, config } = t.context;
  const shortRetentionConfig = { ...config, retentionDays: 0 }; // Everything is old
  const backupManager = createBackupManager(shortRetentionConfig);

  // Create some backups
  const file1 = await createTestFile(testDir, 'cleanup-test.md', 'Content');
  await backupManager.createBackup(file1, 'old backup');

  // Wait a bit to ensure timestamps are different
  await new Promise((resolve) => setTimeout(resolve, 10));

  await backupManager.createBackup(file1, 'newer backup');

  // Verify we have backups
  const backupsBefore = await backupManager.listBackups();
  t.true(backupsBefore.length > 0);

  // Cleanup old backups
  const cleanedCount = await backupManager.cleanupOldBackups();
  t.true(cleanedCount > 0);

  // Verify backups are gone
  const backupsAfter = await backupManager.listBackups();
  t.is(backupsAfter.length, 0);
});

test('should get backup statistics', async (t) => {
  const { testDir, config } = t.context;
  const backupManager = createBackupManager(config);

  // Create files with different sizes
  const file1 = await createTestFile(testDir, 'stats-test-1.md', 'Small content');
  const file2 = await createTestFile(
    testDir,
    'stats-test-2.md',
    'Larger content with more text to increase file size for testing purposes.',
  );

  await backupManager.createBackup(file1, 'stats backup 1');
  await backupManager.createBackup(file2, 'stats backup 2');
  await backupManager.createBackup(file1, 'stats backup 3');

  // Get statistics
  const stats = await backupManager.getBackupStats();

  t.is(stats.totalBackups, 3);
  t.true(stats.totalSize > 0);
  t.truthy(stats.oldestBackup);
  t.truthy(stats.newestBackup);
  t.true(stats.newestBackup >= stats.oldestBackup);
  t.is(Object.keys(stats.filesByOriginalPath).length, 2);
  t.is(stats.filesByOriginalPath[path.resolve(file1)], 2);
  t.is(stats.filesByOriginalPath[path.resolve(file2)], 1);
});

test('should verify backup integrity', async (t) => {
  const { testDir, config } = t.context;
  const backupManager = createBackupManager(config);

  const originalContent = '# Integrity Test\n\nContent for integrity testing.';
  const testFile = await createTestFile(testDir, 'integrity-test.md', originalContent);

  // Create backup
  const backupPath = await backupManager.createBackup(testFile, 'integrity test');

  // Corrupt the backup file
  await fs.writeFile(backupPath, 'corrupted content', 'utf8');

  // Try to restore - should fail due to integrity check
  await t.throwsAsync(() => backupManager.restoreBackup(backupPath, testFile), {
    message: /integrity/,
  });
});

test('should handle compression', async (t) => {
  const { testDir, config } = t.context;
  const compressionConfig = { ...config, compressionEnabled: true };
  const backupManager = createBackupManager(compressionConfig);

  const originalContent = '# Compression Test\n\nContent for compression testing.';
  const testFile = await createTestFile(testDir, 'compression-test.md', originalContent);

  // Create compressed backup
  const backupPath = await backupManager.createBackup(testFile, 'compression test');

  // Verify backup exists and metadata indicates compression
  const metadataPath = backupPath.replace('.md', '.meta.json');
  const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
  t.true(metadata.compressed);

  // Restore from compressed backup
  await backupManager.restoreBackup(backupPath, testFile);

  // Verify content is restored correctly
  const restoredContent = await fs.readFile(testFile, 'utf8');
  t.is(restoredContent, originalContent);
});

test('should handle missing files gracefully', async (t) => {
  const { config } = t.context;
  const backupManager = createBackupManager(config);

  // Try to backup non-existent file
  const nonExistentFile = path.join(t.context.testDir, 'non-existent.md');

  await t.throwsAsync(() => backupManager.createBackup(nonExistentFile), {
    message: /Failed to create backup/,
  });

  // Try to restore non-existent backup
  const nonExistentBackup = path.join(t.context.backupDir, 'non-existent-backup.md');

  await t.throwsAsync(() => backupManager.restoreBackup(nonExistentBackup, nonExistentFile), {
    message: /metadata not found/,
  });
});

test('should handle corrupted metadata', async (t) => {
  const { testDir, config } = t.context;
  const backupManager = createBackupManager(config);

  const testFile = await createTestFile(testDir, 'corrupted-meta.md', 'Test content');
  const backupPath = await backupManager.createBackup(testFile, 'corrupted metadata test');

  // Corrupt the metadata file
  const metadataPath = backupPath.replace('.md', '.meta.json');
  await fs.writeFile(metadataPath, 'invalid json', 'utf8');

  // Should handle corrupted metadata gracefully
  const backups = await backupManager.listBackups();
  t.true(backups.length >= 0); // Should not crash

  const stats = await backupManager.getBackupStats();
  t.true(stats.totalBackups >= 0); // Should not crash
});
