import type { ContextDependencies, CreateCollectionInputs, StateUpdate, DualStoreAdapter } from './types.js';

const duplicateCollectionError = (name: string): Error => new Error(`Collection ${name} already exists`);

export const createCollection = async (
    inputs: CreateCollectionInputs,
    dependencies: ContextDependencies,
): Promise<StateUpdate<DualStoreAdapter>> => {
    const { name, textKey, timeStampKey } = inputs;
    const { state, createDualStore } = dependencies;

    if (state.collections.has(name)) {
        throw duplicateCollectionError(name);
    }

    const collection = await createDualStore(name, textKey, timeStampKey);
    const collections = new Map(state.collections);
    collections.set(name, collection);

    return {
        state: {
            ...state,
            collections,
        },
        value: collection,
    };
};

