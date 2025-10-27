// SPDX-License-Identifier: GPL-3.0-only
import { DualStoreManager } from '@promethean-os/persistence';
export const SESSION_STORE_NAME = 'sessions';
export const EVENT_STORE_NAME = 'events';
export const MESSAGE_STORE_NAME = 'messages';
// Store instances - will be initialized when needed
let sessionStoreInstance = null;
let eventStoreInstance = null;
let messageStoreInstance = null;
let contextStoreInstance = null;
// Store getters
export const getSessionStore = async () => {
    if (!sessionStoreInstance) {
        sessionStoreInstance = await DualStoreManager.create('sessions', 'text', 'timestamp');
    }
    return sessionStoreInstance;
};
export const getEventStore = async () => {
    if (!eventStoreInstance) {
        eventStoreInstance = await DualStoreManager.create('events', 'text', 'timestamp');
    }
    return eventStoreInstance;
};
export const getMessageStore = async () => {
    if (!messageStoreInstance) {
        messageStoreInstance = await DualStoreManager.create('messages', 'text', 'timestamp');
    }
    return messageStoreInstance;
};
export const getContextStore = async () => {
    if (!contextStoreInstance) {
        contextStoreInstance = await DualStoreManager.create('context', 'text', 'timestamp');
    }
    return contextStoreInstance;
};
//# sourceMappingURL=stores.js.map