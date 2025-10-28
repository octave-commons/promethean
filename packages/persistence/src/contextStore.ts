import type { Where } from 'chromadb';

import type { ContextMessage, ContextState } from './actions/context-store/index.js';
import {
    collectionCount as collectionCountAction,
    compileContext as compileContextAction,
    createCollection as createCollectionAction,
    formatMessage,
    getAllRelatedDocuments as getAllRelatedDocumentsAction,
    getCollection as getCollectionAction,
    getLatestDocuments as getLatestDocumentsAction,
    getOrCreateCollection as getOrCreateCollectionAction,
    listCollectionNames as listCollectionNamesAction,
} from './actions/context-store/index.js';
import type {
    CompileContextInputs,
    ContextDependencies,
    CreateCollectionInputs,
    GetOrCreateCollectionInputs,
    RelatedDocumentsInputs,
} from './actions/context-store/types.js';
import { DualStoreManager } from './dualStore.js';
import {
    createContextStoreImplementation,
    type ContextStoreImplementation,
    type ContextStoreFactoryConfig,
} from './factories/contextStore.js';
import type { DualStoreEntry } from './types.js';

export { formatMessage };

export type ContextStoreState = ContextState;

const defaultFormatTime = (ms: number) => new Date(ms).toISOString();

const createDependencies = (state: ContextState): ContextDependencies => ({
    state,
    createDualStore: (name: string, textKey: string, timeStampKey: string) =>
        DualStoreManager.create(name, textKey, timeStampKey),
});

type CompileContextOptions = {
    readonly texts?: readonly string[];
    readonly recentLimit?: number;
    readonly queryLimit?: number;
    readonly limit?: number;
    readonly formatAssistantMessages?: boolean;
};

type LegacyCompileArgs = Readonly<[number?, number?, number?, boolean?]>;

const normaliseLegacyArgs = ([recentLimit, queryLimit, limit, formatAssistantMessages]: LegacyCompileArgs) => ({
    recentLimit,
    queryLimit,
    limit,
    formatAssistantMessages,
});

const isCompileContextOptions = (
    value: readonly string[] | CompileContextOptions | undefined,
): value is CompileContextOptions | undefined => !Array.isArray(value);

const resolveCompileOptions = (
    value: readonly string[] | CompileContextOptions | undefined,
    legacyArgs: LegacyCompileArgs,
): CompileContextOptions => {
    if (!isCompileContextOptions(value)) {
        return {
            ...normaliseLegacyArgs(legacyArgs),
            texts: value,
        } satisfies CompileContextOptions;
    }

    return value ?? {};
};

const sanitizeOptions = (options: CompileContextOptions): CompileContextInputs => {
    const definedEntries = Object.entries(options).filter(([, optionValue]) => optionValue !== undefined);
    return Object.fromEntries(definedEntries) as CompileContextInputs;
};

export const createContextStore = (
    formatTime: (epochMs: number) => string = defaultFormatTime,
    assistantName: string = 'Duck',
): ContextStoreState => ({
    collections: new Map(),
    formatTime,
    assistantName,
});

export const createCollection = async (
    state: ContextStoreState,
    name: string,
    textKey: string,
    timeStampKey: string,
): Promise<[ContextStoreState, DualStoreManager<string, string>]> => {
    const inputs: CreateCollectionInputs = { name, textKey, timeStampKey };
    const result = await createCollectionAction(inputs, createDependencies(state));
    return [result.state, result.value as DualStoreManager<string, string>];
};

export const getOrCreateCollection = async (
    state: ContextStoreState,
    name: string,
): Promise<[ContextStoreState, DualStoreManager<string, string>]> => {
    const inputs: GetOrCreateCollectionInputs = { name };
    const result = await getOrCreateCollectionAction(inputs, createDependencies(state));
    return [result.state, result.value as DualStoreManager<string, string>];
};

export const getCollection = (state: ContextStoreState, name: string): DualStoreManager<string, string> =>
    getCollectionAction({ name }, createDependencies(state)) as DualStoreManager<string, string>;

