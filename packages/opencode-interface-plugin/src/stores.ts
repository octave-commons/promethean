// SPDX-License-Identifier: GPL-3.0-only

import { DualStoreManager } from '@promethean-os/persistence';

export const SESSION_STORE_NAME = 'sessions';
export const EVENT_STORE_NAME = 'events';
export const MESSAGE_STORE_NAME = 'messages';

// Store instances - will be initialized when needed
let sessionStoreInstance: DualStoreManager<'text', 'timestamp'> | null = null;
let eventStoreInstance: DualStoreManager<'text', 'timestamp'> | null = null;
let messageStoreInstance: DualStoreManager<'text', 'timestamp'> | null = null;
let contextStoreInstance: DualStoreManager<'text', 'timestamp'> | null = null;

// Store getters
export const getSessionStore = async (): Promise<DualStoreManager<'text', 'timestamp'>> => {
  if (!sessionStoreInstance) {
    sessionStoreInstance = await DualStoreManager.create('sessions', 'text', 'timestamp');
  }
  return sessionStoreInstance;
};

export const getEventStore = async (): Promise<DualStoreManager<'text', 'timestamp'>> => {
  if (!eventStoreInstance) {
    eventStoreInstance = await DualStoreManager.create('events', 'text', 'timestamp');
  }
  return eventStoreInstance;
};

export const getMessageStore = async (): Promise<DualStoreManager<'text', 'timestamp'>> => {
  if (!messageStoreInstance) {
    messageStoreInstance = await DualStoreManager.create('messages', 'text', 'timestamp');
  }
  return messageStoreInstance;
};

export const getContextStore = async (): Promise<DualStoreManager<'text', 'timestamp'>> => {
  if (!contextStoreInstance) {
    contextStoreInstance = await DualStoreManager.create('context', 'text', 'timestamp');
  }
  return contextStoreInstance;
};
