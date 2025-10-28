import type { DualStoreEntry } from '../../types.js';
import type { ContextDependencies, RelatedDocumentsInputs } from './types.js';
import { getCollections } from './utils.js';

export const getAllRelatedDocuments = async (
    inputs: RelatedDocumentsInputs,
    dependencies: ContextDependencies,
): Promise<DualStoreEntry<'text', 'timestamp'>[]> => {
    const { queries, limit = 100, where } = inputs;

    if (!queries.length) {
        return [];
    }

    const managers = getCollections(dependencies.state);
    const results = await Promise.all(
        managers.map((collection) => collection.getMostRelevant([...queries], limit, where)),
    );

    return results.flat();
};

