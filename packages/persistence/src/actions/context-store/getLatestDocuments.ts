import type { DualStoreEntry } from '../../types.js';
import type { ContextDependencies, LatestDocumentsInputs } from './types.js';
import { getCollections } from './utils.js';

export const getLatestDocuments = async (
    inputs: LatestDocumentsInputs,
    dependencies: ContextDependencies,
): Promise<DualStoreEntry<'text', 'timestamp'>[]> => {
    const { limit = 100 } = inputs;
    const managers = getCollections(dependencies.state);
    const results = await Promise.all(managers.map((collection) => collection.getMostRecent(limit)));
    return results.flat();
};

