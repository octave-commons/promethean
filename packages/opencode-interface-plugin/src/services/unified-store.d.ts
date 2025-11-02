import type { GenericEntry } from '@promethean-os/persistence';
export interface SearchOptions {
    readonly limit?: number;
    readonly sessionId?: string;
    readonly includeSessions?: boolean;
    readonly includeMessages?: boolean;
    readonly includeEvents?: boolean;
}
export interface SearchResults {
    readonly sessions: readonly GenericEntry[];
    readonly messages: readonly GenericEntry[];
    readonly events: readonly GenericEntry[];
}
export declare const sessionStoreAccess: {
    insert: (entry: any) => Promise<any>;
    getMostRecent: (limit?: number) => Promise<import("@promethean-os/persistence").DualStoreEntry<"text", "timestamp">[]>;
    getMostRelevant: (queries: readonly string[], limit?: number) => Promise<import("@promethean-os/persistence").DualStoreEntry<"text", "timestamp">[]>;
};
export declare const eventStoreAccess: {
    insert: (entry: any) => Promise<any>;
    getMostRecent: (limit?: number) => Promise<import("@promethean-os/persistence").DualStoreEntry<"text", "timestamp">[]>;
    getMostRelevant: (queries: readonly string[], limit?: number) => Promise<import("@promethean-os/persistence").DualStoreEntry<"text", "timestamp">[]>;
};
export declare const messageStoreAccess: {
    insert: (entry: any) => Promise<any>;
    getMostRecent: (limit?: number) => Promise<import("@promethean-os/persistence").DualStoreEntry<"text", "timestamp">[]>;
    getMostRelevant: (queries: readonly string[], limit?: number) => Promise<import("@promethean-os/persistence").DualStoreEntry<"text", "timestamp">[]>;
};
/**
 * Search across multiple stores with unified interface
 */
export declare const searchAcrossStores: (query: string, options?: SearchOptions) => Promise<SearchResults>;
//# sourceMappingURL=unified-store.d.ts.map