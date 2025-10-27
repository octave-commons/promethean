import test from 'ava';
import {
  createDataStoreManager,
  getDataStoreManager,
  resetGlobalDataStoreManager,
  StoreNames,
  OPENCODE_STORES,
  FILE_SYSTEM_STORES,
} from '../index.js';
import { ContextStore, __setContextStoreDualFactoryForTests } from '@promethean-os/persistence';
import type { DualStoreEntry, DualStoreManager } from '@promethean-os/persistence';

type QueryOptions = { limit?: number };

const normaliseTimestamp = (value: unknown): number => {
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return new Date(value).getTime();
  return Date.now();
};

type StoredEntry = DualStoreEntry<'text', 'timestamp'>;

class StubDualStore {
  readonly name: string;
  private readonly textKey: string;
  private readonly timeStampKey: string;
  private readonly docs: StoredEntry[] = [];
  readonly supportsImages = false;
  agent_name = 'stub-agent';
  embedding_fn = 'stub-embedding';
  readonly chromaCollection = {} as unknown;
  readonly mongoCollection = {} as unknown;

  constructor(name: string, textKey: string, timeStampKey: string) {
    this.name = name;
    this.textKey = textKey;
    this.timeStampKey = timeStampKey;
  }

  private toStoredEntry(entry: DualStoreEntry<string, string>): StoredEntry {
    const rawText = entry[this.textKey as keyof typeof entry];
    const text = typeof rawText === 'string' ? rawText : '';
    const rawTimestamp = entry[this.timeStampKey as keyof typeof entry];
    const timestamp =
      rawTimestamp !== undefined ? rawTimestamp : (entry.timestamp as unknown as number | Date | string | undefined);
    const metadata = (entry.metadata as Record<string, unknown>) ?? {};
    const id = entry.id ?? `stub-${Date.now()}-${Math.random()}`;

    return {
      id,
      text,
      timestamp: timestamp ?? Date.now(),
      metadata,
    } satisfies StoredEntry;
  }

  async insert(entry: DualStoreEntry<string, string>): Promise<void> {
    const stored = this.toStoredEntry(entry);
    this.docs.push(stored);
  }

  async addEntry(entry: DualStoreEntry<string, string>): Promise<void> {
    await this.insert(entry);
  }

  async getMostRecent(limit: number = 10): Promise<StoredEntry[]> {
    return [...this.docs]
      .sort((a, b) => normaliseTimestamp(b.timestamp) - normaliseTimestamp(a.timestamp))
      .slice(0, limit)
      .map((doc) => ({ ...doc }));
  }

  async getMostRelevant(
    queries: readonly string[],
    limit: number,
    _where?: unknown,
  ): Promise<StoredEntry[]> {
    if (queries.length === 0) {
      return [];
    }

    const matcher = (entry: StoredEntry): boolean =>
      queries.some((query) => entry.text.toLowerCase().includes(query.toLowerCase()));

    return this.docs.filter(matcher).slice(0, limit).map((doc) => ({ ...doc }));
  }

  async get(id: string): Promise<StoredEntry | null> {
    const found = this.docs.find((doc) => doc.id === id);
    return found ? { ...found } : null;
  }

  getMongoCollection(): unknown {
    return this.mongoCollection;
  }

  getChromaCollection(): unknown {
    return this.chromaCollection;
  }

  async cleanup(): Promise<void> {
    this.docs.splice(0, this.docs.length);
  }
}

type StubEnvironment = {
  manager: ReturnType<typeof createDataStoreManager>;
};

const createStubEnvironment = (
  formatTime: (epochMs: number) => string = (ms) => new Date(ms).toISOString(),
  assistantName: string = 'Duck',
): StubEnvironment => {
  const manager = createDataStoreManager(formatTime, assistantName);

  return { manager };
};

test.beforeEach(async () => {
  __setContextStoreDualFactoryForTests(async (name, textKey, timeStampKey) => {
    const stub = new StubDualStore(name, textKey, timeStampKey);
    return stub as unknown as DualStoreManager<string, string>;
  });
  resetGlobalDataStoreManager();
});

test.afterEach.always(() => {
  __setContextStoreDualFactoryForTests(null);
  resetGlobalDataStoreManager();
});

test.serial('createDataStoreManager creates a functional manager', async (t) => {
  const { manager } = createStubEnvironment();

  await t.throwsAsync(() => manager.getStore(StoreNames.SESSION), { message: /not initialized/ });

  await t.notThrowsAsync(() => manager.initialize());

  await t.notThrowsAsync(() => manager.getStore(StoreNames.SESSION));
  await t.notThrowsAsync(() => manager.getStore(StoreNames.FILE_INDEX));
});

test.serial('getDataStoreManager returns singleton instance', async (t) => {
  const manager1 = getDataStoreManager();
  const manager2 = getDataStoreManager();

  t.is(manager1, manager2, 'Should return the same instance');
});

test.serial('manager initializes all stores', async (t) => {
  const { manager } = createStubEnvironment();
  await manager.initialize();

  const storeNames = manager.getStoreNames();

  for (const storeName of OPENCODE_STORES) {
    t.true(storeNames.includes(storeName), `Should include ${storeName}`);
  }

  for (const storeName of FILE_SYSTEM_STORES) {
    t.true(storeNames.includes(storeName), `Should include ${storeName}`);
  }
});

