import type { DualStoreEntry } from '../../types.js';
import type { ContextMessage, ContextState, DualStoreAdapter } from './types.js';
export type GenericEntry = DualStoreEntry<'text', 'timestamp'>;
export declare const formatMessage: (entry: GenericEntry, formatTime: (epochMs: number) => string) => string;
export declare const dedupeByText: (entries: readonly GenericEntry[]) => GenericEntry[];
export declare const sortByTimestamp: (entries: readonly GenericEntry[]) => GenericEntry[];
export declare const limitByCollectionCount: (entries: readonly GenericEntry[], limit: number, collectionCount: number) => GenericEntry[];
export declare const toMessage: (entry: GenericEntry, formatAssistantMessages: boolean, state: ContextState) => ContextMessage;
export declare const getCollections: (state: ContextState) => readonly DualStoreAdapter[];
//# sourceMappingURL=utils.d.ts.map