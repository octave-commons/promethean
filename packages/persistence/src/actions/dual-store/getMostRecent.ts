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

    const deduped: DualStoreEntry<'text', 'timestamp'>[] = [];
    const seen = new Set<string>();

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
