import type { DualStoreDependencies, GetConsistencyReportInputs } from './types.js';
export declare const getConsistencyReport: <TextKey extends string, TimeKey extends string>(inputs: GetConsistencyReportInputs, dependencies: DualStoreDependencies<TextKey, TimeKey>) => Promise<{
    totalDocuments: number;
    consistentDocuments: number;
    inconsistentDocuments: number;
    missingVectors: number;
    vectorWriteFailures: Array<{
        id: string;
        error?: string;
        timestamp?: number;
    }>;
}>;
//# sourceMappingURL=getConsistencyReport.d.ts.map