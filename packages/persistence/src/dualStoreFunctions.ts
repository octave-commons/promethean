import type { Where } from 'chromadb';
import type { Filter, Sort } from 'mongodb';

import type { DualStoreEntry } from './types.js';
import type { DualStoreManagerState } from './dualStore.js';

// Deprecation warning utility
const emitDeprecationWarning = (methodName: string): void => {
    console.warn(
        `[DEPRECATED] DualStoreManager.${methodName}() is deprecated. ` +
            `Use the standalone functions from './dualStoreFunctions.js' instead.`,
    );
};

// Wrapper functions that emit deprecation warnings
export const dualStoreManagerGetName = <TextKey extends string, TimeKey extends string>(
    state: DualStoreManagerState<TextKey, TimeKey>,
): string => {
    emitDeprecationWarning('name');
    return state.name;
};

export const dualStoreManagerGetAgentName = <TextKey extends string, TimeKey extends string>(
    state: DualStoreManagerState<TextKey, TimeKey>,
): string => {
    emitDeprecationWarning('agent_name');
    return state.agent_name;
};

export const dualStoreManagerGetEmbeddingFn = <TextKey extends string, TimeKey extends string>(
    state: DualStoreManagerState<TextKey, TimeKey>,
): string => {
    emitDeprecationWarning('embedding_fn');
    return state.embedding_fn;
};

export const dualStoreManagerInsert = async <TextKey extends string, TimeKey extends string>(
    state: DualStoreManagerState<TextKey, TimeKey>,
    entry: DualStoreEntry<TextKey, TimeKey>,
): Promise<void> => {
    emitDeprecationWarning('insert');
    const { insert } = await import('./dualStore.js');
    return insert(state, entry);
};

export const dualStoreManagerAddEntry = async <TextKey extends string, TimeKey extends string>(
    state: DualStoreManagerState<TextKey, TimeKey>,
    entry: DualStoreEntry<TextKey, TimeKey>,
): Promise<void> => {
    emitDeprecationWarning('addEntry');
    const { addEntry } = await import('./dualStore.js');
    return addEntry(state, entry);
};

export const dualStoreManagerGetMostRecent = async <TextKey extends string, TimeKey extends string>(
    state: DualStoreManagerState<TextKey, TimeKey>,
    limit = 10,
    mongoFilter?: Filter<DualStoreEntry<TextKey, TimeKey>>,
    sorter?: Sort,
): Promise<DualStoreEntry<'text', 'timestamp'>[]> => {
    emitDeprecationWarning('getMostRecent');
    const { getMostRecent } = await import('./dualStore.js');
    return getMostRecent(state, limit, mongoFilter, sorter);
};

export const dualStoreManagerGetMostRelevant = async <TextKey extends string, TimeKey extends string>(
    state: DualStoreManagerState<TextKey, TimeKey>,
    queryTexts: readonly string[],
    limit: number,
    where?: Where,
): Promise<DualStoreEntry<'text', 'timestamp'>[]> => {
    emitDeprecationWarning('getMostRelevant');
    const { getMostRelevant } = await import('./dualStore.js');
    return getMostRelevant(state, queryTexts, limit, where);
};

export const dualStoreManagerGet = async <TextKey extends string, TimeKey extends string>(
    state: DualStoreManagerState<TextKey, TimeKey>,
    id: string,
): Promise<DualStoreEntry<'text', 'timestamp'> | null> => {
    emitDeprecationWarning('get');
    const { get } = await import('./dualStore.js');
    return get(state, id);
};

export const dualStoreManagerCleanup = async (): Promise<void> => {
    emitDeprecationWarning('cleanup');
    const { cleanup } = await import('./dualStore.js');
    return cleanup();
};
