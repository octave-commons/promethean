import type { DualStoreDependencies, CheckConsistencyInputs } from './types.js';
export declare const checkConsistency: <TextKey extends string, TimeKey extends string>(inputs: CheckConsistencyInputs, dependencies: DualStoreDependencies<TextKey, TimeKey>) => Promise<{
    hasDocument: boolean;
    hasVector: boolean;
    vectorWriteSuccess?: boolean;
    vectorWriteError?: string;
}>;
//# sourceMappingURL=checkConsistency.d.ts.map