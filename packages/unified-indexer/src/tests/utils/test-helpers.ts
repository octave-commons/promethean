/**
 * Test Helpers for Unified Indexer Tests
 *
 * Common utilities and helper functions for testing
 */

import type {
  SearchQuery,
  SearchResponse,
  IndexableContent,
  ContentType,
  ContentSource,
  ContentMetadata,
  FileMetadata,
} from '@promethean-os/persistence';

/**
 * Wait for a specified amount of time
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a mock search response
 */
export function createMockSearchResponse(overrides: Partial<SearchResponse> = {}): SearchResponse {
  return {
    results: [],
    total: 0,
    took: 25,
    query: {
      query: 'test query',
      limit: 10,
    } as SearchQuery,
    ...overrides,
  };
}

/**
 * Create mock indexable content
 */
export function createMockContent(overrides: Partial<IndexableContent> = {}): IndexableContent {
  const fileMetadata: FileMetadata = {
    type: 'file',
    source: 'filesystem',
    path: '/test/file.txt',
    size: 25,
  };

  return {
    id: 'test-id-' + Math.random().toString(36).substring(2, 11),
    type: 'file' as ContentType,
    source: 'filesystem' as ContentSource,
    content: 'Test content for indexing',
    metadata: fileMetadata as ContentMetadata,
    timestamp: Date.now(),
    ...overrides,
  };
}

/**
 * Create multiple mock content items
 */
export function createMockContentList(
  count: number,
  overrides: Partial<IndexableContent> = {},
): IndexableContent[] {
  return Array.from({ length: count }, (_, index) =>
    createMockContent({
      id: `test-id-${index}`,
      content: `Test content ${index}`,
      metadata: {
        type: 'file',
        source: 'filesystem',
        path: `/test/file-${index}.txt`,
        size: 20 + index,
      } as ContentMetadata,
      ...overrides,
    }),
  );
}

/**
 * Create mock service status
 */
export function createMockServiceStatus(
  overrides: Partial<{
    healthy: boolean;
    indexing: boolean;
    lastSync: number;
    nextSync: number;
    activeSources: ContentSource[];
    issues: string[];
  }> = {},
): {
  healthy: boolean;
  indexing: boolean;
  lastSync: number;
  nextSync: number;
  activeSources: ContentSource[];
  issues: string[];
} {
  return {
    healthy: true,
    indexing: false,
    lastSync: Date.now(),
    nextSync: Date.now() + 300000,
    activeSources: ['filesystem' as ContentSource],
    issues: [],
    ...overrides,
  };
}

/**
 * Create mock indexer stats
 */
export function createMockIndexerStats(
  overrides: Partial<{
    total: {
      totalContent: number;
      contentByType: Record<ContentType, number>;
      contentBySource: Record<ContentSource, number>;
      lastIndexed: number;
      storageStats: { vectorSize: number; metadataSize: number; totalSize: number };
    };
    bySource: Record<string, unknown>;
    byType: Record<ContentType, number>;
    lastSync: number;
    syncDuration: number;
    errors: string[];
  }> = {},
): {
  total: {
    totalContent: number;
    contentByType: Record<ContentType, number>;
    contentBySource: Record<ContentSource, number>;
    lastIndexed: number;
    storageStats: { vectorSize: number; metadataSize: number; totalSize: number };
  };
  bySource: Record<string, unknown>;
  byType: Record<ContentType, number>;
  lastSync: number;
  syncDuration: number;
  errors: string[];
} {
  return {
    total: {
      totalContent: 100,
      contentByType: {
        file: 80,
        document: 20,
      } as Record<ContentType, number>,
      contentBySource: {
        filesystem: 100,
      } as Record<ContentSource, number>,
      lastIndexed: Date.now(),
      storageStats: {
        vectorSize: 1024000,
        metadataSize: 512000,
        totalSize: 1536000,
      },
    },
    bySource: {},
    byType: {
      file: 80,
      document: 20,
    } as Record<ContentType, number>,
    lastSync: Date.now(),
    syncDuration: 5000,
    errors: [],
    ...overrides,
  };
}

/**
 * Create mock cross-domain search response
 */
export function createMockCrossDomainSearchResponse(
  overrides: Partial<{
    results: unknown[];
    total: number;
    took: number;
    query: CrossDomainSearchOptions;
  }> = {},
): { results: unknown[]; total: number; took: number; query: CrossDomainSearchOptions } {
  return {
    results: [],
    total: 0,
    took: 50,
    query: {
      query: 'test query',
      limit: 10,
    } as CrossDomainSearchOptions,
    ...overrides,
  };
}

/**
 * Assert that a promise rejects with expected error
 */
export async function assertRejects(
  t: { fail: (message: string) => void; true: (value: unknown) => void },
  promise: Promise<unknown>,
  expectedMessage?: string,
): Promise<void> {
  try {
    await promise;
    t.fail('Expected promise to reject');
  } catch (error) {
    if (expectedMessage) {
      t.true(
        (error as Error).message.includes(expectedMessage),
        `Expected error message to contain "${expectedMessage}", got "${(error as Error).message}"`,
      );
    }
  }
}

/**
 * Measure execution time of a function
 */
export async function measureTime<T>(
  fn: () => Promise<T>,
): Promise<{ result: T; duration: number }> {
  const start = Date.now();
  const result = await fn();
  const duration = Date.now() - start;
  return { result, duration };
}

/**
 * Create a temporary directory for testing
 */
export function createTempDir(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  return `/tmp/unified-indexer-test-${timestamp}-${random}`;
}

/**
 * Generate random string of specified length
 */
export function randomString(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Create a test file with content
 */
export async function createTestFile(filePath: string, content: string): Promise<void> {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');

  // Ensure directory exists
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  // Write file
  await fs.writeFile(filePath, content, 'utf8');
}

/**
 * Clean up test files and directories
 */
export async function cleanupTestFiles(dirPath: string): Promise<void> {
  const fs = await import('node:fs/promises');
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
  } catch (error) {
    // Ignore cleanup errors
  }
}

/**
 * Validate that an object has required properties
 */
export function validateRequiredProperties(
  obj: Record<string, unknown>,
  requiredProps: string[],
): boolean {
  return requiredProps.every((prop) => Object.prototype.hasOwnProperty.call(obj, prop));
}

// Type for CrossDomainSearchOptions to avoid import issues
interface CrossDomainSearchOptions {
  query: string;
  limit?: number;
  semantic?: boolean;
}
