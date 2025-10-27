import { getCollections } from './utils.js';
export const getAllRelatedDocuments = async (inputs, dependencies) => {
    const { queries, limit = 100, where } = inputs;
    if (!queries.length) {
        return [];
    }
    const managers = getCollections(dependencies.state);
    const results = await Promise.all(managers.map((collection) => collection.getMostRelevant([...queries], limit, where)));
    return results.flat();
};
