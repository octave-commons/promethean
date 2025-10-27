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
  ContextMessage,
} from '@promethean-os/persistence';

import type {
  UnifiedIndexerServiceConfig,
  UnifiedIndexerStats,
  ServiceStatus,
} from '../../unified-indexer-service.js';

import type {
  CrossDomainSearchOptions,
  CrossDomainSearchResponse,
} from '../../cross-domain-search.js';

import sinon from 'sinon';

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
  return {
    id: 'test-id-' + Math.random().toString(36).substr(2, 9),
    type: 'file' as ContentType,
    source: 'filesystem' as ContentSource,
    content: 'Test content for indexing',
    metadata: {
      path: '/test/file.txt',
      size: 25,
    },
    timestamp: new Date(),
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
        path: `/test/file-${index}.txt`,
        size: 20 + index,
      },
      ...overrides,
    }),
  );
}

/**
 * Create mock service status
 */
export function createMockServiceStatus(overrides: Partial<ServiceStatus> = {}): ServiceStatus {
  return {
    healthy: true,
    indexing: false,
    lastSync: Date.now(),
    nextSync: Date.now() + 300000,
    activeSources: ['filesystem'],
    issues: [],
    ...overrides,
  };
}

/**
 * Create mock indexer stats
 */
export function createMockIndexerStats(
  overrides: Partial<UnifiedIndexerStats> = {},
): UnifiedIndexerStats {
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
  overrides: Partial<CrossDomainSearchResponse> = {},
): CrossDomainSearchResponse {
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
  t: any,
  promise: Promise<any>,
  expectedMessage?: string,
): Promise<void> {
  try {
    await promise;
    t.fail('Expected promise to reject');
  } catch (error) {
    if (expectedMessage) {
      t.true(
        error.message.includes(expectedMessage),
        `Expected error message to contain "${expectedMessage}", got "${error.message}"`,
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
  const random = Math.random().toString(36).substr(2, 9);
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
 * Spy on console methods for testing
 */
export function createConsoleSpy() {
  const spies = {
    log: sinon.spy(console, 'log'),
    error: sinon.spy(console, 'error'),
    warn: sinon.spy(console, 'warn'),
    info: sinon.spy(console, 'info'),
  };

  return {
    spies,
    restore: () => {
      Object.values(spies).forEach((spy) => spy.restore());
    },
  };
}

/**
 * Validate that an object has required properties
 */
export function validateRequiredProperties(obj: any, requiredProps: string[]): boolean {
  return requiredProps.every((prop) => obj.hasOwnProperty(prop));
}

/**
 * Create a mock event emitter for testing
 */
export function createMockEventEmitter() {
  const listeners: Record<string, Function[]> = {};

  return {
    on: (event: string, listener: Function) => {
      if (!listeners[event]) {
        listeners[event] = [];
      }
      listeners[event].push(listener);
    },

    emit: (event: string, ...args: any[]) => {
      if (listeners[event]) {
        listeners[event].forEach((listener) => listener(...args));
      }
    },

    removeAllListeners: (event?: string) => {
      if (event) {
        delete listeners[event];
      } else {
        Object.keys(listeners).forEach((key) => delete listeners[key]);
      }
    },

    listenerCount: (event: string) => {
      return listeners[event]?.length || 0;
    },
  };
}
