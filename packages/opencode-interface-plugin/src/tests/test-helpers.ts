// SPDX-License-Identifier: GPL-3.0-only

/**
 * Test helpers for mocking store initialization and other dependencies
 */

// Mock store manager for testing
export class MockDualStoreManager {
  constructor(
    public name: string,
    public textType: string,
    public timestampType: string,
  ) {}

  async insert() {
    return { id: 'mock-id' };
  }

  async search() {
    return {
      results: [],
      total: 0,
    };
  }

  async get() {
    return null;
  }

  async list() {
    return [];
  }
}

// Mock the initializeStores function
export async function mockInitializeStores(): Promise<Record<string, MockDualStoreManager>> {
  console.log('🔧 Using mock stores for testing...');

  return {
    sessions: new MockDualStoreManager('sessions', 'text', 'timestamp'),
    events: new MockDualStoreManager('events', 'text', 'timestamp'),
    messages: new MockDualStoreManager('messages', 'text', 'timestamp'),
  };
}

// Mock the compileContext function
export async function mockCompileContext(_options: {
  texts: string[];
  limit?: number;
}): Promise<any[]> {
  return [];
}

// Mock the searchAcrossStores function
export async function mockSearchAcrossStores(
  _query: string,
  _options: {
    limit?: number;
    sessionId?: string;
    includeSessions?: boolean;
    includeMessages?: boolean;
    includeEvents?: boolean;
  } = {},
) {
  return {
    sessions: [],
    events: [],
    messages: [],
  };
}
