import { fromMongoDocument } from './utils.js';
export const getMostRecent = async (inputs, dependencies) => {
    const { limit = 10, mongoFilter, sorter } = inputs;
    const { state, mongo } = dependencies;
    const collection = await mongo.getCollection();
    const defaultFilter = {
        [state.textKey]: { $nin: [null, ''], $not: /^\s*$/ },
    };
    const defaultSorter = {
        [state.timeStampKey]: -1,
    };
    const documents = await collection
        .find(mongoFilter ?? defaultFilter)
        .sort(sorter ?? defaultSorter)
        .limit(limit)
        .toArray();
    return documents.map((doc) => fromMongoDocument(doc, state));
};
