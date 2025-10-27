import { getMostRecent } from './getMostRecent.js';
import type { DualStoreDependencies, GetConsistencyReportInputs } from './types.js';

export const getConsistencyReport = async <TextKey extends string, TimeKey extends string>(
    inputs: GetConsistencyReportInputs,
    dependencies: DualStoreDependencies<TextKey, TimeKey>,
): Promise<{
    totalDocuments: number;
    consistentDocuments: number;
    inconsistentDocuments: number;
    missingVectors: number;
    vectorWriteFailures: Array<{ id: string; error?: string; timestamp?: number }>;
}> => {
    const { limit = 100 } = inputs;

    const recentDocs = await getMostRecent<TextKey, TimeKey>({ limit }, dependencies);

    let consistentDocuments = 0;
    let inconsistentDocuments = 0;
    let missingVectors = 0;
    const vectorWriteFailures: Array<{ id: string; error?: string; timestamp?: number }> = [];

    recentDocs.forEach((doc) => {
        const vectorWriteSuccess = doc.metadata?.vectorWriteSuccess;
        const vectorWriteError = doc.metadata?.vectorWriteError;

        if (vectorWriteSuccess === true) {
            consistentDocuments++;
            return;
        }

        if (vectorWriteSuccess === false) {
            inconsistentDocuments++;
            if (vectorWriteError) {
                vectorWriteFailures.push({
                    id: doc.id ?? 'unknown',
                    error: vectorWriteError,
                    timestamp: doc.metadata?.vectorWriteTimestamp ?? undefined,
                });
            }
            return;
        }

        missingVectors++;
    });

    const report = {
        totalDocuments: recentDocs.length,
        consistentDocuments,
        inconsistentDocuments,
        missingVectors,
        vectorWriteFailures,
    };

    console.log('[getConsistencyReport]', report);
    return report;
};
