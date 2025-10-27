import { createCollection } from './createCollection.js';
export const getOrCreateCollection = async (inputs, dependencies) => {
    const name = inputs.name;
    const existing = dependencies.state.collections.get(name);
    if (existing) {
        return {
            state: dependencies.state,
            value: existing,
        };
    }
    return createCollection({
        name,
        textKey: inputs.textKey ?? 'text',
        timeStampKey: inputs.timeStampKey ?? 'timestamp',
    }, dependencies);
};
