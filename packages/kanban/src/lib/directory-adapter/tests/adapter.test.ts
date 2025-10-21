/**
 * DirectoryAdapter Tests
 * Comprehensive test suite for the DirectoryAdapter implementation
 */

import test from 'ava';
import { promises as fs } from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import type { TaskCache } from '../../board/task-cache.js';
import type { DirectoryAdapterConfig } from '../types.js';
import { 
  DirectoryAdapter, 
  createDirectoryAdapter,
  DEFAULT_DIRECTORY_ADAPTER_CONFIG,
  TEST_CONFIG
} from '../index.js';
import { DirectoryAdapterError, FileNotFoundError, SecurityValidationError } from '../types.js';

// Mock cache for testing
class MockTaskCache implements TaskCache {
  private tasks = new Map<string, any>();

  async getTask(uuid: string): Promise<any> {
    return this.tasks.get(uuid);
  }

  async hasTask(uuid: string): Promise<boolean> {
    return this.tasks.has(uuid);
  }

  async setTask(task: any): Promise<void> {
    this.tasks.set(task.uuid, task);
  }

  async removeTask(uuid: string): Promise<void> {
    this.tasks.delete(uuid);
  }

  async *getTasksByStatus(status: string): AsyncIterable<any> {
    for (const task of this.tasks.values()) {
      if (task.status === status || status === '') {
        yield task;
      }
    }
  }

  async *getTasksByPriority(priority: string): AsyncIterable<any> {
    for (const task of this.tasks.values()) {
      if (task.priority === priority) {
        yield task;
      }
    }
  }

  async *getTasksByLabel(label: string): AsyncIterable<any> {
    for (const task of this.tasks.values()) {
      if (task.labels?.includes(label)) {
        yield task;
      }
    }
  }

  async *searchTasks(query: string): AsyncIterable<any> {
    const queryLower = query.toLowerCase();
    for (const task of this.tasks.values()) {
      if (
        task.title?.toLowerCase().includes(queryLower) ||
        task.content?.toLowerCase().includes(queryLower)
      ) {
        yield task;
      }
    }
  }

  async indexTasks(tasks: Iterable<any>): Promise<number> {
    let count = 0;
    for (const task of tasks) {
      await this.setTask(task);
      count++;
    }
    return count;
  }

  async getTaskCount(): Promise<number> {
    return this.tasks.size;
  }

  async getLastIndexed(): Promise<Date | undefined> {
    return new Date();
  }

  async rebuildIndex(): Promise<void> {
    // Mock implementation
  }

  async sweepExpired(): Promise<number> {
    return 0;
  }

  async close(): Promise<void> {
    this.tasks.clear();
  }
}

// Test setup
const createTestDirectory = async (): Promise<string> => {
  const testDir = await fs.mkdtemp(path.join(tmpdir(), 'directory-adapter-test-'));
  return testDir;
};

const createTestConfig = (baseDir: string): DirectoryAdapterConfig => ({
  ...TEST_CONFIG,
  baseDirectory: baseDir,
  backup: {
    ...TEST_CONFIG.backup,
    directory: path.join(baseDir, 'backups')
  }
});

const createTestTask = (uuid: string, title: string, overrides: any = {}) => ({
  id: uuid,
  uuid,
  title,
  status: 'todo',
  priority: 'medium',
  owner: 'test-user',
  labels: ['test'],
  created: new Date().toISOString(),
  updated: new Date().toISOString(),
  content: `# ${title}\n\nThis is a test task.`,
  ...overrides
});

test.beforeEach(async t => {
  t.context.testDir = await createTestDirectory();
  t.context.config = createTestConfig(t.context.testDir);
  t.context.mockCache = new MockTaskCache();
});

