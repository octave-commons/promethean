import type { Filter, Sort } from 'mongodb';

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

    const defaultFilter: Filter<DualStoreEntry<TextKey, TimeKey>> = {
        [state.textKey]: { $nin: [null, ''], $not: /^\s*$/ },
    } as Filter<DualStoreEntry<TextKey, TimeKey>>;

    const defaultSorter: Sort = {
        [state.timeStampKey]: -1,
    };

    const documents = await collection
        .find(mongoFilter ?? defaultFilter)
        .sort(sorter ?? defaultSorter)
        .limit(limit)
        .toArray();

    const results = documents.map((doc) => fromMongoDocument(doc, state));
    console.log('[getMostRecent]', { limit, count: results.length, ids: results.map((d) => d.id) });
    return results;
};
