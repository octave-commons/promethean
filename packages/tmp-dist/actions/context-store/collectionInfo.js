export const collectionCount = (dependencies) => dependencies.state.collections.size;
export const listCollectionNames = (dependencies) => Array.from(dependencies.state.collections.keys());