test.afterEach(async t => {
  // Clean up test directory
  try {
    await fs.rm(t.context.testDir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
});

test('should create DirectoryAdapter instance', t => {
  const { config, mockCache } = t.context;
  const adapter = createDirectoryAdapter(config, mockCache);
  
  t.true(adapter instanceof DirectoryAdapter);
});

test('should create a new task file', async t => {
  const { config, mockCache } = t.context;
  const adapter = createDirectoryAdapter(config, mockCache);
  
  const task = createTestTask('test-uuid', 'Test Task');
  const result = await adapter.createTaskFile(task);
  
  t.true(result.success);
  t.is(result.error, undefined);
  
  // Verify file exists
  const filePath = path.join(config.baseDirectory, 'test-uuid.md');
  const exists = await fs.access(filePath).then(() => true).catch(() => false);
  t.true(exists);
  
  // Verify cache was updated
  const cachedTask = await mockCache.getTask('test-uuid');
  t.truthy(cachedTask);
  t.is(cachedTask.title, 'Test Task');
});

test('should read an existing task file', async t => {
  const { config, mockCache } = t.context;
  const adapter = createDirectoryAdapter(config, mockCache);
  
  // First create a task
  const task = createTestTask('read-uuid', 'Read Test Task');
  await adapter.createTaskFile(task);
  
  // Clear cache to test file reading
  await mockCache.removeTask('read-uuid');
  
  // Read the task
  const result = await adapter.readTaskFile('read-uuid');
  
  t.true(result.success);
  t.truthy(result.data);
  t.is(result.data.title, 'Read Test Task');
  t.is(result.data.uuid, 'read-uuid');
});

test('should update an existing task file', async t => {
  const { config, mockCache } = t.context;
  const adapter = createDirectoryAdapter(config, mockCache);
  
  // Create initial task
  const task = createTestTask('update-uuid', 'Original Title');
  await adapter.createTaskFile(task);
  
  // Update the task
  const updates = { title: 'Updated Title', status: 'in_progress' };
  const result = await adapter.updateTaskFile('update-uuid', updates);
  
  t.true(result.success);
  
  // Verify update
  const readResult = await adapter.readTaskFile('update-uuid');
  t.true(readResult.success);
  t.is(readResult.data.title, 'Updated Title');
  t.is(readResult.data.status, 'in_progress');
});

test('should delete a task file', async t => {
  const { config, mockCache } = t.context;
  const adapter = createDirectoryAdapter(config, mockCache);
  
  // Create a task
  const task = createTestTask('delete-uuid', 'Delete Test Task');
  await adapter.createTaskFile(task);
  
  // Delete the task
  const result = await adapter.deleteTaskFile('delete-uuid');
  
  t.true(result.success);
  
  // Verify file is gone
  const filePath = path.join(config.baseDirectory, 'delete-uuid.md');
  const exists = await fs.access(filePath).then(() => true).catch(() => false);
  t.false(exists);
  
  // Verify cache was updated
  const cachedTask = await mockCache.getTask('delete-uuid');
  t.falsy(cachedTask);
});

test('should move/rename a task file', async t => {
  const { config, mockCache } = t.context;
  const adapter = createDirectoryAdapter(config, mockCache);
  
  // Create a task
  const task = createTestTask('move-uuid', 'Original Title');
  await adapter.createTaskFile(task);
  
  // Move the task
  const result = await adapter.moveTaskFile('move-uuid', 'New Title');
  
  t.true(result.success);
  
  // Verify old file is gone
  const oldPath = path.join(config.baseDirectory, 'move-uuid.md');
  const oldExists = await fs.access(oldPath).then(() => true).catch(() => false);
  t.false(oldExists);
  
  // Verify new file exists (title-based naming)
  const readResult = await adapter.readTaskFile('move-uuid');
  t.true(readResult.success);
  t.is(readResult.data.title, 'New Title');
});

test('should list task files', async t => {
  const { config, mockCache } = t.context;
  const adapter = createDirectoryAdapter(config, mockCache);
  
  // Create multiple tasks
  const tasks = [
    createTestTask('list-1', 'Task 1', { status: 'todo' }),
    createTestTask('list-2', 'Task 2', { status: 'done' }),
    createTestTask('list-3', 'Task 3', { status: 'in_progress' })
  ];
  
  for (const task of tasks) {
    await adapter.createTaskFile(task);
  }
  
  // List all tasks
  const result = await adapter.listTaskFiles();
  
  t.true(result.success);
  t.truthy(result.data);
  t.is(result.data.length, 3);
});

test('should search task files', async t => {
  const { config, mockCache } = t.context;
  const adapter = createDirectoryAdapter(config, mockCache);
  
  // Create tasks with searchable content
  const tasks = [
    createTestTask('search-1', 'Database Migration', { content: 'Migrate user data to PostgreSQL' }),
    createTestTask('search-2', 'API Development', { content: 'Create REST API endpoints' }),
    createTestTask('search-3', 'Database Backup', { content: 'Automate database backups' })
  ];
  
  for (const task of tasks) {
    await adapter.createTaskFile(task);
  }
  
  // Search for "database"
  const result = await adapter.searchTaskFiles('database');
  
  t.true(result.success);
  t.truthy(result.data);
  t.true(result.data.length >= 2); // Should find tasks 1 and 3
});

test('should validate task file structure', async t => {
  const { config, mockCache } = t.context;
  const adapter = createDirectoryAdapter(config, mockCache);
  
  // Create a valid task
  const task = createTestTask('validate-uuid', 'Validation Test');
  await adapter.createTaskFile(task);
  
  // Validate the task
  const result = await adapter.validateTaskFile('validate-uuid');
  
  t.true(result.success);
  t.truthy(result.data);
  t.true(result.data.valid);
  t.is(result.data.errors.length, 0);
});

test('should handle file not found errors', async t => {
  const { config, mockCache } = t.context;
  const adapter = createDirectoryAdapter(config, mockCache);
  
  // Try to read non-existent task
  const result = await adapter.readTaskFile('non-existent');
  
  t.false(result.success);
  t.truthy(result.error);
  t.true(result.error.includes('not found'));
});

test('should prevent path traversal attacks', async t => {
  const { config, mockCache } = t.context;
  const adapter = createDirectoryAdapter(config, mockCache);
  
  // Try to create a task with path traversal
  const maliciousTask = createTestTask('../etc/passwd', 'Malicious Task');
  const result = await adapter.createTaskFile(maliciousTask);
  
  t.false(result.success);
  t.truthy(result.error);
  t.true(result.error.includes('security') || result.error.includes('traversal'));
});

test('should reject dangerous file extensions', async t => {
  const { config, mockCache } = t.context;
  const adapter = createDirectoryAdapter(config, mockCache);
  
  // Create a task with executable content
  const task = createTestTask('executable-uuid', 'Executable Test');
  task.content = '<script>alert("xss")</script>';
  
  const result = await adapter.createTaskFile(task);
  
  t.false(result.success);
  t.truthy(result.error);
  t.true(result.error.includes('dangerous') || result.error.includes('security'));
});

test('should create backups when enabled', async t => {
  const { config, mockCache } = t.context;
  const backupConfig = { ...config, backup: { ...config.backup, enabled: true } };
  const adapter = createDirectoryAdapter(backupConfig, mockCache);
  
  // Create a task
  const task = createTestTask('backup-uuid', 'Backup Test');
  await adapter.createTaskFile(task);
  
  // Update the task (should create backup)
  const updates = { title: 'Updated Title' };
  const result = await adapter.updateTaskFile('backup-uuid', updates);
  
  t.true(result.success);
  t.truthy(result.metadata.backupPath);
  
  // Verify backup exists
  const backupExists = await fs.access(result.metadata.backupPath).then(() => true).catch(() => false);
  t.true(backupExists);
});

test('should track performance metrics', async t => {
  const { config, mockCache } = t.context;
  const adapter = createDirectoryAdapter(config, mockCache);
  
  // Perform some operations
  const task = createTestTask('metrics-uuid', 'Metrics Test');
  await adapter.createTaskFile(task);
  await adapter.readTaskFile('metrics-uuid');
  await adapter.updateTaskFile('metrics-uuid', { title: 'Updated' });
  
  // Check metrics
  const metrics = adapter.getPerformanceMetrics();
  
  t.true(metrics.totalOperations >= 3);
  t.true(metrics.operationCounts.create >= 1);
  t.true(metrics.operationCounts.read >= 1);
  t.true(metrics.operationCounts.update >= 1);
  t.true(metrics.averageDurations.create > 0);
});

test('should handle cache integration', async t => {
  const { config, mockCache } = t.context;
  const cacheConfig = { ...config, cache: { ...config.cache, enabled: true } };
  const adapter = createDirectoryAdapter(cacheConfig, mockCache);
  
  // Create a task
  const task = createTestTask('cache-uuid', 'Cache Test');
  await adapter.createTaskFile(task);
  
  // Read task (should hit cache)
  const result1 = await adapter.readTaskFile('cache-uuid');
  t.true(result1.success);
  
  // Read again (should definitely hit cache)
  const result2 = await adapter.readTaskFile('cache-uuid');
  t.true(result2.success);
  
  // Verify cache has the task
  const cachedTask = await mockCache.getTask('cache-uuid');
  t.truthy(cachedTask);
  t.is(cachedTask.title, 'Cache Test');
});

test('should clean up resources properly', async t => {
  const { config, mockCache } = t.context;
  const adapter = createDirectoryAdapter(config, mockCache);
  
  // Create a task
  const task = createTestTask('cleanup-uuid', 'Cleanup Test');
  await adapter.createTaskFile(task);
  
  // Close adapter
  await adapter.close();
  
  // Verify cache was closed
  const cachedTask = await mockCache.getTask('cleanup-uuid');
  t.falsy(cachedTask); // Cache should be empty after close
});

test('should handle concurrent operations safely', async t => {
  const { config, mockCache } = t.context;
  const adapter = createDirectoryAdapter(config, mockCache);
  
  // Create multiple tasks concurrently
  const tasks = Array.from({ length: 10 }, (_, i) => 
    createTestTask(`concurrent-${i}`, `Concurrent Task ${i}`)
  );
  
  const promises = tasks.map(task => adapter.createTaskFile(task));
  const results = await Promise.all(promises);
  
  // All operations should succeed
  t.true(results.every(result => result.success));
  
  // Verify all tasks were created
  const listResult = await adapter.listTaskFiles();
  t.is(listResult.data.length, 10);
});