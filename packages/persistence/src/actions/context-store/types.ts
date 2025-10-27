import type { Where } from 'chromadb';

import type { DualStoreEntry } from '../../types.js';

export type ContextMessage = {
    role: 'user' | 'assistant' | 'system';
    content: string;
    images?: string[];
};

export type DualStoreAdapter = {
    getMostRelevant: (
        queryTexts: string[],
        limit: number,
        where?: Record<string, unknown>,
    ) => Promise<DualStoreEntry<'text', 'timestamp'>[]>;
    getMostRecent: (limit?: number) => Promise<DualStoreEntry<'text', 'timestamp'>[]>;
};

export type ContextState = {
    collections: ReadonlyMap<string, DualStoreAdapter>;
    formatTime: (epochMs: number) => string;
    assistantName: string;
};

export type ContextDependencies = {
    state: ContextState;
    createDualStore: (name: string, textKey: string, timeStampKey: string) => Promise<DualStoreAdapter>;
};

export type StateUpdate<Value> = {
    state: ContextState;
    value: Value;
};

export type CreateCollectionInputs = {
    name: string;
    textKey: string;
    timeStampKey: string;
};

export type GetOrCreateCollectionInputs = {
    name: string;
    textKey?: string;
    timeStampKey?: string;
};

export type GetCollectionInputs = {
    name: string;
};

export type RelatedDocumentsInputs = {
    queries: readonly string[];
    limit?: number;
    where?: Where;
};

export type LatestDocumentsInputs = {
    limit?: number;
};

export type CompileContextInputs = {
    texts?: readonly string[];
    recentLimit?: number;
    queryLimit?: number;
    limit?: number;
    formatAssistantMessages?: boolean;
};

