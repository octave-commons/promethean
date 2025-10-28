import type { DualStoreEntry } from '../../types.js';
import type { DualStoreDependencies, GetMostRelevantInputs } from './types.js';

import { normaliseTimestamp } from './utils.js';

export const getMostRelevant = async <TextKey extends string, TimeKey extends string>(
    inputs: GetMostRelevantInputs,
    dependencies: DualStoreDependencies<TextKey, TimeKey>,
): Promise<DualStoreEntry<'text', 'timestamp'>[]> => {
    const { queryTexts, limit, where } = inputs;

    if (!Array.isArray(queryTexts) || queryTexts.length === 0) {
        return [];
    }

    const { chroma, state, time } = dependencies;

    const query: Record<string, unknown> = {
        queryTexts,
        nResults: limit,
    };

    if (where && Object.keys(where).length > 0) {
        query.where = where;
    }

    const queryResult = await chroma.collection.query(query as any);

    const ids = (queryResult.ids ?? []).flat(2) as string[];
    const docs = (queryResult.documents ?? []).flat(2) as Array<string | null>;
    const metas = (queryResult.metadatas ?? []).flat(2) as Array<Record<string, unknown> | null>;

    const seen = new Set<string>();

    const entries: DualStoreEntry<'text', 'timestamp'>[] = [];

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
            metadata: metadata as DualStoreEntry<'text', 'timestamp'>['metadata'],
            timestamp: normaliseTimestamp(timestampSource),
        });
    });

    return entries;
};
