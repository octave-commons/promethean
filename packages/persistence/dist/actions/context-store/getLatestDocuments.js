import { getCollections } from './utils.js';
export const getLatestDocuments = async (inputs, dependencies) => {
    const { limit = 100 } = inputs;
    const managers = getCollections(dependencies.state);
    const results = await Promise.all(managers.map((collection) => collection.getMostRecent(limit)));
    return results.flat();
};
//# sourceMappingURL=getLatestDocuments.js.map