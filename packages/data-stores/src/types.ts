import type { DualStoreManager, DualStoreEntry, DualStoreMetadata } from '@promethean-os/persistence';

/**
 * Store names for all centralized data stores
 */
export enum StoreNames {
  // OpenCode stores
  SESSION = 'sessionStore',
  EVENT = 'eventStore',
  MESSAGE = 'messageStore',

  // File system stores
  FILE_INDEX = 'fileIndexStore',
}

/**
 * Base store configuration
 */
export interface StoreConfig {
  readonly name: StoreNames;
  readonly textKey: string;
  readonly timestampKey: string;
  readonly description: string;
}

/**
 * OpenCode store entry types
 */
export interface SessionEntry extends DualStoreEntry<'text', 'timestamp'> {
  readonly metadata: DualStoreMetadata & {
    readonly type: 'session';
    readonly sessionId: string;
    readonly title?: string;
    readonly projectId?: string;
  };
}

export interface EventEntry extends DualStoreEntry<'text', 'timestamp'> {
  readonly metadata: DualStoreMetadata & {
    readonly type: 'event';
    readonly eventType: string;
    readonly sessionId?: string;
  };
}

export interface MessageEntry extends DualStoreEntry<'text', 'timestamp'> {
  readonly metadata: DualStoreMetadata & {
    readonly type: 'message';
    readonly messageId: string;
    readonly sessionId: string;
    readonly role: 'system' | 'user' | 'assistant';
  };
}

/**
 * File system store entry types
 */
export interface FileIndexEntry extends DualStoreEntry<'content', 'lastModified'> {
  readonly metadata: DualStoreMetadata & {
    readonly type: 'file';
    readonly filePath: string;
    readonly fileName: string;
    readonly fileSize: number;
    readonly fileType: string;
    readonly indexedAt: Date;
  };
}

/**
 * Store type mapping
 */
export type StoreEntryMap = {
  [StoreNames.SESSION]: SessionEntry;
  [StoreNames.EVENT]: EventEntry;
  [StoreNames.MESSAGE]: MessageEntry;
  [StoreNames.FILE_INDEX]: FileIndexEntry;
};

/**
 * Store manager type mapping
 */
export type StoreManagerMap = {
  [StoreNames.SESSION]: DualStoreManager<'text', 'timestamp'>;
  [StoreNames.EVENT]: DualStoreManager<'text', 'timestamp'>;
  [StoreNames.MESSAGE]: DualStoreManager<'text', 'timestamp'>;
  [StoreNames.FILE_INDEX]: DualStoreManager<'content', 'lastModified'>;
};

/**
 * Generic store manager type
 */
export type AnyStoreManager = StoreManagerMap[StoreNames];

/**
 * Search options
 */
export interface SearchOptions {
  readonly limit?: number;
  readonly where?: import('chromadb').Where;
}

/**
 * Cross-store search result
 */
export interface CrossStoreSearchResult<T extends StoreNames = StoreNames> {
  readonly storeName: T;
  readonly entry: StoreEntryMap[T];
  readonly score?: number;
}

/**
 * Data store manager interface
 */
export interface IDataStoreManager {
  /**
   * Initialize all stores
   */
  initialize(): Promise<void>;

  /**
   * Get a specific store by name
   */
  getStore<T extends StoreNames>(name: T): Promise<StoreManagerMap[T]>;

  /**
   * Get all available store names
   */
  getStoreNames(): readonly StoreNames[];

  /**
   * Search across all stores
   */
  searchAcrossAllStores(
    queries: readonly string[],
    options?: SearchOptions,
  ): Promise<CrossStoreSearchResult[]>;

  /**
   * Search in specific stores
   */
  searchInStores<T extends StoreNames>(
    storeNames: readonly T[],
    queries: readonly string[],
    options?: SearchOptions,
  ): Promise<CrossStoreSearchResult<T>[]>;

  /**
   * Get latest documents from all stores
   */
  getLatestFromAllStores(limit?: number): Promise<CrossStoreSearchResult[]>;

  /**
   * Get latest documents from specific stores
   */
  getLatestFromStores<T extends StoreNames>(
    storeNames: readonly T[],
    limit?: number,
  ): Promise<CrossStoreSearchResult<T>[]>;

  /**
   * Cleanup all stores
   */
  cleanup(): Promise<void>;
}