export const collectionCount = (state: ContextStoreState): number =>
    collectionCountAction(createDependencies(state));

export const listCollectionNames = (state: ContextStoreState): readonly string[] =>
    listCollectionNamesAction(createDependencies(state));

export const getAllRelatedDocuments = (
    state: ContextStoreState,
    queries: readonly string[],
    limit: number = 100,
    where?: Where,
): Promise<DualStoreEntry<'text', 'timestamp'>[]> => {
    const inputs: RelatedDocumentsInputs = { queries, limit, where };
    return getAllRelatedDocumentsAction(inputs, createDependencies(state));
};

export const getLatestDocuments = (
    state: ContextStoreState,
    limit: number = 100,
): Promise<DualStoreEntry<'text', 'timestamp'>[]> =>
    getLatestDocumentsAction({ limit }, createDependencies(state));

export const compileContext = async (
    state: ContextStoreState,
    textsOrOptions: readonly string[] | CompileContextOptions | undefined = [],
    ...legacyArgs: LegacyCompileArgs
): Promise<ContextMessage[]> => {
    const options = resolveCompileOptions(textsOrOptions, legacyArgs);
    const definedOptions = sanitizeOptions(options);
    return compileContextAction(definedOptions, createDependencies(state));
};

const warnDeprecationOnce = (() => {
    let warned = false;
    return () => {
        if (!warned) {
            warned = true;
            const message =
                'ContextStore is deprecated. Use the functional actions + factory pattern from src/actions/context-store instead.';
            if (typeof process !== 'undefined' && typeof process.emitWarning === 'function') {
                process.emitWarning(message, { code: 'ContextStoreDeprecation', type: 'DeprecationWarning' });
            } else {
                console.warn(message);
            }
        }
    };
})();

export class ContextStore {
    collections: Map<string, DualStoreManager<string, string>>;
    formatTime: (epochMs: number) => string;
    assistantName: string;

    private implementation: ContextStoreImplementation;

    constructor(formatTime: (epochMs: number) => string = defaultFormatTime, assistantName: string = 'Duck') {
        warnDeprecationOnce();
        this.implementation = createContextStoreImplementation({ formatTime, assistantName });
        const { collections, formatTime: fmt, assistantName: assistant } = this.implementation.state;
        this.collections = collections as unknown as Map<string, DualStoreManager<string, string>>;
        this.formatTime = fmt;
        this.assistantName = assistant;
    }

    private syncState(): void {
        const { formatTime, assistantName } = this.implementation.state;
        this.formatTime = formatTime;
        this.assistantName = assistantName;
    }

    async createCollection(name: string, textKey: string, timeStampKey: string) {
        const manager = await this.implementation.createCollection({ name, textKey, timeStampKey });
        this.syncState();
        return manager as DualStoreManager<string, string>;
    }

    async getOrCreateCollection(name: string) {
        const manager = await this.implementation.getOrCreateCollection({ name });
        this.syncState();
        return manager as DualStoreManager<string, string>;
    }

    getCollection(name: string) {
        return this.implementation.getCollection(name) as DualStoreManager<string, string>;
    }

    collectionCount() {
        return this.implementation.collectionCount();
    }

    listCollectionNames() {
        return this.implementation.listCollectionNames();
    }

    async getAllRelatedDocuments(queries: readonly string[], limit = 100, where?: Where) {
        return this.implementation.getAllRelatedDocuments({ queries, limit, where });
    }

    async getLatestDocuments(limit = 100) {
        return this.implementation.getLatestDocuments({ limit });
    }

    async compileContext(
        textsOrOptions: readonly string[] | CompileContextOptions | undefined = [],
        ...legacyArgs: LegacyCompileArgs
    ) {
        const options = resolveCompileOptions(textsOrOptions, legacyArgs);
        const definedOptions = sanitizeOptions(options);
        return this.implementation.compileContext(definedOptions);
    }
}

export const createContextStoreFactory = (config: ContextStoreFactoryConfig = {}) =>
    createContextStoreImplementation(config);
