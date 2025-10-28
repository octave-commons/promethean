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
    const deduped = [];
    const seen = new Set();
    for (const doc of documents) {
        const mapped = fromMongoDocument(doc, state);
        const key = mapped.id ?? `${mapped.timestamp}:${mapped.text}`;
        if (seen.has(key)) {
            continue;
        }
        seen.add(key);
        deduped.push(mapped);
        if (deduped.length >= limit) {
            break;
        }
    }
    return deduped;
};
//# sourceMappingURL=getMostRecent.js.map