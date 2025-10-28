import type { ContextDependencies, GetCollectionInputs, DualStoreAdapter } from './types.js';

export const getCollection = (
    inputs: GetCollectionInputs,
    dependencies: ContextDependencies,
): DualStoreAdapter => {
    const collection = dependencies.state.collections.get(inputs.name);
    if (!collection) {
        throw new Error(`Collection ${inputs.name} does not exist`);
    }
    return collection;
};

