import type { WithId } from 'mongodb';
import type { DualStoreEntry } from '../../types.js';
import type { DualStoreState } from './types.js';
export declare const normaliseTimestamp: (value: unknown) => number;
export declare const normaliseMetadataValue: (value: unknown) => string | number | boolean | null;
export declare const buildChromaMetadata: <TextKey extends string, TimeKey extends string>(entry: DualStoreEntry<TextKey, TimeKey>, state: DualStoreState<TextKey, TimeKey>) => Record<string, string | number | boolean | null>;
export declare const fromMongoDocument: <TextKey extends string, TimeKey extends string>(document: WithId<DualStoreEntry<TextKey, TimeKey>>, state: DualStoreState<TextKey, TimeKey>) => DualStoreEntry<"text", "timestamp">;
//# sourceMappingURL=utils.d.ts.map