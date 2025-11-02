import type { DualStoreEntry } from '../types.js';
import type { CompileContextInputs, ContextDependencies, ContextMessage, ContextState } from '../actions/context-store/index.js';
import {
    collectionCount,
    compileContext as compileContextAction,
    createCollection as createCollectionAction,
    getAllRelatedDocuments,
    getCollection as getCollectionAction,
    getLatestDocuments as getLatestDocumentsAction,
    getOrCreateCollection as getOrCreateCollectionAction,
    listCollectionNames,
    type DualStoreAdapter,
} from '../actions/context-store/index.js';
import type {
    CreateCollectionInputs,
    GetOrCreateCollectionInputs,
    RelatedDocumentsInputs,
    LatestDocumentsInputs,
} from '../actions/context-store/types.js';
import { DualStoreManager } from '../dualStore.js';

const defaultFormatTime = (ms: number) => new Date(ms).toISOString();

export type ContextStoreFactoryConfig = {
    formatTime?: (epochMs: number) => string;
    assistantName?: string;
    createDualStore?: (name: string, textKey: string, timeStampKey: string) => Promise<DualStoreAdapter>;
};

const createInitialState = (config: ContextStoreFactoryConfig): ContextState => ({
    collections: new Map(),
    formatTime: config.formatTime ?? defaultFormatTime,
    assistantName: config.assistantName ?? 'Duck',
});

export type ContextStoreImplementation = {
    readonly state: ContextState;
    createCollection(inputs: CreateCollectionInputs): Promise<DualStoreAdapter>;
    getOrCreateCollection(inputs: GetOrCreateCollectionInputs): Promise<DualStoreAdapter>;
    getCollection(name: string): DualStoreAdapter;
    collectionCount(): number;
    listCollectionNames(): readonly string[];
    getAllRelatedDocuments(inputs: RelatedDocumentsInputs): Promise<DualStoreEntry<'text', 'timestamp'>[]>;
    getLatestDocuments(inputs: LatestDocumentsInputs): Promise<DualStoreEntry<'text', 'timestamp'>[]>;
    compileContext(inputs?: CompileContextInputs): Promise<ContextMessage[]>;
};

const buildDependencies = (
    state: ContextState,
    config: ContextStoreFactoryConfig,
): ContextDependencies => ({
    state,
    createDualStore:
        config.createDualStore ?? ((name, textKey, timeStampKey) => DualStoreManager.create(name, textKey, timeStampKey)),
});

export const createContextStoreImplementation = (
    config: ContextStoreFactoryConfig = {},
): ContextStoreImplementation => {
    let currentState = createInitialState(config);

    const applyStateUpdate = <Value,>(
        updater: (dependencies: ContextDependencies) => Promise<{ state: ContextState; value: Value }> | { state: ContextState; value: Value },
    ): Promise<Value> => {
        const result = updater(buildDependencies(currentState, config));
        if (result instanceof Promise) {
            return result.then((resolved) => {
                currentState = resolved.state;
                return resolved.value;
            });
        }

        currentState = result.state;
        return Promise.resolve(result.value);
    };

    return {
        get state() {
            return currentState;
        },
        async createCollection(inputs) {
            return applyStateUpdate((dependencies) => createCollectionAction(inputs, dependencies));
        },
        async getOrCreateCollection(inputs) {
            return applyStateUpdate((dependencies) => getOrCreateCollectionAction(inputs, dependencies));
        },
        getCollection(name) {
            return getCollectionAction({ name }, buildDependencies(currentState, config));
        },
        collectionCount() {
            return collectionCount(buildDependencies(currentState, config));
        },
        listCollectionNames() {
            return listCollectionNames(buildDependencies(currentState, config));
        },
        async getAllRelatedDocuments(inputs) {
            return getAllRelatedDocuments(inputs, buildDependencies(currentState, config));
        },
        async getLatestDocuments(inputs) {
            return getLatestDocumentsAction(inputs, buildDependencies(currentState, config));
        },
        async compileContext(inputs) {
            return compileContextAction(inputs, buildDependencies(currentState, config));
        },
    };
};
