import { normaliseTimestamp } from './utils.js';
export const getMostRelevant = async (inputs, dependencies) => {
    const { queryTexts, limit, where } = inputs;
    if (!Array.isArray(queryTexts) || queryTexts.length === 0) {
        return [];
    }
    const { chroma, state, time } = dependencies;
    const query = {
        queryTexts,
        nResults: limit,
    };
    if (where && Object.keys(where).length > 0) {
        query.where = where;
    }
    const queryResult = await chroma.collection.query(query);
    const ids = (queryResult.ids ?? []).flat(2);
    const docs = (queryResult.documents ?? []).flat(2);
    const metas = (queryResult.metadatas ?? []).flat(2);
    const seen = new Set();
    const entries = [];
    docs.forEach((text, index) => {
        if (!text) {
            return;
        }
        if (seen.has(text)) {
            return;
        }
        seen.add(text);
        const metadata = metas[index] ?? undefined;
        const timestampSource = metadata?.timeStamp ?? metadata?.[state.timeStampKey] ?? time();
        entries.push({
            id: ids[index],
            text,
            metadata: metadata,
            timestamp: normaliseTimestamp(timestampSource),
        });
    });
    return entries;
};
