import { DualStoreManager } from '@promethean-os/persistence';
export declare const SESSION_STORE_NAME = "sessions";
export declare const EVENT_STORE_NAME = "events";
export declare const MESSAGE_STORE_NAME = "messages";
export declare const getSessionStore: () => Promise<DualStoreManager<"text", "timestamp">>;
export declare const getEventStore: () => Promise<DualStoreManager<"text", "timestamp">>;
export declare const getMessageStore: () => Promise<DualStoreManager<"text", "timestamp">>;
export declare const getContextStore: () => Promise<DualStoreManager<"text", "timestamp">>;
//# sourceMappingURL=stores.d.ts.map