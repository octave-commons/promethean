import type { DualStoreDependencies, RetryVectorWriteInputs } from './types.js';
export declare const retryVectorWrite: <TextKey extends string, TimeKey extends string>(inputs: RetryVectorWriteInputs, dependencies: DualStoreDependencies<TextKey, TimeKey>) => Promise<boolean>;
//# sourceMappingURL=retryVectorWrite.d.ts.map