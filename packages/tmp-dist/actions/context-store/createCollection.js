const duplicateCollectionError = (name) => new Error(`Collection ${name} already exists`);
export const createCollection = async (inputs, dependencies) => {
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
