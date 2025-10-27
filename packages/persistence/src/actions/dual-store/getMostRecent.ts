import type { DualStoreDependencies, GetMostRecentInputs } from './types.js';
import type { DualStoreEntry } from '../../types.js';

import { fromMongoDocument } from './utils.js';

export const getMostRecent = async <TextKey extends string, TimeKey extends string>(
    inputs: GetMostRecentInputs<TextKey, TimeKey>,
    dependencies: DualStoreDependencies<TextKey, TimeKey>,
): Promise<DualStoreEntry<'text', 'timestamp'>[]> => {
    const { limit = 10, mongoFilter, sorter } = inputs;
    const { state, mongo } = dependencies;

    const collection = await mongo.getCollection();

    const defaultFilter = {
        [state.textKey]: { $nin: [null, ''], $not: /^\s*$/ },
    } as Record<string, unknown>;

    const defaultSorter = {
        [state.timeStampKey]: -1 as const,
    };

    const documents = await collection
        .find(mongoFilter ?? defaultFilter)
        .sort(sorter ?? defaultSorter)
        .limit(limit)
        .toArray();

    return documents.map((doc) => fromMongoDocument(doc, state));
};
