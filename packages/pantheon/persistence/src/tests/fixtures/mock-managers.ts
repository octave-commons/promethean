/**
 * Mock store managers for testing
 */

import type { DualStoreManager } from '@promethean-os/persistence';

// Create a minimal mock that satisfies the DualStoreManager interface
export const createMockManager = (name: string): DualStoreManager => {
  const mockManager = {
    name,
    chromaCollection: {} as any,
    mongoCollection: {} as any,
    textKey: 'text' as const,
    timeStampKey: 'createdAt' as const,
    supportsImages: false,
    // Mock essential methods
    addEntry: async () => ({ id: 'mock-id' }),
    getMostRecent: async () => [],
    getMostRelevant: async () => [],
    get: async () => null,
    cleanup: async () => undefined,
    close: async () => undefined,
  } as unknown as DualStoreManager;

  return mockManager;
};

export const mockManagers: DualStoreManager[] = [
  createMockManager('user-context'),
  createMockManager('system-context'),
  createMockManager('assistant-context'),
  createMockManager('shared-context'),
];

export const createFailingManager = (name: string): DualStoreManager => {
  const failingManager = {
    name,
    chromaCollection: {} as any,
    mongoCollection: {} as any,
    textKey: 'text' as const,
    timeStampKey: 'createdAt' as const,
    supportsImages: false,
    addEntry: async () => {
      throw new Error('Add entry failed');
    },
    getMostRecent: async () => {
      throw new Error('Get recent failed');
    },
    getMostRelevant: async () => {
      throw new Error('Get relevant failed');
    },
    get: async () => {
      throw new Error('Get failed');
    },
    cleanup: async () => {
      throw new Error('Cleanup failed');
    },
    close: async () => {
      throw new Error('Close failed');
    },
  } as unknown as DualStoreManager;

  return failingManager;
};

export const createSlowManager = (name: string, delay: number): DualStoreManager => {
  const slowManager = {
    name,
    chromaCollection: {} as any,
    mongoCollection: {} as any,
    textKey: 'text' as const,
    timeStampKey: 'createdAt' as const,
    supportsImages: false,
    addEntry: async () =>
      new Promise((resolve) => setTimeout(() => resolve({ id: 'mock-id' }), delay)),
    getMostRecent: async () => new Promise((resolve) => setTimeout(() => resolve([]), delay)),
    getMostRelevant: async () => new Promise((resolve) => setTimeout(() => resolve([]), delay)),
    get: async () => new Promise((resolve) => setTimeout(() => resolve(null), delay)),
    cleanup: async () => new Promise((resolve) => setTimeout(() => resolve(undefined), delay)),
    close: async () => new Promise((resolve) => setTimeout(() => resolve(undefined), delay)),
  } as unknown as DualStoreManager;

  return slowManager;
};
