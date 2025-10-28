import type { DualStoreDependencies, GetMostRecentInputs } from './types.js';
import type { DualStoreEntry } from '../../types.js';
export declare const getMostRecent: <TextKey extends string, TimeKey extends string>(inputs: GetMostRecentInputs<TextKey, TimeKey>, dependencies: DualStoreDependencies<TextKey, TimeKey>) => Promise<DualStoreEntry<"text", "timestamp">[]>;
//# sourceMappingURL=getMostRecent.d.ts.map