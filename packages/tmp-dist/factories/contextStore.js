import { collectionCount, compileContext as compileContextAction, createCollection as createCollectionAction, getAllRelatedDocuments, getCollection as getCollectionAction, getLatestDocuments as getLatestDocumentsAction, getOrCreateCollection as getOrCreateCollectionAction, listCollectionNames, } from '../actions/context-store/index.js';
import { DualStoreManager } from '../dualStore.js';
const defaultFormatTime = (ms) => new Date(ms).toISOString();
const createInitialState = (config) => ({
    collections: new Map(),
    formatTime: config.formatTime ?? defaultFormatTime,
    assistantName: config.assistantName ?? 'Duck',
});
const buildDependencies = (state, config) => ({
    state,
    createDualStore: config.createDualStore ?? ((name, textKey, timeStampKey) => DualStoreManager.create(name, textKey, timeStampKey)),
});
export const createContextStoreImplementation = (config = {}) => {
    let currentState = createInitialState(config);
    const applyStateUpdate = (updater) => {
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
