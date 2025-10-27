import { getMostRecent } from './getMostRecent.js';
export const getConsistencyReport = async (inputs, dependencies) => {
    const { limit = 100 } = inputs;
    const recentDocs = await getMostRecent({ limit }, dependencies);
    let consistentDocuments = 0;
    let inconsistentDocuments = 0;
    let missingVectors = 0;
    const vectorWriteFailures = [];
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
    return {
        totalDocuments: recentDocs.length,
        consistentDocuments,
        inconsistentDocuments,
        missingVectors,
        vectorWriteFailures,
    };
};
