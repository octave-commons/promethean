import { collectionCount as collectionCountAction, compileContext as compileContextAction, createCollection as createCollectionAction, formatMessage, getAllRelatedDocuments as getAllRelatedDocumentsAction, getCollection as getCollectionAction, getLatestDocuments as getLatestDocumentsAction, getOrCreateCollection as getOrCreateCollectionAction, listCollectionNames as listCollectionNamesAction, } from './actions/context-store/index.js';
import { DualStoreManager } from './dualStore.js';
import { createContextStoreImplementation, } from './factories/contextStore.js';
export { formatMessage };
const defaultFormatTime = (ms) => new Date(ms).toISOString();
const createDependencies = (state) => ({
    state,
    createDualStore: (name, textKey, timeStampKey) => DualStoreManager.create(name, textKey, timeStampKey),
});
const normaliseLegacyArgs = ([recentLimit, queryLimit, limit, formatAssistantMessages]) => ({
    recentLimit,
    queryLimit,
    limit,
    formatAssistantMessages,
});
const isCompileContextOptions = (value) => !Array.isArray(value);
const resolveCompileOptions = (value, legacyArgs) => {
    if (!isCompileContextOptions(value)) {
        return {
            ...normaliseLegacyArgs(legacyArgs),
            texts: value,
        };
    }
    return value ?? {};
};
const sanitizeOptions = (options) => {
    const definedEntries = Object.entries(options).filter(([, optionValue]) => optionValue !== undefined);
    return Object.fromEntries(definedEntries);
};
export const createContextStore = (formatTime = defaultFormatTime, assistantName = 'Duck') => ({
    collections: new Map(),
    formatTime,
    assistantName,
});
export const createCollection = async (state, name, textKey, timeStampKey) => {
    const inputs = { name, textKey, timeStampKey };
    const result = await createCollectionAction(inputs, createDependencies(state));
    return [result.state, result.value];
};
export const getOrCreateCollection = async (state, name) => {
    const inputs = { name };
    const result = await getOrCreateCollectionAction(inputs, createDependencies(state));
    return [result.state, result.value];
};
export const getCollection = (state, name) => getCollectionAction({ name }, createDependencies(state));
export const collectionCount = (state) => collectionCountAction(createDependencies(state));
export const listCollectionNames = (state) => listCollectionNamesAction(createDependencies(state));
export const getAllRelatedDocuments = (state, queries, limit = 100, where) => {
    const inputs = { queries, limit, where };
    return getAllRelatedDocumentsAction(inputs, createDependencies(state));
};
export const getLatestDocuments = (state, limit = 100) => getLatestDocumentsAction({ limit }, createDependencies(state));
export const compileContext = async (state, textsOrOptions = [], ...legacyArgs) => {
    const options = resolveCompileOptions(textsOrOptions, legacyArgs);
    const definedOptions = sanitizeOptions(options);
    return compileContextAction(definedOptions, createDependencies(state));
};
const warnDeprecationOnce = (() => {
    let warned = false;
    return () => {
        if (!warned) {
            warned = true;
            const message = 'ContextStore is deprecated. Use the functional actions + factory pattern from src/actions/context-store instead.';
            if (typeof process !== 'undefined' && typeof process.emitWarning === 'function') {
                process.emitWarning(message, { code: 'ContextStoreDeprecation', type: 'DeprecationWarning' });
            }
            else {
                console.warn(message);
            }
        }
    };
})();
export class ContextStore {
    collections;
    formatTime;
    assistantName;
    implementation;
    constructor(formatTime = defaultFormatTime, assistantName = 'Duck') {
        warnDeprecationOnce();
        this.implementation = createContextStoreImplementation({ formatTime, assistantName });
        const { collections, formatTime: fmt, assistantName: assistant } = this.implementation.state;
        this.collections = collections;
        this.formatTime = fmt;
        this.assistantName = assistant;
    }
    syncState() {
        const { formatTime, assistantName } = this.implementation.state;
        this.formatTime = formatTime;
        this.assistantName = assistantName;
    }
    async createCollection(name, textKey, timeStampKey) {
        const manager = await this.implementation.createCollection({ name, textKey, timeStampKey });
        this.syncState();
        return manager;
    }
    async getOrCreateCollection(name) {
        const manager = await this.implementation.getOrCreateCollection({ name });
        this.syncState();
        return manager;
    }
    getCollection(name) {
        return this.implementation.getCollection(name);
    }
    collectionCount() {
        return this.implementation.collectionCount();
    }
    listCollectionNames() {
        return this.implementation.listCollectionNames();
    }
    async getAllRelatedDocuments(queries, limit = 100, where) {
        return this.implementation.getAllRelatedDocuments({ queries, limit, where });
    }
    async getLatestDocuments(limit = 100) {
        return this.implementation.getLatestDocuments({ limit });
    }
    async compileContext(textsOrOptions = [], ...legacyArgs) {
        const options = resolveCompileOptions(textsOrOptions, legacyArgs);
        const definedOptions = sanitizeOptions(options);
        return this.implementation.compileContext(definedOptions);
    }
}
export const createContextStoreFactory = (config = {}) => createContextStoreImplementation(config);
