import type { DualStoreEntry } from '../../types.js';
import type { DualStoreDependencies, GetMostRelevantInputs } from './types.js';
export declare const getMostRelevant: <TextKey extends string, TimeKey extends string>(inputs: GetMostRelevantInputs, dependencies: DualStoreDependencies<TextKey, TimeKey>) => Promise<DualStoreEntry<"text", "timestamp">[]>;
//# sourceMappingURL=getMostRelevant.d.ts.map