import type { StoreConfig } from './types.js';
import { StoreNames } from './types.js';

/**
 * Centralized store configurations for all data stores
 */
export const STORE_CONFIGS: Record<StoreNames, StoreConfig> = {
  [StoreNames.SESSION]: {
    name: StoreNames.SESSION,
    textKey: 'text',
    timestampKey: 'timestamp',
    description: 'OpenCode session metadata and information',
  },

  [StoreNames.EVENT]: {
    name: StoreNames.EVENT,
    textKey: 'text',
    timestampKey: 'timestamp',
    description: 'OpenCode system events and logs',
  },

  [StoreNames.MESSAGE]: {
    name: StoreNames.MESSAGE,
    textKey: 'text',
    timestampKey: 'timestamp',
    description: 'OpenCode chat messages and conversations',
  },

  [StoreNames.FILE_INDEX]: {
    name: StoreNames.FILE_INDEX,
    textKey: 'content',
    timestampKey: 'lastModified',
    description: 'File content and metadata for indexed files',
  },
};

/**
 * OpenCode store configurations
 */
export const OPENCODE_STORES = [StoreNames.SESSION, StoreNames.EVENT, StoreNames.MESSAGE] as const;

/**
 * File system store configurations
 */
export const FILE_SYSTEM_STORES = [StoreNames.FILE_INDEX] as const;

/**
 * All store names
 */
export const ALL_STORES = [...OPENCODE_STORES, ...FILE_SYSTEM_STORES] as const;
