/**
 * Test data for pantheon-persistence tests
 */

import type { ContextSource } from '@promethean-os/pantheon-core';

export const validContextSources: ContextSource[] = [
  { id: 'user-context', label: 'User Context' },
  { id: 'system-context', label: 'System Context' },
  { id: 'assistant-context', label: 'Assistant Context' },
  { id: 'shared-context', label: 'Shared Context' },
];

export const emptyContextSources: ContextSource[] = [];

export const mixedContextSources: ContextSource[] = [
  { id: 'user-context', label: 'User Context' },
  { id: 'non-existent-context', label: 'Non-existent Context' },
  { id: 'system-context', label: 'System Context' },
];

export const testMetadata = {
  user: {
    role: 'user',
    displayName: 'Test User',
    name: 'testuser',
    id: 'user-123',
  },
  assistant: {
    role: 'assistant',
    type: 'assistant',
    displayName: 'AI Assistant',
    name: 'assistant',
    id: 'assistant-456',
  },
  system: {
    role: 'system',
    type: 'system',
    displayName: 'System',
    name: 'system',
    id: 'system-789',
  },
  minimal: {
    id: 'minimal-001',
  },
  empty: {},
  null: null as any,
  undefined: undefined as any,
};

export const testTimestamps = {
  now: Date.now(),
  past: Date.now() - 86400000, // 1 day ago
  future: Date.now() + 86400000, // 1 day in future
  zero: 0,
  negative: -1000,
  string: '1234567890',
  invalid: 'invalid-timestamp',
};

export const performanceTestData = {
  smallSourceCount: 5,
  mediumSourceCount: 50,
  largeSourceCount: 500,
  concurrentRequests: 10,
  timeoutMs: 5000,
};
