export const normaliseTimestamp = (value) => {
    if (value instanceof Date) {
        return value.getTime();
    }
    if (typeof value === 'string') {
        const parsed = new Date(value).getTime();
        return Number.isNaN(parsed) ? Date.now() : parsed;
    }
    if (typeof value === 'number') {
        return value;
    }
    return Date.now();
};
export const normaliseMetadataValue = (value) => {
    if (value === null || value === undefined) {
        return null;
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return value;
    }
    if (value instanceof Date) {
        return value.toISOString();
    }
    return JSON.stringify(value);
};
export const buildChromaMetadata = (entry, state) => {
    const metadata = {
        [state.timeStampKey]: entry[state.timeStampKey],
        ...(entry.metadata ?? {}),
    };
    const chromaMetadata = {};
    for (const [key, value] of Object.entries(metadata)) {
        if (key === state.timeStampKey) {
            chromaMetadata[key] = normaliseTimestamp(value);
        }
        else {
            chromaMetadata[key] = normaliseMetadataValue(value);
        }
    }
    return chromaMetadata;
};
export const fromMongoDocument = (document, state) => {
    const metadataCopy = {
        ...(document.metadata ?? {}),
    };
    if (!('vectorWriteSuccess' in metadataCopy)) {
        metadataCopy.vectorWriteSuccess = document.metadata?.vectorWriteSuccess ?? undefined;
    }
    if (!('vectorWriteError' in metadataCopy)) {
        metadataCopy.vectorWriteError = document.metadata?.vectorWriteError ?? undefined;
    }
    if (!('vectorWriteTimestamp' in metadataCopy)) {
        metadataCopy.vectorWriteTimestamp = document.metadata?.vectorWriteTimestamp ?? null;
    }
    return {
        id: document.id,
        text: document[state.textKey],
        timestamp: normaliseTimestamp(document[state.timeStampKey]),
        metadata: metadataCopy,
    };
};
//# sourceMappingURL=utils.js.map