test.serial('can get individual stores', async (t) => {
  const { manager } = createStubEnvironment();
  await manager.initialize();

  const sessionStore = await manager.getStore(StoreNames.SESSION);
  t.truthy(sessionStore, 'Should get session store');

  const eventStore = await manager.getStore(StoreNames.EVENT);
  t.truthy(eventStore, 'Should get event store');

  const messageStore = await manager.getStore(StoreNames.MESSAGE);
  t.truthy(messageStore, 'Should get message store');

  const fileIndexStore = await manager.getStore(StoreNames.FILE_INDEX);
  t.truthy(fileIndexStore, 'Should get file index store');
});

test.serial('search across all stores', async (t) => {
  const { manager } = createStubEnvironment();
  await manager.initialize();

  const sessionStore = await manager.getStore(StoreNames.SESSION);
  const fileIndexStore = await manager.getStore(StoreNames.FILE_INDEX);

  await sessionStore.insert({
    id: 'test-session-1',
    text: 'Test session content',
    timestamp: Date.now(),
    metadata: {
      type: 'session',
      sessionId: 'session-1',
      title: 'Test Session',
    },
  });

  await fileIndexStore.insert({
    id: 'test-file-1',
    content: 'Test file content',
    lastModified: Date.now(),
    metadata: {
      type: 'file',
      filePath: '/test/file.txt',
      fileName: 'file.txt',
      fileSize: 100,
      fileType: 'txt',
      indexedAt: new Date(),
    },
  });

  const results = await manager.searchAcrossAllStores(['test'], { limit: 10 } as QueryOptions);

  t.true(results.length >= 2, 'Should find results from multiple stores');

  const sessionResult = results.find((r) => r.storeName === StoreNames.SESSION);
  const fileResult = results.find((r) => r.storeName === StoreNames.FILE_INDEX);

  t.truthy(sessionResult, 'Should find session result');
  t.truthy(fileResult, 'Should find file result');
});

test.serial('search in specific stores', async (t) => {
  const { manager } = createStubEnvironment();
  await manager.initialize();

  const sessionStore = await manager.getStore(StoreNames.SESSION);
  const messageStore = await manager.getStore(StoreNames.MESSAGE);

  await sessionStore.insert({
    id: 'test-session-1',
    text: 'Session specific content',
    timestamp: Date.now(),
    metadata: {
      type: 'session',
      sessionId: 'session-1',
      title: 'Test Session',
    },
  });

  await messageStore.insert({
    id: 'test-message-1',
    text: 'Message specific content',
    timestamp: Date.now(),
    metadata: {
      type: 'message',
      messageId: 'message-1',
      sessionId: 'session-1',
      role: 'user',
    },
  });

  const sessionResults = await manager.searchInStores([StoreNames.SESSION], ['specific'], { limit: 10 } as QueryOptions);

  t.true(sessionResults.length >= 1, 'Should find session results');
  const firstSessionResult = sessionResults[0];
  if (firstSessionResult) {
    t.is(firstSessionResult.storeName, StoreNames.SESSION, 'Should only return session results');
  }

  const messageResults = await manager.searchInStores([StoreNames.MESSAGE], ['specific'], { limit: 10 } as QueryOptions);

  t.true(messageResults.length >= 1, 'Should find message results');
  const firstMessageResult = messageResults[0];
  if (firstMessageResult) {
    t.is(firstMessageResult.storeName, StoreNames.MESSAGE, 'Should only return message results');
  }
});

test.serial('ContextStore constructor arguments are forwarded', async (t) => {
  const calls: { formatTime: string; assistantName: string }[] = [];

  const manager = createDataStoreManager(
    (ms) => `t-${ms}`,
    'Assistant',
    (formatTime, assistantName) => {
      const resolvedFormatTime = formatTime ?? ((value) => new Date(value).toISOString());
      const resolvedAssistant = assistantName ?? 'Duck';
      calls.push({ formatTime: resolvedFormatTime(0), assistantName: resolvedAssistant });
      return new ContextStore(formatTime, assistantName);
    },
  );

  await manager.initialize();

  t.deepEqual(calls, [{ formatTime: 't-0', assistantName: 'Assistant' }]);
});

test.serial('get latest from stores', async (t) => {
  const { manager } = createStubEnvironment();
  await manager.initialize();

  const sessionStore = await manager.getStore(StoreNames.SESSION);
  const eventStore = await manager.getStore(StoreNames.EVENT);

  const now = Date.now();
  const earlier = now - 1000;

  await sessionStore.insert({
    id: 'test-session-1',
    text: 'Earlier session',
    timestamp: earlier,
    metadata: {
      type: 'session',
      sessionId: 'session-1',
      title: 'Earlier Session',
    },
  });

  await eventStore.insert({
    id: 'test-event-1',
    text: 'Later event',
    timestamp: now,
    metadata: {
      type: 'event',
      eventType: 'test',
    },
  });

  const latestResults = await manager.getLatestFromAllStores(5);
  t.true(latestResults.length >= 2, 'Should get results from multiple stores');

  const sessionResults = await manager.getLatestFromStores([StoreNames.SESSION], 5);
  t.true(sessionResults.length >= 1, 'Should get session results');
  const firstLatestSessionResult = sessionResults[0];
  if (firstLatestSessionResult) {
    t.is(firstLatestSessionResult.storeName, StoreNames.SESSION, 'Should return session results');
  }
});

test.serial('cleanup resets manager state', async (t) => {
  const { manager } = createStubEnvironment();
  await manager.initialize();

  await t.notThrowsAsync(() => manager.getStore(StoreNames.SESSION));

  await manager.cleanup();

  await t.throwsAsync(() => manager.getStore(StoreNames.SESSION), { message: /not initialized/ });
});
