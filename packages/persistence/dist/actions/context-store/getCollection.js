export const getCollection = (inputs, dependencies) => {
    const collection = dependencies.state.collections.get(inputs.name);
    if (!collection) {
        throw new Error(`Collection ${inputs.name} does not exist`);
    }
    return collection;
};
//# sourceMappingURL=getCollection.js.map