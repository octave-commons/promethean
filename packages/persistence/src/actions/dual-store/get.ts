import type { Filter } from 'mongodb';

import type { DualStoreEntry } from '../../types.js';
import type { DualStoreDependencies, GetInputs } from './types.js';

import { fromMongoDocument } from './utils.js';

export const get = async <TextKey extends string, TimeKey extends string>(
    inputs: GetInputs,
    dependencies: DualStoreDependencies<TextKey, TimeKey>,
): Promise<DualStoreEntry<'text', 'timestamp'> | null> => {
    const { id } = inputs;
    const { mongo, state } = dependencies;

    const collection = await mongo.getCollection();
    const filter = { id } as Filter<DualStoreEntry<TextKey, TimeKey>>;
    const document = await collection.findOne(filter);

    if (!document) {
        return null;
    }

    return fromMongoDocument(document, state);
};
