import type { DualStoreEntry } from '../../types.js';
import type { DualStoreDependencies, GetInputs } from './types.js';
export declare const get: <TextKey extends string, TimeKey extends string>(inputs: GetInputs, dependencies: DualStoreDependencies<TextKey, TimeKey>) => Promise<DualStoreEntry<"text", "timestamp"> | null>;
//# sourceMappingURL=get.d.ts.map